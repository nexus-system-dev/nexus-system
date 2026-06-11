import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createServer } from "../src/server.js";
import { ProjectService } from "../src/core/project-service.js";
import { buildLoopCoreViewModel } from "../web/nexus-ui/adapters/loop-adapter.js";
import { renderLoopCoreScreen } from "../web/nexus-ui/screens/LoopCoreScreen.js";

function createProjectService(directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-build-mutation-"))) {
  return new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
}

function createLeadProject(service, id = "build-mutation-leads") {
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

function requestJsonWithBody(server, method, pathname, payload) {
  return new Promise((resolve, reject) => {
    const request = new EventEmitter();
    request.method = method;
    request.url = pathname;
    request.headers = {
      "content-type": "application/json",
      "x-user-id": "demo-user",
    };
    request.socket = { remoteAddress: "127.0.0.1" };

    const response = {
      statusCode: 200,
      headers: {},
      writeHead(statusCode, headers) {
        this.statusCode = statusCode;
        this.headers = headers;
      },
      end(body) {
        try {
          resolve({
            statusCode: this.statusCode,
            body: JSON.parse(body),
            headers: this.headers,
          });
        } catch (error) {
          reject(error);
        }
      },
    };

    server.emit("request", request, response);
    request.emit("data", Buffer.from(JSON.stringify(payload)));
    request.emit("end");
  });
}

test("BUILD-MUTATION-TRUTH-001 — Build mutation updates project, runtime, domain, and history truth", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-build-mutation-truth-"));
  const service = createProjectService(directory);
  createLeadProject(service);

  const result = service.applyBuildMutation({
    projectId: "build-mutation-leads",
    requestText: "תעביר את הליד הראשון לטיפול",
    operationId: "record.updateStatus",
    payload: { recordId: "rec-1", status: "בטיפול" },
    requestedBy: "build-agent-test",
  });

  assert.equal(result.mutation.ok, true);
  assert.equal(result.mutation.intent.taskId, "BUILD-MUTATION-TRUTH-001");
  assert.equal(result.mutation.intent.projectId, "build-mutation-leads");
  assert.equal(result.mutation.intent.runtimeSkeletonId, "runtime-skeleton:build-mutation-leads:internal-tool");
  assert.equal(result.mutation.intent.productDomainSkeletonId, "product-domain:build-mutation-leads:internal-tool");
  assert.equal(result.project.buildMutationTruth.status, "applied");
  assert.equal(result.project.buildMutationHistory.length, 1);
  assert.equal(result.project.buildMutationIntents.length, 1);
  assert.equal(result.project.productDomainSkeleton.state.records[0].status, "בטיפול");
  assert.equal(result.project.runtimeSkeletonTruth.lastBuildMutationId, result.mutation.intent.mutationId);
  assert.equal(result.project.runtimeSkeletonTruth.productDomainSkeleton.state.records[0].status, "בטיפול");

  const restoredService = createProjectService(directory);
  const restored = restoredService.getProject("build-mutation-leads");
  assert.equal(restored.buildMutationTruth.status, "applied");
  assert.equal(restored.buildMutationHistory.length, 1);
  assert.equal(restored.productDomainSkeleton.state.records[0].status, "בטיפול");
});

