import { GoogleGenAI } from "@google/genai";
import { Message, FileSystem } from "../types";

const SYSTEM_INSTRUCTION = `
You are VibeCoder, an expert AI coding assistant. You are building a React application in a live environment.
Your goal is to generate, edit, and explain code based on user requests.

**CRITICAL OUTPUT FORMAT:**
You MUST strictly follow this XML-like format for EVERY file you create or update. 
<FILE path="src/App.tsx">
import React from 'react';
// ... full code ...
</FILE>

**RULES:**
1. Always provide the FULL content of the file. No placeholders.
2. For the best "Vibe Coding" experience, try to keep the application logic centralized in 'src/App.tsx' if possible, or use clear modular components.
3. The environment supports standard React hooks, Tailwind CSS, and lucide-react icons.
4. When asked to "fix" or "change" something, rely on the provided CURRENT FILE CONTENT to know what to edit.
5. You can create multiple files.
`;

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async sendMessage(history: Message[], newMessage: string, files: FileSystem, model: string = 'gemini-3-pro-preview'): Promise<string> {
    try {
      // 1. Construct the context about current files
      let fileContext = "Here is the current state of the application files:\n\n";
      for (const [path, file] of Object.entries(files)) {
        fileContext += `--- BEGIN FILE: ${path} ---\n${file.content}\n--- END FILE: ${path} ---\n\n`;
      }
      
      const contextMessage = `
${fileContext}

User Request: ${newMessage}
`;

      // 2. Prepare contents for API
      const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      // Add the context + new message as the latest user turn
      contents.push({
        role: 'user',
        parts: [{ text: contextMessage }]
      });

      // Configure thinking only for models that support it (Gemini 2.5/3 series)
      // For simplicity in this demo, we apply it to all as we allow 3/2.5 selection.
      // We adjust budget based on model "class" if needed, but 1024 is safe.
      const response = await this.ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingBudget: 1024 },
        }
      });

      return response.text || "No response generated.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`;
    }
  }
}

export const geminiService = new GeminiService();