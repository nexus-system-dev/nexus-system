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
- status: `trueGreen`
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
- closure truth written on `2026-05-21`:
  - the same learned onboarding conversation now survives restore / revisit on the QA onboarding route instead of being reset by sessionless bootstrap fallback
  - direct QA reopen on a saved clarification path now returns to the learned clarification question instead of the generic opening question
  - reload on that same route preserves the learned clarification path and keeps the project on the same learning-guided intake state
  - final visible proof now covers:
    - different product classes receiving different learned question paths
    - weak or generic answers triggering clarification instead of progression
    - learning signals affecting question choice and readiness
    - stronger Understanding / Generation handoff
    - restore truth on the same learned intake path

### W4-INTAKE-004 — Implement shell-level provider-backed canonical onboarding agent runtime

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `trueGreen`
- depends_on:
  - `W4-INTAKE-002`
  - `W4-INTAKE-003`
  - `W4-LEARN-002`
  - `W4-GEN-001`
- mission:
  - turn the adaptive onboarding system into a visible provider-runtime shell that lets the user choose a model company while keeping one canonical Nexus rule layer above provider choice
- pass/fail truth:
  - pass if the live onboarding route runs through a visible provider-runtime shell, the user can choose a provider/company, stale local QA restore can no longer bypass that shell, and the same Nexus intake rules still govern behavior across provider choice
  - fail if the system remains only:
    - local branching logic
    - model-call wiring without user-facing provider runtime truth
    - provider selector UI without real agent-led intake behavior
    - QA restore paths that can still reopen stale `mode: local` onboarding truth
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
  - the live conversation visibly runs through one provider-backed Nexus runtime shell rather than a fixed local script
  - the same onboarding constraints remain visible across at least two provider choices
- explicit prohibitions:
  - no docs-only closure
  - no contract-only closure
  - no hidden provider wiring without visible runtime behavior
  - no provider-specific rule drift
  - no free-form general chat mode that escapes Nexus intake constraints
  - no stale `qaState` restore that silently reopens local shell onboarding
- live verification requirement:
  - verify on `http://127.0.0.1:4011/?qa=1` that:
    - the user can select a provider/company on the live onboarding route
    - the onboarding agent visibly talks through the chosen provider runtime
    - the same Nexus intake rules remain active across provider choice
    - weak or generic answers still trigger bounded clarification rather than open-ended chat
  - verify restore truth by revisiting the same onboarding session and proving provider choice and canonical rule enforcement do not silently reset
  - docs, cards, contracts, provider selector UI, or hidden runtime state alone can never close this task
- implementation truth written on `2026-05-21`:
  - the onboarding service now exposes a shared provider runtime layer with canonical Nexus rule enforcement above provider choice
  - the live onboarding route now shows provider selection, provider runtime identity, and the canonical rule layer on the visible surface
  - switching providers updates the live runtime while preserving the same adaptive intake logic, learning-guided clarification pressure, readiness gates, and bounded handoff rules
  - provider metadata now stays attached to the backend conversation state, live transcript, and adapter view model instead of remaining hidden wiring
- closure truth written on `2026-05-21`:
  - the live QA onboarding route visibly lets the user switch between OpenAI and Anthropic while staying inside one canonical Nexus onboarding rule layer
  - after switching to Anthropic, a weak or generic answer like `לעסק` still triggers bounded clarification instead of generic open-ended chat
  - the provider-backed clarification state survives reload on the same QA route without silently resetting provider choice or dropping canonical rule enforcement
  - final visible proof now covers:
    - provider choice on the live onboarding route
    - visibly different provider runtime identity
    - stable canonical rule enforcement across provider choice
    - bounded clarification under provider-backed runtime
    - continuity-safe reload on the same provider-backed clarification path
- reality-audit correction written on `2026-05-21`:
  - `W4-INTAKE-004` may remain `trueGreen` only as shell-level provider runtime closure
  - repository reality still does not show real external OpenAI or Anthropic onboarding API call paths
  - repository reality still does not show onboarding provider auth, streaming, retry/backoff, rate-limit handling, failover, or token/cost accounting
  - real external provider integration therefore must not be claimed from `W4-INTAKE-004`
  - the live QA onboarding route now discards stale local `qaState` onboarding restore, seeds or rehydrates a provider-backed session instead, blocks false understanding completion while readiness stays blocked, and routes premature Understanding attempts back into the live conversation

### W4-INTAKE-006 — Connect onboarding agent to real external model provider APIs

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `trueGreen`
- depends_on:
  - `W4-INTAKE-004`
  - `W4-INTAKE-005`
- mission:
  - connect the onboarding agent shell to real external model provider APIs so Nexus can truthfully claim real provider-backed onboarding conversation instead of provider-labeled local behavior
- pass/fail truth:
  - pass only if Nexus can demonstrate at least one real external onboarding provider call path while still enforcing the canonical Nexus intake rules above provider choice
  - fail if the system still has only:
    - provider selector UI
    - provider identity metadata
    - local simulated provider runtime behavior
    - mocked tests without real provider request behavior
    - visible runtime labels without external model responses
- continuity rules:
  - real provider session identity, active provider choice, and canonical intake state must survive restore, revisit, reload, and project resume without silently downgrading to local shell behavior
- provider integration rules:
  - must include real OpenAI and/or Anthropic request wiring for onboarding
  - must include server-side auth / API key handling
  - must include provider error handling, retry/backoff, and rate-limit behavior
  - must include streaming or explicit non-streaming response behavior that the live route can prove visibly
  - must include token or cost accounting that can be attached to onboarding runtime truth
  - must preserve one canonical Nexus rule layer above provider choice
- explicit visible product change required:
  - the live onboarding route must visibly show real provider response behavior instead of local scripted provider shells
  - provider failure states must surface as real provider failures, not silent local fallbacks
  - the user must still experience one coherent onboarding agent rather than raw provider chat
- explicit prohibitions:
  - no docs-only closure
  - no contracts-only closure
  - no cards-only closure
  - no provider selector UI-only closure
  - no runtime metadata-only closure
  - no mocked provider responses
  - no hidden API path without visible product proof
- live verification requirement:
  - verify on `http://127.0.0.1:4011/?qa=1` that:
    - the onboarding route makes at least one real external provider-backed conversation call
    - provider auth and API key handling are genuinely active
    - real provider responses visibly drive the onboarding conversation
    - canonical Nexus intake rules still constrain the conversation above provider choice
    - refresh / revisit keeps the same real provider session family instead of downgrading to local shell behavior
  - docs, contracts, cards, metadata, hidden wiring, or local shell behavior alone can never close this task
- external dependency blockers recorded on `2026-05-21`:
  - `ANTHROPIC_API_KEY`

Closure truth on `2026-05-21`:
- Nexus now has one real external onboarding provider path through OpenAI on the live QA onboarding route
- the onboarding agent still enforces the canonical Nexus intake rules above provider choice while the next question is generated through the live OpenAI API path
- the visible onboarding surface now shows:
  - `Provider-backed runtime`
  - `OpenAI מחובר עכשיו דרך API חי`
  - `rules: nexus-onboarding-rules-v1 · mode: provider-backed-live`
  - live token accounting on the same route
- refresh on the QA onboarding route now survives through a compact storage-backed `qaState` envelope instead of failing with `HTTP 431`
- the same live provider-backed session family survives refresh without silently downgrading to local shell behavior
- Anthropic is still not available in this environment because `ANTHROPIC_API_KEY` is missing, but that no longer blocks truthful closure because this task requires at least one real external provider-backed onboarding path
- this closure does not by itself cover:
  - token-by-token visible streaming
  - automatic retry/failover continuity between providers on the same conversation turn
  - full production-safe onboarding runtime hardening

### W4-INTAKE-007 — Stream live provider responses through the onboarding conversation surface

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `trueGreen`
- depends_on:
  - `W4-INTAKE-005`
  - `W4-INTAKE-006`
- mission:
  - replace whole-response-only onboarding behavior with visible live response streaming so the user experiences the provider-backed onboarding agent as a real-time conversation instead of a delayed full-message drop
- pass/fail truth:
  - pass only if the live onboarding route visibly renders provider output incrementally during the same turn
  - fail if the system only:
    - waits and then drops a full answer
    - simulates streaming with fake timers over a fully completed answer
    - streams hidden transport events without visible conversational progression
- continuity rules:
  - a streaming provider response must survive refresh, reconnect, and route continuity without corrupting the active turn or silently downgrading to local shell behavior
- provider integration rules:
  - streaming must be backed by the real provider response path, not by replaying a completed local buffer
  - the canonical Nexus intake rule layer must stay in control of the question contract while the provider response is streamed visibly
- explicit visible product change required:
  - the user can visibly see the onboarding agent answer arrive incrementally on `http://127.0.0.1:4011/?qa=1`
  - the visible runtime family must still identify the active real provider while streaming is in progress
- explicit prohibitions:
  - no fake typing animation over precomputed text
  - no docs-only closure
  - no transport-only closure
  - no hidden SSE/websocket path without visible product proof
