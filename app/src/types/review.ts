export type ReviewSeverity = 'low' | 'medium' | 'high' | 'critical'

export type ReviewIssue = {
  id: string
  title: string
  description: string
  severity: ReviewSeverity
  line?: number
}

export type ReviewResult = {
  id: string
  createdAt: string
  summary: string
  score: number
  issues: ReviewIssue[]
  suggestions: string[]
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
