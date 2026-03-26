function trimSlash(value) {
  return typeof value === "string" ? value.replace(/\/+$/, "") : value;
}

function extractRichText(parts = []) {
  return parts.map((part) => part.plain_text ?? "").join("").trim();
}

function blockToText(block) {
  const value = Object.values(block).find((candidate) => candidate?.rich_text);
  return value ? extractRichText(value.rich_text) : "";
}

function normalizePage(page, blocks = []) {
  const titleProperty = Object.values(page.properties ?? {}).find((property) => property.type === "title");
  const title = titleProperty ? extractRichText(titleProperty.title ?? []) : page.id;
  const lines = blocks.map((block) => blockToText(block)).filter(Boolean);

  return {
    id: page.id,
    title,
    url: page.url ?? null,
    excerpt: lines.join("\n").slice(0, 4000),
    missingSignals: lines
      .filter((line) => /(?:todo|missing|later|next|חסר|צריך|להוסיף)/i.test(line))
      .slice(0, 12),
  };
}

export class NotionConnector {
  constructor({ fetchImpl = globalThis.fetch } = {}) {
    this.fetchImpl = fetchImpl;
  }

  async fetchJson(url, options = {}) {
    const response = await this.fetchImpl(url, options);
    if (!response.ok) {
      throw new Error(`Notion request failed: ${response.status}`);
    }

    return response.json();
  }

  buildHeaders(apiKey) {
    return {
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
      Authorization: `Bearer ${apiKey}`,
    };
  }

  async fetchPageBlocks({ baseUrl, apiKey, pageId }) {
    const headers = this.buildHeaders(apiKey);
    return this.fetchJson(`${trimSlash(baseUrl)}/blocks/${pageId}/children?page_size=100`, { headers });
  }

  async fetchPage({ baseUrl, apiKey, pageId }) {
    const headers = this.buildHeaders(apiKey);
    return this.fetchJson(`${trimSlash(baseUrl)}/pages/${pageId}`, { headers });
  }

  async fetchSnapshot({ apiKey, pageIds = [], host = "https://api.notion.com/v1" }) {
    const pages = await Promise.all(
      pageIds.map(async (pageId) => {
        const [page, blocksPayload] = await Promise.all([
          this.fetchPage({ baseUrl: host, apiKey, pageId }),
          this.fetchPageBlocks({ baseUrl: host, apiKey, pageId }),
        ]);
        return normalizePage(page, blocksPayload.results ?? []);
      }),
    );

    return {
      source: "notion",
      syncedAt: new Date().toISOString(),
      pages,
    };
  }
}
