# Standalone Releasable Product Artifact Contract

Status: canonical release-blocker contract for `STANDALONE-ARTIFACT-001`.

## Purpose

Before Nexus tells a user that a product can be released, Nexus must produce a standalone product artifact that can run outside Nexus.

The current runtime skeleton and product-domain skeleton are valid as Nexus-internal project truth, but they are not enough to claim that the user has a releasable product.

## Core Law

Nexus may not say "ready to release", "published", "deployable", "share this with customers", or equivalent user-facing language unless there is a standalone artifact with:

1. product screens
2. product actions
3. product state and persistence
4. a backend/domain execution boundary
5. a run/preview target outside the Nexus Build canvas
6. verification evidence
7. release limits and non-production boundaries where relevant

## Required Artifact

The standalone artifact must include:

1. a frontend entry point appropriate to the product class
2. a backend/domain layer appropriate to the product class
3. a data model or schema
4. operations/actions behind the UI
5. local or mock persistence at minimum
6. clear run instructions or a runnable preview command
7. generated artifact identity tied to the Nexus project id
8. artifact history tied to mutations that created it
9. verification output proving it runs or explaining why it cannot run

## Product Class Requirements

Mobile app:
- standalone app-style preview or project scaffold
- app screens and navigation
- local/domain data state
- operations behind buttons

Landing page:
- standalone page/app entry
- lead capture model
- submit validation
- stored/mock lead record

Internal tool:
- standalone work surface
- record model
- update/filter/status operations
- local/mock persistence

Commerce:
- standalone product/cart/checkout preview
- product and cart model
- order draft
- payment boundary without fake payment execution

Game:
- standalone playable loop
- game state
- score/rules/progression

Software/tool:
- standalone tool UI
- input/action/output logic
- saved or reproducible operation state

## Non-Goals

This task does not require real external providers, real payments, real WhatsApp, App Store publishing, or production hosting.

Those remain provider/release tasks.

This task does require that Nexus can produce and verify a standalone runnable artifact before claiming release readiness.

## Not TrueGreen

This task is not trueGreen if:

1. the product exists only inside the Nexus Build canvas
2. the product has no runnable artifact outside Nexus
3. the frontend exists but product operations are still only mocked in Nexus state
4. the backend/domain layer is only described in prose
5. release language appears before standalone artifact verification
6. the user cannot tell what is real, mock, preview, or production
7. verification does not run the standalone artifact or produce a precise blocker
