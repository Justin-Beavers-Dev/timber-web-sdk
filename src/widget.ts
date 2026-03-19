import type { ResolvedConfig, WidgetState, ReportFormData } from "./types";
import { LogCapture } from "./capture/logs";
import { captureScreenshotNative, captureScreenshotApi } from "./capture/screenshot";
import { getStyles } from "./ui/styles";
import { createFloatButton } from "./ui/float-button";
import { createMenu } from "./ui/menu";
import { createLoader } from "./ui/loader";
import { createAnnotationOverlay } from "./ui/annotation";
import { createReportModal, setModalError, setModalLoading } from "./ui/report-modal";

/**
 * Core widget class — manages state machine, shadow DOM host,
 * and orchestrates all UI components.
 *
 * State machine:
 *   idle → menu → capturing → annotating → idle
 *                           ↘ cancel → idle
 */
export class TimberWidget {
  private config: ResolvedConfig;
  private state: WidgetState = "idle";
  private host: HTMLDivElement;
  private shadow: ShadowRoot;
  private root: HTMLDivElement;
  private logCapture: LogCapture;

  // UI element references for cleanup
  private floatBtn: HTMLButtonElement | null = null;
  private menuEl: HTMLDivElement | null = null;
  private loaderEl: HTMLDivElement | null = null;
  private annotationEl: HTMLDivElement | null = null;
  private reportEl: HTMLDivElement | null = null;
  private screenshotObjectUrl: string | null = null;
  private screenshotDataUrl: string | null = null;

  constructor(config: ResolvedConfig) {
    this.config = config;

    // Create shadow DOM host element — no pointer-events:none so children receive clicks
    this.host = document.createElement("div");
    this.host.setAttribute("data-timber-root", "");
    this.host.style.cssText = "position:fixed;z-index:2147483647;top:0;left:0;width:0;height:0;overflow:visible;";
    document.body.appendChild(this.host);

    this.shadow = this.host.attachShadow({ mode: "open" });

    // Inject styles
    const style = document.createElement("style");
    style.textContent = getStyles(this.config.theme);
    this.shadow.appendChild(style);

    // Root container for all UI elements
    this.root = document.createElement("div");
    this.shadow.appendChild(this.root);

    // Start log capture
    this.logCapture = new LogCapture();
    this.logCapture.start();

    // Create float button inside the root container
    this.floatBtn = createFloatButton(this.root, {
      position: this.config.position,
      onClick: () => this.handleFloatClick(),
    });
  }

  /** Toggle menu on float button click */
  private handleFloatClick(): void {
    if (this.state === "idle") {
      this.transitionTo("menu");
    } else if (this.state === "menu") {
      this.transitionTo("idle");
    }
  }

  /** Central state transition handler */
  private transitionTo(next: WidgetState): void {
    // Clean up current state UI
    this.cleanupStateUI();
    this.state = next;

    switch (next) {
      case "idle":
        // Show float button
        if (this.floatBtn) this.floatBtn.style.display = "";
        break;

      case "menu":
        if (this.floatBtn) {
          this.floatBtn.style.display = "";
          const rect = this.floatBtn.getBoundingClientRect();
          this.menuEl = createMenu(this.root, rect, {
            onScreenshot: () => this.transitionTo("capturing"),
            onClose: () => this.transitionTo("idle"),
          });
        }
        break;

      case "capturing":
        // Hide float button, show loader, capture screenshot
        if (this.floatBtn) this.floatBtn.style.display = "none";
        this.loaderEl = createLoader(this.root);
        this.doCapture();
        break;

      case "annotating":
        // Float button stays hidden; annotation overlay is shown in doCapture
        break;

      case "reporting":
        // Float button stays hidden; report modal shown after annotation
        if (this.floatBtn) this.floatBtn.style.display = "none";
        break;
    }
  }

