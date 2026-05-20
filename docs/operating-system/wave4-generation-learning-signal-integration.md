# W4-GEN-001 — Generation Learning Signal Integration

## Canonical Task

- task id: `W4-GEN-001`
- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `trueGreen`
- closed at: `2026-05-20`

## Mission

Connect stored learning signals back into real Nexus generation decisions so generation stops being only class-aware and starts becoming learning-aware in visible product surfaces.

## Closed Truth

`W4-GEN-001` closes only because Nexus now does all of the following together:

1. consumes stored learning signals inside generation direction
2. changes generation framing and primary action because of those signals
3. exposes the changed generation direction visibly on real Nexus surfaces
4. proves that `Proof` now carries the learned generation shift instead of only repeating the original onboarding intent

## Governing Implementation

- `src/core/learning-aware-generation-decision.js`
- `src/core/context-builder.js`
- `src/core/canonical-learning-system-contract.js`
- `web/nexus-ui/adapters/understanding-adapter.js`
- `web/nexus-ui/screens/UnderstandingSummaryScreen.js`
- `web/nexus-ui/adapters/proof-adapter.js`
- `web/app.js`

## Visible Product Truth

The generation path is no longer only static class routing.

It now visibly carries:

- `learning-aware-generation-contract`
- `repair-before-expand` generation strategy when prior failure/friction signals demand repair
- learned focus areas that change what Nexus tries to strengthen before expanding
- a learned proof requirement that shows what the next proof must validate before broader expansion

This visible truth appears on:

- `Understanding`
- `Proof`

## Pass / Fail Truth

### Pass

- generation direction changes because of stored learning signals
- the changed direction is visible on real product surfaces
- the proof route exposes the learned generation shift as proof criteria rather than hiding it in internal state

### Fail

- generation remains only class-aware
- learning affects only `Timeline` / `Next Task`
- proof focus does not change visibly
- the app only shows contract cards without changed generation behavior

## Live Verification Requirement

The task may be `trueGreen` only if visible product proof shows:

- `Understanding` exposes a live generation-direction card driven by learning signals
- `Proof` exposes a learned generation shift and learned proof requirement
- QA preview data no longer falls back to generic proof framing for the same generation path

## Continuity Rule

Learned generation direction must survive:

- route changes
- reruns
- revisit
- restore

It may not silently reset to static class defaults once the project already has stored learning signals.
