# Nexus Code-First Audit Report

**Methodology**: CODE IS THE SOURCE OF TRUTH. Every finding below is backed by direct file reads. No assumption is stated without evidence.

**Audit Scope**: Full codebase + all backlog docs. Where docs contradict code, CODE WINS.

**Date**: 2026-04-12

---

## A. Real System State (Code-First)

### Infrastructure

| Layer | Component | Status | Evidence |
|---|---|---|---|
| Runtime | Node.js ESM modules | ✅ Real | `package.json` `"type": "module"` |
| HTTP Server | `src/server.js` (~700 lines) | ✅ Real | Full HTTP server with ~25 real routes |
| Entry Point | `src/index.js` | ✅ Real | Startup file |
| Persistence | `FileEventLog` NDJSON | ✅ Real | `file-event-log.js` — fs.appendFileSync/readFileSync |
| Event Bus | `EventBus` class | ✅ Real | Reads events from file on startup, emits + persists |
| Orchestrator | `NexusOrchestrator.runCycle()` | ✅ Real | Full cycle: plan → dispatch → memory → emit |
| Agent Runtime | `AgentRuntime` | ✅ Real | Consumes `task.assigned`, dispatches to 3 workers |
| Dependencies | Zero external npm packages | ⚠️ Intentional | `package.json` has no `dependencies` field |
| Tests | 342 test files in `/test/` | ✅ Real | Using `node:test` + `node:assert/strict`, real assertions |

### Core Pipeline

The system's primary function is `buildProjectContext()` in `context-builder.js` (3,975 lines). This function:
- Imports ~100+ modules from `src/core/`
- All imports ARE actively called (verified via line-by-line read)
- Builds an enormous context object (100+ properties) returned at line 3974
- Runs sequentially: domain detection → planner → dispatcher → memory → approvals → billing → UI design → AI companion → persistence schema

This is the real system. It is not a skeleton.

### Data Persistence Stores

All stores in `project-service.js` constructor are NDJSON-backed:
- `systemAuditLogStore`
- `securityAuditLogStore`
- `projectSnapshotStore`
- `projectReviewThreadStore`

These persist across process restarts. The event log (`data/events.ndjson`) also persists.

**Exception**: `AgentMemoryStore` (memory.js, 43 lines) uses `new Map()`. In-memory only. No persistence.

### HTTP API Surface (verified in server.js)

- `GET /api/health` — liveness
- `GET /api/readiness` — readiness
- `GET /api/observability` — platform traces/logs
- `GET/POST /api/audit-logs` — system audit log
- `GET /api/security-audit-logs` — security events
- `GET /api/project-snapshots` — project snapshot history
- `POST /api/auth/signup` — user registration
- `POST /api/auth/login` — user login
- `POST /api/auth/logout` — user logout
- `POST /api/project-drafts` — create project draft
- `POST /api/onboarding/sessions` — start onboarding
- `POST /api/onboarding/intake` — submit project intake
- `POST /api/onboarding/resolve-step` — advance onboarding step
- `POST /api/onboarding/commands` — onboarding action commands
- `PATCH /api/onboarding/sessions/:id/intake` — update intake
- `POST /api/onboarding/sessions/:id/files` — upload files
- `GET /api/onboarding/sessions/:id/step` — get current step
- `POST /api/onboarding/sessions/:id/finish` — complete onboarding
- `GET /api/onboarding/sessions/:id` — get session
- `POST /api/projects/:id/proposal-edits` — proposal edits
- `POST /api/projects/:id/partial-acceptance` — approval acceptance
- `POST /api/workspaces/:id/billing/*` — billing actions
- Rate limiting and kill-switch guard on every request

---

## B. Backlog Status Verification (Code vs. Docs)

### Cases Where Docs Are WRONG (Code Won)

| Task | Docs Status | Code Reality | Verdict |
|---|---|---|---|
| `Define project draft schema` | 🔴 Not done | `project-draft-schema.js` — 166 lines, complete, real | **DOCS WRONG — Code is done** |
| `Create project draft creation service` | 🔴 Not done | `project-draft-creation-service.js` — 29 lines, functional, wired in project-service + server | **DOCS WRONG — Code is done** |
| `working-priority-list.md` P0 items | Listed as P0 still in progress | Most are implemented in code | **DOCUMENT IS OUTDATED — Do not use** |

### Cases Where Code Is Thinner Than Docs Imply

