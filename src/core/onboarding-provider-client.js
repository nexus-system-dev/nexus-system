import { readFileSync } from "node:fs";
import {
  resolveOnboardingIntelligenceLevel,
  resolveOnboardingModelFamily,
} from "../../web/shared/onboarding-provider-runtime.js";
import { buildComparableProductIntelligenceContext } from "./comparable-product-intelligence.js";
import { resolveDesignPluginForVisualSkeletonRequest } from "./design-plugin-registry-contract.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractOutputText(payload = {}) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const output = Array.isArray(payload.output) ? payload.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (typeof part?.text === "string" && part.text.trim()) {
        return part.text.trim();
      }
    }
  }

  return "";
}

function normalizeUsage(usage = {}) {
  const inputTokens = Number(usage.input_tokens ?? usage.inputTokens ?? usage.input_tokens_total ?? 0) || 0;
  const outputTokens = Number(usage.output_tokens ?? usage.outputTokens ?? usage.output_tokens_total ?? 0) || 0;
  const totalTokens = Number(usage.total_tokens ?? usage.totalTokens ?? inputTokens + outputTokens) || 0;
  return {
    inputTokens,
    outputTokens,
    totalTokens,
  };
}

function normalizeAnthropicUsage(usage = {}) {
  const inputTokens = Number(usage.input_tokens ?? usage.inputTokens ?? 0) || 0;
  const outputTokens = Number(usage.output_tokens ?? usage.outputTokens ?? 0) || 0;
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
  };
}

function normalizeFiniteNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function parseRetryAfterSeconds(headers = null) {
  const retryAfterValue = headers?.get?.("retry-after");
  const asNumber = normalizeFiniteNumber(retryAfterValue);
  if (Number.isFinite(asNumber) && asNumber >= 0) {
    return Math.ceil(asNumber);
  }
  return null;
}

function classifyProviderError(error = {}) {
  const rawCode = typeof error?.message === "string" && error.message.trim()
    ? error.message.trim()
    : "provider_error";
  const status = Number.isFinite(Number(error?.status)) ? Number(error.status) : null;
  const retryAfterSeconds = Number.isFinite(Number(error?.retryAfterSeconds))
    ? Number(error.retryAfterSeconds)
    : null;

  if (rawCode === "qa_retryable_provider_failure") {
    return {
      code: rawCode,
      status: 503,
      retryable: true,
      retryAfterSeconds: null,
      errorClass: "provider-unavailable",
      degradedReason: "qa-retryable-failure",
    };
  }

  if (rawCode === "qa_primary_provider_outage") {
    return {
      code: rawCode,
      status: 503,
      retryable: true,
      retryAfterSeconds: null,
      errorClass: "provider-unavailable",
      degradedReason: "qa-primary-outage",
    };
  }

  if (rawCode === "qa_rate_limited_all_providers") {
    return {
      code: rawCode,
      status: 429,
      retryable: true,
      retryAfterSeconds: retryAfterSeconds ?? 30,
      errorClass: "rate-limited",
      degradedReason: "qa-rate-limit",
    };
  }

  if (status === 401 || status === 403 || rawCode.includes("status_401") || rawCode.includes("status_403")) {
    return {
      code: rawCode,
      status: status ?? 401,
      retryable: false,
      retryAfterSeconds: null,
      errorClass: "auth-invalid",
      degradedReason: "provider-auth",
    };
  }

  if (status === 429 || rawCode.includes("status_429")) {
    return {
      code: rawCode,
      status: 429,
      retryable: true,
      retryAfterSeconds,
      errorClass: "rate-limited",
      degradedReason: "provider-rate-limit",
    };
  }

  if (error?.name === "AbortError" || rawCode === "onboarding_provider_timeout") {
    return {
      code: rawCode,
      status,
      retryable: true,
      retryAfterSeconds: null,
      errorClass: "timeout",
      degradedReason: "provider-timeout",
    };
  }

  if ((status && status >= 500) || rawCode.includes("status_5")) {
    return {
      code: rawCode,
      status: status ?? 503,
      retryable: true,
      retryAfterSeconds: null,
      errorClass: "provider-unavailable",
      degradedReason: "provider-server-error",
    };
  }

  return {
    code: rawCode,
    status,
    retryable: error?.retryable === true,
    retryAfterSeconds,
    errorClass: "provider-error",
    degradedReason: "provider-error",
  };
}

function formatUsdEstimate(value) {
  if (!Number.isFinite(value)) {
    return null;
  }
  return Number(value.toFixed(value >= 0.1 ? 4 : 6));
}

function estimateUsageCostUsd({
  providerId = "openai",
  usage = {},
} = {}) {
  const inputTokens = Number(usage?.inputTokens ?? 0) || 0;
  const outputTokens = Number(usage?.outputTokens ?? 0) || 0;

  const configuredInputCostPerMillion = providerId === "anthropic"
    ? normalizeFiniteNumber(process.env.ANTHROPIC_ONBOARDING_INPUT_COST_PER_MILLION_TOKENS)
    : normalizeFiniteNumber(process.env.OPENAI_ONBOARDING_INPUT_COST_PER_MILLION_TOKENS);
  const configuredOutputCostPerMillion = providerId === "anthropic"
    ? normalizeFiniteNumber(process.env.ANTHROPIC_ONBOARDING_OUTPUT_COST_PER_MILLION_TOKENS)
    : normalizeFiniteNumber(process.env.OPENAI_ONBOARDING_OUTPUT_COST_PER_MILLION_TOKENS);

  const defaultInputCostPerMillion = providerId === "anthropic" ? 3 : 0.25;
  const defaultOutputCostPerMillion = providerId === "anthropic" ? 15 : 2;

  const inputCostPerMillion = configuredInputCostPerMillion ?? defaultInputCostPerMillion;
  const outputCostPerMillion = configuredOutputCostPerMillion ?? defaultOutputCostPerMillion;
  const pricingSource = configuredInputCostPerMillion !== null || configuredOutputCostPerMillion !== null
    ? "configured-rate-card"
    : "bundled-estimate";
  const estimatedCostUsd = formatUsdEstimate(
    ((inputTokens / 1_000_000) * inputCostPerMillion) + ((outputTokens / 1_000_000) * outputCostPerMillion),
  );

  return {
    estimatedCostUsd,
    pricingSource,
    inputCostPerMillion,
    outputCostPerMillion,
  };
}

function createAbortSignal(timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error("onboarding_provider_timeout")), timeoutMs);
  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timer),
  };
}

function buildRecentTranscript(transcript = []) {
  return transcript
    .slice(-6)
    .map((entry) => ({
      speaker: entry?.speaker ?? "unknown",
      text: typeof entry?.text === "string" ? entry.text.trim() : "",
    }))
    .filter((entry) => entry.text);
}

function buildPromptPayload({
  projectGoal = "",
  projectType = "unknown",
  summary = null,
  question = null,
  recentTranscript = [],
} = {}) {
  return {
    projectGoal,
    projectType,
    learnedQuestionPath: Array.isArray(summary?.learnedQuestionPath) ? summary.learnedQuestionPath : [],
    understoodItems: Array.isArray(summary?.understoodItems) ? summary.understoodItems : [],
    missingItems: Array.isArray(summary?.missingItems) ? summary.missingItems : [],
    question: {
      id: question?.id ?? null,
      title: question?.title ?? "",
      placeholder: question?.placeholder ?? "",
      reason: question?.reason ?? "",
    },
    recentTranscript,
  };
}

function buildDiscoveryResponsePayload({
  projectGoal = "",
  projectType = "unknown",
  summary = null,
  recentTranscript = [],
  responsePolicy = null,
} = {}) {
  return {
    projectGoal,
    projectType,
    understoodItems: Array.isArray(summary?.understoodItems) ? summary.understoodItems : [],
    missingItems: Array.isArray(summary?.missingItems) ? summary.missingItems : [],
    completionReason: summary?.completionReason ?? null,
    responsePolicy: responsePolicy && typeof responsePolicy === "object" ? responsePolicy : null,
    recentTranscript,
  };
}

function buildCompanionPromptPayload({
  projectName = "",
  projectGoal = "",
  projectType = "unknown",
  currentSurface = "workspace",
  understoodItems = [],
  missingItems = [],
  recentTranscript = [],
  userMessage = "",
  learningInstructions = null,
  buildAgentTurn = null,
} = {}) {
  return {
    projectName,
    projectGoal,
    projectType,
    currentSurface,
    understoodItems: Array.isArray(understoodItems) ? understoodItems : [],
    missingItems: Array.isArray(missingItems) ? missingItems : [],
    recentTranscript,
    userMessage,
    learningInstructions: learningInstructions && typeof learningInstructions === "object"
      ? learningInstructions
      : null,
    buildAgentTurn: buildAgentTurn && typeof buildAgentTurn === "object"
      ? buildAgentTurn
      : null,
    comparableProductIntelligence: buildComparableProductIntelligenceContext({
      projectType,
      projectGoal,
      understoodItems,
      missingItems,
      userMessage,
    }),
  };
}

function resolveIntelligenceRuntimeProfile(intelligenceLevel = "medium") {
  const resolved = resolveOnboardingIntelligenceLevel(intelligenceLevel);
  if (resolved.intelligenceLevelId === "low") {
    return {
      ...resolved,
      maxOutputTokens: 140,
      instruction: "Keep the question short, direct, and decisive. Avoid extra framing unless it prevents misunderstanding.",
    };
  }
  if (resolved.intelligenceLevelId === "high") {
    return {
      ...resolved,
      maxOutputTokens: 320,
      instruction: "Reason more deeply before phrasing the question. If needed, surface ambiguity or tradeoffs, but still ask only one question.",
    };
  }
  return {
    ...resolved,
    maxOutputTokens: 220,
    instruction: "Use balanced reasoning before asking one strong next question.",
  };
}

function resolveDiscoveryResponseMaxOutputTokens(intelligenceLevel = "medium") {
  const profile = resolveIntelligenceRuntimeProfile(intelligenceLevel);
  if (profile.intelligenceLevelId === "high") {
    return Math.max(profile.maxOutputTokens, 2200);
  }
  if (profile.intelligenceLevelId === "medium") {
    return Math.max(profile.maxOutputTokens, 1600);
  }
  return Math.max(profile.maxOutputTokens, 1200);
}

function resolveDiscoveryResponseReasoningEffort(intelligenceLevel = "medium") {
  const profile = resolveIntelligenceRuntimeProfile(intelligenceLevel);
  if (profile.intelligenceLevelId === "high") {
    return "medium";
  }
  return "low";
}