test("BUILD-MUTATION-TRUTH-001 — schema field mutation updates domain and visible runtime skeleton fields", () => {
  const service = createProjectService();
  createLeadProject(service, "build-mutation-field");

  const result = service.applyBuildMutation({
    projectId: "build-mutation-field",
    requestText: "תוסיף שדה מקור ליד",
    operationId: "record.addField",
    payload: { fieldName: "מקור ליד", defaultValue: "לא סומן" },
    requestedBy: "build-agent-test",
  });

  const fieldNames = result.project.productDomainSkeleton.models[0].fields.map((field) => field.name);
  const backendFieldNames = result.project.productOwnedBackendSkeleton.models
    .find((model) => model.name === "Record")
    .fields
    .map((field) => field.name);
  const html = renderLoopCoreScreen(buildLoopCoreViewModel({ project: result.project }));

  assert.equal(result.mutation.ok, true);
  assert.equal(fieldNames.includes("מקור ליד"), true);
  assert.equal(backendFieldNames.includes("מקור ליד"), true);
  assert.equal(result.project.productDomainSkeleton.state.records[0]["מקור ליד"], "לא סומן");
  assert.equal(result.project.productOwnedBackendSkeleton.persistence.state.records[0]["מקור ליד"], "לא סומן");
  assert.equal(result.project.runtimeSkeletonTruth.fields.includes("מקור ליד"), true);
  assert.equal(result.project.runtimeSkeletonTruth.productOwnedBackendSkeletonId, result.project.productOwnedBackendSkeleton.productOwnedBackendSkeletonId);
  assert.equal(result.mutation.historyRecord.affectedAreas.includes("product-owned-backend-skeleton"), true);
  assert.match(html, /data-build-mutation-operation="record\.addField"/);
  assert.match(html, /data-product-owned-backend-task="PRODUCT-BACKEND-SKEL-002"/);
  assert.match(html, /data-product-owned-backend-pairing="paired-from-first-skeleton"/);
  assert.match(html, /מקור ליד/u);
});

test("SLICE-006 — record creation mutation updates artifact truth with product language", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-slice-006-record-"));
  const service = createProjectService(directory);
  createLeadProject(service, "slice-006-record-create");

  const result = service.applyBuildMutation({
    projectId: "slice-006-record-create",
    requestText: "הוסף ליד חדש",
    operationId: "record.create",
    payload: {
      name: "ליד חדש מבדיקה",
      status: "פתוח",
      owner: "ללא אחראי",
      reminder: "היום",
      nextStep: "לחזור לשיחה",
    },
    requestedBy: "runtime-skeleton-control",
  });
  const html = renderLoopCoreScreen(buildLoopCoreViewModel({ project: result.project }));

  assert.equal(result.mutation.ok, true);
  assert.equal(result.mutation.intent.sliceTaskId, "SLICE-006");
  assert.equal(result.project.buildMutationTruth.sliceTaskId, "SLICE-006");
  assert.equal(result.project.productDomainSkeleton.state.records.at(-1).name, "ליד חדש מבדיקה");
  assert.equal(result.project.runtimeSkeletonTruth.tableRows.at(-1).name, "ליד חדש מבדיקה");
  assert.match(result.project.buildMutationHistory.at(-1).visibleSummary, /נוסף ליד זמני/u);
  assert.match(html, /data-build-mutation-user-summary=/);
  assert.match(html, /data-conversation-mutation-task="SLICE-006"/);
  assert.match(html, /נוסף ליד זמני/u);
  assert.doesNotMatch(html, />פעולה בוצעה: record\.create/u);

  const restoredService = createProjectService(directory);
  const restored = restoredService.getProject("slice-006-record-create");
  const restoredHtml = renderLoopCoreScreen(buildLoopCoreViewModel({ project: restored }));
  assert.equal(restored.productDomainSkeleton.state.records.at(-1).name, "ליד חדש מבדיקה");
  assert.match(restoredHtml, /ליד חדש מבדיקה/u);
  assert.match(restoredHtml, /נוסף ליד זמני/u);
  assert.match(restoredHtml, /data-conversation-mutation-task="SLICE-006"/);
});

test("SLICE-006 — record creation preserves requested lead label and missing-owner metrics", () => {
  const service = createProjectService();
  createLeadProject(service, "slice-006-record-label");

  const result = service.applyBuildMutation({
    projectId: "slice-006-record-label",
    requestText: "הוסף ליד חדש בשם דני כהן משיחת טלפון",
    operationId: "record.create",
    payload: {
      label: "דני כהן",
      source: "שיחת טלפון",
      status: "חדש",
      owner: "לא משויך",
      reminder: "היום",
      nextStep: "לחזור אליו עם הצעת מחיר",
    },
    requestedBy: "runtime-skeleton-control",
  });

  const lastRecord = result.project.productDomainSkeleton.state.records.at(-1);
  const missingOwnerMetric = result.project.runtimeSkeletonTruth.metrics.find((metric) => metric.label === "ממתינים לאחראי");

  assert.equal(result.mutation.ok, true);
  assert.equal(result.mutation.intent.payload.name, "דני כהן");
  assert.equal(lastRecord.name, "דני כהן");
  assert.equal(lastRecord.owner, "לא משויך");
  assert.match(result.project.buildMutationHistory.at(-1).visibleSummary, /דני כהן/u);
  assert.equal(missingOwnerMetric.value, "1");
});

