import type { ReviewResult } from '../types/review'
import { API_REVIEW_ENDPOINT, MOCK_REVIEW_DELAY_MS, USE_MOCK_REVIEW } from '../constants'
import { mockReview } from './mockReview'

const readApiError = (body: unknown) => {
    if (typeof body === 'object' && body && 'error' in body && typeof body.error === 'string') {
        return body.error
    }
    return 'Review generation failed.'
}

export async function generateReview(code: string, signal?: AbortSignal): Promise<ReviewResult> {
    if (USE_MOCK_REVIEW) {
        await waitForMockReview(signal)

        return {
            ...mockReview,
            createdAt: new Date().toISOString(),
            id: `review-mock-${crypto.randomUUID()}`,
            issues: mockReview.issues.map((issue) => ({
                ...issue,
                id: `${issue.id}-${crypto.randomUUID()}`,
            })),
        }
    }

    const response = await fetch(API_REVIEW_ENDPOINT, {
        body: JSON.stringify({ code }),
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
        signal,
    })

    const body = await response.json().catch(() => null)

    if (!response.ok) {
        throw new Error(readApiError(body))
    }

    return body as ReviewResult
}

function waitForMockReview(signal?: AbortSignal) {
    return new Promise<void>((resolve, reject) => {
        if (signal?.aborted) {
            reject(new DOMException('Review generation was aborted.', 'AbortError'))
            return
        }

        const timeoutId = window.setTimeout(() => {
            signal?.removeEventListener('abort', handleAbort)
            resolve()
        }, MOCK_REVIEW_DELAY_MS)

        const handleAbort = () => {
            window.clearTimeout(timeoutId)
            reject(new DOMException('Review generation was aborted.', 'AbortError'))
        }

        signal?.addEventListener('abort', handleAbort, { once: true })
    })
}
