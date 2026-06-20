import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Plus, 
  Sparkles, 
  Award, 
  Activity, 
  TrendingUp, 
  Clock, 
  ChevronRight, 
  HelpCircle, 
  BrainCircuit, 
  Sliders, 
  X,
  MessageSquare,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext.jsx';
import { getStudentInterviews, startInterview } from '../api/interviewApi.js';
import useAuth from '../hooks/useAuth.js';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CAREER_TRACKS = [
  'AI Engineer',
  'Full Stack Developer',
  'Frontend Engineer',
  'Backend Developer',
  'Data Scientist',
  'DevOps Engineer',
  'UI/UX Designer',
  'Cybersecurity Specialist',
  'Mobile App Developer',
  'Product Manager'
];

export default function InterviewDashboardPage() {
  const navigate = useNavigate();
  const { addToast } = useNavigation();
  const { user } = useAuth();
  
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // New session config state
  const [selectedTrack, setSelectedTrack] = useState('');
  const [interviewType, setInterviewType] = useState('mixed');
  const [difficulty, setDifficulty] = useState('medium');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchInterviews();
    if (user?.selectedCareer) {
      setSelectedTrack(user.selectedCareer);
    } else {
      setSelectedTrack(CAREER_TRACKS[0]);
    }
  }, [user]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await getStudentInterviews();
      if (res.success) {
        setInterviews(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch interviews:', err);
      addToast('Failed to load interview history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!selectedTrack) {
      addToast('Please select a career track.', 'error');
      return;
    }
    
    try {
      setStarting(true);
      addToast('Initializing AI Interviewer & generating questions...', 'info');
      const res = await startInterview({
        careerPath: selectedTrack,
        interviewType,
        difficulty
      });
      
      if (res.success && res.data?.interviewId) {
        addToast('Interview started! Welcome, applicant.', 'success');
        navigate(`/interview/live/${res.data.interviewId}`);
      }
    } catch (err) {
      console.error('Failed to start interview:', err);
      addToast(err.response?.data?.message || 'Error generating questions. Please try again.', 'error');
    } finally {
      setStarting(false);
    }
  };

  // Compute metrics
  const completedInterviews = interviews.filter(i => i.status === 'completed' && i.report);
  const avgOverallScore = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((acc, curr) => acc + curr.report.overallScore, 0) / completedInterviews.length)
    : 0;

  const avgTechnical = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((acc, curr) => acc + curr.report.technicalScore, 0) / completedInterviews.length)
    : 0;

  const avgCommunication = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((acc, curr) => acc + curr.report.communicationScore, 0) / completedInterviews.length)
    : 0;

  const avgProfessionalism = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((acc, curr) => acc + (curr.report.professionalismScore || curr.report.confidenceScore || 0), 0) / completedInterviews.length)
    : 0;

  const avgProblemSolving = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((acc, curr) => acc + curr.report.problemSolvingScore, 0) / completedInterviews.length)
    : 0;

  // Prepare chart data (reverse chronological to display chronologically)
  const chartData = [...completedInterviews]
    .reverse()
    .map((item, idx) => ({
      name: `Sess ${idx + 1}`,
      score: item.report.overallScore,
      technical: item.report.technicalScore,
      communication: item.report.communicationScore
    }));

  const getReadinessBadge = (score) => {
    if (score >= 85) return { text: 'Job Ready', style: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' };
    if (score >= 60) return { text: 'Intermediate', style: 'bg-accent/10 text-accent border border-accent/30' };
    return { text: 'Beginner', style: 'bg-amber-500/10 text-amber-400 border border-amber-500/30' };
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Visual background layers */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em] block">Preparation Hub</span>
            <h1 className="font-display font-extrabold text-4xl mt-1 tracking-tight">AI Mock Interviews</h1>
            <p className="text-sm text-muted mt-2 max-w-xl">
              Conduct high-fidelity voice mock interviews. Grade technical mastery, soft skills, and confidence dynamically in real-time.
            </p>
          </div>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-accent to-violet text-white font-semibold text-sm rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Launch New Session</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-accent animate-spin" />
              <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-violet animate-spin-reverse" />
            </div>
          </div>
        ) : (
          <>
            {/* Analytics Dashboard Grid */}
            <div className="grid lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Overall metric card */}
              <div className="lg:col-span-4 glass border border-border/80 rounded-2xl p-6 bg-void/25 flex flex-col justify-between space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Average Performance</h3>
                    <p className="text-xs text-dim mt-1">Aggregated scoring across all sessions</p>
                  </div>
                  <div className="p-3 bg-accent/15 border border-accent/20 rounded-xl text-accent">
                    <Award size={20} />
                  </div>
                </div>

                <div className="text-center py-4">
                  <span className="text-6xl font-display font-black text-gradient-violet">
                    {avgOverallScore || '--'}
                  </span>
                  <span className="text-sm text-muted block mt-1">Out of 100 overall score</span>
                </div>

                <div className="space-y-4 pt-4 border-t border-border/65 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-medium">
                      <span className="text-muted">Technical Skill</span>
                      <span className="text-text">{avgTechnical}%</span>
                    </div>
                    <div className="h-2 w-full bg-void border border-border rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${avgTechnical}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between font-medium">
                      <span className="text-muted">Communication</span>
                      <span className="text-text">{avgCommunication}%</span>
                    </div>
                    <div className="h-2 w-full bg-void border border-border rounded-full overflow-hidden">
                      <div className="h-full bg-violet" style={{ width: `${avgCommunication}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between font-medium">
                      <span className="text-muted">Professionalism</span>
                      <span className="text-text">{avgProfessionalism}%</span>
                    </div>
                    <div className="h-2 w-full bg-void border border-border rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400" style={{ width: `${avgProfessionalism}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between font-medium">
                      <span className="text-muted">Problem Solving</span>
                      <span className="text-text">{avgProblemSolving}%</span>
                    </div>
                    <div className="h-2 w-full bg-void border border-border rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${avgProblemSolving}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress trend line chart */}
              <div className="lg:col-span-8 glass border border-border/80 rounded-2xl p-6 bg-void/25 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Performance Trends</h3>
                    <p className="text-xs text-dim mt-1">Score progress tracking across your interview sequence</p>
                  </div>
                  <div className="p-3 bg-violet/15 border border-violet/20 rounded-xl text-violet">
                    <TrendingUp size={20} />
                  </div>
                </div>

                <div className="h-[240px] w-full bg-void/45 rounded-xl border border-border/60 p-4">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} />
                        <YAxis stroke="#6b7280" fontSize={10} domain={[0, 100]} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#090a0f', borderColor: '#1f2937', borderRadius: '12px' }}
                          labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="score" stroke="var(--accent)" fillOpacity={1} fill="url(#scoreColor)" strokeWidth={2.5} name="Overall Score" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-xs text-muted space-y-2">
                      <Activity size={24} className="text-dim" />
                      <p>Complete at least one mock session to trace performance trends.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Past Logs List */}
            <div className="glass border border-border/80 rounded-2xl p-6 bg-void/25 space-y-6">
              <div>
                <h3 className="text-base font-bold text-text">Session Records</h3>
                <p className="text-xs text-muted mt-1">All generated interviews, completion markers, and analytical scorecards.</p>
              </div>

              {interviews.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/65 text-xs text-muted">
                        <th className="py-3 px-4">Career Track</th>
                        <th className="py-3 px-4">Focus Module</th>
                        <th className="py-3 px-4">Level</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Score</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-xs">
                      {interviews.map((session) => {
                        const readiness = session.report ? getReadinessBadge(session.report.overallScore) : null;
                        return (
                          <tr key={session._id} className="hover:bg-surface-muted/10 transition-colors group">
                            <td className="py-4 px-4 font-semibold text-text">{session.careerPath}</td>
                            <td className="py-4 px-4 capitalize">{session.interviewType}</td>
                            <td className="py-4 px-4 capitalize">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                session.difficulty === 'hard' ? 'bg-rose/10 text-rose' :
                                session.difficulty === 'medium' ? 'bg-accent/10 text-accent' :
                                'bg-emerald-500/10 text-emerald-400'
                              }`}>
                                {session.difficulty}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-muted">
                              {new Date(session.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center gap-1.5 ${
                                session.status === 'completed' ? 'text-emerald-400' : 'text-amber-400 animate-pulse'
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${
                                  session.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400'
                                }`} />
                                <span className="capitalize">{session.status}</span>
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              {session.report ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span className="font-bold text-accent">{session.report.overallScore}/100</span>
                                  <span className={`text-[9px] px-1.5 rounded ${readiness?.style}`}>
                                    {readiness?.text}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-dim">--</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right">
                              {session.status === 'completed' ? (
                                <button
                                  onClick={() => navigate(`/interview/report/${session._id}`)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface-muted/30 hover:bg-accent/15 border border-border hover:border-accent/40 rounded-lg text-[11px] text-text hover:text-accent font-medium transition-all cursor-pointer"
                                >
                                  <span>View Report</span>
                                  <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => navigate(`/interview/live/${session._id}`)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent/20 hover:bg-accent border border-accent/30 hover:border-accent text-[11px] text-accent hover:text-white font-medium rounded-lg transition-all cursor-pointer"
                                >
                                  <Play size={10} fill="currentColor" />
                                  <span>Resume</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 space-y-4 border border-dashed border-border/60 rounded-xl bg-void/5">
                  <div className="p-4 bg-surface-muted border border-border rounded-full inline-block text-dim">
                    <BrainCircuit size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">No interviews created yet</p>
                    <p className="text-xs text-muted mt-1">Configure and launch your first AI mock interview session above.</p>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-accent hover:bg-accent/10 rounded-lg text-xs text-accent transition-colors cursor-pointer font-semibold"
                  >
                    <Plus size={14} />
                    <span>Launch First Session</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}

      </div>

      {/* Configuration Drawer Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-void border-l border-border/80 z-50 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="text-accent" size={20} />
                    <h3 className="font-display font-bold text-lg">New Mock Interview</h3>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1 text-muted hover:text-text rounded-lg hover:bg-surface-muted/30 transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Form fields */}
                <form onSubmit={handleStartSession} className="space-y-6">
                  
                  {/* Career track Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider block">Career Track / Domain</label>
                    <select
                      value={selectedTrack}
                      onChange={(e) => setSelectedTrack(e.target.value)}
                      className="w-full bg-void/50 border border-border focus:border-accent text-xs rounded-xl py-3 px-4 outline-none text-text"
                    >
                      {CAREER_TRACKS.map(track => (
                        <option key={track} value={track} className="bg-void text-text">{track}</option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider block">Difficulty Tier</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['easy', 'medium', 'hard'].map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setDifficulty(level)}
                          className={`py-2 px-3 border capitalize text-xs font-medium rounded-xl transition-all cursor-pointer ${
                            difficulty === level
                              ? 'bg-accent/15 border-accent text-accent shadow-md shadow-accent/10'
                              : 'bg-void border-border text-muted hover:text-text hover:bg-surface-muted/20'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interview Type Focus */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider block">Focus Target</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'mixed', label: 'Mixed Suite', desc: 'Tech + Soft Skills' },
                        { id: 'technical', label: 'Technical Only', desc: 'Coding & Systems' },
                        { id: 'behavioral', label: 'Behavioral', desc: 'Situation Handling' },
                        { id: 'hr', label: 'HR & Culture', desc: 'Fitment Audit' }
                      ].map(type => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setInterviewType(type.id)}
                          className={`p-3 border text-left rounded-xl transition-all flex flex-col justify-between h-[76px] cursor-pointer ${
                            interviewType === type.id
                              ? 'bg-accent/15 border-accent text-accent shadow-md shadow-accent/10'
                              : 'bg-void border-border text-muted hover:text-text hover:bg-surface-muted/20'
                          }`}
                        >
                          <span className="text-xs font-semibold text-text capitalize">{type.label}</span>
                          <span className="text-[9px] text-muted block mt-0.5 leading-tight">{type.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Disclaimer / Warning */}
                  <div className="p-3 bg-surface-muted/20 border border-border rounded-xl text-[10px] text-muted leading-relaxed flex gap-2">
                    <Sliders size={18} className="text-accent shrink-0 mt-0.5" />
                    <span>
                      The system prepares 10 tailored mock questions. We recommend enabling microphone access for live voice response metrics.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={starting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-accent to-violet text-white font-semibold text-xs rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer mt-4"
                  >
                    {starting ? (
                      <>
                        <div className="h-4.5 w-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                        <span>Creating AI Session...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>Start Mock Interview</span>
                      </>
                    )}
                  </button>

                </form>
              </div>

              <div className="pt-6 border-t border-border/40 text-[10px] text-center text-muted">
                InternX AI Internship Simulator System v2.0
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
