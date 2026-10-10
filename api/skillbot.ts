import { GoogleGenAI } from '@google/genai';

interface RequestBody {
  question: string;
  currentModule?: string;
  currentLesson?: string;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
}

// System instruction tailored specifically for SkillLab students
const SKILLBOT_SYSTEM_INSTRUCTION = `
You are "SkillBot", the specialized AI learning tutor for "SkillLab" — a premier private college software engineering platform.
Your mission is to guide college students through modern software development concepts patiently, clearly, and practically.

Your students are currently learning through 8 progressive modules:
1. Modern Development Foundation (TypeScript, Component Architecture, Vite, Tailwind CSS)
2. Git & GitHub (Branching, Merge Conflicts, Rebase, PRs, CI Actions)
3. Project Creation (Monorepos, Linting, Dotenv, Secrets Security)
4. APIs & JSON (REST, HTTP Codes, Fetch/Axios, Zod Validation)
5. Databases (PostgreSQL, Supabase, Relational Schemas, Row Level Security)
6. AI Development (LLM Concepts, Gemini SDK, Structured Outputs, Streaming)
7. RAG & AI Applications (Vector Embeddings, Cosine Similarity, Chunking, Retrieval)
8. Final Project (Full-stack Capstone Architecture & Vercel Deployment)

Rules for your responses:
1. Beginner-friendly yet technically precise: Explain concepts in plain English with relatable analogies before showing code.
2. Provide concise, clean, typed code examples (TypeScript/React/SQL/Git CLI) whenever relevant.
3. Suggest 1 practical hands-on task or quick challenge at the end of your explanation to reinforce learning.
4. Tone: Encouraging, academic, structured, and developer-focused.
5. If asked about locked modules, remind the student that administrators unlock modules as the cohort progresses.
`;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY environment variable is not configured on the server.',
      content: 'SkillBot is running in academic standby mode. Please configure GEMINI_API_KEY in your server environment to enable live AI responses.'
    });
  }

  try {
    const { question, currentModule, currentLesson, conversationHistory }: RequestBody = req.body || {};

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question prompt is required.' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Build context-aware prompt
    const contextHeader = [
      currentModule ? `[Active Student Module: ${currentModule}]` : '',
      currentLesson ? `[Current Lesson: ${currentLesson}]` : '',
    ].filter(Boolean).join('\n');

    let promptContents = '';
    if (contextHeader) {
      promptContents += `${contextHeader}\n\n`;
    }

    if (conversationHistory && conversationHistory.length > 0) {
      promptContents += `Previous Conversation Context:\n`;
      conversationHistory.slice(-4).forEach(msg => {
        promptContents += `${msg.role.toUpperCase()}: ${msg.content}\n`;
      });
      promptContents += `\nCurrent Student Question:\n${question}`;
    } else {
      promptContents += `Student Question: ${question}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptContents,
      config: {
        systemInstruction: SKILLBOT_SYSTEM_INSTRUCTION,
        temperature: 0.6,
      },
    });

    const reply = response.text || "I processed your request, but received an empty response. Feel free to rephrase your question!";

    return res.status(200).json({
      content: reply,
      contextModule: currentModule || 'General Skill Lab',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('SkillBot Gemini Server Error:', error);
    let errorMessage = 'Failed to process AI response with Gemini API.';
    try {
      if (error?.message) {
        const parsed = JSON.parse(error.message);
        if (parsed?.error?.message) {
          errorMessage = parsed.error.message;
        } else {
          errorMessage = error.message;
        }
      }
    } catch {
      errorMessage = error?.message || errorMessage;
    }

    if (errorMessage.toLowerCase().includes('high demand') || errorMessage.toLowerCase().includes('unavailable')) {
      errorMessage = 'SkillBot is currently experiencing high demand. Please wait a moment and try your question again.';
    }

    return res.status(500).json({
      error: errorMessage,
    });
  }
}
