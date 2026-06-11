import test from "node:test";
import assert from "node:assert/strict";

import {
  buildGrowthMeasurementTruth,
  createGrowthMeasurementRecord,
  summarizeGrowthMeasurementTruth,
} from "../src/core/growth-measurement-truth.js";

const project = {
  id: "growth-measurement-project",
  name: "Lead Manager",
};

test("GROW-MEASURE-001 accepts internal and manual records only with clear source truth", () => {
  const truth = buildGrowthMeasurementTruth({
    project,
    records: [
      {
        source: "nexus-internal-event",
        sourceType: "internal-event",
        growthPath: "landing-experiment",
        experimentId: "exp-1",
        metric: "landing.opened",
        value: 1,
        linkedActionId: "landing-open-1",
        hypothesis: "בודק יפתח את הדמו.",
      },
      {
        source: "user-report",
        sourceType: "manual",
        growthPath: "manual-demo-call",
        experimentId: "exp-1",
        metric: "understood-value",
        value: 1,
      },
    ],
  });

  assert.equal(truth.taskId, "GROW-MEASURE-001");
  assert.equal(truth.records.length, 2);
  assert.equal(truth.records[0].status, "accepted");
  assert.equal(truth.records[1].manualLabel, "manual-measurement");
  assert.equal(truth.records[0].timestamp.length > 0, true);
  assert.equal(truth.records[0].growthPath, "landing-experiment");
  assert.equal(truth.records[0].experimentId, "exp-1");
  assert.equal(truth.records[0].metric, "landing.opened");
  assert.deepEqual(truth.sourceSummary.map((entry) => entry.sourceType), ["internal-event", "manual"]);
});

test("GROW-MEASURE-001 rejects source-less and fabricated metrics", () => {
  const missingSource = createGrowthMeasurementRecord({
    sourceType: "internal-event",
    metric: "form.submitted",
    value: 4,
  });
  const fabricated = createGrowthMeasurementRecord({
    source: "fake analytics",
    sourceType: "provider",
    metric: "fabricated conversion",
    value: 100,
    providerConnected: true,
    readScopeGranted: true,
  });

  assert.equal(missingSource.status, "rejected");
  assert.equal(missingSource.rejectedReasons.includes("missing-source"), true);
  assert.equal(fabricated.status, "rejected");
  assert.equal(fabricated.rejectedReasons.includes("fabricated-or-estimated-source"), true);
});

test("GROW-MEASURE-001 requires provider connection and read scope for provider results", () => {
  const notConnected = createGrowthMeasurementRecord({
    source: "google-analytics",
    sourceType: "provider",
    metric: "demo.viewed",
    value: 3,
    providerConnected: false,
    readScopeGranted: true,
  });
  const noScope = createGrowthMeasurementRecord({
    source: "mailchimp",
    sourceType: "provider",
    metric: "test_email.sent",
    value: 1,
    providerConnected: true,
    readScopeGranted: false,
  });
  const connected = createGrowthMeasurementRecord({
    source: "google-analytics",
    sourceType: "provider",
    metric: "share.opened",
    value: 12,
    providerConnected: true,
    readScopeGranted: true,
    dataPointCount: 12,
  });

  assert.equal(notConnected.status, "rejected");
  assert.equal(notConnected.rejectedReasons.includes("provider-not-connected"), true);
  assert.equal(noScope.status, "rejected");
  assert.equal(noScope.rejectedReasons.includes("provider-read-scope-missing"), true);
  assert.equal(connected.status, "accepted");
  assert.equal(connected.confidenceLevel, "medium");
});

test("GROW-MEASURE-001 blocks external actions without a small success metric but allows drafts", () => {
  const external = buildGrowthMeasurementTruth({
    project,
    externalAction: {
      actionType: "publish-campaign",
      draftOnly: false,
    },
  });
  const draft = buildGrowthMeasurementTruth({
    project,
    externalAction: {
      actionType: "draft-campaign",
      draftOnly: true,
    },
  });

  assert.equal(external.externalActionGate.canExecuteExternalAction, false);
  assert.equal(external.externalActionGate.blockedReasons.includes("missing-small-success-metric"), true);
  assert.equal(draft.externalActionGate.canExecuteExternalAction, true);
});

test("GROW-MEASURE-001 keeps hypothesis, result, insight, confidence and no proof language separate", () => {
  const truth = buildGrowthMeasurementTruth({
    project,
    records: [
      {
        source: "nexus-internal-event",
        sourceType: "internal-event",
        metric: "primary_action.clicked",
        value: 1,
        hypothesis: "משתמש ילחץ על הפעולה המרכזית.",
      },
    ],
  });
  const summary = summarizeGrowthMeasurementTruth(truth);

  assert.equal(summary.status, "has-initial-signal");
  assert.equal(summary.conclusionLanguage, "initial-signal");
  assert.equal(summary.confidenceLevel, "low");
  assert.match(summary.hypothesis, /משתמש/);
  assert.match(summary.result, /1 נקודות מדידה/);
  assert.match(summary.insight, /סימן ראשוני/);
  assert.equal(summary.noSuccessInference, false);
  assert.doesNotMatch(JSON.stringify(truth), /it worked|proven success|worked|זה עבד|הוכחנו/i);
});

test("GROW-MEASURE-001 redacts sensitive measurement data and keeps product changes routed to Mutation", () => {
  const truth = buildGrowthMeasurementTruth({
    project,
    records: [
      {
        source: "submitted-form",
        sourceType: "form",
        metric: "form.submitted",
        value: 1,
        sensitiveData: {
          email: "person@example.com",
          safeSegment: "small-business",
        },
      },
    ],
    shareApproved: false,
  });

  assert.equal(truth.records[0].sensitiveData.email, "[redacted]");
  assert.equal(truth.records[0].sensitiveData.safeSegment, "small-business");
  assert.equal(truth.shareDemoVisibility, "internal-only");
  assert.equal(truth.handoffs.nextGrowthActionOwner, "growth-agent");
  assert.equal(truth.handoffs.productChangeOwner, "mutation-change-agent");
  assert.equal(truth.handoffs.productChangeAllowedHere, false);
});
