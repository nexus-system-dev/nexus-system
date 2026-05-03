import {
  createCanonicalProject,
  createCanonicalState,
  createDependency,
  createEvidence,
  createFlow,
  createGap,
  createRecommendedAction,
  createRisk,
  createSignal,
} from "./canonical-schema.js";
import { classifyProjectDomain } from "./domain-classifier.js";
import { buildBusinessContextLayer } from "./business-context-layer.js";
import { resolveBusinessBottleneck } from "./business-bottleneck-resolver.js";
import { createBootstrapPlanGenerator } from "./bootstrap-plan-generator.js";
import { createBootstrapDispatcher } from "./bootstrap-dispatcher.js";
import { defineBootstrapExecutionRequestSchema } from "./bootstrap-execution-request.js";
import { createBootstrapSurfaceResolver } from "./bootstrap-surface-resolver.js";
import { createBootstrapCommandPlanner } from "./bootstrap-command-planner.js";
import { createBootstrapExecutionInvoker } from "./bootstrap-execution-invoker.js";
import { createBootstrapArtifactCollector } from "./bootstrap-artifact-collector.js";
import { createBootstrapExecutionResultEnvelope } from "./bootstrap-execution-result-envelope.js";
import { createBootstrapValidationModule } from "./bootstrap-validation-module.js";
import { createBootstrapStateUpdater } from "./bootstrap-state-updater.js";
import { defineExecutionProgressSchema } from "./execution-progress-schema.js";
import { createBlockedTaskOutcomeCanonicalizer } from "./blocked-task-outcome-canonicalizer.js";
import { defineTaskExecutionMetricSchema } from "./task-execution-metric-schema.js";
import { createTaskExecutionTracker } from "./task-execution-tracker.js";
import { createTaskThroughputAggregator } from "./task-throughput-aggregator.js";
import { createBaselineEffortEstimator } from "./baseline-effort-estimator.js";
import { defineTimeSavedEstimationSchema } from "./time-saved-estimation-schema.js";
import { createTimeSavedCalculator } from "./time-saved-calculator.js";
import { createProductivitySummaryAggregator } from "./productivity-summary-aggregator.js";
import { defineOutcomeEvaluationSchema } from "./outcome-evaluation-schema.js";
import { createActionSuccessScoringEngine } from "./action-success-scoring-engine.js";
import { createOutcomeFeedbackLoop } from "./outcome-feedback-loop.js";
import { createGoalProgressEvaluator } from "./goal-progress-evaluator.js";
import { defineUserActivityEventSchema } from "./user-activity-event-schema.js";
import { createSessionActivityTracker } from "./session-activity-tracker.js";
import { createReturningUserResolver } from "./returning-user-resolver.js";
import { createReturnTomorrowContinuityResolver } from "./return-tomorrow-continuity-resolver.js";
import { createRetentionMetricsAggregator } from "./retention-metrics-aggregator.js";
import { createRetentionCurveAnalyzer } from "./retention-curve-analyzer.js";
import { createDurableUserActivitySessionHistory } from "./user-activity-session-history-store.js";
import { createRunProgressNormalizer } from "./run-progress-normalizer.js";
import { createProgressPhaseResolver } from "./progress-phase-resolver.js";
import { createProgressPercentageCalculator } from "./progress-percentage-calculator.js";
import { createCompletionEstimateCalculator } from "./completion-estimate-calculator.js";
import { createLiveProgressAssembler } from "./live-progress-assembler.js";
import { createLiveUpdateTransportLayer } from "./live-update-transport-layer.js";
import { createLiveLogStreamingModule } from "./live-log-streaming-module.js";
import { createReactiveWorkspaceRefreshModel } from "./reactive-workspace-refresh-model.js";
import { defineRealtimeEventStreamSchema } from "./realtime-event-stream-schema.js";
import { defineCollaborationEventSchema } from "./collaboration-event-schema.js";
import { createBaselineCollaborationEventAssembler } from "./baseline-collaboration-event-assembler.js";
import { createProjectPresenceModel } from "./project-presence-model.js";
import { createProjectCommentsAndReviewThreadsModule } from "./project-comments-review-threads-module.js";
import { createSharedApprovalFlowModel } from "./shared-approval-flow-model.js";
import { createCollaborationActivityFeed } from "./collaboration-activity-feed.js";
import { createBaselineCollaborationActivityHistoryAssembler } from "./baseline-collaboration-activity-history-assembler.js";
import { createCoreMessagingFramework } from "./core-messaging-framework.js";
import { createAudienceSpecificMessagingVariants } from "./audience-specific-messaging-variants.js";
import { createPersonaSpecificLandingVariantResolver } from "./persona-specific-landing-variant-resolver.js";
import { deriveActivationGoals } from "./activation-goals-helper.js";
import { createObjectionAndFaqMap } from "./objection-faq-map.js";
import { defineNexusWebsiteSchema } from "./nexus-website-schema.js";
import { createLandingPageInformationArchitecture } from "./landing-page-information-architecture.js";
import { createNexusWebsiteCopyPack } from "./nexus-website-copy-pack.js";
import { createWebsiteConversionFlow } from "./website-conversion-flow.js";
import { createWaitlistAndAccessRequestModule } from "./waitlist-access-request-module.js";
import { createWebsiteExperimentAndCtaTestLayer } from "./website-experiment-cta-test-layer.js";
import { createTrustProofBlockBuilder } from "./trust-proof-block-builder.js";
import { defineProductDeliveryModelSchema } from "./product-delivery-model-schema.js";
import { createPublicSiteAndAppBoundaryModel } from "./public-site-app-boundary-model.js";
import { createAccessModeResolver } from "./access-mode-resolver.js";
import { createPublicLandingAuthHandoffFlow } from "./public-landing-auth-handoff-flow.js";
import { createAppEntryGateResolver } from "./app-entry-gate-resolver.js";
import { createPostLoginDestinationResolver } from "./post-login-destination-resolver.js";
import { createFirstProjectKickoffFlow } from "./first-project-kickoff-flow.js";
import { createLandingToDashboardFunnelAssembler } from "./landing-to-dashboard-funnel-assembler.js";
import { createAppLandingEntryExperience } from "./app-landing-entry-experience.js";
import { createEntryStateVariantsAndRedirects } from "./entry-state-variants-redirects.js";
import { createEntryLoadingAndRecoveryStates } from "./entry-loading-recovery-states.js";
import { createAppEntryTrustAndOrientationPanel } from "./app-entry-trust-orientation-panel.js";
import { createEntryDecisionSupportFlow } from "./entry-decision-support-flow.js";
import { createRepositoryImportAndCodebaseDiagnosisBridge } from "./repository-import-codebase-diagnosis-bridge.js";
import { createLiveWebsiteIngestionFunnelDiagnosisModel } from "./live-website-ingestion-funnel-diagnosis-model.js";
import { createImportedAnalyticsNormalizationLayer } from "./imported-analytics-normalization-layer.js";
import { createImportedAssetTaskExtractionModule } from "./imported-asset-task-extraction-module.js";
import { createImportAndContinueRoadmapAssembler } from "./import-and-continue-roadmap-assembler.js";
import { defineActivationFunnelSchema } from "./activation-funnel-schema.js";
import { createFirstValueMilestoneMapper } from "./first-value-milestone-mapper.js";
import { createOnboardingMarketingCopyFlow } from "./onboarding-marketing-copy-flow.js";
import { createActivationDropOffDetector } from "./activation-drop-off-detector.js";
import { createReEngagementTriggerPlanner } from "./re-engagement-trigger-planner.js";
import { createNexusContentStrategyProfile } from "./nexus-content-strategy-profile.js";
import { createLaunchContentCalendar } from "./launch-content-calendar.js";
import { createFounderAndProductStoryAssetBuilder } from "./founder-product-story-asset-builder.js";
import { createSocialAndCommunityContentPack } from "./social-community-content-pack.js";
import { createProductDemoAndProofAssetPlan } from "./product-demo-proof-asset-plan.js";
import { createNexusLaunchCampaignBrief } from "./nexus-launch-campaign-brief.js";
import { createLaunchChannelRolloutPlan } from "./launch-channel-rollout-plan.js";
import { createLaunchAssetReadinessChecklist } from "./launch-asset-readiness-checklist.js";
import { createLaunchDraftPublishingPlan } from "./launch-draft-publishing-plan.js";
import { createLaunchFeedbackIntakeModule } from "./launch-feedback-intake-module.js";
import { createGoToMarketPlanningModel } from "./go-to-market-planning-model.js";
import { createPromotionExecutionPlanner } from "./promotion-execution-planner.js";
import { createLaunchMarketingExecutionTracker } from "./launch-marketing-execution-tracker.js";
import { defineGtmMetricSchema } from "./gtm-metric-schema.js";
import { createAcquisitionSourceTracker } from "./acquisition-source-tracker.js";
import { createWebsiteToActivationFunnelAnalyzer } from "./website-to-activation-funnel-analyzer.js";
import { createLaunchPerformanceDashboardAssembler } from "./launch-performance-dashboard-assembler.js";
import { createGtmOptimizationLoop } from "./gtm-optimization-loop.js";
import { createFirstTouchAttributionRecorder } from "./first-touch-attribution-recorder.js";
import { createPreAuthConversionEventCollector } from "./pre-auth-conversion-event-collector.js";
import { createConversionAnalyticsModel } from "./conversion-analytics-model.js";
import { createGrowthLoopManagementState } from "./growth-loop-management-state.js";
import { defineOwnerControlPlaneSchema } from "./owner-control-plane-schema.js";
import { createOwnerControlCenter } from "./owner-control-center.js";
import { createDailyOverviewGenerator } from "./daily-overview-generator.js";
import { createOwnerPriorityEngine } from "./owner-priority-engine.js";
import { createActionRecommendationSystem } from "./action-recommendation-system.js";
import { createOwnerDecisionDashboard } from "./owner-decision-dashboard.js";
import { createDailyWorkflowGenerator } from "./daily-workflow-generator.js";
import { createFocusAreaSelector } from "./focus-area-selector.js";
import { createTaskRecommendationEngine } from "./task-recommendation-engine.js";
import { createOwnerRoutineAssistant } from "./owner-routine-assistant.js";
import { createProductIterationFeedbackEngine } from "./product-iteration-feedback-engine.js";
import { createRevenueTrackingSystem } from "./revenue-tracking-system.js";
import { createCostTrackingSystem } from "./cost-tracking-system.js";
import { createProfitMarginAnalyzer } from "./profit-margin-analyzer.js";
import { createUnitEconomicsDashboard } from "./unit-economics-dashboard.js";
import { createCashFlowProjectionEngine } from "./cash-flow-projection-engine.js";
import { createUserAnalyticsDashboard } from "./user-analytics-dashboard.js";
import { createFeatureUsageTracker } from "./feature-usage-tracker.js";
import { createDecisionAccuracyTracker } from "./decision-accuracy-tracker.js";
import { createAutomationImpactTracker } from "./automation-impact-tracker.js";
import { createSystemRoadmapTracker } from "./system-roadmap-tracker.js";
import { createOperationsSignalAggregator } from "./operations-signal-aggregator.js";
import { createCriticalAlertPrioritizer } from "./critical-alert-prioritizer.js";
import { createNoiseSuppressionSystem } from "./noise-suppression-system.js";
import { createIncidentDetectionSystem } from "./incident-detection-system.js";
import { createOutageResponseManager } from "./outage-response-manager.js";
import { createIncidentTimelineTracker } from "./incident-timeline-tracker.js";
import { createRootCauseAnalysisSystem } from "./root-cause-analysis-system.js";
import { createLiveProjectMonitoringModel } from "./live-project-monitoring-model.js";
import { createMaintenanceTaskGenerationEngine } from "./maintenance-task-generation-engine.js";
import { createServiceReliabilityDashboardModel } from "./service-reliability-dashboard-model.js";
import { defineProductBoundarySchema } from "./product-boundary-schema.js";
import { createCapabilityPromiseAndLimitMap } from "./capability-promise-limit-map.js";
import { createBoundaryDisclosureAndExpectationModel } from "./boundary-disclosure-expectation-model.js";
import { defineSystemCapabilityRegistrySchema } from "./system-capability-registry-schema.js";
import { defineExternalCapabilityRegistrySchema } from "./external-capability-registry-schema.js";
import { createSourceControlIntegrationBinder } from "./source-control-integration-binder.js";
import { createSecretResolutionModule } from "./secret-resolution-module.js";
import { createConnectorCredentialBindingResolver } from "./connector-credential-binding-resolver.js";
import { createInboundProviderWebhookIngestionGateway } from "./inbound-provider-webhook-ingestion-gateway.js";
import { defineExecutionActionRoutingSchema } from "./execution-action-routing-schema.js";
import { createActionToProviderMappingResolver } from "./action-to-provider-mapping-resolver.js";
import { createSystemCapabilityResolver } from "./system-capability-resolver.js";
import { createExistingBusinessAssetNormalizationLayer } from "./existing-business-asset-normalization-layer.js";
import { createAtomicExternalActionEnvelope } from "./atomic-external-action-envelope.js";
import { createExternalExecutionDispatchModule } from "./external-execution-dispatch-module.js";
import { createExecutionConsistencyValidator } from "./execution-consistency-validator.js";
import { createProductCtaStrategy } from "./product-cta-strategy.js";
import { createExecutionLogFormatter } from "./execution-log-formatter.js";
import { createExecutionCompletionNotifier } from "./execution-completion-notifier.js";
import { createPlatformLoggingAndTracingLayer } from "./platform-logging-tracing-layer.js";
import { createAlertingAndIncidentHooks } from "./alerting-incident-hooks.js";
import { createSystemBottleneckDetector } from "./system-bottleneck-detector.js";
import { createAuditLogForSystemActions } from "./system-audit-log.js";
import { createSecurityAuditEventLogger } from "./security-audit-event-logger.js";
import { defineProjectAuditEventSchema } from "./project-audit-event-schema.js";
import { createProjectAuditEventCollector } from "./project-audit-event-collector.js";
import { createProjectAuditApiAndViewerModel } from "./project-audit-api-viewer-model.js";
import { createOwnerAuditLogViewer } from "./owner-audit-log-viewer.js";
import { createSystemWideActivityTracker } from "./system-wide-activity-tracker.js";
import { createCriticalChangeHistorySystem } from "./critical-change-history-system.js";
import { createMilestoneTrackingSystem } from "./milestone-tracking-system.js";
import { definePostExecutionEvaluationSchema } from "./post-execution-evaluation-schema.js";
import { createPostExecutionEvaluationPipeline } from "./post-execution-evaluation-pipeline.js";
import { createCrossLayerFeedbackOrchestrator } from "./cross-layer-feedback-orchestrator.js";
import { createAdaptiveExecutionLoop } from "./adaptive-execution-loop.js";
import { createSystemOptimizationCycle } from "./system-optimization-cycle.js";
import { createCanonicalBacklogRegenerationBridge } from "./canonical-backlog-regeneration-bridge.js";
import { loadWave3CanonicalTaskInventory } from "./wave3-canonical-task-inventory-source.js";
import { defineNotificationEventSchema } from "./notification-event-schema.js";
import { createInAppNotificationCenter } from "./in-app-notification-center.js";
import { createEmailNotificationDeliveryModule } from "./email-notification-delivery-module.js";
import { createNotificationPreferenceSettings } from "./notification-preference-settings.js";
import { createWebhookExternalNotificationAdapter } from "./webhook-external-notification-adapter.js";
import { createReleasePlanGenerator } from "./release-plan-generator.js";
import { defineReleaseRequirementsSchema } from "./release-requirements-schema.js";
import { createApprovalReadinessValidator } from "./approval-readiness-validator.js";
import { createApprovalRecordStore } from "./approval-record-store.js";
import { createApprovalStatusResolver } from "./approval-status-resolver.js";
import { createApprovalGatingModule } from "./approval-gating-module.js";
import { createApprovalAuditFormatter } from "./approval-audit-formatter.js";
import { createActionPolicyRegistry } from "./action-policy-registry.js";
import { createCredentialUsagePolicy } from "./credential-usage-policy.js";
import { createCodeChangePolicyChecks } from "./code-change-policy-checks.js";
import { createDeployPolicyChecks } from "./deploy-policy-checks.js";
import { createPolicyEnforcementGuard } from "./policy-enforcement-guard.js";
import { createPolicyTraceBuilder } from "./policy-trace-builder.js";
import { createExecutionPolicyEvaluator } from "./execution-policy-evaluator.js";
import { definePolicySchema } from "./policy-schema.js";
import { defineAgentGovernancePolicySchema } from "./agent-governance-policy-schema.js";
import { createAgentSandboxPolicyResolver } from "./agent-sandbox-policy-resolver.js";
import { createAgentActionLimitGuard } from "./agent-action-limit-guard.js";
import { createAgentGovernanceTrace } from "./agent-governance-trace.js";
import { defineProjectDraftSchema } from "./project-draft-schema.js";
import { defineDiffPreviewSchema } from "./diff-preview-schema.js";
import { createCodeDiffCollector } from "./code-diff-collector.js";
import { createConfigInfraDiffCollector } from "./config-infra-diff-collector.js";
import { createDiffImpactSummarizer } from "./diff-impact-summarizer.js";
import { createMigrationDiffCollector } from "./migration-diff-collector.js";
import { createUserFacingDiffPreviewAssembler } from "./user-facing-diff-preview-assembler.js";
import { defineApprovalRequestSchema } from "./approval-request-schema.js";
import { createApprovalRuleRegistry } from "./approval-rule-registry.js";
import { createApprovalTriggerResolver } from "./approval-trigger-resolver.js";
import { createArtifactReadinessValidator } from "./artifact-readiness-validator.js";
import { createArtifactRegistryModule } from "./artifact-registry-module.js";
import { createAccountVerificationModule } from "./account-verification-module.js";
import { createAuthenticationModeContract } from "./authentication-mode-contract.js";
import { buildAuthenticationScreenStates } from "./authentication-screen-states.js";
import { createPostAuthRedirectResolver } from "./post-auth-redirect-resolver.js";
import { createProjectCreationExperienceModel } from "./project-creation-experience-model.js";
import { createPostProjectCreationRedirectResolver } from "./post-project-creation-redirect-resolver.js";
import { defineNexusAppShellSchema } from "./nexus-app-shell-schema.js";
import { createAuthenticatedAppShellModel } from "./authenticated-app-shell-model.js";
import { createNexusNavigationAndRouteSurfaceBinder } from "./nexus-navigation-route-surface-binder.js";
import { createDashboardHomeSurfaceModel } from "./dashboard-home-surface-model.js";
import { createUnifiedHomeDashboardModel } from "./unified-home-dashboard-model.js";
import { createTodayPrioritiesAndNextActionFeed } from "./today-priorities-next-action-feed.js";
import { createOwnerVisibilityStripForHomeDashboard } from "./owner-visibility-strip.js";
import { createDailyWorkspaceSurfaceModel } from "./daily-workspace-surface-model.js";
import { createGuidedTaskExecutionSurface } from "./guided-task-execution-surface.js";
import { createTaskStepFlowAndProgressBinder } from "./task-step-flow-progress-binder.js";
import { createTaskApprovalHandoffPanel } from "./task-approval-handoff-panel.js";
import { createSettingsAndProfileSurfaceModel } from "./settings-profile-surface-model.js";
import { createAiControlCenterAndGeneratedSurfaceDeliveryBinder } from "./ai-control-center-generated-surface-delivery-binder.js";
import { createAiDesignService } from "./ai-design-service.js";
import { createAiDesignExecutionHook } from "./ai-design-execution-hook.js";
import { createRenderableDesignProposalNormalizer } from "./renderable-design-proposal-normalizer.js";
import { createDesignProposalValidationFlow } from "./design-proposal-validation-flow.js";
import { createDesignProposalPreviewPipeline } from "./design-proposal-preview-pipeline.js";
import { createScreenProposalDiffModel } from "./screen-proposal-diff-model.js";
import { createDesignProposalReviewHandoff } from "./design-proposal-review-handoff.js";
import { createDesignProposalEditApplyBinder } from "./design-proposal-edit-apply-binder.js";
import { createDesignProposalStateIntegration } from "./design-proposal-state-integration.js";
import { createOnboardingProgressModel } from "./onboarding-progress-model.js";
import { buildOnboardingScreenFlow } from "./onboarding-screen-flow.js";
import { createOnboardingCompletionEvaluator } from "./onboarding-completion-evaluator.js";
import { createOnboardingToStateHandoffContract } from "./onboarding-to-state-handoff-contract.js";
import { defineProjectPermissionSchema } from "./project-permission-schema.js";
import { createProjectRoleCapabilityMatrix } from "./project-role-capability-matrix.js";
import { createActionLevelProjectAuthorizationResolver } from "./action-level-project-authorization-resolver.js";
import { createPrivilegedActionAuthorityResolver } from "./privileged-action-authority-resolver.js";
import { defineTenantIsolationSchema } from "./tenant-isolation-schema.js";
import { createWorkspaceIsolationGuard } from "./workspace-isolation-guard.js";
import { createCrossTenantLeakDetector } from "./cross-tenant-leak-detector.js";
import { createBaselineTenantBoundaryEvidenceAssembler } from "./baseline-tenant-boundary-evidence-assembler.js";
import { defineReliabilityAndSlaSchema } from "./reliability-sla-model.js";
import { defineFeatureFlagSchema } from "./feature-flag-schema.js";
import { createFeatureFlagResolver } from "./feature-flag-resolver.js";
import { createEmergencyKillSwitchGuard } from "./emergency-kill-switch-guard.js";
import { defineDataPrivacyClassificationSchema } from "./data-privacy-classification-schema.js";
import { definePlatformUsageCostSchema } from "./platform-usage-cost-schema.js";
import { createAiUsageMeter } from "./ai-usage-meter.js";
import { createWorkspaceComputeUsageTracker } from "./workspace-compute-usage-tracker.js";
import { createPrivacyRetentionAndDeletionPolicyResolver } from "./privacy-retention-and-deletion-policy-resolver.js";
import { createStorageAndArtifactCostTracker } from "./storage-and-artifact-cost-tracker.js";
import { createBuildDeployCostTracker } from "./build-deploy-cost-tracker.js";
import { createCostSummaryAggregator } from "./cost-summary-aggregator.js";
import { createUsageToBillingMapper } from "./usage-to-billing-mapper.js";
import { createUsageBudgetGuard } from "./usage-budget-guard.js";
import { createCostVisibilityApiModel } from "./cost-visibility-api-model.js";
import { createCostAwareActionSelector } from "./cost-aware-action-selector.js";
import { createWorkspaceOperatingModeResolver } from "./workspace-operating-mode-resolver.js";
import { createReasonableUsagePolicyResolver } from "./reasonable-usage-policy-resolver.js";
import { createBillingEnforcementGuard } from "./billing-enforcement-guard.js";
import { createBillingSettingsModel } from "./billing-settings-model.js";
import { defineBillingPlanSchema } from "./billing-plan-schema.js";
import { resolveEntitlementDecision } from "./entitlement-decision-resolver.js";
import { createWorkspaceBillingStateSource } from "./workspace-billing-state-source.js";
import { createPayingUserTracker } from "./paying-user-tracker.js";
import { createRevenueSummaryAggregator } from "./revenue-summary-aggregator.js";
import { createSubscriptionLifecycle } from "./subscription-lifecycle-module.js";
import { createComplianceConsentAndLegalBasisRegistry } from "./compliance-consent-and-legal-basis-registry.js";
import { createComplianceAuditSummary } from "./compliance-audit-summary.js";
import { defineInitialProjectStateCreationContract } from "./initial-project-state-creation-contract.js";
import { defineCanonicalInitialProjectStateSchema } from "./initial-project-state-schema.js";
import { createOnboardingToStateTransformationMapper } from "./onboarding-to-state-transformation-mapper.js";
import { createProjectStateBootstrapService } from "./project-state-bootstrap-service.js";
import { createInitialProjectStateValidationModule } from "./initial-project-state-validation-module.js";
import { createInitialTaskSeedingService } from "./initial-task-seeding-service.js";
import { createNextTaskSelectionResolver } from "./next-task-selection-resolver.js";
import { createNextTaskPresentationModel } from "./next-task-presentation-model.js";
import { createNextTaskApprovalHandoffPanel } from "./next-task-approval-handoff-panel.js";
import { createRecommendationDisplayContract } from "./recommendation-display-contract.js";
import { createRecommendationSummaryPanel } from "./recommendation-summary-panel.js";
import { createCockpitRecommendationSurface } from "./cockpit-recommendation-surface.js";
import { createBuildTargetResolver } from "./build-target-resolver.js";
import { createBlockingIssuesClassifier } from "./blocking-issues-classifier.js";
import { createDeploymentArtifactPreparer } from "./deployment-artifact-preparer.js";
import { defineDeploymentRequestSchema } from "./deployment-request-schema.js";
import { createDeploymentProviderResolver } from "./deployment-provider-resolver.js";
import { createExternalAccountRegistry } from "./external-account-registry.js";
import { createHostingProviderAdapterContract } from "./hosting-provider-adapter-contract.js";
import { createMetadataReadinessValidator } from "./metadata-readiness-validator.js";
import { createPackageFormatResolver } from "./package-format-resolver.js";
import { createPackageAssembler } from "./package-assembler.js";
import { createPackagingResultEnvelope } from "./packaging-result-envelope.js";
import { createPackageVerificationModule } from "./package-verification-module.js";
import { createPackagingManifestBuilder } from "./packaging-manifest-builder.js";
import { definePackagingRequirementsSchema } from "./packaging-requirements-schema.js";
import { createOwnerConsentRecorder } from "./owner-consent-recorder.js";
import { createOwnershipAwareReleaseGuard } from "./ownership-aware-release-guard.js";
import { createOwnershipPolicyModel } from "./ownership-policy-model.js";
import { createUserAgentOwnershipMappingModel } from "./user-agent-ownership-mapping-model.js";
import { createHumanUserProductivityResolver } from "./human-user-productivity-resolver.js";
import { createCredentialVaultInterface } from "./credential-vault-interface.js";
import { createProviderCapabilityDescriptor } from "./provider-capability-descriptor.js";
import { createProviderConnectorAssembler } from "./provider-connector-assembler.js";
import { defineProviderConnectorSchema } from "./provider-connector-schema.js";
import { createProviderConnectorContract } from "./provider-connector-contract.js";
import { defineProviderDegradationSchema } from "./provider-degradation-schema.js";
import { createProviderCircuitBreakerResolver } from "./provider-circuit-breaker-resolver.js";
import { createProviderRecoveryProbeFlow } from "./provider-recovery-probe-flow.js";
import { createExternalProviderHealthFailoverOrchestrator } from "./external-provider-health-failover-orchestrator.js";
import { createDesignToolImportAdapter } from "./design-tool-import-adapter.js";
import { createProviderOperationContract } from "./provider-operation-contract.js";
import { createProviderSessionFactory } from "./provider-session-factory.js";
import { createReleaseValidationAssembler } from "./release-validation-assembler.js";
import { createReleaseStatusStateModel } from "./release-status-state-model.js";
import { createReleaseStateUpdater } from "./release-state-updater.js";
import { createReleaseTimelineBuilder } from "./release-timeline-builder.js";
import { createStoreAndProviderStatusPollers } from "./store-provider-status-pollers.js";
import { createVersioningService } from "./versioning-service.js";
import { defineProjectStateSnapshotSchema } from "./project-state-snapshot-schema.js";
import { createProjectSnapshotStore } from "./project-snapshot-store.js";
import { createStateDiffAndCompareModule } from "./state-diff-compare-module.js";
import { createProjectStateRestoreResolver } from "./project-state-restore-resolver.js";
import { createProjectRollbackExecutionModule } from "./project-rollback-execution-module.js";
import { createActorActionTraceAssembler } from "./actor-action-trace-assembler.js";
import { createRejectionAndFailureMapper } from "./rejection-failure-mapper.js";
import { defineFailureRecoverySchema } from "./failure-recovery-schema.js";
import { createRetryPolicyResolver } from "./retry-policy-resolver.js";
import { createFallbackStrategyResolver } from "./fallback-strategy-resolver.js";
import { createRollbackScopePlanner } from "./rollback-scope-planner.js";
import { createRecoveryOrchestrationModule } from "./recovery-orchestration-module.js";
import { createUserFacingRecoveryOptionsAssembler } from "./user-facing-recovery-options-assembler.js";
import { defineBottleneckSchema } from "./bottleneck-schema.js";
import { createActiveBottleneckResolver } from "./active-bottleneck-resolver.js";
import { createBottleneckPriorityScorer } from "./bottleneck-priority-scorer.js";
import { createUnblockPathGenerator } from "./unblock-path-generator.js";
import { createBottleneckStateUpdater } from "./bottleneck-state-updater.js";
import { defineExplanationSchema } from "./explanation-schema.js";
import { createNextActionExplanationBuilder } from "./next-action-explanation-builder.js";
import { createFailureExplanationBuilder } from "./failure-explanation-builder.js";
import { createApprovalExplanationBuilder } from "./approval-explanation-builder.js";
import { createExecutionChangeExplanationBuilder } from "./execution-change-explanation-builder.js";
import { createExplanationAssembler } from "./explanation-assembler.js";
import { createFirstTangibleOutcomeGenerator } from "./first-tangible-outcome-generator.js";
import { createProgressToRealityMapper } from "./progress-to-reality-mapper.js";
import { createFirstValueSummaryAssembler } from "./first-value-summary-assembler.js";
import { defineProjectIdentitySchema } from "./project-identity-schema.js";
import { defineNexusPositioningSchema } from "./nexus-positioning-schema.js";
import { createProjectIdentityAssembler } from "./project-identity-assembler.js";
import { createInstantValueOutputResolver } from "./instant-value-output-resolver.js";
import { defineV1AcceptanceScenarioSchema } from "./v1-acceptance-scenario-schema.js";
import { createOnboardingToFirstValueAcceptanceTest } from "./onboarding-to-first-value-acceptance-test.js";
import { createExecutionToStateUpdateAcceptanceTest } from "./execution-to-state-update-acceptance-test.js";
import { createFailureRecoveryAcceptanceTest } from "./failure-recovery-acceptance-test.js";
import { createApprovalExplanationAcceptanceTest } from "./approval-explanation-acceptance-test.js";
import { createWorkspaceContinuityAcceptanceTest } from "./workspace-continuity-acceptance-test.js";
import { buildCrossFunctionalTaskGraph } from "./cross-functional-task-graph.js";
import { buildDecisionIntelligenceLayer } from "./decision-intelligence-layer.js";
import { createRecommendedDefaults, createStackRecommendationModule } from "./defaults-rule-engine.js";
import { buildGrowthMarketingPlanner } from "./growth-marketing-planner.js";
import { definePrimaryUserJourneys } from "./primary-user-journeys.js";
import { createJourneyMap } from "./journey-map.js";
import { defineScreenInventory } from "./screen-inventory.js";
import { createScreenToFlowMapping } from "./screen-flow-map.js";
import { defineScreenContractSchema } from "./screen-contract-schema.js";
import { createGoalAndCtaDefinitionModule } from "./screen-goal-cta.js";
import { createMobileReadinessChecklist } from "./mobile-readiness-checklist.js";
import { createLoadingEmptyErrorStatesDefinition } from "./loading-empty-error-states-definition.js";
import { createScreenValidationChecklist } from "./screen-validation-checklist.js";
import { defineDesignTokenSchema } from "./design-token-schema.js";
import { createTypographySystem } from "./typography-system.js";
import { createSpacingAndLayoutSystem } from "./spacing-layout-system.js";
import { createColorUsageRules } from "./color-usage-rules.js";
import { createInteractionStatesSystem } from "./interaction-states-system.js";
import { defineComponentContractSchema } from "./component-contract-schema.js";
import { createPrimitiveComponents } from "./primitive-components.js";
import { createLayoutComponents } from "./layout-components.js";
import { createFeedbackComponents } from "./feedback-components.js";
import { createNavigationComponents } from "./navigation-components.js";
import { createDataDisplayComponents } from "./data-display-components.js";
import { defineScreenTemplateSchema } from "./screen-template-schema.js";
import { createDashboardTemplate } from "./dashboard-template.js";
import { createDetailPageTemplate } from "./detail-page-template.js";
import { createWorkflowTemplate } from "./workflow-template.js";
import { createManagementTemplate } from "./management-template.js";
import { createStateDrivenTemplateVariants } from "./state-driven-template-variants.js";
import { createPrimaryActionValidator } from "./primary-action-validator.js";
import { createMobileUsabilityValidator } from "./mobile-usability-validator.js";
import { createStateCoverageValidator } from "./state-coverage-validator.js";
import { createConsistencyValidator } from "./consistency-validator.js";
import { createScreenReviewAssembler } from "./screen-review-assembler.js";
import { createBaselineLearningInsightsAssembler } from "./baseline-learning-insights-assembler.js";
import { createBaselineUserPreferenceProfileAssembler } from "./baseline-user-preference-profile-assembler.js";
import { defineLearningInsightUiSchema } from "./learning-insight-ui-schema.js";
import { createRecommendationReasoningPanelContract } from "./recommendation-reasoning-panel-contract.js";
import { createPatternConfidenceIndicator } from "./pattern-confidence-indicator.js";
import { createUserPreferenceSignalView } from "./user-preference-signal-view.js";
import { createCrossProjectPatternDisclosurePanel } from "./cross-project-pattern-disclosure-panel.js";
import { createPassiveLearningDisclosureBanner } from "./passive-learning-disclosure-banner.js";
import { createAiLearningWorkspaceTemplate } from "./ai-learning-workspace-template.js";
import { defineContextRelevanceSchema } from "./context-relevance-schema.js";
import { createContextRelevanceFilter } from "./context-relevance-filter.js";
import { createContextSlimmingPipeline } from "./context-slimming-pipeline.js";
import { defineEditableProposalSchema } from "./editable-proposal-schema.js";
import { createProposalEditingSystem } from "./proposal-editing-system.js";
import { createPartialAcceptanceFlow } from "./partial-acceptance-flow.js";
import { createBaselineApprovalOutcomeSchema } from "./baseline-approval-outcome-schema.js";
import { createCompanionStateModel } from "./companion-state-model.js";
import { defineAiCompanionPresenceSchema } from "./ai-companion-presence-schema.js";
import { createCompanionTriggerPolicy } from "./companion-trigger-policy.js";
import { createCompanionMessagePriorityResolver } from "./companion-message-priority-resolver.js";
import { createCompanionDockAndPanelContract } from "./companion-dock-panel-contract.js";
import { createCompanionAnimationStateRules } from "./companion-animation-state-rules.js";
import { createCompanionModeControls } from "./companion-mode-controls.js";
import { createCompanionInterruptionGuard } from "./companion-interruption-guard.js";
import { createAiCompanionWorkspaceTemplate } from "./ai-companion-workspace-template.js";
import { defineDeveloperWorkspaceSchema } from "./developer-workspace-schema.js";
import { createProjectWorkbenchLayout } from "./project-workbench-layout.js";
import { createFileTreeAndEditorContract } from "./file-tree-editor-contract.js";
import { createTerminalAndCommandConsoleView } from "./command-console-view.js";
import { createBranchAndDiffActivityPanel } from "./branch-diff-activity-panel.js";
import { createArtifactAndBuildLogPanel } from "./artifact-build-log-panel.js";
import { createDevelopmentWorkspace } from "./development-workspace.js";
import { createProjectBrainWorkspace } from "./project-brain-workspace.js";
import { createReleaseWorkspace } from "./release-workspace.js";
import { createGrowthWorkspace } from "./growth-workspace.js";
import { createCrossWorkspaceNavigationModel } from "./cross-workspace-navigation-model.js";
import { defineExecutionTopologySchema } from "./execution-topology-schema.js";
import { createCloudExecutionWorkspaceModel } from "./cloud-execution-workspace-model.js";
import { createLocalDevelopmentBridgeContract } from "./local-development-bridge-contract.js";
import { createRemoteMacRunnerContract } from "./remote-mac-runner-contract.js";
import { defineIdeAgentExecutorContract } from "./ide-agent-executor-contract.js";
import { createLocalCodingAgentAdapter } from "./local-coding-agent-adapter.js";
import { createExecutionProviderCapabilitySync } from "./execution-provider-capability-sync.js";
import { createExternalExecutionSessionManager } from "./external-execution-session-manager.js";
import { createIdeAgentResultNormalizer } from "./ide-agent-result-normalizer.js";
import { createExecutionInvocationContract } from "./execution-invocation-contract.js";
import { createExecutionModeResolver } from "./execution-mode-resolver.js";
import { defineTestExecutionSchema } from "./test-execution-schema.js";
import { defineUserIdentitySchema } from "./user-identity-schema.js";
import { defineNexusPersistenceSchema } from "./nexus-persistence-schema.js";
import { createNexusDatabaseMigrations } from "./nexus-database-migrations.js";
import { createRepositoryLayerForCoreEntities } from "./entity-repository-layer.js";
import { createFileAndArtifactStorageModule } from "./file-artifact-storage-module.js";
import { createBackupAndRestoreStrategy } from "./backup-restore-strategy.js";
import { createDisasterRecoveryChecklist } from "./disaster-recovery-checklist.js";
import { createFailoverAndContinuityPlanner } from "./failover-continuity-planner.js";
import { createBusinessContinuityLifecycleManager } from "./business-continuity-lifecycle-manager.js";
import { createAuthenticationSystem } from "./authentication-system.js";
import { createDeviceTrustSystem } from "./device-trust-system.js";
import { createOwnerSecureAuthenticationSystem } from "./owner-secure-authentication-system.js";
import { createOwnerMfaEnforcement } from "./owner-mfa-enforcement.js";
import { createAuthenticationRouteResolver } from "./authentication-route-resolver.js";
import { createSecuritySignals } from "./security-signals-schema.js";
import { createSessionAndTokenManagement } from "./session-and-token-management.js";
import { createSessionSecurityControls } from "./session-security-controls.js";
import { createSensitiveActionConfirmationSystem } from "./sensitive-action-confirmation-system.js";
import { createStepUpAuthenticationSystem } from "./step-up-authentication-system.js";
import { createPrivilegedModeSystem } from "./privileged-mode-system.js";
import { createAdminOnlyAccessLayer } from "./admin-only-access-layer.js";
import { createCriticalOperationGuardrails } from "./critical-operation-guardrails.js";
import { createPasswordResetAndEmailVerificationFlow } from "./password-reset-email-verification-flow.js";
import { defineWorkspaceAndMembershipModel } from "./workspace-membership-model.js";
import { createProjectAccessControlModule } from "./project-access-control-module.js";
import { createRoleAssignmentAndInvitationFlow } from "./role-assignment-invitation-flow.js";
import { createOrganizationWorkspaceSettingsModule } from "./workspace-settings-module.js";
import { createAutomatedTestOrchestrationModule } from "./automated-test-orchestration-module.js";
import { createTestRunnerAdapterLayer } from "./test-runner-adapter-layer.js";
import { createTestResultNormalizationModule } from "./test-result-normalization-module.js";
import { createPreDeployQualityGate } from "./pre-deploy-quality-gate.js";
import { createTestReportingAndRemediationSummary } from "./test-reporting-remediation-summary.js";
import { mapDomainCapabilities } from "./domain-capability-mapper.js";
import { createDomainRegistry, resolveDomainProfile } from "./domain-registry.js";

