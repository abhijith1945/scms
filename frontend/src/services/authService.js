import api from './api';

const authService = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('scms_token', response.data.token);
      localStorage.setItem('scms_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('scms_token');
    localStorage.removeItem('scms_user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('scms_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('scms_token');
  }
};

export default authService;
