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

function createShareSurfaceViewContract() {
  return {
    contractId: "SURF-007",
    surfaceId: "share",
    purpose: "experience-oriented-review-demo-workspace",
    shareLaw: "experience-oriented-share-not-permissions-admin",
    requiredRegions: [
      "share-experience-preview",
      "share-audience-access-boundary",
      "share-review-demo-link",
      "share-copy-open-actions",
      "share-privacy-scope",
      "share-return-to-build",
    ],
  };
}

function buildEvidenceItems(releaseWorkspace, releaseable, deploymentPath) {
  const visibleChecks = normalizeArray(releaseable.visibleChecks)
    .map((item) => normalizeObject(item))
    .map((item) => firstNonEmpty(item.label, item.name, item.status))
    .filter(Boolean);
  const timelineEvents = normalizeArray(normalizeObject(releaseWorkspace.timeline).events)
    .map((item, index) => {
      const normalized = normalizeObject(item);
      return firstNonEmpty(normalized.label, normalized.eventId, `release-event-${index + 1}`);
    })
    .filter(Boolean);
  const deploymentSignals = [
    firstNonEmpty(deploymentPath.primaryTarget),
    firstNonEmpty(deploymentPath.releaseStatus),
    firstNonEmpty(deploymentPath.previewPath),
  ].filter(Boolean);

  return [...visibleChecks, ...timelineEvents, ...deploymentSignals].slice(0, 5);
}

function buildAgentEvidenceItems(agent = {}) {
  const visibility = normalizeObject(agent.visibilityBoundary);
  const includeItems = normalizeArray(visibility.include)
    .map((item) => normalizeString(item))
    .filter(Boolean);
  const excludeItems = normalizeArray(visibility.exclude)
    .map((item) => normalizeString(item))
    .filter(Boolean);
  return [
    ...includeItems.slice(0, 3),
    ...excludeItems.slice(0, 2).map((item) => `לא נחשף: ${item}`),
  ].filter(Boolean);
}

