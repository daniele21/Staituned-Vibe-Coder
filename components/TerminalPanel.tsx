import React, { useEffect, useRef } from 'react';
import { Terminal, CheckCircle2, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { TerminalEntry } from '../types';

interface TerminalPanelProps {
  entries: TerminalEntry[];
  isOpen: boolean;
  onToggle: () => void;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({ entries, isOpen, onToggle }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries, isOpen]);

  return (
    <div className={`border-t border-slate-800 bg-[#0f172a] flex flex-col transition-all duration-300 ${isOpen ? 'h-64' : 'h-10'}`}>
      {/* Header */}
      <button 
        onClick={onToggle}
        className="h-10 px-4 bg-slate-900 border-b border-slate-800 flex items-center gap-2 hover:bg-slate-800 transition-colors w-full text-left"
      >
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
        <Terminal className="w-4 h-4 text-indigo-500" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Console / Agent Runtime</span>
        {entries.length > 0 && (
          <span className="ml-auto text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
            {entries.length} events
          </span>
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-3 custom-scrollbar"
        >
          {entries.length === 0 ? (
            <div className="text-slate-600 italic">Ready to execute commands...</div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="flex gap-3 animate-fadeIn">
                <div className="shrink-0 mt-0.5">
                  {entry.type === 'command' && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />}
                  {entry.type === 'output' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  {entry.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                  {entry.type === 'info' && <Info className="w-3.5 h-3.5 text-blue-400" />}
                </div>
                <div className={`whitespace-pre-wrap break-all ${
                  entry.type === 'command' ? 'text-indigo-200 font-bold' :
                  entry.type === 'error' ? 'text-red-300' :
                  entry.type === 'info' ? 'text-blue-300 italic' :
                  'text-slate-300'
                }`}>
                  {entry.content}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};