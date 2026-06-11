# Visual Product Skeleton Agent Implementation Evidence — 2026-06-03

## Canonical Task

`VSKEL-001 — Visual Product Skeleton Agent first visible skeleton`

## Status

`partial`

The implementation path exists, focused verification passed, the project runtime loads the local provider key from the project `.env` file, and live Create -> Build browser proof passed for the lead-management example.

This is still not `trueGreen` because the full closure proof has not yet been completed in the browser for all required examples. The remaining missing proof is the second canonical example:

`Discovery Agent -> Product Skeleton Agent -> Visual Product Skeleton Agent -> selected Design Plugin -> Build canvas`

## What Changed

- Added a dedicated Visual Product Skeleton Agent provider path in `src/core/onboarding-provider-client.js`.
- Added strict JSON schema enforcement for the `visual-product-skeleton-agent` envelope.
- Added malformed-output handling that returns `agent-malformed` and never creates a local fallback screen.
- Added service orchestration in `src/core/onboarding-service.js` that blocks until the Product Skeleton Agent handoff is ready.
- Added `POST /api/onboarding/sessions/:sessionId/visual-product-skeleton`.
- Added browser state preservation for `visualProductSkeletonAgentOutput`.
- Added a visible Build canvas surface for the first visual product skeleton.
- Added a truthful Create-screen failure boundary when the agent handoff is ready but the Product Skeleton Agent or Visual Product Skeleton Agent does not return a live envelope.
- Added visible Create-screen handoff progress before the live skeleton route runs, and kept the Build/Loop transition blocked until the Visual Product Skeleton Agent envelope returns.
- Prevented automatic handoff retry loops after a skeleton handoff failure; retry is now user-driven and the create button is reset.
- Fixed application bootstrap env loading so the server loads the project `.env` from the configured project root even when the process is launched from another working directory.
- Preserved `SKEL-001` as product-structure truth and `DESIGN-PLUG-004` as plugin proof, without letting either impersonate `VSKEL-001`.

## Verification Passed

```bash
node --check src/core/onboarding-provider-client.js
node --check src/core/onboarding-service.js
node --check src/server.js
node --check web/app.js
node --check web/nexus-ui/adapters/loop-adapter.js
node --check web/nexus-ui/screens/LoopCoreScreen.js
```

```bash
node --test test/onboarding-provider-client.test.js test/product-skeleton-agent-service.test.js test/loop-core-screen-render.test.js test/design-plugin-registry-contract.test.js test/design-plugin-built-ins.test.js test/design-plugin-user-preference.test.js
```

Result:

`39 passed / 0 failed`

Additional field-test regression coverage:

```bash
node --check src/core/application-server-bootstrap.js
node --test test/application-server-bootstrap.test.js
node --test test/project-discovery-agent-front-door.test.js test/project-create-screen-render.test.js test/product-skeleton-agent-service.test.js test/loop-core-screen-render.test.js
```

Result:

`application-server-bootstrap.test.js: 4 passed / 0 failed`

`21 passed / 0 failed`

Additional Create -> Build handoff coverage:

```bash
node --check web/app.js
node --test test/project-create-screen-render.test.js test/project-discovery-agent-front-door.test.js test/product-skeleton-agent-service.test.js test/loop-core-screen-render.test.js test/application-server-bootstrap.test.js
```

Result:

`26 passed / 0 failed`

Provider availability proof:

```bash
node --input-type=module -e 'import { loadEnvFile } from "./src/core/load-env.js"; import { OnboardingProviderClient } from "./src/core/onboarding-provider-client.js"; delete process.env.OPENAI_API_KEY; loadEnvFile(); const client=new OnboardingProviderClient(); console.log(JSON.stringify(client.getProviderAvailability("openai")));'
```

Result:

`{"providerId":"openai","availabilityStatus":"ready","availabilityReason":null}`

Live provider chain proof:

- Product Skeleton Agent returned `status: completed`, `agentId: product-skeleton-agent`, `responseSource: provider-composed`.
- Visual Product Skeleton Agent returned `status: completed`, `agentId: visual-product-skeleton-agent`, `responseSource: provider-composed`.
- Selected plugin was `israeli-smb`.
- First screen was `רשימת לידים`.

## Live Verification Passed

Local API boundary proof:

- Created an onboarding session on `127.0.0.1:4013`.
- Called `/api/onboarding/sessions/:sessionId/visual-product-skeleton` before a Product Skeleton Agent handoff.
- Result was `blocked`.
- No `visualProductSkeletonAgentOutput` envelope was returned.
- Error code was `product-skeleton-agent-handoff-not-ready`.

Live browser proof with injected provider-composed envelopes:

- Route: `127.0.0.1:4013/loop?qa=1&qaScreen=loop&qaState=...`
- `data-visual-skeleton-task="VSKEL-001"` was present.
- `data-visual-skeleton-agent="visual-product-skeleton-agent"` was present.
- `data-visual-skeleton-source="provider-composed"` was present.
- `data-visual-skeleton-plugin-id="israeli-smb"` was present.
- First screen was `מסך טיפול בלידים`.
- Visible regions included `today` and `owner`.
- The page also preserved `SKEL-001` and `DESIGN-PLUG-004` proof anchors.

Live browser proof through visible Create -> Build:

- Route: `127.0.0.1:4013/create?qa=1&qaReset=1`
- Submitted the lead-management idea through the Create surface.
- Create showed live handoff progress before opening Build: `מכין שלד חי ראשון. אעבור למסך הבנייה רק אחרי שהמסך החזותי חוזר.`
- The app reached `appScreen="loop"` only after both `productSkeletonAgentOutput` and `visualProductSkeletonAgentOutput` existed.
- `data-visual-skeleton-agent="visual-product-skeleton-agent"` was present.
- `data-visual-skeleton-source="provider-composed"` was present.
- First screen was `רשימת לידים`.
- Transition motion was `discovery-chat-morphs-to-right-agent-rail`.

## Remaining Closure Gap

Exact remaining gap:

Closed on `2026-06-03`.

Second canonical example proof:

- Route: `http://127.0.0.1:4011/create?qa=1&qaReset=1&qaScreen=create`
- Input: premium embroidered gifts web store for private gift buyers.
- The Project Discovery Agent reached `advance-to-skeleton` only after concrete audience, problem, workflow, first screen, and non-goals were present.
- The visible flow called `/product-skeleton` and `/visual-product-skeleton`.
- The app reached `appScreen="loop"`.
- `data-product-skeleton-task="SKEL-001"` was present.
- `data-product-skeleton-source="provider-composed"` was present.
- `data-visual-skeleton-task="VSKEL-001"` was present.
- `data-visual-skeleton-agent="visual-product-skeleton-agent"` was present.
- `data-visual-skeleton-source="provider-composed"` was present.
- `data-visual-skeleton-plugin-id="premium-brand"` was present.
- `DESIGN-PLUG-004` proof was present.
- Screenshot: `/private/tmp/nexus-vskel-premium-gifts-live.png`

Residual issue:

- Visible copy still includes mistranslated labels such as `שלד ראשון מסוכן מוצר` and `מסך ראשון חי מסוכן ויזואלי`.
- This is routed to `W4-UPGRADE-002` first-skeleton trust quality and does not reopen `VSKEL-001`, because the agent reality gate and second live browser proof are now satisfied.

## Closure Boundary

This closes `VSKEL-001` as `trueGreen`.

The code path, service path, UI path, focused tests, project-root env loading, both canonical live provider/browser examples, and the visible Create -> Build browser chain are implemented and verified.
