import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ThemeContext } from './themeContextValue'
import type { Theme, ThemeContextValue } from './themeContextValue'

type ThemeProviderProps = {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setTheme] = useLocalStorage<Theme>('ai-code-reviewer-theme', 'light')

    const value = useMemo<ThemeContextValue>(
        () => ({
            theme,
            toggleTheme: () => setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light')),
        }),
        [setTheme, theme],
    )

    return (
        <ThemeContext.Provider value={value}>
            <div className="theme-root" data-theme={theme}>
                {children}
            </div>
        </ThemeContext.Provider>
    )
}
