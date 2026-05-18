import fs from "node:fs";
import path from "node:path";

export class FileEventLog {
  constructor({ filePath }) {
    this.filePath = filePath;
    this.ensureFile();
  }

  ensureFile() {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });

    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, "", "utf8");
    }
  }

  append(event) {
    fs.appendFileSync(this.filePath, `${JSON.stringify(event)}\n`, "utf8");
  }

  readAll() {
    const stats = fs.statSync(this.filePath);
    if (!stats.isFile() || stats.size === 0) {
      return [];
    }

    const maxReadBytes = 16 * 1024 * 1024;
    let content = "";

    if (stats.size <= maxReadBytes) {
      content = fs.readFileSync(this.filePath, "utf8");
    } else {
      const fileHandle = fs.openSync(this.filePath, "r");
      try {
        const start = Math.max(0, stats.size - maxReadBytes);
        const buffer = Buffer.alloc(stats.size - start);
        fs.readSync(fileHandle, buffer, 0, buffer.length, start);
        content = buffer.toString("utf8");
        const firstNewlineIndex = content.indexOf("\n");
        if (firstNewlineIndex >= 0) {
          content = content.slice(firstNewlineIndex + 1);
        }
      } finally {
        fs.closeSync(fileHandle);
      }
    }

    content = content.trim();
    if (!content) {
      return [];
    }

    return content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  }
}
