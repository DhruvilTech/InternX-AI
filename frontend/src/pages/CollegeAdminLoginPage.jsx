import { useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'

export default function CollegeAdminLoginPage() {
  const { navigate, loadDemoCollege, addToast } = useNavigation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      loadDemoCollege()
      navigate('college_dashboard')
      addToast('Welcome back, placement director!', 'success')
    }, 1200)
  }

  return (
    <div className="min-h-screen pt-16 bg-void relative overflow-hidden flex items-center justify-center px-4">
      {/* Background accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-bright p-8 sm:p-10 rounded-2xl border border-border shadow-xl glow-accent relative overflow-hidden bg-void/50"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-emerald/10 border border-emerald/20 text-emerald flex items-center justify-center rounded-xl mb-3">
            <GraduationCap size={22} />
          </div>
          <h3 className="font-display text-2xl font-bold">Academic Gateway</h3>
          <p className="text-xs text-muted mt-1">Placement metrics and cohort progress diagnostics.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">University Administrator Email</label>
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
              <Mail size={14} className="text-muted" />
              <input
                type="email"
                required
                placeholder="admin@mit.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-xs text-text outline-none border-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Security Password</label>
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
              <Lock size={14} className="text-muted" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-xs text-text outline-none border-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            {loading ? (
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <span>Enter Gateway</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 space-y-3">
          <p className="text-[10px] text-muted">
            Request portal access for your institution? <a href="#" className="text-accent underline font-semibold">Integrate College</a>
          </p>
          <div>
            <button
              type="button"
              onClick={() => navigate('login')}
              className="text-[10px] text-muted hover:text-text underline font-medium transition-colors cursor-pointer"
            >
              Back to Main Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
