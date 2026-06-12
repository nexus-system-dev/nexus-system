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
    "social-campaign-execution-agent": "לעבור לביצוע קמפיין חברתי",
  };
  return labels[agent] ?? agent;
}

function summarizeGrowthMeasurementForSurface(value) {
  const measurement = normalizeObject(value);
  return {
    taskId: normalizeString(measurement.taskId, "GROW-MEASURE-001"),
    status: normalizeString(measurement.status, "measurement-not-available-yet"),
    recordCount: Number.isFinite(measurement.recordCount) ? measurement.recordCount : normalizeArray(measurement.records).length,
    acceptedCount: Number.isFinite(measurement.acceptedCount)
      ? measurement.acceptedCount
      : normalizeArray(measurement.records).filter((record) => record?.status === "accepted").length,
    measurementAvailability: normalizeString(
      measurement.measurementAvailability,
      measurement.externalActionGate?.measurementAvailability ?? "measurement-not-available-yet",
    ),
    noSuccessInference: measurement.noSuccessInference ?? measurement.externalActionGate?.noSuccessInference ?? true,
    confidenceLevel: normalizeString(measurement.confidenceLevel, measurement.learningSummary?.confidenceLevel ?? "low"),
    conclusionLanguage: normalizeString(measurement.conclusionLanguage, measurement.learningSummary?.conclusionLanguage ?? "initial-signal"),
    hypothesis: normalizeString(measurement.hypothesis, measurement.learningSummary?.hypothesis ?? "נדרשת מדידה ממקור ברור לפני מסקנה."),
    result: normalizeString(measurement.result, measurement.learningSummary?.result ?? "measurement not available yet"),
    insight: normalizeString(measurement.insight, measurement.learningSummary?.insight ?? "אין להסיק הצלחה בלי מקור מדידה."),
    sourceTypes: normalizeArray(measurement.sourceTypes)
      .concat(normalizeArray(measurement.records).map((record) => normalizeString(record?.sourceType)))
      .filter(Boolean),
    shareDemoVisibility: normalizeString(measurement.shareDemoVisibility, "internal-only"),
    nextGrowthActionOwner: normalizeString(measurement.nextGrowthActionOwner, measurement.handoffs?.nextGrowthActionOwner ?? "growth-agent"),
    productChangeOwner: normalizeString(measurement.productChangeOwner, measurement.handoffs?.productChangeOwner ?? "mutation-change-agent"),
    productChangeAllowedHere: measurement.productChangeAllowedHere === true || measurement.handoffs?.productChangeAllowedHere === true,
  };
}

function summarizeGrowthAgentForSurface(value) {
  const agent = normalizeObject(value);
  const readiness = normalizeObject(agent.readiness);
  const campaignExecution = normalizeObject(agent.campaignExecution);
  const visibleBoundary = normalizeObject(agent.visibleBoundary);
  const pluginLayer = normalizeObject(agent.growthPluginLayer);
  const primaryPlugin = normalizeObject(pluginLayer.primaryPlugin);
  const pluginReadiness = normalizeObject(pluginLayer.readiness);
  const pluginRegistry = normalizeObject(pluginLayer.registry);

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
    socialCampaignExecutionAgent: normalizeObject(agent.socialCampaignExecutionAgent),
    seoActionPath: normalizeObject(agent.seoActionPath),
    semActionPath: normalizeObject(agent.semActionPath),
    emailActionPath: normalizeObject(agent.emailActionPath),
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
        firstReleaseRegistered: primaryPlugin.firstReleaseRegistered === true,
        registryTaskId: normalizeString(primaryPlugin.registryTaskId, primaryPlugin.firstReleaseRegistered === true ? "GROW-PLUG-002" : ""),
        registryCapability: normalizeString(primaryPlugin.registryCapability),
      },
      registry: {
        taskId: normalizeString(pluginRegistry.taskId, "GROW-PLUG-002"),
        registryId: normalizeString(pluginRegistry.registryId, "first-release-growth-plugin-registry:v1"),
        status: normalizeString(pluginRegistry.status, "ready"),
        userFacingMode: normalizeString(pluginRegistry.userFacingMode, "simple-intents-not-marketplace"),
        marketplaceMode: pluginRegistry.marketplaceMode === true,
        plugins: normalizeArray(pluginRegistry.plugins)
          .map((item) => normalizeObject(item))
          .map((item) => ({
            pluginId: normalizeString(item.pluginId),
            taskId: normalizeString(item.taskId),
            userIntentLabel: normalizeString(item.userIntentLabel),
            status: normalizeString(item.status),
            draftOnlyByDefault: item.draftOnlyByDefault !== false,
            providerRequiredForExternalAction: item.providerRequiredForExternalAction === true,
            approvalRequiredForExternalAction: item.approvalRequiredForExternalAction === true,
          }))
          .filter((item) => item.pluginId),
        boundaries: normalizeObject(pluginRegistry.boundaries),
      },
      registrySelection: normalizeObject(pluginLayer.registrySelection),
      alternatives: normalizeArray(pluginLayer.alternatives)
        .map((item) => normalizeObject(item))
        .map((item) => ({
          label: normalizeString(item.label),
          tradeoff: normalizeString(item.tradeoff),
        }))
        .filter((item) => item.label),
    },
    growthMeasurementTruth: summarizeGrowthMeasurementForSurface(agent.growthMeasurementTruth),
  };
}

