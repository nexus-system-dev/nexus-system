# Nexus Studio Canonical Product System

Date: `2026-05-31`
Status: `canonical working draft`
Scope: `desktop-local Nexus power mode`

## 0. Definition Before Proof

Studio must be defined before Studio is proven or implemented.

The definition path is:

```txt
deep questions -> canonical answers -> product laws -> visual vision -> screen/workspace map -> implementation tasks -> proof
```

No Studio implementation task may claim `trueGreen` until the product definition, visual direction, and screen/workspace contract are locked.

Required pre-implementation artifacts:

- `Nexus Studio Deep Product Questions`
- `Nexus Studio Canonical Product Answers`
- `Nexus Studio V1 Visual Vision`
- `Nexus Studio V1 Desktop Workspace Contract`
- `Nexus Studio V1 Screen / Workspace Map`
- `Nexus Studio V1 Implementation Task Map`

Latest consistency audit:

- `docs/operating-system/nexus-studio-task-consistency-audit-2026-06-02.md`

Captured canonical answers:

- `docs/operating-system/nexus-studio-deep-product-answers-2026-06-02.md`

Canonical visual vision:

- `docs/operating-system/nexus-studio-visual-vision-2026-06-02.md`
- `https://www.figma.com/design/PayxllrD8TrZdg3FIASn4g`

Canonical screen/workspace map:

- `docs/operating-system/nexus-studio-v1-screen-workspace-map-2026-06-02.md`

Canonical Web entry contract:

- `docs/operating-system/nexus-studio-web-entry-contract-2026-06-02.md`

Canonical cloud/local truth-state contract:

- `docs/operating-system/nexus-studio-cloud-local-truth-contract-2026-06-02.md`

Core law:

```txt
Studio must be designed as a real local Nexus application before any proof task treats it as implementable.
```

### 0.1 Captured Deep Product Laws

The first locked answer batch defines the Studio entry, application feel, first workspace state, local/canonical labels, and recovery baseline.

Canonical laws from answer batch 1:

- Studio's first user is a serious product builder with an existing Nexus product who needs local computer power.
- Web opens Studio only when the requested action honestly requires the user's computer.
- The primary Web door button is `פתח ב־Nexus Studio`.
- If Studio is not installed, Web explains why Studio is needed, offers install, and states what can still continue in Web.
- If Studio is installed but not project-connected, the primary state is `חבר את הפרויקט ל־Studio`; local binding requires approval.
- Studio must feel like a clean, quiet Mac application with deep Nexus local power, not an IDE, terminal, file manager, or developer dashboard.
- The first bound project view is product-first: product picture, sync state, and next local action before files, logs, or terminal.
- The Nexus agent is a persistent local-aware side area that explains what is running, what failed, what needs approval, what is local, and what will sync.
- V1 may show files, but only as relevant product context, not as a file-tree-first experience.
- Studio must show simple truth labels: `מקומי`, `מסונכרן`, `ממתין לסנכרון`, `אושר בענן`, `יש התנגשות`, `טיוטה מקומית`, `ראיה בלבד`, `דורש אישור`.
- Unsynced local work requires a calm persistent status bar and a close/reopen recovery rule.
- The user feeling is: `אני עדיין בתוך נקסוס, רק עכשיו היא עובדת מהמחשב שלי.`

These laws must feed `STD-VISION-001`, `STD-SCREENS-001`, `STD-DOOR-001`, `STD-PERM-001`, `STD-SYNC-001`, and `STD-HIST-001`.

### 0.2 Captured Engine / Agent / Sync Laws

The second locked answer batch defines Studio's relationship to Nexus truth engines, local agents, execution permissions, sync meaning, evidence, offline, and conflict behavior.

Canonical laws from answer batch 2:

- Studio opens a project from Nexus `Product Graph` truth, not from a random local folder.
- Studio receives a bounded project opening package: canonical snapshot, important history, open tasks, relevant recent conversation, build/test/release state, relevant files/assets, and important restore points.
- Studio must receive enough to work correctly, not the entire history of the project.
- The Studio side panel is a dedicated `Studio Local Agent`; user-facing language may still call it `נקסוס`.
- The `Studio Local Agent` explains local computer work, failures, permissions, local state, cloud-return state, and risk.
- Local run decisions require both agent understanding and permission-engine approval.
- Local run failure starts with a human explanation, then a shortened log, then a proposed fix; raw logs are not the first user experience.
- Studio can propose file changes, but real file writes require approval.
- The pre-sync review must explain product meaning: local changes, files, screens/flows, cloud impact, local remainder, approvals, conflicts, tests, and available actions.
- Sync returns both change and proof: changed work, tests, screenshots, shortened logs, runtime/package status, failures, restore point, and next recommendation.
- Evidence-only state records what happened; truth-change candidate state records what may change product truth.
- The `Mutation Agent` decides change meaning; the sync engine preserves, compares, conflicts, and connects truth.
- Offline work is bounded local work, not final new truth.
- If cloud truth changed while Studio worked locally, Studio must stop before sync and show cloud/local differences and safe outcomes.

These laws must feed `STD-FND-002`, `STD-AGENT-001`, `STD-RUN-001`, `STD-PERM-001`, `STD-SYNC-001`, `STD-SYNC-002`, `STD-HIST-001`, `STD-OFFLINE-001`, `STD-EVIDENCE-001`, and `STD-MUTATION-BRIDGE-001`.

### 0.3 Captured Runtime / Debug / Package / Permission Laws

The third locked answer batch defines local run command selection, dependency installation, error display, debug placement, package meaning, folder grants, and local secrets.

Canonical laws from answer batch 3:

- When running locally, Studio first uses an existing clear project run command; new or uncertain commands must be proposed, explained, and approved.
- Studio may propose missing dependency installation, but must not install silently.
- Run failures must first show a human explanation, then filtered technical detail and a proposed fix.
- Error display must not expose secrets, keys, full sensitive user paths, environment variables, tokens, sensitive internal addresses, or private file contents.
- V1 debugging is an area inside the project workspace, not a separate deep debug screen by default.
- Error fix classification is shared by `Studio Local Agent`, `Mutation Agent`, and the permission engine.
- Packaging in Studio creates a local test artifact, preview package, testable build, or release candidate; it is not release truth.
- Studio must not package unapproved changes.
- Folder access uses explicit grant `בחר תיקייה לפרויקט הזה` and explicit revoke `בטל גישה לתיקייה`.
- Missing, moved, or mismatched local folders stop Studio and require reconnect, read-only mode, return to Web, or user selection.
- Local secrets may be used for local run only; they must not enter evidence, logs, screenshots, sync, or cloud history.

These laws must feed `STD-RUN-001`, `STD-PERM-001`, `STD-PERM-002`, `STD-PERM-003`, `STD-DEBUG-001`, `STD-PKG-001`, `STD-PKG-002`, and `STD-MUTATION-BRIDGE-001`.

### 0.4 Captured Visual Structure Laws

The fourth locked answer batch defines Studio's V1 shell regions, action placement, center states, locked states, relevant files model, side panel persistence, outside app identity, and Figma visual contract.

Canonical laws from answer batch 4:

- Studio V1 is built from three persistent regions: product center, Nexus side panel, and bottom truth/status bar.
- `חזור ל־Web` always sits in the top corner of the Studio shell, not inside a changing workspace or hidden menu.
- One primary action appears in the `הפעולה הבאה` card; stable actions remain reachable in a top action row or stable action area.
- Healthy center state shows the local product picture, not files, logs, terminal, or raw technical dashboards.
- Error center state starts with meaning: what failed, why it matters, and what can happen now; full logs are secondary.
- Locked actions remain visible but disabled, with lock icon, reason, and unlock action.
- Relevant files are shown as product-meaning cards by default, not as a full file tree.
- Nexus side panel is open by default in V1 and may collapse but must not disappear entirely.
- The application name is `Nexus Studio`.
- The outside app should feel like a clean, quiet, powerful Mac application connected to Nexus.
- Figma is the default visual direction authority before implementation; Figma locks layout, state visuals, and Nexus-native feel, not product truth.
- Required order is: `Figma direction -> screen contract -> implementation`.

These laws must feed `STD-VISION-001`, `STD-SCREENS-001`, `STD-SHELL-001`, `STD-WORKSPACE-001`, `STD-ACTIONS-001`, `STD-FILES-001`, `STD-DESIGN-001`, and `STD-ERROR-STATE-001`.

### 0.5 Captured V1 Screen List And Screen Order Laws

The fifth locked answer batch defines Studio's official V1 screen list and several screen-specific ordering laws.

Canonical laws from answer batch 5:

- Standalone opening first card depends on entry source: Web-handed project first when opened from Web, last worked-on project first when opened directly.
- Connection state is always visible but is not the first card.
- Web project handoff shows a short confirmation: `פותחים את הפרויקט הזה ב־Nexus Studio`, with project name, connection state, payload summary, required permissions, and `פתח פרויקט`.
- `הפעולה הבאה` card contains one primary action, a short reason, and at most 1–2 relevant secondary actions.
- Pre-sync review order is product meaning, then files, then tests/evidence.
- Cloud conflict starts with guided Nexus conversation and options; detailed compare is a second step.
- Permissions render as separate cards: folder, read, write, run, secrets, install, sync.
- Read-only mode looks like the normal project workspace with locked actions.
- Local recovery primary action is `ראה מה נשמר`.
- Package screen shows a release-candidate card with evidence; Studio packages, Web Release approves release.

Official Studio V1 screen list:

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

This list is canonical for V1 visual planning before Figma and implementation.

These laws must feed `STD-SCREENS-001`, `STD-SHELL-001`, `STD-ENTRY-001`, `STD-ACTIONS-001`, `STD-SYNC-001`, `STD-SYNC-002`, `STD-PERM-001`, `STD-FILES-001`, `STD-RECOVERY-001`, `STD-PKG-001`, and `STD-SETTINGS-001`.

### 0.6 Captured Figma / Design Direction Laws

The sixth locked answer batch defines the Figma artifact contract and Studio visual direction before implementation.

Canonical laws from answer batch 6:

- Figma must include one frame for each of the 11 Studio V1 screens.
- Figma must include 5-6 deep locked frames: healthy main workspace, error/debug, preview before sync, cloud conflict, permissions, and package/release candidate.
- Figma must include an outside-application frame with icon, app name, clean opening screen, basic Mac window, Web-handed opening, and standalone opening.
- Studio continues Nexus Web language but becomes deeper, quieter, more professional, stable, local, and precise.
- Studio Nexus side panel is a local action panel with state, evidence, approvals, and actions; it is not a direct Web chat clone.
- Bottom status bar is quiet normally and prominent only when trust may be harmed.
- Figma must include empty, loading, error, locked, conflict, no-permission, unsynced, and read-only states.
- Studio uses `Nexus Design System + Studio Depth Layer`.
- Studio wow is control over local chaos, not noise.

These laws must feed `STD-VISION-001`, `STD-DESIGN-001`, `STD-SHELL-001`, `STD-AGENT-001`, `STD-LOCAL-STATE-001`, `STD-ERROR-STATE-001`, and `STD-SCREENS-001`.

### 0.7 Captured Platform / Runtime / Storage Laws

The seventh locked answer batch defines the first Studio implementation platform and remaining pre-vision boundaries.

Canonical laws from answer batch 7:

- Studio V1 is Mac-only.
- Windows is post-release and does not block the first Studio release.
- Electron is the default V1 shell technology unless proven otherwise.
- Tauri and native Mac are future evaluations, not first-release blockers.
- Studio V1 runs existing project commands first.
- A new run command may be proposed only with explanation and approval.
- Studio does not introduce a full internal Nexus Runtime as the V1 base.
- Internal app storage holds local drafts, work state, local history, cache, evidence, and sync state.
- Project folder writes happen only after clear approval.
- Studio product-definition answers are sufficient to move from `STD-QUEST-001` to `STD-VISION-001`.

These laws must feed `STD-PLATFORM-001`, `STD-SHELL-002`, `STD-RUN-001`, `STD-STORAGE-001`, `STD-POST-001`, and `STD-VISION-001`.

### 0.8 Captured Visual Vision Artifact

The `STD-VISION-001` visual artifact was created in Figma.

Artifact:

```txt
https://www.figma.com/design/PayxllrD8TrZdg3FIASn4g
```

Canonical visual document:

- `docs/operating-system/nexus-studio-visual-vision-2026-06-02.md`

The artifact includes:

- outside application identity
- one frame for each of the 11 Studio V1 screens
- deep locked frames for main project workspace, error/debug, preview before sync, cloud conflict, permissions, and package/release candidate
- Mac desktop application framing
- product center
- Nexus Local Agent side panel
- bottom truth/status bar
- return-to-Web action
- Web handoff
- permissions, read-only, recovery, conflict, pre-sync, debug, and package-candidate states

