import { GoogleGenAI } from '@google/genai';

interface RequestBody {
  question: string;
  currentModule?: string;
  currentLesson?: string;
  conversationHistory?: {
    role: 'user' | 'assistant';
    content: string;
  }[];
}


const SKILLBOT_SYSTEM_INSTRUCTION = `
You are "SkillBot", the specialized AI learning tutor for "SkillLab" — a college software engineering learning platform.
Guide students through modern software development concepts patiently, clearly, and practically.

Your students are learning through these 8 progressive modules:
1. Modern Development Foundation (TypeScript, Component Architecture, Vite, Tailwind CSS)
2. Git & GitHub (Branching, Merge Conflicts, Rebase, PRs, CI Actions)
3. Project Creation (Monorepos, Linting, Dotenv, Secrets Security)
4. APIs & JSON (REST, HTTP Codes, Fetch/Axios, Zod Validation)
5. Databases (PostgreSQL, Supabase, Relational Schemas, Row Level Security)
6. AI Development (LLM Concepts, Gemini SDK, Structured Outputs, Streaming)
7. RAG & AI Applications (Vector Embeddings, Cosine Similarity, Chunking, Retrieval)
8. Final Project (Full-stack Capstone Architecture & Vercel Deployment)

Rules:
1. Explain concepts in plain English with relatable analogies before showing code.
2. Provide concise, clean code examples when relevant.
3. End explanations with one practical task or quick challenge.
4. Use an encouraging, academic, developer-focused tone.
5. For locked modules, explain that administrators unlock modules as the cohort progresses.
`;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    question,
    currentModule,
    currentLesson,
    conversationHistory,
  }: RequestBody = req.body || {};

  if (typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'Question prompt is required.' });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  const contextHeader = [
    currentModule ? `[Active Student Module: ${currentModule}]` : '',
    currentLesson ? `[Current Lesson: ${currentLesson}]` : '',
  ]
    .filter(Boolean)
    .join('\n');

  let promptContents = contextHeader ? `${contextHeader}\n\n` : '';

  if (conversationHistory?.length) {
    promptContents += 'Previous Conversation Context:\n';

    conversationHistory.slice(-4).forEach((msg) => {
      promptContents += `${msg.role.toUpperCase()}: ${msg.content}\n`;
    });

    promptContents += `\nCurrent Student Question:\n${question}`;
  } else {
    promptContents += `Student Question: ${question}`;
  }

  const messages = [
    { role: 'system', content: SKILLBOT_SYSTEM_INSTRUCTION },
    { role: 'user', content: promptContents },
  ];

  let geminiError = '';

  // 1. Try Gemini first.
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptContents,
        config: {
          systemInstruction: SKILLBOT_SYSTEM_INSTRUCTION,
          temperature: 0.6,
        },
      });

      const reply = response.text?.trim();

      if (reply) {
        return res.status(200).json({
          content: reply,
          provider: 'gemini',
          contextModule: currentModule || 'General Skill Lab',
          timestamp: new Date().toISOString(),
        });
      }

      geminiError = 'Gemini returned an empty response.';
    } catch (error: any) {
      geminiError = error?.message || 'Gemini request failed.';
      console.error('SkillBot Gemini failed:', geminiError);
    }
  } else {
    geminiError = 'GEMINI_API_KEY is not configured.';
  }

  // 2. If Gemini fails, try OpenRouter's free-model router.
  if (openRouterKey) {
    try {
      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openRouterKey}`,
            'Content-Type': 'application/json',
            'X-Title': 'SkillLab SkillBot',
          },
          body: JSON.stringify({
            model: 'openrouter/free',
            messages,
            temperature: 0.6,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          data?.error?.message || `OpenRouter returned HTTP ${response.status}`;
        throw new Error(message);
      }

      const reply = data?.choices?.[0]?.message?.content;

      if (typeof reply === 'string' && reply.trim()) {
        return res.status(200).json({
          content: reply.trim(),
          provider: 'openrouter',
          contextModule: currentModule || 'General Skill Lab',
          timestamp: new Date().toISOString(),
        });
      }

      throw new Error('OpenRouter returned an empty response.');
    } catch (error: any) {
      console.error(
        'SkillBot OpenRouter failed:',
        error?.message || error
      );

      return res.status(503).json({
        error: 'Both AI providers are temporarily unavailable. Please try again shortly.',
        details: {
          gemini: geminiError,
          openrouter: error?.message || 'OpenRouter request failed.',
        },
      });
    }
  }

  // Neither provider could be used.
  return res.status(503).json({
    error: 'AI service is unavailable. Check the server API key configuration.',
    details: { gemini: geminiError, openrouter: 'OPENROUTER_API_KEY is not configured.' },
  });
}
