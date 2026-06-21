import axiosInstance from './axios.js';

export const createOffer = async (offerData) => {
  const response = await axiosInstance.post('/api/recruiter/offers', offerData);
  return response.data;
};

export const getSentOffers = async () => {
  const response = await axiosInstance.get('/api/recruiter/offers');
  return response.data;
};

export const getReceivedOffers = async () => {
  const response = await axiosInstance.get('/api/student/offers');
  return response.data;
};

export const respondToOffer = async (offerId, responseData) => {
  const response = await axiosInstance.patch(`/api/student/offers/${offerId}/respond`, responseData);
  return response.data;
};
