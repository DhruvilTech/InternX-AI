import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import {
  Building2,
  Clock,
  AlertCircle,
  Eye,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Award,
  Loader2
} from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'
import { useTheme } from '../context/ThemeContext'
import ScoreRing from '../components/ui/ScoreRing'
import PulseDot from '../components/ui/PulseDot'
import { FaGithub } from 'react-icons/fa6'
import { fetchStudentDashboard } from '../store/slices/studentDashboardSlice.js'
import useAuth from '../hooks/useAuth'
import AnimatedCounter from '../components/ui/AnimatedCounter'

const chartData = [
  { day: 'Mon', views: 4 },
  { day: 'Tue', views: 8 },
  { day: 'Wed', views: 6 },
  { day: 'Thu', views: 12 },
  { day: 'Fri', views: 10 },
  { day: 'Sat', views: 18 },
  { day: 'Sun', views: 22 },
]

export default function StudentDashboardPage() {
  const dispatch = useDispatch()
  const { navigate, setSelectedTaskId, addToast } = useNavigation()
  const { isDark } = useTheme()
  const { user } = useAuth()
  
  const { data, loading } = useSelector((state) => state.studentDashboard)

  useEffect(() => {
    dispatch(fetchStudentDashboard())
  }, [dispatch])

  // Extract consolidated data
  const studentCareer = data?.studentCareer
  const internship = data?.internship
  const tasks = data?.tasks || []
  const connectedRepo = data?.connectedRepo
  const careerIntel = data?.evaluationReport

  const careerData = studentCareer?.careerId

  // Memoize task metric computations to prevent unneeded rerenders
  const progress = useMemo(() => {
    if (!tasks || tasks.length === 0) return 0
    const completed = tasks.filter(t => t.status === 'completed')
    return Math.round((completed.length / tasks.length) * 100)
  }, [tasks])

  const score = useMemo(() => {
    if (!tasks || tasks.length === 0) return 0
    const completed = tasks.filter(t => t.status === 'completed')
    const completedWithScores = completed.filter(t => typeof t.score === 'number' && t.score > 0)
    return completedWithScores.length > 0
      ? Math.round(completedWithScores.reduce((acc, t) => acc + t.score, 0) / completedWithScores.length)
      : 0
  }, [tasks])

  const interviewReadyScore = useMemo(() => {
    if (!tasks || tasks.length === 0) return 0
    const completed = tasks.filter(t => t.status === 'completed')
    return Math.round((completed.length / tasks.length) * 80 + 20)
  }, [tasks])

  const portfolioScore = careerIntel?.technicalScore || 0
  const placementScore = careerIntel?.overallScore || 0

  const activeTasks = useMemo(() => tasks.filter(t => t.status !== 'completed'), [tasks])

  // Fallback demo info or mapped db values
  const companyInfo = {
    name: internship?.companyName || 'NeuralMind Technologies',
    manager: internship?.managerName || 'Sarah Johnson',
    department: internship?.department || 'Artificial Intelligence',
    project: internship?.projectName || 'Resume Intelligence Platform',
    roleTitle: internship?.internshipRole || 'AI Research Intern',
    team: ['Alex Rivera', 'Sophia Patel', 'David Kim']
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 text-accent animate-spin" />
          <p className="text-xs text-muted font-semibold tracking-wider uppercase">Loading Student Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-void relative overflow-hidden">
      {/* Glow overlays */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* Company Header Widget */}
        <div className="glass-bright rounded-2xl p-6 border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 glow-accent bg-void/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-gradient-to-br from-accent to-violet rounded-xl flex items-center justify-center text-white text-base font-bold font-display shadow-md shadow-accent/15">
              {companyInfo.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-text">{companyInfo.name}</h2>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald/10 border border-emerald/20 text-[9px] text-emerald font-semibold uppercase tracking-wider">
                  <PulseDot color="emerald" size={5} /> Active Internship
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                {careerData ? careerData.title : companyInfo.roleTitle} · {careerData ? careerData.category : companyInfo.department}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate('company')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-xl text-xs text-muted hover:text-text hover:border-border-strong transition-all bg-surface-muted/10 font-semibold cursor-pointer"
            >
              <Building2 size={13} className="text-accent" />
              <span>AI Company Hub</span>
            </button>
            <button
              onClick={() => navigate('kanban')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-accent to-violet text-white rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-accent/25 transition-all cursor-pointer"
            >
              <span>Work Sprint Board</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-12 gap-6">

          {/* LEFT COLUMN: Progress & Tasks & Skill Growth */}
          <div className="col-span-12 lg:col-span-8 space-y-6">

            {!careerIntel && !loading ? (
              <div className="glass rounded-2xl p-8 border border-border bg-void/30 text-center flex flex-col items-center justify-center space-y-3 py-16">
                <AlertCircle className="text-amber h-8 w-8" />
                <h3 className="text-sm font-bold text-text">No evaluation available yet</h3>
                <p className="text-xs text-muted whitespace-pre-line leading-relaxed">
                  No evaluation available yet.
                  Student has not completed any evaluated submissions.
                </p>
              </div>
            ) : (
              <>
                {/* Career Intelligence & Diagnostics */}
                <div className="glass rounded-2xl p-6 border border-border bg-void/30 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-text">Career Intelligence & Diagnostics</h3>
                      <p className="text-[10px] text-muted">Placement readiness metrics, advice, and paths</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => navigate('skill_gap')} className="text-xs text-accent hover:underline flex items-center gap-1 font-semibold cursor-pointer">
                        Skill Gap Analysis <ArrowRight size={12} />
                      </button>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${careerIntel?.readinessLevel === 'Industry Ready'
                          ? 'bg-emerald/10 border-emerald/20 text-emerald'
                          : careerIntel?.readinessLevel === 'Job Ready'
                            ? 'bg-sky/10 border-sky/20 text-sky'
                            : careerIntel?.readinessLevel === 'Intermediate'
                              ? 'bg-violet/10 border-violet/20 text-violet'
                              : 'bg-amber/10 border-amber/20 text-amber'
                        }`}>
                        {careerIntel?.readinessLevel || 'Beginner'}
                      </span>
                    </div>
                  </div>

                  {/* Career Suggestions / Recommendations */}
                  <div className="p-4 rounded-xl border border-border bg-accent/5 flex items-start gap-3">
                    <Sparkles size={16} className="text-accent mt-0.5 shrink-0" />
                    <div className="w-full">
                      <h4 className="text-xs font-bold text-text mb-1">Feedback & Recommendations</h4>
                      <div className="space-y-1 text-xs text-muted leading-relaxed">
                        {careerIntel?.recommendations && careerIntel.recommendations.map((rec, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-accent font-bold">•</span>
                            <span>{rec}</span>
                          </div>
                        ))}
                        {(!careerIntel?.recommendations || careerIntel.recommendations.length === 0) && (
                          <p>No recommendations generated yet.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Roles & Certs Grid */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Career Suggestions / Certifications</span>
                      <div className="space-y-1.5">
                        {careerIntel?.careerRecommendations?.map((cert, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-muted">
                            <Award size={12} className="text-violet shrink-0" />
                            <span className="truncate">{cert}</span>
                          </div>
                        )) || <span className="text-xs text-dim">None recommended</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Feedback Widget */}
                <div className="glass rounded-2xl p-6 border border-border bg-void/30 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-text">Feedback Engine Audits</h3>
                      <p className="text-[10px] text-muted">Evaluation strengths and weaknesses</p>
                    </div>
                    <button onClick={() => navigate('feedback_center')} className="text-xs text-accent hover:underline flex items-center gap-1 cursor-pointer">
                      Feedback Center <ArrowRight size={12} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-border bg-emerald/5 space-y-2">
                      <span className="text-[10px] font-bold text-emerald uppercase block">Demonstrated Strengths</span>
                      <ul className="text-xs text-muted space-y-1 list-disc pl-4">
                        {careerIntel?.strengths && careerIntel.strengths.map((str, idx) => (
                          <li key={idx}>{str}</li>
                        ))}
                        {(!careerIntel?.strengths || careerIntel.strengths.length === 0) && (
                          <li className="list-none pl-0 italic text-[10px]">No strengths compiled yet</li>
                        )}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-rose/5 space-y-2">
                      <span className="text-[10px] font-bold text-rose uppercase block">Identified Weaknesses</span>
                      <ul className="text-xs text-muted space-y-1 list-disc pl-4">
                        {careerIntel?.weaknesses && careerIntel.weaknesses.map((weak, idx) => (
                          <li key={idx}>{weak}</li>
                        ))}
                        {(!careerIntel?.weaknesses || careerIntel.weaknesses.length === 0) && (
                          <li className="list-none pl-0 italic text-[10px]">No weaknesses compiled yet</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Current Tasks Widget */}
            <div className="glass rounded-2xl p-6 border border-border bg-void/30 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-text">Current Sprint Backlog</h3>
                  <p className="text-[10px] text-muted">{activeTasks.length} tasks remaining</p>
                </div>
                <button onClick={() => navigate('kanban')} className="text-xs text-accent hover:underline flex items-center gap-1 cursor-pointer">
                  View Kanban <ArrowRight size={12} />
                </button>
              </div>

              <div className="space-y-2.5">
                {activeTasks.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted">
                    No active tasks in current backlog. Good job!
                  </div>
                ) : (
                  activeTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTaskId(t.id)
                        navigate('task_details')
                      }}
                      className="p-4 rounded-xl border border-border bg-void/50 hover:border-accent/40 cursor-pointer flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-surface-muted border border-border text-muted shrink-0">
                          <Clock size={14} className="text-accent" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-text group-hover:text-accent transition-colors">{t.title}</h4>
                          <span className="text-[9px] text-dim font-mono">{t.category} · Deadline: {t.deadline}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-semibold text-amber bg-amber/10 border border-amber/20 px-2.5 py-0.5 rounded-full uppercase">
                        {t.status.replace(/[_-]/g, ' ')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Internship Progress Widget */}
            <div className="glass rounded-2xl p-6 border border-border bg-void/30">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-bold text-text">Internship Progress</h3>
                  <p className="text-[10px] text-muted">Weekly deliverables timeline</p>
                </div>
                <span className="text-sm font-semibold text-accent"><AnimatedCounter value={progress} />% Complete</span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden border border-border mb-6">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-gradient-to-r from-accent to-violet"
                />
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-surface-muted/20 border border-border/60 rounded-xl">
                  <span className="text-[9px] uppercase tracking-wider text-muted block mb-1">Week 1-2</span>
                  <span className="text-xs font-semibold text-text">Onboarding & Setup</span>
                  <span className="text-[9px] font-semibold text-emerald bg-emerald/10 border border-emerald/20 px-2 py-0.5 rounded-full mt-2 inline-block">Complete</span>
                </div>
                <div className="p-3 bg-surface-muted/20 border border-border/60 rounded-xl">
                  <span className="text-[9px] uppercase tracking-wider text-muted block mb-1">Week 3-4</span>
                  <span className="text-xs font-semibold text-text">Core Tasks Sprint</span>
                  <span className="text-[9px] font-semibold text-amber bg-amber/10 border border-amber/20 px-2 py-0.5 rounded-full mt-2 inline-block">Active Sprint</span>
                </div>
                <div className="p-3 bg-surface-muted/20 border border-border/60 rounded-xl opacity-50">
                  <span className="text-[9px] uppercase tracking-wider text-muted block mb-1">Week 5-6</span>
                  <span className="text-xs font-semibold text-text">Final Review & Cert</span>
                  <span className="text-[9px] font-semibold text-dim bg-void border border-border px-2 py-0.5 rounded-full mt-2 inline-block">Locked</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Scores & Analytics Charts */}
          <div className="col-span-12 lg:col-span-4 space-y-6">

            {/* Circular Scores Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-4 border border-border bg-void/30 text-center flex flex-col items-center">
                <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block mb-3">Portfolio Score</span>
                <ScoreRing score={portfolioScore} size={85} strokeWidth={5} />
                <span className="text-[9px] text-emerald font-semibold mt-2 block">
                  {portfolioScore >= 80 ? 'Top 10% Cohort' : 'Building Track'}
                </span>
              </div>

              <div className="glass rounded-2xl p-4 border border-border bg-void/30 text-center flex flex-col items-center">
                <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block mb-3">Placement Ready</span>
                <ScoreRing score={placementScore} size={85} strokeWidth={5} />
                <span className="text-[9px] text-accent font-semibold mt-2 block">
                  {placementScore >= 80 ? 'Placement Eligible' : 'Practice Needed'}
                </span>
              </div>
            </div>

            {/* GitHub Performance Card */}
            <div className="glass rounded-2xl p-5 border border-border bg-void/30 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-text uppercase tracking-wider">GitHub Performance</h3>
                  <p className="text-[10px] text-muted">Core integration analytics</p>
                </div>
                <div className="p-2 bg-violet/10 rounded-lg text-violet">
                  <FaGithub size={16} />
                </div>
              </div>

              {connectedRepo ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl border border-border bg-void/40 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted uppercase tracking-wider">Linked Repository</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald/10 border border-emerald/20 text-[9px] text-emerald font-semibold">
                        Active
                      </span>
                    </div>
                    <div className="text-xs font-mono font-bold text-text truncate">
                      {connectedRepo.repositoryName}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted">
                      <span>Branch: <span className="font-semibold text-text">{connectedRepo.branch || 'main'}</span></span>
                      {connectedRepo.htmlUrl && (
                        <a 
                          href={connectedRepo.htmlUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-accent hover:underline flex items-center gap-0.5"
                        >
                          View Repo
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-violet/5 border border-violet/10 p-3 rounded-xl">
                    <div className="shrink-0 flex items-center justify-center">
                      <ScoreRing score={careerIntel?.githubScore || 0} size={65} strokeWidth={4.5} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-muted uppercase tracking-wider block">AI GitHub Score</span>
                      <span className="text-sm font-display font-bold text-text block mt-0.5">
                        <AnimatedCounter value={careerIntel?.githubScore || 0} /> / 100
                      </span>
                      <span className="text-[9px] text-muted leading-relaxed block mt-1">
                        {(careerIntel?.githubScore || 0) >= 80 ? 'Exceptional codebase standards.' : (careerIntel?.githubScore || 0) >= 60 ? 'Standard delivery quality.' : 'Improve repo activity & documentation.'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 px-4 space-y-3">
                  <p className="text-xs text-muted">
                    No active GitHub repository linked to your internship.
                  </p>
                  <button
                    onClick={() => navigate('github')}
                    className="w-full py-2 bg-gradient-to-r from-accent to-violet text-white text-[11px] font-semibold rounded-xl hover:shadow-lg transition-all cursor-pointer"
                  >
                    Connect GitHub Repository
                  </button>
                </div>
              )}
            </div>

            {/* Recruiter Interest Trends Widget */}
            <div className="glass rounded-2xl p-5 border border-border bg-void/30 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-text uppercase tracking-wider">Recruiter Discovery</h3>
                  <p className="text-[10px] text-muted">Weekly profile views index</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald font-semibold">
                  <TrendingUp size={14} />
                  <span>+18%</span>
                </div>
              </div>

              {/* Chart container */}
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ left: -30, right: 5, top: 5, bottom: 5 }}>
                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 9 }} stroke="rgba(255,255,255,0.05)" />
                    <YAxis tick={{ fill: '#64748b', fontSize: 9 }} stroke="rgba(255,255,255,0.05)" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        backgroundColor: isDark ? '#050816' : '#ffffff',
                        color: isDark ? '#f1f5f9' : '#0f172a',
                        fontSize: '11px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      fill="rgba(56, 189, 248, 0.15)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted border-t border-border pt-3">
                <div className="flex items-center gap-1.5">
                  <Eye size={12} className="text-accent" />
                  <span>24 views this week</span>
                </div>
                <button onClick={() => navigate('profile')} className="hover:text-text font-semibold flex items-center gap-1 cursor-pointer">
                  View Profile <ArrowRight size={10} />
                </button>
              </div>
            </div>

            {/* Upcoming Deadlines Widget */}
            <div className="glass rounded-2xl p-5 border border-border bg-void/30 space-y-3">
              <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Upcoming Sprints</span>

              <div className="space-y-2">
                <div className="p-3 bg-rose/5 border border-rose/15 rounded-xl flex items-center gap-3">
                  <AlertCircle size={14} className="text-rose shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-bold text-text truncate">Implement RAG Search Route</h4>
                    <span className="text-[9px] text-rose-300 font-semibold block mt-0.5">Due in 3 hours</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTaskId('ai-3')
                      navigate('submit_task')
                    }}
                    className="px-2.5 py-1 bg-rose/10 border border-rose/30 text-rose-300 rounded-lg text-[9px] font-semibold hover:bg-rose/20 transition-colors cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
