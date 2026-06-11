function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function firstNonEmpty(...values) {
  return values.map((value) => normalizeString(value)).find(Boolean) ?? "";
}

function labelStatus(value) {
  const status = normalizeString(value, "needs-product-first");
  const labels = {
    recommended: "הומלץ צעד קטן",
    selected: "נבחר צעד קטן",
    "needs-product-first": "צריך תוצר לפני צמיחה",
    "needs-approval": "מחכה לאישור",
    "needs-provider": "דורש ספק מחובר",
    "handoff-required": "דורש מעבר לסוכן מתאים",
    "failed-safely": "נעצר בבטחה",
  };
  return labels[status] ?? status;
}

function labelOpportunity(value) {
  const type = normalizeString(value, "user-learning");
  const labels = {
    experiment: "ניסוי קטן",
    demo: "דמו",
    share: "שיתוף בטוח",
    "product-improvement": "שיפור מוצר",
    "audience-test": "בדיקת קהל",
    "small-release": "שחרור קטן",
    "user-learning": "למידת משתמש",
    "message-test": "בדיקת מסר",
    feedback: "איסוף משוב",
    "release-continuation": "המשך שחרור",
    "campaign-draft": "טיוטת קמפיין",
    "seo-draft": "טיוטת חיפוש",
    "paid-test-draft": "טיוטת פרסום ממומן",
    "email-draft": "טיוטת מייל",
    "landing-experiment": "ניסוי דף נחיתה",
    "measurement-plan": "מדידה מינימלית",
  };
  return labels[type] ?? type;
}

function labelAgent(value) {
  const agent = normalizeString(value, "none");
  const labels = {
    none: "לא נדרש סוכן נוסף",
    "share-demo-agent": "לעבור לסוכן שיתוף ודמו",
    "mutation-change-agent": "לעבור לסוכן שינוי מוצר",
    "release-agent": "לעבור למסלול שחרור",
    "verification-agent": "לעבור לבדיקות",
    "visual-build-agent": "לעבור לבנייה חזותית",
  };
  return labels[agent] ?? agent;
}

