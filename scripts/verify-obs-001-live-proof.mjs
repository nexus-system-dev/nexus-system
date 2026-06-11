import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createServer } from "../src/server.js";
import { ProjectService } from "../src/core/project-service.js";

const port = Number.parseInt(process.env.PORT ?? "4021", 10);
const baseUrl = `http://127.0.0.1:${port}`;

function assertNoSensitiveObservabilityLeak(observability) {
  const serialized = JSON.stringify(observability);
  assert.equal(serialized.includes("obs-live-token"), false);
  assert.equal(serialized.includes("nexus_access_token=obs-live-token"), false);
}

async function requestJson(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  const body = await response.json();
  return { response, body };
}

async function main() {
  const proofRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-obs-001-"));
  const projectService = new ProjectService({
    eventLogPath: path.join(proofRoot, "events.ndjson"),
  });
  const server = createServer(projectService, {
    runtimeId: "obs-001-live-proof",
    healthStatus: { status: "healthy" },
    readinessStatus: { status: "ready" },
  });

  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

  try {
    const signup = await requestJson("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userInput: {
          email: `obs-${Date.now()}@nexus.local`,
          displayName: "OBS proof user",
        },
        credentials: {
          password: "nexus-observability-proof",
        },
      }),
    });
    assert.equal(signup.response.status, 201);
    const token = signup.body.authPayload.tokenBundle.accessToken;
    assert.equal(typeof token, "string");

    const projectId = `obs-proof-${Date.now()}`;
    const created = await requestJson("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: projectId,
        name: "OBS proof project",
        goal: "Build a small internal tool and verify live diagnostics.",
      }),
    });
    assert.equal(created.response.status, 201);
    assert.equal(created.body.id, projectId);

    const queryOnly = await fetch(`${baseUrl}/api/projects/${projectId}/live-events?userId=${signup.body.authPayload.userIdentity.userId}`);
    assert.equal(queryOnly.status, 401);
    const queryOnlyBody = await queryOnly.json();
    assert.equal(queryOnlyBody.reason, "authentication-required");

    const liveEvents = await fetch(`${baseUrl}/api/projects/${projectId}/live-events`, {
      headers: {
        cookie: `nexus_access_token=${encodeURIComponent(token)}`,
      },
    });
    assert.equal(liveEvents.status, 200);
    assert.match(liveEvents.headers.get("content-type") ?? "", /text\/event-stream/);
    await liveEvents.body?.cancel?.();

    const observability = await requestJson("/api/observability");
    assert.equal(observability.response.status, 200);
    assert.equal(observability.body.runtimeId, "obs-001-live-proof");
    assert.equal(observability.body.observability.summary.totalTraces > 0, true);
    assertNoSensitiveObservabilityLeak(observability.body.observability);

    console.log(JSON.stringify({
      taskId: "OBS-001",
      status: "passed",
      projectId,
      liveEventsStatus: liveEvents.status,
      queryUserIdStatus: queryOnly.status,
      traceCount: observability.body.observability.summary.totalTraces,
    }, null, 2));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
