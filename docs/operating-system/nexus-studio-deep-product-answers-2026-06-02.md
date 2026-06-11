# Nexus Studio Deep Product Answers

Date: `2026-06-02`
Task: `STD-QUEST-001`
Batch: `1 — Studio user, Web door, desktop shell, first workspace state`
Status: `canonical answers captured, not complete`

## 1. First User

The first Studio user is a serious product builder who needs local power.

This user is not a casual first-idea user and not only a developer.

Primary V1 user:

- founder
- product creator
- partially technical builder
- serious builder with an existing Nexus product
- user who has reached a point where Nexus Web is not enough

Studio is for the moment when the product needs local files, local runtime, tests, debugging, packaging, or real local project work.

## 2. When Web Opens Studio

Nexus Web should say “open Studio” when the requested action requires the user's local computer.

Canonical Studio triggers:

- local files
- local runtime
- debugging
- heavy build checks
- folder access
- packaging
- bounded offline work
- local secrets
- testing against real code
- opening an existing project on the user's machine

Core law:

```txt
If the action requires the user's computer, Nexus opens Studio.
```

## 3. Primary Web Button

Primary button:

```txt
פתח ב־Nexus Studio
```

Secondary button after the user understands Studio:

```txt
המשך ב־Studio
```

Forbidden default:

```txt
פתח מצב מקומי
```

Reason: it is too technical as the default product language.

## 4. Studio Not Installed

If Studio is not installed, Nexus Web must show:

- short reason why Studio is needed
- download/install action
- what Web cannot do alone
- what remains possible in Web

Required tone:

- explanatory
- calm
- not scary
- not a hard failure unless the requested action truly cannot proceed

Example:

```txt
כדי להריץ את הפרויקט מקומית, צריך את Nexus Studio. אפשר להמשיך לערוך ב־Web, או להתקין Studio כדי לפתוח יכולות מקומיות.
```

## 5. Studio Installed But Not Project-Connected

If Studio is installed but not connected to the active project, the primary state is:

```txt
חבר את הפרויקט ל־Studio
```

Connection requires:

- access approval
- folder selection when needed
- verification that this is the same Nexus project

The Web link may open Studio with project metadata, but project binding must still be approved by the user because it touches local computer state.

## 6. Outside Application Feel

Studio should feel like:

```txt
אפליקציית Mac נקייה ושקטה, עם כוח עבודה עמוק של Nexus.
```

It must not feel like:

- IDE
- terminal
- developer dashboard
- file manager
- generic Electron shell with Nexus branding

Required feel:

- professional
- clean
- powerful
- quiet
- project-focused
- like the deep work room of Nexus

## 7. Standalone Opening Screen

Studio should have a standalone opening screen.

If opened from Web:

- go directly into the project handed off from Web
- show connection/binding status immediately

If opened directly:

- show recent projects
- show Web/cloud connection state
- show open project action
- show permission state
- show unsynced work if it exists

Forbidden first state:

- opening directly into a file tree

## 8. Direct Studio Opening Without Web

Studio may open without Web, but before cloud connection it may only:

- show recent projects
- open a local project
- show connection state
- work in bounded local mode
- save local drafts/checkpoints

It may not create new canonical truth without sync/connection.

Core law:

```txt
Studio can work locally, but official truth remains in Nexus cloud.
```

## 9. First Project View

After opening a bound project, the first visible state is:

```txt
central product picture + sync state + next local action
```

Required first view:

- project name
- what the product is
- what is open now
- whether it is synced
- what the user can do now
- run locally
- test
- open preview
- package
- sync

Nexus agent should be visible at the side.

## 10. Forbidden First Project View

The first project view must not be:

- file tree
- terminal
- logs
- blank screen
- raw environment error
- technical dashboard
- package list
- folder picker without product context

Reason:

```txt
That would collapse Studio into a VS Code clone.
```

## 11. Nexus Agent Placement

The Nexus agent should be a persistent area that accompanies local work.

Default V1 placement:

- side rail/panel, similar to Build, but deeper and local-aware

The agent explains:

- what is running
- what failed
- what requires approval
- what is local
- what will sync

Command palette may exist later, but it is not the V1 center.

## 12. Always Available Actions

These actions should be visible or reachable according to state:

