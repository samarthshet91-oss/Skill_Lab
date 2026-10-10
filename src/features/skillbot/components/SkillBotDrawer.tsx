import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  BookOpen,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  User,
} from 'lucide-react';
import { askSkillBot } from '../../../lib/gemini';
import { SkillBotMessage } from '../../../types';
import { SkillBotMessageContent } from './SkillBotMessageContent';

interface SkillBotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentModuleTitle?: string;
}

const SUGGESTED_QUESTIONS = [
  { label: 'Explain this topic simply', prompt: 'Can you explain this topic simply with a relatable real-world example?' },
  { label: 'Give me an example', prompt: 'Can you give me a practical, step-by-step code example for this?' },
  { label: 'Help me understand this concept', prompt: 'I want to understand this core concept in depth. What are the key takeaways?' },
  { label: 'Quiz me on this topic', prompt: 'Quiz me on this topic with 3 practical questions to test my understanding.' },
];

export function SkillBotDrawer({
  isOpen,
  onClose,
  currentModuleTitle = 'APIs & JSON',
}: SkillBotDrawerProps) {
  const [messages, setMessages] = useState<SkillBotMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  if (!isOpen) return null;

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

    const historyForAi = messages.slice(-4).map(m => ({
      role: m.role,
      content: m.content,
    }));

    const response = await askSkillBot({
      question: prompt,
      currentModule: currentModuleTitle,
      conversationHistory: historyForAi,
    });

    const assistantMessage: SkillBotMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: response.content || "I couldn't respond right now. Please try again.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      context_module: response.contextModule || currentModuleTitle,
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
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
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

  // Clean module title without leading numbers
  const displayTopic = currentModuleTitle.replace(/^\d+\.\s*/, '');

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Light backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full sm:max-w-md md:max-w-lg bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200/90 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">SkillBot</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  AI Tutor
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                <BookOpen className="w-3 h-3 text-indigo-600" />
                <span className="truncate max-w-[220px]">Topic: {displayTopic}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={resetChat}
                title="New conversation"
                type="button"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              title="Close panel"
              type="button"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center px-3 py-6 max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs mb-3">
                <Bot className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Hi! I'm SkillBot 👋</h2>
              <p className="text-xs text-slate-600 mt-1 max-w-xs leading-relaxed">
                Ask me anything about your current learning topics.
              </p>

              <div className="mt-5 w-full space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-left pl-1">
                  Suggested Questions ({displayTopic})
                </p>
                <div className="space-y-1.5 text-left">
                  {SUGGESTED_QUESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(s.prompt)}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-700 hover:text-indigo-900 text-xs font-medium transition-all text-left flex items-center justify-between group shadow-2xs cursor-pointer"
                    >
                      <span className="line-clamp-1">{s.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-1 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Messages List */
            messages.map(msg => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar Icon */}
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 shadow-2xs mt-1 ${
                      isUser
                        ? 'bg-indigo-700 text-white'
                        : 'bg-indigo-50 border border-indigo-200/80 text-indigo-700'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  {/* Bubble */}
                  <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                      <span>{isUser ? 'You' : 'SkillBot'}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-2xs'
                      }`}
                    >
                      <SkillBotMessageContent content={msg.content} isUser={isUser} />

                      {!isUser && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span>SkillLab AI</span>
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            type="button"
                            className="p-0.5 hover:text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600 font-semibold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
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

          {/* Typing state */}
          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-200/80 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs mt-1">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-3 bg-white rounded-2xl rounded-tl-xs border border-slate-200/90 shadow-2xs flex items-center gap-2.5">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                </div>
                <span className="text-xs text-slate-500">SkillBot is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Chips (when in chat) */}
        {messages.length > 0 && (
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" /> Suggestions:
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {SUGGESTED_QUESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(s.prompt)}
                  disabled={loading}
                  className="text-[11px] bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/80 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
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
                placeholder="Ask SkillBot a question..."
                disabled={loading}
                className="w-full resize-none bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all max-h-[120px] leading-relaxed"
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
          <p className="text-[10px] text-slate-400 text-center mt-1.5">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
