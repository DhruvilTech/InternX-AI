import Student from '../models/Student.js';
import StudentCareer from '../models/StudentCareer.js';
import Internship from '../models/Internship.js';
import Task from '../models/Task.js';
import { sendResponse } from '../utils/sendResponse.js';

const serializeInternship = (internship, careerPath) => {
  if (!internship) return null;
  const obj = internship.toObject ? internship.toObject() : internship;
  return {
    ...obj,
    id: obj._id ? obj._id.toString() : '',
    name: obj.companyName,
    manager: obj.managerName,
    project: obj.projectName,
    roleTitle: obj.internshipRole || `${careerPath} Intern`,
    team: ['Alex Rivera (Lead Engineer)', 'Sophia Patel (ML Researcher)', 'David Kim (Data Architect)'],
  };
};


// Predefined detailed fallback data for all 7 paths to ensure a robust user experience if Groq is not configured or fails
const fallbackMockData = {
  'AI Engineer': {
    company: {
      companyName: 'NeuralMind Technologies',
      industry: 'Artificial Intelligence',
      companyDescription: 'NeuralMind Technologies is a pioneer in Generative AI tools and semantic indexing infrastructures.',
      department: 'Artificial Intelligence & ML',
      workCulture: 'Fast-paced, collaborative, and heavily research-driven with weekly paper reviews.'
    },
    manager: {
      managerName: 'Sarah Johnson',
      managerRole: 'AI Engineering Manager & Research Lead',
      managerIntroduction: 'Welcome to the team! We are building next-generation semantic search pipelines. Looking forward to seeing your contributions.'
    },
    project: {
      projectName: 'Resume Intelligence & Extraction Platform',
      projectDescription: 'A distributed platform utilizing LLMs and vector indexing to automatically parse, classify, and match resumes against open jobs.'
    },
    tasks: [
      {
        title: 'Design Vector DB Schema',
        description: 'Design the indexing and schema structure for storing high-dimensional embeddings for a semantic search engine.',
        difficulty: 'Medium',
        estimatedHours: 8,
        requirements: ['Use cosine similarity index', 'Optimize query latency below 20ms', 'Add dynamic filtering support'],
        expectedOutput: 'A detailed DB Schema design document and initialization script.',
        evaluationCriteria: 'Optimal index selection and correct metadata filters.',
        category: 'Architecture',
        deadlineDays: 2
      },
      {
        title: 'Fine-tune Embeddings Model',
        description: 'Implement fine-tuning pipeline for custom domain queries on SentenceTransformers.',
        difficulty: 'Hard',
        estimatedHours: 16,
        requirements: ['Target accuracy > 85%', 'Create data augmentation script', 'Log metrics to dashboard'],
        expectedOutput: 'Python training script and validation metrics graph.',
        evaluationCriteria: 'Finetuning execution without errors and correct hyperparameter selection.',
        category: 'Development',
        deadlineDays: 3
      },
      {
        title: 'Implement RAG Search Route',
        description: 'Connect the vector database to the LLM generation routing via LangChain or custom orchestrator.',
        difficulty: 'Medium',
        estimatedHours: 12,
        requirements: ['Handle streaming tokens', 'Add prompt template safety filters', 'Write unit tests for fallback'],
        expectedOutput: 'Express/FastAPI endpoints with stream integration.',
        evaluationCriteria: 'Successful retrieval integration and clean error recovery.',
        category: 'Integration',
        deadlineDays: 4
      },
      {
        title: 'Deploy Model to GPU Instances',
        description: 'Containerize and deploy the fine-tuned model to serverless endpoints with autoscaling enabled.',
        difficulty: 'Hard',
        estimatedHours: 10,
        requirements: ['Write robust Dockerfile', 'Configure memory constraints', 'Setup Prometheus metric endpoints'],
        expectedOutput: 'Docker configuration and deployment YAML files.',
        evaluationCriteria: 'Dockerfile layers are optimized and endpoints respond correctly.',
        category: 'DevOps',
        deadlineDays: 5
      },
      {
        title: 'Benchmark Search Latency',
        description: 'Perform load testing on the RAG endpoints and optimize query cache hit rate.',
        difficulty: 'Easy',
        estimatedHours: 6,
        requirements: ['Use Apache Bench or Locust', 'Verify cache invalidation', 'Record p95 and p99 latencies'],
        expectedOutput: 'Performance report with latency graphs and optimizations list.',
        evaluationCriteria: 'Proper identification of slow paths and correct cache configurations.',
        category: 'Performance',
        deadlineDays: 6
      }
    ]
  },
  'Frontend Developer': {
    company: {
      companyName: 'VividPixels Design Studio',
      industry: 'Creative Web Engineering',
      companyDescription: 'VividPixels is a premier creative lab specializing in high-fidelity immersive web experiences.',
      department: 'Creative Engineering',
      workCulture: 'Highly visual, detail-oriented, focusing on fluid animations and responsive pixel perfection.'
    },
    manager: {
      managerName: 'Marcus Cole',
      managerRole: 'Creative Engineering Lead',
      managerIntroduction: 'Welcome to VividPixels! We turn interfaces into interactive art. Let\'s build something beautiful together.'
    },
    project: {
      projectName: 'Glassmorphic Motion Design System',
      projectDescription: 'Building a modular React component library leveraging GSAP and Framer Motion to create smooth tactile card layouts.'
    },
    tasks: [
      {
        title: 'Build Design System Tokens',
        description: 'Implement core theme custom CSS properties, color systems, and layout grid settings.',
        difficulty: 'Easy',
        estimatedHours: 6,
        requirements: ['Create light/dark theme variables', 'Setup responsive grid rules', 'Define fluid spacing hierarchy'],
        expectedOutput: 'Global CSS variables file and design token JSON config.',
        evaluationCriteria: 'Theme switching works seamlessly and layouts align perfectly to grids.',
        category: 'Styling',
        deadlineDays: 2
      },
      {
        title: 'Create Reusable TiltCard Component',
        description: 'Design a highly performant 3D tilt interaction using Framer Motion.',
        difficulty: 'Medium',
        estimatedHours: 8,
        requirements: ['Support dynamic hover angles', 'Add subtle glass reflection overlay', 'Keep frame rate at 60 FPS'],
        expectedOutput: 'React TiltCard component file with prop types.',
        evaluationCriteria: 'Smooth interactions without layout shifts.',
        category: 'Animation',
        deadlineDays: 3
      },
      {
        title: 'Setup Command Palette Modal',
        description: 'Add a global search shortcut dialog box for quick workspace navigation.',
        difficulty: 'Medium',
        estimatedHours: 10,
        requirements: ['Listen to Ctrl+K shortcut', 'Implement fuzzy search filtering', 'Animate entrance and exit transitions'],
        expectedOutput: 'React modal component and keypress listener hook.',
        evaluationCriteria: 'Modal opens reliably and handles search state correctly.',
        category: 'Interaction',
        deadlineDays: 4
      },
      {
        title: 'Optimize Core Web Vitals',
        description: 'Identify and eliminate render-blocking scripts and heavy image paints.',
        difficulty: 'Hard',
        estimatedHours: 12,
        requirements: ['Reduce Bundle size by 15%', 'Implement component lazy loading', 'Verify Lighthouse performance score > 90'],
        expectedOutput: 'Vite code-splitting configuration and Lighthouse report comparison.',
        evaluationCriteria: 'Successful code splitting and verified paint speed improvements.',
        category: 'Performance',
        deadlineDays: 5
      },
      {
        title: 'Integrate Theme Context Provider',
        description: 'Write a React context provider to toggle and persist user theme choices.',
        difficulty: 'Easy',
        estimatedHours: 4,
        requirements: ['Store preference in localStorage', 'Prevent flash of unstyled content', 'Broadcast theme changes to active tabs'],
        expectedOutput: 'ThemeContext wrapper file and useTheme custom hook.',
        evaluationCriteria: 'State persists across reloads and theme toggling is instantaneous.',
        category: 'State Management',
        deadlineDays: 6
      }
    ]
  },
  'Backend Developer': {
    company: {
      companyName: 'SecureCore Systems',
      industry: 'Cloud Infrastructure & Security',
      companyDescription: 'SecureCore builds high-throughput infrastructure for fintech transaction safety and auth systems.',
      department: 'Cloud Infrastructure',
      workCulture: 'Safety first, test-driven, with extreme focus on latency optimization and security auditing.'
    },
    manager: {
      managerName: 'Elena Rostova',
      managerRole: 'Principal Infrastructure Architect',
      managerIntroduction: 'Hello. At SecureCore, reliability is our currency. Let\'s build bulletproof APIs.'
    },
    project: {
      projectName: 'Distributed Session Gateway',
      projectDescription: 'A high-throughput API gateway implementing token-based authentication, rate-limiting, and redis caching.'
    },
    tasks: [
      {
        title: 'Database Index Optimization',
        description: 'Identify and resolve bottleneck queries causing high database CPU load.',
        difficulty: 'Medium',
        estimatedHours: 8,
        requirements: ['Audit explain plans for slow queries', 'Create composite indexes', 'Optimize lookup operations'],
        expectedOutput: 'Migration script adding indexes and query performance comparison report.',
        evaluationCriteria: 'Query search time reduced by 50% without database locks.',
        category: 'Database',
        deadlineDays: 2
      },
      {
        title: 'Implement Redis Caching Layer',
        description: 'Write a caching middleware utility for common products details route lookup.',
        difficulty: 'Medium',
        estimatedHours: 10,
        requirements: ['Establish TTL cache invalidation', 'Fallback gracefully if redis is offline', 'Benchmark response speed changes'],
        expectedOutput: 'Express caching middleware script and test suite.',
        evaluationCriteria: 'API serves cached data correctly and handles service offline states.',
        category: 'Performance',
        deadlineDays: 3
      },
      {
        title: 'Auth Token Rotation Handler',
        description: 'Add secure refresh token rotation flow with redis-based denylist check.',
        difficulty: 'Hard',
        estimatedHours: 14,
        requirements: ['Generate cryptographically secure refresh keys', 'Store invalid tokens in redis cache', 'Prevent token replay attacks'],
        expectedOutput: 'Authentication service controller and rotation routes code.',
        evaluationCriteria: 'Expired/reused tokens are caught and revoked instantly.',
        category: 'Security',
        deadlineDays: 4
      },
      {
        title: 'Configure Docker Development Setup',
        description: 'Containerize node server and redis services for unified development spin-up.',
        difficulty: 'Easy',
        estimatedHours: 5,
        requirements: ['Write Dockerfile with multi-stage build', 'Compose docker-compose.yml with health checks', 'Use Alpine base images for small size'],
        expectedOutput: 'Dockerfile and docker-compose configurations.',
        evaluationCriteria: 'Services spin up and connect automatically using standard credentials.',
        category: 'DevOps',
        deadlineDays: 5
      },
      {
        title: 'Add Global Error Handling Middleware',
        description: 'Implement a centralized express error responder mapping custom errors to correct status codes.',
        difficulty: 'Easy',
        estimatedHours: 4,
        requirements: ['Catch unhandled promise rejections', 'Hide server stack traces in production', 'Structure standard JSON error outputs'],
        expectedOutput: 'Error handler middleware file and test route triggers.',
        evaluationCriteria: 'Exceptions are caught cleanly and return standard error JSON payloads.',
        category: 'Error Management',
        deadlineDays: 6
      }
    ]
  },
  'Full Stack Developer': {
    company: {
      companyName: 'SynergyCloud LLC',
      industry: 'Enterprise SaaS Services',
      companyDescription: 'SynergyCloud builds cross-platform CRM and collaborative office boards for scaling operations.',
      department: 'Engineering',
      workCulture: 'Cross-functional, agile, with continuous integrations and rapid product iterations.'
    },
    manager: {
      managerName: 'Alex Rivera',
      managerRole: 'Director of Engineering',
      managerIntroduction: 'Welcome! You will bridge the user journeys with robust database integrations. Ready to deploy?'
    },
    project: {
      projectName: 'Real-time Project Kanban Dashboard',
      projectDescription: 'Building a collaborative MERN stack kanban board integrating live WebSockets updates, secure auth, and responsive grid layouts.'
    },
    tasks: [
      {
        title: 'Setup MERN Stack Skeleton',
        description: 'Configure clean boilerplate codebase connecting React frontend to Express/MongoDB backend.',
        difficulty: 'Easy',
        estimatedHours: 6,
        requirements: ['Configure custom environment loaders', 'Setup folder structures', 'Write basic sanity check ping route'],
        expectedOutput: 'Configured boilerplate workspace ready for dev.',
        evaluationCriteria: 'Bootstrapping runs without dependency errors.',
        category: 'Architecture',
        deadlineDays: 2
      },
      {
        title: 'Create Task Database Schema',
        description: 'Model the task data relations in Mongoose with validations and indices.',
        difficulty: 'Medium',
        estimatedHours: 8,
        requirements: ['Link tasks to unique studentId', 'Enforce status enum rules', 'Index task creation dates'],
        expectedOutput: 'Mongoose schema file and seeding scripts.',
        evaluationCriteria: 'Correct relation mapping and error checks.',
        category: 'Database',
        deadlineDays: 3
      },
      {
        title: 'Write REST endpoints for Tasks',
        description: 'Expose GET, POST, and PATCH status endpoints for Kanban workspace.',
        difficulty: 'Medium',
        estimatedHours: 10,
        requirements: ['Sanitize input requests', 'Enforce auth JWT filters', 'Handle not found errors'],
        expectedOutput: 'Express task router and controller handlers.',
        evaluationCriteria: 'API returns correct payload structure with valid statuses.',
        category: 'Development',
        deadlineDays: 4
      },
      {
        title: 'Build Frontend Kanban Board',
        description: 'Create columns, lanes, and responsive task card wrappers matching design rules.',
        difficulty: 'Hard',
        estimatedHours: 14,
        requirements: ['Map tasks by status state', 'Add hover glow effects', 'Implement clean loading skeletons'],
        expectedOutput: 'React Kanban board component files.',
        evaluationCriteria: 'Interface renders all states cleanly without layout shift.',
        category: 'Frontend',
        deadlineDays: 5
      },
      {
        title: 'Implement drag-and-drop state syncing',
        description: 'Write local state transition logic and sync status changes to the database API.',
        difficulty: 'Hard',
        estimatedHours: 12,
        requirements: ['Verify optimistic updates', 'Handle network timeout retry options', 'Show success status toast notifications'],
        expectedOutput: 'State update handlers and axios api patch hooks.',
        evaluationCriteria: 'Card repositioning saves immediately without losing state.',
        category: 'Integration',
        deadlineDays: 6
      }
    ]
  },
  'Data Scientist': {
    company: {
      companyName: 'DataPulse Analytics',
      industry: 'Business Intelligence & Big Data',
      companyDescription: 'DataPulse powers enterprise forecasting and fraud analytics using machine learning models.',
      department: 'Data Science & Intelligence',
      workCulture: 'Data-driven, analytical, highlighting statistical rigorous testing and clean visualizations.'
    },
    manager: {
      managerName: 'Michael Chen',
      managerRole: 'Lead Data Scientist',
      managerIntroduction: 'Welcome to the analytics team. Let\'s uncover patterns in transactions data.'
    },
    project: {
      projectName: 'Real-time Transaction Fraud Forecasting',
      projectDescription: 'Designing a pipeline to filter anomalous credit card transactions and report aggregate metrics on charts.'
    },
    tasks: [
      {
        title: 'Data Wrangling and Cleansing',
        description: 'Parse, cleanse, and normalize transaction CSV datasets using Pandas.',
        difficulty: 'Easy',
        estimatedHours: 6,
        requirements: ['Handle missing value fallbacks', 'Filter outliers beyond 3 standard deviations', 'Format timestamp objects'],
        expectedOutput: 'Jupyter notebook and python parser script.',
        evaluationCriteria: 'Cleaned dataset contains no null records and is ready for modeling.',
        category: 'Data Engineering',
        deadlineDays: 2
      },
      {
        title: 'Exploratory Data Analysis',
        description: 'Perform statistical audit of fraud features correlation maps.',
        difficulty: 'Medium',
        estimatedHours: 8,
        requirements: ['Plot distribution density charts', 'Identify top 5 correlate variables', 'Draft summaries report'],
        expectedOutput: 'EDA markdown report with Seaborn/Matplotlib graphs.',
        evaluationCriteria: 'Insightful graphs explaining correlation coefficients.',
        category: 'Statistics',
        deadlineDays: 3
      },
      {
        title: 'Train Fraud Classifier Model',
        description: 'Develop supervised classification model using Scikit-Learn.',
        difficulty: 'Hard',
        estimatedHours: 14,
        requirements: ['Train Random Forest and Logistic Regressions', 'Handle imbalanced class using SMOTE', 'Target precision > 90%'],
        expectedOutput: 'Training pipeline script and saved pickle model file.',
        evaluationCriteria: 'High accuracy and precision logs on validation split.',
        category: 'Machine Learning',
        deadlineDays: 4
      },
      {
        title: 'Build Model Inference API',
        description: 'Expose the trained model predictions endpoint using FastAPI.',
        difficulty: 'Medium',
        estimatedHours: 10,
        requirements: ['Validate inputs JSON queries', 'Return prediction score percentiles', 'Respond below 50ms'],
        expectedOutput: 'FastAPI router script and integration tests.',
        evaluationCriteria: 'Predict endpoints return correct classifications.',
        category: 'Integration',
        deadlineDays: 5
      },
      {
        title: 'Design Analytics Dashboard Charts',
        description: 'Structure response data schemas to feed frontend Recharts indicators.',
        difficulty: 'Easy',
        estimatedHours: 6,
        requirements: ['Group transaction counts by day', 'Format output JSON payload', 'Add aggregates stats'],
        expectedOutput: 'Aggregation endpoint and chart configuration details.',
        evaluationCriteria: 'Correct schema structure mapping cleanly to Recharts components.',
        category: 'Visualization',
        deadlineDays: 6
      }
    ]
  },
  'UI/UX Designer': {
    company: {
      companyName: 'DesignApple Labs',
      industry: 'Human Interface Design',
      companyDescription: 'DesignApple is a boutique design collective blending digital canvas spaces with tactile properties.',
      department: 'Human Interface Design',
      workCulture: 'Iterative, collaborative, and aesthetic obsessed. Grid systems and typography are key.'
    },
    manager: {
      managerName: 'Jonathan Ive',
      managerRole: 'Chief Product Designer',
      managerIntroduction: 'Welcome. Design is not just how it looks. It is how it works. Let\'s define details.'
    },
    project: {
      projectName: 'Spatially Responsive Canvas Interface',
      projectDescription: 'Creating a high-fidelity interactive design system and wires for a modern spatial grid application.'
    },
    tasks: [
      {
        title: 'Perform Competitor UX Research',
        description: 'Audit existing spatial workspace interfaces and outline core user pain points.',
        difficulty: 'Easy',
        estimatedHours: 6,
        requirements: ['Review 3 major competitor platforms', 'Identify top 3 friction zones', 'Document visual themes trends'],
        expectedOutput: 'UX audit review slides and analysis report.',
        evaluationCriteria: 'Comprehensive research and clear feature list recommendations.',
        category: 'UX Research',
        deadlineDays: 2
      },
      {
        title: 'Establish Spacings & Typography Tokens',
        description: 'Create a Figma library of design tokens (sizes, typography styles, and palette).',
        difficulty: 'Medium',
        estimatedHours: 8,
        requirements: ['Define 8px spatial grid rules', 'Configure fluid type scale', 'Verify contrast ratios exceed WCAG AA'],
        expectedOutput: 'Figma design tokens library link and specs document.',
        evaluationCriteria: 'Well-structured styles with names aligned to CSS specs.',
        category: 'Design Systems',
        deadlineDays: 3
      },
      {
        title: 'Design Mid-Fidelity Wireframes',
        description: 'Map out the user onboarding experience and canvas grids.',
        difficulty: 'Medium',
        estimatedHours: 10,
        requirements: ['Create layout blueprints for 3 resolutions', 'Verify navigation hierarchy', 'Ensure form layout accessibility'],
        expectedOutput: 'Interactive Figma wireframe flows.',
        evaluationCriteria: 'Intuitive task flows and clean user navigation.',
        category: 'Information Architecture',
        deadlineDays: 4
      },
      {
        title: 'Create High-Fidelity UI Mockups',
        description: 'Design the full-color, glassmorphic layout and hover indicators.',
        difficulty: 'Hard',
        estimatedHours: 14,
        requirements: ['Apply modern gradient effects', 'Draft states for active/inactive components', 'Export visual asset guides'],
        expectedOutput: 'High-fidelity Figma files and design specification sheets.',
        evaluationCriteria: 'Premium visuals matching contemporary design standards.',
        category: 'UI Design',
        deadlineDays: 5
      },
      {
        title: 'Assemble Interactive Figma Prototype',
        description: 'Wire up transitions, overlays, and micro-interactions.',
        difficulty: 'Hard',
        estimatedHours: 8,
        requirements: ['Add smart-animated dialogs', 'Create hover interactions loops', 'Perform cognitive walkthrough test'],
        expectedOutput: 'Figma interactive prototype share link and user feedback notes.',
        evaluationCriteria: 'Transitions feel natural and represent final coding layouts.',
        category: 'Prototyping',
        deadlineDays: 6
      }
    ]
  },
  'Cybersecurity Analyst': {
    company: {
      companyName: 'ShieldGate Cybersec',
      industry: 'Network Defense & Red Teaming',
      companyDescription: 'ShieldGate delivers zero-trust simulation environments and compliance auditing tools.',
      department: 'Red Team Operations',
      workCulture: 'Rigorous, ethical, detail-driven, and highly security audit conscious.'
    },
    manager: {
      managerName: 'Alice Thorne',
      managerRole: 'Red Team Operations Lead',
      managerIntroduction: 'Welcome to ShieldGate. Trust nothing, verify everything. Let\'s secure this stack.'
    },
    project: {
      projectName: 'Zero-Trust Network Sandbox Emulation',
      projectDescription: 'Analyzing potential vulnerabilities in distributed application gateways and modeling threat landscapes.'
    },
    tasks: [
      {
        title: 'Examine API Gateway Policies',
        description: 'Audit access control lists and rate limiting parameters on exposed gateway services.',
        difficulty: 'Medium',
        estimatedHours: 8,
        requirements: ['Check for lack of token validation fallback', 'Identify endpoints missing IP rate-limits', 'Verify CORS allowed origin configs'],
        expectedOutput: 'Vulnerability assessment checklist and report.',
        evaluationCriteria: 'Proper identification of insecure settings and misconfigurations.',
        category: 'SecOps',
        deadlineDays: 2
      },
      {
        title: 'Perform Static Code Analysis',
        description: 'Audit source code repositories for credentials leaks and SQL injection risks.',
        difficulty: 'Medium',
        estimatedHours: 10,
        requirements: ['Run automated linters (e.g. Semgrep)', 'Verify secret management storage strategies', 'Audit password hash algorithm strengths'],
        expectedOutput: 'Security code audit logs and recommended code patch changes.',
        evaluationCriteria: 'Accurate categorization of OWASP Top 10 vulnerabilities.',
        category: 'Code Audit',
        deadlineDays: 3
      },
      {
        title: 'Model Network Threat Vectors',
        description: 'Create a threat matrix modeling DDoS and spoofing attacks against active services.',
        difficulty: 'Hard',
        estimatedHours: 12,
        requirements: ['Draft data flow diagram detailing trust boundaries', 'Define threat agents profiles', 'Examine mitigation actions'],
        expectedOutput: 'Threat model diagram and remediation roadmap.',
        evaluationCriteria: 'Realistic attack paths identified with feasible counters.',
        category: 'Threat Modeling',
        deadlineDays: 4
      },
      {
        title: 'Analyze Packet Capture Logs',
        description: 'Inspect packet records using Wireshark to locate indicators of compromise.',
        difficulty: 'Easy',
        estimatedHours: 6,
        requirements: ['Filter out normal test traffic profiles', 'Identify anomaly IP scan commands', 'Locate plain text passwords transmission'],
        expectedOutput: 'Wireshark filter scripts and traffic summary document.',
        evaluationCriteria: 'Precise isolation of bad actors requests packets.',
        category: 'Network Auditing',
        deadlineDays: 5
      },
      {
        title: 'Draft Red Team Security Advisory',
        description: 'Compile findings into an industry-standard security report with patches.',
        difficulty: 'Hard',
        estimatedHours: 12,
        requirements: ['Use CVSS scoring for vulnerabilities', 'Write exact code patches instructions', 'Verify compliance logs standard'],
        expectedOutput: 'Official Security Advisory PDF/Markdown document.',
        evaluationCriteria: 'Professional presentation with actionable fixes.',
        category: 'Reporting',
        deadlineDays: 6
      }
    ]
  }
};