- live verification requirement:
  - verify on `http://127.0.0.1:4011/?qa=1` that:
    - at least one real provider-backed onboarding answer appears incrementally during the same turn
    - the streamed answer remains attached to the same live provider-backed conversation thread
    - refresh/revisit does not replace the streamed conversation family with a local-shell fallback
  - docs, metadata, hidden runtime events, or fake animation alone can never close this task
- closure truth:
  - the onboarding runtime now streams real provider deltas through the same live conversation turn instead of waiting and dropping a whole answer at once
  - the visible QA route shows in-turn pending response state, then lands in `provider-backed-live` with live provider accounting after the streamed answer closes
  - refresh continuity was repaired so the QA onboarding route reopens the same live onboarding conversation family after reload instead of collapsing back to `create`

### W4-INTAKE-008 — Add retry recovery and provider failover continuity to onboarding runtime

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `trueGreen`
- depends_on:
  - `W4-INTAKE-006`
  - `W4-INTAKE-007`
- mission:
  - make the onboarding runtime recover truthfully from provider failures by retrying when appropriate and failing over across providers when the active provider becomes unavailable, without breaking the same conversation turn or project understanding chain
- pass/fail truth:
  - pass only if the live onboarding route can survive a retryable provider failure and, when configured, continue through a truthful provider failover path without forcing the user into a broken or reset conversation
  - fail if the system only:
    - retries invisibly without visible conversational continuity proof
    - shows a generic error and stops
    - forces the user to restart onboarding manually
    - claims failover readiness without same-thread continuity
- continuity rules:
  - retry and failover behavior must preserve project identity, active onboarding thread, canonical intake state, and already-understood truth
  - failover may not silently mutate the product understanding chain or reopen as a generic new chat
- provider integration rules:
  - retry policy must distinguish retryable provider failures from hard failures
  - failover must be explicit, provider-aware, and bounded to real configured providers such as OpenAI and Anthropic
  - provider switching during failover must remain inside one canonical Nexus onboarding rule layer
- explicit visible product change required:
  - the live route must visibly survive at least one retryable failure without dropping the conversation
  - when the active provider is unavailable, the route must visibly continue through the alternate provider path or surface a truthful bounded fallback state
- explicit prohibitions:
  - no error-only closure
  - no hidden retry loop without visible continuity proof
  - no provider reset that discards the active conversation truth
  - no claimed failover based on unrelated platform failover scaffolding outside onboarding runtime
- live verification requirement:
  - verify on `http://127.0.0.1:4011/?qa=1` that:
    - a retryable provider failure can recover without breaking the same onboarding conversation
    - a provider outage can truthfully route into the alternate provider path when configured
    - the same project truth survives retry/failover instead of resetting to local shell or generic chat
  - docs, health cards, hidden orchestration, or backend retry logs alone can never close this task
- closure truth on `2026-05-21`:
  - the live onboarding route now survives a real retryable provider failure without dropping the same conversation turn, same project truth, or the canonical intake state
  - the live onboarding route now survives a real provider outage by visibly failing over from `Anthropic` to `OpenAI` on the same onboarding thread instead of forcing a reset or generic error stop
  - the visible QA route now shows bounded retry and failover continuity states on the same conversation surface:
    - `Anthropic נכשל זמנית. מנסים שוב אוטומטית ...`
    - `Anthropic לא השלים את התשובה. עוברים אוטומטית ל־OpenAI ...`
  - after failover, the same onboarding conversation advances to the next question while preserving the same understood project truth instead of reopening as local shell or generic new chat
  - refresh now reopens the same onboarding conversation family at the same progressed question instead of collapsing back to `create` or losing the failover-survived thread
  - this closure covered retry/failover continuity itself; the broader production-safe runtime hardening was tracked separately in `W4-INTAKE-009` and is now closed with its own live proof

### W4-INTAKE-009 — Harden onboarding provider runtime to production-safe operation

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `trueGreen`
- depends_on:
  - `W4-INTAKE-006`
  - `W4-INTAKE-007`
  - `W4-INTAKE-008`
- mission:
  - harden the onboarding provider runtime so it can be treated as a real product runtime rather than a demo-grade integration, including production-safe key handling, provider error behavior, rate-limit handling, continuity guarantees, and usage/cost/runtime observability
- pass/fail truth:
  - pass only if the onboarding runtime is truthfully safe to describe as product-grade for ongoing real usage
  - fail if the system still behaves like:
    - a demo integration
    - a single-happy-path provider hookup
    - a runtime with weak failure handling or weak operational visibility
- continuity rules:
  - project truth, conversation truth, provider identity, and usage state must remain stable across restore, refresh, revisit, deploy, and repeated real usage
- provider/runtime hardening rules:
  - must include production-safe API key handling and provider auth validation
  - must include bounded rate-limit behavior
  - must include stable provider error classification
  - must include visible usage and cost/runtime accounting that remains attributable to the onboarding thread
  - must include truthful runtime-state surfaces so Nexus does not overclaim production readiness early
- explicit visible product change required:
  - the live route must visibly behave like a stable runtime under repeated real usage rather than a one-off happy path
  - operator-visible runtime truth must exist for provider availability, usage/cost state, and bounded degraded-mode behavior
- explicit prohibitions:
  - no env-key-only closure
  - no one-provider-happy-path-only closure
  - no invisible ops-hardening claim without product proof
  - no claiming production-safe runtime before streaming, retry/failover continuity, and rate-limit/error behavior are all covered truthfully
- live verification requirement:
  - verify on `http://127.0.0.1:4011/?qa=1` that:
    - the runtime still behaves coherently under repeated real onboarding turns
    - usage/cost/runtime truth is visibly attributable to the live onboarding runtime
    - degraded states remain bounded and truthful instead of collapsing to local shell or silent breakage
  - verify repository reality includes production-facing provider auth/error/rate-limit/accounting logic rather than demo-only request wiring
  - docs, keys, screenshots, or single-turn happy-path proof alone can never close this task
- closure truth:
  - repeated real onboarding turns now stay on the live provider-backed route without premature degradation after the first successful call because provider timeout recovery is retried and bounded instead of being treated like a terminal single-turn failure
  - the live onboarding surface now shows runtime-state truth directly on the product surface, including provider availability, usage totals, estimated cost accounting, and operator-facing health/runtime attribution for the active onboarding thread
  - bounded degraded mode is now visibly real on the live QA route under rate-limit pressure, including `provider-backed-degraded`, explicit rate-limit classification, retry timing, and truthful fallback language instead of fake live success or silent local-shell collapse
  - refresh/reopen continuity survives on the same onboarding conversation family in both healthy and degraded runtime states, so the live thread, project truth, and runtime truth remain attached to the same session after revisit
  - this closure covers production-safe onboarding runtime hardening itself; user-facing provider/model/intelligence controls remain open in `W4-INTAKE-010`

### W4-INTAKE-010 — Expose user-facing provider, model, and intelligence controls on the onboarding agent

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `trueGreen`
- depends_on:
  - `W4-INTAKE-006`
  - `W4-INTAKE-007`
  - `W4-INTAKE-008`
  - `W4-INTAKE-009`
- mission:
  - make the onboarding runtime configurable by the user through truthful visible controls for provider choice, model choice, and bounded intelligence level, instead of leaving runtime selection hidden in env vars, defaults, or developer-only switches
- pass/fail truth:
  - pass only if the live onboarding surface lets the user visibly choose and understand:
    - which provider is active
    - which model family is active
    - which bounded intelligence/reasoning level is active
  - fail if the system only:
    - exposes provider selection without model/intelligence control
    - exposes labels that do not actually affect runtime behavior
    - hides real runtime selection behind internal config while showing decorative UI
- continuity rules:
  - the selected provider/model/intelligence configuration must survive restore, refresh, revisit, and resume on the same onboarding thread
  - changing these controls may not silently break the project understanding chain or reopen a generic local-shell conversation
- runtime control rules:
  - controls must remain truthful to real available runtime options
  - unavailable providers/models must surface as unavailable, not as fake selectable options
  - intelligence controls must remain bounded to canonical Nexus behavior rather than exposing raw provider personalities
  - visible runtime labels must always reflect the actual live selection in use for the current conversation turn
- explicit visible product change required:
  - the live onboarding route must visibly expose user-facing runtime controls similar in spirit to model/intelligence pickers
  - the user must be able to switch among truthful runtime options and see that the active conversation remains attached to the selected runtime family
  - the visible surface must explain the tradeoff at least at a lightweight level such as speed vs depth/capability
- explicit prohibitions:
  - no env-only closure
  - no hidden admin-only runtime controls
  - no fake model menu detached from actual provider behavior
  - no exposing internal engineering labels without user-facing meaning
  - no claiming user runtime control completeness while intelligence/model/provider selection still cannot survive continuity
- live verification requirement:
  - verify on `http://127.0.0.1:4011/?qa=1` that:
    - provider, model, and intelligence controls are visibly available to the user
    - the selected runtime remains truthful after refresh/revisit
    - switching among available options keeps the same coherent onboarding conversation family instead of breaking into local fallback or generic reset
    - unavailable options surface truthfully as unavailable
  - docs, screenshots, static menus, or hidden config alone can never close this task

Progress truth on `2026-05-22`:
- the live onboarding route now visibly exposes three user-facing runtime controls on the same product surface:
  - provider
  - model family
  - bounded intelligence / reasoning depth
