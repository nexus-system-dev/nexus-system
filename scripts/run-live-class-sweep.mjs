import { chromium } from "playwright-core";
import fs from "node:fs/promises";
import path from "node:path";

const dayStamp = "2026-05-18";
const baseUrl = "http://127.0.0.1:4011/?cb=live-class-sweep";
const evidenceDir = path.resolve(
  `docs/operating-system/wave3-final-hardening/evidence/live-class-sweep/${dayStamp}`,
);
const runTimeoutMs = 90_000;

const runMatrix = [
  {
    intakePath: "create",
    productClass: "landing-page",
    slug: "create-landing-page",
    projectName: "Valentine Landing Sweep",
    vision:
      "Build a landing page and marketing site for a seasonal Valentine campaign. The product truth should feel like a landing page with a clear promise, trust, and one CTA.",
    answers: [
      "זוגות שמחפשים רעיון מתנה ולחיצה מהירה להזמנה לקמפיין ולנטיין.",
      "זה דף נחיתה שיווקי לקמפיין עונתי עם מסר חד, אמון וקריאה אחת לפעולה.",
      "הכאב הוא שמבקרים לא מבינים מהר את ההצעה, למה לסמוך עליה ומה לעשות עכשיו.",
      "פתרון טוב ייתן promise ברור, proof של אמון ו-CTA אחד שקל להבין וללחוץ עליו.",
    ],
    expectedMarkers: ["landing page", "דף נחיתה", "CTA", "אמון"],
  },
  {
    intakePath: "create",
    productClass: "mobile-app",
    slug: "create-mobile-app",
    projectName: "QuickPin Mobile Sweep",
    vision:
      "Create a mobile app flow for iOS and Android where the first screen and first action are immediately clear to the user.",
    answers: [
      "משתמשים שמנהלים משימות קצרות מהטלפון ורוצים פעולה ראשונה ברורה בלי הדרכה.",
      "זאת אפליקציה מובייל ל-iOS ו-Android עם מסך ראשון ברור וזרימה פשוטה לפעולה הראשונה.",
      "הכאב הוא שמשתמשים לא מבינים מיד מה לעשות במסך הראשון ואיפה מתחילים.",
      "פתרון טוב ייתן מסך ראשון חד, פעולה ראשונה ברורה והמשך זרימה ניידת שקל להבין.",
    ],
    expectedMarkers: ["mobile flow", "אפליקציה", "מסך ראשון", "מובייל"],
  },
  {
    intakePath: "create",
    productClass: "internal-tool",
    slug: "create-internal-tool",
    projectName: "Ops Workspace Sweep",
    vision:
      "Create an internal tool workspace for an operations team. The product truth should show queue ownership, SLA, and the next action clearly.",
    answers: [
      "צוות תפעול פנימי שמטפל בבקשות, תורים ואישורים בכל יום.",
      "זה internal tool ו-workspace פנימי לניהול queue, owner, approvals ו-SLA.",
      "הכאב הוא שאין בעלות ברורה, אין סדר בתור העבודה וקשה לדעת מה הפעולה הבאה.",
      "פתרון טוב ייתן תור עבודה ברור, owner גלוי ופעולה הבאה שכל נציג מבין מיד.",
    ],
    expectedMarkers: ["workspace", "כלי פנימי", "SLA", "בעלות"],
  },
  {
    intakePath: "create",
    productClass: "commerce-ops",
    slug: "create-commerce-ops",
    projectName: "Commerce Desk Sweep",
    vision:
      "Create a commerce operations workspace for ecommerce catalog, orders, inventory, and merchandising. The loop should feel like operational commerce truth.",
    answers: [
      "צוות המסחר והתפעול שמנהל הזמנות, קטלוג, מלאי ומבצעים כל יום.",
      "זאת מערכת ecommerce תפעולית עם הזמנות, קטלוג, מלאי ומשימות מסחר שוטפות.",
      "הכאב הוא שאין מקום אחד ברור לטפל בהזמנות דחופות, חריגות קטלוג ומלאי.",
      "פתרון טוב ייתן תור הזמנות ברור, מצב קטלוג גלוי ופעולת מסחר אחת שיודעים לבצע מיד.",
    ],
    expectedMarkers: ["commerce workspace", "מסחר", "הזמנות דחופות", "קטלוג"],
  },
  {
    intakePath: "upload-from-local-machine",
    productClass: "landing-page",
    slug: "upload-landing-page",
    projectName: "Valentine Upload Sweep",
    vision:
      "Imported existing local landing page project. Use the uploaded local website evidence to drive a real landing-page understanding and downstream loop.",
    files: [
      "/Users/yogevlavian/Desktop/valentine-site/index.html",
      "/Users/yogevlavian/Desktop/valentine-site/yes.html",
    ],
    answers: [
      "זוגות שמחפשים דף נחיתה עונתי עם מסר רגשי והזמנה מהירה.",
      "זה דף נחיתה שיווקי קיים עם מסר, CTA ודפי קמפיין.",
      "הכאב הוא שהמסר והפעולה לא מספיק ברורים, ולכן ההמרה נחלשת.",
      "פתרון טוב ייתן promise ברור, proof רגשי וקריאה אחת לפעולה שאי אפשר לפספס.",
    ],
    expectedMarkers: ["landing page", "דף נחיתה", "CTA", "אמון"],
  },
  {
    intakePath: "upload-from-local-machine",
    productClass: "mobile-app",
    slug: "upload-mobile-app",
    projectName: "QuickPin Upload Sweep",
    vision:
      "Imported existing local React Native mobile app. Use the uploaded mobile evidence to drive an app-specific understanding and downstream loop.",
    files: [
      "/Users/yogevlavian/Desktop/Apps/QuickPin/README.md",
      "/Users/yogevlavian/Desktop/Apps/QuickPin/package.json",
      "/Users/yogevlavian/Desktop/Apps/QuickPin/App.tsx",
    ],
    answers: [
      "משתמשי מובייל שרוצים פעולה קצרה וברורה מהטלפון בלי תהליך כבד.",
      "זאת אפליקציה React Native קיימת עם מסכים ופעולות ל-iOS ו-Android.",
      "הכאב הוא שהזרימה הראשונה לא ברורה והמשתמש לא מבין מהר מה הצעד הראשון.",
      "פתרון טוב ייתן מסך ראשון ברור, פעולה ראשונה מובנת והמשך זרימה ניידת רציף.",
    ],
    expectedMarkers: ["mobile flow", "אפליקציה", "מסך ראשון", "מובייל"],
  },
  {
    intakePath: "upload-from-local-machine",
    productClass: "internal-tool",
    slug: "upload-internal-tool",
    projectName: "Nexus Upload Sweep",
    vision:
      "Imported existing internal-tool workspace. Use the uploaded repository evidence to drive an internal-tool understanding and downstream loop.",
    files: [
      "/Users/yogevlavian/Desktop/The Nexus/README.md",
      "/Users/yogevlavian/Desktop/The Nexus/package.json",
      "/Users/yogevlavian/Desktop/The Nexus/src/server.js",
      "/Users/yogevlavian/Desktop/The Nexus/docs/wave3-canonical-state.json",
    ],
    answers: [
      "צוות המוצר והאופרציה שמחזיק workspace פנימי ומשימות חיות בכל יום.",
      "זה internal tool ו-workspace לניהול onboarding, loop, proof, approvals ו-SLA.",
      "הכאב הוא שאין מספיק בהירות על תור העבודה, בעלות וחסמים פתוחים.",
      "פתרון טוב ייתן queue ברור, owner גלוי, SLA והפעולה הבאה שכל נציג מבין מיד.",
    ],
    expectedMarkers: ["workspace", "כלי פנימי", "SLA", "בעלות"],
  },
  {
    intakePath: "upload-from-local-machine",
    productClass: "commerce-ops",
    slug: "upload-commerce-ops",
    projectName: "Milan Upload Sweep",
    vision:
      "Imported existing ecommerce operations project. Use the uploaded repository evidence to drive commerce understanding and the downstream loop from the actual material.",
    files: [
      "/Users/yogevlavian/Desktop/milan.co/README.md",
      "/Users/yogevlavian/Desktop/milan.co/package.json",
      "/Users/yogevlavian/Desktop/milan.co/tsconfig.json",
      "/Users/yogevlavian/Desktop/milan.co/src/middleware.ts",
    ],
    answers: [
      "צוות המסחר והתפעול שמנהל קטלוג, הזמנות ותוכן בכל יום.",
      "זה מוצר ecommerce פעיל עם קטלוג, מלאי, הזמנות והרשאות ניהול.",
      "הכאב הוא שמעבר לא ברור בין הזמנות, קטלוג ותפעול יומי יוצר עיכובים וטעויות.",
      "פתרון טוב ייתן תור הזמנות ברור, חריגות קטלוג גלויות ופעולה אחת ברורה להמשך.",
    ],
    expectedMarkers: ["commerce workspace", "מסחר", "הזמנות דחופות", "קטלוג"],
  },
];

