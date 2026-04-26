import { DEFAULT_EDITOR_METRICS } from '../constants'

export type EditorMetrics = typeof DEFAULT_EDITOR_METRICS

export function getLineSelectionRange(code: string, line: number) {
    const targetLine = Math.max(Math.floor(line), 1)
    let currentLine = 1
    let start = 0

    while (currentLine < targetLine) {
        const nextLineIndex = code.indexOf('\n', start)

        if (nextLineIndex === -1) {
            return { end: code.length, start: code.length }
        }

        start = nextLineIndex + 1
        currentLine += 1
    }

    const nextLineIndex = code.indexOf('\n', start)
    const lineEnd = nextLineIndex === -1 ? code.length : nextLineIndex
    const end = lineEnd > start ? lineEnd : Math.min(start + 1, code.length)

    return { end, start }
}

export function getLineNumbers(code: string) {
    return Array.from({ length: code.split('\n').length }, (_, index) => index + 1).join('\n')
}

export function getFocusedLineScrollTop(line: number, lineHeight: number) {
    return Math.max((line - 2) * lineHeight, 0)
}

export function getTextareaEditorMetrics(textarea: HTMLTextAreaElement): EditorMetrics {
    const style = window.getComputedStyle(textarea)
    const borderBlockWidth = Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth)
    const horizontalScrollbarHeight = textarea.offsetHeight - textarea.clientHeight - borderBlockWidth
    const lineHeight = Number.parseFloat(style.lineHeight)
    const paddingTop = Number.parseFloat(style.paddingTop)

    return {
        horizontalScrollbarHeight: Math.max(
            Number.isFinite(horizontalScrollbarHeight) ? horizontalScrollbarHeight : 0,
            0,
        ),
        lineHeight: Number.isFinite(lineHeight) ? lineHeight : DEFAULT_EDITOR_METRICS.lineHeight,
        paddingTop: Number.isFinite(paddingTop) ? paddingTop : DEFAULT_EDITOR_METRICS.paddingTop,
    }
}

export function insertTabAtSelection(textarea: HTMLTextAreaElement, code: string) {
    const { selectionEnd, selectionStart } = textarea
    const nextCode = `${code.slice(0, selectionStart)}\t${code.slice(selectionEnd)}`
    const nextCursorPosition = selectionStart + 1

    return { nextCode, nextCursorPosition }
}
