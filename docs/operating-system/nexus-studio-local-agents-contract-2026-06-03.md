# Nexus Studio Local Agents Contract

Date: 2026-06-03

Canonical task: `STD-AGENT-001`

Status: canonical planning contract only.

No Studio implementation task is trueGreen from this document. No desktop agent is live, no local tool execution is verified, no provider path is proven, and no Web surface may claim that Studio agents are operating until a real Desktop implementation and live proof exist.

## 1. Core Law

Studio may have local agents, but only as bounded local-role agents.

They are not generic desktop operators, not hidden shell agents, not unrestricted file writers, and not a second product-truth system.

```txt
Studio agents explain, decide meaning, propose, verify, or route local work.
Permission, sync, history, runtime, and package engines enforce what can actually happen.
Cloud truth remains canonical.
```

## 2. Agent Versus Engine

An agent is responsible for interpretation and decision support:

- understanding the user's local intent
- explaining local risk
- deciding whether a local action is small, dangerous, or product-changing
- proposing a safe action
- producing structured outputs Nexus can use
- escalating to another agent or engine when needed

An engine is responsible for state and execution:

- permission grants and revocation
- folder binding
- command execution
- local evidence capture
- sync proposal comparison
- accepted/rejected mutation state
- local checkpointing
- package candidate persistence
- canonical write-back

Agents cannot bypass engines.

Engines cannot replace product meaning.

## 3. V1 Local Agent Set

Studio V1 has four bounded local-role agents.

### 3.1 Studio Local Agent

User-facing name: Nexus.

Role:

- persistent side-panel agent for Studio
- explains local work in human terms
- guides the user through permissions, run, failure, sync, package, and return-to-Web states
- decides which local agent or engine should handle the current action

Input:

- active project opening package
- current local state
- permission state
- sync state
- runtime/package/evidence state
- user message or button action
- latest Web/canonical context included in the Studio opening package

Output:

- short user-facing explanation
- next recommended local action
- approval request when needed
- route to `Studio Local Runtime Operator`, `Studio Sync Guard`, `Studio Package Verifier`, `Mutation / Change Agent`, `History / Continuity Agent`, or a truth engine
- structured action envelope describing intent, affected area, risk, permission requirement, sync impact, and failure path

Allowed:

- explain what is local, synced, blocked, risky, or pending
- recommend one primary action
- ask for approval
- request permission through the permission engine
- request runtime execution through the runtime engine
- request sync review through `Studio Sync Guard`
- request product-truth review through `Mutation / Change Agent`
- summarize evidence after a local action

Forbidden:

- write files directly
- run commands directly
- install packages directly
- read secrets directly
- accept canonical mutations
- reject canonical mutations alone
- publish, release, or deploy
- claim a local action succeeded before engine proof exists
- act as the Web conversation agent without local boundaries

Approval boundary:

- must ask before any dangerous action
- may proceed without approval only for explanation, routing, status display, and non-destructive local summaries

Sync boundary:

- cannot sync directly
- can prepare a sync intent for `Studio Sync Guard`
- can explain what will return to Web after accepted sync

Failure behavior:

- does not fake completion
- shows the safest known state
- preserves pending intent for retry when appropriate
- explains whether the failure is permission, runtime, sync, cloud, package, or unknown

V1 status:

- required for Studio V1
- release-blocker as a contract
- not live until Desktop implementation proves real side-panel routing

### 3.2 Studio Local Runtime Operator

Role:

- handles bounded local run, build, preview, and debug actions for the active project
- uses existing project commands first
- proposes new commands only when no clear command exists

Input:

- bound project
- approved runtime action
- folder permission state
- command discovery result
- environment/secrets availability state without secret values
- current runtime status

Output:

- runtime state
- preview availability state
- redacted log summary
- technical detail available on demand
- local evidence
- proposed fix classification
- retry/stop result

Allowed:

- request execution of an approved existing project command through the runtime engine
- classify run failure
- propose dependency installation
- propose a safe fix
- produce redacted evidence
- stop a running local action when allowed by the runtime engine

Forbidden:

