// AGT-001D — Step 3 / Phase 3.1 contract tests
// Pins the new turn pipeline: every user message is routed through
// providerClient.generateAgentTurn, and Nexus stores only what the agent returned.
// Per docs/operating-system/discovery-agent-role.md.

import test from "node:test";
import assert from "node:assert/strict";

import { OnboardingService } from "../src/core/onboarding-service.js";

function validEnvelope(overrides = {}) {
  return {
    intent: "needs-clarification",
    replyToUser: "ספר לי במשפט קצר מה אתה רוצה לבנות.",
    understandingDelta: { added: [], corrected: [], removed: [] },
    summarySnapshot: {
      understoodItems: [],
      missingItems: ["מה אתה רוצה לבנות"],
      projectType: "unknown",
      projectTypeConfidence: 0,
      actors: [],
    },
    nextMove: "ask",
    nextQuestion: "ספר לי במשפט קצר מה אתה רוצה לבנות.",
    skeletonReady: { ready: false, reason: "no audience/problem/solution yet" },
    confidence: 0.6,
    ...overrides,
  };
}

function createServiceWithAgentTurnFactory(factory) {
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "test-openai-key";
  const service = new OnboardingService();
  service.providerClient.generateAgentTurn = async (payload) => factory(payload);
  return service;
}

function createSession(service) {
  return service.createSession({
    userId: "user-test",
    projectDraftId: "agent-test-project",
    initialInput: { projectName: "Agent Test", visionText: "" },
  });
}

test("AGT-001D §1 — submitConversationTurn routes the first user message through generateAgentTurn", async () => {
  const calls = [];
  const envelope = validEnvelope({
    intent: "product-answer",
    replyToUser: "הבנתי שאתה רוצה לבנות אפליקציה. למי היא מיועדת?",
    understandingDelta: {
      added: [{ slot: "class", value: "mobile-app", source: "user-1" }],
      corrected: [],
      removed: [],
    },
    summarySnapshot: {
      understoodItems: ["סוג הפרויקט: אפליקציה"],
      missingItems: ["מי המשתמש המרכזי"],
      projectType: "mobile-app",
      projectTypeConfidence: 0.8,
      actors: [],
    },
    nextMove: "ask",
    nextQuestion: "למי האפליקציה הזו מיועדת?",
  });
  const service = createServiceWithAgentTurnFactory(async (payload) => {
    calls.push(payload);
    return { status: "completed", envelope, deliveryMode: "live-api", attempts: [{ durationMs: 42 }] };
  });
  const session = createSession(service);

  const result = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "תבנה לי אפליקציה",
    clientMessageId: "client-1",
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].userMessage, "תבנה לי אפליקציה");
  assert.equal(result.onboardingConversation.summarySnapshot.projectType, "mobile-app");
  // The agent's reply must be the only AI bubble.
  const aiBubbles = result.onboardingConversation.transcript.filter((entry) => entry.speaker === "ai");
  assert.equal(aiBubbles.length, 1);
  assert.equal(aiBubbles[0].text, envelope.replyToUser);
  assert.equal(aiBubbles[0].responseSource, "agent-envelope");
});

test("AGT-001D §1 — primeDiscoveryAgentResponse is only an agent turn, never the old discovery-response route", async () => {
  const calls = [];
  const envelope = validEnvelope({
    replyToUser: "הבנתי את הכיוון הראשוני. למי האפליקציה מיועדת?",
    understandingDelta: {
      added: [{ slot: "project-intent", value: "build an app", source: "user-1" }],
      corrected: [],
      removed: [],
    },
  });
  const service = createServiceWithAgentTurnFactory(async (payload) => {
    calls.push(payload);
    return { status: "completed", envelope, deliveryMode: "live-api", attempts: [{ durationMs: 11 }] };
  });
  let legacyDiscoveryCalls = 0;
  service.providerClient.generateDiscoveryResponse = async () => {
    legacyDiscoveryCalls += 1;
    return { status: "completed", agentResponse: "אסור להגיע לכאן" };
  };
  const session = service.createSession({
    userId: "user-test",
    projectDraftId: "agent-prime-project",
    initialInput: { projectName: "Agent Prime", visionText: "תבנה לי אפליקציה" },
  });

  const result = await service.primeDiscoveryAgentResponse({ sessionId: session.sessionId });

  assert.equal(legacyDiscoveryCalls, 0);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].userMessage, "תבנה לי אפליקציה");
  assert.equal(calls[0].userMessageId, "user-1");
  assert.equal(result.onboardingConversation.transcript.at(-1).text, envelope.replyToUser);
  assert.equal(result.onboardingConversation.transcript.at(-1).responseSource, "agent-envelope");
});

