import test from "node:test";
import assert from "node:assert/strict";

import { createNormalizedBillingEvent } from "../src/core/billing-event-normalizer.js";
import { createPayingUserTracker } from "../src/core/paying-user-tracker.js";

function buildNormalizedBillingEvent(overrides = {}) {
  const { normalizedBillingEvent } = createNormalizedBillingEvent({
    billingEvent: {
      eventType: "checkout",
      workspaceId: "workspace-1",
      userId: "user-1",
      amount: 49,
      currency: "usd",
      sourceProvider: "stripe",
      sourceEventId: "evt-1",
      idempotencyKey: "billing:evt-1",
      occurredAt: "2026-04-09T10:00:00.000Z",
      ...overrides,
    },
  });

  return normalizedBillingEvent;
}

test("empty input returns zeroed canonical metrics object", () => {
  const { payingUserMetrics } = createPayingUserTracker();

  assert.deepEqual(payingUserMetrics, {
    payingUserMetricsId: "paying-user-metrics:missing-inputs:0:0:0:0:0",
    payingUsers: 0,
    convertedUsers: 0,
    activeSubscriptions: 0,
    summary: {
      summaryStatus: "missing-inputs",
      countedEvents: 0,
      ignoredEvents: 0,
    },
  });
});

test("duplicate events with the same idempotencyKey do not inflate counts", () => {
  const duplicate = buildNormalizedBillingEvent();
  const { payingUserMetrics } = createPayingUserTracker({
    normalizedBillingEvents: [duplicate, duplicate],
  });

  assert.equal(payingUserMetrics.payingUsers, 1);
  assert.equal(payingUserMetrics.convertedUsers, 1);
  assert.equal(payingUserMetrics.activeSubscriptions, 1);
  assert.equal(payingUserMetrics.summary.countedEvents, 1);
  assert.equal(payingUserMetrics.summary.ignoredEvents, 1);
});

test("payingUsers counts unique non-null userIds from checkout and renewal events with amount greater than zero", () => {
  const { payingUserMetrics } = createPayingUserTracker({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent(),
      buildNormalizedBillingEvent({
        eventType: "renewal",
        sourceEventId: "evt-2",
        idempotencyKey: "billing:evt-2",
        occurredAt: "2026-04-09T11:00:00.000Z",
      }),
      buildNormalizedBillingEvent({
        userId: "user-2",
        workspaceId: "workspace-2",
        sourceEventId: "evt-3",
        idempotencyKey: "billing:evt-3",
        occurredAt: "2026-04-09T12:00:00.000Z",
      }),
      buildNormalizedBillingEvent({
        eventType: "plan-change",
        userId: "user-3",
        workspaceId: "workspace-3",
        sourceEventId: "evt-4",
        idempotencyKey: "billing:evt-4",
        occurredAt: "2026-04-09T13:00:00.000Z",
      }),
    ],
  });

  assert.equal(payingUserMetrics.payingUsers, 2);
});

test("convertedUsers counts unique users whose first qualifying paid event is checkout", () => {
  const { payingUserMetrics } = createPayingUserTracker({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent({
        userId: "user-1",
        workspaceId: "workspace-1",
        occurredAt: "2026-04-09T10:00:00.000Z",
      }),
      buildNormalizedBillingEvent({
        eventType: "renewal",
        userId: "user-1",
        workspaceId: "workspace-1",
        sourceEventId: "evt-2",
        idempotencyKey: "billing:evt-2",
        occurredAt: "2026-04-09T11:00:00.000Z",
      }),
      buildNormalizedBillingEvent({
        eventType: "renewal",
        userId: "user-2",
        workspaceId: "workspace-2",
        sourceEventId: "evt-3",
        idempotencyKey: "billing:evt-3",
        occurredAt: "2026-04-09T09:00:00.000Z",
      }),
      buildNormalizedBillingEvent({
        eventType: "checkout",
        userId: "user-2",
        workspaceId: "workspace-2",
        sourceEventId: "evt-4",
        idempotencyKey: "billing:evt-4",
        occurredAt: "2026-04-09T12:00:00.000Z",
      }),
    ],
  });

  assert.equal(payingUserMetrics.convertedUsers, 1);
});

test("convertedUsers is always a subset of payingUsers", () => {
  const { payingUserMetrics } = createPayingUserTracker({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent(),
      buildNormalizedBillingEvent({
        eventType: "renewal",
        userId: "user-2",
        workspaceId: "workspace-2",
        sourceEventId: "evt-2",
        idempotencyKey: "billing:evt-2",
      }),
    ],
  });

  assert.equal(payingUserMetrics.convertedUsers <= payingUserMetrics.payingUsers, true);
});

test("renewal-first user is paying but not converted", () => {
  const { payingUserMetrics } = createPayingUserTracker({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent({
        eventType: "renewal",
        sourceEventId: "evt-2",
        idempotencyKey: "billing:evt-2",
      }),
    ],
  });

  assert.equal(payingUserMetrics.payingUsers, 1);
  assert.equal(payingUserMetrics.convertedUsers, 0);
});