| Task | Docs Status | Code Reality | Verdict |
|---|---|---|---|
| `Agent Memory` | 🟢 Done | `memory.js` — 43 lines, in-memory `Map()` only, no persistence | **Partial — in-memory only** |
| `Business Continuity Failover` | 🟢 Done | Line 163 in `business-continuity-lifecycle-manager.js`: "Failover planner is not implemented yet. Manager exposes a placeholder integration point." | **Explicit placeholder in code** |
| `Platform Usage Cost Schema` | 🟢 Done | Implementation is real but `pricingMetadata` always injected from `project.manualContext?.pricingMetadata ?? null`. No canonical pricing catalog. | **Real but pricing-gap** |
| `Task Result Ingestion` | 🟡 Partial | `task-result-ingestion.js` — 33 lines, just filters/maps `task.completed`/`task.failed` events from runtime results. No retry logic, no persistence wiring. | **Minimal but functional** |

### Cases Genuinely Confirmed Done

The following were suspected as potentially fake-green but are confirmed REAL upon code inspection:

- **Billing Event Ingestion** (`billing-event-ingestion-service.js`): Real deduplication via `idempotencyKey`, returns accepted/rejected/duplicate. Complete.
- **Billing Event Normalizer** (`billing-event-normalizer.js`): Real field-by-field normalization with contract validation. Complete.
- **Billing Plan Schema** (`billing-plan-schema.js`): Real, defines plans/dimensions/limits from `platformCostMetric` and `agentGovernancePolicy`. Complete.
- **Billing Enforcement Guard** (`billing-enforcement-guard.js`): Real, three-check system (entitlement + cost + billing state). Graceful degradation when cost is null. Complete.
- **Usage-to-Billing Mapper** (`usage-to-billing-mapper.js`): Real dimension mapping with source rules. Complete.
- **Workspace Billing State Source** (`workspace-billing-state-source.js`): Real event-sourced subscription state derivation. Complete.
- **Approval Gating Module** (`approval-gating-module.js`): Real, handles all approval states. Complete.
- **Approval Record Store** (`approval-record-store.js`): Real, builds full audit trail. Complete.
- **Project Draft Schema** (`project-draft-schema.js`): Real, complete. (Backlog says 🔴, but CODE IS DONE.)
- **Bootstrap Plan Generator** (`bootstrap-plan-generator.js`): Real, wires to task templates. Complete.
- **Design Token Schema** (`design-token-schema.js`): Real, not a stub — builds 6 token families from `brandDirection`. Complete.
- **Business Context Layer** (`business-context-layer.js`): Real — domain-specific KPIs, positioning, funnel inference. Complete.
- **Decision Intelligence Layer** (`decision-intelligence-layer.js`): Real — approval decisions, executable decisions. Complete.
- **EventBus + FileEventLog**: Real — append-only NDJSON, reads on startup, notifies listeners. Complete.

---

## C. Broken Flows and Missing Links

### Critical Gap 1: No Canonical Pricing Catalog

**Code evidence**: `context-builder.js` lines 2714–2715 and 3380:
```js
pricingMetadata: project.manualContext?.pricingMetadata ?? null,
```

**Effect chain**:
1. `definePlatformUsageCostSchema` receives `pricingMetadata = null`
2. `normalizedPricingMetadata.unitPrice = null`
3. `calculateTotalCost(quantity, null) = null`
4. `billing-enforcement-guard.js` receives `totalEstimatedCost = null`
5. Guard returns `cost: "unknown"` — cost enforcement is DISABLED

**What's missing**: A module that builds `pricingMetadata` from a canonical source (config file, database, environment variable). Without this, the billing enforcement chain is wired but effectively bypassed.

### Critical Gap 2: Agent Memory Has No Persistence

**Code evidence**: `memory.js` uses `new Map()`. No file or database store.

**Effect**: If the server restarts, all agent memory is lost. The agent runtime cannot be reconstructed to its pre-restart state. Long-running orchestration cycles cannot survive restarts.

### Critical Gap 3: Business Continuity Failover Is a Placeholder

**Code evidence** (`business-continuity-lifecycle-manager.js`, line 163):
```
"Failover planner is not implemented yet. Manager exposes a placeholder integration point."
```

The `business-continuity-lifecycle-manager.js` tracks that `hasFailoverPlanner = false` and marks the failover integration as `"placeholder"` status. The scaffolding exists but the execution path is empty.

### Critical Gap 4: `manualContext` Over-Reliance

