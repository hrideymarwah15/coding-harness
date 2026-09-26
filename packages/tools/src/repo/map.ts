import * as fs from "node:fs";
import * as path from "node:path";
import { z } from "zod";
import { Tool, ToolContext, ToolResult } from "@forge/core";

export const RepoMapInputSchema = z.object({
  maxFiles: z.number().default(100).optional(),
  maxTokensEstimate: z.number().default(2000).optional()
});

export const GenerateRepoMapTool: Tool = {
  name: "generate_repo_map",
  description: "Generate a compact repository outline map for context assembly",
  sideEffect: "READ_ONLY",
  inputSchema: RepoMapInputSchema,
  async execute(input: z.infer<typeof RepoMapInputSchema>, ctx: ToolContext): Promise<ToolResult> {
    const fileList: string[] = [];

    const walk = (dir: string) => {
      if (fileList.length >= (input.maxFiles || 100)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist" || entry.name === "target") continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (entry.isFile()) {
          fileList.push(path.relative(ctx.repoPath, full));
        }
      }
    };

    walk(ctx.repoPath);

    // Build compact structural summary
    const outline: string[] = ["# Repository Map", ""];
    for (const file of fileList) {
      outline.push(`- ${file}`);
    }

    const outputText = outline.join("\n");
    const estimatedTokens = Math.ceil(outputText.length / 4);

    return {
      success: true,
      data: {
        totalFilesMapped: fileList.length,
        estimatedTokens,
        map: outputText
      },
      durationMs: 0
    };
  }
};
