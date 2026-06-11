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

function normalizeBoolean(value) {
  return value === true;
}

function labelStatus(value, fallback = "בהכנה") {
  const status = normalizeString(value, fallback);
  const labels = {
    ready: "מוכן לבדיקה אחרונה",
    "ready-for-release": "מוכן לבדיקה אחרונה",
    active: "פעיל",
    preparing: "בהכנה",
    pending: "ממתין",
    blocked: "חסום",
    failed: "נכשל",
    passed: "עבר",
    allowed: "מאושר",
    allow: "מאושר",
    "not-ready": "לא מוכן",
    unknown: "לא ידוע",
    draft: "טיוטה",
    planned: "מתוכנן",
    published: "פורסם",
  };
  return labels[status] ?? status;
}

function labelTarget(value) {
  const target = normalizeString(value, "private-deployment");
  const labels = {
    "private-deployment": "סקירה פרטית",
    "web-deployment": "פרסום אתר",
    production: "סביבת ייצור",
    staging: "סביבת בדיקה",
    "app-store": "חנות אפליקציות",
    "play-store": "חנות אנדרואיד",
    "internal-distribution": "הפצה פנימית",
    "game-build": "חבילת משחק",
    "playable-preview": "תצוגת משחק",
  };
  return labels[target] ?? target;
}

function labelProvider({ provider, connected }) {
  if (!connected) {
    return "לא מחובר לספק חיצוני";
  }
  const labels = {
    vercel: "ספק אתר מוגדר",
    render: "ספק שרת מוגדר",
    railway: "ספק סביבת עבודה מוגדר",
    "app-store-connect": "ספק חנות אפליקציות מוגדר",
    "game-build-pipeline": "מסלול בניית משחק מוגדר",
    "publishing-export": "מסלול יצוא מוגדר",
    generic: "ספק שחרור כללי מוגדר",
  };
  return labels[provider] ?? "ספק שחרור מוגדר";
}

function labelCheck(item) {
  const check = normalizeObject(item);
  const label = normalizeString(check.label, normalizeString(check.reason, normalizeString(check.checkId, "בדיקת שחרור")));
  return {
    label: createBlocker(label) ?? label,
    status: labelStatus(check.status, "ממתין"),
  };
}

function createBlocker(value) {
  const blocker = normalizeString(value);
  if (!blocker) return null;
  const labels = {
    "release-workspace-blocked": "מסלול השחרור עדיין חסום.",
    "production-health-unconfirmed": "בדיקת סביבת הייצור עוד לא אושרה.",
    "production-health-unready": "בדיקת סביבת הייצור עוד לא מוכנה.",
    "deployment-result-unready": "תוצאת ההפצה עוד לא מוכנה.",
    "launch-unconfirmed": "שחרור עדיין לא אושר על ידי המשתמש.",
    "release handoff missing": "חסר מסירת תוצר מלאה לשחרור.",
    "release-handoff-missing": "חסר מסירת תוצר מלאה לשחרור.",
  };
  return labels[blocker] ?? blocker;
}

function labelTimelineEvent(value) {
  const event = normalizeString(value);
  if (!event) return null;
  if (/^release-event-\d+$/u.test(event)) {
    return "נרשם אירוע שחרור.";
  }
  const labels = {
    "release-preview-ready": "תצוגת השחרור מוכנה לבדיקה.",
    "release-gate-ready": "שער השחרור מוכן לבדיקה.",
    "release-blocked": "השחרור חסום ודורש טיפול.",
  };
  return labels[event] ?? event;
}

function labelReleasePath(value, fallback) {
  const path = normalizeString(value, fallback);
  if (/generic-preview|workspace-preview/u.test(path)) {
    return "תצוגת מוצר פנימית לבדיקה.";
  }
  if (/generic-package|workspace-package|product-package/u.test(path)) {
    return "חבילת מוצר עצמאית עדיין לא מוכנה.";
  }
  if (/preview -> gate -> publish|private-deployment/u.test(path)) {
    return "תצוגה פנימית -> שער שחרור -> פרסום רק אחרי אישור.";
  }
  return path;
}

function labelArtifactType(value) {
  const artifactType = normalizeString(value, "תוצר שחרור");
  const labels = {
    "release-artifact": "תוצר שחרור",
    "authenticated-web-workspace-bundle": "חבילת סביבת עבודה",
    "deployable-web-bundle": "חבילת אתר",
    "generic-delivery-bundle": "חבילת מוצר",
  };
  return labels[artifactType] ?? artifactType;
}

function createReleaseSurfaceViewContract() {
  return {
    contractId: "SURF-004",
    surfaceId: "release",
    purpose: "human-release-decision-workspace",
    releaseLaw: "preview-plus-gate-plus-deploy-truth",
    requiredRegions: [
      "release-preview-surface",
      "release-gate",
      "verification-evidence",
      "deploy-publish-action",
      "failed-release-recovery",
      "rollback-affordance",
      "share-demo-link",
      "version-history-anchor",
    ],
  };
}

