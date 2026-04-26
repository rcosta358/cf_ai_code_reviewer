import { z } from 'zod'
import { MAX_CODE_LENGTH, MAX_SESSION_COUNT } from '../constants'

const nonEmptyTextSchema = (fallback: string) => z.string().trim().min(1).catch(fallback)

const clampedNumberSchema = (minimum: number, maximum: number, fallback: number) =>
    z.number().finite().catch(fallback).transform((value) => Math.min(Math.max(value, minimum), maximum))

const positiveIntegerSchema = z.preprocess(
    (value) => (typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : undefined),
    z.number().int().positive().optional(),
)

export const themeSchema = z.enum(['light', 'dark'])

export const reviewSeveritySchema = z.enum(['low', 'medium', 'high'])

export const reviewCategorySchema = z.enum([
    'correctness',
    'security',
    'performance',
    'maintability',
    'style',
    'documentation',
    'other',
])

export const reviewRequestSchema = z.strictObject({
    code: z
        .string({ error: 'code must be a string.' })
        .refine((value) => value.trim().length > 0, { message: 'Code cannot be empty.' })
        .refine((value) => value.length <= MAX_CODE_LENGTH, {
            message: `Code cannot exceed ${MAX_CODE_LENGTH} characters.`,
        }),
})

const modelReviewIssueSchema = z.object({
    category: reviewCategorySchema.catch('other'),
    confidence: clampedNumberSchema(0, 1, 0.5),
    description: nonEmptyTextSchema('No description provided.'),
    line: positiveIntegerSchema,
    severity: reviewSeveritySchema.catch('medium'),
    suggestion: nonEmptyTextSchema('Review the surrounding implementation and add a targeted fix.'),
    title: nonEmptyTextSchema('Code review issue'),
}).strip()

export const modelReviewResultSchema = z.object({
    issues: z.array(modelReviewIssueSchema).catch([]),
    score: clampedNumberSchema(0, 10, 0),
    summary: nonEmptyTextSchema('Review completed.'),
}).strip()

export const reviewIssueSchema = z.strictObject({
    category: reviewCategorySchema,
    confidence: z.number().finite().min(0).max(1),
    description: z.string(),
    dismissed: z.boolean().optional(),
    id: z.string(),
    line: z.number().int().positive().optional(),
    severity: reviewSeveritySchema,
    suggestion: z.string(),
    title: z.string(),
})

export const reviewResultSchema = z.strictObject({
    createdAt: z.string(),
    id: z.string(),
    issues: z.array(reviewIssueSchema),
    score: z.number().finite().min(0).max(10),
    summary: z.string(),
})

export const reviewSessionSchema = z.strictObject({
    code: z.string(),
    createdAt: z.string(),
    id: z.string(),
    result: reviewResultSchema.nullable(),
    title: z.string(),
    updatedAt: z.string(),
})

export const persistedReviewStateSchema = z.strictObject({
    activeSessionId: z.string(),
    sessions: z.array(reviewSessionSchema).max(MAX_SESSION_COUNT),
})

export const apiErrorSchema = z.object({
    error: z.string(),
}).strip()
