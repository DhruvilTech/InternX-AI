import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Play, Send, Award, HelpCircle, ShieldAlert, Sparkles, RefreshCw, BarChart2 } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'

const interviewQuestions = [
  'How does cosine distance differ from dot product in high-dimensional vector index spaces?',
  'Explain RAG architecture and how you would mitigate generation hallucinations.',
  'What configurations would you prioritize to optimize sentence-transformers fine-tuning memory footprints?',
  'Explain standard authentication token rotation loops and redis cache setups.'
]

const initialHistory = [
  { question: 'What is vector indexing?', score: 84, tech: 82, comm: 86, date: '3 days ago' },
  { question: 'Explain FastAPI async routes', score: 90, tech: 92, comm: 88, date: '1 week ago' }
]

export default function InterviewSimulatorPage() {
  const { addToast } = useNavigation()
  const [qIndex, setQIndex] = useState(0)
  const [recording, setRecording] = useState(false)
  const [answerText, setAnswerText] = useState('')
  const [history, setHistory] = useState(initialHistory)
  
  // Waveform bars simulation helper
  const [waveBars, setWaveBars] = useState(new Array(15).fill(4))

  // Live score results
  const [showResults, setShowResults] = useState(false)
  const [scores, setScores] = useState({ confidence: 78, technical: 82, communication: 80, overall: 80 })

  useEffect(() => {
    let interval
    if (recording) {
      interval = setInterval(() => {
        setWaveBars(prev => prev.map(() => Math.floor(Math.random() * 24) + 4))
      }, 100)
    } else {
      setWaveBars(new Array(15).fill(4))
    }
    return () => clearInterval(interval)
  }, [recording])

  const handleMicToggle = () => {
    if (!recording) {
      setRecording(true)
      addToast('Microphone recording initialized... Speak your response.', 'info')
    } else {
      setRecording(false)
      setAnswerText('In high-dimensional spaces, cosine distance normalizes the vector lengths, meaning it only evaluates the direction of the vector queries rather than their scale, whereas dot product depends directly on the magnitude of the vectors.')
      addToast('Recording finalized. Text transcribed.', 'success')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!answerText.trim()) {
      addToast('Please record a voice reply or type an answer.', 'error')
      return
    }

    addToast('Evaluating response parameters...', 'info')
    setShowResults(false)

    setTimeout(() => {
      // Generate scores
      const newScores = {
        confidence: Math.floor(Math.random() * 15) + 80,
        technical: Math.floor(Math.random() * 15) + 82,
        communication: Math.floor(Math.random() * 15) + 80,
        overall: 0
      }
      newScores.overall = Math.round((newScores.confidence + newScores.technical + newScores.communication) / 3)
      setScores(newScores)
      setShowResults(true)

      // Add to history
      const newHistoryItem = {
        question: interviewQuestions[qIndex],
        score: newScores.overall,
        tech: newScores.technical,
        comm: newScores.communication,
        date: 'Just now'
      }
      setHistory(prev => [newHistoryItem, ...prev])
      addToast('Answer scored successfully!', 'success')
    }, 1500)
  }

  const handleNextQuestion = () => {
    setQIndex((prev) => (prev + 1) % interviewQuestions.length)
    setAnswerText('')
    setShowResults(false)
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 space-y-8 relative z-10">
        
        {/* Title */}
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em] block">Interview readiness</span>
          <h2 className="font-display font-bold text-3xl mt-1">AI Interview Simulator</h2>
          <p className="text-xs text-muted mt-1">Practice voice-driven mock interviews and get metric-based scores.</p>
        </div>

        {/* Dash split */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Interview Panel */}
          <div className="lg:col-span-8 glass border border-border rounded-2xl p-6 bg-void/25 flex flex-col justify-between min-h-[440px] space-y-6">
            
            {/* Question Box */}
            <div className="p-5 rounded-xl border border-border bg-void/60 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-2">
                <HelpCircle size={16} className="text-accent" />
                <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">AI Interviewer Question {qIndex+1}</span>
              </div>
              <p className="font-display font-bold text-base leading-snug">{interviewQuestions[qIndex]}</p>
            </div>

            {/* Answer & Waveform console */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-void/40 border border-border rounded-xl p-4 min-h-[80px]">
                <div className="flex-1">
                  {recording ? (
                    <div className="flex items-center gap-1.5 h-6">
                      {waveBars.map((h, i) => (
                        <motion.span
                          key={i}
                          className="w-1 bg-accent rounded-full"
                          style={{ height: h }}
                          animate={{ height: h }}
                        />
                      ))}
                      <span className="text-[10px] text-accent font-semibold ml-4 animate-pulse uppercase tracking-wider">Listening...</span>
                    </div>
                  ) : answerText ? (
                    <p className="text-xs text-muted leading-relaxed">{answerText}</p>
                  ) : (
                    <span className="text-xs text-dim italic">Record your answer or type inside the input below...</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleMicToggle}
                  className={`h-11 w-11 rounded-full flex items-center justify-center border transition-all shrink-0 ml-4 cursor-pointer ${
                    recording
                      ? 'bg-rose/10 border-rose text-rose shadow-lg shadow-rose/10'
                      : 'bg-accent/15 border-accent text-accent hover:bg-accent/25'
                  }`}
                >
                  {recording ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              </div>

              {/* Textarea override */}
              <textarea
                rows={3}
                placeholder="Type your response here if microphone is not available..."
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                className="w-full bg-void/50 border border-border focus:border-accent text-xs rounded-xl py-2.5 px-3 outline-none text-text resize-none"
              />
            </div>

            {/* Submit Action */}
            <div className="flex justify-between items-center border-t border-border pt-4">
              <button
                onClick={handleNextQuestion}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-border rounded-xl text-xs text-muted hover:text-text hover:bg-surface-muted/10 transition-colors"
              >
                <RefreshCw size={13} />
                <span>Next Question</span>
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2.5 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Submit Response
              </button>
            </div>

          </div>

          {/* Scores & Feedback side */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live scores */}
            <div className="glass border border-border rounded-2xl p-5 bg-void/25 min-h-[220px] flex flex-col justify-center">
              {showResults ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-5"
                >
                  <div className="text-center">
                    <span className="text-[10px] text-muted uppercase tracking-wider block">Assessment Overall Score</span>
                    <span className="text-3xl font-display font-bold text-gradient-violet mt-1 block">
                      {scores.overall}<span className="text-sm font-normal text-muted">/100</span>
                    </span>
                  </div>

                  <div className="space-y-3.5 text-xs text-muted">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Confidence & Pitch</span>
                        <span className="font-semibold text-text">{scores.confidence}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden border border-border">
                        <div className="h-full bg-accent" style={{ width: `${scores.confidence}%` }} />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Technical Accuracy</span>
                        <span className="font-semibold text-text">{scores.technical}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden border border-border">
                        <div className="h-full bg-violet" style={{ width: `${scores.technical}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Communication Pitch</span>
                        <span className="font-semibold text-text">{scores.communication}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden border border-border">
                        <div className="h-full bg-emerald-500" style={{ width: `${scores.communication}%` }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center space-y-2.5 py-6">
                  <div className="p-3 bg-surface-muted border border-border rounded-full text-dim inline-block">
                    <BarChart2 size={22} />
                  </div>
                  <p className="text-xs text-muted">Submit your answer to see live AI scores and feedback audits.</p>
                </div>
              )}
            </div>

            {/* History logs */}
            <div className="glass border border-border rounded-2xl p-5 bg-void/25 space-y-3">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">Practice History Logs</h4>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className="p-3 bg-surface-muted/20 border border-border rounded-xl flex items-center justify-between text-[10px]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-text truncate pr-2">{h.question}</p>
                      <span className="text-[8px] text-muted block mt-0.5">{h.date}</span>
                    </div>
                    <span className="text-accent font-bold shrink-0">{h.score}/100</span>
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
