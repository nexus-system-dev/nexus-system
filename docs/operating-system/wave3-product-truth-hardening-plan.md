# Wave 3 Product-Truth Hardening Plan

## Purpose

This document is the canonical Wave 3 product-truth hardening plan for the live Nexus product.

It exists to close the last-mile gap between:
- technical Wave 3 capability existence
- and product-grade Wave 3 existence on the live Nexus site at `http://127.0.0.1:4011/`

This plan is not a Wave 4 expansion plan.

It is a Wave 3 completion plan.

It also governs one canonical parallel planning track:
- `docs/operating-system/wave3-onboarding-intelligence-planning-track.md`
- `docs/operating-system/wave3-second-loop-closure-track.md`

That track does not pause the active `W3-PTH-*` queue,
but it is part of official Wave 3 product-truth hardening because onboarding quality directly shapes downstream loop truth.

## Source Of Truth

The only product truth is the live local Nexus site at:

- `http://127.0.0.1:4011/`

Nothing counts as product-alive because:
- code exists
- runtime exists
- schema exists
- preview exists
- tests pass

A Wave 3 capability counts as alive only if it is:
- visible
- routeable
- renderable
- loop-connected
- actionable
- restore-safe
- canonical across handoffs
- product-credible
- trustable
- non-debuggy

on `127.0.0.1:4011`.

## Canonical Audit Conclusion

The live loop is now visibly runnable end-to-end on `127.0.0.1:4011`.

But the audit proved that Wave 3 still has real product-truth debt:

1. parts of Wave 3 are technically alive but not fully product-alive
2. some classes receive credible artifacts while other classes collapse into metadata-heavy surfaces
3. some truths survive inside `Proof`, but are lost in downstream review and loop-continuation surfaces
4. fallback / QA / hidden-surface leakage still weakens the live product path

Wave 3 is therefore:
- technically strong in many areas
- product-incomplete

## Capability-To-Product Map

| Capability | Technical | Product | Class Coverage | Main Gap |
| --- | --- | --- | --- | --- |
| Create | alive | alive and credible | broad | no major product-truth gap |
| Onboarding | alive | alive but weak | mixed | project-type clarification / continuity |
| Understanding | alive | alive but weak | mixed | trust and transition depth |
| Loop | alive | alive but weak | mixed | still status-forward in places |
| Execution | alive | partially product-alive | mixed | actionability and artifact continuity |
| Proof | alive | partially product-alive | uneven | strong for follow-up, weak for other classes |
| Artifact route | alive | credible for narrow class | narrow | not generalized, not fully loop-owned downstream |
| Confirmation | alive | product-alive but weak | broad | does not center canonical artifact truth |
| State Update | alive | product-alive but weak | broad | state summary dominates artifact continuity |
| Next Task | alive | product-alive but weak | broad | continuity survives, product story weakens |
| Timeline | alive | partially product-alive | broad | state history stronger than artifact history |
| Generated surface proof stack | alive | mostly technical | uneven | signals/regions/metadata instead of strong visual surface |

## Highest-Impact Gaps

1. Canonical artifact truth is too narrow by project class.
2. Artifact truth does not remain canonical across `Proof -> Artifact -> Confirmation -> State Update -> Timeline`.
3. Non-follow-up classes can still degrade into metadata/debug/admin representation.
4. Landing / marketing style projects still expose handoff and expectation-truth failures during onboarding.
5. QA/fallback/hidden-surface leakage still weakens trust in the live path.
6. Some visible Wave 3 surfaces are routeable but not meaningfully actionable.
7. Onboarding still feels too generic and therefore weakens question quality, flow steering, artifact quality, trust, and downstream loop quality.

## Product-Truth Rules

### Visual Product Surface Rule

Any capability that claims to produce a visual outcome must terminate in a real visual product surface inside Nexus on `127.0.0.1:4011`.

It may not stop at:
- metadata
- schema
- regions
- preview payload
- bullets
- summaries
- validation output
- internal renderer state

If Nexus claims it created:
- a site
- a landing page
- a dashboard
- an onboarding flow
- an artifact
- generated UI
- a product surface
- a screen set
- a visual flow

then the user must be able to see the thing itself inside Nexus.