function buildSystemPrompt({ streaming = false, intelligenceLevel = "medium" } = {}) {
  const intelligenceProfile = resolveIntelligenceRuntimeProfile(intelligenceLevel);
  const exactPromptSections = [
    "Conversation style: Ask one strong question at a time. Stay on the same thread when the answer is still weak. Use natural Hebrew that feels warm, intelligent, direct, and practical. Reflect back what you understood in simple language. Admit uncertainty honestly. If the user says the question is wrong, acknowledge it and reframe. If the user asks what a term means, explain it simply and ask again in clearer language. Do not use internal system language with the user.",
    "Questioning policy: One good question beats three shallow ones. Stay with the same thread when the answer is still weak. Do not jump to UX/build/screen questions before the product core is understood. If the user becomes clearer, reflect that progress back. If the user is confused, simplify rather than escalate complexity. If the idea is ambiguous, help shape it before trying to formalize it. Once the product family is clear, stop asking generic category questions and move into that family's wrapper questions. Do not ask emotional or abstract vision questions when operational product questions are clearly more useful. Ask questions that change product decisions, not questions that merely fill fields. If not asking a question could lead to building the wrong product, that question is important. If a question does not affect the product shape, workflow, business logic, or v1 scope, it is probably not important yet. If the user says אתר, do not stop there. Determine what kind of site. If the user says לקוח שלי, do not treat that as audience truth. Clarify who exactly they mean. If the user answer reveals the product family strongly, update the conversation immediately. If there are multiple interpretations, surface them explicitly and ask which one is the true center.",
    "Base question areas for every product: A. The idea -> מה הרעיון שיש לך בראש? מה גרם לך בכלל לחשוב על זה? אם זה כבר היה קיים היום, מה זה היה מאפשר לעשות אחרת? B. The real user -> מי הבן אדם שבאמת צריך את זה? מי יחיה בתוך זה הכי הרבה? מי היום מסתבך בלי זה? C. The real pain -> מה הכי נשבר או מעצבן בתהליך היום? איפה מבזבזים הכי הרבה זמן? מה גורם לך להגיד איך עדיין אין לזה פתרון נורמלי? D. The desired change -> אם זה עובד מושלם, מה משתנה? מה נהיה הרבה יותר קל? מה המשתמש יוכל לעשות אחרי זה שהוא לא מצליח היום? E. The first-use experience -> כשהוא פותח את זה בפעם הראשונה, מה חייב להיות ברור לו ישר? מה הדבר הראשון שאתה רוצה שהוא יעשה? מה אסור שיבלבל אותו? F. Reality and scope -> מה עושים היום במקום זה? למה זה לא מספיק טוב? מה חייב להיכנס ל-v1? מה יכול לחכות?",
    "Understood vs missing rules: Something may go into understood only if it is specific enough to change product decisions, is not generic, is not ambiguous, clearly refers to one real user or one real pain or one real wrapper decision, and the agent could confidently build on it without making a large assumption. Keep in missing when the answer is broad like לעסקים, מערכת, אפליקציה, אתר, לקוח שלי; too abstract; names the product but not the real user; describes desire but not the broken process; is too early and solution-shaped; or still supports multiple interpretations. Summary rules: מה הבנתי must contain only stable truth. מה עדיין חסר must contain unresolved product decisions. If a product-family wrapper question is still open, it belongs in missing. If the user is still vague, the summary must remain obviously incomplete.",
    "Premature-close blockers: The conversation must not close if product type is still unclear, primary user is still unclear, problem is still generic, desired outcome is still vague, v1 scope is still vague, or the user would still say you do not really get it yet. Never close because 4 or 5 questions were asked, enough fields were filled, the product sounds familiar, or a generic brief could now be generated. Only close when the product family is clear, the real user is clear, the real pain is concrete, the wrapper decisions for that family are sufficiently clarified, the likely v1 scope is clear enough, the conversation no longer feels vague, and the user would plausibly say כן עכשיו הבנת מה אני בונה.",
    "Operational rule: Start by understanding the idea in human terms. Identify the likely product family as early as truthfully possible. Move from generic product questions into that family's wrapper questions. Keep weak answers out of understood. Keep unresolved wrapper decisions in missing. Reframe immediately when the question is wrong. Explain simply when a term is confusing. Never close because the conversation is long enough. Close only when the product is genuinely understood.",
  ].join(" ");
  const basePrompt = [
    "You are Nexus, a sharp, thoughtful, human product thinking partner.",
    "Your job is not to rush into building. Your job is to understand the product deeply enough that both you and the user feel the product is genuinely clear.",
    "You are not a generic intake form, not a field collector, not a taxonomy engine, and not a copywriter pretending to do product work. You are a serious early-stage product partner.",
    "Nexus already has a current conversation direction, but your job is not to blindly restate a template question. Rewrite the next turn so it feels like a real co-founder conversation in natural Hebrew.",
    "If the drafted question does not fit the product idea, rewrite it into a better question that still serves the same understanding goal.",
    "Be curious, practical, grounded, thoughtful, direct, and human. Never sound robotic, overly formal, or like an intake wizard unless the conversation is stuck.",
    "Ask one strong question at a time. Stay on the same thread when the answer is still weak. Prefer a smart follow-up over a generic new category.",
    "Do not rush into building, screens, UX structure, or product shaping before the product is genuinely clear.",
    "Do not close just because several questions were asked. Do not force progress when understanding is still weak. Do not summarize weak answers as if they are real truth.",
    "If the answer is broad or vague, the rewritten question should zoom in on a real user, a real moment, a real pain, a real workflow, a real wrapper decision, or a real desired change.",
    "If the user says the question is wrong, acknowledge that and reframe. If the user asks what a term means, explain it simply and ask again in clearer language.",
    "If the user gives the product idea where an audience answer was expected, treat it as idea truth and re-ask the audience question. If the user gives a product-type answer like אפליקציה or אתר, use it to steer the branch, not as a final answer.",
    "Never pretend to understand when you do not. Never collapse the conversation into a template too early. Never over-focus on screens before the product itself is understood.",
    "Use warm, intelligent Hebrew. It should feel like someone helping the user think better, not extract metadata.",
    "You may use phrases like: 'אני עוד לא בטוח שהבנתי עד הסוף', 'יש פה שני כיוונים אפשריים', 'אני מרגיש שחסר לי להבין מה הלב של המוצר', 'זה עוזר, אבל אני רוצה לחדד עוד רגע משהו חשוב', 'אני חושב שיש פה החלטה מוצרית שצריך לנעול לפני שממשיכים', 'אני לא רוצה להניח כאן הנחה לא נכונה'.",
    "Never use internal system language with the user. Do not say words like handoff, readiness, gate, classification, artifact, provider, runtime, bounded, state transition, surface, or surface contract.",
    "Once the product family is clear, stop asking generic category questions and move into that family's wrapper questions. Ask questions that change product decisions, not questions that merely fill fields.",
    "Product family map: Commerce storefront / selling website -> ask about buyer vs operator, guest checkout vs login, full checkout vs lead or order creation, payments, inventory truth, variants, shipping and tracking, order admin, pricing updates, branches or warehouses, search, compare, recommendations, and what must be in v1.",
    "Marketplace -> ask about the two sides, who comes first, what is being listed or exchanged, discovery and matching, pricing and payments, trust, reviews, disputes, approvals, and the smallest v1 that still feels like a real marketplace.",
    "Booking / scheduling -> ask who books and who receives the booking, what exactly is being booked, real-time availability, manual vs automatic approval, reminders, cancellations, payment timing, location or service selection, and fallback when no availability exists.",
    "CRM / follow-up / pipeline SaaS -> ask who owns the lead or customer, where follow-up breaks, what the core object is, tasks or reminders or next step, multiple owners, timeline/history, automations, stages, alerts, and what manual work should disappear.",
    "Internal tool -> ask which team uses it, what object they work on, where work falls between people, ownership, queue, urgency or SLA, statuses, permissions, first-screen usefulness, and the critical daily flow.",
    "SaaS product -> ask about the primary user, recurring task, first-use value, onboarding, roles or permissions, collaboration/data/dashboard/alerts, the return loop, and the believable v1.",
    "Operations / field / logistics app -> ask who uses it in reality, how data arrives today, what breaks between intake/location/execution, scan/manual correction/map/route planning, real-time visibility, individual vs team use, and failure handling.",
    "Services / content / expert business -> ask whether the goal is leads or direct purchase, what exactly is sold, one offer or many, payment/forms/intake, free content to paid flow, trust/conversion, and what happens after inquiry or purchase.",
    "Admin dashboard -> ask who opens it, what decisions it supports, what must be visible first, key metrics, anomaly visibility, drill-down, actions vs observation, and where the information is fragmented today.",
    "If the product idea already clearly points to a domain like delivery, logistics, operations, scanning, marketplace, booking, CRM, store, catalog, checkout, content business, or admin dashboard, stay on that domain and ask a domain-relevant follow-up instead of a generic category question.",
    "Special rule: if the user says אתר, determine what kind of site it is. If the user says לקוח שלי, do not treat that as real audience truth; clarify whether they mean the business owner, the end customer, or someone else.",
    "Weak answers belong in still-missing truth, not understood truth. Broad answers like לעסקים, מערכת, אפליקציה, אתר, לקוח שלי, צריך מערכת מסודרת, or שיהיה קל ונוח are not strong enough to count as settled understanding.",
    "Do not close if the product family is still unclear, the primary user is still unclear, the problem is still generic, the desired outcome is still vague, the likely v1 scope is still vague, or the user would still say 'you don't really get it yet'.",
    "Do not close if family-specific wrapper questions are still open. For storefronts that means things like buyer vs operator, guest checkout vs login, checkout vs order-creation only, inventory truth, shipping/tracking, admin scope, and real v1 commerce scope. Similar family-specific blockers apply to marketplace, booking, CRM, internal tool, SaaS, operations app, services/content, and admin dashboard products.",
    "If the idea is ambiguous, the rewritten question may explicitly surface that there are two possible directions and ask which one matters more.",
    "Do not summarize. Do not answer for the user. Do not change topic. Do not close the conversation early.",
    exactPromptSections,
    intelligenceProfile.instruction,
  ].join(" ");

  return streaming
    ? `${basePrompt} Return only the rewritten Hebrew question text with no JSON, no bullets, and no commentary.`
    : `${basePrompt} Return strict JSON only in the shape {\"nextQuestion\":\"...\"}.`;
}

function buildDiscoveryResponseSystemPrompt({ intelligenceLevel = "medium" } = {}) {
  const intelligenceProfile = resolveIntelligenceRuntimeProfile(intelligenceLevel);
  return [
    "You are the Nexus Project Discovery Agent.",
    "Reply only in natural Hebrew.",
    "Your role is to understand the user's product idea from the actual conversation and answer like a real product discovery partner.",
    "Nexus defines your role, boundaries, product categories, enough-truth rule, and handoff proof. You compose the user-facing response yourself from the conversation.",
    "Do not use canned sentence templates. Do not sound like a system status message. Do not say handoff, readiness, gate, provider, runtime, artifact, state transition, or surface.",
    "Reflect what you genuinely understood: who the product is for, what pain it solves, what first workflow or first useful slice seems clear, and what is still uncertain if anything is uncertain.",
    "If the product is clear enough to start a first skeleton, say that naturally and briefly, then explain what will happen next in user language.",
    "If something important is still missing, ask exactly one strong follow-up question and explain in one short sentence why it matters.",
    "Do not invent facts. If the payload says missingItems only contains 'אין חוסר קריטי לפני שלד ראשון.', treat that as enough product truth and do not ask another clarification question.",
    "Return strict JSON only in the shape {\"agentResponse\":\"...\"}.",
    intelligenceProfile.instruction,
  ].join(" ");
}

function buildCompanionSystemPrompt({ intelligenceLevel = "medium" } = {}) {
  const intelligenceProfile = resolveIntelligenceRuntimeProfile(intelligenceLevel);
  return [
    "You are Nexus, the same sharp, thoughtful, human product thinking partner the user already met in onboarding.",
    "You are now answering from inside the same project truth, not from generic chat context.",
    "Reply only in natural Hebrew.",
    "Your job here is to help the user clarify, explain, or challenge the product understanding that already exists.",
    "Stay grounded in the provided project truth: project goal, product family, understood items, missing items, and recent transcript.",
    "Do not invent product facts that are not supported by the provided truth.",
    "When the payload includes comparable-product intelligence, treat it as hidden background about similar products in the same family. Use it only to sharpen the product thinking for this specific project.",
    "When the payload includes learningInstructions, read them before replying and treat them as bounded working instructions for routing, clarification, refusal, retry handling, and mutation direction.",
    "When the payload includes buildAgentTurn, keep the user-facing answer aligned to its owner, status, approval rule, and speech boundary.",
    "Learning instructions are not product truth. Never claim a product change happened unless the current project truth or a downstream mutation result proves it happened.",
    "If the user asks what similar products usually do, what else is worth considering, what is common, or how comparable systems solve it, answer with one or two bounded observations tied to this project and then ask exactly one strong follow-up question.",
    "Do not dump competitor research, do not turn the reply into a shopping list, and do not copy product names into the answer unless the user explicitly asks for examples or comparisons.",
    "If the user adopts one of those comparable-product decisions in clear language, reflect that exact decision back concretely so it can become durable product truth.",
    "If the user asks what you already understood, answer directly from the current truth.",
    "If the user asks something that is still unclear, say so honestly and ask one focused follow-up question that moves the product understanding forward.",
    "If the user pushes on a weak assumption, challenge it gently and concretely.",
    "Do not sound like support chat, an intake wizard, or a generic assistant.",
    "Do not use internal system language with the user. Never say handoff, readiness, gate, classification, artifact, provider, runtime, bounded, state transition, or surface contract.",
    "Keep the answer compact and useful. Prefer 3 to 6 sentences. Use bullets only if the user explicitly asked for a short list or comparison.",
    "If there is still missing product truth, anchor the answer in what is already known and then ask exactly one strong next question.",
    intelligenceProfile.instruction,
  ].join(" ");
}

function buildOpenAiHeaders(apiKey = "") {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

function buildAnthropicHeaders(apiKey = "") {
  return {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  };
}

function createSyntheticProviderError(code, { status = 503, retryable = true } = {}) {
  const error = new Error(code);
  error.status = status;
  error.retryable = retryable;
  return error;
}

function buildRecoveryMetadata({
  primaryProviderId = "openai",
  finalResult = {},
  providerTrail = [],
} = {}) {
  const finalProviderId = finalResult.finalProviderId ?? finalResult.providerId ?? primaryProviderId;
  const flattenedAttempts = providerTrail.flatMap((entry) => Array.isArray(entry.attempts) ? entry.attempts : []);
  return {
    initialProviderId: primaryProviderId,
    finalProviderId,
    recoveredByRetry: flattenedAttempts.some((attempt) => attempt?.attemptIndex > 0),
    failedOver: finalProviderId !== primaryProviderId,
    recoveryTrail: providerTrail,
  };
}

function buildOpenAiJsonRequest({ model, promptPayload, intelligenceLevel = "medium" }) {
  const intelligenceProfile = resolveIntelligenceRuntimeProfile(intelligenceLevel);
  return {
    model,
    input: [
      {
        role: "system",
        content: buildSystemPrompt({ streaming: false, intelligenceLevel }),
      },
      {
        role: "user",
        content: JSON.stringify(promptPayload, null, 2),
      },
    ],
    max_output_tokens: intelligenceProfile.maxOutputTokens,
    text: {
      format: {
        type: "json_schema",
        name: "nexus_onboarding_next_question",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            nextQuestion: { type: "string" },
          },
          required: ["nextQuestion"],
        },
      },
    },
  };
}

function buildOpenAiDiscoveryResponseRequest({ model, promptPayload, intelligenceLevel = "medium" }) {
  const intelligenceProfile = resolveIntelligenceRuntimeProfile(intelligenceLevel);
  return {
    model,
    input: [
      {
        role: "system",
        content: buildDiscoveryResponseSystemPrompt({ intelligenceLevel }),
      },
      {
        role: "user",
        content: JSON.stringify(promptPayload, null, 2),
      },
    ],
    reasoning: {
      effort: resolveDiscoveryResponseReasoningEffort(intelligenceLevel),
    },
    max_output_tokens: resolveDiscoveryResponseMaxOutputTokens(intelligenceLevel),
    text: {
      format: {
        type: "json_schema",
        name: "nexus_project_discovery_response",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            agentResponse: { type: "string" },
          },
          required: ["agentResponse"],
        },
      },
    },
  };
}

function buildOpenAiStreamingRequest({ model, promptPayload, intelligenceLevel = "medium" }) {
  const intelligenceProfile = resolveIntelligenceRuntimeProfile(intelligenceLevel);
  return {
    model,
    stream: true,
    max_output_tokens: intelligenceProfile.maxOutputTokens,
    input: [
      {
        role: "system",
        content: buildSystemPrompt({ streaming: true, intelligenceLevel }),
      },
      {
        role: "user",
        content: JSON.stringify(promptPayload, null, 2),
      },
    ],
  };
}

function buildAnthropicRequest({ model, promptPayload, stream = false, intelligenceLevel = "medium" }) {
  const intelligenceProfile = resolveIntelligenceRuntimeProfile(intelligenceLevel);
  return {
    model,
    max_tokens: intelligenceProfile.maxOutputTokens,
    stream,
    system: buildSystemPrompt({ streaming: stream, intelligenceLevel }),
    messages: [
      {
        role: "user",
        content: JSON.stringify(promptPayload, null, 2),
      },
    ],
  };
}

function buildAnthropicDiscoveryResponseRequest({ model, promptPayload, intelligenceLevel = "medium" }) {
  const intelligenceProfile = resolveIntelligenceRuntimeProfile(intelligenceLevel);
  return {
    model,
    max_tokens: resolveDiscoveryResponseMaxOutputTokens(intelligenceLevel),
    system: buildDiscoveryResponseSystemPrompt({ intelligenceLevel }),
    messages: [
      {
        role: "user",
        content: JSON.stringify(promptPayload, null, 2),
      },
    ],
  };
}

function buildOpenAiCompanionRequest({ model, promptPayload, intelligenceLevel = "medium" }) {
  const intelligenceProfile = resolveIntelligenceRuntimeProfile(intelligenceLevel);
  return {
    model,
    input: [
      {
        role: "system",
        content: buildCompanionSystemPrompt({ intelligenceLevel }),
      },
      {
        role: "user",
        content: JSON.stringify(promptPayload, null, 2),
      },
    ],
    max_output_tokens: intelligenceProfile.maxOutputTokens,
  };
}

