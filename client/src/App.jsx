import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import JobBoard from './pages/JobBoard';
import JobDetails from './pages/JobDetails';
import Analyzer from './pages/Analyzer';
import Bookmarks from './pages/Bookmarks';
import Profile from './pages/Profile';
import Applications from './pages/Applications';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';

// Protected Route: Kicks out logged-out users
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Layout><JobBoard /></Layout></ProtectedRoute>
        } />

        <Route path="/jobs/:id" element={
          <ProtectedRoute><Layout><JobDetails /></Layout></ProtectedRoute>
        } />

        <Route path="/analyzer" element={
          <ProtectedRoute><Layout><Analyzer /></Layout></ProtectedRoute>
        } />

        <Route path="/bookmarks" element={
          <ProtectedRoute><Layout><Bookmarks /></Layout></ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>
        } />

        <Route path="/admin/applications" element={
          <ProtectedRoute><Layout><Applications /></Layout></ProtectedRoute>
        } />

        {/* Default: redirect to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
