import User from '../../../models/User.js';
import Recruiter from '../../../models/Recruiter.js';
import Student from '../../../models/Student.js';
import StudentCareer from '../../../models/StudentCareer.js';
import CareerPath from '../../../models/CareerPath.js';
import GithubProfile from '../../../models/GithubProfile.js';
import GithubContribution from '../../../models/GithubContribution.js';
import Certificate from '../../college/models/Certificate.js';
import ShortlistedCandidate from '../models/ShortlistedCandidate.js';
import HiringPipeline from '../models/HiringPipeline.js';
import ContactRequest from '../models/ContactRequest.js';
import { sendMail } from '../../../utils/mailer.js';
import Offer from '../../../models/Offer.js';
import Notification from '../../../models/Notification.js';
import Placement from '../../../models/Placement.js';
import CollegeNotification from '../../../models/CollegeNotification.js';

/**
 * Retrieves recruiter user and corporate profile details.
 */
export const getProfileData = async (recruiterUserId) => {
  const user = await User.findById(recruiterUserId).populate('recruiterProfile');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

/**
 * Updates recruiter user and corporate profile fields.
 */
export const updateProfileData = async (recruiterUserId, updateBody) => {
  const { fullName, email, companyName, industry, companySize, website } = updateBody;

  const user = await User.findById(recruiterUserId);
  if (!user) {
    throw new Error('User not found');
  }

  // Update User fields
  if (email && email !== user.email) {
    const existing = await User.findOne({ email });
    if (existing) {
      throw new Error('Email is already in use by another account');
    }
    user.email = email;
  }
  if (fullName !== undefined) {
    user.fullName = fullName.trim();
  }
  await user.save();

  // Update Recruiter profile fields
  const recruiter = await Recruiter.findOne({ userId: recruiterUserId });
  if (recruiter) {
    if (companyName !== undefined) recruiter.companyName = companyName.trim();
    if (industry !== undefined) recruiter.industry = industry.trim();
    if (companySize !== undefined) recruiter.companySize = companySize.trim();
    if (website !== undefined) recruiter.website = website.trim();
    await recruiter.save();
  }

  return getProfileData(recruiterUserId);
};

/**
 * Compiles Recruiter Dashboard KPI aggregates and summaries.
 */
export const getDashboardData = async (recruiterUserId) => {
  // Run all independent KPI queries in parallel
  const [totalStudents, shortlistedCount, activePipelineCount, pipelineDocs, recentShortlistedDocs] =
    await Promise.all([
      Student.countDocuments({}),
      ShortlistedCandidate.countDocuments({ recruiterId: recruiterUserId }),
      HiringPipeline.countDocuments({ recruiterId: recruiterUserId, stage: { $ne: 'rejected' } }),
      HiringPipeline.find({ recruiterId: recruiterUserId }).lean(),
      ShortlistedCandidate.find({ recruiterId: recruiterUserId })
        .sort({ addedAt: -1 })
        .limit(5)
        .populate('studentId', 'email avatar _id')
        .lean(),
    ]);

  // Compile Kanban stage summary from already-fetched pipeline docs
  const stages = { applied: 0, shortlisted: 0, interviewing: 0, offered: 0, rejected: 0 };
  for (const doc of pipelineDocs) {
    if (stages[doc.stage] !== undefined) stages[doc.stage]++;
  }

  // Batch-fetch student + career data for recent shortlist (no per-item queries)
  const recentUserIds = recentShortlistedDocs
    .map(d => d.studentId?._id)
    .filter(Boolean);

  const [recentStudents, recentCareers] = await Promise.all([
    Student.find({ userId: { $in: recentUserIds } }).lean(),
    StudentCareer.find({ studentId: { $in: recentUserIds } })
      .populate('careerId', 'title')
      .lean(),
  ]);

  const studentByUserId = new Map(recentStudents.map(s => [s.userId.toString(), s]));
  const careerByUserId = new Map(recentCareers.map(c => [c.studentId.toString(), c]));

  const recentShortlists = recentShortlistedDocs
    .filter(doc => doc.studentId)
    .map(doc => {
      const uid = doc.studentId._id.toString();
      const student = studentByUserId.get(uid);
      const career = careerByUserId.get(uid);
      if (!student) return null;
      return {
        userId: doc.studentId._id,
        studentId: student._id,
        fullName: student.fullName,
        collegeName: student.collegeName,
        course: student.course,
        year: student.year,
        careerTrack: career?.careerId?.title || 'Not Selected',
        internshipProgress: career?.completionPercentage || 0,
        addedAt: doc.addedAt,
      };
    })
    .filter(Boolean);

  return {
    kpis: { totalStudents, shortlistedCount, activePipelineCount },
    pipelineSummary: stages,
    recentShortlists,
  };
};

/**
 * Global search, paginated directory, and candidate filtering discovery engine.
 */
export const queryStudents = async (recruiterUserId, queryParams) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    sort = 'fullName',
    order = 'asc',
    department = '',
    year = '',
    careerPath = '',
    minScore = 0,
    college = '',
    githubConnected = '',
    certificateStatus = '',
    internshipStatus = '',
  } = queryParams;

  // Build filter query for Student collection
  const filterQuery = {};

  if (search) {
    filterQuery.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { collegeName: { $regex: search, $options: 'i' } },
      { skills: { $regex: search, $options: 'i' } },
    ];
  }

  if (college) {
    filterQuery.collegeName = { $regex: college, $options: 'i' };
  }

  if (department) {
    filterQuery.course = department;
  }

  if (year) {
    filterQuery.year = Number(year);
  }

  // Lean base student fetch - only pull what we need
  let students = await Student.find(filterQuery)
    .populate('userId', 'email avatar _id role')
    .lean();
  let studentUserIds = students.map(s => s.userId?._id).filter(Boolean);

  // ── Career / Score / Status filtering ──────────────────────────────────────
  const careerFilter = { studentId: { $in: studentUserIds } };
  let careerFiltered = false;

  if (careerPath) {
    const pathObj = await CareerPath.findOne({ title: { $regex: careerPath, $options: 'i' } }).lean();
    if (pathObj) { careerFilter.careerId = pathObj._id; careerFiltered = true; }
  }
  if (minScore > 0) { careerFilter.completionPercentage = { $gte: Number(minScore) }; careerFiltered = true; }
  if (internshipStatus) { careerFilter.status = internshipStatus; careerFiltered = true; }

  // Batch-fetch all careers once, filter array in JS (avoids second DB round-trip for non-filtered case)
  const allCareers = await StudentCareer.find(careerFilter)
    .populate('careerId', 'title')
    .lean();

  const careerByStudentId = new Map(allCareers.map(c => [c.studentId.toString(), c]));

  if (careerFiltered) {
    const validIds = new Set(allCareers.map(c => c.studentId.toString()));
    students = students.filter(s => s.userId && validIds.has(s.userId._id.toString()));
    studentUserIds = students.map(s => s.userId._id);
  }

  // ── Batch fetch GitHub and Certificate data ─────────────────────────────────
  const [gitProfiles, certs, shortlist, acceptedOffers] = await Promise.all([
    GithubProfile.find({ userId: { $in: studentUserIds } }).select('userId username').lean(),
    Certificate.find({ studentId: { $in: studentUserIds } }).select('studentId certificateId').lean(),
    ShortlistedCandidate.find({ recruiterId: recruiterUserId }).select('studentId').lean(),
    Offer.find({ recruiterId: recruiterUserId, status: 'accepted' }).select('studentId').lean(),
  ]);

  const gitUserIds = new Set(gitProfiles.map(g => g.userId.toString()));
  const gitUsernameMap = new Map(gitProfiles.map(g => [g.userId.toString(), g.username]));
  const certUserIds = new Set(certs.map(c => c.studentId.toString()));
  const certIdMap = new Map(certs.map(c => [c.studentId.toString(), c.certificateId]));
  const shortlistedSet = new Set([
    ...shortlist.map(s => s.studentId.toString()),
    ...acceptedOffers.map(o => o.studentId.toString()),
  ]);

  // ── Apply GitHub / Certificate filters in memory ────────────────────────────
  if (githubConnected === 'true') {
    students = students.filter(s => s.userId && gitUserIds.has(s.userId._id.toString()));
  } else if (githubConnected === 'false') {
    students = students.filter(s => s.userId && !gitUserIds.has(s.userId._id.toString()));
  }

  if (certificateStatus === 'issued') {
    students = students.filter(s => s.userId && certUserIds.has(s.userId._id.toString()));
  } else if (certificateStatus === 'none') {
    students = students.filter(s => s.userId && !certUserIds.has(s.userId._id.toString()));
  }

  // ── Assemble result objects (pure JS, no more DB calls) ─────────────────────
  const resolved = students
    .filter(s => s.userId)
    .map(s => {
      const uid = s.userId._id.toString();
      const career = careerByStudentId.get(uid);
      const score = career?.completionPercentage || 0;
      return {
        _id: s._id,
        userId: s.userId._id,
        fullName: s.fullName,
        course: s.course,
        year: s.year,
        skills: s.skills,
        email: s.userId.email,
        avatar: s.userId.avatar,
        collegeName: s.collegeName,
        careerTrack: career?.careerId?.title || 'Not Selected',
        internshipProgress: score,
        internshipStatus: career?.status || 'in-progress',
        githubConnected: gitUserIds.has(uid),
        githubUsername: gitUsernameMap.get(uid) || '',
        certificateIssued: certUserIds.has(uid),
        certificateId: certIdMap.get(uid) || null,
        grade: score,
        isShortlisted: shortlistedSet.has(uid),
      };
    });

  // ── Sort + Paginate ─────────────────────────────────────────────────────────
  resolved.sort((a, b) => {
    const valA = a[sort], valB = b[sort];
    if (typeof valA === 'string') return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    return order === 'asc' ? (valA - valB) : (valB - valA);
  });

  const total = resolved.length;
  const skip = (Number(page) - 1) * Number(limit);
  const paginated = resolved.slice(skip, skip + Number(limit));

  return {
    students: paginated,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
  };
};

