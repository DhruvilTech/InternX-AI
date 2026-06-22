<div align="center">

<br />

<img src="frontend/public/logo.png" alt="InternX AI Logo" width="80" height="80" />

<h1>InternX AI</h1>

<p><strong>The AI-Powered Career Operating System.</strong><br/>
Not a dashboard. Not a job board. An intelligent environment that actively builds your career.</p>

<br/>

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-InternX_AI-6366f1?style=for-the-badge&logoColor=white)](http://localhost:5173)
[![Tech Stack](https://img.shields.io/badge/Stack-React_+_Node.js_+_MongoDB-0f172a?style=for-the-badge)](.)
[![AI Powered](https://img.shields.io/badge/AI-Groq_LLaMA_3.1-22d3ee?style=for-the-badge)](.)
[![License](https://img.shields.io/badge/License-ISC-34d399?style=for-the-badge)](.)

<br/>

```
  ┌─────────────────────────────────────────────────────────┐
  │   Student enters → AI assigns internship & company      │
  │   → completes real tasks → gets evaluated by AI         │
  │   → receives career report + certificate                │
  │   → discovered by recruiters → gets hired               │
  └─────────────────────────────────────────────────────────┘
```

</div>

---

## 🏆 Why InternX AI Wins

> **The Problem:** 80% of students graduate without real project experience. Internships are gated behind experience. Experience is gated behind internships. This is the infinite loop that kills careers before they begin.

> **Our Solution:** We broke the loop. InternX AI creates a *living, AI-driven simulation* of a real tech internship — complete with an AI company, a real manager persona, domain-specific tasks, code submission pipelines, AI evaluation, skill gap analysis, interview simulation, and a blockchain-verifiable certificate. All automated. All personalized. All intelligent.

---

## ✨ What Makes This Different

| Traditional Platforms | InternX AI |
|---|---|
| Browse job listings | AI assigns you a personalized internship |
| Apply and hope | Get placed in a simulated AI company immediately |
| Self-paced tutorials | Real deliverables with deadlines and evaluations |
| Generic certificates | Role-specific certificates with unique verification IDs |
| No recruiter visibility | Recruiter discovery portal with placement tracking |
| Static skill tests | Dynamic skill gap analysis with AI recommendations |

---

## 🎯 Core Feature Matrix

### 🤖 AI Internship Engine
- **AI Company Assignment** — Students are placed into one of 6 simulated tech companies (AI Startups, Cybersecurity firms, Design Labs, etc.) based on their selected career path
- **AI Task Generator** — Groq LLaMA 3.1 generates domain-specific, role-appropriate tasks with requirements, expected deliverables, and deadlines
- **Kanban Task Board** — Professional task management with To-Do / In-Progress / Completed workflow tracking
- **Code Submission Pipeline** — ZIP file upload with automated extraction, PDF submission support, GitHub repository linking

### 🧠 AI Evaluation Engine (Most Complex Feature)
- **Multi-dimensional Code Analysis** — Evaluates submissions across 5 axes: Code Quality, Architecture, Performance, Security, Documentation
- **AI-Generated Feedback** — Groq-powered detailed written feedback per submission with specific improvement suggestions
- **Scoring System** — Weighted composite scores with percentile ranking
- **Career Report Generation** — Full PDF-exportable career readiness report with historical progression

### 📊 Skill Intelligence System
- **Dynamic Skill Gap Analyzer** — Career-path aware gap detection across 10+ skills per domain (Frontend, Cyber Security, Data Science, etc.)
- **Radar Chart Visualization** — Interactive Recharts radar showing current vs. target skill levels
- **AI Recommendations** — Personalized learning paths with resource suggestions
- **Progress Tracking** — Longitudinal skill growth tracking across internship lifecycle

### 🎤 AI Mock Interview Simulator
- **Adaptive Questioning** — AI generates role-specific interview questions based on career track
- **Live Interview Mode** — Real-time Q&A interface with timer and session management
- **Answer Evaluation** — AI scores each answer and provides instant feedback
- **Interview Reports** — Detailed post-session analysis with strengths and improvement areas

### 🐙 GitHub Intelligence Module
- **OAuth GitHub Connect** — Secure Passport.js GitHub OAuth integration
- **Repository Analysis** — AI-powered codebase analysis for quality assessment
- **Contribution Heatmap** — Real contribution data visualization
- **Code Quality Scoring** — Automated analysis of commits, languages, and repo health

### 🏛️ Multi-Portal Architecture

#### Student Portal
- Career path selection from 10+ tracks
- Full internship lifecycle management
- Analytics dashboard with performance metrics
- Certificate center with unique verification IDs
- Offer management and placement tracking

#### College Portal
- Student cohort management
- Placement readiness tracking per student
- College-wide analytics (internship completion, skill distribution)
- Certificate verification and issuance
- Recruitment pipeline visibility

#### Recruiter Portal
- Student discovery with advanced filtering
- Candidate shortlisting and pipeline management
- AI-evaluated profile scoring
- Direct offer dispatch system
- Hiring analytics dashboard

#### Admin Portal
- User approval workflows (Students, Colleges, Recruiters)
- Document verification system
- Platform-wide analytics

---

## 🏗️ Architecture

```
internX123/
├── frontend/                    # React 19 + Vite 8 SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # NeuralBackground, Glass panels, Charts
│   │   │   ├── layout/          # Navbar, Footer, Drawers
│   │   │   └── sections/        # 15+ Landing page sections
│   │   ├── pages/               # 56 route-specific page components
│   │   ├── store/               # Redux Toolkit state management
│   │   ├── context/             # Auth, Theme, Navigation contexts
│   │   └── hooks/               # Custom React hooks
│   └── public/
│
└── backend/                     # Node.js + Express 5 REST API
    ├── src/
    │   ├── controllers/         # Request handlers (20+ controllers)
    │   ├── services/            # Business logic + AI integrations
    │   │   ├── evaluation.service.js    # 30KB — Core AI eval engine
    │   │   ├── careerReport.service.js  # 21KB — Report generation
    │   │   ├── groq.service.js          # Groq LLaMA integration
    │   │   └── githubAnalyzer.service.js # GitHub code analysis
    │   ├── models/              # 31 Mongoose schemas
    │   ├── routes/              # 17 route modules
    │   ├── middlewares/         # Auth, validation, error handling
    │   └── modules/             # College & Recruiter feature modules
    └── docs/                    # API documentation
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2 | UI Framework |
| **Vite** | 8.0 | Build Tool |
| **Tailwind CSS** | 4.3 | Utility Styling |
| **Framer Motion** | 12.4 | Animations & Transitions |
| **Redux Toolkit** | 2.12 | Global State Management |
| **React Router** | 7.18 | Client-side Routing |
| **Recharts** | 3.8 | Data Visualization |
| **GSAP** | 3.15 | Advanced Animations |
| **Lenis** | 1.3 | Smooth Scroll |
| **Lucide React** | 1.21 | Icon System |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js + Express** | 5.2 | REST API Server |
| **MongoDB + Mongoose** | 9.7 | Database & ODM |
| **Groq (LLaMA 3.1)** | — | AI Task & Evaluation Engine |
| **Passport.js** | 0.7 | GitHub OAuth |
| **Cloudinary** | 2.10 | File & Media Storage |
| **JWT + bcryptjs** | — | Authentication |
| **Helmet + Rate Limit** | — | Security Layer |
| **Swagger UI** | 5.0 | API Documentation |
| **Nodemailer** | 9.0 | Email Notifications |
| **pdf-parse + adm-zip** | — | Submission Processing |

---

## 🔌 API Surface

```
POST   /api/auth/register            Student / Recruiter / College registration
POST   /api/auth/login               JWT auth with cookie-based sessions
GET    /api/auth/github              GitHub OAuth initiation
GET    /api/careers                  Available career paths
POST   /api/careers/select           Career path selection + internship creation
GET    /api/internships/my-internship Student active internship
GET    /api/tasks                    Kanban task board
POST   /api/submissions              Code/PDF/ZIP submission upload
GET    /api/evaluation/student/:id   AI evaluation report
GET    /api/skills/gap               Skill gap analysis
POST   /api/interview/start          Start AI mock interview session
GET    /api/interview/report/:id     Post-interview analysis
GET    /api/github/profile           GitHub contribution data
POST   /api/mentor-chat              AI career mentor chat
GET    /api/college/students         College student roster
GET    /api/recruiter/students       Talent discovery pool
POST   /api/recruiter/offer/:id      Send placement offer
GET    /api/notifications            Real-time notification feed
```

> Full Swagger documentation: `http://localhost:5000/api-docs`

---

## 🚀 Getting Started

### Prerequisites
```
Node.js >= 18.0
MongoDB Atlas account (or local MongoDB)
Groq API key (free tier available)
Cloudinary account
GitHub OAuth App credentials
```

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/internX123.git
cd internX123
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` in `/backend`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# AI Engine
GROQ_API_KEY=your_groq_api_key

# File Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

SESSION_SECRET=your_session_secret
NODE_ENV=development
```

```bash
npm run dev   # Starts on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev   # Starts on http://localhost:5173
```

### 4. Open in Browser
```
http://localhost:5173
```

---

## 🎮 Demo Walkthrough

### As a Student
1. **Register** → `/register` → Select role: Student
2. **Verify email** → Check inbox for OTP
3. **Onboard** → Fill education + skills profile
4. **Select Career Path** → Choose from AI, Frontend, Backend, Cybersecurity, Data Science, UX/UI
5. **Enter AI Company** → Get assigned a simulated company with a manager and team
6. **Complete Tasks** → Work through Kanban tasks, submit code/PDF/ZIP
7. **Get Evaluated** → AI scores your work across 5 dimensions
8. **Analyze Skill Gap** → See exactly where you need to improve
9. **Mock Interview** → Practice with AI-generated questions
10. **Connect GitHub** → Let AI analyze your real code contributions
11. **Earn Certificate** → Download verifiable certificate with unique ID
12. **Get Discovered** → Appear in recruiter talent pool

### As a Recruiter
1. **Register** → `/recruiter-login` → Create company profile
2. **Browse Talent** → Filter students by skill, score, career path
3. **Shortlist** → Build candidate pipeline
4. **Dispatch Offers** → Send placement offers directly through platform

### As a College
1. **Register** → Submit college credentials for admin approval
2. **Dashboard** → See all enrolled students' progress
3. **Analytics** → Placement readiness, skill distribution, internship completion
4. **Reports** → Export placement data and skill reports

---

## 📸 Feature Highlights

### Living AI Neural Network Background
- Canvas-based neural network simulation covering the entire app
- Hundreds of animated connection nodes across 4 depth layers
- Mouse cursor reactivity — nearby nodes glow and react
- Scroll parallax — network shifts as you navigate
- Page-specific behavior — interview mode shows waveforms, generator shows pulse rings
- Each page transitions the network color palette smoothly

### Glass Panel Design System
- True glassmorphism with `backdrop-filter: blur(28px) saturate(200%)`
- Cards feel suspended above the neural network background
- Hover states with dynamic border illumination
- VisionOS-inspired depth and floating feel

### Real-time Command Palette
- `Ctrl+K` global search across all navigation destinations
- Role-aware suggestions based on logged-in user type
- Keyboard-first navigation throughout the app

---

## 🔐 Security Architecture

- **JWT + HttpOnly Cookies** — Tokens never accessible via JavaScript
- **Helmet.js** — Security HTTP headers (CSP, HSTS, XSS protection)
- **Rate Limiting** — 100 req/15min in production per IP
- **Input Validation** — express-validator on all API inputs
- **Password Hashing** — bcryptjs with salt rounds
- **Role-based Access Control** — Route guards on frontend + middleware on backend
- **Session Security** — Secure, SameSite cookies for OAuth flows
- **Compression** — Gzip on all responses (60-80% payload reduction)

---

## 📊 Database Schema Highlights

```
Users (31 models total)
├── User                    Core auth entity
├── Student                 Academic profile + career data
├── Recruiter               Company profile + hiring data  
├── CollegeRepresentative   College admin profile
├── Internship              Active internship record
├── Task                    Kanban task with requirements
├── Submission              Code/PDF/ZIP submission
├── EvaluationReport        AI multi-dimensional scores
├── SkillGapReport          Career-path skill analysis
├── CareerReport            Full readiness report
├── Interview               Mock interview session
├── InterviewReport         AI-evaluated answer scores
├── GithubProfile           OAuth profile + contributions
├── GithubRepository        Repo analysis + code metrics
├── Notification            In-app notification feed
├── Offer                   Recruiter placement offer
├── Placement               Accepted offer tracking
└── MentorChat              AI mentor conversation history
```

---

## 🧠 AI Integration Details

### Groq LLaMA 3.1 — The Brain
InternX AI uses **Groq's LLaMA 3.1 8B Instant** model for all AI operations:

| Feature | Prompt Strategy |
|---|---|
| Task Generation | Career-path + seniority-aware structured prompts |
| Code Evaluation | Multi-criteria rubric with JSON-mode response |
| Interview Questions | Domain-specific, behavioral + technical mix |
| Answer Scoring | Rubric-based evaluation with confidence scores |
| Skill Gap Analysis | Career benchmark comparison with gap identification |
| Career Reports | Longitudinal synthesis of all performance data |
| Mentor Chat | Context-aware conversational career coaching |
| GitHub Analysis | Repository pattern detection + quality assessment |

### Evaluation Engine (Core Innovation)
```javascript
// Evaluation dimensions
const DIMENSIONS = {
  codeQuality:   { weight: 0.25, rubric: '...' },
  architecture:  { weight: 0.20, rubric: '...' },
  performance:   { weight: 0.20, rubric: '...' },
  security:      { weight: 0.20, rubric: '...' },
  documentation: { weight: 0.15, rubric: '...' },
}

// Final score = weighted average across all submissions
// Career readiness = normalized composite across all internship activities
```

---

## 🏆 Hackathon Impact

### Problem Statement Addressed
> **"How can AI democratize access to professional experience for students worldwide?"**

### Our Answer
- **Zero gatekeeping** — Any student with internet access can get a professional internship experience
- **AI mentor available 24/7** — No need to wait for a human to evaluate or answer
- **Verifiable credentials** — Certificates that recruiters can independently verify
- **Real skill measurement** — Not just self-reported skills, but AI-evaluated demonstrated competence
- **Bridge to employment** — Direct recruiter discovery creates actual hiring pathways

### Scale Potential
- Works for **any career track** (extensible skill registry)
- Supports **any language** (Groq API supports multilingual prompts)  
- **One-click college onboarding** — Entire colleges can enroll cohorts of students
- **Zero operational cost per student** after infrastructure setup

---

## 👥 Team

**Built with 💜 for the hackathon**

> *"We didn't build a project. We built an AI system that builds careers."*

---

## 📄 License

ISC License — Free to use, modify, and distribute.

---

<div align="center">

**⭐ If InternX AI impressed you, star the repository ⭐**

*Built in hackathon hours. Designed for the real world.*

</div>
