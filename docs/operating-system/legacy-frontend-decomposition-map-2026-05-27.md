# Legacy Frontend Decomposition Map

תאריך: `2026-05-27`  
סטטוס: `canonical shell-removal map`  
משימה: `SHL-001`

## Purpose

לנעול את פירוק ה־frontend הישן לפני שמסירים routes גלויים.

המטרה היא לא למחוק מנועים, אלא להפריד בין:
- מה נשמר כמנוע פנימי
- מה יורד מהחוויה הגלויה
- מה מוחלף במשטחי Nexus החדשים
- מה עובר migration למשטח חדש

מקור קוד ניתן לבדיקה:
- [legacy-decomposition.js](/Users/yogevlavian/Desktop/The%20Nexus/web/nexus-ui/routes/legacy-decomposition.js)

## Canonical Actions

כל route/section קיים חייב להיות מסומן כאחד מ:
- `preserve hidden`
- `remove visible`
- `replace`
- `migrate`

## Route / Section Map

| Route / Section | Action | New Surface | Preserved Engine | Visible Removal |
| --- | --- | --- | --- | --- |
| `create` | `replace` | `Home` | project creation and project-service intake truth | old create screen stops being the product entry point |
| `onboarding` | `remove visible` | `Home / Build` | onboarding intake hidden engine | standalone onboarding route |
| `understanding` | `remove visible` | `Build` | intent interpretation and artifact expectation | standalone understanding summary route |
| `loop` | `remove visible` | `Build` | loop planning and repeated continuation | orchestration-first loop route |
| `execution` | `migrate` | `Build` | runtime, build, packaging, and release contracts | execution route as separate DevOps-style shell |
| `proof` | `remove visible` | `Build / History` | artifact proof generation engine | standalone proof route |
| `artifact` | `migrate` | `Build / Share / History` | artifact preview and export capability | artifact as proof-step destination |
| `confirmation` | `migrate` | `Build` | approval and human-in-the-loop decision gates | ceremonial confirmation screen |
| `state-update` | `migrate` | `History` | mutation state update and continuity records | state-update as standalone route |
| `next-task` | `migrate` | `Build / Growth` | next-task and continuation intelligence | task queue as primary UX |
| `timeline` | `remove visible` | `History` | event history, snapshots, and change explanation | technical timeline route |
| `home` | `replace` | `Home` | project continuity and return destination | support dashboard home |
| `files` | `migrate` | `Build / Share / Studio` | asset and file support | files as disconnected support route |
| `notifications` | `migrate` | `Home / History` | contextual owner alerts | notification center as default surface |
| `settings` | `migrate` | `Studio / Org` | profile, provider, permission, and environment settings | settings as broad product control center |
| `integrations` | `migrate` | `Studio / Org` | scoped external capability bindings | integration marketplace-style route |
| `help` | `replace` | `Home` | support copy and recovery guidance | help route as product surface |
| `qa` | `preserve hidden` | `Internal QA` | fallback route diagnostics and test harness | QA route from user-facing navigation |
| `workspace` | `replace` | `Build` | workspace layout shell primitives | workspace as ambiguous catch-all route |
| `advanced` | `preserve hidden` | `Studio / Org` | advanced capability boundary | advanced route from v1 default UX |
| `developer` | `preserve hidden` | `Studio` | developer diagnostics and local execution bridge | developer route from normal builder UX |
| `brain` | `preserve hidden` | `Internal engine` | memory and product graph intelligence | brain route from visible product |
| `release` | `migrate` | `Release` | release readiness and deployment contracts | release as advanced side route |
| `growth` | `migrate` | `Growth` | growth intelligence after product truth exists | growth as advanced side route |

## Preserve / Remove / Build Truth

### Preserve Engine

נשמרים:
- project service truth
- onboarding intake
- understanding / intent interpretation
- loop planning
- artifact proof generation
- runtime/build/release contracts
- continuity/memory/refresh
- approval gates
- history/snapshot truth
- QA diagnostics as internal-only

### Remove Visible Shell

יורדים מהחוויה הגלויה:
- standalone onboarding
- standalone understanding
- loop as orchestration UX
- proof as standalone truth route
- technical timeline
- QA route from normal navigation
- orchestration language as user-facing framing

### Build New Surface Targets

היעדים החדשים:
- `Home`
- `Build`
- `Release`
- `Growth`
- `History`
- `Share`
- `Studio`

## Closure Rule

`SHL-001` נחשב closed truthfully כאשר:
- כל route ב־`web/nexus-ui/routes/index.js` מכוסה
- כל `screen-*` ב־`web/index.html` מכוסה
- כל entry מסומן באחת מארבע הפעולות הקנוניות
- יש בדיקה שמונעת route/section חדש בלי decomposition
- `SHL-002..005` יכולים להתחיל בלי לנחש מה להסיר

## Verification Evidence

```bash
node --test test/legacy-frontend-decomposition-map.test.js
```
