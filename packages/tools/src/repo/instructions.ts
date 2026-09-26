import { z } from "zod";
import * as fs from "node:fs";
import * as path from "node:path";
import { Tool, ToolContext, ToolResult } from "@forge/core";

const INSTRUCTION_FILES = [
  "AGENTS.md",
  "CLAUDE.md",
  "RULES.md",
  "CONTRIBUTING.md",
  "README.md",
  ".cursorrules",
  ".windsurfrules",
  "ROADMAP.md",
  "TECH-MAP.md"
];

export const DiscoverInstructionsInputSchema = z.object({
  customPaths: z.array(z.string()).optional()
});

export const DiscoverInstructionsTool: Tool = {
  name: "discover_instructions",
  description: "Find and read repository-level instruction files (AGENTS.md, CLAUDE.md, README.md, etc.)",
  sideEffect: "READ_ONLY",
  inputSchema: DiscoverInstructionsInputSchema,
  async execute(input: z.infer<typeof DiscoverInstructionsInputSchema>, ctx: ToolContext): Promise<ToolResult> {
    const candidates = [...INSTRUCTION_FILES, ...(input.customPaths || [])];
    const found: Array<{ path: string; sizeBytes: number; preview: string }> = [];

    for (const file of candidates) {
      const fullPath = path.join(ctx.repoPath, file);
      if (fs.existsSync(fullPath)) {
        const stat = fs.statSync(fullPath);
        if (stat.isFile()) {
          const content = fs.readFileSync(fullPath, "utf-8");
          found.push({
            path: file,
            sizeBytes: stat.size,
            preview: content.slice(0, 1000)
          });
        }
      }
    }

    return {
      success: true,
      data: {
        totalFound: found.length,
        files: found
      },
      durationMs: 0
    };
  }
};
