import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Award, ShieldCheck, Download, Search, CheckCircle2 } from 'lucide-react';
import { getCertificates } from '../store/slices/collegeSlice.js';
import axiosInstance from '../api/axios.js';

export default function CertificateManagementPage() {
  const dispatch = useDispatch();
  const { certificates, loading } = useSelector((state) => state.college);

  // Verification lookup states
  const [verificationCode, setVerificationCode] = useState('');
  const [verifiedData, setVerifiedData] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState(null);

  useEffect(() => {
    dispatch(getCertificates());
  }, [dispatch]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) return;

    setVerifyLoading(true);
    setVerifyError(null);
    setVerifiedData(null);

    try {
      const response = await axiosInstance.get(`/api/college/certificates/verify/${verificationCode}`);
      if (response.data?.success) {
        setVerifiedData(response.data.data);
      }
    } catch (err) {
      setVerifyError(err.response?.data?.message || 'Invalid certificate code.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const triggerDownload = (cert) => {
    // Generate a simple CSV line for downloading
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Credential ID,Recipient,Role Title,Grade,Issue Date,Status\n"
      + `${cert.certificateId},${cert.recipientName},${cert.roleTitle},${cert.grade},${new Date(cert.issueDate).toLocaleDateString()},${cert.status}`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `certificate_${cert.certificateId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 space-y-8 relative z-10">
        
        {/* Title */}
        <div className="border-b border-border pb-6">
          <span className="text-xs font-semibold text-emerald uppercase tracking-[0.2em] block">Credential Audit</span>
          <h2 className="font-display font-bold text-3xl mt-1">Certificate Management & Verification</h2>
          <p className="text-xs text-muted mt-1">Verify cryptographically secure digital credentials and download internship reports.</p>
        </div>

        {/* Content split */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Certificate Verification Lookup Box */}
          <div className="lg:col-span-4 glass border border-border rounded-2xl p-6 bg-void/25 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-accent" />
                <h4 className="text-xs font-bold text-text uppercase tracking-wider">Credential Verification Gateway</h4>
              </div>

              <form onSubmit={handleVerify} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Credential ID / Hash</label>
                  <input
                    type="text"
                    placeholder="e.g. IX-92-2026"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full bg-void/50 border border-border focus:border-accent text-xs rounded-xl py-2 px-3 outline-none text-text"
                  />
                </div>
                <button
                  type="submit"
                  disabled={verifyLoading}
                  className="w-full py-2 bg-gradient-to-r from-accent to-violet text-white text-xs hover:shadow-lg rounded-xl font-semibold cursor-pointer flex items-center justify-center gap-2"
                >
                  {verifyLoading ? (
                    <div className="h-4.5 w-4.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck size={14} />
                      <span>Verify Authenticity</span>
                    </>
                  )}
                </button>
              </form>

              {/* Verify Results */}
              {verifiedData && (
                <div className="p-4 bg-emerald/5 border border-emerald/10 rounded-xl text-[10px] space-y-2 font-mono">
                  <div className="flex items-center gap-1.5 text-emerald font-bold mb-2">
                    <CheckCircle2 size={12} />
                    <span>Active & Verified</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-border/20">
                    <span className="text-muted">Holder:</span>
                    <span className="text-text font-bold">{verifiedData.recipient}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-border/20">
                    <span className="text-muted">Role:</span>
                    <span className="text-text font-bold">{verifiedData.track}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-border/20">
                    <span className="text-muted">Grade:</span>
                    <span className="text-emerald font-bold">{verifiedData.grade}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-muted">Issue Date:</span>
                    <span className="text-text font-bold">{verifiedData.date}</span>
                  </div>
                </div>
              )}

              {verifyError && (
                <div className="p-3 bg-rose/5 border border-rose/10 text-rose text-[10px] font-mono rounded-xl">
                  {verifyError}
                </div>
              )}
            </div>
          </div>

          {/* Certificate Logs Table */}
          <div className="lg:col-span-8 glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-accent" />
              <h3 className="text-xs font-bold text-text uppercase tracking-wider">Issued Credentials Log</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs text-muted text-left">
                <thead>
                  <tr className="border-b border-border bg-void/50 text-[10px] uppercase font-bold text-text">
                    <th className="p-3">Credential ID</th>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Track / Role</th>
                    <th className="p-3 text-center">Grade</th>
                    <th className="p-3 text-center">Issue Date</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert) => (
                    <tr key={cert._id} className="border-b border-border hover:bg-surface-muted/10 transition-colors">
                      <td className="p-3 font-mono font-bold text-text">{cert.certificateId}</td>
                      <td className="p-3 font-semibold text-text">{cert.recipientName}</td>
                      <td className="p-3">{cert.roleTitle}</td>
                      <td className="p-3 text-center font-bold text-emerald">{cert.grade}%</td>
                      <td className="p-3 text-center">{new Date(cert.issueDate).toLocaleDateString()}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => triggerDownload(cert)}
                          className="p-1.5 bg-white/5 border border-border hover:bg-white/10 hover:border-accent text-text rounded-lg transition-colors cursor-pointer"
                          title="Download Certificate CSV Data"
                        >
                          <Download size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {certificates.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-muted">
                        No digital credentials recorded for this college cohort.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
