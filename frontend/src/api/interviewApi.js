import axiosInstance from './axios.js';

/**
 * Get all interview sessions for the logged-in student.
 */
export const getStudentInterviews = async () => {
  const response = await axiosInstance.get('/api/interview');
  return response.data;
};

/**
 * Start an interview session and generate 10 questions.
 * @param {Object} data - { careerPath, interviewType, difficulty }
 */
export const startInterview = async (data) => {
  const response = await axiosInstance.post('/api/interview/start', data);
  return response.data;
};

/**
 * Get details of an interview session.
 * @param {string} id - Interview ID
 */
export const getInterviewDetails = async (id) => {
  const response = await axiosInstance.get(`/api/interview/${id}`);
  return response.data;
};

/**
 * Get current question for an interview session.
 * @param {string} id - Interview ID
 */
export const getCurrentQuestion = async (id) => {
  const response = await axiosInstance.get(`/api/interview/${id}/question`);
  return response.data;
};

/**
 * Submit answer to current question.
 * @param {string} id - Interview ID
 * @param {Object} answerData - { questionId, answer, transcript, duration }
 */
export const submitAnswer = async (id, answerData) => {
  const response = await axiosInstance.post(`/api/interview/${id}/answer`, answerData);
  return response.data;
};

/**
 * Mark interview as completed and trigger evaluation report.
 * @param {string} id - Interview ID
 */
export const completeInterview = async (id) => {
  const response = await axiosInstance.post(`/api/interview/${id}/complete`);
  return response.data;
};
