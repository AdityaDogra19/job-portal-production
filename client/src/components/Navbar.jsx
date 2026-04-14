import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, User, LogOut, Activity, Bookmark, FileText, Bell, MessageSquare, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial dark mode state
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    if (user._id) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/notifications');
          setNotifications(res.data.notifications);
        } catch (err) {
          console.error("Failed to fetch notifications");
        }
      };
      fetchNotifications();
    }
  }, [user._id]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // if explicitly storing user
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: Briefcase },
    { path: '/analyzer', label: 'AI Analyzer', icon: Activity },
    ...(isAdmin ? [{ path: '/admin/applications', label: 'Applications', icon: FileText }] : []),
    { path: '/bookmarks', label: 'Saved Jobs', icon: Bookmark },
    { path: '/chat', label: 'Chat', icon: MessageSquare },
    { path: '/profile', label: 'Profile', icon: User }
  ];

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Briefcase className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">CareerLink</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 relative z-10">
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-blue-50 border border-blue-100 rounded-lg -z-0"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                    />
                  )}
                </Link>
              );
            })}
            
            <div className="h-6 w-px bg-slate-200 mx-2" />

            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) markAllRead();
                }}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                      <span className="font-bold text-slate-900">Notifications</span>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{unreadCount} New</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm font-medium">
                          No alerts yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n._id} className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
                            <p className="text-sm font-medium text-slate-900 leading-snug">{n.message}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{(new Date(n.createdAt)).toLocaleDateString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
