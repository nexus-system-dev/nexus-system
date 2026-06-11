# Nexus Studio Cloud Truth And Local Working-State Contract

Date: `2026-06-02`
Task: `STD-FND-002`
Status: `canonical truth-state contract created`
Depends on: `STD-SCREENS-001`

## Purpose

This contract locks the difference between cloud truth, local work, evidence, candidate artifacts, proposed mutations, accepted mutations, and rejected mutations before any Studio implementation.

It prevents Studio from treating local files, local runs, local previews, local packages, logs, screenshots, checkpoints, or offline work as committed Nexus truth.

Core law:

```txt
Local state is candidate/evidence state until Nexus accepts it into cloud Product Graph truth.
```

## Scope

This contract defines:

- truth states
- state owners
- allowed transitions
- opening package from Product Graph
- local working-state boundaries
- evidence boundaries
- proposed mutation boundaries
- accepted mutation boundaries
- rejected mutation boundaries
- stale/conflict handling
- offline limits
- history and recovery meaning

This contract does not implement:

- sync engine
- local file writes
- local runtime
- Desktop app
- install detection
- deep-link execution
- release gate

## State Model

### 1. `canonical-truth`

Meaning:

```txt
Accepted Product Graph state in Nexus Web/cloud.
```

Owner:

- `Product Graph / Project Truth Engine`

May include:

- project identity
- product goal
- current product structure
- accepted screens
- accepted flows
- accepted build state
- accepted release state
- shared history
- approved artifacts
- accepted mutations

May not include:

- unaccepted local files
- raw local logs
- local secrets
- private local paths
- unreviewed package candidates
- failed run output unless accepted as evidence

User-facing label:

```txt
אושר בענן
```

Core rule:

```txt
Only accepted cloud mutations can change canonical truth.
```

### 2. `local-working-state`

Meaning:

```txt
Local files, runtime state, checkpoints, drafts, and work state for the active bound Studio project.
```

Owner:

- `Local App Storage Engine`
- `Folder Permission Engine`

May include:

- local drafts
- local checkpoints
- local file edits
- local run state
- local preview state
- unsynced package metadata
- unsynced recovery state

May not include:

- final cloud truth
- release truth
- shared history truth
- provider credentials in visible form

User-facing labels:

- `מקומי`
- `טיוטה מקומית`
- `ממתין לסנכרון`

Core rule:

```txt
Local work can be preserved and reviewed, but it is not shared truth.
```

### 3. `candidate-artifact`

Meaning:

```txt
A local build, preview, package, generated asset, or testable output that may become evidence or a release candidate.
```

Owner:

- `Release Candidate / Package Engine`
- `Local Evidence Engine`

May include:

- preview package
- local build output
- package candidate
- generated screenshots
- build metadata
- verification output

May not include:

- release approval
- public deployment truth
- unredacted secrets
- unapproved local changes

User-facing label:

```txt
מועמד
```

Core rule:

```txt
A package candidate is not a release.
```

### 4. `local-evidence`

Meaning:

```txt
Evidence that explains what happened locally without changing product truth by itself.
```

Owner:

- `Local Evidence Engine`
- `Verification Agent`

May include:

- filtered logs
- screenshots
- test results
- runtime status
- debug findings
- package metadata
- performance snapshots
- local failure reports

May not include:

- secrets
- raw environment variables
- provider tokens
- sensitive full user paths
- private file contents
- unredacted credentials

User-facing label:

```txt
ראיה בלבד
```

Core rule:

```txt
Evidence says what happened. It does not decide what changes.
```

### 5. `proposed-mutation`

Meaning:

```txt
An explicit sync envelope requesting a change to canonical truth.
```

Owner:

- `Mutation / Change Engine`
- `Sync Engine`
- `Studio Local Agent`

Must include:

- source state
- target cloud revision
- product meaning
- affected screens/flows
- affected files
- evidence references
- approval status
- conflict status
- rollback/recovery point when needed

May not include:

- secrets
- unrelated file changes
- unapproved write operations
- vague local edits without product meaning

User-facing label:

```txt
מועמד לשינוי אמת
```

Core rule:

```txt
Proposed mutation is a request, not an accepted truth change.
```

### 6. `accepted-mutation`

Meaning:

```txt
A proposed mutation accepted into cloud Product Graph truth and recorded in canonical history.
```

Owner:

- `Product Graph / Project Truth Engine`
- `Sync Engine`
- `History / Continuity Engine`

Must include:

- accepted change summary
- reason
- source proposal
- evidence references
- accepted revision
- history entry
- rollback/recovery metadata when applicable

User-facing label:

```txt
אושר בענן
```

Core rule:

```txt
Only accepted mutations update shared Nexus truth.
```

### 7. `rejected-mutation`

Meaning:

```txt
A local proposal blocked by stale state, conflict, policy, failed verification, missing permission, or user rejection.
```

Owner:

- `Sync Engine`
- `Mutation / Change Engine`
- `History / Continuity Engine`

Must include:

- rejection reason
- whether local work was preserved
- whether retry is possible
- whether conflict review is required
- whether user approval is missing

User-facing labels:

- `נדחה`
- `נשמר מקומית`
- `דורש תיקון`

