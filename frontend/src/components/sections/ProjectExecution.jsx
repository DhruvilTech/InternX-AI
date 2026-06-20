import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitBranch, CheckCircle2, MessageCircle, Activity } from 'lucide-react'
import PulseDot from '../ui/PulseDot'

const columns = [
  { id: 'todo', label: 'Todo', color: 'border-dim' },
  { id: 'progress', label: 'In Progress', color: 'border-amber' },
  { id: 'review', label: 'Review', color: 'border-accent' },
  { id: 'done', label: 'Completed', color: 'border-emerald' },
]

const initialCards = [
  { id: 1, title: 'Design database schema', column: 'todo', tag: 'Backend' },
  { id: 2, title: 'Build auth middleware', column: 'todo', tag: 'Security' },
  { id: 3, title: 'Implement ML pipeline', column: 'progress', tag: 'AI/ML' },
  { id: 4, title: 'Write API documentation', column: 'progress', tag: 'Docs' },
]

const activities = [
  'GitHub push detected — resume-intelligence-platform',
  'AI evaluation started...',
  'Code quality score: 94/100',
  'Feedback: Excellent error handling patterns',
]

export default function ProjectExecution() {
  const [cards, setCards] = useState(initialCards)
  const [activityIndex, setActivityIndex] = useState(0)
  const [showSubmission, setShowSubmission] = useState(false)
  const [evaluating, setEvaluating] = useState(false)

  useEffect(() => {
    const moves = [
      { id: 1, to: 'progress', delay: 2000 },
      { id: 3, to: 'review', delay: 4500 },
      { id: 4, to: 'done', delay: 6500 },
      { id: 3, to: 'done', delay: 9000 },
    ]

    moves.forEach(({ id, to, delay }) => {
      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) => (c.id === id ? { ...c, column: to } : c)),
        )
      }, delay)
    })

    setTimeout(() => setShowSubmission(true), 7500)
    setTimeout(() => setEvaluating(true), 8500)
  }, [])

  useEffect(() => {
    if (!evaluating) return
    const interval = setInterval(() => {
      setActivityIndex((i) => (i + 1) % activities.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [evaluating])

  return (
    <section id="execution" className="relative py-32 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 80% 60%, rgba(34,211,238,0.08), transparent)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p className="text-xs font-semibold text-emerald uppercase tracking-[0.2em] mb-3">
              Project Execution
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold">
              Ship like a real engineer
            </h2>
          </div>
          <div className="flex items-center gap-2 glass rounded-full px-4 py-2">
            <Activity size={14} className="text-emerald" />
            <span className="text-xs text-muted">Live workspace</span>
            <PulseDot color="emerald" size={6} />
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-4 mb-6">
          {columns.map((col) => (
            <div key={col.id} className="min-h-[320px]">
              <div className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${col.color}`}>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {col.label}
                </span>
                <span className="text-[10px] text-dim ml-auto">
                  {cards.filter((c) => c.column === col.id).length}
                </span>
              </div>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {cards
                    .filter((c) => c.column === col.id)
                    .map((card) => (
                      <motion.div
                        key={card.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="glass-bright rounded-xl p-4 cursor-grab hover:border-border-bright transition-colors"
                      >
                        <span className="text-[10px] text-accent uppercase tracking-wider">
                          {card.tag}
                        </span>
                        <p className="text-sm font-medium mt-1">{card.title}</p>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>

        {/* Activity feed */}
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence>
            {showSubmission && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-bright rounded-xl p-5 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center">
                  <GitBranch size={18} className="text-cyan" />
                </div>
                <div>
                  <p className="text-sm font-medium">GitHub Submission</p>
                  <p className="text-xs text-muted">resume-intelligence-platform · main · 12 commits</p>
                </div>
                <CheckCircle2 size={18} className="text-emerald ml-auto" />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="glass rounded-xl p-5 flex items-center gap-4"
            animate={evaluating ? { borderColor: 'rgba(129,140,248,0.3)' } : {}}
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <MessageCircle size={18} className="text-accent" />
            </div>
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.p
                  key={activityIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-sm"
                >
                  {evaluating ? activities[activityIndex] : 'Waiting for submission...'}
                </motion.p>
              </AnimatePresence>
            </div>
            {evaluating && <PulseDot color="accent" />}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