**Code evidence** (throughout `context-builder.js`): Nearly all external/dynamic data falls back to `project.manualContext?.someField ?? null`. Examples:
- User identity: `project.manualContext?.userProfile?.email`
- Auth credentials: `project.manualContext?.credentials`
- Webhook config: `project.manualContext?.channelConfig`
- Pricing: `project.manualContext?.pricingMetadata`
- Notification preferences: `project.manualContext?.deliveryPreferences`
- Workspace metadata: `project.manualContext?.workspaceMetadata`

**Effect**: The entire context pipeline produces schema-valid but data-empty output unless `manualContext` is populated by an external caller. This is a deliberate MVP design choice, but it means no live data flows through the system without an explicit integration layer injecting `manualContext`. This integration layer does not currently exist.

### Critical Gap 5: Onboarding Answer Persistence Is Missing

**Code evidence**: `onboarding-service.js` exists and is wired to the server and `project-service.js`. However, there is no `onboarding-answer-persistence-store.js` file in `src/core/`. Onboarding session state lives in `onboarding-service.js` internal maps.

**Effect**: Onboarding sessions survive only as long as the process is running. On restart, all sessions are lost.

### Critical Gap 6: AI Design Integration Block Is Deferred With No Trigger

**Code evidence** (confirmed in previous audit): Tasks 188–195 in the execution plan are flagged as deferred with no activation trigger. The `aiLearningWorkspaceTemplate` and `aiCompanionWorkspaceTemplate` are called in `context-builder.js` (lines 2274 and 2369), but the data they depend on (`project.context?.learningInsights`, `project.context?.learningTrace`) is never populated by any current module chain. These modules are wired but receive `null` inputs.

---

## D. Wave 2 Completion Truth

### Official Count (from docs)
- 85 🟢 done, 2 🟡 partial, 172 🔴 not done (as of last snapshot)

### Code-Based Correction

**True status assessment**:

| Category | Doc Count | Code Reality | Delta |
|---|---|---|---|
| Genuinely complete (real logic, real wiring) | ~83 | ~83 | ~0 |
| Marked done but partial/hollow | ~2 (in docs) | ~4–6 | +2–4 false greens |
| Marked not done but actually implemented | 0 (per docs) | 2 confirmed (project-draft-schema, project-draft-creation-service) | -2 false reds |
| "Legacy green" (pre-new-criteria, not re-audited) | 64 (flagged in backlog) | Cannot confirm without reading all 64 | Unresolved |

**Specific false greens confirmed**:
1. **Agent Memory persistence** — in-memory Map, marked done but not persistence-complete
2. **Business Continuity Failover** — explicit placeholder text in source code
3. **Pricing enforcement** — chain wired but hollow without canonical pricing catalog

**Specific false reds confirmed (docs wrong, code done)**:
1. `Define project draft schema` — 🔴 in docs, code is 100% complete
2. `Create project draft creation service` — 🔴 in docs, code is functional and wired

### Wave 2 Honest Completion Estimate

Docs claim 85/259 tasks green (33%). Code confirms approximately 83 genuinely complete with 2 false greens and 2 false reds. Net corrected count: ~83 honest greens. The 172 not-done tasks remain not done. **Wave 2 is approximately 32% complete** by task count, though quality of completed modules is high.

---

## E. Corrected Execution Plan

### What Must Be Fixed Before New Work Begins (Blockers)

These must be resolved first as they invalidate downstream assumptions:

**Blocker 1 — Update `docs/working-priority-list.md`**
The document lists P0 items that are already implemented. It MUST NOT be used to guide work. Replace with current `backlog-unified-status-and-order.md`.

**Blocker 2 — Mark `project-draft-schema.js` and `project-draft-creation-service.js` as 🟢 in all backlog docs**
Code is done. Docs say 🔴. This inconsistency will cause duplicate work.

**Blocker 3 — Decide on `manualContext` integration strategy**
Every external data call currently falls back to `project.manualContext`. Before building more features, decide: (a) keep `manualContext` as the canonical injection point and document what must be in it, or (b) build canonical data sources. This decision shapes the entire P0 block.

### Priority 1 (fix before building anything else)

1. **Create canonical pricing catalog module** — A new module (e.g., `platform-pricing-catalog.js`) that returns `pricingMetadata` based on plan tier or config. Wire into `buildProjectContext()` at the `definePlatformUsageCostSchema` call site. Without this, billing enforcement is always `"unknown"`.

2. **Add persistence to `AgentMemoryStore`** — Replace `new Map()` with an NDJSON-backed store (same pattern as `systemAuditLogStore`). Critical for agent orchestration across restarts.

3. **Add persistence to OnboardingService** — Create `onboarding-session-store.js` using the same NDJSON pattern. Onboarding sessions must survive restarts.

