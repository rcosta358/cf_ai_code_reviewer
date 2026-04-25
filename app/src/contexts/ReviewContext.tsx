import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ReviewContext } from './reviewContextValue'
import type { ReviewContextValue } from './reviewContextValue'
import type { ReviewGenerationMessage, ReviewGenerationStatus, ReviewResult, ReviewSession } from '../types/review'

type ReviewProviderProps = {
  children: ReactNode
}

const createId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`

const createSessionTitle = (code: string, index: number) => {
  const firstLine = code
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean)

  return firstLine ? firstLine.slice(0, 42) : `Review ${index}`
}

const createInitialSession = (): ReviewSession => {
  const now = new Date().toISOString()

  return {
    id: createId('session'),
    title: 'Untitled review',
    code: '',
    createdAt: now,
    updatedAt: now,
    reviewResult: null,
  }
}

const createPlaceholderReview = (code: string): ReviewResult => ({
  id: createId('review'),
  createdAt: new Date().toISOString(),
  summary: code.trim()
    ? 'Review request captured. Backend-generated findings will appear here once connected.'
    : 'Paste code before requesting a review.',
  score: 0,
  issues: [],
  suggestions: code.trim()
    ? ['Connect this action to the Workers AI review endpoint.', 'Render structured issues in the review panel.']
    : ['Add a code snippet to generate a review.'],
})

const REVIEW_GENERATION_DELAY_MS = 1500
const REVIEW_GENERATION_TIMEOUT_MS = 10000

export function ReviewProvider({ children }: ReviewProviderProps) {
  const [sessions, setSessions] = useState<ReviewSession[]>(() => [createInitialSession()])
  const [activeSessionId, setActiveSessionId] = useState(() => sessions[0].id)
  const [generationStatus, setGenerationStatus] = useState<ReviewGenerationStatus>('idle')
  const [generationMessage, setGenerationMessage] = useState<ReviewGenerationMessage | null>(null)
  const completionTimerRef = useRef<number | null>(null)
  const timeoutTimerRef = useRef<number | null>(null)

  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? sessions[0]
  const isGeneratingReview = generationStatus === 'loading'

  const clearGenerationTimers = useCallback(() => {
    if (completionTimerRef.current) {
      window.clearTimeout(completionTimerRef.current)
      completionTimerRef.current = null
    }

    if (timeoutTimerRef.current) {
      window.clearTimeout(timeoutTimerRef.current)
      timeoutTimerRef.current = null
    }
  }, [])

  useEffect(() => clearGenerationTimers, [clearGenerationTimers])

  const createSession = useCallback(() => {
    const newSession = createInitialSession()

    setSessions((currentSessions) => [...currentSessions, newSession])
    setActiveSessionId(newSession.id)
  }, [])

  const selectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId)
  }, [])

  const updateCode = useCallback(
    (code: string) => {
      if (isGeneratingReview) {
        return
      }

      setSessions((currentSessions) =>
        currentSessions.map((session, index) =>
          session.id === activeSessionId
            ? {
                ...session,
                code,
                title: session.reviewResult ? session.title : createSessionTitle(code, index + 1),
                updatedAt: new Date().toISOString(),
              }
            : session,
        ),
      )
    },
    [activeSessionId, isGeneratingReview],
  )

  const cancelReview = useCallback(() => {
    if (!isGeneratingReview) {
      return
    }

    clearGenerationTimers()
    setGenerationStatus('idle')
    setGenerationMessage({
      tone: 'info',
      text: 'Review generation was cancelled.',
    })
  }, [clearGenerationTimers, isGeneratingReview])

  const submitReview = useCallback(() => {
    if (isGeneratingReview || !activeSession.code.trim()) {
      return
    }

    const submittedSessionId = activeSessionId

    clearGenerationTimers()
    setGenerationStatus('loading')
    setGenerationMessage(null)

    completionTimerRef.current = window.setTimeout(() => {
      clearGenerationTimers()
      setSessions((currentSessions) =>
        currentSessions.map((session, index) =>
          session.id === submittedSessionId
            ? {
                ...session,
                title: createSessionTitle(session.code, index + 1),
                updatedAt: new Date().toISOString(),
                reviewResult: createPlaceholderReview(session.code),
              }
            : session,
        ),
      )
      setGenerationStatus('idle')
      setGenerationMessage({
        tone: 'info',
        text: 'Review generated successfully.',
      })
    }, REVIEW_GENERATION_DELAY_MS)

    timeoutTimerRef.current = window.setTimeout(() => {
      clearGenerationTimers()
      setGenerationStatus('idle')
      setGenerationMessage({
        tone: 'warning',
        text: 'Review generation timed out after 10 seconds and was cancelled.',
      })
    }, REVIEW_GENERATION_TIMEOUT_MS)
  }, [activeSession.code, activeSessionId, clearGenerationTimers, isGeneratingReview])

  const value = useMemo<ReviewContextValue>(
    () => ({
      activeSession,
      cancelReview,
      generationMessage,
      generationStatus,
      isGeneratingReview,
      sessions,
      createSession,
      selectSession,
      updateCode,
      submitReview,
    }),
    [
      activeSession,
      cancelReview,
      createSession,
      generationMessage,
      generationStatus,
      isGeneratingReview,
      selectSession,
      sessions,
      submitReview,
      updateCode,
    ],
  )

  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
}
