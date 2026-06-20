import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GraduationCap, Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';
import { getStudents, fetchCollegeProfile } from '../store/slices/collegeSlice.js';
import { useNavigation } from '../context/NavigationContext';

export default function StudentsManagementPage() {
  const dispatch = useDispatch();
  const { navigate, addToast } = useNavigation();
  const { students, pagination, profile, loading } = useSelector((state) => state.college);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [careerFilter, setCareerFilter] = useState('');
  const [gitFilter, setGitFilter] = useState('');
  const [certFilter, setCertFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Sort States
  const [sortBy, setSortBy] = useState('fullName');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  const fetchFilteredStudents = () => {
    const params = {
      page: currentPage,
      limit: 10,
      search: searchTerm,
      department: deptFilter,
      year: yearFilter,
      careerPath: careerFilter,
      githubConnected: gitFilter,
      certificateStatus: certFilter,
      internshipStatus: statusFilter,
      sort: sortBy,
      order: sortOrder
    };
    dispatch(getStudents(params));
  };

  useEffect(() => {
    fetchFilteredStudents();
    if (!profile) {
      dispatch(fetchCollegeProfile());
    }
  }, [dispatch, currentPage, deptFilter, yearFilter, careerFilter, gitFilter, certFilter, statusFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchFilteredStudents();
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 space-y-6 relative z-10">
        
        {/* Title */}
        <div className="border-b border-border pb-4">
          <span className="text-xs font-semibold text-emerald uppercase tracking-[0.2em] block">Student Roster</span>
          <h2 className="font-display font-bold text-2xl mt-1">Campus Directory Management</h2>
          <p className="text-xs text-muted mt-1">Manage and audit student simulated internship profiles.</p>
        </div>

        {/* Filters and Controls */}
        <div className="glass border border-border rounded-2xl p-5 bg-void/25 space-y-4">
          
          {/* Search bar row */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
              <Search size={14} className="text-muted" />
              <input
                type="text"
                placeholder="Search student names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-xs text-text outline-none border-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg transition-all cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Filter options row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
            {/* Department */}
            <div className="space-y-1">
              <label className="text-[10px] text-muted uppercase font-bold tracking-wider">Department</label>
              <select
                value={deptFilter}
                onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-void/50 border border-border rounded-xl py-1.5 px-2.5 outline-none text-text focus:border-accent"
              >
                <option value="">All Departments</option>
                {profile?.departments?.map((d) => (
                  <option key={d._id} value={d.departmentName}>{d.departmentName}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div className="space-y-1">
              <label className="text-[10px] text-muted uppercase font-bold tracking-wider">Year</label>
              <select
                value={yearFilter}
                onChange={(e) => { setYearFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-void/50 border border-border rounded-xl py-1.5 px-2.5 outline-none text-text focus:border-accent"
              >
                <option value="">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            {/* Career Track */}
            <div className="space-y-1">
              <label className="text-[10px] text-muted uppercase font-bold tracking-wider">Career Track</label>
              <select
                value={careerFilter}
                onChange={(e) => { setCareerFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-void/50 border border-border rounded-xl py-1.5 px-2.5 outline-none text-text focus:border-accent"
              >
                <option value="">All Tracks</option>
                <option value="AI Engineer">AI Engineer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Data Scientist">Data Scientist</option>
              </select>
            </div>

            {/* Git Link */}
            <div className="space-y-1">
              <label className="text-[10px] text-muted uppercase font-bold tracking-wider">GitHub Link</label>
              <select
                value={gitFilter}
                onChange={(e) => { setGitFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-void/50 border border-border rounded-xl py-1.5 px-2.5 outline-none text-text focus:border-accent"
              >
                <option value="">All Connections</option>
                <option value="true">Connected Only</option>
                <option value="false">Unlinked Only</option>
              </select>
            </div>

            {/* Certificate status */}
            <div className="space-y-1">
              <label className="text-[10px] text-muted uppercase font-bold tracking-wider">Certificates</label>
              <select
                value={certFilter}
                onChange={(e) => { setCertFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-void/50 border border-border rounded-xl py-1.5 px-2.5 outline-none text-text focus:border-accent"
              >
                <option value="">All Statuses</option>
                <option value="issued">Issued</option>
                <option value="none">No Certificate</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-[10px] text-muted uppercase font-bold tracking-wider">Internship</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-void/50 border border-border rounded-xl py-1.5 px-2.5 outline-none text-text focus:border-accent"
              >
                <option value="">All Progress</option>
                <option value="in-progress">In-Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Datagrid Table */}
        <div className="glass border border-border rounded-2xl bg-void/25 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs text-muted text-left">
              <thead>
                <tr className="border-b border-border bg-void/50 text-[10px] uppercase font-bold text-text">
                  <th className="p-3 cursor-pointer select-none" onClick={() => toggleSort('fullName')}>
                    <span className="flex items-center gap-1">Student Name <ArrowUpDown size={10} /></span>
                  </th>
                  <th className="p-3">Course / Year</th>
                  <th className="p-3">Career Track</th>
                  <th className="p-3 text-center cursor-pointer select-none" onClick={() => toggleSort('grade')}>
                    <span className="flex items-center gap-1 justify-center">Intern Progress <ArrowUpDown size={10} /></span>
                  </th>
                  <th className="p-3 text-center">GitHub Connection</th>
                  <th className="p-3 text-center">Certificates</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="border-b border-border hover:bg-surface-muted/10 transition-colors">
                    <td className="p-3 font-semibold text-text flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full overflow-hidden border border-border shadow-inner shrink-0">
                        <img src={student.avatar || 'https://via.placeholder.com/150'} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-text">{student.fullName}</div>
                        <div className="text-[10px] text-muted font-mono">{student.email}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>{student.course}</div>
                      <div className="text-[10px] text-muted">Year {student.year}</div>
                    </td>
                    <td className="p-3 font-medium text-text">{student.careerTrack}</td>
                    <td className="p-3 text-center">
                      <div className="font-bold text-text">{student.internshipProgress}%</div>
                      <div className="w-16 h-1 bg-white/5 rounded-full mx-auto overflow-hidden mt-1">
                        <div className="h-full bg-accent" style={{ width: `${student.internshipProgress}%` }} />
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {student.githubConnected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald/10 border border-emerald/20 text-[9px] text-emerald font-semibold uppercase">
                          <FaGithub size={11} /> @{student.githubUsername}
                        </span>
                      ) : (
                        <span className="text-muted text-[10px]">Not Connected</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {student.certificateIssued ? (
                        <span className="px-2 py-0.5 rounded bg-violet/10 border border-violet/20 text-[9px] text-accent font-semibold uppercase">
                          Issued
                        </span>
                      ) : (
                        <span className="text-muted text-[10px]">None</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => navigate(`college/students/${student._id}`)}
                        className="px-3 py-1.5 bg-gradient-to-r from-accent to-violet text-white text-[10px] font-bold rounded-lg hover:shadow-lg transition-all cursor-pointer"
                      >
                        Audit details
                      </button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-muted">
                      <GraduationCap size={32} className="mx-auto text-muted/30 mb-2" />
                      <p>No student records match selected academic filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-border flex justify-between items-center text-xs">
              <span className="text-muted">
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} students)
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-border rounded-lg text-muted hover:text-text disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="p-1.5 border border-border rounded-lg text-muted hover:text-text disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
