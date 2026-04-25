import { useEffect, useRef, useState } from 'react'
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
  onCursorPositionChange: (cursorPosition: EditorCursorPosition) => void
  onChange: (code: string) => void
}

export function CodeEditor({ code, disabled = false, onChange, onCursorPositionChange }: CodeEditorProps) {
  const highlightRef = useRef<HTMLElement>(null)
  const lineNumberRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const { highlightedCode, language } = useCodeHighlight(code)
  const { captureCursor, cursorPosition } = useCursorPosition(code)
  const hasCode = code.length > 0
  const lineNumbers = Array.from({ length: code.split('\n').length }, (_, index) => index + 1)

  useEffect(() => {
    onCursorPositionChange(cursorPosition)
  }, [cursorPosition, onCursorPositionChange])

  const handleCopy = async () => {
    if (!code) {
      return
    }

    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
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
        <div className="line-number-gutter" ref={lineNumberRef} aria-hidden="true">
          {lineNumbers.map((lineNumber) => (
            <span key={lineNumber}>{lineNumber}</span>
          ))}
        </div>

        {hasCode && (
          <pre className="code-highlight" aria-hidden="true">
            <code ref={highlightRef} dangerouslySetInnerHTML={{ __html: highlightedCode }} />
          </pre>
        )}

        <textarea
          aria-label="Paste code for review"
          className={`code-input ${hasCode ? 'has-code' : ''}`}
          disabled={disabled}
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
              highlightRef.current.parentElement?.scrollTo({
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
