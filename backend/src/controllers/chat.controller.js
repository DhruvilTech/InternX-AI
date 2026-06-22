import MentorChat from '../models/MentorChat.js';
import Student from '../models/Student.js';
import StudentCareer from '../models/StudentCareer.js';
import Internship from '../models/Internship.js';
import Task from '../models/Task.js';
import CareerReport from '../models/CareerReport.js';
import SkillGapReport from '../models/SkillGapReport.js';
import { callGroq } from '../services/groq.service.js';
import { sendResponse } from '../utils/sendResponse.js';

/**
 * Retrieve chat history for the logged-in student.
 * GET /api/mentor-chat/history
 */
export const getChatHistory = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const history = await MentorChat.find({ studentId }).sort({ timestamp: 1 });
    return sendResponse(res, 200, true, 'Chat history retrieved successfully', history);
  } catch (error) {
    next(error);
  }
};

/**
 * Send a message to the AI Mentor, injecting full student context and last 20 messages.
 * POST /api/mentor-chat/send
 */
export const sendMentorMessage = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    // 1. Gather student context
    const studentProfile = await Student.findOne({ userId: studentId });
    const studentCareer = await StudentCareer.findOne({ studentId }).populate('careerId');
    const internship = await Internship.findOne({ studentId });
    const tasks = await Task.find({ studentId });
    const careerReport = await CareerReport.findOne({ studentId });
    const skillGapReport = await SkillGapReport.findOne({ studentId });

    const careerPath = internship?.internshipRole || internship?.roleTitle || studentCareer?.careerId?.title || 'AI Intern';

    // Determine current active sprint week dynamically
    const easyTasks = tasks.filter(t => t.difficulty === 'Easy');
    const easyCompleted = easyTasks.filter(t => t.status === 'completed');
    const mediumTasks = tasks.filter(t => t.difficulty === 'Medium');
    const mediumCompleted = mediumTasks.filter(t => t.status === 'completed');

    let currentSprint = 'Onboarding & Setup';
    if (easyTasks.length > 0 && easyCompleted.length >= easyTasks.length) {
      if (mediumTasks.length > 0 && mediumCompleted.length >= mediumTasks.length) {
        currentSprint = 'Final Review & Certification';
      } else {
        currentSprint = 'Core Tasks Sprint';
      }
    }

    const totalTasksCount = tasks.length;
    const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
    const pendingTasksCount = totalTasksCount - completedTasksCount;

    const strengths = careerReport?.recommendedSkills || [];
    const weaknesses = skillGapReport?.missingSkills || [];
    const skillGaps = skillGapReport?.missingSkills || [];

    // 2. Fetch last 20 messages for history memory
    const rawHistory = await MentorChat.find({ studentId })
      .sort({ timestamp: -1 })
      .limit(20);

    // Reverse to chronological order
    const history = rawHistory.reverse();

    const chatHistoryMessages = history.map(h => ({
      role: h.role === 'student' ? 'user' : 'assistant',
      content: h.message
    }));

    // 3. Save student's user message
    const userChatRecord = await MentorChat.create({
      studentId,
      message: message.trim(),
      role: 'student',
      timestamp: new Date()
    });

    // 4. Construct System Prompt with student context
    const systemPrompt = `You are a context-aware AI Technical Mentor. Your character name is "Rahul Patel, Lead Mentor".
You are mentoring a student in their simulated professional internship.

STUDENT PROFILE CONTEXT:
- Student Name: ${req.user.fullName}
- Internship Career Path: ${careerPath}
- Host Company: ${internship?.companyName || 'NeuralMind Technologies'}
- Internship Department: ${internship?.department || 'Engineering'}
- Current Active Sprint: ${currentSprint}
- Completed Tasks: ${completedTasksCount}
- Pending Tasks: ${pendingTasksCount}
- Strengths: ${JSON.stringify(strengths)}
- Weaknesses/Weak Areas: ${JSON.stringify(weaknesses)}
- Skill Gaps: ${JSON.stringify(skillGaps)}

ROLE INSTRUCTIONS:
- You must always answer as a mentor, referring to the student's actual progress, current sprint, strengths, and weaknesses where relevant.
- Be encouraging, detailed, and technically precise.
- Do NOT generate generic replies or fake benchmarking.
- Never answer with unrelated software engineering advice unless it pertains directly to their current career path (${careerPath}).
- If the student asks about their progress, reference that they have completed ${completedTasksCount} out of ${totalTasksCount} tasks.
- Keep responses professional, helpful, and concise.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistoryMessages,
      { role: 'user', content: message.trim() }
    ];

    let aiReplyText = 'Analysis unavailable';

    if (process.env.GROQ_API_KEY) {
      try {
        const groqRes = await callGroq({
          model: 'qwen/qwen3-32b',
          messages,
          temperature: 0.7,
          jsonMode: false
        });
        if (groqRes && typeof groqRes === 'string') {
          aiReplyText = groqRes.trim();
        }
      } catch (groqErr) {
        console.error('[AI Mentor Chat] Groq API call failed:', groqErr.message);
        aiReplyText = 'Analysis unavailable';
      }
    }

    // 5. Save AI's assistant message
    const mentorChatRecord = await MentorChat.create({
      studentId,
      message: aiReplyText,
      role: 'mentor',
      timestamp: new Date()
    });

    return sendResponse(res, 201, true, 'Mentor message processed successfully', {
      userMessage: userChatRecord,
      mentorMessage: mentorChatRecord,
      message: aiReplyText
    });
  } catch (error) {
    next(error);
  }
};
