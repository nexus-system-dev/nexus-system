# Wave 4 Post-Closure Learning And Intake Continuation Lane

## Purpose

After the active Wave 4 core closes through `W4-MBN-020`,
Nexus must not leave learning and intake intelligence as disconnected future notes.

This continuation lane exists so both systems enter canonical execution structure immediately after Wave 4 core closure,
without violating the core Wave 4 task order and without starting premature implementation.

This is a prepared continuation lane.
It is not part of the active `W4-MBN-*` core order.

## Canonical Boundary

This lane may be prepared immediately after `W4-MBN-020` closes truthfully.

It may not begin implementation while the active Wave 4 core order still points at:
- `W4-MBN-021`
- `W4-MBN-022`
- or any earlier unresolved core task

Its role is to preserve canonical continuity between:
- Wave 4 core contracts
- future learning-system execution
- future adaptive intake execution

Activation truth on `2026-05-20`:
- `W4-MBN-021` closed truthfully
- `W4-MBN-022` closed truthfully
- no unresolved `W4-MBN-*` task remains ahead of this lane
- the lane may now be selected canonically without violating the core Wave 4 order

## Lane Ownership

- lane id: `post-wave4-learning-and-intake-continuation`
- mode: `prepared-not-started`
- owner: `post-Wave-4 continuation`
- canonical dependency boundary:
  - all active Wave 4 core tasks must remain higher priority than this lane until the canonical ledger selects it

## Lane Mission

Prepare the next Nexus execution structure so that:

1. learning becomes a real engine capability rather than optional polish
2. adaptive intake becomes a bounded, class-aware product system rather than free-form chat
3. both systems stay connected to generation, runtime, release, deployment, and continuation truth
4. later implementation is deterministic, continuity-safe, and visibly verifiable

## Prepared Tasks

### W4-LEARN-001 — Define canonical learning system contract

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `architecture`
- status: `trueGreen`
- depends_on:
  - `W4-MBN-020`
  - `W4-MBN-019`
  - `docs/operating-system/wave3-onboarding-intelligence-planning-track.md`
- mission:
  - define one canonical learning-system contract that separates project memory, user preference, and system learning, and connects them back into real Nexus decisions
- learning inputs that must be covered:
  - onboarding
  - execution
  - proof
  - release
  - deployment
  - continuation
  - reruns
  - approvals
  - failures
  - user edits
  - runtime/package outcomes
  - generation outcomes
  - cross-project patterns
- required decision impact:
  - generation quality
  - onboarding refinement
  - runtime decisions
  - bootstrap quality
  - continuation quality
  - release decisions
  - next-task selection
  - class-specific behavior
- pass/fail truth:
  - pass if one canonical learning contract defines:
    - stored inputs
    - durable memory layers
    - decision-changing outputs
    - separation of project memory / user preference / system learning
    - class-aware and cross-project learning boundaries
  - fail if learning remains only:
    - UI summary
    - per-project memory blur
    - feedback text with no later decision impact
- live verification requirement:
  - later implementation must visibly prove that learning changes real Nexus behavior on a live route
  - at minimum, later reruns must show one visible improvement in:
    - generation framing
    - continuation quality
    - runtime/release decision quality
- continuity rules:
  - learning state may not silently reset across restore/revisit
  - learned project truth must remain attached to project identity
  - system-level learning may not overwrite per-project truth silently
- generation integration rules:
  - generation must be able to consume learned class signals, failure signals, and outcome patterns from the canonical learning system
- explicit prohibitions:
  - no hidden “AI intuition” without canonical trace
  - no system-level learning that mutates active project truth without visible explanation
  - no treating feedback summaries as proof of learning
- visible product impact expectations:
  - smarter generation direction
  - reduced drift
  - better continuation decisions
  - better runtime/release choices where canonically allowed
