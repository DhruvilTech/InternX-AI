import EvaluationReport from '../models/EvaluationReport.js';
import Student from '../models/Student.js';
import CareerReport from '../models/CareerReport.js';
import SkillGapReport from '../models/SkillGapReport.js';
import FeedbackReport from '../models/FeedbackReport.js';
import StudentCareer from '../models/StudentCareer.js';
import { generateCareerReports, validateReportPath, checkReportCache } from '../services/careerReport.service.js';

/**
 * Retrieve evaluation report by student ID (supports both User ID and Student ID).
 * GET /api/evaluation/student/:studentId
 */
export const getStudentEvaluationReport = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    let report = await EvaluationReport.findOne({ studentId }).lean();
    let targetUserId = studentId;

    if (!report) {
      const student = await Student.findById(studentId).lean();
      if (student) {
        report = await EvaluationReport.findOne({ studentId: student.userId }).lean();
        targetUserId = student.userId;
      }
    } else {
      targetUserId = report.studentId;
    }

    // Get current student career path
    const studentCareer = await StudentCareer.findOne({ studentId: targetUserId }).populate('careerId');
    const pathName = studentCareer?.careerId?.title || 'Cybersecurity Analyst';

    // Verify cache validity or regenerate on the fly
    let reports = await checkReportCache(targetUserId);
    const forceRegen = req.query.regenerate === 'true';
    const isCacheValid = reports && validateReportPath(reports, pathName);

    if (!reports || !isCacheValid || forceRegen) {
      console.log(`[Evaluation Controller] Cache invalid or missing for path: ${pathName}. Generating new reports...`);
      reports = await generateCareerReports(targetUserId);
    } else {
      // Fetch computed comparison data and gaps by running lightweight service generator
      reports = await generateCareerReports(targetUserId);
    }

    return res.status(200).json({
      overallScore: reports.career.readinessScore || 0,
      technicalScore: reports.career.portfolioScore || 0,
      codeQuality: report ? report.codeQuality : 80,
      projectStructure: report ? report.projectStructure : 80,
      documentationScore: report ? report.documentationScore : 80,
      githubScore: reports.career.githubScore || 0,
      strengths: reports.feedback.strengths || [],
      weaknesses: reports.feedback.weaknesses || [],
      identifiedSkills: reports.skillGap.detectedSkills || [],
      identifiedSkillGaps: reports.skillGap.missingSkills || [],
      recommendations: reports.feedback.recommendations || [],
      careerRecommendations: reports.career.recommendedCertifications || [],
      readinessLevel: reports.career.careerLevel || 'Beginner',
      skillComparisonData: reports.skillComparisonData,
      gaps: reports.gaps
    });
  } catch (error) {
    next(error);
  }
};
