# Nexus — Deep Full-System Review

Date: 2026-06-10
Reviewer role: external honest full-system review (no implementation)
Repo root: `/Users/yogevlavian/Desktop/The Nexus`
Live app reviewed: `http://127.0.0.1:4011/` (running, real provider path active)
Method: canonical docs → code (server, project-service, web/app.js, shared engines, tests) → live browser flow → targeted API probes.

---

## A. Executive Summary

**Is Nexus heading in the right direction?**
Yes, directionally. The canonical system is unusually coherent for a project this size: the product vision (conversation-first product builder, cloud-canonical, momentum-first), the phase map, and the task map are internally consistent and mostly honest about what is and isn't done. The live shell is real, in Hebrew/RTL, with a clean front door, an LLM-backed discovery agent, a class-aware skeleton, and working multi-surface navigation (Build/History/Share/Release/Growth). The engine layer (project-service, snapshots, isolation, runtime-skeleton truth) is genuinely built, not faked.

**Biggest strength:** the *truth discipline* of the canon plus a real, restorable project/state engine. Project isolation is actually enforced server-side (verified live: outsider read → 404, unauth → 401), short-route restore works, refresh preserves the project, and the discovery agent is a real provider call, not a script.

**Biggest risk:** the **conversational mutation path fabricates success.** The visible Build agent will confidently reply "הבנתי — הוספת שדה תקציב משוער… מעדכן ומייצר שלד" while *no structured mutation occurs and the artifact does not change.* Real mutations exist only for ~6 hardcoded phrases on the lead-management skeleton (`record.create`, `record.addField` for "מקור ליד" specifically, `assignOwner`, `updateStatus`, two visual ops). Any other field/screen/product request falls through to `shouldApply:false` while the LLM still claims it was done. This directly violates the canon's core promise ("what I say changes the product") and the "no fake success / reply-must-not-claim-product-change" law — yet SLICE-006, BUILD-MUTATION-TRUTH-001, and BLD-AGT-001 are all `trueGreen`.

**What would most likely break user trust:** A user asks for a normal change in their own words, Nexus says it did it, and the screen doesn't change (or only the chat transcript "remembers" it). This is the single most damaging gap, because it occurs in the very first thing a real user does after the skeleton appears, and the product *sounds* successful while being wrong.

**Verdict (detail in §M): not ready for user testing.** It is close to *controlled internal dogfood by people who know the trained phrases*, but a naive user hits the fake-success path within minutes.

---

## B. Current Truth

**What Nexus can honestly do today**
- Present a clean, single-project front door with a visible local-identity boundary ("Local operator").
- Run a real, provider-backed discovery conversation (OpenAI/Anthropic clients exist; live `/conversation-prime` returns a real agent turn in ~9s).
- Generate a class-aware first skeleton for at least the internal-tool/lead-management class, with seeded records, owners, reminders, "next step," and runtime DOM truth anchors (`data-runtime-*`, `PRODUCT-KIND-001` resolution, `PRODUCT-BACKEND-SKEL-002` envelope).
- Persist a real `projectId`, restore it on refresh and on short-route navigation, and enforce owner-scoped project isolation at the API (404 for non-owners, 401 unauthenticated).
- Apply *deterministic* structured mutations when the user clicks runtime controls (`data-product-domain-operation`) or uses one of the trained chat phrases, and persist that mutation truth across refresh.
- Render truthful boundary copy on Release/Share/Growth ("local/mock product state stored inside Nexus project truth; not a deployed product backend", "Growth מציחה הזדמנויות… לא קמפיינים מומצאים").

**What it cannot honestly do yet**
- Apply an arbitrary conversational change reliably (only ~6 trained phrases produce real mutations).
- Produce a real product-owned package on disk (frontend+backend+deps+run command). The "product-owned backend skeleton" is an **in-memory described scaffold** (file paths as strings); nothing is written to `nexus-projects/...`. `PRODUCT-RUNTIME-PACKAGE-001` and `STANDALONE-ARTIFACT-001` are correctly still `new-proposed`.
- Verify, release, or run anything standalone (`VER-AGT-001`, `REL-AGT-001`, `REL-001..006` all unbuilt).
- Authenticate users beyond an **unverified `x-user-id` header** (no password/token check at the API; sequential, guessable user ids).
- Support teams/billing/SSO/privacy execution (all `new-proposed`).

**What it might appear to do but does not fully do**
- "Conversation changes the product" — appears true (agent says so), is false for untrained requests.
- "Your product has a backend" — a backend *envelope* is described and persisted as project truth; there is no runnable backend.
- "Release / share your product" — these surfaces render readiness language and boundaries, but there is no verified artifact behind them; they are framing, not capability (the canon is mostly honest about this).
- External-action blocking (WhatsApp/publish/pay) — works for trained phrasings but is keyword-fragile; an off-pattern WhatsApp+publish request in my live test was misclassified as a "small change needing clarification" rather than a bounded external-action refusal.

