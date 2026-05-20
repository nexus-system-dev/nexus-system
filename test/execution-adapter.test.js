import test from "node:test";
import assert from "node:assert/strict";

import { buildExecutionLiveViewModel } from "../web/nexus-ui/adapters/execution-adapter.js";

test("execution adapter keeps internal-tool continuity alive when no roadmap task is assigned yet", () => {
  const viewModel = buildExecutionLiveViewModel({
    project: {
      name: "Internal Continuity",
      approvals: [],
      cycle: {
        roadmap: [],
      },
      artifactExpectation: {
        projectType: "internal-tool",
        title: "Internal Continuity workspace",
        summary: "A live workspace for support reps with owner, SLA, and one clear next action.",
        continuityLine: "ב-Proof נרצה לראות workspace עם owner ברור, SLA גלוי, ופעולה הבאה שאפשר לבצע מיד.",
        proofFocus: [
          "ownership גלוי על התור",
          "SLA ברור על כל בקשה",
          "הפעולה הבאה שניתנת לביצוע מיד",
        ],
      },
      generationIntent: {
        generationGoal: "The workspace should make ownership, SLA, and the next action visible before Proof.",
      },
      splitWorkspaceLiveBuildSurfaceModel: {
        workspaceFamily: "operations-split-workspace",
        previewFrameFamily: "workspace-preview",
        buildSurfaceFamily: "workspace-surface",
        runtimeFamily: "web-app-runtime",
        releasePathFamily: "private-workspace-release",
        regions: {
          orchestration: {
            emphasis: "assignments-ownership-next-move",
          },
          build: {
            title: "משטח העבודה הפנימי מתקדם עכשיו",
            detail: "תור, בעלות, ופעולה הבאה חייבים להיות legible בתוך אותו surface.",
            visibleMilestones: ["workspace-visible", "queue-visible", "ownership-visible"],
          },
        },
      },
      classSpecificSurfaceEvolutionRules: {
        evolutionFamily: "workspace-evolution",
        frontendSurfaceType: "operations-workspace",
        backendStateType: "queue-state",
        sceneType: "queue-workspace",
        visibleEvolutionRule: "queue ownership and next action must evolve inside the same workspace",
        requiredVisibleChanges: ["queue surface evolves", "ownership becomes explicit"],
      },
      localWorkspaceContract: {
        workspaceMode: "browser-backed-local-workspace",
        desktopShellStatus: "deferred-to-w4-mbn-010",
        identity: {
          currentWorkspaceKey: "project-brain",
          buildRouteKey: "execution",
        },
        continuity: {
          resumeWorkspace: "project-brain",
          continuitySource: "workspace-navigation",
          continuityGuarantees: [
            "project identity survives reopen",
            "active workspace survives reopen",
          ],
        },
        localAwareness: {
          localAwarenessRequirements: [
            "project name is visible in workspace shell",
          ],
        },
      },
      desktopShellScopeContract: {
        shellFamily: "browser-backed-shell",
        shellStatus: "scope-defined-not-implemented",
        shellPathDecision: {
          currentWave4Path: "browser-backed-local-workspace",
          preferredFutureShell: "desktop-wrapper-shell",
        },
        runtimeBindings: {
          releaseWorkflowMode: "browser-to-cloud-handoff",
        },
        obligations: [
          "desktop shell cannot lose workspace continuity",
          "desktop shell must preserve reopen and resume behavior",
        ],
      },
      classAwareRuntimeResolver: {
        runtimeFamily: "web-app-runtime",
        packagingFamily: "workspace-package",
        releasePathFamily: "private-workspace-release",
        previewFamily: "workspace-preview",
        targetPlatform: "web",
        preferredReleaseTarget: "private-deployment",
        shellPath: "browser-backed-local-workspace",
        visibleRuntimeRule: "runtime path must stay visible as private workspace execution and release",
        summary: {
          projectFacingPath: "web-app-runtime -> private-workspace-release",
          packagingPath: "workspace-preview -> workspace-package",
        },
      },
      classAwarePackagingPreviewContract: {
        previewFamily: "workspace-preview",
        previewMode: "workspace-preview",
        previewSurface: "private-ops-workspace-preview",
        previewArtifact: "queue-and-ownership-workspace",
        packageMode: "private-workspace-package",
        packagingFamily: "workspace-package",
        packageArtifactType: "authenticated-web-workspace-bundle",
        preferredReleaseTarget: "private-deployment",
        shellPath: "browser-backed-local-workspace",
        packagingExpectation: "private workspace package stays aligned to authenticated team usage",
        visiblePreviewRule: "preview must feel like a working internal workspace with queue, ownership, and next action",
        visiblePackagingRule: "packaging must stay visible as a private workspace release rather than public web export",
        continuityRule: "preview/package mode must persist as project-facing class truth across reopen and return",
        summary: {
          previewPath: "workspace-preview -> workspace-preview",
          packagePath: "workspace-package -> private-deployment",
        },
      },
      releaseableProductStateContract: {
        stateFamily: "releaseable-product-state",
        status: "active",
        readinessDecision: "needs-launch-confirmation",
        releaseTarget: "private-deployment",
        packageArtifactType: "authenticated-web-workspace-bundle",
        packagePath: "workspace-package -> private-deployment",
        previewPath: "workspace-preview -> workspace-preview",
        packagingExpectation: "private workspace package stays aligned to authenticated team usage",
        continuityRule: "releaseable state must survive reopen, route restore, and the next continuation loop",
        visibleStateRule: "releaseable state is not proof text alone; it must reflect runtime, package, checks, and release target visibly",
        visibleChecks: [
          { checkId: "build-surface-visible", status: "passed", reason: "workspace remains visible" },
          { checkId: "launch-confirmed", status: "pending", reason: "awaiting launch confirmation" },
        ],
        blockedReasons: ["launch confirmation missing"],
        summary: {
          label: "Release prep active",
          nextAction: "launch-confirmation-required",
          readinessScore: 80,
        },
      },
      classAwareDeploymentReleasePath: {
        pathFamily: "private-workspace-release-path",
        providerType: "railway",
        releaseStatus: "active",
        primaryTarget: "private-deployment",
        environmentPath: "staging -> production",
        previewPath: "workspace-preview -> workspace-preview",
        packagePath: "workspace-package -> private-deployment",
        operationalPath: "workspace-preview -> workspace-preview -> workspace-package -> private-deployment -> private-deployment",
        deploymentArtifactType: "authenticated-web-workspace-bundle",
        nextGate: "verify-authenticated-workspace-and-promote",
        visibleReleaseRule: "internal-tool delivery must stay visible as a bounded private workspace release path",
        continuityRule: "deployment/release path status must survive reopen, route restore, and handoff into deployment feedback",
        boundedTargets: ["private-deployment", "web-deployment"],
      },
      buildProgressionStateMachine: {
        summary: {
          currentLabel: "השלד נראה על המסך",
          currentRouteKey: "execution",
        },
        overlayStatus: "active",
        states: [
          { stateId: "class-locked", label: "ה־class ננעל", routeKey: "understanding", status: "done" },
          { stateId: "skeleton-visible", label: "השלד נראה על המסך", routeKey: "execution", status: "active" },
          { stateId: "surface-evolving", label: "ה־surface מתפתח", routeKey: "execution", status: "pending" },
        ],
      },
      progressState: {
        percent: 100,
      },
      reactiveWorkspaceState: {
        progressBar: {
          percent: 100,
        },
      },
      liveLogStream: {
        summary: {
          totalEntries: 0,
        },
        commandOutputs: [],
        streams: {
          stdout: [],
        },
      },
      realtimeEventStream: {
        events: [],
      },
    },
  });

  assert.equal(viewModel.missionTitle, "מכינים את Internal Continuity workspace");
  assert.match(viewModel.detail, /ownership, SLA, and the next action visible/i);
  assert.deepEqual(
    viewModel.statusItems.map((item) => item.label),
    [
      "ננעל כיוון משטח העבודה עבור הצוות",
      "ממקמים ownership גלוי על התור",
      "מכינים SLA ברור על כל בקשה",
      "ה־Proof הבא יראה הפעולה הבאה שניתנת לביצוע מיד",
    ],
  );
  assert.deepEqual(
    viewModel.liveItems,
    [
      "מגדיר ownership גלוי על התור",
      "מכין SLA ברור על כל בקשה",
      "מסיים את Internal Continuity workspace לקראת Proof",
      "מוביל אל הפעולה הבאה שניתנת לביצוע מיד",
    ],
  );
  assert.equal(viewModel.workspaceSurfaceModel.workspaceFamily, "operations-split-workspace");
  assert.equal(viewModel.workspaceSurfaceModel.visibleMilestones.includes("queue-visible"), true);
  assert.equal(viewModel.buildProgressionStateMachine.currentRouteKey, "execution");
  assert.equal(viewModel.buildProgressionStateMachine.states[1].label, "השלד נראה על המסך");
  assert.equal(viewModel.classSpecificSurfaceEvolutionRules.evolutionFamily, "workspace-evolution");
  assert.equal(viewModel.classSpecificSurfaceEvolutionRules.frontendSurfaceType, "operations-workspace");
  assert.equal(viewModel.classSpecificSurfaceEvolutionRules.sceneType, "queue-workspace");
  assert.equal(viewModel.localWorkspaceContract.workspaceMode, "browser-backed-local-workspace");
  assert.equal(viewModel.localWorkspaceContract.currentWorkspaceKey, "project-brain");
  assert.equal(viewModel.desktopShellScopeContract.shellFamily, "browser-backed-shell");
  assert.equal(viewModel.desktopShellScopeContract.currentWave4Path, "browser-backed-local-workspace");
  assert.equal(viewModel.classAwareRuntimeResolver.runtimeFamily, "web-app-runtime");
  assert.equal(viewModel.classAwareRuntimeResolver.projectFacingPath, "web-app-runtime -> private-workspace-release");
  assert.equal(viewModel.classAwarePackagingPreviewContract.previewMode, "workspace-preview");
  assert.equal(viewModel.classAwarePackagingPreviewContract.packageArtifactType, "authenticated-web-workspace-bundle");
  assert.equal(viewModel.classAwarePackagingPreviewContract.packagePath, "workspace-package -> private-deployment");
  assert.equal(viewModel.releaseableProductStateContract.status, "active");
  assert.equal(viewModel.releaseableProductStateContract.releaseTarget, "private-deployment");
  assert.equal(viewModel.releaseableProductStateContract.packageArtifactType, "authenticated-web-workspace-bundle");
  assert.equal(viewModel.releaseableProductStateContract.label, "Release prep active");
  assert.equal(viewModel.releaseableProductStateContract.visibleChecks[1].checkId, "launch-confirmed");
  assert.equal(viewModel.classAwareDeploymentReleasePath.providerType, "railway");
  assert.equal(viewModel.classAwareDeploymentReleasePath.primaryTarget, "private-deployment");
  assert.equal(viewModel.classAwareDeploymentReleasePath.nextGate, "verify-authenticated-workspace-and-promote");
});

