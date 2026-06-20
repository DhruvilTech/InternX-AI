import { useNavigation } from '../context/NavigationContext'
import { Clock, Download, ArrowLeft, ArrowRight, CheckCircle2, FileText, ExternalLink, Calendar } from 'lucide-react'
import { useState } from 'react'

export default function TaskDetailsPage() {
  const { navigate, selectedTaskId, tasks, setSelectedTaskId, addToast } = useNavigation()

  // Find active task or default to first task
  const activeTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0]

  if (!activeTask) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void text-muted text-xs">
        No active tasks found. Go to Dashboard or Kanban board to select one.
      </div>
    )
  }

  // Pre-configured resource files
  const resources = [
    { name: 'Vector DB Index Config template.yml', size: '12 KB', format: 'YAML' },
    { name: 'SentenceTransformers custom finetuning guide.pdf', size: '1.4 MB', format: 'PDF' },
    { name: 'Validation dataset sample.jsonl', size: '450 KB', format: 'JSON' },
  ]

  // Pre-configured submission history
  const history = [
    { id: 'sub-1', date: '2 days ago', file: 'vector_db_design_v1.zip', score: 94, status: 'Graded' },
    { id: 'sub-2', date: 'Yesterday', file: 'finetuned_model_weights.zip', score: 88, status: 'Graded' },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background spotlights */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 space-y-8 relative z-10">
        
        {/* Back button */}
        <button
          onClick={() => navigate('kanban')}
          className="inline-flex items-center gap-2 text-xs text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Kanban Board</span>
        </button>

        {/* Header Widget */}
        <div className="glass-bright rounded-2xl p-6 border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-void/50 glow-accent">
          <div>
            <span className="text-[10px] text-accent uppercase tracking-widest font-semibold">{activeTask.category} Milestone</span>
            <h2 className="font-display font-bold text-2xl text-text mt-1">{activeTask.title}</h2>
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-accent" />
                <span>Deadline: {activeTask.deadline}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                <span>Assigned: Week 3 Sprint</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('submit_task')}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Submit Deliverable</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Content Split */}
        <div className="grid md:grid-cols-12 gap-8 items-start">
          
          {/* Main Doc Area */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Description */}
            <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-3">
              <h3 className="text-sm font-bold text-text uppercase tracking-wider">Objective</h3>
              <p className="text-xs text-muted leading-relaxed">
                {activeTask.desc || 'Provide code design and pipeline integrations for the current architecture requirements. Review the vector storage parameters, API routing formats, and unit tests details.'}
              </p>
            </div>

            {/* Requirements */}
            <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
              <h3 className="text-sm font-bold text-text uppercase tracking-wider">Functional Requirements</h3>
              <ul className="space-y-3">
                {(activeTask.requirements || [
                  'Implement robust error catches and request validations middleware.',
                  'Target high concurrency latency below 150ms on heavy dataset models.',
                  'Expose metric hooks and API status check health logs.',
                  'Add detailed README setup instructions and configuration script samples.'
                ]).map((req, i) => (
                  <li key={i} className="flex gap-3 text-xs text-muted leading-relaxed">
                    <CheckCircle2 size={14} className="text-accent shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Expected Output */}
            <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-3">
              <h3 className="text-sm font-bold text-text uppercase tracking-wider">Expected Deliverable Output</h3>
              <p className="text-xs text-muted leading-relaxed">
                {activeTask.expected || 'Container config zip, codebase github repository URL link, or document file format including API endpoint paths, latency response graphs, and schemas parameters.'}
              </p>
            </div>

          </div>

          {/* Sidebar Area */}
          <div className="md:col-span-4 space-y-6">
            
            {/* Evaluation Criteria */}
            <div className="glass border border-border rounded-2xl p-5 bg-void/25 space-y-4">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">Evaluation Metrics</h4>
              <div className="space-y-3 text-xs text-muted">
                <div className="flex justify-between items-center">
                  <span>Code Cleanliness</span>
                  <span className="font-semibold text-text">30% weight</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Architecture & Latency</span>
                  <span className="font-semibold text-text">30% weight</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Security compliance</span>
                  <span className="font-semibold text-text">20% weight</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Technical Documentation</span>
                  <span className="font-semibold text-text">20% weight</span>
                </div>
              </div>
            </div>

            {/* Resources download */}
            <div className="glass border border-border rounded-2xl p-5 bg-void/25 space-y-3">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">Reference Artifacts</h4>
              <div className="space-y-2">
                {resources.map((file) => (
                  <div
                    key={file.name}
                    className="p-3 bg-surface-muted/30 border border-border rounded-xl flex items-center justify-between text-[10px] group hover:border-accent/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText size={13} className="text-accent" />
                      <span className="text-text truncate font-medium">{file.name}</span>
                    </div>
                    <button
                      onClick={() => addToast(`Downloading ${file.name}...`, 'success')}
                      className="text-muted hover:text-text shrink-0 p-1 hover:bg-white/5 rounded"
                    >
                      <Download size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submission history logs */}
            <div className="glass border border-border rounded-2xl p-5 bg-void/25 space-y-3">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">Submission Logs</h4>
              <div className="space-y-2">
                {history.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 bg-surface-muted/20 border border-border rounded-xl flex items-center justify-between text-[10px]"
                  >
                    <div>
                      <span className="font-semibold text-text">{sub.file}</span>
                      <span className="text-muted block text-[8px] mt-0.5">Submitted {sub.date}</span>
                    </div>
                    <span className="text-emerald font-bold">{sub.score}/100</span>
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
