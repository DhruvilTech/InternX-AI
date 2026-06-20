import { useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Download, CheckCircle2, ShieldCheck, Copy, ExternalLink, Calendar } from 'lucide-react'
import { FaLinkedin } from 'react-icons/fa6'
import { useNavigation } from '../context/NavigationContext'

export default function CertificateCenterPage() {
  const { internship, addToast } = useNavigation()
  const [verificationCode, setVerificationCode] = useState('IX-92-2026')
  const [verifiedData, setVerifiedData] = useState(null)

  const companyInfo = internship || {
    name: 'NeuralMind Technologies',
    manager: 'Sarah Johnson',
    department: 'Artificial Intelligence',
    roleTitle: 'AI Research Intern',
  }

  const handleVerify = (e) => {
    e.preventDefault()
    if (verificationCode.trim() === 'IX-92-2026') {
      setVerifiedData({
        recipient: 'Arjun Kapoor',
        company: companyInfo.name,
        track: companyInfo.roleTitle,
        grade: '92/100',
        date: 'June 20, 2026',
        status: 'Active & Verified'
      })
      addToast('Certificate verified successfully!', 'success')
    } else {
      addToast('Invalid credential ID. Try "IX-92-2026"', 'error')
      setVerifiedData(null)
    }
  }

  const handleDownload = () => {
    addToast('Generating PDF file stream...', 'info')
    setTimeout(() => {
      addToast('Certificate PDF downloaded successfully!', 'success')
    }, 1500)
  }

  const handleShare = () => {
    addToast('Post shared to your LinkedIn feed!', 'success')
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://internx.ai/verify/IX-92-2026')
    addToast('Verification link copied to clipboard!', 'success')
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 space-y-8 relative z-10">
        
        {/* Title */}
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em] block">Credentials Hub</span>
          <h2 className="font-display font-bold text-3xl mt-1">Certificate Center</h2>
          <p className="text-xs text-muted mt-1">Verify, download, or share your completed internship certificates.</p>
        </div>

        {/* Content split */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Certificate Preview side */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Glowing Certificate Card */}
            <div className="relative border border-amber-500/30 rounded-2xl p-6 sm:p-10 bg-gradient-to-br from-amber-500/5 via-violet/5 to-void overflow-hidden text-center glow-accent shadow-2xl space-y-8 flex flex-col justify-between min-h-[460px] max-w-2xl mx-auto">
              {/* Outer double borders */}
              <div className="absolute inset-2 border border-dashed border-amber-500/10 rounded-xl pointer-events-none" />
              
              {/* Top border seal */}
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-gradient-to-br from-amber-500 to-violet flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">IX</span>
                  </div>
                  <span className="text-[9px] font-mono tracking-widest text-muted">INTERNX CREDENTIAL</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono block text-amber-500 font-semibold">ID: IX-92-2026</span>
                  <span className="text-[7px] text-muted block">VERIFIED RECORD</span>
                </div>
              </div>

              {/* Certificate Content text */}
              <div className="space-y-4 relative z-10">
                <span className="text-[9px] uppercase tracking-[0.25em] text-amber-500/80 font-bold block">Certificate of Accomplishment</span>
                <h3 className="font-display text-2xl font-bold text-text">Arjun Kapoor</h3>
                <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
                  has successfully completed all milestones and sprints of the simulated professional internship as a
                  <span className="text-text font-bold block mt-1 text-sm">{companyInfo.roleTitle}</span>
                  at the host company
                  <span className="text-accent font-bold block mt-1 text-sm">{companyInfo.name}</span>
                </p>
              </div>

              {/* Seals, Dates, Signatures */}
              <div className="grid grid-cols-3 items-end pt-6 relative z-10">
                
                {/* Date */}
                <div className="text-left text-[9px] text-muted space-y-1">
                  <span>DATE OF ISSUE:</span>
                  <span className="font-bold text-text block">June 20, 2026</span>
                </div>

                {/* Seal Icon */}
                <div className="flex flex-col items-center justify-center">
                  <div className="h-14 w-14 rounded-full border-2 border-amber-500/30 flex items-center justify-center bg-amber-500/5 text-amber-500 animate-pulse">
                    <Award size={28} />
                  </div>
                  <span className="text-[7px] text-muted uppercase mt-2 block font-semibold tracking-wider">Verified Seal</span>
                </div>

                {/* Signature */}
                <div className="text-right text-[9px] text-muted space-y-1">
                  <span>AUTHORIZED MANAGER:</span>
                  <span className="font-bold text-text block font-mono italic">{companyInfo.manager}</span>
                </div>

              </div>

            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap gap-3 justify-center max-w-xl mx-auto pt-2">
              <button
                onClick={handleDownload}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-border bg-surface-muted/10 text-xs font-semibold rounded-xl text-text hover:border-border-strong hover:bg-surface-muted/20 transition-all cursor-pointer"
              >
                <Download size={14} className="text-accent" />
                <span>Download PDF</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg transition-all cursor-pointer"
              >
                <FaLinkedin size={14} />
                <span>Share to LinkedIn</span>
              </button>
            </div>

          </div>

          {/* Verification input side */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Search lookup box */}
            <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-accent" />
                <h4 className="text-xs font-bold text-text uppercase tracking-wider">Credential Verification</h4>
              </div>

              <form onSubmit={handleVerify} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Credential ID</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full bg-void/50 border border-border focus:border-accent text-xs rounded-xl py-2 px-3 outline-none text-text"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-surface-muted border border-border text-xs text-text hover:border-border-strong rounded-xl font-semibold cursor-pointer"
                >
                  Verify Authenticity
                </button>
              </form>

              {/* Results drawer */}
              {verifiedData && (
                <div className="p-3 bg-surface-muted/30 border border-border rounded-xl text-[10px] space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted">Holder:</span>
                    <span className="text-text font-bold">{verifiedData.recipient}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Host:</span>
                    <span className="text-text font-bold">{verifiedData.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Grade:</span>
                    <span className="text-emerald font-bold">{verifiedData.grade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Status:</span>
                    <span className="text-emerald font-bold">{verifiedData.status}</span>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="w-full mt-2 py-1.5 bg-void/50 hover:bg-void rounded border border-border flex items-center justify-center gap-1.5 text-[9px] text-accent font-semibold transition-colors"
                  >
                    <Copy size={10} />
                    <span>Copy Verification URL</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
