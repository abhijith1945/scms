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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  IconButton,
  AppBar,
  Toolbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import courseService from '../../services/courseService';
import api from '../../services/api';

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [faculty, setFaculty] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    department: '',
    credits: '',
    semester: '',
    maxCapacity: '',
    description: '',
    facultyId: ''
  });

  useEffect(() => {
    fetchCourses();
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await api.get('/api/faculty');
      setFaculty(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showMessage('Error fetching faculty: ' + error.message, 'error');
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (error) {
      showMessage('Error fetching courses: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (courseData = null) => {
    if (courseData) {
      setEditingId(courseData.courseId);
      setFormData({
        courseCode: courseData.courseCode,
        courseName: courseData.courseName,
        department: courseData.department,
        credits: courseData.credits,
        semester: courseData.semester,
        maxCapacity: courseData.maxCapacity,
        description: courseData.description,
        facultyId: courseData.facultyId || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        courseCode: '',
        courseName: '',
        department: '',
        credits: '',
        semester: '',
        maxCapacity: '',
        description: '',
        facultyId: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        facultyId: formData.facultyId === '' ? null : Number(formData.facultyId)
      };

      if (editingId) {
        await courseService.updateCourse(editingId, payload);
        showMessage('Course updated successfully', 'success');
      } else {
        await courseService.createCourse(payload);
        showMessage('Course created successfully', 'success');
      }
      handleCloseDialog();
      fetchCourses();
    } catch (error) {
      showMessage('Error: ' + error.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseService.deleteCourse(id);
        showMessage('Course deleted successfully', 'success');
        fetchCourses();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin - Course Management
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {message && (
          <Alert
            severity={messageType}
            sx={{
              mb: 2,
              '& .MuiAlert-message': { color: '#111827' }
            }}
          >
            {message}
          </Alert>
        )}

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">All Courses ({courses.length})</Typography>
          <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
            Add New Course
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Code</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Department</strong></TableCell>
                <TableCell><strong>Credits</strong></TableCell>
                <TableCell><strong>Sem</strong></TableCell>
                <TableCell><strong>Capacity</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map(course => (
                <TableRow key={course.courseId}>
                  <TableCell>{course.courseCode}</TableCell>
                  <TableCell>{course.courseName}</TableCell>
                  <TableCell>{course.department}</TableCell>
                  <TableCell>{course.credits}</TableCell>
                  <TableCell>{course.semester}</TableCell>
                  <TableCell>{course.maxCapacity}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(course)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(course.courseId)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm" disableEnforceFocus>
        <DialogTitle>
          {editingId ? 'Edit Course' : 'Create New Course'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Course Code"
            name="courseCode"
            value={formData.courseCode}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Course Name"
            name="courseName"
            value={formData.courseName}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Credits"
            name="credits"
            type="number"
            value={formData.credits}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Semester"
            name="semester"
            type="number"
            value={formData.semester}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Max Capacity"
            name="maxCapacity"
            type="number"
            value={formData.maxCapacity}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={3}
          />
          <Select
            name="facultyId"
            value={formData.facultyId}
            onChange={handleInputChange}
            displayEmpty
          >
            <MenuItem value="">-- Select Faculty --</MenuItem>
            {faculty.map((member) => (
              <MenuItem key={member.userId} value={member.userId}>
                {member.firstName} {member.lastName}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
