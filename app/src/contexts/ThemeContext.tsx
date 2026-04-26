import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { DEFAULT_THEME, THEME_STORAGE_KEY } from '../constants'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ThemeContext } from './themeContextValue'
import type { Theme, ThemeContextValue } from './themeContextValue'
import { themeSchema } from '../validation/reviewSchemas'

type ThemeProviderProps = {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setTheme] = useLocalStorage<Theme>(THEME_STORAGE_KEY, DEFAULT_THEME, themeSchema)

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
