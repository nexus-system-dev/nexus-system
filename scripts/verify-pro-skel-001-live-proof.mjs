import fs from "node:fs/promises";
import { chromium } from "playwright-core";
import { buildRuntimeSkeletonTruthEnvelope } from "../web/shared/runtime-skeleton-truth.js";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const screenshotPrefix = process.env.NEXUS_PRO_SKEL_SCREENSHOT_PREFIX
  ?? `/private/tmp/nexus-pro-skel-003-${now}`;
const liveUserId = `pro-skel-live-user-${now}`;

const cases = [
  {
    key: "mobile",
    projectId: `pro-skel-mobile-${now}`,
    project: {
      name: "Daily Done",
      goal: "אפליקציה יומית לסימון משימות שבוצעו",
      artifactExpectation: { projectType: "mobile app", title: "Daily Done" },
      productSkeletonAgentOutput: {
        agentId: "product-skeleton-agent",
        productType: "mobile app",
        primaryUser: "משתמש יומי",
        primaryProblem: "צריך לסמן משימות שבוצעו",
        firstWorkflow: { title: "Daily Done", steps: ["פתח", "הוסף", "סמן"] },
        initialScreens: [{ name: "בית" }, { name: "היום" }, { name: "סיכום" }],
        initialActions: ["הוסף משימה", "סמן בוצע", "מחק"],
        dataObjects: [{ name: "Task", fields: ["title", "status", "owner"] }],
        versionOneBoundary: { buildNow: ["מסכים", "מצב"], doNotBuildNow: ["App Store"] },
      },
    },
    required: {
      productClass: "mobile-app",
      shellFamily: "mobile-simulator",
      mustHave: ["nexus-runtime-mobile-frame__tasks", "nexus-runtime-mobile-frame__quick-stats", "data-runtime-app-tab", "data-realistic-skeleton-task=\"PRO-SKEL-003\""],
    },
  },
  {
    key: "landing",
    projectId: `pro-skel-landing-${now}`,
    project: {
      name: "Lead Rescue",
      goal: "דף נחיתה לבעל עסק קטן שמאבד לידים",
      artifactExpectation: { projectType: "landing page", title: "Lead Rescue" },
      productSkeletonAgentOutput: {
        agentId: "product-skeleton-agent",
        productType: "landing page",
        primaryUser: "בעל עסק קטן",
        primaryProblem: "לידים נופלים כי אין אחראי",
        firstWorkflow: { title: "Lead Rescue", steps: ["הסבר", "הוכחה", "השאר פרטים"] },
        initialActions: ["השאר פרטים"],
        versionOneBoundary: { buildNow: ["דף", "טופס"], doNotBuildNow: ["פרסום"] },
      },
    },
    required: {
      productClass: "landing-page",
      shellFamily: "web-page-preview",
      mustHave: ["data-runtime-section=\"form\"", "nexus-runtime-landing-page__form", "data-runtime-section=\"trust\"", "data-runtime-section=\"value\"", "data-realistic-skeleton-task=\"PRO-SKEL-003\""],
    },
  },
  {
    key: "internal",
    projectId: `pro-skel-internal-${now}`,
    project: {
      name: "לוח לידים",
      goal: "כלי פנימי לניהול לידים עם אחראי תזכורת וצעד הבא",
      artifactExpectation: { projectType: "internal tool", title: "לוח לידים" },
      productSkeletonAgentOutput: {
        agentId: "product-skeleton-agent",
        productType: "internal tool",
        primaryUser: "בעל עסק קטן",
        primaryProblem: "אין אחראי ותזכורת ללידים",
        firstWorkflow: { title: "לוח לידים", steps: ["הוסף ליד", "שייך אחראי", "קבע תזכורת"] },
        initialActions: ["הוסף ליד", "עדכן סטטוס", "שנה אחראי"],
        dataObjects: [{ name: "Lead", fields: ["name", "status", "owner", "reminder", "nextStep"] }],
        versionOneBoundary: { buildNow: ["טבלה", "סטטוס", "אחראי"], doNotBuildNow: ["וואטסאפ"] },
      },
    },
    required: {
      productClass: "internal-tool",
      shellFamily: "workspace-state-shell",
      mustHave: ["nexus-runtime-workspace-metrics", "nexus-runtime-workspace-filters", "nexus-runtime-workspace-table", "data-product-domain-operation=\"record.create\"", "data-realistic-skeleton-task=\"PRO-SKEL-003\""],
    },
  },
];

function urlForCase(testCase) {
  const url = new URL("/loop", baseUrl);
  url.searchParams.set("projectId", testCase.projectId);
  return url.toString();
}

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
        displayName: "בודק שלד מקצועי",
      },
      credentials: {
        password: "TestOnly123!",
      },
    },
  });
}

