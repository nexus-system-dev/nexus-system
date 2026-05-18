# Wave 4 Build Progression State Machine

מטרת המסמך:
- לנעול את state machine הקנונית של build progression ב־Wave 4
- למפות `projectStage` ל־visible route-bound progression
- להבטיח שהתקדמות לא נשארת `percent/status` גנריים בלבד

## Canonical Principle

המשתמש לא אמור לראות רק:
- `42%`
- `active`
- או logs זזים

הוא אמור להבין:
- באיזה שלב בניית המוצר נמצאת עכשיו
- איזה surface משתנה בשלב הזה
- לאיזה route או workspace state השלב קשור
- ומה המעבר המשמעותי הבא

## State Sequence

ה־Wave 4 build progression state machine כוללת שישה מצבים קנוניים:

1. `class-locked`
- routeKey: `understanding`
- meaning: ה־class של המוצר ננעל וה־workspace direction התייצב
- visible expectation: המשתמש מבין איזה מוצר Nexus עומדת לבנות

2. `skeleton-visible`
- routeKey: `execution`
- meaning: שלד המוצר האוטומטי חייב להתחיל להופיע
- visible expectation: build region ראשון נראה לעין

3. `surface-evolving`
- routeKey: `execution`
- meaning: ה־surface עצמו משתנה ומתקדם מעבר לשלד הראשוני
- visible expectation: milestones של class-specific build מתחילים להיסגר

4. `preview-reviewable`
- routeKey: `proof`
- meaning: המוצר הגיע למצב preview שניתן לבחון ולהעריך
- visible expectation: preview/proof route מציג outcome שניתן לבדיקה

5. `release-path-visible`
- routeKey: `artifact`
- meaning: runtime / packaging / release direction גלויים למשתמש
- visible expectation: artifact/output route קשור ל־release path believable

6. `continuation-ready`
- routeKey: `next-task`
- meaning: הסבב הבא נפתח מתוך המוצר שנבנה
- visible expectation: continuation anchor ברור ומשוחזר

## Project Stage Mapping

ה־mapping הקנוני הוא:
- `class-resolution` -> `class-locked`
- `bootstrap` -> `skeleton-visible`
- `build` -> `surface-evolving`
- `build-validation` -> `preview-reviewable`
- `release-prep` -> `release-path-visible`
- `continuation` -> `continuation-ready`

## State Status Overlay

בנוסף ל־stateId, כל מצב יכול לקבל overlay status:
- `active`
- `done`
- `pending`
- `blocked`
- `failed`

`blocked` ו־`failed` אינם מחליפים את ה־state machine עצמה.
הם overlay על השלב הפעיל.

## Visible Progression Rules

לכל state חייבים להיות:
- `routeKey`
- `surfaceExpectation`
- `visibleMilestones`
- `regionFocus`
- `nextStateId`

אסור להתקדם שלב אם אין שינוי user-facing שמצדיק את המעבר.

## Restore And Continuity Rules

ה־state machine חייבת לשרוד:
- refresh
- restore
- return to project
- continuation entry

כלומר `currentStateId`, `routeKey`, ו־`status overlay`
חייבים להיות ניתנים לשחזור מתוך project context.

## W4-MBN-006 TrueGreen Conditions

`W4-MBN-006` הוא `trueGreen` רק אם:
- יש state machine קנונית אחת
- היא ממפה stages ל־route-bound visible states
- היא class-aware דרך surface expectations והמילסטונים
- היא מחוברת ל־context
- והיא נחשפת ב־execution surface קיים

`W4-MBN-006` אינו `trueGreen` אם:
- יש רק `percent/status`
- states נשארים internal בלבד
- אין route binding
- אין visible explanation למעבר בין שלבים
