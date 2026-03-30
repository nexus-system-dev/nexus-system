import test from "node:test";
import assert from "node:assert/strict";

import { createFeedbackComponents } from "../src/core/feedback-components.js";

test("createFeedbackComponents builds canonical feedback component library", () => {
  const { feedbackComponents } = createFeedbackComponents({
    interactionStateSystem: {
      interactionStateSystemId: "interaction-states:design-tokens:nexus",
      states: {
        hover: { emphasisColor: "#115e59", shadow: "hover-shadow" },
        active: { emphasisColor: "#115e59" },
        focus: { emphasisColor: "#0f766e", shadow: "focus-shadow" },
        disabled: { emphasisColor: "#6b7280", shadow: "none" },
        destructive: { emphasisColor: "#b91c1c", shadow: "danger-shadow" },
        success: { emphasisColor: "#15803d" },
        warning: { emphasisColor: "#b45309" },
      },
    },
  });

  assert.equal(feedbackComponents.feedbackComponentLibraryId, "feedback-components:interaction-states:design-tokens:nexus");
  assert.equal(feedbackComponents.components.length, 7);
  assert.equal(feedbackComponents.components[0].componentType, "loading-state");
  assert.equal(feedbackComponents.components[0].preview.headline, "טוען את סביבת העבודה");
  assert.deepEqual(feedbackComponents.components[3].supportedStates, ["success", "warning", "destructive"]);
  assert.deepEqual(feedbackComponents.components[3].preview.items, ["השינויים נשמרו", "Approval חסר", "הפריסה נכשלה"]);
  assert.equal(feedbackComponents.components[6].componentType, "skeleton");
  assert.equal(feedbackComponents.components[6].preview.rows, 3);
  assert.equal(feedbackComponents.summary.totalComponents, 7);
  assert.equal(feedbackComponents.summary.coversScreenStates, true);
});

test("createFeedbackComponents falls back safely without explicit interaction system", () => {
  const { feedbackComponents } = createFeedbackComponents();

  assert.equal(feedbackComponents.components.length, 7);
  assert.equal(feedbackComponents.components[2].componentType, "error-state");
  assert.equal(feedbackComponents.components[2].preview.actionLabel, "נסה שוב");
  assert.equal(feedbackComponents.summary.coversInlineFeedback, true);
});
