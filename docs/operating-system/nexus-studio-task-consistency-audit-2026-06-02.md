# Nexus Studio Task Consistency Audit

Date: `2026-06-02`
Scope: `Studio canonical product definition and implementation map before implementation`

## Audit Result

Studio tasks now enforce product definition and visual direction before implementation.

The required order is:

```txt
STD-FND-001 trueGreen as planning/write-back
-> STD-QUEST-001 trueGreen as planning/write-back
-> STD-VISION-001 trueGreen as planning/design artifact
-> STD-SCREENS-001 trueGreen as planning/screen-contract
-> STD-ENTRY-001 trueGreen as planning/entry-contract
-> STD-ENTRY / STD-SHELL / STD-WORKSPACE / STD-ACTIONS / STD-FILES / STD-LOCAL-STATE / STD-RECOVERY
-> STD-FND-002 trueGreen as planning/truth-state contract
-> STD-DOOR-001
-> STD-SYNC / STD-PERM / STD-RUN / STD-PKG / STD-DESIGN / STD-AGENT / STD-HIST
-> SURF-009A trueGreen as shell-to-engine and contract-anchor bridge
-> SLICE-001
-> SURF-009B later, after live surface agents pass Agent Reality Gate
```

## 2026-06-03 SURF-009 Dependency Split

The canonical map previously exposed a dependency cycle:

- `SURF-009` could not close because live surface agents were missing.
- `SKEL-001` was one of the missing live agents.
- `SKEL-001` depends on `SLICE-004`.
- `SLICE-001` depended on `SURF-009`.

This meant the map required the live agent chain before allowing the slice chain that creates the live agent chain.

The cycle is now resolved by splitting the task:

- `SURF-009A` closes the already-verified shell-to-engine and contract-anchor bridge.
- `SURF-009B` remains open as the later live surface agent integration gate.
- `SLICE-001` now depends on `SURF-009A`, not `SURF-009B`.

`SURF-009A` does not prove live agents, Desktop implementation, install detection, deep-link handling, local run, file write, package, recovery, or live sync.

`SURF-009B` can close only after the relevant agents pass `Agent Reality Gate`, including `SKEL-001`, `VSKEL-001`, `BLD-AGT-001`, `VBUILD-001`, `MUT-001`, `HIST-AGT-001`, `SHARE-AGT-001`, `GROW-AGT-001`, `GROW-AGT-002`, `GROW-MEASURE-001`, `VER-AGT-001`, `REL-AGT-001`, and `STD-HANDOFF-AGT-001`.

The next canonical implementation task after this split is `SLICE-001`.

## 2026-06-02 STD-VISION-001 Update

The canonical Studio visual vision was created in Figma:

- `https://www.figma.com/design/PayxllrD8TrZdg3FIASn4g`

Canonical visual document:

- `docs/operating-system/nexus-studio-visual-vision-2026-06-02.md`

The artifact includes:

- one outside-application frame
- one frame for each of the 11 Studio V1 screens
- six deep locked frames
- Mac application identity
- product-first workspace
- Nexus Local Agent side panel
- bottom truth/status bar
- return-to-Web shell action
- Web handoff confirmation
- permissions, read-only, recovery, conflict, pre-sync, debug, and package-candidate states

`STD-VISION-001` is closed as a planning/design artifact task only.

No Studio implementation task is trueGreen.

## 2026-06-02 STD-SCREENS-001 Update

The canonical Studio V1 screen/workspace map was created:

- `docs/operating-system/nexus-studio-v1-screen-workspace-map-2026-06-02.md`

The map covers all 11 Studio V1 screens:

- Studio Opening
- Web Project Opening Confirmation
- Main Project Workspace
- Error / Debug State
- Preview Before Sync
- Cloud Conflict
- Permissions
- Read-Only Mode
- Local Recovery
- Package / Release Candidate
- Basic Studio Settings

Each screen now declares:

- purpose
- user action
- visible regions
- buttons
- truth engine
- responsible agent
- permission boundary
- sync impact
- failure behavior
- implementation boundary

`STD-SCREENS-001` is closed as a planning/screen-contract task only.

No Studio implementation task is trueGreen.

## 2026-06-02 STD-ENTRY-001 Update

The canonical Web entry contract was created:

