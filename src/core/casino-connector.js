export class CasinoDiagnosticsConnector {
  constructor({ fetchImpl = globalThis.fetch } = {}) {
    this.fetchImpl = fetchImpl;
  }

  async fetchJson(url, options = {}) {
    const response = await this.fetchImpl(url, options);
    if (!response.ok) {
      throw new Error(`Casino diagnostics request failed: ${response.status}`);
    }

    return response.json();
  }

  async fetchSnapshot({ baseUrl, apiKey }) {
    const headers = apiKey ? { "x-nexus-key": apiKey } : {};
    const endpoints = [
      "health",
      "features",
      "flows",
      "technical",
      "roadmap-context",
    ];

    const responses = await Promise.all(
      endpoints.map((endpoint) =>
        this.fetchJson(`${baseUrl}/api/nexus/${endpoint}`, {
          headers,
        }),
      ),
    );

    const [health, features, flows, technical, roadmapContext] = responses;
    return {
      health,
      features,
      flows,
      technical,
      roadmapContext,
    };
  }

}
