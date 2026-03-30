import test from "node:test";
import assert from "node:assert/strict";

import { defineTenantIsolationSchema } from "../src/core/tenant-isolation-schema.js";

test("defineTenantIsolationSchema returns canonical tenant boundaries for workspace resources", () => {
  const { tenantIsolationSchema } = defineTenantIsolationSchema({
    workspaceModel: {
      workspaceId: "workspace-alpha",
      visibility: "private",
    },
    resourceDefinitions: [
      {
        resourceType: "artifacts",
        scope: "workspace",
        sensitivity: "high",
      },
      {
        resourceType: "linked-accounts",
        scope: "workspace",
        sensitivity: "critical",
      },
    ],
  });

  assert.equal(tenantIsolationSchema.tenantIsolationSchemaId, "tenant-isolation:workspace-alpha");
  assert.equal(tenantIsolationSchema.isolationBoundary, "workspace");
  assert.equal(tenantIsolationSchema.isolatedResources.length, 2);
  assert.equal(tenantIsolationSchema.isolatedResources[0].tenantBoundary, "workspace");
  assert.equal(tenantIsolationSchema.summary.criticalResources, 1);
});

test("defineTenantIsolationSchema falls back safely without explicit resources", () => {
  const { tenantIsolationSchema } = defineTenantIsolationSchema();

  assert.equal(tenantIsolationSchema.workspaceId, null);
  assert.equal(tenantIsolationSchema.isolatedResources.length, 4);
  assert.equal(tenantIsolationSchema.accessRules.denyCrossTenantReadsByDefault, true);
  assert.equal(Array.isArray(tenantIsolationSchema.leakSignals), true);
});
