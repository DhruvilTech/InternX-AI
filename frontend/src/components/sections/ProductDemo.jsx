import { motion } from 'framer-motion'
import {
  Building2,
  Briefcase,
  User,
  CheckCircle2,
  Circle,
  Clock,
  Star,
} from 'lucide-react'
import FadeInView from '../ui/FadeInView'
import SectionHeader from '../ui/SectionHeader'

const tasks = [
  { name: 'Build Resume Analyzer', status: 'completed', score: 94 },
  { name: 'Create Skill Predictor', status: 'completed', score: 91 },
  { name: 'Develop Interview Assistant', status: 'in-progress', score: null },
]

export default function ProductDemo() {
  return (
    <section id="product-demo" className="section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Product Demo"
          title="See InternX AI In Action"
          description="A real internship dashboard — not a mockup concept. Students work inside structured environments that mirror professional workflows."
        />

        <FadeInView>
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.3 }}
            className="surface-card overflow-hidden shadow-xl shadow-slate-200/40 dark:shadow-black/30"
          >
            <div className="dashboard-chrome justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-sm font-medium text-heading">
                  Internship Dashboard
                </span>
              </div>
              <span className="text-xs font-medium text-subtle hidden sm:block">
                Last updated: 2 hours ago
              </span>
            </div>

            <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border">
              <div className="p-6 lg:col-span-1 bg-surface">
                <p className="text-xs font-semibold uppercase tracking-wider text-subtle mb-4">
                  Internship Details
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Building2, label: 'Company', value: 'NeuralMind Technologies', box: 'icon-box-primary' },
                    { icon: Briefcase, label: 'Role', value: 'AI Engineer Intern', box: 'icon-box-secondary' },
                    { icon: User, label: 'Manager', value: 'Sarah Johnson', box: 'icon-box-accent' },
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="flex items-start gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.box}`}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="text-xs text-subtle">{item.label}</p>
                          <p className="text-sm font-semibold text-heading">{item.value}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-6 pt-6 divider">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text">Progress</span>
                    <span className="text-sm font-bold text-primary">75%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      whileInView={{ width: '75%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-accent fill-accent" />
                    <span className="text-sm font-medium text-text">Feedback Score</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-accent">92/100</p>
                </div>
              </div>

              <div className="p-6 lg:col-span-2 bg-surface">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                    Assigned Tasks
                  </p>
                  <span className="text-xs font-medium text-subtle">2 of 3 completed</span>
                </div>

                <div className="space-y-3">
                  {tasks.map((task, index) => (
                    <motion.div
                      key={task.name}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 }}
                      className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-border-strong surface-card-hover"
                    >
                      <div className="flex items-center gap-3">
                        {task.status === 'completed' ? (
                          <CheckCircle2 size={20} className="text-accent" />
                        ) : (
                          <Circle size={20} className="text-primary" />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-heading">{task.name}</p>
                          <p className="text-xs text-subtle flex items-center gap-1 mt-0.5">
                            {task.status === 'completed' ? (
                              'Submitted via GitHub'
                            ) : (
                              <>
                                <Clock size={12} /> In progress — due in 3 days
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      {task.score ? (
                        <span className="text-sm font-bold text-accent bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-lg">
                          {task.score}/100
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-primary bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-lg">
                          Active
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 grid sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Code Reviews', value: '12' },
                    { label: 'Hours Logged', value: '48h' },
                    { label: 'Skills Improved', value: '8' },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="p-4 rounded-xl surface-panel-muted text-center"
                    >
                      <p className="text-xl font-bold text-heading">{metric.value}</p>
                      <p className="text-xs text-subtle mt-1">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </FadeInView>
      </div>
    </section>
  )
}