test("EXP-001 — direct Build selection and edit update the selected record through project truth", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-exp-001-direct-edit-"));
  const service = createProjectService(directory);
  createLeadProject(service, "exp-001-direct-edit");

  const selected = service.applyBuildMutation({
    projectId: "exp-001-direct-edit",
    requestText: "בחר את הליד השני לעריכה",
    operationId: "record.select",
    payload: { recordId: "rec-2", recordName: "ליד שני" },
    requestedBy: "runtime-direct-selection",
  });
  const reminder = service.applyBuildMutation({
    projectId: "exp-001-direct-edit",
    requestText: "קבע תזכורת מחר לליד שנבחר",
    operationId: "record.updateReminder",
    payload: { recordId: "rec-2", reminder: "מחר 09:00" },
    requestedBy: "runtime-direct-edit",
  });
  const html = renderLoopCoreScreen(buildLoopCoreViewModel({ project: reminder.project }));

  assert.equal(selected.mutation.ok, true);
  assert.equal(selected.project.productDomainSkeleton.state.selectedRecordId, "rec-2");
  assert.equal(reminder.mutation.ok, true);
  assert.equal(reminder.project.productDomainSkeleton.state.selectedRecordId, "rec-2");
  assert.equal(reminder.project.productDomainSkeleton.state.records[1].reminder, "מחר 09:00");
  assert.equal(reminder.project.productOwnedBackendSkeleton.persistence.state.records[1].reminder, "מחר 09:00");
  assert.equal(reminder.project.runtimeSkeletonTruth.tableRows[1].reminder, "מחר 09:00");
  assert.match(reminder.project.buildMutationHistory.at(-1).visibleSummary, /התזכורת עודכנה/u);
  assert.match(selected.project.buildMutationHistory.at(-1).visibleSummary, /ליד שני/u);
  assert.doesNotMatch(selected.project.buildMutationHistory.at(-1).visibleSummary, /rec-2/u);
  assert.match(html, /data-product-domain-operation="record\.select"/);
  assert.match(html, /data-product-domain-operation="record\.updateReminder"/);
  assert.match(html, /data-product-domain-payload=/);
  assert.match(html, /מחר 09:00/u);
  assert.doesNotMatch(html, />record\.select</u);

  const restoredService = createProjectService(directory);
  const restored = restoredService.getProject("exp-001-direct-edit");
  assert.equal(restored.productDomainSkeleton.state.selectedRecordId, "rec-2");
  assert.equal(restored.productDomainSkeleton.state.records[1].reminder, "מחר 09:00");
});

test("SLICE-006 — Build rail conversation mutation transcript restores from project truth", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-slice-006-conversation-"));
  const service = createProjectService(directory);
  createLeadProject(service, "slice-006-conversation");

  const turn = await service.submitProjectCompanionTurn({
    projectId: "slice-006-conversation",
    message: "הוסף ליד חדש",
    currentSurface: "loop",
  });

  assert.equal(turn.buildAgentDownstreamResult.status, "applied");
  assert.equal(turn.project.companionConversation.transcript.length, 2);
  assert.match(turn.project.companionConversation.transcript[0].text, /הוסף ליד חדש/u);
  assert.match(turn.project.companionConversation.transcript[1].text, /נוסף ליד זמני/u);

  const restoredService = createProjectService(directory);
  const restored = restoredService.getProject("slice-006-conversation");
  const viewModel = buildLoopCoreViewModel({ project: restored });
  const html = renderLoopCoreScreen(viewModel);

  assert.equal(viewModel.agentConversation.transcript.length, 2);
  assert.match(html, /הוסף ליד חדש/u);
  assert.match(html, /נוסף ליד זמני/u);
  assert.match(html, /data-build-mutation-history-count="1"/);
  assert.doesNotMatch(html, />record\.create</u);
});