import Task from '../../../models/Task.js';
import Submission from '../../../models/Submission.js';
import Evaluation from '../../../models/Evaluation.js';
import Interview from '../../../models/Interview.js';
import InterviewReport from '../../../models/InterviewReport.js';
import FeedbackReport from '../../../models/FeedbackReport.js';
import SkillGapReport from '../../../models/SkillGapReport.js';
import CareerReport from '../../../models/CareerReport.js';
import { checkReportCache, generateCareerReports } from '../../../services/careerReport.service.js';

/**
 * Aggregates candidate audit details: profile data, simulated scores, github, and credentials.
 */
export const getStudentDetails = async (recruiterUserId, studentUserIdOrStudentId) => {
  // Resolve user/student ID (try User first, fall back to Student collection ID)
  let user = await User.findById(studentUserIdOrStudentId).lean();
  let student;

  if (user) {
    student = await Student.findOne({ userId: user._id }).lean();
  } else {
    student = await Student.findById(studentUserIdOrStudentId).lean();
    if (student) user = await User.findById(student.userId).lean();
  }

  if (!student || !user) throw new Error('Student record not found in the global registry.');

  const userId = user._id;

  // Run all 7 related queries in parallel
  const [career, githubProfile, githubContributions, certificates, shortlistDoc, acceptedOffer, pipeline] =
    await Promise.all([
      StudentCareer.findOne({ studentId: userId }).populate('careerId', 'title').lean(),
      GithubProfile.findOne({ userId }).lean(),
      GithubContribution.find({ userId }).lean(),
      Certificate.find({ studentId: userId }).lean(),
      ShortlistedCandidate.findOne({ recruiterId: recruiterUserId, studentId: userId }).lean(),
      Offer.findOne({ recruiterId: recruiterUserId, studentId: userId, status: 'accepted' }).lean(),
      HiringPipeline.findOne({ recruiterId: recruiterUserId, studentId: userId }).lean(),
    ]);

  const isShortlisted = !!(shortlistDoc || acceptedOffer);

  // Load new dynamic reports
  let reports = await checkReportCache(userId);
  if (!reports) {
    reports = await generateCareerReports(userId);
  }

  // Load task and submission details
  const tasks = await Task.find({ studentId: userId }).sort({ createdAt: 1 });
  const submissions = await Submission.find({ studentId: userId }).populate('taskId', 'title').sort({ submittedAt: -1 });
  const evaluations = await Evaluation.find({ submissionId: { $in: submissions.map(s => s._id) } });

  // Load interviews
  const studentInterviews = await Interview.find({ studentId: userId, status: 'completed' });
  const interviewReports = await InterviewReport.find({ interviewId: { $in: studentInterviews.map(i => i._id) } });

  return {
    studentProfile: {
      _id: student._id,
      userId,
      fullName: student.fullName,
      course: student.course,
      year: student.year,
      skills: student.skills,
      email: user.email,
      avatar: user.avatar,
      collegeName: student.collegeName,
      createdAt: student.createdAt,
      isShortlisted,
      pipelineStage: pipeline?.stage || null,
      pipelineNotes: pipeline?.notes || '',
    },
    internshipProgress: career ? {
      careerTrack: career.careerId?.title || 'Not Selected',
      completionPercentage: career.completionPercentage,
      status: career.status,
      currentLevel: career.currentLevel,
      lastUpdated: career.updatedAt
    } : null,
    githubAnalytics: githubProfile ? {
      username: githubProfile.username,
      profileUrl: githubProfile.profileUrl,
      publicRepos: githubProfile.publicRepos,
      followers: githubProfile.followers,
      contributions: githubContributions.map(c => ({
        repoId: c.repoId,
        commitCount: c.commitCount,
        pullRequestCount: c.pullRequestCount,
        issueCount: c.issueCount,
        contributionScore: c.contributionScore,
        languages: c.languageBreakdown
      }))
    } : null,
    certificates: certificates.map(c => ({
      certificateId: c.certificateId,
      companyName: c.companyName,
      roleTitle: c.roleTitle,
      grade: c.grade,
      issueDate: c.issueDate,
      status: c.status
    })),
    careerReport: reports.career,
    skillGapReport: reports.skillGap,
    feedbackReport: reports.feedback,
    tasks: tasks.map(t => ({
      _id: t._id,
      title: t.title,
      difficulty: t.difficulty,
      status: t.status,
      score: t.score,
      feedback: t.feedback,
      categoryScore: t.categoryScore,
      updatedAt: t.updatedAt
    })),
    submissions: submissions.map(sub => {
      const evalObj = evaluations.find(e => e.submissionId.toString() === sub._id.toString());
      return {
        _id: sub._id,
        taskTitle: sub.taskId?.title || 'Task Deliverable',
        submissionType: sub.submissionType,
        githubUrl: sub.githubUrl,
        githubBranch: sub.githubBranch || '',
        githubCommitHash: sub.githubCommitHash || '',
        status: sub.status,
        progress: sub.progress,
        submittedAt: sub.submittedAt,
        evaluation: evalObj ? {
          technicalScore: evalObj.technicalScore,
          architectureScore: evalObj.architectureScore,
          codeQualityScore: evalObj.codeQualityScore,
          documentationScore: evalObj.documentationScore,
          problemSolvingScore: evalObj.problemSolvingScore,
          overallScore: evalObj.overallScore,
          githubScore: evalObj.githubScore || 0,
          strengths: evalObj.strengths,
          weaknesses: evalObj.weaknesses,
          recommendations: evalObj.recommendations
        } : null
      };
    }),
    interviews: interviewReports
  };
};