const MIN_DECISION_CONFIDENCE = 0.65;

function buildProjectAuditAction({
  project,
  agentGovernanceTrace,
  approvalStatus,
  deploymentRequest,
  providerSession,
  stateDiff,
  restoreDecision,
  rollbackExecutionResult,
  releaseStatus,
}) {
  if (agentGovernanceTrace?.agentGovernanceTraceId) {
    return {
      actionType: "project.agent-governance.decision",
      status: agentGovernanceTrace.finalDecision,
      projectId: project.id,
      targetType: "agent-governance",
      targetId: agentGovernanceTrace.agentGovernanceTraceId ?? null,
      summary: `Agent governance decision is ${agentGovernanceTrace.finalDecision} for ${agentGovernanceTrace.taskType}`,
      reason: agentGovernanceTrace.escalationHint?.reason ?? null,
      source: "context-builder",
      impactedAreas: ["governance", "execution"],
      metadata: {
        agentGovernanceTrace,
        agentType: agentGovernanceTrace.agentType,
        taskType: agentGovernanceTrace.taskType,
        scopeType: agentGovernanceTrace.scopeType,
        scopeId: agentGovernanceTrace.scopeId,
      },
    };
  }

  if (rollbackExecutionResult?.status) {
    return {
      actionType: "project.state.rollback",
      status: rollbackExecutionResult.status,
      projectId: project.id,
      targetType: "rollback-execution",
      targetId: rollbackExecutionResult.rollbackExecutionId ?? null,
      summary: rollbackExecutionResult.summary ?? "Project rollback evaluated",
      reason: rollbackExecutionResult.reason ?? null,
      source: "context-builder",
      impactedAreas: ["state", "recovery"],
      metadata: {
        rollbackScope: rollbackExecutionResult.rollbackScope ?? null,
      },
    };
  }

  if (restoreDecision?.status) {
    return {
      actionType: "project.state.restore",
      status: restoreDecision.status,
      projectId: project.id,
      targetType: "state-restore",
      targetId: restoreDecision.restoreDecisionId ?? null,
      summary: restoreDecision.summary ?? "Project restore decision recorded",
      reason: restoreDecision.reason ?? null,
      source: "context-builder",
      impactedAreas: ["state", "versioning"],
      metadata: {
        restoreMode: restoreDecision.restoreMode ?? null,
      },
    };
  }

  if (approvalStatus?.status && approvalStatus.status !== "missing") {
    return {
      actionType: "project.approval.review",
      status: approvalStatus.status,
      projectId: project.id,
      targetType: "approval",
      targetId: project.approvalRecords?.[0]?.approvalRecordId ?? null,
      summary: `Project approval state is ${approvalStatus.status}`,
      reason: approvalStatus.reason ?? null,
      source: "context-builder",
      impactedAreas: ["approval", "governance"],
      metadata: {
        approvalRequired: approvalStatus.requiresApproval ?? false,
      },
    };
  }

  if (deploymentRequest?.requestId) {
    return {
      actionType: "project.deploy.requested",
      status: releaseStatus?.status ?? "queued",
      projectId: project.id,
      targetType: "deployment-request",
      targetId: deploymentRequest.requestId,
      summary: `Deployment request prepared for ${deploymentRequest.provider ?? "generic"}`,
      reason: deploymentRequest.environment ?? null,
      source: "context-builder",
      impactedAreas: ["deploy", "release"],
      metadata: {
        provider: deploymentRequest.provider ?? null,
        target: deploymentRequest.target ?? null,
      },
    };
  }

  if (providerSession?.providerType) {
    return {
      actionType: "project.provider.call",
      status: providerSession.status ?? "connected",
      projectId: project.id,
      targetType: "provider-session",
      targetId: providerSession.sessionId ?? providerSession.providerType,
      summary: `Provider session active for ${providerSession.providerType}`,
      reason: providerSession.authMode ?? null,
      source: "context-builder",
      impactedAreas: ["provider"],
      metadata: {
        capabilityCount: Array.isArray(providerSession.capabilities) ? providerSession.capabilities.length : 0,
      },
    };
  }

  return {
    actionType: "project.edit.state-change",
    status: "recorded",
    projectId: project.id,
    targetType: "state-diff",
    targetId: stateDiff?.comparisonTargetId ?? null,
    summary: "Project state change recorded",
    reason: null,
    source: "context-builder",
    impactedAreas: ["state-change", "edit"],
    attachments: Array.isArray(stateDiff?.changes) ? stateDiff.changes.slice(0, 3) : [],
    metadata: {
      totalChanges: stateDiff?.changeSummary?.totalChanges ?? 0,
    },
  };
}

