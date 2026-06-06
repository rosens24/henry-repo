# Technical Debt

This file records shortcuts, known constraints, estimated impact, and recommended future fixes.

## Current Debt

### Mock-only persistence

- Shortcut: Henry IV memory, approvals, XENOMORPH handoffs, agent history, and audit logs are currently in-memory/local mock structures.
- Impact: State resets on server restart and cannot support team usage or durable operations.
- Recommendation: Add a local durable store for development, then Supabase-backed persistence after credentials and schema approval.

### Live voice credential dependency

- Shortcut: Live Henry IV voice is implemented with a server-mediated OpenAI Realtime WebRTC route, but it cannot complete a session until `OPENAI_API_KEY` is present in local env.
- Impact: Without the key, the UI correctly reports that live voice is waiting on credentials and the browser Web Speech diagnostics remain unreliable.
- Recommendation: Add `OPENAI_API_KEY` to `.env.local` locally, verify the Realtime session end to end, then keep Web Speech as fallback only.

### In-memory rate limiting

- Shortcut: API rate limiting uses process memory.
- Impact: Limits reset on restart and are not shared across serverless instances.
- Recommendation: Move to Supabase/Redis/durable rate limiting before production automation.

### Large dashboard component

- Shortcut: `components/jarvis/jarvis-dashboard.tsx` owns too much layout and state.
- Impact: Future feature work may become slower and harder to test.
- Recommendation: Split into command-center layout, header telemetry, central core, side rails, bottom panels, and agent state hooks.
