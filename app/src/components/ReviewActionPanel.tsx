import { Icon } from './Icon'

type ReviewActionPanelProps = {
  canSubmit: boolean
  isGeneratingReview: boolean
  onCancel: () => void
  onSubmit: () => void
}

export function ReviewActionPanel({
    canSubmit,
    isGeneratingReview,
    onCancel,
    onSubmit,
}: ReviewActionPanelProps) {
    return (
        <div className="review-action-panel">
            <button className="primary-button" disabled={!canSubmit} onClick={onSubmit} type="button">
                <span className={isGeneratingReview ? 'spinner-icon' : ''}>
                    {isGeneratingReview ? <Icon name="loader" /> : <span aria-hidden="true" className="sparkle-emoji">✨</span>}
                </span>
                {isGeneratingReview ? 'Reviewing...' : 'Start Review'}
            </button>

            {isGeneratingReview && (
                <button className="secondary-button cancel-button" onClick={onCancel} type="button">
                    <Icon name="x" />
                    Cancel
                </button>
            )}
        </div>
    )
}
