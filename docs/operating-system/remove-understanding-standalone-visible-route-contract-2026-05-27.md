# Remove Understanding Standalone Visible Route Contract

תאריך: `2026-05-27`  
סטטוס: `canonical shell-removal contract`  
משימה: `SHL-003`

## Purpose

להסיר את `understanding` כמסך / route גלוי עצמאי ב־Nexus החדש,
בלי למחוק את מנוע interpretation / artifact expectation.

החוק:

```txt
Understanding נשאר engine.
Understanding לא נשאר destination.
```

## Preserved Engine

נשמרים:
- understanding adapter
- artifact expectation preview
- generation intent preview
- onboarding completion / handoff truth
- companion correction flow
- UnderstandingSummary renderer as internal/reusable component
- engine tests for product understanding truth

מקורות:
- [understanding-adapter.js](/Users/yogevlavian/Desktop/The%20Nexus/web/nexus-ui/adapters/understanding-adapter.js)
- [UnderstandingSummaryScreen.js](/Users/yogevlavian/Desktop/The%20Nexus/web/nexus-ui/screens/UnderstandingSummaryScreen.js)
- [onboarding-service.js](/Users/yogevlavian/Desktop/The%20Nexus/src/core/onboarding-service.js)

## Removed Visible Behavior

הוסר:
- `understanding` מתוך `PRIMARY_LOOP_ROUTES`
- `/understanding` כמיפוי route גלוי
- browser route sync ל־`/understanding`
- `renderShellChrome("understanding")`
- `setAppScreen("understanding")`
- `persistFlowState("understanding")`
- visible links / QA nav targets ל־`understanding`
- legacy restore שמחזיר את המשתמש למסך understanding עצמאי

## Built Replacement Behavior

במקום route גלוי:
- `create` מחזיק intake / correction כאשר אין project פעיל
- `loop` מחזיק את truth הפעיל כאשר יש project פעיל
- legacy stored `screen=understanding` משוחזר ל־`loop` או `create`
- correction מתוך understanding truth ממשיך דרך companion / current shell route
- component ה־Understanding יכול להישאר פנימי, אבל לא קובע route עצמאי

## Preserve / Remove / Build Truth

### Preserve
- intent interpretation
- artifact expectation
- generation intent
- project understanding correction
- product understanding tests

### Remove
- standalone `/understanding`
- understanding as visible route destination
- understanding as QA route
- persistence של `understanding` כמסך פעיל

### Build
- route migration to `loop` / `create`
- static guard test preventing visible `/understanding` regression
- updated continuation expectations: return-to-intake target is `create`, not legacy route

## Verification Evidence

```bash
node --test test/understanding-standalone-route-removal.test.js test/legacy-frontend-decomposition-map.test.js
node --test test/understanding-summary-screen-render.test.js test/onboarding-loop-continuation.test.js test/loop-core-screen-render.test.js test/execution-live-screen-render.test.js
node --check web/app.js
node --test --test-name-pattern 'project companion correction updates the onboarding session truth and returns refreshed understanding|conversation project-class answer overrides stale landing-page intake and keeps product understanding open|understanding summary screen renders learning-aware generation card when present' test/project-service-companion-correction.test.js test/onboarding-service-conversation.test.js test/understanding-summary-screen-render.test.js
```

Live route result:
- `path: "/understanding"`
- `appScreen: "create"`
- `shellRoute: "create"`
- `hasUnderstandingLink: false`
- `visibleUnderstanding: false`

Known live note:
- the page body showed a bootstrap 404 message during live load, but the shell route truth still migrated away from `understanding` and did not expose a visible `/understanding` route.

## Closure Rule

`SHL-003` נחשב closed truthfully כאשר:
- `/understanding` לא קיים כ־visible shell route
- navigation / sidebars / QA nav no longer expose understanding
- legacy restore does not leave `understanding` as active screen
- interpretation / artifact expectation engine remains available internally
- tests prevent visible route regression
