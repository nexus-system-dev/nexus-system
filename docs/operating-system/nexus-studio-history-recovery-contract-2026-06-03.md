# Nexus Studio History and Recovery Contract

Date: 2026-06-03

Canonical task: `STD-HIST-001`

Status: canonical planning contract only.

No Studio implementation task is trueGreen from this document. No Desktop app, local checkpoint engine, crash recovery engine, cloud History writer, live sync, or restore behavior is proven by this contract.

## 1. Core Law

Studio recovery protects local work.

Nexus History protects accepted truth.

```txt
Local recovery is not cloud truth.
Cloud History is not a raw dump of local work.
```

Studio must make it hard for the user to lose local work, but it must not turn unsynced local work into canonical truth without sync, mutation review, and approval where required.

## 2. History Types

Studio must distinguish four history layers.

### 2.1 Local Session Journal

Purpose:

- remember what happened inside the current Studio session
- support recovery after close, crash, offline work, revoked permission, or failed sync

Examples:

- local action started
- local action stopped
- local draft saved
- local checkpoint created
- runtime failed
- package candidate failed
- sync attempt failed

Truth status:

- local-only
- not canonical
- not shown in Web History by default

### 2.2 Local Recovery Checkpoint

Purpose:

- give the user a safe point to inspect and recover local work
- preserve work before dangerous actions
- preserve work before sync, conflict resolution, package, discard, or crash recovery

Examples:

- checkpoint before sync
- checkpoint before package
- checkpoint before accepting cloud version
- checkpoint after crash
- checkpoint before discarding local work

Truth status:

- local recovery state
- can become evidence or mutation candidate only through sync/review

### 2.3 Canonical Product History

Purpose:

- record accepted changes to Nexus truth
- explain how the product reached its current canonical state

Examples:

- accepted Studio-originated mutation
- accepted package evidence entering Release flow
- sync accepted after conflict resolution
- recovery event that affected shared project truth

Truth status:

- cloud-canonical
- visible in Web History in product language
- never raw local log history

### 2.4 Recovery Evidence Attachment

Purpose:

- attach useful local proof to a sync proposal, release candidate, or history entry

Examples:

- redacted test result
- shortened runtime log
- screenshot
- package result
- failure reason
- checkpoint identifier

Truth status:

- evidence only until accepted upstream
- must be redacted
- must not include secrets or raw private command history

## 3. Local Storage Ownership

Studio internal app storage may hold:

- local drafts
- local session journal
- local checkpoints
- local recovery state
- unsynced mutation queue
- evidence cache
- sync attempt metadata
- retry state
- package/debug candidate metadata

Project folder may hold only:

- user-approved file writes
- project artifacts created with explicit permission
- package/build outputs when package/build permission allows it

Studio must be able to save local recovery state without writing into the project folder.

Writing to the project folder requires the permission contract.

Writing to cloud truth requires the sync and mutation contracts.

## 4. Recovery States

Studio V1 recovery states:

- `clean`
- `local-unsynced`
- `draft-only`
- `crashed-recoverable`
- `running-action-stopped`
- `package-interrupted`
- `permission-revoked`
- `folder-missing`
- `folder-mismatch`
- `stale-binding`
- `cloud-changed-while-local`
- `sync-pending`
- `sync-rejected`
- `conflict-unresolved`
- `discard-pending`
- `discarded-local`
- `recovered-local`
- `recovered-and-synced`

Each state must declare:

- what is saved locally
- whether cloud truth changed
- whether user approval is required
- whether sync is allowed
- whether the project folder can be touched
- what the user sees next

## 5. Close, Crash, and Reopen Rules

### 5.1 Normal Close With No Local Work

Behavior:

- close normally
- keep last opened project pointer
- no recovery prompt on next open

User message:

- no special warning required

### 5.2 Close With Unsynced Work

Behavior:

- save local recovery checkpoint
- mark work as `local-unsynced`
- preserve local draft and evidence
- show short warning before exit when possible

Required warning:

```txt
יש עבודה מקומית שעדיין לא סונכרנה.
אפשר לסגור, אבל היא תישמר מקומית עד שתבחר לסנכרן, להמשיך או לבטל.
```

