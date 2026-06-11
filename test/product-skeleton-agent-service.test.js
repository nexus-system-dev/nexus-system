import test from "node:test";
import assert from "node:assert/strict";

import { OnboardingService } from "../src/core/onboarding-service.js";

function discoveryEnvelope(overrides = {}) {
  return {
    intent: "product-answer",
    replyToUser: "הבנתי. יש מספיק אמת כדי לפתוח שלד ראשון.",
    understandingDelta: {
      added: [
        { slot: "audience", value: "בעל עסק קטן", source: "user-1" },
        { slot: "problem", value: "לידים נופלים בלי אחראי ותזכורת", source: "user-1" },
        { slot: "workflow", value: "רשימת לידים עם סטטוס, אחראי וצעד הבא", source: "user-1" },
      ],
      corrected: [],
      removed: [],
    },
    summarySnapshot: {
      understoodItems: [
        "המשתמש המרכזי הוא בעל עסק קטן.",
        "הבעיה היא נפילת לידים בלי אחראי ותזכורת.",
        "הזרימה הראשונה היא טיפול בליד ראשון.",
      ],
      missingItems: [],
      projectType: "lead-management",
      projectTypeConfidence: 0.9,
      actors: [{ role: "operator", label: "בעל עסק קטן" }],
    },
    nextMove: "advance-to-skeleton",
    nextQuestion: null,
    skeletonReady: { ready: true, reason: "יש משתמש, בעיה וזרימה ראשונה." },
    confidence: 0.9,
    ...overrides,
  };
}

function productSkeletonEnvelope(overrides = {}) {
  return {
    agentId: "product-skeleton-agent",
    responseSource: "provider-composed",
    productType: "כלי פנימי לניהול לידים",
    primaryUser: "בעל עסק קטן",
    primaryProblem: "לידים נופלים כי אין אחראי ותזכורת",
    firstWorkflow: {
      title: "טיפול בליד ראשון",
      whyThisFirst: "זו הזרימה שמוכיחה שהמוצר עוזר לפני דוחות או אוטומציות.",
      steps: ["הוספת ליד", "שיוך אחראי", "קביעת תזכורת", "סימון צעד הבא"],
    },
    initialScreens: [
      { name: "מסך לידים", purpose: "להראות מי דורש טיפול", regions: ["כל הלידים", "לחזור היום"] },
    ],
    initialActions: ["הוסף ליד", "קבע תזכורת", "סמן צעד הבא"],
    dataObjects: [
      { name: "ליד", fields: ["שם", "סטטוס", "אחראי", "תזכורת", "צעד הבא"] },
    ],
    versionOneBoundary: {
      buildNow: ["לידים", "סטטוס", "אחראי", "תזכורת"],
      doNotBuildNow: ["חיבור וואטסאפ", "אוטומציות", "דוחות מכירה"],
    },
    assumptions: ["בשלב הראשון ליד מוזן ידנית."],
    unknowns: [],
    needsQuestion: false,
    questionForDiscoveryAgent: null,
    handoffToVisualSkeleton: { allowed: true, reason: "השלד מספיק ברור לתצוגה ראשונה." },
    ...overrides,
  };
}

