# Wave 3 AI-Guided Onboarding Intelligence Planning Track

## Purpose

This document is the canonical parallel planning track for the Wave 3 onboarding intelligence gap.

It exists because the current onboarding flow is still too generic and therefore weakens:
- question quality
- flow steering
- artifact quality
- trust
- downstream loop quality

This is not a Wave 4 enhancement track.

It is a Wave 3 product-truth planning track that must shape how onboarding hardening is executed.

## Planning Mode Constraint

This track is planning-only for now.

It does **not** pause or replace the active `W3-PTH-*` execution queue.

It runs in parallel so that:
- Wave 3 product-truth hardening can continue
- but onboarding intelligence does not remain underspecified

## Source Of Truth

The only product truth remains:

- `http://127.0.0.1:4011/`

This planning track must be grounded in the live onboarding behavior that actually exists there.

It may not optimize around:
- abstract AI ambitions
- docs-only flow ideals
- mock-only prompting
- hidden QA behavior

## Core Problem Statement

The onboarding flow currently behaves more like a generic staged intake than a genuinely intelligent guidance system.

That means the user can still feel:
- asked generic questions
- pushed through a fixed flow
- under-understood
- handed weak project framing into downstream artifact generation

As long as that remains true, Wave 3 loop quality is capped upstream.

## Mission

Define the canonical architecture and decision system for AI-guided onboarding intelligence so onboarding can eventually become:
- understanding-led
- non-generic
- grounded
- trustable
- artifact-aware
- loop-aware

## Required Design Outputs

This planning track must produce clear canonical definitions for:

1. onboarding intelligence architecture
2. orchestration model
3. canonical contracts
4. decision model
5. questioning strategy
6. stopping criteria
7. anti-generic behavior rules
8. grounding rules
9. integration points with loop truth
10. integration points with artifact generation quality

## Non-Goals For This Track

This planning track does not yet require:
- a full new implementation
- a new backend execution engine
- a full LLM orchestration rollout
- a new product surface outside current Wave 3 hardening

Its job is to define the canonical model so later implementation is coherent and non-generic.

## Product-Truth Framing

Onboarding is not “alive” merely because:
- the user answered questions
- a session exists
- a summary was generated
- the loop continued

Onboarding intelligence is alive only if it:
- actually improves understanding depth
- asks questions that are context-sensitive
- stops when understanding is sufficient, not when a fixed count is reached
- steers the loop toward better downstream artifact truth
- makes the user feel understood
- reduces generic outputs downstream

## Canonical Planning Questions

### 1. Architecture

What are the canonical layers of onboarding intelligence?

At minimum define:
- intake memory layer
- hypothesis layer
- question-generation layer
- sufficiency-evaluation layer
- handoff layer into Understanding / Loop / Artifact truth

### 2. Orchestration

How does onboarding decide what to do next?

Define:
- fixed-step behavior vs adaptive-step behavior
- when to ask
- when to clarify
- when to branch
- when to summarize
- when to stop

### 3. Contracts

Define the canonical contracts for:
- user answer input
- extracted signals
- active hypotheses
- missing understanding areas
- next-question recommendation
- stopping decision
- handoff payload into downstream loop state

### 4. Decision Model

Define how the system decides:
- what it already understands
- what is still ambiguous
- what question will most reduce uncertainty
- what question is redundant
- when enough understanding exists to proceed

### 5. Questioning Strategy

Define rules for:
- contextual questioning
- user-language mirroring
- project-class sensitivity
- avoiding repeated or generic prompts
- escalating precision only when needed

### 6. Stopping Criteria

Define when onboarding should stop.

Not:
- after a fixed 3-question script

But:
- when understanding is sufficient for credible downstream steering

### 7. Anti-Generic Behavior

Define explicit rules that prevent onboarding from feeling templated, including:
- no repeated low-information questions
- no class-agnostic follow-up when class evidence is already strong
- no “one-size-fits-all” transitions
- no fake understanding summaries

### 8. Grounding Rules

Define what the model must ground itself in:
- the actual user answer history
- already extracted project signals
- project class
- ambiguity level
- downstream artifact stakes

### 9. Loop Integration

Define how onboarding intelligence should improve:
- Understanding quality
- Loop task selection
- Execution framing
- Proof relevance
- Artifact truth quality

