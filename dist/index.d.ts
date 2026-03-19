/** Priority levels for bug reports */
export declare type BugPriority = "no_priority" | "low" | "medium" | "high" | "urgent";

/** Programmatically close the widget */
declare function close_2(): void;
export { close_2 as close }

/** Destroy the SDK instance and remove all DOM elements */
export declare function destroy(): void;

/** Feedback payload sent to the backend */
export declare interface FeedbackPayload {
    projectId: string;
    url: string;
    formData: ReportFormData;
    screenshotDataUrl: string | null;
    logs: LogEntry[];
    user?: TimberConfig["user"];
    timestamp: number;
}

/**
 * Initialize the Timber Feedback SDK.
 *
 * @example
 * // ESM
 * import { init } from 'timber-feedback-sdk';
 * init({ projectId: 'my-project' });
 *
 * // UMD (script tag)
 * window.Timber.init({ projectId: 'my-project' });
 */
export declare function init(config: TimberConfig): void;

/** Console/click log entry */
export declare interface LogEntry {
    type: "console" | "click";
    level?: "log" | "warn" | "error";
    timestamp: number;
    data: unknown;
}

/** Programmatically open the widget menu */
declare function open_2(): void;
export { open_2 as open }

/** Structured form data from the report modal */
export declare interface ReportFormData {
    title: string;
    description: string;
    expectedBehaviour: string;
    priority: BugPriority;
    device: string;
}

/** SDK configuration passed to init() */
export declare interface TimberConfig {
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

export { }
