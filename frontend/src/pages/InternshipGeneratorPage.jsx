import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Terminal, Building2, User, Users, FolderKanban, ShieldCheck, ArrowRight } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'
import axiosInstance from '../api/axios.js'

const logs = [
  'Establishing secure connection to InternX AI models...',
  'Analyzing student skill credentials and onboarding parameters...',
  'Generating virtual company identity and market placement details...',
  'Configuring dedicated AI Engineering Manager persona...',
  'Recruiting AI-driven team engineers for project collaboration...',
  'Formulating first project sprint backlog and expectations schema...',
  'Initializing virtual git repository and Kanban environments...',
  'Workspace generation complete. Finalizing setup structures...',
]

export default function InternshipGeneratorPage() {
  const { navigate, internship, setInternship, setTasks, addToast } = useNavigation()
  const [logIndex, setLogIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [complete, setComplete] = useState(false)
  const [apiFinished, setApiFinished] = useState(false)

  useEffect(() => {
    const generateWorkspace = async () => {
      try {
        const response = await axiosInstance.post('/api/internships/generate')
        if (response.data?.success && response.data?.data) {
          const { internship: generatedInternship, tasks: generatedTasks } = response.data.data
          setInternship(generatedInternship)
          setTasks(generatedTasks)
          setApiFinished(true)
        } else {
          throw new Error('Failed to generate')
        }
      } catch (err) {
        console.error(err)
        addToast(err.response?.data?.message || 'Failed to generate internship workspace.', 'error')
        navigate('my-career')
      }
    }
    generateWorkspace()
  }, [])

  useEffect(() => {
    if (progress >= 100 && apiFinished) {
      setComplete(true)
    }
  }, [progress, apiFinished])

  useEffect(() => {
    // Increment logs
    const logInterval = setInterval(() => {
      setLogIndex((prev) => {
        if (prev < logs.length - 1) return prev + 1
        return prev
      })
    }, 1800)

    // Increment progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99 && !apiFinished) {
          return 99
        }
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        const step = Math.random() * 8 + 4
        return Math.min(100, prev + step)
      })
    }, 250)

    return () => {
      clearInterval(logInterval)
      clearInterval(progressInterval)
    }
  }, [apiFinished])

  const handleEnterWorkspace = () => {
    addToast('Entering student workspace...', 'success')
    navigate('dashboard')
  }

  // Fallback check if user navigated directly without selecting career
  const companyInfo = {
    name: internship?.companyName || 'NeuralMind Technologies',
    manager: internship?.managerName || 'Sarah Johnson',
    department: internship?.department || 'Artificial Intelligence',
    project: internship?.projectName || 'Resume Intelligence Platform',
    roleTitle: internship?.internshipRole || 'AI Research Intern',
    team: ['Alex Rivera (Lead Engineer)', 'Sophia Patel (ML Researcher)', 'David Kim (Data Architect)']
  }

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-void px-4 overflow-hidden relative">
      {/* Background glow matrix */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-violet/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-xl relative">
        <AnimatePresence mode="wait">
          {!complete ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="glass-bright rounded-2xl border border-border p-6 sm:p-8 space-y-6 glow-accent bg-void/50"
            >
              {/* Progress */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-accent">
                  <Sparkles size={16} className="animate-spin-slow" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Compiling Internship Workspace</span>
                </div>
                <span className="text-sm font-mono font-bold text-accent">{Math.round(progress)}%</span>
              </div>

              {/* Loader bar */}
              <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden border border-border">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent via-indigo-500 to-violet"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Terminal Logs */}
              <div className="bg-void/80 border border-border p-4 rounded-xl font-mono text-[10px] space-y-2.5 h-44 overflow-y-auto custom-scrollbar flex flex-col justify-end">
                <div className="text-dim">SYS LOGIN: OK</div>
                <div className="text-dim">MODEL_ENGINE: INTERNX_MATRIX_v4.2</div>
                
                {/* Historical log list */}
                {logs.slice(0, logIndex).map((log, idx) => (
                  <div key={idx} className="text-muted flex gap-2">
                    <span className="text-accent">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}

                {/* Active animated log */}
                <motion.div
                  key={logIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-text font-semibold flex gap-2"
                >
                  <span className="text-violet animate-pulse">&gt;</span>
                  <span>{logs[logIndex]}</span>
                </motion.div>
              </div>

              {/* Grid indicators */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="flex items-center gap-2 p-2 bg-surface-muted/30 border border-border rounded-lg">
                  <Building2 size={12} className={progress > 30 ? 'text-accent' : 'text-dim'} />
                  <span className={progress > 30 ? 'text-text' : 'text-dim'}>Company Matrix</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-surface-muted/30 border border-border rounded-lg">
                  <User size={12} className={progress > 50 ? 'text-accent' : 'text-dim'} />
                  <span className={progress > 50 ? 'text-text' : 'text-dim'}>AI Manager System</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-surface-muted/30 border border-border rounded-lg">
                  <Users size={12} className={progress > 70 ? 'text-accent' : 'text-dim'} />
                  <span className={progress > 70 ? 'text-text' : 'text-dim'}>Team Config</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-surface-muted/30 border border-border rounded-lg">
                  <FolderKanban size={12} className={progress > 90 ? 'text-accent' : 'text-dim'} />
                  <span className={progress > 90 ? 'text-text' : 'text-dim'}>Sprint Board Scope</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="glass-bright rounded-2xl border border-border p-6 sm:p-10 space-y-8 glow-accent bg-void/50"
            >
              {/* Success Badge */}
              <div className="text-center space-y-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="mx-auto w-14 h-14 bg-emerald/10 border border-emerald/20 text-emerald flex items-center justify-center rounded-full"
                >
                  <ShieldCheck size={28} />
                </motion.div>
                <h3 className="font-display text-2xl font-bold text-text">Internship Generated!</h3>
                <p className="text-xs text-muted">Your custom workspace is fully architected.</p>
              </div>

              {/* Internship Profile Card */}
              <div className="border border-border rounded-xl bg-void/40 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-accent to-violet rounded-lg flex items-center justify-center text-white text-sm font-bold font-display">
                    {companyInfo.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-sm">{companyInfo.name}</h4>
                    <span className="text-[10px] text-muted">{companyInfo.department} · {companyInfo.roleTitle}</span>
                  </div>
                </div>

                <hr className="border-border" />

                <div className="grid grid-cols-2 gap-4 text-left text-[11px] pt-1">
                  <div>
                    <span className="text-muted uppercase tracking-wider block text-[9px] mb-1">AI Manager</span>
                    <span className="font-medium text-text">{companyInfo.manager}</span>
                  </div>
                  <div>
                    <span className="text-muted uppercase tracking-wider block text-[9px] mb-1">Collaborative Team</span>
                    <span className="font-medium text-text">{companyInfo.team?.length || 3} members</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted uppercase tracking-wider block text-[9px] mb-1">Assigned Sprint Project</span>
                    <span className="font-medium text-accent">{companyInfo.project}</span>
                  </div>
                </div>
              </div>

              {/* Button */}
              <button
                onClick={handleEnterWorkspace}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold hover:shadow-lg hover:shadow-accent/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Internship Workspace</span>
                <ArrowRight size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
