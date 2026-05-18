# Nexus Loop Screen System Spec

## Status

Planning/spec only. No application code was changed as part of this merge.

## Source Of Truth Merge

This spec merges two authoritative inputs:

1. `/Users/yogevlavian/Desktop/The Nexus/docs/nexus-loop-productization-canonical-block.json`
2. the provided Nexus loop UI reference images

Notes:
- the user prompt referenced `/Users/yogevlavian/Desktop/The Nexus/nexus-loop-ui/`
- the attached image files provided in-thread resolve under `/Users/yogevlavian/Downloads/nexus-loop-ui/`
- this spec uses the attached image set as the visual reference source of truth

## Blunt Product Reality

The current repository already contains substantial backend capability for:
- project creation
- onboarding sessions
- project listing and restore
- next-task selection
- live execution state
- proof/review/apply flows
- state update after edits and partial acceptance
- timeline/audit/event history
- settings/profile state
- notifications state
- provider / integration connection state

The current frontend does **not** express that capability as one clear loop. It is still primarily a fragmented workspace/cockpit.

So the job is not "invent the product". The job is:
- expose the existing backend through a full screen system
- remove dashboard-first fragmentation from the primary experience
- keep advanced workspaces as secondary surfaces only

---

## 1. Screen To Task Mapping

| Reference screen | Classification | Refined NLP task | Current repo reality |
| --- | --- | --- | --- |
| Project Create | primary loop | `NLP-002` | visible and partially real |
| Smart Onboarding | primary loop | `NLP-003` | visible and partial |
| Understanding Summary | primary loop | `NLP-004` | backend partial, screen missing |
| Nexus Loop (Core) | primary loop | `NLP-005` | visible and partial |
| Execution (Live) | primary loop | `NLP-006` | backend real, dedicated screen missing |
| Result / Proof | primary loop | `NLP-007` | partial and fragmented in Release |
| Confirmation | primary loop | `NLP-008` | partial, no dedicated screen |
| State Update | primary loop | `NLP-009` | backend real, dedicated screen missing |
| Next Task | primary loop | `NLP-010` | backend real, dedicated screen missing |
| Timeline / History | primary loop support | `NLP-011` | backend partial to real, dedicated screen missing |
| Home / Project Switcher | secondary required | `NLP-012` | backend partial, screen missing |
| Settings | secondary required | `NLP-013` | backend only |
| Notifications | secondary required | `NLP-013` | backend only |
| Developer Workspace | advanced optional | `NLP-014` | visible and real |
| Project Brain | advanced optional | `NLP-014` | visible and partial |
| Release | advanced optional | `NLP-014` | visible and partial to real |
| Growth | advanced optional | `NLP-014` | visible and partial |
| Integrations & Advanced Hub | secondary required | `NLP-014` | backend partial, screen missing |

---

## 2. Screen Analysis And Gap Audit

### Project Create

Classification:
- primary loop

Reference intent:
- one clean entry screen
- form first
- optional files and link intake
- clear single CTA

What exists today:
- project name
- project vision
- optional supporting link
- optional manual supporting file content fields
- create CTA

What is backed by real backend:
- `POST /api/auth/signup`
- `POST /api/project-drafts`
- `POST /api/onboarding/sessions`

What is only partial:
- upload UX is not the reference drag-and-drop product flow
- current "file upload" is partly represented through manual fields plus onboarding file attach endpoint

What is missing:
- proper full-screen create route matching the reference
- project switcher/home handoff from this screen
- visual stepper contract from reference

Reality classification:
- usable: create draft and begin onboarding
- partial: file upload and polished product create flow
- missing: final screen system version

### Smart Onboarding

Classification:
- primary loop

Reference intent:
- AI-driven conversation
- conversational memory
- "what I learned" and "what is still missing"
- one clear continue CTA

What exists today:
- onboarding screen
- chat-like UI
- 3-question flow
- working session lifecycle
- answer composer and continue button

