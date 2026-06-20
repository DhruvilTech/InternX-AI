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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { GraduationCap, Users, CheckCircle2, TrendingUp, Award, RefreshCw, BookOpen } from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';
import { getDashboard, getStudents, fetchCollegeProfile } from '../store/slices/collegeSlice.js';
import { useNavigation } from '../context/NavigationContext';

const pieColors = ['#8B5CF6', '#6366F1', '#38BDF8', '#10B981', '#F59E0B'];

export default function CollegeDashboardPage() {
  const dispatch = useDispatch();
  const { navigate, addToast } = useNavigation();
  const { isDark } = useTheme();
  const { dashboard, students, profile, loading } = useSelector((state) => state.college);

  const gridColor = isDark ? '#1E293B' : '#E2E8F0';
  const tickColor = isDark ? '#94A3B8' : '#64748B';

  const loadData = () => {
    dispatch(getDashboard());
    dispatch(getStudents({ limit: 5 }));
    dispatch(fetchCollegeProfile());
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const handleRefresh = () => {
    loadData();
    addToast('Synchronizing campus directory...', 'success');
  };

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-text">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted font-semibold tracking-widest uppercase">Fetching academic metrics...</p>
        </div>
      </div>
    );
  }

  // Fallback structures if database seeding hasn't finished
  const stats = dashboard || {
    totalStudents: 0,
    activeInternships: 0,
    completedInternships: 0,
    placementReadiness: 0,
    certificatesIssued: 0,
    githubConnectedStudents: 0,
    interviewReadyStudents: 0,
    averageScore: 0
  };

  // Compile department data from profile
  const departmentStats = profile?.departments?.map((d) => ({
    name: d.departmentName,
    count: d.studentCount || 0,
    readyPercent: d.placementRate || 0,
  })) || [
    { name: 'Computer Science', count: 120, readyPercent: 82 },
    { name: 'Data Engineering', count: 85, readyPercent: 78 },
    { name: 'Electrical Eng', count: 64, readyPercent: 70 },
    { name: 'Information Tech', count: 90, readyPercent: 75 },
  ];

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
              {profile?.collegeName || 'College Admin Dashboard'}
            </h2>
            <p className="text-xs text-muted mt-1">
              Audit student placement readiness and cohort progress diagnostics for code: <strong>{profile?.collegeCode || 'N/A'}</strong>.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2.5 border border-border rounded-xl text-muted hover:text-text bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            title="Refresh database snapshot"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
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
              <span className="text-[10px] text-muted uppercase tracking-wider block">Certificates Issued</span>
            </div>
            <span className="text-2xl font-bold text-violet block text-center font-mono">{stats.certificatesIssued}</span>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-void/50 glass hover:scale-[1.01] transition-transform">
            <div className="flex items-center gap-2 text-amber-500 mb-1 justify-center">
              <BookOpen size={16} />
              <span className="text-[10px] text-muted uppercase tracking-wider block">Active Interns</span>
            </div>
            <span className="text-2xl font-bold text-text block text-center font-mono">{stats.activeInternships}</span>
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
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: pieColors[idx % pieColors.length] }} />
                  <span className="truncate">{dept.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed student metrics cohort table */}
          <div className="md:col-span-12 glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap size={16} className="text-accent" />
                <h3 className="text-sm font-bold text-text uppercase tracking-wider">Top Students Overview</h3>
              </div>
              <button
                onClick={() => navigate('college/students')}
                className="text-[10px] text-accent hover:underline font-semibold"
              >
                View Full Campus Directory →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs text-muted text-left">
                <thead>
                  <tr className="border-b border-border bg-void/50 text-[10px] uppercase font-bold text-text">
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Course / Track</th>
                    <th className="p-3 text-center">GitHub Connection</th>
                    <th className="p-3 text-center">Internship Progress</th>
                    <th className="p-3 text-center">Sim Grade</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students?.slice(0, 5).map((student) => (
                    <tr key={student._id} className="border-b border-border hover:bg-surface-muted/10 transition-colors">
                      <td className="p-3 font-semibold text-text flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full overflow-hidden border border-border">
                          <img src={student.avatar || 'https://via.placeholder.com/150'} alt="" className="h-full w-full object-cover" />
                        </div>
                        <span>{student.fullName}</span>
                      </td>
                      <td className="p-3">{student.course} · <span className="text-[10px] text-muted">{student.careerTrack}</span></td>
                      <td className="p-3 text-center">
                        {student.githubConnected ? (
                          <span className="inline-flex items-center gap-1 text-emerald">
                            <FaGithub size={12} /> Connected
                          </span>
                        ) : (
                          <span className="text-muted">Unlinked</span>
                        )}
                      </td>
                      <td className="p-3 text-center font-bold text-text">{student.internshipProgress}%</td>
                      <td className="p-3 text-center font-bold text-accent">{student.grade}/100</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => navigate(`college/students/${student._id}`)}
                          className="px-2.5 py-1 bg-white/5 border border-border hover:bg-white/10 hover:border-accent text-[10px] text-text rounded-lg transition-colors cursor-pointer"
                        >
                          Audit Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!students || students.length === 0) && (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-muted">
                        No students enrolled in this institution. Run directory refresh to seed demo cohort.
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