- חזור ל־Web
- סנכרן
- הרץ מקומית
- פתח תצוגה
- בדוק
- עצור
- שחזר
- אשר שינוי
- בטל שינוי
- פתח תיקייה / החלף תיקייה
- ראה מה ישתנה לפני סנכרון

Not all actions are active in every state.

## 13. Permission-Locked Actions

The following must not appear active without permission:

- local runtime
- file writing
- secret access
- packaging
- sync
- publish
- dependency installation
- folder change
- external provider use
- environment access

Locked actions may be visible with short explanation.

## 14. Files in V1

V1 should show files, but files must not be the center of the product.

Required framing:

```txt
relevant project files
```

Not:

```txt
file tree first
```

## 15. File Presentation

Files are shown first as product context:

- files affecting the current product screen
- locally changed files
- files requiring approval
- files related to the current run/build/debug action

A full file tree may exist later, but it is not the default V1 opening shape.

Core law:

```txt
The user sees what is relevant to the product, not the whole filesystem.
```

## 16. Local vs Canonical Labels

Studio must show simple truth labels:

- מקומי
- מסונכרן
- ממתין לסנכרון
- אושר בענן
- יש התנגשות
- טיוטה מקומית
- ראיה בלבד
- דורש אישור

The user must not need to understand sync architecture.

## 17. Unsynced Local Changes

Unsynced local changes require a persistent but calm status bar.

Example:

```txt
יש 3 שינויים מקומיים שעדיין לא סונכרנו.
```

Required actions:

- ראה שינויים
- סנכרן
- השאר מקומי
- בטל

If the user exits with unsynced work, Studio must show a short warning.

## 18. Closing Studio Mid-Work

If the user closes Studio mid-work, Studio must:

- save locally
- create a local recovery checkpoint
- mark work as unsynced
- stop dangerous actions safely when needed

On next open:

```txt
יש עבודה מקומית שלא סונכרנה. להמשיך, לסנכרן, או לבטל?
```

## 19. Five-Second Clarity Rule

Within five seconds, the user must understand:

- which project is open
- whether it is connected to the cloud
- whether local changes exist
- what can be done now
- what requires approval
- what will return to Web after sync

The user must not need to guess:

- where am I
- is this local or cloud
- what happens if I close

## 20. User Feeling

The correct Studio feeling:

```txt
אני עדיין בתוך נקסוס, רק עכשיו היא עובדת מהמחשב שלי.
```

Studio is not a different product.

It is the same Nexus with deeper local power.

## Implementation Tasks Derived From This Batch

These answers require or update the following tasks:

- `STD-QUEST-001` — continue deep answer capture and canonical write-back
- `STD-VISION-001` — include outside app shell, Web handoff, project workspace, side agent, and local/canonical state labels
- `STD-SCREENS-001` — map Studio Home, bound project workspace, relevant files area, status bar, permission-locked actions, and recovery prompt
- `STD-DOOR-001` — include installed/not-installed/project-not-connected states and approval-based project binding
- `STD-PERM-001` — define locked action visibility and permission requirements
- `STD-SYNC-001` — define unsynced status bar and local/canonical labels
- `STD-HIST-001` — define local recovery checkpoint and reopen prompt
- `STD-DESIGN-001` — block file-tree-first, terminal-first, and generic IDE visual direction

---

# Batch 2 — Engines, Agents, Sync Meaning, Evidence, Offline, Cloud Conflict

Status: `canonical answers captured, not complete`

## 21. Project Truth Engine

The engine that holds project truth is the Nexus `Product Graph` / project truth engine.

Studio must not invent project truth locally.

Before local work, Studio reads from cloud truth:

- what the product is
- product structure
- screens
- flows
- current version
- approved state
- last work state

Core law:

```txt
Studio opens the project from Nexus truth, not from a random local folder.
```

## 22. Studio Project Opening Package

Studio should not receive only a dry snapshot.

Studio receives a full but bounded opening package:

- canonical product snapshot
- important history
- open tasks
- relevant recent conversation
- build state
- test state
- release state
- relevant files/assets
- important restore points

Studio must not download everything by default.

Core law:

```txt
Studio receives enough to work correctly, not the entire history of the world.
```

## 23. Studio Side Agent

The Studio side panel is not exactly the Web conversation agent.

It is a dedicated local-role Nexus agent.

Internal name:

```txt
Studio Local Agent
```

User-facing name may remain:

