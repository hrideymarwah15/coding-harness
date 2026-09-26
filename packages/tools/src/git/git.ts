import { z } from "zod";
import { execSync } from "node:child_process";
import { Tool, ToolContext, ToolResult } from "@forge/core";

export const GitDiffInputSchema = z.object({
  staged: z.boolean().default(false).optional(),
  targetCommit: z.string().optional()
});

export const GitDiffTool: Tool = {
  name: "git_diff",
  description: "View git diff for working tree or specific commits",
  sideEffect: "READ_ONLY",
  inputSchema: GitDiffInputSchema,
  async execute(input: z.infer<typeof GitDiffInputSchema>, ctx: ToolContext): Promise<ToolResult> {
    try {
      let cmd = "git diff";
      if (input.staged) cmd += " --staged";
      if (input.targetCommit) cmd += ` ${input.targetCommit}`;

      const diff = execSync(cmd, { cwd: ctx.repoPath, encoding: "utf-8" });
      return {
        success: true,
        data: {
          hasDiff: diff.trim().length > 0,
          diff: diff.slice(0, 100_000)
        },
        durationMs: 0
      };
    } catch (err: any) {
      return { success: false, error: err?.message || String(err), durationMs: 0 };
    }
  }
};

export const GitLogInputSchema = z.object({
  maxCount: z.number().default(10).optional()
});

export const GitLogTool: Tool = {
  name: "git_log",
  description: "View recent Git commit history",
  sideEffect: "READ_ONLY",
  inputSchema: GitLogInputSchema,
  async execute(input: z.infer<typeof GitLogInputSchema>, ctx: ToolContext): Promise<ToolResult> {
    try {
      const maxCount = input.maxCount || 10;
      const log = execSync(`git log -n ${maxCount} --oneline`, { cwd: ctx.repoPath, encoding: "utf-8" });
      const commits = log.trim().split("\n").filter(Boolean).map(line => {
        const [hash, ...msgParts] = line.split(" ");
        return { hash, message: msgParts.join(" ") };
      });

      return {
        success: true,
        data: {
          totalCommits: commits.length,
          commits
        },
        durationMs: 0
      };
    } catch (err: any) {
      return { success: false, error: err?.message || String(err), durationMs: 0 };
    }
  }
};
