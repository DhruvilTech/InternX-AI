import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import FadeInView from '../ui/FadeInView'
import SectionHeader from '../ui/SectionHeader'

const faqs = [
  {
    question: 'How is this different from online courses?',
    answer:
      'InternX AI simulates a full internship — with a virtual company, AI manager, assigned projects, evaluations, and recruiter visibility. Courses teach concepts; InternX builds verifiable work experience.',
  },
  {
    question: 'Do recruiters actually use InternX certificates?',
    answer:
      'Yes. Our recruiter portal lets hiring teams search candidates by skill scores, review submitted projects, and verify certificates via QR codes. Over 200 companies actively source from our talent pool.',
  },
  {
    question: 'How long does a virtual internship take?',
    answer:
      'Most internships run 6–8 weeks with 10–15 hours per week. Students progress at their own pace while receiving structured tasks and AI feedback throughout.',
  },
  {
    question: 'Can colleges integrate InternX with their placement cell?',
    answer:
      'Absolutely. Our college dashboard provides department-level analytics, placement readiness tracking, and bulk student enrollment — designed for institutional adoption.',
  },
  {
    question: 'What roles and industries are supported?',
    answer:
      'We support AI/ML Engineer, Full Stack Developer, Data Scientist, DevOps, Product Manager, and more. New career paths are added based on industry demand.',
  },
  {
    question: 'Is the AI evaluation reliable?',
    answer:
      'Our evaluation engine scores submissions across five dimensions — code quality, architecture, security, performance, and documentation — calibrated against industry standards and reviewed continuously.',
  },
]

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className="surface-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-muted transition-colors"
      >
        <span className="text-sm font-semibold text-heading pr-4">{faq.question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown size={18} className="text-subtle" />
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-subtle leading-relaxed">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className="section-padding section-alt">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="FAQ"
          title="Frequently Asked Questions"
          description="Everything you need to know about InternX AI virtual internships."
        />

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <FadeInView key={faq.question} delay={index * 0.04}>
              <FAQItem
                faq={faq}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
              />
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  )
}
