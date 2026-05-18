import test from "node:test";
import assert from "node:assert/strict";

import {
  buildOnboardingArtifactExpectationPreview,
  buildOnboardingGenerationIntentPreview,
} from "../web/nexus-ui/adapters/understanding-adapter.js";
import { buildLoopCoreViewModel } from "../web/nexus-ui/adapters/loop-adapter.js";

function buildContinuationPreviewProject({
  projectName,
  visionText,
  artifactExpectation,
  generationIntent,
  continuationGate,
} = {}) {
  return {
    onboardingContinuationPreview: true,
    name: projectName,
    goal: visionText,
    artifactExpectation,
    generationIntent,
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
  assert.equal(viewModel.primaryAction.target, "onboarding");
  assert.match(viewModel.mission.title, /Clinic Launch landing page/);
  assert.match(viewModel.detail, /דף נחיתה|חומר תומך/i);
  assert.match(viewModel.whatHappensNext, /בלי לפתוח מחדש handoff חלש/);
  assert.equal(viewModel.contextItems[2].title, "חומר תומך שאפשר להוסיף תוך כדי תנועה");
  assert.match(viewModel.contextItems[3].body, /promise, trust proof, and one clear CTA/i);
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
  assert.match(viewModel.mission.title, /Coach Mobile mobile flow/);
  assert.match(viewModel.detail, /זרימת המובייל|חומר תומך/);
  assert.match(viewModel.contextItems[3].body, /first screen, first action, and next-step continuity/i);
  assert.equal(viewModel.contextItems.at(-1).title, "התוצר שאליו מכוונים");
  assert.match(viewModel.whatHappensNext, /מסכים קיימים, spec למובייל/);
});
