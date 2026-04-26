import { HTTPException } from 'hono/http-exception'
import type { ReviewSession } from '../../src/types/review'

export type PersistedReviewState = {
  activeSessionId: string
  sessions: ReviewSession[]
}

const MAX_SESSION_COUNT = 100
const MAX_SESSION_KEY_LENGTH = 128
const SESSION_KEY_PATTERN = /^[A-Za-z0-9_-]+$/

export async function loadReviewState(kv: KVNamespace, userSessionId: string): Promise<PersistedReviewState> {
    const storedState = await kv.get<PersistedReviewState>(getReviewStateKey(userSessionId), 'json')

    if (!storedState || !isPersistedReviewState(storedState)) {
        return {
            activeSessionId: '',
            sessions: [],
        }
    }

    return storedState
}

export async function saveReviewState(kv: KVNamespace, userSessionId: string, payload: unknown) {
    const state = parsePersistedReviewState(payload)

    await kv.put(getReviewStateKey(userSessionId), JSON.stringify(state))
}

export async function clearReviewState(kv: KVNamespace, userSessionId: string) {
    await kv.delete(getReviewStateKey(userSessionId))
}

export function parseUserSessionId(value: string | undefined) {
    if (!value || value.length > MAX_SESSION_KEY_LENGTH || !SESSION_KEY_PATTERN.test(value)) {
        throw new HTTPException(400, { message: 'Invalid user session id.' })
    }

    return value
}

function getReviewStateKey(userSessionId: string) {
    return `review-session:${userSessionId}`
}

function parsePersistedReviewState(payload: unknown): PersistedReviewState {
    if (!isPersistedReviewState(payload)) {
        throw new HTTPException(400, { message: 'Invalid review session payload.' })
    }

    return payload
}

function isPersistedReviewState(value: unknown): value is PersistedReviewState {
    if (!isRecord(value) || typeof value.activeSessionId !== 'string' || !Array.isArray(value.sessions)) {
        return false
    }

    if (value.sessions.length > MAX_SESSION_COUNT) {
        return false
    }

    return value.sessions.every(isReviewSession)
}

function isReviewSession(value: unknown): value is ReviewSession {
    if (!isRecord(value)) {
        return false
    }

    return (
        typeof value.id === 'string' &&
        typeof value.title === 'string' &&
        typeof value.code === 'string' &&
        typeof value.createdAt === 'string' &&
        typeof value.updatedAt === 'string' &&
        (value.result === null || isRecord(value.result))
    )
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}
