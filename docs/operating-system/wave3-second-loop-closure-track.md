# Wave 3 Second-Loop Closure Track

## Purpose

This document is the canonical execution lane for closing the remaining Wave 3 second-loop gap.

It exists because Nexus now produces a credible first artifact on the live site,
but still fails to prove a strong enough second loop:

- approved artifact does not always become a meaningfully advanced next increment
- repeated-loop execution can still surface runtime/debug flavor as primary truth
- next-task truth can collapse into "no active task" while still pretending to continue
- reload / revisit continuity can still drop the user back to `Create`

This is not Wave 4 expansion.

This is final Wave 3 closure work.

## Active Closure Truth

The closure gate has now moved past the old question:

- "Can Nexus reach Proof / Artifact truthfully?"

For the SaaS class, the answer is already:

- yes

The blocker is now narrower:

- the live `Proof / Artifact / Timeline` surfaces were reached
- they exposed execution-first / builder-internal truth
- a structural suppression patch has now landed in the proof/timeline render path
- but that patch is not product truth until it is rerun live on `127.0.0.1:4011`

So the active closure question is now:

- after the patch, do the visible Proof / Artifact / Timeline surfaces finally read as product-first
- or do they still emotionally read as internal execution pipeline state

Live browser DOM/session access is now available on `127.0.0.1:4011`.

So the lane is no longer blocked on access itself.

The blocker is now narrower:

- the live rerun matrix is now complete
- all four audited classes now complete the path through `Loop -> Proof -> Artifact -> Timeline`
- the final live `small SaaS` rerun removes the remaining visible builder/composition blockers from the user-facing surfaces
- the audited matrix now reads product-first enough to close Wave 3 truthfully

## Scope Boundary

Wave 3 closure scope in this lane is:

- proving one truthful repeated-loop continuation:
  - `loop 1 -> meaningful loop 2`

Wave 3 does not require:

- deep multi-loop orchestration
- loop `3+`
- long autonomous product evolution
- generalized infinite-loop progression
- advanced recursive planning
- large-scale iterative autonomy

Those belong to Wave 4.

However:

- Wave 3 must not be closed with hardcoded `loop 2 only` hacks
- Wave 3 must establish a reusable repeated-loop continuation mechanism
- that mechanism is only validated live in Wave 3 through:
  - `loop 1 -> meaningful loop 2`
- deeper loop depth and large-scale iteration are intentionally deferred to Wave 4

## Long-Term Product Direction

The long-term Nexus target is not to generate summaries about products.

The target is:

- user asks for a product
- Nexus creates a real visible product skeleton
- Nexus shows that product skeleton on screen
- the skeleton has a believable structure for its class
- the user can inspect it, approve it, and continue building it
- later loops add content, logic, screens, sections, flows, behavior, or depth into that same product

Examples of the long-term target:

- mobile app:
  - first screen
  - first action
  - next screen
  - basic forward/back flow
  - visible app-like structure
  - later loops add screens, logic, state, flows, and behavior
- landing page / website:
  - hero
  - CTA
  - sections
  - trust blocks
  - basic navigation / structure
  - later loops add copy, design depth, sections, conversion logic, and refinements
- internal tool:
  - queue / table / work area
  - actions
  - ownership / status
  - basic workflow
  - later loops add workflow logic, roles, escalation, automation, and operational depth
- game:
  - game screen
  - basic interaction
  - rules / score / state
  - first playable loop
  - later loops add mechanics, levels, balancing, UI, and deeper gameplay

For any product class:

- the first artifact should feel like the beginning of the actual product
- not only a description of the product
- not only metadata
- not only a planning summary
- not only proof bullets

Wave 3 does not need to fully deliver that final product vision.

But Wave 3 must preserve and prepare the architecture for that direction.

So:

- Wave 3 validates a first meaningful continuation only
- Wave 4 expands depth and quality
- future Nexus must move from `product-shaped artifact` toward `real product skeleton`
- no `W3-SL` fix may block that direction or lock Nexus into summary-card-only artifacts

If infrastructure required for real product skeletons is still missing, it must be recorded explicitly as a Wave 4 dependency or prerequisite.