const reportPath = path.join(evidenceDir, "live-class-sweep-report.json");

function nowId() {
  return String(Date.now()).slice(-8);
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

async function ensureEvidenceDir() {
  await fs.mkdir(evidenceDir, { recursive: true });
}

async function writeReport(results) {
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
}

async function screenshot(page, name) {
  const filePath = path.join(evidenceDir, name);
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}

async function visibleText(page) {
  return page.locator("body").innerText();
}

async function maybeClick(page, labels) {
  for (const label of labels) {
    const locator = page.getByRole("button", { name: label, exact: false });
    if ((await locator.count()) > 0 && (await locator.first().isVisible())) {
      await locator.first().click();
      return label;
    }
  }
  return null;
}

async function waitForAnyText(page, labels, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  let lastText = "";
  while (Date.now() < deadline) {
    const text = await visibleText(page);
    lastText = text;
    const found = labels.find((label) => text.includes(label));
    if (found) {
      return found;
    }
    await page.waitForTimeout(250);
  }
  throw new Error(
    `Timed out waiting for any of: ${labels.join(", ")}\nLast text excerpt:\n${lastText.slice(0, 2500)}`,
  );
}

async function answerOnboarding(page, answers) {
  const usedQuestions = [];
  for (const answer of answers) {
    const body = await visibleText(page);
    if (body.includes("Project Create") || page.url().includes("/proof")) {
      break;
    }

    const textarea = page.locator("textarea:visible").first();
    const input = page.locator('input[type="text"]:visible, input:not([type]):visible').first();
    const currentQuestion = body
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.includes("?"));
    if (currentQuestion) {
      usedQuestions.push(currentQuestion);
    }

    if ((await textarea.count()) > 0) {
      await textarea.fill(answer);
    } else if ((await input.count()) > 0) {
      await input.fill(answer);
    } else {
      break;
    }

    const clicked = await maybeClick(page, [
      "הבא",
      "קדימה",
      "המשך ←",
      "המשך לסיכום",
      "נכון - המשך",
      "סיים Onboarding",
      "Continue onboarding",
      "נכון, בוא נתקדם",
    ]);
    if (!clicked) {
      break;
    }
    await page.waitForTimeout(900);
  }
  return usedQuestions;
}

