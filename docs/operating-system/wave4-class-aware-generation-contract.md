# Wave 4 Class-Aware Generation Contract

מטרת המסמך:
- לנעול את החוזה הקנוני של `W4-MBN-007`
- להגדיר איך generation חייב להשתנות לפי `productClass`
- למנוע מצב שבו כל class עוברת דרך אותו flow גנרי

## Contract Purpose

`Minimum Believable Nexus` לא יכולה להסתפק ב־build shell אחיד.

אחרי ש־class ננעלת, ו־bootstrap + surface model קיימים,
Nexus חייבת להחזיק גם `class-aware generation contract` שמגדיר:
- איזה סוג mutation המנוע מייצר
- מה חייב להשתנות על המסך
- מה אסור להישאר גנרי
- איך generation נשארת מחוברת ל־restore / continuity

## Canonical Output

החוזה הקנוני חייב לייצר לכל `productClass`:
- `generationMode`
- `surfaceMutationModel`
- `visibleMutationTargets`
- `backendCouplingRules`
- `forbiddenGenericPatterns`
- `generationIntent`
- `continuityRules`

## Class Rules

### `landing-page`
- generation mode: `conversion-surface`
- surface mutation model: `section-sequence`
- visible mutation targets:
  - `headline`
  - `supporting-copy`
  - `trust-proof`
  - `single-cta`
- forbidden generic patterns:
  - `generic-dashboard-layout`
  - `multi-panel-admin-shell`
  - `multiple-primary-ctas`

### `mobile-app`
- generation mode: `mobile-flow`
- surface mutation model: `screen-sequence`
- visible mutation targets:
  - `first-screen`
  - `primary-action`
  - `navigation-direction`
  - `next-step continuity`
- forbidden generic patterns:
  - `stacked-desktop-panels`
  - `marketing-hero-as-main-screen`
  - `no-mobile-frame`

### `internal-tool`
- generation mode: `workspace-operations`
- surface mutation model: `queue-workspace`
- visible mutation targets:
  - `queue-panel`
  - `ownership-panel`
  - `next-action panel`
  - `service-level state`
- forbidden generic patterns:
  - `generic-marketing-shell`
  - `single-kpi-dashboard-only`
  - `no-actionable-queue`

### `commerce-ops`
- generation mode: `commerce-operations`
- surface mutation model: `operations-workspace`
- visible mutation targets:
  - `orders-panel`
  - `catalog-state`
  - `operations actions`
  - `commerce urgency`
- forbidden generic patterns:
  - `generic-admin-layout`
  - `static-catalog-copy`
  - `no-order-urgency-signal`

### `saas`
- generation mode: `product-workflow`
- surface mutation model: `workflow-sequence`
- visible mutation targets:
  - `app-shell`
  - `workflow-panel`
  - `primary action`
  - `state feedback`
- forbidden generic patterns:
  - `marketing-page-instead-of-product`
  - `generic-admin-panels`
  - `no-first-workflow`

### `game`
- generation mode: `playable-scene`
- surface mutation model: `scene-state`

### `book`
- generation mode: `narrative-outline`
- surface mutation model: `outline-sequence`

### `content-product`
- generation mode: `content-system`
- surface mutation model: `module-sequence`

## Governing Implementation

The governing implementation for this contract is:
- `src/core/class-aware-generation-contract.js`

The canonical write-through points are:
- `src/core/context-builder.js`
- `src/core/ai-design-service.js`
- `src/core/ai-design-request-schema.js`

## Truth Rules

`W4-MBN-007` is not truthful if:
- all classes still emit one generic generation flow
- generation intent is derived only from weak fallback text
- the request path does not carry class-aware generation metadata
- class differentiation exists only in planning text

`W4-MBN-007` is truthful when:
- one canonical generation contract exists per class family
- the AI generation request path consumes that contract
- restore/continuity expectations are encoded in the contract
- forbidden generic patterns are explicit
