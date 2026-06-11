# SLICE-001 — First Vertical Slice Execution Lane Contract

Date: `2026-06-03`

## Status

- canonical task: `SLICE-001`
- classification: `new shell task`
- closure scope: `execution-lane-contract-and-entry-proof`
- closure truth: can close only as the first-slice lane definition and entry proof

## Mission

Define the first end-to-end Nexus slice that proves the new shell is real.

The full canonical slice is:

1. user enters
2. user writes an idea
3. Nexus understands enough truth
4. Nexus asks only if needed
5. first skeleton appears
6. user changes direction through conversation
7. artifact updates
8. refresh preserves continuity

`SLICE-001` does not close all eight steps.

`SLICE-001` closes the lane and the allowed entry proof so later tasks can implement the chain in order without treating partial QA motion or preserved engines as live agent proof.

## Dependencies

- `SURF-002`
- `SURF-003`
- `SURF-009A`

`SLICE-001` must not depend on `SURF-009B`.

`SURF-009B` requires live surface agents that are produced later by the slice and agent chain.

## Preserve

Preserve these engines as hidden engines:

- `project-service-truth-engine`
- `onboarding-intake-engine`
- `artifact-generation-engine`
- `continuity-memory-refresh-engine`

These engines can provide state, persistence, summaries, artifact previews, and continuity support.

They may not become the visible product owner or agent decision owner.

## Remove

Remove from the active slice path:

- visible onboarding as a standalone product route
- visible loop as orchestration-first route
- backend completion as build authority
- QA motion proof as fake live-agent closure
- fallback copy as agent answer

## Build

Build and prove:

- canonical first-slice lane
- Home / Create / Build entry path
- explicit Project Discovery Agent handoff gate
- explicit downstream tasks for enough-truth, ask-if-needed, Product Skeleton Agent, Visual Skeleton Agent, Build Loop Agent, Visual Build Agent, Mutation, and continuity
- DOM proof marker for the current entry path without claiming full live-agent closure

## Current Executable Proof

The current code has a QA-only discovery-to-build motion path.

That path may prove:

- the user starts in the creation/front-door surface
- the flow can carry agent-envelope product truth into Build
- the Build surface can receive a first skeleton preview
- the visible route avoids returning to old orchestration-first screens

That path may not prove:

- `SKEL-001`
- `VSKEL-001`
- `BLD-AGT-001`
- `VBUILD-001`
- user-requested artifact mutation
- refresh continuity
- `SURF-009B`

## Verification Evidence

`2026-06-03` verification:

- `node --test test/first-vertical-slice-execution-lane-contract.test.js` passed `3/3`
- `node --test test/build-surface-motion-flow-contract.test.js test/first-vertical-slice-execution-lane-contract.test.js` passed `6/6`
- `node --test test/release-surface-canonical-structure-contract.test.js test/growth-surface-canonical-structure-contract.test.js test/history-surface-canonical-structure-contract.test.js test/share-surface-canonical-structure-contract.test.js test/studio-boundary-surface-contract.test.js test/nexus-sidebar-navigation-contract.test.js test/shell-to-engine-integration-contract.test.js test/first-vertical-slice-execution-lane-contract.test.js` passed `27/27`
- live browser verification on `127.0.0.1:4011/create?qa=1&qaReset=1&qaMotionFlow=discovery-to-build` reached `appScreen=loop`
- live browser verification showed `data-slice-contract="SLICE-001"` on the create entry state with `data-slice-stage="user-writes-idea"`
- live browser verification showed `data-slice-contract="SLICE-001"` on the Build workspace with `data-slice-stage="first-skeleton-appears"`
- both states used `data-slice-proof-boundary="entry-proof-not-live-agent-closure"`

## Live-Agent Boundary

The first vertical slice must not claim live downstream agent closure until each agent passes `Agent Reality Gate`.

Open downstream agent tasks include:

- `SKEL-001`
- `VSKEL-001`
- `BLD-AGT-001`
- `VBUILD-001`
- `MUT-001`
- `HIST-AGT-001`

`SLICE-001` only creates the execution lane that lets these tasks happen in the correct order.

## Done When

`SLICE-001` can close when:

- the canonical lane is documented
- the lane code contract exists
- the current entry proof is explicitly marked as `SLICE-001`
- the proof boundary says it is entry proof, not live-agent closure
- tests confirm dependencies point to `SURF-009A`, not `SURF-009B`
- tests confirm downstream live-agent tasks remain outside closure
- the implementation task map writes back the closure truth

## Not TrueGreen

`SLICE-001` is not trueGreen if:

- it claims the full eight-step slice is already complete
- it claims Product Skeleton Agent or Visual Build Agent is live
- it treats QA motion as live agent proof
- it lets backend completion replace agent-composed handoff
- it bypasses the ask-only-if-needed gate
- it claims refresh continuity without proving persisted state

## Next

After `SLICE-001`, the canonical next task is:

- `SLICE-002 — Entry to idea handoff on Home`