## User-Facing Product Direction Guard

Nexus must explicitly distinguish between:

1. product-shaped workflow or status
2. abstract builder terminology
3. a real visible product-building experience

The intended direction is:

- the user asks for a product
- Nexus shows the product being built
- the user increasingly sees visible product structure
- the same product becomes more real over time

The system must not drift toward:

- orchestration-first UX
- workflow dashboard truth as the primary product
- summary-card artifacts as the long-term model
- proof/status cards standing in for visible product evolution

This matters even in Wave 3 because:

- Wave 3 validates only `loop 1 -> meaningful loop 2`
- but Wave 3 must not close in a way that locks Nexus into builder-internal UX as the main visible truth

So:

- Wave 3 may still use product-shaping abstractions internally
- but user-facing truth should increasingly prefer:
  - simple language
  - visible product parts
  - concrete structure
  - intuitive real-world terminology
- internal builder terms may exist in the architecture
- but they must not dominate the primary user-facing experience

Examples of preferred visible truth:

- landing / website:
  - `כותרת ראשית`
  - `שם המותג`
  - `כפתור פעולה`
  - `אזור המלצות`
  - `אזור שירותים`
  - `תפריט`
  - `אזור יצירת קשר`
  - visible page skeleton
- mobile app:
  - `מסך פתיחה`
  - `מסך התחברות`
  - `כפתור פעולה`
  - `מסך המשך`
  - visible flow skeleton
- internal tool:
  - `טבלה`
  - `תור עבודה`
  - `אזור פעולות`
  - `מסך טיפול`
  - visible queue/workspace structure
- game:
  - `מסך משחק`
  - `interaction`
  - `score/state`
  - first playable loop

Examples of terms that may exist internally but must not dominate visible truth:

- `hero`
- `CTA`
- `sections`
- `trust blocks`
- `navigation continuity`
- `regions`
- `proof`
- `artifact`
- `increment`
- `workflow`
- `execution`

Wave 3 does not need to fully deliver real product skeleton depth.

But Wave 3 must preserve the architecture for that direction and must not let `trueGreen` imply that summary-card progression is the final Nexus product model.

## Future Agent Direction Guard

The long-term Nexus direction also includes a more intelligent conversational project agent.

The intended future experience is:

- the user describes a product
- Nexus agent understands the intent
- the agent asks only the missing questions
- the same understanding propagates across:
  - onboarding
  - understanding
  - loop
  - execution
  - proof
  - artifact
  - timeline
  - future iterations

This future direction should feel more like:

- a product partner
- a builder companion
- a creative technical assistant

and less like:

- a form
- a wizard
- a workflow orchestrator

Wave 3 does not implement that full agent architecture.

But Wave 3 must not lock Nexus into wizard-only onboarding or orchestration-dashboard-first UX.

If prerequisites for that conversational direction are still missing, they must be recorded as explicit Wave 4 dependencies rather than hidden behind `trueGreen`.

## Source Of Truth

The only product truth is:

- `http://127.0.0.1:4011/`

Nothing counts from:
- code alone
- tests alone
- docs alone
- preview payloads
- alternate ports
- QA/demo paths

## Why This Lane Exists

Wave 3 promised more than one nice first artifact.

It promised a stable, continuous, trustworthy first product loop:

1. user idea
2. onboarding
3. understanding
4. loop
5. execution
6. proof
7. artifact
8. confirmation
9. state update
10. next task
11. another believable loop step

The live audit showed the remaining weakness is concentrated in:
- second-loop novelty
- second-loop execution truth
- second-loop restore truth
- clarification truth when the system lacks enough information for a meaningful next increment

Within this lane:

- fake progression is forbidden
- cosmetic artifact replay does not count as advancement
- approval must create real continuation state
- next-task / execution / proof must reflect one meaningful increment
- clarification truth must appear when the next increment lacks enough information
- restore / revisit continuity must survive the second loop

## Wave 4 Gating Effect

Until this lane is closed:
- Wave 4 readiness is not truthful
- deeper Wave 4 execution must remain blocked

