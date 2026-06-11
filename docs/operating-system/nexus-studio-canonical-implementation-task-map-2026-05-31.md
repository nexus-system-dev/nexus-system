# Nexus Studio Canonical Implementation Task Map

Date: `2026-05-31`
Status: `canonical working draft`
Scope: `Studio planning and implementation gates`

This map defines Studio implementation readiness. It does not mark any Studio implementation task `trueGreen`.

Canonical product source:

- `docs/operating-system/nexus-studio-canonical-product-system-2026-05-31.md`

Main Nexus map link:

- `docs/operating-system/nexus-canonical-implementation-task-map-2026-05-26.md`

## Global Studio Law

```txt
Studio is Nexus desktop-local power mode. Web/cloud Product Graph remains canonical.
```

## Foundation

### `STD-FND-001 — Define Nexus Studio identity and truth boundary`

- status: `trueGreen`
- classification: `release-blocker`
- depends_on:
  - `FND-001`
  - `SURF-008`
- canonical_law:
  - Studio is desktop-local Nexus power mode, not a second product or second truth.
- done_when:
  - main product system and Studio product doc encode identical identity/truth law
  - Studio is explicitly not Web page, Developer page, IDE clone, or sovereign local product
- not_trueGreen:
  - docs imply Studio is another Web route
  - docs imply Studio can own canonical truth
- verification:
  - doc cross-read shows no route-level/web-surface overclaim
  - grep finds no `Studio owns truth`, `Studio web IDE`, or equivalent contradiction
- evidence:
  - `2026-06-02: cross-read verified the Studio product system, main product system, Studio implementation map, and main implementation map all define Studio as desktop-local Nexus power mode, not a Web page, Developer page, IDE clone, sovereign local product, or second truth owner.`
- write_back:
  - `STD-FND-001 is closed as a planning/write-back task only. No Studio implementation task is trueGreen.`

### `STD-QUEST-001 — Lock Nexus Studio deep product questions and answers`

- status: `trueGreen`
- classification: `release-blocker`
- source:
  - `docs/operating-system/nexus-studio-deep-product-answers-2026-06-02.md`
- depends_on:
  - `STD-FND-001`
- canonical_law:
  - Studio must be defined through deep product questions and canonical answers before implementation or proof.
- done_when:
  - questions cover identity, user promise, external application shell, internal workspace, Web door, sync, offline, permissions, files, secrets, runtime, preview, debug, package, release handoff, local agents, recovery, failure states, and forbidden behaviors
  - answers are written into the Studio product system as laws, not loose notes
  - every answer that implies implementation creates or updates a task in this map
- not_trueGreen:
  - Studio remains a vague `desktop app`
  - answers are not translated into implementation tasks
  - design/proof work starts before unanswered product questions are closed
- verification:
  - audit shows no unanswered V1 product-definition question blocks implementation
- evidence:
  - `2026-06-02: batch 1 answers captured user, Web door, desktop shell, first workspace state, side agent, actions, file framing, local/canonical labels, unsynced state, and recovery baseline.`
  - `2026-06-02: batches 2-7 captured engine/agent integration, runtime/debug/package, sync/conflict/offline, permissions/secrets/folder-grants, screen inventory, Figma contract, platform scope, runtime strategy, and local storage boundary.`
- write_back:
  - `STD-QUEST-001 is closed as a planning/write-back task only. No Studio implementation task is trueGreen.`
- next:
  - `STD-VISION-001`

### `STD-VISION-001 — Nexus Studio V1 visual product vision`

- status: `trueGreen`
- classification: `release-blocker`
- depends_on:
  - `STD-QUEST-001`
- canonical_law:
  - Studio must have a visual product vision before UI implementation; text-only definition is insufficient.
- done_when:
  - visual artifact shows the desktop app outside and inside
  - visual artifact includes one Figma frame for each of the 11 Studio V1 screens
  - visual artifact includes an outside-application frame with icon, app name, clean opening screen, basic Mac window, Web-handed opening, and standalone opening
  - visual artifact includes deep locked frames for healthy main workspace, error/debug, preview before sync, cloud conflict, permissions, and package/release candidate
  - visual artifact covers Studio Home, project-bound workspace, local preview, build/run, debug/errors, package/export, sync/conflict/offline, permissions/secrets, and return-to-Web states
  - visual artifact proves Studio is Nexus-native, product-first, agent-guided, local-power aware, and not a VS Code clone
  - selected design tool is recorded; default is Figma unless replaced by a later canonical decision
- not_trueGreen:
  - no image/prototype/vision artifact exists
  - visual direction can still collapse into file-tree-first or terminal-first UX
  - Web `/studio` boundary is mistaken for the Studio application
- verification:
  - visual review confirms all required states exist and forbidden directions are absent
- evidence:
  - `2026-06-02: Figma file created: https://www.figma.com/design/PayxllrD8TrZdg3FIASn4g`
  - `2026-06-02: visual artifact contains 12 frames: outside application identity plus the 11 Studio V1 screens.`
  - `2026-06-02: deep locked frames exist for main project workspace, error/debug, preview before sync, cloud conflict, permissions, and package/release candidate.`
  - `2026-06-02: visual artifact includes Mac desktop app framing, product center, Nexus Local Agent side panel, bottom truth/status bar, return-to-Web action, Web handoff, permissions, read-only, recovery, conflict, pre-sync, debug, and package-candidate states.`
- write_back:
  - `STD-VISION-001 is closed as a planning/design artifact task only. No Studio implementation task is trueGreen.`
- artifact:
  - `docs/operating-system/nexus-studio-visual-vision-2026-06-02.md`
  - `https://www.figma.com/design/PayxllrD8TrZdg3FIASn4g`
- next:
  - `STD-SCREENS-001`

### `STD-SCREENS-001 — Nexus Studio V1 screen and workspace map`

