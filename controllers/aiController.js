const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper: Read PDF buffer from either a local disk file or a remote URL
const getPdfBuffer = async (file) => {
  if (file.buffer) return file.buffer;
  if (file.path && !file.path.startsWith('http')) {
    return fs.readFileSync(file.path);
  }
  const response = await fetch(file.path);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

// Helper: Call Gemini and get text response
const askGemini = async (prompt) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

// @route   POST /api/ai/analyze-resume
const analyzeResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please upload a PDF resume' });

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
      return res.status(503).json({
        message: 'Gemini API key not configured. Add GEMINI_API_KEY to your .env file.',
        hint: 'Get your FREE key from https://aistudio.google.com/app/apikey'
      });
    }

    // 1. Extract text from PDF
    const buffer = await getPdfBuffer(req.file);
    let pdfData;
    try {
      pdfData = await pdfParse(buffer);
    } catch (e) {
      return res.status(400).json({ message: 'Failed to read PDF. Make sure it contains selectable text, not scanned images.' });
    }

    const resumeText = pdfData.text;
    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ message: 'Resume appears empty or too short to analyze.' });
    }

    // 2. Send to Gemini
    const prompt = `
      You are an elite Senior Technical Recruiter. Analyze the following resume text.
      Return your analysis STRICTLY as a raw JSON object with NO markdown, NO backticks, NO explanation — only valid JSON.
      Use exactly this structure:
      {"score":85,"missingSkills":["Docker","AWS","Kubernetes"],"strengths":["Strong React experience","Good project structure"],"suggestions":["Add measurable achievements","Include GitHub links"]}

      Resume Text:
      ${resumeText.substring(0, 3000)}
    `;

    const rawText = await askGemini(prompt);
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    const parsed = JSON.parse(cleanJson);

    res.status(200).json({
      score: parsed.score,
      missingSkills: parsed.missingSkills || [],
      strengths: parsed.strengths || [],
      suggestions: parsed.suggestions || []
    });

  } catch (error) {
    console.error('AI Analysis Error:', error);
    if (error.message && error.message.includes('429')) {
      // Graceful fallback when Gemini quota is exhausted
      return res.status(200).json({
        score: 82,
        missingSkills: ["System Design", "Cloud Architecture (AWS/GCP)"],
        strengths: ["Strong technical foundation", "Good project experience"],
        suggestions: [
          "⚠️ Your Google Gemini Free API quota is currently exhausted.",
          "Please generate a new API key in a NEW Project on Google AI Studio.",
          "This is a fallback analysis to keep the app working."
        ]
      });
    }
    res.status(500).json({ message: 'AI Analysis failed: ' + error.message });
  }
};

// @route   POST /api/ai/job-match
const matchJobs = async (req, res) => {
  try {
    const { skills } = req.body;
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ message: 'Please provide an array of skills.' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
      return res.status(503).json({ message: 'Gemini API key not configured.' });
    }

    const Job = require('../models/Job');
    const activeJobs = await Job.find().select('title description company _id');

    if (activeJobs.length === 0) {
      return res.status(404).json({ message: 'No active jobs to match against.' });
    }

    const jobsString = activeJobs.map(j => `ID: ${j._id} | Title: ${j.title} | Desc: ${j.description}`).join('\n');

    const prompt = `
      You are an expert Technical Recruiter. Match this candidate to the best jobs.
      Candidate Skills: ${skills.join(', ')}

      Available Jobs:
      ${jobsString}

      Return STRICTLY raw JSON Array only — no markdown, no backticks. Top 5 matches sorted by highest match:
      [{"jobId":"exact_id","matchPercentage":90,"reason":"Short reason here"}]
    `;

    const rawText = await askGemini(prompt);
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    const matches = JSON.parse(cleanJson);

    res.status(200).json({ matches });
  } catch (error) {
    console.error('AI Match Error:', error);
    if (error.message && error.message.includes('429')) {
      return res.status(200).json({ 
        matches: [
          { jobId: "Fallback-Mode", matchPercentage: 85, reason: "⚠️ Gemini API quota exceeded. Please use a fresh API key from a new project." }
        ] 
      });
    }
    res.status(500).json({ message: 'AI Job Match Failed: ' + error.message });
  }
};

// @route   POST /api/ai/generate-pitch
const generatePitch = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'Job ID is required.' });
    if (!req.file) return res.status(400).json({ message: 'Please upload your PDF resume.' });

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
      return res.status(503).json({ message: 'Gemini API key not configured.' });
    }

    const Job = require('../models/Job');
    const targetJob = await Job.findById(jobId);
    if (!targetJob) return res.status(404).json({ message: 'Job not found.' });

    const buffer = await getPdfBuffer(req.file);
    let pdfData;
    try {
      pdfData = await pdfParse(buffer);
    } catch (e) {
      return res.status(400).json({ message: 'Failed to extract text from PDF.' });
    }

    const resumeText = pdfData.text;

    const prompt = `
      You are an expert career coach. Write a persuasive "Why should we hire you?" pitch.

      Candidate Resume:
      ${resumeText.substring(0, 2000)}

      Target Job: ${targetJob.title} at ${targetJob.company}
      Job Description: ${targetJob.description}

      Write a compelling, professional pitch (150-200 words) connecting candidate's actual skills to the job.
      Return STRICTLY raw JSON only — no markdown, no backticks:
      {"pitch":"Your pitch text here..."}
    `;

    const rawText = await askGemini(prompt);
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    const result = JSON.parse(cleanJson);

    res.status(200).json({ pitch: result.pitch });
  } catch (error) {
    console.error('AI Pitch Error:', error);
    if (error.message && error.message.includes('429')) {
      return res.status(200).json({ 
        pitch: "⚠️ [Automated Fallback Pitch] Your Gemini API daily quota is currently exhausted. To generate a customized, real AI pitch, please create a new project in Google AI Studio and update your GEMINI_API_KEY." 
      });
    }
    res.status(500).json({ message: 'Failed to generate pitch: ' + error.message });
  }
};

module.exports = { analyzeResume, matchJobs, generatePitch };
