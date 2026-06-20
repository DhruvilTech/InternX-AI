import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Compass,
  Building2,
  ListTodo,
  Upload,
  BarChart3,
  Award,
  Users,
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const stages = [
  {
    id: 'career',
    label: 'Career Selection',
    icon: Compass,
    color: 'from-violet to-accent',
    preview: {
      title: 'Choose Your Path',
      items: ['AI Engineer', 'Data Scientist', 'Full Stack Dev', 'Product Manager'],
      active: 'AI Engineer',
    },
  },
  {
    id: 'company',
    label: 'AI Company',
    icon: Building2,
    color: 'from-accent to-cyan',
    preview: {
      title: 'NeuralMind Technologies',
      items: ['Series B Startup', 'AI Department', 'Remote-first', '120 employees'],
      active: null,
    },
  },
  {
    id: 'tasks',
    label: 'AI Tasks',
    icon: ListTodo,
    color: 'from-cyan to-emerald',
    preview: {
      title: 'Your Sprint',
      items: ['Design ML pipeline', 'Build API layer', 'Write unit tests', 'Code review'],
      active: 'Build API layer',
    },
  },
  {
    id: 'submit',
    label: 'Project Submission',
    icon: Upload,
    color: 'from-emerald to-amber',
    preview: {
      title: 'GitHub Push',
      items: ['resume-intelligence-platform', '12 commits', '3 PRs merged', 'CI passing'],
      active: 'CI passing',
    },
  },
  {
    id: 'eval',
    label: 'AI Evaluation',
    icon: BarChart3,
    color: 'from-amber to-rose',
    preview: {
      title: 'Score Breakdown',
      items: ['Code Quality: 94', 'Architecture: 88', 'Performance: 91', 'Security: 87'],
      active: null,
    },
  },
  {
    id: 'cert',
    label: 'Certificate',
    icon: Award,
    color: 'from-rose to-violet',
    preview: {
      title: 'Verified Credential',
      items: ['InternX Certified', 'Blockchain verified', 'QR authenticated', 'Shareable link'],
      active: 'InternX Certified',
    },
  },
  {
    id: 'recruit',
    label: 'Recruiter Discovery',
    icon: Users,
    color: 'from-violet to-cyan',
    preview: {
      title: 'Talent Pipeline',
      items: ['Google viewed profile', 'Stripe shortlisted', 'Meta saved', '24 recruiter views'],
      active: 'Stripe shortlisted',
    },
  },
]

export default function ProductJourney() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const getScrollAmount = () => {
      const endPadding = Math.min(window.innerWidth * 0.15, 200)
      return Math.max(0, track.scrollWidth - window.innerWidth + endPadding)
    }

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getScrollAmount() * 2.2 + window.innerHeight * 1.5}`,
          pin: true,
          scrub: 2.0,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(
              stages.length - 1,
              Math.floor(self.progress * stages.length),
            )
            setActiveIndex(idx)
          },
        },
      })
    }, section)

    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      ctx.revert()
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => ScrollTrigger.refresh(), 550)
    return () => clearTimeout(timer)
  }, [activeIndex])

  return (
    <section
      id="journey"
      ref={sectionRef}
      className="relative bg-deep overflow-hidden"
    >
      <div className="relative z-10 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto mb-16"
        >
          <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-3">
            The entire product
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold">
            In 15 seconds
          </h2>
          <p className="text-muted mt-3 max-w-md">
            Scroll through the complete internship journey — from career selection to recruiter discovery.
          </p>
        </motion.div>
      </div>

      <div ref={trackRef} className="flex gap-4 sm:gap-6 px-4 sm:px-8 pb-24 pr-[15vw] will-change-transform">
        {stages.map((stage, i) => {
          const Icon = stage.icon
          const isActive = i === activeIndex
          const isPast = i < activeIndex

          return (
            <motion.div
              key={stage.id}
              animate={{
                width: isActive ? 340 : isPast ? 220 : 180,
                opacity: isActive ? 1 : isPast ? 0.75 : 0.5,
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="shrink-0"
            >
              <div
                className={`h-full glass-bright rounded-2xl overflow-hidden transition-shadow duration-500 ${
                  isActive ? 'glow-accent ring-1 ring-accent/30' : ''
                }`}
              >
                {/* Stage header */}
                <div className={`p-4 sm:p-5 bg-gradient-to-r ${stage.color}`}>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${stage.color} shadow-sm`}
                    >
                      <Icon size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/80 uppercase tracking-wider font-medium">
                        Step {i + 1}
                      </p>
                      <h3 className="font-display font-semibold text-base sm:text-lg text-white">{stage.label}</h3>
                    </div>
                  </div>
                </div>

                {/* Preview panel */}
                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-5 border-t border-border"
                    >
                      <p className="text-sm font-medium mb-3">{stage.preview.title}</p>
                      <div className="space-y-2">
                        {stage.preview.items.map((item) => (
                          <motion.div
                            key={item}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                              item === stage.preview.active
                                ? 'bg-accent/15 text-accent-bright border border-accent/25 font-medium'
                                : 'bg-surface-muted text-muted'
                            }`}
                          >
                            {item === stage.preview.active && (
                              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            )}
                            {item}
                          </motion.div>
                        ))}
                      </div>

                      {/* Mini dashboard */}
                      <div className="mt-4 p-3 rounded-xl bg-void/50 border border-border">
                        <div className="flex gap-1 mb-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose/50" />
                          <span className="w-1.5 h-1.5 rounded-full bg-amber/50" />
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald/50" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[...Array(6)].map((_, j) => (
                            <motion.div
                              key={j}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: j * 0.05 }}
                              className="h-6 rounded bg-surface-muted"
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isActive && (
                  <div className="p-5 flex items-center justify-center h-28">
                    <Icon size={28} className="text-dim/40" />
                  </div>
                )}
              </div>

              {i < stages.length - 1 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 hidden">
                  ↓
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
