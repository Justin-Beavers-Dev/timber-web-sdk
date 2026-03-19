# Timber Web SDK

Bug reporting widget for web applications. Adds a floating button that lets users capture screenshots, annotate them, and submit structured bug reports directly to the Timber backend.

## Features

- **Floating button** — draggable Timber logo in the corner of the page
- **Native screenshot capture** — uses the browser's Screen Capture API (`getDisplayMedia`) with zero server-side setup
- **Annotation tools** — freehand draw, text tool, 6-color palette, undo/redo
- **Bug report form** — title, description, expected behaviour, priority, device info
- **Console log capture** — silently records the last 200 console/click events and attaches them to the report
- **Backend integration** — submits reports to the Timber API (`/api/v1/sdk/ingest`) using an SDK API key
- **Privacy** — `[data-timber-mask]` attribute redacts sensitive content from screenshots
- **Framework-agnostic** — works with React, Next.js, Vue, Svelte, plain HTML, etc.
- **Style isolation** — all UI renders inside a Shadow DOM so it never conflicts with the host app

## Quick Start

### 1. Install

```bash
npm install github:Justin-Beavers-Dev/timber-web-sdk
```

Or add it to your `package.json`:

```json
{
  "dependencies": {
    "timber-feedback-sdk": "github:Justin-Beavers-Dev/timber-web-sdk"
  }
}
```

### 2. Get your credentials

You need two values from your Timber project:

| Value | Where to find it |
|---|---|
| **Project ID** | Timber dashboard → project settings → copy the project UUID |
| **SDK API Key** | Timber dashboard → project settings → SDK Keys → create or copy an existing key |

### 3. Initialize the SDK

That's it — no server-side routes or Playwright setup needed. The SDK captures screenshots natively in the browser.

#### React / Next.js (App Router)

Create a client component:

```tsx
// src/components/TimberWidget.tsx
"use client";

import { useEffect } from "react";

export function TimberWidget() {
  useEffect(() => {
    import("timber-feedback-sdk").then(({ init }) => {
      init({
        projectId: "YOUR_PROJECT_ID",
        apiKey: "YOUR_SDK_API_KEY",
        apiUrl: "https://www.timber.report/api/v1",
        position: "bottom-right",
        theme: "auto",
      });
    });

    return () => {
      import("timber-feedback-sdk").then(({ destroy }) => destroy());
    };
  }, []);

  return null;
}
```

Add it to your root layout:

```tsx
// app/layout.tsx
import { TimberWidget } from "@/components/TimberWidget";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <TimberWidget />
      </body>
    </html>
  );
}
```

#### Plain HTML (UMD)

```html
<script src="path/to/sdk.umd.js"></script>
<script>
  window.Timber.init({
    projectId: "YOUR_PROJECT_ID",
    apiKey: "YOUR_SDK_API_KEY",
    apiUrl: "https://www.timber.report/api/v1",
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
  screenshotMode?: "native" | "api",  // Capture method — default: "native"
  screenshotApiUrl?: string,  // Only for "api" mode — default: "/api/timber/screenshot"
  position?: "bottom-right" | "bottom-left",  // Float button position — default: "bottom-right"
  theme?: "light" | "dark" | "auto",          // Widget theme — default: "auto"
  user?: {                    // Pre-fill user info on reports
    id?: string,
    email?: string,
    name?: string,
  },
})
```

### Screenshot modes

| Mode | How it works | Setup required |
|---|---|---|
| `"native"` (default) | Uses the browser's Screen Capture API (`getDisplayMedia`). A share dialog appears and the user selects the current tab. | None |
| `"api"` | Serializes the DOM and sends it to a server-side endpoint that renders a PNG with Playwright. | Requires a hosted screenshot route and `screenshotApiUrl` |

For most use cases, the default `"native"` mode is recommended — it requires zero server-side setup and produces pixel-perfect captures.

## Programmatic API

```ts
import { init, destroy, open, close } from "timber-feedback-sdk";

init({ ... });   // Initialize the widget
open();          // Open the menu programmatically
close();         // Close the widget back to idle
destroy();       // Remove the widget and restore console
```

## User Flow

1. **Click** the floating Timber button in the corner
2. **Select** "Take a Screenshot" from the menu
3. **Share** the current tab when the browser dialog appears
4. **Annotate** the screenshot — draw, add text, pick colors, undo/redo
5. **Click "Report"** to open the bug report form
6. **Fill in** title, description, expected behaviour, priority, and device
7. **Submit** — the SDK sends the report with screenshot + console logs to Timber

## Privacy & Masking

Add `data-timber-mask` to any HTML element to redact its content from screenshots:

```html
<div data-timber-mask>This content will appear as [masked] in screenshots</div>
```

The SDK automatically hides its own UI during screenshot capture.

## Architecture

- **Vanilla TypeScript** — zero runtime dependencies
- **Shadow DOM** — complete style isolation from the host app
- **State machine** — `idle → menu → capturing → annotating → reporting → idle`
- **Native capture** — `getDisplayMedia` with `preferCurrentTab` for seamless tab screenshots
- **Console capture** — intercepts `console.log/warn/error` + click events (200-event ring buffer)
- **Undo/redo** — canvas `ImageData` snapshot history (max 30 states)
- **Backend auth** — reports are sent with `X-API-Key` header to `/api/v1/sdk/ingest`

### Build outputs

```
dist/
  index.mjs       — ESM module (for bundlers)
  sdk.umd.js      — UMD bundle (window.Timber)
  index.d.ts      — TypeScript declarations
```

## Development

```bash
npm install
npm run build      # Type-check + Vite build
npm run typecheck  # Type-check only
npm run dev        # Vite dev server (for testing)
```