### Six Truth Gates

No Wave 3 hardening task may become `trueGreen` unless it passes all relevant gates:

1. runtime truth
2. route truth
3. renderer truth
4. handoff truth
5. restore truth
6. product-grade truth

### Product-Grade Truth

For every touched surface, the validation must say explicitly whether it:
- looks real enough
- feels like a product
- gives basic wow
- avoids metadata/debug/admin feel
- looks showable/shareable
- makes the user understand what Nexus built

## Canonical Executable Queue

### W3-PTH-001 — Unify canonical artifact truth across downstream loop surfaces
- priority: `P0`
- depends_on:
  - `095`
- scope:
  - `Proof`
  - `Artifact`
  - `Confirmation`
  - `State Update`
  - `Next Task`
  - `Timeline`
- acceptance_criteria:
  - one canonical artifact truth survives all downstream handoffs
  - downstream screens stop reconstructing conflicting artifact stories
  - `Confirmation` centers the same artifact the user reviewed in `Proof`
- product_truth_validation:
  - the same artifact identity is visible across the handoff chain
  - no downstream screen downgrades artifact truth into summary-only truth
- verification_4011:
  - run a live project to `Proof`
  - open the artifact route
  - continue to `Confirmation`
  - continue to `State Update`
  - inspect `Next Task` and `Timeline`
  - verify the same artifact story survives visibly

### W3-PTH-002 — Deliver a credible visual artifact path for internal-tool projects
- priority: `P0`
- depends_on:
  - `W3-PTH-001`
- acceptance_criteria:
  - internal-tool projects no longer terminate in region/CTA metadata
  - `Proof` and `Artifact` show a believable product surface
  - the result looks like something a real user could review
- product_truth_validation:
  - internal-tool artifact is visible, routeable, renderable, and actionable
  - output does not feel like generated-surface diagnostics
- verification_4011:
  - create an internal-tool project on the live site
  - run it to `Proof`
  - verify `Proof` and `Artifact` show product-shaped output

### W3-PTH-003 — Close landing / marketing onboarding truth gaps
- priority: `P0`
- depends_on:
  - `W3-PTH-001`
- acceptance_criteria:
  - landing/marketing projects no longer complete the onboarding conversation and then block on hidden project-type ambiguity
  - user-facing recovery is explicit if clarification is still required
- product_truth_validation:
  - expectation truth is preserved
  - onboarding handoff does not contradict itself
- verification_4011:
  - create a landing/marketing project
  - complete onboarding
  - verify there is no contradictory “complete but blocked” path

### W3-PTH-004 — Eliminate fallback leakage from the live loop path
- priority: `P1`
- depends_on:
  - `W3-PTH-001`
- acceptance_criteria:
  - live loop surfaces no longer present fallback/demo/QA truth as if it were canonical product truth
  - hidden-surface collisions are reduced in the primary live path
- product_truth_validation:
  - visible truth on `4011` is clearly canonical
  - QA/demo logic is either removed from the primary path or clearly separated
- verification_4011:
  - inspect loop screens on the live site
  - verify no misleading QA/fallback wording leaks into the main product path

### W3-PTH-005 — Upgrade actionability of proof and artifact review surfaces
- priority: `P1`
- depends_on:
  - `W3-PTH-001`
- acceptance_criteria:
  - critical review surfaces are not passive-only
  - at least the primary artifact review actions are real and meaningful
  - no core visual artifact path ends in a dead-end
- product_truth_validation:
  - users can do something meaningful with the surfaced artifact
  - the surface advances the loop rather than merely describing it
- verification_4011:
  - run a live project to `Proof`
  - verify primary artifact review actions work in the browser

### W3-PTH-006 — Harden downstream review surfaces against metadata/debug feel
- priority: `P1`
- depends_on:
  - `W3-PTH-001`
- scope:
  - `Confirmation`
  - `State Update`
  - `Next Task`
  - `Timeline`
- acceptance_criteria:
  - downstream screens feel like product continuation, not status consoles
  - wording and semantics stay consistent across the loop
- product_truth_validation:
  - surfaces remain product-credible
  - user trust increases instead of dropping after `Proof`
- verification_4011:
  - walk the live loop through downstream review surfaces
  - verify product-grade truth against the UI itself

