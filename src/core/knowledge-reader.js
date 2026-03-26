import fs from "node:fs";
import path from "node:path";

const MARKDOWN_EXTENSIONS = new Set([".md", ".mdx"]);
const MAX_DOCUMENT_CHARS = 4000;

function safeReadText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function listKnowledgeFiles(rootPath, maxDepth = 4, currentDepth = 0) {
  if (!fs.existsSync(rootPath) || currentDepth > maxDepth) {
    return [];
  }

  const entries = fs.readdirSync(rootPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (["node_modules", ".git", "dist", "build", ".next"].includes(entry.name)) {
      continue;
    }

    const fullPath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...listKnowledgeFiles(fullPath, maxDepth, currentDepth + 1));
      continue;
    }

    if (MARKDOWN_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractHeadings(content) {
  return [...content.matchAll(/^#{1,3}\s+(.+)$/gm)].map((match) => match[1].trim()).slice(0, 12);
}

function extractMissingSignals(content) {
  return [...content.matchAll(/(?:todo|missing|later|next|חסר|צריך|להוסיף)\s*[:\-]?\s*(.+)$/gim)]
    .map((match) => match[1].trim())
    .filter(Boolean)
    .slice(0, 12);
}

function createDocumentRecord(rootPath, filePath, type) {
  const content = safeReadText(filePath);
  return {
    path: path.relative(rootPath, filePath),
    type,
    title: path.basename(filePath),
    headings: extractHeadings(content),
    excerpt: content.slice(0, MAX_DOCUMENT_CHARS),
    missingSignals: extractMissingSignals(content),
  };
}

function createExternalDocumentRecord(document, type) {
  return {
    path: document.path ?? document.url ?? document.id ?? type,
    type,
    title: document.title ?? document.pullRequestTitle ?? document.id ?? type,
    headings: document.headings ?? [],
    excerpt: (document.excerpt ?? document.body ?? "").slice(0, MAX_DOCUMENT_CHARS),
    missingSignals: document.missingSignals ?? extractMissingSignals(document.body ?? document.excerpt ?? ""),
  };
}

export function readProjectKnowledge(projectPath, options = {}) {
  const prDiscussions = options.gitSnapshot?.prDiscussions ?? [];
  const notionPages = options.notionSnapshot?.pages ?? [];

  if (!fs.existsSync(projectPath)) {
    return {
      readme: null,
      docs: [],
      integrations: {
        prDiscussions: {
          status: prDiscussions.length > 0 ? "connected" : "not-connected",
          source: "pr-discussions",
          count: prDiscussions.length,
        },
        notion: {
          status: notionPages.length > 0 ? "connected" : "not-connected",
          source: "notion",
          count: notionPages.length,
        },
      },
      summary: null,
      knownMissingParts: [],
      prDiscussions: prDiscussions.map((discussion) => createExternalDocumentRecord(discussion, "pr-discussion")),
      notionPages: notionPages.map((page) => createExternalDocumentRecord(page, "notion-page")),
    };
  }

  const allMarkdown = listKnowledgeFiles(projectPath);
  const readmePath = allMarkdown.find((filePath) => /^readme\.mdx?$/i.test(path.basename(filePath)));
  const docsPaths = allMarkdown.filter(
    (filePath) =>
      filePath !== readmePath &&
      (filePath.toLowerCase().includes(`${path.sep}docs${path.sep}`) ||
        filePath.toLowerCase().includes(`${path.sep}documentation${path.sep}`)),
  );

  const readme = readmePath ? createDocumentRecord(projectPath, readmePath, "readme") : null;
  const docs = docsPaths.slice(0, 10).map((filePath) => createDocumentRecord(projectPath, filePath, "doc"));
  const discussionDocs = prDiscussions.map((discussion) => createExternalDocumentRecord(discussion, "pr-discussion"));
  const notionDocs = notionPages.map((page) => createExternalDocumentRecord(page, "notion-page"));
  const knownMissingParts = [
    ...new Set([
      ...(readme?.missingSignals ?? []),
      ...docs.flatMap((doc) => doc.missingSignals),
      ...discussionDocs.flatMap((doc) => doc.missingSignals),
      ...notionDocs.flatMap((doc) => doc.missingSignals),
    ]),
  ];

  const summaryParts = [
    readme ? `README: ${readme.headings.slice(0, 3).join(" | ")}` : null,
    docs.length ? `Docs: ${docs.map((doc) => doc.title).join(", ")}` : null,
    discussionDocs.length ? `PR: ${discussionDocs.length} דיונים` : null,
    notionDocs.length ? `Notion: ${notionDocs.map((doc) => doc.title).join(", ")}` : null,
  ].filter(Boolean);

  return {
    readme,
    docs,
    integrations: {
      prDiscussions: {
        status: discussionDocs.length > 0 ? "connected" : "not-connected",
        source: "pr-discussions",
        count: discussionDocs.length,
      },
      notion: {
        status: notionDocs.length > 0 ? "connected" : "not-connected",
        source: "notion",
        count: notionDocs.length,
      },
    },
    summary: summaryParts.join(" || ") || null,
    knownMissingParts,
    prDiscussions: discussionDocs,
    notionPages: notionDocs,
  };
}
