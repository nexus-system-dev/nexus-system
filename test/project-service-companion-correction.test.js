import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ProjectService } from "../src/core/project-service.js";

function createProjectService(directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-project-companion-"))) {
  return new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
}

test("project companion correction updates the onboarding session truth and returns refreshed understanding", async () => {
  const service = createProjectService();
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "test-openai-key";
  service.onboarding.providerClient.generateNextQuestion = async () => ({
    status: "unavailable",
    providerId: "openai",
    availability: {
      providerId: "openai",
      availabilityStatus: "missing-key",
      availabilityReason: "OPENAI_API_KEY",
    },
    deliveryMode: "shell",
  });
  service.onboarding.providerClient.generateCompanionReply = async () => ({
    status: "unavailable",
    providerId: "openai",
    deliveryMode: "shell",
  });

  const session = service.createOnboardingSession({
    userId: "user-companion-correction",
    projectDraftId: "companion-correction-project",
    initialInput: {
      projectName: "Delivery Helper",
      visionText: "אפליקציה שעוזרת לי לנהל שליחויות בשטח",
    },
  });

  await service.submitOnboardingConversationTurn({
    sessionId: session.sessionId,
    answer: "שליח בשטח",
  });
  await service.submitOnboardingConversationTurn({
    sessionId: session.sessionId,
    answer: "אני מאבד מעקב אחרי הזמנות ומבזבז זמן על חיפוש ידני",
  });
  await service.submitOnboardingConversationTurn({
    sessionId: session.sessionId,
    answer: "אפליקציה שמראה לי מיד מה דחוף ומה הצעד הבא",
  });
  await service.submitOnboardingConversationTurn({
    sessionId: session.sessionId,
    answer: "המסך הראשון צריך להראות לי מיד מה הכתובת הבאה ומה דחוף עכשיו",
  });

  const onboardingSession = service.getOnboardingSession(session.sessionId);
  service.createProject({
    id: "companion-correction-project",
    name: "Delivery Helper",
    goal: "אפליקציה שעוזרת לי לנהל שליחויות בשטח",
    onboardingSession,
    userId: "user-companion-correction",
  });

  const result = await service.submitProjectCompanionTurn({
    projectId: "companion-correction-project",
    sessionId: session.sessionId,
    message: "המשתמש זה אני",
    currentSurface: "understanding",
  });

  assert.equal(result.truth.understoodItems.includes("המשתמש המרכזי: אתה בעצמך"), true);
  assert.equal(result.conversationState.onboardingConversation.answers["target-audience"], "אני");
  assert.equal(
    result.conversationState.onboardingConversation.summary.understoodItems.some((item) => /קהל יעד: אני/u.test(item)),
    false,
  );
  assert.match(result.reply, /אתה בעצמך|נקודת המבט/u);
});

test("project companion shell reply brings bounded comparable-product intelligence into the dialogue", async () => {
  const service = createProjectService();
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "test-openai-key";
  service.onboarding.providerClient.generateNextQuestion = async () => ({
    status: "unavailable",
    providerId: "openai",
    deliveryMode: "shell",
  });
  service.onboarding.providerClient.generateCompanionReply = async () => ({
    status: "unavailable",
    providerId: "openai",
    deliveryMode: "shell",
  });

  const session = service.createOnboardingSession({
    userId: "user-companion-comparable",
    projectDraftId: "companion-comparable-project",
    initialInput: {
      projectName: "Click Mobile",
      visionText: "אתר שמוכר סלולר ואביזרים משלימים",
    },
  });

  await service.submitOnboardingConversationTurn({
    sessionId: session.sessionId,
    answer: "בעל העסק שמוכר באתר",
  });
  await service.submitOnboardingConversationTurn({
    sessionId: session.sessionId,
    answer: "המלאי והמחירים מתעדכנים ידנית ונופלות הזמנות",
  });

  const onboardingSession = service.getOnboardingSession(session.sessionId);
  service.createProject({
    id: "companion-comparable-project",
    name: "Click Mobile",
    goal: "אתר שמוכר סלולר ואביזרים משלימים",
    onboardingSession,
    userId: "user-companion-comparable",
  });

  const result = await service.submitProjectCompanionTurn({
    projectId: "companion-comparable-project",
    sessionId: session.sessionId,
    message: "במוצרים דומים למה עוד כדאי לשים לב?",
    currentSurface: "loop",
  });

  assert.match(result.reply, /קנייה כאורח|התחברות|סליקה/u);
  assert.match(result.reply, /אצלך/u);
});

test("project companion can persist an adopted comparable-product decision back into truth", async () => {
  const service = createProjectService();
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "test-openai-key";
  service.onboarding.providerClient.generateNextQuestion = async () => ({
    status: "unavailable",
    providerId: "openai",
    deliveryMode: "shell",
  });
  service.onboarding.providerClient.generateCompanionReply = async () => ({
    status: "unavailable",
    providerId: "openai",
    deliveryMode: "shell",
  });

  const session = service.createOnboardingSession({
    userId: "user-companion-build-direction",
    projectDraftId: "companion-build-direction-project",
    initialInput: {
      projectName: "Click Mobile",
      visionText: "אתר שמוכר סלולר ואביזרים משלימים",
    },
  });

  await service.submitOnboardingConversationTurn({
    sessionId: session.sessionId,
    answer: "בעל העסק שמוכר באתר",
  });
  await service.submitOnboardingConversationTurn({
    sessionId: session.sessionId,
    answer: "המלאי והמחירים מתעדכנים ידנית ונופלות הזמנות",
  });
  await service.submitOnboardingConversationTurn({
    sessionId: session.sessionId,
    answer: "אני רוצה חנות שעוזרת למכור בלי טעויות מלאי",
  });

  const onboardingSession = service.getOnboardingSession(session.sessionId);
  service.createProject({
    id: "companion-build-direction-project",
    name: "Click Mobile",
    goal: "אתר שמוכר סלולר ואביזרים משלימים",
    onboardingSession,
    userId: "user-companion-build-direction",
  });

  const result = await service.submitProjectCompanionTurn({
    projectId: "companion-build-direction-project",
    sessionId: session.sessionId,
    message: "בגרסה הראשונה צריך שהלקוח יקנה כאורח בלי התחברות",
    currentSurface: "loop",
  });

  assert.equal(
    result.conversationState.onboardingConversation.answers["build-direction"],
    "שהלקוח יקנה כאורח בלי התחברות",
  );
  assert.equal(
    result.truth.understoodItems.some((item) => /יקנה כאורח בלי התחברות|קנייה כאורח בלי התחברות/u.test(item)),
    true,
  );
  assert.match(result.reply, /בגרסה הראשונה/u);
});
