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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import assignmentService from '../../services/assignmentService';
import courseService from '../../services/courseService';

export default function AssignmentCreate() {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxMarks: ''
  });
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
        fetchAssignments(data[0].courseId);
      }
    } catch (error) {
      showMessage('Error fetching courses: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (courseId) => {
    try {
      const data = await assignmentService.getAssignmentsByCourse(courseId);
      setAssignments(data);
    } catch (error) {
      showMessage('Error fetching assignments: ' + error.message, 'error');
    }
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    fetchAssignments(courseId);
  };

  const handleOpenDialog = (assignment = null) => {
    if (assignment) {
      setEditingId(assignment.assignment_id);
      setFormData({
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.due_date ? assignment.due_date.split('T')[0] : '',
        maxMarks: assignment.max_marks
      });
    } else {
      setEditingId(null);
      setFormData({ title: '', description: '', dueDate: '', maxMarks: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({ title: '', description: '', dueDate: '', maxMarks: '' });
  };

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.description || !formData.dueDate || !formData.maxMarks) {
        showMessage('Please fill all fields', 'error');
        return;
      }

      const assignmentPayload = {
        course_id: selectedCourse,
        title: formData.title,
        description: formData.description,
        due_date: formData.dueDate,
        max_marks: parseInt(formData.maxMarks)
      };

      if (editingId) {
        await assignmentService.updateAssignment(editingId, assignmentPayload);
        showMessage('Assignment updated successfully', 'success');
      } else {
        await assignmentService.createAssignment(assignmentPayload);
        showMessage('Assignment created successfully', 'success');
      }
      fetchAssignments(selectedCourse);
      handleCloseDialog();
    } catch (error) {
      showMessage('Error: ' + error.message, 'error');
    }
  };

  const handleDelete = async (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await assignmentService.deleteAssignment(assignmentId);
        showMessage('Assignment deleted successfully', 'success');
        fetchAssignments(selectedCourse);
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
            Faculty - Manage Assignments
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

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>Select Course</InputLabel>
            <Select value={selectedCourse} onChange={handleCourseChange} label="Select Course">
              {courses.map(course => (
                <MenuItem key={course.courseId} value={course.courseId}>
                  {course.courseCode} - {course.courseName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
            + New Assignment
          </Button>
        </Box>

        <Typography variant="h5" sx={{ mb: 2 }}>
          Assignments ({assignments.length})
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Title</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Due Date</strong></TableCell>
                <TableCell align="center"><strong>Max Marks</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No assignments yet
                  </TableCell>
                </TableRow>
              ) : (
                assignments.map(assignment => (
                  <TableRow key={assignment.assignment_id}>
                    <TableCell><strong>{assignment.title}</strong></TableCell>
                    <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {assignment.description}
                    </TableCell>
                    <TableCell>{new Date(assignment.due_date).toLocaleDateString()}</TableCell>
                    <TableCell align="center">{assignment.max_marks}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(assignment)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(assignment.assignment_id)}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth disableEnforceFocus>
        <DialogTitle>{editingId ? 'Edit Assignment' : 'Create New Assignment'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Due Date"
              value={formData.dueDate ? dayjs(formData.dueDate) : null}
              onChange={(date) => setFormData({ ...formData, dueDate: date ? date.format('YYYY-MM-DD') : '' })}
              disablePast
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: { mb: 2 }
                }
              }}
            />
          </LocalizationProvider>
          <TextField
            fullWidth
            label="Max Marks"
            type="number"
            value={formData.maxMarks}
            onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
            inputProps={{ min: 0 }}
          />
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
