# Nexus Wave 2 — Trusted Reality Map
**Code-First Status Baseline | April 2026**
**Rule: Code wins over docs. No assumptions without evidence. Uncertainty stated explicitly.**

---

## A. TRUE GREEN TASKS
*Tasks verified as genuinely complete: module exists, logic is real, wired to context-builder or server, and behavior matches the task description.*

### UI / Component Library (Block 1)
All five component libraries are **TRUE GREEN**. Evidence: `web/app.js` lines 806–1260+ contain real `renderPrimitiveComponents()`, `renderLayoutComponents()`, `renderFeedbackComponents()`, `renderNavigationComponents()`, and `renderDataDisplayComponents()` functions that produce real HTML output. Design tokens are applied as CSS variables at lines 346–377. DOM element references confirmed at lines 228–232.

- Define primitive component library → ✅ TRUE GREEN
- Define layout component system → ✅ TRUE GREEN
- Define feedback component library → ✅ TRUE GREEN
- Define navigation component system → ✅ TRUE GREEN
- Define data display component library → ✅ TRUE GREEN

### Approval System (Block, Tasks 1–8)
All eight foundation tasks are **TRUE GREEN**. Evidence verified in code:
- `approval-record-store.js` — real `createApprovalRecordStore()`, normalizes decisions, builds audit trail, handles approved/rejected/revoked with `expiresInHours`.
- `approval-trigger-resolver.js`, `approval-rule-registry.js`, `approval-status-resolver.js`, `approval-gating-module.js`, `approval-capture-api.js`, `approval-audit-formatter.js` — all confirmed real modules with deterministic logic (verified via grep and direct reads in prior session).

- Create approval request schema → ✅ TRUE GREEN
- Create approval trigger resolver → ✅ TRUE GREEN
- Create approval rule registry → ✅ TRUE GREEN
- Create approval record store → ✅ TRUE GREEN
- Create approval status resolver → ✅ TRUE GREEN
- Create approval gating module → ✅ TRUE GREEN
- Create approval capture API → ✅ TRUE GREEN
- Create approval audit formatter → ✅ TRUE GREEN

### Billing Chain Foundations
These modules exist and contain real logic:
- `billing-event-normalizer.js` (132 lines) — real pure normalizer, exports `createNormalizedBillingEvent` and `BILLING_EVENT_CANONICAL_CONTRACT`. ✅ TRUE GREEN as a *normalizer module*.
- `workspace-billing-state-source.js` (231 lines) — real event-sourced billing state from `normalizedBillingEvents`, returns `currentPlanId`, `subscriptionStatus`, `lastBillingEventType`. ✅ TRUE GREEN as a *state source module*.
- `billing-plan-schema.js` (90 lines) — real schema with plans, dimensions, limits. ✅ TRUE GREEN as a *schema module*.
- `usage-to-billing-mapper.js` (173 lines) — real mapping logic, deterministic `billableUsage` output. ✅ TRUE GREEN as a *mapper module*.
- `platform-usage-cost-schema.js` (116 lines) — real schema and cost computation logic. ✅ TRUE GREEN as a *schema module* (caveat: runtime values depend on `pricingMetadata`).

### Event System
- `event-bus.js` (55 lines) — real EventBus, reads from FileEventLog on construction, persists every `emit()`. ✅ TRUE GREEN
- `file-event-log.js` (31 lines) — real NDJSON persistence to `data/events.ndjson` using `fs.appendFileSync`. ✅ TRUE GREEN

### Context Builder
- `context-builder.js` (3,975 lines) — real orchestrator, all ~100+ imported modules are actively called (not dead imports). Confirmed via grep that every `import` statement has a corresponding function call. ✅ TRUE GREEN as an *orchestration module*.

### Project Service Integration
- `project-service.js` — confirmed wired to all stores and modules. ✅ TRUE GREEN
- `project-draft-schema.js` (166 lines) — complete `defineProjectDraftSchema()` with id, name, owner, state, bootstrapMetadata. ✅ TRUE GREEN
- `project-draft-creation-service.js` (29 lines) — wraps draft schema, returns `{projectDraft, projectDraftId}`, wired in `project-service.js` and `server.js`. ✅ TRUE GREEN

