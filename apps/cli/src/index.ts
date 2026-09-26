#!/usr/bin/env node
import { Command } from "commander";
import pc from "picocolors";
import { loadConfig, createLogger, StateMachine, StorageEngine, Task } from "@forge/core";
import { MockModelAdapter } from "@forge/model";
import { ToolRouter, ReadFileTool, ListDirTool, GitStatusTool } from "@forge/tools";

const program = new Command();

program
  .name("forge")
  .description("Repository-aware autonomous coding agent harness")
  .version("0.1.0");

program
  .command("inspect")
  .description("Inspect the repository structure, git status, and generate initial map")
  .option("-r, --repo <path>", "Repository path", process.cwd())
  .action(async (options) => {
    console.log(pc.bold(pc.cyan("\n🔨 Forge Harness — Repository Inspection\n")));
    const logger = createLogger();
    const config = loadConfig(options.repo);
    const router = new ToolRouter();
    router.register(ReadFileTool);
    router.register(ListDirTool);
    router.register(GitStatusTool);

    const ctx = {
      taskId: "inspect-session",
      repoPath: options.repo,
      logger
    };

    const gitResult = await router.execute("git_status", {}, ctx);
    if (gitResult.success && gitResult.data) {
      console.log(pc.green(`✔ Git Branch:`), (gitResult.data as any).branch);
      console.log(pc.green(`✔ Git Status:`));
      console.log(pc.dim((gitResult.data as any).status));
    }

    const treeResult = await router.execute("list_directory", { dirPath: ".", maxDepth: 2 }, ctx);
    if (treeResult.success && treeResult.data) {
      console.log(pc.cyan(`\n📁 Repository Structure (depth=2):`));
      const printTree = (nodes: any[], indent: string = "  ") => {
        for (const n of nodes) {
          if (n.type === "directory") {
            console.log(`${indent}${pc.blue("📁 " + n.name)}/`);
            if (n.children) printTree(n.children, indent + "  ");
          } else {
            console.log(`${indent}${pc.gray("📄 " + n.name)}`);
          }
        }
      };
      printTree((treeResult.data as any).tree);
    }

    console.log(pc.bold(pc.green("\n✔ Inspection completed successfully.\n")));
  });

program
  .command("run <prompt>")
  .description("Execute an autonomous coding task in the repository")
  .option("-r, --repo <path>", "Repository path", process.cwd())
  .option("--dry-run", "Execute without writing disk modifications", false)
  .action(async (prompt, options) => {
    console.log(pc.bold(pc.cyan(`\n🚀 Forge Harness — Executing Task:\n"${prompt}"\n`)));
    const logger = createLogger();
    const config = loadConfig(options.repo);
    const stateMachine = new StateMachine("INTAKE");
    const storage = new StorageEngine(config.persistence.dbPath);
    const router = new ToolRouter();
    router.register(ReadFileTool);
    router.register(ListDirTool);
    router.register(GitStatusTool);

    const taskId = `task_${Date.now()}`;
    const task: Task = {
      id: taskId,
      prompt,
      repoPath: options.repo,
      createdAt: Date.now(),
      status: "running"
    };

    storage.createTask(task);
    console.log(pc.yellow(`State: ${stateMachine.getState()}`));

    // Transition INTAKE -> DISCOVER
    const ev1 = stateMachine.transition("DISCOVER", "Initial repository discovery");
    storage.recordEvent(taskId, ev1);
    console.log(pc.yellow(`State: ${stateMachine.getState()} (Discovering instructions & git status)`));

    const ctx = { taskId, repoPath: options.repo, logger, dryRun: options.dryRun };
    const gitRes = await router.execute("git_status", {}, ctx);
    storage.recordEvent(taskId, {
      type: "tool.completed",
      callId: "call_git_status",
      result: gitRes,
      timestamp: Date.now()
    });

    // Transition DISCOVER -> EXPLORE
    const ev2 = stateMachine.transition("EXPLORE", "Navigating repository files");
    storage.recordEvent(taskId, ev2);
    console.log(pc.yellow(`State: ${stateMachine.getState()} (Exploring relevant code)`));

    // Transition EXPLORE -> PLAN
    const ev3 = stateMachine.transition("PLAN", "Generating execution plan");
    storage.recordEvent(taskId, ev3);
    console.log(pc.yellow(`State: ${stateMachine.getState()} (Formulating patch steps)`));

    const modelAdapter = new MockModelAdapter();
    const modelOut = await modelAdapter.generate({
      messages: [{ role: "user", content: prompt }]
    });

    console.log(pc.magenta(`\n🤖 Model Plan:\n${modelOut.text}\n`));

    // Transition PLAN -> COMPLETE (for Phase 0 skeleton demo)
    stateMachine.transition("IMPLEMENT", "Applying changes");
    stateMachine.transition("TEST", "Running validation tests");
    stateMachine.transition("VERIFY", "Verifying criteria");
    const evFinal = stateMachine.transition("COMPLETE", "Task completed");
    storage.recordEvent(taskId, evFinal);
    storage.updateTaskStatus(taskId, "completed", Date.now());

    console.log(pc.bold(pc.green(`✔ Task ${taskId} completed successfully!`)));
    console.log(pc.dim(`Recorded events in SQLite at ${config.persistence.dbPath}\n`));
  });

program.parse(process.argv);
