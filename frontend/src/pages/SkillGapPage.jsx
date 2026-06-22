import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import useAuth from '../hooks/useAuth.js'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ShieldCheck, Target, ArrowUpRight, Award, Zap, AlertCircle } from 'lucide-react'
import axiosInstance from '../api/axios.js'

const DYNAMIC_SKILL_REGISTRY = {
  'Cyber Security': [
    'Network Security', 'Threat Intelligence', 'Incident Response', 'SIEM', 'Digital Forensics',
    'Vulnerability Assessment', 'Penetration Testing', 'Cloud Security', 'IAM', 'Security Monitoring'
  ],
  'Frontend': [
    'HTML', 'CSS', 'JavaScript', 'React', 'State Management', 'Responsive Design',
    'Performance Optimization', 'Accessibility', 'API Integration', 'Testing'
  ],
  'Data Science': [
    'Python', 'Statistics', 'EDA', 'Machine Learning', 'Feature Engineering',
    'Model Evaluation', 'Data Visualization', 'SQL', 'Deep Learning'
  ]
};

const normalizeCareerPath = (title) => {
  const t = (title || '').toLowerCase();
  if (t.includes('cyber') || t.includes('security') || t.includes('shield')) return 'Cyber Security';
  if (t.includes('front')) return 'Frontend';
  if (t.includes('data science') || t.includes('data scientist') || t.includes('statistic') || t.includes('analytics') || t.includes('ai') || t.includes('machine') || t.includes('ml')) return 'Data Science';
  return 'Cyber Security';
};

const defaultSkillData = []
const defaultGaps = []

