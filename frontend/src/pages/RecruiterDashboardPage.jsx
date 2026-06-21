import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Search, Star, Briefcase, GraduationCap, ArrowRight, ClipboardCheck, Users, Activity, BarChart2, ShieldAlert, Eye, X } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { getRecruiterDashboard, toggleRecruiterShortlist } from '../store/slices/recruiterSlice.js';
import { getSentOffers } from '../store/slices/offersSlice.js';

export default function RecruiterDashboardPage() {
  const { navigate, addToast } = useNavigation();
  const dispatch = useDispatch();

  const { dashboard, loading } = useSelector((state) => state.recruiter);
  const { sentOffers } = useSelector((state) => state.offers);

  useEffect(() => {
    dispatch(getRecruiterDashboard());
    dispatch(getSentOffers());
  }, [dispatch]);

  const handleToggleShortlist = async (studentUserId, fullName) => {
    try {
      const res = await dispatch(toggleRecruiterShortlist(studentUserId)).unwrap();
      addToast(
        res.data?.status === 'added'
          ? `Added ${fullName} to shortlist!`
          : `Removed ${fullName} from shortlist`,
        'success'
      );
      dispatch(getRecruiterDashboard()); // Refresh metrics
    } catch (err) {
      addToast(err || 'Failed to toggle shortlist', 'error');
    }
  };

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-text">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted font-semibold tracking-widest uppercase">Loading Partner Dashboard...</p>
        </div>
      </div>
    );
  }

  const kpis = dashboard?.kpis || { totalStudents: 0, shortlistedCount: 0, activePipelineCount: 0 };
  const pipelineSummary = dashboard?.pipelineSummary || { applied: 0, shortlisted: 0, interviewing: 0, offered: 0, rejected: 0 };
  const recentShortlists = dashboard?.recentShortlists || [];

  const pendingOffersCount = sentOffers.filter(o => o.status === 'pending').length;
  const acceptedOffersCount = sentOffers.filter(o => o.status === 'accepted').length;
  const rejectedOffersCount = sentOffers.filter(o => o.status === 'rejected').length;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 space-y-8 relative z-10">
        
        {/* Header Widget */}
        <div className="flex justify-between items-center border-b border-border pb-6">
          <div>
            <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em] block">PARTNER PORTAL</span>
            <h2 className="font-display font-bold text-3xl mt-1">Recruiter Dashboard</h2>
            <p className="text-xs text-muted mt-1">Review verified student portfolios and manage recruitment pipelines.</p>
          </div>
          <button
            onClick={() => navigate('recruiter/students')}
            className="px-4 py-2 bg-gradient-to-r from-accent to-violet text-white rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-accent/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Discover Talent</span>
            <Search size={14} />
          </button>
        </div>

        {/* Aggregate metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-border bg-void/50 glass flex items-center justify-between">
            <div>
              <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Global Candidate Pool</span>
              <span className="text-2xl font-bold text-text font-display">{kpis.totalStudents}</span>
            </div>
            <div className="h-10 w-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center text-accent">
              <Users size={18} />
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-border bg-void/50 glass flex items-center justify-between">
            <div>
              <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">My Shortlist</span>
              <span className="text-2xl font-bold text-amber-500 font-display">{kpis.shortlistedCount}</span>
            </div>
            <div className="h-10 w-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
              <Star size={18} fill="currentColor" />
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-border bg-void/50 glass flex items-center justify-between">
            <div>
              <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Hiring Pipeline (Active)</span>
              <span className="text-2xl font-bold text-emerald font-display">{kpis.activePipelineCount}</span>
            </div>
            <div className="h-10 w-10 bg-emerald/10 border border-emerald/20 rounded-xl flex items-center justify-center text-emerald">
              <Activity size={18} />
            </div>
          </div>
        </div>

        {/* Internship Offers Stats */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider">Internship Offers Metrics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-border bg-void/50 glass flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Pending Offer Letters</span>
                <span className="text-2xl font-bold text-amber-500 font-display">{pendingOffersCount}</span>
              </div>
              <div className="h-10 w-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
                <Briefcase size={18} />
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-border bg-void/50 glass flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Offers Accepted</span>
                <span className="text-2xl font-bold text-emerald font-display">{acceptedOffersCount}</span>
              </div>
              <div className="h-10 w-10 bg-emerald/10 border border-emerald/20 rounded-xl flex items-center justify-center text-emerald">
                <ClipboardCheck size={18} />
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-border bg-void/50 glass flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Offers Declined</span>
                <span className="text-2xl font-bold text-rose font-display">{rejectedOffersCount}</span>
              </div>
              <div className="h-10 w-10 bg-rose/10 border border-rose/20 rounded-xl flex items-center justify-center text-rose">
                <X size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard split */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Recent Shortlists */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
              <div className="flex justify-between items-center border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <Star size={15} className="text-amber-500 font-bold" fill="currentColor" />
                  <h3 className="text-xs font-bold text-text uppercase tracking-wider">Recently Shortlisted Talent</h3>
                </div>
                <button
                  onClick={() => navigate('recruiter/shortlisted')}
                  className="text-xs text-accent hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <span>View All</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              <div className="space-y-3">
                {recentShortlists.length === 0 ? (
                  <div className="text-center py-12 text-xs text-muted border border-dashed border-border rounded-xl">
                    No candidates shortlisted yet. Use the Talent Pool directory to shortlist developers.
                  </div>
                ) : (
                  recentShortlists.map((cand) => (
                    <div
                      key={cand.studentId}
                      className="p-4 border border-border rounded-xl bg-void/40 hover:border-accent/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 bg-gradient-to-br from-accent/20 to-violet/20 border border-accent/20 rounded-full flex items-center justify-center text-accent text-xs font-bold font-display">
                          {cand.fullName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-text group-hover:text-accent transition-colors">
                            {cand.fullName}
                          </h4>
                          <p className="text-xs text-muted">
                            {cand.careerTrack} · {cand.collegeName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className="text-[9px] text-muted uppercase tracking-wider block">Task Grade</span>
                          <span className="text-sm font-bold text-accent font-display">{cand.internshipProgress}%</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleShortlist(cand.userId, cand.fullName)}
                            className="p-2 border border-amber-500/30 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500/20 transition-all cursor-pointer"
                            title="Remove shortlist"
                          >
                            <Star size={13} fill="currentColor" />
                          </button>
                          <button
                            onClick={() => navigate(`recruiter/students/${cand.userId}`)}
                            className="p-2 bg-gradient-to-r from-accent to-violet text-white rounded-lg text-xs font-semibold hover:shadow-lg transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <span>Audit Report</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Offer Letters & Responses */}
            <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
              <div className="flex justify-between items-center border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <Briefcase size={15} className="text-accent" />
                  <h3 className="text-xs font-bold text-text uppercase tracking-wider">Recent Offer Letters & Responses</h3>
                </div>
              </div>

              <div className="space-y-3">
                {sentOffers.length === 0 ? (
                  <div className="text-center py-12 text-xs text-muted border border-dashed border-border rounded-xl">
                    No offers sent yet. Visit a candidate's audit page to make an offer.
                  </div>
                ) : (
                  sentOffers.slice(0, 5).map((offer) => (
                    <div
                      key={offer._id}
                      className="p-4 border border-border rounded-xl bg-void/40 hover:border-accent/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 bg-gradient-to-br from-indigo-500/20 to-violet/20 border border-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-xs font-bold font-display">
                          {offer.studentId?.fullName ? offer.studentId.fullName.split(' ').map(n => n[0]).join('') : 'ST'}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-text">
                            {offer.studentId?.fullName || 'Anonymous Candidate'}
                          </h4>
                          <p className="text-xs text-muted">
                            Company: {offer.companyName} · Sent: {new Date(offer.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div>
                          {offer.status === 'accepted' ? (
                            <span className="px-2.5 py-0.5 rounded bg-emerald/10 border border-emerald/20 text-[9px] text-emerald font-semibold uppercase tracking-wider">
                              Accepted
                            </span>
                          ) : offer.status === 'rejected' ? (
                            <span className="px-2.5 py-0.5 rounded bg-rose/10 border border-rose/20 text-[9px] text-rose font-semibold uppercase tracking-wider">
                              Declined
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-500 font-semibold uppercase tracking-wider">
                              Pending
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => navigate(`recruiter/students/${offer.studentId?._id || offer.studentId}`)}
                          className="p-1.5 hover:bg-white/5 border border-border text-[10px] rounded-lg cursor-pointer font-semibold text-muted hover:text-text"
                          title="View Profile"
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Hiring Pipeline summary and fast links */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Pipeline Stage Summary Card */}
            <div className="glass border border-border rounded-2xl p-5 bg-void/25 space-y-4">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                <BarChart2 size={14} className="text-accent" />
                <h4 className="text-xs font-bold text-text uppercase tracking-wider">Hiring Funnel Summary</h4>
              </div>

              <div className="space-y-3.5 text-xs">
                {[
                  { key: 'applied', label: 'Applied', color: 'bg-indigo-500' },
                  { key: 'shortlisted', label: 'Shortlisted', color: 'bg-amber-500' },
                  { key: 'interviewing', label: 'Interviewing', color: 'bg-violet' },
                  { key: 'offered', label: 'Offered', color: 'bg-emerald' },
                  { key: 'rejected', label: 'Rejected', color: 'bg-rose' }
                ].map((item) => {
                  const count = pipelineSummary[item.key] || 0;
                  const total = Object.values(pipelineSummary).reduce((a, b) => a + b, 0) || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={item.key} className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span className="text-muted">{item.label}</span>
                        <span className="text-text">{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 border border-border rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => navigate('recruiter/pipeline')}
                className="w-full py-2 bg-white/5 hover:bg-white/10 border border-border text-xs text-text font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-2"
              >
                <ClipboardCheck size={13} />
                <span>Open Kanban Pipeline</span>
              </button>
            </div>

            {/* Quick Analytics Link */}
            <div className="glass border border-border rounded-2xl p-5 bg-void/25 flex flex-col justify-between hover:border-accent/40 transition-colors">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-text uppercase tracking-wider">Discovery Insights</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Evaluate top skills distributions, placement readiness percentages, and simulated track analytics across student cohorts.
                </p>
              </div>
              <button
                onClick={() => navigate('recruiter/analytics')}
                className="w-full py-2 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-4"
              >
                <span>Analytics Dashboard</span>
                <ArrowRight size={13} />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
