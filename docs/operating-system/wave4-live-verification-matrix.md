# Wave 4 Live Verification Matrix

## Purpose

`Minimum Believable Nexus` cannot close Wave 4 with ad hoc verification done differently by each agent.

Wave 4 therefore requires one canonical live verification matrix that tells Nexus exactly what must be checked, where it must be checked, and what visible truth closes each major capability.

## Canonical Truth

The matrix must make all of the following deterministic:

1. every major Wave 4 lane has one visible verification route
2. every lane has one visible anchor the user can actually see
3. every lane exposes pass/fail truth, not only implementation notes
4. restore and continuity checks are included wherever user-facing truth could silently break
5. stronger preview paths are declared instead of leaving reruns to agent interpretation

## Canonical Matrix Scope

The governing matrix must cover these Wave 4 lane families:

- `product-understanding-and-class-resolution`
- `automatic-product-bootstrap`
- `live-build-surfaces`
- `class-aware-product-generation`
- `local-workspace-electron-shell`
- `runtime-packaging-resolver`
- `releaseable-output`
- `continuation-growth-loop`
- `deployment-release-path`
- `live-orchestration-continuity`

This is the minimum believable verification scope for Wave 4.

## Required Matrix Fields

The governing model must expose:

- `matrixFamily`
- `status`
- `statusLabel`
- `matrixRule`
- `strongerPreviewRule`
- `restoreRule`
- `verificationLanes`
- `summary`

Each verification lane must expose:

- `laneId`
- `title`
- `routeKey`
- `visibleAnchor`
- `verificationFocus`
- `passCriteria`
- `restoreChecks`
- `strongerPreviewPath`

## Verification Rules

- no major capability may rely only on tests, proofs, logs, or contract text
- every capability must declare the route where product truth becomes visible
- every capability must declare the exact visible anchor that later reruns should look for
- restore and revisit checks are mandatory wherever route changes or handoffs can weaken truth
- stronger preview paths must be preferred over weak fallback surfaces when they exist

## Visible Product Requirement

This matrix is only truthful if it appears on a real Nexus route.

Wave 4 uses `Timeline` as the canonical matrix surface because it already carries cross-surface continuity and is the right place to expose the full rerun discipline for the loop.

## Governing Implementation Anchors

- `src/core/wave4-live-verification-matrix.js`
- `src/core/context-builder.js`
- `web/nexus-ui/adapters/timeline-adapter.js`
- `web/nexus-ui/screens/TimelineHistoryScreen.js`
- `web/app.js`
