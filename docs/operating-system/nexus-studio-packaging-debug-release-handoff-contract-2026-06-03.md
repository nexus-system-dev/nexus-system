# Nexus Studio Packaging, Debugging, And Release Handoff Contract

Date: `2026-06-03`
Task: `STD-PKG-001`
Status: `canonical packaging/debug/release-handoff contract created`
Depends on:

- `STD-RUN-001`
- `STD-PERM-001`
- `STD-SYNC-001`

Consumes:

- `docs/operating-system/nexus-studio-local-runtime-preview-contract-2026-06-02.md`
- `docs/operating-system/nexus-studio-permissions-files-secrets-computer-contract-2026-06-02.md`
- `docs/operating-system/nexus-studio-sync-stale-offline-contract-2026-06-02.md`
- `docs/operating-system/nexus-studio-cloud-local-truth-contract-2026-06-02.md`
- `docs/operating-system/nexus-studio-v1-screen-workspace-map-2026-06-02.md`

## Purpose

This contract locks Studio packaging, debug evidence, and release handoff before any Desktop implementation.

It defines:

- what packaging means in Studio V1
- what debugging means in Studio V1
- what a package candidate is
- what debug evidence is
- what blocks packaging
- what may move from Studio to Web Release
- what must remain local
- how package/debug evidence is redacted
- how Studio hands a candidate to Web without claiming release
- what Studio and Web may show before real Desktop packaging exists

Core law:

```txt
Studio packages candidates. Web Release decides release truth.
```

Second law:

```txt
Debug and package output are candidate evidence until Nexus accepts them through the relevant gate.
```

## Scope

This task creates a planning/package-debug-release-handoff contract only.

It does not implement:

- Desktop package builder
- debug engine
- package artifact creation
- package signing
- deploy
- release execution
- release gate integration
- evidence collector runtime
- browser or Desktop verification

It may be marked `trueGreen` only as a planning/package-debug-release-handoff contract task.

No Desktop implementation task may become `trueGreen` from this contract alone.

## Ownership

Studio owns:

- local package candidate preparation
- local debug evidence preparation
- package candidate explanation
- package failure explanation
- handoff metadata to Web Release

Web Release owns:

- release readiness
- public release decision
- release gates
- release history
- rollback/recovery after release
- public deployment/publishing truth

Sync/Mutation owns:

- whether package/debug evidence attaches to a proposed mutation
- whether package candidate metadata can enter cloud truth
- whether stale or conflicting candidates are rejected

History owns:

- accepted evidence summary
- rejected package/sync reasons when user-relevant
- release handoff events
- recovery points

## Studio V1 Packaging Meaning

Allowed Studio V1 packaging outputs:

- local test artifact
- preview package
- testable build
- release candidate
- package failure evidence

Forbidden Studio V1 packaging claims:

- public release
- deploy complete
- production live
- signed release unless signing is separately approved
- release-ready without Web Release gate
- package accepted into Product Graph truth without sync/mutation acceptance

User-facing label:

```txt
מועמד לשחרור
```

Forbidden label:

```txt
שוחרר
```

unless Web Release has accepted and executed release truth.

## Package Candidate Definition

A package candidate is `candidate-artifact`.

It may include:

- candidate id
- project id
- base cloud revision
- local checkpoint id
- package type
- package version/candidate label
- affected files
- affected screens/flows
- tests/evidence summary
- local changes included
- local changes excluded
- what remains local
- package status
- handoff eligibility

It must not include:

- local secrets
- provider credentials
- unredacted logs
- unrestricted local paths
- unrelated folders
- unapproved local changes

## Pre-Package Review

Before packaging, Studio must show:

- what enters the package
- what changed
- affected files
- affected screens/flows
- sync state
- unapproved local changes
- failed tests
- missing permissions
- stale/conflict risk
- package permission state
- what remains local
- what can move to Web Release

Packaging must stop when:

- package permission is missing
- folder is missing/mismatched
- local changes are unapproved
- blocking tests failed
- secrets would be included
- cloud revision is stale and affects the package
- package contains forbidden data
- release handoff would misrepresent candidate as release

## Package Screen Contract

The Studio package screen must show a candidate card.

The card must include:

- candidate label
- what was packaged
- version/candidate id
- base cloud revision
- tests passed
- tests failed
- affected files
- what remains local
- evidence summary
- handoff status
- next safe action

Allowed actions:

- `פתח ראיות`
- `נסה לארוז שוב`
- `חזור לדיבוג`
- `שלח ל־Release ב־Web`
- `השאר מקומי`
- `בטל מועמד`

Forbidden actions:

- `פרסם עכשיו` from Studio
- `שחרר` from Studio
- local deploy without Web Release gate
- package with unapproved local changes

## Debug Evidence Meaning

Debug output is `local-evidence`.

It may include:

- human explanation
- failed stage
- filtered error line
- shortened log
- proposed fix classification
- screenshot metadata
- run/test/package failure summary
- permission blocker
- dependency blocker
- stale/conflict blocker

It must not include:

- secrets
- tokens
- raw environment variables
- sensitive full paths
- private file contents
- unrestricted raw logs
- provider credentials

Debug evidence may support:

- proposed fix
- proposed mutation
- package retry
- release readiness review
- history explanation

Debug evidence cannot:

- change Product Graph
- mark release ready
- bypass permissions
- bypass sync/mutation gate

## Debug Area Contract

Studio V1 debugging stays inside the project workspace.

It starts with:

1. what failed
2. why it matters
3. what can happen now
4. shortened technical detail
5. optional expanded detail after redaction

V1 does not open a standalone heavy debugger screen by default.

Debug fixes must be classified through:

- Studio Local Agent
- Permission Engine
- Mutation / Change Agent when product meaning changes

## Release Handoff Contract

Studio may hand a package candidate or debug evidence to Web Release.

The handoff may include:

- package candidate id
- package type
- base cloud revision
- local checkpoint id
- evidence refs
- test summary
- affected files/screens/flows
- known blockers
- local remainder
- recommended next action

The handoff must not include:

- secrets
- raw logs
- raw local paths
- unapproved changes
- provider credentials

Web Release must decide:

- whether candidate is eligible
- whether verification is sufficient
- whether stale/conflict exists
- whether release can proceed
- whether rollback/recovery is defined

Studio must not decide public release truth.

## Handoff States

Allowed states:

- `package-not-started`
- `package-blocked`
- `package-running`
- `package-failed`
- `package-candidate-created`
- `debug-evidence-created`
- `handoff-ready`
- `handoff-sent-to-web-release`
- `handoff-rejected`
- `release-gate-pending`
- `release-gate-accepted`
- `release-gate-rejected`

Important distinction:

```txt
release-gate-accepted is not the same as public release executed.
```

Public release requires Web Release execution.

## Evidence Attachment

Package/debug evidence may attach to:

- sync proposal
- package candidate
- release handoff
- history entry
- recovery point

Evidence must be:

- redacted
- source-labeled
- tied to project id
- tied to candidate id or sync id
- marked local-only or cloud-accepted

Evidence must not become truth by itself.

## Failure Behavior

Safe package/debug failures:

- package permission missing
- run permission missing
- folder missing
- stale cloud revision
- local conflict
- tests failed
- build failed
- secrets would leak
- evidence redaction failed
- package includes unapproved change
- handoff to Web failed
- release gate rejected

Failure response:

1. state what failed
2. state what did not happen
3. preserve evidence when safe
4. show retry/debug/return-to-Web action
5. do not claim release

## Web Display Boundary

Web may show only what Studio or Web Release truthfully returned.

Web may show:

- package candidate exists
- debug evidence exists
- handoff ready
- handoff received
- release gate pending
- release gate rejected
- release gate accepted

Web must not show:

- public release from Studio candidate alone
- release-ready without Web Release gate
- package success before Studio returns candidate
- debug evidence as canonical product truth
- package candidate as accepted mutation
- local package as deployment

## V1 Contract-Only Boundary

Until Desktop implementation exists, all package/debug states are contract-only:

- `package-running`
- `package-failed`
- `package-candidate-created`
- `debug-evidence-created`
- `handoff-ready`
- `handoff-sent-to-web-release`
- `release-gate-pending`
- `release-gate-accepted`
- `release-gate-rejected`

Studio and Web designs may represent them.

They must not be claimed as live reality until real Desktop packaging/debug and Web Release integration verify them.

## Closure Criteria

`STD-PKG-001` can be marked `trueGreen` as a planning/package-debug-release-handoff contract task only when:

- this contract exists
- it consumes `STD-RUN-001`
- Studio package outputs are candidate evidence
- debug outputs are local evidence
- release handoff to Web Release is defined
- packaging blockers are defined
- package candidate card is defined
- evidence attachment is defined
- Web display boundaries are defined
- Desktop-dependent package/debug states are marked contract-only

## Verification

Verification performed:

- contract defines package candidate as candidate artifact
- contract defines debug output as local evidence
- contract blocks package as release truth
- contract defines pre-package review
- contract defines release handoff to Web Release
- contract defines package/debug failures
- contract defines Web display boundaries
- contract marks Desktop-dependent package/debug states as contract-only

Verification not performed:

- no Desktop app implemented
- no package builder implemented
- no debug engine implemented
- no package artifact created
- no Web Release integration implemented
- no browser or Desktop verification performed

## Status

`STD-PKG-001` may be marked `trueGreen` as a planning/package-debug-release-handoff contract task only.

No Studio implementation task is trueGreen.

Next canonical task:

```txt
STD-DESIGN-001 — Lock Studio V1 design/tooling contract
```
