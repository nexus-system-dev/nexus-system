import { NexusOrchestrator } from "./orchestrator.js";
import { AgentRuntime } from "./agent-runtime.js";
import { EventBus } from "./event-bus.js";
import { FileEventLog } from "./file-event-log.js";
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
import { ingestTaskResults } from "./task-result-ingestion.js";
import { SourceAdapterRegistry } from "./source-adapter.js";
import { CasinoSourceAdapter } from "./casino-source-adapter.js";
import { RuntimeSourceAdapter } from "./runtime-source-adapter.js";
import { createExternalAccountRegistry } from "./external-account-registry.js";
import { createProviderConnectorContract } from "./provider-connector-contract.js";
import { createProviderConnectorAssembler } from "./provider-connector-assembler.js";
import { createProviderCapabilityDescriptor } from "./provider-capability-descriptor.js";
import { createProviderOperationContract } from "./provider-operation-contract.js";
import { createAccountVerificationModule } from "./account-verification-module.js";
import { createCredentialVaultInterface } from "./credential-vault-interface.js";
import { createApprovalRecordStore } from "./approval-record-store.js";
import { defineUserIdentitySchema } from "./user-identity-schema.js";
import { createAuthenticationSystem } from "./authentication-system.js";
import { createSessionAndTokenManagement } from "./session-and-token-management.js";
import { createPasswordResetAndEmailVerificationFlow } from "./password-reset-email-verification-flow.js";
import { defineWorkspaceAndMembershipModel } from "./workspace-membership-model.js";
import { createProjectAccessControlModule } from "./project-access-control-module.js";
import { createRoleAssignmentAndInvitationFlow } from "./role-assignment-invitation-flow.js";
import { createOrganizationWorkspaceSettingsModule } from "./workspace-settings-module.js";

import { DevAgentWorker } from "../agents/dev-agent/worker.js";
import { MarketingAgentWorker } from "../agents/marketing-agent/worker.js";
import { QaAgentWorker } from "../agents/qa-agent/worker.js";