### 10. Artifact Generation Integration

Define how onboarding should feed artifact quality directly, including:
- artifact class prediction
- artifact expectations
- user-value framing
- output quality risks caused by shallow onboarding

## Canonical Planning Queue

### W3-ONB-PLAN-001 — Audit live onboarding intelligence weakness on 4011
- priority: `P0`
- mode: `planning`
- depends_on:
  - `W3-PTH-002`
- output:
  - class-by-class diagnosis of where onboarding still feels generic
  - trust failures
  - weak handoffs into Understanding and Artifact truth
- validation:
  - grounded in observed onboarding behavior on `4011`

### W3-ONB-PLAN-002 — Define onboarding intelligence architecture and orchestration
- priority: `P0`
- mode: `planning`
- depends_on:
  - `W3-ONB-PLAN-001`
- output:
  - canonical layered architecture
  - orchestration flow
  - branching model
  - stopping model

### W3-ONB-PLAN-003 — Define contracts and decision model
- priority: `P0`
- mode: `planning`
- depends_on:
  - `W3-ONB-PLAN-002`
- output:
  - canonical contracts
  - sufficiency model
  - ambiguity model
  - question selection model

### W3-ONB-PLAN-004 — Define anti-generic and grounding rules
- priority: `P0`
- mode: `planning`
- depends_on:
  - `W3-ONB-PLAN-003`
- output:
  - anti-generic rules
  - grounding constraints
  - trust rules
  - failure-mode rules

### W3-ONB-PLAN-005 — Define downstream integration with loop truth and artifact quality
- priority: `P0`
- mode: `planning`
- depends_on:
  - `W3-ONB-PLAN-004`
- output:
  - handoff model into Understanding
  - handoff model into Loop
  - artifact quality integration points
  - implementation-ready integration boundaries

## Canonical Planning Draft — 2026-05-12

This section is the current canonical planning draft for `W3-ONB-PLAN-001` through `W3-ONB-PLAN-005`.

It is grounded in observed live behavior on `http://127.0.0.1:4011/` and in the current onboarding runtime contracts.

### W3-ONB-PLAN-001 — Live Audit Findings

Observed directly on `4011` via live onboarding sessions:

- every new session starts with the same first question: `למי המערכת הזאת נבנית?`
- the conversation always exposes `totalQuestions: 3`
- question progression is fixed to:
  - audience
  - core problem
  - successful solution
- follow-up phrasing mirrors prior answers slightly, but the decision system does not change question class, question count, or stopping threshold
- the conversation summary emits generic missing items even when they are not class-safe, including:
  - `איך הם משתמשים היום`
  - `כמה מכירות קיימות`
  - `כמה לקוחות יש להם`
- landing / marketing phrasing is brittle at classification time:
  - `Build a landing page for a new AI bookkeeping service` classified as `book`
  - `Build a marketing landing page for a CRM for small clinics` classified as `saas` while also setting `requestedDeliverables: ["growth"]`
- internal-tool phrasing is brittle at classification time:
  - `Build an internal operations tool for onboarding support reps` classified as `unknown`
  - the flow then asks for generic clarification instead of class-aware internal-tool follow-up
- readiness is gated by intake completeness more than understanding sufficiency:
  - with strong goal text and all three conversation answers present, the session still blocks on `supporting-material`
- the finish path can declare the session `completed` while also returning:
  - `blocked: true`
  - `handoffStatus: needs-clarification`
  - `error: "Onboarding is not ready to build project state"`

Canonical diagnosis:

- the current flow is a staged intake with a light conversational wrapper, not a true onboarding intelligence system
- project-class understanding is too brittle to drive question quality safely
- stopping truth is split between conversation completion and handoff readiness
- artifact stakes are not yet shaping what the system asks
- generic summary synthesis weakens trust and contaminates downstream Understanding / Loop / Artifact truth

### W3-ONB-PLAN-002 — Canonical Architecture And Orchestration

Canonical architecture layers:

1. evidence intake layer
   - collects initial vision text, files, links, prior answers, and explicit user edits
   - stores only observed evidence, not inferred truth
2. project-class and artifact hypothesis layer
   - maintains weighted hypotheses for project class, artifact class, audience, business intent, and execution stakes
   - must support conflicting hypotheses instead of collapsing to one label too early
