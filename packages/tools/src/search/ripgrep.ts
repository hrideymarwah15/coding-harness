import { z } from "zod";
import { execSync, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { Tool, ToolContext, ToolResult } from "@forge/core";

export const SearchTextInputSchema = z.object({
  query: z.string().describe("Text or regex pattern to search for"),
  filePattern: z.string().optional().describe("Glob pattern to restrict searched files (e.g. '*.ts')"),
  caseSensitive: z.boolean().default(false).optional(),
  maxResults: z.number().default(50).optional()
});

export const SearchTextTool: Tool = {
  name: "search_text",
  description: "Search text/patterns across the repository using lexical search (ripgrep / fallback)",
  sideEffect: "READ_ONLY",
  inputSchema: SearchTextInputSchema,
  async execute(input: z.infer<typeof SearchTextInputSchema>, ctx: ToolContext): Promise<ToolResult> {
    const maxResults = input.maxResults || 50;
    try {
      const args = ["--no-heading", "--line-number", "--color=never", "-m", String(maxResults)];
      if (!input.caseSensitive) args.push("-i");
      if (input.filePattern) args.push("-g", input.filePattern);
      args.push("-g", "!node_modules", "-g", "!.git", "-g", "!dist", "-g", "!.forge");
      args.push(input.query, ".");

      const res = spawnSync("rg", args, {
        cwd: ctx.repoPath,
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024
      });

      if (res.status === 0 || res.status === 1) {
        const lines = (res.stdout || "").trim().split("\n").filter(Boolean);
        const matches = lines.slice(0, maxResults).map(line => {
          const parts = line.split(":");
          const filePath = parts[0];
          const lineNum = parseInt(parts[1], 10) || 1;
          const text = parts.slice(2).join(":");
          return { file: filePath, line: lineNum, text: text.trim() };
        });

        return {
          success: true,
          data: {
            query: input.query,
            totalMatches: matches.length,
            matches
          },
          durationMs: 0
        };
      }
    } catch {
      // Fallback to JS walk search if rg binary is not installed
    }

    // Fallback search
    const results: Array<{ file: string; line: number; text: string }> = [];
    const searchDir = (dir: string) => {
      if (results.length >= maxResults) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist" || entry.name === ".forge") continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          searchDir(full);
        } else if (entry.isFile()) {
          const content = fs.readFileSync(full, "utf-8");
          const lines = content.split("\n");
          lines.forEach((line, idx) => {
            if (results.length >= maxResults) return;
            const match = input.caseSensitive
              ? line.includes(input.query)
              : line.toLowerCase().includes(input.query.toLowerCase());
            if (match) {
              results.push({
                file: path.relative(ctx.repoPath, full),
                line: idx + 1,
                text: line.trim()
              });
            }
          });
        }
      }
    };

    searchDir(ctx.repoPath);

    return {
      success: true,
      data: {
        query: input.query,
        totalMatches: results.length,
        matches: results
      },
      durationMs: 0
    };
  }
};
