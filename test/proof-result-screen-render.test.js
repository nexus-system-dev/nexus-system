import test from "node:test";
import assert from "node:assert/strict";

import { renderProofResultScreen } from "../web/nexus-ui/screens/ProofResultScreen.js";

test("proof result screen renders product-facing readiness card without orchestration-first handoff UI", () => {
  const html = renderProofResultScreen({
    showQaNav: false,
    badge: "QA preview override",
    title: "זה מה שנבנה עד עכשיו",
    subtitle: "כאן רואים את התוצר שנבנה עבורך, ולמה הוא כבר מוכן לצעד הבא.",
    projectName: "Gift Wallet",
    previewLabel: "תצוגת המוצר",
    readyTitle: "Gift Wallet מוכן לבדיקה",
    readySubtitle: "התצוגה הזו כבר מוכנה לבדיקה ולהמשך.",
    previewTitle: "Gift Wallet",
    previewMeta: "תצוגת הוכחה פעילה",
    whyThisCounts: "אפשר כבר לראות תוצר מוחשי שאפשר לבדוק ולהמשיך ממנו.",
    artifact: {
      title: "Gift Wallet",
      previewKind: "product preview",
      status: "ready",
      shell: { kind: "browser-window" },
      actions: { open: { supported: true }, download: { supported: true } },
    },
    artifactSupportLine: "תוצר שמחזיק גם package path וגם release target",
    artifactDisplayStatus: "מוכן",
    successCriteria: [
      { title: "יש surface שאפשר לבדוק בפועל", body: "המסך פתוח ונבדק", passed: true },
    ],
    artifacts: [
      { type: "משטח התצוגה", name: "Gift Wallet", description: "התוצר הנוכחי", meta: "תצוגת מוצר פעילה" },
    ],
    stats: [
      { label: "ביקורים", value: "128" },
      { label: "הרשמות", value: "23" },
    ],
    releaseEvidenceHandoff: {
      handoffStatusLabel: "handoff בהכנה",
      explainableReleasePath: "live-browser-preview -> web-build -> web-deployment",
      builtSurfaceTitle: "Gift Wallet",
      wrappedArtifactType: "deployable-web-bundle",
      packagePath: "web-build -> web-deployment",
      previewPath: "live-browser-preview -> live-browser-preview",
      releaseTarget: "web-deployment",
      nextAction: "complete-release-handoff",
      narrative: "ה־release path מוסבר מתוך התוצר, ה־package, והצעד הבא.",
      evidenceItems: [
        { label: "What was built", value: "Gift Wallet" },
        { label: "Release target", value: "web-deployment" },
      ],
      visibleChecks: [
        { checkId: "build-surface-visible", status: "passed", reason: "surface is visible" },
        { checkId: "release-handoff", status: "failed", reason: "handoff missing" },
      ],
      blockers: ["handoff missing"],
      handoffSteps: ["open the product surface", "package for release", "continue to confirmation"],
      persistenceRule: "release evidence must survive revisit and restore",
    },
    secondaryActions: [
      { label: "פתח את התוצר", target: "proof-open", supported: true },
      { label: "הורד את התוצר", target: "proof-download", supported: true },
    ],
    primaryAction: { label: "המשך לאישור", target: "confirmation" },
  });

  assert.match(html, /מה צריך לפני שיתוף/);
  assert.match(html, /המשך מסודר בהכנה/);
  assert.match(html, /complete-release-המשך מסודר/);
  assert.match(html, /המשך מסודר missing/);
  assert.doesNotMatch(html, /Release evidence and handoff/);
  assert.doesNotMatch(html, /Handoff step/);
  assert.doesNotMatch(html, /Open blocker/);
  assert.doesNotMatch(html, /build-surface-visible/);
  assert.doesNotMatch(html, /live-browser-preview -&gt; web-build -&gt; web-deployment|live-browser-preview -> web-build -> web-deployment/);
});
