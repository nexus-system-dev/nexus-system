function normalizeString(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

const DEFAULT_REAL_AGENT_LAYER = {
  contractId: "nexus-real-agent-layer:v1",
  chain: [
    "project-discovery-agent",
    "product-skeleton-agent",
    "build-loop-agent",
  ],
  agents: {
    projectDiscoveryAgent: {
      agentId: "project-discovery-agent",
      role: "Understand a free-form product idea and produce canonical project understanding.",
      decides: [
        "what-to-ask-next",
        "whether-enough-product-truth-exists",
        "whether-to-handoff-to-product-skeleton-agent",
      ],
    },
    productSkeletonAgent: {
      agentId: "product-skeleton-agent",
      role: "Turn project understanding into the first canonical product skeleton.",
      decides: [
        "first-workflow",
        "main-surface-candidate",
        "first-artifact-expectation",
      ],
    },
    buildLoopAgent: {
      agentId: "build-loop-agent",
      role: "Turn the product skeleton into the first build slice and Nexus Loop handoff.",
      decides: [
        "first-task",
        "build-surface-entry",
        "next-loop-context",
      ],
    },
  },
  intakeBoundary: {
    allowedUse: ["persistence", "sessions", "restore", "summaries", "compatibility", "continuity-fallback"],
    prohibitedUse: ["agent-brain", "agent-decision-policy", "product-skeleton-authority", "build-loop-authority"],
    rule: "The intake engine is storage/support infrastructure. It is not the agent brain.",
  },
};

function normalizeFiles(files = []) {
  return Array.isArray(files)
    ? files.filter((file) => file && typeof file.name === "string" && file.name.trim())
    : [];
}

function includesAny(text, terms = []) {
  return terms.some((term) => text.includes(term));
}

function detectProjectClass(visionText) {
  const text = visionText.toLowerCase();

  if (includesAny(text, ["dashboard", "admin", "crm", "internal", "operations", "backoffice", "ניהול", "דשבורד"])) {
    return "כלי עבודה / דשבורד";
  }

  if (includesAny(text, ["mobile", "ios", "android", "app", "אפליקציה", "מובייל"])) {
    return "אפליקציה";
  }

  if (includesAny(text, ["landing", "website", "site", "אתר", "דף נחיתה", "שיווק"])) {
    return "אתר / דף כניסה";
  }

  if (includesAny(text, ["marketplace", "store", "checkout", "commerce", "חנות", "מרקטפלייס", "תשלום"])) {
    return "מסחר / מרקטפלייס";
  }

  if (includesAny(text, ["ai", "agent", "assistant", "סוכן", "בינה", "צ׳אט", "chat"])) {
    return "מוצר AI";
  }

  return visionText ? "כיוון מוצרי ראשוני" : "עדיין לא זוהה";
}

function buildUnderstoodItems({ projectName, visionText, selectedFiles, projectClassLabel }) {
  const items = [];

  if (projectName) {
    items.push(`שם העבודה כרגע: ${projectName}`);
  }

  if (visionText) {
    items.push(`כיוון ראשוני: ${visionText.length > 96 ? `${visionText.slice(0, 93)}...` : visionText}`);
  }

  if (projectClassLabel !== "עדיין לא זוהה") {
    items.push(`סוג מוצר משוער: ${projectClassLabel}`);
  }

  if (selectedFiles.length > 0) {
    items.push(`${selectedFiles.length} קבצים ייכנסו כהקשר לשיחה`);
  }

  return items.length > 0 ? items : ["עוד לא נאמר מספיק כדי לבנות אמת מוצרית."];
}

function buildMissingItems(visionText) {
  if (!visionText) {
    return ["מה המוצר אמור לעשות", "מי המשתמש המרכזי", "מה תהיה המשימה הראשונה שנבנה"];
  }

  const text = visionText.toLowerCase();
  const missing = [];

  if (!includesAny(text, ["for ", "users", "customers", "teams", "founders", "owner", "operator", "משתמש", "לקוחות", "צוות", "מנהלים", "יוצרים", "בעל עסק", "בעלי עסק", "איש מכירות", "עובד", "מנהל"])) {
    missing.push("מי המשתמש המרכזי");
  }

  if (!includesAny(text, ["problem", "pain", "solve", "because", "lost", "miss", "כאב", "בעיה", "לפתור", "כדי", "שלא", "מאבד", "מאבדים", "איבוד", "נופל", "נופלים", "מפספס", "מפספסים"])) {
    missing.push("איזה כאב אמיתי זה פותר");
  }

  if (!includesAny(text, ["flow", "workflow", "screen", "dashboard", "onboarding", "list", "status", "reminder", "next step", "תהליך", "זרימה", "מסך", "דשבורד", "רשימה", "רשימת", "סטטוס", "תזכורת", "תזכורות", "צעד הבא", "בעלים"])) {
    missing.push("איזה flow ראשון מוכיח שהרעיון עובד");
  }

  return missing.length > 0 ? missing : ["אין חוסר קריטי לפני שלד ראשון."];
}

function buildDetectedGaps(visionText) {
  const text = visionText.toLowerCase();
  const gaps = [];

  if (!visionText) {
    gaps.push("צריך משפט פתיחה חופשי כדי להתחיל לזהות כיוון.");
  }

  if (visionText && visionText.length < 36) {
    gaps.push("הכיוון קצר מדי, אז Nexus לא תעמיד פנים שיש כבר הבנת מוצר יציבה.");
  }

  if (includesAny(text, ["גם", "and"]) && includesAny(text, ["אבל", "but", "לעומת"])) {
    gaps.push("יש כנראה מתח בין שני כיוונים שצריך ליישב לפני בנייה משמעותית.");
  }

  if (includesAny(text, ["הכול", "all-in-one", "platform", "פלטפורמה"]) && visionText.length < 120) {
    gaps.push("הכיוון רחב מדי ביחס לפרטים שניתנו.");
  }

  return gaps.length > 0 ? gaps : ["לא זוהה חור קריטי בשלב הזה."];
}

function buildAgentResponsePolicy({ visionText, missingItems, projectClassLabel }) {
  const needsFollowUp = Boolean(missingItems[0] && missingItems[0] !== "אין חוסר קריטי לפני שלד ראשון.");
  const readyForSkeleton = Boolean(visionText) && !needsFollowUp;

  return {
    policyId: "project-discovery-agent-behavior-policy:v1",
    canonicalRule: "Nexus defines role and behavior; the agent composes the user-facing response from the actual conversation.",
    nexusDefines: [
      "role",
      "required-product-categories",
      "what-to-check",
      "when-to-ask-follow-up",
      "when-to-handoff",
      "handoff-proof",
    ],
    agentMustCompose: [
      "natural-language-reflection",
      "follow-up-question-wording",
      "handoff-explanation",
    ],
    requiredUnderstanding: [
      "primary-actor",
      "core-pain",
      "first-workflow",
      "intended-outcome",
      "open-unknowns",
    ],
    prohibited: [
      "main-discovery-response-from-hardcoded-sentence-template",
      "scripted-copy-pretending-to-understand",
      "system-status-message-as-agent-answer",
    ],
    fallbackCopyScope: "error-or-provider-unavailable-only",
    nextAction: readyForSkeleton ? "handoff-to-product-skeleton-agent" : "continue-discovery",
    mustAsk: needsFollowUp ? missingItems[0] : null,
    projectClassLabel,
  };
}

function buildFirstTaskCandidate({ visionText, missingItems, projectClassLabel }) {
  const ready = Boolean(visionText) && missingItems[0] === "אין חוסר קריטי לפני שלד ראשון.";

  return {
    readiness: ready ? "ready" : "needs-discovery",
    title: ready ? "לבנות שלד ראשון חי" : "לסגור הבנת פרויקט ראשונית",
    description: ready
      ? `להפוך את כיוון ה־${projectClassLabel} למשטח ראשון שאפשר לראות, לבדוק, ולשנות בשיחה.`
      : "להשלים את השאלה החסרה החשובה ביותר לפני יצירת שלד ראשון.",
  };
}

function normalizeTranscriptEntry(entry = {}, index = 0) {
  const speaker = entry.speaker === "user" ? "user" : "agent";
  const text = normalizeString(entry.text);
  if (!text) {
    return null;
  }

  return {
    id: normalizeString(entry.id, `discovery-turn-${index + 1}`),
    speaker,
    text,
    label: speaker === "user" ? "אתה" : "Nexus",
    responseSource: normalizeString(entry.responseSource),
    providerId: normalizeString(entry.providerId),
  };
}

function resolveConversationTranscript({ conversation = null, visionText = "" } = {}) {
  const entries = Array.isArray(conversation?.transcript)
    ? conversation.transcript.map(normalizeTranscriptEntry).filter(Boolean)
    : [];
  const hasInitialUserIdea = entries.some((entry) => entry.speaker === "user" && entry.text === visionText);

  if (entries.length > 0) {
    if (visionText && !hasInitialUserIdea) {
      return [
        {
          id: "user-initial-idea",
          speaker: "user",
          label: "אתה",
          text: visionText,
        },
        ...entries,
      ];
    }
    return entries;
  }

  const transcript = [];
  if (visionText) {
    transcript.push({
      id: "user-initial-idea",
      speaker: "user",
      label: "אתה",
      text: visionText,
    });
  }
  return transcript;
}

function resolveLatestAgentTranscriptMessage(transcript = []) {
  return [...transcript].reverse().find((entry) => (
    entry.speaker === "agent"
    && normalizeString(entry.text)
    && normalizeString(entry.responseSource) === "agent-envelope"
  ))?.text ?? "";
}

function hasAgentComposedTranscriptMessage(transcript = []) {
  return transcript.some((entry) => (
    entry.speaker === "agent"
    && normalizeString(entry.text)
    && normalizeString(entry.responseSource) === "agent-envelope"
  ));
}

function resolveConversationSummaryItems(summaryItems = []) {
  return Array.isArray(summaryItems)
    ? summaryItems.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim())
    : [];
}

