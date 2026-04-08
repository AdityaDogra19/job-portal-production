import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const fetchJobs = async (kw = '', loc = '') => {
    setLoading(true);
    try {
      const res = await api.get('/jobs', { params: { keyword: kw, location: loc } });
      setJobs(res.data.jobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-blue-600">JobPortal AI</h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/analyzer')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
          >
            🤖 AI Resume Analyzer
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-8">
        {/* Search Bar */}
        <div className="flex gap-4 mb-8">
          <input
            type="text"
            placeholder="Search by keyword (e.g. React)..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-blue-500"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filter by location..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-blue-500"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
          <button
            onClick={() => fetchJobs(keyword, location)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition"
          >
            Search
          </button>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
          Available Roles <span className="text-gray-400 text-lg font-normal">({jobs.length} jobs)</span>
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 animate-pulse">Fetching live opportunities...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-xl">
            No jobs found. Try a different search!
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map(job => (
              <div key={job._id} className="bg-white p-6 rounded-xl shadow-md border hover:shadow-xl transition-all duration-300 flex flex-col">
                <h3 className="text-xl font-bold text-blue-600 mb-1">{job.title}</h3>
                <p className="text-gray-600 font-semibold text-sm mb-3">{job.company} • {job.location}</p>
                <p className="text-gray-500 text-sm mb-4 line-clamp-3 leading-relaxed flex-1">
                  {job.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full">
                    ${job.salary?.toLocaleString()}
                  </span>
                  <button
                    onClick={() => navigate(`/jobs/${job._id}`)}
                    className="text-white bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-bold text-sm shadow transition"
                  >
                    View & Apply
                  </button>
                </div>
                <div className="text-xs text-gray-400 mt-3 text-right">
                  {job.applicantCount || 0} applicants
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
