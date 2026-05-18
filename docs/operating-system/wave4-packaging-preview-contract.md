# Wave 4 Packaging And Preview Contract

מטרת המסמך:
- לנעול את החוזה הקנוני של `W4-MBN-012`
- להגדיר expectations מפורשים של `preview` ו־`packaging` לכל `productClass`
- למנוע מצב שבו preview/package logic נשאר implicit בתוך runtime resolver בלבד

## Contract Purpose

אחרי ש־runtime path, local workspace continuity, ו־desktop shell scope כבר נעולים,
Nexus חייבת להחזיק `class-aware packaging/preview contract` אחד שאומר:
- איזה preview mode נכון לכל class
- איזה package mode נכון לכל class
- איזה preview surface אמור להרגיש אמיתי למשתמש
- איזה package artifact אמור להיות מובן כתוצר releaseable
- איך preview/package mode נשמרים כ־project-facing truth לאורך reopen/restore

## Canonical Output

החוזה הקנוני חייב להגדיר:
- `previewFamily`
- `previewMode`
- `previewSurface`
- `previewArtifact`
- `packageMode`
- `packagingFamily`
- `packageArtifactType`
- `preferredReleaseTarget`
- `shellPath`
- `packagingExpectation`
- `visiblePreviewRule`
- `visiblePackagingRule`
- `continuityRule`

## Core Class Expectations

- `landing-page`
  - preview: `live-browser-preview`
  - packaging: `static-web-build`
- `mobile-app`
  - preview: `mobile-simulator-preview`
  - packaging: `signed-mobile-archive`
- `internal-tool`
  - preview: `workspace-preview`
  - packaging: `private-workspace-package`
- `commerce-ops`
  - preview: `commerce-workspace-preview`
  - packaging: `commerce-workspace-package`
- `saas`
  - preview: `product-workspace-preview`
  - packaging: `saas-web-package`

Extended classes remain explicit too:
- `game`
- `book`
- `content-product`

## Truth Rules

`W4-MBN-012` is not truthful if:
- preview expectations are still ad hoc
- packaging expectations are only implied by runtime family
- mobile packaging is not differentiated from web packaging
- preview/package mode is hidden from the execution surface

`W4-MBN-012` is truthful when:
- every class has explicit preview/package expectations
- one governing implementation model resolves the contract
- the execution surface can display the preview/package mode visibly
- preview/package mode persists as project-facing class truth
