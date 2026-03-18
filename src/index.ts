import type { CaldaConfig, ResolvedConfig } from "./types";
import { CaldaWidget } from "./widget";

// Re-export types for consumers
export type { CaldaConfig, FeedbackPayload, LogEntry, ReportFormData, BugPriority } from "./types";

let instance: CaldaWidget | null = null;

/** Resolve theme "auto" to light/dark based on prefers-color-scheme */
function resolveTheme(theme: CaldaConfig["theme"]): "light" | "dark" {
  if (theme === "light" || theme === "dark") return theme;
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

/**
 * Initialize the Calda Feedback SDK.
 *
 * @example
 * // ESM
 * import { init } from 'calda-feedback-sdk';
 * init({ projectId: 'my-project' });
 *
 * // UMD (script tag)
 * window.Calda.init({ projectId: 'my-project' });
 */
export function init(config: CaldaConfig): void {
  if (!config?.projectId) {
    throw new Error("[Calda] projectId is required");
  }
  if (!config?.apiKey) {
    throw new Error("[Calda] apiKey is required");
  }

  if (instance) {
    instance.destroy();
    instance = null;
  }

  const resolved: ResolvedConfig = {
    projectId: config.projectId,
    apiKey: config.apiKey,
    apiUrl: (config.apiUrl ?? "https://www.timber.report/api/v1").replace(/\/+$/, ""),
    screenshotApiUrl: config.screenshotApiUrl ?? "/api/calda/screenshot",
    position: config.position ?? "bottom-right",
    theme: resolveTheme(config.theme ?? "auto"),
    user: config.user,
  };

  instance = new CaldaWidget(resolved);
}

/** Destroy the SDK instance and remove all DOM elements */
export function destroy(): void {
  if (instance) {
    instance.destroy();
    instance = null;
  }
}

/** Programmatically open the widget menu */
export function open(): void {
  instance?.open();
}

/** Programmatically close the widget */
export function close(): void {
  instance?.close();
}
