import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GraduationCap, Award, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getPlacementAnalytics } from '../store/slices/collegeSlice.js';
import { useNavigation } from '../context/NavigationContext';

export default function PlacementReadinessPage() {
  const dispatch = useDispatch();
  const { navigate } = useNavigation();
  const { placement, loading } = useSelector((state) => state.college);

  useEffect(() => {
    dispatch(getPlacementAnalytics());
  }, [dispatch]);

  if (loading && !placement) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-text">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted font-semibold tracking-widest uppercase">Calculating readiness metrics...</p>
        </div>
      </div>
    );
  }

  const data = placement || {
    topPerformers: [],
    riskStudents: [],
    departmentReadiness: []
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 space-y-8 relative z-10">
        
        {/* Title */}
        <div className="border-b border-border pb-6">
          <span className="text-xs font-semibold text-emerald uppercase tracking-[0.2em] block">Recruiter Metrics</span>
          <h2 className="font-display font-bold text-3xl mt-1">Placement Readiness Diagnostics</h2>
          <p className="text-xs text-muted mt-1">Assess cohort employability, filter risk profiles, and audit top talents.</p>
        </div>

        {/* Top Performers & Risk Splits */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Top Performers */}
          <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <Award size={15} className="text-emerald animate-bounce" />
              <h3 className="text-xs font-bold text-text uppercase tracking-wider">Top Recruiter Choices (employability Index &gt; 85%)</h3>
            </div>

            <div className="space-y-3">
              {data.topPerformers.map((student) => (
                <div key={student.studentId} className="flex justify-between items-center p-3 bg-white/5 border border-border rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-text">{student.fullName}</h4>
                    <p className="text-[10px] text-muted">{student.course} · {student.track}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald">{student.score}% Progress</span>
                    <button
                      onClick={() => navigate(`college/students/${student.studentId}`)}
                      className="block text-[9px] text-accent hover:underline font-semibold mt-0.5"
                    >
                      Audit portfolio
                    </button>
                  </div>
                </div>
              ))}
              {data.topPerformers.length === 0 && (
                <p className="text-xs text-center text-muted py-6">No students hit the 85% benchmark.</p>
              )}
            </div>
          </div>

          {/* Risk Profiles */}
          <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <AlertTriangle size={15} className="text-rose-400" />
              <h3 className="text-xs font-bold text-text uppercase tracking-wider">Underperforming Cohorts (progress &lt; 50%)</h3>
            </div>

            <div className="space-y-3">
              {data.riskStudents.map((student) => (
                <div key={student.studentId} className="flex justify-between items-center p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-text">{student.fullName}</h4>
                    <p className="text-[10px] text-muted">{student.course} · {student.track}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-rose">{student.score}% Progress</span>
                    <button
                      onClick={() => navigate(`college/students/${student.studentId}`)}
                      className="block text-[9px] text-accent hover:underline font-semibold mt-0.5"
                    >
                      Audit issues
                    </button>
                  </div>
                </div>
              ))}
              {data.riskStudents.length === 0 && (
                <p className="text-xs text-center text-muted py-6">All students have progress above 50%.</p>
              )}
            </div>
          </div>

        </div>

        {/* Department Rankings */}
        <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap size={16} className="text-accent" />
            <h3 className="text-sm font-bold text-text uppercase tracking-wider">Department Placement Rankings</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {data.departmentReadiness.map((d, index) => (
              <div key={d.departmentName} className="p-4 bg-void/50 border border-border rounded-xl text-center space-y-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-1 bg-accent" style={{ width: `${d.readinessRate}%` }} />
                <span className="text-[9px] text-muted uppercase font-bold tracking-widest block">Rank #{index + 1}</span>
                <h4 className="text-xs font-bold text-text truncate">{d.departmentName}</h4>
                <div className="text-lg font-bold text-accent font-mono">{d.readinessRate}%</div>
                <span className="text-[8px] text-muted uppercase tracking-wider block">Placement Index</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
