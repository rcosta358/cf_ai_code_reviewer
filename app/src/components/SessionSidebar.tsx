import { useReview } from '../hooks/useReview'
import { Icon } from './Icon'

const formatSessionTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))

export function SessionSidebar() {
  const { activeSession, createSession, selectSession, sessions } = useReview()

  return (
    <aside className="sidebar session-sidebar" aria-label="Review sessions">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Sessions</p>
          <h2>Reviews</h2>
        </div>
        <button aria-label="Create review session" className="icon-button" onClick={createSession} type="button">
          <Icon name="plus" />
        </button>
      </div>

      <div className="session-list">
        {sessions.map((session) => (
          <button
            className={`session-item ${session.id === activeSession.id ? 'is-active' : ''}`}
            key={session.id}
            onClick={() => selectSession(session.id)}
            type="button"
          >
            <span className="session-title">{session.title}</span>
            <span className="session-meta">
              {session.reviewResult ? 'Reviewed' : 'Draft'} · {formatSessionTime(session.updatedAt)}
            </span>
          </button>
        ))}
      </div>
    </aside>
  )
}
