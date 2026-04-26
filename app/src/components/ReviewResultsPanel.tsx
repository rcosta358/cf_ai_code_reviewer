import { useMemo, useState } from 'react'
import {
    COPY_FEEDBACK_DURATION_MS,
    HIGH_CONFIDENCE_THRESHOLD,
    ISSUE_LEVEL_LABELS,
    MEDIUM_CONFIDENCE_THRESHOLD,
    REVIEW_CATEGORY_LABELS,
    REVIEW_CATEGORY_ORDER,
} from '../constants'
import type { IssueLevelFilter } from '../constants'
import { useReview } from '../hooks/useReview'
import type { ReviewCategory, ReviewIssue, ReviewSeverity } from '../types/review'
import { renderInlineHtml } from '../utils'
import { Icon } from './Icon'

const getConfidenceLabel = (confidence: number) => {
    if (confidence >= HIGH_CONFIDENCE_THRESHOLD) {
        return 'High'
    }

    if (confidence >= MEDIUM_CONFIDENCE_THRESHOLD) {
        return 'Medium'
    }

    return 'Low'
}

const matchesConfidence = (issue: ReviewIssue, filter: IssueLevelFilter) => {
    if (filter === 'all') {
        return true
    }

    const label = getConfidenceLabel(issue.confidence).toLowerCase()
    return label === filter
}

const compareIssuesByLine = (first: ReviewIssue, second: ReviewIssue) =>
    (first.line ?? Number.POSITIVE_INFINITY) - (second.line ?? Number.POSITIVE_INFINITY)

const formatIssueForCopy = (issue: ReviewIssue) =>
    [
        `${REVIEW_CATEGORY_LABELS[issue.category]} / ${issue.severity.toUpperCase()} / ${getConfidenceLabel(issue.confidence)} confidence`,
        issue.line ? `Line ${issue.line}` : 'Line not provided',
        issue.title,
        issue.description,
        `Suggested fix: ${issue.suggestion}`,
    ].join('\n')

const formatIssuesForCopy = (issues: ReviewIssue[]) =>
    issues.length > 0
        ? issues.map((issue, index) => `Issue ${index + 1}\n${formatIssueForCopy(issue)}`).join('\n\n')
        : 'No issues found.'

const getSeverityClassName = (severity: ReviewSeverity) => `severity-${severity}`

