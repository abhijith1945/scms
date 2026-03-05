import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  TextField,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import assignmentService from '../../services/assignmentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function SubmitAssignment() {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      const data = await assignmentService.getAssignmentById(assignmentId);
      setAssignment(data);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      setError('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file to submit');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      await assignmentService.submitAssignment(assignmentId, formData);
      setSuccess(true);
      setTimeout(() => navigate('/assignments'), 2000);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      setError(error.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/assignments')}
        sx={{ mb: 2 }}
      >
        Back to Assignments
      </Button>

      <Typography variant="h4" gutterBottom>
        Submit Assignment
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Assignment submitted successfully! Redirecting...
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {assignment && (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {assignment.title}
            </Typography>
            <Typography variant="body1" paragraph>
              {assignment.description}
            </Typography>
            <Typography variant="body2">
              <strong>Course:</strong> {assignment.courseName}
            </Typography>
            <Typography variant="body2">
              <strong>Due Date:</strong>{' '}
              {new Date(assignment.dueDate).toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              <strong>Max Marks:</strong> {assignment.maxMarks}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                fullWidth
              >
                Choose File
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.zip,.txt"
                />
              </Button>
              {file && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </Typography>
              )}
            </Box>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={!file || submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