- `docs/operating-system/nexus-studio-web-entry-contract-2026-06-02.md`

The contract locks:

- `not-installed`
- `installed-not-connected`
- `connected-project-bound`
- `handoff-failed`
- `version-mismatch`
- `stale-project-binding`
- `local-dirty`
- `offline-bounded`
- `sync-rejected`

The contract also defines:

- primary button `פתח ב־Nexus Studio`
- repeat-use button `המשך ב־Studio`
- connect button `חבר את הפרויקט ל־Studio`
- Web-to-Studio handoff envelope
- bounded deep-link rule
- Studio confirmation screen requirement
- return-to-Web states
- what Web may promise
- what Web must not promise

`STD-ENTRY-001` is closed as a planning/entry-contract task only.

No Studio implementation task is trueGreen.

## 2026-06-02 STD-FND-002 Update

The canonical cloud/local truth-state contract was created:

- `docs/operating-system/nexus-studio-cloud-local-truth-contract-2026-06-02.md`

The contract locks:

- `canonical-truth`
- `local-working-state`
- `candidate-artifact`
- `local-evidence`
- `proposed-mutation`
- `accepted-mutation`
- `rejected-mutation`

The contract also defines:

- state owners
- Product Graph opening package fields
- allowed transitions
- blocked transitions
- user-facing labels
- agent and engine responsibilities
- stale/conflict rules
- offline rules
- evidence rules
- rejection rules
- Web display rules

`STD-FND-002` is closed as a planning/truth-state contract task only.

No Studio implementation task is trueGreen.

## 2026-06-02 STD-DOOR-001 Risk Lock

`STD-DOOR-001` must consume `STD-FND-002` before defining any visible Web promise.

The central risk is that someone starts implementing the Studio door without respecting the cloud/local truth-state contract.

The door contract must therefore prohibit Web from claiming:

- Studio is installed before real installation detection exists
- a deep link opened successfully before Desktop confirms handoff
- local run, local file access, package creation, or local evidence happened before Desktop returns that state
- live sync happened before a sync engine verifies it
- a mutation was accepted or rejected before the `STD-FND-002` state model and sync/mutation path return that truth
- `/studio` is the Desktop app

Every state that depends on Desktop implementation must remain contract-only until installation detection, deep-link handling, Desktop confirmation, and live sync are implemented and verified.

This lock does not close `STD-DOOR-001`; it defines what `STD-DOOR-001` must preserve before it can close.

## 2026-06-02 STD-DOOR-001 Update

The full Web↔Studio door contract was created:

- `docs/operating-system/nexus-studio-web-studio-door-contract-2026-06-02.md`

The contract locks:

- Web open states
- Web-to-Studio handoff envelope
- bounded deep-link boundary
- Studio confirmation requirement
- Studio-to-Web return envelope
- promise boundary matrix
- failure categories and fallback behavior
- what Web may show
- what Web must not promise
- Desktop-dependent states as contract-only until implementation

`STD-DOOR-001` is closed as a planning/door-contract task only.

No Studio implementation task is trueGreen.

## 2026-06-02 STD-SYNC-001 Update

The sync/stale/offline contract was created:

- `docs/operating-system/nexus-studio-sync-stale-offline-contract-2026-06-02.md`

The contract locks:

- sync states
- stale-state checks
- conflict rules
- bounded offline queue
- pre-sync review with product meaning first
- sync proposal envelope
- accepted sync result
- rejected sync result
- evidence rules
- failure/retry behavior
- Web display boundaries
- Desktop-dependent sync states as contract-only until implementation

`STD-SYNC-001` is closed as a planning/sync-contract task only.

No Studio implementation task is trueGreen.

## 2026-06-02 STD-PERM-001 Update

The permissions/files/secrets/computer access contract was created:

- `docs/operating-system/nexus-studio-permissions-files-secrets-computer-contract-2026-06-02.md`

The contract locks:

- permission classes
- permission cards
- folder grant and revoke
- missing/moved/mismatched folder states
- read and write boundaries
- runtime, install, sync, package, and evidence permission boundaries
- local secrets boundary
- computer access boundary
- locked action display
- read-only mode
- revocation behavior
- permission failure behavior
- Web display boundaries
- Desktop-dependent permission states as contract-only until implementation

`STD-PERM-001` is closed as a planning/permission-contract task only.

