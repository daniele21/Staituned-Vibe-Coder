import React from 'react';
import { File, Code, Terminal, ChevronDown, X, Box, BrainCircuit, Hammer, Wrench, Cpu, Settings } from 'lucide-react';
import { FileNode, FileSystem, AgentMode, ModelId } from '../types';

interface SidebarProps {
  files: FileSystem;
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
  selectedMode: AgentMode;
  onSelectMode: (mode: AgentMode) => void;
  selectedModel: ModelId;
  onSelectModel: (model: ModelId) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  files, 
  selectedPath, 
  onSelectFile, 
  selectedMode, 
  onSelectMode,
  selectedModel,
  onSelectModel,
  isOpen,
  onClose,
  onOpenAdmin
}) => {
  const fileList = (Object.values(files) as FileNode[]).sort((a, b) => a.path.localeCompare(b.path));

  const MODES: { id: AgentMode; name: string; icon: React.FC<any>; desc: string }[] = [
    { id: 'architect', name: 'Architect', icon: BrainCircuit, desc: 'Plans structure & strategy' },
    { id: 'engineer', name: 'Engineer', icon: Hammer, desc: 'Builds & verifies code' },
    { id: 'fixer', name: 'Fixer', icon: Wrench, desc: 'Debugs & fixes errors' },
  ];

  const MODELS: { id: ModelId; name: string }[] = [
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro (Preview)' },
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Preview)' },
    { id: 'gemini-2.5-flash-latest', name: 'Gemini 2.5 Flash' },
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
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col
        md:relative md:translate-x-0 md:z-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-bold text-slate-100">
            <Terminal className="w-5 h-5 text-indigo-500" />
            <span className="tracking-tight">VibeCoder Studio</span>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          
          {/* Mode Selection */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Box className="w-3 h-3" /> Agent Mode
            </h3>
            <div className="grid gap-2">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => onSelectMode(mode.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                    selectedMode === mode.id
                      ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-200'
                      : 'bg-slate-800/50 border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <mode.icon className={`w-4 h-4 ${selectedMode === mode.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="text-sm font-medium">{mode.name}</div>
                    <div className="text-[10px] opacity-70 leading-tight">{mode.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Cpu className="w-3 h-3" /> Model
            </h3>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => onSelectModel(e.target.value as ModelId)}
                className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* File Explorer */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <File className="w-3 h-3" /> Workspace
            </h3>
            <div className="space-y-0.5">
              {fileList.map((file) => (
                <button
                  key={file.path}
                  onClick={() => onSelectFile(file.path)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedPath === file.path
                      ? 'bg-indigo-500/10 text-indigo-300 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Code className="w-3.5 h-3.5 opacity-70" />
                  <span className="truncate">{file.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <button
            onClick={onOpenAdmin}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Profile & Settings</span>
          </button>
        </div>
      </div>
    </>
  );
};