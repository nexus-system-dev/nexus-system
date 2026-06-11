# Preserved Snapshot / Rollback / Continuity Engine Contract

תאריך: `2026-05-26`  
סטטוס: `canonical preserved engine contract`

## Purpose

לנעול מה בדיוק נשמר מתוך מנועי:
- `snapshot`
- `rollback`
- `disaster recovery`
- `business continuity`

כמנועים פנימיים אמיתיים של Nexus החדשה, בלי לשמר את ה־old visible shell.

## Preserved Engine Truth

ה־engine שנשמר כולל:
- `project-snapshot-store`
- `snapshot backup schedule`
- `snapshot backup worker`
- `snapshot retention policy / decision`
- `rollback execution module`
- `restore decision`
- `disaster recovery checklist`
- `continuity plan`
- `business continuity state`

מקורות אמת:
- [project-service.js](/Users/yogevlavian/Desktop/The%20Nexus/src/core/project-service.js)
- [project-snapshot-store.js](/Users/yogevlavian/Desktop/The%20Nexus/src/core/project-snapshot-store.js)
- [project-rollback-execution-module.js](/Users/yogevlavian/Desktop/The%20Nexus/src/core/project-rollback-execution-module.js)

## New Shell Contract

ה־new shell לא אמור לדבר ישירות עם כמה מודולים נפרדים.

במקום זה, הוא מקבל מעטפת אחת:
- `getProjectRecoveryEnvelope({ projectId, refresh })`

המעטפת הזו מחזירה:
- `projectStateSnapshot`
- `snapshotRecord`
- `snapshotSchedule`
- `snapshotBackupWorker`
- `snapshotJobState`
- `snapshotWorkerRuntime`
- `snapshotRetentionPolicy`
- `snapshotRetentionDecision`
- `continuityPlan`
- `disasterRecoveryChecklist`
- `businessContinuityState`
- `rollbackPlan`
- `restoreDecision`
- `rollbackExecutionResult`
- `workspaceModel`
- `releaseReadinessEvaluation`

בנוסף היא מחזירה `shellAnchors` מינימליים:
- `latestSnapshotId`
- `recoveryReadinessScore`
- `continuityLifecycleState`
- `rollbackExecutionStatus`

## Preserve / Remove / Build Truth

### Preserve
- מנוע snapshot אמיתי
- rollback אמיתי
- continuity planning אמיתי
- recovery truth אמיתי

### Remove
- תלות ב־old cockpit framing כדרך היחידה להבין recovery state
- חשיפה טכנית מפוזרת של recovery truth על פני כמה קטעי UI ישנים

### Build
- `shell-facing recovery envelope` אחד
- בסיס אמין ל־`History`, `Release`, ו־`continuity / return` ב־new shell

## Verification Evidence

Verification ממוקד שעבר:

```bash
node --test --test-name-pattern 'project service exposes a canonical recovery envelope for the new shell|project service configures snapshot backup schedule and stores manual backup records|project service runs snapshot backup worker tick with status reporting and toggling|project service exposes disaster recovery checklist with refresh integration|project service evaluates and mutates business continuity lifecycle state|project service exposes a canonical truth envelope for the new shell' test/project-service.test.js
node --test test/project-service-rollback-execution.test.js
node --test test/project-rollback-execution-module.test.js
```

## Closure Rule

`ENG-002` נחשב preserved truthfully כאשר:
- recovery engine נשאר אמיתי
- snapshot / rollback / continuity נשארים ניתנים לאימות
- ל־new shell יש recovery envelope קנוני אחד
- אין תלות נדרשת ב־old visible shell כדי לגשת ל־recovery truth