function summarizeSocialCampaignForSurface(value) {
  const campaign = normalizeObject(value);
  const permissions = normalizeObject(campaign.permissions);
  const approval = normalizeObject(campaign.approval);
  const fallback = normalizeObject(campaign.fallback);
  const resultIntake = normalizeObject(campaign.resultIntake);
  const commentsSummary = normalizeObject(resultIntake.commentsSummary);
  return {
    taskId: normalizeString(campaign.taskId, "GROW-AGT-002"),
    agentId: normalizeString(campaign.agentId, "social-campaign-execution-agent"),
    status: normalizeString(campaign.status, "not-created"),
    campaignType: normalizeString(campaign.campaignType, "learning-experiment"),
    selectedProvider: normalizeString(campaign.selectedProvider, "instagram"),
    requestedAction: normalizeString(campaign.requestedAction, "draft"),
    sequenceCount: normalizeArray(campaign.sequence).length,
    firstReleaseRealProviders: normalizeArray(permissions.firstReleaseRealProviders).map((item) => normalizeString(item)).filter(Boolean),
    draftOnlyProviders: normalizeArray(permissions.draftOnlyProviders).map((item) => normalizeString(item)).filter(Boolean),
    providerConnected: permissions.providerConnected === true,
    account: normalizeString(permissions.account),
    scopes: normalizeArray(permissions.scopes).map((item) => normalizeString(item)).filter(Boolean),
    perPostApprovalRequired: approval.perPostApprovalRequired !== false,
    campaignApprovalCannotPublishPosts: approval.campaignApprovalCannotPublishPosts !== false,
    manualCopyAvailable: fallback.manualCopyAvailable !== false,
    draftOnlyBecauseProviderMissing: fallback.draftOnlyBecauseProviderMissing === true,
    missingAsset: normalizeString(fallback.missingAsset),
    blockedActions: normalizeArray(campaign.blockedActions).map((item) => normalizeString(item)).filter(Boolean),
    requiresAgent: normalizeString(campaign.requiresAgent, "none"),
    externalExecutionPerformed: campaign.externalExecutionPerformed === true,
    fabricatedMetricsBlocked: resultIntake.fabricatedMetricsBlocked !== false,
    commentsSummary: {
      available: commentsSummary.available === true,
      summary: normalizeString(commentsSummary.summary, "אין תגובות אמיתיות זמינות לקריאה."),
      sensitiveExamplesHidden: commentsSummary.sensitiveExamplesHidden !== false,
    },
    userMessage: normalizeString(campaign.userMessage, "קמפיין חברתי עדיין לא נוצר."),
    historyCount: normalizeArray(campaign.history).length,
  };
}

