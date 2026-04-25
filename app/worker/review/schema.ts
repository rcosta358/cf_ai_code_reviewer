import type { ReviewCategory, ReviewSeverity } from '../../src/types/review'

export const REVIEW_CATEGORIES = [
    'correctness',
    'security',
    'performance',
    'maintability',
    'style',
    'documentation',
    'other',
] as const satisfies ReviewCategory[]

export const REVIEW_SEVERITIES = ['low', 'medium', 'high'] as const satisfies ReviewSeverity[]

export const reviewResponseSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['score', 'summary', 'issues'],
    properties: {
        score: {
            type: 'number',
            minimum: 0,
            maximum: 10,
            description: 'Overall code quality score from 0 to 10.',
        },
        summary: {
            type: 'string',
            description: 'Concise overall assessment of the submitted code.',
        },
        issues: {
            type: 'array',
            maxItems: 12,
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['category', 'confidence', 'title', 'description', 'severity', 'suggestion', 'line'],
                properties: {
                    category: {
                        type: 'string',
                        enum: REVIEW_CATEGORIES,
                    },
                    confidence: {
                        type: 'number',
                        minimum: 0,
                        maximum: 1,
                    },
                    title: {
                        type: 'string',
                    },
                    description: {
                        type: 'string',
                    },
                    severity: {
                        type: 'string',
                        enum: REVIEW_SEVERITIES,
                    },
                    suggestion: {
                        type: 'string',
                    },
                    line: {
                        type: 'integer',
                        minimum: 1,
                    },
                },
            },
        },
    },
} as const
