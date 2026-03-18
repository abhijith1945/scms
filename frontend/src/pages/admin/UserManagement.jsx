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

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
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
    userType: 'STUDENT'
  });

  useEffect(() => {
    fetchUsers();
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

  const handleOpenDialog = (userData = null) => {
    if (userData) {
      setEditingId(userData.userId);
      setFormData({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || '',
        address: userData.address || '',
        userType: userData.userType
      });
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
        userType: 'STUDENT'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await userService.updateUser(editingId, formData);
        showMessage('User updated successfully', 'success');
      } else {
        await userService.createUser(formData);
        showMessage('User created successfully', 'success');
      }
      handleCloseDialog();
      fetchUsers();
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
          <Alert severity={messageType} sx={{ mb: 2 }}>
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
            onChange={handleInputChange}
          >
            <MenuItem value="STUDENT">Student</MenuItem>
            <MenuItem value="FACULTY">Faculty</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
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
