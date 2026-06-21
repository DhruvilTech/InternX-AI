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
  const totalStudents = await Student.countDocuments({});
  const shortlistedCount = await ShortlistedCandidate.countDocuments({ recruiterId: recruiterUserId });
  const activePipelineCount = await HiringPipeline.countDocuments({ recruiterId: recruiterUserId, stage: { $ne: 'rejected' } });

  // Compile Kanban stage summary
  const pipelineDocs = await HiringPipeline.find({ recruiterId: recruiterUserId });
  const stages = { applied: 0, shortlisted: 0, interviewing: 0, offered: 0, rejected: 0 };
  pipelineDocs.forEach(doc => {
    if (stages[doc.stage] !== undefined) {
      stages[doc.stage]++;
    }
  });

  // Fetch recent shortlisted candidates (last 5)
  const recentShortlistedDocs = await ShortlistedCandidate.find({ recruiterId: recruiterUserId })
    .sort({ addedAt: -1 })
    .limit(5)
    .populate('studentId');

  const recentShortlists = [];
  for (const doc of recentShortlistedDocs) {
    if (!doc.studentId) continue;
    const student = await Student.findOne({ userId: doc.studentId._id });
    if (!student) continue;

    const career = await StudentCareer.findOne({ studentId: doc.studentId._id }).populate('careerId');

    recentShortlists.push({
      userId: doc.studentId._id,
      studentId: student._id,
      fullName: student.fullName,
      collegeName: student.collegeName,
      course: student.course,
      year: student.year,
      careerTrack: career?.careerId?.title || 'Not Selected',
      internshipProgress: career?.completionPercentage || 0,
      addedAt: doc.addedAt,
    });
  }

  return {
    kpis: {
      totalStudents,
      shortlistedCount,
      activePipelineCount,
    },
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

  // Fetch initial base list matching simple filters
  let students = await Student.find(filterQuery).populate('userId');
  let studentUserIds = students.map(s => s.userId?._id).filter(Boolean);

  // Relational filter queries for StudentCareer
  const careerFilter = { studentId: { $in: studentUserIds } };
  let careerFiltered = false;

  if (careerPath) {
    const pathObj = await CareerPath.findOne({ title: { $regex: careerPath, $options: 'i' } });
    if (pathObj) {
      careerFilter.careerId = pathObj._id;
      careerFiltered = true;
    }
  }

  if (minScore > 0) {
    careerFilter.completionPercentage = { $gte: Number(minScore) };
    careerFiltered = true;
  }

  if (internshipStatus) {
    careerFilter.status = internshipStatus;
    careerFiltered = true;
  }

  if (careerFiltered) {
    const careers = await StudentCareer.find(careerFilter);
    const validIds = careers.map(c => c.studentId.toString());
    students = students.filter(s => s.userId && validIds.includes(s.userId._id.toString()));
    studentUserIds = students.map(s => s.userId._id);
  }

  // Github profile filter
  if (githubConnected) {
    const gitProfiles = await GithubProfile.find({ userId: { $in: studentUserIds } });
    const gitUserIds = gitProfiles.map(g => g.userId.toString());
    if (githubConnected === 'true') {
      students = students.filter(s => s.userId && gitUserIds.includes(s.userId._id.toString()));
    } else if (githubConnected === 'false') {
      students = students.filter(s => s.userId && !gitUserIds.includes(s.userId._id.toString()));
    }
    studentUserIds = students.map(s => s.userId._id);
  }

  // Certificate filter
  if (certificateStatus) {
    const certs = await Certificate.find({ studentId: { $in: studentUserIds } });
    const certUserIds = certs.map(c => c.studentId.toString());
    if (certificateStatus === 'issued') {
      students = students.filter(s => s.userId && certUserIds.includes(s.userId._id.toString()));
    } else if (certificateStatus === 'none') {
      students = students.filter(s => s.userId && !certUserIds.includes(s.userId._id.toString()));
    }
  }

  // Load recruiter's current shortlisted IDs to flag candidates
  const shortlist = await ShortlistedCandidate.find({ recruiterId: recruiterUserId });
  const acceptedOffers = await Offer.find({ recruiterId: recruiterUserId, status: 'accepted' });
  const shortlistedIds = [
    ...shortlist.map(s => s.studentId.toString()),
    ...acceptedOffers.map(o => o.studentId.toString())
  ];

  // Compile detailed information records
  const resolved = [];
  for (const s of students) {
    if (!s.userId) continue;

    const career = await StudentCareer.findOne({ studentId: s.userId._id }).populate('careerId');
    const github = await GithubProfile.findOne({ userId: s.userId._id });
    const cert = await Certificate.findOne({ studentId: s.userId._id });

    // Calculate simulated or exact technical rating metrics for radar charts
    const score = career?.completionPercentage || 0;
    const isShortlisted = shortlistedIds.includes(s.userId._id.toString());

    resolved.push({
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
      githubConnected: !!github,
      githubUsername: github?.username || '',
      certificateIssued: !!cert,
      certificateId: cert?.certificateId || null,
      grade: score,
      isShortlisted,
    });
  }

  // Sort results
  resolved.sort((a, b) => {
    let valA = a[sort];
    let valB = b[sort];

    if (typeof valA === 'string') {
      return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      return order === 'asc' ? (valA - valB) : (valB - valA);
    }
  });

  // Pagination bounds
  const total = resolved.length;
  const skip = (Number(page) - 1) * Number(limit);
  const paginated = resolved.slice(skip, skip + Number(limit));

  return {
    students: paginated,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

/**
 * Aggregates candidate audit details: profile data, simulated scores, github, and credentials.
 */
export const getStudentDetails = async (recruiterUserId, studentUserIdOrStudentId) => {
  // Let's resolve the user ID if the client sent the Student collection ID
  let user = await User.findById(studentUserIdOrStudentId);
  let student;

  if (user) {
    student = await Student.findOne({ userId: user._id });
  } else {
    student = await Student.findById(studentUserIdOrStudentId);
    if (student) {
      user = await User.findById(student.userId);
    }
  }

  if (!student || !user) {
    throw new Error('Student record not found in the global registry.');
  }

  const userId = user._id;
  const career = await StudentCareer.findOne({ studentId: userId }).populate('careerId');
  const githubProfile = await GithubProfile.findOne({ userId });
  const githubContributions = await GithubContribution.find({ userId });
  const certificates = await Certificate.find({ studentId: userId });

  // Recruiter specific: check shortlist and pipeline status
  const isShortlisted = !!(await ShortlistedCandidate.findOne({ recruiterId: recruiterUserId, studentId: userId })) ||
                        !!(await Offer.findOne({ recruiterId: recruiterUserId, studentId: userId, status: 'accepted' }));
  const pipeline = await HiringPipeline.findOne({ recruiterId: recruiterUserId, studentId: userId });

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
    }))
  };
};

