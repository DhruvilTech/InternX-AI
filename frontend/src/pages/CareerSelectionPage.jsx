import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Cpu,
  Code2,
  Server,
  Database,
  Palette,
  ShieldAlert,
  ArrowRight,
  Star,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext.jsx';
import useAuth from '../hooks/useAuth.js';
import { getAllCareers, selectCareer } from '../api/careerService.js';
import TiltCard from '../components/ui/TiltCard.jsx';

// Map icon categories for clean visuals
const getIconForCategory = (category) => {
  const cat = category.toLowerCase();
  if (cat.includes('ai') || cat.includes('artificial')) return Cpu;
  if (cat.includes('frontend') || cat.includes('web')) return Code2;
  if (cat.includes('backend') || cat.includes('server')) return Server;
  if (cat.includes('data')) return Database;
  if (cat.includes('design') || cat.includes('ui')) return Palette;
  return ShieldAlert;
};

// Map gradient colors based on category/title
const getColorForCareer = (title) => {
  const t = title.toLowerCase();
  if (t.includes('ai') || t.includes('neural')) return 'from-violet to-indigo';
  if (t.includes('frontend') || t.includes('ui')) return 'from-accent to-indigo';
  if (t.includes('backend') || t.includes('devops')) return 'from-indigo to-blue-600';
  if (t.includes('data') || t.includes('scientist')) return 'from-emerald-500 to-cyan-500';
  if (t.includes('ux') || t.includes('designer')) return 'from-rose-500 to-violet';
  return 'from-amber-500 to-rose-500';
};

