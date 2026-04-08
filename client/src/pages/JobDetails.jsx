import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Building, DollarSign, Clock, UploadCloud, CheckCircle, Target, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [analyzingGap, setAnalyzingGap] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [skillGap, setSkillGap] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data.job);
      } catch (err) {
        toast.error('Failed to load job details');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      toast.error('Please select your resume PDF first!');
      return;
    }
    
    setApplying(true);
    const toastId = toast.loading('Uploading resume and submitting application...');
    
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      const uploadRes = await api.post('/upload-resume', formData);
      const resumeUrl = uploadRes.data.resumeUrl;

      await api.post(`/jobs/${id}/apply`, { resume: resumeUrl });
      toast.success('Application submitted successfully!', { id: toastId });
      setResumeFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed. Try again.', { id: toastId });
    } finally {
      setApplying(false);
    }
  };

  const checkSkillGap = async () => {
    if (!resumeFile) {
      toast.error('Upload your resume first to check the skill gap!');
      return;
    }
    setAnalyzingGap(true);
    const toastId = toast.loading('Calculatig skill gap alignment...');
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobId', id);
      const res = await api.post('/ai/skill-gap', formData);
      setSkillGap(res.data);
      toast.success('Alignment analysis complete!', { id: toastId });
    } catch (err) {
      toast.error('Failed to analyze gap', { id: toastId });
    } finally {
      setAnalyzingGap(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4 text-slate-500">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="animate-pulse font-medium">Loading details...</p>
    </div>
  );

  if (!job) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 font-medium group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Results
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header Section */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{job.title}</h1>
              <div className="flex items-center gap-4 text-slate-600 font-medium">
                <span className="flex items-center gap-1.5"><Building className="w-5 h-5 text-slate-400" />{job.company}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-5 h-5 text-slate-400" />{job.location}</span>
                <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                  <DollarSign className="w-4 h-4" />{job.salary?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400 font-medium pb-2 border-slate-200 font-mono">
            <Clock className="w-4 h-4" /> Posted {(new Date(job.createdAt)).toLocaleDateString()}
            <span className="ml-4">• {job.applicantCount || 0} active applicants</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="p-8 flex-1 md:w-2/3">
            <h3 className="text-xl font-bold text-slate-900 mb-4">About the Role</h3>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium">
              <p>{job.description}</p>
            </div>
          </div>

          {/* Application Sidebar */}
          <div className="p-8 bg-slate-50 md:w-1/3 flex flex-col items-center justify-start border-l border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 w-full mb-4">Apply Now</h3>
            <form onSubmit={handleApply} className="w-full flex flex-col gap-4">
              <label 
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
                ${resumeFile ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-100/50'}`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  {resumeFile ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-blue-500 mb-2" />
                      <p className="text-sm font-semibold text-blue-600 truncate max-w-[200px]">{resumeFile.name}</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500 font-medium"><span className="text-blue-600 font-semibold">Click to upload</span> or drag</p>
                      <p className="text-xs text-slate-400 mt-1">PDF (MAX. 5MB)</p>
                    </>
                  )}
                </div>
                <input type="file" accept=".pdf" className="hidden" onChange={e => setResumeFile(e.target.files[0])} />
              </label>

              <div className="grid grid-cols-1 gap-3 mt-2">
                <button
                  type="button"
                  onClick={checkSkillGap}
                  disabled={analyzingGap || !resumeFile}
                  className="w-full py-3 bg-white text-blue-600 border border-blue-200 font-bold rounded-xl transition-all hover:bg-blue-50 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {analyzingGap ? <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" /> : <Target className="w-4 h-4" />}
                  Identify Skill Gap
                </button>
                <button
                  type="submit"
                  disabled={applying || !resumeFile}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98]"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>

            <AnimatePresence>
              {skillGap && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 w-full bg-slate-900 rounded-2xl p-5 text-white overflow-hidden border border-slate-800"
                >
                  <h4 className="flex items-center gap-2 font-bold mb-3 text-sm">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    AI Gap Report
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        <span>Readiness</span>
                        <span>{skillGap.readinessScore}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} animate={{ width: `${skillGap.readinessScore}%` }}
                          className="h-full bg-blue-500" 
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Missing Critical</p>
                      <div className="flex flex-wrap gap-1.5">
                        {skillGap.missingCriticalSkills?.map(s => (
                          <span key={s} className="px-2 py-0.5 bg-red-500/20 text-red-200 text-[9px] font-bold rounded border border-red-500/30">{s}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed leading-tight border-t border-white/10 pt-3 mt-3">
                      {skillGap.advice}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
