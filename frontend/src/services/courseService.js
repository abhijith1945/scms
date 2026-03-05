import api from './api';

const courseService = {
  getAllCourses: async () => {
    const response = await api.get('/api/courses');
    return response.data;
  },

  getCourseById: async (id) => {
    const response = await api.get(`/api/courses/${id}`);
    return response.data;
  },

  getEnrolledCourses: async () => {
    const response = await api.get('/api/courses/enrolled');
    return response.data;
  },

  enrollCourse: async (courseId) => {
    const response = await api.post(`/api/courses/${courseId}/enroll`);
    return response.data;
  }
};

export default courseService;
