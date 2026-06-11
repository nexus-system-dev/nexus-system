# Product Skeleton Agent Implementation Evidence

Task: `SKEL-001`
Date: `2026-06-03`
Status: `trueGreen`

## What changed

`Product Skeleton Agent` now has a live provider-backed execution path. Nexus no longer jumps directly from `Project Discovery Agent` to Build / Loop when the discovery agent says enough truth exists. The browser requests `/api/onboarding/sessions/:sessionId/product-skeleton`, and Build / Loop opens only when the Product Skeleton Agent returns a valid `provider-composed` envelope.

If the Product Skeleton Agent is unavailable, malformed, or blocked by insufficient discovery handoff, Nexus keeps the user in Create and says it cannot open a fake skeleton.

## Preserved engines

- `Project Discovery Agent` remains the owner of product understanding and enough-truth decision.
- `onboarding-intake-engine` remains a hidden compatibility/read model, not the active agent brain.
- Existing project bootstrap and class-based skeleton helpers remain compatibility engines, not the active first-skeleton authority.
- `SURF-003` Build workspace remains the visible shell that consumes the skeleton.

## Removed from active path

- Direct `Project Discovery Agent -> Build / Loop` transition without Product Skeleton Agent output.
- Static class/domain skeletons as the active first skeleton brain.
- Silent fallback skeleton when provider execution fails.

## Built

- Strict `nexus_product_skeleton_agent` provider schema in `src/core/onboarding-provider-client.js`.
- `generateProductSkeleton()` provider method with no local skeleton fallback.
- `OnboardingService.generateProductSkeletonFromDiscovery()` handoff and persistence.
- `POST /api/onboarding/sessions/:sessionId/product-skeleton`.
- Browser finish path now blocks unless `productSkeletonAgentOutput.responseSource === provider-composed`.
- Build / Loop renders a visible `SKEL-001` skeleton card from the Product Skeleton Agent envelope, including `doNotBuildNow`.

## Verification

- `node --check src/core/onboarding-provider-client.js`
- `node --check src/core/onboarding-service.js`
- `node --check src/core/project-service.js`
- `node --check src/server.js`
- `node --check web/app.js`
- `node --check web/nexus-ui/adapters/loop-adapter.js`
- `node --check web/nexus-ui/screens/LoopCoreScreen.js`
- `node --test test/onboarding-provider-client.test.js test/product-skeleton-agent-service.test.js test/loop-core-screen-render.test.js test/ask-only-if-needed-interaction-contract.test.js test/enough-truth-before-build-contract.test.js test/project-discovery-agent-front-door.test.js`

The focused regression passed `40/40`.

## Live provider proof

Live provider execution on `127.0.0.1:4013` covered two different product understandings:

- Lead-management tool: returned `web app (כלי פנימי לניהול לידים)`, first workflow `רשימת לידים — הוספה וניהול ליד`, screens `רשימת לידים`, `טופס הוספת/עריכת ליד`, and `doNotBuildNow` including WhatsApp integration, automations, permissions, external CRM sync, recurring reminders, and advanced reports.
- Embroidered gifts store: returned `אתר חנות אונליין — דף הזמנה למתנות רקמה`, first workflow `בחירת מוצר → התאמת טקסט לרקמה → תצוגת דוגמה → ביצוע הזמנה`, screens for product catalog, customization, preview, and cart/order confirmation, and `doNotBuildNow` explicitly excluding lead-management/admin dashboard.

The two outputs were different and product-specific.

## Live browser proof

The in-app browser on `127.0.0.1:4013/create?qa=1&qaReset=1&qaScreen=create` submitted a lead-management project through the Create screen. The visible flow reached `appScreen=loop`, rendered `data-product-skeleton-task="SKEL-001"`, `data-product-skeleton-agent="product-skeleton-agent"`, `data-product-skeleton-source="provider-composed"`, and showed a Product Skeleton Agent card with:

- primary user
- primary problem
- first workflow
- initial screens
- build-now
- do-not-build-now

## Remaining boundary

`SKEL-001` closes only the structural product skeleton. It does not claim visual product layout, design plugin selection, visual build, mutation, history, sharing, growth, verification, or release behavior.

