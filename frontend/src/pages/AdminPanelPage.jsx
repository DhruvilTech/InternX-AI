import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Building2, GraduationCap, FileCheck, XCircle, Search, Eye } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export default function AdminPanelPage() {
  const { approvals, setApprovalStatus } = useNavigation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('students'); // students, colleges, companies
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending'); // pending, approved, rejected

  const items = approvals[activeCategory] || [];

  const filtered = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.email && item.email.toLowerCase().includes(search.toLowerCase())) ||
      (item.adminEmail && item.adminEmail.toLowerCase().includes(search.toLowerCase())) ||
      (item.recruiterEmail && item.recruiterEmail.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background glow layers */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 space-y-8 relative z-10">

        {/* Title */}
        <div className="border-b border-border pb-6">
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em] block">Super Admin Center</span>
          <h2 className="font-display font-bold text-3xl mt-1">Accreditation & Approvals Panel</h2>
          <p className="text-xs text-muted mt-1">Audit uploaded credentials (Student IDs, College Identity, and Company Licenses) to grant access.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border gap-6">
          {[
            { id: 'students', label: 'Student IDs', icon: User },
            { id: 'colleges', label: 'College Identity', icon: GraduationCap },
            { id: 'companies', label: 'Company Licenses', icon: Building2 }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeCategory === tab.id;
            const count = (approvals[tab.id] || []).filter(item => item.status === statusFilter).length;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveCategory(tab.id);
                  setSearch('');
                }}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${active
                    ? 'border-accent text-text'
                    : 'border-transparent text-muted hover:text-text'
                  }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[9px] font-bold font-mono">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Directory Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={14} />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-muted/10 border border-border rounded-xl py-2 pl-10 pr-4 text-xs text-text placeholder:text-muted focus:border-border-strong outline-none"
            />
          </div>

          <div className="flex gap-2">
            {['pending', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl border text-[10px] font-semibold uppercase tracking-wider transition-all ${statusFilter === status
                    ? 'bg-surface-muted border-border-strong text-text'
                    : 'border-border text-muted hover:text-text hover:bg-surface-muted/20'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Approvals List Grid */}
        <div className="grid md:grid-cols-12 gap-8 items-start">

          {/* Main items directory */}
          <div className="md:col-span-8 space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-xs text-muted border border-dashed border-border rounded-2xl">
                No verification files in the "{statusFilter}" queue.
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  className="p-5 border border-border rounded-2xl bg-void/40 hover:border-accent/30 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-text">{item.name}</h4>
                      <span className="text-[9px] font-mono text-dim">({item.id})</span>
                    </div>

                    <div className="text-xs text-muted space-y-1">
                      <div>
                        <span className="text-dim">Email:</span> {item.email || item.adminEmail || item.recruiterEmail}
                      </div>
                      {item.track && (
                        <div>
                          <span className="text-dim">Preferred Track:</span> {item.track}
                        </div>
                      )}
                      {item.domain && (
                        <div>
                          <span className="text-dim">Authorized Domain:</span> {item.domain}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-accent font-semibold pt-1">
                        <FileCheck size={12} />
                        <span>Uploaded: {item.idDoc || item.identityDoc || item.licenseDoc}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Drawer & document preview */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto shrink-0 justify-between sm:justify-center border-t border-border/40 sm:border-none pt-4 sm:pt-0">
                    <button
                      onClick={() => navigate(`/admin/user/${item.id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl text-[10px] text-muted hover:text-text bg-surface-muted/20 font-semibold cursor-pointer hover:border-accent/40 transition-colors"
                    >
                      <Eye size={12} />
                      <span>Inspect Credential</span>
                    </button>

                    {item.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setApprovalStatus(activeCategory, item.id, 'rejected')}
                          className="h-8 w-8 bg-rose/10 border border-rose/30 text-rose-300 hover:bg-rose/25 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                          title="Reject"
                        >
                          <XCircle size={14} />
                        </button>
                        <button
                          onClick={() => setApprovalStatus(activeCategory, item.id, 'approved')}
                          className="h-8 w-8 bg-emerald/10 border border-emerald/30 text-emerald flex items-center justify-center hover:bg-emerald/25 rounded-lg transition-colors cursor-pointer"
                          title="Approve"
                        >
                          <ShieldCheck size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Guidelines Sidebar */}
          <div className="md:col-span-4 space-y-6">
            <div className="glass border border-border rounded-2xl p-5 bg-void/25 space-y-4">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">Verification Guide</h4>
              <ul className="space-y-3 text-xs text-muted leading-relaxed">
                <li className="flex gap-2">
                  <span className="h-5 w-5 bg-violet/10 border border-violet/20 rounded flex items-center justify-center text-[10px] font-bold text-violet shrink-0">1</span>
                  <span><strong>Student IDs:</strong> Verify the academic domain handles and match the student full name on the ID card.</span>
                </li>
                <li className="flex gap-2">
                  <span className="h-5 w-5 bg-violet/10 border border-violet/20 rounded flex items-center justify-center text-[10px] font-bold text-violet shrink-0">2</span>
                  <span><strong>Colleges:</strong> Review accredited domain seals or government charters for university domains approval.</span>
                </li>
                <li className="flex gap-2">
                  <span className="h-5 w-5 bg-violet/10 border border-violet/20 rounded flex items-center justify-center text-[10px] font-bold text-violet shrink-0">3</span>
                  <span><strong>Companies:</strong> Verify active tax identification licenses and corporate recruiter domain checks.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
