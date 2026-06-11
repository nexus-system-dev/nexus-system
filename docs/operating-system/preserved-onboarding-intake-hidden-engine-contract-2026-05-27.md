# Preserved Onboarding / Intake Hidden Engine Contract

תאריך: `2026-05-27`  
סטטוס: `canonical preserved engine contract`

## Purpose

לנעול איך Nexus שומרת את:
- `onboarding`
- `adaptive intake`
- `completion gating`
- `handoff into build`

כמנוע פנימי אמיתי של המוצר החדש,
בלי לשמר את `old onboarding screen` כמשטח סמכותי בפני עצמו.

## Preserved Engine Truth

המנוע שנשמר כולל:
- `onboarding session`
- `project draft`
- `project intake`
- `conversation state`
- `current step / required actions`
- `onboarding completion decision`
- `onboarding state handoff`
- `adaptive onboarding agent contract`

מקורות אמת:
- [onboarding-service.js](/Users/yogevlavian/Desktop/The%20Nexus/src/core/onboarding-service.js)
- [project-service.js](/Users/yogevlavian/Desktop/The%20Nexus/src/core/project-service.js)
- [adaptive-onboarding-agent-contract.js](/Users/yogevlavian/Desktop/The%20Nexus/src/core/adaptive-onboarding-agent-contract.js)
- [adaptive-onboarding-agent-contract.js](/Users/yogevlavian/Desktop/The%20Nexus/web/shared/adaptive-onboarding-agent-contract.js)

## New Shell Contract

ה־new shell לא אמור להיות תלוי במסך onboarding הישן כדי להבין intake truth.

במקום זה, הוא מקבל מעטפת אחת:
- `getOnboardingIntakeEnvelope(sessionId)`

המעטפת הזו מחזירה:
- `onboardingSession`
- `projectDraft`
- `projectIntake`
- `currentStep`
- `conversationState`
- `onboardingCompletionDecision`
- `onboardingStateHandoff`
- `artifactExpectation`
- `adaptiveOnboardingAgentContract`

בנוסף היא מחזירה:
- `surfaceMode: "hidden-engine"`
- `engineRole: "bounded-intake-before-build"`

ו־`shellAnchors` מינימליים:
- `canStartBuild`
- `readinessLevel`
- `handoffStatus`
- `projectType`
- `selectedProviderId`

## Preserve / Remove / Build Truth

### Preserve
- bounded intake engine
- adaptive questioning
- readiness gate
- canonical handoff into build

### Remove
- תלות ב־`old onboarding screen` כ־truth owner
- צורך לנהל onboarding כשלב UI נפרד כדי לגשת ל־intake truth

### Build
- `hidden intake engine envelope` אחד ל־new shell
- contract ברור שמבדיל בין engine preserved לבין old visible shell

## Visible Product Boundary

ה־intake engine נשמר,
אבל ה־visible proof נשאר רק ברמה של:
- adapter truth
- onboarding render truth

לא ברמה של שימור ה־old shell כיעד מוצרי.

## Verification Evidence

Verification ממוקד שעבר:

```bash
node --test --test-name-pattern 'project service exposes onboarding intake as a hidden engine envelope for the new shell|project service creates onboarding session for a new project draft|project service resolves onboarding actions from an explicit action registry|project service blocks onboarding finish when intake is incomplete instead of crashing' test/project-service.test.js
node --test test/onboarding-adapter.test.js
node --test test/smart-onboarding-screen-render.test.js
```

## Closure Rule

`ENG-003` נחשב closed truthfully כאשר:
- onboarding/intake logic נשאר אמיתי
- hidden engine envelope אחד זמין ל־new shell
- readiness / handoff / adaptive contract נשארים ניתנים לאימות
- old onboarding screen כבר לא נדרש כ־authority layer כדי להשתמש ב־intake truth
