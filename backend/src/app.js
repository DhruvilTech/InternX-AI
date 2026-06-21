import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import './config/passportGithub.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import careerRoutes from './routes/career.routes.js';
import internshipRoutes from './routes/internship.routes.js';
import taskRoutes from './routes/task.routes.js';
import githubRoutes from './routes/github.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import collegeRoutes from './modules/college/routes/college.routes.js';
import recruiterRoutes from './modules/recruiter/routes/recruiter.routes.js';
import studentRoutes from './routes/student.routes.js';
import collegesRoutes from './routes/colleges.routes.js';
import representativeRoutes from './routes/representative.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';
import skillsRoutes from './routes/skills.routes.js';
import careerIntelRoutes from './routes/careerIntel.routes.js';
import { setupSwagger } from './config/swagger.js';

import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

// Enable gzip/deflate compression for all responses (60-80% smaller JSON payloads)
app.use(compression({
  level: 6, // Balanced between speed and compression ratio
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress responses with this request header
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

// Set security HTTP headers
app.use(helmet());

// Configure CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Implement Rate Limiting (100 requests per 15 minutes, relaxed to 10000 in development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 10000 : 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Express body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// Cookie Parser to parse tokens inside request cookies
app.use(cookieParser());

// Secure session configuration required for OAuth callbacks
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'internx_github_session_secret_2026_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport & session restores
app.use(passport.initialize());
app.use(passport.session());

// Setup Swagger UI Documentation
setupSwagger(app);

// Register base routers
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/college', collegeRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/colleges', collegesRoutes);
app.use('/api/college-representative', representativeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/career', careerIntelRoutes);


// Base application health check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'InternX Auth Server is healthy' });
});

// Centralized error handling
app.use(errorHandler);

export default app;
