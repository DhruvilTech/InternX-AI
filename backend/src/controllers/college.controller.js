import mongoose from 'mongoose';
import College from '../modules/college/models/College.js';
import PendingCollege from '../models/PendingCollege.js';
import CollegeRepresentative from '../models/CollegeRepresentative.js';
import User from '../models/User.js';
import Internship from '../models/Internship.js';
import Task from '../models/Task.js';
import InterviewReport from '../models/InterviewReport.js';
import { sendResponse } from '../utils/sendResponse.js';

/**
 * Autocomplete search for colleges.
 * GET /api/colleges/search?q=nirma
 */
export const searchColleges = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return sendResponse(res, 200, true, 'Search query empty', []);
    }

    const colleges = await College.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { shortName: { $regex: q, $options: 'i' } },
      ],
      verified: true,
    }).limit(20);

    return sendResponse(res, 200, true, 'Colleges searched successfully', colleges);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all verified colleges.
 * GET /api/colleges
 */
export const getColleges = async (req, res, next) => {
  try {
    const list = await College.find({ verified: true }).sort('name');
    return sendResponse(res, 200, true, 'Colleges list fetched successfully', list);
  } catch (error) {
    next(error);
  }
};

/**
 * Request a custom college listing.
 * POST /api/colleges/request
 */
export const requestCollege = async (req, res, next) => {
  try {
    const { collegeName, city, state, website } = req.body;
    if (!collegeName || !city || !state) {
      return sendResponse(res, 400, false, 'College name, city, and state are required');
    }

    // Save custom request
    const pending = new PendingCollege({
      collegeName,
      city,
      state,
      requestedBy: req.user._id,
      status: 'pending',
    });
    await pending.save();

    return sendResponse(res, 201, true, 'College listing request submitted successfully', pending);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Representative dashboard analytics.
 * GET /api/college/dashboard
 */
export const getCollegeDashboard = async (req, res, next) => {
  try {
    // 1. Fetch Representative profile
    const rep = await CollegeRepresentative.findOne({ userId: req.user._id });
    if (!rep) {
      return sendResponse(res, 404, false, 'Representative profile not found');
    }

    const college = await College.findById(rep.collegeId);
    if (!college) {
      return sendResponse(res, 404, false, 'Associated college not found');
    }

    // 2. Fetch all student users linked to this college
    const students = await User.find({ role: 'student', collegeId: rep.collegeId });
    const studentIds = students.map(s => s._id);

    // 3. Fetch internships, tasks, and interview reports for these students
    const internships = await Internship.find({ studentId: { $in: studentIds } });
    const tasks = await Task.find({ studentId: { $in: studentIds } });
    const interviews = await InterviewReport.find({
      interviewId: {
        $in: await mongoose.model('Interview').find({ studentId: { $in: studentIds } }).distinct('_id')
      }
    });

    // 4. Calculate KPI Cards
    const totalStudents = students.length;
    const activeInternships = internships.filter(i => i.status === 'active' || i.status === 'in_progress').length;
    const completedInternships = internships.filter(i => i.status === 'completed').length;

    // Average internship score (average of completed tasks score)
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.score !== undefined);
    const avgInternshipScore = completedTasks.length > 0
      ? Math.round(completedTasks.reduce((sum, t) => sum + t.score, 0) / completedTasks.length)
      : 0;

    // 5. Placement Readiness Engine calculations for each student
    const studentMetrics = students.map(student => {
      const studentInternships = internships.filter(i => i.studentId.toString() === student._id.toString());
      const maxProgress = studentInternships.length > 0
        ? Math.max(...studentInternships.map(i => i.progress || 0))
        : 0;

      const studentTasks = tasks.filter(t => t.studentId.toString() === student._id.toString());
      const completedStudentTasks = studentTasks.filter(t => t.status === 'completed');
      const avgTaskScore = completedStudentTasks.length > 0
        ? (completedStudentTasks.reduce((sum, t) => sum + (t.score || 0), 0) / completedStudentTasks.length)
        : 0;

      const studentInterviews = interviews.filter(inv => {
        return inv.interviewId ? true : false; // Simply count overall score or default to average of mock
      });
      const avgIntScore = studentInterviews.length > 0
        ? (studentInterviews.reduce((sum, inv) => sum + (inv.overallScore || 0), 0) / studentInterviews.length)
        : 0;

      // Readiness index % formula
      const readinessIndex = Math.round((maxProgress * 0.4) + (avgTaskScore * 0.3) + (avgIntScore * 0.3)) || 0;

      return {
        _id: student._id,
        fullName: student.fullName || student.name || 'Anonymous Student',
        department: student.department || 'Computer Science',
        year: student.year || 3,
        careerPath: student.careerPath || 'AI Engineer',
        internshipProgress: maxProgress,
        averageTaskScore: Math.round(avgTaskScore),
        readinessIndex,
        avgScore: Math.round(avgTaskScore || avgIntScore || 0),
      };
    });

    const avgPlacementReadiness = studentMetrics.length > 0
      ? Math.round(studentMetrics.reduce((sum, s) => sum + s.readinessIndex, 0) / studentMetrics.length)
      : 0;

    // 6. Student Analytics Distributions
    const departmentStats = {};
    const yearStats = {};
    const careerPathStats = {};

    studentMetrics.forEach(sm => {
      departmentStats[sm.department] = (departmentStats[sm.department] || 0) + 1;
      yearStats[`Year ${sm.year}`] = (yearStats[`Year ${sm.year}`] || 0) + 1;
      careerPathStats[sm.careerPath] = (careerPathStats[sm.careerPath] || 0) + 1;
    });

    const studentsByDepartment = Object.keys(departmentStats).map(name => ({ name, count: departmentStats[name] }));
    const studentsByYear = Object.keys(yearStats).map(name => ({ name, count: yearStats[name] }));
    const studentsByCareerPath = Object.keys(careerPathStats).map(name => ({ name, value: careerPathStats[name] }));

    // 7. Top Performers List (sort by readiness, then avgScore)
    const topPerformers = [...studentMetrics]
      .sort((a, b) => b.readinessIndex - a.readinessIndex || b.avgScore - a.avgScore)
      .slice(0, 5);

    return sendResponse(res, 200, true, 'College dashboard metrics compiled successfully', {
      college: {
        name: college.name,
        shortName: college.shortName,
        code: college.collegeCode,
        verified: college.verified,
      },
      kpis: {
        totalStudents,
        activeInternships,
        completedInternships,
        avgInternshipScore,
        placementReadiness: avgPlacementReadiness,
      },
      charts: {
        studentsByDepartment,
        studentsByYear,
        studentsByCareerPath,
        internshipStats: [
          { status: 'Started', count: internships.filter(i => i.progress > 0 && i.progress <= 25).length },
          { status: 'In Progress', count: internships.filter(i => i.progress > 25 && i.progress < 100).length },
          { status: 'Completed', count: internships.filter(i => i.progress === 100).length },
        ],
      },
      topPerformers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all students associated with the representative's college.
 * GET /api/college/students
 */
export const getCollegeStudents = async (req, res, next) => {
  try {
    const rep = await CollegeRepresentative.findOne({ userId: req.user._id });
    if (!rep) {
      return sendResponse(res, 404, false, 'Representative profile not found');
    }

    const students = await User.find({ role: 'student', collegeId: rep.collegeId })
      .select('fullName name email department year careerPath avatar')
      .sort('fullName');

    return sendResponse(res, 200, true, 'College student directory fetched successfully', students);
  } catch (error) {
    next(error);
  }
};
