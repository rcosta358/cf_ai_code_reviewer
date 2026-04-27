import type { ChangeEventHandler, KeyboardEventHandler, RefObject, UIEventHandler } from 'react'
import type { EditorMetrics } from '../services/editorService'

type CodeEditorInputProps = {
  code: string
  disabled: boolean
  editorMetrics: EditorMetrics
  hasCode: boolean
  highlightedCode: string
  highlightRef: RefObject<HTMLPreElement | null>
  lineNumberRef: RefObject<HTMLPreElement | null>
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
            <pre
                aria-hidden="true"
                className="line-number-gutter"
                ref={lineNumberRef}
                style={{
                    paddingBottom: editorMetrics.paddingTop + editorMetrics.horizontalScrollbarHeight,
                }}
                tabIndex={-1}
            >
                <code>{lineNumbers}</code>
            </pre>

            {hasCode && (
                <pre
                    className="code-highlight"
                    aria-hidden="true"
                    ref={highlightRef}
                    style={{
                        paddingBottom: editorMetrics.paddingTop + editorMetrics.horizontalScrollbarHeight,
                    }}
                >
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
                style={{
                    paddingBottom: editorMetrics.paddingTop + editorMetrics.horizontalScrollbarHeight,
                }}
                value={code}
                wrap="off"
            />
        </div>
    )
}
