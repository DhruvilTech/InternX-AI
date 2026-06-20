import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Clock, ArrowRight, CornerDownRight, CheckSquare, Search, Filter, ShieldCheck, X } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'
import axiosInstance from '../api/axios.js'

const columns = [
  { id: 'todo', label: 'To Do', border: 'border-slate-800' },
  { id: 'in-progress', label: 'In Progress', border: 'border-accent/40' },
  { id: 'under-review', label: 'Under Review', border: 'border-violet/40' },
  { id: 'completed', label: 'Completed', border: 'border-emerald/40' },
]

export default function TaskManagementPage() {
  const { tasks, setTasks, setSelectedTaskId, navigate, addToast } = useNavigation()
  const [selectedTask, setSelectedTask] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  // Timers countdown state simulation
  const [timeLeft, setTimeLeft] = useState('2h 45m')

  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate ticking down
      setTimeLeft('2h 44m')
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const verifyInternship = async () => {
      try {
        const internRes = await axiosInstance.get('/api/internships/my-internship')
        if (!internRes.data?.success || !internRes.data?.data?.internship) {
          navigate('generator')
        }
      } catch (err) {
        navigate('generator')
      }
    }
    verifyInternship()
  }, [])

  const moveTask = async (taskId, newStatus) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return { ...t, status: newStatus }
        }
        return t
      }))

      const response = await axiosInstance.patch(`/api/tasks/${taskId}/status`, { status: newStatus })
      if (response.data?.success) {
        addToast(`Moved task to ${newStatus.replace(/[_-]/g, ' ').toUpperCase()}`, 'success')
      } else {
        throw new Error('Failed to update status')
      }
    } catch (err) {
      console.error(err)
      addToast('Failed to update task status in database.', 'error')
      // Rollback or reload tasks from backend
      try {
        const tasksRes = await axiosInstance.get('/api/tasks')
        if (tasksRes.data?.success && tasksRes.data?.data?.tasks) {
          setTasks(tasksRes.data.data.tasks)
        }
      } catch (fetchErr) {
        console.error('Failed to sync tasks on rollback:', fetchErr)
      }
    }
  }

  const handleOpenTask = (task) => {
    setSelectedTaskId(task.id)
    setSelectedTask(task)
  }

  const handleCloseModal = () => {
    setSelectedTask(null)
  }

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.desc?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCat = categoryFilter === 'All' || t.category === categoryFilter
    return matchesSearch && matchesCat
  })

  const categories = ['All', ...new Set(tasks.map(t => t.category).filter(Boolean))]

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 space-y-8 relative z-10">
        
        {/* Title & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
          <div>
            <h2 className="font-display font-bold text-2xl">Sprint Task Kanban</h2>
            <p className="text-xs text-muted mt-1">Manage, code, and submit your weekly tasks.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 border border-border bg-void/50 rounded-xl text-xs flex-1 sm:flex-none">
              <Search size={13} className="text-muted" />
              <input
                type="text"
                placeholder="Search sprint board..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none border-none text-xs w-full sm:w-40"
              />
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 border border-border bg-void/50 rounded-xl text-xs">
              <Filter size={13} className="text-muted" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent outline-none border-none text-xs text-muted"
              >
                {categories.map(c => (
                  <option key={c} value={c} className="bg-[#0f1629] text-text">{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Kanban Board Grid */}
        <div className="grid md:grid-cols-4 gap-4 items-start">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter(t => t.status === col.id)
            return (
              <div key={col.id} className="space-y-4">
                {/* Column Header */}
                <div className={`p-4 rounded-xl bg-surface-muted/20 border-l-2 ${col.border} flex justify-between items-center bg-void/30`}>
                  <span className="text-xs font-bold text-text uppercase tracking-wider">{col.label}</span>
                  <span className="h-5 w-5 bg-surface-muted/50 rounded-full flex items-center justify-center text-[10px] font-bold text-muted border border-border">
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Cards Container */}
                <div className="space-y-2.5 min-h-[350px]">
                  {colTasks.length === 0 ? (
                    <div className="border border-dashed border-border rounded-xl p-6 text-center text-[10px] text-dim italic">
                      No tasks in this lane
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layoutId={`task-card-${task.id}`}
                        onClick={() => handleOpenTask(task)}
                        whileHover={{ y: -2 }}
                        className="p-4 rounded-xl border border-border bg-void hover:border-accent/40 cursor-pointer transition-all space-y-3 group shadow-sm"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[9px] font-mono text-accent uppercase tracking-wider">{task.category || 'Core'}</span>
                          {task.score && (
                            <span className="text-[9px] font-bold text-emerald bg-emerald/10 border border-emerald/20 px-1.5 py-0.5 rounded">
                              {task.score}/100
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-text group-hover:text-accent transition-colors leading-tight">
                          {task.title}
                        </h4>

                        <div className="flex justify-between items-center text-[9px] text-muted border-t border-border/60 pt-2.5 mt-2">
                          <div className="flex items-center gap-1">
                            <Clock size={10} className="text-accent" />
                            <span>{task.id === 'ai-3' ? timeLeft : task.deadline}</span>
                          </div>
                          
                          {/* Quick movement selectors */}
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {col.id !== 'todo' && (
                              <button
                                title="Move back"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const prevStatuses = { 'in-progress': 'todo', 'under-review': 'in-progress', 'completed': 'under-review' }
                                  moveTask(task.id, prevStatuses[col.id])
                                }}
                                className="h-4 w-4 rounded bg-surface-muted hover:bg-border flex items-center justify-center text-muted"
                              >
                                &lt;
                              </button>
                            )}
                            {col.id !== 'completed' && (
                              <button
                                title="Move forward"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const nextStatuses = { 'todo': 'in-progress', 'in-progress': 'under-review', 'under-review': 'completed' }
                                  moveTask(task.id, nextStatuses[col.id])
                                }}
                                className="h-4 w-4 rounded bg-surface-muted hover:bg-border flex items-center justify-center text-muted"
                              >
                                &gt;
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>

      </div>

      {/* Interactive Detail Modal (Quick View) */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
            {/* Modal Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-void/70 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg glass-bright rounded-2xl border border-border p-6 sm:p-8 space-y-6 glow-accent bg-void/50 max-h-[85vh] overflow-y-auto custom-scrollbar"
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] text-accent uppercase tracking-widest font-semibold">{selectedTask.category} Milestone</span>
                  <h3 className="font-display font-bold text-xl text-text mt-1">{selectedTask.title}</h3>
                </div>
                <button onClick={handleCloseModal} className="p-1.5 hover:bg-white/5 rounded-lg text-muted hover:text-text">
                  <X size={16} />
                </button>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 p-3 bg-surface-muted/20 border border-border rounded-xl text-xs">
                <Clock size={14} className="text-accent" />
                <span className="text-muted">Sprint State:</span>
                <span className="font-semibold text-text uppercase">{selectedTask.status.replace(/[_-]/g, ' ')}</span>
                <span className="text-muted ml-auto">Due:</span>
                <span className="font-semibold text-text">{selectedTask.deadline}</span>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <span className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Objective</span>
                <p className="text-xs text-muted leading-relaxed bg-void/40 p-3 rounded-lg border border-border">{selectedTask.desc || 'No description provided.'}</p>
              </div>

              {/* Action trigger */}
              <div className="flex gap-3 justify-end border-t border-border pt-4 mt-6">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl text-xs border border-border text-muted hover:text-text transition-colors"
                >
                  Close Modal
                </button>
                <button
                  onClick={() => {
                    handleCloseModal()
                    navigate('task_details')
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-1.5"
                >
                  <span>Open Workspace Details</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
