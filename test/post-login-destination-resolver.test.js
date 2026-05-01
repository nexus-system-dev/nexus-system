import test from "node:test";
import assert from "node:assert/strict";

import { createPostLoginDestinationResolver } from "../src/core/post-login-destination-resolver.js";

test("post login destination resolver sends direct app users with existing project state to dashboard", () => {
  const { postLoginDestination } = createPostLoginDestinationResolver({
    appEntryDecision: {
      appEntryDecisionId: "app-entry:nexus",
      status: "ready",
      decision: "direct-app",
    },
    userSessionMetric: {
      totalSessions: 2,
    },
    projectState: {
      projectIdentity: {
        projectId: "giftwallet",
      },
    },
  });

  assert.equal(postLoginDestination.status, "ready");
  assert.equal(postLoginDestination.destination, "dashboard");
});
