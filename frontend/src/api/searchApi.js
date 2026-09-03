import axiosInstance from './axiosInstance';

export const globalSearch = (query) =>
  axiosInstance.get('/search', { params: { q: query } });

export const getConstants = () => axiosInstance.get('/constants');
