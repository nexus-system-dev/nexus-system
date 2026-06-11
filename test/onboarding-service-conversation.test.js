import test from "node:test";
import assert from "node:assert/strict";

import { OnboardingService } from "../src/core/onboarding-service.js";
import { createProjectDiscoveryAgentState } from "../web/shared/project-discovery-agent.js";

function createTestService(providerResultFactory = null) {
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "test-openai-key";
  const service = new OnboardingService();
  service.providerClient.generateNextQuestion = async (payload) => {
    if (typeof providerResultFactory === "function") {
      return providerResultFactory(payload);
    }
    return {
      status: "unavailable",
      providerId: payload.providerId ?? "openai",
      availability: {
        providerId: payload.providerId ?? "openai",
        availabilityStatus: "missing-key",
        availabilityReason: "OPENAI_API_KEY",
      },
      deliveryMode: "shell",
    };
  };
  service.providerClient.streamNextQuestion = async (payload) => {
    if (typeof providerResultFactory === "function") {
      return providerResultFactory(payload);
    }
    return {
      status: "unavailable",
      providerId: payload.providerId ?? "openai",
      availability: {
        providerId: payload.providerId ?? "openai",
        availabilityStatus: "missing-key",
        availabilityReason: "OPENAI_API_KEY",
      },
      deliveryMode: "shell",
    };
  };
  service.providerClient.generateDiscoveryResponse = async (payload) => {
    if (typeof providerResultFactory === "function") {
      const result = providerResultFactory({ ...payload, requestKind: "discovery-response" });
      if (result?.agentResponse) {
        return result;
      }
    }
    return {
      status: "unavailable",
      providerId: payload.providerId ?? "openai",
      availability: {
        providerId: payload.providerId ?? "openai",
        availabilityStatus: "missing-key",
        availabilityReason: "OPENAI_API_KEY",
      },
      deliveryMode: "shell",
    };
  };
  return service;
}

test("onboarding conversation creates adaptive transcript and summary", async () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-1",
    projectDraftId: "crm-agent",
    initialInput: {
      projectName: "CRM Agent",
      visionText: "מערכת CRM חכמה",
    },
  });

  const initialState = service.getConversationState(session.sessionId);
  assert.equal(initialState.onboardingConversation.transcript[0].speaker, "ai");
  assert.match(initialState.onboardingConversation.transcript[0].text, /מי מחזיק את הלידים או הלקוחות בפועל ביום-יום/);
  assert.deepEqual(initialState.onboardingConversation.summary.understoodItems, [
    "רעיון מרכזי: מערכת CRM חכמה",
    "מבנה בסיסי שאני כבר מניח ל-v1: לידים או לקוחות, בעלות, צעד הבא, תזכורות, timeline בסיסי",
  ]);
  assert.match(initialState.onboardingConversation.summary.missingItems[0], /מי מחזיק את הלידים|follow-up|ליד|לקוח/u);
  assert.equal(initialState.onboardingConversation.totalQuestions, 1);

  const afterAudience = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "לבעלי עסקים קטנים",
  });
  assert.equal(afterAudience.onboardingConversation.answers["target-audience"], "לבעלי עסקים קטנים");
  assert.equal(afterAudience.onboardingConversation.currentQuestion?.id, "core-problem");
  assert.equal(afterAudience.onboardingConversation.totalQuestions, 2);
  assert.match(
    afterAudience.onboardingConversation.transcript.at(-1).text,
    /איפה המעקב נשבר היום באמת|ליד שנשכח|מה הכי נשבר או מעצבן בתהליך היום/u,
  );

  const afterProblem = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "קשה להם לנהל לקוחות ולעקוב אחרי מכירות",
  });
  assert.equal(afterProblem.onboardingConversation.answers["core-problem"], "קשה להם לנהל לקוחות ולעקוב אחרי מכירות");
  assert.equal(afterProblem.onboardingConversation.currentQuestion?.id, "workflow-detail");
  assert.equal(afterProblem.onboardingConversation.totalQuestions, 4);
  assert.match(afterProblem.onboardingConversation.transcript.at(-1).text, /ליד|השלב שלו|הפעולה הבאה/u);

  const afterWorkflow = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "הם צריכים לראות מיד מי הבעלים של כל ליד, מה השלב שלו, ומה הפעולה הבאה",
  });
  assert.equal(afterWorkflow.onboardingConversation.currentQuestion?.id, "successful-solution");

  const completed = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "כלי לקוחות פשוט ונוח עם התראות",
  });
  assert.equal(completed.onboardingConversation.currentQuestion?.id, "build-direction");
  assert.equal(completed.onboardingConversation.isComplete, false);

  const fullyCompleted = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "המסך הראשון חייב להראות מיד את הלקוח הבא, התזכורת הכי דחופה, והפעולה הבאה בלי לחפש בתפריטים",
  });
  assert.equal(fullyCompleted.onboardingConversation.isComplete, true);
  assert.equal(fullyCompleted.onboardingConversation.currentQuestion, null);
  assert.match(fullyCompleted.onboardingConversation.completionReason, /כיוון build ראשון|קהל יעד, כאב מרכזי/u);
  assert.deepEqual(fullyCompleted.onboardingConversation.summary.understoodItems, [
    "רעיון מרכזי: מערכת CRM חכמה",
    "מבנה בסיסי שאני כבר מניח ל-v1: לידים או לקוחות, בעלות, צעד הבא, תזכורות, timeline בסיסי",
    "המשתמש המרכזי: לבעלי עסקים קטנים",
    "בעיה מרכזית: קשה להם לנהל לקוחות ולעקוב אחרי מכירות",
    "כיוון למוצר: כלי לקוחות פשוט ונוח עם התראות",
    "מה חייב להיות ברור במסך הראשון: המסך הראשון חייב להראות מיד את הלקוח הבא, התזכורת הכי דחופה, והפעולה הבאה בלי לחפש בתפריטים",
  ]);
  assert.match(fullyCompleted.onboardingConversation.summary.missingItems[0], /שלבים|אוטומציות|התראות|חידושים/);
  assert.equal(fullyCompleted.onboardingConversation.summary.projectType, "saas");
});

