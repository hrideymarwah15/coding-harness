#!/usr/bin/env node
import { Command } from "commander";
import pc from "picocolors";
import { loadConfig, createLogger, StateMachine, StorageEngine } from "@forge/core";
import { MockModelAdapter } from "@forge/model";
import { ToolRouter, ReadFileTool, ListDirTool, GitStatusTool, GitDiffTool, GitLogTool, SearchTextTool, DiscoverInstructionsTool, GenerateRepoMapTool } from "@forge/tools";
const program = new Command();
program
    .name("forge")
    .description("Repository-aware autonomous coding agent harness")
    .version("0.1.0");
function buildRouter() {
    const router = new ToolRouter();
    router.register(ReadFileTool);
    router.register(ListDirTool);
    router.register(GitStatusTool);
    router.register(GitDiffTool);
    router.register(GitLogTool);
    router.register(SearchTextTool);
    router.register(DiscoverInstructionsTool);
    router.register(GenerateRepoMapTool);
    return router;
}
program
    .command("inspect")
    .description("Inspect the repository structure, git status, instructions, and generate repository map")
    .option("-r, --repo <path>", "Repository path", process.cwd())
    .action(async (options) => {
    console.log(pc.bold(pc.cyan("\n🔨 Forge Harness — Repository Inspection (Phase 1: Repo Brain)\n")));
    const logger = createLogger();
    const router = buildRouter();
    const ctx = {
        taskId: "inspect-session",
        repoPath: options.repo,
        logger
    };
    // 1. Git Status & Log
    const gitResult = await router.execute("git_status", {}, ctx);
    if (gitResult.success && gitResult.data) {
        console.log(pc.green(`✔ Git Branch:`), gitResult.data.branch);
        console.log(pc.green(`✔ Git Status:`));
        console.log(pc.dim(gitResult.data.status));
    }
    const logResult = await router.execute("git_log", { maxCount: 3 }, ctx);
    if (logResult.success && logResult.data) {
        console.log(pc.green(`\n✔ Recent Commits:`));
        for (const c of logResult.data.commits) {
            console.log(`  ${pc.yellow(c.hash)} ${c.message}`);
        }
    }
    // 2. Discover Instructions
    const instResult = await router.execute("discover_instructions", {}, ctx);
    if (instResult.success && instResult.data) {
        console.log(pc.cyan(`\n📜 Repository Instructions Discovered (${instResult.data.totalFound} files):`));
        for (const f of instResult.data.files) {
            console.log(`  ${pc.blue("•")} ${pc.bold(f.path)} ${pc.dim(`(${f.sizeBytes} bytes)`)}`);
        }
    }
    // 3. Compact Repo Map
    const mapResult = await router.execute("generate_repo_map", {}, ctx);
    if (mapResult.success && mapResult.data) {
        console.log(pc.magenta(`\n🗺 Compact Repository Map (${mapResult.data.totalFilesMapped} files, ~${mapResult.data.estimatedTokens} tokens):`));
        console.log(pc.dim(mapResult.data.map));
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
    const router = buildRouter();
    const taskId = `task_${Date.now()}`;
    const task = {
        id: taskId,
        prompt,
        repoPath: options.repo,
        createdAt: Date.now(),
        status: "running"
    };
    storage.createTask(task);
    console.log(pc.yellow(`State: ${stateMachine.getState()}`));
    // Transition INTAKE -> DISCOVER
    const ev1 = stateMachine.transition("DISCOVER", "Discovering instructions & git baseline");
    storage.recordEvent(taskId, ev1);
    console.log(pc.yellow(`State: ${stateMachine.getState()} (Discovering instructions & git baseline)`));
    const ctx = { taskId, repoPath: options.repo, logger, dryRun: options.dryRun };
    await router.execute("discover_instructions", {}, ctx);
    await router.execute("git_status", {}, ctx);
    // Transition DISCOVER -> EXPLORE
    const ev2 = stateMachine.transition("EXPLORE", "Building repository map and lexical search");
    storage.recordEvent(taskId, ev2);
    console.log(pc.yellow(`State: ${stateMachine.getState()} (Building repository map & lexical search)`));
    const mapRes = await router.execute("generate_repo_map", {}, ctx);
    // Transition EXPLORE -> PLAN
    const ev3 = stateMachine.transition("PLAN", "Formulating patch steps");
    storage.recordEvent(taskId, ev3);
    console.log(pc.yellow(`State: ${stateMachine.getState()} (Formulating patch steps)`));
    const modelAdapter = new MockModelAdapter();
    const modelOut = await modelAdapter.generate({
        messages: [
            { role: "system", content: "Repository context assembled." },
            { role: "user", content: prompt }
        ]
    });
    console.log(pc.magenta(`\n🤖 Model Plan:\n${modelOut.text}\n`));
    // Transition PLAN -> COMPLETE
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
//# sourceMappingURL=index.js.map