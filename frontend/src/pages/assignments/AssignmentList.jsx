import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Box,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../context/AuthContext';
import assignmentService from '../../services/assignmentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AssignmentList() {
  const [searchParams] = useSearchParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const courseId = searchParams.get('courseId');

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  const fetchAssignments = async () => {
    try {
      setError('');
      let data;
      if (courseId) {
        data = await assignmentService.getAssignmentsByCourse(courseId);
      } else {
        data = await assignmentService.getMyAssignments();
      }
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError('Failed to load assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) return <LoadingSpinner />;

  const isFaculty = user?.userType === 'FACULTY' || user?.userType === 'ADMIN';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/dashboard')}
        sx={{ mb: 2 }}
      >
        Back to Dashboard
      </Button>

      <Typography variant="h4" gutterBottom>
        Assignments {courseId && '- Course'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {assignments.map((assignment) => (
          <Grid size={{ xs: 12, md: 6 }} key={assignment.assignmentId}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">{assignment.title}</Typography>
                  {assignment.submitted ? (
                    <Chip label="Submitted" color="success" size="small" />
                  ) : isOverdue(assignment.dueDate) ? (
                    <Chip label="Overdue" color="error" size="small" />
                  ) : (
                    <Chip label="Pending" color="warning" size="small" />
                  )}
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {assignment.description}
                </Typography>

                <Typography variant="body2">
                  <strong>Course:</strong> {assignment.courseName}
                </Typography>
                <Typography variant="body2">
                  <strong>Due Date:</strong>{' '}
                  {new Date(assignment.dueDate).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Max Marks:</strong> {assignment.maxMarks}
                </Typography>

                {!isFaculty && assignment.submitted ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="success.main">
                      Submitted on: {new Date(assignment.submittedAt).toLocaleString()}
                    </Typography>
                    {assignment.marksObtained !== null && (
                      <Typography variant="body2">
                        <strong>Marks:</strong> {assignment.marksObtained} / {assignment.maxMarks}
                      </Typography>
                    )}
                  </Box>
                ) : !isFaculty ? (
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={() => navigate(`/assignments/${assignment.assignmentId}/submit`)}
                  >
                    Submit Assignment
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        ))}

        {assignments.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography align="center">No assignments found</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
