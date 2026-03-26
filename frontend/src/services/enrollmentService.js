import api from './api';

const enrollmentService = {
  // Get enrollments for a specific course (Faculty only)
  getCourseEnrollments: async (courseId) => {
    const response = await api.get(`/api/enrollments/course/${courseId}`);
    return response.data;
  },

  // Get student's enrollments
  getStudentEnrollments: async (studentId) => {
    const response = await api.get(`/api/enrollments/student/${studentId}`);
    return response.data;
  },

  // Student enrolls in a course
  enrollCourse: async (courseId) => {
    const response = await api.post('/api/enrollments', { courseId });
    return response.data;
  },

  // Drop an enrollment
  dropEnrollment: async (enrollmentId) => {
    const response = await api.delete(`/api/enrollments/${enrollmentId}`);
    return response.data;
  },

  adminEnrollStudent: async (studentId, courseId) => {
    const response = await api.post('/api/enrollments/admin', { studentId, courseId });
    return response.data;
  }
};

export default enrollmentService;