/**
 * Returns all shortlisted candidates by a specific recruiter.
 */
export const getShortlisted = async (recruiterUserId) => {
  // Batch fetch shortlist + accepted offers in parallel
  const [docs, acceptedOffers] = await Promise.all([
    ShortlistedCandidate.find({ recruiterId: recruiterUserId })
      .populate('studentId', 'email avatar _id')
      .lean(),
    Offer.find({ recruiterId: recruiterUserId, status: 'accepted' })
      .populate('studentId', 'email avatar _id')
      .lean(),
  ]);

  // Build deduplicated user map
  const studentMap = new Map();
  for (const doc of docs) {
    if (!doc.studentId) continue;
    studentMap.set(doc.studentId._id.toString(), { user: doc.studentId, addedAt: doc.addedAt });
  }
  for (const offer of acceptedOffers) {
    if (!offer.studentId) continue;
    const key = offer.studentId._id.toString();
    if (!studentMap.has(key)) {
      studentMap.set(key, { user: offer.studentId, addedAt: offer.updatedAt });
    }
  }

  const userIds = [...studentMap.keys()];
  if (userIds.length === 0) return [];

  // Single batch fetch for all related data
  const [students, careers, certs] = await Promise.all([
    Student.find({ userId: { $in: userIds } }).lean(),
    StudentCareer.find({ studentId: { $in: userIds } }).populate('careerId', 'title').lean(),
    Certificate.find({ studentId: { $in: userIds } }).select('studentId').lean(),
  ]);

  const studentByUserId = new Map(students.map(s => [s.userId.toString(), s]));
  const careerByStudentId = new Map(careers.map(c => [c.studentId.toString(), c]));
  const certSet = new Set(certs.map(c => c.studentId.toString()));

  const resolved = userIds
    .map(uid => {
      const data = studentMap.get(uid);
      const student = studentByUserId.get(uid);
      if (!student) return null;
      const career = careerByStudentId.get(uid);
      return {
        userId: data.user._id,
        studentId: student._id,
        fullName: student.fullName,
        course: student.course,
        year: student.year,
        skills: student.skills,
        email: data.user.email,
        avatar: data.user.avatar,
        collegeName: student.collegeName,
        careerTrack: career?.careerId?.title || 'Not Selected',
        internshipProgress: career?.completionPercentage || 0,
        certificateIssued: certSet.has(uid),
        addedAt: data.addedAt,
        isShortlisted: true,
      };
    })
    .filter(Boolean);

  resolved.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
  return resolved;
};

