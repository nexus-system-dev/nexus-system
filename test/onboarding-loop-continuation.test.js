import test from "node:test";
import assert from "node:assert/strict";

import {
  buildOnboardingArtifactExpectationPreview,
  buildOnboardingGenerationIntentPreview,
} from "../web/nexus-ui/adapters/understanding-adapter.js";
import { buildLoopCoreViewModel } from "../web/nexus-ui/adapters/loop-adapter.js";
import { buildNextTaskViewModel } from "../web/nexus-ui/adapters/next-task-adapter.js";
import { buildProofResultViewModel } from "../web/nexus-ui/adapters/proof-adapter.js";

function buildContinuationPreviewProject({
  projectName,
  visionText,
  artifactExpectation,
  generationIntent,
  continuationGate,
} = {}) {
  const artifactTitle = artifactExpectation.title;
  const learningDecisionImpact = {
    strategy: "repair-before-expand",
    statusLabel: "הלמידה כבר משנה את ההמשך לכיוון repair לפני expansion",
    drivingSignals: ["feedback:attention-required", "trend:stalled"],
    nextTaskDecision: {
      title: `להשלים ${continuationGate.requestedMaterialLabel} עבור ${artifactTitle}`,
      description: continuationGate.detail,
      lane: "clarification",
      dependencyStatus: `חסר עכשיו: ${continuationGate.requestedMaterialLabel}`,
      whyNow: `זה הצעד הנכון עכשיו כי בלי ${continuationGate.requestedMaterialLabel} Nexus תחזור לאותו handoff חלש.`,
    },
    continuationDecision: {
      title: `להשלים ${continuationGate.requestedMaterialLabel} לפני סבב ההמשך של ${artifactTitle}`,
      description: continuationGate.detail,
      nextMoveFamily: "learning-repair-move",
      moves: artifactExpectation.proofFocus,
    },
  };
  const repeatedLoopContinuation = {
    active: true,
    artifactTitle,
    missionTitle: `לפני סבב ההמשך של ${artifactTitle} צריך עוד חומר תומך`,
    missionDescription: continuationGate.detail,
    upcomingItems: [continuationGate.requestedMaterialLabel, ...artifactExpectation.proofFocus],
    requiresClarification: true,
    clarification: {
      requestedMaterialLabel: continuationGate.requestedMaterialLabel,
      detail: continuationGate.detail,
    },
    proofIncrement: {
      reason: `הסבב הבא נשאר פתוח סביב ${artifactTitle}, אבל מושהה truthfully עד שיצורף ${continuationGate.requestedMaterialLabel}.`,
    },
    expectedProofLine: generationIntent.learnedProofRequirement ?? artifactExpectation.continuityLine,
  };
  const proofArtifact = {
    artifactId: `proof-artifact:${artifactExpectation.projectType}`,
    artifactType: artifactExpectation.proofArtifactType,
    title: artifactTitle,
    status: "pending",
    previewKind: artifactExpectation.proofArtifactType,
    previewPayload: {
      kind: artifactExpectation.proofArtifactType,
      title: artifactTitle,
      subtitle: artifactExpectation.summary,
      statusLine: generationIntent.learnedProofRequirement ?? artifactExpectation.continuityLine,
      proofMeta: {
        previewable: true,
        regionCount: 3,
      },
    },
    provenance: {
      proofId: `proof:${artifactExpectation.projectType}`,
      screenId: `${artifactExpectation.projectType}-preview`,
    },
    actions: {
      open: { supported: true },
      download: { supported: false },
    },
    artifactExpectation,
  };
  const releaseEvidenceHandoffModel = {
    handoffStatusLabel: "handoff מושהה עד להשלמת חומר תומך",
    explainableReleasePath: `${artifactTitle} preview -> bounded package -> private-deployment`,
    builtSurfaceTitle: artifactTitle,
    wrappedArtifactType: artifactExpectation.proofArtifactType,
    packagePath: "bounded package -> private-deployment",
    previewPath: `${artifactTitle} preview -> ${artifactTitle} preview`,
    releaseTarget: "private-deployment",
    nextAction: "complete-supporting-material-handoff",
    narrative: `${artifactTitle} כבר קיבל כיוון, אבל Nexus לא תטען handoff מלא לפני שיושלם ${continuationGate.requestedMaterialLabel}.`,
    evidenceItems: [
      { label: "What was shaped", value: artifactTitle },
      { label: "Next visible target", value: continuationGate.requestedMaterialLabel },
    ],
    visibleChecks: [
      { checkId: "artifact-direction-visible", status: "passed", reason: "artifact expectation is visible across downstream surfaces" },
      { checkId: "supporting-material-gate", status: "failed", reason: `${continuationGate.requestedMaterialLabel} עדיין חסר לפני handoff מלא` },
    ],
    blockers: [`חסר עכשיו: ${continuationGate.requestedMaterialLabel}`],
    handoffSteps: [
      `להשלים ${continuationGate.requestedMaterialLabel}`,
      `לחזור לאותה שיחה כדי לעדכן את ${artifactTitle}`,
      "לפתוח שוב את Loop עם אותו חוט עבודה",
    ],
    persistenceRule: "release evidence must survive revisit and restore",
  };

  return {
    onboardingContinuationPreview: true,
    id: "onboarding-continuation-preview",
    name: projectName,
    goal: visionText,
    artifactExpectation,
    generationIntent,
    learningDecisionImpact,
    repeatedLoopContinuation,
    proofArtifact,
    releaseEvidenceHandoffModel,
    onboardingStateHandoff: {
      artifactExpectation,
      continuationGate,
    },
    onboardingCompletionDecision: {
      isComplete: true,
      supportingMaterialDeferred: true,
      continuationGate,
    },
    overview: {
      bottleneck: continuationGate.requestedMaterialLabel,
    },
    cycle: {
      roadmap: [
        {
          summary: `לקדם את ${artifactExpectation.title}`,
          status: "assigned",
        },
      ],
    },
    projectBrainWorkspace: {
      overview: {
        currentPhase: "understanding-approved-awaiting-supporting-material",
      },
      summary: {
        blockerCount: 1,
      },
    },
    developerWorkspace: {
      contextSummary: {
        progressStatus: "pending",
        nextAction: continuationGate.requestedMaterialLabel,
      },
    },
    releaseWorkspace: {
      validation: {},
    },
    aiControlCenterSurface: {
      generatedSurfacePreview: {},
    },
    context: {
      artifactExpectation,
      generationIntent,
      learningDecisionImpact,
      repeatedLoopContinuation,
      proofArtifact,
      releaseEvidenceHandoffModel,
      onboardingStateHandoff: {
        artifactExpectation,
        continuationGate,
      },
    },
  };
}