```txt
נקסוס
```

The Studio Local Agent explains:

- what is happening on the user's computer
- what is running
- what failed
- what requires permission
- what is local
- what will return to cloud
- what is dangerous

The agent keeps the same Nexus personality and truth, but it has a local execution role.

## 24. Local Run Decision Boundary

When the user clicks `הרץ מקומית`, the decision passes through both:

- Studio Local Agent
- permission engine

The agent understands and explains:

- what should run
- why it should run
- risk level
- required next action

The permission engine decides whether execution is allowed:

- folder permission
- run permission
- secret/environment requirement
- safety status
- whether additional approval is needed

Core law:

```txt
The agent does not bypass permissions. Permissions do not replace understanding.
```

## 25. Local Run Failure Experience

When local execution fails, the first thing the user sees is a short human explanation.

Order:

1. what happened
2. what it means
3. what can happen now
4. technical details only if opened

Then Studio may show:

- shortened technical log
- proposed fix
- action request

Example:

```txt
ההרצה נכשלה כי חסרה תלות לפרויקט. אפשר לתת לי להתקין אותה בפרויקט הזה, או לפתוח את הפירוט.
```

Studio must not open directly into raw logs.

## 26. Local File Change Permission

Studio may propose file changes.

Studio must not write real local files as if permission is implied.

Boundaries:

- small local draft change may be prepared as a proposal
- writing to a real file requires approval
- change affecting product truth requires approval and correct sync

Core law:

```txt
Studio can propose file changes. It does not write to the user's computer as a default assumption.
```

## 27. Preview Before Sync

The `ראה מה ישתנה לפני סנכרון` screen must show product meaning, not only file diffs.

Required contents:

- what changed locally
- affected files
- affected screens/flows
- what will enter cloud
- what remains local
- what requires approval
- possible cloud conflict
- passed tests
- failed tests
- actions: sync, keep local, cancel, open details

Core law:

```txt
Before sync, the user sees product meaning, not only a list of files.
```

## 28. Sync Returns Change And Evidence

Sync does not return only code.

Sync returns:

- what was built
- what changed
- tests that ran
- screenshots when available
- shortened logs
- runtime status
- package status
- failures
- restore point
- recommended next action

Core law:

```txt
Sync returns both change and proof.
```

## 29. Evidence-Only vs Truth-Change Candidate

Evidence-only state explains what happened but does not change product truth.

Evidence-only examples:

- run log
- screenshot
- test result
- build error
- performance metric
- agent note

Truth-change candidate state can change the product itself.

Truth-change candidate examples:

- screen change
- flow change
- file change affecting artifact behavior
- configuration change
- package/dependency change
- behavior change
- meaningful visual design change

Core distinction:

```txt
Evidence says what happened. A truth-change candidate says what may change.
```

## 30. Mutation And Sync Ownership

Local changes enter product truth through a combination of:

- `Mutation Agent`
- sync engine

The `Mutation Agent` understands meaning:

- whether change is product-level
- whether change is risky
- whether approval is required
- what is affected

The sync engine executes and protects truth:

- saves
- compares
- detects conflicts
- returns to cloud
- prevents broken truth state

Core law:

```txt
The agent decides meaning. Sync preserves and connects truth.
```

## 31. Offline Boundary

Studio may work offline, but offline is not full sovereignty.

Allowed offline:

- open recent projects
- see last known state
- work on local drafts
- run locally if permissions exist
- save local changes
- create local evidence

Forbidden offline:

- publish
- release
- change canonical cloud truth
- connect new providers
- promise sync
- resolve conflicts against unavailable cloud truth
- perform actions requiring cloud permissions

Core law:

```txt
Offline means safe local work, not final new truth.
```

## 32. Cloud Changed While Studio Was Local

If cloud truth changes while Studio works locally, Studio must stop before automatic sync.

Studio must show:

```txt
הפרויקט השתנה בענן בזמן שעבדת מקומית.
```

It must then show:

- what changed in cloud
- what changed locally
- conflict locations
- what can merge
- what requires choice
- what is safe to keep

Forbidden:

- silently overwrite cloud
- silently overwrite local work

Allowed outcomes:

- merge
- keep local as draft
- accept cloud
- create separate branch/version
- ask the user to choose

Core law:

```txt
Studio is powerful locally but humble toward canonical cloud truth.
```

