# Calda Feedback SDK

Framework-agnostic embeddable feedback widget with screenshot capture and annotation.

## Features

- Floating draggable button → menu → screenshot → annotate → send
- Freehand draw + text annotation tools with color picker
- DOM serialization with `[data-calda-mask]` support
- Console/click event capture (last 200 events)
- Shadow DOM style isolation
- Works in any web app (Next.js, React, Vue, plain HTML)

## Build

```bash
npm install
npm run build
```

Output:
- `dist/sdk.umd.js` — UMD bundle (`window.Calda`)
- `dist/index.mjs` — ESM module
- `dist/index.d.ts` — TypeScript declarations

---

## Integration Guide (Local Development)

### 1. Link SDK locally

```bash
# In SDK project
cd ~/calda-feedback-sdk && npm link

# In your web app
cd ~/nextjs-app && npm link calda-feedback-sdk
```

Alternatively, add to your app's `package.json`:

```json
"calda-feedback-sdk": "file:../calda-feedback-sdk"
```

### 2. Add SDK to your app

#### Option A: React / Next.js (App Router)

Create a client component:

```tsx
// src/components/CaldaWidget.tsx
"use client";

import { useEffect } from "react";

export function CaldaWidget() {
  useEffect(() => {
    import("calda-feedback-sdk").then(({ init }) => {
      init({
        projectId: "my-local-test",
        screenshotApiUrl: "/api/calda/screenshot",
        position: "bottom-right",
        theme: "auto",
      });
    });

    return () => {
      import("calda-feedback-sdk").then(({ destroy }) => destroy());
    };
  }, []);

  return null;
}
```

Add to your layout:

```tsx
// app/layout.tsx
import { CaldaWidget } from "@/components/CaldaWidget";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <CaldaWidget />
      </body>
    </html>
  );
}
```

#### Option B: Plain HTML (UMD)

```html
<script src="path/to/sdk.umd.js"></script>
<script>
  window.Calda.init({
    projectId: "my-project",
    screenshotApiUrl: "/api/calda/screenshot",
  });
</script>
```

### 3. Create Screenshot API Route (Playwright)

Install Playwright in your web app:

```bash
cd ~/nextjs-app
npm install playwright
npx playwright install chromium
```

Create the API route:

```ts
// app/api/calda/screenshot/route.ts
import { chromium } from "playwright";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { url, bodyHtml, width, height, deviceScaleFactor } = await req.json();

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor,
  });
  const page = await context.newPage();

  await page.setContent(
    `<!DOCTYPE html><html><head><base href="${url}"></head><body>${bodyHtml}</body></html>`,
    { waitUntil: "networkidle" }
  );

  const screenshot = await page.screenshot({ type: "png", fullPage: false });
  await browser.close();

  return new NextResponse(screenshot, {
    headers: { "Content-Type": "image/png" },
  });
}
```

### 4. Run & Test

```bash
cd ~/nextjs-app && npm run dev
```

Open `http://localhost:3000`:

1. Indigo feedback button appears in the bottom-right corner
2. Click → "Take a Screenshot"
3. SDK serializes DOM → sends to `/api/calda/screenshot` → Playwright returns PNG
4. Annotation overlay opens with draw/text tools and color picker
5. "Send" logs the feedback payload to the browser console

### Testing Tips

- **Masking:** Add `data-calda-mask` to sensitive elements:
  ```html
  <p data-calda-mask>Sensitive content</p>
  ```
- **Console:** Open DevTools to see the feedback payload on "Send"
- **Programmatic API:**
  ```js
  import { open, close, destroy } from "calda-feedback-sdk";
  open();    // Open menu
  close();   // Close widget
  destroy(); // Remove SDK entirely
  ```

---

## Public API

```ts
init({
  projectId: string,            // required
  screenshotApiUrl?: string,    // default: "/api/calda/screenshot"
  position?: "bottom-right" | "bottom-left",
  theme?: "light" | "dark" | "auto",
  user?: { id?: string; email?: string; name?: string },
})

destroy()  // Remove SDK and restore console
open()     // Open menu programmatically
close()    // Close widget
```

## Architecture

- Vanilla TypeScript, zero runtime dependencies
- Shadow DOM for complete style isolation
- State machine: `idle → menu → capturing → annotating → idle`
- Console log/warn/error + click event capture (200-event buffer)
- `[data-calda-root]` elements excluded from screenshot
- `[data-calda-mask]` elements have content replaced with `[masked]`
