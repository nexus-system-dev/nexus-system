# Nexus Studio Permissions, Files, Secrets, And Computer Access Contract

Date: `2026-06-02`
Task: `STD-PERM-001`
Status: `canonical permission contract created`
Depends on:

- `STD-SCREENS-001`
- `STD-FND-002`
- `STD-DOOR-001`
- `STD-SYNC-001`

Consumes:

- `docs/operating-system/nexus-studio-v1-screen-workspace-map-2026-06-02.md`
- `docs/operating-system/nexus-studio-cloud-local-truth-contract-2026-06-02.md`
- `docs/operating-system/nexus-studio-web-studio-door-contract-2026-06-02.md`
- `docs/operating-system/nexus-studio-sync-stale-offline-contract-2026-06-02.md`

## Purpose

This contract locks the Studio permission, filesystem, secrets, and computer-access boundary before local runtime, file writes, package creation, or Desktop implementation.

It defines:

- permission classes
- permission cards
- folder grant and revoke rules
- read/write boundaries
- local draft versus real file write
- runtime permission boundary
- install permission boundary
- sync permission boundary
- local secrets boundary
- computer access boundary
- failure and revoked-permission behavior
- what Studio and Web may show before real Desktop permissions exist

Core law:

```txt
Local power must be scoped, visible, revocable, auditable, and approval-bounded.
```

Second law:

```txt
Studio may prepare local proposals without touching project files. Real local writes require explicit permission and approval.
```

## Scope

This task creates a planning/permission-contract artifact only.

It does not implement:

- Desktop permission prompts
- filesystem access
- folder picker
- file read/write runtime
- local command execution
- dependency installation
- local secret storage
- permission persistence
- revocation runtime
- browser or Desktop verification

It may be marked `trueGreen` only as a planning/permission-contract task.

No Desktop implementation task may become `trueGreen` from this contract alone.

## Permission Classes

Studio V1 permissions are project-scoped and device-scoped.

Required classes:

- `folder`
- `read`
- `write`
- `run`
- `secrets`
- `install`
- `sync`
- `package`
- `evidence`

No permission is global by default.

No permission grants unrelated folder access.

No permission grants unrestricted shell access.

## Permission Card Contract

The Studio permission screen must render each permission as a card.

Each card must show:

- permission name
- why it is needed
- what it enables
- what it does not enable
- risk
- current state
- scope
- revocation action
- next safe action

Required cards:

- folder
- read
- write
- run
- secrets
- install
- sync
- package
- evidence

Forbidden UX:

- legalistic wall as the primary permission experience
- hidden permission state
- active dangerous action without permission
- one broad approval that grants everything

## Permission States

Allowed states:

- `not-requested`
- `requested`
- `granted-read-only`
- `granted-read-write`
- `granted-run`
- `granted-sync`
- `granted-package`
- `revoked`
- `expired`
- `denied`
- `missing`
- `mismatched`
- `read-only-mode`

User-facing labels may include:

- `לא ניתנה הרשאה`
- `ראייה בלבד`
- `קריאה בלבד`
- `כתיבה פעילה`
- `הרצה פעילה`
- `סנכרון פעיל`
- `בוטלה`
- `חסרה`
- `לא תואמת לפרויקט`

Labels must not imply permission that does not exist.

## Folder Grant Model

Folder grant action:

```txt
בחר תיקייה לפרויקט הזה
```

After grant, Studio must show:

- selected folder
- linked project name
- linked project id
- device scope
- allowed actions
- read-only or read/write state
- revoke action

Revoke action:

```txt
בטל גישה לתיקייה
```

After revoke:

- no file read
- no file write
- no local run from that folder
- no packaging from that folder
- no sync based on that folder
- project may remain visible in read-only/cloud context

Studio must not:

- browse unrelated folders by default
- create a new folder and call it the same project without approval
- continue writing after folder is revoked
- hide the selected folder state

