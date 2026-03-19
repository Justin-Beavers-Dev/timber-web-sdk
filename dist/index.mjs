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
      var n, a;
      const o = t.target;
      e.push({
        type: "click",
        timestamp: Date.now(),
        data: {
          tag: ((n = o == null ? void 0 : o.tagName) == null ? void 0 : n.toLowerCase()) ?? "unknown",
          id: (o == null ? void 0 : o.id) || void 0,
          className: (o == null ? void 0 : o.className) || void 0,
          text: ((a = o == null ? void 0 : o.textContent) == null ? void 0 : a.slice(0, 100)) || void 0,
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
  const r = await navigator.mediaDevices.getDisplayMedia({
    video: { displaySurface: "browser", cursor: "never" },
    preferCurrentTab: !0
  }), e = document.createElement("video");
  e.srcObject = r, await e.play();
  const t = document.createElement("canvas");
  return t.width = e.videoWidth, t.height = e.videoHeight, t.getContext("2d").drawImage(e, 0, 0), r.getTracks().forEach((o) => o.stop()), document.documentElement.style.cursor = "", new Promise((o, n) => {
    t.toBlob(
      (a) => a ? o(URL.createObjectURL(a)) : n(new Error("toBlob failed")),
      "image/png"
    );
  });
}
function oe() {
  const r = [];
  for (const e of Array.from(document.styleSheets))
    try {
      const t = Array.from(e.cssRules);
      r.push(t.map((o) => o.cssText).join(`
`));
    } catch {
      e.href && r.push(`@import url("${e.href}");`);
    }
  return r.map((e) => `<style>${e}</style>`).join(`
`);
}
async function re(r) {
  const e = oe(), t = document.documentElement.cloneNode(!0);
  t.querySelectorAll("[data-timber-root]").forEach((p) => p.remove()), t.querySelectorAll("script").forEach((p) => p.remove()), t.querySelectorAll("[data-timber-mask]").forEach((p) => {
    p.textContent = "[masked]";
  });
  const o = t.querySelector("head"), n = t.querySelector("body"), a = n ? n.innerHTML : t.innerHTML;
  o && o.querySelectorAll('link[rel="stylesheet"], style').forEach((p) => p.remove());
  const i = (o ? o.innerHTML : "") + `
` + e, s = {
    url: window.location.href,
    headHtml: i,
    bodyHtml: a,
    width: window.innerWidth,
    height: window.innerHeight,
    deviceScaleFactor: window.devicePixelRatio || 1
  }, c = await fetch(r, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(s)
  });
  if (!c.ok)
    throw new Error(`Screenshot API returned ${c.status}: ${c.statusText}`);
  const u = await c.blob();
  return URL.createObjectURL(u);
}
function ne(r) {
  const e = r === "dark", t = e ? "#121520" : "#ffffff", o = e ? "#e2e8f0" : "#020617", n = e ? "#1e293b" : "#f1f5f9", a = e ? "#334155" : "#e2e8f0", i = e ? "#f8fafc" : "#0f172a", s = e ? "#94a3b8" : "#64748b", c = e ? "#64748b" : "#94a3b8", u = e ? "#e2e8f0" : "#0f172a", p = e ? "#0f172a" : "#f8fafc", g = e ? "#121520" : "#ffffff";
  return (
    /* css */
    `
    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      color: ${o};
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
      color: ${o};
      font-size: 14px;
      cursor: pointer;
      text-align: left;
    }
    .timber-menu-item:hover {
      background: ${n};
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
      color: ${o};
      font-size: 14px;
      line-height: 20px;
      cursor: pointer;
      font-family: inherit;
      text-align: center;
      white-space: nowrap;
      transition: background 0.1s;
    }
    .timber-toolbar-cancel:hover {
      background: ${n};
    }

    /* Report button */
    .timber-toolbar-report {
      width: 77px;
      padding: 10px;
      border: none;
      border-radius: 6px;
      background: ${u};
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
      color: ${o};
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
      color: ${o};
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
      color: ${o};
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
      color: ${o};
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
      color: ${o};
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
      color: ${o};
      font-size: 14px;
      cursor: pointer;
      text-align: left;
    }
    .timber-priority-option:hover {
      background: ${n};
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
      color: ${o};
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s;
    }
    .timber-report-cancel:hover {
      background: ${n};
    }
    .timber-report-submit {
      height: 40px;
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      background: ${u};
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
function ae(r, e) {
  const t = document.createElement("button");
  t.className = "timber-float-btn";
  const o = document.createElement("img");
  o.src = ie, o.alt = "Report a bug", o.draggable = !1, t.appendChild(o), t.setAttribute("aria-label", "Open feedback");
  const n = 20;
  t.style.bottom = `${n}px`, e.position === "bottom-left" ? t.style.left = `${n}px` : t.style.right = `${n}px`;
  let a = !1, i = !1, s = 0, c = 0, u = 0, p = 0;
  const g = (m) => {
    a = !0, i = !1, s = m.clientX, c = m.clientY;
    const b = t.getBoundingClientRect();
    u = b.left, p = b.top, t.setPointerCapture(m.pointerId), m.preventDefault();
  }, S = (m) => {
    if (!a) return;
    const b = m.clientX - s, y = m.clientY - c;
    (Math.abs(b) > 3 || Math.abs(y) > 3) && (i = !0), i && (t.style.right = "auto", t.style.left = "auto", t.style.bottom = "auto", t.style.left = `${u + b}px`, t.style.top = `${p + y}px`);
  }, l = () => {
    a = !1, i || e.onClick();
  };
  return t.addEventListener("pointerdown", g), t.addEventListener("pointermove", S), t.addEventListener("pointerup", l), r.appendChild(t), t;
}
const se = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
function le(r, e, t) {
  const o = document.createElement("div");
  o.className = "timber-menu", o.style.bottom = `${window.innerHeight - e.top + 8}px`, o.style.right = `${window.innerWidth - e.right}px`;
  const n = document.createElement("button");
  n.className = "timber-menu-item", n.innerHTML = `${se}<span>Take a Screenshot</span>`, n.addEventListener("click", (i) => {
    i.stopPropagation(), t.onScreenshot();
  }), o.appendChild(n);
  const a = (i) => {
    o.contains(i.target) || (t.onClose(), document.removeEventListener("click", a, !0));
  };
  return requestAnimationFrame(() => {
    document.addEventListener("click", a, !0);
  }), r.appendChild(o), o;
}
function ce(r) {
  const e = document.createElement("div");
  e.className = "timber-loader-overlay";
  const t = document.createElement("div");
  return t.className = "timber-spinner", e.appendChild(t), r.appendChild(e), e;
}
const de = ["#ef4444", "#3b82f6", "#facc15", "#22c55e", "#ec4899", "#000000"], pe = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>', he = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>', me = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>';
function J() {
  const r = document.createElement("span");
  return r.className = "timber-toolbar-divider", r;
}
function H(r, e, t) {
  const o = document.createElement("button");
  return o.className = `timber-toolbar-icon-btn ${r}`, o.innerHTML = e, o.addEventListener("click", t), o;
}
function ue(r, e, t, o) {
  const n = document.createElement("div");
  n.className = "timber-toolbar";
  const a = document.createElement("div");
  a.className = "timber-toolbar-section";
  const i = H(
    e.tool === "text" ? "active" : "",
    pe,
    () => {
      e.tool = "text", i.classList.add("active"), p.classList.remove("active"), t.onToolChange("text");
    }
  );
  i.style.padding = "0 6px", a.appendChild(i), a.appendChild(J());
  const s = document.createElement("div");
  s.className = "timber-toolbar-undo-redo";
  const c = H("", he, () => t.onUndo()), u = H("", me, () => t.onRedo());
  s.appendChild(c), s.appendChild(u), a.appendChild(s), a.appendChild(J());
  const p = document.createElement("button");
  p.className = `timber-toolbar-draw-label${e.tool === "draw" ? " active" : ""}`, p.textContent = "Draw", p.addEventListener("click", () => {
    e.tool = "draw", p.classList.add("active"), i.classList.remove("active"), t.onToolChange("draw");
  }), a.appendChild(p);
  const g = document.createElement("div");
  g.className = "timber-toolbar-swatches";
  const S = de.map((h) => {
    const w = document.createElement("button");
    return w.className = `timber-color-swatch${h === e.color ? " active" : ""}`, w.style.background = h, w.setAttribute("aria-label", `Color ${h}`), w.addEventListener("click", () => {
      e.color = h, S.forEach((N) => N.classList.remove("active")), w.classList.add("active"), t.onColorChange(h);
    }), w;
  });
  S.forEach((h) => g.appendChild(h)), a.appendChild(g), n.appendChild(a);
  const l = document.createElement("div");
  l.className = "timber-toolbar-actions";
  const m = document.createElement("button");
  m.className = "timber-toolbar-cancel", m.textContent = "Cancel", m.addEventListener("click", () => t.onCancel());
  const b = document.createElement("button");
  b.className = "timber-toolbar-report", b.textContent = "Report", b.addEventListener("click", () => t.onSend()), l.appendChild(m), l.appendChild(b), n.appendChild(l);
  let y = !1, B = 0, L = 0, x = 0, A = 0;
  return n.addEventListener("pointerdown", (h) => {
    if (h.target.closest("button")) return;
    y = !0, n.classList.add("dragging"), B = h.clientX, L = h.clientY;
    const w = n.getBoundingClientRect();
    x = w.left, A = w.top, n.setPointerCapture(h.pointerId), h.preventDefault();
  }), n.addEventListener("pointermove", (h) => {
    if (!y) return;
    const w = h.clientX - B, N = h.clientY - L;
    n.style.left = `${x + w}px`, n.style.top = `${A + N}px`, n.style.bottom = "auto", n.style.transform = "none";
  }), n.addEventListener("pointerup", () => {
    y = !1, n.classList.remove("dragging");
  }), n;
}
const be = 30;
function fe(r, e, t, o) {
  const n = document.createElement("div");
  n.className = "timber-annotation-overlay";
  const a = document.createElement("div");
  a.className = "timber-canvas-wrap";
  const i = document.createElement("canvas"), s = i.getContext("2d");
  let c = "draw", u = "#ef4444", p = !1, g = 0, S = 0, l = null;
  const m = [], b = [];
  function y() {
    if (i.width === 0 || i.height === 0) return;
    const d = s.getImageData(0, 0, i.width, i.height);
    m.push(d), m.length > be && m.shift(), b.length = 0;
  }
  function B() {
    if (m.length === 0) return;
    const d = s.getImageData(0, 0, i.width, i.height);
    b.push(d);
    const f = m.pop();
    s.putImageData(f, 0, 0);
  }
  function L() {
    if (b.length === 0) return;
    const d = s.getImageData(0, 0, i.width, i.height);
    m.push(d);
    const f = b.pop();
    s.putImageData(f, 0, 0);
  }
  const x = new Image();
  x.crossOrigin = "anonymous", x.onload = () => {
    i.width = x.naturalWidth, i.height = x.naturalHeight;
    const d = window.innerWidth - 32, f = window.innerHeight - 80, v = Math.min(d / x.naturalWidth, f / x.naturalHeight, 1);
    i.style.width = `${x.naturalWidth * v}px`, i.style.height = `${x.naturalHeight * v}px`, s.drawImage(x, 0, 0);
  }, x.src = e;
  function A(d) {
    const f = i.getBoundingClientRect(), v = i.width / f.width, E = i.height / f.height;
    return [(d.clientX - f.left) * v, (d.clientY - f.top) * E];
  }
  i.addEventListener("pointerdown", (d) => {
    c === "draw" && (y(), p = !0, [g, S] = A(d), i.setPointerCapture(d.pointerId));
  }), i.addEventListener("pointermove", (d) => {
    if (!p || c !== "draw") return;
    const [f, v] = A(d);
    s.beginPath(), s.moveTo(g, S), s.lineTo(f, v), s.strokeStyle = u, s.lineWidth = 12, s.lineCap = "round", s.lineJoin = "round", s.stroke(), g = f, S = v;
  }), i.addEventListener("pointerup", () => {
    p = !1;
  }), i.addEventListener("click", (d) => {
    if (c !== "text") return;
    h();
    const [f, v] = A(d), E = i.getBoundingClientRect(), U = i.width / E.width;
    l = document.createElement("input"), l.type = "text", l.className = "timber-text-input", l.style.left = `${d.clientX - E.left + a.offsetLeft}px`, l.style.top = `${d.clientY - E.top + a.offsetTop}px`, l.style.color = u, l.style.fontSize = `${Math.round(30 / U)}px`, l.dataset.cx = String(f), l.dataset.cy = String(v), l.addEventListener("keydown", (O) => {
      O.key === "Enter" && h();
    }), a.style.position = "relative", a.appendChild(l), l.focus();
  });
  function h() {
    if (!l || !l.value) {
      l == null || l.remove(), l = null;
      return;
    }
    y();
    const d = parseFloat(l.dataset.cx || "0"), f = parseFloat(l.dataset.cy || "0");
    s.font = "bold 30px -apple-system, BlinkMacSystemFont, sans-serif", s.fillStyle = u, s.fillText(l.value, d, f), l.remove(), l = null;
  }
  const F = ue(r, {
    tool: c,
    color: u
  }, {
    onToolChange(d) {
      h(), c = d;
    },
    onColorChange(d) {
      u = d;
    },
    onUndo() {
      h(), B();
    },
    onRedo() {
      L();
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
  return a.appendChild(i), n.appendChild(a), n.appendChild(F), r.appendChild(n), n;
}
const q = '<svg width="14" height="12" viewBox="0 0 14 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="2 4 7 9 12 4"/></svg>', ge = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>', z = 150, D = 150, xe = [
  { value: "no_priority", label: "No Priority", color: "#94a3b8" },
  { value: "urgent", label: "Urgent", color: "#ef4444" },
  { value: "high", label: "High", color: "#f97316" },
  { value: "medium", label: "Medium", color: "#eab308" },
  { value: "low", label: "Low", color: "#22c55e" }
];
function ye(r, e, t, o) {
  let n = null, a = !1;
  const i = document.createElement("div");
  i.className = "timber-report-overlay";
  const s = document.createElement("div");
  s.className = "timber-report-modal";
  const c = document.createElement("div");
  c.className = "timber-report-header-section";
  const u = document.createElement("div");
  u.className = "timber-report-header-row";
  const p = document.createElement("h3");
  p.className = "timber-report-header", p.textContent = "Report a Bug";
  const g = document.createElement("button");
  g.type = "button", g.className = "timber-report-close", g.innerHTML = ge, g.addEventListener("click", () => o.onCancel()), u.appendChild(p), u.appendChild(g), c.appendChild(u);
  const S = document.createElement("p");
  S.className = "timber-report-subtitle", S.textContent = "Provide details about the issue so our team can investigate and resolve it quickly.", c.appendChild(S), s.appendChild(c);
  const l = document.createElement("div");
  l.className = "timber-report-screenshot-section";
  const m = document.createElement("p");
  m.className = "timber-report-screenshot-label", m.textContent = "Screenshot", l.appendChild(m);
  const b = document.createElement("img");
  b.className = "timber-report-thumb", b.src = e, b.alt = "Screenshot preview", l.appendChild(b), s.appendChild(l);
  const y = document.createElement("div");
  y.className = "timber-report-fields";
  const B = P("Title"), L = G("Enter your Title");
  B.appendChild(L), y.appendChild(B);
  const x = Z("Bug Description", z), A = V(
    "Please provide more info regarding the current behaviour...",
    z
  ), h = x.querySelector(".timber-report-char-count");
  A.addEventListener("input", () => {
    h.textContent = `${A.value.length}/${z}`, W();
  }), x.appendChild(A), y.appendChild(x);
  const w = Z("Expected Behaviour", D), N = V(
    "Please provide more info about the expected behaviour...",
    D
  ), F = w.querySelector(".timber-report-char-count");
  N.addEventListener("input", () => {
    F.textContent = `${N.value.length}/${D}`, W();
  }), w.appendChild(N), y.appendChild(w);
  const d = document.createElement("div");
  d.className = "timber-report-row";
  const f = P("Priority"), v = document.createElement("div");
  v.className = "timber-priority-dropdown";
  const E = document.createElement("button");
  E.type = "button", E.className = "timber-priority-trigger", E.innerHTML = `<span class="timber-priority-placeholder">Choose Priority</span><span class="timber-priority-chevron">${q}</span>`;
  const U = document.createElement("div");
  U.className = "timber-priority-options", U.style.display = "none";
  for (const C of xe) {
    const R = document.createElement("button");
    R.type = "button", R.className = "timber-priority-option", R.innerHTML = `<span class="timber-priority-dot" style="background:${C.color}"></span>${_(C.label)}`, R.addEventListener("click", () => {
      n = C.value, E.innerHTML = `<span class="timber-priority-trigger-label"><span class="timber-priority-dot" style="background:${C.color}"></span>${_(C.label)}</span><span class="timber-priority-chevron">${q}</span>`, Y(), W();
    }), U.appendChild(R);
  }
  E.addEventListener("click", () => {
    a = !a, U.style.display = a ? "" : "none";
    const C = E.querySelector(".timber-priority-chevron");
    C == null || C.classList.toggle("open", a);
  }), v.appendChild(E), v.appendChild(U), f.appendChild(v), d.appendChild(f);
  const O = P("Device"), $ = G("Enter the Device");
  $.value = we(), O.appendChild($), d.appendChild(O), y.appendChild(d), s.appendChild(y);
  const I = document.createElement("div");
  I.className = "timber-report-error", I.style.display = "none", s.appendChild(I);
  const j = document.createElement("div");
  j.className = "timber-report-buttons";
  const M = document.createElement("button");
  M.type = "button", M.className = "timber-report-cancel", M.textContent = "Cancel", M.addEventListener("click", () => o.onCancel());
  const T = document.createElement("button");
  T.type = "button", T.className = "timber-report-submit", T.textContent = "Report a Bug", T.disabled = !0, T.addEventListener("click", () => {
    X() && o.onSubmit({
      title: L.value.trim(),
      description: A.value.trim(),
      expectedBehaviour: N.value.trim(),
      priority: n,
      device: $.value.trim()
    });
  }), j.appendChild(M), j.appendChild(T), s.appendChild(j), i.appendChild(s), r.appendChild(i), L.addEventListener("input", () => W()), i.addEventListener("click", (C) => {
    a && !v.contains(C.target) && Y();
  }), requestAnimationFrame(() => L.focus());
  function Y() {
    a = !1, U.style.display = "none";
    const C = E.querySelector(".timber-priority-chevron");
    C == null || C.classList.remove("open");
  }
  function X() {
    return L.value.trim().length > 0 && A.value.trim().length > 0 && N.value.trim().length > 0 && n !== null;
  }
  function W() {
    T.disabled = !X();
  }
  return i;
}
function K(r, e) {
  const t = r.querySelector(".timber-report-error");
  t && (t.textContent = e, t.style.display = e ? "" : "none");
}
function Q(r, e) {
  const t = r.querySelector(".timber-report-submit");
  if (!t) return;
  e ? (t.disabled = !0, t.innerHTML = '<span class="timber-report-submit-spinner"></span>Sending...') : (t.disabled = !1, t.textContent = "Report a Bug");
  const o = r.querySelector(".timber-report-cancel");
  o && (o.style.display = e ? "none" : "");
}
function P(r) {
  const e = document.createElement("div");
  e.className = "timber-report-field";
  const t = document.createElement("label");
  return t.className = "timber-report-label", t.textContent = r, e.appendChild(t), e;
}
function Z(r, e) {
  const t = document.createElement("div");
  t.className = "timber-report-field";
  const o = document.createElement("div");
  o.className = "timber-report-label-row";
  const n = document.createElement("label");
  n.className = "timber-report-label", n.textContent = r;
  const a = document.createElement("span");
  return a.className = "timber-report-char-count", a.textContent = `0/${e}`, o.appendChild(n), o.appendChild(a), t.appendChild(o), t;
}
function G(r) {
  const e = document.createElement("input");
  return e.type = "text", e.className = "timber-report-input", e.placeholder = r, e;
}
function V(r, e) {
  const t = document.createElement("textarea");
  return t.className = "timber-report-textarea", t.placeholder = r, t.maxLength = e, t;
}
function we() {
  const r = navigator.userAgent;
  let e = "Unknown", t = "Unknown";
  return r.includes("Firefox/") ? e = "Firefox" : r.includes("Edg/") ? e = "Edge" : r.includes("Chrome/") ? e = "Chrome" : r.includes("Safari/") && (e = "Safari"), r.includes("Mac OS") ? t = "macOS" : r.includes("Windows") ? t = "Windows" : r.includes("Linux") ? t = "Linux" : r.includes("Android") ? t = "Android" : (r.includes("iPhone") || r.includes("iPad")) && (t = "iOS"), `${e} on ${t}`;
}
function _(r) {
  return r.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
class ve {
  constructor(e) {
    this.state = "idle", this.floatBtn = null, this.menuEl = null, this.loaderEl = null, this.annotationEl = null, this.reportEl = null, this.screenshotObjectUrl = null, this.screenshotDataUrl = null, this.config = e, this.host = document.createElement("div"), this.host.setAttribute("data-timber-root", ""), this.host.style.cssText = "position:fixed;z-index:2147483647;top:0;left:0;width:0;height:0;overflow:visible;", document.body.appendChild(this.host), this.shadow = this.host.attachShadow({ mode: "open" });
    const t = document.createElement("style");
    t.textContent = ne(this.config.theme), this.shadow.appendChild(t), this.root = document.createElement("div"), this.shadow.appendChild(this.root), this.logCapture = new ee(), this.logCapture.start(), this.floatBtn = ae(this.root, {
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
      let o;
      this.config.screenshotMode === "native" ? (this.host.style.visibility = "hidden", await new Promise((n) => requestAnimationFrame(n)), o = await te(), this.host.style.visibility = "") : o = await re(this.config.screenshotApiUrl), this.screenshotObjectUrl = o, (e = this.loaderEl) == null || e.remove(), this.loaderEl = null, this.state = "annotating", this.annotationEl = fe(
        this.root,
        o,
        {
          onSend: (n) => this.handleAnnotationSend(n),
          onCancel: () => this.transitionTo("idle")
        },
        this.config.theme
      );
    } catch (o) {
      console.error("[Timber] Screenshot capture failed:", o), (t = this.loaderEl) == null || t.remove(), this.loaderEl = null, this.transitionTo("idle");
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
    K(this.reportEl, ""), Q(this.reportEl, !0);
    const t = this.logCapture.getLogs(), o = [];
    if (this.screenshotDataUrl) {
      const s = this.screenshotDataUrl.split(",")[1];
      s && o.push({
        filename: "screenshot.png",
        contentType: "image/png",
        data: s
      });
    }
    const n = {
      eventType: "bug_report",
      title: e.title,
      description: `${e.description}

Expected behaviour: ${e.expectedBehaviour}`,
      deviceInfo: {
        userAgent: navigator.userAgent,
        device: e.device,
        priority: e.priority
      },
      attachments: o,
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
        body: JSON.stringify(n)
      });
      if (!s.ok) {
        const c = await s.json().catch(() => null), u = ((i = c == null ? void 0 : c.error) == null ? void 0 : i.message) ?? `Server error (${s.status})`;
        throw new Error(u);
      }
      this.screenshotObjectUrl && (URL.revokeObjectURL(this.screenshotObjectUrl), this.screenshotObjectUrl = null), this.screenshotDataUrl = null, this.transitionTo("idle");
    } catch (s) {
      const c = s instanceof Error ? s.message : "Failed to send report";
      console.error("[Timber] Submit failed:", c), this.reportEl && (Q(this.reportEl, !1), K(this.reportEl, c));
    }
  }
  /** Remove any state-specific UI elements */
  cleanupStateUI() {
    var e, t, o, n;
    (e = this.menuEl) == null || e.remove(), this.menuEl = null, (t = this.loaderEl) == null || t.remove(), this.loaderEl = null, (o = this.annotationEl) == null || o.remove(), this.annotationEl = null, (n = this.reportEl) == null || n.remove(), this.reportEl = null;
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
let k = null;
function Ce(r) {
  var e;
  return r === "light" || r === "dark" ? r : typeof window < "u" && ((e = window.matchMedia) != null && e.call(window, "(prefers-color-scheme: dark)").matches) ? "dark" : "light";
}
function Ee(r) {
  if (!(r != null && r.projectId))
    throw new Error("[Timber] projectId is required");
  if (!(r != null && r.apiKey))
    throw new Error("[Timber] apiKey is required");
  k && (k.destroy(), k = null);
  const e = {
    projectId: r.projectId,
    apiKey: r.apiKey,
    apiUrl: (r.apiUrl ?? "https://www.timber.report/api/v1").replace(/\/+$/, ""),
    screenshotMode: r.screenshotMode ?? "native",
    screenshotApiUrl: r.screenshotApiUrl ?? "/api/timber/screenshot",
    position: r.position ?? "bottom-right",
    theme: Ce(r.theme ?? "auto"),
    user: r.user
  };
  k = new ve(e);
}
function ke() {
  k && (k.destroy(), k = null);
}
function Se() {
  k == null || k.open();
}
function Ae() {
  k == null || k.close();
}
export {
  Ae as close,
  ke as destroy,
  Ee as init,
  Se as open
};
//# sourceMappingURL=index.mjs.map
