import CareerPath from '../models/CareerPath.js';
import StudentCareer from '../models/StudentCareer.js';
import Task from '../models/Task.js';
import SkillAnalysis from '../models/SkillAnalysis.js';
import CareerIntelligence from '../models/CareerIntelligence.js';
import Internship from '../models/Internship.js';
import Interview from '../models/Interview.js';
import InterviewReport from '../models/InterviewReport.js';
import { updateStudentCareerIntelligence } from '../services/evaluation.service.js';
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

    // Get selected career to find required benchmark skills
    const studentCareer = await StudentCareer.findOne({ studentId }).populate('careerId');
    if (!studentCareer) {
      return sendResponse(res, 404, false, 'No selected career path found. Please select a career path first.');
    }

    const career = studentCareer.careerId;
    const requiredSkills = career.requiredSkills || [];

    // Get current student skills
    let skillAnalysis = await SkillAnalysis.findOne({ studentId });
    if (!skillAnalysis) {
      // Initialize with required skills at 0
      skillAnalysis = new SkillAnalysis({
        studentId,
        skills: requiredSkills.map(name => ({ name, level: 0 }))
      });
      await skillAnalysis.save();
    }

    // Build skillComparisonData
    const skillComparisonData = requiredSkills.map(skillName => {
      const match = skillAnalysis.skills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
      const current = match ? match.level : 0;
      const benchmark = 80; // default industry benchmark
      return {
        subject: skillName,
        current,
        benchmark,
        fullMark: 100
      };
    });

    // Calculate gaps
    const gaps = [];
    requiredSkills.forEach(skillName => {
      const match = skillAnalysis.skills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
      const current = match ? match.level : 0;
      const benchmark = 80;
      if (current < benchmark) {
        const gapVal = current - benchmark;
        let level = 'Beginner';
        if (current >= 60) level = 'Advanced';
        else if (current >= 30) level = 'Intermediate';

        let recommend = `Complete more deliverables requiring ${skillName} to close the capability gap.`;
        if (skillName.toLowerCase() === 'vector databases' || skillName.toLowerCase() === 'vector db indexes') {
          recommend = 'Design embedding database schema structures. Practice indexing and filtering logic.';
        } else if (skillName.toLowerCase() === 'langchain' || skillName.toLowerCase() === 'langchain orchestrator') {
          recommend = 'Implement custom RAG routing streams with LangChain integration.';
        } else if (skillName.toLowerCase() === 'prometheus metrics' || skillName.toLowerCase() === 'prometheus') {
          recommend = 'Export prometheus metrics endpoints and setup dashboard gauges.';
        }

        gaps.push({
          skill: skillName,
          gap: `${gapVal}%`,
          level,
          recommend
        });
      }
    });

    return sendResponse(res, 200, true, 'Skill analysis retrieved successfully', {
      skillComparisonData,
      gaps
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

    // Recalculate intelligence dynamically to ensure it is accurate
    await updateStudentCareerIntelligence(studentId);

    const careerIntel = await CareerIntelligence.findOne({ studentId });
    if (!careerIntel) {
      return sendResponse(res, 404, false, 'Career intelligence details not found.');
    }

    return sendResponse(res, 200, true, 'Career intelligence retrieved successfully', {
      readinessScore: careerIntel.readinessScore,
      portfolioScore: careerIntel.portfolioScore,
      placementReadiness: careerIntel.placementReadiness,
      recommendedRoles: careerIntel.recommendedRoles,
      recommendedSkills: careerIntel.recommendedSkills,
      recommendedProjects: careerIntel.recommendedProjects,
      recommendedCertifications: careerIntel.recommendedCertifications
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