function summarizeGrowthAgentForSurface(value) {
  const agent = normalizeObject(value);
  const readiness = normalizeObject(agent.readiness);
  const campaignExecution = normalizeObject(agent.campaignExecution);
  const visibleBoundary = normalizeObject(agent.visibleBoundary);
  const pluginLayer = normalizeObject(agent.growthPluginLayer);
  const primaryPlugin = normalizeObject(pluginLayer.primaryPlugin);
  const pluginReadiness = normalizeObject(pluginLayer.readiness);

  return {
    taskId: normalizeString(agent.taskId, "GROW-AGT-001"),
    agentId: normalizeString(agent.agentId, "growth-agent"),
    status: normalizeString(agent.status, "needs-product-first"),
    productTruthAvailable: agent.productTruthAvailable === true,
    opportunityType: normalizeString(agent.opportunityType, "user-learning"),
    originArtifactTitle: normalizeString(agent.originArtifactTitle, "התוצר הראשון"),
    targetAudience: normalizeString(agent.targetAudience, "המשתמשים הראשונים שהמוצר אמור לשרת"),
    recommendedAction: normalizeString(agent.recommendedAction, "לסגור קודם שלד או דמו ברור שאפשר להראות למשתמש ראשון."),
    whyNow: normalizeString(agent.whyNow, "אין עדיין משהו יציב להראות, לבדוק או לשפר."),
    userMessage: normalizeString(agent.userMessage, "מוקדם מדי לתכנן צמיחה. קודם צריך תוצר ברור שאפשר להראות או לבדוק."),
    requiresAgent: normalizeString(agent.requiresAgent, "none"),
    requiresApproval: agent.requiresApproval === true,
    approvalReason: normalizeString(agent.approvalReason),
    successMetric: normalizeString(agent.successMetric, "המשתמש מבין בתוך דקה מה המוצר עושה ולמי הוא עוזר."),
    preparationNeeded: normalizeArray(agent.preparationNeeded).map((item) => normalizeString(item)).filter(Boolean),
    doNotPromise: normalizeArray(agent.doNotPromise).map((item) => normalizeString(item)).filter(Boolean),
    canRunGrowth: readiness.canRunGrowth === true,
    readinessReason: normalizeString(readiness.reason, "צריך תוצר ברור לפני צמיחה."),
    missingProductTruth: normalizeArray(readiness.missingProductTruth).map((item) => normalizeString(item)).filter(Boolean),
    campaignExecution: {
      isCampaign: campaignExecution.isCampaign === true,
      allowedNow: normalizeArray(campaignExecution.allowedNow).map((item) => normalizeString(item)).filter(Boolean),
      requiresProviderConnection: campaignExecution.requiresProviderConnection === true,
      requiresExplicitApprovalBeforeExternalAction: campaignExecution.requiresExplicitApprovalBeforeExternalAction !== false,
      forbiddenWithoutApproval: normalizeArray(campaignExecution.forbiddenWithoutApproval).map((item) => normalizeString(item)).filter(Boolean),
    },
    visibleBoundary: {
      oneNextMoveOnly: visibleBoundary.oneNextMoveOnly !== false,
      noGenericMarketing: visibleBoundary.noGenericMarketing !== false,
      noUnverifiedOutcomeClaims: visibleBoundary.noUnverifiedOutcomeClaims !== false,
      noExternalActionWithoutApproval: visibleBoundary.noExternalActionWithoutApproval !== false,
    },
    growthPluginLayer: {
      taskId: normalizeString(pluginLayer.taskId, "GROW-PLUG-001"),
      status: normalizeString(pluginLayer.status, "needs-product-first"),
      canUseGrowthPlugin: pluginReadiness.canUseGrowthPlugin === true,
      audience: normalizeString(pluginReadiness.audience, "קהל היעד עדיין לא ברור"),
      coreValue: normalizeString(pluginReadiness.coreValue, "הערך המרכזי עדיין לא חד"),
      showableArtifact: normalizeString(pluginReadiness.showableArtifact, "אין עדיין תוצר שאפשר להראות"),
      missing: normalizeArray(pluginReadiness.missing).map((item) => normalizeString(item)).filter(Boolean),
      primaryPlugin: {
        pluginId: normalizeString(primaryPlugin.pluginId, "product-readiness-blocker"),
        label: normalizeString(primaryPlugin.label, "קודם סוגרים תוצר ברור"),
        userIntentLabel: normalizeString(primaryPlugin.userIntentLabel, "סגירת אמת מוצר"),
        channelSecondaryLabel: normalizeString(primaryPlugin.channelSecondaryLabel, "אין ערוץ צמיחה"),
        status: normalizeString(primaryPlugin.status, "needs-product-first"),
        draftOnly: primaryPlugin.draftOnly !== false,
        providerRequired: primaryPlugin.providerRequired === true,
        approvalRequired: primaryPlugin.approvalRequired === true,
        handoffRequired: normalizeString(primaryPlugin.handoffRequired, "none"),
        smallSuccessMetric: normalizeString(primaryPlugin.smallSuccessMetric, "מדד הצלחה קטן עוד לא הוגדר"),
        whyThisPlugin: normalizeString(primaryPlugin.whyThisPlugin, "הצעד חייב להיות מחובר לתוצר."),
        allowedActions: normalizeArray(primaryPlugin.allowedActions).map((item) => normalizeString(item)).filter(Boolean),
        blockedActions: normalizeArray(primaryPlugin.blockedActions).map((item) => normalizeString(item)).filter(Boolean),
      },
      alternatives: normalizeArray(pluginLayer.alternatives)
        .map((item) => normalizeObject(item))
        .map((item) => ({
          label: normalizeString(item.label),
          tradeoff: normalizeString(item.tradeoff),
        }))
        .filter((item) => item.label),
    },
  };
}

function createGrowthSurfaceViewContract() {
  return {
    contractId: "SURF-005",
    surfaceId: "growth",
    purpose: "bounded-product-evolution-workspace",
    growthLaw: "product-connected-growth-insight-not-analytics-noise",
    requiredRegions: [
      "growth-readiness-gate",
      "product-connected-growth-insights",
      "bounded-opportunity-list",
      "growth-metric-baseline",
      "experiment-next-move",
      "post-release-continuity-anchor",
    ],
  };
}