## Missing, Moved, Or Mismatched Folder

If the folder is missing, moved, deleted, or mismatched:

Studio must stop local actions that require the folder.

Studio may offer:

- choose new folder
- reconnect
- open read-only mode
- return to Web

Studio must not:

- guess a replacement folder
- create a new folder silently
- treat mismatched local files as the cloud project
- sync from an unverified folder

## Read Boundary

Read permission allows Studio to inspect project-scoped files needed for the active project.

Read permission may support:

- project structure summary
- relevant files list
- local run command discovery
- build/package candidate inspection
- evidence creation

Read permission must not allow:

- arbitrary machine-wide search
- unrelated folder reads
- secrets display
- provider credential extraction
- private file contents unrelated to the project

## Write Boundary

Write permission allows user-approved writes to the active project folder.

Write permission does not mean automatic writing.

Before a real write, Studio must show:

- what will change
- which files are affected
- product meaning if relevant
- whether the write is local only
- whether sync is needed later
- whether approval is required

Local draft proposals may be prepared without writing to real project files.

Real writes require:

- write permission
- action-specific approval
- active project match
- no unresolved permission/folder mismatch

Studio must not:

- write as the default response to every agent proposal
- silently modify package files
- silently install dependencies
- write secrets into project files
- write after permission revocation

## Runtime Permission Boundary

Run permission allows Studio to run bounded project commands only for the active project.

Run requires both:

- Studio Local Agent understanding of intent
- permission-engine approval

Run permission does not allow:

- unrestricted shell
- arbitrary machine commands
- destructive operations
- provider calls without provider approval
- dependency installation unless install permission is separately approved

Runtime output is evidence only.

It must not become Product Graph truth by itself.

## Install Permission Boundary

Install permission covers dependency installation or package changes.

Install is never silent in V1.

Before install, Studio must show:

- what dependency or command is proposed
- why it is needed
- which files may change
- risk
- whether it affects sync/release
- approval action

Install permission must not allow:

- global package installation by default
- destructive dependency changes
- unrelated tool installation
- automatic dependency repair without approval

## Sync Permission Boundary

Sync permission allows Studio to submit proposed mutation/checkpoint envelopes.

Sync permission does not allow:

- direct Product Graph mutation
- sync without pre-sync review
- sync from stale state
- sync from mismatched folder
- sync of secrets
- sync of unapproved writes

Sync remains governed by:

- `STD-FND-002`
- `STD-DOOR-001`
- `STD-SYNC-001`
- Mutation / Change Agent
- Sync Engine

## Package Permission Boundary

Package permission allows Studio to prepare a package candidate.

It does not allow release.

Before packaging, Studio must show:

- what enters the package
- local changes included
- approvals required
- tests/evidence
- sync state
- release handoff status

Package permission must not allow:

- package with unapproved changes
- package as release truth
- signing/deploy credential use without separate approval

## Evidence Permission Boundary

Evidence permission allows Studio to attach redacted local evidence to a proposed mutation, package candidate, debug result, or history entry.

Allowed evidence:

- redacted run summary
- redacted test summary
- screenshot metadata
- shortened logs
- package candidate metadata
- failure summary

Forbidden evidence:

- local secrets
- tokens
- raw environment dumps
- unredacted local paths
- private file contents
- provider credentials
- unrelated folder data

## Secrets Boundary

Local secrets may be used for local run only.

Studio may show only status:

```txt
משתנה סודי נמצא
```

```txt
משתנה סודי חסר
```

Secrets must not enter:

- Product Graph
- chat transcript
- shared history
- logs
- screenshots
- sync envelope
- evidence
- release proof
- Web return envelope

Cloud transfer of a secret requires a separate explicit contract and approval.

No such transfer is part of V1 unless promoted by a later canonical task.

## Computer Access Boundary

Studio may act on the user's computer only inside project-scoped, permission-gated action classes.

