import test from "node:test";
import assert from "node:assert/strict";

import { createGeneratedBrandConsistencyValidator } from "../src/core/generated-brand-consistency-validator.js";

test("generated brand consistency validator marks aligned preview typography and accent as ready", () => {
  const { generatedBrandConsistencyValidator } = createGeneratedBrandConsistencyValidator({
    designTokens: {
      colors: { accent: "#0f766e" },
      typography: {
        familyBody: "\"IBM Plex Sans\", \"Helvetica Neue\", sans-serif",
        familyDisplay: "\"Avenir Next\", \"Helvetica Neue\", sans-serif",
      },
    },
    colorRules: {
      roles: {
        accent: { token: "#0f766e" },
      },
    },
    typographySystem: {
      typeScale: {
        body: { fontFamily: "\"IBM Plex Sans\", \"Helvetica Neue\", sans-serif" },
        display: { fontFamily: "\"Avenir Next\", \"Helvetica Neue\", sans-serif" },
      },
    },
    renderableDesignProposal: {
      proposalId: "proposal-brand-1",
      screenId: "release-screen",
      copy: [{ copyId: "copy-1" }],
    },
    previewScreenViewModel: {
      screenId: "release-screen",
      regions: [{ previewStyles: { backgroundColor: "#0f766e" } }],
      tokens: {
        primaryColor: "#0f766e",
        fontFamily: "\"IBM Plex Sans\", \"Helvetica Neue\", sans-serif",
      },
      meta: {
        regionCount: 1,
      },
    },
    generatedSurfaceProofSchema: {
      proofId: "proof-1",
      status: "proven",
    },
  });

  assert.equal(generatedBrandConsistencyValidator.status, "ready");
  assert.equal(generatedBrandConsistencyValidator.summary.failedCheckCount, 0);
  assert.equal(generatedBrandConsistencyValidator.evidence.accentMatchedRegions, 1);
});

test("generated brand consistency validator flags mismatched typography and missing proof", () => {
  const { generatedBrandConsistencyValidator } = createGeneratedBrandConsistencyValidator({
    designTokens: {
      colors: { accent: "#0f766e" },
      typography: {
        familyBody: "\"IBM Plex Sans\", \"Helvetica Neue\", sans-serif",
        familyDisplay: "\"Avenir Next\", \"Helvetica Neue\", sans-serif",
      },
    },
    colorRules: {
      roles: {
        accent: { token: "#0f766e" },
      },
    },
    typographySystem: {
      typeScale: {
        body: { fontFamily: "\"IBM Plex Sans\", \"Helvetica Neue\", sans-serif" },
        display: { fontFamily: "\"Avenir Next\", \"Helvetica Neue\", sans-serif" },
      },
    },
    renderableDesignProposal: {
      proposalId: "proposal-brand-2",
      screenId: "release-screen",
      copy: [],
    },
    previewScreenViewModel: {
      screenId: "release-screen",
      regions: [{ previewStyles: { backgroundColor: "#ffffff" } }],
      tokens: {
        primaryColor: "#ffffff",
        fontFamily: "Inter",
      },
      meta: {
        regionCount: 1,
      },
    },
    generatedSurfaceProofSchema: {
      proofId: "proof-2",
      status: "needs-attention",
    },
  });

  assert.equal(generatedBrandConsistencyValidator.status, "needs-attention");
  assert.equal(generatedBrandConsistencyValidator.summary.failedCheckCount >= 2, true);
  assert.equal(generatedBrandConsistencyValidator.evidence.proposalCopyCount, 0);
});