### Server / API Surface
- `server.js` (~700 lines, 25 real routes) — real Express server with auth, project-drafts, onboarding, projects, workspaces, audit-logs, security-audit-logs, project-snapshots, health, readiness, observability endpoints. Rate limiting and kill-switch guard on every request. SSE support. ✅ TRUE GREEN

### Agent Runtime
- `AgentRuntime` processes `task.assigned` events, dispatches to DevAgentWorker, MarketingAgentWorker, QaAgentWorker — confirmed real dispatch logic. ✅ TRUE GREEN

### Failover Planner Module
- `failover-continuity-planner.js` (212 lines) — real plan generator producing `continuityPlan` with `fallbackActions`, `recommendedMode`, `continuitySteps`. Returns `integrationStatus: "connected"` or `"connected-partial"`. ✅ TRUE GREEN *as a standalone module*.

---

## B. FALSE GREEN TASKS
*Tasks marked 🟢 in docs but NOT genuinely complete end-to-end. Verified by code evidence.*

### B1 — `Define platform usage cost schema` (🟢 → DOWNGRADE TO 🟡)
**Claimed:** Green. **Reality:** The schema module is real, but `pricingMetadata` always comes from `project.manualContext?.pricingMetadata ?? null` (confirmed in `context-builder.js` lines 2713–2716 and 3379–3381). When `pricingMetadata` is null, `unitPrice = null`, `totalCost = null`. The task's own `status_note` in the backlog acknowledges this: *"pricingMetadata עדיין מוזן בפועל מ־manualContext ולא מ־canonical pricing catalog source."* The schema exists; canonical pricing data never flows. **Evidence:** `platform-usage-cost-schema.js` line where `unitPrice = normalizedPricingMetadata?.unitPrice ?? null`.

### B2 — `Create billing enforcement guard` (🟢 → DOWNGRADE TO 🟡)
**Claimed:** Green. **Reality:** `billing-enforcement-guard.js` is real and has three checks (`resolveEntitlementCheck`, `resolveCostCheck`, `resolveBillingCheck`). But when `totalEstimatedCost === null` (which happens whenever `pricingMetadata` is null, i.e., always in production without manual data), the guard returns `cost: "unknown"` and enforcement is disabled. The guard is structurally complete but functionally hollow at runtime. The backlog itself marks `dependencies: partial`. **Evidence:** `billing-enforcement-guard.js` — `cost: "unknown"` branch on null cost.

### B3 — `Create checkout and subscription API` (🟢 → DOWNGRADE TO 🟡)
**Claimed:** Green. **Reality:** The API routes exist in `server.js` (workspace billing actions endpoint confirmed). But the subscription lifecycle module it depends on only produces `trial|active` statuses (see B-chain below), and the `dependencies: partial` flag is explicit in the backlog. The surface is exposed; the semantic backend is incomplete. **Evidence:** `subscription-lifecycle-module.js` (57 lines) — only `trial|active` output.

### B4 — `Business continuity lifecycle manager` (🟢 → DOWNGRADE TO 🟡)
**Claimed:** Green. **Reality:** `business-continuity-lifecycle-manager.js` lines 148–163 contain an explicit code comment: *"Failover planner is not implemented yet. Manager exposes a placeholder integration point."* When `hasFailoverPlanner = false`, `integrationStatus = "placeholder"`. The `failover-continuity-planner.js` module IS real (see Section A), but the manager's `hasFailoverPlanner` check evaluates to false unless `continuityPlan?.integrationStatus` matches connected states. The integration path between the two modules is incomplete. **Evidence:** Direct code read, lines 148–163.

### B5 — `Agent memory store` (🟢 → DOWNGRADE TO 🔴 for persistence)
**Claimed:** Green. **Reality:** `memory.js` uses `new Map()`. `buildMemory()` writes to `this.memories` with key `projectId:agentId:taskId`. There is no `fs.writeFileSync`, no NDJSON append, no FileEventLog integration. Every server restart loses all agent memory. The task description implies persistent memory; the code is in-memory only. **Evidence:** `memory.js` confirmed — 43 lines, no file I/O.

