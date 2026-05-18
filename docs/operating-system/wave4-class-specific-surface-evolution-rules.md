# Wave 4 Class-Specific Surface Evolution Rules

מטרת המסמך:
- לנעול את החוזה הקנוני של `W4-MBN-008`
- להגדיר איך frontend / backend / scene evolution חייבים להשתנות לפי `productClass`
- למנוע מצב שבו surface evolution נשארת גנרית למרות שה־class כבר ננעלה

## Contract Purpose

`Minimum Believable Nexus` לא יכולה להסתפק בכך ש־class resolution ו־generation intent קיימים רק ברמת metadata.

אחרי ש־class ננעלת, ו־build surface + generation contract קיימים,
Nexus חייבת להחזיק גם `class-specific surface evolution rules` שמגדירים:
- איזה frontend surface אמור להתפתח
- איזה backend state חייב להיות מחובר אליו
- איזה scene / workflow family שולטת בהתפתחות
- איזה visible changes חייבים להופיע מול המשתמש
- איך restore identity נשמרת לאורך ההתקדמות

## Canonical Output

החוזה הקנוני חייב לייצר לכל `productClass`:
- `evolutionFamily`
- `frontendSurfaceType`
- `backendStateType`
- `sceneType`
- `visibleEvolutionRule`
- `requiredVisibleChanges`
- `backendCoupling`
- `restoreIdentity`
- `previewFamily`
- `buildSurfaceFamily`
- `releasePathFamily`

## Class Rules

### `landing-page`
- evolution family: `section-evolution`
- frontend surface type: `marketing-page`
- backend state type: `conversion-state`
- scene type: `section-sequence`
- visible rule: sections must clarify promise, trust, and CTA in order

### `mobile-app`
- evolution family: `screen-evolution`
- frontend surface type: `mobile-simulator`
- backend state type: `flow-state`
- scene type: `screen-sequence`
- visible rule: the first screen and navigation direction must evolve with the first action

### `internal-tool`
- evolution family: `workspace-evolution`
- frontend surface type: `operations-workspace`
- backend state type: `queue-state`
- scene type: `queue-workspace`
- visible rule: queue ownership and next action must evolve inside the same workspace

### `commerce-ops`
- evolution family: `commerce-workspace-evolution`
- frontend surface type: `commerce-workspace`
- backend state type: `operations-state`
- scene type: `operations-workspace`

### `saas`
- evolution family: `workflow-evolution`
- frontend surface type: `product-workspace`
- backend state type: `workflow-state`
- scene type: `workflow-sequence`

### `game`
- evolution family: `scene-evolution`
- frontend surface type: `playable-preview`
- backend state type: `play-state`
- scene type: `scene-state`

### `book`
- evolution family: `outline-evolution`
- frontend surface type: `document-preview`
- backend state type: `outline-state`
- scene type: `outline-sequence`

### `content-product`
- evolution family: `module-evolution`
- frontend surface type: `content-preview`
- backend state type: `module-state`
- scene type: `module-sequence`

## Governing Implementation

The governing implementation for this contract is:
- `src/core/class-specific-surface-evolution-rules.js`

The canonical write-through points are:
- `src/core/context-builder.js`
- `src/core/ai-design-service.js`
- `src/core/ai-design-request-schema.js`
- `web/nexus-ui/adapters/execution-adapter.js`
- `web/nexus-ui/screens/ExecutionLiveScreen.js`

## Truth Rules

`W4-MBN-008` is not truthful if:
- all classes still evolve through one generic frontend/backend flow
- backend state is allowed to mutate without visible class-specific surface impact
- scene/workflow direction exists only inside internal state
- the execution surface does not carry class-specific evolution truth visibly

`W4-MBN-008` is truthful when:
- one canonical evolution rule-set exists per class family
- frontend surface, backend state, and scene/workflow are coupled per class
- the request path and execution surface both carry that evolution law
- restore identity expectations are explicit
