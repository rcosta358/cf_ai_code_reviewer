type IconProps = {
  name:
    | 'check'
    | 'chevronLeft'
    | 'chevronRight'
    | 'copy'
    | 'loader'
    | 'message'
    | 'moon'
    | 'plus'
    | 'review'
    | 'send'
    | 'sun'
    | 'trash'
    | 'x'
}

export function Icon({ name }: IconProps) {
    return (
        <svg aria-hidden="true" className="icon" fill="none" height="20" viewBox="0 0 24 24" width="20">
            {name === 'sun' && (
                <>
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
                </>
            )}
            {name === 'moon' && <path d="M20 14.7A8.5 8.5 0 0 1 9.3 4 8.5 8.5 0 1 0 20 14.7Z" />}
            {name === 'plus' && <path d="M12 5v14M5 12h14" />}
            {name === 'copy' && <path d="M8 8h11v11H8zM5 16H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v1" />}
            {name === 'check' && <path d="m20 6-11 11-5-5" />}
            {name === 'chevronLeft' && <path d="m15 18-6-6 6-6" />}
            {name === 'chevronRight' && <path d="m9 18 6-6-6-6" />}
            {name === 'x' && <path d="M18 6 6 18M6 6l12 12" />}
            {name === 'loader' && <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />}
            {name === 'send' && <path d="m22 2-7 20-4-9-9-4 20-7ZM11 13l4-4" />}
            {name === 'review' && <path d="M9 11l2 2 4-5M20 12a8 8 0 1 1-3.1-6.3" />}
            {name === 'message' && <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />}
            {name === 'trash' && <path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 11v6M14 11v6" />}
        </svg>
    )
}