- status: `trueGreen`
- classification: `release-blocker`
- depends_on:
  - `STD-VISION-001`
- canonical_law:
  - Studio V1 must define its screens/workspaces, purpose, visible regions, agent owners, truth engines, and failure states before implementation.
- done_when:
  - each Studio V1 screen has purpose, user action, visible regions, engine dependency, agent dependency, approval boundaries, sync impact, and failure behavior
  - official V1 screen list is mapped: Studio Opening, Web Project Opening Confirmation, Main Project Workspace, Error / Debug State, Preview Before Sync, Cloud Conflict, Permissions, Read-Only Mode, Local Recovery, Package / Release Candidate, Basic Studio Settings
  - screen map defines empty, loading, error, locked, conflict, no-permission, unsynced, and read-only states where relevant
  - screen map includes three persistent regions: product center, Nexus side panel, and bottom truth/status bar
  - screen map defines top-corner `חזור ל־Web` shell action
  - V1 vs post-release screen boundaries are explicit
  - no screen behaves like a generic IDE, Developer page, or Web route
- not_trueGreen:
  - implementation starts with only a concept image
  - file explorer, terminal, debug, package, or sync areas exist without boundaries
  - agent ownership is missing from screens that imply decisions/actions
- verification:
  - screen map cross-check proves every V1 screen has a truth owner, agent owner, and failure path
- evidence:
  - `2026-06-02: screen/workspace contract created at docs/operating-system/nexus-studio-v1-screen-workspace-map-2026-06-02.md.`
  - `2026-06-02: all 11 Studio V1 screens are mapped with purpose, user action, visible regions, buttons, truth engine, responsible agent, permissions, sync impact, failure behavior, and implementation boundary.`
  - `2026-06-02: cross-screen state coverage includes empty, loading, error, locked, conflict, no-permission, unsynced, and read-only states.`
- write_back:
  - `STD-SCREENS-001 is closed as a planning/screen-contract task only. No Studio implementation task is trueGreen.`
- artifact:
  - `docs/operating-system/nexus-studio-v1-screen-workspace-map-2026-06-02.md`
- next:
  - `STD-ENTRY-001`

### `STD-ENTRY-001 — Define Studio Web entry and install/connect states`

- status: `trueGreen`
- classification: `release-blocker`
- depends_on:
  - `STD-SCREENS-001`
  - `SURF-008`
- canonical_law:
  - Web opens Studio only when local computer power is required, and never pretends Studio is a Web screen.
- done_when:
  - Web entry states include `not-installed`, `installed-not-connected`, `connected-project-bound`, and `handoff-failed`
  - primary button text is `פתח ב־Nexus Studio`
  - secondary repeat-use text is `המשך ב־Studio`
  - Web project handoff confirmation shows `פותחים את הפרויקט הזה ב־Nexus Studio`
  - confirmation includes project name, connection state, what Studio is about to receive, required folder/permission when needed, and primary action `פתח פרויקט`
  - not-installed state explains why Studio is needed, what Web cannot do, and what can continue in Web
  - project-not-connected state uses `חבר את הפרויקט ל־Studio` and requires approval before local binding
- not_trueGreen:
  - Web presents local capability without installed/connected Studio truth
  - Web opens/binds a local project without user approval
  - button copy defaults to technical local-mode language
- verification:
  - screen map and Web boundary contract include install, connect, approve, fail, and continue-in-Web states
- evidence:
  - `2026-06-02: Web entry contract created at docs/operating-system/nexus-studio-web-entry-contract-2026-06-02.md.`
  - `2026-06-02: contract locks not-installed, installed-not-connected, connected-project-bound, handoff-failed, version-mismatch, stale-project-binding, local-dirty, offline-bounded, and sync-rejected states.`
  - `2026-06-02: contract defines what Web may promise and what Web must not promise before Studio is installed, connected, approved, or synced.`
- write_back:
  - `STD-ENTRY-001 is closed as a planning/entry-contract task only. No Studio implementation task is trueGreen.`
- artifact:
  - `docs/operating-system/nexus-studio-web-entry-contract-2026-06-02.md`
- next:
  - `STD-FND-002`

### `STD-FND-002 — Lock cloud truth vs local working-state model`

- status: `trueGreen`
- classification: `release-blocker`
- depends_on:
  - `STD-SCREENS-001`
- canonical_law:
  - Local files, runtime logs, previews, packages, and checkpoints are candidate/evidence state until accepted by Nexus.
- done_when:
  - canonical truth, local working state, candidate artifact, local evidence, proposed mutation, accepted mutation, and rejected mutation states are documented
  - Product Graph opening package is defined with bounded canonical snapshot, important history, open tasks, relevant recent conversation, build/test/release state, relevant files/assets, and important restore points
- not_trueGreen:
  - local artifacts can be mistaken for committed Product Graph truth
  - Studio opens from a random local folder instead of Nexus truth
- verification:
  - Studio doc contains the full truth-state list
- evidence:
  - `2026-06-02: cloud/local truth-state contract created at docs/operating-system/nexus-studio-cloud-local-truth-contract-2026-06-02.md.`
  - `2026-06-02: contract defines canonical-truth, local-working-state, candidate-artifact, local-evidence, proposed-mutation, accepted-mutation, rejected-mutation, opening package fields, allowed transitions, blocked transitions, stale/conflict rules, offline rules, evidence rules, and rejection rules.`
- write_back:
  - `STD-FND-002 is closed as a planning/truth-state contract task only. No Studio implementation task is trueGreen.`
- artifact:
  - `docs/operating-system/nexus-studio-cloud-local-truth-contract-2026-06-02.md`
- next:
  - `STD-DOOR-001`

### `STD-DOOR-001 — Lock Web↔Studio door contract`

- status: `trueGreen`
- classification: `release-blocker`
- depends_on:
  - `STD-FND-002`
  - `STD-SCREENS-001`
  - `SURF-008`
