import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import { Shield, Zap, Code2, Layers, FileText, Sparkles } from 'lucide-react'
import ScoreRing from '../ui/ScoreRing'
import PulseDot from '../ui/PulseDot'
import { useTheme } from '../../context/ThemeContext'

const metrics = [
  { name: 'Code Quality', score: 94, icon: Code2, color: 'text-accent' },
  { name: 'Architecture', score: 88, icon: Layers, color: 'text-violet' },
  { name: 'Performance', score: 91, icon: Zap, color: 'text-cyan' },
  { name: 'Security', score: 87, icon: Shield, color: 'text-emerald' },
  { name: 'Documentation', score: 85, icon: FileText, color: 'text-amber' },
]

const insights = [
  'Clean separation of concerns in service layer',
  'Consider adding integration tests for API endpoints',
  'Excellent use of async patterns — no blocking calls detected',
  'Security headers properly configured',
]

export default function AIEvaluationEngine() {
  const { isDark } = useTheme()
  const [overallScore, setOverallScore] = useState(0)
  const [radarData, setRadarData] = useState(
    metrics.map((m) => ({ subject: m.name.split(' ')[0], value: 0, fullMark: 100 })),
  )
  const [insightIndex, setInsightIndex] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setOverallScore(92)
      setRadarData(
        metrics.map((m) => ({
          subject: m.name.split(' ')[0],
          value: m.score,
          fullMark: 100,
        })),
      )
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setInsightIndex((i) => (i + 1) % insights.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="evaluation" className="relative py-32 bg-deep overflow-hidden">


      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-3">
            AI Evaluation Engine
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Every line of code, analyzed
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Score ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-3 flex flex-col items-center"
          >
            <ScoreRing score={overallScore} size={160} strokeWidth={8} label="Overall" />
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-sm text-muted text-center max-w-[180px]"
            >
              Comprehensive evaluation across 5 dimensions
            </motion.p>
          </motion.div>

          {/* Radar chart */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 glass-bright rounded-2xl p-6 glow-accent"
          >
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.1)'} />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: isDark ? '#94a3b8' : '#475569', fontSize: 11 }}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#818cf8"
                    fill="#818cf8"
                    fillOpacity={0.25}
                    strokeWidth={2}
                    isAnimationActive
                    animationDuration={1500}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Metric bars + insights */}
          <div className="lg:col-span-4 space-y-4">
            {metrics.map((m, i) => {
              const Icon = m.icon
              return (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="glass rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className={m.color} />
                      <span className="text-xs font-medium">{m.name}</span>
                    </div>
                    <span className="text-sm font-bold">{m.score}</span>
                  </div>
                  <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-accent to-cyan rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${m.score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </motion.div>
              )
            })}

            <motion.div
              className="glass-bright rounded-xl p-4 border border-accent/20"
              animate={{ borderColor: ['rgba(129,140,248,0.2)', 'rgba(34,211,238,0.3)', 'rgba(129,140,248,0.2)'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-accent" />
                <span className="text-xs font-semibold text-accent">Live Insight</span>
                <PulseDot color="accent" size={5} />
              </div>
              <motion.p
                key={insightIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-muted"
              >
                {insights[insights.length - 1 - insightIndex]}
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
