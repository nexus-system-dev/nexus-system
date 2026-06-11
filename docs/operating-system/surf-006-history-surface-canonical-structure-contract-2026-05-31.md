# SURF-006 — History Surface Canonical Structure Contract

Date: `2026-05-31`
Status: `canonical structure contract`

## Surface Law

`History surface = product continuity and change memory workspace, not a technical timeline, debug event stream, proof dashboard, or orchestration log.`

The user-facing History surface must answer:

```txt
What changed, what is safe to return to, what can be restored, and how do I continue building without losing context?
```

It may preserve the old timeline/event engines internally, but the visible surface must not expose those engines as the product.

## Required Regions

- `history-current-state-anchor` — shows the current remembered product state and safe point.
- `history-change-log` — shows meaningful product changes, not raw events.
- `history-restore-checkpoints` — shows return points / snapshots that can later become restore actions.
- `history-continuity-thread` — explains how the project context continues from previous work into the current workspace.
- `history-version-snapshots` — summarizes saved product versions or fallback snapshot truth.
- `history-return-to-build` — gives a clear path back to the live Build workspace.

## Forbidden Shapes

- `technical-timeline-route`
- `debug-event-stream`
- `proof-dashboard-history`
- `orchestration-log`
- `qa-placeholder-history`
- `history-without-restore-anchor`
- `wide-legacy-sidebar`

## Preserve / Remove / Build

Preserve:
- project event history engine
- snapshot / rollback / continuity engine
- artifact truth engine
- cross-surface continuity contract
- route restore compatibility for `/timeline`

Remove from the active visible surface:
- stepper-first history
- QA nav
- wide legacy sidebar
- proof/artifact dashboard as the main History shape
- raw timeline/runtime/proof/orchestration copy

Build:
- compact canonical right rail
- product memory hero
- current state anchor
- meaningful change list
- restore checkpoint cards
- continuity thread
- snapshot summary
- return-to-build action

## Done When

- `/timeline` renders `data-history-surface-contract="SURF-006"`.
- `/timeline` renders `data-surface-purpose="product-continuity-and-change-memory-workspace"`.
- `/timeline` renders all required regions.
- `/timeline` uses the canonical compact right rail with History active.
- `/timeline` does not render the legacy wide sidebar, QA nav, or stepper.
- Visible copy contains no internal provider/runtime/orchestration/debug labels.
- Route restore returns to the History surface, not a fallback.
