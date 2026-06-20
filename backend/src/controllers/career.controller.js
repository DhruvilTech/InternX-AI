import CareerPath from '../models/CareerPath.js';
import StudentCareer from '../models/StudentCareer.js';
import { sendResponse } from '../utils/sendResponse.js';

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
