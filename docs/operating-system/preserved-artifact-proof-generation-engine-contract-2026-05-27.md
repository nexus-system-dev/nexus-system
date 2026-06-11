# Preserved Artifact / Proof Generation Engine Contract

תאריך: `2026-05-27`  
סטטוס: `canonical preserved engine contract`

## Purpose

לנעול איך Nexus שומרת את מנוע ה־artifact/proof הקיים כמנוע יצירת תוצר פנימי עבור ה־new shell.

המטרה היא לשמר:
- artifact expectation
- canonical proof artifact
- generated surface proof schema
- proof adapter truth

בלי לשמר את `old proof screen` כיעד מוצרי עצמאי.

## Preserved Engine Truth

המנוע שנשמר כולל:
- `buildCanonicalProofArtifact`
- class-aware artifact rendering
- artifact expectation reuse from onboarding/handoff
- preview payload construction
- proof provenance
- artifact open/download capability flags
- repeated-loop continuation increment

מקורות אמת:
- [canonical-proof-artifact.js](/Users/yogevlavian/Desktop/The%20Nexus/src/core/canonical-proof-artifact.js)
- [project-service.js](/Users/yogevlavian/Desktop/The%20Nexus/src/core/project-service.js)
- [proof-adapter.js](/Users/yogevlavian/Desktop/The%20Nexus/web/nexus-ui/adapters/proof-adapter.js)

## New Shell Contract

ה־new shell לא אמור להיות תלוי במסך Proof הישן כדי לקבל artifact truth.

במקום זה, הוא מקבל מעטפת אחת:
- `getProjectArtifactGenerationEnvelope({ projectId, refresh })`

המעטפת הזו מחזירה:
- `artifactExpectation`
- `proofArtifact`
- `previewScreenViewModel`
- `generatedSurfaceProofSchema`
- `aiControlCenterSurface`
- `proposalApplyDecision`
- `generationIntent`
- `classAwareGenerationContract`
- `releaseReadinessEvaluation`

בנוסף היא מחזירה:
- `surfaceMode: "hidden-engine"`
- `engineRole: "artifact-generation-for-new-shell"`

ו־`shellAnchors` מינימליים:
- `artifactId`
- `artifactType`
- `previewKind`
- `artifactTitle`
- `artifactStatus`
- `canOpenArtifact`
- `canDownloadArtifact`
- `routeKey`
- `expectationId`

## Preserve / Remove / Build Truth

### Preserve
- artifact/proof generation logic
- artifact expectation continuity
- class-aware proof rendering
- proof provenance and route capability

### Remove
- תלות ב־old Proof screen כ־truth owner
- התייחסות ל־proof כשלב גלוי נפרד ב־new shell

### Build
- `artifact-generation envelope` אחד ל־new shell
- בסיס אמין ל־Build artifact, History snapshots, Release readiness, ו־mutation updates

## Product Copy Rule

שם התוצר נשמר מתוך `artifactExpectation.title`.

מונחי תפעול פנימיים בגוף התוצר יכולים לעבור normalization לשפה מוצרית,
אבל כותרת התוצר לא עוברת תרגום אוטומטי שמחליף את identity של artifact.

## Verification Evidence

Verification ממוקד שעבר:

```bash
node --test --test-name-pattern 'project service exposes artifact generation as a hidden engine envelope for the new shell|project service exposes a canonical truth envelope for the new shell' test/project-service.test.js
node --test test/canonical-proof-artifact.test.js
node --test test/proof-adapter.test.js
```

## Closure Rule

`ENG-004` נחשב closed truthfully כאשר:
- artifact/proof engine נשאר אמיתי
- ל־new shell יש artifact-generation envelope אחד
- artifact expectation נשמרת דרך proof artifact
- proof adapter עדיין מצליח לתרגם artifact truth ל־surface-facing model
- old Proof screen לא נדרש כ־authority layer