---

## C. Top 20 Findings

### 1. Conversational mutation fabricates success for untrained requests — CRITICAL
- Area: Build pipeline / product truth / user-facing language
- Evidence: `src/core/build-agent-downstream-action.js` hardcodes ~6 operations by Hebrew/English keyword. `record.addField` only fires for `/מקור ליד|שדה מקור|source field|lead source|מקור/`. Live: "תוסיף לכל ליד שדה תקציב משוער" → reply "הבנתי — הוספת שדה תקציב משוער… מעדכן ומייצר שלד," but no table column appeared and after refresh "תקציב" existed **only in the chat transcript** (2 occurrences, both in `<p>` chat bubbles). Same for "בדיקת אשראי." Reply text comes from `providerResult.reply` (`project-service.js` ~L1547) and is not gated by `buildAgentTurn.speechBoundary`.
- Why it matters: breaks the central promise and the "no fake success" law on the first real action.
- Recommended action: enforce `speechBoundary` — when `shouldApply` is false / `mayClaimChanged` is false, the visible reply must not claim a change; generalize field/screen mutation beyond hardcoded phrases or explicitly say "I can't apply that yet."
- Likely owner: `BUILD-MUTATION-TRUTH-001` / `BLD-AGT-001` (reopen) + `MUT-001`.

### 2. trueGreen mutation/build tasks were proven only on trained phrases — CRITICAL
- Area: Canonical execution / test quality
- Evidence: `scripts/verify-slice-006-live-proof.mjs` clicks `[data-product-domain-operation='record.create']` and uses recognized phrases; BLD-AGT-001 closure used exactly "תשנה את זה להזמנות במקום לידים," "תבדוק שהמסך עובד," "תחבר לי וואטסאפ אמיתי ותפרסם לי את זה." None test an arbitrary field name through the free-text path.
- Why it matters: the green is real but narrow; it masks the finding above. This is an overclaimed closure.
- Recommended action: add a negative live proof: arbitrary conversational change must either mutate truth or visibly decline — never claim success. Re-status SLICE-006/BUILD-MUTATION-TRUTH-001/BLD-AGT-001 to `existing-partial` until then.
- Likely owner: `BLD-AGT-001`, `SLICE-006`, `BUILD-MUTATION-TRUTH-001`.

### 3. Authentication is an unverified header — HIGH
- Area: Security / identity
- Evidence: `src/server.js` `resolveRequestUserId` trusts `x-user-id` header (or `userId` query for live-events). Live: `fetch('/api/projects/<id>', {headers:{'x-user-id':'user-2'}})` → 200 with no password/token. User ids are sequential (`user-2`, `user-3`). `authentication-system.js` infers status from presence of a password string, never verifies it.
- Why it matters: anyone who guesses a victim's sequential id gets full owner access by header. `EXP-009` (teams) and `BILLING-001` are about to build ownership/payment on top of this.
- Recommended action: real session token/cookie with server-side verification before EXP-009. SEC-001's own boundary defers this, but it should be an explicit, prioritized blocker, not "later."
- Likely owner: `ID-001` (reopen for token verification) / `SEC-001` boundary / new `AUTH-TOKEN-*`.

### 4. External-action blocking is keyword-fragile — HIGH
- Area: Security / provider boundary / Build agent
- Evidence: `build-agent-turn-router.js` routes provider/release only via `routingHints.includes("provider-release-boundary")` or narrow regex. Live: "תחבר וואטסאפ ותפרסם את המוצר ללקוחות שלי" was classified as "בקשת שינוי קטנה… צריך עוד הבהרה," not a bounded external-action refusal. No external action happened (none is wired), but the *boundary message* failed.
- Why it matters: the canon (`BUILD-RELEASE-GATE-001`, `PROV-001`) requires a *visible bounded refusal/approval-required state* for publish/pay/WhatsApp. Brittle matching means off-pattern external requests slip into the generic path.
- Recommended action: classify intent semantically (the provider already runs); treat any publish/connect/pay/send intent as external-boundary regardless of phrasing.
- Likely owner: `BUILD-RELEASE-GATE-001`, `PROV-001`, `BLD-AGT-001`.

