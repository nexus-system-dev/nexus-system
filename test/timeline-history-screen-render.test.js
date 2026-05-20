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

  assert.match(html, /Cross-surface continuity/);
  assert.match(html, /הרצף בין המסכים נשאר מחובר/);
  assert.match(html, /execution · Build \/ execution/);
  assert.match(html, /route-restore-survives-refresh/);
  assert.match(html, /execution:build -&gt; proof:artifact|execution:build -> proof:artifact/);
});
