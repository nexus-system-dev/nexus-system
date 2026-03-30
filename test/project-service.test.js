import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ProjectService } from "../src/core/project-service.js";

function createProjectService() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-service-"));
  return new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
}

test("project service seeds and serializes the demo cockpit state", () => {
  const service = createProjectService();
  service.seedDemoProject();

  const project = service.getProject("giftwallet");

  assert.equal(project.name, "GiftWallet");
  assert.equal(project.cycle.roadmap.length >= 2, true);
  assert.equal(project.cycle.roadmap.some((task) => task.id === "saas-billing"), true);
  assert.equal(project.cycle.roadmap.some((task) => task.id === "saas-acquisition"), true);
  assert.equal(project.cycle.assignments.length >= 1, true);
  assert.equal(project.events.length >= 4, true);
  assert.equal(project.scan.exists, true);
  assert.equal(project.context.domain, "saas");
  assert.equal(project.state.domainProfile.domain, "saas");
  assert.equal(project.state.domainProfile.bootstrapRules.includes("initialize-auth-core"), true);
  assert.equal(project.state.domainClassification.domain, "saas");
  assert.equal(project.state.domainClassification.domainCandidates.includes("saas"), true);
  assert.equal(project.state.domainCapabilities.taskTypes.includes("growth"), true);
  assert.equal(project.state.requiredContextFields.includes("billing"), true);
  assert.equal(project.state.executionModes.includes("temp-branch"), true);
  assert.equal(project.state.recommendedDefaults.provisional, true);
  assert.equal(project.state.recommendedDefaults.stack.frontend, "nextjs");
  assert.equal(Array.isArray(project.state.defaultsTrace), true);
  assert.equal(project.state.stackRecommendation.frontend, "nextjs");
  assert.equal(project.state.stackRecommendation.backend, "node");
  assert.equal(project.state.businessContext.targetAudience, "product teams");
  assert.equal(project.state.businessContext.gtmStage, "build");
  assert.equal(Array.isArray(project.state.businessContext.kpis), true);
  assert.equal(typeof project.state.projectIdentity?.identityId, "string");
  assert.equal(typeof project.state.projectDraft?.id, "string");
  assert.equal(typeof project.state.projectDraft?.owner?.displayName, "string");
  assert.equal(typeof project.state.projectDraft?.onboardingReadiness?.canStartOnboarding, "boolean");
  assert.equal(typeof project.state.projectIdentity?.name, "string");
  assert.equal(typeof project.state.projectIdentity?.audience, "string");
  assert.equal(typeof project.state.projectIdentityProfile?.profileId, "string");
  assert.equal(typeof project.state.projectIdentityProfile?.summary?.canShowIdentityCard, "boolean");
  assert.equal(typeof project.state.identityCompleteness?.score, "number");
  assert.equal(typeof project.state.instantValuePlan?.planId, "string");
  assert.equal(typeof project.state.instantValuePlan?.outputType, "string");
  assert.equal(typeof project.state.decisionIntelligence.summary.requiresApproval, "boolean");
  assert.equal(Array.isArray(project.state.decisionIntelligence.decisionTypes), true);
  assert.equal(typeof project.state.approvalRequest?.approvalRequestId, "string");
  assert.equal(typeof project.state.approvalRequest?.status, "string");
  assert.equal(typeof project.state.approvalRule?.id, "string");
  assert.equal(typeof project.state.approvalRule?.approvalClass, "string");
  assert.equal(typeof project.state.approvalTrigger?.requiresApproval, "boolean");
  assert.equal(typeof project.state.approvalTrigger?.approvalType, "string");
  assert.equal(Array.isArray(project.state.approvalRecords), true);
  assert.equal(typeof project.state.approvalRecord?.approvalRecordId, "string");
  assert.equal(typeof project.state.approvalRecord?.status, "string");
  assert.equal(Array.isArray(project.state.approvalRecord?.auditTrail), true);
  assert.equal(typeof project.state.approvalStatus?.status, "string");
  assert.equal(typeof project.state.approvalStatus?.isApproved, "boolean");
  assert.equal(typeof project.state.gatingDecision?.decision, "string");
  assert.equal(typeof project.state.gatingDecision?.isBlocked, "boolean");
  assert.equal(Array.isArray(project.state.approvalAuditTrail?.entries), true);
  assert.equal(typeof project.state.approvalAuditTrail?.totalEntries, "number");
  assert.equal(typeof project.state.policySchema?.policySchemaId, "string");
  assert.equal(typeof project.state.policySchema?.summary?.totalPolicies, "number");
  assert.equal(typeof project.state.actionPolicy?.id, "string");
  assert.equal(typeof project.state.actionPolicy?.kind, "string");
  assert.equal(typeof project.state.policyDecision?.decision, "string");
  assert.equal(typeof project.state.policyDecision?.isAllowed, "boolean");
  assert.equal(Array.isArray(project.state.policyViolations), true);
  assert.equal(typeof project.state.deployPolicyDecision?.decision, "string");
  assert.equal(typeof project.state.deployPolicyDecision?.isAllowed, "boolean");
  assert.equal(typeof project.state.enforcementResult?.decision, "string");
  assert.equal(typeof project.state.enforcementResult?.isAllowed, "boolean");
  assert.equal(typeof project.state.policyTrace?.finalDecision, "string");
  assert.equal(Array.isArray(project.state.policyTrace?.traceSteps), true);
  assert.equal(typeof project.state.diffPreviewSchema?.previewId, "string");
  assert.equal(typeof project.state.diffPreviewSchema?.changeSummary?.totalChanges, "number");
  assert.equal(typeof project.state.codeDiff?.totalCodeChanges, "number");
  assert.equal(Array.isArray(project.state.codeDiff?.files), true);
  assert.equal(typeof project.state.migrationDiff?.totalMigrationChanges, "number");
  assert.equal(Array.isArray(project.state.migrationDiff?.migrations), true);
  assert.equal(typeof project.state.infraDiff?.totalInfraChanges, "number");
  assert.equal(Array.isArray(project.state.infraDiff?.changes), true);
  assert.equal(typeof project.state.impactSummary?.totalChanges, "number");
  assert.equal(Array.isArray(project.state.riskFlags), true);
  assert.equal(typeof project.state.diffPreview?.headline, "string");
  assert.equal(typeof project.state.diffPreview?.summary?.totalChanges, "number");
  assert.equal(typeof project.state.businessBottleneck.title, "string");
  assert.equal(typeof project.state.businessBottleneck.reason, "string");
  assert.equal(typeof project.state.bottleneckState?.blockerType, "string");
  assert.equal(typeof project.state.bottleneckState?.summary?.isBlocked, "boolean");
  assert.equal(typeof project.state.systemBottleneckSummary?.status, "string");
  assert.equal(Array.isArray(project.state.systemBottleneckSummary?.signals), true);
  assert.equal(typeof project.state.activeBottleneck?.blockerType, "string");
  assert.equal(typeof project.state.activeBottleneck?.summary?.isBlocking, "boolean");
  assert.equal(typeof project.state.scoredBottleneck?.priorityScore, "number");
  assert.equal(typeof project.state.scoredBottleneck?.summary?.priorityBand, "string");
  assert.equal(typeof project.state.unblockPlan?.unblockPlanId, "string");
  assert.equal(typeof project.state.unblockPlan?.summary?.actionCount, "number");
  assert.equal(typeof project.state.updatedBottleneckState?.status, "string");
  assert.equal(typeof project.state.updatedBottleneckState?.summary?.isBlocked, "boolean");
  assert.equal(typeof project.state.explanationSchema?.schemaId, "string");
  assert.equal(Array.isArray(project.state.explanationSchema?.explanationTypes), true);
  assert.equal(typeof project.state.nextActionExplanation?.explanationId, "string");
  assert.equal(Array.isArray(project.state.nextActionExplanation?.alternatives), true);
  assert.equal(typeof project.state.failureExplanation?.explanationId, "string");
  assert.equal(typeof project.state.failureExplanation?.nextFix, "string");
  assert.equal(typeof project.state.approvalExplanation?.explanationId, "string");
  assert.equal(typeof project.state.approvalExplanation?.riskLevel, "string");
  assert.equal(typeof project.state.changeExplanation?.explanationId, "string");
  assert.equal(Array.isArray(project.state.changeExplanation?.stateAdvances), true);
  assert.equal(typeof project.state.projectExplanation?.explanationId, "string");
  assert.equal(typeof project.state.projectExplanation?.summary?.hasChange, "boolean");
  assert.equal(Array.isArray(project.state.crossFunctionalTaskGraph.nodes), true);
  assert.equal(typeof project.state.crossFunctionalTaskGraph.summary.gtmStage, "string");
  assert.equal(Array.isArray(project.state.growthMarketingPlan), true);
  assert.equal(typeof project.state.userIdentity?.displayName, "string");
  assert.equal(typeof project.state.userIdentity?.authMetadata?.provider, "string");
  assert.equal(typeof project.state.authenticationState?.status, "string");
  assert.equal(typeof project.state.authenticationState?.isAuthenticated, "boolean");
  assert.equal(typeof project.state.sessionState?.status, "string");
  assert.equal(typeof project.state.authenticationRouteDecision?.decisionId, "string");
  assert.equal(typeof project.state.authenticationRouteDecision?.route, "string");
  assert.equal(typeof project.state.authenticationRouteDecision?.summary?.requiresAuthentication, "boolean");
  assert.equal(typeof project.state.tokenBundle?.tokenType === "string" || project.state.tokenBundle?.tokenType === null, true);
  assert.equal(typeof project.state.verificationFlowState?.status, "string");
  assert.equal(Array.isArray(project.state.verificationFlowState?.nextActions), true);
  assert.equal(typeof project.state.authenticationViewState?.viewStateId, "string");
  assert.equal(typeof project.state.authenticationViewState?.activeScreen, "string");
  assert.equal(typeof project.state.authenticationViewState?.screens?.login?.enabled, "boolean");
  assert.equal(typeof project.state.authenticationViewState?.summary?.needsUserInput, "boolean");
  assert.equal(typeof project.state.postAuthRedirect?.redirectId, "string");
  assert.equal(typeof project.state.postAuthRedirect?.destination, "string");
  assert.equal(typeof project.state.postAuthRedirect?.summary?.entersWorkbench, "boolean");
  assert.equal(typeof project.state.projectCreationExperience?.experienceId, "string");
  assert.equal(typeof project.state.projectCreationExperience?.primaryAction?.actionId, "string");
  assert.equal(typeof project.state.projectCreationExperience?.validation?.canCreateDraft, "boolean");
  assert.equal(typeof project.state.projectCreationRedirect?.redirectId, "string");
  assert.equal(typeof project.state.projectCreationRedirect?.target, "string");
  assert.equal(typeof project.state.projectCreationRedirect?.summary?.canReturnLater, "boolean");
  assert.equal(typeof project.state.onboardingProgress?.progressId, "string");
  assert.equal(typeof project.state.onboardingProgress?.currentStep, "string");
  assert.equal(Array.isArray(project.state.onboardingProgress?.completedSteps), true);
  assert.equal(typeof project.state.onboardingViewState?.viewStateId, "string");
  assert.equal(typeof project.state.onboardingViewState?.activeScreen, "string");
  assert.equal(Array.isArray(project.state.onboardingViewState?.questions), true);
  assert.equal(typeof project.state.onboardingViewState?.summary?.needsUserInput, "boolean");
  assert.equal(typeof project.state.onboardingCompletionDecision?.decisionId, "string");
  assert.equal(typeof project.state.onboardingCompletionDecision?.isComplete, "boolean");
  assert.equal(Array.isArray(project.state.onboardingCompletionDecision?.clarificationPrompts), true);
  assert.equal(typeof project.state.onboardingCompletionDecision?.summary?.canCreateProjectState, "boolean");
  assert.equal(typeof project.state.onboardingStateHandoff?.handoffId, "string");
  assert.equal(typeof project.state.onboardingStateHandoff?.handoffStatus, "string");
  assert.equal(Array.isArray(project.state.onboardingStateHandoff?.missingClarifications), true);
  assert.equal(typeof project.state.onboardingStateHandoff?.summary?.canBuildProjectState, "boolean");
  assert.equal(typeof project.state.projectPermissionSchema?.permissionSchemaId, "string");
  assert.equal(Array.isArray(project.state.projectPermissionSchema?.permissionsByRole), true);
  assert.equal(typeof project.state.projectPermissionSchema?.permissionsByRole[0]?.capabilities?.run, "boolean");
  assert.equal(typeof project.state.projectPermissionSchema?.summary?.approvalCapableRoles, "number");
  assert.equal(typeof project.state.roleCapabilityMatrix?.roleCapabilityMatrixId, "string");
  assert.equal(Array.isArray(project.state.roleCapabilityMatrix?.roles), true);
  assert.equal(typeof project.state.roleCapabilityMatrix?.roles[0]?.summary?.canOperateIndependently, "boolean");
  assert.equal(typeof project.state.roleCapabilityMatrix?.summary?.approvalRoles, "number");
  assert.equal(typeof project.state.projectAuthorizationDecision?.authorizationDecisionId, "string");
  assert.equal(typeof project.state.projectAuthorizationDecision?.decision, "string");
  assert.equal(typeof project.state.projectAuthorizationDecision?.requiredCapability, "string");
  assert.equal(Array.isArray(project.state.projectAuthorizationDecision?.allowedActions), true);
  assert.equal(typeof project.state.projectOwnershipBinding?.bindingId, "string");
  assert.equal(typeof project.state.projectOwnershipBinding?.ownerUserId === "string" || project.state.projectOwnershipBinding?.ownerUserId === null, true);
  assert.equal(typeof project.state.initialProjectStateContract?.contractId, "string");
  assert.equal(Array.isArray(project.state.initialProjectStateContract?.requiredInputs), true);
  assert.equal(typeof project.state.initialProjectStateContract?.readiness?.canBootstrapState, "boolean");
  assert.equal(typeof project.state.initialProjectState?.stateId, "string");
  assert.equal(typeof project.state.initialProjectState?.identity?.identityId, "string");
  assert.equal(Array.isArray(project.state.initialProjectState?.constraints?.requiredInputs), true);
  assert.equal(typeof project.state.initialProjectState?.summary?.isCanonical, "boolean");
  assert.equal(typeof project.state.stateBootstrapPayload?.payloadId, "string");
  assert.equal(typeof project.state.stateBootstrapPayload?.initialProjectStateId, "string");
  assert.equal(Array.isArray(project.state.stateBootstrapPayload?.approvals), true);
  assert.equal(typeof project.state.stateBootstrapPayload?.summary?.canBootstrap, "boolean");
  assert.equal(typeof project.state.workspaceModel?.workspaceId, "string");
  assert.equal(typeof project.state.membershipRecord?.membershipId, "string");
  assert.equal(Array.isArray(project.state.membershipRecord?.roles), true);
  assert.equal(typeof project.state.accessDecision?.decision, "string");
  assert.equal(typeof project.state.accessDecision?.canView, "boolean");
  assert.equal(typeof project.state.collaborationEvent?.eventId, "string");
  assert.equal(typeof project.state.collaborationEvent?.eventType, "string");
  assert.equal(typeof project.state.collaborationEvent?.summary?.isSharedEvent, "boolean");
  assert.equal(typeof project.state.projectPresenceState?.presenceStateId, "string");
  assert.equal(Array.isArray(project.state.projectPresenceState?.participants), true);
  assert.equal(typeof project.state.projectPresenceState?.summary?.activeParticipantCount, "number");
  assert.equal(typeof project.state.sharedApprovalState?.sharedApprovalStateId, "string");
  assert.equal(Array.isArray(project.state.sharedApprovalState?.participants), true);
  assert.equal(typeof project.state.sharedApprovalState?.summary?.requiresCoordinatedDecision, "boolean");
  assert.equal(typeof project.state.collaborationFeed?.feedId, "string");
  assert.equal(Array.isArray(project.state.collaborationFeed?.items), true);
  assert.equal(typeof project.state.collaborationFeed?.summary?.containsWorkspaceTransitions, "boolean");
  assert.equal(typeof project.state.projectStateSnapshot?.snapshotId, "string");
  assert.equal(typeof project.state.projectStateSnapshot?.stateVersion, "number");
  assert.equal(typeof project.state.projectStateSnapshot?.summary?.isRestorable, "boolean");
  assert.equal(typeof project.state.snapshotRecord?.snapshotRecordId, "string");
  assert.equal(typeof project.state.snapshotRecord?.storageMetadata?.checksum, "string");
  assert.equal(typeof project.state.snapshotRecord?.summary?.isStored, "boolean");
  assert.equal(service.getProjectSnapshots({ projectId: "giftwallet" }).length >= 1, true);
  assert.equal(typeof project.state.stateDiff?.stateDiffId, "string");
  assert.equal(Array.isArray(project.state.stateDiff?.artifactChanges), true);
  assert.equal(typeof project.state.stateDiff?.summary?.totalChanges, "number");
  assert.equal(typeof project.state.restoreDecision?.restoreDecisionId, "string");
  assert.equal(typeof project.state.restoreDecision?.restoreMode, "string");
  assert.equal(typeof project.state.restoreDecision?.summary?.isSafeToExecute, "boolean");
  assert.equal(typeof project.state.rollbackExecutionResult?.rollbackExecutionId, "string");
  assert.equal(typeof project.state.rollbackExecutionResult?.executionStatus, "string");
  assert.equal(typeof project.state.rollbackExecutionResult?.summary?.restoredTargetCount, "number");
  assert.equal(typeof project.state.invitationRecord?.status, "string");
  assert.equal(typeof project.state.roleAssignment?.status, "string");
  assert.equal(typeof project.state.workspaceSettings?.policyProfile, "string");
  assert.equal(typeof project.state.workspaceSettings?.teamPreferences?.notifications, "string");
  assert.equal(Array.isArray(project.state.userJourneys?.journeys), true);
  assert.equal(Array.isArray(project.state.journeySteps), true);
  assert.equal(typeof project.state.journeyMap?.summary?.totalJourneys, "number");
  assert.equal(Array.isArray(project.state.journeyMap?.flows), true);
  assert.equal(typeof project.state.screenInventory?.summary?.totalScreens, "number");
  assert.equal(Array.isArray(project.state.screenInventory?.screens), true);
  assert.equal(typeof project.state.screenFlowMap?.summary?.totalMappings, "number");
  assert.equal(Array.isArray(project.state.screenFlowMap?.mappings), true);
  assert.equal(Array.isArray(project.state.screenContracts), true);
  assert.equal(typeof project.state.screenContracts[0]?.screenType, "string");
  assert.equal(typeof project.state.screenContracts[0]?.screenGoal, "string");
  assert.equal(typeof project.state.screenContracts[0]?.primaryAction?.label, "string");
  assert.equal(typeof project.state.mobileChecklist?.checklistId, "string");
  assert.equal(Array.isArray(project.state.mobileChecklist?.screens), true);
  assert.equal(typeof project.state.mobileChecklist?.screens[0]?.screenType, "string");
  assert.equal(typeof project.state.mobileChecklist?.summary?.totalScreens, "number");
  assert.equal(typeof project.state.screenStates?.stateCollectionId, "string");
  assert.equal(Array.isArray(project.state.screenStates?.screens), true);
  assert.equal(typeof project.state.screenStates?.screens[0]?.states?.loading?.enabled, "boolean");
  assert.equal(typeof project.state.screenStates?.summary?.totalScreens, "number");
  assert.equal(typeof project.state.screenValidationChecklist?.checklistCollectionId, "string");
  assert.equal(Array.isArray(project.state.screenValidationChecklist?.screens), true);
  assert.equal(typeof project.state.screenValidationChecklist?.screens[0]?.summary?.isReadyForImplementation, "boolean");
  assert.equal(typeof project.state.screenValidationChecklist?.summary?.totalScreens, "number");
  assert.equal(typeof project.state.designTokens?.tokenSetId, "string");
  assert.equal(typeof project.state.designTokens?.colors?.accent, "string");
  assert.equal(typeof project.state.designTokens?.spacing?.lg, "number");
  assert.equal(typeof project.state.designTokens?.summary?.desktopFirst, "boolean");
  assert.equal(typeof project.state.typographySystem?.typographySystemId, "string");
  assert.equal(typeof project.state.typographySystem?.typeScale?.h1?.fontSize, "number");
  assert.equal(typeof project.state.typographySystem?.summary?.totalStyles, "number");
  assert.equal(typeof project.state.layoutSystem?.layoutSystemId, "string");
  assert.equal(typeof project.state.layoutSystem?.grid?.columns, "number");
  assert.equal(typeof project.state.layoutSystem?.containerWidths?.standard, "number");
  assert.equal(typeof project.state.layoutSystem?.summary?.supportsWorkbenchDensity, "boolean");
  assert.equal(typeof project.state.colorRules?.colorRulesId, "string");
  assert.equal(typeof project.state.colorRules?.roles?.accent?.token, "string");
  assert.equal(typeof project.state.colorRules?.states?.warning?.token, "string");
  assert.equal(typeof project.state.colorRules?.summary?.hasSemanticStates, "boolean");
  assert.equal(typeof project.state.interactionStateSystem?.interactionStateSystemId, "string");
  assert.equal(typeof project.state.interactionStateSystem?.states?.focus?.shadow, "string");
  assert.equal(typeof project.state.interactionStateSystem?.states?.disabled?.usage, "string");
  assert.equal(typeof project.state.interactionStateSystem?.summary?.totalStates, "number");
  assert.equal(typeof project.state.componentContract?.componentContractId, "string");
  assert.equal(Array.isArray(project.state.componentContract?.anatomy), true);
  assert.equal(Array.isArray(project.state.componentContract?.behavior?.supportsStates), true);
  assert.equal(typeof project.state.componentContract?.accessibility?.requiresFocusTreatment, "boolean");
  assert.equal(typeof project.state.primitiveComponents?.componentLibraryId, "string");
  assert.equal(Array.isArray(project.state.primitiveComponents?.components), true);
  assert.equal(typeof project.state.primitiveComponents?.components[0]?.componentType, "string");
  assert.equal(typeof project.state.primitiveComponents?.summary?.interactiveComponents, "number");
  assert.equal(typeof project.state.layoutComponents?.layoutComponentLibraryId, "string");
  assert.equal(Array.isArray(project.state.layoutComponents?.components), true);
  assert.equal(typeof project.state.layoutComponents?.components[0]?.componentType, "string");
  assert.equal(typeof project.state.layoutComponents?.summary?.hasResponsiveCoverage, "boolean");
  assert.equal(typeof project.state.feedbackComponents?.feedbackComponentLibraryId, "string");
  assert.equal(Array.isArray(project.state.feedbackComponents?.components), true);
  assert.equal(typeof project.state.feedbackComponents?.components[0]?.componentType, "string");
  assert.equal(typeof project.state.feedbackComponents?.summary?.coversInlineFeedback, "boolean");
  assert.equal(typeof project.state.navigationComponents?.navigationComponentLibraryId, "string");
  assert.equal(Array.isArray(project.state.navigationComponents?.components), true);
  assert.equal(typeof project.state.navigationComponents?.components[0]?.componentType, "string");
  assert.equal(typeof project.state.navigationComponents?.summary?.supportsWorkspaceNavigation, "boolean");
  assert.equal(typeof project.state.dataDisplayComponents?.dataDisplayLibraryId, "string");
  assert.equal(Array.isArray(project.state.dataDisplayComponents?.components), true);
  assert.equal(typeof project.state.dataDisplayComponents?.components[0]?.componentType, "string");
  assert.equal(typeof project.state.dataDisplayComponents?.summary?.supportsOperationalDashboards, "boolean");
  assert.equal(typeof project.state.screenTemplateSchema?.templateId, "string");
  assert.equal(Array.isArray(project.state.screenTemplateSchema?.regions), true);
  assert.equal(Array.isArray(project.state.screenTemplateSchema?.requiredLibraries), true);
  assert.equal(typeof project.state.screenTemplateSchema?.summary?.libraryCount, "number");
  assert.equal(typeof project.state.dashboardTemplate?.templateId, "string");
  assert.equal(typeof project.state.dashboardTemplate?.sections?.summaryStrip?.enabled, "boolean");
  assert.equal(Array.isArray(project.state.dashboardTemplate?.composition?.secondaryComponents), true);
  assert.equal(typeof project.state.dashboardTemplate?.summary?.supportsOperationalSummary, "boolean");
  assert.equal(typeof project.state.detailPageTemplate?.templateId, "string");
  assert.equal(typeof project.state.detailPageTemplate?.sections?.sidePanel?.enabled, "boolean");
  assert.equal(Array.isArray(project.state.detailPageTemplate?.composition?.primaryComponents), true);
  assert.equal(typeof project.state.detailPageTemplate?.summary?.supportsActionableReview, "boolean");
  assert.equal(typeof project.state.workflowTemplate?.templateId, "string");
  assert.equal(typeof project.state.workflowTemplate?.sections?.assistantRail?.enabled, "boolean");
  assert.equal(Array.isArray(project.state.workflowTemplate?.composition?.secondaryComponents), true);
  assert.equal(typeof project.state.workflowTemplate?.summary?.supportsGuidedCompletion, "boolean");
  assert.equal(typeof project.state.managementTemplate?.templateId, "string");
  assert.equal(typeof project.state.managementTemplate?.sections?.filterBar?.enabled, "boolean");
  assert.equal(Array.isArray(project.state.managementTemplate?.composition?.primaryComponents), true);
  assert.equal(typeof project.state.managementTemplate?.summary?.supportsListOperations, "boolean");
  assert.equal(typeof project.state.templateVariants?.variantCollectionId, "string");
  assert.equal(Array.isArray(project.state.templateVariants?.templates), true);
  assert.equal(Array.isArray(project.state.templateVariants?.templates[0]?.variants), true);
  assert.equal(typeof project.state.templateVariants?.summary?.totalVariants, "number");
  assert.equal(typeof project.state.primaryActionValidation?.validationCollectionId, "string");
  assert.equal(Array.isArray(project.state.primaryActionValidation?.screens), true);
  assert.equal(typeof project.state.primaryActionValidation?.screens[0]?.summary?.isValid, "boolean");
  assert.equal(typeof project.state.primaryActionValidation?.summary?.blockedScreens, "number");
  assert.equal(typeof project.state.mobileValidation?.validationCollectionId, "string");
  assert.equal(Array.isArray(project.state.mobileValidation?.screens), true);
  assert.equal(typeof project.state.mobileValidation?.screens[0]?.summary?.isUsable, "boolean");
  assert.equal(typeof project.state.mobileValidation?.summary?.blockedScreens, "number");
  assert.equal(typeof project.state.stateCoverageValidation?.validationCollectionId, "string");
  assert.equal(Array.isArray(project.state.stateCoverageValidation?.screens), true);
  assert.equal(typeof project.state.stateCoverageValidation?.screens[0]?.summary?.isValid, "boolean");
  assert.equal(typeof project.state.stateCoverageValidation?.summary?.blockedScreens, "number");
  assert.equal(typeof project.state.consistencyValidation?.validationCollectionId, "string");
  assert.equal(Array.isArray(project.state.consistencyValidation?.screens), true);
  assert.equal(typeof project.state.consistencyValidation?.screens[0]?.summary?.isConsistent, "boolean");
  assert.equal(typeof project.state.consistencyValidation?.summary?.blockedScreens, "number");
  assert.equal(typeof project.state.screenReviewReport?.reportId, "string");
  assert.equal(Array.isArray(project.state.screenReviewReport?.screens), true);
  assert.equal(typeof project.state.screenReviewReport?.screens[0]?.summary?.isReady, "boolean");
  assert.equal(typeof project.state.screenReviewReport?.summary?.blockedScreens, "number");
  assert.equal(typeof project.state.learningInsightViewModel?.viewModelId, "string");
  assert.equal(Array.isArray(project.state.learningInsightViewModel?.insights), true);
  assert.equal(Array.isArray(project.state.learningInsightViewModel?.patterns), true);
  assert.equal(typeof project.state.learningInsightViewModel?.confidence?.band, "string");
  assert.equal(typeof project.state.reasoningPanel?.panelId, "string");
  assert.equal(Array.isArray(project.state.reasoningPanel?.impact?.signals), true);
  assert.equal(Array.isArray(project.state.reasoningPanel?.learning?.reasons), true);
  assert.equal(typeof project.state.reasoningPanel?.policy?.requiresApproval, "boolean");
  assert.equal(typeof project.state.confidenceIndicator?.indicatorCollectionId, "string");
  assert.equal(Array.isArray(project.state.confidenceIndicator?.indicators), true);
  assert.equal(typeof project.state.confidenceIndicator?.summary?.totalPatterns, "number");
  assert.equal(typeof project.state.userPreferenceSignals?.signalViewId, "string");
  assert.equal(Array.isArray(project.state.userPreferenceSignals?.signals), true);
  assert.equal(typeof project.state.userPreferenceSignals?.summary?.totalSignals, "number");
  assert.equal(typeof project.state.crossProjectPatternPanel?.panelId, "string");
  assert.equal(Array.isArray(project.state.crossProjectPatternPanel?.patterns), true);
  assert.equal(Array.isArray(project.state.crossProjectPatternPanel?.recommendationHints), true);
  assert.equal(typeof project.state.crossProjectPatternPanel?.summary?.safeToDisplay, "boolean");
  assert.equal(typeof project.state.learningDisclosure?.bannerId, "string");
  assert.equal(typeof project.state.learningDisclosure?.visible, "boolean");
  assert.equal(typeof project.state.learningDisclosure?.summary?.isPassiveOnly, "boolean");
  assert.equal(typeof project.state.aiLearningWorkspaceTemplate?.templateId, "string");
  assert.equal(typeof project.state.aiLearningWorkspaceTemplate?.sections?.workspacePanels?.enabled, "boolean");
  assert.equal(typeof project.state.aiLearningWorkspaceTemplate?.summary?.supportsLearningInsights, "boolean");
  assert.equal(typeof project.state.contextRelevanceSchema?.schemaId, "string");
  assert.equal(Array.isArray(project.state.contextRelevanceSchema?.contextEntries), true);
  assert.equal(typeof project.state.contextRelevanceSchema?.summary?.isReadyForAiReviewExecution, "boolean");
  assert.equal(typeof project.state.relevanceFilteredContext?.filterId, "string");
  assert.equal(Array.isArray(project.state.relevanceFilteredContext?.keptContext), true);
  assert.equal(typeof project.state.slimmedContextPayload?.payloadId, "string");
  assert.equal(Array.isArray(project.state.slimmedContextPayload?.orderedContext), true);
  assert.equal(typeof project.state.droppedContextSummary?.summaryId, "string");
  assert.equal(typeof project.state.companionState?.stateId, "string");
  assert.equal(typeof project.state.companionState?.mode, "string");
  assert.equal(typeof project.state.companionState?.summary?.hasRecommendations, "boolean");
  assert.equal(typeof project.state.companionTriggerDecision?.decisionId, "string");
  assert.equal(typeof project.state.companionTriggerDecision?.decisionType, "string");
  assert.equal(typeof project.state.companionTriggerDecision?.summary?.executionMode, "string");
  assert.equal(typeof project.state.companionMessagePriority?.priorityId, "string");
  assert.equal(typeof project.state.companionMessagePriority?.priority, "string");
  assert.equal(typeof project.state.companionMessagePriority?.summary?.requiresApproval, "boolean");
  assert.equal(typeof project.state.companionPresence?.presenceId, "string");
  assert.equal(typeof project.state.companionPresence?.tone, "string");
  assert.equal(typeof project.state.companionPresence?.summary?.prefersDockPresence, "boolean");
  assert.equal(typeof project.state.companionDock?.dockId, "string");
  assert.equal(typeof project.state.companionDock?.summary?.headline, "string");
  assert.equal(typeof project.state.companionPanel?.panelId, "string");
  assert.equal(typeof project.state.companionPanel?.summary?.showsNextActions, "boolean");
  assert.equal(typeof project.state.animationStateRules?.animationRulesId, "string");
  assert.equal(typeof project.state.animationStateRules?.animationMode, "string");
  assert.equal(typeof project.state.animationStateRules?.summary?.respectsQuietMode, "boolean");
  assert.equal(typeof project.state.companionModeSettings?.settingsId, "string");
  assert.equal(typeof project.state.companionModeSettings?.selectedMode, "string");
  assert.equal(typeof project.state.companionModeSettings?.summary?.suppressesCompanion, "boolean");
  assert.equal(typeof project.state.interruptionDecision?.decisionId, "string");
  assert.equal(typeof project.state.interruptionDecision?.decision, "string");
  assert.equal(typeof project.state.interruptionDecision?.summary?.blockedByApprovalSensitivity, "boolean");
  assert.equal(typeof project.state.aiCompanionTemplate?.templateId, "string");
  assert.equal(typeof project.state.aiCompanionTemplate?.sections?.companionPanelZone?.enabled, "boolean");
  assert.equal(typeof project.state.aiCompanionTemplate?.summary?.hasExpandedCompanionPanel, "boolean");
  assert.equal(typeof project.state.developerWorkspace?.workspaceId, "string");
  assert.equal(typeof project.state.developerWorkspace?.fileTree?.totalFiles, "number");
  assert.equal(typeof project.state.developerWorkspace?.terminal?.status, "string");
  assert.equal(typeof project.state.projectWorkbenchLayout?.layoutId, "string");
  assert.equal(Array.isArray(project.state.projectWorkbenchLayout?.zones), true);
  assert.equal(Array.isArray(project.state.projectWorkbenchLayout?.panels), true);
  assert.equal(typeof project.state.fileEditorContract?.contractId, "string");
  assert.equal(Array.isArray(project.state.fileEditorContract?.fileTree?.items), true);
  assert.equal(Array.isArray(project.state.fileEditorContract?.editor?.tabs), true);
  assert.equal(typeof project.state.commandConsoleView?.consoleId, "string");
  assert.equal(Array.isArray(project.state.commandConsoleView?.commands), true);
  assert.equal(Array.isArray(project.state.commandConsoleView?.logStreams?.stdout), true);
  assert.equal(typeof project.state.liveLogStream?.streamId, "string");
  assert.equal(Array.isArray(project.state.liveLogStream?.streams?.stdout), true);
  assert.equal(typeof project.state.liveLogStream?.summary?.commandOutputs, "number");
  assert.equal(typeof project.state.branchDiffActivityPanel?.panelId, "string");
  assert.equal(Array.isArray(project.state.branchDiffActivityPanel?.commits), true);
  assert.equal(Array.isArray(project.state.branchDiffActivityPanel?.pendingApprovals), true);
  assert.equal(typeof project.state.reviewThreadState?.threadStateId, "string");
  assert.equal(Array.isArray(project.state.reviewThreadState?.threads), true);
  assert.equal(typeof project.state.reviewThreadState?.summary?.hasContextualDiscussion, "boolean");
  assert.equal(typeof project.state.artifactBuildPanel?.panelId, "string");
  assert.equal(Array.isArray(project.state.artifactBuildPanel?.build?.artifacts), true);
  assert.equal(typeof project.state.artifactBuildPanel?.verification?.isValid, "boolean");
  assert.equal(typeof project.state.reactiveWorkspaceState?.refreshStateId, "string");
  assert.equal(typeof project.state.reactiveWorkspaceState?.refreshMode, "string");
  assert.equal(typeof project.state.reactiveWorkspaceState?.progressBar?.percent, "number");
  assert.equal(typeof project.state.developmentWorkspace?.workspaceId === "string" || project.state.developmentWorkspace?.workspaceId === null, true);
  assert.equal(Array.isArray(project.state.developmentWorkspace?.navigation?.primaryNavigation), true);
  assert.equal(typeof project.state.developmentWorkspace?.executionSurface?.status, "string");
  assert.equal(typeof project.state.projectBrainWorkspace?.workspaceId, "string");
  assert.equal(Array.isArray(project.state.projectBrainWorkspace?.blockers), true);
  assert.equal(typeof project.state.projectBrainWorkspace?.summary?.requiresApproval, "boolean");
  assert.equal(typeof project.state.releaseWorkspace?.workspaceId, "string");
  assert.equal(typeof project.state.releaseWorkspace?.validation?.status, "string");
  assert.equal(Array.isArray(project.state.releaseWorkspace?.timeline?.events), true);
  assert.equal(typeof project.state.growthWorkspace?.workspaceId, "string");
  assert.equal(Array.isArray(project.state.growthWorkspace?.campaigns?.tasks), true);
  assert.equal(Array.isArray(project.state.growthWorkspace?.analytics?.kpis), true);
  assert.equal(typeof project.state.workspaceNavigationModel?.projectId, "string");
  assert.equal(Array.isArray(project.state.workspaceNavigationModel?.availableWorkspaces), true);
  assert.equal(typeof project.state.workspaceNavigationModel?.summary?.totalWorkspaces, "number");
  assert.equal(typeof project.state.acceptanceScenario?.acceptanceScenarioId, "string");
  assert.equal(Array.isArray(project.state.acceptanceScenario?.scenarios), true);
  assert.equal(typeof project.state.acceptanceResult?.acceptanceResultId, "string");
  assert.equal(project.state.acceptanceResult?.scenarioKey, "workspace-continuity");
  assert.equal(typeof project.state.acceptanceResult?.summary?.passed, "boolean");
  assert.equal(typeof project.state.onboardingAcceptanceResult?.acceptanceResultId, "string");
  assert.equal(typeof project.state.executionAcceptanceResult?.acceptanceResultId, "string");
  assert.equal(typeof project.state.failureRecoveryAcceptanceResult?.acceptanceResultId, "string");
  assert.equal(typeof project.state.approvalExplanationAcceptanceResult?.acceptanceResultId, "string");
  assert.equal(typeof project.state.executionTopology?.topologyId, "string");
  assert.equal(Array.isArray(project.state.executionTopology?.topologies), true);
  assert.equal(typeof project.state.executionTopology?.summary?.includesBranch, "boolean");
  assert.equal(typeof project.state.cloudWorkspaceModel?.workspaceId, "string");
  assert.equal(typeof project.state.cloudWorkspaceModel?.surface?.topologyType, "string");
  assert.equal(typeof project.state.cloudWorkspaceModel?.summary?.isWritable, "boolean");
  assert.equal(typeof project.state.localDevelopmentBridge?.bridgeId, "string");
  assert.equal(typeof project.state.localDevelopmentBridge?.connection?.mode, "string");
  assert.equal(typeof project.state.localDevelopmentBridge?.guardrails?.isPrimaryWorkspace, "boolean");
  assert.equal(typeof project.state.remoteMacRunner?.runnerId, "string");
  assert.equal(typeof project.state.remoteMacRunner?.connection?.mode, "string");
  assert.equal(typeof project.state.remoteMacRunner?.capabilities?.supportsSigning, "boolean");
  assert.equal(typeof project.state.executionModeDecision?.decisionId, "string");
  assert.equal(typeof project.state.executionModeDecision?.selectedMode, "string");
  assert.equal(typeof project.state.executionModeDecision?.summary?.isControlled, "boolean");
  assert.equal(project.state.bootstrapPlan.domain, "saas");
  assert.equal(Array.isArray(project.state.bootstrapTasks), true);
  assert.equal(Array.isArray(project.state.bootstrapAssignments), true);
  assert.equal(project.state.bootstrapAssignments.length >= 1, true);
  assert.equal(Array.isArray(project.state.bootstrapExecutionRequests), true);
  assert.equal(project.state.bootstrapExecutionRequests.length >= 1, true);
  assert.equal(Array.isArray(project.state.bootstrapResolvedSurfaces), true);
  assert.equal(project.state.bootstrapResolvedSurfaces.length >= 1, true);
  assert.equal(Array.isArray(project.state.bootstrapPlannedCommands), true);
  assert.equal(project.state.bootstrapPlannedCommands.length >= 1, true);
  assert.equal(Array.isArray(project.state.bootstrapRawExecutionResults), true);
  assert.equal(project.state.bootstrapRawExecutionResults.length >= 1, true);
  assert.equal(typeof project.state.bootstrapRawExecutionResults[0]?.rawExecutionResult?.status, "string");
  assert.equal(Array.isArray(project.state.bootstrapArtifacts), true);
  assert.equal(typeof project.state.bootstrapExecutionMetadata?.totalRuns, "number");
  assert.equal(typeof project.state.bootstrapExecutionResult?.status, "string");
  assert.equal(typeof project.state.bootstrapValidation?.isValid, "boolean");
  assert.equal(Array.isArray(project.state.bootstrapValidation?.expectedArtifacts), true);
  assert.equal(typeof project.state.initialProjectStateValidation?.isValid, "boolean");
  assert.equal(Array.isArray(project.state.stateValidationIssues), true);
  assert.equal(Array.isArray(project.state.initialTasks), true);
  assert.equal(typeof project.state.taskSeedMetadata?.seedId, "string");
  assert.equal(typeof project.state.selectionReason?.code, "string");
  assert.equal(
    project.state.selectedTask === null || typeof project.state.selectedTask?.summary === "string",
    true,
  );
  assert.equal(typeof project.state.nextTaskPresentation?.presentationId, "string");
  assert.equal(typeof project.state.nextTaskPresentation?.summary?.requiresApproval, "boolean");
  assert.equal(typeof project.state.nextTaskApprovalPanel?.panelId, "string");
  assert.equal(typeof project.state.nextTaskApprovalPanel?.summary?.safeAlternativeCount, "number");
  assert.equal(typeof project.state.recommendationDisplay?.displayId, "string");
  assert.equal(typeof project.state.recommendationDisplay?.primaryCta?.intent, "string");
  assert.equal(typeof project.state.recommendationSummaryPanel?.panelId, "string");
  assert.equal(typeof project.state.recommendationSummaryPanel?.urgency, "string");
  assert.equal(typeof project.state.editableProposal?.proposalId, "string");
  assert.equal(Array.isArray(project.state.editableProposal?.sections), true);
  assert.equal(typeof project.state.editableProposal?.summary?.supportsPartialAcceptance, "boolean");
  assert.equal(typeof project.state.editedProposal?.revisionId, "string");
  assert.equal(Array.isArray(project.state.editedProposal?.annotations), true);
  assert.equal(typeof project.state.proposalEditHistory?.historyId, "string");
  assert.equal(typeof project.state.proposalEditHistory?.summary?.preservesHistory, "boolean");
  assert.equal(typeof project.state.partialAcceptanceDecision?.decisionId, "string");
  assert.equal(typeof project.state.partialAcceptanceDecision?.summary?.requiresRegeneration, "boolean");
  assert.equal(typeof project.state.remainingProposalScope?.scopeId, "string");
  assert.equal(typeof project.state.remainingProposalScope?.summary?.remainingSectionCount, "number");
  assert.equal(typeof project.state.cockpitRecommendationSurface?.surfaceId, "string");
  assert.equal(typeof project.state.cockpitRecommendationSurface?.approval?.requiresApproval, "boolean");
  assert.equal(typeof project.state.bootstrapStateUpdate?.bootstrap?.status, "string");
  assert.equal(typeof project.state.firstValueOutput?.outputId, "string");
  assert.equal(typeof project.state.firstValueOutput?.summary?.feelsReal, "boolean");
  assert.equal(Array.isArray(project.state.bootstrapExecutionGraph?.nodes), true);
  assert.equal(typeof project.state.executionProgressSchema?.status, "string");
  assert.equal(typeof project.state.executionProgressSchema?.progressPercent, "number");
  assert.equal(typeof project.state.normalizedProgressInputs?.hasRuntimeLogs, "boolean");
  assert.equal(Array.isArray(project.state.normalizedProgressInputs?.taskResults), true);
  assert.equal(typeof project.state.progressPhase, "string");
  assert.equal(typeof project.state.progressPercent, "number");
  assert.equal(typeof project.state.completionEstimate, "string");
  assert.equal(typeof project.state.progressState?.status, "string");
  assert.equal(typeof project.state.realityProgress?.realityProgressId, "string");
  assert.equal(Array.isArray(project.state.realityProgress?.signals), true);
  assert.equal(typeof project.state.firstValueSummary?.summaryId, "string");
  assert.equal(typeof project.state.firstValueSummary?.summary?.hasMomentum, "boolean");
  assert.equal(typeof project.state.realtimeEventStream?.streamId, "string");
  assert.equal(Array.isArray(project.state.realtimeEventStream?.events), true);
  assert.equal(typeof project.state.realtimeEventStream?.summary?.notificationEvents, "number");
  assert.equal(typeof project.state.liveUpdateChannel?.channelId, "string");
  assert.equal(typeof project.state.liveUpdateChannel?.transportMode, "string");
  assert.equal(typeof project.state.liveUpdateChannel?.summary?.isLive, "boolean");
  assert.equal(Array.isArray(project.state.formattedLogs), true);
  assert.equal(Array.isArray(project.state.userFacingMessages), true);
  assert.equal(typeof project.state.platformTrace?.traceId, "string");
  assert.equal(Array.isArray(project.state.platformLogs), true);
  assert.equal(typeof project.state.incidentAlert?.status, "string");
  assert.equal(typeof project.state.incidentAlert?.incidentCount, "number");
  assert.equal(typeof project.state.auditLogRecord?.auditLogId, "string");
  assert.equal(typeof project.state.auditLogRecord?.category, "string");
  assert.equal(typeof project.state.projectAuditEvent?.projectAuditEventId, "string");
  assert.equal(typeof project.state.projectAuditEvent?.category, "string");
  assert.equal(typeof project.state.projectAuditEvent?.actor?.actorId, "string");
  assert.equal(typeof project.state.projectAuditRecord?.projectAuditRecordId, "string");
  assert.equal(typeof project.state.projectAuditRecord?.category, "string");
  assert.equal(Array.isArray(project.state.projectAuditRecord?.auditTrail), true);
  assert.equal(typeof project.state.actorActionTrace?.actorActionTraceId, "string");
  assert.equal(typeof project.state.actorActionTrace?.outcome?.status, "string");
  assert.equal(Array.isArray(project.state.actorActionTrace?.affectedArtifacts), true);
  assert.equal(typeof project.state.projectAuditPayload?.projectAuditPayloadId, "string");
  assert.equal(Array.isArray(project.state.projectAuditPayload?.entries), true);
  assert.equal(typeof project.state.nexusPersistenceSchema?.schemaId, "string");
  assert.equal(typeof project.state.nexusPersistenceSchema?.summary?.totalEntities, "number");
  assert.equal(typeof project.state.migrationPlan?.migrationPlanId, "string");
  assert.equal(Array.isArray(project.state.migrationArtifacts?.files), true);
  assert.equal(Array.isArray(project.state.entityRepository), true);
  assert.equal(typeof project.state.entityRepository?.[0]?.repositoryId, "string");
  assert.equal(typeof project.state.storageRecord?.storageRecordId, "string");
  assert.equal(typeof project.state.storageRecord?.summary?.totalStoredItems, "number");
  assert.equal(typeof project.state.backupStrategy?.backupStrategyId, "string");
  assert.equal(typeof project.state.backupStrategy?.summary?.totalDatasets, "number");
  assert.equal(typeof project.state.restorePlan?.restorePlanId, "string");
  assert.equal(Array.isArray(project.state.restorePlan?.restoreTargets?.datasets), true);
  assert.equal(typeof project.state.notificationPayload?.type, "string");
  assert.equal(typeof project.state.notificationEvent?.eventType, "string");
  assert.equal(typeof project.state.notificationEvent?.notificationEventId, "string");
  assert.equal(typeof project.state.notificationCenterState?.unreadCount, "number");
  assert.equal(Array.isArray(project.state.notificationCenterState?.inbox), true);
  assert.equal(typeof project.state.notificationPreferences?.frequency, "string");
  assert.equal(Array.isArray(project.state.notificationPreferences?.channels), true);
  assert.equal(typeof project.state.emailDeliveryResult?.deliveryStatus, "string");
  assert.equal(project.state.emailDeliveryResult?.deliveryChannel, "email");
  assert.equal(typeof project.state.externalDeliveryResult?.deliveryStatus, "string");
  assert.equal(typeof project.state.externalDeliveryResult?.deliveryChannel, "string");
  assert.equal(typeof project.state.releasePlan?.releaseTarget, "string");
  assert.equal(Array.isArray(project.state.releaseSteps), true);
  assert.equal(Array.isArray(project.state.buildTargets), true);
  assert.equal(Array.isArray(project.state.buildArtifactManifest?.outputs), true);
  assert.equal(typeof project.state.artifactRecord?.buildTarget, "string");
  assert.equal(Array.isArray(project.state.artifactRecord?.outputPaths), true);
  assert.equal(typeof project.state.packagingRequirements?.releaseTarget, "string");
  assert.equal(Array.isArray(project.state.packagingRequirements?.requiredPackageArtifacts), true);
  assert.equal(typeof project.state.packageFormat, "string");
  assert.equal(Array.isArray(project.state.packagingManifest?.files), true);
  assert.equal(Array.isArray(project.state.packagingManifest?.assets), true);
  assert.equal(typeof project.state.packagedArtifact?.packageFormat, "string");
  assert.equal(Array.isArray(project.state.packagedArtifact?.files), true);
  assert.equal(typeof project.state.packagedArtifact?.metadata?.verificationStatus, "string");
  assert.equal(typeof project.state.packageVerification?.isValid, "boolean");
  assert.equal(typeof project.state.testExecutionRequest?.buildTarget, "string");
  assert.equal(Array.isArray(project.state.testExecutionRequest?.testTypes), true);
  assert.equal(typeof project.state.testRunPlan?.riskLevel, "string");
  assert.equal(Array.isArray(project.state.testRunPlan?.selectedSuites), true);
  assert.equal(typeof project.state.rawTestResults?.status, "string");
  assert.equal(Array.isArray(project.state.rawTestResults?.suiteResults), true);
  assert.equal(typeof project.state.normalizedTestResults?.status, "string");
  assert.equal(typeof project.state.normalizedTestResults?.summary?.totalSuites, "number");
  assert.equal(typeof project.state.qualityGateDecision?.decision, "string");
  assert.equal(typeof project.state.qualityGateDecision?.isAllowed, "boolean");
  assert.equal(typeof project.state.nextVersion, "string");
  assert.equal(typeof project.state.releaseTag, "string");
  assert.equal(Array.isArray(project.state.releaseRequirementsSchema?.requiredArtifacts), true);
  assert.equal(typeof project.state.artifactValidation?.isReady, "boolean");
  assert.equal(typeof project.state.metadataValidation?.isReady, "boolean");
  assert.equal(typeof project.state.approvalValidation?.isReady, "boolean");
  assert.equal(Array.isArray(project.state.blockingIssues), true);
  assert.equal(typeof project.state.validationReport?.status, "string");
  assert.equal(typeof project.state.hostingAdapter?.provider, "string");
  assert.equal(Array.isArray(project.state.hostingAdapter?.capabilities), true);
  assert.equal(typeof project.state.deploymentRequest?.provider, "string");
  assert.equal(Array.isArray(project.state.deploymentRequest?.buildArtifacts), true);
  assert.equal(typeof project.state.providerAdapter?.provider, "string");
  assert.equal(Array.isArray(project.state.providerAdapter?.capabilities), true);
  assert.equal(typeof project.state.accountRecord?.accountId, "string");
  assert.equal(project.state.accountRecord?.accountType, "hosting");
  assert.equal(typeof project.state.providerSession?.providerType, "string");
  assert.equal(Array.isArray(project.state.providerSession?.capabilities), true);
  assert.equal(typeof project.state.providerContractSession?.providerType, "string");
  assert.equal(Array.isArray(project.state.providerContractSession?.capabilities), true);
  assert.equal(typeof project.state.authModeDefinition?.authMode, "string");
  assert.equal(Array.isArray(project.state.authModeDefinition?.supportedAuthModes), true);
  assert.equal(typeof project.state.credentialReference, "string");
  assert.equal(typeof project.state.encryptedCredential?.ciphertext, "string");
  assert.equal(typeof project.state.credentialVaultRecord?.credentialReference, "string");
  assert.equal(typeof project.state.credentialPolicyDecision?.decision, "string");
  assert.equal(typeof project.state.credentialPolicyDecision?.isAllowed, "boolean");
  assert.equal(typeof project.state.providerConnectorSchema?.providerType, "string");
  assert.equal(Array.isArray(project.state.providerConnectorSchema?.authenticationModes), true);
  assert.equal(typeof project.state.providerCapabilities?.providerType, "string");
  assert.equal(Array.isArray(project.state.providerCapabilities?.capabilities), true);
  assert.equal(Array.isArray(project.state.providerOperations), true);
  assert.equal(typeof project.state.providerOperations?.[0]?.operationType, "string");
  assert.equal(typeof project.state.providerConnector?.providerType, "string");
  assert.equal(Array.isArray(project.state.providerConnector?.operations), true);
  assert.equal(typeof project.state.providerDegradationState?.providerType, "string");
  assert.equal(typeof project.state.providerDegradationState?.health, "string");
  assert.equal(typeof project.state.providerDegradationState?.summary?.requiresCircuitBreaker, "boolean");
  assert.equal(typeof project.state.circuitBreakerDecision?.providerType, "string");
  assert.equal(typeof project.state.circuitBreakerDecision?.decision, "string");
  assert.equal(typeof project.state.circuitBreakerDecision?.summary?.failFast, "boolean");
  assert.equal(typeof project.state.providerRecoveryProbe?.providerType, "string");
  assert.equal(typeof project.state.providerRecoveryProbe?.status, "string");
  assert.equal(typeof project.state.providerRecoveryProbe?.summary?.canProbe, "boolean");
  assert.equal(typeof project.state.verificationResult?.isVerified, "boolean");
  assert.equal(typeof project.state.verificationResult?.status, "string");
  assert.equal(typeof project.state.ownershipPolicy?.ownerUserId, "string");
  assert.equal(Array.isArray(project.state.ownershipPolicy?.distributionTargets?.targets), true);
  assert.equal(typeof project.state.consentRecord?.consentId, "string");
  assert.equal(typeof project.state.consentRecord?.status, "string");
  assert.equal(typeof project.state.guardResult?.isAllowed, "boolean");
  assert.equal(typeof project.state.guardResult?.status, "string");
  assert.equal(typeof project.state.preparedArtifact?.packageFormat, "string");
  assert.equal(Array.isArray(project.state.preparedArtifact?.artifacts), true);
  assert.equal(typeof project.state.releaseStateUpdate?.release?.status, "string");
  assert.equal(Array.isArray(project.state.releaseExecutionGraph?.nodes), true);
  assert.equal(typeof project.state.releaseStatus?.status, "string");
  assert.equal(Array.isArray(project.state.releaseStatus?.terminalStates), true);
  assert.equal(typeof project.state.releaseRun?.releaseRunId, "string");
  assert.equal(typeof project.state.releaseTimeline?.currentStatus, "string");
  assert.equal(Array.isArray(project.state.releaseTimeline?.events), true);
  assert.equal(typeof project.state.failureSummary?.status, "string");
  assert.equal(typeof project.state.failureRecoveryModel?.failureClass, "string");
  assert.equal(Array.isArray(project.state.failureRecoveryModel?.fallbackOptions), true);
  assert.equal(typeof project.state.failureRecoveryModel?.summary?.canRetry, "boolean");
  assert.equal(typeof project.state.retryPolicy?.retryPolicyId, "string");
  assert.equal(typeof project.state.retryPolicy?.shouldRetry, "boolean");
  assert.equal(typeof project.state.retryPolicy?.summary?.requiresScheduler, "boolean");
  assert.equal(typeof project.state.fallbackStrategy?.fallbackStrategyId, "string");
  assert.equal(typeof project.state.fallbackStrategy?.primaryStrategy?.action, "string");
  assert.equal(typeof project.state.fallbackStrategy?.summary?.strategyCount, "number");
  assert.equal(typeof project.state.rollbackPlan?.rollbackPlanId, "string");
  assert.equal(typeof project.state.rollbackPlan?.rollbackMode, "string");
  assert.equal(typeof project.state.rollbackPlan?.summary?.totalTargets, "number");
  assert.equal(typeof project.state.recoveryDecision?.decisionType, "string");
  assert.equal(typeof project.state.recoveryDecision?.summary?.actionCount, "number");
  assert.equal(Array.isArray(project.state.recoveryActions), true);
  assert.equal(typeof project.state.recoveryOptionsPayload?.headline, "string");
  assert.equal(typeof project.state.recoveryOptionsPayload?.summary?.optionCount, "number");
  assert.equal(Array.isArray(project.state.followUpTasks), true);
  assert.equal(typeof project.state.testReportSummary?.status, "string");
  assert.equal(Array.isArray(project.state.testReportSummary?.remediationActions), true);
  assert.equal(typeof project.state.pollingRequest?.releaseTarget, "string");
  assert.equal(typeof project.state.resolvedPoller?.pollerId, "string");
  assert.equal(Array.isArray(project.state.statusEvents), true);
  assert.equal(typeof project.state.pollingDecision?.isTerminal, "boolean");
  assert.equal(typeof project.state.pollingMetadata?.attempt, "number");
  assert.equal(project.normalizedSources.scan.connected, true);
  assert.equal(project.state.integrations.git.connected, false);
  assert.equal(typeof project.state.observed.lastObservedAt, "string");
});

