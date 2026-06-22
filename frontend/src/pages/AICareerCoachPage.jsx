import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Sparkles, Map, Compass, BookOpen, Award, CheckSquare, MessageSquare } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'
import useAuth from '../hooks/useAuth'
import axiosInstance from '../api/axios.js'

export default function AICareerCoachPage() {
  const { addToast } = useNavigation()
  const { user } = useAuth()
  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Arjun'
  const initials = user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'AK'

  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [roadmap, setRoadmap] = useState([])
  const [projects, setProjects] = useState([])
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await axiosInstance.get('/api/mentor-chat/history')
        if (res.data?.success && Array.isArray(res.data?.data)) {
          const history = res.data.data
          if (history.length === 0) {
            setMessages([
              {
                sender: 'coach',
                text: `Hello ${firstName}! I am Rahul Patel, your AI Lead Mentor. I have analyzed your internship track and current task pipeline. What questions or milestones would you like to discuss today?`,
                time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
              }
            ])
          } else {
            const mapped = history.map(h => ({
              sender: h.role === 'student' ? 'user' : 'coach',
              text: h.message,
              time: new Date(h.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            }))
            setMessages(mapped)
          }
        }
      } catch (err) {
        console.error('Failed to load mentor chat history:', err)
        setMessages([
          {
            sender: 'coach',
            text: `Hello ${firstName}! I am Rahul Patel, your AI Lead Mentor. Let's discuss your internship track.`,
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          }
        ])
      }
    }
    fetchChatHistory()
  }, [firstName])

  useEffect(() => {
    const fetchCareerAndIntelligence = async () => {
      try {
        const careerRes = await axiosInstance.get('/api/careers/my-career')
        let progressPercent = 0
        let learningRoadmap = []
        if (careerRes.data?.success && careerRes.data?.data) {
          progressPercent = careerRes.data.data.progress || 0
          learningRoadmap = careerRes.data.data.career?.learningRoadmap || []
        }

        if (learningRoadmap.length > 0) {
          const steps = learningRoadmap.map((item, idx) => {
            let status = 'Locked'
            if (idx === 0) {
              status = progressPercent >= 30 ? 'Completed' : 'In Progress'
            } else if (idx === 1) {
              status = progressPercent >= 60 ? 'Completed' : (progressPercent >= 30 ? 'In Progress' : 'Locked')
            } else if (idx === 2) {
              status = progressPercent >= 90 ? 'Completed' : (progressPercent >= 60 ? 'In Progress' : 'Locked')
            } else {
              status = progressPercent >= 100 ? 'Completed' : (progressPercent >= 90 ? 'In Progress' : 'Locked')
            }
            return {
              step: String(item.phase || (idx + 1)),
              title: item.title,
              status
            }
          })
          setRoadmap(steps)
        } else {
          setRoadmap([
            { step: '1', title: 'Onboarding and basic project setup tasks', status: progressPercent >= 30 ? 'Completed' : 'In Progress' },
            { step: '2', title: 'Implementation of core functional requirements', status: progressPercent >= 60 ? 'Completed' : (progressPercent >= 30 ? 'In Progress' : 'Locked') },
            { step: '3', title: 'Integration testing and system optimizations', status: progressPercent >= 90 ? 'Completed' : (progressPercent >= 60 ? 'In Progress' : 'Locked') },
            { step: '4', title: 'Final project review and submission audits', status: progressPercent >= 100 ? 'Completed' : (progressPercent >= 90 ? 'In Progress' : 'Locked') }
          ])
        }

        const intelRes = await axiosInstance.get('/api/careers/career-intelligence')
        if (intelRes.data?.success && intelRes.data?.data) {
          const intelProjects = intelRes.data.data.recommendedProjects || []
          if (intelProjects.length > 0) {
            const mappedProj = intelProjects.map(projStr => {
              if (typeof projStr !== 'string') return { name: 'Project Blueprint', desc: String(projStr), tech: '' }
              const colonIdx = projStr.indexOf(':')
              if (colonIdx === -1) {
                return { name: 'Project Blueprint', desc: projStr, tech: '' }
              }
              const name = projStr.substring(0, colonIdx).trim()
              let remainder = projStr.substring(colonIdx + 1).trim()
              
              const techIdx = remainder.toLowerCase().indexOf('tech:')
              if (techIdx === -1) {
                return { name, desc: remainder, tech: '' }
              }
              const desc = remainder.substring(0, techIdx).trim()
              const tech = remainder.substring(techIdx + 5).trim()
              return { name, desc, tech }
            })
            setProjects(mappedProj)
          } else {
            setProjects([
              { name: 'Standard Path Sandbox', desc: 'Complete path-aligned codebase scenarios and verify metrics.', tech: 'GitHub · Vite' }
            ])
          }
        }
      } catch (err) {
        console.error('Failed to load career roadmap and intelligence:', err)
      }
    }
    fetchCareerAndIntelligence()
  }, [])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputText.trim() || isLoading) return

    const userMessageText = inputText.trim()
    const timeString = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const userMsg = { sender: 'user', text: userMessageText, time: timeString }
    
    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setIsLoading(true)

    try {
      const res = await axiosInstance.post('/api/mentor-chat/send', { message: userMessageText })
      if (res.data?.success && res.data?.data) {
        const reply = res.data.data.message || 'Analysis unavailable'
        const coachMsg = {
          sender: 'coach',
          text: reply,
          time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        }
        setMessages(prev => [...prev, coachMsg])
        addToast('New advice from AI Lead Mentor', 'info')
      } else {
        throw new Error('Invalid response payload')
      }
    } catch (err) {
      console.error('Failed to send message to mentor:', err)
      const errorMsg = {
        sender: 'coach',
        text: 'Sorry, I encountered an issue connecting to the AI Mentor. Please try again.',
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      }
      setMessages(prev => [...prev, errorMsg])
      addToast('Mentor connection error', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 space-y-8 relative z-10">
        
        {/* Title */}
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em] block">AI Career Counselor</span>
          <h2 className="font-display font-bold text-3xl mt-1">AI Career Coach</h2>
          <p className="text-xs text-muted mt-1">Simulated chat advisor offering roadmaps and certified recommendations.</p>
        </div>

        {/* Content split */}
        <div className="grid lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Coach Chat side */}
          <div className="lg:col-span-7 glass border border-border rounded-2xl flex flex-col justify-between h-[480px] bg-void/25 overflow-hidden">
            
            {/* Console Header */}
            <div className="px-5 py-4 border-b border-border bg-void/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-accent animate-pulse" />
                <span className="font-semibold text-text">AI Coach Console</span>
              </div>
              <span className="text-dim text-[10px]">v1.4 Advisor</span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-void/10">
              {messages.map((msg, idx) => {
                const isUser = msg.sender === 'user'
                return (
                  <div
                    key={idx}
                    className={`flex gap-3 max-w-[80%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      isUser ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-violet/20 text-violet border border-violet/30'
                    }`}>
                      {isUser ? initials : 'AC'}
                    </div>
                    <div className={`p-3 rounded-2xl text-xs space-y-1 ${
                      isUser ? 'bg-accent text-white rounded-tr-none' : 'bg-surface-muted border border-border text-text rounded-tl-none'
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
                placeholder="Ask about project templates, learning roadmaps, or recruitment matches..."
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

          {/* Coach Recommendations Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Learning Roadmap */}
            <div className="glass border border-border rounded-2xl p-5 bg-void/25 space-y-3">
              <div className="flex items-center gap-2">
                <Map size={14} className="text-accent" />
                <h4 className="text-xs font-bold text-text uppercase tracking-wider">Learning Roadmap</h4>
              </div>

              <div className="space-y-2">
                {roadmap.length === 0 ? (
                  <div className="text-center py-4 text-xs text-muted">Loading learning roadmap...</div>
                ) : (
                  roadmap.map((s) => (
                    <div key={s.step} className="flex gap-3 items-start text-[11px] text-muted">
                      <span className={`h-5 w-5 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0 border ${
                        s.status === 'Completed'
                          ? 'bg-emerald/10 border-emerald/30 text-emerald'
                          : s.status === 'In Progress'
                          ? 'bg-accent/10 border-accent/30 text-accent animate-pulse'
                          : 'bg-void border-border text-dim'
                      }`}>
                        {s.step}
                      </span>
                      <div className="pt-0.5 flex-1 flex justify-between gap-2">
                        <span className={s.status === 'Completed' ? 'line-through text-dim' : 'text-text'}>{s.title}</span>
                        <span className={`text-[8px] font-semibold uppercase ${
                          s.status === 'Completed' ? 'text-emerald' : s.status === 'In Progress' ? 'text-accent' : 'text-dim'
                        }`}>{s.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recommended Projects templates */}
            <div className="glass border border-border rounded-2xl p-5 bg-void/25 space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-violet" />
                <h4 className="text-xs font-bold text-text uppercase tracking-wider">Recommended Project Blueprints</h4>
              </div>

              <div className="space-y-2.5">
                {projects.length === 0 ? (
                  <div className="text-center py-4 text-xs text-muted">Loading recommended projects...</div>
                ) : (
                  projects.map((p) => (
                    <div key={p.name} className="p-3 bg-surface-muted/20 border border-border rounded-xl space-y-1">
                      <span className="text-xs font-bold text-text block">{p.name}</span>
                      <p className="text-[10px] text-muted leading-relaxed">{p.desc}</p>
                      {p.tech && <span className="text-[8px] font-mono text-accent block font-semibold pt-1">{p.tech}</span>}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
