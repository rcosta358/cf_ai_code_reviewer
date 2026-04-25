import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ReviewContext } from './reviewContextValue'
import type { ReviewContextValue } from './reviewContextValue'
import type {
  ReviewGenerationMessage,
  ReviewGenerationStatus,
  ReviewIssue,
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

const getExampleLine = (code: string, preferredLine: number) => {
  const lineCount = Math.max(code.split('\n').length, 1)
  return Math.min(preferredLine, lineCount)
}

const createExampleIssue = (
  code: string,
  issue: Omit<ReviewIssue, 'id' | 'line'> & { preferredLine: number },
): ReviewIssue => ({
  category: issue.category,
  confidence: issue.confidence,
  description: issue.description,
  id: createId('issue'),
  line: getExampleLine(code, issue.preferredLine),
  severity: issue.severity,
  suggestion: issue.suggestion,
  title: issue.title,
})

const createExampleReview = (code: string): ReviewResult => {
  const issues = [
    createExampleIssue(code, {
      category: 'correctness',
      confidence: 0.88,
      description:
        'This branch assumes the input is always present. If the caller passes null, undefined, or an empty shape, the review flow can fail before the user sees a useful error.',
      preferredLine: 3,
      severity: 'high',
      suggestion: 'Add an early guard and return a clear validation result before processing the input.',
      title: 'Missing input guard',
    }),
    createExampleIssue(code, {
      category: 'security',
      confidence: 0.74,
      description:
        'User-provided content appears to be rendered without an explicit sanitization boundary. This is risky if review output eventually includes HTML or markdown from a model response.',
      preferredLine: 8,
      severity: 'high',
      suggestion: 'Keep rendered model output as text, or sanitize it before injecting it into the DOM.',
      title: 'Untrusted output rendering path',
    }),
    createExampleIssue(code, {
      category: 'performance',
      confidence: 0.67,
      description:
        'The expensive transformation is likely to run on every render. Large code snippets could make typing feel sluggish as the application grows.',
      preferredLine: 12,
      severity: 'medium',
      suggestion: 'Memoize derived review data and move expensive work out of render paths.',
      title: 'Repeated expensive computation',
    }),
    createExampleIssue(code, {
      category: 'maintability',
      confidence: 0.81,
      description:
        'The review state and UI formatting concerns are coupled. That makes future backend integration and result rendering harder to change independently.',
      preferredLine: 18,
      severity: 'medium',
      suggestion: 'Keep backend-shaped review data in context and format display-only labels inside presentational components.',
      title: 'State shape mixes UI concerns',
    }),
    createExampleIssue(code, {
      category: 'style',
      confidence: 0.62,
      description:
        'Some UI labels use different terms for the same workflow. This can make the review surface feel less predictable as more states are added.',
      preferredLine: 24,
      severity: 'low',
      suggestion: 'Use one naming convention for review actions, status labels, and empty states.',
      title: 'Inconsistent UI wording',
    }),
    createExampleIssue(code, {
      category: 'documentation',
      confidence: 0.58,
      description:
        'The expected backend response shape is implied by UI code but not documented. Future integration work will be easier if the contract is explicit.',
      preferredLine: 30,
      severity: 'medium',
      suggestion: 'Document the review result schema and include examples for categories, severities, confidence, and line references.',
      title: 'Review result schema is undocumented',
    }),
    createExampleIssue(code, {
      category: 'other',
      confidence: 0.52,
      description:
        'The placeholder review data should be isolated so it can be removed cleanly when the API endpoint is connected.',
      preferredLine: 36,
      severity: 'low',
      suggestion: 'Move fixture review data behind a clearly named mock adapter or delete it during backend integration.',
      title: 'Temporary review fixture needs an exit path',
    }),
  ] satisfies ReviewIssue[]

  return {
    id: createId('review'),
    createdAt: new Date().toISOString(),
    score: 7,
    summary:
      'The implementation is directionally solid, but it needs stronger validation, clearer rendering boundaries, and coverage around asynchronous review behavior.',
    issues,
  }
}

const REVIEW_GENERATION_DELAY_MS = 1500
const REVIEW_GENERATION_TIMEOUT_MS = 10000

export function ReviewProvider({ children }: ReviewProviderProps) {
  const [sessions, setSessions] = useState<ReviewSession[]>(() => [createInitialSession()])
  const [activeSessionId, setActiveSessionId] = useState(() => sessions[0].id)
  const [generationStatus, setGenerationStatus] = useState<ReviewGenerationStatus>('idle')
  const [generationMessage, setGenerationMessage] = useState<ReviewGenerationMessage | null>(null)
  const [focusedSourceLine, setFocusedSourceLine] = useState<number | null>(null)
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
                result: createExampleReview(session.code),
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
