import { chromium } from "playwright-core";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = "http://127.0.0.1:4011/?cb=live-multi-loop-app";
const evidenceDir = path.resolve(
  "docs/operating-system/wave3-final-hardening/evidence/upload-loop",
);

const uploadBundles = [
  {
    slug: "milan",
    projectName: "Milan Existing Project Upload",
    vision:
      "Imported existing local ecommerce project. Use the uploaded repository evidence to understand the product and continue the Nexus loop from the actual project material.",
    files: [
      "/Users/yogevlavian/Desktop/milan.co/README.md",
      "/Users/yogevlavian/Desktop/milan.co/package.json",
      "/Users/yogevlavian/Desktop/milan.co/tsconfig.json",
      "/Users/yogevlavian/Desktop/milan.co/src/middleware.ts",
    ],
    answers: [
      "צוות התפעול והמסחר שמנהל קטלוג, הזמנות ותוכן בכל יום.",
      "המוצר הוא פלטפורמת ecommerce פעילה עם קטלוג, הזמנות, תוכן והרשאות ניהול.",
      "מה שנשבר היום הוא מעבר לא ברור בין קטלוג, תוכן ותפעול הזמנות כך שהעבודה נמרחת ונוצרות טעויות.",
      "כלי מוצלח ייתן workflow ברור לבעלי התפקידים, בעלות על משימות, והוכחה מהירה למה צריך לתקן קודם.",
    ],
  },
  {
    slug: "nexus",
    projectName: "Nexus Existing Project Upload",
    vision:
      "Imported existing local product workspace. Use the uploaded repository evidence to drive product understanding and the next execution loop from the uploaded material itself.",
    files: [
      "/Users/yogevlavian/Desktop/The Nexus/README.md",
      "/Users/yogevlavian/Desktop/The Nexus/package.json",
      "/Users/yogevlavian/Desktop/The Nexus/src/server.js",
      "/Users/yogevlavian/Desktop/The Nexus/docs/wave3-canonical-state.json",
    ],
    answers: [
      "צוות המוצר שמחזיק את Nexus בכל יום ועובד על onboarding, loop ו-proof.",
      "זה מוצר workspace שמנהל פרויקטים, understanding, loop, proof וציר זמן.",
      "מה שנשבר הוא פער בין state קנוני, flow משתמש אמיתי, והוכחה חיה שהמוצר מתקדם נכון.",
      "כלי מוצלח יראה state אמיתי, לולאה ברורה, proof אמין ומשימות קנוניות שאפשר לסגור אחת אחת.",
    ],
  },
];

async function ensureEvidenceDir() {
  await fs.mkdir(evidenceDir, { recursive: true });
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
    if (
      body.includes("Project Create") ||
      body.includes("מה נבנה עכשיו") ||
      page.url().includes("/proof")
    ) {
      break;
    }

    const textarea =
      page.locator("textarea:visible").first();
    const input =
      page.locator('input[type="text"]:visible, input:not([type]):visible').first();
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
    await page.waitForTimeout(750);
  }
  return usedQuestions;
}

