import test from "node:test";
import assert from "node:assert/strict";

import { createRevenueSummaryAggregator } from "../src/core/revenue-summary-aggregator.js";

function buildPayingUserMetrics(overrides = {}) {
  return {
    payingUsers: 4,
    convertedUsers: 2,
    activeSubscriptions: 4,
    summary: {
      summaryStatus: "complete",
      countedEvents: 8,
      ignoredEvents: 0,
    },
    ...overrides,
  };
}

test("missing input returns exact missing default output", () => {
  const { revenueSummary } = createRevenueSummaryAggregator();

  assert.deepEqual(revenueSummary, {
    revenueSummaryId: "revenue-summary:missing:missing-inputs:0:0:0:0:0",
    paymentPosture: "missing",
    summary: {
      summaryStatus: "missing-inputs",
      payingUsers: 0,
      convertedUsers: 0,
      activeSubscriptions: 0,
      countedEvents: 0,
      ignoredEvents: 0,
    },
  });
});

test("unusable payingUserMetrics returns exact missing default output", () => {
  const { revenueSummary } = createRevenueSummaryAggregator({
    payingUserMetrics: {
      payingUsers: 3,
      summary: null,
    },
  });

  assert.deepEqual(revenueSummary, {
    revenueSummaryId: "revenue-summary:missing:missing-inputs:0:0:0:0:0",
    paymentPosture: "missing",
    summary: {
      summaryStatus: "missing-inputs",
      payingUsers: 0,
      convertedUsers: 0,
      activeSubscriptions: 0,
      countedEvents: 0,
      ignoredEvents: 0,
    },
  });
});

test("summaryStatus not complete forces missing posture with passthrough summaryStatus", () => {
  const { revenueSummary } = createRevenueSummaryAggregator({
    payingUserMetrics: buildPayingUserMetrics({
      summary: {
        summaryStatus: "partial",
        countedEvents: 8,
        ignoredEvents: 0,
      },
    }),
  });

  assert.equal(revenueSummary.paymentPosture, "missing");
  assert.equal(revenueSummary.summary.summaryStatus, "partial");
});

test("ignoredEvents greater than zero produces at-risk posture", () => {
  const { revenueSummary } = createRevenueSummaryAggregator({
    payingUserMetrics: buildPayingUserMetrics({
      summary: {
        summaryStatus: "complete",
        countedEvents: 8,
        ignoredEvents: 2,
      },
    }),
  });

  assert.equal(revenueSummary.paymentPosture, "at-risk");
});

test("activeSubscriptions lower than payingUsers produces at-risk posture", () => {
  const { revenueSummary } = createRevenueSummaryAggregator({
    payingUserMetrics: buildPayingUserMetrics({
      activeSubscriptions: 2,
    }),
  });

  assert.equal(revenueSummary.paymentPosture, "at-risk");
});

test("stable case produces stable posture", () => {
  const { revenueSummary } = createRevenueSummaryAggregator({
    payingUserMetrics: buildPayingUserMetrics(),
  });

  assert.equal(revenueSummary.paymentPosture, "stable");
});

test("same input produces deterministic output", () => {
  const payingUserMetrics = buildPayingUserMetrics({
    payingUsers: 6,
    convertedUsers: 3,
    activeSubscriptions: 6,
  });

  const firstResult = createRevenueSummaryAggregator({ payingUserMetrics });
  const secondResult = createRevenueSummaryAggregator({ payingUserMetrics });

  assert.deepEqual(firstResult, secondResult);
});

test("metric normalization coerces unusable numeric fields to zero", () => {
  const { revenueSummary } = createRevenueSummaryAggregator({
    payingUserMetrics: {
      payingUsers: -1,
      convertedUsers: 2.4,
      activeSubscriptions: null,
      summary: {
        summaryStatus: "complete",
        countedEvents: "bad",
        ignoredEvents: -5,
      },
    },
  });

  assert.deepEqual(revenueSummary.summary, {
    summaryStatus: "complete",
    payingUsers: 0,
    convertedUsers: 0,
    activeSubscriptions: 0,
    countedEvents: 0,
    ignoredEvents: 0,
  });
});

test("output shape does not leak extra fields", () => {
  const { revenueSummary } = createRevenueSummaryAggregator({
    payingUserMetrics: buildPayingUserMetrics({
      someExtraField: "ignored",
      summary: {
        summaryStatus: "complete",
        countedEvents: 8,
        ignoredEvents: 0,
        extraSummaryField: "ignored",
      },
    }),
  });

  assert.deepEqual(Object.keys(revenueSummary), [
    "revenueSummaryId",
    "paymentPosture",
    "summary",
  ]);
  assert.deepEqual(Object.keys(revenueSummary.summary), [
    "summaryStatus",
    "payingUsers",
    "convertedUsers",
    "activeSubscriptions",
    "countedEvents",
    "ignoredEvents",
  ]);
});

test("summary fields copy correctly from payingUserMetrics input", () => {
  const { revenueSummary } = createRevenueSummaryAggregator({
    payingUserMetrics: buildPayingUserMetrics({
      payingUsers: 10,
      convertedUsers: 4,
      activeSubscriptions: 7,
      summary: {
        summaryStatus: "complete",
        countedEvents: 22,
        ignoredEvents: 1,
      },
    }),
  });

  assert.deepEqual(revenueSummary.summary, {
    summaryStatus: "complete",
    payingUsers: 10,
    convertedUsers: 4,
    activeSubscriptions: 7,
    countedEvents: 22,
    ignoredEvents: 1,
  });
});

test("id format is exact", () => {
  const { revenueSummary } = createRevenueSummaryAggregator({
    payingUserMetrics: buildPayingUserMetrics({
      payingUsers: 3,
      convertedUsers: 1,
      activeSubscriptions: 2,
      summary: {
        summaryStatus: "complete",
        countedEvents: 9,
        ignoredEvents: 1,
      },
    }),
  });

  assert.equal(
    revenueSummary.revenueSummaryId,
    "revenue-summary:at-risk:complete:3:1:2:9:1",
  );
});

test("metrics are mapped exactly from payingUserMetrics without recomputation", () => {
  const input = {
    payingUsers: 7,
    convertedUsers: 3,
    activeSubscriptions: 4,
    summary: {
      summaryStatus: "complete",
      countedEvents: 12,
      ignoredEvents: 2,
    },
  };
  const { revenueSummary } = createRevenueSummaryAggregator({
    payingUserMetrics: input,
  });

  assert.equal(revenueSummary.summary.payingUsers, 7);
  assert.equal(revenueSummary.summary.convertedUsers, 3);
  assert.equal(revenueSummary.summary.activeSubscriptions, 4);
  assert.equal(revenueSummary.summary.countedEvents, 12);
  assert.equal(revenueSummary.summary.ignoredEvents, 2);
});

test("all zeros with complete summaryStatus still resolves to stable", () => {
  const { revenueSummary } = createRevenueSummaryAggregator({
    payingUserMetrics: {
      payingUsers: 0,
      convertedUsers: 0,
      activeSubscriptions: 0,
      summary: {
        summaryStatus: "complete",
        countedEvents: 0,
        ignoredEvents: 0,
      },
    },
  });

  assert.equal(revenueSummary.paymentPosture, "stable");
});
