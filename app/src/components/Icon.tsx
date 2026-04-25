type IconProps = {
  name: 'history' | 'message' | 'moon' | 'plus' | 'review' | 'send' | 'sun'
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
      {name === 'send' && <path d="m22 2-7 20-4-9-9-4 20-7ZM11 13l4-4" />}
      {name === 'review' && <path d="M9 11l2 2 4-5M20 12a8 8 0 1 1-3.1-6.3" />}
      {name === 'message' && <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />}
      {name === 'history' && <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v6l4 2" />}
    </svg>
  )
}