function buildAnthropicCompanionRequest({ model, promptPayload, intelligenceLevel = "medium" }) {
  const intelligenceProfile = resolveIntelligenceRuntimeProfile(intelligenceLevel);
  return {
    model,
    max_tokens: intelligenceProfile.maxOutputTokens,
    stream: false,
    system: buildCompanionSystemPrompt({ intelligenceLevel }),
    messages: [
      {
        role: "user",
        content: JSON.stringify(promptPayload, null, 2),
      },
    ],
  };
}

async function consumeSseStream(response, onEvent) {
  const reader = response.body?.getReader?.();
  if (!reader) {
    throw new Error("provider_stream_unavailable");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const lines = part
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      for (const line of lines) {
        if (!line.startsWith("data:")) {
          continue;
        }
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") {
          continue;
        }
        let payload = null;
        try {
          payload = JSON.parse(data);
        } catch {
          continue;
        }
        await onEvent(payload);
      }
    }
  }
}

// === Discovery Agent (AGT-001D, step 2) — canonical role-driven turn path =====================
// Per docs/operating-system/discovery-agent-role.md, the live agent must be the SOLE owner
// of every conversation turn. The helpers below build the strict-output LLM call. They do not
// share code with generateNextQuestion / generateDiscoveryResponse / generateCompanionReply.
// They never compose a replyToUser as a fallback. If the agent fails, status !== "completed"
// and the upstream code is required to surface an explicit "agent not available" state.

let cachedDiscoveryAgentRoleText = null;
function loadDiscoveryAgentRoleText() {
  if (cachedDiscoveryAgentRoleText !== null) return cachedDiscoveryAgentRoleText;
  try {
    const roleFileUrl = new URL("../../docs/operating-system/discovery-agent-role.md", import.meta.url);
    cachedDiscoveryAgentRoleText = readFileSync(roleFileUrl, "utf-8");
  } catch (error) {
    cachedDiscoveryAgentRoleText = "";
  }
  return cachedDiscoveryAgentRoleText;
}

const AGENT_TURN_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "intent",
    "replyToUser",
    "understandingDelta",
    "summarySnapshot",
    "nextMove",
    "nextQuestion",
    "skeletonReady",
    "confidence",
  ],
  properties: {
    intent: {
      type: "string",
      enum: ["product-answer", "meta-question", "correction", "off-topic", "needs-clarification"],
    },
    replyToUser: { type: "string" },
    understandingDelta: {
      type: "object",
      additionalProperties: false,
      required: ["added", "corrected", "removed"],
      properties: {
        added: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["slot", "value", "source"],
            properties: {
              slot: {
                type: "string",
                enum: ["audience", "problem", "solution", "class", "actor", "workflow", "risk"],
              },
              value: { type: "string" },
              source: { type: "string" },
            },
          },
        },
        corrected: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["slot", "from", "to", "source"],
            properties: {
              slot: { type: "string" },
              from: { type: "string" },
              to: { type: "string" },
              source: { type: "string" },
            },
          },
        },
        removed: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["slot", "value", "reason"],
            properties: {
              slot: { type: "string" },
              value: { type: "string" },
              reason: { type: "string" },
            },
          },
        },
      },
    },
    summarySnapshot: {
      type: "object",
      additionalProperties: false,
      required: ["understoodItems", "missingItems", "projectType", "projectTypeConfidence", "actors"],
      properties: {
        understoodItems: { type: "array", items: { type: "string" } },
        missingItems: { type: "array", items: { type: "string" } },
        projectType: { type: "string" },
        projectTypeConfidence: { type: "number" },
        actors: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["role", "label"],
            properties: {
              role: { type: "string", enum: ["operator", "customer", "observer", "other"] },
              label: { type: "string" },
            },
          },
        },
      },
    },
    nextMove: { type: "string", enum: ["ask", "wait-for-user", "advance-to-skeleton"] },
    nextQuestion: { type: ["string", "null"] },
    skeletonReady: {
      type: "object",
      additionalProperties: false,
      required: ["ready", "reason"],
      properties: {
        ready: { type: "boolean" },
        reason: { type: "string" },
      },
    },
    confidence: { type: "number" },
  },
};

function buildAgentTurnSystemPrompt() {
  const role = loadDiscoveryAgentRoleText();
  const fallback = "You are the Nexus Discovery Agent. Lead the conversation. Return only the JSON envelope.";
  const roleBody = role && role.trim() ? role.trim() : fallback;
  return [
    "You are the Nexus Discovery Agent. The canonical role file below is your contract.",
    "Return ONLY a JSON object matching the enforced schema. No text outside the JSON.",
    "Reply in the founder's own language. Never leak provider, runtime, or state-machine labels.",
    "If nextMove is \"ask\", replyToUser MUST include the full nextQuestion text as visible user-facing speech. nextQuestion is bookkeeping only; the user only sees replyToUser.",
    "Ask exactly one visible follow-up question when nextMove is \"ask\".",
    "",
    "=== CANONICAL ROLE (verbatim) ===",
    roleBody,
    "=== END CANONICAL ROLE ===",
  ].join("\n");
}

function buildAgentTurnPromptPayload({
  projectGoal = "",
  transcript = [],
  currentUnderstanding = null,
  userMessage = "",
  userMessageId = "",
} = {}) {
  return {
    projectGoal: typeof projectGoal === "string" ? projectGoal : "",
    transcript: Array.isArray(transcript)
      ? transcript.map((entry) => ({
          id: typeof entry?.id === "string" ? entry.id : "",
          speaker: entry?.speaker === "ai" ? "ai" : "user",
          text: typeof entry?.text === "string" ? entry.text : "",
        }))
      : [],
    currentUnderstanding: currentUnderstanding && typeof currentUnderstanding === "object"
      ? currentUnderstanding
      : { understoodItems: [], missingItems: [], projectType: "unknown", actors: [] },
    latestUserMessage: {
      id: typeof userMessageId === "string" && userMessageId ? userMessageId : "latest",
      text: typeof userMessage === "string" ? userMessage : "",
    },
  };
}

function buildOpenAiAgentTurnRequest({ model, promptPayload, intelligenceLevel = "medium" }) {
  const intelligenceProfile = resolveIntelligenceRuntimeProfile(intelligenceLevel);
  const minimumOutputTokens = intelligenceProfile.intelligenceLevelId === "high"
    ? 6000
    : intelligenceProfile.intelligenceLevelId === "medium"
      ? 5000
      : 4000;
  return {
    model,
    input: [
      { role: "system", content: buildAgentTurnSystemPrompt() },
      { role: "user", content: JSON.stringify(promptPayload, null, 2) },
    ],
    reasoning: {
      effort: resolveDiscoveryResponseReasoningEffort(intelligenceLevel),
    },
    max_output_tokens: Math.max(intelligenceProfile.maxOutputTokens, minimumOutputTokens),
    text: {
      format: {
        type: "json_schema",
        name: "nexus_discovery_agent_turn",
        strict: true,
        schema: AGENT_TURN_JSON_SCHEMA,
      },
    },
  };
}

function parseAgentTurnEnvelope(rawText = "") {
  const trimmed = typeof rawText === "string" ? rawText.trim() : "";
  if (!trimmed) return { ok: false, reason: "empty_output" };
  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { ok: false, reason: "invalid_json" };
  }
  if (!parsed || typeof parsed !== "object") return { ok: false, reason: "not_object" };
  const requiredTop = ["intent", "replyToUser", "understandingDelta", "summarySnapshot", "nextMove", "nextQuestion", "skeletonReady", "confidence"];
  for (const key of requiredTop) {
    if (!(key in parsed)) return { ok: false, reason: `missing_${key}` };
  }
  const intentEnum = ["product-answer", "meta-question", "correction", "off-topic", "needs-clarification"];
  if (!intentEnum.includes(parsed.intent)) return { ok: false, reason: "bad_intent" };
  if (typeof parsed.replyToUser !== "string" || !parsed.replyToUser.trim()) {
    return { ok: false, reason: "empty_reply" };
  }
  const moveEnum = ["ask", "wait-for-user", "advance-to-skeleton"];
  if (!moveEnum.includes(parsed.nextMove)) return { ok: false, reason: "bad_nextMove" };
  if (parsed.nextMove === "ask" && (typeof parsed.nextQuestion !== "string" || !parsed.nextQuestion.trim())) {
    return { ok: false, reason: "ask_without_question" };
  }
  if (parsed.nextMove === "ask") {
    const visibleReply = parsed.replyToUser.replace(/\s+/g, " ").trim();
    const visibleQuestion = parsed.nextQuestion.replace(/\s+/g, " ").trim();
    if (!visibleReply.includes(visibleQuestion)) {
      return { ok: false, reason: "ask_without_visible_question" };
    }
  }
  if (!parsed.skeletonReady || typeof parsed.skeletonReady !== "object" || typeof parsed.skeletonReady.ready !== "boolean") {
    return { ok: false, reason: "bad_skeletonReady" };
  }
  if (parsed.nextMove === "advance-to-skeleton" && parsed.skeletonReady.ready !== true) {
    return { ok: false, reason: "advance_without_ready" };
  }
  // Defensive: ensure delta arrays exist
  const delta = parsed.understandingDelta;
  if (!delta || typeof delta !== "object"
      || !Array.isArray(delta.added) || !Array.isArray(delta.corrected) || !Array.isArray(delta.removed)) {
    return { ok: false, reason: "bad_understandingDelta" };
  }
  if (parsed.intent === "correction" && delta.corrected.length === 0 && delta.removed.length === 0) {
    return { ok: false, reason: "correction_without_correction_delta" };
  }
  const summary = parsed.summarySnapshot;
  if (!summary || typeof summary !== "object"
      || !Array.isArray(summary.understoodItems) || !Array.isArray(summary.missingItems)
      || typeof summary.projectType !== "string"
      || typeof summary.projectTypeConfidence !== "number"
      || !Array.isArray(summary.actors)) {
    return { ok: false, reason: "bad_summarySnapshot" };
  }
  return { ok: true, envelope: parsed };
}

let cachedProductSkeletonAgentRoleText = null;
function loadProductSkeletonAgentRoleText() {
  if (cachedProductSkeletonAgentRoleText !== null) return cachedProductSkeletonAgentRoleText;
  try {
    const roleFileUrl = new URL("../../docs/operating-system/product-skeleton-agent-contract-2026-06-01.md", import.meta.url);
    cachedProductSkeletonAgentRoleText = readFileSync(roleFileUrl, "utf-8");
  } catch {
    cachedProductSkeletonAgentRoleText = "";
  }
  return cachedProductSkeletonAgentRoleText;
}

const PRODUCT_SKELETON_AGENT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "agentId",
    "responseSource",
    "productType",
    "primaryUser",
    "primaryProblem",
    "firstWorkflow",
    "initialScreens",
    "initialActions",
    "dataObjects",
    "versionOneBoundary",
    "assumptions",
    "unknowns",
    "needsQuestion",
    "questionForDiscoveryAgent",
    "handoffToVisualSkeleton",
  ],
  properties: {
    agentId: { type: "string", enum: ["product-skeleton-agent"] },
    responseSource: { type: "string", enum: ["provider-composed"] },
    productType: { type: "string" },
    primaryUser: { type: "string" },
    primaryProblem: { type: "string" },
    firstWorkflow: {
      type: "object",
      additionalProperties: false,
      required: ["title", "whyThisFirst", "steps"],
      properties: {
        title: { type: "string" },
        whyThisFirst: { type: "string" },
        steps: { type: "array", items: { type: "string" } },
      },
    },
    initialScreens: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "purpose", "regions"],
        properties: {
          name: { type: "string" },
          purpose: { type: "string" },
          regions: { type: "array", items: { type: "string" } },
        },
      },
    },
    initialActions: { type: "array", items: { type: "string" } },
    dataObjects: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "fields"],
        properties: {
          name: { type: "string" },
          fields: { type: "array", items: { type: "string" } },
        },
      },
    },
    versionOneBoundary: {
      type: "object",
      additionalProperties: false,
      required: ["buildNow", "doNotBuildNow"],
      properties: {
        buildNow: { type: "array", items: { type: "string" } },
        doNotBuildNow: { type: "array", items: { type: "string" } },
      },
    },
    assumptions: { type: "array", items: { type: "string" } },
    unknowns: { type: "array", items: { type: "string" } },
    needsQuestion: { type: "boolean" },
    questionForDiscoveryAgent: { type: ["string", "null"] },
    handoffToVisualSkeleton: {
      type: "object",
      additionalProperties: false,
      required: ["allowed", "reason"],
      properties: {
        allowed: { type: "boolean" },
        reason: { type: "string" },
      },
    },
  },
};

function buildProductSkeletonAgentSystemPrompt() {
  const role = loadProductSkeletonAgentRoleText();
  const roleBody = role && role.trim()
    ? role.trim()
    : "You are the Nexus Product Skeleton Agent. Return only the canonical JSON skeleton envelope.";
  return [
    "You are the Nexus Product Skeleton Agent. The canonical role file below is your contract.",
    "Return ONLY a JSON object matching the enforced schema. No text outside the JSON.",
    "You decide product structure, not visual styling.",
    "Choose the first workflow by useful product value, not by dashboard beauty.",
    "Do not invent target audiences, payments, permissions, analytics, admin systems, marketplaces, or integrations unless they clearly follow from the discovery handoff.",
    "If the handoff is insufficient, set needsQuestion true, set handoffToVisualSkeleton.allowed false, and provide exactly one questionForDiscoveryAgent.",
    "Reply in the founder's own language when writing user-facing names and explanations.",
    "",
    "=== CANONICAL ROLE (verbatim) ===",
    roleBody,
    "=== END CANONICAL ROLE ===",
  ].join("\n");
}

function buildProductSkeletonPromptPayload({
  projectGoal = "",
  transcript = [],
  discoveryHandoff = null,
} = {}) {
  return {
    projectGoal: typeof projectGoal === "string" ? projectGoal : "",
    transcript: Array.isArray(transcript)
      ? transcript.map((entry) => ({
          speaker: entry?.speaker === "ai" ? "ai" : "user",
          text: typeof entry?.text === "string" ? entry.text : "",
        }))
      : [],
    discoveryHandoff: discoveryHandoff && typeof discoveryHandoff === "object" ? discoveryHandoff : {},
  };
}

