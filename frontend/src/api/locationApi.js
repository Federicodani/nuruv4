import axiosInstance from './axiosInstance';

export const getNearbyProfessionals = (lat, lng, params = {}) =>
  axiosInstance.get('/location/nearby-professionals', { params: { lat, lng, ...params } });

export const getNearbyStores = (lat, lng, params = {}) =>
  axiosInstance.get('/location/nearby-stores', { params: { lat, lng, ...params } });

export const updateProfessionalLocation = (lat, lng) =>
  axiosInstance.put('/location/professional-location', { lat, lng });

export const updateStoreLocation = (lat, lng) =>
  axiosInstance.put('/location/store-location', { lat, lng });
