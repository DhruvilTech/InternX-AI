import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, GitFork, Globe, Lock, RefreshCw, SlidersHorizontal, ArrowLeft, ExternalLink, ArrowRight } from 'lucide-react';
import { getRepositories } from '../store/slices/githubSlice.js';
import { useNavigation } from '../context/NavigationContext.jsx';

export default function GitHubRepositoriesPage() {
  const dispatch = useDispatch();
  const { navigate, addToast } = useNavigation();
  const { repositories, loading } = useSelector((state) => state.github);

  // Filter and Sort states
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('All');
  const [visibility, setVisibility] = useState('All');
  const [sortBy, setSortBy] = useState('updated'); // updated, stars, forks, name

  useEffect(() => {
    dispatch(getRepositories());
  }, [dispatch]);

  const handleSync = () => {
    dispatch(getRepositories());
    addToast('Synchronizing repository metadata with GitHub...', 'info');
  };

  // Compile list of languages present in repositories
  const getLanguagesList = () => {
    const list = new Set(['All']);
    repositories.forEach((repo) => {
      if (repo.language) list.add(repo.language);
    });
    return Array.from(list);
  };

  // Filter and sort computation
  const filteredRepositories = repositories
    .filter((repo) => {
      const matchesSearch = repo.name.toLowerCase().includes(search.toLowerCase()) || 
                            (repo.description && repo.description.toLowerCase().includes(search.toLowerCase()));
      const matchesLanguage = language === 'All' || repo.language === language;
      const matchesVisibility = visibility === 'All' || repo.visibility === visibility;
      return matchesSearch && matchesLanguage && matchesVisibility;
    })
    .sort((a, b) => {
      if (sortBy === 'stars') return b.stars - a.stars;
      if (sortBy === 'forks') return b.forks - a.forks;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.updatedAtGithub || b.updatedAt) - new Date(a.updatedAtGithub || a.updatedAt);
    });

  if (loading && repositories.length === 0) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-text">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted font-semibold tracking-widest uppercase">Syncing GitHub repositories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Glow layers */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Navigation / Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <button
              onClick={() => navigate('dashboard/github')}
              className="inline-flex items-center gap-2 text-xs text-muted hover:text-text hover:bg-white/5 px-2.5 py-1 rounded-lg border border-border/80 transition-colors mb-3 cursor-pointer"
            >
              <ArrowLeft size={12} />
              <span>GitHub Dashboard</span>
            </button>
            <h1 className="font-display font-bold text-2xl text-text">Connected Repositories</h1>
            <p className="text-xs text-muted">Browse and explore source codebases mapped to your account</p>
          </div>

          <button
            onClick={handleSync}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent to-violet text-white rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-accent/25 transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Sync Repositories</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="glass rounded-2xl p-4 border border-border bg-void/35 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-text uppercase tracking-wider">
            <SlidersHorizontal size={13} className="text-accent" />
            <span>Search & Filter controls</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search size={14} className="absolute left-3 top-3 text-muted" />
              <input
                type="text"
                placeholder="Search by name or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-muted/20 border border-border focus:border-accent rounded-xl py-2.5 pl-9 pr-4 text-xs placeholder:text-muted outline-none transition-all text-text"
              />
            </div>

            {/* Language filter */}
            <div className="sm:col-span-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-surface-muted/20 border border-border focus:border-accent rounded-xl py-2.5 px-3 text-xs outline-none text-muted transition-all cursor-pointer"
              >
                <option value="All">All Languages</option>
                {getLanguagesList()
                  .filter((l) => l !== 'All')
                  .map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
              </select>
            </div>

            {/* Visibility filter */}
            <div className="sm:col-span-2">
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full bg-surface-muted/20 border border-border focus:border-accent rounded-xl py-2.5 px-3 text-xs outline-none text-muted transition-all cursor-pointer"
              >
                <option value="All">All Visibility</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            {/* Sort order */}
            <div className="sm:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-surface-muted/20 border border-border focus:border-accent rounded-xl py-2.5 px-3 text-xs outline-none text-muted transition-all cursor-pointer"
              >
                <option value="updated">Recently Updated</option>
                <option value="stars">Popular Stars</option>
                <option value="forks">Popular Forks</option>
                <option value="name">Repo Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Repositories Grid */}
        {filteredRepositories.length === 0 ? (
          <div className="text-center py-16 glass rounded-2xl border border-border bg-void/10 space-y-4">
            <p className="text-xs text-muted">No repositories match your filter query criteria.</p>
            {repositories.length === 0 && (
              <button
                onClick={handleSync}
                className="px-4 py-2 bg-accent/15 border border-accent/30 text-accent rounded-xl text-xs font-semibold hover:bg-accent/20 transition-all cursor-pointer"
              >
                Sync with GitHub
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredRepositories.map((repo, idx) => (
                <motion.div
                  key={repo._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.3) }}
                  className="glass rounded-2xl p-5 border border-border bg-void/30 flex flex-col justify-between hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all group relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Header: Name and Visibility */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-0.5">
                        <h3 className="font-display font-bold text-sm text-text group-hover:text-accent transition-colors truncate max-w-sm">
                          {repo.name}
                        </h3>
                        <p className="text-[10px] text-muted truncate max-w-xs">{repo.fullName}</p>
                      </div>
                      
                      {repo.visibility === 'public' ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald/10 border border-emerald/20 text-[8px] text-emerald font-semibold uppercase tracking-wider">
                          <Globe size={8} /> Public
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose/10 border border-rose/20 text-[8px] text-rose font-semibold uppercase tracking-wider">
                          <Lock size={8} /> Private
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed min-h-[32px]">
                      {repo.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Footer Stats & Navigation */}
                  <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] text-dim">
                      {repo.language && (
                        <span className="px-2 py-0.5 rounded bg-surface-muted/30 border border-border/40 text-muted font-mono font-semibold">
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star size={10} className="text-amber fill-amber/20" />
                        {repo.stars}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork size={10} />
                        {repo.forks}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={repo.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 border border-border rounded-lg text-muted hover:text-text bg-white/5 hover:bg-white/10 transition-colors"
                        title="Open on GitHub"
                      >
                        <ExternalLink size={12} />
                      </a>
                      <button
                        onClick={() => navigate(`dashboard/github/repositories/${repo.repoId}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-accent to-violet text-white rounded-lg text-[10px] font-semibold hover:shadow-lg hover:shadow-accent/20 transition-all cursor-pointer"
                      >
                        <span>Analyze</span>
                        <ArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
