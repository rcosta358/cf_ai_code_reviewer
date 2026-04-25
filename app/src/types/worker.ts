import type { ReviewIssue } from './review'

export type ReviewRequest = {
  code: string
  language?: string
  filename?: string
}

export type ParsedReviewRequest = {
  code: string
  language?: string
  filename?: string
}

export type ModelReviewIssue = Omit<ReviewIssue, 'dismissed' | 'id'>

export type ModelReviewResult = {
  score: number
  summary: string
  issues: ModelReviewIssue[]
}

export type NormalizedReviewIssue = ReviewIssue
