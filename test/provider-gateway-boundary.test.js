import test from "node:test";
import assert from "node:assert/strict";

import {
  buildProviderGatewayBoundary,
  buildProviderReleaseRegistry,
  classifyProviderScopedRequest,
  normalizeCreativeProviderOutput,
} from "../src/core/provider-gateway-boundary.js";

const project = {
  id: "lead-tool",
  state: {
    roleCapabilityMatrix: {
      roles: [
        {
          role: "owner",
          capabilities: {
            view: true,
            edit: true,
            run: true,
            approve: true,
            deploy: true,
            connectAccounts: true,
            manageCredentials: true,
          },
        },
        {
          role: "viewer",
          capabilities: {
            view: true,
            edit: false,
            run: false,
            approve: false,
            deploy: false,
            connectAccounts: false,
            manageCredentials: false,
          },
        },
      ],
    },
  },
};

test("PROV-001 classifies mixed Hebrew and English provider-scoped requests", () => {
  const publish = classifyProviderScopedRequest("תפרסם לי live url ותעשה deploy");
  const creative = classifyProviderScopedRequest("Generate Higgsfield video ad for Instagram");
  const payment = classifyProviderScopedRequest("תחבר סליקה ותתחיל charge ללקוחות");

  assert.equal(publish.isProviderScoped, true);
  assert.equal(publish.requestClass, "publish");
  assert.equal(creative.isProviderScoped, true);
  assert.equal(creative.requestClass, "social");
  assert.equal(creative.matchedPatterns.includes("creative-generation"), true);
  assert.equal(payment.isProviderScoped, true);
  assert.equal(payment.requestClass, "payment");
});

test("PROV-001 connection is not permission and permission is not approval", () => {
  const { providerGatewayBoundary } = buildProviderGatewayBoundary({
    project: {
      ...project,
      linkedAccounts: [
        {
          accountRecord: {
            accountId: "stripe-team-1",
            provider: "stripe",
          },
          providerSession: {
            providerType: "stripe",
            scopes: ["spend"],
          },
        },
      ],
    },
    actor: {
      actorId: "owner-1",
      role: "owner",
    },
    requestText: "תחייב את הלקוח עכשיו בכרטיס אשראי",
    providerType: "stripe",
    capability: "charge",
  });

  assert.equal(providerGatewayBoundary.taskId, "PROV-001");
  assert.equal(providerGatewayBoundary.provider.connected, true);
  assert.equal(providerGatewayBoundary.capability.roleAllowsAction, true);
  assert.equal(providerGatewayBoundary.capability.approvalStatus, "missing");
  assert.equal(providerGatewayBoundary.capability.canExecuteExternally, false);
  assert.equal(providerGatewayBoundary.blockers.includes("explicit-approval-missing"), true);
});

test("PROV-001 blocks non-privileged actors even with a connected provider", () => {
  const { providerGatewayBoundary } = buildProviderGatewayBoundary({
    project: {
      ...project,
      linkedAccounts: [
        {
          accountRecord: {
            accountId: "vercel-team-1",
            provider: "vercel",
          },
          providerSession: {
            providerType: "vercel",
            scopes: ["deploy"],
          },
        },
      ],
    },
    actor: {
      actorId: "viewer-1",
      role: "viewer",
    },
    requestText: "deploy this now",
    providerType: "vercel",
    capability: "deploy",
    approval: {
      status: "approved",
    },
  });

  assert.equal(providerGatewayBoundary.capability.roleAllowsAction, false);
  assert.equal(providerGatewayBoundary.capability.canExecuteExternally, false);
  assert.equal(providerGatewayBoundary.blockers.includes("role-cannot-use-provider-capability"), true);
});

test("PROV-001 normalizes creative outputs as Nexus-owned draft assets", () => {
  const { creativeProviderAsset } = normalizeCreativeProviderOutput({
    providerType: "higgsfield",
    assetType: "motion-video",
    prompt: "Founder story video",
    sourceAssetId: "provider-video-1",
    productId: "lead-tool",
    packageId: "package-1",
  });

  assert.equal(creativeProviderAsset.taskId, "PROV-001");
  assert.equal(creativeProviderAsset.truthOwner, "nexus");
  assert.equal(creativeProviderAsset.canBecomeProductTruthOwner, false);
  assert.equal(creativeProviderAsset.canPublishWithoutApproval, false);
  assert.equal(creativeProviderAsset.publicationState, "not-published");
  assert.equal(creativeProviderAsset.packageLink, "package-1");
});

test("PROV-001 provider release registry names first-release and deferred provider classes", () => {
  const { providerReleaseRegistry } = buildProviderReleaseRegistry();

  assert.equal(providerReleaseRegistry.taskId, "PROV-001");
  assert.equal(providerReleaseRegistry.providers.some((provider) => provider.providerType === "openai" && provider.decision === "first-release"), true);
  assert.equal(providerReleaseRegistry.providers.some((provider) => provider.providerType === "higgsfield" && provider.decision === "deferred-through-gateway"), true);
  assert.equal(providerReleaseRegistry.creativeProviderClasses.some((entry) => entry.providerClass === "video-motion-generation"), true);
});