export default function CareerSelectionPage() {
  const navigate = useNavigate();
  const { addToast } = useNavigation();
  const { user, updateProfile } = useAuth();

  useEffect(() => {
    if (user?.selectedCareer) {
      navigate('/my-career', { replace: true });
    }
  }, [user, navigate]);

  // State Management
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectingId, setSelectingId] = useState(null);

  // Available categories for filtering
  const categories = [
    { label: 'All Fields', value: '' },
    { label: 'AI & Data Science', value: 'Artificial Intelligence' },
    { label: 'Software Engineering', value: 'Software Engineering' },
    { label: 'Design', value: 'Design' },
    { label: 'Cybersecurity', value: 'Cybersecurity' }
  ];

  // Fetch Career Paths
  const loadCareers = async () => {
    setLoading(true);
    try {
      const res = await getAllCareers({
        search: searchTerm,
        category: selectedCategory,
        difficulty: selectedDifficulty,
        page,
        limit: 6
      });
      if (res.success) {
        setCareers(res.data.careers);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load career options.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCareers();
  }, [searchTerm, selectedCategory, selectedDifficulty, page]);

  // Handle Career Selection
  const handleCareerSelect = async (e, careerId, careerTitle) => {
    e.stopPropagation();
    setSelectingId(careerId);
    try {
      const res = await selectCareer(careerId);
      if (res.success && res.data?.studentCareer) {
        // Populate and update user profile in context state
        updateProfile({ selectedCareer: res.data.studentCareer });
        addToast(`Successfully selected ${careerTitle} pathway!`, 'success');
        navigate('/my-career');
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to select career path.', 'error');
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 bg-void relative overflow-hidden">
      {/* Background Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* Page Header */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em] block">
            InternX Academy
          </span>
          <h2 className="font-display text-4xl font-bold bg-gradient-to-r from-text via-text-secondary to-accent bg-clip-text text-transparent">
            Choose Your Career Path
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            Select an industry pathway. This configuration seeds your virtual internship simulation, manager assignments, and learning sprints.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="glass border border-border rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-center justify-between bg-void/30">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={14} />
            <input
              type="text"
              placeholder="Search pathways (e.g. AI Engineer)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-void/50 text-text placeholder-muted/65 text-xs focus:outline-none focus:ring-2 focus:ring-accent/35 transition-all"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-start md:justify-end">
            
            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="appearance-none bg-void/50 border border-border rounded-xl px-4 py-2.5 text-xs text-muted focus:outline-none focus:ring-2 focus:ring-accent/35 pr-10 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-void text-text">
                    {cat.label}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={12} />
            </div>

            {/* Difficulty Filter */}
            <div className="relative">
              <select
                value={selectedDifficulty}
                onChange={(e) => {
                  setSelectedDifficulty(e.target.value);
                  setPage(1);
                }}
                className="appearance-none bg-void/50 border border-border rounded-xl px-4 py-2.5 text-xs text-muted focus:outline-none focus:ring-2 focus:ring-accent/35 pr-10 cursor-pointer"
              >
                <option value="" className="bg-void text-text">All Difficulty</option>
                <option value="Beginner" className="bg-void text-text">Beginner</option>
                <option value="Medium" className="bg-void text-text">Medium</option>
                <option value="Hard" className="bg-void text-text">Hard</option>
              </select>
              <Star className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={12} />
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="h-10 w-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted tracking-widest uppercase">Loading Sprints Catalog...</p>
          </div>
        ) : careers.length === 0 ? (
          <div className="glass border border-border border-dashed rounded-2xl p-16 text-center space-y-4 max-w-md mx-auto">
            <ShieldAlert className="text-amber-500 mx-auto" size={40} />
            <h3 className="text-sm font-bold">No Pathways Found</h3>
            <p className="text-xs text-muted">
              We couldn't find any career paths matching your search criteria. Try refining your filters.
            </p>
          </div>
        ) : (
          /* Grid of Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careers.map((career, i) => {
              const TrackIcon = getIconForCategory(career.category);
              const colorClass = getColorForCareer(career.title);

              return (
                <motion.div
                  key={career._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                >
                  <TiltCard intensity={8} className="h-full cursor-pointer group">
                    <div
                      onClick={() => navigate(`/careers/${career._id}`)}
                      className="h-full flex flex-col justify-between p-6 rounded-2xl glass border border-border hover:border-accent/40 transition-all duration-300 relative overflow-hidden bg-void/40 hover:bg-void/60"
                    >
                      {/* Hover highlight background */}
                      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-10 blur-xl transition-all duration-500`} />

                      <div>
                        {/* Top Bar inside card */}
                        <div className="flex justify-between items-center mb-6">
                          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorClass} text-white shadow-lg`}>
                            <TrackIcon size={18} />
                          </div>
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-muted">
                            <Star size={10} className="text-amber" />
                            {career.difficultyLevel}
                          </span>
                        </div>

                        {/* Title & Info */}
                        <h3 className="font-display text-lg font-bold text-text mb-2 group-hover:text-accent transition-colors">
                          {career.title}
                        </h3>
                        <p className="text-xs text-muted leading-relaxed mb-6 line-clamp-3">
                          {career.description}
                        </p>
                      </div>

                      {/* Skills & Actions Section */}
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-1.5">
                          {career.requiredSkills.slice(0, 4).map((s) => (
                            <span key={s} className="text-[9px] bg-surface-muted border border-border px-2 py-0.5 rounded text-muted font-mono">
                              {s}
                            </span>
                          ))}
                        </div>

                        {/* Footer details */}
                        <div className="flex items-center justify-between text-[10px] text-muted border-t border-border/50 pt-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Clock size={11} className="text-accent" />
                            <span>{career.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp size={11} className="text-emerald" />
                            <span>{career.industryDemand} Demand</span>
                          </div>
                        </div>

                        {/* CTA button */}
                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/careers/${career._id}`)}
                            className="flex-1 py-2 text-center border border-border rounded-xl text-[10px] font-bold uppercase tracking-wider text-muted hover:text-text hover:bg-white/5 transition-colors"
                          >
                            Roadmap Details
                          </button>
                          <button
                            type="button"
                            disabled={selectingId !== null}
                            onClick={(e) => handleCareerSelect(e, career._id, career.title)}
                            className="flex-grow py-2 px-3 rounded-xl bg-gradient-to-r from-accent to-violet text-white text-[10px] font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-accent/25 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            <span>{selectingId === career._id ? 'Processing...' : 'Select Path'}</span>
                            <ArrowRight size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-8">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="p-2 border border-border rounded-xl bg-void/50 text-muted hover:text-text disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-semibold text-muted">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 border border-border rounded-xl bg-void/50 text-muted hover:text-text disabled:opacity-30 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
