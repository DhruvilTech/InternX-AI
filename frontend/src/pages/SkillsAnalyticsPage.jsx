import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Code, TrendingUp, AlertTriangle } from 'lucide-react';
import { getSkillAnalytics } from '../store/slices/collegeSlice.js';

export default function SkillsAnalyticsPage() {
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const { skills, loading } = useSelector((state) => state.college);

  const gridColor = isDark ? '#1E293B' : '#E2E8F0';
  const tickColor = isDark ? '#94A3B8' : '#64748B';

  useEffect(() => {
    dispatch(getSkillAnalytics());
  }, [dispatch]);

  if (loading && !skills) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-text">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted font-semibold tracking-widest uppercase">Mapping skills taxonomy...</p>
        </div>
      </div>
    );
  }

  const data = skills || {
    topSkills: [],
    weakSkills: [],
    skillGrowth: [],
    skillDistribution: []
  };

  // Convert distribution data for Radar chart representation
  const radarData = data.skillDistribution.map(d => ({
    subject: d.track,
    A: d.count * 10,
    fullMark: 150
  }));

  // Default radar data fallback if empty
  const defaultRadar = radarData.length > 0 ? radarData : [
    { subject: 'AI Engine', A: 120, fullMark: 150 },
    { subject: 'Frontend', A: 98, fullMark: 150 },
    { subject: 'Backend', A: 86, fullMark: 150 },
    { subject: 'Data Science', A: 99, fullMark: 150 }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 space-y-8 relative z-10">
        
        {/* Title */}
        <div className="border-b border-border pb-6">
          <span className="text-xs font-semibold text-violet uppercase tracking-[0.2em] block">Talent Insights</span>
          <h2 className="font-display font-bold text-3xl mt-1">Skills Analytics & Gap Auditing</h2>
          <p className="text-xs text-muted mt-1">Audit university strengths, industry technology trends, and student weaknesses.</p>
        </div>

        {/* Charts Split Row */}
        <div className="grid md:grid-cols-12 gap-6">
          
          {/* Radar Chart for distribution */}
          <div className="md:col-span-6 glass border border-border rounded-2xl p-6 bg-void/25 flex flex-col justify-between min-h-[360px]">
            <div className="flex items-center gap-2 mb-4">
              <Code size={16} className="text-accent" />
              <h3 className="text-xs font-bold text-text uppercase tracking-wider">Career Path Skill Distribution</h3>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={defaultRadar}>
                  <PolarGrid stroke={gridColor} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor, fontSize: 8 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{ fill: tickColor, fontSize: 8 }} />
                  <Radar name="Student Count" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart for Skill Growth */}
          <div className="md:col-span-6 glass border border-border rounded-2xl p-6 bg-void/25 flex flex-col justify-between min-h-[360px]">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-emerald" />
              <h3 className="text-xs font-bold text-text uppercase tracking-wider">Monthly Skill Growth Index</h3>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.skillGrowth} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="month" tick={{ fill: tickColor, fontSize: 8 }} stroke="rgba(255,255,255,0.05)" />
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
                  <Bar dataKey="growth" fill="#38BDF8" name="Growth Index" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Skill Gap Analysis Grids */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Top Strengths */}
          <div className="glass border border-border rounded-2xl p-6 bg-void/20 space-y-4">
            <h3 className="text-xs font-bold text-emerald uppercase tracking-widest border-b border-border/40 pb-2 flex items-center gap-2">
              <Code size={14} /> Core Institutional Strengths
            </h3>
            <div className="space-y-3.5">
              {data.topSkills.map((sk) => (
                <div key={sk.skill} className="flex justify-between items-center text-xs">
                  <span className="text-text font-semibold">{sk.skill}</span>
                  <span className="font-bold text-muted font-mono">{sk.count} Students Skilled</span>
                </div>
              ))}
              {data.topSkills.length === 0 && (
                <p className="text-xs text-muted">No campus-wide data compiled.</p>
              )}
            </div>
          </div>

          {/* Weaknesses / Skill Gaps */}
          <div className="glass border border-border rounded-2xl p-6 bg-void/20 space-y-4">
            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest border-b border-border/40 pb-2 flex items-center gap-2">
              <AlertTriangle size={14} /> Identified Technology Skill Gaps
            </h3>
            <div className="space-y-3.5">
              {data.weakSkills.map((sk) => (
                <div key={sk.skill} className="flex justify-between items-center text-xs">
                  <span className="text-text font-semibold">{sk.skill}</span>
                  <span className="font-bold text-rose font-mono">Missing in {100 - sk.count}% Cohort</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
