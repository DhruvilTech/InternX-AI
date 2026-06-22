import { useState, useEffect, useMemo, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axios.js';
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
  FileCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle
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
  const [jobRole, setJobRole] = useState('');
  const [salaryPackage, setSalaryPackage] = useState('');
  const [offerLoading, setOfferLoading] = useState(false);

  useEffect(() => {
    const name =
      currentUser?.recruiterProfile?.companyName ||
      currentUser?.companyName ||
      '';
    if (name) setCompanyName(name);
  }, [currentUser]);

  // Notes state for pipeline stage change
  const [pipelineNotes, setPipelineNotes] = useState('');
  const [activeTab, setActiveTab] = useState('scorecard');

  const [evaluationReport, setEvaluationReport] = useState(null);
  const [evalError, setEvalError] = useState('');
  const [loadingEval, setLoadingEval] = useState(true);

  useEffect(() => {
    dispatch(getRecruiterStudentDetails(id));
  }, [dispatch, id]);

  useEffect(() => {
    const fetchEval = async () => {
      try {
        setLoadingEval(true);
        const res = await axiosInstance.get(`/api/evaluation/student/${id}`);
        setEvaluationReport(res.data);
        setEvalError('');
      } catch (err) {
        console.error('Failed to load student evaluation report:', err);
        setEvaluationReport(null);
        setEvalError(err.response?.data?.message || 'No evaluation available yet.\nStudent has not completed any evaluated submissions.');
      } finally {
        setLoadingEval(false);
      }
    };
    fetchEval();
  }, [id]);

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

  const { studentProfile, internshipProgress, githubAnalytics, certificates, careerReport, skillGapReport, feedbackReport, tasks, submissions, interviews } = studentDetails;

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
    if (studentProfile.hasAcceptedOffer) {
      addToast('This student has already accepted an internship offer.', 'error');
      return;
    }
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
          jobRole: jobRole || 'Software Engineer Intern',
          package: salaryPackage ? Number(salaryPackage) : 6,
        })
      ).unwrap();
      addToast(`Internship offer sent to ${studentProfile.fullName}!`, 'success');
      setShowOfferModal(false);
      setOfferMessage('');
      setJobRole('');
      setSalaryPackage('');
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
                  className={`p-1.5 border rounded-lg transition-all cursor-pointer ${studentProfile.isShortlisted
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
            {studentProfile.hasAcceptedOffer ? (
              <button
                disabled
                className="px-5 py-2.5 bg-emerald/10 border border-emerald/20 text-emerald text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 opacity-80 cursor-not-allowed"
              >
                <CheckCircle2 size={13} />
                <span>Internship Offer Accepted</span>
              </button>
            ) : (
              <button
                onClick={() => setShowOfferModal(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-accent via-indigo-500 to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send size={13} />
                <span>Send Internship Offer</span>
              </button>
            )}
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
              className="w-full px-3 py-2 border border-border bg-input-bg rounded-xl text-xs text-text outline-none"
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
                className="w-full bg-input-bg border border-border rounded-xl px-2.5 py-1.5 text-xs text-text outline-none focus:border-accent"
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

        {/* Tab Navigator */}
        <div className="flex border-b border-border gap-1 overflow-x-auto pb-px">
          {[
            { id: 'scorecard', label: 'Internship Scorecard' },
            { id: 'skills', label: 'Skills & Gaps' },
            { id: 'interview', label: 'Mock Interview' },
            { id: 'github', label: 'GitHub Audit' },
            { id: 'submissions', label: 'Milestone Submissions' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all shrink-0 cursor-pointer ${activeTab === tab.id
                ? 'border-accent text-accent font-bold bg-white/5'
                : 'border-transparent text-muted hover:text-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Panels */}
        <div className="space-y-6">

          {/* TAB 1: Internship Scorecard */}
          {activeTab === 'scorecard' && (
            evalError ? (
              <div className="glass border border-border rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3 py-16">
                <AlertCircle className="text-amber h-8 w-8" />
                <h3 className="text-sm font-bold text-text">No evaluation available yet</h3>
                <p className="text-xs text-muted whitespace-pre-line leading-relaxed">
                  No evaluation available yet.
                  Student has not completed any evaluated submissions.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Scorecard KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  <div className="glass border border-border rounded-xl p-4 bg-void/25">
                    <span className="text-[10px] text-muted uppercase font-bold block mb-1">Placement Readiness</span>
                    <span className="text-xl font-bold text-accent font-display">
                      {evaluationReport?.overallScore || 0}%
                    </span>
                    <span className="text-[9px] text-muted block mt-1">Weighted Candidate Rating</span>
                  </div>

                  <div className="glass border border-border rounded-xl p-4 bg-void/25">
                    <span className="text-[10px] text-muted uppercase font-bold block mb-1">GitHub Score</span>
                    <span className="text-xl font-bold text-violet font-display">
                      {evaluationReport?.githubScore || 0}/100
                    </span>
                    <span className="text-[9px] text-muted block mt-1">AI Repository Audit</span>
                  </div>

                  <div className="glass border border-border rounded-xl p-4 bg-void/25">
                    <span className="text-[10px] text-muted uppercase font-bold block mb-1">Overall Progress</span>
                    <span className="text-xl font-bold text-indigo-400 font-display">
                      {internshipProgress?.completionPercentage || 0}%
                    </span>
                    <span className="text-[9px] text-muted block mt-1">Internship Sprints Completed</span>
                  </div>

                  <div className="glass border border-border rounded-xl p-4 bg-void/25">
                    <span className="text-[10px] text-muted uppercase font-bold block mb-1">Average Task Score</span>
                    <span className="text-xl font-bold text-emerald font-display">
                      {evaluationReport?.technicalScore || 0}
                    </span>
                    <span className="text-[9px] text-muted block mt-1">Milestone Evaluator Avg</span>
                  </div>

                  <div className="glass border border-border rounded-xl p-4 bg-void/25 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-muted uppercase font-bold block mb-1">Salary Estimate</span>
                    <span className="text-xl font-bold text-amber font-display">
                      {careerReport?.salaryRange || 'N/A'}
                    </span>
                    <span className="text-[9px] text-muted block mt-1">Based on Role Track Demand</span>
                  </div>
                </div>

                {/* Advice and Feedback section */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Career Coach Insight */}
                  <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-3">
                    <h4 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5 border-b border-border/40 pb-2">
                      <Sparkles size={13} className="text-accent" />
                      <span>Career Coach Insight</span>
                    </h4>
                    <div className="text-xs text-muted leading-relaxed space-y-1.5">
                      {evaluationReport?.recommendations && evaluationReport.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span className="text-accent font-bold">•</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                      {(!evaluationReport?.recommendations || evaluationReport.recommendations.length === 0) && (
                        <p>No placement coach advice generated yet.</p>
                      )}
                    </div>
                    <div className="pt-2 text-[10px] text-muted flex gap-2">
                      <span>Target Roles:</span>
                      <strong className="text-text">{evaluationReport?.careerRecommendations?.join(', ') || 'N/A'}</strong>
                    </div>
                  </div>

                  {/* Manager Feedback */}
                  <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-3">
                    <h4 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5 border-b border-border/40 pb-2">
                      <BookOpen size={13} className="text-violet" />
                      <span>Executive Manager Audit</span>
                    </h4>
                    <div className="text-xs text-muted leading-relaxed space-y-2">
                      <div>
                        <span className="text-[10px] font-bold text-emerald uppercase block mb-0.5">Strengths</span>
                        <p>{evaluationReport?.strengths?.join(', ') || 'None compiled'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-rose uppercase block mb-0.5">Weaknesses</span>
                        <p>{evaluationReport?.weaknesses?.join(', ') || 'None compiled'}</p>
                      </div>
                    </div>
                    <div className="pt-2 text-[10px] text-muted">
                      <span>Audit Lead:</span>
                      <strong className="text-text"> Sarah Johnson (Director of Engineering)</strong>
                    </div>
                  </div>
                </div>

              {/* Tasks List Table */}
              <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
                <div className="flex justify-between items-center border-b border-border/40 pb-3">
                  <h3 className="text-xs font-bold text-text uppercase tracking-wider">Milestone Deliverables History</h3>
                  <span className="text-[10px] text-muted">Total Assigned: {tasks?.length || 0}</span>
                </div>
                <div className="space-y-3">
                  {tasks?.map(task => (
                    <div key={task._id} className="p-3 bg-void/40 border border-border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                      <div>
                        <h4 className="font-bold text-text">{task.title}</h4>
                        <p className="text-[10px] text-muted mt-0.5">Difficulty: {task.difficulty} · Status: <span className={task.status === 'completed' ? 'text-emerald' : 'text-accent'}>{task.status.toUpperCase()}</span></p>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        {task.score && (
                          <span className="px-2 py-0.5 rounded bg-emerald/10 border border-emerald/20 text-emerald text-[10px] font-bold">
                            Score: {task.score}
                          </span>
                        )}
                        <span className="text-[9px] text-dim">{new Date(task.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {(!tasks || tasks.length === 0) && (
                    <p className="text-center py-6 text-xs text-muted">No assigned deliverables traced for this student.</p>
                  )}
                </div>
              </div>
            </div>
          )
        )}

          {/* TAB 2: Skills & Gaps */}
          {activeTab === 'skills' && (
            evalError ? (
              <div className="glass border border-border rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3 py-16">
                <AlertCircle className="text-amber h-8 w-8" />
                <h3 className="text-sm font-bold text-text">No evaluation available yet</h3>
                <p className="text-xs text-muted whitespace-pre-line leading-relaxed">
                  No evaluation available yet.
                  Student has not completed any evaluated submissions.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-12 gap-6 items-start">
                {/* Radar Chart */}
                <div className="md:col-span-5 glass border border-border rounded-2xl p-6 bg-void/25 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-text uppercase tracking-wider block mb-4">Capability Comparison Radar</span>
                  {evaluationReport ? (
                    <RadarChart width={280} height={200} data={[
                      { subject: 'Technical Score', score: evaluationReport.technicalScore || 0, benchmark: 80 },
                      { subject: 'GitHub Score', score: evaluationReport.githubScore || 0, benchmark: 80 },
                      { subject: 'Code Quality', score: evaluationReport.codeQuality || 0, benchmark: 80 },
                      { subject: 'Documentation', score: evaluationReport.documentationScore || 0, benchmark: 80 },
                      { subject: 'Project Structure', score: evaluationReport.projectStructure || 0, benchmark: 80 }
                    ]} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid stroke={isDark ? '#1E293B' : '#E2E8F0'} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 8 }} />
                      <Radar name="Student" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.15} strokeWidth={2} />
                      <Radar name="Benchmark" dataKey="benchmark" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.05} strokeWidth={1} strokeDasharray="3 3" />
                    </RadarChart>
                  ) : (
                    <div className="text-center py-12 text-xs text-muted">No skill metrics generated.</div>
                  )}
                </div>

                {/* Skills and Gaps breakdown */}
                <div className="md:col-span-7 space-y-6">
                  {/* Detected Skills */}
                  <div className="glass border border-border rounded-2xl p-5 bg-void/25 space-y-3">
                    <span className="text-[10px] font-bold text-emerald uppercase tracking-wider block">Demonstrated Skill Strengths</span>
                    <div className="flex flex-wrap gap-2">
                      {evaluationReport?.identifiedSkills?.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-emerald/10 border border-emerald/20 text-emerald rounded-lg text-xs font-semibold">
                          {skill}
                        </span>
                      )) || <span className="text-xs text-muted">None trace detected</span>}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="glass border border-border rounded-2xl p-5 bg-void/25 space-y-3">
                    <span className="text-[10px] font-bold text-rose uppercase tracking-wider block">Identified Capability Gaps</span>
                    <div className="flex flex-wrap gap-2">
                      {evaluationReport?.identifiedSkillGaps?.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-rose/10 border border-rose/20 text-rose rounded-lg text-xs font-semibold">
                          {skill}
                        </span>
                      )) || <span className="text-xs text-emerald font-semibold">All requirement skills verified! (No Gaps)</span>}
                    </div>
                  </div>

                  {/* Improvement Recommendations */}
                  <div className="glass border border-border rounded-2xl p-5 bg-void/25 space-y-3">
                    <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">Personalized Roadmaps & Recommendations</span>
                    <div className="space-y-1.5 text-xs text-muted">
                      {evaluationReport?.recommendations?.map((rec, idx) => (
                        <div key={idx} className="p-2.5 bg-void/40 border border-border rounded-lg flex items-start gap-2">
                          <span className="text-accent font-bold">•</span>
                          <span>{rec}</span>
                        </div>
                      )) || <p>No recommendations generated.</p>}
                    </div>
                  </div>

                  {/* Career Suggestions */}
                  <div className="glass border border-border rounded-2xl p-5 bg-void/25 space-y-3">
                    <span className="text-[10px] font-bold text-violet uppercase tracking-wider block">Career Suggestions / Certifications</span>
                    <div className="space-y-1.5 text-xs text-muted">
                      {evaluationReport?.careerRecommendations?.map((cert, idx) => (
                        <div key={idx} className="p-2.5 bg-void/40 border border-border rounded-lg flex items-start gap-2">
                          <span className="text-violet font-bold">•</span>
                          <span>{cert}</span>
                        </div>
                      )) || <p>No career certifications recommended yet.</p>}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}


          {/* TAB 3: Mock Interview */}
          {activeTab === 'interview' && (
            <div className="space-y-6">
              {/* Interview scores card */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass border border-border rounded-xl p-4 bg-void/25 text-center">
                  <span className="text-[9px] text-muted uppercase font-bold block mb-1">Average Interview Score</span>
                  <span className="text-2xl font-bold text-accent font-display">
                    {interviews && interviews.length > 0
                      ? Math.round(interviews.reduce((sum, int) => sum + (int.overallScore || 0), 0) / interviews.length)
                      : 'N/A'}
                  </span>
                </div>
                <div className="glass border border-border rounded-xl p-4 bg-void/25 text-center">
                  <span className="text-[9px] text-muted uppercase font-bold block mb-1">Technical Skills</span>
                  <span className="text-2xl font-bold text-text font-display">
                    {interviews && interviews.length > 0
                      ? Math.round(interviews.reduce((sum, int) => sum + (int.technicalScore || 0), 0) / interviews.length)
                      : 'N/A'}
                  </span>
                </div>
                <div className="glass border border-border rounded-xl p-4 bg-void/25 text-center">
                  <span className="text-[9px] text-muted uppercase font-bold block mb-1">Communication Score</span>
                  <span className="text-2xl font-bold text-indigo-400 font-display">
                    {interviews && interviews.length > 0
                      ? Math.round(interviews.reduce((sum, int) => sum + (int.communicationScore || 0), 0) / interviews.length)
                      : 'N/A'}
                  </span>
                </div>
                <div className="glass border border-border rounded-xl p-4 bg-void/25 text-center">
                  <span className="text-[9px] text-muted uppercase font-bold block mb-1">Problem Solving</span>
                  <span className="text-2xl font-bold text-emerald font-display">
                    {interviews && interviews.length > 0
                      ? Math.round(interviews.reduce((sum, int) => sum + (int.problemSolvingScore || 0), 0) / interviews.length)
                      : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Interview Sessions list */}
              <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
                <span className="text-xs font-bold text-text uppercase tracking-wider block border-b border-border/40 pb-2.5">Simulated Interview Reports</span>
                <div className="space-y-4">
                  {interviews?.map((report, idx) => (
                    <div key={idx} className="p-4 bg-void/40 border border-border rounded-xl space-y-3">
                      <div className="flex justify-between items-start flex-wrap gap-2 text-xs">
                        <div>
                          <strong className="text-text block">Mock Interview Session {idx + 1}</strong>
                          <span className="text-[10px] text-muted">Readiness Level: {report.readinessLevel}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded bg-accent/15 border border-accent/30 text-accent font-bold">
                          Overall: {report.overallScore}/100
                        </span>
                      </div>
                      <p className="text-xs text-muted leading-relaxed italic bg-surface-muted/10 p-3 rounded-lg border border-border">
                        "{report.careerAdvice}"
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4 text-[11px] text-muted">
                        <div>
                          <strong className="text-emerald block mb-1">Strengths</strong>
                          {report.strengths?.map((str, i) => <p key={i}>• {str}</p>)}
                        </div>
                        <div>
                          <strong className="text-rose block mb-1">Weaknesses</strong>
                          {report.weaknesses?.map((wk, i) => <p key={i}>• {wk}</p>)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!interviews || interviews.length === 0) && (
                    <p className="text-center py-6 text-xs text-muted">No completed voice/text mock interview sessions recorded for this student.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GitHub Audit */}
          {activeTab === 'github' && (
            <div className="space-y-6">
              {githubAnalytics ? (
                <div className="space-y-6">
                  {/* KPI card grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass border border-border rounded-xl p-4 bg-void/25 text-center">
                      <span className="text-[9px] text-muted uppercase font-bold block mb-1">Username</span>
                      <a href={githubAnalytics.profileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-accent hover:underline block truncate">
                        @{githubAnalytics.username}
                      </a>
                    </div>
                    <div className="glass border border-border rounded-xl p-4 bg-void/25 text-center">
                      <span className="text-[9px] text-muted uppercase font-bold block mb-1">Public Repositories</span>
                      <span className="text-xl font-bold text-text font-mono">{githubAnalytics.publicRepos}</span>
                    </div>
                    <div className="glass border border-border rounded-xl p-4 bg-void/25 text-center">
                      <span className="text-[9px] text-muted uppercase font-bold block mb-1">Followers</span>
                      <span className="text-xl font-bold text-text font-mono">{githubAnalytics.followers || 0}</span>
                    </div>
                    <div className="glass border border-border rounded-xl p-4 bg-void/25 text-center">
                      <span className="text-[9px] text-muted uppercase font-bold block mb-1">Integrated Commits</span>
                      <span className="text-xl font-bold text-emerald font-mono">
                        {githubAnalytics.contributions?.reduce((sum, c) => sum + (c.commitCount || 0), 0) || 0}
                      </span>
                    </div>
                  </div>

                  {/* Git Contribution details */}
                  <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
                    <span className="text-xs font-bold text-text uppercase tracking-wider block border-b border-border/40 pb-2.5">Repository Contribution History</span>
                    <div className="space-y-3">
                      {githubAnalytics.contributions?.map((contrib, idx) => (
                        <div key={idx} className="p-4 bg-void/40 border border-border rounded-xl text-xs space-y-2">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <span className="font-mono font-bold text-text">Repository ID: {contrib.repoId}</span>
                            <span className="px-2 py-0.5 rounded bg-emerald/10 border border-emerald/20 text-emerald text-[10px] font-bold font-mono">
                              Contribution Score: {contrib.contributionScore}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-muted py-1 bg-surface-muted/10 border border-border rounded-lg">
                            <div>Commits: <strong>{contrib.commitCount}</strong></div>
                            <div>PRs: <strong>{contrib.pullRequestCount}</strong></div>
                            <div>Issues: <strong>{contrib.issueCount}</strong></div>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-muted uppercase tracking-wider block mb-1">Languages breakdown</span>
                            <div className="flex flex-wrap gap-1.5">
                              {contrib.languages && Object.entries(contrib.languages).map(([lang, pct]) => (
                                <span key={lang} className="px-2 py-0.5 border border-border bg-white/5 rounded text-[9px] font-mono text-muted">
                                  {lang}: {pct}%
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass border border-border rounded-2xl p-8 text-center text-xs text-muted flex flex-col items-center justify-center gap-3">
                  <FolderGit2 size={32} className="text-muted/30" />
                  <p>GitHub account has not been integrated or connected by this student yet.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Milestone Submissions */}
          {activeTab === 'submissions' && (
            <div className="space-y-6">
              {submissions && submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.map((sub) => (
                    <div key={sub._id} className="glass border border-border rounded-2xl p-5 bg-void/35 space-y-4 hover:border-accent/40 transition-colors">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <span className="text-[9px] text-accent uppercase font-bold tracking-wider block">Submission Traced</span>
                          <h4 className="text-sm font-bold text-text">{sub.taskTitle}</h4>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${sub.status === 'Completed'
                          ? 'bg-emerald/10 border-emerald/20 text-emerald'
                          : sub.status === 'Failed'
                            ? 'bg-rose/10 border-rose/20 text-rose'
                            : 'bg-amber/10 border-amber/20 text-amber'
                        }`}>
                          {sub.status}
                        </span>
                      </div>

                      {sub.submissionType === 'github' && (
                        <div className="flex flex-wrap gap-4 p-3 bg-void/50 border border-border rounded-xl text-[10px] text-muted font-mono">
                          <div>
                            Branch: <span className="font-semibold text-text">{sub.githubBranch || 'main'}</span>
                          </div>
                          {sub.githubCommitHash && (
                            <div>
                              Commit: <span className="font-semibold text-text">{sub.githubCommitHash}</span>
                            </div>
                          )}
                          {sub.githubUrl && (
                            <div className="truncate max-w-full">
                              URL: <a href={sub.githubUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{sub.githubUrl}</a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Code grader scorecard */}
                      {sub.evaluation ? (
                        <div className="space-y-4 pt-2 border-t border-border/40">
                          {/* Code scores grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center text-xs">
                            <div className="p-2.5 bg-void/50 border border-border rounded-xl">
                              <span className="text-[9px] text-muted uppercase block">Technical Score</span>
                              <strong className="text-text font-mono text-sm">{sub.evaluation.technicalScore}/100</strong>
                            </div>
                            <div className="p-2.5 bg-void/50 border border-border rounded-xl">
                              <span className="text-[9px] text-muted uppercase block">Architecture</span>
                              <strong className="text-text font-mono text-sm">{sub.evaluation.architectureScore}/100</strong>
                            </div>
                            <div className="p-2.5 bg-void/50 border border-border rounded-xl">
                              <span className="text-[9px] text-muted uppercase block">Code Quality</span>
                              <strong className="text-text font-mono text-sm">{sub.evaluation.codeQualityScore}/100</strong>
                            </div>
                            <div className="p-2.5 bg-void/50 border border-border rounded-xl">
                              <span className="text-[9px] text-muted uppercase block">Documentation</span>
                              <strong className="text-text font-mono text-sm">{sub.evaluation.documentationScore}/100</strong>
                            </div>
                            <div className="p-2.5 bg-void/50 border border-border rounded-xl">
                              <span className="text-[9px] text-muted uppercase block">GitHub Score</span>
                              <strong className="text-violet font-mono text-sm">{sub.evaluation.githubScore || 0}/100</strong>
                            </div>
                            <div className="p-2.5 bg-void/50 border border-border rounded-xl col-span-2 sm:col-span-1">
                              <span className="text-[9px] text-muted uppercase block">Problem Solving</span>
                              <strong className="text-emerald font-mono text-sm">{sub.evaluation.overallScore}/100</strong>
                            </div>
                          </div>

                          {/* Strengths and weaknesses block */}
                          <div className="grid sm:grid-cols-2 gap-4 text-[11px] text-muted">
                            <div className="space-y-1">
                              <span className="text-[9px] text-emerald font-bold uppercase tracking-wider block">Strengths</span>
                              {sub.evaluation.strengths?.map((st, i) => <p key={i}>✓ {st}</p>) || <p>None highlighted.</p>}
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] text-rose font-bold uppercase tracking-wider block">Weaknesses</span>
                              {sub.evaluation.weaknesses?.map((wk, i) => <p key={i}>• {wk}</p>) || <p>None highlighted.</p>}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted italic">Audit grade not computed yet (in progress/failed).</p>
                      )}
                      <div className="text-[10px] text-dim text-right font-mono">
                        Submitted: {new Date(sub.submittedAt).toLocaleString()} via {sub.submissionType.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-10 text-xs text-muted">No deliverables submitted by this candidate yet.</p>
              )}
            </div>
          )}

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
                  readOnly
                  value={companyName}
                  className="w-full bg-input-bg border border-border/50 rounded-xl px-3.5 py-2 text-xs text-muted outline-none cursor-not-allowed opacity-70"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">Job Role</label>
                  <input
                    type="text"
                    placeholder="e.g. AI Research Intern"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    className="w-full bg-input-bg border border-border rounded-xl px-3.5 py-2 text-xs text-text outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">Package (LPA)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="e.g. 6"
                    value={salaryPackage}
                    onChange={(e) => setSalaryPackage(e.target.value)}
                    className="w-full bg-input-bg border border-border rounded-xl px-3.5 py-2 text-xs text-text outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">Offer Message / Terms</label>
                <textarea
                  required
                  rows={5}
                  placeholder={`Dear ${studentProfile.fullName.split(' ')[0] || 'Student'},\n\nFollowing our review of your developer metrics, we are excited to offer you a simulated AI Research Intern role at our company. The internship will cover Vector Databases, semantic search architectures, and RAG pipelines...`}
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  className="w-full bg-input-bg border border-border rounded-xl px-3.5 py-2 text-xs text-text outline-none focus:border-accent resize-none"
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
