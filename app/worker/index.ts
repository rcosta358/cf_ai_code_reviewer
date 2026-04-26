import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { reviewCode } from './review/service'
import { parseReviewRequest } from './review/validation'
import { clearReviewState, loadReviewState, parseUserSessionId, saveReviewState } from './session/storage'
import type { JsonValue } from '../src/types/json'

type Bindings = {
  AI: Ai
  ALLOWED_ORIGINS?: string
  SESSIONS_KV: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

const DEFAULT_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://ai-code-reviewer.rcosta-ms358.workers.dev',
]

app.use(
    '/api/*',
    cors({
        allowHeaders: ['Content-Type'],
        allowMethods: ['DELETE', 'GET', 'POST', 'PUT', 'OPTIONS'],
        origin: (origin, context) => (getAllowedOrigins(context.env.ALLOWED_ORIGINS).has(origin) ? origin : null),
    }),
)

app.get('/api/health', (context) =>
    context.json({
        ok: true,
    }),
)

app.post('/api/review', async (context) => {
    const payload = await readJson(context.req.raw)
    const request = parseReviewRequest(payload)
    const result = await reviewCode(context.env.AI, request)

    return context.json(result)
})

app.get('/api/sessions/:userSessionId', async (context) => {
    const userSessionId = parseUserSessionId(context.req.param('userSessionId'))
    const state = await loadReviewState(context.env.SESSIONS_KV, userSessionId)

    return context.json(state)
})

app.put('/api/sessions/:userSessionId', async (context) => {
    const userSessionId = parseUserSessionId(context.req.param('userSessionId'))
    const payload = await readJson(context.req.raw)

    await saveReviewState(context.env.SESSIONS_KV, userSessionId, payload)

    return context.json({ ok: true })
})

app.delete('/api/sessions/:userSessionId', async (context) => {
    const userSessionId = parseUserSessionId(context.req.param('userSessionId'))

    await clearReviewState(context.env.SESSIONS_KV, userSessionId)

    return context.json({ ok: true })
})

app.onError((error, context) => {
    if (error instanceof HTTPException) {
        return context.json({ error: error.message }, error.status)
    }

    console.error(error)

    return context.json({ error: getApiErrorMessage(context.req.path, error) }, 500)
})

function getApiErrorMessage(path: string, error: Error): string {
    const reason = getSafeErrorReason(error)
    const action = path.startsWith('/api/review') ? 'generate review' : 'sync saved reviews'

    return `Could not ${action}. ${reason || 'Please try again in a moment.'}`
}

function getSafeErrorReason(error: Error): string | null {
    if (!error.message.trim()) {
        return null
    }

    return error.message.trim()
}

async function readJson(request: Request): Promise<JsonValue> {
    const contentType = request.headers.get('content-type') ?? ''

    if (!contentType.includes('application/json')) {
        throw new HTTPException(415, { message: 'Expected application/json request body.' })
    }

    try {
        const payload: JsonValue = await request.json()
        return payload
    } catch {
        throw new HTTPException(400, { message: 'Request body must be valid JSON.' })
    }
}

function getAllowedOrigins(value?: string): Set<string> {
    const configuredOrigins = value
        ?.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)

    return new Set(configuredOrigins?.length ? configuredOrigins : DEFAULT_ALLOWED_ORIGINS)
}

export default app