test("project service can run additional cycles against persisted events", () => {
  const service = createProjectService();
  service.seedDemoProject();

  const project = service.runCycle("giftwallet");

  assert.equal(project.id, "giftwallet");
  assert.equal(Array.isArray(project.runtimeResults), true);
  assert.equal(Array.isArray(project.taskResults), true);
  assert.equal(project.taskResults.every((result) => result.status === "completed" || result.status === "failed"), true);
  assert.equal(project.events.some((event) => event.type === "task.completed"), true);
  assert.equal(project.cycle.executionGraph.nodes.some((node) => node.status === "done"), true);
});

test("project service stores ai analysis output", async () => {
  const service = createProjectService();
  service.analyst = {
    analyzeProjectContext: async () => ({
      status: "ready",
      summary: "יש להתחיל מהקמת auth.",
      architecture: ["backend"],
      risks: ["אין env"],
      nextActions: ["להוסיף env example"],
      notes: ["ניתוח בלבד"],
    }),
  };
  service.seedDemoProject();

  const project = await service.analyzeProject("giftwallet");

  assert.equal(project.analysis.summary, "יש להתחיל מהקמת auth.");
  assert.equal(project.analysis.nextActions[0], "להוסיף env example");
});

test("project service syncs casino diagnostics into nexus state", async () => {
  const service = createProjectService();
  service.casinoConnector = {
    fetchSnapshot: async () => ({
      health: {
        projectName: "Royal Casino",
        status: "degraded",
        blockingIssues: ["db unknown"],
      },
      features: {
        hasAuth: true,
        hasPayments: false,
        hasWallet: false,
        hasAnalytics: false,
      },
      flows: {
        registration: {
          status: "partial",
          notes: "frontend missing",
        },
      },
      technical: {
        stack: {
          backend: "Express",
          frontend: "Expo",
          database: "Postgres planned",
        },
        knownTechnicalGaps: ["no migrations"],
      },
      roadmapContext: {
        mainGoal: "להשלים auth",
        knownMissingParts: ["Wallet"],
        criticalDependencies: ["Database Schema"],
      },
    }),
  };
  service.sourceAdapters = {
    resolve: () => ({
      normalize: ({ snapshot }) => ({
        name: snapshot.health.projectName,
        goal: "להשלים auth",
        status: "blocked",
        stack: "Express, Expo, Postgres planned",
        state: {
          businessGoal: "להשלים auth",
          product: {
            hasAuth: true,
            hasStagingEnvironment: false,
            hasLandingPage: false,
            hasPaymentIntegration: false,
          },
          analytics: {
            hasBaselineCampaign: false,
          },
          knowledge: {
            knownGaps: ["Wallet"],
          },
          stack: {
            frontend: "Expo",
            backend: "Express",
            database: "Postgres planned",
          },
        },
        approvals: ["נדרש אישור או פתרון עבור: Database Schema"],
        externalSnapshot: {
          source: "casino-api",
          syncedAt: "2026-01-01T00:00:00.000Z",
          health: snapshot.health,
          features: snapshot.features,
          flows: snapshot.flows,
          technical: snapshot.technical,
          roadmapContext: snapshot.roadmapContext,
          blockedFlows: ["registration: frontend missing"],
        },
      }),
    }),
  };
  service.seedCasinoProject();

  const project = await service.syncCasinoProject("royal-casino", {
    baseUrl: "http://localhost:4101",
  });

  assert.equal(project.name, "Royal Casino");
  assert.equal(project.source.baseUrl, "http://localhost:4101");
  assert.equal(project.externalSnapshot.health.status, "degraded");
  assert.equal(project.approvals[0], "נדרש אישור או פתרון עבור: Database Schema");
  assert.equal(project.context.domain, "casino");
  assert.equal(project.state.integrations.casino.connected, true);
  assert.equal(project.state.product.hasAuth, true);
});