Next open primary action:

```txt
ראה מה נשמר
```

Allowed next actions:

- see what was saved
- continue locally
- prepare sync
- keep local
- discard local changes after confirmation
- return to Web without claiming sync

Forbidden:

- silently discard local work
- silently sync
- treat local checkpoint as cloud truth

### 5.3 Crash During Local Edit

Behavior:

- recover latest safe checkpoint
- mark state `crashed-recoverable`
- show what was recovered before offering sync

User message:

```txt
מצאתי עבודה מקומית שלא סונכרנה אחרי סגירה לא תקינה.
קודם נראה מה נשמר, ואז תבחר אם להמשיך, לסנכרן או לבטל.
```

Primary action:

- `ראה מה נשמר`

Forbidden:

- auto-sync crash state
- auto-discard crash state
- show crash recovery as accepted cloud history

### 5.4 Close Or Crash During Runtime

Behavior:

- stop dangerous running action safely where possible
- record runtime evidence and failure/interruption state
- keep local draft unchanged unless approved file writes already occurred
- mark state `running-action-stopped` or `crashed-recoverable`

Forbidden:

- resume command automatically without approval
- claim run succeeded
- expose raw sensitive logs

### 5.5 Close Or Crash During Package

Behavior:

- mark package candidate interrupted
- preserve partial evidence when safe
- block package handoff until package verification reruns

Forbidden:

- treat partial package as candidate ready for Release
- sync partial package as accepted evidence

## 6. Reopen Flow

When Studio reopens a project with recovery state, the order is:

1. show project identity
2. show cloud connection state
3. show recovery state
4. show primary action `ראה מה נשמר`
5. show local work summary
6. show affected product areas
7. show affected files only after product meaning
8. show evidence and failed actions
9. offer continue, sync, keep local, discard, or return to Web

The first screen must not be a raw file diff.

The first screen must not be raw logs.

The user must understand:

- what was saved
- what is local only
- what cloud already knows
- what may be synced
- what may be discarded
- what cannot be trusted yet

## 7. Restore Rules

Restore means returning local Studio state to a previous local checkpoint or accepted cloud recovery point.

Restore does not mean automatically changing cloud truth.

### 7.1 Local Checkpoint Restore

Allowed:

- restore local draft state
- restore local UI/session state
- restore local candidate/evidence visibility
- restore local unsynced proposal state

Requires approval when:

- current local work would be replaced
- project files would be written
- package candidate would be discarded
- conflict resolution would change

Forbidden:

- overwrite project files without write permission and approval
- update Product Graph without sync acceptance
- call local restore a cloud rollback

### 7.2 Canonical Restore Point

Allowed:

- request cloud restore through canonical History/Mutation path
- use accepted history entry as restore target

Requires:

- user approval
- mutation/history engine review
- sync state check
- conflict check when local unsynced work exists

Forbidden:

- Studio independently rewinds cloud truth
- Studio hides unsynced local work before canonical restore

### 7.3 Mixed Local And Cloud Restore

If local unsynced work exists and the user wants to restore a cloud point:

- show local work that may be lost
- offer keep local as draft
- offer discard local after confirmation
- offer sync local first if safe
- offer restore cloud point only after clear approval

## 8. Sync And History Attachment

Sync may attach recovery context only when useful.

Allowed attachments:

- local checkpoint id
- recovery reason
- redacted evidence summary
- accepted mutation summary
- rejected mutation reason when relevant to trust
- package/debug evidence accepted into Release flow
- permission/sync event when it affects continuity

Forbidden attachments:

- raw logs
- raw command history
- secrets
- full local filesystem paths when sensitive
- raw environment dumps
- private local notes not approved for sync
- entire local session journal

Canonical History entry must be product-language first.

Example accepted entry:

```txt
Studio synced a local change that updated the project preview after a successful local run. A recovery point was saved before the sync.
```

Example rejected entry:

```txt
Studio rejected a local sync because the cloud project changed while local work was open. The local draft was preserved.
```

## 9. Rebase, Retry, Discard