What is backed by real backend:
- `POST /api/onboarding/sessions`
- `GET /api/onboarding/sessions/:id`
- `GET /api/onboarding/sessions/:id/step`
- `PATCH /api/onboarding/sessions/:id/intake`
- `POST /api/onboarding/sessions/:id/files`
- `POST /api/onboarding/sessions/:id/finish`

What is only visual or partial:
- current conversation is still mostly scripted, not a proven adaptive intelligent agent loop
- "AI conversation" feel is stronger than the actual intelligence proof

What is missing:
- true adaptive conversational branching
- screen structure aligned to the reference
- explicit learned/missing cards in the reference layout

Reality classification:
- usable: onboarding session, step progression, finish
- partial: AI-driven conversation quality
- missing: product-grade screen and deeper intelligence proof

### Understanding Summary

Classification:
- primary loop

Reference intent:
- summarize what Nexus believes about user, problem, solution, and goal
- let user confirm or correct that understanding

What exists today:
- distributed understanding signals in Project Brain and overview data
- project goal
- blockers / current phase / recommendations

What is backed by real backend:
- project context assembly in `context-builder`
- imported/intake normalization
- next-task reasoning inputs

What is only backend:
- there is no clean standalone Understanding Summary screen today

What is missing:
- dedicated screen
- explicit user confirmation / correction action at this stage
- one-screen summary using the reference four-card layout

Reality classification:
- usable: underlying context exists
- partial: visible fragments exist
- missing: dedicated screen

### Nexus Loop (Core)

Classification:
- primary loop

Reference intent:
- show the one current task
- explain why it matters
- show expected outcome
- show stage rail
- provide one obvious execute CTA

What exists today:
- a loop panel exists
- next task signal exists
- rationale text exists
- proof lane navigation exists

What is backed by real backend:
- next-task selection resolver
- next-task presentation model
- roadmap state
- release proof chain

What is only partial:
- current loop screen is still layered on top of workspace assumptions
- execute action is still not a true loop-first action surface
- stage rail is productized visually, but not yet a full-screen route-native experience

What is missing:
- final loop-first full-screen route
- execute action that is clearly the primary action of the whole product
- complete removal of dashboard feeling

Reality classification:
- usable: task signal, reasoning, route navigation
- partial: actual screen and CTA behavior
- missing: final primary experience

### Execution (Live)

Classification:
- primary loop

Reference intent:
- show one running task
- show progress percent
- show live steps and status
- let user see the system working

What exists today:
- developer workspace
- live update channel
- live state
- log stream
- execution progress state

What is backed by real backend:
- `POST /api/projects/:projectId/run-cycle`
- `GET /api/projects/:projectId/live-state`
- SSE live-state stream
- task step flow and execution progress models

What is only partial:
- current execution is visible in a technical workspace, not a dedicated product screen
- current execute button in the loop is still mostly navigation, not a clean task-specific execution launch

What is missing:
- dedicated Execution (Live) full-screen surface
- exact mapping from "execute this task" to "watch this task run"

Reality classification:
- usable: backend execution state and live progress
- partial: product-facing screen
- missing: clean user-facing execution route

### Result / Proof

Classification:
- primary loop

Reference intent:
- show before/after or result/proof side-by-side
- show what changed
- allow approve / reject / edit

What exists today:
- Release workspace
- Proposal Review
- generated preview
- design proposal validation
- proposal edits
- partial acceptance

What is backed by real backend:
- `POST /api/projects/:projectId/proposal-edits`
- `POST /api/projects/:projectId/partial-acceptance`
- proof, validation, provenance, proposal integration state

What is only partial:
- current result/proof flow is fragmented across release panels
- there is no dedicated clean before/after proof screen
- a simple "approve / reject / edit" experience is not yet expressed as one result screen

What is missing:
- full-screen proof surface
- explicit binary outcome path tied to the loop

Reality classification:
- usable: core proof/review/apply backend
- partial: UI shape and clarity
- missing: dedicated screen

### Confirmation

Classification:
- primary loop

