import { API_SESSIONS_ENDPOINT, SESSION_STORAGE_KEY } from '../constants'
import type { ReviewSession } from '../types/review'

export type PersistedReviewState = {
  activeSessionId: string
  sessions: ReviewSession[]
}

const readApiError = (body: unknown) => {
    if (typeof body === 'object' && body && 'error' in body && typeof body.error === 'string') {
        return body.error
    }

    return 'Session storage request failed.'
}

export function getOrCreateUserSessionId() {
    try {
        const storedSessionId = window.localStorage.getItem(SESSION_STORAGE_KEY)

        if (storedSessionId) {
            return storedSessionId
        }

        const sessionId = crypto.randomUUID()
        window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId)

        return sessionId
    } catch {
        return crypto.randomUUID()
    }
}

export async function loadPersistedReviewState(userSessionId: string, signal?: AbortSignal) {
    const response = await fetch(getSessionEndpoint(userSessionId), { signal })
    const body = await response.json().catch(() => null)

    if (!response.ok) {
        throw new Error(readApiError(body))
    }

    return body as PersistedReviewState
}

export async function savePersistedReviewState(
    userSessionId: string,
    state: PersistedReviewState,
    signal?: AbortSignal,
) {
    const response = await fetch(getSessionEndpoint(userSessionId), {
        body: JSON.stringify(state),
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'PUT',
        signal,
    })
    const body = await response.json().catch(() => null)

    if (!response.ok) {
        throw new Error(readApiError(body))
    }
}

export async function clearPersistedReviewState(userSessionId: string, signal?: AbortSignal) {
    const response = await fetch(getSessionEndpoint(userSessionId), {
        method: 'DELETE',
        signal,
    })
    const body = await response.json().catch(() => null)

    if (!response.ok) {
        throw new Error(readApiError(body))
    }
}

function getSessionEndpoint(userSessionId: string) {
    return `${API_SESSIONS_ENDPOINT}/${encodeURIComponent(userSessionId)}`
}
