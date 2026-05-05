import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { buildProjectContext } from "../src/core/context-builder.js";
import { createPlatformObservabilityTransport } from "../src/core/platform-observability-transport.js";
import { createSecurityAuditLogStore } from "../src/core/security-audit-log-store.js";

const TEST_CANONICAL_TASK_INVENTORY = Array.from({ length: 103 }, (_, index) => ({
  execution_order: String(index + 1).padStart(3, "0"),
  taskName: `Canonical Task ${String(index + 1).padStart(3, "0")}`,
  lane: "Test Lane",
  state: "trueGreen",
  blocker: null,
  bridgeCondition: null,
}));

test("context builder merges scan and external diagnostics into canonical context", () => {
  const context = buildProjectContext({
    id: "royal-casino",
    goal: "להשלים auth",
    state: {
      product: {
        hasAuth: false,
        hasPaymentIntegration: false,
      },
      knowledge: {
        knownGaps: ["גאפ פנימי"],
      },
      stack: {
        frontend: "לא זוהה",
        backend: "לא זוהה",
        database: "לא זוהה",
      },
    },
    scan: {
      findings: {
        hasAuth: true,
        hasMigrations: false,
        hasTests: false,
      },
      gaps: ["לא זוהו קבצי migrations או ניהול סכימה"],
      stack: {
        frontend: ["Expo"],
        backend: ["Express"],
        database: ["Postgres"],
      },
      knowledge: {
        summary: "README: Auth | Wallet",
        knownMissingParts: ["onboarding flow"],
        readme: {
          path: "README.md",
          headings: ["Auth", "Wallet"],
          excerpt: "TODO: onboarding flow",
        },
        docs: [
          {
            path: "docs/roadmap.md",
            headings: ["Roadmap"],
            excerpt: "Later: admin dashboard",
          },
        ],
        integrations: {
          prDiscussions: { status: "not-connected" },
          notion: { status: "not-connected" },
        },
      },
    },
    externalSnapshot: {
      source: "casino-api",
      technical: {
        stack: {
          frontend: "Expo React Native",
          backend: "Node.js + Express + TypeScript",
          database: "PostgreSQL (planned)",
        },
        knownTechnicalGaps: ["Database client is not wired yet."],
      },
      features: {
        hasAuth: true,
        hasPayments: false,
        hasWallet: false,
      },
      flows: {
        registration: {
          status: "partial",
          blockedBy: ["frontend_auth_flow_missing"],
          notes: "frontend missing",
        },
      },
      roadmapContext: {
        criticalDependencies: ["Database Schema"],
        knownMissingParts: ["Wallet and treasury implementation"],
      },
    },
    canonicalTaskInventory: TEST_CANONICAL_TASK_INVENTORY,
  });

  assert.equal(context.domain, "casino");
  assert.equal(context.capabilities.auth.value, true);
  assert.equal(context.capabilities.auth.source, "casino-api");
  assert.equal(context.stack.backend.value, "Node.js + Express + TypeScript");
  assert.equal(context.bottleneck.title, "Database Schema");
  assert.equal(context.bottleneck.metadata.status, "verified");
  assert.equal(context.bottleneck.metadata.derivedFrom, "roadmapContext.criticalDependencies");
  assert.equal(context.dependencies.length >= 1, true);
  assert.equal(context.risks.length >= 1, true);
  assert.equal(context.recommendedActions.length >= 2, true);
  assert.equal(context.recommendedActions[0].metadata.status, "verified");
  assert.equal(context.reliability.decisionConfidenceThreshold, 0.65);
  assert.equal(context.knowledge.readme.path, "README.md");
  assert.equal(context.knowledge.docs[0].path, "docs/roadmap.md");
  assert.equal(context.gaps.some((gap) => gap.text === "onboarding flow"), true);
  assert.equal(context.domainRegistry.version, "1.0.0");
  assert.equal(context.domainProfile.domain, "casino");
  assert.equal(context.domainProfile.releaseTargets.includes("web-deployment"), true);
  assert.equal(context.domainCandidates[0], "casino");
  assert.equal(context.confidenceScores.casino, 1);
  assert.equal(context.domainCapabilities.taskTypes.includes("payments"), true);
  assert.equal(context.requiredContextFields.includes("wallet"), true);
  assert.equal(context.executionModes.includes("sandbox"), true);
  assert.equal(context.recommendedDefaults.provisional, true);
  assert.equal(context.recommendedDefaults.hosting.target, "web-deployment");
  assert.equal(Array.isArray(context.defaultsTrace), true);
  assert.equal(context.defaultsTrace.some((item) => item.ruleId === "domain-baseline"), true);
  assert.equal(context.stackRecommendation.frontend, "react");
  assert.equal(context.stackRecommendation.backend, "node");
  assert.equal(context.businessContext.targetAudience, "casino players");
  assert.equal(context.businessContext.gtmStage, "build");
  assert.equal(Array.isArray(context.businessContext.kpis), true);
  assert.equal(Boolean(context.reliabilitySlaModel?.reliabilityModelId), true);
  assert.equal(context.reliabilitySlaModel?.schemaStatus, "canonical");
  assert.equal(Number.isFinite(context.reliabilitySlaModel?.recoveryObjectives?.rtoMinutes), true);
  assert.equal(Array.isArray(context.reliabilitySlaModel?.failureClasses), true);
  assert.equal(typeof context.featureFlagSchema?.featureFlagSchemaId, "string");
  assert.equal(Array.isArray(context.featureFlagSchema?.flags), true);
  assert.equal(context.featureFlagSchema?.summary?.totalFlags >= 1, true);
  assert.equal(Array.isArray(context.featureFlagSchema?.summary?.environmentsTargeted), true);
  assert.equal(typeof context.featureFlagDecision?.resolvedAt, "string");
  assert.equal(Array.isArray(context.featureFlagDecision?.flagResults), true);
  assert.equal(Array.isArray(context.featureFlagDecision?.blockedRoutes), true);
  assert.equal(typeof context.killSwitchDecision?.killSwitchDecisionId, "string");
  assert.equal(typeof context.killSwitchDecision?.isActive, "boolean");
  assert.equal(typeof context.projectDraft?.id, "string");
  assert.equal(typeof context.projectDraft?.owner?.displayName, "string");
  assert.equal(typeof context.projectDraft?.onboardingReadiness?.canStartOnboarding, "boolean");
  assert.equal(typeof context.projectDraft?.bootstrapMetadata?.suggestedBootstrapMode, "string");
  assert.equal(typeof context.projectIdentity?.identityId, "string");
  assert.equal(typeof context.productBoundaryModel?.productBoundaryModelId, "string");
  assert.equal(typeof context.productBoundaryModel?.automationClass, "string");
  assert.equal(Array.isArray(context.productBoundaryModel?.supportedWorkflows), true);
  assert.equal(typeof context.capabilityLimitMap?.capabilityLimitMapId, "string");
  assert.equal(Array.isArray(context.capabilityLimitMap?.promises), true);
  assert.equal(Array.isArray(context.capabilityLimitMap?.limits), true);
  assert.equal(typeof context.boundaryDisclosureModel?.boundaryDisclosureModelId, "string");
  assert.equal(Array.isArray(context.boundaryDisclosureModel?.disclosureCards), true);
  assert.equal(typeof context.systemCapabilityRegistry?.systemCapabilityRegistryId, "string");
  assert.equal(Array.isArray(context.systemCapabilityRegistry?.capabilities), true);
  assert.equal(typeof context.externalCapabilityRegistry?.externalCapabilityRegistryId, "string");
  assert.equal(Array.isArray(context.externalCapabilityRegistry?.providerEntries), true);
  assert.equal(typeof context.capabilityDecision?.capabilityDecisionId, "string");
  assert.equal(typeof context.capabilityDecision?.decision, "string");
  assert.equal(typeof context.atomicExecutionEnvelope?.atomicExecutionEnvelopeId, "string");
  assert.equal(typeof context.atomicExecutionEnvelope?.status, "string");
  assert.equal(typeof context.externalExecutionResult?.externalExecutionResultId, "string");
  assert.equal(typeof context.externalExecutionResult?.dispatchDecision, "string");
  assert.equal(typeof context.externalExecutionSession?.externalExecutionSessionId, "string");
  assert.equal(typeof context.externalExecutionSession?.summary?.isDispatchActive, "boolean");
  assert.equal(typeof context.ideAgentResultNormalization?.ideAgentResultNormalizationId, "string");
  assert.equal(typeof context.ideAgentResultNormalization?.summary?.canPromoteToArtifactCollection, "boolean");
  assert.equal(typeof context.executionInvocationContract?.executionInvocationContractId, "string");
  assert.equal(typeof context.executionInvocationContract?.summary?.canInvoke, "boolean");
  assert.equal(typeof context.artifactCollectionPipeline?.artifactCollectionPipelineId, "string");
  assert.equal(typeof context.artifactCollectionPipeline?.summary?.canPromoteToResultEnvelope, "boolean");
  assert.equal(typeof context.canonicalExecutionResultEnvelope?.canonicalExecutionResultEnvelopeId, "string");
  assert.equal(typeof context.canonicalExecutionResultEnvelope?.summary?.isReadyForDeploymentReality, "boolean");
  assert.equal(typeof context.deploymentInvocation?.deploymentInvocationId, "string");
  assert.equal(typeof context.deploymentInvocation?.invocationSummary?.canCollectEvidenceNext, "boolean");
  assert.equal(typeof context.deploymentEvidence?.deploymentEvidenceId, "string");
  assert.equal(typeof context.deploymentEvidence?.summary?.canAdvanceToDeploymentResult, "boolean");
  assert.equal(typeof context.deploymentResultEnvelope?.deploymentResultEnvelopeId, "string");
  assert.equal(typeof context.deploymentResultEnvelope?.summary?.isReadyForLaunchVerification, "boolean");
  assert.equal(typeof context.productionHealthValidation?.productionHealthValidationId, "string");
  assert.equal(typeof context.productionHealthValidation?.summary?.canConfirmLaunch, "boolean");
  assert.equal(typeof context.launchConfirmationState?.launchConfirmationStateId, "string");
  assert.equal(typeof context.launchConfirmationState?.summary?.confirmed, "boolean");
  assert.equal(typeof context.releaseReadinessEvaluation?.releaseReadinessEvaluationId, "string");
  assert.equal(typeof context.releaseReadinessEvaluation?.summary?.readinessScore, "number");
  assert.equal(typeof context.executionConsistencyReport?.executionConsistencyReportId, "string");
  assert.equal(typeof context.executionConsistencyReport?.summary?.isConsistent, "boolean");
  assert.equal(typeof context.projectIdentity?.name, "string");
  assert.equal(typeof context.projectIdentity?.audience, "string");
  assert.equal(typeof context.projectIdentityProfile?.profileId, "string");
  assert.equal(typeof context.projectIdentityProfile?.summary?.canShowIdentityCard, "boolean");
  assert.equal(typeof context.identityCompleteness?.score, "number");
  assert.equal(typeof context.instantValuePlan?.planId, "string");
  assert.equal(typeof context.instantValuePlan?.outputType, "string");
  assert.equal(typeof context.decisionIntelligence.summary.requiresApproval, "boolean");
  assert.equal(Array.isArray(context.decisionIntelligence.decisionTypes), true);
  assert.equal(typeof context.approvalRequest?.approvalRequestId, "string");
  assert.equal(typeof context.approvalRequest?.status, "string");
  assert.equal(typeof context.approvalRule?.id, "string");
  assert.equal(typeof context.approvalRule?.approvalClass, "string");
  assert.equal(typeof context.approvalTrigger?.requiresApproval, "boolean");
  assert.equal(typeof context.approvalTrigger?.approvalType, "string");
  assert.equal(Array.isArray(context.approvalRecords), true);
  assert.equal(typeof context.approvalRecord?.approvalRecordId, "string");
  assert.equal(typeof context.approvalRecord?.status, "string");
  assert.equal(Array.isArray(context.approvalRecord?.auditTrail), true);
  assert.equal(typeof context.approvalStatus?.status, "string");
  assert.equal(typeof context.approvalStatus?.isApproved, "boolean");
  assert.equal(typeof context.gatingDecision?.decision, "string");
  assert.equal(typeof context.gatingDecision?.isBlocked, "boolean");
  assert.equal(Array.isArray(context.approvalAuditTrail?.entries), true);
  assert.equal(typeof context.approvalAuditTrail?.totalEntries, "number");
  assert.equal(typeof context.policySchema?.policySchemaId, "string");
  assert.equal(typeof context.policySchema?.summary?.totalPolicies, "number");
  assert.equal(typeof context.agentGovernancePolicy?.agentType, "string");
  assert.equal(Array.isArray(context.agentGovernancePolicy?.allowedTools), true);
  assert.equal(typeof context.agentGovernancePolicy?.sandboxLevel, "string");
  assert.equal(typeof context.budgetDecision?.decision, "string");
  assert.equal(Array.isArray(context.budgetDecision?.budgetChecks), true);
  assert.equal(typeof context.budgetDecision?.constraintSource, "string");
  assert.equal(typeof context.budgetDecision?.hardLimitTriggered, "boolean");
  assert.equal(typeof context.budgetDecision?.softLimitTriggered, "boolean");
  assert.equal(typeof context.sandboxDecision?.sandboxDecisionId, "string");
  assert.equal(typeof context.sandboxDecision?.decision, "string");
  assert.equal(Array.isArray(context.sandboxDecision?.alternatives), true);
  assert.equal(typeof context.agentLimitDecision?.agentLimitDecisionId, "string");
  assert.equal(typeof context.agentLimitDecision?.decision, "string");
  assert.equal(Array.isArray(context.agentLimitDecision?.limitChecks), true);
  assert.equal(Array.isArray(context.agentLimitDecision?.costChecks), true);
  assert.equal(Array.isArray(context.agentLimitDecision?.providerSideEffectChecks), true);
  assert.equal(typeof context.agentGovernanceTrace?.agentGovernanceTraceId, "string");
  assert.equal(typeof context.agentGovernanceTrace?.finalDecision, "string");
  assert.equal(Array.isArray(context.agentGovernanceTrace?.allChecks), true);
  assert.equal(typeof context.agentGovernanceTrace?.summary?.totalChecks, "number");
  assert.equal(typeof context.platformCostMetric?.platformCostMetricId, "string");
  assert.equal(typeof context.platformCostMetric?.usageType, "string");
  assert.equal(typeof context.platformCostMetric?.currency, "string");
  assert.equal(typeof context.billingPlanSchema?.billingPlanSchemaId, "string");
  assert.equal(Array.isArray(context.billingPlanSchema?.plans), true);
  assert.equal(Array.isArray(context.billingPlanSchema?.usageDimensions), true);
  assert.equal(typeof context.entitlementDecision?.entitlementDecisionId, "string");
  assert.equal(typeof context.entitlementDecision?.decision, "string");
  assert.equal(Array.isArray(context.entitlementDecision?.features), true);
  assert.equal(typeof context.subscriptionState?.subscriptionStateId, "string");
  assert.equal(typeof context.subscriptionState?.status, "string");
  assert.equal(typeof context.subscriptionState?.source, "string");
  assert.equal(
    context.subscriptionState?.source === "workspace-billing-state"
      || context.subscriptionState?.source === "billing-plan-schema"
      || context.subscriptionState?.source === "fallback-default",
    true,
  );
  assert.equal(typeof context.subscriptionState?.summary, "string");
  assert.equal(typeof context.aiUsageMetric?.aiUsageMetricId, "string");
  assert.equal(typeof context.aiUsageMetric?.usageType, "string");
  assert.equal(typeof context.aiUsageMetric?.unit, "string");
  assert.equal(typeof context.workspaceComputeMetric?.workspaceComputeMetricId, "string");
  assert.equal(context.workspaceComputeMetric?.usageType, "workspace");
  assert.equal(context.workspaceComputeMetric?.unit, "workspace-minute");
  assert.equal(typeof context.buildDeployCostMetric?.buildDeployCostMetricId, "string");
  assert.equal(context.buildDeployCostMetric?.unit, "build-minute");
  assert.equal(typeof context.storageCostMetric?.storageCostMetricId, "string");
  assert.equal(context.storageCostMetric?.usageType, "storage");
  assert.equal(context.storageCostMetric?.unit, "gb-month");
  assert.equal(typeof context.costSummary?.costSummaryId, "string");
  assert.equal(typeof context.costSummary?.summary?.summaryStatus, "string");
  assert.equal(context.costSummary?.breakdown?.build?.unit, "build-minute");
  assert.equal(Array.isArray(context.normalizedBillingEvents), true);
  assert.equal(context.normalizedBillingEvents.every((event) => !Object.hasOwn(event, "providerPayload")), true);
  assert.equal(typeof context.billableUsage?.billableUsageId, "string");
  assert.equal(Array.isArray(context.billableUsage?.items), true);
  assert.equal(typeof context.billableUsage?.summary?.summaryStatus, "string");
  assert.equal(typeof context.reasonableUsagePolicy?.policyId, "string");
  assert.equal(typeof context.reasonableUsagePolicy?.workspaceMode, "string");
  assert.equal(typeof context.reasonableUsagePolicy?.threshold?.source, "string");
  assert.equal(typeof context.reasonableUsagePolicy?.summary?.summaryStatus, "string");
  assert.equal(typeof context.workspaceBillingState?.workspaceBillingStateId, "string");
  assert.equal(typeof context.workspaceBillingState?.summary?.summaryStatus, "string");
  assert.equal(typeof context.payingUserMetrics?.payingUserMetricsId, "string");
  assert.equal(typeof context.payingUserMetrics?.payingUsers, "number");
  assert.equal(typeof context.payingUserMetrics?.summary?.countedEvents, "number");
  assert.equal(typeof context.revenueSummary?.revenueSummaryId, "string");
  assert.equal(typeof context.revenueSummary?.paymentPosture, "string");
  assert.equal(typeof context.revenueSummary?.summary?.summaryStatus, "string");
  assert.equal(typeof context.billingGuardDecision?.billingGuardDecisionId, "string");
  assert.equal(typeof context.billingGuardDecision?.decision, "string");
  assert.equal(Array.isArray(context.billingGuardDecision?.guardChecks), true);
  assert.equal(typeof context.billingGuardDecision?.summary?.summaryStatus, "string");
  assert.deepEqual(Object.keys(context.billingSettingsModel ?? {}), [
    "currentPlan",
    "subscription",
    "availableActions",
    "history",
  ]);
  assert.equal(Array.isArray(context.billingSettingsModel?.availableActions), true);
  assert.equal(Array.isArray(context.billingSettingsModel?.history), true);
  assert.equal(
    context.billingSettingsModel?.availableActions.some((action) => action.actionType === "renew"),
    false,
  );
  assert.equal(Object.hasOwn(context.billingSettingsModel ?? {}, "usage"), false);
  assert.equal(Object.hasOwn(context.billingSettingsModel ?? {}, "paymentMethod"), false);
  assert.equal(Object.hasOwn(context.billingSettingsModel ?? {}, "billingDetails"), false);
  assert.equal(Object.hasOwn(context.billingSettingsModel ?? {}, "invoices"), false);
  assert.equal(
    context.billingApprovalRequest === null || typeof context.billingApprovalRequest?.requestType === "string",
    true,
  );
  assert.equal(typeof context.costVisibilityPayload?.costVisibilityPayloadId, "string");
  assert.equal(Array.isArray(context.costVisibilityPayload?.breakdown), true);
  assert.equal(Array.isArray(context.costVisibilityPayload?.topCostDrivers), true);
  assert.equal(typeof context.costDashboardModel?.dashboardId, "string");
  assert.equal(Array.isArray(context.costDashboardModel?.kpiCards), true);
  assert.equal(context.costDashboardModel?.breakdownTable?.componentType, "table");
  assert.equal(typeof context.costAwareActionSelection?.costAwareActionSelectionId, "string");
  assert.equal(typeof context.costAwareActionSelection?.selectionBasis, "string");
  assert.equal(Array.isArray(context.costAwareActionSelection?.rankedActions), true);
  assert.equal(typeof context.costAwareActionSelection?.summary?.hasSelection, "boolean");
  assert.equal(typeof context.actionPolicy?.id, "string");
  assert.equal(typeof context.actionPolicy?.kind, "string");
  assert.equal(typeof context.policyDecision?.decision, "string");
  assert.equal(typeof context.policyDecision?.isAllowed, "boolean");
  assert.equal(Array.isArray(context.policyViolations), true);
  assert.equal(typeof context.deployPolicyDecision?.decision, "string");
  assert.equal(typeof context.deployPolicyDecision?.isAllowed, "boolean");
  assert.equal(typeof context.enforcementResult?.decision, "string");
  assert.equal(typeof context.enforcementResult?.isAllowed, "boolean");
  assert.equal(typeof context.policyTrace?.finalDecision, "string");
  assert.equal(Array.isArray(context.policyTrace?.traceSteps), true);
  assert.equal(typeof context.diffPreviewSchema?.previewId, "string");
  assert.equal(typeof context.diffPreviewSchema?.changeSummary?.totalChanges, "number");
  assert.equal(typeof context.codeDiff?.totalCodeChanges, "number");
  assert.equal(Array.isArray(context.codeDiff?.files), true);
  assert.equal(typeof context.migrationDiff?.totalMigrationChanges, "number");
  assert.equal(Array.isArray(context.migrationDiff?.migrations), true);
  assert.equal(typeof context.infraDiff?.totalInfraChanges, "number");
  assert.equal(Array.isArray(context.infraDiff?.changes), true);
  assert.equal(typeof context.impactSummary?.totalChanges, "number");
  assert.equal(Array.isArray(context.riskFlags), true);
  assert.equal(typeof context.diffPreview?.headline, "string");
  assert.equal(typeof context.diffPreview?.summary?.totalChanges, "number");
  assert.equal(typeof context.credentialPolicyDecision?.decision, "string");
  assert.equal(typeof context.credentialPolicyDecision?.isAllowed, "boolean");
  assert.equal(typeof context.businessBottleneck.title, "string");
  assert.equal(typeof context.businessBottleneck.reason, "string");
  assert.equal(typeof context.bottleneckState?.blockerType, "string");
  assert.equal(typeof context.bottleneckState?.summary?.isBlocked, "boolean");
  assert.equal(typeof context.systemBottleneckSummary?.status, "string");
  assert.equal(Array.isArray(context.systemBottleneckSummary?.signals), true);
  assert.equal(typeof context.activeBottleneck?.blockerType, "string");
  assert.equal(typeof context.activeBottleneck?.summary?.isBlocking, "boolean");
  assert.equal(typeof context.scoredBottleneck?.priorityScore, "number");
  assert.equal(typeof context.scoredBottleneck?.summary?.priorityBand, "string");
  assert.equal(typeof context.unblockPlan?.unblockPlanId, "string");
  assert.equal(typeof context.unblockPlan?.summary?.actionCount, "number");
  assert.equal(typeof context.updatedBottleneckState?.status, "string");
  assert.equal(typeof context.updatedBottleneckState?.summary?.isBlocked, "boolean");
  assert.equal(typeof context.explanationSchema?.schemaId, "string");
  assert.equal(Array.isArray(context.explanationSchema?.explanationTypes), true);
  assert.equal(typeof context.nextActionExplanation?.explanationId, "string");
  assert.equal(Array.isArray(context.nextActionExplanation?.alternatives), true);
  assert.equal(typeof context.failureExplanation?.explanationId, "string");
  assert.equal(typeof context.failureExplanation?.likelyCause, "string");
  assert.equal(typeof context.approvalExplanation?.explanationId, "string");
  assert.equal(typeof context.approvalExplanation?.whatIfRejected, "string");
  assert.equal(typeof context.changeExplanation?.explanationId, "string");
  assert.equal(Array.isArray(context.changeExplanation?.updatedArtifacts), true);
  assert.equal(typeof context.projectExplanation?.explanationId, "string");
  assert.equal(typeof context.projectExplanation?.summary?.hasNextAction, "boolean");
  assert.equal(Array.isArray(context.crossFunctionalTaskGraph.nodes), true);
  assert.equal(typeof context.crossFunctionalTaskGraph.summary.gtmStage, "string");
  assert.equal(Array.isArray(context.growthMarketingPlan), true);
  assert.equal(typeof context.userIdentity?.displayName, "string");
  assert.equal(typeof context.userIdentity?.authMetadata?.provider, "string");
  assert.equal(typeof context.authenticationState?.status, "string");
  assert.equal(typeof context.authenticationState?.isAuthenticated, "boolean");
  assert.equal(typeof context.ownerAuthState?.ownerAuthStateId, "string");
  assert.equal(typeof context.ownerAuthState?.trustLevel, "string");
  assert.equal(typeof context.ownerAuthState?.privilegedModeEligible, "boolean");
  assert.equal(typeof context.ownerMfaDecision?.ownerMfaDecisionId, "string");
  assert.equal(typeof context.ownerMfaDecision?.decision, "string");
  assert.equal(Array.isArray(context.ownerMfaDecision?.checks), true);
  assert.equal(typeof context.deviceTrustDecision?.deviceTrustDecisionId, "string");
  assert.equal(typeof context.deviceTrustDecision?.decision, "string");
  assert.equal(typeof context.sensitiveActionConfirmation?.sensitiveActionConfirmationId, "string");
  assert.equal(typeof context.stepUpAuthDecision?.stepUpAuthDecisionId, "string");
  assert.equal(typeof context.privilegedModeState?.privilegedModeStateId, "string");
  assert.equal(typeof context.ownerAccessDecision?.ownerAccessDecisionId, "string");
  assert.equal(typeof context.criticalOperationDecision?.criticalOperationDecisionId, "string");
  assert.equal(typeof context.sessionState?.status, "string");
  assert.equal(typeof context.securitySignals?.suspiciousActivity, "boolean");
  assert.equal(typeof context.securitySignals?.authFailures, "number");
  assert.equal(typeof context.sessionSecurityDecision?.decision, "string");
  assert.equal(typeof context.sessionSecurityDecision?.isBlocked, "boolean");
  assert.equal(typeof context.authenticationRouteDecision?.decisionId, "string");
  assert.equal(typeof context.authenticationRouteDecision?.route, "string");
  assert.equal(typeof context.authenticationRouteDecision?.summary?.canEnterWorkspaceDirectly, "boolean");
  assert.equal(typeof context.tokenBundle?.tokenType === "string" || context.tokenBundle?.tokenType === null, true);
  assert.equal(typeof context.verificationFlowState?.status, "string");
  assert.equal(Array.isArray(context.verificationFlowState?.nextActions), true);
  assert.equal(typeof context.authenticationViewState?.viewStateId, "string");
  assert.equal(typeof context.authenticationViewState?.activeScreen, "string");
  assert.equal(typeof context.authenticationViewState?.screens?.login?.enabled, "boolean");
  assert.equal(typeof context.authenticationViewState?.summary?.needsUserInput, "boolean");
  assert.equal(typeof context.workspaceModel?.workspaceId, "string");
  assert.deepEqual(Object.keys(context.workspaceMode ?? {}), ["type"]);
  assert.equal(typeof context.workspaceMode?.type, "string");
  assert.deepEqual(Object.keys(context.workspaceModeDefinitions ?? {}), ["user-only", "hybrid", "autonomous"]);
  assert.equal(context.workspaceModeDefinitions?.["user-only"]?.actor, "user");
  assert.equal(context.workspaceModeDefinitions?.hybrid?.actor, "user+system");
  assert.equal(context.workspaceModeDefinitions?.autonomous?.actor, "system");
  assert.equal(typeof context.postAuthRedirect?.redirectId, "string");
  assert.equal(typeof context.postAuthRedirect?.destination, "string");
  assert.equal(typeof context.postAuthRedirect?.summary?.entersWorkbench, "boolean");
  assert.equal(typeof context.projectCreationExperience?.experienceId, "string");
  assert.equal(typeof context.projectCreationExperience?.primaryAction?.actionId, "string");
  assert.equal(typeof context.projectCreationExperience?.validation?.canCreateDraft, "boolean");
  assert.equal(typeof context.projectCreationRedirect?.redirectId, "string");
  assert.equal(typeof context.projectCreationRedirect?.target, "string");
  assert.equal(typeof context.projectCreationRedirect?.summary?.canReturnLater, "boolean");
  assert.equal(typeof context.nexusAppShellSchema?.nexusAppShellSchemaId, "string");
  assert.equal(Array.isArray(context.nexusAppShellSchema?.routeRegistry), true);
  assert.equal(typeof context.authenticatedAppShell?.authenticatedAppShellId, "string");
  assert.equal(typeof context.authenticatedAppShell?.shellStage, "string");
  assert.equal(typeof context.navigationRouteSurface?.navigationRouteSurfaceId, "string");
  assert.equal(Array.isArray(context.navigationRouteSurface?.workspaceTabs), true);
  assert.equal(typeof context.onboardingProgress?.progressId, "string");
  assert.equal(typeof context.onboardingProgress?.currentStep, "string");
  assert.equal(Array.isArray(context.onboardingProgress?.completedSteps), true);
  assert.equal(typeof context.onboardingViewState?.viewStateId, "string");
  assert.equal(typeof context.onboardingViewState?.activeScreen, "string");
  assert.equal(Array.isArray(context.onboardingViewState?.questions), true);
  assert.equal(typeof context.onboardingViewState?.summary?.needsUserInput, "boolean");
  assert.equal(typeof context.onboardingCompletionDecision?.decisionId, "string");
  assert.equal(typeof context.onboardingCompletionDecision?.isComplete, "boolean");
  assert.equal(Array.isArray(context.onboardingCompletionDecision?.clarificationPrompts), true);
  assert.equal(typeof context.onboardingCompletionDecision?.summary?.canCreateProjectState, "boolean");
  assert.equal(typeof context.onboardingStateHandoff?.handoffId, "string");
  assert.equal(typeof context.onboardingStateHandoff?.handoffStatus, "string");
  assert.equal(Array.isArray(context.onboardingStateHandoff?.missingClarifications), true);
  assert.equal(typeof context.onboardingStateHandoff?.summary?.canBuildProjectState, "boolean");
  assert.equal(typeof context.projectPermissionSchema?.permissionSchemaId, "string");
  assert.equal(Array.isArray(context.projectPermissionSchema?.permissionsByRole), true);
  assert.equal(typeof context.projectPermissionSchema?.permissionsByRole[0]?.capabilities?.view, "boolean");
  assert.equal(typeof context.projectPermissionSchema?.summary?.deployCapableRoles, "number");
  assert.equal(typeof context.roleCapabilityMatrix?.roleCapabilityMatrixId, "string");
  assert.equal(Array.isArray(context.roleCapabilityMatrix?.roles), true);
  assert.equal(typeof context.roleCapabilityMatrix?.roles[0]?.capabilities?.deploy, "boolean");
  assert.equal(typeof context.roleCapabilityMatrix?.summary?.privilegedRoles, "number");
  assert.equal(typeof context.projectAuthorizationDecision?.authorizationDecisionId, "string");
  assert.equal(typeof context.projectAuthorizationDecision?.decision, "string");
  assert.equal(typeof context.projectAuthorizationDecision?.requiredCapability, "string");
  assert.equal(Array.isArray(context.projectAuthorizationDecision?.checks), true);
  assert.equal(typeof context.privilegedAuthorityDecision?.privilegedAuthorityDecisionId, "string");
  assert.equal(typeof context.privilegedAuthorityDecision?.decision, "string");
  assert.equal(typeof context.privilegedAuthorityDecision?.isPrivilegedAction, "boolean");
  assert.equal(Array.isArray(context.privilegedAuthorityDecision?.checks), true);
  assert.equal(typeof context.tenantIsolationSchema?.tenantIsolationSchemaId, "string");
  assert.equal(Array.isArray(context.tenantIsolationSchema?.isolatedResources), true);
  assert.equal(typeof context.tenantIsolationSchema?.isolatedResources[0]?.tenantBoundary, "string");
  assert.equal(typeof context.tenantIsolationSchema?.summary?.criticalResources, "number");
  assert.equal(typeof context.workspaceIsolationDecision?.workspaceIsolationDecisionId, "string");
  assert.equal(typeof context.workspaceIsolationDecision?.decision, "string");
  assert.equal(typeof context.workspaceIsolationDecision?.resourceType, "string");
  assert.equal(Array.isArray(context.workspaceIsolationDecision?.checks), true);
  assert.equal(typeof context.tenantBoundaryEvidence?.tenantBoundaryEvidenceId, "string");
  assert.equal(typeof context.tenantBoundaryEvidence?.evidenceStatus, "string");
  assert.equal(Array.isArray(context.tenantBoundaryEvidence?.evidenceChecks), true);
  assert.equal(typeof context.leakageAlert?.leakageAlertId, "string");
  assert.equal(typeof context.leakageAlert?.severity, "string");
  assert.equal(Array.isArray(context.leakageAlert?.leakSignals), true);
  assert.equal(Array.isArray(context.leakageAlert?.checks), true);
  assert.equal(
    context.leakageAlert?.severity,
    context.tenantBoundaryEvidence?.evidenceStatus === "blocked"
      ? "critical"
      : context.tenantBoundaryEvidence?.evidenceStatus === "requires-approval"
        ? "warning"
        : "clear",
  );
  assert.equal(typeof context.projectOwnershipBinding?.bindingId, "string");
  assert.equal(typeof context.projectOwnershipBinding?.ownerUserId === "string" || context.projectOwnershipBinding?.ownerUserId === null, true);
  assert.equal(typeof context.initialProjectStateContract?.contractId, "string");
  assert.equal(Array.isArray(context.initialProjectStateContract?.requiredInputs), true);
  assert.equal(typeof context.initialProjectStateContract?.readiness?.canBootstrapState, "boolean");
  assert.equal(typeof context.initialProjectState?.stateId, "string");
  assert.equal(typeof context.initialProjectState?.identity?.identityId, "string");
  assert.equal(Array.isArray(context.initialProjectState?.constraints?.requiredInputs), true);
  assert.equal(typeof context.initialProjectState?.summary?.isCanonical, "boolean");
  assert.equal(typeof context.stateBootstrapPayload?.payloadId, "string");
  assert.equal(typeof context.stateBootstrapPayload?.initialProjectStateId, "string");
  assert.equal(Array.isArray(context.stateBootstrapPayload?.approvals), true);
  assert.equal(typeof context.stateBootstrapPayload?.summary?.canBootstrap, "boolean");
  assert.equal(typeof context.membershipRecord?.membershipId, "string");
  assert.equal(Array.isArray(context.membershipRecord?.roles), true);
  assert.equal(typeof context.userAgentMapping?.userAgentMappingId, "string");
  assert.equal(typeof context.userAgentMapping?.status, "string");
  assert.equal(typeof context.userAgentMapping?.summary?.totalMappedAgents, "number");
  assert.equal(typeof context.accessDecision?.decision, "string");
  assert.equal(typeof context.accessDecision?.canRun, "boolean");
  assert.equal(typeof context.collaborationEvent?.eventId, "string");
  assert.equal(typeof context.collaborationEvent?.eventType, "string");
  assert.equal(typeof context.collaborationEvent?.summary?.isSharedEvent, "boolean");
  assert.equal(typeof context.collaborationEvent?.actor?.role, "string");
  assert.equal(typeof context.collaborationEvent?.target?.workspaceArea, "string");
  assert.equal(
    context.collaborationEvent?.target?.workspaceId,
    context.workspaceModel?.workspaceId,
  );
  assert.equal(typeof context.projectPresenceState?.presenceStateId, "string");
  assert.equal(Array.isArray(context.projectPresenceState?.participants), true);
  assert.equal(typeof context.projectPresenceState?.summary?.activeParticipantCount, "number");
  assert.equal(typeof context.sharedApprovalState?.sharedApprovalStateId, "string");
  assert.equal(Array.isArray(context.sharedApprovalState?.participants), true);
  assert.equal(typeof context.sharedApprovalState?.summary?.requiresCoordinatedDecision, "boolean");
  assert.equal(typeof context.collaborationFeed?.feedId, "string");
  assert.equal(Array.isArray(context.collaborationFeed?.items), true);
  assert.equal(typeof context.collaborationFeed?.summary?.containsWorkspaceTransitions, "boolean");
  assert.equal(typeof context.collaborationFeed?.summary?.totalItems, "number");
  assert.equal(
    context.collaborationFeed?.items.some((item) => item.source === "collaboration-event"),
    true,
  );
  assert.equal(typeof context.projectStateSnapshot?.snapshotId, "string");
  assert.equal(typeof context.projectStateSnapshot?.stateVersion, "number");
  assert.equal(typeof context.projectStateSnapshot?.summary?.isRestorable, "boolean");
  assert.equal(typeof context.snapshotRecord?.snapshotRecordId, "string");
  assert.equal(typeof context.snapshotRecord?.storageMetadata?.checksum, "string");
  assert.equal(typeof context.snapshotRecord?.summary?.isStored, "boolean");
  assert.equal(typeof context.stateDiff?.stateDiffId, "string");
  assert.equal(Array.isArray(context.stateDiff?.artifactChanges), true);
  assert.equal(typeof context.stateDiff?.summary?.totalChanges, "number");
  assert.equal(typeof context.restoreDecision?.restoreDecisionId, "string");
  assert.equal(typeof context.restoreDecision?.restoreMode, "string");
  assert.equal(typeof context.restoreDecision?.summary?.isSafeToExecute, "boolean");
  assert.equal(typeof context.rollbackExecutionResult?.rollbackExecutionId, "string");
  assert.equal(typeof context.rollbackExecutionResult?.executionStatus, "string");
  assert.equal(typeof context.rollbackExecutionResult?.summary?.restoredTargetCount, "number");
  assert.equal(typeof context.invitationRecord?.status, "string");
  assert.equal(typeof context.roleAssignment?.status, "string");
  assert.equal(typeof context.workspaceSettings?.policyProfile, "string");
  assert.equal(typeof context.workspaceSettings?.teamPreferences?.notifications, "string");
  assert.equal(Array.isArray(context.userJourneys?.journeys), true);
  assert.equal(Array.isArray(context.journeySteps), true);
  assert.equal(typeof context.journeyStateRegistry?.stateModelType, "string");
  assert.equal(Array.isArray(context.journeyTransitionRegistry), true);
  assert.equal(typeof context.journeyMap?.summary?.totalJourneys, "number");
  assert.equal(Array.isArray(context.journeyMap?.flows), true);
  assert.equal(typeof context.screenInventory?.summary?.totalScreens, "number");
  assert.equal(Array.isArray(context.screenInventory?.screens), true);
  assert.equal(typeof context.screenFlowMap?.summary?.totalMappings, "number");
  assert.equal(Array.isArray(context.screenFlowMap?.mappings), true);
  assert.equal(Array.isArray(context.screenContracts), true);
  assert.equal(typeof context.screenContracts[0]?.screenType, "string");
  assert.equal(typeof context.screenContracts[0]?.screenGoal, "string");
  assert.equal(typeof context.screenContracts[0]?.primaryAction?.label, "string");
  assert.equal(typeof context.mobileChecklist?.checklistId, "string");
  assert.equal(Array.isArray(context.mobileChecklist?.screens), true);
  assert.equal(typeof context.mobileChecklist?.screens[0]?.screenType, "string");
  assert.equal(typeof context.mobileChecklist?.summary?.totalScreens, "number");
  assert.equal(typeof context.screenStates?.stateCollectionId, "string");
  assert.equal(Array.isArray(context.screenStates?.screens), true);
  assert.equal(typeof context.screenStates?.screens[0]?.states?.loading?.enabled, "boolean");
  assert.equal(typeof context.screenStates?.summary?.totalScreens, "number");
  assert.equal(typeof context.screenValidationChecklist?.checklistCollectionId, "string");
  assert.equal(Array.isArray(context.screenValidationChecklist?.screens), true);
  assert.equal(typeof context.screenValidationChecklist?.screens[0]?.summary?.isReadyForImplementation, "boolean");
  assert.equal(typeof context.screenValidationChecklist?.summary?.totalScreens, "number");
  assert.equal(typeof context.designTokens?.tokenSetId, "string");
  assert.equal(typeof context.designTokens?.colors?.accent, "string");
  assert.equal(typeof context.designTokens?.spacing?.lg, "number");
  assert.equal(typeof context.designTokens?.summary?.desktopFirst, "boolean");
  assert.equal(typeof context.typographySystem?.typographySystemId, "string");
  assert.equal(typeof context.typographySystem?.typeScale?.h1?.fontSize, "number");
  assert.equal(typeof context.typographySystem?.summary?.totalStyles, "number");
  assert.equal(typeof context.layoutSystem?.layoutSystemId, "string");
  assert.equal(typeof context.layoutSystem?.grid?.columns, "number");
  assert.equal(typeof context.layoutSystem?.containerWidths?.standard, "number");
  assert.equal(typeof context.layoutSystem?.summary?.supportsWorkbenchDensity, "boolean");
  assert.equal(typeof context.colorRules?.colorRulesId, "string");
  assert.equal(typeof context.colorRules?.roles?.accent?.token, "string");
  assert.equal(typeof context.colorRules?.states?.warning?.token, "string");
  assert.equal(typeof context.colorRules?.summary?.hasSemanticStates, "boolean");
  assert.equal(typeof context.interactionStateSystem?.interactionStateSystemId, "string");
  assert.equal(typeof context.interactionStateSystem?.states?.focus?.shadow, "string");
  assert.equal(typeof context.interactionStateSystem?.states?.destructive?.emphasisColor, "string");
  assert.equal(typeof context.interactionStateSystem?.summary?.includesSemanticInteractionStates, "boolean");
  assert.equal(typeof context.componentContract?.componentContractId, "string");
  assert.equal(Array.isArray(context.componentContract?.anatomy), true);
  assert.equal(Array.isArray(context.componentContract?.behavior?.supportsStates), true);
  assert.equal(typeof context.componentContract?.summary?.supportedStateCount, "number");
  assert.equal(typeof context.primitiveComponents?.componentLibraryId, "string");
  assert.equal(Array.isArray(context.primitiveComponents?.components), true);
  assert.equal(typeof context.primitiveComponents?.components[0]?.componentId, "string");
  assert.equal(typeof context.primitiveComponents?.summary?.totalComponents, "number");
  assert.equal(typeof context.layoutComponents?.layoutComponentLibraryId, "string");
  assert.equal(Array.isArray(context.layoutComponents?.components), true);
  assert.equal(typeof context.layoutComponents?.components[0]?.componentId, "string");
  assert.equal(typeof context.layoutComponents?.summary?.supportsWorkbenchLayouts, "boolean");
  assert.equal(typeof context.feedbackComponents?.feedbackComponentLibraryId, "string");
  assert.equal(Array.isArray(context.feedbackComponents?.components), true);
  assert.equal(typeof context.feedbackComponents?.components[0]?.componentId, "string");
  assert.equal(typeof context.feedbackComponents?.summary?.coversScreenStates, "boolean");
  assert.equal(typeof context.navigationComponents?.navigationComponentLibraryId, "string");
  assert.equal(Array.isArray(context.navigationComponents?.components), true);
  assert.equal(typeof context.navigationComponents?.components[0]?.componentId, "string");
  assert.equal(typeof context.navigationComponents?.summary?.supportsWorkspaceNavigation, "boolean");
  assert.equal(typeof context.dataDisplayComponents?.dataDisplayLibraryId, "string");
  assert.equal(Array.isArray(context.dataDisplayComponents?.components), true);
  assert.equal(typeof context.dataDisplayComponents?.components[0]?.componentId, "string");
  assert.equal(typeof context.dataDisplayComponents?.summary?.supportsOperationalDashboards, "boolean");
  assert.equal(typeof context.screenTemplateSchema?.templateId, "string");
  assert.equal(Array.isArray(context.screenTemplateSchema?.regions), true);
  assert.equal(Array.isArray(context.screenTemplateSchema?.requiredLibraries), true);
  assert.equal(typeof context.screenTemplateSchema?.summary?.regionCount, "number");
  assert.equal(typeof context.dashboardTemplate?.templateId, "string");
  assert.equal(typeof context.dashboardTemplate?.sections?.contentGrid?.enabled, "boolean");
  assert.equal(Array.isArray(context.dashboardTemplate?.composition?.primaryComponents), true);
  assert.equal(typeof context.dashboardTemplate?.summary?.supportsOverviewDashboards, "boolean");
  assert.equal(typeof context.detailPageTemplate?.templateId, "string");
  assert.equal(typeof context.detailPageTemplate?.sections?.primaryContent?.enabled, "boolean");
  assert.equal(Array.isArray(context.detailPageTemplate?.composition?.secondaryComponents), true);
  assert.equal(typeof context.detailPageTemplate?.summary?.supportsDetailInspection, "boolean");
  assert.equal(typeof context.workflowTemplate?.templateId, "string");
  assert.equal(typeof context.workflowTemplate?.sections?.stepper?.enabled, "boolean");
  assert.equal(Array.isArray(context.workflowTemplate?.composition?.primaryComponents), true);
  assert.equal(typeof context.workflowTemplate?.summary?.supportsWizardFlows, "boolean");
  assert.equal(typeof context.managementTemplate?.templateId, "string");
  assert.equal(typeof context.managementTemplate?.sections?.dataTable?.enabled, "boolean");
  assert.equal(Array.isArray(context.managementTemplate?.composition?.secondaryComponents), true);
  assert.equal(typeof context.managementTemplate?.summary?.supportsTableManagement, "boolean");
  assert.equal(typeof context.templateVariants?.variantCollectionId, "string");
  assert.equal(Array.isArray(context.templateVariants?.templates), true);
  assert.equal(Array.isArray(context.templateVariants?.templates[0]?.variants), true);
  assert.equal(typeof context.templateVariants?.summary?.enabledVariants, "number");
  assert.equal(typeof context.primaryActionValidation?.validationCollectionId, "string");
  assert.equal(Array.isArray(context.primaryActionValidation?.screens), true);
  assert.equal(typeof context.primaryActionValidation?.screens[0]?.summary?.isValid, "boolean");
  assert.equal(typeof context.primaryActionValidation?.summary?.validScreens, "number");
  assert.equal(typeof context.mobileValidation?.validationCollectionId, "string");
  assert.equal(Array.isArray(context.mobileValidation?.screens), true);
  assert.equal(typeof context.mobileValidation?.screens[0]?.summary?.isUsable, "boolean");
  assert.equal(typeof context.mobileValidation?.summary?.usableScreens, "number");
  assert.equal(typeof context.stateCoverageValidation?.validationCollectionId, "string");
  assert.equal(Array.isArray(context.stateCoverageValidation?.screens), true);
  assert.equal(typeof context.stateCoverageValidation?.screens[0]?.summary?.isValid, "boolean");
  assert.equal(typeof context.stateCoverageValidation?.summary?.validScreens, "number");
  assert.equal(typeof context.consistencyValidation?.validationCollectionId, "string");
  assert.equal(Array.isArray(context.consistencyValidation?.screens), true);
  assert.equal(typeof context.consistencyValidation?.screens[0]?.summary?.isConsistent, "boolean");
  assert.equal(typeof context.consistencyValidation?.summary?.validScreens, "number");
  assert.equal(typeof context.screenReviewReport?.reportId, "string");
  assert.equal(Array.isArray(context.screenReviewReport?.screens), true);
  assert.equal(typeof context.screenReviewReport?.screens[0]?.summary?.isReady, "boolean");
  assert.equal(typeof context.screenReviewReport?.summary?.readyScreens, "number");
  assert.equal(typeof context.learningInsights?.insightSetId, "string");
  assert.equal(Array.isArray(context.learningInsights?.items), true);
  assert.equal(typeof context.learningInsightViewModel?.viewModelId, "string");
  assert.equal(Array.isArray(context.learningInsightViewModel?.insights), true);
  assert.equal(Array.isArray(context.learningInsightViewModel?.patterns), true);
  assert.equal(typeof context.learningInsightViewModel?.confidence?.band, "string");
  assert.equal(typeof context.reasoningPanel?.panelId, "string");
  assert.equal(Array.isArray(context.reasoningPanel?.impact?.signals), true);
  assert.equal(Array.isArray(context.reasoningPanel?.learning?.reasons), true);
  assert.equal(typeof context.reasoningPanel?.policy?.requiresApproval, "boolean");
  assert.equal(typeof context.confidenceIndicator?.indicatorCollectionId, "string");
  assert.equal(Array.isArray(context.confidenceIndicator?.indicators), true);
  assert.equal(typeof context.confidenceIndicator?.summary?.totalPatterns, "number");
  assert.equal(typeof context.userPreferenceSignals?.signalViewId, "string");
  assert.equal(Array.isArray(context.userPreferenceSignals?.signals), true);
  assert.equal(typeof context.userPreferenceSignals?.summary?.totalSignals, "number");
  assert.equal(typeof context.crossProjectPatternPanel?.panelId, "string");
  assert.equal(Array.isArray(context.crossProjectPatternPanel?.patterns), true);
  assert.equal(Array.isArray(context.crossProjectPatternPanel?.recommendationHints), true);
  assert.equal(typeof context.crossProjectPatternPanel?.summary?.safeToDisplay, "boolean");
  assert.equal(typeof context.learningDisclosure?.bannerId, "string");
  assert.equal(typeof context.learningDisclosure?.visible, "boolean");
  assert.equal(typeof context.learningDisclosure?.summary?.isPassiveOnly, "boolean");
  assert.equal(typeof context.aiLearningWorkspaceTemplate?.templateId, "string");
  assert.equal(typeof context.aiLearningWorkspaceTemplate?.sections?.workspacePanels?.enabled, "boolean");
  assert.equal(typeof context.aiLearningWorkspaceTemplate?.summary?.supportsLearningInsights, "boolean");
  assert.equal(typeof context.contextRelevanceSchema?.schemaId, "string");
  assert.equal(Array.isArray(context.contextRelevanceSchema?.contextEntries), true);
  assert.equal(typeof context.contextRelevanceSchema?.summary?.highestPriorityScore, "number");
  assert.equal(typeof context.relevanceFilteredContext?.filterId, "string");
  assert.equal(Array.isArray(context.relevanceFilteredContext?.keptContext), true);
  assert.equal(typeof context.slimmedContextPayload?.payloadId, "string");
  assert.equal(Array.isArray(context.slimmedContextPayload?.orderedContext), true);
  assert.equal(typeof context.droppedContextSummary?.summaryId, "string");
  assert.equal(typeof context.companionState?.stateId, "string");
  assert.equal(typeof context.companionState?.state, "string");
  assert.equal(typeof context.companionState?.summary?.requiresAttention, "boolean");
  assert.equal(typeof context.companionState?.sourceSignals?.insightCount, "number");
  assert.equal(
    context.companionState?.sourceSignals?.insightCount,
    context.learningInsights?.summaryCounts?.totalInsights,
  );
  assert.equal(typeof context.companionTriggerDecision?.decisionId, "string");
  assert.equal(typeof context.companionTriggerDecision?.decisionType, "string");
  assert.equal(typeof context.companionTriggerDecision?.summary?.canInterrupt, "boolean");
  assert.equal(typeof context.companionTriggerDecision?.summary?.requiresApproval, "boolean");
  assert.equal(
    context.companionTriggerDecision?.summary?.canInterrupt,
    context.companionTriggerDecision?.decisionType === "interrupt",
  );
  assert.equal(typeof context.companionMessagePriority?.priorityId, "string");
  assert.equal(typeof context.companionMessagePriority?.priority, "string");
  assert.equal(typeof context.companionMessagePriority?.summary?.notificationType, "string");
  assert.equal(typeof context.companionMessagePriority?.summary?.insightCount, "number");
  assert.equal(
    context.companionMessagePriority?.summary?.insightCount,
    context.learningInsights?.summaryCounts?.totalInsights,
  );
  assert.equal(typeof context.companionPresence?.presenceId, "string");
  assert.equal(typeof context.companionPresence?.state, "string");
  assert.equal(typeof context.companionPresence?.summary?.canInterrupt, "boolean");
  assert.equal(typeof context.companionDock?.dockId, "string");
  assert.equal(typeof context.companionDock?.summary?.headline, "string");
  assert.equal(context.companionDock?.priority, context.companionMessagePriority?.priority);
  assert.equal(typeof context.companionPanel?.panelId, "string");
  assert.equal(typeof context.companionPanel?.summary?.showsNextActions, "boolean");
  assert.equal(
    context.companionPanel?.sections?.summary?.priority,
    context.companionMessagePriority?.priority,
  );
  assert.equal(typeof context.animationStateRules?.animationRulesId, "string");
  assert.equal(typeof context.animationStateRules?.animationMode, "string");
  assert.equal(typeof context.animationStateRules?.summary?.nonBlocking, "boolean");
  assert.equal(
    context.animationStateRules?.summary?.respectsQuietMode,
    context.companionTriggerDecision?.decisionType === "stay-quiet",
  );
  assert.equal(typeof context.companionModeSettings?.settingsId, "string");
  assert.equal(typeof context.companionModeSettings?.selectedMode, "string");
  assert.equal(typeof context.companionModeSettings?.summary?.presenceVisible, "boolean");
  assert.equal(
    Array.isArray(context.companionModeSettings?.availableModes),
    true,
  );
  assert.equal(
    context.companionModeSettings?.selectedMode,
    context.userPreferenceProfile?.companionMode,
  );
  assert.equal(typeof context.interruptionDecision?.decisionId, "string");
  assert.equal(typeof context.interruptionDecision?.decision, "string");
  assert.equal(typeof context.interruptionDecision?.summary?.canInterrupt, "boolean");
  assert.equal(typeof context.interruptionDecision?.summary?.blockedByQuietMode, "boolean");
  assert.equal(
    context.interruptionDecision?.allowed,
    context.interruptionDecision?.decision === "allow",
  );
  assert.equal(typeof context.aiCompanionTemplate?.templateId, "string");
  assert.equal(typeof context.aiCompanionTemplate?.sections?.companionDockZone?.enabled, "boolean");
  assert.equal(typeof context.aiCompanionTemplate?.summary?.hasPersistentCompanion, "boolean");
  assert.equal(
    context.aiCompanionTemplate?.companionSurface?.dock?.priority,
    context.companionDock?.priority ?? "advisory",
  );
  assert.equal(
    context.aiCompanionTemplate?.companionSurface?.panel?.priority,
    context.companionPanel?.sections?.summary?.priority ?? context.companionDock?.priority ?? "advisory",
  );
  assert.equal(typeof context.developerWorkspace?.workspaceId, "string");
  assert.equal(typeof context.developerWorkspace?.fileTree?.totalFiles, "number");
  assert.equal(typeof context.developerWorkspace?.terminal?.status, "string");
  assert.equal(typeof context.projectWorkbenchLayout?.layoutId, "string");
  assert.equal(Array.isArray(context.projectWorkbenchLayout?.zones), true);
  assert.equal(Array.isArray(context.projectWorkbenchLayout?.panels), true);
  assert.equal(typeof context.fileEditorContract?.contractId, "string");
  assert.equal(Array.isArray(context.fileEditorContract?.fileTree?.items), true);
  assert.equal(Array.isArray(context.fileEditorContract?.editor?.tabs), true);
  assert.equal(typeof context.commandConsoleView?.consoleId, "string");
  assert.equal(Array.isArray(context.commandConsoleView?.commands), true);
  assert.equal(Array.isArray(context.commandConsoleView?.logStreams?.stdout), true);
  assert.equal(typeof context.dailyWorkspaceSurface?.dailyWorkspaceSurfaceId, "string");
  assert.equal(typeof context.guidedTaskExecutionSurface?.guidedTaskExecutionSurfaceId, "string");
  assert.equal(typeof context.taskStepFlowProgress?.taskStepFlowProgressId, "string");
  assert.equal(typeof context.taskApprovalHandoffPanel?.taskApprovalHandoffPanelId, "string");
  assert.equal(typeof context.aiControlCenterSurface?.aiControlCenterSurfaceId, "string");
  assert.equal(typeof context.aiControlCenterSurface?.summary?.deliveryStatus, "string");
  assert.equal(typeof context.aiDesignRequest?.requestId, "string");
  assert.equal(typeof context.aiDesignProposal?.proposalId, "string");
  assert.equal(typeof context.aiDesignProviderResult?.providerResultId, "string");
  assert.equal(typeof context.aiDesignServiceResult?.serviceResultId, "string");
  assert.equal(typeof context.aiDesignExecutionState?.executionStateId, "string");
  assert.equal(typeof context.aiGenerationObservability?.observabilityId, "string");
  assert.equal(typeof context.aiGenerationObservability?.summary?.validationStatus, "string");
  assert.equal(typeof context.providerLatencyFailureTracker?.trackerId, "string");
  assert.equal(typeof context.providerLatencyFailureTracker?.summary?.latencyStatus, "string");
  assert.equal(typeof context.generationSuccessAcceptanceTracker?.trackerId, "string");
  assert.equal(typeof context.generationSuccessAcceptanceTracker?.summary?.acceptedProposalCount, "number");
  assert.equal(typeof context.promptContractFailureTracker?.trackerId, "string");
  assert.equal(typeof context.promptContractFailureTracker?.failureSummary?.blockingFailureCount, "number");
  assert.equal(typeof context.aiGenerationReviewDashboard?.dashboardId, "string");
  assert.equal(typeof context.aiGenerationReviewDashboard?.summary?.blockerCount, "number");
  assert.equal(typeof context.generatedSurfaceProofSchema?.proofId, "string");
  assert.equal(typeof context.generatedSurfaceProofSchema?.summary?.failedCheckCount, "number");
  assert.equal(typeof context.generatedSurfacePerformanceBudgetValidator?.performanceBudgetValidatorId, "string");
  assert.equal(typeof context.generatedSurfacePerformanceBudgetValidator?.summary?.budgetStatus, "string");
  assert.equal(typeof context.generatedBrandConsistencyValidator?.brandConsistencyValidatorId, "string");
  assert.equal(typeof context.generatedBrandConsistencyValidator?.summary?.brandStatus, "string");
  assert.equal(typeof context.renderableDesignProposal?.proposalId, "string");
  assert.equal(typeof context.designProposalValidation?.validationId, "string");
  assert.equal(typeof context.designProposalPreviewState?.previewStateId, "string");
  assert.equal(typeof context.screenProposalDiff?.diffId, "string");
  assert.equal(typeof context.designProposalReviewState?.reviewStateId, "string");
  assert.equal(typeof context.generatedAssetProvenanceRecord?.provenanceRecordId, "string");
  assert.equal(typeof context.approvedScreenDelta?.deltaId, "string");
  assert.equal(typeof context.proposalApplyDecision?.decisionId, "string");
  assert.equal(typeof context.acceptedScreenState?.acceptedScreenStateId, "string");
  assert.equal(typeof context.integratedDesignProposalState?.integratedStateId, "string");
  assert.equal(typeof context.previewScreenViewModel?.viewModelId, "string");
  assert.equal(typeof context.liveRuntimeScreenState?.stateId, "string");
  assert.equal(typeof context.settingsProfileSurface?.settingsProfileSurfaceId, "string");
  assert.equal(typeof context.liveLogStream?.streamId, "string");
  assert.equal(Array.isArray(context.liveLogStream?.streams?.stdout), true);
  assert.equal(typeof context.liveLogStream?.summary?.isRealtime, "boolean");
  assert.equal(typeof context.branchDiffActivityPanel?.panelId, "string");
  assert.equal(Array.isArray(context.branchDiffActivityPanel?.commits), true);
  assert.equal(Array.isArray(context.branchDiffActivityPanel?.pendingApprovals), true);
  assert.equal(typeof context.reviewThreadState?.threadStateId, "string");
  assert.equal(Array.isArray(context.reviewThreadState?.threads), true);
  assert.equal(typeof context.reviewThreadState?.summary?.hasContextualDiscussion, "boolean");
  assert.equal(typeof context.artifactBuildPanel?.panelId, "string");
  assert.equal(Array.isArray(context.artifactBuildPanel?.build?.artifacts), true);
  assert.equal(typeof context.artifactBuildPanel?.verification?.isValid, "boolean");
  assert.equal(typeof context.reactiveWorkspaceState?.refreshStateId, "string");
  assert.equal(typeof context.reactiveWorkspaceState?.refreshMode, "string");
  assert.equal(typeof context.reactiveWorkspaceState?.progressBar?.percent, "number");
  assert.equal(typeof context.developmentWorkspace?.workspaceId === "string" || context.developmentWorkspace?.workspaceId === null, true);
  assert.equal(Array.isArray(context.developmentWorkspace?.navigation?.primaryNavigation), true);
  assert.equal(typeof context.developmentWorkspace?.executionSurface?.status, "string");
  assert.equal(typeof context.projectBrainWorkspace?.workspaceId, "string");
  assert.equal(Array.isArray(context.projectBrainWorkspace?.blockers), true);
  assert.equal(typeof context.projectBrainWorkspace?.summary?.requiresApproval, "boolean");
  assert.equal(typeof context.releaseWorkspace?.workspaceId, "string");
  assert.equal(typeof context.releaseWorkspace?.validation?.status, "string");
  assert.equal(Array.isArray(context.releaseWorkspace?.timeline?.events), true);
  assert.equal(typeof context.growthWorkspace?.workspaceId, "string");
  assert.equal(Array.isArray(context.growthWorkspace?.campaigns?.tasks), true);
  assert.equal(Array.isArray(context.growthWorkspace?.analytics?.kpis), true);
  assert.equal(typeof context.workspaceNavigationModel?.projectId, "string");
  assert.equal(Array.isArray(context.workspaceNavigationModel?.availableWorkspaces), true);
  assert.equal(typeof context.workspaceNavigationModel?.summary?.totalWorkspaces, "number");
  assert.equal(context.returnTomorrowContinuity?.status, "ready");
  assert.equal(typeof context.returnTomorrowContinuity?.recommendedDestination, "string");
  assert.equal(typeof context.acceptanceScenario?.acceptanceScenarioId, "string");
  assert.equal(Array.isArray(context.acceptanceScenario?.scenarios), true);
  assert.equal(typeof context.acceptanceResult?.acceptanceResultId, "string");
  assert.equal(context.acceptanceResult?.scenarioKey, "workspace-continuity");
  assert.equal(typeof context.acceptanceResult?.summary?.passed, "boolean");
  assert.equal(typeof context.onboardingAcceptanceResult?.acceptanceResultId, "string");
  assert.equal(typeof context.executionAcceptanceResult?.acceptanceResultId, "string");
  assert.equal(typeof context.failureRecoveryAcceptanceResult?.acceptanceResultId, "string");
  assert.equal(typeof context.approvalExplanationAcceptanceResult?.acceptanceResultId, "string");
  assert.equal(typeof context.executionTopology?.topologyId, "string");
  assert.equal(Array.isArray(context.executionTopology?.topologies), true);
  assert.equal(typeof context.executionTopology?.summary?.includesBranch, "boolean");
  assert.equal(typeof context.cloudWorkspaceModel?.workspaceId, "string");
  assert.equal(typeof context.cloudWorkspaceModel?.surface?.topologyType, "string");
  assert.equal(typeof context.cloudWorkspaceModel?.summary?.isWritable, "boolean");
  assert.equal(typeof context.localDevelopmentBridge?.bridgeId, "string");
  assert.equal(typeof context.localDevelopmentBridge?.connection?.mode, "string");
  assert.equal(typeof context.localDevelopmentBridge?.guardrails?.isPrimaryWorkspace, "boolean");
  assert.equal(typeof context.remoteMacRunner?.runnerId, "string");
  assert.equal(typeof context.remoteMacRunner?.connection?.mode, "string");
  assert.equal(typeof context.remoteMacRunner?.capabilities?.supportsSigning, "boolean");
  assert.equal(typeof context.ideAgentExecutorContract?.ideAgentExecutorContractId, "string");
  assert.equal(typeof context.ideAgentExecutorContract?.summary?.canExecuteInIde, "boolean");
  assert.equal(typeof context.localCodingAgentAdapter?.localCodingAgentAdapterId, "string");
  assert.equal(typeof context.localCodingAgentAdapter?.summary?.canRunLocalCodingAgent, "boolean");
  assert.equal(typeof context.executionProviderCapabilitySync?.executionProviderCapabilitySyncId, "string");
  assert.equal(typeof context.executionProviderCapabilitySync?.summary?.isSynchronized, "boolean");
  assert.equal(typeof context.executionModeDecision?.decisionId, "string");
  assert.equal(typeof context.executionModeDecision?.selectedMode, "string");
  assert.equal(typeof context.executionModeDecision?.summary?.isControlled, "boolean");
  assert.equal(context.bootstrapPlan.domain, "casino");
  assert.equal(Array.isArray(context.bootstrapTasks), true);
  assert.equal(Array.isArray(context.bootstrapAssignments), true);
  assert.equal(context.bootstrapAssignments.length >= 1, true);
  assert.equal(Array.isArray(context.bootstrapExecutionRequests), true);
  assert.equal(context.bootstrapExecutionRequests.length >= 1, true);
  assert.equal(Array.isArray(context.bootstrapResolvedSurfaces), true);
  assert.equal(context.bootstrapResolvedSurfaces.length >= 1, true);
  assert.equal(Array.isArray(context.bootstrapPlannedCommands), true);
  assert.equal(context.bootstrapPlannedCommands.length >= 1, true);
  assert.equal(Array.isArray(context.bootstrapRawExecutionResults), true);
  assert.equal(context.bootstrapRawExecutionResults.length >= 1, true);
  assert.equal(typeof context.bootstrapRawExecutionResults[0]?.rawExecutionResult?.status, "string");
  assert.equal(Array.isArray(context.bootstrapArtifacts), true);
  assert.equal(typeof context.bootstrapExecutionMetadata?.totalRuns, "number");
  assert.equal(typeof context.bootstrapExecutionResult?.status, "string");
  assert.equal(typeof context.bootstrapValidation?.isValid, "boolean");
  assert.equal(Array.isArray(context.bootstrapValidation?.expectedArtifacts), true);
  assert.equal(typeof context.initialProjectStateValidation?.isValid, "boolean");
  assert.equal(Array.isArray(context.stateValidationIssues), true);
  assert.equal(Array.isArray(context.initialTasks), true);
  assert.equal(typeof context.taskSeedMetadata?.seedId, "string");
  assert.equal(typeof context.selectionReason?.code, "string");
  assert.equal(
    context.selectedTask === null || typeof context.selectedTask?.summary === "string",
    true,
  );
  assert.equal(typeof context.nextTaskPresentation?.presentationId, "string");
  assert.equal(typeof context.nextTaskPresentation?.summary?.requiresApproval, "boolean");
  assert.equal(typeof context.nextTaskApprovalPanel?.panelId, "string");
  assert.equal(typeof context.nextTaskApprovalPanel?.summary?.safeAlternativeCount, "number");
  assert.equal(typeof context.recommendationDisplay?.displayId, "string");
  assert.equal(typeof context.recommendationDisplay?.primaryCta?.intent, "string");
  assert.equal(typeof context.recommendationSummaryPanel?.panelId, "string");
  assert.equal(typeof context.recommendationSummaryPanel?.urgency, "string");
  assert.equal(typeof context.editableProposal?.proposalId, "string");
  assert.equal(Array.isArray(context.editableProposal?.sections), true);
  assert.equal(typeof context.editableProposal?.summary?.supportsPartialAcceptance, "boolean");
  assert.equal(typeof context.editedProposal?.revisionId, "string");
  assert.equal(Array.isArray(context.editedProposal?.annotations), true);
  assert.equal(typeof context.proposalEditHistory?.historyId, "string");
  assert.equal(typeof context.proposalEditHistory?.summary?.preservesHistory, "boolean");
  assert.equal(typeof context.approvalOutcome?.approvalOutcomeId, "string");
  assert.equal(typeof context.approvalOutcome?.status, "string");
  assert.equal(typeof context.partialAcceptanceDecision?.decisionId, "string");
  assert.equal(typeof context.partialAcceptanceDecision?.summary?.requiresRegeneration, "boolean");
  assert.equal(typeof context.remainingProposalScope?.scopeId, "string");
  assert.equal(typeof context.remainingProposalScope?.summary?.remainingSectionCount, "number");
  assert.equal(typeof context.cockpitRecommendationSurface?.surfaceId, "string");
  assert.equal(typeof context.cockpitRecommendationSurface?.approval?.requiresApproval, "boolean");
  assert.equal(typeof context.bootstrapStateUpdate?.bootstrap?.status, "string");
  assert.equal(typeof context.firstValueOutput?.outputId, "string");
  assert.equal(typeof context.firstValueOutput?.summary?.feelsReal, "boolean");
  assert.equal(Array.isArray(context.bootstrapExecutionGraph?.nodes), true);
  assert.equal(typeof context.executionProgressSchema?.status, "string");
  assert.equal(typeof context.executionProgressSchema?.progressPercent, "number");
  assert.equal(typeof context.normalizedProgressInputs?.hasRuntimeLogs, "boolean");
  assert.equal(Array.isArray(context.normalizedProgressInputs?.taskResults), true);
  assert.equal(typeof context.taskExecutionMetric?.taskExecutionMetricId, "string");
  assert.equal(Array.isArray(context.taskExecutionMetric?.entries), true);
  assert.deepEqual(Object.keys(context.taskExecutionCounters ?? {}), [
    "totalCompleted",
    "totalFailed",
    "totalRetried",
    "totalBlocked",
  ]);
  assert.deepEqual(Object.keys(context.taskThroughputSummary ?? {}), [
    "totalCompleted",
    "totalFailed",
    "totalRetried",
    "totalBlocked",
    "byProject",
    "byLane",
    "byAgent",
    "byDay",
  ]);
  assert.equal(typeof context.baselineEstimate?.baselineEstimateId, "string");
  assert.equal(Array.isArray(context.baselineEstimate?.entries), true);
  assert.equal(typeof context.timeSavedMetric?.timeSavedMetricId, "string");
  assert.equal(Array.isArray(context.timeSavedMetric?.entries), true);
  assert.equal(typeof context.timeSaved?.timeSavedId, "string");
  assert.equal(Array.isArray(context.timeSaved?.entries), true);
  assert.equal(typeof context.humanUserProductivity?.humanUserProductivityId, "string");
  assert.equal(typeof context.humanUserProductivity?.summary?.totalResolvedEntries, "number");
  assert.equal(typeof context.outcomeEvaluation?.outcomeEvaluationId, "string");
  assert.equal(typeof context.outcomeEvaluation?.status, "string");
  assert.equal(Array.isArray(context.outcomeEvaluation?.evidence), true);
  assert.equal(typeof context.actionSuccessScore?.actionSuccessScoreId, "string");
  assert.equal(typeof context.actionSuccessScore?.score, "number");
  assert.equal(typeof context.progressPhase, "string");
  assert.equal(typeof context.progressPercent, "number");
  assert.equal(typeof context.completionEstimate, "string");
  assert.equal(typeof context.progressState?.status, "string");
  assert.equal(typeof context.realityProgress?.realityProgressId, "string");
  assert.equal(Array.isArray(context.realityProgress?.signals), true);
  assert.equal(typeof context.firstValueSummary?.summaryId, "string");
  assert.equal(typeof context.firstValueSummary?.summary?.hasMomentum, "boolean");
  assert.equal(typeof context.realtimeEventStream?.streamId, "string");
  assert.equal(Array.isArray(context.realtimeEventStream?.events), true);
  assert.equal(typeof context.realtimeEventStream?.summary?.totalEvents, "number");
  assert.equal(typeof context.liveUpdateChannel?.channelId, "string");
  assert.equal(typeof context.liveUpdateChannel?.transportMode, "string");
  assert.equal(context.liveUpdateChannel?.serverTransport, context.liveUpdateChannel?.transportMode);
  assert.match(context.liveUpdateChannel?.deliveryEndpoint ?? "", /^\/api\/projects\/.+\/live-(events|state)$/);
  assert.equal(typeof context.liveUpdateChannel?.requiresManualRefresh, "boolean");
  assert.equal(Array.isArray(context.formattedLogs), true);
  assert.equal(Array.isArray(context.userFacingMessages), true);
  assert.equal(typeof context.platformTrace?.traceId, "string");
  assert.equal(Array.isArray(context.platformLogs), true);
  assert.equal(typeof context.incidentAlert?.status, "string");
  assert.equal(typeof context.incidentAlert?.incidentCount, "number");
  assert.equal(typeof context.auditLogRecord?.auditLogId, "string");
  assert.equal(typeof context.auditLogRecord?.category, "string");
  assert.equal(typeof context.projectAuditEvent?.projectAuditEventId, "string");
  assert.equal(typeof context.projectAuditEvent?.category, "string");
  assert.equal(context.projectAuditEvent?.actionType, "project.agent-governance.decision");
  assert.equal(typeof context.projectAuditEvent?.actor?.actorId, "string");
  assert.equal(typeof context.projectAuditRecord?.projectAuditRecordId, "string");
  assert.equal(typeof context.projectAuditRecord?.category, "string");
  assert.equal(Array.isArray(context.projectAuditRecord?.auditTrail), true);
  assert.equal(typeof context.ownerAuditView?.ownerAuditViewId, "string");
  assert.equal(Array.isArray(context.ownerAuditView?.entries), true);
  assert.equal(typeof context.systemActivityFeed?.systemActivityFeedId, "string");
  assert.equal(Array.isArray(context.systemActivityFeed?.entries), true);
  assert.equal(typeof context.criticalChangeHistory?.criticalChangeHistoryId, "string");
  assert.equal(Array.isArray(context.criticalChangeHistory?.entries), true);
  assert.equal(typeof context.actorActionTrace?.actorActionTraceId, "string");
  assert.equal(typeof context.actorActionTrace?.outcome?.status, "string");
  assert.equal(Array.isArray(context.actorActionTrace?.affectedArtifacts), true);
  assert.equal(typeof context.nexusPersistenceSchema?.schemaId, "string");
  assert.equal(typeof context.nexusPersistenceSchema?.summary?.totalEntities, "number");
  assert.equal(typeof context.migrationPlan?.migrationPlanId, "string");
  assert.equal(Array.isArray(context.migrationArtifacts?.files), true);
  assert.equal(Array.isArray(context.entityRepository), true);
  assert.equal(typeof context.entityRepository?.[0]?.repositoryId, "string");
  assert.equal(typeof context.storageRecord?.storageRecordId, "string");
  assert.equal(typeof context.storageRecord?.summary?.artifactCount, "number");
  assert.equal(typeof context.dataPrivacyClassification?.classificationId, "string");
  assert.equal(typeof context.dataPrivacyClassification?.exposureLevel, "string");
  assert.equal(typeof context.dataPrivacyClassification?.storageBinding?.retentionPolicy, "object");
  assert.equal(Array.isArray(context.dataPrivacyClassification?.reasoning), true);
  assert.equal(typeof context.privacyPolicyDecision?.privacyPolicyDecisionId, "string");
  assert.equal(typeof context.privacyPolicyDecision?.retentionAction, "string");
  assert.equal(typeof context.privacyPolicyDecision?.learningAllowed, "boolean");
  assert.equal(typeof context.backupStrategy?.backupStrategyId, "string");
  assert.equal(typeof context.backupStrategy?.summary?.totalDatasets, "number");
  assert.equal(typeof context.restorePlan?.restorePlanId, "string");
  assert.equal(Array.isArray(context.restorePlan?.restoreTargets?.datasets), true);
  assert.equal(typeof context.notificationPayload?.type, "string");
  assert.equal(typeof context.notificationEvent?.eventType, "string");
  assert.equal(typeof context.notificationEvent?.notificationEventId, "string");
  assert.equal(typeof context.notificationCenterState?.unreadCount, "number");
  assert.equal(Array.isArray(context.notificationCenterState?.inbox), true);
  assert.equal(typeof context.notificationPreferences?.frequency, "string");
  assert.equal(Array.isArray(context.notificationPreferences?.channels), true);
  assert.equal(typeof context.userPreferenceProfile?.profileId, "string");
  assert.equal(typeof context.userPreferenceProfile?.companionMode, "string");
  assert.equal(
    context.userPreferenceProfile?.summary?.notificationFrequency,
    context.notificationPreferences?.frequency,
  );
  assert.equal(typeof context.complianceConsentState?.complianceConsentStateId, "string");
  assert.equal(Array.isArray(context.complianceConsentState?.consentEntries), true);
  assert.equal(Array.isArray(context.complianceConsentState?.activeRestrictions), true);
  assert.equal(typeof context.emailDeliveryResult?.deliveryStatus, "string");
  assert.equal(context.emailDeliveryResult?.deliveryChannel, "email");
  assert.equal(typeof context.externalDeliveryResult?.deliveryStatus, "string");
  assert.equal(typeof context.externalDeliveryResult?.deliveryChannel, "string");
  assert.equal(typeof context.releasePlan?.releaseTarget, "string");
  assert.equal(Array.isArray(context.releaseSteps), true);
  assert.equal(Array.isArray(context.buildTargets), true);
  assert.equal(Array.isArray(context.buildArtifactManifest?.outputs), true);
  assert.equal(typeof context.artifactRecord?.buildTarget, "string");
  assert.equal(Array.isArray(context.artifactRecord?.outputPaths), true);
  assert.equal(typeof context.packagingRequirements?.releaseTarget, "string");
  assert.equal(Array.isArray(context.packagingRequirements?.requiredPackageArtifacts), true);
  assert.equal(typeof context.packageFormat, "string");
  assert.equal(Array.isArray(context.packagingManifest?.files), true);
  assert.equal(Array.isArray(context.packagingManifest?.assets), true);
  assert.equal(typeof context.packagedArtifact?.packageFormat, "string");
  assert.equal(Array.isArray(context.packagedArtifact?.files), true);
  assert.equal(typeof context.packagedArtifact?.metadata?.verificationStatus, "string");
  assert.equal(typeof context.storageRecord?.status, "string");
  assert.equal(typeof context.packageVerification?.isValid, "boolean");
  assert.equal(typeof context.testExecutionRequest?.buildTarget, "string");
  assert.equal(Array.isArray(context.testExecutionRequest?.testTypes), true);
  assert.equal(typeof context.testRunPlan?.riskLevel, "string");
  assert.equal(Array.isArray(context.testRunPlan?.selectedSuites), true);
  assert.equal(typeof context.rawTestResults?.status, "string");
  assert.equal(Array.isArray(context.rawTestResults?.suiteResults), true);
  assert.equal(typeof context.normalizedTestResults?.status, "string");
  assert.equal(typeof context.normalizedTestResults?.summary?.totalSuites, "number");
  assert.equal(typeof context.qualityGateDecision?.decision, "string");
  assert.equal(typeof context.qualityGateDecision?.isAllowed, "boolean");
  assert.equal(typeof context.nextVersion, "string");
  assert.equal(typeof context.releaseTag, "string");
  assert.equal(Array.isArray(context.releaseRequirementsSchema?.requiredArtifacts), true);
  assert.equal(typeof context.artifactValidation?.isReady, "boolean");
  assert.equal(typeof context.metadataValidation?.isReady, "boolean");
  assert.equal(typeof context.approvalValidation?.isReady, "boolean");
  assert.equal(Array.isArray(context.blockingIssues), true);
  assert.equal(typeof context.validationReport?.status, "string");
  assert.equal(typeof context.hostingAdapter?.provider, "string");
  assert.equal(Array.isArray(context.hostingAdapter?.capabilities), true);
  assert.equal(typeof context.deploymentRequest?.provider, "string");
  assert.equal(Array.isArray(context.deploymentRequest?.buildArtifacts), true);
  assert.equal(typeof context.providerAdapter?.provider, "string");
  assert.equal(Array.isArray(context.providerAdapter?.capabilities), true);
  assert.equal(typeof context.accountRecord?.accountId, "string");
  assert.equal(context.accountRecord?.accountType, "hosting");
  assert.equal(typeof context.providerSession?.providerType, "string");
  assert.equal(Array.isArray(context.providerSession?.capabilities), true);
  assert.equal(typeof context.providerContractSession?.providerType, "string");
  assert.equal(Array.isArray(context.providerContractSession?.capabilities), true);
  assert.equal(typeof context.authModeDefinition?.authMode, "string");
  assert.equal(Array.isArray(context.authModeDefinition?.supportedAuthModes), true);
  assert.equal(typeof context.credentialReference, "string");
  assert.equal(typeof context.encryptedCredential?.ciphertext, "string");
  assert.equal(typeof context.credentialVaultRecord?.credentialReference, "string");
  assert.equal(typeof context.providerConnectorSchema?.providerType, "string");
  assert.equal(Array.isArray(context.providerConnectorSchema?.authenticationModes), true);
  assert.equal(typeof context.providerCapabilities?.providerType, "string");
  assert.equal(Array.isArray(context.providerCapabilities?.capabilities), true);
  assert.equal(typeof context.externalCapabilityRegistry?.summary?.providerCount, "number");
  assert.equal(context.externalCapabilityRegistry?.providerEntries?.[0]?.authModes.includes("oauth"), true);
  assert.equal(typeof context.sourceControlIntegration?.status, "string");
  assert.equal(typeof context.secretResolutionState?.summary?.safeForConnectorUse, "boolean");
  assert.equal(typeof context.connectorCredentialBinding?.summary?.safeForRuntimeUse, "boolean");
  assert.equal(typeof context.inboundWebhookIngestion?.summary?.canIngestWebhook, "boolean");
  assert.equal(typeof context.executionActionRouting?.routeType, "string");
  assert.equal(typeof context.executionActionRouting?.summary?.isRoutable, "boolean");
  assert.equal(typeof context.actionToProviderMapping?.providerType, "string");
  assert.equal(typeof context.actionToProviderMapping?.summary?.isMapped, "boolean");
  assert.equal(typeof context.designToolImportAdapter?.status, "string");
  assert.equal(typeof context.designToolImportAdapter?.summary?.hasDesignInput, "boolean");
  assert.equal(Array.isArray(context.providerOperations), true);
  assert.equal(typeof context.providerOperations?.[0]?.operationType, "string");
  assert.equal(typeof context.providerConnector?.providerType, "string");
  assert.equal(Array.isArray(context.providerConnector?.operations), true);
  assert.equal(typeof context.providerDegradationState?.providerType, "string");
  assert.equal(typeof context.providerDegradationState?.health, "string");
  assert.equal(typeof context.providerDegradationState?.summary?.requiresCircuitBreaker, "boolean");
  assert.equal(typeof context.circuitBreakerDecision?.providerType, "string");
  assert.equal(typeof context.circuitBreakerDecision?.decision, "string");
  assert.equal(typeof context.circuitBreakerDecision?.summary?.failFast, "boolean");
  assert.equal(typeof context.providerRecoveryProbe?.providerType, "string");
  assert.equal(typeof context.providerRecoveryProbe?.status, "string");
  assert.equal(typeof context.providerRecoveryProbe?.summary?.canProbe, "boolean");
  assert.equal(typeof context.externalProviderHealthAndFailover?.lifecycleState, "string");
  assert.equal(typeof context.externalProviderHealthAndFailover?.summary?.canFailover, "boolean");
  assert.equal(typeof context.verificationResult?.isVerified, "boolean");
  assert.equal(typeof context.verificationResult?.status, "string");
  assert.equal(typeof context.ownershipPolicy?.ownerUserId, "string");
  assert.equal(Array.isArray(context.ownershipPolicy?.distributionTargets?.targets), true);
  assert.equal(typeof context.consentRecord?.consentId, "string");
  assert.equal(typeof context.consentRecord?.status, "string");
  assert.equal(typeof context.guardResult?.isAllowed, "boolean");
  assert.equal(typeof context.guardResult?.status, "string");
  assert.equal(typeof context.preparedArtifact?.packageFormat, "string");
  assert.equal(Array.isArray(context.preparedArtifact?.artifacts), true);
  assert.equal(typeof context.releaseStateUpdate?.release?.status, "string");
  assert.equal(Array.isArray(context.releaseExecutionGraph?.nodes), true);
  assert.equal(typeof context.releaseStatus?.status, "string");
  assert.equal(Array.isArray(context.releaseStatus?.terminalStates), true);
  assert.equal(typeof context.releaseRun?.releaseRunId, "string");
  assert.equal(typeof context.releaseTimeline?.currentStatus, "string");
  assert.equal(Array.isArray(context.releaseTimeline?.events), true);
  assert.equal(typeof context.failureSummary?.status, "string");
  assert.equal(typeof context.failureRecoveryModel?.failureClass, "string");
  assert.equal(Array.isArray(context.failureRecoveryModel?.fallbackOptions), true);
  assert.equal(typeof context.failureRecoveryModel?.summary?.canRetry, "boolean");
  assert.equal(typeof context.retryPolicy?.retryPolicyId, "string");
  assert.equal(typeof context.retryPolicy?.shouldRetry, "boolean");
  assert.equal(typeof context.retryPolicy?.summary?.requiresScheduler, "boolean");
  assert.equal(typeof context.fallbackStrategy?.fallbackStrategyId, "string");
  assert.equal(typeof context.fallbackStrategy?.primaryStrategy?.action, "string");
  assert.equal(typeof context.fallbackStrategy?.summary?.strategyCount, "number");
  assert.equal(typeof context.rollbackPlan?.rollbackPlanId, "string");
  assert.equal(typeof context.rollbackPlan?.rollbackMode, "string");
  assert.equal(typeof context.rollbackPlan?.summary?.totalTargets, "number");
  assert.equal(typeof context.recoveryDecision?.decisionType, "string");
  assert.equal(typeof context.recoveryDecision?.summary?.actionCount, "number");
  assert.equal(Array.isArray(context.recoveryActions), true);
  assert.equal(typeof context.recoveryOptionsPayload?.headline, "string");
  assert.equal(typeof context.recoveryOptionsPayload?.summary?.optionCount, "number");
  assert.equal(Array.isArray(context.followUpTasks), true);
  assert.equal(typeof context.testReportSummary?.status, "string");
  assert.equal(Array.isArray(context.testReportSummary?.remediationActions), true);
  assert.equal(typeof context.pollingRequest?.releaseTarget, "string");
  assert.equal(typeof context.resolvedPoller?.pollerId, "string");
  assert.equal(Array.isArray(context.statusEvents), true);
  assert.equal(typeof context.pollingDecision?.isTerminal, "boolean");
  assert.equal(typeof context.pollingMetadata?.attempt, "number");
  assert.equal(context.continuityPlan?.planningStatus, "ready");
  assert.equal(context.continuityPlan?.decisionTrace?.reliabilityInputStatus, "canonical");
  assert.equal(context.serviceReliabilityDashboard?.status, "ready");
  assert.equal(typeof context.serviceReliabilityDashboard?.uptimeTargetPercent, "number");
  assert.equal(typeof context.serviceReliabilityDashboard?.incidentStatus, "string");
});

