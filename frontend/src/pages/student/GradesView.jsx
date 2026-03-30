import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  AppBar,
  Toolbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import assignmentService from '../../services/assignmentService';
import courseService from '../../services/courseService';

export default function GradesView() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoursesAndGrades();
  }, []);

  const fetchCoursesAndGrades = async () => {
    try {
      setLoading(true);
      const courses = await courseService.getEnrolledCourses();
      setEnrolledCourses(courses);
      
      const myAssignments = await assignmentService.getMyAssignments();
      setSubmissions(myAssignments);
    } catch (error) {
      showMessage('Error fetching data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const calculateCourseGrade = (courseId) => {
    const courseSubmissions = submissions.filter(s => s.courseId === courseId && s.marksObtained !== null);
    if (courseSubmissions.length === 0) return null;
    const totalMarks = courseSubmissions.reduce((sum, s) => sum + s.marksObtained, 0);
    const totalMax = courseSubmissions.reduce((sum, s) => sum + (s.maxMarks || 100), 0);
    return ((totalMarks / totalMax) * 100).toFixed(1);
  };

  const getGradeColor = (marks, maxMarks) => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 90) return '#22c55e';
    if (percentage >= 80) return '#3b82f6';
    if (percentage >= 70) return '#f59e0b';
    if (percentage >= 60) return '#ef4444';
    return '#dc2626';
  };

  if (loading) return <CircularProgress />;

  const gradedSubmissions = submissions.filter(s => s.marksObtained !== null);
  const totalObtainedMarks = gradedSubmissions.reduce((sum, s) => sum + s.marksObtained, 0);
  const totalPossibleMarks = gradedSubmissions.reduce((sum, s) => sum + (s.maxMarks || 100), 0);

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Student - Grades & Performance
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {message && (
          <Alert severity={messageType} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {gradedSubmissions.length > 0 && (
          <Card sx={{ mb: 4, backgroundColor: '#f0f9ff' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                📊 Overall Performance
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Total Marks
                  </Typography>
                  <Typography variant="h5">
                    {totalObtainedMarks} / {totalPossibleMarks}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    ({((totalObtainedMarks / totalPossibleMarks) * 100).toFixed(1)}%)
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Average Score
                  </Typography>
                  <Typography variant="h5">
                    {(totalObtainedMarks / gradedSubmissions.length).toFixed(1)}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(totalObtainedMarks / gradedSubmissions.length) / (totalPossibleMarks / gradedSubmissions.length) * 100}
                    sx={{ mt: 1 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          📚 Course-wise Performance
        </Typography>

        {enrolledCourses.length === 0 ? (
          <Alert severity="info">No enrolled courses. Please enroll in a course to see grades.</Alert>
        ) : (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {enrolledCourses.map(course => {
              const courseGrade = calculateCourseGrade(course.courseId);
              const courseSubmissions = submissions.filter(s => s.courseId === course.courseId);
              const gradedCount = courseSubmissions.filter(s => s.marksObtained !== null).length;
              
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.courseId}>
                  <Card sx={{ '&:hover': { boxShadow: 3 } }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary">
                        {course.courseCode}
                      </Typography>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {course.courseName}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Assignments: {gradedCount} / {courseSubmissions.length} graded
                        </Typography>
                      </Box>
                      {courseGrade ? (
                        <Box>
                          <Typography variant="h4" sx={{ color: '#1976d2', mb: 1 }}>
                            {courseGrade}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={courseGrade}
                            sx={{ mb: 1 }}
                          />
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No grades yet
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          📝 Assignment Grades
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Course</strong></TableCell>
                <TableCell><strong>Assignment</strong></TableCell>
                <TableCell align="center"><strong>Marks Obtained</strong></TableCell>
                <TableCell align="center"><strong>Max Marks</strong></TableCell>
                <TableCell align="center"><strong>Percentage</strong></TableCell>
                <TableCell><strong>Feedback</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No submissions yet
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map(submission => {
                  const percentage = submission.marksObtained !== null 
                    ? ((submission.marksObtained / (submission.maxMarks || 100)) * 100).toFixed(1)
                    : null;
                  
                  return (
                    <TableRow key={submission.assignmentId}>
                      <TableCell><strong>{submission.courseCode}</strong></TableCell>
                      <TableCell>{submission.title}</TableCell>
                      <TableCell align="center">
                        {submission.marksObtained !== null ? (
                          <Typography sx={{ fontWeight: 'bold', color: getGradeColor(submission.marksObtained, submission.maxMarks || 100) }}>
                            {submission.marksObtained}
                          </Typography>
                        ) : (
                          <Typography sx={{ color: '#9ca3af' }}>Pending</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">{submission.maxMarks || 'N/A'}</TableCell>
                      <TableCell align="center">
                        {percentage ? (
                          <Typography sx={{ fontWeight: 'bold' }}>
                            {percentage}%
                          </Typography>
                        ) : (
                          <Typography sx={{ color: '#9ca3af' }}>-</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {submission.feedback || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}
