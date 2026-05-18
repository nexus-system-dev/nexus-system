import test from "node:test";
import assert from "node:assert/strict";

import { buildCanonicalProofArtifact } from "../src/core/canonical-proof-artifact.js";

test("canonical proof artifact reuses onboarding artifact expectation", () => {
  const artifact = buildCanonicalProofArtifact({
    project: {
      id: "queue-workspace",
      name: "Queue Workspace",
      artifactExpectation: {
        expectationId: "artifact-expectation:internal-tool:queue-workspace",
        proofArtifactType: "internal-ops-dashboard",
        artifactType: "internal-ops-workspace",
        title: "Queue Workspace workspace",
        summary: "Workspace פנימי עם תור עבודה ברור, ownership, SLA ופעולה הבאה.",
        continuityLine: "ב-Proof נרצה לראות Queue Workspace workspace עם תור עבודה חי, ownership גלוי ופעולה הבאה שכל נציג מבין מיד.",
        problem: "Queue ownership is unclear",
      },
    },
    previewScreenViewModel: {
      screenId: "queue-preview",
      meta: { regionCount: 3 },
    },
    generatedSurfaceProofSchema: {
      proofId: "proof-1",
      summary: {
        proofStatus: "ready",
      },
      evidence: {
        isPreviewable: true,
        regionCount: 3,
      },
    },
    aiControlCenterSurface: {
      generatedSurfacePreview: {
        screenId: "queue-preview",
      },
    },
  });

  assert.equal(artifact.artifactType, "internal-ops-dashboard");
  assert.equal(artifact.title, "Queue Workspace workspace");
  assert.equal(artifact.previewPayload.subtitle, "Workspace פנימי עם תור עבודה ברור, ownership, SLA ופעולה הבאה.");
  assert.match(artifact.previewPayload.insight, /ownership/);
});

test("canonical proof artifact builds a landing page artifact from landing runtime truth", () => {
  const artifact = buildCanonicalProofArtifact({
    project: {
      id: "landing-proof",
      name: "Growth Sprint",
      context: {
        artifactExpectation: {
          expectationId: "artifact-expectation:landing-page:growth-sprint-landing-page",
          projectType: "landing-page",
          proofArtifactType: "landing-page",
          artifactType: "landing-page",
          title: "Growth Sprint landing page",
          summary: "דף נחיתה עם הבטחה ברורה, אמון וקריאה אחת לפעולה.",
          continuityLine: "ב-Proof נרצה לראות Growth Sprint landing page שמוכיח הבטחה ברורה, אמון ופעולה מיידית.",
          audience: "Founders evaluating an AI ops workflow",
          problem: "The product promise is still vague",
        },
        messagingFramework: {
          status: "ready",
          headline: "Stop planning drift before it reaches delivery",
          subheadline: "One operating loop that turns project intent into visible execution truth.",
          audience: "Founders evaluating an AI ops workflow",
          valueProps: [
            { label: "One promise above the fold" },
            { label: "Trust before the click" },
            { label: "One CTA that is easy to choose" },
          ],
        },
        landingPageIa: {
          status: "ready",
          sections: [
            { sectionId: "section:hero", title: "Hero", intent: "State the product promise immediately." },
            { sectionId: "section:proof", title: "Proof", intent: "Show why the visitor can trust the offer." },
          ],
        },
        websiteCopyPack: {
          status: "ready",
          pageCopy: [
            { sectionId: "section:hero", title: "Stop planning drift before it reaches delivery", body: "One operating loop that turns project intent into visible execution truth.", ctaLabel: "Start project" },
          ],
          faqEntries: [
            { question: "How fast can we start?", answer: "Start with one focused loop and grow from there." },
          ],
          primaryCta: { label: "Start project", reason: "Bridge the visitor into the first activation step." },
        },
        trustProofBlocks: {
          status: "ready",
          blocks: [
            { title: "Governed execution", body: "The landing flow carries one canonical product story into the loop." },
          ],
        },
        productCtaStrategy: {
          status: "ready",
          primaryCta: { label: "Start project", reason: "Bridge the visitor into the first activation step." },
          secondaryCtas: [{ label: "Book demo" }],
        },
      },
    },
    previewScreenViewModel: {
      screenId: "landing-preview",
      meta: { regionCount: 5 },
    },
    generatedSurfaceProofSchema: {
      proofId: "proof-landing-1",
      summary: {
        proofStatus: "ready",
      },
      evidence: {
        isPreviewable: true,
        regionCount: 5,
      },
    },
  });

  assert.equal(artifact.artifactType, "landing-page");
  assert.equal(artifact.previewPayload.kind, "landing-page");
  assert.equal(artifact.previewPayload.primaryCta.label, "Start project");
  assert.match(artifact.previewPayload.headline, /planning drift/i);
  assert.equal(artifact.actions.download.supported, true);
});

