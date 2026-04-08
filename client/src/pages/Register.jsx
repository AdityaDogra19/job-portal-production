import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('applicant');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.user.role);
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-lg w-96">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Create Account</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full Name"
            required
            className="p-3 border rounded-md border-gray-300 focus:outline-blue-500 transition-shadow"
            onChange={e => setName(e.target.value)}
          />
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
          <select
            className="p-3 border rounded-md border-gray-300 focus:outline-blue-500 bg-white"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="applicant">I am an Applicant</option>
            <option value="admin">I am a Recruiter / Admin</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="py-3 mt-2 text-white font-semibold bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-md disabled:bg-gray-400"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
