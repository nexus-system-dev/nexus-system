# Wave 4 Post-Closure Learning And Intake Continuation Lane

## Purpose

After the active Wave 4 core closes through `W4-MBN-020`,
Nexus must not leave learning and intake intelligence as disconnected future notes.

This continuation lane exists so both systems enter canonical execution structure immediately after Wave 4 core closure,
without violating the core Wave 4 task order and without starting premature implementation.

This is a prepared continuation lane.
It is not part of the active `W4-MBN-*` core order.

## Canonical Boundary

This lane may be prepared immediately after `W4-MBN-020` closes truthfully.

It may not begin implementation while the active Wave 4 core order still points at:
- `W4-MBN-021`
- `W4-MBN-022`
- or any earlier unresolved core task

Its role is to preserve canonical continuity between:
- Wave 4 core contracts
- future learning-system execution
- future adaptive intake execution

Activation truth on `2026-05-20`:
- `W4-MBN-021` closed truthfully
- `W4-MBN-022` closed truthfully
- no unresolved `W4-MBN-*` task remains ahead of this lane
- the lane may now be selected canonically without violating the core Wave 4 order

## Lane Ownership

- lane id: `post-wave4-learning-and-intake-continuation`
- mode: `prepared-not-started`
- owner: `post-Wave-4 continuation`
- canonical dependency boundary:
  - all active Wave 4 core tasks must remain higher priority than this lane until the canonical ledger selects it

## Lane Mission

Prepare the next Nexus execution structure so that:

1. learning becomes a real engine capability rather than optional polish
2. adaptive intake becomes a bounded, class-aware product system rather than free-form chat
3. both systems stay connected to generation, runtime, release, deployment, and continuation truth
4. later implementation is deterministic, continuity-safe, and visibly verifiable

## Prepared Tasks

### W4-LEARN-001 — Define canonical learning system contract

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `architecture`
- status: `prepared-not-started`
- depends_on:
  - `W4-MBN-020`
  - `W4-MBN-019`
  - `docs/operating-system/wave3-onboarding-intelligence-planning-track.md`
- mission:
  - define one canonical learning-system contract that separates project memory, user preference, and system learning, and connects them back into real Nexus decisions
- learning inputs that must be covered:
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
- required decision impact:
  - generation quality
  - onboarding refinement
  - runtime decisions
  - bootstrap quality
  - continuation quality
  - release decisions
  - next-task selection
  - class-specific behavior
- pass/fail truth:
  - pass if one canonical learning contract defines:
    - stored inputs
    - durable memory layers
    - decision-changing outputs
    - separation of project memory / user preference / system learning
    - class-aware and cross-project learning boundaries
  - fail if learning remains only:
    - UI summary
    - per-project memory blur
    - feedback text with no later decision impact
- live verification requirement:
  - later implementation must visibly prove that learning changes real Nexus behavior on a live route
  - at minimum, later reruns must show one visible improvement in:
    - generation framing
    - continuation quality
    - runtime/release decision quality
- continuity rules:
  - learning state may not silently reset across restore/revisit
  - learned project truth must remain attached to project identity
  - system-level learning may not overwrite per-project truth silently
- generation integration rules:
  - generation must be able to consume learned class signals, failure signals, and outcome patterns from the canonical learning system
- explicit prohibitions:
  - no hidden “AI intuition” without canonical trace
  - no system-level learning that mutates active project truth without visible explanation
  - no treating feedback summaries as proof of learning
- visible product impact expectations:
  - smarter generation direction
  - reduced drift
  - better continuation decisions
  - better runtime/release choices where canonically allowed

### W4-INTAKE-001 — Define adaptive onboarding agent contract

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `architecture`
- status: `prepared-not-started`
- depends_on:
  - `W4-MBN-020`
  - `W4-LEARN-001`
  - `docs/operating-system/wave3-onboarding-intelligence-planning-track.md`
- mission:
  - define one canonical adaptive intake/onboarding agent that refines user understanding per product class and emits a bounded handoff into generation
- required agent behavior:
  - ask different questions per product class
  - detect weak or generic answers
  - refine the user when clarity is insufficient
  - know when enough information exists
  - produce a canonical handoff into generation
  - remain bounded and product-connected
  - never become free-form AI chaos
- pass/fail truth:
  - pass if one canonical intake-agent contract defines:
    - question-decision orchestration
    - class-aware branching
    - weak-answer detection
    - sufficiency logic
    - bounded handoff into generation
    - explicit prohibitions against free-form chat drift
  - fail if the agent is only:
    - nicer copy on top of the same fixed intake
    - generic conversation without canonical handoff truth
    - autonomous chat without product grounding
- live verification requirement:
  - later implementation must visibly prove on live Nexus routes that:
    - different classes receive different questioning paths
    - weak answers trigger clarification
    - the agent stops only when sufficient information exists
    - generation receives a stronger visible handoff
- continuity rules:
  - intake state must survive restore/revisit
  - the approved intake handoff must remain attached to the same project through Understanding and Generation
  - adaptive questioning may not silently rewrite already-approved project truth
- generation integration rules:
  - the agent must emit one canonical handoff payload for generation, not parallel informal summaries
  - later generation requests must reuse intake truth rather than reconstruct weaker generic intent downstream
- explicit prohibitions:
  - no free-form general assistant behavior
  - no replacing product rules with open-ended chat
  - no bypassing class resolution or sufficiency gates
  - no advancing into generation without canonical intake handoff
- visible product impact expectations:
  - smarter onboarding behavior
  - different questioning paths
  - stronger generation focus
  - reduced drift

## Canonical Relationship To Active Wave 4 Core

- this lane is prepared because `W4-MBN-020` is closed
- this lane does not replace `W4-MBN-021`
- this lane does not replace `W4-MBN-022`
- this lane may not preempt the active Wave 4 core order

## Write-Back Rule

When this lane is added to canonical state:

- record it as `prepared-not-started`
- keep `W4-MBN-021` as the next active core task
- do not mark either prepared task as selected for implementation
- do not mark either prepared task as `trueGreen`
