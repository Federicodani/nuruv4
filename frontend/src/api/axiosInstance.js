import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Attach JWT token to every request if present
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('nuru_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response handling: auto-logout on 401 (expired/invalid token)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nuru_token');
      localStorage.removeItem('nuru_user');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
