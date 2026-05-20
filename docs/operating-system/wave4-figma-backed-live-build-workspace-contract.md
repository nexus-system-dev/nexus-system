# Wave 4 Figma-Backed Live-Build Workspace Contract

מטרת המסמך:
- לנעול את החוזה הקנוני של `W4-MBN-021`
- לחבר את `W4-MBN-005` ו־`W4-MBN-006` ל־design authority אחת
- למנוע מצב שבו build surfaces ממשיכים להשתנות אד הוק בלי חוזה מבני אחיד

## Contract Purpose

אחרי ש־Nexus כבר הגדירה:
- split workspace model
- build progression state machine
- class-aware evolution rules
- local workspace contract

המערכת חייבת גם `Figma-backed workspace contract`
שקובע איך ה־workspace החי נראה כמבנה מוצרי אחד,
לפני כל הרחבה מבנית נוספת של:
- build surfaces
- workspace hierarchy
- shell-level split behavior
- preview-centered regions

## Figma Artifact

The canonical Figma artifact for this task is:
- file: [Nexus Wave 4 MBN-021 Live Build Workspace Contract](https://www.figma.com/design/eKC3qzCYpgqIekEmyDc74o)
- page: `W4-MBN-021 Workspace Contract`
- primary board node: `1:3`

This artifact is the design authority for structural live-build workspace evolution in Wave 4 until a later task truthfully supersedes it.

## Governing Inputs

This contract is derived from:
- [wave4-split-workspace-live-build-surface-model.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-split-workspace-live-build-surface-model.md)
- [wave4-build-progression-state-machine.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-build-progression-state-machine.md)
- [wave4-local-workspace-contract.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-local-workspace-contract.md)
- [wave4-class-specific-surface-evolution-rules.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-class-specific-surface-evolution-rules.md)

## Canonical Workspace Shape

The approved workspace shape is:
- left orchestration rail
- dominant central build region
- right runtime / release rail
- top build progression strip
- lower continuity / restore rules section

The center build region must stay primary.
The side rails may explain or constrain the build,
but they may not visually replace the product surface itself.

## Region Responsibilities

### Orchestration Rail

Owns:
- mission
- current stage
- next move
- bounded context

Must remain:
- narrow
- explanatory
- non-dominant

### Build Region

Owns:
- the live product surface
- visible milestones
- class-aware preview framing
- primary visual product change

Must remain:
- dominant
- product-first
- visibly evolving

### Runtime / Release Rail

Owns:
- runtime family
- packaging path
- release path
- deployment feedback
- continuation anchor

Must remain:
- visible
- secondary to the build region
- tied to the same project identity

## Build Progression Integration

The Figma contract must visibly encode the canonical progression family:
- `class-locked`
- `skeleton-visible`
- `surface-evolving`
- `preview-reviewable`
- `release-path-visible`
- `continuation-ready`

The progression strip is part of the workspace itself,
not an external debug bar.

## Class-Aware Preview Families

The structural contract stays constant across classes,
while the center build surface adapts by class:
- `landing-page` -> browser-preview + web canvas
- `mobile-app` -> simulator-preview + device frame
- `internal-tool` -> workspace-preview + queue / ownership surface
- `saas` -> product-workspace-preview + workflow surface
- `game` -> playable-preview + scene surface
- `book` -> document-preview + outline surface

Additional classes may extend the mapping later,
but they must preserve the same workspace hierarchy unless a later Figma-backed task truthfully changes it.

## Continuity Rules

This contract must preserve:
- route-bound restore
- project identity persistence
- build progression attached to the same workspace
- continuation anchor survival
- separation between current browser-backed workspace truth and later desktop-shell truth

No structural workspace redesign may silently break:
- refresh
- reopen
- return to project
- transition back into execution

## Figma Auth Health Rule

For Figma-backed Wave 4 tasks,
authenticated access must be checked:
- at design-pass start
- before creating or updating the canonical file
- before final closure write-back

If Figma auth fails at any of those checkpoints,
the task must remain blocked rather than being marked `trueGreen`.

## Truth Boundary

`W4-MBN-021` truthfully claims:
- one canonical Figma-backed live-build workspace contract now exists
- structural build-surface evolution is no longer design-authority-free
- the contract preserves continuity and class-aware workspace behavior

`W4-MBN-021` does not claim:
- the desktop shell frame is fully designed
- the Electron wrapper exists
- the whole product has already been visually rebuilt against this contract

Those belong to `W4-MBN-022` and later implementation/verification work.

## Closure Rule

`W4-MBN-021` is `trueGreen` only when:
- a real Figma artifact exists
- it governs the live-build workspace structurally
- it is linked canonically back into Wave 4 state
- it does not release `W4-MBN-022` through guesswork

It is not `trueGreen` if:
- only markdown exists
- only code rules exist
- only a placeholder file exists
- the Figma artifact is missing or inaccessible at closure time
