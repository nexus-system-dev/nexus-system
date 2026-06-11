import { defineProjectDraftSchema } from "./project-draft-schema.js";
import { resolveCanonicalProductClass } from "../../web/shared/product-class-model.js";
import {
  buildInferredStructureLine,
  buildMeaningfulMissingItems,
  createLearningGuidedOnboardingContext,
  hasLearningGuidedSufficientUnderstanding,
  isGenericAudienceAnswer,
  isGenericProblemAnswer,
  resolveCanonicalOnboardingAnswers,
  resolveConversationBehaviorMode,
  resolveLearningGuidedOnboardingDecision,
  resolveSafeInferredDefaults,
  resolveStrongestCoreIdea,
} from "../../web/shared/learning-guided-onboarding.js";
import {
  createOnboardingProviderRuntime,
  decorateProviderBackedAiEntry,
  listOnboardingAgentProviders,
  listOnboardingIntelligenceLevels,
  listOnboardingModelFamilies,
  resolveOnboardingAgentProvider,
  resolveOnboardingIntelligenceLevel,
  resolveOnboardingModelFamily,
} from "../../web/shared/onboarding-provider-runtime.js";
import { createProjectDiscoveryAgentState } from "../../web/shared/project-discovery-agent.js";
import { OnboardingProviderClient } from "./onboarding-provider-client.js";

function toSlug(value, fallback = "project-draft") {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;
}

let onboardingSessionSequence = 0;

function createSessionId(projectDraftId) {
  onboardingSessionSequence += 1;
  return `onboarding-${projectDraftId}-${Date.now()}-${onboardingSessionSequence}`;
}

