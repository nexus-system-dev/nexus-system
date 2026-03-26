function uniquePhases(phases = []) {
  return [...new Set(phases.filter(Boolean))];
}

const PHASE_ORDER = ["vision", "intake", "planning", "breakdown", "execution", "validation", "release", "growth"];

const BASE_PHASE_MILESTONES = {
  vision: {
    milestones: ["business-goal-defined", "project-intent-captured"],
    completionCriteria: ["יש מטרה עסקית ברורה", "יש תיאור ראשוני של מה בונים"],
  },
  intake: {
    milestones: ["supporting-material-collected", "project-shape-understood"],
    completionCriteria: ["יש חומרי קלט בסיסיים", "סוג הפרויקט מתחיל להתבהר"],
  },
  planning: {
    milestones: ["core-context-built", "initial-plan-drafted"],
    completionCriteria: ["הקונטקסט של הפרויקט נבנה", "יש תוכנית התחלתית להמשך"],
  },
  breakdown: {
    milestones: ["roadmap-structured", "dependencies-mapped"],
    completionCriteria: ["יש משימות ראשונות", "התלויות בין המשימות מזוהות"],
  },
  execution: {
    milestones: ["tasks-assigned", "work-in-progress"],
    completionCriteria: ["יש משימות מוכנות או רצות", "מתקבלות תוצאות ביצוע ראשונות"],
  },
  validation: {
    milestones: ["runtime-signals-available", "quality-checks-observed"],
    completionCriteria: ["יש אותות runtime אמיתיים", "אפשר להעריך תקינות או סיכון"],
  },
  release: {
    milestones: ["release-path-defined", "distribution-readiness-identified"],
    completionCriteria: ["יש מסלול שחרור מוגדר", "הפרויקט קרוב למסירה או הפצה"],
  },
  growth: {
    milestones: ["feedback-loop-active", "post-release-iteration-started"],
    completionCriteria: ["יש בסיס למדידה או משוב", "אפשר לתעדף שיפורים אחרי עלייה לאוויר"],
  },
};

const DOMAIN_PHASE_MILESTONES = {
  casino: {
    planning: {
      milestones: ["wallet-scope-defined", "payments-scope-defined"],
      completionCriteria: ["זרימות ארנק מזוהות", "גבולות מערכת התשלומים ברורים"],
    },
    execution: {
      milestones: ["player-flow-in-progress", "wallet-or-payments-implementation-started"],
      completionCriteria: ["יש עבודה פעילה על זרימות שחקן", "יש התקדמות אמיתית באחד מרכיבי הליבה"],
    },
  },
  saas: {
    planning: {
      milestones: ["activation-path-defined", "core-funnel-identified"],
      completionCriteria: ["יש מסלול onboarding או activation", "המשפך הראשוני של המוצר מזוהה"],
    },
    execution: {
      milestones: ["core-product-loop-in-progress", "acquisition-or-conversion-work-started"],
      completionCriteria: ["הפיצ'ר המרכזי בביצוע", "יש התקדמות על רכיב מוצרי או growth מרכזי"],
    },
  },
  "mobile-app": {
    planning: {
      milestones: ["app-shell-defined", "device-flow-defined"],
      completionCriteria: ["שלד האפליקציה מוגדר", "הזרימה המרכזית על המכשיר ברורה"],
    },
    execution: {
      milestones: ["screens-or-navigation-in-progress", "mobile-runtime-work-started"],
      completionCriteria: ["יש עבודה פעילה על מסכים או ניווט", "יש התקדמות אמיתית באפליקציה עצמה"],
    },
  },
  "agency-system": {
    planning: {
      milestones: ["operations-flow-defined", "delivery-process-mapped"],
      completionCriteria: ["זרימות התפעול מזוהות", "תהליך המסירה ללקוח מוגדר"],
    },
  },
  book: {
    planning: {
      milestones: ["book-structure-defined", "chapter-plan-drafted"],
      completionCriteria: ["יש מבנה ספר ברור", "יש תוכנית פרקים התחלתית"],
    },
    execution: {
      milestones: ["writing-started", "content-sections-in-progress"],
      completionCriteria: ["הכתיבה עצמה התחילה", "יש מקטעי תוכן בפיתוח"],
    },
  },
  "content-product": {
    planning: {
      milestones: ["content-outline-defined", "delivery-format-selected"],
      completionCriteria: ["יש outline למוצר התוכן", "פורמט המסירה נבחר"],
    },
    execution: {
      milestones: ["content-production-started", "delivery-assets-in-progress"],
      completionCriteria: ["יש ייצור תוכן פעיל", "נוצרים נכסי מסירה או הפצה"],
    },
  },
};

function normalizeTransitionEvents(transitionEvents = []) {
  return Array.isArray(transitionEvents) ? transitionEvents.filter(Boolean) : [];
}

function inferTransitionReason(events, nextPhase) {
  if (events.some((event) => event.type === "task.completed")) {
    return `task.completed -> ${nextPhase}`;
  }
  if (events.some((event) => event.type === "task.assigned")) {
    return `task.assigned -> ${nextPhase}`;
  }
  if (events.some((event) => event.type === "runtime.updated")) {
    return `runtime.updated -> ${nextPhase}`;
  }
  if (events.some((event) => event.type === "scan.completed")) {
    return `scan.completed -> ${nextPhase}`;
  }

  return `phase-evaluation -> ${nextPhase}`;
}

