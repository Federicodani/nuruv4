import axiosInstance from './axiosInstance';

export const getProjects = (params) =>
  axiosInstance.get('/projects', { params });

export const getFeaturedProjects = () =>
  axiosInstance.get('/projects/featured');

export const getProjectById = (id) =>
  axiosInstance.get(`/projects/${id}`);

export const likeProject = (id) =>
  axiosInstance.put(`/projects/${id}/like`);

// Professional dashboard
export const getMyProjects = () =>
  axiosInstance.get('/projects/me/projects');

export const getMyProjectStats = () =>
  axiosInstance.get('/projects/me/stats');

export const createProject = (formData) =>
  axiosInstance.post('/projects', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateProject = (id, formData) =>
  axiosInstance.put(`/projects/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteProject = (id) =>
  axiosInstance.delete(`/projects/${id}`);

// Admin
export const getAllProjectsAdmin = () =>
  axiosInstance.get('/projects/admin/all');

export const toggleProjectFeatured = (id) =>
  axiosInstance.put(`/projects/${id}/toggle-featured`);
