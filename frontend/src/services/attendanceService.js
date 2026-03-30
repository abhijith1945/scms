import api from './api';

const attendanceService = {
  getStudentAttendance: async (studentId, courseId) => {
    const response = await api.get(`/api/attendance/student/${studentId}`, {
      params: { courseId }
    });
    return response.data;
  },

  getMyAttendance: async () => {
    const response = await api.get('/api/attendance/me');
    return response.data;
  },

  getCourseAttendanceByDate: async (courseId, date) => {
    const response = await api.get(`/api/attendance/course/${courseId}`, {
      params: { date }
    });
    return response.data;
  },

  // Mark attendance (bulk)
  bulkMarkAttendance: async (attendanceList) => {
    const response = await api.post('/api/attendance/bulk', attendanceList);
    return response.data;
  },

  // Update attendance (Faculty only)
  updateAttendance: async (id, status) => {
    const response = await api.put(`/api/attendance/${id}`, { status });
    return response.data;
  },

  // Delete attendance (Faculty only)
  deleteAttendance: async (id) => {
    const response = await api.delete(`/api/attendance/${id}`);
    return response.data;
  }
};

export default attendanceService;

