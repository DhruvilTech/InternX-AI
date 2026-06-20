import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Layers,
  Clock,
  TrendingUp,
  Award,
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext.jsx';
import { getMyCareer } from '../api/careerService.js';
import ScoreRing from '../components/ui/ScoreRing.jsx';
import axiosInstance from '../api/axios.js';
import useAuth from '../hooks/useAuth.js';

export default function MyCareerPage() {
  const navigate = useNavigate();
  const { addToast } = useNavigation();
  const { updateProfile } = useAuth();

  const [careerData, setCareerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingInternship, setCheckingInternship] = useState(false);

  const handleEnterWorkspace = async () => {
    setCheckingInternship(true);
    try {
      const response = await axiosInstance.get('/api/internships/my-internship');
      if (response.data?.success && response.data?.data?.internship) {
        navigate('/student/dashboard');
      } else {
        navigate('/generator');
      }
    } catch (error) {
      navigate('/generator');
    } finally {
      setCheckingInternship(false);
    }
  };

  useEffect(() => {
    const fetchMyCareer = async () => {
      try {
        const res = await getMyCareer();
        if (res.success && res.data) {
          setCareerData(res.data);
        }
      } catch (err) {
        console.error(err);
        updateProfile({ selectedCareer: null });
        addToast('No active selected career path found. Redirecting...', 'info');
        navigate('/careers');
      } finally {
        setLoading(false);
      }
    };
    fetchMyCareer();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-text">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted font-semibold tracking-widest uppercase">Fetching Career Progress...</p>
        </div>
      </div>
    );
  }

  if (!careerData || !careerData.career) {
    return null; // Will redirect via useEffect
  }

  const { career, selectedAt, progress, level, status } = careerData;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Glow layers */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted uppercase">My Selected Track</span>
            <ChevronRight size={12} className="text-muted" />
            <span className="text-xs text-accent font-semibold uppercase font-mono">{career.category}</span>
          </div>
          <span className="text-[10px] font-mono bg-emerald/10 border border-emerald/20 text-emerald px-2.5 py-0.5 rounded-full uppercase">
            {status}
          </span>
        </div>

        {/* Selected Career Overview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          
          {/* Main info card */}
          <div className="md:col-span-8 glass border border-border rounded-3xl p-6 sm:p-8 bg-void/35 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-indigo-500 to-violet" />
            
            <div className="space-y-4">
              <span className="text-[9px] font-bold text-accent uppercase tracking-[0.25em] block">
                Platform Path Accreditation
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-text leading-tight">
                {career.title}
              </h2>
              <p className="text-xs text-muted leading-relaxed">
                {career.description}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-border/50 pt-6 mt-8">
              <div className="space-y-1">
                <span className="text-[9px] text-dim block uppercase font-semibold">Level State</span>
                <span className="text-xs font-bold text-text flex items-center gap-1">
                  <Zap size={11} className="text-amber" />
                  {level}
                </span>
              </div>
              
              <div className="space-y-1">
                <span className="text-[9px] text-dim block uppercase font-semibold">Track Duration</span>
                <span className="text-xs font-bold text-text flex items-center gap-1">
                  <Clock size={11} className="text-accent" />
                  {career.duration}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-dim block uppercase font-semibold">Selection Date</span>
                <span className="text-xs font-bold text-text font-mono">
                  {new Date(selectedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Circular Card */}
          <div className="md:col-span-4 glass border border-border rounded-3xl p-6 bg-void/25 flex flex-col items-center justify-center text-center space-y-4">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
              Sprints Progress
            </span>
            <ScoreRing score={progress} size={110} strokeWidth={6} />
            <div className="space-y-1">
              <span className="text-xs font-bold text-text">{progress}% Completed</span>
              <span className="text-[9px] text-dim block">Generate sprints board to increase completion percentage</span>
            </div>
            
            <button
              onClick={handleEnterWorkspace}
              disabled={checkingInternship}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent to-violet text-white text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-accent/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>{checkingInternship ? 'Checking Workspace...' : 'Enter Workspace'}</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Roadmap Roadmap Details */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Skill tags */}
          <div className="md:col-span-4 space-y-6">
            <div className="glass border border-border rounded-2xl p-5 bg-void/20 space-y-3">
              <h4 className="text-[10px] font-bold text-text uppercase tracking-widest border-b border-border/40 pb-2">
                Targeted Competencies
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {career.requiredSkills.map((skill) => (
                  <span key={skill} className="text-[10px] bg-surface-muted/30 border border-border px-2.5 py-1 rounded-lg text-muted font-mono">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass border border-border rounded-2xl p-5 bg-void/20 space-y-3.5">
              <h4 className="text-[10px] font-bold text-text uppercase tracking-widest border-b border-border/40 pb-2">
                Virtual Company Status
              </h4>
              <div className="flex items-start gap-3 text-xs text-muted leading-relaxed">
                <Activity size={16} className="text-accent mt-0.5 shrink-0" />
                <p>
                  Platform is ready. Navigate to the dashboard to launch the **AI Internship Generator** and start completing tasks.
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Timeline Sprints */}
          <div className="md:col-span-8 glass border border-border rounded-2xl p-6 bg-void/20 space-y-6 relative">
            <div className="flex items-center gap-2 border-b border-border/40 pb-4">
              <Layers size={16} className="text-accent" />
              <h3 className="text-sm font-bold text-text uppercase tracking-widest">
                Track Sprints roadmap
              </h3>
            </div>

            {/* Vertical Line */}
            {career.learningRoadmap && career.learningRoadmap.length > 0 && (
              <div className="absolute top-24 bottom-10 left-10 w-px bg-border/60 hidden sm:block" />
            )}

            {/* Sprints items */}
            <div className="space-y-6 relative">
              {career.learningRoadmap && career.learningRoadmap.length > 0 ? (
                career.learningRoadmap.map((phase, idx) => {
                  // Since progress is 0, highlight first phase as active, others as locked/queued
                  const isActive = idx === 0;
                  const isCompleted = progress > (idx + 1) * 33; // Mock completion
                  
                  return (
                    <div key={idx} className={`flex flex-col sm:flex-row gap-5 items-start relative z-10 transition-opacity duration-300 ${!isActive && !isCompleted ? 'opacity-55' : ''}`}>
                      
                      {/* Circle Number */}
                      <div className={`h-8 w-8 rounded-lg text-xs font-bold font-display flex items-center justify-center shrink-0 shadow-md ${
                        isCompleted ? 'bg-emerald/10 border border-emerald/30 text-emerald' : 
                        isActive ? 'bg-accent/15 border border-accent/30 text-accent font-extrabold animate-pulse' :
                        'bg-surface border border-border text-dim'
                      }`}>
                        {phase.phase}
                      </div>

                      {/* Box Info */}
                      <div className={`p-4 rounded-xl border flex-1 min-w-0 bg-void/45 ${
                        isCompleted ? 'border-emerald/20 bg-emerald/5' :
                        isActive ? 'border-accent/30 bg-accent/5' :
                        'border-border/45 bg-void/45'
                      }`}>
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-xs font-bold text-text">{phase.title}</h4>
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isCompleted ? 'bg-emerald/10 border-emerald/25 text-emerald' : 
                            isActive ? 'bg-accent/10 border-accent/25 text-accent' :
                            'bg-surface-muted/20 border-border/30 text-dim'
                          }`}>
                            {isCompleted ? 'Completed' : isActive ? 'Active Sprint' : 'Locked'}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted leading-relaxed">{phase.description}</p>
                        
                        {phase.topics && phase.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-3">
                            {phase.topics.map((t) => (
                              <span key={t} className="text-[8px] bg-surface-muted/30 border border-border/40 px-2 py-0.5 rounded text-dim font-mono">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-muted">
                  No learning roadmap configured.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
