/** SDK configuration passed to init() */
export interface TimberConfig {
  projectId: string;
  apiKey: string;
  apiUrl?: string;
  /**
   * How screenshots are captured.
   * - `"native"` (default) — uses the browser's Screen Capture API
   *    (getDisplayMedia). No server-side setup required.
   * - `"api"` — sends serialized DOM to `screenshotApiUrl` for
   *    server-side rendering (requires a hosted screenshot endpoint).
   */
  screenshotMode?: "native" | "api";
  /** Only used when `screenshotMode` is `"api"`. */
  screenshotApiUrl?: string;
  position?: "bottom-right" | "bottom-left";
  theme?: "light" | "dark" | "auto";
  user?: {
    id?: string;
    email?: string;
    name?: string;
  };
}

/** Resolved config with defaults applied */
export interface ResolvedConfig {
  projectId: string;
  apiKey: string;
  apiUrl: string;
  screenshotMode: "native" | "api";
  screenshotApiUrl: string;
  position: "bottom-right" | "bottom-left";
  theme: "light" | "dark";
  user?: {
    id?: string;
    email?: string;
    name?: string;
  };
}

/** Widget state machine states */
export type WidgetState = "idle" | "menu" | "capturing" | "annotating" | "reporting";

/** Console/click log entry */
export interface LogEntry {
  type: "console" | "click";
  level?: "log" | "warn" | "error";
  timestamp: number;
  data: unknown;
}

/** Annotation tool types */
export type AnnotationTool = "draw" | "text";

/** Available annotation colors */
export type AnnotationColor = string;

/** Screenshot request payload sent to the host API */
export interface ScreenshotPayload {
  url: string;
  headHtml: string;
  bodyHtml: string;
  width: number;
  height: number;
  deviceScaleFactor: number;
}

/** Priority levels for bug reports */
export type BugPriority = "no_priority" | "low" | "medium" | "high" | "urgent";

/** Structured form data from the report modal */
export interface ReportFormData {
  title: string;
  description: string;
  expectedBehaviour: string;
  priority: BugPriority;
  device: string;
}

/** Feedback payload sent to the backend */
export interface FeedbackPayload {
  projectId: string;
  url: string;
  formData: ReportFormData;
  screenshotDataUrl: string | null;
  logs: LogEntry[];
  user?: TimberConfig["user"];
  timestamp: number;
}
