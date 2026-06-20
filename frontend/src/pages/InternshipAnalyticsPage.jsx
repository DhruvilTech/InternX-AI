import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { GraduationCap, TrendingUp, CheckCircle2, Award, BookOpen } from 'lucide-react';
import { getInternships } from '../store/slices/collegeSlice.js';

export default function InternshipAnalyticsPage() {
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const { analytics, loading } = useSelector((state) => state.college);

  const gridColor = isDark ? '#1E293B' : '#E2E8F0';
  const tickColor = isDark ? '#94A3B8' : '#64748B';

  useEffect(() => {
    dispatch(getInternships());
  }, [dispatch]);

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-text">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted font-semibold tracking-widest uppercase">Analyzing internships database...</p>
        </div>
      </div>
    );
  }

  const data = analytics || {
    activeInternships: 0,
    completedInternships: 0,
    totalEnrollments: 0,
    completionRate: 0,
    averageInternshipScore: 0,
    departmentStats: []
  };

  const chartData = data.departmentStats.map(d => ({
    name: d.departmentCode,
    'Active Internships': d.activeInternships,
    'Completed Internships': d.completedInternships,
    'Completion Rate (%)': d.completionRate
  }));

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 space-y-8 relative z-10">
        
        {/* Title */}
        <div className="border-b border-border pb-6">
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em] block">Engagement Metrics</span>
          <h2 className="font-display font-bold text-3xl mt-1">Internship Analytics Overview</h2>
          <p className="text-xs text-muted mt-1">Track active simulated program milestones, completion velocities, and grades.</p>
        </div>

        {/* Aggregates */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-border bg-void/50 glass text-center">
            <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Total Enrollment</span>
            <span className="text-2xl font-bold text-text font-mono">{data.totalEnrollments}</span>
          </div>
          <div className="p-5 rounded-2xl border border-border bg-void/50 glass text-center">
            <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Active Milestones</span>
            <span className="text-2xl font-bold text-accent font-mono">{data.activeInternships}</span>
          </div>
          <div className="p-5 rounded-2xl border border-border bg-void/50 glass text-center">
            <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Completed Interns</span>
            <span className="text-2xl font-bold text-emerald font-mono">{data.completedInternships}</span>
          </div>
          <div className="p-5 rounded-2xl border border-border bg-void/50 glass text-center">
            <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Average Sim Grade</span>
            <span className="text-2xl font-bold text-text font-mono">{data.averageInternshipScore}/100</span>
          </div>
        </div>

        {/* Chart row */}
        <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-accent" />
            <h3 className="text-xs font-bold text-text uppercase tracking-wider">Department Internship Distribution</h3>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 8 }} stroke="rgba(255,255,255,0.05)" />
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
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="Active Internships" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Completed Internships" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Stats Table */}
        <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap size={16} className="text-accent" />
            <h3 className="text-sm font-bold text-text uppercase tracking-wider">Detailed Departmental Progress Logs</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs text-muted text-left">
              <thead>
                <tr className="border-b border-border bg-void/50 text-[10px] uppercase font-bold text-text">
                  <th className="p-3">Department Name</th>
                  <th className="p-3 text-center">Code</th>
                  <th className="p-3 text-center">Enrolled Students</th>
                  <th className="p-3 text-center">Active Sprints</th>
                  <th className="p-3 text-center">Completed Tracks</th>
                  <th className="p-3 text-right">Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.departmentStats.map((dept) => (
                  <tr key={dept.departmentName} className="border-b border-border hover:bg-surface-muted/10 transition-colors">
                    <td className="p-3 font-semibold text-text">{dept.departmentName}</td>
                    <td className="p-3 text-center font-mono">{dept.departmentCode}</td>
                    <td className="p-3 text-center font-bold text-text">{dept.totalStudents}</td>
                    <td className="p-3 text-center text-accent">{dept.activeInternships}</td>
                    <td className="p-3 text-center text-emerald">{dept.completedInternships}</td>
                    <td className="p-3 text-right font-mono font-bold text-text">{dept.completionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
