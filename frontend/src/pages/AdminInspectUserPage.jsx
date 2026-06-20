import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Building2, GraduationCap, FileCheck, XCircle, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext.jsx';
import axiosInstance from '../api/axios.js';

export default function AdminInspectUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useNavigation();
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`/api/admin/user/${id}`);
        if (res.data?.success && res.data?.data?.user) {
          setTargetUser(res.data.data.user);
        } else {
          addToast('Failed to load user details.', 'error');
        }
      } catch (err) {
        console.error(err);
        addToast('Error loading user data from backend.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleStatusChange = async (status) => {
    setUpdating(true);
    try {
      if (status === 'rejected') {
        await axiosInstance.delete(`/api/admin/user/${id}`);
        addToast('Account request rejected and permanently deleted.', 'error');
      } else {
        let updateField = {};
        if (targetUser.role === 'student') {
          updateField = { isVerified: true };
        } else if (targetUser.role === 'recruiter') {
          updateField = { isRecruiterVerified: true };
        }
        await axiosInstance.put(`/api/admin/user/${id}`, updateField);
        addToast(`Account request approved successfully.`, 'success');
      }
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      addToast('Failed to save approval status.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const isPdfFile = (doc) => {
    if (!doc) return false;
    const url = doc.cloudinaryUrl || doc.verificationDocFile || '';
    const name = doc.verificationDocName || '';
    return url.toLowerCase().includes('.pdf') ||
      url.startsWith('data:application/pdf') ||
      name.toLowerCase().endsWith('.pdf');
  };

  const getDocLabel = () => {
    if (targetUser?.role === 'student') return 'Student ID Card';
    return 'Corporate Business License';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-text">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted font-semibold tracking-widest uppercase">Fetching Credential...</p>
        </div>
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-text">
        <div className="space-y-4 text-center">
          <h2 className="text-sm font-bold">User Not Found</h2>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-4 py-2 bg-white/5 border border-border text-xs rounded-xl hover:bg-white/10"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const fileUrl = targetUser.verificationDocFile || targetUser.cloudinaryUrl;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background glow layers */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 space-y-8 relative z-10">

        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="inline-flex items-center gap-2 text-xs text-muted hover:text-text hover:bg-white/5 px-3 py-1.5 rounded-xl border border-border transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Approvals Directory</span>
          </button>
          <span className="text-[10px] font-mono bg-white/5 border border-border px-2.5 py-1 rounded-full text-muted uppercase">
            User ID: {targetUser._id}
          </span>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Details & Audit Actions */}
          <div className="md:col-span-4 space-y-6">
            <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] block">
                {getDocLabel()} Audit
              </span>
              <h3 className="font-display font-bold text-xl text-text">
                {targetUser.fullName || targetUser.collegeName || targetUser.companyName || 'Anonymous'}
              </h3>

              <div className="space-y-3 text-xs text-muted">
                <div className="pb-3 border-b border-border/40">
                  <span className="text-dim block mb-0.5">Registration Email:</span>
                  <span className="font-semibold text-text">{targetUser.email}</span>
                </div>

                <div className="pb-3 border-b border-border/40">
                  <span className="text-dim block mb-0.5">Account Role Type:</span>
                  <span className="font-semibold text-text uppercase tracking-wider">{targetUser.role}</span>
                </div>

                {targetUser.skills && targetUser.skills.length > 0 && (
                  <div className="pb-3 border-b border-border/40">
                    <span className="text-dim block mb-0.5">Skills / Technologies:</span>
                    <span className="font-mono text-accent-bright font-semibold">{targetUser.skills.join(', ')}</span>
                  </div>
                )}

                {targetUser.collegeName && targetUser.role === 'student' && (
                  <div className="pb-3 border-b border-border/40">
                    <span className="text-dim block mb-0.5">College:</span>
                    <span className="text-text font-semibold">{targetUser.collegeName}</span>
                  </div>
                )}

                {targetUser.website && (
                  <div className="pb-3 border-b border-border/40">
                    <span className="text-dim block mb-0.5">Website:</span>
                    <span className="font-mono text-emerald-300 font-semibold">{targetUser.website}</span>
                  </div>
                )}

                <div className="pb-3 border-b border-border/40">
                  <span className="text-dim block mb-0.5">Uploaded Document Filename:</span>
                  <span className="text-text font-medium truncate block">{targetUser.verificationDocName || 'No document name saved'}</span>
                </div>

                <div>
                  <span className="text-dim block mb-0.5">Account Created:</span>
                  <span className="text-text">{new Date(targetUser.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                <button
                  disabled={updating}
                  onClick={() => handleStatusChange('approved')}
                  className="w-full py-2.5 rounded-xl bg-emerald/20 border border-emerald/40 hover:bg-emerald/30 text-emerald-400 font-bold text-xs uppercase tracking-wider transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
                >
                  {updating ? 'Processing...' : 'Approve & Verify Account'}
                </button>
                <button
                  disabled={updating}
                  onClick={() => handleStatusChange('rejected')}
                  className="w-full py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 font-bold text-xs uppercase tracking-wider transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
                >
                  {updating ? 'Processing...' : 'Reject & Decline Account'}
                </button>
              </div>
            </div>

            {/* Guidelines sidebar */}
            <div className="glass border border-border rounded-2xl p-5 bg-void/25 space-y-3">
              <h4 className="text-[10px] font-bold text-text uppercase tracking-wider">Audit Instructions</h4>
              <p className="text-[11px] text-muted leading-relaxed">
                Confirm that the name on the official document matches the registered name. Ensure details are fully authentic. Once verified, the account will be cleared for login instantly.
              </p>
            </div>
          </div>

          {/* Right Column: Full-width Document Preview Frame */}
          <div className="md:col-span-8">
            <div className="glass border border-border rounded-2xl p-4 bg-void/30 space-y-4">
              <div className="flex justify-between items-center text-xs text-muted border-b border-border/40 pb-3">
                <span className="font-bold">Accreditation Document Preview</span>
                {fileUrl && (
                  fileUrl.startsWith('data:') ? (
                    <a
                      href={fileUrl}
                      download={targetUser.verificationDocName || 'verification-document'}
                      className="text-accent hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <span>Download Document</span>
                      <ArrowUpRight size={12} />
                    </a>
                  ) : (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <span>Open External View</span>
                      <ArrowUpRight size={12} />
                    </a>
                  )
                )}
              </div>

              {fileUrl ? (
                <div className="border border-border bg-void/80 rounded-xl overflow-hidden min-h-[500px] flex flex-col p-4 justify-between items-center relative">
                  <div className="w-full flex-grow flex items-center justify-center overflow-hidden bg-void/50 rounded-lg p-2 min-h-[480px] w-full">
                    {isPdfFile(targetUser) ? (
                      <iframe
                        src={fileUrl}
                        className="w-full min-h-[480px] bg-white rounded border border-border"
                        title="PDF Credential"
                      />
                    ) : (
                      <img
                        src={fileUrl}
                        alt="Uploaded Credential"
                        className="max-w-full max-h-[460px] object-contain rounded-lg"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-amber-500/30 rounded-xl p-12 bg-gradient-to-br from-amber-500/5 to-void text-center space-y-6 min-h-[300px] flex flex-col justify-center">
                  <h4 className="text-amber-500 text-sm font-bold uppercase tracking-widest">No Document File Attached</h4>
                  <p className="text-xs text-muted max-w-md mx-auto">
                    This registration contains no uploaded document. You can verify based on email credentials or decline the request.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
