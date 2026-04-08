import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Briefcase, FileText, CheckCircle2, Clock, 
  ChevronRight, TrendingUp, AlertCircle, Plus 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-24 h-24  opacity-5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110 ${color}`} />
    <div className="flex items-center gap-4 relative z-10">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-black text-slate-900">{value}</h3>
      </div>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (isAdmin) {
          const res = await api.get('/admin/dashboard');
          setStats(res.data.stats);
          // For admin, activity could be latest jobs or apps (mock or simplified for now)
          setActivities([
            { id: 1, text: 'Platform health is stable', time: '1m ago', type: 'system' },
            { id: 2, text: 'New job posted in Engineering', time: '1h ago', type: 'job' }
          ]);
        } else {
          const res = await api.get('/jobs/my-applications');
          const apps = res.data.applications;
          setStats({
            total: apps.length,
            shortlisted: apps.filter(a => a.status === 'shortlisted').length,
            pending: apps.filter(a => a.status === 'applied').length
          });
          setActivities(apps.slice(0, 5).map(a => ({
            id: a._id,
            text: `Applied to ${a.jobId?.title} at ${a.jobId?.company}`,
            time: new Date(a.createdAt).toLocaleDateString(),
            status: a.status
          })));
        }
      } catch (err) {
        toast.error('Failed to load dashboard insights');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [isAdmin]);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Welcome back, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 font-medium text-lg mt-1">
            Here is what is happening with your {isAdmin ? 'platform' : 'career'} today.
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => navigate('/dashboard')} // Link to job board or a specialized job creator
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" /> Post New Role
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {isAdmin ? (
          <>
            <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="bg-blue-600" delay={0.1} />
            <StatCard title="Active Jobs" value={stats.totalJobs} icon={Briefcase} color="bg-indigo-600" delay={0.2} />
            <StatCard title="Applications" value={stats.totalApplications} icon={FileText} color="bg-emerald-600" delay={0.3} />
          </>
        ) : (
          <>
            <StatCard title="Total Applied" value={stats.total} icon={FileText} color="bg-blue-600" delay={0.1} />
            <StatCard title="Shortlisted" value={stats.shortlisted} icon={CheckCircle2} color="bg-emerald-600" delay={0.2} />
            <StatCard title="Under Review" value={stats.pending} icon={Clock} color="bg-orange-500" delay={0.3} />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Recent Activity
            </h3>
            
            {activities.length === 0 ? (
              <div className="text-center py-10">
                <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No recent activity found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAdmin ? 'bg-slate-100' : 'bg-blue-50'}`}>
                        {act.status === 'shortlisted' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Clock className={`w-5 h-5 ${isAdmin ? 'text-slate-400' : 'text-blue-500'}`} />
                        )}
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold group-hover:text-blue-600 transition-colors">{act.text}</p>
                        <p className="text-slate-400 text-xs font-semibold uppercase">{act.time}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips / Meta */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl -mr-16 -mt-16" />
            <h3 className="text-xl font-bold mb-4 relative z-10">AI Insights</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6 relative z-10 font-medium">
              Users with an ATS score above 80 are <span className="text-blue-400 font-bold">3.5x more likely</span> to be shortlisted. Run an analysis today.
            </p>
            <button 
              onClick={() => navigate('/analyzer')}
              className="w-full py-4 bg-white text-slate-900 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-colors relative z-10 shadow-lg"
            >
              Analyze Resume
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Saved Jobs', path: '/bookmarks' },
                { label: 'Settings', path: '/profile' },
                { label: 'Job Board', path: '/dashboard' },
                { label: 'Help Center', path: '#' }
              ].map(link => (
                <button
                  key={link.label}
                  onClick={() => navigate(link.path)}
                  className="p-3 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
