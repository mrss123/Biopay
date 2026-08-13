import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, RefreshCw } from 'lucide-react';
import { api } from '../../services/api.js';

interface AiCoPilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiCoPilotDrawer: React.FC<AiCoPilotDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: 'Hello! I am your BioPay Gemini AI HR Assistant. Ask me anything about employee attendance anomalies, tax calculations, or salary structure recommendations.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await api.askGeminiCopilot(userText);
      setMessages(prev => [...prev, { role: 'assistant', text: res.reply }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error connecting to Gemini API. Please check process environment variables.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-slate-900 px-6 text-white">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <Sparkles className="h-4 w-4 text-amber-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Gemini HR & Payroll Co-Pilot</h3>
            <p className="text-[10px] text-slate-400">Powered by @google/genai</p>
          </div>
        </div>

        <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4 bg-slate-50/50">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 text-xs ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl p-3.5 shadow-sm ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-white border border-slate-200 text-slate-800'
              }`}
            >
              {m.text}
            </div>
            {m.role === 'user' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
            <span>Analyzing tenant attendance logs & tax rules...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-slate-200 p-4 bg-white">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask AI about attendance or payroll..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-10 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 rounded-lg bg-indigo-600 p-1.5 text-white hover:bg-indigo-500 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
