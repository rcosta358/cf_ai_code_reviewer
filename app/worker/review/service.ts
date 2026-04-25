import type { ReviewCategory, ReviewResult, ReviewSeverity } from '../../src/types/review'
import { buildReviewPrompt } from './prompt'
import { REVIEW_CATEGORIES, REVIEW_SEVERITIES } from './schema'
import type { ModelReviewIssue, ModelReviewResult, ParsedReviewRequest } from '../../src/types/worker'

const REVIEW_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast'
const MAX_MODEL_TOKENS = 2048

export async function reviewCode(ai: Ai, request: ParsedReviewRequest): Promise<ReviewResult> {
    const modelOutput = await ai.run(REVIEW_MODEL, {
        ...buildReviewPrompt(request),
        max_tokens: MAX_MODEL_TOKENS,
        temperature: 0.1,
    })

    const parsed = parseModelOutput(modelOutput)

    return normalizeReviewResult(parsed)
}

function parseModelOutput(output: AiTextGenerationOutput): ModelReviewResult {
    const response = output.response as unknown

    if (!response) {
        throw new Error('AI response did not include review content.')
    }

    if (typeof response === 'object') {
        return response as ModelReviewResult
    }

    if (typeof response !== 'string') {
        throw new Error('AI response did not include valid review content.')
    }

    try {
        return JSON.parse(stripMarkdownFence(response)) as ModelReviewResult
    } catch {
        throw new Error('AI response was not valid JSON.')
    }
}

function normalizeReviewResult(result: ModelReviewResult): ReviewResult {
    const issues = Array.isArray(result.issues) ? result.issues : []

    return {
        id: createId('review'),
        createdAt: new Date().toISOString(),
        score: clampNumber(result.score, 0, 10, 0),
        summary: normalizeString(result.summary, 'Review completed.'),
        issues: issues.map(normalizeIssue),
    }
}

function normalizeIssue(issue: ModelReviewIssue, index: number) {
    const line = typeof issue.line === 'number' && Number.isInteger(issue.line) && issue.line > 0 ? issue.line : undefined

    return {
        category: normalizeCategory(issue.category),
        confidence: clampNumber(issue.confidence, 0, 1, 0.5),
        description: normalizeString(issue.description, 'No description provided.'),
        id: createId(`issue-${index + 1}`),
        line,
        severity: normalizeSeverity(issue.severity),
        suggestion: normalizeString(issue.suggestion, 'Review the surrounding implementation and add a targeted fix.'),
        title: normalizeString(issue.title, 'Code review issue'),
    }
}

function normalizeCategory(category: unknown): ReviewCategory {
    return REVIEW_CATEGORIES.includes(category as ReviewCategory) ? (category as ReviewCategory) : 'other'
}

function normalizeSeverity(severity: unknown): ReviewSeverity {
    return REVIEW_SEVERITIES.includes(severity as ReviewSeverity) ? (severity as ReviewSeverity) : 'medium'
}

function normalizeString(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return fallback
    }

    return Math.min(Math.max(value, min), max)
}

function stripMarkdownFence(value: string): string {
    const trimmed = value.trim()

    if (!trimmed.startsWith('```')) {
        return trimmed
    }

    return trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
}

function createId(prefix: string): string {
    return `${prefix}-${crypto.randomUUID()}`
}
