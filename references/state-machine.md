# State Machine

```ts
type State =
  | "INTAKE"
  | "DISCOVER"
  | "EXPLORE"
  | "PLAN"
  | "IMPLEMENT"
  | "TEST"
  | "RECOVER"
  | "VERIFY"
  | "COMPLETE"
  | "BLOCKED"
```

Transition rules:

- INTAKE → DISCOVER
- DISCOVER → EXPLORE
- EXPLORE → PLAN
- PLAN → IMPLEMENT
- IMPLEMENT → TEST
- TEST → VERIFY when successful
- TEST → RECOVER when failed
- RECOVER → TEST after a new fix
- VERIFY → COMPLETE when criteria pass
- VERIFY → IMPLEMENT when criteria fail and changes are possible
- any state → BLOCKED when human input is required