function summarizeSeoActionForSurface(value) {
  const seo = normalizeObject(value);
  const recommendations = normalizeObject(seo.recommendations);
  const productBasis = normalizeObject(seo.productBasis);
  const approval = normalizeObject(seo.approval);
  const handoffs = normalizeObject(seo.handoffs);
  const providerTruth = normalizeObject(seo.providerTruth);
  return {
    taskId: normalizeString(seo.taskId, "GROW-SEO-001"),
    agentId: normalizeString(seo.agentId, "seo-action-path"),
    status: normalizeString(seo.status, "not-created"),
    requestedAction: normalizeString(seo.requestedAction, "draft"),
    language: normalizeString(productBasis.language, "he"),
    direction: normalizeString(productBasis.direction, "rtl"),
    title: normalizeString(recommendations.title),
    metaDescription: normalizeString(recommendations.metaDescription),
    headings: normalizeArray(recommendations.headings).map((item) => normalizeString(item)).filter(Boolean),
    faq: normalizeArray(recommendations.faq).map((item) => normalizeObject(item)),
    keywordHypotheses: normalizeArray(recommendations.keywordHypotheses).map((item) => normalizeString(item)).filter(Boolean),
    approvalRequiredBeforeApply: approval.approvalRequiredBeforeApply !== false,
    applyApproved: approval.applyApproved === true,
    mutationRequired: handoffs.mutationRequired === true,
    visualBuildRequired: handoffs.visualBuildRequired === true,
    shareOrReleaseRequiredForPublicVisibility: handoffs.shareOrReleaseRequiredForPublicVisibility !== false,
    searchConsoleConnected: providerTruth.searchConsoleConnected === true,
    realProviderDataAvailable: providerTruth.realProviderDataAvailable === true,
    searchVolumeIsHypothesis: providerTruth.searchVolumeIsHypothesis !== false,
    rankingsAreHypothesis: providerTruth.rankingsAreHypothesis !== false,
    analyticsConsumedFromMeasurement: providerTruth.analyticsConsumedFromMeasurement === true,
    blockedClaims: normalizeArray(seo.blockedClaims).map((item) => normalizeString(item)).filter(Boolean),
    externalPublicationPerformed: seo.externalPublicationPerformed === true,
    visiblePageUpdated: seo.visiblePageUpdated === true,
    userMessage: normalizeString(seo.userMessage, "SEO עדיין לא נוצר."),
    historyCount: normalizeArray(seo.history).length,
  };
}

