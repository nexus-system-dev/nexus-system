import test from "node:test";
import assert from "node:assert/strict";

import { createHumanUserProductivityResolver } from "../src/core/human-user-productivity-resolver.js";

test("human user productivity resolver aggregates time saved from mapped agents into the owning human user", () => {
  const { humanUserProductivity } = createHumanUserProductivityResolver({
    projectId: "giftwallet",
    timeSaved: {
      entries: [
        {
          projectId: "giftwallet",
          agentId: "dev-agent",
          timeSavedMs: 900000,
          recordedAt: "2026-01-01T10:00:00.000Z",
        },
        {
          projectId: "giftwallet",
          agentId: "qa-agent",
          timeSavedMs: 300000,
          recordedAt: "2026-01-01T12:00:00.000Z",
        },
        {
          projectId: "giftwallet",
          agentId: "marketing-agent",
          timeSavedMs: null,
          recordedAt: "2026-01-01T15:00:00.000Z",
        },
      ],
    },
    userAgentMapping: {
      status: "ready",
      byAgent: {
        "dev-agent": { humanUserId: "user-1" },
        "qa-agent": { humanUserId: "user-1" },
      },
    },
  });

  assert.equal(humanUserProductivity.status, "ready");
  assert.equal(humanUserProductivity.totalTimeSavedMs, 1200000);
  assert.deepEqual(humanUserProductivity.byHumanUser, {
    "user-1": 1200000,
  });
  assert.deepEqual(humanUserProductivity.byProject, {
    giftwallet: 1200000,
  });
  assert.deepEqual(humanUserProductivity.byDay, {
    "2026-01-01": 1200000,
  });
  assert.deepEqual(humanUserProductivity.agentBreakdown, {
    "user-1": {
      "dev-agent": 900000,
      "qa-agent": 300000,
    },
  });
  assert.deepEqual(humanUserProductivity.summary, {
    totalResolvedEntries: 2,
    totalUnresolvedEntries: 0,
    totalMappedUsers: 1,
  });
});

test("human user productivity resolver keeps unresolved entries visible when no human mapping exists", () => {
  const { humanUserProductivity } = createHumanUserProductivityResolver({
    projectId: "giftwallet",
    timeSaved: {
      entries: [
        {
          projectId: "giftwallet",
          agentId: "dev-agent",
          timeSavedMs: 100000,
          recordedAt: "2026-01-01T10:00:00.000Z",
        },
      ],
    },
    userAgentMapping: {
      status: "missing-inputs",
      byAgent: {},
    },
  });

  assert.equal(humanUserProductivity.status, "missing-inputs");
  assert.deepEqual(humanUserProductivity.byHumanUser, {});
  assert.equal(humanUserProductivity.summary.totalResolvedEntries, 0);
  assert.equal(humanUserProductivity.summary.totalUnresolvedEntries, 1);
});