test("opening Project Discovery Agent response is provider-composed before skeleton handoff", async () => {
  const service = createTestService((payload) => {
    if (payload.requestKind === "discovery-response") {
      return {
        status: "completed",
        providerId: payload.providerId ?? "openai",
        deliveryMode: "live-api",
        model: "test-discovery-model",
        requestId: "test-discovery-response",
        agentResponse: "הבנתי שאתה בונה דשבורד לאיש מכירות כדי שלא יאבד לידים בין שיחות. הזרימה הראשונה ברורה: רשימת לידים עם בעלות, תזכורת וצעד הבא. יש מספיק אמת מוצרית כדי לפתוח שלד ראשון ולבדוק אותו.",
        usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
        attempts: [{ attemptIndex: 0, status: "completed", durationMs: 1 }],
      };
    }
    return {
      status: "completed",
      providerId: payload.providerId ?? "openai",
      deliveryMode: "live-api",
      nextQuestion: "שאלת המשך חיה",
      usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
      attempts: [{ attemptIndex: 0, status: "completed", durationMs: 1 }],
    };
  });
  const session = service.createSession({
    userId: "user-1",
    projectDraftId: "crm-followup",
    initialInput: {
      projectName: "Follow-up OS",
      visionText: "מערכת דשבורד לצוות מכירות שמנהלת לידים כדי שלא מפספסים follow-up. המשתמש המרכזי הוא איש מכירות, הכאב הוא איבוד לידים בין שיחות, וה-flow הראשון הוא רשימת לידים עם בעלות, תזכורת וצעד הבא.",
    },
  });

  const primed = await service.primeDiscoveryAgentResponse({ sessionId: session.sessionId });
  const transcript = primed.onboardingConversation.transcript;
  assert.equal(transcript.at(-1).responseSource, "provider-composed");
  assert.match(transcript.at(-1).text, /דשבורד לאיש מכירות/u);

  const agentState = createProjectDiscoveryAgentState({
    projectName: "Follow-up OS",
    visionText: session.initialInput.goal,
    conversation: primed.onboardingConversation,
  });
  assert.equal(agentState.agentResponseSource, "agent-composed-transcript");
  assert.equal(agentState.nextAgentHandoff.handoffAllowed, true);
  assert.equal(agentState.canonicalUnderstanding.handoffStatus, "ready-for-first-task");
});

test("project discovery agent can close enough truth from one free-form product message", () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-freeform-truth",
    projectDraftId: "freeform-truth",
    initialInput: {
      projectName: "Sales Follow-up",
      goal: "מערכת דשבורד לצוות מכירות שמנהלת לידים כדי שלא מפספסים follow-up. המשתמש המרכזי הוא איש מכירות, הכאב הוא איבוד לידים בין שיחות, וה-flow הראשון הוא רשימת לידים עם בעלות, תזכורת וצעד הבא.",
    },
  });

  const state = service.getConversationState(session.sessionId);

  assert.equal(state.onboardingConversation.isComplete, true);
  assert.equal(state.onboardingConversation.currentQuestion, null);
  assert.equal(state.onboardingConversation.answers["target-audience"], "איש מכירות");
  assert.equal(state.onboardingConversation.answers["core-problem"], "איבוד לידים בין שיחות");
  assert.match(state.onboardingConversation.answers["build-direction"], /רשימת לידים עם בעלות/u);
  assert.match(state.onboardingConversation.answers["workflow-detail"], /רשימת לידים עם בעלות/u);
  assert.match(state.onboardingConversation.summary.readinessLine, /מספיק בהירות/u);
});

test("onboarding runtime persists provider, model family, and intelligence selections across commands", () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-runtime-controls",
    projectDraftId: "runtime-controls",
    initialInput: {
      projectName: "Runtime Controls",
      visionText: "Build a live onboarding assistant",
      providerChoice: "openai",
      modelFamilyId: "balanced",
      intelligenceLevel: "medium",
    },
  });

  let state = service.getConversationState(session.sessionId);
  assert.equal(state.providerRuntime.selectedProviderId, "openai");
  assert.equal(state.providerRuntime.selectedModelFamilyId, "balanced");
  assert.equal(state.providerRuntime.selectedIntelligenceLevel, "medium");

  service.handleCommand({
    sessionId: session.sessionId,
    actionType: "select-model-family",
    payload: {
      modelFamilyId: "deep",
    },
  });
  service.handleCommand({
    sessionId: session.sessionId,
    actionType: "select-intelligence-level",
    payload: {
      intelligenceLevel: "high",
    },
  });

  state = service.getConversationState(session.sessionId);
  assert.equal(state.providerRuntime.selectedModelFamilyId, "deep");
  assert.equal(state.providerRuntime.selectedIntelligenceLevel, "high");
  assert.match(state.providerRuntime.tradeoffLine, /מודל עמוק/);
  assert.match(state.providerRuntime.tradeoffLine, /עומק גבוהה/);
  assert.match(state.onboardingConversation.transcript.at(-1)?.text ?? "", /עומק החידוד|אותו ההקשר/);
});

test("onboarding conversation summary stays class-safe for landing-page projects", async () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-landing",
    projectDraftId: "landing-page-audit",
    initialInput: {
      projectName: "Landing Audit",
      goal: "Build a landing page for a clinic offer",
    },
  });

  const afterAudience = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "Clinic owners",
  });
  assert.equal(afterAudience.onboardingConversation.currentQuestion?.id, "core-problem");
  assert.equal(afterAudience.onboardingConversation.totalQuestions, 2);

  const afterProblem = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "The current page does not explain the offer clearly enough to convert",
  });

  assert.equal(afterProblem.onboardingConversation.summary.projectType, "landing-page");
  assert.equal(afterProblem.onboardingConversation.isComplete, false);
  assert.equal(afterProblem.onboardingConversation.currentQuestion?.id, "build-direction");
  assert.equal(afterProblem.onboardingConversation.currentIndex, 2);
  assert.equal(afterProblem.onboardingConversation.totalQuestions, 3);

  const completed = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "הבטחה אחת חדה מעל הקפל, הוכחת אמון בולטת, ו־CTA אחד ברור לשיחת ייעוץ",
  });

  assert.equal(completed.onboardingConversation.isComplete, true);
  assert.match(completed.onboardingConversation.completionReason, /מספיק הבנה כדי לסכם דף נחיתה/);
  assert.deepEqual(completed.onboardingConversation.summary.understoodItems, [
    "רעיון מרכזי: Build a landing page for a clinic offer",
    "המשתמש המרכזי: Clinic owners",
    "בעיה מרכזית: The current page does not explain the offer clearly enough to convert",
    "מה חייב להיות ברור בדף: הבטחה אחת חדה מעל הקפל, הוכחת אמון בולטת, ו־CTA אחד ברור לשיחת ייעוץ",
  ]);
  assert.equal(completed.onboardingConversation.summary.missingItems.includes("כמה מכירות קיימות"), false);
  assert.equal(completed.onboardingConversation.summary.missingItems.includes("כמה לקוחות יש להם"), false);
  assert.match(completed.onboardingConversation.summary.missingItems[0], /איך נראה דף נחיתה מוצלח/);
});

test("onboarding conversation summary stays class-safe for internal tools", async () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-internal",
    projectDraftId: "internal-tool-audit",
    initialInput: {
      projectName: "Internal Audit",
      goal: "Build an internal backoffice queue for onboarding support reps",
    },
  });

  await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "Onboarding support reps",
  });
  const afterProblem = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "Queue ownership is unclear and follow-ups are missed",
  });
  assert.equal(afterProblem.onboardingConversation.currentQuestion?.id, "successful-solution");
  const completed = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "A queue workspace with ownership, SLA visibility, and a clear next action",
  });
  assert.equal(completed.onboardingConversation.currentQuestion?.id, "build-direction");

  const fullyCompleted = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "הנציג חייב לראות מיד מי בעל התיק, איזה SLA נשבר, ומה הפעולה הבאה בלי לפתוח מסך נוסף",
  });

  assert.equal(fullyCompleted.onboardingConversation.summary.projectType, "internal-tool");
  assert.deepEqual(fullyCompleted.onboardingConversation.summary.understoodItems, [
    "רעיון מרכזי: Build an internal backoffice queue for onboarding support reps",
    "המשתמש המרכזי: Onboarding support reps",
    "בעיה מרכזית: Queue ownership is unclear and follow-ups are missed",
    "כיוון לזרימת העבודה: A queue workspace with ownership, SLA visibility, and a clear next action",
    "מה חייב להיות ברור במסך העבודה הראשון: הנציג חייב לראות מיד מי בעל התיק, איזה SLA נשבר, ומה הפעולה הבאה בלי לפתוח מסך נוסף",
  ]);
  assert.equal(fullyCompleted.onboardingConversation.summary.missingItems.includes("כמה מכירות קיימות"), false);
  assert.equal(fullyCompleted.onboardingConversation.summary.missingItems.includes("כמה לקוחות יש להם"), false);
  assert.match(fullyCompleted.onboardingConversation.summary.missingItems[0], /הבעלות על התור/);
});

