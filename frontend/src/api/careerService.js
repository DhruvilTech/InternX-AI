import axiosInstance from './axios.js';

/**
 * Get all active career paths with optional search, category, difficulty and pagination.
 */
export const getAllCareers = async (params = {}) => {
  const response = await axiosInstance.get('/api/careers', { params });
  return response.data;
};

/**
 * Get details of a specific career path by ID.
 */
export const getCareerDetails = async (id) => {
  const response = await axiosInstance.get(`/api/careers/${id}`);
  return response.data;
};

/**
 * Select a career path for the current student.
 */
export const selectCareer = async (careerId) => {
  const response = await axiosInstance.post('/api/careers/select', { careerId });
  return response.data;
};

/**
 * Retrieve the current student's selected career and progress details.
 */
export const getMyCareer = async () => {
  const response = await axiosInstance.get('/api/careers/my-career');
  return response.data;
};
