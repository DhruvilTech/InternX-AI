import { useTheme } from '../../context/ThemeContext'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'
import FadeInView from '../ui/FadeInView'
import SectionHeader from '../ui/SectionHeader'

const radarData = [
  { subject: 'Code Quality', score: 94, fullMark: 100 },
  { subject: 'Architecture', score: 88, fullMark: 100 },
  { subject: 'Security', score: 91, fullMark: 100 },
  { subject: 'Performance', score: 85, fullMark: 100 },
  { subject: 'Documentation', score: 96, fullMark: 100 },
]

const barData = [
  { name: 'Code Quality', score: 94 },
  { name: 'Architecture', score: 88 },
  { name: 'Security', score: 91 },
  { name: 'Performance', score: 85 },
  { name: 'Documentation', score: 96 },
]

const barColors = ['#2563EB', '#3B82F6', '#059669', '#6366F1', '#0EA5E9']

export default function AIEvaluation() {
  const { isDark } = useTheme()
  const gridColor = isDark ? '#1E293B' : '#F1F5F9'
  const tickColor = isDark ? '#94A3B8' : '#64748B'
  const tooltipStyle = {
    borderRadius: '8px',
    border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
    backgroundColor: isDark ? '#1A2234' : '#FFFFFF',
    color: isDark ? '#E2E8F0' : '#111827',
    fontSize: '13px',
  }

  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="AI Evaluation"
          title="Objective, Multi-Dimensional Assessment"
          description="Every project submission is evaluated across five professional dimensions — giving students and recruiters a clear picture of real capability."
        />

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <FadeInView direction="right">
            <div className="p-6 surface-card">
              <p className="text-sm font-semibold text-heading mb-4">Performance Radar</p>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke={gridColor} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor, fontSize: 12 }} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#2563EB"
                    fill="#2563EB"
                    fillOpacity={isDark ? 0.25 : 0.15}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </FadeInView>

          <FadeInView direction="left" delay={0.1}>
            <div className="space-y-6">
              <div className="p-6 surface-card">
                <p className="text-sm font-semibold text-heading mb-4">Score Breakdown</p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: tickColor, fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      tick={{ fill: tickColor, fontSize: 11 }}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={20}>
                      {barData.map((_, index) => (
                        <Cell key={index} fill={barColors[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between p-6 rounded-2xl bg-secondary dark:bg-slate-900 border border-slate-800 text-white">
                <div>
                  <p className="text-sm text-slate-400">Overall Score</p>
                  <p className="text-4xl font-bold mt-1">
                    92<span className="text-lg text-slate-400">/100</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-emerald-400 font-semibold">Top 8%</p>
                  <p className="text-xs text-slate-400 mt-1">Among AI Engineer Interns</p>
                </div>
              </div>
            </div>
          </FadeInView>
        </div>
      </div>
    </section>
  )
}