### W3-PTH-007 — Create multi-class Wave 3 smoke matrix on 4011
- priority: `P1`
- depends_on:
  - `W3-PTH-002`
  - `W3-PTH-003`
- classes:
  - `small SaaS`
  - `internal tool`
  - `landing / marketing`
  - `one additional repo-supported class`
- acceptance_criteria:
  - each class has a live smoke path and product-truth verdict
  - no class may be called `trueGreen` from one happy path alone
- product_truth_validation:
  - class coverage is explicit
  - weak classes remain visible in the ledger until hardened
- verification_4011:
  - run live browser checks per class on the actual site
- status: `trueGreen` on `2026-05-15`
- live_smoke_matrix:
  - `small SaaS`
    - path: `Create -> Onboarding -> Understanding -> Loop -> Proof`
    - verdict: `credible on the tested happy path`
    - visible_truth:
      - follow-up dashboard appeared in `Proof`
      - actionable artifact controls stayed visible
      - product story stayed understandable through the loop
    - remaining_gap:
      - one happy path is not enough to call the class globally hardened
  - `internal tool`
    - path: `Create -> Onboarding -> Understanding -> Loop -> Execution -> Proof`
    - verdict: `partially credible with execution continuity weakness`
    - visible_truth:
      - internal workspace artifact appeared in `Proof`
      - queue / owner / SLA signals felt product-shaped
    - remaining_gap:
      - execution landed on `מבצעים את המשימה` with `כרגע אין משימה פעילה` before manual proof reveal
      - class is alive, but the execution-to-proof handoff is still less trustworthy than SaaS
  - `landing / marketing`
    - path: `Create -> Onboarding -> Understanding -> Loop -> Proof`
    - verdict: `product-dead after onboarding`
    - visible_truth:
      - onboarding and understanding remained class-safe
    - remaining_gap:
      - `Proof` still collapsed into `Generated surface`
      - the visible output talked about preview composition and regions instead of showing a credible landing page artifact
  - `mobile app`
    - path: `Create -> Onboarding -> Understanding -> Loop -> Proof`
    - verdict: `product-dead after onboarding`
    - visible_truth:
      - onboarding completed and understanding stayed coherent
    - remaining_gap:
      - downstream proof still degraded into metadata-heavy generated-surface truth
      - the user could not see a credible mobile product surface, only renderer-style representation
- matrix_outcome:
  - Wave 3 class coverage is now explicit on `4011`
  - strong classes: `small SaaS`
  - mixed classes: `internal tool`
  - weak classes at audit time: `landing / marketing`, `mobile app`
  - post-matrix hardening has since closed the landing and mobile proof gaps, leaving `internal tool` continuity as the remaining readiness blocker

### W3-PTH-008 — Install Wave 3 product-truth readiness gate before Wave 4
- priority: `P0`
- depends_on:
  - `W3-PTH-001`
  - `W3-PTH-002`
  - `W3-PTH-003`
  - `W3-PTH-004`
  - `W3-PTH-005`
  - `W3-PTH-006`
  - `W3-PTH-007`
- acceptance_criteria:
  - no deeper Wave 4 execution may proceed while critical Wave 3 product-truth gaps remain open
  - the canonical execution doctrine explicitly enforces product-truth completion rules
- product_truth_validation:
  - readiness is based on live product truth, not code presence
- verification_4011:
  - confirm the required Wave 3 surfaces are visible, routeable, renderable, loop-connected, actionable, restore-safe, canonical, product-credible, and trustable
- status: `trueGreen` on `2026-05-16`
- readiness_verdict:
  - `Wave 4 = no-go`
  - reason:
    - the live smoke matrix on `4011` still shows weak product-dead classes
    - `internal tool` remains mixed because execution-to-proof continuity is still weaker than the small SaaS path
  - enforcement_effect:
    - no deeper Wave 4 execution may be called truthful while these gaps remain open
    - the next canonical tasks must target the weak classes revealed by `W3-PTH-007`

### W3-PTH-009 — Deliver a credible landing / marketing artifact path through Proof
- priority: `P0`
- depends_on:
  - `W3-PTH-008`
