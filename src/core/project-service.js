import { NexusOrchestrator } from "./orchestrator.js";
import { AgentRuntime } from "./agent-runtime.js";
import { EventBus } from "./event-bus.js";
import { FileEventLog } from "./file-event-log.js";
import { createFirstReleaseFileIntakeBoundary } from "./file-intake-boundary.js";
import { createFileAndArtifactStorageModule } from "./file-artifact-storage-module.js";
import { scanProject } from "./project-scanner.js";
import { AiProjectAnalyst } from "./ai-analyst.js";
import { CasinoDiagnosticsConnector } from "./casino-connector.js";
import { GitHostingConnector } from "./git-connector.js";
import { RuntimeSourcesConnector } from "./runtime-connector.js";
import { NotionConnector } from "./notion-connector.js";
import { OnboardingService } from "./onboarding-service.js";
import { buildProjectContext } from "./context-builder.js";
import { buildObservedProjectState } from "./project-state.js";
import { buildExecutionGraph, reconcileRoadmap } from "./project-graph.js";
import { normalizeProjectSources } from "./normalization-layer.js";
import { defineLifecycleState } from "./project-lifecycle.js";
import { createBlockedTaskOutcomeCanonicalizer } from "./blocked-task-outcome-canonicalizer.js";
import { ingestTaskResults } from "./task-result-ingestion.js";
import { defineOutcomeEvaluationSchema } from "./outcome-evaluation-schema.js";
import { createActionSuccessScoringEngine } from "./action-success-scoring-engine.js";
import { SourceAdapterRegistry } from "./source-adapter.js";
import { CasinoSourceAdapter } from "./casino-source-adapter.js";
import { RuntimeSourceAdapter } from "./runtime-source-adapter.js";
import { createExternalAccountRegistry } from "./external-account-registry.js";
import { createProviderConnectorContract } from "./provider-connector-contract.js";
import { createProviderConnectorAssembler } from "./provider-connector-assembler.js";
import { createProviderCapabilityDescriptor } from "./provider-capability-descriptor.js";
import { createProviderOperationContract } from "./provider-operation-contract.js";
import {
  buildProviderGatewayBoundary,
  buildProviderReleaseRegistry,
  normalizeCreativeProviderOutput,
} from "./provider-gateway-boundary.js";
import { createAccountVerificationModule } from "./account-verification-module.js";
import { createCredentialVaultInterface } from "./credential-vault-interface.js";
import { createSecretRotationWorkflow } from "./secret-rotation-workflow.js";
import { createApprovalRecordStore } from "./approval-record-store.js";
import { defineUserIdentitySchema } from "./user-identity-schema.js";
import { createAuthenticationSystem } from "./authentication-system.js";
import { createOwnerSecureAuthenticationSystem } from "./owner-secure-authentication-system.js";
import { createOwnerMfaEnforcement } from "./owner-mfa-enforcement.js";
import { createSessionAndTokenManagement } from "./session-and-token-management.js";
import { createSessionSecurityControls } from "./session-security-controls.js";
import { createAuthenticationRouteResolver } from "./authentication-route-resolver.js";
import { buildAuthenticationScreenStates } from "./authentication-screen-states.js";
import { createPostAuthRedirectResolver } from "./post-auth-redirect-resolver.js";
import { createProjectDraftCreationService } from "./project-draft-creation-service.js";
import { defineProjectCreationEventSchema } from "./project-creation-event-schema.js";
import { createProjectCreationTracker } from "./project-creation-tracker.js";
import { createProjectCreationAggregationModule } from "./project-creation-aggregation-module.js";
import { createProjectCreationExperienceModel } from "./project-creation-experience-model.js";
import { createPostProjectCreationRedirectResolver } from "./post-project-creation-redirect-resolver.js";
import { createProjectStateBootstrapService } from "./project-state-bootstrap-service.js";
import { createOnboardingCompletionEvaluator } from "./onboarding-completion-evaluator.js";
import { createOnboardingToStateHandoffContract } from "./onboarding-to-state-handoff-contract.js";
import { createAdaptiveOnboardingAgentContract } from "./adaptive-onboarding-agent-contract.js";
import { buildCanonicalProofArtifact } from "./canonical-proof-artifact.js";
import { buildRuntimeSkeletonTruthEnvelope } from "./runtime-skeleton-truth.js";
import {
  applyBuildMutationTruth,
  replayBuildMutationIntentsOnSkeleton,
} from "./build-mutation-truth.js";
import {
  buildRuntimeLearningDecisionHints,
  createSkeletonChoiceLearningEvents,
  createBuildMutationLearningEvents,
  createRuntimeCreationLearningEvents,
  mergeRuntimeLearningEvents,
} from "./runtime-learning-events.js";
import { createBuildAgentLearningInstructions } from "./build-agent-learning-instructions.js";
import { createBuildAgentTurnDecision } from "./build-agent-turn-router.js";
import { resolveBuildAgentDownstreamAction } from "./build-agent-downstream-action.js";
import {
  appendBuildSpeechHistory,
  enforceBuildSpeechBoundary,
  resolveFreeTextMutationOperation,
} from "./build-speech-truth-gate.js";
import { applyVisualBuildTruth } from "./visual-build-truth.js";
import {
  appendMutationChangeHistory,
  createMutationChangeAgentDecision,
  finalizeMutationChangeAgentDecision,
} from "./mutation-change-agent.js";
import { buildCanonicalMutationFlowShell } from "./canonical-mutation-flow-shell.js";
import {
  buildHistoryContinuityAgentEnvelope,
  createHistoryRestoreDecision,
  executeHistoryRestoreDecision,
} from "./history-continuity-agent.js";
import {
  approveShareDemoAgentEnvelope,
  buildShareDemoAgentEnvelope,
  revokeShareDemoAgentEnvelope,
} from "./share-demo-agent.js";
import { buildGrowthAgentEnvelope } from "./growth-agent.js";
import { buildGrowthMeasurementTruth } from "./growth-measurement-truth.js";
import { buildSocialCampaignExecutionAgentEnvelope } from "./social-campaign-execution-agent.js";
import { buildSeoActionPathEnvelope } from "./seo-action-path.js";
import { buildSemActionPathEnvelope } from "./sem-action-path.js";
import { buildEmailActionPathEnvelope } from "./email-action-path.js";
import { buildLandingActionPathEnvelope } from "./landing-action-path.js";
import { buildLandingBackendSyncEnvelope } from "./landing-backend-sync.js";
import {
  buildApprovedProductDirectionPatch,
  buildBuildApprovalFlow,
  decideBuildApprovalFlow,
} from "./build-approval-flow.js";
import {
  buildSkeletonChoiceTruthEnvelope,
  selectSkeletonChoiceCandidate,
} from "./skeleton-choice-candidates.js";
import { buildRepeatedLoopContinuation } from "./repeated-loop-continuation.js";
import { createUploadedIntakeToScannerHandoff } from "./uploaded-intake-to-scanner-handoff.js";
import { buildComparableProductShellReply } from "./comparable-product-intelligence.js";
import { createPasswordResetAndEmailVerificationFlow } from "./password-reset-email-verification-flow.js";
import { defineWorkspaceAndMembershipModel } from "./workspace-membership-model.js";
import { createProjectAccessControlModule } from "./project-access-control-module.js";
import { defineProjectPermissionSchema } from "./project-permission-schema.js";
import { createProjectRoleCapabilityMatrix } from "./project-role-capability-matrix.js";
import { defineTenantIsolationSchema } from "./tenant-isolation-schema.js";
import { createActionLevelProjectAuthorizationResolver } from "./action-level-project-authorization-resolver.js";
import { createWorkspaceIsolationGuard } from "./workspace-isolation-guard.js";
import { createRoleAssignmentAndInvitationFlow } from "./role-assignment-invitation-flow.js";
import { createOrganizationWorkspaceSettingsModule } from "./workspace-settings-module.js";
import { createNotificationPreferenceSettings } from "./notification-preference-settings.js";
import { createPlatformObservabilityTransport } from "./platform-observability-transport.js";
import { createPersistentProjectSnapshotStore, createProjectSnapshotStore } from "./project-snapshot-store.js";
import { createProjectAuditApiAndViewerModel } from "./project-audit-api-viewer-model.js";
import { createSystemAuditLogStore } from "./system-audit-log-store.js";
import { createSecurityAuditLogStore } from "./security-audit-log-store.js";
import { createProjectReviewThreadStore } from "./project-review-thread-store.js";
import { createPersistentUserActivitySessionHistoryStore } from "./user-activity-session-history-store.js";
import { createDurableUserAccountStore } from "./durable-user-account-store.js";
import { createDurableProjectWorkspaceStore } from "./durable-project-workspace-store.js";
import { createDurableSessionContinuityStore } from "./durable-session-continuity-store.js";
import { createDurableProjectCreationEventHistoryStore } from "./durable-project-creation-event-history-store.js";
import { createProjectRollbackExecutionModule } from "./project-rollback-execution-module.js";
import { createSnapshotBackupSchedulingModule } from "./snapshot-backup-scheduling-module.js";
import { createSnapshotRetentionGuard } from "./snapshot-retention-guard.js";
import { createSnapshotBackupWorkerJob } from "./snapshot-backup-worker-job.js";
import { createPrivacyRightsExecutionModule } from "./privacy-rights-execution-module.js";
import {
  applyFirstReleaseAccountAction,
  buildFirstReleaseAccountBoundary,
} from "./first-release-account-boundary.js";
import {
  buildCanonicalBillingEventInput,
  buildWorkspaceBillingActionId,
  buildWorkspaceBillingIdempotencyEnvelope,
  buildWorkspaceBillingPayload,
  buildWorkspaceBillingResult,
  isWorkspaceBillingActionType,
  validateWorkspaceBillingActionInput,
  WORKSPACE_BILLING_EVENT_TYPES,
} from "./workspace-billing-action-service.js";
import { createProviderBillingEventAdapter } from "./provider-billing-event-adapter.js";
import { ingestBillingEvent } from "./billing-event-ingestion-service.js";

import { DevAgentWorker } from "../agents/dev-agent/worker.js";
import { MarketingAgentWorker } from "../agents/marketing-agent/worker.js";
import { QaAgentWorker } from "../agents/qa-agent/worker.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function hasObjectKeys(value) {
  return value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeProjectIdSegment(value, fallback = "project") {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;
}

function resolveFinishedOnboardingProjectId({
  projectDraft = {},
  finishedSession = {},
} = {}) {
  const draftId = normalizeProjectIdSegment(
    projectDraft.id ?? finishedSession.projectDraftId,
    "project-draft",
  );
  if (draftId && draftId !== "project-draft") {
    return draftId;
  }

  const sessionId = normalizeProjectIdSegment(finishedSession.sessionId, "");
  const sessionSuffix = sessionId
    .replace(/^onboarding-project-draft-/, "")
    .replace(/^onboarding-/, "");

  return normalizeProjectIdSegment(`project-${sessionSuffix || Date.now()}`, "project");
}

function resolveProjectOwnerUserId(project = null) {
  const normalizedProject = normalizeObject(project);
  return normalizeString(
    normalizedProject.state?.workspaceModel?.ownerUserId,
    normalizeString(
      normalizedProject.context?.workspaceModel?.ownerUserId,
      normalizeString(
        normalizedProject.userId,
        normalizeString(normalizedProject.onboardingSession?.userId, null),
      ),
    ),
  );
}

function isProjectAccessibleToUser(project = null, userId = null, { allowUnowned = false } = {}) {
  const normalizedUserId = normalizeString(userId, null);
  if (!normalizedUserId) {
    return allowUnowned === true && !resolveProjectOwnerUserId(project);
  }

  const ownerUserId = resolveProjectOwnerUserId(project);
  if (ownerUserId === normalizedUserId) {
    return true;
  }

  const membershipRecords = [
    project?.state?.membershipRecord,
    project?.context?.membershipRecord,
    ...(Array.isArray(project?.state?.workspaceModel?.members) ? project.state.workspaceModel.members : []),
    ...(Array.isArray(project?.context?.workspaceModel?.members) ? project.context.workspaceModel.members : []),
  ].filter(Boolean);
  const activeMember = membershipRecords.find((record) => (
    record?.userId === normalizedUserId
    || record?.memberUserId === normalizedUserId
    || record?.actorId === normalizedUserId
  ) && normalizeString(record?.status, "active") !== "removed" && normalizeString(record?.status, "active") !== "disabled");
  if (activeMember) {
    return true;
  }

  if (!ownerUserId) {
    return allowUnowned === true;
  }

  return false;
}

function normalizeTeamRole(role, fallback = "viewer") {
  const normalizedRole = normalizeString(role, fallback)?.toLowerCase();
  if (normalizedRole === "member") return "editor";
  if (["owner", "admin", "editor", "viewer", "guest"].includes(normalizedRole)) {
    return normalizedRole;
  }
  return fallback;
}

function createProjectTeamMember({
  workspaceId,
  userId = null,
  email = null,
  displayName = null,
  role = "viewer",
  status = "active",
  isOwner = false,
} = {}) {
  const normalizedUserId = normalizeString(userId, null);
  const normalizedEmail = normalizeString(email, null);
  const memberKey = normalizedUserId ?? normalizedEmail ?? `member-${Date.now()}`;
  return {
    membershipId: `${workspaceId ?? "workspace"}:${memberKey}`,
    workspaceId: workspaceId ?? null,
    userId: normalizedUserId,
    email: normalizedEmail,
    displayName: normalizeString(displayName, normalizedEmail ?? normalizedUserId ?? "Team member"),
    role: normalizeTeamRole(role, isOwner ? "owner" : "viewer"),
    status: normalizeString(status, "active"),
    isOwner: isOwner === true,
    joinedAt: new Date().toISOString(),
  };
}

function buildProjectTeamBoundary({ project, workspaceModel }) {
  const normalizedWorkspaceModel = normalizeObject(workspaceModel);
  const workspaceId = normalizeString(normalizedWorkspaceModel.workspaceId, `workspace-${project?.userId ?? "unknown"}`);
  const ownerUserId = normalizeString(
    normalizedWorkspaceModel.ownerUserId,
    normalizeString(project?.userId, null),
  );
  const existingMembers = normalizeArray(normalizedWorkspaceModel.members);
  const ownerMember = createProjectTeamMember({
    workspaceId,
    userId: ownerUserId,
    displayName: ownerUserId,
    role: "owner",
    status: "active",
    isOwner: true,
  });
  const memberMap = new Map();
  [ownerMember, ...existingMembers].forEach((member) => {
    const key = normalizeString(member?.userId, normalizeString(member?.email, null));
    if (!key) return;
    const normalizedMember = {
      ...member,
      workspaceId,
      role: normalizeTeamRole(member?.role, member?.isOwner ? "owner" : "viewer"),
      status: normalizeString(member?.status, "active"),
      isOwner: member?.isOwner === true || member?.userId === ownerUserId,
    };
    memberMap.set(key, normalizedMember);
  });
  const members = [...memberMap.values()];
  const roles = [...new Set([
    "owner",
    "admin",
    "editor",
    "viewer",
    ...members.map((member) => normalizeTeamRole(member.role, "viewer")),
  ])];
  const invitations = normalizeArray(normalizedWorkspaceModel.invitations);
  const activeMembers = members.filter((member) => !["removed", "disabled"].includes(member.status));

  return {
    workspaceModel: {
      ...normalizedWorkspaceModel,
      workspaceId,
      ownerUserId,
      roles,
      members,
      invitations,
      memberCount: activeMembers.length,
    },
    teamMembershipBoundary: {
      teamMembershipBoundaryId: `team-membership:${workspaceId}`,
      taskId: "EXP-009",
      status: "ready",
      workspaceId,
      ownerUserId,
      roles,
      members,
      invitations,
      states: {
        invitation: ["pending", "accepted", "revoked", "expired", "invalid"],
        membership: ["active", "removed", "disabled"],
        ownershipTransfer: ["available-for-owner", "blocked-for-non-owner"],
      },
      firstReleaseBoundary: {
        advancedEnterpriseGovernance: false,
        billingRoles: "owned-by-BILLING-001",
        externalIdentity: "owned-by-SSO-001",
      },
    },
  };
}

function resolveProjectCompanionTruth({ project = null, session = null } = {}) {
  const normalizedProject = normalizeObject(project);
  const normalizedSession = normalizeObject(session);
  const conversationState = normalizeObject(normalizedSession.conversation);
  const summary = Object.keys(normalizedSession).length > 0
    ? normalizeObject(normalizedSession.summaryOverride ?? null)
    : {};
  const envelopeSummary = normalizeObject(
    normalizeObject(normalizedSession.conversationSummary).onboardingConversation?.summary
      ?? null,
  );
  const conversationSummary = normalizeObject(
    normalizedSession.conversationSummary
      ?? normalizedSession.summary
      ?? null,
  );
  const liveSummary = summary.understoodItems
    ? summary
    : envelopeSummary.understoodItems
      ? envelopeSummary
      : conversationSummary.understoodItems
        ? conversationSummary
        : {};
  const projectSummary = normalizeObject(
    normalizedProject.onboardingStateHandoff?.summary
      ?? normalizedProject.context?.onboardingStateHandoff?.summary
      ?? normalizedProject.overview
      ?? null,
  );
  const artifactExpectation = normalizeObject(
    normalizedProject.artifactExpectation
      ?? normalizedProject.context?.artifactExpectation
      ?? normalizedProject.onboardingStateHandoff?.artifactExpectation
      ?? normalizedProject.context?.onboardingStateHandoff?.artifactExpectation,
  );
  const knowledgeAnswers = normalizeObject(
    normalizedProject.projectDraft?.state?.knowledge?.onboardingConversationAnswers
      ?? normalizedProject.state?.knowledge?.onboardingConversationAnswers
      ?? {},
  );
  const understoodItems = normalizeArray(
    envelopeSummary.understoodItems
      ?? normalizeObject(normalizedSession.conversationSummary ?? conversationSummary).understoodItems
      ?? liveSummary.understoodItems
      ?? [],
  );
  const missingItems = normalizeArray(
    envelopeSummary.missingItems
      ?? normalizeObject(normalizedSession.conversationSummary ?? conversationSummary).missingItems
      ?? liveSummary.missingItems
      ?? [],
  );
  const fallbackUnderstood = [
    normalizeString(normalizedProject.goal, ""),
    normalizeString(knowledgeAnswers["target-audience"], ""),
    normalizeString(knowledgeAnswers["core-problem"], ""),
    normalizeString(knowledgeAnswers["successful-solution"], ""),
  ].filter(Boolean);

  return {
    projectName: normalizeString(normalizedProject.name, normalizeString(normalizedSession.projectDraft?.name, "הפרויקט")),
    projectGoal: normalizeString(normalizedProject.goal, normalizeString(normalizedSession.projectDraft?.goal, "")),
    projectType: normalizeString(
      artifactExpectation.projectType,
      normalizeString(projectSummary.projectType, "unknown"),
    ),
    understoodItems: understoodItems.length > 0 ? understoodItems : fallbackUnderstood,
    missingItems,
    transcript: normalizeArray(conversationState.transcript),
  };
}

function buildProjectCompanionShellReply({
  userMessage = "",
  truth = {},
  learningInstructions = null,
  buildAgentTurn = null,
  buildAgentDownstreamResult = null,
} = {}) {
  const understoodItems = normalizeArray(truth.understoodItems);
  const missingItems = normalizeArray(truth.missingItems);
  const routingHints = normalizeArray(learningInstructions?.routingHints);
  const turn = normalizeObject(buildAgentTurn);
  const comparableReply = buildComparableProductShellReply({
    userMessage,
    projectType: truth.projectType,
    projectGoal: truth.projectGoal,
    understoodItems,
    missingItems,
  });
  const leadingTruth = understoodItems[0] ?? `כרגע די ברור לי שמדובר ב-${normalizeString(truth.projectName, "הפרויקט")}.`;
  const missingLine = missingItems[0]
    ? `מה שעוד חסר לי כדי לא להניח הנחה לא נכונה הוא: ${missingItems[0]}.`
    : "";
  const askedAboutMissing = /חסר|עוד לא ברור|מה עדיין/i.test(userMessage);
  const askedAboutUnderstanding = /הבנת|מה אתה מבין|מה כבר ברור/i.test(userMessage);
  const downstream = normalizeObject(buildAgentDownstreamResult);

  if (downstream.status === "applied") {
    return `${normalizeString(downstream.visibleSummary, "השינוי נרשם בשלד.")} זה מופיע עכשיו כאמת שינוי, ולכן מותר להציג אותו כתוצאה שבוצעה.`;
  }

  if (downstream.status === "failed-safely") {
    return `ניסיתי להעביר את הבקשה למסלול שינוי, אבל היא לא נסגרה כהצלחה. לא שיניתי את השלד. הסיבה: ${normalizeString(downstream.error, "השינוי לא עבר")}.`;
  }

  if (routingHints.includes("provider-release-boundary")) {
    return `אני לא אחבר עכשיו ספק אמיתי, לא אפרסם החוצה ולא אפעיל תשלום מתוך השלד הזה. זה צריך אישור וחיבור נפרד. הבקשה מסווגת כרגע למסלול ${turn.ownerLabel ?? "שחרור או שינוי מאושר"}, ולא כהצלחה שבוצעה.`;
  }

  if (routingHints.includes("prior-failure-requires-retry-or-clarification")) {
    return "אני רואה שניסיון שינוי קודם לא נסגר כהצלחה, אז אני לא אגיד שזה בוצע. אפשר לנסות שוב בצורה ממוקדת, או שאבקש הבהרה לפני שינוי נוסף.";
  }

  if (turn.owner === "verification-qa-agent") {
    return "אני מנתב את זה לבדיקה של השלד. עד שיש תוצאת בדיקה אמיתית, אני לא אגיד שהמסך תקין או שהבעיה נפתרה.";
  }

  if (turn.intent === "visual-style-change") {
    return "זה שינוי סגנון משמעותי. לפני שאני מחליף את הכיוון החזותי, צריך אישור: כיוון פרימיום רגוע או כיוון נועז וצבעוני?";
  }

  if (turn.owner === "visual-build-agent") {
    return "אני מנתב את זה לשינוי חזותי בשלד. רק אחרי שתהיה תוצאה גלויה בקנבס אגיד שהשינוי בוצע.";
  }

  if (turn.intent === "product-truth-change") {
    return "זו כבר החלפת כיוון מוצרית, אז צריך אישור והשפעה לפני שינוי. אני לא משנה מלידים להזמנות בשקט ולא מציג את זה כהצלחה.";
  }

  if (routingHints.includes("mutation-required-before-success")) {
    return "אני יכול להפוך את זה לבקשת שינוי, אבל לא אגיד שהמוצר השתנה עד ששינוי אמיתי יירשם ויופיע בשלד. כרגע זה צריך לעבור למסלול שינוי ולא להישאר תשובת צ׳אט בלבד.";
  }

  if (comparableReply) {
    return comparableReply;
  }

  if (askedAboutMissing && missingItems[0]) {
    return `${missingLine} אם ננעל את זה, התמונה תהיה הרבה יותר אמינה.`;
  }

  if (askedAboutUnderstanding) {
    return `ממה שכבר נסגר לי: ${leadingTruth}${missingLine ? ` ${missingLine}` : ""}`;
  }

  if (missingItems[0]) {
    return `ממה שכבר נסגר לי: ${leadingTruth} ${missingLine} אז השאלה הכי מועילה עכשיו היא: ${missingItems[0]}`;
  }

  return `ממה שכבר ברור לי, ${leadingTruth} אם יש נקודה שאתה חושב שלא הבנתי נכון, תגיד לי בדיוק איפה ההבנה שלי נשברת.`;
}

function remapRecordForApprovedDirection(record = {}, patch = {}) {
  const safeRecord = normalizeObject(record);
  const fields = normalizeArray(patch.fields);
  const singular = normalizeString(patch.primaryObjectSingular, "פריט");
  const baseName = normalizeString(safeRecord.name, normalizeString(safeRecord.title, singular));
  return {
    ...safeRecord,
    name: baseName.replace(/ליד/g, singular),
    title: normalizeString(safeRecord.title, baseName).replace(/ליד/g, singular),
    status: normalizeString(safeRecord.status, "פתוחה"),
    owner: normalizeString(safeRecord.owner, "לא משויך"),
    reminder: normalizeString(safeRecord.reminder, "לא נקבע"),
    nextStep: normalizeString(safeRecord.nextStep, "להגדיר צעד הבא"),
    ...Object.fromEntries(fields.map((field) => [field, safeRecord[field] ?? "לא סומן"])),
  };
}

function applyApprovedProductDirectionToProject(project = {}, approvalFlow = {}) {
  const patch = buildApprovedProductDirectionPatch({ approvalFlow });
  if (!patch) {
    return project;
  }

  const label = normalizeString(patch.label, "כיוון מוצר חדש");
  const singular = normalizeString(patch.primaryObjectSingular, "פריט");
  const plural = normalizeString(patch.primaryObjectPlural, "פריטים");
  const fields = normalizeArray(patch.fields);
  const sampleRecords = normalizeArray(patch.sampleRecords);
  const existingDomain = normalizeObject(project.productDomainSkeleton ?? project.context?.productDomainSkeleton ?? project.state?.productDomainSkeleton);
  const existingModels = normalizeArray(existingDomain.models);
  const existingState = normalizeObject(existingDomain.state);
  const existingRecords = normalizeArray(existingState.records);
  const nextRecords = sampleRecords.length > 0
    ? sampleRecords
    : existingRecords.map((record) => remapRecordForApprovedDirection(record, patch));
  const fieldObjects = fields.map((field) => ({ name: field, type: "text", required: false }));
  const nextDomain = {
    ...existingDomain,
    domainKind: normalizeString(patch.directionId, "product-direction"),
    productDirection: label,
    models: existingModels.length > 0
      ? existingModels.map((model, index) => index === 0
        ? {
            ...model,
            name: singular,
            fields: fieldObjects,
          }
        : model)
      : [
          {
            name: singular,
            fields: fieldObjects,
          },
        ],
    state: {
      ...existingState,
      selectedRecordId: normalizeString(nextRecords[0]?.id, existingState.selectedRecordId),
      records: nextRecords,
    },
    operations: normalizeArray(existingDomain.operations).length > 0
      ? existingDomain.operations
      : [
          { id: "record.create", label: `הוסף ${singular}` },
          { id: "record.updateStatus", label: "עדכן סטטוס" },
        ],
  };
  const existingRuntime = normalizeObject(project.runtimeSkeletonTruth ?? project.context?.runtimeSkeletonTruth ?? project.state?.runtimeSkeletonTruth);
  const nextRuntime = Object.keys(existingRuntime).length
    ? {
        ...existingRuntime,
        title: label,
        fields,
        productDirection: label,
        productDomainSkeleton: nextDomain,
      }
    : existingRuntime;
  const existingSkeleton = normalizeObject(project.productSkeletonAgentOutput ?? project.context?.productSkeletonAgentOutput ?? project.state?.productSkeletonAgentOutput);
  const nextSkeleton = Object.keys(existingSkeleton).length
    ? {
        ...existingSkeleton,
        productType: normalizeString(patch.productType, existingSkeleton.productType),
        primaryProblem: `מעקב מסודר אחרי ${plural}, אחריות, תזכורות וצעד הבא.`,
        firstWorkflow: {
          ...normalizeObject(existingSkeleton.firstWorkflow),
          title: `ניהול ${plural}`,
          steps: [`הוסף ${singular}`, "שייך אחראי", "קבע תזכורת", "עדכן צעד הבא"],
        },
        dataObjects: [
          {
            name: singular,
            fields,
          },
        ],
      }
    : existingSkeleton;

  project.name = label;
  project.goal = `כלי פנימי עבור ${plural} עם סטטוס, אחראי, תזכורת וצעד הבא.`;
  project.artifactExpectation = {
    ...normalizeObject(project.artifactExpectation),
    projectType: normalizeString(patch.productType, "internal tool"),
    title: label,
  };
  project.productSkeletonAgentOutput = nextSkeleton;
  project.productDomainSkeleton = nextDomain;
  project.runtimeSkeletonTruth = nextRuntime;
  project.context = {
    ...normalizeObject(project.context),
    productSkeletonAgentOutput: nextSkeleton,
    productDomainSkeleton: nextDomain,
    runtimeSkeletonTruth: nextRuntime,
  };
  project.state = {
    ...normalizeObject(project.state),
    productSkeletonAgentOutput: nextSkeleton,
    productDomainSkeleton: nextDomain,
    runtimeSkeletonTruth: nextRuntime,
    approvedProductDirection: {
      taskId: "BUILD-APPROVAL-001",
      label,
      directionId: patch.directionId,
      approvedAt: approvalFlow.decidedAt,
    },
  };
  return project;
}

function shouldUseBoundedBuildShellReply(buildAgentTurn = {}) {
  const turn = normalizeObject(buildAgentTurn);
  if (turn.taskId !== "BLD-AGT-001") {
    return false;
  }
  return Boolean(
    turn.requiresApproval === true
      || turn.status === "blocked-or-approval-required"
      || turn.owner === "verification-qa-agent"
      || turn.owner === "release-agent"
      || turn.intent === "product-truth-change"
      || turn.intent === "provider-connection-request",
  );
}

export class ProjectService {
  constructor({
    eventLogPath,
    auditLogPath = null,
    securityAuditLogPath = null,
    snapshotLogPath = null,
    reviewThreadLogPath = null,
    userActivityHistoryLogPath = null,
    platformObservabilityTransport = null,
    systemAuditLogStore = null,
    securityAuditLogStore = null,
    projectSnapshotStore = null,
    projectReviewThreadStore = null,
    userActivityHistoryStore = null,
    userAccountStore = null,
    projectWorkspaceStore = null,
    sessionContinuityStore = null,
    projectCreationEventHistoryStore = null,
  }) {
    this.eventBus = new EventBus({
      eventLog: new FileEventLog({
        filePath: eventLogPath,
      }),
    });
    this.orchestrator = new NexusOrchestrator({ eventBus: this.eventBus });
    this.runtime = new AgentRuntime({
      eventBus: this.eventBus,
      workers: [new DevAgentWorker(), new MarketingAgentWorker(), new QaAgentWorker()],
      killSwitchDecisionResolver: ({ projectId } = {}) => {
        if (!projectId) {
          return null;
        }
        const project = this.projects.get(projectId);
        return project?.context?.killSwitchDecision ?? project?.state?.killSwitchDecision ?? null;
      },
    });
    this.analyst = new AiProjectAnalyst();
    this.casinoConnector = new CasinoDiagnosticsConnector();
    this.gitConnector = new GitHostingConnector();
    this.runtimeConnector = new RuntimeSourcesConnector();
    this.notionConnector = new NotionConnector();
    this.onboarding = new OnboardingService();
    this.sourceAdapters = new SourceAdapterRegistry([new CasinoSourceAdapter(), new RuntimeSourceAdapter()]);
    this.projects = new Map();
    this.projectDrafts = new Map();
    this.projectCreationEvents = new Map();
    this.projectCreationMetric = null;
    this.projectPresenceRegistry = new Map();
    this.platformObservabilityTransport = platformObservabilityTransport ?? createPlatformObservabilityTransport();
    this.systemAuditLogStore = systemAuditLogStore ?? createSystemAuditLogStore({ filePath: auditLogPath ?? eventLogPath.replace(/events\\.ndjson$/, "system-audit.ndjson") });
    this.securityAuditLogStore = securityAuditLogStore ?? createSecurityAuditLogStore({ filePath: securityAuditLogPath ?? eventLogPath.replace(/events\\.ndjson$/, "security-audit.ndjson") });
    this.projectSnapshotStore = projectSnapshotStore
      ?? createPersistentProjectSnapshotStore({ filePath: snapshotLogPath ?? eventLogPath.replace(/events\\.ndjson$/, "project-snapshots.ndjson") });
    this.projectReviewThreadStore = projectReviewThreadStore
      ?? createProjectReviewThreadStore({ filePath: reviewThreadLogPath ?? eventLogPath.replace(/events\\.ndjson$/, "project-review-threads.ndjson") });
    this.userActivityHistoryStore = userActivityHistoryStore
      ?? createPersistentUserActivitySessionHistoryStore({
        filePath: userActivityHistoryLogPath ?? eventLogPath.replace(/events\\.ndjson$/, "user-activity-session-history.ndjson"),
      });
    this.userAccountStore = userAccountStore
      ?? createDurableUserAccountStore({
        filePath: eventLogPath.replace(/events\\.ndjson$/, "user-accounts.ndjson"),
      });
    this.users = new Map(this.userAccountStore.readAll().map((record) => [record.userIdentity.userId, record]));
    this.projectWorkspaceStore = projectWorkspaceStore
      ?? createDurableProjectWorkspaceStore({
        filePath: eventLogPath.replace(/events\\.ndjson$/, "project-workspaces.ndjson"),
      });
    this.projects = new Map(this.projectWorkspaceStore.readAll().map((record) => [record.projectId, record.project]));
    this.sessionContinuityStore = sessionContinuityStore
      ?? createDurableSessionContinuityStore({
        filePath: eventLogPath.replace(/events\\.ndjson$/, "session-continuity.ndjson"),
      });
    this.projectCreationEventHistoryStore = projectCreationEventHistoryStore
      ?? createDurableProjectCreationEventHistoryStore({
        filePath: eventLogPath.replace(/events\\.ndjson$/, "project-creation-events.ndjson"),
      });
    for (const [userId, authPayload] of this.users.entries()) {
      const continuityRecord = this.sessionContinuityStore.getByUserId(userId);
      if (!continuityRecord) {
        continue;
      }

      this.users.set(userId, {
        ...authPayload,
        sessionState: continuityRecord.sessionState ?? authPayload.sessionState ?? null,
        tokenBundle: continuityRecord.tokenBundle ?? authPayload.tokenBundle ?? null,
        postAuthRedirect: continuityRecord.postAuthRedirect ?? authPayload.postAuthRedirect ?? null,
        authenticationRouteDecision:
          continuityRecord.authenticationRouteDecision ?? authPayload.authenticationRouteDecision ?? null,
      });
    }
    this.projectCreationEvents = new Map(
      this.projectCreationEventHistoryStore.readAll().map((event) => [event.projectId, event]),
    );
    this.projectCreationMetric = {
      totalProjectsCreated: this.projectCreationEvents.size,
    };
    this.snapshotBackupTimers = new Map();
  }

  getProjectReviewThreadState(projectId, filters = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const threadState = project.context?.reviewThreadState ?? null;
    if (!threadState) {
      return null;
    }

    const resourceType = filters.resourceType ?? null;
    const status = filters.status ?? null;
    const workspaceArea = filters.workspaceArea ?? null;
    const filteredThreads = (Array.isArray(threadState.threads) ? threadState.threads : [])
      .filter((thread) => (resourceType ? thread.contextTarget?.resourceType === resourceType : true))
      .filter((thread) => (status ? thread.status === status : true))
      .filter((thread) => (workspaceArea ? thread.contextTarget?.workspaceArea === workspaceArea : true));
    const openThreads = filteredThreads.filter((thread) => !["resolved", "closed", "merged"].includes(thread.status)).length;

    return {
      ...threadState,
      threads: filteredThreads,
      summary: {
        ...(threadState.summary ?? {}),
        totalThreads: filteredThreads.length,
        openThreads,
        filtered: Boolean(resourceType || status || workspaceArea),
      },
    };
  }

  upsertProjectReviewThread({ projectId, threadInput } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const input = threadInput && typeof threadInput === "object" ? threadInput : {};
    const timestamp = new Date().toISOString();
    const actor = input.actor && typeof input.actor === "object" ? input.actor : {};
    const initialBody = input.body ?? input.message ?? null;
    const existingThread = input.threadId ? this.projectReviewThreadStore.getByThreadId(input.threadId) : null;
    const messageId = input.messageId ?? `review-thread-message:${projectId}:${Date.now()}`;
    const nextThreadId = existingThread?.threadId ?? input.threadId ?? `review-thread:${projectId}:${Date.now()}`;
    const nextMessage =
      initialBody
        ? {
            messageId,
            authorId: actor.actorId ?? actor.userId ?? input.authorId ?? "local-operator",
            authorName: actor.displayName ?? input.authorName ?? "Local operator",
            body: initialBody,
            mentions: Array.isArray(input.mentions) ? input.mentions : [],
            status: input.messageStatus ?? input.status ?? existingThread?.status ?? "open",
            createdAt: timestamp,
          }
        : null;

    const record = existingThread
      ? (nextMessage
          ? this.projectReviewThreadStore.appendMessage({
              threadId: existingThread.threadId,
              projectId,
              message: nextMessage,
            })
          : this.projectReviewThreadStore.upsert({
              ...existingThread,
              status: input.status ?? existingThread.status ?? "open",
              updatedAt: timestamp,
            }))
      : this.projectReviewThreadStore.upsert({
          threadId: nextThreadId,
          projectId,
          threadType: input.threadType ?? "comment-thread",
          title: input.title ?? "Project discussion",
          contextTarget: {
            workspaceArea: input.contextTarget?.workspaceArea ?? "developer-workspace",
            resourceType: input.contextTarget?.resourceType ?? "comment",
            resourceId: input.contextTarget?.resourceId ?? null,
            approvalRecordId: input.contextTarget?.approvalRecordId ?? null,
            filePath: input.contextTarget?.filePath ?? null,
            pullRequestId: input.contextTarget?.pullRequestId ?? null,
            executionRequestId: input.contextTarget?.executionRequestId ?? null,
            diffHeadline: input.contextTarget?.diffHeadline ?? null,
          },
          messages: nextMessage ? [nextMessage] : [],
          participants: nextMessage
            ? [
                {
                  participantId: nextMessage.authorId,
                  displayName: nextMessage.authorName,
                },
              ]
            : [],
          status: input.status ?? nextMessage?.status ?? "open",
          source: input.source ?? "project-review-thread-api",
          createdAt: timestamp,
          updatedAt: timestamp,
        });

    if (!record) {
      return null;
    }

    project.manualContext = {
      ...(project.manualContext ?? {}),
      collaborationEvent: {
        eventId: `review-thread:${record.threadId}:${Date.now()}`,
        eventType: "comment",
        actor: {
          actorId: nextMessage?.authorId ?? actor.actorId ?? "local-operator",
          displayName: nextMessage?.authorName ?? actor.displayName ?? "Local operator",
        },
        target: {
          projectId,
          workspaceArea: record.contextTarget?.workspaceArea ?? "developer-workspace",
          resourceId: record.contextTarget?.resourceId ?? record.threadId,
        },
        payload: {
          message: nextMessage?.body ?? input.title ?? "Review thread updated",
          reviewStatus: record.status ?? "open",
          mentions: nextMessage?.mentions ?? [],
        },
      },
    };

    this.rebuildContext(projectId);
    return {
      project: this.serializeProject(project),
      reviewThreadState: this.getProjectReviewThreadState(projectId),
      reviewThreadRecord: record,
    };
  }

  findUserRecord(userInput = {}) {
    const profile = userInput && typeof userInput === "object" ? userInput : {};

    return [...this.users.values()].find((item) => item.userIdentity?.email === profile.email)
      ?? [...this.users.values()].find((item) => item.userIdentity?.userId === profile.userId)
      ?? null;
  }

  persistUserAuthPayload(authPayload) {
    const persistedRecord = this.userAccountStore.upsert(authPayload);
    if (!persistedRecord) {
      return null;
    }

    this.sessionContinuityStore.upsert({
      userId: persistedRecord.userIdentity.userId,
      sessionState: persistedRecord.sessionState ?? null,
      tokenBundle: persistedRecord.tokenBundle ?? null,
      postAuthRedirect: persistedRecord.postAuthRedirect ?? null,
      authenticationRouteDecision: persistedRecord.authenticationRouteDecision ?? null,
    });

    this.users.set(persistedRecord.userIdentity.userId, persistedRecord);
    return persistedRecord;
  }

  buildAccountSettingsSurface(userId) {
    const authPayload = this.getUserAuthPayload(userId);
    if (!authPayload) {
      return null;
    }

    const accountBoundary = buildFirstReleaseAccountBoundary({ authPayload });
    return {
      settingsProfileSurface: {
        settingsProfileSurfaceId: `settings-profile:${authPayload.userIdentity?.userId ?? userId}`,
        status: "ready",
        routeKey: "settings",
        actorProfile: {
          userId: authPayload.userIdentity?.userId ?? userId,
          displayName: authPayload.userIdentity?.displayName ?? null,
          email: authPayload.userIdentity?.email ?? null,
          role: authPayload.membershipRecord?.roleAssignment?.role ?? authPayload.membershipRecord?.role ?? "owner",
        },
        workspaceSettings: authPayload.workspaceSettings ?? {},
        notificationPreferences: authPayload.notificationPreferences ?? {},
        securitySettings: {
          mfaDecision: authPayload.ownerMfaDecision?.decision ?? "unknown",
          trustLevel: authPayload.userIdentity?.userId ? "known-user" : "anonymous",
        },
        accountBoundary,
        summary: {
          canEditProfile: true,
          hasSettingsRoute: true,
        },
      },
    };
  }

  applyAccountAction({ userId = null, actionType = null, payload = null, actorUserId = null } = {}) {
    const existing = this.getUserAuthPayload(userId);
    if (!existing) {
      return null;
    }

    const result = applyFirstReleaseAccountAction({
      authPayload: existing,
      actionType,
      payload,
      actorUserId: actorUserId ?? userId,
    });
    const persistedAuthPayload = this.persistUserAuthPayload(result.authPayload);
    return {
      ...result,
      authPayload: persistedAuthPayload ?? result.authPayload,
      settingsProfileSurface: this.buildAccountSettingsSurface(userId)?.settingsProfileSurface ?? null,
    };
  }

  persistProjectRecord(project) {
    const persistedRecord = this.projectWorkspaceStore.upsert(project);
    if (!persistedRecord) {
      return null;
    }

    this.projects.set(persistedRecord.projectId, persistedRecord.project);
    return persistedRecord.project;
  }

  findProjectRecordByWorkspaceId(workspaceId) {
    const normalizedWorkspaceId = typeof workspaceId === "string" && workspaceId.trim() ? workspaceId.trim() : null;
    if (!normalizedWorkspaceId) {
      return null;
    }

    return [...this.projects.values()].find((project) => {
      const projectWorkspaceId =
        project.context?.workspaceModel?.workspaceId
        ?? project.state?.workspaceModel?.workspaceId
        ?? null;
      return projectWorkspaceId === normalizedWorkspaceId;
    }) ?? null;
  }

  getProjectByWorkspaceId(workspaceId) {
    const project = this.findProjectRecordByWorkspaceId(workspaceId);
    return project ? this.serializeProject(project) : null;
  }

  createDefaultAgents() {
    return [
      {
        id: "dev-agent",
        name: "סוכן Backend / DevOps",
        status: "idle",
        capabilities: ["devops", "backend", "security", "payments"],
        costPerRun: 0.24,
      },
      {
        id: "marketing-agent",
        name: "סוכן שיווק",
        status: "idle",
        capabilities: ["frontend", "copywriting", "marketing", "analytics"],
        costPerRun: 0.12,
      },
      {
        id: "qa-agent",
        name: "סוכן QA",
        status: "idle",
        capabilities: ["qa"],
        costPerRun: 0.08,
      },
    ];
  }

  createProject({
    id,
    name,
    goal,
    path,
    stack,
    state,
    agents,
    approvals,
    approvalRecords,
    gitSource,
    runtimeSource,
    notionSource,
    source,
    userId,
    onboardingSession,
  } = {}) {
    if (!id || !name || !goal) {
      return null;
    }

    const ownerUserId = normalizeString(userId, normalizeString(onboardingSession?.userId, null));
    const authPayload = ownerUserId ? this.getUserAuthPayload(ownerUserId) : null;
    const baseWorkspaceModel = ownerUserId
      ? (
          authPayload?.workspaceModel
          ?? defineWorkspaceAndMembershipModel({
            userIdentity: {
              userId: ownerUserId,
              displayName: ownerUserId,
            },
            workspaceMetadata: {
              workspaceId: `workspace-${ownerUserId}`,
              ownerUserId,
            },
          }).workspaceModel
        )
      : null;
    const { workspaceModel, teamMembershipBoundary } = baseWorkspaceModel
      ? buildProjectTeamBoundary({
          project: { userId: ownerUserId },
          workspaceModel: baseWorkspaceModel,
        })
      : { workspaceModel: null, teamMembershipBoundary: null };
    const normalizedState = state ?? {
      businessGoal: goal,
      product: {
        hasAuth: false,
        hasStagingEnvironment: false,
        hasLandingPage: false,
        hasPaymentIntegration: false,
      },
      analytics: {
        hasBaselineCampaign: false,
      },
      knowledge: {
        knownGaps: [],
      },
      stack: {},
    };
    const stateWithOwnership = workspaceModel
      ? {
          ...normalizedState,
          workspaceModel: {
            ...(normalizedState.workspaceModel ?? {}),
            ...workspaceModel,
            ownerUserId,
          },
          teamMembershipBoundary,
        }
      : normalizedState;
    const projectType = normalizeString(
      normalizedState.artifactExpectation?.projectType,
      normalizeString(normalizedState.projectType, normalizeString(normalizedState.domainClassification?.domain, "generic")),
    );
    const { projectPermissionSchema } = defineProjectPermissionSchema({
      workspaceModel,
      projectType,
    });
    const { roleCapabilityMatrix } = createProjectRoleCapabilityMatrix({
      projectPermissionSchema,
    });
    const { tenantIsolationSchema } = defineTenantIsolationSchema({
      workspaceModel,
    });
    const { projectAuthorizationDecision } = createActionLevelProjectAuthorizationResolver({
      actorType: "owner",
      projectAction: "view",
      roleCapabilityMatrix,
      policyDecision: normalizedState.policyDecision ?? null,
    });
    const { workspaceIsolationDecision } = createWorkspaceIsolationGuard({
      tenantIsolationSchema,
      requestContext: {
        workspaceId: workspaceModel?.workspaceId ?? null,
        resourceType: "project-state",
        resourceId: `project-state:${id}`,
        actionType: "view",
      },
    });
    const securityState = workspaceModel
      ? {
          ...stateWithOwnership,
          projectPermissionSchema,
          roleCapabilityMatrix,
          tenantIsolationSchema,
          projectAuthorizationDecision,
          workspaceIsolationDecision,
        }
      : stateWithOwnership;

    const project = {
      id,
      userId: ownerUserId,
      name,
      goal,
      status: "idle",
      path: path ?? `/projects/${id}`,
      stack: stack ?? "Unknown",
      state: securityState,
      agents: agents ?? this.createDefaultAgents(),
      approvals: approvals ?? [],
      manualContext: workspaceModel
        ? {
            workspaceMetadata: workspaceModel,
          }
        : null,
      normalizedSources: null,
      context: workspaceModel
        ? {
          workspaceModel: {
            ...workspaceModel,
            ownerUserId,
          },
          teamMembershipBoundary,
          projectPermissionSchema,
          roleCapabilityMatrix,
          tenantIsolationSchema,
            projectAuthorizationDecision,
            workspaceIsolationDecision,
          }
        : null,
      scan: null,
      analysis: null,
      externalSnapshot: null,
      gitSource: gitSource ?? null,
      gitSnapshot: null,
      runtimeSource: runtimeSource ?? null,
      runtimeSnapshot: null,
      notionSource: notionSource ?? null,
      notionSnapshot: null,
      source: source ?? null,
      onboardingSession: onboardingSession ?? null,
      artifactExpectation: normalizedState.artifactExpectation ?? null,
      generationIntent: normalizedState.generationIntent ?? null,
      productSkeletonAgentOutput: normalizedState.productSkeletonAgentOutput ?? null,
      visualProductSkeletonAgentOutput: normalizedState.visualProductSkeletonAgentOutput ?? null,
      runtimeSkeletonTruth: normalizedState.runtimeSkeletonTruth ?? null,
      productDomainSkeleton: normalizedState.productDomainSkeleton ?? null,
      productOwnedBackendSkeleton: normalizedState.productOwnedBackendSkeleton ?? null,
      runtimeLearningEvents: normalizedState.runtimeLearningEvents ?? [],
      runtimeLearningDecisionHints: normalizedState.runtimeLearningDecisionHints ?? null,
      shareDemoAgent: normalizedState.shareDemoAgent ?? null,
      growthAgent: normalizedState.growthAgent ?? null,
      growthMeasurementTruth: normalizedState.growthMeasurementTruth ?? null,
      seoActionPath: normalizedState.seoActionPath ?? null,
      semActionPath: normalizedState.semActionPath ?? null,
      emailActionPath: normalizedState.emailActionPath ?? null,
      landingActionPath: normalizedState.landingActionPath ?? null,
      landingBackendSync: normalizedState.landingBackendSync ?? null,
      socialCampaignExecutionAgent: normalizedState.socialCampaignExecutionAgent ?? null,
      cycle: null,
      runtimeResults: [],
      taskResults: [],
      linkedAccounts: [],
      approvalRecords: approvalRecords ?? [],
      snapshotSchedule: null,
      snapshotBackupWorker: null,
      snapshotJobState: null,
      snapshotWorkerRuntime: null,
      snapshotRetentionPolicy: null,
      snapshotRetentionDecision: null,
      snapshotPreChangeTriggerState: {},
      continuityPlan: null,
      disasterRecoveryChecklist: null,
      businessContinuityState: null,
      privacyRightsResult: null,
    };

    if (securityState?.fileIntakeBoundary?.taskId === "FILE-001") {
      project.projectIntake = securityState.intake ?? null;
      project.fileIntakeBoundary = securityState.fileIntakeBoundary;
      project.fileStorageRecord = securityState.fileStorageRecord ?? null;
      project.context = {
        ...(project.context ?? {}),
        intake: project.projectIntake,
        fileIntakeBoundary: project.fileIntakeBoundary,
        fileStorageRecord: project.fileStorageRecord,
      };
    }

    this.projects.set(id, project);
    return project;
  }

  createOnboardingSession({ userId, projectDraftId, initialInput }) {
    return this.onboarding.createSession({
      userId,
      projectDraftId,
      initialInput,
    });
  }

  createProjectDraft({ userInput, projectCreationInput } = {}) {
    const existing = this.findUserRecord(userInput);
    if (!existing) {
      return null;
    }

    const requestedDraftId = projectCreationInput?.projectDraftId ?? projectCreationInput?.draftId ?? null;
    const { projectDraft, projectDraftId } = createProjectDraftCreationService({
      userIdentity: existing.userIdentity,
      projectCreationInput,
      existingProjectDraft: requestedDraftId ? this.projectDrafts.get(requestedDraftId) ?? null : null,
    });
    const { projectCreationEvent } = defineProjectCreationEventSchema({
      userId: existing.userIdentity?.userId ?? null,
      projectId: projectDraftId,
      creationSource: projectDraft.creationSource ?? null,
    });
    const { projectCreationMetric } = createProjectCreationTracker({
      projectCreationEvent,
      previousProjectCreationMetric: this.projectCreationMetric,
    });
    const { projectCreationExperience } = createProjectCreationExperienceModel({
      workspaceModel: existing.workspaceModel,
      postLoginDestination: "project-creation",
    });
    const { projectCreationRedirect } = createPostProjectCreationRedirectResolver({
      projectDraft,
      projectCreationExperience,
    });

    this.projectDrafts.set(projectDraftId, projectDraft);
    const persistedProjectCreationEvent = this.projectCreationEventHistoryStore.append(projectCreationEvent) ?? projectCreationEvent;
    this.projectCreationEvents.set(projectDraftId, persistedProjectCreationEvent);
    this.projectCreationMetric = projectCreationMetric;
    const projectCreationEvents = this.listProjectCreationEvents();
    const projectCreationSummary = this.buildProjectCreationSummary(projectCreationEvents);

    return {
      projectDraft,
      projectDraftId,
      projectCreationEvent: persistedProjectCreationEvent,
      projectCreationEvents,
      projectCreationMetric,
      projectCreationSummary,
      projectCreationExperience,
      projectCreationRedirect,
    };
  }

  createProjectIntake({ projectName, visionText, uploadedFiles, externalLinks }) {
    return this.onboarding.createProjectIntake({
      projectName,
      visionText,
      uploadedFiles,
      externalLinks,
    });
  }

  resolveOnboardingStep({ sessionId, projectIntake }) {
    const onboardingSession = this.getOnboardingSession(sessionId);
    if (!onboardingSession) {
      return null;
    }

    return this.onboarding.resolveStep({
      onboardingSession,
      projectIntake,
    });
  }

  handleOnboardingCommand({ sessionId, actionType, payload }) {
    return this.onboarding.handleCommand({
      sessionId,
      actionType,
      payload,
    });
  }

  resolveOnboardingAction(actionType, payload) {
    return this.onboarding.resolveAction(actionType, payload);
  }

  updateOnboardingIntake({ sessionId, projectName, visionText, uploadedFiles, externalLinks }) {
    return this.onboarding.updateIntake({
      sessionId,
      projectName,
      visionText,
      uploadedFiles,
      externalLinks,
    });
  }

  uploadOnboardingFiles({ sessionId, uploadedFiles }) {
    return this.onboarding.uploadFiles({
      sessionId,
      uploadedFiles,
    });
  }

  getOnboardingCurrentStep(sessionId) {
    return this.onboarding.getCurrentStep(sessionId);
  }

  getOnboardingConversationState(sessionId) {
    return this.onboarding.getConversationState(sessionId);
  }

  async submitOnboardingConversationTurn({ sessionId, answer, qaFaultMode, clientMessageId = null }) {
    return await this.onboarding.submitConversationTurn({
      sessionId,
      answer,
      qaFaultMode,
      clientMessageId,
    });
  }

  async primeOnboardingDiscoveryAgentResponse({ sessionId, qaFaultMode }) {
    return await this.onboarding.primeDiscoveryAgentResponse({
      sessionId,
      qaFaultMode,
    });
  }

  async generateOnboardingProductSkeleton({ sessionId, qaFaultMode = null }) {
    return await this.onboarding.generateProductSkeletonFromDiscovery({
      sessionId,
      qaFaultMode,
    });
  }

  async generateOnboardingVisualProductSkeleton({ sessionId, qaFaultMode = null }) {
    return await this.onboarding.generateVisualProductSkeletonFromProductSkeleton({
      sessionId,
      qaFaultMode,
    });
  }

  async streamOnboardingConversationTurn({ sessionId, answer, qaFaultMode, clientMessageId = null, onEvent }) {
    return await this.onboarding.streamConversationTurn({
      sessionId,
      answer,
      qaFaultMode,
      clientMessageId,
      onEvent,
    });
  }

  async submitProjectCompanionTurn({
    projectId,
    sessionId = null,
    message = "",
    currentSurface = "workspace",
    qaFaultMode = null,
  }) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const normalizedMessage = normalizeString(message, "");
    if (!normalizedMessage) {
      return null;
    }

    let correctionReply = "";
    let onboardingSession = sessionId ? this.onboarding.getSession(sessionId) : null;
    let conversationSummary = sessionId
      ? this.onboarding.getConversationState(sessionId)
      : null;
    if (sessionId) {
      const correctionResult = await this.onboarding.applyPostOnboardingCorrection({
        sessionId,
        message: normalizedMessage,
        currentSurface,
        qaFaultMode,
      });
      if (correctionResult) {
        correctionReply = normalizeString(correctionResult.correction?.replyText, "");
        onboardingSession = correctionResult.updatedSession;
        conversationSummary = correctionResult.conversationState;
        project.onboardingSession = correctionResult.updatedSession;
        this.rebuildContext(projectId);
      }
    }

    const serializedProject = this.serializeProject(this.projects.get(projectId));
    const truth = resolveProjectCompanionTruth({
      project: serializedProject,
      session: {
        ...normalizeObject(onboardingSession),
        conversationSummary,
      },
    });
    const learningInstructions = createBuildAgentLearningInstructions({
      project: serializedProject,
      message: normalizedMessage,
      currentSurface,
    });
    const buildAgentTurn = createBuildAgentTurnDecision({
      project: serializedProject,
      message: normalizedMessage,
      learningInstructions,
    });
    let downstreamAction = resolveBuildAgentDownstreamAction({
      buildAgentTurn,
      message: normalizedMessage,
    });
    if (downstreamAction.shouldApply !== true && downstreamAction.status === "routed-only") {
      // BUILD-SPEECH-TRUTH-001: arbitrary free-text requests must resolve to a real
      // mutation or to an explicit truthful not-applied state, never fall through
      // to a confident provider success reply.
      const freeTextAction = resolveFreeTextMutationOperation({
        message: normalizedMessage,
        buildAgentTurn,
      });
      if (freeTextAction) {
        downstreamAction = freeTextAction;
      }
    }
    let mutationChangeDecision = createMutationChangeAgentDecision({
      project: serializedProject,
      message: normalizedMessage,
      buildAgentTurn,
      downstreamAction,
      requestedBy: "user",
    });
    let buildAgentDownstreamResult = null;
    if (downstreamAction.shouldApply === true) {
      if (downstreamAction.actionKind === "visual-build") {
        const visualResult = this.applyVisualBuildChange({
          projectId,
          requestText: normalizedMessage,
          operationId: downstreamAction.operationId,
          payload: downstreamAction.payload,
          requestedBy: downstreamAction.owner ?? "visual-build-agent",
        });
        buildAgentDownstreamResult = {
          taskId: "BLD-AGT-001",
          owner: downstreamAction.owner ?? "visual-build-agent",
          status: visualResult?.visualBuildTruth?.status === "applied" ? "applied" : "failed-safely",
          mutationId: normalizeString(visualResult?.visualBuildTruth?.visualBuildId, ""),
          operationId: normalizeString(visualResult?.visualBuildTruth?.lastOperationId, downstreamAction.operationId),
          visibleSummary: downstreamAction.visibleSummary,
          error: "",
        };
      } else {
        const mutationResult = this.applyBuildMutation({
          projectId,
          requestText: normalizedMessage,
          operationId: downstreamAction.operationId,
          payload: downstreamAction.payload,
          requestedBy: downstreamAction.owner ?? "build-agent",
        });
        buildAgentDownstreamResult = {
          taskId: "BLD-AGT-001",
          owner: downstreamAction.owner ?? "mutation-change-agent",
          status: mutationResult?.mutation?.ok === true ? "applied" : "failed-safely",
          mutationId: normalizeString(mutationResult?.mutation?.intent?.mutationId, ""),
          operationId: normalizeString(mutationResult?.mutation?.intent?.operationId, downstreamAction.operationId),
          visibleSummary: downstreamAction.visibleSummary,
          error: normalizeString(mutationResult?.mutation?.error, normalizeString(mutationResult?.project?.buildMutationTruth?.lastError, "")),
        };
      }
      if (
        buildAgentDownstreamResult.status === "applied"
        && normalizeString(buildAgentDownstreamResult.mutationId, "")
      ) {
        // BUILD-SPEECH-TRUTH-001 invariant: applied success requires a real mutation id
        // and changed downstream truth before speech may claim a change.
        buildAgentTurn.status = "applied";
        buildAgentTurn.mayClaimChanged = true;
        buildAgentTurn.speechBoundary = "reply-may-describe-applied-change";
        buildAgentTurn.reason = downstreamAction.visibleSummary;
      } else if (buildAgentDownstreamResult.status === "applied") {
        buildAgentDownstreamResult.status = "failed-safely";
        buildAgentDownstreamResult.error = normalizeString(
          buildAgentDownstreamResult.error,
          "missing-mutation-id-for-applied-claim",
        );
      }
    }
    mutationChangeDecision = finalizeMutationChangeAgentDecision({
      decision: mutationChangeDecision,
      downstreamResult: buildAgentDownstreamResult,
    });
    const mutableProject = this.projects.get(projectId);
    if (mutableProject) {
      const mutationChangeHistory = appendMutationChangeHistory(mutableProject, mutationChangeDecision);
      const canonicalMutationFlow = buildCanonicalMutationFlowShell({
        project: mutableProject,
        mutationChangeDecision,
        mutationChangeHistory,
        buildMutationTruth: mutableProject.buildMutationTruth ?? mutableProject.context?.buildMutationTruth ?? mutableProject.state?.buildMutationTruth,
        buildMutationHistory: mutableProject.buildMutationHistory ?? mutableProject.context?.buildMutationHistory ?? mutableProject.state?.buildMutationHistory,
      });
      const buildApprovalFlow = buildBuildApprovalFlow({
        project: mutableProject,
        mutationChangeDecision,
      });
      const historyContinuityAgent = buildHistoryContinuityAgentEnvelope({
        project: {
          ...mutableProject,
          mutationChangeDecision,
          mutationChangeHistory,
          canonicalMutationFlow,
          buildApprovalFlow,
        },
      });
      mutableProject.buildAgentTurnState = buildAgentTurn;
      mutableProject.mutationChangeDecision = mutationChangeDecision;
      mutableProject.mutationChangeHistory = mutationChangeHistory;
      mutableProject.canonicalMutationFlow = canonicalMutationFlow;
      mutableProject.buildApprovalFlow = buildApprovalFlow;
      mutableProject.historyContinuityAgent = historyContinuityAgent;
      mutableProject.context = {
        ...normalizeObject(mutableProject.context),
        buildAgentTurnState: buildAgentTurn,
        mutationChangeDecision,
        mutationChangeHistory,
        canonicalMutationFlow,
        buildApprovalFlow,
        historyContinuityAgent,
      };
      mutableProject.state = {
        ...normalizeObject(mutableProject.state),
        buildAgentTurnState: buildAgentTurn,
        mutationChangeDecision,
        mutationChangeHistory,
        canonicalMutationFlow,
        buildApprovalFlow,
        historyContinuityAgent,
      };
      this.persistProjectRecord(mutableProject);
    }

    const providerRuntime = onboardingSession?.providerRuntime ?? {};
    let providerResult = null;
    if (
      !correctionReply
      && buildAgentDownstreamResult?.status !== "applied"
      && !shouldUseBoundedBuildShellReply(buildAgentTurn)
    ) {
      providerResult = await this.onboarding.providerClient.generateCompanionReply({
        providerId: normalizeString(providerRuntime.selectedProviderId, "openai"),
        modelFamilyId: normalizeString(providerRuntime.selectedModelFamilyId, "balanced"),
        intelligenceLevel: normalizeString(providerRuntime.selectedIntelligenceLevel, "medium"),
        projectName: truth.projectName,
        projectGoal: truth.projectGoal,
        projectType: truth.projectType,
        currentSurface,
        understoodItems: truth.understoodItems,
        missingItems: truth.missingItems,
        transcript: [
          ...truth.transcript,
          {
            speaker: "user",
            text: normalizedMessage,
          },
        ],
        userMessage: normalizedMessage,
        learningInstructions,
        buildAgentTurn,
        mutationChangeDecision,
        qaFaultMode,
      });
    }

    const candidateReply = correctionReply
      || (providerResult?.status === "completed"
        ? providerResult.reply
        : buildProjectCompanionShellReply({
          userMessage: normalizedMessage,
          truth,
          learningInstructions,
          buildAgentTurn,
          buildAgentDownstreamResult,
        }));
    // BUILD-SPEECH-TRUTH-001: provider/agent speech is not truth. Every visible Build
    // reply is forced through the speech boundary gate so it cannot claim an
    // un-applied change. Correction replies are backed by correction truth and exempt.
    const buildSpeechTruth = correctionReply
      ? null
      : enforceBuildSpeechBoundary({
        candidateReply,
        candidateSource: providerResult?.status === "completed" ? "provider" : "shell",
        message: normalizedMessage,
        buildAgentTurn,
        downstreamAction,
        downstreamResult: buildAgentDownstreamResult,
        mutationChangeDecision,
      });
    const reply = buildSpeechTruth ? buildSpeechTruth.reply : candidateReply;
    const projectAfterTurn = this.projects.get(projectId);
    if (projectAfterTurn && buildSpeechTruth) {
      const buildSpeechHistory = appendBuildSpeechHistory(projectAfterTurn, buildSpeechTruth);
      projectAfterTurn.buildSpeechTruth = buildSpeechTruth;
      projectAfterTurn.buildSpeechHistory = buildSpeechHistory;
      projectAfterTurn.context = {
        ...normalizeObject(projectAfterTurn.context),
        buildSpeechTruth,
        buildSpeechHistory,
      };
      projectAfterTurn.state = {
        ...normalizeObject(projectAfterTurn.state),
        buildSpeechTruth,
        buildSpeechHistory,
      };
    }
    if (projectAfterTurn) {
      const existingConversation = normalizeObject(
        projectAfterTurn.companionConversation
        ?? projectAfterTurn.context?.companionConversation
        ?? projectAfterTurn.state?.companionConversation,
      );
      const transcript = [
        ...normalizeArray(existingConversation.transcript),
        {
          id: `build-user:${Date.now()}`,
          speaker: "user",
          text: normalizedMessage,
          time: "",
        },
        {
          id: `build-ai:${Date.now() + 1}`,
          speaker: "ai",
          text: reply,
          time: "",
        },
      ].filter((entry) => normalizeString(entry.text, ""));
      const companionConversation = {
        ...existingConversation,
        projectName: truth.projectName,
        understoodItems: truth.understoodItems,
        missingItems: truth.missingItems,
        pending: false,
        draftMessage: "",
        transcript,
        buildAgentTurn,
        mutationChangeDecision,
        buildSpeechTruth,
        lastBuildAgentReply: reply,
      };
      projectAfterTurn.companionConversation = companionConversation;
      projectAfterTurn.context = {
        ...normalizeObject(projectAfterTurn.context),
        companionConversation,
      };
      projectAfterTurn.state = {
        ...normalizeObject(projectAfterTurn.state),
        companionConversation,
      };
      this.persistProjectRecord(projectAfterTurn);
    }

    const latestSerializedProject = this.serializeProject(this.projects.get(projectId));

    return {
      projectId,
      sessionId: normalizeString(sessionId, null),
      currentSurface,
      providerExecution: providerResult,
      reply,
      learningInstructions,
      buildAgentTurn,
      mutationChangeDecision,
      buildAgentDownstreamResult,
      buildSpeechTruth,
      truth: {
        projectName: truth.projectName,
        projectGoal: truth.projectGoal,
        projectType: truth.projectType,
        understoodItems: truth.understoodItems,
        missingItems: truth.missingItems,
      },
      conversationState: conversationSummary,
      project: latestSerializedProject,
    };
  }

  async applyOnboardingCompanionCorrection({
    sessionId,
    message = "",
    currentSurface = "understanding",
    projectId = null,
    qaFaultMode = null,
  } = {}) {
    const normalizedMessage = normalizeString(message, "");
    if (!sessionId || !normalizedMessage) {
      return null;
    }

    const correctionResult = await this.onboarding.applyPostOnboardingCorrection({
      sessionId,
      message: normalizedMessage,
      currentSurface,
      qaFaultMode,
    });
    if (!correctionResult) {
      return null;
    }

    let serializedProject = null;
    if (projectId && this.projects.has(projectId)) {
      const project = this.projects.get(projectId);
      project.onboardingSession = correctionResult.updatedSession;
      this.rebuildContext(projectId);
      serializedProject = this.serializeProject(this.projects.get(projectId));
    }

    const truth = resolveProjectCompanionTruth({
      project: serializedProject,
      session: {
        ...normalizeObject(correctionResult.updatedSession),
        conversationSummary: correctionResult.conversationState,
      },
    });

    return {
      sessionId,
      currentSurface,
      reply: normalizeString(correctionResult.correction?.replyText, ""),
      truth: {
        projectName: truth.projectName,
        projectGoal: truth.projectGoal,
        projectType: truth.projectType,
        understoodItems: truth.understoodItems,
        missingItems: truth.missingItems,
      },
      conversationState: correctionResult.conversationState,
      project: serializedProject,
    };
  }

  restartOnboardingConversation(sessionId) {
    return this.onboarding.restartConversation(sessionId);
  }

  finishOnboardingSession(sessionId) {
    const session = this.onboarding.getSession(sessionId);
    if (!session) {
      return null;
    }

    const projectDraft = session.projectDraft ?? {};
    const projectIntake = session.projectIntake ?? null;
    const { onboardingCompletionDecision } = createOnboardingCompletionEvaluator({
      projectIntake,
      onboardingSession: session,
    });
    const { onboardingStateHandoff } = createOnboardingToStateHandoffContract({
      projectDraft,
      projectIntake,
      onboardingCompletionDecision,
      onboardingSession: session,
    });
    const finished = this.onboarding.finishSession(sessionId, {
      onboardingCompletionDecision,
    });
    if (!finished) {
      return null;
    }
    const finishedSession = finished.updatedSession;
    const finishedConversation = normalizeObject(finishedSession.conversation);
    const finishedAgentDecision = normalizeObject(finishedConversation.lastAgentDecision);
    const finishedSkeletonReady = normalizeObject(finishedAgentDecision.skeletonReady);
    const agentApprovedBuildHandoff = finishedAgentDecision.nextMove === "advance-to-skeleton"
      && finishedSkeletonReady.ready === true;

    if (onboardingStateHandoff.summary?.canBuildProjectState !== true && agentApprovedBuildHandoff !== true) {
      return {
        ...finished,
        blocked: true,
        onboardingCompletionDecision,
        onboardingStateHandoff,
        error: "Onboarding is not ready to build project state",
      };
    }

    const projectId = resolveFinishedOnboardingProjectId({
      projectDraft,
      finishedSession,
    });
    const projectName = projectDraft.name ?? "Project Draft";
    const projectGoal = projectDraft.goal ?? finishedSession.projectIntake?.visionText ?? "";
    const bootstrapped = createProjectStateBootstrapService({
      stateBootstrapPayload: {
        identity: {
          projectId,
        },
        goals: {
          businessGoal: projectGoal,
        },
        constraints: {},
        readiness: {
          canBootstrap: true,
        },
        ownership: {
          ownerUserId: finishedSession.userId ?? null,
          workspaceId: null,
          role: "owner",
        },
        bootstrapMetadata: {},
        approvals: finishedSession.approvals ?? [],
        missingClarifications: [],
        intake: finishedSession.projectIntake ?? null,
        draftMetadata: {
          draftId: projectId,
          name: projectName,
        },
        summary: {
          canBootstrap: true,
        },
      },
      projectOwnershipBinding: {
        projectId,
        ownerUserId: finishedSession.userId ?? null,
        workspaceId: null,
        role: "owner",
      },
    });

    if (!this.projects.has(projectId)) {
      this.createProject({
        id: projectId,
        name: projectName,
        goal: projectGoal,
        path: `/projects/${projectId}`,
        stack: "Unknown",
        state: bootstrapped.initialProjectState ?? projectDraft.state ?? null,
        projectDraft,
        projectCreationEvent: this.projectCreationEvents.get(projectId) ?? null,
        projectCreationMetric: this.projectCreationMetric ?? null,
        userId: finishedSession.userId ?? null,
        onboardingSession: finishedSession,
      });
    } else {
      const existingProject = this.projects.get(projectId);
      const reboundWorkspaceId = existingProject.context?.workspaceModel?.workspaceId
        ?? existingProject.state?.workspaceModel?.workspaceId
        ?? `workspace-${finishedSession.userId ?? "unknown"}`;
      const reboundWorkspaceModel = {
        ...(existingProject.context?.workspaceModel ?? existingProject.state?.workspaceModel ?? {}),
        workspaceId: reboundWorkspaceId,
        ownerUserId: finishedSession.userId ?? null,
        roles: ["owner"],
      };
      existingProject.onboardingSession = finishedSession;
      existingProject.projectDraft = projectDraft;
      existingProject.projectCreationEvent =
        this.projectCreationEvents.get(projectId)
        ?? existingProject.projectCreationEvent
        ?? null;
      existingProject.projectCreationMetric = this.projectCreationMetric ?? existingProject.projectCreationMetric ?? null;
      existingProject.userId = finishedSession.userId ?? existingProject.userId ?? null;
      existingProject.name = projectName;
      existingProject.goal = projectGoal;
      existingProject.state = bootstrapped.initialProjectState ?? projectDraft.state ?? existingProject.state;
      existingProject.state = {
        ...(existingProject.state ?? {}),
        workspaceModel: reboundWorkspaceModel,
      };
      existingProject.context = {
        ...(existingProject.context ?? {}),
        workspaceModel: reboundWorkspaceModel,
      };
    }

    const project = this.projects.get(projectId);
    if (project) {
      project.userId = finishedSession.userId ?? project.userId ?? null;
      const reboundWorkspaceId = project.context?.workspaceModel?.workspaceId
        ?? project.state?.workspaceModel?.workspaceId
        ?? `workspace-${finishedSession.userId ?? "unknown"}`;
      const reboundWorkspaceModel = {
        ...(project.context?.workspaceModel ?? project.state?.workspaceModel ?? {}),
        workspaceId: reboundWorkspaceId,
        ownerUserId: finishedSession.userId ?? null,
        roles: ["owner"],
      };
      project.state = {
        ...(project.state ?? {}),
        workspaceModel: reboundWorkspaceModel,
      };
      project.context = {
        ...(project.context ?? {}),
        workspaceModel: reboundWorkspaceModel,
      };
    }
    const productSkeletonAgentOutput = normalizeObject(finishedSession.productSkeletonAgentOutput);
    const visualProductSkeletonAgentOutput = normalizeObject(finishedSession.visualProductSkeletonAgentOutput);
    const skeletonHandoffOutputs = {
      ...(Object.keys(productSkeletonAgentOutput).length > 0 ? { productSkeletonAgentOutput } : {}),
      ...(Object.keys(visualProductSkeletonAgentOutput).length > 0 ? { visualProductSkeletonAgentOutput } : {}),
    };
    project.onboardingStateHandoff = {
      ...onboardingStateHandoff,
      ...skeletonHandoffOutputs,
    };
    project.context = {
      ...(project.context ?? {}),
      onboardingStateHandoff: project.onboardingStateHandoff,
      ...skeletonHandoffOutputs,
    };
    Object.assign(project, skeletonHandoffOutputs);
    project.projectCreationEvent =
      this.projectCreationEvents.get(projectId)
      ?? project.projectCreationEvent
      ?? null;
    project.projectCreationMetric = this.projectCreationMetric ?? project.projectCreationMetric ?? null;
    const existingFileIntakeBoundary =
      projectIntake?.fileIntakeBoundary?.taskId === "FILE-001" ? projectIntake.fileIntakeBoundary : null;
    const fileIntakeBoundary = existingFileIntakeBoundary
      ? {
          ...existingFileIntakeBoundary,
          projectId,
          sessionId,
        }
      : createFirstReleaseFileIntakeBoundary({
          projectId,
          sessionId,
          uploadedFiles: projectIntake?.uploadedFiles ?? [],
          externalLinks: projectIntake?.externalLinks ?? [],
        });
    const { storageRecord: fileStorageRecord } = createFileAndArtifactStorageModule({
      storageRequest: {
        projectId,
        workspaceId: project.context?.workspaceModel?.workspaceId ?? project.state?.workspaceModel?.workspaceId ?? null,
        runId: sessionId,
        storageScope: "intake",
        storageDriver: "project-intake-local-durable-state",
        attachments: fileIntakeBoundary.acceptedFiles,
        retentionPolicy: fileIntakeBoundary.policy?.retentionPolicy ?? "project-lifecycle",
      },
    });
    project.projectIntake = {
      ...(projectIntake ?? {}),
      uploadedFiles: fileIntakeBoundary.acceptedFiles,
      fileIntakeBoundary,
    };
    project.fileIntakeBoundary = fileIntakeBoundary;
    project.fileStorageRecord = fileStorageRecord;
    project.state = {
      ...(project.state ?? {}),
      intake: project.projectIntake,
      fileIntakeBoundary,
      fileStorageRecord,
    };
    project.context = {
      ...(project.context ?? {}),
      intake: project.projectIntake,
      fileIntakeBoundary,
      fileStorageRecord,
    };
    project.intakeScanHandoff = createUploadedIntakeToScannerHandoff({
      projectId,
      projectIntake: project.projectIntake,
      connectedSources: finishedSession.connectedSources,
      gitSnapshot: project.gitSnapshot,
      notionSnapshot: project.notionSnapshot,
    });
    if (project.intakeScanHandoff?.scan) {
      this.applyScanToProject(project, project.intakeScanHandoff.scan, { persistPath: false });
    }
    this.rebuildContext(projectId);
    this.runCycle(projectId);

    return {
      ...finished,
      blocked: false,
      onboardingCompletionDecision,
      onboardingStateHandoff,
      project: this.serializeProject(project),
    };
  }

  getOnboardingSession(sessionId) {
    return this.onboarding.getSession(sessionId);
  }

  getOnboardingIntakeEnvelope(sessionId) {
    const onboardingSession = this.onboarding.getSession(sessionId);
    if (!onboardingSession) {
      return null;
    }

    const conversationState = this.onboarding.getConversationState(sessionId);
    const projectDraft = onboardingSession.projectDraft ?? null;
    const projectIntake = onboardingSession.projectIntake ?? null;
    const { onboardingCompletionDecision } = createOnboardingCompletionEvaluator({
      projectIntake,
      onboardingSession,
    });
    const { onboardingStateHandoff } = createOnboardingToStateHandoffContract({
      projectDraft,
      projectIntake,
      onboardingCompletionDecision,
      onboardingSession,
    });
    const artifactExpectation = onboardingStateHandoff?.artifactExpectation ?? null;
    const { adaptiveOnboardingAgentContract } = createAdaptiveOnboardingAgentContract({
      projectIntake,
      onboardingConversation: conversationState?.onboardingConversation ?? onboardingSession.conversation ?? null,
      onboardingCompletionDecision,
      onboardingStateHandoff,
      artifactExpectation,
    });

    return {
      sessionId: onboardingSession.sessionId,
      userId: onboardingSession.userId ?? null,
      projectDraftId: onboardingSession.projectDraftId ?? null,
      projectName: projectDraft?.name ?? projectIntake?.projectName ?? null,
      canonicalTruthOwner: "project-service",
      truthSource: "onboarding-session-and-handoff-contract",
      surfaceMode: "hidden-engine",
      engineRole: "bounded-intake-before-build",
      onboardingSession,
      projectDraft,
      projectIntake,
      currentStep: this.onboarding.getCurrentStep(sessionId),
      conversationState,
      onboardingCompletionDecision,
      onboardingStateHandoff,
      artifactExpectation,
      adaptiveOnboardingAgentContract,
      shellAnchors: {
        canStartBuild: onboardingStateHandoff?.summary?.canBuildProjectState === true,
        readinessLevel: onboardingCompletionDecision?.readinessLevel ?? null,
        handoffStatus: onboardingStateHandoff?.handoffStatus ?? null,
        projectType:
          onboardingStateHandoff?.projectIntake?.projectType
          ?? projectIntake?.projectType
          ?? artifactExpectation?.projectType
          ?? null,
        selectedProviderId:
          conversationState?.providerRuntime?.selectedProviderId
          ?? onboardingSession?.providerRuntime?.selectedProviderId
          ?? null,
      },
    };
  }

  submitProposalEdits({ projectId, userEditInput } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const normalizedInput = userEditInput && typeof userEditInput === "object" ? { ...userEditInput } : {};
    normalizedInput.previousHistory = project.context?.proposalEditHistory?.entries ?? [];
    project.context = {
      ...(project.context ?? {}),
      userEditInput: normalizedInput,
    };

    this.rebuildContext(projectId);
    return this.serializeProject(project);
  }

  submitPartialAcceptance({ projectId, approvalOutcome } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    project.context = {
      ...(project.context ?? {}),
      approvalOutcome: approvalOutcome && typeof approvalOutcome === "object" ? { ...approvalOutcome } : {},
    };

    this.rebuildContext(projectId);
    return this.serializeProject(project);
  }

  executeProjectRollback({ projectId } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const restoreDecision = project.context?.restoreDecision ?? null;
    const snapshotRecord = project.context?.snapshotRecord ?? null;
    const { rollbackExecutionResult } = createProjectRollbackExecutionModule({
      restoreDecision,
      snapshotRecord,
    });

    const restoredProjectState = rollbackExecutionResult?.restoredProjectState;
    const restoredExecutionGraph = rollbackExecutionResult?.restoredExecutionGraph;
    const restoredWorkspaceReference = rollbackExecutionResult?.restoredWorkspaceReference;

    if (rollbackExecutionResult.executed) {
      if (restoredProjectState && Object.keys(restoredProjectState).length > 0) {
        project.state = {
          ...(project.state ?? {}),
          ...restoredProjectState,
        };
      }

      if (restoredExecutionGraph && Object.keys(restoredExecutionGraph).length > 0) {
        project.cycle = {
          ...(project.cycle ?? {}),
          executionGraph: restoredExecutionGraph,
        };
      }

      if (restoredWorkspaceReference && typeof restoredWorkspaceReference === "object") {
        if (typeof restoredWorkspaceReference.workspacePath === "string" && restoredWorkspaceReference.workspacePath.length > 0) {
          project.path = restoredWorkspaceReference.workspacePath;
        }
        project.workspaceReference = {
          ...(project.workspaceReference ?? {}),
          ...restoredWorkspaceReference,
        };
      }
    }

    project.context = {
      ...(project.context ?? {}),
      rollbackExecutionResult,
      rollbackExecutionTriggeredAt: new Date().toISOString(),
    };

    return this.serializeProject(project);
  }

  executeHistoryRestore({ projectId, checkpointId = "" } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }
    const historyContinuityAgent = executeHistoryRestoreDecision({
      project,
      checkpointId,
    });
    const restoreSnapshot = normalizeObject(historyContinuityAgent.restoreDecision?.productSnapshot);
    const restoreExecution = normalizeObject(historyContinuityAgent.restoreExecution);

    if (restoreExecution.executed === true) {
      project.name = normalizeString(restoreSnapshot.projectName, project.name);
      project.goal = normalizeString(restoreSnapshot.goal, project.goal);
      project.artifactExpectation = hasObjectKeys(restoreSnapshot.artifactExpectation) ? restoreSnapshot.artifactExpectation : project.artifactExpectation;
      project.productSkeletonAgentOutput = hasObjectKeys(restoreSnapshot.productSkeletonAgentOutput) ? restoreSnapshot.productSkeletonAgentOutput : project.productSkeletonAgentOutput;
      project.runtimeSkeletonTruth = hasObjectKeys(restoreSnapshot.runtimeSkeletonTruth) ? restoreSnapshot.runtimeSkeletonTruth : project.runtimeSkeletonTruth;
      project.productDomainSkeleton = hasObjectKeys(restoreSnapshot.productDomainSkeleton) ? restoreSnapshot.productDomainSkeleton : project.productDomainSkeleton;
      project.productOwnedBackendSkeleton = hasObjectKeys(restoreSnapshot.productOwnedBackendSkeleton) ? restoreSnapshot.productOwnedBackendSkeleton : project.productOwnedBackendSkeleton;
      project.skeletonChoiceTruth = hasObjectKeys(restoreSnapshot.skeletonChoiceTruth) ? restoreSnapshot.skeletonChoiceTruth : project.skeletonChoiceTruth;
      project.buildApprovalFlow = {
        ...normalizeObject(project.buildApprovalFlow ?? project.context?.buildApprovalFlow ?? project.state?.buildApprovalFlow),
        status: "restored",
        decisionStatus: "restored",
        currentTruthUnchanged: false,
      };
      project.mutationChangeDecision = {
        ...normalizeObject(project.mutationChangeDecision ?? project.context?.mutationChangeDecision ?? project.state?.mutationChangeDecision),
        status: "restored",
        historyRecord: {
          ...normalizeObject(project.mutationChangeDecision?.historyRecord ?? project.context?.mutationChangeDecision?.historyRecord ?? project.state?.mutationChangeDecision?.historyRecord),
          after: "שוחזר מצב המוצר מנקודת חזרה מאושרת.",
          truthStatus: "restored-truth",
        },
      };
      project.canonicalMutationFlow = buildCanonicalMutationFlowShell({
        project,
        mutationChangeDecision: project.mutationChangeDecision,
        mutationChangeHistory: project.mutationChangeHistory ?? project.context?.mutationChangeHistory ?? project.state?.mutationChangeHistory,
        buildMutationTruth: project.buildMutationTruth ?? project.context?.buildMutationTruth ?? project.state?.buildMutationTruth,
        buildMutationHistory: project.buildMutationHistory ?? project.context?.buildMutationHistory ?? project.state?.buildMutationHistory,
      });
    }

    project.historyContinuityAgent = historyContinuityAgent;
    project.context = {
      ...normalizeObject(project.context),
      artifactExpectation: project.artifactExpectation,
      productSkeletonAgentOutput: project.productSkeletonAgentOutput,
      runtimeSkeletonTruth: project.runtimeSkeletonTruth,
      productDomainSkeleton: project.productDomainSkeleton,
      productOwnedBackendSkeleton: project.productOwnedBackendSkeleton,
      skeletonChoiceTruth: project.skeletonChoiceTruth,
      buildApprovalFlow: project.buildApprovalFlow,
      mutationChangeDecision: project.mutationChangeDecision,
      canonicalMutationFlow: project.canonicalMutationFlow,
      historyContinuityAgent,
    };
    project.state = {
      ...normalizeObject(project.state),
      artifactExpectation: project.artifactExpectation,
      productSkeletonAgentOutput: project.productSkeletonAgentOutput,
      runtimeSkeletonTruth: project.runtimeSkeletonTruth,
      productDomainSkeleton: project.productDomainSkeleton,
      productOwnedBackendSkeleton: project.productOwnedBackendSkeleton,
      skeletonChoiceTruth: project.skeletonChoiceTruth,
      buildApprovalFlow: project.buildApprovalFlow,
      mutationChangeDecision: project.mutationChangeDecision,
      canonicalMutationFlow: project.canonicalMutationFlow,
      historyContinuityAgent,
    };
    this.persistProjectRecord(project);
    return this.serializeProject(project);
  }

  requestHistoryRestoreDecision({ projectId, checkpointId = "" } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }
    const historyContinuityAgent = createHistoryRestoreDecision({
      project,
      checkpointId,
    });
    project.historyContinuityAgent = historyContinuityAgent;
    project.context = {
      ...(project.context ?? {}),
      historyContinuityAgent,
    };
    project.state = {
      ...(project.state ?? {}),
      historyContinuityAgent,
    };
    this.persistProjectRecord(project);
    return this.serializeProject(project);
  }

  prepareShareDemo({ projectId, input = {} } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }
    const shareDemoAgent = buildShareDemoAgentEnvelope({
      project,
      input,
      previous: project.shareDemoAgent ?? project.context?.shareDemoAgent ?? project.state?.shareDemoAgent ?? null,
    });
    project.shareDemoAgent = shareDemoAgent;
    project.context = {
      ...(project.context ?? {}),
      shareDemoAgent,
    };
    project.state = {
      ...(project.state ?? {}),
      shareDemoAgent,
    };
    this.persistProjectRecord(project);
    return this.serializeProject(project);
  }

  approveShareDemo({ projectId } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }
    const existing = project.shareDemoAgent ?? project.context?.shareDemoAgent ?? project.state?.shareDemoAgent ?? null;
    const shareDemoAgent = approveShareDemoAgentEnvelope({
      project,
      envelope: existing ?? buildShareDemoAgentEnvelope({ project, input: { shareType: "review-demo" } }),
    });
    project.shareDemoAgent = shareDemoAgent;
    project.context = {
      ...(project.context ?? {}),
      shareDemoAgent,
    };
    project.state = {
      ...(project.state ?? {}),
      shareDemoAgent,
    };
    this.persistProjectRecord(project);
    return this.serializeProject(project);
  }

  revokeShareDemo({ projectId } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }
    const existing = project.shareDemoAgent ?? project.context?.shareDemoAgent ?? project.state?.shareDemoAgent ?? null;
    const shareDemoAgent = revokeShareDemoAgentEnvelope({
      envelope: existing ?? buildShareDemoAgentEnvelope({ project, input: { shareType: "review-demo" } }),
    });
    project.shareDemoAgent = shareDemoAgent;
    project.context = {
      ...(project.context ?? {}),
      shareDemoAgent,
    };
    project.state = {
      ...(project.state ?? {}),
      shareDemoAgent,
    };
    this.persistProjectRecord(project);
    return this.serializeProject(project);
  }

  runGrowthAgent({ projectId, userInput = "" } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }
    const growthAgent = buildGrowthAgentEnvelope({
      project,
      userInput,
    });
    let socialCampaignExecutionAgent = project.socialCampaignExecutionAgent
      ?? project.context?.socialCampaignExecutionAgent
      ?? project.state?.socialCampaignExecutionAgent
      ?? null;
    if (growthAgent.growthPluginLayer?.primaryPlugin?.pluginId === "social-campaign-draft" || growthAgent.opportunityType === "campaign-draft") {
      socialCampaignExecutionAgent = buildSocialCampaignExecutionAgentEnvelope({
        project,
        userInput,
        growthAgent,
      });
      growthAgent.socialCampaignExecutionAgent = socialCampaignExecutionAgent;
    }
    let seoActionPath = project.seoActionPath
      ?? project.context?.seoActionPath
      ?? project.state?.seoActionPath
      ?? null;
    if (growthAgent.growthPluginLayer?.primaryPlugin?.pluginId === "seo-page-draft" || growthAgent.opportunityType === "seo-draft") {
      seoActionPath = buildSeoActionPathEnvelope({
        project,
        userInput,
        growthAgent,
        measurementTruth: project.growthMeasurementTruth ?? project.context?.growthMeasurementTruth ?? project.state?.growthMeasurementTruth ?? null,
      });
      growthAgent.seoActionPath = seoActionPath;
    }
    let semActionPath = project.semActionPath
      ?? project.context?.semActionPath
      ?? project.state?.semActionPath
      ?? null;
    if (growthAgent.growthPluginLayer?.primaryPlugin?.pluginId === "paid-test-draft" || growthAgent.opportunityType === "paid-test-draft") {
      semActionPath = buildSemActionPathEnvelope({
        project,
        userInput,
        growthAgent,
        measurementTruth: project.growthMeasurementTruth ?? project.context?.growthMeasurementTruth ?? project.state?.growthMeasurementTruth ?? growthAgent.growthMeasurementTruth ?? null,
      });
      growthAgent.semActionPath = semActionPath;
    }
    let emailActionPath = project.emailActionPath
      ?? project.context?.emailActionPath
      ?? project.state?.emailActionPath
      ?? null;
    if (growthAgent.growthPluginLayer?.primaryPlugin?.pluginId === "email-draft" || growthAgent.opportunityType === "email-draft") {
      emailActionPath = buildEmailActionPathEnvelope({
        project,
        userInput,
        growthAgent,
        measurementTruth: project.growthMeasurementTruth ?? project.context?.growthMeasurementTruth ?? project.state?.growthMeasurementTruth ?? growthAgent.growthMeasurementTruth ?? null,
      });
      growthAgent.emailActionPath = emailActionPath;
    }
    let landingActionPath = project.landingActionPath
      ?? project.context?.landingActionPath
      ?? project.state?.landingActionPath
      ?? null;
    let landingBackendSync = project.landingBackendSync
      ?? project.context?.landingBackendSync
      ?? project.state?.landingBackendSync
      ?? null;
    if (growthAgent.growthPluginLayer?.primaryPlugin?.pluginId === "landing-experiment-draft" || growthAgent.opportunityType === "landing-experiment") {
      landingActionPath = buildLandingActionPathEnvelope({
        project,
        userInput,
        growthAgent,
        measurementTruth: project.growthMeasurementTruth ?? project.context?.growthMeasurementTruth ?? project.state?.growthMeasurementTruth ?? growthAgent.growthMeasurementTruth ?? null,
      });
      landingBackendSync = buildLandingBackendSyncEnvelope({
        project,
        landingActionPath,
        leadCapture: landingActionPath.leadCapture ?? {},
        previousEnvelope: landingBackendSync,
      });
      growthAgent.landingActionPath = landingActionPath;
      growthAgent.landingBackendSync = landingBackendSync;
    }
    project.growthAgent = growthAgent;
    const growthMeasurementTruth = growthAgent.growthMeasurementTruth ?? buildGrowthMeasurementTruth({
      project,
      growthAgent,
      records: project.growthMeasurementTruth?.records ?? project.context?.growthMeasurementTruth?.records ?? project.state?.growthMeasurementTruth?.records ?? [],
    });
    project.growthMeasurementTruth = growthMeasurementTruth;
    project.context = {
      ...(project.context ?? {}),
      growthAgent,
      growthMeasurementTruth,
      socialCampaignExecutionAgent,
      seoActionPath,
      semActionPath,
      emailActionPath,
      landingActionPath,
      landingBackendSync,
    };
    project.state = {
      ...(project.state ?? {}),
      growthAgent,
      growthMeasurementTruth,
      socialCampaignExecutionAgent,
      seoActionPath,
      semActionPath,
      emailActionPath,
      landingActionPath,
      landingBackendSync,
    };
    project.socialCampaignExecutionAgent = socialCampaignExecutionAgent;
    project.seoActionPath = seoActionPath;
    project.semActionPath = semActionPath;
    project.emailActionPath = emailActionPath;
    project.landingActionPath = landingActionPath;
    project.landingBackendSync = landingBackendSync;
    this.persistProjectRecord(project);
    return this.serializeProject(project);
  }

  runLandingActionPath({
    projectId,
    userInput = "",
    approvalDecisions = {},
    shareDemoAgent = null,
    releaseGate = null,
    leadCapture = {},
    leadSubmission = null,
    providerResults = null,
  } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }
    const growthAgent = project.growthAgent
      ?? project.context?.growthAgent
      ?? project.state?.growthAgent
      ?? buildGrowthAgentEnvelope({ project, userInput });
    const landingActionPath = buildLandingActionPathEnvelope({
      project,
      userInput,
      growthAgent,
      approvalDecisions,
      shareDemoAgent,
      releaseGate,
      leadCapture,
      providerResults,
      measurementTruth: project.growthMeasurementTruth ?? project.context?.growthMeasurementTruth ?? project.state?.growthMeasurementTruth ?? null,
    });
    const previousLandingBackendSync = project.landingBackendSync
      ?? project.context?.landingBackendSync
      ?? project.state?.landingBackendSync
      ?? null;
    const landingBackendSync = buildLandingBackendSyncEnvelope({
      project,
      landingActionPath,
      leadCapture: landingActionPath.leadCapture ?? leadCapture,
      leadSubmission,
      previousEnvelope: previousLandingBackendSync,
    });
    const productOwnedBackendSkeletonAfterSync = landingBackendSync.productOwnedBackendSkeletonAfterSync
      ?? project.productOwnedBackendSkeleton
      ?? project.context?.productOwnedBackendSkeleton
      ?? project.state?.productOwnedBackendSkeleton
      ?? null;
    if (productOwnedBackendSkeletonAfterSync?.productOwnedBackendSkeletonId) {
      project.productOwnedBackendSkeleton = productOwnedBackendSkeletonAfterSync;
    }
    project.growthAgent = {
      ...growthAgent,
      landingActionPath,
      landingBackendSync,
    };
    project.landingActionPath = landingActionPath;
    project.landingBackendSync = landingBackendSync;
    project.context = {
      ...(project.context ?? {}),
      growthAgent: project.growthAgent,
      landingActionPath,
      landingBackendSync,
      productOwnedBackendSkeleton: project.productOwnedBackendSkeleton ?? project.context?.productOwnedBackendSkeleton ?? null,
    };
    project.state = {
      ...(project.state ?? {}),
      growthAgent: project.growthAgent,
      landingActionPath,
      landingBackendSync,
      productOwnedBackendSkeleton: project.productOwnedBackendSkeleton ?? project.state?.productOwnedBackendSkeleton ?? null,
    };
    this.persistProjectRecord(project);
    return this.serializeProject(project);
  }

  runEmailActionPath({
    projectId,
    userInput = "",
    approvalDecisions = {},
    providerConnection = {},
    audienceInput = {},
    providerResults = null,
  } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }
    const growthAgent = project.growthAgent
      ?? project.context?.growthAgent
      ?? project.state?.growthAgent
      ?? buildGrowthAgentEnvelope({ project, userInput });
    const emailActionPath = buildEmailActionPathEnvelope({
      project,
      userInput,
      growthAgent,
      approvalDecisions,
      providerConnection,
      audienceInput,
      providerResults,
      measurementTruth: project.growthMeasurementTruth ?? project.context?.growthMeasurementTruth ?? project.state?.growthMeasurementTruth ?? null,
    });
    project.growthAgent = {
      ...growthAgent,
      emailActionPath,
    };
    project.emailActionPath = emailActionPath;
    project.context = {
      ...(project.context ?? {}),
      growthAgent: project.growthAgent,
      emailActionPath,
    };
    project.state = {
      ...(project.state ?? {}),
      growthAgent: project.growthAgent,
      emailActionPath,
    };
    this.persistProjectRecord(project);
    return this.serializeProject(project);
  }

  runSemActionPath({
    projectId,
    userInput = "",
    approvalDecisions = {},
    providerConnection = {},
    providerResults = null,
    safeStopSignal = null,
    requestedBudget = null,
  } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }
    const growthAgent = project.growthAgent
      ?? project.context?.growthAgent
      ?? project.state?.growthAgent
      ?? buildGrowthAgentEnvelope({ project, userInput });
    const semActionPath = buildSemActionPathEnvelope({
      project,
      userInput,
      growthAgent,
      approvalDecisions,
      providerConnection,
      providerResults,
      safeStopSignal,
      requestedBudget,
      measurementTruth: project.growthMeasurementTruth ?? project.context?.growthMeasurementTruth ?? project.state?.growthMeasurementTruth ?? null,
    });
    project.growthAgent = {
      ...growthAgent,
      semActionPath,
    };
    project.semActionPath = semActionPath;
    project.context = {
      ...(project.context ?? {}),
      growthAgent: project.growthAgent,
      semActionPath,
    };
    project.state = {
      ...(project.state ?? {}),
      growthAgent: project.growthAgent,
      semActionPath,
    };
    this.persistProjectRecord(project);
    return this.serializeProject(project);
  }

  runSeoActionPath({
    projectId,
    userInput = "",
    approvalDecisions = {},
    searchConsoleConnection = {},
  } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }
    const growthAgent = project.growthAgent
      ?? project.context?.growthAgent
      ?? project.state?.growthAgent
      ?? buildGrowthAgentEnvelope({ project, userInput });
    const seoActionPath = buildSeoActionPathEnvelope({
      project,
      userInput,
      growthAgent,
      approvalDecisions,
      searchConsoleConnection,
      measurementTruth: project.growthMeasurementTruth ?? project.context?.growthMeasurementTruth ?? project.state?.growthMeasurementTruth ?? null,
    });
    project.growthAgent = {
      ...growthAgent,
      seoActionPath,
    };
    project.seoActionPath = seoActionPath;
    project.context = {
      ...(project.context ?? {}),
      growthAgent: project.growthAgent,
      seoActionPath,
    };
    project.state = {
      ...(project.state ?? {}),
      growthAgent: project.growthAgent,
      seoActionPath,
    };
    this.persistProjectRecord(project);
    return this.serializeProject(project);
  }

  runSocialCampaignExecutionAgent({
    projectId,
    userInput = "",
    providerConnection = {},
    approvalDecisions = {},
    creativeAssets = [],
    providerResults = null,
  } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }
    const growthAgent = project.growthAgent
      ?? project.context?.growthAgent
      ?? project.state?.growthAgent
      ?? buildGrowthAgentEnvelope({ project, userInput });
    const socialCampaignExecutionAgent = buildSocialCampaignExecutionAgentEnvelope({
      project,
      userInput,
      growthAgent,
      providerConnection,
      approvalDecisions,
      creativeAssets,
      providerResults,
    });
    project.growthAgent = {
      ...growthAgent,
      socialCampaignExecutionAgent,
    };
    project.socialCampaignExecutionAgent = socialCampaignExecutionAgent;
    project.context = {
      ...(project.context ?? {}),
      growthAgent: project.growthAgent,
      socialCampaignExecutionAgent,
    };
    project.state = {
      ...(project.state ?? {}),
      growthAgent: project.growthAgent,
      socialCampaignExecutionAgent,
    };
    this.persistProjectRecord(project);
    return this.serializeProject(project);
  }

  recordGrowthMeasurement({ projectId, record = {}, externalAction = null, shareApproved = false } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }
    const existingTruth = project.growthMeasurementTruth
      ?? project.context?.growthMeasurementTruth
      ?? project.state?.growthMeasurementTruth
      ?? null;
    const existingRecords = existingTruth?.records ?? [];
    const growthAgent = project.growthAgent
      ?? project.context?.growthAgent
      ?? project.state?.growthAgent
      ?? null;
    const growthMeasurementTruth = buildGrowthMeasurementTruth({
      project,
      growthAgent,
      records: [...existingRecords, record],
      externalAction,
      shareApproved,
    });
    project.growthMeasurementTruth = growthMeasurementTruth;
    project.context = {
      ...(project.context ?? {}),
      growthMeasurementTruth,
    };
    project.state = {
      ...(project.state ?? {}),
      growthMeasurementTruth,
    };
    this.persistProjectRecord(project);
    return this.serializeProject(project);
  }

  decideBuildApproval({ projectId, action = "" } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }
    const existingFlow = normalizeObject(
      project.buildApprovalFlow
        ?? project.context?.buildApprovalFlow
        ?? project.state?.buildApprovalFlow,
    );
    const decidedFlow = decideBuildApprovalFlow({
      approvalFlow: existingFlow,
      action,
    });
    if (!decidedFlow) {
      return null;
    }

    if (decidedFlow.decisionStatus === "approved") {
      applyApprovedProductDirectionToProject(project, decidedFlow);
    }

    const previousDecision = normalizeObject(
      project.mutationChangeDecision
        ?? project.context?.mutationChangeDecision
        ?? project.state?.mutationChangeDecision,
    );
    const mutationChangeDecision = {
      ...previousDecision,
      status: decidedFlow.decisionStatus === "approved" ? "approved-applied" : decidedFlow.decisionStatus,
      historyRecord: {
        ...normalizeObject(previousDecision.historyRecord),
        after: decidedFlow.decisionStatus === "approved"
          ? normalizeString(decidedFlow.userFacingSummary, "השינוי אושר והוחל.")
          : "לא בוצע שינוי באישור המשתמש.",
        approvalStatus: decidedFlow.decisionStatus,
        truthStatus: decidedFlow.decisionStatus === "approved" ? "new-truth" : "unchanged",
      },
      completedAt: decidedFlow.decidedAt,
    };
    const mutationChangeHistory = appendMutationChangeHistory(project, mutationChangeDecision);
    const canonicalMutationFlow = buildCanonicalMutationFlowShell({
      project,
      mutationChangeDecision,
      mutationChangeHistory,
      buildMutationTruth: project.buildMutationTruth ?? project.context?.buildMutationTruth ?? project.state?.buildMutationTruth,
      buildMutationHistory: project.buildMutationHistory ?? project.context?.buildMutationHistory ?? project.state?.buildMutationHistory,
    });
    const historyContinuityAgent = buildHistoryContinuityAgentEnvelope({
      project: {
        ...project,
        buildApprovalFlow: decidedFlow,
        mutationChangeDecision,
        mutationChangeHistory,
        canonicalMutationFlow,
      },
    });

    project.buildApprovalFlow = decidedFlow;
    project.mutationChangeDecision = mutationChangeDecision;
    project.mutationChangeHistory = mutationChangeHistory;
    project.canonicalMutationFlow = canonicalMutationFlow;
    project.historyContinuityAgent = historyContinuityAgent;
    project.context = {
      ...normalizeObject(project.context),
      buildApprovalFlow: decidedFlow,
      mutationChangeDecision,
      mutationChangeHistory,
      canonicalMutationFlow,
      historyContinuityAgent,
    };
    project.state = {
      ...normalizeObject(project.state),
      buildApprovalFlow: decidedFlow,
      mutationChangeDecision,
      mutationChangeHistory,
      canonicalMutationFlow,
      historyContinuityAgent,
    };
    this.persistProjectRecord(project);
    return this.serializeProject(project);
  }

  stopSnapshotBackupTimer(projectId) {
    const timer = this.snapshotBackupTimers.get(projectId);
    if (timer) {
      clearInterval(timer);
      this.snapshotBackupTimers.delete(projectId);
    }
  }

  syncSnapshotBackupRuntimeState(project) {
    if (!project) {
      return null;
    }

    project.context = {
      ...(project.context ?? {}),
      snapshotBackupWorker: project.snapshotBackupWorker ?? null,
      snapshotJobState: project.snapshotJobState ?? null,
      snapshotWorkerRuntime: project.snapshotWorkerRuntime ?? null,
    };
    project.state = {
      ...(project.state ?? {}),
      snapshotBackupWorker: project.snapshotBackupWorker ?? null,
      snapshotJobState: project.snapshotJobState ?? null,
      snapshotWorkerRuntime: project.snapshotWorkerRuntime ?? null,
    };

    return project.snapshotBackupWorker ?? null;
  }

  buildPreChangeTriggerSnapshot(project = {}, builtContext = {}) {
    const bootstrapTaskCount = Array.isArray(builtContext.bootstrapTasks) ? builtContext.bootstrapTasks.length : 0;
    const migrationCount = Array.isArray(builtContext.migrationDiff?.migrations) ? builtContext.migrationDiff.migrations.length : 0;
    const buildArtifactCount = Array.isArray(builtContext.deploymentRequest?.buildArtifacts)
      ? builtContext.deploymentRequest.buildArtifacts.length
      : 0;
    const runtimeDeployments = Array.isArray(project.runtimeSnapshot?.deployments)
      ? project.runtimeSnapshot.deployments.map((deployment) => ({
        environment: deployment.environment ?? null,
        status: deployment.status ?? null,
        target: deployment.target ?? null,
      }))
      : [];

    return {
      bootstrap: JSON.stringify({
        domain: builtContext.bootstrapPlan?.domain ?? null,
        taskCount: bootstrapTaskCount,
        status: builtContext.bootstrapExecutionResult?.status ?? null,
        expectedArtifacts: Array.isArray(builtContext.bootstrapValidation?.expectedArtifacts)
          ? builtContext.bootstrapValidation.expectedArtifacts
          : [],
      }),
      migration: JSON.stringify({
        totalChanges: builtContext.migrationDiff?.totalMigrationChanges ?? 0,
        migrationCount,
        targetVersion: builtContext.migrationPlan?.targetVersion ?? builtContext.migrationPlan?.version ?? null,
      }),
      deploy: JSON.stringify({
        provider: builtContext.deploymentRequest?.provider ?? null,
        environment: builtContext.deploymentRequest?.environment ?? null,
        target: builtContext.deploymentRequest?.target ?? null,
        artifactCount: buildArtifactCount,
        decision: builtContext.deployPolicyDecision?.decision ?? null,
        runtimeDeployments,
      }),
    };
  }

  applyScheduledPreChangeBackups(projectId, builtContext = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return;
    }

    const schedule = project.snapshotSchedule ?? project.context?.snapshotSchedule ?? null;
    const triggers = Array.isArray(schedule?.preChangeTriggers) ? schedule.preChangeTriggers : [];
    if (!schedule?.enabled || triggers.length === 0) {
      return;
    }

    const currentSignatures = this.buildPreChangeTriggerSnapshot(project, builtContext);
    const previousState =
      project.snapshotPreChangeTriggerState && typeof project.snapshotPreChangeTriggerState === "object"
        ? project.snapshotPreChangeTriggerState
        : {};
    const nextState = { ...previousState };

    for (const triggerType of triggers) {
      const normalizedTrigger = `${triggerType ?? ""}`.trim().toLowerCase();
      const currentSignature = currentSignatures[normalizedTrigger] ?? null;
      if (!currentSignature) {
        continue;
      }

      const previousSignature = previousState[normalizedTrigger]?.signature ?? null;
      if (!previousSignature) {
        nextState[normalizedTrigger] = {
          signature: currentSignature,
          lastObservedAt: new Date().toISOString(),
          lastTriggeredAt: previousState[normalizedTrigger]?.lastTriggeredAt ?? null,
        };
        continue;
      }

      if (previousSignature === currentSignature) {
        continue;
      }

      this.runSnapshotBackupNow({
        projectId,
        triggerType: normalizedTrigger,
        reason: `${normalizedTrigger}-pre-change-backup`,
        skipContextRebuild: true,
      });
      nextState[normalizedTrigger] = {
        signature: currentSignature,
        lastObservedAt: new Date().toISOString(),
        lastTriggeredAt: new Date().toISOString(),
      };
    }

    project.snapshotPreChangeTriggerState = nextState;
  }

  ensureSnapshotBackupWorker(projectId, workerInput = null) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const { snapshotBackupWorker, snapshotJobState, workerRuntime } = createSnapshotBackupWorkerJob({
      projectId,
      snapshotSchedule: project.snapshotSchedule ?? project.context?.snapshotSchedule ?? null,
      snapshotRetentionDecision: project.snapshotRetentionDecision ?? project.context?.snapshotRetentionDecision ?? null,
      previousWorkerState: project.snapshotBackupWorker ?? project.context?.snapshotBackupWorker ?? null,
      previousJobState: project.snapshotJobState ?? project.context?.snapshotJobState ?? null,
      workerInput,
    });

    project.snapshotBackupWorker = snapshotBackupWorker;
    project.snapshotJobState = snapshotJobState;
    project.snapshotWorkerRuntime = workerRuntime;
    this.syncSnapshotBackupRuntimeState(project);
    return snapshotBackupWorker;
  }

  normalizeSnapshotRetentionPolicy(retentionInput = {}, previousPolicy = null, projectId = null) {
    const input = retentionInput && typeof retentionInput === "object" ? retentionInput : {};
    const previous = previousPolicy && typeof previousPolicy === "object" ? previousPolicy : {};
    const normalizedMax = Number(input.maxSnapshots ?? previous.maxSnapshots);
    const maxSnapshots = Number.isFinite(normalizedMax) && normalizedMax >= 1 ? Math.floor(normalizedMax) : 20;

    return {
      retentionPolicyId: previous.retentionPolicyId ?? `snapshot-retention-policy:${projectId ?? "unknown-project"}`,
      projectId: projectId ?? previous.projectId ?? null,
      enabled: typeof input.enabled === "boolean" ? input.enabled : (typeof previous.enabled === "boolean" ? previous.enabled : true),
      maxSnapshots,
      deletionStrategy: "oldest-first",
      updatedAt: new Date().toISOString(),
      summary: {
        policyStatus: (typeof input.enabled === "boolean" ? input.enabled : (typeof previous.enabled === "boolean" ? previous.enabled : true))
          ? "active"
          : "paused",
        supportsManualCleanup: true,
      },
    };
  }

  applySnapshotRetention({
    projectId,
    triggerType = "manual-cleanup",
  } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const retentionPolicy = project.snapshotRetentionPolicy ?? project.context?.snapshotRetentionPolicy ?? null;
    const snapshotSchedule = project.snapshotSchedule ?? project.context?.snapshotSchedule ?? null;
    const snapshotRecord = project.context?.snapshotRecord ?? null;
    const projectSnapshots = this.getProjectSnapshots({
      projectId,
      limit: 1000,
    });
    const { snapshotRetentionDecision } = createSnapshotRetentionGuard({
      snapshotRecord,
      snapshotSchedule,
      snapshotRecords: projectSnapshots,
      retentionPolicy,
      triggerType,
    });

    let deletedSnapshotRecords = [];
    if (
      snapshotRetentionDecision.shouldPrune
      && typeof this.projectSnapshotStore.deleteBySnapshotRecordIds === "function"
      && snapshotRetentionDecision.deletedSnapshotRecordIds.length > 0
    ) {
      deletedSnapshotRecords = this.projectSnapshotStore.deleteBySnapshotRecordIds(
        snapshotRetentionDecision.deletedSnapshotRecordIds,
      );
    }

    const updatedDecision = {
      ...snapshotRetentionDecision,
      deletedSnapshotRecordIds: deletedSnapshotRecords
        .map((record) => record.snapshotRecordId)
        .filter((value) => typeof value === "string" && value.length > 0),
      summary: {
        ...(snapshotRetentionDecision.summary ?? {}),
        pruneCount: deletedSnapshotRecords.length,
        totalAfterCleanup: projectSnapshots.length - deletedSnapshotRecords.length,
      },
      cleanedAt: new Date().toISOString(),
    };
    const updatedPolicy = this.normalizeSnapshotRetentionPolicy(
      {},
      {
        ...(retentionPolicy ?? {}),
        maxSnapshots: snapshotRetentionDecision.maxSnapshots,
        enabled: snapshotRetentionDecision.retentionEnabled,
      },
      projectId,
    );

    project.snapshotRetentionPolicy = {
      ...updatedPolicy,
      lastCleanupAt: updatedDecision.cleanedAt,
      lastCleanupTrigger: triggerType,
      lastDeletedCount: deletedSnapshotRecords.length,
      summary: {
        ...(updatedPolicy.summary ?? {}),
        totalSnapshotsAfterCleanup: updatedDecision.summary.totalAfterCleanup,
      },
    };
    project.snapshotRetentionDecision = updatedDecision;

    return {
      snapshotRetentionPolicy: project.snapshotRetentionPolicy,
      snapshotRetentionDecision: updatedDecision,
    };
  }

  runSnapshotBackupNow({ projectId, triggerType = "manual", reason = null, skipContextRebuild = false } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    if (!skipContextRebuild) {
      this.rebuildContext(projectId, { skipPreChangeBackups: true });
    }
    const projectStateSnapshot = project.context?.projectStateSnapshot;
    if (!projectStateSnapshot) {
      return null;
    }

    const snapshotReason =
      reason
      ?? (triggerType === "interval" ? "scheduled-backup" : triggerType === "manual" ? "manual-backup" : "pre-change-backup");
    const { snapshotRecord } = createProjectSnapshotStore({
      projectStateSnapshot,
      recordOverrides: {
        triggerType,
        reason: snapshotReason,
      },
      snapshotStore: this.projectSnapshotStore,
      observabilityTransport: this.platformObservabilityTransport,
      traceId: `snapshot-backup:${projectId}:${Date.now()}`,
    });
    const previousSchedule = project.snapshotSchedule ?? null;

    if (previousSchedule && previousSchedule.execution) {
      project.snapshotSchedule = {
        ...previousSchedule,
        execution: {
          ...previousSchedule.execution,
          lastRunAt: new Date().toISOString(),
          runCount: (previousSchedule.execution.runCount ?? 0) + 1,
          nextRunAt: previousSchedule.enabled
            ? new Date(Date.now() + ((previousSchedule.intervalMs ?? previousSchedule.intervalSeconds * 1000 ?? 0))).toISOString()
            : null,
        },
      };
    }

    project.context = {
      ...(project.context ?? {}),
      snapshotRecord,
      snapshotSchedule: project.snapshotSchedule ?? null,
      snapshotPreChangeTriggerState: project.snapshotPreChangeTriggerState ?? {},
    };
    project.state = {
      ...(project.state ?? {}),
      snapshotRecord,
      snapshotSchedule: project.snapshotSchedule ?? null,
      snapshotPreChangeTriggerState: project.snapshotPreChangeTriggerState ?? {},
    };
    const retentionResult = this.applySnapshotRetention({
      projectId,
      triggerType: triggerType === "interval" ? "scheduled-cleanup" : "post-backup-cleanup",
    });
    project.context = {
      ...(project.context ?? {}),
      snapshotRetentionPolicy: retentionResult?.snapshotRetentionPolicy ?? project.snapshotRetentionPolicy ?? null,
      snapshotRetentionDecision: retentionResult?.snapshotRetentionDecision ?? project.snapshotRetentionDecision ?? null,
    };
    project.state = {
      ...(project.state ?? {}),
      snapshotRetentionPolicy: retentionResult?.snapshotRetentionPolicy ?? project.snapshotRetentionPolicy ?? null,
      snapshotRetentionDecision: retentionResult?.snapshotRetentionDecision ?? project.snapshotRetentionDecision ?? null,
    };

    return this.serializeProject(project);
  }

  runSnapshotBackupWorkerTick({ projectId, triggerType = "interval" } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const worker = this.ensureSnapshotBackupWorker(projectId);
    const nowIso = new Date().toISOString();
    if (!worker?.enabled) {
      project.snapshotBackupWorker = {
        ...(worker ?? {}),
        status: "paused",
        updatedAt: nowIso,
      };
      project.snapshotJobState = {
        ...(project.snapshotJobState ?? {}),
        status: "idle",
        enabled: false,
        lastExecutionStatus: project.snapshotBackupWorker.lastExecutionStatus ?? "not-run",
        nextRunAt: null,
        updatedAt: nowIso,
      };
      this.syncSnapshotBackupRuntimeState(project);
      return this.serializeProject(project);
    }

    try {
      const backupResult = this.runSnapshotBackupNow({
        projectId,
        triggerType,
      });
      const refreshedProject = this.projects.get(projectId);
      if (!backupResult || !refreshedProject) {
        throw new Error("Snapshot backup worker run did not produce a backup result");
      }

      const currentWorker = refreshedProject.snapshotBackupWorker ?? worker ?? {};
      const schedule = refreshedProject.snapshotSchedule ?? null;
      refreshedProject.snapshotBackupWorker = {
        ...currentWorker,
        enabled: true,
        status: "active",
        lastExecutionStatus: "success",
        lastRunAt: nowIso,
        runCount: (currentWorker.runCount ?? 0) + 1,
        nextRunAt: schedule?.enabled
          ? new Date(Date.now() + (schedule.intervalMs ?? schedule.intervalSeconds * 1000 ?? 0)).toISOString()
          : null,
        lastError: null,
        updatedAt: nowIso,
        summary: {
          workerStatus: "enabled",
          runCount: (currentWorker.runCount ?? 0) + 1,
          errorCount: currentWorker.errorCount ?? 0,
          lastExecutionStatus: "success",
        },
      };
      refreshedProject.snapshotJobState = {
        ...(refreshedProject.snapshotJobState ?? {}),
        projectId,
        status: "completed",
        enabled: true,
        lastExecutionStatus: "success",
        lastRunAt: nowIso,
        nextRunAt: refreshedProject.snapshotBackupWorker.nextRunAt ?? null,
        attempts: refreshedProject.snapshotBackupWorker.errorCount ?? 0,
        retention: {
          retentionEnabled: refreshedProject.snapshotRetentionDecision?.retentionEnabled ?? null,
          maxSnapshots: refreshedProject.snapshotRetentionDecision?.maxSnapshots ?? null,
        },
        updatedAt: nowIso,
        summary: {
          ...(refreshedProject.snapshotJobState?.summary ?? {}),
          workerEnabled: true,
          runtimeStatus: refreshedProject.snapshotWorkerRuntime?.status ?? "ready",
          lastExecutionStatus: "success",
        },
      };
      this.syncSnapshotBackupRuntimeState(refreshedProject);

      return this.serializeProject(refreshedProject);
    } catch (error) {
      const failedProject = this.projects.get(projectId);
      if (!failedProject) {
        return null;
      }
      const currentWorker = failedProject.snapshotBackupWorker ?? worker ?? {};
      failedProject.snapshotBackupWorker = {
        ...currentWorker,
        enabled: true,
        status: "degraded",
        lastExecutionStatus: "failed",
        lastRunAt: nowIso,
        errorCount: (currentWorker.errorCount ?? 0) + 1,
        lastError: error instanceof Error ? error.message : "Unknown worker error",
        updatedAt: nowIso,
        summary: {
          workerStatus: "enabled",
          runCount: currentWorker.runCount ?? 0,
          errorCount: (currentWorker.errorCount ?? 0) + 1,
          lastExecutionStatus: "failed",
        },
      };
      failedProject.snapshotJobState = {
        ...(failedProject.snapshotJobState ?? {}),
        projectId,
        status: "failed",
        enabled: true,
        lastExecutionStatus: "failed",
        lastRunAt: nowIso,
        nextRunAt: failedProject.snapshotBackupWorker.nextRunAt ?? null,
        attempts: (failedProject.snapshotJobState?.attempts ?? currentWorker.errorCount ?? 0) + 1,
        lastError: failedProject.snapshotBackupWorker.lastError,
        updatedAt: nowIso,
        summary: {
          ...(failedProject.snapshotJobState?.summary ?? {}),
          workerEnabled: true,
          runtimeStatus: failedProject.snapshotWorkerRuntime?.status ?? "ready",
          lastExecutionStatus: "failed",
        },
      };
      this.syncSnapshotBackupRuntimeState(failedProject);
      return this.serializeProject(failedProject);
    }
  }

  syncSnapshotBackupWorkerTimer(projectId) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    this.stopSnapshotBackupTimer(projectId);
    const schedule = project.snapshotSchedule ?? null;
    const worker = this.ensureSnapshotBackupWorker(projectId);
    if (!schedule?.enabled || !worker?.enabled) {
      project.snapshotJobState = {
        ...(project.snapshotJobState ?? {}),
        status: "idle",
        enabled: Boolean(worker?.enabled),
        nextRunAt: null,
        updatedAt: new Date().toISOString(),
      };
      this.syncSnapshotBackupRuntimeState(project);
      return worker;
    }

    const intervalMs = Number(schedule.intervalMs ?? (schedule.intervalSeconds ? schedule.intervalSeconds * 1000 : 0));
    if (!Number.isFinite(intervalMs) || intervalMs < 30_000) {
      return worker;
    }

    const timer = setInterval(() => {
      this.runSnapshotBackupWorkerTick({
        projectId,
        triggerType: "interval",
      });
    }, intervalMs);

    this.snapshotBackupTimers.set(projectId, timer);
    project.snapshotBackupWorker = {
      ...worker,
      status: "active",
      nextRunAt: new Date(Date.now() + intervalMs).toISOString(),
      updatedAt: new Date().toISOString(),
      summary: {
        ...(worker.summary ?? {}),
        workerStatus: "enabled",
      },
    };
    project.snapshotJobState = {
      ...(project.snapshotJobState ?? {}),
      status: "queued",
      enabled: true,
      nextRunAt: project.snapshotBackupWorker.nextRunAt ?? null,
      updatedAt: new Date().toISOString(),
      summary: {
        ...(project.snapshotJobState?.summary ?? {}),
        workerEnabled: true,
        runtimeStatus: project.snapshotWorkerRuntime?.status ?? "ready",
      },
    };
    this.syncSnapshotBackupRuntimeState(project);

    return project.snapshotBackupWorker;
  }

  startSnapshotBackupTimer(projectId) {
    return this.syncSnapshotBackupWorkerTimer(projectId);
  }

  configureSnapshotBackupSchedule({ projectId, scheduleInput = {} } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    this.rebuildContext(projectId);
    const { snapshotSchedule } = createSnapshotBackupSchedulingModule({
      backupStrategy: project.context?.backupStrategy ?? null,
      projectState: project.state ?? null,
      previousSchedule: project.snapshotSchedule ?? project.context?.snapshotSchedule ?? null,
      scheduleInput,
    });
    project.snapshotSchedule = snapshotSchedule;
    project.snapshotPreChangeTriggerState = Object.fromEntries(
      Object.entries(this.buildPreChangeTriggerSnapshot(project, project.context ?? {})).map(([triggerType, signature]) => [
        triggerType,
        {
          signature,
          lastObservedAt: new Date().toISOString(),
          lastTriggeredAt: project.snapshotPreChangeTriggerState?.[triggerType]?.lastTriggeredAt ?? null,
        },
      ]),
    );
    project.context = {
      ...(project.context ?? {}),
      snapshotSchedule,
      snapshotPreChangeTriggerState: project.snapshotPreChangeTriggerState,
    };
    project.state = {
      ...(project.state ?? {}),
      snapshotSchedule,
      snapshotPreChangeTriggerState: project.snapshotPreChangeTriggerState,
    };
    this.syncSnapshotBackupWorkerTimer(projectId);

    return this.serializeProject(project);
  }

  configureSnapshotBackupWorker({ projectId, workerInput = {} } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const snapshotBackupWorker = this.ensureSnapshotBackupWorker(projectId, workerInput);
    this.syncSnapshotBackupRuntimeState(project);
    this.syncSnapshotBackupWorkerTimer(projectId);

    return this.serializeProject(project);
  }

  configureSnapshotRetentionPolicy({ projectId, retentionInput = {} } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const snapshotRetentionPolicy = this.normalizeSnapshotRetentionPolicy(
      retentionInput,
      project.snapshotRetentionPolicy ?? project.context?.snapshotRetentionPolicy ?? null,
      projectId,
    );
    project.snapshotRetentionPolicy = snapshotRetentionPolicy;

    const retentionResult = this.applySnapshotRetention({
      projectId,
      triggerType: "policy-update",
    });

    project.context = {
      ...(project.context ?? {}),
      snapshotRetentionPolicy: retentionResult?.snapshotRetentionPolicy ?? snapshotRetentionPolicy,
      snapshotRetentionDecision: retentionResult?.snapshotRetentionDecision ?? project.snapshotRetentionDecision ?? null,
    };
    project.state = {
      ...(project.state ?? {}),
      snapshotRetentionPolicy: retentionResult?.snapshotRetentionPolicy ?? snapshotRetentionPolicy,
      snapshotRetentionDecision: retentionResult?.snapshotRetentionDecision ?? project.snapshotRetentionDecision ?? null,
    };

    return this.serializeProject(project);
  }

  runSnapshotRetentionCleanup({ projectId, triggerType = "manual-cleanup" } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const retentionResult = this.applySnapshotRetention({
      projectId,
      triggerType,
    });
    project.context = {
      ...(project.context ?? {}),
      snapshotRetentionPolicy: retentionResult?.snapshotRetentionPolicy ?? project.snapshotRetentionPolicy ?? null,
      snapshotRetentionDecision: retentionResult?.snapshotRetentionDecision ?? project.snapshotRetentionDecision ?? null,
    };
    project.state = {
      ...(project.state ?? {}),
      snapshotRetentionPolicy: retentionResult?.snapshotRetentionPolicy ?? project.snapshotRetentionPolicy ?? null,
      snapshotRetentionDecision: retentionResult?.snapshotRetentionDecision ?? project.snapshotRetentionDecision ?? null,
    };

    return this.serializeProject(project);
  }

  getDisasterRecoveryChecklist({ projectId, refresh = false } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const serializedProject = refresh ? this.rebuildContext(projectId) : this.serializeProject(project);
    const disasterRecoveryChecklist =
      serializedProject?.disasterRecoveryChecklist
      ?? serializedProject?.state?.disasterRecoveryChecklist
      ?? serializedProject?.context?.disasterRecoveryChecklist
      ?? null;
    if (!disasterRecoveryChecklist) {
      return null;
    }

    return {
      projectId,
      disasterRecoveryChecklist,
      summary: disasterRecoveryChecklist.summary ?? null,
      project: serializedProject,
    };
  }

  getBusinessContinuityState({ projectId, refresh = false } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const serializedProject = refresh ? this.rebuildContext(projectId) : this.serializeProject(project);
    const businessContinuityState =
      serializedProject?.businessContinuityState
      ?? serializedProject?.state?.businessContinuityState
      ?? serializedProject?.context?.businessContinuityState
      ?? null;
    if (!businessContinuityState) {
      return null;
    }

    return {
      projectId,
      continuityPlan:
        serializedProject?.continuityPlan
        ?? serializedProject?.state?.continuityPlan
        ?? serializedProject?.context?.continuityPlan
        ?? null,
      businessContinuityState,
      summary: businessContinuityState.summary ?? null,
      project: serializedProject,
    };
  }

  getContinuityPlan({ projectId, refresh = false } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const serializedProject = refresh ? this.rebuildContext(projectId) : this.serializeProject(project);
    const continuityPlan =
      serializedProject?.continuityPlan
      ?? serializedProject?.state?.continuityPlan
      ?? serializedProject?.context?.continuityPlan
      ?? null;
    if (!continuityPlan) {
      return null;
    }

    return {
      projectId,
      continuityPlan,
      summary: continuityPlan.summary ?? null,
      project: serializedProject,
    };
  }

  applyBusinessContinuityAction({ projectId, actionInput = {} } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const normalizedActionInput = actionInput && typeof actionInput === "object" ? actionInput : {};
    const actionType = typeof normalizedActionInput.actionType === "string"
      ? normalizedActionInput.actionType
      : "trigger-continuity-health-check";
    const previousPlan = project.manualContext?.continuityPlan ?? project.context?.continuityPlan ?? {};
    const nextPlan = {
      ...(previousPlan ?? {}),
      previousLifecycleState:
        project.context?.businessContinuityState?.lifecycleState
        ?? previousPlan.previousLifecycleState
        ?? null,
      failover: {
        ...(previousPlan.failover ?? {}),
        enabled:
          actionType === "prepare-failover" || actionType === "force-failover"
            ? true
            : (typeof previousPlan.failover?.enabled === "boolean" ? previousPlan.failover.enabled : false),
      },
    };

    if (actionType === "resume-normal") {
      nextPlan.forcedLifecycleState = "normal";
    } else if (actionType === "start-recovery") {
      nextPlan.forcedLifecycleState = "recovery";
    } else if (actionType === "force-failover") {
      nextPlan.forcedLifecycleState = "failover";
    } else if (actionType === "mark-incident") {
      nextPlan.forcedLifecycleState = "incident";
    } else {
      nextPlan.forcedLifecycleState = previousPlan.forcedLifecycleState ?? null;
    }

    project.manualContext = {
      ...(project.manualContext ?? {}),
      continuityPlan: nextPlan,
      ownerContinuityDecision: {
        decisionId: `owner-continuity-decision:${projectId}:${Date.now()}`,
        decisionType: actionType,
        reason: typeof normalizedActionInput.reason === "string" ? normalizedActionInput.reason : null,
        requestFailover: actionType === "prepare-failover" || actionType === "force-failover",
        decidedAt: new Date().toISOString(),
      },
    };

    const serializedProject = this.rebuildContext(projectId);
    return {
      projectId,
      actionType,
      businessContinuityState:
        serializedProject?.businessContinuityState
        ?? serializedProject?.state?.businessContinuityState
        ?? null,
      project: serializedProject,
    };
  }

  buildAuthPayloadState({
    authenticationState = null,
    sessionState = null,
    verificationFlowState = null,
    workspaceModel = null,
  } = {}) {
    const { authenticationRouteDecision } = createAuthenticationRouteResolver({
      authenticationState,
      sessionState,
    });
    const { authenticationViewState } = buildAuthenticationScreenStates({
      authenticationRouteDecision,
      verificationFlowState,
    });
    const { postAuthRedirect } = createPostAuthRedirectResolver({
      authenticationRouteDecision,
      sessionState,
      workspaceModel,
    });

    return {
      authenticationRouteDecision,
      authenticationViewState,
      postAuthRedirect,
    };
  }

  buildOwnerSecurityPayloadState({
    userIdentity = null,
    authenticationState = null,
    sessionState = null,
    membershipRecord = null,
    workspaceModel = null,
    ownerSecurityContext = null,
  } = {}) {
    const { sessionSecurityDecision } = createSessionSecurityControls({
      sessionState: {
        ...(sessionState && typeof sessionState === "object" ? sessionState : {}),
        ...(ownerSecurityContext?.sessionState && typeof ownerSecurityContext.sessionState === "object"
          ? ownerSecurityContext.sessionState
          : {}),
      },
      securitySignals: ownerSecurityContext?.securitySignals ?? null,
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
      requestContext: ownerSecurityContext,
    });

    return {
      sessionSecurityDecision,
      ownerAuthState,
      ownerMfaDecision,
    };
  }

  signupUser({ userInput, credentials } = {}) {
    const profile = userInput && typeof userInput === "object" ? userInput : {};
    const authInput = credentials && typeof credentials === "object" ? credentials : {};
    const userId = profile.userId ?? `user-${this.users.size + 1}`;
    const email = typeof profile.email === "string" ? profile.email : null;

    const { credentialReference, encryptedCredential, credentialVaultRecord } = createCredentialVaultInterface({
      credentialKey: `${userId}-auth-password`,
      credentialValue: authInput.password ?? null,
    });
    const { userIdentity } = defineUserIdentitySchema({
      userProfile: {
        userId,
        email,
        displayName: profile.displayName ?? email ?? userId,
        status: "active",
        verificationStatus: profile.verificationStatus ?? (email ? "verified" : "unverified"),
      },
      authMetadata: {
        provider: authInput.authMethod ?? "password",
        sessionStatus: "authenticated",
        hasMfa: authInput.hasMfa ?? false,
        lastLoginAt: new Date().toISOString(),
      },
    });
    const { authenticationState } = createAuthenticationSystem({
      userIdentity,
      credentials: {
        authMethod: authInput.authMethod ?? "password",
        password: authInput.password ?? null,
      },
    });
    const { sessionState, tokenBundle } = createSessionAndTokenManagement({
      userIdentity,
      authenticationState,
    });
    const { verificationFlowState } = createPasswordResetAndEmailVerificationFlow({
      userIdentity,
      verificationRequest: {
        flowType: email ? "email-verification" : "password-reset",
      },
    });
    const { workspaceModel, membershipRecord } = defineWorkspaceAndMembershipModel({
      userIdentity,
      workspaceMetadata: {
        workspaceId: `workspace-${userId}`,
        ownerUserId: userId,
      },
    });
    const { sessionSecurityDecision, ownerAuthState, ownerMfaDecision } = this.buildOwnerSecurityPayloadState({
      userIdentity,
      authenticationState,
      sessionState,
      membershipRecord,
      workspaceModel,
    });
    const { authenticationRouteDecision, authenticationViewState, postAuthRedirect } = this.buildAuthPayloadState({
      authenticationState,
      sessionState,
      verificationFlowState,
      workspaceModel,
    });

    const authPayload = {
      userIdentity,
      authenticationState,
      ownerAuthState,
      ownerMfaDecision,
      sessionState,
      sessionSecurityDecision,
      tokenBundle,
      authenticationRouteDecision,
      verificationFlowState,
      authenticationViewState,
      postAuthRedirect,
      workspaceModel,
      membershipRecord,
      credentialReference,
      encryptedCredential,
      credentialVaultRecord,
    };

    const persistedAuthPayload = this.persistUserAuthPayload(authPayload);
    return { authPayload: persistedAuthPayload ?? authPayload };
  }

  loginUser({ userInput, credentials } = {}) {
    const profile = userInput && typeof userInput === "object" ? userInput : {};
    const authInput = credentials && typeof credentials === "object" ? credentials : {};
    const existing = this.findUserRecord(profile);

    if (!existing) {
      return null;
    }

    const { authenticationState } = createAuthenticationSystem({
      userIdentity: existing.userIdentity,
      credentials: {
        authMethod: authInput.authMethod ?? existing.authenticationState?.authMethod ?? "password",
        password: authInput.password ?? null,
        providerToken: authInput.providerToken ?? null,
      },
    });
    const { sessionState, tokenBundle } = createSessionAndTokenManagement({
      userIdentity: existing.userIdentity,
      authenticationState,
    });
    const { verificationFlowState } = createPasswordResetAndEmailVerificationFlow({
      userIdentity: existing.userIdentity,
      verificationRequest: existing.verificationFlowState?.flowType
        ? {
            flowType: existing.verificationFlowState.flowType,
            requestedAt: existing.verificationFlowState.issuedAt,
            expiresAt: existing.verificationFlowState.expiresAt,
            completed: existing.verificationFlowState.status === "verified"
              || existing.verificationFlowState.status === "completed",
          }
        : null,
    });
    const { sessionSecurityDecision, ownerAuthState, ownerMfaDecision } = this.buildOwnerSecurityPayloadState({
      userIdentity: existing.userIdentity,
      authenticationState,
      sessionState,
      membershipRecord: existing.membershipRecord,
      workspaceModel: existing.workspaceModel,
      ownerSecurityContext: authInput.ownerSecurityContext ?? null,
    });
    const { authenticationRouteDecision, authenticationViewState, postAuthRedirect } = this.buildAuthPayloadState({
      authenticationState,
      sessionState,
      verificationFlowState,
      workspaceModel: existing.workspaceModel,
    });

    const authPayload = {
      ...existing,
      authenticationState,
      ownerAuthState,
      ownerMfaDecision,
      sessionState,
      sessionSecurityDecision,
      tokenBundle,
      authenticationRouteDecision,
      verificationFlowState,
      authenticationViewState,
      postAuthRedirect,
    };
    const persistedAuthPayload = this.persistUserAuthPayload(authPayload);
    return { authPayload: persistedAuthPayload ?? authPayload };
  }

  logoutUser({ userInput } = {}) {
    const profile = userInput && typeof userInput === "object" ? userInput : {};
    const existing = this.findUserRecord(profile);

    if (!existing) {
      return null;
    }

    const { authenticationState } = createAuthenticationSystem({
      userIdentity: existing.userIdentity,
      credentials: {
        authMethod: existing.authenticationState?.authMethod ?? "password",
        isLoggedOut: true,
      },
    });
    const { sessionState, tokenBundle } = createSessionAndTokenManagement({
      userIdentity: existing.userIdentity,
      authenticationState,
    });
    const { verificationFlowState } = createPasswordResetAndEmailVerificationFlow({
      userIdentity: existing.userIdentity,
      verificationRequest: existing.verificationFlowState?.flowType
        ? {
            flowType: existing.verificationFlowState.flowType,
            requestedAt: existing.verificationFlowState.issuedAt,
            expiresAt: existing.verificationFlowState.expiresAt,
            completed: existing.verificationFlowState.status === "verified"
              || existing.verificationFlowState.status === "completed",
          }
        : null,
    });
    const { sessionSecurityDecision, ownerAuthState, ownerMfaDecision } = this.buildOwnerSecurityPayloadState({
      userIdentity: existing.userIdentity,
      authenticationState,
      sessionState,
      membershipRecord: existing.membershipRecord,
      workspaceModel: existing.workspaceModel,
    });
    const { authenticationRouteDecision, authenticationViewState, postAuthRedirect } = this.buildAuthPayloadState({
      authenticationState,
      sessionState,
      verificationFlowState,
      workspaceModel: existing.workspaceModel,
    });

    const authPayload = {
      ...existing,
      authenticationState,
      ownerAuthState,
      ownerMfaDecision,
      sessionState,
      sessionSecurityDecision,
      tokenBundle,
      authenticationRouteDecision,
      verificationFlowState,
      authenticationViewState,
      postAuthRedirect,
    };
    const persistedAuthPayload = this.persistUserAuthPayload(authPayload);
    return { authPayload: persistedAuthPayload ?? authPayload };
  }

  requestEmailVerification({ userInput, verificationRequest } = {}) {
    const profile = userInput && typeof userInput === "object" ? userInput : {};
    const existing = this.findUserRecord(profile);

    if (!existing) {
      return null;
    }

    const { verificationFlowState } = createPasswordResetAndEmailVerificationFlow({
      userIdentity: existing.userIdentity,
      verificationRequest: {
        ...verificationRequest,
        flowType: "email-verification",
      },
    });
    const { authenticationRouteDecision, authenticationViewState, postAuthRedirect } = this.buildAuthPayloadState({
      authenticationState: existing.authenticationState,
      sessionState: existing.sessionState,
      verificationFlowState,
      workspaceModel: existing.workspaceModel,
    });
    const { sessionSecurityDecision, ownerAuthState, ownerMfaDecision } = this.buildOwnerSecurityPayloadState({
      userIdentity: existing.userIdentity,
      authenticationState: existing.authenticationState,
      sessionState: existing.sessionState,
      membershipRecord: existing.membershipRecord,
      workspaceModel: existing.workspaceModel,
    });

    const authPayload = {
      ...existing,
      ownerAuthState,
      ownerMfaDecision,
      sessionSecurityDecision,
      authenticationRouteDecision,
      verificationFlowState,
      authenticationViewState,
      postAuthRedirect,
    };
    const persistedAuthPayload = this.persistUserAuthPayload(authPayload);
    return { authPayload: persistedAuthPayload ?? authPayload };
  }

  requestPasswordReset({ userInput, verificationRequest } = {}) {
    const profile = userInput && typeof userInput === "object" ? userInput : {};
    const existing = this.findUserRecord(profile);

    if (!existing) {
      return null;
    }

    const { verificationFlowState } = createPasswordResetAndEmailVerificationFlow({
      userIdentity: existing.userIdentity,
      verificationRequest: {
        ...verificationRequest,
        flowType: "password-reset",
      },
    });
    const { authenticationRouteDecision, authenticationViewState, postAuthRedirect } = this.buildAuthPayloadState({
      authenticationState: existing.authenticationState,
      sessionState: existing.sessionState,
      verificationFlowState,
      workspaceModel: existing.workspaceModel,
    });
    const { sessionSecurityDecision, ownerAuthState, ownerMfaDecision } = this.buildOwnerSecurityPayloadState({
      userIdentity: existing.userIdentity,
      authenticationState: existing.authenticationState,
      sessionState: existing.sessionState,
      membershipRecord: existing.membershipRecord,
      workspaceModel: existing.workspaceModel,
    });

    const authPayload = {
      ...existing,
      ownerAuthState,
      ownerMfaDecision,
      sessionSecurityDecision,
      authenticationRouteDecision,
      verificationFlowState,
      authenticationViewState,
      postAuthRedirect,
    };
    const persistedAuthPayload = this.persistUserAuthPayload(authPayload);
    return { authPayload: persistedAuthPayload ?? authPayload };
  }

  inviteWorkspaceMember({ userInput, invitationRequest } = {}) {
    const profile = userInput && typeof userInput === "object" ? userInput : {};
    const existing = this.findUserRecord(profile);

    if (!existing) {
      return null;
    }

    const { invitationRecord, roleAssignment } = createRoleAssignmentAndInvitationFlow({
      workspaceModel: existing.workspaceModel,
      invitationRequest,
    });

    const authPayload = {
      ...existing,
      invitationRecord,
      roleAssignment,
    };
    const persistedAuthPayload = this.persistUserAuthPayload(authPayload);
    return { authPayload: persistedAuthPayload ?? authPayload };
  }

  updateWorkspaceSettings({ userInput, settingsInput } = {}) {
    const profile = userInput && typeof userInput === "object" ? userInput : {};
    const existing = this.findUserRecord(profile);

    if (!existing) {
      return null;
    }

    const { workspaceSettings } = createOrganizationWorkspaceSettingsModule({
      workspaceModel: existing.workspaceModel,
      settingsInput,
    });

    const authPayload = {
      ...existing,
      workspaceSettings,
    };
    const persistedAuthPayload = this.persistUserAuthPayload(authPayload);
    return { authPayload: persistedAuthPayload ?? authPayload };
  }

  rebuildProjectTeamSecurity(project) {
    if (!project) {
      return null;
    }

    const { workspaceModel, teamMembershipBoundary } = buildProjectTeamBoundary({
      project,
      workspaceModel: project.state?.workspaceModel ?? project.context?.workspaceModel ?? null,
    });
    const projectType = normalizeString(
      project.state?.artifactExpectation?.projectType,
      normalizeString(project.state?.projectType, normalizeString(project.state?.domainClassification?.domain, "generic")),
    );
    const { projectPermissionSchema } = defineProjectPermissionSchema({
      workspaceModel,
      projectType,
    });
    const { roleCapabilityMatrix } = createProjectRoleCapabilityMatrix({
      projectPermissionSchema,
    });
    const { tenantIsolationSchema } = defineTenantIsolationSchema({
      workspaceModel,
    });
    const { workspaceIsolationDecision } = createWorkspaceIsolationGuard({
      tenantIsolationSchema,
      requestContext: {
        workspaceId: workspaceModel?.workspaceId ?? null,
        resourceType: "project-state",
        resourceId: `project-state:${project.id}`,
        actionType: "view",
      },
    });

    project.userId = workspaceModel.ownerUserId;
    project.state = {
      ...(project.state ?? {}),
      workspaceModel,
      teamMembershipBoundary,
      projectPermissionSchema,
      roleCapabilityMatrix,
      tenantIsolationSchema,
      workspaceIsolationDecision,
    };
    project.context = {
      ...(project.context ?? {}),
      workspaceModel,
      teamMembershipBoundary,
      projectPermissionSchema,
      roleCapabilityMatrix,
      tenantIsolationSchema,
      workspaceIsolationDecision,
    };
    project.manualContext = {
      ...(project.manualContext ?? {}),
      workspaceMetadata: workspaceModel,
    };
    return this.persistProjectRecord(project) ?? project;
  }

  getProjectTeamBoundary(projectId, { userId = null } = {}) {
    const project = this.projects.get(projectId);
    if (!project || (userId && !isProjectAccessibleToUser(project, userId))) {
      return null;
    }
    const refreshedProject = this.rebuildProjectTeamSecurity(project);
    return {
      projectId,
      workspaceModel: refreshedProject.state?.workspaceModel ?? null,
      teamMembershipBoundary: refreshedProject.state?.teamMembershipBoundary ?? null,
    };
  }

  inviteProjectMember(projectId, { actorUserId = null, invitationRequest = {} } = {}) {
    const project = this.projects.get(projectId);
    if (!project || !isProjectAccessibleToUser(project, actorUserId)) {
      return null;
    }
    const actorRole = actorUserId === resolveProjectOwnerUserId(project)
      ? "owner"
      : normalizeTeamRole(
          normalizeArray(project.state?.workspaceModel?.members)
            .find((member) => member.userId === actorUserId)?.role,
          "viewer",
        );
    if (!["owner", "admin"].includes(actorRole)) {
      return {
        httpStatus: 403,
        error: "Only owners and admins can invite team members",
        reason: "team-invite-not-authorized",
      };
    }

    const { invitationRecord, roleAssignment } = createRoleAssignmentAndInvitationFlow({
      workspaceModel: project.state?.workspaceModel ?? project.context?.workspaceModel ?? null,
      invitationRequest: {
        ...invitationRequest,
        role: normalizeTeamRole(invitationRequest?.role, "viewer"),
        invitedBy: actorUserId,
      },
    });
    const nextWorkspaceModel = {
      ...(project.state?.workspaceModel ?? project.context?.workspaceModel ?? {}),
      invitations: [
        ...normalizeArray(project.state?.workspaceModel?.invitations ?? project.context?.workspaceModel?.invitations),
        {
          ...invitationRecord,
          roleAssignment,
          deliveryBoundary: "local-record-only-no-email-provider",
        },
      ],
    };
    project.state = { ...(project.state ?? {}), workspaceModel: nextWorkspaceModel };
    project.context = { ...(project.context ?? {}), workspaceModel: nextWorkspaceModel };
    project.manualContext = { ...(project.manualContext ?? {}), workspaceMetadata: nextWorkspaceModel };
    const refreshedProject = this.rebuildProjectTeamSecurity(project);
    return {
      httpStatus: invitationRecord.status === "pending" ? 201 : 400,
      invitationRecord,
      roleAssignment,
      project: this.serializeProject(refreshedProject),
    };
  }

  acceptProjectInvitation(projectId, { actorUserId = null, email = null, invitationId = null } = {}) {
    const project = this.projects.get(projectId);
    const normalizedEmail = normalizeString(email, null);
    if (!project || !normalizedEmail || !actorUserId) {
      return null;
    }
    const workspaceModel = project.state?.workspaceModel ?? project.context?.workspaceModel ?? {};
    const invitations = normalizeArray(workspaceModel.invitations);
    const invitation = invitations.find((entry) => (
      (invitationId && entry.invitationId === invitationId)
      || (!invitationId && entry.email === normalizedEmail && entry.status === "pending")
    ));
    if (!invitation || invitation.status !== "pending") {
      return {
        httpStatus: 404,
        error: "Invitation not found",
        reason: "team-invitation-not-found",
      };
    }
    const nextInvitations = invitations.map((entry) => entry.invitationId === invitation.invitationId
      ? { ...entry, status: "accepted", acceptedBy: actorUserId, acceptedAt: new Date().toISOString() }
      : entry);
    const nextMember = createProjectTeamMember({
      workspaceId: workspaceModel.workspaceId,
      userId: actorUserId,
      email: normalizedEmail,
      displayName: normalizedEmail,
      role: invitation.role,
      status: "active",
      isOwner: false,
    });
    project.state = {
      ...(project.state ?? {}),
      workspaceModel: {
        ...workspaceModel,
        invitations: nextInvitations,
        members: [...normalizeArray(workspaceModel.members), nextMember],
      },
    };
    project.context = { ...(project.context ?? {}), workspaceModel: project.state.workspaceModel };
    project.manualContext = { ...(project.manualContext ?? {}), workspaceMetadata: project.state.workspaceModel };
    const refreshedProject = this.rebuildProjectTeamSecurity(project);
    return {
      httpStatus: 200,
      membershipRecord: nextMember,
      project: this.serializeProject(refreshedProject),
    };
  }

  removeProjectMember(projectId, { actorUserId = null, memberUserId = null } = {}) {
    const project = this.projects.get(projectId);
    if (!project || !isProjectAccessibleToUser(project, actorUserId)) {
      return null;
    }
    if (actorUserId !== resolveProjectOwnerUserId(project)) {
      return {
        httpStatus: 403,
        error: "Only the owner can remove team members",
        reason: "team-remove-not-authorized",
      };
    }
    const workspaceModel = project.state?.workspaceModel ?? project.context?.workspaceModel ?? {};
    if (memberUserId === workspaceModel.ownerUserId) {
      return {
        httpStatus: 409,
        error: "Transfer ownership before removing the owner",
        reason: "owner-removal-blocked",
      };
    }
    project.state = {
      ...(project.state ?? {}),
      workspaceModel: {
        ...workspaceModel,
        members: normalizeArray(workspaceModel.members).map((member) => member.userId === memberUserId
          ? { ...member, status: "removed", removedAt: new Date().toISOString(), removedBy: actorUserId }
          : member),
      },
    };
    project.context = { ...(project.context ?? {}), workspaceModel: project.state.workspaceModel };
    project.manualContext = { ...(project.manualContext ?? {}), workspaceMetadata: project.state.workspaceModel };
    const refreshedProject = this.rebuildProjectTeamSecurity(project);
    return { httpStatus: 200, project: this.serializeProject(refreshedProject) };
  }

  transferProjectOwnership(projectId, { actorUserId = null, nextOwnerUserId = null } = {}) {
    const project = this.projects.get(projectId);
    if (!project || actorUserId !== resolveProjectOwnerUserId(project)) {
      return {
        httpStatus: 403,
        error: "Only the current owner can transfer ownership",
        reason: "ownership-transfer-not-authorized",
      };
    }
    const workspaceModel = project.state?.workspaceModel ?? project.context?.workspaceModel ?? {};
    const nextOwner = normalizeArray(workspaceModel.members).find((member) => (
      member.userId === nextOwnerUserId && !["removed", "disabled"].includes(normalizeString(member.status, "active"))
    ));
    if (!nextOwner) {
      return {
        httpStatus: 404,
        error: "Next owner must be an active member",
        reason: "next-owner-not-active-member",
      };
    }
    project.state = {
      ...(project.state ?? {}),
      workspaceModel: {
        ...workspaceModel,
        ownerUserId: nextOwnerUserId,
        members: normalizeArray(workspaceModel.members).map((member) => {
          if (member.userId === nextOwnerUserId) return { ...member, role: "owner", isOwner: true };
          if (member.userId === actorUserId) return { ...member, role: "admin", isOwner: false };
          return { ...member, isOwner: false };
        }),
      },
    };
    project.context = { ...(project.context ?? {}), workspaceModel: project.state.workspaceModel };
    project.manualContext = { ...(project.manualContext ?? {}), workspaceMetadata: project.state.workspaceModel };
    const refreshedProject = this.rebuildProjectTeamSecurity(project);
    return { httpStatus: 200, project: this.serializeProject(refreshedProject) };
  }

  updateUserProfile({ userInput, profileInput } = {}) {
    const profile = userInput && typeof userInput === "object" ? userInput : {};
    const nextProfile = profileInput && typeof profileInput === "object" ? profileInput : {};
    const existing = this.findUserRecord(profile);

    if (!existing) {
      return null;
    }

    const accountAction = applyFirstReleaseAccountAction({
      authPayload: existing,
      actionType: "update-profile",
      payload: nextProfile,
      actorUserId: existing.userIdentity?.userId ?? profile.userId ?? null,
    });
    const userIdentity = accountAction.authPayload.userIdentity;

    const membershipRecord = existing.membershipRecord
      ? {
          ...existing.membershipRecord,
          memberProfile: {
            ...(existing.membershipRecord.memberProfile ?? {}),
            displayName: userIdentity.displayName,
            email: userIdentity.email,
          },
        }
      : existing.membershipRecord;

    const authPayload = {
      ...accountAction.authPayload,
      userIdentity,
      membershipRecord,
    };

    const persistedAuthPayload = this.persistUserAuthPayload(authPayload);
    return { authPayload: persistedAuthPayload ?? authPayload };
  }

  updateNotificationPreferences({ userInput, preferenceInput } = {}) {
    const profile = userInput && typeof userInput === "object" ? userInput : {};
    const existing = this.findUserRecord(profile);

    if (!existing) {
      return null;
    }

    const { notificationPreferences } = createNotificationPreferenceSettings({
      userIdentity: existing.userIdentity,
      preferenceInput,
    });

    const authPayload = {
      ...existing,
      notificationPreferences,
    };

    const persistedAuthPayload = this.persistUserAuthPayload(authPayload);
    return { authPayload: persistedAuthPayload ?? authPayload };
  }

  seedDemoProject() {
    const projectId = "giftwallet";
    if (this.projects.has(projectId)) {
      return this.projects.get(projectId);
    }

    const project = {
      id: projectId,
      userId: "demo-user",
      name: "GiftWallet",
      goal: "להשיק MVP עם 100 המשתמשים הראשונים ובעלות תשתית נמוכה.",
      status: "blocked",
      path: "/projects/giftwallet",
      stack: "Node.js, PostgreSQL, React Native",
      state: {
        businessGoal: "להשיק MVP עם 100 המשתמשים הראשונים ובעלות תשתית נמוכה.",
        product: {
          hasAuth: false,
          hasStagingEnvironment: false,
          hasLandingPage: false,
          hasPaymentIntegration: false,
        },
        analytics: {
          hasBaselineCampaign: false,
        },
        knowledge: {
          knownGaps: ["אין שכבת התחברות", "אין משפך שיווקי", "אין סביבת Staging"],
        },
        stack: {
          frontend: "React Native",
          backend: "Node.js",
          database: "PostgreSQL",
        },
      },
      agents: this.createDefaultAgents(),
      approvals: [
        "בחר שיטת התחברות: magic link או סיסמה",
        "חבר את מאגר ה-GitHub של הפרויקט",
        "הזן דומיין עבור סביבת ה-Staging",
      ],
      manualContext: null,
      normalizedSources: null,
      context: null,
      scan: null,
      analysis: null,
      gitSource: null,
      gitSnapshot: null,
      runtimeSource: null,
      runtimeSnapshot: null,
      notionSource: null,
      notionSnapshot: null,
      cycle: null,
      runtimeResults: [],
      taskResults: [],
      linkedAccounts: [],
      approvalRecords: [],
      snapshotSchedule: null,
      snapshotBackupWorker: null,
      snapshotJobState: null,
      snapshotWorkerRuntime: null,
      snapshotRetentionPolicy: null,
      snapshotRetentionDecision: null,
      snapshotPreChangeTriggerState: {},
      continuityPlan: null,
      disasterRecoveryChecklist: null,
      businessContinuityState: null,
    };

    this.projects.set(projectId, project);
    this.scanProject(projectId, process.cwd());
    this.rebuildContext(projectId);
    this.runCycle(projectId);
    return this.projects.get(projectId);
  }

  seedCasinoProject() {
    const projectId = "royal-casino";
    if (this.projects.has(projectId)) {
      return this.projects.get(projectId);
    }

    const project = {
      id: projectId,
      userId: "casino-user",
      name: "Royal Casino",
      goal: "להשלים את מערכת הקזינו כך שתכלול התחברות, ארנק, תשלומים וזרימות משחק מלאות.",
      status: "idle",
      path: "",
      stack: "",
      source: {
        type: "casino-api",
        baseUrl: process.env.CASINO_NEXUS_BASE_URL || "http://localhost:4101",
        apiKey: process.env.CASINO_NEXUS_API_KEY || "",
      },
      state: {
        businessGoal: "להשלים את מערכת הקזינו כך שתכלול התחברות, ארנק, תשלומים וזרימות משחק מלאות.",
        product: {
          hasAuth: false,
          hasStagingEnvironment: false,
          hasLandingPage: false,
          hasPaymentIntegration: false,
        },
        analytics: {
          hasBaselineCampaign: false,
        },
        knowledge: {
          knownGaps: [],
        },
        stack: {
          frontend: "לא זוהה",
          backend: "לא זוהה",
          database: "לא זוהה",
        },
      },
      agents: this.createDefaultAgents(),
      approvals: [],
      manualContext: null,
      normalizedSources: null,
      context: null,
      scan: null,
      analysis: null,
      externalSnapshot: null,
      gitSource: null,
      gitSnapshot: null,
      runtimeSource: null,
      runtimeSnapshot: null,
      notionSource: null,
      notionSnapshot: null,
      cycle: null,
      runtimeResults: [],
      taskResults: [],
      linkedAccounts: [],
      approvalRecords: [],
      snapshotSchedule: null,
      snapshotBackupWorker: null,
      snapshotJobState: null,
      snapshotWorkerRuntime: null,
      snapshotRetentionPolicy: null,
      snapshotRetentionDecision: null,
      snapshotPreChangeTriggerState: {},
      continuityPlan: null,
      disasterRecoveryChecklist: null,
      businessContinuityState: null,
    };

    this.projects.set(projectId, project);
    this.rebuildContext(projectId);
    return project;
  }

  listProjects(options = {}) {
    const userId = normalizeString(options?.userId, null);
    const allowUnowned = options?.allowUnowned === true;
    return [...this.projects.values()]
      .filter((project) => userId ? isProjectAccessibleToUser(project, userId, { allowUnowned }) : true)
      .map((project) => this.serializeProject(project));
  }

  getProject(projectId, options = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }
    const userId = normalizeString(options?.userId, null);
    if (userId && !isProjectAccessibleToUser(project, userId, { allowUnowned: options?.allowUnowned === true })) {
      return null;
    }

    return this.serializeProject(project);
  }

  getProjectTruthEnvelope(projectId) {
    const project = this.getProject(projectId);
    if (!project) {
      return null;
    }

    return {
      projectId: project.id,
      projectName: project.name,
      canonicalTruthOwner: "project-service",
      truthSource: "serialized-project-record",
      projectState: project.state ?? null,
      productGraph: project.cycle?.executionGraph ?? null,
      roadmap: project.cycle?.roadmap ?? [],
      workspaceModel: project.state?.workspaceModel ?? project.context?.workspaceModel ?? null,
      continuityPlan: project.continuityPlan ?? project.context?.continuityPlan ?? null,
      snapshotRecord: project.context?.snapshotRecord ?? null,
      releaseReadinessEvaluation:
        project.releaseReadinessEvaluation
        ?? project.state?.releaseReadinessEvaluation
        ?? project.context?.releaseReadinessEvaluation
        ?? null,
      shellAnchors: {
        proofArtifact: project.proofArtifact ?? null,
        generatedSurfaceProofSchema: project.generatedSurfaceProofSchema ?? null,
        dashboardHomeSurface: project.dashboardHomeSurface ?? null,
        unifiedHomeDashboard: project.unifiedHomeDashboard ?? null,
      },
    };
  }

  getProjectRecoveryEnvelope({ projectId, refresh = false } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    if (refresh) {
      this.rebuildContext(projectId);
    }

    const serializedProject = this.serializeProject(project);

    return {
      projectId,
      projectName: serializedProject.name,
      canonicalTruthOwner: "project-service",
      truthSource: "serialized-project-record",
      workspaceModel:
        serializedProject.state?.workspaceModel
        ?? serializedProject.context?.workspaceModel
        ?? null,
      projectStateSnapshot:
        serializedProject.projectStateSnapshot
        ?? serializedProject.state?.projectStateSnapshot
        ?? serializedProject.context?.projectStateSnapshot
        ?? null,
      snapshotRecord:
        serializedProject.snapshotRecord
        ?? serializedProject.state?.snapshotRecord
        ?? serializedProject.context?.snapshotRecord
        ?? null,
      snapshotSchedule:
        serializedProject.snapshotSchedule
        ?? serializedProject.state?.snapshotSchedule
        ?? serializedProject.context?.snapshotSchedule
        ?? null,
      snapshotBackupWorker:
        serializedProject.snapshotBackupWorker
        ?? serializedProject.state?.snapshotBackupWorker
        ?? serializedProject.context?.snapshotBackupWorker
        ?? null,
      snapshotJobState:
        serializedProject.snapshotJobState
        ?? serializedProject.state?.snapshotJobState
        ?? serializedProject.context?.snapshotJobState
        ?? null,
      snapshotWorkerRuntime:
        serializedProject.snapshotWorkerRuntime
        ?? serializedProject.state?.snapshotWorkerRuntime
        ?? serializedProject.context?.snapshotWorkerRuntime
        ?? null,
      snapshotRetentionPolicy:
        serializedProject.snapshotRetentionPolicy
        ?? serializedProject.state?.snapshotRetentionPolicy
        ?? serializedProject.context?.snapshotRetentionPolicy
        ?? null,
      snapshotRetentionDecision:
        serializedProject.snapshotRetentionDecision
        ?? serializedProject.state?.snapshotRetentionDecision
        ?? serializedProject.context?.snapshotRetentionDecision
        ?? null,
      continuityPlan:
        serializedProject.continuityPlan
        ?? serializedProject.state?.continuityPlan
        ?? serializedProject.context?.continuityPlan
        ?? null,
      disasterRecoveryChecklist:
        serializedProject.disasterRecoveryChecklist
        ?? serializedProject.state?.disasterRecoveryChecklist
        ?? serializedProject.context?.disasterRecoveryChecklist
        ?? null,
      businessContinuityState:
        serializedProject.businessContinuityState
        ?? serializedProject.state?.businessContinuityState
        ?? serializedProject.context?.businessContinuityState
        ?? null,
      rollbackPlan:
        serializedProject.rollbackPlan
        ?? serializedProject.state?.rollbackPlan
        ?? serializedProject.context?.rollbackPlan
        ?? null,
      restoreDecision:
        serializedProject.restoreDecision
        ?? serializedProject.state?.restoreDecision
        ?? serializedProject.context?.restoreDecision
        ?? null,
      rollbackExecutionResult:
        serializedProject.rollbackExecutionResult
        ?? serializedProject.state?.rollbackExecutionResult
        ?? serializedProject.context?.rollbackExecutionResult
        ?? null,
      releaseReadinessEvaluation:
        serializedProject.releaseReadinessEvaluation
        ?? serializedProject.state?.releaseReadinessEvaluation
        ?? serializedProject.context?.releaseReadinessEvaluation
        ?? null,
      shellAnchors: {
        latestSnapshotId:
          serializedProject.snapshotRecord?.snapshotRecordId
          ?? serializedProject.state?.snapshotRecord?.snapshotRecordId
          ?? serializedProject.context?.snapshotRecord?.snapshotRecordId
          ?? null,
        recoveryReadinessScore:
          serializedProject.disasterRecoveryChecklist?.summary?.readinessScore
          ?? serializedProject.state?.disasterRecoveryChecklist?.summary?.readinessScore
          ?? serializedProject.context?.disasterRecoveryChecklist?.summary?.readinessScore
          ?? null,
        continuityLifecycleState:
          serializedProject.businessContinuityState?.lifecycleState
          ?? serializedProject.state?.businessContinuityState?.lifecycleState
          ?? serializedProject.context?.businessContinuityState?.lifecycleState
          ?? null,
        rollbackExecutionStatus:
          serializedProject.rollbackExecutionResult?.executionStatus
          ?? serializedProject.state?.rollbackExecutionResult?.executionStatus
          ?? serializedProject.context?.rollbackExecutionResult?.executionStatus
          ?? null,
      },
    };
  }

  getProjectArtifactGenerationEnvelope({ projectId, refresh = false } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    if (refresh) {
      this.rebuildContext(projectId);
    }

    const serializedProject = this.serializeProject(project);
    const proofArtifact = buildCanonicalProofArtifact({
      project,
      previewScreenViewModel: project.context?.previewScreenViewModel ?? null,
      generatedSurfaceProofSchema: project.context?.generatedSurfaceProofSchema ?? null,
      aiControlCenterSurface: project.context?.aiControlCenterSurface ?? null,
      proposalApplyDecision: project.context?.proposalApplyDecision ?? null,
      artifactExpectation: project.context?.artifactExpectation ?? serializedProject.artifactExpectation ?? null,
    });
    const artifactExpectation =
      serializedProject.artifactExpectation
      ?? serializedProject.context?.artifactExpectation
      ?? proofArtifact.artifactExpectation
      ?? null;

    return {
      projectId,
      projectName: serializedProject.name,
      canonicalTruthOwner: "project-service",
      truthSource: "canonical-proof-artifact-engine",
      surfaceMode: "hidden-engine",
      engineRole: "artifact-generation-for-new-shell",
      artifactExpectation,
      proofArtifact,
      previewScreenViewModel:
        serializedProject.previewScreenViewModel
        ?? serializedProject.context?.previewScreenViewModel
        ?? null,
      generatedSurfaceProofSchema:
        serializedProject.generatedSurfaceProofSchema
        ?? serializedProject.context?.generatedSurfaceProofSchema
        ?? null,
      aiControlCenterSurface:
        serializedProject.aiControlCenterSurface
        ?? serializedProject.context?.aiControlCenterSurface
        ?? null,
      proposalApplyDecision:
        serializedProject.proposalApplyDecision
        ?? serializedProject.context?.proposalApplyDecision
        ?? null,
      generationIntent:
        serializedProject.generationIntent
        ?? serializedProject.context?.generationIntent
        ?? null,
      classAwareGenerationContract:
        serializedProject.classAwareGenerationContract
        ?? serializedProject.context?.classAwareGenerationContract
        ?? null,
      releaseReadinessEvaluation:
        serializedProject.releaseReadinessEvaluation
        ?? serializedProject.state?.releaseReadinessEvaluation
        ?? serializedProject.context?.releaseReadinessEvaluation
        ?? null,
      shellAnchors: {
        artifactId: proofArtifact.artifactId ?? null,
        artifactType: proofArtifact.artifactType ?? null,
        previewKind: proofArtifact.previewKind ?? null,
        artifactTitle: proofArtifact.title ?? null,
        artifactStatus: proofArtifact.status ?? null,
        canOpenArtifact: proofArtifact.actions?.open?.supported === true,
        canDownloadArtifact: proofArtifact.actions?.download?.supported === true,
        routeKey: proofArtifact.actions?.open?.routeKey ?? null,
        expectationId: artifactExpectation?.expectationId ?? null,
      },
    };
  }

  getProjectContinuityMemoryEnvelope({ projectId, refresh = false } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    if (refresh) {
      this.rebuildContext(projectId);
    }

    const serializedProject = this.serializeProject(project);
    const context = project.context ?? {};

    return {
      projectId,
      projectName: serializedProject.name,
      canonicalTruthOwner: "project-service",
      truthSource: "context-builder-continuity-memory-refresh",
      surfaceMode: "hidden-engine",
      engineRole: "continuity-memory-refresh-for-new-shell",
      workspaceModel:
        serializedProject.state?.workspaceModel
        ?? serializedProject.context?.workspaceModel
        ?? null,
      returnTomorrowContinuity:
        context.returnTomorrowContinuity
        ?? serializedProject.returnTomorrowContinuity
        ?? null,
      reactiveWorkspaceState:
        context.reactiveWorkspaceState
        ?? serializedProject.reactiveWorkspaceState
        ?? null,
      crossSurfaceContinuityContract:
        context.crossSurfaceContinuityContract
        ?? serializedProject.crossSurfaceContinuityContract
        ?? null,
      canonicalLearningSystemContract:
        context.canonicalLearningSystemContract
        ?? serializedProject.canonicalLearningSystemContract
        ?? null,
      learningInsights:
        context.learningInsights
        ?? serializedProject.learningInsights
        ?? null,
      learningInsightViewModel:
        context.learningInsightViewModel
        ?? serializedProject.learningInsightViewModel
        ?? null,
      userPreferenceSignals:
        context.userPreferenceSignals
        ?? serializedProject.userPreferenceSignals
        ?? null,
      crossProjectPatternPanel:
        context.crossProjectPatternPanel
        ?? serializedProject.crossProjectPatternPanel
        ?? null,
      learningDisclosure:
        context.learningDisclosure
        ?? serializedProject.learningDisclosure
        ?? null,
      userActivityEvent:
        context.userActivityEvent
        ?? serializedProject.userActivityEvent
        ?? null,
      userActivityHistory:
        context.userActivityHistory
        ?? serializedProject.userActivityHistory
        ?? null,
      userSessionMetric:
        context.userSessionMetric
        ?? serializedProject.userSessionMetric
        ?? null,
      userSessionHistory:
        context.userSessionHistory
        ?? serializedProject.userSessionHistory
        ?? null,
      returningUserMetric:
        context.returningUserMetric
        ?? serializedProject.returningUserMetric
        ?? null,
      retentionSummary:
        context.retentionSummary
        ?? serializedProject.retentionSummary
        ?? null,
      retentionCurveAnalysis:
        context.retentionCurveAnalysis
        ?? serializedProject.retentionCurveAnalysis
        ?? null,
      companionState:
        context.companionState
        ?? serializedProject.companionState
        ?? null,
      shellAnchors: {
        recommendedDestination:
          context.returnTomorrowContinuity?.recommendedDestination
          ?? serializedProject.returnTomorrowContinuity?.recommendedDestination
          ?? "workbench",
        returnContinuityStatus:
          context.returnTomorrowContinuity?.status
          ?? serializedProject.returnTomorrowContinuity?.status
          ?? null,
        refreshMode:
          context.reactiveWorkspaceState?.refreshMode
          ?? serializedProject.reactiveWorkspaceState?.refreshMode
          ?? null,
        crossSurfaceStatus:
          context.crossSurfaceContinuityContract?.status
          ?? serializedProject.crossSurfaceContinuityContract?.status
          ?? null,
        learningContractStatus:
          context.canonicalLearningSystemContract?.status
          ?? serializedProject.canonicalLearningSystemContract?.status
          ?? null,
        memoryLayerCount:
          context.canonicalLearningSystemContract?.memoryLayers?.length
          ?? serializedProject.canonicalLearningSystemContract?.memoryLayers?.length
          ?? 0,
        userActivityCount:
          context.userActivityHistory?.entries?.length
          ?? serializedProject.userActivityHistory?.entries?.length
          ?? 0,
        userSessionCount:
          context.userSessionHistory?.entries?.length
          ?? serializedProject.userSessionHistory?.entries?.length
          ?? 0,
        returningUser:
          context.returningUserMetric?.isReturningUser
          ?? serializedProject.returningUserMetric?.isReturningUser
          ?? null,
        retentionRate:
          context.retentionSummary?.retentionRate
          ?? serializedProject.retentionSummary?.retentionRate
          ?? null,
      },
    };
  }

  getUserAuthPayload(userId) {
    if (typeof userId !== "string" || !userId.trim()) {
      return null;
    }

    const authPayload = this.users.get(userId.trim());
    return authPayload ? { ...authPayload } : null;
  }

  verifySessionToken(token) {
    if (typeof token !== "string" || !token.trim()) {
      return null;
    }

    const normalizedToken = token.trim();
    for (const authPayload of this.users.values()) {
      const tokenBundle = authPayload?.tokenBundle ?? {};
      const sessionState = authPayload?.sessionState ?? {};
      const accessToken = typeof tokenBundle.accessToken === "string" ? tokenBundle.accessToken.trim() : null;
      if (!accessToken || accessToken !== normalizedToken) {
        continue;
      }

      if (sessionState.status !== "active" || sessionState.isRevoked === true) {
        return {
          verified: false,
          reason: "session-not-active",
          authPayload: { ...authPayload },
        };
      }

      if (sessionState.expiresAt && Date.parse(sessionState.expiresAt) <= Date.now()) {
        return {
          verified: false,
          reason: "session-expired",
          authPayload: { ...authPayload },
        };
      }

      return {
        verified: true,
        reason: "verified-session-token",
        userId: authPayload.userIdentity?.userId ?? sessionState.userId ?? null,
        sessionId: sessionState.sessionId ?? null,
        authPayload: { ...authPayload },
      };
    }

    return {
      verified: false,
      reason: "session-token-not-found",
      authPayload: null,
    };
  }

  listProjectCreationEvents() {
    return [...this.projectCreationEvents.values()].map((event) => ({ ...event }));
  }

  buildProjectCreationSummary(projectCreationEvents = []) {
    const { projectCreationSummary } = createProjectCreationAggregationModule({
      projectCreationEvents,
      projectCreationMetric: this.projectCreationMetric,
    });

    return projectCreationSummary;
  }

  performWorkspaceBillingAction({
    workspaceId,
    actionType,
    billingInput = {},
    userId = null,
  } = {}) {
    const project = this.findProjectRecordByWorkspaceId(workspaceId);
    if (!project || !isWorkspaceBillingActionType(actionType)) {
      return null;
    }

    const ownerUserId =
      project.context?.workspaceModel?.ownerUserId
      ?? project.state?.workspaceModel?.ownerUserId
      ?? project.userId
      ?? null;

    if (!userId || ownerUserId !== userId) {
      return {
        httpStatus: 403,
        error: "Forbidden",
      };
    }

    const { isValid, normalizedInput } = validateWorkspaceBillingActionInput(actionType, billingInput);
    if (!isValid) {
      return {
        httpStatus: 400,
        billingPayload: buildWorkspaceBillingPayload({
          workspaceId,
          actionType,
          status: "rejected",
          emittedEventType: null,
          stateRefreshRequired: false,
          result: buildWorkspaceBillingResult({
            actionType,
            normalizedInput: {},
          }),
        }),
      };
    }

    const idempotencyEnvelope = buildWorkspaceBillingIdempotencyEnvelope({
      workspaceId,
      actionType,
      normalizedInput,
    });

    const existingReceipt = project.manualContext?.billingActionReceipts?.[idempotencyEnvelope] ?? null;
    if (existingReceipt) {
      return {
        httpStatus: 200,
        billingPayload: existingReceipt,
      };
    }

    const canonicalEventInput = buildCanonicalBillingEventInput({
      workspaceId,
      userId,
      actionType,
      normalizedInput,
      currency: project.context?.costSummary?.currency ?? "usd",
      idempotencyEnvelope,
    });
    const ingestionResult = ingestBillingEvent({
      billingEvent: canonicalEventInput.billingEvent,
      existingNormalizedBillingEvents: project.manualContext?.normalizedBillingEvents,
    });
    if (ingestionResult.ingestStatus === "rejected") {
      return {
        httpStatus: 500,
        billingPayload: buildWorkspaceBillingPayload({
          workspaceId,
          actionType,
          status: "failed",
          emittedEventType: null,
          stateRefreshRequired: false,
          result: buildWorkspaceBillingResult({
            actionType,
            normalizedInput,
          }),
        }),
      };
    }

    const billingPayload = buildWorkspaceBillingPayload({
      workspaceId,
      actionType,
      status: "accepted",
      emittedEventType: WORKSPACE_BILLING_EVENT_TYPES[actionType] ?? null,
      stateRefreshRequired: ingestionResult.ingestStatus === "accepted",
      result: buildWorkspaceBillingResult({
        actionType,
        normalizedInput,
      }),
    });

    project.manualContext = {
      ...(project.manualContext ?? {}),
      normalizedBillingEvents: ingestionResult.normalizedBillingEvents,
      billingActionReceipts: {
        ...(project.manualContext?.billingActionReceipts ?? {}),
        [idempotencyEnvelope]: billingPayload,
      },
      billingActionLastResult: {
        actionType,
        billingActionId: buildWorkspaceBillingActionId({
          workspaceId,
          actionType,
          status: "accepted",
        }),
      },
    };

    if (ingestionResult.ingestStatus === "accepted") {
      this.rebuildContext(project.id);
    }

    return {
      httpStatus: 200,
      billingPayload,
    };
  }

  ingestProviderBillingEvent(projectId, {
    providerType,
    providerPayload,
  } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return {
        ingestStatus: "rejected",
        normalizedBillingEvent: null,
        stateRefreshRequired: false,
      };
    }

    const { billingEvent } = createProviderBillingEventAdapter({
      providerType,
      providerPayload,
      workspaceModel: project.context?.workspaceModel ?? project.state?.workspaceModel ?? null,
    });

    if (!billingEvent) {
      return {
        ingestStatus: "rejected",
        normalizedBillingEvent: null,
        stateRefreshRequired: false,
      };
    }

    const ingestionResult = ingestBillingEvent({
      billingEvent,
      existingNormalizedBillingEvents: project.manualContext?.normalizedBillingEvents,
    });

    if (ingestionResult.ingestStatus === "rejected") {
      return {
        ingestStatus: "rejected",
        normalizedBillingEvent: null,
        stateRefreshRequired: false,
      };
    }

    project.manualContext = {
      ...(project.manualContext ?? {}),
      normalizedBillingEvents: ingestionResult.normalizedBillingEvents,
    };

    if (ingestionResult.ingestStatus === "accepted") {
      this.rebuildContext(project.id);
    }

    return {
      ingestStatus: ingestionResult.ingestStatus,
      normalizedBillingEvent: ingestionResult.normalizedBillingEvent,
      stateRefreshRequired: ingestionResult.ingestStatus === "accepted",
    };
  }

  executePrivacyRightsRequest({ projectId, privacyRequest } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    this.rebuildContext(projectId);
    const currentProject = this.projects.get(projectId);
    const { privacyRightsResult } = createPrivacyRightsExecutionModule({
      privacyRequest,
      project: currentProject,
      context: currentProject?.context ?? null,
    });

    currentProject.context = {
      ...(currentProject.context ?? {}),
      privacyRequest,
      privacyRightsResult,
    };
    currentProject.privacyRightsResult = privacyRightsResult;
    this.rebuildContext(projectId);

    const refreshedProject = this.projects.get(projectId);
    refreshedProject.context = {
      ...(refreshedProject.context ?? {}),
      privacyRequest,
      privacyRightsResult,
    };
    refreshedProject.state = {
      ...(refreshedProject.state ?? {}),
      privacyRightsResult,
    };
    refreshedProject.privacyRightsResult = privacyRightsResult;

    return this.serializeProject(refreshedProject);
  }

  getProjectEvents(projectId) {
    return this.eventBus
      .getEvents()
      .filter((event) => event?.payload?.projectId === projectId)
      .slice(-50);
  }

  summarizeEvents(events) {
    return events.map((event) => {
      const payload = event?.payload ?? {};
      const task = payload.task ?? null;

      return {
        id: event.id,
        type: event.type,
        timestamp: event.timestamp,
        payload: {
          projectId: payload.projectId ?? null,
          agentId: payload.agentId ?? null,
          taskId: payload.taskId ?? task?.id ?? null,
          task: task
            ? {
                id: task.id,
                taskType: task.taskType ?? null,
                summary: task.summary,
                lane: task.lane,
              }
            : null,
        },
      };
    });
  }

  summarizeAssignments(assignments = []) {
    return assignments.map((assignment) => ({
      taskId: assignment.taskId,
      agentId: assignment.agentId,
      lockKey: assignment.lockKey,
      memory: assignment.memory
        ? {
            agentId: assignment.memory.agentId,
            projectId: assignment.memory.projectId,
            projectVersion: assignment.memory.projectVersion,
            businessGoal: assignment.memory.businessGoal,
            task: assignment.memory.task,
          }
        : null,
    }));
  }

  getPresenceRegistry(projectId) {
    if (!this.projectPresenceRegistry.has(projectId)) {
      this.projectPresenceRegistry.set(projectId, new Map());
    }

    return this.projectPresenceRegistry.get(projectId);
  }

  listActivePresenceUsers(projectId, maxAgeMs = 30_000) {
    const registry = this.projectPresenceRegistry.get(projectId);
    if (!registry) {
      return [];
    }

    const now = Date.now();
    const activeUsers = [];
    for (const [participantId, participant] of registry.entries()) {
      const heartbeatAtMs = Number.isFinite(participant.heartbeatAtMs) ? participant.heartbeatAtMs : now;
      if ((now - heartbeatAtMs) > maxAgeMs || participant.status === "inactive") {
        registry.delete(participantId);
        continue;
      }

      activeUsers.push({
        ...participant,
        lastSeenAt: participant.lastSeenAt ?? new Date(heartbeatAtMs).toISOString(),
      });
    }

    return activeUsers;
  }

  updateProjectPresence({ projectId, presenceInput } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const input = presenceInput && typeof presenceInput === "object" ? presenceInput : {};
    const participantId = input.participantId ?? input.sessionId ?? input.userId ?? `presence-${Date.now()}`;
    const heartbeatAtMs = Date.now();
    const registry = this.getPresenceRegistry(projectId);
    const previous = registry.get(participantId) ?? {};
    registry.set(participantId, {
      participantId,
      sessionId: input.sessionId ?? previous.sessionId ?? participantId,
      userId: input.userId ?? previous.userId ?? participantId,
      displayName: input.displayName ?? previous.displayName ?? "Active user",
      role: input.role ?? previous.role ?? "viewer",
      status: input.status ?? previous.status ?? "active",
      workspaceArea: input.workspaceArea ?? previous.workspaceArea ?? "developer-workspace",
      currentSurface: input.currentSurface ?? previous.currentSurface ?? input.workspaceArea ?? "developer-workspace",
      currentTask: input.currentTask ?? previous.currentTask ?? null,
      lastSeenAt: new Date(heartbeatAtMs).toISOString(),
      heartbeatAtMs,
      contextLabel: input.contextLabel ?? previous.contextLabel ?? null,
    });

    project.manualContext = {
      ...(project.manualContext ?? {}),
      userSessionMetric: {
        ...(project.manualContext?.userSessionMetric ?? {}),
        userId: input.userId ?? project.manualContext?.userSessionMetric?.userId ?? participantId,
        sessionId: input.sessionId ?? project.manualContext?.userSessionMetric?.sessionId ?? participantId,
        status: input.status ?? "active",
        workspaceId: project.manualContext?.userSessionMetric?.workspaceId ?? null,
        projectId,
        workspaceArea: input.workspaceArea ?? input.currentSurface ?? "developer-workspace",
        currentTask: input.currentTask ?? null,
        currentSurface: input.currentSurface ?? input.workspaceArea ?? "developer-workspace",
        lastSeenAt: new Date(heartbeatAtMs).toISOString(),
        activeUsers: this.listActivePresenceUsers(projectId),
      },
      activeUsers: this.listActivePresenceUsers(projectId),
      workspaceAction: {
        ...(project.manualContext?.workspaceAction ?? {}),
        actionType: "presence-heartbeat",
        workspaceArea: input.workspaceArea ?? input.currentSurface ?? "developer-workspace",
        resourceId: participantId,
      },
    };

    this.rebuildContext(projectId);
    return this.serializeProject(project);
  }

  rebuildContext(projectId, { skipPreChangeBackups = false } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const preservedRepeatedLoopContinuation =
      project.repeatedLoopContinuation
      ?? project.state?.repeatedLoopContinuation
      ?? project.context?.repeatedLoopContinuation
      ?? null;
    const preservedBuildMutationTruth =
      project.buildMutationTruth
      ?? project.context?.buildMutationTruth
      ?? project.state?.buildMutationTruth
      ?? null;
    const preservedBuildMutationHistory =
      project.buildMutationHistory
      ?? project.context?.buildMutationHistory
      ?? project.state?.buildMutationHistory
      ?? [];
    const preservedBuildMutationIntents =
      project.buildMutationIntents
      ?? project.context?.buildMutationIntents
      ?? project.state?.buildMutationIntents
      ?? [];
    const preservedBuildAgentTurnState =
      project.buildAgentTurnState
      ?? project.context?.buildAgentTurnState
      ?? project.state?.buildAgentTurnState
      ?? null;
    const preservedCompanionConversation =
      project.companionConversation
      ?? project.context?.companionConversation
      ?? project.state?.companionConversation
      ?? null;
    const preservedVisualBuildTruth =
      project.visualBuildTruth
      ?? project.context?.visualBuildTruth
      ?? project.state?.visualBuildTruth
      ?? null;
    const preservedSkeletonChoiceTruth =
      project.skeletonChoiceTruth
      ?? project.context?.skeletonChoiceTruth
      ?? project.state?.skeletonChoiceTruth
      ?? null;
    const preservedRuntimeSkeletonTruth =
      project.runtimeSkeletonTruth
      ?? project.context?.runtimeSkeletonTruth
      ?? project.state?.runtimeSkeletonTruth
      ?? null;
    const preservedProductDomainSkeleton =
      project.productDomainSkeleton
      ?? project.context?.productDomainSkeleton
      ?? project.state?.productDomainSkeleton
      ?? null;
    const preservedProductOwnedBackendSkeleton =
      project.productOwnedBackendSkeleton
      ?? project.context?.productOwnedBackendSkeleton
      ?? project.state?.productOwnedBackendSkeleton
      ?? null;
    const preservedBuildApprovalFlow =
      project.buildApprovalFlow
      ?? project.context?.buildApprovalFlow
      ?? project.state?.buildApprovalFlow
      ?? null;
    const preservedMutationChangeDecision =
      project.mutationChangeDecision
      ?? project.context?.mutationChangeDecision
      ?? project.state?.mutationChangeDecision
      ?? null;
    const preservedMutationChangeHistory =
      project.mutationChangeHistory
      ?? project.context?.mutationChangeHistory
      ?? project.state?.mutationChangeHistory
      ?? [];
    const preservedCanonicalMutationFlow =
      project.canonicalMutationFlow
      ?? project.context?.canonicalMutationFlow
      ?? project.state?.canonicalMutationFlow
      ?? null;
    const preservedHistoryContinuityAgent =
      project.historyContinuityAgent
      ?? project.context?.historyContinuityAgent
      ?? project.state?.historyContinuityAgent
      ?? null;
    const preservedShareDemoAgent =
      project.shareDemoAgent
      ?? project.context?.shareDemoAgent
      ?? project.state?.shareDemoAgent
      ?? null;
    const preservedGrowthAgent =
      project.growthAgent
      ?? project.context?.growthAgent
      ?? project.state?.growthAgent
      ?? null;
    const preservedGrowthMeasurementTruth =
      project.growthMeasurementTruth
      ?? project.context?.growthMeasurementTruth
      ?? project.state?.growthMeasurementTruth
      ?? null;
    const preservedSocialCampaignExecutionAgent =
      project.socialCampaignExecutionAgent
      ?? project.context?.socialCampaignExecutionAgent
      ?? project.state?.socialCampaignExecutionAgent
      ?? null;
    const preservedSeoActionPath =
      project.seoActionPath
      ?? project.context?.seoActionPath
      ?? project.state?.seoActionPath
      ?? null;
    const preservedSemActionPath =
      project.semActionPath
      ?? project.context?.semActionPath
      ?? project.state?.semActionPath
      ?? null;
    const preservedEmailActionPath =
      project.emailActionPath
      ?? project.context?.emailActionPath
      ?? project.state?.emailActionPath
      ?? null;
    const preservedLandingActionPath =
      project.landingActionPath
      ?? project.context?.landingActionPath
      ?? project.state?.landingActionPath
      ?? null;
    const preservedLandingBackendSync =
      project.landingBackendSync
      ?? project.context?.landingBackendSync
      ?? project.state?.landingBackendSync
      ?? null;
    const preservedProviderGatewayBoundary =
      project.providerGatewayBoundary
      ?? project.context?.providerGatewayBoundary
      ?? project.state?.providerGatewayBoundary
      ?? null;
    const preservedProviderReleaseRegistry =
      project.providerReleaseRegistry
      ?? project.context?.providerReleaseRegistry
      ?? project.state?.providerReleaseRegistry
      ?? null;
    const preservedCreativeProviderAssets =
      project.creativeProviderAssets
      ?? project.context?.creativeProviderAssets
      ?? project.state?.creativeProviderAssets
      ?? [];
    const preservedWorkspaceModel =
      project.context?.workspaceModel
      ?? project.state?.workspaceModel
      ?? project.manualContext?.workspaceMetadata
      ?? null;
    project.projectCreationEvents = this.listProjectCreationEvents();
    project.projectCreationSummary = this.buildProjectCreationSummary(project.projectCreationEvents);
    project.normalizedSources = normalizeProjectSources(project);
    if (preservedWorkspaceModel) {
      project.manualContext = {
        ...(project.manualContext ?? {}),
        workspaceMetadata: preservedWorkspaceModel,
      };
    }
    project.state = buildObservedProjectState(project);
    const builtContext = buildProjectContext(project, {
      observabilityTransport: this.platformObservabilityTransport,
      auditLogStore: this.systemAuditLogStore,
      securityAuditLogStore: this.securityAuditLogStore,
      snapshotStore: this.projectSnapshotStore,
      reviewThreadStore: this.projectReviewThreadStore,
      userActivityHistoryStore: this.userActivityHistoryStore,
    });
    if (!skipPreChangeBackups) {
      this.applyScheduledPreChangeBackups(projectId, builtContext);
    }
    const existingSchedule = project.snapshotSchedule ?? builtContext.snapshotSchedule ?? null;
    const { snapshotSchedule } = createSnapshotBackupSchedulingModule({
      backupStrategy: builtContext.backupStrategy ?? null,
      projectState: project.state ?? null,
      previousSchedule: existingSchedule,
    });
    const snapshotBackupWorker = project.snapshotBackupWorker ?? builtContext.snapshotBackupWorker ?? null;
    const snapshotJobState = project.snapshotJobState ?? builtContext.snapshotJobState ?? null;
    const snapshotWorkerRuntime = project.snapshotWorkerRuntime ?? builtContext.snapshotWorkerRuntime ?? null;
    const snapshotRetentionPolicy = project.snapshotRetentionPolicy ?? builtContext.snapshotRetentionPolicy ?? null;
    const snapshotRetentionDecision = project.snapshotRetentionDecision ?? builtContext.snapshotRetentionDecision ?? null;
    const continuityPlan = builtContext.continuityPlan ?? project.continuityPlan ?? null;
    const disasterRecoveryChecklist = builtContext.disasterRecoveryChecklist ?? project.disasterRecoveryChecklist ?? null;
    const businessContinuityState = builtContext.businessContinuityState ?? project.businessContinuityState ?? null;
    project.snapshotSchedule = snapshotSchedule;
    project.snapshotBackupWorker = snapshotBackupWorker;
    project.snapshotJobState = snapshotJobState;
    project.snapshotWorkerRuntime = snapshotWorkerRuntime;
    project.snapshotRetentionPolicy = snapshotRetentionPolicy;
    project.snapshotRetentionDecision = snapshotRetentionDecision;
    project.continuityPlan = continuityPlan;
    project.disasterRecoveryChecklist = disasterRecoveryChecklist;
    project.businessContinuityState = businessContinuityState;
    project.context = {
      ...builtContext,
      snapshotSchedule,
      snapshotBackupWorker,
      snapshotJobState,
      snapshotWorkerRuntime,
      snapshotRetentionPolicy,
      snapshotRetentionDecision,
      continuityPlan,
      disasterRecoveryChecklist,
      businessContinuityState,
      repeatedLoopContinuation: preservedRepeatedLoopContinuation,
      growthAgent: preservedGrowthAgent,
      growthMeasurementTruth: preservedGrowthMeasurementTruth,
      socialCampaignExecutionAgent: preservedSocialCampaignExecutionAgent,
      seoActionPath: preservedSeoActionPath,
      semActionPath: preservedSemActionPath,
      emailActionPath: preservedEmailActionPath,
      landingActionPath: preservedLandingActionPath,
      landingBackendSync: preservedLandingBackendSync,
      providerGatewayBoundary: preservedProviderGatewayBoundary,
      providerReleaseRegistry: preservedProviderReleaseRegistry,
      creativeProviderAssets: preservedCreativeProviderAssets,
    };
    const teamBoundaryEnvelope = buildProjectTeamBoundary({
      project,
      workspaceModel: project.context?.workspaceModel ?? preservedWorkspaceModel,
    });
    const teamProjectType = normalizeString(
      project.state?.artifactExpectation?.projectType,
      normalizeString(project.state?.projectType, normalizeString(project.state?.domainClassification?.domain, "generic")),
    );
    const { projectPermissionSchema: teamPermissionSchema } = defineProjectPermissionSchema({
      workspaceModel: teamBoundaryEnvelope.workspaceModel,
      projectType: teamProjectType,
    });
    const { roleCapabilityMatrix: teamRoleCapabilityMatrix } = createProjectRoleCapabilityMatrix({
      projectPermissionSchema: teamPermissionSchema,
    });
    const { tenantIsolationSchema: teamTenantIsolationSchema } = defineTenantIsolationSchema({
      workspaceModel: teamBoundaryEnvelope.workspaceModel,
    });
    project.userId = teamBoundaryEnvelope.workspaceModel.ownerUserId;
    project.manualContext = {
      ...(project.manualContext ?? {}),
      workspaceMetadata: teamBoundaryEnvelope.workspaceModel,
    };
    project.context = {
      ...project.context,
      workspaceModel: teamBoundaryEnvelope.workspaceModel,
      teamMembershipBoundary: teamBoundaryEnvelope.teamMembershipBoundary,
      projectPermissionSchema: teamPermissionSchema,
      roleCapabilityMatrix: teamRoleCapabilityMatrix,
      tenantIsolationSchema: teamTenantIsolationSchema,
    };
    const initialRuntimeSkeletonTruth = buildRuntimeSkeletonTruthEnvelope({ project });
    const replayedRuntimeTruth = replayBuildMutationIntentsOnSkeleton({
      runtimeSkeletonTruth: initialRuntimeSkeletonTruth,
      productDomainSkeleton: initialRuntimeSkeletonTruth.productDomainSkeleton ?? null,
      productOwnedBackendSkeleton: initialRuntimeSkeletonTruth.productOwnedBackendSkeleton ?? null,
      buildMutationIntents: preservedBuildMutationIntents,
    });
    let runtimeSkeletonTruth = replayedRuntimeTruth.runtimeSkeletonTruth;
    let productDomainSkeleton = replayedRuntimeTruth.productDomainSkeleton ?? runtimeSkeletonTruth.productDomainSkeleton ?? null;
    let productOwnedBackendSkeleton = replayedRuntimeTruth.productOwnedBackendSkeleton
      ?? runtimeSkeletonTruth.productOwnedBackendSkeleton
      ?? null;
    const restoredHistoryTruth =
      preservedHistoryContinuityAgent?.status === "restored"
      || preservedHistoryContinuityAgent?.restoreDecision?.status === "restored"
      || preservedMutationChangeDecision?.status === "restored"
      || preservedBuildApprovalFlow?.decisionStatus === "restored";
    if (restoredHistoryTruth) {
      runtimeSkeletonTruth = preservedRuntimeSkeletonTruth ?? runtimeSkeletonTruth;
      productDomainSkeleton = preservedProductDomainSkeleton ?? productDomainSkeleton;
      productOwnedBackendSkeleton = preservedProductOwnedBackendSkeleton ?? productOwnedBackendSkeleton;
      project.buildApprovalFlow = preservedBuildApprovalFlow;
      project.mutationChangeDecision = preservedMutationChangeDecision;
      project.mutationChangeHistory = preservedMutationChangeHistory;
      project.canonicalMutationFlow = preservedCanonicalMutationFlow;
      project.historyContinuityAgent = preservedHistoryContinuityAgent;
    } else if (preservedBuildApprovalFlow?.decisionStatus === "approved") {
      project.buildApprovalFlow = preservedBuildApprovalFlow;
      project.mutationChangeDecision = preservedMutationChangeDecision;
      project.mutationChangeHistory = preservedMutationChangeHistory;
      project.canonicalMutationFlow = preservedCanonicalMutationFlow;
      project.historyContinuityAgent = preservedHistoryContinuityAgent;
      project.runtimeSkeletonTruth = runtimeSkeletonTruth;
      project.productDomainSkeleton = productDomainSkeleton;
      project.productOwnedBackendSkeleton = productOwnedBackendSkeleton;
      applyApprovedProductDirectionToProject(project, preservedBuildApprovalFlow);
      runtimeSkeletonTruth = project.runtimeSkeletonTruth ?? runtimeSkeletonTruth;
      productDomainSkeleton = project.productDomainSkeleton ?? productDomainSkeleton;
      productOwnedBackendSkeleton = project.productOwnedBackendSkeleton ?? productOwnedBackendSkeleton;
    }
    const runtimeLearningEvents = mergeRuntimeLearningEvents(
      project.runtimeLearningEvents ?? project.context?.runtimeLearningEvents ?? project.state?.runtimeLearningEvents ?? [],
      createRuntimeCreationLearningEvents({
        project,
        runtimeSkeletonTruth,
        productDomainSkeleton,
      }),
    );
    const skeletonChoiceTruth = buildSkeletonChoiceTruthEnvelope({
      project,
      runtimeSkeletonTruth,
      productDomainSkeleton,
      previousSkeletonChoiceTruth: preservedSkeletonChoiceTruth,
    });
    const runtimeLearningDecisionHints = buildRuntimeLearningDecisionHints(runtimeLearningEvents);
    const preservedLandingLeads = preservedProductOwnedBackendSkeleton?.persistence?.state?.landingLeads;
    if (Array.isArray(preservedLandingLeads) && preservedLandingLeads.length > 0) {
      productOwnedBackendSkeleton = preservedProductOwnedBackendSkeleton;
      if (runtimeSkeletonTruth?.productOwnedBackendSkeleton) {
        runtimeSkeletonTruth = {
          ...runtimeSkeletonTruth,
          productOwnedBackendSkeleton,
          productOwnedBackendSkeletonId: productOwnedBackendSkeleton.productOwnedBackendSkeletonId,
        };
      }
    }
    project.runtimeSkeletonTruth = runtimeSkeletonTruth;
    project.productDomainSkeleton = productDomainSkeleton;
    project.productOwnedBackendSkeleton = productOwnedBackendSkeleton;
    project.skeletonChoiceTruth = skeletonChoiceTruth;
    project.runtimeLearningEvents = runtimeLearningEvents;
    project.runtimeLearningDecisionHints = runtimeLearningDecisionHints;
    project.shareDemoAgent = preservedShareDemoAgent;
    project.growthAgent = preservedGrowthAgent;
    project.growthMeasurementTruth = preservedGrowthMeasurementTruth;
    project.socialCampaignExecutionAgent = preservedSocialCampaignExecutionAgent;
    project.seoActionPath = preservedSeoActionPath;
    project.semActionPath = preservedSemActionPath;
    project.emailActionPath = preservedEmailActionPath;
    project.landingActionPath = preservedLandingActionPath;
    project.landingBackendSync = preservedLandingBackendSync;
    project.context = {
      ...project.context,
      runtimeSkeletonTruth,
      productDomainSkeleton,
      productOwnedBackendSkeleton,
      buildMutationTruth: preservedBuildMutationTruth,
      buildMutationHistory: preservedBuildMutationHistory,
      buildMutationIntents: preservedBuildMutationIntents,
      buildAgentTurnState: preservedBuildAgentTurnState,
      companionConversation: preservedCompanionConversation,
      visualBuildTruth: preservedVisualBuildTruth,
      buildApprovalFlow: preservedBuildApprovalFlow,
      mutationChangeDecision: preservedMutationChangeDecision,
      mutationChangeHistory: preservedMutationChangeHistory,
      canonicalMutationFlow: preservedCanonicalMutationFlow,
      historyContinuityAgent: preservedHistoryContinuityAgent,
      shareDemoAgent: preservedShareDemoAgent,
      growthAgent: preservedGrowthAgent,
      growthMeasurementTruth: preservedGrowthMeasurementTruth,
      socialCampaignExecutionAgent: preservedSocialCampaignExecutionAgent,
      seoActionPath: preservedSeoActionPath,
      semActionPath: preservedSemActionPath,
      emailActionPath: preservedEmailActionPath,
      landingActionPath: preservedLandingActionPath,
      landingBackendSync: preservedLandingBackendSync,
      skeletonChoiceTruth,
      runtimeLearningEvents,
      runtimeLearningDecisionHints,
    };
    project.state = {
      ...project.state,
      repeatedLoopContinuation: preservedRepeatedLoopContinuation,
      runtimeSkeletonTruth,
      productDomainSkeleton,
      productOwnedBackendSkeleton,
      buildMutationTruth: preservedBuildMutationTruth,
      buildMutationHistory: preservedBuildMutationHistory,
      buildMutationIntents: preservedBuildMutationIntents,
      buildAgentTurnState: preservedBuildAgentTurnState,
      companionConversation: preservedCompanionConversation,
      visualBuildTruth: preservedVisualBuildTruth,
      buildApprovalFlow: preservedBuildApprovalFlow,
      mutationChangeDecision: preservedMutationChangeDecision,
      mutationChangeHistory: preservedMutationChangeHistory,
      canonicalMutationFlow: preservedCanonicalMutationFlow,
      historyContinuityAgent: preservedHistoryContinuityAgent,
      shareDemoAgent: preservedShareDemoAgent,
      growthAgent: preservedGrowthAgent,
      growthMeasurementTruth: preservedGrowthMeasurementTruth,
      socialCampaignExecutionAgent: preservedSocialCampaignExecutionAgent,
      seoActionPath: preservedSeoActionPath,
      semActionPath: preservedSemActionPath,
      emailActionPath: preservedEmailActionPath,
      landingActionPath: preservedLandingActionPath,
      landingBackendSync: preservedLandingBackendSync,
      skeletonChoiceTruth,
      runtimeLearningEvents,
      runtimeLearningDecisionHints,
      workspaceModel: teamBoundaryEnvelope.workspaceModel,
      teamMembershipBoundary: teamBoundaryEnvelope.teamMembershipBoundary,
      projectPermissionSchema: teamPermissionSchema,
      roleCapabilityMatrix: teamRoleCapabilityMatrix,
      tenantIsolationSchema: teamTenantIsolationSchema,
      businessGoal: project.goal,
      context: project.context,
      domainProfile: project.context?.domainProfile ?? null,
      domainClassification: {
        domain: project.context?.domain ?? "generic",
        domainCandidates: project.context?.domainCandidates ?? ["generic"],
        confidenceScores: project.context?.confidenceScores ?? { generic: 1 },
      },
      domainCapabilities: project.context?.domainCapabilities ?? null,
      requiredContextFields: project.context?.requiredContextFields ?? [],
      executionModes: project.context?.executionModes ?? [],
      recommendedDefaults: project.context?.recommendedDefaults ?? null,
      defaultsTrace: project.context?.defaultsTrace ?? [],
      stackRecommendation: project.context?.stackRecommendation ?? null,
      businessContext: project.context?.businessContext ?? null,
      projectIdentity: project.context?.projectIdentity ?? null,
      productBoundaryModel: project.context?.productBoundaryModel ?? null,
      capabilityLimitMap: project.context?.capabilityLimitMap ?? null,
      boundaryDisclosureModel: project.context?.boundaryDisclosureModel ?? null,
      systemCapabilityRegistry: project.context?.systemCapabilityRegistry ?? null,
      externalCapabilityRegistry: project.context?.externalCapabilityRegistry ?? null,
      sourceControlIntegration: project.context?.sourceControlIntegration ?? null,
      secretResolutionState: project.context?.secretResolutionState ?? null,
      connectorCredentialBinding: project.context?.connectorCredentialBinding ?? null,
      inboundWebhookIngestion: project.context?.inboundWebhookIngestion ?? null,
      executionActionRouting: project.context?.executionActionRouting ?? null,
      actionToProviderMapping: project.context?.actionToProviderMapping ?? null,
      ideAgentExecutorContract: project.context?.ideAgentExecutorContract ?? null,
      localCodingAgentAdapter: project.context?.localCodingAgentAdapter ?? null,
      executionProviderCapabilitySync: project.context?.executionProviderCapabilitySync ?? null,
      designToolImportAdapter: project.context?.designToolImportAdapter ?? null,
      capabilityDecision: project.context?.capabilityDecision ?? null,
      atomicExecutionEnvelope: project.context?.atomicExecutionEnvelope ?? null,
      externalExecutionResult: project.context?.externalExecutionResult ?? null,
      externalExecutionSession: project.context?.externalExecutionSession ?? null,
      ideAgentResultNormalization: project.context?.ideAgentResultNormalization ?? null,
      executionInvocationContract: project.context?.executionInvocationContract ?? null,
      artifactCollectionPipeline: project.context?.artifactCollectionPipeline ?? null,
      canonicalExecutionResultEnvelope: project.context?.canonicalExecutionResultEnvelope ?? null,
      deploymentInvocation: project.context?.deploymentInvocation ?? null,
      deploymentEvidence: project.context?.deploymentEvidence ?? null,
      deploymentResultEnvelope: project.context?.deploymentResultEnvelope ?? null,
      productionHealthValidation: project.context?.productionHealthValidation ?? null,
      launchConfirmationState: project.context?.launchConfirmationState ?? null,
      releaseReadinessEvaluation: project.context?.releaseReadinessEvaluation ?? null,
      executionConsistencyReport: project.context?.executionConsistencyReport ?? null,
      existingBusinessAssets: project.context?.existingBusinessAssets ?? null,
      repositoryImportAndCodebaseDiagnosis: project.context?.repositoryImportAndCodebaseDiagnosis ?? null,
      liveWebsiteIngestionAndFunnelDiagnosis: project.context?.liveWebsiteIngestionAndFunnelDiagnosis ?? null,
      importedAnalyticsNormalization: project.context?.importedAnalyticsNormalization ?? null,
      importedAssetTaskExtraction: project.context?.importedAssetTaskExtraction ?? null,
      importAndContinueRoadmap: project.context?.importAndContinueRoadmap ?? null,
      nexusPositioning: project.context?.nexusPositioning ?? null,
      messagingFramework: project.context?.messagingFramework ?? null,
      messagingVariants: project.context?.messagingVariants ?? null,
      landingVariantDecision: project.context?.landingVariantDecision ?? null,
      objectionMap: project.context?.objectionMap ?? null,
      faqMap: project.context?.faqMap ?? null,
      activationGoals: project.context?.activationGoals ?? null,
      productCtaStrategy: project.context?.productCtaStrategy ?? null,
      nexusWebsiteSchema: project.context?.nexusWebsiteSchema ?? null,
      landingPageIa: project.context?.landingPageIa ?? null,
      websiteCopyPack: project.context?.websiteCopyPack ?? null,
      websiteConversionFlow: project.context?.websiteConversionFlow ?? null,
      waitlistRecord: project.context?.waitlistRecord ?? null,
      accessRequest: project.context?.accessRequest ?? null,
      websiteExperimentPlan: project.context?.websiteExperimentPlan ?? null,
      trustProofBlocks: project.context?.trustProofBlocks ?? null,
      productDeliveryModel: project.context?.productDeliveryModel ?? null,
      siteAppBoundary: project.context?.siteAppBoundary ?? null,
      accessModeDecision: project.context?.accessModeDecision ?? null,
      landingAuthHandoff: project.context?.landingAuthHandoff ?? null,
      appEntryDecision: project.context?.appEntryDecision ?? null,
      postLoginDestination: project.context?.postLoginDestination ?? null,
      returnTomorrowContinuity: project.context?.returnTomorrowContinuity ?? null,
      appLandingEntry: project.context?.appLandingEntry ?? null,
      entryStateVariants: project.context?.entryStateVariants ?? null,
      entryRecoveryState: project.context?.entryRecoveryState ?? null,
      entryOrientationPanel: project.context?.entryOrientationPanel ?? null,
      entryDecisionSupport: project.context?.entryDecisionSupport ?? null,
      firstProjectKickoff: project.context?.firstProjectKickoff ?? null,
      landingToDashboardFlow: project.context?.landingToDashboardFlow ?? null,
      activationFunnel: project.context?.activationFunnel ?? null,
      activationMilestones: project.context?.activationMilestones ?? null,
      onboardingMarketingFlow: project.context?.onboardingMarketingFlow ?? null,
      activationDropOffs: project.context?.activationDropOffs ?? null,
      reEngagementPlan: project.context?.reEngagementPlan ?? null,
      nexusContentStrategy: project.context?.nexusContentStrategy ?? null,
      launchContentCalendar: project.context?.launchContentCalendar ?? null,
      storyAssets: project.context?.storyAssets ?? null,
      socialCommunityPack: project.context?.socialCommunityPack ?? null,
      productProofPlan: project.context?.productProofPlan ?? null,
      launchCampaignBrief: project.context?.launchCampaignBrief ?? null,
      launchRolloutPlan: project.context?.launchRolloutPlan ?? null,
      launchReadinessChecklist: project.context?.launchReadinessChecklist ?? null,
      launchPublishingPlan: project.context?.launchPublishingPlan ?? null,
      launchFeedbackSummary: project.context?.launchFeedbackSummary ?? null,
      goToMarketPlan: project.context?.goToMarketPlan ?? null,
      promotionExecutionPlan: project.context?.promotionExecutionPlan ?? null,
      launchMarketingExecution: project.context?.launchMarketingExecution ?? null,
      gtmMetricSchema: project.context?.gtmMetricSchema ?? null,
      acquisitionSourceMetrics: project.context?.acquisitionSourceMetrics ?? null,
      firstTouchAttribution: project.context?.firstTouchAttribution ?? null,
      preAuthConversionEvents: project.context?.preAuthConversionEvents ?? null,
      websiteActivationFunnel: project.context?.websiteActivationFunnel ?? null,
      conversionAnalytics: project.context?.conversionAnalytics ?? null,
      launchPerformanceDashboard: project.context?.launchPerformanceDashboard ?? null,
      gtmOptimizationPlan: project.context?.gtmOptimizationPlan ?? null,
      growthLoopManagement: project.context?.growthLoopManagement ?? null,
      ownerControlPlane: project.context?.ownerControlPlane ?? null,
      ownerControlCenter: project.context?.ownerControlCenter ?? null,
      dailyOwnerOverview: project.context?.dailyOwnerOverview ?? null,
      ownerPriorityQueue: project.context?.ownerPriorityQueue ?? null,
      ownerActionRecommendations: project.context?.ownerActionRecommendations ?? null,
      ownerDecisionDashboard: project.context?.ownerDecisionDashboard ?? null,
      ownerDailyWorkflow: project.context?.ownerDailyWorkflow ?? null,
      ownerFocusArea: project.context?.ownerFocusArea ?? null,
      ownerTaskList: project.context?.ownerTaskList ?? null,
      ownerRoutinePlan: project.context?.ownerRoutinePlan ?? null,
      dashboardHomeSurface: project.context?.dashboardHomeSurface ?? null,
      unifiedHomeDashboard: project.context?.unifiedHomeDashboard ?? null,
      todayPrioritiesFeed: project.context?.todayPrioritiesFeed ?? null,
      ownerVisibilityStrip: project.context?.ownerVisibilityStrip ?? null,
      aiControlCenterSurface: project.context?.aiControlCenterSurface ?? null,
      proofArtifact: buildCanonicalProofArtifact({
        project,
        previewScreenViewModel: project.context?.previewScreenViewModel ?? null,
        generatedSurfaceProofSchema: project.context?.generatedSurfaceProofSchema ?? null,
        aiControlCenterSurface: project.context?.aiControlCenterSurface ?? null,
        proposalApplyDecision: project.context?.proposalApplyDecision ?? null,
        artifactExpectation: project.context?.artifactExpectation ?? null,
      }),
      aiGenerationObservability: project.context?.aiGenerationObservability ?? null,
      providerLatencyFailureTracker: project.context?.providerLatencyFailureTracker ?? null,
      generationSuccessAcceptanceTracker: project.context?.generationSuccessAcceptanceTracker ?? null,
      promptContractFailureTracker: project.context?.promptContractFailureTracker ?? null,
      aiGenerationReviewDashboard: project.context?.aiGenerationReviewDashboard ?? null,
      generatedSurfaceProofSchema: project.context?.generatedSurfaceProofSchema ?? null,
      proofArtifact: buildCanonicalProofArtifact({
        project,
        previewScreenViewModel: project.context?.previewScreenViewModel ?? null,
        generatedSurfaceProofSchema: project.context?.generatedSurfaceProofSchema ?? null,
        aiControlCenterSurface: project.context?.aiControlCenterSurface ?? null,
        proposalApplyDecision: project.context?.proposalApplyDecision ?? null,
        artifactExpectation: project.context?.artifactExpectation ?? null,
      }),
      generatedAccessibilityValidationEngine: project.context?.generatedAccessibilityValidationEngine ?? null,
      generatedSurfacePerformanceBudgetValidator: project.context?.generatedSurfacePerformanceBudgetValidator ?? null,
      generatedBrandConsistencyValidator: project.context?.generatedBrandConsistencyValidator ?? null,
      ownerRevenueView: project.context?.ownerRevenueView ?? null,
      ownerCostView: project.context?.ownerCostView ?? null,
      profitMarginSummary: project.context?.profitMarginSummary ?? null,
      unitEconomicsDashboard: project.context?.unitEconomicsDashboard ?? null,
      cashFlowProjection: project.context?.cashFlowProjection ?? null,
      ownerUserAnalytics: project.context?.ownerUserAnalytics ?? null,
      featureUsageSummary: project.context?.featureUsageSummary ?? null,
      decisionAccuracySummary: project.context?.decisionAccuracySummary ?? null,
      automationImpactSummary: project.context?.automationImpactSummary ?? null,
      roadmapTracking: project.context?.roadmapTracking ?? null,
      ownerOperationsSignals: project.context?.ownerOperationsSignals ?? null,
      prioritizedOwnerAlerts: project.context?.prioritizedOwnerAlerts ?? null,
      ownerAlertFeed: project.context?.ownerAlertFeed ?? null,
      ownerIncident: project.context?.ownerIncident ?? null,
      outageResponsePlan: project.context?.outageResponsePlan ?? null,
      incidentTimeline: project.context?.incidentTimeline ?? null,
      rootCauseSummary: project.context?.rootCauseSummary ?? null,
      liveProjectMonitoring: project.context?.liveProjectMonitoring ?? null,
      maintenanceBacklog: project.context?.maintenanceBacklog ?? null,
      projectDraft: project.context?.projectDraft ?? project.projectDraft ?? null,
      projectCreationEvent: project.context?.projectCreationEvent ?? project.projectCreationEvent ?? null,
      projectCreationEvents: project.context?.projectCreationEvents ?? project.projectCreationEvents ?? [],
      projectCreationMetric: project.context?.projectCreationMetric ?? project.projectCreationMetric ?? null,
      projectCreationSummary: project.context?.projectCreationSummary ?? project.projectCreationSummary ?? null,
      productBoundaryModel: project.context?.productBoundaryModel ?? null,
      capabilityLimitMap: project.context?.capabilityLimitMap ?? null,
      boundaryDisclosureModel: project.context?.boundaryDisclosureModel ?? null,
      systemCapabilityRegistry: project.context?.systemCapabilityRegistry ?? null,
      externalCapabilityRegistry: project.context?.externalCapabilityRegistry ?? null,
      sourceControlIntegration: project.context?.sourceControlIntegration ?? null,
      secretResolutionState: project.context?.secretResolutionState ?? null,
      connectorCredentialBinding: project.context?.connectorCredentialBinding ?? null,
      inboundWebhookIngestion: project.context?.inboundWebhookIngestion ?? null,
      executionActionRouting: project.context?.executionActionRouting ?? null,
      actionToProviderMapping: project.context?.actionToProviderMapping ?? null,
      ideAgentExecutorContract: project.context?.ideAgentExecutorContract ?? null,
      localCodingAgentAdapter: project.context?.localCodingAgentAdapter ?? null,
      executionProviderCapabilitySync: project.context?.executionProviderCapabilitySync ?? null,
      designToolImportAdapter: project.context?.designToolImportAdapter ?? null,
      capabilityDecision: project.context?.capabilityDecision ?? null,
      atomicExecutionEnvelope: project.context?.atomicExecutionEnvelope ?? null,
      externalExecutionResult: project.context?.externalExecutionResult ?? null,
      externalExecutionSession: project.context?.externalExecutionSession ?? null,
      ideAgentResultNormalization: project.context?.ideAgentResultNormalization ?? null,
      executionInvocationContract: project.context?.executionInvocationContract ?? null,
      artifactCollectionPipeline: project.context?.artifactCollectionPipeline ?? null,
      canonicalExecutionResultEnvelope: project.context?.canonicalExecutionResultEnvelope ?? null,
      deploymentInvocation: project.context?.deploymentInvocation ?? null,
      deploymentEvidence: project.context?.deploymentEvidence ?? null,
      deploymentResultEnvelope: project.context?.deploymentResultEnvelope ?? null,
      productionHealthValidation: project.context?.productionHealthValidation ?? null,
      launchConfirmationState: project.context?.launchConfirmationState ?? null,
      releaseReadinessEvaluation: project.context?.releaseReadinessEvaluation ?? null,
      executionConsistencyReport: project.context?.executionConsistencyReport ?? null,
      existingBusinessAssets: project.context?.existingBusinessAssets ?? null,
      repositoryImportAndCodebaseDiagnosis: project.context?.repositoryImportAndCodebaseDiagnosis ?? null,
      liveWebsiteIngestionAndFunnelDiagnosis: project.context?.liveWebsiteIngestionAndFunnelDiagnosis ?? null,
      importedAnalyticsNormalization: project.context?.importedAnalyticsNormalization ?? null,
      importedAssetTaskExtraction: project.context?.importedAssetTaskExtraction ?? null,
      importAndContinueRoadmap: project.context?.importAndContinueRoadmap ?? null,
      nexusPositioning: project.context?.nexusPositioning ?? null,
      messagingFramework: project.context?.messagingFramework ?? null,
      messagingVariants: project.context?.messagingVariants ?? null,
      landingVariantDecision: project.context?.landingVariantDecision ?? null,
      objectionMap: project.context?.objectionMap ?? null,
      faqMap: project.context?.faqMap ?? null,
      activationGoals: project.context?.activationGoals ?? null,
      productCtaStrategy: project.context?.productCtaStrategy ?? null,
      nexusWebsiteSchema: project.context?.nexusWebsiteSchema ?? null,
      landingPageIa: project.context?.landingPageIa ?? null,
      websiteCopyPack: project.context?.websiteCopyPack ?? null,
      websiteConversionFlow: project.context?.websiteConversionFlow ?? null,
      waitlistRecord: project.context?.waitlistRecord ?? null,
      accessRequest: project.context?.accessRequest ?? null,
      websiteExperimentPlan: project.context?.websiteExperimentPlan ?? null,
      trustProofBlocks: project.context?.trustProofBlocks ?? null,
      productDeliveryModel: project.context?.productDeliveryModel ?? null,
      siteAppBoundary: project.context?.siteAppBoundary ?? null,
      accessModeDecision: project.context?.accessModeDecision ?? null,
      landingAuthHandoff: project.context?.landingAuthHandoff ?? null,
      appEntryDecision: project.context?.appEntryDecision ?? null,
      postLoginDestination: project.context?.postLoginDestination ?? null,
      returnTomorrowContinuity: project.context?.returnTomorrowContinuity ?? null,
      appLandingEntry: project.context?.appLandingEntry ?? null,
      entryStateVariants: project.context?.entryStateVariants ?? null,
      entryRecoveryState: project.context?.entryRecoveryState ?? null,
      entryOrientationPanel: project.context?.entryOrientationPanel ?? null,
      entryDecisionSupport: project.context?.entryDecisionSupport ?? null,
      firstProjectKickoff: project.context?.firstProjectKickoff ?? null,
      landingToDashboardFlow: project.context?.landingToDashboardFlow ?? null,
      activationFunnel: project.context?.activationFunnel ?? null,
      activationMilestones: project.context?.activationMilestones ?? null,
      onboardingMarketingFlow: project.context?.onboardingMarketingFlow ?? null,
      activationDropOffs: project.context?.activationDropOffs ?? null,
      reEngagementPlan: project.context?.reEngagementPlan ?? null,
      nexusContentStrategy: project.context?.nexusContentStrategy ?? null,
      launchContentCalendar: project.context?.launchContentCalendar ?? null,
      storyAssets: project.context?.storyAssets ?? null,
      socialCommunityPack: project.context?.socialCommunityPack ?? null,
      productProofPlan: project.context?.productProofPlan ?? null,
      launchCampaignBrief: project.context?.launchCampaignBrief ?? null,
      launchRolloutPlan: project.context?.launchRolloutPlan ?? null,
      launchReadinessChecklist: project.context?.launchReadinessChecklist ?? null,
      launchPublishingPlan: project.context?.launchPublishingPlan ?? null,
      launchFeedbackSummary: project.context?.launchFeedbackSummary ?? null,
      goToMarketPlan: project.context?.goToMarketPlan ?? null,
      promotionExecutionPlan: project.context?.promotionExecutionPlan ?? null,
      launchMarketingExecution: project.context?.launchMarketingExecution ?? null,
      gtmMetricSchema: project.context?.gtmMetricSchema ?? null,
      acquisitionSourceMetrics: project.context?.acquisitionSourceMetrics ?? null,
      firstTouchAttribution: project.context?.firstTouchAttribution ?? null,
      preAuthConversionEvents: project.context?.preAuthConversionEvents ?? null,
      websiteActivationFunnel: project.context?.websiteActivationFunnel ?? null,
      conversionAnalytics: project.context?.conversionAnalytics ?? null,
      launchPerformanceDashboard: project.context?.launchPerformanceDashboard ?? null,
      gtmOptimizationPlan: project.context?.gtmOptimizationPlan ?? null,
      growthLoopManagement: project.context?.growthLoopManagement ?? null,
      ownerControlPlane: project.context?.ownerControlPlane ?? null,
      ownerControlCenter: project.context?.ownerControlCenter ?? null,
      dailyOwnerOverview: project.context?.dailyOwnerOverview ?? null,
      ownerPriorityQueue: project.context?.ownerPriorityQueue ?? null,
      ownerActionRecommendations: project.context?.ownerActionRecommendations ?? null,
      ownerDecisionDashboard: project.context?.ownerDecisionDashboard ?? null,
      ownerDailyWorkflow: project.context?.ownerDailyWorkflow ?? null,
      ownerFocusArea: project.context?.ownerFocusArea ?? null,
      ownerTaskList: project.context?.ownerTaskList ?? null,
      ownerRoutinePlan: project.context?.ownerRoutinePlan ?? null,
      ownerRevenueView: project.context?.ownerRevenueView ?? null,
      ownerCostView: project.context?.ownerCostView ?? null,
      profitMarginSummary: project.context?.profitMarginSummary ?? null,
      unitEconomicsDashboard: project.context?.unitEconomicsDashboard ?? null,
      cashFlowProjection: project.context?.cashFlowProjection ?? null,
      ownerUserAnalytics: project.context?.ownerUserAnalytics ?? null,
      featureUsageSummary: project.context?.featureUsageSummary ?? null,
      decisionAccuracySummary: project.context?.decisionAccuracySummary ?? null,
      automationImpactSummary: project.context?.automationImpactSummary ?? null,
      roadmapTracking: project.context?.roadmapTracking ?? null,
      ownerOperationsSignals: project.context?.ownerOperationsSignals ?? null,
      prioritizedOwnerAlerts: project.context?.prioritizedOwnerAlerts ?? null,
      ownerAlertFeed: project.context?.ownerAlertFeed ?? null,
      ownerIncident: project.context?.ownerIncident ?? null,
      outageResponsePlan: project.context?.outageResponsePlan ?? null,
      incidentTimeline: project.context?.incidentTimeline ?? null,
      rootCauseSummary: project.context?.rootCauseSummary ?? null,
      liveProjectMonitoring: project.context?.liveProjectMonitoring ?? null,
      maintenanceBacklog: project.context?.maintenanceBacklog ?? null,
      userActivityEvent: project.context?.userActivityEvent ?? null,
      userActivityHistory: project.context?.userActivityHistory ?? null,
      userSessionMetric: project.context?.userSessionMetric ?? project.manualContext?.userSessionMetric ?? null,
      userSessionHistory: project.context?.userSessionHistory ?? null,
      userAgentMapping: project.context?.userAgentMapping ?? null,
      returningUserMetric: project.context?.returningUserMetric ?? null,
      retentionSummary: project.context?.retentionSummary ?? null,
      retentionCurveAnalysis: project.context?.retentionCurveAnalysis ?? null,
      blockedTaskOutcomes: project.context?.blockedTaskOutcomes ?? project.state?.blockedTaskOutcomes ?? [],
      taskExecutionMetric: project.context?.taskExecutionMetric ?? null,
      taskExecutionCounters: project.context?.taskExecutionCounters ?? null,
      taskThroughputSummary: project.context?.taskThroughputSummary ?? null,
      baselineEstimate: project.context?.baselineEstimate ?? null,
      timeSavedMetric: project.context?.timeSavedMetric ?? null,
      timeSaved: project.context?.timeSaved ?? null,
      humanUserProductivity: project.context?.humanUserProductivity ?? null,
      productivitySummary: project.context?.productivitySummary ?? null,
      outcomeEvaluation: project.context?.outcomeEvaluation ?? null,
      actionSuccessScore: project.context?.actionSuccessScore ?? null,
      outcomeFeedbackState: project.context?.outcomeFeedbackState ?? null,
      goalProgressState: project.context?.goalProgressState ?? null,
      milestoneTracking: project.context?.milestoneTracking ?? null,
      productIterationInsights: project.context?.productIterationInsights ?? null,
      canonicalBacklogRegeneration: project.context?.canonicalBacklogRegeneration ?? null,
      projectIdentityProfile: project.context?.projectIdentityProfile ?? null,
      identityCompleteness: project.context?.identityCompleteness ?? null,
      instantValuePlan: project.context?.instantValuePlan ?? null,
      decisionIntelligence: project.context?.decisionIntelligence ?? null,
      approvalRequest: project.context?.approvalRequest ?? null,
      approvalRule: project.context?.approvalRule ?? null,
      approvalTrigger: project.context?.approvalTrigger ?? null,
      approvalRecords: project.context?.approvalRecords ?? [],
      approvalRecord: project.context?.approvalRecord ?? null,
      approvalStatus: project.context?.approvalStatus ?? null,
      securityAuditRecord: project.context?.securityAuditRecord ?? null,
      gatingDecision: project.context?.gatingDecision ?? null,
      approvalAuditTrail: project.context?.approvalAuditTrail ?? null,
      approvalOutcome: project.context?.approvalOutcome ?? null,
      serviceReliabilityDashboard: project.context?.serviceReliabilityDashboard ?? null,
      postExecutionEvaluation: project.context?.postExecutionEvaluation ?? null,
      postExecutionReport: project.context?.postExecutionReport ?? null,
      crossLayerFeedbackState: project.context?.crossLayerFeedbackState ?? null,
      adaptiveExecutionDecision: project.context?.adaptiveExecutionDecision ?? null,
      systemOptimizationPlan: project.context?.systemOptimizationPlan ?? null,
      canonicalBacklogRegeneration: project.context?.canonicalBacklogRegeneration ?? null,
      policySchema: project.context?.policySchema ?? null,
      agentGovernancePolicy: project.context?.agentGovernancePolicy ?? null,
      budgetDecision: project.context?.budgetDecision ?? null,
      actionPolicy: project.context?.actionPolicy ?? null,
      policyDecision: project.context?.policyDecision ?? null,
      policyViolations: project.context?.policyViolations ?? [],
      deployPolicyDecision: project.context?.deployPolicyDecision ?? null,
      enforcementResult: project.context?.enforcementResult ?? null,
      policyTrace: project.context?.policyTrace ?? null,
      diffPreviewSchema: project.context?.diffPreviewSchema ?? null,
      codeDiff: project.context?.codeDiff ?? null,
      migrationDiff: project.context?.migrationDiff ?? null,
      infraDiff: project.context?.infraDiff ?? null,
      impactSummary: project.context?.impactSummary ?? null,
      riskFlags: project.context?.riskFlags ?? [],
      diffPreview: project.context?.diffPreview ?? null,
      businessBottleneck: project.context?.businessBottleneck ?? null,
      bottleneckState: project.context?.bottleneckState ?? null,
      systemBottleneckSummary: project.context?.systemBottleneckSummary ?? null,
      activeBottleneck: project.context?.activeBottleneck ?? null,
      scoredBottleneck: project.context?.scoredBottleneck ?? null,
      unblockPlan: project.context?.unblockPlan ?? null,
      updatedBottleneckState: project.context?.updatedBottleneckState ?? null,
      explanationSchema: project.context?.explanationSchema ?? null,
      nextActionExplanation: project.context?.nextActionExplanation ?? null,
      failureExplanation: project.context?.failureExplanation ?? null,
      approvalExplanation: project.context?.approvalExplanation ?? null,
      changeExplanation: project.context?.changeExplanation ?? null,
      projectExplanation: project.context?.projectExplanation ?? null,
      crossFunctionalTaskGraph: project.context?.crossFunctionalTaskGraph ?? null,
      growthMarketingPlan: project.context?.growthMarketingPlan ?? [],
      userIdentity: project.context?.userIdentity ?? null,
      authenticationState: project.context?.authenticationState ?? null,
      ownerAuthState: project.context?.ownerAuthState ?? null,
      ownerMfaDecision: project.context?.ownerMfaDecision ?? null,
      deviceTrustDecision: project.context?.deviceTrustDecision ?? null,
      sensitiveActionConfirmation: project.context?.sensitiveActionConfirmation ?? null,
      stepUpAuthDecision: project.context?.stepUpAuthDecision ?? null,
      privilegedModeState: project.context?.privilegedModeState ?? null,
      ownerAccessDecision: project.context?.ownerAccessDecision ?? null,
      criticalOperationDecision: project.context?.criticalOperationDecision ?? null,
      sessionState: project.context?.sessionState ?? null,
      securitySignals: project.context?.securitySignals ?? null,
      sessionSecurityDecision: project.context?.sessionSecurityDecision ?? null,
      authenticationRouteDecision: project.context?.authenticationRouteDecision ?? null,
      featureFlagSchema: project.context?.featureFlagSchema ?? null,
      featureFlagDecision: project.context?.featureFlagDecision ?? null,
      killSwitchDecision: project.context?.killSwitchDecision ?? null,
      tokenBundle: project.context?.tokenBundle ?? null,
      verificationFlowState: project.context?.verificationFlowState ?? null,
      authenticationViewState: project.context?.authenticationViewState ?? null,
      postAuthRedirect: project.context?.postAuthRedirect ?? null,
      projectCreationExperience: project.context?.projectCreationExperience ?? null,
      projectCreationRedirect: project.context?.projectCreationRedirect ?? null,
      nexusAppShellSchema: project.context?.nexusAppShellSchema ?? null,
      authenticatedAppShell: project.context?.authenticatedAppShell ?? null,
      navigationRouteSurface: project.context?.navigationRouteSurface ?? null,
      onboardingProgress: project.context?.onboardingProgress ?? null,
      onboardingViewState: project.context?.onboardingViewState ?? null,
      onboardingCompletionDecision: project.context?.onboardingCompletionDecision ?? null,
      onboardingStateHandoff: project.context?.onboardingStateHandoff ?? null,
      artifactExpectation: project.context?.artifactExpectation
        ?? project.context?.proofArtifact?.artifactExpectation
        ?? null,
      generationIntent: project.context?.generationIntent
        ?? project.context?.aiDesignRequest?.generationIntent
        ?? null,
      projectPermissionSchema: project.context?.projectPermissionSchema ?? null,
      roleCapabilityMatrix: project.context?.roleCapabilityMatrix ?? null,
      projectAuthorizationDecision: project.context?.projectAuthorizationDecision ?? null,
      privilegedAuthorityDecision: project.context?.privilegedAuthorityDecision ?? null,
      tenantIsolationSchema: project.context?.tenantIsolationSchema ?? null,
      workspaceIsolationDecision: project.context?.workspaceIsolationDecision ?? null,
      tenantBoundaryEvidence: project.context?.tenantBoundaryEvidence ?? null,
      leakageAlert: project.context?.leakageAlert ?? null,
      projectOwnershipBinding: project.context?.projectOwnershipBinding ?? null,
      initialProjectStateContract: project.context?.initialProjectStateContract ?? null,
      initialProjectState: project.context?.initialProjectState ?? null,
      initialProjectStateValidation: project.context?.initialProjectStateValidation ?? null,
      stateValidationIssues: project.context?.stateValidationIssues ?? [],
      initialTasks: project.context?.initialTasks ?? [],
      taskSeedMetadata: project.context?.taskSeedMetadata ?? null,
      selectedTask: project.context?.selectedTask ?? null,
      selectionReason: project.context?.selectionReason ?? null,
      nextTaskPresentation: project.context?.nextTaskPresentation ?? null,
      nextTaskApprovalPanel: project.context?.nextTaskApprovalPanel ?? null,
      recommendationDisplay: project.context?.recommendationDisplay ?? null,
      recommendationSummaryPanel: project.context?.recommendationSummaryPanel ?? null,
      aiDesignRequest: project.context?.aiDesignRequest ?? null,
      aiDesignProposal: project.context?.aiDesignProposal ?? null,
      aiDesignProviderResult: project.context?.aiDesignProviderResult ?? null,
      aiDesignServiceResult: project.context?.aiDesignServiceResult ?? null,
      aiDesignExecutionState: project.context?.aiDesignExecutionState ?? null,
      aiGenerationObservability: project.context?.aiGenerationObservability ?? null,
      providerLatencyFailureTracker: project.context?.providerLatencyFailureTracker ?? null,
      generationSuccessAcceptanceTracker: project.context?.generationSuccessAcceptanceTracker ?? null,
      promptContractFailureTracker: project.context?.promptContractFailureTracker ?? null,
      aiGenerationReviewDashboard: project.context?.aiGenerationReviewDashboard ?? null,
      generatedSurfaceProofSchema: project.context?.generatedSurfaceProofSchema ?? null,
      generatedAccessibilityValidationEngine: project.context?.generatedAccessibilityValidationEngine ?? null,
      generatedSurfacePerformanceBudgetValidator: project.context?.generatedSurfacePerformanceBudgetValidator ?? null,
      generatedBrandConsistencyValidator: project.context?.generatedBrandConsistencyValidator ?? null,
      editableProposal: project.context?.editableProposal ?? null,
      editedProposal: project.context?.editedProposal ?? null,
      proposalEditHistory: project.context?.proposalEditHistory ?? null,
      partialAcceptanceDecision: project.context?.partialAcceptanceDecision ?? null,
      remainingProposalScope: project.context?.remainingProposalScope ?? null,
      cockpitRecommendationSurface: project.context?.cockpitRecommendationSurface ?? null,
      aiControlCenterSurface: project.context?.aiControlCenterSurface ?? null,
      stateBootstrapPayload: project.context?.stateBootstrapPayload ?? null,
      workspaceModel: project.context?.workspaceModel ?? null,
      workspaceMode: project.context?.workspaceMode ?? null,
      workspaceModeDefinitions: project.context?.workspaceModeDefinitions ?? null,
      membershipRecord: project.context?.membershipRecord ?? null,
      accessDecision: project.context?.accessDecision ?? null,
      collaborationEvent: project.context?.collaborationEvent ?? null,
      projectPresenceState: project.context?.projectPresenceState ?? null,
      invitationRecord: project.context?.invitationRecord ?? null,
      roleAssignment: project.context?.roleAssignment ?? null,
      workspaceSettings: project.context?.workspaceSettings ?? null,
      nexusPersistenceSchema: project.context?.nexusPersistenceSchema ?? null,
      migrationPlan: project.context?.migrationPlan ?? null,
      migrationArtifacts: project.context?.migrationArtifacts ?? null,
      entityRepository: project.context?.entityRepository ?? [],
      storageRecord: project.context?.storageRecord ?? null,
      dataPrivacyClassification: project.context?.dataPrivacyClassification ?? null,
      platformCostMetric: project.context?.platformCostMetric ?? null,
      aiUsageMetric: project.context?.aiUsageMetric ?? null,
      workspaceComputeMetric: project.context?.workspaceComputeMetric ?? null,
      buildDeployCostMetric: project.context?.buildDeployCostMetric ?? null,
      storageCostMetric: project.context?.storageCostMetric ?? null,
      costSummary: project.context?.costSummary ?? null,
      normalizedBillingEvents: project.manualContext?.normalizedBillingEvents ?? [],
      billableUsage: project.context?.billableUsage ?? null,
      costVisibilityPayload: project.context?.costVisibilityPayload ?? null,
      costDashboardModel: project.context?.costDashboardModel ?? null,
      workspaceMode: project.context?.workspaceMode ?? null,
      workspaceModeDefinitions: project.context?.workspaceModeDefinitions ?? null,
      reasonableUsagePolicy: project.context?.reasonableUsagePolicy ?? null,
      billingPlanSchema: project.context?.billingPlanSchema ?? null,
      entitlementDecision: project.context?.entitlementDecision ?? null,
      workspaceBillingState: project.context?.workspaceBillingState ?? null,
      payingUserMetrics: project.context?.payingUserMetrics ?? null,
      revenueSummary: project.context?.revenueSummary ?? null,
      billingGuardDecision: project.context?.billingGuardDecision ?? null,
      billingApprovalRequest: project.context?.billingApprovalRequest ?? null,
      subscriptionState: project.context?.subscriptionState ?? null,
      billingSettingsModel: project.context?.billingSettingsModel ?? null,
      costAwareActionSelection: project.context?.costAwareActionSelection ?? null,
      privacyPolicyDecision: project.context?.privacyPolicyDecision ?? null,
      privacyRightsResult: project.context?.privacyRightsResult ?? project.privacyRightsResult ?? null,
      backupStrategy: project.context?.backupStrategy ?? null,
      restorePlan: project.context?.restorePlan ?? null,
      userJourneys: project.context?.userJourneys ?? null,
      journeySteps: project.context?.journeySteps ?? [],
      journeyStateRegistry: project.context?.journeyStateRegistry ?? null,
      journeyTransitionRegistry: project.context?.journeyTransitionRegistry ?? [],
      journeyMap: project.context?.journeyMap ?? null,
      screenInventory: project.context?.screenInventory ?? null,
      screenFlowMap: project.context?.screenFlowMap ?? null,
      screenContracts: project.context?.screenContracts ?? [],
      mobileChecklist: project.context?.mobileChecklist ?? null,
      screenStates: project.context?.screenStates ?? null,
      screenValidationChecklist: project.context?.screenValidationChecklist ?? null,
      designTokens: project.context?.designTokens ?? null,
      typographySystem: project.context?.typographySystem ?? null,
      layoutSystem: project.context?.layoutSystem ?? null,
      colorRules: project.context?.colorRules ?? null,
      interactionStateSystem: project.context?.interactionStateSystem ?? null,
      componentContract: project.context?.componentContract ?? null,
      primitiveComponents: project.context?.primitiveComponents ?? null,
      layoutComponents: project.context?.layoutComponents ?? null,
      feedbackComponents: project.context?.feedbackComponents ?? null,
      navigationComponents: project.context?.navigationComponents ?? null,
      dataDisplayComponents: project.context?.dataDisplayComponents ?? null,
      screenTemplateSchema: project.context?.screenTemplateSchema ?? null,
      dashboardTemplate: project.context?.dashboardTemplate ?? null,
      detailPageTemplate: project.context?.detailPageTemplate ?? null,
      workflowTemplate: project.context?.workflowTemplate ?? null,
      managementTemplate: project.context?.managementTemplate ?? null,
      templateVariants: project.context?.templateVariants ?? null,
      primaryActionValidation: project.context?.primaryActionValidation ?? null,
      mobileValidation: project.context?.mobileValidation ?? null,
      stateCoverageValidation: project.context?.stateCoverageValidation ?? null,
      consistencyValidation: project.context?.consistencyValidation ?? null,
      screenReviewReport: project.context?.screenReviewReport ?? null,
      learningInsights: project.context?.learningInsights ?? null,
      learningInsightViewModel: project.context?.learningInsightViewModel ?? null,
      reasoningPanel: project.context?.reasoningPanel ?? null,
      confidenceIndicator: project.context?.confidenceIndicator ?? null,
      userPreferenceSignals: project.context?.userPreferenceSignals ?? null,
      crossProjectPatternPanel: project.context?.crossProjectPatternPanel ?? null,
      learningDisclosure: project.context?.learningDisclosure ?? null,
      aiLearningWorkspaceTemplate: project.context?.aiLearningWorkspaceTemplate ?? null,
      contextRelevanceSchema: project.context?.contextRelevanceSchema ?? null,
      relevanceFilteredContext: project.context?.relevanceFilteredContext ?? null,
      slimmedContextPayload: project.context?.slimmedContextPayload ?? null,
      droppedContextSummary: project.context?.droppedContextSummary ?? null,
      companionState: project.context?.companionState ?? null,
      companionTriggerDecision: project.context?.companionTriggerDecision ?? null,
      companionMessagePriority: project.context?.companionMessagePriority ?? null,
      companionPresence: project.context?.companionPresence ?? null,
      companionDock: project.context?.companionDock ?? null,
      companionPanel: project.context?.companionPanel ?? null,
      animationStateRules: project.context?.animationStateRules ?? null,
      companionModeSettings: project.context?.companionModeSettings ?? null,
      interruptionDecision: project.context?.interruptionDecision ?? null,
      aiCompanionTemplate: project.context?.aiCompanionTemplate ?? null,
      developerWorkspace: project.context?.developerWorkspace ?? null,
      projectWorkbenchLayout: project.context?.projectWorkbenchLayout ?? null,
      fileEditorContract: project.context?.fileEditorContract ?? null,
      commandConsoleView: project.context?.commandConsoleView ?? null,
      dailyWorkspaceSurface: project.context?.dailyWorkspaceSurface ?? null,
      guidedTaskExecutionSurface: project.context?.guidedTaskExecutionSurface ?? null,
      taskStepFlowProgress: project.context?.taskStepFlowProgress ?? null,
      taskApprovalHandoffPanel: project.context?.taskApprovalHandoffPanel ?? null,
      settingsProfileSurface: project.context?.settingsProfileSurface ?? null,
      renderableScreenModel: project.context?.renderableScreenModel ?? null,
      screenComponentMapping: project.context?.screenComponentMapping ?? null,
      activeScreenVariantPlan: project.context?.activeScreenVariantPlan ?? null,
      layoutCompositionPlan: project.context?.layoutCompositionPlan ?? null,
      renderableScreenComposition: project.context?.renderableScreenComposition ?? null,
      renderableDesignProposal: project.context?.renderableDesignProposal ?? null,
      designProposalValidation: project.context?.designProposalValidation ?? null,
      designProposalPreviewState: project.context?.designProposalPreviewState ?? null,
      screenProposalDiff: project.context?.screenProposalDiff ?? null,
      designProposalReviewState: project.context?.designProposalReviewState ?? null,
      generatedAssetProvenanceRecord: project.context?.generatedAssetProvenanceRecord ?? null,
      approvedScreenDelta: project.context?.approvedScreenDelta ?? null,
      proposalApplyDecision: project.context?.proposalApplyDecision ?? null,
      acceptedScreenState: project.context?.acceptedScreenState ?? null,
      integratedDesignProposalState: project.context?.integratedDesignProposalState ?? null,
      runtimeScreenRegistry: project.context?.runtimeScreenRegistry ?? null,
      activeScreenResolver: project.context?.activeScreenResolver ?? null,
      liveRuntimeScreenState: project.context?.liveRuntimeScreenState ?? null,
      previewScreenViewModel: project.context?.previewScreenViewModel ?? null,
      liveLogStream: project.context?.liveLogStream ?? null,
      branchDiffActivityPanel: project.context?.branchDiffActivityPanel ?? null,
      reviewThreadState: project.context?.reviewThreadState ?? null,
      sharedApprovalState: project.context?.sharedApprovalState ?? null,
      collaborationFeed: project.context?.collaborationFeed ?? null,
      projectStateSnapshot: project.context?.projectStateSnapshot ?? null,
      snapshotRecord: project.context?.snapshotRecord ?? null,
      snapshotSchedule: project.context?.snapshotSchedule ?? null,
      snapshotBackupWorker: project.context?.snapshotBackupWorker ?? null,
      snapshotJobState: project.context?.snapshotJobState ?? null,
      snapshotWorkerRuntime: project.context?.snapshotWorkerRuntime ?? null,
      snapshotRetentionPolicy: project.context?.snapshotRetentionPolicy ?? null,
      snapshotRetentionDecision: project.context?.snapshotRetentionDecision ?? null,
      continuityPlan: project.context?.continuityPlan ?? null,
      disasterRecoveryChecklist: project.context?.disasterRecoveryChecklist ?? null,
      businessContinuityState: project.context?.businessContinuityState ?? null,
      stateDiff: project.context?.stateDiff ?? null,
      restoreDecision: project.context?.restoreDecision ?? null,
      rollbackExecutionResult: project.context?.rollbackExecutionResult ?? null,
      artifactBuildPanel: project.context?.artifactBuildPanel ?? null,
      developmentWorkspace: project.context?.developmentWorkspace ?? null,
      reactiveWorkspaceState: project.context?.reactiveWorkspaceState ?? null,
      projectBrainWorkspace: project.context?.projectBrainWorkspace ?? null,
      releaseWorkspace: project.context?.releaseWorkspace ?? null,
      growthWorkspace: project.context?.growthWorkspace ?? null,
      workspaceNavigationModel: project.context?.workspaceNavigationModel ?? null,
      acceptanceScenario: project.context?.acceptanceScenario ?? null,
      acceptanceResult: project.context?.acceptanceResult ?? null,
      onboardingAcceptanceResult: project.context?.onboardingAcceptanceResult ?? null,
      executionAcceptanceResult: project.context?.executionAcceptanceResult ?? null,
      failureRecoveryAcceptanceResult: project.context?.failureRecoveryAcceptanceResult ?? null,
      approvalExplanationAcceptanceResult: project.context?.approvalExplanationAcceptanceResult ?? null,
      executionTopology: project.context?.executionTopology ?? null,
      cloudWorkspaceModel: project.context?.cloudWorkspaceModel ?? null,
      localDevelopmentBridge: project.context?.localDevelopmentBridge ?? null,
      remoteMacRunner: project.context?.remoteMacRunner ?? null,
      ideAgentExecutorContract: project.context?.ideAgentExecutorContract ?? null,
      localCodingAgentAdapter: project.context?.localCodingAgentAdapter ?? null,
      executionModeDecision: project.context?.executionModeDecision ?? null,
      sandboxDecision: project.context?.sandboxDecision ?? null,
      agentLimitDecision: project.context?.agentLimitDecision ?? null,
      agentGovernanceTrace: project.context?.agentGovernanceTrace ?? null,
      bootstrapPlan: project.context?.bootstrapPlan ?? null,
      bootstrapTasks: project.context?.bootstrapTasks ?? [],
      bootstrapAssignments: project.context?.bootstrapAssignments ?? [],
      bootstrapExecutionRequests: project.context?.bootstrapExecutionRequests ?? [],
      bootstrapResolvedSurfaces: project.context?.bootstrapResolvedSurfaces ?? [],
      bootstrapPlannedCommands: project.context?.bootstrapPlannedCommands ?? [],
      bootstrapRawExecutionResults: project.context?.bootstrapRawExecutionResults ?? [],
      bootstrapArtifacts: project.context?.bootstrapArtifacts ?? [],
      bootstrapExecutionMetadata: project.context?.bootstrapExecutionMetadata ?? null,
      bootstrapExecutionResult: project.context?.bootstrapExecutionResult ?? null,
      bootstrapResult: project.context?.bootstrapResult ?? null,
      bootstrapValidation: project.context?.bootstrapValidation ?? null,
      bootstrapStateUpdate: project.context?.bootstrapStateUpdate ?? null,
      firstValueOutput: project.context?.firstValueOutput ?? null,
      bootstrapExecutionGraph: project.context?.bootstrapExecutionGraph ?? null,
      executionProgressSchema: project.context?.executionProgressSchema ?? null,
      normalizedProgressInputs: project.context?.normalizedProgressInputs ?? null,
      progressPhase: project.context?.progressPhase ?? null,
      progressPercent: project.context?.progressPercent ?? 0,
      completionEstimate: project.context?.completionEstimate ?? null,
      progressState: project.context?.progressState ?? null,
      realityProgress: project.context?.realityProgress ?? null,
      firstValueSummary: project.context?.firstValueSummary ?? null,
      realtimeEventStream: project.context?.realtimeEventStream ?? null,
      liveUpdateChannel: project.context?.liveUpdateChannel ?? null,
      formattedLogs: project.context?.formattedLogs ?? [],
      userFacingMessages: project.context?.userFacingMessages ?? [],
      platformTrace: project.context?.platformTrace ?? null,
      platformLogs: project.context?.platformLogs ?? [],
      incidentAlert: project.context?.incidentAlert ?? null,
      auditLogRecord: project.context?.auditLogRecord ?? null,
      projectAuditEvent: project.context?.projectAuditEvent ?? null,
      projectAuditRecord: project.context?.projectAuditRecord ?? null,
      actorActionTrace: project.context?.actorActionTrace ?? null,
      projectAuditPayload: project.context?.projectAuditPayload ?? null,
      ownerAuditView: project.context?.ownerAuditView ?? null,
      systemActivityFeed: project.context?.systemActivityFeed ?? null,
      criticalChangeHistory: project.context?.criticalChangeHistory ?? null,
      notificationPayload: project.context?.notificationPayload ?? null,
      notificationEvent: project.context?.notificationEvent ?? null,
      notificationCenterState: project.context?.notificationCenterState ?? null,
      notificationPreferences: project.context?.notificationPreferences ?? null,
      userPreferenceProfile: project.context?.userPreferenceProfile ?? null,
      complianceConsentState: project.context?.complianceConsentState ?? null,
      complianceAuditSummary: project.context?.complianceAuditSummary ?? null,
      privacyRightsResult: project.context?.privacyRightsResult ?? project.privacyRightsResult ?? null,
      emailDeliveryResult: project.context?.emailDeliveryResult ?? null,
      externalDeliveryResult: project.context?.externalDeliveryResult ?? null,
      releasePlan: project.context?.releasePlan ?? null,
      releaseSteps: project.context?.releaseSteps ?? [],
      buildTargets: project.context?.buildTargets ?? [],
      buildArtifactManifest: project.context?.buildArtifactManifest ?? null,
      artifactRecord: project.context?.artifactRecord ?? null,
      packagingRequirements: project.context?.packagingRequirements ?? null,
      packageFormat: project.context?.packageFormat ?? null,
      packagingManifest: project.context?.packagingManifest ?? null,
      packagedArtifact: project.context?.packagedArtifact ?? null,
      packageVerification: project.context?.packageVerification ?? null,
      testExecutionRequest: project.context?.testExecutionRequest ?? null,
      testRunPlan: project.context?.testRunPlan ?? null,
      rawTestResults: project.context?.rawTestResults ?? null,
      normalizedTestResults: project.context?.normalizedTestResults ?? null,
      qualityGateDecision: project.context?.qualityGateDecision ?? null,
      nextVersion: project.context?.nextVersion ?? null,
      releaseTag: project.context?.releaseTag ?? null,
      releaseRequirementsSchema: project.context?.releaseRequirementsSchema ?? null,
      artifactValidation: project.context?.artifactValidation ?? null,
      metadataValidation: project.context?.metadataValidation ?? null,
      approvalValidation: project.context?.approvalValidation ?? null,
      blockingIssues: project.context?.blockingIssues ?? [],
      validationReport: project.context?.validationReport ?? null,
      hostingAdapter: project.context?.hostingAdapter ?? null,
      deploymentRequest: project.context?.deploymentRequest ?? null,
      providerAdapter: project.context?.providerAdapter ?? null,
      accountRecord: project.context?.accountRecord ?? null,
      providerSession: project.context?.providerSession ?? null,
      providerContractSession: project.context?.providerContractSession ?? null,
      authModeDefinition: project.context?.authModeDefinition ?? null,
      credentialReference: project.context?.credentialReference ?? null,
      encryptedCredential: project.context?.encryptedCredential ?? null,
      credentialVaultRecord: project.context?.credentialVaultRecord ?? null,
      credentialPolicyDecision: project.context?.credentialPolicyDecision ?? null,
      rotationResult: project.context?.rotationResult ?? project.rotationResult ?? null,
      providerConnectorSchema: project.context?.providerConnectorSchema ?? null,
      providerCapabilities: project.context?.providerCapabilities ?? null,
      externalCapabilityRegistry: project.context?.externalCapabilityRegistry ?? null,
      providerOperations: project.context?.providerOperations ?? [],
      providerConnector: project.context?.providerConnector ?? null,
      providerGatewayBoundary: project.context?.providerGatewayBoundary ?? null,
      providerReleaseRegistry: project.context?.providerReleaseRegistry ?? null,
      creativeProviderAssets: project.context?.creativeProviderAssets ?? [],
      providerDegradationState: project.context?.providerDegradationState ?? null,
      circuitBreakerDecision: project.context?.circuitBreakerDecision ?? null,
      providerRecoveryProbe: project.context?.providerRecoveryProbe ?? null,
      externalProviderHealthAndFailover: project.context?.externalProviderHealthAndFailover ?? null,
      executionActionRouting: project.context?.executionActionRouting ?? null,
      actionToProviderMapping: project.context?.actionToProviderMapping ?? null,
      ideAgentExecutorContract: project.context?.ideAgentExecutorContract ?? null,
      localCodingAgentAdapter: project.context?.localCodingAgentAdapter ?? null,
      executionProviderCapabilitySync: project.context?.executionProviderCapabilitySync ?? null,
      designToolImportAdapter: project.context?.designToolImportAdapter ?? null,
      externalExecutionSession: project.context?.externalExecutionSession ?? null,
      ideAgentResultNormalization: project.context?.ideAgentResultNormalization ?? null,
      executionInvocationContract: project.context?.executionInvocationContract ?? null,
      artifactCollectionPipeline: project.context?.artifactCollectionPipeline ?? null,
      canonicalExecutionResultEnvelope: project.context?.canonicalExecutionResultEnvelope ?? null,
      deploymentInvocation: project.context?.deploymentInvocation ?? null,
      deploymentEvidence: project.context?.deploymentEvidence ?? null,
      deploymentResultEnvelope: project.context?.deploymentResultEnvelope ?? null,
      productionHealthValidation: project.context?.productionHealthValidation ?? null,
      launchConfirmationState: project.context?.launchConfirmationState ?? null,
      releaseReadinessEvaluation: project.context?.releaseReadinessEvaluation ?? null,
      verificationResult: project.context?.verificationResult ?? null,
      ownershipPolicy: project.context?.ownershipPolicy ?? null,
      consentRecord: project.context?.consentRecord ?? null,
      guardResult: project.context?.guardResult ?? null,
      linkedAccounts: project.linkedAccounts ?? [],
      preparedArtifact: project.context?.preparedArtifact ?? null,
      releaseStateUpdate: project.context?.releaseStateUpdate ?? null,
      releaseExecutionGraph: project.context?.releaseExecutionGraph ?? null,
      releaseStatus: project.context?.releaseStatus ?? null,
      releaseRun: project.context?.releaseRun ?? null,
      releaseTimeline: project.context?.releaseTimeline ?? null,
      failureSummary: project.context?.failureSummary ?? null,
      failureRecoveryModel: project.context?.failureRecoveryModel ?? null,
      retryPolicy: project.context?.retryPolicy ?? null,
      fallbackStrategy: project.context?.fallbackStrategy ?? null,
      rollbackPlan: project.context?.rollbackPlan ?? null,
      recoveryDecision: project.context?.recoveryDecision ?? null,
      recoveryActions: project.context?.recoveryActions ?? [],
      recoveryOptionsPayload: project.context?.recoveryOptionsPayload ?? null,
      followUpTasks: project.context?.followUpTasks ?? [],
      testReportSummary: project.context?.testReportSummary ?? null,
      pollingRequest: project.context?.pollingRequest ?? null,
      resolvedPoller: project.context?.resolvedPoller ?? null,
      rawStatusResponse: project.context?.rawStatusResponse ?? null,
      statusEvents: project.context?.statusEvents ?? [],
      pollingDecision: project.context?.pollingDecision ?? null,
      pollingMetadata: project.context?.pollingMetadata ?? null,
      lifecycle: defineLifecycleState({
        project,
        domain: project.context?.domain ?? "generic",
        previousLifecycle: project.state?.lifecycle ?? null,
      }),
      knowledge: {
        ...(project.state.knowledge ?? {}),
        knownGaps: project.context.gaps.map((gap) => gap.text),
        git: project.gitSnapshot
          ? {
              provider: project.gitSnapshot.provider,
              repo: project.gitSnapshot.repo?.fullName ?? project.gitSnapshot.repo?.name ?? null,
              branchCount: project.gitSnapshot.branches?.length ?? 0,
              commitCount: project.gitSnapshot.commits?.length ?? 0,
              pullRequestCount: project.gitSnapshot.pullRequests?.length ?? 0,
            }
          : (project.state.knowledge?.git ?? null),
        runtime: project.runtimeSnapshot
          ? {
              ciStatus: project.runtimeSnapshot.ci?.[0]?.status ?? null,
              deploymentStatus: project.runtimeSnapshot.deployments?.[0]?.status ?? null,
              monitoringAlerts: project.runtimeSnapshot.monitoring?.filter((item) => item.status !== "ok").length ?? 0,
              errorCount: project.runtimeSnapshot.errorLogs?.reduce((sum, item) => sum + (item.count ?? 0), 0) ?? 0,
            }
          : (project.state.knowledge?.runtime ?? null),
      },
      stack: {
        frontend: project.context.stack.frontend.value,
        backend: project.context.stack.backend.value,
        database: project.context.stack.database.value,
      },
      product: {
        ...project.state.product,
        hasAuth: project.context.capabilities.auth.value,
        hasPaymentIntegration: project.context.capabilities.payments.value,
      },
    };
    this.persistProjectRecord(project);

    return project.context;
  }

  getPlatformObservability() {
    return this.platformObservabilityTransport.getSnapshot();
  }

  getSystemAuditLogs(filters = {}) {
    return this.systemAuditLogStore.query(filters);
  }

  getSecurityAuditLogs(filters = {}) {
    return this.securityAuditLogStore.query(filters);
  }

  getProjectSnapshots(filters = {}) {
    return this.projectSnapshotStore.query(filters);
  }

  getProjectAuditPayload(projectId, filters = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const actorIdFilter = filters.actorId ?? null;
    const actionTypeFilter = filters.actionType ?? null;
    const sensitivityFilter = filters.sensitivity ?? null;
    const tracePayload = project.context?.actorActionTrace
      ? createProjectAuditApiAndViewerModel({
          actorActionTrace: project.context.actorActionTrace,
          filters: {
            actorId: actorIdFilter,
            actionType: actionTypeFilter,
            sensitivity: sensitivityFilter,
          },
        }).projectAuditPayload
      : null;
    const traceEntries = Array.isArray(tracePayload?.entries) ? tracePayload.entries : [];
    const auditLogEntries = this.getSystemAuditLogs({
      projectId,
      actorId: actorIdFilter,
    })
      .map((record) => ({
        entryId: record.auditLogId ?? `project-audit-entry:${projectId}:${Date.now()}`,
        actorId: record.actorId ?? "system",
        actorLabel: record.actorId ?? record.actorType ?? "system",
        actorType: record.actorType ?? "system",
        actionType: record.actionType ?? "system.observed",
        category: record.category ?? "system",
        headline: record.summary ?? record.actionType ?? "Project action observed",
        outcomeStatus: record.status ?? "recorded",
        timestamp: record.timestamp ?? null,
        sensitivity: record.riskLevel ?? "low",
        traceId: record.traceId ?? null,
        resource: {
          resourceType: record.targetType ?? "project",
          resourceId: record.targetId ?? projectId,
        },
        providerSideEffects: [],
        affectedArtifacts: [],
        summary: {
          providerEffectCount: 0,
          artifactCount: 0,
          hasExecutionOutcome: Boolean(record.status),
        },
      }))
      .filter((entry) => (actionTypeFilter ? entry.actionType === actionTypeFilter : true))
      .filter((entry) => (sensitivityFilter ? entry.sensitivity === sensitivityFilter : true));

    const mergedEntriesById = new Map();
    for (const entry of [...traceEntries, ...auditLogEntries]) {
      if (entry?.entryId) {
        mergedEntriesById.set(entry.entryId, entry);
      }
    }

    const entries = [...mergedEntriesById.values()].sort((left, right) => {
      const leftTs = Date.parse(left.timestamp ?? 0);
      const rightTs = Date.parse(right.timestamp ?? 0);
      return rightTs - leftTs;
    });

    return {
      projectAuditPayloadId: `project-audit-payload:${projectId}`,
      projectId,
      filters: {
        actorId: actorIdFilter,
        actionType: actionTypeFilter,
        sensitivity: sensitivityFilter,
      },
      entries,
      viewerModel: {
        tableColumns: ["actor", "action", "status", "sensitivity", "timestamp"],
        emptyState: entries.length > 0 ? null : "No matching audit activity found",
        supportsFiltering: true,
      },
      summary: {
        totalEntries: entries.length,
        filtered: Boolean(actorIdFilter || actionTypeFilter || sensitivityFilter),
        latestEntryId: entries[0]?.entryId ?? null,
      },
    };
  }

  scanProject(projectId, overridePath) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const scan = scanProject(overridePath ?? project.path, {
      gitSnapshot: project.gitSnapshot,
      notionSnapshot: project.notionSnapshot,
    });
    this.applyScanToProject(project, scan, { persistPath: true });
    this.rebuildContext(projectId);
    return scan;
  }

  selectSkeletonChoice({ projectId, candidateId = "", selectedBy = "user", approveDirectionSwitch = false } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }
    const runtimeSkeletonTruth = project.runtimeSkeletonTruth
      ?? project.context?.runtimeSkeletonTruth
      ?? project.state?.runtimeSkeletonTruth
      ?? buildRuntimeSkeletonTruthEnvelope({ project });
    const productDomainSkeleton = project.productDomainSkeleton
      ?? project.context?.productDomainSkeleton
      ?? project.state?.productDomainSkeleton
      ?? runtimeSkeletonTruth.productDomainSkeleton
      ?? null;
    const currentChoiceTruth = project.skeletonChoiceTruth
      ?? project.context?.skeletonChoiceTruth
      ?? project.state?.skeletonChoiceTruth
      ?? buildSkeletonChoiceTruthEnvelope({
        project,
        runtimeSkeletonTruth,
        productDomainSkeleton,
      });
    const selectionResult = selectSkeletonChoiceCandidate({
      skeletonChoiceTruth: currentChoiceTruth,
      candidateId,
      selectedBy,
      approveDirectionSwitch,
    });
    const skeletonChoiceTruth = selectionResult.skeletonChoiceTruth;
    const runtimeLearningEvents = selectionResult.ok
      ? mergeRuntimeLearningEvents(
          project.runtimeLearningEvents ?? project.context?.runtimeLearningEvents ?? project.state?.runtimeLearningEvents ?? [],
          createSkeletonChoiceLearningEvents({
            project,
            skeletonChoiceTruth,
            selectionRecord: selectionResult.selectionRecord,
            selectedCandidate: selectionResult.selectedCandidate,
          }),
        )
      : project.runtimeLearningEvents ?? project.context?.runtimeLearningEvents ?? project.state?.runtimeLearningEvents ?? [];
    const runtimeLearningDecisionHints = buildRuntimeLearningDecisionHints(runtimeLearningEvents);

    project.skeletonChoiceTruth = skeletonChoiceTruth;
    project.runtimeLearningEvents = runtimeLearningEvents;
    project.runtimeLearningDecisionHints = runtimeLearningDecisionHints;
    project.context = {
      ...(project.context ?? {}),
      skeletonChoiceTruth,
      runtimeLearningEvents,
      runtimeLearningDecisionHints,
    };
    project.state = {
      ...(project.state ?? {}),
      skeletonChoiceTruth,
      runtimeLearningEvents,
      runtimeLearningDecisionHints,
    };
    this.persistProjectRecord(project);
    return {
      ...selectionResult,
      project: this.serializeProject(project),
    };
  }

  applyVisualBuildChange({ projectId, requestText = "", operationId = "", payload = {}, requestedBy = "visual-build-agent" } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }
    const visualBuildTruth = applyVisualBuildTruth({
      project,
      requestText,
      operationId,
      payload,
      requestedBy,
    });
    project.visualBuildTruth = visualBuildTruth;
    project.context = {
      ...(project.context ?? {}),
      visualBuildTruth,
    };
    project.state = {
      ...(project.state ?? {}),
      visualBuildTruth,
    };
    this.persistProjectRecord(project);
    return {
      visualBuildTruth,
      project: this.serializeProject(project),
    };
  }

  applyBuildMutation({ projectId, requestText = "", operationId = "", payload = {}, requestedBy = "build-agent" } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }
    const mutationResult = applyBuildMutationTruth({
      project,
      requestText,
      operationId,
      payload,
      requestedBy,
    });
    const history = [
      ...(project.buildMutationHistory ?? project.context?.buildMutationHistory ?? project.state?.buildMutationHistory ?? []),
      mutationResult.historyRecord,
    ].filter(Boolean);
    const intents = [
      ...(project.buildMutationIntents ?? project.context?.buildMutationIntents ?? project.state?.buildMutationIntents ?? []),
      mutationResult.intent,
    ].filter(Boolean);
    const runtimeLearningEvents = mergeRuntimeLearningEvents(
      project.runtimeLearningEvents ?? project.context?.runtimeLearningEvents ?? project.state?.runtimeLearningEvents ?? [],
      createBuildMutationLearningEvents({
        project,
        mutationResult,
      }),
    );
    const runtimeLearningDecisionHints = buildRuntimeLearningDecisionHints(runtimeLearningEvents);

    project.runtimeSkeletonTruth = mutationResult.runtimeSkeletonTruth;
    project.productDomainSkeleton = mutationResult.productDomainSkeleton;
    project.productOwnedBackendSkeleton = mutationResult.productOwnedBackendSkeleton;
    project.runtimeLearningEvents = runtimeLearningEvents;
    project.runtimeLearningDecisionHints = runtimeLearningDecisionHints;
    project.buildMutationTruth = {
      taskId: "BUILD-MUTATION-TRUTH-001",
      sliceTaskId: "SLICE-006",
      status: mutationResult.ok ? "applied" : "failed-safely",
      lastMutationId: mutationResult.intent.mutationId,
      lastOperationId: mutationResult.intent.operationId,
      lastError: mutationResult.error,
    };
    project.buildMutationHistory = history;
    project.buildMutationIntents = intents;
    project.context = {
      ...(project.context ?? {}),
      runtimeSkeletonTruth: project.runtimeSkeletonTruth,
      productDomainSkeleton: project.productDomainSkeleton,
      productOwnedBackendSkeleton: project.productOwnedBackendSkeleton,
      buildMutationTruth: project.buildMutationTruth,
      buildMutationHistory: history,
      buildMutationIntents: intents,
      runtimeLearningEvents,
      runtimeLearningDecisionHints,
    };
    project.state = {
      ...(project.state ?? {}),
      runtimeSkeletonTruth: project.runtimeSkeletonTruth,
      productDomainSkeleton: project.productDomainSkeleton,
      productOwnedBackendSkeleton: project.productOwnedBackendSkeleton,
      buildMutationTruth: project.buildMutationTruth,
      buildMutationHistory: history,
      buildMutationIntents: intents,
      runtimeLearningEvents,
      runtimeLearningDecisionHints,
    };
    this.persistProjectRecord(project);
    return {
      mutation: mutationResult,
      project: this.serializeProject(project),
    };
  }

  applyScanToProject(project, scan, { persistPath = true } = {}) {
    if (!project || !scan) {
      return null;
    }

    if (persistPath && typeof scan.path === "string" && scan.path.length > 0) {
      project.path = scan.path;
    }
    project.scan = scan;
    project.stack =
      [...scan.stack.backend, ...scan.stack.frontend, ...scan.stack.database].join(", ") || project.stack;
    project.state.knowledge = {
      ...(project.state.knowledge ?? {}),
      knownGaps: scan.gaps,
      documents: {
        summary: scan.knowledge?.summary ?? null,
        readmePath: scan.knowledge?.readme?.path ?? null,
        docCount: scan.knowledge?.docs?.length ?? 0,
        prDiscussionCount: scan.knowledge?.prDiscussions?.length ?? 0,
        notionPageCount: scan.knowledge?.notionPages?.length ?? 0,
      },
      externalKnowledge: scan.knowledge?.integrations ?? null,
    };
    project.state.stack = {
      frontend: scan.stack.frontend.join(", ") || "לא זוהה",
      backend: scan.stack.backend.join(", ") || "לא זוהה",
      database: scan.stack.database.join(", ") || "לא זוהה",
    };
    project.state.product = {
      ...(project.state.product ?? {}),
      hasAuth: scan.findings.hasAuth,
    };
    return scan;
  }

  async syncCasinoProject(projectId, overrides = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const source = {
      ...(project.source ?? {}),
      ...overrides,
    };
    const snapshot = await this.casinoConnector.fetchSnapshot(source);
    const adapter = this.sourceAdapters.resolve(source);
    if (!adapter) {
      throw new Error(`No source adapter registered for type: ${source.type ?? "unknown"}`);
    }
    const normalized = adapter.normalize({
      snapshot,
      source,
      existingGoal: project.goal,
    });

    project.name = normalized.name;
    project.goal = normalized.goal;
    project.status = normalized.status;
    project.stack = normalized.stack;
    project.state = normalized.state;
    project.approvals = normalized.approvals;
    project.externalSnapshot = normalized.externalSnapshot;
    project.source = source;
    this.rebuildContext(projectId);

    this.runCycle(projectId);
    return this.serializeProject(project);
  }

  async connectGitProject(projectId, overrides = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const source = {
      ...(project.gitSource ?? {}),
      ...overrides,
    };

    const snapshot = await this.gitConnector.fetchSnapshot(source);
    project.gitSource = source;
    project.gitSnapshot = snapshot;
    project.state.knowledge = {
      ...(project.state.knowledge ?? {}),
      git: {
        provider: snapshot.provider,
        repo: snapshot.repo.fullName,
        branchCount: snapshot.branches.length,
        commitCount: snapshot.commits.length,
        pullRequestCount: snapshot.pullRequests.length,
      },
    };
    project.approvals = [
      ...new Set([
        ...(project.approvals ?? []),
        ...(snapshot.repo.defaultBranch ? [`אשר עבודה מול הענף הראשי ${snapshot.repo.defaultBranch}`] : []),
      ]),
    ];
    this.rebuildContext(projectId);
    return this.serializeProject(project);
  }

  async syncRuntimeSources(projectId, overrides = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const source = {
      ...(project.runtimeSource ?? {}),
      ...overrides,
      type: "runtime-sources",
    };

    const snapshot = await this.runtimeConnector.fetchSnapshot(source);
    const adapter = this.sourceAdapters.resolve(source);
    if (!adapter) {
      throw new Error(`No source adapter registered for type: ${source.type ?? "unknown"}`);
    }

    const normalized = adapter.normalize({ snapshot, source });
    project.runtimeSource = source;
    project.runtimeSnapshot = normalized.runtimeSnapshot;
    project.state = {
      ...project.state,
      ...(normalized.statePatch ?? {}),
      knowledge: {
        ...(project.state.knowledge ?? {}),
        knownGaps: [
          ...new Set([
            ...((project.state.knowledge?.knownGaps ?? [])),
            ...(normalized.knownGaps ?? []),
          ]),
        ],
      },
    };
    project.approvals = [...new Set([...(project.approvals ?? []), ...(normalized.approvals ?? [])])];
    this.rebuildContext(projectId);
    return this.serializeProject(project);
  }

  async syncNotionKnowledge(projectId, overrides = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const source = {
      ...(project.notionSource ?? {}),
      ...overrides,
    };

    const snapshot = await this.notionConnector.fetchSnapshot(source);
    project.notionSource = {
      host: source.host ?? "https://api.notion.com/v1",
      pageIds: source.pageIds ?? [],
    };
    project.notionSnapshot = snapshot;
    this.scanProject(projectId, project.path);
    this.rebuildContext(projectId);
    return this.serializeProject(project);
  }

  async analyzeProject(projectId) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const serialized = this.serializeProject(project);
    project.analysis = await this.analyst.analyzeProjectContext({
      project: serialized,
      events: serialized.events,
    });
    return this.serializeProject(project);
  }

  linkExternalAccount(projectId, { providerType, userInput } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const normalizedProviderType =
      typeof providerType === "string" && providerType.trim() ? providerType.trim().toLowerCase() : "generic";
    const metadata = userInput && typeof userInput === "object" ? userInput : {};
    const accountType = typeof metadata.accountType === "string" && metadata.accountType.trim()
      ? metadata.accountType.trim()
      : normalizedProviderType;

    const { accountRecord } = createExternalAccountRegistry({
      accountType,
      accountMetadata: {
        provider: normalizedProviderType,
        accountId: metadata.accountId ?? null,
        projectId: project.id,
        workspaceId: metadata.workspaceId ?? null,
        capabilities: Array.isArray(metadata.capabilities) ? metadata.capabilities : [],
        credentialReference: metadata.credentialReference ?? null,
        connectionMode: metadata.authMode ?? "manual",
        status: "connected",
        metadata,
      },
    });
    const { credentialReference, encryptedCredential, credentialVaultRecord } = createCredentialVaultInterface({
      credentialKey: `${project.id}-${normalizedProviderType}-${metadata.accountId ?? "linked-account"}`,
      credentialValue: metadata.credentialValue ?? null,
    });
    accountRecord.credentialReference = credentialReference;
    const { providerSession } = createProviderConnectorContract({
      providerType: normalizedProviderType,
      credentials: {
        credentialReference,
        authMode: metadata.authMode ?? "manual",
        scopes: Array.isArray(metadata.scopes) ? metadata.scopes : [],
        status: "connected",
      },
    });
    const { providerCapabilities } = createProviderCapabilityDescriptor({ providerSession });
    const { providerOperations } = createProviderOperationContract({ providerSession });
    const { providerConnector } = createProviderConnectorAssembler({
      providerSession,
      providerCapabilities,
      providerOperations,
    });
    const { verificationResult } = createAccountVerificationModule({ providerSession });
    const { providerReleaseRegistry } = buildProviderReleaseRegistry();
    const { providerGatewayBoundary } = buildProviderGatewayBoundary({
      project,
      actor: {
        actorId: metadata.actorId ?? project.userId ?? project.context?.workspaceModel?.ownerUserId ?? null,
        role: metadata.actorRole ?? "owner",
      },
      requestText: metadata.requestText ?? `connect ${normalizedProviderType}`,
      providerType: normalizedProviderType,
      capability: "connect",
      approval: metadata.approval ?? null,
      linkedAccounts: project.linkedAccounts ?? [],
    });

    const linkedAccountPayload = {
      accountRecord,
      credentialReference,
      encryptedCredential,
      credentialVaultRecord,
      providerSession,
      providerCapabilities,
      providerOperations,
      providerConnector,
      providerGatewayBoundary,
      providerReleaseRegistry,
      verificationResult,
    };

    project.linkedAccounts = [
      ...(project.linkedAccounts ?? []).filter((account) => account.accountRecord?.accountId !== accountRecord.accountId),
      linkedAccountPayload,
    ];
    project.providerGatewayBoundary = providerGatewayBoundary;
    project.providerReleaseRegistry = providerReleaseRegistry;
    this.rebuildContext(projectId);

    return {
      linkedAccountPayload,
      linkedAccounts: project.linkedAccounts,
    };
  }

  evaluateProviderGateway(projectId, {
    requestText = "",
    providerType = null,
    capability = null,
    actor = null,
    approval = null,
  } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }
    const { providerGatewayBoundary } = buildProviderGatewayBoundary({
      project,
      actor: actor ?? {
        actorId: project.userId ?? project.context?.workspaceModel?.ownerUserId ?? null,
        role: "owner",
      },
      requestText,
      providerType,
      capability,
      approval,
      linkedAccounts: project.linkedAccounts ?? [],
    });
    const { providerReleaseRegistry } = buildProviderReleaseRegistry();
    project.providerGatewayBoundary = providerGatewayBoundary;
    project.providerReleaseRegistry = providerReleaseRegistry;
    project.context = {
      ...(project.context ?? {}),
      providerGatewayBoundary,
      providerReleaseRegistry,
    };
    this.rebuildContext(projectId);
    return {
      providerGatewayBoundary,
      providerReleaseRegistry,
    };
  }

  normalizeCreativeProviderAsset(projectId, assetInput = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }
    const { creativeProviderAsset } = normalizeCreativeProviderOutput({
      productId: projectId,
      ...assetInput,
    });
    project.creativeProviderAssets = [
      ...(Array.isArray(project.creativeProviderAssets) ? project.creativeProviderAssets : []),
      creativeProviderAsset,
    ];
    project.context = {
      ...(project.context ?? {}),
      creativeProviderAssets: project.creativeProviderAssets,
    };
    this.rebuildContext(projectId);
    return {
      creativeProviderAsset,
      creativeProviderAssets: project.creativeProviderAssets,
    };
  }

  listExternalAccounts(projectId) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    return {
      linkedAccounts: project.linkedAccounts ?? [],
    };
  }

  rotateCredential(projectId, {
    credentialReference,
    rotationRequest,
  } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const { rotationResult, linkedAccounts } = createSecretRotationWorkflow({
      credentialReference,
      rotationRequest,
      project,
    });

    if (Array.isArray(linkedAccounts)) {
      project.linkedAccounts = linkedAccounts;
    }
    project.rotationResult = rotationResult;
    this.rebuildContext(projectId);

    return {
      rotationResult: project.rotationResult,
      linkedAccounts: project.linkedAccounts ?? [],
      project: this.serializeProject(project),
    };
  }

  getReleaseTracking(projectId, releaseRunId) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    this.rebuildContext(projectId);

    const activeReleaseRunId = project.context?.releaseRun?.releaseRunId ?? null;
    if (releaseRunId && activeReleaseRunId && releaseRunId !== activeReleaseRunId) {
      return {
        error: "Release run not found",
      };
    }

    return {
      projectId,
      releaseRunId: activeReleaseRunId,
      releaseStatus: project.context?.releaseStatus ?? null,
      releaseTimeline: project.context?.releaseTimeline ?? null,
      failureSummary: project.context?.failureSummary ?? null,
      followUpTasks: project.context?.followUpTasks ?? [],
    };
  }

  getDiffPreview(projectId, executionRequestId = null) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    this.rebuildContext(projectId);

    const activeExecutionRequestId = project.context?.diffPreviewSchema?.executionPlan?.executionRequestId ?? null;
    if (executionRequestId && activeExecutionRequestId && executionRequestId !== activeExecutionRequestId) {
      return {
        error: "Diff preview not found",
      };
    }

    return {
      projectId,
      executionRequestId: activeExecutionRequestId,
      diffPreview: project.context?.diffPreview ?? null,
      impactSummary: project.context?.impactSummary ?? null,
      riskFlags: project.context?.riskFlags ?? [],
      diffPreviewSchema: project.context?.diffPreviewSchema ?? null,
    };
  }

  getPolicyPayload(projectId, actionType = null) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    this.rebuildContext(projectId);

    const activeActionType = project.context?.policyDecision?.actionType ?? null;
    if (actionType && activeActionType && actionType !== activeActionType) {
      return {
        error: "Policy payload not found",
      };
    }

    return {
      projectId,
      actionType: activeActionType,
      policyDecision: project.context?.policyDecision ?? null,
      policyTrace: project.context?.policyTrace ?? null,
      enforcementResult: project.context?.enforcementResult ?? null,
      actionPolicy: project.context?.actionPolicy ?? null,
      policySchema: project.context?.policySchema ?? null,
    };
  }

  verifyExternalAccount(projectId, { accountId, providerType } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const linkedAccount = (project.linkedAccounts ?? []).find((account) =>
      (accountId && account.accountRecord?.accountId === accountId) ||
      (providerType && account.providerSession?.providerType === providerType));

    if (!linkedAccount) {
      return {
        verificationResult: null,
        error: "Linked account not found",
      };
    }

    const { verificationResult } = createAccountVerificationModule({
      providerSession: linkedAccount.providerSession,
    });
    linkedAccount.verificationResult = verificationResult;
    this.rebuildContext(projectId);

    return {
      verificationResult,
      linkedAccountPayload: linkedAccount,
    };
  }

  unlinkExternalAccount(projectId, accountId) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    const beforeCount = (project.linkedAccounts ?? []).length;
    project.linkedAccounts = (project.linkedAccounts ?? []).filter(
      (account) => account.accountRecord?.accountId !== accountId,
    );
    this.rebuildContext(projectId);

    return {
      removed: beforeCount !== project.linkedAccounts.length,
      linkedAccounts: project.linkedAccounts,
    };
  }

  listApprovals(projectId) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    this.rebuildContext(projectId);

    return {
      approvalPayload: {
        projectId,
        approvalRequest: project.context?.approvalRequest ?? null,
        approvalStatus: project.context?.approvalStatus ?? null,
        approvalRecords: project.context?.approvalRecords ?? [],
        sharedApprovalState: project.context?.sharedApprovalState ?? null,
      },
    };
  }

  buildSyntheticArtifactApprovalRequest(projectId, project) {
    const safeProject = project && typeof project === "object" ? project : {};
    const artifact = safeProject.proofArtifact && typeof safeProject.proofArtifact === "object"
      ? safeProject.proofArtifact
      : {};
    const artifactExpectation = safeProject.context?.artifactExpectation && typeof safeProject.context.artifactExpectation === "object"
      ? safeProject.context.artifactExpectation
      : {};
    const artifactTitle = artifact.title ?? artifactExpectation.title ?? safeProject.name ?? "Artifact";

    return {
      approvalRequestId: `approval:${projectId}:artifact-proof:user-confirmation`,
      projectId,
      actionType: "artifact-proof-confirmation",
      actorType: "user",
      actionPayload: {
        approvalType: "artifact-proof-confirmation",
        artifactId: artifact.artifactId ?? null,
        artifactTitle,
      },
      riskContext: {
        riskLevel: "low",
        reason: `User confirmed ${artifactTitle} as the artifact to advance.`,
        uncertainty: false,
      },
      requestedAt: new Date().toISOString(),
      status: "pending",
    };
  }

  captureApproval(projectId, { approvalRequestId, userInput } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    this.rebuildContext(projectId);

    const activeRequest = project.context?.approvalRequest;
    const syntheticArtifactRequest = this.buildSyntheticArtifactApprovalRequest(projectId, project);
    const shouldUseSyntheticArtifactRequest = approvalRequestId
      && syntheticArtifactRequest?.approvalRequestId === approvalRequestId
      && activeRequest?.approvalRequestId !== approvalRequestId;
    const request = shouldUseSyntheticArtifactRequest
      ? syntheticArtifactRequest
      : (activeRequest ?? syntheticArtifactRequest);
    if (!request || (approvalRequestId && request.approvalRequestId !== approvalRequestId)) {
      return {
        approvalPayload: null,
        error: "Approval request not found",
      };
    }

    const payload = userInput && typeof userInput === "object" ? userInput : {};
    const normalizedDecision = typeof payload.decision === "string" && payload.decision.trim()
      ? payload.decision.trim().toLowerCase()
      : payload.approved === false
        ? "rejected"
        : "approved";
    const { approvalRecord } = createApprovalRecordStore({
      approvalRequest: {
        ...request,
        actionPayload: {
          ...request.actionPayload,
          approvalType: project.context?.approvalTrigger?.approvalType ?? request.actionPayload?.approvalType ?? null,
        },
      },
      approvalDecision: {
        decision: normalizedDecision,
        approved: normalizedDecision === "approved",
        revoked: normalizedDecision === "revoked",
        reason: payload.reason ?? null,
        actorId: payload.actorId ?? "user",
        expiresInHours: payload.expiresInHours,
        actorRole: payload.actorRole ?? null,
        actorName: payload.actorName ?? null,
      },
    });

    project.approvalRecords = [
      approvalRecord,
      ...((project.approvalRecords ?? []).filter((record) => record.approvalRequestId !== approvalRecord.approvalRequestId)),
    ];

    if (normalizedDecision === "approved") {
      const repeatedLoopContinuation = buildRepeatedLoopContinuation({
        projectId,
        project,
        approvalCount: project.approvalRecords.length,
      });
      project.repeatedLoopContinuation = repeatedLoopContinuation;
      project.state = {
        ...(project.state ?? {}),
        repeatedLoopContinuation,
      };
      project.context = {
        ...(project.context ?? {}),
        repeatedLoopContinuation,
      };
    }

    this.rebuildContext(projectId);

    if (normalizedDecision === "approved") {
      this.runCycle(projectId);
    }

    const refreshedProject = this.projects.get(projectId) ?? project;
    this.rebuildContext(projectId);

    return {
      approvalPayload: {
        approvalRecord,
        approvalStatus: refreshedProject.context?.approvalStatus ?? null,
        approvalRecords: refreshedProject.context?.approvalRecords ?? [],
        sharedApprovalState: refreshedProject.context?.sharedApprovalState ?? null,
      },
    };
  }

  revokeApproval(projectId, { approvalRequestId, userInput } = {}) {
    return this.captureApproval(projectId, {
      approvalRequestId,
      userInput: {
        ...(userInput && typeof userInput === "object" ? userInput : {}),
        decision: "revoked",
      },
    });
  }

  runCycle(projectId) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }
    if (!Array.isArray(project.agents)) {
      project.agents = this.createDefaultAgents();
    }
    this.rebuildContext(projectId);

    const completedTaskIds = new Set(
      this.getProjectEvents(projectId)
        .filter((event) => event.type === "task.completed")
        .map((event) => event.payload.taskId),
    );

    const cycleProjectState = {
      ...(project.state ?? {}),
      context: {
        ...(project.state?.context ?? {}),
        domain:
          project.context?.domain
          ?? project.state?.context?.domain
          ?? project.projectIntake?.projectType
          ?? project.state?.intake?.projectType
          ?? "generic",
        gaps: project.state?.context?.gaps ?? [],
        flows: project.state?.context?.flows ?? [],
      },
      intake: project.projectIntake ?? project.state?.intake ?? null,
      importedAssetTaskExtraction:
        project.context?.importedAssetTaskExtraction
        ?? project.state?.importedAssetTaskExtraction
        ?? null,
      maintenanceBacklog:
        project.context?.maintenanceBacklog
        ?? project.state?.maintenanceBacklog
        ?? null,
    };

    const cycle = this.orchestrator.runCycle({
      projectId,
      projectState: cycleProjectState,
      agents: project.agents,
      completedTaskIds,
    });

    const runtimeResults = this.runtime.processPendingAssignments({ projectId });
    const projectEvents = this.getProjectEvents(projectId);
    const completedTaskIdsAfterRuntime = new Set(
      projectEvents
        .filter((event) => event.type === "task.completed")
        .map((event) => event.payload.taskId)
        .filter(Boolean),
    );
    const failedTaskIdsAfterRuntime = new Set(
      projectEvents
        .filter((event) => event.type === "task.failed")
        .map((event) => event.payload.taskId)
        .filter(Boolean),
    );
    const activeTaskIdsAfterRuntime = new Set(
      cycle.assignments
        .map((assignment) => assignment.taskId)
        .filter((taskId) => !completedTaskIdsAfterRuntime.has(taskId) && !failedTaskIdsAfterRuntime.has(taskId)),
    );

    cycle.roadmap = reconcileRoadmap(cycle.roadmap, {
      completedTaskIds: completedTaskIdsAfterRuntime,
      activeTaskIds: activeTaskIdsAfterRuntime,
      failedTaskIds: failedTaskIdsAfterRuntime,
    });
    cycle.executionGraph = buildExecutionGraph(cycle.roadmap, {
      completedTaskIds: completedTaskIdsAfterRuntime,
      activeTaskIds: activeTaskIdsAfterRuntime,
      failedTaskIds: failedTaskIdsAfterRuntime,
    });
    const ingestedTaskResults = ingestTaskResults({ runtimeResults });
    const { blockedTaskOutcomes } = createBlockedTaskOutcomeCanonicalizer({
      projectId,
      executionGraph: cycle.executionGraph,
      roadmap: cycle.roadmap,
      taskAssignments: cycle.assignments,
      runtimeResults,
      existingTaskResults: ingestedTaskResults.taskResults,
    });
    const blockedTaskOutcomeByTaskId = new Map(
      blockedTaskOutcomes
        .filter((result) => result?.taskId)
        .map((result) => [result.taskId, result]),
    );
    const canonicalTaskResults = [
      ...ingestedTaskResults.taskResults.filter((result) => result?.status !== "blocked" || !blockedTaskOutcomeByTaskId.has(result?.taskId)),
      ...blockedTaskOutcomes,
    ];
    const { outcomeEvaluation } = defineOutcomeEvaluationSchema({
      projectId,
      taskResults: canonicalTaskResults,
    });
    const { actionSuccessScore } = createActionSuccessScoringEngine({
      projectId,
      outcomeEvaluation,
    });

    project.cycle = cycle;
    project.runtimeResults = runtimeResults;
    project.taskResults = canonicalTaskResults;
    project.blockedTaskOutcomes = blockedTaskOutcomes;
    project.taskTransitionEvents = ingestedTaskResults.transitionEvents;
    project.state = {
      ...(project.state ?? {}),
      taskResults: canonicalTaskResults,
      blockedTaskOutcomes,
      taskTransitionEvents: ingestedTaskResults.transitionEvents,
      outcomeEvaluation,
      actionSuccessScore,
    };
    project.agents = project.agents.map((agent) => {
      const assignment = cycle.assignments.find((item) => item.agentId === agent.id);
      const completion = runtimeResults.find((item) => item.payload.agentId === agent.id);
      const assignedTask = cycle.roadmap.find((task) => task.id === assignment?.taskId);
      return {
        ...agent,
        status: assignment ? "working" : "idle",
        currentTask: assignedTask ? assignedTask.summary : null,
        lastResult: completion ? completion.type : null,
      };
    });
    project.status = cycle.assignments.length > 0 ? "active" : "blocked";
    this.persistProjectRecord(project);

    return this.serializeProject(project);
  }

  serializeProject(project) {
    const rawEvents = this.getProjectEvents(project.id);
    const events = this.summarizeEvents(rawEvents);
    const lastCycleEvent = events.at(-1);
    const blockedTasks =
      project.cycle?.roadmap.filter((task) => task.status === "blocked").map((task) => task.summary) ?? [];

    return {
      id: project.id,
      userId: project.userId ?? resolveProjectOwnerUserId(project) ?? null,
      name: project.name,
      goal: project.goal,
      status: project.status,
      path: project.path,
      stack: project.stack,
      projectDraft: project.projectDraft ?? project.context?.projectDraft ?? null,
      projectCreationEvent: project.context?.projectCreationEvent ?? project.projectCreationEvent ?? null,
      projectCreationEvents: project.context?.projectCreationEvents ?? project.projectCreationEvents ?? [],
      projectCreationMetric: project.context?.projectCreationMetric ?? project.projectCreationMetric ?? null,
      projectCreationSummary: project.context?.projectCreationSummary ?? project.projectCreationSummary ?? null,
      existingBusinessAssets: project.context?.existingBusinessAssets ?? null,
      projectIntake: project.context?.intake
        ?? project.projectIntake
        ?? project.state?.intake
        ?? null,
      fileIntakeBoundary: project.context?.fileIntakeBoundary
        ?? project.fileIntakeBoundary
        ?? project.state?.fileIntakeBoundary
        ?? project.projectIntake?.fileIntakeBoundary
        ?? null,
      fileStorageRecord: project.context?.fileStorageRecord
        ?? project.fileStorageRecord
        ?? project.state?.fileStorageRecord
        ?? null,
      repositoryImportAndCodebaseDiagnosis: project.context?.repositoryImportAndCodebaseDiagnosis ?? null,
      liveWebsiteIngestionAndFunnelDiagnosis: project.context?.liveWebsiteIngestionAndFunnelDiagnosis ?? null,
      importedAnalyticsNormalization: project.context?.importedAnalyticsNormalization ?? null,
      importedAssetTaskExtraction: project.context?.importedAssetTaskExtraction ?? null,
      importAndContinueRoadmap: project.context?.importAndContinueRoadmap ?? null,
      nexusAppShellSchema: project.context?.nexusAppShellSchema ?? null,
      authenticatedAppShell: project.context?.authenticatedAppShell ?? null,
      navigationRouteSurface: project.context?.navigationRouteSurface ?? null,
      aiControlCenterSurface: project.context?.aiControlCenterSurface ?? null,
      generationIntent: project.context?.generationIntent
        ?? project.context?.aiDesignRequest?.generationIntent
        ?? null,
      productSkeletonAgentOutput: project.context?.productSkeletonAgentOutput
        ?? project.productSkeletonAgentOutput
        ?? project.onboardingStateHandoff?.productSkeletonAgentOutput
        ?? null,
      visualProductSkeletonAgentOutput: project.context?.visualProductSkeletonAgentOutput
        ?? project.visualProductSkeletonAgentOutput
        ?? project.onboardingStateHandoff?.visualProductSkeletonAgentOutput
        ?? null,
      runtimeSkeletonTruth: project.context?.runtimeSkeletonTruth
        ?? project.runtimeSkeletonTruth
        ?? project.state?.runtimeSkeletonTruth
        ?? null,
      productDomainSkeleton: project.context?.productDomainSkeleton
        ?? project.productDomainSkeleton
        ?? project.state?.productDomainSkeleton
        ?? project.context?.runtimeSkeletonTruth?.productDomainSkeleton
        ?? project.runtimeSkeletonTruth?.productDomainSkeleton
        ?? null,
      productOwnedBackendSkeleton: project.context?.productOwnedBackendSkeleton
        ?? project.productOwnedBackendSkeleton
        ?? project.state?.productOwnedBackendSkeleton
        ?? project.context?.runtimeSkeletonTruth?.productOwnedBackendSkeleton
        ?? project.runtimeSkeletonTruth?.productOwnedBackendSkeleton
        ?? null,
      buildMutationTruth: project.context?.buildMutationTruth
        ?? project.buildMutationTruth
        ?? project.state?.buildMutationTruth
        ?? null,
      buildMutationHistory: project.context?.buildMutationHistory
        ?? project.buildMutationHistory
        ?? project.state?.buildMutationHistory
        ?? [],
      buildMutationIntents: project.context?.buildMutationIntents
        ?? project.buildMutationIntents
        ?? project.state?.buildMutationIntents
        ?? [],
      buildAgentTurnState: project.context?.buildAgentTurnState
        ?? project.buildAgentTurnState
        ?? project.state?.buildAgentTurnState
        ?? null,
      mutationChangeDecision: project.context?.mutationChangeDecision
        ?? project.mutationChangeDecision
        ?? project.state?.mutationChangeDecision
        ?? null,
      mutationChangeHistory: project.context?.mutationChangeHistory
        ?? project.mutationChangeHistory
        ?? project.state?.mutationChangeHistory
        ?? [],
      canonicalMutationFlow: project.context?.canonicalMutationFlow
        ?? project.canonicalMutationFlow
        ?? project.state?.canonicalMutationFlow
        ?? buildCanonicalMutationFlowShell({ project }),
      buildApprovalFlow: project.context?.buildApprovalFlow
        ?? project.buildApprovalFlow
        ?? project.state?.buildApprovalFlow
        ?? buildBuildApprovalFlow({ project }),
      buildSpeechTruth: project.context?.buildSpeechTruth
        ?? project.buildSpeechTruth
        ?? project.state?.buildSpeechTruth
        ?? null,
      buildSpeechHistory: project.context?.buildSpeechHistory
        ?? project.buildSpeechHistory
        ?? project.state?.buildSpeechHistory
        ?? [],
      historyContinuityAgent: project.context?.historyContinuityAgent
        ?? project.historyContinuityAgent
        ?? project.state?.historyContinuityAgent
        ?? buildHistoryContinuityAgentEnvelope({ project }),
      shareDemoAgent: project.context?.shareDemoAgent
        ?? project.shareDemoAgent
        ?? project.state?.shareDemoAgent
        ?? null,
      growthAgent: project.context?.growthAgent
        ?? project.growthAgent
        ?? project.state?.growthAgent
        ?? null,
      growthMeasurementTruth: project.context?.growthMeasurementTruth
        ?? project.growthMeasurementTruth
        ?? project.state?.growthMeasurementTruth
        ?? null,
      socialCampaignExecutionAgent: project.context?.socialCampaignExecutionAgent
        ?? project.socialCampaignExecutionAgent
        ?? project.state?.socialCampaignExecutionAgent
        ?? null,
      seoActionPath: project.context?.seoActionPath
        ?? project.seoActionPath
        ?? project.state?.seoActionPath
        ?? null,
      semActionPath: project.context?.semActionPath
        ?? project.semActionPath
        ?? project.state?.semActionPath
        ?? null,
      emailActionPath: project.context?.emailActionPath
        ?? project.emailActionPath
        ?? project.state?.emailActionPath
        ?? null,
      landingActionPath: project.context?.landingActionPath
        ?? project.landingActionPath
        ?? project.state?.landingActionPath
        ?? null,
      landingBackendSync: project.context?.landingBackendSync
        ?? project.landingBackendSync
        ?? project.state?.landingBackendSync
        ?? null,
      companionConversation: project.context?.companionConversation
        ?? project.companionConversation
        ?? project.state?.companionConversation
        ?? null,
      visualBuildTruth: project.context?.visualBuildTruth
        ?? project.visualBuildTruth
        ?? project.state?.visualBuildTruth
        ?? null,
      skeletonChoiceTruth: project.context?.skeletonChoiceTruth
        ?? project.skeletonChoiceTruth
        ?? project.state?.skeletonChoiceTruth
        ?? null,
      runtimeLearningEvents: project.context?.runtimeLearningEvents
        ?? project.runtimeLearningEvents
        ?? project.state?.runtimeLearningEvents
        ?? [],
      runtimeLearningDecisionHints: project.context?.runtimeLearningDecisionHints
        ?? project.runtimeLearningDecisionHints
        ?? project.state?.runtimeLearningDecisionHints
        ?? null,
      proofArtifact: buildCanonicalProofArtifact({
        project,
        previewScreenViewModel: project.context?.previewScreenViewModel ?? null,
        generatedSurfaceProofSchema: project.context?.generatedSurfaceProofSchema ?? null,
        aiControlCenterSurface: project.context?.aiControlCenterSurface ?? null,
        proposalApplyDecision: project.context?.proposalApplyDecision ?? null,
        artifactExpectation: project.context?.artifactExpectation ?? null,
      }),
      aiDesignRequest: project.context?.aiDesignRequest ?? null,
      aiDesignProposal: project.context?.aiDesignProposal ?? null,
      aiDesignProviderResult: project.context?.aiDesignProviderResult ?? null,
      aiDesignServiceResult: project.context?.aiDesignServiceResult ?? null,
      aiDesignExecutionState: project.context?.aiDesignExecutionState ?? null,
      aiGenerationObservability: project.context?.aiGenerationObservability ?? null,
      providerLatencyFailureTracker: project.context?.providerLatencyFailureTracker ?? null,
      generationSuccessAcceptanceTracker: project.context?.generationSuccessAcceptanceTracker ?? null,
      promptContractFailureTracker: project.context?.promptContractFailureTracker ?? null,
      aiGenerationReviewDashboard: project.context?.aiGenerationReviewDashboard ?? null,
      generatedSurfaceProofSchema: project.context?.generatedSurfaceProofSchema ?? null,
      generatedAccessibilityValidationEngine: project.context?.generatedAccessibilityValidationEngine ?? null,
      generatedSurfacePerformanceBudgetValidator: project.context?.generatedSurfacePerformanceBudgetValidator ?? null,
      generatedBrandConsistencyValidator: project.context?.generatedBrandConsistencyValidator ?? null,
      dailyWorkspaceSurface: project.context?.dailyWorkspaceSurface ?? null,
      guidedTaskExecutionSurface: project.context?.guidedTaskExecutionSurface ?? null,
      taskStepFlowProgress: project.context?.taskStepFlowProgress ?? null,
      taskApprovalHandoffPanel: project.context?.taskApprovalHandoffPanel ?? null,
      settingsProfileSurface: project.context?.settingsProfileSurface ?? null,
      renderableScreenModel: project.context?.renderableScreenModel ?? null,
      screenComponentMapping: project.context?.screenComponentMapping ?? null,
      activeScreenVariantPlan: project.context?.activeScreenVariantPlan ?? null,
      layoutCompositionPlan: project.context?.layoutCompositionPlan ?? null,
      renderableScreenComposition: project.context?.renderableScreenComposition ?? null,
      renderableDesignProposal: project.context?.renderableDesignProposal ?? null,
      designProposalValidation: project.context?.designProposalValidation ?? null,
      designProposalPreviewState: project.context?.designProposalPreviewState ?? null,
      screenProposalDiff: project.context?.screenProposalDiff ?? null,
      designProposalReviewState: project.context?.designProposalReviewState ?? null,
      generatedAssetProvenanceRecord: project.context?.generatedAssetProvenanceRecord ?? null,
      approvedScreenDelta: project.context?.approvedScreenDelta ?? null,
      proposalApplyDecision: project.context?.proposalApplyDecision ?? null,
      acceptedScreenState: project.context?.acceptedScreenState ?? null,
      integratedDesignProposalState: project.context?.integratedDesignProposalState ?? null,
      runtimeScreenRegistry: project.context?.runtimeScreenRegistry ?? null,
      activeScreenResolver: project.context?.activeScreenResolver ?? null,
      liveRuntimeScreenState: project.context?.liveRuntimeScreenState ?? null,
      previewScreenViewModel: project.context?.previewScreenViewModel ?? null,
      atomicExecutionEnvelope: project.context?.atomicExecutionEnvelope ?? null,
      externalExecutionResult: project.context?.externalExecutionResult ?? null,
      executionConsistencyReport: project.context?.executionConsistencyReport ?? null,
      nexusPositioning: project.context?.nexusPositioning ?? null,
      messagingFramework: project.context?.messagingFramework ?? null,
      messagingVariants: project.context?.messagingVariants ?? null,
      landingVariantDecision: project.context?.landingVariantDecision ?? null,
      objectionMap: project.context?.objectionMap ?? null,
      faqMap: project.context?.faqMap ?? null,
      activationGoals: project.context?.activationGoals ?? null,
      productCtaStrategy: project.context?.productCtaStrategy ?? null,
      nexusWebsiteSchema: project.context?.nexusWebsiteSchema ?? null,
      landingPageIa: project.context?.landingPageIa ?? null,
      websiteCopyPack: project.context?.websiteCopyPack ?? null,
      websiteConversionFlow: project.context?.websiteConversionFlow ?? null,
      waitlistRecord: project.context?.waitlistRecord ?? null,
      accessRequest: project.context?.accessRequest ?? null,
      websiteExperimentPlan: project.context?.websiteExperimentPlan ?? null,
      trustProofBlocks: project.context?.trustProofBlocks ?? null,
      productDeliveryModel: project.context?.productDeliveryModel ?? null,
      siteAppBoundary: project.context?.siteAppBoundary ?? null,
      accessModeDecision: project.context?.accessModeDecision ?? null,
      landingAuthHandoff: project.context?.landingAuthHandoff ?? null,
      appEntryDecision: project.context?.appEntryDecision ?? null,
      postLoginDestination: project.context?.postLoginDestination ?? null,
      returnTomorrowContinuity: project.context?.returnTomorrowContinuity ?? null,
      appLandingEntry: project.context?.appLandingEntry ?? null,
      entryStateVariants: project.context?.entryStateVariants ?? null,
      entryRecoveryState: project.context?.entryRecoveryState ?? null,
      entryOrientationPanel: project.context?.entryOrientationPanel ?? null,
      entryDecisionSupport: project.context?.entryDecisionSupport ?? null,
      firstProjectKickoff: project.context?.firstProjectKickoff ?? null,
      landingToDashboardFlow: project.context?.landingToDashboardFlow ?? null,
      activationFunnel: project.context?.activationFunnel ?? null,
      activationMilestones: project.context?.activationMilestones ?? null,
      onboardingMarketingFlow: project.context?.onboardingMarketingFlow ?? null,
      activationDropOffs: project.context?.activationDropOffs ?? null,
      reEngagementPlan: project.context?.reEngagementPlan ?? null,
      nexusContentStrategy: project.context?.nexusContentStrategy ?? null,
      launchContentCalendar: project.context?.launchContentCalendar ?? null,
      storyAssets: project.context?.storyAssets ?? null,
      socialCommunityPack: project.context?.socialCommunityPack ?? null,
      productProofPlan: project.context?.productProofPlan ?? null,
      launchCampaignBrief: project.context?.launchCampaignBrief ?? null,
      launchRolloutPlan: project.context?.launchRolloutPlan ?? null,
      launchReadinessChecklist: project.context?.launchReadinessChecklist ?? null,
      launchPublishingPlan: project.context?.launchPublishingPlan ?? null,
      launchFeedbackSummary: project.context?.launchFeedbackSummary ?? null,
      goToMarketPlan: project.context?.goToMarketPlan ?? null,
      promotionExecutionPlan: project.context?.promotionExecutionPlan ?? null,
      launchMarketingExecution: project.context?.launchMarketingExecution ?? null,
      gtmMetricSchema: project.context?.gtmMetricSchema ?? null,
      acquisitionSourceMetrics: project.context?.acquisitionSourceMetrics ?? null,
      firstTouchAttribution: project.context?.firstTouchAttribution ?? null,
      preAuthConversionEvents: project.context?.preAuthConversionEvents ?? null,
      websiteActivationFunnel: project.context?.websiteActivationFunnel ?? null,
      conversionAnalytics: project.context?.conversionAnalytics ?? null,
      launchPerformanceDashboard: project.context?.launchPerformanceDashboard ?? null,
      gtmOptimizationPlan: project.context?.gtmOptimizationPlan ?? null,
      growthLoopManagement: project.context?.growthLoopManagement ?? null,
      ownerControlPlane: project.context?.ownerControlPlane ?? null,
      ownerControlCenter: project.context?.ownerControlCenter ?? null,
      dailyOwnerOverview: project.context?.dailyOwnerOverview ?? null,
      ownerPriorityQueue: project.context?.ownerPriorityQueue ?? null,
      ownerActionRecommendations: project.context?.ownerActionRecommendations ?? null,
      ownerDecisionDashboard: project.context?.ownerDecisionDashboard ?? null,
      ownerDailyWorkflow: project.context?.ownerDailyWorkflow ?? null,
      ownerFocusArea: project.context?.ownerFocusArea ?? null,
      ownerTaskList: project.context?.ownerTaskList ?? null,
      ownerRoutinePlan: project.context?.ownerRoutinePlan ?? null,
      ownerRevenueView: project.context?.ownerRevenueView ?? null,
      ownerCostView: project.context?.ownerCostView ?? null,
      profitMarginSummary: project.context?.profitMarginSummary ?? null,
      unitEconomicsDashboard: project.context?.unitEconomicsDashboard ?? null,
      cashFlowProjection: project.context?.cashFlowProjection ?? null,
      ownerUserAnalytics: project.context?.ownerUserAnalytics ?? null,
      featureUsageSummary: project.context?.featureUsageSummary ?? null,
      decisionAccuracySummary: project.context?.decisionAccuracySummary ?? null,
      automationImpactSummary: project.context?.automationImpactSummary ?? null,
      roadmapTracking: project.context?.roadmapTracking ?? null,
      ownerOperationsSignals: project.context?.ownerOperationsSignals ?? null,
      prioritizedOwnerAlerts: project.context?.prioritizedOwnerAlerts ?? null,
      ownerAlertFeed: project.context?.ownerAlertFeed ?? null,
      ownerIncident: project.context?.ownerIncident ?? null,
      outageResponsePlan: project.context?.outageResponsePlan ?? null,
      incidentTimeline: project.context?.incidentTimeline ?? null,
      rootCauseSummary: project.context?.rootCauseSummary ?? null,
      liveProjectMonitoring: project.context?.liveProjectMonitoring ?? null,
      serviceReliabilityDashboard: project.context?.serviceReliabilityDashboard ?? null,
      postExecutionEvaluation: project.context?.postExecutionEvaluation ?? null,
      postExecutionReport: project.context?.postExecutionReport ?? null,
      crossLayerFeedbackState: project.context?.crossLayerFeedbackState ?? null,
      adaptiveExecutionDecision: project.context?.adaptiveExecutionDecision ?? null,
      systemOptimizationPlan: project.context?.systemOptimizationPlan ?? null,
      maintenanceBacklog: project.context?.maintenanceBacklog ?? null,
      dashboardHomeSurface: project.context?.dashboardHomeSurface ?? null,
      unifiedHomeDashboard: project.context?.unifiedHomeDashboard ?? null,
      todayPrioritiesFeed: project.context?.todayPrioritiesFeed ?? null,
      ownerVisibilityStrip: project.context?.ownerVisibilityStrip ?? null,
      userActivityEvent: project.context?.userActivityEvent ?? null,
      userActivityHistory: project.context?.userActivityHistory ?? null,
      userSessionMetric: project.context?.userSessionMetric ?? project.manualContext?.userSessionMetric ?? null,
      userSessionHistory: project.context?.userSessionHistory ?? null,
      returningUserMetric: project.context?.returningUserMetric ?? null,
      retentionSummary: project.context?.retentionSummary ?? null,
      retentionCurveAnalysis: project.context?.retentionCurveAnalysis ?? null,
      blockedTaskOutcomes: project.context?.blockedTaskOutcomes ?? project.state?.blockedTaskOutcomes ?? [],
      taskExecutionMetric: project.context?.taskExecutionMetric ?? null,
      taskExecutionCounters: project.context?.taskExecutionCounters ?? null,
      taskThroughputSummary: project.context?.taskThroughputSummary ?? null,
      baselineEstimate: project.context?.baselineEstimate ?? null,
      timeSavedMetric: project.context?.timeSavedMetric ?? null,
      timeSaved: project.context?.timeSaved ?? null,
      productivitySummary: project.context?.productivitySummary ?? null,
      outcomeEvaluation: project.context?.outcomeEvaluation ?? project.state?.outcomeEvaluation ?? null,
      actionSuccessScore: project.context?.actionSuccessScore ?? project.state?.actionSuccessScore ?? null,
      outcomeFeedbackState: project.context?.outcomeFeedbackState ?? null,
      goalProgressState: project.context?.goalProgressState ?? null,
      milestoneTracking: project.context?.milestoneTracking ?? null,
      productIterationInsights: project.context?.productIterationInsights ?? null,
      canonicalBacklogRegeneration: project.context?.canonicalBacklogRegeneration ?? null,
      approvals: project.approvals,
      state: project.state,
      normalizedSources: project.normalizedSources,
      context: project.context,
      scan: project.scan,
      analysis: project.analysis,
      externalSnapshot: project.externalSnapshot,
      gitSource: project.gitSource ?? null,
      gitSnapshot: project.gitSnapshot ?? null,
      runtimeSource: project.runtimeSource ?? null,
      runtimeSnapshot: project.runtimeSnapshot ?? null,
      notionSource: project.notionSource ?? null,
      notionSnapshot: project.notionSnapshot ?? null,
      source: project.source ?? null,
      progressState: project.context?.progressState ?? null,
      reactiveWorkspaceState: project.context?.reactiveWorkspaceState ?? null,
      realtimeEventStream: project.context?.realtimeEventStream ?? null,
      liveUpdateChannel: project.context?.liveUpdateChannel ?? null,
      liveLogStream: project.context?.liveLogStream ?? null,
      formattedLogs: project.context?.formattedLogs ?? [],
      commandConsoleView: project.context?.commandConsoleView ?? null,
      projectPresenceState: project.context?.projectPresenceState ?? null,
      reviewThreadState: project.context?.reviewThreadState ?? null,
      collaborationFeed: project.context?.collaborationFeed ?? null,
      snapshotSchedule: project.context?.snapshotSchedule ?? null,
      snapshotBackupWorker: project.context?.snapshotBackupWorker ?? null,
      snapshotJobState: project.context?.snapshotJobState ?? null,
      snapshotWorkerRuntime: project.context?.snapshotWorkerRuntime ?? null,
      snapshotRetentionPolicy: project.context?.snapshotRetentionPolicy ?? null,
      snapshotRetentionDecision: project.context?.snapshotRetentionDecision ?? null,
      continuityPlan: project.context?.continuityPlan ?? null,
      disasterRecoveryChecklist: project.context?.disasterRecoveryChecklist ?? null,
      businessContinuityState: project.context?.businessContinuityState ?? null,
      securityAuditRecord: project.context?.securityAuditRecord ?? null,
      complianceAuditSummary: project.context?.complianceAuditSummary ?? null,
      agentGovernancePolicy: project.context?.agentGovernancePolicy ?? null,
      budgetDecision: project.context?.budgetDecision ?? null,
      sandboxDecision: project.context?.sandboxDecision ?? null,
      agentLimitDecision: project.context?.agentLimitDecision ?? null,
      agentGovernanceTrace: project.context?.agentGovernanceTrace ?? null,
      platformCostMetric: project.context?.platformCostMetric ?? null,
      aiUsageMetric: project.context?.aiUsageMetric ?? null,
      workspaceComputeMetric: project.context?.workspaceComputeMetric ?? null,
      buildDeployCostMetric: project.context?.buildDeployCostMetric ?? null,
      storageCostMetric: project.context?.storageCostMetric ?? null,
      costSummary: project.context?.costSummary ?? null,
      normalizedBillingEvents: project.manualContext?.normalizedBillingEvents ?? [],
      billableUsage: project.context?.billableUsage ?? null,
      costVisibilityPayload: project.context?.costVisibilityPayload ?? null,
      costDashboardModel: project.context?.costDashboardModel ?? null,
      workspaceMode: project.context?.workspaceMode ?? null,
      workspaceModeDefinitions: project.context?.workspaceModeDefinitions ?? null,
      reasonableUsagePolicy: project.context?.reasonableUsagePolicy ?? null,
      billingPlanSchema: project.context?.billingPlanSchema ?? null,
      entitlementDecision: project.context?.entitlementDecision ?? null,
      workspaceBillingState: project.context?.workspaceBillingState ?? null,
      payingUserMetrics: project.context?.payingUserMetrics ?? null,
      revenueSummary: project.context?.revenueSummary ?? null,
      billingGuardDecision: project.context?.billingGuardDecision ?? null,
      billingApprovalRequest: project.context?.billingApprovalRequest ?? null,
      subscriptionState: project.context?.subscriptionState ?? null,
      billingSettingsModel: project.context?.billingSettingsModel ?? null,
      costAwareActionSelection: project.context?.costAwareActionSelection ?? null,
      privacyRightsResult: project.context?.privacyRightsResult ?? project.privacyRightsResult ?? null,
      agents: project.agents,
      overview: {
        bottleneck: blockedTasks[0] ?? "אין כרגע חסם מרכזי",
        contextBottleneck: project.context?.bottleneck?.title ?? null,
        blockedTasks,
        observedHealth: project.state?.observed?.health ?? null,
        currentState: project.cycle
          ? `${project.cycle.assignments.length} משימות שובצו במחזור האחרון`
          : "עדיין לא הורץ מחזור orchestration",
        lastCycleAt: lastCycleEvent?.timestamp ?? null,
        scanSummary: project.scan?.summary ?? "עדיין לא בוצעה סריקה לפרויקט",
        externalSummary: project.externalSnapshot
          ? `סונכרן מהקזינו ב-${project.externalSnapshot.syncedAt}`
          : "עדיין לא בוצע סנכרון ממערכת חיצונית",
        gitSummary: project.gitSnapshot
          ? `${project.gitSnapshot.provider}: ${project.gitSnapshot.repo.fullName} | ${project.gitSnapshot.branches.length} branches | ${project.gitSnapshot.pullRequests.length} PR/MR`
          : "עדיין לא בוצע חיבור ל-GitHub/GitLab",
        runtimeSummary: project.runtimeSnapshot
          ? `CI: ${project.runtimeSnapshot.ci?.[0]?.status ?? "unknown"} | Deploy: ${project.runtimeSnapshot.deployments?.[0]?.status ?? "unknown"}`
          : "עדיין לא בוצע חיבור למקורות runtime",
        notionSummary:
          project.notionSnapshot?.pages?.length > 0
            ? `Notion: ${project.notionSnapshot.pages.length} עמודים`
            : "עדיין לא בוצע חיבור ל-Notion",
      },
      cycle: project.cycle
        ? {
            ...project.cycle,
            assignments: this.summarizeAssignments(project.cycle.assignments),
            events: this.summarizeEvents(project.cycle.events ?? []),
          }
        : null,
      taskResults: project.taskResults,
      blockedTaskOutcomes: project.blockedTaskOutcomes ?? project.state?.blockedTaskOutcomes ?? [],
      taskTransitionEvents: project.taskTransitionEvents ?? project.state?.taskTransitionEvents ?? [],
      runtimeResults: project.runtimeResults,
      linkedAccounts: project.linkedAccounts ?? [],
      rotationResult: project.rotationResult ?? null,
      privacyRightsResult: project.privacyRightsResult ?? project.context?.privacyRightsResult ?? null,
      approvalRecords: project.approvalRecords ?? [],
      events,
    };
  }
}
