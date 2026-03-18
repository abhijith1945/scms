import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  AppBar,
  Toolbar,
  Alert,
  CircularProgress,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuth } from '../../context/AuthContext';
import assignmentService from '../../services/assignmentService';

export default function SubmissionHistory() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await assignmentService.getMyAssignments();
      setSubmissions(data);
    } catch (error) {
      showMessage('Error fetching submissions: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (submission) => {
    setSelectedSubmission(submission);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSubmission(null);
  };

  const handleDownloadSubmission = (submission) => {
    if (submission.file_path) {
      // In a real system, this would download the file from the backend
      showMessage('Download feature would work with proper file server', 'info');
    } else {
      showMessage('No file attached to this submission', 'warning');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return 'success';
      case 'GRADED':
        return 'info';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getGradeStatus = (marks) => {
    if (marks === null) return { label: 'Pending', color: '#f59e0b' };
    if (marks >= 80) return { label: 'Excellent', color: '#10b981' };
    if (marks >= 70) return { label: 'Good', color: '#3b82f6' };
    if (marks >= 60) return { label: 'Fair', color: '#f59e0b' };
    return { label: 'Poor', color: '#ef4444' };
  };

  if (loading) return <CircularProgress />;

  const submittedCount = submissions.filter(s => s.status === 'SUBMITTED').length;
  const gradedCount = submissions.filter(s => s.marks !== null).length;
  const pendingCount = submissions.filter(s => s.marks === null).length;

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Student - Submission History
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

        <Box sx={{ mb: 4, p: 2, backgroundColor: '#f0f9ff', borderRadius: 1 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            📊 Submission Summary
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box>
              <Typography variant="body2" color="textSecondary">Total Submissions</Typography>
              <Typography variant="h5">{submissions.length}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">Submitted</Typography>
              <Typography variant="h5" sx={{ color: '#10b981' }}>{submittedCount}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">Graded</Typography>
              <Typography variant="h5" sx={{ color: '#3b82f6' }}>{gradedCount}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">Pending Grade</Typography>
              <Typography variant="h5" sx={{ color: '#f59e0b' }}>{pendingCount}</Typography>
            </Box>
          </Box>
        </Box>

        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          📝 Your Submissions
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Course</strong></TableCell>
                <TableCell><strong>Assignment</strong></TableCell>
                <TableCell align="center"><strong>Due Date</strong></TableCell>
                <TableCell align="center"><strong>Submitted</strong></TableCell>
                <TableCell align="center"><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Grade</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No submissions yet
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map(submission => {
                  const gradeStatus = getGradeStatus(submission.marks);
                  
                  return (
                    <TableRow key={submission.submission_id}>
                      <TableCell><strong>{submission.courseCode}</strong></TableCell>
                      <TableCell>{submission.assignment_title}</TableCell>
                      <TableCell align="center">
                        {new Date(submission.assignment_due_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="center">
                        {new Date(submission.submitted_at).toLocaleString()}
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={submission.status} 
                          size="small"
                          color={getStatusColor(submission.status)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {submission.marks !== null ? (
                          <Box>
                            <Typography sx={{ fontWeight: 'bold', color: gradeStatus.color }}>
                              {submission.marks} / {submission.max_marks || 100}
                            </Typography>
                            <Typography variant="caption" sx={{ color: gradeStatus.color }}>
                              {gradeStatus.label}
                            </Typography>
                          </Box>
                        ) : (
                          <Chip 
                            label="Pending" 
                            size="small" 
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewDetails(submission)}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth disableEnforceFocus>
        <DialogTitle>Submission Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedSubmission && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="textSecondary">COURSE</Typography>
                <Typography variant="h6">{selectedSubmission.courseCode} - {selectedSubmission.courseName}</Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" color="textSecondary">ASSIGNMENT</Typography>
                <Typography variant="subtitle1">{selectedSubmission.assignment_title}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="textSecondary">DUE DATE</Typography>
                <Typography>{new Date(selectedSubmission.assignment_due_date).toLocaleDateString()}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="textSecondary">SUBMITTED</Typography>
                <Typography>{new Date(selectedSubmission.submitted_at).toLocaleString()}</Typography>
              </Box>

              {selectedSubmission.file_path && (
                <Box>
                  <Typography variant="caption" color="textSecondary">SUBMITTED FILE</Typography>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownloadSubmission(selectedSubmission)}
                  >
                    {selectedSubmission.file_path.split('/').pop()}
                  </Button>
                </Box>
              )}

              {selectedSubmission.marks !== null && (
                <>
                  <Box>
                    <Typography variant="caption" color="textSecondary">MARKS OBTAINED</Typography>
                    <Typography variant="h5" sx={{ color: getGradeStatus(selectedSubmission.marks).color, fontWeight: 'bold' }}>
                      {selectedSubmission.marks} / {selectedSubmission.max_marks || 100}
                    </Typography>
                  </Box>

                  {selectedSubmission.feedback && (
                    <Box>
                      <Typography variant="caption" color="textSecondary">FEEDBACK</Typography>
                      <Paper sx={{ p: 2, backgroundColor: '#f9fafb' }}>
                        <Typography variant="body2">{selectedSubmission.feedback}</Typography>
                      </Paper>
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
