import { motion } from 'framer-motion'
import { Cpu, Code2, Server, Database, Palette, ShieldAlert, ArrowRight, Star } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'
import TiltCard from '../components/ui/TiltCard'

const tracks = [
  {
    id: 'ai',
    title: 'AI Engineer',
    icon: Cpu,
    desc: 'Deploy vector indices, fine-tune neural nets, and implement modern RAG routing architectures.',
    skills: ['LangChain', 'Vector DBs', 'PyTorch', 'REST APIs'],
    difficulty: 'Hard',
    color: 'from-violet to-indigo',
    glow: 'rgba(139, 92, 246, 0.15)',
  },
  {
    id: 'frontend',
    title: 'Frontend Developer',
    icon: Code2,
    desc: 'Craft smooth high-fidelity user experiences with advanced motion triggers and glassmorphic designs.',
    skills: ['React JS', 'Tailwind', 'GSAP', 'Framer Motion'],
    difficulty: 'Medium',
    color: 'from-accent to-indigo',
    glow: 'rgba(56, 189, 248, 0.15)',
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    icon: Server,
    desc: 'Optimize database index pipelines, scale caching models, and design bulletproof token rotation loops.',
    skills: ['Node JS', 'Redis', 'PostgreSQL', 'Docker'],
    difficulty: 'Hard',
    color: 'from-indigo to-blue-600',
    glow: 'rgba(99, 102, 241, 0.15)',
  },
  {
    id: 'data',
    title: 'Data Scientist',
    icon: Database,
    desc: 'Build real-time fraud prediction models and deploy aggregate cohort datasets.',
    skills: ['Python', 'Pandas', 'Scikit-Learn', 'Recharts'],
    difficulty: 'Hard',
    color: 'from-emerald-500 to-cyan-500',
    glow: 'rgba(52, 211, 153, 0.15)',
  },
  {
    id: 'uiux',
    title: 'UI UX Designer',
    icon: Palette,
    desc: 'Design design systems and build user journey wires for enterprise workspaces.',
    skills: ['Figma', 'Prototyping', 'Design Tokens', 'Design Research'],
    difficulty: 'Medium',
    color: 'from-rose-500 to-violet',
    glow: 'rgba(251, 113, 133, 0.15)',
  },
  {
    id: 'cyber',
    title: 'Cybersecurity Analyst',
    icon: ShieldAlert,
    desc: 'Examine networks for zero-trust compliance and draft red team emulation flows.',
    skills: ['Pen Testing', 'Wireshark', 'IAM policies', 'OSINT'],
    difficulty: 'Hard',
    color: 'from-amber-500 to-rose-500',
    glow: 'rgba(251, 191, 36, 0.15)',
  },
]

export default function CareerSelectionPage() {
  const { navigate, selectTrackAndCreateInternship, addToast } = useNavigation()

  const handleSelect = (trackId) => {
    selectTrackAndCreateInternship(trackId)
    addToast(`Selected track: ${trackId.toUpperCase()}`, 'info')
    navigate('generator')
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 bg-void relative overflow-hidden">
      {/* Background spotlights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Title */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em] block">Select Track</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold">Choose your path.</h2>
          <p className="text-sm text-muted">
            Select a pathway to generate a simulated AI company, dedicated manager, and live sprint board based on current industry standards.
          </p>
        </div>

        {/* Grid of Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map((track, i) => {
            const TrackIcon = track.icon
            return (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
              >
                <TiltCard
                  intensity={10}
                  className="h-full cursor-pointer group"
                >
                  <div
                    onClick={() => handleSelect(track.id)}
                    className="h-full flex flex-col justify-between p-6 rounded-2xl glass border border-border hover:border-border-bright transition-all duration-300 relative overflow-hidden bg-void/50"
                    style={{
                      boxShadow: `0 0 40px ${track.glow}`,
                    }}
                  >
                    {/* Hover highlight background */}
                    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${track.color} opacity-0 group-hover:opacity-10 blur-xl transition-opacity`} />

                    <div>
                      {/* Top Bar inside card */}
                      <div className="flex justify-between items-center mb-6">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${track.color} text-white shadow-lg`}>
                          <TrackIcon size={18} />
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider text-muted">
                          <Star size={10} className="text-amber" />
                          {track.difficulty}
                        </span>
                      </div>

                      {/* Info */}
                      <h3 className="font-display text-xl font-bold text-text mb-2 group-hover:text-accent transition-colors">
                        {track.title}
                      </h3>
                      <p className="text-xs text-muted leading-relaxed mb-6">
                        {track.desc}
                      </p>
                    </div>

                    {/* Skill Badges & CTA */}
                    <div>
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {track.skills.map((s) => (
                          <span key={s} className="text-[9px] bg-surface-muted border border-border px-2 py-0.5 rounded text-muted font-mono">
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs font-semibold text-text border-t border-border pt-4 mt-auto">
                        <span className="text-muted group-hover:text-text transition-colors">Select Track</span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-muted group-hover:bg-accent group-hover:text-white transition-all">
                          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>

                  </div>
                </TiltCard>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
