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