- closure write-back:
  - canonical contract path:
    - `docs/operating-system/wave4-canonical-learning-system-contract.md`
  - governing implementation anchors:
    - `src/core/canonical-learning-system-contract.js`
    - `src/core/context-builder.js`
    - `web/nexus-ui/adapters/timeline-adapter.js`
    - `web/nexus-ui/screens/TimelineHistoryScreen.js`
    - `web/app.js`
  - visible closure proof:
    - `Timeline` on `http://127.0.0.1:4011/?qa=1`
    - visible `Canonical learning system`
    - visible `Project memory`
    - visible `User preference memory`
    - visible `System learning`
    - visible `next-task selection`

Closure truth on `2026-05-20`:
- one canonical learning-system contract now exists
- it separates `project memory`, `user preference memory`, and `system learning`
- it truthfully marks current decision impacts as `live`, `partial`, or `next`
- it is visible on the live `Timeline` surface inside Nexus
- it does not falsely claim that all later learning-driven behavior is already implemented

### W4-INTAKE-001 — Define adaptive onboarding agent contract

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `architecture`
- status: `trueGreen`
- depends_on:
  - `W4-MBN-020`
  - `W4-LEARN-001`
  - `docs/operating-system/wave3-onboarding-intelligence-planning-track.md`
- mission:
  - define one canonical adaptive intake/onboarding agent that refines user understanding per product class and emits a bounded handoff into generation
- required agent behavior:
  - ask different questions per product class
  - detect weak or generic answers
  - refine the user when clarity is insufficient
  - know when enough information exists
  - produce a canonical handoff into generation
  - remain bounded and product-connected
  - never become free-form AI chaos
- pass/fail truth:
  - pass if one canonical intake-agent contract defines:
    - question-decision orchestration
    - class-aware branching
    - weak-answer detection
    - sufficiency logic
    - bounded handoff into generation
    - explicit prohibitions against free-form chat drift
  - fail if the agent is only:
    - nicer copy on top of the same fixed intake
    - generic conversation without canonical handoff truth
    - autonomous chat without product grounding
- live verification requirement:
  - later implementation must visibly prove on live Nexus routes that:
    - different classes receive different questioning paths
    - weak answers trigger clarification
    - the agent stops only when sufficient information exists
    - generation receives a stronger visible handoff
- continuity rules:
  - intake state must survive restore/revisit
  - the approved intake handoff must remain attached to the same project through Understanding and Generation
  - adaptive questioning may not silently rewrite already-approved project truth
- generation integration rules:
  - the agent must emit one canonical handoff payload for generation, not parallel informal summaries
  - later generation requests must reuse intake truth rather than reconstruct weaker generic intent downstream
- explicit prohibitions:
  - no free-form general assistant behavior
  - no replacing product rules with open-ended chat
  - no bypassing class resolution or sufficiency gates
  - no advancing into generation without canonical intake handoff
- visible product impact expectations:
  - smarter onboarding behavior
  - different questioning paths
  - stronger generation focus
  - reduced drift
- closure write-back:
  - canonical contract path:
    - `docs/operating-system/wave4-adaptive-onboarding-agent-contract.md`
  - governing implementation anchors:
    - `src/core/adaptive-onboarding-agent-contract.js`
    - `web/shared/adaptive-onboarding-agent-contract.js`
    - `src/core/context-builder.js`
    - `web/nexus-ui/adapters/onboarding-adapter.js`
    - `web/nexus-ui/screens/SmartOnboardingScreen.js`
    - `web/app.js`
  - visible closure proof:
    - `Onboarding` on `http://127.0.0.1:4011/?qa=1`
    - visible `Adaptive intake contract`
    - visible `class-aware branching`
    - visible `bounded handoff into generation`
    - visible `no free-form general assistant behavior`

## Canonical Relationship To Active Wave 4 Core

- this lane is prepared because `W4-MBN-020` is closed
- this lane does not replace `W4-MBN-021`
- this lane does not replace `W4-MBN-022`
- this lane may not preempt the active Wave 4 core order

## Active Continuation State

Current continuation truth on `2026-05-20`:

- `W4-LEARN-001` is `trueGreen`
- `W4-INTAKE-001` is `trueGreen`
- the continuation lane was initially closed at the contract layer, but repository reality still leaves deep decision impact and real adaptive-flow replacement unclosed

