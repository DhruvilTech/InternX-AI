import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Building2, User, FolderKanban, Cpu } from 'lucide-react'
import MagneticButton from '../ui/MagneticButton'
import PulseDot from '../ui/PulseDot'

const careers = [
  { id: 'ai', label: 'AI Engineer', icon: Cpu },
  { id: 'data', label: 'Data Scientist', icon: Sparkles },
  { id: 'fullstack', label: 'Full Stack Dev', icon: FolderKanban },
]

const generated = {
  ai: {
    company: 'NeuralMind Technologies',
    manager: 'Sarah Johnson',
    department: 'Artificial Intelligence',
    project: 'Resume Intelligence Platform',
  },
  data: {
    company: 'DataPulse Analytics',
    manager: 'Michael Chen',
    department: 'Data Science',
    project: 'Predictive Churn Engine',
  },
  fullstack: {
    company: 'CloudForge Systems',
    manager: 'Emily Rodriguez',
    department: 'Engineering',
    project: 'Real-time Collaboration Suite',
  },
}

const revealVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function InternshipGenerator() {
  const [selected, setSelected] = useState('ai')
  const [generating, setGenerating] = useState(false)
  const [revealed, setRevealed] = useState(true)
  const data = generated[selected]

  const handleSelect = (id) => {
    setSelected(id)
    setGenerating(true)
    setRevealed(false)
    setTimeout(() => {
      setGenerating(false)
      setRevealed(true)
    }, 1200)
  }

  const fields = [
    { key: 'company', label: 'Company', value: data.company, icon: Building2 },
    { key: 'manager', label: 'Manager', value: data.manager, icon: User },
    { key: 'department', label: 'Department', value: data.department, icon: Sparkles },
    { key: 'project', label: 'Project', value: data.project, icon: FolderKanban },
  ]

  return (
    <section id="generator" className="relative py-32 overflow-hidden">


      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold text-violet uppercase tracking-[0.2em] mb-3">
            Internship Generator
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            One click. Entire company.
          </h2>
          <p className="text-muted max-w-lg mx-auto">
            Select your career path and watch InternX generate a complete AI-powered internship experience.
          </p>
        </motion.div>

        {/* Career selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {careers.map((c) => {
            const Icon = c.icon
            const active = selected === c.id
            return (
              <motion.button
                key={c.id}
                onClick={() => handleSelect(c.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${active
                    ? 'bg-gradient-to-r from-accent to-violet text-white shadow-lg shadow-accent/25'
                    : 'glass text-muted hover:text-text hover:border-border-bright'
                  }`}
              >
                <Icon size={16} />
                {c.label}
              </motion.button>
            )
          })}
        </div>

        {/* Generation panel */}
        <div className="glass-bright rounded-2xl p-8 sm:p-12 glow-accent relative overflow-hidden">
          {generating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-void/80 z-20 backdrop-blur-sm"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-accent border-t-transparent"
                />
                <p className="text-sm text-muted">Generating your AI company...</p>
              </div>
            </motion.div>
          )}

          <div className="flex items-center gap-2 mb-8">
            <PulseDot color="accent" />
            <span className="text-xs text-accent uppercase tracking-wider font-semibold">
              Live Generation
            </span>
          </div>

          <AnimatePresence mode="wait">
            {revealed && (
              <motion.div
                key={selected}
                initial="hidden"
                animate="visible"
                className="grid sm:grid-cols-2 gap-6"
              >
                {fields.map((field, i) => {
                  const Icon = field.icon
                  return (
                    <motion.div
                      key={field.key}
                      custom={i}
                      variants={revealVariants}
                      className="group p-5 rounded-xl bg-void/50 border border-border hover:border-accent/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={14} className="text-accent" />
                        <span className="text-[10px] text-muted uppercase tracking-wider">
                          {field.label}
                        </span>
                      </div>
                      <motion.p
                        className="font-display text-xl sm:text-2xl font-semibold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.15 + 0.3 }}
                      >
                        {field.value}
                      </motion.p>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 flex justify-center"
          >
            <MagneticButton href="#company">Enter Your Company</MagneticButton>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