No Studio implementation task is trueGreen.

## 2026-06-02 STD-RUN-001 Update

The local runtime/preview contract was created:

- `docs/operating-system/nexus-studio-local-runtime-preview-contract-2026-06-02.md`

The contract locks:

- local runtime scope
- runtime action classes
- existing-command-first rule
- new command approval rule
- run permission gate
- preview boundary
- dependency install boundary
- secrets boundary during run
- runtime evidence boundary
- failure display and redaction
- proposed fix classification
- stop behavior
- Web display boundary
- Desktop-dependent runtime states as contract-only until implementation

`STD-RUN-001` is closed as a planning/runtime-contract task only.

No Studio implementation task is trueGreen.

## 2026-06-03 STD-PKG-001 Update

The packaging/debug/release handoff contract was created:

- `docs/operating-system/nexus-studio-packaging-debug-release-handoff-contract-2026-06-03.md`

The contract locks:

- package candidates as candidate artifacts
- debug outputs as local evidence
- Studio packaging as candidate creation, not release
- pre-package review
- packaging blockers
- package candidate card
- release handoff to Web Release
- evidence attachment
- package/debug failure behavior
- Web display boundaries
- Desktop-dependent package/debug/release-handoff states as contract-only until implementation

`STD-PKG-001` is closed as a planning/package-debug-release-handoff contract task only.

No Studio implementation task is trueGreen.

## 2026-06-03 STD-DESIGN-001 Update

The Studio V1 design/tooling contract was created:

- `docs/operating-system/nexus-studio-v1-design-tooling-contract-2026-06-03.md`

The contract locks:

- Figma as first design authority
- Nexus Design System + Studio Depth Layer
- persistent shell regions
- product-framed tooling surfaces
- local-aware Nexus side panel
- bottom truth/status bar
- required state design
- required deep frames
- design proof requirements
- anti-pattern checklist

The contract forbids:

- VS Code clone
- file-tree-first workspace
- terminal-first workflow
- generic developer dashboard
- fake Web Studio
- fake local power

`STD-DESIGN-001` is closed as a planning/design-tooling contract task only.

No Studio implementation task is trueGreen.

## 2026-06-02 Batch 1 Update

The first deep Studio answer batch was captured in:

- `docs/operating-system/nexus-studio-deep-product-answers-2026-06-02.md`

Batch 1 locked:

- first Studio user
- Web-to-Studio trigger law
- primary Web button copy
- not-installed and installed-not-connected states
- desktop application feel
- standalone opening screen
- first bound project workspace
- persistent local-aware Nexus side agent
- action/button availability
- permission-locked action visibility
- relevant-files-first rule
- local/canonical labels
- unsynced local work status bar
- close/reopen recovery baseline
- five-second clarity rule

Batch 1 created the following derived implementation tasks:

- `STD-ENTRY-001`
- `STD-SHELL-001`
- `STD-WORKSPACE-001`
- `STD-ACTIONS-001`
- `STD-FILES-001`
- `STD-LOCAL-STATE-001`
- `STD-RECOVERY-001`

These tasks do not close Studio definition. They prevent later implementation from skipping button-level, shell-level, local-state, and recovery details.

## 2026-06-02 Batch 2 Update

The second deep Studio answer batch was captured in:

- `docs/operating-system/nexus-studio-deep-product-answers-2026-06-02.md`

Batch 2 locked:

- `Product Graph` as the project truth engine
- bounded Studio opening package
- `Studio Local Agent` as a dedicated local-role Nexus agent
- local run decision boundary between agent and permission engine
- local run failure UX order
- file-write approval law
- pre-sync product-meaning review
- sync as change plus proof
- evidence-only vs truth-change candidate boundary
- `Mutation Agent` plus sync engine acceptance bridge
- bounded offline behavior
- cloud-changed-while-local conflict behavior

Batch 2 created or updated the following implementation tasks:

- `STD-FND-002`
- `STD-AGENT-001`
- `STD-RUN-001`
- `STD-PERM-001`
- `STD-SYNC-001`
- `STD-SYNC-002`
- `STD-HIST-001`
- `STD-OFFLINE-001`
- `STD-EVIDENCE-001`
- `STD-MUTATION-BRIDGE-001`

