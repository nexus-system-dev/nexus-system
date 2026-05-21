import test from "node:test";
import assert from "node:assert/strict";

import { OnboardingService } from "../src/core/onboarding-service.js";

test("onboarding conversation creates adaptive transcript and summary", () => {
  const service = new OnboardingService();
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
  assert.match(initialState.onboardingConversation.transcript[0].text, /מי המשתמשים שצריכים לנהל את העבודה בתוך המוצר/);
  assert.deepEqual(initialState.onboardingConversation.summary.understoodItems, []);
  assert.match(initialState.onboardingConversation.summary.missingItems[0], /קהל היעד/);
  assert.equal(initialState.onboardingConversation.totalQuestions, 1);

  const afterAudience = service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "לבעלי עסקים קטנים",
  });
  assert.equal(afterAudience.onboardingConversation.answers["target-audience"], "לבעלי עסקים קטנים");
  assert.equal(afterAudience.onboardingConversation.currentQuestion?.id, "core-problem");
  assert.equal(afterAudience.onboardingConversation.totalQuestions, 2);
  assert.match(
    afterAudience.onboardingConversation.transcript.at(-1).text,
    /אם המערכת נבנית עבור .*בעלי עסקים קטנים, מה הבעיה המרכזית/,
  );

  const afterProblem = service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "קשה להם לנהל לקוחות ולעקוב אחרי מכירות",
  });
  assert.equal(afterProblem.onboardingConversation.answers["core-problem"], "קשה להם לנהל לקוחות ולעקוב אחרי מכירות");
  assert.equal(afterProblem.onboardingConversation.currentQuestion?.id, "successful-solution");
  assert.equal(afterProblem.onboardingConversation.totalQuestions, 3);
  assert.match(
    afterProblem.onboardingConversation.transcript.at(-1).text,
    /הקהל הוא .*בעלי עסקים קטנים והכאב המרכזי הוא קשה להם לנהל לקוחות ולעקוב אחרי מכירות/,
  );

  const completed = service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "כלי לקוחות פשוט ונוח עם התראות",
  });
  assert.equal(completed.onboardingConversation.isComplete, true);
  assert.equal(completed.onboardingConversation.currentQuestion, null);
  assert.match(completed.onboardingConversation.completionReason, /קהל יעד, כאב מרכזי ותמונת פתרון/);
  assert.deepEqual(completed.onboardingConversation.summary.understoodItems, [
    "קהל יעד: לבעלי עסקים קטנים",
    "בעיה מרכזית: קשה להם לנהל לקוחות ולעקוב אחרי מכירות",
    "כיוון למוצר: כלי לקוחות פשוט ונוח עם התראות",
  ]);
  assert.match(completed.onboardingConversation.summary.missingItems[0], /מה הפעולה הראשונה אחרי כניסה למוצר/);
  assert.equal(completed.onboardingConversation.summary.projectType, "saas");
});

test("onboarding conversation summary stays class-safe for landing-page projects", () => {
  const service = new OnboardingService();
  const session = service.createSession({
    userId: "user-landing",
    projectDraftId: "landing-page-audit",
    initialInput: {
      projectName: "Landing Audit",
      goal: "Build a landing page for a clinic offer",
    },
  });

  const afterAudience = service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "Clinic owners",
  });
  assert.equal(afterAudience.onboardingConversation.currentQuestion?.id, "core-problem");
  assert.equal(afterAudience.onboardingConversation.totalQuestions, 2);

  const completed = service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "The current page does not explain the offer clearly enough to convert",
  });

  assert.equal(completed.onboardingConversation.summary.projectType, "landing-page");
  assert.equal(completed.onboardingConversation.isComplete, true);
  assert.equal(completed.onboardingConversation.currentIndex, 2);
  assert.equal(completed.onboardingConversation.totalQuestions, 2);
  assert.match(completed.onboardingConversation.completionReason, /מספיק הבנה כדי לסכם דף נחיתה/);
  assert.deepEqual(completed.onboardingConversation.summary.understoodItems, [
    "קהל יעד: Clinic owners",
    "בעיה מרכזית: The current page does not explain the offer clearly enough to convert",
  ]);
  assert.equal(completed.onboardingConversation.summary.missingItems.includes("כמה מכירות קיימות"), false);
  assert.equal(completed.onboardingConversation.summary.missingItems.includes("כמה לקוחות יש להם"), false);
  assert.match(completed.onboardingConversation.summary.missingItems[0], /מעל הקפל/);
});

test("onboarding conversation summary stays class-safe for internal tools", () => {
  const service = new OnboardingService();
  const session = service.createSession({
    userId: "user-internal",
    projectDraftId: "internal-tool-audit",
    initialInput: {
      projectName: "Internal Audit",
      goal: "Build an internal backoffice queue for onboarding support reps",
    },
  });

  service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "Onboarding support reps",
  });
  const afterProblem = service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "Queue ownership is unclear and follow-ups are missed",
  });
  assert.equal(afterProblem.onboardingConversation.currentQuestion?.id, "project-class");
  service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "This is an internal tool for queue ownership and SLA handling",
  });
  const completed = service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "A queue workspace with ownership, SLA visibility, and a clear next action",
  });

  assert.equal(completed.onboardingConversation.summary.projectType, "internal-tool");
  assert.deepEqual(completed.onboardingConversation.summary.understoodItems, [
    "קהל יעד: Onboarding support reps",
    "בעיה מרכזית: Queue ownership is unclear and follow-ups are missed",
    "כיוון לזרימת העבודה: A queue workspace with ownership, SLA visibility, and a clear next action",
  ]);
  assert.equal(completed.onboardingConversation.summary.missingItems.includes("כמה מכירות קיימות"), false);
  assert.equal(completed.onboardingConversation.summary.missingItems.includes("כמה לקוחות יש להם"), false);
  assert.match(completed.onboardingConversation.summary.missingItems[0], /הבעלות על התור/);
});

