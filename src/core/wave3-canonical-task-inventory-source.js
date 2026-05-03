import fs from "node:fs";
import path from "node:path";

const DEFAULT_WAVE3_CANONICAL_STATE_PATH = path.resolve(process.cwd(), "docs", "wave3-canonical-state.json");

export function loadWave3CanonicalTaskInventory(filePath = DEFAULT_WAVE3_CANONICAL_STATE_PATH) {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return Array.isArray(parsed?.wave3OrderedExecutionMap) ? parsed.wave3OrderedExecutionMap : [];
  } catch {
    return [];
  }
}