## Implementation Tasks Derived From Batch 2

These answers require or update the following tasks:

- `STD-FND-002` — define Product Graph package, opening snapshot, and truth-state ownership
- `STD-AGENT-001` — define Studio Local Agent role and relation to Web agents
- `STD-RUN-001` — define local run approval and failure explanation contract
- `STD-PERM-001` — define run, file-write, secrets, folder, and environment permission boundaries
- `STD-SYNC-001` — define pre-sync product-meaning review and local/cloud state labels
- `STD-SYNC-002` — define conflict handling when cloud changed while Studio worked locally
- `STD-HIST-001` — define important history, restore points, and local recovery evidence
- `STD-OFFLINE-001` — define bounded offline work and forbidden offline actions
- `STD-EVIDENCE-001` — define evidence-only vs truth-change candidate envelope
- `STD-MUTATION-BRIDGE-001` — define how Mutation Agent and sync engine jointly accept local changes into product truth

---

# Batch 3 — Local Run, Debug, Package, Folder Grants, Secrets

Status: `canonical answers captured, not complete`

## 33. Local Run Command Selection

When the user clicks `הרץ מקומית`, Studio first looks for an existing run command in the active project.

If an existing command is clear, Studio may use it after the appropriate approval state.

If no clear command exists, Studio may propose a new run command, but must not run it automatically without approval.

Core law:

```txt
Existing and clear may run with proper approval. New or uncertain must be proposed, explained, and approved.
```

## 34. Dependency Installation

Studio must not install missing packages by default.

Studio may detect a missing package and propose installation.

Installation requires clear approval, especially when it changes files, adds dependencies, or may affect project behavior.

Core law:

```txt
Studio may propose installation. It must not install silently.
```

## 35. Safe Error Display

From a run failure, Studio may show:

- simple explanation of what failed
- failed stage
- missing package name when not sensitive
- general command name
- filtered error line
- proposed fix

Studio must not show:

- secrets
- keys
- full user paths when they expose personal information
- environment variables
- tokens
- sensitive internal addresses
- private file contents

Core law:

```txt
The user should understand the problem without exposing their computer.
```

## 36. Debug Area Placement

In V1, debugging is not a fully separate default screen.

Debugging is an area inside the project workspace.

The user stays in the same workspace and sees:

- what failed
- what it means
- what can be fixed
- technical details only when opened

Deep debugging screen is post-V1 unless separately promoted.

## 37. Error Fix Classification

Error fix classification is shared between:

- Studio Local Agent
- `Mutation Agent`
- permission engine

Studio Local Agent explains and analyzes the error.

`Mutation Agent` decides whether the fix affects product truth.

Permission engine decides whether file writes are allowed.

Examples:

- missing import fix is usually a small change
- replacing a central library is a significant change
- changing how the product behaves is a product change

## 38. Packaging Meaning In V1

In V1, packaging is not final release.

Packaging may create:

- local test artifact
- preview package
- file/build that can be tested
- release candidate

Packaging must not imply public readiness.

Core law:

```txt
Packaging in Studio creates a candidate. Release decides whether it goes out.
```

## 39. Packaging Approval Boundary

Studio must not create a package artifact that includes unapproved changes.

Before packaging, Studio must show:

- what enters the package
- what changed
- affected files
- sync state
- unapproved local changes
- failed tests

If unapproved changes exist, packaging stops.

## 40. Folder Grant Flow

Folder access is granted through an explicit action:

```txt
בחר תיקייה לפרויקט הזה
```

After selection, Studio shows:

- selected folder
- linked project
- allowed actions
- read-only or read/write scope

Revocation is available in Studio settings:

```txt
בטל גישה לתיקייה
```

After revocation:

- no reading
- no writing
- no running from that folder

## 41. Missing / Moved / Mismatched Folder

If the local folder was moved, deleted, or no longer matches cloud project truth, Studio stops and does not guess.

Studio shows:

```txt
התיקייה המקומית כבר לא זמינה או לא תואמת לפרויקט.
```

Allowed actions:

- choose new folder
- reconnect
- open read-only mode
- return to Web

Forbidden:

- creating a new folder and treating it as the same project without approval

## 42. Local Secrets Boundary

Local secrets may be used for local run only.

They must not enter:

- evidence
- logs
- screenshots
- sync
- cloud history

