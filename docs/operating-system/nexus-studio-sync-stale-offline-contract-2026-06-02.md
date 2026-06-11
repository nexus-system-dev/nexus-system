# Nexus Studio Sync, Stale-State, And Bounded Offline Contract

Date: `2026-06-02`
Task: `STD-SYNC-001`
Status: `canonical sync contract created`
Depends on:

- `STD-FND-002`
- `STD-DOOR-001`

Consumes:

- `docs/operating-system/nexus-studio-cloud-local-truth-contract-2026-06-02.md`
- `docs/operating-system/nexus-studio-web-studio-door-contract-2026-06-02.md`
- `docs/operating-system/nexus-studio-v1-screen-workspace-map-2026-06-02.md`

## Purpose

This contract locks the Studio sync model before any Desktop implementation.

It defines:

- sync states
- stale-state detection
- conflict rules
- bounded offline work
- pre-sync review
- sync proposal envelope
- accepted sync result
- rejected sync result
- evidence handoff
- failure and retry behavior
- what Studio and Web may show before live sync exists

Core law:

```txt
Studio sync is explicit mutation/checkpoint replay into Nexus truth, not opaque folder mirroring.
```

Second law:

```txt
Offline work may queue evidence and proposals. It may not mint shared truth.
```

## Scope

This task creates a planning/sync-contract artifact only.

It does not implement:

- Desktop sync engine
- live cloud sync
- conflict merge runtime
- offline queue persistence runtime
- accepted mutation execution
- rejected mutation execution
- local file diff runtime
- browser or Desktop verification

It may be marked `trueGreen` only as a planning/sync-contract task.

No Desktop implementation task may become `trueGreen` from this contract alone.

## Truth States Consumed From `STD-FND-002`

Sync must preserve these states:

- `canonical-truth`
- `local-working-state`
- `candidate-artifact`
- `local-evidence`
- `proposed-mutation`
- `accepted-mutation`
- `rejected-mutation`

Sync must never allow:

- local working state to become canonical truth directly
- evidence to become truth by itself
- offline work to change cloud truth while disconnected
- rejected work to appear accepted
- local secrets to enter evidence/history/sync

## Sync States

### `synced`

Meaning:

```txt
Studio's bound project state matches the known cloud revision.
```

Allowed display:

- `מסונכרן`
- current cloud revision
- no pending local mutation

Must not imply:

- future local run will succeed
- local folder still exists unless validated
- release readiness

### `local-dirty`

Meaning:

```txt
Studio has local working state that is not accepted cloud truth.
```

Allowed display:

- `יש שינויים מקומיים`
- number of local changes when known
- review before sync action

Must not imply:

- cloud accepted the change
- release can include the change
- Web can overwrite or ignore it safely

### `sync-ready`

Meaning:

```txt
Studio has enough reviewed local state to prepare a proposed mutation envelope.
```

Requires:

- current cloud revision known
- local changes identified
- evidence classified
- approvals identified
- product meaning summarized
- no known unresolved conflict

### `pre-sync-review`

Meaning:

```txt
User is reviewing what would change before sync.
```

Display order:

1. product meaning
2. affected screens/flows
3. affected files/assets
4. cloud impact
5. what remains local
6. approvals required
7. conflicts or stale risk
8. tests and evidence
9. available actions

Available actions:

- `סנכרן`
- `השאר מקומי`
- `בטל`
- `פתח פירוט`
- `הרץ בדיקה`
- `שמור כטיוטה`

### `syncing`

Meaning:

```txt
Studio submitted a proposed mutation envelope and is waiting for sync/mutation decision.
```

Allowed display:

- syncing in progress
- action locked during decision
- safe cancel/retry only if supported

Must not imply:

- accepted truth
- rejected truth
- release readiness

### `accepted`

Meaning:

```txt
The sync/mutation gate accepted the proposed mutation into canonical cloud truth.
```

Requires:

- accepted mutation id
- new cloud revision
- history/recovery write
- returned evidence summary when relevant

### `rejected`

Meaning:

```txt
The sync/mutation gate rejected the proposed mutation.
```

Rejection reasons:

- stale cloud revision
- unresolved conflict
- missing approval
- missing permission
- verification failed
- payload includes forbidden data
- policy block
- release gate block
- local package includes unapproved changes

Rejected work handling:

- preserve local draft when safe
- explain rejection
- offer retry only when safe
- never show rejected work as accepted truth

### `stale`

Meaning:

```txt
Studio's local base revision is older than current cloud truth.
```

Default action:

- stop before sync
- fetch current cloud summary
- compare product meaning and local work
- route to conflict or rebase decision

### `conflict`

Meaning:

```txt
Cloud and local work changed the same product area, file, flow, or truth field in a way that cannot be accepted automatically.
```

Default display:

- guided Nexus explanation first
- comparison details second

Allowed outcomes:

- merge
- keep local as draft
- accept cloud
- create separate branch/version
- ask user to choose

### `offline-bounded`

Meaning:

```txt
Studio can continue safe local work, but cannot change shared cloud truth.
```

Allowed offline work:

- view last known project snapshot
- work on local drafts
- run locally if permissions exist
- save local checkpoints
- create local evidence
- queue proposed mutations

Forbidden offline work:

- publish
- release
- change cloud Product Graph truth
- connect new providers
- promise sync
- resolve conflicts against unavailable cloud truth
- claim accepted mutation

## Pre-Sync Review Contract

Before sync, Studio must show meaning before mechanics.

The pre-sync review must include:

- what changed locally
- why it matters to the product
- which screens/flows are affected
- which files/assets are affected
- which changes are evidence only
- which changes are candidate artifacts
- which changes are proposed mutations
- what will enter cloud if accepted
- what will remain local
- what needs approval
- what may conflict with cloud
- what tests passed
- what tests failed
- what evidence is attached
- available safe actions

Forbidden pre-sync review:

- file list only
- raw diff first
- technical log first
- claiming sync before acceptance
- hiding failed checks
- hiding stale cloud state

## Sync Proposal Envelope

Required fields:

- `syncId`
- `studioSessionId`
- `projectId`
- `workspaceId`
- `baseCloudRevision`
- `baseCloudRevisionHash`
- `localCheckpointId`
- `proposedMutationId`
- `productMeaningSummary`
- `affectedScreens`
- `affectedFlows`
- `affectedFiles`
- `candidateArtifacts`
- `evidenceRefs`
- `approvalState`
- `verificationSummary`
- `createdAt`

Optional fields:

- `packageCandidateId`
- `recoveryPointId`
- `localDirtySummary`
- `conflictHints`
- `nextRecommendedAction`

Forbidden fields:

- local secrets
- provider tokens
- raw unrestricted logs
- environment variable values
- unrelated folder contents
- unredacted local paths
- raw private command history

## Accepted Sync Result

Required fields:

- `syncId`
- `acceptedMutationId`
- `projectId`
- `previousCloudRevision`
- `newCloudRevision`
- `acceptedProductMeaningSummary`
- `historyEntryId`
- `recoveryPointId`
- `acceptedAt`

Allowed evidence:

- redacted test summary
- redacted run summary
- screenshot metadata
- package candidate metadata
- shortened logs

Web may show accepted sync only after this result exists.

## Rejected Sync Result

Required fields:

- `syncId`
- `projectId`
- `baseCloudRevision`
- `currentCloudRevision`
- `rejectionReason`
- `localWorkPreserved`
- `safeRetryAvailable`
- `rejectedAt`

Allowed user actions:

- open Studio review
- keep local draft
- rebase against cloud
- discard local proposal
- retry after blocker resolution

Web must not show rejected work as accepted truth.

## Stale-State Rules

Studio must compare:

- project id
- workspace id
- cloud revision
- cloud revision hash
- product lineage
- relevant screen/flow ids
- local checkpoint base

If cloud changed while Studio worked locally:

- stop before sync
- show cloud change
- show local change
- identify conflict or safe merge area
- require user choice when product meaning changes

Studio must not:

