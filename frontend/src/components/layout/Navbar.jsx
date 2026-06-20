import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import { Menu, X, Bell, User, Settings, LogOut, Search, ShieldCheck } from 'lucide-react'
import MagneticButton from '../ui/MagneticButton'
import ThemeToggle from '../ui/ThemeToggle'
import { useNavigation } from '../../context/NavigationContext'
import PulseDot from '../ui/PulseDot'
import useAuth from '../../hooks/useAuth.js'

export default function Navbar() {
  const {
    page,
    navigate,
    setNotificationsOpen,
    setCommandPaletteOpen,
  } = useNavigation()

  const { role, user, logout } = useAuth()

  const isPendingApproval = user && user.role !== 'admin' && (
    (user.role === 'student' && !user.isVerified) ||
    (user.role === 'college' && !user.isCollegeVerified) ||
    (user.role === 'recruiter' && !user.isRecruiterVerified)
  )

  const isEmailPending = user && !user.isEmailVerified

  const isLocked = isPendingApproval || isEmailPending

  const handleLogout = async () => {
    await logout()
    navigate('login')
  }

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogoClick = (e) => {
    e.preventDefault()
    navigate('landing')
  }

  // Determine navigation links based on user status
  const getNavLinks = () => {
    if (isLocked) {
      return []
    }
    if (role === 'student') {
      return [
        { label: 'Dashboard', id: 'student/dashboard' },
        { label: 'Internships', id: user?.selectedCareer ? 'my-career' : 'careers' },
        { label: 'GitHub', id: 'dashboard/github' },
        { label: 'Tasks', id: 'kanban' },
        { label: 'Certificates', id: 'certificates' },
        { label: 'Profile', id: 'profile' },
      ]
    } else if (role === 'college' || role === 'college_admin') {
      return [
        { label: 'Dashboard', id: 'college/dashboard' },
        { label: 'Students', id: 'college/students' },
        { label: 'Internships', id: 'college/internships' },
        { label: 'Skills', id: 'college/skills' },
        { label: 'Placement', id: 'college/placement' },
        { label: 'Certificates', id: 'college/certificates' },
        { label: 'Reports', id: 'college/reports' },
      ]
    } else if (role === 'recruiter') {
      return [
        { label: 'Dashboard', id: 'recruiter/dashboard' },
        { label: 'Talent Pool', id: 'recruiter/dashboard' },
        { label: 'Certificates', id: 'recruiter/dashboard' },
        { label: 'Hiring', id: 'recruiter/dashboard' },
      ]
    } else if (role === 'admin') {
      return [
        { label: 'Dashboard', id: 'admin/dashboard' },
        { label: 'Users', id: 'admin/dashboard' },
        { label: 'Analytics', id: 'admin/dashboard' },
        { label: 'Settings', id: 'settings' },
      ]
    } else {
      return [
        { label: 'Product Journey', id: 'landing', hash: '#journey' },
        { label: 'AI Generator', id: 'landing', hash: '#generator' },
        { label: 'AI Evaluation', id: 'landing', hash: '#evaluation' },
        { label: 'Recruiters', id: 'landing', hash: '#recruiters' },
      ]
    }
  }

  const navLinks = getNavLinks()

  const handleLinkClick = (e, link) => {
    e.preventDefault()
    setMobileOpen(false)
    if (link.hash) {
      // Go to landing and scroll to hash
      navigate('landing')
      setTimeout(() => {
        const el = document.getElementById(link.hash.replace('#', ''))
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      navigate(link.id)
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || page !== 'landing' ? 'glass border-b border-border' : 'bg-transparent'
        }`}
    >
      {/* Scroll indicator - only on Landing Page */}
      {page === 'landing' && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent origin-left"
          style={{ scaleX }}
        />
      )}

      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <a href="#/" onClick={handleLogoClick} className="flex items-center gap-2.5 shrink-0 group">
            <img src="/logo.png" alt="InternX Logo" className="h-8 w-8 object-contain group-hover:scale-[1.05] transition-transform" />
            <span className="text-lg font-display font-semibold tracking-tight text-text">
              InternX AI
            </span>
          </a>

          {/* Links */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.hash || `#/${link.id}`}
                onClick={(e) => handleLinkClick(e, link)}
                className="text-xs font-semibold uppercase tracking-wider text-muted hover:text-text transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-0 after:bg-accent after:transition-all hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Action buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />

            {/* Search command shortcut trigger button */}
            {!isLocked && (
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-muted/50 text-muted hover:text-text hover:border-border-strong transition-colors"
                title="Search dashboard Ctrl+K"
              >
                <Search size={15} />
              </button>
            )}

            {role === 'guest' ? (
              <>
                <button
                  onClick={() => navigate('login')}
                  className="px-4 py-2 text-xs font-semibold text-muted hover:text-text transition-colors"
                >
                  Sign In
                </button>
                <MagneticButton
                  onClick={() => navigate('career_selection')}
                  className="!px-4 !py-2 text-xs"
                >
                  Start Internship
                </MagneticButton>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {/* Notification bell */}
                {!isLocked && (
                  <button
                    onClick={() => setNotificationsOpen(true)}
                    className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-muted/50 text-muted hover:text-text hover:border-border-strong transition-colors"
                  >
                    <Bell size={15} />
                    <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-accent rounded-full animate-pulse" />
                  </button>
                )}

                {/* Avatar menu */}
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="h-9 w-9 rounded-full bg-gradient-to-br from-accent to-violet flex items-center justify-center text-white text-xs font-bold font-display shadow-md shadow-accent/10 border border-white/10"
                  >
                    {user?.avatar || (user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : user?.companyName ? user.companyName.slice(0, 2).toUpperCase() : user?.collegeName ? user.collegeName.slice(0, 2).toUpperCase() : 'U')}
                  </button>

                  <AnimatePresence>
                    {profileMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2.5 w-48 rounded-xl border border-border glass bg-void/90 p-1.5 shadow-2xl z-50 text-left"
                        >
                          <div className="px-3 py-2 border-b border-border/60 mb-1.5">
                            <p className="text-xs font-bold text-text truncate">{user?.fullName || user?.companyName || user?.collegeName || 'User'}</p>
                            <p className="text-[9px] text-muted truncate mt-0.5">{user?.email || 'user@example.com'}</p>
                          </div>

                          {role === 'admin' ? (
                            <button
                              onClick={() => {
                                setProfileMenuOpen(false)
                                navigate('admin_panel')
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted hover:text-text hover:bg-surface-muted/30 rounded-lg text-left"
                            >
                              <ShieldCheck size={13} className="text-accent" />
                              <span>Approvals Panel</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setProfileMenuOpen(false)
                                navigate('profile')
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted hover:text-text hover:bg-surface-muted/30 rounded-lg text-left"
                            >
                              <User size={13} />
                              <span>My Portfolio</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setProfileMenuOpen(false)
                              navigate('settings')
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted hover:text-text hover:bg-surface-muted/30 rounded-lg text-left"
                          >
                            <Settings size={13} />
                            <span>Preferences</span>
                          </button>

                          <button
                            onClick={() => {
                              setProfileMenuOpen(false)
                              handleLogout()
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-300 hover:bg-rose/10 hover:text-rose rounded-lg text-left border-t border-border/40 mt-1.5 pt-2"
                          >
                            <LogOut size={13} />
                            <span>Sign Out</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu triggers */}
          <div className="flex lg:hidden items-center gap-1.5">
            <ThemeToggle />
            <button
              className="p-2 text-muted hover:text-text"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1.5">
              {navLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.hash || `#/${link.id}`}
                  onClick={(e) => handleLinkClick(e, link)}
                  className="block px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted hover:text-text rounded-lg"
                >
                  {link.label}
                </a>
              ))}

              <div className="pt-3 flex flex-col gap-2 border-t border-border mt-3">
                {role === 'guest' ? (
                  <>
                    <button
                      onClick={() => {
                        setMobileOpen(false)
                        navigate('login')
                      }}
                      className="w-full text-center py-2.5 rounded-xl border border-border text-xs text-muted font-semibold"
                    >
                      Sign In
                    </button>
                    <MagneticButton
                      onClick={() => {
                        setMobileOpen(false)
                        navigate('career_selection')
                      }}
                      className="w-full justify-center"
                    >
                      Start Internship
                    </MagneticButton>
                  </>
                ) : (
                  <div className="flex items-center justify-between px-3 py-1">
                    <span className="text-xs font-bold text-text">{user?.fullName || user?.companyName || user?.collegeName || 'User'}</span>
                    <button
                      onClick={() => {
                        setMobileOpen(false)
                        handleLogout()
                      }}
                      className="text-xs text-rose-300 font-semibold"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
