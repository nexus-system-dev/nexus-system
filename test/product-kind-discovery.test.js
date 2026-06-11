import test from "node:test";
import assert from "node:assert/strict";

import { resolveProductKindDiscovery } from "../web/shared/product-kind-discovery.js";
import { buildRuntimeSkeletonTruthEnvelope } from "../web/shared/runtime-skeleton-truth.js";
import { createProductPatternLearningDecision } from "../web/shared/product-pattern-learning-intelligence.js";

test("PRODUCT-KIND-001 — game ideas resolve to a game loop before skeleton selection", () => {
  const runtime = buildRuntimeSkeletonTruthEnvelope({
    project: {
      id: "kind-game-maze",
      name: "מבוך מספרים",
      goal: "משחק פאזל עם שחקן, ניקוד, שלבים ומבוך שאפשר לזוז בו",
      productSkeletonAgentOutput: {
        productType: "משהו אינטראקטיבי",
        primaryProblem: "השחקן צריך לפתור מבוך עם ניקוד וזמן",
        firstWorkflow: { title: "מבוך מספרים", steps: ["התחל משחק", "זוז", "אסוף ניקוד"] },
        initialActions: ["התחל משחק", "זוז", "אסוף"],
        dataObjects: [{ name: "GameState", fields: ["score", "level", "player"] }],
      },
    },
  });

  assert.equal(runtime.productKindTaskId, "PRODUCT-KIND-001");
  assert.equal(runtime.productPattern, "game-loop");
  assert.equal(runtime.productClass, "game");
  assert.equal(runtime.shellFamily, "playable-preview");
  assert.equal(runtime.productDomainSkeleton.domainKind, "game-state-rules-local-state");
  assert.equal(runtime.productKindNeedsClarification, false);
});

test("PRODUCT-KIND-001 — editor ideas resolve to canvas/editor skeletons instead of generic tools", () => {
  const runtime = buildRuntimeSkeletonTruthEnvelope({
    project: {
      id: "kind-editor-canvas",
      name: "עורך תמונות מהיר",
      goal: "כלי עריכה עם קנבס, שכבות, אובייקט נבחר, סרגל כלים ובטל חזור",
      productSkeletonAgentOutput: {
        productType: "כלי מוזר",
        primaryProblem: "צריך לערוך אובייקטים על קנבס",
        firstWorkflow: { title: "עורך תמונות", steps: ["בחר אובייקט", "שנה צבע", "בטל"] },
        initialActions: ["בחר", "הוסף צורה", "בטל"],
      },
    },
  });

  assert.equal(runtime.productPattern, "editor-canvas");
  assert.equal(runtime.productClass, "software-tool");
  assert.equal(runtime.shellFamily, "editor-canvas-shell");
  assert.equal(runtime.productKindSkeletonSelection.shellFamily, "editor-canvas-shell");
  assert.equal(runtime.productDomainSkeleton.domainKind, "editor-document-local-state");
  assert.ok(runtime.productDomainSkeleton.operations.some((operation) => operation.id === "editor.addObject"));
  assert.equal(runtime.professionalSkeletonQuality.status, "pass");
});

test("PRODUCT-KIND-001 — simulator ideas resolve to state, controls, metrics, and simulator domain", () => {
  const runtime = buildRuntimeSkeletonTruthEnvelope({
    project: {
      id: "kind-simulator",
      name: "סימולטור תמחור",
      goal: "סימולטור שמריץ תרחישים, משנה פרמטרים ומציג מדדים ותוצאה משתנה",
      productSkeletonAgentOutput: {
        productType: "כלי",
        primaryProblem: "צריך לבדוק מה קורה כשמשנים פרמטרים",
        firstWorkflow: { title: "סימולטור תמחור", steps: ["שנה פרמטר", "הרץ תרחיש", "ראה תוצאה"] },
        initialActions: ["הרץ תרחיש", "שנה פרמטר", "אפס"],
      },
    },
  });

  assert.equal(runtime.productPattern, "simulator-state");
  assert.equal(runtime.shellFamily, "simulator-control-shell");
  assert.equal(runtime.productDomainSkeleton.domainKind, "simulator-state-control-local-state");
  assert.ok(runtime.productDomainSkeleton.operations.some((operation) => operation.id === "simulator.runScenario"));
});

test("PRODUCT-KIND-001 — software tools resolve to input-action-output skeletons", () => {
  const runtime = buildRuntimeSkeletonTruthEnvelope({
    project: {
      id: "kind-tool-io",
      name: "ממיר קבצים",
      goal: "ממיר שמקבל קובץ או קלט, מריץ פעולה ומחזיר פלט להורדה",
      productSkeletonAgentOutput: {
        productType: "utility",
        primaryProblem: "צריך להמיר קלט לפלט",
        firstWorkflow: { title: "ממיר קבצים", steps: ["העלה", "הרץ", "קבל פלט"] },
        initialActions: ["הרץ פעולה", "נקה פלט"],
      },
    },
  });

  assert.equal(runtime.productPattern, "tool-io");
  assert.equal(runtime.productClass, "software-tool");
  assert.equal(runtime.shellFamily, "tool-control-shell");
  assert.equal(runtime.productDomainSkeleton.domainKind, "tool-operation-local-state");
});

