import test from "node:test";
import assert from "node:assert/strict";

import {
  getBuiltInDesignPluginDefinitions,
  resolveDesignPluginForVisualSkeletonRequest,
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

function premiumGiftsSkeleton() {
  return {
    productType: "מותג מתנות רקמה יוקרתי",
    primaryUser: "לקוחה שרוצה לקנות מתנה אישית ומרגשת",
    primaryProblem: "קשה לבחור מתנה שנראית אישית ולא גנרית",
    firstWorkflow: {
      title: "בחירת מתנה מותאמת אישית",
      whyThisFirst: "זה מוכיח את הערך של התאמה אישית לפני סליקה או מלאי מתקדם.",
      steps: ["בחירת מוצר", "בחירת רקמה", "אישור עיצוב"],
    },
    initialScreens: [{ name: "מסך מתנות", purpose: "להציג מוצרים אישיים ותחושת מותג" }],
    initialActions: ["בחר מתנה", "אשר רקמה"],
    dataObjects: [{ name: "מתנה", fields: ["שם", "חומר", "צבע", "רקמה"] }],
    versionOneBoundary: { buildNow: ["קטלוג קטן", "בחירת רקמה"], doNotBuildNow: ["תשלום אמיתי"] },
  };
}

test("DESIGN-PLUG-002 — all required V1 built-in plugins have visual rules", () => {
  const definitions = getBuiltInDesignPluginDefinitions();
  const pluginIds = definitions.plugins.map((plugin) => plugin.id);

  assert.equal(definitions.taskId, "DESIGN-PLUG-002");
  assert.deepEqual(pluginIds, definitions.requiredV1PluginIds);
  for (const plugin of definitions.plugins) {
    assert.ok(plugin.visualRules.styleName, `${plugin.id} must define a style name`);
    assert.ok(plugin.visualRules.colors.primary, `${plugin.id} must define a primary color`);
    assert.ok(plugin.visualRules.typography.heading, `${plugin.id} must define heading typography`);
    assert.ok(plugin.visualRules.spacing.scale, `${plugin.id} must define spacing`);
    assert.ok(plugin.visualRules.cardShape.radius, `${plugin.id} must define card shape`);
    assert.ok(plugin.visualRules.buttonShape.radius, `${plugin.id} must define button shape`);
    assert.equal(plugin.visualRules.rtlSupport.supported, true, `${plugin.id} must support RTL`);
    assert.ok(plugin.visualRules.sampleRegions.length > 0, `${plugin.id} must define sample regions`);
  }
});

test("DESIGN-PLUG-002 — lead-management and premium-gifts resolve to different plugins and visual rules", () => {
  const lead = resolveDesignPluginForVisualSkeletonRequest({
    productSkeletonAgentOutput: leadManagementSkeleton(),
  });
  const gift = resolveDesignPluginForVisualSkeletonRequest({
    productSkeletonAgentOutput: premiumGiftsSkeleton(),
  });

  assert.equal(lead.selection.pluginId, "israeli-smb");
  assert.equal(gift.selection.pluginId, "premium-brand");
  assert.notEqual(lead.selection.pluginId, gift.selection.pluginId);
  assert.notDeepEqual(lead.plugin.visualRules.colors, gift.plugin.visualRules.colors);
  assert.notDeepEqual(lead.plugin.visualRules.sampleRegions, gift.plugin.visualRules.sampleRegions);
});

test("DESIGN-PLUG-002 — generic dashboard is not the default fallback", () => {
  const unknown = resolveDesignPluginForVisualSkeletonRequest({
    productSkeletonAgentOutput: {
      productType: "מוצר לא מסווג",
      primaryUser: "משתמש",
      primaryProblem: "בעיה לא ברורה",
      firstWorkflow: { title: "פעולה ראשונה", steps: ["בדיקה"] },
      initialScreens: [],
      initialActions: [],
      dataObjects: [],
    },
  });

  assert.equal(unknown.selection.pluginId, "minimal-saas");
  assert.equal(unknown.selection.matchedBy, "bounded-default");
  assert.equal(unknown.plugin.visualRules.dashboardDefault, false);
  assert.ok(
    unknown.plugin.visualRules.antiGenericDesignRules.some((rule) => rule.toLowerCase().includes("dashboard")),
  );
});

