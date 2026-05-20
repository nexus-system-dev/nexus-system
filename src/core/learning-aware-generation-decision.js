function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function unique(values = []) {
  return [...new Set(values.map((value) => normalizeString(value)).filter(Boolean))];
}

function includesSignal(text = "", patterns = []) {
  const normalized = String(text ?? "").toLowerCase();
  return patterns.some((pattern) => normalized.includes(pattern));
}

function countFailureSignals({ learningInsights = null, outcomeFeedbackState = null } = {}) {
  const insights = normalizeObject(learningInsights);
  const feedback = normalizeObject(outcomeFeedbackState);
  const items = normalizeArray(insights.items);
  const feedbackItems = normalizeArray(feedback.feedbackItems);

  return items.filter((item) => includesSignal(item.pattern ?? item.label, ["failure", "retry", "stalled", "repair"])).length
    + feedbackItems.filter((item) => includesSignal(item.label ?? item.reason, ["failure", "retry", "stalled", "repair"])).length
    + (feedback.status === "attention-required" ? 1 : 0)
    + (feedback.trend === "stalled" ? 1 : 0);
}

function resolveLearnedFocusPack(productClass) {
  if (productClass === "landing-page") {
    return {
      focusAreas: [
        "לחזק את הוכחת הערך לפני הרחבת המסר",
        "לייצב את אזור האמון לפני פתיחת וריאציות נוספות",
        "לקבע CTA אחד ברור לפני הרחבת המשפך",
      ],
      primaryActionLabel: "Stabilize value proof before expanding CTA",
      learnedGoal: "Stabilize value proof, trust, and CTA clarity before expanding the landing surface.",
      proofRequirement: "ה־Proof הבא צריך להוכיח שהבטחת הערך, האמון וה־CTA כבר יציבים לפני הרחבת המסר.",
    };
  }

  if (productClass === "mobile-app") {
    return {
      focusAreas: [
        "לייצב את המסך הראשון לפני הרחבת הזרימה",
        "להבהיר את הפעולה הראשונה לפני פתיחת מסכים נוספים",
        "לחזק את הרצף למסך הבא לפני הרחבת המסלול",
      ],
      primaryActionLabel: "Stabilize first mobile action before expanding the flow",
      learnedGoal: "Stabilize the first screen, first action, and next-step continuity before expanding the mobile flow.",
      proofRequirement: "ה־Proof הבא צריך להוכיח שהמסך הראשון והפעולה הראשונה כבר יציבים לפני פתיחת המשך רחב יותר.",
    };
  }

  if (productClass === "internal-tool" || productClass === "commerce-ops") {
    return {
      focusAreas: [
        "לייצב את מצב התור הפעיל לפני הרחבת ה־workspace",
        "לחזק את מצב הבעלות והדחיפות לפני וריאציות חדשות",
        "להוכיח את הפעולה הבאה לפני הרחבת המסכים",
      ],
      primaryActionLabel: "Stabilize the active queue before expanding the workspace",
      learnedGoal: "Stabilize the active queue, ownership, and next operational move before expanding the workspace.",
      proofRequirement: "ה־Proof הבא צריך להוכיח שהתור, הבעלות והפעולה הבאה כבר יציבים לפני הרחבת ה־workspace.",
    };
  }

  return {
    focusAreas: [
      "לייצב את התוצר הקיים לפני הרחבה נוספת",
      "לחזק את מה שכבר הוכח לפני פתיחת מסלול חדש",
    ],
    primaryActionLabel: "Stabilize the current surface before expanding",
    learnedGoal: "Stabilize the current surface before opening a broader generation move.",
    proofRequirement: "ה־Proof הבא צריך להוכיח שהתוצר הקיים יציב לפני שמרחיבים אותו.",
  };
}