test("marketplace onboarding starts with marketplace defaults and a two-sided fork", () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-marketplace",
    projectDraftId: "marketplace-audit",
    initialInput: {
      projectName: "Pro Marketplace",
      goal: "אני רוצה פלטפורמה שמחברת בין בעלי מקצוע ללקוחות",
    },
  });

  const state = service.getConversationState(session.sessionId);
  assert.match(state.onboardingConversation.transcript[0].text, /מי שני הצדדים|מי מהם/);
  assert.deepEqual(state.onboardingConversation.summary.understoodItems, [
    "רעיון מרכזי: אני רוצה פלטפורמה שמחברת בין בעלי מקצוע ללקוחות",
    "מבנה בסיסי שאני כבר מניח ל-v1: פרופילים לשני הצדדים, חיפוש וסינון בסיסיים, התאמה או בקשת פנייה, אמון בסיסי דרך פרופיל ותוכן, flow ראשון לסגירת עניין",
  ]);
  assert.match(state.onboardingConversation.summary.missingItems[0], /מי שני הצדדים|חייב להביא/);
});

test("booking onboarding starts with booking defaults and a real scheduling fork", () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-booking",
    projectDraftId: "booking-audit",
    initialInput: {
      projectName: "Clinic Booking",
      goal: "אני רוצה מערכת להזמנת תורים לקליניקות",
    },
  });

  const state = service.getConversationState(session.sessionId);
  assert.match(state.onboardingConversation.transcript[0].text, /מי מזמין בפועל|מי מקבל את ההזמנה/);
  assert.deepEqual(state.onboardingConversation.summary.understoodItems, [
    "רעיון מרכזי: אני רוצה מערכת להזמנת תורים לקליניקות",
    "מבנה בסיסי שאני כבר מניח ל-v1: בחירת שירות, יומן זמינות, בחירת זמן, אישור הזמנה, תזכורות בסיסיות",
  ]);
  assert.match(state.onboardingConversation.summary.missingItems[0], /מי מזמין בפועל|הזמינות/);
});

test("internal-tool onboarding now starts with internal-workspace defaults instead of generic intake", async () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-internal-momentum",
    projectDraftId: "internal-workspace-audit",
    initialInput: {
      projectName: "Support Queue",
      goal: "אני רוצה כלי פנימי לצוות שירות שמחלק פניות ומראה SLA",
    },
  });

  const initialState = service.getConversationState(session.sessionId);
  assert.deepEqual(initialState.onboardingConversation.summary.understoodItems, [
    "רעיון מרכזי: אני רוצה כלי פנימי לצוות שירות שמחלק פניות ומראה SLA",
    "מבנה בסיסי שאני כבר מניח ל-v1: תור עבודה, בעלות, סטטוס, עדיפות או SLA, פעולה הבאה",
  ]);
  assert.match(initialState.onboardingConversation.summary.missingItems[0], /איזה צוות באמת חי בתוך הכלי|הבעלים של התור/);

  const afterAudience = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "צוות שירות של 12 נציגים ומנהל משמרת",
  });
  assert.match(afterAudience.onboardingConversation.transcript.at(-1).text, /אני כבר מניח תור עבודה, בעלות, סטטוס ופעולה הבאה/);
  assert.match(afterAudience.onboardingConversation.transcript.at(-1).text, /SLA|עומסים|בעלות לא ברורה/);
});

test("onboarding inserts a class-disambiguation question when the class is ambiguous", async () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-ambiguous",
    projectDraftId: "clinic-crm-landing",
    initialInput: {
      projectName: "Clinic CRM Landing",
      goal: "Build something for clinic leads",
    },
  });

  const afterAudience = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "Clinic owners",
  });

  assert.equal(afterAudience.onboardingConversation.currentQuestion?.id, "project-class");
  assert.match(
    afterAudience.onboardingConversation.currentQuestion?.title ?? "",
    /כדי לא להוביל .* למסלול הלא נכון, מה הדבר המרכזי שאתה בונה כאן: דף נחיתה שיווקי, כלי פנימי לצוות, או מוצר SaaS קטן/u,
  );
  assert.match(
    afterAudience.onboardingConversation.transcript.at(-1)?.text ?? "",
    /מה הדבר המרכזי שאתה בונה כאן: דף נחיתה שיווקי, כלי פנימי לצוות, או מוצר SaaS קטן/,
  );
  assert.match(afterAudience.onboardingConversation.currentQuestion?.reason ?? "", /לוודא שאני מבין נכון מה אתה בונה/);
  assert.equal(afterAudience.onboardingConversation.totalQuestions, 3);

  const afterClass = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "This is a landing page for a clinic offer",
  });

  assert.equal(afterClass.onboardingConversation.currentQuestion?.id, "core-problem");
  assert.equal(afterClass.onboardingConversation.totalQuestions, 3);
  assert.match(
    afterClass.onboardingConversation.transcript.at(-1).text,
    /מה הבעיה המרכזית שהם מתמודדים איתה|מה הכי נשבר או מעצבן בתהליך היום/u,
  );

  const afterProblem = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "The current page mixes too many messages and loses conversions",
  });

  assert.equal(afterProblem.onboardingConversation.currentQuestion?.id, "build-direction");

  const completed = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "הכותרת, הוכחת האמון וה־CTA חייבים להופיע מיד בלי לערבב כמה הצעות",
  });

  assert.equal(completed.onboardingConversation.isComplete, true);
  assert.equal(completed.onboardingConversation.currentQuestion, null);
  assert.equal(completed.onboardingConversation.summary.projectType, "landing-page");
});

