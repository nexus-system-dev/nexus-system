# Ask Only If Needed Interaction Contract — SLICE-004

Date: 2026-06-03
Status: canonical implementation contract
Task: SLICE-004 — Ask-only-if-needed interaction

## Purpose

SLICE-004 locks how Nexus behaves when the Project Discovery Agent does not yet have enough truth for the first build.

The agent may ask one blocking question, proceed without extra questions when enough truth exists, or stop without creating a fake skeleton.

## Preserved Engine Truth

- The onboarding intake engine remains hidden support infrastructure.
- The Project Discovery Agent remains the authority for asking, advancing, or stopping.
- The enough-truth gate from `SLICE-003` remains the build boundary.

## Removed Behavior

- No multi-question checklist before the first skeleton.
- No extra questions when the Project Discovery Agent already approved build readiness.
- No placeholders hiding missing understanding.
- No fake skeleton when the correct outcome is to stop.

## Built Behavior

The discovery state now exposes `askPolicy`:

- `taskId: SLICE-004`
- `policy: ask-only-if-needed`
- `outcome: ask-one-blocking-question | advance-without-extra-question | stop-without-fake-skeleton`
- `questionCount: 0 | 1`
- `blockingQuestion`
- `authority: project-discovery-agent-decision`
- `preservedEngine: onboarding-intake-engine`
- `proofBoundary: interaction-policy-only-not-skeleton-generation`

The Create surface exposes internal data markers for this policy without showing system labels to the user.

## Rules

- Ask only when a blocking product-truth gap exists.
- Ask exactly one visible question.
- The question must be user-facing and present in the agent reply when the provider returns `nextMove=ask`.
- Advance without extra questions when enough truth exists.
- Stop without fake skeleton when no safe question is available.

## Boundary

This task does not create the Product Skeleton Agent output.

Still open:

- `SKEL-001`
- `VSKEL-001`
- `BLD-AGT-001`

## Done Criteria

- Weak or partial understanding returns one blocking question when the agent provides one.
- Agent-approved enough truth advances without extra questions.
- Empty/no-safe-input state stops without fake skeleton.
- Create surface carries internal proof markers for the ask policy.
- Browser verification proves the live Create route exposes the policy without user-visible system labels.
