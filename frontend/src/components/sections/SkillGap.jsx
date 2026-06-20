import { ArrowRight } from 'lucide-react'
import FadeInView from '../ui/FadeInView'
import SectionHeader from '../ui/SectionHeader'
import ProgressBar from '../ui/ProgressBar'

const beforeSkills = [
  { label: 'Python', value: 60 },
  { label: 'Machine Learning', value: 50 },
  { label: 'Communication', value: 40 },
]

const afterSkills = [
  { label: 'Python', value: 90 },
  { label: 'Machine Learning', value: 85 },
  { label: 'Communication', value: 80 },
]

export default function SkillGap() {
  return (
    <section className="section-padding section-alt">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Skill Growth"
          title="Measurable Improvement, Not Just Completion"
          description="Track skill development before and after your internship. InternX AI identifies gaps and measures growth across technical and soft skills."
        />

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <FadeInView direction="right">
            <div className="p-6 sm:p-8 surface-card">
              <div className="flex items-center gap-2 mb-6">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <h3 className="text-lg font-semibold text-heading">Before Internship</h3>
              </div>
              <div className="space-y-5">
                {beforeSkills.map((skill, index) => (
                  <ProgressBar
                    key={skill.label}
                    label={skill.label}
                    value={skill.value}
                    delay={index * 0.1}
                    color="secondary"
                  />
                ))}
              </div>
            </div>
          </FadeInView>

          <FadeInView direction="left" delay={0.12}>
            <div className="p-6 sm:p-8 surface-card border-emerald-200 dark:border-emerald-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-2 mb-6 relative">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <h3 className="text-lg font-semibold text-heading">After Internship</h3>
              </div>
              <div className="space-y-5 relative">
                {afterSkills.map((skill, index) => (
                  <ProgressBar
                    key={skill.label}
                    label={skill.label}
                    value={skill.value}
                    delay={0.3 + index * 0.1}
                    color="accent"
                  />
                ))}
              </div>
            </div>
          </FadeInView>
        </div>

        <FadeInView delay={0.25}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-subtle">
            {beforeSkills.map((skill, i) => {
              const growth = afterSkills[i].value - skill.value
              return (
                <div key={skill.label} className="flex items-center gap-2">
                  <span className="font-medium text-text">{skill.label}</span>
                  <span>{skill.value}%</span>
                  <ArrowRight size={14} />
                  <span className="font-semibold text-accent">{afterSkills[i].value}%</span>
                  <span className="text-xs font-semibold text-accent bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    +{growth}%
                  </span>
                </div>
              )
            })}
          </div>
        </FadeInView>
      </div>
    </section>
  )
}
