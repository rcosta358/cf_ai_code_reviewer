import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ReviewContext } from './reviewContextValue'
import type { ReviewContextValue } from './reviewContextValue'
import type { ReviewResult, ReviewSession } from '../types/review'

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
  score: code.trim() ? 82 : 0,
  issues: [],
  suggestions: code.trim()
    ? ['Connect this action to the Workers AI review endpoint.', 'Render structured issues in the review panel.']
    : ['Add a code snippet to generate a review.'],
})

export function ReviewProvider({ children }: ReviewProviderProps) {
  const [sessions, setSessions] = useState<ReviewSession[]>(() => [createInitialSession()])
  const [activeSessionId, setActiveSessionId] = useState(() => sessions[0].id)

  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? sessions[0]

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
    [activeSessionId],
  )

  const submitReview = useCallback(() => {
    setSessions((currentSessions) =>
      currentSessions.map((session, index) =>
        session.id === activeSessionId
          ? {
              ...session,
              title: createSessionTitle(session.code, index + 1),
              updatedAt: new Date().toISOString(),
              reviewResult: createPlaceholderReview(session.code),
            }
          : session,
      ),
    )
  }, [activeSessionId])

  const value = useMemo<ReviewContextValue>(
    () => ({
      activeSession,
      sessions,
      createSession,
      selectSession,
      updateCode,
      submitReview,
    }),
    [activeSession, createSession, selectSession, sessions, submitReview, updateCode],
  )

  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
}
