import type { ChangeEventHandler, KeyboardEventHandler, RefObject, UIEventHandler } from 'react'
import type { EditorMetrics } from '../services/editorService'

type CodeEditorInputProps = {
  code: string
  disabled: boolean
  editorMetrics: EditorMetrics
  hasCode: boolean
  highlightedCode: string
  highlightRef: RefObject<HTMLPreElement | null>
  lineNumberRef: RefObject<HTMLTextAreaElement | null>
  lineNumbers: string
  onChange: ChangeEventHandler<HTMLTextAreaElement>
  onCursorCapture: (element: HTMLTextAreaElement) => void
  onKeyDown: KeyboardEventHandler<HTMLTextAreaElement>
  onScroll: UIEventHandler<HTMLTextAreaElement>
  textareaRef: RefObject<HTMLTextAreaElement | null>
}

export function CodeEditorInput({
    code,
    disabled,
    editorMetrics,
    hasCode,
    highlightedCode,
    highlightRef,
    lineNumberRef,
    lineNumbers,
    onChange,
    onCursorCapture,
    onKeyDown,
    onScroll,
    textareaRef,
}: CodeEditorInputProps) {
    return (
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
                onChange={onChange}
                onClick={(event) => onCursorCapture(event.currentTarget)}
                onFocus={(event) => onCursorCapture(event.currentTarget)}
                onKeyDown={onKeyDown}
                onKeyUp={(event) => onCursorCapture(event.currentTarget)}
                onSelect={(event) => onCursorCapture(event.currentTarget)}
                onScroll={onScroll}
                placeholder="Paste your code here to get an AI review"
                spellCheck={false}
                value={code}
                wrap="off"
            />
        </div>
    )
}
