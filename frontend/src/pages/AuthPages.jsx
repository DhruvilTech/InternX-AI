import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Mail, Lock, User, KeyRound, ArrowRight, ShieldCheck, UploadCloud, Building2, GraduationCap, CheckCircle } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'
import { FaGithub } from 'react-icons/fa6'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import * as authApi from '../api/authApi'
import axiosInstance from '../api/axios.js'

export default function AuthPages() {
  const { loadDemoStudent, loadDemoRecruiter, loadDemoCollege, loadDemoAdmin, addPendingApproval, addToast } = useNavigation()
  const { login, fetchCurrentUser } = useAuth()
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
  const [signupRole, setSignupRole] = useState('student') // student, recruiter, college, college_representative

  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [collegeName, setCollegeName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [uploadedDocName, setUploadedDocName] = useState('')

  // Autocomplete and custom college states
  const [collegeSearch, setCollegeSearch] = useState('')
  const [collegesList, setCollegesList] = useState([])
  const [selectedCollege, setSelectedCollege] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [customCollege, setCustomCollege] = useState(false) // My College Is Not Listed

  // Custom college inputs
  const [customName, setCustomName] = useState('')
  const [customCity, setCustomCity] = useState('')
  const [customState, setCustomState] = useState('')
  const [customWebsite, setCustomWebsite] = useState('')

  // College Representative fields
  const [designation, setDesignation] = useState('')
  const [officialEmail, setOfficialEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpError, setOtpError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)

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

  // College search autocomplete side effect
  useEffect(() => {
    if (collegeSearch.trim().length > 1 && !selectedCollege) {
      const fetchColleges = async () => {
        try {
          const res = await axiosInstance.get(`/api/colleges/search?q=${encodeURIComponent(collegeSearch)}`)
          if (res.data && res.data.success) {
            setCollegesList(res.data.data)
            setShowDropdown(true)
          }
        } catch (err) {
          console.error(err)
        }
      }
      const delay = setTimeout(fetchColleges, 300)
      return () => clearTimeout(delay)
    } else {
      setCollegesList([])
      setShowDropdown(false)
    }
  }, [collegeSearch, selectedCollege])

  // Reset OTP resend timer when transitioning to OTP mode
  useEffect(() => {
    if (authMode === 'otp') {
      setResendTimer(60)
      setCanResend(false)
    }
  }, [authMode])

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null
    if (authMode === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    } else if (resendTimer === 0) {
      setCanResend(true)
    }
    return () => clearInterval(interval)
  }, [authMode, resendTimer])

  const handleResendOtp = async () => {
    if (!canResend) return
    setLoading(true)
    try {
      await axiosInstance.post('/api/auth/resend-otp', { email })
      addToast('A new OTP has been sent to your email.', 'success')
      setResendTimer(60)
      setCanResend(false)
    } catch (err) {
      console.error(err)
      addToast(err.response?.data?.message || 'Failed to resend OTP.', 'error')
    } finally {
      setLoading(false)
    }
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
        else if (role === 'college_representative') navigate('/college/dashboard');
        else if (role === 'recruiter') navigate('/recruiter/dashboard');
        else if (role === 'admin') navigate('/admin/dashboard');
        else navigate('/dashboard');
      } catch (err) {
        console.error(err);
        const errMsg = err.response?.data?.message || 'Login failed. Check credentials.';
        addToast(errMsg, 'error');

        // Transition to OTP verification if email is not verified
        if (err.response?.status === 401 && (err.response?.data?.message?.includes('not verified') || err.response?.data?.code === 'EMAIL_NOT_VERIFIED')) {
          setAuthMode('otp');
        }
      } finally {
        setLoading(false);
      }
    } else if (authMode === 'signup') {
      if (!selectedFile) {
        addToast('Verification credential document is mandatory.', 'error');
        setLoading(false);
        return;
      }
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
          if (customCollege) {
            // Save custom college request to be sent after OTP/email verification is complete
            localStorage.setItem('customCollegeRequest', JSON.stringify({
              collegeName: customName,
              city: customCity,
              state: customState,
              website: customWebsite
            }));
            payload = {
              ...payload,
              fullName: name,
              collegeName: customName,
              customCollegeName: customName,
              collegeId: null,
              course,
              year: Number(year),
              skills: selectedSkills
            };
          } else {
            if (!selectedCollege) {
              addToast('Please select a college from the list or check "My College Is Not Listed"', 'error');
              setLoading(false);
              return;
            }
            payload = {
              ...payload,
              fullName: name,
              collegeName: selectedCollege.name,
              collegeId: selectedCollege._id,
              customCollegeName: '',
              course,
              year: Number(year),
              skills: selectedSkills
            };
          }
        } else if (signupRole === 'college_representative') {
          if (!selectedCollege) {
            addToast('Please select the college you represent.', 'error');
            setLoading(false);
            return;
          }
          payload = {
            ...payload,
            fullName: name,
            collegeId: selectedCollege._id,
            designation,
            officialEmail,
            phone
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

        const res = await authApi.register(payload);
        addToast(res.message || 'Registration successful. OTP sent to email.', 'success');
        setAuthMode('otp');
      } catch (err) {
        console.error(err);
        addToast(err.response?.data?.message || 'Registration failed. Check inputs.', 'error');
      } finally {
        setLoading(false);
      }
    } else if (authMode === 'otp') {
      try {
        const res = await axiosInstance.post('/api/auth/verify-email', { email, otp });
        if (res.data?.success && res.data?.accessToken) {
          const accessToken = res.data.accessToken;
          localStorage.setItem('accessToken', accessToken);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          // Submit custom college request if it was queued during signup
          const queuedRequest = localStorage.getItem('customCollegeRequest');
          if (queuedRequest) {
            try {
              const reqData = JSON.parse(queuedRequest);
              await axiosInstance.post('/api/colleges/request', reqData);
              localStorage.removeItem('customCollegeRequest');
              console.log('Submitted custom college request successfully post-auth.');
            } catch (err) {
              console.error('Failed to submit custom college request:', err);
            }
          }
          
          // Re-fetch profiles using AuthContext
          await fetchCurrentUser();
          setOtpVerified(true);
          addToast('Email verified and logged in successfully!', 'success');
          
          const currentUser = res.data.user || res.data?.data?.user;
          const targetRole = currentUser.role;
          
          setTimeout(() => {
            if (targetRole === 'student') navigate('/student/dashboard');
            else if (targetRole === 'college_representative') navigate('/college/dashboard');
            else if (targetRole === 'recruiter') navigate('/recruiter/dashboard');
            else navigate('/dashboard');
          }, 1500); // 1.5s delay to show green light animation
        }
      } catch (err) {
        console.error(err);
        setOtpError(true);
        addToast(err.response?.data?.message || 'Verification failed. Invalid OTP.', 'error');
        setTimeout(() => setOtpError(false), 3000); // Reset red light
      } finally {
        setLoading(false);
      }
    } else if (authMode === 'forgot') {
      try {
        const res = await authApi.forgotPassword({ email });
        addToast(res.message || 'Reset link sent to email!', 'info');
      } catch (err) {
        console.error(err);
        addToast(err.response?.data?.message || 'Request failed.', 'error');
      } finally {
        setLoading(false);
      }
    } else if (authMode === 'reset') {
      try {
        // Parse token from hash (for HashRouter query params) or window.location.search
        let queryToken = null;
        const hash = window.location.hash;
        const searchParamsIndex = hash.indexOf('?');
        if (searchParamsIndex !== -1) {
          queryToken = new URLSearchParams(hash.substring(searchParamsIndex)).get('token');
        }
        if (!queryToken) {
          queryToken = new URLSearchParams(window.location.search).get('token') || new URLSearchParams(location.search).get('token');
        }

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
                    { id: 'college_representative', label: 'College Rep', icon: ShieldCheck },
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
                          setSelectedCollege(null)
                          setCollegeSearch('')
                          setCustomCollege(false)
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
                      {signupRole === 'student' ? 'Full Name' : signupRole === 'college_representative' ? 'Representative Name' : 'Recruiter Name'}
                    </label>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                      <User size={14} className="text-muted" />
                      <input
                        type="text"
                        required
                        placeholder={signupRole === 'student' ? 'Arjun Kapoor' : signupRole === 'college_representative' ? 'Prof. Vivek Sharma' : 'Sarah Johnson'}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-transparent text-xs text-text outline-none border-none"
                      />
                    </div>
                  </div>

                  {/* Dynamic Organization Name */}
                  {signupRole === 'recruiter' && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
                        Company Name
                      </label>
                      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                        <Building2 size={14} className="text-muted" />
                        <input
                          type="text"
                          required
                          placeholder="NeuralMind Technologies"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
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
                        placeholder={signupRole === 'student' ? 'you@university.edu' : signupRole === 'college_representative' ? 'vivek@college.edu' : 'recruiting@company.com'}
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

                  {/* College Search Autocomplete for Students and College Representatives */}
                  {(signupRole === 'student' || signupRole === 'college_representative') && (
                    <div className="space-y-1.5 relative animate-fade-in">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">College</label>
                        {signupRole === 'student' && (
                          <label className="flex items-center gap-1.5 text-[10px] text-accent cursor-pointer">
                            <input
                              type="checkbox"
                              checked={customCollege}
                              onChange={(e) => {
                                setCustomCollege(e.target.checked);
                                if (e.target.checked) {
                                  setSelectedCollege(null);
                                  setCollegeSearch('');
                                }
                              }}
                              className="rounded border-border bg-void/50 text-accent focus:ring-0 focus:ring-offset-0"
                            />
                            <span>My college is not listed</span>
                          </label>
                        )}
                      </div>

                      {customCollege && signupRole === 'student' ? (
                        <div className="space-y-3 p-3.5 border border-border/85 bg-void/30 rounded-xl">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-muted uppercase tracking-wider block">College Name</label>
                            <input
                              type="text"
                              required
                              placeholder="E.g. Nirma University"
                              value={customName}
                              onChange={(e) => setCustomName(e.target.value)}
                              className="w-full bg-void/50 border border-border rounded-lg px-2.5 py-2 text-xs text-text outline-none focus:border-accent"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-muted uppercase tracking-wider block">City</label>
                              <input
                                type="text"
                                required
                                placeholder="Ahmedabad"
                                value={customCity}
                                onChange={(e) => setCustomCity(e.target.value)}
                                className="w-full bg-void/50 border border-border rounded-lg px-2.5 py-2 text-xs text-text outline-none focus:border-accent"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-muted uppercase tracking-wider block">State</label>
                              <input
                                type="text"
                                required
                                placeholder="Gujarat"
                                value={customState}
                                onChange={(e) => setCustomState(e.target.value)}
                                className="w-full bg-void/50 border border-border rounded-lg px-2.5 py-2 text-xs text-text outline-none focus:border-accent"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-muted uppercase tracking-wider block">Website</label>
                            <input
                              type="url"
                              placeholder="https://nirmauni.ac.in"
                              value={customWebsite}
                              onChange={(e) => setCustomWebsite(e.target.value)}
                              className="w-full bg-void/50 border border-border rounded-lg px-2.5 py-2 text-xs text-text outline-none focus:border-accent"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                            <GraduationCap size={14} className="text-muted" />
                            <input
                              type="text"
                              required={!customCollege}
                              placeholder="Search for your college (e.g. Nirma, IIT, NIT)..."
                              value={collegeSearch}
                              onChange={(e) => {
                                setCollegeSearch(e.target.value);
                                setSelectedCollege(null);
                              }}
                              className="w-full bg-transparent text-xs text-text outline-none border-none"
                            />
                            {selectedCollege && (
                              <span className="text-[10px] bg-emerald/20 border border-emerald/30 text-emerald-300 font-semibold px-2 py-0.5 rounded-full shrink-0">
                                Selected
                              </span>
                            )}
                          </div>

                          {showDropdown && collegesList.length > 0 && (
                            <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto glass border border-border rounded-xl shadow-xl z-50 py-1 text-xs">
                              {collegesList.map((col) => (
                                <div
                                  key={col._id}
                                  onClick={() => {
                                    setSelectedCollege(col);
                                    setCollegeSearch(col.name);
                                    setShowDropdown(false);
                                  }}
                                  className="px-3.5 py-2 hover:bg-white/5 cursor-pointer flex justify-between items-center transition-colors text-muted hover:text-text text-left"
                                >
                                  <div>
                                    <p className="font-semibold text-text">{col.name}</p>
                                    <p className="text-[9px] opacity-70 text-muted">{col.city}, {col.state}</p>
                                  </div>
                                  {col.shortName && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-void/60 text-accent font-bold">
                                      {col.shortName}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* College Representative Fields */}
                  {signupRole === 'college_representative' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Official Designation</label>
                        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                          <ShieldCheck size={14} className="text-muted" />
                          <input
                            type="text"
                            required
                            placeholder="E.g. Head of Placements"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            className="w-full bg-transparent text-xs text-text outline-none border-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Official Email</label>
                          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                            <Mail size={14} className="text-muted" />
                            <input
                              type="email"
                              required
                              placeholder="rep@college.edu"
                              value={officialEmail}
                              onChange={(e) => setOfficialEmail(e.target.value)}
                              className="w-full bg-transparent text-xs text-text outline-none border-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Phone Number</label>
                          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-void/50 focus-within:border-accent transition-colors">
                            <input
                              type="tel"
                              required
                              placeholder="+91 98765 43210"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full bg-transparent text-xs text-text outline-none border-none"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Student Dynamic Fields */}
                  {signupRole === 'student' && (
                    <>
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
                      {signupRole === 'student' ? 'Student ID Card (.pdf/.png)' : signupRole === 'college_representative' ? 'Accreditation identity file (.pdf)' : 'Corporate business license (.pdf)'}
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
                className="relative overflow-hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Laser scanning line overlay */}
                <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald to-transparent opacity-40 scanner-line pointer-events-none" />

                <div className="mb-6 text-center">
                  {/* Status Indicators Row */}
                  <div className="flex justify-center items-center gap-6 mb-4">
                    {/* Alert System Red Light */}
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          otpError
                            ? 'bg-rose shadow-[0_0_12px_rgba(251,113,133,0.8)] indicator-pulse'
                            : 'bg-rose/20'
                        }`}
                      />
                      <span className="text-[9px] uppercase tracking-wider text-dim">Alert Node</span>
                    </div>

                    {/* Secure Node Green Light */}
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          otpVerified
                            ? 'bg-emerald shadow-[0_0_12px_rgba(52,211,153,0.8)] indicator-pulse'
                            : otp.length === 4 && !otpError
                            ? 'bg-emerald/60 shadow-[0_0_8px_rgba(52,211,153,0.4)] animate-pulse'
                            : 'bg-emerald/20'
                        }`}
                      />
                      <span className="text-[9px] uppercase tracking-wider text-dim">Secure Node</span>
                    </div>
                  </div>

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

                  {/* Resend Timer / Action */}
                  <div className="text-center text-xs mt-2">
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-accent hover:text-accent-bright font-semibold underline cursor-pointer"
                      >
                        Resend Code
                      </button>
                    ) : (
                      <span className="text-muted">
                        Resend code in <span className="text-accent font-semibold">{resendTimer}s</span>
                      </span>
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