- canonical_law:
  - Web opens the door, Studio executes locally, Web remains canonical.
  - `STD-DOOR-001` must consume the `STD-FND-002` truth-state contract before defining any Web↔Studio promise.
  - Web may explain, prepare, and request handoff; Web must not claim installed Studio, successful deep link, local execution, live sync, accepted mutation, or local evidence unless that state was truthfully returned by implemented Studio/Desktop capability.
- done_when:
  - bidirectional Web->Studio and Studio->Web contract is documented with connection states, project binding, version compatibility, stale rejection, failure fallback, and approval boundaries
  - contract explicitly separates expected future capability from implemented capability
  - Web promise boundaries map every visible state to one of: not installed, installed but not connected, connected project-bound, handoff failed, local dirty, offline bounded, sync rejected, evidence returned, mutation accepted, or mutation rejected
  - every state that depends on real Desktop implementation is marked as contract-only until installation detection, deep-link handling, Desktop confirmation, and live sync are implemented and verified
- not_trueGreen:
  - Web handoff is one-way only
  - Studio cannot return status/sync/evidence/recovery to Web
  - Web promises local capability without installed/connected Studio truth
  - Web claims installation detection, deep-link success, local execution, live sync, evidence return, or mutation acceptance before real implementation verifies it
  - `/studio` Web boundary is treated as the Desktop app
- verification:
  - contract includes `not-installed`, `installed-not-connected`, `connected-project-bound`, `handoff-failed`, `version-mismatch`, `stale-project-binding`, `local-dirty`, `offline-bounded`, `sync-rejected`, `evidence-returned`, `mutation-accepted`, and `mutation-rejected`
  - contract cross-check proves every visible Web promise is backed by a truth state from `STD-FND-002` or marked unavailable/contract-only
- evidence:
  - `2026-06-02: Web↔Studio door contract created at docs/operating-system/nexus-studio-web-studio-door-contract-2026-06-02.md.`
  - `2026-06-02: contract defines Web open behavior, Studio return envelope, handoff envelope, deep-link boundary, promise boundary matrix, failure categories, what Web may show, what Web must not promise, and contract-only Desktop-dependent states.`
  - `2026-06-02: contract explicitly consumes STD-FND-002 and prohibits Web from claiming installation, deep-link success, local execution, live sync, evidence return, or mutation acceptance/rejection before implemented Desktop capability returns that truth.`
- write_back:
  - `STD-DOOR-001 is closed as a planning/door-contract task only. No Studio implementation task is trueGreen.`
- artifact:
  - `docs/operating-system/nexus-studio-web-studio-door-contract-2026-06-02.md`
- next:
  - `STD-SYNC-001`

### `STD-SHELL-001 — Define Studio desktop shell and standalone opening screen`

- status: `new-proposed`
- classification: `release-blocker`
- depends_on:
  - `STD-VISION-001`
  - `STD-SCREENS-001`
- canonical_law:
  - Studio must feel like a clean, quiet Mac application with deep Nexus local power, not an IDE clone.
- done_when:
  - outside application shell is defined visually and behaviorally
  - application name is `Nexus Studio`
  - icon direction is related to Nexus identity with deeper/local workspace layer
  - outside-application Figma frame includes icon, app name, basic Mac window, Web-handed project opening, and standalone opening
  - shell includes top-corner `חזור ל־Web`
  - standalone opening first card is source-aware: Web-handed project first when opened from Web, last worked-on project first when opened directly
  - connection state is always visible as a top status chip/bar but is not the first card
  - direct launch screen includes recent projects, Web/cloud connection state, open project action, permission state, and unsynced work state
  - Web-launched Studio enters the handed-off project context directly
  - first launch never opens into a raw file tree, terminal, logs, package list, or blank technical state
- not_trueGreen:
  - first Studio impression is file-tree-first, terminal-first, or developer-dashboard-first
  - standalone launch lacks connection and unsynced-work awareness
- verification:
  - visual artifact and screen map prove the shell is Nexus-native and product-first

### `STD-WORKSPACE-001 — Define first bound project workspace state`

- status: `new-proposed`
- classification: `release-blocker`
- depends_on:
  - `STD-SHELL-001`
  - `STD-SCREENS-001`
- feeds:
  - `STD-FND-002`
  - `STD-DOOR-001`
- canonical_law:
  - The first project view is product-first: product picture, sync state, and next local action before files or logs.
- done_when:
  - workspace shows project name, product summary, current open context, cloud connection state, local dirty state, next local action, and return-to-Web affordance
  - healthy center state shows the local product picture: what the product is, what is open, run state, local changes, and current possible actions
  - center default does not show files, logs, terminal, or raw technical dashboard
  - Nexus side agent is present and local-aware
  - five-second clarity rule is defined for project identity, cloud connection, unsynced work, available actions, approval requirements, and what returns to Web after sync
- not_trueGreen:
  - first bound workspace starts with file tree, terminal, raw environment error, logs, or package list
  - user cannot tell whether they are local, synced, or pending sync
- verification:
  - screen map proves the workspace passes the five-second clarity rule

### `STD-ERROR-STATE-001 — Define Studio center error state`

- status: `new-proposed`
- classification: `release-blocker`
- depends_on:
  - `STD-WORKSPACE-001`
  - `STD-RUN-001`
- feeds:
  - `STD-DEBUG-001`
- canonical_law:
  - Error state starts with meaning, not raw logs.
- done_when:
  - center error state first shows what failed, why it matters, and what can happen now
  - short technical summary appears below the explanation
  - full technical log is hidden behind an intentional disclosure action
  - error state visual variants cover error, locked, no-permission, conflict, unsynced, and read-only contexts where relevant
  - state supports proposed fix, permission request, retry, cancel, and open details where relevant
- not_trueGreen:
  - error state opens directly into full logs
  - user sees raw machine details before product meaning
  - error state exposes secrets or sensitive local paths
