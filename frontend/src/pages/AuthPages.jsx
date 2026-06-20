import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Mail, Lock, User, KeyRound, ArrowRight, ShieldCheck, UploadCloud, Building2, GraduationCap, CheckCircle } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'
import { FaGithub } from 'react-icons/fa6'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import * as authApi from '../api/authApi'

export default function AuthPages() {
  const { loadDemoStudent, loadDemoRecruiter, loadDemoCollege, loadDemoAdmin, addPendingApproval, addToast } = useNavigation()
  const { login, register: signUpApi } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Determine mode based on path
  const getInitialMode = () => {
    if (location.pathname === '/register') return 'signup'
    if (location.pathname === '/forgot-password') return 'forgot'
    if (location.pathname === '/reset-password') return 'reset'
    return 'login'
  }

  const [authMode, setAuthMode] = useState(getInitialMode) // login, signup, forgot, reset, otp

  // Sync authMode when path changes
  useEffect(() => {
    setAuthMode(getInitialMode())
  }, [location.pathname])

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

  // Additional registration fields for validation / integration
  const [course, setCourse] = useState('')
  const [year, setYear] = useState('')
  const [selectedSkills, setSelectedSkills] = useState([])
  const [collegeCode, setCollegeCode] = useState('')
  const [website, setWebsite] = useState('')
  const [industry, setIndustry] = useState('')
  const [companySize, setCompanySize] = useState('')

  const availableSkills = ['React', 'Node.js', 'Python', 'AI / ML', 'Tailwind CSS', 'Framer Motion', 'MongoDB', 'Cyber Security', 'TypeScript', 'Data Science', 'Docker', 'Git']

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  // Real File Upload States
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setUploadedDocName(file.name)
      addToast(`Attached document: ${file.name}`, 'success')
    }
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    setUploadedDocName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (authMode === 'login') {
      try {
        const res = await login({ email, password });
        addToast('Welcome back to InternX AI!', 'success');

        const role = res?.user?.role || res?.data?.user?.role;
        if (role === 'student') navigate('/student/dashboard');
        else if (role === 'college') navigate('/college/dashboard');
        else if (role === 'recruiter') navigate('/recruiter/dashboard');
        else if (role === 'admin') navigate('/admin/dashboard');
        else navigate('/dashboard');
      } catch (err) {
        console.error(err);
        addToast(err.response?.data?.message || 'Login failed. Check credentials.', 'error');
      } finally {
        setLoading(false);
      }
    } else if (authMode === 'signup') {
      try {
        let base64Doc = '';
        if (selectedFile) {
          base64Doc = await toBase64(selectedFile);
        }

        const cloudinaryUrl = selectedFile
          ? `https://res.cloudinary.com/internx-ai/image/upload/v1718873999/${encodeURIComponent(selectedFile.name)}`
          : '';

        let payload = {
          email,
          password,
          role: signupRole,
          verificationDocName: uploadedDocName,
          verificationDocFile: base64Doc,
          cloudinaryUrl
        };

        if (signupRole === 'student') {
          payload = {
            ...payload,
            fullName: name,
            collegeName,
            course,
            year: Number(year),
            skills: selectedSkills
          };
        } else if (signupRole === 'college') {
          payload = {
            ...payload,
            collegeName,
            collegeCode,
            contactPerson: name,
            website
          };
        } else if (signupRole === 'recruiter') {
          payload = {
            ...payload,
            companyName,
            industry,
            companySize,
            website
          };
        }

        await signUpApi(payload);
        addToast('Registration successful! Welcome to InternX AI.', 'success');

        if (signupRole === 'student') navigate('/student/dashboard');
        else if (signupRole === 'college') navigate('/college/dashboard');
        else if (signupRole === 'recruiter') navigate('/recruiter/dashboard');
        else navigate('/dashboard');
      } catch (err) {
        console.error(err);
        addToast(err.response?.data?.message || 'Registration failed. Check inputs.', 'error');
      } finally {
        setLoading(false);
      }
    } else if (authMode === 'forgot') {
      try {
        const res = await authApi.forgotPassword({ email });
        addToast('Reset link generated!', 'info');
        if (res?.data?.resetToken) {
          addToast(`Dev Token: ${res.data.resetToken}`, 'info');
          navigate(`/reset-password?token=${res.data.resetToken}`);
        }
      } catch (err) {
        console.error(err);
        addToast(err.response?.data?.message || 'Request failed.', 'error');
      } finally {
        setLoading(false);
      }
    } else if (authMode === 'reset') {
      try {
        const queryToken = new URLSearchParams(window.location.search).get('token');
        if (!queryToken) {
          addToast('Token is missing from URL', 'error');
          setLoading(false);
          return;
        }
        await authApi.resetPassword({ token: queryToken, newPassword: password });
        addToast('Password reset successfully! Please log in.', 'success');
        setAuthMode('login');
        navigate('/login');
      } catch (err) {
        console.error(err);
        addToast(err.response?.data?.message || 'Reset failed.', 'error');
      } finally {
        setLoading(false);
      }
    }
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

        {/* Footer details removed */}
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

                {/* College or Recruiter Login Portal Redirections */}
                <div className="mt-6 pt-6 border-t border-border/60">
                  <p className="text-[10px] text-muted text-center uppercase tracking-wider mb-3">Institutional Gateways</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => navigate('/college-login')}
                      className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-emerald/20 bg-emerald/5 hover:bg-emerald/10 text-emerald-300 text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <GraduationCap size={14} />
                      <span>College Login</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/recruiter-login')}
                      className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300 text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <Building2 size={14} />
                      <span>Recruiter Login</span>
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
                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 font-semibold transition-all ${active
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

                  {/* Student Dynamic Fields */}
                  {signupRole === 'student' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">College Name</label>
                        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                          <GraduationCap size={14} className="text-muted" />
                          <input
                            type="text"
                            required
                            placeholder="E.g. Stanford University"
                            value={collegeName}
                            onChange={(e) => setCollegeName(e.target.value)}
                            className="w-full bg-transparent text-xs text-text outline-none border-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Course</label>
                          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                            <input
                              type="text"
                              required
                              placeholder="E.g. B.Tech CS"
                              value={course}
                              onChange={(e) => setCourse(e.target.value)}
                              className="w-full bg-transparent text-xs text-text outline-none border-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Academic Year</label>
                          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                            <input
                              type="number"
                              required
                              min="1"
                              max="6"
                              placeholder="3"
                              value={year}
                              onChange={(e) => setYear(e.target.value)}
                              className="w-full bg-transparent text-xs text-text outline-none border-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Skills (Select multiple)</label>
                        <div className="flex flex-wrap gap-1.5 p-1">
                          {availableSkills.map(skill => {
                            const active = selectedSkills.includes(skill)
                            return (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => toggleSkill(skill)}
                                className={`px-2 py-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all border cursor-pointer ${active
                                    ? 'bg-accent/20 border-accent text-accent-bright shadow-sm shadow-accent/10'
                                    : 'bg-void/40 border-border text-muted hover:text-text hover:border-muted/40'
                                  }`}
                              >
                                {skill}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {/* College Dynamic Fields */}
                  {signupRole === 'college' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">College Code</label>
                        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                          <input
                            type="text"
                            required
                            placeholder="STAN-002"
                            value={collegeCode}
                            onChange={(e) => setCollegeCode(e.target.value)}
                            className="w-full bg-transparent text-xs text-text outline-none border-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Website URL</label>
                        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                          <input
                            type="url"
                            required
                            placeholder="https://stanford.edu"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className="w-full bg-transparent text-xs text-text outline-none border-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recruiter Dynamic Fields */}
                  {signupRole === 'recruiter' && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Industry</label>
                          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                            <input
                              type="text"
                              required
                              placeholder="E.g. FinTech"
                              value={industry}
                              onChange={(e) => setIndustry(e.target.value)}
                              className="w-full bg-transparent text-xs text-text outline-none border-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Company Size</label>
                          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                            <input
                              type="text"
                              required
                              placeholder="E.g. 50-200"
                              value={companySize}
                              onChange={(e) => setCompanySize(e.target.value)}
                              className="w-full bg-transparent text-xs text-text outline-none border-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Company Website</label>
                        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                          <input
                            type="url"
                            placeholder="https://techcorp.com"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className="w-full bg-transparent text-xs text-text outline-none border-none"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* File upload credentials box */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                      {signupRole === 'student' ? 'Student ID Card (.pdf/.png)' : signupRole === 'college' ? 'Accreditation identity file (.pdf)' : 'Corporate business license (.pdf)'}
                    </label>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="application/pdf,image/*"
                      className="hidden"
                    />

                    {uploadedDocName ? (
                      <div className="p-3 border border-emerald/30 bg-emerald/5 text-emerald rounded-xl flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                          <CheckCircle size={14} className="shrink-0" />
                          <span className="truncate">{uploadedDocName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearFile}
                          className="text-[10px] text-muted hover:text-text hover:bg-white/5 px-2 py-1 rounded shrink-0"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border border-dashed border-border hover:border-accent/40 bg-void/30 p-4 rounded-xl text-center space-y-1 cursor-pointer group transition-colors flex flex-col justify-center"
                      >
                        <UploadCloud size={18} className="text-muted group-hover:text-accent mx-auto transition-colors" />
                        <span className="text-[10px] text-text font-bold block">Attach Verification Credential File</span>
                        <span className="text-[8px] text-muted block">Select PDF or Image from your local storage</span>
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
