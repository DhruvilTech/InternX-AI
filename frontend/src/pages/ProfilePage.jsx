import { useNavigation } from '../context/NavigationContext'
import { Award, Briefcase, Mail, GraduationCap, Link, Calendar, CheckSquare, Plus } from 'lucide-react'
import { FaGithub } from 'react-icons/fa6'
import useAuth from '../hooks/useAuth'

const projects = [
  { name: 'Semantic Search Engine RAG', desc: 'Custom vector DB index configuration running SentenceTransformers cosine similarity checks.', tech: ['Python', 'Vector DB', 'LangChain', 'FastAPI'], link: 'github.com/arjun/semantic-rag' },
  { name: 'Distributed Session Gateway caching', desc: 'Distributed caching infrastructure exposing redis token denylist rotation rules.', tech: ['Node JS', 'Redis', 'Docker'], link: 'github.com/arjun/session-gateway' }
]

const achievements = [
  { title: 'Top 8% AI Cohort Grade Index', issuer: 'InternX AI Audit Engines' },
  { title: 'Completed RAG Pipeline Integration sprint', issuer: 'NeuralMind Technologies' }
]

export default function ProfilePage() {
  const { internship } = useNavigation()
  const { user } = useAuth()

  const companyInfo = internship || {
    name: 'NeuralMind Technologies',
    roleTitle: 'AI Research Intern'
  }

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U'

  const userSkills = user?.studentProfile?.skills?.length > 0
    ? user.studentProfile.skills
    : ['Vector Databases', 'LangChain', 'PyTorch', 'React JS', 'Node JS', 'FastAPI', 'Redis', 'Docker']

  const timeline = [
    { 
      period: 'June 2026 - Present', 
      role: companyInfo.roleTitle || 'AI Research Intern', 
      organization: `${companyInfo.name} (Simulated)` 
    },
    { 
      period: `Graduation Year: ${user?.studentProfile?.year || '2027'}`, 
      role: user?.studentProfile?.course || 'B.S. Computer Science student', 
      organization: user?.studentProfile?.collegeName || 'Massachusetts Institute of Technology' 
    }
  ]

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background glow layers */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 space-y-8 relative z-10">
        
        {/* Cover profile Banner */}
        <div className="glass border border-border rounded-3xl p-6 sm:p-8 bg-void/30 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent via-indigo-500 to-violet" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            <div className="h-20 w-20 bg-gradient-to-br from-accent to-violet rounded-full flex items-center justify-center text-white text-2xl font-bold font-display shadow-lg shadow-violet/20">
              {initials}
            </div>
            <div className="space-y-1">
              <h2 className="font-display font-bold text-2xl">{user?.fullName || 'Anonymous User'}</h2>
              <p className="text-xs text-muted flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <GraduationCap size={14} className="text-accent" />
                <span>{user?.studentProfile?.course || 'Computer Science student'} at {user?.studentProfile?.collegeName || 'Massachusetts Institute of Technology'}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href={`mailto:${user?.email || 'arjun@university.edu'}`}
              className="p-2 border border-border bg-surface-muted/20 hover:border-border-strong text-muted hover:text-text rounded-xl transition-all"
            >
              <Mail size={14} />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 border border-border bg-surface-muted/20 hover:border-border-strong text-muted hover:text-text rounded-xl transition-all"
            >
              <FaGithub size={14} />
            </a>
          </div>
        </div>

        {/* Dashboard Split */}
        <div className="grid md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Skills and Credentials */}
          <div className="md:col-span-4 space-y-6">
            
            {/* Skill tags */}
            <div className="glass border border-border rounded-2xl p-5 bg-void/25 space-y-3">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">Skills & Tech Stack</h4>
              <div className="flex flex-wrap gap-1.5">
                {userSkills.map((s) => (
                  <span key={s} className="text-[10px] bg-surface-muted/30 border border-border px-2.5 py-1 rounded-lg text-muted font-mono">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Verified achievements list */}
            <div className="glass border border-border rounded-2xl p-5 bg-void/25 space-y-3">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">Verified Credentials</h4>
              <div className="space-y-3">
                {achievements.map((ach) => (
                  <div key={ach.title} className="flex gap-2.5 items-start text-xs text-muted leading-relaxed">
                    <Award size={14} className="text-amber shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-text block">{ach.title}</span>
                      <span className="text-[9px] text-dim">{ach.issuer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Projects & Experience Timeline */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Projects list */}
            <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
              <h3 className="text-sm font-bold text-text uppercase tracking-wider">Project Portfolio</h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {projects.map((proj) => (
                  <div key={proj.name} className="p-4 border border-border rounded-xl bg-void/50 hover:border-accent/40 transition-colors flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-text">{proj.name}</h4>
                      <p className="text-[10px] text-muted leading-relaxed mt-2">{proj.desc}</p>
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {proj.tech.map((t) => (
                          <span key={t} className="text-[8px] bg-surface-muted border border-border px-1.5 py-0.5 rounded text-muted font-mono">
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] text-accent mt-3">
                        <Link size={10} />
                        <span className="font-semibold">{proj.link}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience timeline */}
            <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4 relative">
              <h3 className="text-sm font-bold text-text uppercase tracking-wider">Experience Timeline</h3>
              <div className="absolute top-16 bottom-8 left-10 w-px bg-border" />

              <div className="space-y-6 relative">
                {timeline.map((item, idx) => (
                  <div key={idx} className="flex gap-6 items-start relative z-10">
                    <div className="h-8 w-8 bg-surface-muted border border-border rounded-lg flex items-center justify-center shrink-0 shadow-sm text-dim">
                      <Briefcase size={14} className="text-accent" />
                    </div>
                    <div>
                      <span className="text-[9px] text-dim font-mono">{item.period}</span>
                      <h4 className="text-xs font-bold text-text mt-0.5">{item.role}</h4>
                      <p className="text-[10px] text-muted">{item.organization}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
