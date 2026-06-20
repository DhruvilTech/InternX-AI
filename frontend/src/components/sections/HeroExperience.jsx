import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import {
  Briefcase,
  Building2,
  UserCircle,
  CheckCircle2,
  TrendingUp,
  Eye,
} from 'lucide-react'
import MagneticButton from '../ui/MagneticButton'
import TiltCard from '../ui/TiltCard'
import PulseDot from '../ui/PulseDot'
import AnimatedCounter from '../ui/AnimatedCounter'

const chartData = [
  { v: 42 },
  { v: 48 },
  { v: 45 },
  { v: 58 },
  { v: 62 },
  { v: 71 },
  { v: 78 },
  { v: 85 },
]

const tasks = [
  { title: 'Build REST API endpoints', done: true },
  { title: 'Implement ML pipeline', done: true },
  { title: 'Deploy to production', done: false },
]

function FloatingPanel({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className={`glass rounded-xl p-3 ${className}`}
    >
      {children}
    </motion.div>
  )
}

export default function HeroExperience() {
  const [score, setScore] = useState(78)
  const [progress, setProgress] = useState(67)
  const [recruiterViews, setRecruiterViews] = useState(12)

  useEffect(() => {
    const interval = setInterval(() => {
      setScore((s) => Math.min(94, s + (Math.random() > 0.6 ? 1 : 0)))
      setProgress((p) => (p >= 89 ? 67 : p + 0.5))
      setRecruiterViews((v) => v + (Math.random() > 0.85 ? 1 : 0))
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-x-clip pt-20"
    >
      <div className="absolute inset-0 grid-fine opacity-60" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 70% 40%, rgba(129,140,248,0.12), transparent 60%), radial-gradient(ellipse 50% 40% at 20% 80%, rgba(34,211,238,0.06), transparent)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-5rem)]">
          {/* Left — Typography */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-2"
            >
              <PulseDot color="emerald" size={6} />
              <span className="text-xs font-medium text-muted tracking-wide">
                2,400+ students building experience right now
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-[5.25rem] font-bold leading-[0.95] tracking-tight"
            >
              Gain Real{' '}
              <span className="text-gradient">Experience</span>
              <br />
              Before Your First Job
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-lg sm:text-xl text-muted max-w-lg leading-relaxed"
            >
              Join AI-generated companies. Build real projects. Get evaluated.
              Earn certificates. Get discovered by recruiters.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-wrap gap-4"
            >
              <MagneticButton href="#generator">Start Your Internship</MagneticButton>
              <MagneticButton href="#journey" variant="ghost">
                See the Product
              </MagneticButton>
            </motion.div>
          </div>

          {/* Right — Living Dashboard */}
          <div className="relative h-[480px] lg:h-[540px] xl:h-[580px] perspective-[1200px]">
            <TiltCard className="relative w-full h-full" intensity={8}>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 glass-bright rounded-2xl glow-accent overflow-hidden"
              >
                {/* Chrome */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald/60" />
                    </div>
                    <span className="text-xs text-muted ml-2">InternX Dashboard</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PulseDot color="emerald" size={6} />
                    <span className="text-xs text-emerald">Live</span>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-12 gap-3 h-[calc(100%-44px)]">
                  {/* Student Profile */}
                  <FloatingPanel className="col-span-5 row-span-2" delay={0.2}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-violet flex items-center justify-center text-sm font-bold text-white">
                        AK
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Arjun Kapoor</p>
                        <p className="text-[10px] text-muted">AI Engineer Track</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted">Internship Progress</span>
                        <span className="text-accent-bright">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-accent to-cyan rounded-full"
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                    </div>
                  </FloatingPanel>

                  {/* AI Company */}
                  <FloatingPanel className="col-span-7" delay={0.3}>
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-accent" />
                      <span className="text-xs font-medium">NeuralMind Technologies</span>
                    </div>
                    <p className="text-[10px] text-muted mt-1">AI · Series B · 120 employees</p>
                  </FloatingPanel>

                  {/* AI Manager */}
                  <FloatingPanel className="col-span-7" delay={0.35}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCircle size={14} className="text-cyan" />
                        <span className="text-xs">Sarah Johnson · AI Manager</span>
                      </div>
                      <span className="text-[10px] text-emerald flex items-center gap-1">
                        <PulseDot color="emerald" size={5} /> Online
                      </span>
                    </div>
                  </FloatingPanel>

                  {/* Tasks */}
                  <FloatingPanel className="col-span-4 row-span-2" delay={0.4}>
                    <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Tasks</p>
                    <div className="space-y-2">
                      {tasks.map((t, i) => (
                        <motion.div
                          key={t.title}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className="flex items-start gap-1.5"
                        >
                          <CheckCircle2
                            size={12}
                            className={t.done ? 'text-emerald shrink-0 mt-0.5' : 'text-dim shrink-0 mt-0.5'}
                          />
                          <span className={`text-[10px] leading-tight ${t.done ? 'text-muted line-through' : ''}`}>
                            {t.title}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </FloatingPanel>

                  {/* Chart */}
                  <FloatingPanel className="col-span-5" delay={0.45}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted">Performance</span>
                      <TrendingUp size={12} className="text-emerald" />
                    </div>
                    <div className="h-14">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#818cf8" stopOpacity={0.4} />
                              <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="v"
                            stroke="#818cf8"
                            strokeWidth={2}
                            fill="url(#heroGrad)"
                            isAnimationActive
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </FloatingPanel>

                  {/* Evaluation Score */}
                  <FloatingPanel className="col-span-3" delay={0.5}>
                    <p className="text-[10px] text-muted mb-1">Evaluation</p>
                    <motion.p
                      key={score}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="font-display text-2xl font-bold text-gradient-violet"
                    >
                      {score}
                      <span className="text-sm text-muted font-normal">/100</span>
                    </motion.p>
                  </FloatingPanel>

                  {/* Recruiter Interest */}
                  <FloatingPanel className="col-span-8" delay={0.55}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye size={14} className="text-amber" />
                        <span className="text-xs">Recruiter Interest</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">
                          <AnimatedCounter value={recruiterViews} /> views
                        </span>
                        <Briefcase size={14} className="text-accent" />
                      </div>
                    </div>
                    <div className="h-8 mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <Line
                            type="monotone"
                            dataKey="v"
                            stroke="#fbbf24"
                            strokeWidth={1.5}
                            dot={false}
                            isAnimationActive
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </FloatingPanel>
                </div>
              </motion.div>
            </TiltCard>

            {/* Floating accent cards */}
            <motion.div
              animate={{ y: [0, -10, 0], x: [0, 4, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -left-4 top-20 glass rounded-lg px-3 py-2 z-20 hidden sm:block"
            >
              <p className="text-[10px] text-emerald font-medium">+12% this week</p>
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
              className="absolute -right-2 bottom-24 glass rounded-lg px-3 py-2 z-20 hidden sm:block"
            >
              <p className="text-[10px] text-accent font-medium">Certificate ready</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