Closure truth on `2026-05-20`:
- one canonical adaptive onboarding contract now exists
- it keeps class-aware branching, sufficiency gate, and bounded handoff under one visible product contract
- it truthfully marks weak / generic answer detection as `partial`
- it is visible on the live `Onboarding` surface inside Nexus

Reality-audit reopen truth on `2026-05-20`:
- `W4-LEARN-001` and `W4-INTAKE-001` closed contract coverage, not full implementation coverage
- repository reality still does not prove that stored learning signals change later generation behavior
- repository reality still does not prove that the visible fixed `3-question` onboarding shell has been replaced
- therefore the continuation lane must reopen as active canonical execution until those missing truths are covered

## Reopened Tasks From Reality Audit

### W4-LEARN-002 — Implement deep adaptive learning decision impact

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `trueGreen`
- depends_on:
  - `W4-LEARN-001`
  - `W4-INTAKE-001`
  - `W4-MBN-018`
  - `W4-MBN-019`
- mission:
  - turn stored learning signals into later decision-changing behavior across runtime, release, continuation, rerun, and next-task paths instead of stopping at memory, summaries, and contracts
- pass/fail truth:
  - pass if stored learning signals measurably change later Nexus decisions on real execution paths and those changes survive restore and revisit
  - fail if learning remains only:
    - memory layers
    - summaries
    - recommendation cards
    - passive state with no later decision impact
- continuity rules:
  - learned project truth must remain attached to the same project across restore, rerun, revisit, and route changes
  - system-level learning may not silently overwrite approved per-project truth
- generation integration rules:
  - this task may prepare generation-facing learning inputs but may not claim generation improvement complete before `W4-GEN-001`
- explicit visible product change required:
  - at least one live Nexus decision must visibly change because of prior failures, approvals, release outcomes, deployment outcomes, or continuation outcomes
- explicit prohibitions:
  - no docs-only closure
  - no contract-only closure
  - no UI-card-only closure
  - no hidden learning logic without visible downstream effect
- closure write-back:
  - canonical contract path:
    - `docs/operating-system/wave4-deep-adaptive-learning-decision-impact.md`
  - governing implementation anchors:
    - `src/core/deep-adaptive-learning-decision-impact.js`
    - `src/core/context-builder.js`
    - `src/core/canonical-learning-system-contract.js`
    - `web/nexus-ui/adapters/next-task-adapter.js`
    - `web/nexus-ui/screens/NextTaskScreen.js`
    - `web/nexus-ui/adapters/timeline-adapter.js`
    - `web/nexus-ui/screens/TimelineHistoryScreen.js`
    - `web/app.js`
  - visible closure proof:
    - `Next Task` on `http://127.0.0.1:4011/?qa=1&v=intake001c`
    - visible `לייצב את Landing page לפני הרחבה נוספת`
    - visible `מסלול: stabilization`
    - visible `repair-before-expand`
    - visible runtime/package and release/continuation decisions driven by prior signals
    - `Timeline` on `http://127.0.0.1:4011/?qa=1&v=intake001c`
    - visible `Deep learning decision impact`
    - visible `repair-before-expand`

Closure truth on `2026-05-20`:
- stored learning signals now change later visible Nexus decisions
- the change is visible on `Next Task` and `Timeline`
- learning now changes continuation direction, next-task selection, runtime/package framing, and release/deploy promotion framing
- generation learning remains explicitly unclosed and deferred to `W4-GEN-001`

### W4-GEN-001 — Connect learning signals to generation decisions

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `trueGreen`
- depends_on:
  - `W4-LEARN-002`
  - `W4-MBN-007`
  - `W4-MBN-011`
  - `W4-MBN-012`
- mission:
  - connect prior outcome signals, class-specific learning, and safe cross-project patterns back into generation framing, proof focus, runtime direction, and packaging choices
- pass/fail truth:
  - pass if generation decisions change measurably after prior outcomes and the changed generation direction is visible in Nexus surfaces
  - fail if generation remains class-aware but not learning-aware
- continuity rules:
  - learned generation preferences must survive restore and rerun without drifting into generic defaults
- generation integration rules:
  - generation must consume canonical learning inputs directly, not parallel ad hoc summaries
  - runtime and packaging changes caused by learning must remain class-safe and visibly explained
