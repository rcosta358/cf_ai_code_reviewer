import { useReview } from '../hooks/useReview'
import { Icon } from './Icon'
import { ThemeToggle } from './ThemeToggle'

export function CodeReviewWorkspace() {
  const { activeSession, submitReview, updateCode } = useReview()
  const canSubmit = activeSession.code.trim().length > 0

  return (
    <main className="workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">AI Code Reviewer</p>
          <h1>Paste code. Get a focused review.</h1>
        </div>
        <ThemeToggle />
      </header>

      <section className="editor-shell" aria-label="Code input">
        <div className="editor-toolbar">
          <span>Source code</span>
          <span>{activeSession.code.length.toLocaleString()} chars</span>
        </div>

        <textarea
          aria-label="Paste code for review"
          className="code-input"
          onChange={(event) => updateCode(event.target.value)}
          placeholder="Paste a function, component, diff, or file here..."
          spellCheck={false}
          value={activeSession.code}
        />

        <div className="editor-actions">
          <p>{activeSession.reviewResult ? 'Latest review is saved in this session.' : 'Each session keeps its own code and review state.'}</p>
          <button className="primary-button" disabled={!canSubmit} onClick={submitReview} type="button">
            <Icon name="send" />
            Generate review
          </button>
        </div>
      </section>
    </main>
  )
}
