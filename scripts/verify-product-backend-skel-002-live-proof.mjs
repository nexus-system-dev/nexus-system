import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const projectId = `product-backend-skel-002-live-${Date.now()}`;
const email = `${projectId}@nexus.local`;
const password = "ProductBackendSkel002!";

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  return { response, body };
}

const signup = await request("/api/auth/signup", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    userInput: { name: "Product Backend Proof", email },
    credentials: { password },
  }),
});
assert.equal(signup.response.status, 201, JSON.stringify(signup.body));
const userId = signup.body.authPayload?.userIdentity?.userId;
assert.ok(userId, "signup should return a user id");

const create = await request("/api/projects", {
  method: "POST",
  headers: { "content-type": "application/json", "x-user-id": userId },
  body: JSON.stringify({
    id: projectId,
    name: "ניהול לידים עם צד אחורי מוצרי",
    goal: "בעל עסק קטן צריך כלי פנימי ללידים עם סטטוס, אחראי, תזכורת וצעד הבא.",
    state: {
      artifactExpectation: { projectType: "internal-tool", title: "ניהול לידים", summary: "כלי עבודה ללידים" },
      productSkeletonAgentOutput: {
        productType: "כלי פנימי לניהול לידים",
        primaryUser: "בעל עסק קטן",
        primaryProblem: "לידים נופלים בלי אחראי ותזכורת",
        dataObjects: [{ name: "Lead", fields: ["name", "status", "owner", "reminder", "nextStep"] }],
        initialActions: ["הוסף ליד", "עדכן סטטוס", "שייך אחראי"],
        firstWorkflow: { title: "ניהול לידים יומי", whyThisFirst: "לכל ליד צריך להיות אחראי וצעד הבא" },
        versionOneBoundary: { buildNow: ["רשימת לידים", "אחראי", "תזכורת"], doNotBuildNow: ["וואטסאפ אמיתי"] },
      },
    },
  }),
});
assert.equal(create.response.status, 201, JSON.stringify(create.body));

const mutation = await request(`/api/projects/${projectId}/build-mutations`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-user-id": userId },
  body: JSON.stringify({
    requestText: "תוסיף שדה מקור ליד",
    operationId: "record.addField",
    payload: { fieldName: "מקור ליד", defaultValue: "לא סומן" },
    requestedBy: "product-backend-skel-002-live-proof",
  }),
});
assert.equal(mutation.response.status, 200, JSON.stringify(mutation.body));
assert.equal(mutation.body.project.productOwnedBackendSkeleton.taskId, "PRODUCT-BACKEND-SKEL-002");
assert.equal(
  mutation.body.project.productOwnedBackendSkeleton.models
    .find((model) => model.name === "Record")
    .fields
    .some((field) => field.name === "מקור ליד"),
  true,
);
assert.equal(mutation.body.project.productOwnedBackendSkeleton.persistence.state.records[0]["מקור ליד"], "לא סומן");
assert.equal(mutation.body.project.buildMutationHistory.at(-1).affectedAreas.includes("product-owned-backend-skeleton"), true);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1365, height: 820 } });
await page.setExtraHTTPHeaders({ "x-user-id": userId });
await page.goto(`${baseUrl}/loop?projectId=${projectId}`, { waitUntil: "domcontentloaded", timeout: 15000 });
await page.waitForSelector("[data-product-owned-backend-task='PRODUCT-BACKEND-SKEL-002']", { timeout: 15000 });
await page.reload({ waitUntil: "domcontentloaded", timeout: 15000 });
await page.waitForSelector("[data-product-owned-backend-pairing='paired-from-first-skeleton']", { timeout: 15000 });
const evidence = await page.locator("[data-runtime-skeleton-task='SLICE-005']").evaluate((node) => ({
  url: location.href,
  projectId: node.getAttribute("data-runtime-project-id"),
  runtimeSkeletonId: node.getAttribute("data-runtime-skeleton-id"),
  productOwnedBackendTask: node.getAttribute("data-product-owned-backend-task"),
  productOwnedBackendId: node.getAttribute("data-product-owned-backend-skeleton-id"),
  productOwnedBackendPairing: node.getAttribute("data-product-owned-backend-pairing"),
  productOwnedBackendRoot: node.getAttribute("data-product-owned-backend-root"),
  mutationOperation: node.getAttribute("data-build-mutation-operation"),
}));
await browser.close();

assert.equal(evidence.projectId, projectId);
assert.equal(evidence.productOwnedBackendTask, "PRODUCT-BACKEND-SKEL-002");
assert.equal(evidence.productOwnedBackendPairing, "paired-from-first-skeleton");
assert.equal(evidence.mutationOperation, "record.addField");

console.log(JSON.stringify({
  ok: true,
  baseUrl,
  projectId,
  evidence,
}, null, 2));
