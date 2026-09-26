# Tool Contract

Every tool must expose:

```ts
interface ToolDefinition {
  name: string
  description: string
  inputSchema: JSONSchema
  outputSchema: JSONSchema
  sideEffect: "READ_ONLY" | "WRITE" | "EXECUTE" | "DESTRUCTIVE" | "NETWORK"
  timeoutMs: number
  requiresApproval: boolean
}
```

Tool results:

```ts
interface ToolResult {
  ok: boolean
  data?: unknown
  error?: {
    code: string
    message: string
    retryable: boolean
  }
  metadata?: {
    durationMs: number
    truncated: boolean
  }
}
```
