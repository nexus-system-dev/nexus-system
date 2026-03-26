import { createDomainRegistry } from "./domain-registry.js";

const DOMAIN_KEYWORDS = {
  casino: ["casino", "wallet", "treasury", "bonus", "game", "games", "payments", "קזינו", "ארנק", "בונוס"],
  saas: ["saas", "subscription", "billing", "activation", "onboarding", "mvp", "platform", "מנוי"],
  "mobile-app": [
    "mobile app",
    "react native",
    "expo",
    "ios",
    "android",
    "app store",
    "play store",
    "אפליקציה",
  ],
  "agency-system": ["agency", "client", "clients", "reporting", "freelancer", "projects", "סוכנות", "לקוחות"],
  book: ["book", "ebook", "chapter", "chapters", "manuscript", "ספר", "פרק"],
  "content-product": ["course", "workshop", "module", "modules", "lesson", "content product", "קורס", "שיעור"],
};

function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function flattenText(values = []) {
  return values
    .flat(Infinity)
    .map((value) => toText(value))
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function scoreKeywordMatches(text, keywords = []) {
  return keywords.reduce((score, keyword) => (text.includes(keyword.toLowerCase()) ? score + 0.14 : score), 0);
}

function normalizeConfidence(value) {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

export function classifyProjectDomain({
  projectIntake = null,
  scan = null,
  knowledge = null,
  externalSources = null,
  goal = "",
  domainRegistry = createDomainRegistry(),
} = {}) {
  const intakeType = projectIntake?.projectType ?? "unknown";
  const sourceType = externalSources?.source ?? externalSources?.type ?? null;
  const textCorpus = flattenText([
    goal,
    projectIntake?.visionText,
    projectIntake?.requestedDeliverables ?? [],
    scan?.stack?.frontend ?? [],
    scan?.stack?.backend ?? [],
    scan?.stack?.database ?? [],
    scan?.gaps ?? [],
    knowledge?.summary,
    knowledge?.readme?.excerpt,
    (knowledge?.docs ?? []).map((doc) => [doc.path, doc.excerpt]),
    (knowledge?.prDiscussions ?? []).map((discussion) => [discussion.title, discussion.excerpt]),
    (knowledge?.notionPages ?? []).map((page) => [page.title, page.excerpt]),
    externalSources?.technical?.stack?.frontend,
    externalSources?.technical?.stack?.backend,
    externalSources?.technical?.stack?.database,
    Object.keys(externalSources?.flows ?? {}),
    externalSources?.roadmapContext?.knownMissingParts ?? [],
  ]);

  const confidenceScores = {};

  for (const domain of Object.keys(domainRegistry.domains)) {
    if (domain === "generic") {
      continue;
    }

    let score = scoreKeywordMatches(textCorpus, DOMAIN_KEYWORDS[domain] ?? []);
    const registrySignals = domainRegistry.domains[domain]?.signals ?? [];
    score += scoreKeywordMatches(textCorpus, registrySignals) * 0.5;

    if (intakeType === domain) {
      score += 0.55;
    }

    if (sourceType === "casino-api" && domain === "casino") {
      score = 1;
    }

    confidenceScores[domain] = normalizeConfidence(score);
  }

  const sortedCandidates = Object.entries(confidenceScores)
    .filter(([, score]) => score > 0)
    .sort((left, right) => right[1] - left[1])
    .map(([domain]) => domain);

  const domain = sortedCandidates[0] ?? "generic";

  return {
    domain,
    domainCandidates: sortedCandidates.length > 0 ? sortedCandidates : ["generic"],
    confidenceScores: sortedCandidates.length > 0 ? confidenceScores : { generic: 1 },
  };
}
