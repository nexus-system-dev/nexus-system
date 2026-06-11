# Nexus Studio Local Runtime And Preview Contract

Date: `2026-06-02`
Task: `STD-RUN-001`
Status: `canonical runtime contract created`
Depends on:

- `STD-PERM-001`
- `STD-SYNC-001`

Consumes:

- `docs/operating-system/nexus-studio-permissions-files-secrets-computer-contract-2026-06-02.md`
- `docs/operating-system/nexus-studio-sync-stale-offline-contract-2026-06-02.md`
- `docs/operating-system/nexus-studio-cloud-local-truth-contract-2026-06-02.md`
- `docs/operating-system/nexus-studio-v1-screen-workspace-map-2026-06-02.md`

## Purpose

This contract locks Studio local runtime and preview behavior before any Desktop implementation.

It defines:

- local runtime scope
- run action classes
- existing-command-first rule
- new command proposal rule
- permission gates
- run approval rules
- dependency install boundary
- local preview boundary
- runtime evidence boundary
- failure display
- safe error redaction
- proposed fix classification
- what Studio and Web may show before real local runtime exists

Core law:

```txt
Studio may run local preview/build flows only for the active Nexus project, through explicit permissions and bounded project commands.
```

Second law:

```txt
Runtime output is evidence, not Product Graph truth.
```

## Scope

This task creates a planning/runtime-contract artifact only.

It does not implement:

- Desktop runtime engine
- local command execution
- local preview server
- process manager
- dependency installation
- log collection runtime
- error parser
- file write fixes
- browser or Desktop verification

It may be marked `trueGreen` only as a planning/runtime-contract task.

No Desktop implementation task may become `trueGreen` from this contract alone.

## Runtime Ownership

Studio Local Agent owns:

- understanding what the user wants to run
- explaining the run intent
- explaining risks
- explaining failures
- proposing next action

Permission Engine owns:

- whether folder/read/run/install/secrets permissions exist
- whether the command class is allowed
- whether approval is required
- whether action is blocked

Runtime Engine owns, after implementation:

- command discovery
- process execution
- process stop
- preview URL creation
- log capture
- status reporting

Sync/Mutation engines own:

- whether runtime output supports proposed mutation
- whether fixes become product truth
- whether evidence may attach to sync/release

## Runtime Action Classes

Allowed action classes in V1:

- `discover-run-command`
- `run-existing-command`
- `open-local-preview`
- `stop-running-process`
- `run-project-test`
- `collect-redacted-runtime-evidence`
- `propose-missing-dependency-install`
- `propose-runtime-fix`

Not allowed in V1:

- unrestricted shell
- arbitrary command execution
- destructive file operations
- global dependency installation by default
- background machine-wide watchers
- provider calls without provider permission
- deploy/release from local machine
- automatic dependency installation
- automatic file fixes without write approval

## Existing-Command-First Rule

When the user clicks:

```txt
הרץ מקומית
```

Studio first looks for a clear existing project command.

Allowed command sources:

- project manifest scripts
- documented local run command in the project
- previously approved project run command
- canonical project runtime metadata returned by Nexus

If a clear command exists:

- Studio may propose running it
- Studio must explain what will run
- run still requires run permission
- run still requires active project/folder match

Studio must not invent a command when a clear existing command exists.

## New Or Uncertain Command Rule

If no clear command exists, or if the command is ambiguous:

Studio may propose a new command.

Before running it, Studio must show:

- proposed command class
- why this command is likely correct
- what it may do
- what files it may read
- whether it may write files
- whether it needs dependency installation
- whether approval is required

Studio must not run a new or uncertain command automatically.

## Run Permission Gate

Local run requires:

- active project identity
- valid folder grant when files are needed
- read permission when command discovery requires files
- run permission
- no folder mismatch
- no revoked permission
- Studio Local Agent intent explanation
- Permission Engine approval

Run must stop if:

- project identity mismatches
- folder is missing
- folder was revoked
- command is outside active project scope
- command class is not allowed
- secrets are required but missing
- approval is missing

## Preview Boundary

Local preview may show:

- local preview URL or embedded preview after runtime success
- run state
- screenshot/evidence metadata
- current local-only status
- whether preview reflects unsynced local work

Local preview must not imply:

- cloud truth changed
- product is released
- sync succeeded
- tests passed unless tests actually ran
- package is ready

Preview output is `local-evidence`.

It may support a proposed mutation, but it is not a mutation by itself.

## Dependency Installation Boundary

If runtime fails because a dependency is missing:

Studio may propose installation.

Studio must show:

- dependency name when non-sensitive
- why it is needed
- what install command or action class is proposed
- files that may change
- risk
- required permission
- approval action

