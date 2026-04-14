import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User as UserIcon, Mail, Shield, Calendar, 
  MapPin, LogOut, ChevronRight, FileCheck, 
  Settings, ExternalLink, ShieldCheck, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Profile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [isHovered, setIsHovered] = useState(false);
  const [openToWork, setOpenToWork] = useState(user.openToWork || false);
  const [videoResume, setVideoResume] = useState(user.videoResume || '');

  const savePreferences = async () => {
    const toastId = toast.loading('Saving preferences...');
    try {
      const res = await api.put('/users/open-to-work', {
        openToWork,
        videoResume
      });
      localStorage.setItem('user', JSON.stringify({ ...user, ...res.data.user }));
      toast.success('Preferences updated!', { id: toastId });
    } catch (err) {
      toast.error('Failed to save preferences.', { id: toastId });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const menuItems = [
    { icon: Settings, label: 'Account Settings', desc: 'Manage your security and login credentials' },
    { icon: ExternalLink, label: 'Resume Preferences', desc: 'Update your default application documents' },
    { icon: ShieldCheck, label: 'Privacy & Data', desc: 'Control your profile visibility and data sharing' }
  ];

  const stats = [
    { label: 'Applications', value: '12' },
    { label: 'Job Matches', value: '85%' },
    { label: 'Saved Roles', value: '4' }
  ];

  return (
    <div className="max-w-4xl mx-auto w-full pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Profile</h1>
        <p className="text-slate-500 font-medium text-lg mt-1">Manage your professional identity and account settings.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm shadow-slate-100">
            <div className="h-24 bg-gradient-to-br from-blue-600 to-indigo-700 w-full" />
            <div className="px-6 pb-8 flex flex-col items-center">
              <div 
                className="w-24 h-24 bg-white rounded-3xl -mt-12 border-4 border-white shadow-xl flex items-center justify-center relative overflow-hidden group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                  <span className="text-3xl font-black text-blue-600">{user.name?.[0].toUpperCase()}</span>
                </div>
              </div>
              
              <div className="text-center mt-4 w-full">
                <h2 className="text-xl font-black text-slate-900 truncate px-2">{user.name}</h2>
                <div className="flex items-center justify-center gap-1.5 text-slate-400 text-sm font-bold uppercase tracking-wider mt-1">
                  {user.role === 'admin' ? (
                    <span className="flex items-center gap-1 text-indigo-600">
                      <Shield className="w-3.5 h-3.5" /> Platform Admin
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-blue-600">
                      <Zap className="w-3.5 h-3.5" /> Elite Candidate
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-8 w-full space-y-4">
                {/* Open To Work Toggle */}
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">#OpenToWork</span>
                    <span className="text-xs text-slate-500 font-medium">Let recruiters know you are searching</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={openToWork}
                      onChange={(e) => {
                        setOpenToWork(e.target.checked);
                        // Save automatically when toggled
                      }}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                
                {/* Video Resume */}
                <div className="flex flex-col gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="font-bold text-slate-900 text-sm">Video Resume URL</span>
                  <input 
                    type="text" 
                    placeholder="youtube.com/watch?v=..."
                    className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm font-medium"
                    value={videoResume}
                    onChange={(e) => setVideoResume(e.target.value)}
                  />
                </div>
                <button 
                  onClick={savePreferences}
                  className="w-full bg-slate-900 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Save Profile Settings
                </button>

                <div className="flex items-center gap-3 text-slate-600 font-medium text-sm p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 font-medium text-sm p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Joined Oct 2023</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 font-medium text-sm p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>San Francisco, CA</span>
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6 w-full">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3.5 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100 group"
                >
                  <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Terminate Session
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-blue-200">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-400" />
              Resume Health
            </h4>
            <div className="w-full bg-white/10 rounded-full h-2.5 mb-2">
              <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '65%' }} />
            </div>
            <p className="text-blue-100 text-xs font-medium">Your resume is 65% complete. Add more certifications to boost matches!</p>
          </div>
        </div>

        {/* Right Column: Details & Settings */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-8">Performance Snapshot</h3>
            <div className="grid grid-cols-3 gap-6">
              {stats.map(stat => (
                <div key={stat.label} className="text-center group">
                  <div className="text-3xl font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors uppercase tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Account Preferences</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {menuItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button 
                    key={idx}
                    className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold group-hover:text-blue-600 transition-colors">{item.label}</p>
                        <p className="text-slate-500 text-sm font-medium">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 flex items-center gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-1">Identity Verified</h4>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                Your account is currently protected by standard platform security and encrypted identity shielding.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
