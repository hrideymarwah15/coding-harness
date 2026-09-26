import { State, AgentEvent } from "./types.js";
export declare class StateMachine {
    private currentState;
    private history;
    constructor(initialState?: State);
    getState(): State;
    getHistory(): {
        state: State;
        timestamp: number;
        reason?: string;
    }[];
    canTransition(next: State): boolean;
    transition(next: State, reason?: string): AgentEvent;
}
//# sourceMappingURL=state.d.ts.map