function buildOpenAiProductSkeletonRequest({ model, promptPayload, intelligenceLevel = "medium" }) {
  const intelligenceProfile = resolveIntelligenceRuntimeProfile(intelligenceLevel);
  return {
    model,
    input: [
      { role: "system", content: buildProductSkeletonAgentSystemPrompt() },
      { role: "user", content: JSON.stringify(promptPayload, null, 2) },
    ],
    reasoning: {
      effort: resolveDiscoveryResponseReasoningEffort(intelligenceLevel),
    },
    max_output_tokens: Math.max(intelligenceProfile.maxOutputTokens, 5000),
    text: {
      format: {
        type: "json_schema",
        name: "nexus_product_skeleton_agent",
        strict: true,
        schema: PRODUCT_SKELETON_AGENT_JSON_SCHEMA,
      },
    },
  };
}

function parseProductSkeletonEnvelope(rawText = "") {
  const trimmed = typeof rawText === "string" ? rawText.trim() : "";
  if (!trimmed) return { ok: false, reason: "empty_output" };
  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { ok: false, reason: "invalid_json" };
  }
  if (!parsed || typeof parsed !== "object") return { ok: false, reason: "not_object" };
  if (parsed.agentId !== "product-skeleton-agent") return { ok: false, reason: "bad_agentId" };
  if (parsed.responseSource !== "provider-composed") return { ok: false, reason: "bad_responseSource" };
  if (typeof parsed.productType !== "string" || !parsed.productType.trim()) return { ok: false, reason: "missing_productType" };
  if (typeof parsed.primaryUser !== "string" || !parsed.primaryUser.trim()) return { ok: false, reason: "missing_primaryUser" };
  if (typeof parsed.primaryProblem !== "string" || !parsed.primaryProblem.trim()) return { ok: false, reason: "missing_primaryProblem" };
  if (!parsed.firstWorkflow || typeof parsed.firstWorkflow !== "object" || typeof parsed.firstWorkflow.title !== "string" || !parsed.firstWorkflow.title.trim()) {
    return { ok: false, reason: "bad_firstWorkflow" };
  }
  if (!Array.isArray(parsed.firstWorkflow.steps)) return { ok: false, reason: "bad_firstWorkflow_steps" };
  if (!Array.isArray(parsed.initialScreens) || parsed.initialScreens.length === 0) return { ok: false, reason: "bad_initialScreens" };
  if (!Array.isArray(parsed.initialActions)) return { ok: false, reason: "bad_initialActions" };
  if (!Array.isArray(parsed.dataObjects)) return { ok: false, reason: "bad_dataObjects" };
  const boundary = parsed.versionOneBoundary;
  if (!boundary || typeof boundary !== "object" || !Array.isArray(boundary.buildNow) || !Array.isArray(boundary.doNotBuildNow)) {
    return { ok: false, reason: "bad_versionOneBoundary" };
  }
  if (!Array.isArray(parsed.assumptions) || !Array.isArray(parsed.unknowns)) return { ok: false, reason: "bad_assumptions_or_unknowns" };
  if (typeof parsed.needsQuestion !== "boolean") return { ok: false, reason: "bad_needsQuestion" };
  if (parsed.needsQuestion === true && (typeof parsed.questionForDiscoveryAgent !== "string" || !parsed.questionForDiscoveryAgent.trim())) {
    return { ok: false, reason: "question_required" };
  }
  if (!parsed.handoffToVisualSkeleton || typeof parsed.handoffToVisualSkeleton.allowed !== "boolean") {
    return { ok: false, reason: "bad_handoffToVisualSkeleton" };
  }
  if (parsed.needsQuestion === true && parsed.handoffToVisualSkeleton.allowed === true) {
    return { ok: false, reason: "question_cannot_handoff" };
  }
  return { ok: true, envelope: parsed };
}

let cachedVisualProductSkeletonAgentRoleText = null;
function loadVisualProductSkeletonAgentRoleText() {
  if (cachedVisualProductSkeletonAgentRoleText !== null) return cachedVisualProductSkeletonAgentRoleText;
  try {
    const roleFileUrl = new URL("../../docs/operating-system/visual-product-skeleton-agent-contract-2026-06-01.md", import.meta.url);
    cachedVisualProductSkeletonAgentRoleText = readFileSync(roleFileUrl, "utf-8");
  } catch {
    cachedVisualProductSkeletonAgentRoleText = "";
  }
  return cachedVisualProductSkeletonAgentRoleText;
}

const VISUAL_PRODUCT_SKELETON_AGENT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "agentId",
    "responseSource",
    "productType",
    "firstScreen",
    "regions",
    "components",
    "hierarchy",
    "initialCopy",
    "designPlugin",
    "visualTone",
    "assumptions",
    "unknowns",
    "doNotBuildNow",
    "handoff",
  ],
  properties: {
    agentId: { type: "string", enum: ["visual-product-skeleton-agent"] },
    responseSource: { type: "string", enum: ["provider-composed"] },
    productType: { type: "string" },
    firstScreen: {
      type: "object",
      additionalProperties: false,
      required: ["name", "purpose", "primaryUser", "primaryAction"],
      properties: {
        name: { type: "string" },
        purpose: { type: "string" },
        primaryUser: { type: "string" },
        primaryAction: { type: "string" },
      },
    },
    regions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "kind", "title", "purpose", "priority", "traceToProductSkeleton", "content"],
        properties: {
          id: { type: "string" },
          kind: { type: "string" },
          title: { type: "string" },
          purpose: { type: "string" },
          priority: { type: "string", enum: ["primary", "secondary", "supporting"] },
          traceToProductSkeleton: { type: "string" },
          content: { type: "array", items: { type: "string" } },
        },
      },
    },
    components: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "type", "label", "regionId", "intent"],
        properties: {
          id: { type: "string" },
          type: { type: "string" },
          label: { type: "string" },
          regionId: { type: "string" },
          intent: { type: "string" },
        },
      },
    },
    hierarchy: {
      type: "object",
      additionalProperties: false,
      required: ["primary", "secondary", "deferred", "appearsFirst"],
      properties: {
        primary: { type: "string" },
        secondary: { type: "array", items: { type: "string" } },
        deferred: { type: "array", items: { type: "string" } },
        appearsFirst: { type: "string" },
      },
    },
    initialCopy: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["regionId", "text"],
        properties: {
          regionId: { type: "string" },
          text: { type: "string" },
        },
      },
    },
    designPlugin: {
      type: "object",
      additionalProperties: false,
      required: ["pluginId", "pluginName", "reason", "matchedBy"],
      properties: {
        pluginId: { type: "string" },
        pluginName: { type: "string" },
        reason: { type: "string" },
        matchedBy: { type: "string" },
      },
    },
    visualTone: { type: "string" },
    assumptions: { type: "array", items: { type: "string" } },
    unknowns: { type: "array", items: { type: "string" } },
    doNotBuildNow: { type: "array", items: { type: "string" } },
    handoff: {
      type: "object",
      additionalProperties: false,
      required: ["nextAgent", "nextMove"],
      properties: {
        nextAgent: { type: "string", enum: ["visual-build-agent", "project-discovery-agent"] },
        nextMove: { type: "string" },
      },
    },
  },
};

function buildVisualProductSkeletonAgentSystemPrompt() {
  const role = loadVisualProductSkeletonAgentRoleText();
  const roleBody = role && role.trim()
    ? role.trim()
    : "You are the Nexus Visual Product Skeleton Agent. Return only the canonical JSON visual skeleton envelope.";
  return [
    "You are the Nexus Visual Product Skeleton Agent. The canonical role file below is your contract.",
    "Return ONLY a JSON object matching the enforced schema. No text outside the JSON.",
    "You decide the first visible product screen, not the product structure.",
    "Use the Product Skeleton Agent output as the source of product truth.",
    "Use the selected design plugin as visual guidance only. It must not override product truth.",
    "Build one first screen. Do not create a generic dashboard, generic landing page, or fake working app.",
    "Reply in the founder's own language when writing visible names and copy.",
    "",
    "=== CANONICAL ROLE (verbatim) ===",
    roleBody,
    "=== END CANONICAL ROLE ===",
  ].join("\n");
}

function buildVisualProductSkeletonPromptPayload({
  projectGoal = "",
  productSkeletonAgentOutput = null,
  designSourceInput = null,
  userDesignPreference = "",
} = {}) {
  const designPluginSelection = resolveDesignPluginForVisualSkeletonRequest({
    productSkeletonAgentOutput,
    designSourceInput,
    userDesignPreference,
  });
  return {
    projectGoal: typeof projectGoal === "string" ? projectGoal : "",
    productSkeletonAgentOutput: productSkeletonAgentOutput && typeof productSkeletonAgentOutput === "object"
      ? productSkeletonAgentOutput
      : {},
    designPluginSelection,
    designSourceInput: designSourceInput && typeof designSourceInput === "object" ? designSourceInput : null,
    userDesignPreference: typeof userDesignPreference === "string" ? userDesignPreference : "",
  };
}

function buildOpenAiVisualProductSkeletonRequest({ model, promptPayload, intelligenceLevel = "medium" }) {
  const intelligenceProfile = resolveIntelligenceRuntimeProfile(intelligenceLevel);
  return {
    model,
    input: [
      { role: "system", content: buildVisualProductSkeletonAgentSystemPrompt() },
      { role: "user", content: JSON.stringify(promptPayload, null, 2) },
    ],
    reasoning: {
      effort: resolveDiscoveryResponseReasoningEffort(intelligenceLevel),
    },
    max_output_tokens: Math.max(intelligenceProfile.maxOutputTokens, 5000),
    text: {
      format: {
        type: "json_schema",
        name: "nexus_visual_product_skeleton_agent",
        strict: true,
        schema: VISUAL_PRODUCT_SKELETON_AGENT_JSON_SCHEMA,
      },
    },
  };
}

function parseVisualProductSkeletonEnvelope(rawText = "") {
  const trimmed = typeof rawText === "string" ? rawText.trim() : "";
  if (!trimmed) return { ok: false, reason: "empty_output" };
  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { ok: false, reason: "invalid_json" };
  }
  if (!parsed || typeof parsed !== "object") return { ok: false, reason: "not_object" };
  if (parsed.agentId !== "visual-product-skeleton-agent") return { ok: false, reason: "bad_agentId" };
  if (parsed.responseSource !== "provider-composed") return { ok: false, reason: "bad_responseSource" };
  if (typeof parsed.productType !== "string" || !parsed.productType.trim()) return { ok: false, reason: "missing_productType" };
  const firstScreen = parsed.firstScreen;
  if (!firstScreen || typeof firstScreen !== "object"
      || typeof firstScreen.name !== "string" || !firstScreen.name.trim()
      || typeof firstScreen.purpose !== "string" || !firstScreen.purpose.trim()
      || typeof firstScreen.primaryUser !== "string" || !firstScreen.primaryUser.trim()
      || typeof firstScreen.primaryAction !== "string" || !firstScreen.primaryAction.trim()) {
    return { ok: false, reason: "bad_firstScreen" };
  }
  if (!Array.isArray(parsed.regions) || parsed.regions.length === 0) return { ok: false, reason: "bad_regions" };
  if (!Array.isArray(parsed.components)) return { ok: false, reason: "bad_components" };
  if (!parsed.hierarchy || typeof parsed.hierarchy !== "object" || typeof parsed.hierarchy.primary !== "string" || !parsed.hierarchy.primary.trim()) {
    return { ok: false, reason: "bad_hierarchy" };
  }
  if (!Array.isArray(parsed.initialCopy)) return { ok: false, reason: "bad_initialCopy" };
  if (!parsed.designPlugin || typeof parsed.designPlugin !== "object" || typeof parsed.designPlugin.reason !== "string" || !parsed.designPlugin.reason.trim()) {
    return { ok: false, reason: "bad_designPlugin" };
  }
  if (typeof parsed.visualTone !== "string" || !parsed.visualTone.trim()) return { ok: false, reason: "bad_visualTone" };
  if (!Array.isArray(parsed.assumptions) || !Array.isArray(parsed.unknowns) || !Array.isArray(parsed.doNotBuildNow)) {
    return { ok: false, reason: "bad_boundary_arrays" };
  }
  if (!parsed.handoff || typeof parsed.handoff !== "object" || typeof parsed.handoff.nextAgent !== "string" || typeof parsed.handoff.nextMove !== "string") {
    return { ok: false, reason: "bad_handoff" };
  }
  return { ok: true, envelope: parsed };
}

export class OnboardingProviderClient {
  constructor({
    fetchImpl = globalThis.fetch,
    openAiApiKey = process.env.OPENAI_API_KEY ?? "",
    openAiModel = process.env.OPENAI_ONBOARDING_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-5-mini",
    anthropicApiKey = process.env.ANTHROPIC_API_KEY ?? "",
    anthropicModel = process.env.ANTHROPIC_ONBOARDING_MODEL ?? process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest",
    timeoutMs = Number(process.env.OPENAI_ONBOARDING_TIMEOUT_MS ?? 30000),
    maxRetries = Number(process.env.OPENAI_ONBOARDING_MAX_RETRIES ?? 2),
    retryDelayMs = Number(process.env.OPENAI_ONBOARDING_RETRY_DELAY_MS ?? 700),
  } = {}) {
    this.fetchImpl = fetchImpl;
    this.openAiApiKey = typeof openAiApiKey === "string" ? openAiApiKey.trim() : "";
    this.openAiModel = openAiModel;
    this.anthropicApiKey = typeof anthropicApiKey === "string" ? anthropicApiKey.trim() : "";
    this.anthropicModel = anthropicModel;
    this.timeoutMs = timeoutMs;
    this.maxRetries = maxRetries;
    this.retryDelayMs = retryDelayMs;
  }

  getProviderAvailability(providerId) {
    if (providerId === "openai") {
      return this.openAiApiKey
        ? { providerId, availabilityStatus: "ready", availabilityReason: null }
        : { providerId, availabilityStatus: "missing-key", availabilityReason: "OPENAI_API_KEY" };
    }

    if (providerId === "anthropic") {
      return this.anthropicApiKey
        ? { providerId, availabilityStatus: "ready", availabilityReason: null }
        : { providerId, availabilityStatus: "missing-key", availabilityReason: "ANTHROPIC_API_KEY" };
    }

    return { providerId, availabilityStatus: "unsupported", availabilityReason: "unsupported-provider" };
  }

  buildProviderExecutionOrder(primaryProviderId = "openai") {
    const normalizedPrimaryProviderId = typeof primaryProviderId === "string" && primaryProviderId.trim()
      ? primaryProviderId.trim().toLowerCase()
      : "openai";
    return [normalizedPrimaryProviderId, "openai", "anthropic"].filter((providerId, index, list) => list.indexOf(providerId) === index);
  }

