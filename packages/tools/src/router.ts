import { Tool, ToolContext, ToolResult } from "@forge/core";

export class ToolRouter {
  private tools: Map<string, Tool> = new Map();

  public register(tool: Tool) {
    this.tools.set(tool.name, tool);
  }

  public get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  public listTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  public async execute(name: string, input: unknown, ctx: ToolContext): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        success: false,
        error: `Tool '${name}' not found`,
        durationMs: 0
      };
    }

    const startTime = Date.now();
    try {
      const parsedInput = tool.inputSchema.parse(input);
      const result = await tool.execute(parsedInput, ctx);
      return {
        ...result,
        durationMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || String(err),
        durationMs: Date.now() - startTime
      };
    }
  }
}