function normalizeMove(move, index) {
  const normalizedMove = normalizeObject(move);
  if (typeof move === "string") {
    return {
      title: move,
      body: "הצעה שמחוברת לתוצר האחרון ולא פותחת אסטרטגיה מנותקת.",
      family: `bounded-growth-move-${index + 1}`,
    };
  }

  return {
    title: firstNonEmpty(normalizedMove.title, normalizedMove.label, normalizedMove.name, `הזדמנות ${index + 1}`),
    body: firstNonEmpty(
      normalizedMove.body,
      normalizedMove.description,
      normalizedMove.reason,
      "הצעה שמחוברת לתוצר האחרון ולא פותחת אסטרטגיה מנותקת.",
    ),
    family: firstNonEmpty(normalizedMove.family, normalizedMove.id, `bounded-growth-move-${index + 1}`),
  };
}

function buildMetrics(growthWorkspace) {
  const analytics = normalizeObject(growthWorkspace.analytics);
  const summaryCards = normalizeArray(analytics.summaryCards)
    .map((item) => normalizeObject(item))
    .map((item) => ({
      label: firstNonEmpty(item.label, item.name, "מדד"),
      value: firstNonEmpty(item.value, item.currentValue, item.status, "לא נמדד"),
    }))
    .filter((item) => item.label || item.value);

  const kpis = normalizeArray(analytics.kpis)
    .map((item) => normalizeObject(item))
    .map((item) => ({
      label: firstNonEmpty(item.label, item.name, item.metric, "מדד"),
      value: firstNonEmpty(item.value, item.currentValue, item.status, "baseline"),
    }));

  const metrics = summaryCards.length ? summaryCards : kpis;
  return metrics.length
    ? metrics.slice(0, 4)
    : [
      { label: "Baseline", value: "ממתין לתוצר" },
      { label: "Signal", value: "לא נמדד" },
      { label: "Next move", value: "bounded" },
    ];
}

function buildBoundary(safeProject, productClass, continuation) {
  const explicitBoundary = normalizeObject(
    safeProject.growthOpportunitySurfacingBoundary
      ?? normalizeObject(safeProject.state).growthOpportunitySurfacingBoundary,
  );
  if (Object.keys(explicitBoundary).length > 0) {
    return explicitBoundary;
  }

  const continuationMoves = normalizeArray(continuation.continuationMoves);
  const fallbackMoves = productClass === "mobile-app"
    ? ["clarify-first-screen", "reduce-first-decision", "stabilize-next-screen-flow"]
    : ["tighten-last-approved-surface", "clarify-next-product-action", "open-one-bounded-improvement-loop"];
  const status = continuation.status === "active" || continuation.status === "ready" ? "bounded" : "not-ready";

  return {
    status,
    statusLabel: status === "bounded" ? "הצעות ההמשך נשארות bounded" : "עוד לא אפשרי לפתוח opportunity אמיתי",
    visibleBoundaryRule: "Wave 4 may surface only meaningful next product moves, never fake autonomous company behavior.",
    allowedMoves: continuationMoves.length ? continuationMoves : fallbackMoves,
    deferredOpportunityFamilies: [
      "broad-autonomous-growth-ops",
      "portfolio-optimization",
      "self-directed-company-strategy",
    ],
    disallowedMoves: [
      "inventing company goals disconnected from the released product",
      "implying autonomous GTM ownership beyond the current product loop",
    ],
    credibilityRule: "every surfaced next move must stay directly attached to the last approved artifact",
    continuityRule: "opportunity state must survive revisit, route restore, and handoff back into execution",
  };
}

