import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ProjectService } from "../src/core/project-service.js";

function createProjectService(directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-build-agent-learning-"))) {
  return new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
}

function createLeadBuildProject(service, id = "build-agent-learning-project") {
  const project = service.createProject({
    id,
    name: "ניהול לידים",
    goal: "כלי פנימי לניהול לידים עם סטטוס, אחראי, תזכורת וצעד הבא.",
    userId: "user-build-learning",
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
    dataObjects: [{ name: "ליד", fields: ["שם", "סטטוס", "אחראי", "תזכורת"] }],
    versionOneBoundary: { buildNow: ["טבלה", "אחראי"], doNotBuildNow: ["וואטסאפ"] },
  };
  return service.rebuildContext(id);
}

test("BLD-AGT-001 — companion turn passes runtime learning instructions before provider reply", async () => {
  const service = createProjectService();
  createLeadBuildProject(service, "build-agent-learning-provider");
  let capturedRequest = null;
  service.onboarding.providerClient.generateCompanionReply = async (request) => {
    capturedRequest = request;
    return {
      status: "completed",
      providerId: "openai",
      deliveryMode: "provider",
      reply: "קיבלתי את בקשת השינוי, והיא צריכה לעבור למסלול שינוי לפני שאגיד שהיא בוצעה.",
    };
  };

  const result = await service.submitProjectCompanionTurn({
    projectId: "build-agent-learning-provider",
    message: "תוסיף תזכורת למחר",
    currentSurface: "loop",
  });

  assert.equal(capturedRequest.learningInstructions.taskId, "BLD-AGT-001");
  assert.equal(capturedRequest.learningInstructions.sourceTaskId, "LEARNING-RUNTIME-001");
  assert.equal(capturedRequest.learningInstructions.mustUseBeforeReply, true);
  assert.equal(capturedRequest.learningInstructions.mayOverwriteProjectTruth, false);
  assert.equal(capturedRequest.learningInstructions.routingHints.includes("mutation-required-before-success"), true);
  assert.equal(capturedRequest.buildAgentTurn.taskId, "BLD-AGT-001");
  assert.equal(capturedRequest.buildAgentTurn.owner, "mutation-change-agent");
  assert.equal(capturedRequest.buildAgentTurn.mayClaimChanged, false);
  assert.equal(result.learningInstructions.routingHints.includes("mutation-required-before-success"), true);
  assert.equal(result.buildAgentTurn.owner, "mutation-change-agent");
  assert.equal(result.project.buildAgentTurnState.owner, "mutation-change-agent");
  assert.match(result.reply, /מסלול שינוי/u);
});

test("BLD-AGT-001 — companion turn routes visual requests before replying", async () => {
  const service = createProjectService();
  createLeadBuildProject(service, "build-agent-routing-visual");
  let providerCalled = false;
  service.onboarding.providerClient.generateCompanionReply = async () => {
    providerCalled = true;
    return {
      status: "unavailable",
      providerId: "openai",
      deliveryMode: "shell",
    };
  };

  const result = await service.submitProjectCompanionTurn({
    projectId: "build-agent-routing-visual",
    message: "תוסיף לי דף סלאש סקרין עם שם האפליקציה",
    currentSurface: "loop",
  });

  assert.equal(result.buildAgentTurn.taskId, "BLD-AGT-001");
  assert.equal(result.buildAgentTurn.intent, "visual-change");
  assert.equal(result.buildAgentTurn.owner, "visual-build-agent");
  assert.equal(result.buildAgentTurn.status, "applied");
  assert.equal(result.buildAgentTurn.mayClaimChanged, true);
  assert.equal(providerCalled, false);
  assert.equal(result.buildAgentDownstreamResult.status, "applied");
  assert.equal(result.project.visualBuildTruth.taskId, "VBUILD-001");
  assert.equal(result.project.visualBuildTruth.bridgeTaskId, "BLD-AGT-001");
  assert.equal(result.project.visualBuildTruth.lastOperationId, "visual.screen.addSplash");
  assert.equal(result.project.visualBuildTruth.screens[0].screenId, "splash-screen");
  assert.equal(result.project.buildAgentTurnState.owner, "visual-build-agent");
  assert.match(result.reply, /נוסף מסך פתיחה חזותי/u);
  assert.match(result.reply, /מותר להציג אותו כתוצאה שבוצעה/u);
});

test("VBUILD-001 — visual agent turns lead list into cards and preserves selected direction", async () => {
  const service = createProjectService();
  createLeadBuildProject(service, "visual-build-cards-followup");
  const project = service.getProject("visual-build-cards-followup");
  const candidateId = project.skeletonChoiceTruth.candidates[0].candidateId;
  service.selectSkeletonChoice({
    projectId: "visual-build-cards-followup",
    candidateId,
    selectedBy: "user",
  });
  let providerCalled = false;
  service.onboarding.providerClient.generateCompanionReply = async () => {
    providerCalled = true;
    return {
      status: "completed",
      providerId: "openai",
      deliveryMode: "provider",
      reply: "לא אמור להגיע לכאן אחרי שינוי חזותי בטוח.",
    };
  };

  const result = await service.submitProjectCompanionTurn({
    projectId: "visual-build-cards-followup",
    message: "תהפוך את רשימת הלידים לכרטיסים ותוסיף אזור חזרה היום",
    currentSurface: "loop",
  });

  assert.equal(providerCalled, false);
  assert.equal(result.buildAgentTurn.owner, "visual-build-agent");
  assert.equal(result.buildAgentTurn.status, "applied");
  assert.equal(result.buildAgentTurn.mayClaimChanged, true);
  assert.equal(result.project.visualBuildTruth.taskId, "VBUILD-001");
  assert.equal(result.project.visualBuildTruth.lastOperationId, "visual.leads.cardsFollowupToday");
  assert.equal(result.project.visualBuildTruth.selectedSkeletonCandidateId, candidateId);
  assert.equal(result.project.visualBuildTruth.screens[0].layoutMode, "cards-with-follow-up-today");
  assert.equal(result.project.visualBuildTruth.lastVisualDiff.changeType, "structure");
  assert.deepEqual(result.project.visualBuildTruth.lastVisualDiff.affectedRegions, ["lead-list", "follow-up-today"]);
  assert.equal(result.project.visualBuildTruth.lastVisualDiff.requiresApproval, false);
  assert.equal(result.project.visualBuildTruth.lastVisualDiff.requiresProductTruthMutation, false);
  assert.match(result.reply, /רשימת הלידים הפכה לכרטיסים/u);
  assert.match(result.reply, /מותר להציג אותו כתוצאה שבוצעה/u);
});

test("VBUILD-001 — premium style request requires approval and does not fake a visual change", async () => {
  const service = createProjectService();
  createLeadBuildProject(service, "visual-build-premium-approval");
  let providerCalled = false;
  service.onboarding.providerClient.generateCompanionReply = async () => {
    providerCalled = true;
    return {
      status: "completed",
      providerId: "openai",
      deliveryMode: "provider",
      reply: "הפכתי לפרימיום.",
    };
  };

  const result = await service.submitProjectCompanionTurn({
    projectId: "visual-build-premium-approval",
    message: "זה נראה יבש, תהפוך את זה לפרימיום",
    currentSurface: "loop",
  });

  assert.equal(result.buildAgentTurn.intent, "visual-style-change");
  assert.equal(result.buildAgentTurn.owner, "visual-build-agent");
  assert.equal(result.buildAgentTurn.requiresApproval, true);
  assert.equal(result.buildAgentTurn.mayClaimChanged, false);
  assert.equal(result.buildAgentDownstreamResult, null);
  assert.equal(result.project.visualBuildTruth, null);
  assert.equal(providerCalled, false);
  assert.match(result.reply, /שינוי סגנון משמעותי/u);
  assert.match(result.reply, /צריך אישור/u);
});

test("BLD-AGT-001 — safe lead-source field request mutates project truth before success reply", async () => {
  const service = createProjectService();
  createLeadBuildProject(service, "build-agent-safe-field-mutation");
  let providerCalled = false;
  service.onboarding.providerClient.generateCompanionReply = async () => {
    providerCalled = true;
    return {
      status: "completed",
      providerId: "openai",
      deliveryMode: "provider",
      reply: "לא אמור להגיע לכאן אחרי שינוי בטוח.",
    };
  };

  const result = await service.submitProjectCompanionTurn({
    projectId: "build-agent-safe-field-mutation",
    message: "תוסיף שדה מקור ליד",
    currentSurface: "loop",
  });

  const fieldNames = result.project.productDomainSkeleton.models[0].fields.map((field) => field.name);
  assert.equal(providerCalled, false);
  assert.equal(result.buildAgentTurn.owner, "mutation-change-agent");
  assert.equal(result.mutationChangeDecision.taskId, "MUT-001");
  assert.equal(result.mutationChangeDecision.status, "applied");
  assert.equal(result.mutationChangeDecision.requiresApproval, false);
  assert.equal(result.mutationChangeDecision.requiresProductTruthMutation, true);
  assert.equal(result.project.mutationChangeDecision.status, "applied");
  assert.equal(result.project.mutationChangeHistory.length, 1);
  assert.equal(result.project.canonicalMutationFlow.taskId, "EXP-002");
  assert.equal(result.project.canonicalMutationFlow.status, "applied");
  assert.equal(result.project.canonicalMutationFlow.steps.find((step) => step.stepId === "apply").status, "done");
  assert.equal(result.project.historyContinuityAgent.taskId, "HIST-AGT-001");
  assert.equal(result.project.historyContinuityAgent.productHistory[0].eventType, "small-change");
  assert.equal(result.project.historyContinuityAgent.productHistory[0].requiresCheckpoint, false);
  assert.match(result.project.historyContinuityAgent.productHistory[0].changeSummary.after, /מקור ליד/u);
  assert.equal(result.buildAgentTurn.status, "applied");
  assert.equal(result.buildAgentTurn.mayClaimChanged, true);
  assert.equal(result.buildAgentDownstreamResult.status, "applied");
  assert.equal(result.project.buildMutationTruth.status, "applied");
  assert.equal(result.project.buildMutationTruth.lastOperationId, "record.addField");
  assert.equal(fieldNames.includes("מקור ליד"), true);
  assert.equal(result.project.productDomainSkeleton.state.records[0]["מקור ליד"], "לא סומן");
  assert.equal(result.project.runtimeSkeletonTruth.fields.includes("מקור ליד"), true);
  assert.match(result.reply, /נוסף שדה מקור ליד/u);
  assert.match(result.reply, /מותר להציג אותו כתוצאה שבוצעה/u);
});

test("BLD-AGT-001 — product direction replacement is not applied as a silent mutation", async () => {
  const service = createProjectService();
  createLeadBuildProject(service, "build-agent-product-direction-approval");
  let providerCalled = false;
  service.onboarding.providerClient.generateCompanionReply = async () => {
    providerCalled = true;
    return {
      status: "unavailable",
      providerId: "openai",
      deliveryMode: "shell",
    };
  };

  const result = await service.submitProjectCompanionTurn({
    projectId: "build-agent-product-direction-approval",
    message: "תשנה את זה להזמנות במקום לידים",
    currentSurface: "loop",
  });

  assert.equal(result.buildAgentTurn.intent, "product-truth-change");
  assert.equal(result.buildAgentTurn.requiresApproval, true);
  assert.equal(result.mutationChangeDecision.taskId, "MUT-001");
  assert.equal(result.mutationChangeDecision.changeType, "product-truth");
  assert.equal(result.mutationChangeDecision.status, "pending-approval");
  assert.equal(result.mutationChangeDecision.requiresApproval, true);
  assert.equal(result.project.mutationChangeHistory.length, 1);
  assert.equal(result.project.canonicalMutationFlow.taskId, "EXP-002");
  assert.equal(result.project.canonicalMutationFlow.status, "pending-approval");
  assert.equal(result.project.canonicalMutationFlow.steps.find((step) => step.stepId === "apply").status, "blocked");
  assert.equal(result.project.buildApprovalFlow.taskId, "BUILD-APPROVAL-001");
  assert.equal(result.project.buildApprovalFlow.ownerTaskId, "MUT-001");
  assert.equal(result.project.buildApprovalFlow.status, "pending-approval");
  assert.equal(result.project.buildApprovalFlow.decisionStatus, "pending");
  assert.equal(result.project.buildApprovalFlow.backedByMutationTruth, true);
  assert.equal(result.project.buildApprovalFlow.currentTruthUnchanged, true);
  assert.equal(result.project.buildApprovalFlow.targetDirection.label, "ניהול הזמנות");
  assert.equal(result.project.historyContinuityAgent.taskId, "HIST-AGT-001");
  assert.equal(result.project.historyContinuityAgent.status, "pending-approval");
  assert.equal(result.project.historyContinuityAgent.productHistory[0].requiresCheckpoint, true);
  assert.equal(result.project.historyContinuityAgent.checkpoints[0].restoreAvailability, "possible-with-impact");
  assert.equal(result.buildAgentDownstreamResult, null);
  assert.equal(result.project.buildMutationTruth, null);
  assert.equal(providerCalled, false);
  assert.match(result.reply, /צריך אישור/u);
  assert.match(result.reply, /לא משנה מלידים להזמנות בשקט/u);
});

test("BUILD-APPROVAL-001 — reject preserves lead product truth and approve applies product direction", async () => {
  const rejectService = createProjectService();
  createLeadBuildProject(rejectService, "build-approval-reject");
  await rejectService.submitProjectCompanionTurn({
    projectId: "build-approval-reject",
    message: "תשנה את זה להזמנות במקום לידים",
    currentSurface: "loop",
  });
  const rejected = rejectService.decideBuildApproval({
    projectId: "build-approval-reject",
    action: "reject",
  });

  assert.equal(rejected.buildApprovalFlow.taskId, "BUILD-APPROVAL-001");
  assert.equal(rejected.buildApprovalFlow.decisionStatus, "rejected");
  assert.equal(rejected.buildApprovalFlow.currentTruthUnchanged, true);
  assert.match(rejected.goal, /לידים/u);
  assert.doesNotMatch(rejected.goal, /הזמנות/u);
  assert.notEqual(rejected.productDomainSkeleton.models[0].name, "הזמנה");
  assert.equal(rejected.canonicalMutationFlow.status, "rejected");

  const approveService = createProjectService();
  createLeadBuildProject(approveService, "build-approval-approve");
  await approveService.submitProjectCompanionTurn({
    projectId: "build-approval-approve",
    message: "תשנה את זה להזמנות במקום לידים",
    currentSurface: "loop",
  });
  const approved = approveService.decideBuildApproval({
    projectId: "build-approval-approve",
    action: "approve",
  });

  assert.equal(approved.buildApprovalFlow.decisionStatus, "approved");
  assert.equal(approved.buildApprovalFlow.currentTruthUnchanged, false);
  assert.equal(approved.mutationChangeDecision.status, "approved-applied");
  assert.equal(approved.canonicalMutationFlow.status, "applied");
  assert.equal(approved.productDomainSkeleton.models[0].name, "הזמנה");
  assert.equal(approved.productDomainSkeleton.state.records[0].id, "order-1");
  assert.match(approved.goal, /הזמנות/u);
  assert.equal(approved.runtimeSkeletonTruth.title, "ניהול הזמנות");

  approveService.rebuildContext("build-approval-approve");
  const restored = approveService.getProject("build-approval-approve");
  assert.equal(restored.buildApprovalFlow.decisionStatus, "approved");
  assert.equal(restored.canonicalMutationFlow.status, "applied");
  assert.equal(restored.productDomainSkeleton.models[0].name, "הזמנה");
  assert.equal(restored.productDomainSkeleton.state.records[0].id, "order-1");
  assert.equal(restored.runtimeSkeletonTruth.title, "ניהול הזמנות");
  assert.match(restored.goal, /הזמנות/u);

  const leadCheckpoint = restored.historyContinuityAgent.checkpoints.find(
    (checkpoint) => checkpoint.productSnapshot?.productDomainSkeleton?.models?.[0]?.name === "ליד",
  );
  assert.ok(leadCheckpoint);

  const restoreDecision = approveService.requestHistoryRestoreDecision({
    projectId: "build-approval-approve",
    checkpointId: leadCheckpoint.checkpointId,
  });
  assert.equal(restoreDecision.historyContinuityAgent.restoreDecision.status, "impact-ready");
  assert.equal(restoreDecision.historyContinuityAgent.restoreDecision.currentTruthUnchanged, true);

  const restoredToLeads = approveService.executeHistoryRestore({
    projectId: "build-approval-approve",
    checkpointId: leadCheckpoint.checkpointId,
  });
  assert.equal(restoredToLeads.historyContinuityAgent.restoreDecision.status, "restored");
  assert.equal(restoredToLeads.historyContinuityAgent.restoreDecision.currentTruthUnchanged, false);
  assert.match(restoredToLeads.goal, /לידים/u);
  assert.doesNotMatch(restoredToLeads.goal, /הזמנות/u);
  assert.equal(restoredToLeads.productDomainSkeleton.models[0].name, "ליד");
  assert.match(restoredToLeads.runtimeSkeletonTruth.title, /לידים/u);

  approveService.rebuildContext("build-approval-approve");
  const rebuiltAfterRestore = approveService.getProject("build-approval-approve");
  assert.equal(rebuiltAfterRestore.historyContinuityAgent.restoreDecision.status, "restored");
  assert.equal(rebuiltAfterRestore.buildApprovalFlow.decisionStatus, "restored");
  assert.match(rebuiltAfterRestore.goal, /לידים/u);
  assert.doesNotMatch(rebuiltAfterRestore.goal, /הזמנות/u);
  assert.equal(rebuiltAfterRestore.productDomainSkeleton.models[0].name, "ליד");
  assert.match(rebuiltAfterRestore.runtimeSkeletonTruth.title, /לידים/u);
});

test("BLD-AGT-001 — verification request gets bounded Nexus reply instead of provider success", async () => {
  const service = createProjectService();
  createLeadBuildProject(service, "build-agent-verification-boundary");
  let providerCalled = false;
  service.onboarding.providerClient.generateCompanionReply = async () => {
    providerCalled = true;
    return {
      status: "completed",
      providerId: "openai",
      deliveryMode: "provider",
      reply: "בדקתי והכול תקין.",
    };
  };

  const result = await service.submitProjectCompanionTurn({
    projectId: "build-agent-verification-boundary",
    message: "תבדוק שהמסך עובד",
    currentSurface: "loop",
  });

  assert.equal(result.buildAgentTurn.intent, "verification-request");
  assert.equal(result.buildAgentTurn.owner, "verification-qa-agent");
  assert.equal(result.buildAgentTurn.mayClaimChanged, false);
  assert.equal(providerCalled, false);
  assert.match(result.reply, /אני מנתב את זה לבדיקה/u);
  assert.match(result.reply, /לא אגיד שהמסך תקין/u);
});

test("BLD-AGT-001 — fallback reply uses learning instructions to bound provider and release requests", async () => {
  const service = createProjectService();
  createLeadBuildProject(service, "build-agent-learning-boundary");
  let providerCalled = false;
  service.onboarding.providerClient.generateCompanionReply = async () => {
    providerCalled = true;
    return {
      status: "completed",
      providerId: "openai",
      deliveryMode: "provider",
      reply: "חיברתי ופרסמתי.",
    };
  };

  const result = await service.submitProjectCompanionTurn({
    projectId: "build-agent-learning-boundary",
    message: "תחבר לי וואטסאפ אמיתי ותפרסם לי את זה",
    currentSurface: "loop",
  });

  assert.equal(result.learningInstructions.routingHints.includes("provider-release-boundary"), true);
  assert.equal(result.buildAgentTurn.owner, "release-agent");
  assert.equal(result.buildAgentTurn.status, "blocked-or-approval-required");
  assert.equal(result.learningInstructions.mustUseBeforeReply, true);
  assert.equal(result.learningInstructions.mayOverwriteProjectTruth, false);
  assert.equal(providerCalled, false);
  assert.match(result.reply, /לא אחבר עכשיו ספק אמיתי/u);
  assert.match(result.reply, /לא אפרסם החוצה/u);
});

test("BLD-AGT-001 — fallback reply uses failed mutation learning instead of fake success", async () => {
  const service = createProjectService();
  createLeadBuildProject(service, "build-agent-learning-failure");
  service.applyBuildMutation({
    projectId: "build-agent-learning-failure",
    requestText: "תעשה שינוי לא מוגדר",
    operationId: "unknown.operation",
    payload: {},
    requestedBy: "build-agent-test",
  });
  service.onboarding.providerClient.generateCompanionReply = async () => ({
    status: "unavailable",
    providerId: "openai",
    deliveryMode: "shell",
  });

  const result = await service.submitProjectCompanionTurn({
    projectId: "build-agent-learning-failure",
    message: "תוסיף שדה מקור ליד",
    currentSurface: "loop",
  });

  assert.equal(result.learningInstructions.routingHints.includes("prior-failure-requires-retry-or-clarification"), true);
  assert.equal(result.learningInstructions.routingHints.includes("mutation-required-before-success"), true);
  assert.equal(result.buildAgentTurn.owner, "mutation-change-agent");
  assert.equal(result.buildAgentTurn.mayClaimChanged, false);
  assert.match(result.reply, /ניסיון שינוי קודם לא נסגר כהצלחה/u);
});
