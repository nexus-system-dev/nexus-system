# Nexus Studio V1 Screen And Workspace Map

Date: `2026-06-02`
Task: `STD-SCREENS-001`
Status: `canonical screen/workspace contract created`
Depends on: `STD-VISION-001`
Visual artifact: `https://www.figma.com/design/PayxllrD8TrZdg3FIASn4g`

## Purpose

This document maps every Nexus Studio V1 screen from the canonical visual vision into implementation-ready product contracts.

It does not implement Studio.

It defines:

- purpose
- user action
- visible regions
- buttons
- truth engine
- responsible agent
- permission boundary
- sync impact
- failure behavior
- V1 implementation boundary

Core law:

```txt
Every Studio screen must connect the visible face, the deciding agent, and the truth engine behind it.
```

## Global Shell Contract

Every project-bound Studio V1 screen uses the same shell unless explicitly noted.

Persistent regions:

1. Product center
2. Nexus local side panel
3. Bottom truth/status bar

Persistent top action:

```txt
חזור ל־Web
```

The shell must always expose:

- current project
- cloud connection state
- local state
- sync state
- running/stopped state
- permission state
- next safe action
- what can return to Web

The shell must not open with:

- full file tree
- terminal
- raw logs
- package list
- generic developer dashboard
- empty technical screen

## Global Truth Engines

Studio V1 depends on these truth engines:

- `Product Graph / Project Truth Engine`
- `Project Opening Package Engine`
- `Local App Storage Engine`
- `Folder Permission Engine`
- `Local Runtime Command Engine`
- `Local Evidence Engine`
- `Sync Engine`
- `Mutation / Change Engine`
- `History / Continuity Engine`
- `Release Candidate / Package Engine`
- `Web Release Gate`
- `Secrets Redaction Engine`

Studio may render and prepare local candidate state.

Studio may not silently mint canonical cloud truth.

## Global Agent Owners

Studio V1 depends on these agent roles:

- `Studio Local Agent`
- `Mutation / Change Agent`
- `History / Continuity Agent`
- `Verification Agent`
- `Release Agent`
- `Product Graph / Build Agent handoff owner`

User-facing copy may call the side agent `נקסוס`.

Internally, project-bound local explanation and local action guidance belong to `Studio Local Agent`.

## Global Permission Rule

Studio V1 actions are grouped by permission:

- folder access
- read
- write
- run
- secrets
- install
- sync
- package
- release handoff

Locked actions remain visible when relevant, but disabled with:

- lock indicator
- reason
- unlock action

## Global Sync Rule

Sync is not folder mirroring.

Sync is explicit candidate/evidence replay into Nexus truth.

Pre-sync order is:

1. product meaning
2. files
3. tests/evidence

## Global Failure Rule

Every failure state must show:

1. what happened
2. why it matters
3. what can be done now
4. technical detail only after expansion

No screen may expose secrets, tokens, environment values, sensitive paths, private file contents, or raw provider credentials.

## Screen 1 — Studio Opening

Figma frame:

```txt
01 Studio Opening
```

### Purpose

Start Studio as a Mac desktop app and orient the user around the project, not around tooling.

### User Action

The user opens a recent project, opens a project passed from Web, or starts in limited local mode.

### Visible Regions

- Mac app shell
- top connection tag
- first project card
- recent project list
- missing permission cards when relevant
- basic Web connection state

### Buttons

- `פתח פרויקט`
- `חבר פרויקט`
- `פתח פרויקט מקומי`
- `חזור ל־Web` only when opened from Web
- `הגדרות`

### Truth Engine

- `Product Graph / Project Truth Engine`
- `Project Opening Package Engine`
- `Local App Storage Engine`

### Responsible Agent

- `Studio Local Agent`

### Permissions

No folder write, run, secrets, package, or sync permission is assumed.

Opening from cached local state may be read-only until cloud identity and project binding are confirmed.

### Sync Impact

No sync occurs on this screen.

The screen may display unsynced local work from `Local App Storage Engine`.

### Failure Behavior

If cloud connection is missing:

- show local recent projects if available
- label state as local/limited
- do not imply canonical truth is current

If project package cannot load:

- show `פתיחה נכשלה`
- offer retry, read-only local view, or return to Web

