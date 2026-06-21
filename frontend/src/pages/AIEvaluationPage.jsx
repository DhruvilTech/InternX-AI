import { useTheme } from '../context/ThemeContext'
import { useNavigation } from '../context/NavigationContext'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'
import { Award, AlertTriangle, ShieldCheck, HelpCircle, Code, ArrowRight, ArrowLeft } from 'lucide-react'
import ScoreRing from '../components/ui/ScoreRing'

const defaultReport = {
  overallScore: 92,
  metrics: [
    { name: 'Code Quality', score: 94, reason: 'Follows consistent naming conventions and has zero syntax check warnings.' },
    { name: 'Architecture', score: 88, reason: 'Clean layer division with dedicated router and service layers.' },
    { name: 'Security', score: 91, reason: 'Implements JWT verification and token validations on access routes.' },
    { name: 'Performance', score: 85, reason: 'API response times remain within the expected 200ms bounds.' },
    { name: 'Documentation', score: 96, reason: 'Provides a detailed README with installation steps and API endpoints guide.' }

  ],
  feedback: 'The submission meets all core functional requirements. The semantic index optimization logic uses advanced cosine models that optimize index matching. The latency graphs show stable scaling profiles under load.',
  suggestions: [
    'Add comprehensive error catching block inside query parameters sanitizers.',
    'Export Prometheus telemetry metrics routes.',
    'Expand setup documentation guides.'
  ]
}

export default function AIEvaluationPage() {
  const { isDark } = useTheme()
  const { evaluationReport, navigate } = useNavigation()

  const report = evaluationReport || defaultReport

  const radarData = report.metrics.map(m => ({
    subject: m.name,
    score: m.score,
    fullMark: 100
  }))

  const gridColor = isDark ? '#1E293B' : '#E2E8F0'
  const tickColor = isDark ? '#94A3B8' : '#64748B'

  const barColors = ['#8B5CF6', '#6366F1', '#38BDF8', '#10B981', '#F59E0B']

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background glow layers */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 space-y-6 relative z-10">
        
        {/* Back button */}
        <button
          onClick={() => navigate('task_details')}
          className="inline-flex items-center gap-2 text-xs text-muted hover:text-text transition-colors cursor-pointer mb-2"
        >
          <ArrowLeft size={14} />
          <span>Back to Task Details</span>
        </button>

        {/* Title */}
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em] block">Evaluation Audit</span>
          <h2 className="font-display font-bold text-3xl mt-1">AI Automated Evaluation Report</h2>
          <p className="text-xs text-muted mt-1">Multi-dimensional codebase metrics audit.</p>
        </div>

        {/* Content grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column - Radar & Score Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass border border-border rounded-2xl p-6 bg-void/25 text-center flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-4">Overall Score</span>
              <ScoreRing score={report.overallScore} size={130} strokeWidth={6} />
              <span className="text-[10px] text-emerald font-semibold mt-4 bg-emerald/10 border border-emerald/20 px-2 py-0.5 rounded-full">
                Audit Pass (Top 8%)
              </span>
            </div>

            {/* Metrics Checklist */}
            <div className="glass border border-border rounded-2xl p-5 bg-void/25 space-y-4">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">Metrics Breakdown</h4>
              <div className="space-y-4">
                {report.metrics.map((m, idx) => (
                  <div key={m.name} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: barColors[idx] }} />
                        <span className="text-text font-semibold">{m.name}</span>
                      </div>
                      <span className="font-bold text-accent">{m.score}/100</span>
                    </div>
                    {m.reason && (
                      <p className="text-[10px] text-muted pl-4 italic leading-relaxed">
                        Evidence: {m.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column - Recharts Radar Chart & Logs */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Radar Chart */}
              <div className="glass border border-border rounded-2xl p-6 bg-void/25 flex flex-col items-center">
                <span className="text-xs font-bold text-text uppercase tracking-wider block mb-4">Performance Radar</span>
                <div className="h-56 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid stroke={gridColor} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor, fontSize: 9 }} />
                      <Radar
                        name="Audit Score"
                        dataKey="score"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={isDark ? 0.2 : 0.1}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart list */}
              <div className="glass border border-border rounded-2xl p-6 bg-void/25 flex flex-col items-center">
                <span className="text-xs font-bold text-text uppercase tracking-wider block mb-4">Dimensions Scale</span>
                <div className="h-56 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={report.metrics} layout="vertical" margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: tickColor, fontSize: 8 }} stroke="rgba(255,255,255,0.05)" />
                      <YAxis type="category" dataKey="name" tick={{ fill: tickColor, fontSize: 8 }} width={70} stroke="rgba(255,255,255,0.05)" />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.08)',
                          backgroundColor: isDark ? '#050816' : '#ffffff',
                          color: isDark ? '#f1f5f9' : '#0f172a',
                          fontSize: '11px',
                        }}
                      />
                      <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={12}>
                        {report.metrics.map((_, index) => (
                          <Cell key={index} fill={barColors[index]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Audit Logs and Comments */}
            <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
              <div className="flex items-center gap-2">
                <Code size={16} className="text-accent" />
                <h3 className="text-sm font-bold text-text uppercase tracking-wider">Audit Logs & Summary Feedback</h3>
              </div>

              <div className="p-4 rounded-xl border border-border bg-void/50 text-xs text-muted leading-relaxed space-y-2">
                <p className="font-semibold text-text">Code Analysis Summary:</p>
                <p>{report.feedback}</p>
              </div>

              <div className="space-y-2.5">
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Key Recommendations for Optimization:</span>
                <div className="space-y-2">
                  {report.suggestions.map((s, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start text-xs text-muted">
                      <span className="h-5 w-5 rounded-md bg-violet/10 border border-violet/20 flex items-center justify-center text-[10px] font-bold text-violet shrink-0">
                        {idx + 1}
                      </span>
                      <p className="pt-0.5 leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 mt-6 border-t border-border">
                <button
                  onClick={() => navigate('feedback_center')}
                  className="px-5 py-2.5 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span>Enter Manager Feedback Center</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
