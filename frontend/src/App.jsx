import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import StudentDashboard from './components/dashboard/StudentDashboard';
import FacultyDashboard from './components/dashboard/FacultyDashboard';
import AttendanceView from './pages/attendance/AttendanceView';
import MarkAttendance from './pages/attendance/MarkAttendance';
import AssignmentList from './pages/assignments/AssignmentList';
import SubmitAssignment from './pages/assignments/SubmitAssignment';
import ProtectedRoute from './components/common/ProtectedRoute';

function DashboardRouter() {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.userType === 'STUDENT') return <StudentDashboard />;
  if (user.userType === 'FACULTY') return <FacultyDashboard />;
  if (user.userType === 'ADMIN') return <FacultyDashboard />;
  
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
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
