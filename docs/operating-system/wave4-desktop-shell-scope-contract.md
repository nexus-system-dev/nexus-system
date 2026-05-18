# Wave 4 Desktop Shell Scope Contract

מטרת המסמך:
- לנעול את החוזה הקנוני של `W4-MBN-010`
- להגדיר את scope והחובות של desktop shell ב־Wave 4
- למנוע מצב שבו shell נשאר implied במקום להיות boundary מפורש

## Contract Purpose

אחרי ש־`W4-MBN-009` נעלה `local workspace truth`,
Wave 4 חייבת גם להגדיר מה desktop shell כן ולא חייב לעשות.

החוזה הזה לא טוען ש־Electron כבר נבנה.
הוא כן טוען ש־desktop shell הוא boundary לא־אופציונלי עם obligations ברורות.

## Canonical Output

החוזה הקנוני חייב להגדיר:
- `shellFamily`
- `shellStatus`
- `requiredFrame`
- `shellPathDecision`
- `runtimeBindings`
- `obligations`
- `boundaries`

## Shell Truth

Wave 4 חייבת להחזיק shell scope שמבהיר:
- איך workspace continuity נשמרת בתוך shell
- איך build route נשארת מחוברת ל־project identity
- איך local bridge / remote Apple tooling / cloud workspace משתלבים
- מהו path הראוי ל־desktop wrapper עתידי

## Truth Boundary

`W4-MBN-010` כן טוענת:
- desktop shell scope is explicit
- shell obligations are non-optional
- browser-backed workspace is accepted as the current Wave 4 shell path
- future Electron or desktop wrapper direction is explicit

`W4-MBN-010` לא טוענת:
- Electron implementation already exists
- desktop shell visuals are already designed
- shell frame is already finalized

הדברים האלה שייכים ל־`W4-MBN-022` ולמשימות implementation עתידיות.

## Governing Implementation

The governing implementation for this contract is:
- `src/core/desktop-shell-scope-contract.js`

The canonical write-through points are:
- `src/core/context-builder.js`
- `web/nexus-ui/adapters/execution-adapter.js`
- `web/nexus-ui/screens/ExecutionLiveScreen.js`

## Truth Rules

`W4-MBN-010` is not truthful if:
- desktop shell remains a vague future idea
- local bridge / remote Apple / browser-backed shell paths are not differentiated
- shell obligations are not tied to workspace continuity

`W4-MBN-010` is truthful when:
- one canonical shell scope contract exists
- shell obligations are explicit
- the execution surface can display shell path and shell boundary truth
- the contract cleanly separates scope definition from later design and implementation