- the selected provider / model / intelligence combination now survives refresh on the same backend onboarding session family instead of resetting to a decorative default
- the same onboarding conversation thread now stays coherent after switching:
  - `OpenAI -> Anthropic`
  - `balanced -> deep`
  - `medium -> high`
- the live surface now explains the active runtime tradeoff in lightweight user-facing language instead of hiding it behind backend-only provider labels
- closure truth on `2026-05-22`:
  - the live QA rerun on `http://127.0.0.1:4011/?qa=1` with `qaOnboardingAvailability=anthropic-missing-key` now surfaces an unavailable runtime option truthfully on the visible onboarding surface
  - `Anthropic` renders as a disabled user-facing option with `ANTHROPIC_API_KEY` visible in the option label and in the runtime availability line
  - `OpenAI` remains the active selectable provider on the same session family instead of collapsing into local fallback or fake dual availability
  - refresh preserves the same unavailable-option truth, the same selected live provider, and the same visible runtime controls after restore
  - this closes the last missing live-verification gap for provider/model/intelligence user controls
  - a live visible rerun on `127.0.0.1:4011` where at least one unavailable runtime option is surfaced as unavailable to the user instead of only being covered by repository logic/tests

### W4-INTAKE-005 — Inject smart onboarding agent truth into canonical downstream system surfaces

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `trueGreen`
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

Closure truth on `2026-05-21`:
- downstream projection wiring now exists in `web/app.js` and the Understanding adapter can derive stronger artifact expectations from the onboarding conversation itself
- stale QA restore no longer closes the path immediately at the old local shell boundary
- live QA now reaches:
  - provider-backed onboarding
  - Understanding after completion
  - Loop after understanding confirmation
- live QA now holds one stable downstream truth across surfaces from the same completed onboarding conversation:
  - `Understanding` resolves to `Landing page` / `My SaaS App landing page`
  - `Loop` stays on `My SaaS App landing page`
  - `Next Task` stays attached to `My SaaS App landing page`
  - `Proof` stays attached to `My SaaS App landing page`
- the stale `follow-up dashboard` drift was closed by forcing derived onboarding artifact truth to override conflicting stale handoff artifact truth before downstream injection

### W4-AGENT-001 — Enforce minimum real product-conversation depth before understanding closure

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `trueGreen`
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

Closure truth on `2026-05-21`:
- Nexus no longer closes `Understanding` on `audience + problem` or `audience + problem + generic solution` alone
- the canonical conversation now requires one more explicit `build-direction` depth signal before the handoff can become `ready`
- the live QA route proved a shallow landing-page path stays on `Onboarding` with the `build-direction` question still open
- the same QA route proved refresh/revisit keeps that same open depth gate on the same backend conversation instead of collapsing back to shallow acceptance
- after a stronger `build-direction` answer, the same session truthfully opened `Understanding`
- `finish` stayed `blocked` while the depth gate was open and returned `ready` only after the stronger depth signal existed

### W4-AGENT-001A — Enforce co-founder-style exploratory product reasoning before understanding closure

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `trueGreen`
- depends_on:
  - `W4-INTAKE-004`
  - `W4-INTAKE-005`
  - `W4-AGENT-001`
  - `W4-INTAKE-009`
  - `W4-INTAKE-010`
- purpose:
  - make Nexus behave like a bounded thinking partner on ambiguous product ideas before `Understanding` closes, so the system can evolve the product thesis instead of collapsing too early into one template-shaped build path
- why_it_exists:
  - repository-canonical investigation already showed a missing capability between shallow adaptive questioning and later cross-surface agent presence
  - Nexus can already ask smarter questions and hold downstream truth better, but it still lacks a canonical capability for exploring more than one product framing, challenging weak assumptions, surfacing tradeoffs, and evolving the product thesis before the system commits the project understanding
- what_truth_it_owns:
  - exploratory product reasoning before understanding closure
  - bounded co-founder-style behavior that can:
    - think with the user about an ambiguous product idea
    - explore more than one possible framing
    - challenge weak assumptions
    - surface tradeoffs
    - evolve the product thesis before `Understanding` closes
  - propagation of that evolved reasoning into the same canonical downstream truth chain used by `Understanding`, `Loop`, `Next Task`, and later agent surfaces
- what_it_is_not:
  - not just asking more questions
  - not just increasing onboarding depth
  - not just storing more memory
  - not just adding provider intelligence
  - not just showing competitor or comparable-product data
  - not just correcting answers after the fact
  - not free-form general brainstorming detached from canonical project truth
- pass/fail truth:
  - pass if the live agent can stay product-grounded while exploring alternative framings, explicitly challenge weak assumptions, surface meaningful tradeoffs, and only then close `Understanding` on a stronger evolved product thesis
  - fail if the system only:
    - asks more questions without changing the reasoning quality
    - collects more fields without exploring alternatives
    - collapses into one template-shaped product path too early
    - shows co-founder-style copy without actual exploratory reasoning behavior
- continuity rules:
  - the exploratory reasoning chain must survive refresh, restore, revisit, and project resume without silently collapsing back to the earlier weaker framing
  - if the agent explores multiple candidate framings, the winning framing and rejected tradeoffs must remain attributable to the same project understanding chain
- downstream dependents:
  - `W4-AGENT-002`
  - `W4-AGENT-003`
  - `W4-AGENT-004`
- visible proof required before future `trueGreen`:
  - the live product must visibly show Nexus exploring more than one plausible framing when the idea is ambiguous
  - the live product must visibly challenge at least one weak assumption or expose at least one real tradeoff before `Understanding` can close on the ambiguous case
  - the final `Understanding` state must visibly reflect the evolved product thesis rather than the earliest weak framing
  - `Loop` and `Next Task` must visibly stay attached to that evolved thesis after closure
- failure mode if omitted:
  - Nexus will keep closing product understanding too early on thin or template-shaped assumptions
  - downstream `Understanding`, `Loop`, and `Next Task` truth will stay structurally weaker because the product thesis never evolved before closure
  - later agent surfaces will inherit a prematurely collapsed product direction and become better presenters of a weak thesis instead of better product partners
- live verification requirement:
  - verify on `http://127.0.0.1:4011/?qa=1` that:
    - an ambiguous product idea triggers exploratory reasoning instead of immediate template classification
    - Nexus can surface multiple plausible framings or strategic directions while staying bounded to the project
    - Nexus can challenge weak assumptions or expose tradeoffs before `Understanding` closes
    - once closure happens, the evolved reasoning survives into `Understanding`, `Loop`, and `Next Task`
  - docs, extra questions, provider labels, or hidden reasoning state alone can never close this task

Closure truth on `2026-05-22`:
- the live onboarding wrapper now behaves like a product-thinking partner instead of a field-collection wizard while the backend reasoning stays bounded to the same project
- on a live delivery-app scenario, Nexus stayed on the logistics app direction, asked who uses it in the field, and kept unresolved workflow questions under `מה חסר` instead of pretending the product was already understood
- on a live internal-tool scenario, Nexus asked who lives inside the tool every day and stayed inside that product class instead of collapsing into landing-page or generic SaaS framing
- on a live landing-page scenario, Nexus kept the conversation class-appropriate without leaking delivery or internal-tool wrapper copy
- visible wrapper copy stopped using generic lines like `השאלה הזו סוגרת את הפער` and now reads like a human product-thinking partner
- refresh on the live QA route preserved the same backend conversation family and the same open clarification question instead of downgrading into the older template path
- runtime controls remain visible by canonical requirement from `W4-INTAKE-010`, but they no longer dominate the conversation or leak technical onboarding language into the product-thinking flow

### W4-AGENT-002 — Add floating cross-Nexus product-conversation agent presence

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `trueGreen`
- depends_on:
  - `W4-INTAKE-004`
  - `W4-INTAKE-005`
  - `W4-AGENT-001`
  - `W4-AGENT-001A`
  - `W4-INTAKE-009`
  - `W4-INTAKE-010`
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

Closure truth on `2026-05-22`:
- Nexus now exposes the same floating project-conversation agent from multiple relevant live surfaces instead of trapping product clarification inside onboarding only
- on the live `loop` surface at `http://127.0.0.1:4011/loop`, the floating dock opens a project-grounded panel that answers from the active project truth instead of generic chat context
- on the live `timeline` surface at `http://127.0.0.1:4011/timeline`, the same panel reopens against the same project identity and carries the same clarification thread forward
- the panel stays tied to the active project understanding and visible missing/understood truth rather than detaching into a generic assistant
- route change from `loop` to `timeline` preserved the same open project-conversation surface and the same project-grounded clarification context
- refresh on `timeline` preserved the same floating project conversation, including the later clarification turn (`מה כבר ברור?`) and the grounded answer anchored to the project goal
- the live product now has visible cross-surface invocation, visible grounded answers, and visible route/refresh continuity, which closes the task truthfully

### W4-AGENT-003 — Implement post-onboarding clarification and correction loop

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `trueGreen`
- depends_on:
  - `W4-INTAKE-005`
  - `W4-AGENT-001`
  - `W4-AGENT-001A`
  - `W4-AGENT-002`
  - `W4-INTAKE-009`
  - `W4-INTAKE-010`
