# Wave 4 Class-Specific Skeleton Quality Baseline

מטרת המסמך:
- לנעול מה נחשב `minimum believable structure` לכל `productClass`
- למנוע מצב שבו כל class מקבלת skeleton גנרית ורזה מדי
- להבטיח שה־automatic skeleton contract ממשיך ל־quality bar ברור ולא רק ל־structure בסיסית

## Scope

המסמך הזה הוא ה־closure artifact של:
- `W4-MBN-004 — Define class-specific skeleton quality baseline`

הוא מגדיר:
- quality bar לכל class
- visible proof points מינימליים
- required surface elements
- fail conditions
- user perception goal

## Canonical Rule

Skeleton לא נחשבת believable רק בגלל שיש:
- route
- panel
- artifact list
- או placeholder surface

Skeleton נחשבת believable רק אם ה־first visible surface:
- reads like the right product class
- exposes the right first proof points
- includes the minimal class-specific structure a user expects

This baseline is not enough for the later interactive runtime standard.

`RUNTIME-SKEL-001` raises the bar from "believable structure" to "simulated product behavior":
- the user can interact with the skeleton
- visible state changes after action
- navigation or workflow changes where relevant
- static frames and visual mockups are explicitly insufficient

## Baseline Fields

לכל baseline חייבים להיות:
- `baselineId`
- `productClass`
- `qualityBar`
- `visibleProofPoints`
- `requiredSurfaceElements`
- `coherenceChecks`
- `failIfMissing`
- `userPerceptionGoal`
- `restoreExpectation`

## Canonical Baselines

### `landing-page`
- quality bar: `minimum-believable-marketing-surface`
- visible proof points:
  - `hero-value-prop`
  - `trust-proof`
  - `single-cta`
- fail if missing:
  - `headline`
  - `cta`

### `mobile-app`
- quality bar: `minimum-believable-mobile-entry-flow`
- visible proof points:
  - `first-screen`
  - `primary-action`
  - `navigation-direction`
- fail if missing:
  - `first-screen`
  - `primary-action`

### `internal-tool`
- quality bar: `minimum-believable-workspace`
- visible proof points:
  - `queue-view`
  - `ownership-view`
  - `next-action-view`
- fail if missing:
  - `queue-panel`
  - `ownership-panel`

### `commerce-ops`
- quality bar: `minimum-believable-commerce-workspace`
- visible proof points:
  - `orders-view`
  - `catalog-view`
  - `operations-action-view`
- fail if missing:
  - `orders-panel`
  - `catalog-panel`

### `saas`
- quality bar: `minimum-believable-product-workspace`
- visible proof points:
  - `product-shell`
  - `first-workflow`
  - `primary-action`
- fail if missing:
  - `product-shell`
  - `workflow-panel`

### `game`
- quality bar: `minimum-believable-playable-preview`
- visible proof points:
  - `scene-root`
  - `hud`
  - `interaction-anchor`
- fail if missing:
  - `scene-root`
  - `hud`

### `book`
- quality bar: `minimum-believable-book-outline`
- visible proof points:
  - `outline`
  - `chapter-structure`
  - `publishing-direction`
- fail if missing:
  - `outline`
  - `chapter-index`

### `content-product`
- quality bar: `minimum-believable-content-system`
- visible proof points:
  - `module-structure`
  - `delivery-path`
  - `content-shape`
- fail if missing:
  - `module-index`
  - `delivery-path`

### `generic`
- quality bar: `minimum-believable-generic-skeleton`
- visible proof points:
  - `overview`
  - `next-step`
- fail if missing:
  - `overview`

## Governing Implementation

The governing implementation now lives in:
- `src/core/class-specific-skeleton-quality-baseline.js`

Current canonical integrations:
- `src/core/bootstrap-plan-generator.js`
- `src/core/context-builder.js`
- `src/core/class-specific-skeleton-quality-baseline-bridge.js`

This means:
- bootstrap plans now carry `skeletonQualityBaseline`
- project context now exposes `classSpecificSkeletonQualityBaseline`
- the baseline can be bridged into artifact expectations and proof framing

## Truthful Boundary Of This Task

`W4-MBN-004` is `trueGreen` if:
- each canonical class has a minimum viable structure definition
- the baseline is explicit and not generic
- bootstrap planning consumes that baseline
- context exposes that baseline

`W4-MBN-004` is not yet claiming:
- live visible bootstrap proof
- evolving build progression
- final screen fidelity
- split workspace UX proof

Those belong to later tasks, especially:
- `W4-MBN-005`
- `W4-MBN-006`
- `RUNTIME-SKEL-001`