### Implementation Boundary

V1 Mac/Electron only.

No Windows-specific UX.

No full file browser as opening screen.

## Screen 2 — Web Project Opening Confirmation

Figma frame:

```txt
02 Web Project Opening Confirmation
```

### Purpose

Make Web-to-Studio handoff visible, intentional, and local-safe.

### User Action

The user confirms opening a Web project in Nexus Studio.

### Visible Regions

- confirmation panel
- project name
- connection state
- opening package summary
- required permission summary
- what remains in Web
- what Studio receives

### Buttons

- `פתח פרויקט`
- `בטל וחזור ל־Web`
- `ראה מה Studio יקבל`
- `בחר תיקייה` only if folder binding is required

### Truth Engine

- `Project Opening Package Engine`
- `Product Graph / Project Truth Engine`
- `Folder Permission Engine`

### Responsible Agent

- `Studio Local Agent`

### Permissions

Opening package read is allowed through Web handoff.

Folder binding requires explicit user approval.

Write/run/secrets/install permissions are not granted here unless requested through their own cards.

### Sync Impact

No local changes are synced.

The opening package establishes a local working snapshot and revision pointer.

### Failure Behavior

If project identity mismatches:

- stop opening
- show project mismatch
- offer return to Web or reconnect

If folder permission is missing:

- proceed only as read-only if safe
- otherwise require `בחר תיקייה`

### Implementation Boundary

This is not the Web `/studio` route.

It is the first local Studio desktop confirmation after handoff.

## Screen 3 — Main Project Workspace

Figma frame:

```txt
03 Main Project Workspace — Deep Locked Frame
```

### Purpose

Show the product-first local workspace and the next correct local action.

### User Action

The user runs locally, opens preview, checks, syncs, reviews changes, or asks Nexus for local guidance.

### Visible Regions

- product center
- product summary
- sync labels
- next action card
- relevant file cards
- run/preview/check status
- Nexus Local Agent side panel
- bottom truth/status bar

### Buttons

- `הרץ מקומית`
- `פתח תצוגה`
- `בדוק`
- `סנכרן`
- `ראה שינויים`
- `עצור`
- `חזור ל־Web`

### Truth Engine

- `Product Graph / Project Truth Engine`
- `Local Runtime Command Engine`
- `Local Evidence Engine`
- `Local App Storage Engine`
- `Sync Engine`

### Responsible Agent

- `Studio Local Agent`
- `Verification Agent` when checking is requested
- `Mutation / Change Agent` when local change may affect product truth

### Permissions

Run requires run permission.

Preview may require read/run permission.

Write requires explicit write permission.

Sync requires sync permission and pre-sync review if local changes exist.

### Sync Impact

Healthy state may be fully synced or have pending local changes.

Any sync action must route through the pre-sync screen.

### Failure Behavior

If run fails:

- route to Error / Debug State

If local folder is missing:

- route to Permissions or Read-Only Mode

If cloud revision changed:

- route to Cloud Conflict before sync

### Implementation Boundary

No terminal-first mode in V1.

Relevant files are product-meaning cards, not full file tree by default.

## Screen 4 — Error / Debug State

Figma frame:

```txt
04 Error / Debug State — Deep Locked Frame
```

### Purpose

Explain local run/build/debug failures without exposing sensitive machine details.

### User Action

The user reads the explanation, opens filtered detail, approves a fix proposal, retries, or returns to the workspace.

### Visible Regions

- failure summary
- why it matters
- proposed fix
- filtered technical detail
- safe retry action
- Nexus explanation thread
- bottom high-attention status

### Buttons

- `הצע תיקון`
- `נסה שוב`
- `פתח פירוט טכני`
- `בטל`
- `חזור לסביבת הפרויקט`

### Truth Engine

- `Local Runtime Command Engine`
- `Local Evidence Engine`
- `Secrets Redaction Engine`
- `Mutation / Change Engine`
- `Folder Permission Engine`

### Responsible Agent

- `Studio Local Agent`
- `Mutation / Change Agent`
- `Verification Agent`

### Permissions

Reading filtered logs is allowed.

Installing dependencies, writing fixes, changing commands, or editing project files requires explicit approval.

