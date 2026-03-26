import { randomUUID } from "node:crypto";
import path from "node:path";

import { FileEventLog } from "./file-event-log.js";

export class EventBus {
  constructor({
    eventLog = new FileEventLog({
      filePath: path.resolve(process.cwd(), "data/events.ndjson"),
    }),
  } = {}) {
    this.eventLog = eventLog;
    this.events = this.eventLog.readAll();
    this.listeners = [];
  }

  emit(type, payload) {
    const event = {
      id: randomUUID(),
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.events.push(event);
    this.eventLog.append(event);
    this.notifyListeners(event);
    return event;
  }

  getRecentEvents(limit = 20) {
    return this.events.slice(-limit);
  }

  getEvents() {
    return [...this.events];
  }

  subscribe(type, handler) {
    const listener = { type, handler };
    this.listeners.push(listener);

    return () => {
      this.listeners = this.listeners.filter((candidate) => candidate !== listener);
    };
  }

  notifyListeners(event) {
    for (const listener of this.listeners) {
      if (listener.type === event.type) {
        listener.handler(event);
      }
    }
  }
}