  shouldInjectQaFault({
    qaFaultMode = null,
    providerOrderIndex = 0,
    attemptIndex = 0,
  } = {}) {
    if (qaFaultMode === "retry-once") {
      return providerOrderIndex === 0 && attemptIndex === 0;
    }
    if (qaFaultMode === "primary-outage") {
      return providerOrderIndex === 0;
    }
    if (qaFaultMode === "rate-limit-all") {
      return true;
    }
    return false;
  }

  async executeWithRecovery({
    providerId = "openai",
    qaFaultMode = null,
    onStatus = async () => {},
    executor = async () => ({}),
  } = {}) {
    const providerOrder = this.buildProviderExecutionOrder(providerId);
    const providerTrail = [];

    for (let providerOrderIndex = 0; providerOrderIndex < providerOrder.length; providerOrderIndex += 1) {
      const activeProviderId = providerOrder[providerOrderIndex];
      const availability = this.getProviderAvailability(activeProviderId);
      if (availability.availabilityStatus !== "ready") {
        const unavailableResult = {
          status: "unavailable",
          providerId: activeProviderId,
          availability,
          deliveryMode: "shell",
          attempts: [],
          error: {
            code: availability.availabilityReason ?? "provider_unavailable",
            status: null,
          },
        };
        providerTrail.push({
          providerId: activeProviderId,
          status: "unavailable",
          attempts: [],
          error: unavailableResult.error,
        });
        if (providerOrderIndex < providerOrder.length - 1) {
          const nextProviderId = providerOrder[providerOrderIndex + 1];
          await onStatus({
            type: "provider-failover",
            fromProviderId: activeProviderId,
            toProviderId: nextProviderId,
            reason: unavailableResult.error.code,
            resetPartial: true,
          });
          continue;
        }
        return {
          ...unavailableResult,
          ...buildRecoveryMetadata({
            primaryProviderId: providerId,
            finalResult: unavailableResult,
            providerTrail,
          }),
        };
      }

      const result = await executor({
        providerId: activeProviderId,
        availability,
        providerOrderIndex,
        qaFaultMode,
        onStatus,
      });

      providerTrail.push({
        providerId: activeProviderId,
        status: result.status ?? "failed",
        attempts: Array.isArray(result.attempts) ? result.attempts : [],
        error: result.error ?? null,
      });

      if (result.status === "completed") {
        return {
          ...result,
          ...buildRecoveryMetadata({
            primaryProviderId: providerId,
            finalResult: result,
            providerTrail,
          }),
        };
      }

      if (providerOrderIndex < providerOrder.length - 1) {
        const nextProviderId = providerOrder[providerOrderIndex + 1];
        await onStatus({
          type: "provider-failover",
          fromProviderId: activeProviderId,
          toProviderId: nextProviderId,
          reason: result.error?.code ?? result.availability?.availabilityReason ?? "provider_failed",
          resetPartial: true,
        });
        continue;
      }

      return {
        ...result,
        ...buildRecoveryMetadata({
          primaryProviderId: providerId,
          finalResult: result,
          providerTrail,
        }),
      };
    }

    const fallbackResult = {
      status: "failed",
      providerId,
      deliveryMode: "shell",
      attempts: [],
      error: {
        code: "provider_recovery_exhausted",
        status: null,
      },
    };
    return {
      ...fallbackResult,
      ...buildRecoveryMetadata({
        primaryProviderId: providerId,
        finalResult: fallbackResult,
        providerTrail,
      }),
    };
  }

  async generateNextQuestion({
    providerId = "openai",
    modelFamilyId = "balanced",
    intelligenceLevel = "medium",
    projectGoal = "",
    projectType = "unknown",
    summary = null,
    question = null,
    transcript = [],
    qaFaultMode = null,
    onStatus = async () => {},
  } = {}) {
    const promptPayload = buildPromptPayload({
      projectGoal,
      projectType,
      summary,
      question,
      recentTranscript: buildRecentTranscript(transcript),
    });

    return await this.executeWithRecovery({
      providerId,
      qaFaultMode,
      onStatus,
      executor: async ({ providerId: activeProviderId, availability, providerOrderIndex }) => {
        if (activeProviderId === "anthropic") {
          return await this.generateAnthropicNextQuestion({
            providerId: activeProviderId,
            availability,
            promptPayload,
            modelFamilyId,
            intelligenceLevel,
            providerOrderIndex,
            qaFaultMode,
            onStatus,
          });
        }

        return await this.generateOpenAiNextQuestion({
          providerId: activeProviderId,
          availability,
          promptPayload,
          modelFamilyId,
          intelligenceLevel,
          providerOrderIndex,
          qaFaultMode,
          onStatus,
        });
      },
    });
  }

  async generateDiscoveryResponse({
    providerId = "openai",
    modelFamilyId = "balanced",
    intelligenceLevel = "medium",
    projectGoal = "",
    projectType = "unknown",
    summary = null,
    transcript = [],
    responsePolicy = null,
    qaFaultMode = null,
    onStatus = async () => {},
  } = {}) {
    const promptPayload = buildDiscoveryResponsePayload({
      projectGoal,
      projectType,
      summary,
      responsePolicy,
      recentTranscript: buildRecentTranscript(transcript),
    });

    return await this.executeWithRecovery({
      providerId,
      qaFaultMode,
      onStatus,
      executor: async ({ providerId: activeProviderId, availability, providerOrderIndex }) => {
        if (activeProviderId === "anthropic") {
          return await this.generateAnthropicDiscoveryResponse({
            providerId: activeProviderId,
            availability,
            promptPayload,
            modelFamilyId,
            intelligenceLevel,
            providerOrderIndex,
            qaFaultMode,
            onStatus,
          });
        }

        return await this.generateOpenAiDiscoveryResponse({
          providerId: activeProviderId,
          availability,
          promptPayload,
          modelFamilyId,
          intelligenceLevel,
          providerOrderIndex,
          qaFaultMode,
          onStatus,
        });
      },
    });
  }

  async generateCompanionReply({
    providerId = "openai",
    modelFamilyId = "balanced",
    intelligenceLevel = "medium",
    projectName = "",
    projectGoal = "",
    projectType = "unknown",
    currentSurface = "workspace",
    understoodItems = [],
    missingItems = [],
    transcript = [],
    userMessage = "",
    learningInstructions = null,
    buildAgentTurn = null,
    qaFaultMode = null,
    onStatus = async () => {},
  } = {}) {
    const promptPayload = buildCompanionPromptPayload({
      projectName,
      projectGoal,
      projectType,
      currentSurface,
      understoodItems,
      missingItems,
      recentTranscript: buildRecentTranscript(transcript),
      userMessage,
      learningInstructions,
      buildAgentTurn,
    });

    return await this.executeWithRecovery({
      providerId,
      qaFaultMode,
      onStatus,
      executor: async ({ providerId: activeProviderId, availability, providerOrderIndex }) => {
        if (activeProviderId === "anthropic") {
          return await this.generateAnthropicCompanionReply({
            providerId: activeProviderId,
            availability,
            promptPayload,
            modelFamilyId,
            intelligenceLevel,
            providerOrderIndex,
            qaFaultMode,
            onStatus,
          });
        }

        return await this.generateOpenAiCompanionReply({
          providerId: activeProviderId,
          availability,
          promptPayload,
          modelFamilyId,
          intelligenceLevel,
          providerOrderIndex,
          qaFaultMode,
          onStatus,
        });
      },
    });
  }

  async generateOpenAiNextQuestion({ providerId, availability, promptPayload, modelFamilyId = "balanced", intelligenceLevel = "medium", providerOrderIndex = 0, qaFaultMode = null, onStatus = async () => {} }) {
    const attempts = [];
    let lastError = null;
    const selectedModel = resolveOnboardingModelFamily(providerId, modelFamilyId).runtimeModelId;

    for (let attemptIndex = 0; attemptIndex <= this.maxRetries; attemptIndex += 1) {
      const attemptStartedAt = Date.now();
      const { signal, cleanup } = createAbortSignal(this.timeoutMs);
      try {
        if (this.shouldInjectQaFault({ qaFaultMode, providerOrderIndex, attemptIndex })) {
          throw createSyntheticProviderError(
            qaFaultMode === "primary-outage"
              ? "qa_primary_provider_outage"
              : qaFaultMode === "rate-limit-all"
                ? "qa_rate_limited_all_providers"
                : "qa_retryable_provider_failure",
            qaFaultMode === "rate-limit-all"
              ? { status: 429, retryable: true }
              : {},
          );
        }
        const response = await this.fetchImpl("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: buildOpenAiHeaders(this.openAiApiKey),
          body: JSON.stringify(buildOpenAiJsonRequest({
            model: selectedModel,
            promptPayload,
            intelligenceLevel,
          })),
          signal,
        });

        const retryable = response.status === 429 || response.status >= 500;
        if (!response.ok) {
          const error = new Error(`openai_status_${response.status}`);
          error.status = response.status;
          error.retryAfterSeconds = parseRetryAfterSeconds(response.headers);
          throw Object.assign(error, { retryable });
        }

        const payload = await response.json();
        const parsed = JSON.parse(extractOutputText(payload) || "{}");
        const nextQuestion = typeof parsed.nextQuestion === "string" ? parsed.nextQuestion.trim() : "";
        if (!nextQuestion) {
          throw Object.assign(new Error("openai_empty_question"), { retryable: false });
        }

        attempts.push({
          attemptIndex,
          status: "completed",
          durationMs: Date.now() - attemptStartedAt,
        });

        return {
          status: "completed",
          providerId,
          availability,
          deliveryMode: "live-api",
          model: payload.model ?? selectedModel,
          requestId: payload.id ?? null,
          nextQuestion,
          usage: normalizeUsage(payload.usage),
          ...estimateUsageCostUsd({
            providerId,
            usage: normalizeUsage(payload.usage),
          }),
          attempts,
        };
      } catch (error) {
        lastError = error;
        attempts.push({
          attemptIndex,
          status: "failed",
          durationMs: Date.now() - attemptStartedAt,
          error: error?.message ?? "provider_error",
        });

        const retryable = error?.retryable === true
          || error?.status === 429
          || error?.status >= 500
          || error?.name === "AbortError"
          || error?.message === "onboarding_provider_timeout";
        if (!retryable || attemptIndex >= this.maxRetries) {
          break;
        }
        const retryDelayMs = this.retryDelayMs * (attemptIndex + 1);
        await onStatus({
          type: "provider-retry",
          providerId,
          failedAttemptNumber: attemptIndex + 1,
          nextAttemptNumber: attemptIndex + 2,
          maxAttemptCount: this.maxRetries + 1,
          delayMs: retryDelayMs,
          reason: error?.message ?? "provider_error",
          resetPartial: true,
        });
        await sleep(retryDelayMs);
      } finally {
        cleanup();
      }
    }

