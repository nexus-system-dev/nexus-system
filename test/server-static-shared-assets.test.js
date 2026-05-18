import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";

import { createServer } from "../src/server.js";

function requestText(server, pathname, options = {}) {
  return new Promise((resolve) => {
    const request = new EventEmitter();
    request.method = options.method ?? "GET";
    request.url = pathname;
    request.headers = options.headers ?? {};
    request.socket = {
      remoteAddress: options.ipAddress ?? "127.0.0.1",
    };

    let body = "";
    const response = {
      statusCode: 200,
      headers: {},
      writeHead(statusCode, headers) {
        this.statusCode = statusCode;
        this.headers = headers;
      },
      write(chunk) {
        body += chunk;
      },
      end(chunk = "") {
        body += chunk;
        resolve({
          statusCode: this.statusCode,
          headers: this.headers,
          body,
        });
      },
    };

    server.emit("request", request, response);
  });
}

test("server exposes shared browser modules used by app bootstrap", async () => {
  const server = createServer({
    listProjects: () => [],
  });

  const response = await requestText(server, "/shared/product-class-model.js");

  assert.equal(response.statusCode, 200);
  assert.match(response.body, /export function resolveCanonicalProductClass/);
});

test("server returns 404 for missing shared assets", async () => {
  const server = createServer({
    listProjects: () => [],
  });

  const response = await requestText(server, "/shared/does-not-exist.js");

  assert.equal(response.statusCode, 404);
  assert.match(response.body, /Not found/);
});