- acceptance_criteria:
  - a landing or marketing project reaches `Proof` on `4011` and shows a credible visual landing-page artifact rather than `Generated surface`, `regions`, or preview composition metadata
  - the artifact is openable as its own real surface inside Nexus
  - the artifact story remains understandable from onboarding expectation through proof review
- product_truth_validation:
  - landing or marketing output must end as a visible product surface, not renderer-state representation
  - the user must be able to understand what page Nexus built and why it counts as the intended result
- verification_4011:
  - run a live landing or marketing flow on `4011`
  - verify `Proof` and `Artifact` show the page itself rather than metadata/debug framing
- status: `trueGreen` on `2026-05-16`
- live_validation:
  - `Proof` on `4011` showed `Landing page preview` instead of `Generated surface`
  - the live artifact surface showed:
    - `הבטחה מעל הקפל`
    - `למה אפשר לסמוך על המסך`
    - `עמודי התווך של הדף`
    - `Start project`
  - `Proof` kept both `פתח artifact` and `הורד artifact` enabled
  - `Artifact` route opened the same landing surface as a standalone Nexus screen
- regression_note:
  - a quick internal-tool smoke on `4011` still showed `תצוגת כלי פנימי`, `בקשות פתוחות`, and `שיוך owner` without falling back to `Generated surface`

### W3-PTH-010 — Deliver a credible mobile-app artifact path through Proof
- priority: `P0`
- depends_on:
  - `W3-PTH-008`
- acceptance_criteria:
  - a mobile app project reaches `Proof` on `4011` and shows a credible mobile product surface rather than generated-surface metadata
  - the mobile artifact is openable as its own real Nexus surface
  - the product story stays coherent from onboarding expectation through proof review
- product_truth_validation:
  - the user must be able to see the mobile product surface itself, not just schema / regions / preview payload truth
  - the visible result must feel showable and product-shaped
- verification_4011:
  - run a live mobile flow on `4011`
  - verify `Proof` and `Artifact` show a credible mobile surface and not metadata/debug output
- status: `trueGreen` on `2026-05-16`
- live_validation:
  - `Proof` on `4011` showed `MOBILE APP PREVIEW` instead of `Generated surface`
  - the live artifact surface showed:
    - `מה המשתמש פוגש ראשון`
    - `מה המשתמש עושה קודם`
    - `איך הזרימה ממשיכה קדימה`
    - `נתיב השחרור שנשמר`
  - `Proof` kept both `פתח artifact` and `הורד artifact` enabled
  - `Artifact` route opened the same mobile surface as a standalone Nexus screen
  - reloading `Artifact` on `4011` restored the same mobile surface instead of falling back to `Create`
- note:
  - onboarding still weakens the upstream framing for mobile, but the `Proof` and `Artifact` path no longer collapse into metadata-heavy generated-surface truth

### W3-PTH-011 — Harden internal-tool execution-to-proof continuity
- priority: `P1`
- depends_on:
  - `W3-PTH-008`
- acceptance_criteria:
  - the internal-tool path no longer lands on `מבצעים את המשימה` with `כרגע אין משימה פעילה` before proof truth becomes visible
  - execution truth stays believable until the internal workspace artifact is revealed
- product_truth_validation:
  - the handoff from `Execution` to `Proof` must feel trustworthy and continuous, not manually rescued
- verification_4011:
  - run a live internal-tool flow on `4011`
  - verify execution remains coherent through proof reveal without dead-air status truth
- status: `trueGreen` on `2026-05-16`
- live_validation:
  - on a live internal-tool flow on `4011`, `Execution` no longer showed `כרגע אין משימה פעילה` before proof truth became visible
  - the execution surface instead showed a product-shaped continuity path:
    - `מכינים את Internal Continuity 2 workspace`
    - `ננעל כיוון ה־workspace עבור הצוות`
    - `ממקמים ownership גלוי על התור`
    - `מכינים SLA ברור על כל בקשה`
    - `ה־Proof הבא יראה הפעולה הבאה שניתנת לביצוע מיד`
  - the live execution screen no longer relied on low-level runtime copy as its primary truth before Proof
  - from the same live execution screen, `הצג הוכחה כשמוכן ←` still handed off into the internal-tool proof/artifact path without breaking continuity

