# Wave 3 Live Class Failure Ledger

## Purpose

This ledger is the canonical write-back surface for failures discovered during the live class sweep.

It is not the sweep runner.

It is not a general backlog dump.

It is the canonical schema and recording format for every live sweep failure.

## Canonical Failure Schema

Every recorded failure must include:

- `failureId`
- `productClass`
- `intakePath`
- `liveStep`
- `failurePhase`
- `route`
- `visibleFailure`
- `expectedTruth`
- `actualTruth`
- `blockerType`
- `severity`
- `reproducibility`
- `userVisible`
- `restoreImpact`
- `continuityImpact`
- `owningLane`
- `suggestedNextTask`
- `promotionDecision`
- `rerunStatus`
- `evidencePath`
- `canonicalState`

## Field Definitions

### `failureId`

Stable identifier for this failure instance.

Recommended shape:

- `W3-LCS-<class>-<path>-<step>-<ordinal>`

### `productClass`

One of:

- `landing-page`
- `mobile-app`
- `internal-tool`
- `commerce-ops`

### `intakePath`

One of:

- `create`
- `upload-from-local-machine`

### `liveStep`

One of:

- `Create`
- `Understanding`
- `Loop`
- `Proof`
- `Artifact`
- `Timeline`
- `Route`
- `Restore`
- `Continuity`

### `failurePhase`

The phase where the failure first became truthfully visible.

Recommended values:

- `entry`
- `handoff`
- `downstream`
- `refresh`
- `rerun`

### `route`

The live route where the failure was observed.

Examples:

- `/`
- `/onboarding`
- `/loop`
- `/proof`
- `/artifact`
- `/timeline`

### `visibleFailure`

Short user-visible description of what actually broke.

### `expectedTruth`

What should have been visibly true for this class/path/step.

### `actualTruth`

What was visibly true instead.

### `blockerType`

Recommended values:

- `runtime-truth`
- `route-truth`
- `restore-truth`
- `continuity-truth`
- `comprehension-truth`
- `loop-truth`
- `proof-truth`
- `artifact-truth`
- `timeline-truth`
- `identity-truth`
- `product-grade-truth`

### `severity`

Recommended values:

- `critical`
- `high`
- `medium`
- `low`

### `reproducibility`

Recommended values:

- `always`
- `intermittent`
- `unknown`

### `userVisible`

Whether the failure is visibly apparent to a user on the live site.

Recommended values:

- `yes`
- `partial`
- `no`

### `restoreImpact`

How the failure affects refresh / reopen truth.

Recommended values:

- `none`
- `minor`
- `major`

### `continuityImpact`

How the failure affects downstream continuity truth.

Recommended values:

- `none`
- `minor`
- `major`

### `owningLane`

The canonical lane that should own closure of this failure.

### `suggestedNextTask`

The smallest truthful next executable task if one is already clear.

### `promotionDecision`

Recommended values:

- `stay-in-current-task`
- `promote-new-task`
- `promote-new-lane`
- `needs-human-judgment`

### `rerunStatus`

Recommended values:

- `not-rerun`
- `rerun-passed`
- `rerun-failed`
- `rerun-blocked`

### `evidencePath`

Canonical evidence path for screenshots, report JSON, or notes.

### `canonicalState`

Recommended values:

- `in-progress`
- `blocked`
- `trueGreen`

## Recording Rules

- One failure record per distinct failure truth
- Do not merge unrelated failures into one row

## Recorded Failures

### 2026-05-18 — First Live Class Sweep

