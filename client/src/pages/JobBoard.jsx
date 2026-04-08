import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Bookmark, BookmarkCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const fetchJobs = async (kw = '', loc = '') => {
    setLoading(true);
    try {
      const [jobsRes, bookmarksRes] = await Promise.all([
        api.get('/jobs', { params: { keyword: kw, location: loc } }),
        api.get('/jobs/bookmarks').catch(() => ({ data: { jobs: [] } }))
      ]);
      setJobs(jobsRes.data.jobs);
      setBookmarkedIds(bookmarksRes.data.jobs.map(b => typeof b === 'string' ? b : b._id));
    } catch (error) {
      toast.error('Failed to load live jobs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const toggleBookmark = async (e, jobId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.post(`/jobs/bookmark/${jobId}`);
      setBookmarkedIds(res.data.bookmarkedJobs.map(b => typeof b === 'string' ? b : b._id));
      if (res.data.message.includes('removed')) {
        toast.error('Removed from saved jobs');
      } else {
        toast.success('Job saved successfully');
      }
    } catch (error) {
      toast.error('Could not save job');
    }
  };

  return (
    <div className="w-full">
      {/* Search Header */}
      <div className="mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Find Your Next Role</h1>
        <p className="text-slate-500 mb-6 font-medium text-lg">Search through {jobs.length || 0} active elite opportunities.</p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-2">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Search by role, keyword, or company..."
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 hover:bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-900 font-medium placeholder-slate-400"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchJobs(keyword, location)}
            />
          </div>
          
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <MapPin className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="City, state, or remote..."
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 hover:bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-900 font-medium placeholder-slate-400"
              value={location}
              onChange={e => setLocation(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchJobs(keyword, location)}
            />
          </div>
          
          <button
            onClick={() => fetchJobs(keyword, location)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all active:scale-95 whitespace-nowrap"
          >
            Search Jobs
          </button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
          Latest Opportunities
        </h2>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 h-64 flex flex-col justify-between">
              <div>
                <div className="w-3/4 h-6 bg-slate-200 rounded-md animate-pulse mb-3" />
                <div className="w-1/2 h-4 bg-slate-100 rounded-md animate-pulse mb-6" />
                <div className="space-y-2">
                  <div className="w-full h-3 bg-slate-100 rounded animate-pulse" />
                  <div className="w-5/6 h-3 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div className="w-16 h-8 bg-slate-200 rounded-full animate-pulse" />
                <div className="w-24 h-10 bg-slate-200 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">No jobs found</h3>
          <p className="text-slate-500">We couldn't find anything matching your criteria. Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {jobs.map((job) => {
              const isSaved = bookmarkedIds.includes(job._id);
              return (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => navigate(`/jobs/${job._id}`)}
                  className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-50 transition-all cursor-pointer flex flex-col group relative overflow-hidden"
                >
                  <button 
                    onClick={(e) => toggleBookmark(e, job._id)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-5 h-5 text-blue-600 fill-blue-50" />
                    ) : (
                      <Bookmark className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    )}
                  </button>
                  
                  <div className="mb-4 pr-10">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-1.5">{job.title}</h3>
                    <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
                      <span>{job.company}</span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center"><MapPin className="w-3 h-3 mr-0.5 inline" />{job.location}</span>
                    </div>
                  </div>
                  
                  <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
                    {job.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="bg-emerald-50 text-emerald-700 text-sm font-bold px-3 py-1 rounded-full border border-emerald-100">
                        ${job.salary?.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                      {job.applicantCount || 0} applied
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
