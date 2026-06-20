import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-muted text-muted hover:text-text hover:border-border-strong transition-colors ${className}`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0, scale: isDark ? 0 : 1, opacity: isDark ? 0 : 1 }}
        transition={{ duration: 0.25 }}
        className="absolute"
      >
        <Sun size={16} />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : -180, scale: isDark ? 1 : 0, opacity: isDark ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="absolute"
      >
        <Moon size={16} />
      </motion.div>
    </button>
  )
}
