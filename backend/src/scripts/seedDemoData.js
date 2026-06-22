/**
 * InternX AI – Production-Ready Demo Data Seeder
 * ================================================
 * Run: npm run seed
 *
 * Creates:
 *  - 10 Colleges
 *  - 10 College Admins (college_representative)
 *  - 10 Recruiters
 *  - 100 Students (with full profiles)
 *  - 10 Career Paths
 *  - 100 Internship records
 *  - ~1000 Tasks (8-12 per student)
 *  - ~850 Submissions + Evaluations + Feedback
 *  - 100 EvaluationReports, SkillAnalysis, CareerIntelligence, CareerReports
 *  - 100 Certificates
 *  - 10 CollegeAnalytics records
 *  - 3000+ Chat messages (FeedbackReport entries)
 *
 * Password for ALL accounts: 12345678
 * Idempotent: Safe to run multiple times (upsert logic throughout)
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// --- Model imports (matching the exact paths used in the app) ---
import User from '../models/User.js';
import Student from '../models/Student.js';
import Recruiter from '../models/Recruiter.js';
import CollegeRepresentative from '../models/CollegeRepresentative.js';
import College from '../models/College.js';                               // re-exports from modules/college
import CareerPath from '../models/CareerPath.js';
import StudentCareer from '../models/StudentCareer.js';
import Internship from '../models/Internship.js';
import Task from '../models/Task.js';
import Submission from '../models/Submission.js';
import Evaluation from '../models/Evaluation.js';
import EvaluationReport from '../models/EvaluationReport.js';
import Feedback from '../models/Feedback.js';
import FeedbackReport from '../models/FeedbackReport.js';
import SkillAnalysis from '../models/SkillAnalysis.js';
import SkillGapReport from '../models/SkillGapReport.js';
import CareerIntelligence from '../models/CareerIntelligence.js';
import CareerReport from '../models/CareerReport.js';
import Certificate from '../modules/college/models/Certificate.js';
import CollegeAnalytics from '../modules/college/models/CollegeAnalytics.js';

// ─────────────────────────────────────────────
// UTILITY HELPERS
// ─────────────────────────────────────────────
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];
const pickN = (arr, n) => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(n, arr.length));
};
const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
const daysFromNow = (d) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);

// Pre-hash password ONCE for all accounts
const PLAIN_PASSWORD = '12345678';
let HASHED_PASSWORD;

// ─────────────────────────────────────────────
// STATIC DATA POOLS
// ─────────────────────────────────────────────

const COLLEGES = [
    { name: 'MS University Baroda', shortName: 'MSU', city: 'Vadodara', state: 'Gujarat', website: 'https://msubaroda.ac.in', totalStudents: 3200, collegeCode: 'MSU001' },
    { name: 'DAIICT', shortName: 'DAIICT', city: 'Gandhinagar', state: 'Gujarat', website: 'https://daiict.ac.in', totalStudents: 1200, collegeCode: 'DAI001' },
    { name: 'Nirma University', shortName: 'NIRMA', city: 'Ahmedabad', state: 'Gujarat', website: 'https://nirmauni.ac.in', totalStudents: 4500, collegeCode: 'NIR001' },
    { name: 'IIT Gandhinagar', shortName: 'IITGN', city: 'Gandhinagar', state: 'Gujarat', website: 'https://iitgn.ac.in', totalStudents: 800, collegeCode: 'IIT001' },
    { name: 'IIIT Vadodara', shortName: 'IIITV', city: 'Vadodara', state: 'Gujarat', website: 'https://iiitv.ac.in', totalStudents: 600, collegeCode: 'IIV001' },
    { name: 'PDEU', shortName: 'PDEU', city: 'Gandhinagar', state: 'Gujarat', website: 'https://pdpu.ac.in', totalStudents: 2800, collegeCode: 'PDE001' },
    { name: 'CHARUSAT', shortName: 'CSIT', city: 'Anand', state: 'Gujarat', website: 'https://charusat.ac.in', totalStudents: 3000, collegeCode: 'CHA001' },
    { name: 'Parul University', shortName: 'PARUL', city: 'Vadodara', state: 'Gujarat', website: 'https://paruluniversity.ac.in', totalStudents: 5500, collegeCode: 'PAR001' },
    { name: 'LD College of Engineering', shortName: 'LDCE', city: 'Ahmedabad', state: 'Gujarat', website: 'https://ldce.ac.in', totalStudents: 2200, collegeCode: 'LDC001' },
    { name: 'VIT Vellore', shortName: 'VIT', city: 'Vellore', state: 'Tamil Nadu', website: 'https://vit.ac.in', totalStudents: 8000, collegeCode: 'VIT001' },
];

const COLLEGE_ADMINS = [
    { name: 'Dr. Ramesh Patel', email: 'admin@msu.edu', phone: '9825011001', designation: 'Dean of Academics' },
    { name: 'Dr. Meena Shah', email: 'admin@daiict.edu', phone: '9825011002', designation: 'Head of Placement Cell' },
    { name: 'Prof. Suresh Joshi', email: 'admin@nirma.edu', phone: '9825011003', designation: 'Director of Industry Relations' },
    { name: 'Dr. Ajay Kumar', email: 'admin@iitgn.edu', phone: '9825011004', designation: 'Training & Placement Officer' },
    { name: 'Prof. Kavita Desai', email: 'admin@iiitv.edu', phone: '9825011005', designation: 'Associate Dean' },
    { name: 'Dr. Nilesh Trivedi', email: 'admin@pdeu.edu', phone: '9825011006', designation: 'Head of T&P Cell' },
    { name: 'Prof. Hiral Modi', email: 'admin@charusat.edu', phone: '9825011007', designation: 'Industry Coordinator' },
    { name: 'Dr. Bhavna Mehta', email: 'admin@parul.edu', phone: '9825011008', designation: 'Director of Placements' },
    { name: 'Prof. Rajan Shukla', email: 'admin@ldce.edu', phone: '9825011009', designation: 'Placement Cell Head' },
    { name: 'Dr. Priya Krishnan', email: 'admin@vit.edu', phone: '9825011010', designation: 'Associate Director, Placements' },
];

const RECRUITERS = [
    { company: 'Infosys', industry: 'IT Services', size: '1000+', website: 'https://infosys.com', email: 'recruiter@infosys.com', name: 'Arjun Sharma' },
    { company: 'TCS', industry: 'IT Services', size: '1000+', website: 'https://tcs.com', email: 'recruiter@tcs.com', name: 'Priya Venkatesh' },
    { company: 'Wipro', industry: 'IT Consulting', size: '1000+', website: 'https://wipro.com', email: 'recruiter@wipro.com', name: 'Rohit Gupta' },
    { company: 'Accenture', industry: 'IT Consulting', size: '1000+', website: 'https://accenture.com', email: 'recruiter@accenture.com', name: 'Sneha Nair' },
    { company: 'Capgemini', industry: 'Digital Transformation', size: '1000+', website: 'https://capgemini.com', email: 'recruiter@capgemini.com', name: 'Vivek Malhotra' },
    { company: 'Cognizant', industry: 'IT Services', size: '1000+', website: 'https://cognizant.com', email: 'recruiter@cognizant.com', name: 'Ananya Iyer' },
    { company: 'Persistent Systems', industry: 'Software Engineering', size: '501-1000', website: 'https://persistent.com', email: 'recruiter@persistent.com', name: 'Karan Patil' },
    { company: 'Tech Mahindra', industry: 'IT Services', size: '1000+', website: 'https://techmahindra.com', email: 'recruiter@techmahindra.com', name: 'Divya Rao' },
    { company: 'LTTS', industry: 'Engineering Services', size: '501-1000', website: 'https://ltts.com', email: 'recruiter@ltts.com', name: 'Aditya Kulkarni' },
    { company: 'Tata Elxsi', industry: 'Design & Technology', size: '501-1000', website: 'https://tataelxsi.com', email: 'recruiter@tataelxsi.com', name: 'Meenakshi Pillai' },
];

const STUDENT_NAMES = [
    'Aarav Sharma', 'Priya Patel', 'Ananya Singh', 'Rohan Verma', 'Neha Joshi', 'Arjun Mehta', 'Karan Shah', 'Ishita Desai',
    'Yash Patel', 'Dhruv Trivedi', 'Riya Gupta', 'Siddharth Nair', 'Tanvi Kapoor', 'Vivek Reddy', 'Pooja Mehta',
    'Aditya Kumar', 'Shreya Sharma', 'Nikhil Jain', 'Kavya Iyer', 'Rahul Patel', 'Sakshi Verma', 'Akash Singh',
    'Megha Rao', 'Harshit Trivedi', 'Diya Shah', 'Kiran Modi', 'Arnav Desai', 'Mansi Joshi', 'Dev Pandey', 'Ritu Agarwal',
    'Varun Sharma', 'Anisha Patel', 'Sumit Verma', 'Pallavi Nair', 'Aakash Mehta', 'Ritika Singh', 'Parth Shah', 'Swati Gupta',
    'Neel Trivedi', 'Sonal Kapoor', 'Harsh Reddy', 'Trisha Kumar', 'Mohit Jain', 'Sneha Iyer', 'Sameer Patel', 'Prachi Verma',
    'Chirag Singh', 'Nikita Rao', 'Divyansh Desai', 'Komal Joshi', 'Pratik Sharma', 'Ankita Patel', 'Nilay Gupta', 'Rashi Nair',
    'Abhishek Mehta', 'Poonam Shah', 'Aman Verma', 'Sunidhi Trivedi', 'Gaurav Kapoor', 'Riddhi Reddy', 'Kunal Kumar',
    'Aishwarya Jain', 'Vikram Iyer', 'Ayushi Patel', 'Saurabh Sharma', 'Heena Singh', 'Jayesh Gupta', 'Antra Nair',
    'Hemant Mehta', 'Simran Shah', 'Nishant Verma', 'Chandni Trivedi', 'Yuvraj Kapoor', 'Jhanvi Reddy', 'Akshat Kumar',
    'Bhakti Jain', 'Parv Iyer', 'Tanisha Patel', 'Ronit Sharma', 'Aditi Singh', 'Shubham Gupta', 'Kritika Nair',
    'Manas Mehta', 'Swara Shah', 'Tarun Verma', 'Ojasvi Trivedi', 'Siddhant Kapoor', 'Nandini Reddy', 'Vipul Kumar',
    'Shruti Jain', 'Umang Iyer', 'Preeti Patel', 'Lakshay Sharma', 'Isha Singh', 'Kartik Gupta', 'Deepika Nair',
    'Naman Mehta', 'Garima Shah', 'Rajat Verma', 'Sonam Trivedi', 'Ronak Kapoor', 'Varsha Reddy',
];

const BRANCHES = ['Computer Science & Engineering', 'Information Technology', 'Artificial Intelligence & Data Science', 'Cybersecurity', 'Electronics & Communication'];
const BRANCH_SLUG = ['cse', 'it', 'ai', 'cyber', 'ece'];
const GRAD_YEARS = [2024, 2025, 2026, 2027];
const CAREER_PATHS_DATA = [
    { title: 'Frontend Developer', slug: 'frontend-developer', category: 'frontend', difficultyLevel: 'Medium', duration: '3-4 months', industryDemand: 'Very High', requiredSkills: ['React', 'HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Redux', 'Webpack'] },
    { title: 'Backend Developer', slug: 'backend-developer', category: 'backend', difficultyLevel: 'Medium', duration: '3-4 months', industryDemand: 'Very High', requiredSkills: ['Node.js', 'Express', 'MongoDB', 'REST API', 'JWT', 'Redis', 'Docker', 'PostgreSQL'] },
    { title: 'Full Stack Developer', slug: 'full-stack-developer', category: 'fullstack', difficultyLevel: 'Hard', duration: '5-6 months', industryDemand: 'Very High', requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express', 'TypeScript', 'Docker', 'GraphQL', 'CI/CD'] },
    { title: 'AI Engineer', slug: 'ai-engineer', category: 'ai', difficultyLevel: 'Hard', duration: '5-6 months', industryDemand: 'Very High', requiredSkills: ['Python', 'LangChain', 'Vector Databases', 'Transformers', 'PyTorch', 'FastAPI', 'RAG', 'Prompt Engineering'] },
    { title: 'ML Engineer', slug: 'ml-engineer', category: 'ai', difficultyLevel: 'Hard', duration: '5-6 months', industryDemand: 'High', requiredSkills: ['Python', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'MLflow', 'Pandas', 'NumPy', 'Feature Engineering'] },
    { title: 'Data Scientist', slug: 'data-scientist', category: 'data', difficultyLevel: 'Medium', duration: '4-5 months', industryDemand: 'High', requiredSkills: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'SQL', 'Power BI', 'Statistics', 'Apache Spark'] },
    { title: 'Cybersecurity Analyst', slug: 'cybersecurity-analyst', category: 'cyber', difficultyLevel: 'Hard', duration: '4-5 months', industryDemand: 'High', requiredSkills: ['Network Security', 'Ethical Hacking', 'Burp Suite', 'OWASP', 'Cryptography', 'SIEM', 'Wireshark', 'Threat Intelligence'] },
    { title: 'UI/UX Designer', slug: 'ui-ux-designer', category: 'design', difficultyLevel: 'Beginner', duration: '2-3 months', industryDemand: 'High', requiredSkills: ['Figma', 'Adobe XD', 'Wireframing', 'Prototyping', 'User Research', 'Design Systems', 'Accessibility', 'Motion Design'] },
    { title: 'Cloud Engineer', slug: 'cloud-engineer', category: 'cloud', difficultyLevel: 'Hard', duration: '4-5 months', industryDemand: 'Very High', requiredSkills: ['AWS', 'Azure', 'GCP', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD', 'Serverless'] },
    { title: 'DevOps Engineer', slug: 'devops-engineer', category: 'devops', difficultyLevel: 'Hard', duration: '4-5 months', industryDemand: 'Very High', requiredSkills: ['Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions', 'Ansible', 'Prometheus', 'Grafana', 'Linux'] },
];

const COMPANIES = [
    { name: 'NeuralMind Technologies', manager: 'Sarah Johnson', managerRole: 'Senior AI Manager', dept: 'AI & Machine Learning' },
    { name: 'CodeForge Labs', manager: 'Rahul Patel', managerRole: 'Engineering Lead', dept: 'Software Engineering' },
    { name: 'DataSphere Analytics', manager: 'Aditi Desai', managerRole: 'Data Science Lead', dept: 'Data Engineering' },
    { name: 'CloudNova Systems', manager: 'Michael Shah', managerRole: 'Cloud Architect', dept: 'Cloud Infrastructure' },
    { name: 'CyberShield Security', manager: 'Arjun Nair', managerRole: 'Security Lead', dept: 'Cybersecurity' },
    { name: 'NextGen AI Solutions', manager: 'Priya Krishnan', managerRole: 'AI Research Lead', dept: 'AI Research' },
    { name: 'QuantumSoft Technologies', manager: 'Vikram Menon', managerRole: 'Full Stack Lead', dept: 'Product Engineering' },
    { name: 'ByteCraft Innovations', manager: 'Neha Sharma', managerRole: 'DevOps Lead', dept: 'Platform Engineering' },
];

// Tasks bank per career category
const TASKS_BANK = {
    frontend: [
        { title: 'Build Interactive Dashboard', difficulty: 'Medium', hours: 10, cat: 'UI Development', skills: ['React', 'CSS3', 'Chart.js'] },
        { title: 'Implement JWT Authentication Flow', difficulty: 'Medium', hours: 8, cat: 'Security', skills: ['React', 'JWT', 'Axios'] },
        { title: 'Create Real-time Analytics Charts', difficulty: 'Hard', hours: 12, cat: 'Data Viz', skills: ['React', 'Recharts', 'WebSocket'] },
        { title: 'Responsive UI Optimization', difficulty: 'Easy', hours: 6, cat: 'Performance', skills: ['CSS3', 'Media Queries', 'Flexbox'] },
        { title: 'Implement State Management with Redux', difficulty: 'Hard', hours: 14, cat: 'Architecture', skills: ['Redux', 'React', 'TypeScript'] },
        { title: 'Build Component Design System', difficulty: 'Medium', hours: 10, cat: 'UI Design', skills: ['React', 'Storybook', 'Figma'] },
        { title: 'Implement Infinite Scroll Pagination', difficulty: 'Easy', hours: 5, cat: 'Performance', skills: ['React', 'REST API', 'Intersection Observer'] },
        { title: 'WebSocket Real-time Notifications', difficulty: 'Hard', hours: 16, cat: 'Real-time', skills: ['WebSocket', 'React', 'Node.js'] },
        { title: 'Dark Mode & Theme Toggle System', difficulty: 'Easy', hours: 4, cat: 'UI Design', skills: ['CSS Variables', 'React', 'localStorage'] },
        { title: 'Accessibility Audit & WCAG Fixes', difficulty: 'Medium', hours: 8, cat: 'Accessibility', skills: ['ARIA', 'HTML5', 'Screen Readers'] },
        { title: 'Build Drag & Drop Task Board', difficulty: 'Hard', hours: 18, cat: 'UI Development', skills: ['React DnD', 'React', 'TypeScript'] },
        { title: 'Progressive Web App Conversion', difficulty: 'Medium', hours: 10, cat: 'Performance', skills: ['PWA', 'Service Workers', 'Manifest'] },
    ],
    backend: [
        { title: 'Design RESTful Authentication APIs', difficulty: 'Medium', hours: 10, cat: 'Security', skills: ['Node.js', 'JWT', 'bcrypt'] },
        { title: 'Role Based Access Control System', difficulty: 'Hard', hours: 14, cat: 'Security', skills: ['Node.js', 'Middleware', 'MongoDB'] },
        { title: 'File Upload Microservice', difficulty: 'Medium', hours: 8, cat: 'Cloud', skills: ['Multer', 'Cloudinary', 'Express'] },
        { title: 'Redis Caching Layer Implementation', difficulty: 'Hard', hours: 16, cat: 'Performance', skills: ['Redis', 'Node.js', 'Cache Strategy'] },
        { title: 'Database Schema Optimization', difficulty: 'Medium', hours: 10, cat: 'Database', skills: ['MongoDB', 'Indexing', 'Aggregation'] },
        { title: 'Build Webhook Event System', difficulty: 'Hard', hours: 18, cat: 'Integration', skills: ['Node.js', 'Event Queue', 'REST'] },
        { title: 'Rate Limiting & API Security', difficulty: 'Medium', hours: 8, cat: 'Security', skills: ['express-rate-limit', 'helmet', 'CORS'] },
        { title: 'Real-time Chat with Socket.io', difficulty: 'Hard', hours: 20, cat: 'Real-time', skills: ['Socket.io', 'Node.js', 'MongoDB'] },
        { title: 'Email Notification Queue', difficulty: 'Medium', hours: 10, cat: 'Integration', skills: ['Bull', 'NodeMailer', 'Redis'] },
        { title: 'GraphQL API Layer', difficulty: 'Hard', hours: 16, cat: 'API Design', skills: ['GraphQL', 'Apollo Server', 'MongoDB'] },
        { title: 'API Documentation with Swagger', difficulty: 'Easy', hours: 6, cat: 'Documentation', skills: ['Swagger', 'OpenAPI', 'Express'] },
        { title: 'Microservices Health Check Dashboard', difficulty: 'Medium', hours: 12, cat: 'Observability', skills: ['Node.js', 'Prometheus', 'Express'] },
    ],
    ai: [
        { title: 'Build AI Resume Analyzer', difficulty: 'Hard', hours: 20, cat: 'AI Application', skills: ['Python', 'LangChain', 'OpenAI'] },
        { title: 'RAG Chatbot with Vector DB', difficulty: 'Hard', hours: 24, cat: 'AI Application', skills: ['LangChain', 'Pinecone', 'GPT-4'] },
        { title: 'Skill Gap Predictor ML Model', difficulty: 'Medium', hours: 16, cat: 'ML', skills: ['Python', 'Scikit-learn', 'NLP'] },
        { title: 'AI Interview Question Generator', difficulty: 'Medium', hours: 12, cat: 'AI Application', skills: ['Python', 'Transformers', 'FastAPI'] },
        { title: 'Sentiment Analysis Pipeline', difficulty: 'Medium', hours: 14, cat: 'NLP', skills: ['Python', 'BERT', 'Hugging Face'] },
        { title: 'Document Classification System', difficulty: 'Hard', hours: 18, cat: 'ML', skills: ['Python', 'TensorFlow', 'NLP'] },
        { title: 'Embedding Search with FAISS', difficulty: 'Hard', hours: 20, cat: 'AI Infrastructure', skills: ['Python', 'FAISS', 'LangChain'] },
        { title: 'Build LLM Evaluation Framework', difficulty: 'Hard', hours: 22, cat: 'AI Quality', skills: ['Python', 'MLflow', 'Prometheus'] },
        { title: 'Fine-tune BERT for Classification', difficulty: 'Hard', hours: 28, cat: 'ML Fine-tuning', skills: ['Python', 'PyTorch', 'Transformers'] },
        { title: 'Build AI Code Review Tool', difficulty: 'Medium', hours: 16, cat: 'AI Application', skills: ['Python', 'AST', 'LangChain'] },
        { title: 'Multi-agent Orchestration System', difficulty: 'Hard', hours: 24, cat: 'AI Architecture', skills: ['Python', 'LangGraph', 'LangChain'] },
        { title: 'Prompt Engineering Optimization Lab', difficulty: 'Medium', hours: 10, cat: 'Prompt Design', skills: ['Python', 'LangChain', 'Evaluation'] },
    ],
    data: [
        { title: 'Build ETL Data Pipeline', difficulty: 'Hard', hours: 20, cat: 'Data Engineering', skills: ['Python', 'Apache Airflow', 'SQL'] },
        { title: 'Interactive Power BI Dashboard', difficulty: 'Medium', hours: 12, cat: 'Data Viz', skills: ['Power BI', 'SQL', 'DAX'] },
        { title: 'Predictive Analytics Model', difficulty: 'Hard', hours: 18, cat: 'ML', skills: ['Python', 'Scikit-learn', 'Pandas'] },
        { title: 'Kafka Streaming Data Processor', difficulty: 'Hard', hours: 22, cat: 'Streaming', skills: ['Kafka', 'Python', 'Spark'] },
        { title: 'Data Warehouse with Star Schema', difficulty: 'Medium', hours: 14, cat: 'Database', skills: ['SQL', 'Snowflake', 'dbt'] },
        { title: 'Data Quality Validation Framework', difficulty: 'Medium', hours: 10, cat: 'Data Quality', skills: ['Python', 'Great Expectations', 'SQL'] },
        { title: 'A/B Testing Statistical Analysis', difficulty: 'Medium', hours: 12, cat: 'Analytics', skills: ['Python', 'Statistics', 'SciPy'] },
        { title: 'Real-time Anomaly Detection', difficulty: 'Hard', hours: 20, cat: 'ML', skills: ['Python', 'Isolation Forest', 'Kafka'] },
        { title: 'Customer Segmentation Model', difficulty: 'Medium', hours: 14, cat: 'ML', skills: ['Python', 'K-Means', 'Pandas'] },
        { title: 'Web Scraping & Data Ingestion', difficulty: 'Easy', hours: 8, cat: 'Data Ingestion', skills: ['Python', 'Scrapy', 'MongoDB'] },
        { title: 'Feature Engineering Pipeline', difficulty: 'Hard', hours: 16, cat: 'ML', skills: ['Python', 'Pandas', 'Featuretools'] },
        { title: 'EDA Report Automation', difficulty: 'Easy', hours: 6, cat: 'Analytics', skills: ['Python', 'Pandas Profiling', 'Jupyter'] },
    ],
    cyber: [
        { title: 'Vulnerability Scanner Tool', difficulty: 'Hard', hours: 20, cat: 'Security', skills: ['Python', 'Nmap', 'OWASP'] },
        { title: 'JWT Authentication Security Audit', difficulty: 'Medium', hours: 10, cat: 'Security', skills: ['JWT', 'OWASP', 'Burp Suite'] },
        { title: 'AI-powered Threat Detection System', difficulty: 'Hard', hours: 24, cat: 'Security AI', skills: ['Python', 'ML', 'SIEM'] },
        { title: 'SQL Injection Prevention Framework', difficulty: 'Medium', hours: 12, cat: 'Security', skills: ['SQL', 'OWASP', 'Node.js'] },
        { title: 'API Gateway Security Hardening', difficulty: 'Hard', hours: 16, cat: 'Infrastructure', skills: ['NGINX', 'SSL/TLS', 'Rate Limiting'] },
        { title: 'Container Security Scanning', difficulty: 'Medium', hours: 10, cat: 'DevSecOps', skills: ['Docker', 'Trivy', 'Snyk'] },
        { title: 'SIEM Log Analysis Dashboard', difficulty: 'Hard', hours: 20, cat: 'Monitoring', skills: ['ELK Stack', 'Python', 'Splunk'] },
        { title: 'Cryptography Implementation Lab', difficulty: 'Medium', hours: 14, cat: 'Cryptography', skills: ['Python', 'OpenSSL', 'RSA', 'AES'] },
        { title: 'Zero Trust Network Policy Design', difficulty: 'Hard', hours: 18, cat: 'Network Security', skills: ['Firewall', 'RBAC', 'Micro-segmentation'] },
        { title: 'Malware Analysis Sandbox', difficulty: 'Hard', hours: 22, cat: 'Threat Analysis', skills: ['Python', 'Yara', 'CAPA'] },
        { title: 'Web Application Firewall Config', difficulty: 'Medium', hours: 10, cat: 'Security', skills: ['WAF', 'ModSecurity', 'NGINX'] },
        { title: 'Penetration Testing Report', difficulty: 'Hard', hours: 20, cat: 'Pen Testing', skills: ['Metasploit', 'Burp Suite', 'Kali Linux'] },
    ],
    fullstack: [
        { title: 'Full Stack E-commerce Platform', difficulty: 'Hard', hours: 30, cat: 'Full Stack', skills: ['React', 'Node.js', 'MongoDB', 'Stripe'] },
        { title: 'Real-time Collaboration Tool', difficulty: 'Hard', hours: 25, cat: 'Full Stack', skills: ['React', 'Socket.io', 'Node.js'] },
        { title: 'Multi-tenant SaaS Application', difficulty: 'Hard', hours: 28, cat: 'Architecture', skills: ['React', 'Node.js', 'MongoDB', 'Redis'] },
        { title: 'Build Social Media Analytics App', difficulty: 'Medium', hours: 20, cat: 'Full Stack', skills: ['React', 'Node.js', 'Chart.js', 'REST API'] },
        { title: 'Progressive Web App with Offline Mode', difficulty: 'Medium', hours: 18, cat: 'PWA', skills: ['React', 'Service Workers', 'IndexedDB'] },
        { title: 'GraphQL Full Stack Integration', difficulty: 'Hard', hours: 22, cat: 'API Architecture', skills: ['React', 'GraphQL', 'Apollo', 'Node.js'] },
        { title: 'CI/CD Pipeline Setup', difficulty: 'Medium', hours: 14, cat: 'DevOps', skills: ['GitHub Actions', 'Docker', 'Nginx'] },
        { title: 'Payment Gateway Integration', difficulty: 'Medium', hours: 12, cat: 'Integration', skills: ['Stripe', 'Node.js', 'React', 'Webhooks'] },
        { title: 'Implement OAuth 2.0 Login', difficulty: 'Medium', hours: 10, cat: 'Authentication', skills: ['OAuth2', 'Passport.js', 'Node.js'] },
        { title: 'Performance Optimization Audit', difficulty: 'Medium', hours: 12, cat: 'Performance', skills: ['Lighthouse', 'React.memo', 'Code Splitting'] },
        { title: 'Build Admin Analytics Dashboard', difficulty: 'Hard', hours: 20, cat: 'Full Stack', skills: ['React', 'Node.js', 'MongoDB Aggregation'] },
        { title: 'Internationalization Setup', difficulty: 'Easy', hours: 6, cat: 'i18n', skills: ['i18next', 'React', 'JSON'] },
    ],
    cloud: [
        { title: 'AWS Lambda Serverless API', difficulty: 'Hard', hours: 20, cat: 'Serverless', skills: ['AWS Lambda', 'API Gateway', 'DynamoDB'] },
        { title: 'Kubernetes Cluster Deployment', difficulty: 'Hard', hours: 24, cat: 'Container Orchest', skills: ['Kubernetes', 'Helm', 'Docker'] },
        { title: 'Terraform Infrastructure as Code', difficulty: 'Hard', hours: 20, cat: 'IaC', skills: ['Terraform', 'AWS', 'Ansible'] },
        { title: 'Multi-Region Disaster Recovery', difficulty: 'Hard', hours: 22, cat: 'Architecture', skills: ['AWS', 'Route 53', 'RDS', 'Failover'] },
        { title: 'Cloud Cost Optimization Audit', difficulty: 'Medium', hours: 12, cat: 'FinOps', skills: ['AWS Cost Explorer', 'Reserved Instances', 'Auto Scaling'] },
        { title: 'Serverless Event-driven Architecture', difficulty: 'Hard', hours: 20, cat: 'Architecture', skills: ['AWS SQS', 'Lambda', 'EventBridge'] },
        { title: 'CDN & Edge Computing Setup', difficulty: 'Medium', hours: 14, cat: 'Performance', skills: ['CloudFront', 'Edge Functions', 'S3'] },
        { title: 'Monitoring with CloudWatch & Grafana', difficulty: 'Medium', hours: 12, cat: 'Observability', skills: ['CloudWatch', 'Grafana', 'Prometheus'] },
        { title: 'VPC Network Security Design', difficulty: 'Hard', hours: 18, cat: 'Networking', skills: ['VPC', 'Security Groups', 'NACLs', 'AWS'] },
        { title: 'Managed Kubernetes Service (EKS)', difficulty: 'Hard', hours: 22, cat: 'Container', skills: ['EKS', 'Kubernetes', 'Helm', 'Istio'] },
        { title: 'Multi-Cloud Connectivity Setup', difficulty: 'Hard', hours: 20, cat: 'Cloud', skills: ['AWS', 'Azure', 'GCP', 'VPN Gateway'] },
        { title: 'Container Registry & CI/CD Pipeline', difficulty: 'Medium', hours: 14, cat: 'DevOps', skills: ['ECR', 'CodePipeline', 'Docker'] },
    ],
    devops: [
        { title: 'Docker Compose Orchestration Setup', difficulty: 'Medium', hours: 10, cat: 'Container', skills: ['Docker', 'Docker Compose', 'YAML'] },
        { title: 'GitHub Actions CI/CD Pipeline', difficulty: 'Medium', hours: 12, cat: 'CI/CD', skills: ['GitHub Actions', 'Docker', 'Node.js'] },
        { title: 'Ansible Configuration Management', difficulty: 'Hard', hours: 18, cat: 'IaC', skills: ['Ansible', 'Linux', 'YAML'] },
        { title: 'Prometheus + Grafana Monitoring', difficulty: 'Hard', hours: 20, cat: 'Observability', skills: ['Prometheus', 'Grafana', 'AlertManager'] },
        { title: 'Blue-Green Deployment Strategy', difficulty: 'Hard', hours: 16, cat: 'Deployment', skills: ['Kubernetes', 'Docker', 'NGINX'] },
        { title: 'Log Aggregation with ELK Stack', difficulty: 'Hard', hours: 20, cat: 'Logging', skills: ['Elasticsearch', 'Logstash', 'Kibana'] },
        { title: 'Auto-scaling Policy Design', difficulty: 'Medium', hours: 12, cat: 'Scalability', skills: ['Kubernetes HPA', 'AWS', 'Metrics'] },
        { title: 'Secrets Management with Vault', difficulty: 'Hard', hours: 16, cat: 'Security', skills: ['HashiCorp Vault', 'Kubernetes', 'RBAC'] },
        { title: 'Build Service Mesh with Istio', difficulty: 'Hard', hours: 22, cat: 'Networking', skills: ['Istio', 'Kubernetes', 'mTLS'] },
        { title: 'Load Testing with k6', difficulty: 'Medium', hours: 10, cat: 'Testing', skills: ['k6', 'Performance Testing', 'Grafana'] },
        { title: 'Container Image Hardening', difficulty: 'Medium', hours: 12, cat: 'Security', skills: ['Docker', 'Trivy', 'CIS Benchmark'] },
        { title: 'Chaos Engineering Experiment', difficulty: 'Hard', hours: 18, cat: 'Resilience', skills: ['Chaos Monkey', 'Kubernetes', 'Observability'] },
    ],
    design: [
        { title: 'Design System Creation in Figma', difficulty: 'Medium', hours: 16, cat: 'Design System', skills: ['Figma', 'Design Tokens', 'Components'] },
        { title: 'User Research & Persona Mapping', difficulty: 'Medium', hours: 12, cat: 'UX Research', skills: ['User Interviews', 'Affinity Mapping', 'Figma'] },
        { title: 'Mobile App UI Prototype', difficulty: 'Medium', hours: 14, cat: 'Prototyping', skills: ['Figma', 'Mobile UX', 'Prototyping'] },
        { title: 'Usability Testing & Report', difficulty: 'Medium', hours: 10, cat: 'UX Testing', skills: ['Maze', 'User Testing', 'Analysis'] },
        { title: 'Information Architecture Redesign', difficulty: 'Hard', hours: 18, cat: 'IA', skills: ['Card Sorting', 'Sitemap', 'Figma'] },
        { title: 'Dark Mode Design System Variant', difficulty: 'Easy', hours: 8, cat: 'UI Design', skills: ['Figma', 'Color Theory', 'Contrast'] },
        { title: 'Micro-interaction Animations', difficulty: 'Medium', hours: 12, cat: 'Motion Design', skills: ['After Effects', 'Lottie', 'Figma'] },
        { title: 'Accessibility Audit & Redesign', difficulty: 'Medium', hours: 14, cat: 'Accessibility', skills: ['WCAG', 'Figma', 'Screen Reader Testing'] },
        { title: 'Dashboard Analytics UI Kit', difficulty: 'Medium', hours: 16, cat: 'UI Design', skills: ['Figma', 'Data Viz', 'Charts'] },
        { title: 'Landing Page Conversion Optimization', difficulty: 'Easy', hours: 8, cat: 'CRO', skills: ['Figma', 'A/B Testing', 'UX Writing'] },
        { title: 'Brand Identity Design System', difficulty: 'Hard', hours: 20, cat: 'Branding', skills: ['Figma', 'Typography', 'Color System'] },
        { title: 'Cross-Platform Design Tokens', difficulty: 'Medium', hours: 10, cat: 'Design Ops', skills: ['Style Dictionary', 'Figma', 'JSON'] },
    ],
};

const CATEGORY_TO_TASK_KEY = {
    frontend: 'frontend', backend: 'backend', ai: 'ai', data: 'data',
    cyber: 'cyber', fullstack: 'fullstack', cloud: 'cloud', devops: 'devops', design: 'design',
};

// Task descriptions templates
const TASK_DESC_TEMPLATES = [
    (t) => `Build a production-ready ${t.title.toLowerCase()} module using ${t.skills.slice(0, 2).join(' and ')}. Ensure proper error handling, logging, and test coverage. Document your implementation with a clear README.`,
    (t) => `Design and implement ${t.title.toLowerCase()} following industry best practices. Use ${t.skills[0]} as the primary technology. Deliverables include source code, unit tests, and architecture documentation.`,
    (t) => `Create a scalable ${t.title.toLowerCase()} solution. Your implementation should demonstrate mastery of ${t.skills.slice(0, 3).join(', ')}. Include performance benchmarks and a deployment guide.`,
];

const GITHUB_USERS = [
    'aarav-sharma', 'priya-patel-dev', 'ananya-singh', 'rohan-verma', 'neha-joshi', 'arjun-mehta-dev',
    'karan-shah01', 'ishita-desai', 'yash-patel99', 'dhruv-trivedi', 'riya-dev', 'sid-nair', 'tanvi-k',
    'vivek-rd', 'pooja-mehta', 'aditya-dev', 'shreya-s', 'nikhil-j01', 'kavya-iyer', 'rahul-dev',
    'sakshi-v', 'akash-s99', 'megha-r', 'harshit-t', 'diya-shah', 'kiran-m', 'arnav-d', 'mansi-j',
    'dev-pandey', 'ritu-a', 'varun-s', 'anisha-p', 'sumit-v', 'pallavi-n', 'aakash-m', 'ritika-s',
    'parth-s01', 'swati-g', 'neel-t', 'sonal-k', 'harsh-r', 'trisha-k', 'mohit-j', 'sneha-i',
    'sameer-p', 'prachi-v', 'chirag-s', 'nikita-r', 'divyansh-d', 'komal-j', 'pratik-s', 'ankita-p',
    'nilay-g', 'rashi-n', 'abhi-m', 'poonam-s', 'aman-v', 'sunidhi-t', 'gaurav-k', 'riddhi-r',
    'kunal-k', 'aish-j', 'vikram-i', 'ayushi-p', 'saurabh-s', 'heena-s', 'jayesh-g', 'antra-n',
    'hemant-m', 'simran-s', 'nishant-v', 'chandni-t', 'yuvraj-k', 'jhanvi-r', 'akshat-k', 'bhakti-j',
    'parv-i', 'tanisha-p', 'ronit-s', 'aditi-s01', 'shubham-g', 'kritika-n', 'manas-m', 'swara-s',
    'tarun-v', 'ojasvi-t', 'sidd-k', 'nandini-r', 'vipul-k', 'shruti-j', 'umang-i', 'preeti-p',
    'lakshay-s', 'isha-s', 'kartik-g', 'deepika-n', 'naman-m', 'garima-s', 'rajat-v', 'sonam-t',
];

const STRENGTHS_POOL = [
    'Excellent code modularity and separation of concerns',
    'Well-documented API endpoints with clear naming conventions',
    'Strong error handling and graceful degradation patterns',
    'Clean folder structure following industry standards',
    'Proper use of environment variables for configuration',
    'Efficient database indexing strategy implemented',
    'Comprehensive README with setup and deployment instructions',
    'Good test coverage with meaningful test cases',
    'Secure authentication implementation with JWT',
    'Responsive UI design with cross-browser compatibility',
    'Effective use of TypeScript for type safety',
    'Performance optimization using caching strategies',
    'Clean commit history with descriptive messages',
    'Proper async/await usage avoiding callback hell',
    'RESTful API design following OpenAPI standards',
    'Excellent use of design patterns (Factory, Observer)',
    'SOLID principles clearly applied throughout codebase',
    'Efficient use of React hooks and memoization',
    'Production-ready Docker configuration',
    'CI/CD pipeline setup with automated testing',
];

const WEAKNESSES_POOL = [
    'Unit test coverage below 60% threshold',
    'Missing input validation on several API endpoints',
    'No rate limiting implemented on public endpoints',
    'Database queries not optimized — missing compound indexes',
    'Error messages expose sensitive server information',
    'Frontend state management could be more centralized',
    'No API versioning strategy implemented',
    'Missing pagination on data-heavy endpoints',
    'Hardcoded configuration values instead of env vars',
    'No logging strategy for production debugging',
    'CORS configuration is too permissive for production',
    'Missing database transaction handling for critical ops',
    'No retry mechanism for external API calls',
    'Frontend components too tightly coupled',
    'Missing proper TypeScript types on several modules',
    'No load balancing consideration in deployment config',
    'SQL queries not parameterized — potential injection risk',
    'Missing health check endpoint for service monitoring',
    'No caching headers set on static assets',
    'Documentation lacks API usage examples',
];

const RECOMMENDATIONS_POOL = [
    'Add comprehensive unit and integration tests with Jest',
    'Implement a centralized error handling middleware',
    'Add API rate limiting using express-rate-limit',
    'Optimize MongoDB queries with compound indexes',
    'Implement structured logging using Winston or Pino',
    'Add API versioning (/api/v1/) for backward compatibility',
    'Set up automated testing in the CI/CD pipeline',
    'Add pagination using cursor-based pagination strategy',
    'Implement Redis caching for frequently accessed data',
    'Add proper TypeScript strict mode across the project',
    'Configure proper CORS policy for each environment',
    'Add retry logic with exponential backoff for API calls',
    'Extract business logic into service layer pattern',
    'Add database migration scripts for schema changes',
    'Implement API documentation using Swagger/OpenAPI',
    'Set up proper monitoring with Prometheus metrics',
    'Add security scanning to CI/CD with Snyk or OWASP',
    'Implement proper secret rotation strategy',
    'Add performance testing with k6 or JMeter',
    'Create deployment runbook for production releases',
];

const CHAT_MESSAGES = {
    technical: [
        { role: 'user', msgs: ['How is my code quality looking?', 'Can you review my latest submission?', 'What are the major technical issues in my project?', 'How can I improve my architecture?'] },
        { role: 'ai', msgs: ['Your code quality score is solid. I noticed good use of async/await patterns.', 'The architecture is clean but I\'d suggest adding more unit tests.', 'Overall good structure. Focus on error handling improvements.', 'Your API design is RESTful and well-documented. Keep it up!'] },
    ],
    manager: [
        { role: 'user', msgs: ['How am I performing this sprint?', 'What should I focus on next week?', 'Am I on track with the project timeline?', 'What are the deliverables for this week?'] },
        { role: 'ai', msgs: ['You\'re making great progress. Stay focused on the core feature delivery.', 'This week\'s priority is the API integration milestone.', 'You\'re slightly behind on the documentation. Please update it.', 'Excellent sprint! Your delivery quality improved significantly.'] },
    ],
    career: [
        { role: 'user', msgs: ['How ready am I for placements?', 'Which companies should I target?', 'What skills should I develop?', 'Can you review my LinkedIn profile strategy?'] },
        { role: 'ai', msgs: ['Your placement readiness score is strong. Target mid-tier IT companies first.', 'Based on your AI track, focus on LangChain and vector DB projects.', 'I recommend adding Docker and Kubernetes to your skillset.', 'Your GitHub profile shows good consistency. Add more README quality.'] },
    ],
};

const INTERNSHIP_ROLES = {
    frontend: ['Frontend Engineering Intern', 'UI Developer Intern', 'React Developer Intern'],
    backend: ['Backend Engineering Intern', 'Node.js Developer Intern', 'API Developer Intern'],
    ai: ['AI Engineering Intern', 'ML Research Intern', 'NLP Engineering Intern'],
    data: ['Data Science Intern', 'Data Engineering Intern', 'Analytics Intern'],
    cyber: ['Cybersecurity Analyst Intern', 'Security Engineering Intern', 'Pen Testing Intern'],
    fullstack: ['Full Stack Developer Intern', 'Software Engineering Intern', 'Product Engineering Intern'],
    cloud: ['Cloud Engineering Intern', 'AWS Solutions Intern', 'Platform Engineering Intern'],
    devops: ['DevOps Engineering Intern', 'Site Reliability Intern', 'Platform Ops Intern'],
    design: ['UI/UX Design Intern', 'Product Design Intern', 'Interaction Design Intern'],
};

// ─────────────────────────────────────────────
// MAIN SEEDER
// ─────────────────────────────────────────────
const seedDemoData = async () => {
    console.log('\n🚀 InternX AI – Demo Data Seeder Starting...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Pre-hash the demo password once
    const salt = await bcrypt.genSalt(12);
    HASHED_PASSWORD = await bcrypt.hash(PLAIN_PASSWORD, salt);
    console.log(`🔐 Password hashed (bcrypt, 12 rounds) for: "${PLAIN_PASSWORD}"\n`);

    // ── PHASE 1: Colleges ────────────────────────────────────────
    console.log('📚 Phase 1: Seeding Colleges...');
    const collegeIds = [];
    for (const c of COLLEGES) {
        const college = await College.findOneAndUpdate(
            { collegeCode: c.collegeCode },
            {
                name: c.name, collegeName: c.name, shortName: c.shortName,
                city: c.city, state: c.state, country: 'India', website: c.website,
                totalStudents: c.totalStudents, verified: true, type: 'Engineering',
                collegeCode: c.collegeCode,
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );
        collegeIds.push(college._id);
    }
    console.log(`   ✅ ${collegeIds.length} colleges seeded`);

    // ── PHASE 2: College Admin Accounts ─────────────────────────
    console.log('👨‍💼 Phase 2: Seeding College Admin Accounts...');
    const collegeAdminIds = [];
    for (let i = 0; i < COLLEGE_ADMINS.length; i++) {
        const ca = COLLEGE_ADMINS[i];
        const collegeId = collegeIds[i];

        let userDoc = await User.findOneAndUpdate(
            { email: ca.email },
            {
                fullName: ca.name, email: ca.email, role: 'college_representative',
                isVerified: true, isEmailVerified: true, profileCompleted: true, isActive: true,
                collegeId,
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );
        // Force-set hashed password (bypass pre-save hook for seeder)
        await User.updateOne({ _id: userDoc._id }, { $set: { password: HASHED_PASSWORD } });

        // CollegeRepresentative profile
        await CollegeRepresentative.findOneAndUpdate(
            { userId: userDoc._id },
            {
                userId: userDoc._id, collegeId,
                designation: COLLEGE_ADMINS[i].designation,
                officialEmail: ca.email, phone: ca.phone,
                verificationStatus: 'approved', verificationDocument: 'seeded-doc-verified',
                verifiedAt: daysAgo(30),
            },
            { upsert: true, returnDocument: 'after' }
        );
        collegeAdminIds.push(userDoc._id);
    }
    console.log(`   ✅ ${collegeAdminIds.length} college admin accounts seeded`);

    // ── PHASE 3 & 4: Recruiters ──────────────────────────────────
    console.log('🏢 Phase 3+4: Seeding Recruiters...');
    const recruiterIds = [];
    for (const r of RECRUITERS) {
        let userDoc = await User.findOneAndUpdate(
            { email: r.email },
            {
                fullName: r.name, email: r.email, role: 'recruiter',
                isVerified: true, isEmailVerified: true, profileCompleted: true,
                isActive: true, isRecruiterVerified: true,
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );
        await User.updateOne({ _id: userDoc._id }, { $set: { password: HASHED_PASSWORD } });

        await Recruiter.findOneAndUpdate(
            { userId: userDoc._id },
            { userId: userDoc._id, companyName: r.company, industry: r.industry, companySize: r.size, website: r.website },
            { upsert: true, returnDocument: 'after' }
        );
        recruiterIds.push(userDoc._id);
    }
    console.log(`   ✅ ${recruiterIds.length} recruiter accounts seeded`);

    // ── PHASE 5: Career Paths ────────────────────────────────────
    console.log('🎯 Phase 5: Seeding Career Paths...');
    const careerPathMap = {}; // slug -> ObjectId
    for (const cp of CAREER_PATHS_DATA) {
        const doc = await CareerPath.findOneAndUpdate(
            { slug: cp.slug },
            {
                title: cp.title, slug: cp.slug, category: cp.category,
                description: `A comprehensive ${cp.title} career track preparing students for industry roles in ${cp.category}. This path covers ${cp.requiredSkills.slice(0, 3).join(', ')} and more.`,
                difficultyLevel: cp.difficultyLevel, duration: cp.duration,
                requiredSkills: cp.requiredSkills, industryDemand: cp.industryDemand, status: 'active',
                learningRoadmap: [
                    { phase: 1, title: 'Fundamentals', description: `Core ${cp.title} foundations`, topics: cp.requiredSkills.slice(0, 3) },
                    { phase: 2, title: 'Intermediate Projects', description: `Build real-world ${cp.category} projects`, topics: cp.requiredSkills.slice(2, 5) },
                    { phase: 3, title: 'Advanced Specialization', description: 'Production-grade implementation', topics: cp.requiredSkills.slice(5) },
                ],
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );
        careerPathMap[cp.slug] = doc._id;
    }
    console.log(`   ✅ ${Object.keys(careerPathMap).length} career paths seeded`);

    // ── PHASE 6: Students (100) ──────────────────────────────────
    console.log('👨‍🎓 Phase 6: Seeding 100 Students...');
    const studentUserIds = [];
    const studentCareerCategories = []; // parallel array: category per student

    const careerSlugKeys = Object.keys(careerPathMap);

    for (let i = 0; i < 100; i++) {
        const name = STUDENT_NAMES[i] || `Student ${i + 1}`;
        const emailSlug = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
        const email = `${emailSlug}${i}@student.internx.ai`;
        const branchIdx = i % BRANCHES.length;
        const branch = BRANCHES[branchIdx];
        const branchSlug = BRANCH_SLUG[branchIdx];
        const collegeId = collegeIds[i % collegeIds.length];
        const gradYear = pick(GRAD_YEARS);

        // Map branch to career category
        const branchCareerMap = { cse: 'backend', it: 'fullstack', ai: 'ai', cyber: 'cyber', ece: 'cloud' };
        let careerCategory = branchCareerMap[branchSlug] || 'fullstack';
        // Add variety: every 5th student gets a different path
        if (i % 5 === 0) careerCategory = pick(['frontend', 'data', 'devops', 'design']);

        // Find matching career path slug
        const matchSlug = careerSlugKeys.find(s => {
            const cp = CAREER_PATHS_DATA.find(c => c.slug === s);
            return cp && cp.category === careerCategory;
        }) || careerSlugKeys[0];

        const githubUser = GITHUB_USERS[i] || `student${i}dev`;
        const skills = pickN(CAREER_PATHS_DATA.find(c => c.category === careerCategory)?.requiredSkills || ['Python', 'JavaScript'], 4);

        let userDoc = await User.findOneAndUpdate(
            { email },
            {
                fullName: name, email, role: 'student',
                isVerified: true, isEmailVerified: true, profileCompleted: true, isActive: true,
                collegeId, department: branch,
                year: rand(1, 4), careerPath: careerCategory,
                avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );
        await User.updateOne({ _id: userDoc._id }, { $set: { password: HASHED_PASSWORD } });

        // Student profile
        await Student.findOneAndUpdate(
            { userId: userDoc._id },
            {
                userId: userDoc._id, fullName: name,
                collegeName: COLLEGES[i % COLLEGES.length].name,
                course: branch, year: rand(2, 4), skills,
            },
            { upsert: true, returnDocument: 'after' }
        );

        // StudentCareer selection
        await StudentCareer.findOneAndUpdate(
            { studentId: userDoc._id },
            {
                studentId: userDoc._id, careerId: careerPathMap[matchSlug],
                currentLevel: pick(['Beginner', 'Intermediate', 'Job Ready']),
                completionPercentage: rand(40, 95), status: 'in-progress',
                selectedAt: daysAgo(rand(30, 90)),
            },
            { upsert: true, returnDocument: 'after' }
        );

        studentUserIds.push(userDoc._id);
        studentCareerCategories.push(careerCategory);
    }
    console.log(`   ✅ ${studentUserIds.length} students seeded`);

    // ── PHASE 7: Internships ─────────────────────────────────────
    console.log('🏗  Phase 7: Seeding Internships...');
    const internshipIds = [];
    for (let i = 0; i < studentUserIds.length; i++) {
        const studentId = studentUserIds[i];
        const careerCat = studentCareerCategories[i];
        const company = COMPANIES[i % COMPANIES.length];
        const roles = INTERNSHIP_ROLES[careerCat] || INTERNSHIP_ROLES.fullstack;
        const role = pick(roles);
        const progress = rand(30, 100);
        const startDate = daysAgo(rand(30, 90));

        const internship = await Internship.findOneAndUpdate(
            { studentId },
            {
                studentId,
                companyName: company.name, industry: `${careerCat.charAt(0).toUpperCase() + careerCat.slice(1)} Technology`,
                companyDescription: `${company.name} is a leading ${careerCat} technology company building next-gen AI-powered products.`,
                department: company.dept, workCulture: 'Remote-first with weekly standups and async communication',
                managerName: company.manager, managerRole: company.managerRole,
                managerIntroduction: `Hi! I'm ${company.manager}, your ${company.managerRole}. I'm excited to mentor you through this internship journey at ${company.name}. We build production-grade ${careerCat} systems here.`,
                projectName: `InternX ${careerCat.toUpperCase()} Engine v2.0`,
                projectDescription: `A production-ready ${careerCat} system built to scale. You will work on real-world features including ${careerCat} optimization, API design, and deployment pipelines.`,
                internshipRole: role, internshipDuration: pick(['8 Weeks', '10 Weeks', '12 Weeks']),
                expectedLearningOutcomes: ['Production-grade code quality', 'API design best practices', 'CI/CD pipeline setup', 'Code review experience'],
                businessProblem: `Scale our ${careerCat} infrastructure to handle 10x growth while maintaining reliability.`,
                technicalRequirements: CAREER_PATHS_DATA.find(c => c.category === careerCat)?.requiredSkills?.slice(0, 4) || ['JavaScript', 'Node.js'],
                successCriteria: ['Deliver 8+ sprint tasks', 'Maintain 80+ evaluation score', 'Complete code reviews', 'Submit final project report'],
                welcomeMessage: `Welcome aboard, ${STUDENT_NAMES[i] || 'Student'}! We are thrilled to have you join our ${company.dept} team. Let\'s build great things together!`,
                progress, startDate,
            },
            { upsert: true, returnDocument: 'after' }
        );
        internshipIds.push(internship._id);
    }
    console.log(`   ✅ ${internshipIds.length} internships seeded`);

    // ── PHASE 8: Tasks (~1000 tasks, 8-12 per student) ──────────
    console.log('📋 Phase 8: Seeding Tasks (~1000 tasks)...');
    const allTasks = []; // { taskId, studentId, internshipId }
    let taskCount = 0;

    for (let i = 0; i < studentUserIds.length; i++) {
        const studentId = studentUserIds[i];
        const internshipId = internshipIds[i];
        const careerCat = studentCareerCategories[i];
        const taskKey = CATEGORY_TO_TASK_KEY[careerCat] || 'fullstack';
        const taskPool = TASKS_BANK[taskKey] || TASKS_BANK.fullstack;
        const numTasks = rand(8, 12);
        const selectedTasks = pickN(taskPool, numTasks);

        const statuses = ['completed', 'completed', 'completed', 'completed', 'completed', 'in-progress', 'todo'];

        for (let j = 0; j < selectedTasks.length; j++) {
            const t = selectedTasks[j];
            const status = j < selectedTasks.length - 2 ? 'completed' : pick(statuses);
            const score = status === 'completed' ? rand(65, 98) : null;
            const descFn = TASK_DESC_TEMPLATES[j % TASK_DESC_TEMPLATES.length];
            const desc = descFn(t);

            const task = await Task.findOneAndUpdate(
                { studentId, internshipId, title: t.title },
                {
                    studentId, internshipId, title: t.title,
                    description: desc, difficulty: t.difficulty,
                    estimatedHours: t.hours, status,
                    progress: status === 'completed' ? 100 : status === 'in-progress' ? rand(20, 80) : 0,
                    objective: `Implement a production-grade ${t.title.toLowerCase()} that meets enterprise standards.`,
                    businessPurpose: `This task directly contributes to the core ${t.cat} infrastructure of the platform.`,
                    requiredSkills: t.skills, category: t.cat,
                    deadlineDays: rand(3, 7),
                    score: score,
                    feedback: score ? `${pick(STRENGTHS_POOL)}. ${pick(RECOMMENDATIONS_POOL)}.` : '',
                    categoryScore: score ? {
                        code: rand(60, 98), arch: rand(60, 98), perf: rand(60, 98), sec: rand(60, 98), doc: rand(60, 98)
                    } : { code: 0, arch: 0, perf: 0, sec: 0, doc: 0 },
                },
                { upsert: true, returnDocument: 'after' }
            );
            allTasks.push({ taskId: task._id, studentId, internshipId, careerCat, submissionType: 'github', githubUser: GITHUB_USERS[i], projectSlug: t.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') });
            taskCount++;
        }
    }
    console.log(`   ✅ ${taskCount} tasks seeded`);

    // ── PHASE 9: Submissions + Evaluations + Feedback (~850) ────
    console.log('📦 Phase 9: Seeding Submissions, Evaluations & Feedback...');
    let submissionCount = 0;
    let evalCount = 0;
    let feedbackCount = 0;

    // Only seed submissions for completed tasks
    const completedTasks = allTasks.filter(async () => true); // We'll check during iteration
    const submissionMap = {}; // taskId -> submissionId (for EvaluationReport later)

    for (const t of allTasks) {
        // Only ~85% of tasks get submissions (matches ~850/1000)
        if (Math.random() > 0.85) continue;

        const githubUrl = `https://github.com/${t.githubUser}/${t.projectSlug}`;
        const submittedAt = daysAgo(rand(1, 60));

        // Look up existing task to get its status
        const taskDoc = await Task.findById(t.taskId);
        if (!taskDoc) continue;
        const isCompleted = taskDoc.status === 'completed';

        const submission = await Submission.findOneAndUpdate(
            { taskId: t.taskId, studentId: t.studentId },
            {
                taskId: t.taskId, studentId: t.studentId, internshipId: t.internshipId,
                submissionType: 'github', githubUrl, githubBranch: 'main',
                githubCommitHash: Math.random().toString(36).substring(2, 9),
                submittedAt, status: isCompleted ? 'Completed' : 'Submitted',
                progress: isCompleted ? 100 : rand(20, 80),
                extractedMetadata: {
                    description: `Production-grade implementation of ${t.projectSlug}`,
                    technologies: pickN(CAREER_PATHS_DATA.find(c => c.category === t.careerCat)?.requiredSkills || ['JavaScript'], 4),
                    fileCount: rand(15, 80), commitsCount: rand(8, 45), branchCount: rand(1, 4),
                    readmeContent: `# ${t.projectSlug}\n\nProduction-ready implementation built during InternX AI virtual internship.\n\n## Setup\n\nnpm install && npm run dev\n\n## Tech Stack\n${(pickN(['React', 'Node.js', 'MongoDB', 'Docker', 'Redis'], 3)).join(', ')}`,
                    folderStructure: ['src/', 'src/components/', 'src/services/', 'src/models/', 'src/routes/', 'tests/', 'README.md', 'package.json', '.env.example', 'Dockerfile'],
                }
            },
            { upsert: true, returnDocument: 'after' }
        );
        submissionMap[t.taskId.toString()] = submission._id;
        submissionCount++;

        if (!isCompleted) continue;

        // Evaluation
        const score = taskDoc.score || rand(65, 98);
        const evalScores = {
            technicalScore: Math.min(100, score + rand(-5, 5)),
            architectureScore: Math.min(100, score + rand(-5, 5)),
            codeQualityScore: Math.min(100, score + rand(-5, 5)),
            documentationScore: Math.min(100, score + rand(-8, 8)),
            problemSolvingScore: Math.min(100, score + rand(-5, 5)),
            githubScore: Math.min(100, score + rand(-3, 3)),
        };

        const evalStrengths = pickN(STRENGTHS_POOL, rand(2, 4));
        const evalWeaknesses = pickN(WEAKNESSES_POOL, rand(1, 3));
        const evalRecs = pickN(RECOMMENDATIONS_POOL, rand(2, 3));

        const evaluation = await Evaluation.findOneAndUpdate(
            { submissionId: submission._id },
            {
                submissionId: submission._id,
                ...evalScores,
                repositoryScore: evalScores.technicalScore,
                overallScore: score,
                strengths: evalStrengths, weaknesses: evalWeaknesses, recommendations: evalRecs,
                reasons: {
                    technicalScore: `Found ${rand(15, 60)} source files with clean TypeScript/JavaScript implementations.`,
                    architectureScore: `Project separates concerns into controllers, services, and models layers.`,
                    codeQualityScore: `Code follows consistent naming conventions with ${rand(5, 15)} documented functions.`,
                    documentationScore: `README includes setup, API docs, and ${rand(2, 6)} architecture diagrams.`,
                    problemSolvingScore: `All ${rand(3, 8)} task requirements addressed with working implementations.`,
                    githubScore: `Repository has ${rand(10, 50)} commits with meaningful messages and ${rand(1, 4)} branches.`,
                },
                evaluatedAt: new Date(submittedAt.getTime() + rand(1, 6) * 60 * 60 * 1000),
            },
            { upsert: true, returnDocument: 'after' }
        );
        evalCount++;

        // Feedback per submission
        await Feedback.findOneAndUpdate(
            { submissionId: submission._id },
            {
                studentId: t.studentId, internshipId: t.internshipId,
                taskId: t.taskId, submissionId: submission._id,
                strengths: evalStrengths, weaknesses: evalWeaknesses, recommendations: evalRecs,
                mentorFeedback: `Your submission demonstrates ${pick(['excellent', 'strong', 'solid'])} ${pick(['technical depth', 'engineering judgment', 'code quality'])}. ${evalStrengths[0]}. Focus area: ${evalWeaknesses[0] || 'Keep pushing quality'}.`,
            },
            { upsert: true, returnDocument: 'after' }
        );
        feedbackCount++;
    }
    console.log(`   ✅ ${submissionCount} submissions | ${evalCount} evaluations | ${feedbackCount} feedback records seeded`);

    // ── PHASE 10: Per-Student Reports ────────────────────────────
    console.log('📊 Phase 10: Seeding Per-Student Reports (EvaluationReport, SkillAnalysis, CareerReport, CareerIntelligence)...');

    for (let i = 0; i < studentUserIds.length; i++) {
        const studentId = studentUserIds[i];
        const careerCat = studentCareerCategories[i];
        const collegeId = collegeIds[i % collegeIds.length];
        const careerPath = CAREER_PATHS_DATA.find(c => c.category === careerCat) || CAREER_PATHS_DATA[0];

        const overallScore = rand(65, 96);
        const technicalScore = Math.min(100, overallScore + rand(-5, 5));
        const codeQuality = Math.min(100, overallScore + rand(-8, 8));
        const projectStructure = Math.min(100, overallScore + rand(-5, 5));
        const docScore = Math.min(100, overallScore + rand(-10, 10));
        const githubScore = Math.min(100, overallScore + rand(-5, 5));

        const strengths = pickN(STRENGTHS_POOL, rand(3, 5));
        const weaknesses = pickN(WEAKNESSES_POOL, rand(2, 4));
        const recs = pickN(RECOMMENDATIONS_POOL, rand(3, 5));
        const skills = pickN(careerPath.requiredSkills, rand(4, 6));
        const skillGaps = pickN(careerPath.requiredSkills.filter(s => !skills.includes(s)), rand(2, 4));

        const readinessScore = rand(60, 98);
        const careerLevel = readinessScore >= 85 ? 'Job Ready' : readinessScore >= 70 ? 'Intermediate' : 'Beginner';

        // EvaluationReport
        await EvaluationReport.findOneAndUpdate(
            { studentId },
            {
                studentId, internshipId: internshipIds[i], submissionId: submissionMap[Object.keys(submissionMap)[i]] || null,
                overallScore, technicalScore, codeQuality, projectStructure, documentationScore: docScore, githubScore,
                strengths, weaknesses,
                identifiedSkills: skills, identifiedSkillGaps: skillGaps,
                recommendations: recs, careerRecommendations: pickN(['AWS Certified Developer', 'Google Cloud Associate', 'Meta Frontend Developer Certificate', 'TensorFlow Developer Certificate', 'Certified Kubernetes Administrator', 'CompTIA Security+'], 2),
                readinessLevel: careerLevel, generatedAt: daysAgo(rand(1, 30)),
            },
            { upsert: true, returnDocument: 'after' }
        );

        // SkillAnalysis
        const currentSkills = {};
        skills.forEach(s => { currentSkills[s] = rand(50, 95); });
        const benchmarkSkills = {};
        careerPath.requiredSkills.forEach(s => { benchmarkSkills[s] = rand(70, 95); });

        await SkillAnalysis.findOneAndUpdate(
            { studentId },
            {
                studentId, careerPath: careerPath.title,
                currentSkills, benchmarkSkills,
                skillGaps: Object.fromEntries(skillGaps.map(s => [s, rand(40, 70)])),
                learningRecommendations: recs.slice(0, 3),
            },
            { upsert: true, returnDocument: 'after' }
        );

        // SkillGapReport
        await SkillGapReport.findOneAndUpdate(
            { studentId },
            {
                studentId, detectedSkills: skills, missingSkills: skillGaps,
                gapPercentage: Math.round((skillGaps.length / careerPath.requiredSkills.length) * 100),
                generatedAt: daysAgo(rand(1, 30)),
            },
            { upsert: true, returnDocument: 'after' }
        );

        // CareerIntelligence
        await CareerIntelligence.findOneAndUpdate(
            { studentId },
            {
                studentId, internshipId: internshipIds[i],
                portfolioScore: rand(60, 95), placementReadiness: readinessScore,
                githubScore, careerReadiness: careerLevel,
                recommendedRoles: pickN({
                    frontend: ['Frontend Engineer', 'UI Developer', 'React Specialist'],
                    backend: ['Backend Engineer', 'API Developer', 'Node.js Developer'],
                    ai: ['AI Engineer', 'ML Engineer', 'NLP Researcher'],
                    data: ['Data Scientist', 'Data Engineer', 'Analytics Engineer'],
                    cyber: ['Security Analyst', 'Penetration Tester', 'SOC Analyst'],
                    fullstack: ['Full Stack Developer', 'Software Engineer', 'Product Engineer'],
                    cloud: ['Cloud Engineer', 'AWS Architect', 'Platform Engineer'],
                    devops: ['DevOps Engineer', 'SRE', 'Platform Engineer'],
                    design: ['UI/UX Designer', 'Product Designer', 'UX Researcher'],
                }[careerCat] || ['Software Engineer'], 2),
                recommendedSkills: skillGaps.slice(0, 3),
                recommendedCertifications: pickN(['AWS Certified Developer', 'Google Associate Cloud Engineer', 'Certified Kubernetes Administrator', 'TensorFlow Developer Certificate', 'CompTIA Security+', 'Meta Frontend Developer'], 2),
                recommendedProjects: [`Build a full-stack ${careerCat} application`, `Contribute to open-source ${careerCat} projects`],
                careerAdvice: `Focus on completing your skill gaps in ${skillGaps.slice(0, 2).join(' and ')}. Your strong foundation in ${skills[0]} makes you a competitive candidate.`,
            },
            { upsert: true, returnDocument: 'after' }
        );

        // CareerReport
        await CareerReport.findOneAndUpdate(
            { studentId },
            {
                studentId, readinessScore, portfolioScore: rand(60, 95), githubScore,
                careerLevel,
                recommendedRoles: pickN(['Software Engineer', 'Full Stack Developer', 'Data Scientist', 'DevOps Engineer', 'AI Engineer', 'Cloud Architect'], 2),
                recommendedSkills: skillGaps.slice(0, 3),
                recommendedProjects: [`Production ${careerCat} project`, 'Open source contribution'],
                recommendedCertifications: pickN(['AWS Developer', 'Google Cloud', 'CKA', 'TensorFlow'], 2),
                salaryRange: readinessScore >= 85 ? '₹8L - ₹15L per annum' : readinessScore >= 70 ? '₹5L - ₹10L per annum' : '₹3L - ₹6L per annum',
                careerAdvice: `Your ${careerLevel} readiness level puts you in a strong position for ${careerCat} roles. Keep building projects.`,
            },
            { upsert: true, returnDocument: 'after' }
        );

        // FeedbackReport
        await FeedbackReport.findOneAndUpdate(
            { studentId },
            {
                studentId, strengths: strengths.slice(0, 3), weaknesses: weaknesses.slice(0, 2),
                recommendations: recs.slice(0, 3),
                managerFeedback: `${STUDENT_NAMES[i]?.split(' ')[0] || 'Student'} has shown ${pick(['remarkable', 'commendable', 'strong'])} progress. ${strengths[0]}. Priority improvement area: ${weaknesses[0]}.`,
            },
            { upsert: true, returnDocument: 'after' }
        );
    }
    console.log(`   ✅ Per-student reports seeded for ${studentUserIds.length} students`);

    // ── PHASE 11: Certificates ───────────────────────────────────
    console.log('🏆 Phase 11: Seeding Certificates...');
    let certCount = 0;
    for (let i = 0; i < studentUserIds.length; i++) {
        const studentId = studentUserIds[i];
        const careerCat = studentCareerCategories[i];
        const careerPath = CAREER_PATHS_DATA.find(c => c.category === careerCat) || CAREER_PATHS_DATA[0];
        const careerPathId = careerPathMap[careerPath.slug];
        const company = COMPANIES[i % COMPANIES.length];
        const roles = INTERNSHIP_ROLES[careerCat] || INTERNSHIP_ROLES.fullstack;
        const certId = `INTERNX-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const grade = rand(68, 98);

        await Certificate.findOneAndUpdate(
            { studentId },
            {
                studentId, collegeId: collegeIds[i % collegeIds.length],
                careerId: careerPathId, certificateId: certId,
                recipientName: STUDENT_NAMES[i] || `Student ${i + 1}`,
                companyName: company.name, roleTitle: pick(roles),
                grade, issueDate: daysAgo(rand(5, 60)),
                status: 'Active & Verified',
            },
            { upsert: true, returnDocument: 'after' }
        );
        certCount++;
    }
    console.log(`   ✅ ${certCount} certificates seeded`);

    // ── PHASE 12: College Analytics ──────────────────────────────
    console.log('📈 Phase 12: Seeding College Analytics...');
    for (let i = 0; i < collegeIds.length; i++) {
        const collegeId = collegeIds[i];
        const studentsInCollege = Math.ceil(100 / COLLEGES.length);
        await CollegeAnalytics.findOneAndUpdate(
            { collegeId },
            {
                collegeId,
                totalStudents: studentsInCollege,
                activeInternships: Math.ceil(studentsInCollege * 0.3),
                completedInternships: Math.floor(studentsInCollege * 0.7),
                averageScore: rand(72, 89),
                placementReadiness: rand(70, 92),
                certificatesIssued: Math.floor(studentsInCollege * 0.85),
                githubConnectedStudents: Math.floor(studentsInCollege * 0.75),
                interviewReadyStudents: Math.floor(studentsInCollege * 0.6),
            },
            { upsert: true, returnDocument: 'after' }
        );
    }
    console.log(`   ✅ ${collegeIds.length} college analytics records seeded`);

    // ─────────────────────────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(55));
    console.log('🎉  InternX AI Demo Data Seeding Complete!');
    console.log('═'.repeat(55));
    console.log(`📚  Colleges          : ${collegeIds.length}`);
    console.log(`👨‍💼  College Admins    : ${collegeAdminIds.length}`);
    console.log(`🏢  Recruiters        : ${recruiterIds.length}`);
    console.log(`👨‍🎓  Students          : ${studentUserIds.length}`);
    console.log(`🎯  Career Paths      : ${Object.keys(careerPathMap).length}`);
    console.log(`🏗   Internships       : ${internshipIds.length}`);
    console.log(`📋  Tasks             : ${taskCount}`);
    console.log(`📦  Submissions       : ${submissionCount}`);
    console.log(`📊  Evaluations       : ${evalCount}`);
    console.log(`💬  Feedback Records  : ${feedbackCount}`);
    console.log(`🏆  Certificates      : ${certCount}`);
    console.log('═'.repeat(55));
    console.log('\n✅  All accounts use password: 12345678');
    console.log('✅  Admin: admin123@gmail.com / Admin@123');
    console.log('\nSample Student Logins:');
    console.log('  aarav.sharma0@student.internx.ai / 12345678');
    console.log('  priya.patel1@student.internx.ai / 12345678');
    console.log('  ananya.singh2@student.internx.ai / 12345678');
    console.log('\nSample Recruiter Logins:');
    console.log('  recruiter@infosys.com / 12345678');
    console.log('  recruiter@tcs.com / 12345678');
    console.log('\nSample College Admin Logins:');
    console.log('  admin@msu.edu / 12345678');
    console.log('  admin@daiict.edu / 12345678');
    console.log('═'.repeat(55) + '\n');
};

seedDemoData()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('\n❌ Seeder failed:', err.message);
        console.error(err.stack);
        process.exit(1);
    });
