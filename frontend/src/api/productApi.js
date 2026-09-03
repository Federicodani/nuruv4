import axiosInstance from './axiosInstance';

export const getProducts = (params) => axiosInstance.get('/products', { params });

export const getProductById = (id) => axiosInstance.get(`/products/${id}`);

export const getMyProducts = () => axiosInstance.get('/products/me/products');

export const createProduct = (formData) =>
  axiosInstance.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateProduct = (id, formData) =>
  axiosInstance.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteProduct = (id) => axiosInstance.delete(`/products/${id}`);

export const deleteProductImage = (productId, imageId) =>
  axiosInstance.delete(`/products/${productId}/images/${imageId}`);
