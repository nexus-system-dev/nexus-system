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
    const content = fs.readFileSync(this.filePath, "utf8").trim();
    if (!content) {
      return [];
    }

    return content.split("\n").map((line) => JSON.parse(line));
  }
}
