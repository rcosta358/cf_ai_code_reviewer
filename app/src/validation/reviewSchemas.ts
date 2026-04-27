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
    'maintainability',
    'style',
    'documentation',
    'other',
])

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
    chatMessage: z.string().trim().catch(''),
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
    chatMessage: z.string().catch(''),
    createdAt: z.string(),
    id: z.string(),
    issues: z.array(reviewIssueSchema),
    score: z.number().finite().min(0).max(10),
    summary: z.string(),
})

export const reviewChatMessageSchema = z.strictObject({
    createdAt: z.string(),
    id: z.string(),
    role: z.enum(['assistant', 'user']),
    text: z.string(),
})

export const reviewRequestSchema = z.strictObject({
    chatMessages: z.array(reviewChatMessageSchema).max(20).optional().catch([]),
    code: z
        .string({ error: 'code must be a string.' })
        .refine((value) => value.trim().length > 0, { message: 'Code cannot be empty.' })
        .refine((value) => value.length <= MAX_CODE_LENGTH, {
            message: `Code cannot exceed ${MAX_CODE_LENGTH} characters.`,
        }),
    followUpPrompt: z.string().trim().min(1).max(4000).optional(),
    previousReview: reviewResultSchema.optional(),
}).refine(
    (value) => !value.followUpPrompt || Boolean(value.previousReview),
    { message: 'A previous review is required for follow-up prompts.', path: ['previousReview'] },
)

export const reviewSessionSchema = z.strictObject({
    chatMessages: z.array(reviewChatMessageSchema).catch([]),
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
