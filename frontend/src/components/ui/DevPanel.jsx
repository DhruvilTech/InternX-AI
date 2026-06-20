import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, X, User, Users, GraduationCap, EyeOff } from 'lucide-react'
import { useNavigation } from '../../context/NavigationContext'

const pagesList = [
  { id: 'landing', label: '1. Landing Page', role: 'guest' },
  { id: 'login', label: '2. Auth (Login)', role: 'guest' },
  { id: 'onboarding', label: '3. Onboarding', role: 'student' },
  { id: 'career_selection', label: '4. Career Selection', role: 'student' },
  { id: 'generator', label: '5. AI Generator', role: 'student' },
  { id: 'dashboard', label: '6. Student Dashboard', role: 'student' },
  { id: 'company', label: '7. AI Company Profile', role: 'student' },
  { id: 'kanban', label: '8. Task Kanban', role: 'student' },
  { id: 'task_details', label: '9. Task Details', role: 'student' },
  { id: 'submit_task', label: '10. Submission Page', role: 'student' },
  { id: 'evaluation', label: '11. AI Evaluation', role: 'student' },
  { id: 'feedback_center', label: '12. Feedback Center', role: 'student' },
  { id: 'skill_gap', label: '13. Skill Gap Analysis', role: 'student' },
  { id: 'analytics', label: '14. Analytics Hub', role: 'student' },
  { id: 'career_coach', label: '15. AI Career Coach', role: 'student' },
  { id: 'interview_simulator', label: '16. Interview Simulator', role: 'student' },
  { id: 'certificates', label: '17. Certificate Center', role: 'student' },
  { id: 'profile', label: '18. Student Profile', role: 'student' },
  { id: 'recruiter_login', label: '19. Recruiter Login', role: 'guest' },
  { id: 'recruiter_dashboard', label: '20. Recruiter Dashboard', role: 'recruiter' },
  { id: 'candidate_profile', label: '21. Candidate Profile', role: 'recruiter' },
  { id: 'college_login', label: '22. College Login', role: 'guest' },
  { id: 'college_dashboard', label: '23. College Dashboard', role: 'college_admin' },
  { id: 'notifications', label: '24. Notifications Center', role: 'student' },
  { id: 'settings', label: '25. Account Settings', role: 'student' },
  { id: '404', label: 'Global: 404 Page', role: 'guest' },
  { id: 'maintenance', label: 'Global: Maintenance', role: 'guest' },
]

export default function DevPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const {
    page,
    role,
    navigate,
    loadDemoStudent,
    loadDemoRecruiter,
    loadDemoCollege,
    handleLogout,
  } = useNavigation()

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-accent to-violet px-4 text-xs font-semibold text-white shadow-lg shadow-violet/35 border border-white/20"
        >
          {isOpen ? <X size={16} /> : <Terminal size={16} />}
          <span>Ecosystem Hub</span>
        </motion.button>
      </div>

      {/* Slide-out Control Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-20 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] glass-bright rounded-2xl border border-border overflow-hidden glow-accent shadow-2xl flex flex-col max-h-[80vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-void/70 px-5 py-4">
              <div>
                <h3 className="font-display font-semibold text-text text-sm">Demo Controller</h3>
                <p className="text-[10px] text-muted">Current Mode: <span className="text-accent font-semibold uppercase">{role}</span></p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-text">
                <X size={16} />
              </button>
            </div>

            {/* Quick Personas */}
            <div className="p-4 border-b border-border bg-void/30 space-y-2">
              <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Quick Switch Persona & Data</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { loadDemoStudent('ai'); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-violet/20 border border-violet/30 text-white hover:bg-violet/30 transition-colors"
                >
                  <User size={12} />
                  <span>Student (AI)</span>
                </button>
                <button
                  onClick={() => { loadDemoStudent('frontend'); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-indigo/20 border border-indigo/30 text-white hover:bg-indigo/30 transition-colors"
                >
                  <User size={12} />
                  <span>Student (FE)</span>
                </button>
                <button
                  onClick={loadDemoRecruiter}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-accent/20 border border-accent/30 text-white hover:bg-accent/30 transition-colors"
                >
                  <Users size={12} />
                  <span>Recruiter</span>
                </button>
                <button
                  onClick={loadDemoCollege}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-emerald/20 border border-emerald/30 text-white hover:bg-emerald/30 transition-colors"
                >
                  <GraduationCap size={12} />
                  <span>College Admin</span>
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-center py-1.5 mt-2 rounded-lg text-[10px] bg-rose/10 border border-rose/30 text-rose-300 hover:bg-rose/20 transition-colors"
              >
                Clear / Logout (Guest)
              </button>
            </div>

            {/* Pages Grid */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[40vh] custom-scrollbar">
              <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Browse 25 Pages</span>
              <div className="space-y-1">
                {pagesList.map((p) => {
                  const isActive = page === p.id
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        // Automatically switch roles if required to view pages
                        if (p.role === 'student' && role !== 'student') {
                          loadDemoStudent('ai')
                        } else if (p.role === 'recruiter' && role !== 'recruiter') {
                          loadDemoRecruiter()
                        } else if (p.role === 'college_admin' && role !== 'college_admin') {
                          loadDemoCollege()
                        } else if (p.role === 'guest' && role !== 'guest') {
                          // Clear if it's recruiter_login or college_login or landing
                          if (p.id === 'landing' || p.id === 'login' || p.id === 'recruiter_login' || p.id === 'college_login') {
                            // Don't force guest if we want to preview it, but let's allow it
                          }
                        }
                        navigate(p.id)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-accent/30 to-violet/30 border border-accent/50 text-white font-medium'
                          : 'bg-void/40 border border-border text-muted hover:text-text hover:border-border-strong'
                      }`}
                    >
                      <span>{p.label}</span>
                      {isActive && <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
