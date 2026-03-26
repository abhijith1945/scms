import api from './api';

const studentService = {
  getAllStudents: async () => {
    const response = await api.get('/api/students');
    return response.data;
  },
  createStudent: async (data) => {
    const response = await api.post('/api/students', data);
    return response.data;
  },
  updateStudent: async (id, data) => {
    const response = await api.put(`/api/students/${id}`, data);
    return response.data;
  },
  deleteStudent: async (id) => {
    const response = await api.delete(`/api/students/${id}`);
    return response.data;
  }
};

export default studentService;
