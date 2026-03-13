import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import UserTasks from './pages/UserTasks';
import UserProgress from './pages/UserProgress';
import AdminDashboard from './pages/AdminDashboard';
import ContentUpload from './pages/ContentUpload';
import ExcelUpload from './pages/ExcelUpload';
import ProgressTracking from './pages/ProgressTracking';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* User routes — separate Tasks and Progress pages */}
          <Route path="/dashboard/tasks"    element={<ProtectedRoute><UserTasks /></ProtectedRoute>} />
          <Route path="/dashboard/progress" element={<ProtectedRoute><UserProgress /></ProtectedRoute>} />
          <Route path="/dashboard" element={<Navigate to="/dashboard/tasks" replace />} />

          {/* Admin routes */}
          <Route path="/admin"               element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/upload"        element={<ProtectedRoute adminOnly><ContentUpload /></ProtectedRoute>} />
          <Route path="/admin/upload-excel"  element={<ProtectedRoute adminOnly><ExcelUpload /></ProtectedRoute>} />
          <Route path="/admin/progress"      element={<ProtectedRoute adminOnly><ProgressTracking /></ProtectedRoute>} />

          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
