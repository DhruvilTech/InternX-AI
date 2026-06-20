import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const beforeSkills = [
  { name: 'Python', value: 40 },
  { name: 'ML', value: 30 },
  { name: 'Communication', value: 35 },
  { name: 'System Design', value: 25 },
  { name: 'Git', value: 45 },
]

const afterSkills = [
  { name: 'Python', value: 90 },
  { name: 'ML', value: 85 },
  { name: 'Communication', value: 80 },
  { name: 'System Design', value: 78 },
  { name: 'Git', value: 92 },
]

export default function SkillEvolution() {
  const { isDark } = useTheme()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const morphProgress = useTransform(scrollYProgress, [0.15, 0.65], [0, 1])
  const [progress, setProgress] = useState(0)

  useMotionValueEvent(morphProgress, 'change', (v) => setProgress(v))

  const radarData = afterSkills.map((s, i) => ({
    subject: s.name,
    before: beforeSkills[i].value,
    after: beforeSkills[i].value + (afterSkills[i].value - beforeSkills[i].value) * progress,
    fullMark: 100,
  }))

  const avgGrowth = Math.round(35 + 50 * progress)

  return (
    <section ref={ref} id="skills" className="relative py-32 overflow-hidden min-h-screen flex items-center">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,92,246,0.12), transparent 70%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold text-violet uppercase tracking-[0.2em] mb-3">
            Skill Evolution
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Watch yourself grow
          </h2>
          <p className="text-muted max-w-md mx-auto">
            Scroll to see your skills transform from beginner to job-ready.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <SkillPanel label="Before Internship" skills={beforeSkills} progress={0} dimmed />
            <SkillPanel label="After Internship" skills={afterSkills} progress={progress} />
          </div>

          <div className="glass-bright rounded-2xl p-8 glow-accent">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium">Skill Radar</span>
              <div className="flex items-center gap-1 text-emerald text-xs">
                <TrendingUp size={14} />
                {avgGrowth}% avg growth
              </div>
            </div>
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.1)'} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? '#94a3b8' : '#475569', fontSize: 11 }} />
                  <Radar
                    dataKey="before"
                    stroke="#64748b"
                    fill="#64748b"
                    fillOpacity={0.1}
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />
                  <Radar
                    dataKey="after"
                    stroke="#818cf8"
                    fill="#818cf8"
                    fillOpacity={0.3}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SkillPanel({ label, skills, progress, dimmed = false }) {
  const isAfter = !dimmed

  return (
    <div className={`glass rounded-xl p-6 ${dimmed ? 'opacity-60' : 'glow-accent'}`}>
      <p className="text-xs text-muted uppercase tracking-wider mb-4">{label}</p>
      <div className="space-y-4">
        {skills.map((skill, i) => {
          const before = beforeSkills[i].value
          const after = afterSkills[i].value
          const width = isAfter ? before + (after - before) * progress : before

          return (
            <div key={skill.name}>
              <div className="flex justify-between text-xs mb-1.5">
                <span>{skill.name}</span>
                <span className="font-semibold text-accent-bright">{Math.round(width)}</span>
              </div>
              <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet to-accent rounded-full"
                  style={{ width: `${width}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