/**
 * Adds or removes a student from the recruiter's shortlist (toggles status).
 */
export const toggleShortlist = async (recruiterUserId, studentUserId) => {
  const existing = await ShortlistedCandidate.findOne({ recruiterId: recruiterUserId, studentId: studentUserId });

  if (existing) {
    await ShortlistedCandidate.deleteOne({ _id: existing._id });
    return { status: 'removed', isShortlisted: false };
  } else {
    // Confirm user exists and is a student before shortlisting
    const user = await User.findById(studentUserId);
    if (!user || user.role !== 'student') {
      throw new Error('Can only shortlist valid student profiles.');
    }

    await ShortlistedCandidate.create({ recruiterId: recruiterUserId, studentId: studentUserId });
    return { status: 'added', isShortlisted: true };
  }
};

/**
 * Returns the hiring pipeline stage lists.
 */
export const getPipeline = async (recruiterUserId) => {
  const docs = await HiringPipeline.find({ recruiterId: recruiterUserId })
    .populate('studentId', 'email avatar _id')
    .lean();

  const pipelineUserIds = docs.map(d => d.studentId?._id).filter(Boolean);
  if (pipelineUserIds.length === 0) return [];

  // Batch fetch students and careers in parallel
  const [students, careers] = await Promise.all([
    Student.find({ userId: { $in: pipelineUserIds } }).lean(),
    StudentCareer.find({ studentId: { $in: pipelineUserIds } })
      .populate('careerId', 'title')
      .lean(),
  ]);

  const studentByUserId = new Map(students.map(s => [s.userId.toString(), s]));
  const careerByStudentId = new Map(careers.map(c => [c.studentId.toString(), c]));

  return docs
    .filter(doc => doc.studentId)
    .map(doc => {
      const uid = doc.studentId._id.toString();
      const student = studentByUserId.get(uid);
      if (!student) return null;
      const career = careerByStudentId.get(uid);
      return {
        userId: doc.studentId._id,
        studentId: student._id,
        fullName: student.fullName,
        course: student.course,
        year: student.year,
        email: doc.studentId.email,
        avatar: doc.studentId.avatar,
        collegeName: student.collegeName,
        careerTrack: career?.careerId?.title || 'Not Selected',
        internshipProgress: career?.completionPercentage || 0,
        stage: doc.stage,
        notes: doc.notes,
        updatedAt: doc.updatedAt,
      };
    })
    .filter(Boolean);
};