If Studio needs to communicate secret status, it may only show:

```txt
משתנה סודי נמצא
```

or:

```txt
משתנה סודי חסר
```

Core law:

```txt
Secrets help run locally. They do not become part of the visible story, logs, or history.
```

## Implementation Tasks Derived From Batch 3

These answers require or update the following tasks:

- `STD-RUN-001` — define existing-command-first run flow, new-command proposal, and failure explanation order
- `STD-PERM-001` — define install approval, file-write approval, and run permission boundaries
- `STD-PERM-002` — define folder grant, revoke, moved-folder, missing-folder, mismatch, and read-only fallback states
- `STD-PERM-003` — define local-secret run-only boundary and redaction rules
- `STD-DEBUG-001` — define V1 debug area inside project workspace and post-V1 deep debug screen
- `STD-PKG-001` — define packaging as local candidate artifact, not release truth
- `STD-PKG-002` — define package approval gate and blocked packaging when unapproved changes or failed tests exist
- `STD-MUTATION-BRIDGE-001` — define error-fix classification through Studio Local Agent, Mutation Agent, and permission engine

---

# Batch 4 — Visual Structure, Screen Regions, Button States, Figma Contract

Status: `canonical answers captured, not complete`

## 43. Main Studio Layout

Studio V1 has three persistent regions:

- product center
- Nexus side panel
- bottom status bar

The product center is the heart of Studio.

The Nexus side panel explains, guides, and asks for approval.

The bottom status bar shows what is local, what is synced, what is running, and what requires attention.

Core law:

```txt
Studio V1 is product-center + Nexus side panel + bottom truth/status bar.
```

## 44. Return To Web Placement

The `חזור ל־Web` action must always sit in the top corner of the Studio shell.

It must not be:

- inside a changing workspace area
- hidden in a menu
- dependent on an internal screen

It should feel like a safe return to Nexus cloud.

## 45. Action Placement

Studio actions appear in two places according to context:

- one primary action in the `הפעולה הבאה` card
- persistent actions in a top action row or stable action area

Default behavior:

```txt
נקסוס אומרת: הפעולה הבאה הנכונה היא להריץ מקומית.
```

The user still has fast access to:

- סנכרן
- בדוק
- עצור
- חזור
- other state-valid actions

## 46. Healthy Center State

When everything is healthy and no error is open, the center shows the local product picture.

Required contents:

- project identity
- what is open now
- what the product does
- run state
- local changes
- what can be done now

Forbidden default center state:

- files
- logs
- terminal
- raw technical dashboard

## 47. Error Center State

When an error is open, the center first shows a clear explanation:

- what failed
- why it matters
- what can happen now

Below that, Studio may show a short technical summary.

The full technical log is secondary and opened intentionally.

Core law:

```txt
Error state starts with meaning, not raw logs.
```

## 48. Locked Action State

A locked action without permission must look calm and clear.

Required visual language:

- disabled/gray button
- small lock icon
- short reason
- unlock action

Example:

```txt
נדרשת הרשאת תיקייה
```

Unlock action:

```txt
תן גישה
```

Studio must not hide the action entirely, because the user needs to understand the capability exists.

Studio must not make locked actions look available.

## 49. Relevant Files Visual Model

Relevant files are shown as product-meaning cards by default, not as a full file tree.

Examples:

- קבצים שמשפיעים על מסך הבית
- קבצים ששונו מקומית
- קבצים שדרושים להרצה
- קבצים עם שגיאה

An advanced compact list may exist, but the default is meaning-first, not filesystem-first.

## 50. Nexus Side Panel Persistence

The Nexus side panel is open by default in V1.

It may be collapsible, but it must not disappear entirely.

Reason:

```txt
Studio without Nexus beside the work will collapse too quickly into a technical tool.
```

The side panel preserves the feeling:

```txt
אני עדיין עובד עם נקסוס.
```

## 51. Outside Application Identity

Application name:

```txt
Nexus Studio
```

Outside feel:

- clean Mac application
- powerful
- quiet
- connected to Nexus
- deeper local workspace

Icon direction:

- related to main Nexus identity
- deeper/local layer feeling
- workspace/window depth

Opening screen:

- quiet
- clean
- not overloaded

Opening screen shows:

- recent projects
- Web connection state
- project handed from Web when present
- missing permissions when present
- clear open/connect project action

