import axiosInstance from './axios.js';

export const getNotifications = async () => {
  const response = await axiosInstance.get('/api/student/notifications');
  return response.data;
};

export const readNotification = async (notificationId) => {
  const response = await axiosInstance.patch(`/api/student/notifications/${notificationId}/read`);
  return response.data;
};