- explicit visible product change required:
  - at least two comparable runs must show visibly different generation framing or proof focus because of prior learning signals
- explicit prohibitions:
  - no claim of generation improvement from artifact labels alone
  - no cross-project mutation without visible explanation
- closure write-back:
  - canonical contract path:
    - `docs/operating-system/wave4-generation-learning-signal-integration.md`
  - governing implementation anchors:
    - `src/core/learning-aware-generation-decision.js`
    - `src/core/context-builder.js`
    - `src/core/canonical-learning-system-contract.js`
    - `web/nexus-ui/adapters/understanding-adapter.js`
    - `web/nexus-ui/screens/UnderstandingSummaryScreen.js`
    - `web/nexus-ui/adapters/proof-adapter.js`
    - `web/app.js`
  - visible closure proof:
    - `Understanding` shows `כיוון generation חי`
    - `Understanding` shows `איך Nexus עומדת לבנות את זה עכשיו`
    - `Proof` shows `הלמידה כבר שינתה את כיוון היצירה`
    - `Proof` shows `כיוון generation שנלמד מהסבב האחרון`

Closure truth on `2026-05-20`:
- generation is now learning-aware instead of only class-aware
- stored signals now change generation framing, focus, and primary action
- the learned generation shift is visible on `Understanding` and `Proof`
- QA proof fallback was fixed so the same route no longer collapses back to generic proof framing

### W4-INTAKE-002 — Replace fixed 3-question onboarding with adaptive intake flow

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `trueGreen`
- depends_on:
  - `W4-INTAKE-001`
  - `W4-LEARN-002`
  - `W4-GEN-001`
  - `docs/operating-system/wave3-onboarding-intelligence-planning-track.md`
- mission:
  - replace the visible fixed `3-question` onboarding shell with a real adaptive intake flow that varies by class, answer quality, and readiness while staying bounded and product-connected
- pass/fail truth:
  - pass if visible onboarding no longer relies on a fixed question count and different project classes visibly receive different question sequences, clarification loops, and readiness-based stop conditions
  - fail if the system still shows the same fixed shell and only changes copy or contract cards
- continuity rules:
  - intake state and approved handoff must survive restore, revisit, and transition into Understanding and Generation
  - adaptive questioning may not silently rewrite already-approved project truth
- generation integration rules:
  - intake must emit one canonical structured handoff that Generation actually consumes
  - readiness stop must be based on sufficient information, not fixed count
- explicit visible product change required:
  - the live onboarding route must stop presenting the fixed `3-question` shell as the real user flow
- explicit prohibitions:
  - no free-form chat drift
  - no contract-only closure
  - no backend-only adaptive logic while the visible flow remains fixed-shell

Implementation truth on `2026-05-21`:
- repository reality now removes fixed-index progression from the local onboarding fallback and the visible onboarding progress model
- backend-backed onboarding already exposes adaptive question count, adaptive class disambiguation, and readiness-based stopping truth
- the visible onboarding UI now renders adaptive progress wording instead of presenting a fixed `3-question` shell as the canonical route truth
- the direct QA onboarding route now opens the adaptive onboarding conversation surface instead of falling into `אין onboarding פעיל לשחזור`
- live QA proof shows one landing-page-like path can stop after `target-audience` + `core-problem` and move into `השיחה הושלמה` / `לסיכום ההבנה` without a forced fixed third question
- live QA proof also shows a fresh ambiguous rerun can be seeded from `Create`, then surface `project-class` clarification before proceeding when mixed signals are present (`Build a CRM landing page for clinic leads` + `Clinic owners`)
- the QA preview reset/reseed path now truthfully starts a fresh adaptive onboarding conversation from `Create` instead of reusing stale preview conversation state
- direct live QA onboarding refresh/revisit no longer collapses back into `אין onboarding פעיל לשחזור`

Closure truth on `2026-05-21`:
- `W4-INTAKE-002` is now closed truthfully
- visible proof now covers:
  - direct QA onboarding entry without blocked restore fallback
  - adaptive progress language instead of a fixed `3-question` shell
  - landing-page early-stop behavior based on readiness
  - fresh ambiguous clarification before progression when project class is still mixed
  - continuity-safe revisit on the live onboarding route