## 52. Figma Visual Contract

The Studio visual vision must be created in Figma by default before implementation.

Figma does not own product truth.

Figma locks:

- how Studio looks
- where each region sits
- locked action states
- failure state
- sync state
- `ראה מה ישתנה` state
- how Studio feels like Nexus and not a code editor

Required order:

```txt
Figma direction -> screen contract -> implementation
```

Core risk if skipped:

```txt
Without visual direction, Studio can be built too fast and drift toward VS Code.
```

## Implementation Tasks Derived From Batch 4

These answers require or update the following tasks:

- `STD-VISION-001` — create Figma visual direction before implementation
- `STD-SCREENS-001` — map three-region shell, center states, side panel, bottom status bar, and top return action
- `STD-SHELL-001` — define app name, icon direction, outside Mac application feel, and opening screen
- `STD-WORKSPACE-001` — define healthy product-center state and error-center state
- `STD-ACTIONS-001` — define primary next-action card, persistent action row, and locked action visual language
- `STD-FILES-001` — define relevant-files cards and post-V1 compact/file-tree alternatives
- `STD-DESIGN-001` — require Figma direction and block code-editor visual drift
- `STD-ERROR-STATE-001` — define error center state, short explanation, technical summary, and full-log disclosure

---

# Batch 5 — Official V1 Screens, Screen Order, Permission Cards, Recovery, Package Candidate

Status: `canonical answers captured, V1 screen list locked`

## 53. Standalone Opening First Card

The first card in the standalone Studio opening screen depends on the entry source.

If the user arrived from Web:

```txt
the first card is the project handed from Web
```

If the user opened Studio directly:

```txt
the first card is the last worked-on project
```

Connection state is always visible, but it is not the first card. It appears as a clear top status chip/bar.

Core law:

```txt
The user sees what they are working on first, then connection state.
```

## 54. Web Project Opening Confirmation

If a project arrives from Web, Studio must not jump in without any visible transition.

Studio shows a short confirmation screen:

```txt
פותחים את הפרויקט הזה ב־Nexus Studio
```

Required contents:

- project name
- connection state
- what Studio is about to receive
- required folder/permission when needed
- primary button `פתח פרויקט`

If no special permissions are needed, this transition can be nearly immediate, but it still shows the user that they are moving into local work.

## 55. Next Action Card Contents

The `הפעולה הבאה` card shows:

- one primary action
- short reason why this action is right now
- 1–2 small secondary actions only when truly relevant

Example:

- primary action: `הרץ מקומית`
- reason: `כדי לבדוק שהפרויקט עובד על המחשב שלך לפני סנכרון.`
- secondary actions: `ראה שינויים`, `חזור ל־Web`

The card must not become a full menu.

## 56. Pre-Sync Review Order

The `ראה מה ישתנה לפני סנכרון` screen uses this order:

1. product meaning
2. files
3. tests and evidence

The user first sees:

```txt
מה זה משנה במוצר?
```

Only then:

```txt
אילו קבצים השתנו?
```

Core law:

```txt
Sync does not start from files. It starts from meaning.
```

## 57. Cloud Conflict Default Experience

When Studio detects a cloud/local conflict, the center shows guided Nexus conversation with options, not only a cloud-vs-local table.

Default message:

```txt
יש שינוי בענן ושינוי מקומי באותו אזור. צריך לבחור איך להתקדם.
```

Default options:

- keep local
- accept cloud
- merge
- keep as separate draft

Detailed comparison can be opened as a second step.

## 58. Permissions Screen Cards

The permissions screen shows each permission as a separate card:

- folder
- read
- write
- run
- secrets
- install
- sync

Each card shows:

- why it is needed
- what it enables
- risk
- active/inactive state
- how to revoke

Permissions must not be shown as one long legal paragraph.

## 59. Read-Only Mode

Read-only mode looks like the normal project workspace with locked actions.

It is not a completely separate limited screen.

Reason:

```txt
The user should understand they are still inside the project, only without permission to perform some actions.
```

Visible:

- product
- sync state
- relevant files
- Nexus side agent

Locked actions:

- run
- write files
- sync
- package

Each locked action includes a short explanation.

## 60. Local Recovery Primary Action

In local recovery state, the primary action is:

```txt
ראה מה נשמר
```

The order is:

1. understand what exists
2. choose whether to continue, sync, or cancel

Secondary actions after review:

- המשך מאיפה שהפסקתי
- סנכרן עכשיו
- בטל שינויים מקומיים

## 61. Package Candidate Screen

Studio packaging screen shows the output as:

```txt
release candidate card with evidence
```

Studio does not own the full Web Release screen.

The package candidate card includes:

- what was packaged
- version
- tests passed
- affected files
- what remains local
- what is ready to move to Web/Release

Core law:

```txt
Studio packages. Release approves release.
```

## 62. Official Studio V1 Screen List

The official Nexus Studio V1 screen list is now locked for visual planning.

V1 screens:

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

This list is not final for all future Studio versions, but it is the canonical V1 list before Figma and implementation.

## Implementation Tasks Derived From Batch 5

These answers require or update the following tasks:

- `STD-SCREENS-001` — lock official Studio V1 screen list and screen purposes
- `STD-SHELL-001` — define opening screen source-priority and top connection state
- `STD-ENTRY-001` — define Web project opening confirmation screen and `פתח פרויקט`
- `STD-ACTIONS-001` — define `הפעולה הבאה` contents and secondary-action limit
- `STD-SYNC-001` — define pre-sync order: product meaning, files, tests/evidence
- `STD-SYNC-002` — define guided cloud conflict experience and detailed compare as second step
- `STD-PERM-001` — define permission cards by permission type
- `STD-FILES-001` — define read-only mode as normal workspace with locked actions
- `STD-RECOVERY-001` — define `ראה מה נשמר` as primary local recovery action
- `STD-PKG-001` — define package screen as release candidate card with evidence
- `STD-SETTINGS-001` — define basic Studio settings screen

---

# Batch 6 — Figma Artifact Contract, Design Depth Layer, Failure States, Control Wow

Status: `canonical answers captured, Figma contract locked for STD-VISION-001`

## 63. Figma Frame Count

Figma must include one frame for each of the 11 Studio V1 screens.

V1 frames:

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

Not every frame must have the same depth.

Required deep frames:

- healthy main project workspace
- error/debug
- preview before sync
- cloud conflict
- permissions
- package / release candidate

Core law:

```txt
Figma must contain 11 V1 frames, with 5-6 deep frames that are visually locked.
```

## 64. Outside Application Frame

Figma must also include an outside-application frame.

Required contents:

- Nexus Studio icon
- application name
- clean opening screen
- basic Mac window
- Web-handed project opening state
- standalone opening state

Reason:

```txt
Studio is a real local application, not another Web screen.
```

## 65. Studio Visual Language

Studio continues the Nexus Web language but becomes deeper, quieter, and more professional.

Studio is not:

- another product
- VS Code
- terminal
- developer dashboard

Product feel:

- same Nexus
- deeper work mode
- more stable
- calmer
- more powerful
- more precise

Relationship:

```txt
Web = light, fast, alive.
Studio = deep, stable, local, precise.
```

## 66. Nexus Side Panel Visual Direction

The Studio Nexus panel does not look exactly like the Web chat.

It is a new local panel with the same Nexus personality.

In Web, Nexus primarily talks and builds.

In Studio, Nexus also accompanies local actions:

- what is running
- what failed
- what requires approval
- what will sync
- what is local
- what is safe
- what is dangerous

The panel remains conversational, but includes more state, evidence, approvals, and actions.

## 67. Bottom Status Bar Behavior

The bottom status bar is thin and quiet most of the time.

Normal states:

- synced
- local
- running
- waiting

High-attention states:

- cloud conflict
- open error
- unsynced changes
- missing permission
- pre-sync risk
- package failed

Core law:

```txt
Quiet when possible. Prominent when user trust may be harmed.
```

## 68. Required Figma States

Figma must include normal states and failure/boundary states.

Required state types:

- empty
- loading
- error
- locked
- conflict
- no permission
- unsynced
- read-only

Reason:

Studio has many honest failure points:

- folder
- permissions
- run
- sync
- package
- cloud

If these states are not designed before implementation, the product will drift into ugly technical screens.

## 69. Nexus Design System + Studio Depth Layer

Studio must use Nexus Web as the base design system.

Studio does not create a fully new design system.

Studio adds:

- slightly deeper background
- more professional contrast
- clear state colors
- icons for local actions
- permission language
- sync language
- error language
- run language
- package language