- mission:
  - let the user explicitly correct or refine what Nexus understood after onboarding, while reopening only the right product understanding area and propagating that correction to the correct downstream system surfaces
- research input:
  - `docs/operating-system/wave4-competitive-conversation-engine-research-2026-05-22.md`
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
- research-informed closure requirements on `2026-05-22`:
  - if the user says `המשתמש זה אני`, the same project-understanding chain must resolve the speaker correctly and rewrite visible summaries/follow-ups in the right body/person instead of emitting robotic third-person restatements
  - if the user says `לקוח שלי`, the same correction loop must visibly disambiguate:
    - business owner
    - operator
    - end customer
    - or speaker-as-user
  - weak actor answers may not harden into `מה הבנתי`
  - correction must rewrite `מה הבנתי` / `מה חסר` visibly on the same conversation family, not only mutate hidden state
  - refresh/revisit may not rehydrate the older wrong actor truth after the correction
  - visible correction copy must sound like a human clarification partner, not like a field patch or summary editor

Closure truth on `2026-05-22`:
- the live floating product-conversation agent on `http://127.0.0.1:4011/loop` now accepts explicit post-onboarding correction turns instead of falling back to generic local clarification copy
- when the user says `המשתמש זה אני`, the same visible companion surface rewrites the downstream understanding truth to `המשתמש המרכזי: אתה בעצמך`
- the same correction turn visibly reopens the right missing area and rewrites the follow-up from actor clarification to the next real product gap instead of treating `אני` as a third-person audience label
- the visible agent reply now acknowledges the perspective correction in human Hebrew (`אני מעדכן שאתה בעצמך המשתמש המרכזי...`) rather than a robotic summary patch
- the QA preview/continuation path now routes post-onboarding correction through the real onboarding session when the downstream project is only a preview shell, instead of dying on a fake `projectId` and falling back to local filler
- compact QA restore now preserves the corrected onboarding summary so the same corrected truth remains visible after refresh on the same downstream surface
- live rerun proof on a fresh QA session family showed:
  - `/loop` companion open
  - user turn `המשתמש זה אני`
  - visible `מה כבר ברור`: `רעיון מרכזי: שם הפרויקט: My SaaS App להכין ניסוי ראשון לרכישת משתמשים · המשתמש המרכזי: אתה בעצמך`
  - visible `מה עוד צריך לחדד`: actor ambiguity disappeared and the next real product gaps stayed open
  - visible human correction reply
  - refresh on the same `/loop` surface preserved the corrected truth and the correction transcript

### W4-AGENT-004 — Bring competitor and comparable-product intelligence into the live agent dialogue

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `trueGreen`
- depends_on:
  - `W4-INTAKE-004`
  - `W4-INTAKE-005`
  - `W4-AGENT-001`
  - `W4-AGENT-001A`
  - `W4-AGENT-002`
  - `W4-AGENT-003`
  - `W4-INTAKE-009`
  - `W4-INTAKE-010`
- mission:
  - let the live product-conversation agent inspect relevant competitor and comparable-product patterns, then bring back bounded product suggestions into the dialogue that help the user think more sharply about their own product
- research input:
  - `docs/operating-system/wave4-competitive-conversation-engine-research-2026-05-22.md`
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
- closure truth on `2026-05-23`:
  - added a hidden comparable-product intelligence pack per supported family for the live companion path
  - wired that pack into the provider-backed companion prompt so similar-product observations enter the dialogue as bounded product thinking instead of a raw research dump
  - added shell fallback parity so the same family-bound observations still surface when provider execution degrades
  - extended post-onboarding correction so explicit wrapper decisions like `בגרסה הראשונה צריך...` and workflow decisions like `אחרי הסריקה...` can write back into the canonical understanding chain
  - regression coverage proves:
    - provider companion payload contains bounded comparable-product intelligence
    - storefront companion replies surface the right wrapper decisions
    - accepted comparable-product decisions reopen and update canonical truth
  - repaired non-QA route restore so stored project/session context can reopen:
    - a project-backed `/loop` surface with the floating companion visibly reachable
    - a project-backed `/understanding` surface with the floating companion visibly reachable
  - verified refresh continuity on the restored `/loop` surface while preserving the comparable-product transcript in the companion
  - the blocker recorded earlier for blocked `/loop` / QA fallback restore is now closed
- research-informed execution import on `2026-05-22`:
  - imported patterns must not enter Nexus as raw inspiration or static notes
  - each imported pattern must be translated through:
    - `Nexus rule`
    - `product-family branch behavior`
    - `understood vs missing rule`
    - `closure blocker`
    - `live scenario`
  - the external products that most clearly inform this task are:
    - Lovable
    - v0
    - Bolt
    - Replit Agent
    - Firebase Studio
  - the strongest imported patterns are:
    - hidden structured project memory instead of repeated visible intake
    - silent default inference before visible clarification
    - optional planning/spec mediation instead of wizard-only questioning
    - cheap correction loops
    - human-facing summaries layered on top of hidden structure instead of exposing internal reasoning traces

### W4-AGENT-004A — Convert external product-conversation patterns into Nexus product-family wrapper packs

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `architecture`
- status: `trueGreen`
- depends_on:
  - `W4-AGENT-004`
- mission:
  - turn external conversation/build patterns into one Nexus wrapper pack per supported product family so the live agent stops sounding generic once the product family is clear
- deliverable truth:
  - each family pack must include:
    - core disambiguation questions
    - wrapper decisions
    - weak-answer traps
    - summary truth rules
    - closure blockers
- required families:
  - `storefront`
  - `marketplace`
  - `booking`
  - `crm`
  - `internal-tool`
  - `saas`
  - `ops-logistics`
  - `services-content`
  - `admin-dashboard`
- explicit prohibitions:
  - no one-size-fits-all questioning layer
  - no imported pattern without family-specific closure rules
  - no family pack that lacks live scenarios and weak-answer traps
- live verification requirement:
  - the live onboarding route must visibly show different wrapper questions, different `מה חסר` truth, and different closure blockers per family on the same QA route without falling back to generic intake phrasing

Progress truth on `2026-05-23`:
- storefront now runs with an explicit momentum-oriented wrapper pack instead of generic intake pacing
- the live storefront route now infers baseline v1 structure up front:
  - `קטלוג מוצרים`
  - `עגלת קניות`
  - `סליקה`
  - `מלאי בסיסי`
  - `משלוחים`
  - `אזור ניהול בסיסי`
- the live storefront route now asks the first high-leverage fork instead of enumerating obvious ecommerce basics
- the live storefront summary now keeps `מה חסר` on meaningful ambiguity:
  - customer-buying focus vs operator focus
  - simple store vs smarter selection experience
  - real pain beyond what a standard storefront already does
- refresh continuity on the live storefront route preserved the inferred structure and the same next ambiguity
- the live storefront shell now humanizes:
  - summary card headings
  - helper explanation panels
  - side-card empty states
  - processing copy
  - restore wording
  - failover wording
- the live logistics companion shell on `/loop` now humanizes:
  - dock copy
  - panel eyebrow
  - understood / missing framing
  - opening line
  - composer placeholder
- refresh continuity on the live logistics companion surface preserved the same humanized shell after reopen
- the live onboarding shell now hides provider/model/runtime controls by default inside the normal conversation route
- the live onboarding shell now replaces visible runtime instrumentation with one human continuity line instead of:
  - `שיחה דרך`
  - `מודל`
  - `עומק חשיבה`
- the live storefront onboarding route no longer leaks the technical strip after route load
- the live `/loop` companion surface still stays clean after refresh continuity

Closure truth on `2026-05-23`:
- the live onboarding route now proves family-specific wrapper behavior across the required multi-family sweep:
  - `marketplace`
  - `logistics`
  - `CRM`
  - `booking`
  - `dashboard`
- in each of those live scenarios:
  - the first visible question is family-correct
  - the second visible question stays inside family-specific ambiguity instead of collapsing back to generic intake
  - the visible summary reflects inferred family structure rather than generic SaaS/form phrasing
  - the visible `מה שעוד לא סגור לי` block stays family-specific
  - refresh preserves the same product-family truth without stale preview/session leakage
- the remaining tone work is no longer a family-pack rollout blocker; it belongs to the next task that derives pacing/tone rules from the external product-intelligence pass

### W4-AGENT-004B — Derive live conversational tone and pacing rules from external product intelligence

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `architecture`
- status: `trueGreen`
- depends_on:
  - `W4-AGENT-004`
- mission:
  - derive one canonical human-conversation contract for pacing, inference, apology/reframe behavior, and summary language so Nexus stops sounding like a wizard even when the hidden reasoning is structured
- deliverable truth:
  - one canonical tone/pacing contract must define:
    - one-question-at-a-time rhythm
    - when silent inference is allowed
    - when clarification is mandatory
    - when the agent should challenge a weak assumption
    - when the agent should apologize and reframe
    - how summaries rewrite hidden structure into human Hebrew
    - forbidden technical/robotic phrasing
- explicit prohibitions:
  - no technical/internal wording on user-facing surfaces
  - no visible reasoning-trace copy
  - no body/person mismatch in summaries or follow-up questions
