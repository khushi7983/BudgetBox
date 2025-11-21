import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('auth-token', token);
      return { token, user };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  logout: () => {
    localStorage.removeItem('auth-token');
  },

  getStoredToken: () => {
    return localStorage.getItem('auth-token');
  }
};

export const budgetService = {
  sync: async (budgetData) => {
    try {
      const response = await api.post('/budget/sync', budgetData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Sync failed');
    }
  },

  getLatest: async () => {
    try {
      const response = await api.get('/budget/latest');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to load budget');
    }
  }
};

export default api;