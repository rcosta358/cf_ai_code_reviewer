import { useCallback, useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import { CodeReviewWorkspace } from './components/CodeReviewWorkspace'
import { InsightPanel } from './components/InsightPanel'
import { SessionSidebar } from './components/SessionSidebar'
import {
    COLLAPSED_PANEL_WIDTH,
    LEFT_PANEL_DEFAULT_WIDTH,
    MAX_LEFT_PANEL_WIDTH,
    MAX_RIGHT_PANEL_WIDTH,
    MIN_LEFT_PANEL_WIDTH,
    MIN_RIGHT_PANEL_WIDTH,
    RIGHT_PANEL_DEFAULT_WIDTH,
} from './constants'
import { ReviewProvider } from './contexts/ReviewContext'
import { ThemeProvider } from './contexts/ThemeContext'

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

type AppStyleProps = CSSProperties & {
  '--left-panel-width': string
  '--right-panel-width': string
}

function App() {
    const [isLeftCollapsed, setIsLeftCollapsed] = useState(false)
    const [isRightCollapsed, setIsRightCollapsed] = useState(false)
    const [leftPanelWidth, setLeftPanelWidth] = useState(LEFT_PANEL_DEFAULT_WIDTH)
    const [rightPanelWidth, setRightPanelWidth] = useState(RIGHT_PANEL_DEFAULT_WIDTH)

    const startResize = useCallback(
        (panel: 'left' | 'right') => (event: PointerEvent<HTMLDivElement>) => {
            event.preventDefault()
            const pointerX = event.clientX
            const width = panel === 'left' ? leftPanelWidth : rightPanelWidth

            const handleResize = (moveEvent: globalThis.PointerEvent) => {
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
    const style: AppStyleProps = {
        '--left-panel-width': `${currentLeftPanelWidth}px`,
        '--right-panel-width': `${currentRightPanelWidth}px`,
    }

    return (
        <ThemeProvider>
            <ReviewProvider>
                <div className="app-shell" style={style}>
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
