import { Tool, ToolContext, ToolResult } from "@forge/core";
export declare class ToolRouter {
    private tools;
    register(tool: Tool): void;
    get(name: string): Tool | undefined;
    listTools(): Tool[];
    execute(name: string, input: unknown, ctx: ToolContext): Promise<ToolResult>;
}
//# sourceMappingURL=router.d.ts.map