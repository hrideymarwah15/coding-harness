# Forge Harness PRD

## 1. Product

**Name:** Forge Harness  
**Type:** Repository-aware autonomous coding harness  
**Primary interface:** CLI first, API/UI later  
**Primary user:** developer working on an existing code repository

### One-line definition

Forge Harness gives a foundation model a controlled software-engineering environment: repository context, memory, tools, execution, recovery and verification.

---

## 2. Problem

A raw LLM can generate code but does not inherently know:
- which repository files matter
- what changed before
- how the project is structured
- which commands are safe
- whether its code actually works
- how to recover from a failed command
- when it should stop

Forge separates reasoning from environment control.

---

## 3. Goals

### P0
1. Accept a natural-language coding task.
2. Inspect an arbitrary local Git repository.
3. Build a compact repository map.
4. Select relevant files using lexical + structural search.
5. Create and maintain an execution plan.
6. Read and edit files through controlled tools.
7. Run tests, type checks, linters and build commands.
8. Parse failures and attempt recovery.
9. Verify the requested behavior before completion.
10. Produce a final report with changed files, validation and remaining risks.
11. Persist task state so a session can resume.
12. Keep an audit trail of tool calls and decisions.

### P1
- Tree-sitter symbol index
- LSP diagnostics
- Docker sandbox
- semantic retrieval
- parallel read-only exploration
- human approval gates
- patch rollback/checkpoints
- model routing by task complexity
- MCP tool integration

### P2
- web dashboard
- remote execution
- multi-agent worker pool
- SWE-bench-style evaluation suite
- repository-specific learned policies
- long-term project memory

---

## 4. Non-goals

- Fully autonomous production deployment by default
- Arbitrary destructive shell access
- Hidden modifications outside the target repository
- Building a general-purpose AGI framework
- Starting with a complex agent framework abstraction

---

## 5. User stories

### Coding task
> "Add pagination to GET /devices."

The harness should inspect routes, controllers, models and tests, implement the change, run validation, fix failures and report exactly what changed.

### Bug fix
> "POST /devices is returning null ids."

The harness should reproduce the issue, trace the data flow, identify the root cause, patch it, test it and verify persistence.

### Refactor
> "Replace this utility with a typed service."

The harness should identify consumers, update references, run tests/type checks and verify no stale references remain.

---

## 6. Success criteria

A task is successful only if:

1. The requested behavior is implemented.
2. Relevant tests pass or an explicit validation limitation is reported.
3. The repository remains syntactically/build valid.
4. The final diff is explainable.
5. No unrelated files are modified.
6. The agent can state what it verified.
7. The agent stops when the acceptance criteria are satisfied.

### Core metrics

- task success rate
- first-pass test success
- recovery success rate
- irrelevant-file read ratio
- tool-call count
- context-token efficiency
- average task latency
- cost/task
- verification coverage
- regression rate
- human takeover rate

---

## 7. Functional requirements

### FR-01 Task intake
Input:
- task description
- repository path
- optional constraints
- optional test command

Output:
- normalized task
- acceptance criteria
- risk classification

### FR-02 Repository discovery
The harness must inspect:
- Git status
- top-level tree
- package/build manifests
- README/project instructions
- AGENTS.md / local agent instructions
- test configuration
- language/runtime configuration

### FR-03 Repository map
Maintain:
- file tree
- language
- package/module boundaries
- important symbols
- dependency hints
- test locations
- configuration files
- instruction hierarchy

### FR-04 Context manager
Context must be assembled in layers:
1. system rules
2. task
3. repository instructions
4. plan/state
5. relevant repository excerpts
6. recent tool results
7. verification evidence

Never dump the whole repository into the prompt.

### FR-05 Tool layer
Minimum tools:
- `repo.list`
- `repo.read`
- `repo.search`
- `repo.symbols`
- `repo.write`
- `repo.patch`
- `git.status`
- `git.diff`
- `git.log`
- `shell.exec`
- `test.run`
- `verify.inspect`
- `session.checkpoint`

### FR-06 Orchestration
The orchestrator maintains explicit state:

`INTAKE → DISCOVER → EXPLORE → PLAN → IMPLEMENT → TEST → RECOVER → VERIFY → COMPLETE`

A task may loop between IMPLEMENT/TEST/RECOVER.

### FR-07 Error recovery
Every tool failure becomes structured data:
- command
- exit code
- stderr
- stdout
- likely category
- affected files
- retry count

Recovery strategy:
1. parse error
2. locate source
3. inspect relevant code
4. apply minimal fix
5. rerun focused validation
6. escalate to broader validation