3. understanding gap model
   - tracks what is known, what is inferred, what is missing, and what is risky if wrong
   - gaps must be tied to downstream consequences, not generic business templates
4. question planner
   - selects the next highest-value clarification based on ambiguity reduction and downstream impact
   - can ask, confirm, branch, summarize, or stop
5. sufficiency and stop evaluator
   - decides whether understanding is credible enough for handoff
   - conversation completion and handoff readiness must be one truth, not split truths
6. handoff layer
   - emits canonical payloads for Understanding, Loop selection, and artifact generation expectations

Canonical orchestration flow:

1. start from evidence already provided in create-project
2. form ranked class and artifact hypotheses
3. compute the smallest set of missing truths that materially affect downstream steering
4. ask one question only if it reduces a material ambiguity
5. after each answer, update hypotheses, risks, and sufficiency
6. stop when the handoff can steer Understanding and artifact generation credibly
7. if blocked, expose one explicit blocker truth instead of pretending onboarding is complete

Branching model:

- landing / marketing branch:
  focus on offer, audience, conversion action, trust proof, and traffic source expectations
- internal-tool branch:
  focus on operator role, workflow, current toolchain, failure cost, and required screens/actions
- SaaS branch:
  focus on user segment, recurring workflow, core object model, and activation path
- unknown branch:
  ask one discriminating classification question before broader discovery

Stopping model:

- never stop because three questions were asked
- stop only when:
  - project class confidence is high enough
  - artifact intent is high enough
  - the dominant user/value problem is grounded
  - the primary downstream artifact risk is reduced to an acceptable level
- if supporting material is absent but not critical, proceed with an explicit confidence downgrade instead of a fake completion state

### W3-ONB-PLAN-003 — Contracts And Decision Model

Canonical contract family:

- `observedEvidence`
  - raw vision text
  - uploaded files
  - external links
  - answer history
  - user-edited clarifications
- `activeHypotheses`
  - ranked `projectClass`
  - ranked `artifactClass`
  - audience hypotheses
  - workflow/use-case hypotheses
  - confidence per hypothesis
- `understandingGaps`
  - gap id
  - why it matters
  - downstream surfaces affected
  - blocker vs quality-risk classification
- `nextQuestionDecision`
  - question goal
  - targeted ambiguity
  - why this question is highest value now
  - expected downstream benefit
- `stopDecision`
  - `ready`
  - `ready-with-explicit-risk`
  - `needs-clarification`
- `handoffTruth`
  - canonical understanding summary
  - canonical artifact expectation
  - confidence and open-risk notes

Decision model rules:

- understanding truth must be derived from observed evidence first, inference second
- one answer may update multiple hypotheses
- a question is valid only if it can change class confidence, artifact expectation, or execution framing
- redundant questions are illegal once the targeted ambiguity is already sufficiently resolved
- the system must distinguish:
  - blocker ambiguity
  - quality ambiguity
  - optional enrichment

Canonical sufficiency model:

- sufficient means Nexus can credibly choose the next loop framing and expected artifact direction
- insufficient means the next loop step would be meaningfully vulnerable to building the wrong thing or framing the wrong proof

### W3-ONB-PLAN-004 — Anti-Generic, Grounding, And Trust Rules

Anti-generic rules:

- no fixed universal question script across all classes
- no class-blind missing-items list such as generic sales or customer metrics unless the project class makes them relevant
- no summary item may claim understanding that was not explicitly observed or clearly inferred from evidence
- no question may ask for material the user effectively already supplied in another form
- no completion state may coexist with a hidden blocker truth

Grounding rules:

- every question must cite its grounding source internally:
  - prior answer
  - intake text
  - uploaded artifact
  - unresolved class ambiguity
  - downstream artifact risk
- class inference must prefer phrase-level meaning over substring collisions
- requested deliverables and project class must be allowed to disagree temporarily until clarified
- missing-information prompts must be tied to the active class and active artifact stakes

Trust rules:

- if the system is unsure whether the project is landing / SaaS / internal-tool, it must say so plainly and ask one discriminating question
- if the system can continue with risk, it must expose the risk rather than invent confidence
- if the system is blocked, the visible status must say blocked, not completed

Failure-mode rules:

- classification collisions must degrade to explicit ambiguity, not wrong certainty
- absent files/links must not automatically outweigh strong textual understanding in every class
- conversational completion must never advance independently from handoff readiness truth

### W3-ONB-PLAN-005 — Loop Truth And Artifact Truth Integration

Integration with Understanding:

- hand off one canonical understanding object containing:
  - primary user
  - primary problem
  - intended artifact class
  - project class confidence
  - unresolved risks
- Understanding must inherit open ambiguities instead of reconstructing them from scratch

Integration with Loop selection:

- onboarding must inform which next task is selected first:
  - landing / marketing: offer, page structure, CTA, conversion proof
  - internal-tool: workflow map, critical screens, operator actions
  - SaaS: activation path, primary entity model, recurring job-to-be-done

Integration with artifact truth:

- onboarding must emit `artifactExpectation` before Proof
- `artifactExpectation` must include:
  - artifact class
  - intended reviewer
  - what “looks credible” means for this class
  - the biggest artifact failure risk caused by shallow onboarding
- downstream artifact surfaces must reuse this truth rather than rewriting a weaker summary story

Implementation-ready boundaries for later execution:

- replace fixed question count with question-decision orchestration
- replace single-label project-type collapse with ranked hypotheses
- unify visible completion state with handoff readiness state
- add artifact-expectation handoff as a first-class contract beside project intake

## Readiness Output Of This Track

This planning track is complete only when Nexus has:
- one canonical onboarding intelligence architecture
- one canonical orchestration model
- one canonical contract family
- one canonical stopping logic
- one canonical anti-generic rule set
- one canonical grounding rule set
- one canonical loop/artifact integration map

## Wave 4 Relevance

Wave 4 may later deepen onboarding intelligence implementation,
but deeper Wave 4 work should not proceed as if onboarding intelligence is already solved.

This planning track must therefore be included in Wave 4 readiness judgment:
- not as a full implementation prerequisite
- but as a canonical design prerequisite

## Current Status

- state: `planning-in-progress-with-grounded-canonical-draft`
- planning-progress:
  - `W3-ONB-PLAN-001`: advanced with live `4011` audit evidence
  - `W3-ONB-PLAN-002`: first canonical draft written
  - `W3-ONB-PLAN-003`: first canonical draft written
  - `W3-ONB-PLAN-004`: first canonical draft written
  - `W3-ONB-PLAN-005`: first canonical draft written
- execution-progress:
  - `W3-ONB-EXEC-001`: `trueGreen` on `2026-05-13`
  - truth:
    - onboarding finish no longer marks the session `completed` before handoff readiness is proven
    - blocked finish now returns one canonical clarification truth with `updatedSession.status: needs-clarification`
    - ready finish now returns one canonical completion truth with `updatedSession.status: completed` and `handoffStatus: ready`
  - live-validation:
    - landing / marketing case on `4011` first blocked truthfully on missing supporting material, then completed truthfully after a supporting link was added
    - internal-tool case on `4011` completed truthfully after a supporting file was added
  - `W3-ONB-EXEC-002`: `trueGreen` on `2026-05-15`
  - truth:
    - onboarding summaries now expose class-aware project truth instead of generic cross-class steering
    - missing-items now stay class-safe for landing / marketing, internal-tool, and SaaS follow-up paths
    - steering copy no longer leaks stale sales/customer prompts into the wrong project class
  - live-validation:
    - landing / marketing flow on `4011` now ends with landing-specific summary language and landing-safe missing-items
    - internal-tool flow on `4011` now ends with workflow-specific summary language and internal-tool-safe missing-items
    - SaaS follow-up flow on `4011` now ends with product-specific summary language and SaaS-safe missing-items
  - `W3-ONB-EXEC-003`: `trueGreen` on `2026-05-15`
  - truth:
    - the live onboarding API on `4011` now chooses questions adaptively instead of staying fixed at `totalQuestions: 3`
    - landing / marketing can now stop after two questions when audience and core problem are already sufficient
    - ambiguous class signals can now trigger an explicit project-class disambiguation question before the flow continues
    - the conversation contract now exposes explicit `reason` and `completionReason` truth for why Nexus asked the next question or stopped
  - live-validation:
    - landing / marketing flow on `4011` now stops after question 2 with a landing-specific completion reason instead of forcing question 3
    - ambiguous CRM / internal-tool flow on `4011` now surfaces a class-disambiguation question before continuing to problem / solution refinement
    - visible UI validation on `4011` confirmed the adaptive question and stop behavior from the canonical rendered path
  - `W3-ONB-EXEC-004`: `trueGreen` on `2026-05-16`
  - `W3-ONB-EXEC-005`: `trueGreen` on `2026-05-16`
  - `W3-ONB-EXEC-006`: `trueGreen` on `2026-05-16`
  - truth:
    - onboarding now emits one canonical artifact expectation contract with title, summary, project class, continuity line, and proof focus
    - Understanding, Loop, and Proof now consume that onboarding artifact expectation instead of reconstructing weaker artifact intent downstream
    - Proof artifact payloads now embed the onboarding-derived expectation so artifact truth stays connected to onboarding
  - live-validation:
    - internal-tool flow on `4011` carried one workspace expectation from onboarding into Understanding copy, Loop framing, and Proof artifact truth
    - landing / marketing flow on `4011` carried one landing-page expectation from onboarding into Understanding copy, Loop framing, and generated-surface Proof framing
  - completion_note:
    - Jason's original blocker was not permissions and not sandbox access
    - the first blocker was his session-local Browser Use `iab` attach failure
    - a second blocker was a stale contract test that still expected `generated-surface` instead of `mobile-app`
    - final rendered-screen verification and contract cleanup were completed on the main execution lane against the live `4011` site
