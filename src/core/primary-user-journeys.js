function normalizeGoals(productGoals) {
  if (Array.isArray(productGoals)) {
    return productGoals.filter((goal) => typeof goal === "string" && goal.trim());
  }

  if (typeof productGoals === "string" && productGoals.trim()) {
    return [productGoals.trim()];
  }

  return [];
}

function normalizeCapabilityToken(candidate) {
  return typeof candidate === "string" && candidate.trim() ? candidate.trim() : null;
}

function normalizeCapabilities(coreCapabilities) {
  if (Array.isArray(coreCapabilities)) {
    return coreCapabilities
      .map((capability) => {
        if (typeof capability === "string") {
          return normalizeCapabilityToken(capability);
        }

        return normalizeCapabilityToken(capability?.label) ?? normalizeCapabilityToken(capability?.value);
      })
      .filter(Boolean);
  }

  if (coreCapabilities && typeof coreCapabilities === "object") {
    return Object.entries(coreCapabilities)
      .filter(([, payload]) => payload === true || payload?.value === true)
      .map(([name]) => name);
  }

  return [];
}

function createDimensionState(statuses, primary = false) {
  return {
    statuses,
    primary,
  };
}

function createTransition({
  transitionId,
  trigger,
  actingComponent,
  fromState,
  toState,
  observableOutput,
  evidenceSource,
  branch = "success",
}) {
  return {
    transitionId,
    trigger,
    actingComponent,
    fromState,
    toState,
    observableOutput,
    evidenceSource,
    branch,
  };
}

function flattenTransitions(journeys) {
  return journeys.flatMap((journey) =>
    journey.transitions.map((transition, index) => ({
      ...transition,
      journeyId: journey.journeyId,
      order: index + 1,
    })),
  );
}

function createJourneyStateRegistry() {
  return {
    stateModelType: "hybrid",
    sourceOfTruth: {
      currentState: "project.state.journeyState",
      executionSubstate: "executionGraph",
      transitionEvidence: "eventLog",
      canonicalTransitionApplier: "project-service",
    },
    dimensions: {
      onboardingState: createDimensionState([
        "not-started",
        "capturing-intake",
        "needs-input",
        "ready-for-handoff",
        "bootstrapping",
        "managed-project-ready",
        "blocked",
      ]),
      executionState: createDimensionState([
        "idle",
        "state-observed",
        "task-selected",
        "awaiting-approval",
        "authorized",
        "assigned",
        "in-flight",
        "result-recorded",
        "advanced",
        "blocked",
      ]),
      approvalState: createDimensionState([
        "not-required",
        "required",
        "pending",
        "approved",
        "rejected",
        "released",
        "blocked",
      ]),
      recoveryState: createDimensionState([
        "not-needed",
        "needed",
        "retry-planned",
        "fallback-planned",
        "rollback-planned",
        "in-recovery",
        "partially-recovered",
        "recovered",
        "failed",
        "awaiting-approval",
        "blocked",
      ]),
      lifecycleState: createDimensionState([
        "initializing",
        "ready",
        "active",
        "waiting",
        "degraded",
        "blocked",
        "recovering",
        "completed",
      ], true),
    },
    ownership: {
      "agent-runtime": "emits runtime events only",
      "approval-modules": "emit approval decisions only",
      "recovery-modules": "emit recovery decisions and results only",
      "context-builder": "derives read models only",
      "project-service": "persists canonical journey state transitions",
    },
    conflictResolution: [
      "recoveryState dominates executionState when recovery is needed, active, failed, or awaiting approval",
      "approvalState dominates forward execution when approval is required or pending",
      "onboardingState dominates pre-managed operation until managed-project-ready",
      "lifecycleState is the primary summary dimension derived from the dominant operational dimension",
    ],
  };
}

