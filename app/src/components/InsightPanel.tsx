import { useState } from 'react'
import type { RightPanelView } from '../types/review'
import { Chat } from './Chat'
import { Icon } from './Icon'
import { ReviewResultsPanel } from './ReviewResultsPanel'

const views: Array<{ id: RightPanelView; label: string; icon: 'message' | 'review' }> = [
    { id: 'review', label: 'Review', icon: 'review' },
    { id: 'chat', label: 'Chat', icon: 'message' },
]

type InsightPanelProps = {
    isCollapsed: boolean
    onToggleCollapse: () => void
}

export function InsightPanel({ isCollapsed, onToggleCollapse }: InsightPanelProps) {
    const [activeView, setActiveView] = useState<RightPanelView>('review')

    return (
        <aside className={`sidebar insight-panel ${isCollapsed ? 'is-collapsed' : ''}`} aria-label="Review details">
            <div className="panel-header">
                <div className="panel-title">
                    <p className="eyebrow">Review</p>
                    <h2>Actions</h2>
                </div>
                <button
                    aria-label={isCollapsed ? 'Expand review panel' : 'Collapse review panel'}
                    className="icon-button collapse-toggle"
                    onClick={onToggleCollapse}
                    type="button"
                >
                    <Icon name={isCollapsed ? 'chevronLeft' : 'chevronRight'} />
                </button>
            </div>

            {!isCollapsed && <div className="view-tabs" role="tablist" aria-label="Review detail views">
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
            </div>}

            {!isCollapsed && <div className={`insight-content insight-content-${activeView}`}>
                {activeView === 'review' && <ReviewResultsPanel />}

                {activeView === 'chat' && <Chat />}

            </div>}
        </aside>
    )
}
