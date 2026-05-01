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

test("createFeedbackComponents normalizes invalid interaction identity and token payloads", () => {
  const { feedbackComponents } = createFeedbackComponents({
    interactionStateSystem: {
      interactionStateSystemId: { invalid: true },
      states: {
        hover: { emphasisColor: 42, shadow: {} },
        active: { emphasisColor: null },
        focus: { emphasisColor: false, shadow: [] },
        disabled: { emphasisColor: "", shadow: 11 },
        destructive: { emphasisColor: {}, shadow: 7 },
        success: { emphasisColor: [] },
        warning: { emphasisColor: 0 },
      },
    },
  });

  assert.equal(feedbackComponents.feedbackComponentLibraryId, "feedback-components:nexus");
  assert.equal(feedbackComponents.components[0].tokens.emphasisColor, "#0f766e");
  assert.equal(feedbackComponents.components[0].tokens.shadow, "0 0 0 3px rgba(15, 118, 110, 0.18)");
  assert.equal(feedbackComponents.components[1].tokens.emphasisColor, "#6b7280");
  assert.equal(feedbackComponents.components[2].tokens.emphasisColor, "#b91c1c");
  assert.equal(feedbackComponents.components[2].tokens.shadow, "0 8px 24px rgba(15, 23, 42, 0.08)");
  assert.equal(feedbackComponents.components[3].tokens.successColor, "#15803d");
  assert.equal(feedbackComponents.components[5].tokens.activeColor, "#115e59");
  assert.equal(feedbackComponents.components[6].tokens.shimmerColor, "#115e59");
});

test("createFeedbackComponents ignores non-object state payloads and emits safe defaults", () => {
  const { feedbackComponents } = createFeedbackComponents({
    interactionStateSystem: {
      interactionStateSystemId: "interaction-states:design-tokens:nexus",
      states: "invalid",
    },
  });

  assert.equal(
    feedbackComponents.feedbackComponentLibraryId,
    "feedback-components:interaction-states:design-tokens:nexus",
  );
  assert.equal(feedbackComponents.components[0].tokens.emphasisColor, "#0f766e");
  assert.equal(feedbackComponents.components[1].tokens.shadow, "none");
  assert.equal(feedbackComponents.components[3].tokens.warningColor, "#b45309");
  assert.equal(feedbackComponents.components[6].tokens.shadow, "0 8px 24px rgba(15, 23, 42, 0.08)");
});