function buildJourneys() {
  return [
    {
      journeyId: "journey-onboarding-initialization",
      name: "Onboarding And Project Initialization",
      intent: "Turn intake, missing inputs, and bootstrap handoff into a managed project ready for execution.",
      entryPoints: [
        "user-submits-onboarding-intake",
        "user-uploads-supporting-files",
        "user-confirms-project-setup",
      ],
      initialSystemState: {
        onboardingState: "not-started",
        lifecycleState: "initializing",
      },
      transitions: [
        createTransition({
          transitionId: "onboarding:capture-intake",
          trigger: "user-submits-onboarding-intake",
          actingComponent: "onboarding-service",
          fromState: "onboardingState:not-started",
          toState: "onboardingState:capturing-intake",
          observableOutput: "project intake is recorded",
          evidenceSource: "onboarding session payload",
        }),
        createTransition({
          transitionId: "onboarding:resolve-gaps",
          trigger: "user-provides-missing-inputs",
          actingComponent: "onboarding-completion-evaluator",
          fromState: "onboardingState:capturing-intake",
          toState: "onboardingState:needs-input",
          observableOutput: "required onboarding inputs are explicit",
          evidenceSource: "completion evaluation result",
          branch: "failure",
        }),
        createTransition({
          transitionId: "onboarding:handoff-ready",
          trigger: "onboarding-evaluator-reports-complete",
          actingComponent: "onboarding-to-state-handoff-contract",
          fromState: "onboardingState:capturing-intake",
          toState: "onboardingState:ready-for-handoff",
          observableOutput: "handoff contract is created",
          evidenceSource: "handoff contract",
        }),
        createTransition({
          transitionId: "onboarding:bootstrap",
          trigger: "project-state-bootstrap-starts",
          actingComponent: "project-state-bootstrap-service",
          fromState: "onboardingState:ready-for-handoff",
          toState: "onboardingState:bootstrapping",
          observableOutput: "initial project state payload is being created",
          evidenceSource: "bootstrap service result",
        }),
        createTransition({
          transitionId: "onboarding:managed-project-ready",
          trigger: "bootstrap-valid-and-initial-tasks-seeded",
          actingComponent: "project-service",
          fromState: "onboardingState:bootstrapping",
          toState: "onboardingState:managed-project-ready",
          observableOutput: "project is now managed and execution-ready",
          evidenceSource: "validated project state",
        }),
        createTransition({
          transitionId: "onboarding:blocked",
          trigger: "bootstrap-validation-failed",
          actingComponent: "project-service",
          fromState: "onboardingState:bootstrapping",
          toState: "onboardingState:blocked",
          observableOutput: "bootstrap is blocked and requires recovery or more input",
          evidenceSource: "initial project state validation module",
          branch: "failure",
        }),
      ],
      branches: {
        successPath: "managed-project-ready",
        failurePath: ["needs-input", "blocked"],
        approvalPath: [],
      },
      exitStates: ["onboardingState:managed-project-ready", "onboardingState:needs-input", "onboardingState:blocked"],
      reEntryPoints: [
        "recovery returns project to incomplete setup",
        "continuous operation detects onboarding unfinished",
      ],
      crossJourneyConnections: [
        "journey-execution-state-advancement",
        "journey-failure-recovery-continuity",
        "journey-continuous-operation-reentry",
      ],
      stateMappings: ["onboardingState", "lifecycleState"],
    },
    {
      journeyId: "journey-execution-state-advancement",
      name: "Execution And State Advancement",
      intent: "Select work, authorize it, execute it through the runtime, ingest results, and advance project state.",
      entryPoints: [
        "user-requests-next-action",
        "system-selects-next-task",
        "agent-runtime-processes-pending-assignments",
      ],
      initialSystemState: {
        executionState: "idle",
        lifecycleState: "ready",
      },
      transitions: [
        createTransition({
          transitionId: "execution:observe-state",
          trigger: "context-refresh",
          actingComponent: "context-builder",
          fromState: "executionState:idle",
          toState: "executionState:state-observed",
          observableOutput: "current bottleneck and next task are exposed",
          evidenceSource: "context build",
        }),
        createTransition({
          transitionId: "execution:select-task",
          trigger: "next-task-selection",
          actingComponent: "next-task-selection-resolver",
          fromState: "executionState:state-observed",
          toState: "executionState:task-selected",
          observableOutput: "next task is selected",
          evidenceSource: "next task selection result",
        }),
        createTransition({
          transitionId: "execution:await-approval",
          trigger: "gating-decision-requires-approval",
          actingComponent: "approval-gating-module",
          fromState: "executionState:task-selected",
          toState: "executionState:awaiting-approval",
          observableOutput: "execution is paused pending approval",
          evidenceSource: "gating decision",
          branch: "approval",
        }),
        createTransition({
          transitionId: "execution:authorize",
          trigger: "gating-decision-allowed",
          actingComponent: "project-service",
          fromState: "executionState:task-selected",
          toState: "executionState:authorized",
          observableOutput: "task is cleared for assignment",
          evidenceSource: "policy and authorization results",
        }),
        createTransition({
          transitionId: "execution:assign",
          trigger: "task-assigned-event",
          actingComponent: "project-service",
          fromState: "executionState:authorized",
          toState: "executionState:assigned",
          observableOutput: "assignment is emitted to runtime",
          evidenceSource: "event bus assignment event",
        }),
        createTransition({
          transitionId: "execution:run",
          trigger: "worker-starts-processing",
          actingComponent: "agent-runtime",
          fromState: "executionState:assigned",
          toState: "executionState:in-flight",
          observableOutput: "task is running",
          evidenceSource: "runtime processing event",
        }),
        createTransition({
          transitionId: "execution:record-result",
          trigger: "task-result-ingested",
          actingComponent: "task-result-ingestion",
          fromState: "executionState:in-flight",
          toState: "executionState:result-recorded",
          observableOutput: "canonical task result exists",
          evidenceSource: "task result ingestion output",
        }),
        createTransition({
          transitionId: "execution:advance-state",
          trigger: "project-service-persists-result",
          actingComponent: "project-service",
          fromState: "executionState:result-recorded",
          toState: "executionState:advanced",
          observableOutput: "project state is advanced after execution",
          evidenceSource: "project state write",
        }),
        createTransition({
          transitionId: "execution:failed",
          trigger: "task-failed-event",
          actingComponent: "agent-runtime",
          fromState: "executionState:in-flight",
          toState: "executionState:blocked",
          observableOutput: "execution failed and recovery is required",
          evidenceSource: "task.failed event",
          branch: "failure",
        }),
      ],
      branches: {
        successPath: "advanced",
        failurePath: ["blocked"],
        approvalPath: ["awaiting-approval"],
      },
      exitStates: ["executionState:advanced", "executionState:awaiting-approval", "executionState:blocked"],
      reEntryPoints: [
        "approval releases a previously gated action",
        "recovery returns the project to a resumable execution state",
        "continuous operation reloads an active project",
      ],
      crossJourneyConnections: [
        "journey-approval-explanation-resolution",
        "journey-failure-recovery-continuity",
        "journey-continuous-operation-reentry",
      ],
      stateMappings: ["executionState", "lifecycleState"],
    },
    {
      journeyId: "journey-approval-explanation-resolution",
      name: "Approval And Explanation Resolution",
      intent: "Resolve gated actions through approval state, explanation generation, and release or rejection of blocked progress.",
      entryPoints: [
        "gating-decision-requires-approval",
        "privileged-action-needs-approval",
        "user-requests-explanation-for-blocked-action",
      ],
      initialSystemState: {
        approvalState: "not-required",
        lifecycleState: "waiting",
      },
      transitions: [
        createTransition({
          transitionId: "approval:required",
          trigger: "approval-trigger-detected",
          actingComponent: "approval-trigger-resolver",
          fromState: "approvalState:not-required",
          toState: "approvalState:required",
          observableOutput: "approval requirement is identified",
          evidenceSource: "approval trigger output",
        }),
        createTransition({
          transitionId: "approval:pending",
          trigger: "approval-request-created",
          actingComponent: "approval-record-store",
          fromState: "approvalState:required",
          toState: "approvalState:pending",
          observableOutput: "approval request and audit record are stored",
          evidenceSource: "approval record",
        }),
        createTransition({
          transitionId: "approval:approved",
          trigger: "approval-status-approved",
          actingComponent: "approval-status-resolver",
          fromState: "approvalState:pending",
          toState: "approvalState:approved",
          observableOutput: "approval was granted",
          evidenceSource: "approval status result",
          branch: "success",
        }),
        createTransition({
          transitionId: "approval:released",
          trigger: "project-service-releases-gated-action",
          actingComponent: "project-service",
          fromState: "approvalState:approved",
          toState: "approvalState:released",
          observableOutput: "execution or recovery may continue",
          evidenceSource: "project state write",
          branch: "success",
        }),
        createTransition({
          transitionId: "approval:rejected",
          trigger: "approval-status-rejected",
          actingComponent: "approval-status-resolver",
          fromState: "approvalState:pending",
          toState: "approvalState:rejected",
          observableOutput: "action remains blocked",
          evidenceSource: "approval status result",
          branch: "failure",
        }),
        createTransition({
          transitionId: "approval:blocked",
          trigger: "project-service-persists-rejection",
          actingComponent: "project-service",
          fromState: "approvalState:rejected",
          toState: "approvalState:blocked",
          observableOutput: "blocked state is visible with explanation",
          evidenceSource: "approval explanation output",
          branch: "failure",
        }),
      ],
      branches: {
        successPath: "released",
        failurePath: ["rejected", "blocked"],
        approvalPath: ["required", "pending"],
      },
      exitStates: ["approvalState:released", "approvalState:blocked", "approvalState:pending"],
      reEntryPoints: [
        "execution emits a new gated action",
        "recovery requires approval",
        "continuous operation reloads pending approval state",
      ],
      crossJourneyConnections: [
        "journey-execution-state-advancement",
        "journey-failure-recovery-continuity",
        "journey-continuous-operation-reentry",
      ],
      stateMappings: ["approvalState", "executionState", "recoveryState", "lifecycleState"],
    },
    {
      journeyId: "journey-failure-recovery-continuity",
      name: "Failure Recovery And Continuity",
      intent: "Classify failures, select recovery strategy, execute recovery, and return the system to a resumable state.",
      entryPoints: [
        "task-failed-event",
        "bootstrap-validation-failed",
        "restore-safety-check-failed",
      ],
      initialSystemState: {
        recoveryState: "not-needed",
        lifecycleState: "active",
      },
      transitions: [
        createTransition({
          transitionId: "recovery:needed",
          trigger: "failure-classified",
          actingComponent: "rejection-failure-mapper",
          fromState: "recoveryState:not-needed",
          toState: "recoveryState:needed",
          observableOutput: "canonical failure and recovery need are recorded",
          evidenceSource: "failure mapper result",
        }),
        createTransition({
          transitionId: "recovery:retry-planned",
          trigger: "retry-policy-selected",
          actingComponent: "retry-policy-resolver",
          fromState: "recoveryState:needed",
          toState: "recoveryState:retry-planned",
          observableOutput: "retry plan is prepared",
          evidenceSource: "retry policy result",
        }),
        createTransition({
          transitionId: "recovery:fallback-planned",
          trigger: "fallback-selected",
          actingComponent: "fallback-strategy-resolver",
          fromState: "recoveryState:needed",
          toState: "recoveryState:fallback-planned",
          observableOutput: "fallback plan is prepared",
          evidenceSource: "fallback strategy result",
        }),
        createTransition({
          transitionId: "recovery:rollback-planned",
          trigger: "rollback-required",
          actingComponent: "rollback-scope-planner",
          fromState: "recoveryState:needed",
          toState: "recoveryState:rollback-planned",
          observableOutput: "rollback scope is defined",
          evidenceSource: "rollback plan",
        }),
        createTransition({
          transitionId: "recovery:in-recovery",
          trigger: "recovery-execution-started",
          actingComponent: "recovery-orchestration-module",
          fromState: "recoveryState:retry-planned",
          toState: "recoveryState:in-recovery",
          observableOutput: "recovery is actively running",
          evidenceSource: "recovery orchestration result",
        }),
        createTransition({
          transitionId: "recovery:recovered",
          trigger: "recovery-succeeded",
          actingComponent: "project-service",
          fromState: "recoveryState:in-recovery",
          toState: "recoveryState:recovered",
          observableOutput: "project can safely resume",
          evidenceSource: "project recovery write",
          branch: "success",
        }),
        createTransition({
          transitionId: "recovery:partially-recovered",
          trigger: "recovery-partial",
          actingComponent: "project-service",
          fromState: "recoveryState:in-recovery",
          toState: "recoveryState:partially-recovered",
          observableOutput: "project is resumable with caveats",
          evidenceSource: "project recovery write",
          branch: "failure",
        }),
        createTransition({
          transitionId: "recovery:awaiting-approval",
          trigger: "recovery-requires-approval",
          actingComponent: "fallback-strategy-resolver",
          fromState: "recoveryState:needed",
          toState: "recoveryState:awaiting-approval",
          observableOutput: "recovery is waiting on approval",
          evidenceSource: "fallback strategy result",
          branch: "approval",
        }),
        createTransition({
          transitionId: "recovery:failed",
          trigger: "recovery-failed",
          actingComponent: "project-service",
          fromState: "recoveryState:in-recovery",
          toState: "recoveryState:failed",
          observableOutput: "recovery did not restore safe operation",
          evidenceSource: "recovery result",
          branch: "failure",
        }),
      ],
      branches: {
        successPath: "recovered",
        failurePath: ["partially-recovered", "failed"],
        approvalPath: ["awaiting-approval"],
      },
      exitStates: [
        "recoveryState:recovered",
        "recoveryState:partially-recovered",
        "recoveryState:failed",
        "recoveryState:awaiting-approval",
      ],
      reEntryPoints: [
        "execution fails again after resume",
        "continuous operation detects unresolved degraded state",
      ],
      crossJourneyConnections: [
        "journey-execution-state-advancement",
        "journey-approval-explanation-resolution",
        "journey-continuous-operation-reentry",
        "journey-onboarding-initialization",
      ],
      stateMappings: ["recoveryState", "executionState", "lifecycleState"],
    },
    {
      journeyId: "journey-continuous-operation-reentry",
      name: "Continuous Operation And Re-Entry",
      intent: "Rehydrate existing projects, reconcile live state, and route the system back into the correct active journey.",
      entryPoints: [
        "user-opens-existing-project",
        "system-refreshes-project-context",
        "realtime-event-arrives",
      ],
      initialSystemState: {
        lifecycleState: "waiting",
      },
      transitions: [
        createTransition({
          transitionId: "reentry:rehydrate",
          trigger: "project-context-rebuilt",
          actingComponent: "context-builder",
          fromState: "lifecycleState:waiting",
          toState: "lifecycleState:ready",
          observableOutput: "current project state is rehydrated",
          evidenceSource: "context build",
        }),
        createTransition({
          transitionId: "reentry:active",
          trigger: "next-action-available",
          actingComponent: "project-service",
          fromState: "lifecycleState:ready",
          toState: "lifecycleState:active",
          observableOutput: "system is ready to resume execution",
          evidenceSource: "next task selection and project state write",
          branch: "success",
        }),
        createTransition({
          transitionId: "reentry:blocked",
          trigger: "pending-approval-or-blocker-detected",
          actingComponent: "project-service",
          fromState: "lifecycleState:ready",
          toState: "lifecycleState:blocked",
          observableOutput: "system is resumable only after approval or unblock",
          evidenceSource: "gating and bottleneck state",
          branch: "approval",
        }),
        createTransition({
          transitionId: "reentry:recovering",
          trigger: "degraded-state-detected",
          actingComponent: "project-service",
          fromState: "lifecycleState:ready",
          toState: "lifecycleState:recovering",
          observableOutput: "system routes into recovery path",
          evidenceSource: "recovery state",
          branch: "failure",
        }),
        createTransition({
          transitionId: "reentry:initializing",
          trigger: "setup-incomplete-detected",
          actingComponent: "project-service",
          fromState: "lifecycleState:ready",
          toState: "lifecycleState:initializing",
          observableOutput: "system routes back into onboarding completion",
          evidenceSource: "onboarding and bootstrap state",
          branch: "failure",
        }),
      ],
      branches: {
        successPath: "active",
        failurePath: ["recovering", "initializing"],
        approvalPath: ["blocked"],
      },
      exitStates: [
        "lifecycleState:active",
        "lifecycleState:blocked",
        "lifecycleState:recovering",
        "lifecycleState:initializing",
      ],
      reEntryPoints: [
        "after any persistent non-terminal state is loaded again",
      ],
      crossJourneyConnections: [
        "journey-onboarding-initialization",
        "journey-execution-state-advancement",
        "journey-approval-explanation-resolution",
        "journey-failure-recovery-continuity",
      ],
      stateMappings: ["lifecycleState", "onboardingState", "executionState", "approvalState", "recoveryState"],
    },
  ];
}

