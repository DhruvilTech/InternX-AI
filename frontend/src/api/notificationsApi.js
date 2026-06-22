import axiosInstance from './axios.js';

export const getNotifications = async (page = 1, limit = 20) => {
  const response = await axiosInstance.get('/api/notifications', {
    params: { page, limit },
  });
  return response.data;
};

export const readNotification = async (notificationId) => {
  const response = await axiosInstance.patch(`/api/notifications/${notificationId}/read`);
  return response.data;
};

export const readAllNotifications = async () => {
  const response = await axiosInstance.patch('/api/notifications/read-all');
  return response.data;
};

export const deleteNotification = async (notificationId) => {
  const response = await axiosInstance.delete(`/api/notifications/${notificationId}`);
  return response.data;
};

export const postAnnouncement = async (announcementData) => {
  const response = await axiosInstance.post('/api/notifications/announcement', announcementData);
  return response.data;
};