- execution-effect: `non-blocking for active W3-PTH queue`
- readiness-effect: `required input for truthful Wave 4 readiness judgment`

## Canonical Promotion To Execution — 2026-05-13

The planning draft is now strong enough to promote onboarding intelligence into a canonical, non-blocking execution lane for Wave 3.

This promotion does **not** replace the active `W3-PTH-*` lane.

It creates a second canonical lane with these rules:

- it is `execution`, not planning-only
- it must stay grounded in `4011`
- it must close upstream onboarding truth gaps that materially affect:
  - question quality
  - flow steering
  - artifact quality
  - trust
  - downstream loop quality
- it must not drift into broad Wave 4 architecture rollout
- it must not silently rewrite unrelated loop surfaces

### Canonical Execution Lane

- lane id: `W3-ONB-EXEC`
- mode: `parallel, non-blocking for W3-PTH`
- source of truth: `http://127.0.0.1:4011/`
- canonical basis:
  - this planning track
  - `docs/nexus-loop-productization-canonical-block.json`
  - `docs/operating-system/wave3-permanent-orchestrator-v1.md`

### W3-ONB-EXEC-001 — Unify onboarding completion truth with handoff readiness truth
- priority: `P0`
- mode: `execution`
- depends_on:
  - `W3-ONB-PLAN-003`
  - `W3-PTH-003`
- mission:
  - eliminate split truth where the onboarding conversation can appear complete while the handoff remains implicitly blocked or semantically contradictory
- acceptance_criteria:
  - conversation completion and handoff readiness resolve to one canonical truth
  - onboarding does not expose `completed` while the same visible path still behaves as blocked without explicit canonical reason
  - landing / marketing and internal-tool classes both preserve expectation truth through the finish transition
- product_truth_validation:
  - no `complete but blocked` contradiction remains on `4011`
  - the visible handoff is trustworthy and coherent
- verification_4011:
  - run at least one landing / marketing project and one internal-tool project
  - complete onboarding
  - verify finish behavior is canonical and loop continuation truth is explicit

### W3-ONB-EXEC-002 — Replace class-blind onboarding summaries and missing-items with class-safe steering
- priority: `P0`
- mode: `execution`
- depends_on:
  - `W3-ONB-EXEC-001`
- mission:
  - remove generic summary and missing-item output that weakens trust and steers the wrong downstream loop
- acceptance_criteria:
  - onboarding summary and missing-items are class-safe for landing / marketing, internal-tool, and SaaS
  - the visible summary no longer asks for irrelevant sales/customer metrics in the wrong class
  - the Understanding handoff inherits stronger project truth from onboarding
- product_truth_validation:
  - summaries feel grounded in the actual project class
  - the user can see that Nexus understood what kind of thing is being built
