import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { buildProductShellDataOwnershipBoundary } from "../src/core/product-shell-data-ownership-boundary.js";
import { buildSupabasePersistenceProviderDecision } from "../src/core/supabase-persistence-provider-decision.js";
import { ProjectService } from "../src/core/project-service.js";

function createProjectService(directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-supabase-001-"))) {
  return new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
}

test("SUPABASE-001 records a defer decision instead of inventing a connected provider", () => {
  const dataOwnershipBoundary = buildProductShellDataOwnershipBoundary({
    id: "project-1",
    userId: "owner-1",
    context: {
      fileStorageRecord: { attachments: [{ name: "brief.md" }] },
      providerGatewayBoundary: { status: "ready" },
    },
  });

  const decision = buildSupabasePersistenceProviderDecision({
    project: { id: "project-1" },
    dataOwnershipBoundary,
    environment: {},
  });

  assert.equal(decision.taskId, "SUPABASE-001");
  assert.equal(decision.decision, "defer-for-first-release");
  assert.equal(decision.selectedPersistencePath, "project-service-workspace-store");
  assert.equal(decision.environmentReadiness.secretsReachBrowser, false);
  assert.equal(decision.environmentReadiness.readyForAdoption, false);
  assert.equal(decision.privacyDependency.nextTask, "PRIVACY-001");
  assert.equal(decision.dataOwnershipAlignment.missingRequiredEntityIds.length, 0);
  assert.equal(decision.schemaOwnership.some((entry) => entry.entityId === "files" && entry.action === "defer"), true);
});

test("SUPABASE-001 is serialized through project and settings truth", () => {
  const service = createProjectService();
  const signup = service.signupUser({
    userInput: { userId: "supabase-owner", email: "supabase@example.com", displayName: "Owner" },
    credentials: { password: "secret" },
  });
  service.createProject({
    id: "supabase-project",
    name: "Supabase Project",
    goal: "Check selected persistence provider.",
    userId: "supabase-owner",
  });

  const project = service.getProject("supabase-project");
  const settings = service.buildAccountSettingsSurface(signup.authPayload.userIdentity.userId).settingsProfileSurface;

  assert.equal(project.supabasePersistenceDecision.taskId, "SUPABASE-001");
  assert.equal(project.supabasePersistenceDecision.decision, "defer-for-first-release");
  assert.equal(project.supabasePersistenceDecision.selectedPersistencePath, "project-service-workspace-store");
  assert.equal(settings.supabasePersistenceDecision.taskId, "SUPABASE-001");
  assert.equal(settings.supabasePersistenceDecision.userFacing.status, "לא מחובר עכשיו");
});
