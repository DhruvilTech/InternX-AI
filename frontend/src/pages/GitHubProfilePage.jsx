import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Users, Folder, Globe, Calendar, ExternalLink, AlertTriangle } from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';
import { getGithubProfile, disconnectGithub } from '../store/slices/githubSlice.js';
import { useNavigation } from '../context/NavigationContext.jsx';

export default function GitHubProfilePage() {
  const dispatch = useDispatch();
  const { navigate, addToast } = useNavigation();
  const { profile, loading } = useSelector((state) => state.github);

  useEffect(() => {
    dispatch(getGithubProfile());
  }, [dispatch]);

  const handleDisconnect = async () => {
    if (window.confirm('Are you sure you want to disconnect your GitHub integration? This will unlink your profile, repository configurations, and submissions.')) {
      try {
        await dispatch(disconnectGithub()).unwrap();
        addToast('GitHub account disconnected successfully.', 'success');
        navigate('dashboard/github');
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
          <p className="text-xs text-muted font-semibold tracking-widest uppercase">Fetching account details...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-text">
        <div className="space-y-4 text-center">
          <h2 className="text-sm font-bold">GitHub Account Not Connected</h2>
          <button
            onClick={() => navigate('dashboard/github')}
            className="px-4 py-2 bg-white/5 border border-border text-xs rounded-xl hover:bg-white/10"
          >
            Connect Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <button
            onClick={() => navigate('dashboard/github')}
            className="inline-flex items-center gap-2 text-xs text-muted hover:text-text hover:bg-white/5 px-3 py-1.5 rounded-xl border border-border transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>GitHub Dashboard</span>
          </button>
          <span className="text-[10px] font-mono bg-white/5 border border-border px-3 py-1 rounded-full text-muted uppercase">
            Profile Sync Status
          </span>
        </div>

        {/* Profile Card */}
        <div className="glass border border-border rounded-3xl p-6 sm:p-8 bg-void/35 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-indigo-500 to-violet" />
          
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-accent/20 shrink-0">
              <img src={profile.avatar} alt={profile.displayName} className="h-full w-full object-cover" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-text">{profile.displayName}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[9px] text-accent font-semibold uppercase tracking-wider self-center sm:self-auto">
                  <FaGithub size={10} />
                  @{profile.username}
                </span>
              </div>
              <p className="text-xs text-muted">Connected at {new Date(profile.connectedAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <a
              href={profile.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-accent to-violet text-white text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-accent/25 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <span>GitHub Profile</span>
              <ExternalLink size={13} />
            </a>
            <button
              onClick={handleDisconnect}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 border border-rose-500/20 hover:border-rose-500/50 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all font-semibold cursor-pointer"
            >
              <AlertTriangle size={13} className="text-rose-400" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass border border-border rounded-2xl p-5 bg-void/25 flex items-center gap-4">
            <div className="h-10 w-10 bg-accent/10 border border-accent/20 text-accent rounded-xl flex items-center justify-center shrink-0">
              <Folder size={18} />
            </div>
            <div>
              <span className="text-[10px] text-dim block font-bold uppercase tracking-widest">Public Repos</span>
              <span className="text-lg font-bold text-text font-mono">{profile.publicRepos}</span>
            </div>
          </div>

          <div className="glass border border-border rounded-2xl p-5 bg-void/25 flex items-center gap-4">
            <div className="h-10 w-10 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
              <Users size={18} />
            </div>
            <div>
              <span className="text-[10px] text-dim block font-bold uppercase tracking-widest">Followers</span>
              <span className="text-lg font-bold text-text font-mono">{profile.followers}</span>
            </div>
          </div>

          <div className="glass border border-border rounded-2xl p-5 bg-void/25 flex items-center gap-4">
            <div className="h-10 w-10 bg-emerald/10 border border-emerald/20 text-emerald rounded-xl flex items-center justify-center shrink-0">
              <Users size={18} />
            </div>
            <div>
              <span className="text-[10px] text-dim block font-bold uppercase tracking-widest">Following</span>
              <span className="text-lg font-bold text-text font-mono">{profile.following}</span>
            </div>
          </div>
        </div>

        {/* Details List */}
        <div className="glass border border-border rounded-2xl p-6 bg-void/20 space-y-4">
          <h3 className="text-xs font-bold text-text uppercase tracking-widest border-b border-border/40 pb-3">
            Secure Sync Properties
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User size={15} className="text-accent shrink-0" />
                <div>
                  <span className="text-[10px] text-dim block">GitHub Account User ID</span>
                  <span className="text-xs font-semibold text-text font-mono">{profile.githubId}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Globe size={15} className="text-indigo-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-dim block">Primary Profile URL</span>
                  <a
                    href={profile.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-accent hover:underline truncate block max-w-xs"
                  >
                    {profile.profileUrl}
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Globe size={15} className="text-emerald shrink-0" />
                <div>
                  <span className="text-[10px] text-dim block">Associated Account Email</span>
                  <span className="text-xs font-semibold text-text">{profile.email || 'Not provided'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={15} className="text-violet shrink-0" />
                <div>
                  <span className="text-[10px] text-dim block">Metadata Last Sync</span>
                  <span className="text-xs font-semibold text-text font-mono">
                    {new Date(profile.lastSync).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
