import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  ClipboardList,
  Code2,
  GraduationCap,
  Bot,
} from 'lucide-react'
import PulseDot from '../ui/PulseDot'

const agents = [
  {
    id: 'hr',
    name: 'AI HR Agent',
    role: 'Onboarding & Culture',
    icon: Bot,
    color: 'text-violet',
    bg: 'bg-violet/10',
  },
  {
    id: 'pm',
    name: 'AI Project Manager',
    role: 'Sprint Planning',
    icon: ClipboardList,
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    id: 'eng',
    name: 'AI Senior Engineer',
    role: 'Code Review',
    icon: Code2,
    color: 'text-cyan',
    bg: 'bg-cyan/10',
  },
  {
    id: 'coach',
    name: 'AI Career Coach',
    role: 'Growth & Feedback',
    icon: GraduationCap,
    color: 'text-emerald',
    bg: 'bg-emerald/10',
  },
]

const messages = [
  { agent: 'hr', text: 'Welcome to NeuralMind! Your onboarding checklist is ready.', time: '9:00 AM' },
  { agent: 'pm', text: 'Sprint 2 kickoff — you have 4 tasks assigned for this week.', time: '9:15 AM' },
  { agent: 'eng', text: 'Great work on the API layer. Consider adding rate limiting.', time: '2:30 PM' },
  { agent: 'coach', text: 'Your communication score improved 12% this sprint. Keep it up!', time: '4:00 PM' },
  { agent: 'pm', text: 'New task: Implement caching layer for ML inference.', time: '4:45 PM' },
  { agent: 'eng', text: 'PR #47 approved. Merge when ready.', time: '5:10 PM' },
]

const tasks = [
  { title: 'Review architecture doc', status: 'done', agent: 'pm' },
  { title: 'Fix memory leak in pipeline', status: 'in-progress', agent: 'eng' },
  { title: 'Schedule 1:1 with coach', status: 'new', agent: 'coach' },
]

export default function LivingAICompany() {
  const [visibleMessages, setVisibleMessages] = useState([])
  const [visibleTasks, setVisibleTasks] = useState([])
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    if (msgIndex >= messages.length) return
    const timer = setTimeout(() => {
      setVisibleMessages((prev) => [...prev, messages[msgIndex]])
      setMsgIndex((i) => i + 1)
    }, 1800)
    return () => clearTimeout(timer)
  }, [msgIndex])

  useEffect(() => {
    tasks.forEach((task, i) => {
      setTimeout(() => {
        setVisibleTasks((prev) => [...prev, task])
      }, 3000 + i * 1500)
    })
  }, [])

  return (
    <section id="company" className="relative py-32 bg-deep overflow-hidden">
      <div className="absolute inset-0 grid-fine opacity-30" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <p className="text-xs font-semibold text-cyan uppercase tracking-[0.2em] mb-3">
            Living AI Company
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold">
            Your company never sleeps
          </h2>
        </motion.div>

        {/* OS-style interface */}
        <div className="glass-bright rounded-2xl overflow-hidden glow-accent">
          {/* Title bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-void/50">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose/70" />
                <span className="w-3 h-3 rounded-full bg-amber/70" />
                <span className="w-3 h-3 rounded-full bg-emerald/70" />
              </div>
              <span className="text-sm font-medium">NeuralMind OS</span>
            </div>
            <div className="flex items-center gap-2">
              <PulseDot color="emerald" size={6} />
              <span className="text-xs text-emerald">4 agents active</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 min-h-[480px]">
            {/* Agent sidebar */}
            <div className="lg:col-span-3 border-r border-border p-4 space-y-2 bg-void/30">
              {agents.map((agent, i) => {
                const Icon = agent.icon
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-center gap-3 p-3 rounded-xl ${agent.bg} border border-transparent hover:border-border-bright transition-colors cursor-pointer`}
                  >
                    <div className={`w-9 h-9 rounded-lg ${agent.bg} flex items-center justify-center`}>
                      <Icon size={16} className={agent.color} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{agent.name}</p>
                      <p className="text-[10px] text-muted">{agent.role}</p>
                    </div>
                    <PulseDot color="emerald" size={5} />
                  </motion.div>
                )
              })}
            </div>

            {/* Chat area */}
            <div className="lg:col-span-6 p-4 flex flex-col border-r border-border">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                <MessageSquare size={14} className="text-muted" />
                <span className="text-xs text-muted">Team Channel</span>
              </div>
              <div className="flex-1 space-y-3 overflow-hidden">
                <AnimatePresence>
                  {visibleMessages.map((msg, i) => {
                    const agent = agents.find((a) => a.id === msg.agent)
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="flex gap-3"
                      >
                        <div className={`w-8 h-8 rounded-lg ${agent?.bg} flex items-center justify-center shrink-0`}>
                          <Bot size={14} className={agent?.color} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium">{agent?.name}</span>
                            <span className="text-[10px] text-dim">{msg.time}</span>
                          </div>
                          <p className="text-sm text-muted bg-surface-muted rounded-lg px-3 py-2 border border-border">
                            {msg.text}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Tasks panel */}
            <div className="lg:col-span-3 p-4 bg-void/20">
              <p className="text-xs text-muted uppercase tracking-wider mb-4">Incoming Tasks</p>
              <div className="space-y-3">
                <AnimatePresence>
                  {visibleTasks.map((task, i) => (
                    <motion.div
                      key={task.title}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 rounded-xl glass border border-border"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[10px] uppercase font-semibold ${
                            task.status === 'new'
                              ? 'text-accent'
                              : task.status === 'in-progress'
                                ? 'text-amber'
                                : 'text-emerald'
                          }`}
                        >
                          {task.status.replace('-', ' ')}
                        </span>
                        <PulseDot
                          color={task.status === 'new' ? 'accent' : task.status === 'in-progress' ? 'amber' : 'emerald'}
                          size={5}
                        />
                      </div>
                      <p className="text-xs">{task.title}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
