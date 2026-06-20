import axiosInstance from './axios.js';

/**
 * Retrieve current college profile.
 */
export const getProfile = async () => {
  const response = await axiosInstance.get('/api/college/profile');
  return response.data;
};

/**
 * Update college profile attributes.
 */
export const updateProfile = async (profileData) => {
  const response = await axiosInstance.patch('/api/college/profile', profileData);
  return response.data;
};

/**
 * Retrieve dashboard analytics overview KPIs.
 */
export const getDashboard = async () => {
  const response = await axiosInstance.get('/api/college/dashboard');
  return response.data;
};

/**
 * Retrieve student listings with dynamic query parameters.
 */
export const getStudents = async (params = {}) => {
  const response = await axiosInstance.get('/api/college/students', { params });
  return response.data;
};

/**
 * Retrieve detailed student dashboard.
 */
export const getStudentDetails = async (id) => {
  const response = await axiosInstance.get(`/api/college/students/${id}`);
  return response.data;
};

/**
 * Retrieve detailed student GitHub details.
 */
export const getStudentGithub = async (id) => {
  const response = await axiosInstance.get(`/api/college/students/${id}/github`);
  return response.data;
};

/**
 * Retrieve internship completion and active metrics.
 */
export const getInternships = async () => {
  const response = await axiosInstance.get('/api/college/internships');
  return response.data;
};

/**
 * Retrieve student skills metrics and gap evaluations.
 */
export const getSkills = async () => {
  const response = await axiosInstance.get('/api/college/skills');
  return response.data;
};

/**
 * Retrieve placement readiness index and risk/top performers rankings.
 */
export const getPlacementReadiness = async () => {
  const response = await axiosInstance.get('/api/college/placement-readiness');
  return response.data;
};

/**
 * Retrieve certificates list issued to college students.
 */
export const getCertificates = async () => {
  const response = await axiosInstance.get('/api/college/certificates');
  return response.data;
};

/**
 * Retrieve institutional reports compiled dataset.
 */
export const getReports = async (type) => {
  const response = await axiosInstance.get('/api/college/reports', { params: { type } });
  return response.data;
};

/**
 * Create a new department.
 */
export const createDepartment = async (deptData) => {
  const response = await axiosInstance.post('/api/college/departments', deptData);
  return response.data;
};
