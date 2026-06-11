# SURF-004 Release Surface Canonical Structure Contract

Date: `2026-05-30`
Status: `canonical surface contract`
Task: `SURF-004 — Release surface canonical structure`

## Product Law

Release surface = final human release decision workspace.

It is not an advanced side route, proof dashboard, deploy log, or timeline clone.
It is the place where Nexus shows:

- what is about to be released
- whether release gates passed
- what verification evidence exists
- where publish/deploy stands
- how to recover if release fails
- how to rollback
- how to share/demo the result
- how release/version history remains accessible

## Preserved Engine Truth

`SURF-004` preserves the existing release engine layer:

- release workspace state
- release plan / release target
- release validation
- release readiness
- pre-deploy quality gate
- deployment request/result/evidence
- release timeline / version history
- ownership-aware release guard
- post-release continuation

The shell may not invent release readiness. It only renders release truth that exists in project state or release contracts.

## Removed Visible Behavior

The active Release surface may not present itself as:

- an advanced lane
- a generic workspace fallback
- a QA placeholder
- a proof-only dashboard
- a timeline/stepper sequence
- a deploy-log-only page

## Required Surface Regions

The active Release surface must expose these regions:

- `release-preview-surface`
- `release-gate`
- `verification-evidence`
- `deploy-publish-action`
- `failed-release-recovery`
- `rollback-affordance`
- `share-demo-link`
- `version-history-anchor`

## DOM Contract

The Release route must expose:

- `data-release-surface-contract="SURF-004"`
- `data-surface-id="release"`
- `data-surface-purpose="human-release-decision-workspace"`
- `data-release-law="preview-plus-gate-plus-deploy-truth"`

## Closure Standard

`SURF-004` can close only when:

- `/release` renders a real Release surface, not the old workspace fallback
- the required regions are present in DOM
- release readiness/gate truth is visible
- publish/deploy path is visible without claiming a fake deploy
- rollback/share/version anchors are visible
- tests pass
- live browser verification confirms the visible route