test("onboarding conversation surfaces bounded degraded runtime truth when providers are rate limited", async () => {
  const service = createTestService(() => ({
    status: "failed",
    providerId: "openai",
    initialProviderId: "openai",
    finalProviderId: "anthropic",
    deliveryMode: "shell",
    recoveryTrail: [
      { providerId: "openai", attempts: [{ attemptIndex: 0 }, { attemptIndex: 1 }] },
      { providerId: "anthropic", attempts: [{ attemptIndex: 0 }, { attemptIndex: 1 }] },
    ],
    error: {
      code: "openai_status_429",
      status: 429,
      retryable: true,
      retryAfterSeconds: 30,
      errorClass: "rate-limited",
      degradedReason: "provider-rate-limit",
    },
  }));

  const session = service.createSession({
    userId: "user-degraded",
    projectDraftId: "runtime-degraded",
    initialInput: {
      projectName: "Runtime Degraded",
      goal: "Build a landing page for clinic leads",
    },
  });

  const afterAudience = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "Clinic owners",
  });

  assert.equal(afterAudience.onboardingConversation.providerRuntime.runtimeMode, "provider-backed-degraded");
  assert.equal(afterAudience.onboardingConversation.providerRuntime.healthStatus, "degraded");
  assert.match(afterAudience.onboardingConversation.providerRuntime.summaryLine, /עומס קטן ברקע|עיכוב זמני ברקע/);
  assert.match(afterAudience.onboardingConversation.providerRuntime.operatorTruthLine, /health: degraded/);
  assert.match(afterAudience.onboardingConversation.providerRuntime.operatorTruthLine, /retry after ~30s/);
  assert.ok(
    afterAudience.onboardingConversation.providerRuntime.availabilityLine === ""
      || /Anthropic עדיין לא זמין כרגע\./.test(
        afterAudience.onboardingConversation.providerRuntime.availabilityLine,
      ),
  );
});

test("learning-guided intake blocks generic audience answers and asks a sharper follow-up", async () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-learning-generic",
    projectDraftId: "business-system",
    initialInput: {
      projectName: "Business System",
      goal: "I want a system for a business",
      learningContext: {
        learningDecisionImpact: {
          impactId: "impact-1",
          strategy: "repair-before-expand",
          drivingSignals: ["failure-signals:3", "trend:stalled"],
        },
        generationIntent: {
          learningAware: true,
          learnedSignals: ["pattern:Generic audiences drift quickly"],
        },
      },
    },
  });

  const afterAudience = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "for a business",
  });

  assert.equal(afterAudience.onboardingConversation.currentQuestion?.id, "audience-clarification");
  assert.match(afterAudience.onboardingConversation.currentQuestion?.title ?? "", /עדיין כללית מדי|too generic/u);
  assert.match(afterAudience.onboardingConversation.currentQuestion?.reason ?? "", /כללית מדי|מי בדיוק המשתמש/u);
  assert.equal(afterAudience.onboardingConversation.summary.learningStatus, "live");
  assert.equal(afterAudience.onboardingConversation.summary.clarificationMode, "generic-audience");
  assert.deepEqual(afterAudience.onboardingConversation.summary.understoodItems, [
    "רעיון מרכזי: I want a system for a business",
  ]);
  assert.equal(
    afterAudience.onboardingConversation.summary.missingItems.includes("מי הבן אדם שבאמת צריך את זה"),
    true,
  );

  const afterClarification = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "Clinic owners who need to return leads quickly without a sales team",
  });

  assert.equal(afterClarification.onboardingConversation.currentQuestion?.id, "project-class");
  assert.equal(
    afterClarification.onboardingConversation.summary.understoodItems.some((item) => /Clinic owners/.test(item)),
    true,
  );
});

test("learning-guided intake keeps Hebrew plural business answers out of understood truth", async () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-learning-hebrew-generic",
    projectDraftId: "hebrew-business-system",
    initialInput: {
      projectName: "Hebrew Business System",
      goal: "אפלקיציה לניהול ובניית מסלולים",
      learningContext: {
        learningDecisionImpact: {
          impactId: "impact-hebrew-generic",
          strategy: "repair-before-expand",
          drivingSignals: ["failure-signals:3", "trend:stalled"],
        },
      },
    },
  });

  const afterAudience = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "לעסקים",
  });

  assert.equal(afterAudience.onboardingConversation.summary.clarificationMode, "generic-audience");
  assert.equal(
    afterAudience.onboardingConversation.summary.understoodItems.some((item) => /קהל יעד/u.test(item)),
    false,
  );
  assert.equal(
    afterAudience.onboardingConversation.summary.missingItems.some((item) => /מי עובד עם זה בפועל|מי משתמש בזה בפועל|שליח|מנהל מסלולים|צוות לוגיסטי/u.test(item)),
    true,
  );
});

test("learning-guided intake does not treat repeated generic clarification as a real audience", async () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-learning-repeated-generic",
    projectDraftId: "repeated-generic-audience",
    initialInput: {
      projectName: "Repeated Generic Audience",
      goal: "אפלקיציה לניהול ובניית מסלולים",
      learningContext: {
        learningDecisionImpact: {
          impactId: "impact-repeated-generic",
          strategy: "repair-before-expand",
          drivingSignals: ["failure-signals:3", "trend:stalled"],
        },
      },
    },
  });

  const afterAudience = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "לעסקים",
  });
  assert.equal(afterAudience.onboardingConversation.currentQuestion?.id, "audience-clarification");

  const afterWeakClarification = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "לעסקים",
  });

  assert.equal(afterWeakClarification.onboardingConversation.currentQuestion?.id, "audience-clarification");
  assert.equal(
    afterWeakClarification.onboardingConversation.summary.understoodItems.some((item) => /קהל יעד/u.test(item)),
    false,
  );
  assert.equal(
    afterWeakClarification.onboardingConversation.summary.missingItems.some((item) => /מי עובד עם זה בפועל|מי משתמש בזה בפועל|שליח|מנהל מסלולים|צוות לוגיסטי/u.test(item)),
    true,
  );
});

test("commerce storefront intake treats 'לקוח שלי' as weak audience and asks storefront-wrapper questions", async () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-commerce-storefront",
    projectDraftId: "commerce-storefront-audit",
    initialInput: {
      projectName: "Click Mobile",
      goal: "אתר שמוכר סלולר ואביזרים משלימים",
    },
  });

  const afterAudience = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "לקוח שלי",
  });

  assert.equal(afterAudience.onboardingConversation.currentQuestion?.id, "audience-clarification");
  assert.match(afterAudience.onboardingConversation.currentQuestion?.title ?? "", /בעל העסק שמוכר באתר|לקוח הקצה שקונה ממנו/u);
  assert.equal(
    afterAudience.onboardingConversation.summary.understoodItems.some((item) => /קהל יעד/u.test(item)),
    false,
  );

  const afterClarification = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "בעל העסק שמוכר באתר",
  });

  assert.equal(afterClarification.onboardingConversation.currentQuestion?.id, "core-problem");
  assert.match(afterClarification.onboardingConversation.currentQuestion?.title ?? "", /אני כבר מניח storefront בסיסי|הכאב שבאמת מצדיק/u);

  const afterProblem = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "המלאי והמחירים מתעדכנים ידנית והזמנות נופלות בין האתר לבין העבודה של הצוות",
  });

  assert.equal(afterProblem.onboardingConversation.currentQuestion?.id, "workflow-detail");
  assert.equal(
    afterProblem.onboardingConversation.summary.understoodItems.some((item) => /מבנה בסיסי שאני כבר מניח ל-v1/u.test(item)),
    true,
  );
  assert.equal(
    afterProblem.onboardingConversation.summary.missingItems.some((item) => /חנות שמוכרת מהר|חוויית קנייה חכמה|דיפרנציאציה/u.test(item)),
    true,
  );
});

