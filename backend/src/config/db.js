import mongoose from 'mongoose';
import User from '../models/User.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed Fixed Admin
    try {
      // Clean up other admin users to ensure ONLY one admin exists
      await User.deleteMany({ role: 'admin', email: { $ne: 'admin123@gmail.com' } });

      const adminEmail = 'admin123@gmail.com';
      const adminPassword = 'Admin@123';

      let admin = await User.findOne({ email: adminEmail });
      if (!admin) {
        admin = new User({
          fullName: 'System Admin',
          email: adminEmail,
          password: adminPassword,
          role: 'admin',
          isVerified: true,
          profileCompleted: true
        });
        await admin.save();
        console.log(`Fixed Admin user seeded successfully! (${adminEmail})`);
      } else {
        admin.password = adminPassword;
        admin.role = 'admin';
        admin.isVerified = true;
        admin.profileCompleted = true;
        await admin.save();
        console.log(`Fixed Admin user updated successfully! (${adminEmail})`);
      }
    } catch (seedError) {
      console.error(`Admin Seeding failed: ${seedError.message}`);
    }

    // Seed Career Paths
    try {
      const CareerPath = (await import('../models/CareerPath.js')).default;
      const initialCareers = [
        {
          title: 'AI Engineer',
          description: 'Deploy vector indices, fine-tune neural nets, and implement modern RAG routing architectures.',
          category: 'Artificial Intelligence',
          difficultyLevel: 'Hard',
          duration: '6 Weeks',
          requiredSkills: ['LangChain', 'Vector DBs', 'PyTorch', 'REST APIs'],
          industryDemand: 'Very High',
          learningRoadmap: [
            { phase: 1, title: 'Introduction to LLMs & Prompting', description: 'Master text generation and prompt design', topics: ['GPT Models', 'Zero-shot Prompting', 'System Messages'] },
            { phase: 2, title: 'Vector Embeddings & Retrieval', description: 'Index and query documents with semantic search', topics: ['Vector DBs', 'Cosine Similarity', 'Chunking Strategies'] },
            { phase: 3, title: 'RAG Pipeline Integration', description: 'Chain retrieval, memories, and generation models', topics: ['LangChain', 'RetrievalQA', 'Token Streaming'] },
          ],
        },
        {
          title: 'Frontend Developer',
          description: 'Craft smooth high-fidelity user experiences with advanced motion triggers and glassmorphic designs.',
          category: 'Software Engineering',
          difficultyLevel: 'Medium',
          duration: '4 Weeks',
          requiredSkills: ['React JS', 'Tailwind CSS', 'GSAP', 'Framer Motion'],
          industryDemand: 'High',
          learningRoadmap: [
            { phase: 1, title: 'Component Architecture & State', description: 'Design clean modular react components', topics: ['React Hooks', 'Context API', 'Props Layout'] },
            { phase: 2, title: 'Modern Responsive Layouts', description: 'Master flexbox, grid systems, and glassmorphism', topics: ['Tailwind CSS', 'CSS Variables', 'Responsive Breakpoints'] },
            { phase: 3, title: 'Fluid Interactions & Transitions', description: 'Animate web elements for immersive layouts', topics: ['GSAP timeline', 'Framer Motion triggers', 'Micro-interactions'] },
          ],
        },
        {
          title: 'Backend Developer',
          description: 'Optimize database index pipelines, scale caching models, and design bulletproof token rotation loops.',
          category: 'Software Engineering',
          difficultyLevel: 'Hard',
          duration: '5 Weeks',
          requiredSkills: ['Node JS', 'Redis', 'PostgreSQL', 'Docker'],
          industryDemand: 'Very High',
          learningRoadmap: [
            { phase: 1, title: 'RESTful API Engineering', description: 'Design secure routers, error handlers, and validations', topics: ['Express JS', 'Validators', 'Global Errors'] },
            { phase: 2, title: 'Database Optimization', description: 'Configure indexes, queries, and migrations', topics: ['Mongoose Schemas', 'Indexes', 'Cascade Deletes'] },
            { phase: 3, title: 'Session & Cache Engineering', description: 'Expose JWT auth loops and session caching', topics: ['JWT token refresh', 'Redis denylist', 'Docker compose'] },
          ],
        },
        {
          title: 'Full Stack Developer',
          description: 'Bridge frontend user journeys with backend database schemas, maintaining full architectural flow.',
          category: 'Software Engineering',
          difficultyLevel: 'Hard',
          duration: '6 Weeks',
          requiredSkills: ['React JS', 'Node JS', 'MongoDB', 'Tailwind CSS'],
          industryDemand: 'Very High',
          learningRoadmap: [
            { phase: 1, title: 'Unified Data Flow', description: 'Connect React fetch queries to Express API routes', topics: ['Axios Interceptors', 'REST endpoints', 'MERN architecture'] },
            { phase: 2, title: 'MERN Authentication Systems', description: 'Implement cross-origin login loops with cookie tracking', topics: ['HTTP-only cookies', 'JWT payloads', 'Role redirection'] },
            { phase: 3, title: 'Production Deployment', description: 'Build and deploy combined static pages and server processes', topics: ['Render config', 'Vite builds', 'Environment loading'] },
          ],
        },
        {
          title: 'Data Scientist',
          description: 'Build real-time fraud prediction models and deploy aggregate cohort datasets.',
          category: 'Data Science',
          difficultyLevel: 'Hard',
          duration: '5 Weeks',
          requiredSkills: ['Python', 'Pandas', 'Scikit-Learn', 'Recharts'],
          industryDemand: 'High',
          learningRoadmap: [
            { phase: 1, title: 'Data Wrangling', description: 'Parse, cleanse, and structure raw csv/json streams', topics: ['Pandas dataframes', 'Numpy operations', 'JSON normalizing'] },
            { phase: 2, title: 'Machine Learning Models', description: 'Train and validate regression, classification, and clustering algorithms', topics: ['Scikit-Learn', 'Train-test splits', 'Confusion matrices'] },
            { phase: 3, title: 'Visual Data Reporting', description: 'Convert prediction outputs to responsive charts and tables', topics: ['Recharts wrappers', 'JSON analytics payloads', 'Dashboard metrics'] },
          ],
        },
        {
          title: 'UI/UX Designer',
          description: 'Design design systems and build user journey wires for enterprise workspaces.',
          category: 'Design',
          difficultyLevel: 'Medium',
          duration: '4 Weeks',
          requiredSkills: ['Figma', 'Prototyping', 'Design Tokens', 'Design Research'],
          industryDemand: 'High',
          learningRoadmap: [
            { phase: 1, title: 'Design Foundations', description: 'Establish typographic grids, spacing guides, and palettes', topics: ['Auto layout', 'Component variants', 'Harmonious colors'] },
            { phase: 2, title: 'Interactive Prototypes', description: 'Simulate navigation maps, hover states, and inputs', topics: ['Figma interactions', 'Micro-animations', 'Transition triggers'] },
            { phase: 3, title: 'Design Systems handoff', description: 'Translate layouts to style tokens and CSS guidelines', topics: ['CSS variables', 'Figma tokens export', 'Developer handoff specs'] },
          ],
        },
        {
          title: 'Cybersecurity Analyst',
          description: 'Examine networks for zero-trust compliance and draft red team emulation flows.',
          category: 'Cybersecurity',
          difficultyLevel: 'Hard',
          duration: '5 Weeks',
          requiredSkills: ['Pen Testing', 'Wireshark', 'IAM policies', 'OSINT'],
          industryDemand: 'Very High',
          learningRoadmap: [
            { phase: 1, title: 'Zero Trust Networks', description: 'Establish secure IAM permissions and network boundaries', topics: ['IAM roles', 'Private VPCs', 'OAuth2 scopes'] },
            { phase: 2, title: 'Threat Intelligence Auditing', description: 'Examine packet capture logs for exploits and injection attacks', topics: ['Wireshark capture', 'SQLi checking', 'XSS headers'] },
            { phase: 3, title: 'Penetration Emulation', description: 'Draft exploits reports and remediation strategies', topics: ['Metasploit checks', 'Mitigating actions plan', 'Security advisories'] },
          ],
        },
      ];

      for (const career of initialCareers) {
        const exist = await CareerPath.findOne({ title: career.title });
        if (!exist) {
          await CareerPath.create(career);
          console.log(`Seeded career path: ${career.title}`);
        }
      }
    } catch (careerSeedError) {
      console.error(`Career Seeding failed: ${careerSeedError.message}`);
    }
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    console.warn('Server is running, but database features will fail until connection is resolved.');
  }
};

export default connectDB;