Secrets are never displayed or synced.

### Sync Impact

Failure evidence may be stored locally.

Fix proposals are candidates, not product truth.

Accepted fixes route to pre-sync review before cloud acceptance.

### Failure Behavior

If logs include sensitive data:

- redact
- show `מידע רגיש הוסתר`

If fix classification is unclear:

- ask for approval or route to Mutation Agent

### Implementation Boundary

V1 debug is a workspace state, not a separate heavy debugger product.

No raw logs first.

## Screen 5 — Preview Before Sync

Figma frame:

```txt
05 Preview Before Sync — Deep Locked Frame
```

### Purpose

Let the user understand what local work will change before anything returns to cloud truth.

### User Action

The user reviews meaning, files, tests/evidence, then syncs, keeps local, cancels, or opens detail.

### Visible Regions

- product meaning summary
- affected screens/flows
- affected files
- evidence/test results
- approvals required
- conflict warnings
- local-only remainder

### Buttons

- `סנכרן`
- `השאר מקומי`
- `בטל`
- `פתח פירוט`
- `ראה קבצים`
- `ראה ראיות`

### Truth Engine

- `Sync Engine`
- `Mutation / Change Engine`
- `Local Evidence Engine`
- `History / Continuity Engine`
- `Product Graph / Project Truth Engine`

### Responsible Agent

- `Studio Local Agent`
- `Mutation / Change Agent`
- `History / Continuity Agent`

### Permissions

Sync permission required.

Product-truth changes require Mutation Agent approval path.

Writing to cloud history requires accepted sync.

### Sync Impact

This screen is the sync gate.

It returns:

- candidate changes
- product meaning
- evidence
- tests
- restore point
- local-only remainder

### Failure Behavior

If tests fail:

- block sync unless user explicitly chooses a safe non-release evidence sync path

If cloud revision changed:

- route to Cloud Conflict

If permission missing:

- show locked sync action and route to Permissions

### Implementation Boundary

No automatic sync.

No file-list-only sync.

No silent cloud overwrite.

## Screen 6 — Cloud Conflict

Figma frame:

```txt
06 Cloud Conflict — Deep Locked Frame
```

### Purpose

Resolve cloud/local divergence safely.

### User Action

The user chooses merge, keep local as draft, accept cloud, or open detailed comparison.

### Visible Regions

- guided Nexus explanation
- cloud change summary
- local change summary
- conflict area
- safe options
- optional detailed compare

### Buttons

- `מזג בזהירות`
- `שמור מקומי כטיוטה`
- `קבל ענן`
- `פתח השוואה`
- `בטל סנכרון`

### Truth Engine

- `Sync Engine`
- `Product Graph / Project Truth Engine`
- `History / Continuity Engine`
- `Local App Storage Engine`

### Responsible Agent

- `Studio Local Agent`
- `Mutation / Change Agent`
- `History / Continuity Agent`

### Permissions

Merge/sync requires sync permission.

Accepting cloud may discard local candidate changes only after explicit user approval.

Saving local as draft uses local app storage, not cloud truth.

### Sync Impact

No sync occurs until the user chooses a conflict path.

Merged changes become candidates and still pass pre-sync review if product truth changes.

### Failure Behavior

If conflict cannot be merged safely:

- block merge
- offer draft preservation or return to Web

If cloud is unavailable:

- preserve local draft
- mark sync pending

### Implementation Boundary

No automatic conflict resolution in V1.

Detailed comparison is secondary, not default first view.

## Screen 7 — Permissions

Figma frame:

```txt
07 Permissions — Deep Locked Frame
```

### Purpose

Make local access explicit, understandable, revocable, and scoped to the project.

### User Action

The user grants, reviews, revokes, or leaves permissions locked.

### Visible Regions

Permission cards:

- folder
- read
- write
- run
- secrets
- install
- sync

Each card shows:

- why it is needed
- what it enables
- risk
- active/locked state
- revoke/unlock action

### Buttons

- `בחר תיקייה לפרויקט הזה`
- `בטל גישה לתיקייה`
- `אפשר קריאה`
- `אפשר כתיבה`
- `אפשר הרצה`
- `חבר סודות מקומיים`
- `אשר התקנה`
- `אפשר סנכרון`

