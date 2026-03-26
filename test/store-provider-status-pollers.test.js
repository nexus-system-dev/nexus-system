import test from "node:test";
import assert from "node:assert/strict";

import {
  createPollingExecutionModule,
  createPollingMetadataBuilder,
  createProviderStatusResolver,
  createStatusNormalizationModule,
  createStoreAndProviderStatusPollers,
  createTerminalStateDetector,
  defineReleasePollingSchema,
} from "../src/core/store-provider-status-pollers.js";

test("release polling schema returns canonical polling request", () => {
  const { pollingRequest } = defineReleasePollingSchema({
    releaseTarget: "app-store",
    providerSession: {
      providerType: "stores",
      operationTypes: ["poll"],
    },
  });

  assert.equal(pollingRequest.releaseTarget, "app-store");
  assert.equal(pollingRequest.providerType, "stores");
  assert.equal(pollingRequest.targetCategory, "store");
});

test("provider status resolver returns canonical poller", () => {
  const { resolvedPoller } = createProviderStatusResolver({
    pollingRequest: {
      providerType: "hosting",
      targetCategory: "deployment",
      pollOperation: "poll",
    },
  });

  assert.equal(resolvedPoller.providerType, "hosting");
  assert.equal(resolvedPoller.targetCategory, "deployment");
});

test("polling execution and normalization return status events", () => {
  const { rawStatusResponse } = createPollingExecutionModule({
    resolvedPoller: {
      providerType: "hosting",
      targetCategory: "deployment",
    },
    pollingRequest: {
      releaseTarget: "web-deployment",
      attempt: 1,
    },
  });
  const { statusEvents } = createStatusNormalizationModule({
    rawStatusResponse,
  });

  assert.equal(rawStatusResponse.providerStatus, "deployed");
  assert.equal(statusEvents[0].status, "published");
});

test("terminal state detector and metadata builder return canonical polling state", () => {
  const { pollingDecision } = createTerminalStateDetector({
    statusEvents: [{ status: "published" }],
  });
  const { pollingMetadata } = createPollingMetadataBuilder({
    pollingRequest: { attempt: 2, cursor: "cursor_1" },
    statusEvents: [{ status: "published" }],
    pollingDecision,
  });

  assert.equal(pollingDecision.isTerminal, true);
  assert.equal(pollingMetadata.attempt, 2);
  assert.equal(pollingMetadata.lastStatus, "published");
});

test("store and provider status pollers return canonical status events", () => {
  const result = createStoreAndProviderStatusPollers({
    releaseTarget: "web-deployment",
    providerSession: {
      providerType: "hosting",
      operationTypes: ["poll"],
    },
  });

  assert.equal(typeof result.pollingRequest.releaseTarget, "string");
  assert.equal(typeof result.resolvedPoller.pollerId, "string");
  assert.equal(Array.isArray(result.statusEvents), true);
  assert.equal(typeof result.pollingDecision.isTerminal, "boolean");
  assert.equal(typeof result.pollingMetadata.attempt, "number");
});
