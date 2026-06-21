import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Filter, Star, ArrowRight, Award, GraduationCap, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';
import { useNavigation } from '../context/NavigationContext';
import { getRecruiterStudents, toggleRecruiterShortlist } from '../store/slices/recruiterSlice.js';
import { SkeletonCardList } from '../components/ui/PageSkeleton.jsx';

export default function StudentDiscoveryPage() {
  const { navigate, addToast } = useNavigation();
  const dispatch = useDispatch();

  const { students, pagination, loading, error } = useSelector((state) => state.recruiter);

  // Filter States
  const [search, setSearch] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [careerPath, setCareerPath] = useState('');
  const [minScore, setMinScore] = useState('');
  const [githubConnected, setGithubConnected] = useState('');
  const [certificateStatus, setCertificateStatus] = useState('');
  const [internshipStatus, setInternshipStatus] = useState('');
  const [page, setPage] = useState(1);

  const fetchCandidates = useCallback(() => {
    dispatch(
      getRecruiterStudents({
        page,
        limit: 10,
        search,
        college,
        department,
        year,
        careerPath,
        minScore,
        githubConnected,
        certificateStatus,
        internshipStatus,
      })
    );
  }, [dispatch, page, search, college, department, year, careerPath, minScore, githubConnected, certificateStatus, internshipStatus]);

  useEffect(() => {
    fetchCandidates();
  }, [dispatch, page, department, year, careerPath, minScore, githubConnected, certificateStatus, internshipStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCandidates();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCollege('');
    setDepartment('');
    setYear('');
    setCareerPath('');
    setMinScore('');
    setGithubConnected('');
    setCertificateStatus('');
    setInternshipStatus('');
    setPage(1);
    // Let dispatch fetch fresh set
    dispatch(getRecruiterStudents({ page: 1, limit: 10 }));
    addToast('Filters cleared', 'info');
  };

  const handleToggleShortlist = async (studentUserId, fullName) => {
    try {
      const res = await dispatch(toggleRecruiterShortlist(studentUserId)).unwrap();
      addToast(
        res.data?.status === 'added'
          ? `Added ${fullName} to shortlist!`
          : `Removed ${fullName} from shortlist`,
        'success'
      );
    } catch (err) {
      addToast(err || 'Failed to toggle shortlist', 'error');
    }
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (pagination && page < pagination.totalPages) setPage(page + 1);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 space-y-8 relative z-10">
        
        {/* Header Widget */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-border pb-6 gap-4">
          <div>
            <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em] block">STUDENT DISCOVERY ENGINE</span>
            <h2 className="font-display font-bold text-3xl mt-1">Talent Discovery Directory</h2>
            <p className="text-xs text-muted mt-1">Explore verified developers completing corporate-grade simulated sprints.</p>
          </div>
          <button
            onClick={handleResetFilters}
            className="self-start sm:self-center px-4 py-2 border border-border bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-muted hover:text-text flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Reset Directory</span>
          </button>
        </div>

        {/* Filters Panel */}
        <form onSubmit={handleSearchSubmit} className="glass border border-border rounded-2xl p-5 bg-void/20 space-y-4">
          <div className="flex items-center gap-2 text-muted border-b border-border/40 pb-2">
            <Filter size={14} className="text-accent" />
            <span className="text-xs font-bold uppercase tracking-wider text-text">Search & Filters Configuration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">Keywords</label>
              <div className="flex items-center gap-2 px-3 py-2 border border-border bg-void/50 rounded-xl text-xs">
                <Search size={13} className="text-muted" />
                <input
                  type="text"
                  placeholder="Name, skills..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none border-none text-xs w-full"
                />
              </div>
            </div>

            {/* College Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">University</label>
              <div className="flex items-center gap-2 px-3 py-2 border border-border bg-void/50 rounded-xl text-xs">
                <GraduationCap size={13} className="text-muted" />
                <input
                  type="text"
                  placeholder="MIT, Stanford..."
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="bg-transparent outline-none border-none text-xs w-full"
                />
              </div>
            </div>

            {/* Career Track Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">Career Track</label>
              <select
                value={careerPath}
                onChange={(e) => {
                  setCareerPath(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-border bg-[#0a0f1d] rounded-xl text-xs text-muted outline-none"
              >
                <option value="">All Career Tracks</option>
                <option value="AI Engineer">AI Engineer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Data Scientist">Data Scientist</option>
              </select>
            </div>

            {/* Score Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">Min. Milestone Score</label>
              <select
                value={minScore}
                onChange={(e) => {
                  setMinScore(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-border bg-[#0a0f1d] rounded-xl text-xs text-muted outline-none"
              >
                <option value="">Any Score</option>
                <option value="90">90% and above</option>
                <option value="80">80% and above</option>
                <option value="70">70% and above</option>
                <option value="50">50% and above</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-1 border-t border-border/40">
            {/* Academic Year */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">Academic Year</label>
              <select
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-border bg-[#0a0f1d] rounded-xl text-xs text-muted outline-none"
              >
                <option value="">All Years</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">Major/Department</label>
              <select
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-border bg-[#0a0f1d] rounded-xl text-xs text-muted outline-none"
              >
                <option value="">All Majors</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Data Engineering">Data Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Information Technology">Information Technology</option>
              </select>
            </div>

            {/* GitHub Profile Connected */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">GitHub Status</label>
              <select
                value={githubConnected}
                onChange={(e) => {
                  setGithubConnected(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-border bg-[#0a0f1d] rounded-xl text-xs text-muted outline-none"
              >
                <option value="">Any Status</option>
                <option value="true">Connected Profile</option>
                <option value="false">Not Connected</option>
              </select>
            </div>

            {/* Certificate Issued */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">Credential</label>
              <select
                value={certificateStatus}
                onChange={(e) => {
                  setCertificateStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-border bg-[#0a0f1d] rounded-xl text-xs text-muted outline-none"
              >
                <option value="">Any Status</option>
                <option value="issued">Certificate Issued</option>
                <option value="none">No Certificate</option>
              </select>
            </div>

            {/* Internship Status */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">Sprints Status</label>
              <select
                value={internshipStatus}
                onChange={(e) => {
                  setInternshipStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-border bg-[#0a0f1d] rounded-xl text-xs text-muted outline-none"
              >
                <option value="">Any Status</option>
                <option value="completed">Completed Tracks</option>
                <option value="in-progress">In Sprints</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg hover:shadow-accent/20 transition-all cursor-pointer"
            >
              Apply Search Criteria
            </button>
          </div>
        </form>

        {/* Directory Output */}
        <div className="space-y-4">
          {loading && (
            <SkeletonCardList count={5} />
          )}

          {!loading && students.length === 0 ? (
            <div className="text-center py-16 text-xs text-muted border border-dashed border-border bg-void/10 rounded-2xl">
              No simulated developers match your search or filter configuration. Try adjusting filters or keyword searches.
            </div>
          ) : (
            !loading && (
              <div className="space-y-3.5">
                {students.map((cand) => (
                  <div
                    key={cand._id}
                    className="p-5 border border-border rounded-xl bg-void/40 hover:border-accent/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-gradient-to-br from-accent/20 to-violet/20 border border-accent/20 rounded-full flex items-center justify-center text-accent text-xs font-bold font-display overflow-hidden shrink-0">
                        {cand.avatar ? (
                          <img src={cand.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          cand.fullName.split(' ').map(n => n[0]).join('')
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-text group-hover:text-accent transition-colors">
                            {cand.fullName}
                          </h4>
                          <span className={`text-[8px] font-semibold px-2 py-0.5 rounded-full uppercase border ${
                            cand.internshipStatus === 'completed'
                              ? 'text-emerald bg-emerald/10 border-emerald/20'
                              : 'text-accent bg-accent/10 border-accent/20'
                          }`}>
                            {cand.internshipStatus}
                          </span>
                          {cand.certificateIssued && (
                            <span className="flex items-center gap-0.5 text-[8px] font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">
                              <Award size={9} />
                              <span>Certified</span>
                            </span>
                          )}
                          {cand.githubConnected && (
                            <span className="flex items-center gap-0.5 text-[8px] font-semibold text-muted bg-white/5 border border-border px-2 py-0.5 rounded-full">
                              <FaGithub size={9} />
                              <span>@{cand.githubUsername}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted">
                          {cand.careerTrack} · Year {cand.year} {cand.course} · <strong className="text-text/80">{cand.collegeName}</strong>
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {cand.skills.map((s) => (
                            <span key={s} className="text-[8px] bg-surface-muted border border-border px-1.5 py-0.5 rounded text-muted font-mono">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[9px] text-muted uppercase tracking-wider block font-bold">Task Grade</span>
                        <span className="text-sm font-bold text-accent font-display">{cand.internshipProgress}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleShortlist(cand.userId, cand.fullName)}
                          className={`p-2 border rounded-lg transition-all cursor-pointer ${
                            cand.isShortlisted
                              ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                              : 'border-border bg-surface-muted/20 text-muted hover:text-text hover:border-border-strong'
                          }`}
                          title={cand.isShortlisted ? 'Remove shortlist' : 'Add shortlist'}
                        >
                          <Star size={13} fill={cand.isShortlisted ? 'currentColor' : 'none'} />
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
                ))}
              </div>
            )
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/40 pt-4">
            <span className="text-xs text-muted font-semibold">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} developers)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={handlePrevPage}
                className="p-2 border border-border rounded-xl text-muted hover:text-text disabled:opacity-30 disabled:pointer-events-none hover:bg-white/5 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={handleNextPage}
                className="p-2 border border-border rounded-xl text-muted hover:text-text disabled:opacity-30 disabled:pointer-events-none hover:bg-white/5 transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
