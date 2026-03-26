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
  FormControl,
  InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import facultyService from '../../services/facultyService';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const emptyForm = {
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    enrollmentNo: '',
    program: '',
    department: '',
    enrollmentYear: '',
    currentSem: '',
    mentorFacultyId: ''
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    Promise.all([fetchStudents(), fetchFaculty()]);
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentService.getAllStudents();
      setStudents(data);
    } catch (error) {
      showMessage('Error fetching students: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculty = async () => {
    try {
      const data = await facultyService.getAllFaculty();
      setFaculty(data);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const handleOpenDialog = (studentData = null) => {
    if (studentData) {
      setEditingId(studentData.studentId || studentData.userId);
      setFormData({
        email: studentData.email || '',
        firstName: studentData.firstName || '',
        lastName: studentData.lastName || '',
        phoneNumber: studentData.phoneNumber || '',
        enrollmentNo: studentData.enrollmentNo || '',
        program: studentData.program || '',
        department: studentData.department || '',
        enrollmentYear: studentData.enrollmentYear || '',
        currentSem: studentData.currentSem || '',
        mentorFacultyId: studentData.mentorFacultyId || ''
      });
    } else {
      setEditingId(null);
      setFormData(emptyForm);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await studentService.updateStudent(editingId, {
          enrollmentNo: formData.enrollmentNo,
          program: formData.program,
          department: formData.department,
          currentSem: formData.currentSem,
          mentorFacultyId: formData.mentorFacultyId || null
        });
        showMessage('Student updated successfully', 'success');
      } else {
        await studentService.createStudent(formData);
        showMessage('Student created successfully', 'success');
      }
      handleCloseDialog();
      fetchStudents();
    } catch (error) {
      showMessage('Error: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentService.deleteStudent(id);
        showMessage('Student deleted successfully', 'success');
        fetchStudents();
      } catch (error) {
        showMessage('Error: ' + (error.response?.data?.message || error.message), 'error');
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getFacultyName = (facultyId) => {
    const f = faculty.find(f => f.facultyId === facultyId || f.userId === facultyId);
    return f ? `${f.firstName} ${f.lastName}` : '-';
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
            Admin - Student Management
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

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ color: 'black' }}>All Students ({students.length})</Typography>
          <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
            Add New Student
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ color: 'black' }}><strong>Enrollment No</strong></TableCell>
                <TableCell sx={{ color: 'black' }}><strong>Name</strong></TableCell>
                <TableCell sx={{ color: 'black' }}><strong>Email</strong></TableCell>
                <TableCell sx={{ color: 'black' }}><strong>Program</strong></TableCell>
                <TableCell sx={{ color: 'black' }}><strong>Sem</strong></TableCell>
                <TableCell sx={{ color: 'black' }}><strong>Mentor Faculty</strong></TableCell>
                <TableCell align="center" sx={{ color: 'black' }}><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ color: 'black' }}>No students found</TableCell>
                </TableRow>
              ) : (
                students.map(row => (
                  <TableRow key={row.studentId || row.userId}>
                    <TableCell sx={{ color: 'black' }}>{row.enrollmentNo || '-'}</TableCell>
                    <TableCell sx={{ color: 'black' }}>{row.firstName} {row.lastName}</TableCell>
                    <TableCell sx={{ color: 'black' }}>{row.email}</TableCell>
                    <TableCell sx={{ color: 'black' }}>{row.program || '-'}</TableCell>
                    <TableCell sx={{ color: 'black' }}>{row.currentSem || '-'}</TableCell>
                    <TableCell sx={{ color: 'black' }}>{row.mentorFacultyId ? getFacultyName(row.mentorFacultyId) : '-'}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleOpenDialog(row)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(row.studentId || row.userId)} color="error">
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

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm" disableEnforceFocus>
        <DialogTitle sx={{ color: 'black' }}>
          {editingId ? 'Edit Student' : 'Create New Student'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {!editingId && (
            <>
              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
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
              <TextField
                label="Enrollment Year"
                name="enrollmentYear"
                type="number"
                value={formData.enrollmentYear}
                onChange={handleInputChange}
                fullWidth
              />
            </>
          )}
          <TextField
            label="Enrollment No"
            name="enrollmentNo"
            value={formData.enrollmentNo}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Program"
            name="program"
            value={formData.program}
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
            label="Current Semester"
            name="currentSem"
            type="number"
            value={formData.currentSem}
            onChange={handleInputChange}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Mentor Faculty</InputLabel>
            <Select
              name="mentorFacultyId"
              value={formData.mentorFacultyId}
              onChange={handleInputChange}
              label="Mentor Faculty"
            >
              <MenuItem value="">-- None --</MenuItem>
              {faculty.map(f => (
                <MenuItem key={f.facultyId || f.userId} value={f.facultyId || f.userId}>
                  {f.firstName} {f.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