### W4-INTAKE-003 — Connect learning signals to adaptive onboarding question selection

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `blocked`
- depends_on:
  - `W4-INTAKE-002`
  - `W4-LEARN-002`
  - `W4-GEN-001`
  - `docs/operating-system/wave3-onboarding-intelligence-planning-track.md`
- mission:
  - make the learning layer the decision-making brain behind adaptive onboarding by letting stored learning signals influence which question is asked next, when weak or generic answers must trigger clarification, when readiness is still blocked, and how the final handoff into generation is shaped
- ownership boundary:
  - this task owns learning-guided question strategy and clarification pressure
  - it does not own provider-backed conversation runtime
  - it does not by itself close downstream structured injection into every Nexus system surface
- pass/fail truth:
  - pass if prior learning signals measurably influence question selection, clarification pressure, readiness gating, and generation handoff on the live onboarding path
  - fail if the system remains only:
    - class-aware
    - answer-aware
    - readiness-aware
    - but not learning-guided from prior outcomes
- continuity rules:
  - learned intake behavior must survive restore, revisit, rerun, and project resume without silently resetting to a generic question path
  - per-project intake truth may not be overwritten silently by cross-project learning
- generation integration rules:
  - learning-guided intake must improve the canonical handoff that Generation actually consumes
  - weak or generic answers must block premature generation and force a sharper clarification loop instead
- explicit visible product change required:
  - at least two product classes must show different learned question paths on the live onboarding route
  - a weak or generic answer such as “I want a system for a business” must visibly trigger clarification instead of progression
  - the final handoff into Understanding / Generation must visibly reflect the stronger learned intake path
- explicit prohibitions:
  - no docs-only closure
  - no contract-only closure
  - no card-only closure
  - no hidden scoring model without visible question-path change
  - no claiming learning-guided intake when the fixed shell still controls real progression
- live verification requirement:
  - verify on `http://127.0.0.1:4011/?qa=1` that:
    - different product classes receive different learned question paths
    - weak or generic answers trigger clarification instead of progression
    - learning signals affect question choice or readiness
    - the final intake handoff into generation is visibly stronger
  - verify restore truth by revisiting the same project and proving the learned intake path does not silently reset
  - docs, contracts, summaries, or hidden state alone can never close this task
- implementation truth written on `2026-05-21`:
  - shared learning-guided onboarding logic now drives both the backend onboarding service and the live QA onboarding route
  - generic answers such as `לעסק` now visibly trigger sharper clarification instead of progression
  - landing-page onboarding now visibly holds on `successful-solution` when stored learning says `repair-before-expand`
  - Understanding now visibly receives a stronger learning-aware generation handoff from onboarding
- active blocker on `2026-05-21`:
  - the same QA onboarding route still resets to the opening question on revisit / reload instead of restoring the learned clarification path for the same project
  - this task cannot become `trueGreen` until restore truth survives on the same learned intake path

### W4-INTAKE-004 — Implement provider-backed canonical onboarding agent runtime

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `prepared-not-started`
- depends_on:
  - `W4-INTAKE-002`
  - `W4-INTAKE-003`
  - `W4-LEARN-002`
  - `W4-GEN-001`
- mission:
  - turn the adaptive onboarding system into a real provider-backed agent runtime that lets the user choose a model company while keeping one canonical Nexus rule layer above provider choice
- pass/fail truth:
  - pass if the live onboarding route runs through a real provider-backed agent runtime, the user can choose a provider/company, and the same Nexus intake rules still govern behavior across provider choice
  - fail if the system remains only:
    - local branching logic
    - model-call wiring without user-facing provider runtime truth
    - provider selector UI without real agent-led intake behavior
- continuity rules:
  - provider choice, active intake state, and approved intake truth must survive restore, revisit, rerun, and project resume without silently switching providers or dropping rule enforcement
- generation integration rules:
  - provider-backed intake may not emit free-form summaries only
  - it must preserve one canonical intake truth that later Generation and Understanding can consume
