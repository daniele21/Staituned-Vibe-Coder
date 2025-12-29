import { GoogleGenAI, Tool, FunctionDeclaration, Type } from "@google/genai";
import { Message, FileSystem, TerminalEntry, AgentMode, ModelId, AgentEvent } from "../types";
import { tool_repo_map, tool_read, tool_search, tool_run_checks } from "./tools";

/**
 * GOOGLE ADK PATTERN IMPLEMENTATION
 * 
 * This service implements the ADK (Agent Development Kit) Runtime Loop:
 * 1. Plan: Model thoughts (via Thinking Model or internal monologue).
 * 2. Patch: Model calls 'write_file'.
 * 3. Verify: Runtime AUTOMATICALLY runs 'run_checks'.
 * 4. Reflect: Runtime feeds check results back to Model for immediate iteration.
 */

const INSTRUCTION_ARCHITECT = `
You are the **ARCHITECT** in the ADK Runtime.
**Goal**: Plan the structure and strategy.
**Rules**:
- Analyze the request and codebase.
- Output a high-level step-by-step plan.
- DO NOT write code. Delegate to the Engineer.
- Use 'list_files' and 'search_files' to understand context.
`;

const INSTRUCTION_ENGINEER = `
You are the **ENGINEER** in the ADK Runtime.
**Goal**: Implement features and ensure stability.
**ADK Loop Enforced**:
1. **PLAN**: Briefly explain what you are changing.
2. **PATCH**: Use 'write_file' to create/edit files. ALWAYS provide full content.
3. **VERIFY**: The runtime will AUTOMATICALLY run 'run_checks' after every 'write_file'.
4. **REFLECT**: You will receive the check results immediately.
   - If ✅ PASS: Move to next task.
   - If ❌ FAIL: You MUST fix the error in the immediate next turn.
`;

const INSTRUCTION_FIXER = `
You are the **FIXER** in the ADK Runtime.
**Goal**: Resolve build/lint errors.
**Rules**:
- Focus ONLY on the errors reported.
- Read files -> Write fix -> Runtime auto-verifies.
- Repeat until 'run_checks' passes.
`;

// Define Tool Schemas
const toolsDef = [
  {
    functionDeclarations: [
      {
        name: "list_files",
        description: "Get a map of the current file structure with sizes.",
      },
      {
        name: "read_file",
        description: "Read the content of a specific file.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            path: { type: Type.STRING, description: "The path of the file to read" }
          },
          required: ["path"]
        }
      },
      {
        name: "write_file",
        description: "Create or overwrite a file. Triggers AUTO-VERIFY.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            path: { type: Type.STRING, description: "The path of the file" },
            content: { type: Type.STRING, description: "The FULL content of the file" }
          },
          required: ["path", "content"]
        }
      },
      {
        name: "run_checks",
        description: "Run type checking and linting. (Called automatically by Runtime)",
      },
      {
        name: "search_files",
        description: "Search for a string pattern in all files.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING, description: "The string or regex to search for" }
          },
          required: ["query"]
        }
      }
    ] as FunctionDeclaration[]
  }
];

