export class ToolRouter {
    tools = new Map();
    register(tool) {
        this.tools.set(tool.name, tool);
    }
    get(name) {
        return this.tools.get(name);
    }
    listTools() {
        return Array.from(this.tools.values());
    }
    async execute(name, input, ctx) {
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
        }
        catch (err) {
            return {
                success: false,
                error: err?.message || String(err),
                durationMs: Date.now() - startTime
            };
        }
    }
}
//# sourceMappingURL=router.js.map