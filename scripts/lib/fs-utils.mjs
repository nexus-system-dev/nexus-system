/**
 * File system and git utilities for runtime tooling.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

/**
 * Computes SHA-256 hash of a file's contents.
 * Returns empty string if file does not exist.
 * @param {string} filePath
 * @returns {string}
 */
export function sha256File(filePath) {
  if (!fs.existsSync(filePath)) return '';
  const contents = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(contents).digest('hex');
}

/**
 * Returns metadata for a file (exists, size, mtimeMs, sha256).
 * Safe: does not throw if file is missing.
 * @param {string} filePath
 * @param {string} relPath - relative path to store in output
 * @returns {{ path: string, exists: boolean, size: number, mtimeMs: number, sha256: string }}
 */
export function fileMetadata(filePath, relPath) {
  const exists = fs.existsSync(filePath);
  if (!exists) {
    return { path: relPath, exists: false, size: 0, mtimeMs: 0, sha256: '' };
  }
  const stat = fs.statSync(filePath);
  return {
    path: relPath,
    exists: true,
    size: stat.size,
    mtimeMs: stat.mtimeMs,
    sha256: sha256File(filePath),
  };
}

/**
 * Writes a JSON artifact to a file, ensuring the directory exists.
 * @param {string} outputPath
 * @param {object} data
 */
export function writeJsonArtifact(outputPath, data) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

/**
 * Reads and parses a JSON file. Throws a structured error if missing or malformed.
 * @param {string} filePath
 * @returns {object}
 */
export function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(JSON.stringify({
      error: 'FILE_NOT_FOUND',
      file: filePath,
      message: `Required file not found: ${filePath}`,
    }));
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    throw new Error(JSON.stringify({
      error: 'INVALID_JSON',
      file: filePath,
      message: `JSON parse error: ${e.message}`,
    }));
  }
}

/**
 * Checks if a file is readable (exists and can be stat'd).
 * @param {string} filePath
 * @returns {boolean}
 */
export function isReadable(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Queries git for the current working tree state.
 * Returns { gitAvailable, workingTreeDirty, changedFiles, untrackedFiles }.
 * Never throws — returns safe defaults if git is unavailable.
 * @param {string} repoRoot
 * @returns {{ gitAvailable: boolean, workingTreeDirty: boolean, changedFiles: string[], untrackedFiles: string[] }}
 */
export function getGitState(repoRoot) {
  const result = { gitAvailable: false, workingTreeDirty: false, changedFiles: [], untrackedFiles: [] };

  try {
    // Check if git is available and repo is a git repo
    execSync('git rev-parse --is-inside-work-tree', { cwd: repoRoot, stdio: 'pipe' });
    result.gitAvailable = true;

    // Changed (tracked, modified or staged) files
    const changedRaw = execSync('git diff --name-only HEAD', { cwd: repoRoot, stdio: 'pipe' }).toString().trim();
    const stagedRaw = execSync('git diff --name-only --cached', { cwd: repoRoot, stdio: 'pipe' }).toString().trim();
    const changedSet = new Set([
      ...changedRaw.split('\n').filter(Boolean),
      ...stagedRaw.split('\n').filter(Boolean),
    ]);
    result.changedFiles = [...changedSet];

    // Untracked files
    const untrackedRaw = execSync('git ls-files --others --exclude-standard', { cwd: repoRoot, stdio: 'pipe' }).toString().trim();
    result.untrackedFiles = untrackedRaw.split('\n').filter(Boolean);

    result.workingTreeDirty = result.changedFiles.length > 0 || result.untrackedFiles.length > 0;
  } catch {
    // git not available or not a git repo — return safe defaults
  }

  return result;
}

/**
 * Scans a directory recursively for files matching a pattern.
 * Returns relative paths from rootDir.
 * @param {string} rootDir
 * @param {RegExp} pattern
 * @returns {string[]}
 */
export function scanFiles(rootDir, pattern) {
  const results = [];

  function recurse(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        recurse(fullPath);
      } else if (pattern.test(entry.name)) {
        results.push(path.relative(rootDir, fullPath));
      }
    }
  }

  recurse(rootDir);
  return results;
}
