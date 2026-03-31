function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeRequest(request = null) {
  const normalized = normalizeObject(request);
  const requestedBy = normalizeObject(normalized.requestedBy);

  return {
    requestType: normalizeString(normalized.requestType, null),
    subjectType: normalizeString(normalized.subjectType, "user"),
    subjectId: normalizeString(normalized.subjectId, null),
    scopeType: normalizeString(normalized.scopeType, "project"),
    scopeId: normalizeString(normalized.scopeId, null),
    requestedBy: {
      actorId: normalizeString(requestedBy.actorId, null),
      actorType: normalizeString(requestedBy.actorType, null),
    },
  };
}

function createAction(actionType, target, status, details = null) {
  return {
    actionType,
    target,
    status,
    details,
  };
}

function scopeMatches(scopeType, scopeId, entry = {}) {
  if (scopeType === "global") {
    return true;
  }
  if (scopeType === "workspace") {
    return entry.scopeType === "workspace" && (scopeId ? entry.scopeId === scopeId : true);
  }
  if (scopeType === "project") {
    return entry.scopeType === "project" && (scopeId ? entry.scopeId === scopeId : true);
  }
  if (scopeType === "processing-scope") {
    return entry.processingScope === scopeId;
  }
  return false;
}

function buildAffectedScope(scopeType, scopeId, result) {
  return {
    scopeType,
    scopeId: scopeId ?? null,
    result,
  };
}

function determineStatus({
  blocked = false,
  failed = false,
  failedCount = 0,
  skippedCount = 0,
  unsupportedCount = 0,
}) {
  if (blocked) {
    return "blocked";
  }
  if (failed || failedCount > 0) {
    return "failed";
  }
  if (skippedCount > 0 || unsupportedCount > 0) {
    return "partial";
  }
  return "completed";
}

function buildExportPayload(project, request, context) {
  const manualContext = normalizeObject(project.manualContext);
  const projectIntake = normalizeObject(project.projectIntake);
  const consentState = normalizeObject(context.complianceConsentState);
  const selectedEntries = Array.isArray(consentState.consentEntries)
    ? consentState.consentEntries.filter((entry) =>
        scopeMatches(request.scopeType, request.scopeId, entry)
          && (!request.subjectId || entry.userId === request.subjectId || entry.userId === null))
    : [];

  return {
    subject: {
      subjectType: request.subjectType,
      subjectId: request.subjectId,
    },
    project: {
      projectId: project.id,
      projectName: project.name,
      scopeType: request.scopeType,
      scopeId: request.scopeId ?? project.id,
    },
    exportedAt: new Date().toISOString(),
    userProfile:
      request.subjectId
      && (manualContext.userProfile?.userId === request.subjectId
        || manualContext.userProfile?.email === request.subjectId
        || project.userId === request.subjectId)
        ? manualContext.userProfile ?? null
        : manualContext.userProfile ?? null,
    notificationPreferences: manualContext.notificationPreferences ?? context.notificationPreferences ?? null,
    consentEntries: selectedEntries,
    privacy: {
      dataPrivacyClassification: context.dataPrivacyClassification ?? null,
      privacyPolicyDecision: context.privacyPolicyDecision ?? null,
      complianceConsentState: context.complianceConsentState ?? null,
    },
    learningArtifacts: {
      learningInsights: project.context?.learningInsights ?? null,
      learningEvent: manualContext.learningEvent ?? null,
      learningTrace: manualContext.learningTrace ?? null,
    },
    attachments: projectIntake.uploadedFiles ?? manualContext.attachments ?? [],
    linkedAccounts: project.linkedAccounts ?? [],
  };
}

function ensureLearningOptOutEntry({ manualContext, request }) {
  const existingEntries = Array.isArray(manualContext.consentEntries) ? manualContext.consentEntries : [];
  const nextEntries = existingEntries.filter((entry) => {
    const normalized = normalizeObject(entry);
    return !(normalized.processingScope === "learning"
      && scopeMatches(request.scopeType, request.scopeId, normalized)
      && (normalized.userId === request.subjectId || normalized.userId === null || request.subjectId === null));
  });

  nextEntries.push({
    entryId: `privacy-opt-out:${request.subjectId ?? "anonymous"}:${request.scopeType}:${request.scopeId ?? "global"}:learning`,
    userId: request.subjectId,
    processingScope: "learning",
    scopeType:
      request.scopeType === "processing-scope"
        ? "global"
        : request.scopeType === "workspace" || request.scopeType === "project"
          ? request.scopeType
          : "global",
    scopeId:
      request.scopeType === "workspace" || request.scopeType === "project"
        ? request.scopeId
        : null,
    status: "withdrawn",
    legalBasis: "consent",
    legalBasisDetails: {
      source: "privacy-rights-execution",
      requestType: "learning-opt-out",
      actorId: request.requestedBy.actorId,
    },
    withdrawnAt: new Date().toISOString(),
    effectiveAt: new Date().toISOString(),
    expiresAt: null,
  });

  manualContext.consentEntries = nextEntries;
}