- verification_4011:
  - run class-specific onboarding flows on `4011`
  - inspect the visible summary and missing-items output
  - verify they no longer feel generic or misclassified
- status: `trueGreen` on `2026-05-15`
- execution_truth:
  - landing / marketing summaries now describe landing-page intent and ask only landing-safe follow-up questions
  - internal-tool summaries now describe workflow truth and ask only internal-tool-safe follow-up questions
  - SaaS follow-up summaries now describe product truth and ask only SaaS-safe follow-up questions
- live_4011_validation:
  - verified on fresh landing / marketing, internal-tool, and SaaS onboarding sessions against `http://127.0.0.1:4011/`
  - confirmed no stale `sales`, `customers`, or other cross-class leftovers remained visible in summary or missing-items output

### W3-ONB-EXEC-003 — Introduce adaptive questioning and stopping truth for the live onboarding path
- priority: `P0`
- mode: `execution`
- depends_on:
  - `W3-ONB-EXEC-002`
- mission:
  - begin replacing the fixed three-question intake script with live decision-based questioning and stop logic that is still safe for Wave 3
- acceptance_criteria:
  - onboarding is no longer governed only by `totalQuestions: 3`
  - the visible flow can stop because understanding is sufficient, not only because a fixed script ended
  - a class-disambiguation question can appear when ambiguity is real
- product_truth_validation:
  - onboarding feels more intelligent and less scripted
  - the user can see why Nexus asked the next question
- verification_4011:
  - run at least two classes with different ambiguity profiles
  - verify question count or question type can differ for truthful reasons
- status: `trueGreen` on `2026-05-15`
- execution_truth:
  - the live conversation contract now derives the next question from collected understanding instead of advancing through a fixed three-question script
  - landing / marketing can now complete the conversational phase after audience + core problem when that understanding is already sufficient
  - ambiguous CRM / internal-tool intake can now surface a class-disambiguation question before returning to problem / solution collection
  - the contract now emits `currentQuestion.reason` and `completionReason` so the user can see why Nexus asked the next question or stopped
- live_4011_validation:
  - verified on fresh landing / marketing and ambiguous CRM / internal-tool onboarding sessions against `http://127.0.0.1:4011/`
  - confirmed that question count and question type changed for truthful reasons on the live API surface
  - confirmed that landing / marketing stopped after two questions because understanding was sufficient, not because question 3 finished
  - confirmed in the visible UI on `4011` that landing onboarding moved from question 1 directly to a class-safe question 2 and then stopped with `לסיכום ההבנה` after two questions
  - confirmed in the visible UI on `4011` that an ambiguous CRM / internal-tool project surfaced a class-disambiguation question before returning to the core-problem question

### W3-ONB-EXEC-004 — Emit canonical artifact expectation truth from onboarding into downstream loop surfaces
- priority: `P1`
- mode: `execution`
- depends_on:
  - `W3-ONB-EXEC-003`
  - `W3-PTH-004`
- mission:
  - make onboarding materially influence artifact quality by emitting explicit artifact expectations into Understanding / Loop / Proof
- acceptance_criteria:
  - onboarding produces canonical artifact expectation truth
  - downstream surfaces reuse that truth instead of reconstructing weaker summary guesses
  - proof quality improves because artifact intent is explicit earlier
- product_truth_validation:
  - users can understand what sort of artifact Nexus is aiming to build before Proof
  - artifact truth feels connected to onboarding, not invented later
- verification_4011:
  - run a live project through onboarding and into downstream loop surfaces
  - verify artifact expectation continuity is visible
- status: `trueGreen` on `2026-05-16`
- execution_truth:
  - onboarding finish now emits a canonical artifact expectation contract with artifact title, summary, project class, proof focus, and continuity language
  - Understanding now shows the intended artifact before Proof instead of only restating audience/problem/solution
  - Loop now frames the next task around the artifact expectation instead of a weaker generic next-step guess
  - Proof now marks its first artifact and its first success criterion as continuation of the onboarding-defined artifact expectation
