import type { ReviewResult } from '../types/review'

const readApiError = (body: unknown) => {
    if (typeof body === 'object' && body && 'error' in body && typeof body.error === 'string') {
        return body.error
    }

    return 'Review generation failed.'
}

export async function generateReview(code: string, signal?: AbortSignal): Promise<ReviewResult> {
    const response = await fetch('/api/review', {
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
