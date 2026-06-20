import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { setupSwagger } from './config/swagger.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

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

// Implement Rate Limiting (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
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

// Setup Swagger UI Documentation
setupSwagger(app);

// Register base routers
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Base application health check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'InternX Auth Server is healthy' });
});

// Centralized error handling
app.use(errorHandler);

export default app;
