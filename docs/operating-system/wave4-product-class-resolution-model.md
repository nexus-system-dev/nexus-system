# Wave 4 Product-Class Resolution Model

מטרת המסמך:
- לנעול את מודל ה־product-class הקנוני של `Wave 4`
- להגדיר איך Nexus פותרת class identity לאורך create, upload, restore, ו־continuation
- להבהיר את ההבחנה בין:
  - `productClass`
  - `domain specialization`
- לתת חוזה מחייב ל־bootstrap, build surfaces, runtime direction, release path, ו־continuation

## Why This Exists

לפני `W4-MBN-001`, ה־repo החזיק כמה מקורות class truth במקביל:
- frontend onboarding detection ב־`web/app.js`
- backend onboarding detection ב־`src/core/onboarding-service.js`
- domain classification ב־`src/core/domain-classifier.js`
- domain registry ב־`src/core/domain-registry.js`

בפועל זה יצר drift בין:
- `landing-page`, `mobile-app`, `internal-tool`, `commerce-ops`, `saas`
- specializations כמו `casino`, `agency-system`
- classes מורחבים כמו `game`, `book`, `content-product`

`W4-MBN-001` סוגר את זה על ידי מודל אחד:
- `productClass` = class קנוני של המוצר
- `domain specialization` = specialization אופציונלי שמחדד context downstream

## Canonical Resolution Model

### 1. Primary Product-Class Field

שדה ה־truth הראשי של `Wave 4` הוא:
- `productClass`

הוא חייב להיות canonical, normalized, ויציב בין:
- prompt intake
- upload intake
- existing-project intake
- create flow
- restore flow
- continuation flow

### 2. Canonical Product Classes

ה־product classes הקנוניים של `Wave 4` כרגע הם:
- `landing-page`
- `mobile-app`
- `internal-tool`
- `commerce-ops`
- `saas`
- `game`
- `book`
- `content-product`
- `generic`

### 3. Domain Specializations

Nexus עדיין רשאית להחזיק specializations domain-level, אבל הם משניים ל־`productClass`.

Specializations קנוניים נוכחיים:
- `casino`
- `agency-system`

הם ממופים כך:
- `casino` -> `productClass: saas`
- `agency-system` -> `productClass: internal-tool`

כלומר:
- specialization מחדד context, release details, או capability hints
- אבל הוא לא מחליף את `productClass`

## Resolution Order

Nexus חייבת לפתור `productClass` לפי סדר העדיפויות הבא:

1. explicit class provided by the user or persisted project intake
2. explicit persisted class already stored on the project during restore/continuation
3. class hint coming from active onboarding or artifact expectation handoff
4. uploaded files, uploaded content, and external-link signals
5. raw vision / prompt text
6. fallback to `generic`

אסור:
- לנחש class מחדש בכל מסך
- לעקוף persisted class בלי evidence חדש
- לתת ל־UI, backend, ו־domain classifier להחזיק taxonomies שונות

## Stability Rules

ברגע ש־`productClass` נפתרת, היא חייבת:
- survive create
- survive upload
- survive restore
- survive refresh
- survive continuation

מותר לעדכן class רק אם:
- המשתמש בחר class אחרת מפורשות
- או evidence חדש מהותי סותר את ה־class הקיימת

אם יש conflict:
- ה־conflict חייב להיות explicit
- לא silent overwrite

## Class Contract Families

כל `productClass` חייבת להחזיק family contracts שממשיכים ל־Wave 4 lanes הבאים:

### `landing-page`
- build surface family: `web-marketing-surface`
- preview family: `web-preview`
- runtime family: `web-static`
- packaging family: `web-build`
- release path family: `web-deployment`
- bootstrap family: `landing-page-skeleton`
- execution maturity: `wave4-core`

### `mobile-app`
- build surface family: `mobile-app-surface`
- preview family: `mobile-simulator`
- runtime family: `mobile-runtime`
- packaging family: `mobile-package`
- release path family: `app-distribution`
- bootstrap family: `mobile-app-skeleton`
- execution maturity: `wave4-core`

### `internal-tool`
- build surface family: `workspace-surface`
- preview family: `workspace-preview`
- runtime family: `web-app-runtime`
- packaging family: `workspace-package`
- release path family: `private-workspace-release`
- bootstrap family: `internal-tool-skeleton`
- execution maturity: `wave4-core`

### `commerce-ops`
- build surface family: `commerce-workspace-surface`
- preview family: `commerce-workspace-preview`
- runtime family: `web-app-runtime`
- packaging family: `commerce-workspace-package`
- release path family: `commerce-web-release`
- bootstrap family: `commerce-ops-skeleton`
- execution maturity: `wave4-core`

### `saas`
- build surface family: `saas-product-surface`
- preview family: `product-workspace-preview`
- runtime family: `web-app-runtime`
- packaging family: `saas-package`
- release path family: `web-product-release`
- bootstrap family: `saas-skeleton`
- execution maturity: `wave4-core`

### `game`
- build surface family: `game-surface`
- preview family: `playable-preview`
- runtime family: `game-runtime`
- packaging family: `game-package`
- release path family: `game-release`
- bootstrap family: `game-skeleton`
- execution maturity: `wave4-extended`

### `book`
- build surface family: `content-outline-surface`
- preview family: `document-preview`
- runtime family: `document-runtime`
- packaging family: `publishing-package`
- release path family: `document-publishing`
- bootstrap family: `book-outline-skeleton`
- execution maturity: `wave4-extended`

### `content-product`
- build surface family: `content-delivery-surface`
- preview family: `content-preview`
- runtime family: `content-runtime`
- packaging family: `content-package`
- release path family: `content-release`
- bootstrap family: `content-product-skeleton`
- execution maturity: `wave4-extended`

### `generic`
- build surface family: `generic-surface`
- preview family: `generic-preview`
- runtime family: `generic-runtime`
- packaging family: `generic-package`
- release path family: `private-deployment`
- bootstrap family: `generic-skeleton`
- execution maturity: `fallback-only`

## Current Repository Governing Implementation

The canonical shared implementation now lives in:
- `web/shared/product-class-model.js`

Current governing integrations:
- `web/app.js`
- `src/core/onboarding-service.js`
- `src/core/domain-registry.js`
- `src/core/domain-classifier.js`

This means:
- create/upload onboarding resolution now uses the same class contract
- backend onboarding resolution now uses the same class contract
- domain classification now returns both:
  - `domain`
  - `productClass`
- registry definitions now know which `productClass` they belong to

## What This Task Does Not Claim Yet

`W4-MBN-001` does not yet claim:
- that every `productClass` already has full live build surfaces
- that every `productClass` already has runtime execution wired
- that every `productClass` already has releaseable output proof

Those belong to later tasks:
- `W4-MBN-002`
- `W4-MBN-003`
- `W4-MBN-005`
- `W4-MBN-007`
- `W4-MBN-011`
- `W4-MBN-013`
- `W4-MBN-015`

What `W4-MBN-001` does claim is:
- one canonical product-class model now exists
- it is shared across the relevant repo entry points
- it defines downstream family contracts for the next Wave 4 tasks
