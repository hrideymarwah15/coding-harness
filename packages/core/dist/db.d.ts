import { Task, AgentEvent } from "./types.js";
export declare class StorageEngine {
    private db;
    constructor(dbPath?: string);
    private initSchema;
    createTask(task: Task): void;
    updateTaskStatus(taskId: string, status: string, completedAt?: number): void;
    recordEvent(taskId: string, event: AgentEvent): void;
    getTaskEvents(taskId: string): AgentEvent[];
    close(): void;
}
//# sourceMappingURL=db.d.ts.map