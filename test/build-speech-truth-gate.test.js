import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ProjectService } from "../src/core/project-service.js";
import {
  classifyBuildSpeechRequestClass,
  extractRequestedFieldName,
  replyClaimsAppliedChange,
  resolveFreeTextMutationOperation,
  enforceBuildSpeechBoundary,
} from "../src/core/build-speech-truth-gate.js";
import { buildLoopCoreViewModel } from "../web/nexus-ui/adapters/loop-adapter.js";
import { renderLoopCoreScreen } from "../web/nexus-ui/screens/LoopCoreScreen.js";

function createProjectService(directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-build-speech-truth-"))) {
  return new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
}

function createLeadProject(service, id = "build-speech-truth-leads") {
  const project = service.createProject({
    id,
    name: "ניהול לידים",
    goal: "כלי פנימי לניהול לידים עם סטטוס, אחראי, תזכורת וצעד הבא.",
    userId: "demo-user",
  });
  project.artifactExpectation = {
    projectType: "internal tool",
    title: "רשימת לידים עם אחריות",
  };
  project.productSkeletonAgentOutput = {
    agentId: "product-skeleton-agent",
    responseSource: "provider-composed",
    productType: "internal tool for lead follow up",
    primaryUser: "בעל עסק קטן",
    primaryProblem: "לידים נופלים כי אין אחראי ותזכורת",
    firstWorkflow: { title: "רשימת לידים", steps: ["הוסף ליד", "שייך אחראי"] },
    initialActions: ["הוסף ליד"],
    dataObjects: [{ name: "ליד", fields: ["שם", "סטטוס", "אחראי", "תזכורת", "צעד הבא"] }],
    versionOneBoundary: { buildNow: ["טבלה", "אחראי", "תזכורת"], doNotBuildNow: ["וואטסאפ"] },
  };
  return service.rebuildContext(id);
}

function stubProviderFakeSuccess(service, replyText = "הבנתי — הוספתי את זה, מעדכן ומייצר שלד מעודכן.") {
  let called = false;
  service.onboarding.providerClient.generateCompanionReply = async () => {
    called = true;
    return {
      status: "completed",
      providerId: "openai",
      deliveryMode: "provider",
      reply: replyText,
    };
  };
  return () => called;
}

test("BUILD-SPEECH-TRUTH-001 — request classification covers the canonical request classes", () => {
  assert.equal(classifyBuildSpeechRequestClass("תוסיף לכל ליד שדה תקציב משוער"), "field-add");
  assert.equal(classifyBuildSpeechRequestClass("תוסיף מסך של דוחות חודשיים"), "screen-add");
  assert.equal(classifyBuildSpeechRequestClass("תוסיף כפתור ייצוא לאקסל"), "action-add");
  assert.equal(classifyBuildSpeechRequestClass("תשנה את הכותרת של המסך הראשי"), "copy-change");
  assert.equal(classifyBuildSpeechRequestClass("תהפוך את זה לאפליקציית הזמנות"), "product-direction");
  assert.equal(classifyBuildSpeechRequestClass("תחבר לי וואטסאפ ותפרסם את זה"), "external-action");
  assert.equal(classifyBuildSpeechRequestClass("תבדוק שהמסך הזה עובד"), "verification");
});

test("BUILD-SPEECH-TRUTH-001 — field name extraction works for novel wording", () => {
  assert.equal(extractRequestedFieldName("תוסיף לכל ליד שדה תקציב משוער"), "תקציב משוער");
  assert.equal(extractRequestedFieldName("תוסיף שדה בדיקת אשראי לכל לקוח"), "בדיקת אשראי");
  assert.equal(extractRequestedFieldName("add a field called estimated budget for each lead"), "estimated budget");
  assert.equal(extractRequestedFieldName("תוסיף שדה חדש"), "");
});