## Post-Closure Reopeners From Clinic Call Triage Audit

A live field test of `Clinic Call Triage` on `127.0.0.1:4011` surfaced a new set of seam-level Wave 3 tasks.

These are still Wave 3 work, not Wave 4 expansion, because they are:
- user-facing seam repairs
- class-truth binding repairs
- live copy / leakage repairs
- continuation-trust repairs

They do not open new infrastructure fronts.
They do reopen product-truth hardening work that was previously assumed closed.

### W3-PTH-012 — Remove raw transport failure truth from onboarding answer submission
- priority: `P0`
- depends_on:
  - `W3-PTH-008`
- acceptance_criteria:
  - answering onboarding questions on `4011` never exposes raw transport truth such as `Request failed: 404` to the user
  - a failed submit preserves the typed answer instead of wiping the input
  - the retry path is phrased in canonical Hebrew product copy instead of English error text or HTTP codes
- product_truth_validation:
  - user-facing onboarding failure states must read as product guidance, not network diagnostics
  - transient submission failures must not destroy user trust or destroy typed work
- verification_4011:
  - run a live onboarding answer submission on `4011`
  - force or reproduce one failure path if available
  - verify the answer remains intact and the visible failure copy contains no raw HTTP or English transport text
- status: `trueGreen`
- closure_evidence_4011:
  - `docs/operating-system/wave3-final-hardening/evidence/reopeners/2026-05-18/wave3-reopeners-report.json`
  - live failure-path verification on `2026-05-18` preserved the typed answer and showed only canonical Hebrew retry copy: `לא הצלחנו לשלוח את התשובה כרגע. נסה שוב בעוד רגע.`
- opened_by_live_audit:
  - `Clinic Call Triage` live field test on `2026-05-17`

### W3-PTH-013 — Lock resolved class truth across onboarding completion, missing-items, and Proof metrics
- priority: `P0`
- depends_on:
  - `W3-PTH-008`
- acceptance_criteria:
  - once a project is resolved as `internal tool`, the conversation-complete banner no longer falls back to `landing page` language
  - the `מה עדיין חסר` panel no longer drifts into landing-class prompts inside an internal-tool session
  - `Proof` metrics for internal-tool projects no longer show landing metrics such as visits, signups, or conversion rate
  - `Proof` and `Artifact` use one class-consistent metric and framing model for the same artifact identity
- product_truth_validation:
  - class resolution must remain stable across the visible handoff chain
  - a user must not see internal-tool understanding with landing-class proof framing in the same run
- verification_4011:
  - run a live internal-tool flow on `4011`
  - verify onboarding completion copy, missing-items copy, `Proof`, and `Artifact` remain class-consistent
- status: `trueGreen`
- closure_evidence_4011:
  - `docs/operating-system/wave3-final-hardening/evidence/reopeners/2026-05-18/w3-pth-013-014-015-internal-tool-reproof.json`
  - targeted internal-tool reproof on `2026-05-18` verified class-consistent onboarding completion, missing-items copy, `Loop`, `Proof`, and `Artifact` without landing metrics or class drift
- opened_by_live_audit:
  - `Clinic Call Triage` live field test on `2026-05-17`

### W3-PTH-014 — Eliminate runtime, QA, and slug leakage from the shipped internal-tool loop tree
- priority: `P0`
- depends_on:
  - `W3-PTH-004`
  - `W3-PTH-011`
- acceptance_criteria:
  - internal-tool `Loop`, `Execution`, `Proof`, and `Artifact` no longer ship user-facing or DOM-shipped strings such as:
    - `journey-onboarding-initialization:onboarding:capture-intake`
    - `ai-design-proposal:...:invalid`
    - `create-app-shell -> Invoked ... on agent-runtime`
    - `define-first-workflow -> ... on agent-runtime`
    - `agent-runtime | stdout`
    - `stdout | command output`
    - `Recommended defaults are still provisional`
    - `W3 ... Closure Live`
  - the primary live tree no longer carries class-crossing QA badges or renderer-status truth for the audited internal-tool path
- product_truth_validation:
  - the live tree itself must look canonical, not only the visible pixels at one scroll position
  - internal-tool product truth must no longer rely on hidden QA / debug leakage being "not noticeable"