test("context builder exposes normalized existing business assets for imported-project intake", () => {
  const context = buildProjectContext({
    id: "scanner-intake-app",
    goal: "להמשיך ממוצר קיים",
    projectIntake: {
      projectName: "Scanner Intake App",
      projectType: "saas",
      visionText: "אפליקציה עם login ו-growth funnel",
      requestedDeliverables: ["auth", "growth"],
      uploadedFiles: [
        {
          name: "README.md",
          type: "markdown",
          content: "# App",
        },
      {
        name: "docs/architecture.md",
        type: "markdown",
        content: "# Architecture",
      },
      {
        name: "ga-export.csv",
        type: "text/csv",
        content: "date,users\n2026-04-01,120\n",
      },
    ],
      externalLinks: [
        "https://github.com/example/scanner-intake-app",
        "https://scanner.example.com",
      ],
    },
    intakeScanHandoff: {
      scanRoot: "/tmp/scanner-intake-app",
      importedArtifacts: 2,
    },
    scan: {
      findings: {
        hasAuth: true,
      },
      gaps: ["missing analytics import"],
      stack: {
        frontend: ["React"],
        backend: ["Express"],
        database: ["Postgres"],
      },
      knowledge: {
        summary: "README + docs",
        readme: {
          path: "README.md",
        },
        docs: [
          {
            path: "docs/architecture.md",
          },
        ],
      },
    },
    gitSnapshot: {
      provider: "github",
      repo: {
        fullName: "example/scanner-intake-app",
        defaultBranch: "main",
      },
      branches: [{ name: "main" }],
      commits: [{ sha: "abc123" }],
      pullRequests: [{ id: 1 }],
    },
    state: {
      knowledge: {
        knownGaps: [],
      },
      stack: {
        frontend: "React",
        backend: "Express",
        database: "Postgres",
      },
      product: {
        hasAuth: true,
      },
    },
  });

  assert.equal(context.existingBusinessAssets.status, "ready");
  assert.equal(context.existingBusinessAssets.summary.totalAssets, 5);
  assert.equal(context.existingBusinessAssets.summary.repositoryAssetCount, 1);
  assert.equal(context.existingBusinessAssets.summary.fileAssetCount, 3);
  assert.equal(context.existingBusinessAssets.diagnosisSeed.hasAuth, true);
  assert.equal(context.existingBusinessAssets.importAndContinueSeed.nextCapabilities.includes("document-diagnosis"), true);
  assert.equal(context.repositoryImportAndCodebaseDiagnosis.status, "ready");
  assert.equal(context.repositoryImportAndCodebaseDiagnosis.repoStatus.branchCount, 1);
  assert.equal(context.repositoryImportAndCodebaseDiagnosis.summary.canDiagnoseRepository, true);
  assert.equal(context.liveWebsiteIngestionAndFunnelDiagnosis.status, "ready");
  assert.equal(context.liveWebsiteIngestionAndFunnelDiagnosis.website.hostname, "scanner.example.com");
  assert.equal(context.liveWebsiteIngestionAndFunnelDiagnosis.summary.canDiagnoseWebsite, true);
  assert.equal(context.importedAnalyticsNormalization.status, "ready");
  assert.equal(context.importedAnalyticsNormalization.summary.importedAssetCount, 1);
  assert.equal(context.importedAnalyticsNormalization.evidenceSources.providers.includes("google-analytics"), true);
  assert.equal(context.importedAssetTaskExtraction.status, "ready");
  assert.equal(context.importedAssetTaskExtraction.summary.totalExtractedTasks >= 5, true);
  assert.equal(context.importedAssetTaskExtraction.summary.sourceCoverage.includes("website"), true);
  assert.equal(context.sourceControlIntegration.status, "ready");
  assert.equal(context.sourceControlIntegration.repository.fullName, "example/scanner-intake-app");
  assert.equal(context.sourceControlIntegration.binding.providerType, "github");
  assert.equal(typeof context.secretResolutionState?.status, "string");
  assert.equal(typeof context.connectorCredentialBinding?.status, "string");
  assert.equal(typeof context.inboundWebhookIngestion?.status, "string");
  assert.equal(context.importAndContinueRoadmap.status, "ready");
  assert.equal(context.importAndContinueRoadmap.summary.roadmapItemCount >= 5, true);
  assert.equal(context.importAndContinueRoadmap.roadmapItems[1].dependencyIds.length > 0, true);
  assert.equal(context.canonicalBacklogRegeneration.status, "ready");
  assert.equal(context.canonicalBacklogRegeneration.proposedCanonicalTasks[0].execution_order, "104");
  assert.equal(context.canonicalBacklogRegeneration.proposedCanonicalTasks[0].dependencies.upstreamExecutionOrders[0], "103");
  assert.equal(context.canonicalBacklogRegeneration.proposedCanonicalTasks.length >= 5, true);
  assert.equal(
    context.existingBusinessAssets.assets.some((asset) => asset.path === "README.md" && asset.sourceStages.length === 2),
    true,
  );
});