export class AdkService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private getRoleConfig(mode: AgentMode) {
    switch (mode) {
      case 'architect':
        return {
          systemInstruction: INSTRUCTION_ARCHITECT,
          defaultThinkingBudget: 2048
        };
      case 'fixer':
        return {
          systemInstruction: INSTRUCTION_FIXER,
          defaultThinkingBudget: 0
        };
      case 'engineer':
      default:
        return {
          systemInstruction: INSTRUCTION_ENGINEER,
          defaultThinkingBudget: 1024
        };
    }
  }

  async *runAgentLoop(
    history: Message[], 
    userRequest: string, 
    initialFiles: FileSystem, 
    mode: AgentMode,
    modelId: ModelId
  ): AsyncGenerator<AgentEvent> {
    
    let currentFiles = { ...initialFiles };
    const roleConfig = this.getRoleConfig(mode);
    
    // Construct session history
    const contents: any[] = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: userRequest }]
    });

    let turns = 0;
    const MAX_TURNS = mode === 'fixer' ? 8 : 12;
    let keepGoing = true;

    yield { type: 'terminal', entry: { id: Date.now().toString(), type: 'info', content: `[ADK] Initializing ${mode.toUpperCase()} Runtime on ${modelId}...`, timestamp: Date.now() } };

    while (keepGoing && turns < MAX_TURNS) {
      turns++;
      
      try {
        const result = await this.ai.models.generateContent({
          model: modelId,
          contents: contents,
          config: {
            systemInstruction: roleConfig.systemInstruction,
            tools: toolsDef,
            // Only use thinking budget if model is compatible and mode suggests it
            thinkingConfig: modelId.includes('gemini-3') ? { thinkingBudget: roleConfig.defaultThinkingBudget } : undefined,
          }
        });

        const response = result.candidates?.[0]?.content;
        
        // Report Usage
        if (result.usageMetadata) {
          yield { 
            type: 'usage', 
            usage: {
              promptTokenCount: result.usageMetadata.promptTokenCount || 0,
              candidatesTokenCount: result.usageMetadata.candidatesTokenCount || 0,
              totalTokenCount: result.usageMetadata.totalTokenCount || 0
            } 
          };
        }

        if (!response) throw new Error("No response from AI");

        contents.push(response);

        const parts = response.parts || [];
        let hasToolCall = false;

        for (const part of parts) {
          if (part.text) {
             // The model's "Plan" phase often happens here
          }

          if (part.functionCall) {
            hasToolCall = true;
            const call = part.functionCall;
            const functionName = call.name;
            const args = call.args as any;
            const callId = Date.now().toString();

            yield { type: 'terminal', entry: { id: callId, type: 'command', content: `> ${functionName}(${args.path || args.query || ''})`, timestamp: Date.now() } };

            let toolResult = "";

            // --- EXECUTE TOOL ---
            if (functionName === 'list_files') {
              toolResult = tool_repo_map(currentFiles);
            } else if (functionName === 'read_file') {
              toolResult = tool_read(currentFiles, args.path);
            } else if (functionName === 'search_files') {
              toolResult = tool_search(currentFiles, args.query);
            } else if (functionName === 'write_file') {
              // 1. Apply Patch
              currentFiles = {
                ...currentFiles,
                [args.path]: {
                  path: args.path,
                  name: args.path.split('/').pop() || 'file',
                  language: args.path.endsWith('css') ? 'css' : 'typescript',
                  content: args.content
                }
              };
              yield { type: 'files', files: currentFiles };
              const writeMsg = `Written ${args.content.length} bytes to ${args.path}.`;
              
              // 2. ADK Auto-Verify (Step 1E + Step 2)
              yield { type: 'terminal', entry: { id: Date.now().toString(), type: 'info', content: `[ADK] Auto-Verifying change...`, timestamp: Date.now() } };
              const checkResult = tool_run_checks(currentFiles);
              
              if (checkResult.includes('FAILED')) {
                // Verification Failed
                yield { type: 'terminal', entry: { id: Date.now().toString(), type: 'error', content: checkResult, timestamp: Date.now() } };
                toolResult = `${writeMsg}\n\n[ADK VERIFICATION FAILED]\n${checkResult}\n\nACTION REQUIRED: Fix the errors in the next step.`;
              } else {
                // Verification Passed
                yield { type: 'terminal', entry: { id: Date.now().toString(), type: 'output', content: "✅ Verification Passed", timestamp: Date.now() } };
                toolResult = `${writeMsg}\n\n[ADK VERIFICATION PASSED]`;
              }

            } else if (functionName === 'run_checks') {
              toolResult = tool_run_checks(currentFiles);
            } else {
              toolResult = "Error: Unknown tool";
            }

            if (functionName !== 'write_file' && functionName !== 'run_checks') {
                 yield { type: 'terminal', entry: { id: Date.now().toString(), type: 'output', content: toolResult.substring(0, 200) + (toolResult.length > 200 ? '...' : ''), timestamp: Date.now() } };
            }

            // Send Tool Response back to Model
            contents.push({
              role: 'user',
              parts: [{
                functionResponse: {
                  name: functionName,
                  response: { result: toolResult }
                }
              }]
            });
          }
        }

        if (!hasToolCall) {
          const finalResponseText = parts.find(p => p.text)?.text || "";
          yield { type: 'message', message: { id: Date.now().toString(), role: 'model', content: finalResponseText, timestamp: Date.now() } };
          keepGoing = false;
        }

      } catch (e) {
        console.error(e);
        yield { type: 'terminal', entry: { id: Date.now().toString(), type: 'error', content: `ADK Runtime Error: ${e instanceof Error ? e.message : 'Unknown'}`, timestamp: Date.now() } };
        keepGoing = false;
      }
    }
    
    yield { type: 'done' };
  }
}

export const geminiService = new AdkService();