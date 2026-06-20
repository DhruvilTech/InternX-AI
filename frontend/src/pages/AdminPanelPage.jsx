import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  User,
  Building2,
  GraduationCap,
  FileCheck,
  XCircle,
  Search,
  Eye,
  Plus,
  Edit,
  Trash2,
  Layers,
  X,
  Star,
  Clock,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import axiosInstance from '../api/axios.js';

export default function AdminPanelPage() {
  const { approvals, setApprovalStatus, addToast } = useNavigation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('students'); // students, colleges, companies, careers
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending'); // pending, approved, rejected
  const [viewedDocs, setViewedDocs] = useState({});

  // Careers state
  const [careersList, setCareersList] = useState([]);
  const [careersLoading, setCareersLoading] = useState(false);

  // Career Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCareerId, setEditingCareerId] = useState(null); // null means creating
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDifficulty, setFormDifficulty] = useState('Medium');
  const [formDuration, setFormDuration] = useState('4 Weeks');
  const [formDemand, setFormDemand] = useState('High');
  const [formSkills, setFormSkills] = useState('');
  const [formRoadmap, setFormRoadmap] = useState([{ phase: 1, title: '', description: '', topics: '' }]);
  const [submittingForm, setSubmittingForm] = useState(false);

  // Fetch Career Paths
  const fetchCareers = async () => {
    setCareersLoading(true);
    try {
      const res = await axiosInstance.get('/api/careers?limit=100');
      if (res.data?.success) {
        setCareersList(res.data.data.careers);
      }
    } catch (err) {
      console.error(err);
      if (typeof addToast === 'function') {
        addToast('Failed to load career paths catalog.', 'error');
      }
    } finally {
      setCareersLoading(false);
    }
  };

  useEffect(() => {
    if (activeCategory === 'careers') {
      fetchCareers();
    }
  }, [activeCategory]);

  const items = approvals[activeCategory] || [];

  // Filter logic based on active category
  const getFilteredItems = () => {
    if (activeCategory === 'careers') {
      return careersList.filter(career =>
        career.title.toLowerCase().includes(search.toLowerCase()) ||
        career.category.toLowerCase().includes(search.toLowerCase()) ||
        career.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    return items.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.email && item.email.toLowerCase().includes(search.toLowerCase())) ||
        (item.adminEmail && item.adminEmail.toLowerCase().includes(search.toLowerCase())) ||
        (item.recruiterEmail && item.recruiterEmail.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const filtered = getFilteredItems();

  // Handle Career Deletion
  const handleDeleteCareer = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete the "${title}" career path? This will also cascade delete all student selections.`)) {
      return;
    }

    try {
      const res = await axiosInstance.delete(`/api/careers/${id}`);
      if (res.data?.success) {
        if (typeof addToast === 'function') {
          addToast(`Deleted ${title} career path successfully.`, 'success');
        } else {
          alert(`Deleted ${title} successfully.`);
        }
        fetchCareers();
      }
    } catch (err) {
      console.error(err);
      if (typeof addToast === 'function') {
        addToast('Failed to delete career path.', 'error');
      }
    }
  };

  // Open modal for Creation
  const handleOpenCreateModal = () => {
    setEditingCareerId(null);
    setFormTitle('');
    setFormDesc('');
    setFormCategory('');
    setFormDifficulty('Medium');
    setFormDuration('4 Weeks');
    setFormDemand('High');
    setFormSkills('');
    setFormRoadmap([{ phase: 1, title: '', description: '', topics: '' }]);
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEditModal = (career) => {
    setEditingCareerId(career._id);
    setFormTitle(career.title);
    setFormDesc(career.description);
    setFormCategory(career.category);
    setFormDifficulty(career.difficultyLevel);
    setFormDuration(career.duration);
    setFormDemand(career.industryDemand);
    setFormSkills(career.requiredSkills ? career.requiredSkills.join(', ') : '');
    
    const mappedRoadmap = career.learningRoadmap && career.learningRoadmap.length > 0
      ? career.learningRoadmap.map(p => ({
          phase: p.phase,
          title: p.title,
          description: p.description,
          topics: p.topics ? p.topics.join(', ') : ''
        }))
      : [{ phase: 1, title: '', description: '', topics: '' }];
      
    setFormRoadmap(mappedRoadmap);
    setIsModalOpen(true);
  };

  // Roadmap Phase Form Helpers
  const handleAddPhase = () => {
    setFormRoadmap(prev => [...prev, { phase: prev.length + 1, title: '', description: '', topics: '' }]);
  };

  const handleRemovePhase = (index) => {
    if (formRoadmap.length === 1) return;
    const updated = formRoadmap.filter((_, idx) => idx !== index).map((p, idx) => ({ ...p, phase: idx + 1 }));
    setFormRoadmap(updated);
  };

  const handlePhaseChange = (index, field, value) => {
    setFormRoadmap(prev => prev.map((p, idx) => idx === index ? { ...p, [field]: value } : p));
  };

  // Form Submit Handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmittingForm(true);

    const payload = {
      title: formTitle,
      description: formDesc,
      category: formCategory,
      difficultyLevel: formDifficulty,
      duration: formDuration,
      industryDemand: formDemand,
      requiredSkills: formSkills.split(',').map(s => s.trim()).filter(s => s !== ''),
      learningRoadmap: formRoadmap.map(p => ({
        phase: p.phase,
        title: p.title,
        description: p.description,
        topics: p.topics.split(',').map(t => t.trim()).filter(t => t !== '')
      }))
    };

    try {
      let res;
      if (editingCareerId) {
        res = await axiosInstance.put(`/api/careers/${editingCareerId}`, payload);
      } else {
        res = await axiosInstance.post('/api/careers', payload);
      }

      if (res.data?.success) {
        if (typeof addToast === 'function') {
          addToast(editingCareerId ? 'Career updated successfully' : 'Career created successfully', 'success');
        }
        setIsModalOpen(false);
        fetchCareers();
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to save career path details.';
      if (typeof addToast === 'function') {
        addToast(errMsg, 'error');
      } else {
        alert(errMsg);
      }
    } finally {
      setSubmittingForm(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background glow layers */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 space-y-8 relative z-10">

        {/* Title */}
        <div className="border-b border-border pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em] block">Super Admin Center</span>
            <h2 className="font-display font-bold text-3xl mt-1">Platform Control Console</h2>
            <p className="text-xs text-muted mt-1">Audit verification documents or manage simulated career pathway roadmaps.</p>
          </div>
          {activeCategory === 'careers' && (
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg hover:shadow-accent/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Career Path</span>
            </button>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border gap-4 sm:gap-6 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'students', label: 'Student IDs', icon: User },
            { id: 'colleges', label: 'College Identity', icon: GraduationCap },
            { id: 'companies', label: 'Company Licenses', icon: Building2 },
            { id: 'careers', label: 'Manage Careers', icon: Layers }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeCategory === tab.id;
            const count = activeCategory !== 'careers' && tab.id !== 'careers'
              ? (approvals[tab.id] || []).filter(item => item.status === statusFilter).length
              : 0;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveCategory(tab.id);
                  setSearch('');
                }}
                className={`flex items-center gap-2 px-3 sm:px-4 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${active
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
              placeholder={activeCategory === 'careers' ? "Search by title, category..." : "Search by name, email..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-muted/10 border border-border rounded-xl py-2 pl-10 pr-4 text-xs text-text placeholder:text-muted focus:border-border-strong outline-none"
            />
          </div>

          {activeCategory !== 'careers' && (
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
          )}
        </div>

        {/* Approvals / Careers List Grid */}
        <div className="grid md:grid-cols-12 gap-8 items-start">

          {/* Main items directory */}
          <div className="md:col-span-8 space-y-4">
            {activeCategory === 'careers' ? (
              careersLoading ? (
                <div className="text-center py-16 space-y-4">
                  <div className="h-8 w-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-muted">Fetching careers catalog...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-xs text-muted border border-dashed border-border rounded-2xl">
                  No careers configured in catalog. Click "Add Career Path" to create one.
                </div>
              ) : (
                filtered.map((career) => (
                  <div
                    key={career._id}
                    className="p-5 border border-border rounded-2xl bg-void/40 hover:border-accent/30 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
                  >
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h4 className="text-sm font-bold text-text truncate">{career.title}</h4>
                        <span className="text-[9px] uppercase tracking-wider font-semibold font-mono px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent">
                          {career.category}
                        </span>
                      </div>
                      
                      <p className="text-xs text-muted line-clamp-2 leading-relaxed">{career.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted font-mono pt-1">
                        <div className="flex items-center gap-1">
                          <Star size={11} className="text-amber" />
                          <span>{career.difficultyLevel}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={11} className="text-accent" />
                          <span>{career.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp size={11} className="text-emerald" />
                          <span>{career.industryDemand} Demand</span>
                        </div>
                        <div>
                          <span>({career.learningRoadmap?.length || 0} Phase Sprints)</span>
                        </div>
                      </div>

                      {career.requiredSkills && career.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1.5">
                          {career.requiredSkills.map(s => (
                            <span key={s} className="text-[8px] bg-surface-muted/40 border border-border px-1.5 py-0.5 rounded text-dim font-mono">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-2.5 w-full sm:w-auto shrink-0 justify-end sm:justify-center border-t border-border/40 sm:border-none pt-4 sm:pt-0">
                      <button
                        onClick={() => handleOpenEditModal(career)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-border rounded-xl text-[10px] text-muted hover:text-text bg-surface-muted/20 font-semibold cursor-pointer hover:border-accent/40 transition-colors"
                      >
                        <Edit size={11} />
                        <span>Edit Path</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCareer(career._id, career.title)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-rose-500/25 rounded-xl text-[10px] text-rose-300 hover:text-rose-400 bg-rose-500/5 font-semibold cursor-pointer hover:border-rose-500/50 transition-colors"
                      >
                        <Trash2 size={11} />
                        <span>Delete Path</span>
                      </button>
                    </div>
                  </div>
                ))
              )
            ) : filtered.length === 0 ? (
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
                        <span>Uploaded: </span>
                        {item.fileUrl || item.cloudinaryUrl ? (
                          (item.fileUrl && item.fileUrl.startsWith('data:')) ? (
                            <a
                              href={item.fileUrl}
                              download={item.idDoc || item.identityDoc || item.licenseDoc || 'verification-document'}
                              onClick={() => setViewedDocs(prev => ({ ...prev, [item.id]: true }))}
                              className="hover:underline text-accent-bright inline-flex items-center gap-0.5 cursor-pointer"
                              title="Download Verification Document"
                            >
                              <span>{item.idDoc || item.identityDoc || item.licenseDoc} (Download)</span>
                              <ArrowUpRight size={10} />
                            </a>
                          ) : (
                            <a
                              href={item.cloudinaryUrl || item.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setViewedDocs(prev => ({ ...prev, [item.id]: true }))}
                              className="hover:underline text-accent-bright inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>{item.idDoc || item.identityDoc || item.licenseDoc}</span>
                              <ArrowUpRight size={10} />
                            </a>
                          )
                        ) : (
                          <span className="text-muted">{item.idDoc || item.identityDoc || item.licenseDoc || 'No document uploaded'}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Drawer & document preview */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto shrink-0 justify-between sm:justify-center border-t border-border/40 sm:border-none pt-4 sm:pt-0">
                    <button
                      onClick={() => {
                        setViewedDocs(prev => ({ ...prev, [item.id]: true }));
                        navigate(`/admin/user/${item.id}`);
                      }}
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
                          title="Reject & Delete Account"
                        >
                          <XCircle size={14} />
                        </button>
                        <button
                          disabled={!viewedDocs[item.id] && (item.fileUrl || item.cloudinaryUrl)}
                          onClick={() => setApprovalStatus(activeCategory, item.id, 'approved')}
                          className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
                            viewedDocs[item.id] || !(item.fileUrl || item.cloudinaryUrl)
                              ? 'bg-emerald/10 border border-emerald/30 text-emerald hover:bg-emerald/25 cursor-pointer'
                              : 'bg-void border border-border text-muted cursor-not-allowed opacity-40'
                          }`}
                          title={viewedDocs[item.id] || !(item.fileUrl || item.cloudinaryUrl) ? "Approve Account" : "Open document link or Inspect first to approve"}
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
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">
                {activeCategory === 'careers' ? "Career Catalog Guide" : "Verification Guide"}
              </h4>
              
              {activeCategory === 'careers' ? (
                <div className="text-xs text-muted leading-relaxed space-y-3">
                  <p>
                    Adding or updating career pathways configures the core roadmap metadata templates students choose upon registering.
                  </p>
                  <p>
                    Ensure required skills are listed comma-separated to render properly as metadata badges.
                  </p>
                  <p>
                    Each roadmap phase translates to interactive sprint milestones inside the simulated Kanban boards.
                  </p>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Career Editor Dialog Modal overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-void border border-border p-6 rounded-2xl shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal header */}
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-display font-bold text-lg text-text">
                {editingCareerId ? 'Edit Career Pathway' : 'Create New Career Pathway'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-white/5 border border-transparent hover:border-border rounded-lg text-muted hover:text-text transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal body form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">Career Title</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. AI Engineer"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-void/50 text-xs focus:ring-1 focus:ring-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">Category</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Artificial Intelligence"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-void/50 text-xs focus:ring-1 focus:ring-accent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide career timeline scope overview..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-void/50 text-xs focus:ring-1 focus:ring-accent outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">Difficulty Level</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-void/50 text-xs focus:ring-1 focus:ring-accent outline-none cursor-pointer"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">Duration</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. 6 Weeks"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-void/50 text-xs focus:ring-1 focus:ring-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">Industry Demand</label>
                  <select
                    value={formDemand}
                    onChange={(e) => setFormDemand(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-void/50 text-xs focus:ring-1 focus:ring-accent outline-none cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Very High">Very High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">Required Skills (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="E.g. React, Redux, Tailwind, Axios"
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-void/50 text-xs focus:ring-1 focus:ring-accent outline-none"
                />
              </div>

              {/* Roadmap Phase Builder */}
              <div className="space-y-3 border-t border-border/40 pt-4">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted">Roadmap Learning Phases</label>
                  <button
                    type="button"
                    onClick={handleAddPhase}
                    className="px-2.5 py-1 bg-surface-muted/30 border border-border rounded-lg text-[9px] font-semibold hover:bg-white/5 text-accent transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus size={10} />
                    <span>Add Phase</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-48 overflow-y-auto pr-1">
                  {formRoadmap.map((phase, idx) => (
                    <div key={idx} className="p-3 bg-surface-muted/10 border border-border/50 rounded-xl space-y-2 relative">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-accent font-mono">Phase {phase.phase}</span>
                        {formRoadmap.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePhase(idx)}
                            className="text-[9px] text-rose-400 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="Phase Title"
                          value={phase.title}
                          onChange={(e) => handlePhaseChange(idx, 'title', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-border bg-void/50 text-[11px] rounded-lg outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Topics (Comma Separated)"
                          value={phase.topics}
                          onChange={(e) => handlePhaseChange(idx, 'topics', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-border bg-void/50 text-[11px] rounded-lg outline-none"
                        />
                      </div>

                      <input
                        type="text"
                        required
                        placeholder="Phase Description Summary"
                        value={phase.description}
                        onChange={(e) => handlePhaseChange(idx, 'description', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-border bg-void/50 text-[11px] rounded-lg outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal footer controls */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-xl text-xs font-semibold text-muted hover:text-text hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-5 py-2 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg hover:shadow-accent/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingForm ? 'Saving details...' : 'Save Pathway'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
