export interface ChatMessage {
    role: "system" | "user" | "assistant" | "tool";
    content: string;
    name?: string;
    toolCallId?: string;
}
export interface ToolDefinition {
    name: string;
    description: string;
    parameters: Record<string, any>;
}
export interface ModelInput {
    systemPrompt?: string;
    messages: ChatMessage[];
    tools?: ToolDefinition[];
    temperature?: number;
    maxTokens?: number;
}
export interface ModelToolCall {
    id: string;
    name: string;
    arguments: Record<string, any>;
}
export interface ModelOutput {
    text: string;
    toolCalls: ModelToolCall[];
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
export interface ModelAdapter {
    providerName: string;
    generate(input: ModelInput): Promise<ModelOutput>;
}
//# sourceMappingURL=types.d.ts.map