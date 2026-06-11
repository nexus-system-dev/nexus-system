import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeUserDesignSourceInput,
  resolveDesignPluginForVisualSkeletonRequest,
  assertDesignPluginSelectionPreservesProductTruth,
} from "../src/core/design-plugin-registry-contract.js";

function leadManagementSkeleton() {
  return {
    productType: "כלי פנימי לניהול לידים",
    primaryUser: "בעל עסק קטן שמקבל לידים מוואטסאפ ושיחות",
    primaryProblem: "לידים נופלים כי אין אחראי ואין תזכורת",
    firstWorkflow: {
      title: "טיפול בליד ראשון",
      whyThisFirst: "צריך לראות מי חייב חזרה היום.",
      steps: ["הוספת ליד", "שיוך אחראי", "תזכורת"],
    },
    initialScreens: [{ name: "מסך לידים", purpose: "רשימת לידים עם אחראי ותזכורת" }],
    initialActions: ["הוסף ליד", "קבע תזכורת"],
    dataObjects: [{ name: "ליד", fields: ["שם", "סטטוס", "אחראי", "תזכורת"] }],
    versionOneBoundary: { buildNow: ["לידים"], doNotBuildNow: ["חיבור וואטסאפ"] },
  };
}

test("DESIGN-PLUG-003 — lightweight user style preference can override recommended plugin", () => {
  const skeleton = leadManagementSkeleton();
  const recommended = resolveDesignPluginForVisualSkeletonRequest({
    productSkeletonAgentOutput: skeleton,
  });
  const preferred = resolveDesignPluginForVisualSkeletonRequest({
    productSkeletonAgentOutput: skeleton,
    designSourceInput: {
      stylePreference: "תעשה את המוצר יוקרתי ומותגי, כמו מתנת פרימיום.",
    },
  });

  assert.equal(recommended.selection.pluginId, "israeli-smb");
  assert.equal(preferred.selection.pluginId, "premium-brand");
  assert.equal(preferred.selection.matchedBy, "user-design-source");
  assert.notDeepEqual(recommended.plugin.visualRules.colors, preferred.plugin.visualRules.colors);
});

test("DESIGN-PLUG-003 — design preference changes look and feel without changing product truth", () => {
  const skeleton = leadManagementSkeleton();
  const preferred = resolveDesignPluginForVisualSkeletonRequest({
    productSkeletonAgentOutput: skeleton,
    designSourceInput: {
      stylePreference: "נקי, פשוט, רציני, אבל עדיין בעברית.",
      inspirationReference: "מערכת תפעול שקטה ולא דשבורד עמוס.",
    },
  });
  const preservation = assertDesignPluginSelectionPreservesProductTruth(preferred, skeleton);

  assert.equal(preferred.designSource.truthBoundary.canMutateProductSkeleton, false);
  assert.equal(preferred.designSource.truthBoundary.canReplaceProductGraph, false);
  assert.equal(preferred.designSource.truthBoundary.canCreateProductScope, false);
  assert.equal(preservation.ok, true);
  assert.deepEqual(preservation.actual.initialActions, skeleton.initialActions);
  assert.deepEqual(preservation.actual.versionOneBoundary, skeleton.versionOneBoundary);
});

test("DESIGN-PLUG-003 — Figma and brand kit are bounded design sources, not required product truth", () => {
  const source = normalizeUserDesignSourceInput({
    figmaConnection: { fileKey: "figma-test-file", name: "Lead Tool Direction" },
    brandKit: { name: "Local Service Brand", colors: ["#17634E"], fonts: ["Hebrew UI"], logo: true },
  });

  assert.equal(source.taskId, "DESIGN-PLUG-003");
  assert.equal(source.status, "design-source-present");
  assert.equal(source.figma.status, "bounded-design-source");
  assert.equal(source.figma.requiredForFirstSkeleton, false);
  assert.equal(source.figma.mayProvideProductTruth, false);
  assert.equal(source.brandKit.mayProvideProductTruth, false);
  assert.equal(source.truthBoundary.canInfluenceLookAndFeel, true);
  assert.equal(source.truthBoundary.canMutateProductSkeleton, false);
});

