import test from "node:test";
import assert from "node:assert/strict";

import { OnboardingProviderClient } from "../src/core/onboarding-provider-client.js";

function createSseResponse(events = []) {
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }
      controller.close();
    },
  });

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}

function createJsonResponse(payload = {}) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function createProductSkeletonOpenAiResponse(envelope) {
  return createJsonResponse({
    id: "resp_product_skeleton",
    model: "gpt-skeleton-test",
    output: [{ content: [{ text: JSON.stringify(envelope) }] }],
    usage: { input_tokens: 50, output_tokens: 120, total_tokens: 170 },
  });
}

function createVisualProductSkeletonOpenAiResponse(envelope) {
  return createJsonResponse({
    id: "resp_visual_product_skeleton",
    model: "gpt-visual-skeleton-test",
    output: [{ content: [{ text: JSON.stringify(envelope) }] }],
    usage: { input_tokens: 60, output_tokens: 150, total_tokens: 210 },
  });
}

function validProductSkeletonEnvelope(overrides = {}) {
  return {
    agentId: "product-skeleton-agent",
    responseSource: "provider-composed",
    productType: "internal lead-management tool",
    primaryUser: "בעל עסק קטן שמטפל בלידים ידנית",
    primaryProblem: "לידים נופלים כי אין אחראי, תזכורת וצעד הבא",
    firstWorkflow: {
      title: "טיפול בליד ראשון",
      whyThisFirst: "זו הפעולה הראשונה שמוכיחה שהמוצר מונע נפילת לידים.",
      steps: ["להוסיף ליד", "לשייך אחראי", "לקבוע תזכורת", "לסמן צעד הבא"],
    },
    initialScreens: [
      { name: "רשימת לידים", purpose: "לראות מי צריך טיפול עכשיו", regions: ["לידים פתוחים", "חזרה היום"] },
    ],
    initialActions: ["הוסף ליד", "קבע תזכורת", "סמן צעד הבא"],
    dataObjects: [
      { name: "ליד", fields: ["שם", "סטטוס", "אחראי", "תזכורת", "צעד הבא"] },
    ],
    versionOneBoundary: {
      buildNow: ["רשימת לידים", "אחראי", "סטטוס", "תזכורת"],
      doNotBuildNow: ["אוטומציות", "חיבור וואטסאפ", "דוחות מתקדמים"],
    },
    assumptions: ["הזנת ליד ידנית בגרסה הראשונה"],
    unknowns: ["מקור הלידים המדויק"],
    needsQuestion: false,
    questionForDiscoveryAgent: null,
    handoffToVisualSkeleton: { allowed: true, reason: "יש מספיק מבנה לשלד חזותי ראשון." },
    ...overrides,
  };
}