test("AGT-001D §9 — when agent returns status!=completed, nothing is saved and no reply is fabricated", async () => {
  const service = createServiceWithAgentTurnFactory(async () => ({
    status: "unavailable",
    error: { code: "OPENAI_API_KEY", status: null },
    attempts: [{ durationMs: 5 }],
  }));
  const session = createSession(service);

  const result = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "תבנה לי אפליקציה",
    clientMessageId: "client-1",
  });

  // No save → transcript empty, no agent decision, summarySnapshot still empty.
  assert.deepEqual(result.onboardingConversation.transcript, []);
  assert.equal(result.onboardingConversation.lastAgentDecision, null);
  assert.deepEqual(result.onboardingConversation.summarySnapshot.understoodItems, []);
  assert.deepEqual(result.onboardingConversation.summarySnapshot.missingItems, []);
  // Failure metadata surfaces explicitly for the client to render "agent not available".
  assert.equal(result.lastAgentTurn.status, "unavailable");
  assert.equal(result.lastAgentTurn.pendingUserMessage, "תבנה לי אפליקציה");
  assert.equal(result.lastAgentTurn.pendingClientMessageId, "client-1");
  assert.deepEqual(service.getSession(session.sessionId).conversation.transcript, []);
  assert.equal(service.getConversationState(session.sessionId).onboardingConversation.lastAgentTurn.status, "unavailable");
});

test("AGT-001D §6 — non-product agent replies do not contaminate the legacy answers read model", async () => {
  const envelope = validEnvelope({
    intent: "meta-question",
    replyToUser: "כן, אני יכול לעזור לחדד מוצר. מה אתה רוצה לבנות?",
    understandingDelta: { added: [], corrected: [], removed: [] },
    summarySnapshot: {
      understoodItems: [],
      missingItems: ["רעיון מוצר"],
      projectType: "unknown",
      projectTypeConfidence: 0,
      actors: [],
    },
    nextMove: "ask",
    nextQuestion: "מה אתה רוצה לבנות?",
  });
  const service = createServiceWithAgentTurnFactory(async () => ({
    status: "completed", envelope, deliveryMode: "live-api", attempts: [],
  }));
  const session = createSession(service);

  const result = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "אתה סוכן אמיתי?",
    clientMessageId: "meta-1",
  });

  assert.equal(result.onboardingConversation.answers["core-idea"], "");
  assert.deepEqual(result.onboardingConversation.summarySnapshot.understoodItems, []);
  assert.equal(result.onboardingConversation.transcript.at(-1).responseSource, "agent-envelope");
});

test("AGT-001D §C — idempotency: same clientMessageId twice does not call the agent twice", async () => {
  let calls = 0;
  const envelope = validEnvelope();
  const service = createServiceWithAgentTurnFactory(async () => {
    calls += 1;
    return { status: "completed", envelope, deliveryMode: "live-api", attempts: [] };
  });
  const session = createSession(service);

  await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "תבנה לי אפליקציה",
    clientMessageId: "client-1",
  });
  await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "תבנה לי אפליקציה",
    clientMessageId: "client-1",
  });

  assert.equal(calls, 1, "agent must be called only once for the same clientMessageId");
});

