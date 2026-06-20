import { useTheme } from '../../context/ThemeContext'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { GraduationCap, Users, TrendingUp, Building } from 'lucide-react'
import FadeInView from '../ui/FadeInView'
import SectionHeader from '../ui/SectionHeader'

const departmentData = [
  { dept: 'CS', score: 88, students: 420 },
  { dept: 'IT', score: 82, students: 310 },
  { dept: 'ECE', score: 76, students: 280 },
  { dept: 'ME', score: 71, students: 190 },
  { dept: 'MBA', score: 85, students: 150 },
]

const trendData = [
  { month: 'Jan', readiness: 62 },
  { month: 'Feb', readiness: 68 },
  { month: 'Mar', readiness: 74 },
  { month: 'Apr', readiness: 79 },
  { month: 'May', readiness: 84 },
  { month: 'Jun', readiness: 89 },
]

const metrics = [
  { icon: TrendingUp, label: 'Placement Readiness', value: '89%', change: '+12%' },
  { icon: GraduationCap, label: 'Internships Completed', value: '1,247', change: '+34%' },
  { icon: Users, label: 'Average Scores', value: '84/100', change: '+8 pts' },
  { icon: Building, label: 'Departments Active', value: '12', change: '+3' },
]

export default function College() {
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
    <section id="colleges" className="section-padding section-alt">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="For Colleges"
          title="Institutional Analytics At Your Fingertips"
          description="Track student readiness, department performance, and internship outcomes with a comprehensive college dashboard."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <FadeInView key={metric.label} delay={index * 0.06}>
                <div className="p-5 surface-card surface-card-hover">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg icon-box-primary">
                      <Icon size={16} />
                    </div>
                    <span className="text-xs font-semibold text-accent bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {metric.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-heading">{metric.value}</p>
                  <p className="text-xs text-subtle mt-1">{metric.label}</p>
                </div>
              </FadeInView>
            )
          })}
        </div>

        <FadeInView delay={0.15}>
          <div className="surface-card shadow-lg overflow-hidden">
            <div className="px-5 py-4 surface-panel-muted border-b border-border">
              <p className="text-sm font-semibold text-heading">College Analytics Dashboard</p>
              <p className="text-xs text-subtle">Spring 2026 Semester Overview</p>
            </div>

            <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
              <div className="p-5 sm:p-6 bg-surface">
                <p className="text-sm font-semibold text-heading mb-4">Department Performance</p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="dept" tick={{ fill: tickColor, fontSize: 12 }} />
                    <YAxis tick={{ fill: tickColor, fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="score" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-5 sm:p-6 bg-surface">
                <p className="text-sm font-semibold text-heading mb-4">Placement Readiness Trend</p>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="month" tick={{ fill: tickColor, fontSize: 12 }} />
                    <YAxis tick={{ fill: tickColor, fontSize: 12 }} domain={[50, 100]} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="readiness"
                      stroke="#059669"
                      strokeWidth={2.5}
                      dot={{ fill: '#059669', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  )
}
