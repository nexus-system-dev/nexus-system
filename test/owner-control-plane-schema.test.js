import test from "node:test";
import assert from "node:assert/strict";
import { defineOwnerControlPlaneSchema } from "../src/core/owner-control-plane-schema.js";

test("owner control plane schema derives ready owner control plane", () => {
  const { ownerControlPlane } = defineOwnerControlPlaneSchema({
    ownerContext: { ownerId: "owner-1", ownerRole: "owner" },
    platformState: { workspaceId: "workspace-1", healthStatus: "stable" },
  });
  assert.equal(ownerControlPlane.status, "ready");
  assert.equal(ownerControlPlane.healthStatus, "stable");
});
