import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Mail, Lock, User, KeyRound, ArrowRight, ShieldCheck, UploadCloud, Building2, GraduationCap, CheckCircle } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'
import { FaGithub } from 'react-icons/fa6'

export default function AuthPages() {
  const { navigate, loadDemoStudent, loadDemoRecruiter, loadDemoCollege, loadDemoAdmin, addPendingApproval, addToast } = useNavigation()
  const [authMode, setAuthMode] = useState('login') // login, signup, forgot, reset, otp
  
  // Registration Role selector
  const [signupRole, setSignupRole] = useState('student') // student, recruiter, college

  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [collegeName, setCollegeName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [uploadedDocName, setUploadedDocName] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      if (authMode === 'login') {
        loadDemoStudent('ai') // default demo
        navigate('dashboard')
        addToast('Welcome back, Arjun!', 'success')
      } else if (authMode === 'signup') {
        // Build pending approval payloads based on signupRole
        if (signupRole === 'student') {
          addPendingApproval('students', {
            id: 'stud-app-' + Date.now().toString().slice(-4),
            name: name || 'Anonymous Student',
            email: email,
            track: 'AI Engineer',
            idDoc: uploadedDocName || 'student_id_card.pdf',
            uploadedAt: 'Just now',
            status: 'pending'
          })
        } else if (signupRole === 'college') {
          addPendingApproval('colleges', {
            id: 'coll-app-' + Date.now().toString().slice(-4),
            name: collegeName || 'Accredited College',
            domain: email.split('@')[1] || 'edu',
            adminEmail: email,
            identityDoc: uploadedDocName || 'accreditation_proof.pdf',
            uploadedAt: 'Just now',
            status: 'pending'
          })
        } else if (signupRole === 'recruiter') {
          addPendingApproval('companies', {
            id: 'comp-app-' + Date.now().toString().slice(-4),
            name: companyName || 'Simulated Company LLC',
            domain: email.split('@')[1] || 'com',
            recruiterEmail: email,
            licenseDoc: uploadedDocName || 'business_license.pdf',
            uploadedAt: 'Just now',
            status: 'pending'
          })
        }

        setAuthMode('otp')
        addToast('Verification code transmitted!', 'info')
      } else if (authMode === 'otp') {
        if (otp.length < 4) {
          addToast('Please enter a valid 4-digit code', 'error')
        } else {
          // Log in based on role
          if (signupRole === 'student') {
            loadDemoStudent('ai')
            navigate('onboarding')
          } else if (signupRole === 'recruiter') {
            loadDemoRecruiter()
            navigate('recruiter_dashboard')
          } else if (signupRole === 'college') {
            loadDemoCollege()
            navigate('college_dashboard')
          }
          addToast('Verification successful!', 'success')
        }
      } else if (authMode === 'forgot') {
        setAuthMode('reset')
        addToast('Reset link generated!', 'info')
      } else if (authMode === 'reset') {
        setAuthMode('login')
        addToast('Password reset successfully. Please log in.', 'success')
      }
    }, 1200)
  }

  // Handle mock file selection clicks
  const simulateFileUpload = (fileName) => {
    setUploadedDocName(fileName)
    addToast(`Attached document: ${fileName}`, 'success')
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-12 pt-16 bg-void relative overflow-hidden text-text">
      {/* Background accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      {/* Left Column - Animated Showcase */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 border-r border-border bg-void/50 overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-accent to-violet flex items-center justify-center">
            <span className="text-sm font-bold text-white">IX</span>
          </div>
          <span className="text-md font-display font-semibold">InternX AI</span>
        </div>

        <div className="space-y-6 my-auto">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full text-xs text-accent"
          >
            <Sparkles size={12} />
            <span>AI-Driven Workspace</span>
          </motion.div>
          <h2 className="font-display text-4xl font-bold leading-tight">
            The ultimate runway <br />
            for <span className="text-gradient">tech careers</span>.
          </h2>
          <p className="text-sm text-muted max-w-md leading-relaxed">
            Gain verified professional experience by joining simulated AI companies. Build complex real-world code, and get audited by automated evaluations.
          </p>
        </div>

        <div className="text-xs text-muted flex gap-6">
          <span>© 2026 InternX AI</span>
          <a href="#" className="hover:text-text">Privacy Policy</a>
          <a href="#" className="hover:text-text">Terms of Service</a>
        </div>
      </div>

      {/* Right Column - Auth Card Container */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          layout
          className="w-full max-w-md glass-bright p-8 sm:p-10 rounded-2xl border border-border shadow-xl glow-accent relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {authMode === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6">
                  <h3 className="font-display text-2xl font-bold">Sign In</h3>
                  <p className="text-xs text-muted mt-1">Access your AI-powered workspace</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">Email Address</label>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                      <Mail size={14} className="text-muted" />
                      <input
                        type="email"
                        required
                        placeholder="you@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent text-xs text-text outline-none border-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">Password</label>
                      <button
                        type="button"
                        onClick={() => setAuthMode('forgot')}
                        className="text-[10px] text-accent hover:text-accent-bright transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                      <Lock size={14} className="text-muted" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent text-xs text-text outline-none border-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold hover:shadow-lg hover:shadow-accent/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-6"
                  >
                    {loading ? (
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <span>Authenticate</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center mt-6">
                  <p className="text-xs text-muted">
                    New to InternX?{' '}
                    <button
                      onClick={() => {
                        setAuthMode('signup')
                        setSignupRole('student')
                        setUploadedDocName('')
                      }}
                      className="text-accent hover:text-accent-bright font-medium underline"
                    >
                      Create Account
                    </button>
                  </p>
                </div>

                {/* Direct Persona Quick logins */}
                <div className="border-t border-border pt-4 mt-6 text-center">
                  <p className="text-[10px] text-muted uppercase tracking-wider mb-2.5">Demo Portals (Quick Access)</p>
                  <div className="flex flex-wrap justify-center gap-1.5 text-[9px] font-semibold text-text">
                    <button
                      onClick={() => { loadDemoStudent('ai'); navigate('dashboard'); }}
                      className="px-2.5 py-1.5 rounded-lg bg-violet/10 border border-violet/25 hover:bg-violet/20 transition-colors"
                    >
                      Student (AI)
                    </button>
                    <button
                      onClick={() => { loadDemoRecruiter(); navigate('recruiter_dashboard'); }}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 transition-colors"
                    >
                      Recruiter
                    </button>
                    <button
                      onClick={() => { loadDemoCollege(); navigate('college_dashboard'); }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald/10 border border-emerald/25 hover:bg-emerald/20 transition-colors"
                    >
                      College
                    </button>
                    <button
                      onClick={() => { loadDemoAdmin(); navigate('admin_panel'); }}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan/10 border border-cyan/25 hover:bg-cyan/20 text-cyan-300 transition-colors"
                    >
                      Super Admin
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

            {authMode === 'signup' && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6">
                  <h3 className="font-display text-2xl font-bold">Create Account</h3>
                  <p className="text-xs text-muted mt-1">Select your account type to register</p>
                </div>

                {/* Account Type Tabs */}
                <div className="flex border border-border p-1 bg-void/50 rounded-xl mb-5 text-center text-xs">
                  {[
                    { id: 'student', label: 'Student', icon: User },
                    { id: 'college', label: 'College', icon: GraduationCap },
                    { id: 'recruiter', label: 'Recruiter', icon: Building2 }
                  ].map((tab) => {
                    const Icon = tab.icon
                    const active = signupRole === tab.id
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setSignupRole(tab.id)
                          setUploadedDocName('')
                        }}
                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 font-semibold transition-all ${
                          active
                            ? 'bg-gradient-to-r from-accent to-violet text-white shadow-md'
                            : 'text-muted hover:text-text'
                        }`}
                      >
                        <Icon size={12} />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                      {signupRole === 'student' ? 'Full Name' : signupRole === 'college' ? 'Director Name' : 'Recruiter Name'}
                    </label>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                      <User size={14} className="text-muted" />
                      <input
                        type="text"
                        required
                        placeholder={signupRole === 'student' ? 'Arjun Kapoor' : signupRole === 'college' ? 'Dean Arthur Pendelton' : 'Sarah Johnson'}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-transparent text-xs text-text outline-none border-none"
                      />
                    </div>
                  </div>

                  {/* Dynamic Organization Name */}
                  {signupRole !== 'student' && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                        {signupRole === 'college' ? 'College Name' : 'Company Name'}
                      </label>
                      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                        <Building2 size={14} className="text-muted" />
                        <input
                          type="text"
                          required
                          placeholder={signupRole === 'college' ? 'Massachusetts Institute of Technology' : 'NeuralMind Technologies'}
                          value={signupRole === 'college' ? collegeName : companyName}
                          onChange={(e) => signupRole === 'college' ? setCollegeName(e.target.value) : setCompanyName(e.target.value)}
                          className="w-full bg-transparent text-xs text-text outline-none border-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Email Address</label>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                      <Mail size={14} className="text-muted" />
                      <input
                        type="email"
                        required
                        placeholder={signupRole === 'student' ? 'you@university.edu' : signupRole === 'college' ? 'dean@mit.edu' : 'recruiting@company.com'}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent text-xs text-text outline-none border-none"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Password</label>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                      <Lock size={14} className="text-muted" />
                      <input
                        type="password"
                        required
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent text-xs text-text outline-none border-none"
                      />
                    </div>
                  </div>

                  {/* File upload credentials box */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                      {signupRole === 'student' ? 'Student ID Card (.pdf/.png)' : signupRole === 'college' ? 'Accreditation identity file (.pdf)' : 'Corporate business license (.pdf)'}
                    </label>

                    {uploadedDocName ? (
                      <div className="p-3 border border-emerald/30 bg-emerald/5 text-emerald rounded-xl flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={14} />
                          <span>{uploadedDocName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUploadedDocName('')}
                          className="text-[10px] text-muted hover:text-text hover:bg-white/5 px-2 py-1 rounded"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          const mockName = signupRole === 'student' ? 'student_id_mit.pdf' : signupRole === 'college' ? 'mit_accreditation_seal.pdf' : 'neuralmind_corp_license.pdf'
                          simulateFileUpload(mockName)
                        }}
                        className="border border-dashed border-border hover:border-accent/40 bg-void/30 p-4 rounded-xl text-center space-y-1 cursor-pointer group transition-colors flex flex-col justify-center"
                      >
                        <UploadCloud size={18} className="text-muted group-hover:text-accent mx-auto transition-colors" />
                        <span className="text-[10px] text-text font-bold block">Attach Verification Credential File</span>
                        <span className="text-[8px] text-muted block">Simulate upload click</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold hover:shadow-lg hover:shadow-accent/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-6"
                  >
                    {loading ? (
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <span>Submit Registration</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center mt-6">
                  <p className="text-xs text-muted">
                    Already registered?{' '}
                    <button
                      onClick={() => setAuthMode('login')}
                      className="text-accent hover:text-accent-bright font-medium underline"
                    >
                      Sign In instead
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {authMode === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center border border-accent/20 mb-3">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="font-display text-2xl font-bold">Two-Factor Verification</h3>
                  <p className="text-xs text-muted mt-1">We sent a verification code to check your email</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted text-center uppercase tracking-wider block">Verification Code</label>
                    <div className="flex justify-center">
                      <input
                        type="text"
                        required
                        maxLength={4}
                        placeholder="••••"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-32 bg-void/50 border border-border focus:border-accent text-center tracking-[0.6em] text-lg font-bold rounded-xl py-2 px-3 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold hover:shadow-lg hover:shadow-accent/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-6"
                  >
                    {loading ? (
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <span>Verify Code</span>
                    )}
                  </button>
                </form>

                <div className="text-center mt-6">
                  <button
                    onClick={() => {
                      setEmail('')
                      setAuthMode('signup')
                    }}
                    className="text-xs text-muted hover:text-text font-medium underline"
                  >
                    Back to Signup
                  </button>
                </div>
              </motion.div>
            )}

            {authMode === 'forgot' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6">
                  <h3 className="font-display text-2xl font-bold">Recover Access</h3>
                  <p className="text-xs text-muted mt-1">Enter your email and we'll send a password recovery link</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">Email Address</label>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                      <Mail size={14} className="text-muted" />
                      <input
                        type="email"
                        required
                        placeholder="you@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent text-xs text-text outline-none border-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold hover:shadow-lg hover:shadow-accent/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-6"
                  >
                    {loading ? (
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <span>Request Link</span>
                    )}
                  </button>
                </form>

                <div className="text-center mt-6">
                  <button
                    onClick={() => setAuthMode('login')}
                    className="text-xs text-accent hover:text-accent-bright font-medium underline"
                  >
                    Back to Sign In
                  </button>
                </div>
              </motion.div>
            )}

            {authMode === 'reset' && (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6">
                  <h3 className="font-display text-2xl font-bold">New Password</h3>
                  <p className="text-xs text-muted mt-1">Set a secure password for your account</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">New Password</label>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                      <Lock size={14} className="text-muted" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full bg-transparent text-xs text-text outline-none border-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent to-violet text-white text-xs font-semibold hover:shadow-lg hover:shadow-accent/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-6"
                  >
                    {loading ? (
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <span>Reset Password</span>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
