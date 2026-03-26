import test from "node:test";
import assert from "node:assert/strict";

import { createReleaseTimelineBuilder } from "../src/core/release-timeline-builder.js";

test("release timeline builder returns canonical release timeline", () => {
  const { releaseTimeline } = createReleaseTimelineBuilder({
    releaseRun: {
      releaseRunId: "release-run:giftwallet:web-deployment",
    },
    statusEvents: [
      {
        step: "build",
        status: "completed",
        summary: "build completed",
      },
      {
        step: "publish",
        status: "published",
        summary: "release published",
        isTerminal: true,
      },
    ],
  });

  assert.equal(releaseTimeline.releaseRunId, "release-run:giftwallet:web-deployment");
  assert.equal(releaseTimeline.currentStage, "publish");
  assert.equal(releaseTimeline.currentStatus, "published");
  assert.equal(releaseTimeline.eventCount, 2);
  assert.equal(Array.isArray(releaseTimeline.events), true);
});