test("project service connects a project to git hosting and stores repo snapshot", async () => {
  const service = createProjectService();
  service.gitConnector = {
    fetchSnapshot: async () => ({
      provider: "github",
      repo: {
        fullName: "openai/nexus",
        defaultBranch: "main",
      },
      branches: [{ name: "main", protected: true, lastCommitSha: "abc123" }],
      commits: [{ sha: "abc123", title: "feat: add integration" }],
      pullRequests: [{ id: 14, title: "Add git sync", state: "open" }],
      diffs: [{ id: "pr-14", files: [{ path: "src/core/git-connector.js" }] }],
      syncedAt: "2026-01-01T00:00:00.000Z",
    }),
  };
  service.seedDemoProject();

  const project = await service.connectGitProject("giftwallet", {
    provider: "github",
    owner: "openai",
    repo: "nexus",
  });

  assert.equal(project.gitSource.provider, "github");
  assert.equal(project.gitSnapshot.repo.fullName, "openai/nexus");
  assert.equal(project.gitSnapshot.branches.length, 1);
  assert.equal(project.gitSnapshot.pullRequests[0].id, 14);
  assert.equal(project.overview.gitSummary.includes("openai/nexus"), true);
  assert.equal(project.state.integrations.git.connected, true);
  assert.equal(project.state.knowledge.git.repo, "openai/nexus");
});

