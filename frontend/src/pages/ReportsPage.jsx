import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GraduationCap, Award, FileText, Download, Play, Eye } from 'lucide-react';
import { getReports } from '../store/slices/collegeSlice.js';

export default function ReportsPage() {
  const dispatch = useDispatch();
  const { reports, loading } = useSelector((state) => state.college);

  const [reportType, setReportType] = useState('placement'); // placement, internships, skills, certificates
  const [reportFormat, setReportFormat] = useState('csv'); // csv, json
  const [compiledPreview, setCompiledPreview] = useState(null);

  const handleCompile = async () => {
    try {
      const actionResult = await dispatch(getReports(reportType)).unwrap();
      setCompiledPreview(actionResult.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = () => {
    if (!compiledPreview) return;

    let mimeType = "data:text/json;charset=utf-8,";
    let extension = ".json";
    let payload = JSON.stringify(compiledPreview, null, 2);

    if (reportFormat === 'csv') {
      mimeType = "data:text/csv;charset=utf-8,";
      extension = ".csv";
      
      // Convert different structures to CSV strings
      if (reportType === 'placement') {
        const rows = [
          ["Full Name", "Course", "Track", "Internship Progress Score"],
          ...compiledPreview.topPerformers.map(t => [t.fullName, t.course, t.track, `${t.score}%`]),
          ...compiledPreview.riskStudents.map(r => [r.fullName, r.course, r.track, `${r.score}%`])
        ];
        payload = rows.map(e => e.join(",")).join("\n");
      } else if (reportType === 'internships') {
        const rows = [
          ["Active Internships", "Completed Internships", "Total Enrollments", "Average Sim Grade"],
          [compiledPreview.activeInternships, compiledPreview.completedInternships, compiledPreview.totalEnrollments, `${compiledPreview.averageInternshipScore}/100`],
          [],
          ["Department Name", "Code", "Total Enrolled", "Active Sprints", "Completed Sprints", "Completion Rate"],
          ...compiledPreview.departmentStats.map(d => [d.departmentName, d.departmentCode, d.totalStudents, d.activeInternships, d.completedInternships, `${d.completionRate}%`])
        ];
        payload = rows.map(e => e.join(",")).join("\n");
      } else if (reportType === 'skills') {
        const rows = [
          ["Skill Title", "Type", "Student Count / Percent"],
          ...compiledPreview.topSkills.map(s => [s.skill, "Strength", s.count]),
          ...compiledPreview.weakSkills.map(w => [w.skill, "Weakness / Gap", `${w.count} Students`]),
          [],
          ["Track Name", "Enrolled Count"],
          ...compiledPreview.skillDistribution.map(sd => [sd.track, sd.count])
        ];
        payload = rows.map(e => e.join(",")).join("\n");
      } else if (reportType === 'certificates') {
        const rows = [
          ["Certificate ID", "Recipient Name", "Track / Role", "Grade / Score", "Issue Date", "Status"],
          ...compiledPreview.certificates.map(c => [c.certificateId, c.recipientName, c.roleTitle, `${c.grade}%`, new Date(c.issueDate).toLocaleDateString(), c.status])
        ];
        payload = rows.map(e => e.join(",")).join("\n");
      }
    }

    const encodedUri = encodeURI(mimeType + payload);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mit_institutional_${reportType}_report${extension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 space-y-8 relative z-10">
        
        {/* Title */}
        <div className="border-b border-border pb-6">
          <span className="text-xs font-semibold text-violet uppercase tracking-[0.2em] block">Data Compilation</span>
          <h2 className="font-display font-bold text-3xl mt-1">Institutional Report Generator</h2>
          <p className="text-xs text-muted mt-1">Compile placement summaries, skills gaps audits, and credentials logs.</p>
        </div>

        {/* Generator Controls Split */}
        <div className="grid md:grid-cols-12 gap-8 items-stretch">
          
          {/* Controls Panel */}
          <div className="md:col-span-5 glass border border-border rounded-2xl p-6 bg-void/25 flex flex-col justify-between min-h-[350px]">
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
                <FileText size={16} className="text-accent" />
                <h4 className="text-xs font-bold text-text uppercase tracking-wider">Report Configuration</h4>
              </div>

              {/* Select Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted uppercase font-bold tracking-wider">Data Category</label>
                <select
                  value={reportType}
                  onChange={(e) => { setReportType(e.target.value); setCompiledPreview(null); }}
                  className="w-full bg-void/50 border border-border rounded-xl py-2 px-3 outline-none text-text focus:border-accent text-xs"
                >
                  <option value="placement">Placement Readiness Diagnostics</option>
                  <option value="internships">Internship Analytics & Milestones</option>
                  <option value="skills">Skills Distribution & Gaps Audits</option>
                  <option value="certificates">Issued Credentials Log</option>
                </select>
              </div>

              {/* Select Format */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted uppercase font-bold tracking-wider">Download Format</label>
                <div className="flex gap-4 text-xs font-semibold text-muted">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value="csv"
                      checked={reportFormat === 'csv'}
                      onChange={() => setReportFormat('csv')}
                      className="accent-accent"
                    />
                    <span className={reportFormat === 'csv' ? 'text-text' : ''}>CSV Sheet</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value="json"
                      checked={reportFormat === 'json'}
                      onChange={() => setReportFormat('json')}
                      className="accent-accent"
                    />
                    <span className={reportFormat === 'json' ? 'text-text' : ''}>JSON Stream</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-border/40 mt-6">
              <button
                onClick={handleCompile}
                disabled={loading}
                className="flex-1 py-3 bg-white/5 border border-border hover:bg-white/10 hover:border-accent text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Play size={12} className="text-accent" />
                <span>Compile Preview</span>
              </button>
              
              <button
                onClick={handleDownload}
                disabled={!compiledPreview}
                className="flex-1 py-3 bg-gradient-to-r from-accent to-violet text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-30 disabled:pointer-events-none hover:shadow-lg transition-all cursor-pointer"
              >
                <Download size={12} />
                <span>Download Report</span>
              </button>
            </div>
          </div>

          {/* Compiled Previews Panel */}
          <div className="md:col-span-7 glass border border-border rounded-2xl p-6 bg-void/25 flex flex-col justify-between min-h-[350px]">
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center gap-2 border-b border-border/40 pb-2.5 shrink-0">
                <Eye size={16} className="text-violet" />
                <h4 className="text-xs font-bold text-text uppercase tracking-wider">Compiled Output Preview</h4>
              </div>

              <div className="flex-1 bg-void/40 border border-border/60 rounded-xl p-4 overflow-y-auto max-h-[250px] font-mono text-[10px] text-muted">
                {compiledPreview ? (
                  <pre className="whitespace-pre-wrap leading-relaxed">
                    {JSON.stringify(compiledPreview, null, 2)}
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-center">
                    <p>Select configuration parameters and compile preview to review parsed datasets here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