test("context builder exposes task execution metric with dependency-blocked entries only", () => {
  const context = buildProjectContext({
    id: "giftwallet",
    events: [
      {
        id: "assign-3",
        type: "task.assigned",
        timestamp: "2026-01-01T00:00:00.000Z",
        payload: {
          projectId: "giftwallet",
          agentId: "qa-agent",
          task: {
            id: "task-2",
            taskType: "qa",
          },
        },
      },
    ],
    taskResults: [
      {
        id: "evt-1",
        type: "task.retried",
        projectId: "giftwallet",
        taskId: "task-2",
        taskType: "growth",
        agentId: "qa-agent",
        assignmentEventId: "assign-3",
        status: "retried",
        timestamp: "2026-01-01T00:02:30.000Z",
      },
    ],
    cycle: {
      roadmap: [
        { id: "task-2", lane: "qa" },
        { id: "task-3", lane: "release" },
      ],
      executionGraph: {
        nodes: [
          { id: "task-2", lane: "qa", status: "blocked", blockedBy: [] },
          { id: "task-3", lane: "release", status: "blocked", blockedBy: ["task-2"] },
        ],
      },
    },
  });

  assert.equal(context.taskExecutionMetric.taskExecutionMetricId, "task-execution-metric:giftwallet");
  assert.deepEqual(context.taskExecutionMetric.entries.map((entry) => entry.status), ["retried", "blocked"]);
  assert.deepEqual(
    context.taskExecutionMetric.entries.find((entry) => entry.status === "blocked")?.blockedBy,
    ["task-2"],
  );
  assert.deepEqual(context.taskExecutionCounters, {
    totalCompleted: 0,
    totalFailed: 0,
    totalRetried: 1,
    totalBlocked: 1,
  });
  assert.equal(Array.isArray(context.blockedTaskOutcomes), true);
  assert.equal(context.blockedTaskOutcomes[0]?.status, "blocked");
  assert.equal(context.outcomeFeedbackState?.status, "attention-required");
  assert.equal(context.goalProgressState?.goalHealth, "at-risk");
  assert.deepEqual(context.taskThroughputSummary, {
    totalCompleted: 0,
    totalFailed: 0,
    totalRetried: 1,
    totalBlocked: 1,
    byProject: {
      giftwallet: 2,
    },
    byLane: {
      qa: 1,
      release: 1,
    },
    byAgent: {
      "qa-agent": 1,
    },
    byDay: {
      "2026-01-01": 1,
    },
  });
  assert.equal(context.baselineEstimate.baselineEstimateId, "baseline-estimate:giftwallet");
  assert.equal(context.baselineEstimate.contextUsed, false);
  assert.deepEqual(context.baselineEstimate.entries, [
    {
      baselineEstimateEntryId: "baseline-estimate-entry:evt-1",
      taskId: "task-2",
      taskType: "growth",
      assignmentEventId: "assign-3",
      baselineEstimateMs: 1200000,
      estimationSource: "task-type-default",
      evidenceCount: 0,
    },
  ]);
  assert.equal(context.timeSavedMetric.timeSavedMetricId, "time-saved-metric:giftwallet");
  assert.deepEqual(context.timeSavedMetric.entries, [
    {
      timeSavedMetricEntryId: "time-saved-entry:evt-1",
      projectId: "giftwallet",
      taskId: "task-2",
      taskType: "growth",
      agentId: "qa-agent",
      assignmentEventId: "assign-3",
      status: "retried",
      executionDurationMs: 150000,
      baselineEstimateMs: 1200000,
      recordedAt: "2026-01-01T00:02:30.000Z",
    },
  ]);
  assert.equal(context.timeSaved.timeSavedId, "time-saved:giftwallet");
  assert.deepEqual(context.timeSaved.entries, [
    {
      timeSavedEntryId: "time-saved-result:time-saved-entry:evt-1",
      projectId: "giftwallet",
      taskId: "task-2",
      taskType: "growth",
      agentId: "qa-agent",
      assignmentEventId: "assign-3",
      status: "retried",
      executionDurationMs: 150000,
      baselineEstimateMs: 1200000,
      timeSavedMs: 1050000,
      recordedAt: "2026-01-01T00:02:30.000Z",
    },
  ]);
  assert.deepEqual(context.productivitySummary, {
    totalTimeSavedMs: 1050000,
    byProject: {
      giftwallet: 1050000,
    },
    byUser: {
      "anonymous-user": 1050000,
    },
    byDay: {
      "2026-01-01": 1050000,
    },
  });
  assert.deepEqual(context.outcomeEvaluation, {
    outcomeEvaluationId: "outcome-evaluation:giftwallet",
    projectId: "giftwallet",
    status: "mixed",
    latestOutcome: {
      eventId: "evt-1",
      taskId: "task-2",
      taskType: "growth",
      agentId: "qa-agent",
      assignmentEventId: "assign-3",
      status: "retried",
      timestamp: "2026-01-01T00:02:30.000Z",
    },
    summary: {
      totalTaskResults: 1,
      totalEvaluatedEntries: 2,
      totalCompleted: 0,
      totalFailed: 0,
      totalRetried: 1,
      totalBlocked: 1,
      totalTimeSavedMs: 1050000,
    },
    evidence: [
      {
        eventId: "evt-1",
        taskId: "task-2",
        taskType: "growth",
        status: "retried",
        timestamp: "2026-01-01T00:02:30.000Z",
      },
    ],
  });
  assert.deepEqual(context.actionSuccessScore, {
    actionSuccessScoreId: "action-success-score:giftwallet",
    projectId: "giftwallet",
    status: "mixed",
    score: 0.5,
    band: "medium",
    summary: {
      totalTaskResults: 1,
      totalCompleted: 0,
      totalFailed: 0,
      totalRetried: 1,
      totalBlocked: 1,
      totalTimeSavedMs: 1050000,
    },
    sourceOutcomeEvaluationId: "outcome-evaluation:giftwallet",
    latestOutcomeStatus: "retried",
  });
  assert.deepEqual(context.userActivityEvent, {
    userActivityEventId: context.userActivityEvent.userActivityEventId,
    userId: null,
    sessionId: null,
    activityType: "session-idle",
    projectId: "giftwallet",
    workspaceId: "workspace-anonymous",
    workspaceArea: "developer-workspace",
    currentSurface: "developer-workspace",
    currentTask: null,
    timestamp: context.userActivityEvent.timestamp,
  });
  assert.deepEqual(context.userActivityHistory, {
    userActivityHistoryId: "user-activity-history:giftwallet",
    status: "ready",
    totalEvents: 1,
    latestTimestamp: context.userActivityEvent.timestamp,
    entries: [
      {
        recordId: context.userActivityEvent.userActivityEventId,
        ...context.userActivityEvent,
      },
    ],
    byUser: {
      anonymous: {
        totalEvents: 1,
        sessionIds: [null],
        latestTimestamp: context.userActivityEvent.timestamp,
      },
    },
  });
  assert.deepEqual(context.userSessionMetric, {
    userId: null,
    sessionId: null,
    status: "idle",
    workspaceId: "workspace-anonymous",
    projectId: "giftwallet",
    workspaceArea: "developer-workspace",
    currentSurface: "developer-workspace",
    currentTask: null,
    lastSeenAt: context.userActivityEvent.timestamp,
    totalSessions: 0,
    isReturningUser: false,
    activeSessionCount: 0,
    activeUsers: [],
  });
  assert.deepEqual(context.userSessionHistory, {
    userSessionHistoryId: "user-session-history:giftwallet",
    status: "ready",
    totalEntries: 1,
    totalSessions: 1,
    totalReturningSignals: 0,
    latestTimestamp: context.userActivityEvent.timestamp,
    entries: [
      {
        recordId: `user-session:anonymous:no-session:${context.userActivityEvent.timestamp}`,
        userSessionMetricId: `user-session:anonymous:no-session:${context.userActivityEvent.timestamp}`,
        ...context.userSessionMetric,
        returningUserMetricId: `returning-user:anonymous:no-session:${context.userActivityEvent.timestamp}`,
        previousSessionId: null,
        previousLastSeenAt: null,
      },
    ],
    byUser: {
      anonymous: {
        totalSessions: 1,
        returningSessions: 0,
        latestTimestamp: context.userActivityEvent.timestamp,
        sessionIds: [null],
      },
    },
  });
  assert.deepEqual(context.returningUserMetric, {
    returningUserMetricId: `returning-user:anonymous:no-session:${context.userSessionMetric.lastSeenAt}`,
    userId: null,
    sessionId: null,
    previousSessionId: null,
    currentLastSeenAt: context.userSessionMetric.lastSeenAt,
    previousLastSeenAt: null,
    isReturningUser: false,
  });
  assert.deepEqual(context.retentionSummary, {
    retentionMetricsId: "retention-metrics:giftwallet",
    status: "ready",
    totalSessions: 1,
    totalReturningUsers: 0,
    totalNonReturningUsers: 1,
    repeatUsageCount: 0,
    retentionRate: 0,
    byDay: {
      [context.userSessionMetric.lastSeenAt.slice(0, 10)]: {
        totalReturningUsers: 0,
        totalNonReturningUsers: 1,
        repeatUsageCount: 0,
      },
    },
    byUser: {
      anonymous: {
        totalSessions: 1,
        returningSessions: 0,
        nonReturningSessions: 1,
        repeatUsageCount: 0,
        latestTimestamp: context.userSessionMetric.lastSeenAt,
      },
    },
    source: "user-session-history:giftwallet",
  });
  assert.deepEqual(context.retentionCurveAnalysis, {
    retentionCurveAnalysisId: "retention-curve:giftwallet",
    status: "ready",
    dayCurve: [
      {
        day: context.userSessionMetric.lastSeenAt.slice(0, 10),
        totalSessions: 1,
        returningUsers: 0,
        nonReturningUsers: 1,
        repeatUsageCount: 0,
        retentionRate: 0,
      },
    ],
    userCurves: [
      {
        userId: "anonymous",
        totalSessions: 1,
        returningSessions: 0,
        nonReturningSessions: 1,
        repeatUsageCount: 0,
        retentionRate: 0,
        latestTimestamp: context.userSessionMetric.lastSeenAt,
      },
    ],
    trend: "stable",
    summary: {
      totalCurvePoints: 1,
      totalUsersTracked: 1,
      bestDay: context.userSessionMetric.lastSeenAt.slice(0, 10),
      worstDay: context.userSessionMetric.lastSeenAt.slice(0, 10),
    },
  });
  assert.deepEqual(context.nexusPositioning, {
    nexusPositioningId: "nexus-positioning-early-users-focused-digital-product",
    status: "missing-inputs",
    missingInputs: ["competitiveContext"],
    audience: "early users",
    problem: "Focused digital product",
    promise: "Focused digital product",
    differentiation: [],
    proofPoints: [],
    competitiveContext: null,
  });
  assert.deepEqual(context.messagingFramework, {
    messagingFrameworkId: "messaging-framework:nexus-positioning-early-users-focused-digital-product",
    status: "missing-inputs",
    missingInputs: ["nexusPositioning"],
    audience: "early users",
    headline: "Focused digital product",
    subheadline: "Focused digital product",
    valueProps: [],
    objections: [],
    ctaAngles: [],
  });
  assert.equal(context.messagingVariants?.status, "missing-inputs");
  assert.deepEqual(context.messagingVariants?.missingInputs, ["messagingFramework"]);
  assert.equal(context.messagingVariants?.segments.length, 1);
  assert.deepEqual(context.messagingVariants?.variants, []);
  assert.equal(context.objectionMap?.status, "missing-inputs");
  assert.equal(context.faqMap?.status, "missing-inputs");
  assert.equal(context.activationGoals?.status, "missing-inputs");
  assert.deepEqual(context.activationGoals?.missingInputs, ["nexusPositioning"]);
  assert.equal(context.productCtaStrategy?.status, "missing-inputs");
  assert.deepEqual(context.productCtaStrategy?.missingInputs, ["messagingFramework", "activationGoals"]);
  assert.equal(context.nexusWebsiteSchema?.status, "missing-inputs");
  assert.deepEqual(context.nexusWebsiteSchema?.missingInputs, ["messagingFramework", "productCtaStrategy"]);
  assert.equal(context.landingPageIa?.status, "missing-inputs");
  assert.deepEqual(context.landingPageIa?.missingInputs, ["nexusWebsiteSchema", "messagingFramework"]);
  assert.equal(context.websiteCopyPack?.status, "missing-inputs");
  assert.deepEqual(context.websiteCopyPack?.missingInputs, [
    "nexusWebsiteSchema",
    "landingPageIa",
    "messagingFramework",
    "objectionMap",
    "faqMap",
    "productCtaStrategy",
  ]);
  assert.equal(context.websiteConversionFlow?.status, "missing-inputs");
  assert.deepEqual(context.websiteConversionFlow?.missingInputs, ["productCtaStrategy"]);
  assert.equal(context.waitlistRecord?.status, "missing-inputs");
  assert.deepEqual(context.waitlistRecord?.missingInputs, ["websiteConversionFlow"]);
  assert.equal(context.accessRequest?.status, "missing-inputs");
  assert.deepEqual(context.accessRequest?.missingInputs, ["websiteConversionFlow"]);
  assert.equal(context.websiteExperimentPlan?.status, "missing-inputs");
  assert.deepEqual(context.websiteExperimentPlan?.missingInputs, [
    "websiteCopyPack",
    "productCtaStrategy",
  ]);
  assert.equal(context.trustProofBlocks?.status, "missing-inputs");
  assert.deepEqual(context.trustProofBlocks?.missingInputs, ["messagingFramework", "objectionMap"]);
});