- verification_4011:
  - run a live internal-tool flow on `4011`
  - inspect the rendered page state and verify the forbidden runtime / QA strings are absent from the shipped loop tree
- status: `trueGreen`
- closure_evidence_4011:
  - `docs/operating-system/wave3-final-hardening/evidence/reopeners/2026-05-18/w3-pth-013-014-015-internal-tool-reproof.json`
  - targeted internal-tool reproof on `2026-05-18` reached `Loop -> Proof -> Artifact` on `4011` without forbidden runtime / QA / slug leakage in the shipped visible path
- opened_by_live_audit:
  - `Clinic Call Triage` live field test on `2026-05-17`

### W3-PTH-015 — Repair copy-integrity seams in internal-tool onboarding and execution
- priority: `P1`
- depends_on:
  - `W3-PTH-013`
- acceptance_criteria:
  - user-facing copy no longer corrupts `Nexus` into mixed-script fragments such as `נסו exus`
  - internal-tool questions no longer paste prior answers into broken grammar seams
  - conversation-complete / blocked banners no longer present contradictory title and subtitle truth on the same screen
  - English bleed such as `ownership`, `Workspace`, and `SLA` is either intentionally translated or intentionally framed, not leaked accidentally inside otherwise Hebrew product copy
- product_truth_validation:
  - product copy must read as intentional and trustworthy in the audited class
  - mixed-script corruption and template seams count as product-truth failures
- verification_4011:
  - run a live internal-tool flow on `4011`
  - inspect onboarding, execution log copy, understanding continuity text, and completion banners for corruption or contradictory copy
- status: `trueGreen`
- closure_evidence_4011:
  - `docs/operating-system/wave3-final-hardening/evidence/reopeners/2026-05-18/w3-pth-013-014-015-internal-tool-reproof.json`
  - targeted internal-tool reproof on `2026-05-18` removed the remaining `ownership / workspace / SLA` seams from the visible onboarding, understanding, loop, proof, and artifact path
- opened_by_live_audit:
  - `Clinic Call Triage` live field test on `2026-05-17`

### W3-PTH-016 — Repair stale-session recovery and create-to-onboarding misrestore
- priority: `P1`
- depends_on:
  - `W3-PTH-008`
- acceptance_criteria:
  - creating a new project on `4011` no longer drops the user into a previous project's restored onboarding banner
  - when the previous onboarding session is stale, the first visible recovery message is the honest stale-session explanation, not a misleading restored-session claim
  - the recovery path keeps the new draft truthfully and restarts onboarding without cross-project identity confusion
- product_truth_validation:
  - continuation and recovery truth must be honest on the first recovery surface, not only after a manual refresh
  - project identity must not bleed across fresh create flows
- verification_4011:
  - create a new project after a stale or previously restored onboarding session exists
  - verify the first post-submit recovery state is truthful and project-correct
- status: `trueGreen`
- closure_evidence_4011:
  - `docs/operating-system/wave3-final-hardening/evidence/reopeners/2026-05-18/wave3-reopeners-report.json`
  - targeted stale-session live rerun on `2026-05-18` proved that a fresh create flow no longer misrestores prior project identity into the new onboarding path
- opened_by_live_audit:
  - `Clinic Call Triage` live field test on `2026-05-17`

## Current Main-Lane Status

- `W3-PTH-001` through `W3-PTH-011` reached `trueGreen` on the earlier audited matrix
- the `Clinic Call Triage` live audit reopened seam-level Wave 3 tasks `W3-PTH-012` through `W3-PTH-016`
- the `2026-05-18` reopener closure pass on `4011` closed `W3-PTH-012` through `W3-PTH-016` with live browser evidence
- therefore the main Wave 3 product-truth hardening plan is again globally closed truthfully for Wave 3 scope
- the parallel onboarding lane has now also closed the last onboarding continuation-gate truth gap on the live `4011` site
- but the live repeated loop still exposes a real final Wave 3 gap:
  - approved artifact does not yet become one clearly advanced next increment
  - repeated-loop execution is still too runtime-forward
  - repeated-loop reload / revisit continuity is not yet trustworthy