### Priority 2 (high-value, unblocked)

These are the P0 tasks from `backlog-unified-status-and-order.md` that have no blockers:

4. **Complete `Task Result Ingestion`** — Current 33-line implementation only maps events. Needs: validation of result schema, linking back to original task contract, triggering re-plan on failure.

5. **Build `Scheduler`** — Wire the existing orchestration cycle into a time/event-triggered scheduler. The `NexusOrchestrator.runCycle()` exists; it needs a trigger mechanism.

6. **Complete `Cross-Functional Task Graph`** — The execution graph module exists (`project-graph.js`) but needs validation of multi-lane dependencies.

7. **Resolve the failover placeholder in `business-continuity-lifecycle-manager.js`** — Either implement basic failover or explicitly remove the placeholder marker and mark it as a P2 feature.

### Priority 3 (Wave 2 remaining tasks)

Continue with `backlog-unified-status-and-order.md` in execution order. The 172 remaining 🔴 tasks are correctly marked. Focus on:
- Execution Feedback Layer completion (task result collection → context update → re-plan)
- Live progress model
- Agent execution reports
- Real agent capabilities (branch, code edit, test, build, PR)

### Do Not Start Yet

- AI Design Integration block (tasks 188–195) — deferred, no input data, no trigger
- Cross-Project Memory and Learning Layer (P3)
- External execution environment (sandbox, container) — P1, needs working agent pipeline first
- Delivery/Release Flow — P2, needs working execution first

---

## F. 6-Agent Team Model With Exact Boundaries

### Role 1: Orchestration Agent (owns the core pipeline)

**Owns**: `context-builder.js`, `orchestrator.js`, `agent-runtime.js`, `event-bus.js`, `file-event-log.js`, `project-service.js`

**Must do**:
- Add persistence to `AgentMemoryStore`
- Wire the pricing catalog into `buildProjectContext()`
- Resolve `manualContext` strategy with architect before touching any input data flow

**Must NOT touch**: billing modules, approval modules, UI/design modules, server routes

---

### Role 2: Billing & Enforcement Agent (owns the billing chain)

**Owns**: All files in `src/core/` matching `billing-*`, `platform-usage-cost-schema.js`, `usage-to-billing-mapper.js`, `workspace-billing-*`, `revenue-summary-aggregator.js`, `subscription-lifecycle-module.js`

**Must do**:
- Create `platform-pricing-catalog.js` with canonical pricing metadata
- Wire catalog into `buildProjectContext()` (coordinate with Orchestration Agent on the specific call site at line 2713–2715)
- Add billing endpoint tests that verify cost enforcement path end-to-end

**Must NOT touch**: approval system, agent dispatch logic, project-service constructor

---

### Role 3: Approval & Policy Agent (owns gating)

**Owns**: `approval-gating-module.js`, `approval-record-store.js`, `approval-status-resolver.js`, `approval-audit-trail.js`, `policy-layer.js`, `policy-enforcement-guard.js`, `policy-trace-builder.js`, `policy-decision.js`, `privileged-action-authority-resolver.js`, `action-policy-registry.js`

**Must do**:
- Complete any approval-system tasks in P0 backlog that are not yet done
- Verify the full approval chain (request → record → status → gating decision → policy enforcement) is tested end-to-end

