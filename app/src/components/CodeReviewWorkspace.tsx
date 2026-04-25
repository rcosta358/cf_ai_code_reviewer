import { useCallback, useState } from 'react'
import { useReview } from '../hooks/useReview'
import { CodeEditor } from './CodeEditor'
import type { EditorCursorPosition } from './CodeEditor'
import { ThemeToggle } from './ThemeToggle'

export function CodeReviewWorkspace() {
  const { activeSession, isGeneratingReview, updateCode } = useReview()
  const [cursorPosition, setCursorPosition] = useState<EditorCursorPosition>({ column: 1, line: 1 })
  const handleCursorPositionChange = useCallback((nextCursorPosition: EditorCursorPosition) => {
    setCursorPosition(nextCursorPosition)
  }, [])

  return (
    <main className="workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>AI Code Review</h1>
        </div>
        <ThemeToggle />
      </header>

      <section className="editor-shell" aria-label="Code input">
        <CodeEditor
          code={activeSession.code}
          disabled={isGeneratingReview}
          onChange={updateCode}
          onCursorPositionChange={handleCursorPositionChange}
        />
        <div className="editor-actions">
          <p>{activeSession.reviewResult ? 'Latest review is saved in this session.' : 'Each session keeps its own code and review state.'}</p>
          <span className="cursor-position">
            Ln {cursorPosition.line}, Col {cursorPosition.column}
          </span>
        </div>
      </section>
    </main>
  )
}
