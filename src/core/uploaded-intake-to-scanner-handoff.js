import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { scanProject } from "./project-scanner.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function slugify(value, fallback = "project") {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;
}

function safeSegment(value, fallback) {
  const segment = String(value ?? "")
    .trim()
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .map((item) => item.replace(/[^a-zA-Z0-9._-]+/g, "-"))
    .filter(Boolean)
    .slice(-3);

  return segment.length > 0 ? segment : [fallback];
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function buildReadme(projectIntake, connectedSources) {
  const intake = normalizeObject(projectIntake);
  const sources = normalizeObject(connectedSources);
  const repo = normalizeObject(sources.repo);
  const sections = [
    "# Imported Project Intake",
    "",
    intake.projectName ? `Project name: ${intake.projectName}` : null,
    intake.projectType ? `Project type: ${intake.projectType}` : null,
    intake.visionText ? `## Vision\n${intake.visionText}` : null,
    normalizeArray(intake.requestedDeliverables).length > 0
      ? `## Requested deliverables\n${normalizeArray(intake.requestedDeliverables).map((item) => `- ${item}`).join("\n")}`
      : null,
    normalizeArray(intake.externalLinks).length > 0
      ? `## External links\n${normalizeArray(intake.externalLinks).map((item) => `- ${item}`).join("\n")}`
      : null,
    repo.repoUrl ? `## Connected repository\n- provider: ${repo.provider ?? "unknown"}\n- url: ${repo.repoUrl}` : null,
  ].filter(Boolean);

  return `${sections.join("\n")}\n`;
}

function materializeUploadedFiles(rootPath, uploadedFiles) {
  for (const [index, rawFile] of normalizeArray(uploadedFiles).entries()) {
    const file = normalizeObject(rawFile);
    const fallbackName = `attachment-${index + 1}.txt`;
    const segments = safeSegment(file.name, fallbackName);
    const rootedSegments =
      ["docs", "documentation"].includes(String(segments[0]).toLowerCase())
        ? segments
        : ["docs", ...segments];
    const targetPath = path.join(rootPath, ...rootedSegments);
    ensureParent(targetPath);
    fs.writeFileSync(targetPath, typeof file.content === "string" ? file.content : "", "utf8");
  }
}

function materializeExternalLinks(rootPath, externalLinks, connectedSources) {
  const lines = [];

  for (const link of normalizeArray(externalLinks)) {
    if (typeof link === "string" && link.trim()) {
      lines.push(`- ${link.trim()}`);
    }
  }

  const repo = normalizeObject(normalizeObject(connectedSources).repo);
  if (repo.repoUrl) {
    lines.push(`- ${repo.repoUrl}`);
  }

  if (lines.length === 0) {
    return;
  }

  const targetPath = path.join(rootPath, "docs", "external-links.md");
  ensureParent(targetPath);
  fs.writeFileSync(targetPath, `# External Links\n\n${lines.join("\n")}\n`, "utf8");
}

export function createUploadedIntakeToScannerHandoff({
  projectId = null,
  projectIntake = null,
  connectedSources = null,
  gitSnapshot = null,
  notionSnapshot = null,
} = {}) {
  const intake = normalizeObject(projectIntake);
  const handoffId = `uploaded-intake-handoff:${slugify(projectId, "project")}`;
  const uploadedFiles = normalizeArray(intake.uploadedFiles);
  const externalLinks = normalizeArray(intake.externalLinks);
  const hasMaterials = uploadedFiles.length > 0 || externalLinks.length > 0 || normalizeObject(connectedSources).repo?.repoUrl;

  if (!hasMaterials) {
    return {
      handoffId,
      status: "not-required",
      projectId: projectId ?? null,
      scanRoot: null,
      scan: null,
      importedArtifacts: 0,
    };
  }

  const scanRoot = path.join(os.tmpdir(), "nexus-uploaded-intake-scans", slugify(projectId, "project"));
  fs.rmSync(scanRoot, { recursive: true, force: true });
  fs.mkdirSync(scanRoot, { recursive: true });

  fs.writeFileSync(path.join(scanRoot, "README.md"), buildReadme(intake, connectedSources), "utf8");
  materializeUploadedFiles(scanRoot, uploadedFiles);
  materializeExternalLinks(scanRoot, externalLinks, connectedSources);

  const scan = scanProject(scanRoot, {
    gitSnapshot,
    notionSnapshot,
  });

  return {
    handoffId,
    status: "ready",
    projectId: projectId ?? null,
    scanRoot,
    scan,
    importedArtifacts: uploadedFiles.length + externalLinks.length,
  };
}
