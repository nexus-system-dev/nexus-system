import test from "node:test";
import assert from "node:assert/strict";

import { renderTimelineHistoryScreen } from "../web/nexus-ui/screens/TimelineHistoryScreen.js";

test("timeline screen renders cross-surface continuity card", () => {
  const html = renderTimelineHistoryScreen({
    badge: "QA preview override",
    title: "איך התוצר התקדם עד כאן",
    subtitle: "רצף ההתקדמות של הפרויקט נשאר מחובר.",
    projectName: "Landing QA",
    artifactTruth: {
      title: "Landing page",
      subtitle: "דף נחיתה חי",
      artifact: {
        title: "Landing page",
        previewKind: "landing-page",
        shell: { kind: "browser-window" },
      },
      openAction: { label: "פתח את התוצר", target: "artifact", supported: true },
    },
    artifactAction: { label: "פתח את התוצר", target: "artifact", supported: true },
    crossSurfaceContinuity: {
      statusLabel: "הרצף בין המסכים נשאר מחובר",
      visibleContinuityRule: "build, proof, release, deployment feedback, timeline, and continuation must read like one connected product loop inside Nexus",
      explainablePath: "execution:build -> proof:artifact -> proof:release-evidence -> execution:deployment-feedback -> next-task:continuation -> timeline:timeline",
      continuityChecks: [
        "same-project-identity-across-surfaces",
        "route-restore-survives-refresh",
      ],
      continuitySteps: [
        { title: "Build / execution", routeKey: "execution", visibleAnchor: "surface-evolving", continuityRule: "build survives restore" },
        { title: "Proof / artifact", routeKey: "proof", visibleAnchor: "Landing page", continuityRule: "artifact survives proof revisit" },
      ],
      restoreRule: "cross-surface continuity must survive refresh, route restore, revisit, and transition back into execution",
    },
    wave4LiveVerificationMatrix: {
      statusLabel: "ל־Wave 4 יש מטריצת אימות חיה אחת",
      matrixRule: "every major Wave 4 capability must declare one visible route, one visible anchor, pass/fail truth, and restore/continuity checks before later live reruns can close the wave truthfully",
      strongerPreviewRule: "use the stronger preview path when available",
      restoreRule: "the live verification matrix must include refresh, route restore, revisit, and transition checks wherever the capability changes user-facing product truth",
      summary: {
        totalLanes: "10",
        executionRoutes: "4",
        proofRoutes: "2",
        restoreChecks: "20",
      },
      verificationLanes: [
        {
          laneId: "product-understanding-and-class-resolution",
          title: "Product understanding and class resolution",
          routeKey: "understanding",
          visibleAnchor: "landing-page · bootstrap",
          passCriteria: ["pass if class and stage are visible before execution"],
          restoreChecks: ["class identity survives route restore"],
        },
      ],
    },
    canonicalLearningSystemContract: {
      statusLabel: "מערכת הלמידה מוגדרת עכשיו כחוזה קנוני אחד",
      contractRule: "Nexus must separate project memory, user preference memory, and system learning, and only call it learning where stored signals change later decisions truthfully.",
      summary: {
        memoryLayers: "3",
        liveInputs: "5",
        partialInputs: "6",
        liveImpacts: "1",
        partialImpacts: "2",
        crossProjectPatterns: "2",
      },
      memoryLayers: [
        {
          title: "Project memory",
          status: "live",
          scope: "Stores project-specific outcomes.",
          storedInputs: ["execution history"],
          decisionImpact: ["next-task framing"],
          continuityRule: "Project memory stays attached to the same project identity.",
        },
      ],
      decisionImpacts: [
        {
          label: "next-task selection",
          status: "live",
          currentEffect: "Adaptive execution uses feedback to steer next work.",
        },
      ],
      continuityRules: [
        "learning state may not silently reset across restore",
      ],
      generationIntegrationRules: [
        "generation must later consume learned class signals",
      ],
      explicitProhibitions: [
        "no hidden AI intuition without canonical trace",
      ],
      visibleProductExpectations: [
        "smarter generation direction",
      ],
    },
    entries: [
      {
        id: "event-1",
        title: "המסך הראשון עודכן",
        description: "האירוע נשמר בהיסטוריית הפרויקט.",
        timestamp: "10:42",
        kind: "משימה",
        tone: "success",
        glyph: "✓",
      },
    ],
    stats: [
      { label: "משימות הושלמו", value: "1" },
    ],
    primaryAction: { label: "חזור לצעד הנוכחי", target: "loop" },
  });

  assert.match(html, /Wave 4 live verification matrix/);
  assert.match(html, /Canonical learning system/);
  assert.match(html, /Project memory/);
  assert.match(html, /next-task selection/);
  assert.match(html, /ל־Wave 4 יש מטריצת אימות חיה אחת/);
  assert.match(html, /understanding · Product understanding and class resolution/);
  assert.match(html, /Cross-surface continuity/);
  assert.match(html, /הרצף בין המסכים נשאר מחובר/);
  assert.match(html, /execution · Build \/ execution/);
  assert.match(html, /route-restore-survives-refresh/);
  assert.match(html, /execution:build -&gt; proof:artifact|execution:build -> proof:artifact/);
});