/**
 * Creates/Updates a candidate stage inside the recruiter's hiring pipeline.
 */
export const updatePipelineStage = async (recruiterUserId, studentUserId, stage, notes = '') => {
  let doc = await HiringPipeline.findOne({ recruiterId: recruiterUserId, studentId: studentUserId });

  if (doc) {
    doc.stage = stage;
    if (notes !== undefined) doc.notes = notes;
    doc.updatedAt = new Date();
    await doc.save();
  } else {
    doc = await HiringPipeline.create({
      recruiterId: recruiterUserId,
      studentId: studentUserId,
      stage,
      notes,
    });
  }

  return doc;
};

/**
 * Removes a candidate from the hiring pipeline.
 */
export const deleteFromPipeline = async (recruiterUserId, studentUserId) => {
  await HiringPipeline.deleteOne({ recruiterId: recruiterUserId, studentId: studentUserId });
  return { success: true };
};

/**
 * Returns outreach requests sent by recruiter.
 */
export const getContactRequests = async (recruiterUserId) => {
  const docs = await ContactRequest.find({ recruiterId: recruiterUserId })
    .populate('studentId', 'email avatar _id')
    .lean();

  const userIds = docs.map(d => d.studentId?._id).filter(Boolean);
  const students = await Student.find({ userId: { $in: userIds } }).lean();
  const studentByUserId = new Map(students.map(s => [s.userId.toString(), s]));

  return docs
    .filter(d => d.studentId)
    .map(doc => {
      const student = studentByUserId.get(doc.studentId._id.toString());
      if (!student) return null;
      return {
        _id: doc._id,
        studentId: student._id,
        fullName: student.fullName,
        email: doc.studentId.email,
        avatar: doc.studentId.avatar,
        subject: doc.subject,
        message: doc.message,
        status: doc.status,
        sentAt: doc.sentAt,
      };
    })
    .filter(Boolean);
};

