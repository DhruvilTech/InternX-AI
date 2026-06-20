import Interview from '../models/Interview.js';
import InterviewQuestion from '../models/InterviewQuestion.js';
import InterviewAnswer from '../models/InterviewAnswer.js';
import InterviewReport from '../models/InterviewReport.js';
import Internship from '../models/Internship.js';
import { sendResponse } from '../utils/sendResponse.js';

// Fallback mock questions by career path
const fallbackQuestions = {
  'Technical': [
    { question: 'Can you describe the differences between asynchronous and synchronous programming in your primary tech stack?', category: 'Technical', difficulty: 'medium', order: 1 },
    { question: 'How do you design database indexes to optimize complex query lookups under heavy read/write volumes?', category: 'Technical', difficulty: 'medium', order: 2 },
    { question: 'What is the purpose of CORS and what are the security risks if not configured properly?', category: 'Technical', difficulty: 'medium', order: 3 },
    { question: 'How do you handle error boundaries and global exception catcher middlewares in modern architectures?', category: 'Technical', difficulty: 'medium', order: 4 },
    { question: 'Describe your approach to unit testing business logic layers and mocks integrations.', category: 'Technical', difficulty: 'medium', order: 5 },
  ],
  'Behavioral': [
    { question: 'Tell me about a time you faced a serious technical bottleneck during a sprint and how you resolved it.', category: 'Behavioral', difficulty: 'medium', order: 1 },
    { question: 'How do you handle disagreements on technical design choices within your engineering team?', category: 'Behavioral', difficulty: 'medium', order: 2 },
    { question: 'Describe a project where you had to learn a completely new framework/module in a short timeline.', category: 'Behavioral', difficulty: 'medium', order: 3 },
  ],
  'HR': [
    { question: 'Why are you interested in joining InternX as a simulated intern and what do you hope to accomplish?', category: 'HR', difficulty: 'medium', order: 1 },
    { question: 'What work culture conditions help you perform at your best, and how do you handle pressure?', category: 'HR', difficulty: 'medium', order: 2 },
  ]
};

// Generates 10 fallback questions dynamically based on path
const getFallbackQuestionsList = (careerPath, type, difficulty) => {
  const list = [];
  let techCount = 5, behCount = 3, hrCount = 2;
  if (type === 'technical') { techCount = 8; behCount = 2; hrCount = 0; }
  else if (type === 'behavioral') { techCount = 2; behCount = 7; hrCount = 1; }
  else if (type === 'hr') { techCount = 0; behCount = 2; hrCount = 8; }

  // Technical subset
  const rawTech = fallbackQuestions.Technical;
  for (let i = 0; i < techCount; i++) {
    const q = rawTech[i % rawTech.length];
    list.push({
      question: q.question.replace('your primary tech stack', `${careerPath} tools`),
      category: 'Technical',
      difficulty: difficulty,
      order: list.length + 1
    });
  }

  // Behavioral subset
  const rawBeh = fallbackQuestions.Behavioral;
  for (let i = 0; i < behCount; i++) {
    const q = rawBeh[i % rawBeh.length];
    list.push({
      ...q,
      difficulty: difficulty,
      order: list.length + 1
    });
  }

  // HR subset
  const rawHR = fallbackQuestions.HR;
  for (let i = 0; i < hrCount; i++) {
    const q = rawHR[i % rawHR.length];
    list.push({
      ...q,
      difficulty: difficulty,
      order: list.length + 1
    });
  }

  return list.slice(0, 10);
};

/**
 * Start an interview session, generate questions via Groq (or fallback), and save details.
 */