async function captureStage(page, stage, slug) {
  await page.waitForTimeout(800);
  const url = page.url();
  const screen = await page.locator("body").getAttribute("data-app-screen");
  const text = await visibleText(page);
  const shot = await screenshot(page, `${slug}-${stage}.png`);
  return { stage, url, screen, text, shot };
}

async function moveAndCapture(page, slug) {
  const captures = [];

  if ((await page.locator("#onboarding-forward-button").count()) > 0) {
    await page.locator("#onboarding-forward-button").click();
    await page.waitForTimeout(1000);
  }

  const understandingContinue = page.getByRole("button", { name: /נכון/ }).last();
  if ((await understandingContinue.count()) > 0 && (await understandingContinue.isVisible())) {
    await understandingContinue.click();
    await page.waitForTimeout(2500);
  }

  captures.push(await captureStage(page, "loop", slug));

  const loopProofButton = page.locator("#loop-secondary-action-button").first();
  if ((await loopProofButton.count()) > 0 && (await loopProofButton.isVisible())) {
    await loopProofButton.click();
    captures.push(await captureStage(page, "proof", slug));
  }

  const proofArtifactButton = page.locator("#proof-open-button").first();
  if ((await proofArtifactButton.count()) > 0 && (await proofArtifactButton.isVisible())) {
    await proofArtifactButton.click();
    captures.push(await captureStage(page, "artifact", slug));
  }

  const artifactContinueButton = page.locator("#artifact-continue-button").first();
  if ((await artifactContinueButton.count()) > 0 && (await artifactContinueButton.isVisible())) {
    await artifactContinueButton.click();
    captures.push(await captureStage(page, "confirmation", slug));
  }

  const confirmationApproveButton = page.locator("#confirmation-approve-button").first();
  if ((await confirmationApproveButton.count()) > 0 && (await confirmationApproveButton.isVisible())) {
    await confirmationApproveButton.click();
    captures.push(await captureStage(page, "state-update", slug));
  }

  const timelineHistoryButton = page.locator("#state-update-history-button").first();
  if ((await timelineHistoryButton.count()) > 0 && (await timelineHistoryButton.isVisible())) {
    await timelineHistoryButton.click();
    captures.push(await captureStage(page, "timeline", slug));
  }

  return captures;
}

