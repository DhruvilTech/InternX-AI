import CareerPath from '../models/CareerPath.js';
import StudentCareer from '../models/StudentCareer.js';
import Task from '../models/Task.js';
import SkillAnalysis from '../models/SkillAnalysis.js';
import CareerIntelligence from '../models/CareerIntelligence.js';
import Internship from '../models/Internship.js';
import Interview from '../models/Interview.js';
import InterviewReport from '../models/InterviewReport.js';
import { checkReportCache, generateCareerReports, validateReportPath } from '../services/careerReport.service.js';
import { sendResponse } from '../utils/sendResponse.js';
import Certificate from '../modules/college/models/Certificate.js';
import Student from '../models/Student.js';
import College from '../modules/college/models/College.js';
import Notification from '../models/Notification.js';


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

      // Update career level and status based on progress
      if (completionPercentage >= 100) {
        studentCareer.currentLevel = 'Expert';
        studentCareer.status = 'completed';
      } else if (completionPercentage >= 50) {
        studentCareer.currentLevel = 'Intermediate';
      } else {
        studentCareer.currentLevel = 'Beginner';
      }

      await studentCareer.save();

      // Trigger completion notifications if 100% complete
      if (completionPercentage >= 100) {
        const studentRecord = await Student.findOne({ userId: req.user._id });
        let collegeId = null;
        if (studentRecord) {
          const college = await College.findOne({
            $or: [
              { name: studentRecord.collegeName },
              { collegeName: studentRecord.collegeName }
            ]
          });
          if (college) collegeId = college._id;
        }

        const trackTitle = studentCareer.careerId?.title || 'Selected Track';

        await Notification.createUnique({
          recipientId: req.user._id,
          senderId: req.user._id,
          title: 'Internship Track Completed!',
          message: `Congratulations! You have completed 100% of your tasks for the ${trackTitle} track. Check your certificate progress.`,
          type: 'internship_completed',
          entityId: studentCareer._id
        });

        if (collegeId) {
          await Notification.createUnique({
            recipientId: collegeId,
            senderId: req.user._id,
            title: 'Student Completed Internship',
            message: `Student ${req.user.fullName} has completed 100% of their tasks for the ${trackTitle} track.`,
            type: 'internship_completed',
            entityId: studentCareer._id
          });
        }
      }
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

    const studentCareerObj = await StudentCareer.findOne({ studentId }).populate('careerId');
    const pathName = studentCareerObj?.careerId?.title || 'Cybersecurity Analyst';

    let reports = await checkReportCache(studentId);
    const forceRegen = req.query.regenerate === 'true';
    const isCacheValid = reports && validateReportPath(reports, pathName);

    if (!reports || !isCacheValid || forceRegen) {
      console.log(`[Career Controller] Cache invalid or missing for path: ${pathName}. Generating new reports...`);
      reports = await generateCareerReports(studentId);
    } else {
      reports = await generateCareerReports(studentId);
    }

    const recommendedModules = (reports.career.recommendedCertifications || []).map(cert => ({
      title: cert,
      duration: '3 hrs'
    }));

    return sendResponse(res, 200, true, 'Skill analysis retrieved successfully', {
      skillComparisonData: reports.skillComparisonData,
      gaps: reports.gaps,
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
      readinessScore: careerReport.readinessScore || 0,
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
    const roleTitle = internship ? (internship.internshipRole || internship.roleTitle) : 'AI Research Intern';
    const manager = internship ? internship.managerName : 'Sarah Johnson';

    const isEligible = completionPercentage >= requiredPercentage;

    let verificationCode = 'LOCKED';
    let finalCompany = 'LOCKED';
    let finalRole = 'LOCKED';
    let finalManager = 'LOCKED';
    let finalIssueDate = 'LOCKED';
    let finalGrade = 0;

    if (isEligible) {
      verificationCode = `IX-${studentId.toString().slice(-4)}-2026`;
      finalCompany = company;
      finalRole = roleTitle;
      finalManager = manager;
      finalIssueDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      finalGrade = avgScore || 80;

      // Find the student's selected career
      const studentCareer = await StudentCareer.findOne({ studentId });
      const careerId = studentCareer ? studentCareer.careerId : null;

      if (careerId) {
        // Find college info to populate collegeId in certificate
        const studentRecord = await Student.findOne({ userId: studentId });
        let collegeId = null;
        if (studentRecord) {
          const college = await College.findOne({
            $or: [
              { name: studentRecord.collegeName },
              { collegeName: studentRecord.collegeName }
            ]
          });
          if (college) {
            collegeId = college._id;
          }
        }

        // Check if certificate already exists for this student
        let cert = await Certificate.findOne({ studentId });
        if (!cert) {
          const careerObj = await CareerPath.findById(careerId);
          const finalRoleTitle = careerObj ? `${careerObj.title} Intern` : roleTitle;
          finalRole = finalRoleTitle;
          
          cert = await Certificate.create({
            studentId,
            collegeId,
            careerId,
            certificateId: verificationCode,
            recipientName: req.user.fullName,
            companyName: company,
            roleTitle: finalRoleTitle,
            grade: avgScore || 80,
            issueDate: new Date(),
            status: 'Active & Verified'
          });
          finalGrade = cert.grade;
          finalIssueDate = new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

          // Trigger notifications for Certificate Generated
          await Notification.createUnique({
            recipientId: studentId,
            senderId: collegeId || req.user._id,
            title: 'Certificate Generated!',
            message: `Your verified simulated internship certificate for ${finalRoleTitle} at ${company} has been generated.`,
            type: 'certificate_generated',
            entityId: cert._id
          });

          if (collegeId) {
            await Notification.createUnique({
              recipientId: collegeId,
              senderId: studentId,
              title: 'Certificate Issued',
              message: `A verified internship certificate has been issued to ${req.user.fullName} for the role of ${finalRoleTitle}.`,
              type: 'certificate_generated',
              entityId: cert._id
            });
          }
        } else {
          // Use the certificateId from the database
          verificationCode = cert.certificateId;
          finalCompany = cert.companyName;
          finalRole = cert.roleTitle;
          finalGrade = cert.grade;
          finalIssueDate = new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        }
      }
    }

    return sendResponse(res, 200, true, 'Certificate progress retrieved successfully', {
      completionPercentage,
      requiredPercentage,
      isEligible,
      grade: finalGrade,
      verificationCode,
      issueDate: finalIssueDate,
      company: finalCompany,
      roleTitle: finalRole,
      manager: finalManager
    });
  } catch (error) {
    next(error);
  }
};