These tasks clarify that Studio local power is subordinate to cloud truth, bounded by permissions, and mediated by agents plus truth engines.

## 2026-06-02 Batch 3 Update

The third deep Studio answer batch was captured in:

- `docs/operating-system/nexus-studio-deep-product-answers-2026-06-02.md`

Batch 3 locked:

- existing-command-first local run behavior
- proposed new run command approval
- approval-gated dependency installation
- safe run error display and redaction
- V1 debug area inside the project workspace
- error-fix classification through Studio Local Agent, Mutation Agent, and permission engine
- packaging as local candidate rather than release truth
- packaging approval gate
- folder grant, revoke, moved-folder, missing-folder, mismatch, read-only, and return-to-Web states
- local secrets as run-only data that never enter evidence, logs, screenshots, sync, or history

Batch 3 created or updated the following implementation tasks:

- `STD-RUN-001`
- `STD-PERM-001`
- `STD-PERM-002`
- `STD-PERM-003`
- `STD-DEBUG-001`
- `STD-PKG-001`
- `STD-PKG-002`
- `STD-MUTATION-BRIDGE-001`

These tasks prevent Studio from becoming an unsafe local runner, silent package installer, raw log viewer, or release bypass.

## 2026-06-02 Batch 4 Update

The fourth deep Studio answer batch was captured in:

- `docs/operating-system/nexus-studio-deep-product-answers-2026-06-02.md`

Batch 4 locked:

- three persistent Studio regions: product center, Nexus side panel, bottom truth/status bar
- fixed top-corner `חזור ל־Web`
- primary next-action card plus persistent action row
- healthy center state as local product picture
- center error state as meaning before logs
- locked action visual language
- relevant files as product-meaning cards
- Nexus side panel open by default and never fully gone in V1
- outside app identity as `Nexus Studio`
- Figma-first visual direction before implementation

Batch 4 created or updated the following implementation tasks:

- `STD-VISION-001`
- `STD-SCREENS-001`
- `STD-SHELL-001`
- `STD-WORKSPACE-001`
- `STD-ACTIONS-001`
- `STD-FILES-001`
- `STD-DESIGN-001`
- `STD-ERROR-STATE-001`

These tasks reduce the risk that Studio is implemented as a generic code editor or file-tree-first desktop app.

## 2026-06-02 Batch 5 Update

The fifth deep Studio answer batch was captured in:

- `docs/operating-system/nexus-studio-deep-product-answers-2026-06-02.md`

Batch 5 locked:

- source-aware first card in Studio Opening
- Web Project Opening Confirmation before local handoff enters the workspace
- `הפעולה הבאה` card content rules
- Preview Before Sync order: product meaning, files, tests/evidence
- guided Cloud Conflict experience before detailed comparison
- permission cards by permission type
- Read-Only Mode as normal workspace with locked actions
- Local Recovery primary action `ראה מה נשמר`
- Package / Release Candidate as a candidate card with evidence
- official Studio V1 screen list

Official Studio V1 screens:

1. Studio Opening
2. Web Project Opening Confirmation
3. Main Project Workspace
4. Error / Debug State
5. Preview Before Sync
6. Cloud Conflict
7. Permissions
8. Read-Only Mode
9. Local Recovery
10. Package / Release Candidate
11. Basic Studio Settings

Batch 5 created or updated the following implementation tasks:

- `STD-SCREENS-001`
- `STD-SHELL-001`
- `STD-ENTRY-001`
- `STD-ACTIONS-001`
- `STD-SYNC-001`
- `STD-SYNC-002`
- `STD-PERM-001`
- `STD-FILES-001`
- `STD-RECOVERY-001`
- `STD-PKG-001`
- `STD-SETTINGS-001`

These tasks make the V1 screen inventory canonical before Figma and implementation.

## 2026-06-02 Batch 6 Update

The sixth deep Studio answer batch was captured in:

- `docs/operating-system/nexus-studio-deep-product-answers-2026-06-02.md`

Batch 6 locked:

- one Figma frame for each of the 11 Studio V1 screens
- outside-application Figma frame
- 5-6 deep locked frames: healthy workspace, error/debug, preview before sync, cloud conflict, permissions, package/release candidate
- Nexus Web language extended into a deeper, quieter, more professional desktop mode
- Studio Nexus panel as local action/evidence/approval panel, not Web chat clone
- bottom status bar quiet/prominent behavior
- required states: empty, loading, error, locked, conflict, no permission, unsynced, read-only
- `Nexus Design System + Studio Depth Layer`
- Studio wow as control over local chaos, not visual noise

