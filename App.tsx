import React, { useState } from 'react';
import { Menu, MessageSquare, Terminal, Play, Code as CodeIcon } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { CodeEditor } from './components/CodeEditor';
import { ChatPanel } from './components/ChatPanel';
import { Preview } from './components/Preview';
import { TerminalPanel } from './components/TerminalPanel';
import { geminiService } from './services/gemini';
import { FileSystem, Message, TerminalEntry, AgentMode } from './types';

const INITIAL_FILES: FileSystem = {
  'src/App.tsx': {
    path: 'src/App.tsx',
    name: 'App.tsx',
    language: 'typescript',
    content: `import React, { useState } from 'react';
import { Zap, Sparkles } from 'lucide-react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500/10 rounded-2xl mb-6 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <Zap className="w-8 h-8 text-indigo-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">VibeCoder</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Your live React playground. <br/>
            <span className="text-indigo-400 font-medium">Edit the code</span> or <span className="text-emerald-400 font-medium">ask AI</span> to build something amazing.
          </p>
          
          <button 
            onClick={() => setCount(c => c + 1)}
            className="group relative inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20"
          >
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>Clicks: {count}</span>
          </button>
        </div>
      </div>
    </div>
  );
}`
  },
  'src/styles.css': {
    path: 'src/styles.css',
    name: 'styles.css',
    language: 'css',
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;`
  }
};

const App: React.FC = () => {
  const [files, setFiles] = useState<FileSystem>(INITIAL_FILES);
  const [selectedPath, setSelectedPath] = useState<string | null>('src/App.tsx');
  const [messages, setMessages] = useState<Message[]>([]);
  const [terminalEntries, setTerminalEntries] = useState<TerminalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AgentMode>('engineer'); // Default to Engineer (Step 4)
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  
  // Mobile UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'code' | 'preview'>('code');

  const handleUpdateFile = (newContent: string) => {
    if (selectedPath) {
      setFiles(prev => ({
        ...prev,
        [selectedPath]: {
          ...prev[selectedPath],
          content: newContent
        }
      }));
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setIsTerminalOpen(true);

    try {
      // Step 2 & 3: Run the Agent Loop with the selected Mode
      const generator = geminiService.runAgentLoop(messages, text, files, mode);

      for await (const event of generator) {
        if (event.type === 'message') {
          setMessages(prev => [...prev, event.message]);
        } else if (event.type === 'files') {
          setFiles(event.files);
          if (!selectedPath) {
             const newFileKeys = Object.keys(event.files);
             if (newFileKeys.length > 0) setSelectedPath(newFileKeys[0]);
          }
          if (window.innerWidth < 768) setMobileTab('preview');
        } else if (event.type === 'terminal') {
          setTerminalEntries(prev => [...prev, event.entry]);
        }
      }

    } catch (error) {
      console.error("Agent Loop Error", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "Sorry, I encountered an error. Check the console logs.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedFile = selectedPath ? files[selectedPath] : null;

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Sidebar (Responsive) */}
      <Sidebar 
        files={files} 
        selectedPath={selectedPath} 
        onSelectFile={setSelectedPath}
        selectedMode={mode}
        onSelectMode={setMode}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
        
        {/* Mobile Header */}
        <div className="md:hidden h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-20 shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 font-bold text-slate-100">
            <Terminal className="w-4 h-4 text-indigo-500" />
            <span>VibeCoder</span>
          </div>

          <button 
            onClick={() => setIsChatOpen(true)}
            className="p-2 -mr-2 text-slate-400 hover:text-white relative"
          >
            <MessageSquare className="w-5 h-5" />
            {messages.length > 0 && (
              <span className="absolute top-2 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border border-slate-900"></span>
            )}
          </button>
        </div>

        {/* Mobile Tab Toggle */}
        <div className="md:hidden flex border-b border-slate-800 bg-slate-900 z-10 shrink-0">
          <button 
            onClick={() => setMobileTab('code')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              mobileTab === 'code' 
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-800/50' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <CodeIcon className="w-4 h-4" />
            Code
          </button>
          <button 
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              mobileTab === 'preview' 
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-800/50' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Play className="w-4 h-4" />
            Preview
          </button>
        </div>

        {/* Workspace Content */}
        <div className="flex-1 flex relative overflow-hidden">
          {/* Editor Area */}
          <div className={`
            flex-1 flex flex-col border-r border-slate-800 bg-[#1e1e1e]
            ${mobileTab === 'code' ? 'flex' : 'hidden md:flex'}
          `}>
             <CodeEditor file={selectedFile} onUpdateFile={handleUpdateFile} />
             {/* Terminal Panel inside Editor column for Desktop, or shared for mobile */}
             <TerminalPanel 
               entries={terminalEntries} 
               isOpen={isTerminalOpen} 
               onToggle={() => setIsTerminalOpen(!isTerminalOpen)} 
             />
          </div>

          {/* Preview Area */}
          <div className={`
            flex-1 flex flex-col bg-white
            ${mobileTab === 'preview' ? 'flex' : 'hidden md:flex'}
          `}>
             <Preview files={files} />
          </div>
        </div>
      </div>

      {/* Chat Panel (Responsive) */}
      <ChatPanel 
        messages={messages} 
        isLoading={isLoading} 
        onSendMessage={handleSendMessage} 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
};

export default App;