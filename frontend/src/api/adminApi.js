import axiosInstance from './axiosInstance';

export const getAdminStats = () => axiosInstance.get('/admin/stats');

export const getAllUsers = () => axiosInstance.get('/admin/users');
export const deleteUserAdmin = (id) => axiosInstance.delete(`/admin/users/${id}`);

export const getAllProfessionalsAdmin = () => axiosInstance.get('/admin/professionals');
export const getAllStoresAdmin = () => axiosInstance.get('/admin/stores');

export const getAllProductsAdmin = () => axiosInstance.get('/admin/products');
export const deleteProductAdmin = (id) => axiosInstance.delete(`/admin/products/${id}`);

export const getAllJobsAdmin = () => axiosInstance.get('/admin/jobs');
export const deleteJobAdmin = (id) => axiosInstance.delete(`/admin/jobs/${id}`);
