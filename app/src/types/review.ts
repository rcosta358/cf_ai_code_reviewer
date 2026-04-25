export type ReviewSeverity = 'low' | 'medium' | 'high'

export type ReviewCategory =
  | 'correctness'
  | 'security'
  | 'performance'
  | 'maintability'
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
  overallRating: 'Needs attention' | 'Good' | 'Strong'
  agentSummary: string
  summary: string
  score: number
  issues: ReviewIssue[]
}

export type ReviewSession = {
  id: string
  title: string
  code: string
  createdAt: string
  updatedAt: string
  reviewResult: ReviewResult | null
}

export type RightPanelView = 'review' | 'chat' | 'history'

export type ReviewGenerationStatus = 'idle' | 'loading'

export type ReviewGenerationMessage = {
  tone: 'info' | 'warning'
  text: string
}
