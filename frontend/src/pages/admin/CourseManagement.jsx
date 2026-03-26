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
  CircularProgress,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../context/AuthContext';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';
import facultyService from '../../services/facultyService';
import studentService from '../../services/studentService';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Faculty assignment state
  const [selectedCourseForFaculty, setSelectedCourseForFaculty] = useState('');
  const [courseFaculty, setCourseFaculty] = useState([]);
  const [allFaculty, setAllFaculty] = useState([]);
  const [selectedFacultyToAdd, setSelectedFacultyToAdd] = useState('');
  const [facultyLoading, setFacultyLoading] = useState(false);

  // Student enrollment state
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState('');
  const [courseEnrollments, setCourseEnrollments] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentToEnroll, setSelectedStudentToEnroll] = useState('');
  const [enrollLoading, setEnrollLoading] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    department: '',
    credits: '',
    semester: '',
    maxCapacity: '',
    description: ''
  });

  useEffect(() => {
    fetchCourses();
    facultyService.getAllFaculty().then(setAllFaculty).catch(console.error);
    studentService.getAllStudents().then(setAllStudents).catch(console.error);
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (error) {
      showMessage('Error fetching courses: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (courseData = null) => {
    if (courseData) {
      setEditingId(courseData.courseId);
      setFormData({
        courseCode: courseData.courseCode,
        courseName: courseData.courseName,
        department: courseData.department,
        credits: courseData.credits,
        semester: courseData.semester,
        maxCapacity: courseData.maxCapacity,
        description: courseData.description
      });
    } else {
      setEditingId(null);
      setFormData({
        courseCode: '',
        courseName: '',
        department: '',
        credits: '',
        semester: '',
        maxCapacity: '',
        description: ''
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
        await courseService.updateCourse(editingId, formData);
        showMessage('Course updated successfully', 'success');
      } else {
        await courseService.createCourse(formData);
        showMessage('Course created successfully', 'success');
      }
      handleCloseDialog();
      fetchCourses();
    } catch (error) {
      showMessage('Error: ' + error.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseService.deleteCourse(id);
        showMessage('Course deleted successfully', 'success');
        fetchCourses();
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

  const handleCourseForFacultyChange = async (courseId) => {
    setSelectedCourseForFaculty(courseId);
    if (!courseId) return;
    setFacultyLoading(true);
    try {
      const data = await courseService.getCourseFaculty(courseId);
      setCourseFaculty(data);
    } catch (error) {
      showMessage('Error fetching course faculty: ' + error.message, 'error');
    } finally {
      setFacultyLoading(false);
    }
  };

  const handleAssignFaculty = async () => {
    if (!selectedCourseForFaculty || !selectedFacultyToAdd) return;
    try {
      await courseService.assignFacultyToCourse(selectedCourseForFaculty, selectedFacultyToAdd);
      showMessage('Faculty assigned successfully', 'success');
      setSelectedFacultyToAdd('');
      handleCourseForFacultyChange(selectedCourseForFaculty);
    } catch (error) {
      showMessage('Error: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleRemoveFaculty = async (facultyId) => {
    if (!window.confirm('Remove this faculty from the course?')) return;
    try {
      await courseService.removeFacultyFromCourse(selectedCourseForFaculty, facultyId);
      showMessage('Faculty removed successfully', 'success');
      handleCourseForFacultyChange(selectedCourseForFaculty);
    } catch (error) {
      showMessage('Error: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleCourseForEnrollChange = async (courseId) => {
    setSelectedCourseForEnroll(courseId);
    if (!courseId) return;
    setEnrollLoading(true);
    try {
      const data = await enrollmentService.getCourseEnrollments(courseId);
      setCourseEnrollments(data);
    } catch (error) {
      showMessage('Error fetching enrollments: ' + error.message, 'error');
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleEnrollStudent = async () => {
    if (!selectedCourseForEnroll || !selectedStudentToEnroll) return;
    try {
      await enrollmentService.adminEnrollStudent(selectedStudentToEnroll, selectedCourseForEnroll);
      showMessage('Student enrolled successfully', 'success');
      setSelectedStudentToEnroll('');
      handleCourseForEnrollChange(selectedCourseForEnroll);
    } catch (error) {
      showMessage('Error: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleDropEnrollment = async (enrollmentId) => {
    if (!window.confirm('Drop this student from the course?')) return;
    try {
      await enrollmentService.dropEnrollment(enrollmentId);
      showMessage('Student dropped successfully', 'success');
      handleCourseForEnrollChange(selectedCourseForEnroll);
    } catch (error) {
      showMessage('Error: ' + (error.response?.data?.message || error.message), 'error');
    }
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
            Admin - Course Management
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

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="Courses" />
            <Tab label="Faculty Assignment" />
            <Tab label="Student Enrollment" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ color: 'black' }}>All Courses ({courses.length})</Typography>
          <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
            Add New Course
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Code</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Department</strong></TableCell>
                <TableCell><strong>Credits</strong></TableCell>
                <TableCell><strong>Sem</strong></TableCell>
                <TableCell><strong>Capacity</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map(course => (
                <TableRow key={course.courseId}>
                  <TableCell>{course.courseCode}</TableCell>
                  <TableCell>{course.courseName}</TableCell>
                  <TableCell>{course.department}</TableCell>
                  <TableCell>{course.credits}</TableCell>
                  <TableCell>{course.semester}</TableCell>
                  <TableCell>{course.maxCapacity}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(course)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(course.courseId)}
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
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h5" sx={{ color: 'black', mb: 2 }}>Faculty Assignment</Typography>
          <FormControl fullWidth sx={{ mb: 3, maxWidth: 500 }}>
            <InputLabel>Select Course</InputLabel>
            <Select
              value={selectedCourseForFaculty}
              onChange={(e) => handleCourseForFacultyChange(e.target.value)}
              label="Select Course"
            >
              <MenuItem value="">-- Select a Course --</MenuItem>
              {courses.map(c => (
                <MenuItem key={c.courseId} value={c.courseId}>
                  {c.courseCode} - {c.courseName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedCourseForFaculty && (
            <>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                <FormControl sx={{ minWidth: 300 }}>
                  <InputLabel>Add Faculty</InputLabel>
                  <Select
                    value={selectedFacultyToAdd}
                    onChange={(e) => setSelectedFacultyToAdd(e.target.value)}
                    label="Add Faculty"
                  >
                    <MenuItem value="">-- Select Faculty --</MenuItem>
                    {allFaculty.map(f => (
                      <MenuItem key={f.facultyId || f.userId} value={f.facultyId || f.userId}>
                        {f.firstName} {f.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="contained" onClick={handleAssignFaculty} disabled={!selectedFacultyToAdd}>
                  Assign Faculty
                </Button>
              </Box>

              {facultyLoading ? <CircularProgress size={24} /> : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ color: 'black' }}><strong>Name</strong></TableCell>
                        <TableCell sx={{ color: 'black' }}><strong>Email</strong></TableCell>
                        <TableCell sx={{ color: 'black' }}><strong>Department</strong></TableCell>
                        <TableCell align="center" sx={{ color: 'black' }}><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {courseFaculty.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ color: 'black' }}>No faculty assigned to this course</TableCell>
                        </TableRow>
                      ) : (
                        courseFaculty.map(f => (
                          <TableRow key={f.facultyId || f.userId}>
                            <TableCell sx={{ color: 'black' }}>{f.firstName} {f.lastName}</TableCell>
                            <TableCell sx={{ color: 'black' }}>{f.email}</TableCell>
                            <TableCell sx={{ color: 'black' }}>{f.department || '-'}</TableCell>
                            <TableCell align="center">
                              <IconButton size="small" color="error" onClick={() => handleRemoveFaculty(f.facultyId || f.userId)}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h5" sx={{ color: 'black', mb: 2 }}>Student Enrollment</Typography>
          <FormControl fullWidth sx={{ mb: 3, maxWidth: 500 }}>
            <InputLabel>Select Course</InputLabel>
            <Select
              value={selectedCourseForEnroll}
              onChange={(e) => handleCourseForEnrollChange(e.target.value)}
              label="Select Course"
            >
              <MenuItem value="">-- Select a Course --</MenuItem>
              {courses.map(c => (
                <MenuItem key={c.courseId} value={c.courseId}>
                  {c.courseCode} - {c.courseName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedCourseForEnroll && (
            <>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                <FormControl sx={{ minWidth: 300 }}>
                  <InputLabel>Enroll Student</InputLabel>
                  <Select
                    value={selectedStudentToEnroll}
                    onChange={(e) => setSelectedStudentToEnroll(e.target.value)}
                    label="Enroll Student"
                  >
                    <MenuItem value="">-- Select Student --</MenuItem>
                    {allStudents.map(s => (
                      <MenuItem key={s.studentId || s.userId} value={s.studentId || s.userId}>
                        {s.firstName} {s.lastName} ({s.enrollmentNo || s.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="contained" onClick={handleEnrollStudent} disabled={!selectedStudentToEnroll}>
                  Enroll Student
                </Button>
              </Box>

              {enrollLoading ? <CircularProgress size={24} /> : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ color: 'black' }}><strong>Student Name</strong></TableCell>
                        <TableCell sx={{ color: 'black' }}><strong>Email</strong></TableCell>
                        <TableCell sx={{ color: 'black' }}><strong>Enrollment No</strong></TableCell>
                        <TableCell sx={{ color: 'black' }}><strong>Status</strong></TableCell>
                        <TableCell align="center" sx={{ color: 'black' }}><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {courseEnrollments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ color: 'black' }}>No students enrolled in this course</TableCell>
                        </TableRow>
                      ) : (
                        courseEnrollments.map(e => (
                          <TableRow key={e.enrollment_id}>
                            <TableCell sx={{ color: 'black' }}>{e.firstName} {e.lastName}</TableCell>
                            <TableCell sx={{ color: 'black' }}>{e.email}</TableCell>
                            <TableCell sx={{ color: 'black' }}>{e.enrollment_no || '-'}</TableCell>
                            <TableCell sx={{ color: e.status === 'ACTIVE' ? '#388e3c' : '#d32f2f', fontWeight: 'bold' }}>{e.status}</TableCell>
                            <TableCell align="center">
                              <IconButton size="small" color="error" onClick={() => handleDropEnrollment(e.enrollment_id)}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </TabPanel>
      </Container>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm" disableEnforceFocus>
        <DialogTitle>
          {editingId ? 'Edit Course' : 'Create New Course'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Course Code"
            name="courseCode"
            value={formData.courseCode}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Course Name"
            name="courseName"
            value={formData.courseName}
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
            label="Credits"
            name="credits"
            type="number"
            value={formData.credits}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Semester"
            name="semester"
            type="number"
            value={formData.semester}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Max Capacity"
            name="maxCapacity"
            type="number"
            value={formData.maxCapacity}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={3}
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
