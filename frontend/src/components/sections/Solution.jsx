import {
  Building2,
  ClipboardCheck,
  BarChart3,
  UserSearch,
} from 'lucide-react'
import FadeInView from '../ui/FadeInView'
import SectionHeader from '../ui/SectionHeader'

const pillars = [
  {
    icon: Building2,
    title: 'AI Creates Virtual Companies',
    description:
      'Students join realistic AI-generated companies with org charts, workflows, and industry-specific contexts — just like a real workplace.',
    color: 'icon-box-primary',
  },
  {
    icon: ClipboardCheck,
    title: 'AI Assigns Real Projects',
    description:
      'Hands-on tasks mirror actual job responsibilities. Students build portfolios with GitHub submissions and documented deliverables.',
    color: 'icon-box-secondary',
  },
  {
    icon: BarChart3,
    title: 'AI Evaluates Performance',
    description:
      'Every submission is scored across code quality, architecture, security, and documentation — with actionable feedback for improvement.',
    color: 'icon-box-accent',
  },
  {
    icon: UserSearch,
    title: 'Recruiters Discover Talent',
    description:
      'Verified certificates, skill scores, and project portfolios connect qualified students directly with hiring teams.',
    color: 'icon-box-primary',
  },
]

export default function Solution() {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Our Solution"
          title="Internships Reimagined With AI"
          description="InternX AI breaks the experience paradox by giving every student access to structured, evaluated, and recruiter-visible internship experience."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon
            return (
              <FadeInView key={pillar.title} delay={index * 0.08}>
                <div className="group h-full p-6 surface-card surface-card-hover">
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${pillar.color} mb-5 group-hover:scale-105 transition-transform`}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-semibold text-heading mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-subtle leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </FadeInView>
            )
          })}
        </div>
      </div>
    </section>
  )
}
