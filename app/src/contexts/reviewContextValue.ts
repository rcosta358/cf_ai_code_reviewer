import { createContext } from 'react'
import type { ReviewGenerationMessage, ReviewGenerationStatus, ReviewSession } from '../types/review'

export type ReviewContextValue = {
  activeSession: ReviewSession
  cancelReview: () => void
  dismissIssue: (issueId: string) => void
  focusSourceLine: (line: number) => void
  focusedSourceLine: number | null
  generationMessage: ReviewGenerationMessage | null
  generationStatus: ReviewGenerationStatus
  isGeneratingReview: boolean
  sessions: ReviewSession[]
  createSession: () => void
  selectSession: (sessionId: string) => void
  updateCode: (code: string) => void
  submitReview: () => void
}

export const ReviewContext = createContext<ReviewContextValue | null>(null)
