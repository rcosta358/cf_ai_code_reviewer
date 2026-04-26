import type { ParsedReviewRequest } from '../../src/types/worker'
import { reviewResponseSchema } from './schema'

const SYSTEM_PROMPT = [
    'You are an expert code reviewer for a lightweight developer tool.',
    'Review only the submitted code and return actionable structured feedback.',
    'Prioritize correctness, security, and performance issues that a developer can fix.',
    'Do not invent missing surrounding files or dependencies. State uncertainty through confidence.',
    'Return JSON only. Do not wrap it in markdown. Do not include prose outside the JSON object.',
    'You are allowed to use only <b>, <i>, and <code> tags for inline formatting. Do not use any other HTML tags.',
    'Every issue must include line as a 1-based source line number from the numbered code. If an issue spans multiple lines, use the first relevant line. If an issue is file-wide, use the most relevant line or line 1.',
    'Allowed category values are: correctness, security, performance, maintability, style, documentation and other.',
    'Allowed severity values are: low, medium, high.',
    'Use confidence as a number from 0 to 1. Use score as a number from 0 to 10.',
    'Do not include additional properties, comments, trailing commas, or null/undefined values.',
    'If the input provided is not code or has no clear issues, return an empty issues array and a maximum score.',
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
                content: [
                    'Analyze this code and return a JSON object matching the previously provided schema.',
                    '\nHere is the code with line numbers. The numbers and pipe prefixes are not part of the source code:',
                    '```',
                    formatCodeWithLineNumbers(request.code),
                    '```',
                ].join('\n'),
            },
        ],
        response_format: {
            type: 'json_schema',
            json_schema: reviewResponseSchema,
        },
    }
}

function formatCodeWithLineNumbers(code: string) {
    return code
        .split('\n')
        .map((line, index) => `${index + 1} | ${line}`)
        .join('\n')
}