test("activeSubscriptions counts unique workspaceIds whose latest relevant event is checkout or renewal", () => {
  const { payingUserMetrics } = createPayingUserTracker({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent({
        workspaceId: "workspace-1",
        userId: "user-1",
      }),
      buildNormalizedBillingEvent({
        eventType: "renewal",
        workspaceId: "workspace-2",
        userId: "user-2",
        sourceEventId: "evt-2",
        idempotencyKey: "billing:evt-2",
        occurredAt: "2026-04-09T11:00:00.000Z",
      }),
    ],
  });

  assert.equal(payingUserMetrics.activeSubscriptions, 2);
});

test("later cancel removes active subscription status", () => {
  const { payingUserMetrics } = createPayingUserTracker({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent({
        workspaceId: "workspace-1",
        userId: "user-1",
      }),
      buildNormalizedBillingEvent({
        eventType: "cancel",
        workspaceId: "workspace-1",
        userId: "user-1",
        amount: 0,
        sourceEventId: "evt-2",
        idempotencyKey: "billing:evt-2",
        occurredAt: "2026-04-09T11:00:00.000Z",
      }),
    ],
  });

  assert.equal(payingUserMetrics.activeSubscriptions, 0);
});

test("irrelevant event types do not affect activeSubscriptions", () => {
  const { payingUserMetrics } = createPayingUserTracker({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent({
        workspaceId: "workspace-1",
        userId: "user-1",
      }),
      buildNormalizedBillingEvent({
        eventType: "payment-failure",
        workspaceId: "workspace-1",
        userId: "user-1",
        sourceEventId: "evt-2",
        idempotencyKey: "billing:evt-2",
        occurredAt: "2026-04-09T12:00:00.000Z",
      }),
    ],
  });

  assert.equal(payingUserMetrics.activeSubscriptions, 1);
});

test("same occurredAt tie for active resolution uses later input index", () => {
  const { payingUserMetrics } = createPayingUserTracker({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent({
        workspaceId: "workspace-1",
        userId: "user-1",
        occurredAt: "2026-04-09T10:00:00.000Z",
      }),
      buildNormalizedBillingEvent({
        eventType: "cancel",
        workspaceId: "workspace-1",
        userId: "user-1",
        amount: 0,
        sourceEventId: "evt-2",
        idempotencyKey: "billing:evt-2",
        occurredAt: "2026-04-09T10:00:00.000Z",
      }),
    ],
  });

  assert.equal(payingUserMetrics.activeSubscriptions, 0);
});

test("null userId qualifying events do not count toward paying or converted and increase ignoredEvents", () => {
  const { payingUserMetrics } = createPayingUserTracker({
    normalizedBillingEvents: [
      {
        ...buildNormalizedBillingEvent(),
        userId: null,
      },
    ],
  });

  assert.equal(payingUserMetrics.payingUsers, 0);
  assert.equal(payingUserMetrics.convertedUsers, 0);
  assert.equal(payingUserMetrics.summary.ignoredEvents, 1);
});

test("null workspaceId relevant events do not count toward active subscriptions and increase ignoredEvents", () => {
  const { payingUserMetrics } = createPayingUserTracker({
    normalizedBillingEvents: [
      {
        ...buildNormalizedBillingEvent(),
        workspaceId: null,
      },
    ],
  });

  assert.equal(payingUserMetrics.activeSubscriptions, 0);
  assert.equal(payingUserMetrics.summary.ignoredEvents, 1);
});

test("invalid and null event entries are ignored and not fatal", () => {
  const { payingUserMetrics } = createPayingUserTracker({
    normalizedBillingEvents: [
      null,
      undefined,
      "not-an-event",
      {
        eventType: "checkout",
        idempotencyKey: "billing:broken",
      },
      buildNormalizedBillingEvent(),
    ],
  });

  assert.equal(payingUserMetrics.payingUsers, 1);
  assert.equal(payingUserMetrics.summary.countedEvents, 1);
  assert.equal(payingUserMetrics.summary.ignoredEvents, 4);
});

test("repeated runs on the same input are deterministic", () => {
  const input = [
    buildNormalizedBillingEvent(),
    buildNormalizedBillingEvent({
      eventType: "renewal",
      sourceEventId: "evt-2",
      idempotencyKey: "billing:evt-2",
    }),
  ];

  const firstResult = createPayingUserTracker({ normalizedBillingEvents: input });
  const secondResult = createPayingUserTracker({ normalizedBillingEvents: input });

  assert.deepEqual(firstResult, secondResult);
});

test("summary countedEvents and ignoredEvents are correct", () => {
  const { payingUserMetrics } = createPayingUserTracker({
    normalizedBillingEvents: [
      buildNormalizedBillingEvent(),
      buildNormalizedBillingEvent(),
      {
        ...buildNormalizedBillingEvent({
          sourceEventId: "evt-2",
          idempotencyKey: "billing:evt-2",
        }),
        userId: null,
      },
      null,
    ],
  });

  assert.equal(payingUserMetrics.summary.countedEvents, 2);
  assert.equal(payingUserMetrics.summary.ignoredEvents, 3);
});