function buildFailureId({ productClass, intakePath, liveStep, index }) {
  return `W3-LCS-${productClass}-${intakePath}-${liveStep}-${String(index).padStart(3, "0")}`;
}

function expectedTruthForStep(run, liveStep) {
  if (liveStep === "Create") {
    return `Create should visibly carry ${run.projectName} into onboarding without fallback or dead-end behavior.`;
  }
  if (liveStep === "Understanding") {
    return `${run.productClass} understanding should reflect the class-specific framing rather than generic product copy.`;
  }
  if (liveStep === "Loop") {
    return `${run.productClass} loop should show class-specific next action and preserved project identity.`;
  }
  if (liveStep === "Proof") {
    return `${run.productClass} proof should feel like a class-specific visible product surface.`;
  }
  if (liveStep === "Artifact") {
    return `${run.productClass} artifact should remain reachable and preserve the same class truth.`;
  }
  if (liveStep === "Timeline") {
    return `${run.productClass} timeline should preserve project identity and class-specific downstream progression.`;
  }
  if (liveStep === "Route") {
    return "Routes should progress visibly and truthfully through the downstream chain.";
  }
  if (liveStep === "Restore") {
    return "Refresh should reopen the same route truth without fallback regression.";
  }
  return "The same project truth should survive across the downstream loop.";
}