function parseInitialInput(initialInput) {
  if (typeof initialInput === "string") {
    return {
      raw: initialInput,
      projectName: null,
      goal: initialInput.trim(),
      attachments: [],
      links: [],
      learningContext: null,
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
    providerChoice: normalizeString(payload.providerChoice ?? payload.selectedProviderId, "openai").toLowerCase(),
    modelFamilyId: normalizeString(payload.modelFamilyId ?? payload.selectedModelFamilyId, "fast").toLowerCase(),
    intelligenceLevel: normalizeString(payload.intelligenceLevel ?? payload.selectedIntelligenceLevel, "low").toLowerCase(),
    qaAvailabilityOverrides: normalizeProviderAvailabilityOverrides(payload.qaAvailabilityOverrides),
    learningContext: payload.learningContext && typeof payload.learningContext === "object"
      ? payload.learningContext
      : null,
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

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeProviderAvailabilityOverrides(value) {
  const source = normalizeObject(value);
  return Object.fromEntries(
    Object.entries(source)
      .map(([providerId, entry]) => {
        const normalizedProviderId = normalizeString(providerId, "").toLowerCase();
        if (!normalizedProviderId) {
          return null;
        }
        if (typeof entry === "string") {
          const normalizedStatus = normalizeString(entry, "");
          if (!normalizedStatus) {
            return null;
          }
          return [normalizedProviderId, {
            availabilityStatus: normalizedStatus,
            availabilityReason: normalizedStatus,
          }];
        }
        const normalizedEntry = normalizeObject(entry);
        const availabilityStatus = normalizeString(normalizedEntry.availabilityStatus, "");
        if (!availabilityStatus) {
          return null;
        }
        return [normalizedProviderId, {
          availabilityStatus,
          availabilityReason: normalizeString(normalizedEntry.availabilityReason, availabilityStatus),
        }];
      })
      .filter(Boolean),
  );
}

function resolveSessionProviderAvailabilityOverrides(session = {}) {
  return normalizeProviderAvailabilityOverrides(session?.initialInput?.qaAvailabilityOverrides);
}

function buildProviderAvailabilityList(overrides = {}) {
  const normalizedOverrides = normalizeProviderAvailabilityOverrides(overrides);
  return listOnboardingAgentProviders().map((provider) => {
    const keyName = provider.providerId === "openai" ? "OPENAI_API_KEY" : provider.providerId === "anthropic" ? "ANTHROPIC_API_KEY" : null;
    const hasKey = keyName ? Boolean(process.env[keyName]) : false;
    const override = normalizeObject(normalizedOverrides[provider.providerId]);
    const overrideStatus = normalizeString(override.availabilityStatus, "");
    const availabilityStatus = overrideStatus || (hasKey ? "ready" : "missing-key");
    const availabilityReason = availabilityStatus === "ready"
      ? null
      : normalizeString(
        override.availabilityReason,
        hasKey ? availabilityStatus : keyName,
      );
    return {
      ...provider,
      availabilityStatus,
      availabilityReason,
      disabled: availabilityStatus !== "ready",
    };
  });
}

function buildModelAvailabilityList(providerId = "openai", availabilityStatus = "ready") {
  return listOnboardingModelFamilies(providerId).map((family) => ({
    ...family,
    availabilityStatus,
    disabled: availabilityStatus !== "ready",
    availabilityReason: availabilityStatus === "ready" ? null : availabilityStatus,
  }));
}

function buildIntelligenceAvailabilityList() {
  return listOnboardingIntelligenceLevels().map((level) => ({
    ...level,
    availabilityStatus: "ready",
    disabled: false,
    availabilityReason: null,
  }));
}

function buildResolvedProviderAvailabilityList(providerExecution = {}, overrides = {}) {
  const storedProviders = Array.isArray(providerExecution.availableProviders)
    ? providerExecution.availableProviders
    : [];
  const lastError = normalizeObject(providerExecution.lastError);
  const failedProviderIds = new Set();
  if (providerExecution.deliveryMode === "degraded-shell") {
    normalizeArray(lastError.recoveryTrail).forEach((entry) => {
      if (normalizeString(entry?.status) === "failed" || normalizeString(entry?.status) === "unavailable") {
        const providerId = normalizeString(entry?.providerId, "");
        if (providerId) {
          failedProviderIds.add(providerId);
        }
      }
    });
    [lastError.providerId, lastError.initialProviderId, lastError.finalProviderId].forEach((providerId) => {
      const normalizedProviderId = normalizeString(providerId, "");
      if (normalizedProviderId) {
        failedProviderIds.add(normalizedProviderId);
      }
    });
  }
  return buildProviderAvailabilityList(overrides).map((provider) => {
    const storedProvider = storedProviders.find((candidate) => candidate?.providerId === provider.providerId);
    const providerFailed = failedProviderIds.has(provider.providerId);
    const failureReason = normalizeString(
      lastError.code ?? lastError.errorClass ?? lastError.degradedReason,
      "provider-error",
    );
    return {
      ...storedProvider,
      ...provider,
      ...(providerFailed && provider.availabilityStatus === "ready"
        ? {
            availabilityStatus: "degraded",
            availabilityReason: failureReason,
            disabled: true,
          }
        : {}),
    };
  });
}

function resolveSelectedModelFamily(session = {}) {
  const selectedProviderId = session?.providerRuntime?.selectedProviderId
    ?? session?.initialInput?.providerChoice
    ?? "openai";
  return resolveOnboardingModelFamily(
    selectedProviderId,
    session?.providerRuntime?.selectedModelFamilyId
      ?? session?.initialInput?.modelFamilyId
      ?? "fast",
  );
}

function resolveSelectedIntelligenceLevel(session = {}) {
  return resolveOnboardingIntelligenceLevel(
    session?.providerRuntime?.selectedIntelligenceLevel
      ?? session?.initialInput?.intelligenceLevel
      ?? "low",
  );
}

function createInitialProviderExecutionState(availabilityOverrides = {}) {
  return {
    deliveryMode: "shell",
    availableProviders: buildProviderAvailabilityList(availabilityOverrides),
    lastCall: null,
    lastError: null,
    healthStatus: "standby",
    recoveryTotals: {
      retryCount: 0,
      failoverCount: 0,
    },
    usageTotals: {
      requestCount: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    },
    costTotals: {
      estimatedCostUsd: 0,
      pricedCallCount: 0,
      pricingSource: "bundled-estimate",
    },
  };
}

function resolveProviderAvailability(providerExecution = {}, providerId = "openai", overrides = {}) {
  const providers = buildResolvedProviderAvailabilityList(providerExecution, overrides);
  return providers.find((provider) => provider.providerId === providerId)
    ?? {
      providerId,
      availabilityStatus: "unsupported",
      availabilityReason: "unsupported-provider",
      disabled: true,
    };
}

function createProviderExecutionFromResult(providerExecution = {}, result = {}) {
  const previousTotals = providerExecution.usageTotals ?? {
    requestCount: 0,
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
  };
  const previousCostTotals = providerExecution.costTotals ?? {
    estimatedCostUsd: 0,
    pricedCallCount: 0,
    pricingSource: "bundled-estimate",
  };

  if (result.status === "completed") {
    const recoveryTrail = Array.isArray(result.recoveryTrail) ? result.recoveryTrail : [];
    const retryCount = recoveryTrail.reduce((total, entry) => {
      const attempts = Array.isArray(entry?.attempts) ? entry.attempts.length : 0;
      return total + Math.max(0, attempts - 1);
    }, 0);
    const failoverCount = Math.max(0, recoveryTrail.length - 1);
    const estimatedCostUsd = Number.isFinite(Number(result.estimatedCostUsd))
      ? Number(result.estimatedCostUsd)
      : null;
    return {
      ...providerExecution,
      deliveryMode: "live-api",
      healthStatus: "healthy",
      lastError: null,
      lastCall: {
        providerId: result.finalProviderId ?? result.providerId,
        initialProviderId: result.initialProviderId ?? result.providerId,
        finalProviderId: result.finalProviderId ?? result.providerId,
        model: result.model ?? null,
        requestId: result.requestId ?? null,
        usage: result.usage ?? null,
        attempts: result.attempts ?? [],
        recoveredByRetry: result.recoveredByRetry === true,
        failedOver: result.failedOver === true,
        recoveryTrail,
        estimatedCostUsd,
        pricingSource: result.pricingSource ?? previousCostTotals.pricingSource ?? "bundled-estimate",
        calledAt: new Date().toISOString(),
      },
      recoveryTotals: {
        retryCount: Number(providerExecution.recoveryTotals?.retryCount ?? 0) + retryCount,
        failoverCount: Number(providerExecution.recoveryTotals?.failoverCount ?? 0) + failoverCount,
      },
      usageTotals: {
        requestCount: previousTotals.requestCount + 1,
        inputTokens: previousTotals.inputTokens + Number(result.usage?.inputTokens ?? 0),
        outputTokens: previousTotals.outputTokens + Number(result.usage?.outputTokens ?? 0),
        totalTokens: previousTotals.totalTokens + Number(result.usage?.totalTokens ?? 0),
      },
      costTotals: {
        estimatedCostUsd: Number((previousCostTotals.estimatedCostUsd + Number(estimatedCostUsd ?? 0)).toFixed(6)),
        pricedCallCount: previousCostTotals.pricedCallCount + (estimatedCostUsd !== null ? 1 : 0),
        pricingSource: result.pricingSource ?? previousCostTotals.pricingSource ?? "bundled-estimate",
      },
    };
  }

  if (result.status === "failed") {
    return {
      ...providerExecution,
      deliveryMode: "degraded-shell",
      healthStatus: "degraded",
      lastError: {
        providerId: result.finalProviderId ?? result.providerId,
        initialProviderId: result.initialProviderId ?? result.providerId ?? null,
        finalProviderId: result.finalProviderId ?? result.providerId ?? null,
        code: result.error?.code ?? "provider_error",
        status: result.error?.status ?? null,
        errorClass: result.error?.errorClass ?? "provider-error",
        retryable: result.error?.retryable === true,
        retryAfterSeconds: Number.isFinite(Number(result.error?.retryAfterSeconds))
          ? Number(result.error.retryAfterSeconds)
          : null,
        degradedReason: result.error?.degradedReason ?? "provider-error",
        recoveryTrail: result.recoveryTrail ?? [],
        calledAt: new Date().toISOString(),
      },
    };
  }

  return providerExecution;
}

function extractProjectName(visionText = "") {
  const fromTitle = visionText.match(/^(?:שם הפרויקט|project name)\s*[:\-]\s*(.+)$/im);
  return fromTitle?.[1]?.trim() ?? null;
}

function detectProjectType(text) {
  return resolveCanonicalProductClass({
    texts: [text],
    fallback: "unknown",
  }).productClass;
}

function detectProjectTypeFromInputs({ visionText = "", uploadedFiles = [], externalLinks = [] } = {}) {
  const normalizedFiles = normalizeUploadedFiles(uploadedFiles);
  const normalizedLinks = normalizeExternalLinks(externalLinks);
  const uploadedMaterialText = normalizedFiles
    .flatMap((file) => [file.name, file.type, file.content])
    .filter((value) => typeof value === "string" && value.trim())
    .join("\n");
  const combinedSignals = [
    visionText,
    uploadedMaterialText,
    normalizedLinks.join("\n"),
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .join("\n");

  const directDetection = detectProjectType(combinedSignals);
  if (directDetection !== "unknown") {
    return directDetection;
  }

  return resolveCanonicalProductClass({
    texts: [combinedSignals],
    fallback: "unknown",
  }).productClass;
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

function buildProjectIntake({ projectName = "", visionText = "", uploadedFiles = [], externalLinks = [] }) {
  const normalizedFiles = normalizeUploadedFiles(uploadedFiles);
  const normalizedLinks = normalizeExternalLinks(externalLinks);
  const normalizedProjectName = typeof projectName === "string" && projectName.trim()
    ? projectName.trim()
    : extractProjectName(visionText);
  const projectType = detectProjectTypeFromInputs({
    visionText,
    uploadedFiles: normalizedFiles,
    externalLinks: normalizedLinks,
  });
  const requestedDeliverables = detectRequestedDeliverables(visionText, normalizedFiles, normalizedLinks);

  return {
    projectName: normalizedProjectName,
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

const onboardingAgentQuestionDefinitions = {
  "core-idea": {
    id: "core-idea",
    title: "מה הרעיון שיש לך בראש?",
    placeholder: "לדוגמה: אני רוצה כלי שמסדר למשלוחים ולעדכוני לקוח את כל הבלגן שנופל היום בין WhatsApp, טלפונים וגיליונות",
  },
  "target-audience": {
    id: "target-audience",
    title: "מי הבן אדם שבאמת צריך את זה?",
    placeholder: "לדוגמה: בעלי קליניקות קטנות שמנהלים ידנית כל ליד, או צוות תפעול שחי בתוך תור עבודה עמוס",
  },
  "project-class": {
    id: "project-class",
    title: "לפני שממשיכים, מה הדבר המרכזי שאתה בונה כאן?",
    placeholder: "לדוגמה: דף נחיתה שיווקי / כלי פנימי לצוות / מוצר SaaS קטן",
  },
  "audience-clarification": {
    id: "audience-clarification",
    title: "התשובה עדיין כללית מדי. מי המשתמש המדויק ומה סוג העסק או הצוות שהוא מייצג?",
    placeholder: "לדוגמה: בעלי קליניקות פרטיות שמנסים להחזיר לידים מהר בלי אנשי מכירות",
  },
  "core-problem": {
    id: "core-problem",
    title: "מה הבעיה המרכזית שהם מתמודדים איתה?",
    placeholder: "לדוגמה: קשה להם לנהל לקוחות ולעקוב אחרי מכירות",
  },
  "workflow-detail": {
    id: "workflow-detail",
    title: "אני רוצה להבין את הזרימה בפועל. איך זה עובד היום מהרגע שהקרטון מגיע ועד שהכתובת מופיעה על המפה?",
    placeholder: "לדוגמה: השליח מקבל קרטונים מודפסים, סורק כתובת מכל קרטון, והאפליקציה שמה נעץ על המפה ומסדרת את העצירות",
  },
  "problem-clarification": {
    id: "problem-clarification",
    title: "זה עדיין כללי מדי. מה נשבר בפועל אצלם ובאיזה רגע ביום העבודה?",
    placeholder: "לדוגמה: לידים נכנסים אבל אף אחד לא חוזר אליהם בזמן ולכן הם נעלמים בין שיחות ו-WhatsApp",
  },
  "successful-solution": {
    id: "successful-solution",
    title: "איך נראה פתרון מוצלח מבחינתם?",
    placeholder: "לדוגמה: כלי לקוחות פשוט ונוח עם התראות",
  },
  "build-direction": {
    id: "build-direction",
    title: "כשהמשתמש פותח את זה בפעם הראשונה, מה חייב להיות ברור או אפשרי מיד כדי שזה באמת יעזור לו?",
    placeholder: "לדוגמה: שההבטחה הראשית, הוכחת האמון וה־CTA יבלטו מיד בלי לבלבל את המשתמש",
  },
};

function resolveSessionLearningContext(session) {
  const intake = normalizeObject(session?.projectIntake);
  const initialLearningContext = normalizeObject(session?.learningContext ?? session?.initialInput?.learningContext);
  return createLearningGuidedOnboardingContext({
    learningDecisionImpact: initialLearningContext.learningDecisionImpact ?? null,
    generationIntent: initialLearningContext.generationIntent ?? null,
    projectTypeHint: intake.projectType ?? "",
    visionText: intake.visionText ?? session?.projectDraft?.goal ?? session?.initialInput?.goal ?? "",
  });
}

function resolveQuestionPresentation(session, questionId) {
  const question = getOnboardingQuestionDefinition(questionId);
  if (!question) {
    return null;
  }

  const projectType = resolveConversationProjectType(session);
  const answers = session?.conversation?.answers ?? {};
  const domain = resolveConversationClassification(session, answers).domain ?? detectConversationDomain(session, answers);
  const { coreIdea, audience, problem } = resolveCanonicalOnboardingAnswers(answers);

  if (questionId === "core-idea") {
    return {
      title: "מה הרעיון שיש לך בראש?",
      placeholder: "לדוגמה: אם זה היה קיים היום, הוא היה עוזר לצוות לדעת מה דחוף עכשיו, למי לחזור, ומה הפעולה הבאה בלי לרדוף אחרי הודעות וקבצים",
    };
  }

  if (questionId === "target-audience") {
    if (domain === "delivery-logistics") {
      return {
        title: "מי משתמש בזה בפועל — שליח בשטח, מנהל מסלולים, או מישהו במוקד?",
        placeholder: "לדוגמה: שליחים בשטח שסורקים קרטונים, או מנהל מסלולים שרוצה לראות את כל הכתובות על מפה אחת",
      };
    }
    if (domain === "commerce-storefront") {
      return {
        title: "אוקיי, אז אני כבר מבין שמדובר בחנות אונליין לסלולרים ואביזרים עם קטלוג, עגלת קניות, סליקה, מלאי, משלוחים ואזור ניהול בסיסי. מה אתה רוצה לדייק קודם — את חוויית הלקוח שבוחר וקונה, או את הצד של בעל העסק שמנהל קטלוג, מלאי והזמנות?",
        placeholder: "לדוגמה: קודם חוויית הבחירה והקנייה של הלקוח, או קודם הצד של בעל העסק שמנהל את המסחר והתפעול",
      };
    }
    if (domain === "marketplace") {
      return {
        title: "מי שני הצדדים במערכת הזאת, ומי מהם הכי חשוב להבין קודם כדי שהמוצר לא ילך לכיוון לא נכון?",
        placeholder: "לדוגמה: בעלי מקצוע בצד אחד ולקוחות שמחפשים אותם בצד השני, וקודם חשוב לי לפתור את הצד של בעלי המקצוע",
      };
    }
    if (domain === "booking-scheduling") {
      return {
        title: "מי מזמין פה בפועל, ומי מקבל את ההזמנה או מנהל את הזמינות?",
        placeholder: "לדוגמה: מטופל שמזמין תור דרך האתר, ומנהלת הקליניקה או המטפל שמקבלים את ההזמנה",
      };
    }
    if (domain === "crm-followup") {
      return {
        title: "מי מחזיק את הלידים או הלקוחות בפועל ביום-יום?",
        placeholder: "לדוגמה: איש מכירות, מנהל קשרי לקוחות, או בעל העסק עצמו שחוזר ידנית לכל ליד",
      };
    }
    if (domain === "services-content") {
      return {
        title: "מי הבן אדם שבאמת קונה או משאיר פנייה לשירות, לליווי או לתוכן הזה?",
        placeholder: "לדוגמה: בעלי עסקים קטנים שקונים תוכנית ליווי, או הורים שמחפשים קורס דיגיטלי עם פגישות",
      };
    }
    if (domain === "admin-dashboard") {
      return {
        title: "מי פותח את הדשבורד הזה ביום-יום, ובשביל איזו החלטה הוא צריך אותו?",
        placeholder: "לדוגמה: מנהל תפעול שצריך לזהות חריגות בזמן אמת ולהחליט איפה להתערב קודם",
      };
    }
    if (projectType === "landing-page") {
      return {
        title: "מי הבן אדם שבאמת צריך את הדף הזה?",
        placeholder: "לדוגמה: עצמאים שרוצים יותר פניות בלי שיחת מכירה ארוכה",
      };
    }
    if (projectType === "mobile-app") {
      return {
        title: "מי הבן אדם שבאמת יפתח את האפליקציה הזאת הכי הרבה?",
        placeholder: "לדוגמה: הורים עובדים שצריכים להבין מהר מה קורה היום",
      };
    }
    if (projectType === "internal-tool") {
      return {
        title: "מי הבן אדם או הצוות שבאמת יחיה בתוך הכלי הזה כל יום?",
        placeholder: "לדוגמה: צוות תפעול ושירות שצריך לראות תור עבודה ברור",
      };
    }
    if (projectType === "commerce-ops") {
      return {
        title: "מי הבן אדם או הצוות שבאמת צריך את מרכז המסחר הזה ביום-יום?",
        placeholder: "לדוגמה: צוות מסחר ותפעול שמחזיק קטלוג, הזמנות ותוכן",
      };
    }
    if (projectType === "saas") {
      return {
        title: "מי הבן אדם שבאמת צריך את המוצר הזה ביום-יום?",
        placeholder: "לדוגמה: מאמנים עצמאיים שמנהלים לקוחות וחידושי מנוי",
      };
    }
  }

  if (questionId === "audience-clarification") {
    if (domain === "delivery-logistics") {
      return {
        title: "אני עדיין לא בטוח מי המשתמש המרכזי כאן. מי באמת עובד עם זה ביום-יום — שליח, סדרן, מנהל מסלולים, או צוות לוגיסטיקה?",
        placeholder: "לדוגמה: שליח יחיד בשטח, או צוות תפעול שרואה עשרות כתובות וצריך לסדר אותן למסלול",
      };
    }
    if (domain === "commerce-storefront") {
      return {
        title: "כשאתה אומר 'לקוח שלי', אתה מתכוון לבעל העסק שמוכר באתר, או ללקוח הקצה שקונה ממנו? ומי מהם הכי חשוב כרגע?",
        placeholder: "לדוגמה: קודם בעל העסק שמנהל את הקטלוג וההזמנות, ורק אחר כך חוויית הלקוח הקונה",
      };
    }
    if (domain === "marketplace") {
      return {
        title: "התשובה עדיין כללית מדי. מי שני הצדדים פה באמת, ומי מהם אתה חייב לשרת קודם כדי שהמערכת תתחיל לעבוד?",
        placeholder: "לדוגמה: קודם בעלי המקצוע שפותחים כרטיס, ורק אחר כך הלקוחות שמחפשים אותם",
      };
    }
    if (domain === "booking-scheduling") {
      return {
        title: "התשובה עדיין כללית מדי. מי מזמין בפועל, מי מקבל את ההזמנה, ומי חי בתוך הזמינות לאורך היום?",
        placeholder: "לדוגמה: מטופל שמזמין תור, ומזכירה או מטפל שמנהלים את הזמינות והאישורים",
      };
    }
    if (domain === "crm-followup") {
      return {
        title: "התשובה עדיין כללית מדי. מי מחזיק את הליד או הלקוח בפועל, ומי אחראי שה־follow-up באמת יקרה בזמן?",
        placeholder: "לדוגמה: איש מכירות שמחזיק בעלות על הליד, או בעל העסק שחוזר בעצמו לכל פנייה",
      };
    }
    if (domain === "services-content") {
      return {
        title: "כשאתה אומר 'לקוחות שלי', אתה מתכוון לאנשים שקונים את הליווי או התוכן, או לעסק שמוכר אותו? ומי מהם הכי חשוב כרגע?",
        placeholder: "לדוגמה: קודם האנשים שקונים את תוכנית הליווי, ורק אחר כך הצד של העסק שמנהל את המכירה",
      };
    }
    if (domain === "admin-dashboard") {
      return {
        title: "התשובה עדיין כללית מדי. מי פותח את הדשבורד בפועל, ועל איזו החלטה הוא מסתכל שם כל יום?",
        placeholder: "לדוגמה: מנהל תפעול שמסתכל על חריגות ומשייך טיפול לצוות",
      };
    }
    if (projectType === "landing-page") {
      return {
        title: "התשובה עדיין כללית מדי. איזה סוג עסק בדיוק צריך את הדף, מי מקבל את ההחלטה, ומה גורם לו להשאיר ליד?",
        placeholder: "לדוגמה: בעלי קליניקות פרטיות שמקבלים לידים אבל לא מצליחים להפוך אותם לשיחת ייעוץ",
      };
    }
    if (projectType === "internal-tool") {
      return {
        title: "התשובה עדיין כללית מדי. איזה צוות בדיוק עובד עם הכלי, מי הבעלים של התור, ומה קורה במשמרת רגילה?",
        placeholder: "לדוגמה: צוות שירות של 12 נציגים שמחלק פניות בין נציגים ומשמרות",
      };
    }
    if (projectType === "commerce-ops") {
      return {
        title: "התשובה עדיין כללית מדי. איזה צוות מסחר בדיוק עובד כאן, מי מחזיק הזמנות או מלאי, ומה הפעולה היומית הקריטית?",
        placeholder: "לדוגמה: צוות מסחר שמנהל קטלוג, הזמנות ומלאי עבור חנות אונליין עם 4 עורכים ו-2 אנשי תפעול",
      };
    }
    if (projectType === "mobile-app") {
      return {
        title: "התשובה עדיין כללית מדי. מי המשתמש המדויק באפליקציה, ובאיזה רגע ביום הוא חייב לפתוח אותה?",
        placeholder: "לדוגמה: הורים עובדים שפותחים את האפליקציה כל בוקר כדי להבין מה השתנה עבור הילד",
      };
    }
    return {
      title: "התשובה עדיין כללית מדי. איזה סוג עסק או צוות בדיוק משתמש במוצר, מי המשתמש המרכזי, ומה הוא מנסה להשיג ביום רגיל?",
      placeholder: "לדוגמה: בעלי קליניקות קטנות שמנהלים לידים וחוזרים ידנית לכל פנייה",
    };
  }

  if (questionId === "project-class") {
    if (domain === "delivery-logistics") {
      return {
        title: "אני לא מחפש כאן קטגוריה שיווקית. רק רוצה לוודא: אתה מדבר על אפליקציית משלוחים/לוגיסטיקה שעוזרת לעבוד עם כתובות ומסלולים, נכון?",
        placeholder: "לדוגמה: כן, זו אפליקציה לשליחים / כן, זה כלי לצוות לוגיסטי / לא, זה בכלל כיוון אחר",
      };
    }
    if (domain === "commerce-storefront") {
      return {
        title: "זה כבר נשמע כמו אתר מכירתי, לא דף שיווקי רגיל. אני רק רוצה לדייק: בגרסה הראשונה המטרה היא קנייה מלאה באתר, או קטלוג + יצירת הזמנה?",
        placeholder: "לדוגמה: קנייה מלאה עם סליקה, או קודם קטלוג והזמנה דרך WhatsApp / טופס",
      };
    }
    return {
      title: "יש פה כמה כיוונים אפשריים. מה הדבר המרכזי שאתה בונה כאן: דף נחיתה, מערכת מסחר תפעולית, כלי פנימי, או מוצר SaaS קטן?",
      placeholder: "לדוגמה: דף נחיתה / מערכת מסחר תפעולית / כלי פנימי לצוות / מוצר SaaS קטן",
    };
  }

  if (questionId === "core-problem") {
    if (projectType === "landing-page") {
      return {
        title: question.title,
        placeholder: "לדוגמה: המבקרים לא מבינים מהר למה לבחור בי ולכן לא משאירים פרטים",
      };
    }
    if (domain === "delivery-logistics") {
      return {
        title: "היום איך הכתובות מגיעות אליו, ומה הכי נשבר שם בפועל?",
        placeholder: "לדוגמה: הכתובות מודפסות על הקרטונים, השליח מקליד ידנית, ויש טעויות או בזבוז זמן עד שרואים הכל על המפה",
      };
    }
    if (domain === "commerce-storefront" && audience) {
      return {
        title: `מעולה. אם כרגע הפוקוס הוא ${resolveAudienceFocusReference(audience)}, אני כבר מניח storefront בסיסי שעושה קטלוג, סליקה, מלאי ומשלוחים. מה הכאב שבאמת מצדיק לבנות את זה עכשיו — חוויית הבחירה והקנייה, או התפעול של מחירים, מלאי והזמנות?`,
        placeholder: "לדוגמה: אנשים לא בטוחים איזה מכשיר לקנות, או שבעל העסק מאבד שליטה על מחירים, מלאי והזמנות כי הכל ידני",
      };
    }
    if (domain === "marketplace") {
      return {
        title: `מעולה. אם כרגע אנחנו בונים זירה שמחברת בין שני צדדים, אני כבר מניח פרופילים, חיפוש בסיסי ופנייה ראשונה. מה נשבר היום באמת — מציאת התאמה, יצירת אמון, תמחור, או סגירת עסקה?`,
        placeholder: "לדוגמה: הלקוחות לא יודעים במי לבחור, ובעלי המקצוע מקבלים פניות לא מתאימות בלי דרך טובה לסנן או לתמחר",
      };
    }
    if (domain === "booking-scheduling") {
      return {
        title: `מעולה. אם כרגע אנחנו מדברים על מערכת תורים, אני כבר מניח בחירת שירות, זמינות, זמן ואישור בסיסי. מה הכי נשבר היום באמת — זמינות, אישור, ביטולים, או התיאום מול הלקוח?`,
        placeholder: "לדוגמה: הלקוחות שולחים הודעות, אין זמינות ברורה, והמזכירה רודפת אחרי תיאומים ידנית",
      };
    }
    if (domain === "crm-followup") {
      return {
        title: `מעולה. אם כרגע אנחנו בונים סביב לידים, בעלות ותזכורות, אני כבר מניח CRM בסיסי עם צעד הבא ברור. איפה המעקב נשבר היום באמת — ליד שנשכח, חידוש שלא קורה בזמן, או חוסר בהירות לגבי הצעד הבא?`,
        placeholder: "לדוגמה: לידים נכנסים, אבל אף אחד לא מחזיק בעלות ברורה על החזרה אליהם והם נופלים בין שיחות ו-WhatsApp",
      };
    }
    if (domain === "services-content") {
      return {
        title: `מעולה. אם כרגע אנחנו מדברים על שירות או תוכן שנמכרים דרך flow ברור, אני כבר מניח הצעה, אמון, ופנייה או רכישה בסיסית. מה הכי נשבר היום — אמון, הצעה לא ברורה, איסוף פרטים, או המעבר מתוכן לרכישה?`,
        placeholder: "לדוגמה: אנשים מתעניינים אבל לא מבינים מהר מה מקבלים, ואין flow ברור מפנייה או תוכן חינמי לרכישה",
      };
    }
    if (domain === "admin-dashboard") {
      return {
        title: `מעולה. אם כרגע אנחנו בונים דשבורד שמרכז מדדים וחריגות, אני כבר מניח תמונה תפעולית ו-drill-down בסיסי. מה הכי נשבר היום בלי זה — מידע מפוזר, חריגות שמתגלות מאוחר, או חוסר בהירות לגבי מה דחוף עכשיו?`,
        placeholder: "לדוגמה: הנתונים מפוזרים בכמה מערכות, חריגות מתגלות מאוחר, ואף אחד לא רואה בזמן אמת איפה צריך להתערב",
      };
    }
    if (projectType === "internal-tool") {
      return {
        title: `מעולה. אם הכלי נבנה ${resolveAudienceForPhrase(audience, "הצוות")}, אני כבר מניח תור עבודה, בעלות, סטטוס ופעולה הבאה. מה צוואר הבקבוק שבאמת שובר את היום — בעלות לא ברורה, עומסים, SLA, או מעבר מידע בין נציגים?`,
        placeholder: "לדוגמה: פניות נופלות בין נציגים ואין בעלות ברורה על הטיפול",
      };
    }
    if (coreIdea) {
      const ideaLead = audience
        ? `אם הרעיון הוא ${coreIdea} והוא מיועד ${resolveAudienceForPhrase(audience)},`
        : `אם הרעיון הוא ${coreIdea},`;
      return {
        title: `${ideaLead} מה הכי מעצבן או נשבר היום בפועל?`,
        placeholder: projectType === "landing-page"
          ? "לדוגמה: אנשים לא מבינים מהר את הערך ולכן לא משאירים פרטים"
          : "לדוגמה: לידים, משימות או הזמנות נופלים בין אנשים כי אין מסך אחד ברור שמחזיק את העבודה",
      };
    }
    if (projectType === "mobile-app") {
      return {
        title: question.title,
        placeholder: "לדוגמה: קשה להבין מה הצעד הבא ואין מסך ראשון שמסדר את היום",
      };
    }
    if (projectType === "commerce-ops") {
      return {
        title: question.title,
        placeholder: "לדוגמה: הזמנות, מלאי ותוכן לא נפגשים באותו flow ולכן טיפול נמרח ונופל בין בעלי תפקידים",
      };
    }
    if (projectType === "saas") {
      return {
        title: question.title,
        placeholder: "לדוגמה: הם מאבדים מעקב על לקוחות, חידושים והודעות חשובות",
      };
    }
  }

  if (questionId === "problem-clarification") {
    if (domain === "delivery-logistics") {
      return {
        title: "אני צריך רגע את הרגע המדויק שבו זה נשבר. מה קורה היום בין סריקת הכתובת, הזיהוי שלה, והופעה שלה על המפה?",
        placeholder: "לדוגמה: חלק מהכתובות לא מזוהות טוב, השליח צריך לתקן ידנית, ואז המסלול נבנה לא נכון או מתעכב",
      };
    }
    if (domain === "commerce-storefront") {
      return {
        title: `זה עדיין כללי מדי. מה בדיוק נשבר היום אצל ${audience || "המשתמש"} — הקנייה עצמה, הסליקה, המלאי, המחירים, או הטיפול בהזמנה אחרי הרכישה?`,
        placeholder: "לדוגמה: אנשים רוצים לקנות אבל נתקעים בלי מלאי אמין, והצוות מתקן ידנית מחירים והזמנות לאורך היום",
      };
    }
    if (projectType === "landing-page" && audience) {
      return {
        title: `זה עדיין כללי מדי. מה בדיוק קורה אצל ${audience} שגורם לדף הנוכחי לא להמיר?`,
        placeholder: "לדוגמה: הם רואים כמה הצעות יחד, לא מבינים מהר את ההבטחה, ונוטשים לפני השארת פרטים",
      };
    }
    if (projectType === "internal-tool" && audience) {
      return {
        title: `זה עדיין כללי מדי. מה בדיוק נשבר אצל ${audience} בתוך התור או המשמרת היומית?`,
        placeholder: "לדוגמה: פניות חוזרות לאותו לקוח כי אין בעלות ברורה והנציג הבא לא יודע מה קרה קודם",
      };
    }
    if (projectType === "commerce-ops" && audience) {
      return {
        title: `זה עדיין כללי מדי. מה בדיוק נשבר אצל ${audience} בין הזמנות, קטלוג ומלאי?`,
        placeholder: "לדוגמה: מבצעי קטלוג לא מתעדכנים בזמן, הזמנות יוצאות עם מלאי שגוי, ואף אחד לא רואה מה דחוף עכשיו",
      };
    }
    return {
      title: `זה עדיין כללי מדי. מה בדיוק נשבר אצל ${audience || "המשתמש"} ובאיזה רגע זה פוגע בו?`,
      placeholder: "לדוגמה: הליד מגיע, אבל אין בעלות על הטיפול ולכן הוא נופל בין משימות ותזכורות",
    };
  }

  if (questionId === "workflow-detail") {
    if (domain === "marketplace") {
      return {
        title: "אני רוצה להבין את ה-flow הראשון שמחיה את הזירה: מי נרשם או נפתח קודם, איך הצד השני מוצא אותו, ואיפה קורה המעבר מפנייה לעניין אמיתי?",
        placeholder: "לדוגמה: בעל המקצוע פותח כרטיס, הלקוח מחפש ומסנן, שולח בקשה, ורק אחר כך סוגרים מחיר או משלמים",
      };
    }
    if (domain === "booking-scheduling") {
      return {
        title: "אני רוצה להבין את הזרימה בפועל: איך המשתמש בוחר זמן, איך הזמינות נבדקת, ומה קורה אם צריך אישור או שינוי?",
        placeholder: "לדוגמה: המשתמש בוחר טיפול וזמן, המערכת בודקת זמינות בלייב, ואם אין מקום מציעה חלופות או מעבירה לאישור",
      };
    }
    if (domain === "crm-followup") {
      return {
        title: "אני רוצה להבין את ה-flow שבאמת מחזיק את המעקב: מה היחידה שעובדים עליה — ליד, לקוח או עסקה — ואיך נראים הבעלות, התזכורת והצעד הבא ביום רגיל?",
        placeholder: "לדוגמה: ליד נכנס, משויך לאיש מכירות, מופיעה תזכורת לחזרה, ויש timeline שמראה מה כבר קרה ומה צריך לקרות עכשיו",
      };
    }
    if (domain === "services-content") {
      return {
        title: "אני רוצה להבין את המעטפת של ההצעה: המטרה היא רק פנייה, קנייה ישירה, או גם איסוף פרטים לפני התאמה או תשלום?",
        placeholder: "לדוגמה: קודם דף שמוכר את התוכנית, אחר כך טופס התאמה קצר, ואז תשלום או שיחת היכרות",
      };
    }
    if (domain === "admin-dashboard") {
      return {
        title: "אני רוצה להבין את רגע ההחלטה עצמו: אילו מדדים חייבים להיות גלויים מיד, ומה המשתמש אמור לעשות ברגע שהוא רואה חריגה?",
        placeholder: "לדוגמה: לפתוח את הדשבורד בבוקר, לזהות חריגה במשלוחים, ואז לקדוח פנימה ולהקצות טיפול לצוות",
      };
    }
    if (domain === "commerce-storefront") {
      return {
        title: "אני רוצה להבין את מעטפת האתר עצמו: בגרסה הראשונה הלקוח אמור לקנות מיד בלי חשבון, או שחייבים התחברות לפני הזמנה?",
        placeholder: "לדוגמה: קנייה כאורח עם סליקה רגילה, ורק אחר כך חשבון למעקב הזמנה או wishlist",
      };
    }
    return {
      title: "אחרי שהכתובת נסרקת, מה אתה מצפה שיקרה על המפה — רק לשים נעץ, או גם לסדר מסלול ולעזור להחליט מה התחנה הבאה?",
      placeholder: "לדוגמה: קודם לשים את כל הכתובות על המפה, ואז להציע סדר מסלול, עם אפשרות לתקן ידנית כתובת שלא זוהתה טוב",
    };
  }

  if (questionId === "successful-solution") {
    if (domain === "delivery-logistics") {
      return {
        title: "אם זה עובד טוב, מה נהיה הרבה יותר קל לשליח או לצוות?",
        placeholder: "לדוגמה: לא צריך להקליד כתובות, רואים מיד איפה כל משלוח נמצא, וקל לבנות סדר מסלול בלי טעויות",
      };
    }
    if (domain === "commerce-storefront") {
      return {
        title: `אם זה עובד טוב עבור ${audience}, מה חייב להיסגר כבר בגרסה הראשונה — סליקה מלאה, מלאי אמיתי, משלוחים ומעקב, או רק חלק מזה?`,
        placeholder: "לדוגמה: קודם קטלוג, וריאציות, עגלה וסליקה; אחר כך השוואות, wishlist והמלצות חכמות",
      };
    }
    if (domain === "marketplace") {
      return {
        title: "אם זה עובד טוב, מה חייב להרגיש פתור כבר בגרסה הראשונה כדי שהזירה תתחיל לזוז באמת — התאמה בין הצדדים, אמון, בקשת הצעת מחיר, או תשלום בתוך המערכת?",
        placeholder: "לדוגמה: קודם חיפוש טוב, כרטיסים אמינים ובקשת הצעת מחיר; תשלום מלא בתוך המערכת יכול לחכות לשלב הבא",
      };
    }
    if (domain === "booking-scheduling") {
      return {
        title: "אם זה עובד טוב, מה חייב להיסגר כבר בגרסה הראשונה כדי שאנשים יפסיקו לרדוף ידנית אחרי תורים — זמינות בזמן אמת, אישור אוטומטי, תזכורות, או תשלום בזמן ההזמנה?",
        placeholder: "לדוגמה: קודם בחירת שירות וזמן עם זמינות אמיתית, ואז אישור ותזכורות; תשלום אפשר להוסיף אחר כך",
      };
    }
    if (domain === "crm-followup") {
      return {
        title: "אם זה עובד טוב, מה חייב להרגיש פתור כבר בגרסה הראשונה — בעלות ברורה, צעד הבא, תזכורת שלא נופלת, או flow שלם יותר של stages ואוטומציות?",
        placeholder: "לדוגמה: קודם בעלות, תזכורות והצעד הבא; stages ואוטומציות עמוקות יותר יכולות לחכות",
      };
    }
    if (domain === "services-content") {
      return {
        title: "אם זה עובד טוב, מה חייב להיסגר כבר בגרסה הראשונה — אמון, הצעה חדה, פנייה, רכישה ישירה, או תהליך התאמה קצר לפני סגירה?",
        placeholder: "לדוגמה: קודם הצעה ברורה, אמון וטופס התאמה קצר; רכישה מלאה באותו flow יכולה להגיע אחר כך",
      };
    }
    if (domain === "admin-dashboard") {
      return {
        title: "אם זה עובד טוב, מה חייב לקרות כבר בגרסה הראשונה — לראות חריגות בזמן, להבין מה דחוף, או גם להפעיל טיפול ישירות מתוך הדשבורד?",
        placeholder: "לדוגמה: קודם לזהות חריגות ולשייך טיפול; פעולות עמוקות יותר מתוך הדשבורד יכולות להגיע בהמשך",
      };
    }
    if (projectType === "landing-page") {
      return {
        title: question.title,
        placeholder: "לדוגמה: דף ברור עם הבטחה חדה, הוכחת אמון, ו־CTA אחד שקל להבין וללחוץ עליו",
      };
    }
    if (projectType === "mobile-app") {
      return {
        title: question.title,
        placeholder: "לדוגמה: מסך פתיחה ברור, פעולה ראשונה אחת, והמשך נקי למסך הבא",
      };
    }
    if (projectType === "internal-tool") {
      return {
        title: question.title,
        placeholder: "לדוגמה: תור עבודה ברור עם בעלות, סטטוס ופעולה אחת שאפשר לבצע מיד",
      };
    }
    if (projectType === "commerce-ops") {
      return {
        title: question.title,
        placeholder: "לדוגמה: מרכז מסחר אחד שמראה הזמנות דחופות, חריגות קטלוג, בעלות ופעולה הבאה לכל נציג",
      };
    }
    if (projectType === "saas") {
      return {
        title: question.title,
        placeholder: "לדוגמה: לוח לקוחות עם חידושים, תזכורות והפעולה הבאה הכי חשובה",
      };
    }
  }

  if (questionId === "build-direction") {
    if (domain === "delivery-logistics") {
      return {
        title: "כשהשליח או הסדרן פותח את זה בפעם הראשונה, מה חייב להיות ברור לו ישר — מה נסרק, איפה זה על המפה, ומה הצעד הבא?",
        placeholder: "לדוגמה: לראות מיד את הכתובת שנקלטה, את הנעץ על המפה, ואם צריך תיקון ידני או המשך לבניית מסלול",
      };
    }
    if (domain === "commerce-storefront") {
      return {
        title: "כשלקוח נכנס לאתר או לדף מוצר, מה חייב להיות ברור מיד — שאפשר לקנות עכשיו, שיש מלאי אמיתי, שיש משלוח, או משהו אחר?",
        placeholder: "לדוגמה: מלאי זמין, מחיר ברור, וריאציות מובנות, ואפשרות קנייה בלי להתחיל לחפש איך ממשיכים",
      };
    }
    if (projectType === "landing-page" && audience && problem) {
      return {
        title: `כדי לא לעצור מוקדם מדי ${resolveAudienceForPhrase(audience)}, מה חייב להיות ברור מיד בדף כדי לפתור את ${problem}?`,
        placeholder: "לדוגמה: הבטחה אחת חדה מעל הקפל, הוכחת אמון בולטת, ו־CTA אחד שקל להבין וללחוץ עליו",
      };
    }
    if (projectType === "internal-tool" && audience) {
      return {
        title: `כדי שהכלי באמת יעבוד ${resolveAudienceForPhrase(audience)}, מה חייב להיות ברור מיד במסך הראשון?`,
        placeholder: "לדוגמה: מי בעל התור, מה ה־SLA שנשבר, ומה הפעולה הבאה שהנציג חייב לבצע עכשיו",
      };
    }
    if (projectType === "commerce-ops" && audience) {
      return {
        title: `כדי שהמערכת באמת תעזור ${resolveAudienceForPhrase(audience)}, מה חייב להיות גלוי מיד במרכז המסחר?`,
        placeholder: "לדוגמה: אילו הזמנות דחופות, חריגות מלאי או בעיות קטלוג דורשות טיפול עכשיו ומי מטפל בהן",
      };
    }
    if (projectType === "mobile-app" && audience) {
      return {
        title: `כדי שהאפליקציה באמת תעזור ${resolveAudienceForPhrase(audience)}, מה חייב להיות ברור מיד במסך הראשון?`,
        placeholder: "לדוגמה: מה השתנה היום, מה הפעולה הראשונה, ואיך ממשיכים בלי לחפש בין מסכים",
      };
    }
    return {
      title: `כדי שהמוצר באמת יעזור ${resolveAudienceForPhrase(audience, "המשתמש")}, מה חייב להיות ברור או אפשרי מיד כשהוא נפתח?`,
      placeholder: "לדוגמה: הפעולה הראשונה, הסטטוס הקריטי, או ההבטחה המרכזית שחייבים לבלוט מיד",
    };
  }

  return {
    title: question.title,
    placeholder: question.placeholder,
  };
}

function getOnboardingQuestionDefinition(questionId) {
  return onboardingAgentQuestionDefinitions[questionId] ?? null;
}

function formatConversationTime(date = new Date()) {
  return new Intl.DateTimeFormat("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function detectProjectTypeCandidates(text) {
  const normalized = String(text ?? "").toLowerCase();
  const candidates = new Set();

  if (/(landing page|landing-page|website|marketing site|marketing page|homepage|web site|site|דף נחיתה|אתר שיווקי|שיווק)/i.test(normalized)) {
    candidates.add("landing-page");
  }
  if (/(ecommerce|shop|store|catalog|checkout|cart|order|orders|inventory|merchant|fulfillment|commerce|dispatch|delivery|deliveries|route|routes|driver|drivers|package|packages|address|addresses|logistics|מסחר|קטלוג|הזמנות|מלאי|משלוח|משלוחים|מסלול|מסלולים|שליח|שליחים|חבילה|חבילות|כתובת|כתובות|לוגיסט)/i.test(normalized)) {
    candidates.add("commerce-ops");
  }
  if (/(internal tool|ops|operations|backoffice|back office|admin panel|portal|workspace|queue|dispatch board|operations board|תפעול|צוות פנימי|כלי פנימי|לוח תפעול|לוח שליטה)/i.test(normalized)) {
    candidates.add("internal-tool");
  }
  if (/(saas|subscription|mvp|web app|platform|crm|customer|client|follow-up|reminder|dashboard|מערכת|כלי|לקוחות)/i.test(normalized)) {
    candidates.add("saas");
  }
  if (/(mobile app|react native|expo|ios|android|אפליקציה)/i.test(normalized)) {
    candidates.add("mobile-app");
  }

  return [...candidates];
}

function resolveExplicitProjectTypeSignal(text = "") {
  const normalized = String(text ?? "").toLowerCase();
  if (!normalized) {
    return null;
  }

  if (/(דף נחיתה|landing page|landing-page|אתר שיווקי|marketing page|marketing site)/i.test(normalized)) {
    return "landing-page";
  }
  if (/(כלי פנימי|internal tool|צוות פנימי|backoffice|back office|admin panel|portal|dispatch board|operations board)/i.test(normalized)) {
    return "internal-tool";
  }
  if (/(אפליקציה|mobile app|ios|android|react native|expo)/i.test(normalized)) {
    return "mobile-app";
  }
  if (/(מערכת מסחר|commerce workspace|ecommerce|e-commerce|shop|store|catalog|inventory|merchant|fulfillment)/i.test(normalized)) {
    return "commerce-ops";
  }
  if (/(אתר שמוכר|חנות אונליין|חנות מקוונת|אתר חנות|אתר מכירתי|אתר מסחר|מוכר .*מוצרים|מוכר .*טלפונים|מוכר .*אביזרים)/i.test(normalized)) {
    return "commerce-ops";
  }
  if (/(saas|מוצר saas|web app|crm|dashboard|follow-up)/i.test(normalized)) {
    return "saas";
  }

  return null;
}

function detectConversationDomain(session, answers = {}) {
  const sourceText = [
    session?.projectIntake?.visionText,
    session?.projectDraft?.goal,
    session?.initialInput?.goal,
    typeof answers["core-idea"] === "string" ? answers["core-idea"].trim() : "",
    typeof answers["core-problem"] === "string" ? answers["core-problem"].trim() : "",
    typeof answers["workflow-detail"] === "string" ? answers["workflow-detail"].trim() : "",
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .join("\n")
    .toLowerCase();

  if (/(scan|scanner|scanning|map|address|addresses|route|routes|delivery|deliveries|dispatch|courier|box|boxes|package|packages|לסרוק|סריקה|לסריקה|מפה|כתובת|כתובות|מסלול|מסלולים|משלוח|משלוחים|שליח|שליחים|קרטון|קרטונים|חבילה|חבילות)/i.test(sourceText)) {
    return "delivery-logistics";
  }

  if (/(marketplace|two sided|two-sided|buyer|buyers|seller|sellers|listing|listings|matching|quote request|rfq|מרקטפלייס|זירה|ליסטינג|הצעת מחיר)/iu.test(sourceText) || /(בעלי מקצוע).*(לקוחות|צרכנים|מזמינים)|(לקוחות|צרכנים|מזמינים).*(בעלי מקצוע)/iu.test(sourceText)) {
    return "marketplace";
  }

  if (/(booking|reservation|reservations|appointment|appointments|calendar|availability|slot|slots|schedule|scheduling|תור|תורים|הזמנת תורים|יומן|זמינות|שיבוץ)/iu.test(sourceText)) {
    return "booking-scheduling";
  }

  if (/(crm|lead|leads|follow-up|follow up|pipeline|renewal|renewals|reminder|reminders|sales flow|timeline|stages|ליד|לידים|חידוש|חידושים|פולואפ|פולו אפ|תזכורת|תזכורות|צינור מכירה|שלבי מכירה|טיימליין)/iu.test(sourceText)) {
    return "crm-followup";
  }

  if (/(course|courses|consultation|consultations|service package|service packages|coaching|expertise|קורס|קורסים|תוכנית ליווי|תכנית ליווי|ליווי|ייעוץ|יעוץ|מומחיות)/iu.test(sourceText) || /(מוכר|מכירה|למכור).*(תוכן|קורס|ליווי|ייעוץ)|(תוכן|קורס|ליווי|ייעוץ).*(פגישות|תשלום|רכישה)/iu.test(sourceText)) {
    return "services-content";
  }

  if (/(ecommerce|e-commerce|shop|store|catalog|checkout|cart|inventory|payment|payments|shipping|wishlist|review|reviews|coupon|coupons|variant|variants|compare|comparison|warehouse|invoice|warranty|repair|smart search|חנות|חנות אונליין|חנות מקוונת|אתר שמוכר|אתר מכירתי|קטלוג|עגלה|סליקה|תשלום|תשלומים|מלאי|קופון|קופונים|ביקורות|דירוגים|וריאציות|השוואת|מחסן|חשבוניות|אחריות|תיקונים|טלפון|טלפונים|מכשיר|מכשירים|אביזר|אביזרים)/i.test(sourceText)) {
    return "commerce-storefront";
  }

  if (/(dashboard|dashboards|anomaly|anomalies|metric|metrics|kpi|kpis|monitoring|monitor|operations manager|operations managers|דשבורד|דשבורדים|חריגה|חריגות|מדד|מדדים|ניטור|מנהל תפעול|מנהלי תפעול|בקרה)/iu.test(sourceText)) {
    return "admin-dashboard";
  }

  return "generic";
}

function domainNeedsWorkflowDetail(domain = "generic", projectType = "unknown") {
  if (projectType === "landing-page" || projectType === "internal-tool") {
    return false;
  }
  return [
    "delivery-logistics",
    "commerce-storefront",
    "marketplace",
    "booking-scheduling",
    "crm-followup",
    "services-content",
    "admin-dashboard",
  ].includes(domain);
}

function isLikelyIdeaAnswer(answer = "") {
  const normalized = normalizeString(answer);
  const lowered = normalized.toLowerCase();
  if (!normalized) {
    return false;
  }

  if (normalized.split(/\s+/).filter(Boolean).length < 4) {
    return false;
  }

  if (/^(?:אני רוצה|אני בונה|הרעיון(?:\s+הוא)?|מה שאני רוצה לבנות|צריך לבנות כאן)(?:\s|$)/u.test(normalized)) {
    return true;
  }

  if (/(?:^|\s)(?:אפליקציה|מערכת|מוצר|אתר|דף נחיתה|כלי פנימי)\s+(?:שיודע|שיודעת|שמחבר|שמחברת|שסורק|שסורקת|ששם|ששמה|שמנהל|שמנהלת|שעוזר|שעוזרת|שמביא|שמביאה|שמסדר|שמסדרת)\s/u.test(`${normalized} `)) {
    return true;
  }

  return /if this existed|the idea is|i want to build/i.test(lowered);
}

function isLikelyProductTypeAnswer(answer = "") {
  const normalized = normalizeString(answer).toLowerCase();
  return /^(אפליקציה|app|mobile app|מערכת|tool|כלי|saas|דף נחיתה|landing page|אתר)$/iu.test(normalized);
}

function isQuestionMismatchFeedback(answer = "") {
  const normalized = normalizeString(answer);
  return /לא שאלה שמתאימה|לא שאלה מתאימה|השאלה .*לא מתאימ|זה לא קשור|לא לזה התכוונתי|לא הבנת|זו לא השאלה|זאת לא השאלה/u.test(normalized);
}

function isTermClarificationRequest(answer = "") {
  const normalized = normalizeString(answer);
  return /^מה זה /u.test(normalized)
    || /^מה הכוונה /u.test(normalized)
    || /^לא הבנתי מה זה /u.test(normalized);
}

// AGT-001D — message-intent gate.
// Detects meta-questions aimed at the agent itself ("are you real / bot / scripted / LLM?")
// so that they never get silently dumped into the next product-onboarding slot.
function isAgentMetaQuestion(answer = "") {
  const normalized = normalizeString(answer);
  if (!normalized) return false;
  const hebrewPatterns = [
    /(?:^|\s)את[הםן]\s+(?:באמת\s+)?(?:סוכן|בוט|רובוט|מנוע|אמית|בן[\s־-]?אדם|בנאדם|אדם|חי|מודל|מבוסס|בינה|מערכת|תוכנה|טופס|תסריט|שבלונ|מוכן\s+מראש)/u,
    /(?:^|\s)את[הםן]\s+(?:LLM|AI|GPT|Claude|ChatGPT|OpenAI|Anthropic)/iu,
    /^\s*(?:מי|מה)\s+את[הםן]\b/u,
    /(?:^|\s)מנוע\s+של\s+(?:שאלות|טופס|תסריט|שבלונ)/u,
  ];
  const englishPatterns = [
    /\b(?:are|r)\s+(?:you|u)\s+(?:a\s+|an\s+)?(?:bot|real|human|ai|llm|gpt|robot|agent|engine|chatbot|model|scripted)\b/i,
    /\b(?:who|what)\s+are\s+you\b/i,
  ];
  return hebrewPatterns.some((rx) => rx.test(normalized))
    || englishPatterns.some((rx) => rx.test(normalized));
}

function buildAgentMetaReply({ session, answers = {}, currentQuestionId = "" } = {}) {
  const pendingPhrase = (() => {
    switch (currentQuestionId) {
      case "core-problem":
        return "מה הכאב המרכזי שאתה רוצה לפתור עבורם?";
      case "successful-solution":
        return "איך נראה פתרון מוצלח מבחינתם?";
      case "target-audience":
        return "מי הבן אדם שבאמת צריך את זה?";
      case "core-idea":
      default:
        return "ספר לי במשפט-שניים מה אתה רוצה לבנות.";
    }
  })();
  const text = `אני סוכן השיחה של נקסוס — מודל LLM חי, לא טופס ולא תסריט נעול. אם אני שואל שאלה זה כי אני צריך את התשובה כדי להבין את המוצר שלך, לא כי יש לי שאלון מוכן מראש. הודעות-מטא כמו זו לא אמורות להירשם בתור תשובות על המוצר — לכן לא רשמתי את ההודעה הזו כתשובה. בוא נמשיך מאיפה שעצרנו: ${pendingPhrase}`;
  return {
    text,
    questionId: currentQuestionId || "target-audience",
  };
}

// Clears any previously-stored answers whose text is itself a meta-question.
// Fixes sessions that were poisoned before AGT-001D landed.
function flushAgentMetaContamination(answers = {}) {
  const cleaned = { ...answers };
  for (const key of Object.keys(cleaned)) {
    if (isAgentMetaQuestion(cleaned[key])) {
      cleaned[key] = "";
    }
  }
  return cleaned;
}

function buildQuestionMismatchRepair({ session, answers = {} } = {}) {
  const domain = resolveConversationClassification(session, answers).domain ?? detectConversationDomain(session, answers);
  if (domain === "delivery-logistics") {
    return {
      text: "צודק, השאלה שלי לא הייתה מדויקת. אם אני מבין נכון אתה מדבר על אפליקציית משלוחים שסורקת כתובות מקרטונים ומציגה אותן על מפה. אז בוא ניישר קו: מי משתמש בזה בפועל — שליח בשטח, מנהל מסלולים, או מישהו במוקד?",
      questionId: "target-audience",
    };
  }

  if (domain === "commerce-storefront") {
    return {
      text: "צודק, השאלה שלי לא הייתה מדויקת. אם אני מבין נכון אתה מדבר על אתר שמוכר מוצרים, אז בוא ניישר קו: כשאתה אומר הלקוח שלך, אתה מתכוון לבעל העסק שמוכר באתר או ללקוח הקצה שקונה ממנו?",
      questionId: "audience-clarification",
    };
  }
  if (domain === "marketplace") {
    return {
      text: "צודק, השאלה שלי לא הייתה מדויקת. אם אני מבין נכון אתה מדבר על מערכת שמחברת בין שני צדדים. אז לפני הכל, מי שני הצדדים פה ומי מהם חייב להיכנס ראשון כדי שזה יעבוד בכלל?",
      questionId: "workflow-detail",
    };
  }
  if (domain === "booking-scheduling") {
    return {
      text: "צודק, השאלה שלי לא הייתה מדויקת. אם אני מבין נכון אתה מדבר על הזמנת תורים או זמינות. אז בוא נחדד: מי מזמין בפועל ומי מקבל את ההזמנה?",
      questionId: "target-audience",
    };
  }
  if (domain === "crm-followup") {
    return {
      text: "צודק, השאלה שלי לא הייתה מדויקת. אם אני מבין נכון אתה מדבר על מעקב אחרי לידים או לקוחות. אז בוא ניישר קו: מי מחזיק את הליד בפועל, ואיפה המעקב נופל היום?",
      questionId: "workflow-detail",
    };
  }
  if (domain === "services-content") {
    return {
      text: "צודק, השאלה שלי לא הייתה מדויקת. אם אני מבין נכון אתה מדבר על אתר שמוכר שירות, ליווי או תוכן. אז בוא נחדד: המטרה היא להביא פנייה, למכור ישירות, או גם וגם?",
      questionId: "workflow-detail",
    };
  }
  if (domain === "admin-dashboard") {
    return {
      text: "צודק, השאלה שלי לא הייתה מדויקת. אם אני מבין נכון אתה מדבר על דשבורד תפעולי. אז בוא ניישר קו: מי פותח אותו ובשביל איזו החלטה הוא צריך אותו?",
      questionId: "workflow-detail",
    };
  }

  return {
    text: "צודק, השאלה שלי לא הייתה מדויקת. אני רוצה לחזור רגע ללב של המוצר כדי לא לפספס. מי הבן אדם שבאמת צריך את זה ביום-יום?",
    questionId: "target-audience",
  };
}

function buildIdeaInsteadOfAudienceRepair({ session, answers = {}, answer = "" } = {}) {
  const normalizedIdea = normalizeString(answer);
  const classification = resolveConversationClassification(session, answers);
  const domain = classification.domain ?? detectConversationDomain(session, answers);

  if (classification.projectType === "landing-page") {
    return {
      text: `מעולה, עכשיו ברור לי יותר שמדובר בדף שמטרתו להביא פניות. כדי לא להישאר כללי מדי, מי הבן אדם שבאמת צריך את הדף הזה?`,
      questionId: "target-audience",
    };
  }

  if (classification.projectType === "internal-tool") {
    return {
      text: "מעולה, עכשיו ברור לי יותר שזה כלי עבודה פנימי. כדי להבין עבור מי הוא באמת נבנה, מי הבן אדם או הצוות שיחיו בתוך הכלי הזה כל יום?",
      questionId: "target-audience",
    };
  }

  if (domain === "delivery-logistics") {
    return {
      text: "מעולה, עכשיו הכיוון ברור יותר: אתה מדבר על אפליקציה סביב משלוחים, כתובות ומפה. לפני שאני ממשיך, מי משתמש בזה בפועל — שליח בשטח, מנהל מסלולים, או צוות לוגיסטי במוקד?",
      questionId: "target-audience",
    };
  }

  if (domain === "commerce-storefront") {
    return {
      text: "מעולה, עכשיו הכיוון ברור יותר: אתה מדבר על אתר שמוכר מוצרים. לפני שאני קופץ לקטלוג, הזמנות או תשלומים, מי המשתמש המרכזי שאתה רוצה שאבין קודם — בעל העסק שמוכר באתר, או הלקוח שקונה ממנו?",
      questionId: "audience-clarification",
    };
  }
  if (domain === "marketplace") {
    return {
      text: "מעולה, עכשיו הכיוון ברור יותר: אתה מדבר על מערכת שמחברת בין שני צדדים. לפני שאני קופץ לחיפוש, התאמה או תשלום, מי שני הצדדים במערכת ומי מהם אתה חייב לגרום לו להיכנס ראשון?",
      questionId: "workflow-detail",
    };
  }
  if (domain === "booking-scheduling") {
    return {
      text: "מעולה, עכשיו הכיוון ברור יותר: אתה מדבר על הזמנת תורים או זמינות. לפני שאני קופץ למסכים, מי מזמין בפועל ומי מקבל את ההזמנה?",
      questionId: "target-audience",
    };
  }
  if (domain === "crm-followup") {
    return {
      text: "מעולה, עכשיו הכיוון ברור יותר: אתה מדבר על מערכת follow-up. לפני שאני קופץ לסטטוסים או אוטומציות, מי מחזיק את הליד או הלקוח בפועל ביום-יום?",
      questionId: "target-audience",
    };
  }
  if (domain === "services-content") {
    return {
      text: "מעולה, עכשיו הכיוון ברור יותר: אתה מדבר על אתר שמוכר שירות, ליווי או תוכן. לפני שאני קופץ להצעה, תשלום או טפסים, מה אתה באמת מוכר כאן — זמן, תוכנית, תוכן, או שילוב?",
      questionId: "workflow-detail",
    };
  }
  if (domain === "admin-dashboard") {
    return {
      text: "מעולה, עכשיו הכיוון ברור יותר: אתה מדבר על דשבורד לניהול או ניטור. לפני שאני קופץ ל־KPIs או drill-down, מי פותח אותו ובשביל איזו החלטה הוא צריך אותו?",
      questionId: "workflow-detail",
    };
  }

  return {
    text: `מעולה, עכשיו הכיוון ברור יותר. כדי לא לפספס למי ${normalizedIdea ? "הדבר הזה" : "המוצר הזה"} באמת מיועד, מי הבן אדם שבאמת צריך את זה ביום-יום?`,
    questionId: "target-audience",
  };
}

function buildProductTypeRepair({ session, answers = {}, answer = "" } = {}) {
  const normalizedType = normalizeString(answer);
  const classification = resolveConversationClassification(session, answers);
  const domain = classification.domain ?? detectConversationDomain(session, answers);

  if (domain === "delivery-logistics" && /אפליקציה|app/iu.test(normalizedType)) {
    return {
      text: "מעולה, אז ברור שמדובר באפליקציה ולא בדף שיווקי. עכשיו אני רוצה להבין את הזרימה עצמה: היום איך הכתובות מגיעות אל המשתמש, ומה הכי נשבר שם בפועל?",
      questionId: "core-problem",
    };
  }

  if (domain === "commerce-storefront" && /אתר|website|site|shop|store/iu.test(normalizedType)) {
    return {
      text: "מעולה, אז ברור שזה אתר שמוכר ולא מוצר SaaS כללי. עכשיו אני רוצה להבין למי אנחנו מדייקים קודם את החוויה — לבעל העסק שמוכר באתר, או ללקוח הקצה שקונה ממנו?",
      questionId: "audience-clarification",
    };
  }
  if (domain === "booking-scheduling") {
    return {
      text: "מעולה, אז ברור שזה כלי הזמנות ולא אתר כללי. עכשיו אני רוצה להבין מי מזמין ומי מקבל את ההזמנה בפועל.",
      questionId: "target-audience",
    };
  }
  if (domain === "marketplace") {
    return {
      text: "מעולה, אז ברור שזה לא אתר חד-צדדי אלא מערכת שמחברת בין צדדים. עכשיו אני רוצה להבין מי שני הצדדים, ומי מהם חייב להיכנס ראשון כדי שהמערכת תרגיש חיה.",
      questionId: "workflow-detail",
    };
  }

  if (classification.projectType === "landing-page") {
    return {
      text: "מעולה, אז ברור שמדובר בדף שמטרתו להביא יותר פניות. עכשיו אני רוצה להבין עבור מי הדף הזה נבנה באמת.",
      questionId: "target-audience",
    };
  }

  if (classification.projectType === "internal-tool") {
    return {
      text: "מעולה, אז ברור שזה כלי עבודה פנימי. עכשיו אני רוצה להבין מי האנשים שבאמת יחיו בתוך הכלי הזה לאורך היום.",
      questionId: "target-audience",
    };
  }

  return {
    text: "מעולה, עכשיו כיוון המוצר ברור יותר. בוא נחדד מי האנשים שבאמת צריכים את זה בפועל.",
    questionId: "target-audience",
  };
}

function buildTermClarificationRepair({ session, answers = {}, currentQuestionId = "" } = {}) {
  const domain = resolveConversationClassification(session, answers).domain ?? detectConversationDomain(session, answers);

  if (normalizeString(currentQuestionId) === "build-direction" || domain === "delivery-logistics") {
    return {
      text: "התכוונתי בפשטות למה שהמשתמש רואה ומבין מיד כשהוא פותח את האפליקציה. במקרה שלך, מה חייב להיות ברור לשליח או לסדרן ישר אחרי פתיחה — שהכתובת נקלטה, איפה היא על המפה, או מה הצעד הבא?",
      questionId: "build-direction",
    };
  }

  if (domain === "commerce-storefront") {
    return {
      text: "התכוונתי פשוט למה שהלקוח או בעל העסק רואים ומבינים מיד כשהאתר נפתח. במקרה שלך, מה חייב להיות ברור ישר — שאפשר לקנות עכשיו, שיש מלאי אמיתי, או איך מתקדמים להזמנה?",
      questionId: currentQuestionId || "build-direction",
    };
  }
  if (domain === "booking-scheduling") {
    return {
      text: "התכוונתי פשוט למה שהמשתמש רואה ומבין מיד כשהוא פותח את המערכת. במקרה שלך, מה חייב להיות ברור ישר — מי פנוי, איזה תור אפשר להזמין, והאם ההזמנה מאושרת מיד או מחכה לאישור?",
      questionId: currentQuestionId || "build-direction",
    };
  }
  if (domain === "crm-followup") {
    return {
      text: "התכוונתי פשוט למה שהמשתמש רואה ומבין מיד כשהוא נכנס למערכת. במקרה שלך, מה חייב להיות ברור ישר — על איזה ליד צריך לחזור עכשיו, מה הסטטוס, ומה הצעד הבא?",
      questionId: currentQuestionId || "build-direction",
    };
  }

  return {
    text: "התכוונתי פשוט למה שהמשתמש רואה ומבין מיד כשהוא פותח את המוצר. מה חייב להיות ברור לו ישר כדי לא ללכת לאיבוד?",
    questionId: currentQuestionId || "build-direction",
  };
}

function resolveTurnHandling({ session, currentQuestionId = "", answer = "" } = {}) {
  const normalizedAnswer = normalizeString(answer);
  const answers = normalizeObject(session?.conversation?.answers);
  const nextAnswers = { ...answers };

  if (isQuestionMismatchFeedback(normalizedAnswer)) {
    return {
      mode: "repair",
      answers: nextAnswers,
      userAnswer: normalizedAnswer,
      aiReply: buildQuestionMismatchRepair({ session, answers: nextAnswers }),
    };
  }

  if (isTermClarificationRequest(normalizedAnswer)) {
    return {
      mode: "repair",
      answers: nextAnswers,
      userAnswer: normalizedAnswer,
      aiReply: buildTermClarificationRepair({ session, answers: nextAnswers, currentQuestionId }),
    };
  }

  // AGT-001D — gate meta-questions about the agent itself BEFORE slot-fill,
  // and flush any past poisoned slots so the conversation recovers cleanly.
  if (isAgentMetaQuestion(normalizedAnswer)) {
    const cleanedAnswers = flushAgentMetaContamination(nextAnswers);
    return {
      mode: "repair",
      answers: cleanedAnswers,
      userAnswer: normalizedAnswer,
      aiReply: buildAgentMetaReply({ session, answers: cleanedAnswers, currentQuestionId }),
    };
  }

  if (currentQuestionId === "target-audience" && isLikelyIdeaAnswer(normalizedAnswer)) {
    Object.assign(nextAnswers, enrichDiscoveryAnswersFromFreeText({
      ...nextAnswers,
      "core-idea": normalizedAnswer,
    }, normalizedAnswer));
    return {
      mode: "repair",
      answers: nextAnswers,
      userAnswer: normalizedAnswer,
      aiReply: buildIdeaInsteadOfAudienceRepair({ session, answers: nextAnswers, answer: normalizedAnswer }),
    };
  }

  if (isLikelyProductTypeAnswer(normalizedAnswer) && currentQuestionId !== "project-class") {
    nextAnswers["project-class"] = normalizedAnswer;
    return {
      mode: "repair",
      answers: nextAnswers,
      userAnswer: normalizedAnswer,
      aiReply: buildProductTypeRepair({ session, answers: nextAnswers, answer: normalizedAnswer }),
    };
  }

  nextAnswers[currentQuestionId] = normalizedAnswer;
  Object.assign(nextAnswers, enrichDiscoveryAnswersFromFreeText(nextAnswers, normalizedAnswer));
  return {
    mode: "normal",
    answers: nextAnswers,
    userAnswer: normalizedAnswer,
    aiReply: null,
  };
}

function isSelfAudienceReference(value = "") {
  const normalized = normalizeString(value).replace(/[.!?]+$/u, "").trim();
  if (!normalized) {
    return false;
  }
  return /^(?:אני|אני בעצמי|אני המשתמש(?:ת)?|המשתמש(?:ת)?(?:\s+המרכזי)?\s*(?:זה|הוא|היא)\s*אני)$/iu.test(normalized);
}

function isAmbiguousClientReference(value = "") {
  const normalized = normalizeString(value);
  if (!normalized) {
    return false;
  }
  return /(?:^|\s)לקוח(?:ות)?\s+שלי(?:$|\s)/iu.test(normalized);
}

function resolveAudienceDisplayValue(audience = "") {
  const normalized = normalizeString(audience);
  if (!normalized) {
    return "";
  }
  if (isSelfAudienceReference(normalized)) {
    return "אתה בעצמך";
  }
  return normalized;
}

function resolveAudienceFocusReference(audience = "", fallback = "המשתמש") {
  const resolved = resolveAudienceDisplayValue(audience);
  return resolved || fallback;
}

function resolveAudienceForPhrase(audience = "", fallback = "המשתמש") {
  if (isSelfAudienceReference(audience)) {
    return "עבורך";
  }
  const resolved = resolveAudienceDisplayValue(audience);
  return resolved ? `עבור ${resolved}` : `עבור ${fallback}`;
}

function resolveAudienceAtPhrase(audience = "", fallback = "המשתמש") {
  if (isSelfAudienceReference(audience)) {
    return "אצלך";
  }
  const resolved = resolveAudienceDisplayValue(audience);
  return resolved ? `אצל ${resolved}` : `אצל ${fallback}`;
}

function buildAudienceUnderstandingLine(audience = "") {
  const normalized = normalizeString(audience);
  if (!normalized || isGenericAudienceAnswer(normalized) || isAmbiguousClientReference(normalized)) {
    return "";
  }
  return `המשתמש המרכזי: ${resolveAudienceDisplayValue(normalized)}`;
}

function extractDiscoverySegment(text = "", patterns = [], { toEnd = false } = {}) {
  const normalized = normalizeString(text);
  if (!normalized) {
    return "";
  }

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    const value = normalizeString(match?.[1] ?? "");
    if (value) {
      return toEnd ? value.replace(/^[,.\s]+/u, "").trim() : value.split(/[,.،;؛]/u)[0]?.trim() ?? "";
    }
  }

  return "";
}

function deriveDiscoveryAnswersFromFreeText(text = "") {
  const normalized = normalizeString(text);
  if (!normalized) {
    return {};
  }

  const audience = extractDiscoverySegment(normalized, [
    /(?:המשתמש(?:ת)?(?:\s+המרכזי)?|הלקוח(?:\s+המרכזי)?|מי\s+שישתמש\s+בזה)\s*(?:זה|הוא|היא|הם|הן)\s+([^,.،;؛]+)/iu,
    /(?:מיועד(?:ת)?\s+ל|עבור|בשביל)\s+([^,.،;؛]+)/iu,
  ]);
  const problem = extractDiscoverySegment(normalized, [
    /(?:הכאב(?:\s+המרכזי)?|הבעיה(?:\s+המרכזית)?|מה\s+שנשבר)\s*(?:זה|הוא|היא)\s+([^,.،;؛]+)/iu,
    /(?:כדי\s+שלא|בשביל\s+שלא)\s+([^,.،;؛]+)/iu,
  ]);
  const firstFlow = extractDiscoverySegment(normalized, [
    /(?:ה-flow\s+הראשון|הפלואו\s+הראשון|הזרימה\s+הראשונה|המסך\s+הראשון|המשימה\s+הראשונה)\s*(?:זה|הוא|היא)?\s+(.+)$/iu,
    /(?:בגרסה\s+הראשונה|ב-v1|ב־v1)\s*(?:צריך|חייב(?:ים)?)\s+(.+)$/iu,
  ], { toEnd: true });

  const derived = {};
  if (audience && !isGenericAudienceAnswer(audience)) {
    derived["target-audience"] = audience;
  }
  if (problem && !isGenericProblemAnswer(problem)) {
    derived["core-problem"] = problem;
  }
  if (firstFlow) {
    derived["workflow-detail"] = firstFlow;
    derived["build-direction"] = firstFlow;
  }
  if (derived["target-audience"] && derived["core-problem"] && firstFlow) {
    derived["successful-solution"] = normalized;
  }

  return derived;
}

function enrichDiscoveryAnswersFromFreeText(answers = {}, text = "") {
  const normalizedAnswers = normalizeObject(answers);
  const derived = deriveDiscoveryAnswersFromFreeText(text);
  return {
    ...derived,
    ...normalizedAnswers,
  };
}

function resolvePostOnboardingCorrection({ session, message = "" } = {}) {
  const normalizedMessage = normalizeString(message);
  if (!normalizedMessage || /[?]\s*$/u.test(normalizedMessage)) {
    return null;
  }

  const normalizedAnswers = normalizeObject(session?.conversation?.answers);

  if (isSelfAudienceReference(normalizedMessage)) {
    return {
      correctionType: "audience-self",
      updatedAnswers: {
        ...normalizedAnswers,
        "target-audience": "אני",
      },
      correctedFields: ["target-audience"],
      reopenedArea: "audience",
      replyText: "מעולה, זה משנה את נקודת המבט. אני מעדכן שאתה בעצמך המשתמש המרכזי, אז אני מפסיק לדבר כאילו מדובר בקהל חיצוני. עכשיו נוכל לדייק את שאר ההבנה מתוך השימוש שלך בפועל.",
    };
  }

  if (isAmbiguousClientReference(normalizedMessage)) {
    return {
      correctionType: "audience-ambiguous-client",
      updatedAnswers: {
        ...normalizedAnswers,
        "target-audience": normalizedMessage,
      },
      correctedFields: ["target-audience"],
      reopenedArea: "audience",
      replyText: "כאן עדיין לא באמת נסגר לי מי המשתמש בפועל. \"לקוח שלי\" יכול להיות אתה כבעל העסק, איש צוות אצל הלקוח, או לקוח הקצה. אני משאיר את זה פתוח עד שנדייק את הדמות הנכונה.",
    };
  }

  const explicitAudienceMatch = normalizedMessage.match(
    /^(?:המשתמש(?:ת)?(?:\s+המרכזי)?|מי שמשתמש בזה בפועל|הלקוח(?:\s+המרכזי)?)\s*(?:זה|הוא|היא|הם|הן)?\s*(.+)$/iu,
  );
  if (explicitAudienceMatch?.[1]) {
    const explicitAudience = normalizeString(explicitAudienceMatch[1]);
    if (explicitAudience) {
      return {
        correctionType: "audience-explicit",
        updatedAnswers: {
          ...normalizedAnswers,
          "target-audience": explicitAudience,
        },
        correctedFields: ["target-audience"],
        reopenedArea: "audience",
        replyText: `מעולה, אני מעדכן שהמשתמש המרכזי הוא ${resolveAudienceDisplayValue(explicitAudience)}. מעכשיו שאר ההבנה תישען על הדמות הזו ולא על ניסוח כללי מדי.`,
      };
    }
  }

  const explicitProblemMatch = normalizedMessage.match(
    /^(?:הבעיה(?:\s+המרכזית)?|הכאב(?:\s+המרכזי)?|מה שבאמת נשבר)\s*(?:זה|הוא|היא)?\s*(.+)$/iu,
  );
  if (explicitProblemMatch?.[1]) {
    const explicitProblem = normalizeString(explicitProblemMatch[1]);
    if (explicitProblem) {
      return {
        correctionType: "problem-explicit",
        updatedAnswers: {
          ...normalizedAnswers,
          "core-problem": explicitProblem,
        },
        correctedFields: ["core-problem"],
        reopenedArea: "problem",
        replyText: `מעולה, אני מעדכן שהכאב המרכזי הוא: ${explicitProblem}. מעכשיו כל החלטת מוצר צריכה להיבדק מול הבעיה הזו, לא מול ניסוח קודם שהיה חלש מדי.`,
      };
    }
  }

  const explicitIdeaMatch = normalizedMessage.match(
    /^(?:הרעיון(?:\s+המרכזי)?|מה שאני רוצה לבנות|מה שבאמת צריך לבנות)\s*(?:זה|הוא|היא)?\s*(.+)$/iu,
  );
  if (explicitIdeaMatch?.[1]) {
    const explicitIdea = normalizeString(explicitIdeaMatch[1]);
    if (explicitIdea) {
      return {
        correctionType: "idea-explicit",
        updatedAnswers: {
          ...normalizedAnswers,
          "core-idea": explicitIdea,
        },
        correctedFields: ["core-idea"],
        reopenedArea: "idea",
        replyText: `מעולה, אני מעדכן שזה הרעיון המרכזי: ${explicitIdea}. עכשיו אפשר לחזור לשאלות ההמשך מתוך הרעיון המדויק ולא מתוך ניסוח קודם שלא שיקף אותך מספיק טוב.`,
      };
    }
  }

  const explicitWorkflowMatch = normalizedMessage.match(
    /^(?:הזרימה\s+בפועל|הפלואו\s+הראשון|ה-flow\s+הראשון|אחרי\s+הסריקה|אחרי\s+שהכתובת\s+נסרקת)\s*(?:זה|הוא|היא)?\s*(.+)$/iu,
  );
  if (explicitWorkflowMatch?.[1]) {
    const explicitWorkflow = normalizeString(explicitWorkflowMatch[1]);
    if (explicitWorkflow) {
      return {
        correctionType: "workflow-explicit",
        updatedAnswers: {
          ...normalizedAnswers,
          "workflow-detail": explicitWorkflow,
        },
        correctedFields: ["workflow-detail"],
        reopenedArea: "workflow-detail",
        replyText: `מעולה, אני מעדכן את הזרימה בפועל כך: ${explicitWorkflow}. מעכשיו שאר ההבנה תיבנה סביב ה-flow הזה ולא סביב הנחה כללית מדי.`,
      };
    }
  }

  const explicitBuildDirectionMatch = normalizedMessage.match(
    /^(?:מה\s+שחייב\s+(?:לעבוד|להיות)\s+(?:ב(?:-|\s*)?v1|בגרסה\s+הראשונה)\s+הוא|בגרסה\s+הראשונה\s+צריך|ב(?:-|\s*)?v1\s+צריך)\s*(.+)$/iu,
  );
  if (explicitBuildDirectionMatch?.[1]) {
    const explicitBuildDirection = normalizeString(explicitBuildDirectionMatch[1]);
    if (explicitBuildDirection) {
      return {
        correctionType: "build-direction-explicit",
        updatedAnswers: {
          ...normalizedAnswers,
          "build-direction": explicitBuildDirection,
        },
        correctedFields: ["build-direction"],
        reopenedArea: "build-direction",
        replyText: `מעולה, אני מעדכן שזה מה שחייב להיכנס כבר בגרסה הראשונה: ${explicitBuildDirection}. מעכשיו שאר ההחלטות ייבדקו מול ההכרעה הזו.`,
      };
    }
  }

  const explicitProjectTypeMatch = normalizedMessage.match(/^(?:זה|זאת|זו)\s+(.+)$/iu);
  if (explicitProjectTypeMatch?.[1]) {
    const explicitProjectType = normalizeString(explicitProjectTypeMatch[1]);
    if (explicitProjectType && detectProjectType(explicitProjectType) !== "unknown") {
      return {
        correctionType: "project-class-explicit",
        updatedAnswers: {
          ...normalizedAnswers,
          "project-class": explicitProjectType,
        },
        correctedFields: ["project-class"],
        reopenedArea: "project-class",
        replyText: `מעולה, אני מעדכן את סוג המוצר ל-${explicitProjectType}. מעכשיו השאלות והסיכום יישענו על הכיוון הזה ולא על סיווג ישן או כללי מדי.`,
      };
    }
  }

  return null;
}

function resolveConversationClassification(session, answers = {}) {
  const canonicalAnswers = resolveCanonicalOnboardingAnswers(answers);
  const coreIdea = canonicalAnswers.coreIdea;
  const projectClassAnswer = typeof answers["project-class"] === "string" ? answers["project-class"].trim() : "";
  if (projectClassAnswer) {
    const projectTypeFromAnswer = detectProjectType(projectClassAnswer);
    if (projectTypeFromAnswer !== "unknown") {
      return {
        projectType: projectTypeFromAnswer,
        candidateTypes: [projectTypeFromAnswer],
        isAmbiguous: false,
        source: "conversation-answer",
      };
    }
  }

  const successfulSolution = typeof answers["successful-solution"] === "string"
    ? answers["successful-solution"].trim()
    : "";
  const buildDirection = typeof answers["build-direction"] === "string"
    ? answers["build-direction"].trim()
    : "";
  const conversationOnlyText = [
    coreIdea,
    canonicalAnswers.audience,
    canonicalAnswers.problem,
    successfulSolution,
    buildDirection,
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .join("\n");
  const conversationOnlyType = conversationOnlyText
    ? detectProjectType(conversationOnlyText)
    : "unknown";
  if (conversationOnlyType !== "unknown") {
    const conversationCandidates = detectProjectTypeCandidates(conversationOnlyText);
    const explicitProjectType = resolveExplicitProjectTypeSignal(conversationOnlyText);
    const hasMobileAppSignal = conversationCandidates.includes("mobile-app");
    const hasDeliveryCommerceSignal = conversationCandidates.includes("commerce-ops");
    const domain = detectConversationDomain(session, answers);
    const hasStorefrontSignal = domain === "commerce-storefront" && conversationCandidates.includes("commerce-ops");
    return {
      projectType: explicitProjectType ?? (hasMobileAppSignal ? "mobile-app" : hasStorefrontSignal ? "commerce-ops" : conversationOnlyType),
      candidateTypes: explicitProjectType
        ? [explicitProjectType]
        : hasStorefrontSignal
          ? ["commerce-ops"]
        : conversationCandidates.length > 0
          ? conversationCandidates
          : [conversationOnlyType],
      isAmbiguous: explicitProjectType
        ? false
        : hasStorefrontSignal
        ? false
        : hasMobileAppSignal && hasDeliveryCommerceSignal
        ? false
        : conversationCandidates.length > 1,
      domain,
      source: "conversation-signals",
    };
  }

  const intakeProjectType = typeof session?.projectIntake?.projectType === "string"
    ? session.projectIntake.projectType.trim()
    : "";
  const isQaPreviewSession = normalizeString(session?.projectDraft?.draftId).includes("qa-preview")
    || normalizeString(session?.projectIntake?.projectName) === "My SaaS App"
    || normalizeString(session?.projectIntake?.visionText) === "להכין ניסוי ראשון לרכישת משתמשים";
  const hasConversationSpecificSignal = Boolean(
    coreIdea
    || canonicalAnswers.audience
    || canonicalAnswers.problem
    || successfulSolution
    || buildDirection,
  );
  if (intakeProjectType && intakeProjectType !== "unknown" && !(isQaPreviewSession && !hasConversationSpecificSignal)) {
    return {
      projectType: intakeProjectType,
      candidateTypes: [intakeProjectType],
      isAmbiguous: false,
      domain: detectConversationDomain(session, answers),
      source: "project-intake",
    };
  }

  const successfulSolutionType = successfulSolution
    ? detectProjectType(successfulSolution)
    : "unknown";
  if (successfulSolutionType !== "unknown") {
    return {
      projectType: successfulSolutionType,
      candidateTypes: [successfulSolutionType],
      isAmbiguous: false,
      domain: detectConversationDomain(session, answers),
      source: "successful-solution",
    };
  }

  const sourceText = [
    session?.projectIntake?.visionText,
    session?.projectDraft?.goal,
    session?.initialInput?.goal,
    session?.initialInput?.raw,
    coreIdea,
    canonicalAnswers.audience,
    canonicalAnswers.problem,
    successfulSolution,
    buildDirection,
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .join("\n");

  const candidateTypes = detectProjectTypeCandidates(sourceText);
  const detectedProjectType = detectProjectType(sourceText);
  const isAmbiguous = candidateTypes.length > 1 || detectedProjectType === "unknown";
  const projectType = detectedProjectType !== "unknown"
    ? detectedProjectType
    : candidateTypes.length === 1
      ? candidateTypes[0]
      : "unknown";

  return {
    projectType,
    candidateTypes,
    isAmbiguous,
    domain: detectConversationDomain(session, answers),
    source: "intake-signals",
  };
}

function requiresSolutionQuestion(projectType) {
  return projectType !== "landing-page";
}

function hasSufficientUnderstanding({ projectType, audience, problem, solution }) {
  if (!audience || !problem) {
    return false;
  }

  if (projectType === "landing-page") {
    return true;
  }

  return Boolean(solution);
}

function hasSeededCoreIdea(session, answers = {}) {
  const answerIdea = normalizeString(answers["core-idea"]);
  const seededIdea = normalizeString(
    session?.initialInput?.goal,
    normalizeString(session?.projectDraft?.goal),
  );
  return Boolean(answerIdea && seededIdea && answerIdea === seededIdea);
}

function buildAdaptiveQuestionPlan(session, answers = {}) {
  const classification = resolveConversationClassification(session, answers);
  const decision = resolveLearningGuidedOnboardingDecision({
    answers,
    classification,
    learningContext: resolveSessionLearningContext(session),
  });
  const domain = classification.domain ?? detectConversationDomain(session, answers);
  const { audience, problem } = resolveCanonicalOnboardingAnswers(answers);
  const workflowDetail = normalizeString(answers["workflow-detail"]);
  const needsWorkflowDetail = domainNeedsWorkflowDetail(domain, classification.projectType) && audience && problem && !workflowDetail;
  if (!needsWorkflowDetail) {
    return decision.questionPlan;
  }
  const plan = normalizeArray(decision.questionPlan).filter((questionId) => questionId !== "workflow-detail");
  const successfulSolutionIndex = plan.indexOf("successful-solution");
  const buildDirectionIndex = plan.indexOf("build-direction");
  const insertionIndex = successfulSolutionIndex >= 0
    ? successfulSolutionIndex
    : buildDirectionIndex >= 0
      ? buildDirectionIndex
      : plan.length;
  return [
    ...plan.slice(0, insertionIndex),
    "workflow-detail",
    ...plan.slice(insertionIndex),
  ];
}

function buildVisibleAdaptiveQuestionPlan(session, answers = {}) {
  const plan = buildAdaptiveQuestionPlan(session, answers);
  return hasSeededCoreIdea(session, answers)
    ? plan.filter((questionId) => questionId !== "core-idea")
    : plan;
}

function resolveNextConversationQuestionId(session, answers = {}) {
  const classification = resolveConversationClassification(session, answers);
  const decision = resolveLearningGuidedOnboardingDecision({
    answers,
    classification,
    learningContext: resolveSessionLearningContext(session),
  });
  const domain = classification.domain ?? detectConversationDomain(session, answers);
  const { audience, problem } = resolveCanonicalOnboardingAnswers(answers);
  const workflowDetail = normalizeString(answers["workflow-detail"]);
  const needsWorkflowDetail = domainNeedsWorkflowDetail(domain, classification.projectType) && audience && problem && !workflowDetail;
  if (needsWorkflowDetail && (decision.nextQuestionId === "successful-solution" || decision.nextQuestionId === "build-direction" || decision.nextQuestionId === null)) {
    return "workflow-detail";
  }
  return decision.nextQuestionId;
}

function buildAgentPrompt(session, questionId) {
  const questionPresentation = resolveQuestionPresentation(session, questionId);
  if (!questionPresentation) {
    return null;
  }

  const answers = session?.conversation?.answers ?? {};
  const { coreIdea, audience, problem } = resolveCanonicalOnboardingAnswers(answers);
  if (questionId === "core-idea") {
    return "מה הרעיון שיש לך בראש? לא במונחים של מסכים או פיצ'רים עדיין, אלא בפשטות: אם זה כבר היה קיים היום, מה זה היה מאפשר לעשות אחרת?";
  }
  if (questionId === "project-class" && audience) {
    return `כדי לא להוביל ${resolveAudienceForPhrase(audience)} למסלול הלא נכון, מה הדבר המרכזי שאתה בונה כאן: דף נחיתה שיווקי, כלי פנימי לצוות, או מוצר SaaS קטן?`;
  }
  if (
    questionId === "target-audience"
    && (resolveConversationClassification(session, answers).domain ?? detectConversationDomain(session, answers)) === "commerce-storefront"
  ) {
    return "אוקיי, אז אני כבר מבין שמדובר בחנות אונליין לסלולרים ואביזרים, עם קטלוג, עגלת קניות, סליקה, מלאי, משלוחים ואזור ניהול בסיסי. אם לא תגיד אחרת, אני מניח שזה הבסיס של ה-v1. מה אתה רוצה לדייק קודם — את חוויית הלקוח שבוחר וקונה, או את הצד של בעל העסק שמנהל את הקטלוג, המלאי וההזמנות?";
  }
  if (questionId === "audience-clarification") {
    return questionPresentation.title;
  }
  if (questionId === "core-problem") {
    return questionPresentation.title;
  }
  if (questionId === "problem-clarification") {
    return questionPresentation.title;
  }
  if (questionId === "workflow-detail") {
    return questionPresentation.title;
  }

  if (
    questionId === "successful-solution"
    && audience
    && problem
  ) {
    return `יש כבר תמונה טובה: המשתמש המרכזי הוא ${resolveAudienceFocusReference(audience)} והכאב המרכזי הוא ${problem}. איך נראה פתרון מוצלח מבחינתו?`;
  }
  if (questionId === "build-direction") {
    return questionPresentation.title;
  }

  return questionPresentation.title;
}

function buildQuestionReason(session, questionId) {
  const answers = session?.conversation?.answers ?? {};
  const { audience, problem } = resolveCanonicalOnboardingAnswers(answers);
  const classification = resolveConversationClassification(session, answers);
  const learningDecision = resolveLearningGuidedOnboardingDecision({
    answers,
    classification,
    learningContext: resolveSessionLearningContext(session),
  });

  if (questionId === "core-idea") {
    return "אני מתחיל מהרעיון עצמו כדי לא לקפוץ מוקדם מדי למסכים, פיצ'רים או build לפני שהמוצר באמת ברור.";
  }
  if (questionId === "project-class") {
    return "אני רוצה לוודא שאני מבין נכון מה אתה בונה, כדי לא לשאול שאלות שמתאימות לכיוון אחר.";
  }
  if (questionId === "audience-clarification") {
    return learningDecision.learningReason;
  }
  if (questionId === "core-problem" && audience) {
    if ((classification.domain ?? detectConversationDomain(session, answers)) === "commerce-storefront") {
      return `אני כבר מניח את הבסיס של ה-storefront. עכשיו אני רוצה להבין מה הכאב האמיתי שמבדיל את החנות הזאת מחנות אונליין סטנדרטית ${resolveAudienceForPhrase(audience)}.`;
    }
    return `כבר ברור לי מי המשתמש המרכזי. עכשיו אני רוצה להבין מה בדיוק נשבר ${resolveAudienceAtPhrase(audience)} ביום־יום.`;
  }
  if (questionId === "problem-clarification") {
    return learningDecision.learningReason;
  }
  if (questionId === "workflow-detail") {
    return "אני רוצה להבין איך זה עובד בפועל בתוך יום עבודה אמיתי, כדי לא להישאר עם רעיון יפה אבל מעורפל.";
  }
  if (questionId === "successful-solution" && audience && problem) {
    return learningDecision.requiresLandingSolution
      ? `${learningDecision.learningReason} נשאר לחדד גם איך נראה פתרון שעובד בפועל ${resolveAudienceForPhrase(audience)}.`
      : `יש לי כבר קהל יעד וכאב מרכזי. נשאר לחדד איך נראה פתרון שעובד בפועל ${resolveAudienceForPhrase(audience)}.`;
  }
  if (questionId === "build-direction") {
    return "יש כבר קהל יעד, כאב וכיוון לפתרון. עכשיו אני רוצה להבין מה חייב להיות ברור למשתמש מיד כשהוא פותח את המוצר.";
  }
  if (questionId === "target-audience") {
    if ((classification.domain ?? detectConversationDomain(session, answers)) === "commerce-storefront") {
      return "אני כבר מניח את בסיס ה־storefront ועוצר רק על ה־fork שיקבע אם המוקד הוא חוויית הקנייה או התפעול של החנות.";
    }
    return "אני מתחיל מהאדם שבאמת צריך את זה, כדי להבין עבור מי המוצר הזה נבנה.";
  }
  if (questionId === "successful-solution") {
    return "אני מנסה להבין איך נראה רגע שבו זה באמת עובד טוב, לא רק מה הרעיון על הנייר.";
  }
  return "אני רוצה לשאול כאן משהו שיעזור לי להבין את המוצר שלך יותר לעומק, בלי לקפוץ מוקדם מדי לפתרון.";
}

function buildCompletionReason(session) {
  const answers = session?.conversation?.answers ?? {};
  const { audience, problem, solution, buildDirection } = resolveCanonicalOnboardingAnswers(answers);
  const classification = resolveConversationClassification(session, answers);
  const learningDecision = resolveLearningGuidedOnboardingDecision({
    answers,
    classification,
    learningContext: resolveSessionLearningContext(session),
  });

  if (classification.projectType === "landing-page" && audience && problem && solution && buildDirection) {
    return "יש כבר מספיק הבנה כדי לסכם דף נחיתה: הלמידה החזיקה את ה־onboarding פתוח עד שננעלו גם ההבטחה, האמון והפעולה הראשונה שהעמוד חייב לדחוף.";
  }

  if (
    classification.projectType === "landing-page"
    && audience
    && problem
    && buildDirection
    && learningDecision.requiresLandingSolution !== true
  ) {
    return "יש כבר מספיק הבנה כדי לסכם דף נחיתה: ברור מי הקהל, מה נשבר בהמרה, ומה חייב להיות ברור מיד בעמוד כדי שהבנייה לא תישאר כללית מדי.";
  }

  if (audience && problem && solution && buildDirection) {
    return learningDecision.learningStatus === "live"
      ? "יש כבר קהל יעד, כאב מרכזי, תמונת פתרון, וכיוון build ראשון. הלמידה מאשרת שהשיחה חדה מספיק כדי לעבור לסיכום ההבנה."
      : "יש כבר קהל יעד, כאב מרכזי, תמונת פתרון, וכיוון build ראשון. זה מספיק כדי לעצור את השיחה ולעבור לסיכום ההבנה.";
  }

  return "יש מספיק הבנה ראשונית כדי לעצור כאן ולעבור לסיכום ההבנה.";
}

function resolveConversationProjectType(session) {
  const answers = session?.conversation?.answers ?? {};
  const classification = resolveConversationClassification(session, answers);
  if (classification.projectType && classification.projectType !== "unknown") {
    return classification.projectType;
  }

  const intakeProjectType = typeof session?.projectIntake?.projectType === "string"
    ? session.projectIntake.projectType.trim()
    : "";
  if (intakeProjectType && intakeProjectType !== "unknown") {
    return intakeProjectType;
  }

  const sourceText = [
    session?.projectIntake?.visionText,
    session?.projectDraft?.goal,
    session?.initialInput?.goal,
    session?.initialInput?.raw,
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .join("\n");

  return detectProjectType(sourceText);
}

function resolveProjectTypeLabel(projectType, domain = "generic") {
  if (domain === "marketplace") {
    return "מרקטפלייס / זירה דו-צדדית";
  }
  if (domain === "booking-scheduling") {
    return "מערכת תורים / booking";
  }
  if (domain === "crm-followup") {
    return "CRM / follow-up";
  }
  if (domain === "delivery-logistics") {
    return "לוגיסטיקה / מסלולים";
  }
  if (domain === "services-content") {
    return "שירותים / תוכן";
  }
  if (domain === "admin-dashboard") {
    return "דשבורד תפעולי";
  }
  if (projectType === "landing-page") {
    return "דף נחיתה / שיווק";
  }
  if (projectType === "commerce-ops") {
    return "מערכת מסחר ותפעול";
  }
  if (projectType === "internal-tool") {
    return "כלי פנימי";
  }
  if (projectType === "saas") {
    return "מוצר SaaS / follow-up";
  }
  if (projectType === "mobile-app") {
    return "אפליקציה";
  }
  return "פרויקט";
}

function resolveSolutionLabel(projectType) {
  if (projectType === "landing-page") {
    return "כיוון לדף הנחיתה";
  }
  if (projectType === "commerce-ops") {
    return "כיוון למסחר ולתפעול";
  }
  if (projectType === "internal-tool") {
    return "כיוון לזרימת העבודה";
  }
  if (projectType === "saas") {
    return "כיוון למוצר";
  }
  return "כיוון לפתרון";
}

function resolveBuildDirectionLabel(projectType) {
  if (projectType === "landing-page") {
    return "מה חייב להיות ברור בדף";
  }
  if (projectType === "commerce-ops") {
    return "מה חייב להיות גלוי במסך הראשון";
  }
  if (projectType === "internal-tool") {
    return "מה חייב להיות ברור במסך העבודה הראשון";
  }
  if (projectType === "saas") {
    return "מה חייב להיות ברור במסך הראשון";
  }
  if (projectType === "mobile-app") {
    return "מה חייב להיות ברור במסך הראשון";
  }
  return "מה חייב להיות ברור מיד";
}

function buildMissingItemsForProjectType({ projectType, domain = "generic", coreIdea, audience, problem, solution, buildDirection, canonicalAnswers = null, conversationMode = "thinking" }) {
  if (conversationMode === "builder-momentum") {
    const momentumMissingItems = buildMeaningfulMissingItems({
      classification: { projectType, domain },
      canonicalAnswers: canonicalAnswers ?? {
        coreIdea,
        audience,
        problem,
        solution,
        buildDirection,
        hasGenericAudience: false,
        hasGenericProblem: false,
      },
    });
    if (momentumMissingItems.length) {
      return momentumMissingItems;
    }
  }

  if (!coreIdea) {
    return [
      "מה הרעיון עצמו ואיזה שינוי הוא אמור לאפשר",
      "למה בכלל שווה לבנות את זה ולא רק להוסיף עוד פיצ'ר",
    ];
  }

  if (!audience) {
    if (domain === "commerce-storefront") {
      return [
        "האם המשתמש המרכזי כרגע הוא בעל העסק שמוכר באתר או הלקוח שקונה ממנו",
        "מי מהם הכי חשוב להבין קודם כדי לא לבנות את האתר על הנחה לא נכונה",
      ];
    }
    if (domain === "marketplace") {
      return [
        "מי שני הצדדים במערכת ומי מהם חשוב להבין קודם",
        "מי חייב להיכנס ראשון כדי שהמערכת לא תרגיש ריקה",
      ];
    }
    if (domain === "booking-scheduling") {
      return [
        "מי מזמין בפועל ומי מקבל את ההזמנה או מנהל את הזמינות",
        "מי חי בתוך היומן או בתפעול לאורך היום",
      ];
    }
    if (domain === "crm-followup") {
      return [
        "מי מחזיק את הלידים או הלקוחות ביום-יום",
        "מי אחראי בפועל על follow-up ועל הצעד הבא",
      ];
    }
    return ["מי הבן אדם שבאמת צריך את זה"];
  }

  if (!problem) {
    if (projectType === "landing-page") {
      return [
        "מה גורם לקהל לא לעצור ולהשאיר ליד היום",
        "מה ההבטחה השיווקית שהעמוד חייב להבהיר מיד",
      ];
    }
    if (domain === "commerce-storefront") {
      return [
        "מה בדיוק נשבר היום באתר: קנייה, סליקה, מלאי, מחירים, משלוחים או ניהול מוצרים",
        "האם הכאב העיקרי הוא בצד הלקוח הקונה או בצד הצוות שמנהל את האתר",
      ];
    }
    if (domain === "marketplace") {
      return [
        "מה נשבר היום בין שני הצדדים: מציאת התאמה, אמון, תמחור או סגירת עסקה",
        "מה מונע מהשוק הזה לעבוד חלק כבר מהרגע הראשון",
      ];
    }
    if (domain === "booking-scheduling") {
      return [
        "מה נשבר היום בהזמנת התורים: זמינות, אישור, ביטולים או תיאום",
        "איפה הלקוח או הספק נתקעים בתהליך ההזמנה",
      ];
    }
    if (domain === "crm-followup") {
      return [
        "איפה המעקב נשבר היום על ליד, לקוח או חידוש",
        "מה הפעולה הידנית שחוזרת שוב ושוב וגורמת לפספוסים",
      ];
    }
    if (domain === "services-content") {
      return [
        "מה נשבר היום במכירת השירות או התוכן: אמון, הצעה, פנייה או רכישה",
        "איפה אנשים מתעניינים אבל לא מתקדמים לצעד הבא",
      ];
    }
    if (domain === "admin-dashboard") {
      return [
        "מה נשבר היום בלי הדשבורד: מידע מפוזר, חריגות שמגלים מאוחר או חוסר בהירות מה דחוף",
        "איזו החלטה תפעולית מתקבלת היום מאוחר מדי או בלי מספיק ודאות",
      ];
    }
    if (projectType === "internal-tool") {
      return [
        "איזה צוואר בקבוק תפעולי פוגע בעבודה היומית",
        "מה נשבר כשאין בעלות ברורה על התור",
      ];
    }
    if (projectType === "commerce-ops") {
      return [
        "איפה הזמנות, קטלוג או מלאי נופלים בין בעלי תפקידים",
        "מה נשבר היום במסחר בגלל שאין מסך אחד ברור לצוות",
      ];
    }
    if (projectType === "saas") {
      return [
        "מה קורס בתהליך ה-follow-up היום",
        "מה הפעולה הידנית שחוזרת שוב ושוב ופוגעת בעקביות",
      ];
    }
    return [
      "מה הבעיה הכי כואבת של קהל היעד",
      "מה עוצר אותם היום מלהתקדם",
    ];
  }

  if (!solution) {
    if (projectType === "landing-page") {
      return [
        "איך נראה דף נחיתה מוצלח מבחינת ההצעה, האמון וה-CTA",
        "איזו פעולה המשתמש צריך לבצע מיד כשהעמוד ברור לו",
      ];
    }
    if (domain === "commerce-storefront") {
      return [
        "מה חייב להיכנס ל־v1: קנייה מלאה עם סליקה, או קודם קטלוג + יצירת הזמנה",
        "אילו יכולות מסחר חייבות להיסגר כבר בגרסה הראשונה ואילו יכולות יכולות לחכות",
      ];
    }
    if (domain === "marketplace") {
      return [
        "מה חייב לעבוד כבר ב־v1 כדי שה־marketplace ירגיש חי ולא ריק",
        "האם קודם צריך חיפוש והתאמה, בקשת הצעת מחיר, או גם תשלום בתוך המערכת",
      ];
    }
    if (domain === "booking-scheduling") {
      return [
        "מה חייב לעבוד כבר ב־v1: זמינות, בחירת זמן, אישור, תזכורות או תשלום",
        "מה המשתמש חייב להצליח לסגור בלי לדבר עם מישהו ידנית",
      ];
    }
    if (domain === "crm-followup") {
      return [
        "מה חייב לעבוד כבר ב־v1: בעלות, תזכורות, timeline, stages או אוטומציות",
        "מה המערכת חייבת למנוע כדי שלא יפספסו ליד נוסף",
      ];
    }
    if (projectType === "internal-tool") {
      return [
        "איך נראה מסך עבודה מוצלח עבור הנציג",
        "איזו פעולה ראשונה חייבת להיות ברורה בכל תיק או תור",
      ];
    }
    if (projectType === "commerce-ops") {
      return [
        "איך נראה מרכז מסחר מוצלח עבור הצוות",
        "איזו פעולה ראשונה חייבת להיות ברורה על הזמנה, קטלוג או חריגת מלאי",
      ];
    }
    if (projectType === "saas") {
      return [
        "איך נראה follow-up מוצלח בתוך המוצר",
        "מה המשתמש חייב לראות או לקבל כדי לא לפספס ליד נוסף",
      ];
    }
    return ["איך נראה פתרון מוצלח מבחינתם"];
  }

  if (!buildDirection) {
    if (projectType === "landing-page") {
      return [
        "מה ההבטחה הראשית שחייבת להופיע מעל הקפל",
        "איזו הוכחת אמון תחזק את ה-CTA המרכזי",
      ];
    }
    if (domain === "commerce-storefront") {
      return [
        "האם הלקוח אמור לקנות בלי התחברות או שחייבים חשבון לפני הזמנה",
        "האם צריך כבר עכשיו מלאי אמיתי, וריאציות, משלוחים, מעקב הזמנה או אזור ניהול להזמנות",
      ];
    }
    if (domain === "marketplace") {
      return [
        "איך נראה ה־flow הראשון בין שני הצדדים: חיפוש, התאמה, פנייה, הצעת מחיר או תשלום",
        "מה חייב להיות ברור מיד כדי ששני הצדדים ירגישו שאפשר להתקדם בביטחון",
      ];
    }
    if (domain === "booking-scheduling") {
      return [
        "איך נראה ה־flow הראשון של הזמנה: בחירת שירות, זמן, אישור או תשלום",
        "מה חייב להיות ברור מיד כדי שאנשים לא יינטשו באמצע הזמנת התור",
      ];
    }
    if (domain === "crm-followup") {
      return [
        "מה הפעולה הראשונה שהמשתמש חייב להבין מיד על ליד או לקוח",
        "איך הבעלות, הסטטוס והצעד הבא חייבים להופיע בלי לחפש בין מסכים",
      ];
    }
    if (domain === "services-content") {
      return [
        "האם v1 אמור להוביל לפנייה, לרכישה ישירה, או למסלול משולב",
        "איזה חלק מהמכירה חייב להיות ברור מיד: ההצעה, המחיר, טופס ההתאמה או התשלום",
      ];
    }
    if (domain === "admin-dashboard") {
      return [
        "אילו מדדים וחריגות חייבים להיות גלויים מיד במסך הראשון",
        "מה המשתמש צריך לעשות מהרגע שהוא מזהה בעיה: רק לראות, או גם לפעול מתוך הדשבורד",
      ];
    }
    if (projectType === "internal-tool") {
      return [
        "מה הפעולה הראשונה שכל נציג חייב להבין בלי הדרכה",
        "איפה הבעלות על התור חייבת להיות גלויה מיד",
      ];
    }
    if (projectType === "commerce-ops") {
      return [
        "מה חייב להיות גלוי מיד על הזמנה, מלאי או קטלוג כדי לדעת מה דחוף",
        "מה הפעולה הבאה שכל איש מסחר צריך להבין בלי לחפש בין מסכים",
      ];
    }
    if (projectType === "saas") {
      return [
        "מה הפעולה הראשונה אחרי כניסה למוצר",
        "איזה follow-up חייב להופיע בלי עבודת יד",
      ];
    }
    return [
      "מה חייב להיות ברור במסך הראשון",
      "מה הפעולה הראשונה שהמשתמש צריך להבין מיד",
    ];
  }

  if (domain === "commerce-storefront") {
    return [
      "האם v1 כולל סליקה מלאה או רק יצירת הזמנה",
      "אילו יכולות מסחר נוספות כמו מלאי, וריאציות, משלוחים, מעקב, wishlist או חיבור לספקים נשארו פתוחות",
    ];
  }

  if (projectType === "landing-page") {
    return [
      "מה ההבטחה הראשית שחייבת להופיע מעל הקפל",
      "איזה הוכחת אמון תחזק את ה-CTA המרכזי",
    ];
  }
  if (projectType === "internal-tool") {
    return [
      "איפה הבעלות על התור חייבת להיות גלויה",
      "מה הפעולה הבאה שכל נציג חייב להבין בלי הדרכה",
    ];
  }
  if (projectType === "commerce-ops") {
    return [
      "איפה חריגות הזמנה או מלאי חייבות להיות גלויות מיד",
      "מה הפעולה הבאה שכל איש מסחר צריך להבין בלי לחפש בין מסכים",
    ];
  }
  if (projectType === "saas") {
    return [
      "מה הפעולה הראשונה אחרי כניסה למוצר",
      "איזה follow-up חייב להופיע בלי עבודת יד",
    ];
  }

  return [
    "איך הם משתמשים היום",
    "איך נראה פתרון מוצלח מבחינתם",
  ];
}

function buildConversationSummary(session) {
  // AGT-001D §3 — the summary is the agent's last summarySnapshot.
  const agentSnapshot = session?.conversation?.summarySnapshot;
  if (agentSnapshot && typeof agentSnapshot === "object") {
    return {
      understoodTitle: "ממה שכבר ברור לי",
      understoodItems: Array.isArray(agentSnapshot.understoodItems) ? [...agentSnapshot.understoodItems] : [],
      missingTitle: "מה שעוד לא סגור לי",
      missingItems: Array.isArray(agentSnapshot.missingItems) ? [...agentSnapshot.missingItems] : [],
      projectType: typeof agentSnapshot.projectType === "string" ? agentSnapshot.projectType : "unknown",
      projectTypeLabel: typeof agentSnapshot.projectType === "string" && agentSnapshot.projectType
        ? agentSnapshot.projectType
        : "הפרויקט",
    };
  }
  return {
    understoodTitle: "ממה שכבר ברור לי",
    understoodItems: [],
    missingTitle: "מה שעוד לא סגור לי",
    missingItems: [],
    projectType: "unknown",
    projectTypeLabel: "unknown",
  };
}

function resolveProviderRuntime(session) {
  const conversation = normalizeObject(session?.conversation);
  const summary = normalizeObject(buildConversationSummary(session));
  const providerExecution = normalizeObject(session?.providerExecution);
  const providerAvailabilityOverrides = resolveSessionProviderAvailabilityOverrides(session);
  const selectedProviderId = session?.providerRuntime?.selectedProviderId
    ?? session?.initialInput?.providerChoice
    ?? "openai";
  const selectedModelFamily = resolveSelectedModelFamily(session);
  const selectedIntelligence = resolveSelectedIntelligenceLevel(session);
  const providerAvailability = resolveProviderAvailability(providerExecution, selectedProviderId, providerAvailabilityOverrides);
  const lastCall = normalizeObject(providerExecution.lastCall);
  const lastError = normalizeObject(providerExecution.lastError);
  const selectedProvider = resolveOnboardingAgentProvider(selectedProviderId);
  const lastProvider = resolveOnboardingAgentProvider(lastCall.finalProviderId ?? lastCall.providerId ?? selectedProviderId);
  const runtimeMode = providerExecution.deliveryMode === "live-api"
    ? "provider-backed-live"
    : providerExecution.deliveryMode === "degraded-shell"
      ? "provider-backed-degraded"
      : "provider-backed-shell";
  const availabilityLine = buildResolvedProviderAvailabilityList(providerExecution, providerAvailabilityOverrides)
    .map((provider) => `${provider.companyLabel}: ${provider.availabilityStatus === "ready" ? "ready" : provider.availabilityReason ?? provider.availabilityStatus}`)
    .join(" · ");
  const costLine = providerExecution.costTotals?.pricedCallCount
    ? `cost est: $${Number(providerExecution.costTotals.estimatedCostUsd ?? 0).toFixed(6)} · ${providerExecution.costTotals.pricingSource ?? "bundled-estimate"}`
    : "cost est: no priced live calls yet";
  const summaryLine = providerExecution.deliveryMode === "live-api" && lastCall.model
    ? lastCall.failedOver === true && lastCall.initialProviderId && lastCall.finalProviderId
      ? "אני ממשיך איתך כרגיל, גם אם הייתי צריך להישען על נתיב אחר ברקע."
      : "אני ממשיך איתך כרגיל, בלי לשבור את הרצף של השיחה."
    : providerExecution.deliveryMode === "degraded-shell"
      ? lastError.errorClass === "rate-limited"
        ? "יש כרגע עומס קטן ברקע, אבל אני ממשיך איתך מאותה נקודה."
        : "יש כרגע עיכוב זמני ברקע, אבל אני ממשיך איתך מאותה נקודה."
    : providerAvailability.availabilityStatus === "missing-key"
      ? "כרגע אני נשאר עם מה שזמין כאן, כדי לא לשבור את השיחה."
      : "אני ממשיך איתך מאותה נקודה.";
  const recoveryLine = [
    lastCall.recoveredByRetry === true ? "retry recovered" : "",
    lastCall.failedOver === true ? "failover survived" : "",
  ].filter(Boolean).join(" · ");
  const enforcementLine = providerExecution.deliveryMode === "live-api"
    ? `גם אם מחליפים מודל בדרך, אני עדיין לא מתקדם לפני שהתמונה באמת ברורה.${recoveryLine ? ` ${recoveryLine}.` : ""}`
    : providerExecution.deliveryMode === "degraded-shell"
      ? "גם כשיש גיבוי זמני, השיחה לא מתקדמת בכוח. קודם מחדדים, ואז ממשיכים."
      : "גם אם משהו מתחלף ברקע, אני עדיין לא מתקדם לפני שהתמונה באמת ברורה.";
  const accountingLine = providerExecution.usageTotals?.requestCount
    ? `usage: ${providerExecution.usageTotals.requestCount} live calls · ${providerExecution.usageTotals.totalTokens} total tokens · ${costLine}${Number(providerExecution.recoveryTotals?.retryCount ?? 0) > 0 ? ` · retries: ${providerExecution.recoveryTotals.retryCount}` : ""}${Number(providerExecution.recoveryTotals?.failoverCount ?? 0) > 0 ? ` · failovers: ${providerExecution.recoveryTotals.failoverCount}` : ""}`
    : "";
  const operatorTruthLine = providerExecution.deliveryMode === "live-api"
    ? `health: healthy · active provider: ${lastProvider.companyLabel} · model: ${lastCall.model ?? "unknown-model"}`
    : providerExecution.deliveryMode === "degraded-shell"
      ? `health: degraded · error: ${lastError.errorClass ?? "provider-error"}${lastError.retryAfterSeconds ? ` · retry after ~${lastError.retryAfterSeconds}s` : ""} · fallback: canonical-question continuity`
      : `health: standby · ${availabilityLine}`;
  const tradeoffLine = `מודל ${selectedModelFamily.modelLabel} · עומק ${selectedIntelligence.intelligenceLabel} · ${selectedModelFamily.tradeoffLabel}. ${selectedIntelligence.tradeoffLabel}.`;
  const userFacingAvailabilityLine = buildResolvedProviderAvailabilityList(providerExecution, providerAvailabilityOverrides)
    .filter((provider) => provider.availabilityStatus !== "ready")
    .map((provider) => `${provider.companyLabel} עדיין לא זמין כרגע.`)
    .join(" ");
  return createOnboardingProviderRuntime({
    selectedProviderId,
    selectedModelFamilyId: selectedModelFamily.modelFamilyId,
    selectedIntelligenceLevel: selectedIntelligence.intelligenceLevelId,
    sessionId: session?.sessionId ?? null,
    currentQuestionPath: summary.learnedQuestionPath ?? [],
    learningStatus: summary.learningStatus ?? "partial",
    availableProviders: buildResolvedProviderAvailabilityList(providerExecution, providerAvailabilityOverrides),
    availableModelFamilies: buildModelAvailabilityList(selectedProviderId, providerAvailability.availabilityStatus ?? "unknown"),
    availableIntelligenceLevels: buildIntelligenceAvailabilityList(),
    runtimeMode,
    deliveryMode: providerExecution.deliveryMode ?? "shell",
    availabilityStatus: providerAvailability.availabilityStatus ?? "unknown",
    availabilityReason: providerAvailability.availabilityReason ?? null,
    lastModelUsed: lastCall.model ?? null,
    usageTotals: providerExecution.usageTotals ?? null,
    summaryLine,
    enforcementLine,
    accountingLine,
    availabilityLine: userFacingAvailabilityLine,
    operatorTruthLine,
    tradeoffLine: `מודל ${selectedModelFamily.modelLabel} · עומק ${selectedIntelligence.intelligenceLabel} · ${selectedModelFamily.tradeoffLabel}. ${selectedIntelligence.tradeoffLabel}.`,
    healthStatus: providerExecution.healthStatus ?? "standby",
  });
}

function buildConversationStateEnvelope(session) {
  const conversation = session?.conversation ?? null;
  if (!conversation) {
    return null;
  }

  const hasAgentState = Boolean(conversation.summarySnapshot || conversation.understanding || conversation.lastAgentDecision);
  const agentQuestion = normalizeString(conversation.lastAgentDecision?.nextQuestion, "");
  const agentReady = conversation.lastAgentDecision?.nextMove === "advance-to-skeleton"
    && conversation.lastAgentDecision?.skeletonReady?.ready === true;
  const currentQuestion = hasAgentState && agentQuestion
    ? {
        id: "agent-next-question",
        title: agentQuestion,
        placeholder: "",
        reason: "agent-envelope",
      }
    : null;
  const currentIndex = normalizeArray(conversation.transcript)
    .filter((entry) => entry.speaker === "user" && normalizeString(entry.text, "")).length;
  const isComplete = hasAgentState
    ? agentReady
    : resolveNextConversationQuestionId(session, conversation.answers) === null;
  const totalQuestions = hasAgentState
    ? currentIndex + (currentQuestion ? 1 : 0)
    : Math.max(
        buildVisibleAdaptiveQuestionPlan(session, conversation.answers).length,
        currentIndex + (currentQuestion ? 1 : 0),
      );

  return {
    providerRuntime: resolveProviderRuntime(session),
    onboardingConversation: {
      sessionId: session.sessionId,
      transcript: conversation.transcript,
      summary: buildConversationSummary(session),
      currentQuestion,
      currentIndex,
      totalQuestions,
      isComplete,
      completionReason: isComplete ? buildCompletionReason(session) : null,
      answers: conversation.answers,
      providerRuntime: resolveProviderRuntime(session),
      // AGT-001D step 3 — expose agent-led fields next to legacy fields.
      // Consumers MAY read these. Legacy fields stay for backward compatibility.
      understanding: conversation.understanding ?? null,
      summarySnapshot: conversation.summarySnapshot ?? null,
      lastAgentDecision: conversation.lastAgentDecision ?? null,
      lastAgentTurn: conversation.pendingTurn ?? null,
    },
    lastAgentTurn: conversation.pendingTurn ?? null,
  };
}

function createConversationState(session) {
  return createEmptyAgentConversationState();
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

// =====================================================================
// AGT-001D Step 3 — Agent-led turn pipeline
// =====================================================================
// Per docs/operating-system/discovery-agent-role.md the live discovery
// agent is the sole owner of every conversation turn. Nexus is persistence.
// The functions below are the single seam between the agent's envelope
// and the persisted session state. No other code path is permitted to
// mutate the conversation as a result of a user message.

const AGENT_UNDERSTANDING_SLOTS = ["audience", "problem", "solution", "class", "actor", "workflow", "risk"];

function createEmptyAgentUnderstanding() {
  const empty = {};
  for (const slot of AGENT_UNDERSTANDING_SLOTS) empty[slot] = [];
  return empty;
}

function createEmptyAgentSummarySnapshot() {
  return {
    understoodItems: [],
    missingItems: [],
    projectType: "unknown",
    projectTypeConfidence: 0,
    actors: [],
  };
}

function createEmptyAgentConversationState() {
  return {
    answers: {},
    transcript: [],
    understanding: createEmptyAgentUnderstanding(),
    summarySnapshot: createEmptyAgentSummarySnapshot(),
    lastProcessedClientMessageId: null,
    lastAgentDecision: null,
    pendingTurn: null,
  };
}

function migrateLegacyAnswersToAgentUnderstanding(answers = {}) {
  const source = normalizeObject(answers);
  const understanding = createEmptyAgentUnderstanding();
  const legacyMappings = [
    ["target-audience", "audience"],
    ["core-problem", "problem"],
    ["successful-solution", "solution"],
    ["project-type", "class"],
    ["workflow-detail", "workflow"],
  ];
  for (const [answerKey, slot] of legacyMappings) {
    const value = normalizeString(source[answerKey], "");
    if (value) {
      understanding[slot].push({ value, source: `legacy:${answerKey}` });
    }
  }
  return understanding;
}

function normalizeAgentConversationState(session) {
  const existing = normalizeObject(session?.conversation);
  const filteredTranscript = buildAgentVisibleTranscript(existing.transcript);
  const understanding = existing.understanding && typeof existing.understanding === "object"
    ? existing.understanding
    : migrateLegacyAnswersToAgentUnderstanding(existing.answers);
  const summarySnapshot = existing.summarySnapshot && typeof existing.summarySnapshot === "object"
    ? existing.summarySnapshot
    : createEmptyAgentSummarySnapshot();
  return {
    ...createEmptyAgentConversationState(),
    ...existing,
    transcript: filteredTranscript,
    understanding,
    summarySnapshot,
    answers: deriveLegacyAnswersFromAgentTurn({
      transcript: filteredTranscript,
      understanding,
      initialInput: session?.initialInput,
    }),
    lastProcessedClientMessageId: existing.lastProcessedClientMessageId ?? null,
    lastAgentDecision: existing.lastAgentDecision ?? null,
    pendingTurn: existing.pendingTurn ?? null,
  };
}

// Apply an envelope.understandingDelta to the existing understanding map.
// Order: removed → corrected → added. This avoids double-touching the same value.
function applyUnderstandingDelta(prevUnderstanding, delta) {
  const next = {};
  for (const slot of AGENT_UNDERSTANDING_SLOTS) {
    next[slot] = Array.isArray(prevUnderstanding?.[slot]) ? [...prevUnderstanding[slot]] : [];
  }
  const safe = delta && typeof delta === "object" ? delta : {};
  const removed = Array.isArray(safe.removed) ? safe.removed : [];
  const corrected = Array.isArray(safe.corrected) ? safe.corrected : [];
  const added = Array.isArray(safe.added) ? safe.added : [];

  for (const item of removed) {
    if (!AGENT_UNDERSTANDING_SLOTS.includes(item?.slot)) continue;
    next[item.slot] = next[item.slot].filter((entry) => entry.value !== item.value);
  }
  for (const item of corrected) {
    if (!AGENT_UNDERSTANDING_SLOTS.includes(item?.slot)) continue;
    const idx = next[item.slot].findIndex((entry) => entry.value === item.from);
    if (idx >= 0) {
      next[item.slot][idx] = { value: item.to, source: item.source ?? "" };
    } else {
      next[item.slot].push({ value: item.to, source: item.source ?? "" });
    }
  }
  for (const item of added) {
    if (!AGENT_UNDERSTANDING_SLOTS.includes(item?.slot)) continue;
    next[item.slot].push({ value: item.value, source: item.source ?? "" });
  }
  return next;
}

// Backward-compatible read model for the legacy `answers` dictionary shape.
// This is derived from the agent's truth — it is never the source of truth.
function deriveLegacyAnswersFromAgentTurn({ transcript = [], understanding = null, initialInput = null } = {}) {
  const firstValue = (slot) =>
    Array.isArray(understanding?.[slot]) && understanding[slot][0]
      ? understanding[slot][0].value
      : "";
  const hasProductTruth = AGENT_UNDERSTANDING_SLOTS.some((slot) =>
    Array.isArray(understanding?.[slot]) && understanding[slot].length > 0
  );
  const firstUserText = (transcript.find((entry) => entry.speaker === "user")?.text) ?? "";
  const seededIdea = normalizeString(initialInput?.visionText, normalizeString(initialInput?.goal, ""));
  const coreIdea = hasProductTruth ? (firstUserText || seededIdea) : "";
  const audience = firstValue("audience");
  const problem = firstValue("problem");
  const solution = firstValue("solution");
  return {
    "core-idea": coreIdea,
    "target-audience": audience,
    "core-problem": problem,
    "successful-solution": solution,
  };
}

// THE SINGLE STATE-UPDATE SEAM.
// Any code that wants to mutate the session as a result of a user message
// must do it through this function. Tests pin the contract.
function applyAgentTurn({
  session,
  envelope,
  userMessage = "",
  userMessageId = "",
  clientMessageId = null,
  providerExecution = null,
}) {
  if (!session) throw new Error("applyAgentTurn requires a session");
  if (!envelope || typeof envelope !== "object") {
    throw new Error("applyAgentTurn requires a completed agent envelope");
  }

  const prevConversation = session.conversation ?? createEmptyAgentConversationState();
  const transcript = buildAgentVisibleTranscript(prevConversation.transcript);
  const understanding = prevConversation.understanding ?? createEmptyAgentUnderstanding();

  const now = formatConversationTime();
  const userEntry = {
    id: userMessageId || `user-${transcript.filter((entry) => entry.speaker === "user").length + 1}`,
    speaker: "user",
    text: typeof userMessage === "string" ? userMessage : "",
    time: now,
  };
  const aiEntry = {
    id: `agent-${transcript.length + 2}`,
    speaker: "ai",
    text: typeof envelope.replyToUser === "string" ? envelope.replyToUser : "",
    time: now,
    responseSource: "agent-envelope",
  };

  const nextUnderstanding = applyUnderstandingDelta(understanding, envelope.understandingDelta);
  const nextTranscript = [...transcript, userEntry, aiEntry];

  const nextConversation = {
    ...prevConversation,
    transcript: nextTranscript,
    understanding: nextUnderstanding,
    summarySnapshot: envelope.summarySnapshot
      && typeof envelope.summarySnapshot === "object"
      ? envelope.summarySnapshot
      : prevConversation.summarySnapshot ?? createEmptyAgentSummarySnapshot(),
    lastProcessedClientMessageId: clientMessageId ?? prevConversation.lastProcessedClientMessageId ?? null,
    lastAgentDecision: {
      intent: envelope.intent,
      nextMove: envelope.nextMove,
      nextQuestion: envelope.nextQuestion ?? null,
      skeletonReady: envelope.skeletonReady,
      confidence: typeof envelope.confidence === "number" ? envelope.confidence : null,
      decidedAt: now,
    },
    pendingTurn: null,
  };
  // Legacy read-model: derive answers from the agent truth above.
  nextConversation.answers = deriveLegacyAnswersFromAgentTurn({
    transcript: nextTranscript,
    understanding: nextUnderstanding,
    initialInput: session.initialInput,
  });

  return {
    ...session,
    updatedAt: new Date().toISOString(),
    providerExecution: providerExecution ?? session.providerExecution,
    conversation: nextConversation,
  };
}

// Filter the transcript before it is sent back to the live agent.
// Without this hygiene the agent would read its own fabricated past replies
// from the pre-AGT-001D code path as if they were genuine history.
function buildAgentVisibleTranscript(prevTranscript = []) {
  if (!Array.isArray(prevTranscript)) return [];
  return prevTranscript
    .filter((entry) => {
      if (!entry || typeof entry !== "object") return false;
      if (entry.speaker === "user") return true;
      if (entry.speaker === "ai" && entry.responseSource === "agent-envelope") return true;
      return false;
    })
    .map((entry) => ({
      id: typeof entry.id === "string" ? entry.id : "",
      speaker: entry.speaker === "ai" ? "ai" : "user",
      text: typeof entry.text === "string" ? entry.text : "",
      ...(entry.speaker === "ai" ? { responseSource: "agent-envelope" } : {}),
    }));
}

export class OnboardingService {
  constructor() {
    this.sessions = new Map();
    this.actionRegistry = this.createActionRegistry();
    this.providerClient = new OnboardingProviderClient();
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
      learningContext: normalizeObject(parsedInput.learningContext),
      projectIntake: null,
      requiredActions: [],
      approvals: [],
      connectedSources: {
        repo: null,
      },
      providerExecution: createInitialProviderExecutionState(parsedInput.qaAvailabilityOverrides),
      providerRuntime: createOnboardingProviderRuntime({
        selectedProviderId: parsedInput.providerChoice ?? "openai",
        selectedModelFamilyId: parsedInput.modelFamilyId ?? "fast",
        selectedIntelligenceLevel: parsedInput.intelligenceLevel ?? "low",
        sessionId: null,
      }),
      conversation: null,
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

    session.conversation = createConversationState(session);

    this.sessions.set(session.sessionId, session);
    return session;
  }

  createProjectIntake({ projectName, visionText, uploadedFiles = [], externalLinks = [] }) {
    const projectIntake = buildProjectIntake({
      projectName,
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
      "select-provider": {
        actionSchema: {
          requiredKeys: ["providerId"],
        },
        handler: this.createProviderSelectionHandler.bind(this),
      },
      "select-model-family": {
        actionSchema: {
          requiredKeys: ["modelFamilyId"],
        },
        handler: this.createModelFamilySelectionHandler.bind(this),
      },
      "select-intelligence-level": {
        actionSchema: {
          requiredKeys: ["intelligenceLevel"],
        },
        handler: this.createIntelligenceLevelSelectionHandler.bind(this),
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
      projectName: payload.projectName ?? session.projectIntake?.projectName ?? session.projectDraft.name,
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

  createProviderSelectionHandler({ session, payload, now }) {
    const selectedProvider = resolveOnboardingAgentProvider(payload.providerId);
    const existingConversation = normalizeObject(session.conversation);
    const currentQuestionId = resolveNextConversationQuestionId(session, existingConversation.answers ?? {});
    const nextProviderExecution = normalizeObject(session.providerExecution);
    const providerAvailabilityOverrides = resolveSessionProviderAvailabilityOverrides(session);
    const providerAvailability = resolveProviderAvailability(
      nextProviderExecution,
      selectedProvider.providerId,
      providerAvailabilityOverrides,
    );
    if (providerAvailability.availabilityStatus !== "ready") {
      return {
        ...session,
        updatedAt: now,
        conversation: {
          ...existingConversation,
          transcript: [
            ...normalizeArray(existingConversation.transcript),
            decorateProviderBackedAiEntry({
              id: `ai-provider-unavailable-${Date.now()}`,
              speaker: "ai",
              text: `${selectedProvider.companyLabel} לא זמין כרגע כי חסר ${providerAvailability.availabilityReason}. Nexus נשארת עם provider חי זמין במקום לזייף שיחה חיצונית.`,
              time: formatConversationTime(),
              responseSource: "provider-unavailable",
            }, resolveProviderRuntime(session)),
          ],
        },
      };
    }
    const providerRuntime = createOnboardingProviderRuntime({
      selectedProviderId: selectedProvider.providerId,
      selectedModelFamilyId: resolveSelectedModelFamily(session).modelFamilyId,
      selectedIntelligenceLevel: resolveSelectedIntelligenceLevel(session).intelligenceLevelId,
      sessionId: session.sessionId,
      availableProviders: buildResolvedProviderAvailabilityList(nextProviderExecution, providerAvailabilityOverrides),
      availableModelFamilies: buildModelAvailabilityList(selectedProvider.providerId, providerAvailability.availabilityStatus ?? "unknown"),
      availableIntelligenceLevels: buildIntelligenceAvailabilityList(),
    });
    const updatedTranscript = [
      ...normalizeArray(existingConversation.transcript),
      decorateProviderBackedAiEntry({
        id: `ai-provider-${Date.now()}`,
        speaker: "ai",
        text: `עובר עכשיו ל־${selectedProvider.companyLabel} אבל שומר על אותם כללי intake של Nexus${currentQuestionId ? ` וממשיך מאותה שאלה: ${buildAgentPrompt(session, currentQuestionId)}` : "."}`,
        time: formatConversationTime(),
        responseSource: "provider-switch-status",
      }, providerRuntime),
    ];

    return {
      ...session,
      updatedAt: now,
      initialInput: {
        ...session.initialInput,
        providerChoice: selectedProvider.providerId,
      },
      providerExecution: {
        ...nextProviderExecution,
        availableProviders: buildProviderAvailabilityList(providerAvailabilityOverrides),
      },
      providerRuntime,
      conversation: {
        ...existingConversation,
        transcript: updatedTranscript,
      },
    };
  }

  createModelFamilySelectionHandler({ session, payload, now }) {
    const selectedProviderId = session?.providerRuntime?.selectedProviderId
      ?? session?.initialInput?.providerChoice
      ?? "openai";
    const selectedProvider = resolveOnboardingAgentProvider(selectedProviderId);
    const selectedModelFamily = resolveOnboardingModelFamily(selectedProviderId, payload.modelFamilyId);
    const existingConversation = normalizeObject(session.conversation);
    const providerAvailabilityOverrides = resolveSessionProviderAvailabilityOverrides(session);
    const providerRuntime = createOnboardingProviderRuntime({
      selectedProviderId,
      selectedModelFamilyId: selectedModelFamily.modelFamilyId,
      selectedIntelligenceLevel: resolveSelectedIntelligenceLevel(session).intelligenceLevelId,
      sessionId: session.sessionId,
      availableProviders: buildResolvedProviderAvailabilityList(normalizeObject(session.providerExecution), providerAvailabilityOverrides),
      availableModelFamilies: buildModelAvailabilityList(selectedProviderId, resolveProviderAvailability(normalizeObject(session.providerExecution), selectedProviderId, providerAvailabilityOverrides).availabilityStatus ?? "unknown"),
      availableIntelligenceLevels: buildIntelligenceAvailabilityList(),
    });

    return {
      ...session,
      updatedAt: now,
      initialInput: {
        ...session.initialInput,
        modelFamilyId: selectedModelFamily.modelFamilyId,
      },
      providerRuntime,
      conversation: {
        ...existingConversation,
        transcript: [
          ...normalizeArray(existingConversation.transcript),
          decorateProviderBackedAiEntry({
            id: `ai-model-${Date.now()}`,
            speaker: "ai",
            text: `אני משנה רגע את אופן החשיבה ברקע, אבל השיחה עצמה נשארת על אותו הכיוון.`,
            time: formatConversationTime(),
            responseSource: "provider-switch-status",
          }, providerRuntime),
        ],
      },
    };
  }

  createIntelligenceLevelSelectionHandler({ session, payload, now }) {
    const selectedProviderId = session?.providerRuntime?.selectedProviderId
      ?? session?.initialInput?.providerChoice
      ?? "openai";
    const selectedIntelligence = resolveOnboardingIntelligenceLevel(payload.intelligenceLevel);
    const existingConversation = normalizeObject(session.conversation);
    const providerAvailabilityOverrides = resolveSessionProviderAvailabilityOverrides(session);
    const providerRuntime = createOnboardingProviderRuntime({
      selectedProviderId,
      selectedModelFamilyId: resolveSelectedModelFamily(session).modelFamilyId,
      selectedIntelligenceLevel: selectedIntelligence.intelligenceLevelId,
      sessionId: session.sessionId,
      availableProviders: buildResolvedProviderAvailabilityList(normalizeObject(session.providerExecution), providerAvailabilityOverrides),
      availableModelFamilies: buildModelAvailabilityList(selectedProviderId, resolveProviderAvailability(normalizeObject(session.providerExecution), selectedProviderId, providerAvailabilityOverrides).availabilityStatus ?? "unknown"),
      availableIntelligenceLevels: buildIntelligenceAvailabilityList(),
    });

    return {
      ...session,
      updatedAt: now,
      initialInput: {
        ...session.initialInput,
        intelligenceLevel: selectedIntelligence.intelligenceLevelId,
      },
      providerRuntime,
      conversation: {
        ...existingConversation,
        transcript: [
          ...normalizeArray(existingConversation.transcript),
          decorateProviderBackedAiEntry({
            id: `ai-intelligence-${Date.now()}`,
            speaker: "ai",
            text: "אני מתאים רגע את עומק החידוד ברקע, אבל ממשיך איתך על אותו ההקשר.",
            time: formatConversationTime(),
            responseSource: "provider-switch-status",
          }, providerRuntime),
        ],
      },
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

  async submitConversationTurn({ sessionId, answer = "", qaFaultMode = null, clientMessageId = null } = {}) {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    const normalizedAnswer = typeof answer === "string" ? answer.trim() : "";
    if (!normalizedAnswer) {
      return buildConversationStateEnvelope(session);
    }

    // Initialize the agent-led conversation state on first turn.
    // Per directive §1 the agent must run BEFORE any pre-seeding of answers.
    const prevConversation = normalizeAgentConversationState(session);

    // §C — idempotency. Re-sending the same message returns the prior state.
    if (
      clientMessageId
      && prevConversation.lastProcessedClientMessageId === clientMessageId
    ) {
      const echoed = { ...session, conversation: prevConversation };
      return buildConversationStateEnvelope(echoed);
    }

    // §B — transcript hygiene before sending to the live agent.
    const cleanTranscript = buildAgentVisibleTranscript(prevConversation.transcript);
    const userMessageId = `user-${cleanTranscript.filter((entry) => entry.speaker === "user").length + 1}`;

    const providerRuntime = resolveProviderRuntime(session);
    const turnResult = await this.providerClient.generateAgentTurn({
      providerId: providerRuntime.selectedProviderId,
      modelFamilyId: providerRuntime.selectedModelFamilyId,
      intelligenceLevel: providerRuntime.selectedIntelligenceLevel,
      projectGoal: session.initialInput?.goal ?? session.projectDraft?.goal ?? "",
      transcript: cleanTranscript,
      currentUnderstanding: {
        understanding: prevConversation.understanding ?? createEmptyAgentUnderstanding(),
        summarySnapshot: prevConversation.summarySnapshot ?? createEmptyAgentSummarySnapshot(),
      },
      userMessage: normalizedAnswer,
      userMessageId,
      qaFaultMode,
    });

    // §9 — if the agent did not return a valid envelope we MUST NOT save,
    // MUST NOT advance, and MUST NOT fabricate a replyToUser.
    if (!turnResult || turnResult.status !== "completed" || !turnResult.envelope) {
      const lastAttempt = Array.isArray(turnResult?.attempts)
        ? turnResult.attempts[turnResult.attempts.length - 1]
        : null;
      const pendingTurn = {
        status: turnResult?.status ?? "unknown",
        error: turnResult?.error ?? null,
        pendingUserMessage: normalizedAnswer,
        pendingClientMessageId: clientMessageId,
        durationMs: lastAttempt?.durationMs ?? null,
      };
      const pendingSession = {
        ...session,
        conversation: {
          ...prevConversation,
          pendingTurn,
        },
      };
      this.sessions.set(sessionId, pendingSession);
      const baseEnvelope = buildConversationStateEnvelope(pendingSession);
      return {
        ...baseEnvelope,
        lastAgentTurn: pendingTurn,
      };
    }

    // Single state-update seam.
    const providerExecution = createProviderExecutionFromResult(
      normalizeObject(session.providerExecution),
      turnResult,
    );
    const updatedSession = applyAgentTurn({
      session: {
        ...session,
        conversation: prevConversation,
      },
      envelope: turnResult.envelope,
      userMessage: normalizedAnswer,
      userMessageId,
      clientMessageId,
      providerExecution,
    });

    this.sessions.set(sessionId, updatedSession);
    return buildConversationStateEnvelope(updatedSession);
  }

  async primeDiscoveryAgentResponse({ sessionId, qaFaultMode = null } = {}) {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    const visionText = normalizeString(session.initialInput?.goal, session.projectDraft?.goal ?? "");
    if (!visionText) {
      return buildConversationStateEnvelope({
        ...session,
        conversation: normalizeAgentConversationState(session),
      });
    }

    return await this.submitConversationTurn({
      sessionId,
      answer: visionText,
      qaFaultMode,
      clientMessageId: `prime:${sessionId}`,
    });
  }

  async generateProductSkeletonFromDiscovery({ sessionId, qaFaultMode = null } = {}) {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    const conversation = normalizeAgentConversationState(session);
    const lastDecision = normalizeObject(conversation.lastAgentDecision);
    const skeletonReady = normalizeObject(lastDecision.skeletonReady);
    const canHandoff = lastDecision.nextMove === "advance-to-skeleton" && skeletonReady.ready === true;

    if (!canHandoff) {
      const blocked = {
        taskId: "SKEL-001",
        status: "blocked",
        reason: "discovery-agent-handoff-not-ready",
        productSkeletonAgent: {
          status: "blocked",
          error: { code: "discovery-agent-handoff-not-ready", status: null },
        },
      };
      const blockedSession = {
        ...session,
        conversation: {
          ...conversation,
          productSkeletonAgent: blocked.productSkeletonAgent,
        },
      };
      this.sessions.set(sessionId, blockedSession);
      return blocked;
    }

    const providerRuntime = resolveProviderRuntime(session);
    const cleanTranscript = buildAgentVisibleTranscript(conversation.transcript);
    const discoveryHandoff = {
      taskId: "SKEL-001",
      fromAgent: "project-discovery-agent",
      toAgent: "product-skeleton-agent",
      understanding: conversation.understanding ?? createEmptyAgentUnderstanding(),
      summarySnapshot: conversation.summarySnapshot ?? createEmptyAgentSummarySnapshot(),
      enoughTruthDecision: {
        nextMove: lastDecision.nextMove,
        skeletonReady,
        confidence: lastDecision.confidence ?? null,
      },
      transcriptContext: cleanTranscript,
      unknowns: normalizeArray(conversation.summarySnapshot?.missingItems),
      assumptions: [],
    };

    const skeletonResult = await this.providerClient.generateProductSkeleton({
      providerId: providerRuntime.selectedProviderId,
      modelFamilyId: providerRuntime.selectedModelFamilyId,
      intelligenceLevel: providerRuntime.selectedIntelligenceLevel,
      projectGoal: session.initialInput?.goal ?? session.projectDraft?.goal ?? "",
      transcript: cleanTranscript,
      discoveryHandoff,
      qaFaultMode,
    });

    if (!skeletonResult || skeletonResult.status !== "completed" || !skeletonResult.envelope) {
      const lastAttempt = Array.isArray(skeletonResult?.attempts)
        ? skeletonResult.attempts[skeletonResult.attempts.length - 1]
        : null;
      const pendingSkeleton = {
        taskId: "SKEL-001",
        status: skeletonResult?.status ?? "unknown",
        responseSource: "no-agent-response",
        error: skeletonResult?.error ?? null,
        durationMs: lastAttempt?.durationMs ?? null,
      };
      const pendingSession = {
        ...session,
        conversation: {
          ...conversation,
          productSkeletonAgent: pendingSkeleton,
        },
      };
      this.sessions.set(sessionId, pendingSession);
      return {
        taskId: "SKEL-001",
        status: pendingSkeleton.status,
        productSkeletonAgent: pendingSkeleton,
      };
    }

    const providerExecution = createProviderExecutionFromResult(
      normalizeObject(session.providerExecution),
      skeletonResult,
    );
    const productSkeletonAgent = {
      taskId: "SKEL-001",
      status: "completed",
      responseSource: "provider-composed",
      providerId: skeletonResult.providerId,
      model: skeletonResult.model ?? null,
      requestId: skeletonResult.requestId ?? null,
      envelope: skeletonResult.envelope,
      usage: skeletonResult.usage ?? null,
    };
    const updatedSession = {
      ...session,
      updatedAt: new Date().toISOString(),
      providerExecution,
      productSkeletonAgentOutput: skeletonResult.envelope,
      conversation: {
        ...conversation,
        productSkeletonAgent,
      },
    };
    this.sessions.set(sessionId, updatedSession);

    return {
      taskId: "SKEL-001",
      status: "completed",
      productSkeletonAgent,
      productSkeletonAgentOutput: skeletonResult.envelope,
      providerRuntime: resolveProviderRuntime(updatedSession),
    };
  }

  async generateVisualProductSkeletonFromProductSkeleton({ sessionId, qaFaultMode = null } = {}) {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    const conversation = normalizeAgentConversationState(session);
    const productSkeletonAgentOutput = normalizeObject(session.productSkeletonAgentOutput);
    const canHandoff = productSkeletonAgentOutput.agentId === "product-skeleton-agent"
      && productSkeletonAgentOutput.responseSource === "provider-composed"
      && productSkeletonAgentOutput.handoffToVisualSkeleton?.allowed === true;

    if (!canHandoff) {
      const blocked = {
        taskId: "VSKEL-001",
        status: "blocked",
        reason: "product-skeleton-agent-handoff-not-ready",
        visualProductSkeletonAgent: {
          status: "blocked",
          error: { code: "product-skeleton-agent-handoff-not-ready", status: null },
        },
      };
      const blockedSession = {
        ...session,
        conversation: {
          ...conversation,
          visualProductSkeletonAgent: blocked.visualProductSkeletonAgent,
        },
      };
      this.sessions.set(sessionId, blockedSession);
      return blocked;
    }

    const providerRuntime = resolveProviderRuntime(session);
    const visualResult = await this.providerClient.generateVisualProductSkeleton({
      providerId: providerRuntime.selectedProviderId,
      modelFamilyId: providerRuntime.selectedModelFamilyId,
      intelligenceLevel: providerRuntime.selectedIntelligenceLevel,
      projectGoal: session.initialInput?.goal ?? session.projectDraft?.goal ?? "",
      productSkeletonAgentOutput,
      designSourceInput: session.initialInput?.designSourceInput ?? null,
      userDesignPreference: session.initialInput?.userDesignPreference ?? "",
      qaFaultMode,
    });

    if (!visualResult || visualResult.status !== "completed" || !visualResult.envelope) {
      const lastAttempt = Array.isArray(visualResult?.attempts)
        ? visualResult.attempts[visualResult.attempts.length - 1]
        : null;
      const pendingVisualSkeleton = {
        taskId: "VSKEL-001",
        status: visualResult?.status ?? "unknown",
        responseSource: "no-agent-response",
        error: visualResult?.error ?? null,
        durationMs: lastAttempt?.durationMs ?? null,
      };
      const pendingSession = {
        ...session,
        conversation: {
          ...conversation,
          visualProductSkeletonAgent: pendingVisualSkeleton,
        },
      };
      this.sessions.set(sessionId, pendingSession);
      return {
        taskId: "VSKEL-001",
        status: pendingVisualSkeleton.status,
        visualProductSkeletonAgent: pendingVisualSkeleton,
      };
    }

    const providerExecution = createProviderExecutionFromResult(
      normalizeObject(session.providerExecution),
      visualResult,
    );
    const visualProductSkeletonAgent = {
      taskId: "VSKEL-001",
      status: "completed",
      responseSource: "provider-composed",
      providerId: visualResult.providerId,
      model: visualResult.model ?? null,
      requestId: visualResult.requestId ?? null,
      envelope: visualResult.envelope,
      usage: visualResult.usage ?? null,
    };
    const updatedSession = {
      ...session,
      updatedAt: new Date().toISOString(),
      providerExecution,
      visualProductSkeletonAgentOutput: visualResult.envelope,
      conversation: {
        ...conversation,
        visualProductSkeletonAgent,
      },
    };
    this.sessions.set(sessionId, updatedSession);

    return {
      taskId: "VSKEL-001",
      status: "completed",
      visualProductSkeletonAgent,
      visualProductSkeletonAgentOutput: visualResult.envelope,
      productSkeletonAgentOutput,
      providerRuntime: resolveProviderRuntime(updatedSession),
    };
  }

  async streamConversationTurn({ sessionId, answer = "", qaFaultMode = null, clientMessageId = null, onEvent = async () => {} }) {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    const normalizedAnswer = typeof answer === "string" ? answer.trim() : "";
    if (!normalizedAnswer) {
      const payload = buildConversationStateEnvelope(session);
      await onEvent({ event: "conversation-state", data: payload });
      return payload;
    }

    const prevConversation = normalizeAgentConversationState(session);
    if (
      clientMessageId
      && prevConversation.lastProcessedClientMessageId === clientMessageId
    ) {
      const echoed = buildConversationStateEnvelope({ ...session, conversation: prevConversation });
      await onEvent({ event: "conversation-state", data: echoed });
      return echoed;
    }
    const cleanTranscript = buildAgentVisibleTranscript(prevConversation.transcript);
    const userMessageId = `user-${cleanTranscript.filter((entry) => entry.speaker === "user").length + 1}`;
    const providerRuntime = resolveProviderRuntime(session);

    await onEvent({
      event: "agent-turn-start",
      data: {
        sessionId,
        providerId: providerRuntime.selectedProviderId,
      },
    });

    const turnResult = await this.providerClient.generateAgentTurn({
      providerId: providerRuntime.selectedProviderId,
      modelFamilyId: providerRuntime.selectedModelFamilyId,
      intelligenceLevel: providerRuntime.selectedIntelligenceLevel,
      projectGoal: session.initialInput?.goal ?? session.projectDraft?.goal ?? "",
      transcript: cleanTranscript,
      currentUnderstanding: {
        understanding: prevConversation.understanding ?? createEmptyAgentUnderstanding(),
        summarySnapshot: prevConversation.summarySnapshot ?? createEmptyAgentSummarySnapshot(),
      },
      userMessage: normalizedAnswer,
      userMessageId,
      qaFaultMode,
      onStatus: async (statusEvent) => {
        await onEvent({ event: "agent-provider-status", data: statusEvent });
      },
    });

    if (!turnResult || turnResult.status !== "completed" || !turnResult.envelope) {
      const lastAttempt = Array.isArray(turnResult?.attempts)
        ? turnResult.attempts[turnResult.attempts.length - 1]
        : null;
      const unavailable = {
        status: turnResult?.status ?? "unknown",
        error: turnResult?.error ?? null,
        pendingUserMessage: normalizedAnswer,
        pendingClientMessageId: clientMessageId,
        durationMs: lastAttempt?.durationMs ?? null,
      };
      const pendingSession = {
        ...session,
        conversation: {
          ...prevConversation,
          pendingTurn: unavailable,
        },
      };
      this.sessions.set(sessionId, pendingSession);
      const basePayload = buildConversationStateEnvelope(pendingSession);
      await onEvent({ event: "agent-turn-unavailable", data: unavailable });
      await onEvent({ event: "conversation-state", data: { ...basePayload, lastAgentTurn: unavailable } });
      return { ...basePayload, lastAgentTurn: unavailable };
    }

    const providerExecution = createProviderExecutionFromResult(
      normalizeObject(session.providerExecution),
      turnResult,
    );
    const updatedSession = applyAgentTurn({
      session: {
        ...session,
        conversation: prevConversation,
      },
      envelope: turnResult.envelope,
      userMessage: normalizedAnswer,
      userMessageId,
      clientMessageId,
      providerExecution,
    });

    this.sessions.set(sessionId, updatedSession);
    const payload = buildConversationStateEnvelope(updatedSession);
    await onEvent({ event: "agent-turn-completed", data: { envelope: turnResult.envelope } });
    await onEvent({ event: "conversation-state", data: payload });
    return payload;
  }

  getConversationState(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }
    if (!session.conversation) {
      session.conversation = createConversationState(session);
      this.sessions.set(sessionId, session);
    }
    return buildConversationStateEnvelope(session);
  }

  restartConversation(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    const updatedSession = {
      ...session,
      updatedAt: new Date().toISOString(),
      conversation: createConversationState(session),
    };

    this.sessions.set(sessionId, updatedSession);
    return buildConversationStateEnvelope(updatedSession);
  }

  async applyPostOnboardingCorrection({ sessionId, message = "", currentSurface = "understanding", qaFaultMode = null } = {}) {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    const normalizedMessage = normalizeString(message, "");
    if (!normalizedMessage) {
      return null;
    }

    const prevConversation = normalizeAgentConversationState(session);
    const cleanTranscript = buildAgentVisibleTranscript(prevConversation.transcript);
    const userMessageId = `user-${cleanTranscript.filter((entry) => entry.speaker === "user").length + 1}`;
    const providerRuntime = resolveProviderRuntime(session);
    const turnResult = await this.providerClient.generateAgentTurn({
      providerId: providerRuntime.selectedProviderId,
      modelFamilyId: providerRuntime.selectedModelFamilyId,
      intelligenceLevel: providerRuntime.selectedIntelligenceLevel,
      projectGoal: session.initialInput?.goal ?? session.projectDraft?.goal ?? "",
      transcript: cleanTranscript,
      currentUnderstanding: {
        understanding: prevConversation.understanding ?? createEmptyAgentUnderstanding(),
        summarySnapshot: prevConversation.summarySnapshot ?? createEmptyAgentSummarySnapshot(),
      },
      userMessage: normalizedMessage,
      userMessageId,
      qaFaultMode,
    });

    if (!turnResult || turnResult.status !== "completed" || !turnResult.envelope) {
      const lastAttempt = Array.isArray(turnResult?.attempts)
        ? turnResult.attempts[turnResult.attempts.length - 1]
        : null;
      const pendingTurn = {
        status: turnResult?.status ?? "unknown",
        error: turnResult?.error ?? null,
        pendingUserMessage: normalizedMessage,
        durationMs: lastAttempt?.durationMs ?? null,
      };
      const pendingSession = {
        ...session,
        conversation: {
          ...prevConversation,
          pendingTurn,
        },
      };
      this.sessions.set(sessionId, pendingSession);
      const baseEnvelope = buildConversationStateEnvelope({
        ...pendingSession,
      });
      return {
        updatedSession: pendingSession,
        conversationState: {
          ...baseEnvelope,
          lastAgentTurn: pendingTurn,
        },
        correction: null,
      };
    }

    const providerExecution = createProviderExecutionFromResult(
      normalizeObject(session.providerExecution),
      turnResult,
    );
    const correctedSession = applyAgentTurn({
      session: {
        ...session,
        conversation: prevConversation,
      },
      envelope: turnResult.envelope,
      userMessage: normalizedMessage,
      userMessageId,
      providerExecution,
    });
    const updatedSession = {
      ...correctedSession,
      conversation: {
        ...correctedSession.conversation,
        correctionHistory: [
          ...normalizeArray(prevConversation.correctionHistory),
          {
            correctionType: turnResult.envelope.intent ?? "agent-correction",
            correctedFields: [
              ...normalizeArray(turnResult.envelope.understandingDelta?.corrected).map((item) => item.slot).filter(Boolean),
              ...normalizeArray(turnResult.envelope.understandingDelta?.removed).map((item) => item.slot).filter(Boolean),
            ],
            reopenedArea: currentSurface,
            userMessage: normalizedMessage,
            correctedAt: new Date().toISOString(),
          },
        ],
      },
    };

    this.sessions.set(sessionId, updatedSession);
    return {
      updatedSession,
      conversationState: buildConversationStateEnvelope(updatedSession),
      correction: {
        correctionType: turnResult.envelope.intent ?? "agent-correction",
        correctedFields: normalizeArray(updatedSession.conversation.correctionHistory?.at(-1)?.correctedFields),
        reopenedArea: currentSurface,
        replyText: turnResult.envelope.replyToUser,
      },
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

  updateIntake({ sessionId, projectName, visionText, uploadedFiles = [], externalLinks = [] }) {
    return this.handleCommand({
      sessionId,
      actionType: "upload-spec",
      payload: {
        projectName,
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
        projectName: session.projectIntake?.projectName ?? session.projectDraft.name,
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

  finishSession(sessionId, { onboardingCompletionDecision = null } = {}) {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    const normalizedDecision = onboardingCompletionDecision && typeof onboardingCompletionDecision === "object"
      ? onboardingCompletionDecision
      : null;
    const now = new Date().toISOString();
    const isReadyToComplete = normalizedDecision?.isComplete === true;
    const completionStatus = normalizedDecision?.completionStatus ?? (isReadyToComplete ? "completed" : "needs-clarification");
    const resolvedSteps = resolveOnboardingSteps({
      onboardingSession: session,
      projectIntake: session.projectIntake ?? buildProjectIntake({
        projectName: session.projectDraft?.name ?? session.initialInput?.projectName ?? "",
        visionText: session.projectDraft?.goal ?? session.initialInput?.goal ?? "",
        uploadedFiles: session.projectIntake?.uploadedFiles ?? session.initialInput?.attachments ?? [],
        externalLinks: session.projectIntake?.externalLinks ?? session.initialInput?.links ?? [],
      }),
    });
    const finishedSession = {
      ...session,
      status: completionStatus,
      currentStep: isReadyToComplete ? "completed" : resolvedSteps.currentStep,
      nextStep: isReadyToComplete ? null : resolvedSteps.nextStep,
      requiredActions: isReadyToComplete ? [] : resolvedSteps.requiredActions,
      updatedAt: now,
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