function visualProductSkeletonEnvelope(overrides = {}) {
  return {
    agentId: "visual-product-skeleton-agent",
    responseSource: "provider-composed",
    productType: "כלי פנימי לניהול לידים",
    firstScreen: {
      name: "מסך טיפול בלידים",
      purpose: "להראות לידים שדורשים טיפול ולהפעיל את הצעד הבא.",
      primaryUser: "בעל עסק קטן",
      primaryAction: "הוסף ליד",
    },
    regions: [
      {
        id: "today",
        kind: "primary-workspace",
        title: "לחזור היום",
        purpose: "לרכז לידים שחייבים טיפול עכשיו.",
        priority: "primary",
        traceToProductSkeleton: "firstWorkflow.steps",
        content: ["נועה כהן · חדש · אין אחראי", "רמי לוי · לחזור היום · דנה"],
      },
      {
        id: "owner",
        kind: "detail-panel",
        title: "אחראי ותזכורת",
        purpose: "להגדיר מי מטפל ומתי חוזרים.",
        priority: "secondary",
        traceToProductSkeleton: "dataObjects.fields",
        content: ["אחראי", "תזכורת", "צעד הבא"],
      },
    ],
    components: [
      { id: "add-lead", type: "primary-button", label: "הוסף ליד", regionId: "today", intent: "start first workflow" },
    ],
    hierarchy: {
      primary: "לחזור היום",
      secondary: ["אחראי ותזכורת"],
      deferred: ["חיבור וואטסאפ", "אוטומציות"],
      appearsFirst: "לידים שמחכים לטיפול",
    },
    initialCopy: [{ regionId: "today", text: "היום מטפלים קודם בלידים שיכולים ליפול." }],
    designPlugin: {
      pluginId: "israeli-smb",
      pluginName: "Israeli SMB Work Tool",
      reason: "המוצר הוא כלי עבודה פנימי לבעל עסק קטן.",
      matchedBy: "product-class",
    },
    visualTone: "נקי, מקומי, תפעולי ולא דשבורדי.",
    assumptions: ["בשלב הראשון ליד מוזן ידנית."],
    unknowns: [],
    doNotBuildNow: ["חיבור וואטסאפ", "אוטומציות"],
    handoff: { nextAgent: "visual-build-agent", nextMove: "render-first-screen-in-build-canvas" },
    ...overrides,
  };
}

function createService() {
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "test-openai-key";
  return new OnboardingService();
}

test("SKEL-001 — service blocks product skeleton generation before discovery handoff is ready", async () => {
  const service = createService();
  const session = service.createSession({
    userId: "user-skel",
    projectDraftId: "skel-blocked-project",
    initialInput: { projectName: "Lead Tool", visionText: "מערכת לידים" },
  });

  const result = await service.generateProductSkeletonFromDiscovery({ sessionId: session.sessionId });

  assert.equal(result.status, "blocked");
  assert.equal(result.reason, "discovery-agent-handoff-not-ready");
  assert.equal(result.productSkeletonAgent.envelope, undefined);
});

test("SKEL-001 — service routes ready discovery handoff through Product Skeleton Agent and persists doNotBuildNow", async () => {
  const calls = [];
  const skeleton = productSkeletonEnvelope();
  const service = createService();
  service.providerClient.generateAgentTurn = async () => ({
    status: "completed",
    deliveryMode: "live-api",
    envelope: discoveryEnvelope(),
    attempts: [{ durationMs: 10 }],
  });
  service.providerClient.generateProductSkeleton = async (payload) => {
    calls.push(payload);
    return {
      status: "completed",
      providerId: "openai",
      deliveryMode: "live-api",
      model: "gpt-skeleton-test",
      requestId: "resp-skeleton-test",
      envelope: skeleton,
      usage: { inputTokens: 12, outputTokens: 24, totalTokens: 36 },
      attempts: [{ durationMs: 20 }],
    };
  };
  const session = service.createSession({
    userId: "user-skel",
    projectDraftId: "skel-ready-project",
    initialInput: {
      projectName: "Lead Tool",
      visionText: "בעל עסק קטן מקבל לידים מוואטסאפ ושיחות והלידים נופלים בלי אחראי ותזכורת.",
    },
  });

  await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "בעל עסק קטן מקבל לידים מוואטסאפ ושיחות והלידים נופלים בלי אחראי ותזכורת.",
    clientMessageId: "client-ready",
  });
  const result = await service.generateProductSkeletonFromDiscovery({ sessionId: session.sessionId });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].discoveryHandoff.fromAgent, "project-discovery-agent");
  assert.equal(calls[0].discoveryHandoff.toAgent, "product-skeleton-agent");
  assert.equal(result.status, "completed");
  assert.deepEqual(result.productSkeletonAgentOutput, skeleton);
  assert.deepEqual(
    result.productSkeletonAgentOutput.versionOneBoundary.doNotBuildNow,
    ["חיבור וואטסאפ", "אוטומציות", "דוחות מכירה"],
  );
  const stored = service.getSession(session.sessionId);
  assert.equal(stored.productSkeletonAgentOutput.agentId, "product-skeleton-agent");
  assert.equal(stored.conversation.productSkeletonAgent.responseSource, "provider-composed");
});

