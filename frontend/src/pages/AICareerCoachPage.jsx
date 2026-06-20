import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Sparkles, Map, Compass, BookOpen, Award, CheckSquare, MessageSquare } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'

const initialMessages = [
  { sender: 'coach', text: 'Hello Arjun! I am your AI Career Coach. I analyzed your evaluation scorecard (92/100) and Vector DB skills. Based on current industry benchmarks, I generated a custom learning roadmap and project list. What career milestones should we discuss today?', time: '11:00 AM' }
]

const roadmapSteps = [
  { step: '1', title: 'Vector DB Index pre-warming configurations', status: 'Completed' },
  { step: '2', title: 'SentenceTransformers custom finetuning loops', status: 'In Progress' },
  { step: '3', title: 'LLM observability and Prometheus logging', status: 'Locked' },
  { step: '4', title: 'Autoscaling serverless GPU deployments', status: 'Locked' }
]

const recommendedProjects = [
  { name: 'Multimodal Semantic Image Indexer', desc: 'Build CLIP-based semantic image indexing models.', tech: 'PyTorch · Pinecone' },
  { name: 'Self-RAG Prompt Corrector routing', desc: 'Deploy LangChain pipelines with feedback validation loop.', tech: 'LangChain · FastAPI' }
]

export default function AICareerCoachPage() {
  const { addToast } = useNavigation()
  const [messages, setMessages] = useState(initialMessages)
  const [inputText, setInputText] = useState('')
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const timeString = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const userMsg = { sender: 'user', text: inputText, time: timeString }
    
    setMessages(prev => [...prev, userMsg])
    setInputText('')

    // Coach reply simulation
    setTimeout(() => {
      let reply = 'To prepare for Series-B startup recruitments, I recommend prioritizing vector schema indices. Let\'s make sure you document the latency parameters clearly in your projects.'
      if (inputText.toLowerCase().includes('roadmap') || inputText.toLowerCase().includes('path')) {
        reply = 'I have loaded your custom learning roadmap on the right panel. Step 2 (SentenceTransformers finetuning) is your next major milestone!'
      } else if (inputText.toLowerCase().includes('project') || inputText.toLowerCase().includes('idea')) {
        reply = 'The recommended project templates are loaded on the right. Both CLIP indexers and Self-RAG routes are highly valued by recruitment teams right now!'
      }

      const coachMsg = { sender: 'coach', text: reply, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }
      setMessages(prev => [...prev, coachMsg])
      addToast('New advice from AI Career Coach', 'info')
    }, 1500)
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
                      {isUser ? 'AK' : 'AC'}
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
                {roadmapSteps.map((s) => (
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
                ))}
              </div>
            </div>

            {/* Recommended Projects templates */}
            <div className="glass border border-border rounded-2xl p-5 bg-void/25 space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-violet" />
                <h4 className="text-xs font-bold text-text uppercase tracking-wider">Recommended Project Blueprints</h4>
              </div>

              <div className="space-y-2.5">
                {recommendedProjects.map((p) => (
                  <div key={p.name} className="p-3 bg-surface-muted/20 border border-border rounded-xl space-y-1">
                    <span className="text-xs font-bold text-text block">{p.name}</span>
                    <p className="text-[10px] text-muted leading-relaxed">{p.desc}</p>
                    <span className="text-[8px] font-mono text-accent block font-semibold pt-1">{p.tech}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