test("landing continuation preview keeps Loop as the visible truth while material stays explicit", () => {
  const onboardingFlow = {
    projectName: "Clinic Launch",
    visionText: "Build a landing page for a new clinic service",
  };
  const onboardingConversation = {
    answers: {
      "target-audience": "Clinic managers",
      "core-problem": "Visitors do not trust the new service quickly enough",
    },
  };
  const artifactExpectation = buildOnboardingArtifactExpectationPreview({
    onboardingFlow,
    onboardingConversation,
  });
  const generationIntent = buildOnboardingGenerationIntentPreview({
    onboardingFlow,
    onboardingConversation,
  });
  const continuationGate = {
    gateType: "supporting-material",
    title: "אפשר להמשיך ללופ, אבל כדאי לצרף חומר תומך לשכבת האמון",
    detail: "ההבנה כבר מספיקה כדי לקדם דף נחיתה.",
    requestedMaterialLabel: "קישור לעמוד קיים, מסמך מוצר, או עוגני אמון שיווקיים",
  };

  const viewModel = buildLoopCoreViewModel({
    project: buildContinuationPreviewProject({
      projectName: onboardingFlow.projectName,
      visionText: onboardingFlow.visionText,
      artifactExpectation,
      generationIntent,
      continuationGate,
    }),
  });

  assert.equal(artifactExpectation.projectType, "landing-page");
  assert.equal(generationIntent?.projectType, "landing-page");
  assert.equal(viewModel.primaryAction.label, "הוסף חומר תומך");
  assert.equal(viewModel.primaryAction.target, "create");
  assert.match(viewModel.mission.title, /Clinic Launch|דף נחיתה/);
  assert.match(viewModel.detail, /דף נחיתה|חומר תומך/i);
  assert.match(viewModel.whatHappensNext, /ורק אז לפתוח increment אמיתי/);
  assert.equal(viewModel.contextItems[2].title, "מה צריך כדי לפתוח סבב המשך אמיתי");
  assert.equal(viewModel.contextItems[3].body, "קישור לעמוד קיים, מסמך מוצר, או עוגני אמון שיווקיים");
});