Batch 6 created or updated the following implementation tasks:

- `STD-VISION-001`
- `STD-DESIGN-001`
- `STD-SHELL-001`
- `STD-AGENT-001`
- `STD-LOCAL-STATE-001`
- `STD-ERROR-STATE-001`
- `STD-SCREENS-001`

These tasks make the visual artifact contract concrete enough to move toward Figma production after any remaining tooling/runtime-platform questions are resolved.

## 2026-06-02 Batch 7 Update

The seventh deep Studio answer batch was captured in:

- `docs/operating-system/nexus-studio-deep-product-answers-2026-06-02.md`

Batch 7 locked:

- Studio V1 is Mac-only
- Windows is post-release
- Electron is the V1 default shell technology unless proven otherwise
- Tauri and native Mac are post-release evaluations
- Studio V1 runs existing project commands first
- deeper Nexus Runtime is post-release
- internal app storage holds local drafts, local work state, local history, cache, evidence, and sync state
- project folder writes require explicit approval
- Studio definition is complete enough to move from `STD-QUEST-001` to `STD-VISION-001`

Batch 7 created or updated the following implementation tasks:

- `STD-PLATFORM-001`
- `STD-SHELL-002`
- `STD-RUN-001`
- `STD-STORAGE-001`
- `STD-POST-001`
- `STD-VISION-001`

`STD-QUEST-001` is now closed as a planning/write-back task only. No Studio implementation task is trueGreen.

## Fixed During Audit

- Added `STD-QUEST-001` so Studio cannot proceed without deep product questions and canonical answers.
- Added `STD-VISION-001` so Studio requires a visual product vision before UI implementation.
- Added `STD-SCREENS-001` so Studio V1 screens/workspaces must be mapped before implementation.
- Added `STD-FND-002` to the main implementation map so cloud truth vs local working state is explicit before door/sync work.
- Updated `STD-DOOR-001` to depend on `STD-FND-002` and `STD-SCREENS-001`.
- Updated `STD-PERM-001` to depend on `STD-SCREENS-001`.
- Updated `STD-DESIGN-001` to depend on `STD-VISION-001` and `STD-SCREENS-001`.

## Consistency Findings

### Product Truth

Consistent.

Studio remains desktop-local Nexus power mode. Web/cloud Product Graph remains canonical.

### Visual Truth

Consistent after fix.

Studio cannot be implemented from text-only definition. It now requires `Nexus Studio V1 Visual Vision` and `Nexus Studio V1 Desktop Workspace Contract`.

### Screen / Workspace Truth

Consistent after fix.

Every V1 Studio screen must declare:

- purpose
- user action
- visible regions
- engine dependency
- agent dependency
- approval boundary
- sync impact
- failure behavior

### Web Boundary

Consistent.

`SURF-008` remains only the Web boundary/digital door. It is not the Studio app.

### Implementation Readiness

Blocked by downstream implementation contracts, intentionally.

No Studio implementation task should start before the relevant downstream task defines its local engine, agent, permission, sync, and failure contract.

### Agent / Engine Boundary

Consistent with the `SURF-009A` / `SURF-009B` split.

Studio screens must eventually declare both:

- truth engines
- live/local agents or explicit open agent tasks

## Remaining Open Work

- `STD-FND-001` is closed as a planning/write-back task only.
- `STD-QUEST-001` is closed as a planning/write-back task only.
- `STD-VISION-001` is closed as a planning/design artifact task only.
- `STD-SCREENS-001` is closed as a planning/screen-contract task only.
- `STD-ENTRY-001` is closed as a planning/entry-contract task only.
- `STD-FND-002` is closed as a planning/truth-state contract task only.
- `STD-DOOR-001` is closed as a planning/door-contract task only.
- `STD-SYNC-001` is closed as a planning/sync-contract task only.
- `STD-PERM-001` is closed as a planning/permission-contract task only.
- `STD-RUN-001` is closed as a planning/runtime-contract task only.
- `STD-PKG-001` is closed as a planning/package-debug-release-handoff contract task only.
- `STD-DESIGN-001` is closed as a planning/design-tooling contract task only.
- `STD-AGENT-001` is closed as a planning/local-agent-contract task only.
- `STD-HIST-001` is closed as a planning/history-recovery-contract task only.
- `SURF-009A` is closed as the shell-to-engine and contract-anchor bridge.
- `SURF-009B` remains open as the later live surface agent integration gate.