test("onboarding inserts a class-disambiguation question when the class is ambiguous", () => {
  const service = new OnboardingService();
  const session = service.createSession({
    userId: "user-ambiguous",
    projectDraftId: "clinic-crm-landing",
    initialInput: {
      projectName: "Clinic CRM Landing",
      goal: "Build a CRM landing page for clinic leads",
    },
  });

  const afterAudience = service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "Clinic owners",
  });

  assert.equal(afterAudience.onboardingConversation.currentQuestion?.id, "project-class");
  assert.match(
    afterAudience.onboardingConversation.currentQuestion?.title ?? "",
    /כדי לא להוביל את .* מה הדבר המרכזי שאתה בונה כאן: דף נחיתה שיווקי, כלי פנימי לצוות, או מוצר SaaS קטן/u,
  );
  assert.match(
    afterAudience.onboardingConversation.transcript.at(-1)?.text ?? "",
    /מה הדבר המרכזי שאתה בונה כאן: דף נחיתה שיווקי, כלי פנימי לצוות, או מוצר SaaS קטן/,
  );
  assert.match(afterAudience.onboardingConversation.currentQuestion?.reason ?? "", /לנעול את סוג הפרויקט/);
  assert.equal(afterAudience.onboardingConversation.totalQuestions, 3);

  const afterClass = service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "This is a landing page for a clinic offer",
  });

  assert.equal(afterClass.onboardingConversation.currentQuestion?.id, "core-problem");
  assert.equal(afterClass.onboardingConversation.totalQuestions, 3);
  assert.match(afterClass.onboardingConversation.transcript.at(-1).text, /מה הבעיה המרכזית/);

  const completed = service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "The current page mixes too many messages and loses conversions",
  });

  assert.equal(completed.onboardingConversation.isComplete, true);
  assert.equal(completed.onboardingConversation.currentQuestion, null);
  assert.equal(completed.onboardingConversation.summary.projectType, "landing-page");
});

test("learning-guided intake blocks generic audience answers and asks a sharper follow-up", () => {
  const service = new OnboardingService();
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

  const afterAudience = service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "for a business",
  });

  assert.equal(afterAudience.onboardingConversation.currentQuestion?.id, "audience-clarification");
  assert.match(afterAudience.onboardingConversation.currentQuestion?.title ?? "", /עדיין כללית מדי|too generic/u);
  assert.match(afterAudience.onboardingConversation.currentQuestion?.reason ?? "", /generation גנרי|clarify/u);
  assert.equal(afterAudience.onboardingConversation.summary.learningStatus, "live");
  assert.equal(afterAudience.onboardingConversation.summary.clarificationMode, "generic-audience");

  const afterClarification = service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "Clinic owners who need to return leads quickly without a sales team",
  });

  assert.equal(afterClarification.onboardingConversation.currentQuestion?.id, "project-class");
  assert.match(afterClarification.onboardingConversation.summary.understoodItems[0], /Clinic owners/);
});

test("learning-guided landing-page intake asks for solution before closure when stored signals require it", () => {
  const service = new OnboardingService();
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

  service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "Clinic owners",
  });
  const afterProblem = service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "The current page does not explain the offer clearly enough to convert",
  });

  assert.equal(afterProblem.onboardingConversation.currentQuestion?.id, "successful-solution");
  assert.match(afterProblem.onboardingConversation.currentQuestion?.reason ?? "", /כשלונות|learning|אי אפשר לעצור/u);
  assert.equal(afterProblem.onboardingConversation.totalQuestions >= 3, true);

  const completed = service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "A single-offer landing page with a sharp promise, trust proof, and one CTA",
  });

  assert.equal(completed.onboardingConversation.isComplete, true);
  assert.equal(completed.onboardingConversation.summary.learningStatus, "live");
  assert.match(completed.onboardingConversation.summary.handoffStrengthLine ?? "", /CTA|handoff/u);
  assert.match(completed.onboardingConversation.completionReason ?? "", /הלמידה כבר החזיקה|held/i);
});

test("uploaded project files can resolve project type before explicit class clarification", () => {
  const service = new OnboardingService();
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

test("provider-backed onboarding keeps Nexus rules stable across provider selection", () => {
  const service = new OnboardingService();
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
  assert.match(switchedState.providerRuntime.enforcementLine ?? "", /class gates/i);

  const afterGeneric = service.submitConversationTurn({
    sessionId: session.sessionId,
    answer: "for a business",
  });

  assert.equal(afterGeneric.providerRuntime.selectedProviderId, "openai");
  assert.equal(afterGeneric.onboardingConversation.currentQuestion?.id, "audience-clarification");
  assert.equal(afterGeneric.onboardingConversation.summary.clarificationMode, "generic-audience");
  assert.equal(afterGeneric.onboardingConversation.transcript.at(-1)?.providerLabel, "OpenAI");
});