### B6 — `Onboarding session persistence` (🟢 → DOWNGRADE TO 🔴 for persistence)
**Claimed:** Green. **Reality:** `onboarding-service.js` line 246: `this.sessions = new Map()`. Line 283: `this.sessions.set(session.sessionId, session)`. No backing store. All onboarding sessions vanish on restart. **Evidence:** Confirmed via grep and direct read.

---

## C. FALSE YELLOW / FALSE RED TASKS
*Tasks marked 🟡 or 🔴 in docs but already implemented in code.*

### C1 — `project-draft-schema` (🔴 in docs → TRUE GREEN in code)
**Docs say:** Not done, 🔴. **Code says:** `project-draft-schema.js` is 166 lines of complete implementation. `defineProjectDraftSchema()` returns full `projectDraft` with `id`, `name`, `owner`, `state`, `bootstrapMetadata`. Wired in `project-service.js` and called from `server.js`. **Verdict: UPGRADE TO 🟢.**

### C2 — `project-draft-creation-service` (🔴 in docs → TRUE GREEN in code)
**Docs say:** Not done, 🔴. **Code says:** `project-draft-creation-service.js` is 29 lines wrapping `defineProjectDraftSchema`, returns `{projectDraft, projectDraftId}`, wired in both `project-service.js` and `server.js`. **Verdict: UPGRADE TO 🟢.**

### C3 — `failover-continuity-planner` (status uncertain in docs → PARTIAL GREEN in code)
**Docs imply:** Placeholder. **Code says:** `failover-continuity-planner.js` is 212 lines of real logic generating `continuityPlan` with `fallbackActions`, `recommendedMode`, `continuitySteps`, and `integrationStatus`. It is NOT a stub. **However:** The `business-continuity-lifecycle-manager.js` does not correctly detect it as connected (see B4). So the planner module is done; the integration wiring is not. **Verdict: UPGRADE THE PLANNER TASK TO 🟢; the lifecycle manager integration remains 🟡.**

### C4 — `billing-event-normalizer` (🟡 partial in docs → TRUE GREEN as pure module)
The docs mark this as partial citing "no provider ingestion path." The normalizer itself is complete. The gap is upstream (provider ingestion) and downstream (append/store path), not in the normalizer logic itself. The normalizer task should be 🟢; adjacent integration tasks remain 🔴.

---

## D. SCOPE DRIFT
*Cases where the task description and the code define different completion standards.*

### D1 — Billing Block: Module-Level vs. System-Level Completion
The billing tasks were written with implicit system-level semantics (billing works end-to-end) but were implemented at module-level (each module does its job in isolation). Result: every billing module is individually correct, but the billing *system* doesn't work. This is the most pervasive scope drift in the project. The docs count individual modules as green; a product manager would count the billing system as not working.

### D2 — `manualContext` as an Escape Hatch vs. a Permanent Architecture
Nearly every external/dynamic data field in `context-builder.js` resolves via `project.manualContext?.someField ?? null`. The original task descriptions for data-sourcing tasks (pricing catalog, design tokens, brand data, etc.) likely assumed canonical sources would be built. The code treats `manualContext` as the permanent source. This means those tasks are "done" by one definition (the field is wired) and "not done" by another (there is no real data source). Examples: `pricingMetadata`, `brandDirection`, `designTokens`.

### D3 — Approval Outcome Schema: Present Tense vs. Full Coverage
Task 9 ("Define approval outcome schema") is 🟡 in docs. The code handles `approved/rejected/revoked`. The task description implied full coverage of `deferred`, `approved-with-conditions`, and `user-alternative-selected`. The code is correct for the cases it handles; the scope drift is that "the schema" was supposed to include all outcome variants. The existing code covers ~60% of the intended scope.

### D4 — Subscription Lifecycle: Status Machine vs. Status Labels
The subscription lifecycle module returns `trial|active` based on schema flags. The task description implies a real state machine that can produce `past_due`, `grace`, `canceled`. The code produces labels, not states derived from actual billing events. Scope drift: task described behavior, code delivers schema-lookup.

