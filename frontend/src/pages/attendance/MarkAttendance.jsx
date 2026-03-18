import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import attendanceService from '../../services/attendanceService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function MarkAttendance() {
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const navigate = useNavigate();
  const courseId = searchParams.get('courseId');

  useEffect(() => {
    // In a real app, fetch enrolled students for this course
    // For now, using mock data
    setStudents([
      { userId: 1, firstName: 'John', lastName: 'Doe', enrollmentNo: 'CS2025001' },
      { userId: 2, firstName: 'Jane', lastName: 'Smith', enrollmentNo: 'CS2025002' },
    ]);
    setLoading(false);
  }, [courseId]);

  const handleCheckbox = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSuccess(false);

    try {
      const attendanceList = Object.entries(attendance).map(([studentId, status]) => ({
        studentId: parseInt(studentId),
        courseId: parseInt(courseId),
        date,
        status
      }));

      await attendanceService.bulkMarkAttendance(attendanceList);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/dashboard')}
        sx={{ mb: 2 }}
      >
        Back to Dashboard
      </Button>

      <Typography variant="h4" gutterBottom>
        Mark Attendance
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Attendance marked successfully!
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date"
              value={date ? dayjs(date) : null}
              onChange={(newDate) => setDate(newDate ? newDate.format('YYYY-MM-DD') : '')}
              disableFuture
              slotProps={{
                textField: {
                  sx: { mb: 2 }
                }
              }}
            />
          </LocalizationProvider>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Enrollment No</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell align="center">Present</TableCell>
              <TableCell align="center">Absent</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.userId}>
                <TableCell>{student.enrollmentNo}</TableCell>
                <TableCell>{student.firstName} {student.lastName}</TableCell>
                <TableCell align="center">
                  <Checkbox
                    checked={attendance[student.userId] === 'PRESENT'}
                    onChange={() => handleCheckbox(student.userId, 'PRESENT')}
                  />
                </TableCell>
                <TableCell align="center">
                  <Checkbox
                    checked={attendance[student.userId] === 'ABSENT'}
                    onChange={() => handleCheckbox(student.userId, 'ABSENT')}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={submitting || Object.keys(attendance).length === 0}
        >
          {submitting ? 'Submitting...' : 'Submit Attendance'}
        </Button>
      </Box>
    </Container>
  );
}