test("execution adapter hides runtime shell leak during repeated-loop continuation", () => {
  const viewModel = buildExecutionLiveViewModel({
    project: {
      name: "Family Flow",
      state: {
        repeatedLoopContinuation: {
          active: true,
          missionTitle: "לקדם את Family Flow mobile flow",
          execution: {
            missionTitle: "לקדם את Family Flow mobile flow",
            detail: "סבב 2 מחזק את המסך הראשון, הפעולה הראשונה, ומסך ההמשך.",
            statusItems: [
              { label: "מחדדים את מסך הבית סביב מה שקורה היום", status: "done" },
              { label: "מחדדים את הפעולה הראשונה כך שתהיה ברורה בלחיצה אחת", status: "active" },
            ],
            liveItems: [
              "מחדד את מסך הבית סביב מה שקורה היום",
              "מקבע את הפעולה הראשונה כך שתדרוש אפס הסבר חיצוני",
            ],
            logItems: [
              { time: "עכשיו", message: "סבב 2 מחזק את המסך הראשון של Family Flow mobile flow." },
            ],
          },
        },
      },
      cycle: {
        roadmap: [],
      },
      progressState: {
        percent: 100,
      },
      reactiveWorkspaceState: {
        progressBar: {
          percent: 100,
        },
      },
      liveLogStream: {
        summary: {
          totalEntries: 3,
        },
        commandOutputs: [
          { message: "initialize-mobile-auth -> Invoked initialize-mobile-auth on agent-runtime" },
        ],
        streams: {
          stdout: [
            { message: "Recommended defaults are still provisional" },
          ],
        },
      },
      realtimeEventStream: {
        events: [],
      },
    },
  });

  assert.equal(viewModel.missionTitle, "לקדם את Family Flow mobile flow");
  assert.match(viewModel.detail, /סבב 2 מחזק/);
  assert.deepEqual(
    viewModel.liveItems,
    [
      "מחדד את מסך הבית סביב מה שקורה היום",
      "מקבע את הפעולה הראשונה כך שתדרוש אפס הסבר חיצוני",
    ],
  );
});
