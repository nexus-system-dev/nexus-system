# Nexus System

Nexus is a desktop-first web application for managing projects through AI-assisted execution, explanation, recovery, approvals, and workspace continuity.

The repository currently contains:

- a canonical project state layer
- execution, approval, recovery, and explanation flows
- a local HTTP server and cockpit UI
- acceptance tests for the core product loop
- the active `v2` build plan for product experience, real-time behavior, collaboration, and state versioning

## Current Status

- `v1` is complete as an internal validated foundation
- `v2` is in progress
- work is currently focused on `Wave 1`, which upgrades the product experience layer

## Local Development

Install dependencies:

```bash
npm install
```

Run the server locally:

```bash
npm run dev
```

Run the full test suite:

```bash
npm test
```

## Repository Structure

- `docs/` product architecture, source backlog, validation logs, and the `v2` execution plan
- `src/core/` canonical modules for state, orchestration, policies, recovery, workspaces, and UI contracts
- `src/agents/` worker agents
- `src/server.js` local API server
- `web/` cockpit UI
- `test/` automated test coverage across the core system

## Key Documents

- `docs/backlog-unified-status-and-order.md`
- `docs/v1-bug-validation.md`
- `docs/v2-master-plan-and-waves.md`
