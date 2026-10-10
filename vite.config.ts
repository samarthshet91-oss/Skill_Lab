import 'dotenv/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';

const SKILLBOT_SYSTEM_INSTRUCTION = `
You are "SkillBot", the specialized AI learning tutor for "SkillLab" — a private college software engineering learning platform.

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

1. Be beginner-friendly yet technically precise.
2. Explain concepts in plain English with relatable analogies before showing code.
3. Provide concise, clean, typed code examples when relevant.
4. Suggest 1 practical hands-on task or quick challenge at the end.
5. Keep the tone encouraging, academic, structured, and developer-focused.
6. If asked about locked modules, remind the student that administrators unlock modules as the cohort progresses.
`;

interface SkillBotRequest {
  question: string;
  currentModule?: string;
  currentLesson?: string;
  conversationHistory?: {
    role: 'user' | 'assistant';
    content: string;
  }[];
}

function isTemporaryProviderError(error: any): boolean {
  const status = Number(error?.status);

  if ([429, 500, 502, 503, 504].includes(status)) {
    return true;
  }

  const message = String(error?.message || '').toLowerCase();

  return (
    message.includes('high demand') ||
    message.includes('unavailable') ||
    message.includes('temporarily') ||
    message.includes('timeout') ||
    message.includes('rate limit') ||
    message.includes('too many requests')
  );
}

async function generateWithGemini(
  apiKey: string,
  promptContents: string
): Promise<string> {
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: promptContents,
    config: {
      systemInstruction: SKILLBOT_SYSTEM_INSTRUCTION,
    },
  });

  const reply = response.text?.trim();

  if (!reply) {
    throw new Error('Gemini returned an empty response.');
  }

  return reply;
}

async function generateWithOpenRouter(
  apiKey: string,
  promptContents: string
): Promise<string> {
  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer':
          process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'SkillLab',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          {
            role: 'system',
            content: SKILLBOT_SYSTEM_INSTRUCTION,
          },
          {
            role: 'user',
            content: promptContents,
          },
        ],
      }),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.error?.message ||
      `OpenRouter request failed with status ${response.status}.`;

    const error: any = new Error(message);
    error.status = response.status;

    throw error;
  }

  const reply = data?.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error('OpenRouter returned an empty response.');
  }

  return reply;
}

function skillBotApiPlugin(): Plugin {
  return {
    name: 'skillbot-api-middleware',

    configureServer(server) {
      server.middlewares.use('/api/skillbot', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              error: 'Method Not Allowed',
            })
          );
          return;
        }

        let body = '';

        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');

          try {
            const parsed: SkillBotRequest = JSON.parse(body || '{}');

            const {
              question,
              currentModule,
              currentLesson,
              conversationHistory,
            } = parsed;

            if (!question || !question.trim()) {
              res.statusCode = 400;
              res.end(
                JSON.stringify({
                  error: 'Question is required.',
                })
              );
              return;
            }

            const geminiApiKey = process.env.GEMINI_API_KEY;
            const openRouterApiKey =
              process.env.OPENROUTER_API_KEY;

            if (!geminiApiKey && !openRouterApiKey) {
              res.statusCode = 500;
              res.end(
                JSON.stringify({
                  error:
                    'SkillBot is temporarily unavailable. Please try again later.',
                })
              );
              return;
            }

            const contextHeader = [
              currentModule
                ? `[Active Student Module: ${currentModule}]`
                : '',
              currentLesson
                ? `[Current Lesson: ${currentLesson}]`
                : '',
            ]
              .filter(Boolean)
              .join('\n');

            let promptContents = '';

            if (contextHeader) {
              promptContents += `${contextHeader}\n\n`;
            }

            if (
              conversationHistory &&
              conversationHistory.length > 0
            ) {
              promptContents +=
                'Previous Conversation Context:\n';

              conversationHistory
                .slice(-4)
                .forEach((msg) => {
                  promptContents += `${msg.role.toUpperCase()}: ${msg.content}\n`;
                });

              promptContents +=
                `\nCurrent Student Question:\n${question}`;
            } else {
              promptContents += `Student Question: ${question}`;
            }

            /*
             * PRIMARY PROVIDER
             * Gemini is attempted first.
             */
            if (geminiApiKey) {
              try {
                console.log(
                  'SkillBot: Trying Gemini...'
                );

                const reply = await generateWithGemini(
                  geminiApiKey,
                  promptContents
                );

                console.log(
                  'SkillBot: Gemini response successful.'
                );

                res.statusCode = 200;
                res.end(
                  JSON.stringify({
                    content: reply,
                    contextModule:
                      currentModule ||
                      'Skill Lab Curriculum',
                    timestamp:
                      new Date().toISOString(),
                    provider: 'gemini',
                  })
                );

                return;
              } catch (geminiError: any) {
                console.error(
                  'SkillBot Gemini error:',
                  geminiError
                );

                /*
                 * Only fall back for temporary/provider errors.
                 * Permanent errors are not silently hidden.
                 */
                if (
                  !openRouterApiKey ||
                  !isTemporaryProviderError(
                    geminiError
                  )
                ) {
                  throw geminiError;
                }

                console.log(
                  'SkillBot: Gemini temporarily unavailable. Falling back to OpenRouter...'
                );
              }
            }

            /*
             * FALLBACK PROVIDER
             * OpenRouter is used when Gemini is unavailable.
             */
            if (openRouterApiKey) {
              try {
                console.log(
                  'SkillBot: Trying OpenRouter...'
                );

                const reply =
                  await generateWithOpenRouter(
                    openRouterApiKey,
                    promptContents
                  );

                console.log(
                  'SkillBot: OpenRouter response successful.'
                );

                res.statusCode = 200;
                res.end(
                  JSON.stringify({
                    content: reply,
                    contextModule:
                      currentModule ||
                      'Skill Lab Curriculum',
                    timestamp:
                      new Date().toISOString(),
                    provider: 'openrouter',
                  })
                );

                return;
              } catch (openRouterError: any) {
                console.error(
                  'SkillBot OpenRouter error:',
                  openRouterError
                );

                throw openRouterError;
              }
            }

            throw new Error(
              'No AI provider is currently available.'
            );
          } catch (err: any) {
            console.error(
              'SkillBot Server middleware error:',
              err
            );

            let errorMessage =
              'SkillBot is temporarily unavailable. Please try again in a moment.';

            if (isTemporaryProviderError(err)) {
              errorMessage =
                'SkillBot is temporarily busy. Please try again in a moment.';
            }

            res.statusCode = 500;
            res.end(
              JSON.stringify({
                error: errorMessage,
              })
            );
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      skillBotApiPlugin(),
    ],

    resolve: {
      alias: {
        '@': path.resolve(
          import.meta.dirname || '.',
          '.'
        ),
      },
    },

    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',

      // Disable file watching when DISABLE_HMR is true.
      watch:
        process.env.DISABLE_HMR === 'true'
          ? null
          : {},
    },
  };
});