- verification:
  - error-state scenarios cover missing package, failed run, permission missing, secret missing, and build failure

### `STD-ACTIONS-001 — Define Studio action availability and locked states`

- status: `new-proposed`
- classification: `release-blocker`
- depends_on:
  - `STD-WORKSPACE-001`
- feeds:
  - `STD-PERM-001`
  - `STD-RUN-001`
  - `STD-PKG-001`
- canonical_law:
  - Studio actions may be visible by state, but dangerous local actions cannot appear active without permission.
- done_when:
  - always-visible/reachable action set is defined: return to Web, sync, run locally, open preview, test, stop, restore, approve change, cancel change, open/change folder, and see changes before sync
  - one primary action appears in the `הפעולה הבאה` card with short reason why it is the right action now
  - next-action card may include only 1-2 truly relevant secondary actions
  - stable actions remain reachable in a top action row or stable action area
  - locked state rules exist for local runtime, file writing, secrets, packaging, sync, publish, dependency install, folder change, external provider use, and environment access
  - each locked action has disabled visual treatment, lock icon, short reason, and unlock action such as `תן גישה`
- not_trueGreen:
  - restricted actions appear active without permission
  - user cannot see why an action is locked
  - action state can imply sync/publish/run happened when it did not
- verification:
  - permission matrix and screen map cross-check every action against permission and truth state

### `STD-FILES-001 — Define relevant project files area`

- status: `new-proposed`
- classification: `release-blocker`
- depends_on:
  - `STD-WORKSPACE-001`
- feeds:
  - `STD-PERM-001`
- canonical_law:
  - Studio may show files in V1, but files are product context, not the center of the application.
- done_when:
  - file area starts with relevant project files, not a full filesystem tree
  - file groupings include files affecting the current product screen, locally changed files, files requiring approval, and files related to current run/build/debug action
  - file groupings render as product-meaning cards by default
  - default file groups include `קבצים שמשפיעים על מסך הבית`, `קבצים ששונו מקומית`, `קבצים שדרושים להרצה`, and `קבצים עם שגיאה`
  - read-only mode keeps the normal project workspace visible with run, write, sync, and package actions locked with explanations
  - full file tree is either hidden behind an intentional action or marked post-V1
- not_trueGreen:
  - V1 opens file-tree-first
  - unrelated filesystem paths are visible by default
  - files are shown without product relevance or permission boundary
- verification:
  - screen map proves file display is scoped, relevant, and permission-bounded

### `STD-LOCAL-STATE-001 — Define local/canonical labels and unsynced status bar`

- status: `new-proposed`
- classification: `release-blocker`
- depends_on:
  - `STD-WORKSPACE-001`
- feeds:
  - `STD-SYNC-001`
  - `STD-FND-002`
- canonical_law:
  - Users must understand what is local, canonical, pending, conflicting, and evidence-only without learning sync architecture.
- done_when:
  - labels are defined: `מקומי`, `מסונכרן`, `ממתין לסנכרון`, `אושר בענן`, `יש התנגשות`, `טיוטה מקומית`, `ראיה בלבד`, `דורש אישור`
  - unsynced local work has a calm persistent status bar with actions: see changes, sync, keep local, cancel
  - bottom status bar is quiet for synced, local, running, and waiting states
  - bottom status bar becomes prominent for cloud conflict, open error, unsynced changes, missing permission, pre-sync risk, and package failed
  - exit with unsynced work triggers a short warning
- not_trueGreen:
  - local work can look cloud-approved
  - evidence can look canonical
  - unsynced work can be closed without visible recovery warning
- verification:
  - sync model and screen map use identical labels and status-bar actions

### `STD-RECOVERY-001 — Define local close/reopen recovery behavior`

- status: `new-proposed`
- classification: `release-blocker`
- depends_on:
  - `STD-LOCAL-STATE-001`
- feeds:
  - `STD-HIST-001`
  - `STD-SYNC-001`
- canonical_law:
  - Closing Studio mid-work must preserve local work safely without minting canonical truth.
- done_when:
  - closing Studio saves local work, creates a local recovery checkpoint, marks work unsynced, and safely stops dangerous running actions when needed
  - reopening with unsynced work shows `יש עבודה מקומית שלא סונכרנה. להמשיך, לסנכרן, או לבטל?`
  - local recovery primary action is `ראה מה נשמר`
  - recovery flow reviews what exists before offering continue, sync now, or cancel local changes
  - recovery behavior distinguishes local checkpoint, sync proposal, accepted cloud truth, and rejected local work
- not_trueGreen:
  - closing Studio loses local work silently
  - reopening treats local checkpoint as canonical truth
  - dangerous running action continues without safe stop or visible status
- verification:
  - recovery scenarios cover close during edit, close during run, close during package, reopen, sync, cancel, and keep-local

### `STD-PLATFORM-001 — Define Studio V1 platform scope`

- status: `new-proposed`
- classification: `release-blocker`
- depends_on:
  - `STD-QUEST-001`
- canonical_law:
  - Studio V1 is Mac-only; Windows is post-release.
- done_when:
  - V1 platform scope is documented as Mac-only
  - Windows is explicitly parked in post-release and not treated as a first-release blocker
  - platform-sensitive behaviors are listed: files, permissions, local run, secrets, sync, packaging
- not_trueGreen:
  - V1 scope implies cross-platform desktop support
  - Windows work blocks first Studio release
- verification:
  - doc audit confirms V1 platform scope is Mac-only and Windows is post-release

### `STD-SHELL-002 — Define Studio V1 desktop shell technology`

- status: `new-proposed`
- classification: `release-blocker`
- depends_on:
  - `STD-PLATFORM-001`
  - `STD-VISION-001`
- canonical_law:
  - Studio V1 uses Electron by default unless proven otherwise.
- done_when:
  - Electron is documented as V1 default shell technology
  - Tauri and native Mac are documented as post-release evaluations
  - shell decision preserves Nexus Web UI continuity and does not restart a technology debate before a working Studio exists
