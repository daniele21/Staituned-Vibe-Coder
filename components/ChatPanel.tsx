import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Bot, User, X, MessageSquare } from 'lucide-react';
import { Message } from '../types';

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ 
  messages, 
  isLoading, 
  onSendMessage,
  isOpen,
  onClose
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen]); // Scroll when opened as well

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Chat Container */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-slate-950 border-l border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:w-[400px] md:z-0 md:shadow-none
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-14 px-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between">
            <h3 className="font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              AI Assistant
            </h3>
            <button 
              onClick={onClose}
              className="md:hidden p-1 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-0 animate-fadeIn" style={{animationFillMode: 'forwards', animationDuration: '0.5s'}}>
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 border border-slate-800 shadow-lg">
                  <Bot className="w-8 h-8 text-indigo-500" />
                </div>
                <h4 className="text-slate-200 font-semibold text-lg mb-2">How can I help?</h4>
                <p className="text-slate-500 text-sm max-w-[260px] leading-relaxed mb-6">
                  I can generate code, fix bugs, or explain concepts. Try asking:
                </p>
                <div className="grid gap-2 w-full max-w-[280px]">
                  <button onClick={() => onSendMessage("Create a standard React Navbar component")} className="text-xs text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all hover:border-indigo-500/30">
                    ✨ Create a React Navbar
                  </button>
                  <button onClick={() => onSendMessage("Explain how useEffect works")} className="text-xs text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all hover:border-indigo-500/30">
                    📚 Explain useEffect
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 border-indigo-500' 
                      : 'bg-emerald-600 border-emerald-500'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-500/10 text-indigo-50 border border-indigo-500/20 rounded-tr-sm'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-700 flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-slate-400 text-xs font-medium">Writing code...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="relative group">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={adjustTextareaHeight}
                onKeyDown={handleKeyDown}
                placeholder="Ask VibeCoder..."
                rows={1}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-12 py-3.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none max-h-32 custom-scrollbar shadow-inner placeholder:text-slate-600"
                style={{ minHeight: '52px' }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2.5 p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};