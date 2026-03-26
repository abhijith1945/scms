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
  IconButton,
  AppBar,
  Toolbar,
  Alert,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import facultyService from '../../services/facultyService';

export default function FacultyManagement() {
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
    employeeId: '',
    department: '',
    designation: '',
    specialization: ''
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const data = await facultyService.getAllFaculty();
      setFaculty(data);
    } catch (error) {
      showMessage('Error fetching faculty: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (facultyData = null) => {
    if (facultyData) {
      setEditingId(facultyData.facultyId || facultyData.userId);
      setFormData({
        email: facultyData.email || '',
        firstName: facultyData.firstName || '',
        lastName: facultyData.lastName || '',
        phoneNumber: facultyData.phoneNumber || '',
        employeeId: facultyData.employeeId || '',
        department: facultyData.department || '',
        designation: facultyData.designation || '',
        specialization: facultyData.specialization || ''
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
        await facultyService.updateFaculty(editingId, {
          employeeId: formData.employeeId,
          department: formData.department,
          designation: formData.designation,
          specialization: formData.specialization
        });
        showMessage('Faculty updated successfully', 'success');
      } else {
        await facultyService.createFaculty(formData);
        showMessage('Faculty created successfully', 'success');
      }
      handleCloseDialog();
      fetchFaculty();
    } catch (error) {
      showMessage('Error: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        await facultyService.deleteFaculty(id);
        showMessage('Faculty deleted successfully', 'success');
        fetchFaculty();
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

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate('/admin')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, color: 'white' }}>
            Admin - Faculty Management
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
          <Typography variant="h5" sx={{ color: 'black' }}>All Faculty ({faculty.length})</Typography>
          <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
            Add New Faculty
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ color: 'black' }}><strong>Employee ID</strong></TableCell>
                <TableCell sx={{ color: 'black' }}><strong>Name</strong></TableCell>
                <TableCell sx={{ color: 'black' }}><strong>Email</strong></TableCell>
                <TableCell sx={{ color: 'black' }}><strong>Department</strong></TableCell>
                <TableCell sx={{ color: 'black' }}><strong>Designation</strong></TableCell>
                <TableCell sx={{ color: 'black' }}><strong>Specialization</strong></TableCell>
                <TableCell align="center" sx={{ color: 'black' }}><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {faculty.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ color: 'black' }}>No faculty found</TableCell>
                </TableRow>
              ) : (
                faculty.map(row => (
                  <TableRow key={row.facultyId || row.userId}>
                    <TableCell sx={{ color: 'black' }}>{row.employeeId || '-'}</TableCell>
                    <TableCell sx={{ color: 'black' }}>{row.firstName} {row.lastName}</TableCell>
                    <TableCell sx={{ color: 'black' }}>{row.email}</TableCell>
                    <TableCell sx={{ color: 'black' }}>{row.department || '-'}</TableCell>
                    <TableCell sx={{ color: 'black' }}>{row.designation || '-'}</TableCell>
                    <TableCell sx={{ color: 'black' }}>{row.specialization || '-'}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleOpenDialog(row)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(row.facultyId || row.userId)} color="error">
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
          {editingId ? 'Edit Faculty' : 'Create New Faculty'}
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
            </>
          )}
          <TextField
            label="Employee ID"
            name="employeeId"
            value={formData.employeeId}
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
            label="Designation"
            name="designation"
            value={formData.designation}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Specialization"
            name="specialization"
            value={formData.specialization}
            onChange={handleInputChange}
            fullWidth
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
