function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function toStatusLabel(status) {
  const normalizedStatus = normalizeString(status, "not-ready");
  if (normalizedStatus === "ready") {
    return "מוכן ל־handoff";
  }
  if (normalizedStatus === "active") {
    return "handoff בהכנה";
  }
  if (normalizedStatus === "preparing") {
    return "אוספים evidence ל־handoff";
  }
  return "עדיין לא מוכן ל־handoff";
}

function buildEvidenceItems({ proofArtifact, releaseableProductStateContract, releaseWorkspace }) {
  const artifact = normalizeObject(proofArtifact);
  const releaseableState = normalizeObject(releaseableProductStateContract);
  const workspace = normalizeObject(releaseWorkspace);
  const previewPayload = normalizeObject(artifact.previewPayload);

  return [
    {
      label: "What was built",
      value: normalizeString(
        artifact.title,
        normalizeString(previewPayload.title, "active product surface"),
      ),
    },
    {
      label: "What was wrapped",
      value: normalizeString(releaseableState.packageArtifactType, "generic-delivery-bundle"),
    },
    {
      label: "Release target",
      value: normalizeString(releaseableState.releaseTarget, normalizeString(workspace.releaseTarget, "private-deployment")),
    },
    {
      label: "Validation state",
      value: normalizeString(workspace.validation?.status, normalizeString(releaseableState.readinessDecision, "not-ready")),
    },
  ];
}

function buildHandoffSteps({ releaseableProductStateContract, proofArtifact }) {
  const releaseableState = normalizeObject(releaseableProductStateContract);
  const artifact = normalizeObject(proofArtifact);

  return [
    `פותחים את ${normalizeString(artifact.title, "התוצר הפעיל")} מתוך Nexus בלי לאבד הקשר.`,
    `מאשרים את נתיב ה־package: ${normalizeString(releaseableState.packagePath, "generic-package -> private-deployment")}.`,
    `ממשיכים ל־handoff הבא דרך ${normalizeString(releaseableState.summary?.nextAction, "resolve-release-readiness-gaps")}.`,
  ];
}

export function createReleaseEvidenceHandoffModel({
  proofArtifact = null,
  releaseableProductStateContract = null,
  releaseWorkspace = null,
} = {}) {
  const artifact = normalizeObject(proofArtifact);
  const releaseableState = normalizeObject(releaseableProductStateContract);
  const workspace = normalizeObject(releaseWorkspace);
  const visibleChecks = normalizeArray(releaseableState.visibleChecks);
  const blockers = normalizeArray(releaseableState.blockedReasons);
  const releaseTarget = normalizeString(releaseableState.releaseTarget, normalizeString(workspace.releaseTarget, "private-deployment"));
  const packagePath = normalizeString(releaseableState.packagePath, "generic-package -> private-deployment");
  const previewPath = normalizeString(releaseableState.previewPath, "generic-preview -> generic-preview");
  const handoffStatus = normalizeString(releaseableState.status, "not-ready");

  return {
    releaseEvidenceHandoffModel: {
      modelId: `release-evidence-handoff:${normalizeString(artifact.artifactId, "unknown-artifact")}`,
      evidenceFamily: "release-evidence-handoff",
      status: handoffStatus,
      handoffStatusLabel: toStatusLabel(handoffStatus),
      explainableReleasePath: `${previewPath} -> ${packagePath} -> ${releaseTarget}`,
      builtSurfaceTitle: normalizeString(artifact.title, "active product surface"),
      wrappedArtifactType: normalizeString(releaseableState.packageArtifactType, "generic-delivery-bundle"),
      packagePath,
      previewPath,
      releaseTarget,
      nextAction: normalizeString(releaseableState.summary?.nextAction, "resolve-release-readiness-gaps"),
      narrative: normalizeString(
        releaseableState.visibleStateRule,
        "ה־release path חייב להיות מוסבר דרך התוצר, ה־package, והצעד הבא מתוך Nexus.",
      ),
      evidenceItems: buildEvidenceItems({
        proofArtifact: artifact,
        releaseableProductStateContract: releaseableState,
        releaseWorkspace: workspace,
      }),
      visibleChecks: visibleChecks.map((item) => ({
        checkId: normalizeString(item.checkId, "unknown-check"),
        status: normalizeString(item.status, "failed"),
        reason: normalizeString(item.reason, "not-passed"),
      })),
      blockers,
      handoffSteps: buildHandoffSteps({
        releaseableProductStateContract: releaseableState,
        proofArtifact: artifact,
      }),
      persistenceRule: "release evidence and handoff must survive proof revisit, route restore, and the next confirmation step",
    },
  };
}