Reference intent:
- ask user if the result is correct
- allow positive confirmation or request fix

What exists today:
- proposal edit
- partial acceptance
- apply decision state

What is backed by real backend:
- proposal edit endpoint
- partial acceptance endpoint
- state integration chain

What is only partial:
- current confirmation is scattered among release review controls
- no dedicated "good / needs fix" confirmation screen exists

What is missing:
- single binary confirmation screen
- simple confirmation language tied to loop progression

Reality classification:
- usable: backend can absorb user decision
- partial: current UI controls
- missing: dedicated confirmation surface

### State Update

Classification:
- primary loop

Reference intent:
- show what was updated
- show project status changed
- provide continue CTA to next task

What exists today:
- state updates happen after onboarding finish, run-cycle, proposal edits, partial acceptance
- progress state and first-value summary exist

What is backed by real backend:
- project context rebuild after state mutations
- continuity / restore / progress state models

What is only backend:
- no clean dedicated State Update screen exists today

What is missing:
- explicit state update UI
- visible "what changed" summary card
- continue CTA tied to next task

Reality classification:
- usable: backend state transition is real
- partial: some visible banners and summaries
- missing: dedicated screen

### Next Task

Classification:
- primary loop

Reference intent:
- promote the next task after the state update
- explain why it is next
- offer execute CTA again

What exists today:
- backend next-task selection and presentation
- current loop/task context surfaces

What is backed by real backend:
- next-task selection resolver
- cockpit recommendation surface
- roadmap state

What is only partial:
- there is no dedicated Next Task screen
- the loop does not visibly repeat as one full-screen step today

What is missing:
- explicit next-task promotion screen
- repeat-loop handoff

Reality classification:
- usable: backend next-task intelligence
- partial: visible fragments
- missing: dedicated screen

### Timeline / History

Classification:
- primary loop support

Reference intent:
- show what happened in order
- show progression and current point in the loop

What exists today:
- events
- live state
- project audit payload
- system activity / critical change history in context

What is backed by real backend:
- `GET /api/projects/:projectId/audit`
- live-state and events
- project state / audit / event models

What is only partial:
- the current UI does not expose a simple human-readable timeline screen

What is missing:
- dedicated timeline screen
- one list of completed loop steps with timestamps

Reality classification:
- usable: event and audit backend
- partial: current visible surfaces
- missing: dedicated screen

### Home / Project Switcher

Classification:
- secondary required

Reference intent:
- show recent projects
- enter an existing project
- create a new one

What exists today:
- project list endpoint
- project selector dropdown
- create new project action

What is backed by real backend:
- `GET /api/projects`
- project record persistence

What is only partial:
- current selector is a dropdown, not a full screen

What is missing:
- dedicated home / project switcher screen

Reality classification:
- usable: backend project list
- partial: UI
- missing: dedicated screen

### Settings

Classification:
- secondary required

Reference intent:
- profile settings
- notifications
- security
- preferences

What exists today:
- settings/profile backend surfaces
- workspace settings update service

What is backed by real backend:
- `settingsProfileSurface`
- `updateWorkspaceSettings(...)`
- settings models and tests

What is only backend:
- no dedicated frontend settings route currently exists in the app

What is missing:
- full Settings screen
- save flow wired into UI

Reality classification:
- usable: backend
- partial: shell route exists conceptually
- missing: frontend screen

### Notifications

Classification:
- secondary required

Reference intent:
- inbox of user-facing system events
- mark/read/continue actions

What exists today:
- notification center state
- notification preferences

What is backed by real backend:
- `notificationCenterState`
- `notificationPreferences`
- notification models and tests

What is only backend:
- no dedicated notification center UI screen exists

What is missing:
- notification list screen
- notification action flow

Reality classification:
- usable: backend
- missing: frontend

### Integrations & Advanced Hub

Classification:
- secondary required

Reference intent:
- show connected providers
- connect/disconnect accounts
- enter advanced workspaces from one place