Allowed action classes after permission:

- read project files
- write approved project changes
- run approved project command
- attach redacted evidence
- prepare package candidate
- submit sync proposal

Forbidden by default:

- unrestricted shell
- machine-wide filesystem search
- background watchers across arbitrary folders
- reading environment dumps
- accessing unrelated apps
- using provider credentials without approval
- deleting files without explicit destructive approval
- changing system settings

## Locked Action Display

Locked actions must remain visible when relevant, but inactive.

A locked action must show:

- lock icon or disabled state
- short reason
- required permission
- safe unlock action

Examples:

- `נדרשת הרשאת תיקייה`
- `נדרשת הרשאת כתיבה`
- `נדרשת הרשאת הרצה`
- `נדרש אישור סנכרון`
- `נדרשת הרשאת סודות`

Studio must not hide local power completely.

Studio must not make locked power appear active.

## Read-Only Mode

Read-only mode is a normal Studio project state with actions locked.

Allowed:

- view project context
- view cloud truth
- view relevant files if read permission exists
- view previous evidence
- ask Nexus for explanation
- return to Web
- grant permission

Forbidden:

- write
- run
- install
- package
- sync
- access secrets
- mutate Product Graph

## Revocation Rules

When permission is revoked:

- active local action stops safely when possible
- dependent actions become locked
- existing local drafts remain local
- cloud truth does not change
- history may record permission-state event when it affects work continuity
- user sees what is now unavailable

Revocation must not:

- erase local work silently
- sync pending changes
- keep background access alive
- leave UI showing an active permission

## Failure Behavior

Safe permission failures:

- folder missing
- folder moved
- folder mismatched
- permission denied
- permission revoked
- write denied
- run denied
- secrets missing
- install denied
- sync permission missing
- package permission missing

Failure response:

1. state what failed
2. state what did not happen
3. state what can continue safely
4. offer permission, read-only, retry, reconnect, or return-to-Web

## Web Display Boundary

Web may show:

- permission required
- Studio needs folder access
- Studio needs run/write/sync permission
- permission denied or missing after Studio reports it
- read-only mode after Studio reports it

Web must not show:

- folder access exists before Studio confirms it
- write permission exists before Studio confirms it
- run permission exists before Studio confirms it
- secrets are available
- install can happen automatically
- local action succeeded because permission was requested

## V1 Contract-Only Boundary

Until Desktop implementation exists, all permissions are contract-only:

- `folder`
- `read`
- `write`
- `run`
- `secrets`
- `install`
- `sync`
- `package`
- `evidence`

Studio and Web designs may represent them.

They must not be claimed as live reality until real Desktop permission implementation verifies them.

## Closure Criteria

`STD-PERM-001` can be marked `trueGreen` as a planning/permission-contract task only when:

- this contract exists
- permission classes are defined
- permission cards are defined
- folder grant/revoke is defined
- read/write boundaries are defined
- runtime/install/sync/package boundaries are defined
- local secrets boundary is defined
- computer access boundary is defined
- read-only and locked action behavior are defined
- Web display boundary is defined
- Desktop-dependent permissions are marked contract-only

## Verification

Verification performed:

- contract defines permission classes
- contract defines permission cards
- contract defines folder grant and revoke
- contract defines read/write boundaries
- contract defines runtime/install/sync/package boundaries
- contract defines local secrets boundary
- contract defines forbidden unrestricted shell/filesystem behavior
- contract defines Web display limits

Verification not performed:

- no Desktop app implemented
- no folder picker implemented
- no real permission engine implemented
- no local file read/write implemented
- no local runtime implemented
- no browser or Desktop verification performed

## Status

`STD-PERM-001` may be marked `trueGreen` as a planning/permission-contract task only.

No Studio implementation task is trueGreen.

Next canonical task:

```txt
STD-RUN-001 — Define Studio local runtime and preview contract
```