test("commerce storefront starts in momentum mode with inferred v1 structure", async () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-commerce-momentum",
    projectDraftId: "commerce-momentum",
    initialInput: {
      projectName: "Momentum Storefront",
      goal: "אתר שמוכר סלולרים ואביזרים משלימים",
    },
  });

  const initialState = service.getConversationState(session.sessionId);

  assert.equal(initialState.onboardingConversation.currentQuestion?.id, "target-audience");
  assert.match(initialState.onboardingConversation.currentQuestion?.title ?? "", /חנות אונליין לסלולרים ואביזרים/u);
  assert.match(initialState.onboardingConversation.currentQuestion?.title ?? "", /קטלוג|עגלת קניות|סליקה/u);
  assert.equal(initialState.onboardingConversation.summary.conversationMode, "builder-momentum");
  assert.equal(
    initialState.onboardingConversation.summary.understoodItems.some((item) => /מבנה בסיסי שאני כבר מניח ל-v1/u.test(item)),
    true,
  );
  assert.equal(
    initialState.onboardingConversation.summary.missingItems.some((item) => /חנות פשוטה יחסית|חוויית בחירה חכמה/u.test(item)),
    true,
  );
});

test("post-onboarding correction rewrites self-user truth in the correct perspective", async () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-self-correction",
    projectDraftId: "self-correction",
    initialInput: {
      projectName: "Delivery Helper",
      goal: "אפליקציה שעוזרת לי לנהל שליחויות בשטח",
    },
  });

  await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "שליח בשטח",
  });
  await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "אני מאבד מעקב אחרי הזמנות ומבזבז זמן על חיפוש ידני",
  });
  await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "אפליקציה שמראה לי מיד מה דחוף ומה הצעד הבא",
  });
  await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "המסך הראשון צריך להראות לי מיד מה הכתובת הבאה ומה דחוף עכשיו",
  });

  const correctionResult = service.applyPostOnboardingCorrection({
    sessionId: session.sessionId,
    message: "המשתמש זה אני",
    currentSurface: "understanding",
  });

  assert.equal(correctionResult.conversationState.onboardingConversation.answers["target-audience"], "אני");
  assert.equal(
    correctionResult.conversationState.onboardingConversation.summary.understoodItems.includes("המשתמש המרכזי: אתה בעצמך"),
    true,
  );
  assert.equal(
    correctionResult.conversationState.onboardingConversation.summary.understoodItems.some((item) => /קהל יעד: אני/u.test(item)),
    false,
  );

  const persistedState = service.getConversationState(session.sessionId);
  assert.equal(
    persistedState.onboardingConversation.summary.understoodItems.includes("המשתמש המרכזי: אתה בעצמך"),
    true,
  );
  assert.equal(
    Array.isArray(service.getSession(session.sessionId)?.conversation?.correctionHistory),
    true,
  );
});

test("post-onboarding correction keeps 'לקוח שלי' unresolved and reopens actor truth", async () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-ambiguous-correction",
    projectDraftId: "ambiguous-correction",
    initialInput: {
      projectName: "Click Mobile",
      goal: "אתר שמוכר סלולר ואביזרים משלימים",
    },
  });

  await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "בעל העסק שמוכר באתר",
  });
  await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "המלאי והמחירים מתעדכנים ידנית והזמנות נופלות בין האתר לבין העבודה של הצוות",
  });
  await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "בגרסה הראשונה צריך קטלוג, מלאי ומעקב אחרי הזמנות בלי ליפול בין מערכות",
  });
  await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "המסך הראשון חייב להראות מיד מה דחוף בהזמנות, במלאי ובמחירים",
  });

  const correctionResult = service.applyPostOnboardingCorrection({
    sessionId: session.sessionId,
    message: "לקוח שלי",
    currentSurface: "understanding",
  });

  assert.equal(
    correctionResult.conversationState.onboardingConversation.summary.understoodItems.some((item) => item.includes("המשתמש המרכזי")),
    false,
  );
  assert.equal(
    correctionResult.conversationState.onboardingConversation.summary.missingItems.some((item) => /בעל העסק|לקוח הקצה/u.test(item)),
    true,
  );
  assert.equal(
    service.getSession(session.sessionId)?.conversation?.correctionHistory?.at(-1)?.correctionType,
    "audience-ambiguous-client",
  );
});

test("learning-guided landing-page intake asks for solution before closure when stored signals require it", async () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-learning-landing",
    projectDraftId: "landing-learned",
    initialInput: {
      projectName: "Landing Learned",
      goal: "Build a landing page for clinic leads",
      learningContext: {
        learningDecisionImpact: {
          impactId: "impact-landing",
          strategy: "repair-before-expand",
          drivingSignals: ["failure-signals:3", "approval:approved"],
        },
      },
    },
  });

  await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "Clinic owners",
  });
  const afterProblem = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "The current page does not explain the offer clearly enough to convert",
  });

  assert.equal(afterProblem.onboardingConversation.currentQuestion?.id, "successful-solution");
  assert.match(afterProblem.onboardingConversation.currentQuestion?.reason ?? "", /כשלונות|learning|אי אפשר לעצור/u);
  assert.equal(afterProblem.onboardingConversation.totalQuestions >= 3, true);

  const afterSolution = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "A single-offer landing page with a sharp promise, trust proof, and one CTA",
  });
  assert.equal(afterSolution.onboardingConversation.currentQuestion?.id, "build-direction");

  const completed = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "הכותרת, הוכחת האמון וה־CTA חייבים להיות ברורים מיד מעל הקפל כדי שלא יאבדו את הליד",
  });

  assert.equal(completed.onboardingConversation.isComplete, true);
  assert.equal(completed.onboardingConversation.summary.learningStatus, "live");
  assert.match(completed.onboardingConversation.summary.handoffStrengthLine ?? "", /CTA|הפעולה המרכזית/u);
  assert.match(completed.onboardingConversation.completionReason ?? "", /הלמידה החזיקה|held/i);
});

test("conversation project-class answer overrides stale landing-page intake and keeps product understanding open", async () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-class-override",
    projectDraftId: "stale-landing-intake",
    initialInput: {
      projectName: "Stale Landing Intake",
      goal: "Build a landing page for a business",
    },
  });

  const afterAudience = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "Delivery teams and dispatch owners",
  });
  assert.equal(afterAudience.onboardingConversation.currentQuestion?.id, "core-problem");

  const afterClass = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "אפליקציה",
  });

  assert.equal(afterClass.onboardingConversation.summary.projectType, "mobile-app");
  assert.equal(afterClass.onboardingConversation.currentQuestion?.id, "core-problem");

  const afterProblem = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "Routes close too late because dispatch does not see address and status changes in time",
  });

  assert.equal(afterProblem.onboardingConversation.currentQuestion?.id, "workflow-detail");

  const afterSolution = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "אחרי הסריקה האפליקציה שמה נעץ על המפה, מאפשרת תיקון ידני, ואז עוזרת לסדר את המסלול",
  });

  assert.equal(afterSolution.onboardingConversation.currentQuestion?.id, "successful-solution");
  assert.equal(afterSolution.onboardingConversation.isComplete, false);
});