### 9.1 Rebase Local Work

Used when:

- cloud changed while local work exists
- local work can be reapplied safely
- conflict engine identifies compatible changes

Requires:

- cloud revision comparison
- local checkpoint before rebase
- user approval when product meaning or files are affected

Forbidden:

- silent rebase
- hidden overwrite of local or cloud work

### 9.2 Retry Failed Sync

Used when:

- sync failed because of transient network/cloud/provider issue
- local proposal is still valid
- permissions still exist

Requires:

- retry limit
- current cloud revision check
- fresh permission check

Forbidden:

- infinite retries
- retry after stale cloud without warning
- retry rejected mutation as if accepted

### 9.3 Discard Local Work

Used when:

- user explicitly chooses to discard local work

Requires:

- clear explanation of what will be lost
- local checkpoint before destructive discard when possible
- confirmation

Forbidden:

- one-click silent destructive discard
- discarding without showing affected product areas
- discarding cloud truth from Studio local recovery screen

## 10. Opening Package History Boundary

Studio opening package may include:

- bounded canonical snapshot
- important history entries
- important restore points
- relevant recent conversation
- open tasks
- latest build/test/release state
- local recovery pointer if Studio previously reported one

Studio opening package must not include by default:

- full project history
- full conversation history
- raw agent reasoning
- raw logs
- raw command history
- secrets
- unrelated project data

Studio receives enough history to continue work safely, not the entire history of the project.

## 11. User-Facing Recovery Surface

Local recovery screen must show:

- project name
- cloud connection state
- recovery state
- what was saved
- what is local only
- what can be synced
- what cannot be synced
- affected product areas
- affected files after product areas
- evidence and failed actions after files
- primary action `ראה מה נשמר`
- secondary actions: continue, sync, keep local, discard, return to Web

It must not show first:

- raw logs
- raw file tree
- raw diff
- terminal state
- internal agent names

## 12. Web Boundary

Web may show:

- Studio reported unsynced local work
- Studio reported a recovery point
- Studio returned accepted sync evidence
- Studio returned rejected sync reason
- Studio preserved a local draft

Web must not show before real Desktop proof:

- that local recovery succeeded
- that local work was saved
- that a checkpoint exists
- that sync occurred
- that a restore completed
- that Studio can recover files

Web must not expose:

- raw local recovery journal
- private local logs
- raw command history
- secret-adjacent information
- local filesystem details that are not approved

## 13. Failure Rules

Safe failure means:

- local work is not silently lost
- cloud truth is not silently changed
- local drafts are preserved when safe
- the user sees what is known and unknown
- retry/discard/reopen paths are explicit

Failure categories:

- checkpoint failed
- checkpoint partially saved
- recovery unavailable
- permission revoked
- folder missing
- cloud unavailable
- cloud changed while local work exists
- sync rejected
- restore target unavailable
- discard failed
- evidence redaction failed

If recovery cannot be proven, Studio must say so.

Forbidden failure behavior:

- claim recovery when no checkpoint exists
- hide unsynced work
- treat local draft as accepted truth
- retry forever
- discard on crash
- expose secrets through recovery detail
- show raw logs as user-facing history

## 14. Implementation Readiness Contract

Before any implementation task can claim Studio recovery is working, it must prove:

- internal app storage can save local recovery state
- close with unsynced work creates a recoverable state
- reopen shows `ראה מה נשמר`
- crash/interruption path preserves or truthfully reports missing recovery
- discard requires confirmation
- sync acceptance attaches only approved/redacted recovery context
- rejected sync preserves local draft when safe
- Web does not claim recovery before Desktop proof

## 15. Task Closure

`STD-HIST-001` is closed only as a planning/history-recovery-contract task when:

- local checkpoints are defined
- crash recovery is defined
- unsynced warnings are defined
- rebase/retry/discard paths are defined
- canonical History attachment rules are defined
- opening package history boundary is defined
- local-only recovery is separated from shared accepted history

No code, Desktop app, live checkpoint engine, restore engine, history write, or sync behavior is closed by this task.

Next canonical task: `SURF-009 — Shell-to-engine integration contract`.
