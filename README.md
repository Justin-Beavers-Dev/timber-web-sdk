# Timber Web SDK

Bug reporting widget for web applications. Adds a floating button that lets users capture screenshots, annotate them, and submit structured bug reports directly to the Timber backend.

## Features

- **Floating button** — draggable Timber logo in the corner of the page
- **Screenshot capture** — serializes the DOM and renders a pixel-perfect PNG via a server-side Playwright route
- **Annotation tools** — freehand draw, text tool, 6-color palette, undo/redo
- **Bug report form** — title, description, expected behaviour, priority, device info
- **Console log capture** — silently records the last 200 console/click events and attaches them to the report
- **Backend integration** — submits reports to the Timber API (`/api/v1/sdk/ingest`) using an SDK API key
- **Privacy** — `[data-calda-mask]` attribute redacts sensitive content from screenshots
- **Framework-agnostic** — works with React, Next.js, Vue, Svelte, plain HTML, etc.
- **Style isolation** — all UI renders inside a Shadow DOM so it never conflicts with the host app

## Quick Start

### 1. Install

```bash
npm install calda-feedback-sdk
```

For local development against the SDK source:

```bash
# From the SDK repo
npm run build && npm pack

# From your web app
npm install ../timber-web-sdk/calda-feedback-sdk-0.1.0.tgz
```

### 2. Get your credentials

You need two values from your Timber project:

| Value | Where to find it |
|---|---|
| **Project ID** | Timber dashboard → project settings → copy the project UUID |
| **SDK API Key** | Timber dashboard → project settings → SDK Keys → create or copy an existing key |

### 3. Add the screenshot API route

The SDK captures the page DOM and sends it to a server-side route that renders a PNG using Playwright. You need to add this route to your app.

Install Playwright:

```bash
npm install playwright
npx playwright install chromium
```

Create the route (Next.js App Router example):

```ts
// app/api/calda/screenshot/route.ts
import { chromium } from "playwright";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { url, headHtml, bodyHtml, width, height, deviceScaleFactor } =
    await req.json();

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor,
  });
  const page = await context.newPage();

  await page.setContent(
    `<!DOCTYPE html><html><head><base href="${url}">${headHtml}</head><body>${bodyHtml}</body></html>`,
    { waitUntil: "networkidle" }
  );

  const screenshot = await page.screenshot({ type: "png", fullPage: false });
  await browser.close();

  return new NextResponse(screenshot, {
    headers: { "Content-Type": "image/png" },
  });
}
```

### 4. Initialize the SDK

#### React / Next.js (App Router)

Create a client component:

```tsx
// src/components/CaldaWidget.tsx
"use client";

import { useEffect } from "react";

export function CaldaWidget() {
  useEffect(() => {
    import("calda-feedback-sdk").then(({ init }) => {
      init({
        projectId: "YOUR_PROJECT_ID",
        apiKey: "YOUR_SDK_API_KEY",
        apiUrl: "https://www.timber.report/api/v1",
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

Add it to your root layout:

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

#### Plain HTML (UMD)

```html
<script src="path/to/sdk.umd.js"></script>
<script>
  window.Calda.init({
    projectId: "YOUR_PROJECT_ID",
    apiKey: "YOUR_SDK_API_KEY",
    apiUrl: "https://www.timber.report/api/v1",
    screenshotApiUrl: "/api/calda/screenshot",
  });
</script>
```

## Configuration

```ts
init({
  // Required
  projectId: string,          // Timber project UUID
  apiKey: string,             // SDK API key (from Timber dashboard)

  // Optional
  apiUrl?: string,            // Backend URL — default: "https://www.timber.report/api/v1"
  screenshotApiUrl?: string,  // Screenshot route — default: "/api/calda/screenshot"
  position?: "bottom-right" | "bottom-left",  // Float button position — default: "bottom-right"
  theme?: "light" | "dark" | "auto",          // Widget theme — default: "auto"
  user?: {                    // Pre-fill user info on reports
    id?: string,
    email?: string,
    name?: string,
  },
})
```

## Programmatic API

```ts
import { init, destroy, open, close } from "calda-feedback-sdk";

init({ ... });   // Initialize the widget
open();          // Open the menu programmatically
close();         // Close the widget back to idle
destroy();       // Remove the widget and restore console
```

## User Flow

1. **Click** the floating Timber button in the corner
2. **Select** "Take a Screenshot" from the menu
3. **Annotate** the screenshot — draw, add text, pick colors, undo/redo
4. **Click "Report"** to open the bug report form
5. **Fill in** title, description, expected behaviour, priority, and device
6. **Submit** — the SDK sends the report with screenshot + console logs to Timber

## Privacy & Masking

Add `data-calda-mask` to any HTML element to redact its content from screenshots:

```html
<div data-calda-mask>This content will appear as [masked] in screenshots</div>
```

The SDK automatically excludes its own UI from screenshots via `[data-calda-root]`.

## Architecture

- **Vanilla TypeScript** — zero runtime dependencies
- **Shadow DOM** — complete style isolation from the host app
- **State machine** — `idle → menu → capturing → annotating → reporting → idle`
- **Console capture** — intercepts `console.log/warn/error` + click events (200-event ring buffer)
- **Undo/redo** — canvas `ImageData` snapshot history (max 30 states)
- **Backend auth** — reports are sent with `X-API-Key` header to `/api/v1/sdk/ingest`

### Build outputs

```
dist/
  index.mjs       — ESM module (for bundlers)
  sdk.umd.js      — UMD bundle (window.Calda)
  index.d.ts      — TypeScript declarations
```

## Development

```bash
npm install
npm run build      # Type-check + Vite build
npm run typecheck  # Type-check only
npm run dev        # Vite dev server (for testing)
```

After making changes, rebuild and update the consuming app:

```bash
npm run build && npm pack
cd ../your-app && npm install ../timber-web-sdk/calda-feedback-sdk-0.1.0.tgz
```
