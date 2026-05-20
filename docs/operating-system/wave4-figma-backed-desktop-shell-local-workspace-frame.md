# Wave 4 Figma-Backed Desktop Shell And Local Workspace Frame

מטרת המסמך:
- לנעול את החוזה הקנוני של `W4-MBN-022`
- לתרגם את `W4-MBN-009`, `W4-MBN-010`, ו־`W4-MBN-021` ל־shell frame קוהרנטי אחד
- למנוע מצב שבו shell-level structure נשארת אילתור הנדסי במקום design authority מפורשת

## Contract Purpose

אחרי ש־Nexus כבר הגדירה:
- local workspace contract
- desktop shell scope contract
- Figma-backed live-build workspace contract

Wave 4 חייבת גם frame קנוני שמבהיר:
- איך shell chrome עוטף את ה־workspace
- איפה project identity, route continuity, ו־reopen state חיים
- איך local bridge / browser path / Apple handoff נכנסים לאותו shell
- איך shell מוסיפה בהירות בלי להקטין או להחליף את build surface

## Figma Artifact

The canonical Figma artifact for this task is:
- file: [Nexus Wave 4 MBN-022 Desktop Shell Frame](https://www.figma.com/design/0517zfC9FgOpBMo50bc9Mi)
- page: `W4-MBN-022 Shell Frame`
- primary board node: `1:3`

This artifact is the structural design authority for shell-level workspace framing in Wave 4 until a later canonical task truthfully supersedes it.

## Governing Inputs

This contract is derived from:
- [wave4-local-workspace-contract.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-local-workspace-contract.md)
- [wave4-desktop-shell-scope-contract.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-desktop-shell-scope-contract.md)
- [wave4-figma-backed-live-build-workspace-contract.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-figma-backed-live-build-workspace-contract.md)

## Canonical Shell Frame

The approved shell frame is:
- persistent global navigation rail
- thin project / route bar
- central workspace canvas
- supporting local-tools / release dock
- continuity / session region attached to the same shell identity

The shell surrounds the workspace.
It may not demote the live build region into a small preview or move product truth into decorative chrome.

## Region Responsibilities

### Global Navigation Rail

Owns:
- cross-product navigation
- home / files / loop surfaces
- stable shell-level controls

Must remain:
- persistent
- cross-project
- distinct from project-level workspace state

### Project / Route Bar

Owns:
- project identity
- product class
- active workspace key
- current route binding
- resume state

Must remain:
- thin
- high-signal
- continuity-aware

### Central Workspace Canvas

Owns:
- the dominant live workspace from `W4-MBN-021`
- the active build surface
- class-aware product evolution

Must remain:
- primary
- product-first
- unchanged in hierarchy by shell chrome

### Local Tools / Release Dock

Owns:
- local workspace path
- runtime handoff visibility
- release workflow mode
- bridge readiness
- provider-specific environment readiness

Must remain:
- supportive
- operationally relevant
- attached to the same project identity

### Continuity / Session Region

Owns:
- reopen state
- return-tomorrow state
- resume token / continuity anchor
- same-project return truth

Must remain:
- durable
- shell-level
- non-optional

## Allowed Shell Paths

The design contract covers three allowed shell families:
- `browser-backed-shell`
- `native-bridge-shell`
- `apple-desktop-shell`

The shell hierarchy remains the same across them.
What changes is:
- runtime handoff mode
- local-path authority
- Apple-tooling visibility
- bridge readiness state

The shell frame may evolve only through later canonical Figma-backed work.

## Continuity Rules

Any shell path must preserve:
- project identity survives reopen
- active workspace survives reopen
- route-bound workspace context survives restore
- build progression remains attached to workspace identity
- local release path remains legible when relevant

No shell frame is truthful if it breaks:
- reopen
- restore
- project return
- continuation anchor survival

## Boundary Rules

`W4-MBN-022` truthfully claims:
- one Figma-backed shell frame now exists
- shell structure is no longer left to engineering improvisation
- the current browser-backed shell and future allowed shell paths sit under one coherent frame

`W4-MBN-022` does not claim:
- Electron is implemented
- desktop wrapper is built
- shell-specific runtime bridges are complete
- the shell frame is already implemented in product code

Those belong to later implementation and verification work.

## Figma Auth Health Rule

For Figma-backed shell tasks,
authenticated access must be checked:
- at design-pass start
- before meaningful file writes
- before final canonical closure write-back

If auth fails at any checkpoint,
the task must remain blocked instead of being marked `trueGreen`.

## Closure Rule

`W4-MBN-022` is `trueGreen` only when:
- a real Figma artifact exists
- it defines one coherent desktop/local-workspace frame
- it preserves continuity and project-return truth
- it is written back canonically into Wave 4 state

It is not `trueGreen` if:
- only shell copy exists
- only obligations exist in code
- the desktop frame remains implied
- the Figma artifact is missing or inaccessible at closure time
