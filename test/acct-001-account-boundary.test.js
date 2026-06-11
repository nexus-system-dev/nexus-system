import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ProjectService } from "../src/core/project-service.js";

function createProjectService(directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-acct-001-"))) {
  return new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
}

test("ACCT-001 exposes a first-release account boundary with linked privacy, billing, team, and provider truth", () => {
  const service = createProjectService();
  service.signupUser({
    userInput: { userId: "acct-owner", email: "owner@example.com", displayName: "Owner" },
    credentials: { password: "secret" },
  });

  const surface = service.buildAccountSettingsSurface("acct-owner").settingsProfileSurface;

  assert.equal(surface.accountBoundary.taskId, "ACCT-001");
  assert.equal(surface.accountBoundary.status, "ready");
  assert.equal(surface.accountBoundary.userIdentity.email, "owner@example.com");
  assert.equal(surface.accountBoundary.linkedTruth.privacy.ownerTask, "PRIVACY-001");
  assert.equal(surface.accountBoundary.linkedTruth.billing.ownerTask, "BILLING-001");
  assert.equal(surface.accountBoundary.linkedTruth.team.ownerTask, "EXP-009");
  assert.equal(surface.accountBoundary.linkedTruth.providerIdentity.ownerTask, "PROV-001");
  assert.equal(surface.accountBoundary.linkedTruth.externalIdentity.ownerTask, "SSO-001");
  assert.equal(surface.accountBoundary.userFacingBoundary.canClaimProductionAccount, false);
});

test("ACCT-001 profile updates are persisted and recorded in account activity", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-acct-001-persist-"));
  const service = createProjectService(directory);
  service.signupUser({
    userInput: { userId: "acct-user", email: "old@example.com", displayName: "Old" },
    credentials: { password: "secret" },
  });

  service.updateUserProfile({
    userInput: { userId: "acct-user" },
    profileInput: { displayName: "New Name", email: "new@example.com" },
  });

  const restoredService = createProjectService(directory);
  const surface = restoredService.buildAccountSettingsSurface("acct-user").settingsProfileSurface;

  assert.equal(surface.actorProfile.displayName, "New Name");
  assert.equal(surface.actorProfile.email, "new@example.com");
  assert.equal(surface.accountBoundary.userIdentity.verificationStatus, "pending-verification");
  assert.equal(surface.accountBoundary.accountActivityHistory.at(-1).eventType, "profile-updated");
});

test("ACCT-001 sensitive account actions are stateful and bounded", () => {
  const service = createProjectService();
  service.signupUser({
    userInput: { userId: "acct-sensitive", email: "sensitive@example.com", displayName: "Sensitive" },
    credentials: { password: "secret" },
  });

  const passwordChange = service.applyAccountAction({
    userId: "acct-sensitive",
    actionType: "change-password",
    payload: { password: "new-secret" },
  });
  assert.equal(passwordChange.status, "completed");
  assert.equal(passwordChange.accountEvent.eventType, "password-changed");

  const deletionRequest = service.applyAccountAction({
    userId: "acct-sensitive",
    actionType: "request-account-deletion",
  });
  assert.equal(deletionRequest.status, "pending");
  assert.equal(deletionRequest.accountEvent.metadata.privacyOwnerTask, "PRIVACY-001");

  const logoutAll = service.applyAccountAction({
    userId: "acct-sensitive",
    actionType: "logout-all",
  });
  assert.equal(logoutAll.status, "completed");
  assert.equal(logoutAll.authPayload.sessionState.status, "revoked");
  assert.equal(logoutAll.authPayload.tokenBundle.accessToken, null);

  const surface = service.buildAccountSettingsSurface("acct-sensitive").settingsProfileSurface;
  const eventTypes = surface.accountBoundary.accountActivityHistory.map((entry) => entry.eventType);
  assert.deepEqual(eventTypes, [
    "password-changed",
    "account-deletion-requested",
    "sessions-revoked",
  ]);
});