- not_trueGreen:
  - implementation starts while desktop shell technology is still undecided
  - native Mac or Tauri exploration blocks V1 without a canonical promotion
- verification:
  - implementation map lists Electron as V1 default and parks alternatives post-release

### `STD-STORAGE-001 — Define Studio local storage boundary`

- status: `new-proposed`
- classification: `release-blocker`
- depends_on:
  - `STD-FND-002`
  - `STD-PERM-001`
- canonical_law:
  - Studio can save local work without touching the project; writing to the project folder requires clear approval.
- done_when:
  - internal app storage is defined for local drafts, local work state, local history, cache, evidence, and sync state
  - project folder storage is defined only for user-approved writes to the project itself
  - storage model distinguishes local app state, project files, evidence, sync envelopes, and canonical cloud truth
- not_trueGreen:
  - Studio writes local drafts into the project folder by default
  - project folder state is treated as canonical truth
- verification:
  - storage scenarios cover local draft save, approved project write, revoked folder grant, and sync proposal

## Connection / Handoff

### `STD-DOOR-002 — Define version compatibility and stale project protection`

- status: `new-proposed`
- classification: `release-blocker`
- depends_on:
  - `STD-DOOR-001`
- canonical_law:
  - version mismatch and stale project binding block mutation/sync.
- done_when:
  - product-level protocol defines version mismatch, stale lineage, missing local project, and rejected handoff states
- not_trueGreen:
  - Studio can sync against unknown or stale cloud truth
- verification:
  - scenario table covers version mismatch, stale project, folder missing, and rejected sync

## Sync / Offline

### `STD-SYNC-001 — Lock sync, stale-state, and bounded offline model`

- status: `trueGreen`
- classification: `release-blocker`
- depends_on:
  - `STD-FND-002`
  - `STD-DOOR-001`
- canonical_law:
  - local work may continue temporarily; canonical truth cannot fork.
- done_when:
  - sync states, offline limits, conflict rules, and stale rejection are documented
  - pre-sync review shows product meaning, affected files, affected screens/flows, cloud impact, local remainder, approvals, conflicts, tests, and actions
  - pre-sync review order is product meaning first, then files, then tests/evidence
  - sync returns both change and proof: tests, screenshots when available, shortened logs, runtime/package status, failures, restore point, and next recommendation
- not_trueGreen:
  - offline work can silently mint shared truth
  - sync is described as vague continuity
  - sync only returns code/files without evidence or product meaning
- verification:
  - doc includes `synced`, `local-dirty`, `syncing`, `stale`, `conflict`, `rejected`, `offline-bounded`
- evidence:
  - `2026-06-02: sync/stale/offline contract created at docs/operating-system/nexus-studio-sync-stale-offline-contract-2026-06-02.md.`
  - `2026-06-02: contract defines sync states, stale-state checks, conflict rules, bounded offline queue, pre-sync review, sync proposal envelope, accepted sync result, rejected sync result, evidence rules, failure/retry behavior, and Web display boundaries.`
  - `2026-06-02: contract explicitly marks Desktop-dependent sync states as contract-only until live Desktop sync implementation verifies them.`
- write_back:
  - `STD-SYNC-001 is closed as a planning/sync-contract task only. No Studio implementation task is trueGreen.`
- artifact:
  - `docs/operating-system/nexus-studio-sync-stale-offline-contract-2026-06-02.md`
- next:
  - `STD-PERM-001`

### `STD-SYNC-002 — Define conflict handling and mutation envelope replay`

- status: `new-proposed`
- classification: `release-blocker`
- depends_on:
  - `STD-SYNC-001`
- canonical_law:
  - Studio sync uses explicit mutation/checkpoint envelopes, not opaque folder mirroring.
- done_when:
  - mutation envelope fields and conflict outcomes are defined at product-contract level
  - cloud-changed-while-local scenario blocks automatic sync and shows cloud changes, local changes, conflicts, mergeable areas, required choices, and safe outcomes
  - outcomes include merge, keep local as draft, accept cloud, create separate branch/version, and ask user to choose
  - default conflict UI is guided Nexus conversation with options; detailed cloud-vs-local comparison is a second step
- not_trueGreen:
  - sync can overwrite cloud truth without conflict/stale review
  - sync can overwrite local work silently
- verification:
  - scenarios cover local dirty + web changed, offline queue + reconnect, and rejected mutation

### `STD-OFFLINE-001 — Define bounded Studio offline work`

- status: `new-proposed`
- classification: `release-blocker`
- depends_on:
  - `STD-SYNC-001`
  - `STD-FND-002`
- canonical_law:
  - Offline means safe local work, not final new truth.
- done_when:
  - allowed offline states include recent projects, last known state, local drafts, local run with existing permission, local changes, and local evidence
  - forbidden offline states include publish, release, canonical cloud mutation, new provider connection, promised sync, cloud conflict resolution, and actions requiring cloud permissions
- not_trueGreen:
  - offline mode implies sovereignty or final truth
  - Studio promises sync while cloud is unavailable
- verification:
  - offline scenario table separates allowed local work from forbidden canonical/cloud actions

### `STD-EVIDENCE-001 — Define Studio evidence envelope`

- status: `new-proposed`
- classification: `release-blocker`
- depends_on:
  - `STD-SYNC-001`
  - `STD-PKG-001`
- canonical_law:
  - Evidence records what happened; it does not become product truth by itself.
- done_when:
  - evidence-only states are defined: run log, screenshot, test result, build error, performance metric, agent note
  - truth-change candidate states are defined: screen change, flow change, behavior-affecting file change, configuration change, package/dependency change, behavior change, meaningful design change
  - evidence envelope includes source, time, local/canonical relation, affected action, and whether it can support sync/release
