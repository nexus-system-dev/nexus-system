# Wave 3 Live Class Sweep Track

## Purpose

This document defines the canonical contract for running a live class sweep on Nexus at:

- `http://127.0.0.1:4011/`

The live class sweep exists to prove that Nexus can run truthfully across its canonical product classes under real browser execution, not only on one audited happy path.

This is not Wave 4 planning.

This is not bug fixing by intuition.

This is the contract that turns future sweep execution into a deterministic closure system.

## Scope

The sweep validates two intake paths:

- `create`
- `upload-from-local-machine`

The sweep validates these live product stages:

- `Create`
- `Understanding`
- `Loop`
- `Proof`
- `Artifact`
- `Timeline`
- `Route`
- `Restore`
- `Continuity`

The sweep must run in a live browser against `4011`.

It must not rely on:

- code-only truth
- API-only truth
- preview-only truth
- QA-only paths
- internal state that is not visibly real on the live site

## Canonical Product-Class Matrix

The sweep uses exactly this canonical product-class matrix.

### 1. `landing-page`

- intake shape:
  - `create`: direct project creation with a marketing / brand / campaign goal
  - `upload-from-local-machine`: representative source bundle or content/design evidence that truthfully implies a landing or marketing output
- expected understanding truth:
  - clearly identifies audience, message, conversion goal, and content hierarchy
- expected loop shape:
  - next step should center on structure, conversion clarity, sections, and trust / CTA flow
- expected proof shape:
  - visible proof should feel like a landing page or marketing surface, not a generic workspace
- expected artifact shape:
  - artifact should preserve page identity, sections, CTA logic, and messaging
- expected timeline shape:
  - timeline should show landing-page-specific progression rather than generic execution history

### 2. `mobile-app`

- intake shape:
  - `create`: direct project creation with app workflow, user journey, or screen-driven goal
  - `upload-from-local-machine`: representative app source / docs / manifests / core flows that truthfully imply a mobile product
- expected understanding truth:
  - clearly identifies user flow, app function, main screens, and mobile-specific constraints
- expected loop shape:
  - next step should center on screen flow, action sequence, state transitions, or app usability
- expected proof shape:
  - visible proof should feel like an app surface or app flow, not a generic dashboard
- expected artifact shape:
  - artifact should preserve screen identity, flow intent, and app-specific progression
- expected timeline shape:
  - timeline should show app-specific forward movement, not flattened generic steps

### 3. `internal-tool`

- intake shape:
  - `create`: direct project creation for an operational workspace, team tool, service desk, workflow system, or internal product
  - `upload-from-local-machine`: representative workspace / process / code / docs bundle that truthfully implies an internal tool
- expected understanding truth:
  - clearly identifies operators, workflow bottlenecks, ownership, approvals, and internal operational outcomes
- expected loop shape:
  - next step should center on queue clarity, ownership, SLA, internal action, or workflow resolution
- expected proof shape:
  - visible proof should feel like a live internal workspace, not a marketing or commerce surface
- expected artifact shape:
  - artifact should preserve queue, owner, state, and next-action logic
- expected timeline shape:
  - timeline should show project-specific internal operations progression

### 4. `commerce-ops`

- intake shape:
  - `create`: direct project creation for ecommerce, catalog, orders, inventory, merchandising, or operational commerce work
  - `upload-from-local-machine`: representative ecommerce source / catalog / order / docs bundle that truthfully implies a commerce system
- expected understanding truth:
  - clearly identifies catalog, orders, inventory, merchandising, and commerce operations bottlenecks
- expected loop shape:
  - next step should center on orders, catalog, owners, exceptions, inventory, or operational commerce action
- expected proof shape:
  - visible proof should feel like a commerce operations surface, not a generic internal tool or generic workspace
- expected artifact shape:
  - artifact should preserve commerce identity, operational priorities, and actionable next step
- expected timeline shape:
  - timeline should show commerce-specific progression and preserved operational context

## Intake Paths To Be Tested

The sweep must test both:

1. `create`
2. `upload-from-local-machine`

`upload-from-local-machine` means:

- real file selection from this computer
- believable local project evidence
- no toy placeholder file accepted as sufficient proof by itself

## Active Follow-Up Task

After the first live class sweep on `2026-05-18`, the active bounded canonical follow-up task is:

- `W3-LCS-001 — Create-start reliability on failing create/upload handoff paths`

Task scope:

- only the create/upload submission handoff that failed to enter onboarding on the live site
- only the paths recorded in the canonical failure ledger from the first sweep
- no broader class-truth redesign
- no Wave 4 planning

This task remains active until:

- the failing create/upload handoff paths enter onboarding truthfully on `127.0.0.1:4011`
- the same canonical sweep order is rerun live
- the previously recorded failures are either closed or truthfully remain open

Closure update on `2026-05-18`:

- `W3-LCS-001` is now `trueGreen`
- the create/upload submission handoff now enters onboarding truthfully on all previously failing paths
- the canonical rerun completed clean across all 8 class/path runs
- no create-start reliability failure remains open from the first sweep

## Execution Order

The sweep is deterministic.

It must run in this order:

1. `create` path first
2. `upload-from-local-machine` path second
3. within each intake path:
   - `landing-page`
   - `mobile-app`
   - `internal-tool`
   - `commerce-ops`

No class may be skipped silently.

## Pass / Fail Criteria By Stage

### `Create`

Pass only if:

- the user can start the project truthfully from the live UI
- the project identity is visible and correct
- create does not collapse into QA fallback or dead-end state

Fail if:

- create stalls
- create falls into fallback truth
- create loses product identity
- create does not carry the user into Understanding

### `Understanding`

Pass only if:

- the understanding reflects the chosen class and intake material
- the project framing is not generic
- the system shows class-specific comprehension

Fail if:

- the understanding is generic
- it ignores uploaded or entered material
- it does not logically match the product class

### `Loop`

Pass only if:

- the next action is coherent for the class
- the visible loop direction follows from the project truth
- the user can continue into downstream execution truthfully

Fail if:

- the loop is generic
- the next step does not follow from the project
- class-specific behavior is flattened

### `Proof`

Pass only if:

- proof is visibly specific to the class
- proof preserves project identity
- proof feels like a real product surface, not metadata

Fail if:

- proof is generic
- proof is mostly copy without visible product meaning
- proof loses class identity

### `Artifact`

Pass only if:

- the artifact is reachable live
- it visibly reflects the project and class
- it carries forward the same truth seen in earlier stages

Fail if:

- artifact route is broken
- artifact is generic or placeholder-like
- artifact truth diverges from the prior loop/proof truth

### `Timeline`

Pass only if:

- the timeline is reachable live
- it preserves project identity
- it preserves class-specific downstream progression

Fail if:

- timeline is unreachable
- timeline is generic
- timeline loses project or class identity

### `Route`

Pass only if:

- the correct route is reachable and stable at every stage
- the user can move through the loop without hidden fallback route substitution

Fail if:

- route is incorrect
- route silently collapses to another screen
- route truth depends on hidden state rather than live product flow

### `Restore`

Pass only if:

- refresh reopens the correct truth
- route restore does not degrade to fallback or split truth

Fail if:

- refresh drops the user into wrong truth
- restore loses project/class continuity
- restore reintroduces fallback / QA / legacy path truth

### `Continuity`

Pass only if:

- the same project truth survives across the loop
- identity and class stay intact
- downstream actions remain coherent

Fail if:

- the loop forgets what project it is handling
- class truth collapses later in the chain
- downstream stages feel detached from the original intake

## Failure Handling Rules

### When failure stays inside the same task

A failure stays inside the same task when:

- it is a direct bug or truth gap inside the currently active sweep target
- the fix does not require opening a broader canonical lane
- the failure is still part of proving the same class/intake/stage path

### When failure opens a new task

A failure opens a new task when:

- the sweep reveals a missing executable unit that is narrower than a lane
- the missing work has a clear owner surface and closure condition
- the failure cannot be truthfully absorbed into the currently active task without destroying task clarity

### When failure opens a new lane

A failure opens a new lane only when:

- it is higher-order
- it affects multiple classes or multiple stages
- it cannot be truthfully resolved inside the active sweep task
- it needs its own unfinished-task return discipline and rerun discipline

No new lane may be promoted casually.

## TrueGreen Rule

A class/path/stage task may become `trueGreen` only if:

- the relevant stage passes live in the browser
- the class-specific expected truth is visible
- route truth survives
- restore truth survives where relevant
- continuity truth survives downstream
- real evidence is captured

## Sweep Completion Rule

The sweep may end in exactly one of these states:

### `complete-clean`

- all class/path runs passed truthfully
- no remaining blockers exist
- reruns after fixes are clean

### `complete-with-blockers`

- all planned class/path runs were attempted
- blockers were recorded canonically
- the blockers truthfully remain and are lane/task assigned

### `incomplete`

- the sweep stopped before all required class/path runs completed
- evidence is missing
- execution order was broken
- failure write-back was incomplete

## Wave 4 Prohibition Rule

Wave 4 may not begin while:

- the sweep contract is not yet closed canonically
- the first sweep has not run
- rerun after fixes has not run
- the sweep is not `complete-clean`
- or a blocker has not been truthfully written as a canonical non-Wave-4 dependency

## Evidence Rule

No sweep pass is valid without:

- live browser evidence
- route evidence
- visible class-specific surface evidence
- downstream continuity evidence

## What This Track Does Not Do

This planning track does not:

- run the sweep
- activate agents
- fix product bugs
- open Wave 4
- declare sweep readiness beyond the contract itself
