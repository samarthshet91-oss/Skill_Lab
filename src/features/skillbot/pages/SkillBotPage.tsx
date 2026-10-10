import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  RotateCcw,
  HelpCircle,
  Code2,
  BrainCircuit,
  MessageSquare,
  ArrowRight,
  User,
} from 'lucide-react';
import { SkillBotMessage } from '../../../types';
import { askSkillBot } from '../../../lib/gemini';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { SkillBotMessageContent } from '../components/SkillBotMessageContent';

const SUGGESTED_QUESTIONS = [
  { label: 'Explain this topic simply', prompt: 'Can you explain this topic simply with a relatable real-world example?' },
  { label: 'Give me an example', prompt: 'Can you give me a practical, step-by-step code example for this?' },
  { label: 'Help me understand this concept', prompt: 'I want to understand this core concept in depth. What are the key takeaways?' },
  { label: 'Quiz me on this topic', prompt: 'Quiz me on this topic with 3 practical questions to test my understanding.' },
];

export function SkillBotPage() {
  const [messages, setMessages] = useState<SkillBotMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedModule, setSelectedModule] = useState('4. APIs & JSON');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || loading) return;

    const userMessage: SkillBotMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const history = messages.slice(-4).map(m => ({
      role: m.role,
      content: m.content,
    }));

    const res = await askSkillBot({
      question: prompt,
      currentModule: selectedModule,
      conversationHistory: history,
    });

    const assistantMessage: SkillBotMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: res.content || "I couldn't respond right now. Please try again.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      context_module: selectedModule,
    };

    setMessages(prev => [...prev, assistantMessage]);
    setLoading(false);
  };

  const handleSelectSuggestion = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetChat = () => {
    setMessages([]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">SkillBot AI Tutor</h1>
              <Badge variant="primary" size="sm">Learning Assistant</Badge>
            </div>
            <p className="text-xs text-slate-500">
              Personalized guidance for the SkillLab curriculum
            </p>
          </div>
        </div>

        {/* Module Topic Context & Clear Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-500">Topic:</span>
            <select
              value={selectedModule}
              onChange={e => setSelectedModule(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer text-xs pr-1"
            >
              <option value="1. Modern Development Foundation">1. Modern Development</option>
              <option value="2. Git & GitHub">2. Git & GitHub</option>
              <option value="3. Project Creation">3. Project Creation</option>
              <option value="4. APIs & JSON">4. APIs & JSON</option>
              <option value="5. Databases">5. Databases</option>
              <option value="6. AI Development">6. AI Development</option>
              <option value="7. RAG & AI Applications">7. RAG & AI</option>
              <option value="8. Final Project">8. Final Project</option>
            </select>
          </div>

          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetChat}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs shrink-0 cursor-pointer"
            >
              New Chat
            </Button>
          )}
        </div>
      </div>

      {/* Main Chat Container */}
      <Card className="p-0 overflow-hidden border-slate-200 flex flex-col h-[640px] shadow-xs">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/40">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs mb-3.5">
                <Bot className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hi! I'm SkillBot 👋</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-sm leading-relaxed">
                Ask me anything about your current learning topics. I can explain code, break down complex concepts, and guide you through exercises.
              </p>

              <div className="mt-6 w-full space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-left pl-1">
                  Suggested Questions ({selectedModule.replace(/^\d+\.\s*/, '')})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {SUGGESTED_QUESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(s.prompt)}
                      className="p-3 rounded-xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-700 hover:text-indigo-900 text-xs font-medium transition-all text-left flex items-center justify-between group shadow-2xs cursor-pointer"
                    >
                      <span className="line-clamp-1">{s.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-2 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Message Thread */
            messages.map(msg => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar Icon */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs mt-1 ${
                      isUser
                        ? 'bg-indigo-700 text-white'
                        : 'bg-indigo-50 border border-indigo-200/80 text-indigo-700'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble Container */}
                  <div className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-600">{isUser ? 'You' : 'SkillBot'}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-2xs'
                      }`}
                    >
                      <SkillBotMessageContent content={msg.content} isUser={isUser} />

                      {/* Copy Action for Bot responses */}
                      {!isUser && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                          <span className="text-[11px] text-slate-400">SkillLab AI Tutor</span>
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            type="button"
                            className="p-1 hover:text-slate-700 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600 font-semibold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy response</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing/Thinking indicator */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs mt-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 bg-white rounded-2xl rounded-tl-xs border border-slate-200/90 shadow-2xs flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                </div>
                <span className="text-xs text-slate-500 font-medium">SkillBot is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Chips (when in chat) */}
        {messages.length > 0 && (
          <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" /> Prompts:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {SUGGESTED_QUESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(s.prompt)}
                  disabled={loading}
                  className="text-xs bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200/80 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder={`Ask SkillBot about ${selectedModule.replace(/^\d+\.\s*/, '')} or code concepts...`}
                disabled={loading}
                className="w-full resize-none bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all max-h-[140px] leading-relaxed"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                !input.trim() || loading
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
              }`}
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Press Enter to send, Shift + Enter for new line</span>
            <span className="hidden sm:inline">Grounded in SkillLab curriculum</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
