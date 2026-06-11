const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const ownerId = `prov-owner-${now}`;
const projectId = `prov-project-${now}`;

async function apiJson(path, {
  method = "GET",
  token = null,
  headers = {},
  body = null,
  expected = null,
} = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => null);
  if (expected && response.status !== expected) {
    throw new Error(`${method} ${path} expected ${expected}, got ${response.status}: ${JSON.stringify(payload)}`);
  }
  return {
    status: response.status,
    headers: response.headers,
    payload,
  };
}

async function signup(userId) {
  const result = await apiJson("/api/auth/signup", {
    method: "POST",
    expected: 201,
    body: {
      userInput: {
        userId,
        email: `${userId}@example.test`,
        displayName: userId,
      },
      credentials: {
        password: `secret-${now}`,
      },
    },
  });
  const token = result.payload?.authPayload?.tokenBundle?.accessToken;
  if (!token) {
    throw new Error(`Signup did not return access token for ${userId}`);
  }
  return { token };
}

const owner = await signup(ownerId);

await apiJson("/api/projects", {
  method: "POST",
  token: owner.token,
  expected: 201,
  body: {
    id: projectId,
    name: "PROV-001 Live Project",
    goal: "Prove provider gateway and external capability boundary",
  },
});

const gateway = await apiJson(`/api/projects/${projectId}/provider-gateway/evaluate`, {
  method: "POST",
  token: owner.token,
  expected: 200,
  body: {
    requestText: "Generate Higgsfield video ad and spend 200 שקל באינסטגרם",
  },
});

const boundary = gateway.payload?.providerGatewayBoundary;
if (boundary?.taskId !== "PROV-001") {
  throw new Error(`Provider gateway did not return PROV-001 truth: ${JSON.stringify(boundary)}`);
}
if (boundary?.capability?.canExecuteExternally !== false) {
  throw new Error(`Provider gateway allowed external execution without approval: ${JSON.stringify(boundary)}`);
}
if (!Array.isArray(boundary?.blockers) || !boundary.blockers.includes("explicit-approval-missing")) {
  throw new Error(`Provider gateway did not require explicit approval: ${JSON.stringify(boundary)}`);
}

const linked = await apiJson(`/api/projects/${projectId}/accounts/link`, {
  method: "POST",
  token: owner.token,
  body: {
    providerType: "stripe",
    userInput: {
      accountId: "stripe-live-proof",
      authMode: "api-key",
      credentialValue: "not-a-real-secret",
      scopes: ["spend"],
      approval: { status: "missing" },
      requestText: "connect stripe",
    },
  },
});
let providerConnectionBlockedPrecisely = false;
if (linked.status === 403 && linked.payload?.reason === "feature-disabled") {
  providerConnectionBlockedPrecisely = true;
} else if (linked.status === 200) {
  const linkedBoundary = linked.payload?.linkedAccountPayload?.providerGatewayBoundary;
  if (linkedBoundary?.capability?.canExecuteExternally !== false) {
    throw new Error(`Provider connection incorrectly granted execution permission: ${JSON.stringify(linkedBoundary)}`);
  }
  if (!linkedBoundary?.blockers?.includes("explicit-approval-missing")) {
    throw new Error(`Provider connection did not keep approval missing: ${JSON.stringify(linkedBoundary)}`);
  }
} else {
  throw new Error(`Provider connection returned unexpected status ${linked.status}: ${JSON.stringify(linked.payload)}`);
}

const asset = await apiJson(`/api/projects/${projectId}/provider-gateway/creative-assets`, {
  method: "POST",
  token: owner.token,
  expected: 200,
  body: {
    providerType: "higgsfield",
    assetType: "motion-video",
    prompt: "founder story video",
    sourceAssetId: "higgsfield-draft-1",
    packageId: "package-live-proof",
  },
});
const creativeAsset = asset.payload?.creativeProviderAsset;
if (creativeAsset?.truthOwner !== "nexus" || creativeAsset?.canPublishWithoutApproval !== false) {
  throw new Error(`Creative asset was not normalized as Nexus-owned draft: ${JSON.stringify(creativeAsset)}`);
}

const restored = await apiJson(`/api/projects/${projectId}`, {
  token: owner.token,
  expected: 200,
});
if (restored.payload?.state?.providerGatewayBoundary?.taskId !== "PROV-001") {
  throw new Error("Restored project did not preserve PROV-001 provider gateway truth.");
}
if (!Array.isArray(restored.payload?.state?.creativeProviderAssets) || restored.payload.state.creativeProviderAssets.length < 1) {
  throw new Error("Restored project did not preserve creative provider asset truth.");
}

const report = {
  taskId: "PROV-001",
  baseUrl,
  projectId,
  ownerId,
  checks: {
    providerRequestBounded: true,
    connectedProviderDoesNotGrantExecution: linked.status === 200,
    providerConnectionBlockedPrecisely,
    creativeAssetNormalizedIntoNexusTruth: true,
    refreshRestorePreservesProviderTruth: true,
  },
};

console.log(`PROV-001 live proof passed. ${JSON.stringify(report, null, 2)}`);
