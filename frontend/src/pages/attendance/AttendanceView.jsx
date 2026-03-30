import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Box
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import attendanceService from '../../services/attendanceService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AttendanceView() {
  const [searchParams] = useSearchParams();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0, percentage: 0 });
  const { user } = useAuth();
  const navigate = useNavigate();
  const courseId = searchParams.get('courseId');

  useEffect(() => {
    fetchAttendance();
  }, [courseId]);

  const formatIstDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    }).format(date);
  };

  const formatIstDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    }).format(date);
  };

  const fetchAttendance = async () => {
    try {
      const data = await attendanceService.getStudentAttendance(user.userId, courseId);
      setAttendance(data);
      
      const present = data.filter(a => a.status === 'PRESENT').length;
      const absent = data.filter(a => a.status === 'ABSENT').length;
      const total = data.length;
      const percentage = total > 0 ? (present / total) * 100 : 0;
      
      setStats({ present, absent, total, percentage });
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
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
        My Attendance
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Attendance Summary
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Classes
              </Typography>
              <Typography variant="h5">{stats.total}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Present
              </Typography>
              <Typography variant="h5" color="success.main">
                {stats.present}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Absent
              </Typography>
              <Typography variant="h5" color="error.main">
                {stats.absent}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Percentage
              </Typography>
              <Typography variant="h5" color={stats.percentage >= 75 ? 'success.main' : 'error.main'}>
                {stats.percentage.toFixed(1)}%
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Marked By</TableCell>
              <TableCell>Marked At (IST)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendance.map((record) => (
              <TableRow key={record.attendanceId}>
                <TableCell>{formatIstDate(record.date)}</TableCell>
                <TableCell>
                  <Chip
                    label={record.status}
                    color={record.status === 'PRESENT' ? 'success' : record.status === 'LATE' ? 'warning' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{record.markedByName || 'N/A'}</TableCell>
                <TableCell>
                  {formatIstDateTime(record.markedAt)}
                </TableCell>
              </TableRow>
            ))}
            {attendance.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No attendance records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
