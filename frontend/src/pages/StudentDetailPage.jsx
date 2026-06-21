import { useState, useEffect, useMemo, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';
import {
  ArrowLeft,
  Mail,
  GraduationCap,
  Calendar,
  GitCommit,
  GitPullRequest,
  Code,
  Award,
  FolderGit2,
  BookOpen,
  Star,
  Send,
  Loader2,
  FileCheck
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';
import { useNavigation } from '../context/NavigationContext';
import { useTheme } from '../context/ThemeContext';
import useAuth from '../hooks/useAuth.js';
import { createOffer } from '../store/slices/offersSlice.js';
import {
  getRecruiterStudentDetails,
  toggleRecruiterShortlist,
  updateRecruiterPipelineStage,
  deleteRecruiterFromPipeline,
  createRecruiterContactRequest
} from '../store/slices/recruiterSlice.js';

const MilestonesChart = memo(function MilestonesChart({ completionPercentage, isDark }) {
  const radarData = useMemo(() => [
    { subject: 'Code Cleanliness', score: completionPercentage, fullMark: 100 },
    { subject: 'Architecture', score: Math.max(40, completionPercentage - 5), fullMark: 100 },
    { subject: 'Performance', score: Math.max(45, completionPercentage - 8), fullMark: 100 },
    { subject: 'Security', score: Math.max(50, completionPercentage - 2), fullMark: 100 },
    { subject: 'Documentation', score: Math.max(40, completionPercentage - 10), fullMark: 100 },
  ], [completionPercentage]);

  const gridColor = isDark ? '#1E293B' : '#E2E8F0';
  const tickColor = isDark ? '#94A3B8' : '#64748B';
  const tickStyle = useMemo(() => ({ fill: tickColor, fontSize: 8 }), [tickColor]);

  return (
    <div className="sm:col-span-7 h-52 w-full flex items-center justify-center overflow-hidden">
      <RadarChart width={300} height={200} data={radarData} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke={gridColor} />
        <PolarAngleAxis dataKey="subject" tick={tickStyle} />
        <Radar
          name="Simulated Score"
          dataKey="score"
          stroke="#8B5CF6"
          fill="#8B5CF6"
          fillOpacity={0.15}
          strokeWidth={2}
          isAnimationActive={false}
        />
      </RadarChart>
    </div>
  );
});

export default function StudentDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const { navigate, addToast } = useNavigation();

  const { studentDetails, loading, error } = useSelector((state) => state.recruiter);

  const { user: currentUser } = useAuth();

  // Offer Modal state
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [offerLoading, setOfferLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.companyName) {
      setCompanyName(currentUser.companyName);
    }
  }, [currentUser]);

  // Notes state for pipeline stage change
  const [pipelineNotes, setPipelineNotes] = useState('');

  useEffect(() => {
    dispatch(getRecruiterStudentDetails(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (studentDetails?.studentProfile?.pipelineNotes) {
      setPipelineNotes(studentDetails.studentProfile.pipelineNotes);
    } else {
      setPipelineNotes('');
    }
  }, [studentDetails]);

  if (loading && !studentDetails) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-text">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted font-semibold tracking-widest uppercase">Compiling developer scorecard...</p>
        </div>
      </div>
    );
  }

  if (error || !studentDetails) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-text">
        <div className="text-center space-y-4">
          <h2 className="text-sm font-bold text-rose">Failed to load student audit logs</h2>
          <p className="text-xs text-muted">The requested student ID is missing or unauthorized.</p>
          <button
            onClick={() => navigate('recruiter/students')}
            className="px-4 py-2 border border-border text-xs rounded-xl hover:bg-white/5 cursor-pointer"
          >
            Back to Discovery
          </button>
        </div>
      </div>
    );
  }

  const { studentProfile, internshipProgress, githubAnalytics, certificates } = studentDetails;

  // Compile Radar chart technical scores
  const score = internshipProgress?.completionPercentage || 0;

  const handleToggleShortlist = async () => {
    try {
      const res = await dispatch(toggleRecruiterShortlist(studentProfile.userId)).unwrap();
      addToast(
        res.data?.status === 'added'
          ? `Added ${studentProfile.fullName} to shortlist!`
          : `Removed ${studentProfile.fullName} from shortlist`,
        'success'
      );
      dispatch(getRecruiterStudentDetails(id)); // Reload details
    } catch (err) {
      addToast(err || 'Failed to toggle shortlist', 'error');
    }
  };

  const handlePipelineChange = async (e) => {
    const stage = e.target.value;
    try {
      if (stage === 'none') {
        await dispatch(deleteRecruiterFromPipeline(studentProfile.userId)).unwrap();
        addToast('Removed candidate from hiring pipeline', 'info');
      } else {
        await dispatch(updateRecruiterPipelineStage({ studentId: studentProfile.userId, stage, notes: pipelineNotes })).unwrap();
        addToast(`Moved candidate to pipeline stage: ${stage}`, 'success');
      }
      dispatch(getRecruiterStudentDetails(id)); // Reload details
    } catch (err) {
      addToast(err || 'Failed to update pipeline stage', 'error');
    }
  };

  const handleUpdateNotes = async () => {
    const stage = studentProfile.pipelineStage || 'shortlisted';
    try {
      await dispatch(updateRecruiterPipelineStage({ studentId: studentProfile.userId, stage, notes: pipelineNotes })).unwrap();
      addToast('Pipeline notes updated', 'success');
      dispatch(getRecruiterStudentDetails(id)); // Reload
    } catch (err) {
      addToast(err || 'Failed to update notes', 'error');
    }
  };

  const handleSendOffer = async (e) => {
    e.preventDefault();
    if (!companyName || !offerMessage) {
      addToast('Please fill out all offer fields.', 'error');
      return;
    }
    setOfferLoading(true);
    try {
      await dispatch(
        createOffer({
          studentId: studentProfile.userId,
          companyName,
          message: offerMessage,
        })
      ).unwrap();
      addToast(`Internship offer sent to ${studentProfile.fullName}!`, 'success');
      setShowOfferModal(false);
      setOfferMessage('');
    } catch (err) {
      addToast(err || 'Failed to send internship offer', 'error');
    } finally {
      setOfferLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 space-y-6 relative z-10">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <button
            onClick={() => navigate('recruiter/students')}
            className="inline-flex items-center gap-2 text-xs text-muted hover:text-text hover:bg-white/5 px-3 py-1.5 rounded-xl border border-border transition-colors cursor-pointer"
          >
            <ArrowLeft size={12} />
            <span>Students Directory</span>
          </button>
          <span className="text-[10px] font-mono bg-white/5 border border-border px-3 py-1 rounded-full text-muted uppercase">
            Candidate Audit Dashboard
          </span>
        </div>

        {/* Profile Banner */}
        <div className="glass border border-border rounded-3xl p-6 sm:p-8 bg-void/35 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-indigo-500 to-violet" />
          
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left w-full">
            <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-accent/20 shrink-0 shadow-lg shadow-accent/5 overflow-hidden">
              <img src={studentProfile.avatar || 'https://via.placeholder.com/150'} alt="" className="h-full w-full object-cover" />
            </div>
            
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-text">{studentProfile.fullName}</h2>
                <button
                  onClick={handleToggleShortlist}
                  className={`p-1.5 border rounded-lg transition-all cursor-pointer ${
                    studentProfile.isShortlisted
                      ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                      : 'border-border bg-white/5 text-muted hover:text-text'
                  }`}
                  title={studentProfile.isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                >
                  <Star size={13} fill={studentProfile.isShortlisted ? 'currentColor' : 'none'} />
                </button>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted justify-center sm:justify-start">
                <span className="flex items-center gap-1.5"><Mail size={12} className="text-accent" /> {studentProfile.email}</span>
                <span className="flex items-center gap-1.5"><GraduationCap size={12} className="text-accent" /> {studentProfile.course} (Year {studentProfile.year})</span>
                <span className="flex items-center gap-1.5"><Calendar size={12} className="text-accent" /> Joined: {new Date(studentProfile.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-muted justify-center sm:justify-start flex gap-1">
                Institution: <strong className="text-text/90">{studentProfile.collegeName}</strong>
              </p>
              
              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start pt-1">
                {studentProfile.skills.map((skill, index) => (
                  <span key={index} className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-muted uppercase font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 justify-end">
            <button
              onClick={() => setShowOfferModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-accent via-indigo-500 to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send size={13} />
              <span>Send Internship Offer</span>
            </button>
          </div>
        </div>

        {/* Hiring pipeline stage control */}
        <div className="glass border border-border rounded-2xl p-5 bg-void/25 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-1">
            <span className="text-[10px] text-muted uppercase tracking-wider block font-bold">Hiring Pipeline Stage</span>
            <p className="text-xs text-muted">Update stage in candidate pipeline</p>
          </div>
          <div>
            <select
              value={studentProfile.pipelineStage || 'none'}
              onChange={handlePipelineChange}
              className="w-full px-3 py-2 border border-border bg-[#0a0f1d] rounded-xl text-xs text-text outline-none"
            >
              <option value="none">Not in Pipeline (None)</option>
              <option value="applied">Applied</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interviewing">Interviewing</option>
              <option value="offered">Offered</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          {studentProfile.pipelineStage && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Stage note (e.g. scheduled call)"
                value={pipelineNotes}
                onChange={(e) => setPipelineNotes(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-border rounded-xl px-2.5 py-1.5 text-xs text-text outline-none focus:border-accent"
              />
              <button
                onClick={handleUpdateNotes}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-border text-[10px] rounded-lg cursor-pointer font-semibold"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* Analytics Breakdown Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Internship Performance Radar & Scorecard */}
          <div className="glass border border-border rounded-2xl p-6 bg-void/25 flex flex-col justify-between min-h-[350px]">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
                <BookOpen size={15} className="text-violet" />
                <h3 className="text-xs font-bold text-text uppercase tracking-wider">Milestones Audit Ratings</h3>
              </div>

              {internshipProgress ? (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  <div className="sm:col-span-5 space-y-4 text-xs text-muted">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-dim block mb-0.5">Simulated Role Track</span>
                      <strong className="text-text text-sm font-display block">{internshipProgress.careerTrack}</strong>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between font-bold text-[10px]">
                        <span>Milestones Score</span>
                        <span className="text-accent">{internshipProgress.completionPercentage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 border border-border rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-accent to-violet rounded-full" style={{ width: `${internshipProgress.completionPercentage}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="block text-dim uppercase">Current Level</span>
                        <strong className="text-text">{internshipProgress.currentLevel}</strong>
                      </div>
                      <div>
                        <span className="block text-dim uppercase">Active Status</span>
                        <strong className={`uppercase ${internshipProgress.status === 'completed' ? 'text-emerald' : 'text-accent'}`}>{internshipProgress.status}</strong>
                      </div>
                    </div>
                  </div>

                  <MilestonesChart
                    completionPercentage={internshipProgress.completionPercentage || 0}
                    isDark={isDark}
                  />
                </div>
              ) : (
                <div className="text-center py-10 text-xs text-muted">
                  Student has not initialized any career pathway or simulated internship track.
                </div>
              )}
            </div>
          </div>

          {/* GitHub Integration Logs */}
          <div className="glass border border-border rounded-2xl p-6 bg-void/25 flex flex-col justify-between min-h-[350px]">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
                <FaGithub size={15} className="text-accent" />
                <h3 className="text-xs font-bold text-text uppercase tracking-wider">GitHub Integration Analytics</h3>
              </div>

              {githubAnalytics ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-emerald/10 border border-emerald/20 text-[9px] text-emerald font-semibold uppercase tracking-wider">
                      Connected
                    </span>
                    <a
                      href={githubAnalytics.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline font-mono"
                    >
                      @{githubAnalytics.username}
                    </a>
                  </div>

                  {githubAnalytics.contributions.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3 text-center py-3 border-t border-b border-border/30">
                      <div>
                        <span className="text-[9px] text-muted uppercase font-bold block">Commits</span>
                        <span className="text-lg font-bold text-text font-mono flex items-center justify-center gap-1">
                          <GitCommit size={12} className="text-accent" />
                          {githubAnalytics.contributions[0].commitCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted uppercase font-bold block">PRs</span>
                        <span className="text-lg font-bold text-text font-mono flex items-center justify-center gap-1">
                          <GitPullRequest size={12} className="text-indigo-400" />
                          {githubAnalytics.contributions[0].pullRequestCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted uppercase font-bold block">Git Score</span>
                        <span className="text-lg font-bold text-emerald font-mono flex items-center justify-center gap-1">
                          <Code size={12} className="text-emerald" />
                          {githubAnalytics.contributions[0].contributionScore}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted">No contribution metrics recorded for this student.</p>
                  )}

                  <div>
                    <span className="text-[9px] text-muted uppercase font-bold block mb-1.5">Top Languages</span>
                    <div className="flex gap-2 flex-wrap">
                      {githubAnalytics.contributions[0]?.languages && Object.entries(githubAnalytics.contributions[0].languages).map(([lang, pct]) => (
                        <span key={lang} className="text-[9px] px-2.5 py-0.5 border border-border bg-white/5 rounded-full font-mono text-muted">
                          {lang}: {pct}%
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-xs text-muted flex flex-col items-center justify-center gap-2">
                  <FolderGit2 size={24} className="text-muted/40" />
                  <p>GitHub account has not been integrated or linked by this student.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Certificates & Credentials */}
        <div className="glass border border-border rounded-2xl p-6 bg-void/20 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
            <Award size={15} className="text-emerald" />
            <h3 className="text-xs font-bold text-text uppercase tracking-wider">Simulated Career Sprints Credentials</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <div key={cert.certificateId} className="p-4 bg-emerald/5 border border-emerald/10 rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted font-bold block uppercase tracking-wider">Credential ID: {cert.certificateId}</span>
                  <h4 className="text-xs font-bold text-text">{cert.roleTitle}</h4>
                  <p className="text-[10px] text-muted">{cert.companyName} · Grade {cert.grade}/100</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald font-semibold">
                  <FileCheck size={14} />
                  <span>VERIFIED RECORD</span>
                </div>
              </div>
            ))}
            {certificates.length === 0 && (
              <div className="col-span-2 text-center py-8 text-xs text-muted">
                No internship completion certificates issued to this student yet.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Send Internship Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-void/85 backdrop-blur-md" onClick={() => setShowOfferModal(false)} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg glass border border-border p-6 rounded-2xl bg-void/65 shadow-2xl relative z-10 space-y-4"
          >
            <div className="border-b border-border pb-3">
              <h3 className="font-display font-bold text-lg">Send Internship Offer</h3>
              <p className="text-xs text-muted">Issue an official simulated internship offer letter to {studentProfile.fullName}. The candidate will receive a notification and can accept or reject this offer.</p>
            </div>

            <form onSubmit={handleSendOffer} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NeuralMind Technologies"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-border rounded-xl px-3.5 py-2 text-xs text-text outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">Offer Message / Terms</label>
                <textarea
                  required
                  rows={6}
                  placeholder={`Dear ${studentProfile.fullName.split(' ')[0] || 'Student'},\n\nFollowing our review of your developer metrics, we are excited to offer you a simulated AI Research Intern role at our company. The internship will cover Vector Databases, semantic search architectures, and RAG pipelines...`}
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-border rounded-xl px-3.5 py-2 text-xs text-text outline-none focus:border-accent resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 border border-border text-xs rounded-xl hover:bg-white/5 cursor-pointer text-muted hover:text-text font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={offerLoading}
                  className="px-4 py-2 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {offerLoading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Send size={13} />
                  )}
                  <span>Send Offer</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
