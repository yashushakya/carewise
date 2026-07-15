require("dotenv").config();
const express = require("express");
const router = express.Router();
const axios = require("axios");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

console.log(
  "OpenRouter Key loaded:",
  process.env.OPENROUTER_API_KEY ? "YES ✅" : "NO ❌ — check your .env file"
);

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const TEXT_MODEL = "meta-llama/llama-3.1-8b-instruct";

// Vision model — free tier on OpenRouter that supports images
// This is different from the chat model because it needs to "see"
const VISION_MODEL = "meta-llama/llama-3.2-11b-vision-instruct:free";

// Multer setup — saves uploaded files temporarily to uploads/ folder
// We delete the file immediately after processing
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// ── SYSTEM PROMPTS ────────────────────────────────────────────────────────────

const CHAT_SYSTEM_PROMPT = `You are CareWise, an empathetic AI health assistant for an Indian healthcare platform.

YOUR CONVERSATION STYLE:
- You have a warm, doctor-like conversational approach
- You do NOT dump all information at once
- You ask ONE follow-up question at a time to understand better
- Only after gathering enough information do you give a summary

YOUR EXACT APPROACH FOR EVERY NEW SYMPTOM:
Step 1 — Acknowledge what the user said warmly
Step 2 — Ask ONE specific follow-up question (duration, severity, location, other symptoms, etc.)
Step 3 — Wait for their answer
Step 4 — Ask another follow-up if needed (maximum 2-3 follow-ups total)
Step 5 — Then give your assessment with possible causes, first aid, and doctor recommendation

GOOD EXAMPLE of how you should behave:
User: "I have chest tightness"
You: "I'm sorry to hear that. To understand better — how long have you been feeling this chest tightness? Did it start suddenly or gradually?"

User: "Since this morning, it started suddenly"
You: "Got it. Is the tightness constant or does it come and go? And do you feel any pain spreading to your arm, jaw, or back?"

User: "It comes and goes, no spreading pain"
You: "Thank you for sharing that. Based on what you've described, possible causes may include:
- Anxiety or stress
- Muscle strain
- Acid reflux
First aid: Try slow deep breaths and rest. Avoid caffeine.
See a: General Physician first.
⚠️ This is not a medical diagnosis. Please consult a qualified doctor."

BAD EXAMPLE — never do this:
User: "I have chest tightness"
You: [immediately lists 6 causes + 5 remedies + doctor types all at once] ← WRONG

FOLLOW-UP QUESTIONS TO ROTATE THROUGH (pick the most relevant one at a time):
- How long have you had this symptom?
- Did it start suddenly or gradually?
- Is it constant or does it come and go?
- On a scale of 1-10, how severe is it?
- Do you have any other symptoms along with this?
- Does anything make it better or worse?
- Do you have any existing medical conditions or allergies?
- Have you taken any medication for this?

RULES:
- Never diagnose — always say "possible causes may include..."
- Keep each response SHORT — maximum 4-5 lines until final assessment
- Always end your FINAL assessment with: ⚠️ This is not a medical diagnosis. Please consult a qualified doctor.
- If user mentions chest pain + arm pain + sweating together — immediately say CALL 108 NOW
- Only discuss health topics`;

const REPORT_SYSTEM_PROMPT = `You are a medical report interpreter for CareWise, an Indian healthcare platform.

A patient has uploaded their medical report and needs help understanding it in simple language.

YOUR JOB:
1. Give a plain-language summary of what the report shows
2. List key findings clearly
3. Highlight any values that are abnormal or outside normal range
4. Explain what abnormal values might mean in simple terms
5. Recommend which type of doctor they should consult
6. Suggest any immediate actions if values are critically abnormal

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

📋 SUMMARY
[2-3 sentence overview of the report]

🔍 KEY FINDINGS
[List each important value with: name, value, normal range, and status — Normal/High/Low]

⚠️ ABNORMAL VALUES
[Explain any abnormal values in simple language]

👨‍⚕️ RECOMMENDED DOCTOR
[Which specialist to see]

💡 NEXT STEPS
[What the patient should do]

⚠️ This is not a medical diagnosis. Please consult a qualified doctor to discuss these results.

RULES:
- Use simple language — no heavy medical jargon
- If you cannot find specific values, say so clearly
- Never guess values that are not in the report
- Always be reassuring but honest`;

