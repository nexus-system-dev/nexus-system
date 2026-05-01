import test from "node:test";
import assert from "node:assert/strict";

import { createProductivitySummaryAggregator } from "../src/core/productivity-summary-aggregator.js";

test("productivity summary aggregator falls back to agent buckets when no human mapping is provided", () => {
  const { productivitySummary } = createProductivitySummaryAggregator({
    timeSaved: {
      entries: [
        {
          projectId: "giftwallet",
          agentId: "dev-agent",
          timeSavedMs: 1500000,
          recordedAt: "2026-01-01T10:00:00.000Z",
        },
        {
          projectId: "giftwallet",
          agentId: "qa-agent",
          timeSavedMs: 300000,
          recordedAt: "2026-01-01T12:00:00.000Z",
        },
        {
          projectId: "casinohub",
          agentId: "dev-agent",
          timeSavedMs: 900000,
          recordedAt: "2026-01-02T09:00:00.000Z",
        },
      ],
    },
  });

  assert.deepEqual(productivitySummary, {
    totalTimeSavedMs: 2700000,
    byProject: {
      giftwallet: 1800000,
      casinohub: 900000,
    },
    byUser: {
      "dev-agent": 2400000,
      "qa-agent": 300000,
    },
    byDay: {
      "2026-01-01": 1800000,
      "2026-01-02": 900000,
    },
  });
});

test("productivity summary aggregator upgrades byUser to human user aggregation when mapping is ready", () => {
  const { productivitySummary } = createProductivitySummaryAggregator({
    timeSaved: {
      entries: [
        {
          projectId: "giftwallet",
          agentId: "dev-agent",
          timeSavedMs: 1500000,
          recordedAt: "2026-01-01T10:00:00.000Z",
        },
        {
          projectId: "giftwallet",
          agentId: "qa-agent",
          timeSavedMs: 300000,
          recordedAt: "2026-01-01T12:00:00.000Z",
        },
      ],
    },
    humanUserProductivity: {
      status: "ready",
      byHumanUser: {
        "user-1": 1800000,
      },
    },
  });

  assert.deepEqual(productivitySummary, {
    totalTimeSavedMs: 1800000,
    byProject: {
      giftwallet: 1800000,
    },
    byUser: {
      "user-1": 1800000,
    },
    byDay: {
      "2026-01-01": 1800000,
    },
  });
});

test("productivity summary aggregator ignores null timeSavedMs and excludes invalid timestamps only from byDay", () => {
  const { productivitySummary } = createProductivitySummaryAggregator({
    timeSaved: {
      entries: [
        {
          projectId: "giftwallet",
          agentId: "dev-agent",
          timeSavedMs: 120000,
          recordedAt: "not-a-date",
        },
        {
          projectId: "giftwallet",
          agentId: "qa-agent",
          timeSavedMs: null,
          recordedAt: "2026-01-01T10:00:00.000Z",
        },
      ],
    },
  });

  assert.deepEqual(productivitySummary, {
    totalTimeSavedMs: 120000,
    byProject: {
      giftwallet: 120000,
    },
    byUser: {
      "dev-agent": 120000,
    },
    byDay: {},
  });
});
