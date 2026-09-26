# Forge Harness

A repository-aware coding agent harness that turns a foundation model into an autonomous software-engineering system.

## Core loop

`Understand → Explore → Plan → Act → Observe → Recover → Verify → Report`

The harness owns:
- orchestration
- context assembly and compaction
- repository exploration
- tool execution
- patch application
- test execution
- error recovery
- verification
- persistent task/session state
- audit/telemetry

The model owns reasoning. The harness owns the environment and control plane.

## Design principle

Do not start with a multi-agent swarm. Start with one capable agent operating through deterministic tools and explicit state transitions. Add specialized workers only when evaluations prove they improve outcomes.

## Repository

- `PRD.md` - product requirements
- `AGENTS.md` - agent operating contract
- `TECH-MAP.md` - architecture and technology decisions
- `RULES.md` - non-negotiable runtime rules
- `REFERENCES.md` - technical references
- `ROADMAP.md` - implementation sequence
- `skills/` - reusable agent skills
- `references/` - schemas and implementation notes
