import { useCallback, useMemo, useState } from 'react'
import { useReview } from '../hooks/useReview'
import { CodeEditor } from './CodeEditor'
import type { EditorCursorPosition } from './CodeEditor'
import { CODE_EXAMPLES } from '../services/exampleService'
import { ThemeToggle } from './ThemeToggle'
import { REVIEW_MODEL } from '../constants'

export function CodeReviewWorkspace() {
    const { activeSession, focusedSourceLine, isGeneratingReview, updateCode } = useReview()
    const [cursorPosition, setCursorPosition] = useState<EditorCursorPosition>({ column: 1, line: 1 })
    const selectedExampleId = useMemo(
        () => CODE_EXAMPLES.find((example) => example.code === activeSession.code)?.id ?? '',
        [activeSession.code],
    )
    const handleCursorPositionChange = useCallback((nextCursorPosition: EditorCursorPosition) => {
        setCursorPosition((currentCursorPosition) =>
            currentCursorPosition.line === nextCursorPosition.line && currentCursorPosition.column === nextCursorPosition.column
                ? currentCursorPosition
                : nextCursorPosition,
        )
    }, [])

    return (
        <main className="workspace">
            <header className="workspace-header">
                <div>
                    <p className="eyebrow">Workspace</p>
                    <h1>AI Code Reviewer</h1>
                </div>
                <ThemeToggle />
            </header>

            <section className="editor-shell" aria-label="Code input">
                <CodeEditor
                    code={activeSession.code}
                    disabled={isGeneratingReview}
                    exampleOptions={CODE_EXAMPLES}
                    focusedLine={focusedSourceLine}
                    onChange={updateCode}
                    onCursorPositionChange={handleCursorPositionChange}
                    onSelectExample={updateCode}
                    selectedExampleId={selectedExampleId}
                />
                <div className="editor-actions">
                    <p>{REVIEW_MODEL}</p>
                    <span className="cursor-position">
            Ln {cursorPosition.line}, Col {cursorPosition.column}
                    </span>
                </div>
            </section>
        </main>
    )
}
