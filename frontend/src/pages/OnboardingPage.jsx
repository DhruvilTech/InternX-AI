import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, GraduationCap, Code, Compass, Target, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'

const steps = [
  { id: 1, label: 'Profile', icon: User },
  { id: 2, label: 'Education', icon: GraduationCap },
  { id: 3, label: 'Skills', icon: Code },
  { id: 4, label: 'Interests', icon: Compass },
  { id: 5, label: 'Goals', icon: Target },
]

export default function OnboardingPage() {
  const { navigate, onboardingStep, setOnboardingStep, onboardingData, setOnboardingData, addToast } = useNavigation()
  const [completeAnim, setCompleteAnim] = useState(false)

  const handleNext = () => {
    if (onboardingStep < 5) {
      setOnboardingStep(onboardingStep + 1)
    } else {
      setCompleteAnim(true)
      setTimeout(() => {
        addToast('Profile built successfully!', 'success')
        navigate('career_selection')
        setOnboardingStep(1) // reset step for next time
      }, 2000)
    }
  }

  const handleBack = () => {
    if (onboardingStep > 1) {
      setOnboardingStep(onboardingStep - 1)
    }
  }

  // Pre-configured options
  const skillOptions = ['React JS', 'Node JS', 'Python', 'Vector Databases', 'Framer Motion', 'PyTorch', 'Data Structures', 'Tailwind CSS', 'Figma', 'System Design']
  const interestOptions = ['Artificial Intelligence', 'Full Stack Development', 'Product Design (UI/UX)', 'Data Science & Big Data', 'Cybersecurity Ops', 'Backend Scale Systems']
  const goalOptions = ['Secure an AI-driven internship', 'Earn professional project certificates', 'Get discovered by recruitment channels', 'Practice full-scale systems code architecture']

  const toggleSkill = (skill) => {
    const active = onboardingData.skills.includes(skill)
    setOnboardingData(prev => ({
      ...prev,
      skills: active ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill]
    }))
  }

  const toggleInterest = (interest) => {
    const active = onboardingData.interests.includes(interest)
    setOnboardingData(prev => ({
      ...prev,
      interests: active ? prev.interests.filter(i => i !== interest) : [...prev.interests, interest]
    }))
  }

  const toggleGoal = (goal) => {
    const active = onboardingData.goals.includes(goal)
    setOnboardingData(prev => ({
      ...prev,
      goals: active ? prev.goals.filter(g => g !== goal) : [...prev.goals, goal]
    }))
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden bg-void">
      {/* Background radial spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-2xl glass-bright rounded-2xl border border-border glow-accent p-6 sm:p-10 relative overflow-hidden">
        
        {completeAnim ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 space-y-6"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mx-auto w-16 h-16 rounded-full bg-emerald/10 border border-emerald/20 text-emerald flex items-center justify-center"
            >
              <CheckCircle2 size={32} />
            </motion.div>
            <h3 className="font-display text-3xl font-bold text-gradient">Architecting Profile...</h3>
            <p className="text-sm text-muted max-w-sm mx-auto">
              Simulating placement matches and preparing personalized curriculum matrices. Redirecting to career selection pathways...
            </p>
          </motion.div>
        ) : (
          <>
            {/* Header progress bar */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-[10px] text-accent uppercase tracking-widest font-semibold">Step {onboardingStep} of 5</span>
                  <h3 className="font-display text-xl font-bold text-text mt-1">{steps[onboardingStep-1].label} Setup</h3>
                </div>
                <div className="flex gap-1.5">
                  {steps.map((s) => {
                    const isPassed = s.id < onboardingStep
                    const isActive = s.id === onboardingStep
                    return (
                      <div
                        key={s.id}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          isPassed ? 'w-6 bg-accent' : isActive ? 'w-8 bg-violet' : 'w-3 bg-surface-muted border border-border'
                        }`}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Step indicator circle headers */}
              <div className="flex justify-between items-center bg-void/50 border border-border rounded-xl p-3 sm:px-6">
                {steps.map((s) => {
                  const StepIcon = s.icon
                  const isPassed = s.id < onboardingStep
                  const isActive = s.id === onboardingStep
                  return (
                    <div key={s.id} className="flex flex-col items-center gap-1">
                      <div
                        className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-all ${
                          isPassed
                            ? 'bg-accent/15 border-accent text-accent'
                            : isActive
                            ? 'bg-violet/25 border-violet text-white shadow-lg shadow-violet/10'
                            : 'bg-surface-muted/50 border-border text-dim'
                        }`}
                      >
                        <StepIcon size={16} />
                      </div>
                      <span className={`text-[9px] uppercase tracking-wider ${isActive ? 'text-text font-semibold' : 'text-dim'}`}>
                        {s.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Steps views */}
            <div className="min-h-[220px] mb-8">
              <AnimatePresence mode="wait">
                {onboardingStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">Preferred Name</label>
                      <input
                        type="text"
                        placeholder="Arjun Kapoor"
                        value={onboardingData.name}
                        onChange={(e) => setOnboardingData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-void/50 border border-border focus:border-accent text-xs rounded-xl py-2.5 px-3 outline-none text-text"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">Bio / Persona Summary</label>
                      <textarea
                        rows={3}
                        placeholder="AI enthusiast specializing in NLP systems and vector indexes. Passionate about machine learning..."
                        className="w-full bg-void/50 border border-border focus:border-accent text-xs rounded-xl py-2.5 px-3 outline-none text-text resize-none"
                      />
                    </div>
                  </motion.div>
                )}

                {onboardingStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">University / College Name</label>
                      <input
                        type="text"
                        placeholder="Massachusetts Institute of Technology"
                        value={onboardingData.education}
                        onChange={(e) => setOnboardingData(prev => ({ ...prev, education: e.target.value }))}
                        className="w-full bg-void/50 border border-border focus:border-accent text-xs rounded-xl py-2.5 px-3 outline-none text-text"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">Degree Major</label>
                        <input
                          type="text"
                          placeholder="Computer Science"
                          className="w-full bg-void/50 border border-border focus:border-accent text-xs rounded-xl py-2.5 px-3 outline-none text-text"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">Expected Graduation</label>
                        <input
                          type="text"
                          placeholder="June 2027"
                          className="w-full bg-void/50 border border-border focus:border-accent text-xs rounded-xl py-2.5 px-3 outline-none text-text"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {onboardingStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Tag Your Tech Stack</span>
                    <div className="flex flex-wrap gap-2">
                      {skillOptions.map((s) => {
                        const active = onboardingData.skills.includes(s)
                        return (
                          <button
                            key={s}
                            onClick={() => toggleSkill(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                              active
                                ? 'bg-accent/25 border-accent text-white font-medium'
                                : 'bg-void/40 border-border text-muted hover:border-border-strong'
                            }`}
                          >
                            {s}
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {onboardingStep === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Choose Careers Tracks</span>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {interestOptions.map((interest) => {
                        const active = onboardingData.interests.includes(interest)
                        return (
                          <button
                            key={interest}
                            onClick={() => toggleInterest(interest)}
                            className={`p-3 rounded-xl text-left text-xs transition-all border ${
                              active
                                ? 'bg-violet/15 border-violet text-white font-medium'
                                : 'bg-void/40 border-border text-muted hover:border-border-strong hover:bg-void/60'
                            }`}
                          >
                            {interest}
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {onboardingStep === 5 && (
                  <motion.div
                    key="step-5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Identify Key Milestone Goals</span>
                    <div className="space-y-2">
                      {goalOptions.map((g) => {
                        const active = onboardingData.goals.includes(g)
                        return (
                          <button
                            key={g}
                            onClick={() => toggleGoal(g)}
                            className={`w-full p-3 rounded-xl text-left text-xs transition-all border flex items-center gap-3 ${
                              active
                                ? 'bg-accent/15 border-accent text-white font-medium'
                                : 'bg-void/40 border-border text-muted hover:border-border-strong'
                            }`}
                          >
                            <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${active ? 'bg-accent border-accent text-white' : 'border-dim'}`}>
                              {active && <CheckCircle2 size={12} className="text-white" />}
                            </div>
                            <span>{g}</span>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between border-t border-border pt-6 mt-6">
              <button
                disabled={onboardingStep === 1}
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-border text-muted hover:text-text hover:border-border-strong disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold shadow-lg shadow-accent/20 cursor-pointer"
              >
                <span>{onboardingStep === 5 ? 'Create Profile' : 'Next Step'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
