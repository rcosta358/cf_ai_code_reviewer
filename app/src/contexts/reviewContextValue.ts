import { createContext } from 'react'
import type { ReviewSession } from '../types/review'

export type ReviewContextValue = {
  activeSession: ReviewSession
  sessions: ReviewSession[]
  createSession: () => void
  selectSession: (sessionId: string) => void
  updateCode: (code: string) => void
  submitReview: () => void
}

export const ReviewContext = createContext<ReviewContextValue | null>(null)
