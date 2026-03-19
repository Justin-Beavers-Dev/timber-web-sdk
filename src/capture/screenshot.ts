import type { ScreenshotPayload } from "../types";

// ---------------------------------------------------------------------------
// Native screen capture (getDisplayMedia)
// ---------------------------------------------------------------------------

/**
 * Capture the current browser tab using the Screen Capture API.
 * Returns an object URL pointing to the captured PNG blob.
 */
export async function captureScreenshotNative(): Promise<string> {
  document.documentElement.style.cursor = "default";

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { displaySurface: "browser", cursor: "never" } as MediaTrackConstraints,
    preferCurrentTab: true,
  } as DisplayMediaStreamOptions);

  const video = document.createElement("video");
  video.srcObject = stream;
  await video.play();

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d")!.drawImage(video, 0, 0);

  stream.getTracks().forEach((t) => t.stop());
  document.documentElement.style.cursor = "";

  return new Promise<string>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(URL.createObjectURL(blob)) : reject(new Error("toBlob failed"))),
      "image/png",
    );
  });
}

// ---------------------------------------------------------------------------
// Server-side API capture (legacy)
// ---------------------------------------------------------------------------

function collectStyles(): string {
  const blocks: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = Array.from(sheet.cssRules);
      blocks.push(rules.map((r) => r.cssText).join("\n"));
    } catch {
      if (sheet.href) {
        blocks.push(`@import url("${sheet.href}");`);
      }
    }
  }
  return blocks.map((css) => `<style>${css}</style>`).join("\n");
}

/**
 * Serialize the current DOM and POST it to a server-side screenshot API.
 * Returns an object URL pointing to the PNG blob.
 */
export async function captureScreenshotApi(apiUrl: string): Promise<string> {
  const inlinedStyles = collectStyles();
  const clone = document.documentElement.cloneNode(true) as HTMLElement;

  clone.querySelectorAll("[data-timber-root]").forEach((el) => el.remove());
  clone.querySelectorAll("script").forEach((el) => el.remove());
  clone.querySelectorAll("[data-timber-mask]").forEach((el) => {
    el.textContent = "[masked]";
  });

  const headEl = clone.querySelector("head");
  const bodyEl = clone.querySelector("body");
  const bodyHtml = bodyEl ? bodyEl.innerHTML : clone.innerHTML;

  if (headEl) {
    headEl.querySelectorAll('link[rel="stylesheet"], style').forEach((el) => el.remove());
  }
  const headHtml = (headEl ? headEl.innerHTML : "") + "\n" + inlinedStyles;

  const payload: ScreenshotPayload = {
    url: window.location.href,
    headHtml,
    bodyHtml,
    width: window.innerWidth,
    height: window.innerHeight,
    deviceScaleFactor: window.devicePixelRatio || 1,
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Screenshot API returned ${response.status}: ${response.statusText}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
