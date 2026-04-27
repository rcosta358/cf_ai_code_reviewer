import { REVIEW_CATEGORY_LABELS } from '../constants'
import { getSeverityClassName } from '../services/reviewIssueService'
import type { ReviewIssue } from '../types/review'
import { Icon } from './Icon'
import { InlineFormattedText } from './InlineFormattedText'

type ReviewIssueListProps = {
  copiedId: string | null
  issues: ReviewIssue[]
  onCopyIssue: (issue: ReviewIssue) => void
  onDismissIssue: (issueId: string) => void
  onFocusSourceLine: (line: number) => void
}

export function ReviewIssueList({
    copiedId,
    issues,
    onCopyIssue,
    onDismissIssue,
    onFocusSourceLine,
}: ReviewIssueListProps) {
    return (
        <section className="issue-list" aria-label="Review issues">
            {issues.length === 0 && (
                <div className="empty-state compact-empty">
                    <h3>No issues</h3>
                    <p>Try changing the filters to see more results.</p>
                </div>
            )}

            {issues.map((issue) => (
                <ReviewIssueCard
                    copied={copiedId === issue.id}
                    issue={issue}
                    key={issue.id}
                    onCopyIssue={onCopyIssue}
                    onDismissIssue={onDismissIssue}
                    onFocusSourceLine={onFocusSourceLine}
                />
            ))}
        </section>
    )
}

type ReviewIssueCardProps = {
  copied: boolean
  issue: ReviewIssue
  onCopyIssue: (issue: ReviewIssue) => void
  onDismissIssue: (issueId: string) => void
  onFocusSourceLine: (line: number) => void
}

function ReviewIssueCard({
    copied,
    issue,
    onCopyIssue,
    onDismissIssue,
    onFocusSourceLine,
}: ReviewIssueCardProps) {
    return (
        <article
            className={`issue-card category-border-${issue.category}`}
            onClick={() => issue.line && onFocusSourceLine(issue.line)}
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
                <span>{issue.confidence} confidence</span>
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
                        onCopyIssue(issue)
                    }}
                    type="button"
                >
                    <Icon name={copied ? 'check' : 'copy'} />
                    {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                    className="secondary-button"
                    onClick={(event) => {
                        event.stopPropagation()
                        onDismissIssue(issue.id)
                    }}
                    type="button"
                >
                    Dismiss
                </button>
            </div>
        </article>
    )
}
