import axiosInstance from './axios.js';

export const getProfile = async () => {
  const response = await axiosInstance.get('/api/recruiter/profile');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await axiosInstance.patch('/api/recruiter/profile', profileData);
  return response.data;
};

export const getDashboard = async () => {
  const response = await axiosInstance.get('/api/recruiter/dashboard');
  return response.data;
};

export const getStudents = async (params = {}) => {
  const response = await axiosInstance.get('/api/recruiter/students', { params });
  return response.data;
};

export const getStudentDetails = async (id) => {
  const response = await axiosInstance.get(`/api/recruiter/students/${id}`);
  return response.data;
};

export const getShortlisted = async () => {
  const response = await axiosInstance.get('/api/recruiter/shortlisted');
  return response.data;
};

export const toggleShortlist = async (studentId) => {
  const response = await axiosInstance.post(`/api/recruiter/shortlisted/${studentId}`);
  return response.data;
};

export const getPipeline = async () => {
  const response = await axiosInstance.get('/api/recruiter/pipeline');
  return response.data;
};

export const updatePipelineStage = async (studentId, pipelineData) => {
  const response = await axiosInstance.post(`/api/recruiter/pipeline/${studentId}`, pipelineData);
  return response.data;
};

export const deleteFromPipeline = async (studentId) => {
  const response = await axiosInstance.delete(`/api/recruiter/pipeline/${studentId}`);
  return response.data;
};

export const getContactRequests = async () => {
  const response = await axiosInstance.get('/api/recruiter/contact-requests');
  return response.data;
};

export const createContactRequest = async (outreachData) => {
  const response = await axiosInstance.post('/api/recruiter/contact-requests', outreachData);
  return response.data;
};

export const getAnalytics = async () => {
  const response = await axiosInstance.get('/api/recruiter/analytics');
  return response.data;
};
