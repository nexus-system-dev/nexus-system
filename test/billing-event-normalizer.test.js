import test from "node:test";
import assert from "node:assert/strict";

import {
  BILLING_EVENT_CANONICAL_CONTRACT,
  createNormalizedBillingEvent,
} from "../src/core/billing-event-normalizer.js";

function createCanonicalBillingEvent(overrides = {}) {
  return {
    eventType: "checkout",
    workspaceId: "workspace-demo",
    userId: "user-1",
    amount: 49.99,
    currency: "usd",
    sourceProvider: "stripe",
    sourceEventId: "evt_123",
    idempotencyKey: "billing:evt_123",
    occurredAt: "2026-04-06T10:00:00.000Z",
    ...overrides,
  };
}

test("valid canonical billingEvent returns stable normalizedBillingEvent", () => {
  const { normalizedBillingEvent } = createNormalizedBillingEvent({
    billingEvent: createCanonicalBillingEvent({
      reconciliationState: "ignored-extra-field",
    }),
  });

  assert.deepEqual(normalizedBillingEvent, {
    eventType: "checkout",
    workspaceId: "workspace-demo",
    userId: "user-1",
    amount: 49.99,
    currency: "usd",
    sourceProvider: "stripe",
    sourceEventId: "evt_123",
    idempotencyKey: "billing:evt_123",
    occurredAt: "2026-04-06T10:00:00.000Z",
    metadata: {
      unmappedFields: {
        reconciliationState: "ignored-extra-field",
      },
    },
  });
});

test("same canonical billingEvent returns the same normalizedBillingEvent deterministically", () => {
  const billingEvent = createCanonicalBillingEvent({
    extraField: "persist-me",
  });

  const firstResult = createNormalizedBillingEvent({ billingEvent });
  const secondResult = createNormalizedBillingEvent({ billingEvent });

  assert.deepEqual(firstResult, secondResult);
});

test("missing required field returns null", () => {
  const { normalizedBillingEvent } = createNormalizedBillingEvent({
    billingEvent: createCanonicalBillingEvent({
      sourceEventId: "   ",
    }),
  });

  assert.equal(normalizedBillingEvent, null);
});

test("invalid eventType returns null", () => {
  const { normalizedBillingEvent } = createNormalizedBillingEvent({
    billingEvent: createCanonicalBillingEvent({
      eventType: "provider-checkout-created",
    }),
  });

  assert.equal(normalizedBillingEvent, null);
});

test("invalid timestamp returns null", () => {
  const { normalizedBillingEvent } = createNormalizedBillingEvent({
    billingEvent: createCanonicalBillingEvent({
      occurredAt: "not-a-real-date",
    }),
  });

  assert.equal(normalizedBillingEvent, null);
});

test("extra unknown fields move into metadata.unmappedFields", () => {
  const { normalizedBillingEvent } = createNormalizedBillingEvent({
    billingEvent: createCanonicalBillingEvent({
      providerPayload: {
        providerEventId: "evt_123",
      },
      retryCount: 2,
      metadata: {
        original: true,
      },
    }),
  });

  assert.deepEqual(normalizedBillingEvent.metadata, {
    unmappedFields: {
      providerPayload: {
        providerEventId: "evt_123",
      },
      retryCount: 2,
    },
  });
});

test("normalizedBillingEvent does not leak dynamic top-level fields", () => {
  const { normalizedBillingEvent } = createNormalizedBillingEvent({
    billingEvent: createCanonicalBillingEvent({
      providerPayload: {
        raw: true,
      },
      semanticWarning: "nope",
    }),
  });

  assert.deepEqual(
    Object.keys(normalizedBillingEvent),
    BILLING_EVENT_CANONICAL_CONTRACT.orderedTopLevelFields,
  );
  assert.equal("providerPayload" in normalizedBillingEvent, false);
  assert.equal("semanticWarning" in normalizedBillingEvent, false);
});

test("normalizedBillingEvent preserves sourceEventId and sourceProvider", () => {
  const { normalizedBillingEvent } = createNormalizedBillingEvent({
    billingEvent: createCanonicalBillingEvent({
      sourceProvider: "lemonsqueezy",
      sourceEventId: "ls_evt_456",
    }),
  });

  assert.equal(normalizedBillingEvent.sourceProvider, "lemonsqueezy");
  assert.equal(normalizedBillingEvent.sourceEventId, "ls_evt_456");
});

test("normalizedBillingEvent keeps canonical top-level field order stable", () => {
  const { normalizedBillingEvent } = createNormalizedBillingEvent({
    billingEvent: createCanonicalBillingEvent(),
  });

  assert.deepEqual(
    Object.keys(normalizedBillingEvent),
    BILLING_EVENT_CANONICAL_CONTRACT.orderedTopLevelFields,
  );
});

test("retry, failure, cancel, plan change, and subscription state examples normalize deterministically", () => {
  const examples = [
    createCanonicalBillingEvent({
      eventType: "retry",
      amount: 49.99,
      sourceEventId: "retry-1",
      idempotencyKey: "billing:retry-1",
    }),
    createCanonicalBillingEvent({
      eventType: "payment-failure",
      amount: 49.99,
      sourceEventId: "failure-1",
      idempotencyKey: "billing:failure-1",
    }),
    createCanonicalBillingEvent({
      eventType: "cancel",
      amount: 0,
      sourceEventId: "cancel-1",
      idempotencyKey: "billing:cancel-1",
    }),
    createCanonicalBillingEvent({
      eventType: "plan-change",
      amount: 99,
      sourceEventId: "plan-change-1",
      idempotencyKey: "billing:plan-change-1",
    }),
    createCanonicalBillingEvent({
      eventType: "subscription-state",
      amount: 0,
      sourceEventId: "subscription-state-1",
      idempotencyKey: "billing:subscription-state-1",
    }),
  ];

  for (const example of examples) {
    const firstResult = createNormalizedBillingEvent({ billingEvent: example });
    const secondResult = createNormalizedBillingEvent({ billingEvent: example });

    assert.deepEqual(firstResult, secondResult);
    assert.equal(firstResult.normalizedBillingEvent.eventType, example.eventType);
  }
});
