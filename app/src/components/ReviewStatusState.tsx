type ReviewStatusStateProps = {
  description: string
  title: string
  tone: string
}

export function ReviewStatusState({ description, title, tone }: ReviewStatusStateProps) {
    return (
        <div className="empty-state">
            <span className="status-pill">{tone}</span>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    )
}