- therefore Wave 3 no longer remains reopened on product-truth seams, and the next canonical action is Wave 4 planning readiness rather than further Wave 3 seam repair
- these reopened `W3-PTH-*` seam tasks do not automatically replace the active lowest executable task; they are canonical additions that must be scheduled truthfully by the orchestrator

## Wave 4 Deferred Tasks Opened By The Same Audit

The same `Clinic Call Triage` audit also surfaced structural follow-ups that belong to Wave 4, not Wave 3:

### W4-DEP-001 — Deliver real route truth and deep-link restore for each loop stage
- build real server-backed routes for `Understanding`, `Loop`, `Execution`, `Proof`, `Artifact`, and `Timeline`
- reloading any stage must restore the same project and artifact identity instead of collapsing to `Create`

### W4-DEP-002 — Replace structured artifact summaries with rendered class-true product surfaces
- internal-tool outputs must render as usable workspace mocks, not as summary cards standing in for the product
- artifact depth must become class-true and visually product-grade

### W4-DEP-003 — Expose meaningful multi-step orchestration depth as product truth
- execution must surface real multi-step progress as product copy
- the user should see more than a short checklist that auto-completes around hidden runtime steps

### W4-DEP-004 — Separate production render tree from QA, closure, and developer instrumentation
- the production tree must not ship closure badges, QA labels, or developer-surface references at all
- this separation must happen structurally, not only through cosmetic hiding

### W4-DEP-005 — Promote class inference from confirmation question to class lock with safe override
- create and early onboarding should reach a confident class lock earlier
- the user should get a light override path instead of a full extra classifier question when possible

### W4-DEP-006 — Make restore deterministic from any stage and any truthful URL
- restore must no longer depend on one happy-path local session state
- deep reload / revisit continuity must work across classes and stages

### W4-DEP-007 — Raise visual design quality of all core loop surfaces to product-grade
- onboarding, understanding, loop, proof, artifact, and timeline must look as strong as the product promise they carry
- class-true outputs must feel showable, not only functionally correct

## Readiness Definition

Wave 3 is ready for deeper Wave 4 work only if the important capabilities are:
- visible
- routeable
- renderable
- loop-connected
- actionable
- restore-safe
- canonical across handoffs
- product-credible
- trustable
- non-debuggy

on `127.0.0.1:4011`.

Wave 4 remains a truthful `no-go` while any required class still fails this definition on the live site.
The current live verdict now adds one more requirement:
- at least one repeated loop must be real, coherent, advancing, restore-safe, and product-credible

## Final Wave 3 Closure Lane

Wave 3 now owns one final blocking execution lane:

- `docs/operating-system/wave3-second-loop-closure-track.md`

This lane exists because the first loop is now strong enough,
but the second loop is still too weak to count as truthful completion.

It is still Wave 3 work, not Wave 4 expansion, because:
- it closes the minimum believable implementation loop
- it prevents false-green repeated-loop claims
- it ensures the product does more than replay one approved artifact

## Parallel Canonical Planning Track

Wave 3 also owns one parallel canonical planning track:

- `docs/operating-system/wave3-onboarding-intelligence-planning-track.md`

### Why it belongs to Wave 3

The onboarding gap is not merely a future enhancement.

It directly affects:
- question quality
- flow steering
- artifact quality
- user trust
- downstream loop quality

So it must be treated as a Wave 3 product-truth concern even before full implementation begins.

### Planning-Track Rules

1. It remains planning-only until explicitly promoted into executable implementation work.
2. It must stay grounded in live onboarding behavior on `127.0.0.1:4011`.
3. It must not interrupt the main `W3-PTH-*` execution queue.
4. It must define canonical:
   - architecture
   - orchestration
   - contracts
   - decision model
   - questioning strategy
   - stopping criteria
   - anti-generic behavior
   - grounding rules
   - loop-truth integration points
   - artifact-quality integration points

### Wave 4 Readiness Link

Wave 4 readiness is not truthful if onboarding intelligence remains:
- generic
- under-specified
- disconnected from artifact quality
- disconnected from loop truth

So the onboarding intelligence planning track is a required canonical input to Wave 4 readiness judgment,
even though it does not block the active `W3-PTH-*` queue by itself.