## Canonical Executable Queue

### W3-SL-001 — Turn approved artifact into one real next increment
- priority: `P0`
- depends_on:
  - `W3-PTH-011`
  - `W3-ONB-EXEC-007`
- mission:
  - stop the loop from replaying the same artifact after approval
  - validate one truthful repeated-loop continuation without hardcoding a one-off `loop 2 only` special case
- acceptance_criteria:
  - after `Confirmation -> State Update -> Next Task`, the selected next step is a real increment on top of the approved artifact
  - the next proof must differ meaningfully from the first proof
  - the system no longer recommends continuation while exposing `אין משימה פעילה כרגע`
  - cosmetic replay does not count as progression
  - approval creates real continuation state that can be reused by downstream screens
- product_truth_validation:
  - second-loop output is visibly more advanced than the first approved artifact
  - users can understand what changed and why this is the next increment
  - the mechanism is reusable in architecture, even though Wave 3 validates it only through `loop 1 -> loop 2`
- verification_4011:
  - run one live project through `Proof -> Artifact -> Confirmation -> State Update -> Next Task`
  - execute the next task
  - verify the next `Proof` is not a shallow replay of the same artifact
- execution_state:
  - state: `trueGreen`
  - lastValidatedAt: `2026-05-16`
  - liveEvidence:
    - after `Confirmation -> State Update -> Next Task`, the primary next-task card keeps a truthful continuation mission for the approved artifact instead of falling back to `אין משימה פעילה כרגע`
    - the repeated-loop execution screen now removes `כרגע אין משימה פעילה`, `initialize-mobile-auth`, `agent-runtime`, and `Recommended defaults are still provisional` from the primary visible execution surface
    - the next `Proof` now shows a visible increment layer (`מה התקדם מאז האישור`, `סבב 2`) instead of replaying the first mobile artifact without explanation
    - reloading the repeated-loop `Proof` on `4011` kept the same mobile artifact identity instead of dropping back to create/onboarding
  - remainingGap:
    - none within the scope of `W3-SL-001`
  - whyNotTrueGreen:
    - none
  - returnWhen:
    - return only if a future repeated loop falls back to replaying the same artifact without one visible next increment

### W3-SL-002 — Keep repeated-loop execution product-shaped
- priority: `P0`
- depends_on:
  - `W3-SL-001`
- mission:
  - stop repeated-loop execution from surfacing runtime/log truth as the main user experience
  - keep the repeated-loop continuation architecture aligned with future real product skeleton growth rather than summary-card-only artifacts
- acceptance_criteria:
  - execution surfaces in the second loop remain product-credible
  - runtime steps may exist, but they do not dominate the visible story
  - execution explains what product increment is happening now
  - the primary visible experience must not feel like an orchestration console, workflow dashboard, or builder-internal shell
  - visible surfaces should prefer concrete product parts over builder/internal terminology whenever possible in Wave 3 scope
  - zero user-visible occurrences of runtime/debug shell leakage such as:
    - `initialize-*`
    - `agent-runtime`
    - `Recommended defaults are still provisional`
    - `כרגע אין משימה פעילה`
  - zero user-visible internal slug leakage such as colon-delimited implementation ids in loop/execution/proof copy
  - zero live-DOM fallback/debug strings such as:
    - `safe mock state fallback`
    - `Generated surface`
    - `Fallback artifact payload`
  - `Developer` does not appear in the primary live sidebar unless explicit dev mode is enabled
  - the execution layer does not lock the product into summary-card-only continuation as the long-term model
- product_truth_validation:
  - the user sees product progress first, runtime traces second
  - repeated-loop execution does not feel like an internal tool shell
  - the live UX should trend toward `your product is being built` rather than `you are operating an AI workflow engine`
  - even when Wave 3 still uses product-shaped artifacts rather than full product skeletons, the visible language should not be dominated by orchestration terms, counters, workflow cards, and builder summaries
  - forbidden debug/fallback strings are removed from the live render tree, not merely hidden visually
  - the repeated-loop continuation remains compatible with future Wave 4 movement toward real product skeleton depth