- not_trueGreen:
  - logs, screenshots, tests, or agent notes are treated as product mutations
  - product mutations enter truth as evidence-only records
- verification:
  - evidence vs truth-change candidate examples are cross-checked in sync and release contracts

### `STD-MUTATION-BRIDGE-001 — Define Mutation Agent and sync engine acceptance bridge`

- status: `new-proposed`
- classification: `release-blocker`
- depends_on:
  - `STD-SYNC-002`
  - `MUT-001`
- canonical_law:
  - The agent decides meaning; sync preserves and connects truth.
- done_when:
  - `Mutation Agent` role is defined for local changes: meaning, product impact, risk, approval requirement, affected areas
  - sync engine role is defined for local changes: save, compare, conflict detect, cloud return, broken-state prevention
  - acceptance path defines proposed mutation, user approval when required, sync validation, accepted mutation, rejected mutation, and history attachment
- not_trueGreen:
  - sync accepts product changes without mutation meaning review
  - mutation meaning is approved but sync can still corrupt cloud/local truth
- verification:
  - scenarios cover small local change, product-level change, rejected mutation, conflict, approved sync, and failed sync

## Permissions / Files / Secrets / Computer Access

### `STD-PERM-001 — Lock permissions/files/secrets/computer boundary`

- status: `trueGreen`
- classification: `release-blocker`
- depends_on:
  - `STD-SCREENS-001`
  - `STD-FND-002`
  - `STD-DOOR-001`
  - `STD-SYNC-001`
- canonical_law:
  - local power must be scoped, visible, reversible, and approval-bounded.
- done_when:
  - file boundary, secret boundary, machine access boundary, and revoke rules are written
  - permissions screen uses cards for folder, read, write, run, secrets, install, and sync
  - each permission card explains why needed, what it enables, risk, active/inactive state, and how to revoke
  - local run requires both agent intent understanding and permission-engine approval
  - real file writes require approval; local draft proposals may be prepared without writing real files
- not_trueGreen:
  - unrestricted filesystem or shell behavior is implied
  - Studio writes to local files as an implied default
- verification:
  - doc explicitly forbids arbitrary filesystem and unrestricted shell behavior in V1
- evidence:
  - `2026-06-02: permissions/files/secrets/computer access contract created at docs/operating-system/nexus-studio-permissions-files-secrets-computer-contract-2026-06-02.md.`
  - `2026-06-02: contract defines permission classes, permission cards, folder grant/revoke, missing/moved/mismatched folder states, read/write boundaries, runtime/install/sync/package/evidence boundaries, local secrets boundary, computer access boundary, locked action display, read-only mode, revocation, failures, and Web display boundaries.`
  - `2026-06-02: contract explicitly marks Desktop-dependent permissions as contract-only until real Desktop permission implementation verifies them.`
- write_back:
  - `STD-PERM-001 is closed as a planning/permission-contract task only. No Studio implementation task is trueGreen.`
- artifact:
  - `docs/operating-system/nexus-studio-permissions-files-secrets-computer-contract-2026-06-02.md`
- next:
  - `STD-RUN-001`

### `STD-PERM-002 — Define active project filesystem grant model`

- status: `new-proposed`
- classification: `release-blocker`
- depends_on:
  - `STD-PERM-001`
- canonical_law:
  - filesystem access is rooted to explicit user-approved project paths.
- done_when:
  - grant, revoke, moved-folder, missing-folder, and path-leak failure states are defined
  - folder grant action is `בחר תיקייה לפרויקט הזה`
  - Studio shows selected folder, linked project, allowed actions, and read-only vs read/write scope
  - revoke action is `בטל גישה לתיקייה`
  - moved/deleted/mismatched folder state stops Studio and offers choose new folder, reconnect, read-only mode, or return to Web
- not_trueGreen:
  - Studio can browse unrelated machine paths by default
  - Studio creates a new folder and treats it as the same project without approval
- verification:
  - permission matrix exists for read, write, delete, package, runtime, and evidence attach

### `STD-PERM-003 — Define local secret classification and transfer approval`

- status: `new-proposed`
- classification: `release-blocker`
- depends_on:
  - `STD-PERM-001`
- canonical_law:
  - local secrets may be used for local run only and must not become visible evidence, logs, screenshots, sync, or cloud history.
- done_when:
  - local-only, redacted-status, missing-secret, and forbidden-transfer states are defined
  - Studio may show only secret status, such as `משתנה סודי נמצא` or `משתנה סודי חסר`
  - no raw secret value crosses into evidence, logs, screenshots, sync, Product Graph, history, or release evidence
- not_trueGreen:
  - secrets can enter Product Graph, chat transcript, logs, or release evidence automatically
- verification:
  - doc explicitly blocks env dumps, provider credentials, and raw local command history crossing the door automatically

## Local Runtime / Preview

### `STD-RUN-001 — Define Studio local runtime and preview contract`

- status: `trueGreen`
- classification: `release-blocker`
- depends_on:
  - `STD-PERM-001`
  - `STD-SYNC-001`
- canonical_law:
  - Studio may run local preview/build flows only for the active Nexus project.
- done_when:
  - runtime scope, preview evidence, failure behavior, and bounded local action classes are documented
  - local run button flow passes through Studio Local Agent understanding and permission-engine approval
  - failure experience starts with human explanation, then shortened log, then proposed fix; raw logs are not first
  - Studio first looks for an existing clear project run command
  - Studio V1 runs existing project commands first and does not use a full internal Nexus Runtime as the base
  - new or uncertain run command is proposed, explained, and approved before execution
  - missing dependency installation is proposed and approval-gated; no silent install
  - safe error display allows stage, non-sensitive package name, general command name, filtered error line, and proposed fix
  - safe error display forbids secrets, keys, sensitive full user paths, environment variables, tokens, sensitive internal addresses, and private file contents
