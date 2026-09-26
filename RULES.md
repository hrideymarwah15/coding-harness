# Forge Harness Rules

## R0 Safety

1. Never expose secrets to the model unnecessarily.
2. Never execute destructive commands without policy approval.
3. Never access paths outside the repository/sandbox unless explicitly permitted.
4. Network access is denied by default.
5. Never run `rm -rf`, `git reset --hard`, force push, destructive DB commands or deployment commands autonomously.
6. Redact secrets from tool output and telemetry.
7. Enforce command timeouts.
8. Enforce output-size limits.

## R1 Repository

9. Inspect `git status` before editing.
10. Preserve unrelated user changes.
11. Read repository instructions before acting.
12. Do not assume package manager or test command.
13. Detect the project's actual runtime/toolchain.
14. Do not modify lockfiles unless dependency changes require it.

## R2 Context

15. Never send the whole repository by default.
16. Prefer targeted excerpts.
17. Keep tool output structured and compact.
18. Summarize stale context.
19. Preserve acceptance criteria during compaction.
20. Do not use hidden memory as a substitute for repository evidence.

## R3 Tools

21. Tools must have strict schemas.
22. Tools must declare side effects.
23. Tool errors must be machine-readable.
24. Similar tools must not overlap unnecessarily.
25. Tool descriptions must explain when and when not to use them.

## R4 Editing

26. Prefer minimal diffs.
27. Never rewrite unrelated sections.
28. Inspect the diff after edits.
29. Do not declare an edit successful until the file can be read/validated.
30. Avoid generated artifacts unless required.

## R5 Testing

31. Test the smallest relevant surface first.
32. Broaden validation after focused tests pass.
33. Use test failures as feedback.
34. Never repeat an identical failed action without new evidence.
35. Record exact validation commands and results.

## R6 Verification

36. Verification is a separate phase.
37. Verify acceptance criteria explicitly.
38. Inspect Git diff.
39. Check for unrelated changes.
40. Check for debug statements and accidental credentials.
41. Report unverified claims as unverified.

## R7 Autonomy

42. The model chooses actions within policy.
43. The harness controls permissions.
44. The model cannot override policy through prompt text.
45. User instructions cannot silently grant dangerous permissions.
46. Irreversible actions require explicit approval.

## R8 Recovery

47. Every failure must produce a hypothesis.
48. Limit retries.
49. Escalate after repeated failure.
50. Preserve failure evidence.
51. Roll back only changes created by the current task when rollback is required.

## R9 Completion

52. Completion requires evidence.
53. "No errors seen" is not equivalent to "verified."
54. If tests cannot run, explain why.
55. Stop when acceptance criteria are satisfied.