- verification_4011:
  - run one live project into a second execution step
  - verify the execution screen stays product-shaped
  - verify the visible UI contains zero matches for the forbidden runtime/debug strings
  - verify the live DOM tree contains zero matches for the forbidden fallback/debug strings
  - verify loop/execution/proof copy contains zero internal slugs
  - verify the primary sidebar contains no `Developer` item in a fresh live session
- execution_state:
  - state: `trueGreen`
  - lastValidatedAt: `2026-05-16`
  - liveEvidence:
    - on `4011`, the repeated-loop `Execution` screen now keeps the story product-shaped with visible step copy such as `מסכמים מה המשתמש צריך להבין במסך הראשון`, `מחדדים את הפעולה הראשונה כך שתהיה ברורה בלחיצה אחת`, and `מכינים Proof שמראה מה השתפר מאז האישור`
    - the live repeated-loop `Execution` screen contains zero visible occurrences of `initialize-*`, `agent-runtime`, `Recommended defaults are still provisional`, and `כרגע אין משימה פעילה`
    - the live `Loop -> Execution -> Proof` path contains zero visible internal slug leakage and zero visible fallback/debug strings such as `Generated surface`, `Fallback artifact payload`, and `safe mock state fallback`
    - the primary live sidebar no longer shows `Developer` unless explicit dev mode is enabled
  - remainingGap:
    - none within the narrow scope of runtime/debug leakage cleanup
    - broader user-facing product-building feel remains gated by `W3-SL-005` and must not be falsely inferred from this task alone
  - whyNotTrueGreen:
    - none
  - returnWhen:
    - return only if repeated-loop execution falls back to runtime/debug shell truth, internal slug leakage, or live-DOM fallback strings on `4011`

### W3-SL-003 — Restore repeated-loop continuity after reload and revisit
- priority: `P0`
- depends_on:
  - `W3-SL-001`
- mission:
  - make active repeated-loop routes restore-safe
- acceptance_criteria:
  - reload from `Timeline`, `Next Task`, `Execution`, `Proof`, and `Artifact` during the second loop does not fall back to `Create`
  - revisit keeps the same artifact and loop truth
- product_truth_validation:
  - restore truth survives the repeated loop, not only the first artifact path
- verification_4011:
  - run a live project into a second loop
  - reload from at least three repeated-loop screens
  - verify continuity survives
- execution_state:
  - state: `trueGreen`
  - lastValidatedAt: `2026-05-16`
  - liveEvidence:
    - on `4011`, reload from repeated-loop `Proof` kept `Second Loop Truth Final Live mobile flow` and `סבב 2` instead of falling back to `Create`
    - on `4011`, reload from repeated-loop `Artifact` kept the same mobile artifact identity and did not lose the active loop truth
    - on `4011`, reload from repeated-loop `Next Task` kept the same continuation mission for the approved artifact instead of dropping back to onboarding/create
    - on `4011`, reload from repeated-loop `Timeline` kept the same project, artifact identity, and second-loop continuity instead of reopening the legacy create shell
  - remainingGap:
    - none within the scope of `W3-SL-003`
  - whyNotTrueGreen:
    - none
  - returnWhen:
    - return only if reload or revisit during the repeated loop drops back to `Create`, loses the active artifact, or loses the current loop truth on `4011`

### W3-SL-004 — Add clarification loop truth for weak next increments
- priority: `P1`
- depends_on:
  - `W3-SL-001`
- mission:
  - if the system lacks enough information for a meaningful second increment, it must ask for clarification explicitly instead of replaying the same artifact
- acceptance_criteria:
  - repeated-loop ambiguity produces one canonical clarification path
  - the system does not pretend to continue when it actually needs more information
  - clarification stays tied to the current artifact, not generic onboarding
- product_truth_validation:
  - users understand why the loop paused and what input would unlock a real next increment
- verification_4011:
  - run at least one live project where the second increment lacks enough detail
  - verify the system enters a clarification loop instead of artifact replay
