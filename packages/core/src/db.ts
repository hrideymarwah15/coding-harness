import { DatabaseSync } from "node:sqlite";
import * as path from "node:path";
import * as fs from "node:fs";
import { Task, AgentEvent, State } from "./types.js";

export class StorageEngine {
  private db: DatabaseSync;

  constructor(dbPath: string = ".forge/forge.sqlite") {
    if (dbPath !== ":memory:") {
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
    this.db = new DatabaseSync(dbPath);
    this.initSchema();
  }

  private initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        prompt TEXT NOT NULL,
        repo_path TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        completed_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        current_state TEXT NOT NULL,
        iteration INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY(task_id) REFERENCES tasks(id)
      );

      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY(task_id) REFERENCES tasks(id)
      );

      CREATE TABLE IF NOT EXISTS tool_calls (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        tool_name TEXT NOT NULL,
        input TEXT NOT NULL,
        output TEXT,
        duration_ms INTEGER,
        created_at INTEGER NOT NULL
      );
    `);
  }

  public createTask(task: Task) {
    const stmt = this.db.prepare(`
      INSERT INTO tasks (id, prompt, repo_path, status, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(task.id, task.prompt, task.repoPath, task.status, task.createdAt);
  }

  public updateTaskStatus(taskId: string, status: string, completedAt?: number) {
    const stmt = this.db.prepare(`
      UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?
    `);
    stmt.run(status, completedAt || null, taskId);
  }

  public recordEvent(taskId: string, event: AgentEvent) {
    const stmt = this.db.prepare(`
      INSERT INTO events (task_id, event_type, payload, created_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(taskId, event.type, JSON.stringify(event), event.timestamp);
  }

  public getTaskEvents(taskId: string): AgentEvent[] {
    const stmt = this.db.prepare(`
      SELECT payload FROM events WHERE task_id = ? ORDER BY created_at ASC
    `);
    const rows = stmt.all(taskId) as { payload: string }[];
    return rows.map(r => JSON.parse(r.payload));
  }

  public close() {
    this.db.close();
  }
}
