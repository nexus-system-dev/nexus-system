import { buildOnboardingArtifactExpectation } from "./onboarding-artifact-expectation.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function createOnboardingToStateHandoffContract({
  projectDraft = null,
  projectIntake = null,
  onboardingCompletionDecision = null,
  onboardingSession = null,
} = {}) {
  const normalizedDraft = normalizeObject(projectDraft);
  const normalizedIntake = normalizeObject(projectIntake);
  const normalizedDecision = normalizeObject(onboardingCompletionDecision);
  const normalizedSession = normalizeObject(onboardingSession);
  const draftMetadata = {
    draftId: normalizedDraft.id ?? normalizedSession.projectDraftId ?? null,
    name: normalizedDraft.name ?? null,
    owner: normalizeObject(normalizedDraft.owner),
    creationSource: normalizedDraft.creationSource ?? null,
    onboardingReadiness: normalizeObject(normalizedDraft.onboardingReadiness),
    bootstrapMetadata: normalizeObject(normalizedDraft.bootstrapMetadata),
  };
  const missingClarifications = normalizeArray(normalizedDecision.clarificationPrompts);
  const approvals = normalizeArray(normalizedSession.approvals)
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => value.trim());
  const canBuildProjectState = normalizedDecision.isComplete === true;
  const completionStatus = normalizedDecision.completionStatus ?? (canBuildProjectState ? "completed" : "needs-clarification");
  const continuationGate = normalizeObject(normalizedDecision.continuationGate);
  const artifactExpectation = buildOnboardingArtifactExpectation({
    projectDraft: normalizedDraft,
    projectIntake: normalizedIntake,
    onboardingSession: normalizedSession,
  });

  return {
    onboardingStateHandoff: {
      handoffId: `onboarding-handoff:${draftMetadata.draftId ?? normalizedSession.sessionId ?? "unknown"}`,
      handoffStatus: canBuildProjectState ? "ready" : "needs-clarification",
      completionStatus,
      projectDraft: draftMetadata,
      projectIntake: {
        projectName: normalizedIntake.projectName ?? null,
        visionText: normalizedIntake.visionText ?? null,
        projectType: normalizedIntake.projectType ?? "unknown",
        requestedDeliverables: normalizeArray(normalizedIntake.requestedDeliverables),
        uploadedFiles: normalizeArray(normalizedIntake.uploadedFiles),
        externalLinks: normalizeArray(normalizedIntake.externalLinks),
      },
      approvals,
      missingClarifications,
      continuationGate: continuationGate.gateType ? continuationGate : null,
      artifactExpectation,
      completionDecision: {
        decisionId: normalizedDecision.decisionId ?? null,
        isComplete: normalizedDecision.isComplete === true,
        requiresClarification: normalizedDecision.requiresClarification === true,
        readinessLevel: normalizedDecision.readinessLevel ?? "blocked",
        completionStatus,
        primaryBlockingReason: normalizedDecision.primaryBlockingReason ?? null,
        nextAction: normalizedDecision.nextAction ?? null,
        missingInputs: normalizeArray(normalizedDecision.missingInputs),
        supportingMaterialDeferred: normalizedDecision.supportingMaterialDeferred === true,
      },
      summary: {
        canBuildProjectState,
        approvalCount: approvals.length,
        missingClarificationCount: missingClarifications.length,
        hasRequestedDeliverables: normalizeArray(normalizedIntake.requestedDeliverables).length > 0,
        artifactExpectationTitle: artifactExpectation.title ?? null,
        hasContinuationGate: continuationGate.gateType ? true : false,
      },
    },
  };
}
