# Wave 4 Local Workspace Contract

מטרת המסמך:
- לנעול את החוזה הקנוני של `W4-MBN-009`
- להגדיר מה Nexus כבר חייבת להחזיק כ־`local workspace truth`
- למנוע מצב שבו `desktop later` נשארת סיסמה בלי חוזה Wave 4 מפורש

## Contract Purpose

`Minimum Believable Nexus` לא יכולה להישאר רק session web חולף.

אחרי ש־split workspace, build progression, ו־class-aware generation קיימים,
Nexus חייבת להגדיר גם `local workspace contract` שאומר:
- איך פרויקט מזוהה כ־workspace מתמשך
- איך reopen / restore ממשיכים מאותו project identity
- איך ה־build נשאר מחובר לאותו workspace
- איפה הגבול בין local workspace truth לבין Electron shell truth

## Canonical Output

החוזה הקנוני חייב להגדיר:
- `workspaceMode`
- `desktopShellStatus`
- `identity`
- `continuity`
- `localAwareness`
- `visibleProof`
- `boundaries`

## Truth Boundary

`W4-MBN-009` כן טוענת:
- project identity survives reopen
- active workspace survives reopen
- route-bound workspace context survives restore
- build progression remains attached to workspace identity
- Nexus already behaves as a browser-backed local workspace

`W4-MBN-009` לא טוענת:
- Electron shell already exists
- OS-level filesystem authority already exists
- desktop packaging is already complete

הדברים האלה שייכים ל־`W4-MBN-010` והלאה.

## Governing Implementation

The governing implementation for this contract is:
- `src/core/local-workspace-contract.js`

The canonical write-through points are:
- `src/core/context-builder.js`
- `web/nexus-ui/adapters/execution-adapter.js`
- `web/nexus-ui/screens/ExecutionLiveScreen.js`

## Truth Rules

`W4-MBN-009` is not truthful if:
- workspace continuity still exists only as scattered flow-state behavior
- reopen identity is implied but not contracted
- desktop is mentioned as future intent without a current local workspace contract

`W4-MBN-009` is truthful when:
- one canonical local workspace contract exists
- the contract makes reopen/resume identity explicit
- the execution surface can display local workspace truth
- the contract explicitly separates browser-backed workspace truth from future Electron truth