function InlineFormattedText({ text }: { text: string }) {
    return <>{renderInlineHtml(text)}</>
}

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
    const visibleIssues = useMemo(() => review?.issues.filter((issue) => !issue.dismissed).toSorted(compareIssuesByLine) ?? [], [review])
    const canSubmit = activeSession.code.trim().length > 0 && !isGeneratingReview

    const categoryCounts = useMemo(
        () =>
            REVIEW_CATEGORY_ORDER.reduce<Record<ReviewCategory, number>>(
                (counts, category) => ({
                    ...counts,
                    [category]: visibleIssues.filter((issue) => issue.category === category).length,
                }),
                {
                    correctness: 0,
                    security: 0,
                    performance: 0,
                    maintability: 0,
                    style: 0,
                    documentation: 0,
                    other: 0,
                },
            ),
        [visibleIssues],
    )

    const filteredIssues = visibleIssues.filter((issue) => {
        const categoryMatches = activeCategory === 'all' || issue.category === activeCategory
        const severityMatches = severityFilter === 'all' || issue.severity === severityFilter
        return categoryMatches && severityMatches && matchesConfidence(issue, confidenceFilter)
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
            <div className="review-action-panel">
                <button className="primary-button" disabled={!canSubmit} onClick={handleSubmitReview} type="button">
                    <span className={isGeneratingReview ? 'spinner-icon' : ''}>
                        {isGeneratingReview ? <Icon name="loader" /> : <span aria-hidden="true" className="sparkle-emoji">✨</span>}
                    </span>
                    {isGeneratingReview ? 'Reviewing...' : 'Start Review'}
                </button>

                {isGeneratingReview && (
                    <button className="secondary-button cancel-button" onClick={cancelReview} type="button">
                        <Icon name="x" />
            Cancel
                    </button>
                )}
            </div>

            {generationMessage && (
                <p className={`review-message review-message-${generationMessage.tone}`} role="status">
                    {generationMessage.text}
                </p>
            )}

            {!review && !isGeneratingReview && (
                <div className="empty-state">
                    <span className="status-pill">Pending</span>
                    <h3>No review yet</h3>
                    <p>Ask for a code review to look for potential issues and suggestions for a code snippet.</p>
                </div>
            )}

            {isGeneratingReview && (
                <div className="empty-state">
                    <span className="status-pill">Running</span>
                    <h3>Generating review</h3>
                    <p>Analyzing this snippet now. You can cancel the request if you need to edit the code.</p>
                </div>
            )}

            {review && !isGeneratingReview && (
                <>
                    <section className="review-summary" aria-label="Review summary">
                        <div className="summary-grid">
                            <div>
                                <span className="summary-value">{visibleIssues.length}</span>
                                <span className="summary-label">Issues</span>
                            </div>
                            <div>
                                <span className="summary-value">{review.score}/10</span>
                                <span className="summary-label">Score</span>
                            </div>
                        </div>

                        <div className="agent-summary">
                            <p>
                                <InlineFormattedText text={review.summary} />
                            </p>
                            <button className="secondary-button" onClick={handleCopyIssues} type="button">
                                <Icon name={copiedId === 'summary' ? 'check' : 'copy'} />
                                {copiedId === 'summary' ? 'Copied' : 'Copy issues'}
                            </button>
                        </div>
                    </section>

                    <section className="review-filters" aria-label="Review filters">
                        <label>
              Severity
                            <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value as IssueLevelFilter)}>
                                {Object.entries(ISSUE_LEVEL_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
              Confidence
                            <select
                                value={confidenceFilter}
                                onChange={(event) => setConfidenceFilter(event.target.value as IssueLevelFilter)}
                            >
                                {Object.entries(ISSUE_LEVEL_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </section>

                    <section className="category-filter" aria-label="Issue categories">
                        <button
                            className={`category-chip category-all ${activeCategory === 'all' ? 'is-active' : ''}`}
                            onClick={() => setActiveCategory('all')}
                            type="button"
                        >
              All <span>{visibleIssues.length}</span>
                        </button>
                        {REVIEW_CATEGORY_ORDER.map((category) => (
                            <button
                                className={`category-chip category-${category} ${activeCategory === category ? 'is-active' : ''}`}
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                type="button"
                            >
                                {REVIEW_CATEGORY_LABELS[category]} <span>{categoryCounts[category]}</span>
                            </button>
                        ))}
                    </section>

                    <section className="issue-list" aria-label="Review issues">
                        {filteredIssues.length === 0 && (
                            <div className="empty-state compact-empty">
                                <h3>No issues</h3>
                                <p>Try changing the filters to see more results.</p>
                            </div>
                        )}

                        {filteredIssues.map((issue) => (
                            <article
                                className={`issue-card category-border-${issue.category}`}
                                key={issue.id}
                                onClick={() => issue.line && focusSourceLine(issue.line)}
                            >
                                <div className="issue-card-header">
                                    <div>
                                        <span className={`category-dot category-bg-${issue.category}`} />
                                        <span>{REVIEW_CATEGORY_LABELS[issue.category]}</span>
                                    </div>
                                    <span className={`severity-pill ${getSeverityClassName(issue.severity)}`}>{issue.severity}</span>
                                </div>

                                <h3>
                                    <InlineFormattedText text={issue.title} />
                                </h3>
                                <p>
                                    <InlineFormattedText text={issue.description} />
                                </p>

                                <div className="issue-meta">
                                    <span>{issue.line ? `Line ${issue.line}` : 'No line'}</span>
                                    <span>{getConfidenceLabel(issue.confidence)} confidence</span>
                                </div>

                                <div className="issue-suggestion">
                                    <strong>Suggested fix</strong>
                                    <p>
                                        <InlineFormattedText text={issue.suggestion} />
                                    </p>
                                </div>

                                <div className="issue-actions">
                                    <button
                                        className="secondary-button"
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            handleCopyIssue(issue)
                                        }}
                                        type="button"
                                    >
                                        <Icon name={copiedId === issue.id ? 'check' : 'copy'} />
                                        {copiedId === issue.id ? 'Copied' : 'Copy'}
                                    </button>
                                    <button
                                        className="secondary-button"
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            dismissIssue(issue.id)
                                        }}
                                        type="button"
                                    >
                    Dismiss
                                    </button>
                                </div>
                            </article>
                        ))}
                    </section>
                </>
            )}
        </div>
    )
}
