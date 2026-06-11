# Generated Product Runtime Package Contract

Date: 2026-06-08

## Purpose

This contract defines the missing layer between Nexus internal skeleton truth and a standalone releasable product artifact.

When Nexus creates a product skeleton, the generated product must receive its own package/workspace identity. That package belongs to the generated product, not to the Nexus application runtime.

## Core Law

Nexus dependencies and generated product dependencies are separate.

Nexus may use its own dependencies to run the Nexus application. A generated product package must have its own dependency plan, package boundary, run command, preview target, local/mock persistence, frontend files, backend files, shared schema files, and mutation-growth path.

Nexus must not install generated-product dependencies into Nexus itself as a shortcut.

The package layer is not a visual-polish layer only. Dependencies must improve the generated product as a working product: behavior, domain operations, data handling, persistence, runtime quality, testing surface, preview/run capability, accessibility, performance where relevant, and design composition.

Installing dependencies is not closure. Closure requires those dependencies to be selected for a product reason, connected to product truth, used by the generated product package, and proven in a live or testable product surface.

## Required Boundary

The generated product runtime package must be tied to:

- project id
- runtime skeleton id
- product-domain skeleton id
- product-owned backend skeleton id
- artifact/build id
- selected skeleton direction where relevant

The package must define:

- artifact root
- frontend directory
- backend directory
- shared schema/model directory
- local/mock data directory
- tests directory
- run/preview directory
- package manager
- dependency plan
- lockfile strategy
- install status
- run command
- preview target
- restore identity
- mutation history

## Product Class Expectations

Mobile app packages must include app shell files, screen/navigation structure, local state, product backend/domain operations, simulator/preview target, and a clear boundary that this is not an App Store build.

Landing page packages must include page files, form handling, validation, local/mock lead storage, preview target, and a clear boundary that this is not a published site.

Internal tool packages must include workspace/table/list frontend files, records model, operations, filters/status updates, local/mock persistence, and preview target.

Commerce packages must include catalog/product frontend, cart/order draft model, mock checkout boundary, inventory/sample fulfillment state, and no real payments.

Game packages must include playable scene shell, game loop, score/player/rules state, input handling, and preview target.

Software/tool packages must include input/action/output frontend, operation engine, saved state/history, and preview target.

Editor/canvas packages must include canvas, toolbar, selected object state, undo/redo local history, and preview target.

Simulator packages must include controls, state, metrics/result output, scenario runner, and preview target.

## Dependency Plan

Each package dependency must state:

- dependency name
- version strategy
- owner
- reason
- product class fit
- required now or deferred
- risk level
- install boundary
- fallback if install fails

Dependencies may be proposed or staged before installation. Installation must not run arbitrary user-provided commands and must not write outside the generated product package.

## Product Improvement Gate

The package task may not close because a package file exists or dependencies were listed.

It may close only when the selected package/dependency plan measurably improves the generated product across relevant dimensions:

- product behavior
- UI composition and interaction quality
- domain operation wiring
- local/mock persistence
- input validation
- run/preview capability
- testability
- accessibility where relevant
- performance/runtime fit where relevant
- future Build mutation capacity

For each generated product class, Nexus must show why the chosen dependencies help that product become a stronger working product, not only a better-looking preview.

## Dependency Usage Proof

Every required dependency must have usage proof:

- where it is used in the generated package
- which product capability it powers
- which model, operation, screen, route, control, state transition, or persistence path it connects to
- how the product behaves if the dependency install or runtime fails

Unused dependencies, decorative-only dependencies, and dependencies disconnected from product truth do not count toward closure.

## Mutation Growth

Build mutations must grow package truth when needed.

Adding a field must update UI truth, schema truth, backend operation truth, local/mock persistence truth, and package mutation history.

Adding an action must update frontend control truth and backend operation truth.

Adding a screen must update frontend route/screen truth and state boundaries.

Failed package mutations must show failure and may not fake frontend-only success.

## Restore

Refresh and project reopen must restore:

- package id
- artifact root
- dependency plan
- install status
- run command
- preview target
- last package mutation
- frontend/backend package pairing

This truth must come from canonical project truth, not browser state or URL state.

## Non-Goals

This contract does not deploy the product.

This contract does not publish externally.

This contract does not connect WhatsApp, payments, CRM, email, App Store, Play Store, or production databases.

This contract does not claim production backend.

This contract does not replace standalone artifact verification or release gates.

## Ownership

`PRODUCT-BACKEND-SKEL-002` owns the product-owned backend skeleton.

`PRODUCT-RUNTIME-PACKAGE-001` owns generated product package/workspace and dependency truth.

`STANDALONE-ARTIFACT-001` owns standalone runnable/releasable artifact truth.

`VER-AGT-001` and `BUILD-TEST-001` own deeper verification.

`REL-AGT-001` and `BUILD-RELEASE-GATE-001` own release, provider, publish, payment, and deployment gates.
