import { useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, User, Users, Calendar, Briefcase, Network, Globe, MapPin, Milestone } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'

const defaultCompany = {
  name: 'NeuralMind Technologies',
  manager: 'Sarah Johnson',
  hr: 'Clara Oswald (HR Director)',
  department: 'Artificial Intelligence',
  roleTitle: 'AI Research Intern',
  team: [
    { name: 'Sarah Johnson', role: 'AI Engineering Manager', status: 'Online', code: 'SJ', desk: 'Desk A1' },
    { name: 'Alex Rivera', role: 'Lead ML Engineer', status: 'Online', code: 'AR', desk: 'Desk A2' },
    { name: 'Sophia Patel', role: 'ML Researcher', status: 'In Meeting', code: 'SP', desk: 'Desk A3' },
    { name: 'David Kim', role: 'Data Architect', status: 'Offline', code: 'DK', desk: 'Desk B1' },
  ],
  details: {
    founded: '2023',
    employees: '120',
    stage: 'Series B ($35M)',
    location: 'San Francisco, CA (Remote Hybrid)',
    about: 'NeuralMind Technologies is a pioneer in Generative AI tools and semantic indexing infrastructures. Our flagship developer platform is used by thousands of engineering organizations worldwide to deploy custom RAG pipelines.',
  },
  timeline: [
    { year: '2023', event: 'Founded in SF by Sarah Johnson and David Kim.' },
    { year: '2024', event: 'Seed funding of $4M. Launched Core Embeddings API.' },
    { year: '2025', event: 'Series A funding of $12M. Scaled team to 50 employees.' },
    { year: '2026', event: 'Series B funding of $35M. Integrated with InternX AI workspace.' },
  ]
}

