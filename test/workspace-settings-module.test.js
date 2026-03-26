import test from "node:test";
import assert from "node:assert/strict";

import { createOrganizationWorkspaceSettingsModule } from "../src/core/workspace-settings-module.js";

test("workspace settings module returns canonical defaults", () => {
  const { workspaceSettings } = createOrganizationWorkspaceSettingsModule({
    workspaceModel: {
      workspaceId: "workspace-1",
    },
  });

  assert.equal(workspaceSettings.workspaceId, "workspace-1");
  assert.equal(workspaceSettings.defaultProjectVisibility, "private");
  assert.equal(workspaceSettings.policyProfile, "balanced");
  assert.equal(workspaceSettings.teamPreferences.notifications, "digest");
});

test("workspace settings module respects provided settings", () => {
  const { workspaceSettings } = createOrganizationWorkspaceSettingsModule({
    workspaceModel: {
      workspaceId: "workspace-2",
    },
    settingsInput: {
      defaultExecutionMode: "autonomous",
      policyProfile: "strict",
      teamPreferences: {
        notifications: "instant",
        reviewStyle: "sync",
      },
    },
  });

  assert.equal(workspaceSettings.defaultExecutionMode, "autonomous");
  assert.equal(workspaceSettings.policyProfile, "strict");
  assert.equal(workspaceSettings.teamPreferences.notifications, "instant");
  assert.equal(workspaceSettings.teamPreferences.reviewStyle, "sync");
});
