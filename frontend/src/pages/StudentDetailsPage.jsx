import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { ArrowLeft, User, Mail, GraduationCap, Calendar, GitCommit, GitPullRequest, Code, Award, FolderGit2, BookOpen } from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';
import { getStudentDetails } from '../store/slices/collegeSlice.js';
import { useNavigation } from '../context/NavigationContext';

export default function StudentDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { navigate, addToast } = useNavigation();
  const { selectedStudent, loading, error } = useSelector((state) => state.college);

  useEffect(() => {
    dispatch(getStudentDetails(id));
  }, [dispatch, id]);

  if (loading && !selectedStudent) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-text">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted font-semibold tracking-widest uppercase">Compiling cohort record...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedStudent) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-text">
        <div className="text-center space-y-4">
          <h2 className="text-sm font-bold text-rose">Failed to load student record</h2>
          <p className="text-xs text-muted">The requested student ID is missing or unauthorized.</p>
          <button
            onClick={() => navigate('college/students')}
            className="px-4 py-2 border border-border text-xs rounded-xl hover:bg-white/5 cursor-pointer"
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  const { studentProfile, internshipProgress, githubAnalytics, certificates } = selectedStudent;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 space-y-6 relative z-10">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <button
            onClick={() => navigate('college/students')}
            className="inline-flex items-center gap-2 text-xs text-muted hover:text-text hover:bg-white/5 px-3 py-1.5 rounded-xl border border-border transition-colors cursor-pointer"
          >
            <ArrowLeft size={12} />
            <span>Students Directory</span>
          </button>
          <span className="text-[10px] font-mono bg-white/5 border border-border px-3 py-1 rounded-full text-muted uppercase">
            Student Audit Dashboard
          </span>
        </div>

        {/* Student Profile Card */}
        <div className="glass border border-border rounded-3xl p-6 sm:p-8 bg-void/35 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-indigo-500 to-violet" />
          
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left w-full">
            <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-accent/20 shrink-0 shadow-lg shadow-accent/5">
              <img src={studentProfile.avatar || 'https://via.placeholder.com/150'} alt="" className="h-full w-full object-cover" />
            </div>
            
            <div className="space-y-2 flex-1">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-text">{studentProfile.fullName}</h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted justify-center sm:justify-start">
                <span className="flex items-center gap-1.5"><Mail size={12} className="text-accent" /> {studentProfile.email}</span>
                <span className="flex items-center gap-1.5"><GraduationCap size={12} className="text-accent" /> {studentProfile.course} (Year {studentProfile.year})</span>
                <span className="flex items-center gap-1.5"><Calendar size={12} className="text-accent" /> Enrolled: {new Date(studentProfile.createdAt).toLocaleDateString()}</span>
              </div>
              
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
        </div>

        {/* Analytics Breakdown Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Internship Analytics */}
          <div className="glass border border-border rounded-2xl p-6 bg-void/25 flex flex-col justify-between min-h-[300px]">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
                <BookOpen size={15} className="text-violet" />
                <h3 className="text-xs font-bold text-text uppercase tracking-wider">Internship Progress Diagnostics</h3>
              </div>

              {internshipProgress ? (
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] text-muted block font-bold uppercase tracking-widest">Active Internship Track</span>
                    <span className="text-sm font-bold text-text">{internshipProgress.careerTrack}</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-muted">Milestones Completed Percentage</span>
                      <span className="text-accent">{internshipProgress.completionPercentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 border border-border rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-accent to-violet rounded-full" style={{ width: `${internshipProgress.completionPercentage}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-muted block uppercase font-semibold">Track Difficulty</span>
                      <span className="text-xs font-bold text-text">{internshipProgress.currentLevel}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted block uppercase font-semibold">Internship Status</span>
                      <span className={`text-xs font-bold uppercase ${internshipProgress.status === 'completed' ? 'text-emerald' : 'text-accent'}`}>{internshipProgress.status}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-xs text-muted">
                  Student has not initialized any career pathway or simulated internship track.
                </div>
              )}
            </div>
          </div>

          {/* GitHub Integration Logs */}
          <div className="glass border border-border rounded-2xl p-6 bg-void/25 flex flex-col justify-between min-h-[300px]">
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
                    <div className="grid grid-cols-3 gap-3 text-center py-2 border-t border-b border-border/30">
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
                    <span className="text-[9px] text-muted uppercase font-bold block mb-1">Top Languages</span>
                    <div className="flex gap-2 flex-wrap">
                      {githubAnalytics.contributions[0]?.languages && Object.entries(githubAnalytics.contributions[0].languages).map(([lang, pct]) => (
                        <span key={lang} className="text-[9px] px-2 py-0.5 border border-border/80 bg-white/5 rounded-full">
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

        {/* Certificates & Achievements */}
        <div className="glass border border-border rounded-2xl p-6 bg-void/20 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
            <Award size={15} className="text-emerald" />
            <h3 className="text-xs font-bold text-text uppercase tracking-wider">Internship Credentials & Certificates</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <div key={cert.certificateId} className="p-4 bg-emerald/5 border border-emerald/10 rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted font-bold block uppercase tracking-wider">Credential ID: {cert.certificateId}</span>
                  <h4 className="text-xs font-bold text-text">{cert.roleTitle}</h4>
                  <p className="text-[10px] text-muted">{cert.companyName} · Grade {cert.grade}/100</p>
                </div>
                <button
                  onClick={() => navigate(`college/certificates`)}
                  className="px-2.5 py-1 bg-white/5 border border-border rounded-lg text-[9px] text-text hover:bg-white/10 hover:border-emerald font-semibold transition-all cursor-pointer"
                >
                  Verify Seal
                </button>
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
    </div>
  );
}