function classifyFailures(run, firstStage, onboardingText, captures, restoreCapture) {
  const failures = [];
  let index = 1;

  const timeline = captures.find((item) => item.stage === "timeline");
  const loop = captures.find((item) => item.stage === "loop");
  const proof = captures.find((item) => item.stage === "proof");
  const artifact = captures.find((item) => item.stage === "artifact");

  if (!firstStage.includes("onboarding")) {
    failures.push({
      liveStep: "Create",
      failurePhase: "entry",
      route: "/",
      visibleFailure: "Create did not carry the user into onboarding.",
      expectedTruth: expectedTruthForStep(run, "Create"),
      actualTruth: firstStage,
      blockerType: "runtime-truth",
      severity: "critical",
      reproducibility: "always",
      userVisible: "yes",
      restoreImpact: "none",
      continuityImpact: "major",
      owningLane: "W3-LIVE-CLASS-SWEEP",
      suggestedNextTask: "Repair create handoff into onboarding for this class path.",
      promotionDecision: "stay-in-current-task",
      rerunStatus: "not-rerun",
      evidencePath: path.relative(process.cwd(), captures[0]?.shot ?? ""),
      canonicalState: "in-progress",
    });
  }

  const understandingBlob = `${onboardingText}\n${loop?.text ?? ""}`;
  if (!run.expectedMarkers.some((marker) => understandingBlob.includes(marker))) {
    failures.push({
      liveStep: "Understanding",
      failurePhase: "handoff",
      route: "/onboarding",
      visibleFailure: "Understanding did not surface class-specific truth strongly enough.",
      expectedTruth: expectedTruthForStep(run, "Understanding"),
      actualTruth: understandingBlob.slice(0, 1000),
      blockerType: "comprehension-truth",
      severity: "high",
      reproducibility: "always",
      userVisible: "partial",
      restoreImpact: "none",
      continuityImpact: "major",
      owningLane: "W3-LIVE-CLASS-SWEEP",
      suggestedNextTask: "Strengthen class-specific understanding truth for this class path.",
      promotionDecision: "stay-in-current-task",
      rerunStatus: "not-rerun",
      evidencePath: path.relative(process.cwd(), captures[0]?.shot ?? ""),
      canonicalState: "in-progress",
    });
  }

  const expectedStages = ["loop", "proof", "artifact", "confirmation", "state-update", "timeline"];
  const stageNames = new Set(captures.map((item) => item.stage));
  for (const stage of expectedStages) {
    if (!stageNames.has(stage)) {
      failures.push({
        liveStep: stage === "confirmation" || stage === "state-update" ? "Route" : stage.charAt(0).toUpperCase() + stage.slice(1),
        failurePhase: "downstream",
        route: captures.at(-1)?.url ?? "/",
        visibleFailure: `The live path did not reach ${stage}.`,
        expectedTruth: stage === "confirmation" || stage === "state-update"
          ? "The downstream route should continue through confirmation and state update before timeline."
          : expectedTruthForStep(run, stage.charAt(0).toUpperCase() + stage.slice(1)),
        actualTruth: captures.map((item) => item.stage).join(" -> ") || "stalled",
        blockerType: "route-truth",
        severity: "critical",
        reproducibility: "always",
        userVisible: "yes",
        restoreImpact: "minor",
        continuityImpact: "major",
        owningLane: "W3-LIVE-CLASS-SWEEP",
        suggestedNextTask: `Restore truthful downstream progression into ${stage} for this class path.`,
        promotionDecision: "stay-in-current-task",
        rerunStatus: "not-rerun",
        evidencePath: path.relative(process.cwd(), captures.at(-1)?.shot ?? ""),
        canonicalState: "in-progress",
      });
      break;
    }
  }

  const downstreamBlob = captures.map((item) => item.text).join("\n");
  if (loop && !run.expectedMarkers.some((marker) => loop.text.includes(marker))) {
    failures.push({
      liveStep: "Loop",
      failurePhase: "downstream",
      route: loop.url,
      visibleFailure: "Loop did not show sufficiently class-specific next-step truth.",
      expectedTruth: expectedTruthForStep(run, "Loop"),
      actualTruth: loop.text.slice(0, 1200),
      blockerType: "loop-truth",
      severity: "high",
      reproducibility: "always",
      userVisible: "yes",
      restoreImpact: "minor",
      continuityImpact: "major",
      owningLane: "W3-LIVE-CLASS-SWEEP",
      suggestedNextTask: "Strengthen class-specific loop truth for this class path.",
      promotionDecision: "stay-in-current-task",
      rerunStatus: "not-rerun",
      evidencePath: path.relative(process.cwd(), loop.shot),
      canonicalState: "in-progress",
    });
  }

  if (proof && !run.expectedMarkers.some((marker) => proof.text.includes(marker))) {
    failures.push({
      liveStep: "Proof",
      failurePhase: "downstream",
      route: proof.url,
      visibleFailure: "Proof did not preserve sufficiently class-specific visible truth.",
      expectedTruth: expectedTruthForStep(run, "Proof"),
      actualTruth: proof.text.slice(0, 1200),
      blockerType: "proof-truth",
      severity: "high",
      reproducibility: "always",
      userVisible: "yes",
      restoreImpact: "minor",
      continuityImpact: "major",
      owningLane: "W3-LIVE-CLASS-SWEEP",
      suggestedNextTask: "Strengthen class-specific proof truth for this class path.",
      promotionDecision: "stay-in-current-task",
      rerunStatus: "not-rerun",
      evidencePath: path.relative(process.cwd(), proof.shot),
      canonicalState: "in-progress",
    });
  }

  if (artifact && !run.expectedMarkers.some((marker) => artifact.text.includes(marker))) {
    failures.push({
      liveStep: "Artifact",
      failurePhase: "downstream",
      route: artifact.url,
      visibleFailure: "Artifact did not preserve sufficiently class-specific visible truth.",
      expectedTruth: expectedTruthForStep(run, "Artifact"),
      actualTruth: artifact.text.slice(0, 1200),
      blockerType: "artifact-truth",
      severity: "high",
      reproducibility: "always",
      userVisible: "yes",
      restoreImpact: "minor",
      continuityImpact: "major",
      owningLane: "W3-LIVE-CLASS-SWEEP",
      suggestedNextTask: "Strengthen class-specific artifact truth for this class path.",
      promotionDecision: "stay-in-current-task",
      rerunStatus: "not-rerun",
      evidencePath: path.relative(process.cwd(), artifact.shot),
      canonicalState: "in-progress",
    });
  }

  if (timeline) {
    if (!timeline.url.includes("/timeline")) {
      failures.push({
        liveStep: "Route",
        failurePhase: "downstream",
        route: timeline.url,
        visibleFailure: "Final route was not /timeline.",
        expectedTruth: expectedTruthForStep(run, "Route"),
        actualTruth: timeline.url,
        blockerType: "route-truth",
        severity: "critical",
        reproducibility: "always",
        userVisible: "yes",
        restoreImpact: "major",
        continuityImpact: "major",
        owningLane: "W3-LIVE-CLASS-SWEEP",
        suggestedNextTask: "Repair final route truth into timeline for this class path.",
        promotionDecision: "stay-in-current-task",
        rerunStatus: "not-rerun",
        evidencePath: path.relative(process.cwd(), timeline.shot),
        canonicalState: "in-progress",
      });
    }
    if (!run.expectedMarkers.some((marker) => downstreamBlob.includes(marker))) {
      failures.push({
        liveStep: "Timeline",
        failurePhase: "downstream",
        route: timeline.url,
        visibleFailure: "Timeline did not preserve sufficiently class-specific downstream truth.",
        expectedTruth: expectedTruthForStep(run, "Timeline"),
        actualTruth: timeline.text.slice(0, 1400),
        blockerType: "timeline-truth",
        severity: "high",
        reproducibility: "always",
        userVisible: "yes",
        restoreImpact: "minor",
        continuityImpact: "major",
        owningLane: "W3-LIVE-CLASS-SWEEP",
        suggestedNextTask: "Strengthen class-specific timeline truth for this class path.",
        promotionDecision: "stay-in-current-task",
        rerunStatus: "not-rerun",
        evidencePath: path.relative(process.cwd(), timeline.shot),
        canonicalState: "in-progress",
      });
    }
  }

  if (restoreCapture) {
    if (!restoreCapture.url.includes("/timeline") || !run.expectedMarkers.some((marker) => restoreCapture.text.includes(marker))) {
      failures.push({
        liveStep: "Restore",
        failurePhase: "refresh",
        route: restoreCapture.url,
        visibleFailure: "Refresh did not reopen the same class-specific timeline truth.",
        expectedTruth: expectedTruthForStep(run, "Restore"),
        actualTruth: `${restoreCapture.url}\n${restoreCapture.text.slice(0, 1200)}`,
        blockerType: "restore-truth",
        severity: "high",
        reproducibility: "always",
        userVisible: "yes",
        restoreImpact: "major",
        continuityImpact: "major",
        owningLane: "W3-LIVE-CLASS-SWEEP",
        suggestedNextTask: "Repair restore truth for this class path.",
        promotionDecision: "stay-in-current-task",
        rerunStatus: "not-rerun",
        evidencePath: path.relative(process.cwd(), restoreCapture.shot),
        canonicalState: "in-progress",
      });
    }
  }

  return failures.map((failure) => ({
    failureId: buildFailureId({
      productClass: run.productClass,
      intakePath: run.intakePath,
      liveStep: failure.liveStep,
      index: index++,
    }),
    productClass: run.productClass,
    intakePath: run.intakePath,
    ...failure,
  }));
}