test("BUILD-SPEECH-TRUTH-001 — success-claim detection is negation-aware", () => {
  assert.equal(replyClaimsAppliedChange("הבנתי — הוספתי שדה תקציב משוער ומעדכן את השלד."), true);
  assert.equal(replyClaimsAppliedChange("done, the field has been added."), true);
  assert.equal(replyClaimsAppliedChange("השינוי לא בוצע והמוצר נשאר כמו שהיה."), false);
  assert.equal(replyClaimsAppliedChange("אני לא אגיד שזה בוצע לפני שיש תוצאה אמיתית."), false);
  assert.equal(replyClaimsAppliedChange("הבקשה תעבור למסלול שינוי לפני שאגיד שהיא בוצעה."), false);
});

test("BUILD-SPEECH-TRUTH-001 — arbitrary field request creates real domain/schema/history change", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-build-speech-field-"));
  const service = createProjectService(directory);
  createLeadProject(service, "speech-truth-field");
  const providerCalled = stubProviderFakeSuccess(service);

  const turn = await service.submitProjectCompanionTurn({
    projectId: "speech-truth-field",
    message: "תוסיף לכל ליד שדה תקציב משוער",
    currentSurface: "loop",
  });

  assert.equal(turn.buildAgentDownstreamResult.status, "applied");
  assert.notEqual(turn.buildAgentDownstreamResult.mutationId, "");
  assert.equal(turn.buildSpeechTruth.speechState, "applied");
  assert.equal(turn.buildSpeechTruth.requestClass, "field-add");
  assert.equal(turn.buildSpeechTruth.mayClaimChanged, true);
  assert.equal(turn.project.runtimeSkeletonTruth.fields.includes("תקציב משוער"), true);
  assert.equal(
    turn.project.productDomainSkeleton.models[0].fields.some((field) => field.name === "תקציב משוער"),
    true,
  );
  assert.equal(turn.project.buildSpeechHistory.at(-1).applied, true);
  assert.equal(turn.project.buildSpeechHistory.at(-1).requestClass, "field-add");
  assert.equal(providerCalled(), false);

  // Refresh: applied truth must restore from project truth.
  const restoredService = createProjectService(directory);
  const restored = restoredService.getProject("speech-truth-field");
  assert.equal(restored.runtimeSkeletonTruth.fields.includes("תקציב משוער"), true);
  assert.equal(restored.buildSpeechHistory.at(-1).applied, true);
});

test("BUILD-SPEECH-TRUTH-001 — unsupported request returns truthful not-applied state, transcript keeps no fake success after refresh", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-build-speech-unsupported-"));
  const service = createProjectService(directory);
  createLeadProject(service, "speech-truth-unsupported");
  stubProviderFakeSuccess(service, "מעולה! הוספתי את המסך החדש ומעדכן את השלד עכשיו.");

  const before = service.getProject("speech-truth-unsupported");
  const screensBefore = JSON.stringify(before.runtimeSkeletonTruth ?? {});

  const turn = await service.submitProjectCompanionTurn({
    projectId: "speech-truth-unsupported",
    message: "תוסיף מסך של דוחות חודשיים עם גרפים",
    currentSurface: "loop",
  });

  assert.equal(turn.buildSpeechTruth.speechState, "unsupported-not-yet");
  assert.equal(turn.buildSpeechTruth.requestClass, "screen-add");
  assert.equal(turn.buildSpeechTruth.mayClaimChanged, false);
  assert.equal(replyClaimsAppliedChange(turn.reply), false);
  assert.match(turn.reply, /לא יודע להחיל|נשאר כמו שהוא/u);
  assert.equal(turn.project.buildSpeechHistory.at(-1).applied, false);
  assert.equal(JSON.stringify(turn.project.runtimeSkeletonTruth ?? {}), screensBefore);

  // Refresh: the transcript must not contain a success claim for the un-applied change.
  const restoredService = createProjectService(directory);
  const restored = restoredService.getProject("speech-truth-unsupported");
  const transcript = restored.companionConversation.transcript;
  const aiReplies = transcript.filter((entry) => entry.speaker === "ai");
  assert.equal(aiReplies.length > 0, true);
  for (const entry of aiReplies) {
    assert.equal(replyClaimsAppliedChange(entry.text), false, `transcript kept fake success: ${entry.text}`);
  }
  assert.equal(restored.buildSpeechHistory.at(-1).applied, false);
});

