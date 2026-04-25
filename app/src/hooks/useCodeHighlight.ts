import { useMemo } from 'react'
import hljs from 'highlight.js/lib/common'
import { LANGUAGE_LABELS } from '../constants'

export function useCodeHighlight(code: string) {
    return useMemo(() => {
        if (!code.trim()) {
            return { language: 'Plain Text' }
        }

        const result = hljs.highlightAuto(code)
        const detectedLanguage = result.language ?? 'plaintext'
        return { language: LANGUAGE_LABELS[detectedLanguage] ?? detectedLanguage[0].toUpperCase() + detectedLanguage.slice(1) }
    }, [code])
}
