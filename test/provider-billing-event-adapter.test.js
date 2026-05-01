import test from "node:test";
import assert from "node:assert/strict";

import { createProviderBillingEventAdapter } from "../src/core/provider-billing-event-adapter.js";

function createProviderPayload(overrides = {}) {
  return {
    providerEventType: "checkout",
    workspaceRef: "workspace-demo-user",
    customerRef: "customer-1",
    amountValue: 12.5,
    currencyCode: "USD",
    providerEventId: "provider-event-1",
    occurredAt: "2026-01-10T00:00:00.000Z",
    idempotencyKey: "provider-idem-1",
    payload: {
      nested: true,
    },
    ...overrides,
  };
}

test("valid generic-webhook payload maps to exact canonical billingEvent", () => {
  const result = createProviderBillingEventAdapter({
    providerType: "generic-webhook",
    providerPayload: createProviderPayload(),
    workspaceModel: {
      workspaceId: "workspace-demo-user",
    },
  });

  assert.deepEqual(result, {
    billingEvent: {
      eventType: "checkout",
      workspaceId: "workspace-demo-user",
      userId: "customer-1",
      amount: 12.5,
      currency: "USD",
      sourceProvider: "generic-webhook",
      sourceEventId: "provider-event-1",
      idempotencyKey: "provider-idem-1",
      occurredAt: "2026-01-10T00:00:00.000Z",
      providerPayload: {
        nested: true,
      },
    },
  });
});

test("mismatched workspaceModel rejects the event", () => {
  const result = createProviderBillingEventAdapter({
    providerType: "generic-webhook",
    providerPayload: createProviderPayload({
      workspaceRef: "workspace-a",
    }),
    workspaceModel: {
      workspaceId: "workspace-b",
    },
  });

  assert.deepEqual(result, {
    billingEvent: null,
  });
});

test("fallback idempotencyKey format is exact", () => {
  const result = createProviderBillingEventAdapter({
    providerType: "generic-webhook",
    providerPayload: createProviderPayload({
      idempotencyKey: null,
      providerEventId: "provider-77",
    }),
    workspaceModel: {
      workspaceId: "workspace-demo-user",
    },
  });

  assert.equal(result.billingEvent.idempotencyKey, "billing:generic-webhook:provider-77");
});

test("provider payload is preserved under pre-normalized providerPayload", () => {
  const result = createProviderBillingEventAdapter({
    providerType: "generic-webhook",
    providerPayload: createProviderPayload({
      payload: {
        extra: "trace",
      },
    }),
    workspaceModel: {
      workspaceId: "workspace-demo-user",
    },
  });

  assert.deepEqual(result.billingEvent.providerPayload, {
    extra: "trace",
  });
});

test("no extra top-level canonical fields are invented", () => {
  const result = createProviderBillingEventAdapter({
    providerType: "generic-webhook",
    providerPayload: createProviderPayload(),
    workspaceModel: {
      workspaceId: "workspace-demo-user",
    },
  });

  assert.deepEqual(Object.keys(result.billingEvent), [
    "eventType",
    "workspaceId",
    "userId",
    "amount",
    "currency",
    "sourceProvider",
    "sourceEventId",
    "idempotencyKey",
    "occurredAt",
    "providerPayload",
  ]);
});

test("unsupported providerType returns null billingEvent", () => {
  const result = createProviderBillingEventAdapter({
    providerType: "stripe",
    providerPayload: createProviderPayload(),
    workspaceModel: {
      workspaceId: "workspace-demo-user",
    },
  });

  assert.deepEqual(result, {
    billingEvent: null,
  });
});
