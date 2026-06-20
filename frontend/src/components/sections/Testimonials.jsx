import { Quote } from 'lucide-react'
import FadeInView from '../ui/FadeInView'
import SectionHeader from '../ui/SectionHeader'

const testimonials = [
  {
    type: 'Student',
    name: 'Priya Sharma',
    role: 'CS Graduate, IIT Delhi',
    quote:
      "InternX AI gave me the experience I couldn't get anywhere else. I completed three real projects, earned a verified certificate, and got interview calls within two weeks of finishing.",
    border: 'border-l-primary',
  },
  {
    type: 'Recruiter',
    name: 'Michael Chen',
    role: 'Talent Lead, TechFlow Inc.',
    quote:
      'We stopped guessing from resumes. InternX candidates come with verified project scores and skill breakdowns. Our hiring quality improved significantly in the first quarter.',
    border: 'border-l-accent',
  },
  {
    type: 'College Admin',
    name: 'Dr. Ananya Krishnan',
    role: 'Placement Director, VIT University',
    quote:
      "Our placement readiness jumped 34% in one semester. The college dashboard gives us visibility into every department's progress — something we never had before.",
    border: 'border-l-slate-400 dark:border-l-slate-500',
  },
  {
    type: 'Student',
    name: 'Arjun Patel',
    role: 'IT Graduate, NIT Trichy',
    quote:
      'The AI manager felt surprisingly realistic. Task feedback was specific and actionable — not generic. My GitHub portfolio went from empty to three production-quality projects.',
    border: 'border-l-primary',
  },
  {
    type: 'Recruiter',
    name: 'Sarah Williams',
    role: 'HR Director, DataSphere',
    quote:
      'Certificate verification and project review in one portal saved our team hours per candidate. We hired four InternX graduates last cycle — all performing above expectations.',
    border: 'border-l-accent',
  },
  {
    type: 'College Admin',
    name: 'Prof. Rajesh Mehta',
    role: 'Dean, Engineering, BITS Pilani',
    quote:
      'InternX bridges the gap between curriculum and industry. Students graduate with proof of work, not just proof of attendance. That changes everything for placements.',
    border: 'border-l-slate-400 dark:border-l-slate-500',
  },
]

const typeBadge = {
  Student: 'bg-blue-50 dark:bg-blue-500/10 text-primary',
  Recruiter: 'bg-emerald-50 dark:bg-emerald-500/10 text-accent',
  'College Admin': 'bg-slate-100 dark:bg-slate-800 text-heading',
}

export default function Testimonials() {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Testimonials"
          title="Trusted By Students, Recruiters, and Colleges"
          description="Real outcomes from the people who use InternX AI every day."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item, index) => (
            <FadeInView key={item.name} delay={index * 0.06}>
              <div
                className={`h-full p-6 surface-card surface-card-hover border-l-4 ${item.border}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeBadge[item.type]}`}
                  >
                    {item.type}
                  </span>
                  <Quote size={18} className="text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-sm text-text leading-relaxed mb-6">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold text-heading">{item.name}</p>
                  <p className="text-xs text-subtle mt-0.5">{item.role}</p>
                </div>
              </div>
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  )
}
