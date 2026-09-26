import { describe, it, expect } from "vitest";
import { StateMachine, StorageEngine, loadConfig } from "@forge/core";
import { MockModelAdapter } from "@forge/model";
import {
  ToolRouter,
  ReadFileTool,
  ListDirTool,
  GitStatusTool,
  GitDiffTool,
  GitLogTool,
  SearchTextTool,
  DiscoverInstructionsTool,
  GenerateRepoMapTool
} from "@forge/tools";

describe("Forge Harness Core & Tool Suite", () => {
  it("transitions state machine correctly", () => {
    const sm = new StateMachine("INTAKE");
    expect(sm.getState()).toBe("INTAKE");

    sm.transition("DISCOVER", "discovering repo");
    expect(sm.getState()).toBe("DISCOVER");

    sm.transition("EXPLORE", "exploring files");
    expect(sm.getState()).toBe("EXPLORE");

    sm.transition("PLAN", "formulating plan");
    expect(sm.getState()).toBe("PLAN");

    expect(() => sm.transition("COMPLETE")).toThrow();
  });

  it("persists tasks and events in SQLite", () => {
    const storage = new StorageEngine(":memory:");
    const task = {
      id: "test-task-1",
      prompt: "Fix login bug",
      repoPath: "/tmp/repo",
      createdAt: Date.now(),
      status: "running" as const
    };

    storage.createTask(task);
    storage.recordEvent("test-task-1", {
      type: "task.started",
      taskId: "test-task-1",
      timestamp: Date.now()
    });

    const events = storage.getTaskEvents("test-task-1");
    expect(events.length).toBe(1);
    expect(events[0].type).toBe("task.started");
    storage.close();
  });

  it("executes read_file and list_directory tools via ToolRouter", async () => {
    const router = new ToolRouter();
    router.register(ReadFileTool);
    router.register(ListDirTool);
    router.register(GitStatusTool);

    const ctx = {
      taskId: "test-run",
      repoPath: process.cwd(),
      logger: console
    };

    const res = await router.execute("read_file", { path: "README.md" }, ctx);
    expect(res.success).toBe(true);
    expect((res.data as any).content).toContain("Forge Harness");

    const listRes = await router.execute("list_directory", { dirPath: ".", maxDepth: 1 }, ctx);
    expect(listRes.success).toBe(true);
  });

  it("discovers instructions, runs search, and generates repo map (Phase 1)", async () => {
    const router = new ToolRouter();
    router.register(DiscoverInstructionsTool);
    router.register(SearchTextTool);
    router.register(GitDiffTool);
    router.register(GitLogTool);
    router.register(GenerateRepoMapTool);

    const ctx = {
      taskId: "phase-1-test",
      repoPath: process.cwd(),
      logger: console
    };

    // 1. Discover instructions
    const instRes = await router.execute("discover_instructions", {}, ctx);
    expect(instRes.success).toBe(true);
    expect((instRes.data as any).totalFound).toBeGreaterThan(0);

    // 2. Search text
    const searchRes = await router.execute("search_text", { query: "Forge" }, ctx);
    expect(searchRes.success).toBe(true);
    expect((searchRes.data as any).totalMatches).toBeGreaterThan(0);

    // 3. Generate repo map
    const mapRes = await router.execute("generate_repo_map", {}, ctx);
    expect(mapRes.success).toBe(true);
    expect((mapRes.data as any).estimatedTokens).toBeLessThan(2000);

    // 4. Git log
    const logRes = await router.execute("git_log", { maxCount: 5 }, ctx);
    expect(logRes.success).toBe(true);
  });
});