async function runSingle(page, run) {
  const uniqueName = `${run.projectName} ${nowId()}`;
  await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(2200);

  await page.locator("#create-project-name-input").fill(uniqueName);
  await page.locator("#create-project-vision-input").fill(run.vision);
  let uploadMeta = null;
  let uploadTitle = null;
  if (run.intakePath === "upload-from-local-machine") {
    await page.locator("#create-project-file-upload-input").setInputFiles(run.files);
    await page.waitForTimeout(500);
    uploadMeta = normalizeText(await page.locator("#create-project-file-picker-meta").innerText());
    uploadTitle = normalizeText(await page.locator("#create-project-file-picker-title").innerText());
  }

  const createShot = await screenshot(page, `${run.slug}-01-create.png`);
  await page.$eval("#create-project-button", (el) => el.click());
  await page.waitForTimeout(1200);

  const firstStage = await waitForAnyText(page, [
    "עברנו ל־onboarding של הפרויקט",
    "עברנו ל-onboarding של הפרויקט",
    "Onboarding דורש השלמה",
    "מה הדבר המרכזי שאתה בונה כאן",
    "לא הצלחנו לשלוח את התשובה כרגע",
    "מה נבנה עכשיו",
    "ניתחתי את השיחה שלנו",
  ]);

  const onboardingText = await visibleText(page);
  const onboardingShot = await screenshot(page, `${run.slug}-02-onboarding.png`);
  const usedQuestions = await answerOnboarding(page, run.answers);
  const captures = await moveAndCapture(page, run.slug);
  let restoreCapture = null;
  if (captures.find((item) => item.stage === "timeline")) {
    await page.reload({ waitUntil: "domcontentloaded", timeout: 20000 });
    restoreCapture = await captureStage(page, "restore", run.slug);
  }

  const failures = classifyFailures(run, firstStage, onboardingText, captures, restoreCapture);

  return {
    slug: run.slug,
    projectClass: run.productClass,
    intakePath: run.intakePath,
    projectName: uniqueName,
    uploadMeta,
    uploadTitle,
    firstStage,
    usedQuestions,
    createShot,
    onboardingShot,
    captures,
    restoreCapture,
    failures,
    passed: failures.length === 0,
  };
}

