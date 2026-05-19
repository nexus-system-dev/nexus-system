# Wave 4 Post-Release Continuation Loop

מטרת המסמך:
- לנעול את החוזה הקנוני של `W4-MBN-015`
- להגדיר איך Nexus פותחת את סבב ההמשך הראשון אחרי release
- למנוע מצב שבו release נשאר end state טרמינלי בלי צעד המשך אמיתי מתוך המוצר

## Contract Purpose

אחרי ש־`release evidence and handoff` כבר הוגדרו,
Nexus חייבת להחזיק `post-release continuation loop` אחד שמסביר:
- מאיזה release או artifact סבב ההמשך נפתח
- מהו ה־next move הראשון
- אילו fixes / improvements / growth moves מותרים
- איך שומרים שההמשך נשאר bounded ולא הופך ל־fake autonomous company behavior
- איך סבב ההמשך שורד revisit ו־route restore

## Canonical Output

החוזה הקנוני חייב להגדיר:
- `loopId`
- `loopFamily`
- `status`
- `statusLabel`
- `originArtifactTitle`
- `originReleaseTarget`
- `nextMoveTitle`
- `nextMoveDescription`
- `nextMoveFamily`
- `visibleContinuationRule`
- `continuationMoves`
- `boundedGrowthRule`
- `continuityRule`

## Truth Rules

`W4-MBN-015` is not truthful if:
- release is still treated as a terminal end state
- continuation exists only as internal loop metadata
- the user cannot see what opens next after release

`W4-MBN-015` is truthful when:
- one governing implementation model resolves the first post-release continuation loop
- Nexus exposes the next move visibly inside the product
- continuation stays product-connected and bounded
- continuation survives revisit and route restore

## Visible Surface Requirements

מסך `Next Task` חייב להראות לפחות:
- continuation status
- origin release target
- next move title
- next move description
- continuation moves
- bounded growth rule
- continuity rule

## Continuity Rule

`post-release continuation loop` חייב להישאר קוהרנטי דרך:
- revisit אחרי release
- route restore
- transition חזרה ל־execution

אסור שה־continuation תישאר `release complete` בלי המשך product-connected מתוך Nexus.