- live verification requirement:
  - verify on `http://127.0.0.1:4011/?qa=1` that:
    - the live agent sounds human across product families
    - `זה אני`, `לקוח שלי`, and similar role statements are reflected in the correct body/person
    - the system no longer emits wizard-like or robotic summary phrasing while preserving the same structured truth underneath
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-24`
  - canonical contract path:
    - `docs/operating-system/wave4-live-conversational-tone-and-pacing-contract.md`
  - governing implementation anchors:
    - `web/shared/live-conversation-tone-contract.js`
    - `web/nexus-ui/adapters/onboarding-adapter.js`
    - `web/nexus-ui/adapters/understanding-adapter.js`
    - `web/nexus-ui/screens/SmartOnboardingScreen.js`
    - `web/nexus-ui/screens/UnderstandingSummaryScreen.js`
    - `src/core/onboarding-service.js`
    - `web/app.js`
  - tests:
    - `test/onboarding-adapter.test.js`
    - `test/onboarding-service-conversation.test.js`
    - `test/smart-onboarding-screen-render.test.js`
    - `test/understanding-summary-screen-render.test.js`
  - visible closure proof:
    - the live storefront onboarding route now opens with a momentum-based commerce question, keeps the surrounding shell human, and treats `לקוח שלי` as unresolved actor truth instead of hardening it
    - the live CRM onboarding route now reflects `המשתמש זה אני` in the correct body/person on visible Nexus copy instead of leaking raw self-reference into Nexus-owned phrasing
    - the live `/understanding` route now preserves CRM truth, carries `אתה בעצמך` / `עבורך`, and no longer falls back to stale `Landing page` expectation on restore
  - closure truth on `2026-05-24`:
    - the one-question rhythm is now governed by one shared live tone contract instead of ad hoc screen copy
    - silent inference, clarification, challenge, apology/reframe, and summary rewrite rules are now canonical and shared across onboarding and understanding surfaces
    - visible Nexus copy no longer leaks technical runtime phrasing, visible reasoning traces, or body/person mismatches on the validated live routes
    - the same structured hidden truth now rewrites into human Hebrew across the live storefront and CRM verification paths without breaking continuity

### W4-AGENT-005A — Define conversation-first entry foundation contract and route ownership

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `architecture`
- status: `trueGreen`
- depends_on:
  - `W4-INTAKE-002`
  - `W4-INTAKE-005`
  - `W4-AGENT-003`
  - `W4-AGENT-004A`
  - `W4-AGENT-004B`
- mission:
  - canonically replace `create -> onboarding` as the default Nexus entry direction with a staged conversation-first foundation plan that preserves adaptive intake intelligence while preventing a broken or generic front-door downgrade
- pass/fail truth:
  - pass only if one canonical contract now defines:
    - replacement-first front-door rules
    - route ownership for the future default conversation entry
    - hidden project/session/brief bootstrap expectations
    - one canonical conversation truth-store rule
    - durability / idempotency / restore / stale-state isolation requirements
    - the structural Figma threshold before demoting the old front door
    - explicit decomposition into later implementation tasks
  - fail if the pivot remains only:
    - an open-ended prompt
    - a route-hiding idea
    - a generic “chat first” suggestion with no canonical ordering or protection rules
- explicit prohibitions:
  - no demoting the current create/onboarding front door before a replacement exists
  - no stuffing this pivot into `W4-GEN-002`
  - no broad implementation before the structural threshold is recorded
  - no generic AI-chat downgrade that loses Nexus product identity
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-24`
  - canonical contract path:
    - `docs/operating-system/wave4-conversation-first-entry-foundation-contract.md`
  - governing implementation anchors:
    - `docs/wave3-canonical-state.json`
    - `docs/operating-system/wave4-post-wave4-learning-intake-continuation-lane.md`
    - `docs/operating-system/wave4-minimum-believable-core-planning-track.md`
  - closure truth on `2026-05-24`:
    - the canonical task order was corrected so the entry pivot now executes before `W4-GEN-002`
    - the pivot is now decomposed into explicit follow-on tasks for:
      - Figma-backed structural entry design
      - hidden bootstrap implementation
      - durability / restore / idempotency hardening
      - downstream Understanding continuity
      - later entry-to-live-skeleton continuity
    - the replacement-first guardrail is now canonical, so the current front door may not be weakened before the new Nexus-grade entry exists

### W4-AGENT-005B — Run Figma-backed primary entry shell structural pass

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `figma-design-pass`
- status: `trueGreen`
- depends_on:
  - `W4-AGENT-005A`
- mission:
  - define the replacement conversation-first front door as a real Nexus shell surface before route demotion or structural implementation begins
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-24`
  - Figma artifact:
    - `https://www.figma.com/design/MWqO2iBi3NGgxuTcl6s0Wy`
  - visible structural states now defined in the artifact:
    - `State 01 / Empty conversation front door`
    - `State 02 / Hidden bootstrap after first turn`
    - `State 03 / Clarification with progressive reveal`
    - `State 04 / Migration-safe fallback`
  - closure truth on `2026-05-24`:
    - the replacement front door now has a Figma-backed shell contract instead of only prose
    - the artifact explicitly defines hidden bootstrap, progressive reveal, and migration-safe fallback behavior
    - the route flip remains forbidden until the later implementation tasks produce live product proof

### W4-AGENT-005C — Implement conversation-first front door with hidden project/session/bootstrap

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `trueGreen`
- depends_on:
  - `W4-AGENT-005A`
  - `W4-AGENT-005B`
- mission:
  - build the first live replacement front door without visible setup ritual while keeping old entry paths available as fallback
- closure on `2026-05-24`:
  - `/` now renders a Nexus-grade conversation-first front door instead of a visible project-create ritual
  - the primary surface now leads with one idea field, one `התחל עם Nexus` action, drag-or-plus file intake inside the conversation composer, and manual fields behind secondary disclosure
  - `createFirstProjectFlow()` now accepts idea-first entry, derives a project name when absent, seeds the first user idea into onboarding truth, and marks the flow as `conversation-first`
  - restore hardening in `persistFlowState()` now preserves the live onboarding project/session/conversation truth instead of letting early restore writes degrade it
  - the old manual fields remain available as fallback and were not demoted or removed before the replacement front door proved itself live
- live closure proof:
  - visible front door proof on `http://127.0.0.1:4011/` now starts from the conversation-first composer instead of a setup ritual
  - a real first message (`אני רוצה מערכת שמנהלת לידים ומוודאת שלא מפספסים follow-up`) now submits into a live onboarding session and opens the CRM / follow-up first question
  - refresh on the live `onboarding?nexusState=...` route now restores the same onboarding conversation, same session-backed question, and same summary/missing truth instead of collapsing to `אין onboarding פעיל לשחזור`
  - the route/restore proof was revalidated after fixing the top-level audience copy helpers and after making `persistFlowState()` preserve stored onboarding truth during early restore writes

### W4-AGENT-005D — Harden durability, idempotency, restore, and stale-state isolation on the new entry path

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `trueGreen`
- depends_on:
  - `W4-AGENT-005C`
- mission:
  - make the new conversation-first path trustworthy under delay, refresh, retry, and new-project switching
- closed_at: `2026-05-24`
- closure evidence:
  - `web/app.js`
  - `test/project-adapter.test.js`
  - `test/project-create-screen-render.test.js`
  - `docs/wave3-canonical-state.json`
  - `docs/operating-system/wave4-post-wave4-learning-intake-continuation-lane.md`
  - `docs/operating-system/wave4-minimum-believable-core-planning-track.md`
- live closure proof:
  - a fresh `/` entry now survives reload as `create` without rehydrating an older onboarding session, project id, or companion truth
  - the conversation-first send path now disables the send and file-picker controls immediately so a second retry click cannot create a second canonical first turn while bootstrap is in flight
  - a real first-message submit on `http://127.0.0.1:4011/` still opens a live onboarding session and the expected CRM / follow-up first question
  - refresh on that live onboarding route now shows an honest restore shell first and then rehydrates the same session-backed question instead of flashing a fake generic onboarding conversation or dropping to `אין onboarding פעיל לשחזור`
  - the restored onboarding route keeps the same `sessionId`, same project id, same summary truth, and same first question after settle

### W4-AGENT-005E — Attach conversation-first origin to Understanding and downstream continuity

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `trueGreen`
- depends_on:
  - `W4-AGENT-005C`
  - `W4-AGENT-005D`
  - `W4-INTAKE-005`
- mission:
  - ensure the new conversation origin truthfully survives into Understanding and the canonical downstream surfaces
- closed_at: `2026-05-24`
- closure_evidence:
  - `web/app.js`
  - `test/project-adapter.test.js`
  - `test/project-create-screen-render.test.js`
  - `docs/wave3-canonical-state.json`
  - `docs/operating-system/wave4-post-wave4-learning-intake-continuation-lane.md`
  - `docs/operating-system/wave4-minimum-believable-core-planning-track.md`
