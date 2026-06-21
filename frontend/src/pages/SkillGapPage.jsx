import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ShieldCheck, Target, ArrowUpRight, Award, Zap } from 'lucide-react'
import axiosInstance from '../api/axios.js'

const defaultSkillData = [
  { subject: 'LangChain Orchestrator', current: 65, benchmark: 85, fullMark: 100 },
  { subject: 'Vector DB Indexes', current: 94, benchmark: 80, fullMark: 100 },
  { subject: 'PyTorch models', current: 50, benchmark: 75, fullMark: 100 },
  { subject: 'REST APIs (FastAPI)', current: 80, benchmark: 85, fullMark: 100 },
  { subject: 'Prometheus metrics', current: 40, benchmark: 70, fullMark: 100 },
  { subject: 'System Architecture', current: 85, benchmark: 80, fullMark: 100 },
]

const defaultGaps = [
  { skill: 'Prometheus metrics', gap: '-30%', recommend: 'Implement the Prometheus metric endpoints task to build latency graphs.', level: 'Beginner' },
  { skill: 'PyTorch models', gap: '-25%', recommend: 'Fine-tune SentenceTransformers embedding networks. Read the custom training guides.', level: 'Intermediate' },
  { skill: 'LangChain Orchestrator', gap: '-20%', recommend: 'Develop streaming tokens route using fallback logic details.', level: 'Advanced' },
]

export default function SkillGapPage() {
  const { isDark } = useTheme()
  const [skillComparisonData, setSkillComparisonData] = useState(defaultSkillData)
  const [gaps, setGaps] = useState(defaultGaps)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSkillAnalysis = async () => {
      try {
        const response = await axiosInstance.get('/api/careers/skill-analysis')
        if (response.data?.success && response.data?.data) {
          if (response.data.data.skillComparisonData?.length > 0) {
            setSkillComparisonData(response.data.data.skillComparisonData)
          }
          setGaps(response.data.data.gaps || [])
        }
      } catch (err) {
        console.error('Failed to load dynamic skill analysis from server:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSkillAnalysis()
  }, [])

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

        {/* Content split */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Radar Chart side */}
          <div className="lg:col-span-6 glass border border-border rounded-2xl p-6 bg-void/25 flex flex-col items-center">
            <span className="text-xs font-bold text-text uppercase tracking-wider block mb-6">Capability Radar Comparison</span>
            <div className="h-[320px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillComparisonData} cx="50%" cy="50%" outerRadius="70%">
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
              </div>
            </div>

            {/* Micro-learning credentials */}
            <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-amber" />
                <h3 className="text-sm font-bold text-text uppercase tracking-wider">Recommended Career Modules</h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-xs text-muted">
                <div className="p-3 bg-surface-muted/30 border border-border rounded-xl flex justify-between items-center group cursor-pointer hover:border-accent/40 transition-colors">
                  <div>
                    <span className="font-semibold text-text block">LLM Observability Masterclass</span>
                    <span className="text-[9px] text-muted block mt-0.5">Estimated: 4 hrs</span>
                  </div>
                  <ArrowUpRight size={14} className="text-muted group-hover:text-accent transition-colors" />
                </div>

                <div className="p-3 bg-surface-muted/30 border border-border rounded-xl flex justify-between items-center group cursor-pointer hover:border-accent/40 transition-colors">
                  <div>
                    <span className="font-semibold text-text block">FastAPI production optimizations</span>
                    <span className="text-[9px] text-muted block mt-0.5">Estimated: 3 hrs</span>
                  </div>
                  <ArrowUpRight size={14} className="text-muted group-hover:text-accent transition-colors" />
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