test("AGT-001D §A — applyUnderstandingDelta accumulates across turns (added → corrected → removed)", async () => {
  const service = createServiceWithAgentTurnFactory(async (payload) => {
    // First turn: add audience
    if (payload.userMessageId === "user-1") {
      return {
        status: "completed",
        deliveryMode: "live-api",
        attempts: [],
        envelope: validEnvelope({
          intent: "product-answer",
          replyToUser: "מצוין, הבנתי את הקהל.",
          understandingDelta: {
            added: [{ slot: "audience", value: "פיזיותרפיסטים עצמאיים", source: "user-1" }],
            corrected: [],
            removed: [],
          },
          summarySnapshot: {
            understoodItems: ["קהל: פיזיותרפיסטים עצמאיים"],
            missingItems: ["מה הכאב המרכזי"],
            projectType: "saas",
            projectTypeConfidence: 0.7,
            actors: [{ role: "operator", label: "פיזיותרפיסט" }],
          },
        }),
      };
    }
    // Second turn: correct the audience
    return {
      status: "completed",
      deliveryMode: "live-api",
      attempts: [],
      envelope: validEnvelope({
        intent: "correction",
        replyToUser: "תיקנתי — הקהל הוא קליניקות, לא בודדים.",
        understandingDelta: {
          added: [],
          corrected: [{
            slot: "audience",
            from: "פיזיותרפיסטים עצמאיים",
            to: "קליניקות פיזיותרפיה קטנות",
            source: "user-2",
          }],
          removed: [],
        },
        summarySnapshot: {
          understoodItems: ["קהל: קליניקות פיזיותרפיה קטנות"],
          missingItems: ["מה הכאב המרכזי"],
          projectType: "saas",
          projectTypeConfidence: 0.75,
          actors: [{ role: "customer", label: "קליניקה" }],
        },
      }),
    };
  });
  const session = createSession(service);

  await service.submitConversationTurn({
    sessionId: session.sessionId, answer: "פיזיותרפיסטים", clientMessageId: "c-1",
  });
  const after = await service.submitConversationTurn({
    sessionId: session.sessionId, answer: "לא, קליניקות", clientMessageId: "c-2",
  });

  const understanding = after.onboardingConversation.understanding;
  assert.equal(understanding.audience.length, 1, "correction must replace, not append");
  assert.equal(understanding.audience[0].value, "קליניקות פיזיותרפיה קטנות");
  assert.equal(after.onboardingConversation.lastAgentDecision.intent, "correction");
});

test("AGT-001D §6 — answers shape is a derived read model, not a source of truth", async () => {
  const envelope = validEnvelope({
    intent: "product-answer",
    replyToUser: "ok",
    understandingDelta: {
      added: [
        { slot: "audience", value: "Owners of small medical clinics", source: "user-1" },
        { slot: "problem", value: "Patients do not log exercises at home", source: "user-1" },
      ],
      corrected: [],
      removed: [],
    },
    summarySnapshot: {
      understoodItems: ["Audience captured", "Problem captured"],
      missingItems: ["Solution direction"],
      projectType: "saas",
      projectTypeConfidence: 0.8,
      actors: [],
    },
  });
  const service = createServiceWithAgentTurnFactory(async () => ({
    status: "completed", envelope, deliveryMode: "live-api", attempts: [],
  }));
  const session = createSession(service);

  const result = await service.submitConversationTurn({
    sessionId: session.sessionId, answer: "Owners of small medical clinics; patients don't log",
  });

  assert.equal(result.onboardingConversation.answers["target-audience"], "Owners of small medical clinics");
  assert.equal(result.onboardingConversation.answers["core-problem"], "Patients do not log exercises at home");
});

test("AGT-001D §B — transcript hygiene: legacy ai bubbles (not agent-envelope) are not sent back to the agent", async () => {
  let receivedTranscript = null;
  const service = createServiceWithAgentTurnFactory(async (payload) => {
    receivedTranscript = payload.transcript;
    return { status: "completed", envelope: validEnvelope(), deliveryMode: "live-api", attempts: [] };
  });
  const session = createSession(service);
  // Inject a legacy ai bubble directly (simulating a session that was in flight before AGT-001D).
  const stored = service.getSession(session.sessionId);
  stored.conversation = {
    transcript: [
      { id: "user-1", speaker: "user", text: "תבנה לי אפליקציה", time: "00:00" },
      { id: "ai-legacy", speaker: "ai", text: "פברוק ישן מהמסלול הישן", time: "00:01", responseSource: "policy-draft" },
      { id: "agent-2", speaker: "ai", text: "תשובה חיה מקודמת", time: "00:02", responseSource: "agent-envelope" },
    ],
    understanding: undefined,
    summarySnapshot: undefined,
    answers: {},
  };

  await service.submitConversationTurn({
    sessionId: session.sessionId, answer: "המשך", clientMessageId: "c-1",
  });

  const aiTexts = receivedTranscript.filter((e) => e.speaker === "ai").map((e) => e.text);
  assert.ok(!aiTexts.includes("פברוק ישן מהמסלול הישן"), "legacy policy-draft ai bubble must be filtered out");
  assert.ok(aiTexts.includes("תשובה חיה מקודמת"), "agent-envelope ai bubble must survive");
});