- provider integration rules:
  - Nexus rules must stay provider-agnostic even when:
    - the user selects OpenAI
    - the user selects Anthropic
    - additional providers are introduced later
  - provider choice must not remove class gates, readiness gates, clarification pressure, or bounded handoff rules
- explicit visible product change required:
  - the user can choose which provider/company to talk to on the live onboarding route
  - the live conversation visibly runs as a real onboarding agent rather than a fixed local script
  - the same onboarding constraints remain visible across at least two provider choices
- explicit prohibitions:
  - no docs-only closure
  - no contract-only closure
  - no hidden provider wiring without visible runtime behavior
  - no provider-specific rule drift
  - no free-form general chat mode that escapes Nexus intake constraints
- live verification requirement:
  - verify on `http://127.0.0.1:4011/?qa=1` that:
    - the user can select a provider/company on the live onboarding route
    - the onboarding agent visibly talks through the chosen provider runtime
    - the same Nexus intake rules remain active across provider choice
    - weak or generic answers still trigger bounded clarification rather than open-ended chat
  - verify restore truth by revisiting the same onboarding session and proving provider choice and canonical rule enforcement do not silently reset
  - docs, cards, contracts, provider selector UI, or hidden runtime state alone can never close this task

### W4-INTAKE-005 — Inject smart onboarding agent truth into canonical downstream system surfaces

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `prepared-not-started`
- depends_on:
  - `W4-INTAKE-003`
  - `W4-INTAKE-004`
  - `W4-GEN-001`
- mission:
  - ensure everything the smart onboarding agent learns becomes structured system truth that the correct Nexus surfaces actually consume instead of stopping at better questions or better handoff copy
- pass/fail truth:
  - pass if the learned intake is canonically injected into the correct downstream Nexus system surfaces and those surfaces visibly change behavior because of it
  - fail if the system only:
    - produces a better summary
    - improves handoff text
    - stores richer intake without downstream consumption
- continuity rules:
  - injected intake truth must survive restore, revisit, project resume, and transitions into downstream routes without silently mutating or resetting
- generation integration rules:
  - Generation must consume the injected structured intake truth directly instead of rebuilding weaker generic intent downstream
- provider integration rules:
  - the downstream injected truth must stay canonical and stable regardless of which provider/company the user selected during onboarding
- explicit visible product change required:
  - the live product must visibly show that smart onboarding truth is consumed by:
    - `Understanding`
    - `Generation`
    - `context builder`
    - `next-task / execution direction`
    - `proof expectations`
    - `continuation state`
  - later product behavior must be measurably smarter because of what the onboarding agent learned
- explicit prohibitions:
  - no docs-only closure
  - no contract-only closure
  - no summary-only closure
  - no hidden state injection without visible downstream effect
  - no claiming smart onboarding completeness when learned intake is not consumed by downstream Nexus systems
- live verification requirement:
  - verify on `http://127.0.0.1:4011/?qa=1` that the learned onboarding truth visibly changes downstream product behavior in the correct surfaces
  - verify that `Understanding`, `Generation`, `next-task`, `proof`, and `continuation` no longer behave like generic downstream consumers after onboarding completes
  - verify restore truth by revisiting the same project and proving the injected downstream truth stays attached to the same project identity
  - docs, contracts, cards, summaries, or hidden state alone can never close this task

### W4-AGENT-001 — Enforce minimum real product-conversation depth before understanding closure

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `prepared-not-started`
- depends_on:
  - `W4-INTAKE-003`
  - `W4-INTAKE-004`
  - `W4-INTAKE-005`
- mission:
  - prevent Nexus from accepting shallow product understanding by enforcing a real conversational depth threshold before the system can truthfully close product understanding and move forward
- pass/fail truth:
  - pass if the live agent continues when the product is still vague, thin, underspecified, or strategically weak, and visibly blocks premature understanding closure until enough signal exists for smart build direction
  - fail if the system only:
    - asks more than 3 questions
    - uses a larger branching tree
    - relies on longer copy
    - closes understanding without real back-and-forth clarification
