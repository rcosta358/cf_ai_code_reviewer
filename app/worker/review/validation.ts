import { HTTPException } from 'hono/http-exception'
import type { ParsedReviewRequest } from '../../src/types/worker'

const MAX_CODE_LENGTH = 80_000

export function parseReviewRequest(payload: unknown): ParsedReviewRequest {
  if (!isRecord(payload)) {
    throw new HTTPException(400, { message: 'Request body must be a JSON object.' })
  }

  const code = readRequiredString(payload.code, 'code')
  const language = readOptionalString(payload.language, 'language')
  const filename = readOptionalString(payload.filename, 'filename')

  if (!code.trim()) {
    throw new HTTPException(400, { message: 'Code cannot be empty.' })
  }

  if (code.length > MAX_CODE_LENGTH) {
    throw new HTTPException(413, { message: `Code cannot exceed ${MAX_CODE_LENGTH} characters.` })
  }

  return {
    code,
    filename,
    language,
  }
}

function readRequiredString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new HTTPException(400, { message: `${field} must be a string.` })
  }

  return value
}

function readOptionalString(value: unknown, field: string): string | undefined {
  if (value === undefined) {
    return undefined
  }

  if (typeof value !== 'string') {
    throw new HTTPException(400, { message: `${field} must be a string when provided.` })
  }

  const trimmed = value.trim()
  return trimmed || undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
