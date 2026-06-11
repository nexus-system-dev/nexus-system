# SURF-009A / SURF-009B — Shell-to-Engine and Agent Integration Split Contract

## Status

- canonical task family: `SURF-009`
- canonical bridge task: `SURF-009A`
- canonical live-agent gate task: `SURF-009B`
- classification: `bridge task`
- `SURF-009A` closure truth: trueGreen as shell-to-engine and contract-anchor bridge only
- `SURF-009B` closure truth: open until live surface agents pass `Agent Reality Gate`

## Core Law

Every canonical Nexus surface is the visible face of three connected layers:

- surface: what the user sees and clicks
- agent: who understands, decides, explains, proposes, builds, mutates, verifies, shares, grows, or hands off
- engine: where truth, persistence, history, verification, release state, and recovery live

`SURF-009A` closes only the structural bridge:

- preserved engine anchors
- explicit agent or open-agent-task anchors
- Studio planning-contract anchors
- visible shell marker
- promise boundaries that prevent fake Desktop, local action, or live-agent claims

`SURF-009B` closes the live-agent bridge:

- live agents exist
- live agents pass `Agent Reality Gate`
- visible surface promises are backed by real agent action paths
- live proof shows user input -> live agent -> structured result -> visible/product effect or truthful blocked state

The two tasks are intentionally separate because the live agents are produced later by the slice and agent chain.

If a surface has a visible decision/action promise, it must declare the live agent responsible for that promise. If that agent is not implemented yet, the surface must declare the explicit open release-blocker task and must not be marked trueGreen from UI or engine shape alone.

## Preserved Engines

The following engines are preserved as hidden engines for the new shell:

- `project-service-truth-engine`
- `onboarding-intake-engine`
- `artifact-generation-engine`
- `continuity-memory-refresh-engine`
- `release-readiness-engine`

They may provide truth, state, evidence, and continuity, but they may not reintroduce old orchestration-first visible UX.

## Required Boundaries

- product truth
- agent decision
- mutation flow
- verification
- continuity
- release readiness
- history/versioning

## Surface Bridges

### Home

- surface contract: `SURF-002`
- engines: `project-service-truth-engine`, `continuity-memory-refresh-engine`
- agents: `AGT-001D`
- status: live front-door agent closed, continuation agent work may still be added later

### Build

- surface contract: `SURF-003`
- engines: `project-service-truth-engine`, `onboarding-intake-engine`, `artifact-generation-engine`, `continuity-memory-refresh-engine`
- open agent tasks: `SKEL-001`, `VSKEL-001`, `BLD-AGT-001`, `VBUILD-001`
- status: cannot claim full live build behavior until these agents pass `Agent Reality Gate`

### Release

- surface contract: `SURF-004`
- engines: `project-service-truth-engine`, `artifact-generation-engine`, `release-readiness-engine`, `continuity-memory-refresh-engine`
- open agent tasks: `VER-AGT-001`, `REL-AGT-001`
- status: release surface may show release truth, but live release decisions require these agents

### Growth

- surface contract: `SURF-005`
- engines: `project-service-truth-engine`, `continuity-memory-refresh-engine`
- open agent tasks: `GROW-AGT-001`, `GROW-AGT-002`, `GROW-MEASURE-001`
- status: growth surface may frame bounded opportunities, but live growth ownership requires these agents

### History

- surface contract: `SURF-006`
- engines: `project-service-truth-engine`, `continuity-memory-refresh-engine`
- open agent task: `HIST-AGT-001`
- status: history engine may preserve state, but live explanation/recovery ownership requires this agent

### Share

- surface contract: `SURF-007`
- engines: `project-service-truth-engine`, `artifact-generation-engine`, `release-readiness-engine`
- open agent task: `SHARE-AGT-001`
- status: share surface may show review/demo boundaries, but live safe-share decisions require this agent

### Studio

- surface contract: `SURF-008`
- engines: `project-service-truth-engine`, `continuity-memory-refresh-engine`
- open agent task: `STD-HANDOFF-AGT-001`
- contract anchors:
  - `STD-DOOR-001`
  - `STD-SYNC-001`
  - `STD-PERM-001`
  - `STD-RUN-001`
  - `STD-PKG-001`
  - `STD-DESIGN-001`
  - `STD-AGENT-001`
  - `STD-HIST-001`
- status: Studio web boundary may explain and hand off, but live handoff decisions require `STD-HANDOFF-AGT-001`
- promise boundary:
  - Web may explain why Studio is needed
  - Web may offer open/download/connect actions
  - Web must not claim installation detection before Desktop proof
  - Web must not claim local run, file write, sync, package, or recovery before Desktop proof
  - Web must not treat planning contracts as live Desktop capability

## Forbidden Closure

`SURF-009A` is not trueGreen if:

- a surface claims agent action without a live agent or explicit open agent task
- a surface is wired only to engines while the decision agent or open agent task is missing
- an old visible route remains the product truth owner
- the shell mutates product truth without an engine envelope
- the shell bypasses mutation, verification, release, history, or continuity boundaries
- a QA fallback, proof dashboard, debug timeline, Developer screen, or old orchestration screen becomes the visible product surface
- the Studio Web boundary claims Desktop-local action before Desktop proof exists

`SURF-009B` is not trueGreen if:

- a live surface action is simulated by a template, old engine, local fallback, or UI-only response
- a visible surface says work changed when no agent-backed or engine-backed change happened
- any required live surface agent has not passed `Agent Reality Gate`
- Studio Web claims Desktop handoff, install detection, local run, file write, package, recovery, or live sync before Desktop proof exists

## Verification Required

### `SURF-009A`

- code contract proves required engine boundaries
- code contract proves required agent anchors
- UI surface marker exposes `SURF-009`
- tests prove hidden engines remain hidden engines
- tests prove open agent dependencies are explicit and block fake green
- live proof shows the canonical product surface marker and no fake Desktop or live-agent claim

### `SURF-009B`

- live proof must show each surface with its agent action path or truthful open-agent blocker
- each required live agent must pass `Agent Reality Gate`
- no planning contract may be used as live agent proof

## Current Truth

`SURF-009A` is closed as the contract and visible shell marker bridge.

The Studio bridge now also declares Studio contract anchors from the completed Studio rulebook, but those anchors are planning-contract-only and do not prove Desktop behavior.

`SURF-009B` remains open because most surface agents remain release-blockers and have not passed `Agent Reality Gate`.

## Dependency Split

The old single-task interpretation created a canonical dependency cycle:

- `SLICE-001` depended on `SURF-009`
- `SKEL-001` depends on `SLICE-004`
- `SURF-009` was blocked from trueGreen by `SKEL-001` and other live agent runtime dependencies

The split resolves the cycle:

- `SLICE-001` now depends on `SURF-009A`
- `SURF-009A` is trueGreen as the screen/engine/contract bridge
- `SURF-009B` depends on the live agent chain and does not block `SLICE-001`

Open `SURF-009B` live agent dependencies:

- `SKEL-001`
- `VSKEL-001`
- `BLD-AGT-001`
- `VBUILD-001`
- `MUT-001`
- `HIST-AGT-001`
- `SHARE-AGT-001`
- `GROW-AGT-001`
- `GROW-AGT-002`
- `GROW-MEASURE-001`
- `VER-AGT-001`
- `REL-AGT-001`
- `STD-HANDOFF-AGT-001`

No additional rail marker, shell attribute, or planning contract can close `SURF-009B`.

Only live agent implementation plus `Agent Reality Gate` proof can close `SURF-009B`.
