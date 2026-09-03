import axiosInstance from './axiosInstance';

export const getEstimatorOptions = () =>
  axiosInstance.get('/estimator/options');

export const estimateCost = (data) =>
  axiosInstance.post('/estimator/cost', data);

export const estimateMaterials = (data) =>
  axiosInstance.post('/estimator/materials', data);