What exists today:
- provider connector schema
- provider connector state
- external account link / unlink backend

What is backed by real backend:
- `POST /api/projects/:projectId/accounts/link`
- unlink account route in server/service
- provider connector models

What is only partial:
- no polished integrations hub UI exists
- advanced workspaces exist separately but not grouped in one secondary hub

What is missing:
- dedicated integrations screen
- advanced hub grouping

Reality classification:
- usable: backend linking state
- partial: advanced workspaces exist
- missing: integrations hub screen

### Advanced Screens

#### Developer Workspace
- visible and real
- should remain secondary
- not the primary loop surface

#### Project Brain
- visible and partial
- strong reasoning backend
- weak productized screen

#### Release
- visible and partial-to-real
- strong review/apply backend
- currently too fragmented for primary proof flow

#### Growth
- visible and partial
- should remain advanced/secondary

---

## 3. Fake Vs Real UI Elements

### Real today

- `צור פרויקט והתחל`
  - real
  - starts draft/project/onboarding flow

- onboarding continue / send / finish
  - real

- `רענן`
  - real
  - triggers `run-cycle`

- `נתח`
  - real
  - triggers `analyze`

- `סרוק`
  - real
  - triggers `scan`

- `שמור עריכה`
  - real
  - triggers proposal edit write-back

- `אשר חלקית`
  - real
  - triggers partial acceptance write-back

- project selection dropdown
  - real

### Visible but navigation only

- current loop primary/secondary route buttons
  - today they mostly navigate to existing workspace panels
  - they do not yet represent a fully loop-native action model

- workspace tabs
  - navigation only

### Fake or placeholder relative to the reference screens

- current "execute next task" notion in the loop
  - not yet a true execute-this-task product action

- current onboarding "AI conversation"
  - visually suggests intelligence beyond what is proven in runtime behavior

- current result/proof "single-screen approve/reject/edit" flow
  - not present as a clean product screen

- current confirmation screen
  - missing; any equivalent is still implicit/fragmented

- current state update screen
  - missing

- current next task screen
  - missing

- current notifications screen
  - missing

- current settings screen
  - missing

- current integrations hub
  - missing

---

## 4. Action Mapping

### Project Create

| Label | Should do | Actual today | Backend / logic | Classification |
| --- | --- | --- | --- | --- |
| `צור פרויקט והתחל` | create project and enter onboarding | creates draft/session flow | `POST /api/project-drafts`, `POST /api/onboarding/sessions` | real |
| file upload area | attach files to intake | partial/manual today | `POST /api/onboarding/sessions/:id/files` exists | partial |
| existing site link | connect a URL as intake input | accepted as intake text | onboarding intake patch + context build | partial |

### Smart Onboarding

| Label | Should do | Actual today | Backend / logic | Classification |
| --- | --- | --- | --- | --- |
| `שלח והמשך` / `המשך` | submit response and move forward | works through scripted flow | onboarding session APIs | real |
| finish onboarding | complete onboarding and open workspace | works | `POST /api/onboarding/sessions/:id/finish` | real |

### Understanding Summary

| Label | Should do | Actual today | Backend / logic | Classification |
| --- | --- | --- | --- | --- |
| `תקן` | let user revise understanding | no dedicated screen today | none exposed as one action | fake/missing |
| `נכון - המשך` | confirm summary and continue to loop | no dedicated screen today | backend could absorb via state update, but no dedicated route | fake/missing |

### Nexus Loop (Core)

| Label | Should do | Actual today | Backend / logic | Classification |
| --- | --- | --- | --- | --- |
| `בצע את המשימה` | launch current next task | today not a clean task execution start | currently loop route/navigation plus `run-cycle` elsewhere | partial |
| `ראה הוכחה` | open proof/result screen | today opens release/proof lane | route navigation only | navigation only |

### Execution (Live)

