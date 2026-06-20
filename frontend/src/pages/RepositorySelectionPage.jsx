import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, GitBranch, FolderGit2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { getSelectedRepository, getRepositories, selectRepository } from '../store/slices/githubSlice.js';
import { useNavigation } from '../context/NavigationContext.jsx';

export default function RepositorySelectionPage() {
  const dispatch = useDispatch();
  const { navigate, addToast } = useNavigation();
  const { selectedRepository, repositories, loading } = useSelector((state) => state.github);

  const [selectedRepoId, setSelectedRepoId] = useState('');
  const [branchName, setBranchName] = useState('main');
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    dispatch(getSelectedRepository());
    dispatch(getRepositories());
  }, [dispatch]);

  // Set default values when active selected repo exists
  useEffect(() => {
    if (selectedRepository) {
      setSelectedRepoId(selectedRepository.repoId);
      setBranchName(selectedRepository.branch);
    }
  }, [selectedRepository]);

  const handleActivate = async () => {
    if (!selectedRepoId) {
      addToast('Please select a repository first.', 'warning');
      return;
    }
    if (!branchName.trim()) {
      addToast('Please specify a branch name.', 'warning');
      return;
    }

    const matchedRepo = repositories.find((r) => r.repoId === selectedRepoId);
    if (!matchedRepo) {
      addToast('Selected repository is invalid.', 'error');
      return;
    }

    setActivating(true);
    try {
      await dispatch(selectRepository({
        repoId: selectedRepoId,
        repositoryName: matchedRepo.name,
        branch: branchName,
      })).unwrap();
      addToast(`Internship repository activated: ${matchedRepo.name} (${branchName})`, 'success');
    } catch (err) {
      console.error(err);
      addToast(err || 'Failed to activate repository.', 'error');
    } finally {
      setActivating(false);
    }
  };

  if (loading && repositories.length === 0) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-text">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted font-semibold tracking-widest uppercase">Loading submission parameters...</p>
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
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <button
            onClick={() => navigate('dashboard/github')}
            className="inline-flex items-center gap-2 text-xs text-muted hover:text-text hover:bg-white/5 px-3 py-1.5 rounded-xl border border-border transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>GitHub Dashboard</span>
          </button>
          <span className="text-[10px] font-mono bg-white/5 border border-border px-3 py-1 rounded-full text-muted uppercase">
            Codebase Router Configuration
          </span>
        </div>

        {/* Overview Header Card */}
        <div className="glass border border-border rounded-3xl p-6 sm:p-8 bg-void/35 flex flex-col justify-between items-start gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-indigo-500 to-violet" />
          <div className="space-y-2">
            <h2 className="font-display font-bold text-xl sm:text-2xl text-text">Internship Submission Setup</h2>
            <p className="text-xs text-muted leading-relaxed">
              Before submitting virtual task deliverables, you must select the repository holding your source code. The AI evaluation agents will read from this repository to score your work.
            </p>
          </div>
        </div>

        {/* Selected Repo Status Indicator */}
        {selectedRepository ? (
          <div className="glass border border-border/80 rounded-2xl p-5 bg-emerald/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-emerald/10 border border-emerald/20 text-emerald rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <span className="text-[8px] text-emerald font-bold uppercase tracking-wider block">Submission Ready Status</span>
                <h4 className="text-sm font-bold text-text">{selectedRepository.repositoryName}</h4>
                <p className="text-[10px] text-muted flex items-center gap-1 mt-0.5">
                  <GitBranch size={10} className="text-accent" /> Active branch: <strong className="text-text font-mono">{selectedRepository.branch}</strong>
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-[9px] text-dim block">Selected Date</span>
              <span className="text-[10px] text-muted font-semibold font-mono">
                {new Date(selectedRepository.selectedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ) : (
          <div className="glass border border-border rounded-2xl p-5 bg-rose/5 flex items-center gap-3">
            <div className="h-10 w-10 bg-rose/10 border border-rose/20 text-rose rounded-xl flex items-center justify-center shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <span className="text-[8px] text-rose font-bold uppercase tracking-wider block">No Repository Active</span>
              <p className="text-xs text-muted mt-0.5">Please select a repository below to link codebase reviews.</p>
            </div>
          </div>
        )}

        {/* Selection Interface Card */}
        <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-6">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <FolderGit2 size={16} className="text-accent" />
            <h3 className="text-xs font-bold text-text uppercase tracking-widest">
              Activate Repository Link
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dropdown Repo selection */}
            <div className="space-y-2">
              <label className="text-[10px] text-dim uppercase tracking-wider font-bold block">
                Choose Repository
              </label>
              <select
                value={selectedRepoId}
                onChange={(e) => setSelectedRepoId(e.target.value)}
                className="w-full bg-surface-muted/20 border border-border focus:border-accent rounded-xl py-3 px-4 text-xs outline-none text-muted transition-all cursor-pointer"
              >
                <option value="">Select a repository...</option>
                {repositories.map((repo) => (
                  <option key={repo.repoId} value={repo.repoId}>
                    {repo.name} ({repo.visibility})
                  </option>
                ))}
              </select>
            </div>

            {/* Input Branch Selection */}
            <div className="space-y-2">
              <label className="text-[10px] text-dim uppercase tracking-wider font-bold block">
                Target Evaluation Branch
              </label>
              <input
                type="text"
                placeholder="e.g. main, development, feat-ui"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="w-full bg-surface-muted/20 border border-border focus:border-accent rounded-xl py-3 px-4 text-xs placeholder:text-muted outline-none transition-all text-text"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border/40 flex justify-end gap-3">
            {repositories.length === 0 && (
              <button
                onClick={() => dispatch(getRepositories())}
                className="flex items-center gap-1.5 px-4 py-2.5 border border-border rounded-xl text-xs text-muted hover:text-text hover:bg-white/5 transition-all cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Reload List</span>
              </button>
            )}
            <button
              onClick={handleActivate}
              disabled={activating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent to-violet text-white text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-accent/25 transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
            >
              <Sparkles size={13} />
              <span>{activating ? 'Activating codebase...' : 'Activate Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