### Truth Engine

- `Folder Permission Engine`
- `Secrets Redaction Engine`
- `Local App Storage Engine`
- `Sync Engine`

### Responsible Agent

- `Studio Local Agent`

### Permissions

This screen owns permission visibility, not all permission decisions.

Dangerous permissions require action-specific confirmation.

Secrets are local-run-only and never enter logs, evidence, sync, or cloud history.

### Sync Impact

Permission changes may be recorded as local/security events.

They do not change product truth unless the permission enables a later approved action.

### Failure Behavior

If folder missing/moved/mismatched:

- stop
- offer reconnect, read-only mode, or return to Web

If permission revoked:

- lock dependent actions immediately

### Implementation Boundary

No broad filesystem access.

No implied write/run/install permission.

No legalistic permission wall as the primary UX.

## Screen 8 — Read-Only Mode

Figma frame:

```txt
08 Read-Only Mode
```

### Purpose

Allow safe project understanding when local permissions are missing or revoked.

### User Action

The user reviews project context, sees locked actions, grants permission, or returns to Web.

### Visible Regions

- normal product workspace shell
- read-only status label
- locked action row
- relevant project context
- Nexus Local Agent explanation
- bottom truth/status bar

### Buttons

- `תן גישה`
- `חזור ל־Web`
- `פתח הגדרות`
- locked `הרץ מקומית`
- locked `כתוב לקבצים`
- locked `סנכרן`
- locked `ארוז`

### Truth Engine

- `Product Graph / Project Truth Engine`
- `Local App Storage Engine`
- `Folder Permission Engine`

### Responsible Agent

- `Studio Local Agent`

### Permissions

Read-only mode may use cloud/package data and local cached data.

No writes, runs, installs, secrets, packages, or syncs occur.

### Sync Impact

No sync.

Unsynced local drafts may be displayed but cannot be pushed without permission.

### Failure Behavior

If even read context is unavailable:

- show unavailable state
- offer reconnect or return to Web

### Implementation Boundary

Read-only is a state inside the workspace, not a separate dead-end screen.

## Screen 9 — Local Recovery

Figma frame:

```txt
09 Local Recovery
```

### Purpose

Recover unsynced local work safely after Studio closes, crashes, or resumes offline work.

### User Action

The user reviews what was saved, continues locally, syncs, or discards local changes.

### Visible Regions

- unsynced work summary
- local checkpoint list
- evidence summary
- affected product areas
- recovery options
- risk warning when relevant

### Buttons

- `ראה מה נשמר`
- `המשך מאיפה שהפסקתי`
- `סנכרן עכשיו`
- `בטל שינויים מקומיים`
- `פתח כטיוטה מקומית`

### Truth Engine

- `Local App Storage Engine`
- `History / Continuity Engine`
- `Sync Engine`
- `Local Evidence Engine`

### Responsible Agent

- `Studio Local Agent`
- `History / Continuity Agent`

### Permissions

Continuing local work may require folder/read/write/run permissions depending on action.

Sync requires sync permission and pre-sync review.

Discard requires explicit user approval.

### Sync Impact

Recovery does not automatically sync.

Recovered work remains local until pre-sync review passes.

### Failure Behavior

If checkpoint is corrupt:

- show safe failure
- preserve any recoverable evidence
- do not claim recovery succeeded

If cloud changed meanwhile:

- route to Cloud Conflict before sync

### Implementation Boundary

No automatic discard.

No immediate sync as the primary first action.

Primary action is `ראה מה נשמר`.

## Screen 10 — Package / Release Candidate

Figma frame:

```txt
10 Package / Release Candidate — Deep Locked Frame
```

### Purpose

Create and explain a local package candidate without pretending it is a release.

### User Action

The user reviews what was packaged, opens evidence, and hands the candidate to Web Release.

### Visible Regions

- release-candidate card
- package contents
- version/candidate label
- tests passed/failed
- files included
- local-only remainder
- evidence summary
- Web Release handoff state

### Buttons

- `העבר ל־Release`
- `פתח ראיות`
- `ארוז מחדש`
- `בטל מועמד`
- `חזור לסביבת הפרויקט`

### Truth Engine

