import api from './api';

const facultyService = {
  getAllFaculty: async () => {
    const response = await api.get('/api/faculty');
    return response.data;
  },
  createFaculty: async (data) => {
    const response = await api.post('/api/faculty', data);
    return response.data;
  },
  updateFaculty: async (id, data) => {
    const response = await api.put(`/api/faculty/${id}`, data);
    return response.data;
  },
  deleteFaculty: async (id) => {
    const response = await api.delete(`/api/faculty/${id}`);
    return response.data;
  }
};

export default facultyService;
