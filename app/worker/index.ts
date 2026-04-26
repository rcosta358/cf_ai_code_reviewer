import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { reviewCode } from './review/service'
import { parseReviewRequest } from './review/validation'

type Bindings = {
  AI: Ai
  ALLOWED_ORIGINS?: string
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
        allowMethods: ['GET', 'POST', 'OPTIONS'],
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

app.onError((error, context) => {
    if (error instanceof HTTPException) {
        return context.json({ error: error.message }, error.status)
    }

    console.error(error)

    return context.json({ error: getReviewGenerationErrorMessage(error) }, 500)
})

function getReviewGenerationErrorMessage(error: unknown): string {
    const reason = getSafeErrorReason(error)
    return `Could not generate review. ${reason || 'Please try again in a moment.'}`
}

function getSafeErrorReason(error: unknown): string | null {
    if (!(error instanceof Error) || !error.message.trim()) {
        return null
    }

    return error.message.trim()
}

async function readJson(request: Request): Promise<unknown> {
    const contentType = request.headers.get('content-type') ?? ''

    if (!contentType.includes('application/json')) {
        throw new HTTPException(415, { message: 'Expected application/json request body.' })
    }

    try {
        return await request.json()
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
