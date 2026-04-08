import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data.job);
      } catch (err) {
        setMessage('Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!resumeFile) return alert('Please select your resume PDF first!');
    setApplying(true);
    setMessage('');
    try {
      // Step 1: Upload resume to Cloudinary
      const formData = new FormData();
      formData.append('resume', resumeFile);
      const uploadRes = await api.post('/upload-resume', formData);
      const resumeUrl = uploadRes.data.resumeUrl;

      // Step 2: Apply to the job with the returned Cloudinary URL
      await api.post(`/jobs/${id}/apply`, { resume: resumeUrl });
      setMessage('🎉 Application submitted successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Application failed. Try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  if (!job) return <div className="text-center mt-20 text-red-500">Job not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 mt-10">
      <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:underline mb-6 inline-block">
        ← Back to Job Board
      </button>

      <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">{job.title}</h1>
        <p className="text-gray-600 font-semibold mb-1">{job.company} • {job.location}</p>
        <p className="text-green-600 font-bold text-lg mb-6">${job.salary?.toLocaleString()} / year</p>

        <h3 className="text-xl font-semibold text-gray-800 mb-2">Job Description</h3>
        <p className="text-gray-600 leading-relaxed mb-8">{job.description}</p>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Apply for this Role</h3>
          <form onSubmit={handleApply} className="flex flex-col gap-4">
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition">
              <p className="text-sm text-gray-500">
                {resumeFile ? `✅ ${resumeFile.name}` : '📎 Click to upload your Resume (PDF)'}
              </p>
              <input type="file" accept=".pdf" className="hidden" onChange={e => setResumeFile(e.target.files[0])} />
            </label>

            <button
              type="submit"
              disabled={applying}
              className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow disabled:bg-gray-400"
            >
              {applying ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </form>

          {message && (
            <p className={`mt-4 text-center font-semibold ${message.startsWith('🎉') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