export class ProjectService {
  constructor({ eventLogPath }) {
    this.eventBus = new EventBus({
      eventLog: new FileEventLog({
        filePath: eventLogPath,
      }),
    });
    this.orchestrator = new NexusOrchestrator({ eventBus: this.eventBus });
    this.runtime = new AgentRuntime({
      eventBus: this.eventBus,
      workers: [new DevAgentWorker(), new MarketingAgentWorker(), new QaAgentWorker()],
    });
    this.analyst = new AiProjectAnalyst();
    this.casinoConnector = new CasinoDiagnosticsConnector();
    this.gitConnector = new GitHostingConnector();
    this.runtimeConnector = new RuntimeSourcesConnector();
    this.notionConnector = new NotionConnector();
    this.onboarding = new OnboardingService();
    this.sourceAdapters = new SourceAdapterRegistry([new CasinoSourceAdapter(), new RuntimeSourceAdapter()]);
    this.projects = new Map();
    this.users = new Map();
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

    const project = {
      id,
      userId: userId ?? onboardingSession?.userId ?? null,
      name,
      goal,
      status: "idle",
      path: path ?? `/projects/${id}`,
      stack: stack ?? "Unknown",
      state: state ?? {
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
      },
      agents: agents ?? this.createDefaultAgents(),
      approvals: approvals ?? [],
      manualContext: null,
      normalizedSources: null,
      context: null,
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
      cycle: null,
      runtimeResults: [],
      taskResults: [],
      linkedAccounts: [],
      approvalRecords: approvalRecords ?? [],
    };

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

  createProjectIntake({ visionText, uploadedFiles, externalLinks }) {
    return this.onboarding.createProjectIntake({
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

  updateOnboardingIntake({ sessionId, visionText, uploadedFiles, externalLinks }) {
    return this.onboarding.updateIntake({
      sessionId,
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

  finishOnboardingSession(sessionId) {
    const finished = this.onboarding.finishSession(sessionId);
    if (!finished) {
      return null;
    }

    const session = finished.updatedSession;
    const projectDraft = finished.projectDraft ?? {};
    const projectId = projectDraft.id ?? session.projectDraftId ?? null;
    const projectName = projectDraft.name ?? "Project Draft";
    const projectGoal = projectDraft.goal ?? session.projectIntake?.visionText ?? "";

    if (!this.projects.has(projectId)) {
      this.createProject({
        id: projectId,
        name: projectName,
        goal: projectGoal,
        path: `/projects/${projectId}`,
        stack: "Unknown",
        state: projectDraft.state ?? null,
        userId: session.userId ?? null,
        onboardingSession: session,
      });
    } else {
      const existingProject = this.projects.get(projectId);
      existingProject.onboardingSession = session;
      existingProject.name = projectName;
      existingProject.goal = projectGoal;
      existingProject.state = projectDraft.state ?? existingProject.state;
    }

    const project = this.projects.get(projectId);
    this.rebuildContext(projectId);
    this.runCycle(projectId);

    return {
      ...finished,
      project: this.serializeProject(project),
    };
  }

  getOnboardingSession(sessionId) {
    return this.onboarding.getSession(sessionId);
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

    const authPayload = {
      userIdentity,
      authenticationState,
      sessionState,
      tokenBundle,
      verificationFlowState,
      workspaceModel,
      membershipRecord,
      credentialReference,
      encryptedCredential,
      credentialVaultRecord,
    };

    this.users.set(userId, authPayload);
    return { authPayload };
  }

  loginUser({ userInput, credentials } = {}) {
    const profile = userInput && typeof userInput === "object" ? userInput : {};
    const authInput = credentials && typeof credentials === "object" ? credentials : {};
    const existing = [...this.users.values()].find((item) => item.userIdentity?.email === profile.email)
      ?? [...this.users.values()].find((item) => item.userIdentity?.userId === profile.userId);

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

    const authPayload = {
      ...existing,
      authenticationState,
      sessionState,
      tokenBundle,
      verificationFlowState,
    };
    this.users.set(existing.userIdentity.userId, authPayload);
    return { authPayload };
  }

  logoutUser({ userInput } = {}) {
    const profile = userInput && typeof userInput === "object" ? userInput : {};
    const existing = [...this.users.values()].find((item) => item.userIdentity?.email === profile.email)
      ?? [...this.users.values()].find((item) => item.userIdentity?.userId === profile.userId);

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

    const authPayload = {
      ...existing,
      authenticationState,
      sessionState,
      tokenBundle,
      verificationFlowState,
    };
    this.users.set(existing.userIdentity.userId, authPayload);
    return { authPayload };
  }

  requestEmailVerification({ userInput, verificationRequest } = {}) {
    const profile = userInput && typeof userInput === "object" ? userInput : {};
    const existing = [...this.users.values()].find((item) => item.userIdentity?.email === profile.email)
      ?? [...this.users.values()].find((item) => item.userIdentity?.userId === profile.userId);

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

    const authPayload = {
      ...existing,
      verificationFlowState,
    };
    this.users.set(existing.userIdentity.userId, authPayload);
    return { authPayload };
  }

  requestPasswordReset({ userInput, verificationRequest } = {}) {
    const profile = userInput && typeof userInput === "object" ? userInput : {};
    const existing = [...this.users.values()].find((item) => item.userIdentity?.email === profile.email)
      ?? [...this.users.values()].find((item) => item.userIdentity?.userId === profile.userId);

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

    const authPayload = {
      ...existing,
      verificationFlowState,
    };
    this.users.set(existing.userIdentity.userId, authPayload);
    return { authPayload };
  }

  inviteWorkspaceMember({ userInput, invitationRequest } = {}) {
    const profile = userInput && typeof userInput === "object" ? userInput : {};
    const existing = [...this.users.values()].find((item) => item.userIdentity?.email === profile.email)
      ?? [...this.users.values()].find((item) => item.userIdentity?.userId === profile.userId);

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
    this.users.set(existing.userIdentity.userId, authPayload);
    return { authPayload };
  }

  updateWorkspaceSettings({ userInput, settingsInput } = {}) {
    const profile = userInput && typeof userInput === "object" ? userInput : {};
    const existing = [...this.users.values()].find((item) => item.userIdentity?.email === profile.email)
      ?? [...this.users.values()].find((item) => item.userIdentity?.userId === profile.userId);

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
    this.users.set(existing.userIdentity.userId, authPayload);
    return { authPayload };
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
    };

    this.projects.set(projectId, project);
    this.rebuildContext(projectId);
    return project;
  }

  listProjects() {
    return [...this.projects.values()].map((project) => this.serializeProject(project));
  }

  getProject(projectId) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    return this.serializeProject(project);
  }

  getProjectEvents(projectId) {
    return this.eventBus
      .getEvents()
      .filter((event) => event.payload.projectId === projectId)
      .slice(-50);
  }

  summarizeEvents(events) {
    return events.map((event) => ({
      id: event.id,
      type: event.type,
      timestamp: event.timestamp,
      payload: {
        projectId: event.payload.projectId ?? null,
        agentId: event.payload.agentId ?? null,
        taskId: event.payload.taskId ?? event.payload.task?.id ?? null,
        task: event.payload.task
          ? {
              id: event.payload.task.id,
              summary: event.payload.task.summary,
              lane: event.payload.task.lane,
            }
          : null,
      },
    }));
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

  rebuildContext(projectId) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    project.normalizedSources = normalizeProjectSources(project);
    project.state = buildObservedProjectState(project);
    project.context = buildProjectContext(project);
    project.state = {
      ...project.state,
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
      gatingDecision: project.context?.gatingDecision ?? null,
      approvalAuditTrail: project.context?.approvalAuditTrail ?? null,
      policySchema: project.context?.policySchema ?? null,
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
      sessionState: project.context?.sessionState ?? null,
      tokenBundle: project.context?.tokenBundle ?? null,
      verificationFlowState: project.context?.verificationFlowState ?? null,
      workspaceModel: project.context?.workspaceModel ?? null,
      membershipRecord: project.context?.membershipRecord ?? null,
      accessDecision: project.context?.accessDecision ?? null,
      invitationRecord: project.context?.invitationRecord ?? null,
      roleAssignment: project.context?.roleAssignment ?? null,
      workspaceSettings: project.context?.workspaceSettings ?? null,
      nexusPersistenceSchema: project.context?.nexusPersistenceSchema ?? null,
      migrationPlan: project.context?.migrationPlan ?? null,
      migrationArtifacts: project.context?.migrationArtifacts ?? null,
      entityRepository: project.context?.entityRepository ?? [],
      storageRecord: project.context?.storageRecord ?? null,
      userJourneys: project.context?.userJourneys ?? null,
      journeySteps: project.context?.journeySteps ?? [],
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
      developerWorkspace: project.context?.developerWorkspace ?? null,
      projectWorkbenchLayout: project.context?.projectWorkbenchLayout ?? null,
      fileEditorContract: project.context?.fileEditorContract ?? null,
      commandConsoleView: project.context?.commandConsoleView ?? null,
      branchDiffActivityPanel: project.context?.branchDiffActivityPanel ?? null,
      artifactBuildPanel: project.context?.artifactBuildPanel ?? null,
      developmentWorkspace: project.context?.developmentWorkspace ?? null,
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
      executionModeDecision: project.context?.executionModeDecision ?? null,
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
      formattedLogs: project.context?.formattedLogs ?? [],
      userFacingMessages: project.context?.userFacingMessages ?? [],
      platformTrace: project.context?.platformTrace ?? null,
      platformLogs: project.context?.platformLogs ?? [],
      incidentAlert: project.context?.incidentAlert ?? null,
      auditLogRecord: project.context?.auditLogRecord ?? null,
      notificationPayload: project.context?.notificationPayload ?? null,
      notificationEvent: project.context?.notificationEvent ?? null,
      notificationCenterState: project.context?.notificationCenterState ?? null,
      notificationPreferences: project.context?.notificationPreferences ?? null,
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
      providerConnectorSchema: project.context?.providerConnectorSchema ?? null,
      providerCapabilities: project.context?.providerCapabilities ?? null,
      providerOperations: project.context?.providerOperations ?? [],
      providerConnector: project.context?.providerConnector ?? null,
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

    return project.context;
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
    project.path = scan.path;
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
    project.state.product.hasAuth = scan.findings.hasAuth;
    this.rebuildContext(projectId);
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

    const linkedAccountPayload = {
      accountRecord,
      credentialReference,
      encryptedCredential,
      credentialVaultRecord,
      providerSession,
      providerCapabilities,
      providerOperations,
      providerConnector,
      verificationResult,
    };

    project.linkedAccounts = [
      ...(project.linkedAccounts ?? []).filter((account) => account.accountRecord?.accountId !== accountRecord.accountId),
      linkedAccountPayload,
    ];
    this.rebuildContext(projectId);

    return {
      linkedAccountPayload,
      linkedAccounts: project.linkedAccounts,
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
      },
    };
  }

  captureApproval(projectId, { approvalRequestId, userInput } = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    this.rebuildContext(projectId);

    const request = project.context?.approvalRequest;
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
      },
    });

    project.approvalRecords = [
      approvalRecord,
      ...((project.approvalRecords ?? []).filter((record) => record.approvalRequestId !== approvalRecord.approvalRequestId)),
    ];
    this.rebuildContext(projectId);

    return {
      approvalPayload: {
        approvalRecord,
        approvalStatus: project.context?.approvalStatus ?? null,
        approvalRecords: project.context?.approvalRecords ?? [],
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
    this.rebuildContext(projectId);

    const completedTaskIds = new Set(
      this.getProjectEvents(projectId)
        .filter((event) => event.type === "task.completed")
        .map((event) => event.payload.taskId),
    );

    const cycle = this.orchestrator.runCycle({
      projectId,
      projectState: project.state,
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

    project.cycle = cycle;
    project.runtimeResults = runtimeResults;
    project.taskResults = ingestedTaskResults.taskResults;
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
      name: project.name,
      goal: project.goal,
      status: project.status,
      path: project.path,
      stack: project.stack,
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
      runtimeResults: project.runtimeResults,
      linkedAccounts: project.linkedAccounts ?? [],
      approvalRecords: project.approvalRecords ?? [],
      events,
    };
  }
}