test("mobile continuation preview keeps class-aware mobile intent even with a supporting-material gate", () => {
  const onboardingFlow = {
    projectName: "Coach Mobile",
    visionText: "Build a mobile app for coaches to guide the first client action",
  };
  const onboardingConversation = {
    answers: {
      "target-audience": "Personal coaches",
      "core-problem": "Users do not understand what to do on the first screen",
      "successful-solution": "Start the first action immediately without guidance",
    },
  };
  const artifactExpectation = buildOnboardingArtifactExpectationPreview({
    onboardingFlow,
    onboardingConversation,
  });
  const generationIntent = buildOnboardingGenerationIntentPreview({
    onboardingFlow,
    onboardingConversation,
  });
  const continuationGate = {
    gateType: "supporting-material",
    title: "אפשר להמשיך ללופ, אבל חומר תומך יחזק את הדיוק של הזרימה הניידת",
    detail: "ההבנה כבר מספיקה כדי לקדם את זרימת המובייל.",
    requestedMaterialLabel: "מסכים קיימים, spec למובייל, או קישור שמדגים את הזרימה הרצויה",
  };

  const viewModel = buildLoopCoreViewModel({
    project: buildContinuationPreviewProject({
      projectName: onboardingFlow.projectName,
      visionText: onboardingFlow.visionText,
      artifactExpectation,
      generationIntent,
      continuationGate,
    }),
  });

  assert.equal(artifactExpectation.projectType, "mobile-app");
  assert.equal(generationIntent?.projectType, "mobile-app");
  assert.equal(viewModel.primaryAction.label, "הוסף חומר תומך");
  assert.match(viewModel.mission.title, /Coach Mobile|זרימת מובייל/);
  assert.match(viewModel.detail, /זרימת המובייל|חומר תומך/);
  assert.equal(viewModel.contextItems[3].body, "מסכים קיימים, spec למובייל, או קישור שמדגים את הזרימה הרצויה");
  assert.equal(viewModel.contextItems.at(-1).title, "התוצר שאליו מכוונים");
  assert.match(viewModel.whatHappensNext, /מסכים קיימים, spec למובייל/);
});

test("continuation preview injects the same onboarding truth into next-task and proof surfaces", () => {
  const onboardingFlow = {
    projectName: "Clinic Launch",
    visionText: "Build a landing page for a new clinic service",
  };
  const onboardingConversation = {
    answers: {
      "target-audience": "Clinic managers",
      "core-problem": "Visitors do not trust the new service quickly enough",
    },
  };
  const artifactExpectation = buildOnboardingArtifactExpectationPreview({
    onboardingFlow,
    onboardingConversation,
  });
  const generationIntent = buildOnboardingGenerationIntentPreview({
    onboardingFlow,
    onboardingConversation,
  });
  const continuationGate = {
    gateType: "supporting-material",
    title: "אפשר להמשיך ללופ, אבל כדאי לצרף חומר תומך לשכבת האמון",
    detail: "ההבנה כבר מספיקה כדי לקדם דף נחיתה.",
    requestedMaterialLabel: "קישור לעמוד קיים, מסמך מוצר, או עוגני אמון שיווקיים",
  };
  const project = buildContinuationPreviewProject({
    projectName: onboardingFlow.projectName,
    visionText: onboardingFlow.visionText,
    artifactExpectation,
    generationIntent,
    continuationGate,
  });

  const nextTask = buildNextTaskViewModel({ project });
  const proof = buildProofResultViewModel({ project });

  assert.equal(nextTask.primaryAction.target, "create");
  assert.match(nextTask.mission.title, /חומר תומך/);
  assert.match(nextTask.readyNowItems[0], /מושהה truthfully/);
  assert.equal(nextTask.learningDecisionImpact.strategy, "repair-before-expand");
  assert.equal(proof.releaseEvidenceHandoff.handoffStatusLabel, "handoff מושהה עד להשלמת חומר תומך");
  assert.equal(proof.releaseEvidenceHandoff.visibleChecks[1].checkId, "supporting-material-gate");
  assert.match(proof.releaseEvidenceHandoff.blockers[0], /חסר עכשיו/);
});
