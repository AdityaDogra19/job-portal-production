import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookmarkMinus, Building, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Bookmarks() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await api.get('/jobs/bookmarks');
        setJobs(res.data.jobs);
      } catch (err) {
        toast.error('Failed to load saved jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  const removeBookmark = async (jobId) => {
    try {
      await api.post(`/jobs/bookmark/${jobId}`);
      setJobs(jobs.filter(job => job._id !== jobId));
      toast.success('Removed from saved jobs');
    } catch {
      toast.error('Failed to remove job');
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Saved Jobs</h1>
        <p className="text-slate-500 font-medium mt-1">You have {jobs.length} bookmarked opportunities.</p>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <BookmarkMinus className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">No saved jobs</h3>
          <p className="text-slate-500 mt-2">When you bookmark jobs they will appear here to easily return to later.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {jobs.map(job => (
            <motion.div 
              key={job._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{job.title}</h3>
                <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
                  <span className="flex items-center gap-1"><Building className="w-4 h-4" /> {job.company}</span>
                  <span className="text-slate-300">•</span>
                  <span>{job.location}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => removeBookmark(job._id)}
                  className="flex-1 md:flex-none px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                >
                  Remove
                </button>
                <button
                  onClick={() => navigate(`/jobs/${job._id}`)}
                  className="flex-1 md:flex-none px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  View Role <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
