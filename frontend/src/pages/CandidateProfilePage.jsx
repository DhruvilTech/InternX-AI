import { useTheme } from '../context/ThemeContext'
import { useNavigation } from '../context/NavigationContext'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import { Award, Briefcase, FileCheck, ShieldAlert, ArrowLeft, ArrowUpRight } from 'lucide-react'

const radarData = [
  { subject: 'Code Quality', score: 94, fullMark: 100 },
  { subject: 'Architecture', score: 88, fullMark: 100 },
  { subject: 'Security', score: 91, fullMark: 100 },
  { subject: 'Performance', score: 85, fullMark: 100 },
  { subject: 'Documentation', score: 96, fullMark: 100 },
]

export default function CandidateProfilePage() {
  const { isDark } = useTheme()
  const { navigate, addToast } = useNavigation()

  const gridColor = isDark ? '#1E293B' : '#E2E8F0'
  const tickColor = isDark ? '#94A3B8' : '#64748B'

  const handleRequestInterview = () => {
    addToast('Interview request sent to Arjun Kapoor!', 'success')
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 space-y-8 relative z-10">
        
        {/* Back button */}
        <button
          onClick={() => navigate('recruiter_dashboard')}
          className="inline-flex items-center gap-2 text-xs text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Discovery Directory</span>
        </button>

        {/* Banner Card */}
        <div className="relative glass border border-border rounded-3xl overflow-hidden p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-void/30">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gradient-to-br from-accent to-violet rounded-full flex items-center justify-center text-white text-xl font-bold font-display shadow-lg">
              AK
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl">Arjun Kapoor</h2>
              <p className="text-xs text-muted mt-1">AI Engineer Track · Massachusetts Institute of Technology</p>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-2 rounded bg-emerald/10 border border-emerald/20 text-[8px] font-semibold text-emerald uppercase tracking-wider">
                Verifications audit: PASSED
              </span>
            </div>
          </div>

          <button
            onClick={handleRequestInterview}
            className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Request Technical Interview
          </button>
        </div>

        {/* Dashboard Split */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Audit Metrics (Radar & Stats) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Audit metrics row */}
            <div className="grid sm:grid-cols-2 gap-6">
              
              {/* Radar Chart */}
              <div className="glass border border-border rounded-2xl p-6 bg-void/25 flex flex-col items-center">
                <span className="text-xs font-bold text-text uppercase tracking-wider block mb-4">Audit Radar Rating</span>
                <div className="h-52 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid stroke={gridColor} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor, fontSize: 8 }} />
                      <Radar
                        name="Arjun Score"
                        dataKey="score"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Verified score checklist details */}
              <div className="glass border border-border rounded-2xl p-5 bg-void/25 space-y-4">
                <h4 className="text-xs font-bold text-text uppercase tracking-wider">Scorecard Audit Logs</h4>
                
                <div className="space-y-3.5 text-xs text-muted">
                  <div>
                    <div className="flex justify-between font-semibold">
                      <span>Code Cleanliness</span>
                      <span className="text-text">94/100</span>
                    </div>
                    <p className="text-[9px] text-dim mt-0.5">Complies with PEP8. Low cyclomatic complexity metrics.</p>
                  </div>
                  <div>
                    <div className="flex justify-between font-semibold">
                      <span>Vector DB architectures</span>
                      <span className="text-text">88/100</span>
                    </div>
                    <p className="text-[9px] text-dim mt-0.5">Optimized index models, cosine distance formulas.</p>
                  </div>
                  <div>
                    <div className="flex justify-between font-semibold">
                      <span>Security & Sanitizers</span>
                      <span className="text-text">91/100</span>
                    </div>
                    <p className="text-[9px] text-dim mt-0.5">Zero SQL injection, parameters sanitization verified.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Simulated Project Audits */}
            <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
              <h3 className="text-sm font-bold text-text uppercase tracking-wider">Simulated Workspace Projects</h3>
              
              <div className="p-4 rounded-xl border border-border bg-void/40 hover:border-accent/40 transition-colors space-y-3">
                <div className="flex justify-between items-start text-xs">
                  <div>
                    <h4 className="font-bold text-text">Resume Intelligence Platform</h4>
                    <span className="text-[9px] text-muted block mt-0.5">Host: NeuralMind Technologies · Week 3 sprint</span>
                  </div>
                  <span className="text-emerald font-bold font-mono">Score: 92%</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  "Implemented RAG routing queries. Designed cosine indexes configurations inside Vector DB tables. Latency results remained stable at 150ms under heavy stress validation models."
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['LangChain', 'FastAPI', 'Redis', 'PyTorch'].map((s) => (
                    <span key={s} className="text-[8px] bg-surface-muted border border-border px-1.5 py-0.5 rounded text-muted font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Experience and Cert verifications */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Certificate and verifications badge */}
            <div className="glass border border-border rounded-2xl p-5 bg-void/25 space-y-4">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">Host Certifications</h4>
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <Award size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-text block">AI Engineering Certificate</span>
                    <span className="text-[8px] text-muted block mt-0.5">ID: IX-92-2026 · Verified Record</span>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-muted" />
              </div>
            </div>

            {/* University performance logs */}
            <div className="glass border border-border rounded-2xl p-5 bg-void/25 space-y-4">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">Academic Record</h4>
              <div className="space-y-3.5 text-xs text-muted">
                <div className="flex justify-between items-center">
                  <span>University GPA</span>
                  <span className="font-bold text-text">3.88 / 4.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Major Courses index</span>
                  <span className="font-bold text-text">Data Architectures (A), ML (A)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Graduation Target</span>
                  <span className="font-bold text-text">June 2027</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
