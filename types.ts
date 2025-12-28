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

export interface AgentStep {
  type: 'thought' | 'call' | 'result';
  content: string;
}