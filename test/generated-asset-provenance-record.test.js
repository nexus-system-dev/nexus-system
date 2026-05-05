import test from "node:test";
import assert from "node:assert/strict";

import { createGeneratedAssetProvenanceRecord } from "../src/core/generated-asset-provenance-record.js";

test("generated asset provenance record links service result, proposal, and review handoff", () => {
  const { generatedAssetProvenanceRecord } = createGeneratedAssetProvenanceRecord({
    aiDesignServiceResult: {
      serviceResultId: "ai-design-service:proposal-1",
      aiDesignRequest: {
        requestId: "ai-design-request:proposal-1",
        selectedTask: {
          id: "task-release-review",
          summary: "Generate a release review surface",
        },
      },
      aiDesignProviderResult: {
        providerResultId: "ai-design-provider-result:proposal-1",
        providerId: "canonical-local-provider",
      },
    },
    renderableDesignProposal: {
      proposalId: "ai-design-proposal:proposal-1",
      regions: [{ slot: "hero" }, { slot: "timeline" }],
    },
    designProposalReviewState: {
      reviewStateId: "design-proposal-review:proposal-1",
      status: "ready-for-review",
      summary: {
        changedRegionCount: 1,
      },
    },
  });

  assert.equal(generatedAssetProvenanceRecord.status, "ready");
  assert.equal(generatedAssetProvenanceRecord.summary.hasCanonicalLineage, true);
  assert.equal(generatedAssetProvenanceRecord.summary.assetCount, 2);
  assert.equal(generatedAssetProvenanceRecord.evidence.selectedTaskId, "task-release-review");
  assert.deepEqual(generatedAssetProvenanceRecord.evidence.regionSlots, ["hero", "timeline"]);
});

test("generated asset provenance record stays incomplete when lineage inputs are missing", () => {
  const { generatedAssetProvenanceRecord } = createGeneratedAssetProvenanceRecord({
    aiDesignServiceResult: null,
    renderableDesignProposal: {
      proposalId: "ai-design-proposal:proposal-2",
      regions: [],
    },
    designProposalReviewState: {
      reviewStateId: null,
      status: "blocked",
      summary: {
        changedRegionCount: 0,
      },
    },
  });

  assert.equal(generatedAssetProvenanceRecord.status, "incomplete");
  assert.equal(generatedAssetProvenanceRecord.summary.hasCanonicalLineage, false);
  assert.equal(generatedAssetProvenanceRecord.summary.assetCount, 0);
});
