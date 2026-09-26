import { z } from "zod";

export const StateSchema = z.enum([
  "INTAKE",
  "DISCOVER",
  "EXPLORE",
  "PLAN",
  "IMPLEMENT",
  "TEST",
  "RECOVER",
  "VERIFY",
  "COMPLETE",
  "FAILED"
]);

export type State = z.infer<typeof StateSchema>;

export type SideEffectClass = "READ_ONLY" | "WRITE" | "EXECUTE" | "DESTRUCTIVE" | "NETWORK";

export interface ToolContext {
  taskId: string;
  repoPath: string;
  logger: any;
  dryRun?: boolean;
}

export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  durationMs: number;
}

export interface Tool {
  name: string;
  description: string;
  sideEffect: SideEffectClass;
  inputSchema: z.ZodTypeAny;
  execute(input: unknown, ctx: ToolContext): Promise<ToolResult>;
}

export interface Task {
  id: string;
  prompt: string;
  repoPath: string;
  createdAt: number;
  status: "pending" | "running" | "completed" | "failed";
}

export interface Session {
  id: string;
  taskId: string;
  currentState: State;
  iteration: number;
  maxIterations: number;
  events: AgentEvent[];
}

export type AgentEvent =
  | { type: "task.started"; taskId: string; timestamp: number }
  | { type: "state.changed"; from: State; to: State; timestamp: number; reason?: string }
  | { type: "tool.called"; tool: string; callId: string; input: unknown; timestamp: number }
  | { type: "tool.completed"; callId: string; result: ToolResult; timestamp: number }
  | { type: "model.called"; provider: string; model: string; tokensUsed?: number; timestamp: number }
  | { type: "file.changed"; path: string; patchSummary?: string; timestamp: number }
  | { type: "test.completed"; command: string; exitCode: number; passed: boolean; timestamp: number }
  | { type: "verification.completed"; passed: boolean; details?: string; timestamp: number }
  | { type: "task.completed"; taskId: string; summary: string; timestamp: number }
  | { type: "task.failed"; taskId: string; error: string; timestamp: number };

export interface RunResult {
  taskId: string;
  success: boolean;
  summary: string;
  filesModified: string[];
  verification: {
    passed: boolean;
    evidence: string[];
  };
  durationMs: number;
  eventsCount: number;
}
