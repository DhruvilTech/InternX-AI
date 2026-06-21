import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Star, ArrowLeft, ArrowRight, Award, Trash2 } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { getRecruiterShortlisted, toggleRecruiterShortlist } from '../store/slices/recruiterSlice.js';

export default function ShortlistedCandidatesPage() {
  const { navigate, addToast } = useNavigation();
  const dispatch = useDispatch();

  const { shortlisted, loading, error } = useSelector((state) => state.recruiter);

  useEffect(() => {
    dispatch(getRecruiterShortlisted());
  }, [dispatch]);

  const handleRemoveShortlist = async (studentUserId, fullName) => {
    try {
      await dispatch(toggleRecruiterShortlist(studentUserId)).unwrap();
      addToast(`Removed ${fullName} from shortlist`, 'success');
      dispatch(getRecruiterShortlisted()); // Reload shortlist list
    } catch (err) {
      addToast(err || 'Failed to remove shortlist', 'error');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 space-y-6 relative z-10">
        
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
            Shortlisted Talent Pool
          </span>
        </div>

        {/* Header Title */}
        <div className="space-y-1">
          <h2 className="font-display font-bold text-2xl text-text">My Shortlisted Candidates</h2>
          <p className="text-xs text-muted">Review, manage, and start outreach requests with your bookmarked developers.</p>
        </div>

        {/* Shortlisted Candidates Cards Grid */}
        {loading && shortlisted.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-muted font-mono">Syncing corporate shortlist...</p>
          </div>
        ) : shortlisted.length === 0 ? (
          <div className="text-center py-16 text-xs text-muted border border-dashed border-border bg-void/10 rounded-2xl">
            No candidates shortlisted yet. Explore our student discovery panel to bookmark talented developers.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shortlisted.map((cand) => (
              <div
                key={cand.studentId}
                className="p-5 border border-border rounded-xl bg-void/40 hover:border-accent/40 transition-all flex flex-col justify-between gap-4 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-gradient-to-br from-accent/20 to-violet/20 border border-accent/20 rounded-full flex items-center justify-center text-accent text-xs font-bold font-display overflow-hidden shrink-0">
                    {cand.avatar ? (
                      <img src={cand.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      cand.fullName.split(' ').map(n => n[0]).join('')
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-bold text-text group-hover:text-accent transition-colors">
                        {cand.fullName}
                      </h4>
                      {cand.certificateIssued && (
                        <span className="flex items-center gap-0.5 text-[8px] font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full uppercase">
                          <Award size={8} />
                          <span>Certified</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted">
                      {cand.careerTrack} · Year {cand.year} {cand.course}
                    </p>
                    <p className="text-[10px] text-muted">
                      College: <strong className="text-text/75">{cand.collegeName}</strong>
                    </p>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {cand.skills.slice(0, 4).map((s) => (
                        <span key={s} className="text-[8px] bg-surface-muted border border-border px-1.5 py-0.5 rounded text-muted font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-border/40">
                  <button
                    onClick={() => handleRemoveShortlist(cand.userId, cand.fullName)}
                    className="flex items-center gap-1 text-[10px] text-rose-300 hover:text-rose hover:bg-rose/10 px-2.5 py-1.5 rounded-lg border border-border/40 transition-all cursor-pointer font-semibold"
                  >
                    <Trash2 size={11} />
                    <span>Remove Bookmark</span>
                  </button>

                  <button
                    onClick={() => navigate(`recruiter/students/${cand.userId}`)}
                    className="px-3 py-1.5 bg-gradient-to-r from-accent to-violet text-white text-[10px] font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Audit Report</span>
                    <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
