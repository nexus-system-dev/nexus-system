# Runtime Skeleton Interactive Standard

תאריך: `2026-06-04`
סטטוס: `trueGreen implementation contract`
משימה: `RUNTIME-SKEL-001 — Interactive product runtime skeleton standard`

## Closure Evidence

`RUNTIME-SKEL-001` closed `trueGreen` on `2026-06-04`.

- `web/nexus-ui/screens/LoopCoreScreen.js` renders live-state markers, mobile screen navigation, runtime score/state markers, and product-domain operation controls for mobile app, landing page, internal tool, game, commerce, and tool shells.
- `web/app.js` handles `data-runtime-screen-nav` and `data-product-domain-operation` clicks by updating visible runtime state, active mobile screen, interaction count, last operation, score/list state where relevant.
- tests passed: `node --test --test-name-pattern 'RUNTIME-SKEL-001|SLICE-005|W4-FIX-007' test/loop-core-screen-render.test.js`.
- tests passed: `node --test test/product-domain-skeleton.test.js`.
- live mobile proof: `/private/tmp/nexus-runtime-skel-mobile-interaction.png`.
- live internal-tool proof: `/private/tmp/nexus-runtime-skel-internal-interaction.png`.

Closure boundary:

This closes first simulated runtime interaction quality only. It does not close Build agent message routing, canonical Build mutation history, release/export, production backend deployment, real providers, payments, publishing, or App Store builds.

## Purpose

Nexus must not treat a visual frame, static mockup, descriptive outline, or planning card as a real first product skeleton.

The first Build output is truthful only when it is a product-type-appropriate simulated runtime shell: the user can interact with it and see product-specific state, screen, or workflow changes.

## Source Insight

The live mobile Build skeleton proved that a phone frame can appear without feeling like an app running in a simulator.

This contract raises the bar for every product class:
- not "show a phone frame"
- not "show a page card"
- not "show a dashboard-looking drawing"
- instead: "show a simulated product that behaves inside the correct frame"

## Canonical Rule

`runtime skeleton` means:
- product-type-specific shell
- visible interaction
- local state
- screen or workflow change after user action
- truthful boundary that this is simulated and not production deployment

`runtime skeleton` does not mean:
- product outline
- visual skeleton only
- static screenshot-like card
- QA preview
- internal diagnostic surface
- production app, external publish, store deployment, payment, or provider connection

## Product-Class Runtime Contracts

### `mobile-app`
- device-like simulator frame
- at least two app screens
- tappable navigation
- buttons that change visible state
- list or form mutation when relevant
- visible app header, tab bar, or navigation stack
- restore returns to the same simulator or starting app state
- clear boundary: simulated app, not App Store build

### `landing-page`
- live page preview
- CTA behavior
- form or signup interaction when relevant
- validation or confirmation state
- section navigation or responsive preview state
- clear boundary: not published externally

### `internal-tool`
- table, list, dashboard, board, or form with sample data
- add, edit, assign, status-change, or reminder interaction
- row selection or detail panel
- visible count, summary, filter, or workflow state after action
- restore preserves the same shell and starting data truth

### `game`
- playable or controllable shell
- start, pause, restart, or equivalent action
- input response
- score, timer, lives, progress, or HUD state
- animation loop, state tick, or event-driven scene update where relevant

### `software-tool`
- real controls
- input/output transformation
- modes, tabs, settings, reset, or undo where relevant
- visible state after user action
- export/share/publish actions are blocked truthfully if unavailable

### `commerce-product-site`
- product listing or product detail flow
- variant or quantity selection
- add-to-cart behavior
- cart drawer, cart summary, or equivalent state
- checkout, payment, and publishing blocked truthfully unless implemented

## Placement Rule

`SLICE-005` remains closed as the first proof that Build can route to a product-type runtime-looking surface.

`RUNTIME-SKEL-001` owns the stronger interactive runtime bar. It must close before Nexus claims the first Build output feels like a real simulated product and before downstream build-continuation tasks rely on the skeleton as a usable runtime.

## Dependencies

Depends on:
- `SLICE-005`
- `VSKEL-001`
- `ENG-005`

Blocks:
- `BLD-AGT-001`
- `W4-UPGRADE-002`
- any task that claims first-artifact quality from a usable runtime shell

## Acceptance Criteria

1. A mobile app idea opens a simulator-like shell with navigation and local state changes.
2. A landing page idea opens a live page preview with CTA/form behavior.
3. An internal tool idea opens a working table/form/dashboard shell with mutable sample state.
4. A game idea opens a controllable game shell.
5. A software/tool idea opens a runnable control surface.
6. A commerce/product idea opens a product/cart flow with checkout/payment blocked truthfully.
7. Build clearly distinguishes product truth, visual skeleton trace, runtime skeleton, and future production implementation.
8. Refresh/restore returns to the same runtime skeleton or same starting simulator state.
9. Normal users do not see fake QA, Preview, or internal text.
10. Tests and live browser verification prove interaction, not only rendering.

## Non-Goals

- no full production app generation
- no App Store or Play Store publishing
- no external deployment
- no real payments
- no real WhatsApp/provider connection
- no replacement of Product Skeleton Agent or Visual Product Skeleton Agent
- no requirement to run native Xcode, Android Studio, or a device emulator inside Nexus

## Failure Mode If Omitted

Nexus can appear to understand products deeply but still fail the central promise: turning an idea into a first working build.

The user will see a polished picture of a product instead of a product-like runtime they can touch.
