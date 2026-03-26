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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../context/AuthContext';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';
import studentService from '../../services/studentService';

export default function EnrollmentManagement() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [openEnrollDialog, setOpenEnrollDialog] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
    studentService.getAllStudents().then(setAllStudents).catch(console.error);
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

  const handleAdminEnroll = async () => {
    if (!selectedStudentId || !selectedCourse) return;
    try {
      await enrollmentService.adminEnrollStudent(selectedStudentId, selectedCourse);
      showMessage('Student enrolled successfully', 'success');
      setOpenEnrollDialog(false);
      setSelectedStudentId('');
      fetchEnrollments(selectedCourse);
    } catch (error) {
      showMessage('Error: ' + (error.response?.data?.message || error.message), 'error');
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
          <IconButton color="inherit" onClick={() => navigate('/admin')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, color: 'white' }}>
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
          <Typography variant="h5" sx={{ mb: 2, color: 'black' }}>Select Course</Typography>
          <Select
            value={selectedCourse}
            onChange={handleCourseChange}
            fullWidth
            sx={{ maxWidth: 400 }}
          >
            {courses.map(course => (
              <MenuItem key={course.courseId} value={course.courseId}>
                {course.courseCode} - {course.courseName}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ color: 'black' }}>
            Enrolled Students ({enrollments.length})
          </Typography>
          {selectedCourse && (
            <Button variant="contained" color="primary" onClick={() => setOpenEnrollDialog(true)}>
              Enroll Student
            </Button>
          )}
        </Box>

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
                  <TableRow key={enrollment.enrollment_id}>
                    <TableCell>{enrollment.enrollment_id}</TableCell>
                    <TableCell>{enrollment.email}</TableCell>
                    <TableCell>{enrollment.firstName} {enrollment.lastName}</TableCell>
                    <TableCell>{enrollment.enrollment_no}</TableCell>
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
                        onClick={() => handleDelete(enrollment.enrollment_id)}
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

      <Dialog open={openEnrollDialog} onClose={() => setOpenEnrollDialog(false)} fullWidth maxWidth="sm" disableEnforceFocus>
        <DialogTitle sx={{ color: 'black' }}>Enroll Student in Course</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Select Student</InputLabel>
            <Select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              label="Select Student"
            >
              <MenuItem value="">-- Select Student --</MenuItem>
              {allStudents.map(s => (
                <MenuItem key={s.studentId || s.userId} value={s.studentId || s.userId}>
                  {s.firstName} {s.lastName} ({s.enrollmentNo || s.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenEnrollDialog(false); setSelectedStudentId(''); }}>Cancel</Button>
          <Button onClick={handleAdminEnroll} variant="contained" color="primary" disabled={!selectedStudentId}>
            Enroll
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