export default function AICompanyPage() {
  const { internship } = useNavigation()
  const [activeTab, setActiveTab] = useState('office') // office, directory, details, timeline
  
  const company = internship ? {
    ...defaultCompany,
    name: internship.name,
    manager: internship.manager,
    department: internship.department,
    roleTitle: internship.roleTitle,
    team: defaultCompany.team.map((m, idx) => {
      if (idx === 0) return { ...m, name: internship.manager, code: internship.manager.split(' ').map(n => n[0]).join('') }
      return m
    })
  } : defaultCompany

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 space-y-8 relative z-10">
        
        {/* Banner Card */}
        <div className="relative glass-bright rounded-3xl overflow-hidden border border-border p-6 sm:p-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-void/50 glow-accent">
          {/* Subtle gradient pattern backdrop */}
          <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-violet/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex items-start gap-4">
            <div className="h-16 w-16 bg-gradient-to-br from-accent to-violet rounded-2xl flex items-center justify-center text-white text-xl font-bold font-display shadow-lg">
              {company.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-display font-bold text-3xl">{company.name}</h2>
              <p className="text-sm text-muted mt-1 flex items-center gap-1.5">
                <Globe size={14} className="text-accent" />
                <span>neuralmind.ai</span>
                <span className="text-border">•</span>
                <MapPin size={14} className="text-muted" />
                <span>{company.details.location}</span>
              </p>
            </div>
          </div>

          <div className="relative z-10 flex gap-2">
            <span className="text-xs bg-surface-muted border border-border px-3 py-1.5 rounded-xl font-semibold text-text">
              Stage: {company.details.stage}
            </span>
            <span className="text-xs bg-surface-muted border border-border px-3 py-1.5 rounded-xl font-semibold text-accent">
              {company.details.employees} Staff
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border gap-6">
          {['office', 'directory', 'details', 'timeline'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs uppercase font-semibold tracking-wider relative transition-colors ${
                activeTab === tab ? 'text-accent' : 'text-muted hover:text-text'
              }`}
            >
              {tab === 'office' ? 'Office Map' : tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                />
              )}
            </button>
          ))}
        </div>

        {/* Dynamic Sub-Views */}
        <div className="min-h-[300px]">
          {activeTab === 'office' && (
            <div className="grid md:grid-cols-12 gap-8 items-start">
              {/* Office Interactive Grid */}
              <div className="md:col-span-8 glass border border-border rounded-2xl p-6 bg-void/25 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-text">Virtual Office Floor Map</h3>
                  <p className="text-[10px] text-muted">Real-time team presence map</p>
                </div>

                <div className="grid grid-cols-4 gap-4 p-4 border border-border bg-void/50 rounded-2xl relative">
                  {/* Grid of desks */}
                  {['Desk A1', 'Desk A2', 'Desk A3', 'Desk A4', 'Desk B1', 'Desk B2', 'Desk B3', 'Desk B4', 'Conference Room', 'Lounge Area', 'HR Bay', 'Coffee Station'].map((slot) => {
                    const occupant = company.team.find(t => t.desk === slot)
                    const isOccupied = !!occupant
                    
                    return (
                      <div
                        key={slot}
                        className={`h-24 rounded-xl border flex flex-col justify-between p-3 transition-all ${
                          isOccupied
                            ? 'bg-violet/10 border-violet text-white shadow-md shadow-violet/5'
                            : 'bg-surface-muted/10 border-border/60 text-dim hover:border-border-bright'
                        }`}
                      >
                        <span className="text-[8px] uppercase tracking-wider text-dim block">{slot}</span>
                        {isOccupied ? (
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-text truncate block">{occupant.name}</span>
                            <span className="flex items-center gap-1 text-[8px] text-emerald font-semibold">
                              <span className="h-1 w-1 bg-emerald rounded-full" />
                              {occupant.role.split(' ').slice(-2).join(' ')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[9px] text-dim font-medium italic">Empty</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Sidebar Quick Details */}
              <div className="md:col-span-4 space-y-6">
                <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
                  <h4 className="text-xs font-bold text-text uppercase tracking-wider">AI Direct Reports</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-surface-muted/20 border border-border rounded-xl">
                      <span className="text-[9px] text-accent uppercase tracking-wider font-semibold">Engineering Manager</span>
                      <p className="text-xs font-bold text-text mt-1">{company.manager}</p>
                      <p className="text-[10px] text-muted">Evaluates code submissions, hosts weekly 1-on-1 feedback.</p>
                    </div>
                    <div className="p-3 bg-surface-muted/20 border border-border rounded-xl">
                      <span className="text-[9px] text-violet uppercase tracking-wider font-semibold">HR Lead Architect</span>
                      <p className="text-xs font-bold text-text mt-1">{company.hr}</p>
                      <p className="text-[10px] text-muted">Checks compliance and triggers recruitment notifications.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'directory' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {company.team.map((member) => (
                <div key={member.name} className="p-5 border border-border rounded-xl bg-void/50 glass hover:border-accent/40 transition-colors space-y-4 text-center">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-br from-accent to-violet rounded-full flex items-center justify-center text-white text-sm font-bold font-display shadow-md shadow-accent/10">
                    {member.code}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text">{member.name}</h4>
                    <p className="text-[10px] text-muted mt-0.5">{member.role}</p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-surface-muted text-[8px] font-semibold uppercase tracking-wider">
                    <span className={`h-1.5 w-1.5 rounded-full ${member.status === 'Online' ? 'bg-emerald' : member.status === 'Offline' ? 'bg-dim' : 'bg-amber'}`} />
                    {member.status}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="glass border border-border rounded-2xl p-6 sm:p-8 bg-void/25 space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-text uppercase tracking-wider">About The Company</h3>
                <p className="text-xs text-muted leading-relaxed max-w-3xl">{company.details.about}</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-border">
                <div>
                  <span className="text-[10px] text-muted uppercase tracking-wider block mb-1 font-semibold">Founded</span>
                  <span className="text-xs text-text font-bold">{company.details.founded}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted uppercase tracking-wider block mb-1 font-semibold">Size</span>
                  <span className="text-xs text-text font-bold">{company.details.employees} employees</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted uppercase tracking-wider block mb-1 font-semibold">Venture Stage</span>
                  <span className="text-xs text-text font-bold">{company.details.stage}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted uppercase tracking-wider block mb-1 font-semibold">Main Office</span>
                  <span className="text-xs text-text font-bold">{company.details.location}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="glass border border-border rounded-2xl p-6 sm:p-8 bg-void/25 relative">
              {/* Vertical line connector */}
              <div className="absolute top-8 bottom-8 left-10 w-0.5 bg-border" />
              
              <div className="space-y-8 relative">
                {company.timeline.map((item, idx) => (
                  <div key={idx} className="flex gap-6 items-start relative z-10">
                    <div className="h-8 w-8 bg-surface-muted border border-border rounded-lg flex items-center justify-center shrink-0 shadow-sm text-[10px] font-bold text-accent">
                      {item.year}
                    </div>
                    <div className="pt-1.5">
                      <p className="text-xs text-text leading-relaxed font-medium">
                        {item.event}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
