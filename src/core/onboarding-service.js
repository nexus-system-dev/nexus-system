import { defineProjectDraftSchema } from "./project-draft-schema.js";

function toSlug(value, fallback = "project-draft") {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;
}

function createSessionId(projectDraftId) {
  return `onboarding-${projectDraftId}-${Date.now()}`;
}

function parseInitialInput(initialInput) {
  if (typeof initialInput === "string") {
    return {
      raw: initialInput,
      projectName: null,
      goal: initialInput.trim(),
      attachments: [],
      links: [],
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
  };
}

function normalizeUploadedFiles(uploadedFiles = []) {
  if (!Array.isArray(uploadedFiles)) {
    return [];
  }

  return uploadedFiles
    .filter((item) => item && typeof item === "object")
    .map((file, index) => ({
      id: file.id ?? `file-${index + 1}`,
      name: typeof file.name === "string" ? file.name.trim() : `attachment-${index + 1}`,
      type: typeof file.type === "string" ? file.type.trim() : "unknown",
      content: typeof file.content === "string" ? file.content : "",
      size: typeof file.size === "number" ? file.size : null,
    }));
}

function normalizeExternalLinks(externalLinks = []) {
  if (!Array.isArray(externalLinks)) {
    return [];
  }

  return externalLinks
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => value.trim());
}

function extractProjectName(visionText = "") {
  const fromTitle = visionText.match(/^(?:שם הפרויקט|project name)\s*[:\-]\s*(.+)$/im);
  return fromTitle?.[1]?.trim() ?? null;
}

function detectProjectType(text) {
  const normalized = text.toLowerCase();
  if (/(mobile app|react native|expo|ios|android|אפליקציה)/i.test(normalized)) {
    return "mobile-app";
  }
  if (/(saas|subscription|mvp|web app|platform)/i.test(normalized)) {
    return "saas";
  }
  if (/(game|unity|unreal|משחק)/i.test(normalized)) {
    return "game";
  }
  if (/(book|ebook|chapter|ספר)/i.test(normalized)) {
    return "book";
  }
  if (/(course|content product|workshop|קורס)/i.test(normalized)) {
    return "content-product";
  }
  return "unknown";
}

function detectRequestedDeliverables(text, files, links) {
  const signals = [];
  const normalized = text.toLowerCase();

  if (/(auth|login|register|התחברות)/i.test(normalized)) {
    signals.push("auth");
  }
  if (/(payment|payments|billing|checkout|תשלום|תשלומים)/i.test(normalized)) {
    signals.push("payments");
  }
  if (/(landing page|דף נחיתה|campaign|marketing|שיווק)/i.test(normalized)) {
    signals.push("growth");
  }
  if (
    files.some(
      (file) =>
        /figma|design|ui/i.test(file.name) ||
        /figma|design|ui/i.test(file.type) ||
        /figma|design|ui/i.test(file.content),
    )
  ) {
    signals.push("design-input");
  }
  if (links.some((link) => /github|gitlab/i.test(link))) {
    signals.push("repo-link");
  }

  return [...new Set(signals)];
}

function inferMissingInputs({ projectName, visionText, uploadedFiles, externalLinks }) {
  const missingInputs = [];

  if (!visionText.trim()) {
    missingInputs.push("vision");
  }
  if (!projectName) {
    missingInputs.push("project-name");
  }
  if (uploadedFiles.length === 0 && externalLinks.length === 0) {
    missingInputs.push("supporting-material");
  }

  return missingInputs;
}

function buildProjectIntake({ visionText = "", uploadedFiles = [], externalLinks = [] }) {
  const normalizedFiles = normalizeUploadedFiles(uploadedFiles);
  const normalizedLinks = normalizeExternalLinks(externalLinks);
  const projectName = extractProjectName(visionText);
  const projectType = detectProjectType(visionText);
  const requestedDeliverables = detectRequestedDeliverables(visionText, normalizedFiles, normalizedLinks);

  return {
    projectName,
    visionText: visionText.trim(),
    uploadedFiles: normalizedFiles,
    externalLinks: normalizedLinks,
    projectType,
    requestedDeliverables,
  };
}

