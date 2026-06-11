const REAL_AGENT_LAYER_ID = "nexus-real-agent-layer:v1";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function createAgentDefinition({
  agentId,
  role,
  owns = [],
  decides = [],
  mustNotDo = [],
  input = [],
  output = [],
} = {}) {
  return {
    agentId: normalizeString(agentId),
    role: normalizeString(role),
    owns: normalizeArray(owns),
    decides: normalizeArray(decides),
    mustNotDo: normalizeArray(mustNotDo),
    input: normalizeArray(input),
    output: normalizeArray(output),
  };
}

export function createRealAgentLayerContract() {
  const projectDiscoveryAgent = createAgentDefinition({
    agentId: "project-discovery-agent",
    role: "Understand a free-form product idea and produce canonical project understanding.",
    owns: [
      "conversation-policy",
      "product-understanding",
      "missing-information",
      "contradiction-detection",
      "enough-product-truth-decision",
    ],
    decides: [
      "what-is-clear",
      "what-is-missing",
      "what-to-ask-next",
      "whether-enough-product-truth-exists",
      "whether-to-handoff-to-product-skeleton-agent",
    ],
    mustNotDo: [
      "act-as-ui",
      "build-product-skeleton",
      "execute-build-loop",
      "delegate-decision-to-intake-completion-gates",
    ],
    input: [
      "free-form-user-message",
      "conversation-history",
      "context-memory",
    ],
    output: [
      "canonical-project-understanding",
      "open-questions",
      "readiness-signal",
      "handoff-proof",
    ],
  });

  const discoveryResponsePolicy = {
    owner: "project-discovery-agent",
    nexusDefines: [
      "agent-role",
      "required-product-categories",
      "conversation-boundaries",
      "when-to-ask-follow-up",
      "when-not-to-ask-follow-up",
      "enough-product-truth-rule",
      "handoff-requirements",
    ],
    agentComposes: [
      "user-facing-response",
      "natural-language-reflection",
      "follow-up-question-wording",
      "handoff-explanation",
    ],
    requiredResponseBehavior: [
      "reflect-user-idea-in-natural-language",
      "identify-primary-actor-pain-first-flow",
      "ask-one-smart-follow-up-only-when-needed",
      "state-open-unknowns-without-blocking-unnecessarily",
      "handoff-only-after-enough-product-truth",
    ],
    prohibitedResponseBehavior: [
      "main-discovery-response-from-hardcoded-sentence-template",
      "scripted-copy-pretending-to-understand",
      "system-status-message-as-agent-answer",
      "copy-replacement-as-trueGreen-proof",
    ],
    fallbackOnlyCopyAllowedFor: [
      "provider-unavailable",
      "network-error",
      "empty-initial-state",
      "safe-error-message",
    ],
    canonicalRule: "Nexus defines the Project Discovery Agent role and behavior; the agent composes the user-facing response from the actual conversation.",
  };

  const productSkeletonAgent = createAgentDefinition({
    agentId: "product-skeleton-agent",
    role: "Turn project understanding into the first canonical product skeleton.",
    owns: [
      "product-skeleton",
      "skeleton-assumptions",
      "unknowns-that-do-not-block-first-build",
    ],
    decides: [
      "working-product-promise",
      "first-workflow",
      "main-surface-candidate",
      "first-entities-and-actions",
      "first-artifact-expectation",
    ],
    mustNotDo: [
      "run-discovery-conversation",
      "execute-build-loop",
      "hide-unknowns",
    ],
    input: [
      "canonical-project-understanding",
      "readiness-signal",
      "open-questions",
      "first-workflow-spine",
    ],
    output: [
      "canonical-product-skeleton",
      "skeleton-proof",
      "open-unknowns",
    ],
  });

  const buildLoopAgent = createAgentDefinition({
    agentId: "build-loop-agent",
    role: "Turn the product skeleton into the first build slice and Nexus Loop handoff.",
    owns: [
      "first-build-slice",
      "executable-build-direction",
      "loop-continuation-context",
    ],
    decides: [
      "first-task",
      "build-surface-entry",
      "artifact-direction",
      "next-loop-context",
    ],
    mustNotDo: [
      "re-run-product-discovery",
      "rewrite-product-skeleton-without-proof",
      "treat-intake-engine-as-build-authority",
    ],
    input: [
      "canonical-product-skeleton",
      "skeleton-proof",
      "open-assumptions",
    ],
    output: [
      "first-build-slice",
      "first-task",
      "first-skeleton-artifact-surface",
      "loop-handoff-proof",
    ],
  });

  return {
    contractId: REAL_AGENT_LAYER_ID,
    canonicalRule: "The Nexus front door is a role-defined multi-agent system, not an improved intake engine.",
    chain: [
      projectDiscoveryAgent.agentId,
      productSkeletonAgent.agentId,
      buildLoopAgent.agentId,
    ],
    agents: {
      projectDiscoveryAgent,
      productSkeletonAgent,
      buildLoopAgent,
    },
    discoveryResponsePolicy,
    handoffContract: {
      passedBetweenAgents: [
        "structured-understanding",
        "confidence-readiness",
        "open-questions",
        "assumptions",
        "first-workflow",
        "skeleton-fields",
        "build-direction",
      ],
      requiredProof: [
        "source-agent",
        "understanding-summary",
        "why-progress-is-allowed",
        "remaining-open-items",
        "next-agent-responsibility",
      ],
      persistedState: [
        "conversation-turns",
        "project-understanding",
        "product-skeleton",
        "handoff-records",
        "first-task",
        "continuity-context",
      ],
      visibleToUser: [
        "conversation-with-nexus",
        "short-understanding-summary",
        "smart-follow-up-when-needed",
        "first-skeleton-when-ready",
        "natural-build-loop-transition",
      ],
      internalOnly: [
        "provider-choice",
        "intake-persistence-details",
        "gate-internals",
        "agent-routing-internals",
        "confidence-scoring-internals",
      ],
    },
    intakeBoundary: {
      allowedUse: [
        "persistence",
        "sessions",
        "restore",
        "summaries",
        "compatibility",
        "continuity-fallback",
      ],
      prohibitedUse: [
        "agent-brain",
        "agent-decision-policy",
        "product-skeleton-authority",
        "build-loop-authority",
        "trueGreen-proof-by-gate-fixes-only",
      ],
      rule: "The intake engine is storage/support infrastructure. It is not the agent brain.",
    },
  };
}

