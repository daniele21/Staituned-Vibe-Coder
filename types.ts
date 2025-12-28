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

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export interface FileSystem {
  [path: string]: FileNode;
}