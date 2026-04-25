import { useCallback, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import { CodeReviewWorkspace } from './components/CodeReviewWorkspace'
import { InsightPanel } from './components/InsightPanel'
import { SessionSidebar } from './components/SessionSidebar'
import { ReviewProvider } from './contexts/ReviewContext'
import { ThemeProvider } from './contexts/ThemeContext'

const LEFT_PANEL_DEFAULT_WIDTH = 280
const RIGHT_PANEL_DEFAULT_WIDTH = 340
const COLLAPSED_PANEL_WIDTH = 58
const MIN_LEFT_PANEL_WIDTH = 220
const MAX_LEFT_PANEL_WIDTH = 420
const MIN_RIGHT_PANEL_WIDTH = 280
const MAX_RIGHT_PANEL_WIDTH = 560

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

function App() {
    const [isLeftCollapsed, setIsLeftCollapsed] = useState(false)
    const [isRightCollapsed, setIsRightCollapsed] = useState(false)
    const [leftPanelWidth, setLeftPanelWidth] = useState(LEFT_PANEL_DEFAULT_WIDTH)
    const [rightPanelWidth, setRightPanelWidth] = useState(RIGHT_PANEL_DEFAULT_WIDTH)

    const startResize = useCallback(
        (panel: 'left' | 'right') => (event: ReactPointerEvent<HTMLDivElement>) => {
            event.preventDefault()
            const pointerX = event.clientX
            const width = panel === 'left' ? leftPanelWidth : rightPanelWidth

            const handleResize = (moveEvent: PointerEvent) => {
                const delta = moveEvent.clientX - pointerX

                if (panel === 'left') {
                    setLeftPanelWidth(clamp(width + delta, MIN_LEFT_PANEL_WIDTH, MAX_LEFT_PANEL_WIDTH))
                    return
                }

                setRightPanelWidth(clamp(width - delta, MIN_RIGHT_PANEL_WIDTH, MAX_RIGHT_PANEL_WIDTH))
            }

            const finishResize = () => {
                document.body.classList.remove('is-resizing-panel')
                window.removeEventListener('pointermove', handleResize)
                window.removeEventListener('pointerup', finishResize)
                window.removeEventListener('pointercancel', finishResize)
            }

            document.body.classList.add('is-resizing-panel')
            window.addEventListener('pointermove', handleResize)
            window.addEventListener('pointerup', finishResize)
            window.addEventListener('pointercancel', finishResize)
        },
        [leftPanelWidth, rightPanelWidth],
    )

    const currentLeftPanelWidth = isLeftCollapsed ? COLLAPSED_PANEL_WIDTH : leftPanelWidth
    const currentRightPanelWidth = isRightCollapsed ? COLLAPSED_PANEL_WIDTH : rightPanelWidth
    const shellStyle = {
        '--left-panel-width': `${currentLeftPanelWidth}px`,
        '--right-panel-width': `${currentRightPanelWidth}px`,
    } as CSSProperties

    return (
        <ThemeProvider>
            <ReviewProvider>
                <div className="app-shell" style={shellStyle}>
                    <SessionSidebar isCollapsed={isLeftCollapsed} onToggleCollapse={() => setIsLeftCollapsed((value) => !value)} />
                    {!isLeftCollapsed && (
                        <div
                            aria-label="Resize sessions panel"
                            className="panel-resize-handle panel-resize-handle-left"
                            onPointerDown={startResize('left')}
                            role="separator"
                        />
                    )}
                    <CodeReviewWorkspace />
                    {!isRightCollapsed && (
                        <div
                            aria-label="Resize review panel"
                            className="panel-resize-handle panel-resize-handle-right"
                            onPointerDown={startResize('right')}
                            role="separator"
                        />
                    )}
                    <InsightPanel isCollapsed={isRightCollapsed} onToggleCollapse={() => setIsRightCollapsed((value) => !value)} />
                </div>
            </ReviewProvider>
        </ThemeProvider>
    )
}

export default App
