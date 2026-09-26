# Forge Harness Tech Map

## Recommended stack

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript | Fast iteration, strong ecosystem, matches user's current stack |
| Runtime | Node.js 22+ | Native async/process/fs support |
| Package manager | pnpm | Monorepo/workspace ergonomics |
| CLI | Commander or yargs | Simple CLI surface |
| Validation | Zod | Runtime contracts |
| LLM adapter | Provider-neutral interface | Avoid vendor lock-in |
| Primary model | OpenAI/Anthropic adapter | Strong tool use and coding ability |
| State | SQLite + Drizzle | Local-first, inspectable persistence |
| Search | ripgrep | Fast lexical repository search |
| Parsing | Tree-sitter | Syntax-aware symbols and structure |
| Git | native Git CLI | Mature repository semantics |
| Sandbox | Docker | Isolation and resource controls |
| Tests | Vitest | Fast TS testing |
| Schemas | JSON Schema/Zod | Tool contracts |
| Observability | OpenTelemetry | Standard traces, metrics and logs |
| MCP | MCP client layer | External tools/resources when needed |
| UI | Next.js later | Optional dashboard after CLI works |

## Package layout

```text
apps/
  cli/
  server/                 # later
  web/                    # later

packages/
  core/
    orchestrator/
    context/
    state/
    policy/
  model/
    provider/
    prompts/
    schemas/
  tools/
    repo/
    search/
    git/
    shell/
    test/
  indexer/
    tree-sitter/
    symbols/
  sandbox/
  memory/
  skills/
  evaluation/
  observability/

skills/
  repo-exploration/
  planning/
  implementation/
  debugging/
  testing/
  verification/
  code-review/
  context-compaction/
  git-safety/
  dependency-analysis/

references/
  tool-contracts/
  schemas/
  prompts/
```

## Core interfaces

```ts
interface ModelAdapter {
  generate(input: ModelInput): Promise<ModelOutput>
}

interface Tool {
  name: string
  description: string
  inputSchema: JsonSchema
  execute(input: unknown, ctx: ToolContext): Promise<ToolResult>
}

interface Orchestrator {
  run(task: Task, session: Session): Promise<RunResult>
}

interface ContextManager {
  build(state: AgentState): Promise<ModelContext>
  compact(state: AgentState): Promise<CompactedState>
}

interface Verifier {
  verify(task: Task, state: AgentState): Promise<VerificationResult>
}
```

## Event model

Every meaningful operation emits an event:

```ts
type AgentEvent =
  | { type: "task.started"; taskId: string }
  | { type: "state.changed"; from: State; to: State }
  | { type: "tool.called"; tool: string; callId: string }
  | { type: "tool.completed"; callId: string; result: ToolResult }
  | { type: "model.called"; provider: string; model: string }
  | { type: "file.changed"; path: string }
  | { type: "test.completed"; status: string }
  | { type: "verification.completed"; status: string }
  | { type: "task.completed"; taskId: string }
```

## Orchestrator state machine

```text
INTAKE
  ↓
DISCOVER
  ↓
EXPLORE
  ↓
PLAN
  ↓
IMPLEMENT
  ↓
TEST ─────failure────→ RECOVER
  │                       │
  │                       └──→ TEST
  ↓
VERIFY
  ├──fail──→ IMPLEMENT
  ↓
COMPLETE
```

## Context architecture

```text
System Rules
    +
Task
    +
Repository Instructions
    +
Repository Map
    +
Active Plan
    +
Relevant Files/Symbols
    +
Recent Tool Results
    +
Verification Evidence
```

## Retrieval strategy

### Level 1: lexical
ripgrep:
- identifiers
- route names
- error strings
- imports
- filenames

### Level 2: structural
Tree-sitter:
- functions
- classes
- imports
- exports
- call sites
- syntax regions

### Level 3: semantic
Optional embeddings/vector search after Level 1/2 are proven insufficient.

Do not introduce vector search merely because it sounds intelligent.

## Tool architecture

Each tool has:
- name
- purpose
- input schema
- output schema
- permissions
- timeout
- side-effect class
- error taxonomy
- examples

### Side-effect classes

`READ_ONLY`
`WRITE`
`EXECUTE`
`DESTRUCTIVE`
`NETWORK`

The policy engine decides whether a tool can run.

## Model architecture

Provider adapter:

```text
Orchestrator
     ↓
ModelAdapter
 ┌───┴────────────┐
 ↓                ↓
OpenAI          Anthropic
```

The orchestrator should not contain provider-specific logic.

## Persistence

SQLite tables:

- sessions
- tasks
- plans
- events
- tool_calls
- checkpoints
- memories
- repository_snapshots
- verification_runs

## Security boundary

```text
Host
 └── Forge
      └── Sandbox
           ├── repository
           ├── process limits
           ├── filesystem limits
           ├── network policy
           └── command policy
```

## What not to build initially

- multi-agent swarm
- vector database
- browser automation
- remote workers
- complex graph orchestration
- autonomous deployment
- fine-tuned model
- custom LLM
