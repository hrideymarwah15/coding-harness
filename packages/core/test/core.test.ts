import { describe, it, expect } from "vitest";
import { StateMachine, StorageEngine, loadConfig } from "@forge/core";
import { MockModelAdapter } from "@forge/model";
import { ToolRouter, ReadFileTool, ListDirTool, GitStatusTool } from "@forge/tools";

describe("Forge Harness Core Suite", () => {
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

  it("handles model adapter calls", async () => {
    const adapter = new MockModelAdapter([
      {
        text: "Custom plan response",
        toolCalls: [],
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 }
      }
    ]);

    const res = await adapter.generate({
      messages: [{ role: "user", content: "Implement feature" }]
    });

    expect(res.text).toBe("Custom plan response");
  });
});
