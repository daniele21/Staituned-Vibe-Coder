export interface FileNode {
  path: string;
  name: string;
  content: string;
  language: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface TerminalEntry {
  id: string;
  type: 'command' | 'output' | 'error' | 'info';
  content: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export interface FileSystem {
  [path: string]: FileNode;
}

export type ToolName = 'list_files' | 'read_file' | 'write_file' | 'run_checks' | 'search_files';

export type AgentMode = 'architect' | 'engineer' | 'fixer';

export type ModelId = 'gemini-3-pro-preview' | 'gemini-3-flash-preview' | 'gemini-2.5-flash-latest';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

export interface Quota {
  maxTokens: number;
  usedTokens: number;
  cost: number; // Estimated cost in USD (cumulative lifetime)
  resetPeriodHours: number; // How many hours until usage resets
  lastResetTime: number; // Timestamp of last reset
}

export interface UsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}

export interface AgentStep {
  type: 'thought' | 'call' | 'result';
  content: string;
}

export type AgentEvent = 
  | { type: 'message', message: Message }
  | { type: 'files', files: FileSystem }
  | { type: 'terminal', entry: TerminalEntry }
  | { type: 'usage', usage: UsageMetadata }
  | { type: 'done' };