test("project service syncs runtime sources into project state", async () => {
  const service = createProjectService();
  service.runtimeConnector = {
    fetchSnapshot: async () => ({
      syncedAt: "2026-01-01T00:00:00.000Z",
      ci: [{ provider: "github-actions", status: "failed", branch: "main" }],
      testResults: [{ suite: "unit", status: "failed" }],
      deployments: [{ environment: "staging", status: "degraded" }],
      errorLogs: [{ service: "api", count: 3 }],
      monitoring: [{ service: "api", status: "alert" }],
      analytics: { activeUsers: 120 },
      productMetrics: { activationRate: 0.42 },
    }),
  };
  service.seedDemoProject();

  const project = await service.syncRuntimeSources("giftwallet", {
    baseUrl: "http://runtime.local",
  });

  assert.equal(project.runtimeSource.baseUrl, "http://runtime.local");
  assert.equal(project.runtimeSnapshot.ci[0].status, "failed");
  assert.equal(project.runtimeSnapshot.errorLogs[0].count, 3);
  assert.equal(project.overview.runtimeSummary.includes("CI: failed"), true);
  assert.equal(project.state.integrations.runtime.connected, true);
  assert.equal(project.state.observed.health.status, "blocked");
});

test("project service syncs notion knowledge and reuses it in scan context", async () => {
  const service = createProjectService();
  service.notionConnector = {
    fetchSnapshot: async () => ({
      source: "notion",
      syncedAt: "2026-01-01T00:00:00.000Z",
      pages: [
        {
          id: "page-1",
          title: "Launch checklist",
          url: "https://notion.so/page-1",
          excerpt: "צריך: onboarding emails",
          missingSignals: ["onboarding emails"],
        },
      ],
    }),
  };
  service.seedDemoProject();

  const project = await service.syncNotionKnowledge("giftwallet", {
    apiKey: "secret",
    pageIds: ["page-1"],
  });

  assert.equal(project.notionSnapshot.pages.length, 1);
  assert.equal(project.notionSource.pageIds[0], "page-1");
  assert.equal(project.scan.knowledge.notionPages.length, 1);
  assert.equal(project.context.knowledge.notionPages.length, 1);
  assert.equal(project.state.integrations.notion.connected, true);
});