Core visual law:

```txt
Studio creates wow through calm control over local work, not through noise.
```

These laws close `STD-VISION-001` as a planning/design artifact task only and feed `STD-SCREENS-001`.

### 0.9 Captured Screen / Workspace Map

The `STD-SCREENS-001` screen and workspace map was created.

Artifact:

- `docs/operating-system/nexus-studio-v1-screen-workspace-map-2026-06-02.md`

The screen map covers all 11 Studio V1 screens:

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

Each screen is mapped by:

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

Core screen law:

```txt
Every Studio screen must connect the visible face, the deciding agent, and the truth engine behind it.
```

These laws close `STD-SCREENS-001` as a planning/screen-contract task only and feed `STD-ENTRY-001`, `STD-SHELL-001`, `STD-WORKSPACE-001`, `STD-ACTIONS-001`, `STD-FILES-001`, `STD-LOCAL-STATE-001`, `STD-RECOVERY-001`, `STD-SYNC-001`, `STD-SYNC-002`, `STD-PERM-001`, `STD-RUN-001`, `STD-PKG-001`, `STD-DEBUG-001`, `STD-ERROR-STATE-001`, `STD-SETTINGS-001`, `STD-DESIGN-001`, `STD-AGENT-001`, and `STD-HIST-001`.

### 0.10 Captured Web Entry Contract

The `STD-ENTRY-001` Web entry contract was created.

Artifact:

- `docs/operating-system/nexus-studio-web-entry-contract-2026-06-02.md`

The contract locks these Web entry states:

- `not-installed`
- `installed-not-connected`
- `connected-project-bound`
- `handoff-failed`
- `version-mismatch`
- `stale-project-binding`
- `local-dirty`
- `offline-bounded`
- `sync-rejected`

Primary Web entry copy:

```txt
פתח ב־Nexus Studio
```

Repeat-use copy:

```txt
המשך ב־Studio
```

Project connect copy:

```txt
חבר את הפרויקט ל־Studio
```

Core entry law:

```txt
Web opens the Studio door. Studio performs local work. Web must not pretend local capability exists before Studio is installed, connected, and approved.
```

These laws close `STD-ENTRY-001` as a planning/entry-contract task only and feed `STD-FND-002`, `STD-DOOR-001`, `STD-PERM-001`, `STD-SYNC-001`, and `STD-HANDOFF-AGT-001`.

### 0.11 Captured Cloud / Local Truth-State Contract

The `STD-FND-002` cloud/local truth-state contract was created.

Artifact:

- `docs/operating-system/nexus-studio-cloud-local-truth-contract-2026-06-02.md`

The contract locks these truth states:

- `canonical-truth`
- `local-working-state`
- `candidate-artifact`
- `local-evidence`
- `proposed-mutation`
- `accepted-mutation`
- `rejected-mutation`

It also defines:

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

Core truth-state law:

```txt
Local state is candidate/evidence state until Nexus accepts it into cloud Product Graph truth.
```

These laws close `STD-FND-002` as a planning/truth-state contract task only and feed `STD-DOOR-001`, `STD-SYNC-001`, `STD-SYNC-002`, `STD-OFFLINE-001`, `STD-EVIDENCE-001`, `STD-MUTATION-BRIDGE-001`, `STD-HIST-001`, `STD-PKG-001`, and `STD-STORAGE-001`.

## 1. Core Identity — STUD-001

`Nexus Studio` is the desktop-local power mode of Nexus.

It is part of Nexus. It is not a separate product.

Studio exists for work that honestly requires local computer capability: local files, local runtimes, local preview, debugging, packaging, heavier builds, bounded offline continuity, and safe sync back into Nexus truth.

Studio is not:

- another web page
- a Developer page
- a Figma page
- a hidden route
- a generic IDE
- a VS Code clone
- a local-first fork of Nexus
- a second source of truth
- an unrestricted shell over the user's computer

Core law:

```txt
Studio is desktop-augmented execution power attached to the same Nexus product truth.
```

## 2. Product Graph Sovereignty

Nexus Web and the cloud Product Graph remain canonical.

Studio may materialize local state, run local capability, collect evidence, prepare package candidates, and propose bounded mutations. Studio does not silently create shared truth.

Truth states:

- `canonical-truth` — accepted Product Graph state in Nexus Web/cloud
- `local-working-state` — local files/runtime/checkpoints for the active bound project
- `candidate-artifact` — local build/package/preview output not yet accepted
- `local-evidence` — logs, screenshots, test output, debug findings, package metadata
- `proposed-mutation` — explicit sync envelope requesting change to canonical truth
- `accepted-mutation` — cloud-accepted update recorded in canonical history
- `rejected-mutation` — local proposal blocked by stale state, conflict, policy, or failure

Core law:

```txt
Local state is candidate/evidence state until Nexus accepts it.
```

## 3. Web vs Studio Boundary

Nexus Web owns:

- identity
- canonical product truth
- Product Graph
- project ownership
- conversation and discovery
- cloud continuity
- shared history
- release gates
- share/demo links
- collaboration
- account, billing, and owner/admin boundaries
- lightweight editing and normal build flow

Nexus Studio owns or augments:

- active local project workspace
- bounded filesystem access
- local runtime
- local preview
- local build/debug evidence
- packaging candidates
- local recovery checkpoints
- offline-bounded work
- sync proposals back to Nexus

Core law:

```txt
Web remains canonical; Studio adds local power.
```

## 4. Web ↔ Studio Door Contract

The Studio door starts in Nexus Web through `SURF-008`.

The door opens the bound Studio desktop workspace for the active Nexus project. It is bidirectional.

Canonical door artifact:

- `docs/operating-system/nexus-studio-web-studio-door-contract-2026-06-02.md`

This artifact closes `STD-DOOR-001` as a planning/door-contract task only.

No Desktop implementation, install detection, deep-link verification, local execution, or live sync is implied by this closure.

Door promise boundary:

- Web may explain what Studio is and why a local action requires it.
- Web may show the `פתח ב־Nexus Studio` action and prepare a bounded handoff envelope.
- Web may show contract states for installed, not installed, connected, not connected, handoff failed, local dirty, offline bounded, sync rejected, evidence returned, mutation accepted, and mutation rejected.
- Web must not claim Studio is installed unless real installation detection exists.
- Web must not claim a deep link opened successfully unless Studio/Desktop confirms the handoff.
- Web must not claim local run, local file access, package creation, evidence return, live sync, accepted mutation, or rejected mutation unless that state is returned by implemented Studio capability.
- Web must not treat `/studio` as the Desktop app or as proof that local capability exists.
- Any door state that depends on Desktop implementation remains contract-only until installation detection, deep-link handling, Desktop confirmation, and live sync are implemented and verified.

```txt
The Web door can request local power. It cannot pretend local power already happened.
```

Web to Studio:

- explain why Studio is needed
- show install/connect/version state
- open Studio for the active project
- send project identity and canonical truth revision
- request a bounded local action

Studio to Web:

- return connection status
- return local dirty/sync state
- return candidate evidence
- return package/debug status
- propose sync envelopes
- notify failures and recovery state
- return the user to Web context

Connection states:

- `not-installed`
- `installed-not-connected`
- `connected-idle`
- `connected-project-bound`
- `version-mismatch`
- `stale-project-binding`
- `syncing`
- `local-dirty`
- `offline-bounded`
- `sync-rejected`
- `handoff-failed`
- `error`

Data that may cross the door:

- project id
- workspace id
- canonical truth revision/hash
- requested Studio action
- bounded sync envelope
- verification evidence metadata
- package candidate metadata
- compatibility/version status
- connection/sync state

Data that must not cross automatically:

- arbitrary filesystem contents
- unrelated folders
- local-only secrets
- environment variable dumps
- unrestricted logs
- raw local command history
- provider credentials

Approval points:

- first Studio open/connect
- first local workspace root grant
- material local runtime action
- local secret import/export
- package signing/deploy credential use
- applying Studio-originated mutation to canonical truth
- resolving stale/conflicting sync

Version compatibility law:

```txt
Version mismatch blocks mutation and sync. It may allow explanation and upgrade guidance only.
```

Stale project law:

```txt
If Studio's bound truth revision does not match the current Nexus lineage, Studio must reject apply/sync until the user reconciles.
```

## 5. Sync and Offline — STUD-002

Studio sync is not opaque folder mirroring. Studio sync is explicit mutation/checkpoint replay into Nexus truth.

Canonical sync artifact:

- `docs/operating-system/nexus-studio-sync-stale-offline-contract-2026-06-02.md`