test("context builder learns baseline estimates from prior execution history before calculating time saved", () => {
  const context = buildProjectContext({
    id: "giftwallet",
    events: [
      {
        id: "assign-1",
        type: "task.assigned",
        timestamp: "2026-01-01T00:00:00.000Z",
        payload: {
          projectId: "giftwallet",
          agentId: "dev-agent",
          task: { id: "task-1", taskType: "backend" },
        },
      },
      {
        id: "assign-2",
        type: "task.assigned",
        timestamp: "2026-01-01T00:20:00.000Z",
        payload: {
          projectId: "giftwallet",
          agentId: "dev-agent",
          task: { id: "task-2", taskType: "backend" },
        },
      },
      {
        id: "assign-3",
        type: "task.assigned",
        timestamp: "2026-01-01T01:00:00.000Z",
        payload: {
          projectId: "giftwallet",
          agentId: "dev-agent",
          task: { id: "task-3", taskType: "backend" },
        },
      },
    ],
    taskResults: [
      {
        id: "evt-1",
        projectId: "giftwallet",
        taskId: "task-1",
        taskType: "backend",
        agentId: "dev-agent",
        assignmentEventId: "assign-1",
        status: "completed",
        timestamp: "2026-01-01T00:10:00.000Z",
      },
      {
        id: "evt-2",
        projectId: "giftwallet",
        taskId: "task-2",
        taskType: "backend",
        agentId: "dev-agent",
        assignmentEventId: "assign-2",
        status: "completed",
        timestamp: "2026-01-01T00:40:00.000Z",
      },
      {
        id: "evt-3",
        projectId: "giftwallet",
        taskId: "task-3",
        taskType: "backend",
        agentId: "dev-agent",
        assignmentEventId: "assign-3",
        status: "completed",
        timestamp: "2026-01-01T01:20:00.000Z",
      },
    ],
    cycle: {
      roadmap: [
        { id: "task-1", lane: "backend" },
        { id: "task-2", lane: "backend" },
        { id: "task-3", lane: "backend" },
      ],
      executionGraph: {
        nodes: [
          { id: "task-1", lane: "backend", status: "completed", blockedBy: [] },
          { id: "task-2", lane: "backend", status: "completed", blockedBy: [] },
          { id: "task-3", lane: "backend", status: "completed", blockedBy: [] },
        ],
      },
    },
  });

  assert.equal(context.baselineEstimate.contextUsed, true);
  assert.deepEqual(context.baselineEstimate.entries.map((entry) => ({
    taskId: entry.taskId,
    baselineEstimateMs: entry.baselineEstimateMs,
    estimationSource: entry.estimationSource,
    evidenceCount: entry.evidenceCount,
  })), [
    {
      taskId: "task-1",
      baselineEstimateMs: 1800000,
      estimationSource: "task-type-default",
      evidenceCount: 0,
    },
    {
      taskId: "task-2",
      baselineEstimateMs: 600000,
      estimationSource: "execution-history",
      evidenceCount: 1,
    },
    {
      taskId: "task-3",
      baselineEstimateMs: 900000,
      estimationSource: "execution-history",
      evidenceCount: 2,
    },
  ]);
  assert.deepEqual(context.baselineEstimate.learnedTaskTypes, {
    backend: {
      sampleSize: 3,
      learnedBaselineMs: 1000000,
    },
  });
  assert.deepEqual(context.timeSavedMetric.entries.map((entry) => ({
    taskId: entry.taskId,
    baselineEstimateMs: entry.baselineEstimateMs,
    executionDurationMs: entry.executionDurationMs,
  })), [
    {
      taskId: "task-1",
      baselineEstimateMs: 1800000,
      executionDurationMs: 600000,
    },
    {
      taskId: "task-2",
      baselineEstimateMs: 600000,
      executionDurationMs: 1200000,
    },
    {
      taskId: "task-3",
      baselineEstimateMs: 900000,
      executionDurationMs: 1200000,
    },
  ]);
  assert.deepEqual(context.userAgentMapping.byAgent["dev-agent"], {
    humanUserId: "anonymous-user",
    ownerUserId: "anonymous-user",
    workspaceId: "workspace-anonymous-user",
    projectId: "giftwallet",
    relationship: "delegated-agent",
    mappingStatus: "owned",
  });
  assert.deepEqual(context.humanUserProductivity.byHumanUser, {
    "anonymous-user": 1200000,
  });
  assert.deepEqual(context.humanUserProductivity.agentBreakdown["anonymous-user"], {
    "dev-agent": 1200000,
  });
});

