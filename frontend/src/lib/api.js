import axios from 'axios';
import useAuthStore from '../stores/useAuthStore.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses and unwrap consistent MERN API responses
api.interceptors.response.use(
  (response) => {
    // Unenvelope MERN response wrapper if present
    if (response.data && response.data.hasOwnProperty('success') && response.data.hasOwnProperty('data')) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    const isUnauth = error.response?.status === 401 || 
      (error.response?.status === 403 && typeof error.response?.data?.error === 'string' && error.response.data.error.includes('expired'));
    if (isUnauth && !['/login', '/register', '/forgot-password'].includes(window.location.pathname)) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;