import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

import JobBoard from './pages/JobBoard';
import Analyzer from './pages/Analyzer';

// A "Protected Route" component mapping our Bouncer logic to the UI
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // If no token exists, violently kick them back to the Login screen!
  if (!token) return <Navigate to="/login" />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes (You need a JWT token to enter here!) */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <JobBoard />
          </ProtectedRoute>
        } />

        <Route path="/analyzer" element={
          <ProtectedRoute>
            <Analyzer />
          </ProtectedRoute>
        } />
        
        {/* Default Route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
