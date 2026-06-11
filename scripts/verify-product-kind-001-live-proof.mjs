import fs from "node:fs/promises";
import { chromium } from "playwright-core";
import { buildRuntimeSkeletonTruthEnvelope } from "../web/shared/runtime-skeleton-truth.js";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const screenshotPrefix = process.env.NEXUS_PRODUCT_KIND_SCREENSHOT_PREFIX
  ?? `/private/tmp/nexus-product-kind-001-${now}`;
const liveUserId = `product-kind-user-${now}`;

const cases = [
  {
    key: "game",
    projectId: `product-kind-game-${now}`,
    project: {
      name: "מבוך מספרים",
      goal: "משחק פאזל עם שחקן, ניקוד, שלבים ומבוך שאפשר לזוז בו",
      productSkeletonAgentOutput: {
        agentId: "product-skeleton-agent",
        productType: "רעיון אינטראקטיבי",
        primaryUser: "שחקן",
        primaryProblem: "צריך לפתור מבוך עם ניקוד וזמן",
        firstWorkflow: { title: "מבוך מספרים", steps: ["התחל משחק", "זוז", "אסוף ניקוד"] },
        initialActions: ["התחל משחק", "זוז", "אסוף"],
        dataObjects: [{ name: "GameState", fields: ["score", "level", "player"] }],
      },
    },
    expected: { productPattern: "game-loop", productClass: "game", shellFamily: "playable-preview" },
  },
  {
    key: "editor",
    projectId: `product-kind-editor-${now}`,
    project: {
      name: "עורך קנבס",
      goal: "כלי עריכה עם קנבס, שכבות, אובייקט נבחר, סרגל כלים ובטל חזור",
      productSkeletonAgentOutput: {
        agentId: "product-skeleton-agent",
        productType: "משהו לא רגיל",
        primaryUser: "מעצב",
        primaryProblem: "צריך לערוך אובייקטים על קנבס",
        firstWorkflow: { title: "עורך קנבס", steps: ["בחר אובייקט", "שנה צבע", "בטל"] },
        initialActions: ["בחר", "הוסף צורה", "בטל"],
      },
    },
    expected: { productPattern: "editor-canvas", productClass: "software-tool", shellFamily: "editor-canvas-shell" },
  },
  {
    key: "simulator",
    projectId: `product-kind-simulator-${now}`,
    project: {
      name: "סימולטור תמחור",
      goal: "סימולטור שמריץ תרחישים, משנה פרמטרים ומציג מדדים ותוצאה משתנה",
      productSkeletonAgentOutput: {
        agentId: "product-skeleton-agent",
        productType: "כלי חיזוי",
        primaryUser: "מנהל עסק",
        primaryProblem: "צריך להבין מה יקרה כשמשנים פרמטרים",
        firstWorkflow: { title: "סימולטור תמחור", steps: ["שנה פרמטר", "הרץ תרחיש", "ראה תוצאה"] },
        initialActions: ["הרץ תרחיש", "שנה פרמטר", "אפס"],
      },
    },
    expected: { productPattern: "simulator-state", productClass: "software-tool", shellFamily: "simulator-control-shell" },
  },
];

async function apiJson(pathname, { method = "GET", body = null, headers = {} } = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-user-id": liveUserId,
      ...headers,
    },
    body: body ? JSON.stringify(body) : null,
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`API ${method} ${pathname} failed ${response.status}: ${text.slice(0, 800)}`);
  }
  return text ? JSON.parse(text) : null;
}

async function ensureUser() {
  await apiJson("/api/auth/signup", {
    method: "POST",
    body: {
      userInput: {
        userId: liveUserId,
        email: `${liveUserId}@example.test`,
        displayName: "בודק סוג מוצר",
      },
      credentials: { password: "TestOnly123!" },
    },
  });
}

