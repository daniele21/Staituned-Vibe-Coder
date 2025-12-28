import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FileNode } from '../types';

interface CodeEditorProps {
  file: FileNode | null;
  onUpdateFile: (newContent: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ file, onUpdateFile }) => {
  if (!file) {
    return (
      <div className="flex-1 bg-[#1e1e1e] flex items-center justify-center text-slate-500">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Select a file to edit</p>
          <p className="text-sm opacity-60">or ask the AI to generate one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1e1e] overflow-hidden relative">
      {/* Tab Header */}
      <div className="flex items-center bg-[#1e1e1e] border-b border-slate-800 shrink-0 z-10">
        <div className="px-4 py-2.5 bg-[#1e1e1e] text-indigo-300 text-sm border-t-2 border-indigo-500 flex items-center gap-2">
          <span>{file.name}</span>
          <span className="text-xs text-slate-500 opacity-50 ml-2">{file.path}</span>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative overflow-auto custom-scrollbar group">
        {/* Syntax Highlighter (Visual Layer) */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <SyntaxHighlighter
            language={file.language || 'typescript'}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              background: 'transparent',
              fontSize: '14px',
              lineHeight: '1.5',
              minHeight: '100%',
              fontFamily: 'monospace',
            }}
            showLineNumbers={true}
            wrapLines={true}
          >
            {file.content}
          </SyntaxHighlighter>
        </div>

        {/* Textarea (Input Layer) */}
        <textarea
          value={file.content}
          onChange={(e) => onUpdateFile(e.target.value)}
          spellCheck={false}
          className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-white p-6 font-mono text-[14px] leading-[1.5] resize-none focus:outline-none z-10 ml-[2.6rem] overflow-hidden" 
          style={{ 
            // Align textarea exactly with syntax highlighter
            // The highlighter has line numbers, so we need to offset or hide them. 
            // For simplicity in this overlay approach, we are making the textarea text transparent 
            // and positioning the caret. The line numbers in syntax highlighter make this tricky alignment.
            // Simpler approach for reliability: Use the textarea as the main view when focused, or just simple text area.
            color: 'transparent', 
            background: 'transparent',
            whiteSpace: 'pre',
            wordWrap: 'normal',
          }}
        />
        {/* Fallback readable textarea if alignment fails or for simpler editing interaction */}
        <textarea
          value={file.content}
          onChange={(e) => onUpdateFile(e.target.value)}
          spellCheck={false}
          className="absolute inset-0 w-full h-full bg-[#1e1e1e] text-slate-300 p-6 font-mono text-[14px] leading-[1.5] resize-none focus:outline-none z-20 opacity-0 focus:opacity-100 transition-opacity" 
        />
        <div className="absolute top-2 right-4 z-30 pointer-events-none opacity-50 text-xs text-slate-400 group-hover:opacity-100 transition-opacity">
          Click to edit
        </div>
      </div>
    </div>
  );
};