test("context builder exposes ready nexus positioning when manual competitive context exists", () => {
  const context = buildProjectContext({
    id: "nexus-site",
    name: "Nexus Site",
    goal: "Launch the Nexus website",
    projectIntake: {
      projectName: "Nexus",
      visionText: "Launch the Nexus website",
      problem: "Teams lose momentum between planning and execution",
      promise: "Nexus executes scoped work with governed multi-agent flows",
      proofPoints: ["governed approvals", "shared project context"],
    },
    manualContext: {
      businessContext: {
        targetAudience: "product operators",
      },
      visitorContext: {
        persona: "product operators",
        channelIntent: "evaluation",
      },
      attributionMetadata: {
        source: "community",
      },
      competitiveContext: {
        competitors: ["Linear", "Notion"],
        alternatives: ["manual PM workflow"],
        differentiation: ["execution-native system", "state-first orchestration"],
        strengths: ["faster shipping", "clear governance"],
        weaknesses: ["new workflow adoption"],
      },
    },
    state: {},
  });

  assert.deepEqual(context.nexusPositioning, {
    nexusPositioningId: "nexus-positioning-product-operators-launch-the-nexus-website",
    status: "ready",
    missingInputs: [],
    audience: "product operators",
    problem: "Teams lose momentum between planning and execution",
    promise: "Nexus executes scoped work with governed multi-agent flows",
    differentiation: ["execution-native system", "state-first orchestration"],
    proofPoints: ["governed approvals", "shared project context"],
    competitiveContext: {
      competitors: ["Linear", "Notion"],
      alternatives: ["manual PM workflow"],
      differentiation: ["execution-native system", "state-first orchestration"],
      strengths: ["faster shipping", "clear governance"],
      weaknesses: ["new workflow adoption"],
    },
  });
  assert.equal(context.messagingFramework?.status, "ready");
  assert.equal(context.messagingFramework?.headline, "Nexus executes scoped work with governed multi-agent flows");
  assert.deepEqual(
    context.messagingFramework?.valueProps.map((entry) => entry.label),
    [
      "execution-native system",
      "state-first orchestration",
      "governed approvals",
      "shared project context",
    ],
  );
  assert.equal(context.messagingVariants?.status, "ready");
  assert.equal(context.landingVariantDecision?.status, "ready");
  assert.equal(context.landingVariantDecision?.segmentType, "operators");
  assert.deepEqual(
    context.messagingVariants?.segments.map((entry) => entry.segmentType),
    ["operators"],
  );
  assert.equal(
    context.messagingVariants?.variants[0]?.headline,
    "Nexus executes scoped work with governed multi-agent flows for product operators",
  );
  assert.equal(context.objectionMap?.status, "ready");
  assert.equal(context.faqMap?.status, "ready");
  assert.equal(context.objectionMap?.entries.length >= 2, true);
  assert.equal(context.faqMap?.entries.length >= 3, true);
  assert.equal(context.activationGoals?.status, "ready");
  assert.deepEqual(
    context.activationGoals?.goals.map((entry) => entry.goalType),
    ["request-access", "complete-onboarding", "start-first-project", "reach-first-value"],
  );
  assert.equal(context.productCtaStrategy?.status, "ready");
  assert.equal(context.productCtaStrategy?.primaryCta?.label, "Request access");
  assert.equal(Array.isArray(context.productCtaStrategy?.secondaryCtas), true);
  assert.equal(context.nexusWebsiteSchema?.status, "ready");
  assert.equal(context.nexusWebsiteSchema?.pages.length, 5);
  assert.equal(context.landingPageIa?.status, "ready");
  assert.equal(context.landingPageIa?.sections.length, 5);
  assert.equal(context.websiteCopyPack?.status, "ready");
  assert.equal(context.websiteCopyPack?.pageCopy.length, 5);
  assert.equal(context.websiteCopyPack?.primaryCta?.label, "Request access");
  assert.equal(context.websiteConversionFlow?.status, "ready");
  assert.equal(context.websiteConversionFlow?.entryRoute, "signup");
  assert.equal(context.waitlistRecord?.status, "captured");
  assert.equal(context.accessRequest?.status, "submitted");
  assert.equal(context.websiteExperimentPlan?.status, "ready");
  assert.equal(context.trustProofBlocks?.status, "ready");
  assert.equal(context.productDeliveryModel?.status, "ready");
  assert.equal(context.productDeliveryModel?.deliverySurface, "web-first");
  assert.equal(context.siteAppBoundary?.status, "ready");
  assert.equal(context.siteAppBoundary?.trustBoundary, "marketing-site-to-authenticated-app");
  assert.equal(context.accessModeDecision?.status, "ready");
  assert.equal(context.accessModeDecision?.mode, "waitlist");
  assert.equal(context.landingAuthHandoff?.status, "ready");
  assert.equal(context.landingAuthHandoff?.destinationRoute, "/waitlist");
  assert.equal(context.appEntryDecision?.status, "ready");
  assert.equal(context.appEntryDecision?.decision, "waitlist-state");
  assert.equal(context.postLoginDestination?.status, "ready");
  assert.equal(context.postLoginDestination?.destination, "waitlist-status");
  assert.equal(context.appLandingEntry?.status, "ready");
  assert.equal(context.entryStateVariants?.status, "ready");
  assert.equal(context.entryRecoveryState?.status, "ready");
  assert.equal(context.entryOrientationPanel?.status, "ready");
  assert.equal(context.entryDecisionSupport?.status, "ready");
  assert.equal(context.firstProjectKickoff?.status, "not-required");
  assert.equal(context.landingToDashboardFlow?.status, "ready");
  assert.equal(context.activationFunnel?.status, "ready");
  assert.equal(context.activationMilestones?.status, "ready");
  assert.equal(context.onboardingMarketingFlow?.status, "ready");
  assert.equal(context.activationDropOffs?.status, "ready");
  assert.equal(context.reEngagementPlan?.status, "ready");
  assert.equal(typeof context.dashboardHomeSurface?.dashboardHomeSurfaceId, "string");
  assert.equal(typeof context.unifiedHomeDashboard?.unifiedHomeDashboardId, "string");
  assert.equal(typeof context.todayPrioritiesFeed?.todayPrioritiesFeedId, "string");
  assert.equal(typeof context.ownerVisibilityStrip?.ownerVisibilityStripId, "string");
  assert.equal(context.nexusContentStrategy?.status, "ready");
  assert.equal(context.launchContentCalendar?.status, "ready");
  assert.equal(context.storyAssets?.status, "ready");
  assert.equal(context.socialCommunityPack?.status, "ready");
  assert.equal(context.productProofPlan?.status, "ready");
  assert.equal(context.launchCampaignBrief?.status, "ready");
  assert.equal(context.launchRolloutPlan?.status, "ready");
  assert.equal(context.launchReadinessChecklist?.status, "ready");
  assert.equal(context.launchPublishingPlan?.status, "ready");
  assert.equal(context.launchFeedbackSummary?.status, "ready");
  assert.equal(context.goToMarketPlan?.status, "ready");
  assert.equal(context.promotionExecutionPlan?.status, "ready");
  assert.equal(context.launchMarketingExecution?.status, "ready");
  assert.equal(context.gtmMetricSchema?.status, "ready");
  assert.equal(context.acquisitionSourceMetrics?.status, "ready");
  assert.equal(context.firstTouchAttribution?.status, "ready");
  assert.equal(context.preAuthConversionEvents?.status, "ready");
  assert.equal(context.landingVariantDecision?.acquisitionSource, "community");
  assert.equal(context.websiteActivationFunnel?.status, "ready");
  assert.equal(context.conversionAnalytics?.status, "ready");
  assert.equal(context.launchPerformanceDashboard?.status, "ready");
  assert.equal(context.gtmOptimizationPlan?.status, "ready");
  assert.equal(context.growthLoopManagement?.status, "ready");
  assert.equal(context.serviceReliabilityDashboard?.status, "ready");
  assert.equal(typeof context.postExecutionEvaluation?.status, "string");
  assert.equal(typeof context.postExecutionReport?.status, "string");
  assert.equal(typeof context.crossLayerFeedbackState?.status, "string");
  assert.equal(typeof context.adaptiveExecutionDecision?.loopMode, "string");
  assert.equal(typeof context.systemOptimizationPlan?.status, "string");
  assert.equal(typeof context.canonicalBacklogRegeneration?.status, "string");
  assert.equal(context.ownerControlPlane?.status, "ready");
  assert.equal(context.ownerControlCenter?.status, "ready");
  assert.equal(context.dailyOwnerOverview?.status, "ready");
  assert.equal(context.ownerPriorityQueue?.status, "ready");
  assert.equal(context.ownerActionRecommendations?.status, "ready");
  assert.equal(context.ownerDecisionDashboard?.status, "ready");
  assert.equal(context.ownerDailyWorkflow?.status, "ready");
  assert.equal(context.ownerFocusArea?.status, "ready");
  assert.equal(context.ownerTaskList?.status, "ready");
  assert.equal(context.ownerRoutinePlan?.status, "ready");
  assert.equal(context.ownerRevenueView?.status, "ready");
  assert.equal(context.ownerCostView?.status, "ready");
  assert.equal(context.profitMarginSummary?.status, "ready");
  assert.equal(context.unitEconomicsDashboard?.status, "ready");
  assert.equal(context.cashFlowProjection?.status, "ready");
  assert.equal(context.ownerUserAnalytics?.status, "ready");
  assert.equal(context.featureUsageSummary?.status, "ready");
  assert.equal(context.decisionAccuracySummary?.status, "ready");
  assert.equal(context.automationImpactSummary?.status, "ready");
  assert.equal(context.roadmapTracking?.status, "ready");
  assert.equal(context.ownerOperationsSignals?.status, "ready");
  assert.equal(context.prioritizedOwnerAlerts?.status, "ready");
  assert.equal(context.ownerAlertFeed?.status, "ready");
  assert.equal(context.ownerIncident?.status, "ready");
  assert.equal(context.outageResponsePlan?.status, "ready");
  assert.equal(context.incidentTimeline?.status, "ready");
  assert.equal(context.rootCauseSummary?.status, "ready");
  assert.equal(context.liveProjectMonitoring?.status, "ready");
  assert.equal(typeof context.maintenanceBacklog?.status, "string");
  assert.equal(Array.isArray(context.maintenanceBacklog?.items), true);
  assert.equal(typeof context.ownerControlCenter?.maintenanceStatus, "string");
  assert.equal(typeof context.ownerControlCenter?.maintenanceTaskCount, "number");
  assert.equal(typeof context.dailyOwnerOverview?.maintenanceTaskCount, "number");
});

