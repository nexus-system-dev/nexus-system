import { chromium } from "playwright-core";
import fs from "node:fs/promises";
import path from "node:path";

const dayStamp = "2026-05-18";
const baseUrl = "http://127.0.0.1:4011/?cb=wave3-reopeners";
const evidenceDir = path.resolve(
  `docs/operating-system/wave3-final-hardening/evidence/reopeners/${dayStamp}`,
);
const reportPath = path.join(evidenceDir, "wave3-reopeners-report.json");

async function ensureEvidenceDir() {
  await fs.mkdir(evidenceDir, { recursive: true });
}

function uniqueSuffix() {
  return String(Date.now()).slice(-8);
}

async function screenshot(page, name) {
  const filePath = path.join(evidenceDir, name);
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}

async function visibleText(page) {
  return page.locator("body").innerText();
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

async function maybeClick(page, labels) {
  for (const label of labels) {
    const locator = page.getByRole("button", { name: label, exact: false });
    if ((await locator.count()) > 0 && (await locator.first().isVisible())) {
      await locator.first().click();
      return true;
    }
  }
  return false;
}

async function waitForAnyText(page, labels, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const text = await visibleText(page);
    const found = labels.find((label) => text.includes(label));
    if (found) {
      return found;
    }
    await page.waitForTimeout(250);
  }
  throw new Error(`Timed out waiting for: ${labels.join(", ")}`);
}

async function waitForScreen(page, expectedScreen, timeoutMs = 15000) {
  await page.waitForFunction(
    (screen) => document.body?.dataset?.appScreen === screen,
    expectedScreen,
    { timeout: timeoutMs },
  );
}

async function currentScreen(page) {
  return page.evaluate(() => document.body?.dataset?.appScreen ?? "");
}

async function createInternalToolProject(page, {
  projectName,
  vision,
  answers,
  staleState = false,
} = {}) {
  if (staleState) {
    await page.addInitScript(() => {
      const staleState = {
        screen: "create",
        currentProjectId: "stale-project-001",
        activeWorkspace: "loop",
        currentProjectSnapshot: {
          id: "stale-project-001",
          name: "Stale Session Project",
          goal: "Old stale goal that should never bleed into a new project",
        },
        onboardingFlow: {
          sessionId: "stale-session-001",
          projectName: "Stale Session Project",
          visionText: "Old stale goal that should never bleed into a new project",
          supportingLink: "",
        },
        onboardingConversation: {
          projectId: "stale-project-001",
          currentIndex: 1,
          totalQuestions: 3,
          draftAnswer: "",
          pendingAnswer: "",
        },
        draftInputs: {},
      };
      globalThis.localStorage?.setItem("nexus.flowState", JSON.stringify(staleState));
    });
  }

  await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(1800);
  await page.locator("#create-project-name-input").fill(projectName);
  await page.locator("#create-project-vision-input").fill(vision);
  await screenshot(page, `${projectName}-create.png`);
  await page.locator("#create-project-button").click();
  await waitForAnyText(page, ["עברנו ל־onboarding של הפרויקט", "עברנו ל-onboarding של הפרויקט"]);
  await page.waitForTimeout(700);
  const onboardingStartText = await visibleText(page);
  const onboardingStartShot = await screenshot(page, `${projectName}-onboarding-start.png`);

  for (const answer of answers) {
    const textarea = page.locator("textarea:visible").first();
    const input = page.locator('input[type="text"]:visible, input:not([type]):visible').first();
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
      "נכון, בוא נתקדם",
    ]);
    if (!clicked) {
      break;
    }
    await page.waitForTimeout(900);
  }

  const onboardingCompleteText = await visibleText(page);
  const onboardingCompleteShot = await screenshot(page, `${projectName}-onboarding-complete.png`);

  const onboardingForwardButton = page.locator("#onboarding-forward-button");
  if ((await onboardingForwardButton.count()) > 0 && (await onboardingForwardButton.first().isVisible())) {
    await onboardingForwardButton.first().click();
    await waitForScreen(page, "understanding");
    await page.waitForTimeout(800);
  }

  const understandingText = await visibleText(page);
  const understandingShot = await screenshot(page, `${projectName}-understanding.png`);
  const clickedUnderstandingContinue = await maybeClick(page, [
    "נכון, בוא נתקדם",
    "נכון - המשך",
  ]);
  if (!clickedUnderstandingContinue) {
    const understandingContinue = page.locator("#understanding-continue-button");
    if ((await understandingContinue.count()) > 0 && (await understandingContinue.first().isVisible())) {
      await understandingContinue.first().click();
    }
  }
  try {
    await waitForScreen(page, "loop", 12000);
    await page.waitForTimeout(1800);
  } catch {
    await page.waitForTimeout(1200);
  }

  const loopScreen = await currentScreen(page);
  const loopText = await visibleText(page);
  const loopShot = await screenshot(page, `${projectName}-loop.png`);
  const loopProofButton = page.locator("#loop-secondary-action-button").first();
  if ((await loopProofButton.count()) > 0 && (await loopProofButton.isVisible())) {
    await loopProofButton.click();
    await page.waitForTimeout(1000);
  }
  const proofScreen = await currentScreen(page);
  const proofText = await visibleText(page);
  const proofShot = await screenshot(page, `${projectName}-proof.png`);
  const proofArtifactButton = page.locator("#proof-open-button").first();
  if ((await proofArtifactButton.count()) > 0 && (await proofArtifactButton.isVisible())) {
    await proofArtifactButton.click();
    await page.waitForTimeout(1000);
  }
  const artifactScreen = await currentScreen(page);
  const artifactText = await visibleText(page);
  const artifactShot = await screenshot(page, `${projectName}-artifact.png`);

  return {
    onboardingStartText,
    onboardingStartShot,
    onboardingCompleteText,
    onboardingCompleteShot,
    understandingText,
    understandingShot,
    loopScreen,
    loopText,
    loopShot,
    proofScreen,
    proofText,
    proofShot,
    artifactScreen,
    artifactText,
    artifactShot,
  };
}

