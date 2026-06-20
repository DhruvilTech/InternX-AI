import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Compass,
  Building2,
  UserCircle,
  ClipboardList,
  Upload,
  MessageSquare,
  TrendingUp,
  Mic,
  Award,
  UserSearch,
} from 'lucide-react'
import SectionHeader from '../ui/SectionHeader'

const steps = [
  { icon: Compass, title: 'Choose Career Path', description: 'Select your target role and industry focus.' },
  { icon: Building2, title: 'AI Generates Company', description: 'A virtual company is created with realistic context.' },
  { icon: UserCircle, title: 'Meet AI Manager', description: 'Your AI manager sets expectations and guides you.' },
  { icon: ClipboardList, title: 'Receive Internship Tasks', description: 'Real-world projects are assigned to your role.' },
  { icon: Upload, title: 'Submit Projects', description: 'Deliver work via GitHub with structured submissions.' },
  { icon: MessageSquare, title: 'Receive AI Feedback', description: 'Detailed evaluation with improvement suggestions.' },
  { icon: TrendingUp, title: 'Track Skill Growth', description: 'Monitor progress across technical and soft skills.' },
  { icon: Mic, title: 'Practice Interviews', description: 'Simulate technical and behavioral interviews.' },
  { icon: Award, title: 'Earn Certificate', description: 'Receive a verified, shareable completion certificate.' },
  { icon: UserSearch, title: 'Get Discovered By Recruiters', description: 'Enter the talent pool visible to hiring teams.' },
]

function TimelineStep({ step, index, totalSteps }) {
  const Icon = step.icon
  const isEven = index % 2 === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex items-start gap-6 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
    >
      <div className={`flex-1 ${isEven ? 'lg:text-right' : 'lg:text-left'} hidden lg:block`}>
        <div className={`inline-block p-5 surface-card surface-card-hover max-w-sm ${isEven ? 'ml-auto' : ''}`}>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Step {index + 1}
          </span>
          <h3 className="mt-1 text-lg font-semibold text-heading">{step.title}</h3>
          <p className="mt-2 text-sm text-subtle">{step.description}</p>
        </div>
      </div>

      <div className="relative flex flex-col items-center shrink-0">
        <motion.div
          whileHover={{ scale: 1.08 }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-blue-500/25 z-10"
        >
          <Icon size={20} />
        </motion.div>
        {index < totalSteps - 1 && (
          <div className="w-0.5 h-full min-h-[60px] bg-border mt-2" />
        )}
      </div>

      <div className="flex-1 lg:hidden">
        <div className="p-5 surface-card">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Step {index + 1}
          </span>
          <h3 className="mt-1 text-lg font-semibold text-heading">{step.title}</h3>
          <p className="mt-2 text-sm text-subtle">{step.description}</p>
        </div>
      </div>

      <div className={`flex-1 hidden lg:block ${isEven ? '' : 'invisible'}`} />
    </motion.div>
  )
}

export default function HowItWorks() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.9], ['0%', '100%'])

  return (
    <section id="how-it-works" className="section-padding section-alt">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Process"
          title="How It Works"
          description="From career selection to recruiter discovery — a structured 10-step journey that builds real, verifiable experience."
        />

        <div ref={containerRef} className="relative max-w-4xl mx-auto">
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2">
            <motion.div
              className="w-full bg-primary origin-top"
              style={{ height: lineHeight }}
            />
          </div>

          <div className="space-y-4 lg:space-y-0">
            {steps.map((step, index) => (
              <TimelineStep
                key={step.title}
                step={step}
                index={index}
                totalSteps={steps.length}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
