import React, { useEffect, useRef, useState } from 'react';
import { Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { FileSystem, FileNode } from '../types';

declare const Babel: any;

interface PreviewProps {
  files: FileSystem;
}

export const Preview: React.FC<PreviewProps> = ({ files }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [key, setKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = () => {
    setKey(prev => prev + 1);
  };

  useEffect(() => {
    // Debounce preview updates to avoid flashing on every keystroke
    const timer = setTimeout(() => {
      updatePreview();
    }, 1000);
    return () => clearTimeout(timer);
  }, [files, key]);

  const updatePreview = async () => {
    if (!iframeRef.current) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Prepare Import Map and Transpiled Blobs
      const importMap: Record<string, string> = {
        "react": "https://esm.sh/react@18.2.0",
        "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
        "lucide-react": "https://esm.sh/lucide-react@0.263.1"
      };

      const transformedFiles: Record<string, string> = {};

      // Transpile all TSX/TS files to JS
      for (const [path, file] of Object.entries(files)) {
        const fileNode = file as FileNode;
        if (path.endsWith('.tsx') || path.endsWith('.ts')) {
          try {
            const result = Babel.transform(fileNode.content, {
              presets: ['react', 'typescript'],
              filename: path,
            });
            
            // Create a blob for the module
            const blob = new Blob([result.code], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            
            // Map the file path (e.g. "./components/Button") to the Blob URL
            // We handle both full path and relative import styles roughly
            const relativePath = path.startsWith('src/') ? './' + path.replace('src/', '') : './' + path;
            const cleanPath = relativePath.replace(/\.(tsx|ts)$/, '');
            
            importMap[cleanPath] = blobUrl;
            // Also map with extension just in case
            importMap[relativePath] = blobUrl;
            
            transformedFiles[path] = blobUrl;
          } catch (err) {
            console.error(`Failed to transpile ${path}`, err);
            setError(`Failed to compile ${path}. Check syntax.`);
          }
        }
      }

      // 2. Generate HTML Content for Iframe
      // Cast Object.values to FileNode[] to fix 'unknown' type error
      const fileNodes = Object.values(files) as FileNode[];
      const cssFiles = fileNodes.filter(f => f.path.endsWith('.css'));
      const styles = cssFiles.map(f => f.content).join('\n');
      
      const iframeContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      ${styles}
      body { background-color: white; color: black; }
    </style>
    <script type="importmap">
      ${JSON.stringify({ imports: importMap }, null, 2)}
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      
      // Try to import App.tsx (assuming it is the entry point)
      // We look for src/App.tsx or just App.tsx
      const appPath = '${files['src/App.tsx'] ? './App' : './src/App'}';
      
      try {
        const Module = await import(appPath);
        const App = Module.default;
        const root = createRoot(document.getElementById('root'));
        root.render(React.createElement(App));
      } catch (e) {
        document.body.innerHTML = '<div style="color:red; padding: 20px;"><h1>Runtime Error</h1><pre>' + e.message + '</pre></div>';
        console.error(e);
      }
    </script>
  </body>
</html>
      `;

      iframeRef.current.srcdoc = iframeContent;

    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown preview error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white border-l border-slate-800">
      <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center justify-between px-4">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preview</span>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-3 h-3 text-indigo-500 animate-spin" />}
          <button onClick={refresh} className="p-1 hover:bg-slate-200 rounded" title="Reload Preview">
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 relative bg-white">
        {error ? (
          <div className="absolute inset-0 p-6 text-red-600 font-mono text-sm bg-red-50">
            <strong>Preview Error:</strong><br/>
            {error}
          </div>
        ) : (
          <iframe 
            ref={iframeRef}
            title="Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        )}
      </div>
    </div>
  );
};