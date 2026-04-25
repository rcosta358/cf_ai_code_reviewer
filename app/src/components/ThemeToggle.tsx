import { useTheme } from '../hooks/useTheme'
import { Icon } from './Icon'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className="icon-button theme-toggle"
      onClick={toggleTheme}
      type="button"
    >
      <Icon name={isDark ? 'sun' : 'moon'} />
    </button>
  )
}
