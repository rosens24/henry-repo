# Henry IV Operating System Architecture

Henry IV is the Cleanz operator system, not a chat UI. Commands flow through intent parsing, task planning, tool routing, permission checks, dry-run execution, approval gates, execution logs, verification, audit logging, and response generation.

Current MVP state is mock-first. Real integrations must attach through connectors and action modules with permission checks, audit logs, dry-run mode, and approval gates.

Core layers:

- `lib/agent/`: planner, router, permissions, approval, executor, memory, scheduler, rollback, agent network
- `lib/actions/`: safe action registry and mock action implementations
- `lib/bots/`: mock bot connector architecture for external services
- `lib/ai/`: Henry IV response engine and server-only OpenAI bridge
- `components/agent/`: command-center panels for missions, logs, agents, tools, approvals

Design north star: futuristic AI command center with central neural core, dense HUD panels, agent statuses, approvals, logs, and opportunity feeds.
