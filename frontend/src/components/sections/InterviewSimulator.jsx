import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Brain, MessageSquare, Code2, Volume2 } from 'lucide-react'
import PulseDot from '../ui/PulseDot'
import ScoreRing from '../ui/ScoreRing'

const questions = [
  'Tell me about a challenging project you worked on recently.',
  'How would you design a scalable ML inference pipeline?',
  'Describe a time you had to debug a production issue.',
]

const scores = [
  { label: 'Confidence', value: 87, color: 'accent' },
  { label: 'Communication', value: 92, color: 'cyan' },
  { label: 'Technical', value: 85, color: 'violet' },
]

export default function InterviewSimulator() {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(true)
  const [waveform, setWaveform] = useState(Array(24).fill(0.3))

  useEffect(() => {
    const qInterval = setInterval(() => {
      setQuestionIndex((i) => (i + 1) % questions.length)
    }, 5000)
    return () => clearInterval(qInterval)
  }, [])

  useEffect(() => {
    const wInterval = setInterval(() => {
      setWaveform(Array.from({ length: 24 }, () => 0.2 + Math.random() * 0.8))
      setIsSpeaking((s) => !s)
    }, 150)
    return () => clearInterval(wInterval)
  }, [])

  return (
    <section id="interview" className="relative py-32 bg-deep overflow-hidden">


      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold text-cyan uppercase tracking-[0.2em] mb-3">
            Interview Simulator
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold">
            Practice with AI. Perform with confidence.
          </h2>
        </motion.div>

        <div className="glass-bright rounded-2xl glow-accent">
          <div className="grid lg:grid-cols-5">
            {/* Interviewer */}
            <div className="lg:col-span-2 p-8 border-r border-border flex flex-col items-center justify-center bg-void/30">
              <motion.div
                animate={{ scale: isSpeaking ? [1, 1.02, 1] : 1 }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="relative mb-6"
              >
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-accent to-violet flex items-center justify-center glow-accent">
                  <Brain size={40} className="text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald border-2 border-deep flex items-center justify-center">
                  <PulseDot color="emerald" size={8} />
                </div>
              </motion.div>
              <p className="font-display text-lg font-semibold mb-1">AI Interviewer</p>
              <p className="text-xs text-muted mb-6">Senior Engineering Lead · NeuralMind</p>

              {/* Waveform */}
              <div className="flex items-end gap-1 h-12 w-full max-w-[200px]">
                {waveform.map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: `${h * 100}%` }}
                    transition={{ duration: 0.1 }}
                    className="flex-1 bg-gradient-to-t from-accent to-cyan rounded-full min-h-[4px]"
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs text-muted">
                <Volume2 size={12} />
                <span>Live voice analysis</span>
              </div>
            </div>

            {/* Question feed + scores */}
            <div className="lg:col-span-3 p-8 flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare size={14} className="text-muted" />
                <span className="text-xs text-muted uppercase tracking-wider">Question Feed</span>
                <Mic size={14} className="text-rose ml-auto animate-pulse" />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={questionIndex}
                  initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
                  className="flex-1"
                >
                  <p className="text-lg sm:text-xl font-medium leading-relaxed mb-8">
                    &ldquo;{questions[questionIndex]}&rdquo;
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="grid grid-cols-3 gap-4 mt-auto">
                {scores.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glass rounded-xl p-4 text-center"
                  >
                    <ScoreRing score={s.value} size={72} strokeWidth={4} />
                    <p className="text-[10px] text-dim mt-2 uppercase tracking-wider font-medium">{s.label}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="mt-6 p-4 rounded-xl border border-emerald/20 bg-emerald/5 flex items-center gap-3"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Code2 size={16} className="text-emerald" />
                <p className="text-sm text-muted">
                  Live evaluation: Strong technical depth detected. Consider adding more specific metrics.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
