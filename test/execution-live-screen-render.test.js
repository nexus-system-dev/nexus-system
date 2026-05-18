import test from "node:test";
import assert from "node:assert/strict";

import { renderExecutionLiveScreen } from "../web/nexus-ui/screens/ExecutionLiveScreen.js";

test("execution live screen renders workspace contract inside visible surface", () => {
  const html = renderExecutionLiveScreen({
    badge: "Nexus עובד עכשיו",
    title: "מבצעים את המשימה",
    subtitle: "המערכת פועלת עכשיו על המשימה שנבחרה לך.",
    detail: "מגדירים את ה־split workspace הקנוני.",
    missionTitle: "נועלים מודל workspace חי",
    progressPercent: 42,
    statusItems: [
      { label: "חוזה build surface", status: "done" },
      { label: "runtime direction", status: "active" },
    ],
    liveItems: ["מייצב build region", "קושר runtime visibility"],
    logItems: [{ time: "עכשיו", message: "workspace contract rendered" }],
    stats: [{ label: "התקדמות", value: "42%" }],
    projectName: "Workspace Project",
    stopAction: { label: "עצור ביצוע", supported: false },
    proofAction: { label: "הצג הוכחה כשמוכן ←", target: "proof" },
    workspaceSurfaceModel: {
      workspaceFamily: "product-workspace",
      previewFrameFamily: "product-workspace-preview",
      buildSurfaceFamily: "saas-product-surface",
      buildSurfaceTitle: "המוצר עצמו נבנה בתוך workspace חי",
      buildSurfaceDetail: "workflow ראשון, state, והפעולה היצרנית הבאה צריכים להתבהר מול המשתמש.",
      orchestrationEmphasis: "workflow-activation-and-first-product-move",
      runtimeDirection: "web-app-runtime",
      releasePathFamily: "web-product-release",
      visibleMilestones: ["product-shell-visible", "workflow-visible"],
    },
    classSpecificSurfaceEvolutionRules: {
      evolutionFamily: "workflow-evolution",
      frontendSurfaceType: "product-workspace",
      backendStateType: "workflow-state",
      sceneType: "workflow-sequence",
      visibleEvolutionRule: "product workflow and state feedback must evolve together",
      requiredVisibleChanges: ["workflow surface evolves", "state feedback updates visibly"],
    },
    localWorkspaceContract: {
      workspaceMode: "browser-backed-local-workspace",
      desktopShellStatus: "deferred-to-w4-mbn-010",
      currentWorkspaceKey: "project-brain",
      buildRouteKey: "execution",
      resumeWorkspace: "project-brain",
      continuitySource: "workspace-navigation",
      continuityGuarantees: ["project identity survives reopen", "active workspace survives reopen"],
    },
    desktopShellScopeContract: {
      shellFamily: "browser-backed-shell",
      shellStatus: "scope-defined-not-implemented",
      currentWave4Path: "browser-backed-local-workspace",
      preferredFutureShell: "desktop-wrapper-shell",
      releaseWorkflowMode: "browser-to-cloud-handoff",
      obligations: ["desktop shell cannot lose workspace continuity"],
    },
    classAwareRuntimeResolver: {
      runtimeFamily: "web-app-runtime",
      packagingFamily: "saas-package",
      releasePathFamily: "web-product-release",
      previewFamily: "product-workspace-preview",
      targetPlatform: "web",
      preferredReleaseTarget: "web-deployment",
      shellPath: "browser-backed-local-workspace",
      visibleRuntimeRule: "runtime path must stay visible as product workspace runtime with web product release",
      projectFacingPath: "web-app-runtime -> web-product-release",
      packagingPath: "product-workspace-preview -> saas-package",
    },
    classAwarePackagingPreviewContract: {
      previewFamily: "product-workspace-preview",
      previewMode: "product-workspace-preview",
      previewSurface: "customer-facing-product-preview",
      previewArtifact: "product-workflow-preview",
      packageMode: "saas-web-package",
      packagingFamily: "saas-package",
      packageArtifactType: "deployable-product-web-bundle",
      preferredReleaseTarget: "web-deployment",
      shellPath: "browser-backed-local-workspace",
      packagingExpectation: "SaaS package stays aligned to product runtime, activation path, and web release",
      visiblePreviewRule: "preview must feel like a product workflow users can move through, not a static artifact",
      visiblePackagingRule: "packaging must stay visible as a product web bundle ready for releaseable runtime",
      continuityRule: "preview/package mode must persist as project-facing class truth across reopen and return",
      previewPath: "product-workspace-preview -> product-workspace-preview",
      packagePath: "saas-package -> web-deployment",
    },
    releaseableProductStateContract: {
      status: "active",
      stateFamily: "releaseable-product-state",
      readinessDecision: "needs-release-handoff",
      releaseTarget: "web-deployment",
      packageArtifactType: "deployable-product-web-bundle",
      packagePath: "saas-package -> web-deployment",
      previewPath: "product-workspace-preview -> product-workspace-preview",
      packagingExpectation: "SaaS package stays aligned to runtime, release path, and user-facing workflow continuity",
      continuityRule: "releaseable state must survive reopen, route restore, and the next continuation loop",
      visibleStateRule: "releaseable state is not proof text alone; it must reflect runtime, package, checks, and release target visibly",
      blockedReasons: ["release handoff still missing"],
      visibleChecks: [
        { checkId: "build-surface-visible", status: "passed", reason: "surface remains visible" },
        { checkId: "launch-confirmed", status: "pending", reason: "waiting for release handoff" },
      ],
      label: "Release prep active",
      nextAction: "complete-release-handoff",
      readinessScore: "84",
    },
    buildProgressionStateMachine: {
      currentLabel: "ה־surface מתפתח",
      currentRouteKey: "execution",
      overlayStatus: "active",
      states: [
        { stateId: "class-locked", label: "ה־class ננעל", routeKey: "understanding", status: "done" },
        { stateId: "skeleton-visible", label: "השלד נראה על המסך", routeKey: "execution", status: "done" },
        { stateId: "surface-evolving", label: "ה־surface מתפתח", routeKey: "execution", status: "active" },
      ],
    },
  });

  assert.match(html, /nexus-execution-screen__workspace-contract/);
  assert.match(html, /product-workspace/);
  assert.match(html, /המוצר עצמו נבנה בתוך workspace חי/);
  assert.match(html, /web-app-runtime -&gt; web-product-release|web-app-runtime -&gt; web-product-release/);
  assert.match(html, /Build progression/);
  assert.match(html, /ה־surface מתפתח/);
  assert.match(html, /Class-aware evolution/);
  assert.match(html, /workflow-evolution/);
  assert.match(html, /workflow-sequence/);
  assert.match(html, /Local workspace contract/);
  assert.match(html, /browser-backed-local-workspace/);
  assert.match(html, /deferred-to-w4-mbn-010/);
  assert.match(html, /Desktop shell scope/);
  assert.match(html, /browser-backed-shell/);
  assert.match(html, /scope-defined-not-implemented/);
  assert.match(html, /Runtime path/);
  assert.match(html, /web-app-runtime/);
  assert.match(html, /web-app-runtime -&gt; web-product-release|web-app-runtime -> web-product-release/);
  assert.match(html, /Packaging \/ preview contract/);
  assert.match(html, /deployable-product-web-bundle/);
  assert.match(html, /saas-package -&gt; web-deployment|saas-package -> web-deployment/);
  assert.match(html, /product-workspace-preview -&gt; product-workspace-preview|product-workspace-preview -> product-workspace-preview/);
  assert.match(html, /Releaseable state/);
  assert.match(html, /Release prep active/);
  assert.match(html, /complete-release-handoff/);
  assert.match(html, /launch-confirmed/);
  assert.match(html, /84%/);
});