### 5. Generated "product backend" is described, not generated — HIGH
- Area: Generated product truth / packages
- Evidence: `web/shared/product-owned-backend-skeleton.js` returns an envelope with `artifactRoot: "nexus-projects/.../product"`, `handlerFile: "backend/operations/*.js"`, `persistence: "product-owned-local-mock-store"` — all **strings**. No `fs` write anywhere (`grep writeFile` in core shows only snapshot/log writers). No `nexus-projects/` directory exists on disk.
- Why it matters: a user could read "your product has its own backend with operations and persistence" as a real artifact. It is metadata inside Nexus project truth.
- Recommended action: keep `PRODUCT-RUNTIME-PACKAGE-001`/`STANDALONE-ARTIFACT-001` as the only place that may claim a real package; ensure no Build/Release copy implies a runnable backend before they close. (The map is honest here; the risk is UI language.)
- Likely owner: `PRODUCT-RUNTIME-PACKAGE-001`, `STANDALONE-ARTIFACT-001`.

### 6. `web/app.js` is a 16,203-line monolith — HIGH
- Area: Code quality / architecture
- Evidence: `wc -l web/app.js` = 16,203; 94 top-level functions; owns routing, rendering, persistence, companion-turn orchestration, mutation dispatch, identity header injection, QA state, and copy sanitizing.
- Why it matters: highest-risk file in the repo; state coupling here is where `project-draft`/`nexusState`/`qaState` regressions keep reappearing (W4-FIX-007 reopened 2026-06-09).
- Recommended action: extract route/render/persistence/identity layers behind the existing `web/nexus-ui/adapters` boundary; treat as a `surface-architecture-pass`.
- Likely owner: new refactor task under `SURF-*` or a code-health task; not currently owned.

### 7. Release/Verification/Standalone chain entirely unbuilt — HIGH
- Area: Build pipeline / release readiness
- Evidence: `VER-AGT-001`, `REL-AGT-001`, `REL-001..006`, `STANDALONE-ARTIFACT-001`, `PRODUCT-RUNTIME-PACKAGE-001` all `new-proposed`. Release surface renders "מצב: פורסם / חסום" framing with no artifact behind it.
- Why it matters: "release-ready Nexus" is structurally far off; the release surface currently demonstrates framing only.
- Recommended action: none beyond honoring the map; ensure Release copy never implies a real publish.
- Likely owner: the REL/VER/PACKAGE chain.

### 8. Next canonical task (EXP-009) is rule-correct but not release-critical — MEDIUM
- Area: Canonical execution
- Evidence: `wave3-canonical-state.json.nextCanonicalExecutionTask = EXP-009` (teams), justified because EXP-005/ID-001/SEC-001 are satisfied. But the release critical path (§17) runs through PROV-001 → PRODUCT-RUNTIME-PACKAGE-001 → STANDALONE-ARTIFACT-001 → VER-AGT-001 → REL-AGT-001, none of which EXP-009 advances.
- Why it matters: building teams on an unverified-header identity (Finding 3) is premature; the release-blocking chain is more central.
- Recommended action: either build real auth before EXP-009, or reorder to PROV-001/identity hardening first.
- Likely owner: orchestrator selection rule.

### 9. SEC-001 trueGreen overclaims relative to live identity reality — MEDIUM/HIGH
- Area: Canonical consistency / security
- Evidence: SEC-001 closure claims "actor-type spoofing blocked," "fail closed," verified by `verify-sec-001-live-proof.mjs`. True for *role within a project* and *project isolation*. But the *identity itself* is an unverified header, so "one user cannot see another's projects" holds only because ids are unguessed, not because sessions are authenticated. The closure boundary does disclose this, but the headline "isolation and security boundary … trueGreen" reads stronger than the live truth.
- Recommended action: add explicit `not_trueGreen`-style note that API identity is header-trust pending token auth; keep SEC-001 green only for *isolation given an identity*, not for *establishing identity*.
- Likely owner: `SEC-001` write-back + `ID-001`.

### 10. `data/` mixes test fixtures with live state in repo root — MEDIUM
- Area: Code quality / state integrity
- Evidence: `data/` contains `events.ndjson`, `security-audit.ndjson`, `project-snapshots.ndjson` alongside `test-*.ndjson`, `behind-scenes-*.ndjson`, `test-casino-sync.ndjson`. Server persists live audit/snapshots into the same tracked dir.
- Why it matters: unclear demo/mock/real boundary; test artifacts and real audit logs co-mingle and can leak across runs.
- Recommended action: separate runtime data dir from fixtures; gitignore runtime data.
- Likely owner: `DATA-001` / `OPS-001`.

### 11. Known `/live-events` 401 console noise is recurring debt — MEDIUM
- Area: Observability / auth
- Evidence: referenced as "known cleanup debt owned by OBS-001" across SLICE-006/BLD-AGT-001 closures; live-events auth uses `userId` query param (PII-in-URL smell).
- Why it matters: persistent 401 noise hides real failures; `userId` in query contradicts the privacy rule against PII in URLs.
- Recommended action: move live-events auth off the query string; resolve the 401 path.
- Likely owner: `OBS-001`, `SEC-001`.