Core rule:

```txt
Rejected work may remain local, but it must not appear as accepted cloud truth.
```

## Opening Package From Product Graph

Studio opens a project from Nexus truth, not from a random local folder.

The opening package is bounded and must include:

- `projectId`
- `projectName`
- `cloudRevision`
- canonical product snapshot
- important history
- open tasks
- relevant recent conversation
- build state
- test state
- release state
- relevant files/assets
- important restore points
- permissions required for requested action
- return-to-Web URL
- handoff reason

The opening package must not include:

- full conversation history by default
- unrelated project files
- local secrets
- provider tokens
- private local paths
- raw logs
- unrelated user folders

Core rule:

```txt
Studio receives enough to work correctly, not the entire history of the world.
```

## Allowed State Transitions

Allowed transitions:

```txt
canonical-truth -> opening-package -> local-working-state
local-working-state -> local-evidence
local-working-state -> candidate-artifact
local-working-state -> proposed-mutation
candidate-artifact -> local-evidence
candidate-artifact -> proposed-mutation
local-evidence -> proposed-mutation
proposed-mutation -> accepted-mutation
proposed-mutation -> rejected-mutation
accepted-mutation -> canonical-truth
rejected-mutation -> local-working-state
```

Blocked transitions:

```txt
local-working-state -> canonical-truth without proposed mutation
candidate-artifact -> release truth without Web Release gate
local-evidence -> canonical-truth by itself
offline local work -> canonical-truth while disconnected
rejected-mutation -> canonical-truth
local secrets -> evidence/history/sync
```

## Status Labels

Studio and Web may use these user-facing labels:

- `אושר בענן`
- `מסונכרן`
- `מקומי`
- `טיוטה מקומית`
- `ממתין לסנכרון`
- `ראיה בלבד`
- `מועמד`
- `מועמד לשינוי אמת`
- `נדחה`
- `יש התנגשות`
- `דורש אישור`
- `ראייה בלבד`
- `אופליין מוגבל`

Labels must not imply more truth than the state actually owns.

## Agent And Engine Responsibilities

### `Studio Local Agent`

Explains what is local, what is cloud truth, what is evidence, what is a candidate, what needs approval, what can sync, and what failed.

It must not accept truth alone.

### `Mutation / Change Agent`

Decides whether local work changes product meaning, whether a proposed mutation needs approval, and whether the change affects screens, flows, release, permissions, or history.

It must not write to local files or sync by itself.

### `Sync Engine`

Executes compare, stale check, conflict detection, proposal submission, and acceptance/rejection recording.

It must not invent product meaning.

### `History / Continuity Engine`

Records accepted mutations, rejected mutation reasons when relevant, local recovery events, restore points, and significant evidence handoff.

It must not expose raw technical logs as product history.

## Stale And Conflict Rules

If cloud truth changes while Studio worked locally:

- Studio must stop before sync
- show cloud change
- show local change
- show conflict area
- offer merge, keep local as draft, accept cloud, or open comparison

Studio must not:

- overwrite cloud silently
- overwrite local silently
- treat stale local work as current truth

## Offline Rules

Offline allowed:

- open recent project snapshot
- view last known state
- work on local drafts
- run locally if permissions exist
- save local checkpoints
- create local evidence

Offline forbidden:

- publish
- release
- change cloud truth
- connect new providers
- promise sync
- resolve cloud conflicts against unavailable cloud truth

Core rule:

```txt
Offline means bounded local work, not new final truth.
```

## Evidence Rules

Evidence can support a mutation, release candidate, debug explanation, or recovery.

Evidence must be redacted before it becomes user-visible or syncable.

Evidence alone cannot:

- update Product Graph
- mark release ready
- prove success
- override user approval
- bypass Mutation Agent

## Rejection Rules

A proposed mutation is rejected when:

- cloud revision is stale
- conflict is unresolved
- user approval is missing
- permission is missing
- verification failed
- policy blocks the change
- payload includes secrets
- local package includes unapproved changes
- Web Release gate rejects the candidate

Rejected work handling:

- preserve local draft when safe
- explain rejection
- offer retry only if safe
- never show rejected work as accepted truth

## Web Display Rules

Web may show:

- accepted cloud truth
- returned evidence status
- local dirty status
- sync accepted/rejected status
- package candidate status

Web must not show:

- local draft as accepted truth
- candidate artifact as release
- evidence-only as mutation
- rejected mutation as current product
- offline work as cloud-updated

## Verification

Verification performed:

- truth states are defined: `canonical-truth`, `local-working-state`, `candidate-artifact`, `local-evidence`, `proposed-mutation`, `accepted-mutation`, and `rejected-mutation`
- state owners are defined
- allowed and blocked transitions are defined
- Product Graph opening package fields are defined
- stale, conflict, offline, evidence, and rejection rules are defined

Verification not performed:

- no sync engine implemented
- no Desktop app implemented
- no live local state tested
- no Product Graph mutation run

## Status

`STD-FND-002` can be marked `trueGreen` as a planning/truth-state contract task only.

No Studio implementation task is trueGreen.

Next canonical task:

```txt
STD-DOOR-001 — Lock Web↔Studio door contract
```