- continuity rules:
  - the agent must preserve already-understood truth while continuing to clarify missing or weak parts instead of resetting the whole conversation
  - depth enforcement must survive refresh, restore, revisit, and project resume without collapsing into shallow acceptance
- generation integration rules:
  - Generation may not receive a `ready` handoff while the minimum conversation depth gate is still open
  - when the gate closes, Generation must receive stronger structured intent because of the deeper conversation
- explicit visible product change required:
  - the live product must visibly show that weak or underspecified conversations remain open
  - the agent must visibly keep clarifying instead of accepting an early shallow understanding
- explicit prohibitions:
  - no docs-only closure
  - no question-count-only closure
  - no provider-runtime-only closure
  - no copy-only closure
  - no hidden scoring threshold without visible behavior change
- live verification requirement:
  - verify on `http://127.0.0.1:4011/?qa=1` that:
    - a shallow answer sequence cannot truthfully close product understanding
    - the agent visibly continues the conversation when product understanding is weak
    - a stronger answer sequence can truthfully close once real product signal exists
  - verify restore truth by revisiting the same project and proving the open depth gate or closed depth gate remains stable

### W4-AGENT-002 — Add floating cross-Nexus product-conversation agent presence

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `prepared-not-started`
- depends_on:
  - `W4-INTAKE-004`
  - `W4-INTAKE-005`
  - `W4-AGENT-001`
- mission:
  - make the same project-aware product-conversation agent available across relevant Nexus surfaces instead of trapping it only inside onboarding
- pass/fail truth:
  - pass if the same project-grounded agent can be invoked from multiple relevant Nexus surfaces and stays anchored to canonical project truth
  - fail if the system only adds:
    - one floating button
    - one generic chat panel
    - one modal without grounded project understanding
- continuity rules:
  - the floating agent must preserve project identity, current understanding state, and prior clarifications across route changes, restore, revisit, and project resume
- generation integration rules:
  - when the floating agent clarifies product truth outside onboarding, that clarification must be able to flow back into the same canonical product understanding chain
- explicit visible product change required:
  - the user can visibly invoke the same project-aware agent from multiple relevant Nexus surfaces such as Understanding, workspace-facing execution areas, or continuation-facing surfaces
  - the agent must visibly answer from the active project’s truth rather than from generic chat context
- explicit prohibitions:
  - no launcher-only closure
  - no generic assistant panel
  - no free-form chat detached from project truth
  - no hidden runtime reuse without visible cross-surface invocation
- live verification requirement:
  - verify on `http://127.0.0.1:4011/?qa=1` that:
    - the same project-aware agent can be opened from multiple relevant Nexus surfaces
    - it remains grounded in the correct project truth
    - the user can ask for explanation or clarification after onboarding without reopening a separate generic flow
  - verify restore truth by changing routes and proving the same project conversation survives

### W4-AGENT-003 — Implement post-onboarding clarification and correction loop

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `prepared-not-started`
- depends_on:
  - `W4-INTAKE-005`
  - `W4-AGENT-001`
  - `W4-AGENT-002`
- mission:
  - let the user explicitly correct or refine what Nexus understood after onboarding, while reopening only the right product understanding area and propagating that correction to the correct downstream system surfaces
- pass/fail truth:
  - pass if the user can visibly say Nexus misunderstood something, the agent can reopen the right understanding area, and the corrected truth measurably changes downstream behavior
  - fail if the system only offers:
    - edit-summary controls
    - free text notes
    - hidden state mutation
    - corrections that do not change downstream Nexus behavior
- continuity rules:
  - correction history must survive restore, revisit, and project resume and remain attributable to the same project understanding chain
- generation integration rules:
  - corrected truth must update the downstream Generation-facing understanding instead of leaving stale intent active
- downstream injection rules:
  - corrected truth must flow into the correct relevant surfaces, including:
    - `understanding`
    - `generation`
    - `context builder`
    - `next-task / execution direction`
    - `proof expectations`
    - `continuation state`
    - `learning feedback loops`
- explicit visible product change required:
  - the user can visibly reopen and correct a misunderstood part of the product after onboarding
  - downstream Nexus behavior must visibly change because of that correction
