import { State, AgentEvent } from "./types.js";

export class StateMachine {
  private currentState: State = "INTAKE";
  private history: { state: State; timestamp: number; reason?: string }[] = [];

  constructor(initialState: State = "INTAKE") {
    this.currentState = initialState;
    this.history.push({ state: initialState, timestamp: Date.now() });
  }

  public getState(): State {
    return this.currentState;
  }

  public getHistory() {
    return [...this.history];
  }

  public canTransition(next: State): boolean {
    const validTransitions: Record<State, State[]> = {
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

  public transition(next: State, reason?: string): AgentEvent {
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
