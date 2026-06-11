import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ProjectService } from "../src/core/project-service.js";
import {
  buildSkeletonChoiceTruthEnvelope,
  validateSkeletonChoiceCandidate,
} from "../src/core/skeleton-choice-candidates.js";

function createProjectService(directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-skeleton-choice-"))) {
  return new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
}

function createLeadProject(service, id = "skeleton-choice-project") {
  const project = service.createProject({
    id,
    name: "ניהול לידים",
    goal: "כלי פנימי לניהול לידים עם סטטוס, אחראי, תזכורת וצעד הבא.",
    userId: "user-skeleton-choice",
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
    initialActions: ["הוסף ליד", "עדכן סטטוס", "שנה אחראי"],
    dataObjects: [{ name: "ליד", fields: ["שם", "סטטוס", "אחראי", "תזכורת", "צעד הבא"] }],
    versionOneBoundary: { buildNow: ["טבלה", "אחראי", "תזכורת"], doNotBuildNow: ["וואטסאפ אמיתי"] },
  };
  return service.rebuildContext(id);
}

test("SKELETON-CHOICE-001 — creates provider-backed candidates from one Nexus truth envelope", () => {
  const service = createProjectService();
  const project = createLeadProject(service, "skeleton-choice-candidates");
  const choice = project.skeletonChoiceTruth;

  assert.equal(choice.taskId, "SKELETON-CHOICE-001");
  assert.equal(choice.status, "selection-required");
  assert.equal(choice.providerContract.truthOwner, "nexus");
  assert.equal(choice.providerContract.providerNamesHiddenFromUser, true);
  assert.equal(choice.candidates.length, 3);
  assert.equal(choice.providerFailures[0].status, "unavailable");
  assert.equal(choice.providerFailures[0].boundedFailure, true);
  assert.ok(choice.candidates.every((candidate) => candidate.productDomainFit.productDomainSkeletonId === project.productDomainSkeleton.productDomainSkeletonId));
  assert.ok(choice.candidates.every((candidate) => candidate.actionsStateFit.actionIds.length > 0));
  assert.ok(choice.candidates.every((candidate) => candidate.actionsStateFit.stateKeys.length > 0));
});

test("SKELETON-CHOICE-001 — rejects detached visual candidates without domain, actions, and state", () => {
  const validation = validateSkeletonChoiceCandidate({
    visualDirection: { summary: "כרטיס יפה אבל מנותק" },
    productDomainFit: {},
    actionsStateFit: { actionIds: [], stateKeys: [] },
  });

  assert.equal(validation.ok, false);
  assert.deepEqual(validation.reasons, [
    "missing-product-domain-fit",
    "missing-action-fit",
    "missing-state-fit",
  ]);
});

test("SKELETON-CHOICE-001 — selection persists and blocks direction switch without approval", () => {
  const service = createProjectService();
  createLeadProject(service, "skeleton-choice-select");
  const before = service.getProject("skeleton-choice-select");
  const candidateId = before.skeletonChoiceTruth.candidates[1].candidateId;
  const result = service.selectSkeletonChoice({
    projectId: "skeleton-choice-select",
    candidateId,
    selectedBy: "user",
  });

  assert.equal(result.ok, true);
  assert.equal(result.project.skeletonChoiceTruth.status, "selected");
  assert.equal(result.project.skeletonChoiceTruth.selectedSkeletonCandidateId, candidateId);
  assert.equal(result.project.skeletonChoiceTruth.downstreamHandoff.build, true);
  assert.equal(result.project.runtimeLearningEvents.some((event) => event.eventType === "skeleton_choice.selected"), true);

  const restored = service.rebuildContext("skeleton-choice-select");
  assert.equal(restored.skeletonChoiceTruth.selectedSkeletonCandidateId, candidateId);
  assert.equal(restored.skeletonChoiceTruth.selectionStatus, "locked");

  const blockedSwitch = service.selectSkeletonChoice({
    projectId: "skeleton-choice-select",
    candidateId: restored.skeletonChoiceTruth.candidates[0].candidateId,
    selectedBy: "user",
  });
  assert.equal(blockedSwitch.ok, false);
  assert.equal(blockedSwitch.status, "approval-required");
  assert.equal(blockedSwitch.project.skeletonChoiceTruth.selectedSkeletonCandidateId, candidateId);
  assert.equal(blockedSwitch.project.skeletonChoiceTruth.pendingDirectionSwitch.status, "approval-required");
});

test("SKELETON-CHOICE-001 — Build and mutation paths receive selected candidate identity", async () => {
  const service = createProjectService();
  createLeadProject(service, "skeleton-choice-build-handoff");
  const project = service.getProject("skeleton-choice-build-handoff");
  const candidateId = project.skeletonChoiceTruth.candidates[0].candidateId;
  service.selectSkeletonChoice({
    projectId: "skeleton-choice-build-handoff",
    candidateId,
    selectedBy: "user",
  });

  const mutationResult = service.applyBuildMutation({
    projectId: "skeleton-choice-build-handoff",
    requestText: "תוסיף שדה מקור ליד",
    operationId: "record.addField",
    payload: { fieldName: "מקור ליד", defaultValue: "לא סומן" },
  });
  assert.equal(mutationResult.mutation.intent.selectedSkeletonCandidateId, candidateId);
  assert.equal(mutationResult.project.buildMutationHistory.at(-1).selectedSkeletonCandidateId, candidateId);

  const turnResult = await service.submitProjectCompanionTurn({
    projectId: "skeleton-choice-build-handoff",
    message: "תוסיף תזכורת למחר",
    currentSurface: "loop",
  });
  assert.equal(turnResult.learningInstructions.selectedSkeletonCandidateId, candidateId);
  assert.equal(turnResult.buildAgentTurn.selectedSkeletonCandidateId, candidateId);
});

test("SKELETON-CHOICE-001 — fallback envelope does not create candidates without product domain truth", () => {
  const choice = buildSkeletonChoiceTruthEnvelope({
    project: { id: "detached-project", name: "כרטיס יפה" },
    runtimeSkeletonTruth: {
      projectId: "detached-project",
      runtimeSkeletonId: "runtime:detached",
      productClass: "landing-page",
      shellFamily: "web-page-preview",
      title: "כרטיס יפה",
    },
    productDomainSkeleton: {},
  });

  assert.equal(choice.candidates.length, 0);
  assert.equal(choice.status, "selection-required");
});
