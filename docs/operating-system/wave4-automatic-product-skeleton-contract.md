# Wave 4 Automatic Product Skeleton Contract

מטרת המסמך:
- לנעול את חוזה ה־automatic class-aware skeleton של `Wave 4`
- להבטיח ש־Nexus מתחילה bootstrap אוטומטי מיד אחרי class resolution
- להגדיר מהו ה־skeleton truth שכל `productClass` חייבת לקבל לפני build progression רחב יותר

## Scope

המסמך הזה הוא ה־closure artifact של:
- `W4-MBN-003 — Define automatic class-aware skeleton contract`

הוא מגדיר:
- מתי bootstrap מתחילה
- איזה skeleton family שייכת לכל `productClass`
- איזה מבנה ראשוני ו־visible milestones חייבים להופיע
- ואיך החוזה זורם ל־bootstrap planning

## Canonical Rule

אחרי ש־`productClass` ו־`runtimeDirection` נפתרו truthfully:
- Nexus חייבת להתחיל skeleton bootstrap אוטומטי
- בלי כפתור `generate`
- בלי שלב hidden
- בלי להישאר ב־plan text או artifact summary

ה־policy הקנונית היא:
- `autoStartPolicy: automatic-after-class-resolution`

## Required Contract Fields

לכל skeleton contract חייבים להיות:
- `contractId`
- `productClass`
- `skeletonFamily`
- `autoStartPolicy`
- `artifactType`
- `visibleSurfaceType`
- `buildSurfaceFamily`
- `previewFamily`
- `runtimeFamily`
- `packagingFamily`
- `releasePathFamily`
- `targetPlatform`
- `initialStructure`
- `initialFiles`
- `visibleMilestones`
- `bootstrapRules`
- `truthRequirements`

## Canonical Skeleton Families

### `landing-page-skeleton`
- visible surface type: `marketing-page`
- initial structure:
  - `hero-section`
  - `trust-section`
  - `cta-section`

### `mobile-app-skeleton`
- visible surface type: `mobile-simulator`
- initial structure:
  - `app-shell`
  - `navigation-stack`
  - `primary-screen`

### `internal-tool-skeleton`
- visible surface type: `workspace`
- initial structure:
  - `workspace-shell`
  - `queue-panel`
  - `ownership-panel`

### `commerce-ops-skeleton`
- visible surface type: `commerce-workspace`
- initial structure:
  - `commerce-shell`
  - `orders-panel`
  - `catalog-panel`

### `saas-skeleton`
- visible surface type: `product-workspace`
- initial structure:
  - `product-shell`
  - `auth-flow`
  - `primary-workflow`

### `game-skeleton`
- visible surface type: `playable-preview`
- initial structure:
  - `game-shell`
  - `scene-root`
  - `hud`

### `book-outline-skeleton`
- visible surface type: `document-preview`
- initial structure:
  - `outline`
  - `chapter-index`
  - `publishing-brief`

### `content-product-skeleton`
- visible surface type: `content-preview`
- initial structure:
  - `content-shell`
  - `module-index`
  - `delivery-path`

### `generic-skeleton`
- visible surface type: `generic-preview`
- initial structure:
  - `project-root`
  - `overview`
  - `next-step`

## Current Governing Implementation

The governing implementation now lives in:
- `src/core/automatic-product-skeleton-contract.js`

Current canonical integrations:
- `src/core/bootstrap-plan-generator.js`
- `src/core/bootstrap-task-templates.js`
- `src/core/context-builder.js`

This means:
- bootstrap planning now receives one explicit `skeletonContract`
- template selection can follow `productClass`
- context now exposes `automaticProductSkeletonContract`

## Truth Requirements

The contract always carries these truth requirements:
- `automatic-start-after-class-resolution`
- `no-explicit-generate-click-required`
- `visible-product-structure-must-appear`
- `skeleton-must-survive-restore`

## Truthful Boundary Of This Task

`W4-MBN-003` is `trueGreen` if:
- a class-aware skeleton contract exists for each canonical product class
- bootstrap planning consumes the contract
- context exposes the contract
- the contract makes automatic start explicit

`W4-MBN-003` is not yet claiming:
- live visible bootstrap proof on `127.0.0.1:4011`
- final class-specific quality bar
- full evolving build surfaces

Those remain for later tasks, especially:
- `W4-MBN-004`
- `W4-MBN-005`
- `W4-MBN-007`
