import { chromium } from "playwright-core";

const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const ownerId = `prov-browser-owner-${now}`;
const projectId = `prov-browser-project-${now}`;

async function apiJson(path, {
  method = "GET",
  token = null,
  body = null,
  expected = null,
} = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => null);
  if (expected && response.status !== expected) {
    throw new Error(`${method} ${path} expected ${expected}, got ${response.status}: ${JSON.stringify(payload)}`);
  }
  return { response, payload };
}

const signup = await apiJson("/api/auth/signup", {
  method: "POST",
  expected: 201,
  body: {
    userInput: {
      userId: ownerId,
      email: `${ownerId}@example.test`,
      displayName: ownerId,
    },
    credentials: {
      password: `secret-${now}`,
    },
  },
});
const token = signup.payload?.authPayload?.tokenBundle?.accessToken;
if (!token) {
  throw new Error("Signup did not return access token.");
}
const appUser = {
  email: `${ownerId}@example.test`,
  password: `secret-${now}`,
  userId: signup.payload?.authPayload?.userIdentity?.userId ?? ownerId,
  displayName: signup.payload?.authPayload?.userIdentity?.displayName ?? ownerId,
  tokenBundle: signup.payload?.authPayload?.tokenBundle ?? null,
  sessionState: signup.payload?.authPayload?.sessionState ?? null,
};

await apiJson("/api/projects", {
  method: "POST",
  token,
  expected: 201,
  body: {
    id: projectId,
    name: "PROV-001 Browser Project",
    goal: "כלי ניהול לידים שצריך חסם לספקים חיצוניים",
  },
});

await apiJson(`/api/projects/${projectId}/provider-gateway/evaluate`, {
  method: "POST",
  token,
  expected: 200,
  body: {
    requestText: "תחבר סליקה ותפרסם קמפיין",
  },
});

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 1365, height: 768 } });
await context.addInitScript((storedUser) => {
  window.localStorage.setItem("nexus.appUser", JSON.stringify(storedUser));
}, appUser);
await context.addCookies([
  {
    name: "nexus_access_token",
    value: token,
    url: baseUrl,
    httpOnly: true,
    sameSite: "Lax",
  },
]);
const page = await context.newPage();
await page.goto(`${baseUrl}/loop?projectId=${encodeURIComponent(projectId)}`, {
  waitUntil: "domcontentloaded",
  timeout: 15000,
});
try {
  await page.waitForSelector('[data-provider-gateway-task="PROV-001"]', { timeout: 10000 });
} catch (error) {
  const diagnostics = await page.evaluate(() => ({
    url: location.href,
    title: document.title,
    bodyText: document.body?.innerText?.slice(0, 2000) ?? "",
    hasLoop: Boolean(document.querySelector('[data-screen="loop"], [data-build-region]')),
    appScreen: document.body?.dataset?.appScreen ?? null,
    providerGatewayCount: document.querySelectorAll('[data-provider-gateway-task]').length,
  }));
  throw new Error(`Provider gateway selector missing: ${JSON.stringify(diagnostics)}`);
}
const proof = await page.locator('[data-provider-gateway-task="PROV-001"]').evaluate((node) => ({
  task: node.getAttribute("data-provider-gateway-task"),
  status: node.getAttribute("data-provider-gateway-status"),
  canExecute: node.getAttribute("data-provider-gateway-can-execute"),
  connected: node.getAttribute("data-provider-gateway-connected"),
  text: node.textContent,
}));
await browser.close();

if (proof.task !== "PROV-001" || proof.canExecute !== "false") {
  throw new Error(`Browser proof did not show bounded provider gateway: ${JSON.stringify(proof)}`);
}
if (/stripe|providerSession|providerId/i.test(proof.text ?? "")) {
  throw new Error(`Browser proof leaked provider plumbing: ${JSON.stringify(proof)}`);
}

console.log(`PROV-001 browser proof passed. ${JSON.stringify({
  taskId: "PROV-001",
  baseUrl,
  projectId,
  ownerId,
  proof,
}, null, 2)}`);
