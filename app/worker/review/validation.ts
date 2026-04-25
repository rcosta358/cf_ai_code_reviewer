import { HTTPException } from 'hono/http-exception'
import { MAX_CODE_LENGTH } from '../../src/constants'
import type { ParsedReviewRequest } from '../../src/types/worker'

export function parseReviewRequest(payload: unknown): ParsedReviewRequest {
    if (!isRecord(payload)) {
        throw new HTTPException(400, { message: 'Request body must be a JSON object.' })
    }

    const code = readRequiredString(payload.code, 'code')
    if (!code.trim()) {
        throw new HTTPException(400, { message: 'Code cannot be empty.' })
    }
    if (code.length > MAX_CODE_LENGTH) {
        throw new HTTPException(413, { message: `Code cannot exceed ${MAX_CODE_LENGTH} characters.` })
    }
    return { code }
}

function readRequiredString(value: unknown, field: string): string {
    if (typeof value !== 'string') {
        throw new HTTPException(400, { message: `${field} must be a string.` })
    }

    return value
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}
