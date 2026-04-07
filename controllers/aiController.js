const pdfParse = require('pdf-parse');
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// @route   POST /api/ai/analyze-resume
const analyzeResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please upload a PDF resume' });

    // 1. TEXT EXTRACTION LOGIC
    // We fetch the PDF from the Cloudinary URL we generated natively in our Multer pipeline,
    // convert the raw binary into a 'Buffer', and use pdf-parse to rip 
    // the semantic English readable text out of the document!
    const response = await fetch(req.file.path);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let pdfData;
    try {
        pdfData = await pdfParse(buffer);
    } catch(e) {
        return res.status(400).json({ message: 'Failed to extract text from this PDF.' });
    }
    
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ message: 'Ensure your PDF contains readable text.' });
    }

    // 2. PROMPT ENGINEERING
    // We command the AI using strict JSON formatting Instructions.
    const aiPrompt = `
      You are an elite Senior Technical Recruiter.
      Analyze the following resume text.
      Return your analysis STRICTLY in minified JSON format exactly matching this structure, with no additional markdown, text, or \`\`\` block tags:
      {
        "score": (Extract a number from 1 to 100 based on grammar, impact, tech stack relevance, and structure),
        "missingSkills": (Array of 3-5 standard missing industry skills),
        "strengths": (Array of 3-5 strongest points in this resume),
        "suggestions": (Array of 3-5 actionable tips to improve ATS readability)
      }

      Resume Text:
      ${resumeText}
    `;

    // 3. OPENAI API INTERACTION
    // We send our prompt securely to OpenAI
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Cost-effective model perfect for basic text parsing
      messages: [{ role: "user", content: aiPrompt }],
      temperature: 0.3, // Lower temperature forces the AI to stick strictly to our structural UI rules!
      max_tokens: 500,  // FIXED: High API Cost limits
    });

    // 4. PARSING THE AI RESPONSE
    const rawAiText = aiResponse.choices[0].message.content.trim();
    // Safety Catch: Sometimes AI responds with "```json ... ```" even when told not to!
    const cleanJsonText = rawAiText.replace(/```json/gi, '').replace(/```/gi, ''); 
    const parsedData = JSON.parse(cleanJsonText);

    // 5. RETURN EXACT SPECS
    // We map precisely to the Object requested by the Frontend React Developer
    res.status(200).json({
      score: parsedData.score,
      missingSkills: parsedData.missingSkills || [],
      strengths: parsedData.strengths || [],
      suggestions: parsedData.suggestions || []
    });

  } catch (error) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ message: 'AI Analysis failed', error: error.message });
  }
};

// @route   POST /api/ai/match-jobs
// @desc    Compares user skills against live database jobs and generates AI ranking
const matchJobs = async (req, res) => {
  try {
    const { skills } = req.body;
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ message: "Please provide an array of skills in the JSON body." });
    }

    // 1. Fetch live jobs directly from MongoDB
    const Job = require('../models/Job');
    // We strictly select only necessary fields to save AI Token costs!
    const activeJobs = await Job.find().select('title description company _id');
    
    if (activeJobs.length === 0) {
      return res.status(404).json({ message: "No active jobs currently available to match against." });
    }

    // 2. Format the job feed so the AI can read it elegantly
    const jobsString = activeJobs.map(j => `ID: ${j._id} | Title: ${j.title} | Desc: ${j.description}`).join('\n');

    // 3. Strict Relational Prompt Engineering!
    const aiPrompt = `
      You are an expert Technical Recruiter matching a candidate to an active Job Board.
      Candidate Skills: ${skills.join(', ')}

      Active Jobs Board:
      ${jobsString}

      Compare the Candidate Skills precisely against the Job Descriptions.
      Return your analysis STRICTLY in minified JSON format.
      The output must be a pure JSON Array exactly following this structure, sorted by highest match first:
      [
        {
          "jobId": "Exact ID of the job",
          "matchPercentage": (Number between 1-100),
          "reason": "One short sentence why this candidate is a good match based on their skills"
        }
      ]
      No markdown, no backticks, no conversational text. Return top 5 matches maximally.
    `;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: aiPrompt }],
      temperature: 0.2, // Extremely rigid and analytical
      max_tokens: 400,  // FIXED: Throttles API costs
    });

    // 4. Parse the AI logic perfectly back into Javascript
    const cleanJsonText = aiResponse.choices[0].message.content.trim().replace(/```json/gi, '').replace(/```/gi, ''); 
    const matches = JSON.parse(cleanJsonText);

    res.status(200).json({ matches });
  } catch (error) {
    console.error("AI Match Error:", error);
    res.status(500).json({ message: 'AI Job Match Failed', error: error.message });
  }
};

// @route   POST /api/ai/generate-pitch
// @desc    Generates a highly persuasive "Why hire me" paragraph merging Resume and Job Description
const generatePitch = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: "Job ID is required in the structure." });
    if (!req.file) return res.status(400).json({ message: "Please upload your PDF resume." });

    // 1. Fetch Target Job Data from MongoDB
    const Job = require('../models/Job');
    const targetJob = await Job.findById(jobId);
    if (!targetJob) return res.status(404).json({ message: "Job not found." });

    // 2. Transpile Resume PDF from Cloudinary URL to English Text
    const pdfResponse = await fetch(req.file.path);
    const arrayBuffer = await pdfResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let pdfData;
    try {
        pdfData = await pdfParse(buffer);
    } catch(e) {
        return res.status(400).json({ message: 'Failed to extract text from PDF.' });
    }
    const resumeText = pdfData.text;

    // 3. Relational Pitch Generation Prompt
    const aiPrompt = `
      You are an expert career coach writing a highly persuasive "Why should we hire you?" pitch for a candidate.
      
      Candidate's Resume Extract:
      ${resumeText}

      Target Job Role: ${targetJob.title} at ${targetJob.company}
      Job Description:
      ${targetJob.description}

      Write a compelling, professional, and confident pitch (approximately 150-200 words).
      Strictly connect the candidate's actual extracted skills directly to the needs outlined in the job description. Do not hallucinate or invent skills they do not have.
      
      Return your response STRICTLY as a minified JSON object:
      {
        "pitch": "The generated paragraph text spanning the pitch..."
      }
      No markdown, no conversation.
    `;

    // We increase 'temperature' to 0.7 here so the AI is more persuasive and creative with its vocabulary!
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: aiPrompt }],
      temperature: 0.7, 
      max_tokens: 350,  // FIXED: Approx 250 words max to prevent run-away AI hallucination costs!
    });

    const cleanJsonText = aiResponse.choices[0].message.content.trim().replace(/```json/gi, '').replace(/```/gi, ''); 
    const result = JSON.parse(cleanJsonText);

    res.status(200).json({ pitch: result.pitch });

  } catch(error) {
     console.error("AI Pitch Error:", error);
     res.status(500).json({ message: 'Failed to generate pitch', error: error.message });
  }
};

module.exports = { analyzeResume, matchJobs, generatePitch };
