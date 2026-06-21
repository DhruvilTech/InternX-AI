import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, User, MessageSquare, Briefcase, Award, ShieldAlert, Sparkles, Building2 } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'
import PulseDot from '../components/ui/PulseDot'
import useAuth from '../hooks/useAuth'
import axiosInstance from '../api/axios.js'

export default function FeedbackCenterPage() {
  const { internship, addToast } = useNavigation()
  const { user } = useAuth()
  const [activeChannel, setActiveChannel] = useState('technical') // technical, manager, career
  const [feedbacks, setFeedbacks] = useState([])
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true)
  const [evalError, setEvalError] = useState('')

  useEffect(() => {
    if (!user?._id && !user?.id) return;
    const fetchFeedbacks = async () => {
      try {
        setLoadingFeedbacks(true)
        const studentId = user._id || user.id
        const res = await axiosInstance.get(`/api/evaluation/student/${studentId}`)
        const data = res.data
        if (data) {
          const fb = {
            _id: data.submissionId || 'latest',
            taskId: {
              title: 'Unified Milestone Evaluation',
              score: data.overallScore
            },
            mentorFeedback: 'Evaluation score dynamically calculated by the AI compliance engine.',
            strengths: data.strengths || [],
            weaknesses: data.weaknesses || [],
            recommendations: data.recommendations || []
          }
          setFeedbacks([fb])
          setEvalError('')
        }
      } catch (err) {
        console.error('Failed to load student feedbacks:', err)
        setFeedbacks([])
        setEvalError('No evaluation available yet.\nStudent has not completed any evaluated submissions.')
      } finally {
        setLoadingFeedbacks(false)
      }
    }
    fetchFeedbacks()
  }, [user])

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Arjun'
  const initials = user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'AK'

  const [chats, setChats] = useState({
    technical: [],
    manager: [],
    career: []
  })
  const [initialized, setInitialized] = useState(false)
  const [inputText, setInputText] = useState('')
  const chatEndRef = useRef(null)

  const companyInfo = internship || {
    name: 'NeuralMind Technologies',
    manager: 'Sarah Johnson',
    roleTitle: 'AI Research Intern'
  }

  const managerFirstName = companyInfo.manager
    ? companyInfo.manager.split(' ')[0]
    : 'Sarah'

  const managerInitials = companyInfo.manager
    ? companyInfo.manager.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'SJ'


  useEffect(() => {
    if (initialized || !user) return

    const fName = user.fullName ? user.fullName.split(' ')[0] : 'Student'
    const roleTitle = companyInfo.roleTitle || 'Intern'
    const companyName = companyInfo.name || 'InternX AI'
    const track = user.track || 'ai'

    let techMsg = `Hi ${fName}! I reviewed your codebase and architecture guidelines. Keep up the high standards for testing and compliance.`
    if (track === 'ai') {
      techMsg = `Hi ${fName}! I reviewed your semantic search design and model evaluations. Keep optimizing the retrieval parameters for the pipeline.`
    } else if (track === 'frontend') {
      techMsg = `Hi ${fName}! I reviewed your responsive grid layouts and design system. Focus on CSS performance and responsiveness across devices.`
    } else if (track === 'backend') {
      techMsg = `Hi ${fName}! I reviewed your database configuration and endpoint routing. Let's make sure our indexes and cache invalidation strategies are solid.`
    } else if (track === 'cyber') {
      techMsg = `Hi ${fName}! I reviewed your gateway audit and static scanner rules. Keep focus on credentials safety and token flow verification.`
    } else if (track === 'data') {
      techMsg = `Hi ${fName}! I reviewed your data pipeline and ETL configurations. Let's make sure the streaming jobs handle backpressure correctly.`
    }

    setChats({
      technical: [
        { sender: 'manager', text: techMsg, time: '10:30 AM' }
      ],
      manager: [
        { sender: 'manager', text: `Welcome to the team! During your internship as a ${roleTitle} at ${companyName}, we focus on high compliance and production-ready deliveries. I will assign sprint tasks weekly. Let me know if you need any guidelines.`, time: 'Yesterday' }
      ],
      career: [
        { sender: 'manager', text: `Hey ${fName}, I'm auditing your placement readiness metrics. We will synchronize your portfolio and mock interview scores for hiring managers once you submit the deliverables.`, time: '3 days ago' }
      ]
    })
    setInitialized(true)
  }, [user, internship, initialized, companyInfo])



  // Scroll to bottom on chats update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chats, activeChannel])

  const handleSend = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const timeString = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const userMsg = { sender: 'user', text: inputText, time: timeString }

    // Add user message
    setChats(prev => ({
      ...prev,
      [activeChannel]: [...prev[activeChannel], userMsg]
    }))

    setInputText('')

    // Simulate AI Manager Typing and response
    setTimeout(() => {
      let managerReply = 'That is an excellent point. I suggest we run a quick bench check on the staging environment to audit the latency curves.'
      if (activeChannel === 'career') {
        managerReply = 'I highly recommend exporting your certificate to LinkedIn. Recruiters check these verified scores frequently!'
      } else if (activeChannel === 'manager') {
        managerReply = 'Understood. Let\'s review our progress in our next weekly feedback check-in.'
      }

      const managerMsg = { sender: 'manager', text: managerReply, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }
      setChats(prev => ({
        ...prev,
        [activeChannel]: [...prev[activeChannel], managerMsg]
      }))
      addToast(`New message from ${companyInfo.manager}`, 'info')
    }, 1500)
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 space-y-8 relative z-10">

        {/* Title */}
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em] block">Auditing Center</span>
          <h2 className="font-display font-bold text-3xl mt-1">Manager Feedback Center</h2>
          <p className="text-xs text-muted mt-1">Review feedback and chat with your AI Lead Manager.</p>
        </div>

        {/* Dashboard split */}
        <div className="grid md:grid-cols-12 gap-6 items-stretch">

          {/* Channels Sidebar List */}
          <div className="md:col-span-4 space-y-3">
            <div className="glass border border-border rounded-2xl p-4 bg-void/25 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-accent to-violet rounded-full flex items-center justify-center text-white text-xs font-bold font-display shrink-0">
                  {companyInfo.manager.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text">{companyInfo.manager}</h4>
                  <span className="text-[9px] text-muted flex items-center gap-1.5 mt-0.5">
                    <PulseDot color="emerald" size={5} /> Lead AI Manager
                  </span>
                </div>
              </div>
            </div>

            <div className="glass border border-border rounded-2xl p-2.5 bg-void/25 space-y-1">
              {[
                { id: 'technical', label: 'Technical Audits', desc: 'Code architecture advice', icon: MessageSquare },
                { id: 'manager', label: 'Manager Updates', desc: 'Sprints and requirements guidance', icon: Building2 },
                { id: 'career', label: 'Career Alignment', desc: 'CV alignment and placements', icon: Briefcase }
              ].map((channel) => {
                const Icon = channel.icon
                const active = activeChannel === channel.id
                return (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannel(channel.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${active
                        ? 'bg-gradient-to-r from-accent/20 to-violet/20 border border-accent/40 text-white font-semibold'
                        : 'border border-transparent text-muted hover:text-text hover:bg-surface-muted/10'
                      }`}
                  >
                    <Icon size={14} className={active ? 'text-accent' : 'text-muted'} />
                    <div>
                      <span className="text-xs block">{channel.label}</span>
                      <span className="text-[9px] text-dim font-normal block mt-0.5">{channel.desc}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Chat Console Area */}
          <div className="md:col-span-8 glass border border-border rounded-2xl flex flex-col justify-between h-[450px] bg-void/25 overflow-hidden">

            {/* Console Header */}
            <div className="px-5 py-4 border-b border-border bg-void/50 flex items-center justify-between text-xs">
              <span className="font-semibold text-text">#{activeChannel.toUpperCase()}_FEEDBACK</span>
              <span className="text-dim text-[10px]">Secure LLM Session</span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-void/10">
              {chats[activeChannel].map((msg, idx) => {
                const isUser = msg.sender === 'user'
                return (
                  <div
                    key={idx}
                    className={`flex gap-3 max-w-[80%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    {/* Avatar icon */}
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${isUser ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-violet/20 text-violet border border-violet/30'
                      }`}>
                      {isUser ? initials : managerInitials}
                    </div>
                    {/* Message Bubble */}
                    <div className={`p-3 rounded-2xl text-xs space-y-1 ${isUser ? 'bg-accent text-white rounded-tr-none' : 'bg-surface-muted border border-border text-text rounded-tl-none'
                      }`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      <span className={`text-[8px] block text-right ${isUser ? 'text-white/60' : 'text-muted'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form console */}
            <form onSubmit={handleSend} className="p-3 border-t border-border bg-void/50 flex gap-2">
              <input
                type="text"
                placeholder={`Ask ${managerFirstName} about your evaluation scorecard or architectural recommendations...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full bg-void/50 border border-border focus:border-accent text-xs rounded-xl py-2 px-3 outline-none text-text"
              />
              <button
                type="submit"
                className="h-9 w-9 bg-gradient-to-r from-accent to-violet text-white rounded-xl flex items-center justify-center hover:shadow-md shrink-0 cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>

          </div>

        </div>

        {/* Milestone Evaluations & AI Feedback */}
        <div className="space-y-6 pt-6 border-t border-border/40">
          <div>
            <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em] block">Diagnostic Scorecards</span>
            <h3 className="font-display font-bold text-2xl mt-1 text-text">Milestone Evaluation Reports</h3>
            <p className="text-xs text-muted mt-1">Detailed strengths, weaknesses, and mentor feedback for your task submissions.</p>
          </div>

          {loadingFeedbacks ? (
            <div className="glass border border-border rounded-2xl p-8 text-center text-xs text-muted">
              Loading evaluation reports...
            </div>
          ) : evalError ? (
            <div className="glass border border-border rounded-2xl p-8 text-center text-xs text-muted bg-void/20">
              <AlertCircle className="mx-auto text-amber h-6 w-6 mb-2" />
              <p className="whitespace-pre-line leading-relaxed">
                No evaluation available yet.
                Student has not completed any evaluated submissions.
              </p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="glass border border-border rounded-2xl p-8 text-center text-xs text-muted bg-void/20">
              No milestone feedback reports found. Submit a task sprint deliverable to trigger evaluation.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {feedbacks.map((fb) => (
                <div key={fb._id} className="glass border border-border rounded-2xl p-5 bg-void/35 space-y-4 hover:border-accent/40 transition-colors flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-accent font-semibold">Milestone Task</span>
                        <h4 className="text-sm font-bold text-text">{fb.taskId?.title || 'Task Deliverable'}</h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald/10 border border-emerald/20 text-emerald text-[10px] font-bold">
                        Score: {fb.taskId?.score || 'N/A'}
                      </span>
                    </div>

                    <div className="p-3 bg-surface-muted/30 border border-border rounded-xl text-xs text-muted leading-relaxed italic">
                      "{fb.mentorFeedback}"
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-emerald uppercase tracking-wider block">Strengths</span>
                        <ul className="space-y-1 text-muted">
                          {fb.strengths?.slice(0, 3).map((st, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald shrink-0" />
                              <span className="truncate">{st}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-rose uppercase tracking-wider block">Weaknesses</span>
                        <ul className="space-y-1 text-muted">
                          {fb.weaknesses?.slice(0, 3).map((wk, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose shrink-0" />
                              <span className="truncate">{wk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border/60 pt-3 mt-2">
                    <span className="text-[9px] font-bold text-accent uppercase tracking-wider block mb-1">Actionable Recommendations</span>
                    <div className="space-y-1">
                      {fb.recommendations?.slice(0, 2).map((rec, i) => (
                        <p key={i} className="text-[10px] text-muted flex items-start gap-1">
                          <span className="text-accent font-semibold">•</span>
                          <span>{rec}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