export const startInterview = async (req, res, next) => {
  try {
    const { careerPath, interviewType, difficulty } = req.body;
    const studentId = req.user._id;

    if (!careerPath || !interviewType || !difficulty) {
      return sendResponse(res, 400, false, 'Career path, interview type, and difficulty are required.');
    }

    // Retrieve active student internship if any
    const activeInternship = await Internship.findOne({ studentId });
    const internshipId = activeInternship ? activeInternship._id : null;

    // Create Interview Document
    const interview = new Interview({
      studentId,
      internshipId,
      careerPath,
      interviewType,
      difficulty,
      status: 'pending',
      totalQuestions: 10,
      currentQuestionIndex: 0
    });
    await interview.save();

    let questionsList = [];

    // Call Groq if configured
    if (process.env.GROQ_API_KEY) {
      try {
        console.log(`[INTERVIEW] Calling Groq API to generate questions for ${careerPath}...`);
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: 'You are a Senior Engineering Manager at Google. Generate exactly 10 interview questions. Output in JSON format only.'
              },
              {
                role: 'user',
                content: `Generate exactly 10 interview questions for a candidate applying for a simulated internship role.
                Career Path / Track: ${careerPath}
                Difficulty Level: ${difficulty}
                Interview Type Focus: ${interviewType} (options: technical, behavioral, hr, mixed)
                
                The questions should include a mix of technical concepts, behavioral scenarios, and cultural/HR fit, heavily tailored to the candidate's target track of ${careerPath}.
                
                You MUST return a JSON object with a single "questions" array containing 10 question objects.
                Each question object MUST strictly look like:
                {
                  "question": "Question text here?",
                  "category": "Technical" | "Behavioral" | "HR",
                  "difficulty": "easy" | "medium" | "hard",
                  "order": 1
                }
                `
              }
            ],
            temperature: 0.7,
            max_tokens: 1500
          })
        });

        if (response.ok) {
          const resData = await response.json();
          const groqJson = JSON.parse(resData.choices[0].message.content);
          if (groqJson && Array.isArray(groqJson.questions) && groqJson.questions.length > 0) {
            questionsList = groqJson.questions.map((q, idx) => ({
              interviewId: interview._id,
              question: q.question,
              category: q.category || 'Technical',
              difficulty: q.difficulty || difficulty,
              order: idx + 1
            }));
            console.log(`[INTERVIEW] Groq generated ${questionsList.length} questions successfully.`);
          }
        } else {
          console.warn(`[INTERVIEW] Groq API returned status ${response.status}. Using pre-seeded fallback questions.`);
        }
      } catch (groqErr) {
        console.error('[INTERVIEW] Groq generation failure:', groqErr.message);
      }
    } else {
      console.log('[INTERVIEW] GROQ_API_KEY not configured. Using pre-seeded fallback questions.');
    }

    // Use Fallback if Groq call failed or wasn't made
    if (questionsList.length === 0) {
      const fallbacks = getFallbackQuestionsList(careerPath, interviewType, difficulty);
      questionsList = fallbacks.map(q => ({
        ...q,
        interviewId: interview._id
      }));
    }

    // Save Questions in MongoDB
    await InterviewQuestion.insertMany(questionsList);

    return sendResponse(res, 201, true, 'Interview session created successfully', {
      interviewId: interview._id,
      totalQuestions: interview.totalQuestions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get interview session details by ID, populated with questions and answers.
 */
export const getInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    const interview = await Interview.findById(id);
    if (!interview) {
      return sendResponse(res, 404, false, 'Interview session not found');
    }

    // Secure access checks: only candidate can retrieve own reports
    if (interview.studentId.toString() !== studentId.toString()) {
      return sendResponse(res, 403, false, 'Access denied. You are not authorized to view this interview.');
    }

    const questions = await InterviewQuestion.find({ interviewId: id }).sort('order');
    const answers = await InterviewAnswer.find({ interviewId: id });
    const report = await InterviewReport.findOne({ interviewId: id });

    return sendResponse(res, 200, true, 'Interview retrieved successfully', {
      interview,
      questions,
      answers,
      report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get the current question details for the interview session.
 */
export const getCurrentQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    const interview = await Interview.findById(id);
    if (!interview) {
      return sendResponse(res, 404, false, 'Interview session not found');
    }

    if (interview.studentId.toString() !== studentId.toString()) {
      return sendResponse(res, 403, false, 'Access denied.');
    }

    if (interview.status === 'completed') {
      return sendResponse(res, 400, false, 'Interview is already completed');
    }

    const question = await InterviewQuestion.findOne({
      interviewId: id,
      order: interview.currentQuestionIndex + 1
    });

    if (!question) {
      return sendResponse(res, 404, false, 'No more questions found.');
    }

    return sendResponse(res, 200, true, 'Question retrieved successfully', {
      question,
      currentQuestionIndex: interview.currentQuestionIndex,
      totalQuestions: interview.totalQuestions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save current answer transcript and advance interview to next question.
 */
export const saveAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionId, answer, transcript, duration } = req.body;
    const studentId = req.user._id;

    const interview = await Interview.findById(id);
    if (!interview) {
      return sendResponse(res, 404, false, 'Interview session not found');
    }

    if (interview.studentId.toString() !== studentId.toString()) {
      return sendResponse(res, 403, false, 'Access denied.');
    }

    if (!questionId) {
      return sendResponse(res, 400, false, 'Question ID is required.');
    }

    // Upsert or save student answer
    await InterviewAnswer.findOneAndUpdate(
      { interviewId: id, questionId },
      {
        answer: answer || transcript || '',
        transcript: transcript || '',
        duration: duration || 0
      },
      { upsert: true, new: true }
    );

    // Increment current question index
    interview.currentQuestionIndex = Math.min(
      interview.currentQuestionIndex + 1,
      interview.totalQuestions
    );
    await interview.save();

    return sendResponse(res, 200, true, 'Answer saved successfully', {
      currentQuestionIndex: interview.currentQuestionIndex,
      isFinished: interview.currentQuestionIndex >= interview.totalQuestions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete the interview, invoke Groq to score all answers once, and save the report scorecard.
 */
export const completeInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    const interview = await Interview.findById(id);
    if (!interview) {
      return sendResponse(res, 404, false, 'Interview session not found');
    }

    if (interview.studentId.toString() !== studentId.toString()) {
      return sendResponse(res, 403, false, 'Access denied.');
    }

    const questions = await InterviewQuestion.find({ interviewId: id }).sort('order');
    const answers = await InterviewAnswer.find({ interviewId: id });

    // Build the transcript log
    let transcriptLog = '';
    questions.forEach((q, idx) => {
      const match = answers.find(ans => ans.questionId.toString() === q._id.toString());
      const ansText = match ? match.answer : '[No Answer Recorded]';
      transcriptLog += `Q${idx + 1}: ${q.question}\nCategory: ${q.category}\nA${idx + 1}: ${ansText}\n\n`;
    });

    let reportPayload = null;

    // Call Groq to evaluate the transcript in a single batch
    if (process.env.GROQ_API_KEY) {
      try {
        console.log(`[INTERVIEW] Evaluator calling Groq for interview ${id}...`);
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: 'You are a Senior Technical Engineering Interview Panel. Grade the candidate response logs honestly. Output in JSON format only.'
              },
              {
                role: 'user',
                content: `You must evaluate the student's mock interview answers.
                Career Path: ${interview.careerPath}
                Interview Type: ${interview.interviewType}
                Difficulty: ${interview.difficulty}
                
                Here is the complete question-and-answer transcript:
                -----------------------------------------------------
                ${transcriptLog}
                -----------------------------------------------------
                
                Analyze the response logs and output a single JSON object.
                The JSON MUST contain:
                - technicalScore (integer 0-100)
                - communicationScore (integer 0-100)
                - professionalismScore (integer 0-100)
                - problemSolvingScore (integer 0-100)
                - overallScore (integer 0-100)
                - strengths (array of strings, exactly 3 strings)
                - weaknesses (array of strings, exactly 3 strings)
                - recommendations (array of strings, exactly 3 strings)
                - careerAdvice (string, detailed technical advice matching their path of ${interview.careerPath})
                - readinessLevel (string: "Beginner" | "Intermediate" | "Job Ready")
                
                Do not include other explanation. Return only JSON.`
              }
            ],
            temperature: 0.6,
            max_tokens: 1800
          })
        });

        if (response.ok) {
          const resData = await response.json();
          reportPayload = JSON.parse(resData.choices[0].message.content);
          console.log(`[INTERVIEW] Evaluation completed by Groq for ${id}.`);
        } else {
          console.warn(`[INTERVIEW] Groq evaluator API error: status ${response.status}. Using fallback scoring.`);
        }
      } catch (evalErr) {
        console.error('[INTERVIEW] Groq evaluator failure:', evalErr.message);
      }
    }

    // Fallback Mock Scoring in case Groq is unconfigured/fails
    if (!reportPayload) {
      console.log('[INTERVIEW] Using fallback evaluation logic.');
      const answeredCount = answers.filter(a => a.answer && a.answer.trim().length > 10).length;
      const baseScore = Math.min(Math.round((answeredCount / 10) * 75 + 15 + Math.random() * 10), 100);
      
      reportPayload = {
        technicalScore: Math.max(baseScore - 2, 20),
        communicationScore: Math.min(baseScore + 4, 100),
        professionalismScore: Math.min(baseScore + 2, 100),
        problemSolvingScore: Math.max(baseScore - 4, 20),
        overallScore: baseScore,
        strengths: [
          'Excellent structural communication and clear flow of thoughts',
          'Good high-level understanding of development architectural patterns',
          'Strong engagement and confidence during simulated voice playback'
        ],
        weaknesses: [
          'Could expand more on vector index algorithms and metrics scaling parameters',
          'Needs deeper knowledge of error caching and token rotation loop details',
          'A few answers were brief and could include more real-world examples'
        ],
        recommendations: [
          'Practice building low-latency indexing vector DB databases in Python',
          'Optimize session caching models using redis containerized benchmarks',
          'Go through standard technical coding patterns (e.g. system design guides)'
        ],
        careerAdvice: `Based on your track of ${interview.careerPath}, you show promising conceptual alignment. Focus on deep-diving into database scalability, query optimization indexes, and hands-on system architecture frameworks.`,
        readinessLevel: baseScore >= 85 ? 'Job Ready' : baseScore >= 50 ? 'Intermediate' : 'Beginner'
      };
    }

    // Save or Update Report
    const report = await InterviewReport.findOneAndUpdate(
      { interviewId: id },
      {
        ...reportPayload,
        interviewId: id
      },
      { upsert: true, new: true }
    );

    // Update Interview status
    interview.status = 'completed';
    interview.completedAt = new Date();
    await interview.save();

    return sendResponse(res, 200, true, 'Interview session completed successfully', {
      report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all interview sessions for the logged-in student, along with their reports.
 */
export const getStudentInterviews = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const interviews = await Interview.find({ studentId }).sort('-createdAt');
    const interviewIds = interviews.map(i => i._id);
    const reports = await InterviewReport.find({ interviewId: { $in: interviewIds } });

    const data = interviews.map(interview => {
      const report = reports.find(r => r.interviewId.toString() === interview._id.toString());
      return {
        _id: interview._id,
        careerPath: interview.careerPath,
        interviewType: interview.interviewType,
        difficulty: interview.difficulty,
        status: interview.status,
        totalQuestions: interview.totalQuestions,
        currentQuestionIndex: interview.currentQuestionIndex,
        createdAt: interview.createdAt,
        completedAt: interview.completedAt,
        report: report || null
      };
    });

    return sendResponse(res, 200, true, 'Student interviews retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