test("canonical proof artifact builds a mobile app artifact from mobile runtime truth", () => {
  const artifact = buildCanonicalProofArtifact({
    project: {
      id: "mobile-proof",
      name: "Family Flow",
      context: {
        artifactExpectation: {
          expectationId: "artifact-expectation:mobile-app:family-flow-mobile-flow",
          projectType: "mobile-app",
          proofArtifactType: "mobile-app",
          artifactType: "mobile-flow",
          title: "Family Flow mobile flow",
          summary: "זרימת מובייל עם מסך ראשון ברור, פעולה ראשונה והמשך נקי.",
          continuityLine: "ב-Proof נרצה לראות Family Flow mobile flow שמוכיח מסך ראשון ברור, פעולה ראשונה והמשך רציף.",
          audience: "Busy parents coordinating school pickups and reminders",
          problem: "Parents miss task ownership and time-sensitive reminders",
          solution: "A home screen with today's plan and one-tap confirmation for the next task.",
        },
        screenInventory: {
          summary: { totalScreens: 3 },
          screens: [
            { screenId: "home", title: "Home", screenType: "dashboard" },
            { screenId: "task-detail", title: "Task detail", screenType: "detail" },
            { screenId: "confirm", title: "Confirm", screenType: "flow-step" },
          ],
        },
        screenFlowMap: {
          flows: [
            { from: "home", to: "task-detail" },
            { from: "task-detail", to: "confirm" },
          ],
        },
        mobileChecklist: {
          summary: { totalScreens: 3, mobileReadyScreens: 2 },
          screens: [
            { screenId: "home", summary: { mobileReadyByContract: true, requiredItems: 0 } },
            { screenId: "task-detail", summary: { mobileReadyByContract: true, requiredItems: 1 } },
            { screenId: "confirm", summary: { mobileReadyByContract: false, requiredItems: 2 } },
          ],
        },
        screenStates: {
          summary: { totalScreens: 3, successScreens: 3 },
          screens: [
            { screenId: "home", states: { loading: { enabled: true }, success: { enabled: true } } },
            { screenId: "task-detail", states: { empty: { enabled: true }, success: { enabled: true } } },
          ],
        },
        remoteMacRunner: {
          appleBuildConfig: {
            platform: "ios",
            archive: {
              exportMethod: "app-store",
              artifactPath: "artifacts/ios/app.ipa",
            },
          },
        },
      },
    },
    previewScreenViewModel: {
      screenId: "mobile-preview",
      meta: { regionCount: 4 },
    },
    generatedSurfaceProofSchema: {
      proofId: "proof-mobile-1",
      summary: {
        proofStatus: "ready",
      },
      evidence: {
        isPreviewable: true,
        regionCount: 4,
      },
    },
  });

  assert.equal(artifact.artifactType, "mobile-app");
  assert.equal(artifact.previewPayload.kind, "mobile-app");
  assert.equal(artifact.previewPayload.firstScreen.title, "Home");
  assert.equal(artifact.previewPayload.release.artifactPath, "artifacts/ios/app.ipa");
  assert.equal(artifact.actions.download.supported, true);
});

