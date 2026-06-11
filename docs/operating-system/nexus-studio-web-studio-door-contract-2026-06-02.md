# Nexus Studio Web ↔ Studio Door Contract

Date: `2026-06-02`
Task: `STD-DOOR-001`
Status: `canonical door contract created`
Depends on:

- `STD-FND-002`
- `STD-SCREENS-001`
- `SURF-008`

Consumes:

- `docs/operating-system/nexus-studio-cloud-local-truth-contract-2026-06-02.md`
- `docs/operating-system/nexus-studio-web-entry-contract-2026-06-02.md`
- `docs/operating-system/nexus-studio-v1-screen-workspace-map-2026-06-02.md`

## Purpose

This contract locks the full Web ↔ Studio door before any Desktop implementation.

It defines:

- how Nexus Web opens Nexus Studio
- what Web may show before Desktop exists
- what Web must not promise
- what happens when opening fails
- how Studio confirms a handoff
- how Studio returns status, evidence, local state, and mutation outcomes to Web
- how the door preserves cloud truth, local working state, evidence, candidates, accepted mutations, and rejected mutations

Core law:

```txt
Web opens the Studio door. Studio performs local work. Cloud Product Graph remains canonical.
```

Second law:

```txt
The Web door can request local power. It cannot pretend local power already happened.
```

## Scope

This task creates a planning/contract artifact only.

It does not implement:

- Desktop Studio
- real install detection
- deep-link registration
- deep-link browser verification
- local filesystem access
- local runtime
- live sync
- accepted mutation execution
- rejected mutation execution
- evidence ingestion runtime

It may be marked `trueGreen` only as a planning/door-contract task.

No Desktop implementation task may become `trueGreen` from this contract alone.

## Door Ownership

Web owns:

- deciding when a local action needs Studio
- explaining why Web cannot perform the local action
- showing the correct door state
- preparing a bounded handoff envelope
- opening or retrying the handoff attempt
- receiving Studio return status
- displaying returned status/evidence without overclaiming truth
- keeping cloud Product Graph canonical

Studio owns:

- confirming the handoff
- validating project identity and cloud revision
- requesting local permissions when needed
- executing local actions only after permission and approval
- returning local dirty state, evidence, package status, and sync proposals
- returning accepted or rejected mutation outcomes only after the relevant sync/mutation gate decides

The sync/mutation engine owns:

- accepting or rejecting Studio-originated proposed mutations
- detecting stale cloud truth
- detecting conflicts
- preserving rejected local work as local/recovery state when relevant
- updating canonical Product Graph only after acceptance

## When Web May Open The Door

Web may recommend Studio only when the requested action honestly requires the user's computer.

Allowed reasons:

- local files
- local folder binding
- local runtime
- local preview
- debugging
- heavy build
- package candidate creation
- local secrets for local run
- offline-bounded local work
- existing local project import/open
- permission-gated local evidence

Web must not recommend Studio just because:

- the route is named `/studio`
- a screen looks technical
- a generic Developer page would be convenient
- Web wants to imply more capability than exists

## Web Door States

### `not-installed`

Meaning:

```txt
Web has no proof that Nexus Studio is installed or openable.
```

Web may show:

- what Nexus Studio is
- why this action requires local Studio
- what Web cannot do
- what can continue in Web
- install/download action
- manual install fallback

Web must not show:

- connected status
- local run availability
- local file availability
- sync success
- evidence returned
- mutation accepted

Primary action:

```txt
התקן את Nexus Studio
```

Secondary action:

```txt
המשך ב־Web
```

### `installed-not-connected`

Meaning:

```txt
Studio appears installed or openable, but this project is not locally bound.
```

Web may show:

- Studio appears available
- project is not connected
- what Studio will receive after approval
- approval requirement
- local folder permission requirement if relevant

Web must not bind automatically.

Primary action:

```txt
חבר את הפרויקט ל־Studio
```

### `handoff-attempted`

Meaning:

```txt
Web created a bounded handoff envelope and attempted to open Studio.
```

Web may show:

- opening attempt in progress
- timeout/retry affordance
- continue-in-Web fallback

Web must not treat this as success.

This state may transition only after:

- Studio confirms open
- the attempt times out
- browser/deep link fails
- user cancels

### `handoff-confirmed`

Meaning:

```txt
Studio confirmed it received the handoff envelope.
```

Web may show:

- Studio received the request
- waiting for project connection or action result

Web must not claim:

- folder permission exists
- run succeeded
- sync happened
- mutation accepted

### `connected-project-bound`

Meaning:

```txt
Studio confirmed the project identity, cloud revision, and approved local binding.
```

Web may show:

- connected Studio state
- last known local sync state
- last known Studio version if available
- `פתח ב־Nexus Studio`
- `המשך ב־Studio`

Web must not promise:

- local folder still exists
- permissions are still valid
- local run will succeed
- sync will be accepted
- package candidate is release-ready

### `local-dirty`

Meaning:

```txt
Studio reported unsynced local working state.
```

Web may show:

