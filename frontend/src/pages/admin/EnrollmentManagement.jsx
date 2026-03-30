import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
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
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';

export default function EnrollmentManagement() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses();
      setCourses(data);
      if (data.length > 0) {
        setSelectedCourse(data[0].courseId);
        fetchEnrollments(data[0].courseId);
      }
    } catch (error) {
      showMessage('Error fetching courses: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async (courseId) => {
    try {
      const data = await enrollmentService.getCourseEnrollments(courseId);
      setEnrollments(data);
    } catch (error) {
      showMessage('Error fetching enrollments: ' + error.message, 'error');
    }
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    fetchEnrollments(courseId);
  };

  const handleDelete = async (enrollmentId) => {
    if (window.confirm('Are you sure you want to drop this student from the course?')) {
      try {
        await enrollmentService.dropEnrollment(enrollmentId);
        showMessage('Student dropped successfully', 'success');
        fetchEnrollments(selectedCourse);
      } catch (error) {
        showMessage('Error: ' + error.message, 'error');
      }
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

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin - Enrollment Management
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

        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Select Course</Typography>
          <Select
            value={selectedCourse}
            onChange={handleCourseChange}
            fullWidth
            sx={{
              maxWidth: 400,
              color: '#f8fafc',
              '.MuiSvgIcon-root': { color: '#f8fafc' },
              '.MuiOutlinedInput-notchedOutline': { borderColor: '#f8fafc' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#f8fafc' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f8fafc' }
            }}
          >
            {courses.map(course => (
              <MenuItem key={course.courseId} value={course.courseId}>
                {course.courseCode} - {course.courseName}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Typography variant="h5" sx={{ mb: 2 }}>
          Enrolled Students ({enrollments.length})
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Enrollment #</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Student Name</strong></TableCell>
                <TableCell><strong>Enrollment #</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enrollments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No students enrolled in this course
                  </TableCell>
                </TableRow>
              ) : (
                enrollments.map(enrollment => (
                  <TableRow key={enrollment.enrollmentId}>
                    <TableCell>{enrollment.enrollmentId}</TableCell>
                    <TableCell>{enrollment.email}</TableCell>
                    <TableCell>{enrollment.firstName} {enrollment.lastName}</TableCell>
                    <TableCell>{enrollment.enrollmentNo}</TableCell>
                    <TableCell>
                      <Typography sx={{
                        color: enrollment.status === 'ACTIVE' ? '#388e3c' : '#d32f2f',
                        fontWeight: 'bold'
                      }}>
                        {enrollment.status}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(enrollment.enrollmentId)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}
