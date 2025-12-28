import React from 'react';
import { File, Code, Terminal, ChevronDown, X, Box, BrainCircuit, Hammer, Wrench } from 'lucide-react';
import { FileNode, FileSystem, AgentMode } from '../types';

interface SidebarProps {
  files: FileSystem;
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
  selectedMode: AgentMode;
  onSelectMode: (mode: AgentMode) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  files, 
  selectedPath, 
  onSelectFile, 
  selectedMode, 
  onSelectMode,
  isOpen,
  onClose
}) => {
  const fileList = (Object.values(files) as FileNode[]).sort((a, b) => a.path.localeCompare(b.path));

  const MODES: { id: AgentMode; name: string; icon: React.FC<any>; desc: string }[] = [
    { id: 'architect', name: 'Architect', icon: BrainCircuit, desc: 'Plans structure & strategy' },
    { id: 'engineer', name: 'Engineer', icon: Hammer, desc: 'Builds & verifies code' },
    { id: 'fixer', name: 'Fixer', icon: Wrench, desc: 'Debugs & fixes errors' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:w-64 md:z-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20">
                <Terminal className="w-4 h-4 text-indigo-500" />
              </div>
              <h2 className="font-bold text-slate-100 tracking-wide">VibeCoder</h2>
            </div>
            <button 
              onClick={onClose}
              className="md:hidden p-1 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* File Explorer */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="mb-3 px-2 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Box className="w-3 h-3" />
              Project Files
            </div>
            
            {fileList.length === 0 ? (
              <div className="text-slate-500 text-sm italic px-4 py-2 text-center">
                No files yet. <br/> Ask AI to start!
              </div>
            ) : (
              <div className="space-y-1">
                {fileList.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => {
                      onSelectFile(file.path);
                      if (window.innerWidth < 768) onClose();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all ${
                      selectedPath === file.path
                        ? 'bg-indigo-600/10 text-indigo-300 border border-indigo-600/20 shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {file.path.endsWith('.tsx') || file.path.endsWith('.ts') ? (
                      <Code className="w-4 h-4 shrink-0 text-blue-400" />
                    ) : (
                      <File className="w-4 h-4 shrink-0 text-slate-500" />
                    )}
                    <span className="truncate font-medium">{file.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer / Agent Mode Selector */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Agent Mode
            </label>
            <div className="space-y-1">
              {MODES.map((mode) => {
                const Icon = mode.icon;
                const isSelected = selectedMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => onSelectMode(mode.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                      isSelected 
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-xs font-bold">{mode.name}</div>
                      <div className="text-[10px] opacity-70 leading-none mt-0.5">{mode.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800/50">
              <div className="relative flex items-center justify-center w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </div>
              <span className="text-[10px] font-medium text-emerald-500 uppercase tracking-wider">
                {selectedMode === 'architect' ? 'Gemini 3 Pro (Thinking)' : selectedMode === 'engineer' ? 'Gemini 3 Pro' : 'Gemini 3 Flash'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};