export function buildReleaseSurfaceViewModel({ project = null, qaMode = false } = {}) {
  const safeProject = normalizeObject(project);
  const releaseWorkspace = normalizeObject(
    safeProject.releaseWorkspace
      ?? safeProject.context?.releaseWorkspace
      ?? safeProject.state?.releaseWorkspace,
  );
  const releaseValidation = normalizeObject(releaseWorkspace.validation);
  const releaseDeployment = normalizeObject(releaseWorkspace.deployment);
  const releaseTimeline = normalizeObject(releaseWorkspace.timeline);
  const releaseSummary = normalizeObject(releaseWorkspace.summary);
  const releaseable = normalizeObject(
    safeProject.releaseableProductStateContract
      ?? safeProject.context?.releaseableProductStateContract
      ?? safeProject.state?.releaseableProductStateContract,
  );
  const deploymentPath = normalizeObject(
    safeProject.classAwareDeploymentReleasePath
      ?? safeProject.context?.classAwareDeploymentReleasePath
      ?? safeProject.state?.classAwareDeploymentReleasePath,
  );
  const deploymentFeedback = normalizeObject(
    safeProject.deploymentStateFeedbackContract
      ?? safeProject.context?.deploymentStateFeedbackContract
      ?? safeProject.state?.deploymentStateFeedbackContract,
  );
  const productOwnedBackend = normalizeObject(
    safeProject.productOwnedBackendSkeleton
      ?? safeProject.context?.productOwnedBackendSkeleton
      ?? safeProject.state?.productOwnedBackendSkeleton
      ?? safeProject.runtimeSkeletonTruth?.productOwnedBackendSkeleton,
  );
  const productRuntimePackage = normalizeObject(
    safeProject.productRuntimePackage
      ?? safeProject.generatedProductRuntimePackage
      ?? safeProject.context?.productRuntimePackage
      ?? safeProject.context?.generatedProductRuntimePackage,
  );
  const standaloneArtifact = normalizeObject(
    safeProject.standaloneArtifact
      ?? safeProject.standaloneReleasableProductArtifact
      ?? safeProject.context?.standaloneArtifact
      ?? safeProject.context?.standaloneReleasableProductArtifact,
  );
  const contract = createReleaseSurfaceViewContract();

  const releaseTarget = firstNonEmpty(
    releaseWorkspace.releaseTarget,
    releaseDeployment.target,
    releaseable.releaseTarget,
    deploymentPath.primaryTarget,
    "private-deployment",
  );
  const validationStatus = firstNonEmpty(
    releaseValidation.status,
    releaseable.readinessDecision,
    deploymentPath.releaseStatus,
    "not-ready",
  );
  const currentStage = firstNonEmpty(
    normalizeObject(releaseWorkspace.buildAndDeploy).currentStage,
    releaseTimeline.currentStage,
    deploymentPath.nextGate,
    "release-gate",
  );
  const currentStatus = firstNonEmpty(
    normalizeObject(releaseWorkspace.buildAndDeploy).currentStatus,
    releaseTimeline.currentStatus,
    deploymentFeedback.latestProviderStatus,
    "pending",
  );
  const backendProductionReady = productOwnedBackend.productionBackend === true
    || productOwnedBackend.productionBackend?.enabled === true;
  const hasProductRuntimePackage = Boolean(productRuntimePackage.packageId || productRuntimePackage.artifactRoot || productRuntimePackage.runCommand);
  const hasStandaloneArtifact = Boolean(standaloneArtifact.artifactId || standaloneArtifact.artifactRoot || standaloneArtifact.runCommand);
  const providerConnected = Boolean(releaseDeployment.provider || deploymentPath.providerType) && !["not-connected", "generic"].includes(
    firstNonEmpty(releaseDeployment.provider, deploymentPath.providerType, "not-connected"),
  );
  const canonicalBlockers = [
    backendProductionReady ? null : "המוצר עדיין נשען על שמירה מקומית/מדומה, לא על בקאנד ייצור.",
    hasProductRuntimePackage ? null : "עדיין אין חבילת מוצר עצמאית להרצה מחוץ לנקסוס.",
    hasStandaloneArtifact ? null : "עדיין אין תוצר עצמאי שאפשר להריץ ולשחרר.",
    providerConnected ? null : "עדיין אין ספק שחרור מחובר ומאושר.",
    releaseDeployment.requiresApproval ? "שחרור דורש אישור משתמש מפורש." : null,
  ];
  const blockers = normalizeArray(releaseValidation.blockers)
    .concat(normalizeArray(releaseable.blockedReasons))
    .concat(canonicalBlockers)
    .map((item) => createBlocker(item))
    .filter(Boolean)
    .slice(0, 8);
  const visibleChecks = normalizeArray(releaseable.visibleChecks)
    .map((item) => labelCheck(item))
    .slice(0, 6);
  const timelineEvents = normalizeArray(releaseTimeline.events)
    .map((item, index) => normalizeObject(item).label ?? normalizeObject(item).eventId ?? `release-event-${index + 1}`)
    .map((item) => labelTimelineEvent(item))
    .filter(Boolean)
    .slice(0, 4);

  const engineAnchors = {
    releaseWorkspace: Boolean(releaseWorkspace.workspaceId || releaseWorkspace.releaseTarget || releaseWorkspace.validation),
    releaseableProductStateContract: Boolean(releaseable.contractId || releaseable.stateFamily),
    classAwareDeploymentReleasePath: Boolean(deploymentPath.modelId || deploymentPath.pathFamily),
    deploymentStateFeedbackContract: Boolean(deploymentFeedback.contractId || deploymentFeedback.feedbackFamily),
    productOwnedBackendSkeleton: Boolean(productOwnedBackend.productOwnedBackendSkeletonId),
  };
  const hardReleaseReady = (releaseValidation.isReady === true || releaseable.readinessDecision === "ready")
    && blockers.length === 0
    && hasProductRuntimePackage
    && hasStandaloneArtifact
    && backendProductionReady;

  return {
    contract,
    qaMode,
    project: {
      id: normalizeString(safeProject.id, "release-project"),
      name: normalizeString(safeProject.name, "Nexus Release"),
      goal: normalizeString(safeProject.goal, "Release workspace"),
    },
    release: {
      target: releaseTarget,
      targetLabel: labelTarget(releaseTarget),
      tag: firstNonEmpty(normalizeObject(releaseWorkspace.buildAndDeploy).releaseTag, releaseable.releaseTag, "draft"),
      validationStatus,
      validationStatusLabel: labelStatus(validationStatus, "לא מוכן"),
      qualityGateDecision: firstNonEmpty(releaseValidation.qualityGateDecision, "pending"),
      qualityGateDecisionLabel: labelStatus(firstNonEmpty(releaseValidation.qualityGateDecision, "pending"), "ממתין"),
      isReady: hardReleaseReady,
      isBlocked: releaseSummary.isBlocked === true || blockers.length > 0,
      currentStage,
      currentStatus,
      currentStatusLabel: labelStatus(currentStatus, "ממתין"),
      provider: firstNonEmpty(releaseDeployment.provider, deploymentPath.providerType, "not-connected"),
      providerLabel: labelProvider({
        provider: firstNonEmpty(releaseDeployment.provider, deploymentPath.providerType, "not-connected"),
        connected: providerConnected,
      }),
      strategy: firstNonEmpty(releaseDeployment.strategy, "manual-review"),
      strategyLabel: releaseDeployment.requiresApproval === true ? "אישור ידני לפני כל שחרור" : "בדיקה ידנית לפני שחרור",
      requiresApproval: normalizeBoolean(releaseDeployment.requiresApproval),
      previewPath: firstNonEmpty(releaseable.previewPath, deploymentPath.previewPath, "build-preview"),
      packagePath: firstNonEmpty(releaseable.packagePath, deploymentPath.packagePath, "product-package -> release"),
      operationalPath: firstNonEmpty(deploymentPath.operationalPath, "preview -> gate -> publish"),
      deploymentArtifactType: firstNonEmpty(releaseable.packageArtifactType, deploymentPath.deploymentArtifactType, "release-artifact"),
      previewLabel: labelReleasePath(firstNonEmpty(releaseable.previewPath, deploymentPath.previewPath, "build-preview"), "תצוגת מוצר פנימית לבדיקה."),
      packageLabel: labelReleasePath(firstNonEmpty(releaseable.packagePath, deploymentPath.packagePath, "product-package -> release"), "חבילת מוצר עצמאית עדיין לא מוכנה."),
      operationalLabel: labelReleasePath(firstNonEmpty(deploymentPath.operationalPath, "preview -> gate -> publish"), "תצוגה פנימית -> שער שחרור -> פרסום רק אחרי אישור."),
      deploymentArtifactLabel: labelArtifactType(firstNonEmpty(releaseable.packageArtifactType, deploymentPath.deploymentArtifactType, "release-artifact")),
      nextAction: firstNonEmpty(normalizeObject(releaseable.summary).nextAction, deploymentPath.nextGate, "resolve-release-readiness"),
      nextActionLabel: "להשלים את חסימות השחרור לפני פרסום",
      blockers,
      visibleChecks,
      timelineEvents,
      framing: {
        taskId: "EXP-004",
        boundary: "release-framing-not-release-execution",
        engineAnchors,
        backendBoundary: backendProductionReady ? "production-backend" : "local-mock-backend",
        productPackageStatus: hasProductRuntimePackage ? "exists" : "missing",
        standaloneArtifactStatus: hasStandaloneArtifact ? "exists" : "missing",
        releaseClaim: hardReleaseReady ? "may-request-user-approval" : "blocked-before-release-claim",
        preservedEngine: "releaseWorkspace + releaseableProductStateContract + classAwareDeploymentReleasePath + deploymentStateFeedbackContract",
      },
    },
  };
}