```yaml
- failureId: W3-LCS-internal-tool-create-Create-001
  productClass: internal-tool
  intakePath: create
  liveStep: Create
  failurePhase: entry
  route: /
  visibleFailure: "Create never progressed into onboarding; the live site stayed on the create form and reported that name and short description were still missing."
  expectedTruth: "Create should carry the internal-tool project into onboarding after valid project name and description submission."
  actualTruth: "The live site stayed on the create surface and visibly showed `אין פרויקטים` and `צריך להזין שם פרויקט ותיאור קצר לפני היצירה.`"
  blockerType: runtime-truth
  severity: critical
  reproducibility: always
  userVisible: yes
  restoreImpact: none
  continuityImpact: major
  owningLane: W3-LIVE-CLASS-SWEEP
  suggestedNextTask: "Open a bounded create-start reliability task for internal-tool create submission on 4011."
  promotionDecision: promote-new-task
  rerunStatus: rerun-passed
  evidencePath: "docs/operating-system/wave3-final-hardening/evidence/live-class-sweep/2026-05-18/create-internal-tool-01-create.png"
  canonicalState: trueGreen
- failureId: W3-LCS-landing-page-upload-from-local-machine-Create-001
  productClass: landing-page
  intakePath: upload-from-local-machine
  liveStep: Create
  failurePhase: entry
  route: /
  visibleFailure: "Upload create never progressed into onboarding; the live site stayed on the create form and reported that name and short description were still missing."
  expectedTruth: "Upload-from-local-machine should accept the selected local landing-page evidence, preserve the intake, and enter onboarding."
  actualTruth: "The live site stayed on the create surface and visibly showed `אין פרויקטים` and `צריך להזין שם פרויקט ותיאור קצר לפני היצירה.`"
  blockerType: runtime-truth
  severity: critical
  reproducibility: always
  userVisible: yes
  restoreImpact: none
  continuityImpact: major
  owningLane: W3-LIVE-CLASS-SWEEP
  suggestedNextTask: "Open a bounded create-start reliability task for landing-page local-upload submission on 4011."
  promotionDecision: promote-new-task
  rerunStatus: rerun-passed
  evidencePath: "docs/operating-system/wave3-final-hardening/evidence/live-class-sweep/2026-05-18/upload-landing-page-01-create.png"
  canonicalState: trueGreen
- failureId: W3-LCS-mobile-app-upload-from-local-machine-Create-001
  productClass: mobile-app
  intakePath: upload-from-local-machine
  liveStep: Create
  failurePhase: entry
  route: /
  visibleFailure: "Upload create never progressed into onboarding; the live site stayed on the create form and reported that name and short description were still missing."
  expectedTruth: "Upload-from-local-machine should accept the selected local mobile-app evidence, preserve the intake, and enter onboarding."
  actualTruth: "The live site stayed on the create surface and visibly showed `אין פרויקטים` and `צריך להזין שם פרויקט ותיאור קצר לפני היצירה.`"
  blockerType: runtime-truth
  severity: critical
  reproducibility: always
  userVisible: yes
  restoreImpact: none
  continuityImpact: major
  owningLane: W3-LIVE-CLASS-SWEEP
  suggestedNextTask: "Open a bounded create-start reliability task for mobile-app local-upload submission on 4011."
  promotionDecision: promote-new-task
  rerunStatus: rerun-passed
  evidencePath: "docs/operating-system/wave3-final-hardening/evidence/live-class-sweep/2026-05-18/upload-mobile-app-01-create.png"
  canonicalState: trueGreen
- failureId: W3-LCS-commerce-ops-upload-from-local-machine-Create-001
  productClass: commerce-ops
  intakePath: upload-from-local-machine
  liveStep: Create
  failurePhase: entry
  route: /
  visibleFailure: "Upload create never progressed into onboarding; the live site stayed on the create form and reported that name and short description were still missing."
  expectedTruth: "Upload-from-local-machine should accept the selected local commerce-ops evidence, preserve the intake, and enter onboarding."
  actualTruth: "The live site stayed on the create surface and visibly showed `אין פרויקטים` and `צריך להזין שם פרויקט ותיאור קצר לפני היצירה.`"
  blockerType: runtime-truth
  severity: critical
  reproducibility: always
  userVisible: yes
  restoreImpact: none
  continuityImpact: major
  owningLane: W3-LIVE-CLASS-SWEEP
  suggestedNextTask: "Open a bounded create-start reliability task for commerce-ops local-upload submission on 4011."
  promotionDecision: promote-new-task
  rerunStatus: rerun-passed
  evidencePath: "docs/operating-system/wave3-final-hardening/evidence/live-class-sweep/2026-05-18/upload-commerce-ops-01-create.png"
  canonicalState: trueGreen
```

### 2026-05-18 — Create-start reliability rerun closure

- `W3-LCS-001` reran the same canonical sweep order on `127.0.0.1:4011`
- all 8 class/path runs passed live
- the original create-start reliability failures closed with `rerunStatus: rerun-passed`
- canonical rerun evidence lives in:
  - `docs/operating-system/wave3-final-hardening/evidence/live-class-sweep/2026-05-18/live-class-sweep-report.json`
- Do not write hypothetical failures
- Do not record API-only failures unless they became product-visible on the live site
- Do not mark `trueGreen` from code-only fixes

## Initial Ledger State

No failures are recorded yet in this planning step.

The ledger is intentionally schema-first at this stage.

## Recommended Entry Template

```json
{
  "failureId": "W3-LCS-commerce-ops-upload-from-local-machine-Proof-001",
  "productClass": "commerce-ops",
  "intakePath": "upload-from-local-machine",
  "liveStep": "Proof",
  "failurePhase": "downstream",
  "route": "/proof",
  "visibleFailure": "Proof surface collapsed into a generic workspace preview.",
  "expectedTruth": "Proof should feel like a commerce operations surface with class-specific next action and preserved project identity.",
  "actualTruth": "The visible proof was generic and did not preserve commerce identity strongly enough.",
  "blockerType": "proof-truth",
  "severity": "high",
  "reproducibility": "always",
  "userVisible": "yes",
  "restoreImpact": "minor",
  "continuityImpact": "major",
  "owningLane": "W3-LIVE-CLASS-SWEEP",
  "suggestedNextTask": "Strengthen commerce-specific proof surface truth after uploaded-project handoff.",
  "promotionDecision": "stay-in-current-task",
  "rerunStatus": "not-rerun",
  "evidencePath": "docs/operating-system/wave3-final-hardening/evidence/live-class-sweep/...",
  "canonicalState": "in-progress"
}
```
