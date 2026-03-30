import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import StudentDashboard from './components/dashboard/StudentDashboard';
import FacultyDashboard from './components/dashboard/FacultyDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseManagement from './pages/admin/CourseManagement';
import EnrollmentManagement from './pages/admin/EnrollmentManagement';
import AttendanceView from './pages/attendance/AttendanceView';
import MarkAttendance from './pages/faculty/MarkAttendance';
import AssignmentList from './pages/assignments/AssignmentList';
import SubmitAssignment from './pages/assignments/SubmitAssignment';
import GradeSubmissions from './pages/faculty/GradeSubmissions';
import AssignmentCreate from './pages/faculty/AssignmentCreate';
import EnrollmentPage from './pages/student/EnrollmentPage';
import GradesView from './pages/student/GradesView';
import SubmissionHistory from './pages/student/SubmissionHistory';
import ProtectedRoute from './components/common/ProtectedRoute';

function DashboardRouter() {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.userType === 'STUDENT') return <StudentDashboard />;
  if (user.userType === 'FACULTY') return <FacultyDashboard />;
  if (user.userType === 'ADMIN') return <AdminDashboard />;
  
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <CourseManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/enrollments"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <EnrollmentManagement />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <AttendanceView />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/attendance/mark"
          element={
            <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
              <MarkAttendance />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/assignments"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'FACULTY', 'ADMIN']}>
              <AssignmentList />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/assignments/:assignmentId/submit"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <SubmitAssignment />
            </ProtectedRoute>
          }
        />

        {/* Faculty Routes */}
        <Route
          path="/faculty/grade-submissions"
          element={
            <ProtectedRoute allowedRoles={['FACULTY']}>
              <GradeSubmissions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty/assignments"
          element={
            <ProtectedRoute allowedRoles={['FACULTY']}>
              <AssignmentCreate />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/enrollments"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <EnrollmentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/grades"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <GradesView />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/submissions"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <SubmissionHistory />
            </ProtectedRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