    return {
      status: "failed",
      providerId,
      availability,
      deliveryMode: "shell",
      attempts,
      error: {
        ...classifyProviderError(lastError),
      },
    };
  }

  async generateAnthropicNextQuestion({ providerId, availability, promptPayload, modelFamilyId = "balanced", intelligenceLevel = "medium", providerOrderIndex = 0, qaFaultMode = null, onStatus = async () => {} }) {
    const attempts = [];
    let lastError = null;
    const selectedModel = resolveOnboardingModelFamily(providerId, modelFamilyId).runtimeModelId;

    for (let attemptIndex = 0; attemptIndex <= this.maxRetries; attemptIndex += 1) {
      const attemptStartedAt = Date.now();
      const { signal, cleanup } = createAbortSignal(this.timeoutMs);
      try {
        if (this.shouldInjectQaFault({ qaFaultMode, providerOrderIndex, attemptIndex })) {
          throw createSyntheticProviderError(
            qaFaultMode === "primary-outage"
              ? "qa_primary_provider_outage"
              : qaFaultMode === "rate-limit-all"
                ? "qa_rate_limited_all_providers"
                : "qa_retryable_provider_failure",
            qaFaultMode === "rate-limit-all"
              ? { status: 429, retryable: true }
              : {},
          );
        }
        const response = await this.fetchImpl("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: buildAnthropicHeaders(this.anthropicApiKey),
          body: JSON.stringify(buildAnthropicRequest({
            model: selectedModel,
            promptPayload,
            intelligenceLevel,
            stream: false,
          })),
          signal,
        });

        const retryable = response.status === 429 || response.status >= 500;
        if (!response.ok) {
          const error = new Error(`anthropic_status_${response.status}`);
          error.status = response.status;
          error.retryAfterSeconds = parseRetryAfterSeconds(response.headers);
          throw Object.assign(error, { retryable });
        }

        const payload = await response.json();
        const content = Array.isArray(payload.content) ? payload.content : [];
        const nextQuestion = content
          .map((part) => (typeof part?.text === "string" ? part.text.trim() : ""))
          .filter(Boolean)
          .join("\n")
          .trim();
        if (!nextQuestion) {
          throw Object.assign(new Error("anthropic_empty_question"), { retryable: false });
        }

        attempts.push({
          attemptIndex,
          status: "completed",
          durationMs: Date.now() - attemptStartedAt,
        });

        return {
          status: "completed",
          providerId,
          availability,
          deliveryMode: "live-api",
          model: payload.model ?? selectedModel,
          requestId: payload.id ?? null,
          nextQuestion,
          usage: normalizeAnthropicUsage(payload.usage),
          ...estimateUsageCostUsd({
            providerId,
            usage: normalizeAnthropicUsage(payload.usage),
          }),
          attempts,
        };
      } catch (error) {
        lastError = error;
        attempts.push({
          attemptIndex,
          status: "failed",
          durationMs: Date.now() - attemptStartedAt,
          error: error?.message ?? "provider_error",
        });

        const retryable = error?.retryable === true
          || error?.status === 429
          || error?.status >= 500
          || error?.name === "AbortError"
          || error?.message === "onboarding_provider_timeout";
        if (!retryable || attemptIndex >= this.maxRetries) {
          break;
        }
        const retryDelayMs = this.retryDelayMs * (attemptIndex + 1);
        await onStatus({
          type: "provider-retry",
          providerId,
          failedAttemptNumber: attemptIndex + 1,
          nextAttemptNumber: attemptIndex + 2,
          maxAttemptCount: this.maxRetries + 1,
          delayMs: retryDelayMs,
          reason: error?.message ?? "provider_error",
          resetPartial: true,
        });
        await sleep(retryDelayMs);
      } finally {
        cleanup();
      }
    }

    return {
      status: "failed",
      providerId,
      availability,
      deliveryMode: "shell",
      attempts,
      error: {
        ...classifyProviderError(lastError),
      },
    };
  }

  async generateOpenAiDiscoveryResponse({ providerId, availability, promptPayload, modelFamilyId = "balanced", intelligenceLevel = "medium", providerOrderIndex = 0, qaFaultMode = null, onStatus = async () => {} }) {
    const attempts = [];
    let lastError = null;
    const selectedModel = resolveOnboardingModelFamily(providerId, modelFamilyId).runtimeModelId;

    for (let attemptIndex = 0; attemptIndex <= this.maxRetries; attemptIndex += 1) {
      const attemptStartedAt = Date.now();
      const { signal, cleanup } = createAbortSignal(this.timeoutMs);
      try {
        if (this.shouldInjectQaFault({ qaFaultMode, providerOrderIndex, attemptIndex })) {
          throw createSyntheticProviderError(
            qaFaultMode === "primary-outage"
              ? "qa_primary_provider_outage"
              : qaFaultMode === "rate-limit-all"
                ? "qa_rate_limited_all_providers"
                : "qa_retryable_provider_failure",
            qaFaultMode === "rate-limit-all" ? { status: 429, retryable: true } : {},
          );
        }
        const response = await this.fetchImpl("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: buildOpenAiHeaders(this.openAiApiKey),
          body: JSON.stringify(buildOpenAiDiscoveryResponseRequest({
            model: selectedModel,
            promptPayload,
            intelligenceLevel,
          })),
          signal,
        });

        const retryable = response.status === 429 || response.status >= 500;
        if (!response.ok) {
          const error = new Error(`openai_status_${response.status}`);
          error.status = response.status;
          error.retryAfterSeconds = parseRetryAfterSeconds(response.headers);
          throw Object.assign(error, { retryable });
        }

        const payload = await response.json();
        const parsed = JSON.parse(extractOutputText(payload) || "{}");
        const agentResponse = typeof parsed.agentResponse === "string" ? parsed.agentResponse.trim() : "";
        if (!agentResponse) {
          throw Object.assign(new Error("openai_empty_discovery_response"), { retryable: false });
        }

        attempts.push({
          attemptIndex,
          status: "completed",
          durationMs: Date.now() - attemptStartedAt,
        });

        return {
          status: "completed",
          providerId,
          availability,
          deliveryMode: "live-api",
          model: payload.model ?? selectedModel,
          requestId: payload.id ?? null,
          agentResponse,
          usage: normalizeUsage(payload.usage),
          ...estimateUsageCostUsd({
            providerId,
            usage: normalizeUsage(payload.usage),
          }),
          attempts,
        };
      } catch (error) {
        lastError = error;
        attempts.push({
          attemptIndex,
          status: "failed",
          durationMs: Date.now() - attemptStartedAt,
          error: error?.message ?? "provider_error",
        });

        const retryable = error?.retryable === true
          || error?.status === 429
          || error?.status >= 500
          || error?.name === "AbortError"
          || error?.message === "onboarding_provider_timeout";
        if (!retryable || attemptIndex >= this.maxRetries) {
          break;
        }
        const retryDelayMs = this.retryDelayMs * (attemptIndex + 1);
        await onStatus({
          type: "provider-retry",
          providerId,
          failedAttemptNumber: attemptIndex + 1,
          nextAttemptNumber: attemptIndex + 2,
          maxAttemptCount: this.maxRetries + 1,
          delayMs: retryDelayMs,
          reason: error?.message ?? "provider_error",
          resetPartial: true,
        });
        await sleep(retryDelayMs);
      } finally {
        cleanup();
      }
    }

    return {
      status: "failed",
      providerId,
      availability,
      deliveryMode: "shell",
      attempts,
      error: {
        ...classifyProviderError(lastError),
      },
    };
  }

  async generateAnthropicDiscoveryResponse({ providerId, availability, promptPayload, modelFamilyId = "balanced", intelligenceLevel = "medium", providerOrderIndex = 0, qaFaultMode = null, onStatus = async () => {} }) {
    const attempts = [];
    let lastError = null;
    const selectedModel = resolveOnboardingModelFamily(providerId, modelFamilyId).runtimeModelId;

    for (let attemptIndex = 0; attemptIndex <= this.maxRetries; attemptIndex += 1) {
      const attemptStartedAt = Date.now();
      const { signal, cleanup } = createAbortSignal(this.timeoutMs);
      try {
        if (this.shouldInjectQaFault({ qaFaultMode, providerOrderIndex, attemptIndex })) {
          throw createSyntheticProviderError(
            qaFaultMode === "primary-outage"
              ? "qa_primary_provider_outage"
              : qaFaultMode === "rate-limit-all"
                ? "qa_rate_limited_all_providers"
                : "qa_retryable_provider_failure",
            qaFaultMode === "rate-limit-all" ? { status: 429, retryable: true } : {},
          );
        }
        const response = await this.fetchImpl("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: buildAnthropicHeaders(this.anthropicApiKey),
          body: JSON.stringify(buildAnthropicDiscoveryResponseRequest({
            model: selectedModel,
            promptPayload,
            intelligenceLevel,
          })),
          signal,
        });

        const retryable = response.status === 429 || response.status >= 500;
        if (!response.ok) {
          const error = new Error(`anthropic_status_${response.status}`);
          error.status = response.status;
          error.retryAfterSeconds = parseRetryAfterSeconds(response.headers);
          throw Object.assign(error, { retryable });
        }

        const payload = await response.json();
        const content = Array.isArray(payload.content) ? payload.content : [];
        const text = content
          .map((part) => (typeof part?.text === "string" ? part.text.trim() : ""))
          .filter(Boolean)
          .join("\n")
          .trim();
        const parsed = JSON.parse(text || "{}");
        const agentResponse = typeof parsed.agentResponse === "string" ? parsed.agentResponse.trim() : "";
        if (!agentResponse) {
          throw Object.assign(new Error("anthropic_empty_discovery_response"), { retryable: false });
        }

        attempts.push({
          attemptIndex,
          status: "completed",
          durationMs: Date.now() - attemptStartedAt,
        });

        return {
          status: "completed",
          providerId,
          availability,
          deliveryMode: "live-api",
          model: payload.model ?? selectedModel,
          requestId: payload.id ?? null,
          agentResponse,
          usage: normalizeAnthropicUsage(payload.usage),
          ...estimateUsageCostUsd({
            providerId,
            usage: normalizeAnthropicUsage(payload.usage),
          }),
          attempts,
        };
      } catch (error) {
        lastError = error;
        attempts.push({
          attemptIndex,
          status: "failed",
          durationMs: Date.now() - attemptStartedAt,
          error: error?.message ?? "provider_error",
        });

        const retryable = error?.retryable === true
          || error?.status === 429
          || error?.status >= 500
          || error?.name === "AbortError"
          || error?.message === "onboarding_provider_timeout";
        if (!retryable || attemptIndex >= this.maxRetries) {
          break;
        }
        const retryDelayMs = this.retryDelayMs * (attemptIndex + 1);
        await onStatus({
          type: "provider-retry",
          providerId,
          failedAttemptNumber: attemptIndex + 1,
          nextAttemptNumber: attemptIndex + 2,
          maxAttemptCount: this.maxRetries + 1,
          delayMs: retryDelayMs,
          reason: error?.message ?? "provider_error",
          resetPartial: true,
        });
        await sleep(retryDelayMs);
      } finally {
        cleanup();
      }
    }

    return {
      status: "failed",
      providerId,
      availability,
      deliveryMode: "shell",
      attempts,
      error: {
        ...classifyProviderError(lastError),
      },
    };
  }

  async generateOpenAiCompanionReply({ providerId, availability, promptPayload, modelFamilyId = "balanced", intelligenceLevel = "medium", providerOrderIndex = 0, qaFaultMode = null, onStatus = async () => {} }) {
    const attempts = [];
    let lastError = null;
    const selectedModel = resolveOnboardingModelFamily(providerId, modelFamilyId).runtimeModelId;

    for (let attemptIndex = 0; attemptIndex <= this.maxRetries; attemptIndex += 1) {
      const attemptStartedAt = Date.now();
      const { signal, cleanup } = createAbortSignal(this.timeoutMs);
      try {
        if (this.shouldInjectQaFault({ qaFaultMode, providerOrderIndex, attemptIndex })) {
          throw createSyntheticProviderError(
            qaFaultMode === "primary-outage"
              ? "qa_primary_provider_outage"
              : qaFaultMode === "rate-limit-all"
                ? "qa_rate_limited_all_providers"
                : "qa_retryable_provider_failure",
            qaFaultMode === "rate-limit-all"
              ? { status: 429, retryable: true }
              : {},
          );
        }
        const response = await this.fetchImpl("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: buildOpenAiHeaders(this.openAiApiKey),
          body: JSON.stringify(buildOpenAiCompanionRequest({
            model: selectedModel,
            promptPayload,
            intelligenceLevel,
          })),
          signal,
        });

        const retryable = response.status === 429 || response.status >= 500;
        if (!response.ok) {
          const error = new Error(`openai_status_${response.status}`);
          error.status = response.status;
          error.retryAfterSeconds = parseRetryAfterSeconds(response.headers);
          throw Object.assign(error, { retryable });
        }

        const payload = await response.json();
        const reply = extractOutputText(payload);
        if (!reply) {
          throw Object.assign(new Error("openai_empty_companion_reply"), { retryable: false });
        }

        attempts.push({
          attemptIndex,
          status: "completed",
          durationMs: Date.now() - attemptStartedAt,
        });

        return {
          status: "completed",
          providerId,
          availability,
          deliveryMode: "live-api",
          model: payload.model ?? selectedModel,
          requestId: payload.id ?? null,
          reply,
          usage: normalizeUsage(payload.usage),
          ...estimateUsageCostUsd({
            providerId,
            usage: normalizeUsage(payload.usage),
          }),
          attempts,
        };
      } catch (error) {
        lastError = error;
        attempts.push({
          attemptIndex,
          status: "failed",
          durationMs: Date.now() - attemptStartedAt,
          error: error?.message ?? "provider_error",
        });

        const retryable = error?.retryable === true
          || error?.status === 429
          || error?.status >= 500
          || error?.name === "AbortError"
          || error?.message === "onboarding_provider_timeout";
        if (!retryable || attemptIndex >= this.maxRetries) {
          break;
        }
        const retryDelayMs = this.retryDelayMs * (attemptIndex + 1);
        await onStatus({
          type: "provider-retry",
          providerId,
          failedAttemptNumber: attemptIndex + 1,
          nextAttemptNumber: attemptIndex + 2,
          maxAttemptCount: this.maxRetries + 1,
          delayMs: retryDelayMs,
          reason: error?.message ?? "provider_error",
          resetPartial: true,
        });
        await sleep(retryDelayMs);
      } finally {
        cleanup();
      }
    }

    return {
      status: "failed",
      providerId,
      availability,
      deliveryMode: "shell",
      attempts,
      error: {
        ...classifyProviderError(lastError),
      },
    };
  }

  async generateAnthropicCompanionReply({ providerId, availability, promptPayload, modelFamilyId = "balanced", intelligenceLevel = "medium", providerOrderIndex = 0, qaFaultMode = null, onStatus = async () => {} }) {
    const attempts = [];
    let lastError = null;
    const selectedModel = resolveOnboardingModelFamily(providerId, modelFamilyId).runtimeModelId;

    for (let attemptIndex = 0; attemptIndex <= this.maxRetries; attemptIndex += 1) {
      const attemptStartedAt = Date.now();
      const { signal, cleanup } = createAbortSignal(this.timeoutMs);
      try {
        if (this.shouldInjectQaFault({ qaFaultMode, providerOrderIndex, attemptIndex })) {
          throw createSyntheticProviderError(
            qaFaultMode === "primary-outage"
              ? "qa_primary_provider_outage"
              : qaFaultMode === "rate-limit-all"
                ? "qa_rate_limited_all_providers"
                : "qa_retryable_provider_failure",
            qaFaultMode === "rate-limit-all"
              ? { status: 429, retryable: true }
              : {},
          );
        }
        const response = await this.fetchImpl("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: buildAnthropicHeaders(this.anthropicApiKey),
          body: JSON.stringify(buildAnthropicCompanionRequest({
            model: selectedModel,
            promptPayload,
            intelligenceLevel,
          })),
          signal,
        });

        const retryable = response.status === 429 || response.status >= 500;
        if (!response.ok) {
          const error = new Error(`anthropic_status_${response.status}`);
          error.status = response.status;
          error.retryAfterSeconds = parseRetryAfterSeconds(response.headers);
          throw Object.assign(error, { retryable });
        }

        const payload = await response.json();
        const reply = normalizeArray(payload.content)
          .map((part) => (typeof part?.text === "string" ? part.text.trim() : ""))
          .filter(Boolean)
          .join("\n")
          .trim();
        if (!reply) {
          throw Object.assign(new Error("anthropic_empty_companion_reply"), { retryable: false });
        }

        attempts.push({
          attemptIndex,
          status: "completed",
          durationMs: Date.now() - attemptStartedAt,
        });

        return {
          status: "completed",
          providerId,
          availability,
          deliveryMode: "live-api",
          model: payload.model ?? selectedModel,
          requestId: payload.id ?? null,
          reply,
          usage: normalizeAnthropicUsage(payload.usage),
          ...estimateUsageCostUsd({
            providerId,
            usage: normalizeAnthropicUsage(payload.usage),
          }),
          attempts,
        };
      } catch (error) {
        lastError = error;
        attempts.push({
          attemptIndex,
          status: "failed",
          durationMs: Date.now() - attemptStartedAt,
          error: error?.message ?? "provider_error",
        });

        const retryable = error?.retryable === true
          || error?.status === 429
          || error?.status >= 500
          || error?.name === "AbortError"
          || error?.message === "onboarding_provider_timeout";
        if (!retryable || attemptIndex >= this.maxRetries) {
          break;
        }
        const retryDelayMs = this.retryDelayMs * (attemptIndex + 1);
        await onStatus({
          type: "provider-retry",
          providerId,
          failedAttemptNumber: attemptIndex + 1,
          nextAttemptNumber: attemptIndex + 2,
          maxAttemptCount: this.maxRetries + 1,
          delayMs: retryDelayMs,
          reason: error?.message ?? "provider_error",
          resetPartial: true,
        });
        await sleep(retryDelayMs);
      } finally {
        cleanup();
      }
    }

    return {
      status: "failed",
      providerId,
      availability,
      deliveryMode: "shell",
      attempts,
      error: {
        ...classifyProviderError(lastError),
      },
    };
  }

  async streamNextQuestion({
    providerId = "openai",
    modelFamilyId = "balanced",
    intelligenceLevel = "medium",
    projectGoal = "",
    projectType = "unknown",
    summary = null,
    question = null,
    transcript = [],
    onDelta = async () => {},
    qaFaultMode = null,
    onStatus = async () => {},
  } = {}) {
    const promptPayload = buildPromptPayload({
      projectGoal,
      projectType,
      summary,
      question,
      recentTranscript: buildRecentTranscript(transcript),
    });

    return await this.executeWithRecovery({
      providerId,
      qaFaultMode,
      onStatus,
      executor: async ({ providerId: activeProviderId, availability, providerOrderIndex }) => {
        if (activeProviderId === "anthropic") {
          return await this.streamAnthropicNextQuestion({
            providerId: activeProviderId,
            availability,
            promptPayload,
            modelFamilyId,
            intelligenceLevel,
            onDelta,
            providerOrderIndex,
            qaFaultMode,
            onStatus,
          });
        }

        return await this.streamOpenAiNextQuestion({
          providerId: activeProviderId,
          availability,
          promptPayload,
          modelFamilyId,
          intelligenceLevel,
          onDelta,
          providerOrderIndex,
          qaFaultMode,
          onStatus,
        });
      },
    });
  }

  async streamOpenAiNextQuestion({ providerId, availability, promptPayload, modelFamilyId = "balanced", intelligenceLevel = "medium", onDelta, providerOrderIndex = 0, qaFaultMode = null, onStatus = async () => {} }) {
    const attempts = [];
    let lastError = null;
    const selectedModel = resolveOnboardingModelFamily(providerId, modelFamilyId).runtimeModelId;

    for (let attemptIndex = 0; attemptIndex <= this.maxRetries; attemptIndex += 1) {
      const attemptStartedAt = Date.now();
      const { signal, cleanup } = createAbortSignal(this.timeoutMs);
      let nextQuestion = "";
      let requestId = null;
      let model = selectedModel;
      let usage = null;
      try {
        if (this.shouldInjectQaFault({ qaFaultMode, providerOrderIndex, attemptIndex })) {
          throw createSyntheticProviderError(
            qaFaultMode === "primary-outage"
              ? "qa_primary_provider_outage"
              : qaFaultMode === "rate-limit-all"
                ? "qa_rate_limited_all_providers"
                : "qa_retryable_provider_failure",
            qaFaultMode === "rate-limit-all"
              ? { status: 429, retryable: true }
              : {},
          );
        }
        const response = await this.fetchImpl("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: buildOpenAiHeaders(this.openAiApiKey),
          body: JSON.stringify(buildOpenAiStreamingRequest({
            model: selectedModel,
            promptPayload,
            intelligenceLevel,
          })),
          signal,
        });

        const retryable = response.status === 429 || response.status >= 500;
        if (!response.ok) {
          const error = new Error(`openai_status_${response.status}`);
          error.status = response.status;
          error.retryAfterSeconds = parseRetryAfterSeconds(response.headers);
          throw Object.assign(error, { retryable });
        }

        await consumeSseStream(response, async (event) => {
          if (event?.type === "response.output_text.delta" && typeof event.delta === "string" && event.delta) {
            nextQuestion += event.delta;
            await onDelta(event.delta, { providerId });
            return;
          }

          if (event?.type === "response.completed") {
            requestId = event.response?.id ?? requestId;
            model = event.response?.model ?? model;
            usage = normalizeUsage(event.response?.usage);
          }
        });

        nextQuestion = nextQuestion.trim();
        if (!nextQuestion) {
          throw Object.assign(new Error("openai_empty_stream_question"), { retryable: false });
        }

        attempts.push({
          attemptIndex,
          status: "completed",
          durationMs: Date.now() - attemptStartedAt,
        });

        return {
          status: "completed",
          providerId,
          availability,
          deliveryMode: "live-api",
          model,
          requestId,
          nextQuestion,
          usage: usage ?? normalizeUsage({}),
          ...estimateUsageCostUsd({
            providerId,
            usage: usage ?? normalizeUsage({}),
          }),
          attempts,
        };
      } catch (error) {
        lastError = error;
        attempts.push({
          attemptIndex,
          status: "failed",
          durationMs: Date.now() - attemptStartedAt,
          error: error?.message ?? "provider_error",
        });

        const retryable = error?.retryable === true
          || error?.status === 429
          || error?.status >= 500
          || error?.name === "AbortError"
          || error?.message === "onboarding_provider_timeout";
        if (!retryable || attemptIndex >= this.maxRetries) {
          break;
        }
        const retryDelayMs = this.retryDelayMs * (attemptIndex + 1);
        await onStatus({
          type: "provider-retry",
          providerId,
          failedAttemptNumber: attemptIndex + 1,
          nextAttemptNumber: attemptIndex + 2,
          maxAttemptCount: this.maxRetries + 1,
          delayMs: retryDelayMs,
          reason: error?.message ?? "provider_error",
          resetPartial: true,
        });
        await sleep(retryDelayMs);
      } finally {
        cleanup();
      }
    }

    return {
      status: "failed",
      providerId,
      availability,
      deliveryMode: "shell",
      attempts,
      error: {
        ...classifyProviderError(lastError),
      },
    };
  }

  async streamAnthropicNextQuestion({ providerId, availability, promptPayload, modelFamilyId = "balanced", intelligenceLevel = "medium", onDelta, providerOrderIndex = 0, qaFaultMode = null, onStatus = async () => {} }) {
    const attempts = [];
    let lastError = null;
    const selectedModel = resolveOnboardingModelFamily(providerId, modelFamilyId).runtimeModelId;

    for (let attemptIndex = 0; attemptIndex <= this.maxRetries; attemptIndex += 1) {
      const attemptStartedAt = Date.now();
      const { signal, cleanup } = createAbortSignal(this.timeoutMs);
      let nextQuestion = "";
      let requestId = null;
      let model = selectedModel;
      let usage = null;
      try {
        if (this.shouldInjectQaFault({ qaFaultMode, providerOrderIndex, attemptIndex })) {
          throw createSyntheticProviderError(
            qaFaultMode === "primary-outage"
              ? "qa_primary_provider_outage"
              : qaFaultMode === "rate-limit-all"
                ? "qa_rate_limited_all_providers"
                : "qa_retryable_provider_failure",
            qaFaultMode === "rate-limit-all"
              ? { status: 429, retryable: true }
              : {},
          );
        }
        const response = await this.fetchImpl("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: buildAnthropicHeaders(this.anthropicApiKey),
          body: JSON.stringify(buildAnthropicRequest({
            model: selectedModel,
            promptPayload,
            intelligenceLevel,
            stream: true,
          })),
          signal,
        });

        const retryable = response.status === 429 || response.status >= 500;
        if (!response.ok) {
          const error = new Error(`anthropic_status_${response.status}`);
          error.status = response.status;
          error.retryAfterSeconds = parseRetryAfterSeconds(response.headers);
          throw Object.assign(error, { retryable });
        }

        await consumeSseStream(response, async (event) => {
          if (event?.type === "message_start") {
            requestId = event.message?.id ?? requestId;
            model = event.message?.model ?? model;
            usage = normalizeAnthropicUsage(event.message?.usage);
            return;
          }
          if (event?.type === "content_block_delta" && typeof event.delta?.text === "string" && event.delta.text) {
            nextQuestion += event.delta.text;
            await onDelta(event.delta.text, { providerId });
            return;
          }
          if (event?.type === "message_delta" && event.usage) {
            usage = normalizeAnthropicUsage(event.usage);
          }
        });

        nextQuestion = nextQuestion.trim();
        if (!nextQuestion) {
          throw Object.assign(new Error("anthropic_empty_stream_question"), { retryable: false });
        }

        attempts.push({
          attemptIndex,
          status: "completed",
          durationMs: Date.now() - attemptStartedAt,
        });

        return {
          status: "completed",
          providerId,
          availability,
          deliveryMode: "live-api",
          model,
          requestId,
          nextQuestion,
          usage: usage ?? normalizeAnthropicUsage({}),
          ...estimateUsageCostUsd({
            providerId,
            usage: usage ?? normalizeAnthropicUsage({}),
          }),
          attempts,
        };
      } catch (error) {
        lastError = error;
        attempts.push({
          attemptIndex,
          status: "failed",
          durationMs: Date.now() - attemptStartedAt,
          error: error?.message ?? "provider_error",
        });

        const retryable = error?.retryable === true
          || error?.status === 429
          || error?.status >= 500
          || error?.name === "AbortError"
          || error?.message === "onboarding_provider_timeout";
        if (!retryable || attemptIndex >= this.maxRetries) {
          break;
        }
        const retryDelayMs = this.retryDelayMs * (attemptIndex + 1);
        await onStatus({
          type: "provider-retry",
          providerId,
          failedAttemptNumber: attemptIndex + 1,
          nextAttemptNumber: attemptIndex + 2,
          maxAttemptCount: this.maxRetries + 1,
          delayMs: retryDelayMs,
          reason: error?.message ?? "provider_error",
          resetPartial: true,
        });
        await sleep(retryDelayMs);
      } finally {
        cleanup();
      }
    }

    return {
      status: "failed",
      providerId,
      availability,
      deliveryMode: "shell",
      attempts,
      error: {
        ...classifyProviderError(lastError),
      },
    };
  }

  // === Discovery Agent (AGT-001D, step 2) — primary conversation path ===
  // EVERY user message must be routed through this method FIRST.
  // It returns a structured envelope (see discovery-agent-role.md §8) on success,
  // or a non-completed status with NO envelope on any failure mode. Callers must
  // never synthesize a replyToUser when status !== "completed".
  async generateAgentTurn({
    providerId = "openai",
    modelFamilyId = "balanced",
    intelligenceLevel = "medium",
    projectGoal = "",
    transcript = [],
    currentUnderstanding = null,
    userMessage = "",
    userMessageId = "",
    qaFaultMode = null,
    onStatus = async () => {},
  } = {}) {
    // NOTE: We deliberately do NOT use executeWithRecovery() here.
    // The canonical rule (discovery-agent-role.md §9) is: if the agent fails or returns
    // a malformed envelope, the founder must see an explicit "agent not available, retry".
    // Silently failing over to a different provider — which would produce a different
    // agent personality and a different reply — would itself be a fabrication.
    // Retries within a single provider are still done (inside generateOpenAiAgentTurn).
    const normalizedProviderId = typeof providerId === "string" && providerId.trim()
      ? providerId.trim().toLowerCase()
      : "openai";
    const availability = this.getProviderAvailability(normalizedProviderId);
    if (availability.availabilityStatus !== "ready") {
      return {
        status: "unavailable",
        providerId: normalizedProviderId,
        availability,
        deliveryMode: "shell",
        attempts: [],
        error: {
          code: availability.availabilityReason ?? "provider_unavailable",
          status: null,
        },
      };
    }

    const promptPayload = buildAgentTurnPromptPayload({
      projectGoal,
      transcript,
      currentUnderstanding,
      userMessage,
      userMessageId,
    });

    if (normalizedProviderId === "openai") {
      return await this.generateOpenAiAgentTurn({
        providerId: normalizedProviderId,
        availability,
        promptPayload,
        modelFamilyId,
        intelligenceLevel,
        providerOrderIndex: 0,
        qaFaultMode,
        onStatus,
      });
    }

    // Anthropic implementation pending; until then we surface unavailable.
    // Per the canonical rule, we never fabricate a replyToUser.
    return {
      status: "unavailable",
      providerId: normalizedProviderId,
      availability,
      deliveryMode: "shell",
      attempts: [],
      error: {
        code: "agent_turn_unsupported_provider",
        status: null,
      },
    };
  }

  async generateOpenAiAgentTurn({
    providerId,
    availability,
    promptPayload,
    modelFamilyId = "balanced",
    intelligenceLevel = "medium",
    providerOrderIndex = 0,
    qaFaultMode = null,
    onStatus = async () => {},
  }) {
    const attempts = [];
    let lastError = null;
    const selectedModel = resolveOnboardingModelFamily(providerId, modelFamilyId).runtimeModelId;

    for (let attemptIndex = 0; attemptIndex <= this.maxRetries; attemptIndex += 1) {
      const attemptStartedAt = Date.now();
      const { signal, cleanup } = createAbortSignal(this.timeoutMs);
      try {
        if (this.shouldInjectQaFault({ qaFaultMode, providerOrderIndex, attemptIndex })) {
          throw createSyntheticProviderError(
            qaFaultMode === "primary-outage"
              ? "qa_primary_provider_outage"
              : qaFaultMode === "rate-limit-all"
                ? "qa_rate_limited_all_providers"
                : "qa_retryable_provider_failure",
            qaFaultMode === "rate-limit-all" ? { status: 429, retryable: true } : {},
          );
        }
        const response = await this.fetchImpl("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: buildOpenAiHeaders(this.openAiApiKey),
          body: JSON.stringify(buildOpenAiAgentTurnRequest({
            model: selectedModel,
            promptPayload,
            intelligenceLevel,
          })),
          signal,
        });

        const retryable = response.status === 429 || response.status >= 500;
        if (!response.ok) {
          const error = new Error(`openai_status_${response.status}`);
          error.status = response.status;
          error.retryAfterSeconds = parseRetryAfterSeconds(response.headers);
          throw Object.assign(error, { retryable });
        }

        const payload = await response.json();
        const rawText = extractOutputText(payload) || "";
        const parsed = parseAgentTurnEnvelope(rawText);
        if (!parsed.ok) {
          // The model returned but the envelope is invalid. Invalid JSON can be a
          // transient provider formatting failure, so retry inside the SAME provider.
          // We still never fail over and never fabricate a replyToUser.
          attempts.push({
            attemptIndex,
            status: "agent-malformed",
            durationMs: Date.now() - attemptStartedAt,
            error: parsed.reason,
          });
          if (["invalid_json", "empty_output", "ask_without_visible_question", "correction_without_correction_delta"].includes(parsed.reason) && attemptIndex < this.maxRetries) {
            const retryDelayMs = this.retryDelayMs * (attemptIndex + 1);
            await onStatus({
              type: "provider-retry",
              providerId,
              failedAttemptNumber: attemptIndex + 1,
              nextAttemptNumber: attemptIndex + 2,
              maxAttemptCount: this.maxRetries + 1,
              delayMs: retryDelayMs,
              reason: `agent_envelope_${parsed.reason}`,
              resetPartial: true,
            });
            await sleep(retryDelayMs);
            continue;
          }
          return {
            status: "agent-malformed",
            providerId,
            availability,
            deliveryMode: "live-api",
            model: payload.model ?? selectedModel,
            requestId: payload.id ?? null,
            attempts,
            error: { code: `agent_envelope_${parsed.reason}`, status: null },
            usage: normalizeUsage(payload.usage),
          };
        }

        attempts.push({
          attemptIndex,
          status: "completed",
          durationMs: Date.now() - attemptStartedAt,
        });

        return {
          status: "completed",
          providerId,
          availability,
          deliveryMode: "live-api",
          model: payload.model ?? selectedModel,
          requestId: payload.id ?? null,
          envelope: parsed.envelope,
          usage: normalizeUsage(payload.usage),
          ...estimateUsageCostUsd({
            providerId,
            usage: normalizeUsage(payload.usage),
          }),
          attempts,
        };
      } catch (error) {
        lastError = error;
        attempts.push({
          attemptIndex,
          status: "failed",
          durationMs: Date.now() - attemptStartedAt,
          error: error?.message ?? "provider_error",
        });

        const retryable = error?.retryable === true
          || error?.status === 429
          || error?.status >= 500
          || error?.name === "AbortError"
          || error?.message === "onboarding_provider_timeout";
        if (!retryable || attemptIndex >= this.maxRetries) {
          break;
        }
        const retryDelayMs = this.retryDelayMs * (attemptIndex + 1);
        await onStatus({
          type: "provider-retry",
          providerId,
          failedAttemptNumber: attemptIndex + 1,
          nextAttemptNumber: attemptIndex + 2,
          maxAttemptCount: this.maxRetries + 1,
          delayMs: retryDelayMs,
          reason: error?.message ?? "provider_error",
          resetPartial: true,
        });
        await sleep(retryDelayMs);
      } finally {
        cleanup();
      }
    }

    return {
      status: "failed",
      providerId,
      availability,
      deliveryMode: "shell",
      attempts,
      error: {
        ...classifyProviderError(lastError),
      },
    };
  }

  // === Product Skeleton Agent (SKEL-001) — first skeleton structure path ===
  // This is intentionally separate from the Discovery Agent. It must return a
  // provider-composed product skeleton envelope or no skeleton at all.
  async generateProductSkeleton({
    providerId = "openai",
    modelFamilyId = "balanced",
    intelligenceLevel = "medium",
    projectGoal = "",
    transcript = [],
    discoveryHandoff = null,
    qaFaultMode = null,
    onStatus = async () => {},
  } = {}) {
    const normalizedProviderId = typeof providerId === "string" && providerId.trim()
      ? providerId.trim().toLowerCase()
      : "openai";
    const availability = this.getProviderAvailability(normalizedProviderId);
    if (availability.availabilityStatus !== "ready") {
      return {
        status: "unavailable",
        providerId: normalizedProviderId,
        availability,
        deliveryMode: "shell",
        attempts: [],
        error: {
          code: availability.availabilityReason ?? "provider_unavailable",
          status: null,
        },
      };
    }

    const promptPayload = buildProductSkeletonPromptPayload({
      projectGoal,
      transcript,
      discoveryHandoff,
    });

    if (normalizedProviderId === "openai") {
      return await this.generateOpenAiProductSkeleton({
        providerId: normalizedProviderId,
        availability,
        promptPayload,
        modelFamilyId,
        intelligenceLevel,
        providerOrderIndex: 0,
        qaFaultMode,
        onStatus,
      });
    }

    return {
      status: "unavailable",
      providerId: normalizedProviderId,
      availability,
      deliveryMode: "shell",
      attempts: [],
      error: {
        code: "product_skeleton_unsupported_provider",
        status: null,
      },
    };
  }

  async generateOpenAiProductSkeleton({
    providerId,
    availability,
    promptPayload,
    modelFamilyId = "balanced",
    intelligenceLevel = "medium",
    providerOrderIndex = 0,
    qaFaultMode = null,
    onStatus = async () => {},
  }) {
    const attempts = [];
    let lastError = null;
    const selectedModel = resolveOnboardingModelFamily(providerId, modelFamilyId).runtimeModelId;

    for (let attemptIndex = 0; attemptIndex <= this.maxRetries; attemptIndex += 1) {
      const attemptStartedAt = Date.now();
      const { signal, cleanup } = createAbortSignal(this.timeoutMs);
      try {
        if (this.shouldInjectQaFault({ qaFaultMode, providerOrderIndex, attemptIndex })) {
          throw createSyntheticProviderError(
            qaFaultMode === "primary-outage"
              ? "qa_primary_provider_outage"
              : qaFaultMode === "rate-limit-all"
                ? "qa_rate_limited_all_providers"
                : "qa_retryable_provider_failure",
            qaFaultMode === "rate-limit-all" ? { status: 429, retryable: true } : {},
          );
        }
        const response = await this.fetchImpl("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: buildOpenAiHeaders(this.openAiApiKey),
          body: JSON.stringify(buildOpenAiProductSkeletonRequest({
            model: selectedModel,
            promptPayload,
            intelligenceLevel,
          })),
          signal,
        });

        const retryable = response.status === 429 || response.status >= 500;
        if (!response.ok) {
          const error = new Error(`openai_status_${response.status}`);
          error.status = response.status;
          error.retryAfterSeconds = parseRetryAfterSeconds(response.headers);
          throw Object.assign(error, { retryable });
        }

        const payload = await response.json();
        const rawText = extractOutputText(payload) || "";
        const parsed = parseProductSkeletonEnvelope(rawText);
        if (!parsed.ok) {
          attempts.push({
            attemptIndex,
            status: "agent-malformed",
            durationMs: Date.now() - attemptStartedAt,
            error: parsed.reason,
          });
          if (["invalid_json", "empty_output"].includes(parsed.reason) && attemptIndex < this.maxRetries) {
            const retryDelayMs = this.retryDelayMs * (attemptIndex + 1);
            await onStatus({
              type: "provider-retry",
              providerId,
              failedAttemptNumber: attemptIndex + 1,
              nextAttemptNumber: attemptIndex + 2,
              maxAttemptCount: this.maxRetries + 1,
              delayMs: retryDelayMs,
              reason: `product_skeleton_envelope_${parsed.reason}`,
              resetPartial: true,
            });
            await sleep(retryDelayMs);
            continue;
          }
          return {
            status: "agent-malformed",
            providerId,
            availability,
            deliveryMode: "live-api",
            model: payload.model ?? selectedModel,
            requestId: payload.id ?? null,
            attempts,
            error: { code: `product_skeleton_envelope_${parsed.reason}`, status: null },
            usage: normalizeUsage(payload.usage),
          };
        }

        attempts.push({
          attemptIndex,
          status: "completed",
          durationMs: Date.now() - attemptStartedAt,
        });

        return {
          status: "completed",
          providerId,
          availability,
          deliveryMode: "live-api",
          model: payload.model ?? selectedModel,
          requestId: payload.id ?? null,
          envelope: parsed.envelope,
          usage: normalizeUsage(payload.usage),
          ...estimateUsageCostUsd({
            providerId,
            usage: normalizeUsage(payload.usage),
          }),
          attempts,
        };
      } catch (error) {
        lastError = error;
        attempts.push({
          attemptIndex,
          status: "failed",
          durationMs: Date.now() - attemptStartedAt,
          error: error?.message ?? "provider_error",
        });

        const retryable = error?.retryable === true
          || error?.status === 429
          || error?.status >= 500
          || error?.name === "AbortError"
          || error?.message === "onboarding_provider_timeout";
        if (!retryable || attemptIndex >= this.maxRetries) {
          break;
        }
        const retryDelayMs = this.retryDelayMs * (attemptIndex + 1);
        await onStatus({
          type: "provider-retry",
          providerId,
          failedAttemptNumber: attemptIndex + 1,
          nextAttemptNumber: attemptIndex + 2,
          maxAttemptCount: this.maxRetries + 1,
          delayMs: retryDelayMs,
          reason: error?.message ?? "provider_error",
          resetPartial: true,
        });
        await sleep(retryDelayMs);
      } finally {
        cleanup();
      }
    }

    return {
      status: "failed",
      providerId,
      availability,
      deliveryMode: "shell",
      attempts,
      error: {
        ...classifyProviderError(lastError),
      },
    };
  }

  // === Visual Product Skeleton Agent (VSKEL-001) — first visible product screen path ===
  // This agent is separate from Product Skeleton Agent. It must return a
  // provider-composed visual skeleton envelope or no visual skeleton at all.
  async generateVisualProductSkeleton({
    providerId = "openai",
    modelFamilyId = "balanced",
    intelligenceLevel = "medium",
    projectGoal = "",
    productSkeletonAgentOutput = null,
    designSourceInput = null,
    userDesignPreference = "",
    qaFaultMode = null,
    onStatus = async () => {},
  } = {}) {
    const normalizedProviderId = typeof providerId === "string" && providerId.trim()
      ? providerId.trim().toLowerCase()
      : "openai";
    const availability = this.getProviderAvailability(normalizedProviderId);
    if (availability.availabilityStatus !== "ready") {
      return {
        status: "unavailable",
        providerId: normalizedProviderId,
        availability,
        deliveryMode: "shell",
        attempts: [],
        error: {
          code: availability.availabilityReason ?? "provider_unavailable",
          status: null,
        },
      };
    }

    const promptPayload = buildVisualProductSkeletonPromptPayload({
      projectGoal,
      productSkeletonAgentOutput,
      designSourceInput,
      userDesignPreference,
    });

    if (normalizedProviderId === "openai") {
      return await this.generateOpenAiVisualProductSkeleton({
        providerId: normalizedProviderId,
        availability,
        promptPayload,
        modelFamilyId,
        intelligenceLevel,
        providerOrderIndex: 0,
        qaFaultMode,
        onStatus,
      });
    }

    return {
      status: "unavailable",
      providerId: normalizedProviderId,
      availability,
      deliveryMode: "shell",
      attempts: [],
      error: {
        code: "visual_product_skeleton_unsupported_provider",
        status: null,
      },
    };
  }

  async generateOpenAiVisualProductSkeleton({
    providerId,
    availability,
    promptPayload,
    modelFamilyId = "balanced",
    intelligenceLevel = "medium",
    providerOrderIndex = 0,
    qaFaultMode = null,
    onStatus = async () => {},
  }) {
    const attempts = [];
    let lastError = null;
    const selectedModel = resolveOnboardingModelFamily(providerId, modelFamilyId).runtimeModelId;

    for (let attemptIndex = 0; attemptIndex <= this.maxRetries; attemptIndex += 1) {
      const attemptStartedAt = Date.now();
      const { signal, cleanup } = createAbortSignal(this.timeoutMs);
      try {
        if (this.shouldInjectQaFault({ qaFaultMode, providerOrderIndex, attemptIndex })) {
          throw createSyntheticProviderError(
            qaFaultMode === "primary-outage"
              ? "qa_primary_provider_outage"
              : qaFaultMode === "rate-limit-all"
                ? "qa_rate_limited_all_providers"
                : "qa_retryable_provider_failure",
            qaFaultMode === "rate-limit-all" ? { status: 429, retryable: true } : {},
          );
        }
        const response = await this.fetchImpl("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: buildOpenAiHeaders(this.openAiApiKey),
          body: JSON.stringify(buildOpenAiVisualProductSkeletonRequest({
            model: selectedModel,
            promptPayload,
            intelligenceLevel,
          })),
          signal,
        });

        const retryable = response.status === 429 || response.status >= 500;
        if (!response.ok) {
          const error = new Error(`openai_status_${response.status}`);
          error.status = response.status;
          error.retryAfterSeconds = parseRetryAfterSeconds(response.headers);
          throw Object.assign(error, { retryable });
        }

        const payload = await response.json();
        const rawText = extractOutputText(payload) || "";
        const parsed = parseVisualProductSkeletonEnvelope(rawText);
        if (!parsed.ok) {
          attempts.push({
            attemptIndex,
            status: "agent-malformed",
            durationMs: Date.now() - attemptStartedAt,
            error: parsed.reason,
          });
          if (["invalid_json", "empty_output"].includes(parsed.reason) && attemptIndex < this.maxRetries) {
            const retryDelayMs = this.retryDelayMs * (attemptIndex + 1);
            await onStatus({
              type: "provider-retry",
              providerId,
              failedAttemptNumber: attemptIndex + 1,
              nextAttemptNumber: attemptIndex + 2,
              maxAttemptCount: this.maxRetries + 1,
              delayMs: retryDelayMs,
              reason: `visual_product_skeleton_envelope_${parsed.reason}`,
              resetPartial: true,
            });
            await sleep(retryDelayMs);
            continue;
          }
          return {
            status: "agent-malformed",
            providerId,
            availability,
            deliveryMode: "live-api",
            model: payload.model ?? selectedModel,
            requestId: payload.id ?? null,
            attempts,
            error: { code: `visual_product_skeleton_envelope_${parsed.reason}`, status: null },
            usage: normalizeUsage(payload.usage),
          };
        }

        attempts.push({
          attemptIndex,
          status: "completed",
          durationMs: Date.now() - attemptStartedAt,
        });

        return {
          status: "completed",
          providerId,
          availability,
          deliveryMode: "live-api",
          model: payload.model ?? selectedModel,
          requestId: payload.id ?? null,
          envelope: parsed.envelope,
          usage: normalizeUsage(payload.usage),
          ...estimateUsageCostUsd({
            providerId,
            usage: normalizeUsage(payload.usage),
          }),
          attempts,
        };
      } catch (error) {
        lastError = error;
        attempts.push({
          attemptIndex,
          status: "failed",
          durationMs: Date.now() - attemptStartedAt,
          error: error?.message ?? "provider_error",
        });

        const retryable = error?.retryable === true
          || error?.status === 429
          || error?.status >= 500
          || error?.name === "AbortError"
          || error?.message === "onboarding_provider_timeout";
        if (!retryable || attemptIndex >= this.maxRetries) {
          break;
        }
        const retryDelayMs = this.retryDelayMs * (attemptIndex + 1);
        await onStatus({
          type: "provider-retry",
          providerId,
          failedAttemptNumber: attemptIndex + 1,
          nextAttemptNumber: attemptIndex + 2,
          maxAttemptCount: this.maxRetries + 1,
          delayMs: retryDelayMs,
          reason: error?.message ?? "provider_error",
          resetPartial: true,
        });
        await sleep(retryDelayMs);
      } finally {
        cleanup();
      }
    }

    return {
      status: "failed",
      providerId,
      availability,
      deliveryMode: "shell",
      attempts,
      error: {
        ...classifyProviderError(lastError),
      },
    };
  }
}
