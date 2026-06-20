import { useState } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
  Star,
  Briefcase,
  Award,
  BarChart3,
  ChevronRight,
  Check,
} from 'lucide-react'
import PulseDot from '../ui/PulseDot'
import TiltCard from '../ui/TiltCard'

const candidate = {
  name: 'Arjun Kapoor',
  role: 'AI Engineer',
  score: 92,
  avatar: 'AK',
  projects: ['Resume Intelligence Platform', 'ML Pipeline Optimizer'],
  skills: ['Python', 'TensorFlow', 'FastAPI', 'System Design'],
  certificates: 2,
}

const initialPool = [
  { id: 'c1', name: 'Priya Sharma', role: 'Data Scientist', score: 89, avatar: 'PS' },
  { id: 'c2', name: 'Marcus Lee', role: 'Full Stack', score: 86, avatar: 'ML' },
  { id: 'c3', name: 'Sofia Chen', role: 'ML Engineer', score: 94, avatar: 'SC' },
]

export default function RecruiterExperience() {
  const [shortlisted, setShortlisted] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [justShortlisted, setJustShortlisted] = useState(false)

  const handleShortlist = () => {
    if (justShortlisted) return
    setJustShortlisted(true)
    setSelectedId('main')
    setTimeout(() => {
      setShortlisted((prev) => [...prev, { ...candidate, id: 'main' }])
      setJustShortlisted(false)
    }, 600)
  }

  const pool = initialPool.filter((c) => !shortlisted.find((s) => s.id === c.id))

  return (
    <section id="recruiters" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 grid-fine opacity-30" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 20% 60%, rgba(251,191,36,0.06), transparent)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <p className="text-xs font-semibold text-amber uppercase tracking-[0.2em] mb-3">
            Recruiter Experience
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold">
            Discover verified talent instantly
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Candidate profile */}
          <div className="lg:col-span-5">
            <TiltCard>
              <motion.div
                layoutId="candidate-card"
                className={`glass-bright rounded-2xl p-6 glow-accent transition-all duration-500 ${
                  selectedId === 'main' ? 'scale-95 opacity-50' : ''
                }`}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-violet flex items-center justify-center font-bold text-lg">
                    {candidate.avatar}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">{candidate.name}</h3>
                    <p className="text-sm text-muted">{candidate.role}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={12} className="text-amber fill-amber" />
                      <span className="text-sm font-semibold text-amber">{candidate.score}/100</span>
                    </div>
                  </div>
                  <PulseDot color="emerald" size={6} />
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Projects</p>
                    {candidate.projects.map((p) => (
                      <div key={p} className="flex items-center gap-2 text-sm py-1.5">
                        <Briefcase size={12} className="text-accent" />
                        {p}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((s) => (
                        <span key={s} className="text-xs px-2.5 py-1 rounded-lg bg-surface-muted border border-border">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-xs">
                      <BarChart3 size={12} className="text-cyan" />
                      Performance: Top 5%
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Award size={12} className="text-violet" />
                      {candidate.certificates} Certificates
                    </div>
                  </div>
                </div>

                <motion.button
                  onClick={handleShortlist}
                  disabled={justShortlisted || shortlisted.some((s) => s.id === 'main')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber to-rose text-void font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {shortlisted.some((s) => s.id === 'main') ? (
                    <>
                      <Check size={16} /> Shortlisted
                    </>
                  ) : (
                    <>
                      SHORTLIST <ChevronRight size={16} />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </TiltCard>
          </div>

          {/* Talent pool + shortlist */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass rounded-2xl p-5">
              <p className="text-xs text-muted uppercase tracking-wider mb-4">Talent Pool</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {pool.map((c) => (
                  <div key={c.id} className="glass-bright rounded-xl p-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-muted flex items-center justify-center text-sm font-bold mb-2">
                      {c.avatar}
                    </div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-[10px] text-muted">{c.role}</p>
                    <p className="text-xs text-amber mt-1">{c.score}/100</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-bright rounded-2xl p-5 min-h-[200px]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-muted uppercase tracking-wider">Shortlist</p>
                <span className="text-xs text-emerald">{shortlisted.length} candidates</span>
              </div>
              <LayoutGroup>
                <AnimatePresence>
                  {shortlisted.map((c) => (
                    <motion.div
                      key={c.id}
                      layout
                      initial={{ opacity: 0, x: 100, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-emerald/10 border border-emerald/25 mb-3"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-violet flex items-center justify-center font-bold text-sm">
                        {c.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-[10px] text-muted">{c.role}</p>
                      </div>
                      <Check size={18} className="text-emerald" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </LayoutGroup>
              {shortlisted.length === 0 && (
                <p className="text-sm text-dim text-center py-8">
                  Click SHORTLIST to add candidates
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
