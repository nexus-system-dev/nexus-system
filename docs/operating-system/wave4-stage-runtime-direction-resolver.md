# Wave 4 Stage And Runtime-Direction Resolver

מטרת המסמך:
- לנעול את ה־stage resolver וה־runtime-direction resolver של `Wave 4`
- להבטיח ש־runtime direction נבחרת לפני bootstrap
- לחבר `productClass` ל־stage, preview, runtime, packaging, ו־release

## Scope

המסמך הזה הוא ה־closure artifact של:
- `W4-MBN-002 — Define project stage and runtime-direction resolver`

הוא לא טוען עדיין ש־runtime direction כבר visible live בכל surface.
הוא כן טוען שכעת יש resolver קנוני אחד שקובע:
- באיזה stage הפרויקט נמצא
- איזו runtime direction נכונה לו
- מהו release target המועדף
- ואיך ה־downstream bootstrap/release modules צריכים לפעול

## Canonical Stage Model

ה־stage model הקנוני של `Wave 4` כרגע הוא:
- `class-resolution`
- `bootstrap`
- `build`
- `build-validation`
- `release-prep`
- `continuation`

### Resolution Rules

1. אם `productClass` עדיין לא פתורה truthfully:
- stage = `class-resolution`

2. אם class פתורה אבל עוד אין bootstrap/build evidence:
- stage = `bootstrap`

3. אם יש bootstrap plan, bootstrap tasks, או build targets:
- stage = `build`

4. אם lifecycle phase = `validation`:
- stage = `build-validation`

5. אם lifecycle phase = `release` או שיש explicit release target:
- stage = `release-prep`

6. אם lifecycle phase = `growth` או launch confirmation כבר קיים:
- stage = `continuation`

## Runtime Direction Contract

לכל פרויקט, ה־resolver חייב להחזיר:
- `productClass`
- `projectStage`
- `buildSurfaceFamily`
- `previewFamily`
- `runtimeFamily`
- `packagingFamily`
- `releasePathFamily`
- `bootstrapFamily`
- `targetPlatform`
- `preferredReleaseTarget`
- `visibility`

### Canonical Visibility Rule

ה־resolver חייב תמיד לסמן:
- `visibility: must-be-visible-before-bootstrap`

כלומר:
- runtime direction אסור להישאר hidden backend truth
- later tasks must expose it on visible Nexus surfaces

## Preferred Release Target Rule

ה־resolver בוחר `preferredReleaseTarget` לפי הסדר:

1. explicit release target שכבר נשמר על הפרויקט
2. hosting target מתוך recommended defaults
3. domain profile release target ראשון
4. fallback ממשפחת release path של `productClass`
5. `private-deployment`

## Current Governing Implementation

The governing resolver now lives in:
- `src/core/project-stage-runtime-direction-resolver.js`

Current canonical integrations:
- `src/core/bootstrap-plan-generator.js`
- `src/core/release-plan-generator.js`
- `src/core/context-builder.js`

This means:
- bootstrap planning now receives `projectStage` and `runtimeDirection`
- release planning now receives `projectStage` and `runtimeDirection`
- project context now exposes:
  - `productClass`
  - `projectStage`
  - `runtimeDirection`

## Product-Class To Runtime Mapping

### `landing-page`
- runtime family: `web-static`
- target platform: `web`
- preferred preview family: `web-preview`

### `mobile-app`
- runtime family: `mobile-runtime`
- target platform: `mobile`
- preferred preview family: `mobile-simulator`

### `internal-tool`
- runtime family: `web-app-runtime`
- target platform: `web`
- preferred preview family: `workspace-preview`

### `commerce-ops`
- runtime family: `web-app-runtime`
- target platform: `web`
- preferred preview family: `commerce-workspace-preview`

### `saas`
- runtime family: `web-app-runtime`
- target platform: `web`
- preferred preview family: `product-workspace-preview`

### `game`
- runtime family: `game-runtime`
- target platform: `game`
- preferred preview family: `playable-preview`

### `book`
- runtime family: `document-runtime`
- target platform: `document`
- preferred preview family: `document-preview`

### `content-product`
- runtime family: `content-runtime`
- target platform: `content`
- preferred preview family: `content-preview`

## Truthful Boundary Of This Task

`W4-MBN-002` is `trueGreen` if:
- runtime selection rules are explicit and class-aware
- stage resolution rules are explicit and canonical
- bootstrap and release planning consume the same resolver
- context exposes the same runtime direction truth

`W4-MBN-002` is not yet claiming:
- visible runtime direction proof on live Nexus surfaces
- simulator/workspace UI proof
- release path UI proof

Those remain for later tasks, especially:
- `W4-MBN-003`
- `W4-MBN-005`
- `W4-MBN-011`
- `W4-MBN-013`
