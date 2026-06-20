import { useTheme } from '../context/ThemeContext'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { GraduationCap, Users, CheckCircle2, TrendingUp, Award } from 'lucide-react'

const departmentStats = [
  { name: 'Computer Science', count: 120, readyPercent: 82 },
  { name: 'Data Engineering', count: 85, readyPercent: 78 },
  { name: 'Electrical Eng', count: 64, readyPercent: 70 },
  { name: 'Information Tech', count: 90, readyPercent: 75 }
]

const studentCohortData = [
  { name: 'Arjun Kapoor', track: 'AI Engineer', score: 92, progress: 67, readiness: 'High (Top 8%)' },
  { name: 'Chloe Vance', track: 'Frontend Engineer', score: 96, progress: 80, readiness: 'Immediate Placement' },
  { name: 'Kenji Sato', track: 'Backend Developer', score: 88, progress: 100, readiness: 'Placed (Google)' },
  { name: 'Sophia Patel', track: 'Data Scientist', score: 94, progress: 50, readiness: 'High readiness' }
]

const pieColors = ['#8B5CF6', '#6366F1', '#38BDF8', '#10B981']

export default function CollegeDashboardPage() {
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
            <span className="text-xs font-semibold text-emerald uppercase tracking-[0.2em] block">Academic oversight</span>
            <h2 className="font-display font-bold text-3xl mt-1">College Admin Dashboard</h2>
            <p className="text-xs text-muted mt-1">Audit student placement readiness and cohort metrics.</p>
          </div>
        </div>

        {/* Aggregates */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-border bg-void/50 glass text-center">
            <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Enrolled Cohorts</span>
            <span className="text-xl font-bold text-text">359 Students</span>
          </div>
          <div className="p-4 rounded-xl border border-border bg-void/50 glass text-center">
            <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Ready to Hire</span>
            <span className="text-xl font-bold text-emerald">76.8% Index</span>
          </div>
          <div className="p-4 rounded-xl border border-border bg-void/50 glass text-center">
            <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Placed Count</span>
            <span className="text-xl font-bold text-accent">142 students</span>
          </div>
          <div className="p-4 rounded-xl border border-border bg-void/50 glass text-center">
            <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Active Sprints</span>
            <span className="text-xl font-bold text-text">12 Companies</span>
          </div>
        </div>

        {/* Charts Split */}
        <div className="grid md:grid-cols-12 gap-6">
          
          {/* Department readiness bar chart */}
          <div className="md:col-span-8 glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-accent" />
              <h3 className="text-xs font-bold text-text uppercase tracking-wider">Placement Readiness by Department</h3>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentStats} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 8 }} stroke="rgba(255,255,255,0.05)" />
                  <YAxis tick={{ fill: tickColor, fontSize: 8 }} stroke="rgba(255,255,255,0.05)" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: isDark ? '#050816' : '#ffffff',
                      color: isDark ? '#f1f5f9' : '#0f172a',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="readyPercent" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Readiness Index (%)" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Count distribution pie chart */}
          <div className="md:col-span-4 glass border border-border rounded-2xl p-6 bg-void/25 flex flex-col items-center justify-between space-y-4">
            <div className="w-full flex items-center gap-2">
              <Users size={16} className="text-violet" />
              <h3 className="text-xs font-bold text-text uppercase tracking-wider">Cohort Distribution</h3>
            </div>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {departmentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 text-[8px] text-muted font-semibold uppercase">
              {departmentStats.map((dept, idx) => (
                <div key={dept.name} className="flex items-center gap-1.5 truncate">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: pieColors[idx] }} />
                  <span className="truncate">{dept.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed student metrics cohort table */}
          <div className="md:col-span-12 glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap size={16} className="text-accent" />
              <h3 className="text-sm font-bold text-text uppercase tracking-wider">Cohort Student Directory</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs text-muted text-left">
                <thead>
                  <tr className="border-b border-border bg-void/50 text-[10px] uppercase font-bold text-text">
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Career Track</th>
                    <th className="p-3 text-center">Sim Grade</th>
                    <th className="p-3 text-center">Intern Progress</th>
                    <th className="p-3">Readiness Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentCohortData.map((student) => (
                    <tr key={student.name} className="border-b border-border hover:bg-surface-muted/10 transition-colors">
                      <td className="p-3 font-semibold text-text">{student.name}</td>
                      <td className="p-3">{student.track}</td>
                      <td className="p-3 text-center font-bold text-accent">{student.score}%</td>
                      <td className="p-3 text-center font-bold text-text">{student.progress}%</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald/10 border border-emerald/20 text-[9px] text-emerald font-semibold uppercase">
                          {student.readiness}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
