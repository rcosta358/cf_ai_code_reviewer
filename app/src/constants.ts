import type { ReviewCategory, ReviewSeverity } from './types/review'

export const API_REVIEW_ENDPOINT = '/api/review'
export const API_SESSIONS_ENDPOINT = '/api/sessions'
export const USE_MOCK_REVIEW = import.meta.env.VITE_USE_MOCK_REVIEW === 'true'
export const MOCK_REVIEW_DELAY_MS = 650
export const SESSION_STORAGE_KEY = 'ai-code-reviewer-user-session-id'
export const SESSION_SAVE_DEBOUNCE_MS = 450

export const THEME_STORAGE_KEY = 'ai-code-reviewer-theme'
export const DEFAULT_THEME = 'dark'

export const LEFT_PANEL_DEFAULT_WIDTH = 280
export const RIGHT_PANEL_DEFAULT_WIDTH = 340
export const COLLAPSED_PANEL_WIDTH = 58
export const MIN_LEFT_PANEL_WIDTH = 220
export const MAX_LEFT_PANEL_WIDTH = 420
export const MIN_RIGHT_PANEL_WIDTH = 280
export const MAX_RIGHT_PANEL_WIDTH = 560

export const DEFAULT_EDITOR_METRICS = {
    horizontalScrollbarHeight: 0,
    lineHeight: 24,
    paddingTop: 22,
}

export const COPY_FEEDBACK_DURATION_MS = 1400

export const REVIEW_GENERATION_TIMEOUT_MS = 60000
export const REVIEW_GENERATION_TIMEOUT_SECONDS = REVIEW_GENERATION_TIMEOUT_MS / 1000

export const LANGUAGE_LABELS: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    csharp: 'C#',
    cpp: 'C/C++',
    xml: 'HTML/XML',
    css: 'CSS',
    scss: 'SCSS',
    json: 'JSON',
    bash: 'Shell',
    shell: 'Shell',
    plaintext: 'Plain Text',
}

export const REVIEW_CATEGORIES = [
    'correctness',
    'security',
    'performance',
    'maintability',
    'style',
    'documentation',
    'other',
] as const satisfies ReviewCategory[]

export const REVIEW_CATEGORY_LABELS: Record<ReviewCategory, string> = {
    correctness: 'Correctness',
    security: 'Security',
    performance: 'Performance',
    maintability: 'Maintability',
    style: 'Style',
    documentation: 'Documentation',
    other: 'Other',
}

export const REVIEW_CATEGORY_ORDER = REVIEW_CATEGORIES

export const REVIEW_SEVERITIES = ['low', 'medium', 'high'] as const satisfies ReviewSeverity[]

export type IssueLevelFilter = 'all' | ReviewSeverity

export const ISSUE_LEVEL_LABELS: Record<IssueLevelFilter, string> = {
    all: 'All',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
}

export const HIGH_CONFIDENCE_THRESHOLD = 0.8
export const MEDIUM_CONFIDENCE_THRESHOLD = 0.6

export const MAX_CODE_LENGTH = 50_000

export const REVIEW_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast'
export const MAX_MODEL_TOKENS = 2048
export const REVIEW_MODEL_TEMPERATURE = 0.1