test("BLD-AGT-001 — rebuild restores safe field mutation from project truth", () => {
  const service = createProjectService();
  createLeadProject(service, "build-agent-restore-field-project");

  const mutationResult = service.applyBuildMutation({
    projectId: "build-agent-restore-field-project",
    requestText: "תוסיף שדה מקור ליד",
    operationId: "record.addField",
    payload: { fieldName: "מקור ליד", defaultValue: "לא סומן" },
    requestedBy: "build-agent-test",
  });
  assert.equal(mutationResult.project.runtimeSkeletonTruth.fields.includes("מקור ליד"), true);
  assert.equal(mutationResult.project.productDomainSkeleton.models[0].fields.some((field) => field.name === "מקור ליד"), true);
  assert.equal(
    mutationResult.project.productOwnedBackendSkeleton.models
      .find((model) => model.name === "Record")
      .fields
      .some((field) => field.name === "מקור ליד"),
    true,
  );

  const rebuilt = service.rebuildContext("build-agent-restore-field-project");

  assert.equal(rebuilt.runtimeSkeletonTruth.fields.includes("מקור ליד"), true);
  assert.equal(rebuilt.productDomainSkeleton.models[0].fields.some((field) => field.name === "מקור ליד"), true);
  assert.equal(
    rebuilt.productOwnedBackendSkeleton.models
      .find((model) => model.name === "Record")
      .fields
      .some((field) => field.name === "מקור ליד"),
    true,
  );
  assert.equal(rebuilt.buildMutationTruth.lastOperationId, "record.addField");
  assert.equal(rebuilt.buildMutationHistory.length, 1);
  assert.equal(rebuilt.buildMutationIntents.length, 1);
});

test("BUILD-MUTATION-TRUTH-001 — failed mutation records visible failure without fake domain success", () => {
  const service = createProjectService();
  createLeadProject(service, "build-mutation-failure");

  const before = service.getProject("build-mutation-failure").productDomainSkeleton.state.records[0].status;
  const result = service.applyBuildMutation({
    projectId: "build-mutation-failure",
    requestText: "תעשה שינוי לא מוגדר",
    operationId: "unknown.operation",
    payload: {},
    requestedBy: "build-agent-test",
  });

  assert.equal(result.mutation.ok, false);
  assert.equal(result.project.buildMutationTruth.status, "failed-safely");
  assert.equal(result.project.buildMutationTruth.lastError, "unknown-product-domain-operation");
  assert.equal(result.project.buildMutationHistory[0].status, "failed-safely");
  assert.equal(result.project.productDomainSkeleton.state.records[0].status, before);
});

test("BUILD-MUTATION-TRUTH-001 — Build route applies mutation through project service", async () => {
  const service = createProjectService();
  createLeadProject(service, "build-mutation-route");
  const server = createServer(service);

  const response = await requestJsonWithBody(server, "POST", "/api/projects/build-mutation-route/build-mutations", {
    requestText: "שנה אחראי לליד הראשון",
    operationId: "record.assignOwner",
    payload: { recordId: "rec-1", owner: "נועה" },
    requestedBy: "build-agent-route-test",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.mutation.ok, true);
  assert.equal(response.body.project.buildMutationTruth.status, "applied");
  assert.equal(response.body.project.productDomainSkeleton.state.records[0].owner, "נועה");
});

test("BUILD-MUTATION-TRUTH-001 — Loop surface exposes canonical mutation truth anchors", () => {
  const service = createProjectService();
  const project = createLeadProject(service, "build-mutation-surface");
  const result = service.applyBuildMutation({
    projectId: "build-mutation-surface",
    requestText: "תעביר את הליד הראשון לטיפול",
    operationId: "record.updateStatus",
    payload: { recordId: "rec-1", status: "בטיפול" },
    requestedBy: "build-agent-test",
  });

  const html = renderLoopCoreScreen(buildLoopCoreViewModel({ project: result.project }));
  assert.match(html, /data-build-mutation-task="BUILD-MUTATION-TRUTH-001"/);
  assert.match(html, /data-build-mutation-status="applied"/);
  assert.match(html, /data-build-mutation-operation="record\.updateStatus"/);
  assert.match(html, /data-build-mutation-history-count="1"/);
  assert.match(html, /data-product-domain-skeleton-id="product-domain:build-mutation-surface:internal-tool"/);
});
