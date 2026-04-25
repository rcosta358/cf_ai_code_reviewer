import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { COPY_FEEDBACK_DURATION_MS, DEFAULT_EDITOR_METRICS } from '../constants'
import { useCodeHighlight } from '../hooks/useCodeHighlight'
import { useCursorPosition } from '../hooks/useCursorPosition'
import { Icon } from './Icon'

export type EditorCursorPosition = {
  column: number
  line: number
}

type CodeEditorProps = {
  code: string
  disabled?: boolean
  focusedLine: number | null
  onCursorPositionChange: (cursorPosition: EditorCursorPosition) => void
  onChange: (code: string) => void
}

function getLineSelectionRange(code: string, line: number) {
    const targetLine = Math.max(Math.floor(line), 1)
    let currentLine = 1
    let start = 0

    while (currentLine < targetLine) {
        const nextLineIndex = code.indexOf('\n', start)

        if (nextLineIndex === -1) {
            return { end: code.length, start: code.length }
        }

        start = nextLineIndex + 1
        currentLine += 1
    }

    const nextLineIndex = code.indexOf('\n', start)
    const lineEnd = nextLineIndex === -1 ? code.length : nextLineIndex
    const end = lineEnd > start ? lineEnd : Math.min(start + 1, code.length)

    return { end, start }
}

export function CodeEditor({ code, disabled = false, focusedLine, onChange, onCursorPositionChange }: CodeEditorProps) {
    const highlightRef = useRef<HTMLPreElement>(null)
    const lineNumberRef = useRef<HTMLTextAreaElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [copied, setCopied] = useState(false)
    const [editorMetrics, setEditorMetrics] = useState(DEFAULT_EDITOR_METRICS)
    const { highlightedCode, language } = useCodeHighlight(code)
    const { captureCursor, cursorPosition } = useCursorPosition(code)
    const hasCode = code.length > 0
    const lineNumbers = Array.from({ length: code.split('\n').length }, (_, index) => index + 1).join('\n')

    useEffect(() => {
        onCursorPositionChange(cursorPosition)
    }, [cursorPosition, onCursorPositionChange])

    useLayoutEffect(() => {
        const textarea = textareaRef.current

        if (!textarea) {
            return
        }

        const syncEditorMetrics = () => {
            const style = window.getComputedStyle(textarea)
            const borderBlockWidth = Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth)
            const horizontalScrollbarHeight = textarea.offsetHeight - textarea.clientHeight - borderBlockWidth
            const lineHeight = Number.parseFloat(style.lineHeight)
            const paddingTop = Number.parseFloat(style.paddingTop)

            setEditorMetrics({
                horizontalScrollbarHeight: Math.max(
                    Number.isFinite(horizontalScrollbarHeight) ? horizontalScrollbarHeight : 0,
                    0,
                ),
                lineHeight: Number.isFinite(lineHeight) ? lineHeight : DEFAULT_EDITOR_METRICS.lineHeight,
                paddingTop: Number.isFinite(paddingTop) ? paddingTop : DEFAULT_EDITOR_METRICS.paddingTop,
            })

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

        const nextScrollTop = Math.max((focusedLine - 2) * editorMetrics.lineHeight, 0)
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

    return (
        <>
            <div className="editor-toolbar">
                <div className="editor-metadata" aria-label="Code editor metadata">
                    <span className="language-badge">{language}</span>
                </div>

                <button className="secondary-button" disabled={!hasCode} onClick={handleCopy} type="button">
                    <Icon name={copied ? 'check' : 'copy'} />
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>

            <div className="code-editor">
                <textarea
                    aria-hidden="true"
                    className="line-number-gutter"
                    readOnly
                    ref={lineNumberRef}
                    style={{
                        paddingBottom: editorMetrics.paddingTop + editorMetrics.horizontalScrollbarHeight,
                    }}
                    tabIndex={-1}
                    value={lineNumbers}
                />

                {hasCode && (
                    <pre className="code-highlight" aria-hidden="true" ref={highlightRef}>
                        <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
                    </pre>
                )}

                <textarea
                    aria-label="Paste code for review"
                    className={`code-input ${hasCode ? 'has-code' : ''}`}
                    disabled={disabled}
                    ref={textareaRef}
                    onChange={(event) => {
                        onChange(event.target.value)
                        captureCursor(event.target)
                    }}
                    onClick={(event) => captureCursor(event.currentTarget)}
                    onFocus={(event) => captureCursor(event.currentTarget)}
                    onKeyUp={(event) => captureCursor(event.currentTarget)}
                    onSelect={(event) => captureCursor(event.currentTarget)}
                    onScroll={(event) => {
                        if (highlightRef.current) {
                            highlightRef.current.scrollTo({
                                left: event.currentTarget.scrollLeft,
                                top: event.currentTarget.scrollTop,
                            })
                        }

                        if (lineNumberRef.current) {
                            lineNumberRef.current.scrollTop = event.currentTarget.scrollTop
                        }
                    }}
                    placeholder="Paste your code here to get an AI review"
                    spellCheck={false}
                    value={code}
                    wrap="off"
                />
            </div>
        </>
    )
}
