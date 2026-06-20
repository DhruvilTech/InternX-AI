import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Clock,
  TrendingUp,
  Award,
  Layers,
  CheckCircle,
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext.jsx';
import useAuth from '../hooks/useAuth.js';
import { getCareerDetails, selectCareer } from '../api/careerService.js';

export default function CareerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useNavigation();
  const { user, updateProfile } = useAuth();

  useEffect(() => {
    if (user?.selectedCareer) {
      navigate('/my-career', { replace: true });
    }
  }, [user, navigate]);

  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await getCareerDetails(id);
        if (res.success && res.data?.career) {
          setCareer(res.data.career);
        } else {
          addToast('Failed to load career roadmap details.', 'error');
        }
      } catch (err) {
        console.error(err);
        addToast('Error loading details from server.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleSelectCareer = async () => {
    setSelecting(true);
    try {
      const res = await selectCareer(id);
      if (res.success && res.data?.studentCareer) {
        updateProfile({ selectedCareer: res.data.studentCareer });
        addToast(`Successfully selected ${career.title}!`, 'success');
        navigate('/my-career');
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to select this career path.', 'error');
    } finally {
      setSelecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-text">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted font-semibold tracking-widest uppercase">Analyzing Roadmap...</p>
        </div>
      </div>
    );
  }

  if (!career) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-text">
        <div className="space-y-4 text-center">
          <h2 className="text-sm font-bold">Roadmap Not Found</h2>
          <button
            onClick={() => navigate('/careers')}
            className="px-4 py-2 bg-white/5 border border-border text-xs rounded-xl hover:bg-white/10"
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background glow layers */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Back Button */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <button
            onClick={() => navigate('/careers')}
            className="inline-flex items-center gap-2 text-xs text-muted hover:text-text hover:bg-white/5 px-3 py-1.5 rounded-xl border border-border transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Career Pathways</span>
          </button>
          <span className="text-[10px] font-mono bg-white/5 border border-border px-3 py-1 rounded-full text-muted uppercase">
            {career.category}
          </span>
        </div>

        {/* Header Widget */}
        <div className="glass border border-border rounded-3xl p-6 sm:p-8 bg-void/35 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-indigo-500 to-violet" />
          
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-text">{career.title}</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[9px] text-accent font-semibold uppercase tracking-wider">
                <Star size={10} className="text-amber fill-amber" />
                {career.difficultyLevel}
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">{career.description}</p>
          </div>

          <button
            onClick={handleSelectCareer}
            disabled={selecting}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-violet text-white text-xs font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-accent/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {selecting ? 'Processing Selection...' : 'Select This Career'}
          </button>
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Metadata & Core Skills */}
          <div className="md:col-span-4 space-y-6">
            
            {/* Stats Info */}
            <div className="glass border border-border rounded-2xl p-5 bg-void/20 space-y-4">
              <h4 className="text-[10px] font-bold text-text uppercase tracking-widest border-b border-border/40 pb-2">
                Path Specifications
              </h4>
              
              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-accent/10 border border-accent/20 text-accent rounded-lg flex items-center justify-center shrink-0">
                    <Clock size={14} />
                  </div>
                  <div>
                    <span className="text-[10px] text-dim block">Internship Duration</span>
                    <span className="text-xs font-bold text-text">{career.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-emerald/10 border border-emerald/20 text-emerald rounded-lg flex items-center justify-center shrink-0">
                    <TrendingUp size={14} />
                  </div>
                  <div>
                    <span className="text-[10px] text-dim block">Industry Demand</span>
                    <span className="text-xs font-bold text-text">{career.industryDemand}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center shrink-0">
                    <Award size={14} />
                  </div>
                  <div>
                    <span className="text-[10px] text-dim block">Platform Accreditation</span>
                    <span className="text-xs font-bold text-text">Simulated Certificate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Required Skills list */}
            <div className="glass border border-border rounded-2xl p-5 bg-void/20 space-y-3">
              <h4 className="text-[10px] font-bold text-text uppercase tracking-widest border-b border-border/40 pb-2">
                Prerequisite Core Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {career.requiredSkills.map((skill) => (
                  <span key={skill} className="text-[10px] bg-surface-muted/30 border border-border px-2.5 py-1 rounded-lg text-muted font-mono">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Learning Roadmap Steps */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Roadmap Card */}
            <div className="glass border border-border rounded-2xl p-6 bg-void/20 space-y-6 relative">
              <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                <Layers size={16} className="text-accent" />
                <h3 className="text-sm font-bold text-text uppercase tracking-widest">
                  Simulated Learning Roadmap
                </h3>
              </div>

              {/* Timeline Track Line */}
              {career.learningRoadmap && career.learningRoadmap.length > 0 && (
                <div className="absolute top-24 bottom-10 left-10 w-px bg-border/60 hidden sm:block" />
              )}

              {/* Roadmap Phases */}
              <div className="space-y-8 relative">
                {career.learningRoadmap && career.learningRoadmap.length > 0 ? (
                  career.learningRoadmap.map((phase, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-5 items-start relative z-10">
                      
                      {/* Phase Indicator Ring */}
                      <div className="h-8 w-8 rounded-lg bg-surface border border-border text-xs font-bold font-display text-accent flex items-center justify-center shrink-0 shadow-md">
                        {phase.phase}
                      </div>

                      {/* Content */}
                      <div className="space-y-2 flex-1 min-w-0 bg-void/45 border border-border/45 p-4 rounded-xl">
                        <h4 className="text-xs font-bold text-text">{phase.title}</h4>
                        <p className="text-[11px] text-muted leading-relaxed">{phase.description}</p>
                        
                        {/* Phase topics badges */}
                        {phase.topics && phase.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-2">
                            {phase.topics.map((t) => (
                              <span key={t} className="text-[8px] bg-surface-muted/50 border border-border/40 px-2 py-0.5 rounded text-dim font-mono">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-muted">
                    No learning roadmap configured for this path.
                  </div>
                )}
              </div>
            </div>

            {/* Next stage preview */}
            <div className="p-4 bg-accent/5 border border-accent/15 rounded-2xl flex items-center gap-3">
              <Briefcase size={16} className="text-accent shrink-0" />
              <p className="text-[11px] text-muted leading-relaxed">
                <strong>Internship Generation Phase Preview:</strong> Selecting this track assigns you a dedicated virtual company and task sessional backlog mapped specifically to these {career.title} roadmap competencies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
