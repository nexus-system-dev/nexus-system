# Home Idea Handoff Contract — SLICE-002

Date: 2026-06-03
Status: canonical implementation contract
Task: SLICE-002 — Entry to idea handoff on Home

## Purpose

SLICE-002 closes the Home entry handoff from a user deciding to start a new product idea into the Project Discovery Agent surface.

Home is not the agent brain and not the build result. Home is the momentum gateway that sends a new idea into the discovery conversation.

## Preserved Engine Truth

- Home remains `SURF-002`, a momentum gateway.
- The Project Discovery Agent remains the owner of understanding the idea.
- The onboarding intake engine remains the hidden persistence/session engine.
- Existing project continuation remains separate from new-idea entry.

## Removed Visible Behavior

- Home must not behave like a dashboard-first project manager.
- Home must not claim that a skeleton, build, or downstream agent result already exists.
- Home must not present the old intake engine as the visible truth owner.

## Built Behavior

- The Home hero entry region is marked with `data-slice-contract="SLICE-002"`.
- The Home new-idea button is marked as a handoff action to `create`.
- The handoff names the responsible agent: `project-discovery-agent`.
- The handoff names the preserved hidden engine: `onboarding-intake-engine`.
- The Create surface is marked with the handoff source when entered from Home.

## Boundary

The proof boundary is:

`handoff-only-not-agent-response`

This task does not close:

- `SLICE-003`
- `SLICE-004`
- `SKEL-001`
- `VSKEL-001`
- `BLD-AGT-001`

## Done Criteria

- Home exposes a clear new-product-idea action.
- The action routes to the Create discovery surface.
- The visible DOM carries the SLICE-002 handoff markers.
- Tests prove Home delegates to the Project Discovery Agent and does not claim skeleton/build closure.
- Live browser verification proves the handoff survives the click from Home to Create.
