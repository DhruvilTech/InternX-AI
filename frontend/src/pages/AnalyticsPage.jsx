import { useTheme } from '../context/ThemeContext'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, BarChart2, CheckCircle, Target, Award } from 'lucide-react'

const performanceTrends = [
  { week: 'Week 1', score: 72, tasksCompleted: 2 },
  { week: 'Week 2', score: 78, tasksCompleted: 3 },
  { week: 'Week 3', score: 85, tasksCompleted: 4 },
  { week: 'Week 4', score: 92, tasksCompleted: 5 },
  { week: 'Week 5', score: 94, tasksCompleted: 4 },
  { week: 'Week 6', score: 96, tasksCompleted: 6 }
]

const growthCurveData = [
  { milestone: 'Seed', index: 30 },
  { milestone: 'Sprint 1', index: 52 },
  { milestone: 'Sprint 2', index: 68 },
  { milestone: 'Sprint 3', index: 78 },
  { milestone: 'Sprint 4', index: 89 },
  { milestone: 'Release', index: 94 }
]

export default function AnalyticsPage() {
  const { isDark } = useTheme()
  const gridColor = isDark ? '#1E293B' : '#E2E8F0'
  const tickColor = isDark ? '#94A3B8' : '#64748B'

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 space-y-8 relative z-10">
        
        {/* Title */}
        <div className="flex justify-between items-center border-b border-border pb-6">
          <div>
            <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em] block">Data Insights</span>
            <h2 className="font-display font-bold text-3xl mt-1">Analytics Dashboard</h2>
            <p className="text-xs text-muted mt-1">Track task completion velocity and performance growth curves.</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-border bg-void/50 glass">
            <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Tasks Completed</span>
            <span className="text-xl font-bold text-text">24 / 28</span>
            <span className="text-[9px] text-emerald font-semibold block mt-1">+12% velocity</span>
          </div>

          <div className="p-4 rounded-xl border border-border bg-void/50 glass">
            <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Avg Audit Rating</span>
            <span className="text-xl font-bold text-text">92.4%</span>
            <span className="text-[9px] text-accent font-semibold block mt-1">Top 8% cohort</span>
          </div>

          <div className="p-4 rounded-xl border border-border bg-void/50 glass">
            <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Practice Interview Hours</span>
            <span className="text-xl font-bold text-text">14.2 hrs</span>
            <span className="text-[9px] text-amber font-semibold block mt-1">Ready check: high</span>
          </div>

          <div className="p-4 rounded-xl border border-border bg-void/50 glass">
            <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Profile View Count</span>
            <span className="text-xl font-bold text-text">84</span>
            <span className="text-[9px] text-emerald font-semibold block mt-1">+18% views this week</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-12 gap-6">
          
          {/* Performance Trend and score history */}
          <div className="md:col-span-8 glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-accent" />
                <h3 className="text-xs font-bold text-text uppercase tracking-wider">Evaluation & Grade Curves</h3>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceTrends} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="week" tick={{ fill: tickColor, fontSize: 9 }} stroke="rgba(255,255,255,0.05)" />
                  <YAxis tick={{ fill: tickColor, fontSize: 9 }} stroke="rgba(255,255,255,0.05)" domain={[60, 100]} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: isDark ? '#050816' : '#ffffff',
                      color: isDark ? '#f1f5f9' : '#0f172a',
                      fontSize: '11px',
                    }}
                  />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="score" stroke="#8B5CF6" name="Average Grade" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Task Completion Velocity */}
          <div className="md:col-span-4 glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
            <div className="flex items-center gap-2">
              <BarChart2 size={16} className="text-violet" />
              <h3 className="text-xs font-bold text-text uppercase tracking-wider">Task Completion Velocity</h3>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceTrends} margin={{ left: -30, right: 5, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                  <XAxis dataKey="week" tick={{ fill: tickColor, fontSize: 8 }} stroke="rgba(255,255,255,0.05)" />
                  <YAxis tick={{ fill: tickColor, fontSize: 8 }} stroke="rgba(255,255,255,0.05)" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: isDark ? '#050816' : '#ffffff',
                      color: isDark ? '#f1f5f9' : '#0f172a',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="tasksCompleted" fill="#6366F1" radius={[4, 4, 0, 0]} name="Tasks Completed" barSize={15} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Growth Curve */}
          <div className="md:col-span-12 glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-accent" />
                <h3 className="text-xs font-bold text-text uppercase tracking-wider">Skill Growth Curve (Internship Pipeline)</h3>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthCurveData} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="milestone" tick={{ fill: tickColor, fontSize: 8 }} stroke="rgba(255,255,255,0.05)" />
                  <YAxis tick={{ fill: tickColor, fontSize: 8 }} stroke="rgba(255,255,255,0.05)" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: isDark ? '#050816' : '#ffffff',
                      color: isDark ? '#f1f5f9' : '#0f172a',
                      fontSize: '11px',
                    }}
                  />
                  <Area type="monotone" dataKey="index" stroke="#38BDF8" fill="url(#growthGrad)" name="Skill Index Rating" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