test("context builder records security audit record without replacing system audit", () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-security-context-"));
  const observabilityTransport = createPlatformObservabilityTransport();
  const securityAuditLogStore = createSecurityAuditLogStore({
    filePath: path.join(rootDir, "security-audit.ndjson"),
  });

  const context = buildProjectContext({
    id: "giftwallet",
    name: "GiftWallet",
    goal: "Protect auth",
    state: {},
    manualContext: {
      securityEvent: {
        eventType: "policy_violation",
        summary: "Unauthorized policy bypass",
        affectedResource: {
          resourceId: "policy-layer",
          resourceType: "policy",
        },
      },
      requestContext: {
        ipAddress: "127.0.0.1",
        deviceId: "device-1",
      },
    },
  }, {
    observabilityTransport,
    securityAuditLogStore,
  });

  assert.equal(typeof context.auditLogRecord?.auditLogId, "string");
  assert.equal(typeof context.securityAuditRecord?.securityAuditId, "string");
  assert.equal(context.securityAuditRecord.eventType, "policy_violation");
  assert.equal(securityAuditLogStore.readAll().length, 1);
  assert.equal(
    observabilityTransport.getSnapshot().platformLogs.some((entry) =>
      entry.source === "security-audit-log" && entry.level === "error"
    ),
    true,
  );
});