export function buildShareSurfaceViewModel({ project = null, qaMode = false } = {}) {
  const safeProject = normalizeObject(project);
  const state = normalizeObject(safeProject.state);
  const releaseWorkspace = normalizeObject(safeProject.releaseWorkspace ?? state.releaseWorkspace);
  const releaseable = normalizeObject(safeProject.releaseableProductStateContract ?? state.releaseableProductStateContract);
  const deploymentPath = normalizeObject(safeProject.classAwareDeploymentReleasePath ?? state.classAwareDeploymentReleasePath);
  const deploymentFeedback = normalizeObject(safeProject.deploymentStateFeedbackContract ?? state.deploymentStateFeedbackContract);
  const artifactExpectation = normalizeObject(safeProject.artifactExpectation ?? state.artifactExpectation);
  const proofArtifact = normalizeObject(safeProject.proofArtifact ?? state.proofArtifact);
  const companion = normalizeObject(safeProject.companionConversation ?? state.companionConversation);
  const releaseDeployment = normalizeObject(releaseWorkspace.deployment);
  const shareWorkspace = normalizeObject(safeProject.shareWorkspace ?? state.shareWorkspace);
  const shareDemoAgent = normalizeObject(safeProject.shareDemoAgent ?? state.shareDemoAgent);
  const agentVisibility = normalizeObject(shareDemoAgent.visibilityBoundary);
  const agentSummary = normalizeObject(shareDemoAgent.productSummary);
  const explicitShareLink = firstNonEmpty(
    shareDemoAgent.shareLink,
    shareDemoAgent.localReviewPath,
    shareWorkspace.shareLink,
    shareWorkspace.reviewLink,
    releaseDeployment.shareLink,
    releaseable.shareLink,
    deploymentPath.shareLink,
  );
  const releaseStatus = firstNonEmpty(
    deploymentFeedback.latestProviderStatus,
    deploymentPath.releaseStatus,
    normalizeObject(releaseWorkspace.validation).status,
    releaseable.readinessDecision,
    "not-ready",
  );
  const hasReleaseContext = Boolean(
    normalizeString(releaseWorkspace.releaseTarget)
      || normalizeString(deploymentPath.primaryTarget)
      || normalizeString(releaseable.previewPath)
      || normalizeString(proofArtifact.title),
  );
  const hasAgentProposal = shareDemoAgent.taskId === "SHARE-AGT-001";
  const isShareReady = Boolean(explicitShareLink) && (hasReleaseContext || hasAgentProposal) && shareDemoAgent.status !== "revoked";
  const audienceItems = normalizeArray(companion.understoodItems)
    .concat(normalizeArray(safeProject.summarySnapshot?.understoodItems))
    .map((item) => normalizeString(item))
    .filter(Boolean)
    .slice(0, 3);

  return {
    contract: createShareSurfaceViewContract(),
    qaMode,
    project: {
      id: normalizeString(safeProject.id, "share-project"),
      name: normalizeString(safeProject.name, "Nexus Share"),
      goal: normalizeString(safeProject.goal, "Share workspace"),
      productClass: firstNonEmpty(artifactExpectation.projectType, safeProject.projectType, "generic"),
    },
    share: {
      isShareReady,
      hasReleaseContext,
      agentTaskId: firstNonEmpty(shareDemoAgent.taskId, "SHARE-AGT-001"),
      agentStatus: firstNonEmpty(shareDemoAgent.status, hasAgentProposal ? "prepared" : "not-prepared"),
      approvalStatus: firstNonEmpty(shareDemoAgent.approvalStatus, "not-required"),
      active: shareDemoAgent.active === true,
      readinessLabel: isShareReady
        ? "תצוגת סקירה מאושרת"
        : hasAgentProposal
          ? "הצעת שיתוף ממתינה לאישור"
          : "שיתוף נשאר פרטי עד שיש הצעה בטוחה",
      readinessBody: isShareReady
        ? "אפשר להציג תצוגת סקירה מוגבלת בלי לחשוף שיחה, סודות או מאחורי הקלעים."
        : hasAgentProposal
          ? firstNonEmpty(shareDemoAgent.userReply, "Nexus הכינה הצעת שיתוף, אבל לא תפתח אותה החוצה בלי אישור.")
          : "Nexus לא ממציאה קישור שיתוף. לפני שיתוף צריך הצעת דמו בטוחה או קישור סקירה אמיתי.",
      experienceTitle: firstNonEmpty(agentSummary.title, proofArtifact.title, artifactExpectation.title, "תוצר Nexus"),
      experienceBody: firstNonEmpty(
        agentSummary.goal,
        artifactExpectation.summary,
        proofArtifact.previewPayload?.subtitle,
        safeProject.goal,
        "תצוגת השיתוף מציגה את חוויית המוצר שאפשר להראות, לא ניהול הרשאות.",
      ),
      audienceTitle: firstNonEmpty(shareWorkspace.audienceTitle, "מי אמור לראות את זה"),
      audienceItems: normalizeString(shareDemoAgent.audience?.viewerType) ? [
        shareDemoAgent.audience.viewerType,
        normalizeString(shareDemoAgent.audience.purpose, "משוב מוגבל על המוצר"),
      ] : audienceItems.length ? audienceItems : [
        firstNonEmpty(safeProject.goal, "בודק מוצר שמקבל תצוגה מוגבלת"),
      ],
      accessMode: firstNonEmpty(shareDemoAgent.mode, shareWorkspace.accessMode, isShareReady ? "review-demo" : "private-draft"),
      privacyScope: firstNonEmpty(
        agentVisibility.privacyScope,
        shareWorkspace.privacyScope,
        "משתפים רק את חוויית התוצר. היסטוריה פנימית, מצב פרויקט וסודות ספקים לא נחשפים.",
      ),
      shareLink: explicitShareLink,
      shareLinkLabel: explicitShareLink || "קישור סקירה עדיין לא נוצר",
      releaseStatus,
      releaseTarget: firstNonEmpty(releaseWorkspace.releaseTarget, deploymentPath.primaryTarget, "private-preview"),
      evidenceItems: hasAgentProposal
        ? buildAgentEvidenceItems(shareDemoAgent)
        : buildEvidenceItems(releaseWorkspace, releaseable, deploymentPath),
    },
  };
}
