import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Star, Briefcase, GraduationCap, ArrowRight, UserCheck, Trash2, Award } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'

const initialCandidates = [
  { id: 'cand-1', name: 'Arjun Kapoor', track: 'AI Engineer', university: 'MIT', score: 92, status: 'Active Internship', skills: ['Vector DBs', 'PyTorch', 'LangChain', 'FastAPI'], views: 24 },
  { id: 'cand-2', name: 'Chloe Vance', track: 'Frontend Engineer', university: 'Stanford', score: 96, status: 'Active Internship', skills: ['React JS', 'Tailwind', 'GSAP', 'Motion'], views: 18 },
  { id: 'cand-3', name: 'Kenji Sato', track: 'Backend Developer', university: 'UC Berkeley', score: 88, status: 'Completed', skills: ['Node JS', 'Redis', 'PostgreSQL', 'Docker'], views: 12 },
  { id: 'cand-4', name: 'Sophia Patel', track: 'Data Scientist', university: 'MIT', score: 94, status: 'Active Internship', skills: ['Python', 'Pandas', 'Scikit-Learn', 'Recharts'], views: 30 }
]

export default function RecruiterDashboardPage() {
  const { navigate, addToast } = useNavigation()
  const [candidates, setCandidates] = useState(initialCandidates)
  const [search, setSearch] = useState('')
  const [trackFilter, setTrackFilter] = useState('All')
  
  // Shortlisted Candidates IDs
  const [shortlistedIds, setShortlistedIds] = useState(['cand-1'])

  const toggleShortlist = (id) => {
    const isShortlisted = shortlistedIds.includes(id)
    if (isShortlisted) {
      setShortlistedIds(prev => prev.filter(cId => cId !== id))
      addToast('Candidate removed from shortlist', 'info')
    } else {
      setShortlistedIds(prev => [...prev, id])
      addToast('Candidate added to shortlist!', 'success')
    }
  }

  const filtered = candidates.filter(cand => {
    const matchesSearch = cand.name.toLowerCase().includes(search.toLowerCase()) || 
                          cand.university.toLowerCase().includes(search.toLowerCase())
    const matchesTrack = trackFilter === 'All' || cand.track.toLowerCase().includes(trackFilter.toLowerCase())
    return matchesSearch && matchesTrack
  })

  const shortlistedList = candidates.filter(c => shortlistedIds.includes(c.id))

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 space-y-8 relative z-10">
        
        {/* Header Widget */}
        <div className="flex justify-between items-center border-b border-border pb-6">
          <div>
            <span className="text-xs font-semibold text-amber-500 uppercase tracking-[0.2em] block">Candidate discovery</span>
            <h2 className="font-display font-bold text-3xl mt-1">Recruiter Dashboard</h2>
            <p className="text-xs text-muted mt-1">Review verified student portfolios and request interviews.</p>
          </div>
        </div>

        {/* Aggregate metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border bg-void/50 glass text-center">
            <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Partner Access</span>
            <span className="text-lg font-bold text-text">Tier-1 Corporate</span>
          </div>
          <div className="p-4 rounded-xl border border-border bg-void/50 glass text-center">
            <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Active Pipeline</span>
            <span className="text-lg font-bold text-text">{candidates.length} profiles</span>
          </div>
          <div className="p-4 rounded-xl border border-border bg-void/50 glass text-center">
            <span className="text-[10px] text-muted uppercase tracking-wider block mb-1">Shortlisted</span>
            <span className="text-lg font-bold text-amber-500">{shortlistedIds.length} shortlisted</span>
          </div>
        </div>

        {/* Dashboard split */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Candidates List */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Search filter row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 border border-border bg-void/50 rounded-xl text-xs flex-1">
                <Search size={13} className="text-muted" />
                <input
                  type="text"
                  placeholder="Search by name, university..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none border-none text-xs w-full"
                />
              </div>

              <div className="flex items-center gap-2 px-3 py-2 border border-border bg-void/50 rounded-xl text-xs">
                <Filter size={13} className="text-muted" />
                <select
                  value={trackFilter}
                  onChange={(e) => setTrackFilter(e.target.value)}
                  className="bg-transparent outline-none border-none text-xs text-muted"
                >
                  <option value="All" className="bg-[#0f1629] text-text">All Tracks</option>
                  <option value="AI" className="bg-[#0f1629] text-text">AI Engineer</option>
                  <option value="Frontend" className="bg-[#0f1629] text-text">Frontend</option>
                  <option value="Backend" className="bg-[#0f1629] text-text">Backend</option>
                  <option value="Data" className="bg-[#0f1629] text-text">Data Science</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="space-y-3.5">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted border border-dashed border-border rounded-2xl">
                  No candidates matching search filters.
                </div>
              ) : (
                filtered.map((cand) => {
                  const active = shortlistedIds.includes(cand.id)
                  return (
                    <div
                      key={cand.id}
                      className="p-5 border border-border rounded-xl bg-void/40 hover:border-accent/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 bg-gradient-to-br from-accent/20 to-violet/20 border border-accent/20 rounded-full flex items-center justify-center text-accent text-xs font-bold font-display">
                          {cand.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-text group-hover:text-accent transition-colors">{cand.name}</h4>
                            <span className="text-[9px] font-semibold text-emerald bg-emerald/10 border border-emerald/20 px-2 py-0.5 rounded-full uppercase">
                              {cand.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted">{cand.track} · {cand.university}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {cand.skills.map((s) => (
                              <span key={s} className="text-[8px] bg-surface-muted border border-border px-1.5 py-0.5 rounded text-muted font-mono">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right button actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-[9px] text-muted uppercase tracking-wider block">Verified Grade</span>
                          <span className="text-sm font-bold text-accent font-display">{cand.score}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleShortlist(cand.id)}
                            className={`p-2 border rounded-lg transition-all ${
                              active
                                ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                                : 'border-border bg-surface-muted/20 text-muted hover:text-text hover:border-border-strong'
                            }`}
                          >
                            <Star size={13} fill={active ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={() => navigate('candidate_profile')}
                            className="p-2 bg-gradient-to-r from-accent to-violet text-white rounded-lg text-xs font-semibold hover:shadow-lg transition-all flex items-center gap-1"
                          >
                            <span>Audit Report</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

          </div>

          {/* Right Column: Shortlisted drawers list */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass border border-border rounded-2xl p-5 bg-void/25 space-y-4">
              <div className="flex items-center gap-2">
                <Star size={14} className="text-amber-500" />
                <h4 className="text-xs font-bold text-text uppercase tracking-wider">Shortlisted Talent</h4>
              </div>

              <div className="space-y-3.5">
                {shortlistedList.length === 0 ? (
                  <div className="text-center py-8 text-[10px] text-muted italic border border-dashed border-border rounded-xl">
                    No candidates shortlisted. Click star icons to shortlist.
                  </div>
                ) : (
                  shortlistedList.map((cand) => (
                    <div
                      key={cand.id}
                      className="p-3 bg-surface-muted/20 border border-border rounded-xl flex items-center justify-between text-xs hover:border-accent/40 transition-colors"
                    >
                      <div>
                        <span className="font-bold text-text block">{cand.name}</span>
                        <span className="text-[9px] text-muted block mt-0.5">{cand.track} · {cand.university}</span>
                      </div>
                      <button
                        onClick={() => toggleShortlist(cand.id)}
                        className="text-muted hover:text-rose p-1 hover:bg-white/5 rounded transition-colors"
                        title="Remove shortlist"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
