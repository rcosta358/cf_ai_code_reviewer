import { HTTPException } from 'hono/http-exception'
import type { JsonValue } from '../../src/types/json'
import type { ReviewSession } from '../../src/types/review'
import { persistedReviewStateSchema } from '../../src/validation/reviewSchemas'

export type PersistedReviewState = {
  activeSessionId: string
  sessions: ReviewSession[]
}

const MAX_SESSION_KEY_LENGTH = 128
const SESSION_KEY_PATTERN = /^[A-Za-z0-9_-]+$/

export async function loadReviewState(kv: KVNamespace, userSessionId: string): Promise<PersistedReviewState> {
    const storedState = await kv.get<JsonValue>(getReviewStateKey(userSessionId), 'json')
    const result = storedState ? persistedReviewStateSchema.safeParse(storedState) : null

    if (!result?.success) {
        return {
            activeSessionId: '',
            sessions: [],
        }
    }

    return result.data
}

export async function saveReviewState(kv: KVNamespace, userSessionId: string, payload: JsonValue) {
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

function parsePersistedReviewState(payload: JsonValue): PersistedReviewState {
    const result = persistedReviewStateSchema.safeParse(payload)

    if (!result.success) {
        throw new HTTPException(400, { message: 'Invalid review session payload.' })
    }

    return result.data
}
