import { useReview } from '../hooks/useReview'
import { Icon } from './Icon'

const formatSessionTime = (value: string) =>
    new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        day: 'numeric',
    }).format(new Date(value))

type SessionSidebarProps = {
    isCollapsed: boolean
    onToggleCollapse: () => void
}

export function SessionSidebar({ isCollapsed, onToggleCollapse }: SessionSidebarProps) {
    const { activeSession, createSession, deleteSession, isGeneratingReview, selectSession, sessions } = useReview()

    return (
        <aside className={`sidebar session-sidebar ${isCollapsed ? 'is-collapsed' : ''}`} aria-label="Review sessions">
            <div className="panel-header">
                <div className="panel-title">
                    <p className="eyebrow">Sessions</p>
                    <h2>Reviews</h2>
                </div>
                <div className="panel-header-actions">
                    {!isCollapsed && (
                        <button aria-label="Create review session" className="icon-button" onClick={createSession} type="button">
                            <Icon name="plus" />
                        </button>
                    )}
                    <button
                        aria-label={isCollapsed ? 'Expand sessions panel' : 'Collapse sessions panel'}
                        className="icon-button collapse-toggle"
                        onClick={onToggleCollapse}
                        type="button"
                    >
                        <Icon name={isCollapsed ? 'chevronRight' : 'chevronLeft'} />
                    </button>
                </div>
            </div>

            {!isCollapsed && <div className="session-list">
                {sessions.map((session) => (
                    <div
                        className={`session-item ${session.id === activeSession.id ? 'is-active' : ''}`}
                        key={session.id}
                    >
                        <button className="session-select-button" onClick={() => selectSession(session.id)} type="button">
                            <span className="session-title">{session.title}</span>
                            <span className="session-meta">
                                {session.result ? 'Reviewed' : 'Draft'} · {formatSessionTime(session.updatedAt)}
                            </span>
                        </button>
                        <button
                            aria-label={`Delete ${session.title}`}
                            className="icon-button session-delete-button"
                            disabled={isGeneratingReview}
                            onClick={() => deleteSession(session.id)}
                            type="button"
                        >
                            <Icon name="trash" />
                        </button>
                    </div>
                ))}
            </div>}
        </aside>
    )
}
