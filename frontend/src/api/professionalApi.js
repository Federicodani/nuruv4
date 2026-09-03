import axiosInstance from './axiosInstance';

export const getProfessionals = (params) =>
  axiosInstance.get('/professionals', { params });

export const getProfessionalById = (id) => axiosInstance.get(`/professionals/${id}`);

export const getMyProfessionalProfile = () =>
  axiosInstance.get('/professionals/me/profile');

export const updateMyProfessionalProfile = (data) =>
  axiosInstance.put('/professionals/me/profile', data);

export const updateProfileImage = (formData) =>
  axiosInstance.put('/professionals/me/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateCoverImage = (formData) =>
  axiosInstance.put('/professionals/me/cover-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const addPortfolioImage = (formData) =>
  axiosInstance.post('/professionals/me/portfolio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deletePortfolioImage = (imageId) =>
  axiosInstance.delete(`/professionals/me/portfolio/${imageId}`);

export const addReview = (professionalId, data) =>
  axiosInstance.post(`/professionals/${professionalId}/reviews`, data);