- live_closure_proof:
  - the live `understanding` route on `http://127.0.0.1:4011/understanding?...` now renders CRM / follow-up-specific understanding truth from the conversation-first origin instead of generic or cross-project fallback copy
  - the live `loop` route restores the same CRM / follow-up artifact expectation, rationale, and next-step continuity after direct downstream navigation and reload
  - the live `proof` route restores the same CRM / follow-up-specific proof artifact and proof framing from that same origin
  - the live `timeline` route restores the same project-specific artifact continuity at the top of the timeline instead of dropping back to unrelated generic product truth
  - the `understanding` continue CTA now exposes a real stateful `href` to `/loop?nexusState=...`, and opening that exact visible route produces the correct CRM / follow-up loop surface on the live product

### W4-GEN-003 — Transition conversation-first entry into entry-to-live-skeleton continuity

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `trueGreen`
- depends_on:
  - `W4-AGENT-005E`
  - `W4-GEN-002`
- mission:
  - connect the durable conversation-first entry path to visible class-aware first-skeleton shaping without collapsing back into hidden planning only
- closed_at: `2026-05-24`
- closure_evidence:
  - `web/app.js`
  - `web/nexus-ui/adapters/loop-adapter.js`
  - `web/nexus-ui/screens/LoopCoreScreen.js`
  - `test/loop-core-screen-render.test.js`
  - `docs/wave3-canonical-state.json`
  - `docs/operating-system/wave4-post-wave4-learning-intake-continuation-lane.md`
  - `docs/operating-system/wave4-minimum-believable-core-planning-track.md`
- live_closure_proof:
  - the live `loop` route on `http://127.0.0.1:4011/loop?...` now shows a visible CRM / follow-up first skeleton on screen instead of stopping at hidden planning or summary text
  - the live `proof` route on `http://127.0.0.1:4011/proof?...` restores the same CRM / follow-up-specific skeleton continuity with class-aware stats, client list, next action, and generated message content
  - onboarding continuation payloads are now class-aware across landing-page, follow-up dashboard, internal ops dashboard, commerce ops dashboard, and mobile app families instead of collapsing to a generic preview shell

Founder field-test reopener truth on `2026-05-24`:
- a later adversarial founder run against a dual-audience escrow product exposed that the conversation-first stack can still hydrate a fresh idea from poisoned prior project identity and stale hidden brief truth
- the report showed three upstream failures that are more canonical than the previous narrow closure proofs:
  - fresh sessions can still reuse contaminated project identity
  - explicit correction can still fail to flush stale family/summary/placeholder truth
  - the visible understanding chain can still converge to the wrong product family before a truthful first skeleton appears
- therefore `W4-GEN-002` may not remain the next canonical task
- a repair chain must execute first so later mutation work does not build on contaminated identity, family, and continuity truth

Founder live field-test evidence on `2026-06-03`:
- test idea:
  - a small business receives leads from WhatsApp and phone calls
  - leads fall through because there is no owner, reminder, or next step
  - the requested product is a simple internal lead list with status, owner, reminder, and next step
  - the founder explicitly said not to build WhatsApp automation or a real WhatsApp integration now
- live route tested:
  - `http://127.0.0.1:4011/?qaReset=1`
  - manual downstream route: `http://127.0.0.1:4011/loop?...`
- observed truth:
  - the fresh run still showed stale courier-app residue before the lead-management idea was entered
  - after the founder corrected the direction, the agent reached enough understanding and announced that it was preparing the first live skeleton
  - the visible create screen stayed in a disabled "preparing skeleton" state instead of automatically opening the generated skeleton
  - clicking the build / loop rail manually did reveal an on-class lead-management skeleton, proving the engine could produce the artifact while the visible handoff failed
  - reload and direct loop restore still depended on a multi-thousand-character `nexusState` URL payload instead of short route identity
  - the first skeleton preserved important non-goals such as no WhatsApp integration and no workflow automation, but it also exposed trust-breaking copy such as Hebrew labels equivalent to "dangerous product skeleton" and too much internal planning language
- canonical routing:
  - `W4-FIX-001` owns stale project identity contamination on fresh starts
  - `W4-FIX-002` owns stale brief, placeholder, summary, and explicit-correction residue
  - `W4-FIX-005` owns full-state URL serialization and route restore truth
  - `W4-FIX-007` owns the enough-understanding to visible-skeleton handoff after corrected truth exists
  - `W4-UPGRADE-001` owns stopwatch parity for reaching the first visible skeleton once the handoff is correct
  - `RUNTIME-TRUTH-001` owns canonical Nexus backend/project truth for runtime skeletons before interaction quality is allowed to rely on them
  - `PRODUCT-BACKEND-SKEL-001` owns the generated product backend/domain skeleton behind the runtime shell
  - `RUNTIME-SKEL-001` owns the cross-product requirement that the first runtime skeleton is interactive and product-like, not only a frame or visual mockup
  - `BUILD-MUTATION-TRUTH-001` owns the contract that later Build changes mutate frontend runtime, Nexus project truth, and generated product-domain truth together
  - `LEARNING-RUNTIME-001` owns learning events from runtime skeleton, generated product-domain skeleton, and Build mutation outcomes
  - `W4-UPGRADE-002` owns first-skeleton trust quality after the runtime skeleton is interactive, including removal of internal/debug copy and showing an actual product surface instead of a planning document

### W4-FIX-001 — Isolate fresh project identity and kill shared project reuse across new conversations

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `trueGreen`
- depends_on:
  - `W4-AGENT-005C`
  - `W4-AGENT-005D`
- mission:
  - ensure every new conversation-first start gets a fresh canonical project identity and cannot inherit prior server-side project understanding by id reuse
- why this is first:
  - stale identity contamination makes every later understanding, family, correction, and skeleton decision untrustworthy
- active remap note:
  - after the `2026-05-26` implementation-map remap, this remains a prepared Wave 4 repair-chain task, but it is not the active next execution task while earlier unresolved implementation-map release blockers exist
  - earlier notes said `BLD-AGT-001` was the next Build bridge after `SLICE-005`; that was superseded on `2026-06-04` by the runtime truth review and the live regression evidence
  - current implementation-map order after `SLICE-005` is `RUNTIME-TRUTH-001 -> PRODUCT-BACKEND-SKEL-001 -> RUNTIME-SKEL-001 -> BUILD-MUTATION-TRUTH-001 -> BLD-AGT-001`
  - `RUNTIME-TRUTH-001` is now `trueGreen`; the active next implementation-map blocker is `PRODUCT-BACKEND-SKEL-001`
  - `W4-FIX-007` remains a partially closed regression-chain task in Wave 3 state, but it does not displace the newly inserted runtime/product-domain blockers in the implementation-map order
  - `2026-06-04` implementation evidence now proves the narrowed live handoff is fixed: the lead-management journey moved automatically from `מכין שלד...` at wait second 44 to `/loop` at wait second 45 with `runtimeTask=SLICE-005`, `runtimeClass=internal-tool`, `runtimeShell=workspace-state-shell`, `createHidden=true`, and `loopHidden=false`
  - `2026-06-04` visible Chrome field test reconfirmed the automatic Create -> `/loop` handoff for the lead-management internal-tool idea and then exposed the remaining restore blocker: refreshing the same URL while `qaReset=1` was still present reset the live project to `qa-preview-project` and rendered a generic landing-page skeleton instead of the lead-management workspace. This belongs to `W4-FIX-005`, while the narrowed handoff proof remains under `W4-FIX-007`. Screenshot: `/private/tmp/nexus-live-visible-leads-refresh-regression.png`
  - full `W4-FIX-007` remains only partially closed because the canonical convergence-guardrail dependencies remain unresolved: `W4-FIX-003`, `W4-FIX-004`, `W4-FIX-005`, `W4-FIX-006`, and `W4-GEN-003`
- pass/fail truth:
  - pass if a new fresh idea can no longer resolve against a previous project's hidden brief, summary, companion truth, or artifact expectation
  - pass if the lead-management field-test can begin from `?qaReset=1` without inheriting courier-app identity, copy, project id, artifact expectation, or old assistant question state
  - fail if a clean session can still inherit earlier project understanding by reused id or reused server-side draft ownership

### W4-FIX-002 — Flush stale hidden brief, summary, placeholder, and family residue on fresh start and explicit correction

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `partial-live-handoff-fixed`
- depends_on:
  - `W4-FIX-001`
  - `W4-AGENT-003`
- mission:
  - hard-reset hidden brief, understood items, missing items, placeholder hints, and companion-derived residue whenever a new project starts or the founder explicitly says Nexus got the product wrong
- why this is second:
  - identity isolation alone is insufficient if the old hidden brief and visible helper text can survive into the next reasoning turn
- pass/fail truth:
  - pass if a forceful correction visibly flushes the wrong family residue and the next question re-derives from the corrected product truth
  - pass if correcting from the stale courier-app residue to the lead-management internal tool removes the courier family from visible copy, hidden brief, summary, placeholder, and downstream skeleton inputs
  - fail if catalog / checkout / logistics / other wrong-family residue survives after reset or correction

### W4-FIX-003 — Gate family reasoning behind confidence, grounded evidence, and synthesized referents

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `prepared-not-started`
- depends_on:
  - `W4-FIX-002`
  - `W4-INTAKE-003`
- mission:
  - stop Nexus from asserting a product family, family-specific placeholder, or family-specific follow-up before enough grounded evidence exists, and replace answer-pasting with short synthesized referents
