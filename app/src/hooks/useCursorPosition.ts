import { useCallback, useMemo, useState } from 'react'

type CursorPosition = {
  column: number
  line: number
}

const getCursorPosition = (code: string, cursorIndex: number): CursorPosition => {
  const beforeCursor = code.slice(0, cursorIndex)
  const lines = beforeCursor.split('\n')

  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  }
}

export function useCursorPosition(code: string) {
  const [cursorIndex, setCursorIndex] = useState(0)
  const cursorPosition = useMemo(
    () => getCursorPosition(code, Math.min(cursorIndex, code.length)),
    [code, cursorIndex],
  )

  const captureCursor = useCallback((element: HTMLTextAreaElement) => {
    setCursorIndex(element.selectionStart)
  }, [])

  return {
    captureCursor,
    cursorPosition,
  }
}
