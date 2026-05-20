# Wave 4 Class-Aware Deployment Release Path

מטרת המסמך:
- לנעול את החוזה הקנוני של `W4-MBN-017`
- להגדיר deployment/release path bounded לכל class מרכזי
- למנוע מצב שבו Nexus מסתפקת ב־`deployment later` בלי מסלול Wave 4 אמיתי

## Contract Purpose

אחרי ש־runtime, packaging, ו־releaseable state כבר הוגדרו,
Nexus חייבת להחזיק `class-aware deployment release path` אחד שמסביר:
- לאיזה target כל class באמת מתקדמת
- דרך איזה provider או pipeline סביר להגיע לשם
- מהו environment path
- מהו ה־next gate לפני deployment/release
- אילו targets נשארים bounded ותקפים ל־Wave 4

## Canonical Output

החוזה הקנוני חייב להגדיר:
- `modelId`
- `pathFamily`
- `providerType`
- `releaseStatus`
- `primaryTarget`
- `boundedTargets`
- `environmentPath`
- `previewPath`
- `packagePath`
- `operationalPath`
- `deploymentArtifactType`
- `nextGate`
- `visibleReleaseRule`
- `continuityRule`

## Truth Rules

`W4-MBN-017` is not truthful if:
- deployment is postponed as a vague future step
- all classes collapse into one generic release target
- the user still cannot tell where the build is headed operationally

`W4-MBN-017` is truthful when:
- one governing implementation model resolves a bounded deployment/release path per major class
- Execution surface exposes provider, target, environment path, operational path, and next gate
- the path stays class-aware and credible
- release path survives revisit and route restore

## Visible Surface Requirements

מסך `Execution` חייב להראות לפחות:
- path family
- provider
- primary target
- next gate
- environment path
- operational path
- deployment artifact
- bounded targets

## Continuity Rule

`class-aware deployment release path` חייב להישאר קוהרנטי דרך:
- execution revisit
- route restore
- handoff אל deployment feedback

אסור שה־release path תחזור להיות implied בלבד אחרי refresh או reopen.