- live_4011_validation:
  - verified on a live internal-tool onboarding flow on `4011` that the finish payload carried one workspace expectation into downstream Understanding, Loop, and Proof view-model truth
  - verified on a live landing / marketing onboarding flow on `4011` that the finish payload carried one landing-page expectation into downstream Understanding, Loop, and generated-surface Proof view-model truth
  - confirmed on both live flows that the canonical Proof artifact payload now embeds `artifactExpectation`
  - confirmed in the visible UI on `4011` that `Understanding` now shows `מה אנחנו מכוונים לבנות עכשיו: ...`
  - confirmed in the visible UI on `4011` that `Loop` now frames the next step around `לקדם את ...` and exposes `התוצר שאליו מכוונים`
  - confirmed in the visible UI on `4011` that `Proof` keeps the onboarding-defined direction visible through `כיוון שננעל ב-onboarding` and continuity copy

### W3-ONB-EXEC-005 — Feed onboarding artifact expectation into class-aware proof focus for weak classes
- priority: `P1`
- mode: `execution`
- depends_on:
  - `W3-ONB-EXEC-004`
  - `W3-PTH-007`
- mission:
  - use onboarding artifact expectation to tighten what weak classes are trying to prove, especially where landing / marketing and mobile still collapse into generic generated-surface truth
- acceptance_criteria:
  - onboarding-defined artifact expectation materially changes the proof focus for weak classes
  - weak classes show class-aware proof framing instead of generic generated-surface criteria alone
  - proof surfaces for weak classes speak in terms of the intended artifact, not only renderer state
- product_truth_validation:
  - users can understand what success should look like for the class before and inside Proof
  - onboarding intelligence measurably reduces generic proof framing for weak classes
- verification_4011:
  - run at least one landing / marketing project and one additional weak-class project
  - verify the visible proof framing is more class-aware and less metadata-heavy because of onboarding artifact expectation
- status: `trueGreen` on `2026-05-16`
- execution_truth:
  - weak generated-surface classes now reuse onboarding artifact expectation to define what Proof must demonstrate instead of leaning only on preview metadata
  - landing / marketing Proof now frames success around the above-the-fold promise, trust proof, and one clear CTA
  - mobile Proof now frames success around the first screen, first action, and continuity of the mobile flow
  - the live Proof screen bullets now speak in terms of the intended artifact for weak classes instead of only region counts, CTA anchors, and validation status
- live_4011_validation:
  - verified on a live landing / marketing onboarding flow on `4011` that onboarding stopped after two questions, emitted a landing-page artifact expectation, and drove Proof success criteria toward `הבטחה ראשית מעל הקפל`, `הוכחת אמון שתומכת בהחלטה`, and `CTA מרכזי אחד שקל להבין`
  - verified on a live mobile onboarding flow on `4011` that onboarding asked a class-disambiguation question, emitted a mobile artifact expectation, and drove Proof success criteria toward `מסך ראשון ברור למשתמש הנכון`, `פעולה ראשונה שאפשר להבין בלי הדרכה`, and `זרימה ניידת שמטפלת ישירות בכאב המרכזי`
  - verified on both live flows that Proof artifacts now describe the intended artifact shape for the class instead of only generic generated-surface records
- completion_note:
  - the original blocker was not a permissions issue and not a code issue
  - the blocker was Jason's session-local Browser Use `iab` attach failure: `No Codex IAB backends were discovered.`
  - final rendered-screen verification was completed on the main execution lane against the live `4011` site

### W3-ONB-EXEC-006 — Push onboarding artifact expectation into weak-class generation inputs before Proof
- priority: `P1`
- mode: `execution`
- depends_on:
  - `W3-ONB-EXEC-005`
  - `W3-PTH-009`
- mission:
  - move the onboarding intelligence contribution one step earlier so weak classes do not only talk better in Proof, but also arrive with stronger class-aware generation inputs before the proof surface is assembled
- acceptance_criteria:
  - onboarding artifact expectation materially shapes weak-class generation inputs before Proof
  - landing / marketing and mobile generation paths receive explicit class-aware framing from onboarding truth
  - the downstream project state exposes that framing in a canonical place that Wave 3 hardening tasks can reuse
- product_truth_validation:
  - onboarding intelligence is no longer limited to explanatory copy after generation
  - weak classes carry class-aware artifact intent into generation-time truth
- verification_4011:
  - run one live landing or marketing flow and one live mobile flow on `4011`
  - verify the project arrives at the pre-Proof path with visible class-aware artifact intent, not only generic generated-surface defaults
