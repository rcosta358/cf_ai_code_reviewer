import type { ReviewResult } from '../../src/types/review'
import { buildReviewPrompt } from './prompt'
import type { ModelReviewIssue, ModelReviewResult, ParsedReviewRequest } from '../../src/types/worker'
import { MAX_MODEL_TOKENS, REVIEW_MODEL, REVIEW_MODEL_TEMPERATURE } from '../../src/constants'
import type { JsonValue } from '../../src/types/json'
import { modelReviewResultSchema } from '../../src/validation/reviewSchemas'

export async function reviewCode(ai: Ai, request: ParsedReviewRequest): Promise<ReviewResult> {
    const modelOutput = await ai.run(REVIEW_MODEL, {
        ...buildReviewPrompt(request),
        max_tokens: MAX_MODEL_TOKENS,
        temperature: REVIEW_MODEL_TEMPERATURE,
    })

    const parsed = parseModelOutput(modelOutput)

    return normalizeReviewResult(parsed)
}

function parseModelOutput(output: AiTextGenerationOutput): ModelReviewResult {
    const { response } = output

    if (!response) {
        throw new Error('AI response did not include review content.')
    }

    const json = parseJsonString(stripMarkdownFence(response))
    const result = modelReviewResultSchema.safeParse(json)

    if (!result.success) {
        throw new Error('AI response did not match the expected review format.')
    }

    return result.data
}

function parseJsonString(value: string): JsonValue {
    try {
        const parsed: JsonValue = JSON.parse(value)
        return parsed
    } catch {
        throw new Error('AI response was not valid JSON.')
    }
}

function normalizeReviewResult(result: ModelReviewResult): ReviewResult {
    return {
        id: createId('review'),
        createdAt: new Date().toISOString(),
        chatMessage: result.chatMessage,
        score: result.score,
        summary: result.summary,
        issues: result.issues.map(normalizeIssue).sort(compareIssuesByLine),
    }
}

function compareIssuesByLine(first: ReturnType<typeof normalizeIssue>, second: ReturnType<typeof normalizeIssue>) {
    return (first.line ?? Number.POSITIVE_INFINITY) - (second.line ?? Number.POSITIVE_INFINITY)
}

function normalizeIssue(issue: ModelReviewIssue, index: number) {
    const line = typeof issue.line === 'number' && Number.isInteger(issue.line) && issue.line > 0 ? issue.line : undefined

    return {
        category: issue.category,
        confidence: issue.confidence,
        description: issue.description,
        id: createId(`issue-${index + 1}`),
        line,
        severity: issue.severity,
        suggestion: issue.suggestion,
        title: issue.title,
    }
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
