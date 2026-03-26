function trimSlash(value) {
  return typeof value === "string" ? value.replace(/\/+$/, "") : value;
}

export class RuntimeSourcesConnector {
  constructor({ fetchImpl = globalThis.fetch } = {}) {
    this.fetchImpl = fetchImpl;
  }

  async fetchJson(url, options = {}) {
    const response = await this.fetchImpl(url, options);
    if (!response.ok) {
      throw new Error(`Runtime sources request failed: ${response.status}`);
    }

    return response.json();
  }

  async fetchSnapshot({ baseUrl, apiKey }) {
    const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
    const root = trimSlash(baseUrl);
    const endpoints = [
      ["ci", "ci"],
      ["test-results", "testResults"],
      ["deployments", "deployments"],
      ["error-logs", "errorLogs"],
      ["monitoring", "monitoring"],
      ["analytics", "analytics"],
      ["product-metrics", "productMetrics"],
    ];

    const responses = await Promise.all(
      endpoints.map(async ([endpoint, key]) => [
        key,
        await this.fetchJson(`${root}/${endpoint}`, { headers }),
      ]),
    );

    return {
      syncedAt: new Date().toISOString(),
      ...Object.fromEntries(responses),
    };
  }
}
