import { motion } from 'framer-motion'
import {
  ArrowRight,
  Play,
  User,
  Building2,
  ClipboardList,
  Upload,
  BarChart3,
  Award,
  Search,
  ChevronDown,
} from 'lucide-react'
import FadeInView from '../ui/FadeInView'
import AnimatedCounter from '../ui/AnimatedCounter'

const workflowSteps = [
  { icon: User, label: 'Student Profile', color: 'icon-box-primary' },
  { icon: Building2, label: 'AI Company Generated', color: 'icon-box-secondary' },
  { icon: ClipboardList, label: 'Tasks Assigned', color: 'icon-box-primary' },
  { icon: Upload, label: 'Project Submission', color: 'icon-box-secondary' },
  { icon: BarChart3, label: 'AI Evaluation', color: 'icon-box-accent' },
  { icon: Award, label: 'Certificate Earned', color: 'icon-box-accent' },
  { icon: Search, label: 'Recruiter Discovery', color: 'icon-box-primary' },
]

export default function Hero() {
  return (
    <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
      <div className="hero-glow" />
      <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <FadeInView delay={0}>
              <div className="badge mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                <span className="badge-text">AI-Powered Virtual Internships</span>
              </div>
            </FadeInView>

            <FadeInView delay={0.08}>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-heading leading-[1.1] tracking-tight text-balance">
                Get Internship Experience{' '}
                <span className="text-primary">Before Getting Hired</span>
              </h1>
            </FadeInView>

            <FadeInView delay={0.16}>
              <p className="mt-6 text-lg text-subtle leading-relaxed max-w-xl">
                InternX AI creates AI-powered virtual internships where students complete
                real projects, receive mentor feedback, earn certificates, and get
                discovered by recruiters.
              </p>
            </FadeInView>

            <FadeInView delay={0.24}>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#cta" className="btn-primary">
                  Start Internship
                  <ArrowRight size={16} />
                </a>
                <button className="btn-secondary">
                  <Play size={16} className="text-primary" />
                  Watch Demo
                </button>
              </div>
            </FadeInView>

            <FadeInView delay={0.32}>
              <div className="mt-12 grid grid-cols-3 gap-6 pt-8 divider">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-heading">
                    <AnimatedCounter value={10000} suffix="+" />
                  </p>
                  <p className="mt-1 text-sm text-subtle">Students</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-heading">
                    <AnimatedCounter value={50000} suffix="+" />
                  </p>
                  <p className="mt-1 text-sm text-subtle">Tasks Completed</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-heading">
                    <AnimatedCounter value={5000} suffix="+" />
                  </p>
                  <p className="mt-1 text-sm text-subtle">Certificates Issued</p>
                </div>
              </div>
            </FadeInView>
          </div>

          <FadeInView delay={0.15} direction="left">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="surface-card overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-black/30">
                <div className="dashboard-chrome">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs font-medium text-subtle ml-2">
                    InternX Dashboard — Internship Flow
                  </span>
                </div>

                <div className="p-5 sm:p-6 bg-surface">
                  {workflowSteps.map((step, index) => {
                    const Icon = step.icon
                    const isLast = index === workflowSteps.length - 1

                    return (
                      <div key={step.label}>
                        <motion.div
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.45 + index * 0.1, duration: 0.4 }}
                          className="flex items-center gap-4 p-3 rounded-xl border border-border hover:border-border-strong surface-card-hover bg-surface"
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${step.color}`}
                          >
                            <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-heading truncate">
                              {step.label}
                            </p>
                            <p className="text-xs text-subtle">
                              Step {index + 1} of {workflowSteps.length}
                            </p>
                          </div>
                          {index >= 4 && (
                            <span className="text-xs font-semibold text-accent bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                              Complete
                            </span>
                          )}
                          {index === 3 && (
                            <span className="text-xs font-semibold text-primary bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-md">
                              In Progress
                            </span>
                          )}
                        </motion.div>
                        {!isLast && (
                          <div className="flex justify-center py-1">
                            <ChevronDown size={16} className="text-slate-300 dark:text-slate-600" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.4 }}
                className="absolute -bottom-4 -left-4 sm:-left-6 surface-card px-4 py-3 shadow-lg"
              >
                <p className="text-xs text-subtle">Overall Progress</p>
                <p className="text-lg font-bold text-accent">75% Complete</p>
              </motion.div>
            </motion.div>
          </FadeInView>
        </div>
      </div>
    </section>
  )
}
