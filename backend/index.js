import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// google api key
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
//key not present
if (!GOOGLE_API_KEY) {
  console.error("ERROR: GOOGLE_API_KEY missing in .env");
  process.exit(1);
}
//store the 5 questions extracted at a time
const questionsCache = {};

// Helper function to call Google AI 
async function generateText(promptText) {
  try {
    // Using gemini-1.5-flash model which is available in your account
    const modelName = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GOOGLE_API_KEY}`;
    
    const requestBody = {
      contents: [
        {
          parts: [
            { text: promptText }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 256,
      }
    };

    console.log(`Using model: ${modelName}`);
    const response = await axios.post(url, requestBody);
    
    // Extract text from the response of gemini answer
    if (response.data.candidates && response.data.candidates[0]?.content?.parts?.[0]?.text) {
      return response.data.candidates[0].content.parts[0].text;
    } else {
      console.log("Unexpected response structure:", JSON.stringify(response.data, null, 2));
      return "Failed to parse response";
    }
  } catch (err) {
    console.error("Error generating text:", err.response?.data || err.message);
    throw new Error("Failed to generate text with available models.");
  }
}

// Completely rewritten function to better handle JSON extraction
function extractJsonFromText(text) {
  // First, try to extract JSON from code blocks
  const jsonRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
  const codeBlockMatch = text.match(jsonRegex);
  
  if (codeBlockMatch && codeBlockMatch[1]) {
    const jsonContent = codeBlockMatch[1].trim();
    try {
      return JSON.parse(jsonContent);
    } catch (e) {
      console.log("Failed to parse JSON from code block:", e.message);
      console.log("JSON content that failed:", jsonContent);
    }
  }
  
  // Second, try to find JSON-like content without code blocks
  const jsonStartIdx = text.indexOf('{');
  const jsonEndIdx = text.lastIndexOf('}');
  
  if (jsonStartIdx !== -1 && jsonEndIdx !== -1 && jsonEndIdx > jsonStartIdx) {
    const jsonContent = text.substring(jsonStartIdx, jsonEndIdx + 1);
    try {
      return JSON.parse(jsonContent);
    } catch (e) {
      console.log("Failed to parse JSON content:", e.message);
    }
  }
  
  // Third approach: manually extract key fields
  // For score extraction
  const scoreRegex = /["']?score["']?\s*:\s*(\d+)/i;
  const scoreMatch = text.match(scoreRegex);
  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
  
  // For feedback extraction
  const feedbackRegex = /["']?feedback["']?\s*:\s*["']([^"']+)["']/i;
  const feedbackMatch = text.match(feedbackRegex);
  let feedback = feedbackMatch ? feedbackMatch[1] : "";
  
  if (!feedback) {
    // Try with multiline approach
    const feedbackStartIdx = text.indexOf('"feedback"');
    if (feedbackStartIdx !== -1) {
      const startQuoteIdx = text.indexOf('"', feedbackStartIdx + 10); // Find first quote after "feedback"
      if (startQuoteIdx !== -1) {
        const endQuoteIdx = text.indexOf('"', startQuoteIdx + 1); // Find closing quote
        if (endQuoteIdx !== -1) {
          feedback = text.substring(startQuoteIdx + 1, endQuoteIdx);
        }
      }
    }
  }
  
  // For idealAnswer extraction
  const idealAnswerRegex = /["']?idealAnswer["']?\s*:\s*["']([^"']+)["']/i;
  const idealAnswerMatch = text.match(idealAnswerRegex);
  let idealAnswer = idealAnswerMatch ? idealAnswerMatch[1] : "";
  
  if (!idealAnswer) {
    // Try with multiline approach
    const idealStartIdx = text.indexOf('"idealAnswer"');
    if (idealStartIdx !== -1) {
      const startQuoteIdx = text.indexOf('"', idealStartIdx + 13); // Find first quote after "idealAnswer"
      if (startQuoteIdx !== -1) {
        const endQuoteIdx = text.indexOf('"', startQuoteIdx + 1); // Find closing quote
        if (endQuoteIdx !== -1) {
          idealAnswer = text.substring(startQuoteIdx + 1, endQuoteIdx);
        }
      }
    }
  }
  
  // If we still don't have good data, extract content between key phrases
  if (!feedback || !idealAnswer) {
    // Look for feedback section
    const feedbackStartPhrases = ["feedback:", "Feedback:", "FEEDBACK:"];
    const idealStartPhrases = ["ideal answer:", "Ideal Answer:", "IDEAL ANSWER:", "model answer:", "Model Answer:"];
    
    for (const phrase of feedbackStartPhrases) {
      const phraseIdx = text.indexOf(phrase);
      if (phraseIdx !== -1) {
        // Find the end of this section (either next section or end of text)
        let endIdx = text.length;
        for (const idealPhrase of idealStartPhrases) {
          const idealIdx = text.indexOf(idealPhrase, phraseIdx);
          if (idealIdx !== -1 && idealIdx < endIdx) {
            endIdx = idealIdx;
            break;
          }
        }
        feedback = text.substring(phraseIdx + phrase.length, endIdx).trim();
        break;
      }
    }
    
    // Look for ideal answer section
    for (const phrase of idealStartPhrases) {
      const phraseIdx = text.indexOf(phrase);
      if (phraseIdx !== -1) {
        idealAnswer = text.substring(phraseIdx + phrase.length).trim();
        break;
      }
    }
  }
  
  // If parsing fails, look for lines with key phrases
  if (!feedback) {
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('feedback') && !line.toLowerCase().includes('ideal')) {
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
          feedback = line.substring(colonIdx + 1).trim();
          break;
        }
      }
    }
  }
  
  if (!idealAnswer) {
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('ideal') || line.toLowerCase().includes('model')) {
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
          idealAnswer = line.substring(colonIdx + 1).trim();
          break;
        }
      }
    }
  }
  
  // Fallback values if we still don't have good data
  if (!feedback) {
    feedback = "Unable to extract feedback from response.";
  }
  
  if (!idealAnswer) {
    idealAnswer = "Unable to extract ideal answer from response.";
  }
  
  return {
    score,
    feedback,
    idealAnswer
  };
}

// API for getting questions from gemini - fixed to avoid repeating questions
app.post("/api/get-question", async (req, res) => {
  try {
    const { topic, questionIndex } = req.body;
    if (!topic || typeof questionIndex !== "number") {
      return res.status(400).json({ error: "topic and questionIndex required" });
    }

    // Check if we have questions cached for this topic
    if (!questionsCache[topic]) {
      // Using a more specific prompt to get properly formatted questions
      const prompt = `
Generate 5 unique and challenging technical interview questions on the topic "${topic}". 
Make sure the questions are diverse and cover different aspects of the topic.
Return the questions as a numbered list, with each question on a new line.
Do not include answers, just the questions.
`;
      const output = await generateText(prompt);
      console.log("Google Gemini /get-question output:", output);

      // Process the output to extract the questions
      // Split by lines and filter out empty lines and numbering
      const questions = output
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && line.length > 5) // Minimum length to avoid headers/footers
        .map(line => {
          // Remove numbering (e.g., "1. ", "1) ", etc.)
          return line.replace(/^\d+[\.\)]\s*/, '');
        });
      
      // Ensure we have at least 5 questions
      if (questions.length < 5) {
        console.log("Not enough questions generated, filling with defaults");
        while (questions.length < 5) {
          questions.push(`Backup question about ${topic} #${questions.length + 1}`);
        }
      }
      
      // Store in cache
      questionsCache[topic] = questions;
      console.log(`Cached ${questions.length} questions for topic ${topic}`);
    }

    const questions = questionsCache[topic];
    if (questionIndex >= questions.length) {
      return res.json({ question: null, message: "No more questions" });
    }

    res.json({ question: questions[questionIndex] });
  } catch (err) {
    console.error("Error details:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to get question" });
  }
});

