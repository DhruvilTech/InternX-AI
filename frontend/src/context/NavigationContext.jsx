import { createContext, useContext, useState, useEffect } from 'react'
import axiosInstance from '../api/axios.js'
import useAuth from '../hooks/useAuth.js'

const NavigationContext = createContext(null)

const defaultTasks = {
  ai: [
    { id: 'ai-1', title: 'Design Vector DB Schema', category: 'Architecture', desc: 'Design the indexing and schema structure for storing high-dimensional embeddings for a semantic search engine.', requirements: ['Use cosine similarity index', 'Optimize query latency below 20ms', 'Add dynamic filtering support'], expected: 'A detailed DB Schema design document and initialization script.', status: 'completed', deadline: '2 days ago', score: 94, categoryScore: { code: 92, arch: 96, perf: 95, sec: 90, doc: 97 }, feedback: 'Superb architecture. The index configuration is highly optimized. Minor security warning on injection vectors in the filter clauses.' },
    { id: 'ai-2', title: 'Fine-tune Embeddings Model', category: 'Development', desc: 'Implement fine-tuning pipeline for custom domain queries on SentenceTransformers.', requirements: ['Target accuracy > 85%', 'Create data augmentation script', 'Log metrics to dashboard'], expected: 'Python training script and validation metrics graph.', status: 'completed', deadline: 'Yesterday', score: 88, categoryScore: { code: 89, arch: 85, perf: 86, sec: 90, doc: 90 }, feedback: 'Excellent results. The training run is solid. However, documentation is a bit sparse regarding hyperparameters selection.' },
    { id: 'ai-3', title: 'Implement RAG Search Route', category: 'Integration', desc: 'Connect the vector database to the LLM generation routing via LangChain or custom orchestrator.', requirements: ['Handle streaming tokens', 'Add prompt template safety filters', 'Write unit tests for fallback'], expected: 'Express/FastAPI endpoints with stream integration.', status: 'in_progress', deadline: 'In 3 hours' },
    { id: 'ai-4', title: 'Deploy Model to GPU Instances', category: 'DevOps', desc: 'Containerize and deploy the fine-tuned model to serverless endpoints with autoscaling enabled.', requirements: ['Write robust Dockerfile', 'Configure memory constraints', 'Setup Prometheus metric endpoints'], expected: 'Docker configuration and deployment YAML files.', status: 'todo', deadline: 'In 3 days' },
  ],
  frontend: [
    { id: 'fe-1', title: 'Build Design System Tokens', category: 'Styling', desc: 'Implement core theme custom properties and layout grid settings.', status: 'completed', score: 96, deadline: '3 days ago' },
    { id: 'fe-2', title: 'Create Reusable TiltCard Component', category: 'Animation', desc: 'Design a highly performant 3D tilt interaction using Framer Motion.', status: 'in_progress', deadline: 'In 5 hours' },
    { id: 'fe-3', title: 'Setup Command Palette Modal', category: 'Interaction', desc: 'Add global search shortcut dialog box for quick navigation.', status: 'todo', deadline: 'In 2 days' },
  ],
  backend: [
    { id: 'be-1', title: 'Database Index Optimization', category: 'Database', desc: 'Identify and resolve bottleneck queries causing high CPU load.', status: 'completed', score: 91, deadline: 'Yesterday' },
    { id: 'be-2', title: 'Implement Redis Caching Layer', category: 'Performance', desc: 'Write caching utility middleware for product details routes.', status: 'in_progress', deadline: 'In 12 hours' },
    { id: 'be-3', title: 'Auth Token Rotation Handler', category: 'Security', desc: 'Add refresh tokens rotation flow with redis denylist checks.', status: 'todo', deadline: 'In 4 days' },
  ],
}

