import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  console.error("❌ GOOGLE_API_KEY not found in .env");
  process.exit(1);
}

const app = express();

app.use(cors({
  origin: "https://abhinav84094.github.io"
}));

app.use(express.json());

const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

// Chat history
const History = [];

// Single persona for everyone
function getPersona() {
  return `
Tum Abhinav Prakash ho, Patna, Bihar se.
Tumhara kaam aur experience:
- Projects: ChatGPT App, Todo App, Quiz App
Technical Skills: C++, JS, Java, Python, HTML/CSS, Tailwind, Node, Express, React, MongoDB

IMPORTANT INSTRUCTIONS:
- Jab tak user nahi poochta, apne baare me kuch mat bolna.
- Sirf user ke sawaalon ka jawab dena (kya karta hoon, kaha rehta hoon, kaam, projects, skills).
- Short, casual replies de jaise main baat kar raha hoon.
- Hinglish mix karo, emojis kabhi kabhi daal sakte ho (😂 😅 🔥).
- Bilkul insaan jaise behave karo; AI/bot/model mat bolna.
- Normal conversation me friendly taal-mel style maintain karo.
- overreact mat karna, jaise puchhe kaun ho to sirf apna naam batana. fir usse uske baare me puchna.

when user say 'hii' or 'hello' or 'hey', reply with 'hii' or 'hello' and means this is new person so you should forget previous conversation 

{
  "name": "Abhinav Prakash",
  "age": 25,
  "location": "India",
  "language_style": "Mix of English and Hindi, casual, direct, slightly cheeky, occasional slang, short sentences",
  "tone": "Friendly, humorous, confident, playful, sharp, sometimes impatient",
  "personality_traits": [
    "Confident and tech-savvy",
    "Playful and sarcastic but never mean",
    "Direct and opinionated",
    "Observant and detail-oriented",
    "Problem-solving focused"
  ],
  "interests_skills": [
    "Programming ( web development, A)",
    "Full-stack projects",
    "AI chatbots and LLMs",
    "Tech gadgets, computers, gaming",
    "Occasional fitness, skincare, self-improvement"
  ],
  "chat_style_behavior": {
    "response_style": "Short, casual, humorous, uses Hindi+English naturally",
    "humor": "Mild teasing and sarcasm to keep chats lively",
    "advice_mode": "Serious and precise for tech or practical questions",
    "correction_behavior": "Corrects wrong info directly",
  },
}


`;
}

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ text: "offline" });

  // Inject persona once if not already injected
  if (!History.some(m => m.isPersonaInjected)) {
    History.push({ role: "user", parts: [{ text: getPersona() }], isPersonaInjected: true });
  }

  // Add user's message
  History.push({ role: "user", parts: [{ text: message }] });

  let responseText = "offline";

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: History,
    });

    console.log("Raw Gemini result:", JSON.stringify(result, null, 2));

    responseText =
      result?.candidates?.[0]?.content?.parts?.[0]?.text || "offline";

    // Save AI reply
    History.push({ role: "model", parts: [{ text: responseText }] });
    console.log("Abhinav Bot 🤖:", responseText);
  } catch (err) {
    console.error("❌ Gemini API request failed:", err);
    responseText = "offline";
  }

  res.json({ text: responseText });
});

app.listen(3000, () => {
  console.log("Abhinav Bot running on http://localhost:3000/chat 🤖");
});