const IMAGE_SYSTEM_PROMPT = `You are a medical image observer for CareWise, an Indian healthcare platform.

A patient has shared an image of a physical condition (skin issue, rash, wound, swelling, etc.) and needs guidance.

YOUR JOB:
1. Describe what you visually observe in the image
2. List possible conditions it could indicate
3. Recommend which specialist to consult
4. Assess urgency level
5. Give basic care tips

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

👁️ WHAT I OBSERVE
[Describe what you see — color, texture, size, location, pattern]

🔍 POSSIBLE CONDITIONS
[List 2-4 possible conditions from most to least likely]

👨‍⚕️ RECOMMENDED SPECIALIST
[Which type of doctor to see]

🚨 URGENCY LEVEL
[One of: Monitor at home / See doctor within a few days / See doctor today / Go to emergency now]

💊 BASIC CARE TIPS
[Immediate steps while waiting to see a doctor]

⚠️ This is NOT a medical diagnosis. Please consult a qualified doctor for proper evaluation and treatment.

RULES:
- Be factual and calm — do not alarm unnecessarily
- If the image is unclear, say so and ask for a clearer photo
- Never claim certainty about any condition
- Always recommend professional consultation`;

// ── Helper: call OpenRouter with text messages ────────────────────────────────
async function callOpenRouter(messages, model = TEXT_MODEL) {
  const response = await axios.post(
    OPENROUTER_API_URL,
    {
      model,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "CareWise Health Assistant",
      },
      timeout: 60000, // 60 seconds for file analysis
    }
  );

  const reply = response.data.choices?.[0]?.message?.content;
  if (!reply) throw new Error("Empty response from OpenRouter");
  return reply;
}

// ── Helper: handle OpenRouter errors consistently ────────────────────────────
function handleAIError(err, res) {
  console.error("=== OpenRouter Error ===");
  console.error("Message:", err.message);
  console.error("Status:", err.response?.status);
  console.error("Data:", JSON.stringify(err.response?.data, null, 2));
  console.error("=======================");

  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({ message: "OPENROUTER_API_KEY is missing from .env file." });
  }
  if (err.response?.status === 401) {
    return res.status(401).json({ message: "Invalid OpenRouter API key." });
  }
  if (err.response?.status === 429) {
    return res.status(429).json({ message: "Rate limit reached. Please wait a moment." });
  }
  if (err.response?.status === 402) {
    return res.status(402).json({ message: "OpenRouter credit issue. Switch to a free model." });
  }
  if (err.code === "ECONNABORTED") {
    return res.status(504).json({ message: "Request timed out. Please try again." });
  }
  return res.status(500).json({ message: "AI error: " + err.message });
}

// ── POST /api/ai/chat ─────────────────────────────────────────────────────────
router.post("/chat", async (req, res) => {
  try {
    const { messages, userProfile, recentAppointments } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "Messages array is required." });
    }

    let contextBlock = "";

    if (userProfile) {
      contextBlock += `[USER HEALTH PROFILE]
Name: ${userProfile.name || "Not provided"}
Age: ${userProfile.age || "Not provided"}
Gender: ${userProfile.gender || "Not provided"}
Blood Group: ${userProfile.bloodGroup || "Not provided"}
Height: ${userProfile.height ? userProfile.height + " cm" : "Not provided"}
Weight: ${userProfile.weight ? userProfile.weight + " kg" : "Not provided"}
Known Allergies: ${userProfile.allergies?.length ? userProfile.allergies.join(", ") : "None"}
Existing Conditions: ${userProfile.diseases?.length ? userProfile.diseases.join(", ") : "None"}
`;
    }

    if (recentAppointments && recentAppointments.length > 0) {
      contextBlock += `\n[RECENT APPOINTMENTS]\n`;
      recentAppointments.slice(0, 3).forEach((appt, i) => {
        contextBlock += `${i + 1}. Dr. ${appt.doctorName} (${appt.specialty}) on ${appt.date} — Status: ${appt.status}\n`;
      });
    }

    const openRouterMessages = [
      { role: "system", content: CHAT_SYSTEM_PROMPT },
    ];

    if (contextBlock) {
      openRouterMessages.push({
        role: "system",
        content: `Here is the current user's health information. Use this to personalize your responses:\n${contextBlock}`,
      });
    }

    const conversationMessages = messages
      .filter((m) => m.content && m.content.trim())
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

    openRouterMessages.push(...conversationMessages);

    const reply = await callOpenRouter(openRouterMessages, TEXT_MODEL);
    res.json({ reply });

  } catch (err) {
    handleAIError(err, res);
  }
});