test("context builder derives data privacy classification from storage, tenant, learning, and credential signals", () => {
  const context = buildProjectContext({
    id: "giftwallet",
    name: "GiftWallet",
    goal: "Protect customer data",
    state: {},
    manualContext: {
      attachments: [
        {
          id: "attachment-1",
          name: "customer-export.csv",
          type: "text/csv",
        },
      ],
      userProfile: {
        email: "owner@giftwallet.app",
        displayName: "Owner",
      },
      providerBoundaryBreach: true,
    },
  });

  assert.equal(typeof context.dataPrivacyClassification?.classificationId, "string");
  assert.equal(context.dataPrivacyClassification.exposureLevel, "secret");
  assert.equal(context.dataPrivacyClassification.personalData, "sensitive-personal");
  assert.equal(context.dataPrivacyClassification.learningSafety, "prohibited");
  assert.equal(context.dataPrivacyClassification.storageBinding.retentionPolicy.policyId, "project-lifecycle");
  assert.equal(context.privacyPolicyDecision.retentionAction, "delete-required");
  assert.equal(context.privacyPolicyDecision.backupAllowed, false);
});

test("context builder derives storage cost metric from attachment volume and retention window", () => {
  const context = buildProjectContext({
    id: "giftwallet",
    name: "GiftWallet",
    goal: "Track artifact storage",
    state: {},
    manualContext: {
      attachments: [
        {
          id: "attachment-1",
          name: "bundle.zip",
          type: "application/zip",
          size: 1024 ** 3,
        },
      ],
    },
  });

  assert.equal(typeof context.storageCostMetric?.storageCostMetricId, "string");
  assert.equal(context.storageCostMetric.usageType, "storage");
  assert.equal(context.storageCostMetric.unit, "gb-month");
  assert.equal(context.storageCostMetric.attachmentVolumeGb, 1);
  assert.equal(typeof context.storageCostMetric.lifecycleWindowDays, "number");
});

