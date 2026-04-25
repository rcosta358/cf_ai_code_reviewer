import { useState } from 'react'
import { useReview } from '../hooks/useReview'
import type { RightPanelView } from '../types/review'
import { Icon } from './Icon'

const views: Array<{ id: RightPanelView; label: string; icon: 'history' | 'message' | 'review' }> = [
  { id: 'review', label: 'Review', icon: 'review' },
  { id: 'chat', label: 'Chat', icon: 'message' },
  { id: 'history', label: 'History', icon: 'history' },
]

export function InsightPanel() {
  const { activeSession, submitReview } = useReview()
  const [activeView, setActiveView] = useState<RightPanelView>('review')
  const review = activeSession.reviewResult
  const canSubmit = activeSession.code.trim().length > 0

  const handleSubmitReview = () => {
    submitReview()
    setActiveView('review')
  }

  return (
    <aside className="sidebar insight-panel" aria-label="Review details">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Review</p>
          <h2>Actions</h2>
        </div>
      </div>

      <div className="view-tabs" role="tablist" aria-label="Review detail views">
        {views.map((view) => (
          <button
            aria-selected={activeView === view.id}
            className={activeView === view.id ? 'is-active' : ''}
            key={view.id}
            onClick={() => setActiveView(view.id)}
            role="tab"
            type="button"
          >
            <Icon name={view.icon} />
            {view.label}
          </button>
        ))}
      </div>

      <div className="insight-content">
        {activeView === 'review' && (
          <div className="review-action-panel">
            <button className="primary-button" disabled={!canSubmit} onClick={handleSubmitReview} type="button">
              <Icon name="send" />
              Generate review
            </button>

            <div className="empty-state">
              <span className="status-pill">{review ? `${review.score}/100` : 'Pending'}</span>
              <h3>{review ? 'Review captured' : 'No review yet'}</h3>
              <p>{review ? review.summary : 'Generated review results will appear here with severity, line, and suggestion details.'}</p>
            </div>
          </div>
        )}

        {activeView === 'chat' && (
          <div className="empty-state">
            <span className="status-pill">Soon</span>
            <h3>Follow-up chat</h3>
            <p>Ask clarifying questions or request revised suggestions after a review is generated.</p>
          </div>
        )}

        {activeView === 'history' && (
          <div className="empty-state">
            <span className="status-pill">Soon</span>
            <h3>Review history</h3>
            <p>Past results for this session will be listed here once persistence is connected.</p>
          </div>
        )}
      </div>
    </aside>
  )
}
