import type { ReviewResult } from '../types/review'

export const mockReview: ReviewResult = {
    id: 'review-mock',
    createdAt: '2026-04-26T00:00:00.000Z',
    chatMessage: '',
    score: 6.8,
    summary:
    'Mock review enabled. This response is served locally so you can test the interface without spending Workers AI credits.',
    issues: [
        {
            category: 'security',
            confidence: 'high',
            description:
        'User-controlled input appears to be passed into a sensitive operation without validation or escaping.',
            id: 'issue-mock-1',
            line: 4,
            severity: 'high',
            suggestion:
        'Validate the input against an allowlist and avoid constructing commands, queries, or file paths directly from user data.',
            title: 'Validate untrusted input',
        },
        {
            category: 'correctness',
            confidence: 'medium',
            description:
        'The code path does not appear to handle an empty or missing value, which can cause runtime failures in edge cases.',
            id: 'issue-mock-2',
            line: 9,
            severity: 'medium',
            suggestion:
        'Add an early guard clause for empty values and return a clear error state before continuing.',
            title: 'Handle empty input',
        },
        {
            category: 'performance',
            confidence: 'low',
            description:
        'A repeated operation is performed inside a loop and may become expensive as input size grows.',
            id: 'issue-mock-3',
            line: 15,
            severity: 'low',
            suggestion:
        'Move invariant work outside the loop or cache the computed value before iterating.',
            title: 'Avoid repeated work in loop',
        },
    ],
}