test("project service creates onboarding session for a new project draft", () => {
  const service = createProjectService();

  const session = service.createOnboardingSession({
    userId: "user-1",
    projectDraftId: "delivery-app",
    initialInput: {
      projectName: "Delivery App",
      visionText: "אפליקציה להזמנת שליחים בזמן אמת",
    },
  });

  assert.equal(session.userId, "user-1");
  assert.equal(session.projectDraftId, "delivery-app");
  assert.equal(session.currentStep, "review-intake");
  assert.equal(session.projectDraft.name, "Delivery App");
  assert.equal(session.projectDraft.goal, "אפליקציה להזמנת שליחים בזמן אמת");
  assert.equal(session.projectDraft.owner.userId, "user-1");
  assert.equal(session.projectDraft.creationSource, "onboarding-session");
  assert.equal(session.projectDraft.onboardingReadiness.canStartOnboarding, true);
  assert.equal(service.getOnboardingSession(session.sessionId)?.sessionId, session.sessionId);
});

test("project service creates project draft for authenticated user", () => {
  const service = createProjectService();

  service.signupUser({
    userInput: {
      email: "draft-user@example.com",
      displayName: "Draft User",
    },
    credentials: {
      password: "secret123",
    },
  });

  const result = service.createProjectDraft({
    userInput: {
      email: "draft-user@example.com",
    },
    projectCreationInput: {
      projectName: "Launch Studio",
      visionText: "מערכת עבודה ליוצרים",
      requestedDeliverables: ["auth", "growth"],
    },
  });

  assert.equal(result.projectDraftId, "launch-studio");
  assert.equal(result.projectDraft.id, "launch-studio");
  assert.equal(result.projectDraft.owner.email, "draft-user@example.com");
  assert.equal(result.projectDraft.onboardingReadiness.canStartOnboarding, true);
  assert.equal(result.projectCreationExperience.primaryAction.actionId, "create-first-project");
  assert.equal(result.projectCreationExperience.redirect.target, "onboarding");
  assert.equal(result.projectCreationRedirect.target, "onboarding");
  assert.equal(result.projectCreationRedirect.shouldCreateOnboardingSession, true);
});