test("AGT-001D §D — advance-to-skeleton decision flows through to lastAgentDecision", async () => {
  const envelope = validEnvelope({
    intent: "product-answer",
    replyToUser: "יש לי מספיק להתחיל בשלד.",
    nextMove: "advance-to-skeleton",
    nextQuestion: null,
    skeletonReady: { ready: true, reason: "audience+problem+solution+class" },
    summarySnapshot: {
      understoodItems: ["complete enough"],
      missingItems: [],
      projectType: "saas",
      projectTypeConfidence: 0.9,
      actors: [],
    },
  });
  const service = createServiceWithAgentTurnFactory(async () => ({
    status: "completed", envelope, deliveryMode: "live-api", attempts: [],
  }));
  const session = createSession(service);

  const result = await service.submitConversationTurn({
    sessionId: session.sessionId, answer: "everything",
  });

  assert.equal(result.onboardingConversation.lastAgentDecision.nextMove, "advance-to-skeleton");
  assert.equal(result.onboardingConversation.lastAgentDecision.skeletonReady.ready, true);
});

test("AGT-001D §1 — front-door first turn does NOT pre-seed core-idea from initialInput before the agent runs", async () => {
  let receivedPayload = null;
  const envelope = validEnvelope();
  const service = createServiceWithAgentTurnFactory(async (payload) => {
    receivedPayload = payload;
    return { status: "completed", envelope, deliveryMode: "live-api", attempts: [] };
  });
  // Session is created with visionText already populated (simulates front-door submit).
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "test-openai-key";
  const session = service.createSession({
    userId: "u",
    projectDraftId: "agent-test",
    initialInput: { projectName: "P", visionText: "תבנה לי אפליקציה" },
  });

  await service.submitConversationTurn({
    sessionId: session.sessionId, answer: "תבנה לי אפליקציה",
  });

  // The agent must see the user's message; no pre-fabricated AI turn ahead of it.
  const aiBefore = (receivedPayload.transcript ?? []).filter((entry) => entry.speaker === "ai");
  assert.equal(aiBefore.length, 0, "no AI bubble should exist before the first agent turn");
});

test("AGT-001D §2 — streamConversationTurn uses generateAgentTurn and emits only agent envelope events", async () => {
  const events = [];
  let calls = 0;
  const envelope = validEnvelope({
    replyToUser: "מי המשתמש המרכזי של האפליקציה?",
    nextQuestion: "מי המשתמש המרכזי של האפליקציה?",
  });
  const service = createServiceWithAgentTurnFactory(async () => {
    calls += 1;
    return { status: "completed", envelope, deliveryMode: "live-api", attempts: [{ durationMs: 9 }] };
  });
  service.providerClient.streamNextQuestion = async () => {
    throw new Error("legacy streamNextQuestion must not be called");
  };
  const session = createSession(service);

  const result = await service.streamConversationTurn({
    sessionId: session.sessionId,
    answer: "תבנה לי אפליקציה",
    onEvent: async (event) => events.push(event),
  });

  assert.equal(calls, 1);
  assert.equal(events[0].event, "agent-turn-start");
  assert.equal(events.some((event) => event.event === "agent-turn-completed"), true);
  assert.equal(events.some((event) => event.event === "assistant-token"), false);
  assert.equal(events.some((event) => event.event === "assistant-message"), false);
  assert.equal(result.onboardingConversation.transcript.at(-1).text, envelope.replyToUser);
  assert.equal(result.onboardingConversation.transcript.at(-1).responseSource, "agent-envelope");
});

test("AGT-001D §2/§9 — streamConversationTurn unavailable result does not mutate session", async () => {
  const events = [];
  const service = createServiceWithAgentTurnFactory(async () => ({
    status: "agent-malformed",
    error: { code: "agent_envelope_empty_reply" },
    attempts: [{ durationMs: 4 }],
  }));
  const session = createSession(service);

  const result = await service.streamConversationTurn({
    sessionId: session.sessionId,
    answer: "תבנה לי אפליקציה",
    onEvent: async (event) => events.push(event),
  });

  assert.equal(events.some((event) => event.event === "agent-turn-unavailable"), true);
  assert.deepEqual(result.onboardingConversation.transcript, []);
  assert.equal(result.lastAgentTurn.status, "agent-malformed");
  assert.equal(service.getSession(session.sessionId).conversation.transcript.length, 0);
});

