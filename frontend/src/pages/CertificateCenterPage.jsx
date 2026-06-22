import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Download, ShieldCheck, Copy, Calendar } from 'lucide-react'
import { FaLinkedin } from 'react-icons/fa6'
import { useNavigation } from '../context/NavigationContext'
import useAuth from '../hooks/useAuth'
import axiosInstance from '../api/axios.js'

export default function CertificateCenterPage() {
  const { addToast } = useNavigation()
  const { user } = useAuth()
  const [verificationCode, setVerificationCode] = useState('IX-92-2026')
  const [verifiedData, setVerifiedData] = useState(null)
  const [isScreenshotLocked, setIsScreenshotLocked] = useState(false)
  const [certDetails, setCertDetails] = useState({
    completionPercentage: 0,
    requiredPercentage: 80,
    isEligible: false,
    grade: 0,
    verificationCode: 'IX-92-2026',
    issueDate: 'June 20, 2026',
    company: 'NeuralMind Technologies',
    roleTitle: 'AI Research Intern',
    manager: 'Sarah Johnson'
  })

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await axiosInstance.get('/api/careers/certificate-progress')
        if (res.data?.success && res.data?.data) {
          setCertDetails(res.data.data)
          setVerificationCode(res.data.data.verificationCode)
        }
      } catch (err) {
        console.error('Failed to load certificate progress:', err)
      }
    }
    fetchProgress()
  }, [])

  useEffect(() => {
    const triggerLock = () => {
      setIsScreenshotLocked(true)
      addToast('Security protection: Screenshot attempt detected. Certificate view locked.', 'warning')
    }

    const handleKeyDown = (e) => {
      // Print Screen
      if (e.key === 'PrintScreen') {
        triggerLock()
      }
      // Mac Screenshot combination: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
      if (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) {
        triggerLock()
      }
      // Print/Save combinations: Ctrl+P, Ctrl+S
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's')) {
        triggerLock()
      }
    }

    // Windows Win+Shift+S / Snipping Tool focus loss trigger
    const handleBlur = () => {
      // Snipping Tool or screenshot shortcut takes window focus away
      triggerLock()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('blur', handleBlur)
    }
  }, [addToast])

  const completionPercentage = certDetails.completionPercentage
  const requiredPercentage = certDetails.requiredPercentage

  const handleVerify = (e) => {
    e.preventDefault()
    if (completionPercentage < requiredPercentage) {
      addToast('Verification services are locked until tasks progress requirements are met.', 'error')
      return
    }
    if (verificationCode.trim() === certDetails.verificationCode) {
      setVerifiedData({
        recipient: user?.fullName || 'Arjun Kapoor',
        company: certDetails.company,
        track: certDetails.roleTitle,
        grade: `${certDetails.grade}/100`,
        date: certDetails.issueDate,
        status: 'Active & Verified'
      })
      addToast('Certificate verified successfully!', 'success')
    } else {
      addToast(`Invalid credential ID. Try "${certDetails.verificationCode}"`, 'error')
      setVerifiedData(null)
    }
  }

  const handleDownload = () => {
    if (completionPercentage < requiredPercentage) {
      addToast(`You must complete at least ${requiredPercentage}% of your tasks to download your certificate. Current progress is ${completionPercentage}%.`, 'error')
      return
    }
    addToast('Opening print dialog to save certificate...', 'info')
    setTimeout(() => {
      window.print()
    }, 500)
  }

  const handleShare = () => {
    if (completionPercentage < requiredPercentage) {
      addToast(`You must complete at least ${requiredPercentage}% of your tasks to share your certificate. Current progress is ${completionPercentage}%.`, 'error')
      return
    }
    addToast('Post shared to your LinkedIn feed!', 'success')
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/#/verify/${verificationCode}`)
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

        {/* Lock notice alert if progress is below required threshold */}
        {completionPercentage < requiredPercentage && (
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-500 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-bold uppercase tracking-wider block mb-0.5">Certificate Locked</span>
              <span>You must complete at least {requiredPercentage}% of your assigned task sprint milestones to unlock certificate downloads and sharing. Current completion progress is {completionPercentage}%.</span>
            </div>
            <div className="shrink-0 font-mono font-bold text-sm bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded">
              {completionPercentage}% / {requiredPercentage}% Completed
            </div>
          </div>
        )}

        {/* Content split */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Certificate Preview side */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Glowing Certificate Card */}
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                html, body {
                  background: #ffffff !important;
                  color: #000000 !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  height: 100vh !important;
                  max-height: 100vh !important;
                  overflow: hidden !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                body * {
                  visibility: hidden !important;
                }
                .certificate-card-print, .certificate-card-print * {
                  visibility: visible !important;
                }
                .certificate-card-print {
                  position: absolute !important;
                  left: 50% !important;
                  top: 50% !important;
                  transform: translate(-50%, -50%) !important;
                  width: 680px !important;
                  height: 440px !important;
                  border: 2px solid #f59e0b !important;
                  background: #09090b !important;
                  background-image: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(124, 58, 237, 0.15), #09090b) !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.4) !important;
                  margin: 0 !important;
                  padding: 40px !important;
                  border-radius: 16px !important;
                  box-sizing: border-box !important;
                  display: flex !important;
                  flex-direction: column !important;
                  justify-content: space-between !important;
                }
                .certificate-card-print, 
                .certificate-card-print span, 
                .certificate-card-print h3, 
                .certificate-card-print p,
                .certificate-card-print div {
                  color: #ffffff !important;
                }
                .certificate-card-print .text-muted {
                  color: #a1a1aa !important;
                }
                .certificate-card-print .text-amber-500, 
                .certificate-card-print .text-amber-500\/80 {
                  color: #f59e0b !important;
                }
                .certificate-card-print .text-accent {
                  color: #a78bfa !important;
                }
                .certificate-card-print .absolute {
                  border: 1px dashed rgba(245, 158, 11, 0.3) !important;
                }
                @page {
                  size: landscape;
                  margin: 0;
                }
              }
            ` }} />
            <div className="relative max-w-2xl mx-auto">
              {completionPercentage < requiredPercentage ? (
                /* Permanent Lock Out when under 80% tasks */
                <div className="relative border border-dashed border-border rounded-2xl p-6 sm:p-10 bg-void/50 overflow-hidden text-center shadow-xl space-y-8 flex flex-col justify-center items-center min-h-[460px]">
                  <div className="absolute inset-0 bg-void/60 backdrop-blur-md rounded-2xl z-10 flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="h-16 w-16 rounded-full border border-amber-500/20 flex items-center justify-center bg-amber-500/5 text-amber-500 animate-pulse">
                      <Award size={32} />
                    </div>
                    <div className="space-y-2 max-w-sm">
                      <h4 className="font-display font-bold text-base text-text uppercase tracking-wider">Credential Locked</h4>
                      <p className="text-xs text-muted leading-relaxed">
                        You must complete at least <strong>{requiredPercentage}%</strong> of your internship tasks to unlock the certificate, credentials, and verification tools.
                      </p>
                      <div className="pt-2 w-full">
                        <div className="w-full bg-void border border-border h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-amber-500 to-violet h-full rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(completionPercentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-amber-500 font-bold block mt-1">
                          {completionPercentage}% / {requiredPercentage}% Tasks Completed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Active Certificate with Screenshot Protection Overlay */
                <div className="relative">
                  <div className="certificate-card-print relative border border-amber-500/30 rounded-2xl p-6 sm:p-10 bg-gradient-to-br from-amber-500/5 via-violet/5 to-void overflow-hidden text-center glow-accent shadow-2xl space-y-8 flex flex-col justify-between min-h-[460px]">
                    {/* Outer double borders */}
                    <div className="absolute inset-2 border border-dashed border-amber-500/10 rounded-xl pointer-events-none" />
                    
                    {/* Top border seal */}
                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="InternX Logo" className="h-6 w-6 object-contain" />
                        <span className="text-[9px] font-mono tracking-widest text-muted">INTERNX CREDENTIAL</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-mono block text-amber-500 font-semibold">ID: {certDetails.verificationCode}</span>
                        <span className="text-[7px] text-muted block">VERIFIED RECORD</span>
                      </div>
                    </div>

                    {/* Certificate Content text */}
                    <div className="space-y-4 relative z-10">
                      <span className="text-[9px] uppercase tracking-[0.25em] text-amber-500/80 font-bold block">Certificate of Accomplishment</span>
                      <h3 className="font-display text-2xl font-bold text-text">{user?.fullName || 'Arjun Kapoor'}</h3>
                      <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
                        has successfully completed all milestones and sprints of the simulated professional internship as a
                        <span className="text-text font-bold block mt-1 text-sm">{certDetails.roleTitle}</span>
                        at the host company
                        <span className="text-accent font-bold block mt-1 text-sm">{certDetails.company}</span>
                      </p>
                    </div>

                    {/* Seals, Dates, Signatures */}
                    <div className="grid grid-cols-4 items-end pt-6 relative z-10 gap-2">
                      
                      {/* Date */}
                      <div className="text-left text-[9px] text-muted space-y-1">
                        <span>DATE OF ISSUE:</span>
                        <span className="font-bold text-text block whitespace-nowrap">{certDetails.issueDate}</span>
                      </div>

                      {/* QR Code */}
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <div className="bg-white p-1 rounded border border-amber-500/20">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(`${window.location.origin}/#/verify/${verificationCode}`)}`} 
                            alt="Verification QR Code" 
                            className="h-10 w-10 object-contain"
                          />
                        </div>
                        <span className="text-[7px] text-muted uppercase block font-semibold tracking-wider whitespace-nowrap">Scan to Verify</span>
                      </div>

                      {/* Seal Icon */}
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-12 w-12 rounded-full border-2 border-amber-500/30 flex items-center justify-center bg-amber-500/5 text-amber-500 animate-pulse">
                          <Award size={22} />
                        </div>
                        <span className="text-[7px] text-muted uppercase mt-1 block font-semibold tracking-wider whitespace-nowrap">Verified Seal</span>
                      </div>

                      {/* Signature */}
                      <div className="text-right text-[9px] text-muted space-y-1">
                        <span>AUTHORIZED MANAGER:</span>
                        <span className="font-bold text-text block font-mono italic whitespace-nowrap">{certDetails.manager}</span>
                      </div>

                    </div>
                  </div>

                  {/* Screenshot Protection Lock Overlay */}
                  <AnimatePresence>
                    {isScreenshotLocked && (
                      <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-void/95 flex flex-col items-center justify-center p-6 text-center z-20 space-y-4 rounded-2xl border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.15)]"
                      >
                        <div className="h-14 w-14 rounded-full border border-red-500/30 flex items-center justify-center bg-red-500/10 text-red-500 animate-bounce">
                          <ShieldCheck size={28} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-display font-bold text-sm text-red-500 uppercase tracking-wider">Screenshot Attempt Blocked</h4>
                          <p className="text-xs text-muted max-w-sm leading-relaxed">
                            For security and verification integrity, screenshots are disabled on this page. Please use the official <strong>Download PDF</strong> button below to save your verified certificate.
                          </p>
                        </div>
                        <button
                          onClick={() => setIsScreenshotLocked(false)}
                          className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold rounded-xl text-text transition-all cursor-pointer"
                        >
                          Acknowledge & Unlock View
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap gap-3 justify-center max-w-xl mx-auto pt-2">
              <button
                disabled={completionPercentage < requiredPercentage}
                onClick={handleDownload}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-border text-xs font-semibold rounded-xl transition-all ${
                  completionPercentage < requiredPercentage
                    ? 'bg-surface-muted/5 text-text/30 cursor-not-allowed opacity-50'
                    : 'bg-surface-muted/10 text-text hover:border-border-strong hover:bg-surface-muted/20 cursor-pointer'
                }`}
              >
                <Download size={14} className={completionPercentage < requiredPercentage ? 'text-muted' : 'text-accent'} />
                <span>{completionPercentage < requiredPercentage ? 'Download PDF (Locked)' : 'Download PDF'}</span>
              </button>
              
              <button
                disabled={completionPercentage < requiredPercentage}
                onClick={handleShare}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  completionPercentage < requiredPercentage
                    ? 'bg-surface-muted/5 text-text/30 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-accent to-violet text-white hover:shadow-lg cursor-pointer'
                }`}
              >
                <FaLinkedin size={14} />
                <span>{completionPercentage < requiredPercentage ? 'Share to LinkedIn (Locked)' : 'Share to LinkedIn'}</span>
              </button>
            </div>

          </div>

          {/* Verification input side */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Search lookup box */}
            {completionPercentage < requiredPercentage ? (
              <div className="glass border border-border rounded-2xl p-6 bg-void/25 space-y-4 opacity-75">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-muted" />
                  <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Credential Verification</h4>
                </div>

                <div className="p-4 rounded-xl border border-border bg-void/50 text-center space-y-2">
                  <p className="text-[10px] text-muted leading-relaxed font-sans">
                    Verification services are locked until certificate generation requirements (80% sprint completion) are met.
                  </p>
                  <span className="text-[11px] font-bold text-amber-500 font-mono block">
                    STATUS: LOCKED
                  </span>
                </div>
              </div>
            ) : (
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
            )}

          </div>

        </div>

      </div>
    </div>
  )
}
