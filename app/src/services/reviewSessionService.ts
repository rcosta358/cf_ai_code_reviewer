import { REVIEW_GENERATION_TIMEOUT_SECONDS } from '../constants'
import type { ReviewGenerationMessage, ReviewResult, ReviewSession } from '../types/review'

type AbortReason = 'cancel' | 'timeout' | null

export function createReviewSession(): ReviewSession {
    const now = new Date().toISOString()

    return {
        id: createId('session'),
        title: 'Untitled review',
        code: '',
        createdAt: now,
        updatedAt: now,
        result: null,
    }
}

export function updateSessionCode(
    sessions: ReviewSession[],
    activeSessionId: string,
    code: string,
) {
    return sessions.map((session, index) =>
        session.id === activeSessionId
            ? {
                ...session,
                code,
                title: session.result ? session.title : createSessionTitle(code, index + 1),
                updatedAt: new Date().toISOString(),
            }
            : session,
    )
}

export function applyReviewResult(
    sessions: ReviewSession[],
    sessionId: string,
    review: ReviewResult,
) {
    return sessions.map((session, index) =>
        session.id === sessionId
            ? {
                ...session,
                title: createSessionTitle(session.code, index + 1),
                updatedAt: new Date().toISOString(),
                result: review,
            }
            : session,
    )
}

export function dismissReviewIssue(
    sessions: ReviewSession[],
    activeSessionId: string,
    issueId: string,
) {
    return sessions.map((session) =>
        session.id === activeSessionId && session.result
            ? {
                ...session,
                result: {
                    ...session.result,
                    issues: session.result.issues.map((issue) =>
                        issue.id === issueId ? { ...issue, dismissed: true } : issue,
                    ),
                },
            }
            : session,
    )
}

export function createReviewGenerationMessage(
    error: unknown,
    wasAborted: boolean,
    abortReason: AbortReason,
): ReviewGenerationMessage {
    if (wasAborted && abortReason === 'timeout') {
        return {
            tone: 'warning',
            text: `Review timed out after ${REVIEW_GENERATION_TIMEOUT_SECONDS} seconds.`,
        }
    }

    if (wasAborted) {
        return {
            tone: 'info',
            text: 'Review was cancelled.',
        }
    }

    return {
        tone: 'warning',
        text: getErrorMessage(error),
    }
}

function createId(prefix: string) {
    return `${prefix}-${crypto.randomUUID()}`
}

function createSessionTitle(code: string, index: number) {
    const firstLine = code
        .split('\n')
        .map((line) => line.trim())
        .find(Boolean)

    return firstLine ? firstLine.slice(0, 42) : `Review ${index}`
}

function getErrorMessage(error: unknown) {
    if (error instanceof Error && error.message) {
        return error.message
    }

    return 'Review generation failed.'
}
