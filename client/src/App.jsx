import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import JobBoard from './pages/JobBoard';
import JobDetails from './pages/JobDetails';
import Analyzer from './pages/Analyzer';

// Protected Route: Kicks out logged-out users
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute><JobBoard /></ProtectedRoute>
        } />

        <Route path="/jobs/:id" element={
          <ProtectedRoute><JobDetails /></ProtectedRoute>
        } />

        <Route path="/analyzer" element={
          <ProtectedRoute><Analyzer /></ProtectedRoute>
        } />

        {/* Default: redirect to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