test("project service creates structured intake from vision text files and links", () => {
  const service = createProjectService();

  const result = service.createProjectIntake({
    visionText: "שם הפרויקט: Delivery App\nאפליקציה עם התחברות, תשלומים ודף נחיתה",
    uploadedFiles: [
      {
        name: "product-spec.md",
        type: "markdown",
        content: "# Spec",
      },
      {
        name: "design-figma-link.txt",
        type: "text",
        content: "figma link",
      },
    ],
    externalLinks: ["https://github.com/example/delivery-app"],
  });

  assert.equal(result.projectIntake.projectName, "Delivery App");
  assert.equal(result.projectIntake.projectType, "mobile-app");
  assert.equal(result.projectIntake.uploadedFiles.length, 2);
  assert.equal(result.projectIntake.externalLinks.length, 1);
  assert.equal(result.parsedSignals.hasUploadedFiles, true);
  assert.equal(result.parsedSignals.hasExternalLinks, true);
  assert.equal(result.parsedSignals.requestedDeliverables.includes("auth"), true);
  assert.equal(result.parsedSignals.requestedDeliverables.includes("payments"), true);
  assert.equal(result.parsedSignals.requestedDeliverables.includes("growth"), true);
  assert.equal(result.parsedSignals.requestedDeliverables.includes("design-input"), true);
  assert.equal(result.parsedSignals.requestedDeliverables.includes("repo-link"), true);
  assert.equal(result.missingInputs.includes("supporting-material"), false);
});

test("project service resolves onboarding step from session and intake", () => {
  const service = createProjectService();

  const session = service.createOnboardingSession({
    userId: "user-2",
    projectDraftId: "blank-project",
    initialInput: "",
  });

  const intake = service.createProjectIntake({
    visionText: "אפליקציה לניהול משימות",
    uploadedFiles: [],
    externalLinks: [],
  });

  const resolved = service.resolveOnboardingStep({
    sessionId: session.sessionId,
    projectIntake: intake.projectIntake,
  });

  assert.equal(resolved.currentStep, "capture-missing-inputs");
  assert.equal(resolved.nextStep, "review-intake");
  assert.equal(resolved.requiredActions.includes("תן שם לפרויקט"), true);
  assert.equal(resolved.requiredActions.includes("העלה איפיון, קבצים או קישור חיצוני"), true);
  assert.equal(service.getOnboardingSession(session.sessionId)?.currentStep, "capture-missing-inputs");
});

test("project service handles onboarding commands for draft spec repo approvals and step advance", () => {
  const service = createProjectService();
  const session = service.createOnboardingSession({
    userId: "user-3",
    projectDraftId: "creator-app",
    initialInput: "",
  });

  service.handleOnboardingCommand({
    sessionId: session.sessionId,
    actionType: "create-project-draft",
    payload: {
      projectName: "Creator App",
      goal: "אפליקציה ליוצרים עם התחברות",
    },
  });

  service.handleOnboardingCommand({
    sessionId: session.sessionId,
    actionType: "upload-spec",
    payload: {
      visionText: "שם הפרויקט: Creator App\nאפליקציה ליוצרים עם התחברות ותשלומים",
      uploadedFiles: [{ name: "spec.md", type: "markdown", content: "# Spec" }],
      externalLinks: ["https://github.com/example/creator-app"],
    },
  });

  service.handleOnboardingCommand({
    sessionId: session.sessionId,
    actionType: "connect-repo",
    payload: {
      provider: "github",
      repoUrl: "https://github.com/example/creator-app",
      owner: "example",
      repo: "creator-app",
    },
  });

  service.handleOnboardingCommand({
    sessionId: session.sessionId,
    actionType: "approve-choice",
    payload: {
      choice: "אשר stack ראשוני",
    },
  });

  const result = service.handleOnboardingCommand({
    sessionId: session.sessionId,
    actionType: "advance-step",
    payload: {},
  });

  assert.equal(result.projectDraft.name, "Creator App");
  assert.equal(result.projectDraft.goal.includes("יוצרים"), true);
  assert.equal(result.updatedSession.projectIntake.projectType, "mobile-app");
  assert.equal(result.updatedSession.connectedSources.repo.provider, "github");
  assert.equal(result.updatedSession.approvals.includes("אשר stack ראשוני"), true);
  assert.equal(result.commandMetadata.actionType, "advance-step");
  assert.deepEqual(result.commandMetadata.actionSchema.requiredKeys, []);
  assert.equal(typeof result.updatedSession.currentStep, "string");
});

