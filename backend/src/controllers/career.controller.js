import CareerPath from '../models/CareerPath.js';
import StudentCareer from '../models/StudentCareer.js';
import Task from '../models/Task.js';
import SkillAnalysis from '../models/SkillAnalysis.js';
import CareerIntelligence from '../models/CareerIntelligence.js';
import Internship from '../models/Internship.js';
import Interview from '../models/Interview.js';
import InterviewReport from '../models/InterviewReport.js';
import { checkReportCache, generateCareerReports } from '../services/careerReport.service.js';
import { sendResponse } from '../utils/sendResponse.js';


/**
 * Retrieve all career paths with search, pagination, and filter parameters.
 * GET /api/careers
 */
export const getAllCareers = async (req, res, next) => {
  try {
    const { search, category, difficulty, page = 1, limit = 9 } = req.query;

    const query = { status: 'active' };

    // Apply filters
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (difficulty) {
      query.difficultyLevel = difficulty;
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await CareerPath.countDocuments(query);
    const careers = await CareerPath.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(total / limitNum);

    return sendResponse(res, 200, true, 'Careers retrieved successfully', {
      careers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get details of a single career path.
 * GET /api/careers/:id
 */
export const getCareerById = async (req, res, next) => {
  try {
    const career = await CareerPath.findById(req.params.id);
    if (!career) {
      return sendResponse(res, 404, false, 'Career path not found');
    }
    return sendResponse(res, 200, true, 'Career details retrieved successfully', { career });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin create a new career path.
 * POST /api/careers
 */
export const createCareer = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      difficultyLevel,
      duration,
      requiredSkills,
      learningRoadmap,
      industryDemand,
      careerImage,
      status,
    } = req.body;

    const existingCareer = await CareerPath.findOne({ title });
    if (existingCareer) {
      return sendResponse(res, 400, false, 'Career path title already exists');
    }

    const career = new CareerPath({
      title,
      description,
      category,
      difficultyLevel,
      duration,
      requiredSkills: requiredSkills || [],
      learningRoadmap: learningRoadmap || [],
      industryDemand: industryDemand || 'High',
      careerImage: careerImage || '',
      status: status || 'active',
      createdBy: req.user._id,
    });

    await career.save();
    return sendResponse(res, 201, true, 'Career path created successfully', { career });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin update an existing career path.
 * PUT /api/careers/:id
 */
export const updateCareer = async (req, res, next) => {
  try {
    const career = await CareerPath.findById(req.params.id);
    if (!career) {
      return sendResponse(res, 404, false, 'Career path not found');
    }

    const updateFields = [
      'title',
      'description',
      'category',
      'difficultyLevel',
      'duration',
      'requiredSkills',
      'learningRoadmap',
      'industryDemand',
      'careerImage',
      'status',
    ];

    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        career[field] = req.body[field];
      }
    });

    await career.save();
    return sendResponse(res, 200, true, 'Career path updated successfully', { career });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin delete a career path and cascade delete student selections.
 * DELETE /api/careers/:id
 */
export const deleteCareer = async (req, res, next) => {
  try {
    const career = await CareerPath.findById(req.params.id);
    if (!career) {
      return sendResponse(res, 404, false, 'Career path not found');
    }

    // Cascade delete StudentCareer selections matching this career
    await StudentCareer.deleteMany({ careerId: career._id });
    await CareerPath.findByIdAndDelete(career._id);

    return sendResponse(res, 200, true, 'Career path and associated student selections deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Student selects a career path.
 * POST /api/careers/select
 */
export const selectCareer = async (req, res, next) => {
  try {
    const { careerId } = req.body;

    if (!careerId) {
      return sendResponse(res, 400, false, 'Career ID is required');
    }

    // Verify career exists and is active
    const career = await CareerPath.findOne({ _id: careerId, status: 'active' });
    if (!career) {
      return sendResponse(res, 404, false, 'Active career path not found');
    }

    // Check if student already has a selected career (prevent duplicate/multiple career selections)
    const existingSelection = await StudentCareer.findOne({ studentId: req.user._id });
    if (existingSelection) {
      return sendResponse(res, 400, false, 'You have already selected a career path. Students are restricted to one active career path.');
    }

    const studentCareer = new StudentCareer({
      studentId: req.user._id,
      careerId: career._id,
      currentLevel: 'Beginner',
      completionPercentage: 0,
      status: 'in-progress',
    });

    await studentCareer.save();

    // Populate user object response virtual selectedCareer link
    req.user.selectedCareer = studentCareer;
    await req.user.save({ validateBeforeSave: false });

    return sendResponse(res, 201, true, `Successfully selected ${career.title} career path`, {
      studentCareer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current student's selected career path.
 * GET /api/careers/my-career
 */
export const getMyCareer = async (req, res, next) => {
  try {
    const studentCareer = await StudentCareer.findOne({ studentId: req.user._id }).populate('careerId');

    if (!studentCareer) {
      return sendResponse(res, 404, false, 'No selected career path found for this student');
    }

    // Calculate dynamic progress based on task completion
    const totalTasks = await Task.countDocuments({ studentId: req.user._id });
    const completedTasks = await Task.countDocuments({ studentId: req.user._id, status: 'completed' });
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    if (studentCareer.completionPercentage !== completionPercentage) {
      studentCareer.completionPercentage = completionPercentage;

      // Update career level based on progress
      if (completionPercentage >= 100) {
        studentCareer.currentLevel = 'Expert';
      } else if (completionPercentage >= 50) {
        studentCareer.currentLevel = 'Intermediate';
      } else {
        studentCareer.currentLevel = 'Beginner';
      }

      await studentCareer.save();
    }

    return sendResponse(res, 200, true, 'My career details retrieved successfully', {
      career: studentCareer.careerId,
      selectedAt: studentCareer.selectedAt,
      progress: studentCareer.completionPercentage,
      level: studentCareer.currentLevel,
      status: studentCareer.status,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve skill capability comparisons and identified gaps.
 * GET /api/careers/skill-analysis
 */
export const getSkillAnalysis = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // Check cache or generate new report
    let reports = await checkReportCache(studentId);
    if (!reports) {
      reports = await generateCareerReports(studentId);
    }
    const skillGap = reports.skillGap;
    const careerReport = reports.career;
    const avgScore = careerReport ? (careerReport.portfolioScore || 70) : 70;

    const allSkills = [...(skillGap.detectedSkills || []), ...(skillGap.missingSkills || [])];
    const uniqueSkills = Array.from(new Set(allSkills));
    const skillComparisonData = [];
    const gaps = [];

    uniqueSkills.forEach((skillName) => {
      const isMissing = skillGap.missingSkills.includes(skillName);
      const benchmark = 80;

      let current;
      if (isMissing) {
        current = Math.max(10, Math.min(45, Math.round(avgScore * 0.5)));
      } else {
        current = Math.max(70, Math.min(98, Math.round(65 + (avgScore - 50) * 0.6)));
      }

      skillComparisonData.push({
        subject: skillName,
        current,
        benchmark,
        fullMark: 100
      });

      if (isMissing) {
        const gapVal = Math.max(0, benchmark - current);
        const gap = `${gapVal}%`;
        let level = 'Beginner';
        if (current >= 30) level = 'Intermediate';

        let recommend = `Complete more deliverables requiring ${skillName} to close the capability gap.`;
        if (skillName.toLowerCase() === 'system design') {
          recommend = 'Practice rate limiters, database indexes optimizations, and caching design patterns.';
        } else if (skillName.toLowerCase() === 'testing' || skillName.toLowerCase() === 'unit testing') {
          recommend = 'Write centralized testing scripts with Jest, Supertest, or PyTest and check code coverage.';
        } else if (skillName.toLowerCase() === 'authentication' || skillName.toLowerCase() === 'jwt') {
          recommend = 'Implement JWT-based session security cookies and secure password hashing flows.';
        }

        gaps.push({
          skill: skillName,
          gap,
          level,
          recommend
        });
      }
    });

    // Dynamic career recommended modules based on track
    let careerPath = careerReport?.recommendedRoles?.[0];
    if (!careerPath) {
      const internshipObj = await Internship.findOne({ studentId });
      const studentCareerObj = await StudentCareer.findOne({ studentId }).populate('careerId');
      if (internshipObj?.internshipRole) {
        careerPath = internshipObj.internshipRole;
      } else if (internshipObj?.roleTitle) {
        careerPath = internshipObj.roleTitle;
      } else if (studentCareerObj?.careerId?.title) {
        careerPath = studentCareerObj.careerId.title;
      } else {
        careerPath = 'Backend Developer';
      }
    }
    const pathClean = careerPath.toLowerCase();
    let recommendedModules = [];

    if (pathClean.includes('ai') || pathClean.includes('machine learning') || pathClean.includes('data science') || pathClean.includes('artificial')) {
      recommendedModules = [
        { title: 'LLM Observability Masterclass', duration: '4 hrs' },
        { title: 'Vector Database Search Tuning', duration: '3 hrs' }
      ];
    } else if (pathClean.includes('frontend') || pathClean.includes('react') || pathClean.includes('web')) {
      recommendedModules = [
        { title: 'React Performance & Virtualization', duration: '3 hrs' },
        { title: 'Advanced CSS Grid & Glassmorphism', duration: '2 hrs' }
      ];
    } else if (pathClean.includes('cyber') || pathClean.includes('security')) {
      recommendedModules = [
        { title: 'API Penetration Testing Masterclass', duration: '5 hrs' },
        { title: 'OAuth2 & Token Validation Flow', duration: '3 hrs' }
      ];
    } else if (pathClean.includes('data engineer') || pathClean.includes('etl') || pathClean.includes('warehouse') || pathClean.includes('lake') || pathClean.includes('data warehousing') || pathClean.includes('lakehouse')) {
      recommendedModules = [
        { title: 'AWS Glue & ETL Pipelines', duration: '4 hrs' },
        { title: 'Big Data Processing with Apache Spark', duration: '5 hrs' }
      ];
    } else if (pathClean.includes('design') || pathClean.includes('ui') || pathClean.includes('ux') || pathClean.includes('product designer') || pathClean.includes('product design')) {
      recommendedModules = [
        { title: 'Advanced Figma Component Systems', duration: '3 hrs' },
        { title: 'Web Accessibility & WCAG Standards', duration: '2 hrs' }
      ];
    } else {
      recommendedModules = [
        { title: 'Node.js Event Loop Tuning', duration: '4 hrs' },
        { title: 'MongoDB Query Optimization & Indexing', duration: '3 hrs' }
      ];
    }


    return sendResponse(res, 200, true, 'Skill analysis retrieved successfully', {
      skillComparisonData,
      gaps,
      recommendedModules
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve student placement readiness, portfolio scores, and recommended tracks.
 * GET /api/careers/career-intelligence
 */
export const getCareerIntelligence = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // Check cache or generate new report
    let reports = await checkReportCache(studentId);
    if (!reports) {
      reports = await generateCareerReports(studentId);
    }
    const careerReport = reports.career;
    const feedbackReport = reports.feedback;
    const skillGapReport = reports.skillGap;

    return sendResponse(res, 200, true, 'Career intelligence retrieved successfully', {
      readinessScore: careerReport.readinessScore || 70,
      portfolioScore: careerReport.portfolioScore || 0,
      placementReadiness: careerReport.readinessScore || 0,
      careerReadiness: careerReport.careerLevel || 'Beginner',
      recommendedRoles: careerReport.recommendedRoles || [],
      recommendedSkills: careerReport.recommendedSkills || [],
      recommendedProjects: careerReport.recommendedProjects || [],
      recommendedCertifications: careerReport.recommendedCertifications || [],
      careerAdvice: careerReport.careerAdvice || '',
      careerIntel: careerReport,
      feedbackReport,
      skillGapReport
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check student certificate progress and download requirements.
 * GET /api/careers/certificate-progress
 */
export const getCertificateProgress = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // Calculate progress details
    const totalTasks = await Task.countDocuments({ studentId });
    const completedTasks = await Task.countDocuments({ studentId, status: 'completed' });
    const completedTasksDocs = await Task.find({ studentId, status: 'completed' });

    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const requiredPercentage = 80;

    const sumScores = completedTasksDocs.reduce((acc, t) => acc + (t.score || 0), 0);
    const avgScore = completedTasks > 0 ? Math.round(sumScores / completedTasks) : 0;

    // Get student's current internship to populate host details
    const internship = await Internship.findOne({ studentId });
    const company = internship ? internship.companyName : 'NeuralMind Technologies';
    const roleTitle = internship ? internship.roleTitle : 'AI Research Intern';
    const manager = internship ? internship.managerName : 'Sarah Johnson';

    const isEligible = completionPercentage >= requiredPercentage;
    const verificationCode = `IX-${studentId.toString().slice(-4)}-2026`;

    return sendResponse(res, 200, true, 'Certificate progress retrieved successfully', {
      completionPercentage,
      requiredPercentage,
      isEligible,
      grade: avgScore || 0,
      verificationCode,
      issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      company,
      roleTitle,
      manager
    });
  } catch (error) {
    next(error);
  }
};