- not_trueGreen:
  - runtime output can be mistaken for canonical truth
  - local run bypasses permission checks
  - failed run opens directly into raw logs
  - Studio invents or runs a new command without approval
  - Studio installs packages silently
- verification:
  - doc distinguishes local runtime evidence from Product Graph truth
- evidence:
  - `2026-06-02: local runtime/preview contract created at docs/operating-system/nexus-studio-local-runtime-preview-contract-2026-06-02.md.`
  - `2026-06-02: contract defines runtime action classes, existing-command-first rule, new command approval rule, run permission gate, preview boundary, dependency install boundary, secrets boundary during run, runtime evidence, failure display, proposed fix classification, stop behavior, and Web display boundary.`
  - `2026-06-02: contract explicitly marks Desktop-dependent runtime states as contract-only until real Desktop runtime implementation verifies them.`
- write_back:
  - `STD-RUN-001 is closed as a planning/runtime-contract task only. No Studio implementation task is trueGreen.`
- artifact:
  - `docs/operating-system/nexus-studio-local-runtime-preview-contract-2026-06-02.md`
- next:
  - `STD-PKG-001`

### `STD-DEBUG-001 — Define Studio V1 debug area`

- status: `new-proposed`
- classification: `release-blocker`
- depends_on:
  - `STD-RUN-001`
  - `STD-WORKSPACE-001`
- canonical_law:
  - V1 debugging stays inside the project workspace and starts with product-understandable meaning, not raw logs.
- done_when:
  - debug area shows what failed, what it means, what can be fixed, and optional technical details
  - deep standalone debug screen is marked post-V1 unless promoted by a later canonical task
  - error-fix classification path is defined through Studio Local Agent, Mutation Agent, and permission engine
- not_trueGreen:
  - Studio opens a separate deep debug screen by default in V1
  - debug starts with raw logs or unfiltered machine details
  - fixes can be written to files without permission or mutation classification
- verification:
  - debug scenarios cover missing dependency, missing import, central library replacement, product-behavior change, and secret-redacted log

## Packaging / Debug / Release Handoff

### `STD-PKG-001 — Define packaging/debug/release handoff contract`

- status: `trueGreen`
- classification: `release-blocker`
- depends_on:
  - `STD-RUN-001`
  - `STD-PERM-001`
  - `STD-SYNC-001`
- canonical_law:
  - packaging/debug happen locally; packaging creates candidates, and release closes canonically in Nexus Web.
- done_when:
  - local package/debug outputs are defined as candidate evidence, not release truth
  - release handoff to Web release gates is documented
  - V1 packaging outputs are limited to local test artifact, preview package, testable build, or release candidate
  - package screen shows a release candidate card with what was packaged, version, tests passed, affected files, what remains local, and what is ready to move to Web/Release
  - packaging language never implies public readiness
- not_trueGreen:
  - local package output can bypass release gates
  - Studio packaging claims final release or publish readiness
- verification:
  - no doc implies deploy-from-local or release-from-local by default
- evidence:
  - `2026-06-03: packaging/debug/release handoff contract created at docs/operating-system/nexus-studio-packaging-debug-release-handoff-contract-2026-06-03.md.`
  - `2026-06-03: contract defines package candidates as candidate artifacts, debug outputs as local evidence, pre-package review, package blockers, package candidate card, release handoff to Web Release, evidence attachment, failure behavior, and Web display boundaries.`
  - `2026-06-03: contract explicitly marks Desktop-dependent package/debug/release-handoff states as contract-only until real Desktop packaging/debug and Web Release integration verify them.`
- write_back:
  - `STD-PKG-001 is closed as a planning/package-debug-release-handoff contract task only. No Studio implementation task is trueGreen.`
- artifact:
  - `docs/operating-system/nexus-studio-packaging-debug-release-handoff-contract-2026-06-03.md`
- next:
  - `STD-DESIGN-001`

### `STD-PKG-002 — Define local evidence attachment and release-gate visibility`

- status: `new-proposed`
- classification: `release-blocker`
- depends_on:
  - `STD-PKG-001`
- canonical_law:
  - Studio evidence may support release, but release requires Web-side canonical acceptance.
- done_when:
  - package-ready, package-failed, debug-evidence, unverifiable, and accepted-evidence states are defined
  - pre-package review shows what enters package, what changed, affected files, sync state, unapproved local changes, and failed tests
  - packaging stops when unapproved changes or blocking failed tests exist
- not_trueGreen:
  - debug/package evidence is not visible to release/history contracts
  - package artifact can include unapproved changes
- verification:
  - scenarios cover package success, package failure, verification failure, stale package, and return to Web release

## Design / Tooling

### `STD-SETTINGS-001 — Define basic Studio settings screen`

- status: `new-proposed`
- classification: `release-blocker`
- depends_on:
  - `STD-SCREENS-001`
  - `STD-PERM-001`
- canonical_law:
  - Studio settings expose only the basic controls required to manage local connection, permissions, folders, and safe return paths in V1.
- done_when:
  - Basic Studio Settings screen purpose, visible regions, engine dependency, agent dependency, approval boundaries, sync impact, and failure behavior are mapped
  - settings include Web/cloud connection state, folder grants, permission revocation, local recovery visibility, and safe return-to-Web affordance
  - settings do not become a developer preferences dashboard or hidden IDE configuration surface
- not_trueGreen:
  - V1 settings are undefined despite being in the official screen list
  - settings expose unrestricted local tooling, shell, or filesystem controls
- verification:
  - screen map includes Basic Studio Settings with permission and recovery boundaries

### `STD-DESIGN-001 — Lock Studio V1 design/tooling contract`

- status: `trueGreen`
- classification: `release-blocker`
- depends_on:
  - `STD-VISION-001`
  - `STD-SCREENS-001`
  - `STD-PKG-001`
- canonical_law:
  - Studio is Nexus-native, product-first, agent-guided, and local-power aware.