async function ensureProject(testCase) {
  const project = {
    id: testCase.projectId,
    name: testCase.project.name,
    goal: testCase.project.goal,
    artifactExpectation: { title: testCase.project.name },
    productSkeletonAgentOutput: testCase.project.productSkeletonAgentOutput,
  };
  const runtimeSkeletonTruth = buildRuntimeSkeletonTruthEnvelope({ project });
  await apiJson("/api/projects", {
    method: "POST",
    body: {
      id: project.id,
      name: project.name,
      goal: project.goal,
      state: {
        artifactExpectation: project.artifactExpectation,
        productSkeletonAgentOutput: project.productSkeletonAgentOutput,
        runtimeSkeletonTruth,
        productDomainSkeleton: runtimeSkeletonTruth.productDomainSkeleton,
      },
    },
  });
}

async function inspectCase(page, testCase) {
  await ensureProject(testCase);
  const url = new URL("/loop", baseUrl);
  url.searchParams.set("projectId", testCase.projectId);
  await page.goto(url.toString(), { waitUntil: "networkidle", timeout: 30000 });
  await page.locator("[data-runtime-skeleton-task='SLICE-005']").waitFor({ timeout: 15000 });
  const screenshotPath = `${screenshotPrefix}-${testCase.key}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  const proof = await page.evaluate(() => {
    const runtime = document.querySelector("[data-runtime-skeleton-task='SLICE-005']");
    return {
      url: location.href,
      productKindTask: runtime?.getAttribute("data-product-kind-task") ?? null,
      productKindStatus: runtime?.getAttribute("data-product-kind-status") ?? null,
      productPattern: runtime?.getAttribute("data-product-kind-pattern") ?? null,
      productClass: runtime?.getAttribute("data-runtime-product-class") ?? null,
      shellFamily: runtime?.getAttribute("data-runtime-shell-family") ?? null,
      skeletonFamily: runtime?.getAttribute("data-product-kind-skeleton-family") ?? null,
      needsClarification: runtime?.getAttribute("data-product-kind-needs-clarification") ?? null,
      domainKind: runtime?.getAttribute("data-product-domain-kind") ?? null,
      text: document.body.innerText,
    };
  });
  const missing = [];
  for (const [key, expectedValue] of Object.entries(testCase.expected)) {
    if (proof[key] !== expectedValue) missing.push(`${key}:${expectedValue}`);
  }
  if (proof.productKindTask !== "PRODUCT-KIND-001") missing.push("productKindTask:PRODUCT-KIND-001");
  if (proof.productKindStatus !== "resolved") missing.push("productKindStatus:resolved");
  if (proof.needsClarification !== "false") missing.push("needsClarification:false");
  if (proof.shellFamily === "generic-preview" || proof.shellFamily === "generic-runtime") missing.push("genericShell:absent");
  if (/PRO-SKEL|SLICE-|PRODUCT-KIND|QA/u.test(proof.text)) missing.push("visibleInternalTaskLanguage:absent");
  return { key: testCase.key, screenshotPath, ...proof, missing };
}

async function main() {
  await ensureUser();
  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    slowMo: Number(process.env.NEXUS_LIVE_SLOW_MO ?? 100),
  });
  const page = await browser.newPage({ viewport: { width: 1500, height: 940 } });
  await page.addInitScript((appUser) => {
    localStorage.setItem("nexus.appUser", JSON.stringify(appUser));
  }, {
    userId: liveUserId,
    email: `${liveUserId}@example.test`,
    displayName: "בודק סוג מוצר",
  });

  const proofs = [];
  try {
    for (const testCase of cases) {
      proofs.push(await inspectCase(page, testCase));
    }
  } finally {
    await browser.close();
  }

  const report = { ok: proofs.every((proof) => proof.missing.length === 0), baseUrl, screenshotPrefix, proofs };
  const reportPath = `${screenshotPrefix}-report.json`;
  await fs.writeFile(reportPath, JSON.stringify({ ...report, reportPath }, null, 2));
  if (!report.ok) {
    console.error(JSON.stringify({ ...report, reportPath }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ...report, reportPath }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

