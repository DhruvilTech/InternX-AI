import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Compass, Terminal, Moon, Sun, ArrowRight, CornerDownLeft } from 'lucide-react'
import { useNavigation } from '../../context/NavigationContext'
import { useTheme } from '../../context/ThemeContext'

const commandItems = [
  { id: 'landing', label: 'Go to Landing Page', category: 'Navigation', icon: Compass },
  { id: 'dashboard', label: 'Go to Student Dashboard', category: 'Navigation', icon: Compass },
  { id: 'kanban', label: 'Go to Tasks (Kanban)', category: 'Navigation', icon: Compass },
  { id: 'interview_simulator', label: 'Open Interview Simulator', category: 'Navigation', icon: Compass },
  { id: 'certificates', label: 'Go to Certificate Center', category: 'Navigation', icon: Compass },
  { id: 'admin_panel', label: 'Go to Admin Approvals Panel', category: 'Navigation', icon: Compass },
  { id: 'settings', label: 'Go to Settings', category: 'Navigation', icon: Compass },
  
  { id: 'toggle-theme', label: 'Toggle Dark / Light Theme', category: 'System', icon: Sun },
  { id: 'role-student', label: 'Set Role: Student (AI Tech)', category: 'Actions', icon: Terminal },
  { id: 'role-recruiter', label: 'Set Role: Recruiter', category: 'Actions', icon: Terminal },
  { id: 'role-college', label: 'Set Role: College Admin', category: 'Actions', icon: Terminal },
  { id: 'role-admin', label: 'Set Role: Super Admin', category: 'Actions', icon: Terminal },
]

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, navigate, loadDemoStudent, loadDemoRecruiter, loadDemoCollege, loadDemoAdmin, addToast } = useNavigation()

  const { toggleTheme } = useTheme()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)

  // Listen for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [commandPaletteOpen, setCommandPaletteOpen])

  // Focus input when opened
  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setActiveIndex(0)
    }
  }, [commandPaletteOpen])

  const filtered = commandItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (item) => {
    setCommandPaletteOpen(false)
    if (item.category === 'Navigation') {
      navigate(item.id)
      addToast(`Navigated to ${item.label}`, 'success')
    } else if (item.id === 'toggle-theme') {
      toggleTheme()
      addToast('Theme toggled', 'success')
    } else if (item.id === 'role-student') {
      loadDemoStudent('ai')
      navigate('dashboard')
    } else if (item.id === 'role-recruiter') {
      loadDemoRecruiter()
      navigate('recruiter_dashboard')
    } else if (item.id === 'role-college') {
      loadDemoCollege()
      navigate('college_dashboard')
    } else if (item.id === 'role-admin') {
      loadDemoAdmin()
      navigate('admin_panel')
    }
  }

  // Keyboard navigation
  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % filtered.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[activeIndex]) {
        handleSelect(filtered[activeIndex])
      }
    }
  }

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandPaletteOpen(false)}
            className="fixed inset-0 bg-void/80 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            className="relative w-full max-w-xl glass-bright rounded-2xl border border-border shadow-2xl overflow-hidden glow-accent"
          >
            {/* Input area */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-void/50">
              <Search size={18} className="text-muted" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search commands, pages, or system actions..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActiveIndex(0)
                }}
                onKeyDown={handleInputKeyDown}
                className="w-full bg-transparent text-text text-sm outline-none border-none placeholder-muted"
              />
              <div className="flex gap-1 items-center bg-surface-muted border border-border px-1.5 py-0.5 rounded text-[9px] text-muted font-mono font-semibold">
                ESC
              </div>
            </div>

            {/* List area */}
            <div className="max-h-[320px] overflow-y-auto p-2 space-y-1 custom-scrollbar bg-void/25">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted">
                  No actions found for "{query}"
                </div>
              ) : (
                filtered.map((item, index) => {
                  const Icon = item.icon
                  const isSelected = index === activeIndex
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-colors ${
                        isSelected
                          ? 'bg-gradient-to-r from-accent/20 to-violet/20 text-white border border-accent/30'
                          : 'text-muted border border-transparent hover:bg-surface-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={14} className={isSelected ? 'text-accent' : 'text-muted'} />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-dim uppercase tracking-wider bg-void/50 border border-border px-1.5 py-0.5 rounded-md font-medium">
                          {item.category}
                        </span>
                        {isSelected && (
                          <CornerDownLeft size={10} className="text-accent" />
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer hints */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-void/50 text-[10px] text-muted">
              <div className="flex gap-3">
                <span className="flex items-center gap-1">↑↓ Navigation</span>
                <span className="flex items-center gap-1">↵ Select</span>
              </div>
              <div>Press <kbd className="bg-surface-muted border border-border px-1 py-0.5 rounded text-[8px] font-mono">Ctrl+K</kbd> to toggle</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