function summarizeSemActionForSurface(value) {
  const sem = normalizeObject(value);
  const providerTruth = normalizeObject(sem.providerTruth);
  const approval = normalizeObject(sem.approval);
  const readiness = normalizeObject(sem.readiness);
  const handoffs = normalizeObject(sem.handoffs);
  const budget = normalizeObject(sem.budget);
  const resultTruth = normalizeObject(sem.resultTruth);
  const safeStop = normalizeObject(sem.safeStop);
  return {
    taskId: normalizeString(sem.taskId, "GROW-SEM-001"),
    agentId: normalizeString(sem.agentId, "sem-action-path"),
    status: normalizeString(sem.status, "not-created"),
    requestedAction: normalizeString(sem.requestedAction, "draft"),
    selectedProvider: normalizeString(providerTruth.selectedProvider, "google-ads"),
    providerConnected: providerTruth.providerConnected === true,
    providerSupportedForRealExecution: providerTruth.providerSupportedForRealExecution === true,
    draftOnlyProvider: providerTruth.draftOnlyProvider === true,
    hasAdDraftScope: providerTruth.hasAdDraftScope === true,
    hasSpendPermissionScope: providerTruth.hasSpendPermissionScope === true,
    providerConnectionIsNotSpendPermission: providerTruth.providerConnectionIsNotSpendPermission !== false,
    firstReleaseRealProviders: normalizeArray(providerTruth.firstReleaseRealProviders).map((item) => normalizeString(item)).filter(Boolean),
    draftOnlyProviders: normalizeArray(providerTruth.draftOnlyProviders).map((item) => normalizeString(item)).filter(Boolean),
    campaignApproved: approval.campaignApproved === true,
    adApproved: approval.adApproved === true,
    budgetApproved: approval.budgetApproved === true,
    budgetChangeApproved: approval.budgetChangeApproved === true,
    activationApproved: approval.activationApproved === true,
    separateApprovalRequired: approval.separateApprovalRequired !== false,
    productReady: readiness.productReady === true,
    landingOrDemoReady: readiness.landingOrDemoReady === true,
    measurementPlanReady: readiness.measurementPlanReady === true,
    canPrepareActivation: readiness.canPrepareActivation === true,
    budgetCurrency: normalizeString(budget.currency, "USD"),
    suggestedBudget: Number.isFinite(Number(budget.suggestedAmount)) ? Number(budget.suggestedAmount) : 50,
    hardCapUsd: Number.isFinite(Number(budget.hardCapUsd)) ? Number(budget.hardCapUsd) : 50,
    budgetCapEnforced: budget.capEnforced !== false,
    activationPrepared: sem.activationPrepared === true,
    externalSpendPerformed: sem.externalSpendPerformed === true,
    safeStopAllowed: safeStop.allowedWithoutChangingAdsOrBudget !== false,
    safeStopStopped: safeStop.stopped === true,
    safeStopAdsModified: safeStop.adsModified === true,
    safeStopBudgetModified: safeStop.budgetModified === true,
    visualBuildRequiredForLandingChanges: handoffs.visualBuildRequiredForLandingChanges !== false,
    mutationRequiredForMessageChanges: handoffs.mutationRequiredForMessageChanges !== false,
    measurementOwner: normalizeString(handoffs.measurementOwner, "GROW-MEASURE-001"),
    paidSocialRoutedToSem: handoffs.paidSocialRoutedToSem === true,
    providerResultsAvailable: resultTruth.providerResultsAvailable === true,
    fabricatedResultsBlocked: resultTruth.fabricatedResultsBlocked !== false,
    forbiddenPromises: normalizeArray(sem.forbiddenPromises).map((item) => normalizeString(item)).filter(Boolean),
    userMessage: normalizeString(sem.userMessage, "SEM עדיין לא נוצר."),
    historyCount: normalizeArray(sem.history).length,
  };
}

