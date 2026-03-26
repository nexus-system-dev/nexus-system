import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";

import { createServer } from "../src/server.js";

function requestJson(server, pathname) {
  return new Promise((resolve, reject) => {
    const request = new EventEmitter();
    request.method = "GET";
    request.url = pathname;

    const response = {
      statusCode: 200,
      headers: {},
      writeHead(statusCode, headers) {
        this.statusCode = statusCode;
        this.headers = headers;
      },
      end(body) {
        try {
          resolve({
            statusCode: this.statusCode,
            body: JSON.parse(body),
          });
        } catch (error) {
          reject(error);
        }
      },
    };

    server.emit("request", request, response);
  });
}

test("server exposes health and readiness endpoints", async () => {
  const server = createServer(
    {
      listProjects: () => [],
    },
    {
      healthStatus: {
        status: "healthy",
        isHealthy: true,
      },
      readinessStatus: {
        status: "ready",
        isReady: true,
      },
    },
  );
  const healthResponse = await requestJson(server, "/api/health");
  const readinessResponse = await requestJson(server, "/api/readiness");

  assert.equal(healthResponse.statusCode, 200);
  assert.equal(healthResponse.body.healthStatus.status, "healthy");
  assert.equal(readinessResponse.statusCode, 200);
  assert.equal(readinessResponse.body.readinessStatus.status, "ready");
});
