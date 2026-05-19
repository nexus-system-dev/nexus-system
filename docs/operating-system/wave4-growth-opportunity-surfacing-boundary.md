# Wave 4 Growth Opportunity Surfacing Boundary

מטרת המסמך:
- לנעול את החוזה הקנוני של `W4-MBN-016`
- להגדיר אילו opportunities Nexus רשאית להציג ב־Wave 4
- למנוע מצב שבו `Next Task` מרמזת על אוטונומיית Wave 7 או על fake autonomous company behavior

## Contract Purpose

אחרי ש־`post-release continuation loop` כבר הוגדר,
Nexus חייבת להחזיק `growth opportunity surfacing boundary` אחד שמסביר:
- אילו next moves מותר להציג עכשיו
- אילו מהלכים נשארים deferred beyond Wave 4
- אילו מהלכים אסורים כי הם מנותקים מהמוצר שאושר
- איך שומרים שה־next moves נשארים credible ו־bounded

## Canonical Output

החוזה הקנוני חייב להגדיר:
- `boundaryId`
- `boundaryFamily`
- `status`
- `statusLabel`
- `visibleBoundaryRule`
- `allowedOpportunityFamilies`
- `allowedMoves`
- `deferredOpportunityFamilies`
- `disallowedMoves`
- `credibilityRule`
- `continuityRule`

## Truth Rules

`W4-MBN-016` is not truthful if:
- `Next Task` implies broad autonomous GTM or company strategy
- surfaced opportunities are disconnected from the last approved artifact
- Wave 7 autonomy is implied as if it already belongs to Wave 4

`W4-MBN-016` is truthful when:
- one governing implementation model resolves the Wave 4 opportunity boundary
- Nexus exposes meaningful next moves while showing what stays out of scope
- every surfaced move stays directly tied to artifact, release target, and current bottleneck
- opportunity state survives revisit and route restore

## Visible Surface Requirements

מסך `Next Task` חייב להראות לפחות:
- boundary status
- visible boundary rule
- what is allowed now
- what remains outside Wave 4
- credibility rule
- continuity rule

## Continuity Rule

`growth opportunity surfacing boundary` חייב להישאר קוהרנטי דרך:
- revisit אחרי release
- route restore
- transition חזרה ל־execution

אסור שה־boundary תיעלם כך שהמוצר יחזור להציע מהלכים לא bounded.