function summarizeEmailActionForSurface(value) {
  const email = normalizeObject(value);
  const providerTruth = normalizeObject(email.providerTruth);
  const audienceTruth = normalizeObject(email.audienceTruth);
  const approval = normalizeObject(email.approval);
  const sendTruth = normalizeObject(email.sendTruth);
  const resultTruth = normalizeObject(email.resultTruth);
  const draft = normalizeObject(email.draft);
  return {
    taskId: normalizeString(email.taskId, "GROW-EMAIL-001"),
    agentId: normalizeString(email.agentId, "email-action-path"),
    status: normalizeString(email.status, "not-created"),
    requestedAction: normalizeString(email.requestedAction, "draft"),
    selectedProvider: normalizeString(providerTruth.selectedProvider, "mailchimp"),
    providerConnected: providerTruth.providerConnected === true,
    providerSupportedForRealSend: providerTruth.providerSupportedForRealSend === true,
    gmailLimited: providerTruth.gmailLimited === true,
    optionalProvider: providerTruth.optionalProvider === true,
    hasEmailDraftScope: providerTruth.hasEmailDraftScope === true,
    hasTestSendScope: providerTruth.hasTestSendScope === true,
    hasSendScope: providerTruth.hasSendScope === true,
    providerConnectionIsNotSendPermission: providerTruth.providerConnectionIsNotSendPermission !== false,
    preferredProviders: normalizeArray(providerTruth.preferredProviders).map((item) => normalizeString(item)).filter(Boolean),
    limitedProviders: normalizeArray(providerTruth.limitedProviders).map((item) => normalizeString(item)).filter(Boolean),
    optionalProviders: normalizeArray(providerTruth.optionalProviders).map((item) => normalizeString(item)).filter(Boolean),
    audienceSourceConfirmed: audienceTruth.audienceSourceConfirmed === true,
    lawfulBasisConfirmed: audienceTruth.lawfulBasisConfirmed === true,
    coldListRejected: audienceTruth.coldListRejected === true,
    cleanedCount: Number.isFinite(Number(audienceTruth.cleanedCount)) ? Number(audienceTruth.cleanedCount) : 0,
    duplicateCount: Number.isFinite(Number(audienceTruth.duplicateCount)) ? Number(audienceTruth.duplicateCount) : 0,
    invalidCount: Number.isFinite(Number(audienceTruth.invalidCount)) ? Number(audienceTruth.invalidCount) : 0,
    fieldsSeparated: audienceTruth.fieldsSeparated !== false,
    campaignApproved: approval.campaignApproved === true,
    contentApproved: approval.contentApproved === true,
    audienceSourceApproved: approval.audienceSourceApproved === true,
    testSendApproved: approval.testSendApproved === true,
    sendApproved: approval.sendApproved === true,
    campaignApprovalDoesNotSendSequence: approval.campaignApprovalDoesNotSendSequence !== false,
    perEmailApprovalRequired: approval.perEmailApprovalRequired !== false,
    draftOnlyByDefault: sendTruth.draftOnlyByDefault !== false,
    fullAudienceSendDefault: sendTruth.fullAudienceSendDefault === true,
    testSendPrepared: sendTruth.testSendPrepared === true,
    oneEmailSendPrepared: sendTruth.oneEmailSendPrepared === true,
    sequenceDraftPrepared: sendTruth.sequenceDraftPrepared === true,
    sequenceSendReadyCount: Number.isFinite(Number(sendTruth.sequenceSendReadyCount)) ? Number(sendTruth.sequenceSendReadyCount) : 0,
    externalSendPerformed: sendTruth.externalSendPerformed === true,
    providerResultsAvailable: resultTruth.providerResultsAvailable === true,
    fabricatedResultsBlocked: resultTruth.fabricatedResultsBlocked !== false,
    metricsFabricated: resultTruth.metricsFabricated === true,
    measurementOwner: normalizeString(resultTruth.measurementOwner, "GROW-MEASURE-001"),
    subjectVariants: normalizeArray(draft.sequence?.[0]?.subjectVariants).map((item) => normalizeString(item)).filter(Boolean).slice(0, 2),
    bodyVariants: normalizeArray(draft.sequence?.[0]?.bodyVariants).map((item) => normalizeString(item)).filter(Boolean).slice(0, 2),
    forbiddenPromises: normalizeArray(email.forbiddenPromises).map((item) => normalizeString(item)).filter(Boolean),
    userMessage: normalizeString(email.userMessage, "מסלול אימייל עדיין לא נוצר."),
    historyCount: normalizeArray(email.history).length,
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
  const socialCampaign = summarizeSocialCampaignForSurface(
    safeProject.socialCampaignExecutionAgent
      ?? safeProject.context?.socialCampaignExecutionAgent
      ?? state.socialCampaignExecutionAgent
      ?? growthAgent.socialCampaignExecutionAgent,
  );
  const seoAction = summarizeSeoActionForSurface(
    safeProject.seoActionPath
      ?? safeProject.context?.seoActionPath
      ?? state.seoActionPath
      ?? growthAgent.seoActionPath,
  );
  const semAction = summarizeSemActionForSurface(
    safeProject.semActionPath
      ?? safeProject.context?.semActionPath
      ?? state.semActionPath
      ?? growthAgent.semActionPath,
  );
  const emailAction = summarizeEmailActionForSurface(
    safeProject.emailActionPath
      ?? safeProject.context?.emailActionPath
      ?? state.emailActionPath
      ?? growthAgent.emailActionPath,
  );
  const growthMeasurement = summarizeGrowthMeasurementForSurface(
    safeProject.growthMeasurementTruth
      ?? safeProject.context?.growthMeasurementTruth
      ?? state.growthMeasurementTruth
      ?? growthAgent.growthMeasurementTruth,
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
      measurement: growthMeasurement,
      socialCampaign,
      seoAction,
      semAction,
      emailAction,
    },
  };
}