- status: `trueGreen` on `2026-05-16`
- execution_truth:
  - `aiDesignRequest` now carries a canonical `generationIntent` block derived directly from onboarding artifact expectation before Proof is assembled
  - the same `generationIntent` now exists at top-level project state as reusable canonical truth for downstream Wave 3 hardening work
  - landing / marketing generation intent now frames pre-Proof generation around promise, trust proof, and one clear CTA
  - mobile generation intent now frames pre-Proof generation around the first screen, first action, and next-step continuity
  - the pre-Proof loop path now exposes `איך Nexus יוצר את התוצר` so weak classes arrive with visible class-aware artifact intent before Proof
- live_4011_validation:
  - verified on a live landing / marketing onboarding flow on `4011` that the finish payload carried `generationIntent` at top level and inside `aiDesignRequest`
  - verified on the same live landing flow that `generationIntent.projectType` resolved to `landing-page`, `generationGoal` resolved to promise / trust / CTA framing, and the pre-Proof loop view-model exposed `איך Nexus יוצר את התוצר`
  - verified on a live mobile onboarding flow on `4011` that the finish payload carried `generationIntent` at top level and inside `aiDesignRequest`
  - verified on the same live mobile flow that `generationIntent.projectType` resolved to `mobile-app`, `generationGoal` resolved to first-screen / first-action / next-step framing, and the pre-Proof loop view-model exposed `איך Nexus יוצר את התוצר`
### W3-ONB-EXEC-007 — Keep onboarding-required supporting material from breaking the truthful handoff into Loop
- priority: `P1`
- mode: `execution`
- depends_on:
  - `W3-ONB-EXEC-006`
  - `W3-PTH-011`
- mission:
  - stop the visible path from bouncing back into onboarding language after understanding is already approved, when the only remaining gap is supporting material or handoff readiness detail
- acceptance_criteria:
  - after `נכון, בוא נתקדם`, the user sees one canonical continuation truth instead of a confusing return to generic onboarding state
  - supporting-material requirements stay explicit without weakening the visible loop handoff
  - landing and mobile preserve class-aware intent even when a support-material gate still exists
- product_truth_validation:
  - the user understands exactly why Nexus is asking for one more prerequisite
  - approved understanding does not visually regress into a weaker onboarding shell
- verification_4011:
  - run one live landing flow and one live mobile flow on `4011`
  - verify that any remaining prerequisite is shown as a class-safe continuation gate, not as a confusing fallback
- status: `trueGreen` on `2026-05-16`
- execution_truth:
  - when understanding is already approved, the visible handoff no longer falls back into weaker onboarding language just because supporting material is still optional or recommended
  - the live loop now remains the canonical truth after `נכון, בוא נתקדם`, while still exposing a class-safe continuation gate for any supporting material that can sharpen the result
  - landing flows keep the landing-page mission, trust-material prompt, and generation-intent framing visible inside Loop instead of bouncing back into a generic onboarding shell
  - mobile flows keep the mobile-flow mission, mobile-specific support-material prompt, and class-aware generation intent visible inside Loop instead of bouncing back into a generic onboarding shell
- live_4011_validation:
  - verified on a live landing flow on `4011` that after `נכון, בוא נתקדם`, the app stayed on `loop`, showed `לקדם את Landing Gate 398197 landing page`, kept `חומר תומך שאפשר להוסיף תוך כדי תנועה`, exposed `איך Nexus יוצר את התוצר`, and did not show `חזור להבנת הפרויקט`
  - verified on a live mobile flow on `4011` that after `נכון, בוא נתקדם`, the app stayed on `loop`, showed `לקדם את Mobile Gate 007 mobile flow`, kept `חומר תומך שאפשר להוסיף תוך כדי תנועה`, exposed `איך Nexus יוצר את התוצר`, and did not show `חזור להבנת הפרויקט`
- completion_note:
  - Darwin's code and tests were valid, but the task was not promoted from code alone
  - final rendered-screen verification was completed on the main execution lane against the live `4011` site for both landing and mobile continuation paths

## Execution Status

- state: `execution-closed-for-current-wave3-scope`
- lowest_truthful_executable_task:
  - `none`
- execution-discipline:
  - implementation must stay narrower than Wave 4
  - implementation must preserve the active `W3-PTH-*` lane
  - implementation must write back truthful state after every task
