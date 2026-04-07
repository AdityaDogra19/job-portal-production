import { useState, useEffect } from 'react';
import api from '../services/api';

export default function JobBoard() {
  // 1. STATE (Just like your notes!)
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect runs automatically the exact millisecond this page appears on the screen
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // 2. API CALL (Just like your notes!)
        // Because we built api.js earlier, it auto-prefixes 'http://localhost:5001/api'!
        const response = await api.get('/jobs'); 
        
        // 3. UI UPDATE
        // We inject the entire array of jobs from the backend into our State box!
        setJobs(response.data.jobs);
      } catch (error) {
        console.error("Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs(); // Trigger the function
  }, []); // The empty array [] means "Only run this once when the window opens!"

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin text-center"></div>
        <h2 className="mt-4 text-xl font-semibold text-gray-700 animate-pulse">Fetching live opportunities...</h2>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <h2 className="text-4xl font-bold text-gray-800 mb-8 border-b pb-4">Available Roles</h2>
      
      {/* We use Tailwind CSS Grid to automatically structure these into beautiful columns */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map(job => (
          <div key={job._id} className="bg-white p-6 rounded-xl shadow-md border hover:shadow-xl transition-all duration-300">
            <h3 className="text-2xl font-bold text-blue-600 mb-2">{job.title}</h3>
            <p className="text-gray-700 font-semibold mb-4">{job.company} • {job.location}</p>
            
            <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
              {job.description}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="bg-green-100 text-green-800 text-sm font-bold px-4 py-2 rounded-full">
                ${job.salary.toLocaleString()}
              </span>
              
              <button className="text-white bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold shadow-sm transition-colors">
                Apply Now
              </button>
            </div>
            
            <div className="text-xs text-gray-400 mt-4 text-center">
              Applicants: {job.applicantCount || 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