test("BUILD-SPEECH-TRUTH-001 — provider fake-success speech is bounded on clarification-required state", async () => {
  const service = createProjectService();
  createLeadProject(service, "speech-truth-provider-claim");
  stubProviderFakeSuccess(service, "סגור, עדכנתי את זה ועכשיו זה חי במוצר.");

  const turn = await service.submitProjectCompanionTurn({
    projectId: "speech-truth-provider-claim",
    message: "תעדכן את התזכורת שתהיה חכמה יותר",
    currentSurface: "loop",
  });

  assert.equal(turn.buildAgentDownstreamResult, null);
  assert.notEqual(turn.buildSpeechTruth.speechState, "applied");
  assert.equal(turn.buildSpeechTruth.replyWasRewritten, true);
  assert.equal(replyClaimsAppliedChange(turn.reply), false);
});

test("BUILD-SPEECH-TRUTH-001 — failed downstream mutation cannot be described as success", async () => {
  const service = createProjectService();
  // Project without a product-domain skeleton: record.addField must fail safely.
  const project = service.createProject({
    id: "speech-truth-failed",
    name: "פרויקט בלי שלד",
    goal: "כלי פנימי לניהול לידים",
    userId: "demo-user",
  });
  project.artifactExpectation = { projectType: "internal tool", title: "כלי" };
  stubProviderFakeSuccess(service, "הוספתי את השדה בהצלחה!");

  const turn = await service.submitProjectCompanionTurn({
    projectId: "speech-truth-failed",
    message: "תוסיף לכל ליד שדה ציון איכות",
    currentSurface: "loop",
  });

  assert.notEqual(turn.buildSpeechTruth.speechState, "applied");
  assert.equal(turn.buildSpeechTruth.mayClaimChanged, false);
  assert.equal(replyClaimsAppliedChange(turn.reply), false);
  if (turn.project.buildSpeechHistory?.length) {
    assert.equal(turn.project.buildSpeechHistory.at(-1).applied, false);
  }
});

test("BUILD-SPEECH-TRUTH-001 — known safe operation still applies and allows applied speech", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-build-speech-known-"));
  const service = createProjectService(directory);
  createLeadProject(service, "speech-truth-known-op");

  const turn = await service.submitProjectCompanionTurn({
    projectId: "speech-truth-known-op",
    message: "הוסף ליד חדש",
    currentSurface: "loop",
  });

  assert.equal(turn.buildAgentDownstreamResult.status, "applied");
  assert.equal(turn.buildSpeechTruth.speechState, "applied");
  assert.equal(turn.buildSpeechTruth.mayClaimChanged, true);
  assert.match(turn.reply, /נוסף ליד זמני/u);

  const restoredService = createProjectService(directory);
  const restored = restoredService.getProject("speech-truth-known-op");
  assert.equal(restored.buildSpeechHistory.at(-1).applied, true);
});

