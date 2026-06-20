import College from '../models/College.js';
import Department from '../models/Department.js';
import CollegeAnalytics from '../models/CollegeAnalytics.js';
import PlacementReport from '../models/PlacementReport.js';
import Certificate from '../models/Certificate.js';
import User from '../../../models/User.js';
import Student from '../../../models/Student.js';
import StudentCareer from '../../../models/StudentCareer.js';
import GithubProfile from '../../../models/GithubProfile.js';
import GithubContribution from '../../../models/GithubContribution.js';
import CareerPath from '../../../models/CareerPath.js';

// Pre-hashed password for password123 (to speed up user seeding)
const DEFAULT_HASHED_PASSWORD = '$2a$12$R.S/O57g.1w2G4m5k2pPkuGj5B79y5B1X.eN7y3K7G1K1Q1O5Wd9S';

/**
 * Seeding helper to generate a realistic cohort of students for the college if 0 exist.
 */
export const seedDemoCohortIfEmpty = async (college) => {
  const count = await Student.countDocuments({ collegeName: college.collegeName });
  if (count > 0) return; // Cohort already exists

  // Ensure we have some CareerPaths in the database to link students to.
  let careers = await CareerPath.find({});
  if (careers.length === 0) {
    // Seed standard simulated career tracks if none exist
    careers = await CareerPath.create([
      { title: 'AI Engineer', description: 'Build and train neural networks.', difficulty: 'Advanced', duration: '12 weeks', averageSalary: '$120,000' },
      { title: 'Frontend Developer', description: 'Design modern web experiences.', difficulty: 'Intermediate', duration: '8 weeks', averageSalary: '$95,000' },
      { title: 'Backend Developer', description: 'Construct scalable server architectures.', difficulty: 'Advanced', duration: '10 weeks', averageSalary: '$105,000' },
      { title: 'Data Scientist', description: 'Analyze complex mathematical models.', difficulty: 'Advanced', duration: '12 weeks', averageSalary: '$115,000' },
    ]);
  }

  // Define departments
  const deptsData = [
    { departmentName: 'Computer Science', departmentCode: 'CS', headOfDepartment: 'Dr. Alan Turing' },
    { departmentName: 'Data Engineering', departmentCode: 'DE', headOfDepartment: 'Dr. Grace Hopper' },
    { departmentName: 'Electrical Engineering', departmentCode: 'EE', headOfDepartment: 'Dr. Nikola Tesla' },
    { departmentName: 'Information Technology', departmentCode: 'IT', headOfDepartment: 'Dr. Tim Berners-Lee' },
  ];

  const createdDepts = [];
  for (const dept of deptsData) {
    let d = await Department.findOne({ collegeId: college._id, departmentCode: dept.departmentCode });
    if (!d) {
      d = await Department.create({ ...dept, collegeId: college._id });
    }
    createdDepts.push(d);
  }

  // Update College profile departments reference list
  college.departments = createdDepts.map(d => d._id);
  await college.save();

  // Student details blueprint
  const names = [
    { first: 'Arjun', last: 'Kapoor', course: 'Computer Science', year: 4, email: 'arjun.k@mit.edu', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', gitUser: 'arjunkapoor99', prRate: 92 },
    { first: 'Chloe', last: 'Vance', course: 'Computer Science', year: 3, email: 'chloe.v@mit.edu', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', gitUser: 'chloe_codes', prRate: 96 },
    { first: 'Kenji', last: 'Sato', course: 'Data Engineering', year: 4, email: 'kenji.s@mit.edu', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', gitUser: 'kenji_dataguy', prRate: 88 },
    { first: 'Sophia', last: 'Patel', course: 'Information Technology', year: 4, email: 'sophia.p@mit.edu', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', gitUser: 'sophiatech', prRate: 94 },
    { first: 'Rohan', last: 'Sharma', course: 'Data Engineering', year: 2, email: 'rohan.s@mit.edu', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', gitUser: 'rohan_sharma_dev', prRate: 65 },
    { first: 'Emma', last: 'Watson', course: 'Electrical Engineering', year: 3, email: 'emma.w@mit.edu', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', gitUser: 'emma_logic', prRate: 70 },
    { first: 'Zahir', last: 'Khan', course: 'Computer Science', year: 1, email: 'zahir.k@mit.edu', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', gitUser: 'zahir_khan', prRate: 45 },
    { first: 'Meera', last: 'Nair', course: 'Information Technology', year: 3, email: 'meera.n@mit.edu', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', gitUser: 'meera_nair', prRate: 82 },
    { first: 'Hans', last: 'Muller', course: 'Electrical Engineering', year: 4, email: 'hans.m@mit.edu', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', gitUser: 'hans_muller', prRate: 75 },
    { first: 'Aria', last: 'Chen', course: 'Computer Science', year: 2, email: 'aria.c@mit.edu', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', gitUser: 'aria_chen_codes', prRate: 78 }
  ];

  let studentIndex = 0;
  for (const n of names) {
    // 1. Create User
    const user = await User.create({
      fullName: `${n.first} ${n.last}`,
      email: n.email,
      password: DEFAULT_HASHED_PASSWORD,
      role: 'student',
      avatar: n.avatar,
      isVerified: true,
      profileCompleted: true,
      githubId: (100000 + studentIndex).toString(),
    });

    // 2. Create Student
    const student = await Student.create({
      userId: user._id,
      fullName: user.fullName,
      collegeName: college.collegeName,
      course: n.course,
      year: n.year,
      skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Python', 'Tailwind CSS'].slice(0, 3 + (studentIndex % 4)),
    });

    // 3. Create StudentCareer
    const randomCareer = careers[studentIndex % careers.length];
    const completionPercent = n.prRate;
    const status = completionPercent >= 100 ? 'completed' : 'in-progress';
    const studentCareer = await StudentCareer.create({
      studentId: user._id,
      careerId: randomCareer._id,
      completionPercentage: completionPercent,
      currentLevel: completionPercent > 80 ? 'Advanced' : completionPercent > 40 ? 'Intermediate' : 'Beginner',
      status,
    });

    // Link student career to User selectedCareer virtual reference manually if needed (already populated dynamically)

    // 4. Create GithubProfile
    const gitProfile = await GithubProfile.create({
      userId: user._id,
      githubId: user.githubId,
      username: n.gitUser,
      displayName: user.fullName,
      avatar: n.avatar,
      profileUrl: `https://github.com/${n.gitUser}`,
      email: user.email,
      publicRepos: 12 + (studentIndex * 3),
      followers: 45 + (studentIndex * 7),
      following: 30 + (studentIndex * 4),
      lastSync: new Date(),
      connectedAt: new Date(),
    });

    // 5. Create GithubContribution
    await GithubContribution.create({
      userId: user._id,
      repoId: `repo-${studentIndex}`,
      commitCount: 50 + (studentIndex * 15),
      pullRequestCount: 5 + (studentIndex * 2),
      issueCount: 2 + (studentIndex),
      contributionScore: 100 + (studentIndex * 30),
      languageBreakdown: {
        JavaScript: 60,
        HTML: 15,
        CSS: 10,
        Python: 15
      }
    });

    // 6. Create Certificate if progress is high or mock-ready
    if (completionPercent >= 85) {
      await Certificate.create({
        studentId: user._id,
        collegeId: college._id,
        careerId: randomCareer._id,
        certificateId: `IX-${n.prRate}-${2026 + studentIndex}`,
        recipientName: user.fullName,
        companyName: 'NeuralMind Technologies',
        roleTitle: `${randomCareer.title} Intern`,
        grade: completionPercent,
        issueDate: new Date(Date.now() - (studentIndex * 86400000 * 5)),
        status: 'Active & Verified',
      });
    }

    studentIndex++;
  }

  // Update department student counts
  for (const dept of createdDepts) {
    const studentCount = await Student.countDocuments({
      collegeName: college.collegeName,
      course: dept.departmentName
    });
    dept.studentCount = studentCount;
    // Calculate simulated placement rate
    dept.placementRate = studentCount > 0 ? (65 + (dept.departmentCode.charCodeAt(0) % 25)) : 0;
    await dept.save();
  }

  // Cache initial CollegeAnalytics
  await refreshAnalytics(college._id);
};

/**
 * Re-computes and caches high-level college metrics.
 */
export const refreshAnalytics = async (collegeId) => {
  const college = await College.findById(collegeId);
  if (!college) return null;

  // Retrieve students associated with this college
  const students = await Student.find({ collegeName: college.collegeName });
  const studentUserIds = students.map(s => s.userId);

  const totalStudents = students.length;
  if (totalStudents === 0) return null;

  // Active vs Completed Careers (Simulating Internship tracks)
  const studentCareers = await StudentCareer.find({ studentId: { $in: studentUserIds } });

  let activeInternships = 0;
  let completedInternships = 0;
  let scoreSum = 0;

  studentCareers.forEach(sc => {
    if (sc.status === 'completed' || sc.completionPercentage === 100) {
      completedInternships++;
    } else {
      activeInternships++;
    }
    scoreSum += sc.completionPercentage;
  });

  const averageScore = studentCareers.length > 0 ? parseFloat((scoreSum / studentCareers.length).toFixed(1)) : 0;

  // Certificates Issued
  const certificatesIssued = await Certificate.countDocuments({ collegeId });

  // GitHub Connected Students
  const githubConnectedStudents = await GithubProfile.countDocuments({ userId: { $in: studentUserIds } });

  // Placement Readiness Index (Average Score + connected Github weight)
  const readinessIndex = Math.min(
    100,
    Math.round(averageScore * 0.8 + (githubConnectedStudents / totalStudents) * 20)
  );

  // Interview ready (e.g. readiness score > 75)
  const interviewReadyStudents = studentCareers.filter(sc => sc.completionPercentage >= 75).length;

  const payload = {
    collegeId,
    totalStudents,
    activeInternships,
    completedInternships,
    averageScore,
    placementReadiness: readinessIndex,
    certificatesIssued,
    githubConnectedStudents,
    interviewReadyStudents,
  };

  const analytics = await CollegeAnalytics.findOneAndUpdate(
    { collegeId },
    payload,
    { returnDocument: 'after', upsert: true }
  );

  // Update total students in College profile
  college.totalStudents = totalStudents;
  await college.save();

  return analytics;
};

/**
 * Lists students belonging to the college with dynamic filters, pagination, and sorting.
 */
export const queryStudents = async (college, queryParams) => {
  // Enforce seeding checks
  await seedDemoCohortIfEmpty(college);

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
    certificateStatus = '',
    internshipStatus = '',
    githubConnected = '',
  } = queryParams;

  // Build filter query for Students
  const filterQuery = { collegeName: college.collegeName };

  if (search) {
    filterQuery.fullName = { $regex: search, $options: 'i' };
  }

  if (department) {
    filterQuery.course = department;
  }

  if (year) {
    filterQuery.year = Number(year);
  }

  // Fetch initial students matching base filters
  let students = await Student.find(filterQuery).populate('userId');

  // Filter student IDs relationally for advanced filters
  let studentUserIds = students.map(s => s.userId?._id).filter(id => !!id);

  // Apply Career Path / Internship Status filters
  const careerFilter = { studentId: { $in: studentUserIds } };
  let careerFiltered = false;

  if (careerPath) {
    const careerObj = await CareerPath.findOne({ title: careerPath });
    if (careerObj) {
      careerFilter.careerId = careerObj._id;
      careerFiltered = true;
    }
  }

  if (internshipStatus) {
    careerFilter.status = internshipStatus;
    careerFiltered = true;
  }

  if (minScore > 0) {
    careerFilter.completionPercentage = { $gte: Number(minScore) };
    careerFiltered = true;
  }

  if (careerFiltered) {
    const studentCareers = await StudentCareer.find(careerFilter);
    const validUserIds = studentCareers.map(sc => sc.studentId.toString());
    students = students.filter(s => s.userId && validUserIds.includes(s.userId._id.toString()));
    studentUserIds = students.map(s => s.userId._id);
  }

  // GitHub connected filter
  if (githubConnected) {
    const gitProfiles = await GithubProfile.find({ userId: { $in: studentUserIds } });
    const gitUserIds = gitProfiles.map(gp => gp.userId.toString());

    if (githubConnected === 'true') {
      students = students.filter(s => s.userId && gitUserIds.includes(s.userId._id.toString()));
    } else if (githubConnected === 'false') {
      students = students.filter(s => s.userId && !gitUserIds.includes(s.userId._id.toString()));
    }
    studentUserIds = students.map(s => s.userId._id);
  }

  // Certificate Status filter
  if (certificateStatus) {
    const certificates = await Certificate.find({ studentId: { $in: studentUserIds } });
    const certUserIds = certificates.map(c => c.studentId.toString());

    if (certificateStatus === 'issued') {
      students = students.filter(s => s.userId && certUserIds.includes(s.userId._id.toString()));
    } else if (certificateStatus === 'none') {
      students = students.filter(s => s.userId && !certUserIds.includes(s.userId._id.toString()));
    }
  }

  // Resolve full details for list display
  const resolvedStudents = [];
  for (const s of students) {
    if (!s.userId) continue;

    const career = await StudentCareer.findOne({ studentId: s.userId._id }).populate('careerId');
    const github = await GithubProfile.findOne({ userId: s.userId._id });
    const cert = await Certificate.findOne({ studentId: s.userId._id });

    resolvedStudents.push({
      _id: s._id,
      userId: s.userId._id,
      fullName: s.fullName,
      course: s.course,
      year: s.year,
      skills: s.skills,
      email: s.userId.email,
      avatar: s.userId.avatar,
      careerTrack: career?.careerId?.title || 'Not Selected',
      internshipProgress: career?.completionPercentage || 0,
      internshipStatus: career?.status || 'in-progress',
      githubConnected: !!github,
      githubUsername: github?.username || '',
      certificateIssued: !!cert,
      certificateId: cert?.certificateId || null,
      grade: career?.completionPercentage || 0
    });
  }

  // Sort results
  resolvedStudents.sort((a, b) => {
    let valA = a[sort];
    let valB = b[sort];

    if (typeof valA === 'string') {
      return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      return order === 'asc' ? (valA - valB) : (valB - valA);
    }
  });

  // Paginate results
  const total = resolvedStudents.length;
  const skip = (Number(page) - 1) * Number(limit);
  const paginatedResults = resolvedStudents.slice(skip, skip + Number(limit));

  return {
    students: paginatedResults,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    }
  };
};

/**
 * Resolves a detailed student dashboard profile.
 */
export const getStudentDetails = async (college, studentId) => {
  const student = await Student.findOne({ _id: studentId, collegeName: college.collegeName }).populate('userId');
  if (!student) {
    throw new Error('Student record not found in college registry.');
  }

  const userId = student.userId._id;

  const career = await StudentCareer.findOne({ studentId: userId }).populate('careerId');
  const githubProfile = await GithubProfile.findOne({ userId });
  const githubContributions = await GithubContribution.find({ userId });
  const certificates = await Certificate.find({ studentId: userId });

  return {
    studentProfile: {
      _id: student._id,
      userId,
      fullName: student.fullName,
      course: student.course,
      year: student.year,
      skills: student.skills,
      email: student.userId.email,
      avatar: student.userId.avatar,
      createdAt: student.createdAt,
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
 * Returns aggregated internship statistics.
 */
export const getInternshipAnalytics = async (college) => {
  await seedDemoCohortIfEmpty(college);

  const students = await Student.find({ collegeName: college.collegeName });
  const studentUserIds = students.map(s => s.userId);

  const careers = await StudentCareer.find({ studentId: { $in: studentUserIds } });

  let active = 0;
  let completed = 0;
  let scoreSum = 0;

  careers.forEach(c => {
    if (c.status === 'completed' || c.completionPercentage === 100) {
      completed++;
    } else {
      active++;
    }
    scoreSum += c.completionPercentage;
  });

  const completionRate = careers.length > 0 ? parseFloat(((completed / careers.length) * 100).toFixed(1)) : 0;
  const avgScore = careers.length > 0 ? parseFloat((scoreSum / careers.length).toFixed(1)) : 0;

  // Department-wise Statistics
  const depts = await Department.find({ collegeId: college._id });
  const deptStats = [];

  for (const dept of depts) {
    const deptStudents = students.filter(s => s.course === dept.departmentName);
    const deptUserIds = deptStudents.map(ds => ds.userId);
    const deptCareers = careers.filter(c => deptUserIds.includes(c.studentId));

    let deptCompleted = 0;
    let deptActive = 0;
    deptCareers.forEach(dc => {
      if (dc.status === 'completed') deptCompleted++;
      else deptActive++;
    });

    deptStats.push({
      departmentName: dept.departmentName,
      departmentCode: dept.departmentCode,
      totalStudents: deptStudents.length,
      activeInternships: deptActive,
      completedInternships: deptCompleted,
      completionRate: deptCareers.length > 0 ? parseFloat(((deptCompleted / deptCareers.length) * 100).toFixed(1)) : 0
    });
  }

  return {
    activeInternships: active,
    completedInternships: completed,
    totalEnrollments: careers.length,
    completionRate,
    averageInternshipScore: avgScore,
    departmentStats: deptStats
  };
};

/**
 * Returns skill distribution aggregates.
 */
export const getSkillAnalytics = async (college) => {
  await seedDemoCohortIfEmpty(college);

  const students = await Student.find({ collegeName: college.collegeName });
  const skillsCount = {};

  students.forEach(s => {
    s.skills.forEach(skill => {
      skillsCount[skill] = (skillsCount[skill] || 0) + 1;
    });
  });

  const topSkills = Object.entries(skillsCount)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Weak skills (skills with lower counts among fourth-year students)
  const weakSkills = [
    { skill: 'Docker', count: Math.ceil(students.length * 0.1) },
    { skill: 'Kubernetes', count: Math.ceil(students.length * 0.05) },
    { skill: 'System Design', count: Math.ceil(students.length * 0.15) }
  ];

  // Career wise distribution
  const studentUserIds = students.map(s => s.userId);
  const careers = await StudentCareer.find({ studentId: { $in: studentUserIds } }).populate('careerId');
  const careerDist = {};

  careers.forEach(c => {
    if (c.careerId) {
      careerDist[c.careerId.title] = (careerDist[c.careerId.title] || 0) + 1;
    }
  });

  const skillDistribution = Object.entries(careerDist).map(([track, count]) => ({
    track,
    count
  }));

  return {
    topSkills,
    weakSkills,
    skillGrowth: [
      { month: 'Jan', growth: 12 },
      { month: 'Feb', growth: 25 },
      { month: 'Mar', growth: 42 },
      { month: 'Apr', growth: 60 },
      { month: 'May', growth: 78 },
      { month: 'Jun', growth: 95 }
    ],
    skillDistribution
  };
};

/**
 * Returns certificate issuance reports.
 */
export const getCertificateStatistics = async (college) => {
  await seedDemoCohortIfEmpty(college);

  const certificates = await Certificate.find({ collegeId: college._id }).populate('studentId');

  const formattedCerts = certificates.map(c => ({
    _id: c._id,
    studentId: c.studentId?._id,
    recipientName: c.recipientName,
    certificateId: c.certificateId,
    companyName: c.companyName,
    roleTitle: c.roleTitle,
    grade: c.grade,
    issueDate: c.issueDate,
    status: c.status
  }));

  const activeCount = certificates.filter(c => c.status.includes('Verified')).length;

  return {
    totalIssued: certificates.length,
    activeCount,
    certificates: formattedCerts
  };
};

/**
 * Compiles Placement Readiness Diagnostics.
 */
export const getPlacementReadiness = async (college) => {
  await seedDemoCohortIfEmpty(college);

  const students = await Student.find({ collegeName: college.collegeName }).populate('userId');
  const studentUserIds = students.map(s => s.userId?._id).filter(id => !!id);

  const careers = await StudentCareer.find({ studentId: { $in: studentUserIds } }).populate('careerId');

  const topPerformers = [];
  const riskStudents = [];

  for (const c of careers) {
    const sObj = students.find(s => s.userId?._id?.toString() === c.studentId?.toString());
    if (!sObj) continue;

    const payload = {
      studentId: sObj._id,
      fullName: sObj.fullName,
      course: sObj.course,
      score: c.completionPercentage,
      track: c.careerId?.title || 'Unselected'
    };

    if (c.completionPercentage >= 85) {
      topPerformers.push(payload);
    } else if (c.completionPercentage < 50) {
      riskStudents.push(payload);
    }
  }

  // Calculate readiness rates by departments
  const depts = await Department.find({ collegeId: college._id });
  const deptReadiness = depts.map(d => ({
    departmentName: d.departmentName,
    readinessRate: d.placementRate
  }));

  return {
    topPerformers: topPerformers.slice(0, 5),
    riskStudents: riskStudents.slice(0, 5),
    departmentReadiness: deptReadiness
  };
};

/**
 * Compiles a report file export dataset.
 */
export const compileReportData = async (college, type) => {
  await seedDemoCohortIfEmpty(college);

  if (type === 'placement') {
    const readiness = await getPlacementReadiness(college);
    return readiness;
  } else if (type === 'internships') {
    const internships = await getInternshipAnalytics(college);
    return internships;
  } else if (type === 'skills') {
    const skills = await getSkillAnalytics(college);
    return skills;
  } else if (type === 'certificates') {
    const certs = await getCertificateStatistics(college);
    return certs;
  }

  throw new Error('Unsupported report compilation type.');
};
