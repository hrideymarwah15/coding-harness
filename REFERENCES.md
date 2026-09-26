# References

## Agent architecture

1. Anthropic, *Building Effective Agents*  
   https://www.anthropic.com/engineering/building-effective-agents  
   Useful for workflow vs agent distinctions, orchestrator-worker patterns, evaluator loops, tool design and coding-agent architecture.

2. Anthropic, *Writing effective tools for AI agents*  
   https://www.anthropic.com/engineering/writing-tools-for-agents  
   Useful for tool ergonomics, namespacing, context-efficient outputs and tool evaluation.

## Tool interoperability

3. Model Context Protocol specification  
   https://modelcontextprotocol.io/specification/draft/server/index  
   Useful for the Prompts, Resources and Tools primitives and external tool integration.

## Repository intelligence

4. Tree-sitter  
   https://tree-sitter.github.io/tree-sitter/  
   Useful for incremental syntax parsing and syntax-aware repository indexing.

5. ripgrep guide  
   https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md  
   Useful for fast lexical repository search.

## Git

6. git-status  
   https://git-scm.com/docs/git-status  
   Useful for detecting working-tree changes and protecting user work.

7. git-diff  
   https://git-scm.com/docs/git-diff  
   Useful for patch inspection and verification.

8. git-log  
   https://git-scm.com/docs/git-log  
   Useful for repository history and change investigation.

## Observability

9. OpenTelemetry documentation  
   https://opentelemetry.io/docs/  
   Useful for standard traces, metrics and logs.

## Design principle

The central architectural lesson is to keep the control loop simple and observable. Use sophisticated retrieval, multi-agent decomposition or additional infrastructure only when evaluation demonstrates a measurable improvement.
