import test from "node:test";
import assert from "node:assert/strict";

import { buildProjectContext } from "../src/core/context-builder.js";

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
  assert.equal(typeof context.projectIdentity?.identityId, "string");
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
  assert.equal(typeof context.sessionState?.status, "string");
  assert.equal(typeof context.tokenBundle?.tokenType === "string" || context.tokenBundle?.tokenType === null, true);
  assert.equal(typeof context.verificationFlowState?.status, "string");
  assert.equal(Array.isArray(context.verificationFlowState?.nextActions), true);
  assert.equal(typeof context.workspaceModel?.workspaceId, "string");
  assert.equal(typeof context.membershipRecord?.membershipId, "string");
  assert.equal(Array.isArray(context.membershipRecord?.roles), true);
  assert.equal(typeof context.accessDecision?.decision, "string");
  assert.equal(typeof context.accessDecision?.canRun, "boolean");
  assert.equal(typeof context.invitationRecord?.status, "string");
  assert.equal(typeof context.roleAssignment?.status, "string");
  assert.equal(typeof context.workspaceSettings?.policyProfile, "string");
  assert.equal(typeof context.workspaceSettings?.teamPreferences?.notifications, "string");
  assert.equal(Array.isArray(context.userJourneys?.journeys), true);
  assert.equal(Array.isArray(context.journeySteps), true);
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
  assert.equal(typeof context.branchDiffActivityPanel?.panelId, "string");
  assert.equal(Array.isArray(context.branchDiffActivityPanel?.commits), true);
  assert.equal(Array.isArray(context.branchDiffActivityPanel?.pendingApprovals), true);
  assert.equal(typeof context.artifactBuildPanel?.panelId, "string");
  assert.equal(Array.isArray(context.artifactBuildPanel?.build?.artifacts), true);
  assert.equal(typeof context.artifactBuildPanel?.verification?.isValid, "boolean");
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
  assert.equal(typeof context.bootstrapStateUpdate?.bootstrap?.status, "string");
  assert.equal(typeof context.firstValueOutput?.outputId, "string");
  assert.equal(typeof context.firstValueOutput?.summary?.feelsReal, "boolean");
  assert.equal(Array.isArray(context.bootstrapExecutionGraph?.nodes), true);
  assert.equal(typeof context.executionProgressSchema?.status, "string");
  assert.equal(typeof context.executionProgressSchema?.progressPercent, "number");
  assert.equal(typeof context.normalizedProgressInputs?.hasRuntimeLogs, "boolean");
  assert.equal(Array.isArray(context.normalizedProgressInputs?.taskResults), true);
  assert.equal(typeof context.progressPhase, "string");
  assert.equal(typeof context.progressPercent, "number");
  assert.equal(typeof context.completionEstimate, "string");
  assert.equal(typeof context.progressState?.status, "string");
  assert.equal(typeof context.realityProgress?.realityProgressId, "string");
  assert.equal(Array.isArray(context.realityProgress?.signals), true);
  assert.equal(typeof context.firstValueSummary?.summaryId, "string");
  assert.equal(typeof context.firstValueSummary?.summary?.hasMomentum, "boolean");
  assert.equal(Array.isArray(context.formattedLogs), true);
  assert.equal(Array.isArray(context.userFacingMessages), true);
  assert.equal(typeof context.platformTrace?.traceId, "string");
  assert.equal(Array.isArray(context.platformLogs), true);
  assert.equal(typeof context.incidentAlert?.status, "string");
  assert.equal(typeof context.incidentAlert?.incidentCount, "number");
  assert.equal(typeof context.auditLogRecord?.auditLogId, "string");
  assert.equal(typeof context.auditLogRecord?.category, "string");
  assert.equal(typeof context.nexusPersistenceSchema?.schemaId, "string");
  assert.equal(typeof context.nexusPersistenceSchema?.summary?.totalEntities, "number");
  assert.equal(typeof context.migrationPlan?.migrationPlanId, "string");
  assert.equal(Array.isArray(context.migrationArtifacts?.files), true);
  assert.equal(Array.isArray(context.entityRepository), true);
  assert.equal(typeof context.entityRepository?.[0]?.repositoryId, "string");
  assert.equal(typeof context.storageRecord?.storageRecordId, "string");
  assert.equal(typeof context.storageRecord?.summary?.artifactCount, "number");
  assert.equal(typeof context.notificationPayload?.type, "string");
  assert.equal(typeof context.notificationEvent?.eventType, "string");
  assert.equal(typeof context.notificationEvent?.notificationEventId, "string");
  assert.equal(typeof context.notificationCenterState?.unreadCount, "number");
  assert.equal(Array.isArray(context.notificationCenterState?.inbox), true);
  assert.equal(typeof context.notificationPreferences?.frequency, "string");
  assert.equal(Array.isArray(context.notificationPreferences?.channels), true);
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
  assert.equal(Array.isArray(context.providerOperations), true);
  assert.equal(typeof context.providerOperations?.[0]?.operationType, "string");
  assert.equal(typeof context.providerConnector?.providerType, "string");
  assert.equal(Array.isArray(context.providerConnector?.operations), true);
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
});