const companiesData = {
  ai: { name: 'NeuralMind Technologies', manager: 'Sarah Johnson', department: 'Artificial Intelligence', project: 'Resume Intelligence Platform', roleTitle: 'AI Research Intern', team: ['Alex Rivera (Lead Engineer)', 'Sophia Patel (ML Researcher)', 'David Kim (Data Architect)'], description: 'NeuralMind is a fast-growing Series-B startup focusing on custom generative solutions for HR Tech.' },
  frontend: { name: 'VividPixels Design Studio', manager: 'Marcus Cole', department: 'Creative Engineering', project: 'Glassmorphic Design Framework', roleTitle: 'Frontend Engineer Intern', team: ['Chloe Vance (UI Architect)', 'Kenji Sato (Motion Designer)'], description: 'VividPixels is a premier creative lab specializing in immersive web experiences.' },
  backend: { name: 'SecureCore Systems', manager: 'Elena Rostova', department: 'Cloud Infra', project: 'Distributed Session Gateways', roleTitle: 'Backend Dev Intern', team: ['Liam O\'Connor (Principal Architect)', 'Monica Geller (Security Auditor)'], description: 'SecureCore builds high-throughput infrastructure for fintech transaction safety.' },
  data: { name: 'DataPulse Analytics', manager: 'Michael Chen', department: 'Business Intelligence', project: 'Real-time Fraud Forecasting', roleTitle: 'Data Science Intern', team: ['Maya Lin (Chief Scientist)', 'Jordan Belfort (Analyst)'], description: 'DataPulse powers enterprise intelligence with advanced visual dashboards.' },
  uiux: { name: 'DesignApple Labs', manager: 'Jonathan Ive', department: 'Human Interface', project: 'Spatially Responsive Canvas', roleTitle: 'Product Designer Intern', team: ['Steve Miller (UX Researcher)', 'Anna Wintour (Visual Lead)'], description: 'DesignApple is a design collective that blends physical and digital tactile elements.' },
  cyber: { name: 'ShieldGate Cybersec', manager: 'Alice Thorne', department: 'Red Team Ops', project: 'Zero-Trust Network Emulation', roleTitle: 'Security Analyst Intern', team: ['Rex Vance (SecOps Engineer)', 'Trinity Moss (Pen Tester)'], description: 'ShieldGate delivers defensive readiness software to critical cloud networks.' },
}

