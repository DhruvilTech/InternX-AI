import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import MagneticButton from '../ui/MagneticButton'
import ThemeToggle from '../ui/ThemeToggle'

const navLinks = [
  { label: 'Product', href: '#journey' },
  { label: 'Generator', href: '#generator' },
  { label: 'Evaluation', href: '#evaluation' },
  { label: 'Skills', href: '#skills' },
  { label: 'Recruiters', href: '#recruiters' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass border-b border-border' : 'bg-transparent'
      }`}
    >
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent origin-left"
        style={{ scaleX }}
      />

      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a href="#" className="flex items-center gap-2.5 shrink-0 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-violet shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform">
              <span className="text-sm font-bold text-white font-display">IX</span>
            </div>
            <span className="text-lg font-display font-semibold tracking-tight">
              InternX AI
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted hover:text-text transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-accent after:transition-all hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <MagneticButton variant="ghost" className="!px-4 !py-2">
              Login
            </MagneticButton>
            <MagneticButton href="#cta" className="!px-5 !py-2.5">
              Start Internship
            </MagneticButton>
          </div>

          <div className="flex lg:hidden items-center gap-1">
            <ThemeToggle />
            <button
              className="p-2 text-muted hover:text-text"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="block px-3 py-2.5 text-sm text-muted hover:text-text rounded-lg"
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="pt-3 flex flex-col gap-2 border-t border-border mt-3">
                <MagneticButton href="#cta" className="w-full justify-center">
                  Start Internship
                </MagneticButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
