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

  // Create new course (Faculty/Admin only)
  createCourse: async (courseData) => {
    const response = await api.post('/api/courses', courseData);
    return response.data;
  },

  // Update course (Faculty/Admin only)
  updateCourse: async (id, courseData) => {
    const response = await api.put(`/api/courses/${id}`, courseData);
    return response.data;
  },

  // Delete course (Admin only)
  deleteCourse: async (id) => {
    const response = await api.delete(`/api/courses/${id}`);
    return response.data;
  },

  getMyCourses: async () => {
    const response = await api.get('/api/courses/my');
    return response.data;
  },

  getCourseFaculty: async (courseId) => {
    const response = await api.get(`/api/courses/${courseId}/faculty`);
    return response.data;
  },

  assignFacultyToCourse: async (courseId, facultyId) => {
    const response = await api.post(`/api/courses/${courseId}/faculty`, { facultyId });
    return response.data;
  },

  removeFacultyFromCourse: async (courseId, facultyId) => {
    const response = await api.delete(`/api/courses/${courseId}/faculty/${facultyId}`);
    return response.data;
  }
};

export default courseService;