- why this is third:
  - after stale truth is flushed, the next failure mode is still overconfident wrong-family hardening and mechanically bad question phrasing
- pass/fail truth:
  - pass if family remains a visible hypothesis until confidence is earned and follow-up language stays human and evidence-grounded
  - fail if Nexus still confidently asserts the wrong family or pastes the founder's full prior answer into the next question

### W4-FIX-004 — Add canonical dual-audience and multi-actor product modeling

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `prepared-not-started`
- depends_on:
  - `W4-FIX-003`
  - `W4-INTAKE-005`
- mission:
  - make operator, buyer, approver, end-user, and customer-side actors first-class brief truth so dual-audience products no longer collapse into a fake single-user story
- why this is fourth:
  - once family confidence is trustworthy, Nexus still needs a real actor model before downstream understanding and skeleton shaping can be truthful on two-sided products
- pass/fail truth:
  - pass if dual-audience products keep explicit actor structure through onboarding, understanding, loop, and proof
  - fail if the system still collapses both sides into one e-commerce-like customer narrative

### W4-FIX-005 — Replace full-state URL serialization with short route identity and server-backed restore

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `architecture`
- status: `prepared-not-started`
- depends_on:
  - `W4-FIX-001`
  - `W4-FIX-002`
  - `W4-AGENT-005D`
- mission:
  - stop using the full serialized `?nexusState=` blob as route truth and replace it with short route identity plus server-backed restore
- why this is fifth:
  - once identity and brief truth are isolated, route truth itself must stop leaking and replaying the whole hidden state payload
- pass/fail truth:
  - pass if refresh and direct route restore work from short identity without exposing the full conversation, summary, and hidden brief in the URL
  - pass if the lead-management loop can be restored from a short project / session identity without a multi-thousand-character `nexusState` blob
  - fail if route truth still depends on a multi-thousand-character serialized state blob

### W4-FIX-006 — Make the companion truthful, scoped to the canonical brief, and safely interactive

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `prepared-not-started`
- depends_on:
  - `W4-FIX-002`
  - `W4-FIX-004`
  - `W4-FIX-005`
- mission:
  - ensure the companion can only show grounded understanding, missing truth, and rationale from the live canonical brief, and can safely accept founder correction instead of echoing fabricated residue
- why this is sixth:
  - the companion becomes useful only after project identity, hidden brief, and actor truth are trustworthy
- pass/fail truth:
  - pass if the companion never invents unsupported understanding and can participate in correction safely
  - fail if it still mirrors stale hidden brief residue or acts as a passive hallucination panel

### W4-FIX-007 — Add convergence guardrails and a fast path from corrected understanding to the first on-class skeleton

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `prepared-not-started`
- depends_on:
  - `W4-FIX-003`
  - `W4-FIX-004`
  - `W4-FIX-005`
  - `W4-FIX-006`
  - `W4-GEN-003`
- mission:
  - stop unconverging wrong-family loops and give founders a truthful path to the first visible skeleton once enough corrected understanding exists
- why this is seventh:
  - only after upstream truth is repaired can Nexus safely shorten the path to visible product structure without generating the wrong product faster
- pass/fail truth:
  - pass if a founder can either converge normally or explicitly jump to the first on-class skeleton after enough grounded truth exists
  - pass if the lead-management case automatically transitions from enough-understanding / skeleton-ready state into the visible loop skeleton without requiring a manual rail click
  - fail if the conversation can still loop indefinitely while blocking any visible product structure
  - fail if the visible screen remains disabled in a "preparing skeleton" state while the generated skeleton is reachable only through manual downstream navigation
- `2026-06-04` partial closure evidence:
  - live transition proof passed for the lead-management regression: `מכין שלד...` on Create at wait second 44 became `/loop` with `SLICE-005` internal-tool runtime skeleton at wait second 45 without manual navigation
  - screenshot evidence: `/private/tmp/nexus-w4-fix-007-final-page.png` and `/private/tmp/nexus-w4-fix-007-runtime-skeleton-element.png`
  - code evidence: `web/app.js` now opens the visible runtime skeleton from discovery truth when product/visual skeleton agents are slow or unavailable, while preserving those agents as hidden engines
  - test evidence: `node --test test/loop-core-screen-render.test.js` includes `W4-FIX-007` runtime skeleton coverage from discovery truth
  - blocker: full task closure still depends on `W4-FIX-003`, `W4-FIX-004`, `W4-FIX-005`, `W4-FIX-006`, and `W4-GEN-003`

### W4-UPGRADE-001 — Reach the first on-class skeleton within competitor-parity speed on the Sela regression case

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `prepared-not-started`
- depends_on:
  - `W4-FIX-007`
  - `W4-GEN-003`
- mission:
  - make Nexus reach a visible first skeleton for the exact Sela regression case in `<=90 seconds` or `<=2 answers`, while preserving conversation-first entry and correct product understanding
- why this is after Track A:
  - a fast path to the wrong product is worse than the current slow path
- pass/fail truth:
  - pass if the live Sela journey on `http://127.0.0.1:4011/` reaches an on-class first skeleton within the target timing window and without e-commerce leakage
  - pass if the 2026-06-03 lead-management regression also reaches its first on-class skeleton without manual route intervention inside the same stopwatch discipline
  - fail if the skeleton is still unreachable, too slow, or visibly belongs to the wrong family

### RUNTIME-TRUTH-001 — Runtime skeleton backend truth binding

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `canonical blocker insertion`
- status: `trueGreen`
- depends_on:
  - `SLICE-005`
  - `ENG-001`
  - `ENG-002`
- blocks:
  - `PRODUCT-BACKEND-SKEL-001`
  - `RUNTIME-SKEL-001`
  - `BLD-AGT-001`
  - `W4-UPGRADE-002`
  - `W4-UPGRADE-003`
- mission:
  - persist the first runtime skeleton as canonical Nexus backend/project truth instead of deriving it only as frontend/browser/URL/QA state
- why this is before RUNTIME-SKEL-001:
  - interactive runtime behavior cannot become trustworthy if the runtime skeleton has no stable project/runtime/artifact truth envelope
- pass/fail truth:
  - pass if runtime skeletons have stable project id, runtime skeleton id, artifact/build id, product type, shell type, screens, sample data, interactions, visible state, and boundaries in project truth
  - pass if refresh/restore rebuilds the Build surface from backend/project truth without relying on a giant URL blob
  - fail if runtime skeleton truth exists only in frontend adapters or browser state
- canonical contract:
  - `docs/operating-system/runtime-product-truth-binding-contract-2026-06-04.md`
- closure truth:
  - `2026-06-04: PRODUCT-BACKEND-SKEL-001 closed trueGreen. Runtime skeleton truth now embeds generated product-domain models, operations, mock/local state, persistence boundary, and UI operation bindings.`
  - `2026-06-04: Tests proved mobile task create/update, landing lead validation/submission, internal-tool status update, and commerce cart state through domain operations.`
  - `2026-06-04: Live Build proof showed data-product-domain-task=PRODUCT-BACKEND-SKEL-001, product-domain id, workflow-record-local-state, operation buttons, and domain state trace.`
- closure truth:
  - `2026-06-04: Runtime skeleton truth is now represented by a shared backend/browser-safe envelope and persisted at project root, context, and state.`
  - `2026-06-04: Build/Loop renders from runtimeSkeletonTruth and exposes stable runtime truth data attributes on the visible surface.`
  - `2026-06-04: Direct route restore from backend truth is supported through /loop?projectId=<id>, verified live without qaState/nexusState after local state reset.`
  - `2026-06-04: Unit and live verification passed; next blocker remains PRODUCT-BACKEND-SKEL-001 because the generated product's own backend/domain skeleton is not covered by this task.`

### PRODUCT-BACKEND-SKEL-001 — Product backend/domain skeleton

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `canonical blocker insertion`
- status: `trueGreen`
- depends_on:
  - `RUNTIME-TRUTH-001`
  - `SKEL-001`
  - `VSKEL-001`
- blocks:
  - `RUNTIME-SKEL-001`
  - `BUILD-MUTATION-TRUTH-001`
  - `BLD-AGT-001`
  - `MUT-001`
- mission:
  - make every generated product skeleton include a matching generated product-domain/backend skeleton, not only frontend screens
- why this is before RUNTIME-SKEL-001:
  - a simulated product is not real enough if its buttons only change visuals and do not call product-domain operations
- pass/fail truth:
  - pass if product classes include domain models, operations, state transitions, mock/local persistence where appropriate, and UI-to-logic wiring
  - pass if mobile task creation/update, landing lead submission, internal-tool record/status update, and commerce/game state changes are proven where feasible
  - fail if product data objects are only prose or UI sample data
- canonical contract:
  - `docs/operating-system/runtime-product-truth-binding-contract-2026-06-04.md`

### RUNTIME-SKEL-001 — Interactive product runtime skeleton standard

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `prepared-not-started`
- depends_on:
  - `SLICE-005`
  - `RUNTIME-TRUTH-001`
  - `PRODUCT-BACKEND-SKEL-001`
  - `VSKEL-001`
  - `ENG-005`
  - `W4-UPGRADE-001`
