/**
 * Rapid Response AI — Backend Server
 * 
 * Enterprise-grade Express server with:
 * - Model-agnostic AI service (FR-201)
 * - Request validation via Zod (FR-601)
 * - Structured JSON logging via Pino (FR-603)
 * - Correlation ID per request (FR-604)
 * - Rate limiting (FR-602)
 * - Global error handler (FR-605)
 * - Health check endpoint (FR-600)
 * - Helmet security headers (Section 15.2)
 * - Restricted CORS (Section 15.2)
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { createAIService } from './server/aiService.mjs';
import { analyzeRequestSchema, chatRequestSchema, validateRequest } from './server/validation.mjs';
import {
    logger,
    correlationId,
    requestLogger,
    apiRateLimiter,
    globalErrorHandler,
} from './server/middleware.mjs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ─── Security (Section 15.2) ────────────────────────────────────────────────

app.use(helmet());

// ─── Body Parser ────────────────────────────────────────────────────────────

app.use(express.json({ limit: '50mb' }));

// ─── CORS — restricted to known origins (Section 15.2) ──────────────────────

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3001').split(',');
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

// ─── Correlation ID + Request Logging (FR-603, FR-604) ──────────────────────

app.use(correlationId);
app.use(requestLogger);

// ─── Rate Limiting (FR-602) ─────────────────────────────────────────────────

app.use('/api/analyze', apiRateLimiter);
app.use('/api/chat', apiRateLimiter);

// ─── Initialize AI Service (FR-201: model-agnostic) ─────────────────────────

let aiService;
try {
    aiService = createAIService();
    logger.info({ provider: aiService.name }, 'AI service initialized');
} catch (err) {
    logger.fatal({ err: err.message }, 'Failed to initialize AI service');
    // Server can still start — health check will report the issue
}

// ─── Health Check (FR-600) ──────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
    res.json({
        status: aiService ? 'healthy' : 'degraded',
        version: '1.1.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        dependencies: {
            ai: {
                status: aiService ? 'connected' : 'error',
                provider: aiService?.name || 'not initialized',
            },
        },
    });
});

// ─── POST /api/analyze (FR-200–FR-206, FR-300–FR-303) ───────────────────────

app.post('/api/analyze', validateRequest(analyzeRequestSchema), async (req, res, next) => {
    const startTime = Date.now();

    try {
        if (!aiService) {
            return res.status(503).json({ error: 'AI service is not available. Please try again later.' });
        }

        const { description, location, image } = req.body;

        // FR-209: Log AI call metadata
        logger.info({
            correlationId: req.correlationId,
            action: 'analyze_start',
            hasImage: !!image,
            location: { lat: location.latitude, lng: location.longitude },
            descriptionLength: description.length,
        }, 'Starting emergency analysis');

        // 1. AI Analysis
        let analysisPart;
        try {
            analysisPart = await aiService.analyzeEmergency({
                description,
                location,
                imagePart: image,
            });
        } catch (aiError) {
            logger.error({
                correlationId: req.correlationId,
                err: aiError.message,
                action: 'analyze_ai_failed',
                latencyMs: Date.now() - startTime,
            }, 'AI analysis failed');
            return res.status(500).json({ error: 'AI analysis failed. Please try again.' });
        }

        // 2. Geospatial resource discovery (FR-300)
        let nearbyResources = [];
        try {
            nearbyResources = await aiService.discoverNearbyResources({
                resourceType: analysisPart.resourceType,
                location,
            });
        } catch (groundingError) {
            // FR-303: Analysis still succeeds even if resource discovery fails
            logger.warn({
                correlationId: req.correlationId,
                err: groundingError.message,
                action: 'grounding_failed',
            }, 'Resource discovery failed — returning empty resources');
        }

        // 3. Build response
        const finalResult = {
            severity: analysisPart.severity,
            summary: analysisPart.summary,
            actionList: analysisPart.actionList,
            resourceType: analysisPart.resourceType,
            nearbyResources,
        };

        const initialHistory = [
            { role: 'user', text: 'Submitted an emergency report.' },
            { role: 'model', text: 'Analysis complete. You can now ask follow-up questions.' }
        ];

        const aiHistory = [
            { role: 'user', parts: [{ text: `Analyzed accident scene. Description: ${description}` }] },
            { role: 'model', parts: [{ text: `Initial analysis complete. Severity: ${analysisPart.severity}. The incident location is at Latitude ${location.latitude}, Longitude ${location.longitude}.` }] }
        ];

        // FR-209: Log successful analysis with metadata
        const latencyMs = Date.now() - startTime;
        logger.info({
            correlationId: req.correlationId,
            action: 'analyze_complete',
            severity: analysisPart.severity,
            resourceType: analysisPart.resourceType,
            nearbyResourceCount: nearbyResources.length,
            latencyMs,
        }, `Analysis complete in ${latencyMs}ms — Severity: ${analysisPart.severity}`);

        res.json({ analysis: finalResult, initialHistory, aiHistory });

    } catch (error) {
        next(error);  // Delegate to global error handler
    }
});

// ─── POST /api/chat (FR-400–FR-405) ─────────────────────────────────────────

app.post('/api/chat', validateRequest(chatRequestSchema), async (req, res, next) => {
    const startTime = Date.now();

    try {
        if (!aiService) {
            return res.status(503).json({ error: 'AI service is not available. Please try again later.' });
        }

        const { message, aiHistory, location } = req.body;

        logger.info({
            correlationId: req.correlationId,
            action: 'chat_start',
            messageLength: message.length,
            historyLength: aiHistory.length,
        }, 'Processing chat message');

        const chat = aiService.createChatSession({
            history: aiHistory,
            location,
        });

        const chatResponse = await chat.sendMessage({ message });
        const updatedHistory = await chat.getHistory();

        const latencyMs = Date.now() - startTime;
        logger.info({
            correlationId: req.correlationId,
            action: 'chat_complete',
            responseLength: chatResponse.text?.length || 0,
            latencyMs,
        }, `Chat response in ${latencyMs}ms`);

        res.json({ text: chatResponse.text, aiHistory: updatedHistory });

    } catch (error) {
        next(error);  // Delegate to global error handler
    }
});

// ─── Global Error Handler (FR-605) — must be LAST middleware ────────────────

app.use(globalErrorHandler);

// ─── Start Server ───────────────────────────────────────────────────────────

app.listen(port, () => {
    logger.info({
        port,
        nodeEnv: process.env.NODE_ENV || 'development',
        aiProvider: aiService?.name || 'not initialized',
    }, `🚀 Rapid Response AI server running on http://localhost:${port}`);
});
