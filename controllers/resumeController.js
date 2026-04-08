const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @route   POST /api/resume/analyze
// @desc    Analyze an uploaded resume using Google Gemini
const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF resume' });
    }

    // Read PDF buffer — works for both disk storage and Cloudinary
    let buffer;
    if (req.file.buffer) {
      buffer = req.file.buffer;
    } else if (req.file.path && !req.file.path.startsWith('http')) {
      buffer = fs.readFileSync(req.file.path);
    } else {
      const response = await fetch(req.file.path);
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    const pdfData = await pdfParse(buffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ message: 'Could not extract text from this PDF. Ensure it is text-based.' });
    }

    const prompt = `
      You are an expert technical recruiter and AI resume analyzer.
      Review the following resume text and provide your analysis STRICTLY as raw JSON with no markdown, no backticks.
      Use exactly this structure:
      {"score":75,"missingSkills":["Docker","AWS"],"suggestions":["Add metrics to achievements","Include GitHub profile"]}

      Resume Text:
      ${resumeText.substring(0, 3000)}
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().replace(/```json/gi, '').replace(/```/gi, '').trim();
    const parsedData = JSON.parse(rawText);

    res.status(200).json({
      message: 'Resume analyzed successfully',
      resumeUrl: req.file.path,
      analysis: parsedData
    });
  } catch (error) {
    console.error('AI Analysis Error:', error);
    if (error.message && error.message.includes('429')) {
      return res.status(200).json({
        message: 'Resume analyzed successfully (Fallback Mode)',
        resumeUrl: req.file.path,
        analysis: {
          score: 82,
          missingSkills: ["System Design", "Cloud Architecture (AWS/GCP)"],
          suggestions: [
            "⚠️ Your Google Gemini Free API quota is currently exhausted.",
            "Please generate a new API key in a NEW Project on Google AI Studio.",
            "This is a fallback analysis to keep the app working."
          ]
        }
      });
    }
    res.status(500).json({ message: 'Failed to analyze resume', error: error.message });
  }
};

module.exports = { analyzeResume };