function includesAny(text, values) {
  return values.filter((value) => text.includes(value));
}

async function verifyPth012(context) {
  const page = await context.newPage();
  const projectName = `Reopener 012 ${uniqueSuffix()}`;
  try {
    await page.route("**/api/onboarding/sessions/*/conversation-turn", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: "Request failed: 404" }),
      });
    }, { times: 1 });

    await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(1800);
    await page.locator("#create-project-name-input").fill(projectName);
    await page.locator("#create-project-vision-input").fill("מערכת פנימית לניהול תור עבודה, אחריות ופעולה הבאה לצוות תפעול.");
    await page.locator("#create-project-button").click();
    await waitForAnyText(page, ["עברנו ל־onboarding של הפרויקט", "עברנו ל-onboarding של הפרויקט"]);
    const answer = "צוות תפעול פנימי שצריך להבין מהר מה דחוף ומה הצעד הבא.";
    const textarea = page.locator("textarea:visible").first();
    if ((await textarea.count()) > 0) {
      await textarea.fill(answer);
    } else {
      await page.locator('input[type="text"]:visible, input:not([type]):visible').first().fill(answer);
    }
    await maybeClick(page, ["הבא", "קדימה", "המשך ←"]);
    await page.waitForTimeout(1200);
    const statusText = await page.locator("#onboarding-screen-status").innerText();
    const inputValue = await page.locator("#onboarding-answer-input").inputValue();
    const bodyText = await visibleText(page);
    const shot = await screenshot(page, "w3-pth-012-onboarding-submit-failure.png");
    const forbidden = includesAny(`${statusText}\n${bodyText}`, ["Request failed:", "404", "500", "fetch", "transport"]);
    return {
      taskId: "W3-PTH-012",
      passed: forbidden.length === 0 && inputValue.includes(answer),
      statusText,
      inputValue,
      forbidden,
      evidencePath: shot,
    };
  } finally {
    await page.close().catch(() => {});
  }
}

