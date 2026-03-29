function toSlug(value, fallback = "project-draft") {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;
}

function createDraftState(goal = "", existingState = null) {
  const normalizedState = existingState && typeof existingState === "object" && !Array.isArray(existingState)
    ? existingState
    : {};

  return {
    businessGoal: goal,
    product: {
      hasAuth: false,
      hasStagingEnvironment: false,
      hasLandingPage: false,
      hasPaymentIntegration: false,
      ...(normalizedState.product ?? {}),
    },
    analytics: {
      hasBaselineCampaign: false,
      ...(normalizedState.analytics ?? {}),
    },
    knowledge: {
      knownGaps: [],
      ...(normalizedState.knowledge ?? {}),
    },
    stack: {
      frontend: "לא זוהה",
      backend: "לא זוהה",
      database: "לא זוהה",
      ...(normalizedState.stack ?? {}),
    },
    ...normalizedState,
  };
}

function parseInitialInput(initialInput) {
  if (typeof initialInput === "string") {
    return {
      raw: initialInput,
      projectName: null,
      goal: initialInput.trim(),
      attachments: [],
      links: [],
      creationSource: null,
      requestedDeliverables: [],
      draftId: null,
    };
  }

  const payload = initialInput && typeof initialInput === "object" ? initialInput : {};

  return {
    raw: payload.raw ?? payload.visionText ?? "",
    projectName: typeof payload.projectName === "string" ? payload.projectName.trim() : null,
    goal:
      typeof payload.goal === "string"
        ? payload.goal.trim()
        : typeof payload.visionText === "string"
          ? payload.visionText.trim()
          : "",
    attachments: Array.isArray(payload.attachments) ? payload.attachments : [],
    links: Array.isArray(payload.links) ? payload.links : [],
    creationSource: typeof payload.creationSource === "string" ? payload.creationSource.trim() : null,
    requestedDeliverables: Array.isArray(payload.requestedDeliverables) ? payload.requestedDeliverables : [],
    draftId:
      typeof payload.draftId === "string" && payload.draftId.trim()
        ? payload.draftId.trim()
        : (typeof payload.projectDraftId === "string" ? payload.projectDraftId.trim() : null),
  };
}

function resolveCreationSource(parsedInput, existingProjectDraft) {
  if (parsedInput.creationSource) {
    return parsedInput.creationSource;
  }
  if (typeof existingProjectDraft?.creationSource === "string" && existingProjectDraft.creationSource) {
    return existingProjectDraft.creationSource;
  }
  if (parsedInput.attachments.length > 0 || parsedInput.links.length > 0) {
    return "assisted-import";
  }
  return "manual-entry";
}

function resolveOwner(userIdentity, existingProjectDraft) {
  return {
    userId: userIdentity?.userId ?? existingProjectDraft?.owner?.userId ?? null,
    email: userIdentity?.email ?? existingProjectDraft?.owner?.email ?? null,
    displayName:
      userIdentity?.displayName
      ?? existingProjectDraft?.owner?.displayName
      ?? userIdentity?.email
      ?? userIdentity?.userId
      ?? "anonymous",
  };
}

function resolveMissingFields(name, goal, owner) {
  const missingFields = [];

  if (!name) {
    missingFields.push("name");
  }
  if (!goal) {
    missingFields.push("goal");
  }
  if (!owner.userId && !owner.email) {
    missingFields.push("owner");
  }

  return missingFields;
}

export function defineProjectDraftSchema({
  userIdentity = null,
  initialInput = null,
  existingProjectDraft = null,
} = {}) {
  const parsedInput = parseInitialInput(initialInput);
  const owner = resolveOwner(userIdentity, existingProjectDraft);
  const name =
    parsedInput.projectName
    ?? existingProjectDraft?.name
    ?? (typeof parsedInput.draftId === "string" ? parsedInput.draftId : null)
    ?? "Project Draft";
  const goal = parsedInput.goal || existingProjectDraft?.goal || "";
  const draftId = toSlug(
    parsedInput.draftId ?? existingProjectDraft?.id ?? parsedInput.projectName ?? name,
    "project-draft",
  );
  const missingFields = resolveMissingFields(name, goal, owner);
  const attachmentCount = parsedInput.attachments.length;
  const linkCount = parsedInput.links.length;

  return {
    projectDraft: {
      id: draftId,
      name,
      owner,
      creationSource: resolveCreationSource(parsedInput, existingProjectDraft),
      onboardingReadiness: {
        status: missingFields.length === 0 ? "ready" : "needs-input",
        missingFields,
        canStartOnboarding: missingFields.length === 0,
      },
      bootstrapMetadata: {
        hasVision: goal.length > 0,
        attachmentCount,
        linkCount,
        requestedDeliverables:
          parsedInput.requestedDeliverables.length > 0
            ? parsedInput.requestedDeliverables
            : (existingProjectDraft?.bootstrapMetadata?.requestedDeliverables ?? []),
        suggestedBootstrapMode: attachmentCount > 0 || linkCount > 0 ? "assisted" : "manual",
      },
      goal,
      state: createDraftState(goal, existingProjectDraft?.state ?? null),
    },
  };
}