This artifact closes `STD-SYNC-001` as a planning/sync-contract task only.

No Desktop sync engine, live conflict merge, offline queue runtime, or accepted mutation execution is implied by this closure.

Sync states:

- `synced`
- `local-dirty`
- `syncing`
- `stale`
- `conflict`
- `rejected`
- `offline-bounded`

Offline in V1 means bounded continuity:

- keep the active project visible locally
- continue approved local runtime/preview work when possible
- preserve local checkpoints and evidence
- queue proposed mutations
- warn that shared truth cannot be committed while disconnected

Offline in V1 does not mean:

- full offline Nexus sovereignty
- release while disconnected
- cloud collaboration
- arbitrary provider calls
- silent canonical mutation

Core law:

```txt
Offline work may queue evidence and proposals; it may not mint shared truth.
```

## 6. Permissions, Files, Secrets, and Computer Access — STUD-003

Studio local power must be explicit, bounded, reversible, and attached to the active project.

Canonical permission artifact:

- `docs/operating-system/nexus-studio-permissions-files-secrets-computer-contract-2026-06-02.md`

This artifact closes `STD-PERM-001` as a planning/permission-contract task only.

No Desktop permission engine, folder picker, local file read/write, runtime, install, secret storage, or permission persistence is implied by this closure.

Filesystem rules:

- access must be rooted in user-approved workspace paths
- grants are project-scoped and device-scoped
- grants must be visible and revocable
- unrelated folders are out of scope by default
- arbitrary machine-wide search is not V1

Computer access rules:

- runtime actions must be tied to active project intent
- commands must be bounded by a declared action class
- destructive local operations require explicit approval
- dependency installation is not automatic in V1 unless a later task scopes it
- unrestricted shell access is out of scope

Secrets rules:

- secrets are local-only by default
- secrets must not enter Product Graph, chat transcript, shared history, or logs automatically
- cloud transfer requires explicit approval and scoped purpose
- provider credentials must be redacted from user-facing evidence unless explicitly allowed

Core law:

```txt
Local power must be scoped, visible, revocable, and auditable.
```

## 7. Packaging, Debugging, and Release Handoff — STUD-004

Studio may prepare local builds, previews, packages, and debug evidence.

Canonical runtime artifact:

- `docs/operating-system/nexus-studio-local-runtime-preview-contract-2026-06-02.md`

This artifact closes `STD-RUN-001` as a planning/runtime-contract task only.

No Desktop runtime engine, local command execution, local preview server, dependency installation, runtime evidence collector, or file-fix runtime is implied by this closure.

Canonical package/debug/release handoff artifact:

- `docs/operating-system/nexus-studio-packaging-debug-release-handoff-contract-2026-06-03.md`

This artifact closes `STD-PKG-001` as a planning/package-debug-release-handoff contract task only.

No Desktop package builder, debug engine, package artifact creation, release execution, or Web Release integration is implied by this closure.

Studio does not independently release products in V1.

Release remains a Nexus-wide act closed through Web-side canonical release truth.

Local outputs:

- preview output is local evidence
- debug output is local evidence
- package output is candidate evidence
- package signing requires explicit approval
- release requires Web release gate acceptance

Core law:

```txt
A local package is evidence until Nexus accepts it into release truth.
```

## 8. Design Contract — STUD-005

Studio must feel like Nexus deep local mode.

Canonical design/tooling artifact:

- `docs/operating-system/nexus-studio-v1-design-tooling-contract-2026-06-03.md`

This artifact closes `STD-DESIGN-001` as a planning/design-tooling contract task only.

No Desktop UI, Web UI change, Figma edit, Electron shell, runtime UI, permission UI, or sync UI is implied by this closure.

It must be:

- Nexus-native
- product-first
- agent-guided
- local-power aware
- calmer than devtools
- denser than Web only where local operations require it

It must not be:

- a VS Code clone
- file-tree-first
- terminal-first
- a generic developer dashboard
- Electron chrome with Nexus branding
- a fake terminal over fake local power

Canonical design tool:

```txt
Figma is the first Studio design authority unless a later canonical decision replaces it.
```

First required design artifact:

```txt
Nexus Studio V1 Desktop Workspace Contract
```

First required visual artifact:

```txt
Nexus Studio V1 Visual Vision
```

The visual vision must include:

- what the desktop application looks like from the outside
- launch/open/connect states
- Studio Home / local project entry
- bound project workspace
- local files/assets area if included
- local preview area
- build/run panel
- debug/errors panel
- package/export area
- sync/conflict/offline states
- permission and secrets approval states
- return-to-Web / Web-to-Studio door states

The vision must be visual enough that implementation can be judged against it. A text-only design note is not enough.

That artifact must prove:

- Studio is visibly Nexus, not a generic IDE
- product/build truth remains dominant
- local runtime/preview/package/debug areas are supportive
- sync, offline, stale, permission, and recovery states are visible
- Web↔Studio door states are represented
- return-to-Web continuity is obvious

Core law:

```txt
Studio is product-first, agent-guided, and local-power aware; never file-tree-first.
```

## 9. Local Agents — STUD-006

Studio does not get a generic "Studio Agent" by default.

Local agents are allowed only when they have bounded responsibility, defined inputs, defined outputs, approval rules, sync boundaries, and failure behavior.

Canonical contract:

- `docs/operating-system/nexus-studio-local-agents-contract-2026-06-03.md`

Core distinction:

- agents explain, decide meaning, propose, verify, and route local work
- engines enforce permission, runtime, sync, package, history, and canonical write-back

Studio agents cannot bypass Studio engines.

Studio engines cannot replace product meaning.

V1 bounded local agents:

### Studio Local Agent

- role: persistent side-panel Nexus agent for Studio local work
- input: project opening package, local state, permission state, sync state, runtime/package/evidence state, user message or button action
- output: user-facing explanation, next local action, approval request, route to the right local agent or engine, structured action envelope
- approval: required before any dangerous local action
- sync: cannot sync directly; can prepare a sync intent for `Studio Sync Guard`
- failure: no fake completion; preserve pending intent and explain safest known state
- forbidden: direct file writes, direct command execution, package/release, canonical mutation acceptance, secret access, unrestricted desktop operation

### Studio Local Runtime Operator

- role: execute bounded local runtime/build/preview/debug actions for the active project
- input: bound project, approved action, folder permission state, command discovery result, environment/secrets availability state
- output: runtime state, preview availability, redacted log summary, local evidence, proposed fix classification
- approval: required for run permission, new/uncertain command, dependency installation, and file-writing fixes
- sync: returns evidence and proposed changes only; cannot commit truth directly
- failure: stop safely, redact sensitive output, show human explanation first

### Studio Sync Guard

- role: validate Studio-originated changes before Nexus accepts them
- input: proposed mutation, candidate artifact, local evidence, base cloud revision, current cloud revision, permission state, approval state
- output: sync-ready proposal, rejected proposal, stale state, conflict state, accepted/rejected sync result after canonical engine response
- approval: required for material truth mutation
- sync: sole Studio-to-cloud guard for Studio-originated changes, but canonical engines still perform final truth write
- failure: reject stale/divergent state, preserve local draft where safe, never fork silently

### Studio Package Verifier

- role: verify local package/debug outputs as release evidence candidates
- input: package candidate, runtime/build result, test result, sync state, permission state, changed files summary, evidence bundle
- output: package candidate card, verification state, blockers, evidence summary, Web Release handoff envelope
- approval: required for material package creation and handoff to Web Release
- sync: candidate artifact and evidence only until accepted upstream
- failure: mark candidate unverifiable; never claim release readiness

Post-release only:

- broader local AI/provider orchestration
- multi-project local operators
- advanced debugger agents
- local diff/merge assistants
- import/project analysis agent unless separately promoted

Explicitly out of scope:

- unrestricted desktop super-agent
- arbitrary shell operator
- auto-install-anything agent
- independent truth-deciding local planner
- autonomous local file change agent
- Web conversation agent reused as a desktop operator

Dangerous Studio actions:

- first-time project folder access
- writing, deleting, moving, or replacing local files
- running a command
- running a new or uncertain command
- installing dependencies
- reading secret availability or using secrets during runtime
- packaging a candidate
- syncing local changes to cloud
- accepting or rejecting conflict resolution
- attaching evidence to canonical history
- proposing product-truth mutation
- handing a package candidate to Release

These actions require the relevant combination of user approval, permission engine approval, runtime/package/sync validation, mutation review, and recovery checkpointing.

Agent Reality Gate:

- no Studio local agent can be marked implemented until it has a role contract, encoded rules, structured input/output, permission gates that cannot be bypassed, no fallback impersonation, live Desktop/provider proof where required, and visible proof that real input created real output without fake success.

