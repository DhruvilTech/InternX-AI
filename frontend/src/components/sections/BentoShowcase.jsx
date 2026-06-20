import { motion } from 'framer-motion'
import {
  Sparkles,
  Building2,
  UserCircle,
  ListTodo,
  GitPullRequest,
  BarChart3,
  TrendingUp,
  GraduationCap,
  Mic,
  Award,
  Users,
  School,
  GitBranch,
} from 'lucide-react'
import TiltCard from '../ui/TiltCard'

const features = [
  {
    title: 'AI Internship Generator',
    desc: 'One-click company creation',
    icon: Sparkles,
    size: 'col-span-2 row-span-2',
    gradient: 'from-violet/20 to-accent/10',
  },
  {
    title: 'AI Companies',
    desc: 'Living virtual workplaces',
    icon: Building2,
    size: 'col-span-1 row-span-1',
    gradient: 'from-cyan/15 to-transparent',
  },
  {
    title: 'AI Managers',
    desc: 'Personalized mentorship',
    icon: UserCircle,
    size: 'col-span-1 row-span-1',
    gradient: 'from-accent/15 to-transparent',
  },
  {
    title: 'Task Assignment',
    desc: 'Real sprint workflows',
    icon: ListTodo,
    size: 'col-span-1 row-span-2',
    gradient: 'from-emerald/15 to-transparent',
  },
  {
    title: 'GitHub Submission',
    desc: 'Real code, real repos',
    icon: GitPullRequest,
    size: 'col-span-1 row-span-1',
    gradient: 'from-cyan/15 to-transparent',
  },
  {
    title: 'AI Evaluation',
    desc: '5-dimension scoring',
    icon: BarChart3,
    size: 'col-span-2 row-span-1',
    gradient: 'from-amber/10 to-rose/10',
  },
  {
    title: 'Skill Gap Analysis',
    desc: 'Track your growth',
    icon: TrendingUp,
    size: 'col-span-1 row-span-1',
    gradient: 'from-violet/10 to-transparent',
  },
  {
    title: 'Career Coach',
    desc: 'AI-powered guidance',
    icon: GraduationCap,
    size: 'col-span-1 row-span-1',
    gradient: 'from-emerald/10 to-transparent',
  },
  {
    title: 'Interview Simulator',
    desc: 'Practice with AI',
    icon: Mic,
    size: 'col-span-1 row-span-1',
    gradient: 'from-cyan/10 to-transparent',
  },
  {
    title: 'Certificates',
    desc: 'Verified credentials',
    icon: Award,
    size: 'col-span-1 row-span-1',
    gradient: 'from-accent/10 to-transparent',
  },
  {
    title: 'Recruiter Portal',
    desc: 'Discover talent',
    icon: Users,
    size: 'col-span-1 row-span-1',
    gradient: 'from-amber/10 to-transparent',
  },
  {
    title: 'College Dashboard',
    desc: 'Track student outcomes',
    icon: School,
    size: 'col-span-1 row-span-1',
    gradient: 'from-rose/10 to-transparent',
  },
  {
    title: 'Hiring Pipeline',
    desc: 'End-to-end placement',
    icon: GitBranch,
    size: 'col-span-2 row-span-1',
    gradient: 'from-accent/10 via-violet/10 to-cyan/10',
  },
]

export default function BentoShowcase() {
  return (
    <section id="features" className="relative py-32 bg-deep overflow-hidden">

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-3">
            Everything included
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold">
            The complete platform
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[minmax(140px,auto)] gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <TiltCard key={feature.title} intensity={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.025, y: -4 }}
                  className={`${feature.size} group relative glass-bright rounded-2xl p-5 cursor-pointer h-full min-h-[140px] flex flex-col justify-between hover:border-accent/30 hover:shadow-[0_0_30px_rgba(129,140,248,0.2)] transition-all duration-300 overflow-hidden`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />
                  {/* Glossy futuristic shine sweep */}
                  <div className="absolute inset-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-[1200ms] ease-in-out pointer-events-none" />

                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-accent/10 transition-all duration-300">
                      <Icon size={18} className="text-accent group-hover:rotate-12 group-hover:text-accent-bright transition-all duration-300" />
                    </div>
                    <h3 className="font-display font-semibold text-sm sm:text-base text-text">{feature.title}</h3>
                    <p className="text-[11px] sm:text-xs text-muted mt-1">{feature.desc}</p>
                  </div>
                  <div
                    className="absolute bottom-3 right-3 w-20 h-20 rounded-full bg-accent/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </motion.div>
              </TiltCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
