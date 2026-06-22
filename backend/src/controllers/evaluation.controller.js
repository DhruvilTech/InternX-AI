import EvaluationReport from '../models/EvaluationReport.js';
import Student from '../models/Student.js';
import CareerReport from '../models/CareerReport.js';

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
      // Fallback: check if the studentId corresponds to the Student collection _id
      const student = await Student.findById(studentId).lean();
      if (student) {
        report = await EvaluationReport.findOne({ studentId: student.userId }).lean();
        targetUserId = student.userId;
      }
    } else {
      targetUserId = report.studentId;
    }

    // Query the database-driven CareerReport for this student to sync scores
    const careerReport = await CareerReport.findOne({ studentId: targetUserId }).lean();

    if (!report) {
      // Gracefully return a 200 response with 0 scores and Not Enough Data status for new students
      return res.status(200).json({
        overallScore: careerReport ? (careerReport.readinessScore || 0) : 0,
        technicalScore: careerReport ? (careerReport.portfolioScore || 0) : 0,
        codeQuality: 0,
        projectStructure: 0,
        documentationScore: 0,
        githubScore: careerReport ? (careerReport.githubScore || 0) : 0,
        strengths: [],
        weaknesses: [],
        identifiedSkills: [],
        identifiedSkillGaps: [],
        recommendations: [],
        careerRecommendations: [],
        readinessLevel: careerReport ? (careerReport.careerLevel || 'Not Enough Data') : 'Not Enough Data',
      });
    }

    // Return the fields synced with the unified CareerReport database record
    return res.status(200).json({
      overallScore: careerReport ? (careerReport.readinessScore || 0) : (report.overallScore || 0),
      technicalScore: careerReport ? (careerReport.portfolioScore || 0) : (report.technicalScore || 0),
      codeQuality: report.codeQuality,
      projectStructure: report.projectStructure,
      documentationScore: report.documentationScore,
      githubScore: careerReport ? (careerReport.githubScore || 0) : (report.githubScore || 0),
      strengths: report.strengths,
      weaknesses: report.weaknesses,
      identifiedSkills: report.identifiedSkills,
      identifiedSkillGaps: report.identifiedSkillGaps,
      recommendations: report.recommendations,
      careerRecommendations: report.careerRecommendations,
      readinessLevel: careerReport ? (careerReport.careerLevel || 'Beginner') : (report.readinessLevel || 'Beginner'),
    });
  } catch (error) {
    next(error);
  }
};
