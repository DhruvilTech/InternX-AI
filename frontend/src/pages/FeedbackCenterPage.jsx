import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, User, MessageSquare, Briefcase, Award, ShieldAlert, Sparkles, Building2 } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'
import PulseDot from '../components/ui/PulseDot'
import useAuth from '../hooks/useAuth'

export default function FeedbackCenterPage() {
  const { internship, addToast } = useNavigation()
  const { user } = useAuth()
  const [activeChannel, setActiveChannel] = useState('technical') // technical, manager, career
  
  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Arjun'
  const initials = user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'AK'

  const [chats, setChats] = useState(() => {
    const fName = user?.fullName ? user.fullName.split(' ')[0] : 'Arjun'
    return {
      technical: [
        { sender: 'manager', text: `Hi ${fName}! I reviewed your vector DB schema design deliverable. The indexes are setup nicely, but I noticed you are using standard filters on queries. Have you considered dynamic partitioning?`, time: '10:30 AM' },
        { sender: 'user', text: 'Yes! I was wondering if dynamic indexes would affect our search query latency parameters?', time: '10:32 AM' },
        { sender: 'manager', text: 'If configured correctly with index pre-warming, it actually cuts down latency by 15%. I suggest referencing the yml templates in your resources drawer.', time: '10:33 AM' }
      ],
      manager: [
        { sender: 'manager', text: 'Welcome to the team! During your AI Internship at NeuralMind, we focus on autonomous executions. I will assign sprint tasks weekly. Let me know if you need guidelines.', time: 'Yesterday' }
      ],
      career: [
        { sender: 'manager', text: `Hey ${fName}, I noticed your code evaluation indexes are in the top 8% of all candidates! That is a strong rating for recruiter discovery. We should build out your profile portfolio next.`, time: '3 days ago' }
      ]
    }
  })
  const [inputText, setInputText] = useState('')
  const chatEndRef = useRef(null)

  const companyInfo = internship || {
    name: 'NeuralMind Technologies',
    manager: 'Sarah Johnson',
    roleTitle: 'AI Research Intern'
  }

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
      addToast('New message from Sarah Johnson', 'info')
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
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                      active
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
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      isUser ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-violet/20 text-violet border border-violet/30'
                    }`}>
                      {isUser ? initials : 'SJ'}
                    </div>
                    {/* Message Bubble */}
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
                placeholder="Ask Sarah about your evaluation scorecard or architectural recommendations..."
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

      </div>
    </div>
  )
}
