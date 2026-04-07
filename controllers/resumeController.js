const pdfParse = require('pdf-parse');
const { OpenAI } = require('openai');

// Initialize OpenAI using the API key from our environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// @route   POST /api/resume/analyze
// @desc    Analyze an uploaded resume using OpenAI
const analyzeResume = async (req, res) => {
  try {
    // 1. Ensure a file was actually uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF resume' });
    }

    // 2. Multer + Cloudinary already saved the file, giving us a live URL
    const resumeUrl = req.file.path;

    // 3. Download the PDF file stream from Cloudinary
    const response = await fetch(resumeUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer); // Convert to Node.js Buffer for parsing

    // 4. Extract raw text from the PDF Buffer
    const pdfData = await pdfParse(buffer);
    const resumeText = pdfData.text;

    // If the PDF is completely empty or just an image, pdf-parse will fail
    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ message: 'Could not extract text from this PDF. Ensure it is text-based.' });
    }

    // 5. Structure a specific "Prompt" to command the AI exactly how to respond
    const aiPrompt = `
      You are an expert technical recruiter and AI resume analyzer.
      Review the following resume text and provide your analysis format STRICTLY in JSON.
      Do not include markdown block ticks like \`\`\`json. Only output pure JSON.
      
      Format your response exactly like this:
      {
        "score": (Extract a number from 1 to 100 representing the resume's overall quality and impact),
        "missingSkills": (Provide an array of strings detailing 3-5 standard industry skills this resume is missing),
        "suggestions": (Provide an array of strings outlining actionable tips to improve this resume)
      }

      Resume Text to Analyze:
      ${resumeText}
    `;

    // 6. Send the prompt to the OpenAI API Model
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // You can use gpt-4 or gpt-4o for higher accuracy
      messages: [{ role: "user", content: aiPrompt }],
      temperature: 0.5, // 0 is robotic/strict, 1 is highly creative. 0.5 is balanced.
    });

    // 7. Extract the stringified JSON from OpenAI and parse it
    const aiDataString = aiResponse.choices[0].message.content;
    const parsedData = JSON.parse(aiDataString);

    // 8. Return everything gracefully to the user!
    res.status(200).json({
      message: 'Resume analyzed successfully',
      resumeUrl: resumeUrl,
      analysis: parsedData
    });
  } catch (error) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ message: 'Failed to analyze resume', error: error.message });
  }
};

module.exports = { analyzeResume };
