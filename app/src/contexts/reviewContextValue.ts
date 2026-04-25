import { createContext } from 'react'
import type { ReviewGenerationMessage, ReviewGenerationStatus, ReviewSession } from '../types/review'

export type ReviewContextValue = {
  activeSession: ReviewSession
  cancelReview: () => void
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
