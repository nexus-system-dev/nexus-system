import test from "node:test";
import assert from "node:assert/strict";

import { ingestBillingEvent } from "../src/core/billing-event-ingestion-service.js";

function createBillingEvent(overrides = {}) {
  return {
    eventType: "checkout",
    workspaceId: "workspace-demo-user",
    userId: "customer-1",
    amount: 0,
    currency: "USD",
    sourceProvider: "generic-webhook",
    sourceEventId: "provider-event-1",
    idempotencyKey: "billing:generic-webhook:provider-event-1",
    occurredAt: "2026-01-10T00:00:00.000Z",
    providerPayload: {
      trace: true,
    },
    ...overrides,
  };
}

test("valid canonical billingEvent is normalized and appended", () => {
  const result = ingestBillingEvent({
    billingEvent: createBillingEvent(),
    existingNormalizedBillingEvents: [],
  });

  assert.equal(result.ingestStatus, "accepted");
  assert.equal(result.wasDuplicate, false);
  assert.equal(result.normalizedBillingEvents.length, 1);
  assert.equal(result.normalizedBillingEvents[0].eventType, "checkout");
  assert.deepEqual(result.normalizedBillingEvents[0].metadata.unmappedFields, {
    providerPayload: {
      trace: true,
    },
  });
});

test("invalid canonical billingEvent is rejected without append", () => {
  const existing = [{
    eventType: "checkout",
    workspaceId: "workspace-demo-user",
    userId: "customer-1",
    amount: 0,
    currency: "USD",
    sourceProvider: "generic-webhook",
    sourceEventId: "existing-1",
    idempotencyKey: "existing-idem",
    occurredAt: "2026-01-10T00:00:00.000Z",
    metadata: { unmappedFields: {} },
  }];
  const result = ingestBillingEvent({
    billingEvent: createBillingEvent({
      idempotencyKey: null,
    }),
    existingNormalizedBillingEvents: existing,
  });

  assert.equal(result.ingestStatus, "rejected");
  assert.equal(result.wasDuplicate, false);
  assert.equal(result.normalizedBillingEvent, null);
  assert.equal(result.normalizedBillingEvents, existing);
});

test("duplicate idempotencyKey returns duplicate without append", () => {
  const existing = [{
    eventType: "retry",
    workspaceId: "workspace-demo-user",
    userId: "customer-1",
    amount: 0,
    currency: "USD",
    sourceProvider: "generic-webhook",
    sourceEventId: "existing-2",
    idempotencyKey: "same-idempotency-key",
    occurredAt: "2026-01-10T00:00:00.000Z",
    metadata: { unmappedFields: {} },
  }];
  const result = ingestBillingEvent({
    billingEvent: createBillingEvent({
      eventType: "retry",
      idempotencyKey: "same-idempotency-key",
      sourceEventId: "provider-event-2",
    }),
    existingNormalizedBillingEvents: existing,
  });

  assert.equal(result.ingestStatus, "duplicate");
  assert.equal(result.wasDuplicate, true);
  assert.equal(result.normalizedBillingEvent, existing[0]);
  assert.equal(result.normalizedBillingEvents, existing);
});

test("accepted event appends only once at the end and preserves order", () => {
  const existing = [{
    eventType: "checkout",
    workspaceId: "workspace-demo-user",
    userId: "customer-1",
    amount: 0,
    currency: "USD",
    sourceProvider: "generic-webhook",
    sourceEventId: "existing-1",
    idempotencyKey: "idem-1",
    occurredAt: "2026-01-01T00:00:00.000Z",
    metadata: { unmappedFields: {} },
  }];
  const result = ingestBillingEvent({
    billingEvent: createBillingEvent({
      sourceEventId: "provider-event-9",
      idempotencyKey: "idem-9",
    }),
    existingNormalizedBillingEvents: existing,
  });

  assert.deepEqual(result.normalizedBillingEvents.map((event) => event.idempotencyKey), ["idem-1", "idem-9"]);
});

test("non-array existingNormalizedBillingEvents is treated as empty array", () => {
  const result = ingestBillingEvent({
    billingEvent: createBillingEvent(),
    existingNormalizedBillingEvents: null,
  });

  assert.equal(Array.isArray(result.normalizedBillingEvents), true);
  assert.equal(result.normalizedBillingEvents.length, 1);
});