test("VSKEL-001 — service blocks visual skeleton before Product Skeleton Agent handoff is ready", async () => {
  const service = createService();
  const session = service.createSession({
    userId: "user-vskel",
    projectDraftId: "vskel-blocked-project",
    initialInput: { projectName: "Lead Tool", visionText: "מערכת לידים" },
  });

  const result = await service.generateVisualProductSkeletonFromProductSkeleton({ sessionId: session.sessionId });

  assert.equal(result.status, "blocked");
  assert.equal(result.reason, "product-skeleton-agent-handoff-not-ready");
  assert.equal(result.visualProductSkeletonAgent.envelope, undefined);
});

test("VSKEL-001 — service routes Product Skeleton Agent output through Visual Product Skeleton Agent and persists first screen", async () => {
  const calls = [];
  const skeleton = productSkeletonEnvelope();
  const visualSkeleton = visualProductSkeletonEnvelope();
  const service = createService();
  service.providerClient.generateAgentTurn = async () => ({
    status: "completed",
    deliveryMode: "live-api",
    envelope: discoveryEnvelope(),
    attempts: [{ durationMs: 10 }],
  });
  service.providerClient.generateProductSkeleton = async () => ({
    status: "completed",
    providerId: "openai",
    deliveryMode: "live-api",
    model: "gpt-skeleton-test",
    requestId: "resp-skeleton-test",
    envelope: skeleton,
    usage: { inputTokens: 12, outputTokens: 24, totalTokens: 36 },
    attempts: [{ durationMs: 20 }],
  });
  service.providerClient.generateVisualProductSkeleton = async (payload) => {
    calls.push(payload);
    return {
      status: "completed",
      providerId: "openai",
      deliveryMode: "live-api",
      model: "gpt-visual-skeleton-test",
      requestId: "resp-visual-skeleton-test",
      envelope: visualSkeleton,
      usage: { inputTokens: 20, outputTokens: 40, totalTokens: 60 },
      attempts: [{ durationMs: 30 }],
    };
  };
  const session = service.createSession({
    userId: "user-vskel",
    projectDraftId: "vskel-ready-project",
    initialInput: {
      projectName: "Lead Tool",
      visionText: "בעל עסק קטן מקבל לידים מוואטסאפ ושיחות והלידים נופלים בלי אחראי ותזכורת.",
    },
  });

  await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "בעל עסק קטן מקבל לידים מוואטסאפ ושיחות והלידים נופלים בלי אחראי ותזכורת.",
    clientMessageId: "client-ready-vskel",
  });
  await service.generateProductSkeletonFromDiscovery({ sessionId: session.sessionId });
  const result = await service.generateVisualProductSkeletonFromProductSkeleton({ sessionId: session.sessionId });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].productSkeletonAgentOutput.agentId, "product-skeleton-agent");
  assert.equal(result.status, "completed");
  assert.equal(result.visualProductSkeletonAgentOutput.firstScreen.name, "מסך טיפול בלידים");
  const stored = service.getSession(session.sessionId);
  assert.equal(stored.visualProductSkeletonAgentOutput.agentId, "visual-product-skeleton-agent");
  assert.equal(stored.conversation.visualProductSkeletonAgent.responseSource, "provider-composed");
});
