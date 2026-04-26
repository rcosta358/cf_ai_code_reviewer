import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type UIEvent } from 'react'
import { COPY_FEEDBACK_DURATION_MS, DEFAULT_EDITOR_METRICS } from '../constants'
import { useCodeHighlight } from '../hooks/useCodeHighlight'
import { useCursorPosition } from '../hooks/useCursorPosition'
import {
    getFocusedLineScrollTop,
    getLineNumbers,
    getLineSelectionRange,
    getTextareaEditorMetrics,
    insertTabAtSelection,
} from '../services/editorService'
import { CodeEditorInput } from './CodeEditorInput'
import { CodeEditorToolbar } from './CodeEditorToolbar'
import type { CodeExample } from '../examples'

export type EditorCursorPosition = {
  column: number
  line: number
}

type CodeEditorProps = {
  code: string
  disabled?: boolean
  exampleOptions: readonly CodeExample[]
  focusedLine: number | null
  onCursorPositionChange: (cursorPosition: EditorCursorPosition) => void
  onChange: (code: string) => void
  onSelectExample: (code: string) => void
  selectedExampleId: string
}

export function CodeEditor({
    code,
    disabled = false,
    exampleOptions,
    focusedLine,
    onChange,
    onCursorPositionChange,
    onSelectExample,
    selectedExampleId,
}: CodeEditorProps) {
    const highlightRef = useRef<HTMLPreElement>(null)
    const lineNumberRef = useRef<HTMLTextAreaElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [copied, setCopied] = useState(false)
    const [editorMetrics, setEditorMetrics] = useState(DEFAULT_EDITOR_METRICS)
    const { highlightedCode, language } = useCodeHighlight(code)
    const { captureCursor, cursorPosition } = useCursorPosition(code)
    const hasCode = code.length > 0
    const lineNumbers = getLineNumbers(code)

    useEffect(() => {
        onCursorPositionChange(cursorPosition)
    }, [cursorPosition, onCursorPositionChange])

    useLayoutEffect(() => {
        const textarea = textareaRef.current

        if (!textarea) {
            return
        }

        const syncEditorMetrics = () => {
            setEditorMetrics(getTextareaEditorMetrics(textarea))

            if (lineNumberRef.current) {
                lineNumberRef.current.scrollTop = textarea.scrollTop
            }
        }

        syncEditorMetrics()

        const resizeObserver = new ResizeObserver(syncEditorMetrics)
        resizeObserver.observe(textarea)

        return () => resizeObserver.disconnect()
    }, [code])

    useEffect(() => {
        if (!focusedLine || !textareaRef.current) {
            return
        }

        const nextScrollTop = getFocusedLineScrollTop(focusedLine, editorMetrics.lineHeight)
        textareaRef.current.scrollTo({ top: nextScrollTop, behavior: 'smooth' })
        textareaRef.current.focus({ preventScroll: true })

        const { end, start } = getLineSelectionRange(code, focusedLine)
        textareaRef.current.setSelectionRange(start, end)
        captureCursor(textareaRef.current)
    }, [captureCursor, code, editorMetrics.lineHeight, focusedLine])

    const handleCopy = async () => {
        if (!code) {
            return
        }

        await navigator.clipboard.writeText(code)
        setCopied(true)
        window.setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key !== 'Tab' || disabled) {
            return
        }

        event.preventDefault()

        const { nextCode, nextCursorPosition } = insertTabAtSelection(event.currentTarget, code)
        onChange(nextCode)

        window.requestAnimationFrame(() => {
            event.currentTarget.setSelectionRange(nextCursorPosition, nextCursorPosition)
            captureCursor(event.currentTarget)
        })
    }

    const handleScroll = (event: UIEvent<HTMLTextAreaElement>) => {
        if (highlightRef.current) {
            highlightRef.current.scrollTo({
                left: event.currentTarget.scrollLeft,
                top: event.currentTarget.scrollTop,
            })
        }

        if (lineNumberRef.current) {
            lineNumberRef.current.scrollTop = event.currentTarget.scrollTop
        }
    }

    return (
        <>
            <CodeEditorToolbar
                copied={copied}
                disabled={disabled}
                exampleOptions={exampleOptions}
                hasCode={hasCode}
                language={language}
                onCopy={handleCopy}
                onSelectExample={onSelectExample}
                selectedExampleId={selectedExampleId}
            />

            <CodeEditorInput
                code={code}
                disabled={disabled}
                editorMetrics={editorMetrics}
                hasCode={hasCode}
                highlightedCode={highlightedCode}
                highlightRef={highlightRef}
                lineNumberRef={lineNumberRef}
                lineNumbers={lineNumbers}
                onChange={(event) => {
                    onChange(event.target.value)
                    captureCursor(event.target)
                }}
                onCursorCapture={captureCursor}
                onKeyDown={handleKeyDown}
                onScroll={handleScroll}
                textareaRef={textareaRef}
            />
        </>
    )
}
