import test from "node:test";
import assert from "node:assert/strict";

import { createPostReleaseContinuationLoop } from "../src/core/post-release-continuation-loop.js";

test("post-release continuation loop uses repeated loop continuation when it exists", () => {
  const { postReleaseContinuationLoop } = createPostReleaseContinuationLoop({
    productClass: "mobile-app",
    proofArtifact: {
      artifactId: "proof-artifact:coach-mobile",
      title: "Coach Mobile mobile flow",
    },
    releaseEvidenceHandoffModel: {
      releaseTarget: "app-store",
    },
    releaseableProductStateContract: {
      status: "ready",
      releaseTarget: "app-store",
    },
    repeatedLoopContinuation: {
      active: true,
      missionTitle: "לקדם את Coach Mobile mobile flow",
      missionDescription: "סבב 2 מחזק את המסך הראשון והפעולה הראשונה.",
      upcomingItems: [
        "לחדד את המסך הראשון סביב מה שקורה היום",
        "להפוך את הפעולה הראשונה להחלטה אחת ברורה",
      ],
    },
  });

  assert.equal(postReleaseContinuationLoop.status, "active");
  assert.equal(postReleaseContinuationLoop.originReleaseTarget, "app-store");
  assert.equal(postReleaseContinuationLoop.nextMoveTitle, "לקדם את Coach Mobile mobile flow");
  assert.deepEqual(postReleaseContinuationLoop.continuationMoves, [
    "לחדד את המסך הראשון סביב מה שקורה היום",
    "להפוך את הפעולה הראשונה להחלטה אחת ברורה",
  ]);
});

test("post-release continuation loop derives first continuation moves when no repeated loop exists yet", () => {
  const { postReleaseContinuationLoop } = createPostReleaseContinuationLoop({
    productClass: "landing-page",
    proofArtifact: {
      artifactId: "proof-artifact:clinic-landing",
      title: "Clinic Landing landing page",
    },
    releaseEvidenceHandoffModel: {
      status: "preparing",
      releaseTarget: "web-deployment",
    },
    releaseableProductStateContract: {
      status: "ready",
      releaseTarget: "web-deployment",
    },
  });

  assert.equal(postReleaseContinuationLoop.status, "ready");
  assert.equal(postReleaseContinuationLoop.statusLabel, "מוכן לפתוח סבב המשך");
  assert.equal(postReleaseContinuationLoop.nextMoveTitle, "לקדם את Clinic Landing landing page");
  assert.equal(postReleaseContinuationLoop.continuationMoves[0], "לחדד את ההבטחה הראשית מעל הקפל");
});
