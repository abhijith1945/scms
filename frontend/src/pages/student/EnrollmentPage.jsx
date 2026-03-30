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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';

export default function EnrollmentPage() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoursesAndEnrollments();
  }, []);

  const fetchCoursesAndEnrollments = async () => {
    try {
      setLoading(true);
      const [allCourses, enrolledCourses] = await Promise.all([
        courseService.getAllCourses(),
        enrollmentService.getMyEnrollments()
      ]);
      setCourses(allCourses);
      setEnrollments(enrolledCourses);
      const enrolledIds = enrolledCourses.map(c => c.courseId);
      setEnrolledCourseIds(enrolledIds);
    } catch (error) {
      showMessage('Error fetching courses: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEnrollDialog = (course) => {
    setSelectedCourse(course);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCourse(null);
  };

  const handleConfirmEnroll = async () => {
    try {
      await enrollmentService.enrollCourse(selectedCourse.courseId);
      showMessage('Successfully enrolled in ' + selectedCourse.courseName, 'success');
      fetchCoursesAndEnrollments();
      handleCloseDialog();
    } catch (error) {
      showMessage('Error enrolling in course: ' + error.message, 'error');
    }
  };

  const handleDropCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to drop this course?')) {
      try {
        const enrollment = enrollments.find((e) => e.courseId === courseId && e.status === 'ACTIVE');
        const enrollmentId = enrollment?.enrollmentId;
        if (enrollmentId) {
          await enrollmentService.dropEnrollment(enrollmentId);
          showMessage('Successfully dropped course', 'success');
          fetchCoursesAndEnrollments();
        }
      } catch (error) {
        showMessage('Error dropping course: ' + error.message, 'error');
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

  const availableCourses = courses.filter(c => !enrolledCourseIds.includes(c.courseId));

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Student - Course Enrollment
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

        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2' }}>
          📚 Enrolled Courses ({enrolledCourseIds.length})
        </Typography>

        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Course Code</strong></TableCell>
                <TableCell><strong>Course Name</strong></TableCell>
                <TableCell><strong>Department</strong></TableCell>
                <TableCell align="center"><strong>Credits</strong></TableCell>
                <TableCell align="center"><strong>Capacity</strong></TableCell>
                <TableCell align="center"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses
                .filter(c => enrolledCourseIds.includes(c.courseId))
                .length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No enrolled courses yet
                  </TableCell>
                </TableRow>
              ) : (
                courses
                  .filter(c => enrolledCourseIds.includes(c.courseId))
                  .map(course => (
                    <TableRow key={course.courseId}>
                      <TableCell><strong>{course.courseCode}</strong></TableCell>
                      <TableCell>{course.courseName}</TableCell>
                      <TableCell>{course.department}</TableCell>
                      <TableCell align="center">{course.credits}</TableCell>
                      <TableCell align="center">{course.maxCapacity}</TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => handleDropCourse(course.courseId)}
                        >
                          Drop
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#388e3c' }}>
          ➕ Available Courses to Enroll ({availableCourses.length})
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Course Code</strong></TableCell>
                <TableCell><strong>Course Name</strong></TableCell>
                <TableCell><strong>Department</strong></TableCell>
                <TableCell align="center"><strong>Credits</strong></TableCell>
                <TableCell align="center"><strong>Capacity</strong></TableCell>
                <TableCell align="center"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {availableCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    You are enrolled in all available courses
                  </TableCell>
                </TableRow>
              ) : (
                availableCourses.map(course => (
                  <TableRow key={course.courseId}>
                    <TableCell><strong>{course.courseCode}</strong></TableCell>
                    <TableCell>{course.courseName}</TableCell>
                    <TableCell>{course.department}</TableCell>
                    <TableCell align="center">{course.credits}</TableCell>
                    <TableCell align="center">{course.maxCapacity}</TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleOpenEnrollDialog(course)}
                      >
                        Enroll
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      <Dialog open={openDialog} onClose={handleCloseDialog} disableEnforceFocus>
        <DialogTitle>Confirm Enrollment</DialogTitle>
        <DialogContent>
          {selectedCourse && (
            <Box sx={{ pt: 2 }}>
              <Typography><strong>Course:</strong> {selectedCourse.courseCode}</Typography>
              <Typography><strong>Name:</strong> {selectedCourse.courseName}</Typography>
              <Typography><strong>Department:</strong> {selectedCourse.department}</Typography>
              <Typography sx={{ mt: 2 }}>Are you sure you want to enroll in this course?</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleConfirmEnroll} variant="contained" color="primary">
            Confirm Enrollment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
