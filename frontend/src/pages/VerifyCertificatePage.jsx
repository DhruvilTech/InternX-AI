import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, ShieldAlert, Award, Calendar, ChevronRight, GraduationCap } from 'lucide-react'
import axiosInstance from '../api/axios.js'

export default function VerifyCertificatePage() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [certData, setCertData] = useState(null)

  useEffect(() => {
    const verify = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axiosInstance.get(`/api/college/certificates/verify/${id}`)
        if (response.data?.success && response.data?.data) {
          setCertData(response.data.data)
        } else {
          setError('Failed to fetch certificate verification details.')
        }
      } catch (err) {
        console.error('Error verifying certificate:', err)
        setError(err.response?.data?.message || 'Invalid certificate credential ID. The signature or seal is unauthentic.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      verify()
    }
  }, [id])

  return (
    <div className="min-h-screen pt-24 pb-16 bg-void relative overflow-hidden text-text flex items-center justify-center">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl w-full mx-auto px-4 relative z-10">
        
        {/* InternX Branding Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <img src="/logo.png" alt="InternX Logo" className="h-8 w-8 object-contain" />
            <span className="font-display font-bold tracking-widest text-lg text-text">InternX</span>
          </Link>
          <span className="text-[10px] font-mono tracking-widest text-muted block uppercase">Secured Verification Registry</span>
        </div>

        {loading ? (
          /* Loading State Card */
          <div className="glass border border-border/60 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-accent/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-accent animate-spin" />
            </div>
            <p className="text-xs text-muted font-mono tracking-wider">CRYPTOGRAPHICALLY RESOLVING CREDENTIAL RECORD...</p>
          </div>
        ) : error ? (
          /* Error State Card */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass border border-red/30 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center space-y-6 glow-accent shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-red/5 pointer-events-none" />
            <div className="h-16 w-16 rounded-full bg-red/10 border border-red/20 flex items-center justify-center text-red">
              <ShieldAlert size={32} className="animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-display font-bold text-xl text-red">Verification Failed</h3>
              <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
                {error}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-red/10 bg-red/5 text-[10px] font-mono text-red/80 max-w-sm">
              CREDENTIAL CODE: {id}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 w-full max-w-xs justify-center">
              <Link
                to="/"
                className="px-5 py-2.5 bg-surface-muted border border-border text-xs text-text hover:border-border-strong rounded-xl font-semibold transition-all text-center"
              >
                Back to Home
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Success Verification Card */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass border border-emerald/30 rounded-3xl p-8 sm:p-12 glow-accent shadow-2xl relative overflow-hidden space-y-8 flex flex-col justify-between"
          >
            {/* Soft inner green light */}
            <div className="absolute inset-0 bg-emerald/5 pointer-events-none" />

            {/* Glowing Verified Header */}
            <div className="flex flex-col items-center text-center space-y-3 relative z-10">
              <div className="h-16 w-16 rounded-full bg-emerald/10 border border-emerald/20 flex items-center justify-center text-emerald shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <ShieldCheck size={36} />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-emerald font-bold uppercase">AUTHENTIC & SECURED RECORD</span>
                <h3 className="font-display font-bold text-2xl text-text mt-1">Verified Internship Credential</h3>
              </div>
            </div>

            {/* Verification details table */}
            <div className="bg-void/50 border border-border rounded-2xl p-6 space-y-4 relative z-10">
              <div className="grid grid-cols-2 py-2 border-b border-border/40 text-xs items-center">
                <span className="text-muted font-medium">Recipient Name</span>
                <span className="text-text font-bold text-right">{certData.recipient}</span>
              </div>
              <div className="grid grid-cols-2 py-2 border-b border-border/40 text-xs items-center">
                <span className="text-muted font-medium">Internship Track</span>
                <span className="text-text font-bold text-right">{certData.track}</span>
              </div>
              <div className="grid grid-cols-2 py-2 border-b border-border/40 text-xs items-center">
                <span className="text-muted font-medium">Host Institution</span>
                <span className="text-text font-bold text-right">NeuralMind Technologies</span>
              </div>
              <div className="grid grid-cols-2 py-2 border-b border-border/40 text-xs items-center">
                <span className="text-muted font-medium">Completion Grade</span>
                <span className="text-emerald font-bold text-right font-mono">{certData.grade}</span>
              </div>
              <div className="grid grid-cols-2 py-2 border-b border-border/40 text-xs items-center">
                <span className="text-muted font-medium">Date of Issue</span>
                <span className="text-text font-bold text-right">{certData.date}</span>
              </div>
              <div className="grid grid-cols-2 py-2 text-xs items-center">
                <span className="text-muted font-medium">Verification Code</span>
                <span className="text-accent font-bold font-mono text-right">{id}</span>
              </div>
            </div>

            {/* Validation Text */}
            <div className="p-4 rounded-xl border border-emerald/10 bg-emerald/5 text-xs text-muted/95 leading-relaxed text-center italic relative z-10">
              "This digital record confirms that the individual named above has successfully completed a professional simulated internship on the InternX AI platform, fulfilling all sprint requirements and review milestones assessed by our automated evaluation engines."
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full justify-center relative z-10">
              <Link
                to="/"
                className="flex-1 max-w-xs inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold rounded-xl hover:shadow-lg transition-all text-center"
              >
                <span>Explore InternX Platform</span>
                <ChevronRight size={14} />
              </Link>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  )
}
