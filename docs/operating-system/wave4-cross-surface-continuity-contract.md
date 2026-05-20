# Wave 4 Cross-Surface Continuity Contract

## Purpose

`Minimum Believable Nexus` cannot close if build, proof, release, deployment feedback, timeline, and continuation are only truthful in isolation.

Wave 4 therefore requires one explicit cross-surface continuity contract that keeps the user inside one connected product loop.

## Canonical Truth

The continuity contract must make all of the following visible and explainable:

1. `Execution` shows live build progression and deployment-state truth.
2. `Proof` keeps the same product artifact visible and carries release evidence forward.
3. deployment/release truth does not disappear when the user leaves `Execution` or `Proof`.
4. `Next Task` opens only from the approved artifact / release state and stays bounded to product-connected continuation.
5. `Timeline` preserves the visible story of the same loop instead of restarting interpretation.
6. refresh, route restore, and revisit do not silently change the active product truth.

## Canonical Surface Chain

The required visible chain is:

- `execution:build`
- `proof:artifact`
- `proof:release-evidence`
- `execution:deployment-feedback`
- `next-task:continuation`
- `timeline:timeline`

This chain is not a routing suggestion.
It is the minimum believable loop-continuity path the product must be able to explain.

## Required Contract Fields

The governing model must expose:

- `continuityFamily`
- `status`
- `statusLabel`
- `visibleContinuityRule`
- `routeSequence`
- `explainablePath`
- `continuityChecks`
- `continuitySteps`
- `restoreRule`

Each continuity step must carry:

- `surfaceId`
- `routeKey`
- `title`
- `status`
- `visibleAnchor`
- `continuityRule`

## Continuity Rules

- the same approved artifact must remain the user-facing anchor between `Execution`, `Proof`, `Next Task`, and `Timeline`
- release evidence must survive proof revisit and route restore
- deployment feedback must survive refresh and handoff back into release truth
- continuation must open from the approved artifact / release state, not from an unrelated planner suggestion
- timeline must preserve the visible loop story instead of becoming a detached log

## Visible Product Requirement

This contract is only truthful if it appears on a real Nexus route.

Wave 4 uses `Timeline` as the canonical continuity surface because it is the place where the user should understand how the loop stayed connected end-to-end.

## Governing Implementation Anchors

- `src/core/cross-surface-continuity-contract.js`
- `src/core/context-builder.js`
- `web/nexus-ui/adapters/timeline-adapter.js`
- `web/nexus-ui/screens/TimelineHistoryScreen.js`
- `web/app.js`
