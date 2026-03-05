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

  markAttendance: async (attendanceData) => {
    const response = await api.post('/api/attendance/mark', attendanceData);
    return response.data;
  },

  bulkMarkAttendance: async (attendanceList) => {
    const response = await api.post('/api/attendance/bulk', attendanceList);
    return response.data;
  },

  getAttendancePercentage: async (studentId, courseId) => {
    const response = await api.get(`/api/attendance/percentage/${studentId}/${courseId}`);
    return response.data;
  }
};

export default attendanceService;