test("streaming conversation turn emits token events before the final conversation envelope", async () => {
  const service = createTestService(async (payload) => {
    if (typeof payload.onDelta === "function") {
      await payload.onDelta("מה הבעיה ");
      await payload.onDelta("המרכזית שהם מתמודדים איתה?");
    }

    return {
      status: "completed",
      providerId: payload.providerId ?? "openai",
      availability: {
        providerId: payload.providerId ?? "openai",
        availabilityStatus: "ready",
        availabilityReason: null,
      },
      deliveryMode: "live-api",
      model: "gpt-test-stream",
      requestId: "req-stream-1",
      nextQuestion: "מה הבעיה המרכזית שהם מתמודדים איתה?",
      usage: {
        inputTokens: 11,
        outputTokens: 7,
        totalTokens: 18,
      },
      attempts: [{ attemptIndex: 0, status: "completed", durationMs: 12 }],
    };
  });

  const session = service.createSession({
    userId: "user-stream",
    projectDraftId: "streaming-audit",
    initialInput: {
      projectName: "Streaming Audit",
      goal: "Build a landing page for clinics",
    },
  });

  const events = [];
  const finalPayload = await service.streamConversationTurn({
    sessionId: session.sessionId,
    answer: "Clinic owners",
    onEvent: async (event) => {
      events.push(event);
    },
  });

  assert.equal(events[0].event, "turn-start");
  assert.equal(events.some((event) => event.event === "assistant-token"), true);
  assert.equal(events.some((event) => event.event === "assistant-message"), true);
  assert.equal(events.at(-1).event, "conversation-state");
  assert.equal(finalPayload.onboardingConversation.answers["target-audience"], "Clinic owners");
  assert.equal(finalPayload.onboardingConversation.transcript.at(-1).text, "מה הבעיה המרכזית שהם מתמודדים איתה?");
  assert.equal(finalPayload.providerRuntime.runtimeMode, "provider-backed-live");
});

test("streaming conversation turn emits retry and failover events without breaking the same turn", async () => {
  const service = createTestService(async (payload) => {
    if (typeof payload.onStatus === "function") {
      await payload.onStatus({
        type: "provider-retry",
        providerId: "openai",
        failedAttemptNumber: 1,
        nextAttemptNumber: 2,
        maxAttemptCount: 3,
        delayMs: 0,
        reason: "qa_retryable_provider_failure",
        resetPartial: true,
      });
      await payload.onStatus({
        type: "provider-failover",
        fromProviderId: "openai",
        toProviderId: "anthropic",
        reason: "qa_primary_provider_outage",
        resetPartial: true,
      });
    }

    if (typeof payload.onDelta === "function") {
      await payload.onDelta("איזה סוג עסק ", { providerId: "anthropic" });
      await payload.onDelta("בדיוק צריך את הדף?", { providerId: "anthropic" });
    }

    return {
      status: "completed",
      providerId: "anthropic",
      initialProviderId: "openai",
      finalProviderId: "anthropic",
      recoveredByRetry: true,
      failedOver: true,
      recoveryTrail: [
        {
          providerId: "openai",
          attempts: [
            { attemptIndex: 0, status: "failed", durationMs: 1, error: "qa_retryable_provider_failure" },
            { attemptIndex: 1, status: "failed", durationMs: 1, error: "qa_primary_provider_outage" },
            { attemptIndex: 2, status: "failed", durationMs: 1, error: "qa_primary_provider_outage" },
          ],
        },
        {
          providerId: "anthropic",
          attempts: [{ attemptIndex: 0, status: "completed", durationMs: 1 }],
        },
      ],
      availability: {
        providerId: "anthropic",
        availabilityStatus: "ready",
        availabilityReason: null,
      },
      deliveryMode: "live-api",
      model: "claude-test-failover",
      requestId: "req-failover-1",
      nextQuestion: "איזה סוג עסק בדיוק צריך את הדף?",
      usage: {
        inputTokens: 9,
        outputTokens: 5,
        totalTokens: 14,
      },
      attempts: [{ attemptIndex: 0, status: "completed", durationMs: 3 }],
    };
  });

  const session = service.createSession({
    userId: "user-stream-failover",
    projectDraftId: "stream-failover-audit",
    initialInput: {
      projectName: "Stream Failover Audit",
      goal: "Build a landing page for clinics",
      providerChoice: "openai",
    },
  });

  const events = [];
  const finalPayload = await service.streamConversationTurn({
    sessionId: session.sessionId,
    answer: "for a business",
    onEvent: async (event) => {
      events.push(event);
    },
  });

  assert.equal(events[0].event, "turn-start");
  assert.equal(events.some((event) => event.event === "provider-retry"), true);
  assert.equal(events.some((event) => event.event === "provider-failover"), true);
  assert.equal(events.some((event) => event.event === "assistant-token" && event.data.providerId === "anthropic"), true);
  assert.equal(events.some((event) => event.event === "assistant-message" && event.data.providerId === "anthropic"), true);
  assert.equal(events.at(-1).event, "conversation-state");
  assert.equal(finalPayload.providerRuntime.runtimeMode, "provider-backed-live");
  assert.match(finalPayload.providerRuntime.summaryLine ?? "", /ממשיך איתך כרגיל|ממשיך איתך מאותה נקודה/u);
  assert.match(finalPayload.providerRuntime.accountingLine ?? "", /failovers: 1/u);
});

test("uploaded project files can resolve project type before explicit class clarification", () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-uploaded-project",
    projectDraftId: "milan-upload",
    initialInput: {
      projectName: "Milan Co.",
      visionText: "Imported existing local ecommerce project",
    },
  });

  const updated = service.updateIntake({
    sessionId: session.sessionId,
    projectName: "Milan Co.",
    visionText: "Imported existing local ecommerce project",
    uploadedFiles: [
      {
        name: "README.md",
        type: "markdown",
        content: "Full-stack eCommerce system with admin, editor, catalog, orders and checkout.",
      },
      {
        name: "package.json",
        type: "application/json",
        content: "{\"name\":\"milan-co\"}",
      },
    ],
    externalLinks: [],
  });

  const updatedSession = updated.onboardingSession ?? updated.updatedSession;
  assert.equal(updatedSession.projectIntake.projectType, "commerce-ops");
  assert.equal(updatedSession.projectIntake.uploadedFiles.length, 2);
  assert.equal(updatedSession.requiredActions.includes("חדד איזה סוג פרויקט אתה בונה"), false);
});