// API for getting review feedback and score for the same answer - improved JSON handling
app.post("/api/submit-answer", async (req, res) => {
  try {
    const { topic, question, answer } = req.body;
    if (!topic || !question || !answer) {
      return res.status(400).json({ error: "topic, question, and answer are required" });
    }

    // More specific prompt to ensure consistent formatting
    const prompt = `
You are an expert technical interviewer assessing candidates for a ${topic} position. 
Evaluate the following answer to a technical interview question.

Question: "${question}"
Candidate's Answer: "${answer}"

Provide your assessment in this exact JSON format:
{
  "score": <number between 0 and 10>,
  "feedback": "<detailed constructive feedback on the candidate's answer>",
  "idealAnswer": "<a comprehensive model answer to this question>"
}

Rate honestly based on technical accuracy, completeness, and communication clarity.
`;

    const output = await generateText(prompt);
    console.log("Google Gemini /submit-answer output:", output);

    // Extract and validate the score data
    const rawScoreData = extractJsonFromText(output);
    
    // Ensure we have valid data
    const scoreData = {
      score: typeof rawScoreData.score === 'number' ? rawScoreData.score : 0,
      feedback: rawScoreData.feedback || "Unable to provide feedback at this time.",
      idealAnswer: rawScoreData.idealAnswer || "Unable to provide an ideal answer at this time."
    };
    
    console.log("Processed score data:", scoreData);
    res.json(scoreData);
  } catch (err) {
    console.error("Error details:", err.response?.data || err.message);
    res.status(500).json({ 
      error: "Failed to submit answer",
      score: 0,
      feedback: "An error occurred while evaluating your answer. Please try again.",
      idealAnswer: "Not available due to system error."
    });
  }
});

app.get("/", (req, res) => {
  res.send("Interview Prep Backend Running");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});