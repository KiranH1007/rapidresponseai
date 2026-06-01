/**
 * Express Middleware Stack
 * 
 * FR-603: Structured JSON logging (Pino)
 * FR-604: Correlation ID per request
 * FR-602: Rate limiting
 * FR-605: Global error handler
 */

import { randomUUID } from 'crypto';
import pino from 'pino';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';

// ─── Logger (FR-603) ─────────────────────────────────────────────────────────

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    ...(process.env.NODE_ENV !== 'production' && {
        transport: {
            target: 'pino/file',
            options: { destination: 1 }  // stdout
        },
    }),
});

// ─── Correlation ID Middleware (FR-604) ──────────────────────────────────────

export function correlationId(req, res, next) {
    const id = req.headers['x-request-id'] || randomUUID();
    req.correlationId = id;
    res.setHeader('x-request-id', id);
    next();
}

// ─── Request Logger Middleware (FR-603) ──────────────────────────────────────

export const requestLogger = pinoHttp({
    logger,
    genReqId: (req) => req.correlationId || randomUUID(),
    customLogLevel: (req, res, err) => {
        if (res.statusCode >= 500 || err) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
    },
    serializers: {
        req: (req) => ({
            method: req.method,
            url: req.url,
            correlationId: req.raw?.correlationId,
        }),
        res: (res) => ({
            statusCode: res.statusCode,
        }),
    },
    // Don't log health check requests to reduce noise
    autoLogging: {
        ignore: (req) => req.url === '/api/health',
    },
});

// ─── Rate Limiter (FR-602) ──────────────────────────────────────────────────

export const apiRateLimiter = rateLimit({
    windowMs: 60 * 1000,  // 1 minute window
    max: parseInt(process.env.RATE_LIMIT_MAX || '30', 10),  // 30 requests/minute/IP (PRD default)
    standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,
    message: {
        error: 'Too many requests. Please wait a moment and try again.',
    },
    // Return Retry-After header (PRD edge case requirement)
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many requests. Please wait a moment and try again.',
        });
    },
});

// ─── Global Error Handler (FR-605) ──────────────────────────────────────────

/**
 * Catches unhandled exceptions and returns sanitized error responses.
 * No stack traces, no internal details, no file paths.
 */
export function globalErrorHandler(err, req, res, _next) {
    const correlationId = req.correlationId || 'unknown';

    // Log the full error internally (for debugging)
    logger.error({
        err: {
            message: err.message,
            stack: err.stack,
            name: err.name,
        },
        correlationId,
        method: req.method,
        url: req.url,
    }, 'Unhandled error');

    // CORS error
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ error: 'Origin not allowed' });
    }

    // Payload too large (FR edge case: >50MB image)
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            error: 'Payload too large. Image must be under 50 MB.',
        });
    }

    // JSON parse error in request body
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            error: 'Invalid JSON in request body.',
        });
    }

    // Default: sanitized 500 response
    res.status(500).json({
        error: 'An internal error occurred. Please try again.',
        correlationId,
    });
}
