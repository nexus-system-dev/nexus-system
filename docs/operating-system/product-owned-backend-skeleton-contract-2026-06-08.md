# Product-Owned Backend Skeleton Contract

Status: canonical release-blocker contract for `PRODUCT-BACKEND-SKEL-002`.

## Purpose

When Nexus creates a product skeleton for a user, the skeleton must include the product's own backend skeleton from the start.

This is not the Nexus backend.

This is not only a Nexus-internal product-domain model.

This is the generated product's own backend scaffold, tied to the generated frontend scaffold, so both can grow together as the user changes the product.

## Core Law

When the first skeleton appears, Nexus must be able to show that it created:

1. a frontend skeleton for the generated product
2. a backend skeleton for the generated product
3. a data model or schema owned by that generated product
4. actions or operations behind the UI
5. local/mock persistence owned by that generated product
6. a boundary that could become an API or service boundary
7. a shared artifact identity tying frontend and backend together
8. a growth path where future Build changes update both sides

## Required Behavior

If the user asks for a change after the skeleton appears:

1. visual changes must update the frontend skeleton
2. data and workflow changes must update the backend skeleton
3. UI actions must call generated product operations, not only Nexus preview state
4. mutation history must record whether the frontend, backend, or both changed
5. refresh/restore must preserve the frontend/backend pair
6. Nexus must not claim that only the preview changed if the backend contract also needed to change

## Product Class Requirements

Mobile app:
- app screens and navigation
- app-owned state model
- app-owned operations for create/update/delete
- app-local/mock persistence

Landing page:
- page and form
- lead model
- submit/validate/save operation
- local/mock lead storage

Internal tool:
- workspace screen
- record model
- create/update/status/filter operations
- local/mock persistence

Commerce:
- product/cart/order models
- cart and order draft operations
- payment boundary without fake real payment

Game:
- playable loop
- game state model
- score/rules/progression operations

Software/tool:
- tool UI
- input/action/output model
- operation result state

## Non-Goals

This task does not require production hosting, real external providers, real payments, App Store publishing, or real customer data.

This task does require a generated product-owned backend scaffold, not just Nexus project truth.

## Closure Boundary

`PRODUCT-BACKEND-SKEL-001` remains closed only for Nexus-internal generated product-domain truth.

`PRODUCT-BACKEND-SKEL-002` owns the higher bar: a product-owned backend skeleton that is generated with the first frontend skeleton and grows with future product changes.

## Not TrueGreen

This task is not trueGreen if:

1. the backend exists only inside Nexus project state
2. the backend is only described in text
3. the frontend skeleton appears without a product-owned backend scaffold
4. Build changes update only the visible preview when data/workflow/backend truth should also change
5. refresh restores a preview but not the frontend/backend artifact pair
6. Nexus claims a healthy skeleton while the generated product has no own backend scaffold
