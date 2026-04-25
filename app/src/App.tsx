import { CodeReviewWorkspace } from './components/CodeReviewWorkspace'
import { InsightPanel } from './components/InsightPanel'
import { SessionSidebar } from './components/SessionSidebar'
import { ReviewProvider } from './contexts/ReviewContext'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
    return (
        <ThemeProvider>
            <ReviewProvider>
                <div className="app-shell">
                    <SessionSidebar />
                    <CodeReviewWorkspace />
                    <InsightPanel />
                </div>
            </ReviewProvider>
        </ThemeProvider>
    )
}

export default App
