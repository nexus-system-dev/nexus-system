# Runtime Product Truth Binding Contract

Date: 2026-06-04
Status: canonical gap contract with RUNTIME-TRUTH-001, PRODUCT-BACKEND-SKEL-001, and BUILD-MUTATION-TRUTH-001 implemented
Owner tasks:
- `RUNTIME-TRUTH-001`
- `PRODUCT-BACKEND-SKEL-001`
- `BUILD-MUTATION-TRUTH-001`
- `LEARNING-RUNTIME-001`

## Core Finding

The current Build runtime skeleton is a visible frontend runtime shell derived from existing product and visual skeleton envelopes.

It is not yet sufficient as canonical product-building truth because it does not prove all required layers:

1. canonical Nexus backend/project truth for the runtime skeleton
2. generated product backend/domain skeleton
3. mutation truth across frontend, Nexus project truth, and generated product domain truth
4. learning events from runtime skeletons, product-domain skeletons, and Build mutations

## Layer Separation

Nexus must keep two backend concepts separate:

- Nexus backend/project truth: the persisted Nexus record for the project, runtime skeleton, build artifact, mutation history, restore, and release trail.
- Generated product backend/domain skeleton: the backend-like domain model of the product being built, including records, operations, state transitions, mock/local persistence, and UI-to-logic wiring.

Neither layer may be implied by a frontend frame.

## RUNTIME-TRUTH-001 — Runtime Skeleton Backend Truth Binding

Purpose:

Ensure every runtime skeleton shown in Build has canonical Nexus backend/project truth, not only frontend preview state.

Acceptance criteria:

1. First runtime skeleton is saved to canonical project state.
2. Refresh/restore can rebuild the Build surface from backend/project truth.
3. Runtime skeleton has stable project id and artifact/build/runtime skeleton id.
4. Product type, shell type, screens, sample data, interactions, visible state, and boundaries are represented in project truth.
5. Frontend renders from this truth, not only temporary UI state.
6. No fake runtime skeleton can appear without a corresponding truth envelope.
7. Tests prove backend/project truth and frontend Build rendering match.
8. Live browser verification proves restore without relying on a giant URL state blob.

## PRODUCT-BACKEND-SKEL-001 — Product Backend/Domain Skeleton

Status: `trueGreen` on 2026-06-04.

Implementation evidence:

- `web/shared/product-domain-skeleton.js` defines generated product-domain models, operations, mock/local state, persistence boundary, and operation application for mobile app, landing page, internal tool, commerce, game, and generic tool families.
- `web/shared/runtime-skeleton-truth.js` now embeds `productDomainSkeleton` and `productDomainSkeletonId` into every runtime skeleton truth envelope.
- `src/core/project-service.js` now persists the generated product-domain skeleton at project root, context, and state, and exposes it through serialization.
- `web/nexus-ui/screens/LoopCoreScreen.js` now renders product-domain truth attributes and binds runtime controls to `data-product-domain-operation`.
- Tests prove mobile task creation/update, landing lead validation/submission, internal-tool status update, and commerce cart state use domain operations.
- Live browser verification proved the Build surface exposes `data-product-domain-task="PRODUCT-BACKEND-SKEL-001"`, `data-product-domain-skeleton-id`, `data-product-domain-kind`, operation buttons, and domain state trace.

Boundary:

This closes generated product-domain/backend skeleton truth only. It does not close interactive runtime quality, Build agent mutation truth, production backend deployment, real provider connections, payments, publishing, or release/export.

2026-06-08 reinterpretation:

This also does not close the stricter product-owned backend skeleton requirement. The current closure proves Nexus-internal generated product-domain truth with mock/local operations. It does not prove that the generated product itself has its own backend scaffold created with the first frontend skeleton.

That stricter requirement is owned by `PRODUCT-BACKEND-SKEL-002`.

Purpose:

Ensure every generated product skeleton includes a matching backend/domain skeleton appropriate to the product type.

Acceptance criteria:

1. Every runtime skeleton has a product-domain model.
2. UI actions are connected to product logic, not only visual changes.
3. Product state changes through defined operations.
4. At least local/mock persistence exists where appropriate.
5. Product backend/domain skeleton is represented in canonical project truth.
6. Refresh/restore preserves the product-domain state.
7. Build agent mutations can update both frontend/runtime shell and product backend/domain skeleton.
8. Tests prove at least mobile task creation/update, landing lead submission, internal-tool record/status update, and commerce cart/order draft or game state change where feasible.
9. UI clearly distinguishes mock/local product backend from production backend infrastructure.

Non-goals:

- no production backend deployment
- no real payments
- no real WhatsApp, CRM, App Store, or provider connection
- no claim that mock/local backend is production infrastructure
- no claim that Nexus-internal product-domain truth is the generated product's own backend scaffold

## BUILD-MUTATION-TRUTH-001 — Build Agent Frontend/Backend/Domain Mutation Contract

Purpose:

Ensure future Build agent changes update the visible runtime skeleton, Nexus canonical backend/project truth, and generated product backend/domain skeleton.

Acceptance criteria:

1. Build agent request creates a mutation intent.
2. Mutation intent is tied to current project, runtime skeleton, and product-domain skeleton.
3. Visible skeleton changes only after a truth mutation exists.
4. Product-domain skeleton changes only through defined operations.
5. Mutation is recorded in project history/timeline.
6. Refresh preserves the mutation.
7. Agent response describes only the mutation that actually happened.
8. Failed mutations show visible failure and do not fake frontend-only success.
9. Mutation can later be used by release/export/rollback/continuation systems.

Implementation truth on `2026-06-04`:

- `src/core/build-mutation-truth.js` creates mutation intent and history envelopes tied to project id, runtime skeleton id, artifact build id, product-domain skeleton id, operation id, payload, status, and safe failure reason.
- `src/core/project-service.js` applies Build mutations through generated product-domain operations and persists `runtimeSkeletonTruth`, `productDomainSkeleton`, `buildMutationTruth`, `buildMutationHistory`, and `buildMutationIntents` at project root, `context`, `state`, and serialized project output.
- `src/server.js` exposes `POST /api/projects/:projectId/build-mutations` as the project edit route for canonical Build mutation application.
- `web/nexus-ui/adapters/loop-adapter.js` and `web/nexus-ui/screens/LoopCoreScreen.js` expose mutation truth anchors on the visible Build runtime surface.
- Verification passed: `node --test test/build-mutation-truth.test.js`; `node --test --test-name-pattern 'RUNTIME-TRUTH-001|PRODUCT-BACKEND-SKEL-001' test/project-service.test.js`; `node --test --test-name-pattern 'RUNTIME-SKEL-001|SLICE-005|W4-FIX-007' test/loop-core-screen-render.test.js`; `node --test test/product-domain-skeleton.test.js`.
- Live Build surface proof opened `/loop` in QA mode with mutation truth and found `data-build-mutation-task="BUILD-MUTATION-TRUTH-001"`, `data-build-mutation-status="applied"`, `data-build-mutation-operation="record.updateStatus"`, `data-build-mutation-history-count="1"`, and a non-empty mutation id. Screenshot: `/private/tmp/nexus-build-mutation-truth-live.png`.

Closure boundary:

- This closes the canonical Build mutation truth contract only.
- This does not close Build rail agent liveliness, natural-language mutation planning, visible agent response, general mutation generation, learning events, release/export, rollback UI, or production backend deployment.

## LEARNING-RUNTIME-001 — Runtime And Build Mutation Learning Binding

Purpose:

Ensure Nexus learns from product-building state, not only old onboarding or planning state.

Acceptance criteria:

1. Learning layer receives runtime skeleton creation events.
2. Learning layer receives generated product-domain skeleton creation events.
3. Learning layer receives Build agent requests.
4. Learning layer receives mutation intents.
5. Learning layer receives accepted/rejected/failed mutation outcomes.
6. Learning layer receives runtime skeleton interaction outcomes where relevant.
7. Learning layer receives product-domain operation outcomes where relevant.
8. Learning can influence future decisions without overwriting product truth.
9. Learning events are tied to project id, runtime skeleton id, product-domain skeleton id, mutation id, and outcome id.
10. Tests prove learning events are emitted from runtime skeleton, product-domain, and Build mutation flows.

## Placement Law

- `RUNTIME-TRUTH-001` must sit after `SLICE-005` and before `PRODUCT-BACKEND-SKEL-001` and `RUNTIME-SKEL-001`.
- `PRODUCT-BACKEND-SKEL-001` must sit before `RUNTIME-SKEL-001`, because interactive product behavior is not trustworthy without domain logic behind it.
- `BUILD-MUTATION-TRUTH-001` must sit after `RUNTIME-SKEL-001` and before `BLD-AGT-001`, `MUT-001`, and generation tasks that claim product mutation.
- `LEARNING-RUNTIME-001` must sit after runtime and mutation truth exist, and before any learning task claims runtime/build improvement.

## Closure Boundary

`SLICE-005` remains closed only for product-type runtime-looking visibility.

It does not prove backend/project runtime truth, generated product domain backend truth, mutation truth, or learning integration.

Those stronger claims are blocked by the tasks in this contract.
