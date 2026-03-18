import api from './api';

const userService = {
  // Get all users (Admin only)
  getAllUsers: async () => {
    const response = await api.get('/api/users');
    return response.data;
  },

  // Get user profile by ID
  getUserById: async (id) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  // Create new user (Admin only)
  createUser: async (userData) => {
    const response = await api.post('/api/users', userData);
    return response.data;
  },

  // Update user profile
  updateUser: async (id, userData) => {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  },

  // Delete user (Admin only)
  deleteUser: async (id) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  }
};

export default userService;
