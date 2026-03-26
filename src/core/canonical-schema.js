function withDefaultString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function withDefaultArray(value) {
  return Array.isArray(value) ? value : [];
}

function clampConfidence(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

export function createMetadata({
  source = "unknown",
  confidence = 0,
  status = "unknown",
  derivedFrom = "unknown",
}) {
  return {
    source: withDefaultString(source, "unknown"),
    confidence: clampConfidence(confidence),
    status: withDefaultString(status, "unknown"),
    derivedFrom: withDefaultString(derivedFrom, "unknown"),
  };
}

export function createEvidence({
  value = null,
  source = "unknown",
  confidence = 0,
  status = "unknown",
  derivedFrom = "unknown",
}) {
  const metadata = createMetadata({
    source,
    confidence,
    status,
    derivedFrom,
  });

  return {
    value,
    ...metadata,
    metadata,
  };
}

export function createGap({
  id,
  text,
  category = "general",
  severity = "medium",
  source = "unknown",
  confidence = 0,
  status = "verified",
  derivedFrom = "unknown",
}) {
  const metadata = createMetadata({
    source,
    confidence,
    status,
    derivedFrom,
  });

  return {
    id: withDefaultString(id, withDefaultString(text, "gap")),
    text: withDefaultString(text, "Gap not specified"),
    category: withDefaultString(category, "general"),
    severity: withDefaultString(severity, "medium"),
    ...metadata,
    metadata,
  };
}

export function createFlow({
  id,
  name,
  status = "unknown",
  blockedBy = [],
  notes = null,
  source = "unknown",
  confidence = 0,
  derivedFrom = "unknown",
  reliabilityStatus = "verified",
}) {
  const metadata = createMetadata({
    source,
    confidence,
    status: reliabilityStatus,
    derivedFrom,
  });

  return {
    id: withDefaultString(id, withDefaultString(name, "flow")),
    name: withDefaultString(name, "Flow"),
    status: withDefaultString(status, "unknown"),
    blockedBy: withDefaultArray(blockedBy),
    notes: typeof notes === "string" ? notes : null,
    source: metadata.source,
    confidence: metadata.confidence,
    derivedFrom: metadata.derivedFrom,
    reliabilityStatus: metadata.status,
    metadata,
  };
}

export function createDependency({
  id,
  title,
  type = "dependency",
  status = "unknown",
  source = "unknown",
  confidence = 0,
  derivedFrom = "unknown",
}) {
  const metadata = createMetadata({
    source,
    confidence,
    status,
    derivedFrom,
  });

  return {
    id: withDefaultString(id, withDefaultString(title, "dependency")),
    title: withDefaultString(title, "Dependency"),
    type: withDefaultString(type, "dependency"),
    ...metadata,
    metadata,
  };
}

export function createRisk({
  id,
  title,
  severity = "medium",
  source = "unknown",
  confidence = 0,
  status = "verified",
  derivedFrom = "unknown",
}) {
  const metadata = createMetadata({
    source,
    confidence,
    status,
    derivedFrom,
  });

  return {
    id: withDefaultString(id, withDefaultString(title, "risk")),
    title: withDefaultString(title, "Risk"),
    severity: withDefaultString(severity, "medium"),
    ...metadata,
    metadata,
  };
}

export function createSignal({
  id,
  title,
  reason = "",
  source = "unknown",
  confidence = 0,
  status = "unknown",
  derivedFrom = "unknown",
}) {
  const metadata = createMetadata({
    source,
    confidence,
    status,
    derivedFrom,
  });

  return {
    id: withDefaultString(id, withDefaultString(title, "signal")),
    title: withDefaultString(title, "Signal"),
    reason: withDefaultString(reason),
    ...metadata,
    metadata,
  };
}

export function createRecommendedAction({
  id,
  title,
  reason = "",
  source = "unknown",
  confidence = 0,
  status = "unknown",
  derivedFrom = "unknown",
}) {
  const metadata = createMetadata({
    source,
    confidence,
    status,
    derivedFrom,
  });

  return {
    id: withDefaultString(id, withDefaultString(title, "action")),
    title: withDefaultString(title, "Action"),
    reason: withDefaultString(reason),
    ...metadata,
    metadata,
  };
}

export function createCanonicalState({
  goal = "",
  stack = {},
  capabilities = {},
  gaps = [],
  flows = [],
  dependencies = [],
  risks = [],
}) {
  return {
    goal: withDefaultString(goal),
    stack: {
      frontend: stack.frontend ?? createEvidence({}),
      backend: stack.backend ?? createEvidence({}),
      database: stack.database ?? createEvidence({}),
    },
    capabilities,
    gaps,
    flows,
    dependencies,
    risks,
  };
}

export function createCanonicalProject({
  version = "1.0.0",
  projectId,
  domain = "generic",
  state,
  bottleneck,
  recommendedActions = [],
  sources = {},
}) {
  return {
    version: withDefaultString(version, "1.0.0"),
    projectId: withDefaultString(projectId, "project"),
    domain: withDefaultString(domain, "generic"),
    state,
    bottleneck,
    recommendedActions: withDefaultArray(recommendedActions),
    sources: {
      scan: Boolean(sources.scan),
      external: Boolean(sources.external),
      manual: Boolean(sources.manual),
    },
  };
}
