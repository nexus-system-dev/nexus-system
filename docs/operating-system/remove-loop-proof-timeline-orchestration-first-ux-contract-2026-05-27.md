# Remove Loop / Proof / Timeline Orchestration-First UX Contract

תאריך: `2026-05-27`  
סטטוס: `canonical shell-removal contract`  
משימה: `SHL-004`

## Purpose

להסיר מהחוויה הגלויה את ה־UX הישן שבו `loop`, `proof`, ו־`timeline` מרגישים כמו מסכי orchestration, verification matrix, handoff log, או pipeline.

החוק:

```txt
The engines stay.
The orchestration-first UX does not.
```

## Preserved Engines

נשמרים:
- loop planning and repeated continuation
- proof artifact generation and artifact readiness
- timeline / history event records
- release evidence data as internal readiness input
- learning / verification / continuity data as hidden engine truth
- adapters and tests that preserve engine contracts

מקורות:
- [loop-adapter.js](/Users/yogevlavian/Desktop/The%20Nexus/web/nexus-ui/adapters/loop-adapter.js)
- [proof-adapter.js](/Users/yogevlavian/Desktop/The%20Nexus/web/nexus-ui/adapters/proof-adapter.js)
- [timeline-adapter.js](/Users/yogevlavian/Desktop/The%20Nexus/web/nexus-ui/adapters/timeline-adapter.js)

## Removed Visible Behavior

הוסר מה־visible shell:
- `loop` as visible orchestration language
- proof handoff / checkId / release-evidence debug card
- timeline as technical matrix surface
- visible learning-system / verification-matrix / cross-surface-continuity dumps
- stepper language that presents the old setup sequence as product UX
- sidebar labels that expose `לולאה` instead of product-facing `בנייה`

## Built Replacement Behavior

במקום:
- `loop` מוצג כ־transitional Build surface
- `proof` מוצג כמוכנות תוצרית ולא כ־handoff/check log
- `timeline` מוצג כהיסטוריית מוצר משמעותית ולא כמסך telemetry / matrix

המסכים עדיין קיימים כעוגני מעבר עד `SURF-001..009`, אבל הם לא אמורים להגדיר את ה־Nexus shell הסופי.

## Preserve / Remove / Build Truth

### Preserve
- task selection / continuation intelligence
- proof artifact readiness
- release readiness data as hidden input
- event history and project continuity records

### Remove
- orchestration-first visible wording
- handoff/debug cards
- verification matrix dumps
- technical timeline framing

### Build
- product-facing Build / readiness / history framing
- guard test preventing the old orchestration panels from returning

## Verification Evidence

```bash
node --test test/legacy-orchestration-first-ux-removal.test.js test/legacy-frontend-decomposition-map.test.js
node --test test/loop-core-screen-render.test.js test/proof-result-screen-render.test.js test/timeline-history-screen-render.test.js test/onboarding-loop-continuation.test.js test/execution-live-screen-render.test.js
node --test test/proof-adapter.test.js test/timeline-adapter.test.js test/execution-adapter.test.js
node --check web/app.js
node --check web/nexus-ui/screens/LoopCoreScreen.js
node --check web/nexus-ui/screens/ProofResultScreen.js
node --check web/nexus-ui/screens/TimelineHistoryScreen.js
node --check web/nexus-ui/screens/QaFallbackScreen.js
node --check web/nexus-ui/adapters/loop-adapter.js
```

Live fallback result:
- route: `/timeline`
- `appScreen: "qa"`
- `shellRoute: "timeline"`
- no visible banned orchestration strings:
  - `Wave 4 live verification matrix`
  - `Canonical learning system`
  - `Deep learning decision impact`
  - `Cross-surface continuity`
  - `Release evidence and handoff`
  - `Handoff step`
  - `Open blocker`
  - `runtime האמיתי`
  - `proof backend`
- visible fallback now says: `בנייה`, `היסטוריה`, `תצוגה בטוחה בלי פרויקט פעיל`

## Boundary

`SHL-004` לא סוגר את `Build`, `History`, או `Release` הסופיים.

הוא סוגר רק את הסרת ה־old orchestration-first UX מהמסכים המשמשים כרגע כעוגני מעבר.

ה־surface architecture הסופי שייך ל:
- `SURF-001`
- `SURF-003`
- `SURF-006`
- `SURF-009`

## Closure Rule

`SHL-004` נחשב closed truthfully כאשר:
- loop/proof/timeline engines remain testable
- visible Loop no longer speaks as orchestration-first route
- visible Proof no longer exposes handoff / release evidence internals as UI
- visible Timeline no longer exposes learning / verification / continuity matrices
- tests prevent regression of the removed visible UX