test("provider-backed onboarding keeps Nexus rules stable across provider selection", async () => {
  const service = createTestService((payload) => ({
    status: "completed",
    providerId: payload.providerId ?? "openai",
    availability: {
      providerId: payload.providerId ?? "openai",
      availabilityStatus: "ready",
      availabilityReason: null,
    },
    deliveryMode: "live-api",
    model: "gpt-5-mini",
    requestId: "resp_test",
    nextQuestion: payload.question?.title ?? "שאלת המשך",
    usage: {
      inputTokens: 12,
      outputTokens: 9,
      totalTokens: 21,
    },
    attempts: [{ attemptIndex: 0, status: "completed", durationMs: 5 }],
  }));
  const session = service.createSession({
    userId: "user-provider-runtime",
    projectDraftId: "provider-runtime-project",
    initialInput: {
      projectName: "Provider Runtime Project",
      goal: "Build a landing page for clinic leads",
      providerChoice: "anthropic",
      learningContext: {
        learningDecisionImpact: {
          impactId: "impact-provider",
          strategy: "repair-before-expand",
          drivingSignals: ["failure-signals:3", "trend:stalled"],
        },
      },
    },
  });

  const initialState = service.getConversationState(session.sessionId);
  assert.equal(initialState.providerRuntime.selectedProviderId, "anthropic");
  assert.equal(initialState.onboardingConversation.providerRuntime.selectedProviderId, "anthropic");
  assert.equal(initialState.onboardingConversation.transcript[0].providerLabel, "Anthropic");

  const switched = service.handleCommand({
    sessionId: session.sessionId,
    actionType: "select-provider",
    payload: { providerId: "openai" },
  });

  assert.equal(switched.updatedSession.initialInput.providerChoice, "openai");
  const switchedState = service.getConversationState(session.sessionId);
  assert.equal(switchedState.providerRuntime.selectedProviderId, "openai");
  assert.match(switchedState.onboardingConversation.transcript.at(-1)?.text ?? "", /OpenAI|אותם כללי intake/u);
  assert.match(switchedState.providerRuntime.enforcementLine ?? "", /התמונה באמת ברורה|להבין/u);

  const afterGeneric = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "for a business",
  });

  assert.equal(afterGeneric.providerRuntime.selectedProviderId, "openai");
  assert.equal(afterGeneric.onboardingConversation.currentQuestion?.id, "audience-clarification");
  assert.equal(afterGeneric.onboardingConversation.summary.clarificationMode, "generic-audience");
  assert.equal(
    afterGeneric.onboardingConversation.summary.understoodItems.some((item) => /קהל יעד/u.test(item)),
    false,
  );
  assert.equal(afterGeneric.onboardingConversation.transcript.at(-1)?.providerLabel, "OpenAI");
  assert.equal(afterGeneric.providerRuntime.runtimeMode, "provider-backed-live");
  assert.match(afterGeneric.providerRuntime.summaryLine ?? "", /ממשיך איתך כרגיל|ממשיך איתך מאותה נקודה/u);
});

test("delivery-app idea stays in product flow instead of leaking into audience truth", async () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-delivery-flow",
    projectDraftId: "delivery-flow-project",
    initialInput: {
      projectName: "Delivery Flow",
      goal: "אני רוצה אפליקציה שיודעת לסרוק כתובות מקרטונים של משלוחים ושמה את הכתובת על המפה",
    },
  });

  const initialState = service.getConversationState(session.sessionId);
  assert.equal(initialState.onboardingConversation.currentQuestion?.id, "target-audience");

  const afterAudience = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "אני רוצה אפליקציה שיודעת לסרוק כתובות מקרטונים של משלוחים ושמה את הכתובת על המפה",
  });

  assert.equal(afterAudience.onboardingConversation.answers["core-idea"], "אני רוצה אפליקציה שיודעת לסרוק כתובות מקרטונים של משלוחים ושמה את הכתובת על המפה");
  assert.equal(afterAudience.onboardingConversation.answers["target-audience"], undefined);
  assert.equal(afterAudience.onboardingConversation.currentQuestion?.id, "target-audience");
  assert.match(afterAudience.onboardingConversation.transcript.at(-1)?.text ?? "", /מי משתמש בזה בפועל/u);
  assert.equal(
    afterAudience.onboardingConversation.summary.understoodItems.some((item) => /קהל יעד:/u.test(item)),
    false,
  );
});

test("delivery-app conversation acknowledges wrong question feedback and reframes", async () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-delivery-feedback",
    projectDraftId: "delivery-feedback-project",
    initialInput: {
      projectName: "Delivery Feedback",
      goal: "אני רוצה אפליקציה שיודעת לסרוק כתובות מקרטונים של משלוחים ושמה את הכתובת על המפה",
    },
  });

  await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "שליחים בשטח",
  });

  const afterFeedback = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "זאת לא שאלה שמתאימה",
  });

  assert.match(afterFeedback.onboardingConversation.transcript.at(-1)?.text ?? "", /צודק/);
  assert.match(afterFeedback.onboardingConversation.transcript.at(-1)?.text ?? "", /שליח|מנהל מסלולים|מוקד/u);
  assert.equal(afterFeedback.onboardingConversation.isComplete, false);
});

test("delivery-app conversation explains confusing term simply and asks a clearer question", async () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-delivery-term",
    projectDraftId: "delivery-term-project",
    initialInput: {
      projectName: "Delivery Term",
      goal: "אני רוצה אפליקציה שיודעת לסרוק כתובות מקרטונים של משלוחים ושמה את הכתובת על המפה",
    },
  });

  await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "שליחים בשטח",
  });
  await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "היום הכתובת מודפסת על הקרטון והשליח מקליד אותה ידנית",
  });
  await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "האפליקציה צריכה לשים את הכתובת על המפה ולעזור גם לסדר את המסלול",
  });
  await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "לא צריך להקליד ידנית, רואים מיד איפה כל משלוח נמצא, וקל יותר לסדר את היום",
  });

  const afterClarification = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "מה זה משטח ראשון?",
  });

  assert.match(afterClarification.onboardingConversation.transcript.at(-1)?.text ?? "", /התכוונתי בפשטות/);
  assert.doesNotMatch(afterClarification.onboardingConversation.transcript.at(-1)?.text ?? "", /משטח/u);
  assert.match(afterClarification.onboardingConversation.transcript.at(-1)?.text ?? "", /מה חייב להיות ברור/u);
});

test("landing-page idea answered in the audience slot gets reframed toward the real user of the page", async () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-landing-flow",
    projectDraftId: "landing-flow-project",
    initialInput: {
      projectName: "Landing Flow",
      goal: "אני רוצה דף נחיתה שמביא יותר פניות לקליניקה",
    },
  });

  const afterAudience = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "אני רוצה דף נחיתה שמביא יותר פניות לקליניקה",
  });

  assert.equal(afterAudience.onboardingConversation.currentQuestion?.id, "target-audience");
  assert.match(afterAudience.onboardingConversation.transcript.at(-1)?.text ?? "", /מי הבן אדם שבאמת צריך את הדף הזה/u);
  assert.doesNotMatch(afterAudience.onboardingConversation.transcript.at(-1)?.text ?? "", /משלוחים|כתובות|מפה/u);
});

test("internal-tool idea answered in the audience slot gets reframed toward the real team", async () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-internal-flow",
    projectDraftId: "internal-flow-project",
    initialInput: {
      projectName: "Internal Flow",
      goal: "אני רוצה כלי פנימי שמסדר פניות שירות בין נציגים ומשמרות",
    },
  });

  const afterAudience = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "אני רוצה כלי פנימי שמסדר פניות שירות בין נציגים ומשמרות",
  });

  assert.equal(afterAudience.onboardingConversation.currentQuestion?.id, "target-audience");
  assert.match(afterAudience.onboardingConversation.transcript.at(-1)?.text ?? "", /מי הבן אדם או הצוות/u);
  assert.doesNotMatch(afterAudience.onboardingConversation.transcript.at(-1)?.text ?? "", /משלוחים|כתובות|מפה/u);
});

