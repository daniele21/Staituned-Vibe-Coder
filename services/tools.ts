import { FileSystem, FileNode } from "../types";

/**
 * Step 1: Implement "repo tools"
 * These are strict functions that operate on the FileSystem.
 */

// 1A) Repo Map Tool: Returns file tree + sizes
export const tool_repo_map = (files: FileSystem): string => {
  const entries = Object.values(files);
  if (entries.length === 0) return "Repository is empty.";
  
  return entries.map(f => `[${f.language}] ${f.path} (${f.content.length} bytes)`).join('\n');
};

// 1B) Search Tool: Basic grep implementation
export const tool_search = (files: FileSystem, query: string): string => {
  const results: string[] = [];
  
  for (const file of Object.values(files)) {
    const lines = file.content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes(query)) {
        results.push(`${file.path}:${index + 1}: ${line.trim()}`);
      }
    });
  }
  
  if (results.length === 0) return "No matches found.";
  // Limit results to prevent context overflow
  return results.slice(0, 50).join('\n');
};

// 1C) Read File Tool
export const tool_read = (files: FileSystem, path: string): string => {
  const file = files[path];
  if (!file) return `Error: File '${path}' not found.`;
  return file.content;
};

// 1D) Apply Patch Tool
export const tool_write_file = (files: FileSystem, path: string, content: string): { success: boolean, message: string, newFiles?: FileSystem } => {
  // Logic handled in Agent Runtime for atomicity with verification
  return { success: true, message: "Handled by Runtime" }; 
};

// 1E) Run Checks Tool: Simulates npm run typecheck/lint
declare const Babel: any;

export const tool_run_checks = (files: FileSystem): string => {
  const errors: string[] = [];
  const entries = Object.values(files);
  
  // 1. Check for missing imports or bad React structure (Simple heuristics)
  const appFile = files['src/App.tsx'] || files['App.tsx'];
  if (!appFile) {
    errors.push("[Structure Error] src/App.tsx is missing. The app cannot render.");
  }

  // 2. Simulate Type/Syntax Check using Babel
  for (const file of entries) {
    if (file.path.endsWith('.tsx') || file.path.endsWith('.ts') || file.path.endsWith('.js')) {
      try {
        Babel.transform(file.content, {
          presets: ['react', 'typescript'],
          filename: file.path,
        });
      } catch (err: any) {
        // Clean up Babel error message
        const msg = err.message.replace(file.path, '').trim();
        errors.push(`[Syntax Error] ${file.path}: ${msg}`);
      }
    }
  }

  if (errors.length > 0) {
    return `CHECKS FAILED (${errors.length} errors):\n${errors.join('\n')}`;
  }

  return "CHECKS PASSED";
};