import { z } from "zod";
import * as fs from "node:fs";
import * as path from "node:path";
export const ForgeConfigSchema = z.object({
    version: z.string().default("1.0.0"),
    model: z.object({
        provider: z.enum(["openai", "anthropic", "custom"]).default("openai"),
        modelName: z.string().default("gpt-4o"),
        apiKey: z.string().optional(),
        maxTokens: z.number().default(4096),
        temperature: z.number().default(0.2)
    }).default({}),
    execution: z.object({
        maxIterations: z.number().default(25),
        maxTurns: z.number().default(50),
        autoRecover: z.boolean().default(true),
        dryRun: z.boolean().default(false),
        timeoutMs: z.number().default(300_000)
    }).default({}),
    persistence: z.object({
        dbPath: z.string().default(".forge/forge.sqlite")
    }).default({}),
    logLevel: z.enum(["debug", "info", "warn", "error"]).default("info")
});
export function loadConfig(repoPath = process.cwd()) {
    const possiblePaths = [
        path.join(repoPath, "forge.config.json"),
        path.join(repoPath, ".forge", "config.json"),
        path.join(repoPath, "forge.json")
    ];
    for (const configPath of possiblePaths) {
        if (fs.existsSync(configPath)) {
            try {
                const raw = JSON.parse(fs.readFileSync(configPath, "utf-8"));
                return ForgeConfigSchema.parse(raw);
            }
            catch (err) {
                console.warn(`[forge-config] Failed to parse config at ${configPath}, falling back to defaults`, err);
            }
        }
    }
    return ForgeConfigSchema.parse({});
}
//# sourceMappingURL=config.js.map