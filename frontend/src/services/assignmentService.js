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

  // Create assignment (Faculty only)
  createAssignment: async (assignmentData) => {
    const response = await api.post('/api/assignments', assignmentData);
    return response.data;
  },

  // Update assignment (Faculty only)
  updateAssignment: async (id, assignmentData) => {
    const response = await api.put(`/api/assignments/${id}`, assignmentData);
    return response.data;
  },

  // Delete assignment (Faculty only)
  deleteAssignment: async (id) => {
    const response = await api.delete(`/api/assignments/${id}`);
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

  // Get submissions for an assignment (Faculty only)
  getSubmissions: async (assignmentId) => {
    const response = await api.get(`/api/assignments/${assignmentId}/submissions`);
    return response.data;
  },

  // Grade a submission (Faculty only)
  gradeSubmission: async (submissionId, gradeData) => {
    const response = await api.put(`/api/submissions/${submissionId}`, {
      marksObtained: gradeData.marksObtained,
      feedback: gradeData.feedback
    });
    return response.data;
  },

  // Delete submission (Admin only)
  deleteSubmission: async (submissionId) => {
    const response = await api.delete(`/api/submissions/${submissionId}`);
    return response.data;
  }
};

export default assignmentService;