export function createPrivacyRightsExecutionModule({
  privacyRequest = null,
  project = null,
  context = null,
} = {}) {
  const request = normalizeRequest(privacyRequest);
  const normalizedProject = normalizeObject(project);
  const normalizedContext = normalizeObject(context);
  const manualContext = normalizeObject(normalizedProject.manualContext);
  const projectIntake = normalizeObject(normalizedProject.projectIntake);
  const executedActions = [];
  const affectedScopes = [];
  const reasons = [];
  let blocked = false;
  let failed = false;
  let unsupportedCount = 0;

  if (!request.requestType || !request.subjectId) {
    return {
      privacyRightsResult: {
        privacyRequestId: `privacy-request:${normalizedProject.id ?? "unknown"}:invalid`,
        status: "blocked",
        executedActions: [
          createAction("validate-request", "privacy-request", "failed", "Missing requestType or subjectId."),
        ],
        affectedScopes: [buildAffectedScope(request.scopeType, request.scopeId, "blocked")],
        summary: "Privacy request was blocked because the input was invalid.",
      },
    };
  }

  const actorId = request.requestedBy.actorId;
  const allowedActors = new Set([
    request.subjectId,
    normalizedProject.userId,
    normalizedContext.userIdentity?.userId,
  ].filter(Boolean));
  if (actorId && request.requestedBy.actorType !== "system" && !allowedActors.has(actorId)) {
    blocked = true;
    executedActions.push(
      createAction("authorize-request", "privacy-request", "failed", "Actor is not authorized for this subject."),
    );
    affectedScopes.push(buildAffectedScope(request.scopeType, request.scopeId, "blocked"));
    return {
      privacyRightsResult: {
        privacyRequestId: `privacy-request:${normalizedProject.id ?? "unknown"}:${request.requestType}:${request.subjectId}`,
        status: "blocked",
        executedActions,
        affectedScopes,
        summary: "Privacy request was blocked by authorization rules.",
      },
    };
  }

  const policyDecision = normalizeObject(normalizedContext.privacyPolicyDecision);
  const consentState = normalizeObject(normalizedContext.complianceConsentState);
  const hasDeleteConstraint =
    request.requestType !== "export"
    && Array.isArray(consentState.legalBasisEntries)
    && consentState.legalBasisEntries.some((entry) => {
      const normalized = normalizeObject(entry);
      return scopeMatches(request.scopeType, request.scopeId, normalized)
        && normalized.legalBasis === "legal-obligation"
        && ["granted", "active"].includes(normalized.status);
    });

  if (hasDeleteConstraint) {
    blocked = true;
    executedActions.push(
      createAction("evaluate-policy", "privacy-policy", "failed", "Deletion is blocked by an active legal obligation basis."),
    );
    affectedScopes.push(buildAffectedScope(request.scopeType, request.scopeId, "blocked"));
    return {
      privacyRightsResult: {
        privacyRequestId: `privacy-request:${normalizedProject.id ?? "unknown"}:${request.requestType}:${request.subjectId}`,
        status: "blocked",
        executedActions,
        affectedScopes,
        summary: "Privacy request was blocked because an active legal basis requires retention.",
      },
    };
  }

  try {
    if (request.requestType === "export") {
      const exportPayload = buildExportPayload(normalizedProject, request, normalizedContext);
      normalizedProject.privacyRightsResult = {
        exportPayload,
      };
      executedActions.push(
        createAction("export-subject-data", "project-export-bundle", "success", `Exported ${exportPayload.consentEntries.length} consent entries.`),
      );
      affectedScopes.push(buildAffectedScope(request.scopeType, request.scopeId, "exported"));
    } else if (request.requestType === "delete") {
      let mutations = 0;
      if (manualContext.userProfile
        && (manualContext.userProfile.userId === request.subjectId
          || manualContext.userProfile.email === request.subjectId
          || normalizedProject.userId === request.subjectId)) {
        manualContext.userProfile = {
          userId: manualContext.userProfile.userId ?? request.subjectId,
          displayName: "deleted-user",
          email: null,
          status: "deleted",
          verificationStatus: "deleted",
        };
        mutations += 1;
        executedActions.push(createAction("delete-user-profile", "manualContext.userProfile", "success", "Removed direct profile identifiers from project scope."));
      }
      if (Array.isArray(manualContext.consentEntries)) {
        const before = manualContext.consentEntries.length;
        manualContext.consentEntries = manualContext.consentEntries.filter((entry) =>
          !(entry?.userId === request.subjectId && scopeMatches(request.scopeType, request.scopeId, entry)));
        const removed = before - manualContext.consentEntries.length;
        mutations += removed > 0 ? 1 : 0;
        executedActions.push(createAction("delete-consent-entries", "manualContext.consentEntries", removed > 0 ? "success" : "skipped", removed > 0 ? `Removed ${removed} entries.` : "No matching consent entries in supported scope."));
      }
      if (projectIntake.uploadedFiles && request.scopeType === "project") {
        const before = projectIntake.uploadedFiles.length;
        projectIntake.uploadedFiles = [];
        const removed = before;
        mutations += removed > 0 ? 1 : 0;
        executedActions.push(createAction("delete-project-uploads", "projectIntake.uploadedFiles", removed > 0 ? "success" : "skipped", removed > 0 ? `Removed ${removed} uploaded files.` : "No uploaded files to remove."));
      } else {
        unsupportedCount += 1;
        executedActions.push(createAction("delete-project-uploads", "projectIntake.uploadedFiles", "skipped", "Project upload deletion is only supported for project scope."));
      }
      if (mutations === 0) {
        unsupportedCount += 1;
      }
      affectedScopes.push(buildAffectedScope(request.scopeType, request.scopeId, mutations > 0 ? "deleted" : "no-supported-targets"));
    } else if (request.requestType === "forget-me") {
      let mutations = 0;
      if (normalizedProject.userId === request.subjectId) {
        normalizedProject.userId = `deleted:${request.subjectId}`;
        mutations += 1;
        executedActions.push(createAction("anonymize-project-owner", "project.userId", "success", "Project owner anchor was anonymized."));
      }
      if (manualContext.userProfile) {
        manualContext.userProfile = {
          userId: manualContext.userProfile.userId ?? request.subjectId,
          displayName: "deleted-user",
          email: null,
          status: "deleted",
          verificationStatus: "deleted",
        };
        mutations += 1;
        executedActions.push(createAction("forget-user-profile", "manualContext.userProfile", "success", "Profile data was anonymized."));
      }
      if (manualContext.userSessionMetric?.userId === request.subjectId) {
        manualContext.userSessionMetric = {
          ...manualContext.userSessionMetric,
          userId: `deleted:${request.subjectId}`,
          sessionId: null,
          status: "deleted",
        };
        mutations += 1;
        executedActions.push(createAction("forget-session-metric", "manualContext.userSessionMetric", "success", "Session metric was anonymized."));
      }
      if (manualContext.notificationPreferences?.userId === request.subjectId) {
        manualContext.notificationPreferences = {
          ...manualContext.notificationPreferences,
          userId: `deleted:${request.subjectId}`,
          channels: [],
          eventTypes: [],
          digestEnabled: false,
          emailEnabled: false,
          inAppEnabled: false,
        };
        mutations += 1;
        executedActions.push(createAction("forget-notification-preferences", "manualContext.notificationPreferences", "success", "Notification preferences were disabled and anonymized."));
      }
      if (Array.isArray(manualContext.consentEntries)) {
        const before = manualContext.consentEntries.length;
        manualContext.consentEntries = manualContext.consentEntries.map((entry) =>
          entry?.userId === request.subjectId
            ? {
                ...entry,
                userId: `deleted:${request.subjectId}`,
                status: "withdrawn",
                withdrawnAt: new Date().toISOString(),
              }
            : entry);
        mutations += before > 0 ? 1 : 0;
        executedActions.push(createAction("forget-consent-registry", "manualContext.consentEntries", before > 0 ? "success" : "skipped", before > 0 ? "Subject consent entries were anonymized and withdrawn." : "No consent entries to anonymize."));
      }
      if (normalizeObject(normalizedProject.projectDraft).owner?.userId === request.subjectId) {
        normalizedProject.projectDraft = {
          ...normalizedProject.projectDraft,
          owner: {
            ...normalizeObject(normalizedProject.projectDraft.owner),
            userId: `deleted:${request.subjectId}`,
            email: null,
            displayName: "deleted-user",
          },
        };
        mutations += 1;
        executedActions.push(createAction("forget-project-draft-owner", "projectDraft.owner", "success", "Draft owner was anonymized."));
      }
      if (normalizeObject(normalizedProject.onboardingSession).userId === request.subjectId) {
        normalizedProject.onboardingSession = {
          ...normalizedProject.onboardingSession,
          userId: `deleted:${request.subjectId}`,
        };
        mutations += 1;
        executedActions.push(createAction("forget-onboarding-session", "onboardingSession.userId", "success", "Onboarding session subject was anonymized."));
      }
      unsupportedCount += 1;
      executedActions.push(createAction("forget-audit-stores", "system/security audit logs", "skipped", "No supported deletion hook exists for append-only audit stores."));
      affectedScopes.push(buildAffectedScope("global", null, mutations > 0 ? "forgotten-partially" : "no-supported-targets"));
    } else if (request.requestType === "learning-opt-out") {
      ensureLearningOptOutEntry({ manualContext, request });
      executedActions.push(createAction("withdraw-learning-consent", "manualContext.consentEntries", "success", "Learning processing was explicitly withdrawn for the subject."));
      if (normalizedProject.context?.learningInsights) {
        normalizedProject.context = {
          ...normalizedProject.context,
          learningInsights: null,
        };
        executedActions.push(createAction("clear-learning-insights", "context.learningInsights", "success", "Existing learning insights were removed from the active project context."));
      } else {
        executedActions.push(createAction("clear-learning-insights", "context.learningInsights", "skipped", "No active learning insights were stored in the project context."));
      }
      if (manualContext.learningEvent || manualContext.learningTrace) {
        manualContext.learningEvent = null;
        manualContext.learningTrace = null;
        executedActions.push(createAction("clear-learning-artifacts", "manualContext.learningEvent", "success", "Stored learning signals were cleared from manual context."));
      } else {
        unsupportedCount += 1;
        executedActions.push(createAction("clear-learning-artifacts", "manualContext.learningEvent", "skipped", "No learning artifacts hook exists beyond consent withdrawal."));
      }
      if (policyDecision.learningAllowed === false) {
        reasons.push("Upstream privacy policy already disallows learning, so the opt-out request was enforced on future compliance state.");
      }
      affectedScopes.push(buildAffectedScope(request.scopeType, request.scopeId, "learning-disabled"));
    } else {
      blocked = true;
      executedActions.push(createAction("validate-request-type", "privacy-request", "failed", `Unsupported privacy request type ${request.requestType}.`));
      affectedScopes.push(buildAffectedScope(request.scopeType, request.scopeId, "blocked"));
    }
  } catch (error) {
    failed = true;
    executedActions.push(createAction("execute-privacy-request", "privacy-request", "failed", error.message));
    affectedScopes.push(buildAffectedScope(request.scopeType, request.scopeId, "failed"));
  }

  normalizedProject.manualContext = manualContext;
  normalizedProject.projectIntake = Object.keys(projectIntake).length > 0 ? projectIntake : normalizedProject.projectIntake;

  const skippedCount = executedActions.filter((action) => action.status === "skipped").length;
  const failedCount = executedActions.filter((action) => action.status === "failed").length;
  const status = determineStatus({
    blocked,
    failed,
    failedCount,
    skippedCount,
    unsupportedCount,
  });
  const completedActions = executedActions.filter((action) => action.status === "success").length;
  const summary =
    status === "blocked"
      ? "Privacy request was blocked before execution."
      : status === "failed"
        ? "Privacy request execution failed after starting side effects."
        : status === "partial"
          ? `Privacy request executed with ${completedActions} successful actions and ${skippedCount + unsupportedCount} unsupported or skipped steps.`
          : `Privacy request executed successfully across ${completedActions} supported actions.`;

  return {
    privacyRightsResult: {
      privacyRequestId: `privacy-request:${normalizedProject.id ?? "unknown"}:${request.requestType}:${request.subjectId}`,
      status,
      executedActions,
      affectedScopes,
      summary,
    },
  };
}
