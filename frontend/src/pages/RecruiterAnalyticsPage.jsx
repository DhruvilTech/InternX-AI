import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  Legend,
} from 'recharts';
import { ArrowLeft, BarChart3, PieChart as PieIcon, TrendingUp, Sparkles, Award } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { getRecruiterAnalytics } from '../store/slices/recruiterSlice.js';

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#EC4899', '#6366F1'];

export default function RecruiterAnalyticsPage() {
  const { navigate } = useNavigation();
  const dispatch = useDispatch();

  const { analytics, loading } = useSelector((state) => state.recruiter);

  useEffect(() => {
    dispatch(getRecruiterAnalytics());
  }, [dispatch]);

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-text">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted font-semibold tracking-widest uppercase">Compiling global cohorts analytics...</p>
        </div>
      </div>
    );
  }

  const {
    averageProgress = 0,
    readinessDistribution = [],
    careerTracks = [],
    topSkills = [],
    collegeDistribution = [],
  } = analytics || {};

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 space-y-8 relative z-10">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <button
            onClick={() => navigate('recruiter/dashboard')}
            className="inline-flex items-center gap-2 text-xs text-muted hover:text-text hover:bg-white/5 px-3 py-1.5 rounded-xl border border-border transition-colors cursor-pointer"
          >
            <ArrowLeft size={12} />
            <span>Dashboard</span>
          </button>
          <span className="text-[10px] font-mono bg-white/5 border border-border px-3 py-1 rounded-full text-muted uppercase">
            Recruiter Analytics Logs
          </span>
        </div>

        {/* Title and Top KPIs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h2 className="font-display font-bold text-2xl text-text">Cohort Talent Analytics</h2>
            <p className="text-xs text-muted">Examine aggregate performance benchmarks, tech stack capabilities, and university distributions.</p>
          </div>

          <div className="flex gap-4">
            <div className="p-4 rounded-xl border border-border bg-void/50 glass flex items-center gap-3">
              <TrendingUp size={20} className="text-accent" />
              <div>
                <span className="text-[9px] text-muted uppercase tracking-wider block">Average Milestone Completion</span>
                <span className="text-md font-bold text-text">{averageProgress}%</span>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-border bg-void/50 glass flex items-center gap-3">
              <Award size={20} className="text-emerald" />
              <div>
                <span className="text-[9px] text-muted uppercase tracking-wider block">Placement Readiness Ratio</span>
                <span className="text-md font-bold text-emerald">High-Tier Stable</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Placement Readiness Index Distribution */}
          <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <BarChart3 size={15} className="text-accent" />
              <h3 className="text-xs font-bold text-text uppercase tracking-wider">Placement Readiness Distribution</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={readinessDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="category" stroke="#64748b" fontSize={9} />
                  <YAxis stroke="#64748b" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: 11 }} />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]}>
                    {readinessDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Career Tracks Pie Chart */}
          <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <PieIcon size={15} className="text-violet" />
              <h3 className="text-xs font-bold text-text uppercase tracking-wider">Enrolled Career Tracks Breakdown</h3>
            </div>
            <div className="h-64 w-full flex items-center justify-center">
              {careerTracks.length === 0 ? (
                <span className="text-xs text-muted">No tracks initialized</span>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={careerTracks}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {careerTracks.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top Developer Skills */}
          <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <Sparkles size={15} className="text-amber-500" />
              <h3 className="text-xs font-bold text-text uppercase tracking-wider">Top Recruitable Technical Skills</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSkills} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" fontSize={9} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: 11 }} />
                  <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top University Partners */}
          <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <TrendingUp size={15} className="text-emerald" />
              <h3 className="text-xs font-bold text-text uppercase tracking-wider">Top Talent Feeders (By University)</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={collegeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                  <YAxis stroke="#64748b" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: 11 }} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