- live_status:
  - state: `trueGreen`
  - last_validated_at: `2026-05-16`
  - what_is_true_now:
    - a weak repeated-loop mobile run on `4011` opens one canonical clarification path instead of fake continuation
    - the clarification screen explains why the loop paused and what supporting material would unlock a real next increment
    - reload on the clarification surface keeps the same project-bound clarification context for `Clarification Gate Mobile Live 4 mobile flow`
    - `חזור ל־Workspace` returns to the same blocked repeated-loop next-task state for the same approved artifact instead of falling back to generic onboarding or `Project Create`
    - reload after returning to the blocked repeated-loop next-task state keeps the same project, artifact truth, and clarification requirement intact
  - exact_remaining_gap:
    - none within the scope of `W3-SL-004`
  - why_not_true_green:
    - none
  - return_when:
    - return only if the clarification surface on `4011` stops preserving the same project-bound context through reload / revisit or stops returning to the same blocked workspace truthfully

### W3-SL-005 — Install final Wave 3 closure gate
- priority: `P1`
- depends_on:
  - `W3-SL-001`
  - `W3-SL-002`
  - `W3-SL-003`
  - `W3-SL-004`
- mission:
  - re-judge Wave 3 only after the repeated-loop truth is closed
- acceptance_criteria:
  - Wave 3 is not called complete unless the first repeated loop is real, coherent, advancing, restore-safe, and product-credible
  - Wave 3 closure criteria explicitly stop at `loop 1 -> meaningful loop 2`
  - loop `3+`, advanced orchestration depth, real product skeleton depth, and long iterative autonomy are explicitly reserved for Wave 4 and are not silently pulled back into Wave 3 closure
  - Wave 4 readiness is set truthfully from live evidence
  - per-class live evidence exists for:
    - `landing / marketing`
    - `mobile app`
    - `internal tool`
    - `small SaaS`
  - each class has explicit repeated-loop verdicts for:
    - second-loop novelty
    - execution product truth
    - restore / revisit continuity
    - forbidden-string leakage
    - class-safe clarification behavior when needed
  - the final closure gate explicitly distinguishes between:
    - product-shaped workflow/status
    - abstract builder terminology
    - a real visible product-building experience
  - Wave 3 is not called closed if the live UX still feels primarily like:
    - an orchestration console
    - a workflow dashboard
    - a proof/status summary surface
    - a builder-internal tool
  - the final closure gate includes one explicit product-skeleton readiness judgment:
    - does the current architecture still preserve movement toward a visible real product skeleton for the class
    - without locking Nexus into summary-card-only artifacts
  - the final closure gate includes one explicit conversational-agent readiness judgment:
    - does the current architecture still preserve movement toward an intelligent conversational product-building agent
    - without locking Nexus into wizard-only onboarding and dashboard-first lifecycle UX
  - class-aware Q1 framing and class-specific placeholder behavior remain true after closure
  - artifact cards in Hebrew-led runs contain no stray English placeholder labels
  - the final closure verdict explicitly records any missing infrastructure needed for future real product skeleton depth as Wave 4 dependencies or prerequisites
  - the final closure verdict explicitly records any missing infrastructure needed for future conversational-agent continuity as Wave 4 dependencies or prerequisites
- product_truth_validation:
  - the second loop now satisfies the same truth gates as the first loop
  - Wave 3 is judged as `first meaningful continuation proven`, not as `deep multi-loop autonomy delivered`
  - Wave 3 closure must not accidentally certify orchestration-first UX as the long-term Nexus direction
- verification_4011:
  - run one full live project through a first artifact and one meaningful second increment
  - verify that the system can now survive that path truthfully
  - create a short live evidence ledger per class with screenshots for:
    - Onboarding
    - Understanding
    - Loop
    - Execution
    - Proof
    - Artifact
    - Timeline
    - one reload / revisit point
  - store evidence under:
    - `docs/operating-system/wave3-final-hardening/evidence/<gap-or-class>/`
  - add one explicit live note per class answering:
    - does the user primarily see product structure evolving
    - or primarily see workflow/status/orchestration surfaces talking about the product