function inferPlannedChangeKind(command) {
  const text = [command?.command, ...(Array.isArray(command?.args) ? command.args : [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (text.includes("billing")) {
    return "migration";
  }

  if (
    text.includes("env")
    || text.includes("deploy")
    || text.includes("hosting")
    || text.includes("route")
    || text.includes("routing")
    || text.includes("domain")
    || text.includes("ci")
    || text.includes("pipeline")
  ) {
    return "infra";
  }

  return "code";
}

function getNormalized(project, key) {
  const normalized = project.normalizedSources?.[key]?.data;
  if (normalized) {
    return normalized;
  }

  if (key === "scan") {
    return project.scan ?? null;
  }

  if (key === "external") {
    return project.externalSnapshot ?? null;
  }

  if (key === "git") {
    return project.gitSnapshot ?? null;
  }

  if (key === "runtime") {
    return project.runtimeSnapshot ?? null;
  }

  return null;
}

function isReliable(item) {
  if (!item) {
    return false;
  }

  const metadata = item.metadata ?? item;
  return metadata.status !== "unknown" && metadata.confidence >= MIN_DECISION_CONFIDENCE;
}

function inferDomain(project) {
  const manualDomain = project.manualContext?.domain ?? project.state?.context?.domain ?? null;
  if (manualDomain) {
    return {
      domain: manualDomain,
      domainCandidates: [manualDomain],
      confidenceScores: {
        [manualDomain]: 1,
      },
    };
  }

  const normalizedScan = getNormalized(project, "scan");
  return classifyProjectDomain({
    projectIntake: project.projectIntake ?? null,
    scan: normalizedScan,
    knowledge: normalizedScan?.knowledge ?? null,
    externalSources: getNormalized(project, "external"),
    goal: project.goal,
  });
}

function buildReleaseMetadata({ project, domain, releasePlan, recommendedDefaults, businessContext }) {
  const metadata = [
    releasePlan?.releaseTarget ? "deployment-target" : null,
    project.state?.version ? "version-info" : null,
    domain === "saas" || recommendedDefaults?.hosting?.target ? "environment-config" : null,
    domain === "casino" && Array.isArray(businessContext?.constraints) && businessContext.constraints.length > 0
      ? "compliance-notes"
      : null,
    domain === "mobile-app" ? "bundle-id" : null,
    releasePlan?.releaseTarget === "app-store" || releasePlan?.releaseTarget === "play-store"
      ? "store-metadata"
      : null,
    releasePlan?.releaseTarget?.includes("distribution") ? "distribution-channel" : null,
    domain === "book" ? "book-metadata" : null,
    releasePlan?.releaseTarget === "content-delivery" ? "delivery-format" : null,
  ];

  return [...new Set(metadata.filter(Boolean))];
}

function buildStack(project) {
  const external = getNormalized(project, "external")?.technical?.stack;
  const scanStack = getNormalized(project, "scan")?.stack;
  const stateStack = project.state?.stack ?? {};

  return {
    frontend: createEvidence(
      {
        value: external?.frontend ?? scanStack?.frontend?.join(", ") ?? stateStack.frontend ?? "לא זוהה",
        source: external ? "casino-api" : scanStack ? "project-scan" : "project-state",
        confidence: external ? 0.9 : scanStack ? 0.75 : 0.5,
        status: external || scanStack ? "verified" : "inferred",
        derivedFrom: external ? "technical.stack.frontend" : scanStack ? "scan.stack.frontend" : "state.stack.frontend",
      },
    ),
    backend: createEvidence(
      {
        value: external?.backend ?? scanStack?.backend?.join(", ") ?? stateStack.backend ?? "לא זוהה",
        source: external ? "casino-api" : scanStack ? "project-scan" : "project-state",
        confidence: external ? 0.9 : scanStack ? 0.75 : 0.5,
        status: external || scanStack ? "verified" : "inferred",
        derivedFrom: external ? "technical.stack.backend" : scanStack ? "scan.stack.backend" : "state.stack.backend",
      },
    ),
    database: createEvidence(
      {
        value: external?.database ?? scanStack?.database?.join(", ") ?? stateStack.database ?? "לא זוהה",
        source: external ? "casino-api" : scanStack ? "project-scan" : "project-state",
        confidence: external ? 0.9 : scanStack ? 0.75 : 0.5,
        status: external || scanStack ? "verified" : "inferred",
        derivedFrom: external ? "technical.stack.database" : scanStack ? "scan.stack.database" : "state.stack.database",
      },
    ),
  };
}

function buildCapabilities(project) {
  const scan = getNormalized(project, "scan");
  const external = getNormalized(project, "external");

  return {
    auth: external
      ? createEvidence({
          value: Boolean(external.features?.hasAuth),
          source: "casino-api",
          confidence: 0.9,
          status: "verified",
          derivedFrom: "features.hasAuth",
        })
      : createEvidence({
          value: Boolean(scan?.findings?.hasAuth),
          source: "project-scan",
          confidence: 0.75,
          status: scan ? "verified" : "unknown",
          derivedFrom: "scan.findings.hasAuth",
        }),
    payments: external
      ? createEvidence({
          value: Boolean(external.features?.hasPayments),
          source: "casino-api",
          confidence: 0.9,
          status: "verified",
          derivedFrom: "features.hasPayments",
        })
      : createEvidence({
          value: Boolean(project.state?.product?.hasPaymentIntegration),
          source: "project-state",
          confidence: 0.6,
          status: "inferred",
          derivedFrom: "state.product.hasPaymentIntegration",
        }),
    wallet: external
      ? createEvidence({
          value: Boolean(external.features?.hasWallet),
          source: "casino-api",
          confidence: 0.9,
          status: "verified",
          derivedFrom: "features.hasWallet",
        })
      : createEvidence({
          value: false,
          source: "unknown",
          confidence: 0.2,
          status: "unknown",
          derivedFrom: "missing",
        }),
    migrations: createEvidence({
      value: Boolean(scan?.findings?.hasMigrations || external?.technical?.hasMigrations),
      source: external?.technical ? "casino-api" : "project-scan",
      confidence: external?.technical ? 0.9 : 0.75,
      status: external?.technical || scan ? "verified" : "unknown",
      derivedFrom: external?.technical ? "technical.hasMigrations" : "scan.findings.hasMigrations",
    }),
    tests: createEvidence({
      value: Boolean(scan?.findings?.hasTests || external?.technical?.hasTests),
      source: external?.technical ? "casino-api" : "project-scan",
      confidence: external?.technical ? 0.9 : 0.75,
      status: external?.technical || scan ? "verified" : "unknown",
      derivedFrom: external?.technical ? "technical.hasTests" : "scan.findings.hasTests",
    }),
  };
}

function buildExecutionCapabilities(project, executionModes = []) {
  const agentCapabilities = (project.agents ?? []).map((agent) => ({
    type: "agent",
    id: agent.id,
    capabilities: agent.capabilities ?? [],
  }));
  const surfaceCapabilities = executionModes.map((mode) => ({
    type: "surface",
    id: mode,
    mode,
    capabilities: ["bootstrap", "backend", "frontend", "security", "payments"],
  }));

  return [...agentCapabilities, ...surfaceCapabilities];
}

function buildGaps(project) {
  const gaps = [];
  const normalizedScan = getNormalized(project, "scan");
  const normalizedExternal = getNormalized(project, "external");

  for (const gap of normalizedScan?.gaps ?? []) {
    gaps.push(
      createGap({
        id: gap,
        text: gap,
        category: "technical",
        severity: "medium",
        source: "project-scan",
        confidence: 0.75,
        status: "verified",
        derivedFrom: "scan.gaps",
      }),
    );
  }

  for (const gap of normalizedScan?.knowledge?.knownMissingParts ?? []) {
    if (!gaps.some((item) => item.text === gap)) {
      gaps.push(
        createGap({
          id: gap,
          text: gap,
          category: "knowledge",
          severity: "medium",
          source: "project-docs",
          confidence: 0.65,
          status: "inferred",
          derivedFrom: "scan.knowledge.knownMissingParts",
        }),
      );
    }
  }

  for (const gap of normalizedExternal?.technical?.knownTechnicalGaps ?? []) {
    gaps.push(
      createGap({
        id: gap,
        text: gap,
        category: "technical",
        severity: "high",
        source: "casino-api",
        confidence: 0.9,
        status: "verified",
        derivedFrom: "technical.knownTechnicalGaps",
      }),
    );
  }

  for (const gap of normalizedExternal?.roadmapContext?.knownMissingParts ?? []) {
    gaps.push(
      createGap({
        id: gap,
        text: gap,
        category: "product",
        severity: "high",
        source: "casino-api",
        confidence: 0.9,
        status: "verified",
        derivedFrom: "roadmapContext.knownMissingParts",
      }),
    );
  }

  for (const gap of project.state?.knowledge?.knownGaps ?? []) {
    if (!gaps.some((item) => item.text === gap)) {
      gaps.push(
        createGap({
          id: gap,
          text: gap,
          category: "general",
          severity: "medium",
          source: "project-state",
          confidence: 0.5,
          status: "inferred",
          derivedFrom: "state.knowledge.knownGaps",
        }),
      );
    }
  }

  return gaps;
}

function buildFlows(project) {
  const externalFlows = getNormalized(project, "external")?.flows;
  if (!externalFlows) {
    return [];
  }

  return Object.entries(externalFlows)
    .filter(([key]) => !["apiVersion", "schemaVersion", "generatedAt"].includes(key))
    .map(([name, payload]) =>
      createFlow({
        id: name,
        name,
        status: payload.status,
        blockedBy: payload.blockedBy,
        notes: payload.notes,
        source: "casino-api",
        confidence: 0.9,
        derivedFrom: `flows.${name}`,
        reliabilityStatus: "verified",
      }),
    );
}

function resolveBottleneck(project, context) {
  const criticalDependency = getNormalized(project, "external")?.roadmapContext?.criticalDependencies?.[0];
  if (criticalDependency) {
    return createSignal({
      id: `dependency:${criticalDependency}`,
      title: criticalDependency,
      source: "casino-api",
      confidence: 0.9,
      status: "verified",
      derivedFrom: "roadmapContext.criticalDependencies",
      reason: "criticalDependencies",
    });
  }

  const blockedFlow = context.flows.find(
    (flow) => ["blocked", "partial"].includes(flow.status) && isReliable(flow),
  );
  if (blockedFlow) {
    return createSignal({
      id: `flow:${blockedFlow.id}`,
      title: blockedFlow.name,
      source: blockedFlow.source,
      confidence: blockedFlow.confidence,
      status: blockedFlow.reliabilityStatus,
      derivedFrom: blockedFlow.derivedFrom,
      reason: blockedFlow.notes ?? "blocked flow",
    });
  }

  const firstGap = context.gaps.find((gap) => isReliable(gap));
  if (firstGap) {
    return createSignal({
      id: `gap:${firstGap.id}`,
      title: firstGap.text,
      source: firstGap.source,
      confidence: firstGap.confidence,
      status: firstGap.status,
      derivedFrom: firstGap.derivedFrom,
      reason: firstGap.derivedFrom,
    });
  }

  return createSignal({
    id: "no-blocker",
    title: "אין כרגע חסם מרכזי",
    source: "system",
    confidence: 1,
    status: "verified",
    derivedFrom: "system.no-blocker",
    reason: "no-blocker",
  });
}

function buildRecommendedActions(project, context) {
  const actions = [];

  for (const dependency of getNormalized(project, "external")?.roadmapContext?.criticalDependencies ?? []) {
    actions.push(
      createRecommendedAction({
        id: `dependency:${dependency}`,
      title: `לטפל ב-${dependency}`,
      source: "casino-api",
      confidence: 0.9,
      status: "verified",
      derivedFrom: "roadmapContext.criticalDependencies",
      reason: "criticalDependencies",
      }),
    );
  }

  for (const flow of context.flows.filter(
    (item) => ["blocked", "partial"].includes(item.status) && isReliable(item),
  )) {
    actions.push(
      createRecommendedAction({
        id: `flow:${flow.id}`,
      title: `לשחרר את הזרימה ${flow.name}`,
      source: flow.source,
      confidence: flow.confidence,
      status: flow.reliabilityStatus,
      derivedFrom: flow.derivedFrom,
      reason: flow.notes ?? "blocked flow",
      }),
    );
  }

  for (const gap of context.gaps.filter((item) => isReliable(item)).slice(0, 3)) {
    actions.push(
      createRecommendedAction({
        id: `gap:${gap.id}`,
      title: gap.text,
      source: gap.source,
      confidence: gap.confidence,
      status: gap.status,
      derivedFrom: gap.derivedFrom,
      reason: gap.derivedFrom,
      }),
    );
  }

  return actions.slice(0, 6);
}

function buildDependencies(project, context) {
  const dependencies = [];

  for (const dependency of getNormalized(project, "external")?.roadmapContext?.criticalDependencies ?? []) {
    dependencies.push(
      createDependency({
        id: dependency,
        title: dependency,
        type: "critical",
        status: "required",
        source: "casino-api",
        confidence: 0.9,
        derivedFrom: "roadmapContext.criticalDependencies",
      }),
    );
  }

  for (const flow of context.flows.filter((item) => item.blockedBy.length > 0)) {
    for (const blockedBy of flow.blockedBy) {
      dependencies.push(
        createDependency({
          id: `${flow.id}:${blockedBy}`,
          title: blockedBy,
          type: "flow-blocker",
          status: "blocking",
          source: flow.source,
          confidence: flow.confidence,
          derivedFrom: `flows.${flow.id}.blockedBy`,
        }),
      );
    }
  }

  return dependencies;
}

function buildRisks(project, context) {
  const risks = [];

  for (const issue of getNormalized(project, "external")?.health?.blockingIssues ?? []) {
    risks.push(
      createRisk({
        id: issue,
        title: issue,
        severity: "high",
        source: "casino-api",
        confidence: 0.9,
        status: "verified",
        derivedFrom: "health.blockingIssues",
      }),
    );
  }

  if (context.capabilities.migrations.value === false) {
    risks.push(
      createRisk({
        id: "missing-migrations",
        title: "אין שכבת migrations פעילה",
        severity: "high",
        source: context.capabilities.migrations.source,
        confidence: context.capabilities.migrations.confidence,
        status: context.capabilities.migrations.status,
        derivedFrom: context.capabilities.migrations.derivedFrom,
      }),
    );
  }

  if (context.capabilities.tests.value === false) {
    risks.push(
      createRisk({
        id: "missing-tests",
        title: "אין בדיקות שמגנות על הזרימות",
        severity: "medium",
        source: context.capabilities.tests.source,
        confidence: context.capabilities.tests.confidence,
        status: context.capabilities.tests.status,
        derivedFrom: context.capabilities.tests.derivedFrom,
      }),
    );
  }

  return risks;
}

function deriveDataAssetForPrivacy({
  project,
  tenantIsolationSchema,
  storageRecord,
  learningEvent,
  credentialReference,
  credentialVaultRecord,
}) {
  const isolatedResources = Array.isArray(tenantIsolationSchema?.isolatedResources)
    ? tenantIsolationSchema.isolatedResources
    : [];
  const highestTenantSensitivity = isolatedResources.some((resource) => resource?.sensitivity === "critical")
    ? "critical"
    : isolatedResources.some((resource) => resource?.sensitivity === "high")
      ? "high"
      : isolatedResources.some((resource) => resource?.sensitivity === "low")
        ? "low"
        : "medium";
  const attachments = Array.isArray(storageRecord?.attachments) ? storageRecord.attachments : [];
  const artifacts = Array.isArray(storageRecord?.artifacts) ? storageRecord.artifacts : [];
  const hasCredentialMaterial =
    typeof credentialReference === "string"
    || Boolean(credentialVaultRecord?.encryptedCredential)
    || isolatedResources.some((resource) => resource?.resourceType === "linked-accounts");
  const hasUserContent =
    attachments.length > 0
    || Boolean(project.projectIntake?.summary)
    || project.manualContext?.containsUserContent === true
    || project.manualContext?.workspaceAction?.actionType === "comment-added";
  const hasIdentifiers =
    Boolean(project.userId)
    || Boolean(project.manualContext?.userProfile?.email)
    || Boolean(project.manualContext?.userProfile?.displayName)
    || Boolean(learningEvent?.sourceWorkspaceId)
    || attachments.some((attachment) => typeof attachment?.attachmentId === "string");
  const hasLearningMaterial =
    project.manualContext?.dataAsset?.containsLearningMaterial === true
    || Boolean(project.context?.learningInsights)
    || Boolean(project.context?.learningTrace)
    || learningEvent?.crossTenantSource === true
    || learningEvent?.providerBoundaryBreach === true;
  const scope =
    project.manualContext?.dataAsset?.scope
    ?? (project.manualContext?.userProfile
      ? "user"
      : storageRecord?.storageScope === "workspace"
        ? "workspace"
        : "project");

  return {
    assetId:
      project.manualContext?.dataAsset?.assetId
      ?? `data-asset:${project.id ?? "unknown-project"}:${storageRecord?.storageRecordId ?? "project-state"}`,
    assetType:
      project.manualContext?.dataAsset?.assetType
      ?? (hasCredentialMaterial
        ? "credential-bound-project-state"
        : attachments.length > 0
          ? "uploaded-project-artifacts"
          : artifacts.length > 0
            ? "project-artifacts"
            : "project-state"),
    scope,
    containsPersonalData:
      project.manualContext?.dataAsset?.containsPersonalData
      ?? hasIdentifiers
      ?? false,
    containsSecrets:
      project.manualContext?.dataAsset?.containsSecrets
      ?? hasCredentialMaterial
      ?? false,
    containsLearningMaterial: hasLearningMaterial,
    source:
      project.manualContext?.dataAsset?.source
      ?? (attachments.length > 0 || project.manualContext ? "derived" : "system"),
    tenantSensitivity:
      project.manualContext?.dataAsset?.tenantSensitivity
      ?? highestTenantSensitivity,
  };
}

function deriveStorageContextForPrivacy({
  project,
  workspaceModel,
  tenantIsolationSchema,
  nexusPersistenceSchema,
  storageRecord,
}) {
  return {
    projectId: project.id ?? "unknown-project",
    workspaceId: workspaceModel?.workspaceId ?? null,
    storageScope: storageRecord?.storageScope ?? "project",
    storageDriver: storageRecord?.storageDriver ?? "filesystem",
    retentionPolicy: {
      policyId:
        storageRecord?.retentionPolicy
        ?? nexusPersistenceSchema?.entities?.projects?.retentionPolicy
        ?? "project-lifecycle",
      source: storageRecord?.retentionPolicy ? "storage-record" : "nexus-persistence-schema",
      workspaceId: workspaceModel?.workspaceId ?? null,
    },
    tenantBoundary:
      tenantIsolationSchema?.isolatedResources?.find((resource) => resource?.resourceType === "project-state")?.tenantBoundary
      ?? tenantIsolationSchema?.isolationBoundary
      ?? "workspace",
    workspaceVisibility: tenantIsolationSchema?.workspaceVisibility ?? workspaceModel?.visibility ?? "private",
    tenantSensitivity:
      tenantIsolationSchema?.isolatedResources?.find((resource) => resource?.resourceType === "linked-accounts")?.sensitivity
      ?? tenantIsolationSchema?.isolatedResources?.find((resource) => resource?.resourceType === "project-state")?.sensitivity
      ?? "medium",
  };
}

function derivePrivacyRetentionPolicy({
  dataPrivacyClassification,
  nexusPersistenceSchema,
  storageRecord,
  backupStrategy,
}) {
  const classificationRetention = dataPrivacyClassification?.storageBinding?.retentionPolicy ?? null;
  const storagePolicy = backupStrategy?.storagePolicy ?? null;

  return {
    policyId:
      classificationRetention?.policyId
      ?? storagePolicy?.retentionPolicy
      ?? storageRecord?.retentionPolicy
      ?? nexusPersistenceSchema?.entities?.projects?.retentionPolicy
      ?? "privacy-fallback-policy",
    source:
      classificationRetention?.source
      ?? (storagePolicy?.retentionPolicy ? "backup-strategy" : storageRecord?.retentionPolicy ? "storage-record" : "nexus-persistence-schema"),
    window: {
      archiveAfterDays:
        classificationRetention?.policyId === "workspace-lifecycle"
          ? 30
          : classificationRetention?.policyId === "learning-governance"
            ? 14
            : null,
      deleteAfterDays:
        classificationRetention?.policyId === "account-lifecycle"
          ? 30
          : classificationRetention?.policyId === "compliance-audit"
            ? 365
            : classificationRetention?.policyId === "project-lifecycle"
              ? 180
              : null,
      reviewAfterDays:
        classificationRetention?.policyId === "learning-governance"
          ? 7
          : 30,
    },
    backupAllowed: backupStrategy?.backupMode === "state-and-artifacts",
    backupConstraints: {
      storageDriver: storagePolicy?.storageDriver ?? storageRecord?.storageDriver ?? "filesystem",
      protectsArtifacts: backupStrategy?.summary?.protectsArtifacts ?? false,
      storagePath: storagePolicy?.storagePath ?? storageRecord?.storagePath ?? null,
    },
  };
}

export function buildProjectContext(
  project,
  {
    observabilityTransport = null,
    auditLogStore = null,
    securityAuditLogStore = null,
    snapshotStore = null,
    reviewThreadStore = null,
    userActivityHistoryStore = null,
  } = {},
) {
  const canonicalTaskInventory = Array.isArray(project.canonicalTaskInventory)
    ? project.canonicalTaskInventory
    : Array.isArray(project.state?.canonicalTaskInventory)
      ? project.state.canonicalTaskInventory
      : loadWave3CanonicalTaskInventory();
  const baseTaskResults = project.taskResults ?? project.state?.taskResults ?? [];
  const { blockedTaskOutcomes } = createBlockedTaskOutcomeCanonicalizer({
    projectId: project.id ?? null,
    executionGraph: project.cycle?.executionGraph ?? null,
    roadmap: project.cycle?.roadmap ?? [],
    taskAssignments: project.cycle?.assignments ?? [],
    runtimeResults: project.runtimeResults ?? [],
    existingTaskResults: baseTaskResults,
  });
  const blockedTaskOutcomeByTaskId = new Map(
    blockedTaskOutcomes
      .filter((result) => result?.taskId)
      .map((result) => [result.taskId, result]),
  );
  const canonicalTaskResults = [
    ...baseTaskResults.filter((result) => result?.status !== "blocked" || !blockedTaskOutcomeByTaskId.has(result?.taskId)),
    ...blockedTaskOutcomes,
  ];
  const domainDecision = inferDomain(project);
  const domain = domainDecision.domain;
  const domainRegistry = createDomainRegistry();
  const domainProfile = resolveDomainProfile(domain, domainRegistry);
  const { domainCapabilities, requiredContextFields, executionModes } = mapDomainCapabilities(domain, domainRegistry);
  const { recommendedDefaults, defaultsTrace } = createRecommendedDefaults({
    projectIntake: project.projectIntake ?? null,
    domain,
    constraints: project.manualContext?.constraints ?? project.state?.constraints ?? {},
  });
  const stackRecommendation = createStackRecommendationModule({
    domain,
    platformTargets: project.manualContext?.platformTargets ?? [],
    constraints: project.manualContext?.constraints ?? project.state?.constraints ?? {},
    projectIntake: project.projectIntake ?? null,
  });
  const businessContext = buildBusinessContextLayer({
    domain,
    goal: project.goal,
    manualBusinessContext: project.manualContext?.businessContext ?? null,
    knowledgeGaps: project.state?.knowledge?.knownGaps ?? [],
    runtimeSnapshot: project.runtimeSnapshot ?? null,
    gitSnapshot: project.gitSnapshot ?? null,
    stateConstraints: project.manualContext?.constraints ?? project.state?.constraints ?? {},
    recommendedDefaults,
  });
  const { projectIdentity } = defineProjectIdentitySchema({
    projectIntake: project.projectIntake ?? {
      projectName: project.name ?? null,
      visionText: project.goal ?? null,
    },
    businessContext,
    domainDecision,
  });
  const { nexusPositioning } = defineNexusPositioningSchema({
    productVision: {
      statement: projectIdentity?.vision ?? project.goal ?? null,
      problem: project.projectIntake?.problem ?? projectIdentity?.vision ?? project.goal ?? null,
      promise: project.projectIntake?.promise ?? projectIdentity?.differentiation ?? null,
      proofPoints: project.projectIntake?.proofPoints ?? [],
    },
    targetAudience: businessContext?.targetAudience ?? null,
    competitiveContext: project.manualContext?.competitiveContext ?? null,
  });
  const { messagingFramework } = createCoreMessagingFramework({
    nexusPositioning,
  });
  const { messagingVariants } = createAudienceSpecificMessagingVariants({
    coreMessagingFramework: messagingFramework,
    nexusPositioning,
    businessContext,
    projectIdentity,
  });
  const { objectionMap, faqMap } = createObjectionAndFaqMap({
    messagingFramework,
    businessContext,
    projectIdentity,
    manualContext: project.manualContext ?? null,
  });
  const { projectDraft } = defineProjectDraftSchema({
    userIdentity: {
      userId: project.userId ?? project.manualContext?.userId ?? null,
      email: project.manualContext?.userProfile?.email ?? null,
      displayName: project.manualContext?.userProfile?.displayName ?? null,
    },
    initialInput: {
      projectDraftId: project.projectDraft?.id ?? project.id,
      projectName: project.projectDraft?.name ?? project.name ?? null,
      goal: project.projectDraft?.goal ?? project.goal ?? null,
      creationSource: project.projectDraft?.creationSource ?? "project-state",
      requestedDeliverables: project.projectIntake?.requestedDeliverables ?? [],
      attachments: project.projectIntake?.uploadedFiles ?? [],
      links: project.projectIntake?.externalLinks ?? [],
    },
    existingProjectDraft: project.projectDraft ?? null,
  });
  const { existingBusinessAssets } = createExistingBusinessAssetNormalizationLayer({
    projectId: project.id,
    projectIntake: project.projectIntake ?? null,
    intakeScanHandoff: project.intakeScanHandoff ?? null,
    scan: project.scan ?? null,
    gitSnapshot: project.gitSnapshot ?? null,
  });
  const { repositoryImportAndCodebaseDiagnosis } = createRepositoryImportAndCodebaseDiagnosisBridge({
    projectId: project.id,
    existingBusinessAssets,
    scan: project.scan ?? null,
    gitSnapshot: project.gitSnapshot ?? null,
  });
  const { liveWebsiteIngestionAndFunnelDiagnosis } = createLiveWebsiteIngestionFunnelDiagnosisModel({
    projectId: project.id,
    existingBusinessAssets,
    externalSnapshot: project.externalSnapshot ?? null,
    scan: project.scan ?? null,
  });
  const { importedAnalyticsNormalization } = createImportedAnalyticsNormalizationLayer({
    projectId: project.id,
    existingBusinessAssets,
    externalSnapshot: project.externalSnapshot ?? null,
    runtimeSnapshot: project.runtimeSnapshot ?? null,
  });
  const { importedAssetTaskExtraction } = createImportedAssetTaskExtractionModule({
    projectId: project.id,
    existingBusinessAssets,
    repositoryImportAndCodebaseDiagnosis,
    liveWebsiteIngestionAndFunnelDiagnosis,
    importedAnalyticsNormalization,
  });
  const { importAndContinueRoadmap } = createImportAndContinueRoadmapAssembler({
    projectId: project.id,
    existingBusinessAssets,
    repositoryImportAndCodebaseDiagnosis,
    liveWebsiteIngestionAndFunnelDiagnosis,
    importedAnalyticsNormalization,
    importedAssetTaskExtraction,
  });
  const { projectIdentityProfile, identityCompleteness } = createProjectIdentityAssembler({
    projectIdentity,
    projectDraft,
    onboardingSession: project.onboardingSession ?? null,
  });
  const { instantValuePlan } = createInstantValueOutputResolver({
    projectIdentity,
    onboardingSession: project.onboardingSession ?? {
      projectIntake: project.projectIntake ?? null,
    },
    domainCapabilities,
  });
  const decisionIntelligence = buildDecisionIntelligenceLayer({
    approvals: project.approvals ?? [],
    requiredActions: project.requiredActions ?? [],
    recommendedDefaults,
    businessContext,
    executionModes,
    stackRecommendation,
    domain,
    domainClassification: {
      domain,
      confidenceScores: domainDecision.confidenceScores,
    },
  });
  const { approvalRequest } = defineApprovalRequestSchema({
    actionType: "project-execution",
    projectId: project.id,
    actorType: "agent-runtime",
    actionPayload: {
      domain,
      executionModes,
    },
    riskContext: {
      riskLevel: decisionIntelligence?.summary?.requiresApproval ? "high" : "medium",
    },
    decisionIntelligence,
  });
  const { approvalRule } = createApprovalRuleRegistry({
    actionType: approvalRequest.actionType,
    actionPayload: approvalRequest.actionPayload,
  });
  const approvalTrigger = createApprovalTriggerResolver({
    actionType: approvalRequest.actionType,
    actionPayload: approvalRequest.actionPayload,
    policyContext: {
      decisionIntelligence,
      forceApproval: decisionIntelligence?.summary?.requiresApproval ?? false,
    },
  });
  const { approvalRecord: computedApprovalRecord } = createApprovalRecordStore({
    approvalRequest: {
      ...approvalRequest,
      actionPayload: {
        ...approvalRequest.actionPayload,
        approvalType: approvalTrigger.approvalType,
      },
    },
    approvalDecision: {
      decision: approvalTrigger.requiresApproval ? "rejected" : "approved",
      approved: !approvalTrigger.requiresApproval,
      reason: approvalTrigger.approvalReason,
      actorId: approvalRequest.actorType,
      expiresInHours: approvalTrigger.requiresApproval ? null : 24,
    },
  });
  const approvalRecords = [
    ...((Array.isArray(project.approvalRecords) ? project.approvalRecords : [])),
  ];
  if (!approvalRecords.some((record) => record.approvalRequestId === computedApprovalRecord.approvalRequestId)) {
    approvalRecords.unshift(computedApprovalRecord);
  }
  const approvalRecord = approvalRecords[0] ?? computedApprovalRecord;
  const { approvalStatus } = createApprovalStatusResolver({
    approvalRequest,
    approvalRecords,
  });
  const approvalRequestWithStatus = {
    ...approvalRequest,
    status: approvalStatus.status === "approved"
      ? "approved"
      : approvalStatus.status === "rejected"
        ? "rejected"
        : approvalStatus.status === "expired"
          ? "expired"
          : "pending",
  };
  const { gatingDecision } = createApprovalGatingModule({
    approvalRequest: approvalRequestWithStatus,
    approvalStatus,
  });
  const { approvalAuditTrail } = createApprovalAuditFormatter({
    approvalRecords,
  });
  const { policySchema } = definePolicySchema({
    policyDefinitions: [
      {
        id: "execution-controlled-modes",
        kind: "execution",
        allowedActions: executionModes,
        requiresApproval: decisionIntelligence?.summary?.requiresApproval ?? false,
      },
      {
        id: "approval-gating",
        kind: "approval",
        approvalTypes: [approvalTrigger.approvalType].filter(Boolean),
        decision: gatingDecision?.decision ?? "requires-approval",
      },
      {
        id: "credential-protection",
        kind: "credential",
        protectedFlows: ["build", "deploy", "execution"],
      },
      {
        id: "deploy-guardrails",
        kind: "deploy",
        guardedTargets: domainCapabilities.releaseTargets ?? [],
      },
    ],
  });
  const { actionPolicy } = createActionPolicyRegistry({
    actionType: approvalRequestWithStatus.actionType,
    policySchema,
  });
  const { agentGovernancePolicy } = defineAgentGovernancePolicySchema({
    agentType:
      project.manualContext?.agentType
      ?? project.cycle?.assignments?.[0]?.agentId
      ?? project.agents?.[0]?.id
      ?? null,
    policySchema,
  });
  const { policyDecision } = createExecutionPolicyEvaluator({
    actionType: approvalRequestWithStatus.actionType,
    actorType: approvalRequestWithStatus.actorType,
    actionPayload: approvalRequestWithStatus.actionPayload,
    projectState: {
      policySchema,
      gatingDecision,
    },
  });
  const businessBottleneck = resolveBusinessBottleneck({
    businessContext,
    decisionIntelligence,
    recommendedDefaults,
  });
  const crossFunctionalTaskGraph = buildCrossFunctionalTaskGraph({
    roadmap: project.cycle?.roadmap ?? [],
    businessContext,
    businessBottleneck,
  });
  const growthMarketingPlan = buildGrowthMarketingPlanner({
    businessGoal: project.goal,
    businessContext,
    businessBottleneck,
    decisionIntelligence,
  });
  const { bootstrapPlan, bootstrapTasks } = createBootstrapPlanGenerator({
    projectIntake: project.projectIntake ?? null,
    domain,
    recommendedDefaults,
    domainProfile,
  });
  const { bootstrapAssignments } = createBootstrapDispatcher({
    bootstrapTasks,
    executionCapabilities: buildExecutionCapabilities(project, executionModes),
  });
  const bootstrapExecutionRequests = bootstrapAssignments.map((bootstrapAssignment) =>
    defineBootstrapExecutionRequestSchema({ bootstrapAssignment }),
  );
  const bootstrapResolvedSurfaces = bootstrapExecutionRequests.map((executionRequest) =>
    createBootstrapSurfaceResolver({ executionRequest }),
  );
  const bootstrapPlannedCommands = bootstrapExecutionRequests.map((executionRequest) =>
    createBootstrapCommandPlanner({ executionRequest }),
  );
  const bootstrapRawExecutionResults = bootstrapExecutionRequests.map((_, index) =>
    createBootstrapExecutionInvoker({
      resolvedSurface: bootstrapResolvedSurfaces[index],
      plannedCommands: bootstrapPlannedCommands[index],
    }),
  );
  const { artifacts: bootstrapArtifacts, executionMetadata: bootstrapExecutionMetadata } = createBootstrapArtifactCollector({
    rawExecutionResult: bootstrapRawExecutionResults,
  });
  const { executionResult: bootstrapExecutionResult, artifacts: bootstrapEnvelopeArtifacts } = createBootstrapExecutionResultEnvelope({
    rawExecutionResult: bootstrapRawExecutionResults,
    artifacts: bootstrapArtifacts,
  });
  const plannedChanges = bootstrapPlannedCommands.flatMap((plannedCommandSet) =>
    (plannedCommandSet.plannedCommands ?? []).map((command) => ({
      id: command.id,
      kind: inferPlannedChangeKind(command),
      operation: command.type === "scaffold" ? "add" : "modify",
      summary: command.command,
      command: command.command,
      args: command.args,
      path: command.produces?.[0]
        ? command.command.includes("billing")
          ? `generated/${command.produces[0]}.sql`
          : `generated/${command.produces[0]}.ts`
        : null,
    })),
  );
  const { diffPreviewSchema } = defineDiffPreviewSchema({
    executionPlan: {
      executionRequestId: bootstrapExecutionRequests[0]?.requestId ?? null,
      taskId: bootstrapAssignments[0]?.taskId ?? null,
      actionType: bootstrapAssignments[0]?.task?.summary ?? "project-execution",
      target: bootstrapResolvedSurfaces[0]?.resolvedSurface?.surfaceType ?? null,
    },
    changeSet: plannedChanges,
  });
  const { codeDiff } = createCodeDiffCollector({
    plannedChanges,
  });
  const { migrationDiff } = createMigrationDiffCollector({
    plannedChanges,
  });
  const { infraDiff } = createConfigInfraDiffCollector({
    plannedChanges,
  });
  const { impactSummary, riskFlags } = createDiffImpactSummarizer({
    codeDiff,
    migrationDiff,
    infraDiff,
    decisionIntelligence,
  });
  const { diffPreview } = createUserFacingDiffPreviewAssembler({
    codeDiff,
    migrationDiff,
    infraDiff,
    impactSummary,
    riskFlags,
  });
  const { policyViolations } = createCodeChangePolicyChecks({
    changeSet: plannedChanges,
  });
  const bootstrapResult = {
    ...bootstrapExecutionResult,
    status: bootstrapAssignments.every((assignment) => assignment.status === "assigned")
      ? bootstrapExecutionResult.status
      : "blocked",
    artifacts: bootstrapEnvelopeArtifacts,
    executionMetadata: bootstrapExecutionMetadata,
    assignments: bootstrapAssignments,
    plannedCommands: bootstrapPlannedCommands,
    rawExecutionResults: bootstrapRawExecutionResults,
  };
  const { validationResult: bootstrapValidation } = createBootstrapValidationModule({
    bootstrapResult,
    expectedArtifacts: bootstrapPlan?.artifactManifest ?? [],
    scan: project.scan ?? null,
    taskResults: canonicalTaskResults,
  });
  const {
    updatedProjectState: bootstrapStateUpdate,
    updatedExecutionGraph: bootstrapExecutionGraph,
  } = createBootstrapStateUpdater({
    validationResult: bootstrapValidation,
    bootstrapTasks,
    projectState: project.state ?? {},
  });
  const { firstValueOutput } = createFirstTangibleOutcomeGenerator({
    instantValuePlan: project.state?.instantValuePlan ?? instantValuePlan,
    projectState: {
      projectId: project.id,
      projectName: project.name ?? null,
      diffPreview,
    },
    bootstrapResult,
  });
  const executionProgressSchema = defineExecutionProgressSchema({
    taskExecutionState: {
      taskId: bootstrapAssignments[0]?.taskId ?? null,
      runId: bootstrapExecutionRequests[0]?.requestId ?? null,
      stageId: "bootstrap",
      status: bootstrapValidation?.isValid ? "validated" : "pending",
      progressPercent: bootstrapValidation?.isValid ? 100 : bootstrapAssignments.length > 0 ? 25 : 0,
      startedAt: project.state?.observed?.lastObservedAt ?? null,
      updatedAt: project.state?.observed?.lastObservedAt ?? null,
      completionEstimate: bootstrapValidation?.isValid ? "completed" : null,
    },
    runtimeLogs: [],
  });
  const { normalizedProgressInputs } = createRunProgressNormalizer({
    taskExecutionState: {
      taskId: bootstrapAssignments[0]?.taskId ?? null,
      runId: bootstrapExecutionRequests[0]?.requestId ?? null,
      stageId: "bootstrap",
      status: bootstrapValidation?.isValid ? "validated" : "pending",
      progressPercent: bootstrapValidation?.isValid ? 100 : bootstrapAssignments.length > 0 ? 25 : 0,
      startedAt: project.state?.observed?.lastObservedAt ?? null,
      updatedAt: project.state?.observed?.lastObservedAt ?? null,
      completionEstimate: bootstrapValidation?.isValid ? "completed" : null,
    },
    runtimeLogs: [],
    taskResults: canonicalTaskResults,
  });
  const { taskExecutionMetric } = defineTaskExecutionMetricSchema({
    projectId: project.id ?? null,
    taskResults: canonicalTaskResults,
    roadmap: project.cycle?.roadmap ?? [],
  });
  const { taskExecutionCounters } = createTaskExecutionTracker({
    taskExecutionMetric,
  });
  const { userAgentMapping } = createUserAgentOwnershipMappingModel({
    projectId: project.id ?? null,
    userIdentity,
    workspaceModel,
    membershipRecord,
    projectOwnershipBinding,
    ownerAuthState,
    taskExecutionMetric,
    taskResults: canonicalTaskResults,
  });
  const { taskThroughputSummary } = createTaskThroughputAggregator({
    taskExecutionMetric,
    taskExecutionCounters,
  });
  const { baselineEstimate } = createBaselineEffortEstimator({
    projectId: project.id ?? null,
    taskResults: canonicalTaskResults,
    events: project.events ?? [],
    domain,
    context: project.context ?? null,
  });
  const { timeSavedMetric } = defineTimeSavedEstimationSchema({
    projectId: project.id ?? null,
    taskResults: canonicalTaskResults,
    events: project.events ?? [],
    baselineEstimates: Object.fromEntries(
      (baselineEstimate?.entries ?? [])
        .filter((entry) => entry?.taskId)
        .map((entry) => [entry.taskId, entry.baselineEstimateMs]),
    ),
  });
  const { timeSaved } = createTimeSavedCalculator({
    projectId: project.id ?? null,
    timeSavedMetric,
  });
  const { humanUserProductivity } = createHumanUserProductivityResolver({
    projectId: project.id ?? null,
    timeSaved,
    userAgentMapping,
  });
  const { productivitySummary } = createProductivitySummaryAggregator({
    timeSaved,
    humanUserProductivity,
  });
  const { outcomeEvaluation } = defineOutcomeEvaluationSchema({
    projectId: project.id ?? null,
    taskResults: canonicalTaskResults,
    taskExecutionMetric,
    taskThroughputSummary,
    productivitySummary,
  });
  const { actionSuccessScore } = createActionSuccessScoringEngine({
    projectId: project.id ?? null,
    outcomeEvaluation,
  });
  const { outcomeFeedbackState } = createOutcomeFeedbackLoop({
    projectId: project.id ?? null,
    outcomeEvaluation,
    actionSuccessScore,
    taskThroughputSummary,
    productivitySummary,
  });
  const { progressPhase } = createProgressPhaseResolver({
    normalizedProgressInputs,
  });
  const { progressPercent } = createProgressPercentageCalculator({
    normalizedProgressInputs,
    progressPhase,
  });
  const { completionEstimate } = createCompletionEstimateCalculator({
    normalizedProgressInputs,
    progressPercent,
  });
  const { progressState } = createLiveProgressAssembler({
    progressPhase,
    progressPercent,
    completionEstimate,
  });
  const { goalProgressState } = createGoalProgressEvaluator({
    projectId: project.id ?? null,
    goal: project.goal ?? null,
    outcomeFeedbackState,
    progressState,
    actionSuccessScore,
  });
  const { formattedLogs, userFacingMessages } = createExecutionLogFormatter({
    rawLogs: executionProgressSchema.logSchema.entries ?? [],
    commandOutputs: bootstrapRawExecutionResults.flatMap((item) =>
      (item.rawExecutionResult?.commandResults ?? []).map((commandResult) => ({
        command: commandResult.command,
        output: commandResult.output,
        source: commandResult.surfaceId ?? "execution",
        timestamp: null,
        exitCode: commandResult.exitCode,
      })),
    ),
  });
  const { platformTrace, platformLogs } = createPlatformLoggingAndTracingLayer({
    runtimeEvents: {
      runId: executionProgressSchema.runId,
      status: progressPhase,
      progressEntries: executionProgressSchema.logSchema.entries ?? [],
      formattedLogs,
      executionEvents: bootstrapRawExecutionResults.flatMap((item) =>
        (item.rawExecutionResult?.commandResults ?? []).map((commandResult, index) => ({
          id: `${item.requestId ?? "request"}-command-${index + 1}`,
          source: commandResult.surfaceId ?? "execution-surface",
          status: commandResult.exitCode === 0 ? "completed" : "failed",
          message: commandResult.command ?? null,
          timestamp: null,
        })),
      ),
    },
    requestContext: {
      requestId: executionProgressSchema.runId,
      route: "/runtime/bootstrap",
      method: "SYSTEM",
      actorId: project.userId ?? null,
      workspaceId: project.id,
      service: "context-builder",
    },
    observabilityTransport,
  });
  const { notificationPayload } = createExecutionCompletionNotifier({
    executionResult: {
      taskId: bootstrapAssignments[0]?.taskId ?? null,
      status: bootstrapValidation?.isValid ? "completed" : "failed",
      reason: bootstrapValidation?.isValid ? null : "Bootstrap validation failed",
      requiresUserAction: bootstrapValidation?.isValid ? false : decisionIntelligence?.summary?.requiresApproval,
    },
    decisionIntelligence,
  });
  const { notificationEvent } = defineNotificationEventSchema({
    eventType: notificationPayload?.type,
    eventPayload: {
      ...notificationPayload,
      projectId: project.id,
      actorId: project.userId ?? null,
    },
  });
  const { incidentAlert } = createAlertingAndIncidentHooks({
    platformTrace: {
      ...platformTrace,
      logs: platformLogs,
    },
    healthStatus: project.state?.observed?.health ?? null,
    projectId: project.id,
    actorId: project.userId ?? project.manualContext?.userId ?? null,
    userEmail: project.manualContext?.userProfile?.email ?? null,
    deliveryPreferences: project.manualContext?.deliveryPreferences ?? null,
    channelConfig: {
      channelType: project.manualContext?.channelConfig?.channelType ?? "webhook",
      provider: project.manualContext?.channelConfig?.provider ?? "external-webhook",
      webhookUrl: project.manualContext?.channelConfig?.webhookUrl ?? null,
      target: project.manualContext?.channelConfig?.target ?? null,
      providerSessionId: project.manualContext?.channelConfig?.providerSessionId ?? null,
    },
    observabilityTransport,
  });
  const { releasePlan, releaseSteps } = createReleasePlanGenerator({
    projectState: {
      ...(project.state ?? {}),
      lifecycle: project.state?.lifecycle ?? null,
      recommendedDefaults,
    },
    domain,
    domainProfile,
  });
  const { buildTargets, artifactManifest } = createBuildTargetResolver({
    domain,
    releaseTarget: releasePlan.releaseTarget,
  });
  const releaseRequirementsSchema = defineReleaseRequirementsSchema({
    releaseTarget: releasePlan.releaseTarget,
    domain,
  });
  const { artifactValidation } = createArtifactReadinessValidator({
    projectArtifacts: [
      ...(bootstrapPlan?.artifactManifest?.structure ?? []),
      ...(bootstrapPlan?.artifactManifest?.stack ?? []),
      bootstrapPlan?.artifactManifest?.hostingTarget,
    ].filter(Boolean),
    releaseRequirements: releaseRequirementsSchema,
  });
  const { metadataValidation } = createMetadataReadinessValidator({
    projectArtifacts: buildReleaseMetadata({
      project,
      domain,
      releasePlan,
      recommendedDefaults,
      businessContext,
    }),
    releaseRequirements: releaseRequirementsSchema,
  });
  const { approvalValidation } = createApprovalReadinessValidator({
    releaseRequirements: releaseRequirementsSchema,
    projectState: {
      approvals: project.approvals ?? [],
      decisionIntelligence,
    },
  });
  const { blockingIssues } = createBlockingIssuesClassifier({
    artifactValidation,
    metadataValidation,
    approvalValidation,
  });
  const { validationReport } = createReleaseValidationAssembler({
    artifactValidation,
    metadataValidation,
    approvalValidation,
    blockingIssues,
    releaseRequirements: releaseRequirementsSchema,
  });
  const { hostingAdapter } = createHostingProviderAdapterContract({
    providerConfig: {
      provider: recommendedDefaults?.hosting?.provider ?? releasePlan?.releaseTargetTaxonomy?.provider ?? "generic",
      target: releasePlan?.releaseTarget ?? recommendedDefaults?.hosting?.target ?? "private-deployment",
    },
  });
  const { deploymentRequest } = defineDeploymentRequestSchema({
    buildArtifact: [
      ...(bootstrapPlan?.artifactManifest?.structure ?? []),
      ...(bootstrapPlan?.artifactManifest?.stack ?? []),
      bootstrapPlan?.artifactManifest?.hostingTarget,
    ].filter(Boolean),
    deploymentConfig: {
      provider: hostingAdapter.provider,
      target: hostingAdapter.target,
      environment: hostingAdapter.environments?.includes("production") ? "production" : "staging",
      executionMode: hostingAdapter.executionModes?.[0] ?? "manual",
      capabilities: hostingAdapter.capabilities ?? [],
    },
  });
  const { providerAdapter } = createDeploymentProviderResolver({
    deploymentRequest,
  });
  const { accountRecord } = createExternalAccountRegistry({
    accountType: "hosting",
    accountMetadata: {
      provider: providerAdapter.provider,
      projectId: project.id,
      capabilities: providerAdapter.capabilities,
      connectionMode: providerAdapter.executionModes?.[0] ?? "manual",
      metadata: {
        target: providerAdapter.target,
        environments: providerAdapter.environments,
      },
    },
  });
  const { credentialReference, encryptedCredential, credentialVaultRecord } = createCredentialVaultInterface({
    credentialKey: `${project.id}-${providerAdapter.provider}-primary`,
    credentialValue:
      project.gitSource?.apiKey
      ?? project.runtimeSource?.apiKey
      ?? project.source?.apiKey
      ?? `${project.id}-${providerAdapter.provider}-credential`,
  });
  const { credentialPolicyDecision } = createCredentialUsagePolicy({
    credentialReference,
    actorType: approvalRequest.actorType,
    flowType: "deploy",
    projectState: {
      approvalStatus,
      policyDecision,
      credentialVaultRecord,
      linkedAccounts: project.linkedAccounts ?? [],
    },
  });
  const { providerSession } = createProviderSessionFactory({
    providerType: "hosting",
    credentials: {
      credentialReference,
      authMode: accountRecord.connectionMode,
      status: accountRecord.status,
    },
  });
  const { authModeDefinition } = createAuthenticationModeContract({
    providerType: "hosting",
    credentials: {
      credentialReference,
      authMode: accountRecord.connectionMode,
      status: accountRecord.status,
    },
  });
  const { providerSession: providerContractSession } = createProviderConnectorContract({
    providerType: "hosting",
    credentials: {
      credentialReference,
      authMode: accountRecord.connectionMode,
      status: accountRecord.status,
    },
  });
  const { providerConnectorSchema } = defineProviderConnectorSchema({
    providerType: providerSession.providerType,
  });
  const { providerCapabilities } = createProviderCapabilityDescriptor({
    providerSession,
  });
  const { providerOperations } = createProviderOperationContract({
    providerSession,
  });
  const { providerConnector } = createProviderConnectorAssembler({
    providerSession,
    providerCapabilities,
    providerOperations,
  });
  const { providerDegradationState } = defineProviderDegradationSchema({
    providerSession,
    incidentAlert,
  });
  const { circuitBreakerDecision } = createProviderCircuitBreakerResolver({
    providerDegradationState,
    runtimeHealthSignals: project.state?.observed?.health ?? null,
  });
  const { providerRecoveryProbe } = createProviderRecoveryProbeFlow({
    circuitBreakerDecision,
    providerSession,
  });
  const { verificationResult } = createAccountVerificationModule({
    providerSession,
  });
  const { preparedArtifact } = createDeploymentArtifactPreparer({
    buildArtifact: deploymentRequest.buildArtifacts,
    deploymentConfig: {
      provider: providerAdapter.provider,
      target: providerAdapter.target,
      environment: providerAdapter.requestMetadata.environment,
      executionMode: providerAdapter.executionModes?.[0] ?? "manual",
      capabilities: providerAdapter.capabilities ?? [],
    },
  });
  const { artifactRecord } = createArtifactRegistryModule({
    buildResult: {
      buildTarget: buildTargets[0] ?? "unknown-build",
      artifacts: preparedArtifact.artifacts,
      outputPaths: preparedArtifact.artifacts.map((artifact) => `dist/${artifact}`),
      version: project.state?.version ?? null,
      status: "registered",
    },
  });
  const { ownershipPolicy } = createOwnershipPolicyModel({
    userId: project.userId ?? project.manualContext?.userId ?? null,
    projectId: project.id,
    linkedAccounts: project.linkedAccounts ?? [],
    releasePlan,
    artifactRecord,
  });
  const { consentRecord } = createOwnerConsentRecorder({
    projectId: project.id,
    consentAction: {
      actionType: "release-distribution",
      target: releasePlan.releaseTarget,
      approved: true,
    },
    ownershipPolicy,
    existingApprovals: project.approvals ?? [],
  });
  const { guardResult } = createOwnershipAwareReleaseGuard({
    releasePlan,
    linkedAccounts: project.linkedAccounts ?? [],
    ownershipPolicy,
  });
  const { deployPolicyDecision } = createDeployPolicyChecks({
    deploymentRequest,
    projectState: {
      approvalStatus,
      guardResult,
      validationReport,
      credentialPolicyDecision,
    },
  });
  const { enforcementResult } = createPolicyEnforcementGuard({
    policyDecision,
    approvalStatus,
    deployPolicyDecision,
    credentialPolicyDecision,
  });
  const { policyTrace } = createPolicyTraceBuilder({
    policyDecision,
    enforcementResult,
  });
  const { bottleneckState } = defineBottleneckSchema({
    projectState: {
      projectId: project.id,
      observed: project.state?.observed ?? null,
      gatingDecision,
      approvalStatus,
      policyTrace,
    },
    executionGraph: project.cycle?.executionGraph ?? null,
    taskResults: canonicalTaskResults,
  });
  const { packagingRequirements } = definePackagingRequirementsSchema({
    buildArtifact: artifactRecord.artifacts,
    releaseTarget: releasePlan.releaseTarget,
  });
  const { packageFormat } = createPackageFormatResolver({
    releaseTarget: releasePlan.releaseTarget,
    packagingRequirements,
  });
  const { packagingManifest } = createPackagingManifestBuilder({
    buildArtifact: artifactRecord.artifacts,
    packageFormat,
  });
  const { packagedArtifact: rawPackagedArtifact } = createPackageAssembler({
    buildArtifact: artifactRecord.artifacts,
    packagingManifest,
  });
  const { packageVerification } = createPackageVerificationModule({
    packagedArtifact: rawPackagedArtifact,
    packagingRequirements,
  });
  const { packagedArtifact } = createPackagingResultEnvelope({
    packagedArtifact: rawPackagedArtifact,
    packagingManifest,
    packageVerification,
  });
  const { testExecutionRequest } = defineTestExecutionSchema({
    buildTarget: buildTargets[0] ?? "unknown-build",
    testConfig: {
      releaseStage: releasePlan.releaseTarget === "private-deployment" ? "pre-release" : "pre-deploy",
      testTypes:
        domain === "mobile-app"
          ? ["unit", "integration", "e2e", "smoke", "sanity"]
          : ["unit", "integration", "smoke", "sanity"],
      coverageThreshold: domain === "casino" ? 0.9 : 0.8,
      retries: releasePlan.releaseTarget === "app-store" || releasePlan.releaseTarget === "play-store" ? 1 : 0,
      environment: providerAdapter.requestMetadata.environment ?? "ci",
    },
  });
  const { testRunPlan } = createAutomatedTestOrchestrationModule({
    testExecutionRequest,
    changeSet: plannedChanges,
  });
  const { rawTestResults } = createTestRunnerAdapterLayer({
    testRunPlan,
    executionSurface: bootstrapResolvedSurfaces[0] ?? null,
  });
  const { normalizedTestResults } = createTestResultNormalizationModule({
    rawTestResults,
  });
  const { qualityGateDecision } = createPreDeployQualityGate({
    normalizedTestResults,
    validationReport,
  });
  const { nextVersion, releaseTag } = createVersioningService({
    releasePolicy: releasePlan.releaseTarget === "app-store" || releasePlan.releaseTarget === "play-store"
      ? "minor"
      : "patch",
    currentVersion: project.state?.version ?? "0.0.0",
  });
  const releaseEvents = releaseSteps.map((step, index) => ({
    id: `release-${step.step}-${index + 1}`,
    step: step.step,
    summary: step.description ?? step.step,
    successCriteria: [step.step],
    lockKey: `release-${step.step}`,
  }));
  const {
    updatedProjectState: releaseStateUpdate,
    updatedExecutionGraph: releaseExecutionGraph,
  } = createReleaseStateUpdater({
    releaseEvents,
    validationReport,
    projectState: project.state ?? {},
  });
  const { releaseStatus } = createReleaseStatusStateModel({
    releaseEvents: releaseEvents.map((event, index) => ({
      ...event,
      status: validationReport?.isReady
        ? index === releaseEvents.length - 1
          ? "published"
          : "completed"
        : "failed",
    })),
  });
  const { activeBottleneck } = createActiveBottleneckResolver({
    bottleneckState,
    approvalStatus,
    policyDecision,
    credentialPolicyDecision,
    releaseStatus,
  });
  const { scoredBottleneck } = createBottleneckPriorityScorer({
    activeBottleneck,
    criticalPath: project.cycle?.criticalPath ?? null,
  });
  const { unblockPlan } = createUnblockPathGenerator({
    scoredBottleneck,
    replanTrigger: project.cycle?.replanTrigger ?? null,
  });
  const { updatedBottleneckState } = createBottleneckStateUpdater({
    unblockPlan,
    taskResult: project.taskResults?.[project.taskResults.length - 1] ?? null,
    activeBottleneck,
  });
  const {
    pollingRequest,
    resolvedPoller,
    rawStatusResponse,
    statusEvents,
    pollingDecision,
    pollingMetadata,
  } = createStoreAndProviderStatusPollers({
    releaseTarget: releasePlan.releaseTarget,
    providerSession,
  });
  const releaseRun = {
    releaseRunId: `release-run:${project.id}:${releasePlan.releaseTarget}`,
    steps: releaseSteps,
    createdAt: project.updatedAt ?? null,
  };
  const { releaseTimeline } = createReleaseTimelineBuilder({
    releaseRun,
    statusEvents,
  });
  const { systemBottleneckSummary } = createSystemBottleneckDetector({
    platformTrace: {
      ...platformTrace,
      logs: platformLogs,
      steps: [
        ...(platformTrace.steps ?? []),
        ...(providerDegradationState?.summary?.hasIncidentSignal
          ? [{
              stepId: `provider-degradation:${providerSession.providerType ?? "provider"}`,
              source: providerSession.providerType ?? "provider",
              status: providerDegradationState.health === "outage" ? "failed" : "blocked",
              timestamp: new Date().toISOString(),
              message: providerDegradationState.summary?.headline ?? "Provider degradation detected",
            }]
          : []),
      ],
    },
    healthStatus: {
      ...(project.state?.observed?.health ?? {}),
      incidentAlert,
    },
    queueObservability: {
      queueName: pollingRequest?.providerType ? `queue:${pollingRequest.providerType}` : "nexus-background",
      lagSeconds: pollingMetadata?.nextPollInSeconds ?? 0,
      retryPressure: pollingMetadata?.attempt ?? 0,
      queueDepth: bootstrapAssignments.length,
      stuckJobCount: incidentAlert?.incidents?.filter((incident) => incident.type === "queue-stall").length ?? 0,
      deadLetterCount: incidentAlert?.incidents?.filter((incident) => incident.type === "execution-failure").length ?? 0,
    },
  });
  const stack = buildStack(project);
  const capabilities = buildCapabilities(project);
  const gaps = buildGaps(project);
  const flows = buildFlows(project);
  const { userJourneys, journeySteps, journeyStateRegistry, journeyTransitionRegistry } = definePrimaryUserJourneys({
    productGoals: [project.goal],
    coreCapabilities: capabilities,
    businessContext,
  });
  const { journeyMap } = createJourneyMap({
    userJourneys,
  });
  const { screenInventory } = defineScreenInventory({
    journeyMap,
  });
  const { screenFlowMap } = createScreenToFlowMapping({
    screenInventory,
    journeyMap,
  });
  const screenContracts = (screenInventory.screens ?? []).map((screen) => {
    const screenContract = defineScreenContractSchema({
      screenType: screen.screenType,
    }).screenContract;
    const { screenGoal, primaryAction, secondaryActions } = createGoalAndCtaDefinitionModule({
      screenContract,
    });

    return {
      screenId: screen.screenId,
      title: screen.title,
      ...screenContract,
      screenGoal,
      primaryAction,
      secondaryActions,
    };
  });
  const mobileChecklist = {
    checklistId: `mobile-checklist:${project.id}`,
    screens: screenContracts.map((screenContract) =>
      createMobileReadinessChecklist({
        screenId: screenContract.screenId,
        title: screenContract.title,
        screenContract,
      }).mobileChecklist
    ),
  };
  mobileChecklist.summary = {
    totalScreens: mobileChecklist.screens.length,
    mobileReadyScreens: mobileChecklist.screens.filter((screen) => screen.summary.mobileReadyByContract).length,
    totalRequiredItems: mobileChecklist.screens.reduce(
      (total, screen) => total + (screen.summary.requiredItems ?? 0),
      0
    ),
  };
  const screenStates = {
    stateCollectionId: `screen-states:${project.id}`,
    screens: screenContracts.map((screenContract) =>
      createLoadingEmptyErrorStatesDefinition({
        screenId: screenContract.screenId,
        title: screenContract.title,
        screenContract,
      }).screenStates
    ),
  };
  screenStates.summary = {
    totalScreens: screenStates.screens.length,
    loadingScreens: screenStates.screens.filter((screen) => screen.states.loading?.enabled).length,
    emptyScreens: screenStates.screens.filter((screen) => screen.states.empty?.enabled).length,
    errorScreens: screenStates.screens.filter((screen) => screen.states.error?.enabled).length,
    successScreens: screenStates.screens.filter((screen) => screen.states.success?.enabled).length,
  };
  const screenValidationChecklist = {
    checklistCollectionId: `screen-validation:${project.id}`,
    screens: screenContracts.map((screenContract) => {
      const screenMobileChecklist = mobileChecklist.screens.find((screen) => screen.screenId === screenContract.screenId) ?? null;
      const screenStateDefinition = screenStates.screens.find((screen) => screen.screenId === screenContract.screenId) ?? null;

      return createScreenValidationChecklist({
        screenId: screenContract.screenId,
        title: screenContract.title,
        screenContract,
        mobileChecklist: screenMobileChecklist,
        screenStates: screenStateDefinition,
      }).screenValidationChecklist;
    }),
  };
  screenValidationChecklist.summary = {
    totalScreens: screenValidationChecklist.screens.length,
    readyScreens: screenValidationChecklist.screens.filter((screen) => screen.summary.isReadyForImplementation).length,
    blockedScreens: screenValidationChecklist.screens.filter((screen) => !screen.summary.isReadyForImplementation).length,
  };
  const { designTokens } = defineDesignTokenSchema({
    brandDirection: project.manualContext?.brandDirection ?? {
      brandId: project.id,
      productMode: "desktop-first-web",
      visualTone: "focused",
    },
  });
  const { typographySystem } = createTypographySystem({
    designTokens,
  });
  const { layoutSystem } = createSpacingAndLayoutSystem({
    designTokens,
  });
  const { colorRules } = createColorUsageRules({
    designTokens,
  });
  const { interactionStateSystem } = createInteractionStatesSystem({
    designTokens,
  });
  const { componentContract } = defineComponentContractSchema({
    componentType: project.manualContext?.componentType ?? "panel",
  });
  const { primitiveComponents } = createPrimitiveComponents({
    componentContract,
    designTokens,
  });
  const { layoutComponents } = createLayoutComponents({
    layoutSystem,
  });
  const { feedbackComponents } = createFeedbackComponents({
    interactionStateSystem,
  });
  const { navigationComponents } = createNavigationComponents({
    screenFlowMap,
  });
  const { dataDisplayComponents } = createDataDisplayComponents({
    screenInventory,
  });
  const { screenTemplateSchema } = defineScreenTemplateSchema({
    screenType: project.manualContext?.screenType ?? "workspace",
  });
  const { dashboardTemplate } = createDashboardTemplate({
    screenTemplateSchema: defineScreenTemplateSchema({
      screenType: "dashboard",
    }).screenTemplateSchema,
  });
  const { detailPageTemplate } = createDetailPageTemplate({
    screenTemplateSchema: defineScreenTemplateSchema({
      screenType: "detail",
    }).screenTemplateSchema,
  });
  const { workflowTemplate } = createWorkflowTemplate({
    screenTemplateSchema: defineScreenTemplateSchema({
      screenType: "wizard",
    }).screenTemplateSchema,
  });
  const { managementTemplate } = createManagementTemplate({
    screenTemplateSchema: defineScreenTemplateSchema({
      screenType: "management",
    }).screenTemplateSchema,
  });
  const { templateVariants } = createStateDrivenTemplateVariants({
    screenStates,
    screenTemplates: {
      dashboardTemplate,
      detailPageTemplate,
      workflowTemplate,
      managementTemplate,
    },
  });
  const primaryActionValidation = {
    validationCollectionId: `primary-action-validation:${project.id}`,
    screens: screenContracts.map((screenContract) => {
      const screenType = screenContract.screenType ?? "detail";
      const screenTemplate =
        screenType === "dashboard"
          ? dashboardTemplate
          : screenType === "wizard"
            ? workflowTemplate
            : screenType === "tracking"
              ? managementTemplate
              : screenType === "workspace"
                ? dashboardTemplate
                : detailPageTemplate;

      return createPrimaryActionValidator({
        screenId: screenContract.screenId,
        screenContract,
        screenTemplate,
      }).primaryActionValidation;
    }),
  };
  primaryActionValidation.summary = {
    totalScreens: primaryActionValidation.screens.length,
    validScreens: primaryActionValidation.screens.filter((screen) => screen.summary.isValid).length,
    blockedScreens: primaryActionValidation.screens.filter((screen) => !screen.summary.isValid).length,
  };
  const mobileValidation = {
    validationCollectionId: `mobile-validation:${project.id}`,
    screens: screenContracts.map((screenContract) => {
      const screenType = screenContract.screenType ?? "detail";
      const screenTemplate =
        screenType === "dashboard"
          ? dashboardTemplate
          : screenType === "wizard"
            ? workflowTemplate
            : screenType === "tracking"
              ? managementTemplate
              : screenType === "workspace"
                ? dashboardTemplate
                : detailPageTemplate;
      const screenMobileChecklist = mobileChecklist.screens.find((screen) => screen.screenId === screenContract.screenId) ?? null;

      return createMobileUsabilityValidator({
        screenId: screenContract.screenId,
        screenTemplate,
        mobileChecklist: screenMobileChecklist,
      }).mobileValidation;
    }),
  };
  mobileValidation.summary = {
    totalScreens: mobileValidation.screens.length,
    usableScreens: mobileValidation.screens.filter((screen) => screen.summary.isUsable).length,
    blockedScreens: mobileValidation.screens.filter((screen) => !screen.summary.isUsable).length,
  };
  const stateCoverageValidation = {
    validationCollectionId: `state-coverage-validation:${project.id}`,
    screens: screenContracts.map((screenContract) => {
      const screenType = screenContract.screenType ?? "detail";
      const screenTemplate =
        screenType === "dashboard"
          ? dashboardTemplate
          : screenType === "wizard"
            ? workflowTemplate
            : screenType === "tracking"
              ? managementTemplate
              : screenType === "workspace"
                ? dashboardTemplate
                : detailPageTemplate;
      const screenStateDefinition = screenStates.screens.find((screen) => screen.screenId === screenContract.screenId) ?? null;

      return createStateCoverageValidator({
        screenId: screenContract.screenId,
        screenTemplate,
        screenStates: screenStateDefinition,
      }).stateCoverageValidation;
    }),
  };
  stateCoverageValidation.summary = {
    totalScreens: stateCoverageValidation.screens.length,
    validScreens: stateCoverageValidation.screens.filter((screen) => screen.summary.isValid).length,
    blockedScreens: stateCoverageValidation.screens.filter((screen) => !screen.summary.isValid).length,
  };
  const consistencyValidation = {
    validationCollectionId: `consistency-validation:${project.id}`,
    screens: screenContracts.map((screenContract) => {
      const screenType = screenContract.screenType ?? "detail";
      const screenTemplate =
        screenType === "dashboard"
          ? dashboardTemplate
          : screenType === "wizard"
            ? workflowTemplate
            : screenType === "tracking"
              ? managementTemplate
              : screenType === "workspace"
                ? dashboardTemplate
                : detailPageTemplate;
      const componentLibrary =
        screenType === "dashboard"
          ? dataDisplayComponents
          : screenType === "wizard"
            ? primitiveComponents
            : screenType === "tracking"
              ? dataDisplayComponents
              : primitiveComponents;

      return createConsistencyValidator({
        screenId: screenContract.screenId,
        screenTemplate,
        designTokens,
        componentLibrary,
      }).consistencyValidation;
    }),
  };
  consistencyValidation.summary = {
    totalScreens: consistencyValidation.screens.length,
    validScreens: consistencyValidation.screens.filter((screen) => screen.summary.isConsistent).length,
    blockedScreens: consistencyValidation.screens.filter((screen) => !screen.summary.isConsistent).length,
  };
  const { screenReviewReport } = createScreenReviewAssembler({
    primaryActionValidation,
    mobileValidation,
    stateCoverageValidation,
    consistencyValidation,
  });
  const { learningInsights } = createBaselineLearningInsightsAssembler({
    taskResults: canonicalTaskResults,
    approvalRecords,
    approvalStatus,
    workspaceModel: project.context?.workspaceModel ?? project.state?.workspaceModel ?? null,
  });
  const { userIdentity } = defineUserIdentitySchema({
    userProfile: {
      userId: project.userId ?? project.manualContext?.userId ?? null,
      email: project.manualContext?.userProfile?.email ?? null,
      displayName: project.manualContext?.userProfile?.displayName ?? null,
      status: project.manualContext?.userProfile?.status ?? "active",
      verificationStatus: project.manualContext?.userProfile?.verificationStatus ?? null,
    },
    authMetadata: {
      provider: project.manualContext?.authMetadata?.provider ?? "password",
      sessionStatus: project.manualContext?.authMetadata?.sessionStatus ?? "authenticated",
      hasMfa: project.manualContext?.authMetadata?.hasMfa ?? false,
      lastLoginAt: project.manualContext?.authMetadata?.lastLoginAt ?? null,
    },
  });
  const { notificationPreferences } = createNotificationPreferenceSettings({
    userIdentity,
    preferenceInput: project.manualContext?.deliveryPreferences ?? null,
  });
  const { userPreferenceProfile } = createBaselineUserPreferenceProfileAssembler({
    userIdentity,
    notificationPreferences,
    approvalRecords,
    approvalStatus,
  });
  const { learningInsightViewModel } = defineLearningInsightUiSchema({
    learningInsights,
    learningTrace: project.context?.learningTrace ?? null,
  });
  const { reasoningPanel } = createRecommendationReasoningPanelContract({
    impactSummary,
    learningTrace: project.context?.learningTrace ?? null,
    policyTrace,
  });
  const { confidenceIndicator } = createPatternConfidenceIndicator({
    learningInsightViewModel,
  });
  const { userPreferenceSignals } = createUserPreferenceSignalView({
    userPreferenceProfile,
    approvalFeedbackMemory: project.context?.approvalFeedbackMemory ?? project.approvalRecords ?? [],
  });
  const { crossProjectPatternPanel } = createCrossProjectPatternDisclosurePanel({
    crossProjectMemory: project.context?.crossProjectMemory ?? null,
    recommendationHints: project.context?.recommendationHints ?? [],
  });
  const { learningDisclosure } = createPassiveLearningDisclosureBanner({
    learningInsights,
  });
  const { aiLearningWorkspaceTemplate } = createAiLearningWorkspaceTemplate({
    screenTemplateSchema: defineScreenTemplateSchema({ screenType: "workspace" }).screenTemplateSchema,
    learningInsightViewModel,
  });
  const { contextRelevanceSchema } = defineContextRelevanceSchema({
    projectState: {
      id: project.id,
      screenReviewReport,
      activeBottleneck,
      progressState,
      approvals: project.approvals ?? [],
      events: project.events ?? [],
    },
    interactionContext: {
      projectId: project.id,
      currentSurface: "workspace",
      currentTask: project.context?.currentTask ?? null,
      urgency: activeBottleneck ? "high" : "normal",
      visible: true,
    },
  });
  const { relevanceFilteredContext } = createContextRelevanceFilter({
    contextRelevanceSchema,
    projectState: {
      id: project.id,
      screenReviewReport,
      activeBottleneck,
      progressState,
      approvals: project.approvals ?? [],
      events: project.events ?? [],
    },
    screenContext: {
      projectId: project.id,
      currentSurface: "workspace",
      currentTask: project.context?.currentTask ?? null,
      urgency: activeBottleneck ? "high" : "normal",
      visible: true,
    },
  });
  const { slimmedContextPayload, droppedContextSummary } = createContextSlimmingPipeline({
    relevanceFilteredContext,
    tokenBudget: {
      rawBudget: 1200,
      maxItems: 3,
      maxSummaryItems: 2,
    },
  });
  const { companionState } = createCompanionStateModel({
    learningInsights,
    decisionIntelligence,
    notificationPayload,
  });
  const { companionTriggerDecision } = createCompanionTriggerPolicy({
    companionState,
    policyTrace,
    executionStatus: {
      projectId: project.id,
      status: progressState?.status ?? notificationPayload?.status ?? "idle",
      mode: project.context?.executionMode ?? "interactive",
    },
  });
  const { companionMessagePriority } = createCompanionMessagePriorityResolver({
    learningInsights,
    gatingDecision,
    notificationPayload,
  });
  const { companionPresence } = defineAiCompanionPresenceSchema({
    assistantState: companionState,
    interactionContext: {
      projectId: project.id,
      currentSurface: "workspace",
      currentTask: project.context?.currentTask ?? null,
      executionMode: project.context?.executionMode ?? "interactive",
      surface: "workspace",
      urgency: companionTriggerDecision.summary.canInterrupt ? "high" : activeBottleneck ? "high" : "low",
      visible: companionTriggerDecision.visibility.visible,
    },
  });
  const { companionDock, companionPanel } = createCompanionDockAndPanelContract({
    companionPresence,
    companionMessagePriority,
  });
  const { animationStateRules } = createCompanionAnimationStateRules({
    companionState,
    companionTriggerDecision,
  });
  const { companionModeSettings } = createCompanionModeControls({
    userPreferenceProfile,
    companionPresence,
  });
  const { interruptionDecision } = createCompanionInterruptionGuard({
    companionTriggerDecision,
    progressState,
  });
  const { aiCompanionTemplate } = createAiCompanionWorkspaceTemplate({
    screenTemplateSchema,
    companionDock,
    companionPanel,
  });
  const { nexusPersistenceSchema } = defineNexusPersistenceSchema({
    coreEntityDefinitions: project.manualContext?.coreEntityDefinitions ?? null,
  });
  const { migrationPlan, migrationArtifacts } = createNexusDatabaseMigrations({
    nexusPersistenceSchema,
  });
  const repositoryEntities = ["users", "workspaces", "projects", "approvals", "learningRecords"];
  const entityRepository = repositoryEntities.map((entityType) =>
    createRepositoryLayerForCoreEntities({
      nexusPersistenceSchema,
      entityType,
    }).entityRepository
  );

  const state = createCanonicalState({
    goal: project.goal,
    stack: buildStack(project),
    capabilities,
    gaps,
    flows,
  });

  const context = createCanonicalProject({
    version: "1.0.0",
    projectId: project.id,
    domain,
    state,
    sources: {
      scan: Boolean(project.scan),
      external: Boolean(project.externalSnapshot),
      manual: Boolean(project.manualContext),
    },
  });

  context.stack = context.state.stack;
  context.capabilities = context.state.capabilities;
  context.gaps = context.state.gaps;
  context.flows = context.state.flows;
  context.bottleneck = resolveBottleneck(project, context);
  const { authenticationState } = createAuthenticationSystem({
    userIdentity,
    credentials: {
      authMethod: project.manualContext?.credentials?.authMethod ?? null,
      password: project.manualContext?.credentials?.password ?? null,
      providerToken: project.manualContext?.credentials?.providerToken ?? null,
      isLoggedOut: project.manualContext?.credentials?.isLoggedOut ?? false,
    },
  });
  const { notificationCenterState } = createInAppNotificationCenter({
    notificationEvent,
    userIdentity,
  });
  const { emailDeliveryResult } = createEmailNotificationDeliveryModule({
    notificationEvent: {
      ...notificationEvent,
      userEmail: userIdentity.email,
    },
    deliveryPreferences: {
      ...notificationPreferences,
      email: project.manualContext?.deliveryPreferences?.email ?? userIdentity.email,
      priority: project.manualContext?.deliveryPreferences?.priority ?? "normal",
      subjectOverride: project.manualContext?.deliveryPreferences?.subjectOverride ?? null,
    },
  });
  const { externalDeliveryResult } = createWebhookExternalNotificationAdapter({
    notificationEvent,
    channelConfig: {
      channelType: project.manualContext?.channelConfig?.channelType ?? "webhook",
      provider: project.manualContext?.channelConfig?.provider ?? "external-webhook",
      webhookUrl: project.manualContext?.channelConfig?.webhookUrl ?? null,
      target: project.manualContext?.channelConfig?.target ?? null,
      providerSessionId: project.manualContext?.channelConfig?.providerSessionId ?? null,
    },
  });
  const { sessionState, tokenBundle } = createSessionAndTokenManagement({
    userIdentity,
    authenticationState,
  });
  const { securitySignals } = createSecuritySignals({
    rateLimitSignals: project.manualContext?.rateLimitSignals ?? null,
    authSignals: project.manualContext?.authSignals ?? null,
    anomalySignals: project.manualContext?.anomalySignals ?? null,
  });
  const { sessionSecurityDecision } = createSessionSecurityControls({
    sessionState: {
      ...sessionState,
      ...(project.manualContext?.sessionSecurityContext ?? {}),
    },
    securitySignals,
  });
  const { authenticationRouteDecision } = createAuthenticationRouteResolver({
    authenticationState,
    sessionState,
  });
  const { verificationFlowState } = createPasswordResetAndEmailVerificationFlow({
    userIdentity,
    verificationRequest: project.manualContext?.verificationRequest ?? null,
  });
  const { authenticationViewState } = buildAuthenticationScreenStates({
    authenticationRouteDecision,
    verificationFlowState,
  });
  const { workspaceModel, membershipRecord } = defineWorkspaceAndMembershipModel({
    userIdentity,
    workspaceMetadata: project.manualContext?.workspaceMetadata ?? null,
  });
  const { ownerAuthState } = createOwnerSecureAuthenticationSystem({
    userIdentity,
    authenticationState,
    sessionSecurityDecision,
    membershipRecord,
    workspaceModel,
  });
  const { ownerMfaDecision } = createOwnerMfaEnforcement({
    ownerAuthState,
    authenticationState,
    sessionSecurityDecision,
    requestContext: project.manualContext?.ownerSecurityContext ?? null,
  });
  const { complianceConsentState } = createComplianceConsentAndLegalBasisRegistry({
    userIdentity,
    consentRecord: project.manualContext?.consentRecordOverride ?? consentRecord,
    notificationPreferences,
    approvalRecords,
    consentEntries: project.manualContext?.consentEntries ?? [],
    scopeContext: {
      workspaceId: workspaceModel?.workspaceId ?? null,
      projectId: project.id ?? null,
    },
  });
  const { postAuthRedirect } = createPostAuthRedirectResolver({
    authenticationRouteDecision,
    sessionState,
    workspaceModel,
  });
  const { projectCreationExperience } = createProjectCreationExperienceModel({
    workspaceModel,
    postLoginDestination: postAuthRedirect.destination,
  });
  const { projectCreationRedirect } = createPostProjectCreationRedirectResolver({
    projectDraft,
    projectCreationExperience,
  });
  const { onboardingProgress } = createOnboardingProgressModel({
    onboardingSession: project.onboardingSession ?? null,
    currentStep: project.onboardingSession?.currentStep ?? null,
  });
  const { onboardingViewState } = buildOnboardingScreenFlow({
    onboardingSession: project.onboardingSession ?? null,
    onboardingProgress,
    requiredActions: project.requiredActions ?? project.onboardingSession?.requiredActions ?? [],
  });
  const { onboardingCompletionDecision } = createOnboardingCompletionEvaluator({
    projectIntake: project.projectIntake ?? project.onboardingSession?.projectIntake ?? null,
    onboardingSession: project.onboardingSession ?? null,
  });
  const { onboardingStateHandoff } = createOnboardingToStateHandoffContract({
    projectDraft,
    projectIntake: project.projectIntake ?? project.onboardingSession?.projectIntake ?? null,
    onboardingCompletionDecision,
    onboardingSession: project.onboardingSession ?? null,
  });
  const { activationGoals } = deriveActivationGoals({
    nexusPositioning,
    onboardingCompletionDecision,
    projectCreationSummary: project.projectCreationSummary ?? null,
  });
  const { productCtaStrategy } = createProductCtaStrategy({
    messagingFramework,
    activationGoals,
    analyticsSummary: project.analyticsSummary ?? null,
  });
  const { nexusWebsiteSchema } = defineNexusWebsiteSchema({
    messagingFramework,
    productCtaStrategy,
  });
  const { landingPageIa } = createLandingPageInformationArchitecture({
    nexusWebsiteSchema,
    messagingFramework,
  });
  const { websiteCopyPack } = createNexusWebsiteCopyPack({
    nexusWebsiteSchema,
    landingPageIa,
    messagingFramework,
    objectionMap,
    faqMap,
    productCtaStrategy,
  });
  const { websiteConversionFlow } = createWebsiteConversionFlow({
    productCtaStrategy,
    authenticationState,
  });
  const { waitlistRecord, accessRequest } = createWaitlistAndAccessRequestModule({
    visitorInput: project.manualContext?.visitorInput ?? {
      email: userIdentity?.email ?? null,
    },
    websiteConversionFlow,
  });
  const { websiteExperimentPlan } = createWebsiteExperimentAndCtaTestLayer({
    websiteCopyPack,
    productCtaStrategy,
    analyticsSummary: project.analyticsSummary ?? null,
  });
  const { trustProofBlocks } = createTrustProofBlockBuilder({
    messagingFramework,
    objectionMap,
    landingPageIa,
  });
  const { productDeliveryModel } = defineProductDeliveryModelSchema({
    businessContext,
    distributionConstraints: businessContext?.constraints ?? [],
    nexusWebsiteSchema,
  });
  const { siteAppBoundary } = createPublicSiteAndAppBoundaryModel({
    productDeliveryModel,
    nexusWebsiteSchema,
  });
  const { accessModeDecision } = createAccessModeResolver({
    productDeliveryModel,
    launchStage: businessContext?.gtmStage ?? null,
    visitorContext: project.manualContext?.visitorContext ?? project.manualContext?.visitorInput ?? null,
    waitlistRecord,
    accessRequest,
  });
  const { landingAuthHandoff } = createPublicLandingAuthHandoffFlow({
    siteAppBoundary,
    accessModeDecision,
    productCtaStrategy,
  });
  const { appEntryDecision } = createAppEntryGateResolver({
    landingAuthHandoff,
    authenticationState,
    sessionState,
  });
  const { projectPermissionSchema } = defineProjectPermissionSchema({
    workspaceModel,
    projectType: project.projectType ?? project.manualContext?.projectType ?? project.domain ?? null,
  });
  const { roleCapabilityMatrix } = createProjectRoleCapabilityMatrix({
    projectPermissionSchema,
  });
  const projectOwnershipBinding = {
    bindingId: `project-ownership:${project.id ?? projectDraft.id ?? "unknown"}`,
    projectId: project.id ?? projectDraft.id ?? null,
    ownerUserId: project.userId ?? userIdentity.userId ?? projectDraft.owner?.userId ?? null,
    workspaceId: workspaceModel?.workspaceId ?? null,
    role: membershipRecord?.role ?? membershipRecord?.roles?.[0] ?? "owner",
  };
  const { initialProjectStateContract } = defineInitialProjectStateCreationContract({
    onboardingStateHandoff,
    projectOwnershipBinding,
  });
  const { initialProjectState } = defineCanonicalInitialProjectStateSchema({
    initialProjectStateContract,
    projectIdentity,
  });
  const { stateBootstrapPayload } = createOnboardingToStateTransformationMapper({
    onboardingStateHandoff,
    initialProjectState,
  });
  const { initialProjectState: bootstrappedInitialProjectState } = createProjectStateBootstrapService({
    stateBootstrapPayload,
    projectOwnershipBinding,
  });
  const { initialProjectStateValidation, stateValidationIssues } = createInitialProjectStateValidationModule({
    initialProjectState: bootstrappedInitialProjectState,
    initialProjectStateContract,
  });
  const { initialTasks, taskSeedMetadata } = createInitialTaskSeedingService({
    initialProjectState: bootstrappedInitialProjectState,
    domainDecision,
  });
  const { accessDecision } = createProjectAccessControlModule({
    workspaceModel,
    membershipRecord,
    projectId: project.id,
    actorType: project.manualContext?.actorType ?? membershipRecord?.role ?? "owner",
    policyDecision,
  });
  const { projectAuthorizationDecision } = createActionLevelProjectAuthorizationResolver({
    actorType: project.manualContext?.actorType ?? membershipRecord?.role ?? "owner",
    projectAction: project.manualContext?.projectAction ?? policyDecision?.actionType ?? "view",
    roleCapabilityMatrix,
    policyDecision,
  });
  const { productBoundaryModel } = defineProductBoundarySchema({
    productVision: {
      statement: projectIdentity?.vision ?? project.goal ?? null,
      problem: project.projectIntake?.problem ?? projectIdentity?.vision ?? project.goal ?? null,
      promise: nexusPositioning?.promise ?? null,
      audience: projectIdentity?.audience ?? businessContext?.targetAudience ?? null,
    },
    projectIdentity,
    nexusPositioning,
    projectAuthorizationDecision,
    decisionIntelligence,
  });
  const { capabilityLimitMap } = createCapabilityPromiseAndLimitMap({
    productBoundaryModel,
    agentGovernancePolicy,
  });
  const { boundaryDisclosureModel } = createBoundaryDisclosureAndExpectationModel({
    capabilityLimitMap,
    messagingFramework,
  });
  const { systemCapabilityRegistry } = defineSystemCapabilityRegistrySchema({
    productBoundaryModel,
    capabilityLimitMap,
    executionModes,
  });
  const { externalCapabilityRegistry } = defineExternalCapabilityRegistrySchema({
    systemCapabilityRegistry,
    providerSession,
    providerConnectorSchema,
    providerCapabilities,
    providerOperations,
    providerConnector,
    verificationResult,
    linkedAccounts: project.linkedAccounts ?? [],
  });
  const { sourceControlIntegration } = createSourceControlIntegrationBinder({
    projectId: project.id,
    externalCapabilityRegistry,
    gitSnapshot: project.gitSnapshot ?? null,
    linkedAccounts: project.linkedAccounts ?? [],
  });
  const { secretResolutionState } = createSecretResolutionModule({
    projectId: project.id,
    credentialReference,
    credentialVaultRecord,
    linkedAccounts: project.linkedAccounts ?? [],
    externalCapabilityRegistry,
    sourceControlIntegration,
  });
  const { connectorCredentialBinding } = createConnectorCredentialBindingResolver({
    projectId: project.id,
    externalCapabilityRegistry,
    secretResolutionState,
    providerConnector,
    linkedAccounts: project.linkedAccounts ?? [],
  });
  const { inboundWebhookIngestion } = createInboundProviderWebhookIngestionGateway({
    projectId: project.id,
    notificationEvent,
    externalCapabilityRegistry,
    connectorCredentialBinding,
    channelConfig: {
      channelType: project.manualContext?.channelConfig?.channelType ?? "webhook",
      provider: project.manualContext?.channelConfig?.provider ?? "external-webhook",
      webhookUrl: project.manualContext?.channelConfig?.webhookUrl ?? null,
      target: project.manualContext?.channelConfig?.target ?? null,
      providerSessionId: project.manualContext?.channelConfig?.providerSessionId ?? null,
      idempotencyKey: project.manualContext?.channelConfig?.idempotencyKey ?? null,
    },
  });
  const { capabilityDecision } = createSystemCapabilityResolver({
    systemCapabilityRegistry,
    requestedAction: project.manualContext?.projectAction ?? policyDecision?.actionType ?? "view",
    workspaceModel,
  });
  const { privilegedAuthorityDecision } = createPrivilegedActionAuthorityResolver({
    projectAuthorizationDecision,
    approvalStatus,
    deployPolicyDecision,
    credentialPolicyDecision,
  });
  const { deviceTrustDecision } = createDeviceTrustSystem({
    ownerAuthState,
    requestContext: project.manualContext?.requestContext ?? project.manualContext?.ownerSecurityContext ?? null,
  });
  const { sensitiveActionConfirmation } = createSensitiveActionConfirmationSystem({
    ownerMfaDecision,
    privilegedAuthorityDecision,
  });
  const { stepUpAuthDecision } = createStepUpAuthenticationSystem({
    deviceTrustDecision,
    securitySignals,
  });
  const { privilegedModeState } = createPrivilegedModeSystem({
    stepUpAuthDecision,
    sensitiveActionConfirmation,
    requestContext: project.manualContext?.ownerSecurityContext ?? null,
  });
  const { ownerAccessDecision } = createAdminOnlyAccessLayer({
    privilegedModeState,
    ownerControlPlane: {
      ownerRole: membershipRecord?.role ?? "owner",
    },
    requestContext: project.manualContext?.requestContext ?? project.manualContext?.ownerSecurityContext ?? null,
  });
  const { criticalOperationDecision } = createCriticalOperationGuardrails({
    ownerAccessDecision,
    sensitiveActionConfirmation,
    requestContext: project.manualContext?.requestContext ?? project.manualContext?.ownerSecurityContext ?? null,
  });
  const { invitationRecord, roleAssignment } = createRoleAssignmentAndInvitationFlow({
    workspaceModel,
    invitationRequest: project.manualContext?.invitationRequest ?? null,
  });
  const { workspaceSettings } = createOrganizationWorkspaceSettingsModule({
    workspaceModel,
    settingsInput: project.manualContext?.workspaceSettingsInput ?? null,
  });
  const { workspaceMode, workspaceModeDefinitions } = createWorkspaceOperatingModeResolver({
    workspaceSettings,
  });
  const { tenantIsolationSchema } = defineTenantIsolationSchema({
    workspaceModel,
    resourceDefinitions: project.manualContext?.resourceDefinitions ?? null,
  });
  const { workspaceIsolationDecision } = createWorkspaceIsolationGuard({
    tenantIsolationSchema,
    requestContext: project.manualContext?.requestContext ?? {
      workspaceId: workspaceModel?.workspaceId ?? null,
      resourceType: "project-state",
      resourceId: `project-state:${project.id}`,
      actionType: project.manualContext?.projectAction ?? "view",
    },
  });
  const { tenantBoundaryEvidence } = createBaselineTenantBoundaryEvidenceAssembler({
    tenantIsolationSchema,
    workspaceIsolationDecision,
    projectAuthorizationDecision,
  });
  const { leakageAlert } = createCrossTenantLeakDetector({
    tenantBoundaryEvidence,
  });
  const learningEvent = project.manualContext?.learningEvent ?? {
    sourceWorkspaceId: learningInsights?.sourceWorkspaceId
      ?? project.context?.learningTrace?.sourceWorkspaceId
      ?? workspaceModel?.workspaceId
      ?? null,
    crossTenantSource: project.manualContext?.learningTrace?.crossTenantSource === true,
    providerBoundaryBreach: project.manualContext?.providerBoundaryBreach === true,
    mixedResources: project.manualContext?.mixedResources ?? [],
  };
  const { baselineCollaborationEvent } = createBaselineCollaborationEventAssembler({
    userIdentity,
    membershipRecord,
    accessDecision,
    sessionState,
    workspaceModel,
    approvalStatus,
    approvalRequestWithStatus,
    workspaceAction: project.manualContext?.workspaceAction ?? null,
  });
  const { collaborationEvent } = defineCollaborationEventSchema({
    workspaceAction: baselineCollaborationEvent.workspaceAction,
    actorContext: baselineCollaborationEvent.actorContext,
  });
  const previousActivityEvent = project.manualContext?.userActivityEvent ?? project.context?.userActivityEvent ?? null;
  const previousSessionMetric = project.manualContext?.userSessionMetric ?? project.context?.userSessionMetric ?? null;
  const { userActivityEvent } = defineUserActivityEventSchema({
    userId: previousSessionMetric?.userId ?? userIdentity?.userId ?? project.userId ?? null,
    sessionId: previousSessionMetric?.sessionId ?? sessionState?.sessionId ?? null,
    activityType: previousActivityEvent?.activityType ?? null,
    projectId: project.id ?? null,
    workspaceId: workspaceModel?.workspaceId ?? null,
    workspaceArea: previousSessionMetric?.workspaceArea ?? "developer-workspace",
    currentSurface: previousSessionMetric?.currentSurface ?? "developer-workspace",
    currentTask: previousSessionMetric?.currentTask ?? null,
    timestamp: previousActivityEvent?.timestamp ?? null,
    sessionMetric: previousSessionMetric,
    sessionState,
  });
  const { userSessionMetric } = createSessionActivityTracker({
    userActivityEvent,
    previousUserSessionMetric: previousSessionMetric ?? {
      userId: sessionState?.userId ?? userIdentity?.userId ?? null,
      status: sessionState?.status === "active" ? "active" : "idle",
      workspaceId: workspaceModel?.workspaceId ?? null,
      projectId: project.id,
      workspaceArea: "developer-workspace",
      activeUsers: project.manualContext?.activeUsers ?? null,
    },
  });
  const { returningUserMetric } = createReturningUserResolver({
    userSessionMetric,
    previousUserSessionMetric: previousSessionMetric ?? null,
  });
  const { userActivityHistory, userSessionHistory } = createDurableUserActivitySessionHistory({
    projectId: project.id,
    userActivityEvent,
    userSessionMetric,
    returningUserMetric,
    historyStore: userActivityHistoryStore,
  });
  const { retentionSummary } = createRetentionMetricsAggregator({
    projectId: project.id,
    userSessionHistory,
    returningUserMetric,
  });
  const { retentionCurveAnalysis } = createRetentionCurveAnalyzer({
    projectId: project.id,
    retentionSummary,
  });
  const { returnTomorrowContinuity } = createReturnTomorrowContinuityResolver({
    sessionState,
    projectState: project.state ?? null,
    postAuthRedirect,
    userSessionHistory,
    returningUserMetric,
  });
  const { postLoginDestination } = createPostLoginDestinationResolver({
    appEntryDecision,
    userSessionMetric,
    projectState: project.state ?? null,
    returnTomorrowContinuity,
  });
  const { appLandingEntry } = createAppLandingEntryExperience({
    siteAppBoundary,
    accessModeDecision,
    productCtaStrategy,
  });
  const { entryStateVariants } = createEntryStateVariantsAndRedirects({
    appEntryDecision,
    postLoginDestination,
    appLandingEntry,
  });
  const { entryRecoveryState } = createEntryLoadingAndRecoveryStates({
    appEntryDecision,
    sessionState,
    entryStateVariants,
  });
  const { entryOrientationPanel } = createAppEntryTrustAndOrientationPanel({
    appLandingEntry,
    trustProofBlocks,
  });
  const { entryDecisionSupport } = createEntryDecisionSupportFlow({
    entryStateVariants,
    accessModeDecision,
    entryOrientationPanel,
    visitorContext: project.manualContext?.visitorContext ?? project.manualContext?.visitorInput ?? null,
  });
  const { projectPresenceState } = createProjectPresenceModel({
    collaborationEvent,
    userSessionMetric,
  });
  const { storageRecord } = createFileAndArtifactStorageModule({
    artifactMetadata: {
      artifactRecord,
      packagedArtifact,
    },
    storageRequest: {
      projectId: project.id,
      workspaceId: workspaceModel?.workspaceId ?? null,
      runId: releaseTag ?? null,
      attachments: project.projectIntake?.attachments ?? project.manualContext?.attachments ?? [],
      retentionPolicy: nexusPersistenceSchema?.entities?.projects?.retentionPolicy ?? "project-lifecycle",
    },
  });
  const { backupStrategy, restorePlan } = createBackupAndRestoreStrategy({
    nexusPersistenceSchema,
    storageRecords: storageRecord,
  });
  const { dataPrivacyClassification } = defineDataPrivacyClassificationSchema({
    dataAsset: deriveDataAssetForPrivacy({
      project,
      tenantIsolationSchema,
      storageRecord,
      learningEvent,
      credentialReference,
      credentialVaultRecord,
    }),
    storageContext: deriveStorageContextForPrivacy({
      project,
      workspaceModel,
      tenantIsolationSchema,
      nexusPersistenceSchema,
      storageRecord,
    }),
  });
  const { platformCostMetric } = definePlatformUsageCostSchema({
    usageEvent: project.manualContext?.usageEvent ?? null,
    pricingMetadata: project.manualContext?.pricingMetadata ?? null,
  });
  const { aiUsageMetric } = createAiUsageMeter({
    modelInvocation:
      project.manualContext?.modelInvocation
      ?? (project.analysis?.modelUsed
        ? {
            modelName: project.analysis.modelUsed,
            projectId: project.id,
            userId: userIdentity?.userId ?? null,
            workflowId: project.manualContext?.requestContext?.workflowId ?? null,
            recordedAt: project.analysis?.pipeline?.endedAt ?? project.analysis?.pipeline?.startedAt ?? null,
            source: "ai-analyst",
          }
        : null),
    toolInvocation:
      project.manualContext?.toolInvocation
      ?? (Array.isArray(providerOperations) && providerOperations[0]
        ? {
            toolName: null,
            providerOperation: providerOperations[0].operationType ?? null,
            projectId: project.id,
            userId: userIdentity?.userId ?? null,
            workflowId: project.manualContext?.requestContext?.workflowId ?? null,
            recordedAt: null,
            source: "provider-operation-contract",
          }
        : null),
  });
  const { privacyPolicyDecision } = createPrivacyRetentionAndDeletionPolicyResolver({
    dataPrivacyClassification,
    retentionPolicy: derivePrivacyRetentionPolicy({
      dataPrivacyClassification,
      nexusPersistenceSchema,
      storageRecord,
      backupStrategy,
    }),
  });
  const { storageCostMetric } = createStorageAndArtifactCostTracker({
    storageRecord,
    retentionWindow: privacyPolicyDecision?.retentionWindow ?? null,
    manualContext: project.manualContext ?? null,
  });
  const currentSnapshotSchedule = project.snapshotSchedule ?? project.context?.snapshotSchedule ?? null;
  const currentSnapshotWorker = project.snapshotBackupWorker ?? project.context?.snapshotBackupWorker ?? null;
  const currentSnapshotRetentionPolicy = project.snapshotRetentionPolicy ?? project.context?.snapshotRetentionPolicy ?? null;
  const { auditLogRecord } = createAuditLogForSystemActions({
    systemAction: {
      actionType: incidentAlert?.status === "active"
        ? `security.${incidentAlert.incidentType ?? "incident"}`
        : notificationEvent?.requiresApproval
          ? "approval.notification"
          : authenticationState?.isAuthenticated
            ? "auth.session.active"
            : "system.observed",
      status: incidentAlert?.status === "active" ? "alerted" : "recorded",
      projectId: project.id,
      summary: incidentAlert?.summary ?? notificationEvent?.message ?? "System action observed",
      reason: incidentAlert?.incidentType ?? null,
      riskLevel:
        incidentAlert?.severity === "critical"
          ? "high"
          : incidentAlert?.severity === "high"
            ? "medium"
            : "low",
      source: "context-builder",
      traceId: platformTrace.traceId,
      metadata: {
        notificationEventId: notificationEvent?.notificationEventId ?? null,
        incidentCount: incidentAlert?.incidentCount ?? 0,
      },
    },
    actorContext: {
      actorId: userIdentity?.userId ?? project.userId ?? null,
      actorType: authenticationState?.isAuthenticated ? "user" : "system",
      actorRole: membershipRecord?.roles?.[0] ?? null,
      workspaceId: workspaceModel?.workspaceId ?? project.id,
      projectId: project.id,
      source: "nexus-runtime",
      traceId: platformTrace.traceId,
    },
    auditLogStore,
    observabilityTransport,
  });
  const { securityAuditRecord } = createSecurityAuditEventLogger({
    securityEvent: project.manualContext?.securityEvent ?? null,
    actorContext: {
      actorId: userIdentity?.userId ?? project.userId ?? null,
      actorType: authenticationState?.isAuthenticated ? "user" : "system",
      actorRole: membershipRecord?.roles?.[0] ?? null,
      sessionId: sessionState?.sessionId ?? null,
      ipAddress: project.manualContext?.requestContext?.ipAddress ?? null,
      deviceId: project.manualContext?.requestContext?.deviceId ?? null,
      workspaceId: workspaceModel?.workspaceId ?? project.id,
      projectId: project.id,
      source: "nexus-runtime",
      traceId: platformTrace.traceId,
    },
    securityAuditLogStore,
    observabilityTransport,
  });
  const providerErrors = statusEvents
    .filter((event) => ["failed", "rejected"].includes(event.status))
    .map((event) => event.rawStatus ?? event.status);
  const reviewFeedback = blockingIssues.map((issue) => issue.reason ?? issue.issue ?? issue.summary ?? String(issue));
  const { failureSummary, followUpTasks } = createRejectionAndFailureMapper({
    providerErrors,
    reviewFeedback,
    bottleneck: context.bottleneck,
    activeBottleneck,
    unblockPlan,
    taskResults: canonicalTaskResults,
  });
  const { explanationSchema } = defineExplanationSchema({
    projectState: {
      projectId: project.id,
      bottleneckState: updatedBottleneckState,
      failureSummary,
      approvalStatus,
      approvalRequest: approvalRequestWithStatus,
      diffPreview,
      unblockPlan,
    },
    decisionContext: {
      decisionIntelligence,
      activeBottleneck,
      policyTrace,
      policyDecision,
    },
  });
  const { nextActionExplanation } = createNextActionExplanationBuilder({
    explanationSchema,
    activeBottleneck,
    schedulerDecision: project.cycle?.schedulerDecision ?? null,
  });
  const { failureExplanation } = createFailureExplanationBuilder({
    failureSummary,
    taskResult: canonicalTaskResults[canonicalTaskResults.length - 1] ?? null,
    activeBottleneck,
  });
  const { approvalExplanation } = createApprovalExplanationBuilder({
    approvalRequest: approvalRequestWithStatus,
    approvalStatus,
    policyTrace,
    activeBottleneck,
  });
  const { changeExplanation } = createExecutionChangeExplanationBuilder({
    executionResult: bootstrapExecutionResult,
    bootstrapStateUpdate,
    releaseStateUpdate,
  });
  const { projectExplanation } = createExplanationAssembler({
    nextActionExplanation,
    failureExplanation,
    approvalExplanation,
    changeExplanation,
  });
  const { failureRecoveryModel } = defineFailureRecoverySchema({
    executionResult: bootstrapExecutionResult,
    failureSummary,
  });
  const { retryPolicy } = createRetryPolicyResolver({
    failureRecoveryModel,
    taskType: domainCapabilities.taskTypes?.[0] ?? "generic",
  });
  const { rollbackPlan } = createRollbackScopePlanner({
    failureRecoveryModel,
    executionMetadata: {
      projectId: project.id,
      bootstrapExecutionMetadata,
      storageRecord,
      releaseStateUpdate,
      releaseTimeline,
      deploymentRequest,
      providerSideEffects: providerOperations
        .filter((operation) => ["deploy", "publish", "sync"].includes(operation?.operationType))
        .map((operation) => ({
          providerOperationId: operation.operationId ?? operation.id ?? null,
          provider: operation.provider ?? deploymentRequest?.provider ?? null,
          status: operation.status ?? "pending-reversal",
        })),
    },
  });
  const { testReportSummary } = createTestReportingAndRemediationSummary({
    normalizedTestResults,
    failureSummary,
    followUpTasks,
  });
  const { realityProgress } = createProgressToRealityMapper({
    progressState,
    executionResult: bootstrapExecutionResult,
    artifacts: bootstrapArtifacts,
    releaseStateUpdate,
  });
  const { firstValueSummary } = createFirstValueSummaryAssembler({
    projectIdentityProfile: project.state?.projectIdentityProfile ?? projectIdentityProfile,
    firstValueOutput,
    realityProgress,
    explanationPayload: projectExplanation,
  });
  const { activationFunnel } = defineActivationFunnelSchema({
    websiteConversionFlow,
    onboardingFlow: {
      status: onboardingViewState?.status ?? "ready",
      activeScreen: onboardingViewState?.activeScreen ?? onboardingProgress?.currentStep ?? null,
    },
  });
  const { activationMilestones } = createFirstValueMilestoneMapper({
    activationFunnel,
    projectJourneys: journeyMap,
    firstValueSummary,
  });
  const { milestoneTracking } = createMilestoneTrackingSystem({
    projectId: project.id ?? null,
    goalProgressState,
    activationMilestones,
    firstValueOutput,
  });
  const { productIterationInsights } = createProductIterationFeedbackEngine({
    outcomeFeedbackState,
  });
  const { firstProjectKickoff } = createFirstProjectKickoffFlow({
    postLoginDestination,
    activationFunnel,
    onboardingSession: project.onboardingSession ?? null,
  });
  const { landingToDashboardFlow } = createLandingToDashboardFunnelAssembler({
    landingAuthHandoff,
    appEntryDecision,
    postLoginDestination,
    firstProjectKickoff,
  });
  const { onboardingMarketingFlow } = createOnboardingMarketingCopyFlow({
    activationFunnel,
    messagingFramework,
  });
  const { activationDropOffs } = createActivationDropOffDetector({
    activationMilestones,
    userActivityEvent,
  });
  const { reEngagementPlan } = createReEngagementTriggerPlanner({
    activationDropOffs,
    notificationPreferences,
  });
  const { nexusContentStrategy } = createNexusContentStrategyProfile({
    nexusPositioning,
    messagingVariants,
  });
  const { launchContentCalendar } = createLaunchContentCalendar({
    nexusContentStrategy,
    businessContext,
  });
  const { storyAssets } = createFounderAndProductStoryAssetBuilder({
    nexusPositioning,
    launchContentCalendar,
  });
  const { socialCommunityPack } = createSocialAndCommunityContentPack({
    storyAssets,
    launchContentCalendar,
  });
  const { productProofPlan } = createProductDemoAndProofAssetPlan({
    websiteCopyPack,
    activationMilestones,
  });
  const { launchCampaignBrief } = createNexusLaunchCampaignBrief({
    nexusPositioning,
    businessContext,
  });
  const { launchRolloutPlan } = createLaunchChannelRolloutPlan({
    launchCampaignBrief,
    socialCommunityPack,
  });
  const { launchReadinessChecklist } = createLaunchAssetReadinessChecklist({
    launchRolloutPlan,
    productProofPlan,
  });
  const { launchPublishingPlan } = createLaunchDraftPublishingPlan({
    launchRolloutPlan,
    launchContentCalendar,
  });
  const { launchFeedbackSummary } = createLaunchFeedbackIntakeModule({
    launchPublishingPlan,
    feedbackSignals: project.manualContext?.feedbackSignals ?? [],
  });
  const { goToMarketPlan } = createGoToMarketPlanningModel({
    launchCampaignBrief,
    websiteConversionFlow,
    activationFunnel,
  });
  const { promotionExecutionPlan } = createPromotionExecutionPlanner({
    launchRolloutPlan,
    launchPublishingPlan,
  });
  const { launchMarketingExecution } = createLaunchMarketingExecutionTracker({
    promotionExecutionPlan,
    launchFeedbackSummary,
  });
  const { gtmMetricSchema } = defineGtmMetricSchema({
    launchCampaignBrief,
    websiteConversionFlow,
  });
  const { acquisitionSourceMetrics } = createAcquisitionSourceTracker({
    gtmMetricSchema,
    projectCreationEvent: project.projectCreationEvent ?? project.projectCreationSummary ?? null,
    userActivityEvent,
    attributionMetadata: project.manualContext?.attributionMetadata ?? null,
  });
  const { landingVariantDecision } = createPersonaSpecificLandingVariantResolver({
    messagingVariants,
    visitorContext: project.manualContext?.visitorContext ?? project.manualContext?.visitorInput ?? null,
    acquisitionSourceMetrics,
  });
  const { firstTouchAttribution } = createFirstTouchAttributionRecorder({
    visitorContext: project.manualContext?.visitorContext ?? project.manualContext?.visitorInput ?? null,
    landingVariantDecision,
    productCtaStrategy,
  });
  const { preAuthConversionEvents } = createPreAuthConversionEventCollector({
    firstTouchAttribution,
    landingAuthHandoff,
  });
  const { websiteActivationFunnel } = createWebsiteToActivationFunnelAnalyzer({
    acquisitionSourceMetrics,
    activationMilestones,
  });
  const { conversionAnalytics } = createConversionAnalyticsModel({
    preAuthConversionEvents,
    websiteActivationFunnel,
  });
  const { ownerControlPlane } = defineOwnerControlPlaneSchema({
    ownerContext: {
      ownerId: membershipRecord?.userId ?? userIdentity?.userId ?? project.userId ?? null,
      ownerRole: membershipRecord?.role ?? "owner",
    },
    platformState: {
      workspaceId: workspaceModel?.workspaceId ?? project.id,
      healthStatus: incidentAlert?.status ?? "stable",
    },
  });
  let { ownerControlCenter } = createOwnerControlCenter({
    ownerControlPlane,
    analyticsSummary: project.analyticsSummary ?? null,
    platformTrace,
  });
  let { dailyOwnerOverview } = createDailyOverviewGenerator({
    ownerControlCenter,
    platformLogs,
    incidentAlert,
  });
  let { ownerPriorityQueue } = createOwnerPriorityEngine({
    dailyOwnerOverview,
    ownerControlCenter,
  });
  let { ownerActionRecommendations } = createActionRecommendationSystem({
    ownerPriorityQueue,
    ownerControlCenter,
  });
  let { ownerDecisionDashboard } = createOwnerDecisionDashboard({
    ownerActionRecommendations,
    approvalChain: {
      status: approvalStatus?.status ?? "missing",
      entries: approvalAuditTrail?.entries ?? [],
    },
  });
  let { ownerDailyWorkflow } = createDailyWorkflowGenerator({
    dailyOwnerOverview,
    ownerPriorityQueue,
  });
  let { ownerFocusArea } = createFocusAreaSelector({
    ownerDailyWorkflow,
    ownerControlCenter,
  });
  let { ownerTaskList } = createTaskRecommendationEngine({
    ownerFocusArea,
    ownerActionRecommendations,
  });
  let { ownerRoutinePlan } = createOwnerRoutineAssistant({
    ownerTaskList,
    ownerDailyWorkflow,
  });
  const { realtimeEventStream } = defineRealtimeEventStreamSchema({
    runtimeEvents: {
      runId: executionProgressSchema.runId,
      status: progressPhase,
      progressEntries: executionProgressSchema.logSchema.entries ?? [],
      formattedLogs,
      executionEvents: platformTrace?.runtimeEvents?.executionEvents ?? [],
    },
    workspaceEvents: {
      projectId: project.id,
      fileChanges: diffPreview?.files ?? [],
      approvals: approvalAuditTrail?.entries ?? [],
      notifications: notificationEvent ? [notificationEvent] : [],
    },
  });
  const { liveUpdateChannel } = createLiveUpdateTransportLayer({
    realtimeEventStream,
    projectId: project.id,
  });
  context.state.dependencies = buildDependencies(project, context);
  context.state.risks = buildRisks(project, context);
  context.dependencies = context.state.dependencies;
  context.risks = context.state.risks;
  context.recommendedActions = buildRecommendedActions(project, context);
  const { developerWorkspace } = defineDeveloperWorkspaceSchema({
    projectState: {
      projectId: project.id,
      projectName: project.name ?? null,
      storageRecord,
      diffPreview,
      recommendedActions: context.recommendedActions,
    },
    executionState: {
      progressState,
      progressPercent,
      formattedLogs,
      platformLogs,
      bootstrapPlannedCommands,
      bootstrapAssignments,
      taskResults: canonicalTaskResults,
      incidentAlert,
    },
  });
  const { projectWorkbenchLayout } = createProjectWorkbenchLayout({
    developerWorkspace,
    screenTemplateSchema,
  });
  const { fileEditorContract } = createFileTreeAndEditorContract({
    developerWorkspace,
    storageRecord,
  });
  const { commandConsoleView } = createTerminalAndCommandConsoleView({
    executionStatusPayload: {
      projectId: project.id,
      progressState,
      bootstrapPlannedCommands,
      bootstrapAssignments,
    },
    formattedLogs,
  });
  const { liveLogStream } = createLiveLogStreamingModule({
    liveUpdateChannel,
    formattedLogs,
  });
  const { branchDiffActivityPanel } = createBranchAndDiffActivityPanel({
    diffPreviewPayload: {
      projectId: project.id,
      executionRequestId: diffPreviewSchema?.executionPlan?.executionRequestId ?? null,
      diffPreview,
      riskFlags,
    },
    projectState: {
      projectId: project.id,
      gitSnapshot: project.gitSnapshot ?? null,
      approvalRecords,
      approvalAuditTrail,
      auditLogRecord,
    },
  });
  const { reviewThreadState } = createProjectCommentsAndReviewThreadsModule({
    collaborationEvent,
    branchDiffActivityPanel,
    persistedThreads:
      reviewThreadStore && typeof reviewThreadStore.query === "function"
        ? reviewThreadStore.query({ projectId: project.id, limit: 100 })
        : [],
  });
  const { sharedApprovalState } = createSharedApprovalFlowModel({
    approvalRequest: approvalRequestWithStatus,
    workspaceModel,
    approvalRecords,
  });
  const { collaborationActivityHistory } = createBaselineCollaborationActivityHistoryAssembler({
    collaborationEvent,
    projectPresenceState,
    reviewThreadState,
    sharedApprovalState,
  });
  const { collaborationFeed } = createCollaborationActivityFeed({
    collaborationActivityHistory,
  });
  const { projectStateSnapshot } = defineProjectStateSnapshotSchema({
    projectState: {
      ...bootstrappedInitialProjectState,
      projectId: project.id,
      workspaceId: workspaceModel?.workspaceId ?? null,
      workspaceArea: projectPresenceState?.workspaceArea ?? "developer-workspace",
      workspaceVisibility: workspaceModel?.visibility ?? "workspace",
      stateVersion: project.context?.projectStateSnapshot?.stateVersion ?? null,
      executionGraphVersion: project.context?.projectStateSnapshot?.executionGraphVersion ?? null,
      lifecyclePhase: project.state?.lifecycle?.phase ?? null,
      hasArtifacts: Boolean(artifactRecord || packagedArtifact),
      hasBlockers: Boolean(activeBottleneck),
      artifactCount: artifactRecord?.artifactCount ?? 0,
      outputPaths: artifactRecord?.outputPaths ?? [],
      packageFormat: packagedArtifact?.packageFormat ?? null,
      packagedFileCount: packagedArtifact?.metadata?.fileCount ?? packagedArtifact?.files?.length ?? 0,
      verificationStatus: packagedArtifact?.metadata?.verificationStatus ?? "unknown",
      approvalStatus: approvalStatus?.status ?? null,
      updatedAt: new Date().toISOString(),
    },
    executionGraph: project.cycle?.executionGraph ?? null,
  });
  const { snapshotRecord } = createProjectSnapshotStore({
    projectStateSnapshot,
    snapshotStore,
    observabilityTransport,
    traceId: `${platformTrace.traceId}:snapshot-store`,
  });
  const { stateDiff } = createStateDiffAndCompareModule({
    snapshotRecord: {
      ...snapshotRecord,
      executionGraphSummary: projectStateSnapshot.executionGraphSummary,
    },
    comparisonTarget: {
      comparisonTargetId: `comparison-target:${project.id}`,
      versions: {
        stateVersion: (projectStateSnapshot.stateVersion ?? 1) + 1,
        executionGraphVersion: projectStateSnapshot.executionGraphVersion ?? 1,
      },
      workspaceReference: projectStateSnapshot.workspaceReference,
      executionGraphSummary: projectStateSnapshot.executionGraphSummary,
      artifactSummary: {
        ...projectStateSnapshot.artifactSummary,
        artifactCount: projectStateSnapshot.artifactSummary.artifactCount,
        outputPaths: projectStateSnapshot.artifactSummary.outputPaths,
        packageFormat: projectStateSnapshot.artifactSummary.packageFormat,
        packagedFileCount: projectStateSnapshot.artifactSummary.packagedFileCount,
        verificationStatus: projectStateSnapshot.artifactSummary.verificationStatus,
      },
    },
  });
  const { artifactBuildPanel } = createArtifactAndBuildLogPanel({
    artifactRecord,
    packagedArtifact,
    packageVerification,
  });
  const { developmentWorkspace } = createDevelopmentWorkspace({
    projectWorkbenchLayout,
    fileEditorContract,
    commandConsoleView,
  });
  const { restoreDecision } = createProjectStateRestoreResolver({
    snapshotRecord,
    rollbackPlan,
  });
  const { rollbackExecutionResult } = createProjectRollbackExecutionModule({
    restoreDecision,
    snapshotRecord,
  });
  const { disasterRecoveryChecklist } = createDisasterRecoveryChecklist({
    backupStrategy,
    restorePlan,
    incidentAlert,
    platformTrace,
    platformLogs,
    observabilitySummary: {
      observabilityId: `observability:${project.id}`,
      totalTraces: platformTrace?.traceId ? 1 : 0,
      totalLogs: Array.isArray(platformLogs) ? platformLogs.length : 0,
      healthStatus: incidentAlert?.status ?? "stable",
    },
    snapshotSchedule: currentSnapshotSchedule,
    snapshotBackupWorker: currentSnapshotWorker,
    snapshotRetentionPolicy: currentSnapshotRetentionPolicy,
    snapshotRecord,
    restoreDecision,
    rollbackExecutionResult,
  });
  const existingReliabilitySlaModel = project.context?.reliabilitySlaModel ?? project.manualContext?.reliabilitySlaModel ?? null;
  const { reliabilitySlaModel } = existingReliabilitySlaModel?.reliabilityModelId
    ? {
        reliabilitySlaModel: existingReliabilitySlaModel,
      }
    : defineReliabilityAndSlaSchema({
        serviceTierDefinitions: {
          serviceTier:
            project.manualContext?.serviceTier
            ?? project.context?.serviceTier
            ?? workspaceModel?.serviceTier
            ?? null,
          ownerEscalationPolicy: {
            requiresOwnerApprovalForFailover: true,
            notifyRoles: membershipRecord?.role === "owner" ? ["owner"] : ["owner", "operator"],
          },
        },
        runtimeCapabilities: {
          snapshotRestore: Boolean(restorePlan?.restorePlanId),
          automaticRecovery: Boolean(disasterRecoveryChecklist?.summary?.canExecuteRecovery),
          supportsRuntimeFailover: Boolean(project.manualContext?.supportsRuntimeFailover),
          supportsQueueDrain: true,
          supportsProviderFallback: Boolean(project.manualContext?.supportsProviderFallback ?? providerRecoveryProbe?.probeStatus),
          supportsWorkspaceFailover:
            Boolean(project.manualContext?.supportsWorkspaceFailover)
            || workspaceModel?.visibility === "organization",
          operatorRunbooks: true,
        },
        projectId: project.id,
      });
  const { continuityPlan: plannedContinuityPlan } = createFailoverAndContinuityPlanner({
    reliabilitySlaModel,
    incidentAlert: {
      ...incidentAlert,
      projectId: project.id,
    },
  });
  const continuityPlan = {
    ...plannedContinuityPlan,
    ...(project.context?.continuityPlan ?? {}),
    ...(project.manualContext?.continuityPlan ?? {}),
    failover: {
      ...(plannedContinuityPlan.failover ?? {}),
      ...(project.context?.continuityPlan?.failover ?? {}),
      ...(project.manualContext?.continuityPlan?.failover ?? {}),
    },
  };
  const { externalProviderHealthAndFailover } = createExternalProviderHealthFailoverOrchestrator({
    externalCapabilityRegistry,
    connectorCredentialBinding,
    providerDegradationState,
    circuitBreakerDecision,
    providerRecoveryProbe,
    continuityPlan,
  });
  const { designToolImportAdapter } = createDesignToolImportAdapter({
    projectId: project.id,
    projectIntake: project.projectIntake ?? project.onboardingSession?.projectIntake ?? null,
    externalCapabilityRegistry,
    connectorCredentialBinding,
    externalProviderHealthAndFailover,
  });
  const { businessContinuityState } = createBusinessContinuityLifecycleManager({
    backupStrategy,
    continuityPlan,
    disasterRecoveryChecklist,
    incidentAlert,
    snapshotSchedule: currentSnapshotSchedule,
    snapshotBackupWorker: currentSnapshotWorker,
    snapshotRetentionPolicy: currentSnapshotRetentionPolicy,
    ownerContinuityDecision: project.manualContext?.ownerContinuityDecision ?? null,
  });
  let projectAuditEvent = null;
  let projectAuditRecord = null;
  let actorActionTrace = null;
  let projectAuditPayload = null;
  let complianceAuditSummary = null;
  const { reactiveWorkspaceState } = createReactiveWorkspaceRefreshModel({
    liveUpdateChannel,
    developerWorkspace,
  });
  const { projectBrainWorkspace } = createProjectBrainWorkspace({
    projectState: {
      projectId: project.id,
      domain,
      lifecycle: {
        phase: project.state?.lifecycle?.phase ?? null,
      },
      bottleneck: context.bottleneck,
      businessBottleneck,
      decisionIntelligence,
      failureSummary,
      recommendedActions: context.recommendedActions,
    },
    policyTrace,
    learningInsights: project.context?.learningInsights ?? null,
  });
  const { selectedTask, selectionReason } = createNextTaskSelectionResolver({
    roadmap: project.cycle?.roadmap ?? initialTasks,
    blockers: projectBrainWorkspace?.blockers ?? [],
    approvalStatus,
    schedulerAlternatives: project.cycle?.schedulerDecision?.alternatives ?? retryPolicy?.schedulerHint?.alternatives ?? [],
  });
  const { nextTaskPresentation } = createNextTaskPresentationModel({
    schedulerDecision: project.cycle?.schedulerDecision ?? null,
    nextActionExplanation,
    approvalStatus,
    selectedTask,
    selectionReason,
  });
  const { nextTaskApprovalPanel } = createNextTaskApprovalHandoffPanel({
    nextTaskPresentation,
    approvalExplanation,
  });
  const { recommendationDisplay } = createRecommendationDisplayContract({
    projectExplanation,
    reasoningPanel,
    nextTaskPresentation,
  });
  const { recommendationSummaryPanel } = createRecommendationSummaryPanel({
    recommendationDisplay,
    projectBrainWorkspace,
  });
  const { editableProposal } = defineEditableProposalSchema({
    proposalType: project.context?.proposalType ?? "workspace-recommendation",
    proposalPayload: {
      sourceId: recommendationDisplay?.displayId ?? nextTaskPresentation?.presentationId ?? project.id,
      recommendationDisplay,
      nextTaskPresentation,
      approvalStatus,
      headline: recommendationDisplay?.headline ?? null,
      whyNow: recommendationDisplay?.whyNow ?? null,
      expectedImpact: recommendationDisplay?.expectedImpact ?? null,
      nextAction: recommendationDisplay?.primaryCta ?? null,
    },
  });
  const { editedProposal, proposalEditHistory } = createProposalEditingSystem({
    editableProposal,
    userEditInput: project.context?.userEditInput ?? null,
  });
  const { approvalOutcome } = createBaselineApprovalOutcomeSchema({
    approvalRequest: approvalRequestWithStatus,
    approvalRecords,
    approvalStatus,
    partialAcceptanceSelection: project.context?.approvalOutcome ?? null,
  });
  const { partialAcceptanceDecision, remainingProposalScope } = createPartialAcceptanceFlow({
    editedProposal,
    approvalOutcome,
  });
  const { cockpitRecommendationSurface } = createCockpitRecommendationSurface({
    projectExplanation,
    approvalExplanation,
    reasoningPanel,
    recommendationSummaryPanel,
  });
  const { releaseWorkspace } = createReleaseWorkspace({
    releasePlan,
    validationReport,
    releaseTimeline,
    releaseStatus,
    deploymentRequest,
    qualityGateDecision,
  });
  const { growthWorkspace } = createGrowthWorkspace({
    contentStrategy: {
      workspaceId: "growth-workspace",
      targetAudience: businessContext?.targetAudience ?? null,
      gtmStage: businessContext?.gtmStage ?? null,
      pillars: businessContext?.constraints ?? [],
      contentGoal: project.goal ?? null,
    },
    campaignPlan: {
      workspaceId: "growth-workspace",
      channels: businessContext?.funnel
        ? Object.entries(businessContext.funnel)
          .filter(([, status]) => status)
          .map(([channel, status]) => ({ channel, status }))
        : [],
      tasks: growthMarketingPlan,
      pendingApprovals: decisionIntelligence?.approvalRequired ?? [],
    },
    growthAnalytics: {
      kpis: businessContext?.kpis ?? [],
      runtime: context.projectState?.analytics?.runtime ?? null,
      productMetrics: context.projectState?.analytics?.productMetrics ?? null,
      hasBaselineCampaign: context.projectState?.analytics?.hasBaselineCampaign ?? false,
    },
  });
  const { workspaceNavigationModel } = createCrossWorkspaceNavigationModel({
    projectBrainWorkspace,
    developmentWorkspace,
    releaseWorkspace,
    growthWorkspace,
    projectExplanation,
    activeBottleneck,
    releaseStatus,
  });
  const { nexusAppShellSchema } = defineNexusAppShellSchema({
    authenticationViewState,
    postAuthRedirect,
    projectCreationExperience,
    onboardingViewState,
    workspaceNavigationModel,
    screenInventory,
    boundaryDisclosureModel,
  });
  const { authenticatedAppShell } = createAuthenticatedAppShellModel({
    nexusAppShellSchema,
    authenticationState,
    postAuthRedirect,
    projectCreationExperience,
    onboardingViewState,
    workspaceNavigationModel,
    userIdentity,
  });
  const { navigationRouteSurface } = createNexusNavigationAndRouteSurfaceBinder({
    nexusAppShellSchema,
    authenticatedAppShell,
    workspaceNavigationModel,
    navigationComponents,
  });
  const {
    aiControlCenterSurface,
    renderableScreenModel,
    screenComponentMapping,
    activeScreenVariantPlan,
    layoutCompositionPlan,
    renderableScreenComposition,
    runtimeScreenRegistry,
    activeScreenResolver,
    liveRuntimeScreenState,
    previewScreenViewModel,
  } = createAiControlCenterAndGeneratedSurfaceDeliveryBinder({
    authenticatedAppShell,
    navigationRouteSurface,
    ownerControlCenter,
    cockpitRecommendationSurface,
    editableProposal,
    editedProposal,
    partialAcceptanceDecision,
    remainingProposalScope,
    screenContracts,
    screenInventory,
    screenStates,
    screenValidationChecklist,
    screenFlowMap,
    templateVariants,
    designTokens,
    layoutSystem,
    colorRules,
    interactionStateSystem,
    componentContract,
    primitiveComponents,
    layoutComponents,
    feedbackComponents,
    navigationComponents,
    dataDisplayComponents,
    dashboardTemplate,
    detailPageTemplate,
    workflowTemplate,
    managementTemplate,
    projectState: project.state ?? {},
  });
  const { aiDesignServiceResult } = createAiDesignService({
    projectId: project.id,
    projectState: project.state ?? {},
    selectedTask,
    screenContract: renderableScreenModel,
    renderableScreenModel,
    renderableScreenComposition,
    screenFlowMap,
    screenStates,
    designTokens,
    componentContract,
    slimmedContextPayload,
    providerConfig: project.manualContext?.aiDesignProviderConfig ?? null,
  });
  const { aiDesignExecutionState } = createAiDesignExecutionHook({
    selectedTask,
    aiDesignServiceResult,
  });
  const { renderableDesignProposal } = createRenderableDesignProposalNormalizer({
    aiDesignProposal: aiDesignServiceResult.aiDesignProviderResult?.aiDesignProposal ?? null,
    renderableScreenModel,
    screenComponentMapping,
  });
  const { designProposalValidation } = createDesignProposalValidationFlow({
    renderableDesignProposal,
    screenTemplateSchema,
    screenValidationChecklist: renderableScreenModel,
    screenContract: renderableScreenModel,
  });
  const { designProposalPreviewState } = createDesignProposalPreviewPipeline({
    renderableDesignProposal,
    designProposalValidation,
    designTokens,
    layoutSystem,
    colorRules,
  });
  const { screenProposalDiff } = createScreenProposalDiffModel({
    renderableScreenComposition,
    designProposalPreviewState,
  });
  const { designProposalReviewState } = createDesignProposalReviewHandoff({
    renderableDesignProposal,
    designProposalValidation,
    screenProposalDiff,
  });
  const { approvedScreenDelta, proposalApplyDecision } = createDesignProposalEditApplyBinder({
    designProposalReviewState,
    editableProposal,
    editedProposal,
    partialAcceptanceDecision,
    screenProposalDiff,
  });
  const { acceptedScreenState, integratedDesignProposalState } = createDesignProposalStateIntegration({
    proposalApplyDecision,
    approvedScreenDelta,
    renderableDesignProposal,
    designProposalReviewState,
  });
  const { dailyWorkspaceSurface } = createDailyWorkspaceSurfaceModel({
    authenticatedAppShell,
    navigationRouteSurface,
    developerWorkspace,
    projectBrainWorkspace,
    releaseWorkspace,
    growthWorkspace,
    capabilityDecision,
  });
  const { acceptanceScenario } = defineV1AcceptanceScenarioSchema({
    productFlows: journeyMap?.flows ?? [],
    expectedOutcomes: [
      {
        scenarioKey: "onboarding-first-value",
        expectedOutcome: "User gets a first visible project result",
        successCriteria: ["firstValueOutput", "firstValueSummary"],
      },
      {
        scenarioKey: "execution-state-update",
        expectedOutcome: "Execution updates state and explanation payload",
        successCriteria: ["projectExplanation", "changeExplanation"],
      },
      {
        scenarioKey: "failure-recovery",
        expectedOutcome: "Failure leads to recovery options",
        successCriteria: ["recoveryOptionsPayload", "failureExplanation"],
      },
      {
        scenarioKey: "approval-explanation",
        expectedOutcome: "Approval gating is enforced with clear explanation",
        successCriteria: ["approvalExplanation", "projectExplanation"],
      },
      {
        scenarioKey: "workspace-continuity",
        expectedOutcome: "Workspace navigation preserves project context and resume continuity",
        successCriteria: ["workspaceNavigationModel"],
      },
    ],
  });
  const { acceptanceResult: onboardingAcceptanceResult } = createOnboardingToFirstValueAcceptanceTest({
    acceptanceScenario,
    firstValueOutput,
  });
  const { acceptanceResult: executionAcceptanceResult } = createExecutionToStateUpdateAcceptanceTest({
    acceptanceScenario,
    executionResult: bootstrapExecutionResult,
    storageRecord,
    projectExplanation,
  });
  const environmentConfig = {
    projectId: project.id,
    executionModes,
    defaultMode: recommendedDefaults?.execution?.mode ?? executionModes[0] ?? null,
    provider: recommendedDefaults?.hosting?.provider ?? null,
    target: recommendedDefaults?.hosting?.target ?? null,
    runtimeSource: project.runtimeSource?.baseUrl ?? null,
    environment:
      recommendedDefaults?.hosting?.target === "production"
      || providerAdapter?.requestMetadata?.environment === "production"
        ? "production"
        : providerAdapter?.requestMetadata?.environment
          ?? (recommendedDefaults?.hosting?.target ? "staging" : "development"),
  };
  const { featureFlagSchema } = defineFeatureFlagSchema({
    featureDefinitions: project.manualContext?.featureDefinitions ?? null,
    environmentConfig,
  });
  const { featureFlagDecision } = createFeatureFlagResolver({
    featureFlagSchema,
    requestContext: {
      workspaceId: workspaceModel?.workspaceId ?? project.id,
      userId: userIdentity?.userId ?? project.userId ?? null,
      actorId: userIdentity?.userId ?? project.userId ?? null,
      environment: environmentConfig.environment,
      riskLevel: project.manualContext?.requestContext?.riskLevel ?? null,
      riskFlags,
    },
  });
  const { killSwitchDecision } = createEmergencyKillSwitchGuard({
    featureFlagDecision,
    incidentAlert,
  });
  const { executionTopology } = defineExecutionTopologySchema({
    executionSurfaces: bootstrapResolvedSurfaces,
    environmentConfig,
  });
  const { cloudWorkspaceModel } = createCloudExecutionWorkspaceModel({
    executionTopology,
    projectState: {
      projectId: project.id,
      storageRecord,
      bootstrapExecutionResult,
      bootstrapExecutionMetadata,
      bootstrapArtifacts,
    },
  });
  const { workspaceComputeMetric } = createWorkspaceComputeUsageTracker({
    cloudWorkspaceModel,
    platformTrace,
  });
  const { buildDeployCostMetric } = createBuildDeployCostTracker({
    projectId: project.id,
    workspaceId: workspaceModel?.workspaceId ?? null,
    buildArtifact: preparedArtifact?.artifacts ?? [],
    deploymentResult: releaseStateUpdate,
    executionModeDecision,
    pricingMetadata: project.manualContext?.pricingMetadata ?? null,
  });
  const { costSummary } = createCostSummaryAggregator({
    platformCostMetric,
    aiUsageMetric,
    storageCostMetric,
    workspaceComputeMetric,
    buildDeployCostMetric,
  });
  const { budgetDecision, approvalRequest: budgetApprovalRequest } = createUsageBudgetGuard({
    costSummary,
    agentGovernancePolicy,
    workspaceModel,
    pricingMetadata: project.manualContext?.pricingMetadata ?? null,
  });
  const { costVisibilityPayload, costDashboardModel } = createCostVisibilityApiModel({
    costSummary,
    budgetDecision,
  });
  const { billingPlanSchema } = defineBillingPlanSchema({
    platformCostMetric,
    agentGovernancePolicy,
    reliabilitySlaModel,
  });
  const { billableUsage } = createUsageToBillingMapper({
    costSummary,
    billingPlanSchema,
  });
  const { reasonableUsagePolicy } = createReasonableUsagePolicyResolver({
    workspaceMode,
    workspaceModeDefinitions,
    billingPlanSchema,
    billableUsage,
    costSummary,
  });
  const { workspaceBillingState } = createWorkspaceBillingStateSource({
    normalizedBillingEvents: project.manualContext?.normalizedBillingEvents ?? [],
    billingPlanSchema,
    workspaceModel,
  });
  const { entitlementDecision } = resolveEntitlementDecision({
    billingPlanSchema,
    workspaceModel,
    workspaceBillingState,
  });
  const { payingUserMetrics } = createPayingUserTracker({
    normalizedBillingEvents: project.manualContext?.normalizedBillingEvents ?? [],
  });
  const { revenueSummary } = createRevenueSummaryAggregator({
    payingUserMetrics,
  });
  const { launchPerformanceDashboard } = createLaunchPerformanceDashboardAssembler({
    websiteActivationFunnel,
    launchFeedbackSummary,
    revenueSummary,
  });
  const { gtmOptimizationPlan } = createGtmOptimizationLoop({
    launchPerformanceDashboard,
    launchFeedbackSummary,
  });
  const { growthLoopManagement } = createGrowthLoopManagementState({
    conversionAnalytics,
    launchPerformanceDashboard,
  });
  const {
    billingGuardDecision,
    approvalRequest: billingApprovalRequest,
  } = createBillingEnforcementGuard({
    workspaceMode,
    entitlementDecision,
    billableUsage,
    reasonableUsagePolicy,
    costSummary,
    workspaceBillingState,
  });
  const { subscriptionState } = createSubscriptionLifecycle({
    workspaceBillingState,
    billingPlanSchema,
    workspaceModel,
  });
  const { ownerRevenueView } = createRevenueTrackingSystem({
    revenueSummary,
    subscriptionState,
  });
  const { ownerCostView } = createCostTrackingSystem({
    costSummary,
    budgetDecision,
  });
  const { profitMarginSummary } = createProfitMarginAnalyzer({
    ownerRevenueView,
    ownerCostView,
  });
  const { unitEconomicsDashboard } = createUnitEconomicsDashboard({
    profitMarginSummary,
  });
  const { cashFlowProjection } = createCashFlowProjectionEngine({
    ownerRevenueView,
    ownerCostView,
  });
  const { ownerUserAnalytics } = createUserAnalyticsDashboard({
    retentionSummary,
    projectCreationSummary: project.projectCreationSummary ?? null,
    taskThroughputSummary,
  });
  const { featureUsageSummary } = createFeatureUsageTracker({
    userActivityEvent,
    analyticsSummary: ownerUserAnalytics,
  });
  const { decisionAccuracySummary } = createDecisionAccuracyTracker({
    ownerActionRecommendations,
    outcomeEvaluation,
  });
  const { automationImpactSummary } = createAutomationImpactTracker({
    taskThroughputSummary,
    productivitySummary,
    ownerRoutinePlan,
  });
  const { roadmapTracking } = createSystemRoadmapTracker({
    roadmap: project.cycle?.roadmap ?? initialTasks,
    taskThroughputSummary,
  });
  const { ownerOperationsSignals } = createOperationsSignalAggregator({
    platformTrace,
    healthStatus: incidentAlert?.status ?? project.state?.observed?.health?.status ?? null,
    budgetDecision,
    incidentAlert,
  });
  const { prioritizedOwnerAlerts } = createCriticalAlertPrioritizer({
    ownerOperationsSignals,
    ownerPriorityQueue,
  });
  const { ownerAlertFeed } = createNoiseSuppressionSystem({
    prioritizedOwnerAlerts,
    ownerRoutinePlan,
  });
  const { ownerIncident } = createIncidentDetectionSystem({
    ownerOperationsSignals,
    platformTrace,
  });
  const { outageResponsePlan } = createOutageResponseManager({
    ownerIncident,
    continuityPlan,
  });
  const { incidentTimeline } = createIncidentTimelineTracker({
    ownerIncident,
    platformTrace,
  });
  const { rootCauseSummary } = createRootCauseAnalysisSystem({
    incidentTimeline,
    causalImpactReport: project.manualContext?.causalImpactReport ?? project.context?.causalImpactReport ?? null,
  });
  const { liveProjectMonitoring } = createLiveProjectMonitoringModel({
    platformTrace,
    releaseStateUpdate,
    ownerIncident,
  });
  const { serviceReliabilityDashboard } = createServiceReliabilityDashboardModel({
    reliabilitySlaModel,
    continuityPlan,
    incidentAlert,
    systemBottleneckSummary,
    liveProjectMonitoring,
  });
  const { maintenanceBacklog } = createMaintenanceTaskGenerationEngine({
    liveProjectMonitoring,
    incidentTimeline,
    rootCauseSummary,
    ownerIncident,
  });
  ({ ownerControlCenter } = createOwnerControlCenter({
    ownerControlPlane,
    analyticsSummary: project.analyticsSummary ?? null,
    platformTrace,
    maintenanceBacklog,
  }));
  ({ dailyOwnerOverview } = createDailyOverviewGenerator({
    ownerControlCenter,
    platformLogs,
    incidentAlert,
    maintenanceBacklog,
  }));
  ({ ownerPriorityQueue } = createOwnerPriorityEngine({
    dailyOwnerOverview,
    ownerControlCenter,
  }));
  ({ ownerActionRecommendations } = createActionRecommendationSystem({
    ownerPriorityQueue,
    ownerControlCenter,
  }));
  ({ ownerDecisionDashboard } = createOwnerDecisionDashboard({
    ownerActionRecommendations,
    approvalChain: {
      status: approvalStatus?.status ?? "missing",
      entries: approvalAuditTrail?.entries ?? [],
    },
  }));
  ({ ownerDailyWorkflow } = createDailyWorkflowGenerator({
    dailyOwnerOverview,
    ownerPriorityQueue,
  }));
  ({ ownerFocusArea } = createFocusAreaSelector({
    ownerDailyWorkflow,
    ownerControlCenter,
  }));
  ({ ownerTaskList } = createTaskRecommendationEngine({
    ownerFocusArea,
    ownerActionRecommendations,
  }));
  ({ ownerRoutinePlan } = createOwnerRoutineAssistant({
    ownerTaskList,
    ownerDailyWorkflow,
  }));
  const { billingSettingsModel } = createBillingSettingsModel({
    billingPlanSchema,
    subscriptionState,
    workspaceBillingState,
    billingGuardDecision,
    normalizedBillingEvents: project.manualContext?.normalizedBillingEvents ?? [],
  });
  const candidateActions = project.manualContext?.requestContext?.candidateActions ?? [];
  const costAwareActionSelection = createCostAwareActionSelector({
    candidateActions,
    budgetDecision,
    decisionIntelligence,
  });
  const { localDevelopmentBridge } = createLocalDevelopmentBridgeContract({
    executionTopology,
    localEnvironmentMetadata: {
      isConnected: executionModes.includes("local-terminal"),
      workspacePath: project.source?.rootDir ?? null,
      os: project.runtimeSource?.platform ?? null,
      ide: {
        name: executionModes.includes("xcode") ? "Xcode" : executionModes.includes("local-terminal") ? "Local Terminal" : null,
        type: executionModes.includes("xcode") ? "apple-ide" : executionModes.includes("local-terminal") ? "terminal" : null,
      },
      runtime: {
        name: project.runtimeSource?.kind ?? "local-runtime",
      },
      sync: {
        enabled: executionModes.includes("local-terminal"),
        writeback: executionModes.includes("temp-branch"),
      },
      handoffMode: "optional-bridge",
    },
  });
  const { remoteMacRunner } = createRemoteMacRunnerContract({
    executionTopology,
    appleBuildConfig: {
      host: executionModes.includes("xcode") ? "remote-mac-host" : null,
      platform: domain === "mobile-app" ? "ios" : null,
      xcodeVersion: executionModes.includes("xcode") ? "latest-supported" : null,
      bundleId: recommendedDefaults?.metadata?.bundleId ?? null,
      scheme: domain === "mobile-app" ? "App" : null,
      signing: {
        teamId: recommendedDefaults?.credentials?.appleTeamId ?? null,
        signingStyle: "automatic",
        provisioningProfile: null,
        requiresManualApproval: approvalTrigger?.requiresApproval ?? false,
      },
      archive: {
        exportMethod: domain === "mobile-app" ? "app-store" : null,
        artifactPath: domain === "mobile-app" ? "artifacts/ios/app.ipa" : null,
        shouldArchive: domain === "mobile-app",
      },
    },
  });
  const { executionModeDecision } = createExecutionModeResolver({
    executionTopology,
    taskType: domainCapabilities.taskTypes?.[0] ?? "generic",
    projectState: {
      projectId: project.id,
      domain,
      riskFlags,
      policyTrace,
      decisionIntelligence,
    },
    cloudWorkspaceModel,
    localDevelopmentBridge,
    remoteMacRunner,
  });
  const { sandboxDecision } = createAgentSandboxPolicyResolver({
    agentGovernancePolicy,
    taskType: project.manualContext?.requestContext?.taskType ?? domainCapabilities.taskTypes?.[0] ?? "generic",
    executionTopology,
    cloudWorkspaceModel,
    localDevelopmentBridge,
    remoteMacRunner,
  });
  const { agentLimitDecision } = createAgentActionLimitGuard({
    sandboxDecision,
    budgetDecision,
    taskContext: {
      taskType: project.manualContext?.requestContext?.taskType ?? domainCapabilities.taskTypes?.[0] ?? "generic",
      plannedActions: project.manualContext?.requestContext?.plannedActions ?? bootstrapTasks.length,
      concurrentActions: project.manualContext?.requestContext?.concurrentActions ?? bootstrapAssignments.length,
      writeTargets: project.manualContext?.requestContext?.writeTargets ?? codeDiff.files.map((file) => file.path),
      providerOperations:
        project.manualContext?.requestContext?.providerOperations
        ?? providerOperations.map((operation) => operation.operationType),
      estimatedCost: project.manualContext?.requestContext?.estimatedCost ?? null,
      scopeType: project.manualContext?.requestContext?.scopeType ?? "project",
      scopeId: project.manualContext?.requestContext?.scopeId ?? project.id,
    },
    agentGovernancePolicy,
    killSwitchDecision,
    circuitBreakerDecision,
    providerOperations,
  });
  const { agentGovernanceTrace } = createAgentGovernanceTrace({
    agentGovernancePolicy,
    sandboxDecision,
    agentLimitDecision,
  });
  const { dashboardHomeSurface } = createDashboardHomeSurfaceModel({
    authenticatedAppShell,
    navigationRouteSurface,
    progressState,
    ownerDecisionDashboard,
    ownerPriorityQueue,
  });
  const { unifiedHomeDashboard } = createUnifiedHomeDashboardModel({
    dashboardHomeSurface,
    navigationRouteSurface,
    ownerPriorityQueue,
    ownerActionRecommendations,
    ownerDecisionDashboard,
  });
  const { todayPrioritiesFeed } = createTodayPrioritiesAndNextActionFeed({
    unifiedHomeDashboard,
    ownerPriorityQueue,
    ownerActionRecommendations,
    nextTaskPresentation,
  });
  const { ownerVisibilityStrip } = createOwnerVisibilityStripForHomeDashboard({
    unifiedHomeDashboard,
    ownerControlCenter,
    ownerDecisionDashboard,
    dailyOwnerOverview,
  });
  const { settingsProfileSurface } = createSettingsAndProfileSurfaceModel({
    authenticatedAppShell,
    navigationRouteSurface,
    userIdentity,
    workspaceSettings,
    notificationPreferences,
    billingSettingsModel,
    ownerMfaDecision,
  });
  const { guidedTaskExecutionSurface } = createGuidedTaskExecutionSurface({
    dailyWorkspaceSurface,
    nextTaskPresentation,
    selectedTask,
    progressState,
    executionModeDecision,
  });
  const { taskStepFlowProgress } = createTaskStepFlowAndProgressBinder({
    guidedTaskExecutionSurface,
    taskExecutionMetric,
    progressState,
    realityProgress,
  });
  const { taskApprovalHandoffPanel } = createTaskApprovalHandoffPanel({
    guidedTaskExecutionSurface,
    taskStepFlowProgress,
    nextTaskApprovalPanel,
    sharedApprovalState,
  });
  const projectAuditAction = buildProjectAuditAction({
    project,
    agentGovernanceTrace,
    approvalStatus,
    deploymentRequest,
    providerSession,
    stateDiff,
    restoreDecision,
    rollbackExecutionResult,
    releaseStatus,
  });
  ({ projectAuditEvent } = defineProjectAuditEventSchema({
    projectAction: projectAuditAction,
    actorContext: {
      actorId: userIdentity?.userId ?? project.userId ?? null,
      actorType: authenticationState?.isAuthenticated ? "user" : "system",
      actorRole: membershipRecord?.roles?.[0] ?? null,
      workspaceId: workspaceModel?.workspaceId ?? project.id,
      projectId: project.id,
      source: "nexus-runtime",
      traceId: platformTrace.traceId,
    },
  }));
  ({ projectAuditRecord } = createProjectAuditEventCollector({
    projectAuditEvent,
  }));
  ({ actorActionTrace } = createActorActionTraceAssembler({
    projectAuditRecord,
    executionResult: bootstrapExecutionResult,
  }));
  ({ projectAuditPayload } = createProjectAuditApiAndViewerModel({
    actorActionTrace,
    filters: null,
  }));
  const externalExecutionRequest = project.manualContext?.executionRequest ?? {
    executionRequestId: `execution-request:${project.id}:${project.manualContext?.projectAction ?? policyDecision?.actionType ?? "project-execution"}`,
    projectId: project.id,
    workspaceId: workspaceModel?.workspaceId ?? project.id,
    actionType: project.manualContext?.projectAction ?? project.manualContext?.workspaceAction?.actionType ?? policyDecision?.actionType ?? "project-execution",
    workflow: capabilityDecision?.requestedWorkflow ?? policyDecision?.actionType ?? "project-execution",
    operationType: deploymentRequest?.provider ? "deploy" : "validate",
    requestPayload: {
      workspaceAction: project.manualContext?.workspaceAction ?? null,
      requestContext: project.manualContext?.requestContext ?? null,
      deploymentRequestId: deploymentRequest?.requestId ?? null,
      buildTarget: buildTargets[0] ?? null,
    },
    requestContext: project.manualContext?.requestContext ?? null,
    targetSurface: executionModeDecision?.selectedMode ?? sandboxDecision?.selectedSurface ?? null,
    buildTarget: buildTargets[0] ?? null,
  };
  const { executionActionRouting } = defineExecutionActionRoutingSchema({
    executionRequest: externalExecutionRequest,
    sourceControlIntegration,
    designToolImportAdapter,
    connectorCredentialBinding,
    externalProviderHealthAndFailover,
    providerSession,
    providerAdapter,
    providerOperations,
    executionModeDecision,
    sandboxDecision,
  });
  const { actionToProviderMapping } = createActionToProviderMappingResolver({
    executionActionRouting,
    providerAdapter,
    providerSession,
    providerConnector,
    providerCapabilities,
    providerOperations,
    connectorCredentialBinding,
    executionModeDecision,
    sandboxDecision,
    externalProviderHealthAndFailover,
    credentialReference,
  });
  const { ideAgentExecutorContract } = defineIdeAgentExecutorContract({
    executionModeDecision,
    localDevelopmentBridge,
    remoteMacRunner,
    actionToProviderMapping,
    commandConsoleView,
  });
  const { localCodingAgentAdapter } = createLocalCodingAgentAdapter({
    ideAgentExecutorContract,
    localDevelopmentBridge,
    actionToProviderMapping,
    commandConsoleView,
    fileEditorContract,
    developmentWorkspace,
  });
  const { executionProviderCapabilitySync } = createExecutionProviderCapabilitySync({
    providerCapabilities,
    providerConnector,
    actionToProviderMapping,
    localCodingAgentAdapter,
    ideAgentExecutorContract,
  });
  const { atomicExecutionEnvelope } = createAtomicExternalActionEnvelope({
    executionRequest: externalExecutionRequest,
    resolvedActionProvider: actionToProviderMapping,
    executionPolicy: {
      policyDecision,
      approvalStatus,
      projectAuthorizationDecision,
      credentialPolicyDecision,
      deployPolicyDecision,
      sandboxDecision,
      executionModeDecision,
    },
  });
  const { externalExecutionResult } = createExternalExecutionDispatchModule({
    atomicExecutionEnvelope,
    resolvedExecutionConfig: {
      providerType: providerAdapter?.provider ?? providerSession?.providerType ?? "generic",
      connectorStatus: providerConnector?.status ?? providerSession?.status ?? "unknown",
      providerConnector,
      providerSession,
      operationTypes: providerOperations.map((operation) => operation.operationType),
      targetSurface: executionModeDecision?.selectedMode ?? sandboxDecision?.selectedSurface ?? null,
      credentialReference,
      artifactCount: preparedArtifact?.artifacts?.length ?? 0,
    },
  });
  const { externalExecutionSession } = createExternalExecutionSessionManager({
    externalExecutionResult,
    executionProviderCapabilitySync,
    actionToProviderMapping,
  });
  const { ideAgentResultNormalization } = createIdeAgentResultNormalizer({
    ideAgentExecutorContract,
    localCodingAgentAdapter,
    externalExecutionResult,
    externalExecutionSession,
    commandConsoleView,
  });
  const { executionInvocationContract } = createExecutionInvocationContract({
    atomicExecutionEnvelope,
    externalExecutionSession,
    ideAgentResultNormalization,
    ideAgentExecutorContract,
  });
  const { executionConsistencyReport } = createExecutionConsistencyValidator({
    atomicExecutionEnvelope,
    externalExecutionResult,
    projectState: {
      projectAuditRecord,
      auditLogRecord,
    },
  });
  const { postExecutionEvaluation } = definePostExecutionEvaluationSchema({
    projectId: project.id ?? null,
    executionConsistencyReport,
    systemBottleneckSummary,
    outcomeFeedbackState,
    milestoneTracking,
  });
  const { postExecutionReport } = createPostExecutionEvaluationPipeline({
    projectId: project.id ?? null,
    postExecutionEvaluation,
    executionConsistencyReport,
    systemBottleneckSummary,
  });
  const { crossLayerFeedbackState } = createCrossLayerFeedbackOrchestrator({
    projectId: project.id ?? null,
    postExecutionReport,
    productIterationInsights,
    goalProgressState,
    milestoneTracking,
  });
  const { adaptiveExecutionDecision } = createAdaptiveExecutionLoop({
    projectId: project.id ?? null,
    crossLayerFeedbackState,
    activeBottleneck,
    taskThroughputSummary,
    progressState,
  });
  const { systemOptimizationPlan } = createSystemOptimizationCycle({
    projectId: project.id ?? null,
    adaptiveExecutionDecision,
    serviceReliabilityDashboard,
    systemBottleneckSummary,
  });
  const { canonicalBacklogRegeneration } = createCanonicalBacklogRegenerationBridge({
    projectId: project.id ?? null,
    canonicalTaskInventory,
    importAndContinueRoadmap,
    postExecutionEvaluation,
    postExecutionReport,
    crossLayerFeedbackState,
    adaptiveExecutionDecision,
    systemOptimizationPlan,
    productIterationInsights,
  });
  const { ownerAuditView } = createOwnerAuditLogViewer({
    auditLogRecord,
    projectAuditPayload,
  });
  const { systemActivityFeed } = createSystemWideActivityTracker({
    platformTrace,
    projectAuditRecord,
  });
  const { criticalChangeHistory } = createCriticalChangeHistorySystem({
    systemActivityFeed,
    auditLogRecord,
  });
  ({ complianceAuditSummary } = createComplianceAuditSummary({
    dataPrivacyClassification,
    privacyPolicyDecision,
    complianceConsentState,
    privacyRightsResult: project.context?.privacyRightsResult ?? project.privacyRightsResult ?? null,
    projectAuditRecord,
    projectAuditPayload,
  }));
  const { fallbackStrategy } = createFallbackStrategyResolver({
    failureRecoveryModel,
    executionModeDecision,
  });
  const { recoveryDecision, recoveryActions } = createRecoveryOrchestrationModule({
    retryPolicy,
    fallbackStrategy,
    rollbackPlan,
  });
  const { recoveryOptionsPayload } = createUserFacingRecoveryOptionsAssembler({
    failureRecoveryModel,
    recoveryDecision,
    recoveryActions,
    rollbackPlan,
  });
  const { acceptanceResult: failureRecoveryAcceptanceResult } = createFailureRecoveryAcceptanceTest({
    acceptanceScenario,
    recoveryDecision,
    recoveryOptionsPayload,
    failureExplanation,
  });
  const { acceptanceResult: approvalExplanationAcceptanceResult } = createApprovalExplanationAcceptanceTest({
    acceptanceScenario,
    approvalStatus,
    approvalExplanation,
    projectExplanation,
  });
  const { acceptanceResult } = createWorkspaceContinuityAcceptanceTest({
    acceptanceScenario,
    workspaceNavigationModel,
  });
  context.reliability = {
    decisionConfidenceThreshold: MIN_DECISION_CONFIDENCE,
  };
  context.knowledge = {
    summary: getNormalized(project, "scan")?.knowledge?.summary ?? null,
    readme: getNormalized(project, "scan")?.knowledge?.readme
      ? {
          path: getNormalized(project, "scan").knowledge.readme.path,
          headings: getNormalized(project, "scan").knowledge.readme.headings,
        }
      : null,
    docs: (getNormalized(project, "scan")?.knowledge?.docs ?? []).map((doc) => ({
      path: doc.path,
      headings: doc.headings,
    })),
    prDiscussions: (getNormalized(project, "scan")?.knowledge?.prDiscussions ?? []).map((discussion) => ({
      path: discussion.path,
      title: discussion.title,
    })),
    notionPages: (getNormalized(project, "scan")?.knowledge?.notionPages ?? []).map((page) => ({
      path: page.path,
      title: page.title,
    })),
    integrations: getNormalized(project, "scan")?.knowledge?.integrations ?? null,
  };
  context.domainRegistry = domainRegistry;
  context.domainProfile = domainProfile;
  context.domainCandidates = domainDecision.domainCandidates;
  context.confidenceScores = domainDecision.confidenceScores;
  context.domainCapabilities = domainCapabilities;
  context.requiredContextFields = requiredContextFields;
  context.executionModes = executionModes;
  context.recommendedDefaults = recommendedDefaults;
  context.defaultsTrace = defaultsTrace;
  context.stackRecommendation = stackRecommendation;
  context.businessContext = businessContext;
  context.nexusPositioning = nexusPositioning;
  context.messagingFramework = messagingFramework;
  context.messagingVariants = messagingVariants;
  context.landingVariantDecision = landingVariantDecision;
  context.objectionMap = objectionMap;
  context.faqMap = faqMap;
  context.activationGoals = activationGoals;
  context.productCtaStrategy = productCtaStrategy;
  context.nexusWebsiteSchema = nexusWebsiteSchema;
  context.landingPageIa = landingPageIa;
  context.websiteCopyPack = websiteCopyPack;
  context.websiteConversionFlow = websiteConversionFlow;
  context.waitlistRecord = waitlistRecord;
  context.accessRequest = accessRequest;
  context.websiteExperimentPlan = websiteExperimentPlan;
  context.trustProofBlocks = trustProofBlocks;
  context.productDeliveryModel = productDeliveryModel;
  context.siteAppBoundary = siteAppBoundary;
  context.accessModeDecision = accessModeDecision;
  context.landingAuthHandoff = landingAuthHandoff;
  context.appEntryDecision = appEntryDecision;
  context.postLoginDestination = postLoginDestination;
  context.returnTomorrowContinuity = returnTomorrowContinuity;
  context.appLandingEntry = appLandingEntry;
  context.entryStateVariants = entryStateVariants;
  context.entryRecoveryState = entryRecoveryState;
  context.entryOrientationPanel = entryOrientationPanel;
  context.entryDecisionSupport = entryDecisionSupport;
  context.firstProjectKickoff = firstProjectKickoff;
  context.landingToDashboardFlow = landingToDashboardFlow;
  context.projectDraft = projectDraft;
  context.projectCreationEvent = project.projectCreationEvent ?? null;
  context.projectCreationEvents = Array.isArray(project.projectCreationEvents) ? project.projectCreationEvents : [];
  context.projectCreationMetric = project.projectCreationMetric ?? null;
  context.projectCreationSummary = project.projectCreationSummary ?? null;
  context.projectIdentity = projectIdentity;
  context.productBoundaryModel = productBoundaryModel;
  context.capabilityLimitMap = capabilityLimitMap;
  context.boundaryDisclosureModel = boundaryDisclosureModel;
  context.systemCapabilityRegistry = systemCapabilityRegistry;
  context.externalCapabilityRegistry = externalCapabilityRegistry;
  context.sourceControlIntegration = sourceControlIntegration;
  context.secretResolutionState = secretResolutionState;
  context.connectorCredentialBinding = connectorCredentialBinding;
  context.inboundWebhookIngestion = inboundWebhookIngestion;
  context.executionActionRouting = executionActionRouting;
  context.actionToProviderMapping = actionToProviderMapping;
  context.capabilityDecision = capabilityDecision;
  context.nexusAppShellSchema = nexusAppShellSchema;
  context.authenticatedAppShell = authenticatedAppShell;
  context.navigationRouteSurface = navigationRouteSurface;
  context.projectIdentityProfile = projectIdentityProfile;
  context.identityCompleteness = identityCompleteness;
  context.instantValuePlan = instantValuePlan;
  context.decisionIntelligence = decisionIntelligence;
  context.approvalRequest = budgetApprovalRequest
    ? {
        ...approvalRequestWithStatus,
        ...budgetApprovalRequest,
      }
    : approvalRequestWithStatus;
  context.approvalRule = approvalRule;
  context.approvalTrigger = approvalTrigger;
  context.approvalRecords = approvalRecords;
  context.approvalRecord = approvalRecord;
  context.approvalStatus = approvalStatus;
  context.gatingDecision = gatingDecision;
  context.approvalAuditTrail = approvalAuditTrail;
  context.policySchema = policySchema;
  context.agentGovernancePolicy = agentGovernancePolicy;
  context.budgetDecision = budgetDecision;
  context.costVisibilityPayload = costVisibilityPayload;
  context.costDashboardModel = costDashboardModel;
  context.workspaceMode = workspaceMode;
  context.workspaceModeDefinitions = workspaceModeDefinitions;
  context.reasonableUsagePolicy = reasonableUsagePolicy;
  context.billingPlanSchema = billingPlanSchema;
  context.entitlementDecision = entitlementDecision;
  context.workspaceBillingState = workspaceBillingState;
  context.payingUserMetrics = payingUserMetrics;
  context.revenueSummary = revenueSummary;
  context.billingGuardDecision = billingGuardDecision;
  context.billingApprovalRequest = billingApprovalRequest;
  context.subscriptionState = subscriptionState;
  context.billingSettingsModel = billingSettingsModel;
  context.costAwareActionSelection = costAwareActionSelection;
  context.actionPolicy = actionPolicy;
  context.policyDecision = policyDecision;
  context.policyViolations = policyViolations;
  context.deployPolicyDecision = deployPolicyDecision;
  context.enforcementResult = enforcementResult;
  context.policyTrace = policyTrace;
  context.diffPreviewSchema = diffPreviewSchema;
  context.codeDiff = codeDiff;
  context.migrationDiff = migrationDiff;
  context.infraDiff = infraDiff;
  context.impactSummary = impactSummary;
  context.riskFlags = riskFlags;
  context.diffPreview = diffPreview;
  context.businessBottleneck = businessBottleneck;
  context.bottleneckState = bottleneckState;
  context.activeBottleneck = activeBottleneck;
  context.scoredBottleneck = scoredBottleneck;
  context.unblockPlan = unblockPlan;
  context.updatedBottleneckState = updatedBottleneckState;
  context.explanationSchema = explanationSchema;
  context.nextActionExplanation = nextActionExplanation;
  context.failureExplanation = failureExplanation;
  context.approvalExplanation = approvalExplanation;
  context.changeExplanation = changeExplanation;
  context.projectExplanation = projectExplanation;
  context.crossFunctionalTaskGraph = crossFunctionalTaskGraph;
  context.growthMarketingPlan = growthMarketingPlan;
  context.userIdentity = userIdentity;
  context.authenticationState = authenticationState;
  context.ownerAuthState = ownerAuthState;
  context.ownerMfaDecision = ownerMfaDecision;
  context.deviceTrustDecision = deviceTrustDecision;
  context.sensitiveActionConfirmation = sensitiveActionConfirmation;
  context.stepUpAuthDecision = stepUpAuthDecision;
  context.privilegedModeState = privilegedModeState;
  context.ownerAccessDecision = ownerAccessDecision;
  context.criticalOperationDecision = criticalOperationDecision;
  context.sessionState = sessionState;
  context.securitySignals = securitySignals;
  context.sessionSecurityDecision = sessionSecurityDecision;
  context.authenticationRouteDecision = authenticationRouteDecision;
  context.featureFlagSchema = featureFlagSchema;
  context.featureFlagDecision = featureFlagDecision;
  context.killSwitchDecision = killSwitchDecision;
  context.tokenBundle = tokenBundle;
  context.verificationFlowState = verificationFlowState;
  context.authenticationViewState = authenticationViewState;
  context.workspaceModel = workspaceModel;
  context.postAuthRedirect = postAuthRedirect;
  context.projectCreationExperience = projectCreationExperience;
  context.projectCreationRedirect = projectCreationRedirect;
  context.existingBusinessAssets = existingBusinessAssets;
  context.repositoryImportAndCodebaseDiagnosis = repositoryImportAndCodebaseDiagnosis;
  context.liveWebsiteIngestionAndFunnelDiagnosis = liveWebsiteIngestionAndFunnelDiagnosis;
  context.importedAnalyticsNormalization = importedAnalyticsNormalization;
  context.importedAssetTaskExtraction = importedAssetTaskExtraction;
  context.importAndContinueRoadmap = importAndContinueRoadmap;
  context.atomicExecutionEnvelope = atomicExecutionEnvelope;
  context.externalExecutionResult = externalExecutionResult;
  context.externalExecutionSession = externalExecutionSession;
  context.ideAgentResultNormalization = ideAgentResultNormalization;
  context.executionInvocationContract = executionInvocationContract;
  context.executionConsistencyReport = executionConsistencyReport;
  context.onboardingProgress = onboardingProgress;
  context.onboardingViewState = onboardingViewState;
  context.onboardingCompletionDecision = onboardingCompletionDecision;
  context.onboardingStateHandoff = onboardingStateHandoff;
  context.projectPermissionSchema = projectPermissionSchema;
  context.roleCapabilityMatrix = roleCapabilityMatrix;
  context.projectAuthorizationDecision = projectAuthorizationDecision;
  context.privilegedAuthorityDecision = privilegedAuthorityDecision;
  context.tenantIsolationSchema = tenantIsolationSchema;
  context.workspaceIsolationDecision = workspaceIsolationDecision;
  context.tenantBoundaryEvidence = tenantBoundaryEvidence;
  context.leakageAlert = leakageAlert;
  context.projectOwnershipBinding = projectOwnershipBinding;
  context.initialProjectStateContract = initialProjectStateContract;
  context.initialProjectState = bootstrappedInitialProjectState;
  context.initialProjectStateValidation = initialProjectStateValidation;
  context.stateValidationIssues = stateValidationIssues;
  context.initialTasks = initialTasks;
  context.taskSeedMetadata = taskSeedMetadata;
  context.selectedTask = selectedTask;
  context.selectionReason = selectionReason;
  context.nextTaskPresentation = nextTaskPresentation;
  context.nextTaskApprovalPanel = nextTaskApprovalPanel;
  context.recommendationDisplay = recommendationDisplay;
  context.recommendationSummaryPanel = recommendationSummaryPanel;
  context.editableProposal = editableProposal;
  context.editedProposal = editedProposal;
  context.proposalEditHistory = proposalEditHistory;
  context.partialAcceptanceDecision = partialAcceptanceDecision;
  context.approvalOutcome = approvalOutcome;
  context.remainingProposalScope = remainingProposalScope;
  context.cockpitRecommendationSurface = cockpitRecommendationSurface;
  context.stateBootstrapPayload = stateBootstrapPayload;
  context.membershipRecord = membershipRecord;
  context.accessDecision = accessDecision;
  context.collaborationEvent = collaborationEvent;
  context.projectPresenceState = projectPresenceState;
  context.userActivityEvent = userActivityEvent;
  context.userActivityHistory = userActivityHistory;
  context.userSessionMetric = userSessionMetric;
  context.userSessionHistory = userSessionHistory;
  context.userAgentMapping = userAgentMapping;
  context.returningUserMetric = returningUserMetric;
  context.retentionSummary = retentionSummary;
  context.retentionCurveAnalysis = retentionCurveAnalysis;
  context.invitationRecord = invitationRecord;
  context.roleAssignment = roleAssignment;
  context.workspaceSettings = workspaceSettings;
  context.nexusPersistenceSchema = nexusPersistenceSchema;
  context.migrationPlan = migrationPlan;
  context.migrationArtifacts = migrationArtifacts;
  context.entityRepository = entityRepository;
  context.storageRecord = storageRecord;
  context.dataPrivacyClassification = dataPrivacyClassification;
  context.platformCostMetric = platformCostMetric;
  context.aiUsageMetric = aiUsageMetric;
  context.workspaceComputeMetric = workspaceComputeMetric;
  context.buildDeployCostMetric = buildDeployCostMetric;
  context.storageCostMetric = storageCostMetric;
  context.costSummary = costSummary;
  context.normalizedBillingEvents = project.manualContext?.normalizedBillingEvents ?? [];
  context.billableUsage = billableUsage;
  context.privacyPolicyDecision = privacyPolicyDecision;
  context.privacyRightsResult = project.context?.privacyRightsResult ?? project.privacyRightsResult ?? null;
  context.backupStrategy = backupStrategy;
  context.restorePlan = restorePlan;
  context.reliabilitySlaModel = reliabilitySlaModel;
  context.continuityPlan = continuityPlan;
  context.serviceReliabilityDashboard = serviceReliabilityDashboard;
  context.postExecutionEvaluation = postExecutionEvaluation;
  context.postExecutionReport = postExecutionReport;
  context.crossLayerFeedbackState = crossLayerFeedbackState;
  context.adaptiveExecutionDecision = adaptiveExecutionDecision;
  context.systemOptimizationPlan = systemOptimizationPlan;
  context.canonicalBacklogRegeneration = canonicalBacklogRegeneration;
  context.disasterRecoveryChecklist = disasterRecoveryChecklist;
  context.businessContinuityState = businessContinuityState;
  context.userJourneys = userJourneys;
  context.journeySteps = journeySteps;
  context.journeyStateRegistry = journeyStateRegistry;
  context.journeyTransitionRegistry = journeyTransitionRegistry;
  context.journeyMap = journeyMap;
  context.screenInventory = screenInventory;
  context.screenFlowMap = screenFlowMap;
  context.screenContracts = screenContracts;
  context.mobileChecklist = mobileChecklist;
  context.screenStates = screenStates;
  context.screenValidationChecklist = screenValidationChecklist;
  context.designTokens = designTokens;
  context.typographySystem = typographySystem;
  context.layoutSystem = layoutSystem;
  context.colorRules = colorRules;
  context.interactionStateSystem = interactionStateSystem;
  context.componentContract = componentContract;
  context.primitiveComponents = primitiveComponents;
  context.layoutComponents = layoutComponents;
  context.feedbackComponents = feedbackComponents;
  context.navigationComponents = navigationComponents;
  context.dataDisplayComponents = dataDisplayComponents;
  context.screenTemplateSchema = screenTemplateSchema;
  context.dashboardTemplate = dashboardTemplate;
  context.detailPageTemplate = detailPageTemplate;
  context.workflowTemplate = workflowTemplate;
  context.managementTemplate = managementTemplate;
  context.templateVariants = templateVariants;
  context.aiDesignRequest = aiDesignServiceResult.aiDesignRequest;
  context.aiDesignProposal = aiDesignServiceResult.aiDesignProviderResult?.aiDesignProposal ?? null;
  context.aiDesignProviderResult = aiDesignServiceResult.aiDesignProviderResult ?? null;
  context.aiDesignServiceResult = aiDesignServiceResult;
  context.aiDesignExecutionState = aiDesignExecutionState;
  context.renderableScreenModel = renderableScreenModel;
  context.screenComponentMapping = screenComponentMapping;
  context.activeScreenVariantPlan = activeScreenVariantPlan;
  context.layoutCompositionPlan = layoutCompositionPlan;
  context.renderableScreenComposition = renderableScreenComposition;
  context.renderableDesignProposal = renderableDesignProposal;
  context.designProposalValidation = designProposalValidation;
  context.designProposalPreviewState = designProposalPreviewState;
  context.screenProposalDiff = screenProposalDiff;
  context.designProposalReviewState = designProposalReviewState;
  context.approvedScreenDelta = approvedScreenDelta;
  context.proposalApplyDecision = proposalApplyDecision;
  context.acceptedScreenState = acceptedScreenState;
  context.integratedDesignProposalState = integratedDesignProposalState;
  context.runtimeScreenRegistry = runtimeScreenRegistry;
  context.activeScreenResolver = activeScreenResolver;
  context.liveRuntimeScreenState = liveRuntimeScreenState;
  context.previewScreenViewModel = previewScreenViewModel;
  context.primaryActionValidation = primaryActionValidation;
  context.mobileValidation = mobileValidation;
  context.stateCoverageValidation = stateCoverageValidation;
  context.consistencyValidation = consistencyValidation;
  context.screenReviewReport = screenReviewReport;
  context.learningInsights = learningInsights;
  context.learningInsightViewModel = learningInsightViewModel;
  context.reasoningPanel = reasoningPanel;
  context.confidenceIndicator = confidenceIndicator;
  context.userPreferenceSignals = userPreferenceSignals;
  context.crossProjectPatternPanel = crossProjectPatternPanel;
  context.learningDisclosure = learningDisclosure;
  context.aiLearningWorkspaceTemplate = aiLearningWorkspaceTemplate;
  context.contextRelevanceSchema = contextRelevanceSchema;
  context.relevanceFilteredContext = relevanceFilteredContext;
  context.slimmedContextPayload = slimmedContextPayload;
  context.droppedContextSummary = droppedContextSummary;
  context.companionState = companionState;
  context.companionTriggerDecision = companionTriggerDecision;
  context.companionMessagePriority = companionMessagePriority;
  context.companionPresence = companionPresence;
  context.companionDock = companionDock;
  context.companionPanel = companionPanel;
  context.animationStateRules = animationStateRules;
  context.companionModeSettings = companionModeSettings;
  context.interruptionDecision = interruptionDecision;
  context.aiCompanionTemplate = aiCompanionTemplate;
  context.developerWorkspace = developerWorkspace;
  context.projectWorkbenchLayout = projectWorkbenchLayout;
  context.fileEditorContract = fileEditorContract;
  context.commandConsoleView = commandConsoleView;
  context.aiControlCenterSurface = aiControlCenterSurface;
  context.dailyWorkspaceSurface = dailyWorkspaceSurface;
  context.guidedTaskExecutionSurface = guidedTaskExecutionSurface;
  context.taskStepFlowProgress = taskStepFlowProgress;
  context.taskApprovalHandoffPanel = taskApprovalHandoffPanel;
  context.settingsProfileSurface = settingsProfileSurface;
  context.liveLogStream = liveLogStream;
  context.branchDiffActivityPanel = branchDiffActivityPanel;
  context.reviewThreadState = reviewThreadState;
  context.sharedApprovalState = sharedApprovalState;
  context.collaborationFeed = collaborationFeed;
  context.projectStateSnapshot = projectStateSnapshot;
  context.snapshotRecord = snapshotRecord;
  context.stateDiff = stateDiff;
  context.restoreDecision = restoreDecision;
  context.rollbackExecutionResult = rollbackExecutionResult;
  context.artifactBuildPanel = artifactBuildPanel;
  context.developmentWorkspace = developmentWorkspace;
  context.reactiveWorkspaceState = reactiveWorkspaceState;
  context.projectBrainWorkspace = projectBrainWorkspace;
  context.releaseWorkspace = releaseWorkspace;
  context.growthWorkspace = growthWorkspace;
  context.workspaceNavigationModel = workspaceNavigationModel;
  context.acceptanceScenario = acceptanceScenario;
  context.acceptanceResult = acceptanceResult;
  context.onboardingAcceptanceResult = onboardingAcceptanceResult;
  context.executionAcceptanceResult = executionAcceptanceResult;
  context.failureRecoveryAcceptanceResult = failureRecoveryAcceptanceResult;
  context.approvalExplanationAcceptanceResult = approvalExplanationAcceptanceResult;
  context.executionTopology = executionTopology;
  context.cloudWorkspaceModel = cloudWorkspaceModel;
  context.localDevelopmentBridge = localDevelopmentBridge;
  context.remoteMacRunner = remoteMacRunner;
  context.ideAgentExecutorContract = ideAgentExecutorContract;
  context.localCodingAgentAdapter = localCodingAgentAdapter;
  context.executionProviderCapabilitySync = executionProviderCapabilitySync;
  context.executionModeDecision = executionModeDecision;
  context.sandboxDecision = sandboxDecision;
  context.agentLimitDecision = agentLimitDecision;
  context.agentGovernanceTrace = agentGovernanceTrace;
  context.bootstrapPlan = bootstrapPlan;
  context.bootstrapTasks = bootstrapTasks;
  context.bootstrapAssignments = bootstrapAssignments;
  context.bootstrapExecutionRequests = bootstrapExecutionRequests;
  context.bootstrapResolvedSurfaces = bootstrapResolvedSurfaces;
  context.bootstrapPlannedCommands = bootstrapPlannedCommands;
  context.bootstrapRawExecutionResults = bootstrapRawExecutionResults;
  context.bootstrapArtifacts = bootstrapArtifacts;
  context.bootstrapExecutionMetadata = bootstrapExecutionMetadata;
  context.bootstrapExecutionResult = bootstrapExecutionResult;
  context.bootstrapResult = bootstrapResult;
  context.bootstrapValidation = bootstrapValidation;
  context.bootstrapStateUpdate = bootstrapStateUpdate;
  context.firstValueOutput = firstValueOutput;
  context.bootstrapExecutionGraph = bootstrapExecutionGraph;
  context.executionProgressSchema = executionProgressSchema;
  context.normalizedProgressInputs = normalizedProgressInputs;
  context.blockedTaskOutcomes = blockedTaskOutcomes;
  context.taskExecutionMetric = taskExecutionMetric;
  context.taskExecutionCounters = taskExecutionCounters;
  context.taskThroughputSummary = taskThroughputSummary;
  context.baselineEstimate = baselineEstimate;
  context.timeSavedMetric = timeSavedMetric;
  context.timeSaved = timeSaved;
  context.humanUserProductivity = humanUserProductivity;
  context.productivitySummary = productivitySummary;
  context.outcomeEvaluation = outcomeEvaluation;
  context.actionSuccessScore = actionSuccessScore;
  context.outcomeFeedbackState = outcomeFeedbackState;
  context.progressPhase = progressPhase;
  context.progressPercent = progressPercent;
  context.completionEstimate = completionEstimate;
  context.progressState = progressState;
  context.goalProgressState = goalProgressState;
  context.realityProgress = realityProgress;
  context.firstValueSummary = firstValueSummary;
  context.activationFunnel = activationFunnel;
  context.activationMilestones = activationMilestones;
  context.milestoneTracking = milestoneTracking;
  context.productIterationInsights = productIterationInsights;
  context.onboardingMarketingFlow = onboardingMarketingFlow;
  context.activationDropOffs = activationDropOffs;
  context.reEngagementPlan = reEngagementPlan;
  context.nexusContentStrategy = nexusContentStrategy;
  context.launchContentCalendar = launchContentCalendar;
  context.storyAssets = storyAssets;
  context.socialCommunityPack = socialCommunityPack;
  context.productProofPlan = productProofPlan;
  context.launchCampaignBrief = launchCampaignBrief;
  context.launchRolloutPlan = launchRolloutPlan;
  context.launchReadinessChecklist = launchReadinessChecklist;
  context.launchPublishingPlan = launchPublishingPlan;
  context.launchFeedbackSummary = launchFeedbackSummary;
  context.goToMarketPlan = goToMarketPlan;
  context.promotionExecutionPlan = promotionExecutionPlan;
  context.launchMarketingExecution = launchMarketingExecution;
  context.gtmMetricSchema = gtmMetricSchema;
  context.acquisitionSourceMetrics = acquisitionSourceMetrics;
  context.firstTouchAttribution = firstTouchAttribution;
  context.preAuthConversionEvents = preAuthConversionEvents;
  context.websiteActivationFunnel = websiteActivationFunnel;
  context.conversionAnalytics = conversionAnalytics;
  context.launchPerformanceDashboard = launchPerformanceDashboard;
  context.gtmOptimizationPlan = gtmOptimizationPlan;
  context.growthLoopManagement = growthLoopManagement;
  context.ownerControlPlane = ownerControlPlane;
  context.ownerControlCenter = ownerControlCenter;
  context.dailyOwnerOverview = dailyOwnerOverview;
  context.ownerPriorityQueue = ownerPriorityQueue;
  context.ownerActionRecommendations = ownerActionRecommendations;
  context.ownerDecisionDashboard = ownerDecisionDashboard;
  context.ownerDailyWorkflow = ownerDailyWorkflow;
  context.ownerFocusArea = ownerFocusArea;
  context.ownerTaskList = ownerTaskList;
  context.ownerRoutinePlan = ownerRoutinePlan;
  context.dashboardHomeSurface = dashboardHomeSurface;
  context.unifiedHomeDashboard = unifiedHomeDashboard;
  context.todayPrioritiesFeed = todayPrioritiesFeed;
  context.ownerVisibilityStrip = ownerVisibilityStrip;
  context.ownerRevenueView = ownerRevenueView;
  context.ownerCostView = ownerCostView;
  context.profitMarginSummary = profitMarginSummary;
  context.unitEconomicsDashboard = unitEconomicsDashboard;
  context.cashFlowProjection = cashFlowProjection;
  context.ownerUserAnalytics = ownerUserAnalytics;
  context.featureUsageSummary = featureUsageSummary;
  context.decisionAccuracySummary = decisionAccuracySummary;
  context.automationImpactSummary = automationImpactSummary;
  context.roadmapTracking = roadmapTracking;
  context.ownerOperationsSignals = ownerOperationsSignals;
  context.prioritizedOwnerAlerts = prioritizedOwnerAlerts;
  context.ownerAlertFeed = ownerAlertFeed;
  context.ownerIncident = ownerIncident;
  context.outageResponsePlan = outageResponsePlan;
  context.incidentTimeline = incidentTimeline;
  context.rootCauseSummary = rootCauseSummary;
  context.liveProjectMonitoring = liveProjectMonitoring;
  context.maintenanceBacklog = maintenanceBacklog;
  context.realtimeEventStream = realtimeEventStream;
  context.liveUpdateChannel = liveUpdateChannel;
  context.formattedLogs = formattedLogs;
  context.userFacingMessages = userFacingMessages;
  context.platformTrace = platformTrace;
  context.platformLogs = platformLogs;
  context.incidentAlert = incidentAlert;
  context.systemBottleneckSummary = systemBottleneckSummary;
  context.auditLogRecord = auditLogRecord;
  context.securityAuditRecord = securityAuditRecord;
  context.projectAuditEvent = projectAuditEvent;
  context.projectAuditRecord = projectAuditRecord;
  context.actorActionTrace = actorActionTrace;
  context.projectAuditPayload = projectAuditPayload;
  context.ownerAuditView = ownerAuditView;
  context.systemActivityFeed = systemActivityFeed;
  context.criticalChangeHistory = criticalChangeHistory;
  context.notificationPayload = notificationPayload;
  context.notificationEvent = notificationEvent;
  context.notificationCenterState = notificationCenterState;
  context.notificationPreferences = notificationPreferences;
  context.userPreferenceProfile = userPreferenceProfile;
  context.complianceConsentState = complianceConsentState;
  context.complianceAuditSummary = complianceAuditSummary;
  context.emailDeliveryResult = emailDeliveryResult;
  context.externalDeliveryResult = externalDeliveryResult;
  context.releasePlan = releasePlan;
  context.releaseSteps = releaseSteps;
  context.buildTargets = buildTargets;
  context.buildArtifactManifest = artifactManifest;
  context.artifactRecord = artifactRecord;
  context.packagingRequirements = packagingRequirements;
  context.packageFormat = packageFormat;
  context.packagingManifest = packagingManifest;
  context.packagedArtifact = packagedArtifact;
  context.packageVerification = packageVerification;
  context.testExecutionRequest = testExecutionRequest;
  context.testRunPlan = testRunPlan;
  context.rawTestResults = rawTestResults;
  context.normalizedTestResults = normalizedTestResults;
  context.qualityGateDecision = qualityGateDecision;
  context.nextVersion = nextVersion;
  context.releaseTag = releaseTag;
  context.releaseRequirementsSchema = releaseRequirementsSchema;
  context.artifactValidation = artifactValidation;
  context.metadataValidation = metadataValidation;
  context.approvalValidation = approvalValidation;
  context.blockingIssues = blockingIssues;
  context.validationReport = validationReport;
  context.hostingAdapter = hostingAdapter;
  context.deploymentRequest = deploymentRequest;
  context.providerAdapter = providerAdapter;
  context.accountRecord = accountRecord;
  context.providerSession = providerSession;
  context.providerContractSession = providerContractSession;
  context.authModeDefinition = authModeDefinition;
  context.credentialReference = credentialReference;
  context.encryptedCredential = encryptedCredential;
  context.credentialVaultRecord = credentialVaultRecord;
  context.credentialPolicyDecision = credentialPolicyDecision;
  context.rotationResult = project.rotationResult ?? null;
  context.providerConnectorSchema = providerConnectorSchema;
  context.providerCapabilities = providerCapabilities;
  context.providerOperations = providerOperations;
  context.providerConnector = providerConnector;
  context.providerDegradationState = providerDegradationState;
  context.circuitBreakerDecision = circuitBreakerDecision;
  context.providerRecoveryProbe = providerRecoveryProbe;
  context.externalProviderHealthAndFailover = externalProviderHealthAndFailover;
  context.designToolImportAdapter = designToolImportAdapter;
  context.verificationResult = verificationResult;
  context.ownershipPolicy = ownershipPolicy;
  context.consentRecord = consentRecord;
  context.guardResult = guardResult;
  context.preparedArtifact = preparedArtifact;
  context.releaseStateUpdate = releaseStateUpdate;
  context.releaseExecutionGraph = releaseExecutionGraph;
  context.releaseStatus = releaseStatus;
  context.releaseRun = releaseRun;
  context.releaseTimeline = releaseTimeline;
  context.failureSummary = failureSummary;
  context.failureRecoveryModel = failureRecoveryModel;
  context.retryPolicy = retryPolicy;
  context.fallbackStrategy = fallbackStrategy;
  context.rollbackPlan = rollbackPlan;
  context.recoveryDecision = recoveryDecision;
  context.recoveryActions = recoveryActions;
  context.recoveryOptionsPayload = recoveryOptionsPayload;
  context.followUpTasks = followUpTasks;
  context.testReportSummary = testReportSummary;
  context.pollingRequest = pollingRequest;
  context.resolvedPoller = resolvedPoller;
  context.rawStatusResponse = rawStatusResponse;
  context.statusEvents = statusEvents;
  context.pollingDecision = pollingDecision;
  context.pollingMetadata = pollingMetadata;
  return context;
}
