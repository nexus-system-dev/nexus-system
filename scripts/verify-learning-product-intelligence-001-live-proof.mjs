import fs from "node:fs/promises";
import { chromium } from "playwright-core";
import { buildRuntimeSkeletonTruthEnvelope } from "../web/shared/runtime-skeleton-truth.js";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const screenshotPrefix = process.env.NEXUS_LEARNING_PRODUCT_SCREENSHOT_PREFIX
  ?? `/private/tmp/nexus-learning-product-intelligence-001-${now}`;
const liveUserId = `learning-product-user-${now}`;

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
        displayName: "בודק למידת מוצר",
      },
      credentials: { password: "TestOnly123!" },
    },
  });
}

async function ensureProject(projectId) {
  const project = {
    id: projectId,
    name: "סידור צורות",
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
    artifactExpectation: { title: "סידור צורות" },
    productSkeletonAgentOutput: {
      agentId: "product-skeleton-agent",
      productType: "כלי עבודה",
      primaryUser: "מעצב",
      primaryProblem: "צריך לסדר צורות ולראות שינוי על משטח",
      firstWorkflow: { title: "סידור צורות", steps: ["הוסף צורה", "בחר", "שנה"] },
      initialActions: ["הוסף צורה", "בחר"],
    },
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
        runtimeLearningDecisionHints: project.runtimeLearningDecisionHints,
        runtimeSkeletonTruth,
        productDomainSkeleton: runtimeSkeletonTruth.productDomainSkeleton,
      },
    },
  });
}

async function main() {
  await ensureUser();
  const projectId = `learning-product-editor-${now}`;
  await ensureProject(projectId);
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
    displayName: "בודק למידת מוצר",
  });

  const url = new URL("/loop", baseUrl);
  url.searchParams.set("projectId", projectId);
  await page.goto(url.toString(), { waitUntil: "networkidle", timeout: 30000 });
  await page.locator("[data-runtime-skeleton-task='SLICE-005']").waitFor({ timeout: 15000 });
  const screenshotPath = `${screenshotPrefix}-learning-applied.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  const proof = await page.evaluate(() => {
    const runtime = document.querySelector("[data-runtime-skeleton-task='SLICE-005']");
    return {
      url: location.href,
      productLearningTask: runtime?.getAttribute("data-product-learning-task") ?? null,
      productLearningStatus: runtime?.getAttribute("data-product-learning-status") ?? null,
      productLearningApplied: runtime?.getAttribute("data-product-learning-applied") ?? null,
      productLearningBoundary: runtime?.getAttribute("data-product-learning-boundary") ?? null,
      productPattern: runtime?.getAttribute("data-product-kind-pattern") ?? null,
      productClass: runtime?.getAttribute("data-runtime-product-class") ?? null,
      shellFamily: runtime?.getAttribute("data-runtime-shell-family") ?? null,
      domainKind: runtime?.getAttribute("data-product-domain-kind") ?? null,
      text: document.body.innerText,
    };
  });
  await browser.close();

  const missing = [];
  if (proof.productLearningTask !== "LEARNING-PRODUCT-INTELLIGENCE-001") missing.push("productLearningTask");
  if (proof.productLearningStatus !== "live") missing.push("productLearningStatus:live");
  if (proof.productLearningApplied !== "true") missing.push("productLearningApplied:true");
  if (proof.productPattern !== "editor-canvas") missing.push("productPattern:editor-canvas");
  if (proof.shellFamily !== "editor-canvas-shell") missing.push("shellFamily:editor-canvas-shell");
  if (proof.domainKind !== "editor-document-local-state") missing.push("domainKind:editor-document-local-state");
  if (!/does-not-overwrite-project-truth/u.test(proof.productLearningBoundary ?? "")) missing.push("truthBoundary");
  if (/LEARNING-PRODUCT-INTELLIGENCE|PRODUCT-KIND|SLICE-|QA/u.test(proof.text)) missing.push("visibleInternalTaskLanguage:absent");

  const report = {
    ok: missing.length === 0,
    baseUrl,
    projectId,
    screenshotPath,
    proof,
    missing,
  };
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
