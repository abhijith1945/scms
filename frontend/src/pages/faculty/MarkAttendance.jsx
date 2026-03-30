import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  TextField,
  IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../../context/AuthContext';
import attendanceService from '../../services/attendanceService';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';

export default function MarkAttendance() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse && selectedDate && enrollments.length > 0) {
      loadSavedAttendance(selectedCourse, selectedDate, enrollments);
    }
  }, [selectedCourse, selectedDate, enrollments]);

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
      setEnrollments(data || []);
      
      // Initialize attendance data
      const newAttendanceData = {};
      (data || []).forEach(enrollment => {
        newAttendanceData[enrollment.enrollmentId] = false;
      });
      setAttendanceData(newAttendanceData);
    } catch (error) {
      showMessage('Error fetching enrollments: ' + error.message, 'error');
    }
  };

  const loadSavedAttendance = async (courseId, date, enrollmentRows) => {
    try {
      const savedRecords = await attendanceService.getCourseAttendanceByDate(courseId, date);
      const attendanceByStudentId = new Map(
        (savedRecords || []).map((record) => [Number(record.studentId), record.status])
      );

      const hydratedAttendance = {};
      (enrollmentRows || []).forEach((enrollment) => {
        const status = attendanceByStudentId.get(Number(enrollment.studentId));
        hydratedAttendance[enrollment.enrollmentId] = status === 'PRESENT';
      });

      setAttendanceData(hydratedAttendance);
    } catch (error) {
      showMessage('Error loading saved attendance: ' + error.message, 'error');
    }
  };

  const handleCourseChange = (e) => {
    const courseId = Number(e.target.value);
    setSelectedCourse(courseId);
    fetchEnrollments(courseId);
  };

  const handleAttendanceChange = (enrollmentId) => {
    setAttendanceData({
      ...attendanceData,
      [enrollmentId]: !attendanceData[enrollmentId]
    });
  };

  const handleMarkAll = () => {
    const newData = {};
    enrollments.forEach(enrollment => {
      newData[enrollment.enrollmentId] = true;
    });
    setAttendanceData(newData);
  };

  const handleUnMarkAll = () => {
    const newData = {};
    enrollments.forEach(enrollment => {
      newData[enrollment.enrollmentId] = false;
    });
    setAttendanceData(newData);
  };

  const handleSaveAttendance = async () => {
    try {
      const attendanceList = enrollments.map(enrollment => ({
        studentId: enrollment.studentId,
        courseId: selectedCourse,
        date: selectedDate,
        status: attendanceData[enrollment.enrollmentId] ? 'PRESENT' : 'ABSENT'
      }));

      await attendanceService.bulkMarkAttendance(attendanceList);
      showMessage('Attendance saved successfully', 'success');
    } catch (error) {
      showMessage('Error saving attendance: ' + error.message, 'error');
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

  const presentCount = Object.values(attendanceData).filter(v => v).length;
  const absentCount = enrollments.length - presentCount;

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Faculty - Mark Attendance
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

        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
            <FormControl
              sx={{
                minWidth: 250,
                '& .MuiInputLabel-root': { color: '#f8fafc' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#f8fafc' },
                '& .MuiOutlinedInput-root': { color: '#f8fafc' },
                '& .MuiSvgIcon-root': { color: '#f8fafc' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#f8fafc' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#f8fafc' },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f8fafc' }
              }}
            >
              <InputLabel>Course</InputLabel>
              <Select value={selectedCourse} onChange={handleCourseChange} label="Course">
              {courses.map(course => (
                <MenuItem key={course.courseId} value={course.courseId}>
                  {course.courseCode} - {course.courseName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date"
              value={selectedDate ? dayjs(selectedDate) : null}
              onChange={(date) => setSelectedDate(date ? date.format('YYYY-MM-DD') : '')}
              disableFuture
              slotProps={{
                day: {
                  sx: {
                    color: '#f8fafc',
                    '&.Mui-selected': {
                      backgroundColor: '#2563eb',
                      color: '#f8fafc'
                    },
                    '&.Mui-selected:hover': {
                      backgroundColor: '#1d4ed8'
                    }
                  }
                },
                popper: {
                  sx: {
                    '& .MuiPaper-root': {
                      backgroundColor: '#0f172a',
                      color: '#f8fafc'
                    },
                    '& .MuiPickersLayout-root': { color: '#f8fafc' },
                    '& .MuiPickersLayout-contentWrapper': { color: '#f8fafc' },
                    '& .MuiPickersCalendarHeader-label': { color: '#f8fafc' },
                    '& .MuiPickersArrowSwitcher-button': { color: '#f8fafc' },
                    '& .MuiPickersArrowSwitcher-root button': { color: '#f8fafc' },
                    '& .MuiDayCalendar-weekDayLabel': { color: '#cbd5e1' },
                    '& .MuiPickersDay-root': { color: '#f8fafc !important' },
                    '& .MuiPickersDay-root.Mui-selected': {
                      backgroundColor: '#2563eb !important',
                      color: '#f8fafc !important'
                    }
                  }
                },
                textField: {
                  sx: {
                    minWidth: 150,
                    '& .MuiInputLabel-root': { color: '#f8fafc' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#f8fafc' },
                    '& .MuiOutlinedInput-input': { color: '#f8fafc' },
                    '& .MuiInputBase-input': { color: '#f8fafc !important' },
                    '& .MuiPickersInputBase-root': {
                      color: '#f8fafc !important'
                    },
                    '& .MuiPickersInputBase-root *': {
                      color: '#f8fafc !important',
                      WebkitTextFillColor: '#f8fafc !important'
                    },
                    '& .MuiPickersSectionList-root': {
                      color: '#f8fafc !important'
                    },
                    '& .MuiPickersSectionList-section': {
                      color: '#f8fafc !important',
                      WebkitTextFillColor: '#f8fafc !important'
                    },
                    '& input': {
                      color: '#f8fafc !important',
                      WebkitTextFillColor: '#f8fafc !important'
                    },
                    '& input::placeholder': {
                      color: '#f8fafc !important',
                      opacity: 1
                    },
                    '& .MuiInputBase-root': {
                      color: '#f8fafc !important'
                    },
                    '& .MuiSvgIcon-root': { color: '#f8fafc' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#f8fafc' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#f8fafc' },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f8fafc' }
                  }
                }
              }}
            />
          </LocalizationProvider>
        </Box>

        <Typography variant="body2" sx={{ mb: 2, color: '#f8fafc' }}>
          Selected Date (IST): <strong>{selectedDate}</strong>
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" sx={{ color: '#f8fafc' }}>
              📊 Present: <strong style={{ color: '#388e3c' }}>{presentCount}</strong> | 
              Absent: <strong style={{ color: '#d32f2f' }}>{absentCount}</strong> | 
              Total: <strong>{enrollments.length}</strong>
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" variant="outlined" onClick={handleMarkAll}>
              Mark All
            </Button>
            <Button size="small" variant="outlined" color="error" onClick={handleUnMarkAll}>
              Clear All
            </Button>
            <Button 
              startIcon={<SaveIcon />}
              variant="contained" 
              color="primary" 
              onClick={handleSaveAttendance}
            >
              Save Attendance
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell align="center"><strong>Present</strong></TableCell>
                <TableCell><strong>Roll No</strong></TableCell>
                <TableCell><strong>Student Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enrollments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No students enrolled
                  </TableCell>
                </TableRow>
              ) : (
                enrollments.map(enrollment => (
                  <TableRow key={enrollment.enrollmentId}>
                    <TableCell align="center">
                      <Checkbox
                        checked={attendanceData[enrollment.enrollmentId] || false}
                        onChange={() => handleAttendanceChange(enrollment.enrollmentId)}
                      />
                    </TableCell>
                    <TableCell>{enrollment.enrollmentNo}</TableCell>
                    <TableCell>
                      {enrollment.firstName} {enrollment.lastName}
                    </TableCell>
                    <TableCell>{enrollment.email}</TableCell>
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