function buildParsedSignals(projectIntake) {
  return {
    detectedProjectType: projectIntake.projectType,
    hasUploadedFiles: projectIntake.uploadedFiles.length > 0,
    hasExternalLinks: projectIntake.externalLinks.length > 0,
    requestedDeliverables: projectIntake.requestedDeliverables,
    detectedInputs: [
      ...(projectIntake.projectName ? ["project-name"] : []),
      ...(projectIntake.visionText ? ["vision"] : []),
      ...(projectIntake.uploadedFiles.length > 0 ? ["files"] : []),
      ...(projectIntake.externalLinks.length > 0 ? ["links"] : []),
    ],
  };
}

function resolveOnboardingSteps({ onboardingSession, projectIntake }) {
  const requiredActions = [];
  const missingInputs = inferMissingInputs(projectIntake);

  if (missingInputs.includes("vision")) {
    requiredActions.push("הזן תיאור קצר של מה אתה רוצה לבנות");
  }
  if (missingInputs.includes("project-name")) {
    requiredActions.push("תן שם לפרויקט");
  }
  if (missingInputs.includes("supporting-material")) {
    requiredActions.push("העלה איפיון, קבצים או קישור חיצוני");
  }
  if (projectIntake.projectType === "unknown") {
    requiredActions.push("חדד איזה סוג פרויקט אתה בונה");
  }

  const currentStep = missingInputs.length > 0
    ? "capture-missing-inputs"
    : projectIntake.projectType === "unknown"
      ? "clarify-project-type"
      : "review-intake";

  const nextStep = currentStep === "review-intake" ? "confirm-project-setup" : "review-intake";

  return {
    currentStep,
    nextStep,
    requiredActions,
    sessionId: onboardingSession?.sessionId ?? null,
    projectDraftId: onboardingSession?.projectDraftId ?? null,
  };
}

