# Wave 4 Class-Aware Runtime Resolver

מטרת המסמך:
- לנעול את החוזה הקנוני של `W4-MBN-011`
- להגדיר resolver דטרמיניסטי אחד לכל runtime path לפי `productClass`
- למנוע מצב שבו runtime selection נשאר ad hoc או hidden

## Contract Purpose

אחרי ש־product class, runtime direction, workspace continuity, ו־desktop shell scope קיימים,
Nexus חייבת להחזיק `class-aware runtime resolver` אחד שאומר:
- מהו runtime family הנכון
- מהו packaging family הנכון
- מהו release path family הנכון
- איך shell path מתקשרת לבחירת runtime
- איך הבחירה נהיית project-facing על ה־surface

## Canonical Output

החוזה הקנוני חייב להגדיר:
- `runtimeFamily`
- `packagingFamily`
- `releasePathFamily`
- `previewFamily`
- `buildSurfaceFamily`
- `targetPlatform`
- `preferredReleaseTarget`
- `shellFamily`
- `shellPath`
- `visibleRuntimeRule`

## Truth Rules

`W4-MBN-011` is not truthful if:
- runtime selection is still manual or ad hoc
- runtime family exists only inside internal state
- shell path and runtime path are disconnected

`W4-MBN-011` is truthful when:
- one resolver governs all major classes
- runtime selection is deterministic per class
- the execution surface can display the runtime path visibly
- runtime assignment survives as project-facing truth
