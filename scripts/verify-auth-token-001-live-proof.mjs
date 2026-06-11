const baseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:4011";
const now = Date.now();
const ownerId = `auth-token-owner-${now}`;
const outsiderId = `auth-token-outsider-${now}`;
const projectId = `auth-token-project-${now}`;

async function apiJson(path, {
  method = "GET",
  token = null,
  headers = {},
  body = null,
  expected = null,
} = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => null);
  if (expected && response.status !== expected) {
    throw new Error(`${method} ${path} expected ${expected}, got ${response.status}: ${JSON.stringify(payload)}`);
  }
  return {
    status: response.status,
    headers: response.headers,
    payload,
  };
}

async function signup(userId) {
  const result = await apiJson("/api/auth/signup", {
    method: "POST",
    expected: 201,
    body: {
      userInput: {
        userId,
        email: `${userId}@example.test`,
        displayName: userId,
      },
      credentials: {
        password: `secret-${now}`,
      },
    },
  });
  const token = result.payload?.authPayload?.tokenBundle?.accessToken;
  if (!token) {
    throw new Error(`Signup did not return access token for ${userId}`);
  }
  return {
    token,
    cookie: result.headers.get("set-cookie"),
    payload: result.payload,
  };
}

async function checkLiveEvents({ token, expected }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1200);
  try {
    const response = await fetch(`${baseUrl}/api/projects/${projectId}/live-events`, {
      headers: token ? { cookie: `nexus_access_token=${encodeURIComponent(token)}` } : {},
      signal: controller.signal,
    });
    if (response.status !== expected) {
      const payload = await response.text().catch(() => "");
      throw new Error(`live-events expected ${expected}, got ${response.status}: ${payload.slice(0, 500)}`);
    }
    return { status: response.status, contentType: response.headers.get("content-type") };
  } finally {
    clearTimeout(timeout);
    controller.abort();
  }
}

const owner = await signup(ownerId);
const outsider = await signup(outsiderId);

await apiJson("/api/projects", {
  method: "POST",
  token: owner.token,
  expected: 201,
  body: {
    id: projectId,
    name: "AUTH-TOKEN-001 Live Project",
    goal: "Prove server verified session identity",
  },
});

const ownerRead = await apiJson(`/api/projects/${projectId}`, {
  token: owner.token,
  headers: { "x-user-id": outsiderId },
  expected: 200,
});
if (ownerRead.payload?.userId !== ownerId) {
  throw new Error(`Owner read did not preserve verified owner identity: ${JSON.stringify(ownerRead.payload?.userId)}`);
}

const forgedHeaderOnly = await apiJson(`/api/projects/${projectId}`, {
  headers: { "x-user-id": ownerId },
  expected: 401,
});
if (forgedHeaderOnly.payload?.reason !== "authentication-required") {
  throw new Error(`Forged header did not fail as authentication-required: ${JSON.stringify(forgedHeaderOnly.payload)}`);
}

await apiJson(`/api/projects/${projectId}`, {
  token: outsider.token,
  expected: 404,
});

const liveQueryOnly = await fetch(`${baseUrl}/api/projects/${projectId}/live-events?userId=${encodeURIComponent(ownerId)}`);
if (liveQueryOnly.status !== 401) {
  throw new Error(`live-events query userId expected 401, got ${liveQueryOnly.status}`);
}

const liveCookie = await checkLiveEvents({ token: owner.token, expected: 200 });
if (!String(liveCookie.contentType ?? "").includes("text/event-stream")) {
  throw new Error(`live-events cookie auth did not return SSE content type: ${liveCookie.contentType}`);
}

await apiJson("/api/account/actions", {
  method: "POST",
  token: owner.token,
  expected: 200,
  body: {
    actionType: "logout-all",
  },
});

const revokedRead = await apiJson(`/api/projects/${projectId}`, {
  token: owner.token,
  expected: 401,
});
if (revokedRead.payload?.reason !== "authentication-required") {
  throw new Error(`Revoked token did not fail closed: ${JSON.stringify(revokedRead.payload)}`);
}

const report = {
  taskId: "AUTH-TOKEN-001",
  baseUrl,
  projectId,
  ownerId,
  outsiderId,
  ownerCookieSet: Boolean(owner.cookie),
  checks: {
    projectCreatedWithVerifiedToken: true,
    forgedHeaderRejected: true,
    verifiedTokenBeatsForgedHeader: true,
    outsiderCannotReadProject: true,
    liveEventsRejectUserIdQuery: true,
    liveEventsAcceptCookieSession: true,
    revokedTokenFailsClosed: true,
  },
};

console.log(`AUTH-TOKEN-001 live proof passed. ${JSON.stringify(report, null, 2)}`);