async function verifyInternalToolTruth(context) {
  const page = await context.newPage();
  const projectName = `Reopeners Internal ${uniqueSuffix()}`;
  try {
    const run = await createInternalToolProject(page, {
      projectName,
      vision: "בנה כלי פנימי לצוות תפעול עם תור עבודה ברור, בעלות גלויה, רמת שירות ופעולה הבאה.",
      answers: [
        "צוות תפעול פנימי שמטפל בבקשות, תורים ואישורים בכל יום.",
        "זה כלי פנימי לצוות תפעול עם תור עבודה, אחריות ברורה ואישורים.",
        "הכאב הוא שאין בעלות ברורה, אין סדר בתור העבודה וקשה לדעת מה הפעולה הבאה.",
        "פתרון טוב ייתן תור עבודה ברור, אחראי גלוי, רמת שירות ופעולה הבאה שכל נציג מבין מיד.",
      ],
    });

    const allText = [
      run.onboardingCompleteText,
      run.understandingText,
      run.loopText,
      run.proofText,
      run.artifactText,
    ].join("\n");

    const landingLeaks = includesAny(allText, ["ביקורים", "הרשמות", "שיעור המרה", "CTA", "דף נחיתה"]);
    const runtimeLeaks = includesAny(allText, [
      "journey-onboarding-initialization:onboarding:capture-intake",
      "ai-design-proposal:",
      "agent-runtime",
      "stdout | command output",
      "QA preview override",
      "Safe mock state fallback",
      "W3 ",
    ]);
    const englishBleed = includesAny(allText, [" workspace", "Workspace", " owner", "Owner", " queue", "Queue", " approvals", "Approvals", "SLA"]);
    const reachedLoop = run.loopScreen === "loop";
    const reachedProof = run.proofScreen === "proof";
    const reachedArtifact = run.artifactScreen === "artifact";

    return {
      taskIds: ["W3-PTH-013", "W3-PTH-014", "W3-PTH-015"],
      passed013: landingLeaks.length === 0 && reachedLoop && reachedProof && reachedArtifact,
      passed014: runtimeLeaks.length === 0 && reachedLoop && reachedProof && reachedArtifact,
      passed015: englishBleed.length === 0 && reachedLoop && reachedProof && reachedArtifact,
      reachedLoop,
      reachedProof,
      reachedArtifact,
      landingLeaks,
      runtimeLeaks,
      englishBleed,
      evidencePaths: {
        onboardingComplete: run.onboardingCompleteShot,
        understanding: run.understandingShot,
        loop: run.loopShot,
        proof: run.proofShot,
        artifact: run.artifactShot,
      },
      snippets: {
        onboardingComplete: run.onboardingCompleteText.slice(0, 1600),
        understanding: run.understandingText.slice(0, 1600),
        loop: run.loopText.slice(0, 1600),
        proof: run.proofText.slice(0, 1600),
        artifact: run.artifactText.slice(0, 1600),
      },
    };
  } finally {
    await page.close().catch(() => {});
  }
}

async function verifyPth016(context) {
  const page = await context.newPage();
  const projectName = `Fresh Project ${uniqueSuffix()}`;
  try {
    const run = await createInternalToolProject(page, {
      projectName,
      vision: "בנה כלי פנימי חדש לצוות תפעול בלי לזלוג לזהות של פרויקט ישן.",
      answers: [
        "צוות תפעול פנימי שמטפל בבקשות יומיות.",
        "זה כלי פנימי חדש עם תור עבודה ואחריות ברורה.",
        "הכאב הוא שפרויקטים חדשים נפתחים על גבי context ישן ולא ברור מה שייך למה.",
        "פתרון טוב ישמור על זהות הפרויקט החדש מהמסך הראשון בלי לזלוג לפרויקט קודם.",
      ],
      staleState: true,
    });
    const startText = run.onboardingStartText;
    const completeText = run.onboardingCompleteText;
    const forbiddenOldIdentity = includesAny(`${startText}\n${completeText}`, [
      "Stale Session Project",
      "Old stale goal",
      "חזרת למשטח העבודה שלך",
      "מסך ה־Onboarding נפתח במצב בדיקה",
    ]);
    return {
      taskId: "W3-PTH-016",
      passed: forbiddenOldIdentity.length === 0 && startText.includes("עברנו ל־onboarding של הפרויקט"),
      forbiddenOldIdentity,
      evidencePaths: {
        onboardingStart: run.onboardingStartShot,
        onboardingComplete: run.onboardingCompleteShot,
      },
      snippets: {
        onboardingStart: startText.slice(0, 1600),
        onboardingComplete: completeText.slice(0, 1600),
      },
    };
  } finally {
    await page.close().catch(() => {});
  }
}

await ensureEvidenceDir();
const browser = await launchBrowser();
const results = {};

async function runIsolated(browser, key, verifier) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  try {
    results[key] = await verifier(context);
  } catch (error) {
    results[key] = {
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await context.close().catch(() => {});
    await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  }
}

try {
  await runIsolated(browser, "pth012", verifyPth012);
  await runIsolated(browser, "internalTool", verifyInternalToolTruth);
  await runIsolated(browser, "pth016", verifyPth016);
} finally {
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  await browser.close().catch(() => {});
}

console.log(JSON.stringify({ reportPath, results }, null, 2));
