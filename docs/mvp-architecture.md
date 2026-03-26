# MVP Architecture

## Product Goal

Build the first credible version of `The Nexus`: a system that can look at a project's current state, decide what should happen next, and assign that work without creating collisions between executors.

## Why This Scope

The highest-risk problem is not UI or integrations. It is coordination. If the system cannot maintain a canonical project state, derive actionable tasks, and dispatch them safely, the rest of the product is decorative.

## MVP Boundaries

The first version should support:

- one canonical project state
- one rule-based planner
- one agent memory layer derived from project state and recent events
- one event bus that describes state changes and dispatch decisions
- one persistent event log that survives process restarts
- one dispatcher with dependency and lock enforcement
- a small agent registry with declared capabilities
- one execution graph for dependency reasoning
- one agent runtime that turns assignments into completions or failures

The first version should not yet support:

- long-running agent execution
- external integrations
- billing or token accounting
- autonomous code execution
- freelancer marketplace posting

## Canonical Models

### Project State

The project state is the single source of truth. It should include:

- business goal
- current stack and connected systems
- known product gaps
- readiness flags such as `hasAuth`, `hasLandingPage`, `hasStaging`
- active locks for protected work areas
- a version number
- task snapshots from the latest orchestration cycle
- a short event history

The important constraint is that planners, dispatchers, and agents all read from the same persisted shape. No component should invent its own source of truth.

### Task Contract

Each task must include:

- `id`
- `lane`: `build | maintenance | growth | marketing`
- `summary`
- `requiredCapabilities`
- `successCriteria`
- `context`
- `dependencies`
- `lockKey`
- `assigneeType`: `user | agent | human`
- `status`

This contract is strict on purpose. Agents should never receive work without an explicit definition of done and a bounded permission surface.

### Agent Memory

Agent memory is not a chatbot transcript. It is an execution-focused context package derived from:

- canonical project state
- the task contract
- recent events relevant to the agent or the task lane
- project goal and current constraints

This lets each agent work with stable context without scanning the full system every cycle.

### Event System

The event stream is the glue between planning, dispatching, validation, and UI. The MVP should emit at least:

- `state.updated`
- `roadmap.generated`
- `task.assigned`
- `task.completed`
- `task.failed`

Later services such as QA, billing, dashboards, or notifications should consume these events instead of reading orchestration internals directly.

The event log must be durable. For this repository, the first implementation is an append-only file log. In production, this should move to infrastructure such as Redis Streams, Kafka, NATS, or Postgres-backed events.

### Execution Graph

Tasks must also exist as a graph, not just as rows in a list. The graph captures ordered execution such as:

- `build-auth -> payment-integration`
- `setup-staging -> landing-page`
- `payment-integration -> campaign-plan`
- `landing-page -> campaign-plan`

This is the structure the runtime will eventually use for scheduling, retries, and re-planning.

### Agent Runtime

The runtime consumes `task.assigned` events, selects a concrete worker, executes the task, and emits `task.completed` or `task.failed`. Without this layer, the system is only an orchestration model.

## Execution Flow

1. The planner reads the project state.
2. The canonical state store versions and persists the current snapshot.
3. The planner creates or updates roadmap tasks from detected gaps.
4. The event bus emits a roadmap generation event.
5. The dispatcher finds tasks whose dependencies are satisfied.
6. The dispatcher checks lock contention and agent capability matches.
7. The memory layer builds assignment context for each selected agent.
8. The event bus emits persistent assignment events for the next orchestration cycle.
9. The agent runtime consumes assignment events and emits completion or failure events.

## Design Rules

- The planner may be heuristic at first, but the task contract cannot be vague.
- Every dispatchable task must be validated against dependencies and locks.
- The project state must be versionable so future runs can diff what changed.
- A lock should represent a shared work surface such as `auth`, `staging`, or `landing-page`.

## Near-Term Next Steps

After this foundation, the next meaningful increments are:

1. persist project state and task history
2. add agent execution reports and validation gates
3. plug the context engine into GitHub and product documentation
4. expose the orchestration state and event stream in a dashboard