- blocks:
  - `BUILD-MUTATION-TRUTH-001`
  - `BLD-AGT-001`
  - `W4-UPGRADE-002`
  - `W4-UPGRADE-003`
- mission:
  - raise Nexus's definition of a first runtime skeleton from a product-looking frame to an interactive product-type simulation with visible state, navigation, and workflow behavior
- why this is before W4-UPGRADE-002 and BLD-AGT-001:
  - a deeper or agent-driven Build surface cannot be trusted if the first skeleton is still a static visual demo
  - the user-facing failure is not only mobile quality; the same standard must apply to landing pages, internal tools, games, software tools, and commerce/product flows
- pass/fail truth:
  - pass if a mobile app skeleton has simulator-like navigation and local state changes inside the phone frame
  - pass if a landing page skeleton has live CTA/form/validation or confirmation behavior
  - pass if an internal tool skeleton has mutable table/list/form/dashboard state
  - pass if a game skeleton has controllable input and visible state/HUD changes
  - pass if a software/tool skeleton has real controls that change output/state
  - pass if a commerce/product skeleton has variant/quantity/add-to-cart/cart-summary behavior and truthful checkout/payment blocking
  - fail if Nexus treats a phone frame, static page, static dashboard, scene image, product card, or visual skeleton card as enough
  - fail if normal users see QA/Preview/internal text
- canonical contract:
  - `docs/operating-system/runtime-skeleton-interactive-standard-2026-06-04.md`
- closure truth:
  - `2026-06-04: RUNTIME-SKEL-001 closed trueGreen. The Build runtime skeleton now exposes visible live-state markers, mobile screen navigation, runtime score/state markers, and product-domain operation controls for the covered product shell families.`
  - `2026-06-04: Client-side runtime interaction handling updates visible runtime state, active mobile screen, interaction count, last operation, score/list state where relevant.`
  - `2026-06-04: Live mobile proof changed screen/state inside the simulator; live internal-tool proof changed list/state without manual route hacks.`

### BUILD-MUTATION-TRUTH-001 — Build agent frontend/backend/domain mutation contract

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `canonical blocker insertion`
- status: `trueGreen`
- depends_on:
  - `RUNTIME-SKEL-001`
  - `PRODUCT-BACKEND-SKEL-001`
  - `ENG-001`
  - `ENG-002`
- blocks:
  - `BLD-AGT-001`
  - `MUT-001`
  - `LEARNING-RUNTIME-001`
  - `W4-GEN-002`
- mission:
  - ensure Build agent changes update the visible runtime shell, Nexus project truth, generated product-domain skeleton, and mutation/history truth together
- pass/fail truth:
  - pass if a Build request creates a mutation intent tied to project, runtime skeleton, and product-domain skeleton
  - pass if visible changes happen only after truth mutation exists and survive refresh
  - fail if Build rail changes only local UI/transcript or if the agent can claim success without project/domain/history truth
- canonical contract:
  - `docs/operating-system/runtime-product-truth-binding-contract-2026-06-04.md`
- evidence:
  - `2026-06-04: BUILD-MUTATION-TRUTH-001 closed trueGreen. Build mutations now create canonical intent/history envelopes, apply through generated product-domain operations, persist project/runtime/domain mutation truth, serialize restore fields, and expose Build surface mutation anchors.`
  - `2026-06-04: Verification passed: node --test test/build-mutation-truth.test.js; node --test --test-name-pattern 'RUNTIME-TRUTH-001|PRODUCT-BACKEND-SKEL-001' test/project-service.test.js; node --test --test-name-pattern 'RUNTIME-SKEL-001|SLICE-005|W4-FIX-007' test/loop-core-screen-render.test.js; node --test test/product-domain-skeleton.test.js.`
  - `2026-06-04: Live Build surface proof found mutation task/status/operation/history-count anchors on /loop in QA mode. Screenshot: /private/tmp/nexus-build-mutation-truth-live.png.`
- closure_boundary:
  - `This does not close Build rail agent liveliness, natural-language mutation planning, visible agent response, general mutation generation, learning events, release/export, rollback UI, or production backend deployment.`

### LEARNING-RUNTIME-001 — Connect learning layer to runtime skeleton and Build mutations

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `canonical blocker insertion`
- status: `prepared-not-started`
- depends_on:
  - `RUNTIME-TRUTH-001`
  - `PRODUCT-BACKEND-SKEL-001`
  - `BUILD-MUTATION-TRUTH-001`
  - `ENG-007`
- blocks:
  - `W4-GEN-002`
  - `W4-LEARN-002 runtime/build claims`
- mission:
  - connect learning to runtime skeleton creation, generated product-domain skeleton creation, Build requests, mutation intents, and mutation outcomes
- pass/fail truth:
  - pass if learning events are emitted with project id, runtime skeleton id, product-domain skeleton id, mutation id, and outcome id
  - fail if learning remains connected only to onboarding/planning/post-release signals while claiming runtime/build intelligence
- canonical contract:
  - `docs/operating-system/runtime-product-truth-binding-contract-2026-06-04.md`

### W4-UPGRADE-002 — Make the first visible skeleton deepen progressively and explain why this shape exists

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `prepared-not-started`
- depends_on:
  - `W4-UPGRADE-001`
  - `RUNTIME-TRUTH-001`
  - `PRODUCT-BACKEND-SKEL-001`
  - `RUNTIME-SKEL-001`
  - `W4-FIX-004`
- mission:
  - keep Nexus's understanding advantage legible by showing product structure early and then visibly deepening it with actor-aware rationale as the conversation continues
- why this is next:
  - parity speed alone is insufficient unless Nexus also proves why its skeleton is more product-aware than competitor prompt-to-screen output
- pass/fail truth:
  - pass if the first visible skeleton updates as more grounded answers arrive and shows a short explicit rationale tied to the brief, such as the two-sided milestone/payment truth in Sela
  - pass if the lead-management skeleton feels like a usable internal lead workspace with lead list, status, owner, reminder, and next step, while preserving the explicit no-WhatsApp-integration and no-automation boundaries
  - fail if Nexus either withholds structure until the end or shows a generic dashboard without making the understanding advantage visible
  - fail if the first skeleton exposes internal/debug copy, mistranslated labels such as "מסוכן", or planning-document language that makes the product feel like a demo instead of a live workspace

### W4-UPGRADE-003 — Beat competitor first-artifact quality inside the same time band

- lane: `post-wave4-learning-and-intake-continuation`
- mode: `implementation`
- status: `prepared-not-started`
- depends_on:
  - `W4-UPGRADE-001`
  - `RUNTIME-TRUTH-001`
  - `PRODUCT-BACKEND-SKEL-001`
  - `RUNTIME-SKEL-001`
  - `W4-UPGRADE-002`
- mission:
  - make the first visible Nexus artifact arrive within competitor time bands while already being better than Lovable, Bolt, v0, and Base44 on actor truth, workflow logic, and product specificity
- why this is separate:
  - parity speed is necessary but not sufficient; Nexus only wins if the first artifact is visibly more correct and more product-aware than a generic competitor screen
- pass/fail truth:
  - pass if the exact same idea, run through Nexus and compared against the expected competitor baseline, yields a first visible artifact that is:
    - at least as fast to appear
    - more actor-true
    - more workflow-correct
    - less generic
    - more faithful to the founder's actual product logic
  - fail if Nexus is only equally fast but not visibly better, or better in theory but slower than the competitor time band
- mandatory live comparison rule:
  - the closure pass must rerun the exact Sela regression case on `http://127.0.0.1:4011/`
  - it must record:
    - time to first visible artifact
    - the visible actor model
    - the visible workflow shape
    - the visible rationale for why the artifact looks this way
  - it must write one explicit yes/no competitor verdict grounded in the live Nexus run, not in aspirational prose

- mandatory live verification protocol for `W4-FIX-001` through `W4-UPGRADE-002`:
  - rerun the exact Sela regression case from a real fresh session on `http://127.0.0.1:4011/`
  - confirm zero e-commerce leakage in:
    - understanding
    - missing items
    - placeholders
    - companion
    - first skeleton
  - immediately start a second unrelated project and confirm zero identity / understanding bleed
  - store screenshot evidence under:
    - `docs/field-tests/repair-upgrade/<task-id>/`

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
  - `W4-FIX-007`
  - `RUNTIME-TRUTH-001`
  - `PRODUCT-BACKEND-SKEL-001`
  - `BUILD-MUTATION-TRUTH-001`
  - `LEARNING-RUNTIME-001`
  - `W4-UPGRADE-002`
  - `W4-UPGRADE-003`
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
  - no feedback-driven mutation on top of contaminated project identity, stale hidden brief reuse, wrong-family hardening, or unmodeled dual-audience truth

## Write-Back Rule

When this lane is added to canonical state before activation:

- record it as `prepared-not-started`
- keep `W4-MBN-021` as the next active core task
- do not mark either prepared task as selected for implementation
- do not mark either prepared task as `trueGreen`

After Wave 4 core closes and this lane activates:

- update only the selected continuation task truthfully
- do not silently mark `W4-INTAKE-001` complete when only `W4-LEARN-001` closes
- keep visible proof requirements active for every continuation task
