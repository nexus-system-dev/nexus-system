# Wave 4 Adaptive Onboarding Agent Contract

## Purpose

Nexus already contains real onboarding intelligence primitives:

- class-aware questioning
- ambiguity clarification
- sufficiency evaluation
- onboarding-to-state handoff

`W4-INTAKE-001` closes only when those primitives are brought under one canonical adaptive intake contract
that explains how Nexus asks, clarifies, stops, and hands off without turning onboarding into free-form chat.

## Canonical Truth

The adaptive onboarding agent contract must define all of the following:

1. how question selection stays bounded and class-aware
2. how weak or generic answers are handled truthfully
3. how clarity refinement is triggered
4. how sufficiency gates stop onboarding only when enough understanding exists
5. how one canonical handoff payload enters downstream generation
6. which continuity rules protect approved intake truth
7. which prohibitions stop onboarding from drifting into general chat behavior

## Required Agent Behaviors

The governing contract must expose these behavior families:

- `class-aware branching`
- `weak / generic answer detection`
- `clarity refinement`
- `sufficiency gate`
- `bounded handoff into generation`
- `bounded non-chat discipline`

Each behavior must expose:

- current status such as `live`, `partial`, or `next`
- current effect
- next proof requirement

The contract may only call a behavior `live` if the current product already proves it truthfully.

## Continuity Rules

- intake state may not silently reset across restore, revisit, or project resume
- approved intake truth may not be rewritten silently once it is attached to the same project
- the same intake handoff must remain attached through Understanding and Generation

## Generation Integration Rules

- the agent must emit one canonical handoff payload for generation, not parallel informal summaries
- generation must reuse the intake truth that was actually collected instead of reconstructing a weaker generic brief downstream
- later generation improvements may not claim stronger intake truth unless the onboarding surface proves it visibly

## Explicit Prohibitions

- no free-form general assistant behavior
- no open-ended chat drift that bypasses class resolution or sufficiency gates
- no advancing into generation without canonical intake handoff truth
- no pretending weak-answer detection is fully solved before the visible product proves it

## Visible Product Requirement

This task is architecture, but it still requires visible product proof.

Wave 4 uses `Onboarding` as the canonical surface for this contract because:

- the user must be able to see that intake is bounded and adaptive
- the existing question flow already exposes the active refinement path
- the contract must be visible where question quality and handoff quality are formed

The visible surface must show:

- the adaptive onboarding contract headline
- current class path
- handoff and readiness truth
- current behavior statuses
- explicit prohibitions

## Governing Implementation Anchors

- `src/core/adaptive-onboarding-agent-contract.js`
- `web/shared/adaptive-onboarding-agent-contract.js`
- `src/core/context-builder.js`
- `web/nexus-ui/adapters/onboarding-adapter.js`
- `web/nexus-ui/screens/SmartOnboardingScreen.js`
- `web/app.js`
