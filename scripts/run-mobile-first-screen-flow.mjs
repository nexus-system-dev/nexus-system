import { chromium } from "playwright-core";

const baseUrl = "http://127.0.0.1:4011/";
const idea = "אני רוצה אפליקציה שמנהלת תורים למספרה, שולחת תזכורות אוטומטיות ומראה ללקוחה את התור הבא שלה.";
const answers = [
  "בעלות העסק והלקוחות שקובעות תור דרך הטלפון או הוואטסאפ.",
  "היום תורים נקבעים ידנית, קשה לזכור מי אמורה להגיע ומתי לשלוח תזכורת, ויש בלגן בשינויים של הרגע האחרון.",
  "לכל לקוחה יש תור הבא, תזכורת אוטומטית, היסטוריית ביקורים ומסך פתיחה שמראה מיד את התורים של היום והפעולה הבאה.",
  "המסך הראשון צריך להראות את התורים של היום, מי צריכה תזכורת, וכפתור מהיר לקביעת תור חדש.",
  "במסך הראשון חייב להיות ברור מיד מה התורים של היום, מי צריכה תזכורת, ואיך קובעים תור חדש בלי לחפש בתפריטים.",
  "ב-v1 ההזמנה יכולה להיסגר מיד בלי שלב אישור, אבל חייבים תזכורות אוטומטיות וביטולים מסודרים כבר מההתחלה.",
];

function shortText(value = "", limit = 2200) {
  return String(value).replace(/\s+/g, " ").trim().slice(0, limit);
}

async function currentState(page) {
  const url = page.url();
  const bodyText = shortText(await page.locator("body").innerText(), 4000);
  const links = await page.locator("a").evaluateAll((nodes) =>
    nodes
      .map((node) => ({
        text: (node.innerText || "").trim(),
        href: node.getAttribute("href") || "",
      }))
      .filter((item) => item.text || item.href),
  );
  const buttons = await page.locator("button").evaluateAll((nodes) =>
    nodes.map((node) => (node.innerText || "").trim()).filter(Boolean),
  );
  return { url, bodyText, links, buttons };
}

async function clickButtonThroughDom(page, matcherSource) {
  const clicked = await page.evaluate((matcher) => {
    const regex = new RegExp(matcher, "i");
    const buttons = Array.from(document.querySelectorAll("button"));
    const target = buttons.find((button) => regex.test((button.innerText || "").trim()))
      ?? buttons[buttons.length - 1];
    if (!target) {
      return null;
    }
    target.click();
    return (target.innerText || "").trim();
  }, matcherSource);
  if (!clicked) {
    throw new Error(`No button matched ${matcherSource}`);
  }
  return clicked;
}

async function fillLatestTextareaAndSend(page, text) {
  try {
    await page.waitForFunction(() => {
      const inputs = Array.from(document.querySelectorAll("#onboarding-answer-input"));
      return inputs.some((input) => !input.hasAttribute("hidden") || input.getBoundingClientRect().width > 0);
    }, { timeout: 8000 });
  } catch {
    // Fall through to the generic fallback if the onboarding input never becomes available.
  }

  const onboardingInputCount = await page.locator("#onboarding-answer-input").count();
  if (onboardingInputCount > 0) {
    await page.evaluate((answer) => {
      const inputs = Array.from(document.querySelectorAll("#onboarding-answer-input"));
      const target = inputs.find((input) => !input.hasAttribute("hidden") && input.getBoundingClientRect().width > 0)
        ?? inputs[inputs.length - 1];
      if (!target) {
        throw new Error("No onboarding answer input found");
      }
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      if (!setter) {
        throw new Error("Missing HTMLInputElement value setter");
      }
      setter.call(target, answer);
      target.dispatchEvent(new InputEvent("input", { bubbles: true, data: answer, inputType: "insertText" }));
      target.dispatchEvent(new Event("change", { bubbles: true }));
    }, text);
    await clickButtonThroughDom(page, "נכון - המשך|המשך");
    await page.waitForTimeout(1800);
    return;
  }

  const textareas = page.locator("textarea:not([hidden])");
  const count = await textareas.count();
  if (count === 0) {
    throw new Error("No visible answer input found");
  }
  await textareas.nth(count - 1).fill(text);
  await clickButtonThroughDom(page, "המשך|שלח|↗");
  await page.waitForTimeout(1800);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const steps = [];

  try {
    await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.locator("#create-project-vision-input").fill(idea);
    steps.push({
      stage: "before-first-submit",
      ...(await currentState(page)),
      inputValue: await page.locator("#create-project-vision-input").inputValue(),
    });
    await clickButtonThroughDom(page, "↗|התחל");
    await page.waitForTimeout(2200);
    steps.push({
      stage: "after-idea",
      ...(await currentState(page)),
      storedFlowState: await page.evaluate(() => localStorage.getItem("nexus.flowState")),
    });

    let answerIndex = 0;
    for (let i = 0; i < 8; i += 1) {
      const state = await currentState(page);
      steps.push({ stage: `loop-${i}`, ...state });

      if (state.bodyText.includes("מסך פתיחה ראשון")) {
        console.log(JSON.stringify({ success: true, reached: "first-screen-visible", final: state, steps }, null, 2));
        return;
      }

      const loopLink = state.links.find((item) => item.href.includes("/loop"));
      if (loopLink) {
        await page.goto(new URL(loopLink.href, page.url()).toString(), { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1500);
        continue;
      }

      if (state.url.includes("/understanding")) {
        const continueLink = state.links.find((item) => item.href.includes("/loop"));
        if (continueLink) {
          await page.goto(new URL(continueLink.href, page.url()).toString(), { waitUntil: "domcontentloaded", timeout: 30000 });
          await page.waitForLoadState("networkidle");
          await page.waitForTimeout(1500);
          continue;
        }
      }

      if (state.url.includes("/onboarding")) {
        if (answerIndex >= answers.length) {
          break;
        }
        await fillLatestTextareaAndSend(page, answers[answerIndex]);
        answerIndex += 1;
        continue;
      }
    }

    const postAnswerState = await currentState(page);
    steps.push({ stage: "post-answer-state", ...postAnswerState });

    if (postAnswerState.buttons.some((text) => text.includes("סיים Onboarding"))) {
      await clickButtonThroughDom(page, "סיים Onboarding");
      await page.waitForTimeout(2500);
      const finishState = await currentState(page);
      steps.push({ stage: "after-finish-onboarding", ...finishState });

      const loopLink = finishState.links.find((item) => item.href.includes("/loop"));
      if (loopLink) {
        await page.goto(new URL(loopLink.href, page.url()).toString(), { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1500);
      }
    }

    const finalState = await currentState(page);
    console.log(JSON.stringify({ success: finalState.bodyText.includes("מסך פתיחה ראשון"), reached: "incomplete", final: finalState, steps }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
