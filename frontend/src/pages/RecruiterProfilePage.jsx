import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, User, Building, Globe, Layers, Settings, Save, Loader2 } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { fetchRecruiterProfile, updateRecruiterProfile } from '../store/slices/recruiterSlice.js';

export default function RecruiterProfilePage() {
  const { navigate, addToast } = useNavigation();
  const dispatch = useDispatch();

  const { profile, loading } = useSelector((state) => state.recruiter);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [website, setWebsite] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchRecruiterProfile());
  }, [dispatch]);

  // Sync profile details with form states
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setEmail(profile.email || '');
      
      const recProfile = profile.recruiterProfile || {};
      setCompanyName(recProfile.companyName || '');
      setIndustry(recProfile.industry || '');
      setCompanySize(recProfile.companySize || '');
      setWebsite(recProfile.website || '');
    }
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!fullName || !companyName || !industry || !companySize) {
      addToast('Please fill out all required fields.', 'error');
      return;
    }

    setSaveLoading(true);
    try {
      await dispatch(
        updateRecruiterProfile({
          fullName,
          email,
          companyName,
          industry,
          companySize,
          website,
        })
      ).unwrap();
      addToast('Corporate profile updated successfully!', 'success');
    } catch (err) {
      addToast(err || 'Failed to save profile changes.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-text">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted font-semibold tracking-widest uppercase">Fetching corporate profile...</p>
        </div>
      </div>
    );
  }

  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]).join('')
    : 'IX';

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 space-y-6 relative z-10">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <button
            onClick={() => navigate('recruiter/dashboard')}
            className="inline-flex items-center gap-2 text-xs text-muted hover:text-text hover:bg-white/5 px-3 py-1.5 rounded-xl border border-border transition-colors cursor-pointer"
          >
            <ArrowLeft size={12} />
            <span>Dashboard</span>
          </button>
          <span className="text-[10px] font-mono bg-white/5 border border-border px-3 py-1 rounded-full text-muted uppercase">
            Corporate Profile Settings
          </span>
        </div>

        {/* Profile Card Header */}
        <div className="glass border border-border rounded-3xl p-6 sm:p-8 bg-void/35 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-indigo-500 to-violet" />
          
          <div className="h-16 w-16 bg-gradient-to-br from-accent to-violet rounded-2xl flex items-center justify-center text-white text-xl font-bold font-display shadow-lg shadow-accent/10 border border-white/10 shrink-0">
            {initials}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="font-display font-bold text-xl text-text">{fullName || 'Recruiter'}</h2>
            <p className="text-xs text-muted">Corporate Recruiter at <strong className="text-text/90">{companyName || 'Corporate Partner'}</strong></p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-2 rounded bg-emerald/10 border border-emerald/20 text-[9px] font-semibold text-emerald uppercase tracking-wider">
              Corporate Account Approved
            </span>
          </div>
        </div>

        {/* Profile Details Form */}
        <form onSubmit={handleSave} className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-6">
          <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
            <Settings size={15} className="text-accent" />
            <h3 className="text-xs font-bold text-text uppercase tracking-wider">Company Profile Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Full Name</label>
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                <User size={14} className="text-muted" />
                <input
                  type="text"
                  required
                  placeholder="Sarah Johnson"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-transparent text-xs text-text outline-none border-none"
                />
              </div>
            </div>

            {/* Corporate Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Corporate Email Address</label>
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/30 text-muted cursor-not-allowed">
                <User size={14} className="text-muted" />
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full bg-transparent text-xs outline-none border-none cursor-not-allowed text-muted"
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Company Name</label>
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                <Building size={14} className="text-muted" />
                <input
                  type="text"
                  required
                  placeholder="NeuralMind Technologies"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-transparent text-xs text-text outline-none border-none"
                />
              </div>
            </div>

            {/* Corporate Website */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Corporate Website</label>
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                <Globe size={14} className="text-muted" />
                <input
                  type="text"
                  placeholder="https://neuralmind.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-transparent text-xs text-text outline-none border-none"
                />
              </div>
            </div>

            {/* Industry Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Industry Domain</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2.5 border border-border bg-[#0a0f1d] rounded-xl text-xs text-text outline-none focus:border-accent"
              >
                <option value="Technology">Technology & Software</option>
                <option value="Finance">Fintech & Finance</option>
                <option value="Healthcare">Healthcare & BioTech</option>
                <option value="Education">EdTech & Education</option>
                <option value="Consulting">Consulting & Corporate</option>
              </select>
            </div>

            {/* Company Size Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Company Size</label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full px-3 py-2.5 border border-border bg-[#0a0f1d] rounded-xl text-xs text-text outline-none focus:border-accent"
              >
                <option value="1-10">1 - 10 Employees</option>
                <option value="11-50">11 - 50 Employees</option>
                <option value="51-200">51 - 200 Employees</option>
                <option value="201-500">201 - 500 Employees</option>
                <option value="500+">500+ Employees</option>
              </select>
            </div>

          </div>

          <div className="flex justify-end gap-2 border-t border-border/40 pt-4">
            <button
              type="submit"
              disabled={saveLoading}
              className="px-5 py-2.5 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saveLoading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              <span>Save Profile Configuration</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
