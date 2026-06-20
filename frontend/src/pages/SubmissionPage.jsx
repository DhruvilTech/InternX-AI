import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, FileText, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck, Terminal, UploadCloud } from 'lucide-react'
import { FaGithub } from 'react-icons/fa6'
import { useNavigation } from '../context/NavigationContext'

export default function SubmissionPage() {
  const { navigate, selectedTaskId, tasks, setEvaluationReport, addToast } = useNavigation()
  
  const [githubUrl, setGithubUrl] = useState('')
  const [driveUrl, setDriveUrl] = useState('')
  
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStep, setUploadStep] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const activeTask = tasks.find(t => t.id === selectedTaskId) || tasks[0]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!githubUrl && !driveUrl) {
      addToast('Please provide a GitHub URL, Google Drive link, or upload a ZIP file.', 'error')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setUploadStep('Initiating secure file stream...')

    // Simulate upload phases
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploading(false)
          setSubmitted(true)
          
          // Generate simulated report matching track
          setEvaluationReport({
            taskId: activeTask.id,
            title: activeTask.title,
            overallScore: 92,
            metrics: [
              { name: 'Code Quality', score: 94 },
              { name: 'Architecture', score: 88 },
              { name: 'Security', score: 91 },
              { name: 'Performance', score: 85 },
              { name: 'Documentation', score: 96 }
            ],
            feedback: 'The submission meets all core functional requirements. The semantic index optimization logic uses advanced cosine models that optimize index matching. The latency graphs show stable scaling profiles under load.',
            suggestions: [
              'Add comprehensive error catching block inside query parameters sanitizers.',
              'Export Prometheus telemetry metrics routes.',
              'Expand setup documentation guides.'
            ]
          })

          addToast('Deliverable uploaded successfully!', 'success')
          return 100
        }
        
        const next = prev + 10
        if (next === 30) setUploadStep('Hashing code payload...')
        if (next === 60) setUploadStep('Running initial static syntax checks...')
        if (next === 90) setUploadStep('Compiling compilation metrics...')
        return next
      })
    }, 250)
  }

  const handleOpenEvaluation = () => {
    navigate('evaluation')
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void text-text relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4 relative z-10">
        
        <button
          onClick={() => navigate('task_details')}
          className="inline-flex items-center gap-2 text-xs text-muted hover:text-text mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Task Details</span>
        </button>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-bright rounded-2xl border border-border p-6 sm:p-10 text-center space-y-6 glow-accent bg-void/50"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="mx-auto w-16 h-16 bg-emerald/10 border border-emerald/20 text-emerald flex items-center justify-center rounded-full"
            >
              <ShieldCheck size={32} />
            </motion.div>
            
            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold text-text">Deliverable Submitted!</h3>
              <p className="text-xs text-muted">
                Your code is currently being audited by the InternX AI evaluation engines.
              </p>
            </div>

            <div className="p-4 bg-void/40 border border-border rounded-xl text-xs space-y-2 max-w-sm mx-auto text-left font-mono">
              <div className="flex justify-between">
                <span className="text-muted">Repository:</span>
                <span className="text-text font-bold truncate max-w-[200px]">{githubUrl || 'zip_archive.zip'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Status:</span>
                <span className="text-emerald font-bold">Auditing Complete</span>
              </div>
            </div>

            <button
              onClick={handleOpenEvaluation}
              className="w-full max-w-sm py-3 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg hover:shadow-accent/20 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <span>View AI Evaluation Audit Report</span>
              <ArrowRight size={14} />
            </button>
          </motion.div>
        ) : uploading ? (
          <div className="glass-bright rounded-2xl border border-border p-6 sm:p-10 space-y-6 glow-accent bg-void/50">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-accent uppercase tracking-wider">{uploadStep}</span>
              <span className="font-mono font-bold text-accent">{uploadProgress}%</span>
            </div>
            
            <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden border border-border">
              <div className="h-full bg-gradient-to-r from-accent to-violet" style={{ width: `${uploadProgress}%` }} />
            </div>

            <div className="bg-void/60 border border-border rounded-xl p-4 font-mono text-[9px] text-muted space-y-1.5 h-32 overflow-y-auto">
              <div>FILE_STREAM: initialized</div>
              {uploadProgress >= 30 && <div>HASH_CHECK: md5 sum matches</div>}
              {uploadProgress >= 60 && <div>STATIC_ANALYSIS: running (no blocker syntax errors detected)</div>}
              {uploadProgress >= 90 && <div>COMPILING: metrics compiled successfully</div>}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-bright rounded-2xl border border-border p-6 sm:p-10 space-y-6 glow-accent bg-void/50">
            <div>
              <span className="text-[10px] text-accent uppercase tracking-wider font-semibold">Submitting Deliverable</span>
              <h3 className="font-display text-xl font-bold text-text mt-1">{activeTask.title}</h3>
            </div>

            <div className="space-y-4">
              {/* GitHub Link */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">GitHub Repository URL</label>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                  <FaGithub size={14} className="text-muted" />
                  <input
                    type="url"
                    placeholder="https://github.com/yourusername/reponame"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full bg-transparent text-xs text-text outline-none border-none"
                  />
                </div>
              </div>

              {/* Shared Doc Link */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Google Drive or Doc Link</label>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                  <Link size={14} className="text-muted" />
                  <input
                    type="url"
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    className="w-full bg-transparent text-xs text-text outline-none border-none"
                  />
                </div>
              </div>

              {/* Zip/PDF Upload simulator */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => {
                    setGithubUrl('https://github.com/demo/project-archive')
                    addToast('ZIP Archive simulated selection', 'info')
                  }}
                  className="border border-dashed border-border hover:border-accent/40 bg-void/30 p-5 rounded-xl text-center space-y-2 cursor-pointer group transition-colors"
                >
                  <UploadCloud size={20} className="text-muted group-hover:text-accent mx-auto transition-colors" />
                  <span className="text-[10px] text-text font-bold block">Upload ZIP Archive</span>
                  <span className="text-[8px] text-muted block">Max file size: 50MB</span>
                </div>

                <div
                  onClick={() => {
                    setDriveUrl('https://drive.google.com/drive/demo-pdf')
                    addToast('PDF documentation simulated selection', 'info')
                  }}
                  className="border border-dashed border-border hover:border-accent/40 bg-void/30 p-5 rounded-xl text-center space-y-2 cursor-pointer group transition-colors"
                >
                  <FileText size={20} className="text-muted group-hover:text-accent mx-auto transition-colors" />
                  <span className="text-[10px] text-text font-bold block">Upload PDF Report</span>
                  <span className="text-[8px] text-muted block">Max file size: 10MB</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg hover:shadow-accent/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Transmit Deliverable</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
