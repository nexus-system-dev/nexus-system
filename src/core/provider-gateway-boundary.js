function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function unique(values) {
  return [...new Set(normalizeArray(values).filter(Boolean))];
}

function slugify(value) {
  return normalizeString(value, "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

const PROVIDER_RELEASE_DECISIONS = {
  openai: {
    decision: "first-release",
    providerClass: "model",
    userFacingLabel: "מודל שיחה ובנייה",
    allowedModes: ["concept", "draft", "generate"],
    blockedModes: ["publish", "spend", "external-send", "delete"],
  },
  anthropic: {
    decision: "post-release",
    providerClass: "model",
    userFacingLabel: "מודל שיחה נוסף",
    allowedModes: ["concept", "draft"],
    blockedModes: ["external-send", "publish", "spend"],
  },
  gemini: {
    decision: "post-release",
    providerClass: "model",
    userFacingLabel: "מודל שיחה נוסף",
    allowedModes: ["concept", "draft"],
    blockedModes: ["external-send", "publish", "spend"],
  },
  github: {
    decision: "post-release",
    providerClass: "source-control",
    userFacingLabel: "חיבור קוד",
    allowedModes: ["import", "export", "read"],
    blockedModes: ["publish", "deploy", "delete"],
  },
  gitlab: {
    decision: "post-release",
    providerClass: "source-control",
    userFacingLabel: "חיבור קוד",
    allowedModes: ["import", "export", "read"],
    blockedModes: ["publish", "deploy", "delete"],
  },
  figma: {
    decision: "first-release-design-support",
    providerClass: "design",
    userFacingLabel: "ייבוא ותכנון עיצוב",
    allowedModes: ["concept", "draft", "import", "export"],
    blockedModes: ["publish", "spend", "provider-owned-truth"],
  },
  higgsfield: {
    decision: "deferred-through-gateway",
    providerClass: "creative",
    userFacingLabel: "קריאייטיב וידאו",
    allowedModes: ["concept", "draft"],
    blockedModes: ["publish", "schedule", "spend", "train-reference"],
  },
  runway: {
    decision: "deferred-through-gateway",
    providerClass: "creative",
    userFacingLabel: "קריאייטיב וידאו",
    allowedModes: ["concept", "draft"],
    blockedModes: ["publish", "schedule", "spend", "train-reference"],
  },
  adobe: {
    decision: "deferred-through-gateway",
    providerClass: "creative",
    userFacingLabel: "קריאייטיב מותג",
    allowedModes: ["concept", "draft", "edit"],
    blockedModes: ["publish", "spend", "provider-owned-truth"],
  },
  canva: {
    decision: "deferred-through-gateway",
    providerClass: "creative",
    userFacingLabel: "קריאייטיב מותג",
    allowedModes: ["concept", "draft", "edit"],
    blockedModes: ["publish", "spend", "provider-owned-truth"],
  },
  whatsapp: {
    decision: "post-release",
    providerClass: "messaging",
    userFacingLabel: "שליחת הודעות",
    allowedModes: ["draft"],
    blockedModes: ["send", "external-write", "delete"],
  },
  stripe: {
    decision: "post-release",
    providerClass: "payment",
    userFacingLabel: "תשלומים",
    allowedModes: ["draft", "read"],
    blockedModes: ["charge", "refund", "spend"],
  },
  vercel: {
    decision: "post-release",
    providerClass: "deploy",
    userFacingLabel: "פריסה",
    allowedModes: ["draft", "validate"],
    blockedModes: ["deploy", "publish", "external-write"],
  },
  render: {
    decision: "post-release",
    providerClass: "deploy",
    userFacingLabel: "פריסה",
    allowedModes: ["draft", "validate"],
    blockedModes: ["deploy", "publish", "external-write"],
  },
  sendgrid: {
    decision: "post-release",
    providerClass: "email",
    userFacingLabel: "אימייל",
    allowedModes: ["draft", "test"],
    blockedModes: ["send", "external-write", "delete"],
  },
  mailchimp: {
    decision: "post-release",
    providerClass: "email",
    userFacingLabel: "אימייל",
    allowedModes: ["draft", "test"],
    blockedModes: ["send", "external-write", "delete"],
  },
  google_ads: {
    decision: "post-release",
    providerClass: "ads",
    userFacingLabel: "פרסום ממומן",
    allowedModes: ["draft", "read"],
    blockedModes: ["publish", "schedule", "spend", "delete"],
  },
  analytics: {
    decision: "post-release",
    providerClass: "analytics",
    userFacingLabel: "מדידה",
    allowedModes: ["read", "import"],
    blockedModes: ["train-reference", "external-write"],
  },
  storage: {
    decision: "post-release",
    providerClass: "storage",
    userFacingLabel: "אחסון",
    allowedModes: ["read", "write-draft"],
    blockedModes: ["delete", "publish"],
  },
  logging: {
    decision: "first-release-internal-only",
    providerClass: "observability",
    userFacingLabel: "אבחון פנימי",
    allowedModes: ["read", "import"],
    blockedModes: ["external-share", "delete"],
  },
};

const CREATIVE_PROVIDER_CLASSES = [
  "brand-identity",
  "app-screen-visual-generation",
  "image-generation",
  "video-motion-generation",
  "campaign-creative",
  "social-ad-creative",
  "design-import-export",
  "creative-mcp-cli",
];

const PROVIDER_REQUEST_PATTERNS = [
  { requestClass: "message-send", providerType: "whatsapp", capability: "send", patterns: [/וואטסאפ|whatsapp/iu] },
  { requestClass: "payment", providerType: "stripe", capability: "charge", patterns: [/תשלום|סליקה|חיוב|כרטיס אשראי|payment|checkout|charge|stripe/iu] },
  { requestClass: "publish", providerType: "vercel", capability: "publish", patterns: [/פרסם|לפרסם|תפרסם|publish|go live|live url/iu] },
  { requestClass: "deploy", providerType: "vercel", capability: "deploy", patterns: [/דיפלוי|פריסה|deploy|deployment|hosting/iu] },
  { requestClass: "email-send", providerType: "sendgrid", capability: "send", patterns: [/אימייל|מייל|email|newsletter|sendgrid|mailchimp/iu] },
  { requestClass: "social", providerType: "google_ads", capability: "publish", patterns: [/סושיאל|רשתות|קמפיין|פרסומת|ads?|campaign|facebook|instagram|tiktok|linkedin/iu] },
  { requestClass: "spend", providerType: "google_ads", capability: "spend", patterns: [/תקציב|להוציא כסף|spend|budget|ad spend/iu] },
  { requestClass: "creative-generation", providerType: "creative", capability: "generate", patterns: [/וידאו|קריאייטיב|מודעה|תמונה|מותג|לוגו|סרטון|brand|creative|image|video|motion|higgsfield|runway|canva|adobe/iu] },
  { requestClass: "design-import-export", providerType: "figma", capability: "import", patterns: [/פיגמה|figma|design import|design export|ייבוא עיצוב|יצוא עיצוב/iu] },
  { requestClass: "provider-connect", providerType: "generic", capability: "connect", patterns: [/חבר|תחבר|connect|integration|provider|ספק חיצוני|אינטגרציה/iu] },
  { requestClass: "reference-training", providerType: "creative", capability: "train-reference", patterns: [/תאמן|train|reference|דמות קבועה|מותג קבוע|brand kit/iu] },
  { requestClass: "external-delete", providerType: "generic", capability: "delete", patterns: [/מחק אצל|delete from|remove from provider|מחיקה אצל ספק/iu] },
];

export function getProviderReleaseDecision(providerType = "generic") {
  const normalizedProviderType = normalizeString(providerType, "generic").toLowerCase().replace(/[-\s]+/g, "_");
  return {
    providerType: normalizedProviderType,
    ...(PROVIDER_RELEASE_DECISIONS[normalizedProviderType] ?? {
      decision: "out-of-scope-until-registered",
      providerClass: "unknown",
      userFacingLabel: "יכולת חיצונית",
      allowedModes: ["concept", "draft"],
      blockedModes: ["connect", "publish", "send", "deploy", "spend", "delete"],
    }),
  };
}

export function classifyProviderScopedRequest(message = "") {
  const text = normalizeString(message);
  if (!text) {
    return {
      isProviderScoped: false,
      requestClass: "none",
      providerType: "none",
      capability: "none",
      matchedPatterns: [],
    };
  }

  const matches = PROVIDER_REQUEST_PATTERNS.filter((entry) => entry.patterns.some((pattern) => pattern.test(text)));
  if (matches.length === 0) {
    return {
      isProviderScoped: false,
      requestClass: "none",
      providerType: "none",
      capability: "none",
      matchedPatterns: [],
    };
  }

  const priority = [
    "payment",
    "spend",
    "publish",
    "deploy",
    "message-send",
    "email-send",
    "social",
    "creative-generation",
    "design-import-export",
    "reference-training",
    "external-delete",
    "provider-connect",
  ];
  const selected = [...matches].sort((a, b) => priority.indexOf(a.requestClass) - priority.indexOf(b.requestClass))[0];
  return {
    isProviderScoped: true,
    requestClass: selected.requestClass,
    providerType: selected.providerType,
    capability: selected.capability,
    matchedPatterns: matches.map((match) => match.requestClass),
  };
}

function resolveRoleCapabilities(roleCapabilityMatrix = null, actorRole = "viewer") {
  const matrix = normalizeObject(roleCapabilityMatrix);
  const roles = normalizeArray(matrix.roles);
  return normalizeObject(roles.find((entry) => entry.role === actorRole)?.capabilities);
}

function requiresExplicitApproval(capability) {
  return ["connect", "send", "publish", "deploy", "spend", "charge", "refund", "delete", "train-reference", "generate"].includes(capability);
}

function scopeForCapability(capability) {
  const scopeMap = {
    connect: "connect",
    send: "send",
    publish: "publish",
    deploy: "deploy",
    spend: "spend",
    charge: "spend",
    refund: "refund",
    delete: "delete",
    generate: "write",
    import: "read",
    export: "write",
    "train-reference": "admin",
  };
  return scopeMap[capability] ?? "read";
}

export function buildProviderGatewayBoundary({
  project = null,
  actor = null,
  requestText = "",
  providerType = null,
  capability = null,
  approval = null,
  linkedAccounts = null,
} = {}) {
  const providerRequest = classifyProviderScopedRequest(requestText);
  const resolvedProviderType = normalizeString(providerType, providerRequest.providerType === "none" ? "generic" : providerRequest.providerType);
  const resolvedCapability = normalizeString(capability, providerRequest.capability === "none" ? "read" : providerRequest.capability);
  const releaseDecision = getProviderReleaseDecision(resolvedProviderType === "creative" ? "higgsfield" : resolvedProviderType);
  const role = normalizeString(actor?.role, "viewer");
  const capabilities = resolveRoleCapabilities(project?.state?.roleCapabilityMatrix ?? project?.context?.roleCapabilityMatrix, role);
  const accounts = normalizeArray(linkedAccounts ?? project?.linkedAccounts ?? project?.state?.linkedAccounts ?? project?.context?.linkedAccounts);
  const connectedAccount = accounts.find((account) =>
    account?.providerSession?.providerType === resolvedProviderType
    || account?.accountRecord?.provider === resolvedProviderType
    || account?.accountRecord?.accountType === resolvedProviderType);
  const providerScopes = unique([
    ...normalizeArray(connectedAccount?.providerSession?.scopes),
    ...normalizeArray(connectedAccount?.providerCapabilities?.scopes),
  ]);
  const requiredScope = scopeForCapability(resolvedCapability);
  const approvalStatus = normalizeString(approval?.status, "missing");
  const roleAllowsConnection = capabilities.connectAccounts === true || capabilities.manageCredentials === true;
  const roleAllowsAction =
    resolvedCapability === "read"
      ? capabilities.view === true
      : ["publish", "deploy"].includes(resolvedCapability)
        ? capabilities.deploy === true
        : ["spend", "charge", "refund"].includes(resolvedCapability)
          ? capabilities.manageCredentials === true
          : capabilities.approve === true || capabilities.run === true || capabilities.edit === true;
  const connectionReady = Boolean(connectedAccount);
  const scopeReady = providerScopes.includes(requiredScope) || providerScopes.includes(`${requiredScope}:write`) || providerScopes.includes(`${requiredScope}:admin`);
  const approvalRequired = requiresExplicitApproval(resolvedCapability);
  const approvalReady = !approvalRequired || ["approved", "granted"].includes(approvalStatus);

  const blockers = [];
  if (!providerRequest.isProviderScoped && resolvedProviderType === "generic" && !providerType) {
    blockers.push("not-provider-scoped");
  }
  if (releaseDecision.decision === "out-of-scope-until-registered") {
    blockers.push("provider-not-registered");
  }
  if (["post-release", "deferred-through-gateway"].includes(releaseDecision.decision)) {
    blockers.push("provider-not-enabled-for-first-release");
  }
  if (connectionReady && !scopeReady && resolvedCapability !== "read") {
    blockers.push("provider-scope-missing");
  }
  if (!connectionReady && !["concept", "draft", "read"].includes(resolvedCapability)) {
    blockers.push("provider-connection-missing");
  }
  if (resolvedCapability === "connect" && !roleAllowsConnection) {
    blockers.push("role-cannot-connect-provider");
  }
  if (resolvedCapability !== "connect" && !roleAllowsAction) {
    blockers.push("role-cannot-use-provider-capability");
  }
  if (!approvalReady) {
    blockers.push("explicit-approval-missing");
  }

  const canExecuteExternally = blockers.length === 0;
  const status = canExecuteExternally
    ? "ready-for-provider-execution"
    : approvalRequired || blockers.some((blocker) => blocker.includes("approval") || blocker.includes("scope") || blocker.includes("connection"))
      ? "blocked-pending-approval-or-scope"
      : "blocked";

  return {
    providerGatewayBoundary: {
      taskId: "PROV-001",
      boundaryId: `provider-gateway:${slugify(project?.id)}:${slugify(resolvedProviderType)}:${slugify(resolvedCapability)}`,
      status,
      projectId: normalizeString(project?.id, null),
      actor: {
        actorId: normalizeString(actor?.actorId ?? actor?.userId, null),
        role,
      },
      request: {
        text: normalizeString(requestText, ""),
        isProviderScoped: providerRequest.isProviderScoped,
        requestClass: providerRequest.requestClass,
        matchedPatterns: providerRequest.matchedPatterns,
      },
      provider: {
        providerType: resolvedProviderType,
        providerClass: releaseDecision.providerClass,
        releaseDecision: releaseDecision.decision,
        userFacingLabel: releaseDecision.userFacingLabel,
        connected: connectionReady,
        connectedAccountId: connectedAccount?.accountRecord?.accountId ?? null,
        requiredScope,
        scopes: providerScopes,
      },
      capability: {
        capability: resolvedCapability,
        requiresExplicitApproval: approvalRequired,
        approvalStatus,
        roleAllowsConnection,
        roleAllowsAction,
        canExecuteExternally,
      },
      blockers: unique(blockers),
      userFacingBoundary: canExecuteExternally
        ? "היכולת החיצונית מוכנה רק לאחר שהזהות, ההרשאות, הסקופ והאישור התאימו."
        : "זו יכולת חיצונית. נקסוס לא תבצע אותה בלי חיבור מתאים, הרשאה מתאימה ואישור מפורש.",
      hiddenProviderIdentityRule: "Normal user copy may describe the capability, but must not expose provider plumbing as the product truth owner.",
    },
  };
}

export function normalizeCreativeProviderOutput({
  providerType = "creative",
  assetType = "creative-asset",
  prompt = "",
  sourceAssetId = null,
  productId = null,
  packageId = null,
  approvalState = "draft",
  usageBoundary = "internal-draft-only",
  licenseBoundary = "unverified-until-provider-proof",
} = {}) {
  const providerDecision = getProviderReleaseDecision(providerType === "creative" ? "higgsfield" : providerType);
  return {
    creativeProviderAsset: {
      taskId: "PROV-001",
      assetId: `creative-asset:${slugify(productId)}:${slugify(assetType)}:${slugify(sourceAssetId ?? Date.now())}`,
      truthOwner: "nexus",
      providerType: normalizeString(providerType, "creative"),
      providerClass: providerDecision.providerClass,
      assetType: normalizeString(assetType, "creative-asset"),
      productLink: productId ?? null,
      packageLink: packageId ?? null,
      sourceTrace: {
        sourceAssetId: sourceAssetId ?? null,
        prompt: normalizeString(prompt, ""),
      },
      approvalState,
      usageBoundary,
      licenseBoundary,
      publicationState: "not-published",
      canPublishWithoutApproval: false,
      canBecomeProductTruthOwner: false,
      creativeProviderClasses: CREATIVE_PROVIDER_CLASSES,
      userFacingBoundary: "נכס קריאייטיב הוא טיוטה שמחוברת למוצר, לא הוכחת מוצר ולא פרסום חיצוני.",
    },
  };
}

export function buildProviderReleaseRegistry() {
  return {
    providerReleaseRegistry: {
      taskId: "PROV-001",
      providers: Object.values(PROVIDER_RELEASE_DECISIONS).map((entry, index) => ({
        registryEntryId: `provider-release:${Object.keys(PROVIDER_RELEASE_DECISIONS)[index]}`,
        providerType: Object.keys(PROVIDER_RELEASE_DECISIONS)[index],
        ...entry,
      })),
      creativeProviderClasses: CREATIVE_PROVIDER_CLASSES.map((providerClass) => ({
        providerClass,
        status: "registered-or-deferred-through-gateway",
      })),
    },
  };
}
