# SURF-007 — Share Surface Canonical Structure Contract

Date: `2026-05-31`
Status: `canonical structure contract`

## Surface Law

`Share surface = experience-oriented review/demo workspace, not permissions admin, generic social sharing, QA fallback, or a fabricated public link.`

The user-facing Share surface must answer:

```txt
What product experience can I safely show, who is it for, what is excluded, and how do I return to building or release context?
```

It may preserve release, artifact, review, and collaboration engines internally, but the visible surface must only expose the product demo/review boundary that is true.

## Required Regions

- `share-experience-preview` — shows the product experience that can be reviewed or demonstrated.
- `share-audience-access-boundary` — states who the demo/review is for and the access mode.
- `share-review-demo-link` — shows the real review/demo link readiness without inventing one.
- `share-copy-open-actions` — exposes copy/open actions only when a real link exists.
- `share-privacy-scope` — explains what does not leave Nexus.
- `share-return-to-build` — gives a clear path back to Build, Release, or History context.

## Forbidden Shapes

- `share-as-permissions-admin`
- `fake-public-share-link`
- `generic-social-sharing`
- `qa-placeholder-share`
- `internal-debug-share-state`
- `share-without-release-context`
- `wide-legacy-sidebar`

## Preserve / Remove / Build

Preserve:
- release readiness and artifact truth
- review/demo link truth when it exists
- project continuity and return-to-build context
- canonical compact right rail

Remove from the active visible surface:
- legacy wide sidebar
- QA placeholder navigation
- permissions/admin framing as the main product shape
- generic social sharing affordances
- provider/runtime/orchestration/debug language
- fabricated share links

Build:
- compact canonical right rail with Share active
- experience preview hero
- demo/review link readiness gate
- audience/access boundary
- copy/open action region
- privacy scope region
- return-to-build/release/history actions

## Done When

- `/share` renders `data-share-surface-contract="SURF-007"`.
- `/share` renders `data-surface-purpose="experience-oriented-review-demo-workspace"`.
- `/share` renders all required regions.
- `/share` uses the canonical compact right rail with Share active.
- The Share rail item exists in the same order and count as every canonical product surface.
- `/share` does not render the legacy wide sidebar, QA nav, permissions/admin framing, internal labels, or a fabricated link.
- Clicking the canonical rail from Share can move to Growth and Release while preserving active route state.
