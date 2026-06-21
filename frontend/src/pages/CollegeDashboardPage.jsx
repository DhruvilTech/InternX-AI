import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
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
  Cell
} from 'recharts';
import { GraduationCap, Users, CheckCircle2, TrendingUp, Award, RefreshCw, BookOpen, Star, Briefcase, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios.js';
import { useNavigation } from '../context/NavigationContext';

const pieColors = ['#8B5CF6', '#6366F1', '#38BDF8', '#10B981', '#F59E0B'];

export default function CollegeDashboardPage() {
  const navigate = useNavigate();
  const { addToast } = useNavigation();
  const { isDark } = useTheme();
  
  const [data, setData] = useState(null);
  const [students, setStudents] = useState([]);
  const [placements, setPlacements] = useState({ total: 0, accepted: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  const gridColor = isDark ? '#1E293B' : '#E2E8F0';
  const tickColor = isDark ? '#94A3B8' : '#64748B';

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, studRes, placementRes] = await Promise.all([
        axiosInstance.get('/api/college/dashboard'),
        axiosInstance.get('/api/college/students'),
        axiosInstance.get('/api/college/placements').catch(() => ({ data: { data: [] } }))
      ]);
      
      if (dashRes.data?.success) {
        setData(dashRes.data.data);
      }
      if (studRes.data?.success) {
        setStudents(studRes.data.data?.students || studRes.data.data || []);
      }
      // Build placement KPIs from returned array (paginated response shape)
      const pArr = placementRes.data?.data?.placements || placementRes.data?.data || [];
      setPlacements({
        total: pArr.length,
        accepted: pArr.filter(p => p.offerStatus === 'accepted').length,
        rejected: pArr.filter(p => p.offerStatus === 'rejected').length,
      });
    } catch (err) {
      console.error(err);
      if (typeof addToast === 'function') {
        addToast('Failed to fetch college diagnostic metrics.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    loadData();
    if (typeof addToast === 'function') {
      addToast('Synchronizing campus directory...', 'success');
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-text">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted font-semibold tracking-widest uppercase">Fetching academic metrics...</p>
        </div>
      </div>
    );
  }

  // Fallbacks if data empty
  const stats = data?.kpis || {
    totalStudents: 0,
    activeInternships: 0,
    completedInternships: 0,
    avgInternshipScore: 0,
    placementReadiness: 0
  };

  const college = data?.college || {
    name: 'College Dashboard',
    shortName: 'College',
    code: 'N/A',
    verified: false
  };

  const charts = data?.charts || {
    studentsByDepartment: [],
    studentsByYear: [],
    studentsByCareerPath: [],
    internshipStats: []
  };

  const topPerformers = data?.topPerformers || [];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 space-y-8 relative z-10">
        
        {/* Title & Header */}
        <div className="flex justify-between items-center border-b border-border pb-6">
          <div>
            <span className="text-xs font-semibold text-emerald uppercase tracking-[0.2em] block">Academic oversight</span>
            <h2 className="font-display font-bold text-3xl mt-1">
              {college.name}
            </h2>
            <p className="text-xs text-muted mt-1">
              Audit student placement readiness and cohort progress diagnostics for code: <strong>{college.code}</strong>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/college/placements')}
              className="flex items-center gap-2 px-3 py-2 border border-violet/40 rounded-xl text-xs text-violet hover:bg-violet/10 bg-violet/5 transition-colors cursor-pointer font-semibold"
            >
              <Briefcase size={13} />
              Placement Tracker
            </button>
            <button
              onClick={handleRefresh}
              className="p-2.5 border border-border rounded-xl text-muted hover:text-text bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              title="Refresh database snapshot"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-border bg-void/50 glass hover:scale-[1.01] transition-transform">
            <div className="flex items-center gap-2 text-accent mb-1 justify-center">
              <Users size={16} />
              <span className="text-[10px] text-muted uppercase tracking-wider block">Total Students</span>
            </div>
            <span className="text-2xl font-bold text-text block text-center font-mono">{stats.totalStudents}</span>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-void/50 glass hover:scale-[1.01] transition-transform">
            <div className="flex items-center gap-2 text-emerald mb-1 justify-center">
              <CheckCircle2 size={16} />
              <span className="text-[10px] text-muted uppercase tracking-wider block">Readiness Index</span>
            </div>
            <span className="text-2xl font-bold text-emerald block text-center font-mono">{stats.placementReadiness}%</span>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-void/50 glass hover:scale-[1.01] transition-transform">
            <div className="flex items-center gap-2 text-violet mb-1 justify-center">
              <Award size={16} />
              <span className="text-[10px] text-muted uppercase tracking-wider block">Avg Task Grade</span>
            </div>
            <span className="text-2xl font-bold text-violet block text-center font-mono">{stats.avgInternshipScore}%</span>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-void/50 glass hover:scale-[1.01] transition-transform">
            <div className="flex items-center gap-2 text-amber-500 mb-1 justify-center">
              <BookOpen size={16} />
              <span className="text-[10px] text-muted uppercase tracking-wider block">Active Interns</span>
            </div>
            <span className="text-2xl font-bold text-text block text-center font-mono">{stats.activeInternships}</span>
          </div>
        </div>

        {/* Placement KPI Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-violet/20 bg-violet/5 glass hover:scale-[1.01] transition-transform">
            <div className="flex items-center gap-2 text-violet mb-1 justify-center">
              <Briefcase size={16} />
              <span className="text-[10px] text-muted uppercase tracking-wider block">Total Offers</span>
            </div>
            <span className="text-2xl font-bold text-violet block text-center font-mono">{placements.total}</span>
          </div>

          <div className="p-5 rounded-2xl border border-emerald/20 bg-emerald/5 glass hover:scale-[1.01] transition-transform">
            <div className="flex items-center gap-2 text-emerald mb-1 justify-center">
              <CheckCircle2 size={16} />
              <span className="text-[10px] text-muted uppercase tracking-wider block">Accepted Offers</span>
            </div>
            <span className="text-2xl font-bold text-emerald block text-center font-mono">{placements.accepted}</span>
          </div>

          <div className="p-5 rounded-2xl border border-rose/20 bg-rose/5 glass hover:scale-[1.01] transition-transform">
            <div className="flex items-center gap-2 text-rose mb-1 justify-center">
              <XCircle size={16} />
              <span className="text-[10px] text-muted uppercase tracking-wider block">Rejected Offers</span>
            </div>
            <span className="text-2xl font-bold text-rose block text-center font-mono">{placements.rejected}</span>
          </div>
        </div>

        {/* Charts Split */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Department distribution bar chart */}
          <div className="md:col-span-6 glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-accent" />
              <h3 className="text-xs font-bold text-text uppercase tracking-wider">Students By Department</h3>
            </div>

            <div className="h-60 w-full">
              {charts.studentsByDepartment.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted">No department distribution data available.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.studentsByDepartment} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 8 }} stroke="rgba(255,255,255,0.05)" />
                    <YAxis tick={{ fill: tickColor, fontSize: 8 }} stroke="rgba(255,255,255,0.05)" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        backgroundColor: isDark ? '#050816' : '#ffffff',
                        color: isDark ? '#f1f5f9' : '#0f172a',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Students Count" barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Internship Status stats */}
          <div className="md:col-span-6 glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-emerald" />
              <h3 className="text-xs font-bold text-text uppercase tracking-wider">Internship Progress Stages</h3>
            </div>

            <div className="h-60 w-full">
              {charts.internshipStats.every(c => c.count === 0) ? (
                <div className="h-full flex items-center justify-center text-xs text-muted">No active student internships currently seeded.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.internshipStats} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="status" tick={{ fill: tickColor, fontSize: 8 }} stroke="rgba(255,255,255,0.05)" />
                    <YAxis tick={{ fill: tickColor, fontSize: 8 }} stroke="rgba(255,255,255,0.05)" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        backgroundColor: isDark ? '#050816' : '#ffffff',
                        color: isDark ? '#f1f5f9' : '#0f172a',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} name="Students" barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Students by Year */}
          <div className="md:col-span-6 glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-amber-500" />
              <h3 className="text-xs font-bold text-text uppercase tracking-wider">Students By Year</h3>
            </div>

            <div className="h-60 w-full">
              {charts.studentsByYear.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted">No year distribution data.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.studentsByYear} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 8 }} stroke="rgba(255,255,255,0.05)" />
                    <YAxis tick={{ fill: tickColor, fontSize: 8 }} stroke="rgba(255,255,255,0.05)" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        backgroundColor: isDark ? '#050816' : '#ffffff',
                        color: isDark ? '#f1f5f9' : '#0f172a',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Students Count" barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Department Count distribution pie chart */}
          <div className="md:col-span-6 glass border border-border rounded-2xl p-6 bg-void/25 flex flex-col items-center justify-between space-y-4">
            <div className="w-full flex items-center gap-2">
              <Users size={16} className="text-violet" />
              <h3 className="text-xs font-bold text-text uppercase tracking-wider">Students By Career Path</h3>
            </div>

            <div className="h-44 w-full flex items-center justify-center">
              {charts.studentsByCareerPath.length === 0 ? (
                <div className="text-xs text-muted">No career path distribution data.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.studentsByCareerPath}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={60}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {charts.studentsByCareerPath.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="w-full grid grid-cols-2 gap-2 text-[8px] text-muted font-semibold uppercase">
              {charts.studentsByCareerPath.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-1.5 truncate">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: pieColors[idx % pieColors.length] }} />
                  <span className="truncate">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers Table */}
          <div className="md:col-span-12 glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-amber-500" />
                <h3 className="text-sm font-bold text-text uppercase tracking-wider">Placement Readiness Catalog (Top Students)</h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs text-muted text-left">
                <thead>
                  <tr className="border-b border-border bg-void/50 text-[10px] uppercase font-bold text-text">
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Department</th>
                    <th className="p-3 text-center">Academic Year</th>
                    <th className="p-3">Career Track</th>
                    <th className="p-3 text-center">Internship Progress</th>
                    <th className="p-3 text-center">Avg Sim Score</th>
                    <th className="p-3 text-right">Readiness Index</th>
                  </tr>
                </thead>
                <tbody>
                  {topPerformers.map((student) => (
                    <tr key={student._id} className="border-b border-border hover:bg-surface-muted/10 transition-colors">
                      <td className="p-3 font-semibold text-text">{student.fullName}</td>
                      <td className="p-3">{student.department}</td>
                      <td className="p-3 text-center">Year {student.year}</td>
                      <td className="p-3">{student.careerPath}</td>
                      <td className="p-3 text-center font-mono font-semibold text-text">{student.internshipProgress}%</td>
                      <td className="p-3 text-center font-mono text-accent">{student.averageTaskScore}%</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          student.readinessIndex >= 80
                            ? 'bg-emerald/10 border border-emerald/30 text-emerald'
                            : student.readinessIndex >= 50
                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                            : 'bg-rose/10 border border-rose/30 text-rose-300'
                        }`}>
                          {student.readinessIndex}% Ready
                        </span>
                      </td>
                    </tr>
                  ))}
                  {topPerformers.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-6 text-center text-muted">
                        No student placement diagnostics records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Campus Directory */}
          <div className="md:col-span-12 glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap size={16} className="text-accent" />
              <h3 className="text-sm font-bold text-text uppercase tracking-wider">Campus Directory</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs text-muted text-left">
                <thead>
                  <tr className="border-b border-border bg-void/50 text-[10px] uppercase font-bold text-text">
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Department</th>
                    <th className="p-3 text-center">Academic Year</th>
                    <th className="p-3">Career Track</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id} className="border-b border-border hover:bg-surface-muted/10 transition-colors">
                      <td className="p-3 font-semibold text-text flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full overflow-hidden border border-border shrink-0 animate-fade-in">
                          <img src={student.avatar || 'https://via.placeholder.com/150'} alt="" className="h-full w-full object-cover" />
                        </div>
                        <span>{student.fullName || student.name}</span>
                      </td>
                      <td className="p-3">{student.email}</td>
                      <td className="p-3">{student.department || student.course || 'N/A'}</td>
                      <td className="p-3 text-center">Year {student.year || 'N/A'}</td>
                      <td className="p-3">{student.careerPath || student.careerTrack || 'N/A'}</td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-muted">
                        No students enrolled in this college yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
