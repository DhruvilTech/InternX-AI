import { motion } from 'framer-motion'
import {
  Search,
  FolderGit2,
  BarChart3,
  ShieldCheck,
  Star,
  Filter,
} from 'lucide-react'
import FadeInView from '../ui/FadeInView'
import SectionHeader from '../ui/SectionHeader'

const recruiterFeatures = [
  { icon: Search, label: 'Search Candidates' },
  { icon: FolderGit2, label: 'View Projects' },
  { icon: BarChart3, label: 'Review Scores' },
  { icon: ShieldCheck, label: 'Verify Certificates' },
  { icon: Star, label: 'Shortlist Talent' },
]

const candidates = [
  {
    name: 'Priya Sharma',
    role: 'AI Engineer Intern',
    score: 92,
    skills: ['Python', 'ML', 'TensorFlow'],
    status: 'Top Match',
  },
  {
    name: 'Arjun Patel',
    role: 'Full Stack Intern',
    score: 88,
    skills: ['React', 'Node.js', 'PostgreSQL'],
    status: 'Shortlisted',
  },
  {
    name: 'Sneha Reddy',
    role: 'Data Science Intern',
    score: 95,
    skills: ['Python', 'SQL', 'Tableau'],
    status: 'Top Match',
  },
]

export default function Recruiter() {
  return (
    <section id="recruiters" className="section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="For Recruiters"
          title="Hire Talent Based On Skills, Not Just Resumes"
          description="Access a pipeline of pre-evaluated candidates with verified projects, skill scores, and internship certificates."
        />

        <FadeInView>
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.3 }}
            className="surface-card shadow-xl overflow-hidden"
          >
            <div className="px-5 py-4 surface-panel-muted border-b border-border flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-heading">Recruiter Portal</p>
                <p className="text-xs text-subtle">Talent Discovery Dashboard</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {recruiterFeatures.map((feature) => {
                  const Icon = feature.icon
                  return (
                    <div
                      key={feature.label}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg surface-panel text-xs font-medium text-subtle"
                    >
                      <Icon size={12} />
                      {feature.label}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="p-5 sm:p-6 bg-surface">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex-1 min-w-[200px] relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
                  />
                  <input
                    type="text"
                    readOnly
                    value="AI Engineer Intern — Score 85+"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-lg surface-panel-muted text-text"
                  />
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-surface-muted transition-colors">
                  <Filter size={14} />
                  Filters
                </button>
              </div>

              <div className="space-y-3">
                {candidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.name}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border hover:border-primary/40 surface-card-hover"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full icon-box-primary text-sm font-bold">
                        {candidate.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-heading">{candidate.name}</p>
                        <p className="text-xs text-subtle">{candidate.role}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {candidate.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs font-medium text-subtle surface-panel-muted px-2 py-1 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-accent">{candidate.score}</p>
                        <p className="text-[10px] text-subtle uppercase">Score</p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                          candidate.status === 'Top Match'
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-accent'
                            : 'bg-blue-50 dark:bg-blue-500/10 text-primary'
                        }`}
                      >
                        {candidate.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </FadeInView>
      </div>
    </section>
  )
}