function resolveConversationProductTruthText({ visionText = "", conversation = null } = {}) {
  const answers = normalizeObject(conversation?.answers);
  const transcriptText = normalizeArray(conversation?.transcript)
    .filter((entry) => normalizeObject(entry).speaker === "user")
    .map((entry) => normalizeString(entry.text))
    .filter(Boolean);
  const understoodText = resolveConversationSummaryItems(conversation?.summary?.understoodItems);
  return [
    visionText,
    answers["core-idea"],
    answers["target-audience"],
    answers["core-problem"],
    answers["workflow-detail"],
    answers["build-direction"],
    ...transcriptText,
    ...understoodText,
  ]
    .map((entry) => normalizeString(entry))
    .filter(Boolean)
    .join("\n");
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function hasAgentEnvelopeConversation(conversation = null) {
  const normalizedConversation = normalizeObject(conversation);
  return Boolean(
    normalizeArray(normalizedConversation.transcript).some((entry) => (
      normalizeObject(entry).speaker !== "user"
      && normalizeString(normalizeObject(entry).text)
      && normalizeString(normalizeObject(entry).responseSource) === "agent-envelope"
    ))
    || Object.keys(normalizeObject(normalizedConversation.understanding)).length > 0
    || Object.keys(normalizeObject(normalizedConversation.summarySnapshot)).length > 0
    || Object.keys(normalizeObject(normalizedConversation.lastAgentDecision)).length > 0
  );
}

function flattenUnderstandingItems(understanding = null) {
  const normalizedUnderstanding = normalizeObject(understanding);
  return Object.entries(normalizedUnderstanding)
    .flatMap(([slot, values]) => normalizeArray(values).map((entry) => ({
      slot,
      value: normalizeString(normalizeObject(entry).value),
    })))
    .filter((entry) => entry.value);
}

function resolveAgentTruthText({ conversation = null, visionText = "" } = {}) {
  const normalizedConversation = normalizeObject(conversation);
  const summarySnapshot = normalizeObject(normalizedConversation.summarySnapshot);
  const summaryItems = resolveConversationSummaryItems(summarySnapshot.understoodItems);
  const understandingItems = flattenUnderstandingItems(normalizedConversation.understanding)
    .map((entry) => entry.value);
  const userTranscriptText = normalizeArray(normalizedConversation.transcript)
    .filter((entry) => normalizeObject(entry).speaker === "user")
    .map((entry) => normalizeString(normalizeObject(entry).text))
    .filter(Boolean);
  return [
    visionText,
    ...summaryItems,
    ...understandingItems,
    ...userTranscriptText,
  ]
    .map((entry) => normalizeString(entry))
    .filter(Boolean)
    .join("\n");
}

function resolveMergedMissingItems({ localMissingItems = [], conversation = null } = {}) {
  if (hasAgentEnvelopeConversation(conversation)) {
    const snapshotMissing = resolveConversationSummaryItems(conversation?.summarySnapshot?.missingItems);
    return snapshotMissing.length > 0 ? snapshotMissing : localMissingItems;
  }
  const summaryMissing = resolveConversationSummaryItems(conversation?.summary?.missingItems);
  const localSaysReady = localMissingItems.length === 1 && localMissingItems[0] === "אין חוסר קריטי לפני שלד ראשון.";
  if (localSaysReady) {
    return localMissingItems;
  }

  if (summaryMissing.length > 0) {
    return summaryMissing;
  }
  return localMissingItems;
}

function createAgentLayerState(agentLayer = null) {
  const source = Object.keys(normalizeObject(agentLayer)).length > 0 ? agentLayer : DEFAULT_REAL_AGENT_LAYER;
  const intakeBoundary = normalizeObject(source.intakeBoundary);
  const prohibitedUse = normalizeArray(intakeBoundary.prohibitedUse);
  const chain = normalizeArray(source.chain);

  return {
    contractId: normalizeString(source.contractId, DEFAULT_REAL_AGENT_LAYER.contractId),
    chain,
    chainLabel: chain.join(" -> "),
    agentAuthority: "nexus-owned-agent-layer",
    intakeEngineRole: "support-infrastructure-only",
    intakeEngineIsBrain: !prohibitedUse.includes("agent-brain"),
    boundaryRule: normalizeString(intakeBoundary.rule, DEFAULT_REAL_AGENT_LAYER.intakeBoundary.rule),
  };
}

export function createProjectDiscoveryAgentState({
  projectName = "",
  visionText = "",
  selectedFiles = [],
  conversation = null,
  agentLayer = null,
} = {}) {
  const agentEnvelopeConversation = hasAgentEnvelopeConversation(conversation);
  const normalizedVisionText = normalizeString(
    agentEnvelopeConversation ? visionText : (visionText || conversation?.answers?.["core-idea"]),
  );
  const productTruthText = resolveConversationProductTruthText({
    visionText: normalizedVisionText,
    conversation,
  });
  const agentTruthText = agentEnvelopeConversation
    ? resolveAgentTruthText({ conversation, visionText: normalizedVisionText })
    : productTruthText;
  const rawProjectName = normalizeString(projectName);
  const normalizedProjectName = /^my\s+saas\s+app$/i.test(rawProjectName) ? "" : rawProjectName;
  const normalizedFiles = normalizeFiles(selectedFiles);
  const summarySnapshot = normalizeObject(conversation?.summarySnapshot);
  const lastAgentDecision = normalizeObject(conversation?.lastAgentDecision);
  const lastSkeletonReady = normalizeObject(lastAgentDecision.skeletonReady);
  const projectClassLabel = normalizeString(summarySnapshot.projectType) && summarySnapshot.projectType !== "unknown"
    ? summarySnapshot.projectType
    : detectProjectClass(agentTruthText);
  const missingItems = buildMissingItems(agentTruthText);
  const mergedMissingItems = resolveMergedMissingItems({ localMissingItems: missingItems, conversation });
  const agentSaysReady = agentEnvelopeConversation
    && lastAgentDecision.nextMove === "advance-to-skeleton"
    && lastSkeletonReady.ready === true;
  const firstTaskCandidate = buildFirstTaskCandidate({
    visionText: agentTruthText,
    missingItems: agentSaysReady ? ["אין חוסר קריטי לפני שלד ראשון."] : mergedMissingItems,
    projectClassLabel,
  });
  const responsePolicy = buildAgentResponsePolicy({
    visionText: agentTruthText,
    missingItems: mergedMissingItems,
    projectClassLabel,
  });
  const transcript = resolveConversationTranscript({
    conversation,
    visionText: normalizedVisionText,
  });
  const currentAgentMessage = resolveLatestAgentTranscriptMessage(transcript);
  const agentResponseSource = hasAgentComposedTranscriptMessage(transcript) ? "agent-composed-transcript" : "no-agent-response";
  const productTruthReady = agentEnvelopeConversation ? agentSaysReady : firstTaskCandidate.readiness === "ready";
  const agentComposedResponseReady = agentResponseSource === "agent-composed-transcript";
  const behaviorPolicyBlocked = productTruthReady && !agentComposedResponseReady;
  const visibleMissingItems = behaviorPolicyBlocked
    ? ["Nexus צריך לענות דרך סוכן חי שמנסח מתוך השיחה לפני פתיחת שלד ראשון."]
    : mergedMissingItems;
  const effectiveFirstTaskCandidate = behaviorPolicyBlocked
    ? {
        readiness: "needs-agent-response",
        title: "להשלים תשובת סוכן אמיתית",
        description: "יש מספיק אמת מוצרית, אבל אסור לפתוח שלד ראשון לפני שתשובת הסוכן מנוסחת מתוך השיחה ולא מתבנית.",
      }
    : firstTaskCandidate;
  const hasConversation = transcript.some((entry) => entry.speaker === "user");
  const agentLayerState = createAgentLayerState(agentLayer);
  const handoffAllowed = productTruthReady && !behaviorPolicyBlocked && agentLayerState.intakeEngineIsBrain === false;
  const enoughTruthGateStatus = handoffAllowed
    ? "ready-for-build"
    : behaviorPolicyBlocked
      ? "blocked-awaiting-agent-response"
      : "needs-discovery";
  const enoughTruthGateReason = handoffAllowed
    ? "Project Discovery Agent supplied enough product truth and an agent-authored handoff."
    : behaviorPolicyBlocked
      ? "Product truth is strong, but the visible answer must come from an agent-composed transcript before build."
      : "The product idea still needs discovery before a first skeleton can open.";
  const canAskBlockingQuestion = Boolean(normalizedVisionText || hasConversation) && !handoffAllowed;
  const blockingQuestion = canAskBlockingQuestion
    ? normalizeString(
        lastAgentDecision.nextMove === "ask" && typeof lastAgentDecision.nextQuestion === "string"
          ? lastAgentDecision.nextQuestion
          : responsePolicy.mustAsk,
      )
    : "";
  const askPolicyOutcome = handoffAllowed
    ? "advance-without-extra-question"
    : blockingQuestion
      ? "ask-one-blocking-question"
      : "stop-without-fake-skeleton";

  return {
    agentName: "Project Discovery Agent",
    roleTitle: "סוכן גילוי הפרויקט",
    modeLabel: "שיחה חופשית שמובילה למשימה ראשונה",
    roleLine: "Nexus מבין את הרעיון, מזהה חורים, שואל רק כשצריך, ושומר הבנת פרויקט קנונית.",
    currentAgentMessage,
    agentResponseSource,
    responsePolicy,
    transcript,
    isConversational: true,
    turnCount: transcript.length,
    understoodItems: buildUnderstoodItems({
      projectName: normalizedProjectName,
      visionText: normalizedVisionText,
      selectedFiles: normalizedFiles,
      projectClassLabel,
    }),
    missingItems: visibleMissingItems,
    detectedGaps: buildDetectedGaps(normalizedVisionText),
    boundaries: [
      "לא מתחילים לבנות לפני שיש מספיק אמת מוצרית",
      "לא מציפים שאלות; שואלים את הדבר הבא שבאמת משנה",
      "לא מוחקים את מנוע ה־intake הישן לפני שהסוכן מכסה שמירה, המשכיות ומסירה ללופ",
    ],
    canonicalUnderstanding: {
      statusLabel: normalizedVisionText ? "הבנה ראשונית נבנית" : "מחכה לרעיון ראשון",
      projectClassLabel,
      confidenceLabel: behaviorPolicyBlocked
        ? "מחכה לתשובת סוכן חיה"
        : productTruthReady ? "מספיק לשלד ראשון" : "צריך עוד גילוי קצר",
      handoffStatus: behaviorPolicyBlocked
        ? "needs-agent-composed-response"
        : productTruthReady ? "ready-for-first-task" : "needs-discovery",
      conversationStatus: hasConversation ? "multi-turn-ready" : "waiting-for-first-message",
      agentLayerContractId: agentLayerState.contractId,
    },
    agentLayer: agentLayerState,
    nextAgentHandoff: {
      currentAgent: "project-discovery-agent",
      nextAgent: handoffAllowed ? "product-skeleton-agent" : null,
      handoffAllowed,
      proofRequired: [
        "understanding-summary",
        "why-progress-is-allowed",
        "remaining-open-items",
        "next-agent-responsibility",
      ],
    },
    enoughTruthGate: {
      taskId: "SLICE-003",
      gate: "enough-truth-before-build",
      status: enoughTruthGateStatus,
      buildAllowed: handoffAllowed,
      reason: enoughTruthGateReason,
      authority: "project-discovery-agent-decision",
      preservedEngine: "onboarding-intake-engine",
      proofBoundary: "agent-decision-only-not-skeleton-generation",
      requiredSignals: [
        "active discovery session",
        "agent-composed transcript response",
        "canonical understanding ready-for-first-task",
        "handoff allowed to product-skeleton-agent",
        "hidden intake engine is not the agent brain",
      ],
    },
    askPolicy: {
      taskId: "SLICE-004",
      policy: "ask-only-if-needed",
      outcome: askPolicyOutcome,
      questionCount: blockingQuestion ? 1 : 0,
      blockingQuestion: blockingQuestion || null,
      authority: "project-discovery-agent-decision",
      preservedEngine: "onboarding-intake-engine",
      proofBoundary: "interaction-policy-only-not-skeleton-generation",
      rules: [
        "ask only when a blocking product-truth gap exists",
        "ask exactly one visible question",
        "advance without extra questions when enough truth exists",
        "stop without fake skeleton when a safe question is not available",
      ],
    },
    firstTaskCandidate: effectiveFirstTaskCandidate,
    behaviorPolicyGate: {
      status: behaviorPolicyBlocked ? "blocked" : "clear",
      requiresAgentComposedResponse: true,
      agentResponseSource,
    },
    hiddenEngine: {
      preserved: true,
      name: "onboarding/intake engine",
      uses: ["sessions", "summaries", "restore", "loop handoff"],
      role: agentLayerState.intakeEngineRole,
      isAgentBrain: agentLayerState.intakeEngineIsBrain,
    },
  };
}