  /** Capture screenshot and transition to annotating */
  private async doCapture(): Promise<void> {
    try {
      let objectUrl: string;

      if (this.config.screenshotMode === "native") {
        this.host.style.visibility = "hidden";
        await new Promise((r) => requestAnimationFrame(r));
        objectUrl = await captureScreenshotNative();
        this.host.style.visibility = "";
      } else {
        objectUrl = await captureScreenshotApi(this.config.screenshotApiUrl);
      }
      this.screenshotObjectUrl = objectUrl;

      // Remove loader
      this.loaderEl?.remove();
      this.loaderEl = null;

      // Show annotation overlay
      this.state = "annotating";
      this.annotationEl = createAnnotationOverlay(
        this.root,
        objectUrl,
        {
          onSend: (dataUrl) => this.handleAnnotationSend(dataUrl),
          onCancel: () => this.transitionTo("idle"),
        },
        this.config.theme
      );
    } catch (err) {
      console.error("[Timber] Screenshot capture failed:", err);
      this.loaderEl?.remove();
      this.loaderEl = null;
      this.transitionTo("idle");
    }
  }

  /** Annotation done → show report modal */
  private handleAnnotationSend(dataUrl: string): void {
    this.screenshotDataUrl = dataUrl;
    this.cleanupStateUI();
    this.state = "reporting";
    if (this.floatBtn) this.floatBtn.style.display = "none";

    this.reportEl = createReportModal(
      this.root,
      dataUrl,
      this.logCapture.getLogs(),
      {
        onSubmit: (formData) => this.handleSubmitReport(formData),
        onCancel: () => this.transitionTo("idle"),
      }
    );
  }

  /** Build ingest payload and POST to backend */
  private async handleSubmitReport(formData: ReportFormData): Promise<void> {
    if (!this.reportEl) return;

    setModalError(this.reportEl, "");
    setModalLoading(this.reportEl, true);

    const logs = this.logCapture.getLogs();
    const attachments: Array<{ filename: string; contentType: string; data: string }> = [];

    if (this.screenshotDataUrl) {
      const base64 = this.screenshotDataUrl.split(",")[1];
      if (base64) {
        attachments.push({
          filename: "screenshot.png",
          contentType: "image/png",
          data: base64,
        });
      }
    }

    const body = {
      eventType: "bug_report",
      title: formData.title,
      description: `${formData.description}\n\nExpected behaviour: ${formData.expectedBehaviour}`,
      deviceInfo: {
        userAgent: navigator.userAgent,
        device: formData.device,
        priority: formData.priority,
      },
      attachments,
      metadata: {
        url: window.location.href,
        logs: logs.slice(-50),
      },
      timestamp: new Date().toISOString(),
      tags: ["web-sdk"],
      userEmail: this.config.user?.email,
    };

    try {
      const res = await fetch(`${this.config.apiUrl}/sdk/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.config.apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const msg = json?.error?.message ?? `Server error (${res.status})`;
        throw new Error(msg);
      }

      if (this.screenshotObjectUrl) {
        URL.revokeObjectURL(this.screenshotObjectUrl);
        this.screenshotObjectUrl = null;
      }
      this.screenshotDataUrl = null;

      this.transitionTo("idle");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send report";
      console.error("[Timber] Submit failed:", message);
      if (this.reportEl) {
        setModalLoading(this.reportEl, false);
        setModalError(this.reportEl, message);
      }
    }
  }

  /** Remove any state-specific UI elements */
  private cleanupStateUI(): void {
    this.menuEl?.remove();
    this.menuEl = null;
    this.loaderEl?.remove();
    this.loaderEl = null;
    this.annotationEl?.remove();
    this.annotationEl = null;
    this.reportEl?.remove();
    this.reportEl = null;
  }

  /** Open the widget menu programmatically */
  open(): void {
    if (this.state === "idle") {
      this.transitionTo("menu");
    }
  }

  /** Close the widget back to idle */
  close(): void {
    this.transitionTo("idle");
  }

  /** Fully destroy the widget and restore console */
  destroy(): void {
    this.cleanupStateUI();
    this.floatBtn?.remove();
    this.floatBtn = null;
    this.logCapture.destroy();

    if (this.screenshotObjectUrl) {
      URL.revokeObjectURL(this.screenshotObjectUrl);
      this.screenshotObjectUrl = null;
    }

    this.host.remove();
  }
}
