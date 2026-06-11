import test from "node:test";
import assert from "node:assert/strict";

import {
  createDesignPluginRegistryContract,
  resolveDesignPluginForVisualSkeletonRequest,
  assertDesignPluginSelectionPreservesProductTruth,
} from "../src/core/design-plugin-registry-contract.js";

function leadProductSkeleton() {
  return {
    agentId: "product-skeleton-agent",
    productType: "כלי פנימי לניהול לידים",
    primaryUser: "בעל עסק קטן שמקבל לידים מוואטסאפ ושיחות",
    primaryProblem: "לידים נופלים כי אין אחראי ואין תזכורת",
    firstWorkflow: {
      title: "טיפול בליד ראשון",
      whyThisFirst: "זו הזרימה שמוכיחה שהמוצר עוזר לפני אוטומציות.",
      steps: ["הוספת ליד", "שיוך אחראי", "קביעת תזכורת"],
    },
    initialScreens: [{ name: "מסך לידים", purpose: "ניהול סטטוס, אחראי ותזכורת" }],
    initialActions: ["הוסף ליד", "קבע תזכורת", "סמן צעד הבא"],
    dataObjects: [{ name: "ליד", fields: ["שם", "סטטוס", "אחראי", "תזכורת"] }],
    versionOneBoundary: {
      buildNow: ["רשימת לידים", "סטטוס", "אחראי", "תזכורת"],
      doNotBuildNow: ["חיבור וואטסאפ אמיתי", "אוטומציות"],
    },
    handoffToVisualSkeleton: { allowed: true, reason: "השלד מוכן לתצוגה ראשונה." },
  };
}

test("DESIGN-PLUG-001 — registry contract exists as an internal V1 registry, not a marketplace", () => {
  const contract = createDesignPluginRegistryContract();

  assert.equal(contract.taskId, "DESIGN-PLUG-001");
  assert.equal(contract.registryMode, "internal-v1-not-marketplace");
  assert.equal(contract.truthBoundary.mayMutateProductTruth, false);
  assert.ok(contract.plugins.length >= 1);
  assert.ok(contract.prohibitions.includes("no-marketplace-in-v1"));
  assert.ok(contract.requiredPluginOutputSchema.colors);
  assert.ok(contract.requiredPluginOutputSchema.rtlSupport);
});

test("DESIGN-PLUG-001 — visual skeleton request resolves plugin by product type", () => {
  const skeleton = leadProductSkeleton();
  const envelope = resolveDesignPluginForVisualSkeletonRequest({
    productSkeletonAgentOutput: skeleton,
  });

  assert.equal(envelope.taskId, "DESIGN-PLUG-001");
  assert.equal(envelope.registryMode, "internal-v1-not-marketplace");
  assert.equal(envelope.selection.pluginId, "israeli-smb");
  assert.equal(envelope.productTruthBoundary.canMutateProductSkeleton, false);
  assert.equal(envelope.handoffToVisualProductSkeletonAgent.carriesSelectedDesignPlugin, true);
});

test("DESIGN-PLUG-001 — explicit user preference can select a plugin without changing product truth", () => {
  const skeleton = leadProductSkeleton();
  const envelope = resolveDesignPluginForVisualSkeletonRequest({
    productSkeletonAgentOutput: skeleton,
    userDesignPreference: "תעשה את זה יוקרתי ומותגי",
  });
  const preservation = assertDesignPluginSelectionPreservesProductTruth(envelope, skeleton);

  assert.equal(envelope.selection.pluginId, "premium-brand");
  assert.equal(envelope.selection.matchedBy, "user-design-source");
  assert.equal(preservation.ok, true);
  assert.deepEqual(preservation.actual.versionOneBoundary, skeleton.versionOneBoundary);
  assert.deepEqual(preservation.actual.initialScreens, skeleton.initialScreens);
});

test("DESIGN-PLUG-001 — explicit plugin id is bounded to registry and cannot replace Product Graph truth", () => {
  const skeleton = leadProductSkeleton();
  const envelope = resolveDesignPluginForVisualSkeletonRequest({
    productSkeletonAgentOutput: skeleton,
    explicitPluginId: "internal-tool",
  });
  const preservation = assertDesignPluginSelectionPreservesProductTruth(envelope, skeleton);

  assert.equal(envelope.selection.pluginId, "internal-tool");
  assert.equal(envelope.selection.matchedBy, "explicit-plugin-id");
  assert.equal(envelope.productTruthBoundary.canReplaceProductGraph, false);
  assert.equal(preservation.ok, true);
});
