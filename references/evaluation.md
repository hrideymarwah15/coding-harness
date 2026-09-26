# Evaluation Design

## Task categories

1. locate
2. explain
3. bug fix
4. feature addition
5. test addition
6. refactor
7. dependency update
8. multi-file change
9. regression repair

## Metrics

### Primary
- task success
- regression-free success

### Secondary
- tokens
- cost
- latency
- tool calls
- retries
- files read
- files changed
- human interventions

## Failure labels

- wrong location
- wrong hypothesis
- bad edit
- missed dependency
- insufficient context
- test misunderstanding
- recovery failure
- verification failure
- unsafe action

## Benchmark principle

Every new architectural feature should be justified by benchmark evidence.
