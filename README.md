# The Nexus

`The Nexus` is an orchestration layer for operators, founders, agencies, and AI agents. The product does three things:

1. Collect business and delivery context from code, analytics, and knowledge systems.
2. Convert that context into a live roadmap across build, maintenance, growth, and marketing.
3. Dispatch work to the right executor: the founder, an AI agent, or an external human.

This repository starts with the riskiest system first: the orchestration core.

## MVP

Version `0.1.0` focuses on the minimum loop that proves the product:

- ingest a project state
- persist a canonical version of that state
- infer the first roadmap tasks
- represent those tasks as an execution graph
- build agent-specific memory context
- persist and emit orchestration events
- enforce task dependencies and execution locks
- assign eligible work to agents with matching capabilities
- execute assignments through agent workers

## Run

```bash
npm test
npm start
npm run dev
```

## Current Structure

- `docs/mvp-architecture.md`: product and system boundaries for the first version
- `src/core/state-store.js`: canonical project state and task snapshots
- `src/core/memory.js`: agent-specific execution context
- `src/core/event-bus.js`: persistent event stream wrapper
- `src/core/file-event-log.js`: append-only event log on disk
- `src/core/project-graph.js`: execution graph for task dependencies
- `src/core/agent-runtime.js`: worker runtime that consumes assignments
- `src/core/project-service.js`: app-facing service for projects and orchestration cycles
- `src/core/planner.js`: rule-based strategic planner for initial roadmap generation
- `src/core/dispatcher.js`: dependency-aware task assignment
- `src/core/orchestrator.js`: one-cycle orchestration loop
- `src/agents/*`: concrete agent workers
- `src/server.js`: HTTP API and local cockpit server
- `web/*`: browser UI for the first control room
- `test/orchestrator.test.js`: executable validation of the first agent workflow