- live_status:
  - state: `trueGreen`
  - last_validated_at: `2026-05-16`
  - evidence_paths:
    - `docs/operating-system/wave3-final-hardening/evidence/mobile/live-note-2026-05-16.txt`
    - `docs/operating-system/wave3-final-hardening/evidence/landing/live-note-2026-05-16.txt`
    - `docs/operating-system/wave3-final-hardening/evidence/internal-tool/live-note-2026-05-16.txt`
    - `docs/operating-system/wave3-final-hardening/evidence/small-saas/live-note-2026-05-16.txt`
    - `docs/operating-system/wave3-final-hardening/evidence/small-saas/proof-2026-05-16.png`
  - what_is_true_now:
    - `mobile app` now proves one truthful repeated-loop continuation through clarification, reload, revisit, and return to the same blocked workspace context
    - `landing / marketing` now enters fresh live onboarding with class-aware create-to-onboarding handoff, a class-aware heading, class-aware transcript text, and a class-aware placeholder on `4011`
    - `internal tool` now enters fresh live onboarding with class-aware create-to-onboarding handoff, the ambiguous `project-class` step now keeps heading, transcript, and placeholder aligned instead of splitting truth on `4011`, and a fresh internal-tool session now reaches a product-shaped first proof / workspace artifact whose main surface speaks more about the built workspace, keeps zero visible `Proof` leakage, and restores the same proof context on reload
    - `small SaaS` now enters fresh live onboarding with class-aware create-to-onboarding handoff and class-aware SaaS audience phrasing on `4011`, stale onboarding restore after a server restart now falls back truthfully to create instead of resuming a dead session, a fresh SaaS rerun now reaches the loop on `4011`, and the latest live loop pass is now visibly preview-led: the product surface appears above the task container, the loop uses `בונים עכשיו את ...`, `בנה עכשיו`, `ראה את מה שנבנה`, `מה כבר סגור ומה נפתח אחר כך`, and `בתצוגה שנפתח`, no longer leaks `המשימה הפעילה`, `מפת הלולאה`, `ב-Proof`, or `understanding-complete`, the embedded surface no longer contradicts itself with an unrelated stale task line, the root route `/` now returns truthfully to the canonical create screen, direct revisit of `/home` no longer falls out of the SPA into raw `{\"error\":\"Not found\"}` JSON, `/settings` now opens as a real connected settings surface instead of loading a random fallback screen or nesting the create layout inside the settings state, and the create/onboarding action path no longer depends on stale DOM-bound listeners after rerenders
    - opening a project from `/home` now syncs the live route truthfully to `/loop` instead of leaving the URL on `/home`
    - explicit live reload on `/proof`, `/artifact`, and `/timeline` now restores the correct screen instead of collapsing back to the create shell
    - `landing / marketing`, `mobile app`, `internal tool`, and `small SaaS` now all complete a fresh live `Loop -> Proof -> Artifact -> Timeline` rerun on `4011` without visible `agent-runtime`, `invalid`, `blocked`, `Bootstrap validation failed`, `Artifact`, or provisional-default leakage on those screens
    - the last visible builder/composition blockers on the generic small-SaaS product surface were suppressed/reframed out of the user-facing truth
    - the dominant visible experience now reads as the product progressively taking shape, not as a system composing UI parts
  - exact_remaining_gap:
    - no remaining truthful gap is open inside the Wave 3 second-loop closure lane
  - why_not_true_green:
    - none
  - return_when:
    - reopen this lane only if a fresh live rerun on `4011` reintroduces route/restore regression, execution-first leakage, or product-grade perception regression on the audited matrix

## Execution Status

- state: `execution-promoted-blocking-wave4`
- lowest_truthful_executable_task:
  - `W3-SL-005`
- execution_discipline:
  - this lane is narrower than Wave 4
  - this lane blocks deeper Wave 4 until closed
  - all tasks must be judged from live `4011` behavior
  - do not begin implementing loop `3+` behavior in this lane
  - do not begin implementing full real product skeleton generation in this lane
  - do not begin implementing a full persistent conversational agent in this lane
  - do not let Wave 3 closure silently certify summary-card-only artifacts, orchestration-first UX, or wizard-only product guidance as the intended long-term Nexus direction