test("BUILD-SPEECH-TRUTH-001 — external, release, payment, WhatsApp, publish, and verification requests cannot claim applied", async () => {
  const service = createProjectService();
  createLeadProject(service, "speech-truth-boundary");
  stubProviderFakeSuccess(service, "חיברתי וואטסאפ ופרסמתי את המוצר!");

  const externalTurn = await service.submitProjectCompanionTurn({
    projectId: "speech-truth-boundary",
    message: "תחבר לי וואטסאפ אמיתי, תפעיל תשלום ותפרסם את זה",
    currentSurface: "loop",
  });
  assert.equal(externalTurn.buildSpeechTruth.speechState, "pending-approval");
  assert.equal(externalTurn.buildSpeechTruth.mayClaimChanged, false);
  assert.equal(replyClaimsAppliedChange(externalTurn.reply), false);

  const verificationTurn = await service.submitProjectCompanionTurn({
    projectId: "speech-truth-boundary",
    message: "תבדוק שהמסך הראשי עובד",
    currentSurface: "loop",
  });
  assert.notEqual(verificationTurn.buildSpeechTruth.speechState, "applied");
  assert.equal(replyClaimsAppliedChange(verificationTurn.reply), false);

  const directionTurn = await service.submitProjectCompanionTurn({
    projectId: "speech-truth-boundary",
    message: "תהפוך את זה לאפליקציית הזמנות לחנות שלי",
    currentSurface: "loop",
  });
  assert.equal(directionTurn.buildAgentTurn.intent, "product-truth-change");
  assert.equal(directionTurn.buildSpeechTruth.speechState, "pending-approval");
  assert.equal(replyClaimsAppliedChange(directionTurn.reply), false);
});

test("BUILD-SPEECH-TRUTH-001 — free-text resolver returns clarification when field name is missing", () => {
  const resolved = resolveFreeTextMutationOperation({
    message: "תוסיף שדה חדש",
    buildAgentTurn: { owner: "mutation-change-agent", status: "mutation-required" },
  });
  assert.equal(resolved.shouldApply, false);
  assert.equal(resolved.status, "clarification-needed");
  assert.equal(resolved.requestClass, "field-add");
  assert.equal(typeof resolved.clarificationQuestion, "string");
});

test("BUILD-SPEECH-TRUTH-001 — speech gate envelope is rendered on the Build surface and restores after refresh", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-build-speech-render-"));
  const service = createProjectService(directory);
  createLeadProject(service, "speech-truth-render");
  stubProviderFakeSuccess(service, "הוספתי את המסך!");

  await service.submitProjectCompanionTurn({
    projectId: "speech-truth-render",
    message: "תוסיף מסך הגדרות מתקדם",
    currentSurface: "loop",
  });

  const restoredService = createProjectService(directory);
  const restored = restoredService.getProject("speech-truth-render");
  const viewModel = buildLoopCoreViewModel({ project: restored });
  const html = renderLoopCoreScreen(viewModel);

  assert.equal(viewModel.agentConversation.speechTruth.taskId, "BUILD-SPEECH-TRUTH-001");
  assert.equal(viewModel.agentConversation.speechTruth.speechState, "unsupported-not-yet");
  assert.match(html, /data-build-speech-truth-task="BUILD-SPEECH-TRUTH-001"/);
  assert.match(html, /data-build-speech-state="unsupported-not-yet"/);
  assert.match(html, /data-build-speech-reply-rewritten="true"/);
});

test("BUILD-SPEECH-TRUTH-001 — gate unit invariant: applied requires a real mutation id", () => {
  const withoutId = enforceBuildSpeechBoundary({
    candidateReply: "הוספתי את השדה.",
    candidateSource: "provider",
    message: "תוסיף שדה ניקוד",
    buildAgentTurn: { status: "mutation-required", owner: "mutation-change-agent" },
    downstreamAction: { shouldApply: true, operationId: "record.addField" },
    downstreamResult: { status: "applied", mutationId: "" },
  });
  assert.notEqual(withoutId.speechState, "applied");
  assert.equal(replyClaimsAppliedChange(withoutId.reply), false);

  const withId = enforceBuildSpeechBoundary({
    candidateReply: "נוסף שדה ניקוד לרשומות.",
    candidateSource: "shell",
    message: "תוסיף שדה ניקוד",
    buildAgentTurn: { status: "applied", owner: "mutation-change-agent", mayClaimChanged: true },
    downstreamAction: { shouldApply: true, operationId: "record.addField" },
    downstreamResult: { status: "applied", mutationId: "mutation-1", operationId: "record.addField" },
  });
  assert.equal(withId.speechState, "applied");
  assert.equal(withId.mayClaimChanged, true);
});
