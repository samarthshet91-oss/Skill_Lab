export interface SkillBotQueryPayload {
  question: string;
  currentModule?: string;
  currentLesson?: string;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
}

export interface SkillBotResponse {
  content: string;
  contextModule?: string;
  timestamp?: string;
  error?: string;
}

export async function askSkillBot(payload: SkillBotQueryPayload): Promise<SkillBotResponse> {
  try {
    const response = await fetch('/api/skillbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        content: "I couldn't respond right now. Please try again.",
        error: errorData.error || 'Request failed',
      };
    }

    const data = await response.json();
    return {
      content: data.content || "I couldn't respond right now. Please try again.",
      contextModule: data.contextModule,
      timestamp: data.timestamp,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network failure';
    return {
      content: "I couldn't respond right now. Please try again.",
      error: message,
    };
  }
}
