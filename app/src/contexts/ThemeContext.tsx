import { useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { DEFAULT_THEME, THEME_STORAGE_KEY } from '../constants'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ThemeContext } from './themeContextValue'
import type { Theme, ThemeContextValue } from './themeContextValue'
import { themeSchema } from '../validation/reviewSchemas'

type ThemeProviderProps = {
  children: ReactNode
}

const THEME_COLORS: Record<Theme, string> = {
    light: '#f5f7f8',
    dark: '#111418',
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

    useEffect(() => {
        const backgroundColor = THEME_COLORS[theme]
        document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', backgroundColor)
        document.documentElement.style.backgroundColor = backgroundColor
        document.body.style.backgroundColor = backgroundColor
    }, [theme])

    return (
        <ThemeContext.Provider value={value}>
            <div className="theme-root" data-theme={theme}>
                {children}
            </div>
        </ThemeContext.Provider>
    )
}