export function buildGrowthSurfaceViewModel({ project = null, qaMode = false } = {}) {
  const safeProject = normalizeObject(project);
  const state = normalizeObject(safeProject.state);
  const growthWorkspace = normalizeObject(safeProject.growthWorkspace ?? state.growthWorkspace);
  const growthAgent = summarizeGrowthAgentForSurface(
    safeProject.growthAgent
      ?? safeProject.context?.growthAgent
      ?? state.growthAgent,
  );
  const strategy = normalizeObject(growthWorkspace.strategy);
  const continuation = normalizeObject(
    safeProject.postReleaseContinuationLoop
      ?? state.postReleaseContinuationLoop
      ?? safeProject.repeatedLoopContinuation,
  );
  const productClass = firstNonEmpty(
    safeProject.artifactExpectation?.projectType,
    safeProject.projectType,
    state.projectType,
    "generic",
  );
  const boundary = buildBoundary(safeProject, productClass, continuation);
  const contract = createGrowthSurfaceViewContract();
  const allowedMoves = normalizeArray(boundary.allowedMoves)
    .map(normalizeMove)
    .slice(0, 4);
  const fallbackMoves = normalizeArray(continuation.continuationMoves)
    .map(normalizeMove)
    .slice(0, 4);
  const agentOpportunity = growthAgent.recommendedAction
    ? [{
        title: labelOpportunity(growthAgent.opportunityType),
        body: growthAgent.recommendedAction,
        family: growthAgent.opportunityType,
      }]
    : [];
  const opportunities = agentOpportunity.length ? agentOpportunity : allowedMoves.length ? allowedMoves : fallbackMoves;
  const deferred = normalizeArray(boundary.deferredOpportunityFamilies)
    .map((item) => normalizeString(item))
    .filter(Boolean)
    .slice(0, 3);
  const disallowed = normalizeArray(boundary.disallowedMoves)
    .map((item) => normalizeString(item))
    .filter(Boolean)
    .slice(0, 3);
  const readyForGrowth = boundary.status === "bounded"
    || continuation.status === "active"
    || continuation.status === "ready"
    || growthAgent.canRunGrowth === true
    || growthAgent.growthPluginLayer?.readiness?.canUseGrowthPlugin === true;

  return {
    contract,
    qaMode,
    project: {
      id: normalizeString(safeProject.id, "growth-project"),
      name: normalizeString(safeProject.name, "Nexus Growth"),
      goal: normalizeString(safeProject.goal, "Growth surface"),
      productClass,
    },
    growth: {
      readyForGrowth,
      readinessLabel: readyForGrowth ? "מוכן להצעת צמיחה מוגבלת" : "מחכה לתוצר מאושר",
      readinessBody: readyForGrowth
        ? "Nexus מציפה רק הזדמנויות שמחוברות לתוצר האחרון ולראיות שכבר קיימות."
        : "Growth לא נפתח לפני שיש תוצר, שחרור או המשך מוצרי ברור.",
      statusLabel: firstNonEmpty(boundary.statusLabel, "הצעות ההמשך נשארות bounded"),
      visibleBoundaryRule: firstNonEmpty(
        boundary.visibleBoundaryRule,
        "Growth may surface only meaningful next product moves.",
      ),
      credibilityRule: firstNonEmpty(
        boundary.credibilityRule,
        "כל הצעת צמיחה חייבת להישאר מחוברת לתוצר שאושר.",
      ),
      continuityRule: firstNonEmpty(
        boundary.continuityRule,
        continuation.continuityRule,
        "מצב הצמיחה חייב לשרוד חזרה למסך והמשך ביצוע.",
      ),
      audience: firstNonEmpty(strategy.targetAudience, safeProject.targetAudience, "המשתמש שהמוצר כבר משרת"),
      originArtifactTitle: firstNonEmpty(continuation.originArtifactTitle, safeProject.artifactTitle, "התוצר האחרון"),
      originReleaseTarget: firstNonEmpty(continuation.originReleaseTarget, "release target לא הוגדר"),
      opportunities,
      deferred,
      disallowed,
      metrics: buildMetrics(growthWorkspace),
      nextMove: opportunities[0] ?? {
        title: firstNonEmpty(continuation.nextMoveTitle, "לחזור לתוצר ולאסוף signal ראשון"),
        body: firstNonEmpty(
          continuation.nextMoveDescription,
          "לפני שפותחים צמיחה רחבה, צריך לקשור את הצעד הבא לתוצר קיים.",
        ),
        family: firstNonEmpty(continuation.nextMoveFamily, "bounded-growth-next-move"),
      },
      agent: {
        ...growthAgent,
        statusLabel: labelStatus(growthAgent.status),
        opportunityLabel: labelOpportunity(growthAgent.opportunityType),
        requiresAgentLabel: labelAgent(growthAgent.requiresAgent),
      },
    },
  };
}
