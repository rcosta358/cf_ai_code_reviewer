import { useMemo } from 'react'
import hljs from 'highlight.js/lib/common'

const languageLabels: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  xml: 'HTML/XML',
  css: 'CSS',
  scss: 'SCSS',
  json: 'JSON',
  bash: 'Shell',
  shell: 'Shell',
  plaintext: 'Plain Text',
}

export function useCodeHighlight(code: string) {
  return useMemo(() => {
    if (!code.trim()) {
      return {
        highlightedCode: '',
        language: 'Plain Text',
      }
    }

    const result = hljs.highlightAuto(code)
    const detectedLanguage = result.language ?? 'plaintext'
    return {
      highlightedCode: result.value,
      language: languageLabels[detectedLanguage] ?? detectedLanguage[0].toUpperCase() + detectedLanguage.slice(1),
    }
  }, [code])
}