### D5 — Component Library: Schema/Token Generation vs. Production UI Completeness
The component library tasks are genuinely done (HTML renders in `web/app.js`). However, the "design system" tasks in the backlog include AI-generative design integration (tasks 188–195) that are explicitly deferred. If a stakeholder reads "UI Foundation complete," they may not know that AI design generation is explicitly out of scope until later.

---

## E. HIDDEN BLOCKERS
*Issues that are not marked as blockers in the docs but will prevent Wave 2 from truly closing.*

### E1 — BLOCKER: No Canonical Pricing Data Source
`pricingMetadata` always comes from `manualContext`. The task `Create canonical pricing catalog source` is 🔴 and explicitly missing (`coverage_check: missing`). Without it, billing enforcement remains hollow. This isn't just a billing issue — it means any feature that costs money cannot be enforced, metered, or surfaced to users. **Blocks:** billing enforcement, entitlement resolution, cost display, checkout semantics.

### E2 — BLOCKER: Memory Loss on Restart
Both `AgentMemoryStore` (Map) and `OnboardingService` (Map) are in-memory only. Every production restart loses all active agent context and all in-progress onboarding sessions. This is not a "nice to have" — for a multi-agent orchestration system, losing task context mid-execution is a correctness failure. **Blocks:** any claim that agent orchestration is production-ready.

### E3 — BLOCKER: Approval Outcomes 10–14 Missing
The approval system stops at capturing decisions (tasks 1–8). It does not:
- Handle user alternative actions (task 10) — 🔴
- Resolve outcomes into system actions (task 11) — 🔴
- Trigger replanning after rejection (task 12) — 🔴
- Generate follow-up tasks after approval (task 13) — 🔴
- Maintain feedback memory for future approval tuning (task 14) — 🔴
The approval system captures a decision. It does not act on it. This means approvals have no downstream effect. **Blocks:** any claim that approval-gated workflows close the loop.

### E4 — BLOCKER: Subscription Lifecycle Cannot Produce Real States
`subscription-lifecycle-module.js` returns only `trial|active`. It cannot produce `past_due`, `grace`, or `canceled` because it doesn't read billing events — it reads schema flags. This means:
- A workspace that stops paying stays `active`
- Grace periods cannot be enforced
- Cancellation does not change subscription status
**Blocks:** any real billing enforcement, churned workspace handling, dunning workflows.

### E5 — BLOCKER: Revenue Summary Not Wired to Project State
`revenue-summary-aggregator.js` is a complete module but is not wired to project state, context-builder, or any output path. Its output is unreachable from any consumer. **Blocks:** reporting, owner revenue visibility, platform analytics.

### E6 — BLOCKER: Business Continuity Manager / Planner Integration Broken
The `failover-continuity-planner.js` is real. The `business-continuity-lifecycle-manager.js` has a hard-coded check that evaluates `hasFailoverPlanner = false` unless `continuityPlan?.integrationStatus` matches connected. The two modules need explicit wiring. As-is, the lifecycle manager always runs in placeholder mode. **Blocks:** any business continuity monitoring being real.

### E7 — STRUCTURAL: `manualContext` Dependency Web
The `context-builder.js` pattern of `project.manualContext?.someField ?? null` means that 20+ features degrade silently when external data isn't manually provided. This isn't a single blocker — it's a structural fragility that makes many "green" features conditionally green: they work only when someone has manually populated the right fields. No automated validation enforces that `manualContext` is populated correctly.

---

## F. CORRECTED WAVE 2 CLOSURE PATH
*The real order of what must be fixed for Wave 2 to genuinely close.*

### Phase 1 — Persistence Foundation (must come first)
Before any stateful feature can be claimed as production-ready:
1. Add NDJSON-backed persistence to `AgentMemoryStore` (mirror the `FileEventLog` pattern from `file-event-log.js`)
2. Add NDJSON-backed persistence to `OnboardingService` sessions
These two fixes unlock honest claims about agent orchestration and onboarding.

