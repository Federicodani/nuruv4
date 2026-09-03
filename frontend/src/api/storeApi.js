import axiosInstance from './axiosInstance';

export const getStores = (params) => axiosInstance.get('/stores', { params });

export const getStoreById = (id) => axiosInstance.get(`/stores/${id}`);

export const getMyStore = () => axiosInstance.get('/stores/me/profile');

export const updateMyStore = (data) => axiosInstance.put('/stores/me/profile', data);

export const updateStoreLogo = (formData) =>
  axiosInstance.put('/stores/me/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateStoreCover = (formData) =>
  axiosInstance.put('/stores/me/cover', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
