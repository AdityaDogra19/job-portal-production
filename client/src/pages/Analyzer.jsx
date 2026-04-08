import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle, Brain, AlertCircle, TrendingUp, Layout, Award, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const ScoreRing = ({ score, label, colorClass }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="relative w-20 h-20">
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
        <motion.path 
          initial={{ strokeDasharray: "0, 100" }}
          animate={{ strokeDasharray: `${score}, 100` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round"
          className={colorClass}
        />
        <text x="18" y="20.35" className="text-[7px] font-bold fill-slate-900" textAnchor="middle">{score}%</text>
      </svg>
    </div>
    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
  </div>
);

export default function Analyzer() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setAnalysis(null);
    
    const formData = new FormData();
    formData.append('resume', file);

    const toastId = toast.loading('Powering up AI engine...');

    try {
      const res = await api.post('/ai/analyze-resume', formData);
      setAnalysis(res.data);
      toast.success('Deep analysis complete!', { id: toastId });
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Deep analysis failed.';
      toast.error(errMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="text-left mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">AI Resume Intelligence</h1>
        <p className="text-slate-500 mt-2 text-lg font-medium">Quantify your professional profile against global ATS benchmarks.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Upload */}
        <div className="lg:col-span-1 space-y-6">
          <form onSubmit={handleUpload} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-600" />
              Upload Source
            </h3>
            <label className={`group relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200
              ${file ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
              <div className="flex flex-col items-center justify-center p-4 text-center">
                {file ? (
                  <>
                    <CheckCircle className="w-10 h-10 text-blue-500 mb-3" />
                    <p className="text-sm font-bold text-blue-600 truncate max-w-full px-2">{file.name}</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Layout className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500"><span className="text-blue-600">Click to upload</span></p>
                    <p className="text-xs text-slate-400 mt-1">Accepts PDF up to 5MB</p>
                  </>
                )}
              </div>
              <input type="file" className="hidden" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
            </label>

            <button 
              type="submit" 
              disabled={loading || !file}
              className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              )}
              {loading ? "Analyzing..." : "Generate Analysis"}
            </button>
          </form>

          <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-200">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              How it works
            </h4>
            <p className="text-blue-100 text-sm leading-relaxed">
              Our AI parses your resume text to identify semantic patterns, formatting consistency, and matching keywords against 50k+ job descriptions in our database.
            </p>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {!analysis && !loading && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white rounded-3xl border border-slate-200 border-dashed p-20 text-center flex flex-col items-center"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Award className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Awaiting Data</h3>
                <p className="text-slate-500 mt-2 max-w-xs mx-auto font-medium">Upload your resume to receive a comprehensive ATS breakdown and scoring report.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white rounded-3xl border border-slate-200 p-20 flex flex-col items-center justify-center space-y-6"
              >
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-slate-100 rounded-full" />
                  <div className="w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
                  <Brain className="w-10 h-10 text-blue-600 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-900">Processing Document</h3>
                  <p className="text-slate-500 font-medium">Extracting semantic tokens and weighting skills...</p>
                </div>
              </motion.div>
            )}

            {analysis && !loading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-6 pb-12"
              >
                {/* Main Score Card */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                  <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                        <motion.circle 
                          cx="18" cy="18" r="16" fill="none" 
                          stroke={analysis.score >= 80 ? "#10b981" : analysis.score >= 50 ? "#f59e0b" : "#ef4444"} 
                          strokeWidth="3" strokeDasharray="100, 100"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: analysis.score / 100 }}
                          transition={{ duration: 2, ease: "easeOut" }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-slate-900">{analysis.score}</span>
                        <span className="text-xs font-bold text-slate-400 tracking-tighter uppercase">ATS Score</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-3 gap-4 w-full">
                      <ScoreRing score={analysis.formattingScore} label="Formatting" colorClass="text-blue-500" />
                      <ScoreRing score={analysis.skillsScore} label="Skills" colorClass="text-indigo-500" />
                      <ScoreRing score={analysis.experienceScore} label="Experience" colorClass="text-emerald-500" />
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Missing Skills */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 -mr-8 -mt-8 rounded-full blur-2xl" />
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 relative z-10">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      Missing Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2 relative z-10">
                      {analysis.missingSkills?.map((skill, i) => (
                        <span key={i} className="bg-red-50 text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-100 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Strengths */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 -mr-8 -mt-8 rounded-full blur-2xl" />
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 relative z-10">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                      Candidate Strengths
                    </h3>
                    <ul className="space-y-3 relative z-10">
                      {analysis.strengths?.map((str, i) => (
                        <li key={i} className="flex gap-2 text-sm font-semibold text-slate-600">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                          {str}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                  <div className="absolute bottom-0 right-0 opacity-10 blur-xl translate-x-1/4 translate-y-1/4">
                    <Brain className="w-64 h-64" />
                  </div>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Strategic AI Recommendations
                  </h3>
                  <div className="space-y-4 relative z-10">
                    {analysis.suggestions?.map((sug, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-3 items-start"
                      >
                        <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-blue-400">{i + 1}</span>
                        </div>
                        <p className="text-sm text-slate-200 font-medium leading-relaxed">{sug}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
