import test from "node:test";
import assert from "node:assert/strict";

import { createReturningUserResolver } from "../src/core/returning-user-resolver.js";

test("returning user resolver marks a user as returning after seven days with a new session", () => {
  const { returningUserMetric } = createReturningUserResolver({
    userSessionMetric: {
      userId: "user-1",
      sessionId: "session-2",
      lastSeenAt: "2026-01-09T10:00:00.000Z",
    },
    previousUserSessionMetric: {
      userId: "user-1",
      sessionId: "session-1",
      lastSeenAt: "2026-01-02T10:00:00.000Z",
    },
  });

  assert.deepEqual(returningUserMetric, {
    returningUserMetricId: "returning-user:user-1:session-2:2026-01-09T10:00:00.000Z",
    userId: "user-1",
    sessionId: "session-2",
    previousSessionId: "session-1",
    currentLastSeenAt: "2026-01-09T10:00:00.000Z",
    previousLastSeenAt: "2026-01-02T10:00:00.000Z",
    isReturningUser: true,
  });
});

test("returning user resolver keeps false when fewer than seven days have passed", () => {
  const { returningUserMetric } = createReturningUserResolver({
    userSessionMetric: {
      userId: "user-1",
      sessionId: "session-2",
      lastSeenAt: "2026-01-08T09:59:59.000Z",
    },
    previousUserSessionMetric: {
      userId: "user-1",
      sessionId: "session-1",
      lastSeenAt: "2026-01-02T10:00:00.000Z",
    },
  });

  assert.equal(returningUserMetric.isReturningUser, false);
});

test("returning user resolver keeps false for the same session or missing timestamps", () => {
  const sameSession = createReturningUserResolver({
    userSessionMetric: {
      userId: "user-1",
      sessionId: "session-1",
      lastSeenAt: "2026-01-10T10:00:00.000Z",
    },
    previousUserSessionMetric: {
      userId: "user-1",
      sessionId: "session-1",
      lastSeenAt: "2026-01-01T10:00:00.000Z",
    },
  });
  const missingTimestamp = createReturningUserResolver({
    userSessionMetric: {
      userId: "user-1",
      sessionId: "session-2",
      lastSeenAt: null,
    },
    previousUserSessionMetric: {
      userId: "user-1",
      sessionId: "session-1",
      lastSeenAt: "2026-01-01T10:00:00.000Z",
    },
  });

  assert.equal(sameSession.returningUserMetric.isReturningUser, false);
  assert.equal(missingTimestamp.returningUserMetric.isReturningUser, false);
});
