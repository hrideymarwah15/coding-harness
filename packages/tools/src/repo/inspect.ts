import { z } from "zod";
import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
import { Tool, ToolContext, ToolResult } from "@forge/core";

export const ReadFileInputSchema = z.object({
  path: z.string().describe("Relative path to file from repository root"),
  maxBytes: z.number().default(100_000).optional()
});

export const ReadFileTool: Tool = {
  name: "read_file",
  description: "Read contents of a file in the repository",
  sideEffect: "READ_ONLY",
  inputSchema: ReadFileInputSchema,
  async execute(input: z.infer<typeof ReadFileInputSchema>, ctx: ToolContext): Promise<ToolResult> {
    const fullPath = path.resolve(ctx.repoPath, input.path);
    if (!fullPath.startsWith(path.resolve(ctx.repoPath))) {
      return { success: false, error: "Access denied: Path is outside repository root", durationMs: 0 };
    }

    if (!fs.existsSync(fullPath)) {
      return { success: false, error: `File not found: ${input.path}`, durationMs: 0 };
    }

    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) {
      return { success: false, error: `Path is not a regular file: ${input.path}`, durationMs: 0 };
    }

    const content = fs.readFileSync(fullPath, "utf-8");
    return {
      success: true,
      data: {
        path: input.path,
        sizeBytes: stat.size,
        content: content.slice(0, input.maxBytes || 100_000)
      },
      durationMs: 0
    };
  }
};

export const ListDirInputSchema = z.object({
  dirPath: z.string().default(".").describe("Relative directory path"),
  maxDepth: z.number().default(3).optional()
});

export const ListDirTool: Tool = {
  name: "list_directory",
  description: "List files and subdirectories in a directory",
  sideEffect: "READ_ONLY",
  inputSchema: ListDirInputSchema,
  async execute(input: z.infer<typeof ListDirInputSchema>, ctx: ToolContext): Promise<ToolResult> {
    const targetDir = path.resolve(ctx.repoPath, input.dirPath);
    if (!fs.existsSync(targetDir)) {
      return { success: false, error: `Directory not found: ${input.dirPath}`, durationMs: 0 };
    }

    const getTree = (dir: string, depth: number): any[] => {
      if (depth > (input.maxDepth || 3)) return [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      return entries
        .filter(e => !e.name.startsWith(".git") && e.name !== "node_modules")
        .map(e => {
          const itemPath = path.relative(ctx.repoPath, path.join(dir, e.name));
          if (e.isDirectory()) {
            return {
              name: e.name,
              path: itemPath,
              type: "directory",
              children: getTree(path.join(dir, e.name), depth + 1)
            };
          }
          return {
            name: e.name,
            path: itemPath,
            type: "file"
          };
        });
    };

    const tree = getTree(targetDir, 1);
    return {
      success: true,
      data: { tree },
      durationMs: 0
    };
  }
};

export const GitStatusTool: Tool = {
  name: "git_status",
  description: "Inspect current Git status and diff in the repository",
  sideEffect: "READ_ONLY",
  inputSchema: z.object({}),
  async execute(_input: any, ctx: ToolContext): Promise<ToolResult> {
    try {
      const status = execSync("git status --short", { cwd: ctx.repoPath, encoding: "utf-8" });
      const branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: ctx.repoPath, encoding: "utf-8" }).trim();
      return {
        success: true,
        data: {
          branch,
          status: status || "(clean working tree)"
        },
        durationMs: 0
      };
    } catch (err: any) {
      return { success: false, error: err?.message || String(err), durationMs: 0 };
    }
  }
};
