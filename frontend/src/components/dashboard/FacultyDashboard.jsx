import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import courseService from '../../services/courseService';
import LoadingSpinner from '../common/LoadingSpinner';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function FacultyDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
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
            SCMS - Faculty Dashboard
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
          Welcome, Prof. {user?.lastName}!
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: '#f8fafc' }}>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            textColor="inherit"
            sx={{
              '& .MuiTabs-indicator': { backgroundColor: '#f8fafc' },
              '& .MuiTab-root': { color: '#f8fafc', opacity: 0.8 },
              '& .Mui-selected': { color: '#f8fafc', opacity: 1 }
            }}
          >
            <Tab label="Courses" />
            <Tab label="Attendance" />
            <Tab label="Assignments" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h5" gutterBottom>
            My Courses
          </Typography>
          <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid size={{ xs: 12, md: 6 }} key={course.courseId}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{course.courseName}</Typography>
                    <Typography color="text.secondary">
                      {course.courseCode} | {course.credits} Credits
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Department: {course.department}
                    </Typography>
                    <Typography variant="body2">
                      Semester: {course.semester}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h5" gutterBottom>
            Mark Attendance
          </Typography>
          <Grid container spacing={2}>
            {courses.map((course) => (
              <Grid size={{ xs: 12, md: 4 }} key={course.courseId}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{course.courseName}</Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => navigate(`/attendance/mark?courseId=${course.courseId}`)}
                    >
                      Mark Attendance
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h5" gutterBottom>
            Assignments Management
          </Typography>
          <Grid container spacing={2}>
            {courses.map((course) => (
              <Grid size={{ xs: 12, md: 4 }} key={course.courseId}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{course.courseName}</Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => navigate(`/faculty/assignments?courseId=${course.courseId}`)}
                    >
                      Manage Assignments (CRUD)
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ mt: 1 }}
                      onClick={() => navigate(`/faculty/grade-submissions?courseId=${course.courseId}`)}
                    >
                      View Submitted / Not Submitted
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Container>
    </Box>
  );
}
