import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  ArrowLeft, Star, GitFork, Eye, AlertCircle, Calendar, ShieldCheck, Folder, FileCode, CheckCircle, 
  CornerDownRight, Globe, Lock, Play, Layers, GitPullRequest, GitMerge, FileText
} from 'lucide-react';
import { getRepositoryDetails, selectRepository, getSelectedRepository } from '../store/slices/githubSlice.js';
import * as githubApi from '../api/githubApi.js';
import { useNavigation } from '../context/NavigationContext.jsx';

const COLORS = ['#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

export default function RepositoryDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { navigate, addToast } = useNavigation();
  
  const { activeRepoDetails, selectedRepository, loading } = useSelector((state) => state.github);
  
  // File Explorer State
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [contentLoading, setContentLoading] = useState(false);
  
  // Selection branch state
  const [branch, setBranch] = useState('main');
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    dispatch(getRepositoryDetails(id));
    dispatch(getSelectedRepository());
  }, [dispatch, id]);

  // Fetch file list when path changes
  useEffect(() => {
    if (activeRepoDetails?.metadata) {
      setFilesLoading(true);
      githubApi.getRepositoryFiles(id, currentPath)
        .then((res) => {
          if (res.success && res.data) {
            setFiles(res.data);
          }
        })
        .catch((err) => {
          console.error(err);
          addToast('Failed to load directory files.', 'error');
        })
        .finally(() => {
          setFilesLoading(false);
        });
    }
  }, [id, currentPath, activeRepoDetails?.metadata, addToast]);

  const handleSelectRepo = async () => {
    if (!activeRepoDetails?.metadata) return;
    setSelecting(true);
    try {
      await dispatch(selectRepository({
        repoId: id,
        repositoryName: activeRepoDetails.metadata.name,
        branch,
      })).unwrap();
      addToast(`Selected ${activeRepoDetails.metadata.name} as active submission repository.`, 'success');
    } catch (err) {
      console.error(err);
      addToast(err || 'Failed to select repository.', 'error');
    } finally {
      setSelecting(false);
    }
  };

  const handleFileClick = (file) => {
    if (file.type === 'dir') {
      setCurrentPath(file.path);
      setSelectedFile(null);
      setFileContent('');
    } else {
      setSelectedFile(file);
      setContentLoading(true);
      githubApi.getRepositoryFileContent(id, file.path)
        .then((res) => {
          if (res.success && res.data) {
            setFileContent(res.data.content || '');
          }
        })
        .catch((err) => {
          console.error(err);
          addToast('Failed to load file contents.', 'error');
          setFileContent('Error loading file content.');
        })
        .finally(() => {
          setContentLoading(false);
        });
    }
  };

  const handleNavigateUp = () => {
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/'));
    setSelectedFile(null);
    setFileContent('');
  };

  const isCurrentSelection = selectedRepository?.repoId === id;

  if (loading && !activeRepoDetails) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-text">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted font-semibold tracking-widest uppercase">Analyzing Codebase Metrics...</p>
        </div>
      </div>
    );
  }

  if (!activeRepoDetails) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-text">
        <div className="space-y-4 text-center">
          <h2 className="text-sm font-bold">Codebase Data Not Synchronized</h2>
          <button
            onClick={() => navigate('dashboard/github/repositories')}
            className="px-4 py-2 bg-white/5 border border-border text-xs rounded-xl hover:bg-white/10"
          >
            Back to Repositories
          </button>
        </div>
      </div>
    );
  }

  const { metadata, languages, commits, pullRequests } = activeRepoDetails;

  // Language chart data formatting
  const langChartData = Object.entries(languages.breakdown || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background glow layers */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4">
          <button
            onClick={() => navigate('dashboard/github/repositories')}
            className="inline-flex items-center gap-2 text-xs text-muted hover:text-text hover:bg-white/5 px-3 py-1.5 rounded-xl border border-border transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Connected Repositories</span>
          </button>
          <div className="flex items-center gap-2">
            {isCurrentSelection ? (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald/10 border border-emerald/20 text-[10px] text-emerald font-semibold uppercase tracking-wider">
                <CheckCircle size={10} /> Active Submission
              </span>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-surface-muted border border-border text-[10px] text-muted font-semibold uppercase tracking-wider">
                Inactive Target
              </span>
            )}
          </div>
        </div>

        {/* Repository Header Information */}
        <div className="glass border border-border rounded-3xl p-6 sm:p-8 bg-void/35 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-indigo-500 to-violet" />
          
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-text">{metadata.name}</h2>
              {metadata.visibility === 'public' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald/10 border border-emerald/20 text-[8px] text-emerald font-semibold uppercase tracking-wider">
                  <Globe size={8} /> Public
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose/10 border border-rose/20 text-[8px] text-rose font-semibold uppercase tracking-wider">
                  <Lock size={8} /> Private
                </span>
              )}
            </div>
            <p className="text-xs text-muted leading-relaxed">{metadata.description || 'No description provided.'}</p>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="w-full sm:w-auto space-y-1">
              <label className="text-[9px] text-dim uppercase tracking-wider font-bold block">Selected Branch</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                disabled={isCurrentSelection || selecting}
                className="w-full sm:w-32 bg-surface-muted/20 border border-border focus:border-accent rounded-lg py-1.5 px-3 text-xs placeholder:text-muted outline-none transition-all text-text"
              />
            </div>
            <button
              onClick={handleSelectRepo}
              disabled={isCurrentSelection || selecting}
              className="w-full sm:w-auto self-end px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent to-violet text-white text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-accent/25 transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
            >
              {selecting ? 'Processing...' : isCurrentSelection ? 'Submission Repository Active' : 'Set as Submission Repository'}
            </button>
          </div>
        </div>

        {/* Repository Statistics & Charts */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* LEFT: Languages Pie Chart & PR Metrics */}
          <div className="md:col-span-5 space-y-6 flex flex-col">
            
            {/* Language Distribution */}
            <div className="glass border border-border rounded-2xl p-5 bg-void/25 flex-1 flex flex-col justify-between">
              <h4 className="text-[10px] font-bold text-text uppercase tracking-widest border-b border-border/40 pb-2 mb-4">
                Language distribution
              </h4>

              {langChartData.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted">No language data compiled.</div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="h-32 w-32 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={langChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={55}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {langChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex-1 w-full space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {langChartData.map((lang, index) => (
                      <div key={lang.name} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-semibold text-text truncate max-w-[80px]">{lang.name}</span>
                        </div>
                        <span className="font-mono text-muted">{lang.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PR Collaboration Metrics */}
            <div className="glass border border-border rounded-2xl p-5 bg-void/25">
              <h4 className="text-[10px] font-bold text-text uppercase tracking-widest border-b border-border/40 pb-2 mb-4">
                Pull Request Collaboration
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div className="p-2.5 bg-accent/5 border border-accent/15 rounded-xl">
                  <span className="text-[9px] uppercase tracking-wider text-muted block mb-1">Open PRs</span>
                  <span className="text-sm font-bold text-accent font-mono">{pullRequests.openPRs}</span>
                </div>
                <div className="p-2.5 bg-emerald/5 border border-emerald/15 rounded-xl">
                  <span className="text-[9px] uppercase tracking-wider text-muted block mb-1">Merged</span>
                  <span className="text-sm font-bold text-emerald font-mono">{pullRequests.mergedPRs}</span>
                </div>
                <div className="p-2.5 bg-rose/5 border border-rose/15 rounded-xl opacity-75">
                  <span className="text-[9px] uppercase tracking-wider text-muted block mb-1">Closed</span>
                  <span className="text-sm font-bold text-rose font-mono">{pullRequests.closedPRs}</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] border-t border-border/40 pt-3">
                <div className="flex items-center gap-1.5 text-muted">
                  <GitMerge size={12} className="text-emerald" />
                  <span>Merge Release Rate</span>
                </div>
                <span className="font-bold text-text font-mono">{pullRequests.mergeRate}%</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Commit activity line graph & metadata */}
          <div className="md:col-span-7 space-y-6 flex flex-col justify-between">
            {/* Commit frequency */}
            <div className="glass border border-border rounded-2xl p-5 bg-void/25 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-[10px] font-bold text-text uppercase tracking-widest border-b border-border/40 pb-2 mb-4">
                  Commit Timeline Frequency
                </h4>
                <div className="h-44 w-full">
                  {commits.commitTimeline.length === 0 ? (
                    <div className="text-center py-12 text-xs text-muted">No commit history found.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={commits.commitTimeline} margin={{ left: -30, right: 10, top: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 8 }} stroke="rgba(255,255,255,0.05)" />
                        <YAxis tick={{ fill: '#64748b', fontSize: 8 }} stroke="rgba(255,255,255,0.05)" />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            backgroundColor: '#050816',
                            color: '#f1f5f9',
                            fontSize: '10px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          dot={{ fill: '#8b5cf6', strokeWidth: 1, r: 2 }}
                          activeDot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-[10px] text-muted border-t border-border/40 pt-4 mt-4">
                <div className="flex items-center gap-1.5">
                  <Play size={12} className="text-accent" />
                  <span>Total commits: <strong>{commits.totalCommits}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={12} className="text-emerald" />
                  <span>User contributions: <strong>{commits.userCommitCount}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick specifications */}
            <div className="grid grid-cols-4 gap-4">
              <div className="glass border border-border rounded-xl p-3 bg-void/25 text-center">
                <span className="text-[8px] text-dim uppercase tracking-wider block mb-1">Stars</span>
                <span className="text-xs font-bold text-text font-mono flex items-center justify-center gap-1">
                  <Star size={10} className="text-amber fill-amber/10" /> {metadata.stars}
                </span>
              </div>
              <div className="glass border border-border rounded-xl p-3 bg-void/25 text-center">
                <span className="text-[8px] text-dim uppercase tracking-wider block mb-1">Forks</span>
                <span className="text-xs font-bold text-text font-mono flex items-center justify-center gap-1">
                  <GitFork size={10} /> {metadata.forks}
                </span>
              </div>
              <div className="glass border border-border rounded-xl p-3 bg-void/25 text-center">
                <span className="text-[8px] text-dim uppercase tracking-wider block mb-1">Watchers</span>
                <span className="text-xs font-bold text-text font-mono flex items-center justify-center gap-1">
                  <Eye size={10} /> {metadata.watchers}
                </span>
              </div>
              <div className="glass border border-border rounded-xl p-3 bg-void/25 text-center">
                <span className="text-[8px] text-dim uppercase tracking-wider block mb-1">Issues</span>
                <span className="text-xs font-bold text-text font-mono flex items-center justify-center gap-1">
                  <AlertCircle size={10} className="text-rose" /> {metadata.openIssues}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Repository File Explorer */}
        <div className="glass border border-border rounded-2xl p-6 bg-void/20 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-4">
            <Layers size={16} className="text-accent" />
            <h3 className="text-xs font-bold text-text uppercase tracking-widest">
              Secure Repository File Explorer (For AI Code Review)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch min-h-[350px]">
            {/* File Directory List */}
            <div className="md:col-span-4 border border-border/60 rounded-xl bg-void/45 p-3 flex flex-col">
              {/* Directory Breadcrumb */}
              <div className="flex items-center justify-between text-[10px] text-dim mb-3 pb-2 border-b border-border/30">
                <span className="truncate">Root / {currentPath}</span>
                {filesLoading && <div className="h-3.5 w-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin" />}
              </div>

              {/* Back to Parent */}
              {currentPath && (
                <button
                  onClick={handleNavigateUp}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-muted hover:text-text rounded-lg hover:bg-white/5 text-left border border-border/20 mb-2 cursor-pointer"
                >
                  <Folder size={13} className="text-indigo-400 fill-indigo-400/20" />
                  <span>.. (Parent Directory)</span>
                </button>
              )}

              {/* Directory files */}
              <div className="flex-1 overflow-y-auto space-y-1 max-h-[300px] pr-1">
                {files.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => handleFileClick(file)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-all text-left cursor-pointer ${
                      selectedFile?.path === file.path 
                        ? 'bg-accent/15 text-accent border border-accent/20' 
                        : 'text-muted hover:text-text hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {file.type === 'dir' ? (
                        <Folder size={14} className="text-indigo-400 fill-indigo-400/25 shrink-0" />
                      ) : (
                        <FileCode size={14} className="text-accent shrink-0" />
                      )}
                      <span className="truncate">{file.name}</span>
                    </div>
                    {file.type === 'file' && (
                      <span className="text-[9px] text-dim font-mono">{(file.size / 1024).toFixed(1)} KB</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Viewport Preview */}
            <div className="md:col-span-8 border border-border/60 rounded-xl bg-void/50 p-4 flex flex-col justify-between">
              {selectedFile ? (
                <div className="flex-1 flex flex-col h-full min-h-[300px]">
                  {/* File Metadata */}
                  <div className="flex justify-between items-center border-b border-border/30 pb-3 mb-3 text-[10px] text-muted">
                    <div className="flex items-center gap-2">
                      <FileText size={12} className="text-accent" />
                      <span className="font-semibold text-text">{selectedFile.name}</span>
                    </div>
                    <span className="font-mono">{(selectedFile.size / 1024).toFixed(2)} KB</span>
                  </div>

                  {/* Content loading state */}
                  {contentLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="h-6 w-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <pre className="flex-1 bg-surface-muted/10 border border-border/50 rounded-lg p-3 overflow-auto max-h-[350px] font-mono text-[10px] leading-relaxed text-muted select-text">
                      <code>{fileContent}</code>
                    </pre>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted min-h-[300px]">
                  <FileCode size={36} className="text-muted/20 mb-3" />
                  <h4 className="text-xs font-bold text-text">Source Code Viewer</h4>
                  <p className="text-[10px] text-muted max-w-xs mt-1">
                    Select any file in the repository tree list to inspect its source code contents.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[9px] text-dim border-t border-border/30 pt-3 mt-3">
                <ShieldCheck size={11} className="text-accent" />
                <span>Codebase read-only connection. Future AI agents will verify changes via these files.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
