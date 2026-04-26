import { HTTPException } from 'hono/http-exception'
import type { JsonValue } from '../../src/types/json'
import type { ParsedReviewRequest } from '../../src/types/worker'
import { reviewRequestSchema } from '../../src/validation/reviewSchemas'

export function parseReviewRequest(payload: JsonValue): ParsedReviewRequest {
    const result = reviewRequestSchema.safeParse(payload)

    if (!result.success) {
        const status = result.error.issues.some((issue) => issue.message.startsWith('Code cannot exceed')) ? 413 : 400
        const message = result.error.issues[0]?.message ?? 'Request body must be a JSON object.'
        throw new HTTPException(status, { message })
    }

    return {
        ...result.data,
        chatMessages: result.data.chatMessages ?? [],
    }
}