/**
 * Generate a new internship and 5 tasks.
 * POST /api/internships/generate
 */
export const generateInternshipAndTasks = async (req, res, next) => {
  try {
    const userId = req.user._id;
    console.log(`[GENERATOR] Starting generation. Current logged-in user id: ${userId}`);

    // 1. Get student profile details
    const student = await Student.findOne({ userId });
    if (!student) {
      return sendResponse(res, 400, false, 'Student profile not found. Please complete onboarding first.');
    }

    // 2. Get selected career path
    const studentCareer = await StudentCareer.findOne({ studentId: userId }).populate('careerId');
    if (!studentCareer || !studentCareer.careerId) {
      return sendResponse(res, 400, false, 'No selected career path found. Please choose a pathway first.');
    }

    const careerPath = studentCareer.careerId.title;
    const level = studentCareer.currentLevel || 'Beginner';
    const skills = student.skills || [];
    const year = student.year || 1;
    const studentName = student.fullName;

    console.log(`[GENERATOR] Student: ${studentName}, Career: ${careerPath}, Level: ${level}`);

    // 3. Check if internship and tasks already exist in MongoDB
    const existingInternship = await Internship.findOne({ studentId: userId });
    if (existingInternship) {
      const existingTasks = await Task.find({ studentId: userId, internshipId: existingInternship._id });
      if (existingTasks.length > 0) {
        console.log(`[GENERATOR] Existing internship found: ${existingInternship._id}. Tasks count: ${existingTasks.length}`);
        const mappedExistingTasks = existingTasks.map(task => ({
          ...task.toObject(),
          id: task._id.toString(),
          desc: task.description,
          expected: task.expectedOutput,
          deadline: `In ${task.deadlineDays} days`
        }));
        return sendResponse(res, 200, true, 'Internship and tasks retrieved successfully', {
          internship: serializeInternship(existingInternship, careerPath),
          tasks: mappedExistingTasks
        });
      }
    }

    // 4. Generate internship and tasks
    let generatedData = null;

    if (process.env.GROQ_API_KEY) {
      try {
        console.log('[GENERATOR] Calling Groq API...');
        
        const prompt = `You are InternX AI Internship Creation Engine.

Your responsibility is to create a complete realistic internship simulation.

You must behave like:

* HR Manager
* Engineering Manager
* Technical Lead
* Internship Coordinator

================================================

STUDENT PROFILE

Name: ${studentName}

Role: ${careerPath}

Level: ${level}

Current Skills:

${skills.join(', ')}

Academic Year:

${year}

================================================

OBJECTIVE

Create a realistic internship experience.

The internship should feel like a student joined a real company.

Generate:

1. Company
2. Department
3. Manager
4. Internship
5. Project
6. Internship Roadmap
7. Tasks

================================================

COMPANY

Generate:

companyName

industry

companyDescription

department

workCulture

================================================

MANAGER

Generate:

managerName

managerRole

managerIntroduction

welcomeMessage

================================================

INTERNSHIP

Generate:

internshipDuration

role

expectedLearningOutcomes

================================================

PROJECT

Generate:

projectName

projectDescription

businessProblem

technicalRequirements

successCriteria

================================================

ROADMAP

Generate:

Week 1 Goals

Week 2 Goals

Week 3 Goals

Week 4 Goals

================================================

TASK GENERATION

Generate exactly 5 tasks.

Difficulty Progression:

Task 1 Easy

Task 2 Easy

Task 3 Medium

Task 4 Medium

Task 5 Hard

For each task generate:

taskId

title

description

objective

businessPurpose

difficulty

estimatedHours

requiredSkills

expectedOutput

evaluationCriteria

deadlineDays

resources

================================================

RULES

Tasks must simulate real company work.

Tasks must depend on previous tasks.

Tasks must relate to the project.

Tasks must match student skill level.

================================================

OUTPUT STRUCTURE:
Your response must be a single raw JSON object matching the following structure:
{
  "company": {
    "companyName": "Name of the company",
    "industry": "Industry description",
    "companyDescription": "Company description",
    "department": "Department name",
    "workCulture": "Work culture description"
  },
  "manager": {
    "managerName": "Manager name",
    "managerRole": "Manager role",
    "managerIntroduction": "Manager introduction statement",
    "welcomeMessage": "Welcome message"
  },
  "internship": {
    "internshipDuration": "Duration of internship (e.g. 6 Weeks)",
    "role": "Internship role title",
    "expectedLearningOutcomes": ["Outcome 1", "Outcome 2"]
  },
  "project": {
    "projectName": "Project name",
    "projectDescription": "Project description",
    "businessProblem": "Business problem description",
    "technicalRequirements": ["Requirement 1", "Requirement 2"],
    "successCriteria": ["Criterion 1", "Criterion 2"]
  },
  "roadmap": {
    "Week 1 Goals": ["Goal 1", "Goal 2"],
    "Week 2 Goals": ["Goal 1", "Goal 2"],
    "Week 3 Goals": ["Goal 1", "Goal 2"],
    "Week 4 Goals": ["Goal 1", "Goal 2"]
  },
  "tasks": [
    {
      "taskId": 1,
      "title": "Task Title",
      "description": "Task Description",
      "objective": "Task Objective",
      "businessPurpose": "Business Purpose",
      "difficulty": "Easy",
      "estimatedHours": 8,
      "requiredSkills": ["Skill 1"],
      "expectedOutput": "Expected Output",
      "evaluationCriteria": "Evaluation Criteria",
      "deadlineDays": 2,
      "resources": ["Resource 1"]
    }
  ]
}

Return ONLY valid JSON. No markdown blocks, no conversational preamble.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              { role: 'system', content: 'You are a professional system JSON generator. You output ONLY raw JSON.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' }
          })
        });

        if (response.ok) {
          const jsonRes = await response.json();
          const responseText = jsonRes.choices?.[0]?.message?.content;
          console.log('[GENERATOR] AI response received.');
          generatedData = JSON.parse(responseText);
        } else {
          console.warn(`[GENERATOR] Groq API returned status ${response.status}. Falling back to pre-seeded track data.`);
        }
      } catch (groqError) {
        console.error('[GENERATOR] Groq Generation Error:', groqError.message);
      }
    } else {
      console.log('[GENERATOR] GROQ_API_KEY not configured in .env. Using fallback mock generator...');
    }

    // 5. Fallback generator mapping if AI failed or API key not present
    if (!generatedData) {
      const fallbackKey = Object.keys(fallbackMockData).find(key => 
        careerPath.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(careerPath.toLowerCase())
      ) || 'AI Engineer';

      console.log(`[GENERATOR] Using pre-seeded mock dataset for track: ${fallbackKey}`);
      generatedData = fallbackMockData[fallbackKey];
    }

    // 6. Save Internship in MongoDB
    const internship = new Internship({
      studentId: userId,
      companyName: generatedData.company.companyName,
      industry: generatedData.company.industry,
      companyDescription: generatedData.company.companyDescription,
      department: generatedData.company.department,
      workCulture: generatedData.company.workCulture,
      managerName: generatedData.manager.managerName,
      managerRole: generatedData.manager.managerRole,
      managerIntroduction: generatedData.manager.managerIntroduction,
      projectName: generatedData.project.projectName,
      projectDescription: generatedData.project.projectDescription,
      welcomeMessage: generatedData.manager.welcomeMessage || generatedData.manager.managerIntroduction,
      internshipDuration: generatedData.internship?.internshipDuration || '6 Weeks',
      internshipRole: generatedData.internship?.role || `${careerPath} Intern`,
      expectedLearningOutcomes: generatedData.internship?.expectedLearningOutcomes || [],
      businessProblem: generatedData.project.businessProblem || '',
      technicalRequirements: generatedData.project.technicalRequirements || [],
      successCriteria: generatedData.project.successCriteria || [],
      roadmap: generatedData.roadmap || {},
      startDate: new Date(),
      progress: 0
    });

    await internship.save();
    console.log(`[GENERATOR] Internship saved successfully. ID: ${internship._id}`);

    // 7. Save Tasks in MongoDB (linked to user and internship)
    const taskDocs = generatedData.tasks.map(task => ({
      studentId: userId,
      internshipId: internship._id,
      title: task.title,
      description: task.description,
      difficulty: task.difficulty || 'Medium',
      estimatedHours: task.estimatedHours || 8,
      status: 'todo', // Required starting status
      progress: 0,
      objective: task.objective || '',
      businessPurpose: task.businessPurpose || '',
      requiredSkills: task.requiredSkills || [],
      resources: task.resources || [],
      requirements: task.requirements || [],
      expectedOutput: task.expectedOutput || '',
      evaluationCriteria: task.evaluationCriteria || '',
      category: task.category || 'General',
      deadlineDays: task.deadlineDays || 3
    }));

    const savedTasks = await Task.insertMany(taskDocs);
    console.log(`[GENERATOR] Tasks saved successfully.`);
    console.log(`[GENERATOR] Number of tasks saved: ${savedTasks.length}`);

    const mappedTasks = savedTasks.map(task => ({
      ...task.toObject(),
      id: task._id.toString(),
      desc: task.description,
      expected: task.expectedOutput,
      deadline: `In ${task.deadlineDays} days`
    }));

    return sendResponse(res, 201, true, 'Internship workspace generated successfully', {
      internship: serializeInternship(internship, careerPath),
      tasks: mappedTasks
    });
  } catch (error) {
    console.error('[GENERATOR] Generate Internship Endpoint failed:', error);
    next(error);
  }
};

/**
 * Retrieve current student's active internship.
 * GET /api/internships/my-internship
 */
export const getMyInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findOne({ studentId: req.user._id });
    if (!internship) {
      return sendResponse(res, 404, false, 'No active internship workspace found.');
    }
    
    // Get career path to construct roleTitle if needed
    const studentCareer = await StudentCareer.findOne({ studentId: req.user._id }).populate('careerId');
    const careerPath = studentCareer?.careerId?.title || 'AI Developer';

    return sendResponse(res, 200, true, 'Internship workspace retrieved successfully', { 
      internship: serializeInternship(internship, careerPath)
    });
  } catch (error) {
    next(error);
  }
};
