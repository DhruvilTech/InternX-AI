import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck, Terminal, UploadCloud, AlertTriangle, Loader2 } from 'lucide-react'
import { FaGithub } from 'react-icons/fa6'
import { useNavigation } from '../context/NavigationContext'
import axiosInstance from '../api/axios.js'

export default function SubmissionPage() {
  const { navigate, selectedTaskId, tasks, setEvaluationReport, fetchStudentInternshipAndTasks, addToast } = useNavigation()
  
  const [githubUrl, setGithubUrl] = useState('')
  const [githubBranch, setGithubBranch] = useState('main')
  const [githubCommitHash, setGithubCommitHash] = useState('')
  const [connectedRepo, setConnectedRepo] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileName, setFileName] = useState('')
  
  // Polling & progress state
  const [polling, setPolling] = useState(false)
  const [progress, setProgress] = useState(10)
  const [status, setStatus] = useState('Submitted')
  const [errorDetails, setErrorDetails] = useState('')
  const [hasFailed, setHasFailed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [currentSubmission, setCurrentSubmission] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeTask = tasks.find(t => t.id === selectedTaskId) || tasks[0]

  // Polling interval reference
  const pollingIntervalRef = useRef(null)
  const terminalEndRef = useRef(null)

  useEffect(() => {
    const checkGithubConnection = async () => {
      try {
        const res = await axiosInstance.get('/api/github/selected-repository')
        if (res.data?.success && res.data?.data) {
          setConnectedRepo(res.data.data)
          if (res.data.data.branch) {
            setGithubBranch(res.data.data.branch)
          }
          // Pre-fill githubUrl if it's connected
          try {
            const profileRes = await axiosInstance.get('/api/github/profile')
            if (profileRes.data?.success && profileRes.data?.data) {
              const username = profileRes.data.data.username
              const repoName = res.data.data.repositoryName
              setGithubUrl(`https://github.com/${username}/${repoName}`)
            } else {
              setGithubUrl(`https://github.com/active-repo/${res.data.data.repositoryName}`)
            }
          } catch (profileErr) {
            setGithubUrl(`https://github.com/active-repo/${res.data.data.repositoryName}`)
          }
        }
      } catch (err) {
        console.log("No connected repository retrieved:", err)
      }
    }
    checkGithubConnection()
  }, [])

  // Clear polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  // Auto-scroll logs terminal to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [status, progress, hasFailed])

  const validateInputs = () => {
    if (!githubUrl && !selectedFile) {
      addToast('Please upload a ZIP file or provide a GitHub repository URL.', 'error')
      return false
    }

    if (githubUrl) {
      const lowerUrl = githubUrl.toLowerCase()
      const blockedKeywords = ['youtube.com', 'youtu.be', 'drive.google.com', 'linkedin.com', 'portfolio']
      const isBlocked = blockedKeywords.some(keyword => lowerUrl.includes(keyword)) || !lowerUrl.includes('github.com')
      if (isBlocked) {
        addToast('Invalid GitHub URL. YouTube, Google Drive, Portfolio, and other random URLs are not allowed.', 'error')
        return false
      }
    }

    if (selectedFile && !selectedFile.name.endsWith('.zip')) {
      addToast('Only ZIP files are supported for Option B upload.', 'error')
      return false
    }

    return true
  }

  const startPolling = (submissionId) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }
    setPolling(true)
    setHasFailed(false)
    setSubmitted(false)
    setProgress(10)
    setStatus('Submitted')
    setErrorDetails('')

    const intervalId = setInterval(async () => {
      try {
        const response = await axiosInstance.get(`/api/submissions/${submissionId}/progress`)
        if (response.data?.success && response.data?.data) {
          const { status: backendStatus, progress: backendProgress } = response.data.data
          setStatus(backendStatus)
          setProgress(backendProgress)

          if (backendStatus === 'Completed') {
            clearInterval(intervalId)
            if (pollingIntervalRef.current === intervalId) {
              pollingIntervalRef.current = null
            }

            // Retrieve final report details
            try {
              const reportRes = await axiosInstance.get(`/api/submissions/${submissionId}/report`)
              if (reportRes.data?.success && reportRes.data?.data) {
                const evalData = reportRes.data.data.evaluation
                setEvaluationReport({
                  taskId: activeTask.id,
                  title: activeTask.title,
                  overallScore: evalData.overallScore,
                  metrics: [
                    { name: 'Code Quality', score: evalData.codeQualityScore, reason: evalData.reasons?.codeQualityScore },
                    { name: 'Architecture', score: evalData.architectureScore, reason: evalData.reasons?.architectureScore },
                    { name: 'Security', score: evalData.technicalScore, reason: evalData.reasons?.technicalScore },
                    { name: 'Performance', score: evalData.problemSolvingScore, reason: evalData.reasons?.problemSolvingScore },
                    { name: 'Documentation', score: evalData.documentationScore, reason: evalData.reasons?.documentationScore }
                  ],

                  feedback: evalData.strengths.join('. ') + '. Weaknesses: ' + evalData.weaknesses.join('. '),
                  suggestions: evalData.recommendations
                })
              }
            } catch (reportErr) {
              console.error('Failed to load completed evaluation report:', reportErr)
            }

            await fetchStudentInternshipAndTasks() // refresh dashboard tasks list
            setPolling(false)
            setSubmitted(true)
            setIsSubmitting(false)
            addToast('Deliverable audited and evaluated successfully!', 'success')
          } else if (backendStatus === 'Failed') {
            clearInterval(intervalId)
            if (pollingIntervalRef.current === intervalId) {
              pollingIntervalRef.current = null
            }

            // Find failure reason
            let reason = 'An error occurred during evaluation. No source code detected or repository private.'
            try {
              // Wait 500ms to let backend update task details
              await new Promise(resolve => setTimeout(resolve, 500))
              const refreshedTasksRes = await axiosInstance.get('/api/tasks')
              if (refreshedTasksRes.data?.success && refreshedTasksRes.data?.data?.tasks) {
                const updatedTask = refreshedTasksRes.data.data.tasks.find(t => t.id === activeTask.id)
                if (updatedTask && updatedTask.feedback) {
                   reason = updatedTask.feedback.replace('Evaluation failed: ', '')
                }
              }
            } catch (tErr) {
              console.error('Failed to pull updated task feedback:', tErr)
            }

            setErrorDetails(reason)
            setPolling(false)
            setHasFailed(true)
            setIsSubmitting(false)
            addToast('Evaluation Failed: ' + reason, 'error')
          }
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 1500)

    pollingIntervalRef.current = intervalId
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isSubmitting) return
    if (!validateInputs()) return

    setIsSubmitting(true)

    const processApiSubmission = async (fileData = null) => {
      try {
        const type = githubUrl ? 'github' : 'zip'
        const payload = {
          taskId: activeTask.id,
          submissionType: type,
          githubUrl,
          githubBranch: type === 'github' ? githubBranch : '',
          githubCommitHash: type === 'github' ? githubCommitHash : '',
          fileData,
          fileName
        }

        // Post to create the submission record (begins background evaluation immediately)
        const response = await axiosInstance.post('/api/submissions/create', payload)

        if (response.data?.success && response.data?.data?.submission) {
          const submission = response.data.data.submission
          setCurrentSubmission(submission)
          startPolling(submission._id)
        } else {
          throw new Error(response.data?.message || 'Failed to initialize submission')
        }
      } catch (err) {
        console.error(err)
        addToast(err.response?.data?.message || err.message || 'Submission initialization failed.', 'error')
        setIsSubmitting(false)
      }
    }

    if (selectedFile) {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]
        processApiSubmission(base64)
      }
      reader.onerror = () => {
        addToast('Failed to read uploaded ZIP file.', 'error')
      }
      reader.readAsDataURL(selectedFile)
    } else {
      processApiSubmission()
    }
  }

  const handleOpenEvaluation = () => {
    navigate('evaluation')
  }

  const handleZipClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.zip'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        setSelectedFile(file)
        setFileName(file.name)
        setGithubUrl('')
        addToast(`Selected ZIP archive: ${file.name}`, 'info')
      }
    }
    input.click()
  }

  const handleReset = () => {
    setGithubUrl('')
    setSelectedFile(null)
    setFileName('')
    setPolling(false)
    setSubmitted(false)
    setHasFailed(false)
    setIsSubmitting(false)
  }

  // Generate terminal logs dynamically based on the current status & progress
  const getLogs = () => {
    const logsList = []
    const type = githubUrl ? 'github' : 'zip'
    const payloadLabel = type === 'github' ? githubUrl : fileName

    if (progress >= 10) {
      logsList.push(`[SYSTEM] Initializing code audit pipeline for task: '${activeTask.title}'...`)
      logsList.push(`[SYSTEM] Submission method: ${type.toUpperCase()}`)
      logsList.push(`[SYSTEM] Content locator: ${payloadLabel}`)
      if (type === 'github') {
        logsList.push(`[SYSTEM] Target Branch: ${githubBranch}`)
        if (githubCommitHash) {
          logsList.push(`[SYSTEM] Target Commit Hash: ${githubCommitHash}`)
        }
      }
      logsList.push(`[SYSTEM] Status set to 'Submitted'. Starting extraction workers.`)
    }
    if (progress >= 25) {
      if (type === 'github') {
        logsList.push(`[WORKER] Running Repository Validation...`)
        logsList.push(`[WORKER] Verifying repository access permissions on GitHub API...`)
        logsList.push(`[WORKER] Public repository confirmed. Crawling commits data, contributors profile, and language weights.`)
      } else {
        logsList.push(`[WORKER] Running ZIP Extraction...`)
        logsList.push(`[WORKER] Unpacking compression buffer in temporary memory sandbox...`)
        logsList.push(`[WORKER] Extracted successfully. Scanning directory layout recursively.`)
      }
    }
    if (progress >= 50) {
      logsList.push(`[ANALYZER] Running AST Code Analysis...`)
      logsList.push(`[ANALYZER] Mapping file layouts to directories (controllers, models, routes, middlewares, services, utils)...`)
      logsList.push(`[ANALYZER] Parsing primary package configuration modules and code file counts...`)
    }
    if (progress >= 70) {
      logsList.push(`[AI_ENGINE] Packing telemetry metadata summary context...`)
      logsList.push(`[AI_ENGINE] Launching AI Evaluation prompt. Dispatching logical snippets to Groq Qwen-32B Endpoint...`)
      logsList.push(`[AI_ENGINE] Assessing metrics: Code Cleanliness, REST architecture, security, documentation, and logic correctness...`)
    }
    if (progress >= 85) {
      logsList.push(`[AI_ENGINE] Scorecards and logical evidence reports parsed successfully.`)
      logsList.push(`[SKILLS] Running Skill Analysis. Comparing technologies stack with student capability profiles...`)
      logsList.push(`[SKILLS] Updating skill index percentages: ${activeTask.requiredSkills.join(', ')}`)
    }
    if (progress >= 95) {
      logsList.push(`[CAREER] Running Career Intelligence gap analysis diagnostics...`)
      logsList.push(`[CAREER] Computing placement readiness indicator, portfolio metrics, and matching suitable job roles.`)
    }
    if (status === 'Completed') {
      logsList.push(`[SYSTEM] SUCCESS: Evaluation engine pipeline finished successfully.`)
      logsList.push(`[SYSTEM] Completed at: ${new Date().toLocaleTimeString()}`)
    } else if (status === 'Failed') {
      logsList.push(`[SYSTEM] FATAL ERROR: Evaluation pipeline aborted.`)
      logsList.push(`[SYSTEM] Reason: ${errorDetails || 'No source code files detected.'}`)
    }

    return logsList
  }

  // Step-by-step progress timeline configuration
  const steps = [
    { label: 'Submitted', key: 'Submitted', progressThreshold: 10 },
    { label: githubUrl ? 'Repository Validated' : 'ZIP Extracted', key: 'Validation', progressThreshold: 25 },
    { label: 'Project Structure Analyzed', key: 'Analysis', progressThreshold: 50 },
    { label: 'AI Evaluation Completed', key: 'AI', progressThreshold: 70 },
    { label: 'Skill Analysis Completed', key: 'Skill', progressThreshold: 85 },
    { label: 'Career Report Generated', key: 'Career', progressThreshold: 95 }
  ]

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

        {activeTask.status === 'completed' && !polling && !submitted ? (
          <div className="glass-bright rounded-2xl border border-border p-6 sm:p-10 text-center space-y-6 glow-accent bg-void/50">
            <div className="mx-auto w-16 h-16 bg-emerald/10 border border-emerald/20 text-emerald flex items-center justify-center rounded-full animate-pulse">
              <CheckCircle2 size={32} />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold text-text">Task Already Completed</h3>
              <p className="text-xs text-muted">
                This milestone task has been successfully audited and graded. Multiple submissions are not allowed for completed milestones.
              </p>
            </div>

            <button
              onClick={() => navigate('task_details')}
              className="w-full max-w-sm py-3 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg hover:shadow-accent/20 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Return to Task Details</span>
            </button>
          </div>
        ) : (activeTask.status === 'todo' || !activeTask.status) && !polling && !submitted ? (
          <div className="glass-bright rounded-2xl border border-border p-6 sm:p-10 text-center space-y-6 glow-accent bg-void/50">
            <div className="mx-auto w-16 h-16 bg-violet/10 border border-violet/20 text-violet flex items-center justify-center rounded-full animate-pulse">
              <Loader2 size={32} className="text-accent" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold text-text">Task Milestone Not Started</h3>
              <p className="text-xs text-muted">
                Please click "Start Task" on the task details page before submitting your codebase deliverable.
              </p>
            </div>

            <button
              onClick={() => navigate('task_details')}
              className="w-full max-w-sm py-3 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg hover:shadow-accent/20 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Go to Task Details</span>
            </button>
          </div>
        ) : submitted ? (

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
              <h3 className="font-display text-2xl font-bold text-text">Deliverable Evaluated!</h3>
              <p className="text-xs text-muted">
                Your code has been successfully audited by the InternX AI evaluation engines.
              </p>
            </div>

            <div className="p-4 bg-void/40 border border-border rounded-xl text-xs space-y-2 max-w-sm mx-auto text-left font-mono">
              <div className="flex justify-between">
                <span className="text-muted">Submission Type:</span>
                <span className="text-text font-bold">
                  {githubUrl ? 'GitHub Repository' : 'ZIP Archive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Submitted Content:</span>
                <span className="text-text font-bold truncate max-w-[200px]">{githubUrl || fileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Status:</span>
                <span className="text-emerald font-bold">Completed</span>
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
        ) : polling ? (
          <div className="glass-bright rounded-2xl border border-border p-6 sm:p-10 space-y-8 glow-accent bg-void/50">
            {/* Header */}
            <div>
              <span className="text-[10px] text-accent uppercase tracking-wider font-semibold">AI Evaluation Pipeline</span>
              <h3 className="font-display text-lg font-bold text-text mt-0.5">Auditing: {activeTask.title}</h3>
            </div>

            {/* Progress metrics */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-accent uppercase tracking-wider flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin text-accent" />
                  <span>Stage: {status}</span>
                </span>
                <span className="font-mono font-bold text-accent">{progress}%</span>
              </div>
              
              <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden border border-border">
                <div 
                  className="h-full bg-gradient-to-r from-accent to-violet transition-all duration-500 ease-out" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3.5 border-t border-border pt-6">
              <h4 className="text-[11px] font-semibold text-muted uppercase tracking-wider">Evaluation Steps</h4>
              <div className="space-y-3 pl-1">
                {steps.map((step) => {
                  const isDone = progress >= step.progressThreshold
                  const isActive = status === step.key || (progress >= step.progressThreshold && progress < (step.progressThreshold + 15))
                  
                  return (
                    <div key={step.label} className="flex items-center gap-3 text-xs">
                      {isDone ? (
                        <CheckCircle2 size={14} className="text-emerald shrink-0" />
                      ) : isActive ? (
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-accent border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border border-border bg-void shrink-0" />
                      )}
                      <span className={`${isDone ? 'text-text font-medium' : isActive ? 'text-accent font-semibold' : 'text-muted'}`}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Terminal logs console */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Live Audit Logs</span>
              <div className="bg-void/80 border border-border rounded-xl p-4 font-mono text-[10px] text-muted space-y-1.5 h-44 overflow-y-auto shadow-inner">
                {getLogs().map((log, idx) => {
                  let logColor = 'text-muted'
                  if (log.includes('[SYSTEM] SUCCESS')) logColor = 'text-emerald'
                  else if (log.includes('[SYSTEM] FATAL') || log.includes('[SYSTEM] Reason')) logColor = 'text-rose-400'
                  else if (log.includes('[AI_ENGINE]')) logColor = 'text-violet-400'
                  
                  return (
                    <div key={idx} className={`${logColor} leading-relaxed break-all`}>
                      {log}
                    </div>
                  )
                })}
                <div ref={terminalEndRef} />
              </div>
            </div>
          </div>
        ) : window.location.hash.includes('failed') || hasFailed ? (
          <div className="glass-bright rounded-2xl border border-border p-6 sm:p-10 space-y-6 glow-accent bg-void/50 text-center">
            <div className="mx-auto w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center rounded-full">
              <AlertTriangle size={32} />
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold text-text">Evaluation Failed</h3>
              <p className="text-xs text-muted">
                The code review engine could not complete verification.
              </p>
            </div>

            <div className="p-4 bg-void/40 border border-border rounded-xl text-xs max-w-sm mx-auto text-left font-mono text-rose-400">
              <div className="font-semibold mb-1">Feedback/Logs:</div>
              <p className="leading-relaxed text-[11px]">{errorDetails || 'No source code detected or repository configuration invalid.'}</p>
            </div>

            <button
              onClick={handleReset}
              className="w-full max-w-sm py-3 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg hover:shadow-accent/20 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <span>Try Submission Again</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-bright rounded-2xl border border-border p-6 sm:p-10 space-y-6 glow-accent bg-void/50">
            <div>
              <span className="text-[10px] text-accent uppercase tracking-wider font-semibold">Submitting Deliverable</span>
              <h3 className="font-display text-xl font-bold text-text mt-1">{activeTask.title}</h3>
            </div>

            <div className="space-y-4">
              {/* Connected Repository Banner */}
              {connectedRepo && (
                <div className="glass-bright p-4 rounded-xl border border-violet/20 flex items-center justify-between text-xs bg-violet/5 hover:border-violet/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet/10 rounded-lg text-violet">
                      <FaGithub size={16} />
                    </div>
                    <div>
                      <span className="font-semibold text-text block">Linked Repository Active</span>
                      <span className="text-[10px] text-muted font-mono">{connectedRepo.repositoryName} ({connectedRepo.branch || 'main'})</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      let username = 'active-repo'
                      try {
                        const profileRes = await axiosInstance.get('/api/github/profile')
                        if (profileRes.data?.success && profileRes.data?.data) {
                          username = profileRes.data.data.username
                        }
                      } catch (err) {
                        console.log("Error loading profile:", err)
                      }
                      setGithubUrl(`https://github.com/${username}/${connectedRepo.repositoryName}`)
                      if (connectedRepo.branch) {
                        setGithubBranch(connectedRepo.branch)
                      }
                      setSelectedFile(null)
                      setFileName('')
                      addToast('Connected repository URL and branch pre-filled!', 'success')
                    }}
                    className="px-3 py-1.5 bg-violet/20 hover:bg-violet/30 border border-violet/30 hover:border-violet/40 text-violet text-[10px] font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Use Linked Repo
                  </button>
                </div>
              )}

              {/* Option A: GitHub Link */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block font-display">Option A: Submit from GitHub</label>
                  <span className="text-[9px] text-accent font-medium uppercase">Pre-fills from Connected Repository</span>
                </div>
                
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                  <FaGithub size={14} className="text-muted" />
                  <input
                    type="url"
                    placeholder="https://github.com/yourusername/reponame"
                    value={githubUrl}
                    onChange={(e) => {
                      setGithubUrl(e.target.value)
                      if (e.target.value) {
                        setSelectedFile(null)
                        setFileName('')
                      }
                    }}
                    className="w-full bg-transparent text-xs text-text outline-none border-none"
                  />
                </div>

                {githubUrl && (
                  <div className="grid grid-cols-2 gap-4 pt-1.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Target Branch</label>
                      <input
                        type="text"
                        placeholder="main"
                        value={githubBranch}
                        onChange={(e) => setGithubBranch(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-void/50 focus:border-accent outline-none text-xs text-text transition-colors font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Commit Hash (Optional)</label>
                      <input
                        type="text"
                        placeholder="a1b2c3d4..."
                        value={githubCommitHash}
                        onChange={(e) => setGithubCommitHash(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-void/50 focus:border-accent outline-none text-xs text-text transition-colors font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* OR Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border/60"></div>
                <span className="flex-shrink mx-4 text-[10px] text-muted font-bold uppercase tracking-widest">OR</span>
                <div className="flex-grow border-t border-border/60"></div>
              </div>

              {/* Option B: Zip Upload */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Option B: Upload ZIP Archive</label>
                  <span className="text-[9px] text-accent font-medium uppercase">Mandatory if no GitHub URL</span>
                </div>
                <div
                  onClick={handleZipClick}
                  className="border border-dashed border-border hover:border-accent/40 bg-void/30 p-5 rounded-xl text-center space-y-2 cursor-pointer group transition-colors"
                >
                  <UploadCloud size={20} className="text-muted group-hover:text-accent mx-auto transition-colors" />
                  <span className="text-[10px] text-text font-bold block">Upload ZIP Archive</span>
                  <span className="text-[8px] text-muted block">Max file size: 50MB</span>
                </div>
              </div>

              {selectedFile && (
                <div className="p-3 bg-accent/10 border border-accent/20 rounded-xl text-xs flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-text block">Selected ZIP Archive:</span>
                    <span className="text-[10px] text-muted font-mono">{fileName} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); setFileName(''); }}
                    className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg hover:shadow-accent/20 transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting Deliverable...</span>
                </>
              ) : (
                <>
                  <span>{githubUrl ? 'Submit From GitHub' : 'Transmit Deliverable'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