- invent a hidden Nexus runtime as the default V1 path
- run an uncertain/new command without approval
- install dependencies without approval
- expose secrets, tokens, full sensitive paths, or private environment values
- write fixes to files directly
- change Product Graph truth directly
- present logs as canonical history by itself

Approval boundary:

- running an existing clear command still requires appropriate local run permission
- new command approval is required when the command is absent, ambiguous, or generated by Nexus
- dependency install requires explicit approval
- any file write/fix requires write approval and may require `Mutation / Change Agent`

Sync boundary:

- returns evidence and proposed changes only
- cannot decide what enters canonical truth
- runtime evidence may be attached to sync by `Studio Sync Guard`

Failure behavior:

- stop safely
- redact sensitive output
- show human explanation first
- keep raw technical detail behind expansion where safe
- never say the app ran if the runtime engine did not prove it

V1 status:

- required for Studio V1 runtime path
- not a general shell operator

### 3.3 Studio Sync Guard

Role:

- validates Studio-originated changes before they can enter Nexus canonical truth
- protects cloud truth from stale, unsafe, unaudited, or unapproved local changes

Input:

- proposed mutation
- candidate artifact
- local evidence
- base cloud revision
- current cloud revision
- permission state
- approval state
- conflict/stale result

Output:

- sync-ready proposal
- rejected proposal
- stale-state warning
- conflict state
- accepted sync result after canonical engine acceptance
- rejected sync result after canonical engine rejection
- history attachment request

Allowed:

- compare local proposal to cloud revision
- identify stale work
- identify conflicts
- separate evidence from candidate mutations
- request user approval for material sync
- pass accepted proposals to canonical sync/mutation engine
- preserve rejected local work as local draft when appropriate

Forbidden:

- overwrite cloud truth silently
- overwrite local work silently
- accept a product mutation alone
- bypass `Mutation / Change Agent` for product-changing work
- sync unapproved file writes
- sync secrets
- sync redacted-only evidence as if it were complete proof
- claim cloud acceptance before canonical acceptance exists

Approval boundary:

- required for material truth mutation
- required for conflict resolution
- required for any sync that changes canonical Product Graph, release candidate, or approved artifact state

Sync boundary:

- sole Studio-to-cloud guard for Studio-originated changes
- still depends on canonical sync/mutation engines for final truth write

Failure behavior:

- reject stale or divergent state safely
- keep local draft and evidence when safe
- show clear reason: stale, conflict, missing approval, missing permission, failed canonical write, or invalid proposal
- never fork silently

V1 status:

- required for Studio V1
- release-blocker before any real sync implementation

### 3.4 Studio Package Verifier

Role:

- verifies local debug/package outputs as candidate artifacts and release evidence
- ensures Studio packaging does not become Release

Input:

- package candidate
- runtime/build result
- test result
- sync state
- permission state
- changed files summary
- evidence bundle

Output:

- package candidate card
- verification state
- package blockers
- evidence summary
- Web Release handoff envelope

Allowed:

- verify whether a package candidate is internally coherent
- attach runtime/build/test evidence
- block packaging when local changes are unapproved, unsynced, stale, or failed
- prepare a handoff to Web Release

Forbidden:

- publish or deploy
- mark a candidate as released
- package unapproved local changes
- package secrets
- bypass Release gates
- hide failed tests
- treat a debug artifact as a release

Approval boundary:

- package creation requires package permission and explicit user approval when material changes are included
- handoff to Web Release requires explicit approval

Sync boundary:

- package candidate is a candidate artifact until accepted upstream
- Release decides external release
- Sync Guard decides whether supporting changes can enter canonical truth

Failure behavior:

- mark candidate unverifiable
- preserve evidence
- show blocker reason
- never claim release readiness when package evidence is incomplete

V1 status:

- required if packaging is included in Studio V1 promise
- otherwise remains release-blocker for package-related Studio claims

## 4. Explicit Non-Agents In V1

The following are not independent V1 local agents:

- `Local File Change Agent`: file writes are gated by permission, mutation, and sync engines.
- `Debug Agent`: debugging is handled by `Studio Local Runtime Operator` plus Studio Local Agent explanation.
- `Local Build Agent`: local build/run belongs to `Studio Local Runtime Operator`.
- `Packaging Agent`: packaging verification belongs to `Studio Package Verifier`.
- `Import / Project Analysis Agent`: post-release unless separately promoted.
- `Local AI Agent`: post-release.
- arbitrary shell agent: explicitly forbidden.
- auto-install agent: explicitly forbidden.
- independent truth planner: explicitly forbidden.

## 5. Dangerous Actions

The following actions are dangerous in Studio and require explicit gates:

- reading a project folder for the first time
- writing to project files
- deleting, moving, or replacing files
- running a command
- running a new or uncertain command
- installing dependencies
- reading secret availability
- using secrets during local runtime
- packaging a candidate
- syncing local changes to cloud
- accepting or rejecting conflict resolution
- attaching evidence to canonical history
- proposing product-truth mutation
- handing a package candidate to Release

Dangerous actions require the relevant combination of:

- user approval
- permission engine approval
- runtime/package/sync engine validation
- mutation review when product truth changes
- history/recovery checkpoint when rollback may be needed

## 6. Structured Agent Output Contract

Every Studio local agent output must be structured enough for Nexus to use.

Minimum fields:

- `agent_id`
- `role`
- `project_id`
- `local_state_reference`
- `intent`
- `affected_area`
- `action_type`
- `risk_level`
- `approval_required`
- `permission_required`
- `sync_impact`
- `truth_impact`
- `evidence_generated`
- `next_engine`
- `next_agent`
- `user_message`
- `failure_mode`
- `status`

Allowed status values:

- `ready_to_route`
- `pending_approval`
- `pending_permission`
- `executed_with_evidence`
- `candidate_only`
- `sync_ready`
- `blocked`
- `failed_safely`

## 7. Relationship To Web Conversation Agent

The Web conversation agent owns normal Nexus conversation, discovery, build-loop guidance, product understanding, and cloud continuity.

Studio Local Agent uses the same Nexus personality and canonical truth, but has a different role:

- local computer work
- permission explanation
- run/debug/package guidance
- sync boundary explanation
- local evidence explanation
- local failure recovery

The Studio Local Agent does not replace the Web conversation agent.

The Web conversation agent does not become a desktop operator.

When work returns to Web, Studio sends accepted evidence, accepted mutations, rejected proposals, unresolved conflicts, and user-visible summaries through the canonical return contract.

## 8. Agent Reality Gate

Before any Studio local agent can be marked implemented, it must pass an Agent Reality Gate.

Required proof:

- role file or contract exists
- allowed and forbidden actions are encoded
- structured input and output are validated
- permission gates cannot be bypassed
- no fallback can pretend to be the agent
- no old engine can decide in the agent's name without labeling
- live/local provider or Desktop implementation path is proven when required
- browser or Desktop proof shows real input to agent, real output, and real product/surface state change
- failure path proves no fake success

Until that proof exists, the agent is contract-only.

## 9. Web Promise Boundary

Nexus Web may say:

- "This action requires Nexus Studio."
- "Studio will guide local run, permission, sync, debug, and package steps when implemented."
- "The Studio contract defines bounded local agents."
- "This is not available in Web."

Nexus Web must not say before Desktop proof:

- "Studio ran the project."
- "Studio installed dependencies."
- "Studio changed local files."
- "Studio synced local changes."
- "Studio verified the package."
- "A local agent completed this action."
- "Studio is installed or connected" unless installation/connection is truly detected.

## 10. Task Closure

`STD-AGENT-001` is closed only as a planning/local-agent-contract task when:

- the bounded V1 local agent set is defined
- every V1 local agent has role, input, output, approval, sync, failure, allowed, and forbidden boundaries
- dangerous actions are defined
- relationship to Web conversation agent is defined
- unrestricted desktop super-agent is explicitly forbidden
- Agent Reality Gate is defined for future implementation

No code, Desktop behavior, live agent, local execution, or sync behavior is closed by this task.

Next canonical task: `STD-HIST-001 — Define Studio history and recovery contract`.