test("AGT-001D §3 — summary is the latest agent summarySnapshot, not rule inference", async () => {
  const envelope = validEnvelope({
    replyToUser: "הבנתי.",
    understandingDelta: {
      added: [{ slot: "audience", value: "צוותי מכירות", source: "user-1" }],
      corrected: [],
      removed: [],
    },
    summarySnapshot: {
      understoodItems: ["הסוכן אמר: צוותי מכירות מאבדים לידים אחרי שיחה"],
      missingItems: ["האם התזכורת ידנית או אוטומטית"],
      projectType: "saas",
      projectTypeConfidence: 0.91,
      actors: [{ role: "user", label: "איש מכירות" }],
    },
  });
  const service = createServiceWithAgentTurnFactory(async () => ({
    status: "completed", envelope, deliveryMode: "live-api", attempts: [],
  }));
  const session = createSession(service);

  const result = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "מערכת לצוותי מכירות שלא יאבדו לידים",
  });

  assert.deepEqual(result.onboardingConversation.summary.understoodItems, envelope.summarySnapshot.understoodItems);
  assert.deepEqual(result.onboardingConversation.summary.missingItems, envelope.summarySnapshot.missingItems);
  assert.equal(result.onboardingConversation.summary.projectType, "saas");
});

test("AGT-001D §4 — post-onboarding correction uses generateAgentTurn and applies corrected delta", async () => {
  let receivedPayload = null;
  const service = createServiceWithAgentTurnFactory(async (payload) => {
    receivedPayload = payload;
    return {
      status: "completed",
      deliveryMode: "live-api",
      attempts: [],
      envelope: validEnvelope({
        intent: "correction",
        replyToUser: "תיקנתי: זו מערכת נאמנות, לא חנות.",
        understandingDelta: {
          added: [],
          corrected: [{ slot: "class", from: "commerce-storefront", to: "loyalty-system", source: "user-2" }],
          removed: [],
        },
        summarySnapshot: {
          understoodItems: ["סוג המוצר: מערכת נאמנות"],
          missingItems: ["מה הפעולה הראשונה במוצר"],
          projectType: "saas",
          projectTypeConfidence: 0.86,
          actors: [],
        },
      }),
    };
  });
  const session = createSession(service);
  session.conversation = {
    transcript: [{ id: "user-1", speaker: "user", text: "זו חנות" }],
    understanding: {
      audience: [],
      problem: [],
      solution: [],
      class: [{ value: "commerce-storefront", source: "user-1" }],
      actor: [],
      workflow: [],
      risk: [],
    },
    summarySnapshot: {
      understoodItems: ["סוג המוצר: חנות"],
      missingItems: [],
      projectType: "commerce-storefront",
      projectTypeConfidence: 0.8,
      actors: [],
    },
    answers: {},
  };

  const result = await service.applyPostOnboardingCorrection({
    sessionId: session.sessionId,
    message: "לא, זו לא חנות, זו מערכת נאמנות",
  });

  assert.equal(receivedPayload.userMessage, "לא, זו לא חנות, זו מערכת נאמנות");
  assert.equal(result.correction.replyText, "תיקנתי: זו מערכת נאמנות, לא חנות.");
  assert.equal(result.conversationState.onboardingConversation.understanding.class[0].value, "loyalty-system");
  assert.equal(result.conversationState.onboardingConversation.transcript.at(-1).responseSource, "agent-envelope");
});

test("AGT-001D active path does not call legacy repair helpers", async () => {
  const service = createServiceWithAgentTurnFactory(async () => ({
    status: "completed", envelope: validEnvelope(), deliveryMode: "live-api", attempts: [],
  }));
  service.providerClient.generateNextQuestion = async () => {
    throw new Error("legacy generateNextQuestion must not be called");
  };
  service.providerClient.streamNextQuestion = async () => {
    throw new Error("legacy streamNextQuestion must not be called");
  };
  const session = createSession(service);

  await service.submitConversationTurn({ sessionId: session.sessionId, answer: "תבנה לי אפליקציה" });
  await service.streamConversationTurn({ sessionId: session.sessionId, answer: "לבעלי עסקים" });

  assert.equal(service.getSession(session.sessionId).conversation.transcript.filter((entry) => entry.speaker === "ai").length, 2);
});