// ── POST /api/ai/report ───────────────────────────────────────────────────────
// Accepts a PDF file, extracts text, sends to AI for plain-language summary
router.post("/report", upload.single("report"), async (req, res) => {
  // req.file is set by multer after successful upload
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded. Please select a PDF." });
  }

  // Only allow PDF files
  if (req.file.mimetype !== "application/pdf") {
    // Delete the wrongly uploaded file
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: "Only PDF files are supported." });
  }

  let filePath = req.file.path;

  try {
    // Read the PDF file as a buffer
    const dataBuffer = fs.readFileSync(filePath);

    // Extract text from PDF
    // pdf-parse reads the binary PDF and pulls out all text content
    const pdfData = await pdfParse(dataBuffer);

    // Delete the uploaded file immediately — we have the text now
    fs.unlinkSync(filePath);
    filePath = null;

    const extractedText = pdfData.text.trim();

    if (!extractedText || extractedText.length < 20) {
      return res.status(400).json({
        message: "Could not extract text from this PDF. It may be a scanned image PDF. Please try a text-based PDF.",
      });
    }

    // Limit text to 3000 characters to stay within token limits
    // Most medical reports have all important info in first 3000 chars
    const truncatedText = extractedText.slice(0, 3000);

    // Send extracted text to AI for analysis
    const messages = [
      { role: "system", content: REPORT_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Please analyze this medical report and explain it in simple language:\n\n${truncatedText}`,
      },
    ];

    const summary = await callOpenRouter(messages, TEXT_MODEL);

    res.json({
      summary,
      // Send character count so frontend can show it
      textLength: extractedText.length,
    });

  } catch (err) {
    // Always clean up uploaded file even if something goes wrong
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    handleAIError(err, res);
  }
});

// ── POST /api/ai/image ────────────────────────────────────────────────────────
// Accepts an image file, converts to base64, sends to vision AI model
router.post("/image", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image uploaded. Please select an image." });
  }

  // Allowed image types
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(req.file.mimetype)) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: "Only JPEG, PNG, or WebP images are supported." });
  }

  let filePath = req.file.path;

  try {
    // Read image and convert to base64
    // This is how you send images through an API — as a base64 string
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString("base64");
    const mimeType = req.file.mimetype;

    // Delete uploaded file — we have the base64 now
    fs.unlinkSync(filePath);
    filePath = null;

    // Vision models accept a special message format
    // The content is an array with both text and image parts
    const messages = [
      { role: "system", content: IMAGE_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            // Text part — the instruction
            type: "text",
            text: "Please analyze this medical image and provide your observations following the format in your instructions.",
          },
          {
            // Image part — base64 encoded
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
        ],
      },
    ];

    // Use vision model for image analysis
    const analysis = await callOpenRouter(messages, VISION_MODEL);

    res.json({ analysis });

  } catch (err) {
    // Clean up file on error
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Vision model specific error
    if (err.response?.status === 404 || err.message?.includes("not found")) {
      return res.status(500).json({
        message: "Vision model unavailable. Image analysis requires a vision-capable model.",
      });
    }

    handleAIError(err, res);
  }
});

module.exports = router;