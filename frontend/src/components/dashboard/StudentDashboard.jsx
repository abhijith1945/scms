import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import courseService from '../../services/courseService';
import attendanceService from '../../services/attendanceService';
import assignmentService from '../../services/assignmentService';
import LoadingSpinner from '../common/LoadingSpinner';

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError('');
      const [coursesData, attendanceData, assignmentsData] = await Promise.all([
        courseService.getEnrolledCourses(),
        attendanceService.getMyAttendance(),
        assignmentService.getMyAssignments()
      ]);
      
      console.log('Courses:', coursesData);
      console.log('Attendance:', attendanceData);
      console.log('Assignments:', assignmentsData);
      
      setCourses(coursesData || []);
      setAttendanceData(attendanceData || {});
      setAssignments(assignmentsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            SCMS - Student Dashboard
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.firstName}!
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/student/enrollments')}
          >
            Browse & Enroll Courses
          </Button>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={fetchDashboardData}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Courses Section */}
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          My Courses
        </Typography>
        <Grid container spacing={3}>
          {courses.length > 0 ? (
            courses.map((course) => (
              <Grid item xs={12} md={6} key={course.courseId}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{course.courseName}</Typography>
                    <Typography color="text.secondary">
                      {course.courseCode} | {course.credits} Credits
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Department: {course.department}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1 }}
                        onClick={() => navigate(`/attendance?courseId=${course.courseId}`)}
                      >
                        View Attendance
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/assignments?courseId=${course.courseId}`)}
                      >
                        Assignments
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">
                You are not enrolled in any courses yet.
              </Alert>
            </Grid>
          )}
        </Grid>

        {/* Attendance Overview */}
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          Attendance Overview
        </Typography>
        <Card>
          <CardContent>
            {Object.keys(attendanceData).length > 0 ? (
              Object.entries(attendanceData).map(([courseId, data]) => (
                <Box key={courseId} sx={{ mb: 2 }}>
                  <Typography variant="body1">
                    {data.courseName}: {data.percentage.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Present: {data.present} | Absent: {data.absent} | Total: {data.total}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography>No attendance records found</Typography>
            )}
          </CardContent>
        </Card>

        {/* Assignments Section */}
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          Pending Assignments
        </Typography>
        <Grid container spacing={2}>
          {assignments.filter(a => !a.submitted).map((assignment) => (
            <Grid item xs={12} md={6} key={assignment.assignmentId}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{assignment.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Course: {assignment.courseName}
                  </Typography>
                  <Typography variant="body2">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    Max Marks: {assignment.maxMarks}
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => navigate(`/assignments/${assignment.assignmentId}/submit`)}
                  >
                    Submit
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {assignments.filter(a => !a.submitted).length === 0 && (
            <Grid item xs={12}>
              <Typography>No pending assignments</Typography>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}
