import test from "node:test";
import assert from "node:assert/strict";

import { buildRepeatedLoopContinuation } from "../src/core/repeated-loop-continuation.js";

test("repeated-loop continuation opens clarification truth when supporting material is still deferred", () => {
  const continuation = buildRepeatedLoopContinuation({
    projectId: "family-flow",
    approvalCount: 1,
    project: {
      name: "Family Flow",
      artifactExpectation: {
        projectType: "mobile-app",
        title: "Family Flow mobile flow",
      },
      onboardingStateHandoff: {
        continuationGate: {
          gateType: "supporting-material",
          title: "אפשר להמשיך ללופ, אבל חומר תומך יחזק את הדיוק של הזרימה הניידת",
          detail: "ההבנה כבר מספיקה כדי לקדם את זרימת המובייל. אם תצרף מסך קיים, spec או קישור רלוונטי, Nexus ידייק יותר את המסך הראשון והפעולה הראשונה בלי לעצור את ההתקדמות.",
          requestedMaterialLabel: "מסכים קיימים, spec למובייל, או קישור שמדגים את הזרימה הרצויה",
        },
      },
    },
  });

  assert.equal(continuation.active, true);
  assert.equal(continuation.requiresClarification, true);
  assert.match(continuation.missionTitle, /צריך עוד חומר תומך/);
  assert.match(continuation.expectedProofLine, /spec למובייל/);
  assert.match(continuation.proofIncrement.reason, /מושהה truthfully/);
});
