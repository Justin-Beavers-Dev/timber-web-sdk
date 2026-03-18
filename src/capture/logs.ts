import type { LogEntry } from "../types";

const MAX_BUFFER = 200;

/** Captures console.log/warn/error and document click events */
export class LogCapture {
  private buffer: LogEntry[] = [];
  private originals: {
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
  };
  private clickHandler: ((e: MouseEvent) => void) | null = null;

  constructor() {
    // Store original console methods before overriding
    this.originals = {
      log: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
    };
  }

  /** Start capturing console and click events */
  start(): void {
    const self = this;

    // Override console methods
    console.log = (...args: unknown[]) => {
      self.push({ type: "console", level: "log", timestamp: Date.now(), data: args });
      self.originals.log(...args);
    };
    console.warn = (...args: unknown[]) => {
      self.push({ type: "console", level: "warn", timestamp: Date.now(), data: args });
      self.originals.warn(...args);
    };
    console.error = (...args: unknown[]) => {
      self.push({ type: "console", level: "error", timestamp: Date.now(), data: args });
      self.originals.error(...args);
    };

    // Capture click events in capture phase
    this.clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      self.push({
        type: "click",
        timestamp: Date.now(),
        data: {
          tag: target?.tagName?.toLowerCase() ?? "unknown",
          id: target?.id || undefined,
          className: target?.className || undefined,
          text: target?.textContent?.slice(0, 100) || undefined,
          x: e.clientX,
          y: e.clientY,
        },
      });
    };
    document.addEventListener("click", this.clickHandler, true);
  }

  /** Add entry to buffer, evicting oldest if over limit */
  private push(entry: LogEntry): void {
    this.buffer.push(entry);
    if (this.buffer.length > MAX_BUFFER) {
      this.buffer.shift();
    }
  }

  /** Get a copy of the current log buffer */
  getLogs(): LogEntry[] {
    return [...this.buffer];
  }

  /** Restore original console methods and remove click listener */
  destroy(): void {
    console.log = this.originals.log;
    console.warn = this.originals.warn;
    console.error = this.originals.error;

    if (this.clickHandler) {
      document.removeEventListener("click", this.clickHandler, true);
      this.clickHandler = null;
    }

    this.buffer = [];
  }
}
