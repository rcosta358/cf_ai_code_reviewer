import type { ReviewChatMessage, ReviewIssue, ReviewResult } from './review'

export type ReviewRequest = {
  code: string
  followUpPrompt?: string
  previousReview?: ReviewResult
  chatMessages?: ReviewChatMessage[]
}

export type ParsedReviewRequest = {
  code: string
  followUpPrompt?: string
  previousReview?: ReviewResult
  chatMessages: ReviewChatMessage[]
}

export type ModelReviewIssue = Omit<ReviewIssue, 'dismissed' | 'id'>

export type ModelReviewResult = {
  chatMessage: string
  score: number
  summary: string
  issues: ModelReviewIssue[]
}

export type NormalizedReviewIssue = ReviewIssue