| Label | Should do | Actual today | Backend / logic | Classification |
| --- | --- | --- | --- | --- |
| primary execute entry | keep showing task as running | not a dedicated screen today | `POST /api/projects/:projectId/run-cycle` | partial |
| `עצור` | cancel current run | no proven stop/cancel backend in current UI | not exposed | fake/missing |

### Result / Proof

| Label | Should do | Actual today | Backend / logic | Classification |
| --- | --- | --- | --- | --- |
| `אשר` | accept result and continue | no exact dedicated button today | partial acceptance / apply chain exists | partial |
| `דחה` | reject and request fix | no clean explicit reject screen action | no single-screen reject flow | fake/missing |
| `ערוך` | modify proposal before approval | current edit flow exists | `POST /api/projects/:projectId/proposal-edits` | real |

### Confirmation

| Label | Should do | Actual today | Backend / logic | Classification |
| --- | --- | --- | --- | --- |
| `זה טוב - המשך` | confirm result and continue | no dedicated screen; equivalent backend path exists indirectly | proposal/apply integration | partial |
| `צריך תיקון` | send it back for changes | no dedicated binary confirmation UI | partial acceptance/edit flow indirectly | partial |

### State Update

| Label | Should do | Actual today | Backend / logic | Classification |
| --- | --- | --- | --- | --- |
| `המשך למשימה הבאה` | show state update and promote next task | no dedicated screen today | backend state refresh exists | missing |

### Next Task

| Label | Should do | Actual today | Backend / logic | Classification |
| --- | --- | --- | --- | --- |
| `בצע את המשימה` | start next task again | no dedicated screen today | next-task backend exists, start action not cleanly surfaced | partial |

### Timeline

| Label | Should do | Actual today | Backend / logic | Classification |
| --- | --- | --- | --- | --- |
| `חזור לשלב` | navigate to historical step | no dedicated timeline route yet | audit/history state exists | partial |

### Home / Project Switcher

| Label | Should do | Actual today | Backend / logic | Classification |
| --- | --- | --- | --- | --- |
| `צור פרויקט חדש` | begin new project | exists in workspace top shell | create screen entry | real |
| project card select | open a project | dropdown select exists, full-screen card list missing | `GET /api/projects` + `GET /api/projects/:id` | partial |

### Settings

| Label | Should do | Actual today | Backend / logic | Classification |
| --- | --- | --- | --- | --- |
| `שמור שינויים` | save profile/settings | no frontend screen today | `updateWorkspaceSettings(...)` backend | backend only |

### Notifications

| Label | Should do | Actual today | Backend / logic | Classification |
| --- | --- | --- | --- | --- |
| notification item actions | continue, dismiss, mark read | no dedicated UI today | notification center state exists | backend only |

### Integrations

| Label | Should do | Actual today | Backend / logic | Classification |
| --- | --- | --- | --- | --- |
| `צפה בכל האינטגרציות` / connect account | manage providers | no frontend screen today | account link/unlink + provider connector models | backend only |

---

## 5. Refined NLP Task List

The original block is directionally correct, but it is too abstract relative to the supplied screen system.

### Existing NLP tasks still correct as-is

- `NLP-015` remains directionally correct as the final acceptance and visual proof gate

### Existing NLP tasks that must be re-scoped

- `NLP-001` must become the full-screen shell, route registry, left rail, top bar, and stepper contract
- `NLP-002` through `NLP-014` must map directly to concrete screens instead of generic panels

### Existing NLP tasks that must be reordered

The original order should be refined to match the screen system:

1. `NLP-001` Create Nexus full-screen shell, route system, and navigation contract
2. `NLP-002` Create Project Create screen
3. `NLP-003` Create Smart Onboarding screen
4. `NLP-004` Create Understanding Summary screen
5. `NLP-005` Create Nexus Loop (Core) screen
6. `NLP-006` Create Execution (Live) screen
7. `NLP-007` Create Result / Proof screen
8. `NLP-008` Create Confirmation screen
9. `NLP-009` Create State Update screen
10. `NLP-010` Create Next Task screen
11. `NLP-011` Create Loop Timeline screen
12. `NLP-012` Create Home / Project Switcher screen
13. `NLP-013` Create Settings and Notifications screens
14. `NLP-014` Create Advanced Hub, Integrations Hub, and advanced workspace entry screens
15. `NLP-015` Create end-to-end loop acceptance and visual proof coverage