function createTransitionRegistry(journeys) {
  return journeys.flatMap((journey) =>
    journey.transitions.map((transition) => ({
      transitionId: transition.transitionId,
      journeyId: journey.journeyId,
      trigger: transition.trigger,
      actingComponent: transition.actingComponent,
      fromState: transition.fromState,
      toState: transition.toState,
      branch: transition.branch,
      evidenceSource: transition.evidenceSource,
    })),
  );
}

export function definePrimaryUserJourneys({
  productGoals,
  coreCapabilities,
  businessContext = null,
} = {}) {
  const goals = normalizeGoals(productGoals);
  const capabilities = normalizeCapabilities(coreCapabilities);
  const journeys = buildJourneys();
  const journeyStateRegistry = createJourneyStateRegistry();
  const journeyTransitionRegistry = createTransitionRegistry(journeys);
  const journeySteps = flattenTransitions(journeys);

  return {
    userJourneys: {
      goals,
      capabilities,
      targetAudience: businessContext?.targetAudience ?? null,
      gtmStage: businessContext?.gtmStage ?? null,
      summary: {
        totalJourneys: journeys.length,
        primaryJourneyIds: journeys.map((journey) => journey.journeyId),
      },
      journeyStateRegistry,
      journeyTransitionRegistry,
      journeys,
    },
    journeySteps,
    journeyStateRegistry,
    journeyTransitionRegistry,
  };
}