/**
 * Returns all shortlisted candidates by a specific recruiter.
 */
export const getShortlisted = async (recruiterUserId) => {
  const docs = await ShortlistedCandidate.find({ recruiterId: recruiterUserId }).populate('studentId');
  const acceptedOffers = await Offer.find({ recruiterId: recruiterUserId, status: 'accepted' }).populate('studentId');

  const studentMap = new Map();

  // Process explicitly bookmarked candidates
  for (const doc of docs) {
    if (!doc.studentId) continue;
    studentMap.set(doc.studentId._id.toString(), {
      user: doc.studentId,
      addedAt: doc.addedAt,
      isShortlisted: true
    });
  }

  // Process candidates who accepted offers
  for (const offer of acceptedOffers) {
    if (!offer.studentId) continue;
    const studentIdStr = offer.studentId._id.toString();
    if (!studentMap.has(studentIdStr)) {
      studentMap.set(studentIdStr, {
        user: offer.studentId,
        addedAt: offer.updatedAt,
        isShortlisted: true // Treat accepted offers as auto-shortlisted
      });
    }
  }

  const resolved = [];
  for (const [userIdStr, data] of studentMap.entries()) {
    const student = await Student.findOne({ userId: data.user._id });
    if (!student) continue;

    const career = await StudentCareer.findOne({ studentId: data.user._id }).populate('careerId');
    const cert = await Certificate.findOne({ studentId: data.user._id });

    resolved.push({
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
      certificateIssued: !!cert,
      addedAt: data.addedAt,
      isShortlisted: data.isShortlisted,
    });
  }

  // Sort by date added / accepted descending
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
  const docs = await HiringPipeline.find({ recruiterId: recruiterUserId }).populate('studentId');
  const resolved = [];

  for (const doc of docs) {
    if (!doc.studentId) continue;
    const student = await Student.findOne({ userId: doc.studentId._id });
    if (!student) continue;

    const career = await StudentCareer.findOne({ studentId: doc.studentId._id }).populate('careerId');

    resolved.push({
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
    });
  }

  return resolved;
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
  const docs = await ContactRequest.find({ recruiterId: recruiterUserId }).populate('studentId');
  const resolved = [];

  for (const doc of docs) {
    if (!doc.studentId) continue;
    const student = await Student.findOne({ userId: doc.studentId._id });
    if (!student) continue;

    resolved.push({
      _id: doc._id,
      studentId: student._id,
      fullName: student.fullName,
      email: doc.studentId.email,
      avatar: doc.studentId.avatar,
      subject: doc.subject,
      message: doc.message,
      status: doc.status,
      sentAt: doc.sentAt,
    });
  }

  return resolved;
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
    const readinessIndex = Math.min(100, Math.round(progress * 0.8 + (hasGithub ? 20 : 0)));

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
export const createOffer = async (recruiterUserId, studentUserId, companyName, message) => {
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