test("project service resolves onboarding actions from an explicit action registry", () => {
  const service = createProjectService();

  const draftAction = service.resolveOnboardingAction("create-project-draft", {
    projectName: "Creator App",
    goal: "אפליקציה ליוצרים",
  });
  const intakeAction = service.resolveOnboardingAction("upload-spec", {
    visionText: "שם הפרויקט: Creator App",
    uploadedFiles: [],
    externalLinks: [],
  });
  const approvalAction = service.resolveOnboardingAction("approve-choice", {
    choice: "אשר stack ראשוני",
  });
  const advanceAction = service.resolveOnboardingAction("advance-step", {});
  const repoAction = service.resolveOnboardingAction("connect-repo", {
    provider: "github",
  });
  const invalidRepoAction = service.resolveOnboardingAction("connect-repo", {});
  const missingAction = service.resolveOnboardingAction("missing-action", {});

  assert.equal(draftAction.resolvedHandler.handler.name, "bound createProjectDraftMutationHandler");
  assert.equal(draftAction.isValid, true);
  assert.equal(intakeAction.resolvedHandler.handler.name, "bound createIntakeUpdateHandler");
  assert.equal(intakeAction.isValid, true);
  assert.equal(approvalAction.resolvedHandler.handler.name, "bound createApprovalCaptureHandler");
  assert.equal(approvalAction.isValid, true);
  assert.equal(advanceAction.resolvedHandler.handler.name, "bound createOnboardingStepAdvancementHandler");
  assert.equal(advanceAction.isValid, true);
  assert.equal(repoAction.resolvedHandler.handler.name, "bound createRepoConnectionHandler");
  assert.deepEqual(repoAction.actionSchema.requiredKeys, ["provider"]);
  assert.equal(repoAction.isValid, true);
  assert.equal(invalidRepoAction.isValid, false);
  assert.equal(missingAction, null);
});

test("project service supports onboarding intake updates file uploads current step and finish", () => {
  const service = createProjectService();
  const session = service.createOnboardingSession({
    userId: "user-4",
    projectDraftId: "launch-app",
    initialInput: "",
  });

  const updated = service.updateOnboardingIntake({
    sessionId: session.sessionId,
    visionText: "שם הפרויקט: Launch App\nאפליקציה עם התחברות",
    uploadedFiles: [],
    externalLinks: [],
  });

  assert.equal(updated.updatedSession.projectDraft.name, "Launch App");

  const withFiles = service.uploadOnboardingFiles({
    sessionId: session.sessionId,
    uploadedFiles: [{ name: "spec.md", type: "markdown", content: "# Spec" }],
  });

  assert.equal(withFiles.updatedSession.projectIntake.uploadedFiles.length, 1);

  const step = service.getOnboardingCurrentStep(session.sessionId);
  assert.equal(typeof step.currentStep, "string");
  assert.equal(Array.isArray(step.requiredActions), true);

  const finished = service.finishOnboardingSession(session.sessionId);
  assert.equal(finished.updatedSession.status, "completed");
  assert.equal(finished.updatedSession.currentStep, "completed");
  assert.equal(finished.blocked, false);
  assert.equal(finished.onboardingCompletionDecision.isComplete, true);
  assert.equal(finished.onboardingStateHandoff.summary.canBuildProjectState, true);
  assert.equal(typeof finished.project?.id, "string");
  assert.equal(finished.project.id, "launch-app");
  assert.equal(finished.project.name, "Launch App");
  assert.equal(finished.project.goal, "שם הפרויקט: Launch App\nאפליקציה עם התחברות");
  assert.equal(typeof finished.project.state.projectIdentity?.identityId, "string");
  assert.equal(typeof finished.project.state.firstValueOutput?.outputId, "string");
  assert.equal(typeof finished.project.state.projectExplanation?.explanationId, "string");
  assert.equal(service.listProjects().some((project) => project.id === "launch-app"), true);
});

test("project service supports signup login and logout auth flows", () => {
  const service = createProjectService();

  const signedUp = service.signupUser({
    userInput: {
      email: "user@example.com",
      displayName: "User Example",
    },
    credentials: {
      password: "secret123",
    },
  });

  assert.equal(typeof signedUp.authPayload.userIdentity.userId, "string");
  assert.equal(signedUp.authPayload.authenticationState.isAuthenticated, true);
  assert.equal(typeof signedUp.authPayload.sessionState.sessionId, "string");
  assert.equal(typeof signedUp.authPayload.tokenBundle.accessToken, "string");
  assert.equal(signedUp.authPayload.authenticationRouteDecision.route, "workspace");
  assert.equal(signedUp.authPayload.verificationFlowState.status, "pending");
  assert.equal(signedUp.authPayload.authenticationViewState.activeScreen, "logout-redirect");
  assert.equal(signedUp.authPayload.postAuthRedirect.destination, "workbench");
  assert.equal(typeof signedUp.authPayload.workspaceModel.workspaceId, "string");
  assert.equal(signedUp.authPayload.membershipRecord.role, "owner");
  assert.equal(typeof signedUp.authPayload.credentialReference, "string");

  const loggedIn = service.loginUser({
    userInput: {
      email: "user@example.com",
    },
    credentials: {
      password: "secret123",
    },
  });

  assert.equal(loggedIn.authPayload.authenticationState.status, "authenticated");
  assert.equal(loggedIn.authPayload.sessionState.status, "active");
  assert.equal(loggedIn.authPayload.authenticationRouteDecision.route, "workspace");
  assert.equal(typeof loggedIn.authPayload.verificationFlowState.status, "string");
  assert.equal(loggedIn.authPayload.authenticationViewState.screens.logoutRedirect.enabled, true);
  assert.equal(loggedIn.authPayload.postAuthRedirect.destination, "workbench");

  const loggedOut = service.logoutUser({
    userInput: {
      email: "user@example.com",
    },
  });

  assert.equal(loggedOut.authPayload.authenticationState.status, "logged-out");
  assert.equal(loggedOut.authPayload.sessionState.status, "inactive");
  assert.equal(loggedOut.authPayload.authenticationRouteDecision.route, "login");
  assert.equal(loggedOut.authPayload.tokenBundle.accessToken, null);
  assert.equal(loggedOut.authPayload.authenticationViewState.activeScreen, "login");
  assert.equal(loggedOut.authPayload.postAuthRedirect.destination, "authentication");

  const verification = service.requestEmailVerification({
    userInput: {
      email: "user@example.com",
    },
  });

  assert.equal(verification.authPayload.verificationFlowState.flowType, "email-verification");
  assert.equal(verification.authPayload.verificationFlowState.status, "pending");
  assert.equal(typeof verification.authPayload.authenticationViewState.summary.nextAction, "string");
  assert.equal(typeof verification.authPayload.postAuthRedirect.destination, "string");

  const reset = service.requestPasswordReset({
    userInput: {
      email: "user@example.com",
    },
  });

  assert.equal(reset.authPayload.verificationFlowState.flowType, "password-reset");
  assert.equal(reset.authPayload.verificationFlowState.status, "pending");
  assert.equal(typeof reset.authPayload.authenticationViewState.screens.error.enabled, "boolean");
  assert.equal(typeof reset.authPayload.postAuthRedirect.destination, "string");

  const invite = service.inviteWorkspaceMember({
    userInput: {
      email: "user@example.com",
    },
    invitationRequest: {
      email: "teammate@example.com",
      role: "editor",
    },
  });

  assert.equal(invite.authPayload.invitationRecord.status, "pending");
  assert.equal(invite.authPayload.roleAssignment.role, "editor");

  const updatedSettings = service.updateWorkspaceSettings({
    userInput: {
      email: "user@example.com",
    },
    settingsInput: {
      policyProfile: "strict",
      teamPreferences: {
        notifications: "instant",
      },
    },
  });

  assert.equal(updatedSettings.authPayload.workspaceSettings.policyProfile, "strict");
  assert.equal(updatedSettings.authPayload.workspaceSettings.teamPreferences.notifications, "instant");
});

test("project service blocks onboarding finish when intake is incomplete instead of crashing", () => {
  const service = createProjectService();

  service.signupUser({
    userInput: {
      email: "blocked-finish@example.com",
      displayName: "Blocked Finish",
    },
    credentials: {
      password: "secret123",
    },
  });

  const draft = service.createProjectDraft({
    userInput: {
      email: "blocked-finish@example.com",
    },
    projectCreationInput: {
      projectName: "Blocked Finish",
    },
  });

  const session = service.createOnboardingSession({
    userId: "user-1",
    projectDraftId: draft.projectDraftId,
    initialInput: {
      projectName: "Blocked Finish",
    },
  });

  const finished = service.finishOnboardingSession(session.sessionId);

  assert.equal(finished.blocked, true);
  assert.equal(finished.error, "Onboarding is not ready to build project state");
  assert.equal(finished.onboardingCompletionDecision.isComplete, false);
  assert.equal(finished.onboardingStateHandoff.handoffStatus, "needs-clarification");
  assert.equal(service.listProjects().some((project) => project.id === draft.projectDraftId), false);
});

test("project service supports proposal editing and partial acceptance as real mutations", () => {
  const service = createProjectService();

  const signedUp = service.signupUser({
    userInput: {
      email: "mutation-flow@example.com",
      displayName: "Mutation Flow",
    },
    credentials: {
      password: "secret123",
    },
  });

  const draft = service.createProjectDraft({
    userInput: {
      email: "mutation-flow@example.com",
    },
    projectCreationInput: {
      projectName: "Mutation Flow",
      visionText: "מערכת שמקדמת הצעות עבודה עם אישור חלקי",
      requestedDeliverables: ["auth", "workflow"],
    },
  });

  const session = service.createOnboardingSession({
    userId: signedUp.authPayload.userIdentity.userId,
    projectDraftId: draft.projectDraftId,
    initialInput: {
      projectName: "Mutation Flow",
    },
  });

  service.updateOnboardingIntake({
    sessionId: session.sessionId,
    visionText: "שם הפרויקט: Mutation Flow\nאפליקציה עם התחברות, workbench ו־approval flow",
    uploadedFiles: [{ name: "spec.md", type: "markdown", content: "# Spec" }],
    externalLinks: [],
  });

  const finished = service.finishOnboardingSession(session.sessionId);
  assert.equal(finished.blocked, false);
  const projectId = finished.project.id;
  const editableProposal = finished.project.state.editableProposal;
  const firstSection = editableProposal.sections[0];
  const firstComponent = editableProposal.components[0];
  const firstCopy = editableProposal.copy[0];

  const edited = service.submitProposalEdits({
    projectId,
    userEditInput: {
      revisionNumber: 2,
      annotations: [
        {
          targetType: "section",
          targetId: firstSection.sectionId,
          note: "להדגיש יותר את שלב האישור",
          severity: "warning",
        },
      ],
      sectionEdits: [
        {
          sectionId: firstSection.sectionId,
          title: "Approval Handoff",
          body: "המסך צריך להבהיר מה יאושר ומה ימשיך לרגנרציה.",
        },
      ],
      nextActionEdit: {
        label: "אשר חלקית והמשך",
      },
    },
  });

  assert.equal(edited.state.editedProposal.revisionNumber, 2);
  assert.equal(edited.state.editedProposal.sections[0].title, "Approval Handoff");
  assert.equal(edited.state.editedProposal.annotations.length, 1);
  assert.equal(edited.state.proposalEditHistory.entries.length >= 3, true);

  const partial = service.submitPartialAcceptance({
    projectId,
    approvalOutcome: {
      sectionOutcomes: [
        {
          sectionId: firstSection.sectionId,
          decision: "approved",
          note: "החלק הזה טוב",
        },
      ],
      componentOutcomes: [
        {
          componentId: firstComponent.componentId,
          decision: "rejected",
          note: "צריך רגנרציה",
        },
      ],
      copyOutcomes: [
        {
          copyId: firstCopy.copyId,
          decision: "approved",
        },
      ],
    },
  });

  assert.equal(partial.state.partialAcceptanceDecision.status, "partially-accepted");
  assert.equal(partial.state.partialAcceptanceDecision.approvedSections[0].sectionId, firstSection.sectionId);
  assert.equal(partial.state.partialAcceptanceDecision.rejectedComponents[0].componentId, firstComponent.componentId);
  assert.equal(partial.state.remainingProposalScope.componentsNeedingRegeneration[0].componentId, firstComponent.componentId);
  assert.equal(partial.state.partialAcceptanceDecision.followUpAction, "regenerate-rejected-scope");
});

