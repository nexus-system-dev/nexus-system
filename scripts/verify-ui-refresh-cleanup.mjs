import { chromium } from "playwright-core";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = "http://127.0.0.1:4011";
const evidenceDir = path.resolve(
  "docs/operating-system/wave3-final-hardening/evidence/ui-refresh-cleanup",
);

async function ensureDir() {
  await fs.mkdir(evidenceDir, { recursive: true });
}

async function screenshot(page, name) {
  const filePath = path.join(evidenceDir, name);
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}

async function inspect(page, route) {
  const consoleLogs = [];
  const pageErrors = [];
  page.removeAllListeners("console");
  page.removeAllListeners("pageerror");
  page.on("console", (msg) => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });
  page.on("pageerror", (error) => {
    pageErrors.push(String(error));
  });

  const targetUrl = `${baseUrl}${route}`;
  await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(2000);

  const result = await page.locator("body").evaluate((body) => {
    const text = (body.innerText || "").trim();
    const q = (selector) => body.ownerDocument.querySelectorAll(selector).length;
    const byId = (id) => body.ownerDocument.getElementById(id);
    const createScreen = byId("screen-create");
    const homeScreen = byId("screen-home");
    const onboardingScreen = byId("screen-onboarding");
    const loopScreen = byId("screen-loop");
    const routeTitle = body.ownerDocument.querySelector("#shell-route-title")?.textContent?.trim() || "";
    const routeSubtitle = body.ownerDocument.querySelector("#shell-route-subtitle")?.textContent?.trim() || "";
    return {
      bodyAppScreen: body.dataset.appScreen || "",
      htmlAppScreen: body.ownerDocument.documentElement.dataset.appScreen || "",
      bodyShellRoute: body.dataset.shellRoute || "",
      title: body.ownerDocument.title,
      routeTitle,
      routeSubtitle,
      textSample: text.slice(0, 3000),
      legacySidebarCount: q(".nexus-sidebar"),
      legacyTopbarCount: q(".nexus-topbar"),
      legacyStepperCount: q(".nexus-flow-stepper"),
      legacyHeroCount: q(".hero"),
      nestedWorkspaceShellCount: q("#screen-create .nexus-ui-shell, #screen-home .nexus-ui-shell, #screen-onboarding .nexus-ui-shell, #screen-loop .nexus-ui-shell, #screen-proof .nexus-ui-shell"),
      routeShellCount: q(".nexus-ui-route-shell"),
      modernSidebarLinkCount: q(".nexus-ui-sidebar__link"),
      visibleCreateCount: q('#screen-create:not([hidden])'),
      visibleHomeCount: q('#screen-home:not([hidden])'),
      visibleOnboardingCount: q('#screen-onboarding:not([hidden])'),
      visibleLoopCount: q('#screen-loop:not([hidden])'),
      createHidden: createScreen?.hasAttribute("hidden") ?? null,
      homeHidden: homeScreen?.hasAttribute("hidden") ?? null,
      onboardingHidden: onboardingScreen?.hasAttribute("hidden") ?? null,
      loopHidden: loopScreen?.hasAttribute("hidden") ?? null,
      createHtmlLength: createScreen?.innerHTML?.length ?? 0,
      homeHtmlLength: homeScreen?.innerHTML?.length ?? 0,
      onboardingHtmlLength: onboardingScreen?.innerHTML?.length ?? 0,
      loopHtmlLength: loopScreen?.innerHTML?.length ?? 0,
    };
  });

  const shot = await screenshot(page, `${route === "/" ? "root" : route.slice(1)}.png`);
  return {
    route,
    url: page.url(),
    screenshot: shot,
    consoleLogs,
    pageErrors,
    ...result,
  };
}

async function run() {
  await ensureDir();
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    timeout: 15000,
  });
  const page = await browser.newPage({ viewport: { width: 1365, height: 768 } });

  try {
    const root = await inspect(page, "/");
    const home = await inspect(page, "/home");
    const onboarding = await inspect(page, "/onboarding");
    const loop = await inspect(page, "/loop");

    const report = { root, home, onboarding, loop };
    const reportPath = path.join(evidenceDir, "verify-ui-refresh-cleanup.json");
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ reportPath, report }, null, 2));
  } finally {
    await browser.close();
  }
}

await run();
