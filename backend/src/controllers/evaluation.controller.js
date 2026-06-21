import EvaluationReport from '../models/EvaluationReport.js';
import Student from '../models/Student.js';

/**
 * Retrieve evaluation report by student ID (supports both User ID and Student ID).
 * GET /api/evaluation/student/:studentId
 */
export const getStudentEvaluationReport = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    let report = await EvaluationReport.findOne({ studentId }).lean();
    if (!report) {
      // Fallback: check if the studentId corresponds to the Student collection _id
      const student = await Student.findById(studentId).lean();
      if (student) {
        report = await EvaluationReport.findOne({ studentId: student.userId }).lean();
      }
    }

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'No evaluation available yet. Student has not completed any evaluated submissions.',
      });
    }

    // Return the fields exactly as specified
    return res.status(200).json({
      overallScore: report.overallScore,
      technicalScore: report.technicalScore,
      codeQuality: report.codeQuality,
      projectStructure: report.projectStructure,
      documentationScore: report.documentationScore,
      githubScore: report.githubScore,
      strengths: report.strengths,
      weaknesses: report.weaknesses,
      identifiedSkills: report.identifiedSkills,
      identifiedSkillGaps: report.identifiedSkillGaps,
      recommendations: report.recommendations,
      careerRecommendations: report.careerRecommendations,
      readinessLevel: report.readinessLevel,
    });
  } catch (error) {
    next(error);
  }
};