export default function SkillGapPage() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [skillComparisonData, setSkillComparisonData] = useState(defaultSkillData)
  const [gaps, setGaps] = useState(defaultGaps)
  const [recommendedModules, setRecommendedModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [evalError, setEvalError] = useState('')

  useEffect(() => {
    if (!user) return
    const fetchSkillAnalysis = async () => {
      try {
        setLoading(true)
        const studentId = user._id || user.id

        // 1. Fetch current selected path
        const careerRes = await axiosInstance.get('/api/careers/my-career')
        const careerTitle = careerRes.data.career?.title || ''
        const normPath = normalizeCareerPath(careerTitle)
        const registrySkills = DYNAMIC_SKILL_REGISTRY[normPath] || []

        // 2. Fetch evaluation report
        let response = await axiosInstance.get(`/api/evaluation/student/${studentId}`)
        let data = response.data

        // 3. Self-Validation
        const allFetchedSkills = [
          ...(data.identifiedSkills || []),
          ...(data.identifiedSkillGaps || []),
          ...(data.skillComparisonData || []).map(s => s.subject)
        ]

        const hasMismatch = allFetchedSkills.some(skill => !registrySkills.includes(skill))

        if (hasMismatch) {
          console.warn(`[Self-Validation] Skill path mismatch detected. Regenerating profile...`)
          response = await axiosInstance.get(`/api/evaluation/student/${studentId}?regenerate=true`)
          data = response.data
        }

        // 4. Update state with dynamic scores
        if (data.skillComparisonData && data.skillComparisonData.length > 0) {
          setSkillComparisonData(data.skillComparisonData)
        } else {
          const radarData = [
            ...(data.identifiedSkills || []).map(s => ({ subject: s, current: 85, benchmark: 80 })),
            ...(data.identifiedSkillGaps || []).map(s => ({ subject: s, current: 45, benchmark: 80 }))
          ]
          setSkillComparisonData(radarData)
        }

        if (data.gaps) {
          setGaps(data.gaps)
        } else {
          const compiledGaps = (data.identifiedSkillGaps || []).map(skillName => {
            let recommend = `Complete more deliverables requiring ${skillName} to close the capability gap.`
            return {
              skill: skillName,
              gap: '35%',
              level: 'Intermediate',
              recommend
            }
          })
          setGaps(compiledGaps)
        }

        const suggestedModules = (data.careerRecommendations || []).map(cert => ({
          title: cert,
          duration: '3 hrs'
        }))
        setRecommendedModules(suggestedModules)
        setEvalError('')
      } catch (err) {
        console.error('Failed to load dynamic skill analysis from server:', err)
        setEvalError('No evaluation available yet.\nStudent has not completed any evaluated submissions.')
      } finally {
        setLoading(false)
      }
    }
    fetchSkillAnalysis()
  }, [user])

  const formattedRadarData = (skillComparisonData || []).slice(0, 8).map(item => ({
    ...item,
    subject: item.subject.length > 18 ? item.subject.substring(0, 15) + '...' : item.subject
  }));

  const gridColor = isDark ? '#1E293B' : '#E2E8F0'
  const tickColor = isDark ? '#94A3B8' : '#64748B'

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 space-y-8 relative z-10">
        
        {/* Title */}
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em] block">Capability Metrics</span>
          <h2 className="font-display font-bold text-3xl mt-1">Skill Gap Analysis</h2>
          <p className="text-xs text-muted mt-1">Compare your current capability score against industry hire benchmarks.</p>
        </div>

        {evalError ? (
          <div className="glass rounded-2xl p-8 border border-border bg-void/30 text-center flex flex-col items-center justify-center space-y-3 py-16">
            <AlertCircle className="text-amber h-8 w-8 animate-pulse" />
            <h3 className="text-sm font-bold text-text">No evaluation available yet</h3>
            <p className="text-xs text-muted whitespace-pre-line leading-relaxed">
              No evaluation available yet.
              Student has not completed any evaluated submissions.
            </p>
          </div>
        ) : (
          /* Content split */
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Radar Chart side */}
            <div className="lg:col-span-6 glass border border-border rounded-2xl p-6 bg-void/25 flex flex-col items-center">
              <span className="text-xs font-bold text-text uppercase tracking-wider block mb-6">Capability Radar Comparison</span>
              <div className="h-[320px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={formattedRadarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke={gridColor} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor, fontSize: 8 }} />
                    <Radar
                      name="Your Score"
                      dataKey="current"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Industry Hire Benchmark"
                      dataKey="benchmark"
                      stroke="#38BDF8"
                      fill="#38BDF8"
                      fillOpacity={0.05}
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                    />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recommendations side */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Gaps List */}
              <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-rose" />
                  <h3 className="text-sm font-bold text-text uppercase tracking-wider">Identified Skill Gaps</h3>
                </div>

                <div className="space-y-3">
                  {gaps.map((g) => (
                    <div key={g.skill} className="p-4 border border-border rounded-xl bg-void/40 hover:border-accent/30 transition-colors space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-text">{g.skill}</span>
                        <span className="font-semibold text-rose-400 bg-rose/10 border border-rose/20 px-2 py-0.5 rounded">
                          Gap: {g.gap}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted leading-relaxed">{g.recommend}</p>
                      <span className="text-[9px] font-mono text-accent uppercase font-bold tracking-wider block mt-1">Level: {g.level}</span>
                    </div>
                  ))}
                  {(!gaps || gaps.length === 0) && (
                    <p className="text-xs text-muted py-4 text-center">No skill gaps identified.</p>
                  )}
                </div>
              </div>

              {/* Micro-learning credentials */}
              <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-amber" />
                  <h3 className="text-sm font-bold text-text uppercase tracking-wider">Recommended Career Modules</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-xs text-muted">
                  {recommendedModules.map((mod, idx) => (
                    <div key={idx} className="p-3 bg-surface-muted/30 border border-border rounded-xl flex justify-between items-center group cursor-pointer hover:border-accent/40 transition-colors">
                      <div>
                        <span className="font-semibold text-text block">{mod.title}</span>
                        <span className="text-[9px] text-muted block mt-0.5">Estimated: {mod.duration}</span>
                      </div>
                      <ArrowUpRight size={14} className="text-muted group-hover:text-accent transition-colors" />
                    </div>
                  ))}
                  {(!recommendedModules || recommendedModules.length === 0) && (
                    <p className="text-xs text-muted py-2 col-span-2 text-center">No cohort-specific learning modules assigned.</p>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  )
}
