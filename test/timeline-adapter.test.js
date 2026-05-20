import test from "node:test";
import assert from "node:assert/strict";

import { buildTimelineViewModel } from "../web/nexus-ui/adapters/timeline-adapter.js";

test("timeline adapter exposes cross-surface continuity contract", () => {
  const viewModel = buildTimelineViewModel({
    project: {
      name: "Landing QA",
      proofArtifact: {
        artifactId: "artifact-1",
        title: "Landing page",
        status: "ready",
        previewKind: "landing-page",
        previewPayload: {
          title: "Landing page",
          subtitle: "תצוגת מוצר פעילה",
          kind: "landing-page",
          proofMeta: {
            previewable: true,
            regionCount: 3,
          },
        },
        actions: {
          open: { supported: true, routeKey: "artifact" },
          download: { supported: true },
        },
      },
      crossSurfaceContinuityContract: {
        statusLabel: "הרצף בין המסכים נשאר מחובר",
        visibleContinuityRule: "build, proof, release, deployment feedback, timeline, and continuation must read like one connected product loop inside Nexus",
        explainablePath: "execution:build -> proof:artifact -> next-task:continuation -> timeline:timeline",
        continuityChecks: [
          "same-project-identity-across-surfaces",
          "route-restore-survives-refresh",
        ],
        continuitySteps: [
          {
            title: "Build / execution",
            routeKey: "execution",
            visibleAnchor: "surface-evolving",
            continuityRule: "build progression survives route restore",
          },
          {
            title: "Timeline continuity",
            routeKey: "timeline",
            visibleAnchor: "timeline-keeps-the-loop-connected",
            continuityRule: "timeline preserves the loop story",
          },
        ],
        restoreRule: "cross-surface continuity must survive refresh, route restore, revisit, and transition back into execution",
      },
      wave4LiveVerificationMatrix: {
        statusLabel: "ל־Wave 4 יש מטריצת אימות חיה אחת",
        matrixRule: "every major Wave 4 capability must declare one visible route, one visible anchor, pass/fail truth, and restore/continuity checks before later live reruns can close the wave truthfully",
        strongerPreviewRule: "use the stronger preview path when available",
        restoreRule: "the live verification matrix must include refresh, route restore, revisit, and transition checks wherever the capability changes user-facing product truth",
        summary: {
          totalLanes: 10,
          executionRoutes: 4,
          proofRoutes: 2,
          restoreChecks: 20,
        },
        verificationLanes: [
          {
            laneId: "product-understanding-and-class-resolution",
            title: "Product understanding and class resolution",
            routeKey: "understanding",
            visibleAnchor: "landing-page · bootstrap",
            verificationFocus: ["class is explicit"],
            passCriteria: ["pass if class and stage are visible before execution"],
            restoreChecks: ["class identity survives route restore"],
            strongerPreviewPath: "understanding-summary-route",
          },
        ],
      },
      events: [
        {
          type: "task.completed",
          timestamp: "10:42",
          payload: {
            task: {
              summary: "המסך הראשון עודכן",
            },
          },
        },
      ],
    },
  });

  assert.equal(viewModel.crossSurfaceContinuity.statusLabel, "הרצף בין המסכים נשאר מחובר");
  assert.equal(viewModel.crossSurfaceContinuity.continuitySteps[0].routeKey, "execution");
  assert.match(viewModel.crossSurfaceContinuity.explainablePath, /proof:artifact/);
  assert.equal(viewModel.crossSurfaceContinuity.continuityChecks.includes("route-restore-survives-refresh"), true);
  assert.equal(viewModel.wave4LiveVerificationMatrix.statusLabel, "ל־Wave 4 יש מטריצת אימות חיה אחת");
  assert.equal(viewModel.wave4LiveVerificationMatrix.verificationLanes[0].routeKey, "understanding");
  assert.equal(viewModel.wave4LiveVerificationMatrix.summary.totalLanes, "10");
});
