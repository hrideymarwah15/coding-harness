export class StateMachine {
    currentState = "INTAKE";
    history = [];
    constructor(initialState = "INTAKE") {
        this.currentState = initialState;
        this.history.push({ state: initialState, timestamp: Date.now() });
    }
    getState() {
        return this.currentState;
    }
    getHistory() {
        return [...this.history];
    }
    canTransition(next) {
        const validTransitions = {
            INTAKE: ["DISCOVER", "FAILED"],
            DISCOVER: ["EXPLORE", "FAILED"],
            EXPLORE: ["PLAN", "FAILED"],
            PLAN: ["IMPLEMENT", "FAILED"],
            IMPLEMENT: ["TEST", "FAILED"],
            TEST: ["RECOVER", "VERIFY", "FAILED"],
            RECOVER: ["TEST", "FAILED"],
            VERIFY: ["IMPLEMENT", "COMPLETE", "FAILED"],
            COMPLETE: [],
            FAILED: []
        };
        return validTransitions[this.currentState]?.includes(next) ?? false;
    }
    transition(next, reason) {
        if (!this.canTransition(next)) {
            throw new Error(`Invalid state transition from ${this.currentState} to ${next}`);
        }
        const prev = this.currentState;
        this.currentState = next;
        const now = Date.now();
        this.history.push({ state: next, timestamp: now, reason });
        return {
            type: "state.changed",
            from: prev,
            to: next,
            timestamp: now,
            reason
        };
    }
}
//# sourceMappingURL=state.js.map