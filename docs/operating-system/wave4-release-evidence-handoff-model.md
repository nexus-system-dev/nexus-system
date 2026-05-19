# Wave 4 Release Evidence And Handoff Model

מטרת המסמך:
- לנעול את החוזה הקנוני של `W4-MBN-014`
- להגדיר איך Nexus מסבירה release evidence ו־handoff מתוך המוצר עצמו
- למנוע מצב שבו release path נשאר פנימי, implied, או חבוי בתוך events בלבד

## Contract Purpose

אחרי ש־`releaseable product state` כבר הוגדר,
Nexus חייבת להחזיק `release evidence and handoff model` אחד שמסביר:
- מה נבנה בפועל
- איך הוא נעטף ל־package או release artifact
- לאן ה־release path ממשיך
- מהו ה־next handoff step
- אילו visible checks תומכים ב־handoff

## Canonical Output

החוזה הקנוני חייב להגדיר:
- `modelId`
- `evidenceFamily`
- `status`
- `handoffStatusLabel`
- `explainableReleasePath`
- `builtSurfaceTitle`
- `wrappedArtifactType`
- `packagePath`
- `previewPath`
- `releaseTarget`
- `nextAction`
- `narrative`
- `evidenceItems`
- `visibleChecks`
- `blockers`
- `handoffSteps`
- `persistenceRule`

## Truth Rules

`W4-MBN-014` is not truthful if:
- release handoff is hidden behind internal events
- the user still cannot tell what was built, wrapped, and made releasable
- proof screen stops at artifact summary without release path explanation

`W4-MBN-014` is truthful when:
- one governing implementation model resolves release evidence and handoff
- proof surface explains the release path inside Nexus
- the user can see built surface, wrapped artifact, release target, next action, and blockers
- release evidence survives revisit and route restore

## Visible Surface Requirements

מסך ה־Proof חייב להראות לפחות:
- handoff status
- explainable release path
- what was built
- what was wrapped
- release target
- next action
- visible checks
- handoff steps
- blockers כשיש כאלה

## Continuity Rule

`release evidence and handoff` חייבים להישאר קוהרנטיים דרך:
- proof revisit
- route restore
- transition to confirmation

אסור שה־handoff יהפוך ל־internal release event stream בלבד.