- `Release Candidate / Package Engine`
- `Local Evidence Engine`
- `Verification Agent / QA Engine`
- `Web Release Gate`
- `Sync Engine`

### Responsible Agent

- `Studio Local Agent`
- `Verification Agent`
- `Release Agent`

### Permissions

Packaging requires package permission.

Packaging must be blocked if unapproved local changes exist.

Release handoff requires sync/release gate eligibility.

### Sync Impact

Package candidate may sync as evidence/candidate metadata.

Actual release remains owned by Web Release.

### Failure Behavior

If package fails:

- show human explanation
- show filtered detail
- preserve evidence
- offer retry or return to debug

If unapproved changes exist:

- block packaging
- route to Preview Before Sync

### Implementation Boundary

Studio does not deploy or release in V1.

Studio packages a candidate only.

## Screen 11 — Basic Studio Settings

Figma frame:

```txt
11 Basic Studio Settings
```

### Purpose

Expose Studio's basic local trust configuration without becoming a technical control panel.

### User Action

The user reviews Web connection, local permissions, local storage, and platform scope.

### Visible Regions

- Web connection card
- local permissions card
- local storage card
- platform scope card
- project bindings
- revoke/clear controls

### Buttons

- `נתק מ־Web`
- `חבר מחדש`
- `נהל הרשאות`
- `נקה cache מקומי`
- `פתח תיקיית אפליקציה`
- `בטל גישה לתיקייה`

### Truth Engine

- `Local App Storage Engine`
- `Folder Permission Engine`
- `Project Opening Package Engine`
- `Product Graph / Project Truth Engine`

### Responsible Agent

- `Studio Local Agent`

### Permissions

Revocation actions require explicit confirmation.

Clearing local cache must not delete approved project files.

### Sync Impact

Settings can affect future sync eligibility.

Settings do not sync product changes by themselves.

### Failure Behavior

If disconnect happens with unsynced work:

- block silent disconnect
- route to Local Recovery or Preview Before Sync

### Implementation Boundary

No Windows settings in V1.

No Tauri/native switcher.

No low-level runtime configuration UI by default.

## Cross-Screen State Coverage

Required state coverage:

- empty: Studio Opening, Main Project Workspace
- loading: Studio Opening, Web Project Opening Confirmation, Main Project Workspace
- error: Error / Debug State, Package / Release Candidate, Cloud Conflict
- locked: Permissions, Read-Only Mode, Main Project Workspace
- conflict: Cloud Conflict, Preview Before Sync
- no-permission: Permissions, Read-Only Mode
- unsynced: Preview Before Sync, Local Recovery, Main Project Workspace
- read-only: Read-Only Mode

## V1 Boundaries

Studio V1 includes:

- Mac-only desktop application scope
- Electron-first shell direction
- Web handoff
- bounded opening package
- product-first workspace
- Studio Local Agent panel
- relevant-files cards
- local run through project commands
- filtered debug/error state
- pre-sync product-meaning review
- cloud conflict state
- permission cards
- read-only mode
- local recovery
- package candidate
- settings baseline

Studio V1 excludes:

- Windows implementation
- Tauri/native Mac implementation
- full IDE behavior
- full terminal-first workflow
- full file explorer as default
- full offline sovereignty
- local release/deploy bypass
- automatic dependency install
- automatic file writes
- automatic sync
- automatic conflict resolution
- unscoped filesystem access
- secrets entering logs/evidence/cloud

## Verification

Verification performed:

- `STD-VISION-001` is trueGreen as planning/design artifact.
- Figma artifact includes the outside frame and 11 Studio V1 screen frames.
- This screen map includes all 11 Studio V1 screens.
- Each screen declares purpose, user action, visible regions, buttons, truth engine, responsible agent, permissions, sync impact, failure behavior, and implementation boundary.
- Each V1 screen has a truth engine, agent owner, and failure path.

Verification not performed:

- no Studio code implemented
- no Desktop app launched
- no browser route changed
- no live runtime test run

## Status

`STD-SCREENS-001` can be marked `trueGreen` as a planning/screen-contract task only.

No Studio implementation task is trueGreen.

Next canonical task:

```txt
STD-ENTRY-001 — Define Studio Web entry and install/connect states
```