export function validateRealAgentLayerContract(contract = createRealAgentLayerContract()) {
  const normalized = normalizeObject(contract);
  const agents = normalizeObject(normalized.agents);
  const requiredAgentKeys = [
    "projectDiscoveryAgent",
    "productSkeletonAgent",
    "buildLoopAgent",
  ];
  const missingAgentKeys = requiredAgentKeys.filter((key) => !agents[key]?.agentId);
  const missingDecisionOwners = requiredAgentKeys.filter((key) => normalizeArray(agents[key]?.decides).length === 0);
  const intakeBoundary = normalizeObject(normalized.intakeBoundary);
  const prohibitedUse = normalizeArray(intakeBoundary.prohibitedUse);
  const discoveryResponsePolicy = normalizeObject(normalized.discoveryResponsePolicy);
  const prohibitedResponseBehavior = normalizeArray(discoveryResponsePolicy.prohibitedResponseBehavior);
  const agentComposes = normalizeArray(discoveryResponsePolicy.agentComposes);

  const isValid = missingAgentKeys.length === 0
    && missingDecisionOwners.length === 0
    && prohibitedUse.includes("agent-brain")
    && prohibitedResponseBehavior.includes("main-discovery-response-from-hardcoded-sentence-template")
    && agentComposes.includes("user-facing-response")
    && normalizeString(intakeBoundary.rule).includes("not the agent brain")
    && normalizeArray(normalized.chain).join(" -> ") === "project-discovery-agent -> product-skeleton-agent -> build-loop-agent";

  return {
    isValid,
    missingAgentKeys,
    missingDecisionOwners,
    intakeEngineIsAgentBrain: !prohibitedUse.includes("agent-brain"),
    scriptedMainResponseIsAllowed: !prohibitedResponseBehavior.includes("main-discovery-response-from-hardcoded-sentence-template"),
    chain: normalizeArray(normalized.chain),
  };
}
