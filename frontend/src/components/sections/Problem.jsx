import { motion } from 'framer-motion'
import { RefreshCw, TrendingDown, Users } from 'lucide-react'
import FadeInView from '../ui/FadeInView'
import SectionHeader from '../ui/SectionHeader'

const stats = [
  {
    icon: TrendingDown,
    value: '73%',
    label: 'of entry-level roles require prior experience',
  },
  {
    icon: Users,
    value: '2.4M',
    label: 'graduates compete for limited internship slots annually',
  },
  {
    icon: RefreshCw,
    value: '68%',
    label: 'of students report being stuck in the experience loop',
  },
]

const paradoxSteps = ['No Experience', 'No Internship', 'No Experience']

export default function Problem() {
  return (
    <section className="section-padding section-alt">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="The Challenge"
          title="The Internship Paradox"
          description="Millions of talented students are caught in a cycle where they need experience to get experience — and traditional internships aren't accessible to everyone."
        />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <FadeInView direction="right">
            <div className="relative flex flex-col items-center">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-dashed border-border"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute inset-8 rounded-full border border-border bg-surface shadow-sm" />

                {paradoxSteps.map((step, index) => {
                  const positions = [
                    'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
                    'bottom-4 right-0 translate-x-1/4',
                    'bottom-4 left-0 -translate-x-1/4',
                  ]

                  return (
                    <div
                      key={step}
                      className={`absolute ${positions[index]} px-4 py-2.5 surface-card shadow-sm`}
                    >
                      <p className="text-sm font-semibold text-heading whitespace-nowrap">
                        {step}
                      </p>
                    </div>
                  )
                })}

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-6">
                    <RefreshCw size={32} className="mx-auto text-primary mb-3" />
                    <p className="text-sm font-medium text-subtle">
                      The cycle repeats for millions of students every year
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-8 flex-wrap justify-center">
                {paradoxSteps.map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-subtle surface-panel px-3 py-1.5 rounded-full">
                      {step}
                    </span>
                    {i < paradoxSteps.length - 1 && (
                      <span className="text-slate-300 dark:text-slate-600">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FadeInView>

          <div className="space-y-5">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <FadeInView key={stat.label} delay={index * 0.08}>
                  <div className="flex gap-5 p-6 surface-card surface-card-hover">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
                      <Icon size={22} className="text-red-500" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-heading">{stat.value}</p>
                      <p className="mt-1 text-sm text-subtle leading-relaxed">{stat.label}</p>
                    </div>
                  </div>
                </FadeInView>
              )
            })}

            <FadeInView delay={0.24}>
              <div className="p-6 rounded-2xl bg-secondary dark:bg-slate-900 border border-slate-800 text-white">
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-300 mb-2">
                  The Real Problem
                </p>
                <p className="text-base leading-relaxed text-slate-300">
                  Students graduate with degrees but lack practical, verifiable work
                  experience. Recruiters can't assess real skills from resumes alone.
                  Colleges struggle to bridge the gap between education and employment.
                </p>
              </div>
            </FadeInView>
          </div>
        </div>
      </div>
    </section>
  )
}