**Must NOT touch**: billing enforcement (that's Role 2), agent dispatch logic, server routing

---

### Role 4: Onboarding & Project Lifecycle Agent (owns user entry)

**Owns**: `onboarding-service.js`, `project-draft-schema.js`, `project-draft-creation-service.js`, `onboarding-to-state-handoff-contract.js`, `onboarding-completion-evaluator.js`, `project-state-bootstrap-service.js`, `bootstrap-*` modules

**Must do**:
- Create onboarding session persistence store (NDJSON-backed, same pattern as other stores)
- Mark `project-draft-schema.js` and `project-draft-creation-service.js` as 🟢 in all docs (they ARE done)
- Complete any remaining bootstrap flow tasks from P0

**Must NOT touch**: agent runtime, billing modules, server-level rate limiting

---

### Role 5: Execution Agent (owns agent dispatch and real execution)

**Owns**: `agent-runtime.js`, `dev-agent-worker.js`, `marketing-agent-worker.js`, `qa-agent-worker.js`, `task-result-ingestion.js`, `execution-feedback-*`, `execution-log-formatter.js`, `execution-progress-schema.js`, `live-progress-model.js`

**Must do**:
- Complete `task-result-ingestion.js` (current 33 lines is minimal)
- Build the Scheduler (trigger for `NexusOrchestrator.runCycle()`)
- Complete Execution Feedback Layer (live progress, log formatter, status API, completion notifier)

**Must NOT touch**: billing chain, approval system, context-builder internals, UI/design modules

---

### Role 6: Infrastructure & Quality Agent (owns testing, server, observability)

**Owns**: `server.js`, `application-server-bootstrap.js`, `rate-limiting-abuse-protection.js`, `feature-flag-resolver.js`, `emergency-kill-switch-guard.js`, all test files in `/test/`

**Must do**:
- Update `working-priority-list.md` — mark as outdated, replace with pointer to current backlog docs
- Ensure every new module has a corresponding test in `/test/`
- Run `node --test` on every PR
- Track the 64 "legacy green" tasks and re-audit them against new coverage criteria

**Must NOT touch**: core business logic modules, context-builder, billing, approval

---

## G. Step-by-Step Execution Workflow

This is the mandatory workflow for every task, regardless of role.

### Step 1: Claim

Before starting any task:
1. Read the task entry in `docs/backlog-unified-status-and-order.md`
2. Confirm the task is still 🔴 or 🟡 (not already done by a parallel agent)
3. Read any file listed in the task's `reads` or `depends_on` fields
4. Check if the implementation file already exists in `src/core/`

### Step 2: Implement

1. Write the implementation in `src/core/<module-name>.js`
2. Follow the established patterns: pure functions, normalized inputs, graceful null handling, explicit output shapes
3. If the module needs to be called from `context-builder.js`: coordinate with Orchestration Agent (Role 1) — do NOT edit `context-builder.js` without Role 1 sign-off
4. If the module writes to `manualContext`: stop, escalate to architect — this adds to the architectural debt

### Step 3: Test

1. Create `/test/<module-name>.test.js`
2. Tests MUST cover: happy path, missing inputs (null/undefined), invalid types, edge cases
3. Run `node --test` and confirm it passes
4. Do NOT mark a task done if the test is failing

### Step 4: Wire

1. If the module is called from `context-builder.js`: add the import and call site in coordination with Role 1
2. If the module exposes a server endpoint: add the route to `server.js` (Role 6 must review)
3. If the module affects the event stream: add the event type to `event-bus.js` subscriber list

### Step 5: Document

1. Update the task status in `docs/backlog-unified-status-and-order.md` from 🔴/🟡 to 🟢
2. Fill in the new backlog fields: `completion_type`, `coverage_check`, `user_facing_path`, `green_criteria`
3. Do NOT update `docs/working-priority-list.md` — it is deprecated

### Step 6: Review

Mandatory review by Role 6 (Infrastructure & Quality Agent):
1. Verify test file exists and passes
2. Verify no `manualContext` fallbacks were added without architectural review
3. Verify no `TODO`, `FIXME`, or `placeholder` strings appear in the new module
4. Confirm backlog doc was updated with full `green_criteria`

### Who Approves Each Step

| Step | Implementer | Reviewer | Approver |
|---|---|---|---|
| Implementation | Role-specific (1–5) | Role 6 | Architect |
| Test | Role-specific (1–5) | Role 6 | Automated (CI) |
| context-builder wiring | Role 1 only | Role 6 | Architect |
| server.js route | Role 6 | Role-specific | Role 6 |
| Backlog doc update | Role-specific (1–5) | Role 6 | Any agent |

---

## Summary of Critical Findings

| Finding | Severity | Action |
|---|---|---|
| `working-priority-list.md` is outdated and misleading | 🔴 High | Deprecate immediately |
| `project-draft-schema.js` and `project-draft-creation-service.js` are done but marked 🔴 in docs | 🔴 High | Update backlog docs |
| Pricing catalog gap — billing enforcement always returns `"unknown"` | 🔴 High | Create `platform-pricing-catalog.js` before any billing work |
| Agent memory is in-memory only — no persistence | 🟡 Medium | Add NDJSON persistence to `AgentMemoryStore` |
| Onboarding sessions are in-memory only | 🟡 Medium | Create session persistence store |
| Business continuity failover is an explicit placeholder | 🟡 Medium | Decide: implement or remove placeholder marker |
| `manualContext` is the only external data injection point | 🟡 Medium | Architect decision needed before P0 feature work |
| AI Design Integration block (188–195) has no input data | 🟢 Low | Defer; no activation trigger |
| 64 "legacy green" tasks not re-audited | 🟢 Low | Background audit by Role 6 |

---

*All findings are based on direct source code reads. No finding is based on documentation alone.*
