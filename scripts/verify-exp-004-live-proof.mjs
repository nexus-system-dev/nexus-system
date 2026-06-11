import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const userId = process.env.NEXUS_LIVE_USER_ID ?? `exp004-user-${now}`;
const projectId = process.env.NEXUS_LIVE_PROJECT_ID ?? `exp004-live-${now}`;
const reportPath = process.env.NEXUS_EXP004_REPORT_PATH ?? `/private/tmp/nexus-exp-004-${now}-report.json`;
const screenshotPrefix = process.env.NEXUS_EXP004_SCREENSHOT_PREFIX ?? `/private/tmp/nexus-exp-004-${now}`;

const appUser = {
  userId,
  email: `${userId}@example.test`,
  displayName: "בודק שחרור",
};

async function apiJson(pathname, { method = "GET", body = null, headers = {} } = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-user-id": userId,
      ...headers,
    },
    body: body ? JSON.stringify(body) : null,
  });
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`API ${method} ${pathname} failed ${response.status}: ${text.slice(0, 800)}`);
  }
  return payload;
}

async function createProject() {
  await apiJson("/api/auth/signup", {
    method: "POST",
    body: {
      userInput: appUser,
      credentials: { password: "TestOnly123!" },
    },
  });

  await apiJson("/api/projects", {
    method: "POST",
    body: {
      id: projectId,
      name: "כלי ניהול לידים למסלול שחרור",
      goal: "כלי פנימי לניהול לידים עם סטטוס, אחראי, תזכורת וצעד הבא. צריך לראות אמת שחרור בלי להבטיח פרסום אמיתי.",
      artifactExpectation: {
        projectType: "internal tool",
        deliverableLabel: "כלי ניהול לידים עם מסלול שחרור",
      },
    },
  });
}

async function dumpReleaseState(page, label) {
  return page.evaluate((stateLabel) => {
    const root = document.querySelector("[data-release-surface-contract='SURF-004']");
    const attr = (name) => root?.getAttribute(name) ?? null;
    const text = document.body.innerText || "";
    return {
      label: stateLabel,
      url: location.href,
      screen: document.body.dataset.appScreen || "",
      contract: attr("data-release-surface-contract"),
      task: attr("data-release-framing-task"),
      boundary: attr("data-release-framing-boundary"),
      releaseClaim: attr("data-release-claim"),
      backendBoundary: attr("data-release-backend-boundary"),
      productPackageStatus: attr("data-release-product-package-status"),
      standaloneArtifactStatus: attr("data-release-standalone-artifact-status"),
      releaseWorkspace: attr("data-release-engine-release-workspace"),
      releaseableState: attr("data-release-engine-releaseable-state"),
      deploymentPath: attr("data-release-engine-deployment-path"),
      feedback: attr("data-release-engine-feedback"),
      publishDisabled: document.querySelector("[data-release-action='publish']")?.hasAttribute("disabled") ?? null,
      hasPackageBlocker: /חבילת מוצר עצמאית/u.test(text),
      hasStandaloneBlocker: /תוצר עצמאי/u.test(text),
      hasBackendBlocker: /שמירה מקומית\/מדומה/u.test(text),
      hasFakeReleaseClaim: /פורסם בהצלחה|קישור ציבורי|המוצר מוכן לשחרור עכשיו/u.test(text),
      hasInternalProviderCopy: /Provider:|Strategy:/u.test(text),
      hasRawReleaseBlocker: /launch-unconfirmed|production-health-unready|deployment-result-unready|release-workspace-blocked|release-event-\d+|generic-preview|generic-package|workspace-preview|workspace-package/u.test(text),
      excerpt: text.slice(0, 1600),
    };
  }, label);
}

function assertReleaseState(state) {
  const failures = [];
  if (state.contract !== "SURF-004") failures.push("missing SURF-004");
  if (state.task !== "EXP-004") failures.push("missing EXP-004");
  if (state.boundary !== "release-framing-not-release-execution") failures.push("missing release framing boundary");
  if (state.releaseClaim !== "blocked-before-release-claim") failures.push(`unexpected release claim ${state.releaseClaim}`);
  if (state.backendBoundary !== "local-mock-backend") failures.push(`unexpected backend boundary ${state.backendBoundary}`);
  if (state.productPackageStatus !== "missing") failures.push(`unexpected package status ${state.productPackageStatus}`);
  if (state.standaloneArtifactStatus !== "missing") failures.push(`unexpected artifact status ${state.standaloneArtifactStatus}`);
  if (state.releaseWorkspace !== "connected") failures.push("release workspace not connected");
  if (state.releaseableState !== "connected") failures.push("releaseable state not connected");
  if (state.deploymentPath !== "connected") failures.push("deployment path not connected");
  if (state.feedback !== "connected") failures.push("deployment feedback not connected");
  if (state.publishDisabled !== true) failures.push("publish action is not disabled");
  if (!state.hasPackageBlocker) failures.push("missing product package blocker");
  if (!state.hasStandaloneBlocker) failures.push("missing standalone artifact blocker");
  if (!state.hasBackendBlocker) failures.push("missing backend boundary blocker");
  if (state.hasFakeReleaseClaim) failures.push("fake release claim visible");
  if (state.hasInternalProviderCopy) failures.push("internal provider copy visible");
  if (state.hasRawReleaseBlocker) failures.push("raw release blocker visible");
  if (failures.length) {
    throw new Error(`${state.label} failed EXP-004 live proof: ${failures.join("; ")}\n${JSON.stringify(state, null, 2)}`);
  }
}

