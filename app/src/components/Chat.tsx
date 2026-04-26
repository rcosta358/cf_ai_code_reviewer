import { useState } from 'react'
import type { FormEvent } from 'react'
import { useReview } from '../hooks/useReview'
import { Icon } from './Icon'
import { InlineFormattedText } from './InlineFormattedText'

export function Chat() {
    const { activeSession, isGeneratingReview, submitFollowUp } = useReview()
    const [prompt, setPrompt] = useState('')
    const hasReview = Boolean(activeSession.result)
    const canSubmit = hasReview && prompt.trim().length > 0 && !isGeneratingReview

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!canSubmit) {
            return
        }

        submitFollowUp(prompt)
        setPrompt('')
    }

    if (!hasReview) {
        return (
            <div className="empty-state">
                <span className="status-pill">Disabled</span>
                <h3>Follow-up chat</h3>
                <p>Ask clarifying questions or request revised suggestions after a review is generated.</p>
            </div>
        )
    }

    return (
        <div className="follow-up-chat">
            <div className="chat-thread" aria-label="Follow-up conversation">
                {activeSession.chatMessages.length === 0 && (
                    <div className="empty-state compact-empty">
                        <span className="status-pill">Ready</span>
                        <p>Ask clarifying questions or request revised suggestions about the latest review.</p>
                    </div>
                )}

                {activeSession.chatMessages.map((message) => (
                    <article className={`chat-message chat-message-${message.role}`} key={message.id}>
                        <strong>{message.role === 'user' ? 'You' : 'Reviewer'}</strong>
                        <p><InlineFormattedText text={message.text} /></p>
                    </article>
                ))}
            </div>

            <form className="chat-composer" onSubmit={handleSubmit}>
                <label htmlFor="follow-up-prompt">Prompt</label>
                <textarea
                    disabled={isGeneratingReview}
                    id="follow-up-prompt"
                    onChange={(event) => setPrompt(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault()
                            event.currentTarget.form?.requestSubmit()
                        }
                    }}
                    placeholder="Ask a question or clarify code context..."
                    rows={4}
                    value={prompt}
                />
                <button className="primary-button" disabled={!canSubmit} type="submit">
                    {isGeneratingReview ? (
                        <span className="spinner-icon">
                            <Icon name="loader" />
                        </span>
                    ) : (
                        <Icon name="send" />
                    )}
                    Send
                </button>
            </form>
        </div>
    )
}