Closure:

- `STD-AGENT-001` is closed as a planning/local-agent-contract task only.
- No Studio implementation task, live Desktop agent, local execution, file write, or live sync is trueGreen.

Core law:

```txt
Local Studio agents may operate tools; only Nexus canonical sync may change truth.
```

## 10. History and Recovery — STUD-007

Studio recovery protects local work. Nexus History protects accepted truth.

Canonical contract:

- `docs/operating-system/nexus-studio-history-recovery-contract-2026-06-03.md`

Studio may keep:

- local session journal
- local runtime checkpoints
- local crash recovery state
- unsynced mutation queue
- package/debug evidence cache

Studio internal app storage may preserve local recovery state without touching the project folder.

Project-folder writes require explicit project write permission.

Cloud History writes require accepted sync/canonical history path.

Nexus History must record:

- accepted Studio-originated mutations
- rejected sync attempts when relevant to trust
- package evidence accepted into release flow
- material permission/sync/recovery events that affect shared project truth

History layers:

- local session journal — local-only operational memory
- local recovery checkpoint — local point for inspection/recovery
- canonical Product History — accepted cloud truth
- recovery evidence attachment — redacted evidence attached only when useful and accepted upstream

Recovery states:

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

Close/reopen law:

- closing with unsynced work saves a local recovery checkpoint, marks work as local-unsynced, and warns the user when possible
- reopening with recovery state starts with `ראה מה נשמר`
- crash recovery shows what was recovered before offering sync
- interrupted run does not auto-resume
- interrupted package does not become a release candidate

Restore law:

- local restore restores local Studio state, not cloud truth
- canonical restore must go through cloud History/Mutation path
- mixed local/cloud restore must show what may be lost and offer keeping local work as draft

History attachment law:

- accepted Studio-originated mutations may enter canonical Product History
- rejected sync attempts may be recorded only when relevant to trust
- raw logs, raw command history, secrets, raw environment dumps, and unnecessary full local session journals must not enter Product History

Web boundary:

- Web may show that Studio reported unsynced local work, recovery point, accepted sync evidence, rejected sync reason, or preserved local draft
- Web must not claim local recovery, checkpoint existence, restore success, or sync success before real Desktop proof exists

Closure:

- `STD-HIST-001` is closed as a planning/history-recovery-contract task only.
- No Desktop app, live checkpoint engine, restore engine, cloud History writer, or sync behavior is trueGreen.

Core law:

```txt
History must distinguish local-only recovery from shared committed recovery.
```

## 11. V1 Scope

V1 must define and eventually prove:

- deep product answers and boundaries before implementation
- visual product vision before UI implementation
- Studio screen/workspace map before UI implementation
- Studio identity and truth boundary
- Web↔Studio door contract
- active project binding
- bounded local workspace
- file/secret/permission boundary
- local runtime/preview contract
- package/debug evidence handoff
- sync/stale/offline boundary
- local agent responsibility boundaries
- Studio Figma design contract
- history/recovery distinction

## 12. Post-Release Scope

Post-release:

- richer debugging tools
- broader package matrix
- multi-project local workspace management
- local AI/provider orchestration
- smarter offline queueing
- advanced diff/merge tooling
- broader local environment assistants
- collaboration handoff from Studio

## 13. Explicitly Out of Scope for V1

- full offline Nexus sovereignty
- Studio as a second truth owner
- arbitrary filesystem browsing
- unrestricted terminal/shell
- automatic local dependency installation
- deploy-from-local without Web release contract
- general-purpose IDE replacement
- import arbitrary non-Nexus repos as first-class Studio projects
- local AI that can mutate truth independently

## 14. Not TrueGreen Conditions

Studio canonical definition is not trueGreen if:

- Studio deep questions are unanswered
- Studio visual vision is missing
- Studio screens/workspaces are not mapped
- any doc implies Studio is a normal Web surface
- any doc implies Studio owns canonical truth
- `/studio` boundary is treated as Studio implementation completeness
- sync is described as vague continuity rather than explicit mutation/checkpoint flow
- offline behavior implies shared truth can change while disconnected
- filesystem or secrets access is unscoped
- release can bypass Web release gates
- Studio design can collapse into VS Code/file-tree-first UX
- local agents lack bounded responsibilities
