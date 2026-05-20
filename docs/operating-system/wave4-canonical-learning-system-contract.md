# Wave 4 Canonical Learning System Contract

## Purpose

Nexus already contains real feedback, memory, approval, and cross-project pattern primitives.

`W4-LEARN-001` closes only when those primitives are brought under one canonical learning-system contract
that truthfully separates:

- project memory
- user preference memory
- system learning

and makes their later decision impact explicit.

## Canonical Truth

The learning system contract must define all of the following:

1. which learning inputs are actually stored now
2. which memory layer owns each kind of truth
3. which decision surfaces are already affected now
4. which decision surfaces are only partial or next
5. which continuity rules prevent silent truth corruption
6. which generation integration rules later implementation must honor
7. which prohibitions stop Nexus from pretending that summaries are learning

## Required Learning Inputs

The governing contract must cover these input families:

- onboarding
- execution
- proof
- release
- deployment
- continuation
- reruns
- approvals
- failures
- user edits
- runtime/package outcomes
- generation outcomes
- cross-project patterns

## Required Memory Layers

The governing contract must expose three layers:

1. `project memory`
2. `user preference memory`
3. `system learning`

Each layer must expose:

- scope
- stored inputs
- current decision impact
- continuity rule
- explicit status such as `live`, `partial`, or `next`

## Required Decision Impacts

The governing contract must track these impact families:

- generation quality
- onboarding refinement
- runtime decisions
- bootstrap quality
- continuation quality
- release decisions
- next-task selection
- class-specific behavior

The contract may only call an impact `live` if Nexus already changes later decisions truthfully.

## Continuity Rules

- learning state may not silently reset across restore, revisit, rerun, or route transitions
- project memory must stay attached to the same project identity
- user preference memory may not silently overwrite approved project truth
- system learning may not mutate active project truth without visible explanation

## Generation Integration Rules

- generation must later consume learned class signals, failure signals, and outcome patterns from this contract
- runtime and release decisions may not claim learning-driven improvement until the visible product proves it
- cross-project patterns may remain visible before they become decision-changing, but they may not be overstated

## Explicit Prohibitions

- no hidden AI intuition without canonical trace
- no feedback summary treated as proof of learning
- no cross-project pattern may silently mutate active project truth
- no blur between project memory and system learning

## Visible Product Requirement

This task is architecture, but it still requires visible product proof.

Wave 4 uses `Timeline` as the canonical surface for this contract because:

- Timeline already carries cross-surface continuity
- Timeline already carries the live verification matrix
- Timeline is the right place to expose one explainable learning-system contract for the loop

The visible surface must show:

- the canonical learning system headline
- the three memory layers
- current input coverage
- current decision-impact status
- continuity and prohibition rules

## Governing Implementation Anchors

- `src/core/canonical-learning-system-contract.js`
- `src/core/context-builder.js`
- `web/nexus-ui/adapters/timeline-adapter.js`
- `web/nexus-ui/screens/TimelineHistoryScreen.js`
- `web/app.js`