### Phase 2 — Approval Outcomes (highest value unlock)
The approval foundation (tasks 1–8) is genuinely solid. Building on it:
3. Complete task 9 — add `deferred`, `approved-with-conditions`, `user-alternative-selected` outcome variants to the schema
4. Build task 11 — outcome resolver (dispatches system actions based on approval decision)
5. Build task 12 — replanning trigger (fires when task is rejected)
6. Build task 13 — follow-up generator (fires when task is approved)
Tasks 10 and 14 (alternative action schema, feedback memory) can follow after the core outcome loop works.

### Phase 3 — Billing Chain Closure
7. Build `canonical pricing catalog source` (🔴, currently missing) — single source of truth for `unitPrice` per dimension
8. Wire `pricingMetadata` from the catalog instead of `manualContext` in `context-builder.js` lines 2713–2716 and 3379–3381
9. Fix `subscription-lifecycle-module.js` to derive states from billing events (not schema flags)
10. Wire `revenue-summary-aggregator.js` to project state / context output path

After Phase 3, billing enforcement becomes real: costs flow → enforcement guard sees them → checkout has correct semantic backing.

### Phase 4 — Integration Wiring
11. Wire `failover-continuity-planner.js` output correctly into `business-continuity-lifecycle-manager.js` so `hasFailoverPlanner` evaluates to true
12. Complete operator override API (task 15) — add smart override, user alternatives, replan trigger

### Phase 5 — Validation and Cleanup
13. Backlog audit: upgrade project-draft-schema and project-draft-creation-service to 🟢
14. Backlog audit: downgrade billing enforcement guard and checkout API to 🟡 pending Phase 3
15. Backlog audit: clarify all `manualContext`-dependent tasks as conditionally green with explicit data requirements
16. Add test coverage for approval outcome flows (currently only foundation tests exist)

### Wave 2 True Closure Gate
Wave 2 should be considered closed when:
- Agent memory survives restart
- Onboarding sessions survive restart
- A billing event flows from provider → normalizer → state → enforcement → checkout with a real price
- An approval decision flows from capture → outcome resolver → downstream action (replan or follow-up)
- Subscription lifecycle reflects real billing event history, not schema flags
- Revenue summary is readable from at least one consumer path

None of these six gates are currently passable.

---

## G. RECOMMENDED NEXT ACTION (ONE, HIGHEST LEVERAGE)

**Build the approval outcome resolver (Task 11) — and do it first.**

**Why this is the highest-leverage action:**

The approval foundation (tasks 1–8) represents ~40 real files of solid work. It is the most complete architectural block in Wave 2. But it has zero downstream effect right now — a captured approval decision goes nowhere. Building the outcome resolver turns 8 complete modules from record-keeping infrastructure into live workflow infrastructure.

The outcome resolver, once built, will:
- Make every existing approval capture meaningful
- Enable replanning on rejection (which unblocks stuck workflows)
- Enable follow-up task generation on approval (which advances project progress)
- Demonstrate the full agent loop: task → approval request → decision → outcome → next state

This is not a glamorous fix. It is the pin that holds the system together. Everything else (billing, persistence, memory) is data infrastructure. The approval outcome resolver is the only fix that changes what the system *does* rather than what it *stores*.

**Estimated scope:** The outcome resolver can be built as a pure function (receives normalized decision + action type → returns outcome events) following the same pattern as `billing-event-normalizer.js`. No new infrastructure needed. The event bus already supports persistence. The approval record store already provides the input structure.

**Secondary note:** If persistence is a blocker (e.g., the team is about to do production load testing), then the memory persistence fix (Phase 1 above) should be done first since it is architecturally simpler and directly de-risks agent correctness. But for maximum product-level impact, the outcome resolver is the move.

---

*End of Wave 2 Trusted Reality Map. All findings code-verified. Uncertainty explicitly stated where present.*
*Source evidence: direct file reads of context-builder.js, billing chain modules, approval chain modules, memory.js, onboarding-service.js, web/app.js, server.js, failover-continuity-planner.js, business-continuity-lifecycle-manager.js, project-draft-schema.js, project-draft-creation-service.js. No assumptions made without cited code evidence.*