export function resolveLifecyclePhase({
  projectState,
  executionGraph,
  runtimeSignals,
  domain = "generic",
}) {
  const hasGoal = Boolean(projectState?.businessGoal?.trim() || projectState?.goal?.trim());
  const hasObservedKnowledge = Boolean(projectState?.knowledge?.documents || projectState?.knowledge?.knownGaps?.length);
  const nodes = executionGraph?.nodes ?? [];
  const hasTasks = nodes.length > 0;
  const hasReadyTasks = nodes.some((node) => node.status === "ready");
  const hasRunningTasks = nodes.some((node) => node.status === "running");
  const hasDoneTasks = nodes.some((node) => node.status === "done");
  const runtimeConnected = Boolean(
    runtimeSignals?.ci?.length ||
      runtimeSignals?.deployments?.length ||
      runtimeSignals?.testResults?.length ||
      runtimeSignals?.errorLogs?.length,
  );

  if (!hasGoal) {
    return { resolvedPhase: "vision", phaseConfidence: 0.98 };
  }

  if (!hasObservedKnowledge && !hasTasks) {
    return { resolvedPhase: "intake", phaseConfidence: 0.8 };
  }

  if (hasObservedKnowledge && !hasTasks) {
    return { resolvedPhase: "planning", phaseConfidence: 0.84 };
  }

  if (hasTasks && !hasReadyTasks && !hasRunningTasks && !hasDoneTasks) {
    return { resolvedPhase: "breakdown", phaseConfidence: 0.78 };
  }

  if (hasRunningTasks || hasDoneTasks || hasReadyTasks) {
    return { resolvedPhase: "execution", phaseConfidence: hasRunningTasks ? 0.95 : 0.88 };
  }

  if (runtimeConnected) {
    return { resolvedPhase: "validation", phaseConfidence: 0.72 };
  }

  if (domain === "book" || domain === "content-product") {
    return { resolvedPhase: "authoring", phaseConfidence: 0.7 };
  }

  return { resolvedPhase: "planning", phaseConfidence: 0.6 };
}

export function resolveLifecycleTransition({ currentPhase, transitionEvents = [], nextPhase }) {
  const normalizedEvents = normalizeTransitionEvents(transitionEvents);
  const resolvedNextPhase = nextPhase ?? currentPhase;
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  const nextIndex = PHASE_ORDER.indexOf(resolvedNextPhase);
  const didTransition = currentPhase !== resolvedNextPhase;
  const isForwardTransition =
    currentIndex >= 0 && nextIndex >= 0 ? nextIndex >= currentIndex : didTransition;

  return {
    nextPhase: resolvedNextPhase,
    transitionRecord: {
      previousPhase: currentPhase ?? null,
      nextPhase: resolvedNextPhase,
      didTransition,
      isForwardTransition,
      eventCount: normalizedEvents.length,
      triggeringEvents: normalizedEvents.map((event) => event.type ?? "unknown"),
      reason: inferTransitionReason(normalizedEvents, resolvedNextPhase),
      timestamp: new Date().toISOString(),
    },
  };
}

export function generateLifecycleMilestones({ domain = "generic", lifecyclePhase = "planning" }) {
  const base = BASE_PHASE_MILESTONES[lifecyclePhase] ?? {
    milestones: [],
    completionCriteria: [],
  };
  const domainSpecific = DOMAIN_PHASE_MILESTONES[domain]?.[lifecyclePhase] ?? {
    milestones: [],
    completionCriteria: [],
  };

  return {
    milestones: uniquePhases([...(base.milestones ?? []), ...(domainSpecific.milestones ?? [])]),
    completionCriteria: uniquePhases([
      ...(base.completionCriteria ?? []),
      ...(domainSpecific.completionCriteria ?? []),
    ]),
  };
}

export function defineLifecycleState({ project, domain = "generic", previousLifecycle = null }) {
  const { resolvedPhase, phaseConfidence } = resolveLifecyclePhase({
    projectState: {
      businessGoal: project.goal,
      ...(project.state ?? {}),
    },
    executionGraph: project.cycle?.executionGraph ?? null,
    runtimeSignals: project.runtimeSnapshot ?? null,
    domain,
  });
  const { transitionRecord } = resolveLifecycleTransition({
    currentPhase: previousLifecycle?.currentPhase ?? null,
    nextPhase: resolvedPhase,
    transitionEvents: project.taskResults ?? project.runtimeResults ?? [],
  });
  const previousHistory = Array.isArray(previousLifecycle?.phaseHistory) ? previousLifecycle.phaseHistory : [];
  const phaseHistory = uniquePhases([...previousHistory, resolvedPhase]);
  const { milestones, completionCriteria } = generateLifecycleMilestones({
    domain,
    lifecyclePhase: resolvedPhase,
  });

  return {
    currentPhase: resolvedPhase,
    phaseConfidence,
    phaseHistory,
    milestones,
    completionCriteria,
    transitionRecord,
    domain,
    updatedAt: new Date().toISOString(),
  };
}