- done_when:
  - Figma is selected as first design authority
  - Studio uses `Nexus Design System + Studio Depth Layer`, not a new design system from scratch
  - Studio Depth Layer defines deeper background, professional contrast, state colors, local-action icons, permission language, sync language, error language, run language, and package language
  - visual direction encodes `Web = light, fast, alive` and `Studio = deep, stable, local, precise`
  - visual direction creates wow through control over local chaos, not loud colors or excessive animation
  - Figma visual direction locks product center, Nexus side panel, bottom status bar, top return action, next-action card, locked states, error states, sync states, and `ראה מה ישתנה` state
  - first artifact `Nexus Studio V1 Desktop Workspace Contract` is required before implementation
  - visual prohibitions are documented
- not_trueGreen:
  - Studio can be implemented as VS Code clone, file-tree-first UI, fake terminal, or generic developer dashboard
- verification:
  - design contract includes forbidden directions and required proof states
- evidence:
  - `2026-06-03: design/tooling contract created at docs/operating-system/nexus-studio-v1-design-tooling-contract-2026-06-03.md.`
  - `2026-06-03: contract defines Figma as first design authority, Nexus Design System + Studio Depth Layer, persistent shell regions, product-framed tooling surfaces, state design requirements, required deep frames, side panel/status bar rules, design proof requirements, and anti-pattern checklist.`
  - `2026-06-03: contract forbids VS Code clone, file-tree-first UI, terminal-first workflow, generic developer dashboard, fake Web Studio, and fake local power.`
- write_back:
  - `STD-DESIGN-001 is closed as a planning/design-tooling contract task only. No Studio implementation task is trueGreen.`
- artifact:
  - `docs/operating-system/nexus-studio-v1-design-tooling-contract-2026-06-03.md`
- next:
  - `STD-AGENT-001`

## Local Agents

### `STD-AGENT-001 — Define bounded Studio local agents`

- status: `trueGreen`
- classification: `release-blocker`
- depends_on:
  - `STD-SYNC-001`
  - `STD-PERM-001`
  - `STD-RUN-001`
  - `STD-PKG-001`
  - `STD-DESIGN-001`
- canonical_law:
  - Studio uses a dedicated local-role Nexus agent; local agents can operate tools only inside bounded permission and sync rules.
- done_when:
  - V1 agent list defines role, input, output, approval boundary, sync boundary, and failure boundary
  - `Studio Local Agent` is defined as the persistent side agent that explains local computer work, running actions, failures, permissions, local state, cloud-return state, and danger
  - Studio Nexus side panel visual contract is defined as a local action/evidence/approval panel with same Nexus personality, not a direct Web chat clone
  - relationship to Web conversation agent is defined: same Nexus truth/personality, different local execution role
  - dangerous local actions and the required approval/permission/sync gates are defined
  - Agent Reality Gate is defined for future live implementation proof
- not_trueGreen:
  - vague `Studio Agent` or desktop super-agent remains
  - Web conversation agent is reused without local role boundaries
- verification:
  - `docs/operating-system/nexus-studio-local-agents-contract-2026-06-03.md` lists only bounded V1 local agents and each declares role, input, output, allowed actions, forbidden actions, approval, sync, failure, and implementation-proof boundaries
  - no Studio implementation task, live Desktop agent, local runtime action, local file write, or live sync is marked trueGreen by this closure
- evidence:
  - `docs/operating-system/nexus-studio-local-agents-contract-2026-06-03.md`
- write_back:
  - closed as planning/local-agent-contract only
- next:
  - `STD-HIST-001`

## History / Recovery

### `STD-HIST-001 — Define Studio history and recovery contract`

- status: `trueGreen`
- classification: `release-blocker`
- depends_on:
  - `STD-FND-002`
  - `STD-SYNC-001`
  - `STD-PERM-001`
  - `STD-AGENT-001`
- canonical_law:
  - Studio recovery protects local work; Web History protects accepted truth.
- done_when:
  - local checkpoints, crash recovery, unsynced warnings, rebase/retry/discard paths, and canonical History attachment rules are documented
  - opening package includes important history and restore points, not the entire history by default
  - sync evidence and restore point attachment are documented
  - close, crash, reopen, restore, discard, rejected-sync, and cloud-changed-while-local behavior are defined
  - Web promise boundaries for recovery are defined
- not_trueGreen:
  - local recovery is treated as shared canonical history
  - Studio downloads or exposes unnecessary full project history by default
- verification:
  - `docs/operating-system/nexus-studio-history-recovery-contract-2026-06-03.md` separates local session journal, local recovery checkpoint, canonical Product History, and recovery evidence attachment
  - the contract states that no Desktop app, live checkpoint engine, restore engine, cloud History writer, or sync behavior is closed by this task
- evidence:
  - `docs/operating-system/nexus-studio-history-recovery-contract-2026-06-03.md`
- write_back:
  - closed as planning/history-recovery-contract only
- next:
  - `SURF-009 — Shell-to-engine integration contract`

## Post-Release Expansion

### `STD-POST-001 — Post-release Studio expansion lane`

- status: `new-proposed`
- classification: `post-release`
- depends_on:
  - `STD-FND-001`
- canonical_law:
  - richer local power may expand later without breaking truth boundaries.
- done_when:
  - post-release items are grouped and excluded from V1 promise
- not_trueGreen:
  - always post-release until separately promoted
- verification:
  - Windows, Tauri evaluation, native Mac evaluation, deeper Nexus Runtime, advanced debugging, multi-project local workspace, broader local AI/provider orchestration, smarter offline queueing, advanced diff/merge, and broader packaging matrix are parked here

## Explicitly Out of Scope for V1

- full offline sovereignty
- Studio as a second truth owner
- arbitrary filesystem browsing
- unrestricted shell / dependency install
- deploy-from-local without Web release contract
- IDE replacement
- import arbitrary non-Nexus repos as first-class Studio projects
- local AI that can mutate truth independently
