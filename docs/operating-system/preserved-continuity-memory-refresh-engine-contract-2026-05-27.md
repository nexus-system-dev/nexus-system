# Preserved Continuity / Memory / Refresh Engine Contract

תאריך: `2026-05-27`  
סטטוס: `canonical preserved engine contract`

## Purpose

לנעול איך Nexus שומרת את מנועי ה־continuity, memory, learning ו־refresh הקיימים כמנועים פנימיים עבור ה־new shell.

המטרה היא לשמר:
- return-tomorrow continuity
- reactive workspace refresh
- cross-surface continuity
- canonical learning/memory layers
- durable activity/session history
- returning-user and retention signals

בלי לשמר מסכי continuity / learning / telemetry ישנים כחוויה גלויה בפני עצמה.

## Preserved Engine Truth

המנוע שנשמר כולל:
- `returnTomorrowContinuity`
- `reactiveWorkspaceState`
- `crossSurfaceContinuityContract`
- `canonicalLearningSystemContract`
- `learningInsights`
- `learningInsightViewModel`
- `userPreferenceSignals`
- `crossProjectPatternPanel`
- `learningDisclosure`
- `userActivityEvent`
- `userActivityHistory`
- `userSessionMetric`
- `userSessionHistory`
- `returningUserMetric`
- `retentionSummary`
- `retentionCurveAnalysis`

מקורות אמת:
- [project-service.js](/Users/yogevlavian/Desktop/The%20Nexus/src/core/project-service.js)
- [context-builder.js](/Users/yogevlavian/Desktop/The%20Nexus/src/core/context-builder.js)
- [return-tomorrow-continuity-resolver.js](/Users/yogevlavian/Desktop/The%20Nexus/src/core/return-tomorrow-continuity-resolver.js)
- [reactive-workspace-refresh-model.js](/Users/yogevlavian/Desktop/The%20Nexus/src/core/reactive-workspace-refresh-model.js)
- [cross-surface-continuity-contract.js](/Users/yogevlavian/Desktop/The%20Nexus/src/core/cross-surface-continuity-contract.js)
- [canonical-learning-system-contract.js](/Users/yogevlavian/Desktop/The%20Nexus/src/core/canonical-learning-system-contract.js)
- [durable-session-continuity-store.js](/Users/yogevlavian/Desktop/The%20Nexus/src/core/durable-session-continuity-store.js)

## New Shell Contract

ה־new shell לא אמור להיות תלוי במסך ישן כדי להבין איפה המשתמש הפסיק, מה צריך לרענן, ומה Nexus למדה.

במקום זה, הוא מקבל מעטפת אחת:
- `getProjectContinuityMemoryEnvelope({ projectId, refresh })`

המעטפת הזו מחזירה:
- `workspaceModel`
- `returnTomorrowContinuity`
- `reactiveWorkspaceState`
- `crossSurfaceContinuityContract`
- `canonicalLearningSystemContract`
- learning and preference signals
- durable activity/session history
- returning-user and retention signals

בנוסף היא מחזירה:
- `surfaceMode: "hidden-engine"`
- `engineRole: "continuity-memory-refresh-for-new-shell"`

ו־`shellAnchors` מינימליים:
- `recommendedDestination`
- `returnContinuityStatus`
- `refreshMode`
- `crossSurfaceStatus`
- `learningContractStatus`
- `memoryLayerCount`
- `userActivityCount`
- `userSessionCount`
- `returningUser`
- `retentionRate`

## Preserve / Remove / Build Truth

### Preserve
- continuity and restore behavior
- memory and learning contracts
- durable activity/session history
- refresh state and return-user routing
- retention and preference signals

### Remove
- מסכי continuity/learning ישנים כ־visible product flow
- חשיפת telemetry או learning internals כחוויית משתמש
- תלות ב־old shell כדי לשחזר momentum אחרי refresh

### Build
- `continuity-memory-refresh envelope` אחד ל־new shell
- בסיס אמין ל־Home, Build, History, Growth ו־Studio handoff
- fallback בטוח ל־`workbench` כאשר return-tomorrow continuity עדיין במצב `missing-inputs`

## User-Facing Rule

המשתמש לא אמור לראות:
- learning telemetry
- memory layers
- retention metrics
- refresh orchestration
- continuity graphs

המשתמש כן אמור להרגיש:
- העבודה נשמרת
- refresh לא שובר momentum
- Nexus זוכרת את ההקשר הנכון
- החזרה לפרויקט מרגישה טבעית

## Verification Evidence

Verification ממוקד שעבר:

```bash
node --test --test-name-pattern 'project service exposes continuity memory refresh as a hidden engine envelope for the new shell|project service keeps durable user activity/session history stable across repeated rebuilds and restart|project service persists durable project and workspace state across restart|project service persists durable session continuity state across restart' test/project-service.test.js
node --test test/canonical-learning-system-contract.test.js
node --test test/reactive-workspace-refresh-model.test.js
```

## Closure Rule

`ENG-007` נחשב closed truthfully כאשר:
- continuity/memory/refresh behavior נשאר אמיתי
- ל־new shell יש envelope אחד לקריאת continuity truth
- durable history נשאר stable אחרי rebuild/restart
- learning contract ו־refresh model עדיין עוברים בדיקות
- ה־shell לא צריך מסך ישן כדי לשמר momentum או context