/**
 * Creates a contact outreach request and sends a simulated corporate notification email to the student.
 */
export const createContactRequest = async (recruiterUserId, studentUserId, subject, message) => {
  const studentUser = await User.findById(studentUserId);
  if (!studentUser || studentUser.role !== 'student') {
    throw new Error('Can only contact active simulated students.');
  }

  const recruiterUser = await User.findById(recruiterUserId).populate('recruiterProfile');
  const companyName = recruiterUser?.recruiterProfile?.companyName || 'Corporate Partner';

  const doc = await ContactRequest.create({
    recruiterId: recruiterUserId,
    studentId: studentUserId,
    subject,
    message,
  });

  // Send simulated email
  try {
    await sendMail({
      to: studentUser.email,
      subject: `[INTERNX AI] Outreach from ${companyName}: ${subject}`,
      text: `Hello ${studentUser.fullName || 'Student'},\n\nWe viewed your verified skills audit on InternX AI.\n\nMessage from ${recruiterUser.fullName || 'Recruiter'} at ${companyName}:\n\n${message}\n\nBest regards,\nInternX AI Recruitment Engine`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #8b5cf6;">Outreach Request via InternX AI</h2>
          <p>Hello <strong>${studentUser.fullName || 'Student'}</strong>,</p>
          <p>A recruiter from <strong>${companyName}</strong> has audited your verified developer scorecard and sent you the following outreach message:</p>
          <div style="background-color: #f8fafc; border-left: 4px solid #8b5cf6; padding: 15px; margin: 20px 0; font-style: italic;">
            <strong>Subject: ${subject}</strong><br/><br/>
            ${message.replace(/\n/g, '<br/>')}
          </div>
          <p>You can view and reply to this request directly inside your student notifications dashboard.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;"/>
          <p style="font-size: 11px; color: #64748b;">This email was sent automatically on behalf of ${companyName} via InternX AI.</p>
        </div>
      `,
    });
  } catch (emailError) {
    console.error('[OUTREACH EMAIL ERROR]', emailError.message);
  }

  return doc;
};

/**
 * Aggregates analytical statistics across candidates.
 */
export const getAnalytics = async (recruiterUserId) => {
  const students = await Student.find({});
  const studentUserIds = students.map(s => s.userId).filter(Boolean);

  const careers = await StudentCareer.find({ studentId: { $in: studentUserIds } }).populate('careerId');
  const githubProfiles = await GithubProfile.find({ userId: { $in: studentUserIds } });
  const careerReports = await CareerReport.find({ studentId: { $in: studentUserIds } });

  // Calculate average progress and score distributions
  let scoreSum = 0;
  let totalWithScores = 0;
  const readinessCounts = { High: 0, Medium: 0, Low: 0 };
  const careerCounts = {};
  const skillCounts = {};
  const collegeCounts = {};

  // Map github connection
  const githubUserIds = githubProfiles.map(gp => gp.userId.toString());

  students.forEach(student => {
    // Skills distribution
    student.skills.forEach(skill => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });

    // College distribution
    if (student.collegeName) {
      collegeCounts[student.collegeName] = (collegeCounts[student.collegeName] || 0) + 1;
    }

    const career = careers.find(c => c.studentId.toString() === student.userId.toString());
    const progress = career?.completionPercentage || 0;
    scoreSum += progress;
    totalWithScores++;

    // Calculate individual placement readiness score
    const hasGithub = githubUserIds.includes(student.userId.toString());
    const careerReport = careerReports.find(cr => cr.studentId.toString() === student.userId.toString());
    const readinessIndex = careerReport ? (careerReport.readinessScore || 0) : Math.min(100, Math.round(progress * 0.8 + (hasGithub ? 20 : 0)));

    if (readinessIndex >= 85) {
      readinessCounts.High++;
    } else if (readinessIndex >= 50) {
      readinessCounts.Medium++;
    } else {
      readinessCounts.Low++;
    }

    // Career track counts
    if (career?.careerId?.title) {
      careerCounts[career.careerId.title] = (careerCounts[career.careerId.title] || 0) + 1;
    }
  });

  const averageProgress = totalWithScores > 0 ? Math.round(scoreSum / totalWithScores) : 0;

  // Format charts
  const readinessDistribution = [
    { category: 'Ready (>=85)', count: readinessCounts.High },
    { category: 'Development (50-84)', count: readinessCounts.Medium },
    { category: 'Needs Focus (<50)', count: readinessCounts.Low },
  ];

  const careerTracks = Object.keys(careerCounts).map(name => ({
    name,
    count: careerCounts[name],
  }));

  const topSkills = Object.entries(skillCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const collegeDistribution = Object.entries(collegeCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    averageProgress,
    readinessDistribution,
    careerTracks,
    topSkills,
    collegeDistribution,
  };
};

/**
 * Creates a new internship offer and a notification for the student.
 */
export const createOffer = async (recruiterUserId, studentUserId, companyName, message, jobRole = 'Software Engineer Intern', salaryPackage = 6) => {
  const studentUser = await User.findById(studentUserId);
  if (!studentUser || studentUser.role !== 'student') {
    throw new Error('Can only send offers to active simulated students.');
  }

  const recruiterUser = await User.findById(recruiterUserId);
  const recruiterName = recruiterUser?.fullName || 'Recruiter';

  const offer = await Offer.create({
    recruiterId: recruiterUserId,
    studentId: studentUserId,
    recruiterName,
    companyName,
    message,
    jobRole,
    package: salaryPackage,
    status: 'pending',
  });

  // Create notification for student
  await Notification.create({
    recipientId: studentUserId,
    senderId: recruiterUserId,
    title: 'New Internship Offer',
    message: `You have received a new internship offer from ${companyName}.`,
    type: 'offer',
    isRead: false,
  });

  // Centralized Placement Tracking: Create pending Placement record and alert College Reps
  if (studentUser.collegeId) {
    await Placement.create({
      studentId: studentUserId,
      collegeId: studentUser.collegeId,
      recruiterId: recruiterUserId,
      companyName,
      jobRole,
      offerStatus: 'pending',
      package: salaryPackage,
    });

    await CollegeNotification.create({
      collegeId: studentUser.collegeId,
      senderId: studentUserId,
      title: 'New Offer Received',
      message: `A new internship offer for the role of ${jobRole} has been received by ${studentUser.fullName || 'Student'} from ${companyName} at ${salaryPackage} LPA.`,
      type: 'offer_received',
      isRead: false,
    });
  }

  return offer;
};

/**
 * Retrieves all offers sent by a specific recruiter.
 */
export const getSentOffers = async (recruiterUserId) => {
  return await Offer.find({ recruiterId: recruiterUserId })
    .populate('studentId', 'fullName email avatar')
    .sort({ createdAt: -1 });
};

