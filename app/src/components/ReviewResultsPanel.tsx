import { useMemo, useState } from 'react'
import { COPY_FEEDBACK_DURATION_MS } from '../constants'
import type { IssueLevelFilter } from '../constants'
import { useReview } from '../hooks/useReview'
import {
    formatIssueForCopy,
    formatIssuesForCopy,
    getCategoryCounts,
    getFilteredIssues,
    getVisibleIssues,
} from '../services/reviewIssueService'
import type { ReviewCategory, ReviewIssue } from '../types/review'
import { ReviewActionPanel } from './ReviewActionPanel'
import { ReviewCategoryFilter } from './ReviewCategoryFilter'
import { ReviewFilters } from './ReviewFilters'
import { ReviewIssueList } from './ReviewIssueList'
import { ReviewStatusState } from './ReviewStatusState'
import { ReviewSummary } from './ReviewSummary'

export function ReviewResultsPanel() {
    const {
        activeSession,
        cancelReview,
        dismissIssue,
        focusSourceLine,
        generationMessage,
        isGeneratingReview,
        submitReview,
    } = useReview()
    const [activeCategory, setActiveCategory] = useState<ReviewCategory | 'all'>('all')
    const [confidenceFilter, setConfidenceFilter] = useState<IssueLevelFilter>('all')
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [severityFilter, setSeverityFilter] = useState<IssueLevelFilter>('all')

    const review = activeSession.result
    const visibleIssues = useMemo(() => getVisibleIssues(review?.issues), [review])
    const canSubmit = activeSession.code.trim().length > 0 && !isGeneratingReview

    const categoryCounts = useMemo(() => getCategoryCounts(visibleIssues), [visibleIssues])

    const filteredIssues = getFilteredIssues(visibleIssues, {
        category: activeCategory,
        confidence: confidenceFilter,
        severity: severityFilter,
    })

    const handleSubmitReview = () => {
        submitReview()
    }

    const handleCopyIssues = async () => {
        if (!review) {
            return
        }

        await navigator.clipboard.writeText(formatIssuesForCopy(visibleIssues))
        setCopiedId('summary')
        window.setTimeout(() => setCopiedId(null), COPY_FEEDBACK_DURATION_MS)
    }

    const handleCopyIssue = async (issue: ReviewIssue) => {
        await navigator.clipboard.writeText(formatIssueForCopy(issue))
        setCopiedId(issue.id)
        window.setTimeout(() => setCopiedId(null), COPY_FEEDBACK_DURATION_MS)
    }

    return (
        <div className="review-results-panel">
            <ReviewActionPanel
                canSubmit={canSubmit}
                isGeneratingReview={isGeneratingReview}
                onCancel={cancelReview}
                onSubmit={handleSubmitReview}
            />

            {generationMessage && (
                <p className={`review-message review-message-${generationMessage.tone}`} role="status">
                    {generationMessage.text}
                </p>
            )}

            {!review && !isGeneratingReview && (
                <ReviewStatusState
                    description="Ask for a code review to look for potential issues and suggestions for a code snippet."
                    title="No review yet"
                    tone="Pending"
                />
            )}

            {isGeneratingReview && (
                <ReviewStatusState
                    description="Analyzing this snippet now. You can cancel the request if you need to edit the code."
                    title="Generating review"
                    tone="Running"
                />
            )}

            {review && !isGeneratingReview && (
                <>
                    <ReviewSummary
                        copied={copiedId === 'summary'}
                        issueCount={visibleIssues.length}
                        onCopyIssues={handleCopyIssues}
                        score={review.score}
                        summary={review.summary}
                    />

                    <ReviewFilters
                        confidenceFilter={confidenceFilter}
                        onConfidenceFilterChange={setConfidenceFilter}
                        onSeverityFilterChange={setSeverityFilter}
                        severityFilter={severityFilter}
                    />

                    <ReviewCategoryFilter
                        activeCategory={activeCategory}
                        categoryCounts={categoryCounts}
                        onCategoryChange={setActiveCategory}
                        totalIssueCount={visibleIssues.length}
                    />

                    <ReviewIssueList
                        copiedId={copiedId}
                        issues={filteredIssues}
                        onCopyIssue={handleCopyIssue}
                        onDismissIssue={dismissIssue}
                        onFocusSourceLine={focusSourceLine}
                    />
                </>
            )}
        </div>
    )
}