async function moveBeyondUnderstanding(page) {
  const routeTrail = [];

  if ((await page.locator("#onboarding-forward-button").count()) > 0) {
    await page.locator("#onboarding-forward-button").click();
    await page.waitForTimeout(1000);
  }

  const understandingContinue =
    page.getByRole("button", { name: /נכון/ }).last();
  if ((await understandingContinue.count()) > 0 && (await understandingContinue.isVisible())) {
    await understandingContinue.click();
    await page.waitForTimeout(2500);
  }

  const currentLoopScreen = await page.locator("body").getAttribute("data-app-screen");
  if (currentLoopScreen === "loop" || page.url().includes("/loop")) {
    routeTrail.push("loop");
  }

  const loopProofButton = page.locator("#loop-secondary-action-button").first();
  if ((await loopProofButton.count()) > 0 && (await loopProofButton.isVisible())) {
    await loopProofButton.click();
    await page.waitForTimeout(1000);
  }
  const currentProofScreen = await page.locator("body").getAttribute("data-app-screen");
  if (currentProofScreen === "proof" || page.url().includes("/proof")) {
    routeTrail.push("proof");
  }

  const proofArtifactButton = page.locator("#proof-open-button").first();
  if ((await proofArtifactButton.count()) > 0 && (await proofArtifactButton.isVisible())) {
    await proofArtifactButton.click();
    await page.waitForTimeout(1000);
  }
  const currentArtifactScreen = await page.locator("body").getAttribute("data-app-screen");
  if (currentArtifactScreen === "artifact" || page.url().includes("/artifact")) {
    routeTrail.push("artifact");
  }

  const artifactContinueButton = page.locator("#artifact-continue-button").first();
  if ((await artifactContinueButton.count()) > 0 && (await artifactContinueButton.isVisible())) {
    await artifactContinueButton.click();
    await page.waitForTimeout(1200);
  }
  const currentConfirmationScreen = await page.locator("body").getAttribute("data-app-screen");
  if (currentConfirmationScreen === "confirmation" || page.url().includes("/confirmation")) {
    routeTrail.push("confirmation");
  }

  const confirmationApproveButton = page.locator("#confirmation-approve-button").first();
  if ((await confirmationApproveButton.count()) > 0 && (await confirmationApproveButton.isVisible())) {
    await confirmationApproveButton.click();
    await page.waitForTimeout(1800);
  }
  const currentStateUpdateScreen = await page.locator("body").getAttribute("data-app-screen");
  if (currentStateUpdateScreen === "state-update" || page.url().includes("/state-update")) {
    routeTrail.push("state-update");
  }

  const timelineHistoryButton = page.locator("#state-update-history-button").first();
  if ((await timelineHistoryButton.count()) > 0 && (await timelineHistoryButton.isVisible())) {
    await timelineHistoryButton.click();
    await page.waitForTimeout(1200);
  }
  const currentTimelineScreen = await page.locator("body").getAttribute("data-app-screen");
  if (currentTimelineScreen === "timeline" || page.url().includes("/timeline")) {
    routeTrail.push("timeline");
  }

  return routeTrail.length > 0 ? routeTrail.join(" -> ") : "stalled";
}

async function collectSummary(page) {
  const text = await visibleText(page);
  return {
    url: page.url(),
    title: await page.title(),
    text,
  };
}

async function runBundle(page, bundle) {
  await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(2500);

  await page.locator("#create-project-name-input").fill(bundle.projectName);
  await page.locator("#create-project-vision-input").fill(bundle.vision);
  await page.locator("#create-project-file-upload-input").setInputFiles(bundle.files);
  await page.waitForTimeout(500);

  const uploadMeta = (await page.locator("#create-project-file-picker-meta").innerText()).trim();
  const uploadTitle = (await page.locator("#create-project-file-picker-title").innerText()).trim();
  const createShot = await screenshot(page, `${bundle.slug}-01-create.png`);

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

  const onboardingShot = await screenshot(page, `${bundle.slug}-02-first-stage.png`);
  const usedQuestions = await answerOnboarding(page, bundle.answers);
  const navigationState = await moveBeyondUnderstanding(page);
  const finalShot = await screenshot(page, `${bundle.slug}-03-final-stage.png`);
  const summary = await collectSummary(page);

  return {
    bundle: bundle.slug,
    files: bundle.files,
    uploadMeta,
    uploadTitle,
    createShot,
    onboardingShot,
    finalShot,
    firstStage,
    usedQuestions,
    navigationState,
    summary,
  };
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
const reportPath = path.join(evidenceDir, "playwright-upload-verification-2026-05-17.json");

try {
  const context = await browser.newContext({ viewport: { width: 1365, height: 768 } });
  for (const bundle of uploadBundles) {
    const page = await context.newPage();
    try {
      results.push(await runBundle(page, bundle));
    } catch (error) {
      results.push({
        bundle: bundle.slug,
        files: bundle.files,
        error: error instanceof Error ? error.message : String(error),
        summary: await collectSummary(page).catch(() => null),
      });
    } finally {
      await page.close().catch(() => {});
    }
  }
} finally {
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  await browser.close().catch(() => {});
}
console.log(JSON.stringify({ reportPath, results }, null, 2));
process.exit(0);
