import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ variant = 'inline' }) {
  const { theme, toggleTheme } = useTheme()
  const className = variant === 'fixed' ? 'theme-toggle theme-toggle-fixed' : 'theme-toggle theme-toggle-inline'

  return (
    <button
      type="button"
      className={className}
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