## Not TrueGreen Conditions

Studio downstream implementation remains not trueGreen if:

- `/studio` Web boundary is treated as the desktop application
- Web claims Studio installation, deep-link success, local execution, live sync, evidence return, or mutation acceptance/rejection before real Desktop implementation verifies it
- Studio can still collapse into a VS Code clone, Developer page, file-tree-first UI, or terminal-first app
- a downstream task implements a screen without its declared truth engine, agent owner, permissions, sync impact, and failure path

## Next Canonical Task

`SLICE-001` is the next practical task after the `SURF-009A` split closure.

The pre-implementation chain is now:

```txt
STD-FND-001 -> STD-QUEST-001 -> STD-VISION-001 -> STD-SCREENS-001 -> STD-ENTRY-001 -> STD-FND-002 -> STD-DOOR-001 -> STD-SYNC-001 -> STD-PERM-001 -> STD-RUN-001 -> STD-PKG-001 -> STD-DESIGN-001 -> STD-AGENT-001 -> STD-HIST-001 -> SURF-009A -> SLICE-001
```

## 2026-06-03 STD-AGENT-001 Update

`STD-AGENT-001` now has a canonical local-agent contract:

- `docs/operating-system/nexus-studio-local-agents-contract-2026-06-03.md`

The contract defines:

- `Studio Local Agent`
- `Studio Local Runtime Operator`
- `Studio Sync Guard`
- `Studio Package Verifier`
- explicit non-agents for V1
- dangerous Studio actions
- structured agent output
- relation to the Web conversation agent
- Agent Reality Gate for future implementation

Consistency result:

- `STD-AGENT-001` is trueGreen only as a planning/local-agent-contract task.
- No Desktop implementation, live local agent, local file write, local runtime action, package verification, or live sync is trueGreen.
- This unlocked `STD-HIST-001`, which is now also closed as a planning/history-recovery-contract task.

## 2026-06-03 STD-HIST-001 Update

`STD-HIST-001` now has a canonical history/recovery contract:

- `docs/operating-system/nexus-studio-history-recovery-contract-2026-06-03.md`

The contract defines:

- local session journal
- local recovery checkpoint
- canonical Product History
- recovery evidence attachment
- close with unsynced work
- crash recovery
- interrupted runtime/package recovery
- reopen flow with `ראה מה נשמר`
- local restore versus canonical restore
- rebase, retry, and discard paths
- opening package history boundary
- Web recovery promise boundary

Consistency result:

- `STD-HIST-001` is trueGreen only as a planning/history-recovery-contract task.
- No Desktop app, live checkpoint engine, restore engine, cloud History writer, local recovery proof, or live sync is trueGreen.
- The next open task after the `SURF-009A` split closure is `SLICE-001`.

## 2026-06-03 SURF-009A / SURF-009B Re-entry Update

After the Studio rulebook was closed, Nexus returned to the shell-to-engine-and-agent integration bridge.

`SURF-009A` was updated so the Studio Web boundary now declares:

- Studio contract anchors: `STD-DOOR-001`, `STD-SYNC-001`, `STD-PERM-001`, `STD-RUN-001`, `STD-PKG-001`, `STD-DESIGN-001`, `STD-AGENT-001`, and `STD-HIST-001`
- the open Studio handoff agent dependency: `STD-HANDOFF-AGT-001`
- a Web promise boundary forbidding installation detection, local run, file write, sync, package, or recovery claims before Desktop proof

Consistency result:

- the Studio boundary is now connected to the completed Studio rulebook as planning-contract anchors
- planning-contract anchors are not live Desktop capability
- `SURF-009A` is trueGreen as the shell-to-engine and contract-anchor bridge only
- `SURF-009B` remains open because live surface agents have not passed Agent Reality Gate
- `SLICE-001` is no longer blocked by the live-agent gate because it depends on `SURF-009A`, not `SURF-009B`