### 12. Mutation acknowledged in transcript but absent from artifact persists across refresh — MEDIUM (continuity sub-case of #1)
- Area: State/continuity
- Evidence: after refresh, the un-applied "תקציב" change survived **as chat history** while the structured skeleton did not gain a field. So continuity faithfully restores a *false memory* of a change.
- Why it matters: refresh makes the fake success look more real, not less.
- Recommended action: same as #1; transcript should not preserve change-claims that produced no mutation.

### 13. Class coverage is deep for internal-tool, shallow elsewhere — MEDIUM
- Area: Professional skeleton quality / generated product truth
- Evidence: `runtime-skeleton-truth.js defaultProductDetails` has rich content for `internal-tool/saas`, `mobile-app`, `landing-page`, and a generic fallback ("כלי עבודה ראשון עם קלט, פעולה ותוצאה"). Mutations/operations are lead-domain specific. Games/simulators/editors fall to generic.
- Why it matters: the canon promises class-aware depth; only management-records is convincingly deep. A game/editor would render as a generic card-in-frame.
- Recommended action: be explicit in-product about which classes are first-class; gate others with a precise "not yet" rather than a generic skeleton.
- Likely owner: `PRO-SKEL-001..003`, `PRODUCT-KIND-001`, `RUNTIME-SKEL-001`.

### 14. Internal agent names leak in routing/labels though copy is mostly sanitized — MEDIUM
- Area: User-facing language
- Evidence: `routeLabel` maps owners to Hebrew product words ("בדיקה", "שחרור") — good — but task ids (`SLICE-005`, `RUNTIME-TRUTH-001`, `PRODUCT-KIND-001`) are exposed as `data-*` DOM attributes, and `NEXUS-FACADE-001` (the "one voice" task) is `new-proposed`/unbuilt. Visible copy was clean in my live pass.
- Why it matters: data-attributes are inspectable; the unified-facade guarantee isn't enforced yet.
- Recommended action: keep ids in hidden state only where feasible; close `NEXUS-FACADE-001` before external users.
- Likely owner: `NEXUS-FACADE-001`, `SURF-009B`.

### 15. Operation/field names are seeded with the word "בדיקה" (test) in product data — LOW/MEDIUM
- Area: User-facing language
- Evidence: `build-agent-downstream-action.js` seeds `name: "ליד חדש מבדיקה"`; `build-mutation-truth.js` "נשמר ליד בדיקה בשלד." So a real user's added lead is literally named "from a test."
- Why it matters: internal QA vocabulary surfaces as product content.
- Recommended action: neutral seed labels ("ליד חדש").
- Likely owner: `BLD-AGT-001` / `MUT-001`.

### 16. `ai-design`/skeleton-choice candidates: provider hidden, but selection→build lock unproven live — MEDIUM
- Area: Design provider / skeleton choice
- Evidence: SKELETON-CHOICE-001 is trueGreen; live Build showed three "כיוון" cards (ממוקד/פרימיום/חי). I did not verify that selecting a direction *locks* downstream package/mutation behavior (that linkage is asserted in PRODUCT-RUNTIME-PACKAGE-001, which is unbuilt).
- Why it matters: the candidates are visible, but "selected direction shapes the build" depends on the unbuilt package layer.
- Recommended action: confirm selection persists and biases mutations before claiming the loop closed.
- Likely owner: `SKELETON-CHOICE-001`, `PRODUCT-RUNTIME-PACKAGE-001`.

### 17. Enterprise-depth tasks are well-placed but deeply interdependent and all unbuilt — MEDIUM
- Area: Canonical execution / security/privacy/teams/billing
- Evidence: `PRIVACY-001`, `SSO-001`, `BILLING-001`, `EXP-009`, `ACCT-001`, `PROV-001` form a dense dependency web (SSO-001 depends on 7 tasks incl. BILLING-001 and PRIVACY-001). All `new-proposed`.
- Why it matters: placement/coverage is good (these are not missing), but the cluster is a large, serial, late block; nothing is started.
- Recommended action: sequence ID/auth-token → SEC hardening → ACCT → PRIVACY → EXP-009 → BILLING → SSO; don't start EXP-009 mid-cluster on header auth.
- Likely owner: the ID/SEC/ACCT/PRIVACY/EXP-009/BILLING/SSO chain.

