# Wave 4 Releaseable Product State Contract

מטרת המסמך:
- לנעול את החוזה הקנוני של `W4-MBN-013`
- להגדיר מתי פרויקט הגיע ל־`releaseable product state`
- למנוע מצב שבו releaseability מוסקת רק מ־proof text או approval metadata

## Contract Purpose

אחרי ש־runtime, preview, packaging, ו־release target כבר מוגדרים,
Nexus חייבת להחזיק `releaseable product state contract` אחד שאומר:
- האם הפרויקט `not-ready`, `preparing`, `active`, או `ready`
- מהו release target הפעיל
- איזה package artifact עומד לצאת
- אילו checks חייבים לעבור כדי שהפרויקט ייחשב releaseable
- מהו ה־next action עד launch approval

## Canonical Output

החוזה הקנוני חייב להגדיר:
- `contractId`
- `stateFamily`
- `status`
- `readinessDecision`
- `releaseTarget`
- `runtimeFamily`
- `packageArtifactType`
- `packagePath`
- `previewPath`
- `packagingExpectation`
- `continuityRule`
- `visibleStateRule`
- `visibleChecks`
- `blockedReasons`
- `summary.label`
- `summary.nextAction`
- `summary.readinessScore`

## Truth Rules

`W4-MBN-013` is not truthful if:
- releaseability is still inferred from proof text only
- releaseability is hidden behind internal evaluator output
- the user cannot tell what still blocks release
- release target, package path, and preview path are still missing from the visible surface

`W4-MBN-013` is truthful when:
- one governing implementation model resolves releaseable state
- execution surface can show the releaseable state visibly
- release readiness is expressed through visible checks and next action
- releaseable state survives reopen and route restore

## Visible Surface Requirements

ה־execution surface חייב להראות לפחות:
- releaseable label
- visible state rule
- release target
- package path
- preview path
- package artifact type
- readiness score
- visible checks
- blocked reasons כשיש כאלה
- next action עד launch approval

## Continuity Rule

`releaseable product state` חייב להישאר קוהרנטי דרך:
- reopen
- route restore
- continuation loop

אסור שה־state יהפוך ל־approval badge בלבד בלי runtime/package/release truth.
