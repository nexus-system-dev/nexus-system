import test from "node:test";
import assert from "node:assert/strict";

import { defineGeneratedSurfaceProofSchema } from "../src/core/generated-surface-proof-schema.js";

test("generated surface proof schema marks a previewable validated proposal as proven", () => {
  const { generatedSurfaceProofSchema } = defineGeneratedSurfaceProofSchema({
    renderableDesignProposal: {
      proposalId: "proposal:1",
      screenId: "release-screen",
      meta: {
        isRenderable: true,
        sourceProposalId: "proposal:1",
      },
    },
    designProposalValidation: {
      validationId: "validation:1",
      status: "valid",
    },
    designProposalPreviewState: {
      previewStateId: "preview:1",
      status: "ready",
      summary: {
        isPreviewable: true,
      },
    },
    previewScreenViewModel: {
      screenId: "release-screen",
      meta: {
        regionCount: 5,
        isPreviewable: true,
        hasCtaAnchors: true,
      },
    },
    aiControlCenterSurface: {
      generatedSurfacePreview: {
        screenId: "release-screen",
        regionCount: 5,
        isPreviewable: true,
        hasCtaAnchors: true,
      },
    },
  });

  assert.equal(generatedSurfaceProofSchema.status, "proven");
  assert.equal(generatedSurfaceProofSchema.summary.failedCheckCount, 0);
  assert.equal(generatedSurfaceProofSchema.evidence.regionCount, 5);
});

test("generated surface proof schema flags missing preview and invalid validation", () => {
  const { generatedSurfaceProofSchema } = defineGeneratedSurfaceProofSchema({
    renderableDesignProposal: {
      proposalId: "proposal:2",
      screenId: "release-screen",
      meta: {
        isRenderable: false,
      },
    },
    designProposalValidation: {
      validationId: "validation:2",
      status: "invalid",
    },
    designProposalPreviewState: {
      previewStateId: "preview:2",
      status: "blocked",
      summary: {
        isPreviewable: false,
      },
    },
    previewScreenViewModel: {
      screenId: "release-screen",
      meta: {
        regionCount: 0,
        isPreviewable: false,
        hasCtaAnchors: false,
      },
    },
    aiControlCenterSurface: {
      generatedSurfacePreview: {
        screenId: "release-screen",
        regionCount: 0,
        isPreviewable: false,
        hasCtaAnchors: false,
      },
    },
  });

  assert.equal(generatedSurfaceProofSchema.status, "needs-attention");
  assert.equal(generatedSurfaceProofSchema.summary.failedCheckCount >= 3, true);
  assert.equal(generatedSurfaceProofSchema.summary.validationStatus, "invalid");
});