export function createLearningAwareGenerationDecision({
  productClass = null,
  classAwareGenerationContract = null,
  outcomeFeedbackState = null,
  learningInsights = null,
  approvalStatus = null,
  crossProjectPatternPanel = null,
  productIterationInsights = null,
} = {}) {
  const baseContract = normalizeObject(classAwareGenerationContract);
  const generationIntent = normalizeObject(baseContract.generationIntent);

  if (!generationIntent.intentId) {
    return {
      classAwareGenerationContract: baseContract,
    };
  }

  const approval = normalizeObject(approvalStatus);
  const feedback = normalizeObject(outcomeFeedbackState);
  const patterns = normalizeObject(crossProjectPatternPanel);
  const iterationInsights = normalizeObject(productIterationInsights);
  const failureSignalCount = countFailureSignals({
    learningInsights,
    outcomeFeedbackState,
  });
  const recommendationHint = normalizeArray(patterns.recommendationHints)[0];
  const strategy = failureSignalCount > 0 || feedback.status === "attention-required"
    ? "repair-before-expand"
    : "amplify-proven-surface";
  const focusPack = resolveLearnedFocusPack(productClass);
  const approvalSignal = normalizeString(approval.status);
  const patternSignal = normalizeString(recommendationHint?.label ?? recommendationHint?.title);
  const iterationSignal = normalizeString(iterationInsights.summary?.recommendedDirection ?? iterationInsights.summary?.status);
  const learnedSignals = unique([
    failureSignalCount > 0 ? `failure-signals:${failureSignalCount}` : null,
    feedback.status ? `feedback:${feedback.status}` : null,
    feedback.trend ? `trend:${feedback.trend}` : null,
    approvalSignal ? `approval:${approvalSignal}` : null,
    patternSignal ? `pattern:${patternSignal}` : null,
    iterationSignal ? `iteration:${iterationSignal}` : null,
  ]);
  const strategyLabel = strategy === "repair-before-expand"
    ? "הלמידה מזיזה את ה־generation לייצוב לפני הרחבה"
    : "הלמידה מזיזה את ה־generation לחיזוק מה שכבר הוכח";
  const reason = strategy === "repair-before-expand"
    ? "כשלונות, retries, או friction מהסבב האחרון מחזירים את היצירה ל־repair ממוקד במקום לפתוח הרחבה גנרית."
    : "האישור והדפוסים שנאספו מחזקים את מה שכבר הוכח במקום לפתוח מסלול יצירה חדש ולא מבוסס.";

  return {
    classAwareGenerationContract: {
      ...baseContract,
      learningAwareGeneration: {
        status: "live",
        strategy,
        strategyLabel,
        learnedSignals,
        reason,
        learnedFocusAreas: focusPack.focusAreas,
        learnedProofRequirement: focusPack.proofRequirement,
      },
      generationGoal: `${baseContract.generationGoal ?? generationIntent.generationGoal ?? ""} ${focusPack.learnedGoal}`.trim(),
      focusAreas: unique([
        ...normalizeArray(baseContract.focusAreas),
        ...focusPack.focusAreas,
      ]),
      visibleMutationTargets: unique([
        ...normalizeArray(baseContract.visibleMutationTargets),
        ...focusPack.focusAreas,
      ]),
      generationIntent: {
        ...generationIntent,
        source: "learning-aware-generation-contract",
        learningAware: true,
        learningStatus: "live",
        learningStrategy: strategy,
        learningStrategyLabel: strategyLabel,
        learningReason: reason,
        learnedSignals,
        learnedFocusAreas: focusPack.focusAreas,
        learnedProofRequirement: focusPack.proofRequirement,
        generationGoal: `${generationIntent.generationGoal ?? baseContract.generationGoal ?? ""} ${focusPack.learnedGoal}`.trim(),
        focusAreas: unique([
          ...normalizeArray(generationIntent.focusAreas),
          ...focusPack.focusAreas,
        ]),
        primaryAction: {
          ...(normalizeObject(generationIntent.primaryAction)),
          label: focusPack.primaryActionLabel,
        },
      },
    },
  };
}