function appendUnique(items = [], value) {
  return items.includes(value) ? items : [...items, value];
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validatePayload(payload, schema = {}) {
  if (!isPlainObject(payload)) {
    return false;
  }

  if (Array.isArray(schema.requiredKeys)) {
    return schema.requiredKeys.every((key) => key in payload);
  }

  return true;
}

function createProjectDraftSnapshot({
  userId,
  projectDraftId,
  initialInput = null,
  existingProjectDraft = null,
} = {}) {
  return defineProjectDraftSchema({
    userIdentity: {
      userId: userId ?? null,
      email: existingProjectDraft?.owner?.email ?? null,
      displayName: existingProjectDraft?.owner?.displayName ?? null,
    },
    initialInput: {
      ...(initialInput ?? {}),
      projectDraftId,
    },
    existingProjectDraft,
  }).projectDraft;
}

export class OnboardingService {
  constructor() {
    this.sessions = new Map();
    this.actionRegistry = this.createActionRegistry();
  }

  createSession({ userId, projectDraftId, initialInput }) {
    const parsedInput = parseInitialInput(initialInput);
    const resolvedDraftId = toSlug(projectDraftId ?? parsedInput.projectName ?? "project-draft");
    const resolvedName = parsedInput.projectName ?? projectDraftId ?? "Project Draft";
    const now = new Date().toISOString();
    const session = {
      sessionId: createSessionId(resolvedDraftId),
      userId: String(userId ?? "anonymous"),
      projectDraftId: resolvedDraftId,
      currentStep: parsedInput.goal ? "review-intake" : "capture-vision",
      nextStep: parsedInput.goal ? "confirm-project-setup" : "review-intake",
      status: "active",
      createdAt: now,
      updatedAt: now,
      initialInput: parsedInput,
      projectIntake: null,
      requiredActions: [],
      approvals: [],
      connectedSources: {
        repo: null,
      },
      projectDraft: createProjectDraftSnapshot({
        userId,
        projectDraftId: resolvedDraftId,
        initialInput: {
          ...parsedInput,
          projectName: resolvedName,
          goal: parsedInput.goal,
          creationSource: "onboarding-session",
        },
      }),
    };

    this.sessions.set(session.sessionId, session);
    return session;
  }

  createProjectIntake({ visionText, uploadedFiles = [], externalLinks = [] }) {
    const projectIntake = buildProjectIntake({
      visionText,
      uploadedFiles,
      externalLinks,
    });
    const parsedSignals = buildParsedSignals(projectIntake);
    const missingInputs = inferMissingInputs(projectIntake);

    return {
      projectIntake,
      parsedSignals,
      missingInputs,
    };
  }

  resolveStep({ onboardingSession, projectIntake }) {
    const resolved = resolveOnboardingSteps({
      onboardingSession,
      projectIntake,
    });

    if (onboardingSession?.sessionId && this.sessions.has(onboardingSession.sessionId)) {
      const existing = this.sessions.get(onboardingSession.sessionId);
      const updatedSession = {
        ...existing,
        currentStep: resolved.currentStep,
        updatedAt: new Date().toISOString(),
        projectIntake,
        requiredActions: resolved.requiredActions,
        nextStep: resolved.nextStep,
      };
      this.sessions.set(onboardingSession.sessionId, updatedSession);
    }

    return resolved;
  }

  createActionRegistry() {
    return {
      "create-project-draft": {
        actionSchema: {
          requiredKeys: [],
        },
        handler: this.createProjectDraftMutationHandler.bind(this),
      },
      "upload-spec": {
        actionSchema: {
          requiredKeys: [],
        },
        handler: this.createIntakeUpdateHandler.bind(this),
      },
      "connect-repo": {
        actionSchema: {
          requiredKeys: ["provider"],
        },
        handler: this.createRepoConnectionHandler.bind(this),
      },
      "approve-choice": {
        actionSchema: {
          requiredKeys: ["choice"],
        },
        handler: this.createApprovalCaptureHandler.bind(this),
      },
      "advance-step": {
        actionSchema: {
          requiredKeys: [],
        },
        handler: this.createOnboardingStepAdvancementHandler.bind(this),
      },
    };
  }

  createProjectDraftMutationHandler({ session, payload, now }) {
    const projectName = typeof payload.projectName === "string" && payload.projectName.trim()
      ? payload.projectName.trim()
      : session.projectDraft.name;
    const goal = typeof payload.goal === "string" ? payload.goal.trim() : session.projectDraft.goal;

    return {
      ...session,
      updatedAt: now,
      projectDraft: createProjectDraftSnapshot({
        userId: session.userId,
        projectDraftId: session.projectDraftId,
        initialInput: {
          ...session.initialInput,
          projectName,
          goal,
          creationSource: session.projectDraft?.creationSource ?? "onboarding-session",
        },
        existingProjectDraft: {
          ...session.projectDraft,
          state: {
            ...session.projectDraft.state,
            businessGoal: goal,
          },
        },
      }),
    };
  }

  createIntakeUpdateHandler({ session, payload, now }) {
    const intake = this.createProjectIntake({
      visionText: payload.visionText ?? session.projectIntake?.visionText ?? session.projectDraft.goal,
      uploadedFiles: payload.uploadedFiles ?? [],
      externalLinks: payload.externalLinks ?? [],
    });
    const resolved = resolveOnboardingSteps({
      onboardingSession: session,
      projectIntake: intake.projectIntake,
    });

    return {
      ...session,
      updatedAt: now,
      currentStep: resolved.currentStep,
      nextStep: resolved.nextStep,
      requiredActions: resolved.requiredActions,
      projectIntake: intake.projectIntake,
      projectDraft: createProjectDraftSnapshot({
        userId: session.userId,
        projectDraftId: session.projectDraftId,
        initialInput: {
          ...session.initialInput,
          projectName: intake.projectIntake.projectName ?? session.projectDraft.name,
          goal: intake.projectIntake.visionText || session.projectDraft.goal,
          attachments: intake.projectIntake.uploadedFiles,
          links: intake.projectIntake.externalLinks,
          requestedDeliverables: intake.projectIntake.requestedDeliverables,
          creationSource: session.projectDraft?.creationSource ?? "onboarding-session",
        },
        existingProjectDraft: {
          ...session.projectDraft,
          state: {
            ...session.projectDraft.state,
            businessGoal: intake.projectIntake.visionText || session.projectDraft.state.businessGoal,
            knowledge: {
              ...(session.projectDraft.state.knowledge ?? {}),
              knownGaps: intake.missingInputs,
            },
          },
        },
      }),
    };
  }

  createRepoConnectionHandler({ session, payload, now }) {
    return {
      ...session,
      updatedAt: now,
      connectedSources: {
        ...session.connectedSources,
        repo: {
          provider: payload.provider ?? "unknown",
          repoUrl: payload.repoUrl ?? null,
          owner: payload.owner ?? null,
          repo: payload.repo ?? null,
        },
      },
    };
  }

  createApprovalCaptureHandler({ session, payload, now }) {
    const approvalLabel = typeof payload.choice === "string" ? payload.choice.trim() : null;

    return {
      ...session,
      updatedAt: now,
      approvals: approvalLabel ? appendUnique(session.approvals, approvalLabel) : session.approvals,
    };
  }

  createOnboardingStepAdvancementHandler({ session, now }) {
    const projectIntake = session.projectIntake ?? buildProjectIntake({
      visionText: session.projectDraft.goal,
      uploadedFiles: [],
      externalLinks: [],
    });
    const resolved = resolveOnboardingSteps({
      onboardingSession: session,
      projectIntake,
    });

    return {
      ...session,
      updatedAt: now,
      currentStep: resolved.nextStep ?? resolved.currentStep,
      nextStep: resolved.nextStep,
      requiredActions: resolved.requiredActions,
      projectIntake,
    };
  }

  createOnboardingCommandResultEnvelope({ actionType, actionSchema, updatedSession }) {
    return {
      updatedSession,
      projectDraft: updatedSession.projectDraft,
      commandMetadata: {
        actionType,
        actionSchema,
      },
    };
  }

  resolveAction(actionType, payload = {}) {
    const resolvedHandler = this.actionRegistry[actionType] ?? null;
    if (!resolvedHandler) {
      return null;
    }

    return {
      resolvedHandler,
      actionSchema: resolvedHandler.actionSchema,
      isValid: validatePayload(payload, resolvedHandler.actionSchema),
    };
  }

  handleCommand({ sessionId, actionType, payload = {} }) {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    const now = new Date().toISOString();
    const action = this.resolveAction(actionType, payload);
    if (!action || !action.isValid) {
      return null;
    }

    const updatedSession = action.resolvedHandler.handler({
      session,
      payload,
      now,
    });

    this.sessions.set(sessionId, updatedSession);
    return this.createOnboardingCommandResultEnvelope({
      actionType,
      actionSchema: action.actionSchema,
      updatedSession,
    });
  }

  updateIntake({ sessionId, visionText, uploadedFiles = [], externalLinks = [] }) {
    return this.handleCommand({
      sessionId,
      actionType: "upload-spec",
      payload: {
        visionText,
        uploadedFiles,
        externalLinks,
      },
    });
  }

  uploadFiles({ sessionId, uploadedFiles = [] }) {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    return this.handleCommand({
      sessionId,
      actionType: "upload-spec",
      payload: {
        visionText: session.projectIntake?.visionText ?? session.projectDraft.goal,
        uploadedFiles: [...(session.projectIntake?.uploadedFiles ?? []), ...uploadedFiles],
        externalLinks: session.projectIntake?.externalLinks ?? [],
      },
    });
  }

  getCurrentStep(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    return {
      sessionId: session.sessionId,
      currentStep: session.currentStep,
      nextStep: session.nextStep ?? null,
      requiredActions: session.requiredActions ?? [],
    };
  }

  finishSession(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    const finishedSession = {
      ...session,
      status: "completed",
      currentStep: "completed",
      nextStep: null,
      updatedAt: new Date().toISOString(),
    };

    this.sessions.set(sessionId, finishedSession);
    return {
      updatedSession: finishedSession,
      projectDraft: finishedSession.projectDraft,
    };
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId) ?? null;
  }

  listSessions() {
    return [...this.sessions.values()];
  }
}
