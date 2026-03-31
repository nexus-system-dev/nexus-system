import test from "node:test";
import assert from "node:assert/strict";

import { createAiUsageMeter } from "../src/core/ai-usage-meter.js";

test("ai usage meter normalizes model invocation into canonical metric", () => {
  const { aiUsageMetric } = createAiUsageMeter({
    modelInvocation: {
      modelName: "gpt-5",
      tokenUsage: 420,
      projectId: "giftwallet",
      userId: "user-1",
      workflowId: "wf-1",
      recordedAt: "2025-01-01T00:00:00.000Z",
      source: "manual",
    },
  });

  assert.equal(aiUsageMetric.usageType, "model");
  assert.equal(aiUsageMetric.quantity, 420);
  assert.equal(aiUsageMetric.unit, "token");
  assert.equal(aiUsageMetric.modelUsage.modelName, "gpt-5");
  assert.equal(aiUsageMetric.modelUsage.invocationCount, 1);
  assert.equal(aiUsageMetric.tokenUsage.tokenUsage, 420);
  assert.equal(aiUsageMetric.tokenUsage.tokenUsageSource, "provided");
  assert.equal(aiUsageMetric.projectScope.projectId, "giftwallet");
  assert.equal(aiUsageMetric.userScope.userId, "user-1");
  assert.equal(aiUsageMetric.workflowScope.workflowId, "wf-1");
});

test("ai usage meter normalizes tool invocation into provider operation metric", () => {
  const { aiUsageMetric } = createAiUsageMeter({
    toolInvocation: {
      toolName: "deploy-tool",
      providerOperation: "deploy",
      projectId: "giftwallet",
      userId: "user-1",
      workflowId: "wf-1",
      recordedAt: "2025-01-01T00:00:00.000Z",
      source: "provider-operation-contract",
    },
  });

  assert.equal(aiUsageMetric.usageType, "provider-operation");
  assert.equal(aiUsageMetric.quantity, 1);
  assert.equal(aiUsageMetric.unit, "operation");
  assert.equal(aiUsageMetric.toolUsage.providerOperation, "deploy");
  assert.equal(aiUsageMetric.toolUsage.runCount, 1);
});

test("ai usage meter falls back to unknown usage type when no canonical source exists", () => {
  const { aiUsageMetric } = createAiUsageMeter();

  assert.equal(aiUsageMetric.usageType, "unknown-usage-type");
  assert.equal(aiUsageMetric.unit, "unknown-cost-unit");
  assert.equal(aiUsageMetric.quantity, null);
});

test("ai usage meter supports derived token usage without inventing token counts", () => {
  const { aiUsageMetric } = createAiUsageMeter({
    modelInvocation: {
      modelName: "gpt-5",
      tokenUsage: null,
      estimatedTokenUsage: 180,
      projectId: "giftwallet",
      source: "derived",
    },
  });

  assert.equal(aiUsageMetric.usageType, "model");
  assert.equal(aiUsageMetric.quantity, null);
  assert.equal(aiUsageMetric.tokenUsage.tokenUsage, null);
  assert.equal(aiUsageMetric.tokenUsage.estimatedTokenUsage, 180);
  assert.equal(aiUsageMetric.tokenUsage.tokenUsageSource, "derived");
});

test("ai usage meter keeps token fallback unavailable when no source exists", () => {
  const { aiUsageMetric } = createAiUsageMeter({
    modelInvocation: {
      modelName: "gpt-5",
      tokenUsage: null,
      projectId: "giftwallet",
    },
  });

  assert.equal(aiUsageMetric.tokenUsage.tokenUsage, null);
  assert.equal(aiUsageMetric.tokenUsage.estimatedTokenUsage, null);
  assert.equal(aiUsageMetric.tokenUsage.tokenUsageSource, "unavailable");
});

test("ai usage meter remains directly consumable by platform cost schema", () => {
  const { aiUsageMetric } = createAiUsageMeter({
    toolInvocation: {
      providerOperation: "deploy",
      projectId: "giftwallet",
      userId: "user-1",
      workflowId: "wf-1",
    },
  });

  assert.equal(typeof aiUsageMetric.usageType, "string");
  assert.equal("quantity" in aiUsageMetric, true);
  assert.equal(typeof aiUsageMetric.unit, "string");
  assert.equal(typeof aiUsageMetric.scopeType, "string");
  assert.equal("scopeId" in aiUsageMetric, true);
  assert.equal(typeof aiUsageMetric.source, "string");
  assert.equal(typeof aiUsageMetric.recordedAt, "string");
});