- overwrite cloud silently
- overwrite local silently
- treat stale local work as current truth
- accept stale sync automatically

## Conflict Rules

Conflict is product-level, not only file-level.

Conflict can happen when:

- same screen changed locally and in cloud
- same product flow changed locally and in cloud
- local work changes a promise that cloud already changed
- package candidate is based on stale product truth
- local evidence contradicts current cloud state
- user approval was given against an old revision

Conflict UI order:

1. guided Nexus explanation
2. recommended safe option
3. concise cloud/local comparison
4. detailed file or diff comparison only on request

## Evidence Rules

Sync returns both change and proof when available.

Evidence may include:

- tests passed
- tests failed
- screenshots
- shortened logs
- runtime status
- package status
- failure summaries
- restore point
- next recommendation

Evidence must be:

- redacted
- source-labeled
- tied to a project and sync id
- marked as evidence only unless accepted by mutation/release gate

Evidence must not:

- include secrets
- include raw environment dumps
- become Product Graph truth by itself
- imply release readiness

## Offline Queue Rules

Offline queue may hold:

- local checkpoints
- local evidence
- candidate artifacts
- proposed mutation drafts
- retry metadata

Offline queue must not:

- mark cloud accepted truth
- publish
- release
- connect providers
- resolve stale cloud conflicts
- promise future acceptance

On reconnect:

1. fetch current cloud revision
2. compare against local base revision
3. classify as synced, stale, or conflict
4. route to pre-sync review or conflict flow
5. submit only explicit proposed mutation envelopes

## Failure And Retry

Safe failure states:

- cloud unavailable
- permission missing
- approval missing
- verification failed
- stale revision
- conflict unresolved
- payload contains forbidden data
- evidence redaction failed
- sync timeout
- mutation gate rejected

Failure behavior:

- do not mutate cloud truth
- preserve local work when safe
- explain what failed
- explain what did not happen
- show retry only when safe
- store recovery state

## Web Display Rules

Web may show:

- `מסונכרן`
- `יש שינויים מקומיים`
- `ממתין לסנכרון`
- `סנכרון נדחה`
- `יש התנגשות`
- `אופליין מוגבל`
- evidence summary
- accepted mutation summary
- rejected mutation reason

Web must not show:

- sync success before accepted result
- rejected work as accepted
- evidence as canonical truth
- offline work as cloud truth
- package candidate as release
- local folder state as Product Graph truth

## V1 Contract-Only Boundary

Until Desktop implementation exists, all sync states are contract-only:

- `local-dirty`
- `sync-ready`
- `pre-sync-review`
- `syncing`
- `accepted`
- `rejected`
- `stale`
- `conflict`
- `offline-bounded`

Web and Studio designs may represent them.

They must not be claimed as live reality until real implementation verifies them.

## Closure Criteria

`STD-SYNC-001` can be marked `trueGreen` as a planning/sync-contract task only when:

- this contract exists
- it consumes `STD-FND-002` and `STD-DOOR-001`
- sync states are defined
- stale rejection is defined
- conflict rules are defined
- bounded offline work is defined
- pre-sync review is defined
- sync proposal envelope is defined
- accepted/rejected sync results are defined
- Web display rules are defined
- Desktop-dependent sync states are marked contract-only

## Verification

Verification performed:

- contract defines `synced`, `local-dirty`, `syncing`, `stale`, `conflict`, `rejected`, and `offline-bounded`
- contract defines pre-sync review as product meaning first
- contract defines sync proposal envelope
- contract defines accepted and rejected sync results
- contract defines stale and conflict behavior
- contract defines offline queue limits
- contract defines Web display limits

Verification not performed:

- no Desktop app implemented
- no live sync engine implemented
- no conflict merge runtime implemented
- no offline queue runtime implemented
- no browser or Desktop verification performed

## Status

`STD-SYNC-001` may be marked `trueGreen` as a planning/sync-contract task only.

No Studio implementation task is trueGreen.

Next canonical task:

```txt
STD-PERM-001 — Lock permissions/files/secrets/computer boundary
```
