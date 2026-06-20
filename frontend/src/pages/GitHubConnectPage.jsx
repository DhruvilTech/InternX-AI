import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, ArrowRight, Lock, RefreshCw, User, FolderGit2 } from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';
import { connectGithub, getGithubProfile, disconnectGithub } from '../store/slices/githubSlice.js';
import { useNavigation } from '../context/NavigationContext.jsx';

export default function GitHubConnectPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast, navigate } = useNavigation();
  const { profile, loading, error } = useSelector((state) => state.github);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;

    // Check if redirect callback returned success/error flags
    const success = searchParams.get('success');
    const errFlag = searchParams.get('error');

    if (success === 'true') {
      hasProcessed.current = true;
      addToast('GitHub account connected successfully!', 'success');
      // Clear URL params
      setSearchParams({});
    } else if (errFlag) {
      hasProcessed.current = true;
      addToast('OAuth connection failed. Please try again.', 'error');
      setSearchParams({});
    }

    // Attempt to load profile on mount
    dispatch(getGithubProfile());
  }, [dispatch, searchParams, setSearchParams, addToast]);

  const handleConnect = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      addToast('Session expired. Please log in again.', 'error');
      return;
    }
    dispatch(connectGithub(token));
  };

  const handleRefresh = () => {
    dispatch(getGithubProfile());
    addToast('Synchronizing profile details...', 'info');
  };

  const handleDisconnect = async () => {
    if (window.confirm('Are you sure you want to disconnect your GitHub integration? This will unlink your profile, repository configurations, and submissions.')) {
      try {
        await dispatch(disconnectGithub()).unwrap();
        addToast('GitHub account disconnected successfully.', 'success');
      } catch (err) {
        addToast(err || 'Failed to disconnect GitHub account.', 'error');
      }
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-text">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted font-semibold tracking-widest uppercase">Connecting to secure gateway...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-void relative overflow-hidden text-text">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-violet/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-accent/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Header Widget */}
        <div className="border-b border-border pb-4 flex justify-between items-center">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-text">GitHub Integration</h1>
            <p className="text-xs text-muted mt-1">Connect your version control account to sync codebases with simulated internships</p>
          </div>
          {profile && (
            <button
              onClick={handleRefresh}
              className="p-2 border border-border rounded-xl text-muted hover:text-text bg-white/5 hover:bg-white/10 transition-colors"
              title="Sync profile metadata"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          )}
        </div>

        {/* Connection Dashboard Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          <div className="md:col-span-8 flex flex-col justify-between glass border border-border rounded-3xl p-6 sm:p-8 bg-void/35 glow-accent relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-indigo-500 to-violet" />
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-white/5 border border-white/15 rounded-xl flex items-center justify-center text-text shrink-0 shadow-md">
                    <FaGithub size={24} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-text">GitHub Account Link</h3>
                    <p className="text-[10px] text-muted">Secured OAuth 2.0 credentials handshake</p>
                  </div>
                </div>
                
                {profile ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald/10 border border-emerald/20 text-[10px] text-emerald font-semibold uppercase tracking-wider">
                    <CheckCircle2 size={12} /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose/10 border border-rose/20 text-[10px] text-rose font-semibold uppercase tracking-wider">
                    <AlertTriangle size={12} /> Disconnected
                  </span>
                )}
              </div>

              {profile ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald/5 border border-emerald/15 rounded-2xl flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden border border-emerald-400/20 shrink-0">
                      <img src={profile.avatar} alt={profile.displayName} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text">{profile.displayName}</h4>
                      <p className="text-xs text-muted">@{profile.username} · Connected</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    Your GitHub account is fully connected. InternX AI can now fetch your repositories, languages, commits, and pull requests to review your work.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-muted leading-relaxed">
                    Unlock AI-powered code reviews, git feedback metrics, automated skills gap audits, and showcase direct codebase execution graphs to recruiters by binding your GitHub account.
                  </p>
                  <div className="p-4 bg-accent/5 border border-accent/15 rounded-2xl flex items-start gap-3">
                    <Lock size={14} className="text-accent shrink-0 mt-0.5" />
                    <p className="text-[10px] text-muted leading-relaxed">
                      <strong>Security Note:</strong> InternX AI stores your OAuth token in an encrypted format and never displays it or exposes it directly to client requests.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-border/50 flex flex-wrap gap-4 items-center">
              {profile ? (
                <>
                  <button
                    onClick={() => navigate('dashboard/github/repositories')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-accent to-violet text-white rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-accent/25 transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    <span>Browse Repositories</span>
                    <ArrowRight size={13} />
                  </button>
                  <button
                    onClick={() => navigate('dashboard/github/profile')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 border border-border rounded-xl text-xs text-muted hover:text-text hover:border-border-strong transition-all bg-surface-muted/10 font-semibold cursor-pointer"
                  >
                    <User size={13} className="text-accent" />
                    <span>View Integration Profile</span>
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 border border-rose-500/20 hover:border-rose-500/50 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all font-semibold cursor-pointer"
                  >
                    <AlertTriangle size={13} className="text-rose-400" />
                    <span>Disconnect</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-accent to-violet text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-accent/25 transition-all hover:scale-[1.01] cursor-pointer"
                >
                  <FaGithub size={16} />
                  <span>Connect GitHub Account</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Widget */}
          <div className="md:col-span-4 glass border border-border rounded-3xl p-6 bg-void/25 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-text uppercase tracking-widest border-b border-border/40 pb-2">
                Integration Metrics
              </h4>
              
              {profile ? (
                <div className="space-y-4 py-2">
                  <div className="flex items-center justify-between py-1 border-b border-border/30">
                    <span className="text-[11px] text-muted">Public Repositories</span>
                    <span className="text-xs font-bold text-text font-mono">{profile.publicRepos}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-border/30">
                    <span className="text-[11px] text-muted">Followers</span>
                    <span className="text-xs font-bold text-text font-mono">{profile.followers}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-border/30">
                    <span className="text-[11px] text-muted">Following</span>
                    <span className="text-xs font-bold text-text font-mono">{profile.following}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[11px] text-muted">Connection Date</span>
                    <span className="text-[10px] text-muted font-mono">
                      {new Date(profile.connectedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-muted flex flex-col items-center gap-2">
                  <FolderGit2 size={24} className="text-muted/40" />
                  <p>Link your account to see repository metrics here.</p>
                </div>
              )}
            </div>

            <div className="p-3 bg-white/5 border border-border/50 rounded-2xl flex items-start gap-2.5 mt-6">
              <Lock size={12} className="text-accent shrink-0 mt-0.5" />
              <p className="text-[9px] text-muted leading-normal">
                Credentials connection can be safely revoked at any time via your personal GitHub Account settings pane.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