- explicit prohibitions:
  - no notes-only closure
  - no summary-edit-only closure
  - no hidden propagation without visible downstream effect
- live verification requirement:
  - verify on `http://127.0.0.1:4011/?qa=1` that:
    - the user can explicitly say Nexus misunderstood a product detail
    - the agent reopens the correct product understanding area
    - corrected truth changes downstream behavior in the right surfaces
  - verify restore truth by revisiting the same project and proving the correction remains attached to the same project identity

### W4-AGENT-004 — Bring competitor and comparable-product intelligence into the live agent dialogue

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `prepared-not-started`
- depends_on:
  - `W4-INTAKE-004`
  - `W4-INTAKE-005`
  - `W4-AGENT-001`
  - `W4-AGENT-002`
  - `W4-AGENT-003`
- mission:
  - let the live product-conversation agent inspect relevant competitor and comparable-product patterns, then bring back bounded product suggestions into the dialogue that help the user think more sharply about their own product
- pass/fail truth:
  - pass if the live agent can surface relevant competitor/product observations tied to the user’s product class and product direction, and can suggest additions, omissions, or reconsiderations inside the live dialogue
  - fail if the system only shows:
    - static competitor cards
    - raw links
    - generic research summaries
    - disconnected notes outside the live dialogue
- continuity rules:
  - competitor/product observations must stay attributable to the same project and the same active product-conversation thread
  - this intelligence may not silently overwrite canonical product truth without user acceptance
- generation integration rules:
  - accepted competitor-inspired changes must be able to influence downstream product direction through the canonical understanding chain
- external intelligence integration rules:
  - competitor intelligence must remain bounded, product-relevant, and class-relevant
  - the agent may not degrade into generic open-ended market-research chat
  - imported observations must enter through the canonical product-conversation flow and remain explainable
- explicit visible product change required:
  - the live agent can visibly tell the user that similar products often include or avoid a certain pattern and suggest whether that pattern should be considered here
  - those observations must be tied to comparable products, not generic advice
- explicit prohibitions:
  - no research-note-only closure
  - no competitor-card-only closure
  - no raw browsing dump
  - no generic “best practices” output detached from comparable products
- live verification requirement:
  - verify on `http://127.0.0.1:4011/?qa=1` that:
    - the live agent can bring comparable-product observations into the dialogue
    - those observations are tied to the user’s product class and product direction
    - the agent can suggest additions, omissions, or reconsiderations based on comparable products
    - the conversation remains bounded and product-directed instead of degrading into generic research chat
  - verify restore truth by revisiting the same project and proving accepted competitor-driven clarifications remain attached to the project’s canonical understanding chain

### W4-GEN-002 — Implement feedback-driven product mutation loop

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `prepared-not-started`
- depends_on:
  - `W4-LEARN-002`
  - `W4-GEN-001`
  - `W4-INTAKE-002`
  - `W4-INTAKE-003`
  - `W4-INTAKE-005`
  - `W4-MBN-015`
- mission:
  - turn approved feedback, failures, reruns, release outcomes, and continuation outcomes into bounded later product mutations instead of passive recommendations
- pass/fail truth:
  - pass if later Nexus product iterations visibly mutate because of recorded prior outcomes and those mutations remain continuity-safe
  - fail if the system only recommends changes without driving later product behavior
- continuity rules:
  - mutation history must survive restore and remain attributable to the same project and decision chain
- generation integration rules:
  - feedback-driven mutation must enter through canonical generation and continuation paths, not side channels
- explicit visible product change required:
  - a later build, proof, or continuation route must visibly differ because of prior approved feedback or failure history
- explicit prohibitions:
  - no hidden mutation engine
  - no mutation based only on unapproved summaries
  - no docs-only closure

## Write-Back Rule

When this lane is added to canonical state:

- record it as `prepared-not-started`
- keep `W4-MBN-021` as the next active core task
- do not mark either prepared task as selected for implementation
- do not mark either prepared task as `trueGreen`

After Wave 4 core closes and this lane activates:

- update only the selected continuation task truthfully
- do not silently mark `W4-INTAKE-001` complete when only `W4-LEARN-001` closes
- keep visible proof requirements active for every continuation task
