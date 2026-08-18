import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ variant = 'plain' }) {
  const { theme, toggleTheme } = useTheme()

  if (variant === 'bottombar') {
    return (
      <button
        type="button"
        className="bottombar-theme-btn"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      >
        <span className="icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
        <span className="label">Thème</span>
      </button>
    )
  }

  const variantClass =
    variant === 'fixed' ? 'theme-toggle-fixed' : variant === 'inline' ? 'theme-toggle-inline' : ''
  const className = `theme-toggle ${variantClass}`.trim()

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