test("context builder derives compliance consent state with baseline scopes and restrictions", () => {
  const context = buildProjectContext({
    id: "giftwallet",
    name: "GiftWallet",
    goal: "Stay compliant",
    state: {},
    manualContext: {
      consentEntries: [
        {
          processingScope: "learning",
          scopeType: "workspace",
          scopeId: "workspace-user-1",
          status: "granted",
          legalBasis: "legitimate-interest",
        },
      ],
    },
  });

  assert.equal(typeof context.complianceConsentState?.complianceConsentStateId, "string");
  assert.equal(context.complianceConsentState.processingScopes.includes("data-usage"), true);
  assert.equal(context.complianceConsentState.processingScopes.includes("learning"), true);
  assert.equal(context.complianceConsentState.processingScopes.includes("notifications"), true);
  assert.equal(
    context.complianceConsentState.activeRestrictions.some((entry) => entry.processingScope === "learning" && entry.restrictionType === "learning-restricted"),
    true,
  );
  assert.equal(typeof context.complianceAuditSummary?.complianceAuditSummaryId, "string");
  assert.equal(typeof context.complianceAuditSummary?.summaryStatus, "string");
  assert.equal(Array.isArray(context.complianceAuditSummary?.auditReferences), true);
});

test("context builder carries privacy rights execution result into canonical context", () => {
  const context = buildProjectContext({
    id: "giftwallet",
    name: "GiftWallet",
    goal: "Honor privacy requests",
    state: {},
    context: {
      privacyRightsResult: {
        privacyRequestId: "privacy-request:giftwallet:export:user-1",
        status: "completed",
        executedActions: [],
        affectedScopes: [],
        summary: "Export completed.",
      },
    },
  });

  assert.equal(typeof context.privacyRightsResult?.privacyRequestId, "string");
  assert.equal(context.privacyRightsResult.status, "completed");
});

test("context builder uses canonical task results from project state when top-level task results are absent", () => {
  const context = buildProjectContext({
    id: "giftwallet",
    goal: "Ship close-core-loop",
    taskResults: null,
    state: {
      observed: {
        lastObservedAt: "2026-01-01T00:05:00.000Z",
      },
      taskResults: [
        {
          id: "evt-1",
          type: "task.completed",
          projectId: "giftwallet",
          taskId: "task-1",
          taskType: "backend",
          agentId: "dev-agent",
          assignmentEventId: "assign-1",
          status: "completed",
          output: {
            filesChanged: 2,
          },
          reason: null,
          timestamp: "2026-01-01T00:04:00.000Z",
        },
      ],
    },
    events: [],
    cycle: {
      roadmap: [{ id: "task-1", lane: "build" }],
      executionGraph: {
        nodes: [{ id: "task-1", lane: "build", status: "done", blockedBy: [] }],
      },
    },
  });

  assert.equal(context.baselineEstimate?.entries?.length, 1);
  assert.equal(context.baselineEstimate?.entries?.[0]?.taskType, "backend");
  assert.equal(context.taskExecutionMetric?.entries?.[0]?.status, "completed");
});