test("canonical proof artifact exposes a repeated-loop increment after approval", () => {
  const artifact = buildCanonicalProofArtifact({
    project: {
      id: "mobile-loop-2",
      name: "Family Flow",
      approvalRecords: [
        {
          approvalRecordId: "approval-1",
          status: "approved",
          decision: "approved",
        },
      ],
      taskResults: [
        {
          id: "task.completed:mobile-loop-2:define-home-screen",
          status: "completed",
          output: {
            summary: "מסך הבית הראשון נסגר עם מצב עבודה ברור",
          },
        },
      ],
      cycle: {
        roadmap: [
          {
            id: "task-2",
            status: "assigned",
            summary: "מחדדים את הפעולה הראשונה ומקבעים את מסך ההמשך",
          },
        ],
      },
      context: {
        artifactExpectation: {
          expectationId: "artifact-expectation:mobile-app:family-flow-mobile-flow",
          projectType: "mobile-app",
          proofArtifactType: "mobile-app",
          artifactType: "mobile-flow",
          title: "Family Flow mobile flow",
          summary: "זרימת מובייל עם מסך ראשון ברור, פעולה ראשונה והמשך נקי.",
          continuityLine: "ב-Proof נרצה לראות Family Flow mobile flow שמוכיח מסך ראשון ברור, פעולה ראשונה והמשך רציף.",
          audience: "Busy parents coordinating school pickups and reminders",
          problem: "Parents miss task ownership and time-sensitive reminders",
          solution: "A home screen with today's plan and one-tap confirmation for the next task.",
        },
        screenInventory: {
          summary: { totalScreens: 2 },
          screens: [
            { screenId: "home", title: "Home", screenType: "dashboard" },
            { screenId: "confirm", title: "Confirm", screenType: "flow-step" },
          ],
        },
        screenFlowMap: {
          flows: [{ from: "home", to: "confirm" }],
        },
        mobileChecklist: {
          summary: { totalScreens: 2, mobileReadyScreens: 2 },
          screens: [
            { screenId: "home", summary: { mobileReadyByContract: true, requiredItems: 0 } },
            { screenId: "confirm", summary: { mobileReadyByContract: true, requiredItems: 0 } },
          ],
        },
        screenStates: {
          summary: { totalScreens: 2, successScreens: 2 },
          screens: [
            { screenId: "home", states: { success: { enabled: true } } },
            { screenId: "confirm", states: { success: { enabled: true } } },
          ],
        },
        remoteMacRunner: {
          appleBuildConfig: {
            platform: "ios",
            archive: {
              exportMethod: "app-store",
              artifactPath: "artifacts/ios/app.ipa",
            },
          },
        },
      },
    },
    previewScreenViewModel: {
      screenId: "mobile-preview",
      meta: { regionCount: 4 },
    },
    generatedSurfaceProofSchema: {
      proofId: "proof-mobile-2",
      summary: {
        proofStatus: "ready",
      },
      evidence: {
        isPreviewable: true,
        regionCount: 4,
      },
    },
  });

  assert.match(artifact.previewPayload.statusLine, /סבב 2/);
  assert.equal(artifact.previewPayload.increment?.title, "מחדדים את הפעולה הראשונה ומקבעים את מסך ההמשך");
  assert.match(artifact.previewPayload.increment?.reason ?? "", /מסך הבית הראשון/);
});

test("canonical proof artifact prefers persisted repeated-loop continuation proof increment", () => {
  const artifact = buildCanonicalProofArtifact({
    project: {
      id: "mobile-loop-persisted",
      name: "Family Flow",
      state: {
        repeatedLoopContinuation: {
          active: true,
          proofIncrement: {
            iterationNumber: 2,
            title: "סבב 2 מחדד את מסך הבית, הפעולה הראשונה, ומסך ההמשך",
            statusLine: "סבב 2 מקדם עכשיו את המסך הראשון, הפעולה הראשונה, ומעבר ההמשך של Family Flow mobile flow",
            reason: "האישור האחרון פתח סבב המשך שמחזק את השימושיות של הזרימה.",
            highlights: ["המסך הראשון נהיה חד יותר סביב ההחלטה שצריך לקבל עכשיו"],
          },
        },
      },
      context: {
        artifactExpectation: {
          expectationId: "artifact-expectation:mobile-app:family-flow-mobile-flow",
          projectType: "mobile-app",
          proofArtifactType: "mobile-app",
          artifactType: "mobile-flow",
          title: "Family Flow mobile flow",
          summary: "זרימת מובייל עם מסך ראשון ברור, פעולה ראשונה והמשך נקי.",
          audience: "Busy parents coordinating school pickups and reminders",
          problem: "Parents miss task ownership and time-sensitive reminders",
        },
        screenInventory: {
          summary: { totalScreens: 2 },
          screens: [
            { screenId: "home", title: "Home", screenType: "dashboard" },
            { screenId: "confirm", title: "Confirm", screenType: "flow-step" },
          ],
        },
        screenFlowMap: {
          flows: [{ from: "home", to: "confirm" }],
        },
        mobileChecklist: {
          summary: { totalScreens: 2, mobileReadyScreens: 2 },
          screens: [
            { screenId: "home", summary: { mobileReadyByContract: true, requiredItems: 0 } },
            { screenId: "confirm", summary: { mobileReadyByContract: true, requiredItems: 0 } },
          ],
        },
        screenStates: {
          summary: { totalScreens: 2, successScreens: 2 },
          screens: [
            { screenId: "home", states: { success: { enabled: true } } },
            { screenId: "confirm", states: { success: { enabled: true } } },
          ],
        },
      },
    },
    previewScreenViewModel: {
      screenId: "mobile-preview",
      meta: { regionCount: 4 },
    },
    generatedSurfaceProofSchema: {
      proofId: "proof-mobile-2",
      summary: {
        proofStatus: "ready",
      },
      evidence: {
        isPreviewable: true,
        regionCount: 4,
      },
    },
  });

  assert.match(artifact.previewPayload.statusLine, /סבב 2/);
  assert.equal(artifact.previewPayload.increment?.iterationNumber, 2);
  assert.match(artifact.previewPayload.increment?.reason ?? "", /השימושיות/);
});
