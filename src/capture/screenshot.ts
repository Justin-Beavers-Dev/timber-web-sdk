import type { ScreenshotPayload } from "../types";

/**
 * Collect all CSS rules from the page — both inline <style> tags
 * and external <link rel="stylesheet"> — as inline <style> blocks.
 */
function collectStyles(): string {
  const blocks: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = Array.from(sheet.cssRules);
      blocks.push(rules.map((r) => r.cssText).join("\n"));
    } catch {
      // Cross-origin stylesheet — attempt to fetch it as a <link> tag
      if (sheet.href) {
        blocks.push(`@import url("${sheet.href}");`);
      }
    }
  }
  return blocks.map((css) => `<style>${css}</style>`).join("\n");
}

/**
 * Serialize the current DOM, strip SDK elements and scripts,
 * mask sensitive content, and request a screenshot from the host API.
 * Returns an object URL pointing to the PNG blob.
 */
export async function captureScreenshot(apiUrl: string): Promise<string> {
  // 1. Collect all CSS before cloning (cssRules not available on clone)
  const inlinedStyles = collectStyles();

  // 2. Clone the entire document element
  const clone = document.documentElement.cloneNode(true) as HTMLElement;

  // 3. Remove SDK elements (anything with data-timber-root)
  clone.querySelectorAll("[data-timber-root]").forEach((el) => el.remove());

  // 4. Remove all <script> tags
  clone.querySelectorAll("script").forEach((el) => el.remove());

  // 5. Mask elements with [data-timber-mask]
  clone.querySelectorAll("[data-timber-mask]").forEach((el) => {
    el.textContent = "[masked]";
  });

  // Extract head and body from cleaned clone
  const headEl = clone.querySelector("head");
  const bodyEl = clone.querySelector("body");
  const bodyHtml = bodyEl ? bodyEl.innerHTML : clone.innerHTML;

  // Build headHtml: keep <meta>, <base>, etc. + inject collected CSS
  // Remove existing <link rel="stylesheet"> and <style> since we inlined them
  if (headEl) {
    headEl.querySelectorAll('link[rel="stylesheet"], style').forEach((el) => el.remove());
  }
  const headHtml = (headEl ? headEl.innerHTML : "") + "\n" + inlinedStyles;

  // 6. Build payload
  const payload: ScreenshotPayload = {
    url: window.location.href,
    headHtml,
    bodyHtml,
    width: window.innerWidth,
    height: window.innerHeight,
    deviceScaleFactor: window.devicePixelRatio || 1,
  };

  // 7. POST to host API (expects image/png response)
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Screenshot API returned ${response.status}: ${response.statusText}`);
  }

  // 8. Convert binary PNG to object URL
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