- unsynced local work exists
- open Studio to review
- cloud work can continue only with caution

Web must not:

- overwrite local state silently
- claim local work is accepted
- release without resolving relevant local truth

### `evidence-returned`

Meaning:

```txt
Studio returned evidence that explains what happened locally.
```

Examples:

- run log summary
- screenshot metadata
- build/test result
- package candidate metadata
- debug result

Web may display evidence as evidence only.

Web must not treat evidence as:

- canonical product truth
- accepted mutation
- release approval
- proof of success beyond the returned evidence

### `proposed-mutation-returned`

Meaning:

```txt
Studio returned an explicit proposed mutation envelope.
```

Web may show:

- what Studio proposes to change
- what product meaning is affected
- what needs approval or verification

Web must route it through the sync/mutation gate.

Web must not apply it directly.

### `mutation-accepted`

Meaning:

```txt
The sync/mutation gate accepted the Studio-originated proposed mutation into cloud Product Graph truth.
```

Web may show:

- accepted change summary
- updated cloud truth state
- history/recovery entry
- next recommended step

Web must include:

- accepted mutation id
- cloud revision after acceptance
- evidence summary when relevant

### `mutation-rejected`

Meaning:

```txt
The sync/mutation gate rejected the Studio-originated proposed mutation.
```

Web may show:

- rejection reason
- whether local work remains recoverable
- return to Studio for review
- retry after resolving blocker
- keep-local/dismiss option where relevant

Web must not:

- partially accept rejected truth silently
- present rejected work as release-ready
- erase local work without explicit discard action

### `sync-rejected`

Meaning:

```txt
Studio attempted sync, but the sync gate rejected it because it was stale, conflicted, failed verification, or lacked permission.
```

This is a sync outcome, not a product success state.

Web may show:

- rejection reason
- return to Studio
- conflict/stale guidance

### `version-mismatch`

Meaning:

```txt
Studio version cannot safely consume or return this door contract.
```

Web may show:

- update Studio action
- continue-in-Web fallback

Web must not:

- open local mutation flow through incompatible protocol
- downgrade payload silently

### `stale-project-binding`

Meaning:

```txt
Studio binding exists, but its project identity or cloud revision is stale.
```

Web may show:

- connected but stale state
- open Studio for reconciliation

Web must not claim sync is clean.

### `offline-bounded`

Meaning:

```txt
Studio may continue local bounded work, but Web/cloud cannot receive new truth until reconnection.
```

Web must not:

- claim cloud sync
- release local changes
- accept mutation

### `handoff-failed`

Meaning:

```txt
The Web-to-Studio attempt did not complete safely.
```

Failure categories:

- `studio-not-detected`
- `deep-link-blocked`
- `deep-link-timeout`
- `desktop-not-responding`
- `version-mismatch`
- `project-mismatch`
- `stale-project-binding`
- `local-folder-missing`
- `permission-denied`
- `offline-unavailable`
- `handoff-expired`
- `user-cancelled`

Web must show:

- what failed
- what can continue in Web
- safe next action

Web must not claim local success.

## Web-To-Studio Handoff Envelope

Required fields:

- `handoffId`
- `handoffProtocolVersion`
- `projectId`
- `projectName`
- `workspaceId`
- `cloudRevision`
- `cloudRevisionHash`
- `requestedAction`
- `requiredLocalCapability`
- `entryState`
- `returnToWebUrl`
- `userVisibleReason`
- `boundaryReason`
- `createdAt`
- `expiresAt`

Optional fields:

- `currentScreen`
- `currentFlow`
- `artifactExpectation`
- `lastKnownStudioVersion`
- `preferredLocalAction`

Forbidden fields:

- secrets
- provider tokens
- local credentials
- raw local paths
- environment variable values
- private logs
- unrelated files
- arbitrary filesystem contents
- raw command history

## Deep-Link Boundary

V1 may define this deep-link shape:

```txt
nexus-studio://open?handoffId=...
```

The deep link means:

```txt
Web requested Studio to open a handoff.
```

The deep link does not prove:

- Studio is installed
- Studio opened
- Studio accepted the project
- local folder exists
- local permission exists
- local run succeeded
- evidence exists
- sync succeeded
- mutation was accepted

Deep-link success requires Desktop confirmation through the return/status channel.

## Studio Confirmation Requirement

After receiving a handoff, Studio must show a short confirmation before local workspace entry:

```txt
פותחים את הפרויקט הזה ב־Nexus Studio
```

The confirmation must show:

- project name
- connection state
- what Studio received
- cloud revision
- requested action
- required local permission if any
- primary action `פתח פרויקט`

If no special permissions are required, the confirmation may be brief and nearly immediate.

It must still make the Web-to-local transition visible.

## Studio-To-Web Return Envelope

Required fields:

- `handoffId`
- `projectId`
- `studioSessionId`
- `doorState`
- `cloudRevisionSeen`
- `createdAt`
- `resultStatus`

Allowed `resultStatus` values:

- `opened`
- `connected`
- `permission-denied`
- `local-dirty`
- `evidence-returned`
- `proposed-mutation-returned`
- `mutation-accepted`
- `mutation-rejected`
- `sync-rejected`
- `package-candidate-created`
- `handoff-failed`
- `returned-without-action`

Optional fields:

- `localStateSummary`
- `evidenceSummary`
- `candidateArtifactSummary`
- `proposedMutationSummary`
- `acceptedMutationId`
- `rejectedMutationReason`
- `syncRejectionReason`
- `packageCandidateId`
- `recoveryPointId`
- `nextRecommendedAction`

Forbidden return fields:

- local secrets
- raw unrestricted logs
- unredacted filesystem paths
- private environment values
- provider credentials
- unrelated folder contents

## Promise Boundary Matrix

| Web visible claim | Allowed before Desktop implementation? | Required truth before claim |
| --- | --- | --- |
| Studio exists as a local Nexus app | yes | canonical product law |
| Studio is installed | no | real install detection or Desktop confirmation |
| Studio opened | no | `handoff-confirmed` |
| Project connected | no | `connected-project-bound` |
| Local folder available | no | Studio permission/folder validation |
| Local run available | no | Studio run permission and project command validation |
| Local run succeeded | no | returned local evidence |
| Evidence exists | no | `evidence-returned` |
| Proposed change exists | no | `proposed-mutation-returned` |
| Change accepted into cloud truth | no | `mutation-accepted` |
| Change rejected | no | `mutation-rejected` or `sync-rejected` |
| Sync succeeded | no | sync engine accepted result |
| Package is release-ready | no | Release gate, not Studio door |
| Web can continue without Studio | yes | Web fallback state |

## Failure Behavior

Every failure must follow this order:

1. state what failed
2. state what did not happen
3. state what can continue in Web
4. offer safe next action
5. preserve retry or recovery state when relevant

Safe failure examples:

- deep link blocked -> show retry/manual open and continue-in-Web
- Studio not installed -> show install fallback
- Studio opened but did not confirm -> stay `handoff-attempted` until timeout, then `handoff-failed`
- project mismatch -> reject binding and ask user to reconnect
- stale cloud revision -> route to conflict/stale review
- local dirty state -> show review in Studio, do not release
- sync rejected -> show rejection reason, do not accept mutation
- evidence returned with no mutation -> show evidence only, do not change Product Graph

## What Web May Show

Web may show:

- Studio explanation
- install/connect status if truthful
- door state
- bounded handoff action
- continue-in-Web fallback
- returned evidence summary
- returned local dirty summary
- accepted mutation summary after acceptance
- rejected mutation reason after rejection
- package candidate metadata as candidate only

## What Web Must Not Promise

Web must not promise:

- installed Studio without real detection or confirmation
- successful deep link without Desktop confirmation
- project binding without Studio approval
- local folder availability without validation
- local file access from Web
- local runtime success
- local dependency installation
- local secrets access
- live sync before sync engine implementation
- accepted mutation before mutation/sync gate acceptance
- rejected mutation before mutation/sync gate rejection
- package candidate as release
- offline work as cloud truth
- `/studio` Web route as Desktop Studio

## Relationship To Current Web `/studio`

The Web `/studio` route may only be a boundary surface.

It may:

- explain Studio
- show connection/availability states when truthful
- show install/connect/open actions
- show failure and fallback states
- show what remains in Web and what requires Studio

It must not:

- become the Studio app
- show fake local workspace power
- claim Desktop capabilities from browser state alone
- create a Developer page and call it Studio
- mark local work as done without Desktop return state

## V1 Contract-Only States

Until Desktop implementation exists, these states are contract-only:

- `installed-not-connected`
- `handoff-attempted`
- `handoff-confirmed`
- `connected-project-bound`
- `local-dirty`
- `evidence-returned`
- `proposed-mutation-returned`
- `mutation-accepted`
- `mutation-rejected`
- `sync-rejected`
- `offline-bounded`

Web may design for them.

Web may not claim them as live reality until real implementation verifies them.

## Closure Criteria

`STD-DOOR-001` can be marked `trueGreen` as a planning/door-contract task only when:

- this contract exists
- it consumes `STD-FND-002`
- it defines Web open behavior
- it defines Studio return behavior
- it defines failure behavior
- it defines what Web may show
- it defines what Web must not promise
- it explicitly marks Desktop-dependent states as contract-only until implementation
- maps and product docs point to it

## Verification

Verification performed:

- contract defines Web open states
- contract defines Studio return envelope
- contract defines failure categories
- contract defines deep-link boundary
- contract defines promise boundary matrix
- contract consumes the `STD-FND-002` cloud/local truth-state model

Verification not performed:

- no Desktop app implemented
- no real install detection implemented
- no real deep-link registration implemented
- no live deep-link test performed
- no live sync implemented
- no browser route changed in this task

## Status

`STD-DOOR-001` may be marked `trueGreen` as a planning/door-contract task only.

No Studio implementation task is trueGreen.

Next canonical task:

```txt
STD-SYNC-001 — Lock sync, stale-state, and bounded offline model
```
