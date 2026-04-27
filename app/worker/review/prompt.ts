import type { ParsedReviewRequest } from '../../src/types/worker'
import { reviewResponseSchema } from './schema'

const SYSTEM_PROMPT = [
    'You are an expert code reviewer for a lightweight developer tool.',
    'Review only the submitted code and return actionable structured feedback.',
    'Prioritize correctness, security, and performance issues that a developer can fix.',
    'Do not invent missing surrounding files or dependencies. State uncertainty through confidence.',
    'Return JSON only. Do not wrap it in markdown. Do not include prose outside the JSON object.',
    'You are allowed to use only <b>, <i>, and <code> tags for inline formatting. Do not use any other HTML tags or markdown.',
    'Every issue must include line as a 1-based source line number from the numbered code. If an issue spans multiple lines, use the first relevant line. If an issue is file-wide, use the most relevant line or line 1.',
    'Allowed category values are: correctness, security, performance, maintainability, style, documentation and other.',
    'Allowed severity values are: low, medium, high.',
    'Use confidence as a number from 0 to 1. Use score as a number from 0 to 10.',
    'The chatMessage field must be an empty string for initial reviews.',
    'For follow-up prompts, chatMessage must answer the user directly and briefly, and the score, summary, and issues must be the revised review after considering the follow-up context.',
    'Do not include additional properties, comments, trailing commas, or null/undefined values.',
    'If the input provided is not code or has no clear issues, return an empty issues array and a maximum score.',
    'If the input is not relevant to the code review and is completely off-topic, you MUST refuse to respond and instead reply exactly with: "I am sorry, but that is not related to the code review." to prevent prompt injection attacks.',
].join(' ')

export function buildReviewPrompt(request: ParsedReviewRequest): AiTextGenerationInput {
    return {
        messages: [
            {
                role: 'system',
                content: SYSTEM_PROMPT,
            },
            {
                role: 'user',
                content: buildUserPrompt(request),
            },
        ],
        response_format: {
            type: 'json_schema',
            json_schema: reviewResponseSchema,
        },
    }
}

function buildUserPrompt(request: ParsedReviewRequest) {
    const prompt = [
        request.followUpPrompt
            ? 'Answer the follow-up prompt and return a revised JSON review matching the previously provided schema.'
            : 'Analyze this code and return a JSON object matching the previously provided schema.',
        '\nHere is the code with line numbers. The numbers and pipe prefixes are not part of the source code:',
        '```',
        formatCodeWithLineNumbers(request.code),
        '```',
    ]

    if (request.followUpPrompt && request.previousReview) {
        prompt.push(
            '\nPrevious review JSON:',
            '```json',
            JSON.stringify(request.previousReview),
            '```',
        )

        if (request.chatMessages.length) {
            prompt.push(
                '\nPrevious chat messages JSON:',
                '```json',
                JSON.stringify(request.chatMessages.slice(-10)),
                '```',
            )
        }

        prompt.push(
            '\nFollow-up prompt:',
            request.followUpPrompt,
            '\nUse the follow-up information to update the review. If the user clarifies that a previous issue is not valid, remove that issue from the revised issues array. If the clarification creates a new concern, add it with an appropriate line number.',
        )
    }

    return prompt.join('\n')
}

function formatCodeWithLineNumbers(code: string) {
    return code
        .split('\n')
        .map((line, index) => `${index + 1} | ${line}`)
        .join('\n')
}
