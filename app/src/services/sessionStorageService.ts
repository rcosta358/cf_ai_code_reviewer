import { API_SESSIONS_ENDPOINT, SESSION_STORAGE_KEY } from '../constants'
import type { JsonValue } from '../types/json'
import type { ReviewSession } from '../types/review'
import { apiErrorSchema, persistedReviewStateSchema } from '../validation/reviewSchemas'

export type PersistedReviewState = {
  activeSessionId: string
  sessions: ReviewSession[]
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
    const body = await readJsonResponse(response)

    if (!response.ok) {
        throw new Error(readApiError(body))
    }

    const persistedState = persistedReviewStateSchema.safeParse(body)

    if (!persistedState.success) {
        throw new Error('Saved review response was invalid.')
    }

    return persistedState.data
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
    const body = await readJsonResponse(response)

    if (!response.ok) {
        throw new Error(readApiError(body))
    }
}

export async function clearPersistedReviewState(userSessionId: string, signal?: AbortSignal) {
    const response = await fetch(getSessionEndpoint(userSessionId), {
        method: 'DELETE',
        signal,
    })
    const body = await readJsonResponse(response)

    if (!response.ok) {
        throw new Error(readApiError(body))
    }
}

function getSessionEndpoint(userSessionId: string) {
    return `${API_SESSIONS_ENDPOINT}/${encodeURIComponent(userSessionId)}`
}

async function readJsonResponse(response: Response): Promise<JsonValue | null> {
    try {
        const body: JsonValue = await response.json()
        return body
    } catch {
        return null
    }
}

function readApiError(body: JsonValue | null) {
    const result = apiErrorSchema.safeParse(body)

    return result.success ? result.data.error : 'Session storage request failed.'
}
