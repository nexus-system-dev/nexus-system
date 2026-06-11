# Enough Truth Before Build Contract — SLICE-003

Date: 2026-06-03
Status: canonical implementation contract
Task: SLICE-003 — Enough-truth gate before build

## Purpose

SLICE-003 locks the gate between the Project Discovery Agent and the first build handoff.

Nexus may not open a first skeleton or Build/Loop state from a legacy intake completion, restored summary, local heuristic, or strong-looking text alone.

## Preserved Engine Truth

- The onboarding intake engine remains preserved for sessions, summaries, restore, and continuity.
- The Project Discovery Agent remains the authority for deciding whether there is enough product truth.
- The Product Skeleton Agent remains downstream and still open until `SKEL-001`.

## Removed Behavior

- No build handoff from legacy intake completion alone.
- No build handoff from a restored summary alone.
- No build handoff from local readiness heuristics alone.
- No visible first skeleton claim before the Project Discovery Agent has produced an agent-composed handoff.

## Built Behavior

The discovery state now exposes `enoughTruthGate`:

- `taskId: SLICE-003`
- `gate: enough-truth-before-build`
- `status: ready-for-build | blocked-awaiting-agent-response | needs-discovery`
- `buildAllowed: true | false`
- `authority: project-discovery-agent-decision`
- `preservedEngine: onboarding-intake-engine`
- `proofBoundary: agent-decision-only-not-skeleton-generation`

The Create surface exposes this gate as internal data attributes. The user still sees a clean conversation, not system labels.

## Required Signals For Build

Build may proceed only when all signals are true:

- active discovery session exists
- agent-composed transcript response exists
- canonical understanding is `ready-for-first-task`
- handoff to `product-skeleton-agent` is allowed
- hidden intake engine is not the agent brain

## Allowed Outcomes

- proceed to first skeleton
- ask one blocking question
- stay in discovery without a fake skeleton

## Boundary

This task does not generate the product skeleton.

Still open:

- `SLICE-004`
- `SKEL-001`
- `VSKEL-001`
- `BLD-AGT-001`

## Done Criteria

- The gate exists in code as a canonical contract.
- The Project Discovery Agent state exposes the gate.
- The build transition uses the gate.
- The Create surface carries internal proof markers for the gate.
- Tests prove weak input, strong local-only truth, and agent-approved truth behave differently.
- Browser verification proves the live Create route exposes the gate without showing a fake skeleton.
