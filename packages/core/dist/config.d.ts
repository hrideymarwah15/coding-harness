import { z } from "zod";
export declare const ForgeConfigSchema: z.ZodObject<{
    version: z.ZodDefault<z.ZodString>;
    model: z.ZodDefault<z.ZodObject<{
        provider: z.ZodDefault<z.ZodEnum<["openai", "anthropic", "custom"]>>;
        modelName: z.ZodDefault<z.ZodString>;
        apiKey: z.ZodOptional<z.ZodString>;
        maxTokens: z.ZodDefault<z.ZodNumber>;
        temperature: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        provider: "openai" | "anthropic" | "custom";
        modelName: string;
        maxTokens: number;
        temperature: number;
        apiKey?: string | undefined;
    }, {
        provider?: "openai" | "anthropic" | "custom" | undefined;
        modelName?: string | undefined;
        apiKey?: string | undefined;
        maxTokens?: number | undefined;
        temperature?: number | undefined;
    }>>;
    execution: z.ZodDefault<z.ZodObject<{
        maxIterations: z.ZodDefault<z.ZodNumber>;
        maxTurns: z.ZodDefault<z.ZodNumber>;
        autoRecover: z.ZodDefault<z.ZodBoolean>;
        dryRun: z.ZodDefault<z.ZodBoolean>;
        timeoutMs: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maxIterations: number;
        maxTurns: number;
        autoRecover: boolean;
        dryRun: boolean;
        timeoutMs: number;
    }, {
        maxIterations?: number | undefined;
        maxTurns?: number | undefined;
        autoRecover?: boolean | undefined;
        dryRun?: boolean | undefined;
        timeoutMs?: number | undefined;
    }>>;
    persistence: z.ZodDefault<z.ZodObject<{
        dbPath: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        dbPath: string;
    }, {
        dbPath?: string | undefined;
    }>>;
    logLevel: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error"]>>;
}, "strip", z.ZodTypeAny, {
    version: string;
    model: {
        provider: "openai" | "anthropic" | "custom";
        modelName: string;
        maxTokens: number;
        temperature: number;
        apiKey?: string | undefined;
    };
    execution: {
        maxIterations: number;
        maxTurns: number;
        autoRecover: boolean;
        dryRun: boolean;
        timeoutMs: number;
    };
    persistence: {
        dbPath: string;
    };
    logLevel: "debug" | "info" | "warn" | "error";
}, {
    version?: string | undefined;
    model?: {
        provider?: "openai" | "anthropic" | "custom" | undefined;
        modelName?: string | undefined;
        apiKey?: string | undefined;
        maxTokens?: number | undefined;
        temperature?: number | undefined;
    } | undefined;
    execution?: {
        maxIterations?: number | undefined;
        maxTurns?: number | undefined;
        autoRecover?: boolean | undefined;
        dryRun?: boolean | undefined;
        timeoutMs?: number | undefined;
    } | undefined;
    persistence?: {
        dbPath?: string | undefined;
    } | undefined;
    logLevel?: "debug" | "info" | "warn" | "error" | undefined;
}>;
export type ForgeConfig = z.infer<typeof ForgeConfigSchema>;
export declare function loadConfig(repoPath?: string): ForgeConfig;
//# sourceMappingURL=config.d.ts.map