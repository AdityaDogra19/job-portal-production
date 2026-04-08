import { useState } from 'react';
import api from '../services/api';

export default function Analyzer() {
  // 1. STATE MANAGEMENT
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  // 2. FORM ACTION
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setAnalysis(null); // Clear old results
    
    // We package the raw PDF file into a standard Multi-Part Form payload
    const formData = new FormData();
    formData.append('resume', file);

    try {
      // 3. API BRIDGE TO NODE.JS -> OPENAI
      const res = await api.post('/ai/analyze-resume', formData);
      setAnalysis(res.data); // This pushes the JSON straight into our Tracker
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Analysis failed. Check your connection and try again.';
      alert("Error: " + errMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-16">
      
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-blue-900 tracking-tight">AI Resume Engine</h2>
        <p className="text-gray-500 mt-2 text-lg">Compare your keywords against the enterprise ATS algorithm.</p>
      </div>
      
      {/* 🔴 UPLOAD ZONE */}
      <form onSubmit={handleUpload} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 w-full max-w-2xl mb-8 flex flex-col gap-6">
        <div className="flex flex-col items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <p className="mb-2 text-sm text-gray-500 font-semibold"><span className="text-blue-600">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-gray-500">PDF Resumes ONLY (Max 2MB)</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>
        </div>
        {file && <p className="text-center font-bold text-gray-700">Selected: {file.name}</p>}
        
        <button 
          type="submit" 
          disabled={loading || !file}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-transform focus:scale-95 disabled:bg-gray-300 disabled:scale-100 shadow-md"
        >
          {loading ? "Transpiling Document..." : "Generate Deep Analysis"}
        </button>
      </form>

      {/* 🔴 LOADING STATE (As perfectly mapped from your notes!) */}
      {loading && (
        <div className="flex flex-col items-center justify-center my-10 space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <h2 className="font-semibold text-gray-600 animate-pulse text-lg">Connecting to LLM Core...</h2>
        </div>
      )}

      {/* 🔴 AI RESULTS AREA */}
      {analysis && !loading && (
        <div className="w-full max-w-4xl flex flex-col gap-8 pb-20 animate-fade-in-up">
          
          {/* REQUIREMENT 1: Score Progress Bar */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex justify-between items-center">
              Overall ATS Score 
              <span className={`text-3xl ${analysis.score >= 80 ? 'text-green-500' : analysis.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                {analysis.score}<span className="text-lg text-gray-400">/100</span>
              </span>
            </h3>
            
            <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden shadow-inner p-1">
              {/* Dynamic Width Calculation mapped directly to React State variable */}
              <div 
                className={`h-full rounded-full transition-all duration-[1500ms] ease-out flex items-center justify-end pr-3 font-bold text-white text-xs ${
                  analysis.score >= 80 ? 'bg-green-500' : analysis.score >= 50 ? 'bg-yellow-400' : 'bg-red-500'
                }`}
                style={{ width: `${analysis.score}%` }}
              >
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* REQUIREMENT 2: Missing Skills */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border-t-4 border-t-red-500">
              <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                <span className="bg-red-100 p-2 rounded-lg">❌</span> Critical Missing Keywords
              </h3>
              <ul className="space-y-3">
                {analysis.missingSkills?.map((skill, i) => (
                  <li key={i} className="flex items-start text-gray-700 font-medium">
                    <span className="mr-2 text-red-400">•</span> {skill}
                  </li>
                ))}
              </ul>
            </div>

            {/* Strengths Mapping */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border-t-4 border-t-green-500">
              <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
                <span className="bg-green-100 p-2 rounded-lg">✅</span> Identified Strengths
              </h3>
              <ul className="space-y-3">
                {analysis.strengths?.map((str, i) => (
                  <li key={i} className="flex items-start text-gray-700 font-medium">
                    <span className="mr-2 text-green-400">•</span> {str}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Suggestions Block */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-2xl shadow-sm border border-indigo-100">
            <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <span className="bg-white p-2 rounded-lg shadow-sm">💡</span> Strategic AI Improvements
            </h3>
            <ul className="space-y-4">
              {analysis.suggestions?.map((sug, i) => (
                <li key={i} className="bg-white p-4 rounded-lg shadow-sm font-medium text-gray-700 border border-white">
                  {sug}
                </li>
              ))}
            </ul>
          </div>

        </div>
      )}
    </div>
  );
}