### FR-08 Verification
Verification must be independent from the implementation claim.

Minimum:
- inspect Git diff
- run relevant tests
- run typecheck/build when available
- check requested acceptance criteria
- detect obvious debug artifacts
- confirm no unintended file changes

### FR-09 Checkpoints
Before risky changes:
- save session state
- capture Git status
- record target files

Optional:
- create temporary Git checkpoint/stash depending on policy

### FR-10 Human approval
Required before:
- deleting many files
- changing secrets/credentials
- network actions not explicitly allowed
- production deployment
- destructive database operations
- force push/reset
- modifying files outside repository scope

---

## 8. Agent modes

### Safe
Read/search/test allowed. Writes require approval.

### Standard
Read/write/test allowed. Destructive operations blocked.

### Autonomous
Read/write/test and approved network actions allowed inside sandbox. Human gates remain mandatory for irreversible actions.

---

## 9. Architecture

```text
                    ┌─────────────────────┐
                    │      User Task      │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │   Task Normalizer   │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │    Orchestrator     │
                    │  state + decisions  │
                    └──────┬───────┬──────┘
                           │       │
              ┌────────────┘       └────────────┐
              ↓                                 ↓
      ┌───────────────┐                 ┌───────────────┐
      │ Context Mgr   │                 │ Skill Router  │
      └───────┬───────┘                 └───────┬───────┘
              ↓                                 ↓
      ┌─────────────────────────────────────────────────┐
      │                 Foundation Model                │
      └──────────────────────┬──────────────────────────┘
                             ↓
                    ┌─────────────────────┐
                    │     Tool Router     │
                    └─────────┬───────────┘
                              ↓
        ┌──────────┬──────────┼──────────┬───────────┐
        ↓          ↓          ↓          ↓           ↓
      Files      Search       Git      Shell       Tests
        │          │          │          │           │
        └──────────┴──────────┴──────────┴───────────┘
                              ↓
                    ┌─────────────────────┐
                    │ Observation/Events  │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Verification Gate   │
                    └──────────┬──────────┘
                               ↓
                         Final Report
```

---

## 10. Agent roles

Do not implement these as separate LLM processes initially.

### Orchestrator
Owns state, next action and stopping.

### Explorer
Skill/behavior for repository discovery and targeted investigation.

### Implementer
Skill/behavior for making minimal changes.

### Debugger
Skill/behavior for interpreting failures and finding root causes.

### Verifier
Skill/behavior for independently checking the result.

### Reviewer
Skill/behavior for inspecting diff quality, scope and regressions.

Later, these can become separate worker agents if evaluation shows value.

---

## 11. Memory

Use three levels:

### Working memory
Current task state, active files, recent tool results.

### Session memory
Plan, attempts, failures, decisions, checkpoints.

### Repository memory
Stable facts:
- architecture map
- package commands
- conventions
- test commands
- repository instructions

Never store secrets in agent memory.

---

## 12. Context strategy

Use progressive disclosure.

### Tier 0
Task + rules.

### Tier 1
Repository map + instructions.

### Tier 2
Relevant symbols and file sections.

### Tier 3
Exact implementation context.

### Tier 4
Tests/errors/diffs.

### Tier 5
Historical context only when needed.

Context compaction should preserve:
- task
- acceptance criteria
- current hypothesis
- completed actions
- failed approaches
- current files
- validation status
- unresolved risks

---

## 13. Security

- sandbox shell execution
- allowlisted commands
- repository path boundary
- environment-variable filtering
- secret redaction
- command timeout
- output truncation
- file-size limits
- network disabled by default
- approval gates for dangerous operations
- complete audit log

---

## 14. API/CLI concept

```bash
forge run "Add pagination to GET /devices"
forge inspect
forge plan
forge status
forge diff
forge verify
forge resume <session-id>
forge replay <session-id>
```

Later:

```bash
forge serve
forge ui
```

---

## 15. Acceptance test

Given a repository containing a broken Express CRUD API and the task:

> "Fix POST /devices so the new device receives a persistent numeric id and add validation for name, type and price."

The harness must:
1. inspect project instructions
2. find POST /devices
3. inspect data persistence
4. identify the id-generation bug
5. inspect GET/PUT/DELETE behavior
6. implement validation
7. add/fix tests
8. run tests
9. recover from failures
10. inspect final diff
11. report exact verification results

---

## 16. Product principle

The harness is not "an LLM with a terminal."

It is a control system around an LLM:

`Model + Context + Tools + State + Policy + Feedback + Verification`

The model can be replaced. The harness remains.
