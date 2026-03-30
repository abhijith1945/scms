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
  CircularProgress,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import api from '../../services/api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    userType: 'STUDENT',
    courseIds: [],
    facultyId: null,
    facultyIds: []
  });

  useEffect(() => {
    fetchUsers();
    fetchCourses();
    fetchFaculty();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      showMessage('Error fetching users: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await api.get('/api/courses');
      setCourses(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.log('Error fetching courses:', error);
    }
  };

  const fetchFaculty = async () => {
    try {
      const data = await api.get('/api/faculty');
      setFaculty(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.log('Error fetching faculty:', error);
    }
  };

  const handleOpenDialog = async (userData = null) => {
    // Always refresh latest teacher-course mapping before opening form.
    await Promise.all([fetchCourses(), fetchFaculty()]);

    if (userData) {
      try {
        const details = await userService.getUserById(userData.userId);
        setEditingId(userData.userId);
        setFormData({
          email: details.email,
          firstName: details.firstName,
          lastName: details.lastName,
          phoneNumber: details.phoneNumber || '',
          dateOfBirth: details.dateOfBirth || '',
          gender: details.gender || '',
          address: details.address || '',
          userType: details.userType,
          courseIds: Array.isArray(details.courseIds)
            ? details.courseIds.map((id) => Number(id)).filter((id) => !Number.isNaN(id))
            : [],
          facultyId: details.assignedFacultyId ? Number(details.assignedFacultyId) : null,
          facultyIds: Array.isArray(details.courseFaculties) && details.courseFaculties.length > 0
            ? details.courseFaculties.map((f) => Number(f.facultyId)).filter((id) => !Number.isNaN(id))
            : (details.assignedFacultyId ? [Number(details.assignedFacultyId)] : [])
        });
      } catch (error) {
        showMessage('Error loading user details: ' + error.message, 'error');
        return;
      }
    } else {
      setEditingId(null);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        userType: 'STUDENT',
        courseIds: [],
        facultyId: null,
        facultyIds: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSave = async () => {
    try {
      const normalizedFacultyIds = Array.isArray(formData.facultyIds)
        ? formData.facultyIds.map((id) => Number(id)).filter((id) => !Number.isNaN(id))
        : [];

      const payload = {
        ...formData,
        // Backend currently stores one optional mentor; keep first selected teacher as mentor.
        facultyId: normalizedFacultyIds.length > 0 ? normalizedFacultyIds[0] : null,
        facultyIds: normalizedFacultyIds
      };

      if (editingId) {
        await userService.updateUser(editingId, payload);
        showMessage('User updated successfully', 'success');
      } else {
        await userService.createUser(payload);
        showMessage('User created successfully', 'success');
      }
      handleCloseDialog();
      await Promise.all([fetchUsers(), fetchCourses(), fetchFaculty()]);
    } catch (error) {
      showMessage('Error: ' + error.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(id);
        showMessage('User deleted successfully', 'success');
        fetchUsers();
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

  const handleTeacherToggle = (teacherId) => {
    setFormData((prev) => {
      const teacherIdNum = Number(teacherId);
      const currentFacultyIds = Array.isArray(prev.facultyIds)
        ? prev.facultyIds.map((id) => Number(id)).filter((id) => !Number.isNaN(id))
        : [];
      const isSelected = currentFacultyIds.includes(teacherIdNum);
      const nextFacultyIds = isSelected
        ? currentFacultyIds.filter((id) => id !== teacherIdNum)
        : [...currentFacultyIds, teacherIdNum];

      const nextAllowedCourseIds = courses
        .filter((course) => nextFacultyIds.includes(Number(course.facultyId)))
        .map((course) => Number(course.courseId));

      return {
        ...prev,
        facultyIds: nextFacultyIds,
        facultyId: nextFacultyIds.length > 0 ? nextFacultyIds[0] : null,
        // Keep only courses taught by currently selected teachers.
        courseIds: prev.courseIds.filter((courseId) => nextAllowedCourseIds.includes(Number(courseId)))
      };
    });
  };

  const handleCourseToggle = (courseId) => {
    setFormData((prev) => {
      const courseIdNum = Number(courseId);
      const normalizedCourseIds = Array.isArray(prev.courseIds)
        ? prev.courseIds.map((id) => Number(id)).filter((id) => !Number.isNaN(id))
        : [];
      const exists = normalizedCourseIds.includes(courseIdNum);
      return {
        ...prev,
        courseIds: exists
          ? normalizedCourseIds.filter((id) => id !== courseIdNum)
          : [...normalizedCourseIds, courseIdNum]
      };
    });
  };

  const availableCourses = formData.userType === 'STUDENT'
    ? courses.filter((c) => {
      const selectedFacultyIds = Array.isArray(formData.facultyIds)
        ? formData.facultyIds.map((id) => Number(id)).filter((id) => !Number.isNaN(id))
        : [];
      return selectedFacultyIds.includes(Number(c.facultyId));
    })
    : courses;

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin - User Management
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
          <Typography variant="h5">All Users ({users.length})</Typography>
          <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
            Add New User
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Phone</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(row => (
                <TableRow key={row.userId}>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.firstName} {row.lastName}</TableCell>
                  <TableCell>
                    <Typography sx={{
                      color: row.userType === 'ADMIN' ? '#d32f2f' : row.userType === 'FACULTY' ? '#1976d2' : '#388e3c',
                      fontWeight: 'bold'
                    }}>
                      {row.userType}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.phoneNumber || '-'}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(row)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(row.userId)}
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
          {editingId ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            fullWidth
            disabled={!!editingId}
          />
          <TextField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            fullWidth
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date of Birth"
              value={formData.dateOfBirth ? dayjs(formData.dateOfBirth) : null}
              onChange={(date) => setFormData({...formData, dateOfBirth: date ? date.format('YYYY-MM-DD') : ''})}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'normal'
                }
              }}
              disableFuture
            />
          </LocalizationProvider>
          <Select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            displayEmpty
          >
            <MenuItem value="">-- Select Gender --</MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
          <TextField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={2}
          />
          <Select
            name="userType"
            value={formData.userType}
            onChange={(e) => {
              const nextType = e.target.value;
              setFormData((prev) => ({
                ...prev,
                userType: nextType,
                facultyIds: nextType === 'STUDENT' ? prev.facultyIds : [],
                facultyId: nextType === 'STUDENT' ? prev.facultyId : null,
                courseIds: nextType === 'STUDENT'
                  ? prev.courseIds
                  : prev.courseIds
              }));
            }}
          >
            <MenuItem value="STUDENT">Student</MenuItem>
            <MenuItem value="FACULTY">Faculty</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
          </Select>

          {formData.userType === 'STUDENT' && faculty.length > 0 && (
            <Box>
              <FormLabel sx={{ color: '#f8fafc' }}>Select Teachers (Tick Multiple)</FormLabel>
              <FormGroup sx={{ mt: 1 }}>
                {faculty.map((f) => (
                  <FormControlLabel
                    key={f.userId}
                    control={
                      <Checkbox
                        checked={Array.isArray(formData.facultyIds) && formData.facultyIds.includes(Number(f.userId))}
                        onChange={() => handleTeacherToggle(Number(f.userId))}
                      />
                    }
                    label={`${f.firstName} ${f.lastName}${f.designation ? ` (${f.designation})` : ''}`}
                  />
                ))}
              </FormGroup>
            </Box>
          )}

          {courses.length > 0 && (
            <Box>
              <FormLabel sx={{ color: '#f8fafc' }}>
                {formData.userType === 'STUDENT' ? 'Select Courses for Chosen Teacher' : 'Assign Courses'}
              </FormLabel>

              {formData.userType === 'STUDENT' && (!Array.isArray(formData.facultyIds) || formData.facultyIds.length === 0) && (
                <Typography variant="body2" sx={{ mt: 1, color: '#cbd5e1' }}>
                  First select one or more teachers, then tick the subjects taught by them.
                </Typography>
              )}

              {availableCourses.length === 0 && (
                <Typography variant="body2" sx={{ mt: 1, color: '#cbd5e1' }}>
                  No courses found for the selected teacher.
                </Typography>
              )}

              <FormGroup sx={{ mt: 1 }}>
                {availableCourses.map((c) => (
                  <FormControlLabel
                    key={c.courseId}
                    control={
                      <Checkbox
                        checked={formData.courseIds.includes(Number(c.courseId))}
                        onChange={() => handleCourseToggle(Number(c.courseId))}
                        disabled={formData.userType === 'STUDENT' && (!Array.isArray(formData.facultyIds) || formData.facultyIds.length === 0)}
                      />
                    }
                    label={`${c.courseName} (${c.courseCode})`}
                  />
                ))}
              </FormGroup>
            </Box>
          )}

          {formData.userType === 'STUDENT' && (
            <Typography variant="body2" color="text.secondary">
              Subject teachers are auto-assigned from the selected courses. A student can have multiple teachers.
            </Typography>
          )}
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
