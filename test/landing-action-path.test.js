import test from "node:test";
import assert from "node:assert/strict";

import { buildLandingActionPathEnvelope, summarizeLandingActionPath } from "../src/core/landing-action-path.js";
import { buildGrowthPluginLayer } from "../src/core/growth-plugin-layer.js";

const projectWithLandingInputs = {
  id: "land-leads",
  name: "ניהול לידים",
  goal: "כלי פנימי לניהול לידים מוואטסאפ ושיחות עם אחראי, תזכורת וצעד הבא.",
  targetAudience: "בעלי עסקים שמאבדים לידים בגלל חוסר מעקב",
  problem: "אין בעלות ברורה על ליד ואין תזכורת לצעד הבא.",
  coreValue: "לראות מי אחראי, מתי חוזרים ומה הצעד הבא.",
  productDirection: "internal-tool",
  runtimeSkeletonTruth: {
    runtimeSkeletonId: "runtime-land-leads",
    title: "ניהול לידים",
    productClass: "internal-tool",
  },
  productDomainSkeleton: {
    productDomainSkeletonId: "domain-land-leads",
  },
  productOwnedBackendSkeleton: {
    productOwnedBackendSkeletonId: "backend-land-leads",
    productionBackend: false,
  },
};

const measurementTruth = {
  taskId: "GROW-MEASURE-001",
  status: "has-initial-signal",
  records: [{ sourceType: "manual", accepted: true }],
  measurementAvailability: "available",
};

test("GROW-LAND-001 routes landing requests through the landing plugin and blocks unclear products", () => {
  const pluginLayer = buildGrowthPluginLayer({
    project: projectWithLandingInputs,
    userInput: "תכין דף נחיתה לבדיקה",
  });
  assert.equal(pluginLayer.primaryPlugin.pluginId, "landing-experiment-draft");
  assert.equal(pluginLayer.primaryPlugin.registryTaskId, "GROW-PLUG-002");

  const unclear = buildLandingActionPathEnvelope({
    project: { id: "idea-only", name: "Idea only" },
    userInput: "תכין דף נחיתה",
    measurementTruth,
  });
  assert.equal(unclear.status, "needs-product-readiness");
  assert.equal(unclear.readiness.missing.includes("product-truth"), true);
  assert.equal(unclear.visibility.publicVisible, false);
  assert.equal(unclear.externalPublicationPerformed, false);
});

test("GROW-LAND-001 creates an internal RTL draft with two-version limit and consent storage", () => {
  const envelope = buildLandingActionPathEnvelope({
    project: projectWithLandingInputs,
    userInput: "תכין דף נחיתה לבדיקה",
    measurementTruth,
    leadCapture: {
      enabled: true,
      storage: "nexus-experiment-leads",
      consentText: "אני מאשר/ת שיחזרו אליי לצורך בדיקת התאמה.",
      fields: ["name", "email", "need"],
    },
  });

  assert.equal(envelope.status, "draft-ready");
  assert.equal(envelope.draft.direction, "rtl");
  assert.equal(envelope.draft.language, "he");
  assert.equal(envelope.draft.maxVersions, 2);
  assert.equal(envelope.visibility.draftInternal, true);
  assert.equal(envelope.visibility.publicVisible, false);
  assert.equal(envelope.leadCapture.consentConfigured, true);
  assert.equal(envelope.leadCapture.storage, "nexus-experiment-leads");
  assert.equal(envelope.productTruthOwner, "source-product-not-landing");
});

test("GROW-LAND-001 blocks external visibility without Share Demo or Release gate and approval", () => {
  const blocked = buildLandingActionPathEnvelope({
    project: projectWithLandingInputs,
    userInput: "פרסם את דף הנחיתה",
    measurementTruth,
  });
  assert.equal(blocked.status, "needs-share-or-release-gate");
  assert.equal(blocked.visibility.publicVisible, false);
  assert.equal(blocked.externalPublicationPerformed, false);

  const shared = buildLandingActionPathEnvelope({
    project: projectWithLandingInputs,
    userInput: "שתף דמו של דף הנחיתה",
    measurementTruth,
    shareDemoAgent: { status: "ready", shareId: "share-1" },
    approvalDecisions: {
      approvals: [
        { action: "share-demo", approved: true },
      ],
    },
  });
  assert.equal(shared.status, "shared-demo-ready");
  assert.equal(shared.visibility.publicVisible, true);
  assert.equal(shared.externalPublicationPerformed, false);

  const release = buildLandingActionPathEnvelope({
    project: projectWithLandingInputs,
    userInput: "פרסם את דף הנחיתה",
    measurementTruth,
    releaseGate: { status: "ready", releaseGateId: "release-1" },
    approvalDecisions: {
      approvals: [
        { action: "release", approved: true },
        { action: "external-visibility", approved: true },
      ],
    },
  });
  assert.equal(release.status, "release-handoff-ready");
  assert.equal(release.visibility.publicVisible, true);
  assert.equal(release.externalPublicationPerformed, false);
  assert.equal(release.visibility.releaseImpersonationBlocked, false);
});

test("GROW-LAND-001 routes product-truth and visual landing changes to the right owners", () => {
  const mutation = buildLandingActionPathEnvelope({
    project: projectWithLandingInputs,
    userInput: "שנה את ההבטחה והמחיר בדף הנחיתה",
    measurementTruth,
  });
  assert.equal(mutation.status, "handoff-to-mutation");
  assert.equal(mutation.handoffs.mutationRequiredForProductTruthChanges, true);

  const visual = buildLandingActionPathEnvelope({
    project: projectWithLandingInputs,
    userInput: "שנה צבעים והירו בדף הנחיתה",
    measurementTruth,
  });
  assert.equal(visual.status, "handoff-to-visual-build");
  assert.equal(visual.handoffs.visualBuildRequiredForVisibleChanges, true);
});

test("GROW-LAND-001 never fabricates conversion data and feeds measurement truth", () => {
  const missing = buildLandingActionPathEnvelope({
    project: projectWithLandingInputs,
    userInput: "מה תוצאות דף הנחיתה",
    measurementTruth,
  });
  assert.equal(missing.status, "draft-mode-results-missing");
  assert.equal(missing.measurement.fabricatedConversionDataBlocked, true);
  assert.equal(missing.measurement.successClaimAllowed, false);

  const withResults = buildLandingActionPathEnvelope({
    project: projectWithLandingInputs,
    userInput: "מה תוצאות דף הנחיתה",
    measurementTruth,
    providerResults: { views: 10, clicks: 3, ctaClicks: 2, formSubmissions: 1, manualFeedbackCount: 1 },
  });
  assert.equal(withResults.status, "results-received");
  assert.equal(withResults.measurement.resultTruthAvailable, true);
  assert.equal(withResults.measurement.metrics.formSubmissions, 1);
  assert.equal(withResults.successClaimBlockedWithoutMeasurement, false);

  const summary = summarizeLandingActionPath(withResults);
  assert.equal(summary.taskId, "GROW-LAND-001");
  assert.equal(summary.resultTruthAvailable, true);
  assert.equal(summary.fabricatedConversionDataBlocked, true);
});
