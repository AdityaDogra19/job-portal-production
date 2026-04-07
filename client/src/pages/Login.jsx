import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  // 1. STATE: These variables hold the data typing into the inputs live!
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // React Router's URL changing tool

  // 2. FORM SUBMISSION INTERCEPTOR
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stops the page from visually refreshing
    try {
      // 3. THE API CALL
      // We shoot the State directly over our dedicated API pipeline
      const response = await api.post('/auth/login', { email, password });
      
      // 4. STORAGE
      // The backend sent back {"message": "...", "token": "eyJ..."}
      // We physically write the token string into the browser's hard-drive so it survives page reloads
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.user.role);
      
      // 5. THE UI UPDATE
      navigate('/dashboard'); // Instantly transport the user to the protected dashboard!
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed!');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-lg w-96">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6 font-['Inter']">Job Portal</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="Email Address" 
            required
            className="p-3 border rounded-md border-gray-300 focus:outline-blue-500 transition-shadow"
            onChange={e => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            required
            className="p-3 border rounded-md border-gray-300 focus:outline-blue-500 transition-shadow"
            onChange={e => setPassword(e.target.value)} 
          />
          <button type="submit" className="py-3 mt-4 text-white font-semibold bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-md">
            Sign In
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
