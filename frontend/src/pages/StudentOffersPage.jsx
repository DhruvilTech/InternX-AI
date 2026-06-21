import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getReceivedOffers, respondToOffer } from '../store/slices/offersSlice.js';
import { ArrowLeft, Check, X, Calendar, User, Briefcase, Eye, Loader2, DollarSign, Activity } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export default function StudentOffersPage() {
  const dispatch = useDispatch();
  const { navigate, addToast } = useNavigation();
  const { receivedOffers, loading } = useSelector((state) => state.offers);
  const [responseLoading, setResponseLoading] = useState({});

  useEffect(() => {
    dispatch(getReceivedOffers());
  }, [dispatch]);

  const handleResponse = async (offerId, status) => {
    setResponseLoading((prev) => ({ ...prev, [offerId]: status }));
    try {
      await dispatch(respondToOffer({ offerId, status })).unwrap();
      addToast(`Internship offer successfully ${status}!`, 'success');
      dispatch(getReceivedOffers()); // Reload offers list to refresh UI
    } catch (err) {
      addToast(err || 'Failed to update offer response.', 'error');
    } finally {
      setResponseLoading((prev) => ({ ...prev, [offerId]: null }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald/10 border border-emerald/20 text-[9px] text-emerald font-semibold uppercase tracking-wider">
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-full bg-rose/10 border border-rose/20 text-[9px] text-rose font-semibold uppercase tracking-wider">
            Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-500 font-semibold uppercase tracking-wider animate-pulse">
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 space-y-6 relative z-10">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <button
            onClick={() => navigate('student/dashboard')}
            className="inline-flex items-center gap-2 text-xs text-muted hover:text-text hover:bg-white/5 px-3 py-1.5 rounded-xl border border-border transition-colors cursor-pointer"
          >
            <ArrowLeft size={12} />
            <span>Dashboard</span>
          </button>
          <span className="text-[10px] font-mono bg-white/5 border border-border px-3 py-1 rounded-full text-muted uppercase">
            Internship Offers
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="font-display font-bold text-2xl text-text">Internship Offer Letters</h2>
          <p className="text-xs text-muted">Review, accept, or reject official internship opportunities sent directly by recruiters.</p>
        </div>

        {/* Offers list */}
        {loading && receivedOffers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted font-semibold tracking-wider uppercase">Loading offer letters...</p>
          </div>
        ) : receivedOffers.length === 0 ? (
          <div className="glass border border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3 bg-void/25">
            <div className="p-4 bg-white/5 rounded-full border border-white/10 text-muted">
              <Briefcase size={24} />
            </div>
            <h3 className="text-sm font-bold">No Offer Letters Yet</h3>
            <p className="text-xs text-muted max-w-xs mx-auto">Verify that your profile completion is high. When verified recruiters choose to make an offer, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {receivedOffers.map((offer) => (
              <div
                key={offer._id}
                className="glass border border-border rounded-2xl p-6 bg-void/45 hover:border-border-bright transition-all space-y-5 relative overflow-hidden"
              >
                {/* Visual side glow indicator */}
                <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                  offer.status === 'accepted' ? 'bg-emerald' : offer.status === 'rejected' ? 'bg-rose' : 'bg-amber-500'
                }`} />

                {/* Offer Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted font-mono uppercase tracking-wider block">Official Internship Offer</span>
                    <h3 className="font-display font-bold text-lg text-text">{offer.companyName}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                      <span className="flex items-center gap-1.5"><User size={12} className="text-accent" /> Recruiter: {offer.recruiterName}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={12} className="text-accent" /> Received: {new Date(offer.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(offer.status)}
                  </div>
                </div>

                {/* Offer Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-surface-muted/30 border border-border/40 rounded-xl p-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted uppercase tracking-wider block font-medium">Job Role</span>
                    <div className="flex items-center gap-1.5 text-xs text-text font-semibold">
                      <Briefcase size={14} className="text-accent" />
                      <span>{offer.jobRole || 'Software Engineer Intern'}</span>
                    </div>
                  </div>
                  <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-border/40 pt-3 sm:pt-0 sm:pl-4">
                    <span className="text-[10px] text-muted uppercase tracking-wider block font-medium">Salary Package</span>
                    <div className="flex items-center gap-1.5 text-xs text-text font-semibold">
                      <DollarSign size={14} className="text-accent" />
                      <span>{offer.package || 6} LPA</span>
                    </div>
                  </div>
                  <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-border/40 pt-3 sm:pt-0 sm:pl-4">
                    <span className="text-[10px] text-muted uppercase tracking-wider block font-medium">Hiring Pipeline Stage</span>
                    <div className="flex items-center gap-1.5 text-xs text-text font-semibold">
                      <Activity size={14} className="text-accent" />
                      <span className="capitalize">Offered</span>
                    </div>
                  </div>
                </div>

                {/* Offer Message */}
                <div className="p-4 bg-input-bg border border-border/80 rounded-xl">
                  <p className="text-xs leading-relaxed text-text/80 whitespace-pre-wrap">{offer.message}</p>
                </div>

                {/* Action Buttons */}
                {offer.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleResponse(offer._id, 'rejected')}
                      disabled={responseLoading[offer._id]}
                      className="px-4 py-2 border border-border hover:border-rose text-xs font-semibold rounded-xl text-muted hover:text-rose cursor-pointer transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {responseLoading[offer._id] === 'rejected' ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <X size={13} />
                      )}
                      <span>Decline Offer</span>
                    </button>
                    <button
                      onClick={() => handleResponse(offer._id, 'accepted')}
                      disabled={responseLoading[offer._id]}
                      className="px-4 py-2 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {responseLoading[offer._id] === 'accepted' ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Check size={13} />
                      )}
                      <span>Accept Internship Offer</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
