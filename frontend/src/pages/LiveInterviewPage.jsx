import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  ArrowRight,
  Clock,
  Sparkles,
  HelpCircle,
  Brain,
  CheckCircle,
  AlertTriangle,
  Send,
  Loader
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext.jsx';
import { getInterviewDetails, getCurrentQuestion, submitAnswer, completeInterview } from '../api/interviewApi.js';

export default function LiveInterviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useNavigation();

  // Interview state
  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  // Voice & recognition state
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [typedAnswer, setTypedAnswer] = useState('');
  
  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(0);

  // Visual waves state
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [waveBars, setWaveBars] = useState(new Array(20).fill(6));

  // Refs for speech
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  const currentUtteranceRef = useRef(null);
  const waveIntervalRef = useRef(null);

  // Fetch initial details
  useEffect(() => {
    fetchInterviewDetails();
    
    // Global duration timer
    const globalTimer = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);

    // Question duration timer
    const qTimer = setInterval(() => {
      setQuestionTimer(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(globalTimer);
      clearInterval(qTimer);
      stopSpeaking();
      stopListening();
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    };
  }, [id]);

  // Handle avatar speaking visual wave simulation
  useEffect(() => {
    if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    
    if (isAvatarSpeaking) {
      waveIntervalRef.current = setInterval(() => {
        setWaveBars(prev => prev.map(() => Math.floor(Math.random() * 32) + 6));
      }, 80);
    } else if (isListening) {
      waveIntervalRef.current = setInterval(() => {
        setWaveBars(prev => prev.map(() => Math.floor(Math.random() * 18) + 6));
      }, 100);
    } else {
      setWaveBars(new Array(20).fill(6));
    }

    return () => {
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    };
  }, [isAvatarSpeaking, isListening]);

  const fetchInterviewDetails = async () => {
    try {
      setLoading(true);
      const res = await getInterviewDetails(id);
      if (res.success) {
        setInterview(res.data.interview);
        setTotalQuestions(res.data.interview.totalQuestions || 10);
        await loadQuestion(res.data.interview.currentQuestionIndex);
      }
    } catch (err) {
      console.error('Failed to load interview:', err);
      addToast('Failed to fetch interview session metadata.', 'error');
      navigate('/dashboard/interview');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestion = async (idx) => {
    try {
      setTranscript('');
      setTypedAnswer('');
      setQuestionTimer(0);
      
      const res = await getCurrentQuestion(id);
      if (res.success && res.data?.question) {
        setCurrentQuestion(res.data.question);
        setQuestionIndex(res.data.currentQuestionIndex);
        
        // Narration trigger after a short delay to allow component to render
        setTimeout(() => {
          speakQuestion(res.data.question.question);
        }, 600);
      } else {
        // No more questions -> complete
        handleCompleteInterview();
      }
    } catch (err) {
      console.error('Failed to get current question:', err);
      addToast('Error loading next question.', 'error');
    }
  };

  // TTS implementation
  const speakQuestion = (text) => {
    stopSpeaking();
    if (isMuted) return;

    if ('speechSynthesis' in window) {
      setIsAvatarSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to find a high quality English voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || 
                              voices.find(v => v.lang.startsWith('en')) || 
                              voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
      
      utterance.rate = 0.95; // Speaking pace
      utterance.pitch = 1.05;

      utterance.onend = () => {
        setIsAvatarSpeaking(false);
        // Automatically trigger listener after question ends
        startVoiceRecognition();
      };

      utterance.onerror = () => {
        setIsAvatarSpeaking(false);
      };

      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAvatarSpeaking(false);
  };

  // Voice STT recognition implementation
  const startVoiceRecognition = () => {
    stopListening();
    stopSpeaking();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast('Web Speech Recognition not supported in this browser. Please type your response.', 'warning');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(prev => (prev + ' ' + finalTranscript).trim());
      }
    };

    rec.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setIsListening(false);
      }
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
      addToast('Voice recognition paused.', 'info');
    } else {
      startVoiceRecognition();
      addToast('Recording initialized... Speak clearly into your mic.', 'info');
    }
  };

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      stopSpeaking();
    } else if (currentQuestion) {
      speakQuestion(currentQuestion.question);
    }
  };

  const handleNextSubmit = async (e) => {
    if (e) e.preventDefault();
    stopSpeaking();
    stopListening();

    const finalAnswer = (transcript + '\n' + typedAnswer).trim();
    if (!finalAnswer) {
      addToast('Please provide an answer either via speech or by typing.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitAnswer(id, {
        questionId: currentQuestion._id,
        answer: finalAnswer,
        transcript: transcript,
        duration: questionTimer
      });

      if (res.success) {
        if (res.data.isFinished || questionIndex + 1 >= totalQuestions) {
          await handleCompleteInterview();
        } else {
          await loadQuestion(res.data.currentQuestionIndex);
        }
      }
    } catch (err) {
      console.error('Error saving answer:', err);
      addToast('Failed to save answer.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteInterview = async () => {
    try {
      setEvaluating(true);
      stopSpeaking();
      stopListening();
      addToast('Submitting final assessment logs to AI Panel...', 'info');
      
      const res = await completeInterview(id);
      if (res.success && res.data?.report) {
        addToast('Evaluation report compiled successfully!', 'success');
        navigate(`/interview/report/${id}`);
      }
    } catch (err) {
      console.error('Error completing interview:', err);
      addToast('Failed to compile review report. Please try again.', 'error');
      setEvaluating(false);
    }
  };

  const formatTime = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-accent animate-spin" />
            <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-violet animate-spin-reverse" />
          </div>
          <p className="text-xs text-muted font-mono tracking-wider">PREPARING SIMULATOR PORTAL...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background glow layers */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Evaluating/Loading screen */}
      <AnimatePresence>
        {evaluating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-void/90 z-50 flex items-center justify-center backdrop-blur-md"
          >
            <div className="max-w-md text-center space-y-6 p-6">
              <div className="relative w-24 h-24 mx-auto">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-4 border-dashed border-accent border-t-transparent"
                />
                <Brain className="absolute inset-0 m-auto text-accent animate-pulse" size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-bold text-xl text-white flex items-center justify-center gap-2">
                  <Sparkles className="text-accent" size={18} />
                  Evaluating Performance Logs
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Sarah Johnson and the AI Evaluation board are analyzing your speech delivery, confidence level, vocabulary fit, and technical precision parameters. This takes about 5-10 seconds...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 space-y-8">
        
        {/* Top bar indicators */}
        <div className="flex justify-between items-center border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 border border-accent/20 rounded-xl">
              <Brain className="text-accent" size={16} />
            </div>
            <div>
              <span className="text-[9px] text-muted uppercase tracking-wider block">Active Session (ID: {id.slice(-6)})</span>
              <h2 className="text-sm font-bold text-text">{interview?.careerPath} Track</h2>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-muted font-mono">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-accent" />
              <span>Elapsed: {formatTime(timerSeconds)}</span>
            </div>
            <div className="px-2.5 py-1 bg-surface-muted/20 border border-border/80 rounded-lg text-text">
              Q: {questionIndex + 1} / {totalQuestions}
            </div>
          </div>
        </div>

        {/* Console layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left panel: Sarah Johnson Avatar & Question Box */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            
            {/* AI Interviewer Avatar Card */}
            <div className="glass border border-border/80 rounded-2xl p-6 bg-void/25 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden h-[240px]">
              <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full blur-xl pointer-events-none" />
              
              {/* Avatar picture mockup */}
              <div className="relative">
                <div className={`w-24 h-24 rounded-full bg-gradient-to-tr from-accent to-violet p-1 flex items-center justify-center relative overflow-hidden transition-all ${
                  isAvatarSpeaking ? 'ring-4 ring-accent/30 scale-105' : 'ring-2 ring-border'
                }`}>
                  <div className="w-full h-full bg-void rounded-full flex items-center justify-center overflow-hidden">
                    <span className="font-display font-extrabold text-2xl text-gradient-violet">SJ</span>
                  </div>
                </div>
                {/* Active indicator */}
                <div className={`absolute bottom-0 right-1 w-4 h-4 rounded-full border-2 border-void transition-colors ${
                  isAvatarSpeaking ? 'bg-accent animate-ping' : isListening ? 'bg-rose animate-pulse' : 'bg-emerald-500'
                }`} />
              </div>

              <div>
                <h3 className="font-semibold text-sm">Sarah Johnson</h3>
                <p className="text-[10px] text-muted uppercase tracking-wider font-mono mt-0.5">Senior Engineering Manager</p>
              </div>

              {/* Speech Wave visualizer */}
              <div className="flex items-center gap-1 h-8">
                {waveBars.map((h, i) => (
                  <motion.div
                    key={i}
                    className={`w-0.5 rounded-full ${isListening ? 'bg-rose' : 'bg-accent'}`}
                    style={{ height: h }}
                    animate={{ height: h }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  />
                ))}
              </div>
            </div>

            {/* Question prompt block */}
            <div className="glass border border-border/80 rounded-2xl p-6 bg-void/25 space-y-4 relative min-h-[160px] flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] px-2 py-0.5 bg-accent/15 border border-accent/20 text-accent font-semibold uppercase tracking-wider rounded-md">
                    {currentQuestion?.category || 'Technical'}
                  </span>
                  <span className="text-[9px] text-muted uppercase font-mono">
                    Time Limit: {formatTime(questionTimer)}
                  </span>
                </div>
                <h4 className="font-display font-bold text-base leading-snug text-white">
                  {currentQuestion?.question}
                </h4>
              </div>

              {/* TTS repeat action */}
              <div className="flex items-center gap-2 border-t border-border/40 pt-4">
                <button
                  onClick={() => speakQuestion(currentQuestion?.question)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-border/60 hover:bg-surface-muted/20 rounded-lg text-xs text-muted hover:text-text transition-colors cursor-pointer"
                >
                  <Volume2 size={13} />
                  <span>Repeat Question</span>
                </button>
                <button
                  onClick={handleMuteToggle}
                  className="p-1.5 border border-border/60 hover:bg-surface-muted/20 rounded-lg text-muted hover:text-text transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                </button>
              </div>
            </div>

          </div>

          {/* Right panel: Recording logs, transcript editing, submissions */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            
            {/* Transcript view box */}
            <div className="glass border border-border/80 rounded-2xl p-6 bg-void/25 flex flex-col justify-between min-h-[340px] space-y-4">
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex justify-between items-center border-b border-border/40 pb-2">
                  <span className="text-[10px] font-bold text-text uppercase tracking-wider">Live Voice Transcript</span>
                  {isListening && (
                    <span className="text-[9px] text-rose font-bold animate-pulse flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose inline-block" />
                      LIVE TRANSCRIBING...
                    </span>
                  )}
                </div>
                
                <div className="flex-1 bg-void/60 border border-border/60 rounded-xl p-4 overflow-y-auto max-h-[160px] text-xs text-muted leading-relaxed font-mono">
                  {transcript || (
                    <span className="italic text-dim">
                      Enable microphone and speak. Your voice transcript will populate here in real-time...
                    </span>
                  )}
                </div>
              </div>

              {/* Typed override block */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-muted uppercase tracking-wider block">Add / Override with Text</label>
                <textarea
                  rows={3}
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  placeholder="Type details, formulas, structural algorithms here to enrich or override your answer..."
                  className="w-full bg-void/50 border border-border/60 focus:border-accent text-xs rounded-xl py-2.5 px-3 outline-none text-text resize-none"
                />
              </div>

              {/* Action layout */}
              <div className="flex justify-between items-center border-t border-border/40 pt-4 gap-4">
                {/* Voice Mic Toggle */}
                <button
                  type="button"
                  onClick={handleMicToggle}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-xs transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose/10 border-rose text-rose shadow-lg shadow-rose/10'
                      : 'bg-accent/15 border-accent text-accent hover:bg-accent/25'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff size={14} />
                      <span>Pause Speech</span>
                    </>
                  ) : (
                    <>
                      <Mic size={14} />
                      <span>Record Speech</span>
                    </>
                  )}
                </button>

                {/* Submissions Action */}
                <button
                  onClick={handleNextSubmit}
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader size={13} className="animate-spin" />
                      <span>Saving Response...</span>
                    </>
                  ) : (
                    <>
                      <span>{questionIndex + 1 === totalQuestions ? 'Finish Assessment' : 'Next Question'}</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Sprints completion progress bar footer */}
            <div className="p-3 bg-surface-muted/20 border border-border/60 rounded-xl flex items-center justify-between gap-4 text-[10px] text-muted">
              <div className="flex-1 space-y-1">
                <div className="flex justify-between">
                  <span>Questions Progress</span>
                  <span className="font-semibold">{Math.round(((questionIndex + 1) / totalQuestions) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-void border border-border rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-accent to-violet" style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }} />
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
