import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ReviewContext } from './reviewContextValue'
import type { ReviewContextValue } from './reviewContextValue'
import type {
  ReviewGenerationMessage,
  ReviewGenerationStatus,
  ReviewResult,
  ReviewSession,
} from '../types/review'

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
    result: null,
  }
}

const REVIEW_GENERATION_TIMEOUT_MS = 30000

const readApiError = (body: unknown) => {
  if (typeof body === 'object' && body && 'error' in body && typeof body.error === 'string') {
    return body.error
  }

  return 'Review generation failed.'
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Review generation failed.'
}

export function ReviewProvider({ children }: ReviewProviderProps) {
  const [sessions, setSessions] = useState<ReviewSession[]>(() => [createInitialSession()])
  const [activeSessionId, setActiveSessionId] = useState(() => sessions[0].id)
  const [generationStatus, setGenerationStatus] = useState<ReviewGenerationStatus>('idle')
  const [generationMessage, setGenerationMessage] = useState<ReviewGenerationMessage | null>(null)
  const [focusedSourceLine, setFocusedSourceLine] = useState<number | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const abortReasonRef = useRef<'cancel' | 'timeout' | null>(null)
  const timeoutTimerRef = useRef<number | null>(null)

  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? sessions[0]
  const isGeneratingReview = generationStatus === 'loading'

  const clearGenerationTimers = useCallback(() => {
    if (timeoutTimerRef.current) {
      window.clearTimeout(timeoutTimerRef.current)
      timeoutTimerRef.current = null
    }
  }, [])

  useEffect(
    () => () => {
      abortControllerRef.current?.abort()
      clearGenerationTimers()
    },
    [clearGenerationTimers],
  )

  const createSession = useCallback(() => {
    const newSession = createInitialSession()

    setSessions((currentSessions) => [...currentSessions, newSession])
    setActiveSessionId(newSession.id)
  }, [])

  const selectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId)
    setFocusedSourceLine(null)
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
                title: session.result ? session.title : createSessionTitle(code, index + 1),
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

    abortReasonRef.current = 'cancel'
    abortControllerRef.current?.abort()
    clearGenerationTimers()
    abortControllerRef.current = null
    setGenerationStatus('idle')
    setGenerationMessage({
      tone: 'info',
      text: 'Review generation was cancelled.',
    })
  }, [clearGenerationTimers, isGeneratingReview])

  const submitReview = useCallback(async () => {
    if (isGeneratingReview || !activeSession.code.trim()) {
      return
    }

    const submittedSessionId = activeSessionId
    const submittedCode = activeSession.code

    abortControllerRef.current?.abort()
    abortReasonRef.current = null
    clearGenerationTimers()
    const abortController = new AbortController()
    abortControllerRef.current = abortController
    setGenerationStatus('loading')
    setGenerationMessage(null)

    timeoutTimerRef.current = window.setTimeout(() => {
      abortReasonRef.current = 'timeout'
      abortController.abort()
    }, REVIEW_GENERATION_TIMEOUT_MS)

    try {
      const response = await fetch('/api/review', {
        body: JSON.stringify({ code: submittedCode }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        signal: abortController.signal,
      })

      const body = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(readApiError(body))
      }

      const review = body as ReviewResult

      setSessions((currentSessions) =>
        currentSessions.map((session, index) =>
          session.id === submittedSessionId
            ? {
                ...session,
                title: createSessionTitle(session.code, index + 1),
                updatedAt: new Date().toISOString(),
                result: review,
              }
            : session,
        ),
      )
      setGenerationStatus('idle')
      setGenerationMessage({
        tone: 'info',
        text: 'Review generated successfully.',
      })
    } catch (error) {
      const wasAborted = abortController.signal.aborted
      const abortReason = abortReasonRef.current

      setGenerationStatus('idle')
      setGenerationMessage({
        tone: wasAborted && abortReason === 'cancel' ? 'info' : 'warning',
        text:
          wasAborted && abortReason === 'timeout'
            ? 'Review generation timed out after 30 seconds and was cancelled.'
            : wasAborted
              ? 'Review generation was cancelled.'
              : getErrorMessage(error),
      })
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null
        abortReasonRef.current = null
      }

      clearGenerationTimers()
    }
  }, [activeSession.code, activeSessionId, clearGenerationTimers, isGeneratingReview])

  const dismissIssue = useCallback(
    (issueId: string) => {
      setSessions((currentSessions) =>
        currentSessions.map((session) =>
          session.id === activeSessionId && session.result
            ? {
                ...session,
                result: {
                  ...session.result,
                  issues: session.result.issues.map((issue) =>
                    issue.id === issueId ? { ...issue, dismissed: true } : issue,
                  ),
                },
              }
            : session,
        ),
      )
    },
    [activeSessionId],
  )

  const focusSourceLine = useCallback((line: number) => {
    setFocusedSourceLine(line)
  }, [])

  const value = useMemo<ReviewContextValue>(
    () => ({
      activeSession,
      cancelReview,
      dismissIssue,
      focusedSourceLine,
      focusSourceLine,
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
      dismissIssue,
      focusedSourceLine,
      focusSourceLine,
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
