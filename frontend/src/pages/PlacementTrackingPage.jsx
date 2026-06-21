import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlacements } from '../store/slices/placementSlice.js';
import { getDashboard } from '../store/slices/collegeSlice.js';
import { useNavigation } from '../context/NavigationContext';
import { 
  Search, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Users, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  GraduationCap, 
  DollarSign 
} from 'lucide-react';

export default function PlacementTrackingPage() {
  const dispatch = useDispatch();
  const { navigate } = useNavigation();

  // Redux state
  const { placements, pagination, loading, error } = useSelector((state) => state.placement);
  const { dashboard } = useSelector((state) => state.college);

  // Local filters state
  const [searchStudent, setSearchStudent] = useState('');
  const [searchCompany, setSearchCompany] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  // Fetch KPI dashboard data and placements list on mount / filter change
  useEffect(() => {
    dispatch(getDashboard());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchPlacements({
      page,
      limit: 8,
      searchStudent,
      searchCompany,
      department,
      status
    }));
  }, [dispatch, page, searchStudent, searchCompany, department, status]);

  // Extract unique departments from placements or students list
  const departments = useMemo(() => {
    if (!dashboard?.charts?.studentsByDepartment) return [];
    return dashboard.charts.studentsByDepartment.map(d => d.name);
  }, [dashboard]);

  // Handle page navigation
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      setPage(newPage);
    }
  };

  // KPIs
  const kpis = dashboard?.kpis || {};

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border/40 pb-5 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold bg-gradient-to-r from-text via-accent to-violet bg-clip-text text-transparent">
              Placement Outcomes & Analytics
            </h1>
            <p className="text-xs text-muted mt-1.5">
              Monitor, search, and track corporate offers and placement rates for your institution cohort.
            </p>
          </div>
          <span className="self-start md:self-center text-[10px] font-mono bg-white/5 border border-border px-3.5 py-1.5 rounded-full text-muted uppercase">
            Institutional Registry Portal
          </span>
        </div>

        {/* KPIs Deck */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Card 1: Total Offers */}
          <div className="glass border border-border/80 bg-void/25 p-4 rounded-2xl flex flex-col justify-between space-y-3">
            <span className="text-[9px] uppercase font-bold text-muted tracking-wider">Total Offers</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-text">{kpis.totalOffers || 0}</span>
              <Briefcase size={16} className="text-violet/60" />
            </div>
          </div>

          {/* Card 2: Accepted */}
          <div className="glass border border-border/80 bg-void/25 p-4 rounded-2xl flex flex-col justify-between space-y-3">
            <span className="text-[9px] uppercase font-bold text-muted tracking-wider">Accepted Offers</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-emerald">{kpis.acceptedOffers || 0}</span>
              <CheckCircle2 size={16} className="text-emerald/60" />
            </div>
          </div>

          {/* Card 3: Rejected */}
          <div className="glass border border-border/80 bg-void/25 p-4 rounded-2xl flex flex-col justify-between space-y-3">
            <span className="text-[9px] uppercase font-bold text-muted tracking-wider">Rejected Offers</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-rose">{kpis.rejectedOffers || 0}</span>
              <XCircle size={16} className="text-rose/60" />
            </div>
          </div>

          {/* Card 4: Students Placed */}
          <div className="glass border border-border/80 bg-void/25 p-4 rounded-2xl flex flex-col justify-between space-y-3">
            <span className="text-[9px] uppercase font-bold text-muted tracking-wider">Students Placed</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-accent">{kpis.studentsPlaced || 0}</span>
              <Users size={16} className="text-accent/60" />
            </div>
          </div>

          {/* Card 5: Seeking Opportunities */}
          <div className="glass border border-border/80 bg-void/25 p-4 rounded-2xl flex flex-col justify-between space-y-3">
            <span className="text-[9px] uppercase font-bold text-muted tracking-wider">Still Seeking</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-indigo-400">{kpis.studentsSeeking || 0}</span>
              <Clock size={16} className="text-indigo-400/60" />
            </div>
          </div>

          {/* Card 6: Placement Rate */}
          <div className="glass border border-border/80 bg-void/25 p-4 rounded-2xl flex flex-col justify-between space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent to-violet" />
            <span className="text-[9px] uppercase font-bold text-muted tracking-wider">Placement Rate</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-accent">{kpis.placementRate || 0}%</span>
              <TrendingUp size={16} className="text-accent/80 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="glass border border-border/60 bg-void/10 p-5 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-border/30 pb-2">
            <Filter size={14} className="text-accent" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted">Filter Placements Registry</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filter: Search Student */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted uppercase tracking-wider block">Student Name</label>
              <div className="relative">
                <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchStudent}
                  onChange={(e) => { setSearchStudent(e.target.value); setPage(1); }}
                  className="w-full bg-void/50 border border-border rounded-xl pl-9 pr-3.5 py-2 text-xs text-text outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Filter: Search Company */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted uppercase tracking-wider block">Company Name</label>
              <div className="relative">
                <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search hiring companies..."
                  value={searchCompany}
                  onChange={(e) => { setSearchCompany(e.target.value); setPage(1); }}
                  className="w-full bg-void/50 border border-border rounded-xl pl-9 pr-3.5 py-2 text-xs text-text outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Filter: Department */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted uppercase tracking-wider block">Department</label>
              <select
                value={department}
                onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
                className="w-full bg-[#0a0f1d] border border-border rounded-xl px-3.5 py-2 text-xs text-text outline-none focus:border-accent"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Filter: Status */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted uppercase tracking-wider block">Offer Status</label>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="w-full bg-[#0a0f1d] border border-border rounded-xl px-3.5 py-2 text-xs text-text outline-none focus:border-accent"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Placements Registry Grid */}
        <div className="glass border border-border rounded-2xl bg-void/25 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-white/5 text-[9px] font-bold uppercase tracking-wider text-muted">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Job Role</th>
                  <th className="px-6 py-4 text-center">Package (LPA)</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Acceptance Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {placements.map((p) => {
                  const studentDept = p.studentId?.department || 'Computer Science';
                  return (
                    <tr 
                      key={p._id} 
                      className="hover:bg-white/5 transition-colors cursor-pointer group"
                      onClick={() => navigate(`college/students/${p.studentId?._id}`)}
                    >
                      {/* Student Profile Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={p.studentId?.avatar || 'https://via.placeholder.com/150'} 
                            alt="" 
                            className="h-8 w-8 rounded-lg object-cover border border-border group-hover:border-accent/40"
                          />
                          <div>
                            <span className="font-semibold text-text group-hover:text-accent transition-colors block">
                              {p.studentId?.fullName || 'Simulated Candidate'}
                            </span>
                            <span className="text-[10px] text-muted font-mono">{p.studentId?.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4 text-muted">
                        <div className="flex items-center gap-1.5">
                          <GraduationCap size={12} className="text-violet/60" />
                          <span>{studentDept}</span>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="px-6 py-4 font-semibold text-text">
                        {p.companyName}
                      </td>

                      {/* Job Role */}
                      <td className="px-6 py-4 text-muted font-mono">
                        {p.jobRole}
                      </td>

                      {/* Package */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-mono text-accent font-bold">
                          <DollarSign size={10} />
                          <span>{p.package} LPA</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] uppercase font-bold ${
                          p.offerStatus === 'accepted'
                            ? 'bg-emerald/10 border border-emerald/20 text-emerald'
                            : p.offerStatus === 'rejected'
                            ? 'bg-rose/10 border border-rose/20 text-rose'
                            : 'bg-amber/10 border border-amber/20 text-amber-400'
                        }`}>
                          {p.offerStatus === 'accepted' && <CheckCircle2 size={10} />}
                          {p.offerStatus === 'rejected' && <XCircle size={10} />}
                          {p.offerStatus === 'pending' && <Clock size={10} />}
                          <span>{p.offerStatus}</span>
                        </span>
                      </td>

                      {/* Acceptance Date */}
                      <td className="px-6 py-4 text-right text-[10px] text-muted font-mono">
                        {p.acceptedAt ? new Date(p.acceptedAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  );
                })}

                {placements.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-xs text-muted">
                      No placement outcome records found matching the active criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          {pagination?.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-t border-border/40">
              <span className="text-[10px] text-muted">
                Showing page <strong className="text-text">{pagination.page}</strong> of <strong className="text-text">{pagination.totalPages}</strong>
              </span>

              <div className="flex gap-1.5">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-1.5 border border-border rounded-lg text-muted hover:text-text disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="p-1.5 border border-border rounded-lg text-muted hover:text-text disabled:opacity-30 cursor-pointer"
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
