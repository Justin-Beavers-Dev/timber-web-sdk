class ee {
  constructor() {
    this.buffer = [], this.clickHandler = null, this.originals = {
      log: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console)
    };
  }
  /** Start capturing console and click events */
  start() {
    const e = this;
    console.log = (...t) => {
      e.push({ type: "console", level: "log", timestamp: Date.now(), data: t }), e.originals.log(...t);
    }, console.warn = (...t) => {
      e.push({ type: "console", level: "warn", timestamp: Date.now(), data: t }), e.originals.warn(...t);
    }, console.error = (...t) => {
      e.push({ type: "console", level: "error", timestamp: Date.now(), data: t }), e.originals.error(...t);
    }, this.clickHandler = (t) => {
      var r, a;
      const n = t.target;
      e.push({
        type: "click",
        timestamp: Date.now(),
        data: {
          tag: ((r = n == null ? void 0 : n.tagName) == null ? void 0 : r.toLowerCase()) ?? "unknown",
          id: (n == null ? void 0 : n.id) || void 0,
          className: (n == null ? void 0 : n.className) || void 0,
          text: ((a = n == null ? void 0 : n.textContent) == null ? void 0 : a.slice(0, 100)) || void 0,
          x: t.clientX,
          y: t.clientY
        }
      });
    }, document.addEventListener("click", this.clickHandler, !0);
  }
  /** Add entry to buffer, evicting oldest if over limit */
  push(e) {
    this.buffer.push(e), this.buffer.length > 200 && this.buffer.shift();
  }
  /** Get a copy of the current log buffer */
  getLogs() {
    return [...this.buffer];
  }
  /** Restore original console methods and remove click listener */
  destroy() {
    console.log = this.originals.log, console.warn = this.originals.warn, console.error = this.originals.error, this.clickHandler && (document.removeEventListener("click", this.clickHandler, !0), this.clickHandler = null), this.buffer = [];
  }
}
async function te() {
  document.documentElement.style.cursor = "default";
  const o = await navigator.mediaDevices.getDisplayMedia({
    video: { displaySurface: "browser", cursor: "never" },
    preferCurrentTab: !0
  }), e = document.createElement("video");
  e.srcObject = o, await e.play();
  const t = document.createElement("canvas");
  return t.width = e.videoWidth, t.height = e.videoHeight, t.getContext("2d").drawImage(e, 0, 0), o.getTracks().forEach((n) => n.stop()), document.documentElement.style.cursor = "", new Promise((n, r) => {
    t.toBlob(
      (a) => a ? n(URL.createObjectURL(a)) : r(new Error("toBlob failed")),
      "image/png"
    );
  });
}
function ne() {
  const o = [];
  for (const e of Array.from(document.styleSheets))
    try {
      const t = Array.from(e.cssRules);
      o.push(t.map((n) => n.cssText).join(`
`));
    } catch {
      e.href && o.push(`@import url("${e.href}");`);
    }
  return o.map((e) => `<style>${e}</style>`).join(`
`);
}
async function oe(o) {
  const e = ne(), t = document.documentElement.cloneNode(!0);
  t.querySelectorAll("[data-timber-root]").forEach((p) => p.remove()), t.querySelectorAll("script").forEach((p) => p.remove()), t.querySelectorAll("[data-timber-mask]").forEach((p) => {
    p.textContent = "[masked]";
  });
  const n = t.querySelector("head"), r = t.querySelector("body"), a = r ? r.innerHTML : t.innerHTML;
  n && n.querySelectorAll('link[rel="stylesheet"], style').forEach((p) => p.remove());
  const i = (n ? n.innerHTML : "") + `
` + e, s = {
    url: window.location.href,
    headHtml: i,
    bodyHtml: a,
    width: window.innerWidth,
    height: window.innerHeight,
    deviceScaleFactor: window.devicePixelRatio || 1
  }, c = await fetch(o, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(s)
  });
  if (!c.ok)
    throw new Error(`Screenshot API returned ${c.status}: ${c.statusText}`);
  const m = await c.blob();
  return URL.createObjectURL(m);
}
function re(o) {
  const e = o === "dark", t = e ? "#121520" : "#ffffff", n = e ? "#e2e8f0" : "#020617", r = e ? "#1e293b" : "#f1f5f9", a = e ? "#334155" : "#e2e8f0", i = e ? "#f8fafc" : "#0f172a", s = e ? "#94a3b8" : "#64748b", c = e ? "#64748b" : "#94a3b8", m = e ? "#e2e8f0" : "#0f172a", p = e ? "#0f172a" : "#f8fafc", g = e ? "#121520" : "#ffffff";
  return (
    /* css */
    `
    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      color: ${n};
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* ── Float Button ── */
    .timber-float-btn {
      position: fixed;
      z-index: 2147483647;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: none;
      border: none;
      padding: 0;
      cursor: grab;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 3px 8px rgba(0,0,0,0.2));
      transition: transform 0.15s ease, filter 0.15s ease;
      user-select: none;
      touch-action: none;
      overflow: hidden;
    }
    .timber-float-btn:hover {
      transform: scale(1.08);
      filter: drop-shadow(0 4px 14px rgba(0,0,0,0.3));
    }
    .timber-float-btn:active {
      cursor: grabbing;
    }
    .timber-float-btn img {
      width: 100%;
      height: 100%;
      pointer-events: none;
      display: block;
      border-radius: 50%;
    }

    /* ── Menu ── */
    .timber-menu {
      position: fixed;
      z-index: 2147483647;
      background: ${t};
      border: 1px solid ${a};
      border-radius: 10px;
      padding: 6px;
      min-width: 200px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.18);
      animation: timber-fade-in 0.15s ease;
    }
    .timber-menu-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px 14px;
      background: none;
      border: none;
      border-radius: 6px;
      color: ${n};
      font-size: 14px;
      cursor: pointer;
      text-align: left;
    }
    .timber-menu-item:hover {
      background: ${r};
    }
    .timber-menu-item svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    /* ── Loader Overlay ── */
    .timber-loader-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: timber-fade-in 0.2s ease;
    }
    .timber-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255,255,255,0.2);
      border-top-color: #fff;
      border-radius: 50%;
      animation: timber-spin 0.7s linear infinite;
    }

    /* ── Annotation Overlay ── */
    .timber-annotation-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      background: rgba(0,0,0,0.85);
      display: flex;
      flex-direction: column;
      align-items: center;
      animation: timber-fade-in 0.2s ease;
    }
    .timber-canvas-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      overflow: hidden;
      width: 100%;
    }
    .timber-canvas-wrap canvas {
      max-width: 100%;
      max-height: 100%;
      border-radius: 6px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.4);
      cursor: crosshair;
    }

    /* ── Toolbar ── */
    .timber-toolbar {
      position: fixed;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 17px;
      padding: 8px;
      background: ${e ? "#1e293b" : "#ffffff"};
      border: 1px solid ${a};
      border-radius: 12px;
      box-shadow: 0 4px 12px ${e ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.15)"};
      cursor: grab;
      user-select: none;
      z-index: 2147483647;
    }
    .timber-toolbar.dragging {
      cursor: grabbing;
    }

    /* Toolbar layout sections */
    .timber-toolbar-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .timber-toolbar-actions {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    /* Vertical divider */
    .timber-toolbar-divider {
      width: 1px;
      height: 30px;
      background: ${a};
      flex-shrink: 0;
    }

    /* Icon buttons (text, undo, redo) */
    .timber-toolbar-icon-btn {
      min-width: 20px;
      height: 20px;
      padding: 0;
      border: none;
      background: none;
      color: ${e ? "#e2e8f0" : "#334155"};
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: color 0.1s, opacity 0.1s;
      opacity: 0.7;
    }
    .timber-toolbar-icon-btn:hover {
      opacity: 1;
    }
    .timber-toolbar-icon-btn.active {
      opacity: 1;
      color: ${i};
    }
    .timber-toolbar-icon-btn svg {
      pointer-events: none;
    }

    /* Undo/Redo wrapper */
    .timber-toolbar-undo-redo {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 0 20px;
    }

    /* Draw label */
    .timber-toolbar-draw-label {
      padding: 0 20px;
      border: none;
      background: none;
      color: ${e ? "#e2e8f0" : "#334155"};
      font-size: 14px;
      line-height: 20px;
      cursor: pointer;
      font-family: inherit;
      white-space: nowrap;
      opacity: 0.7;
      transition: opacity 0.1s;
    }
    .timber-toolbar-draw-label:hover {
      opacity: 1;
    }
    .timber-toolbar-draw-label.active {
      opacity: 1;
      color: ${i};
    }

    /* Color swatches wrapper */
    .timber-toolbar-swatches {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Color Swatches */
    .timber-color-swatch {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      padding: 0;
      transition: transform 0.1s, border-color 0.15s;
    }
    .timber-color-swatch:hover {
      transform: scale(1.15);
    }
    .timber-color-swatch.active {
      border-color: ${e ? "#e2e8f0" : "#334155"};
    }

    /* Cancel button */
    .timber-toolbar-cancel {
      width: 77px;
      padding: 10px;
      border: 1px solid ${a};
      border-radius: 6px;
      background: ${e ? "#1e293b" : "#ffffff"};
      color: ${n};
      font-size: 14px;
      line-height: 20px;
      cursor: pointer;
      font-family: inherit;
      text-align: center;
      white-space: nowrap;
      transition: background 0.1s;
    }
    .timber-toolbar-cancel:hover {
      background: ${r};
    }

    /* Report button */
    .timber-toolbar-report {
      width: 77px;
      padding: 10px;
      border: none;
      border-radius: 6px;
      background: ${m};
      color: ${p};
      font-size: 14px;
      line-height: 20px;
      cursor: pointer;
      font-family: inherit;
      text-align: center;
      white-space: nowrap;
      transition: opacity 0.1s;
    }
    .timber-toolbar-report:hover {
      opacity: 0.9;
    }

    /* ── Text Input (annotation) ── */
    .timber-text-input {
      position: absolute;
      background: transparent;
      border: 1px dashed rgba(255,255,255,0.5);
      color: currentColor;
      font-size: 32px;
      font-weight: bold;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 2px 4px;
      outline: none;
      min-width: 100px;
      z-index: 10;
    }

    /* ── Report Modal ── */
    .timber-report-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: timber-fade-in 0.2s ease;
    }
    .timber-report-modal {
      background: ${g};
      border-radius: 12px;
      padding: 44px;
      width: 720px;
      max-width: 92vw;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 24px 64px rgba(0,0,0,0.25);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* ── Header ── */
    .timber-report-header-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 0;
    }
    .timber-report-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .timber-report-header {
      font-size: 30px;
      font-weight: 400;
      line-height: 1;
      color: ${i};
    }
    .timber-report-close {
      width: 20px;
      height: 20px;
      background: none;
      border: none;
      cursor: pointer;
      color: ${n};
      opacity: 0.7;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 3px;
      transition: opacity 0.15s;
    }
    .timber-report-close:hover {
      opacity: 1;
    }
    .timber-report-close svg {
      width: 20px;
      height: 20px;
    }
    .timber-report-subtitle {
      font-size: 14px;
      line-height: 20px;
      color: ${i};
    }

    /* ── Screenshot ── */
    .timber-report-screenshot-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .timber-report-screenshot-label {
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
      color: ${i};
    }
    .timber-report-thumb {
      width: 198px;
      height: 140px;
      object-fit: cover;
      border-radius: 8px;
    }

    /* ── Form ── */
    .timber-report-fields {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .timber-report-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .timber-report-label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .timber-report-label {
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
      color: ${i};
    }
    .timber-report-char-count {
      font-size: 12px;
      line-height: 1;
      color: ${s};
    }
    .timber-report-input {
      width: 100%;
      height: 48px;
      padding: 0 12px;
      border: 1px solid ${a};
      border-radius: 10px;
      background: transparent;
      color: ${n};
      font-size: 14px;
      line-height: 20px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .timber-report-input:focus {
      border-color: ${c};
      box-shadow: 0 0 0 2px ${e ? "rgba(148,163,184,0.1)" : "rgba(15,23,42,0.05)"};
    }
    .timber-report-input::placeholder {
      color: ${c};
    }
    .timber-report-textarea {
      width: 100%;
      height: 80px;
      padding: 6px 12px;
      border: 1px solid ${a};
      border-radius: 10px;
      background: transparent;
      color: ${n};
      font-size: 14px;
      line-height: 20px;
      font-family: inherit;
      resize: none;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .timber-report-textarea:focus {
      border-color: ${c};
      box-shadow: 0 0 0 2px ${e ? "rgba(148,163,184,0.1)" : "rgba(15,23,42,0.05)"};
    }
    .timber-report-textarea::placeholder {
      color: ${c};
    }

    /* ── Priority + Device Row ── */
    .timber-report-row {
      display: flex;
      gap: 12px;
    }
    .timber-report-row > .timber-report-field {
      flex: 1;
      min-width: 0;
    }
    .timber-priority-dropdown {
      position: relative;
    }
    .timber-priority-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 48px;
      padding: 0 12px;
      border: 1px solid ${a};
      border-radius: 10px;
      background: transparent;
      color: ${n};
      font-size: 14px;
      font-family: inherit;
      cursor: pointer;
      text-align: left;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .timber-priority-trigger:focus {
      border-color: ${c};
      box-shadow: 0 0 0 2px ${e ? "rgba(148,163,184,0.1)" : "rgba(15,23,42,0.05)"};
      outline: none;
    }
    .timber-priority-trigger-label {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .timber-priority-placeholder {
      color: ${c};
    }
    .timber-priority-chevron {
      transition: transform 0.2s;
      flex-shrink: 0;
      color: ${n};
    }
    .timber-priority-chevron.open {
      transform: rotate(180deg);
    }
    .timber-priority-options {
      position: absolute;
      bottom: calc(100% + 4px);
      left: 0;
      right: 0;
      background: ${g};
      border: 1px solid ${a};
      border-radius: 8px;
      padding: 4px;
      box-shadow: 0 -4px 30px rgba(0,0,0,${e ? "0.4" : "0.12"});
      z-index: 10;
      animation: timber-fade-in 0.1s ease;
    }
    .timber-priority-option {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 8px;
      background: none;
      border: none;
      border-radius: 6px;
      color: ${n};
      font-size: 14px;
      cursor: pointer;
      text-align: left;
    }
    .timber-priority-option:hover {
      background: ${r};
    }
    .timber-priority-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    /* ── Error ── */
    .timber-report-error {
      padding: 10px 12px;
      border-radius: 8px;
      background: ${e ? "#3b1818" : "#fef2f2"};
      border: 1px solid ${e ? "#5c2020" : "#fecaca"};
      color: ${e ? "#fca5a5" : "#dc2626"};
      font-size: 14px;
      line-height: 20px;
    }

    /* ── Buttons ── */
    .timber-report-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .timber-report-cancel {
      height: 40px;
      padding: 8px 20px;
      border-radius: 8px;
      border: 1px solid ${a};
      background: ${e ? "transparent" : "#ffffff"};
      color: ${n};
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s;
    }
    .timber-report-cancel:hover {
      background: ${r};
    }
    .timber-report-submit {
      height: 40px;
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      background: ${m};
      color: ${p};
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: opacity 0.15s;
    }
    .timber-report-submit:hover:not(:disabled) {
      opacity: 0.9;
    }
    .timber-report-submit:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .timber-report-submit-spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid ${e ? "rgba(15,23,42,0.3)" : "rgba(248,250,252,0.3)"};
      border-top-color: ${p};
      border-radius: 50%;
      animation: timber-spin 0.6s linear infinite;
      margin-right: 6px;
      vertical-align: middle;
    }

    /* ── Animations ── */
    @keyframes timber-fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes timber-spin {
      to { transform: rotate(360deg); }
    }
  `
  );
}
const ie = "data:image/png;base64,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";
function ae(o, e) {
  const t = document.createElement("button");
  t.className = "timber-float-btn";
  const n = document.createElement("img");
  n.src = ie, n.alt = "Report a bug", n.draggable = !1, t.appendChild(n), t.setAttribute("aria-label", "Open feedback");
  const r = 20;
  t.style.bottom = `${r}px`, e.position === "bottom-left" ? t.style.left = `${r}px` : t.style.right = `${r}px`;
  let a = !1, i = !1, s = 0, c = 0, m = 0, p = 0;
  const g = (u) => {
    a = !0, i = !1, s = u.clientX, c = u.clientY;
    const b = t.getBoundingClientRect();
    m = b.left, p = b.top, t.setPointerCapture(u.pointerId), u.preventDefault();
  }, E = (u) => {
    if (!a) return;
    const b = u.clientX - s, y = u.clientY - c;
    (Math.abs(b) > 3 || Math.abs(y) > 3) && (i = !0), i && (t.style.right = "auto", t.style.left = "auto", t.style.bottom = "auto", t.style.left = `${m + b}px`, t.style.top = `${p + y}px`);
  }, l = () => {
    a = !1, i || e.onClick();
  };
  return t.addEventListener("pointerdown", g), t.addEventListener("pointermove", E), t.addEventListener("pointerup", l), o.appendChild(t), t;
}
const se = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
function le(o, e, t) {
  const n = document.createElement("div");
  n.className = "timber-menu", n.style.bottom = `${window.innerHeight - e.top + 8}px`, n.style.right = `${window.innerWidth - e.right}px`;
  const r = document.createElement("button");
  r.className = "timber-menu-item", r.innerHTML = `${se}<span>Take a Screenshot</span>`, r.addEventListener("click", (i) => {
    i.stopPropagation(), t.onScreenshot();
  }), n.appendChild(r);
  const a = (i) => {
    n.contains(i.target) || (t.onClose(), document.removeEventListener("click", a, !0));
  };
  return requestAnimationFrame(() => {
    document.addEventListener("click", a, !0);
  }), o.appendChild(n), n;
}
function ce(o) {
  const e = document.createElement("div");
  e.className = "timber-loader-overlay";
  const t = document.createElement("div");
  return t.className = "timber-spinner", e.appendChild(t), o.appendChild(e), e;
}
const de = ["#ef4444", "#3b82f6", "#facc15", "#22c55e", "#ec4899", "#000000"], pe = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>', he = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>', ue = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>';
function Y() {
  const o = document.createElement("span");
  return o.className = "timber-toolbar-divider", o;
}
function z(o, e, t) {
  const n = document.createElement("button");
  return n.className = `timber-toolbar-icon-btn ${o}`, n.innerHTML = e, n.addEventListener("click", t), n;
}
function me(o, e, t, n) {
  const r = document.createElement("div");
  r.className = "timber-toolbar";
  const a = document.createElement("div");
  a.className = "timber-toolbar-section";
  const i = z(
    e.tool === "text" ? "active" : "",
    pe,
    () => {
      e.tool = "text", i.classList.add("active"), p.classList.remove("active"), t.onToolChange("text");
    }
  );
  i.style.padding = "0 6px", a.appendChild(i), a.appendChild(Y());
  const s = document.createElement("div");
  s.className = "timber-toolbar-undo-redo";
  const c = z("", he, () => t.onUndo()), m = z("", ue, () => t.onRedo());
  s.appendChild(c), s.appendChild(m), a.appendChild(s), a.appendChild(Y());
  const p = document.createElement("button");
  p.className = `timber-toolbar-draw-label${e.tool === "draw" ? " active" : ""}`, p.textContent = "Draw", p.addEventListener("click", () => {
    e.tool = "draw", p.classList.add("active"), i.classList.remove("active"), t.onToolChange("draw");
  }), a.appendChild(p);
  const g = document.createElement("div");
  g.className = "timber-toolbar-swatches";
  const E = de.map((h) => {
    const v = document.createElement("button");
    return v.className = `timber-color-swatch${h === e.color ? " active" : ""}`, v.style.background = h, v.setAttribute("aria-label", `Color ${h}`), v.addEventListener("click", () => {
      e.color = h, E.forEach((S) => S.classList.remove("active")), v.classList.add("active"), t.onColorChange(h);
    }), v;
  });
  E.forEach((h) => g.appendChild(h)), a.appendChild(g), r.appendChild(a);
  const l = document.createElement("div");
  l.className = "timber-toolbar-actions";
  const u = document.createElement("button");
  u.className = "timber-toolbar-cancel", u.textContent = "Cancel", u.addEventListener("click", () => t.onCancel());
  const b = document.createElement("button");
  b.className = "timber-toolbar-report", b.textContent = "Report", b.addEventListener("click", () => t.onSend()), l.appendChild(u), l.appendChild(b), r.appendChild(l);
  let y = !1, U = 0, O = 0, x = 0, k = 0;
  return r.addEventListener("pointerdown", (h) => {
    if (h.target.closest("button")) return;
    y = !0, r.classList.add("dragging"), U = h.clientX, O = h.clientY;
    const v = r.getBoundingClientRect();
    x = v.left, k = v.top, r.setPointerCapture(h.pointerId), h.preventDefault();
  }), r.addEventListener("pointermove", (h) => {
    if (!y) return;
    const v = h.clientX - U, S = h.clientY - O;
    r.style.left = `${x + v}px`, r.style.top = `${k + S}px`, r.style.bottom = "auto", r.style.transform = "none";
  }), r.addEventListener("pointerup", () => {
    y = !1, r.classList.remove("dragging");
  }), r;
}
const be = 30;
function fe(o, e, t, n) {
  const r = document.createElement("div");
  r.className = "timber-annotation-overlay";
  const a = document.createElement("div");
  a.className = "timber-canvas-wrap";
  const i = document.createElement("canvas"), s = i.getContext("2d");
  let c = "draw", m = "#ef4444", p = !1, g = 0, E = 0, l = null;
  const u = [], b = [];
  function y() {
    if (i.width === 0 || i.height === 0) return;
    const d = s.getImageData(0, 0, i.width, i.height);
    u.push(d), u.length > be && u.shift(), b.length = 0;
  }
  function U() {
    if (u.length === 0) return;
    const d = s.getImageData(0, 0, i.width, i.height);
    b.push(d);
    const f = u.pop();
    s.putImageData(f, 0, 0);
  }
  function O() {
    if (b.length === 0) return;
    const d = s.getImageData(0, 0, i.width, i.height);
    u.push(d);
    const f = b.pop();
    s.putImageData(f, 0, 0);
  }
  const x = new Image();
  x.crossOrigin = "anonymous", x.onload = () => {
    i.width = x.naturalWidth, i.height = x.naturalHeight;
    const d = window.innerWidth - 32, f = window.innerHeight - 80, w = Math.min(d / x.naturalWidth, f / x.naturalHeight, 1);
    i.style.width = `${x.naturalWidth * w}px`, i.style.height = `${x.naturalHeight * w}px`, s.drawImage(x, 0, 0);
  }, x.src = e;
  function k(d) {
    const f = i.getBoundingClientRect(), w = i.width / f.width, C = i.height / f.height;
    return [(d.clientX - f.left) * w, (d.clientY - f.top) * C];
  }
  i.addEventListener("pointerdown", (d) => {
    c === "draw" && (y(), p = !0, [g, E] = k(d), i.setPointerCapture(d.pointerId));
  }), i.addEventListener("pointermove", (d) => {
    if (!p || c !== "draw") return;
    const [f, w] = k(d);
    s.beginPath(), s.moveTo(g, E), s.lineTo(f, w), s.strokeStyle = m, s.lineWidth = 12, s.lineCap = "round", s.lineJoin = "round", s.stroke(), g = f, E = w;
  }), i.addEventListener("pointerup", () => {
    p = !1;
  }), i.addEventListener("click", (d) => {
    if (c !== "text") return;
    h();
    const [f, w] = k(d), C = i.getBoundingClientRect(), D = i.width / C.width;
    l = document.createElement("input"), l.type = "text", l.className = "timber-text-input", l.style.left = `${d.clientX - C.left + a.offsetLeft}px`, l.style.top = `${d.clientY - C.top + a.offsetTop}px`, l.style.color = m, l.style.fontSize = `${Math.round(30 / D)}px`, l.dataset.cx = String(f), l.dataset.cy = String(w), l.addEventListener("keydown", (T) => {
      T.key === "Enter" && h();
    }), a.style.position = "relative", a.appendChild(l), l.focus();
  });
  function h() {
    if (!l || !l.value) {
      l == null || l.remove(), l = null;
      return;
    }
    y();
    const d = parseFloat(l.dataset.cx || "0"), f = parseFloat(l.dataset.cy || "0");
    s.font = "bold 30px -apple-system, BlinkMacSystemFont, sans-serif", s.fillStyle = m, s.fillText(l.value, d, f), l.remove(), l = null;
  }
  const B = me(o, {
    tool: c,
    color: m
  }, {
    onToolChange(d) {
      h(), c = d;
    },
    onColorChange(d) {
      m = d;
    },
    onUndo() {
      h(), U();
    },
    onRedo() {
      O();
    },
    onSend() {
      h();
      const d = i.toDataURL("image/png");
      t.onSend(d);
    },
    onCancel() {
      t.onCancel();
    }
  });
  return a.appendChild(i), r.appendChild(a), r.appendChild(B), o.appendChild(r), r;
}
const V = '<svg width="14" height="12" viewBox="0 0 14 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="2 4 7 9 12 4"/></svg>', ge = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>', M = 150, P = 150, xe = [
  { value: "no_priority", label: "No Priority", color: "#94a3b8" },
  { value: "urgent", label: "Urgent", color: "#ef4444" },
  { value: "high", label: "High", color: "#f97316" },
  { value: "medium", label: "Medium", color: "#eab308" },
  { value: "low", label: "Low", color: "#22c55e" }
];
function ye(o, e, t, n) {
  let r = null, a = !1;
  const i = document.createElement("div");
  i.className = "timber-report-overlay";
  const s = document.createElement("div");
  s.className = "timber-report-modal";
  const c = document.createElement("div");
  c.className = "timber-report-header-section";
  const m = document.createElement("div");
  m.className = "timber-report-header-row";
  const p = document.createElement("h3");
  p.className = "timber-report-header", p.textContent = "Report a Bug";
  const g = document.createElement("button");
  g.type = "button", g.className = "timber-report-close", g.innerHTML = ge, g.addEventListener("click", () => n.onCancel()), m.appendChild(p), m.appendChild(g), c.appendChild(m);
  const E = document.createElement("p");
  E.className = "timber-report-subtitle", E.textContent = "Provide details about the issue so our team can investigate and resolve it quickly.", c.appendChild(E), s.appendChild(c);
  const l = document.createElement("div");
  l.className = "timber-report-screenshot-section";
  const u = document.createElement("p");
  u.className = "timber-report-screenshot-label", u.textContent = "Screenshot", l.appendChild(u);
  const b = document.createElement("img");
  b.className = "timber-report-thumb", b.src = e, b.alt = "Screenshot preview", l.appendChild(b), s.appendChild(l);
  const y = document.createElement("div");
  y.className = "timber-report-fields";
  const U = G("Title"), O = I("Enter your Title");
  U.appendChild(O), y.appendChild(U);
  const x = J("Bug Description", M), k = $(
    "Please provide more info regarding the current behaviour...",
    M
  ), h = x.querySelector(".timber-report-char-count");
  k.addEventListener("input", () => {
    h.textContent = `${k.value.length}/${M}`, Z();
  }), x.appendChild(k), y.appendChild(x);
  const v = J("Expected Behaviour", P), S = $(
    "Please provide more info about the expected behaviour...",
    P
  ), B = v.querySelector(".timber-report-char-count");
  S.addEventListener("input", () => {
    B.textContent = `${S.value.length}/${P}`, Z();
  }), v.appendChild(S), y.appendChild(v);
  const d = document.createElement("div");
  d.className = "timber-report-row";
  const f = G("Priority"), w = document.createElement("div");
  w.className = "timber-priority-dropdown";
  const C = document.createElement("button");
  C.type = "button", C.className = "timber-priority-trigger", C.innerHTML = `<span class="timber-priority-placeholder">Choose Priority</span><span class="timber-priority-chevron">${V}</span>`;
  const D = document.createElement("div");
  D.className = "timber-priority-options", D.style.display = "none";
  for (const A of xe) {
    const j = document.createElement("button");
    j.type = "button", j.className = "timber-priority-option", j.innerHTML = `<span class="timber-priority-dot" style="background:${A.color}"></span>${_(A.label)}`, j.addEventListener("click", () => {
      r = A.value, C.innerHTML = `<span class="timber-priority-trigger-label"><span class="timber-priority-dot" style="background:${A.color}"></span>${_(A.label)}</span><span class="timber-priority-chevron">${V}</span>`, K(), Z();
    }), D.appendChild(j);
  }
  C.addEventListener("click", () => {
    a = !a, D.style.display = a ? "" : "none";
    const A = C.querySelector(".timber-priority-chevron");
    A == null || A.classList.toggle("open", a);
  }), w.appendChild(C), w.appendChild(D), f.appendChild(w), d.appendChild(f);
  const T = G("Device"), F = I("Enter the Device");
  F.value = ve(), T.appendChild(F), d.appendChild(T), y.appendChild(d), s.appendChild(y);
  const q = document.createElement("div");
  q.className = "timber-report-error", q.style.display = "none", s.appendChild(q);
  const W = document.createElement("div");
  W.className = "timber-report-buttons";
  const H = document.createElement("button");
  H.type = "button", H.className = "timber-report-cancel", H.textContent = "Cancel", H.addEventListener("click", () => n.onCancel());
  const N = document.createElement("button");
  N.type = "button", N.className = "timber-report-submit", N.textContent = "Report a Bug", N.disabled = !0, N.addEventListener("click", () => {
    X() && n.onSubmit({
      title: O.value.trim(),
      description: k.value.trim(),
      expectedBehaviour: S.value.trim(),
      priority: r,
      device: F.value.trim()
    });
  }), W.appendChild(H), W.appendChild(N), s.appendChild(W), i.appendChild(s), o.appendChild(i), O.addEventListener("input", () => Z()), i.addEventListener("click", (A) => {
    a && !w.contains(A.target) && K();
  }), requestAnimationFrame(() => O.focus());
  function K() {
    a = !1, D.style.display = "none";
    const A = C.querySelector(".timber-priority-chevron");
    A == null || A.classList.remove("open");
  }
  function X() {
    return O.value.trim().length > 0 && k.value.trim().length > 0 && S.value.trim().length > 0 && r !== null;
  }
  function Z() {
    N.disabled = !X();
  }
  return i;
}
function R(o, e) {
  const t = o.querySelector(".timber-report-error");
  t && (t.textContent = e, t.style.display = e ? "" : "none");
}
function Q(o, e) {
  const t = o.querySelector(".timber-report-submit");
  if (!t) return;
  e ? (t.disabled = !0, t.innerHTML = '<span class="timber-report-submit-spinner"></span>Sending...') : (t.disabled = !1, t.textContent = "Report a Bug");
  const n = o.querySelector(".timber-report-cancel");
  n && (n.style.display = e ? "none" : "");
}
function G(o) {
  const e = document.createElement("div");
  e.className = "timber-report-field";
  const t = document.createElement("label");
  return t.className = "timber-report-label", t.textContent = o, e.appendChild(t), e;
}
function J(o, e) {
  const t = document.createElement("div");
  t.className = "timber-report-field";
  const n = document.createElement("div");
  n.className = "timber-report-label-row";
  const r = document.createElement("label");
  r.className = "timber-report-label", r.textContent = o;
  const a = document.createElement("span");
  return a.className = "timber-report-char-count", a.textContent = `0/${e}`, n.appendChild(r), n.appendChild(a), t.appendChild(n), t;
}
function I(o) {
  const e = document.createElement("input");
  return e.type = "text", e.className = "timber-report-input", e.placeholder = o, e;
}
function $(o, e) {
  const t = document.createElement("textarea");
  return t.className = "timber-report-textarea", t.placeholder = o, t.maxLength = e, t;
}
function ve() {
  const o = navigator.userAgent;
  let e = "Unknown", t = "Unknown";
  return o.includes("Firefox/") ? e = "Firefox" : o.includes("Edg/") ? e = "Edge" : o.includes("Chrome/") ? e = "Chrome" : o.includes("Safari/") && (e = "Safari"), o.includes("Mac OS") ? t = "macOS" : o.includes("Windows") ? t = "Windows" : o.includes("Linux") ? t = "Linux" : o.includes("Android") ? t = "Android" : (o.includes("iPhone") || o.includes("iPad")) && (t = "iOS"), `${e} on ${t}`;
}
function _(o) {
  return o.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
class we {
  constructor(e) {
    this.state = "idle", this.floatBtn = null, this.menuEl = null, this.loaderEl = null, this.annotationEl = null, this.reportEl = null, this.screenshotObjectUrl = null, this.screenshotDataUrl = null, this.config = e, this.host = document.createElement("div"), this.host.setAttribute("data-timber-root", ""), this.host.style.cssText = "position:fixed;z-index:2147483647;top:0;left:0;width:0;height:0;overflow:visible;", document.body.appendChild(this.host), this.shadow = this.host.attachShadow({ mode: "open" });
    const t = document.createElement("style");
    t.textContent = re(this.config.theme), this.shadow.appendChild(t), this.root = document.createElement("div"), this.shadow.appendChild(this.root), this.logCapture = new ee(), this.logCapture.start(), this.floatBtn = ae(this.root, {
      position: this.config.position,
      onClick: () => this.handleFloatClick()
    });
  }
  /** Toggle menu on float button click */
  handleFloatClick() {
    this.state === "idle" ? this.transitionTo("menu") : this.state === "menu" && this.transitionTo("idle");
  }
  /** Central state transition handler */
  transitionTo(e) {
    switch (this.cleanupStateUI(), this.state = e, e) {
      case "idle":
        this.floatBtn && (this.floatBtn.style.display = "");
        break;
      case "menu":
        if (this.floatBtn) {
          this.floatBtn.style.display = "";
          const t = this.floatBtn.getBoundingClientRect();
          this.menuEl = le(this.root, t, {
            onScreenshot: () => this.transitionTo("capturing"),
            onClose: () => this.transitionTo("idle")
          });
        }
        break;
      case "capturing":
        this.floatBtn && (this.floatBtn.style.display = "none"), this.loaderEl = ce(this.root), this.doCapture();
        break;
      case "annotating":
        break;
      case "reporting":
        this.floatBtn && (this.floatBtn.style.display = "none");
        break;
    }
  }
  /** Capture screenshot and transition to annotating */
  async doCapture() {
    var e, t;
    try {
      let n;
      this.config.screenshotMode === "native" ? (this.host.style.visibility = "hidden", await new Promise((r) => requestAnimationFrame(r)), n = await te(), this.host.style.visibility = "") : n = await oe(this.config.screenshotApiUrl), this.screenshotObjectUrl = n, (e = this.loaderEl) == null || e.remove(), this.loaderEl = null, this.state = "annotating", this.annotationEl = fe(
        this.root,
        n,
        {
          onSend: (r) => this.handleAnnotationSend(r),
          onCancel: () => this.transitionTo("idle")
        },
        this.config.theme
      );
    } catch (n) {
      console.error("[Timber] Screenshot capture failed:", n), (t = this.loaderEl) == null || t.remove(), this.loaderEl = null, this.transitionTo("idle");
    }
  }
  /** Annotation done → show report modal */
  handleAnnotationSend(e) {
    this.screenshotDataUrl = e, this.cleanupStateUI(), this.state = "reporting", this.floatBtn && (this.floatBtn.style.display = "none"), this.reportEl = ye(
      this.root,
      e,
      this.logCapture.getLogs(),
      {
        onSubmit: (t) => this.handleSubmitReport(t),
        onCancel: () => this.transitionTo("idle")
      }
    );
  }
  /** Build ingest payload and POST to backend */
  async handleSubmitReport(e) {
    var a, i;
    if (!this.reportEl) return;
    R(this.reportEl, ""), Q(this.reportEl, !0);
    const t = this.logCapture.getLogs(), n = [];
    if (this.screenshotDataUrl) {
      const s = this.screenshotDataUrl.split(",")[1];
      s && n.push({
        filename: "screenshot.png",
        contentType: "image/png",
        data: s
      });
    }
    const r = {
      eventType: "bug_report",
      title: e.title,
      description: `${e.description}

Expected behaviour: ${e.expectedBehaviour}`,
      deviceInfo: {
        userAgent: navigator.userAgent,
        device: e.device,
        priority: e.priority
      },
      attachments: n,
      metadata: {
        url: window.location.href,
        logs: t.slice(-50)
      },
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      tags: ["web-sdk"],
      userEmail: (a = this.config.user) == null ? void 0 : a.email
    };
    try {
      const s = await fetch(`${this.config.apiUrl}/sdk/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.config.apiKey
        },
        body: JSON.stringify(r)
      });
      if (!s.ok) {
        const c = await s.json().catch(() => null), m = ((i = c == null ? void 0 : c.error) == null ? void 0 : i.message) ?? `Server error (${s.status})`;
        throw new Error(m);
      }
      this.screenshotObjectUrl && (URL.revokeObjectURL(this.screenshotObjectUrl), this.screenshotObjectUrl = null), this.screenshotDataUrl = null, this.transitionTo("idle");
    } catch (s) {
      const c = s instanceof Error ? s.message : "Failed to send report";
      console.error("[Timber] Submit failed:", c), this.reportEl && (Q(this.reportEl, !1), R(this.reportEl, c));
    }
  }
  /** Remove any state-specific UI elements */
  cleanupStateUI() {
    var e, t, n, r;
    (e = this.menuEl) == null || e.remove(), this.menuEl = null, (t = this.loaderEl) == null || t.remove(), this.loaderEl = null, (n = this.annotationEl) == null || n.remove(), this.annotationEl = null, (r = this.reportEl) == null || r.remove(), this.reportEl = null;
  }
  /** Open the widget menu programmatically */
  open() {
    this.state === "idle" && this.transitionTo("menu");
  }
  /** Close the widget back to idle */
  close() {
    this.transitionTo("idle");
  }
  /** Fully destroy the widget and restore console */
  destroy() {
    var e;
    this.cleanupStateUI(), (e = this.floatBtn) == null || e.remove(), this.floatBtn = null, this.logCapture.destroy(), this.screenshotObjectUrl && (URL.revokeObjectURL(this.screenshotObjectUrl), this.screenshotObjectUrl = null), this.host.remove();
  }
}
let L = null;
function Ae(o) {
  var e;
  return o === "light" || o === "dark" ? o : typeof window < "u" && ((e = window.matchMedia) != null && e.call(window, "(prefers-color-scheme: dark)").matches) ? "dark" : "light";
}
function Ce(o) {
  if (!(o != null && o.projectId))
    throw new Error("[Timber] projectId is required");
  if (!(o != null && o.apiKey))
    throw new Error("[Timber] apiKey is required");
  L && (L.destroy(), L = null);
  const e = {
    projectId: o.projectId,
    apiKey: o.apiKey,
    apiUrl: (o.apiUrl ?? "https://www.timber.report/api/v1").replace(/\/+$/, ""),
    screenshotMode: o.screenshotMode ?? "native",
    screenshotApiUrl: o.screenshotApiUrl ?? "/api/timber/screenshot",
    position: o.position ?? "bottom-right",
    theme: Ae(o.theme ?? "auto"),
    user: o.user
  };
  L = new we(e);
}
function Le() {
  L && (L.destroy(), L = null);
}
function Ee() {
  L == null || L.open();
}
function ke() {
  L == null || L.close();
}
export {
  ke as close,
  Le as destroy,
  Ce as init,
  Ee as open
};
//# sourceMappingURL=index.mjs.map
