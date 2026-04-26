import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { REVIEW_GENERATION_TIMEOUT_MS, SESSION_SAVE_DEBOUNCE_MS } from '../constants'
import { ReviewContext } from './reviewContextValue'
import type { ReviewContextValue } from './reviewContextValue'
import { generateReview } from '../services/reviewService'
import {
    getOrCreateUserSessionId,
    loadPersistedReviewState,
    savePersistedReviewState,
} from '../services/sessionStorageService'
import {
    applyReviewResult,
    createReviewGenerationMessage,
    createReviewSession,
    dismissReviewIssue,
    updateSessionCode,
} from '../services/reviewSessionService'
import type {
    ReviewGenerationMessage,
    ReviewGenerationStatus,
} from '../types/review'

type ReviewProviderProps = {
  children: ReactNode
}

export function ReviewProvider({ children }: ReviewProviderProps) {
    const [initialSession] = useState(() => createReviewSession())
    const [sessions, setSessions] = useState(() => [initialSession])
    const [activeSessionId, setActiveSessionId] = useState(() => initialSession.id)
    const [hasLoadedPersistedState, setHasLoadedPersistedState] = useState(false)
    const [generationStatus, setGenerationStatus] = useState<ReviewGenerationStatus>('idle')
    const [generationMessage, setGenerationMessage] = useState<ReviewGenerationMessage | null>(null)
    const [focusedSourceLine, setFocusedSourceLine] = useState<number | null>(null)
    const abortControllerRef = useRef<AbortController | null>(null)
    const abortReasonRef = useRef<'cancel' | 'timeout' | null>(null)
    const timeoutTimerRef = useRef<number | null>(null)
    const userSessionIdRef = useRef<string | null>(null)

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

    useEffect(() => {
        const userSessionId = getOrCreateUserSessionId()
        userSessionIdRef.current = userSessionId
        const abortController = new AbortController()

        loadPersistedReviewState(userSessionId, abortController.signal)
            .then((persistedState) => {
                if (persistedState.sessions.length === 0) {
                    return
                }

                setSessions(persistedState.sessions)
                setActiveSessionId(
                    persistedState.sessions.some((session) => session.id === persistedState.activeSessionId)
                        ? persistedState.activeSessionId
                        : persistedState.sessions[0].id,
                )
            })
            .catch((error) => {
                if (!(error instanceof DOMException && error.name === 'AbortError')) {
                    setGenerationMessage({
                        tone: 'warning',
                        text: error instanceof Error ? error.message : 'Could not load saved reviews.',
                    })
                }
            })
            .finally(() => {
                if (!abortController.signal.aborted) {
                    setHasLoadedPersistedState(true)
                }
            })

        return () => abortController.abort()
    }, [])

    useEffect(() => {
        if (!hasLoadedPersistedState || !userSessionIdRef.current) {
            return
        }

        const abortController = new AbortController()
        const timeoutId = window.setTimeout(() => {
            void savePersistedReviewState(
                userSessionIdRef.current as string,
                { activeSessionId, sessions },
                abortController.signal,
            ).catch((error) => {
                if (!(error instanceof DOMException && error.name === 'AbortError')) {
                    setGenerationMessage({
                        tone: 'warning',
                        text: error instanceof Error ? error.message : 'Could not save reviews.',
                    })
                }
            })
        }, SESSION_SAVE_DEBOUNCE_MS)

        return () => {
            window.clearTimeout(timeoutId)
            abortController.abort()
        }
    }, [activeSessionId, hasLoadedPersistedState, sessions])

    const createSession = useCallback(() => {
        const newSession = createReviewSession()

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

            setSessions((currentSessions) => updateSessionCode(currentSessions, activeSessionId, code))
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
            const review = await generateReview(submittedCode, abortController.signal)

            setSessions((currentSessions) => applyReviewResult(currentSessions, submittedSessionId, review))
            setGenerationStatus('idle')
            setGenerationMessage({
                tone: 'info',
                text: 'Review generated successfully.',
            })
        } catch (error) {
            const wasAborted = abortController.signal.aborted
            const abortReason = abortReasonRef.current

            setGenerationStatus('idle')
            setGenerationMessage(createReviewGenerationMessage(error, wasAborted, abortReason))
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
            setSessions((currentSessions) => dismissReviewIssue(currentSessions, activeSessionId, issueId))
        },
        [activeSessionId],
    )

    const deleteSession = useCallback((sessionId: string) => {
        setSessions((currentSessions) => {
            const sessionIndex = currentSessions.findIndex((session) => session.id === sessionId)

            if (sessionIndex === -1) {
                return currentSessions
            }

            const remainingSessions = currentSessions.filter((session) => session.id !== sessionId)
            const nextSessions = remainingSessions.length ? remainingSessions : [createReviewSession()]

            if (sessionId === activeSessionId) {
                const nextActiveSession = nextSessions[Math.max(0, Math.min(sessionIndex, nextSessions.length - 1))]
                setActiveSessionId(nextActiveSession.id)
                setFocusedSourceLine(null)
            }

            return nextSessions
        })
    }, [activeSessionId])

    const focusSourceLine = useCallback((line: number) => {
        setFocusedSourceLine(line)
    }, [])

    const value = useMemo<ReviewContextValue>(
        () => ({
            activeSession,
            cancelReview,
            deleteSession,
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
            deleteSession,
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