Install requires:

- install permission
- write permission if project files may change
- explicit approval

Studio must not:

- install silently
- globally install by default
- modify dependency files without approval
- claim install succeeded without runtime result

## Secrets Boundary During Run

Secrets may be used only for local run.

Studio may show:

- `משתנה סודי נמצא`
- `משתנה סודי חסר`

Studio must not show:

- secret values
- token values
- env dumps
- provider credentials
- secrets in logs
- secrets in screenshots
- secrets in evidence
- secrets in sync envelope

If a secret is missing:

- run can fail safely
- Studio may explain missing-secret status
- Studio may ask for local secret permission/input if a later task implements it
- Studio must not guess the secret

## Runtime Evidence Contract

Runtime evidence may include:

- run started
- run stopped
- run succeeded
- run failed
- preview opened
- test passed
- test failed
- redacted log summary
- filtered error line
- screenshot metadata
- non-sensitive package or dependency name

Runtime evidence must include:

- project id
- local session id
- command class
- timestamp
- evidence source
- redaction status
- whether evidence is local-only or syncable

Runtime evidence must not:

- mutate Product Graph
- mark release ready
- bypass approval
- include secrets
- include raw unrestricted logs
- include sensitive full user paths

## Failure Display Contract

Failure display order:

1. human explanation
2. why it matters
3. what can happen next
4. shortened technical summary
5. optional full detail disclosure after redaction

Allowed visible error content:

- failed stage
- general command name
- non-sensitive package name
- filtered error line
- proposed fix
- whether permission is missing
- whether dependency is missing

Forbidden visible error content:

- secrets
- keys
- tokens
- raw environment variables
- sensitive full user paths
- sensitive internal addresses
- private file contents
- unrestricted raw logs as first view

## Proposed Fix Classification

When runtime fails, Studio may propose a fix.

Fix classification:

- small local fix
- dependency install
- permission fix
- configuration fix
- product behavior change
- major technical change
- unknown / needs clarification

Small local fix may be prepared as a proposal.

Real file write requires:

- write permission
- action approval
- mutation classification when product meaning changes

Dependency install requires:

- install permission
- write permission when project files change
- approval

Product behavior change requires:

- Mutation / Change Agent classification
- pre-sync review when local work is later synced

Studio must not:

- write fixes automatically
- install dependencies automatically
- change product behavior through runtime repair alone

## Stop Behavior

When user clicks:

```txt
עצור
```

Studio should stop the active local process safely.

Stop result is evidence only.

If stop fails:

- explain what failed
- avoid exposing raw process internals by default
- show safe next action

## Web Display Boundary

Web may show runtime status only after Studio returns it.

Web may show:

- local run unavailable
- run permission required
- run started
- run failed
- run evidence returned
- preview evidence returned

Web must not show:

- local run succeeded before Studio returns evidence
- local preview exists before Studio returns it
- tests passed without test evidence
- dependency installed without install result
- runtime output as cloud truth

## V1 Contract-Only Boundary

Until Desktop implementation exists, all runtime states are contract-only:

- command discovered
- run available
- run started
- run succeeded
- run failed
- preview opened
- process stopped
- dependency missing
- install proposed
- fix proposed
- runtime evidence returned

Studio and Web designs may represent them.

They must not be claimed as live reality until real Desktop runtime implementation verifies them.

## Closure Criteria

`STD-RUN-001` can be marked `trueGreen` as a planning/runtime-contract task only when:

- this contract exists
- it consumes `STD-PERM-001`
- runtime action classes are defined
- existing-command-first rule is defined
- new command approval rule is defined
- run permission gate is defined
- preview boundary is defined
- dependency install boundary is defined
- secrets boundary during run is defined
- runtime evidence boundary is defined
- failure display and redaction are defined
- Desktop-dependent runtime states are marked contract-only

## Verification

Verification performed:

- contract defines local runtime scope
- contract requires run through permission gate
- contract uses existing project commands first
- contract blocks new command execution without approval
- contract blocks silent dependency install
- contract defines failure display as human explanation before logs
- contract defines runtime output as evidence only
- contract forbids secrets and sensitive data in visible errors/evidence

Verification not performed:

- no Desktop app implemented
- no local command execution implemented
- no local preview server implemented
- no dependency installation implemented
- no runtime evidence collector implemented
- no browser or Desktop verification performed

## Status

`STD-RUN-001` may be marked `trueGreen` as a planning/runtime-contract task only.

No Studio implementation task is trueGreen.

Next canonical task:

```txt
STD-PKG-001 — Define packaging/debug/release handoff contract
```