async function withRunTimeout(run, work) {
  let timeoutId = null;
  try {
    return await Promise.race([
      work(),
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`Timed out after ${runTimeoutMs}ms while running ${run.slug}`));
        }, runTimeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

async function launchBrowser() {
  return chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
    timeout: 15000,
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--headless=new",
    ],
  });
}

await ensureEvidenceDir();

const results = [];
const browser = await launchBrowser();

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  for (const run of runMatrix) {
    const page = await context.newPage();
    try {
      results.push(await withRunTimeout(run, () => runSingle(page, run)));
    } catch (error) {
      results.push({
        slug: run.slug,
        projectClass: run.productClass,
        intakePath: run.intakePath,
        projectName: run.projectName,
        passed: false,
        failures: [
          {
            failureId: buildFailureId({
              productClass: run.productClass,
              intakePath: run.intakePath,
              liveStep: "Create",
              index: 1,
            }),
            productClass: run.productClass,
            intakePath: run.intakePath,
            liveStep: "Create",
            failurePhase: "entry",
            route: page.url(),
            visibleFailure: error instanceof Error ? error.message : String(error),
            expectedTruth: expectedTruthForStep(run, "Create"),
            actualTruth: await visibleText(page).catch(() => ""),
            blockerType: "runtime-truth",
            severity: "critical",
            reproducibility: "unknown",
            userVisible: "yes",
            restoreImpact: "unknown",
            continuityImpact: "major",
            owningLane: "W3-LIVE-CLASS-SWEEP",
            suggestedNextTask: `Investigate live sweep failure for ${run.productClass} ${run.intakePath}.`,
            promotionDecision: "stay-in-current-task",
            rerunStatus: "not-rerun",
            evidencePath: "",
            canonicalState: "in-progress",
          },
        ],
      });
    } finally {
      await writeReport(results);
      await page.close().catch(() => {});
    }
  }
} finally {
  await writeReport(results);
  await browser.close().catch(() => {});
}

console.log(JSON.stringify({ reportPath, results }, null, 2));