test("project service links verifies lists and unlinks external accounts", () => {
  const service = createProjectService();
  service.seedDemoProject();

  const linked = service.linkExternalAccount("giftwallet", {
    providerType: "hosting",
    userInput: {
      accountId: "vercel-team-1",
      authMode: "api-key",
      credentialValue: "super-secret-key",
      capabilities: ["deploy"],
    },
  });

  assert.equal(typeof linked.linkedAccountPayload.accountRecord.accountId, "string");
  assert.equal(typeof linked.linkedAccountPayload.credentialReference, "string");
  assert.equal(typeof linked.linkedAccountPayload.encryptedCredential?.ciphertext, "string");
  assert.equal(linked.linkedAccounts.length >= 1, true);

  const listed = service.listExternalAccounts("giftwallet");
  assert.equal(listed.linkedAccounts.length >= 1, true);

  const verified = service.verifyExternalAccount("giftwallet", {
    accountId: linked.linkedAccountPayload.accountRecord.accountId,
  });
  assert.equal(verified.verificationResult.isVerified, true);

  const removed = service.unlinkExternalAccount(
    "giftwallet",
    linked.linkedAccountPayload.accountRecord.accountId,
  );
  assert.equal(removed.removed, true);
});

test("project service returns release tracking payload", () => {
  const service = createProjectService();
  service.seedDemoProject();

  const project = service.getProject("giftwallet");
  const tracking = service.getReleaseTracking("giftwallet", project.state.releaseRun.releaseRunId);

  assert.equal(tracking.projectId, "giftwallet");
  assert.equal(typeof tracking.releaseRunId, "string");
  assert.equal(typeof tracking.releaseStatus?.status, "string");
  assert.equal(typeof tracking.releaseTimeline?.currentStatus, "string");
  assert.equal(typeof tracking.failureSummary?.status, "string");
  assert.equal(Array.isArray(tracking.followUpTasks), true);
});

test("project service returns diff preview payload", () => {
  const service = createProjectService();
  service.seedDemoProject();

  const project = service.getProject("giftwallet");
  const preview = service.getDiffPreview(
    "giftwallet",
    project.state.diffPreviewSchema.executionPlan.executionRequestId,
  );

  assert.equal(preview.projectId, "giftwallet");
  assert.equal(typeof preview.executionRequestId, "string");
  assert.equal(typeof preview.diffPreview?.headline, "string");
  assert.equal(typeof preview.impactSummary?.totalChanges, "number");
  assert.equal(Array.isArray(preview.riskFlags), true);
  assert.equal(typeof preview.diffPreviewSchema?.previewId, "string");
});

test("project service returns policy payload", () => {
  const service = createProjectService();
  service.seedDemoProject();

  const project = service.getProject("giftwallet");
  const payload = service.getPolicyPayload(
    "giftwallet",
    project.state.policyDecision.actionType,
  );

  assert.equal(payload.projectId, "giftwallet");
  assert.equal(typeof payload.actionType, "string");
  assert.equal(typeof payload.policyDecision?.decision, "string");
  assert.equal(typeof payload.policyTrace?.finalDecision, "string");
  assert.equal(typeof payload.enforcementResult?.decision, "string");
  assert.equal(typeof payload.actionPolicy?.id, "string");
  assert.equal(typeof payload.policySchema?.policySchemaId, "string");
});

test("project service lists approves rejects and revokes approval records", () => {
  const service = createProjectService();
  service.seedDemoProject();

  const listed = service.listApprovals("giftwallet");
  assert.equal(typeof listed.approvalPayload.approvalRequest?.approvalRequestId, "string");
  assert.equal(Array.isArray(listed.approvalPayload.approvalRecords), true);
  assert.equal(typeof listed.approvalPayload.sharedApprovalState?.sharedApprovalStateId, "string");

  const approved = service.captureApproval("giftwallet", {
    approvalRequestId: listed.approvalPayload.approvalRequest.approvalRequestId,
    userInput: {
      decision: "approved",
      actorId: "demo-user",
      actorRole: "owner",
      actorName: "Demo Owner",
      reason: "Approved for staging execution",
      expiresInHours: 6,
    },
  });
  assert.equal(approved.approvalPayload.approvalRecord.status, "approved");
  assert.equal(approved.approvalPayload.approvalStatus.status, "approved");
  assert.equal(approved.approvalPayload.sharedApprovalState.participantDecisions.some((participant) => participant.participantRole === "owner" && participant.decision === "approved"), true);
  const approvedProject = service.getProject("giftwallet");
  assert.equal(approvedProject.state.approvalStatus.status, "approved");
  assert.equal(approvedProject.state.approvalRequest.status, "approved");
  assert.equal(approvedProject.state.approvalExplanation.summary.requiresApproval, false);
  assert.notEqual(approvedProject.state.activeBottleneck?.blockerType, "approval-blocker");
  if (approvedProject.state.activeBottleneck?.summary?.isBlocking) {
    assert.notEqual(approvedProject.state.updatedBottleneckState.status, "cleared");
  }

  const rejected = service.captureApproval("giftwallet", {
    approvalRequestId: listed.approvalPayload.approvalRequest.approvalRequestId,
    userInput: {
      decision: "rejected",
      actorId: "demo-user",
      actorRole: "reviewer",
      actorName: "Risk Reviewer",
      reason: "Need more review",
    },
  });
  assert.equal(rejected.approvalPayload.approvalRecord.status, "rejected");
  assert.equal(rejected.approvalPayload.approvalStatus.status, "rejected");

  const revoked = service.revokeApproval("giftwallet", {
    approvalRequestId: listed.approvalPayload.approvalRequest.approvalRequestId,
    userInput: {
      actorId: "demo-user",
      reason: "Approval revoked",
    },
  });
  assert.equal(revoked.approvalPayload.approvalRecord.status, "revoked");
  assert.equal(revoked.approvalPayload.approvalStatus.status, "missing");
  assert.equal(Array.isArray(service.getProject("giftwallet").state.approvalAuditTrail?.entries), true);
});

test("project service keeps approval explanation availability aligned with approval blocker", () => {
  const service = createProjectService();
  service.seedDemoProject();

  const project = service.getProject("giftwallet");
  const whyApproval = project.state.explanationSchema?.explanationTypes?.find(
    (item) => item.explanationType === "why-approval",
  );

  assert.equal(project.state.activeBottleneck?.blockerType, "approval-blocker");
  assert.equal(whyApproval?.available, true);
  assert.equal(
    project.state.failureExplanation?.failedWhat,
    "הביצוע ממתין לאישור שלך לפני שאפשר להמשיך.",
  );
});

test("project service keeps recovery payload and follow up tasks aligned on approval blocker", () => {
  const service = createProjectService();
  service.seedDemoProject();

  const project = service.getProject("giftwallet");

  assert.equal(project.state.activeBottleneck?.blockerType, "approval-blocker");
  assert.equal(project.state.recoveryDecision?.decisionType, "ask-user");
  assert.equal(
    project.state.recoveryOptionsPayload?.attemptedRecovery?.actions?.[0]?.actionType,
    "request-approval",
  );
  assert.equal(project.state.followUpTasks?.[0]?.summary, "Open approval request");
  assert.deepEqual(project.state.followUpTasks?.[0]?.blockedBy, ["Approval"]);
  assert.doesNotMatch(
    project.state.followUpTasks?.[0]?.summary ?? "",
    /release blocker|אין כרגע חסם מרכזי/i,
  );
});

test("project service refreshes workspace handoff context from live blocker and explanation state", () => {
  const service = createProjectService();
  service.seedDemoProject();

  const listed = service.listApprovals("giftwallet");
  service.captureApproval("giftwallet", {
    approvalRequestId: listed.approvalPayload.approvalRequest.approvalRequestId,
    userInput: {
      decision: "approved",
      actorId: "demo-user",
      reason: "Approved for staging execution",
      expiresInHours: 6,
    },
  });

  const approvedProject = service.getProject("giftwallet");

  assert.equal(approvedProject.state.activeBottleneck?.blockerType, "release-blocker");
  assert.equal(
    approvedProject.state.workspaceNavigationModel?.handoffContext?.nextAction,
    approvedProject.state.projectExplanation?.nextAction?.selectedAction,
  );
  assert.equal(approvedProject.state.workspaceNavigationModel?.handoffContext?.releaseStatus, "blocked");
  assert.equal(
    approvedProject.state.workspaceNavigationModel?.handoffContext?.projectId,
    "giftwallet",
  );
  assert.match(
    approvedProject.state.workspaceNavigationModel?.handoffContext?.resumeToken ?? "",
    /^resume:giftwallet:project-brain:release-blocker$/,
  );
});

test("project service returns filtered project audit payload", () => {
  const service = createProjectService();
  service.seedDemoProject();

  const projectAuditPayload = service.getProjectAuditPayload("giftwallet", {
    actorId: "system",
  });

  assert.equal(projectAuditPayload.projectId, "giftwallet");
  assert.equal(Array.isArray(projectAuditPayload.entries), true);
  assert.equal(projectAuditPayload.summary.filtered, true);
});

test("project service updates live project presence from participant heartbeats", () => {
  const service = createProjectService();
  service.seedDemoProject();

  const project = service.updateProjectPresence({
    projectId: "giftwallet",
    presenceInput: {
      participantId: "session-1",
      sessionId: "session-1",
      userId: "user-1",
      displayName: "Owner",
      role: "owner",
      workspaceArea: "release-workspace",
      currentSurface: "release-workspace",
      currentTask: "review deploy",
    },
  });

  assert.equal(project.state.projectPresenceState.participants.length >= 1, true);
  assert.equal(project.state.projectPresenceState.participants[0].displayName, "Owner");
  assert.equal(project.state.projectPresenceState.participants[0].workspaceArea, "release-workspace");
  assert.equal(project.state.projectPresenceState.participants[0].currentTask, "review deploy");
  assert.equal(project.state.projectPresenceState.summary.latestSeenAt !== null, true);
});

test("project service stores contextual review thread discussions and rebuilds project state", () => {
  const service = createProjectService();
  service.seedDemoProject();

  const result = service.upsertProjectReviewThread({
    projectId: "giftwallet",
    threadInput: {
      threadType: "review-thread",
      title: "Review the payout copy",
      body: "Please validate the final diff before merge.",
      actor: {
        actorId: "user-1",
        displayName: "Owner",
      },
      contextTarget: {
        workspaceArea: "developer-workspace",
        resourceType: "diff",
        resourceId: "exec-1",
        filePath: "app/routes/payout.tsx",
      },
    },
  });

  assert.equal(result.reviewThreadState.threads.some((thread) => thread.title === "Review the payout copy"), true);
  assert.equal(result.reviewThreadRecord.messages[0].body, "Please validate the final diff before merge.");

  const filteredThreadState = service.getProjectReviewThreadState("giftwallet", {
    resourceType: "diff",
  });
  assert.equal(filteredThreadState.summary.filtered, true);
  assert.equal(filteredThreadState.threads.some((thread) => thread.contextTarget?.filePath === "app/routes/payout.tsx"), true);
});