export function NavigationProvider({ children }) {
  // Sync page with window hash on mount and changes
  const getHashPage = () => {
    const hash = window.location.hash
    if (!hash || hash === '#/') return 'landing'
    return hash.replace('#/', '')
  }

  const [page, setPage] = useState(getHashPage)
  const [role, setRole] = useState('guest') // guest, student, recruiter, college_admin
  const [user, setUser] = useState(null) // { name, email, avatar, track }

  const { user: authUser, role: authRole } = useAuth()

  useEffect(() => {
    if (authUser) {
      setUser({
        name: authUser.fullName || authUser.companyName || authUser.collegeName || 'User',
        email: authUser.email,
        avatar: authUser.avatar || (authUser.fullName ? authUser.fullName.split(' ').map(n => n[0]).join('') : 'U'),
        track: authUser.skills && authUser.skills.length > 0 ? 'ai' : 'ai'
      })
      setRole(authRole === 'college' ? 'college_admin' : authRole)
    } else {
      setUser(null)
      setRole('guest')
    }
  }, [authUser, authRole])

  const fetchBackendApprovals = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/users')
      if (response.data?.success && response.data?.data?.users) {
        const allUsers = response.data.data.users

        const students = allUsers
          .filter(u => u.role === 'student')
          .map(u => ({
            id: u._id,
            name: u.fullName || 'Anonymous Student',
            email: u.email,
            track: u.skills && u.skills.length > 0 ? u.skills.join(', ') : 'AI Engineer',
            idDoc: u.verificationDocName || 'No document uploaded',
            fileUrl: u.verificationDocFile || null,
            fileType: u.verificationDocFile ? (u.verificationDocFile.startsWith('data:image') ? 'image/png' : 'application/pdf') : null,
            cloudinaryUrl: u.cloudinaryUrl || null,
            uploadedAt: new Date(u.createdAt).toLocaleDateString() || 'Just now',
            status: u.isVerified ? 'approved' : 'pending'
          }))

        const colleges = allUsers
          .filter(u => u.role === 'college')
          .map(u => ({
            id: u._id,
            name: u.collegeName || 'Accredited College',
            domain: u.email.split('@')[1] || 'edu',
            adminEmail: u.email,
            identityDoc: u.verificationDocName || 'No document uploaded',
            fileUrl: u.verificationDocFile || null,
            fileType: u.verificationDocFile ? (u.verificationDocFile.startsWith('data:image') ? 'image/png' : 'application/pdf') : null,
            cloudinaryUrl: u.cloudinaryUrl || null,
            uploadedAt: new Date(u.createdAt).toLocaleDateString() || 'Just now',
            status: u.isCollegeVerified ? 'approved' : 'pending'
          }))

        const companies = allUsers
          .filter(u => u.role === 'recruiter')
          .map(u => ({
            id: u._id,
            name: u.companyName || 'Simulated Company LLC',
            domain: u.email.split('@')[1] || 'com',
            recruiterEmail: u.email,
            licenseDoc: u.verificationDocName || 'No document uploaded',
            fileUrl: u.verificationDocFile || null,
            fileType: u.verificationDocFile ? (u.verificationDocFile.startsWith('data:image') ? 'image/png' : 'application/pdf') : null,
            cloudinaryUrl: u.cloudinaryUrl || null,
            uploadedAt: new Date(u.createdAt).toLocaleDateString() || 'Just now',
            status: u.isRecruiterVerified ? 'approved' : 'pending'
          }))

        setApprovals({ students, colleges, companies })
      }
    } catch (err) {
      console.error('Failed to fetch backend approvals:', err)
    }
  }

  useEffect(() => {
    if (authRole === 'admin') {
      fetchBackendApprovals()
    }
  }, [authRole])

  // Onboarding
  const [onboardingStep, setOnboardingStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState({
    name: '', education: '', skills: [], interests: [], goals: []
  })

  // Selected career path
  const [selectedTrack, setSelectedTrack] = useState('ai')

  // Generated Internship details
  const [internship, setInternship] = useState(null)

  // Kanban Task system
  const [tasks, setTasks] = useState([])
  const [selectedTaskId, setSelectedTaskId] = useState(null)

  // Submissions
  const [submissions, setSubmissions] = useState([])
  const [evaluationReport, setEvaluationReport] = useState(null)

  // Approvals System State
  const [approvals, setApprovals] = useState({
    students: [],
    colleges: [],
    companies: []
  })

  // Feedback notifications
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Welcome to InternX AI!', message: 'Complete your onboarding flow to unlock custom internships.', category: 'system', read: false, time: 'Just now' },
    { id: 2, title: 'Recruiter Insight', message: 'Apex AI is looking for AI Developers with skills in Vector Databases.', category: 'recruiter', read: false, time: '2 hours ago' }
  ])

  // Dialogs and layout tools
  const [toasts, setToasts] = useState([])
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      setPage(getHashPage())
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = (toPage) => {
    window.location.hash = `#/${toPage}`
    setPage(toPage)
    // Scroll window to top
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const addToast = (title, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, title, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Pre-load a student profile to test components instantly
  const loadDemoStudent = (track = 'ai') => {
    setRole('student')
    setUser({
      name: 'Arjun Kapoor',
      email: 'arjun.kapoor@university.edu',
      avatar: 'AK',
      track: track
    })
    setSelectedTrack(track)
    const companyInfo = companiesData[track] || companiesData['ai']
    setInternship({
      ...companyInfo,
      id: 'intern-123',
      startDate: 'June 10, 2026',
      progress: 67
    })
    setTasks(defaultTasks[track] || defaultTasks['ai'])
    addToast('Logged in as Student Demo (Arjun Kapoor)', 'info')
  }

  const loadDemoRecruiter = () => {
    setRole('recruiter')
    setUser({
      name: 'Victoria Vance',
      email: 'recruiting@google.com',
      avatar: 'VV'
    })
    addToast('Logged in as Recruiter Demo', 'info')
  }

  const loadDemoCollege = () => {
    setRole('college_admin')
    setUser({
      name: 'Dean Arthur Pendelton',
      email: 'admin@mit.edu',
      avatar: 'AP'
    })
    addToast('Logged in as College Admin Demo', 'info')
  }

  const loadDemoAdmin = () => {
    setRole('admin')
    setUser({
      name: 'Super Admin',
      email: 'admin@internx.ai',
      avatar: 'SA'
    })
    addToast('Logged in as Super Admin', 'info')
  }

  const handleLogout = () => {
    setRole('guest')
    setUser(null)
    setInternship(null)
    setTasks([])
    navigate('landing')
    addToast('Logged out successfully', 'success')
  }

  // Create active internship based on path selection
  const selectTrackAndCreateInternship = (trackId) => {
    setSelectedTrack(trackId)
    // Create internship details
    const details = companiesData[trackId] || companiesData['ai']
    setInternship({
      ...details,
      id: `intern-${Date.now().toString().slice(-4)}`,
      startDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      progress: 0,
    })
    // Initialize tasks
    setTasks(defaultTasks[trackId] || defaultTasks['ai'] || [])
  }

  // Approval handlers
  const setApprovalStatus = async (category, id, status) => {
    try {
      if (status === 'rejected') {
        await axiosInstance.delete(`/api/admin/user/${id}`)
        setApprovals(prev => ({
          ...prev,
          [category]: prev[category].filter(item => item.id !== id)
        }))
        addToast(`${category.slice(0, -1).toUpperCase()} request rejected and account deleted.`, 'error')
      } else {
        let updateField = {}
        if (category === 'students') {
          updateField = { isVerified: true }
        } else if (category === 'colleges') {
          updateField = { isCollegeVerified: true }
        } else if (category === 'companies') {
          updateField = { isRecruiterVerified: true }
        }

        await axiosInstance.put(`/api/admin/user/${id}`, updateField)

        setApprovals(prev => ({
          ...prev,
          [category]: prev[category].map(item =>
            item.id === id ? { ...item, status: 'approved' } : item
          )
        }))
        addToast(`${category.slice(0, -1).toUpperCase()} request approved successfully.`, 'success')
      }
    } catch (err) {
      console.error(err)
      addToast('Failed to update verification status on server.', 'error')
    }
  }

  const addPendingApproval = (category, item) => {
    setApprovals(prev => ({
      ...prev,
      [category]: [item, ...prev[category]]
    }))
    addToast(`Registration submitted for approval!`, 'success')
  }

  return (
    <NavigationContext.Provider
      value={{
        page,
        navigate,
        role,
        setRole,
        user,
        setUser,
        onboardingStep,
        setOnboardingStep,
        onboardingData,
        setOnboardingData,
        selectedTrack,
        setSelectedTrack,
        internship,
        setInternship,
        tasks,
        setTasks,
        selectedTaskId,
        setSelectedTaskId,
        submissions,
        setSubmissions,
        evaluationReport,
        setEvaluationReport,
        notifications,
        setNotifications,
        toasts,
        addToast,
        removeToast,
        commandPaletteOpen,
        setCommandPaletteOpen,
        notificationsOpen,
        setNotificationsOpen,
        loadDemoStudent,
        loadDemoRecruiter,
        loadDemoCollege,
        loadDemoAdmin,
        handleLogout,
        selectTrackAndCreateInternship,
        approvals,
        setApprovalStatus,
        addPendingApproval
      }}
    >
      {children}
    </NavigationContext.Provider>
  )

}

export function useNavigation() {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider')
  return ctx
}
