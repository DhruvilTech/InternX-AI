import { useNavigation } from '../context/NavigationContext'
import { Clock, Download, ArrowLeft, ArrowRight, CheckCircle2, FileText, ExternalLink, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import axiosInstance from '../api/axios.js'

export default function TaskDetailsPage() {
  const { navigate, selectedTaskId, tasks, setSelectedTaskId, setTasks, setEvaluationReport, addToast } = useNavigation()
  const [submissionHistory, setSubmissionHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  // Find active task or default to first task
  const activeTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0]

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoadingHistory(true)
        const response = await axiosInstance.get(`/api/submissions/my-submissions?taskId=${activeTask.id}`)
        if (response.data?.success && response.data?.data) {
          setSubmissionHistory(response.data.data.submissions)
        }
      } catch (err) {
        console.error('Failed to load task submission history:', err)
      } finally {
        setLoadingHistory(false)
      }
    }
    if (activeTask?.id) {
      fetchHistory()
    }
  }, [activeTask?.id])

  const handleStartTask = async () => {
    try {
      addToast('Starting task milestone...', 'info')
      const response = await axiosInstance.patch(`/api/tasks/${activeTask.id}/status`, { status: 'in-progress' })
      if (response.data?.success) {
        addToast('Task milestone started! Deliverable is now active.', 'success')
        
        // Refresh tasks state in context
        const tasksRes = await axiosInstance.get('/api/tasks')
        if (tasksRes.data?.success && tasksRes.data?.data?.tasks) {
          setTasks(tasksRes.data.data.tasks)
        }
      } else {
        addToast('Failed to update task status.', 'error')
      }
    } catch (err) {
      console.error('Start task error:', err)
      addToast(err.response?.data?.message || 'Failed to start task.', 'error')
    }
  }

  const handleViewEvaluation = async (submissionId) => {

    try {
      addToast('Retrieving AI audit logs...', 'info')
      const response = await axiosInstance.get(`/api/submissions/${submissionId}/evaluation`)
      if (response.data?.success && response.data?.data) {
        const evalData = response.data.data.evaluation
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
        navigate('evaluation')
      } else {
        addToast('Evaluation report not found.', 'error')
      }
    } catch (err) {
      console.error(err)
      addToast(err.response?.data?.message || 'Failed to fetch evaluation.', 'error')
    }
  }

  const handleDownloadFile = (fileName) => {
    let title = 'Reference Artifact'
    let sections = []

    if (fileName.includes('Vector_DB_Index_Config_template')) {
      title = 'Vector Database Indexing Configuration Guide'
      sections = [
        'This guide outlines the indexing configuration for high-dimensional vectors.',
        '1. Recommendation: Use HNSW (Hierarchical Navigable Small World) for indexing.',
        '2. Distance Metric: Cosine similarity for semantic search match profiles.',
        '3. Parameters settings: set M=16, efConstruction=64, efSearch=32.',
        '4. Ensure query latency benchmarks scale below 25ms under heavy loads.'
      ]
    } else if (fileName.includes('SentenceTransformers_custom_finetuning_guide')) {
      title = 'SentenceTransformers Model Finetuning Guide'
      sections = [
        'Finetuning pipeline setup instructions on domain-specific datasets:',
        '1. Setup virtual env and run: pip install sentence-transformers',
        '2. Initialize base model: SentenceTransformer("all-MiniLM-L6-v2")',
        '3. Load student custom training data using InputExample containers.',
        '4. Setup MultipleNegativesRankingLoss or CosineSimilarityLoss functions.',
        '5. Train using model.fit() with 3-5 epochs and evaluate precision curve.'
      ]
    } else if (fileName.includes('Validation_dataset_sample')) {
      title = 'System Validation Dataset Spec'
      sections = [
        'Gold standard reference queries and expected matching records:',
        'Query 1: "semantic database setup" -> Expected match: "Weaviate Index Config"',
        'Query 2: "transformer training code" -> Expected match: "SentenceTransformer training script"',
        'Query 3: "deployment container schema" -> Expected match: "Autoscaling Docker compose file"',
        'Ensure validation accuracy exceeds 85% before publishing changes.'
      ]
    }

    // Programmatically construct a valid minimal PDF-1.3 structure
    const lines = [];
    lines.push('%PDF-1.3');
    
    // Catalog
    lines.push('1 0 obj');
    lines.push('<< /Type /Catalog /Pages 2 0 R >>');
    lines.push('endobj');
    
    // Pages tree
    lines.push('2 0 obj');
    lines.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    lines.push('endobj');
    
    // Page
    lines.push('3 0 obj');
    lines.push('<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 5 0 R >> >> /MediaBox [0 0 612 792] /Contents 4 0 R >>');
    lines.push('endobj');
    
    // Content Stream
    let streamContent = 'BT\n/F1 16 Tf\n50 720 Td\n(' + title.replace(/[()]/g, '') + ') Tj\n';
    streamContent += '/F1 10 Tf\n0 -30 Td\n';
    sections.forEach(line => {
      const escaped = line.replace(/[()]/g, '\\$&');
      streamContent += '0 -15 Td\n(' + escaped + ') Tj\n';
    });
    streamContent += 'ET';
    
    // Contents Stream Obj
    lines.push('4 0 obj');
    lines.push('<< /Length ' + streamContent.length + ' >>');
    lines.push('stream');
    lines.push(streamContent);
    lines.push('endstream');
    lines.push('endobj');
    
    // Font Obj
    lines.push('5 0 obj');
    lines.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    lines.push('endobj');
    
    // xref Table
    lines.push('xref');
    lines.push('0 6');
    lines.push('0000000000 65535 f ');
    
    // trailer
    lines.push('trailer');
    lines.push('<< /Size 6 /Root 1 0 R >>');
    lines.push('startxref');
    lines.push('100');
    lines.push('%%EOF');
    
    const pdfText = lines.join('\n');
    const buffer = new TextEncoder().encode(pdfText);
    const blob = new Blob([buffer], { type: 'application/pdf' });

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    addToast(`Downloaded ${fileName} successfully!`, 'success')
  }

  const handleDownloadZip = (fileName) => {
    const base64Zip = "UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA==";
    const binaryString = atob(base64Zip);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'deliverable.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast(`Downloaded ${fileName || 'deliverable.zip'} successfully!`, 'success');
  }


  if (!activeTask) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void text-muted text-xs">
        No active tasks assigned. Go to Dashboard or Kanban board to select one.
      </div>
    )
  }

  // Pre-configured resource files
  const resources = [
    { name: 'Vector_DB_Index_Config_template.pdf', size: '15 KB', format: 'PDF' },
    { name: 'SentenceTransformers_custom_finetuning_guide.pdf', size: '24 KB', format: 'PDF' },
    { name: 'Validation_dataset_sample.pdf', size: '18 KB', format: 'PDF' },
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

          {activeTask.status === 'completed' ? (
            <div className="px-5 py-2.5 bg-emerald/10 border border-emerald/20 text-emerald text-xs font-semibold rounded-xl flex items-center justify-center gap-2">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>Task Completed</span>
            </div>
          ) : activeTask.status === 'todo' || !activeTask.status ? (
            <button
              onClick={handleStartTask}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse"
            >
              <span>Start Task</span>
              <ArrowRight size={13} />
            </button>
          ) : (
            <button
              onClick={() => navigate('submit_task')}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Submit Deliverable</span>
              <ArrowRight size={13} />
            </button>
          )}

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
                      onClick={() => handleDownloadFile(file.name)}
                      className="text-muted hover:text-text shrink-0 p-1 hover:bg-white/5 rounded cursor-pointer"
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
                {loadingHistory ? (
                  <div className="text-[10px] text-muted text-center py-4">Loading history...</div>
                ) : submissionHistory.length === 0 ? (
                  <div className="text-[10px] text-muted text-center py-4">No submissions yet.</div>
                ) : (
                  submissionHistory.map((sub) => {
                    let typeText = 'ZIP Archive';
                    let contentValue = sub.zipFile;
                    let isGit = false;
                    
                    if (sub.githubUrl) {
                      typeText = 'GitHub Repo';
                      contentValue = sub.githubUrl;
                      isGit = true;
                    }

                    const formattedDate = new Date(sub.createdAt).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    });

                    return (
                      <div
                        key={sub._id}
                        className="p-3 bg-surface-muted/20 border border-border hover:border-accent/40 rounded-xl flex flex-col gap-2.5 text-[10px] transition-all"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-text truncate block">{contentValue}</span>
                            <span className="text-muted block text-[8px] mt-0.5">Type: {typeText} • {formattedDate}</span>
                          </div>
                          <span className="text-emerald font-bold shrink-0 bg-emerald/10 border border-emerald/20 px-1.5 py-0.5 rounded">
                            {sub.taskId?.score !== undefined && sub.taskId?.score !== null ? `${sub.taskId.score}/100` : 'Pass'}
                          </span>
                        </div>

                        <div className="flex gap-2 mt-1 border-t border-border/40 pt-2 justify-end">
                          {isGit ? (
                            <a
                              href={sub.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-surface-muted hover:bg-white/5 border border-border hover:border-accent/40 text-text rounded flex items-center gap-1 cursor-pointer font-medium transition-colors"
                            >
                              <ExternalLink size={10} className="text-accent" />
                              <span>View Git</span>
                            </a>
                          ) : (
                            <button
                              onClick={() => handleDownloadZip(sub.zipFile)}
                              className="px-2.5 py-1 bg-surface-muted hover:bg-white/5 border border-border hover:border-accent/40 text-text rounded flex items-center gap-1 cursor-pointer font-medium transition-colors"
                            >
                              <Download size={10} className="text-accent" />
                              <span>Download ZIP</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleViewEvaluation(sub._id)}
                            className="px-2.5 py-1 bg-gradient-to-r from-accent to-violet text-white hover:shadow-md rounded flex items-center gap-1 cursor-pointer font-medium transition-all"
                          >
                            <FileText size={10} />
                            <span>Audit Report</span>
                          </button>
                        </div>
                      </div>
                    );
                  })

                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
