import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import assignmentService from '../../services/assignmentService';
import courseService from '../../services/courseService';

export default function GradeSubmissions() {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [openGradeDialog, setOpenGradeDialog] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({ marks: '', feedback: '' });
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const preselectedCourseId = searchParams.get('courseId');

  useEffect(() => {
    fetchCoursesTaughtByFaculty();
  }, []);

  const fetchCoursesTaughtByFaculty = async () => {
    try {
      setLoading(true);
      const allCourses = await courseService.getAllCourses();
      const ownCourses = allCourses.filter((c) => Number(c.facultyId) === Number(user?.userId));
      setCourses(ownCourses);
      if (ownCourses.length > 0) {
        const matchingCourse = preselectedCourseId
          ? ownCourses.find((c) => Number(c.courseId) === Number(preselectedCourseId))
          : null;
        const initialCourseId = matchingCourse ? matchingCourse.courseId : ownCourses[0].courseId;
        setSelectedCourse(initialCourseId);
        fetchAssignmentsByCourse(initialCourseId);
      }
    } catch (error) {
      showMessage('Error fetching courses: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentsByCourse = async (courseId) => {
    try {
      const data = await assignmentService.getAssignmentsByCourse(courseId);
      setAssignments(data);
      if (data.length > 0) {
        setSelectedAssignment(data[0].assignmentId);
        fetchSubmissions(data[0].assignmentId);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      showMessage('Error fetching assignments: ' + error.message, 'error');
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      const data = await assignmentService.getSubmissions(assignmentId);
      setSubmissions(data);
    } catch (error) {
      showMessage('Error fetching submissions: ' + error.message, 'error');
    }
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    fetchAssignmentsByCourse(courseId);
  };

  const handleAssignmentChange = (e) => {
    const assignmentId = e.target.value;
    setSelectedAssignment(assignmentId);
    fetchSubmissions(assignmentId);
  };

  const handleOpenGradeDialog = (submission) => {
    setGradingSubmission(submission);
    setGradeData({
      marks: submission.marksObtained || '',
      feedback: submission.feedback || ''
    });
    setOpenGradeDialog(true);
  };

  const handleCloseGradeDialog = () => {
    setOpenGradeDialog(false);
    setGradingSubmission(null);
    setGradeData({ marks: '', feedback: '' });
  };

  const handleSaveGrade = async () => {
    try {
      if (gradeData.marks === '' || Number(gradeData.marks) < 0) {
        showMessage('Please enter valid marks', 'error');
        return;
      }
      await assignmentService.gradeSubmission(gradingSubmission.submissionId, {
        marksObtained: parseInt(gradeData.marks, 10),
        feedback: gradeData.feedback
      });
      showMessage('Submission graded successfully', 'success');
      fetchSubmissions(selectedAssignment);
      handleCloseGradeDialog();
    } catch (error) {
      showMessage('Error grading submission: ' + error.message, 'error');
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

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Faculty - Grade Submissions
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

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
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
            <InputLabel>Assignment</InputLabel>
            <Select value={selectedAssignment} onChange={handleAssignmentChange} label="Assignment">
              {assignments.map(assignment => (
                <MenuItem key={assignment.assignmentId} value={assignment.assignmentId}>
                  {assignment.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Typography variant="h5" sx={{ mb: 2 }}>
          Student Submission Status ({submissions.length})
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Student Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Submitted On</strong></TableCell>
                <TableCell align="center"><strong>Marks</strong></TableCell>
                <TableCell><strong>Feedback</strong></TableCell>
                <TableCell align="center"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No students found for this assignment/course
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map(submission => (
                  <TableRow key={submission.submissionId || `student-${submission.studentId}`}>
                    <TableCell>{submission.firstName} {submission.lastName}</TableCell>
                    <TableCell>{submission.email}</TableCell>
                    <TableCell>
                      {submission.submitted ? (
                        <Typography sx={{ color: '#388e3c', fontWeight: 'bold' }}>SUBMITTED</Typography>
                      ) : (
                        <Typography sx={{ color: '#d32f2f', fontWeight: 'bold' }}>NOT SUBMITTED</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {submission.submissionDate
                        ? new Date(submission.submissionDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell align="center">
                      {submission.submitted && submission.marksObtained !== null ? (
                        <Typography sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                          {submission.marksObtained}
                        </Typography>
                      ) : (
                        <Typography sx={{ color: '#d32f2f' }}>
                          {submission.submitted ? 'Not graded' : '-'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {submission.submitted ? (submission.feedback || '-') : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="contained"
                        disabled={!submission.submitted}
                        onClick={() => handleOpenGradeDialog(submission)}
                      >
                        Grade
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      <Dialog open={openGradeDialog} onClose={handleCloseGradeDialog} maxWidth="sm" fullWidth disableEnforceFocus>
        <DialogTitle>Grade Submission</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {gradingSubmission && (
            <Box sx={{ mb: 2 }}>
              <Typography><strong>Student:</strong> {gradingSubmission.firstName} {gradingSubmission.lastName}</Typography>
              <Typography><strong>Email:</strong> {gradingSubmission.email}</Typography>
              <Typography><strong>Submitted:</strong> {new Date(gradingSubmission.submissionDate).toLocaleString()}</Typography>
            </Box>
          )}
          <TextField
            fullWidth
            label="Marks"
            type="number"
            value={gradeData.marks}
            onChange={(e) => setGradeData({ ...gradeData, marks: e.target.value })}
            sx={{ mb: 2 }}
            inputProps={{ min: 0 }}
          />
          <TextField
            fullWidth
            label="Feedback"
            multiline
            rows={4}
            value={gradeData.feedback}
            onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGradeDialog}>Cancel</Button>
          <Button onClick={handleSaveGrade} variant="contained" color="primary">
            Save Grade
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
