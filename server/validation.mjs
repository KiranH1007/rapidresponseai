/**
 * Request Validation Schemas (FR-601)
 * 
 * Validates incoming API payloads against defined schemas.
 * Rejects malformed requests with 400 status and descriptive errors.
 */

import { z } from 'zod';

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const locationSchema = z.object({
    latitude: z.number()
        .min(-90, 'Latitude must be between -90 and 90')
        .max(90, 'Latitude must be between -90 and 90'),
    longitude: z.number()
        .min(-180, 'Longitude must be between -180 and 180')
        .max(180, 'Longitude must be between -180 and 180'),
});

export const analyzeRequestSchema = z.object({
    description: z.string()
        .min(10, 'Description must be at least 10 characters')
        .max(5000, 'Description must be at most 5,000 characters'),
    location: locationSchema,
    image: z.object({
        inlineData: z.object({
            data: z.string(),
            mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp'], {
                errorMap: () => ({ message: 'Image must be JPEG, PNG, or WebP' })
            }),
        })
    }).nullable().optional(),
});

export const chatRequestSchema = z.object({
    message: z.string()
        .min(1, 'Message cannot be empty')
        .max(5000, 'Message must be at most 5,000 characters'),
    aiHistory: z.array(z.object({
        role: z.enum(['user', 'model']),
        parts: z.array(z.object({
            text: z.string(),
        })),
    })),
    location: locationSchema,
});

// ─── Validation Middleware Factory ────────────────────────────────────────────

/**
 * Creates Express middleware that validates req.body against a Zod schema.
 * Returns 400 with descriptive errors on validation failure.
 */
export function validateRequest(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const errors = result.error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message,
            }));
            return res.status(400).json({
                error: 'Validation failed',
                details: errors,
            });
        }
        // Replace body with parsed/cleaned data
        req.body = result.data;
        next();
    };
}