test("PRODUCT-KIND-001 — unclear ideas ask decisive questions instead of selecting a generic skeleton", () => {
  const discovery = resolveProductKindDiscovery({
    productClass: "generic",
    texts: ["אני רוצה משהו חדשני ומדהים"],
  });

  assert.equal(discovery.status, "needs-clarification");
  assert.equal(discovery.needsClarification, true);
  assert.equal(discovery.skeletonSelection.shellFamily, "clarification-required");
  assert.equal(discovery.clarificationQuestions.length, 2);
});

test("LEARNING-PRODUCT-INTELLIGENCE-001 — learning can improve a weak future product-pattern decision", () => {
  const project = {
    id: "learning-kind-editor",
    name: "צורות ומסמכים",
    goal: "כלי לסידור צורות על משטח עבודה",
    runtimeLearningDecisionHints: {
      recommendedPatterns: [
        {
          patternId: "editor-canvas",
          productClass: "software-tool",
          skeletonFamily: "editor-canvas-shell",
          domainKind: "editor-document-local-state",
          confidence: 0.78,
          signalCount: 3,
          reason: "מוצרים דומים הצליחו רק כשהתחילו מקנבס, בחירה וכלי עריכה.",
        },
      ],
    },
    productSkeletonAgentOutput: {
      productType: "כלי עבודה",
      primaryProblem: "המשתמש צריך לסדר צורות ולראות שינוי על משטח",
      firstWorkflow: { title: "סידור צורות", steps: ["הוסף צורה", "בחר", "שנה"] },
      initialActions: ["הוסף צורה", "בחר"],
    },
  };
  const runtime = buildRuntimeSkeletonTruthEnvelope({ project });

  assert.equal(runtime.productPatternLearningDecision.taskId, "LEARNING-PRODUCT-INTELLIGENCE-001");
  assert.equal(runtime.productPatternLearningDecision.mustUseBeforeProductKindDecision, true);
  assert.equal(runtime.productPatternLearningDecision.mayOverwriteProjectTruth, false);
  assert.equal(runtime.productPatternLearningApplied, true);
  assert.equal(runtime.productPattern, "editor-canvas");
  assert.equal(runtime.shellFamily, "editor-canvas-shell");
  assert.equal(runtime.productKindDiscovery.learningDecision.applied, true);
});

test("LEARNING-PRODUCT-INTELLIGENCE-001 — learning cannot override an explicit product class", () => {
  const project = {
    id: "learning-kind-explicit-landing",
    name: "דף הרשמה",
    goal: "דף נחיתה להרשמה מוקדמת",
    artifactExpectation: { projectType: "landing page", title: "דף הרשמה" },
    runtimeLearningDecisionHints: {
      recommendedPatterns: [
        {
          patternId: "editor-canvas",
          productClass: "software-tool",
          skeletonFamily: "editor-canvas-shell",
          confidence: 0.95,
          signalCount: 10,
        },
      ],
    },
    productSkeletonAgentOutput: {
      productType: "landing page",
      firstWorkflow: { title: "דף הרשמה", steps: ["קרא", "השאר פרטים"] },
      initialActions: ["השאר פרטים"],
    },
  };
  const runtime = buildRuntimeSkeletonTruthEnvelope({ project });

  assert.equal(runtime.productPatternLearningDecision.mustUseBeforeProductKindDecision, true);
  assert.equal(runtime.productPatternLearningApplied, false);
  assert.equal(runtime.productPattern, "web-page-flow");
  assert.equal(runtime.productClass, "landing-page");
  assert.equal(runtime.shellFamily, "web-page-preview");
  assert.equal(runtime.productKindDiscovery.learningDecision.mayOverwriteProjectTruth, false);
});

test("LEARNING-PRODUCT-INTELLIGENCE-001 — decision envelope stays recommendation-only", () => {
  const decision = createProductPatternLearningDecision({
    project: {
      id: "learning-envelope",
      runtimeLearningDecisionHints: {
        recommendedPatterns: [{ patternId: "simulator-state", confidence: 0.8, signalCount: 2 }],
      },
    },
    texts: ["צריך להריץ תרחיש ולראות מדדים"],
  });

  assert.equal(decision.taskId, "LEARNING-PRODUCT-INTELLIGENCE-001");
  assert.equal(decision.status, "live");
  assert.equal(decision.mustUseBeforeAgentReply, true);
  assert.equal(decision.mustUseBeforeProductKindDecision, true);
  assert.equal(decision.mayOverwriteProjectTruth, false);
  assert.match(decision.truthBoundary, /does-not-overwrite-project-truth/);
  assert.equal(decision.strongestPattern.patternId, "simulator-state");
});
