# Remove Onboarding Standalone Visible Route Contract

תאריך: `2026-05-27`  
סטטוס: `canonical shell-removal contract`  
משימה: `SHL-002`

## Purpose

להסיר את `onboarding` כמסך / route גלוי עצמאי ב־Nexus החדש,
בלי למחוק את מנוע ה־onboarding intake.

החוק:

```txt
Onboarding נשאר engine.
Onboarding לא נשאר destination.
```

## Preserved Engine

נשמרים:
- onboarding API endpoints
- onboarding service
- provider-backed conversation runtime
- onboarding intake envelope
- onboarding completion / handoff contracts
- SmartOnboarding renderer as internal/reusable component
- onboarding tests for engine truth

מקורות:
- [project-service.js](/Users/yogevlavian/Desktop/The%20Nexus/src/core/project-service.js)
- [onboarding-service.js](/Users/yogevlavian/Desktop/The%20Nexus/src/core/onboarding-service.js)
- [onboarding-adapter.js](/Users/yogevlavian/Desktop/The%20Nexus/web/nexus-ui/adapters/onboarding-adapter.js)
- [SmartOnboardingScreen.js](/Users/yogevlavian/Desktop/The%20Nexus/web/nexus-ui/screens/SmartOnboardingScreen.js)

## Removed Visible Behavior

הוסר:
- `onboarding` מתוך `PRIMARY_LOOP_ROUTES`
- `/onboarding` מתוך `shellRoutePathMap`
- onboarding מתוך sidebar navigation
- onboarding מתוך QA route sequence
- visible screen switching ל־`setAppScreen("onboarding")`
- browser route sync ל־`/onboarding`
- visible links ו־targets ל־`/onboarding`

## Built Replacement Behavior

במקום route גלוי:
- ה־front door (`create`) מחזיק את התחלת ההקשר
- onboarding session נוצר ונשמר ברקע
- intake state יכול להמשיך דרך hidden engine
- פעולות שמנסות לחזור ל־onboarding מופנות ל־`create`
- `understanding` נשאר השלב הבא עד `SHL-003`

## Preserve / Remove / Build Truth

### Preserve
- bounded intake
- adaptive questions
- provider runtime
- intake/handoff truth

### Remove
- standalone `/onboarding`
- onboarding as visible route destination
- onboarding as visible QA screen
- onboarding sidebar/tab navigation

### Build
- `create` as temporary front-door holder for intake context
- static guard test preventing visible `/onboarding` links from returning

## Verification Evidence

```bash
node --test test/onboarding-standalone-route-removal.test.js test/legacy-frontend-decomposition-map.test.js
node --test test/project-create-screen-render.test.js test/smart-onboarding-screen-render.test.js test/loop-core-screen-render.test.js test/execution-live-screen-render.test.js
node --check web/app.js
node --test --test-name-pattern 'project service exposes onboarding intake as a hidden engine envelope for the new shell|onboarding adapter exposes adaptive intake progress and contract truth|onboarding conversation creates adaptive transcript and summary' test/project-service.test.js test/onboarding-adapter.test.js test/onboarding-service-conversation.test.js
node -e "Playwright live route check for http://127.0.0.1:4011/onboarding"
```

Live route result:
- `path: "/onboarding"`
- `appScreen: "create"`
- `shellRoute: "create"`
- `hasOnboardingLink: false`
- `visibleOnboarding: false`

## Known Verification Note

`test/web-app-wave1-cockpit.test.js` was attempted and currently fails before this route-removal behavior is reached because its fake document lacks `doc.createElement`, which is required by the existing companion host setup.

This is not accepted as `SHL-002` closure evidence, and it is not treated as proof of failure for this task because:
- focused route-removal tests pass
- visible render tests pass
- onboarding hidden-engine tests pass
- `web/app.js` syntax check passes

## Closure Rule

`SHL-002` נחשב closed truthfully כאשר:
- `/onboarding` לא קיים כ־visible shell route
- navigation / sidebars / QA nav no longer expose onboarding
- calls to onboarding as target no longer create a visible onboarding route
- onboarding engine remains available internally
- tests prevent visible route regression
