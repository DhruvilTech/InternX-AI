import {
  Sparkles,
  Building2,
  UserCog,
  ListTodo,
  FolderGit2,
  BarChart3,
  TrendingUp,
  GraduationCap,
  Mic,
  FileBadge,
  UserSearch,
  LayoutDashboard,
  GitBranch,
} from 'lucide-react'
import FadeInView from '../ui/FadeInView'
import SectionHeader from '../ui/SectionHeader'

const features = [
  { icon: Sparkles, title: 'AI Internship Generator', category: 'Core' },
  { icon: Building2, title: 'AI Virtual Companies', category: 'Core' },
  { icon: UserCog, title: 'AI Managers', category: 'Core' },
  { icon: ListTodo, title: 'Task Assignment', category: 'Workflow' },
  { icon: FolderGit2, title: 'GitHub Submission', category: 'Workflow' },
  { icon: BarChart3, title: 'AI Evaluation', category: 'Assessment' },
  { icon: TrendingUp, title: 'Skill Gap Analysis', category: 'Assessment' },
  { icon: GraduationCap, title: 'Career Coach', category: 'Growth' },
  { icon: Mic, title: 'Interview Simulator', category: 'Growth' },
  { icon: FileBadge, title: 'Certificate Generator', category: 'Credentials' },
  { icon: UserSearch, title: 'Recruiter Portal', category: 'Hiring' },
  { icon: LayoutDashboard, title: 'College Dashboard', category: 'Institution' },
  { icon: GitBranch, title: 'Hiring Pipeline', category: 'Hiring' },
]

const categoryColors = {
  Core: 'icon-box-primary',
  Workflow: 'icon-box-secondary',
  Assessment: 'icon-box-accent',
  Growth: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
  Credentials: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Hiring: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400',
  Institution: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
}

export default function Features() {
  return (
    <section id="features" className="section-padding section-alt">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Platform"
          title="Everything You Need For Career Readiness"
          description="A complete ecosystem connecting students, recruiters, and colleges — powered by AI at every step."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <FadeInView key={feature.title} delay={index * 0.03}>
                <div className="group h-full p-5 surface-card surface-card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${categoryColors[feature.category]} group-hover:scale-105 transition-transform`}
                    >
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle">
                      {feature.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-heading leading-snug">
                    {feature.title}
                  </h3>
                </div>
              </FadeInView>
            )
          })}
        </div>
      </div>
    </section>
  )
}
