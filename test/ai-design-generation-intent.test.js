import test from "node:test";
import assert from "node:assert/strict";

import { createAiDesignService } from "../src/core/ai-design-service.js";
import { buildLoopCoreViewModel } from "../web/nexus-ui/adapters/loop-adapter.js";

function createBaseDesignInput(artifactExpectation) {
  return {
    projectId: `project-${artifactExpectation.projectType}`,
    projectState: {
      projectId: `project-${artifactExpectation.projectType}`,
    },
    selectedTask: {
      id: `task-${artifactExpectation.projectType}`,
      summary: `Generate ${artifactExpectation.title}`,
      lane: "release",
      taskType: "design",
    },
    screenContract: {
      screenId: `${artifactExpectation.projectType}-screen`,
      screenType: "detail",
      title: artifactExpectation.title,
      regions: [
        { regionId: "hero", slot: "hero", componentType: "panel" },
        { regionId: "proof", slot: "proof", componentType: "panel" },
      ],
    },
    renderableScreenModel: {
      modelId: `renderable-screen-model:${artifactExpectation.projectType}`,
      screenId: `${artifactExpectation.projectType}-screen`,
      screenType: "detail",
      title: artifactExpectation.title,
      regions: [
        { regionId: "hero", slot: "hero", componentType: "panel", constraints: { emphasis: "high" } },
        { regionId: "proof", slot: "proof", componentType: "panel", constraints: { emphasis: "medium" } },
      ],
    },
    renderableScreenComposition: {
      compositionId: `composition:${artifactExpectation.projectType}`,
      screenId: `${artifactExpectation.projectType}-screen`,
      currentPhase: "populated",
      regions: [
        { regionId: "hero", slot: "hero", component: "panel", order: 1, isVisible: true },
        { regionId: "proof", slot: "proof", component: "panel", order: 2, isVisible: true },
      ],
      ctaAnchors: [{ ctaId: "cta-1", anchor: "primary", actionIntent: "review" }],
    },
    screenFlowMap: {
      defaultFlowId: `${artifactExpectation.projectType}-flow`,
    },
    screenStates: {
      screens: [{ screenId: `${artifactExpectation.projectType}-screen`, phase: "populated" }],
    },
    designTokens: {
      tokenSetId: `tokens-${artifactExpectation.projectType}`,
    },
    componentContract: {
      contractId: `component-contract:${artifactExpectation.projectType}`,
    },
    artifactExpectation,
  };
}

test("ai design request carries landing generation intent into proposal inputs", () => {
  const artifactExpectation = {
    expectationId: "artifact-expectation:landing-page:clinic-landing",
    projectType: "landing-page",
    projectTypeLabel: "דף נחיתה / שיווק",
    proofArtifactType: "generated-surface",
    title: "Clinic Landing landing page",
    summary: "דף נחיתה חד עם הבטחה ברורה, הוכחת אמון וקריאה אחת לפעולה.",
    continuityLine: "ב-Proof נרצה לראות דף נחיתה עם הבטחה ברורה, אמון ופעולה מיידית.",
    proofFocus: [
      "הבטחה ראשית מעל הקפל",
      "הוכחת אמון שתומכת בהחלטה",
      "CTA מרכזי אחד שקל להבין",
    ],
  };

  const { aiDesignServiceResult } = createAiDesignService(createBaseDesignInput(artifactExpectation));
  const request = aiDesignServiceResult.aiDesignRequest;
  const proposal = aiDesignServiceResult.aiDesignProviderResult.aiDesignProposal;

  assert.equal(request.generationIntent.projectType, "landing-page");
  assert.match(request.generationIntent.generationGoal, /promise, trust proof, and one clear CTA/i);
  assert.deepEqual(request.generationIntent.focusAreas, artifactExpectation.proofFocus);
  assert.match(proposal.copy[0].proposedText, /הבטחה ראשית מעל הקפל/);
  assert.equal(proposal.interactions[0].label, "Open primary CTA");
});

test("ai design request carries mobile generation intent into proposal inputs", () => {
  const artifactExpectation = {
    expectationId: "artifact-expectation:mobile-app:coach-mobile",
    projectType: "mobile-app",
    projectTypeLabel: "אפליקציה",
    proofArtifactType: "generated-surface",
    title: "Coach Mobile mobile flow",
    summary: "זרימת מובייל ראשונה עם מסך פתיחה ברור, פעולה ראשונה מובנת ומעבר נקי לצעד הבא.",
    continuityLine: "ב-Proof נרצה לראות זרימת מובייל עם מסך ראשון ברור, פעולה ראשונה מובנת וזרימה ניידת שמשרתת את המשתמש.",
    proofFocus: [
      "מסך ראשון ברור למשתמש הנכון",
      "פעולה ראשונה שאפשר להבין בלי הדרכה",
      "זרימה ניידת שמטפלת ישירות בכאב המרכזי",
    ],
  };

  const { aiDesignServiceResult } = createAiDesignService(createBaseDesignInput(artifactExpectation));
  const request = aiDesignServiceResult.aiDesignRequest;
  const proposal = aiDesignServiceResult.aiDesignProviderResult.aiDesignProposal;

  assert.equal(request.generationIntent.projectType, "mobile-app");
  assert.match(request.generationIntent.generationGoal, /first screen, first action, and next-step continuity/i);
  assert.equal(proposal.interactions[0].label, "Start the first mobile action");
  assert.match(proposal.copy[0].proposedText, /מסך ראשון ברור למשתמש הנכון/);
});

test("loop view model exposes generation intent before proof for weak classes", () => {
  const viewModel = buildLoopCoreViewModel({
    project: {
      id: "landing-proof-intent",
      name: "Clinic Landing",
      artifactExpectation: {
        title: "Clinic Landing landing page",
        loopReadyMessage: "המשימה הבאה צריכה לקדם דף נחיתה חד עם מסר, אמון ו-CTA.",
      },
      generationIntent: {
        intentId: "generation-intent:landing-page:clinic-landing",
        weakClass: true,
        artifactTitle: "Clinic Landing landing page",
        generationGoal: "Clinic Landing landing page should make the promise, trust proof, and one clear CTA visible before Proof.",
        framingLine: "ב-Proof נרצה לראות Clinic Landing landing page שמוכיח הבטחה ברורה, אמון ופעולה מיידית.",
      },
      cycle: {
        roadmap: [
          {
            summary: "Generate the landing surface",
            status: "assigned",
          },
        ],
      },
      projectBrainWorkspace: {
        overview: {
          currentPhase: "understanding-complete",
        },
        summary: {
          blockerCount: 0,
        },
      },
      developerWorkspace: {
        contextSummary: {
          progressStatus: "pending",
        },
      },
      releaseWorkspace: {
        validation: {},
      },
      aiControlCenterSurface: {
        generatedSurfacePreview: {},
      },
    },
  });

  assert.match(viewModel.detail, /Clinic Landing landing page/);
  assert.match(viewModel.whyItMatters, /promise, trust proof, and one clear CTA/i);
  assert.equal(viewModel.contextItems[2].title, "איך Nexus יוצר את התוצר");
});