async function main() {
  await createProject();

  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    slowMo: Number(process.env.NEXUS_LIVE_SLOW_MO ?? 100),
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const events = [];

  page.on("response", (response) => {
    if (response.status() >= 400) {
      events.push({ kind: "response", status: response.status(), url: response.url() });
    }
  });
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      events.push({ kind: "console", type: message.type(), text: message.text() });
    }
  });

  await page.addInitScript((storedUser) => {
    localStorage.setItem("nexus.appUser", JSON.stringify(storedUser));
  }, appUser);

  await page.goto(`${baseUrl}/release?projectId=${encodeURIComponent(projectId)}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-release-framing-task='EXP-004']", { timeout: 20_000 });
  await page.waitForFunction(() => {
    const root = document.querySelector("[data-release-framing-task='EXP-004']");
    return root?.getAttribute("data-release-engine-release-workspace") === "connected"
      && root?.getAttribute("data-release-engine-releaseable-state") === "connected"
      && root?.getAttribute("data-release-engine-deployment-path") === "connected"
      && root?.getAttribute("data-release-engine-feedback") === "connected";
  }, { timeout: 20_000 });
  const initial = await dumpReleaseState(page, "initial");
  assertReleaseState(initial);
  await page.screenshot({ path: `${screenshotPrefix}-initial.png`, fullPage: true });

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-release-framing-task='EXP-004']", { timeout: 20_000 });
  await page.waitForFunction(() => {
    const root = document.querySelector("[data-release-framing-task='EXP-004']");
    return root?.getAttribute("data-release-engine-release-workspace") === "connected"
      && root?.getAttribute("data-release-engine-releaseable-state") === "connected"
      && root?.getAttribute("data-release-engine-deployment-path") === "connected"
      && root?.getAttribute("data-release-engine-feedback") === "connected";
  }, { timeout: 20_000 });
  const afterRefresh = await dumpReleaseState(page, "after-refresh");
  assertReleaseState(afterRefresh);
  await page.screenshot({ path: `${screenshotPrefix}-after-refresh.png`, fullPage: true });

  await browser.close();

  const restored = await apiJson(`/api/projects/${projectId}`);
  const project = restored.project ?? restored;
  const report = {
    taskId: "EXP-004",
    baseUrl,
    userId,
    projectId,
    reportPath,
    screenshots: {
      initial: `${screenshotPrefix}-initial.png`,
      afterRefresh: `${screenshotPrefix}-after-refresh.png`,
    },
    states: [initial, afterRefresh],
    projectTruth: {
      releaseWorkspaceId: project.releaseWorkspace?.workspaceId ?? project.context?.releaseWorkspace?.workspaceId ?? project.state?.releaseWorkspace?.workspaceId ?? null,
      releaseableState: project.releaseableProductStateContract?.stateFamily ?? project.context?.releaseableProductStateContract?.stateFamily ?? project.state?.releaseableProductStateContract?.stateFamily ?? null,
      deploymentPath: project.classAwareDeploymentReleasePath?.pathFamily ?? project.context?.classAwareDeploymentReleasePath?.pathFamily ?? project.state?.classAwareDeploymentReleasePath?.pathFamily ?? null,
      deploymentFeedback: project.deploymentStateFeedbackContract?.feedbackFamily ?? project.context?.deploymentStateFeedbackContract?.feedbackFamily ?? project.state?.deploymentStateFeedbackContract?.feedbackFamily ?? null,
      productionBackend: project.productOwnedBackendSkeleton?.productionBackend ?? project.context?.productOwnedBackendSkeleton?.productionBackend ?? project.state?.productOwnedBackendSkeleton?.productionBackend ?? null,
    },
    badEvents: events.filter((event) => {
      if (event.status === 404) return false;
      if (event.kind === "console" && /404|favicon|not found/i.test(event.text ?? "")) return false;
      return true;
    }),
  };

  if (
    typeof report.projectTruth.releaseWorkspaceId !== "string"
    || report.projectTruth.releaseableState !== "releaseable-product-state"
    || typeof report.projectTruth.deploymentPath !== "string"
    || report.projectTruth.deploymentFeedback !== "deployment-state-feedback"
    || report.projectTruth.productionBackend !== false
    || report.badEvents.length > 0
  ) {
    throw new Error(`EXP-004 backend truth failed: ${JSON.stringify(report, null, 2)}`);
  }

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