### New secondary screen requirements absorbed into the refined NLP list

- `Home / Project Switcher` is required and must be absorbed into `NLP-012`
- `Settings` and `Notifications` are required and must be absorbed into `NLP-013`
- `Integrations & Advanced Hub` is required and must be absorbed into `NLP-014`

---

## 6. Exact Execution Order

### Phase A — Shell And Primary Loop

1. `NLP-001` full-screen shell and route system
2. `NLP-002` project create
3. `NLP-003` smart onboarding
4. `NLP-004` understanding summary
5. `NLP-005` core loop screen

### Phase B — Execution And Proof

6. `NLP-006` execution live
7. `NLP-007` result / proof
8. `NLP-008` confirmation
9. `NLP-009` state update
10. `NLP-010` next task
11. `NLP-011` timeline

### Phase C — Secondary Required Surfaces

12. `NLP-012` home / project switcher
13. `NLP-013` settings + notifications
14. `NLP-014` advanced hub + integrations + advanced workspace entry screens

### Phase D — Acceptance Gate

15. `NLP-015` end-to-end loop acceptance and visual proof coverage

---

## 7. Visual Proof Requirements Per Task

### Must be visually proven with user confirmation

- `NLP-001`
- `NLP-002`
- `NLP-003`
- `NLP-004`
- `NLP-005`
- `NLP-006`
- `NLP-007`
- `NLP-008`
- `NLP-009`
- `NLP-010`
- `NLP-011`
- `NLP-012`
- `NLP-013`
- `NLP-014`
- `NLP-015`

### Screens that require explicit user confirmation before trueGreen

- Project Create
- Smart Onboarding
- Understanding Summary
- Nexus Loop (Core)
- Execution (Live)
- Result / Proof
- Confirmation
- State Update
- Next Task
- Timeline
- Home / Project Switcher
- Settings
- Notifications
- Integrations & Advanced Hub
- Advanced Hub entry surfaces

### Tasks with no standalone visible surface

None in the refined screen system.  
After the merge, every `NLP` task must produce a concrete visible route or screen-level user-facing result.

### Tasks that can be closed by backend proof only

None in the refined screen system.  
Backend-only progress is insufficient for this block because this block is explicitly a UI productization block.

---

## 8. Strict Done Criteria

The loop is done only if a user can do all of this in the live UI:

1. create a project
2. upload or provide intake input
3. complete onboarding conversation
4. see a clean understanding summary
5. confirm that summary
6. see one clear next task
7. understand why that task is next
8. click one explicit execute action
9. watch live execution in one place
10. see the resulting product or UI change
11. confirm or reject the result
12. see the state update
13. see the newly promoted next task
14. repeat the loop

If any of those steps is:
- not visible
- not actionable
- disconnected from the next step

then the loop is **not done**.

---

## 9. Final Product Readiness Verdict

Current product readiness verdict: **NOT READY**

Reason:
- the repository backend is ahead of the current frontend
- the reference screen system is clearer than the current product UI
- several critical screens are missing entirely
- several existing actions are real but exposed in fragmented workspaces
- several reference actions are still fake or only implied in the current product

Blunt truth:
- Nexus currently has enough backend to support a much better product loop
- Nexus does not currently present that loop as a coherent screen system
- the reference images should be treated as the target UI contract for the next implementation pass

---

## 10. Lowest Truthful Executable Task After The Merge

`NLP-001` — `Create Nexus full-screen shell, route system, and navigation contract`

Reason:
- every other screen depends on a stable primary shell
- the current cockpit/workspace shape is the main structural blocker
- the new shell must establish the route, stepper, left rail, top bar, and full-screen screen container contract for all remaining tasks
