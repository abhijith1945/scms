import api from './api';

const assignmentService = {
  getAssignmentsByCourse: async (courseId) => {
    const response = await api.get(`/api/assignments/course/${courseId}`);
    return response.data;
  },

  getMyAssignments: async () => {
    const response = await api.get('/api/assignments/my');
    return response.data;
  },

  getAssignmentById: async (id) => {
    const response = await api.get(`/api/assignments/${id}`);
    return response.data;
  },

  createAssignment: async (assignmentData) => {
    const response = await api.post('/api/assignments', assignmentData);
    return response.data;
  },

  submitAssignment: async (assignmentId, formData) => {
    const response = await api.post(
      `/api/assignments/${assignmentId}/submit`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  getSubmission: async (assignmentId) => {
    const response = await api.get(`/api/assignments/${assignmentId}/submission`);
    return response.data;
  },

  gradeSubmission: async (submissionId, marksObtained, feedback) => {
    const response = await api.put(`/api/assignments/submissions/${submissionId}/grade`, {
      marksObtained,
      feedback
    });
    return response.data;
  }
};

export default assignmentService;