function validVisualProductSkeletonEnvelope(overrides = {}) {
  return {
    agentId: "visual-product-skeleton-agent",
    responseSource: "provider-composed",
    productType: "internal lead-management tool",
    firstScreen: {
      name: "מסך טיפול בלידים",
      purpose: "להראות לידים שדורשים טיפול ולתת פעולה אחת ברורה.",
      primaryUser: "בעל עסק קטן שמטפל בלידים ידנית",
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
      deferred: ["אוטומציות", "דוחות"],
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
    assumptions: ["הליד מוזן ידנית בגרסה הראשונה."],
    unknowns: ["שמות אנשי הצוות עדיין לא ידועים."],
    doNotBuildNow: ["חיבור וואטסאפ", "אוטומציות"],
    handoff: { nextAgent: "visual-build-agent", nextMove: "render-first-screen-in-build-canvas" },
    ...overrides,
  };
}

test("provider client retries the same provider before succeeding", async () => {
  const fetchCalls = [];
  const statusEvents = [];
  const deltas = [];
  const client = new OnboardingProviderClient({
    openAiApiKey: "test-openai-key",
    anthropicApiKey: "test-anthropic-key",
    maxRetries: 2,
    retryDelayMs: 0,
    fetchImpl: async (url) => {
      fetchCalls.push(url);
      return createSseResponse([
        { type: "response.output_text.delta", delta: "מה הבעיה " },
        { type: "response.output_text.delta", delta: "המרכזית?" },
        {
          type: "response.completed",
          response: {
            id: "resp_openai_retry",
            model: "gpt-test-retry",
            usage: {
              input_tokens: 8,
              output_tokens: 4,
              total_tokens: 12,
            },
          },
        },
      ]);
    },
  });

  const result = await client.streamNextQuestion({
    providerId: "openai",
    question: {
      id: "core-problem",
      title: "מה הבעיה המרכזית?",
    },
    qaFaultMode: "retry-once",
    onStatus: async (event) => {
      statusEvents.push(event);
    },
    onDelta: async (delta) => {
      deltas.push(delta);
    },
  });

  assert.equal(fetchCalls.length, 1);
  assert.equal(result.status, "completed");
  assert.equal(result.initialProviderId, "openai");
  assert.equal(result.finalProviderId, "openai");
  assert.equal(result.recoveredByRetry, true);
  assert.equal(result.failedOver, false);
  assert.equal(deltas.join(""), "מה הבעיה המרכזית?");
  assert.equal(statusEvents.some((event) => event.type === "provider-retry"), true);
  assert.equal(statusEvents.some((event) => event.type === "provider-failover"), false);
});

test("provider client fails over to the alternate provider after a primary outage", async () => {
  const fetchCalls = [];
  const statusEvents = [];
  const streamed = [];
  const client = new OnboardingProviderClient({
    openAiApiKey: "test-openai-key",
    anthropicApiKey: "test-anthropic-key",
    maxRetries: 2,
    retryDelayMs: 0,
    fetchImpl: async (url) => {
      fetchCalls.push(url);
      if (url.includes("anthropic.com")) {
        return createSseResponse([
          {
            type: "message_start",
            message: {
              id: "msg_anthropic_1",
              model: "claude-test-failover",
              usage: {
                input_tokens: 10,
                output_tokens: 0,
              },
            },
          },
          {
            type: "content_block_delta",
            delta: {
              text: "איזה סוג עסק ",
            },
          },
          {
            type: "content_block_delta",
            delta: {
              text: "בדיוק צריך את הדף?",
            },
          },
          {
            type: "message_delta",
            usage: {
              input_tokens: 10,
              output_tokens: 6,
            },
          },
        ]);
      }
      throw new Error("unexpected_openai_fetch");
    },
  });

  const result = await client.streamNextQuestion({
    providerId: "openai",
    question: {
      id: "audience-clarification",
      title: "איזה סוג עסק בדיוק צריך את הדף?",
    },
    qaFaultMode: "primary-outage",
    onStatus: async (event) => {
      statusEvents.push(event);
    },
    onDelta: async (delta) => {
      streamed.push(delta);
    },
  });

  assert.equal(fetchCalls.length, 1);
  assert.equal(fetchCalls[0].includes("anthropic.com"), true);
  assert.equal(result.status, "completed");
  assert.equal(result.initialProviderId, "openai");
  assert.equal(result.finalProviderId, "anthropic");
  assert.equal(result.failedOver, true);
  assert.equal(result.recoveredByRetry, true);
  assert.equal(streamed.join(""), "איזה סוג עסק בדיוק צריך את הדף?");
  assert.equal(statusEvents.filter((event) => event.type === "provider-retry").length, 2);
  assert.equal(statusEvents.some((event) => event.type === "provider-failover" && event.toProviderId === "anthropic"), true);
});

test("provider client classifies all-provider rate limiting into a bounded failed runtime result", async () => {
  const statusEvents = [];
  const client = new OnboardingProviderClient({
    openAiApiKey: "test-openai-key",
    anthropicApiKey: "test-anthropic-key",
    maxRetries: 1,
    retryDelayMs: 0,
    fetchImpl: async () => {
      throw new Error("fetch should not run when qa rate limit is injected before the request");
    },
  });

  const result = await client.streamNextQuestion({
    providerId: "openai",
    question: {
      id: "core-problem",
      title: "מה הבעיה המרכזית?",
    },
    qaFaultMode: "rate-limit-all",
    onStatus: async (event) => {
      statusEvents.push(event);
    },
    onDelta: async () => {},
  });

  assert.equal(result.status, "failed");
  assert.equal(result.initialProviderId, "openai");
  assert.equal(result.finalProviderId, "anthropic");
  assert.equal(result.failedOver, true);
  assert.equal(result.error.errorClass, "rate-limited");
  assert.equal(result.error.retryAfterSeconds, 30);
  assert.equal(statusEvents.filter((event) => event.type === "provider-retry").length, 2);
  assert.equal(statusEvents.some((event) => event.type === "provider-failover" && event.toProviderId === "anthropic"), true);
});

test("provider client retries provider timeouts instead of failing over immediately", async () => {
  let callCount = 0;
  const statusEvents = [];
  const client = new OnboardingProviderClient({
    openAiApiKey: "test-openai-key",
    anthropicApiKey: "test-anthropic-key",
    maxRetries: 1,
    retryDelayMs: 0,
    fetchImpl: async () => {
      callCount += 1;
      if (callCount === 1) {
        throw new Error("onboarding_provider_timeout");
      }
      return createSseResponse([
        { type: "response.output_text.delta", delta: "מה " },
        { type: "response.output_text.delta", delta: "הבעיה?" },
        {
          type: "response.completed",
          response: {
            id: "resp_openai_timeout_recovery",
            model: "gpt-test-timeout-retry",
            usage: {
              input_tokens: 5,
              output_tokens: 3,
              total_tokens: 8,
            },
          },
        },
      ]);
    },
  });

  const result = await client.streamNextQuestion({
    providerId: "openai",
    question: {
      id: "core-problem",
      title: "מה הבעיה?",
    },
    onStatus: async (event) => {
      statusEvents.push(event);
    },
    onDelta: async () => {},
  });

  assert.equal(callCount, 2);
  assert.equal(result.status, "completed");
  assert.equal(result.finalProviderId, "openai");
  assert.equal(result.recoveredByRetry, true);
  assert.equal(statusEvents.filter((event) => event.type === "provider-retry").length, 1);
  assert.equal(statusEvents.some((event) => event.type === "provider-failover"), false);
});

test("provider client sends the selected model family and intelligence profile to OpenAI", async () => {
  const requestBodies = [];
  const client = new OnboardingProviderClient({
    openAiApiKey: "test-openai-key",
    anthropicApiKey: "test-anthropic-key",
    maxRetries: 0,
    retryDelayMs: 0,
    fetchImpl: async (_url, options = {}) => {
      requestBodies.push(JSON.parse(options.body));
      return createSseResponse([
        { type: "response.output_text.delta", delta: "מה " },
        { type: "response.output_text.delta", delta: "כואב?" },
        {
          type: "response.completed",
          response: {
            id: "resp_openai_model_family",
            model: "gpt-5.5",
            usage: {
              input_tokens: 5,
              output_tokens: 3,
              total_tokens: 8,
            },
          },
        },
      ]);
    },
  });

  const result = await client.streamNextQuestion({
    providerId: "openai",
    modelFamilyId: "deep",
    intelligenceLevel: "high",
    question: {
      id: "core-problem",
      title: "מה כואב?",
    },
    onDelta: async () => {},
  });

  assert.equal(result.status, "completed");
  assert.equal(requestBodies.length, 1);
  assert.equal(requestBodies[0].model, "gpt-5.5");
  assert.equal(requestBodies[0].max_output_tokens, 320);
  assert.match(JSON.stringify(requestBodies[0]), /Reason more deeply before phrasing the question/);
});

test("provider client includes product-family branching and closure guards in the system prompt", async () => {
  const requestBodies = [];
  const client = new OnboardingProviderClient({
    openAiApiKey: "test-openai-key",
    anthropicApiKey: "test-anthropic-key",
    maxRetries: 0,
    retryDelayMs: 0,
    fetchImpl: async (_url, options = {}) => {
      requestBodies.push(JSON.parse(options.body));
      return createSseResponse([
        { type: "response.output_text.delta", delta: "מי " },
        { type: "response.output_text.delta", delta: "המשתמש?" },
        {
          type: "response.completed",
          response: {
            id: "resp_openai_prompt_contract",
            model: "gpt-5",
            usage: {
              input_tokens: 5,
              output_tokens: 3,
              total_tokens: 8,
            },
          },
        },
      ]);
    },
  });

  const result = await client.streamNextQuestion({
    providerId: "openai",
    question: {
      id: "target-audience",
      title: "מי המשתמש?",
    },
    onDelta: async () => {},
  });

  assert.equal(result.status, "completed");
  assert.equal(requestBodies.length, 1);
  const systemPrompt = requestBodies[0]?.input?.[0]?.content ?? "";
  assert.match(systemPrompt, /Commerce storefront/i);
  assert.match(systemPrompt, /Marketplace/i);
  assert.match(systemPrompt, /Booking \/ scheduling/i);
  assert.match(systemPrompt, /CRM \/ follow-up \/ pipeline SaaS/i);
  assert.match(systemPrompt, /Internal tool/i);
  assert.match(systemPrompt, /Admin dashboard/i);
  assert.match(systemPrompt, /לקוח שלי/u);
  assert.match(systemPrompt, /Do not close if the product family is still unclear/i);
  assert.match(systemPrompt, /Weak answers belong in still-missing truth/i);
  assert.match(systemPrompt, /One good question beats three shallow ones/i);
  assert.match(systemPrompt, /Base question areas for every product/i);
  assert.match(systemPrompt, /Understood vs missing rules/i);
  assert.match(systemPrompt, /Premature-close blockers/i);
  assert.match(systemPrompt, /Only close when the product family is clear/i);
});

test("provider client sends bounded comparable-product intelligence in the companion payload", async () => {
  const requestBodies = [];
  const client = new OnboardingProviderClient({
    openAiApiKey: "test-openai-key",
    anthropicApiKey: "test-anthropic-key",
    maxRetries: 0,
    retryDelayMs: 0,
    fetchImpl: async (_url, options = {}) => {
      requestBodies.push(JSON.parse(options.body));
      return createJsonResponse({
        id: "resp_openai_companion_patterns",
        model: "gpt-5",
        output_text: "במוצרים דומים בדרך כלל מכריעים קודם בין קנייה כאורח לבין התחברות.",
        usage: {
          input_tokens: 7,
          output_tokens: 5,
          total_tokens: 12,
        },
      });
    },
  });

  const result = await client.generateCompanionReply({
    providerId: "openai",
    projectName: "Click Mobile",
    projectGoal: "אתר שמוכר סלולר ואביזרים משלימים",
    projectType: "commerce-ops",
    understoodItems: ["רעיון מרכזי: אתר שמוכר סלולר ואביזרים משלימים"],
    missingItems: ["האם הלקוח אמור לקנות כאורח או רק אחרי התחברות"],
    userMessage: "במוצרים דומים למה עוד כדאי לשים לב?",
  });

  assert.equal(result.status, "completed");
  assert.equal(requestBodies.length, 1);
  const systemPrompt = requestBodies[0]?.input?.[0]?.content ?? "";
  const userPayload = JSON.stringify(requestBodies[0]?.input?.[1]?.content ?? "");
  assert.match(systemPrompt, /comparable-product intelligence/i);
  assert.match(systemPrompt, /Do not dump competitor research/i);
  assert.match(userPayload, /comparableProductIntelligence/);
  assert.match(userPayload, /guest-checkout|כאורח/i);
  assert.match(userPayload, /Shopify/);
});

// === AGT-001D — generateAgentTurn contract tests ===
// Per docs/operating-system/discovery-agent-role.md, the agent is the sole owner
// of every turn. These tests pin the contract: completed envelope OR no envelope.

function createAgentTurnOpenAiResponse(envelope) {
  return new Response(JSON.stringify({
    id: "resp_agent_test",
    model: "gpt-agent-test",
    output: [
      { content: [{ text: JSON.stringify(envelope) }] },
    ],
    usage: { input_tokens: 12, output_tokens: 34, total_tokens: 46 },
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function validAgentEnvelope(overrides = {}) {
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

test("AGT-001D — generateAgentTurn returns completed envelope on happy path", async () => {
  const envelope = validAgentEnvelope();
  const client = new OnboardingProviderClient({
    openAiApiKey: "test-key",
    maxRetries: 0,
    retryDelayMs: 0,
    fetchImpl: async () => createAgentTurnOpenAiResponse(envelope),
  });

  const result = await client.generateAgentTurn({
    providerId: "openai",
    projectGoal: "תבנה לי אפליקציה",
    transcript: [{ id: "user-1", speaker: "user", text: "תבנה לי אפליקציה" }],
    currentUnderstanding: { understoodItems: [], missingItems: [], projectType: "unknown", actors: [] },
    userMessage: "תבנה לי אפליקציה",
    userMessageId: "user-1",
  });

  assert.equal(result.status, "completed");
  assert.deepEqual(result.envelope, envelope);
  assert.equal(result.deliveryMode, "live-api");
});

test("AGT-001D — malformed envelope yields status='agent-malformed' with NO envelope and NO replyToUser", async () => {
  const client = new OnboardingProviderClient({
    openAiApiKey: "test-key",
    maxRetries: 0,
    retryDelayMs: 0,
    // Return JSON missing required fields — must NOT be coerced into a fake reply.
    fetchImpl: async () => new Response(JSON.stringify({
      id: "resp_bad",
      model: "gpt-agent-test",
      output: [{ content: [{ text: JSON.stringify({ intent: "product-answer" }) }] }],
      usage: {},
    }), { status: 200, headers: { "Content-Type": "application/json" } }),
  });

  const result = await client.generateAgentTurn({
    providerId: "openai",
    userMessage: "something",
  });

  assert.equal(result.status, "agent-malformed");
  assert.equal(result.envelope, undefined, "must not carry an envelope");
  assert.equal(result.replyToUser, undefined, "must not synthesize a replyToUser");
  assert.match(result.error.code, /agent_envelope_/);
});

test("AGT-001D — missing API key yields status='unavailable' with NO envelope", async () => {
  const client = new OnboardingProviderClient({
    openAiApiKey: "",
    anthropicApiKey: "",
    maxRetries: 0,
    retryDelayMs: 0,
    fetchImpl: async () => { throw new Error("must_not_call_provider_without_key"); },
  });

  const result = await client.generateAgentTurn({
    providerId: "openai",
    userMessage: "anything",
  });

  assert.equal(result.status, "unavailable");
  assert.equal(result.envelope, undefined);
  assert.equal(result.replyToUser, undefined);
});

test("AGT-001D — envelope with advance-to-skeleton but skeletonReady.ready=false is rejected as malformed", async () => {
  const badEnvelope = validAgentEnvelope({
    nextMove: "advance-to-skeleton",
    skeletonReady: { ready: false, reason: "premature" },
  });
  const client = new OnboardingProviderClient({
    openAiApiKey: "test-key",
    maxRetries: 0,
    retryDelayMs: 0,
    fetchImpl: async () => createAgentTurnOpenAiResponse(badEnvelope),
  });

  const result = await client.generateAgentTurn({
    providerId: "openai",
    userMessage: "x",
  });

  assert.equal(result.status, "agent-malformed");
  assert.equal(result.error.code, "agent_envelope_advance_without_ready");
  assert.equal(result.envelope, undefined);
});

test("AGT-001D — system prompt embeds the canonical role file content", async () => {
  const requestBodies = [];
  const envelope = validAgentEnvelope();
  const client = new OnboardingProviderClient({
    openAiApiKey: "test-key",
    maxRetries: 0,
    retryDelayMs: 0,
    fetchImpl: async (_url, init) => {
      requestBodies.push(JSON.parse(init.body));
      return createAgentTurnOpenAiResponse(envelope);
    },
  });

  await client.generateAgentTurn({
    providerId: "openai",
    userMessage: "תבנה לי אפליקציה",
  });

  const systemPrompt = requestBodies[0]?.input?.[0]?.content ?? "";
  assert.match(systemPrompt, /Nexus Discovery Agent/);
  assert.match(systemPrompt, /CANONICAL ROLE/);
  assert.match(systemPrompt, /role file/i);
  // Strict json_schema is enforced
  const fmt = requestBodies[0]?.text?.format;
  assert.equal(fmt?.type, "json_schema");
  assert.equal(fmt?.strict, true);
  assert.equal(fmt?.name, "nexus_discovery_agent_turn");
});

test("AGT-001D — ask envelopes must include nextQuestion in visible replyToUser", async () => {
  const badEnvelope = validAgentEnvelope({
    replyToUser: "הבנתי את הכיוון הראשוני.",
    nextMove: "ask",
    nextQuestion: "למי המוצר הזה מיועד?",
  });
  const client = new OnboardingProviderClient({
    openAiApiKey: "test-key",
    maxRetries: 0,
    retryDelayMs: 0,
    fetchImpl: async () => createAgentTurnOpenAiResponse(badEnvelope),
  });
  const result = await client.generateAgentTurn({ providerId: "openai", userMessage: "x" });
  assert.equal(result.status, "agent-malformed");
  assert.equal(result.error.code, "agent_envelope_ask_without_visible_question");
  assert.equal(result.envelope, undefined);
});

test("AGT-001D — empty replyToUser is rejected as malformed", async () => {
  const badEnvelope = validAgentEnvelope({ replyToUser: "   " });
  const client = new OnboardingProviderClient({
    openAiApiKey: "test-key",
    maxRetries: 0,
    retryDelayMs: 0,
    fetchImpl: async () => createAgentTurnOpenAiResponse(badEnvelope),
  });
  const result = await client.generateAgentTurn({ providerId: "openai", userMessage: "x" });
  assert.equal(result.status, "agent-malformed");
  assert.equal(result.error.code, "agent_envelope_empty_reply");
});

test("AGT-001D — correction envelopes must correct or remove prior truth, not only append", async () => {
  const badEnvelope = validAgentEnvelope({
    intent: "correction",
    replyToUser: "הבנתי, זו מערכת נאמנות. מה הבעיה המרכזית במערכת הנאמנות?",
    understandingDelta: {
      added: [{ slot: "solution", value: "מערכת נאמנות", source: "user-2" }],
      corrected: [],
      removed: [],
    },
    nextMove: "ask",
    nextQuestion: "מה הבעיה המרכזית במערכת הנאמנות?",
  });
  const client = new OnboardingProviderClient({
    openAiApiKey: "test-key",
    maxRetries: 0,
    retryDelayMs: 0,
    fetchImpl: async () => createAgentTurnOpenAiResponse(badEnvelope),
  });
  const result = await client.generateAgentTurn({ providerId: "openai", userMessage: "לא, זו לא חנות" });
  assert.equal(result.status, "agent-malformed");
  assert.equal(result.error.code, "agent_envelope_correction_without_correction_delta");
  assert.equal(result.envelope, undefined);
});

test("SKEL-001 — generateProductSkeleton returns only a provider-composed skeleton envelope", async () => {
  const envelope = validProductSkeletonEnvelope();
  const requestBodies = [];
  const client = new OnboardingProviderClient({
    openAiApiKey: "test-key",
    maxRetries: 0,
    retryDelayMs: 0,
    fetchImpl: async (_url, init) => {
      requestBodies.push(JSON.parse(init.body));
      return createProductSkeletonOpenAiResponse(envelope);
    },
  });

  const result = await client.generateProductSkeleton({
    providerId: "openai",
    projectGoal: "מערכת לניהול לידים",
    transcript: [{ speaker: "user", text: "בעל עסק קטן מאבד לידים מוואטסאפ ושיחות" }],
    discoveryHandoff: {
      summarySnapshot: {
        understoodItems: ["בעל עסק קטן", "לידים נופלים", "צריך אחראי ותזכורת"],
        missingItems: [],
        projectType: "lead-management",
        actors: [{ role: "operator", label: "בעל עסק" }],
      },
    },
  });

  assert.equal(result.status, "completed");
  assert.equal(result.deliveryMode, "live-api");
  assert.deepEqual(result.envelope, envelope);
  assert.equal(requestBodies[0]?.text?.format?.name, "nexus_product_skeleton_agent");
  assert.equal(requestBodies[0]?.text?.format?.strict, true);
  assert.match(requestBodies[0]?.input?.[0]?.content ?? "", /Product Skeleton Agent/);
});

test("SKEL-001 — malformed product skeleton output does not create a fallback skeleton", async () => {
  const client = new OnboardingProviderClient({
    openAiApiKey: "test-key",
    maxRetries: 0,
    retryDelayMs: 0,
    fetchImpl: async () => createProductSkeletonOpenAiResponse({
      agentId: "product-skeleton-agent",
      responseSource: "local-template",
    }),
  });

  const result = await client.generateProductSkeleton({
    providerId: "openai",
    projectGoal: "מערכת לניהול לידים",
  });

  assert.equal(result.status, "agent-malformed");
  assert.equal(result.envelope, undefined);
  assert.match(result.error.code, /product_skeleton_envelope_/);
});

test("VSKEL-001 — generateVisualProductSkeleton returns only a provider-composed visual screen envelope", async () => {
  const productSkeleton = validProductSkeletonEnvelope();
  const visualSkeleton = validVisualProductSkeletonEnvelope();
  const requestBodies = [];
  const client = new OnboardingProviderClient({
    openAiApiKey: "test-key",
    maxRetries: 0,
    retryDelayMs: 0,
    fetchImpl: async (_url, init) => {
      requestBodies.push(JSON.parse(init.body));
      return createVisualProductSkeletonOpenAiResponse(visualSkeleton);
    },
  });

  const result = await client.generateVisualProductSkeleton({
    providerId: "openai",
    projectGoal: "מערכת לניהול לידים",
    productSkeletonAgentOutput: productSkeleton,
  });

  assert.equal(result.status, "completed");
  assert.equal(result.deliveryMode, "live-api");
  assert.deepEqual(result.envelope, visualSkeleton);
  assert.equal(requestBodies[0]?.text?.format?.name, "nexus_visual_product_skeleton_agent");
  assert.equal(requestBodies[0]?.text?.format?.strict, true);
  assert.match(requestBodies[0]?.input?.[0]?.content ?? "", /Visual Product Skeleton Agent/);
  assert.equal(requestBodies[0]?.input?.[1]?.content.includes("designPluginSelection"), true);
});

test("VSKEL-001 — malformed visual skeleton output does not create a fallback screen", async () => {
  const client = new OnboardingProviderClient({
    openAiApiKey: "test-key",
    maxRetries: 0,
    retryDelayMs: 0,
    fetchImpl: async () => createVisualProductSkeletonOpenAiResponse({
      agentId: "visual-product-skeleton-agent",
      responseSource: "local-template",
    }),
  });

  const result = await client.generateVisualProductSkeleton({
    providerId: "openai",
    projectGoal: "מערכת לניהול לידים",
    productSkeletonAgentOutput: validProductSkeletonEnvelope(),
  });

  assert.equal(result.status, "agent-malformed");
  assert.equal(result.envelope, undefined);
  assert.match(result.error.code, /visual_product_skeleton_envelope_/);
});
