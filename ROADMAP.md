# Implementation Roadmap

## Phase 0: Skeleton

Build:
- pnpm monorepo
- CLI
- config loader
- logger
- model adapter interface
- tool interface
- SQLite schema

Demo:
`forge run "Explain this repository"`

---

## Phase 1: Repository brain

Build:
- tree listing
- file reader
- ripgrep search
- Git status/diff/log
- repository instruction discovery
- repository map

Demo:
`forge inspect`

Acceptance:
Agent can explain project structure using targeted evidence without reading every file.

---

## Phase 2: Agent loop

Build:
- state machine
- model adapter
- tool router
- structured tool calls
- event log
- iteration limits

Demo:
`forge run "Find where POST /devices is implemented"`

Acceptance:
Agent can autonomously navigate to the relevant implementation.

---

## Phase 3: Editing

Build:
- patch tool
- safe write tool
- diff inspection
- checkpointing

Demo:
`forge run "Add input validation to POST /devices"`

Acceptance:
Agent modifies only necessary files and produces a coherent diff.

---

## Phase 4: Testing + recovery

Build:
- command detector
- test runner
- error parser
- recovery loop
- focused retry logic

Demo:
Give the agent a deliberately broken implementation.

Acceptance:
Agent can interpret a test failure, patch the cause and rerun validation.

---

## Phase 5: Verification

Build:
- acceptance-criteria evaluator
- independent verification prompt
- diff reviewer
- final report

Acceptance:
Agent refuses to claim completion when tests fail or requirements remain unmet.

---

## Phase 6: Indexing

Build:
- Tree-sitter symbol index
- imports/exports
- call-site search
- dependency graph

Acceptance:
Repository exploration becomes faster and more precise than raw text search alone.

---

## Phase 7: Sandbox

Build:
- Docker execution
- command allowlist
- resource limits
- network policy
- secret filtering

Acceptance:
Untrusted repository execution cannot freely affect the host.

---

## Phase 8: Skills

Implement:
- repository exploration
- planning
- implementation
- debugging
- testing
- verification
- code review
- context compaction
- dependency analysis
- Git safety

Skills should be loaded on demand, not injected permanently.

---

## Phase 9: Evaluation

Create 50-100 benchmark tasks:
- CRUD bugs
- missing validation
- broken imports
- type errors
- test failures
- refactors
- multi-file changes
- dependency issues

Measure:
- success
- cost
- latency
- retries
- irrelevant edits
- regression rate

---

## Phase 10: Advanced architecture

Only after the single-agent loop is strong:
- parallel read-only workers
- specialist debugging worker
- specialist review worker
- model routing
- semantic retrieval
- MCP
- web UI
- remote execution

## Golden rule

Do not add architecture because it is fashionable. Add it because an evaluation shows a real bottleneck.
