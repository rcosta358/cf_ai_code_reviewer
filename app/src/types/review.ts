export type ReviewSeverity = 'low' | 'medium' | 'high'

export type ReviewCategory =
  | 'correctness'
  | 'security'
  | 'performance'
  | 'maintainability'
  | 'style'
  | 'documentation'
  | 'other'

export type ReviewIssue = {
  category: ReviewCategory
  confidence: number
  id: string
  title: string
  description: string
  severity: ReviewSeverity
  suggestion: string
  dismissed?: boolean
  line?: number
}

export type ReviewResult = {
  id: string
  createdAt: string
  chatMessage: string
  score: number
  summary: string
  issues: ReviewIssue[]
}

export type ReviewChatMessage = {
  id: string
  createdAt: string
  role: 'assistant' | 'user'
  text: string
}

export type ReviewSession = {
  id: string
  title: string
  chatMessages: ReviewChatMessage[]
  code: string
  createdAt: string
  updatedAt: string
  result: ReviewResult | null
}

export type RightPanelView = 'review' | 'chat'

export type ReviewGenerationStatus = 'idle' | 'loading'

export type ReviewGenerationMessage = {
  tone: 'info' | 'warning'
  text: string
}

export type CodeExample = {
  code: string
  id: string
  label: string
}
