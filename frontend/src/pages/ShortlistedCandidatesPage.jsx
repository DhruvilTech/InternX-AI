import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Star, ArrowLeft, ArrowRight, Award, Trash2, CheckCircle2, Briefcase, Building2 } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { getRecruiterShortlisted, toggleRecruiterShortlist } from '../store/slices/recruiterSlice.js';
import { getSentOffers } from '../store/slices/offersSlice.js';
import TiltCard from '../components/ui/TiltCard';

export default function ShortlistedCandidatesPage() {
  const { navigate, addToast } = useNavigation();
  const dispatch = useDispatch();

  const { shortlisted, loading } = useSelector((state) => state.recruiter);
  const { sentOffers } = useSelector((state) => state.offers);

  useEffect(() => {
    dispatch(getRecruiterShortlisted());
    dispatch(getSentOffers());
  }, [dispatch]);

  // Filter only accepted offers to show in "Accepted Interns" section
  const acceptedOffers = (sentOffers || []).filter(o => o.status === 'accepted');

  const handleRemoveShortlist = async (studentUserId, fullName) => {
    try {
      await dispatch(toggleRecruiterShortlist(studentUserId)).unwrap();
      addToast(`Removed ${fullName} from shortlist`, 'success');
      dispatch(getRecruiterShortlisted());
    } catch (err) {
      addToast(err || 'Failed to remove shortlist', 'error');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 space-y-8 relative z-10">

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

        {/* ── Accepted Interns Section ── */}
        {acceptedOffers.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-emerald/20 pb-3">
              <CheckCircle2 size={15} className="text-emerald" />
              <h3 className="text-xs font-bold text-emerald uppercase tracking-wider">Accepted Internship Offers</h3>
              <span className="ml-auto text-[10px] bg-emerald/10 border border-emerald/20 text-emerald px-2 py-0.5 rounded-full font-mono font-bold">
                {acceptedOffers.length} Confirmed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {acceptedOffers.map((offer) => {
                const studentName = offer.studentId?.fullName || offer.studentName || 'Unknown Student';
                const studentId = offer.studentId?._id || offer.studentId;
                const initials = studentName.split(' ').map(n => n[0]).join('').toUpperCase();
                return (
                  <TiltCard key={offer._id} className="hover:glow-emerald transition-all duration-300 rounded-xl">
                    <div className="p-5 border border-emerald/20 rounded-xl bg-emerald/5 flex flex-col justify-between gap-4 relative overflow-hidden h-full">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald/60 to-transparent" />

                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-gradient-to-br from-emerald/20 to-accent/20 border border-emerald/30 rounded-full flex items-center justify-center text-emerald text-xs font-bold font-display shrink-0">
                        {initials}
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-bold text-text">{studentName}</h4>
                          <span className="flex items-center gap-0.5 text-[8px] font-semibold text-emerald bg-emerald/10 border border-emerald/20 px-1.5 py-0.5 rounded-full uppercase">
                            <CheckCircle2 size={8} />
                            Accepted
                          </span>
                        </div>
                        <p className="text-xs text-muted flex items-center gap-1">
                          <Building2 size={10} />
                          {offer.companyName}
                          {offer.jobRole && <span className="text-text/60"> · {offer.jobRole}</span>}
                        </p>
                        {offer.package && (
                          <p className="text-[10px] text-muted flex items-center gap-1">
                            <Briefcase size={9} />
                            Package: <span className="text-emerald font-bold">{offer.package} LPA</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end items-center pt-3 border-t border-emerald/10">
                      {studentId && (
                        <button
                          onClick={() => navigate(`recruiter/students/${studentId}`)}
                          className="px-3 py-1.5 bg-gradient-to-r from-emerald/80 to-accent text-white text-[10px] font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>View Profile</span>
                          <ArrowRight size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                  </TiltCard>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Bookmarked Candidates Section ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Star size={15} className="text-amber-500" />
            <h3 className="text-xs font-bold text-text uppercase tracking-wider">Bookmarked Candidates</h3>
            {shortlisted.length > 0 && (
              <span className="ml-auto text-[10px] bg-white/5 border border-border text-muted px-2 py-0.5 rounded-full font-mono">
                {shortlisted.length} saved
              </span>
            )}
          </div>

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
                <TiltCard key={cand.studentId} className="hover:glow-amber transition-all duration-300 rounded-xl">
                  <div className="p-5 border border-border rounded-xl bg-void/40 hover:border-accent/40 transition-all flex flex-col justify-between gap-4 relative overflow-hidden group h-full">
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
              </TiltCard>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