Core law:

```txt
Studio uses Nexus Design System + Studio Depth Layer.
```

## 70. Correct Studio Wow

The correct Studio wow is not loud colors or excessive animation.

The wow is control over local chaos.

The user should immediately understand:

- which project is open
- what is local
- what is in cloud
- what is running
- what failed
- what can be done now
- what requires approval

Required feel:

- calm
- premium
- sharp
- organized
- powerful
- serious work room

Core law:

```txt
Studio creates wow through control, not noise.
```

## Implementation Tasks Derived From Batch 6

These answers require or update the following tasks:

- `STD-VISION-001` — require 11 Figma V1 frames, outside-application frame, and 5-6 deep locked frames
- `STD-DESIGN-001` — define Nexus Design System + Studio Depth Layer
- `STD-SHELL-001` — define outside application frame, icon, Mac window, Web-handed and standalone opening states
- `STD-AGENT-001` — define Studio Nexus side panel visual contract as local action panel, not Web chat clone
- `STD-LOCAL-STATE-001` — define bottom status bar normal and high-attention states
- `STD-ERROR-STATE-001` — define required error/failure visual states
- `STD-SCREENS-001` — require empty, loading, error, locked, conflict, no-permission, unsynced, and read-only states

---

# Batch 7 — V1 Platform, Desktop Shell, Runtime Strategy, Local Storage Boundary

Status: `canonical answers captured, STD-QUEST-001 definition complete enough to move to STD-VISION-001`

## 71. V1 Platform Scope

Studio V1 is Mac-only.

Windows is future/post-release and does not block the first release.

Reason:

- first implementation is simpler on one platform
- Studio touches sensitive local capabilities
- files, permissions, runtime, secrets, sync, and packaging should be proven on one platform first

Core law:

```txt
V1 = Mac. Windows = post-release.
```

## 72. V1 Desktop Technology Default

Electron is the default Studio V1 shell technology.

Reason:

- Nexus already uses Web UI patterns
- Studio needs product screens, not a native-only application first
- Electron keeps the first desktop shell close to the existing Nexus interface system

Electron is not a permanent sacred decision.

Future options:

- Tauri may be evaluated post-release for lighter packaging
- native Mac may be evaluated later if there is a strong reason

Core law:

```txt
V1 = Electron unless proven otherwise.
```

Studio must not start a technology debate before a working Studio exists.

## 73. Runtime Strategy

Studio V1 runs existing project commands first.

Studio does not introduce a full internal Nexus Runtime as the V1 base.

If no clear command exists, Studio may propose a new run command, explain it, and request approval.

Core law:

```txt
First respect the project. Then Nexus helps. Studio does not replace the project environment with a hidden Nexus runtime.
```

Future:

- deeper Nexus Runtime may be considered post-release

## 74. Local Storage Boundary

Studio uses two storage areas with a clear boundary.

Internal application storage stores:

- local drafts
- local work state
- local history
- cache
- evidence
- sync state

Project folder stores only what the user approved to write into the project itself.

Core law:

```txt
Studio can save local work without touching the project. Writing to the project folder requires clear approval.
```

## 75. Move To Vision

The Studio product-definition answers are now sufficient to move to `STD-VISION-001`.

Locked before vision:

- Mac-only V1
- Electron default for V1
- project-command-first runtime
- internal local storage plus approved project-folder writes
- V1 screen list
- Figma artifact contract
- Studio visual language
- sync/offline/permission/recovery/agent boundaries

Next step:

```txt
Create the canonical Figma visual vision for Nexus Studio.
```

Not next step:

- implementation
- code
- full desktop app build

## Implementation Tasks Derived From Batch 7

These answers require or update the following tasks:

- `STD-PLATFORM-001` — define Mac-only V1 and post-release Windows lane
- `STD-SHELL-002` — define Electron as V1 default shell technology and Tauri/native Mac as post-release evaluations
- `STD-RUN-001` — define project-command-first runtime and post-release Nexus Runtime option
- `STD-STORAGE-001` — define internal app storage vs approved project-folder write boundary
- `STD-POST-001` — park Windows, Tauri evaluation, native Mac evaluation, and deeper Nexus Runtime as post-release unless later promoted
- `STD-VISION-001` — next canonical task after Studio deep-question closure
