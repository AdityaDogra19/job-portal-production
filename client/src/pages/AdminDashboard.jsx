import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Briefcase, FileText, CheckCircle2, 
  XCircle, Clock, ExternalLink, Filter, Search 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchApplications = async () => {
    try {
      const res = await api.get('/admin/applications');
      setApplications(res.data.applications);
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id, newStatus) => {
    const toastId = toast.loading(`Updating status to ${newStatus}...`);
    try {
      await api.put(`/admin/applications/${id}/status`, { status: newStatus });
      setApplications(apps => apps.map(a => a._id === id ? { ...a, status: newStatus } : a));
      toast.success('Status updated', { id: toastId });
    } catch (err) {
      toast.error('Failed to update status', { id: toastId });
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = app.userId?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.jobId?.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto w-full pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Application Management</h1>
        <p className="text-slate-500 font-medium text-lg mt-1">Review candidate submissions and manage hiring pipelines platform-wide.</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search by candidate or job title..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-600 font-medium transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="text-slate-400 w-5 h-5 ml-2 mr-1" />
          {['all', 'applied', 'shortlisted', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border
                ${filter === s ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredApps.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No matching applications found.</p>
            </div>
          ) : (
            filteredApps.map((app) => (
              <motion.div 
                key={app._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                    <span className="text-xl font-black text-blue-600">{app.userId?.name[0]}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight">{app.userId?.name}</h3>
                    <p className="text-slate-500 text-sm font-medium">Applied for <span className="text-slate-900 font-bold">{app.jobId?.title}</span> at {app.jobId?.company}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{new Date(app.createdAt).toLocaleDateString()}</span>
                      <a href={app.resume} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-600 hover:underline tracking-widest">
                        <ExternalLink className="w-3 h-3" /> View Resume
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-100">
                    {[
                      { icon: Clock, label: 'applied', color: 'text-blue-500', bg: 'bg-blue-50' },
                      { icon: CheckCircle2, label: 'shortlisted', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                      { icon: XCircle, label: 'rejected', color: 'text-red-500', bg: 'bg-red-50' }
                    ].map((step) => {
                      const isActive = app.status === step.label;
                      const StepIcon = step.icon;
                      return (
                        <button
                          key={step.label}
                          onClick={() => updateStatus(app._id, step.label)}
                          title={`Mark as ${step.label}`}
                          className={`p-2.5 rounded-lg transition-all flex items-center gap-2 group
                            ${isActive ? `${step.bg} ${step.color} shadow-sm ring-1 ring-slate-200` : 'text-slate-400 hover:bg-white hover:text-slate-600'}`}
                        >
                          <StepIcon className="w-5 h-5" />
                          {isActive && <span className="text-[10px] font-black uppercase tracking-widest pr-1">{step.label}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