### 18. Test suite is large but render-/attribute-heavy — MEDIUM
- Area: Test quality
- Evidence: 636 test files, ~1,967 `test(`/`it(` cases. Many assert DOM `data-*` anchors and rendered strings (e.g., `loop-core-screen-render.test.js` checks PRODUCT-BACKEND-SKEL-002 anchors). The mutation gap (#1) passed all tests because no test exercises the arbitrary free-text path.
- Why it matters: high count, real coverage of trained paths, blind to the untrained product reality.
- Recommended action: add behavior tests that assert *the artifact changed* (not that an intent was recorded) for novel requests; add a "agent may not claim change without mutation" invariant test.
- Likely owner: cross-cutting; attach to `BLD-AGT-001`/`MUT-001`.

### 19. Empty `Build` file and stray artifacts at repo root — LOW
- Area: Code hygiene
- Evidence: `ls` shows a 0-byte `Build` file at root; `figma-make-export/`, `codeql-custom-queries-javascript/`, multiple `*.ndjson` in `data/`.
- Why it matters: noise; suggests incomplete cleanups.
- Recommended action: remove stray files; document `figma-make-export` provenance.
- Likely owner: `OPS-001`.

### 20. Discovery agent can over-advance to skeleton on thin input — LOW/MEDIUM
- Area: Build pipeline / enough-truth gate
- Evidence: live, two answers ("internal lead tool" + one clarifying sentence) produced a full skeleton with seeded data and "3/4/12" metrics. SLICE-003 ("enough-truth gate") is trueGreen, but the gate felt lenient.
- Why it matters: fast is good, but seeded numbers (12 פתוחים) can read as real data the user never entered.
- Recommended action: label seeded/sample data explicitly as sample until the user adds real records (some "רשומה ראשונה נבחרה / דמו" copy exists; make it consistent).
- Likely owner: `SLICE-003`, `VSKEL-001`.

---

## D. Canonical Consistency Review

**Wrong / overclaimed statuses**
- `SLICE-006`, `BUILD-MUTATION-TRUTH-001`, `BLD-AGT-001` — `trueGreen` but proven only on hardcoded phrases; the free-text conversational mutation fabricates success (Findings 1–2). Recommend → `existing-partial` with a reopen note.
- `SEC-001` — `trueGreen` for isolation-given-identity, but identity is unverified header; headline reads stronger than live truth (Finding 9). Keep green for isolation, add explicit identity-auth caveat to the closure (the boundary text already gestures at this; make it a `not_trueGreen` line).
- `ID-001` — `trueGreen` for "local-first identity boundary," but there is no credential verification at the API; refresh "ownership" is header presence. Add explicit boundary that token/session verification is not closed.

**Suspicious trueGreen items to re-examine with a negative live proof**
- `EXP-001` (direct editing), `MUT-001`, `EXP-002` — confirm arbitrary edits mutate truth, not just record intents.
- `SKELETON-CHOICE-001` — confirm selection locks downstream behavior (depends on unbuilt package layer).

**Circular dependencies:** none found in the chains inspected. Dependency direction is acyclic (FND→ENG→SHL→AGT→SURF→SLICE→…→REL). Good.

**Missing blockers**
- A real authentication/session task is implicitly required before `EXP-009`/`BILLING-001` but is folded into `ID-001`/`SEC-001` boundaries. Recommend an explicit `AUTH-TOKEN-001` (server-verified session) as a blocker of `EXP-009`.
- A "no-fake-success enforcement" invariant is asserted in prose across many tasks but owned by none as a testable gate. Recommend attaching it to `BLD-AGT-001`/`MUT-001`.

**Duplicated tasks:** none material. (An automated scan double-counted `GROW-AGT-001`/`ID-001`/`SEC-001`/`POST-008` because they carry both a top-level `status:` and a nested `closure:`/scope block — not real duplicates.)

**Recommended write-back**
- Reopen SLICE-006 / BUILD-MUTATION-TRUTH-001 / BLD-AGT-001 to `existing-partial` pending a negative free-text mutation proof.
- Add identity-auth caveat to SEC-001 and ID-001 closures.
- Add `AUTH-TOKEN-001` before EXP-009 in the critical path.
- Note `web/app.js` decomposition as an owned code-health task.

---

## E. Architecture Review

**Strong**
- Clear engine/shell split: `src/core/*` engines (project-service, snapshots, isolation, runtime-skeleton-truth, build-mutation-truth) vs `web/nexus-ui/{adapters,screens,components,copy}` surfaces. The adapter and copy-sanitizer layers are real and tested.
- `project-service.js` is a credible single source of project truth: it serializes root+context+state, replays mutation intents on rebuild/restore, and persists product-owned-backend envelopes consistently.
- Server isolation primitives are modular: `action-level-project-authorization-resolver`, `project-permission-schema`, `project-role-capability-matrix`, `workspace-isolation-guard`, `tenant-isolation-schema` — and they actually run on `/api/projects/*` (verified live).

**Fragile**
- `web/app.js` (16k lines) concentrates routing, rendering, persistence, identity-header injection, companion-turn dispatch, and QA state. This is where state-leak regressions recur (W4-FIX-007 reopened 2026-06-09 for `project-draft`/`nexusState` in the URL).
- Mutation semantics are split across two diverging paths: deterministic `build-mutations` (runtime controls, trustworthy) vs `companion-turn` (LLM reply + brittle downstream-action matcher, untrustworthy on novel input). The visible reply can desync from the truth engine.
- Identity is a header; everything downstream (roles, isolation) is sound *only relative to that header*.

**Should be extracted**
- From `web/app.js`: a routing module, a persistence/identity module, and a companion-turn client. Behind the existing adapter boundary.
- The hardcoded `build-agent-downstream-action.js` operation table should become a real intent→operation resolver (the provider can supply structured operations) rather than a regex switch.

**Should become source of truth**
- `project-service` already is for project state. The missing source of truth is **"did a change actually apply"** — it should be a single authority that the visible reply is forced to read before speaking.

---

## F. Product UX Review

**Where it feels strong**
- Front door: clean, calm, single-purpose, RTL-correct, with a real "Local operator" identity chip and an honest "stays local" explanation.
- Discovery: feels like talking to one agent; replies are specific and in-domain.
- First skeleton: for the internal-tool class it genuinely reads like a workspace (leads, owners, reminders, "next step," tabs, status). This is the high point.
- Boundary honesty on Release/Share/Growth: copy repeatedly tells the truth ("local/mock… not a deployed backend," "not invented campaigns").

**Where it still feels like a demo**
- Seeded metrics (12 פתוחים / 4 תזכורות / 3 אחראים) and a record named "ליד חדש מבדיקה" read as fake-real.
- Non-internal-tool classes fall back to a generic "first tool" card.
- Release/Share are framing surfaces with no artifact behind them.

**Where the user may be misled**
- The fake-success conversational mutation (Finding 1) — the worst case.
- "Your product has its own backend" language vs an in-memory described scaffold (Finding 5).
- External actions (WhatsApp/publish) not always shown as bounded (Finding 4).

**Must improve before first real user**
1. Stop claiming changes that didn't apply.
2. Make external-action boundaries phrase-independent.
3. Label seeded/sample data as sample.
4. Real session auth before any multi-user/teams exposure.

---

## G. Build Pipeline Review (status / confidence / blockers / next action)

| Stage | Status | Confidence | Blockers | Next action |
|---|---|---|---|---|
| Idea intake | Real | High | — | keep |
| Product kind discovery | Real (PRODUCT-KIND-001 resolves live) | High | — | extend beyond management-records |
| Learning-driven pattern intelligence | Partial | Med | depth unproven | verify it changes output, not just metadata |
| Product skeleton | Real (internal-tool) | High | class breadth | broaden classes |
| Visual skeleton | Real | Med-High | — | — |
| Runtime skeleton | Real, persisted | High | — | — |
| Product-owned backend skeleton | **Described only (in-memory)** | Med | no disk artifact | keep gated behind PACKAGE/STANDALONE |
| Generated product runtime package | **Missing** | — | PRODUCT-RUNTIME-PACKAGE-001 unbuilt | build it |
| Dependencies / install plan | Missing for generated product | — | same | — |
| Professional skeleton quality | Real for one class | Med | breadth | — |
| Skeleton choice / candidates | Real (visible) | Med | lock unproven | verify lock |
| Design provider integration | Real, provider hidden | Med | — | — |
| Build agent | **Partial / fakes success on novel input** | Low on free-text | Finding 1 | enforce speech boundary |
| Visual build continuation | Real for trained ops | Med | breadth | generalize |
| Conversation mutation updates artifact | **Fails on untrained input** | Low | Finding 1 | reopen |
| Direct editing | Real (runtime controls) | Med-High | — | — |
| Mutation/change agent | Partial | Med | Finding 1 | — |
| Approval flow | Real (approval-required states) | Med | — | — |
| History / rollback | Real, restores | High | restores false memories (#12) | tie to applied truth |
| Share / demo | Framing | Med | no artifact | honest already |
| Release framing | Framing | Med | REL chain unbuilt | — |
| Growth agent | Bounded, honest | Med | PROV unbuilt | — |
| Security / identity boundaries | Isolation real; identity header-only | Med | Finding 3 | real auth |
| Standalone artifact | Missing | — | unbuilt | build |
| Verification / release gates | Missing | — | unbuilt | build |

---

## H. Security / Identity / Privacy / Teams / Billing / Provider Boundary Review

- **Local identity/session:** unverified `x-user-id` header; sequential ids; no credential check at API (Finding 3). Verified live.
- **Project access control / isolation:** real and enforced — outsider 404, unauthenticated 401, owner-by-header 200, random id 404. Strong given an identity.
- **API ownership checks / action-level authz:** present and modular (`action-level-project-authorization-resolver`, role-capability matrix, workspace-isolation-guard). SEC-001 live proof covers spoof→viewer downgrade, workspace mismatch 403.
- **Role spoofing:** `x-actor-type` spoofing is blocked (role derived from project/account truth) — but identity spoofing via `x-user-id` is not.
- **Privacy rights / deletion / export / retention / consent:** modules exist (`privacy-rights-execution-module`, `privacy-retention-and-deletion-policy-resolver`, `owner-consent-recorder`, `compliance-consent-and-legal-basis-registry`) and an API route `/privacy-rights-requests`. `PRIVACY-001` correctly `new-proposed`; not wired into a user-visible privacy center yet.
- **SSO/external identity:** `SSO-001` new-proposed; nothing live.
- **Teams/invitations/roles:** schema + routes exist (`/team/invitations`, `/team/remove-member`, `/team/transfer-ownership`, `role-assignment-invitation-flow`), `EXP-009` new-proposed. Building this on header-auth is premature.
- **Billing:** many modules (`billing-plan-schema`, `billing-enforcement-guard`, `usage-to-billing-mapper`, `workspace-billing-action-service`); `BILLING-001` new-proposed. Not exposed.
- **Provider boundaries:** OpenAI/Anthropic clients real; provider identity hidden from copy. External *action* providers (WhatsApp/pay/deploy) are not wired and are blocked by absence — but the boundary *message* is phrase-fragile (Finding 4).
- **401/403/404 handling:** correct at API; `/live-events` 401 noise is unresolved debt.
- **Cross-user/project leakage:** none observed at the data layer given correct ids; the leak vector is identity guessing, not authz logic.
- **PII in URL:** `live-events` uses `userId` query param — violates the privacy rule; fix.

Net: isolation/authz engineering is genuinely good; **identity establishment is the weak link** and must precede teams/billing.

---

## I. Generated Product Package and Dependency Review

- **Frontend files:** generated as in-memory runtime-skeleton truth + DOM, not as files on disk.
- **Backend files:** described as path strings in `product-owned-backend-skeleton.js`; **not written**.
- **Shared schema/model files:** described (`shared/schema/*.schema.json` paths); not written.
- **Local/mock persistence:** exists as Nexus project truth (mutations persist in project state), labeled "product-owned-local-mock-store" but actually stored inside Nexus, not a product store.
- **Dependency plan:** none for the generated product. `package-assembler.js`/`package-format-resolver.js` are **Nexus-internal deployment metadata**, used by `context-builder.js`, not a per-product-type dependency plan.
- **Run command / preview target separate from Nexus:** absent.
- **Stable product package root:** referenced (`nexus-projects/<owner>/<project>/product`) but nonexistent on disk.
- **Production vs local/mock:** clearly local/mock; copy says so.
- **Does the UI explain truthfully:** mostly yes on Release/Share; the *backend* language risks implying more than exists (Finding 5).
- **Dependencies installed into Nexus vs product:** neither for generated products; the canon's rule "never install into Nexus" is currently moot because nothing installs.

Reviewed classes: mobile-app, landing-page, internal-tool have content templates; game/simulator/editor/software fall to generic. **Conclusion:** `PRODUCT-RUNTIME-PACKAGE-001` and `STANDALONE-ARTIFACT-001` being unbuilt is the honest, correct state; no overclaim here. The risk is purely the in-product "backend" wording.

---

## J. Design Provider and Skeleton-Quality Review

- **Multiple directions:** yes — three "כיוון" candidates render live (ממוקד / פרימיום / חי ומדיד), provider hidden.
- **Providers hidden from user:** yes in visible copy.
- **Candidates connected to Nexus truth:** yes at selection time; the *downstream lock* (selection shapes package/build) depends on the unbuilt package layer (Finding 16).
- **Disconnected pretty mockups risk:** low today because candidates are descriptions over Nexus truth, not imported screenshots.
- **Skeleton quality by class:** internal-tool is convincingly product-shaped (real workspace feel). Landing-page and mobile have decent templates. Others generic.
- **Would a skeleton need redesign before serious continuation?** Internal-tool: no, it's a credible base. Other classes: likely yes.
- **Covered by canonical tasks deeply enough?** Yes — PRO-SKEL-001..003, PRODUCT-KIND-001, RUNTIME-SKEL-001 exist; the gap is execution breadth, not planning.

---

## K. Test Suite Review

- **Volume:** 636 files, ~1,967 cases — substantial.
- **Meaningful vs attribute-checking:** many assert rendered strings / `data-*` anchors. These catch regressions in trained paths but did not catch the fake-success gap because no test drives an arbitrary free-text change and then asserts the *artifact* changed.
- **Brittleness:** moderate; some tests pin button labels (W4-FIX-007 notes a test "stale on a button-label assertion before it reaches project truth").
- **Masking product-quality issues:** yes — SLICE-006/BLD-AGT-001 green while the general conversational mutation fails (Finding 2).
- **Live verification scripts:** real Playwright proofs that hit `127.0.0.1:4011`, click real controls, refresh, and read DOM truth. Trustworthy *for what they test*; they test trained phrases and runtime-control clicks, not naive free-text.
- **Browser tests test real behavior or QA states:** mixed; several go through `qa=1`/QA fault modes. The non-QA path is exercised but with scripted phrases.
- **No-coverage areas:** arbitrary conversational mutation; real auth/session; generated-product package on disk; off-pattern external-action requests.
- **Security tests after SEC-001:** good for role-spoof/isolation/workspace mismatch; **none** for identity-header forgery (because the design trusts the header).
- **Package/dependency/product-runtime tests:** `package-assembler`/`package-format`/`package-verification` test Nexus-internal packaging, not generated-product packages.

---

## L. Recommended Next 10 Canonical Actions

Named to existing owners where they exist; new ids proposed where there is a real gap.

1. **Reopen `BLD-AGT-001` (+ `SLICE-006`, `BUILD-MUTATION-TRUTH-001`) → `existing-partial`.** Enforce `speechBoundary`: visible reply may not claim a product change unless a mutation actually applied. Add a negative live proof (arbitrary field add → either mutates or visibly declines).
2. **`MUT-001`:** replace the regex `build-agent-downstream-action.js` switch with a structured intent→operation resolver (use the provider's structured output) so novel field/screen requests produce real mutations or precise "not yet."
3. **New `AUTH-TOKEN-001` (blocks `EXP-009`, `BILLING-001`):** server-verified session token/cookie; remove blind `x-user-id` trust; non-sequential ids. Place after `ID-001`, before `EXP-009`.
4. **`SEC-001` / `ID-001` write-back:** add explicit `not_trueGreen` caveat that API identity is header-trust pending `AUTH-TOKEN-001`; keep SEC-001 green only for isolation-given-identity.
5. **`BUILD-RELEASE-GATE-001` / `PROV-001`:** make external-action detection (publish/connect/pay/send/deploy) phrase-independent; guarantee a visible bounded refusal regardless of wording.
6. **Reconsider next-task selection:** prefer `AUTH-TOKEN-001` → `PROV-001` over `EXP-009`; do not build teams on header auth. Update `wave3-canonical-state.json.nextCanonicalExecutionTask` with the rationale.
7. **New code-health task `SURF-CODE-001`:** decompose `web/app.js` (routing / persistence+identity / companion-turn client) behind the adapter boundary; this is where state-leak regressions recur.
8. **`OBS-001`:** resolve `/live-events` 401 noise and move `userId` off the query string (privacy-in-URL fix).
9. **`SLICE-003` / `VSKEL-001`:** label seeded metrics and sample records as sample; rename "ליד חדש מבדיקה" to a neutral seed.
10. **`PRODUCT-RUNTIME-PACKAGE-001` (begin):** start the first real on-disk package for the internal-tool class (frontend+backend+deps+run command) so "your product has a backend" becomes true rather than described; keep all release/standalone claims gated behind it and `STANDALONE-ARTIFACT-001`.

(No invented busywork: 1,2,4,5,8,9,10 attach to existing owners; 3,6,7 fill real gaps.)

---

## M. Final Verdict

**Not ready for user testing.**

Rationale: the engine layer, isolation, continuity, and the internal-tool first slice are genuinely good — this is real, not a simulator pretending. But the **single most-used real-user action — changing the product by talking to it — fabricates success on anything outside ~6 hardcoded phrases**, and that fake success persists across refresh as false history. Combined with header-only authentication (guessable sequential ids) and phrase-fragile external-action boundaries, a naive user reaches a trust-breaking moment within the first minutes.

It is **almost ready for controlled internal dogfood** by operators who know the system's trained vocabulary and won't be misled by the gaps. It is **not ready for broad internal testing** until Findings 1–4 are addressed.

The fastest path to "controlled dogfood": enforce the speech boundary (stop claiming un-applied changes), generalize conversational mutation, make external-action blocking semantic, and add a verified session. None of these require new architecture — the engines to support honest behavior already exist; the visible agent is simply allowed to speak ahead of the truth.
