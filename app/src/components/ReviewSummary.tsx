import { Icon } from './Icon'
import { InlineFormattedText } from './InlineFormattedText'

type ReviewSummaryProps = {
  copied: boolean
  issueCount: number
  onCopyIssues: () => void
  score: number
  summary: string
}

export function ReviewSummary({
    copied,
    issueCount,
    onCopyIssues,
    score,
    summary,
}: ReviewSummaryProps) {
    return (
        <section className="review-summary" aria-label="Review summary">
            <div className="summary-grid">
                <div>
                    <span className="summary-value">{issueCount}</span>
                    <span className="summary-label">Issues</span>
                </div>
                <div>
                    <span className="summary-value">{score}/10</span>
                    <span className="summary-label">Score</span>
                </div>
            </div>

            <div className="agent-summary">
                <p>
                    <InlineFormattedText text={summary} />
                </p>
                <button className="secondary-button" onClick={onCopyIssues} type="button">
                    <Icon name={copied ? 'check' : 'copy'} />
                    {copied ? 'Copied' : 'Copy issues'}
                </button>
            </div>
        </section>
    )
}