test("provider-backed onboarding exposes unavailable provider truth from qa availability overrides", () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-provider-availability",
    projectDraftId: "provider-availability-project",
    initialInput: {
      projectName: "Provider Availability Project",
      goal: "Build a live onboarding assistant",
      providerChoice: "openai",
      qaAvailabilityOverrides: {
        anthropic: {
          availabilityStatus: "missing-key",
          availabilityReason: "ANTHROPIC_API_KEY",
        },
      },
    },
  });

  const initialState = service.getConversationState(session.sessionId);
  const anthropicOption = initialState.providerRuntime.availableProviders.find((provider) => provider.providerId === "anthropic");
  assert.equal(anthropicOption?.availabilityStatus, "missing-key");
  assert.equal(anthropicOption?.availabilityReason, "ANTHROPIC_API_KEY");
  assert.equal(anthropicOption?.disabled, true);
  assert.match(initialState.providerRuntime.availabilityLine ?? "", /Anthropic עדיין לא זמין כרגע/);

  const switched = service.handleCommand({
    sessionId: session.sessionId,
    actionType: "select-provider",
    payload: { providerId: "anthropic" },
  });

  const switchedSession = switched.updatedSession ?? switched.onboardingSession;
  assert.equal(switchedSession.providerRuntime.selectedProviderId, "openai");
  assert.match(switchedSession.conversation.transcript.at(-1)?.text ?? "", /Anthropic לא זמין כרגע/u);
});

test("provider runtime does not keep a failed live provider marked ready", async () => {
  const service = createTestService();
  service.providerClient.generateDiscoveryResponse = async (payload) => ({
    status: "failed",
    providerId: payload.providerId ?? "openai",
    finalProviderId: payload.providerId ?? "openai",
    availability: {
      providerId: payload.providerId ?? "openai",
      availabilityStatus: "ready",
      availabilityReason: null,
    },
    deliveryMode: "shell",
    attempts: [
      {
        attemptIndex: 0,
        status: "failed",
        error: "provider-error",
      },
    ],
    error: {
      code: "provider-error",
      errorClass: "provider-error",
      retryable: false,
    },
    recoveryTrail: [
      {
        providerId: payload.providerId ?? "openai",
        status: "failed",
        attempts: [
          {
            attemptIndex: 0,
            status: "failed",
            error: "provider-error",
          },
        ],
        error: {
          code: "provider-error",
        },
      },
    ],
  });
  const session = service.createSession({
    userId: "user-provider-failed-ready",
    projectDraftId: "provider-failed-ready-project",
    initialInput: {
      projectName: "Provider Failed Ready Project",
      goal: "מערכת דשבורד לצוות מכירות שמנהלת לידים כדי שלא מפספסים follow-up. המשתמש המרכזי הוא איש מכירות, הכאב הוא איבוד לידים בין שיחות, וה-flow הראשון הוא רשימת לידים עם בעלות, תזכורת וצעד הבא.",
      providerChoice: "openai",
    },
  });

  const primed = await service.primeDiscoveryAgentResponse({ sessionId: session.sessionId });
  const openAiOption = primed.providerRuntime.availableProviders.find((provider) => provider.providerId === "openai");
  assert.equal(primed.providerRuntime.runtimeMode, "provider-backed-degraded");
  assert.equal(openAiOption?.availabilityStatus, "degraded");
  assert.equal(openAiOption?.availabilityReason, "provider-error");
  assert.equal(openAiOption?.disabled, true);
  assert.match(primed.providerRuntime.availabilityLine ?? "", /OpenAI עדיין לא זמין כרגע/u);
  assert.notEqual(createProjectDiscoveryAgentState({
    visionText: session.initialInput.goal,
    conversation: primed.onboardingConversation,
  }).agentResponseSource, "agent-composed-transcript");
});

test("AGT-001D — meta-question about the agent does not fill a product slot and gets a direct reply", async () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-meta",
    projectDraftId: "meta-app",
    initialInput: {
      projectName: "תבנה לי אפליקציה",
      visionText: "תבנה לי אפליקציה",
    },
  });

  // visionText already seeds core-idea internally; the next slot the conversation
  // wants to fill is target-audience. Send the meta-question directly.
  // BEFORE AGT-001D this text landed straight into target-audience. After the fix it must not.
  const beforeAnswers = service.getConversationState(session.sessionId).onboardingConversation.answers;
  const afterMetaTurn = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "אתה סוכן אמיתי ? או שאתה מנוע של שאלות מוכנות מראש ?",
  });
  const postMetaAnswers = afterMetaTurn.onboardingConversation.answers;
  const lastAi = afterMetaTurn.onboardingConversation.transcript.at(-1);

  // The meta-question text must not appear in ANY product slot.
  for (const key of Object.keys(postMetaAnswers)) {
    assert.notEqual(
      postMetaAnswers[key],
      "אתה סוכן אמיתי ? או שאתה מנוע של שאלות מוכנות מראש ?",
      `meta-question must not fill slot "${key}"`,
    );
  }
  // Existing product answers are not lost.
  if (beforeAnswers["core-idea"]) {
    assert.equal(postMetaAnswers["core-idea"], beforeAnswers["core-idea"]);
  }

  // The agent replies directly to the meta-question.
  assert.equal(lastAi.speaker, "ai");
  assert.match(lastAi.text, /סוכן השיחה של נקסוס|מודל LLM חי|לא טופס/u);

  // The pending question (target-audience) is preserved so the user can actually answer it.
  assert.equal(afterMetaTurn.onboardingConversation.currentQuestion?.id, "target-audience");
});

test("AGT-001D — past poisoned slots get flushed when a meta-question is detected", async () => {
  const service = createTestService();
  const session = service.createSession({
    userId: "user-flush",
    projectDraftId: "flush-app",
    initialInput: {
      projectName: "תבנה לי אפליקציה",
      visionText: "תבנה לי אפליקציה",
    },
  });

  // Simulate a session that was poisoned before this fix landed:
  // we feed a meta-question while target-audience already (wrongly) holds another meta-question.
  await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "תבנה לי אפליקציה",
  });
  // Manually inject the legacy poisoned state into the session conversation answers,
  // mimicking what the old code did before the gate landed.
  const stored = service.getSession(session.sessionId);
  stored.conversation.answers["target-audience"] = "אתה סוכן אמיתי ? או שאתה מנוע של מערכת ?";
  stored.conversation.answers["core-problem"] = "אתה סוכן אמיתי ? או שאתה מנוע של שאלות מוכנות מראש ?";

  const recovered = await service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "אתה LLM אמיתי ?",
  });
  const cleanedAnswers = recovered.onboardingConversation.answers;

  assert.equal(cleanedAnswers["target-audience"] ?? "", "", "previously-poisoned target-audience must be flushed");
  assert.equal(cleanedAnswers["core-problem"] ?? "", "", "previously-poisoned core-problem must be flushed");
  assert.equal(cleanedAnswers["core-idea"], "תבנה לי אפליקציה");
});