async function ensureProject(testCase) {
  const project = {
    id: testCase.projectId,
    name: testCase.project.name,
    goal: testCase.project.goal,
    artifactExpectation: testCase.project.artifactExpectation,
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
  const url = urlForCase(testCase);
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await page.locator("[data-runtime-skeleton-task='SLICE-005']").waitFor({ timeout: 15000 });
  const screenshotPath = `${screenshotPrefix}-${testCase.key}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  const proof = await page.evaluate(() => {
    const runtime = document.querySelector("[data-runtime-skeleton-task='SLICE-005']");
    const html = document.body.innerHTML;
    return {
      url: location.href,
      productClass: runtime?.getAttribute("data-runtime-product-class") ?? null,
      shellFamily: runtime?.getAttribute("data-runtime-shell-family") ?? null,
      professionalTask: runtime?.getAttribute("data-professional-skeleton-task") ?? null,
      professionalStatus: runtime?.getAttribute("data-professional-skeleton-status") ?? null,
      professionalLevel: runtime?.getAttribute("data-professional-skeleton-level") ?? null,
      buildContinuation: runtime?.getAttribute("data-professional-build-continuation") ?? null,
      marketTask: runtime?.getAttribute("data-market-skeleton-task") ?? null,
      marketStatus: runtime?.getAttribute("data-market-skeleton-status") ?? null,
      marketLevel: runtime?.getAttribute("data-market-skeleton-level") ?? null,
      marketLearningUplift: runtime?.getAttribute("data-market-skeleton-learning-uplift") ?? null,
      realisticTask: runtime?.getAttribute("data-realistic-skeleton-task") ?? null,
      realisticStatus: runtime?.getAttribute("data-realistic-skeleton-status") ?? null,
      realisticLevel: runtime?.getAttribute("data-realistic-skeleton-level") ?? null,
      criterionCount: document.querySelectorAll("[data-professional-criterion]").length,
      marketCriterionCount: document.querySelectorAll("[data-market-criterion]").length,
      realisticCriterionCount: document.querySelectorAll("[data-realistic-criterion]").length,
      html,
      text: document.body.innerText,
    };
  });
  const missing = testCase.required.mustHave.filter((needle) => !proof.html.includes(needle));
  if (proof.productClass !== testCase.required.productClass) {
    missing.push(`productClass:${testCase.required.productClass}`);
  }
  if (proof.shellFamily !== testCase.required.shellFamily) {
    missing.push(`shellFamily:${testCase.required.shellFamily}`);
  }
  if (proof.professionalTask !== "PRO-SKEL-001") {
    missing.push("professionalTask:PRO-SKEL-001");
  }
  if (proof.professionalStatus !== "pass") {
    missing.push("professionalStatus:pass");
  }
  if (proof.buildContinuation !== "allowed") {
    missing.push("buildContinuation:allowed");
  }
  if (proof.marketTask !== "PRO-SKEL-002") {
    missing.push("marketTask:PRO-SKEL-002");
  }
  if (proof.marketStatus !== "pass") {
    missing.push("marketStatus:pass");
  }
  if (proof.marketLearningUplift !== "ready") {
    missing.push("marketLearningUplift:ready");
  }
  if (proof.realisticTask !== "PRO-SKEL-003") {
    missing.push("realisticTask:PRO-SKEL-003");
  }
  if (proof.realisticStatus !== "pass") {
    missing.push("realisticStatus:pass");
  }
  if (proof.html.includes("nexus-live-build-preview")) {
    missing.push("fallbackPreview:absent");
  }
  if (/v0|Lovable|Bolt|Replit|Cursor|Framer|Wix/u.test(proof.text)) {
    missing.push("visibleCompetitorNames:absent");
  }
  if (/first artifact|nexus\.preview|PRO-SKEL|SLICE-|QA/u.test(proof.text)) {
    missing.push("visibleInternalSkeletonLanguage:absent");
  }
  return {
    key: testCase.key,
    screenshotPath,
    url: proof.url,
    productClass: proof.productClass,
    shellFamily: proof.shellFamily,
    professionalTask: proof.professionalTask,
    professionalStatus: proof.professionalStatus,
    professionalLevel: proof.professionalLevel,
    buildContinuation: proof.buildContinuation,
    marketTask: proof.marketTask,
    marketStatus: proof.marketStatus,
    marketLevel: proof.marketLevel,
    marketLearningUplift: proof.marketLearningUplift,
    realisticTask: proof.realisticTask,
    realisticStatus: proof.realisticStatus,
    realisticLevel: proof.realisticLevel,
    criterionCount: proof.criterionCount,
    marketCriterionCount: proof.marketCriterionCount,
    realisticCriterionCount: proof.realisticCriterionCount,
    textExcerpt: proof.text.slice(0, 1200),
    missing,
  };
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
    displayName: "בודק שלד מקצועי",
  });
  const proofs = [];
  try {
    for (const testCase of cases) {
      proofs.push(await inspectCase(page, testCase));
    }
    const failed = proofs.filter((proof) => proof.missing.length);
    const report = {
      ok: failed.length === 0,
      baseUrl,
      screenshotPrefix,
      proofs: proofs.map(({ html, ...proof }) => proof),
    };
    const reportPath = `${screenshotPrefix}-report.json`;
    await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify({ ...report, reportPath }, null, 2));
    if (failed.length) {
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
