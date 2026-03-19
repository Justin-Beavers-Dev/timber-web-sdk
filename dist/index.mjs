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
  }, R = (m) => {
    if (!a) return;
    const b = m.clientX - s, y = m.clientY - c;
    (Math.abs(b) > 3 || Math.abs(y) > 3) && (i = !0), i && (t.style.right = "auto", t.style.left = "auto", t.style.bottom = "auto", t.style.left = `${u + b}px`, t.style.top = `${p + y}px`);
  }, l = () => {
    a = !1, i || e.onClick();
  };
  return t.addEventListener("pointerdown", g), t.addEventListener("pointermove", R), t.addEventListener("pointerup", l), r.appendChild(t), t;
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
function Q(r, e, t) {
  const o = document.createElement("button");
  return o.className = `timber-toolbar-icon-btn ${r}`, o.innerHTML = e, o.addEventListener("click", t), o;
}
function ue(r, e, t, o) {
  const n = document.createElement("div");
  n.className = "timber-toolbar";
  const a = document.createElement("div");
  a.className = "timber-toolbar-section";
  const i = Q(
    e.tool === "text" ? "active" : "",
    pe,
    () => {
      e.tool = "text", i.classList.add("active"), p.classList.remove("active"), t.onToolChange("text");
    }
  );
  i.style.padding = "0 6px", a.appendChild(i), a.appendChild(J());
  const s = document.createElement("div");
  s.className = "timber-toolbar-undo-redo";
  const c = Q("", he, () => t.onUndo()), u = Q("", me, () => t.onRedo());
  s.appendChild(c), s.appendChild(u), a.appendChild(s), a.appendChild(J());
  const p = document.createElement("button");
  p.className = `timber-toolbar-draw-label${e.tool === "draw" ? " active" : ""}`, p.textContent = "Draw", p.addEventListener("click", () => {
    e.tool = "draw", p.classList.add("active"), i.classList.remove("active"), t.onToolChange("draw");
  }), a.appendChild(p);
  const g = document.createElement("div");
  g.className = "timber-toolbar-swatches";
  const R = de.map((h) => {
    const v = document.createElement("button");
    return v.className = `timber-color-swatch${h === e.color ? " active" : ""}`, v.style.background = h, v.setAttribute("aria-label", `Color ${h}`), v.addEventListener("click", () => {
      e.color = h, R.forEach((L) => L.classList.remove("active")), v.classList.add("active"), t.onColorChange(h);
    }), v;
  });
  R.forEach((h) => g.appendChild(h)), a.appendChild(g), n.appendChild(a);
  const l = document.createElement("div");
  l.className = "timber-toolbar-actions";
  const m = document.createElement("button");
  m.className = "timber-toolbar-cancel", m.textContent = "Cancel", m.addEventListener("click", () => t.onCancel());
  const b = document.createElement("button");
  b.className = "timber-toolbar-report", b.textContent = "Report", b.addEventListener("click", () => t.onSend()), l.appendChild(m), l.appendChild(b), n.appendChild(l);
  let y = !1, I = 0, j = 0, x = 0, A = 0;
  return n.addEventListener("pointerdown", (h) => {
    if (h.target.closest("button")) return;
    y = !0, n.classList.add("dragging"), I = h.clientX, j = h.clientY;
    const v = n.getBoundingClientRect();
    x = v.left, A = v.top, n.setPointerCapture(h.pointerId), h.preventDefault();
  }), n.addEventListener("pointermove", (h) => {
    if (!y) return;
    const v = h.clientX - I, L = h.clientY - j;
    n.style.left = `${x + v}px`, n.style.top = `${A + L}px`, n.style.bottom = "auto", n.style.transform = "none";
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
  let c = "draw", u = "#ef4444", p = !1, g = 0, R = 0, l = null;
  const m = [], b = [];
  function y() {
    if (i.width === 0 || i.height === 0) return;
    const d = s.getImageData(0, 0, i.width, i.height);
    m.push(d), m.length > be && m.shift(), b.length = 0;
  }
  function I() {
    if (m.length === 0) return;
    const d = s.getImageData(0, 0, i.width, i.height);
    b.push(d);
    const f = m.pop();
    s.putImageData(f, 0, 0);
  }
  function j() {
    if (b.length === 0) return;
    const d = s.getImageData(0, 0, i.width, i.height);
    m.push(d);
    const f = b.pop();
    s.putImageData(f, 0, 0);
  }
  const x = new Image();
  x.crossOrigin = "anonymous", x.onload = () => {
    i.width = x.naturalWidth, i.height = x.naturalHeight;
    const d = window.innerWidth - 32, f = window.innerHeight - 80, w = Math.min(d / x.naturalWidth, f / x.naturalHeight, 1);
    i.style.width = `${x.naturalWidth * w}px`, i.style.height = `${x.naturalHeight * w}px`, s.drawImage(x, 0, 0);
  }, x.src = e;
  function A(d) {
    const f = i.getBoundingClientRect(), w = i.width / f.width, C = i.height / f.height;
    return [(d.clientX - f.left) * w, (d.clientY - f.top) * C];
  }
  i.addEventListener("pointerdown", (d) => {
    c === "draw" && (y(), p = !0, [g, R] = A(d), i.setPointerCapture(d.pointerId));
  }), i.addEventListener("pointermove", (d) => {
    if (!p || c !== "draw") return;
    const [f, w] = A(d);
    s.beginPath(), s.moveTo(g, R), s.lineTo(f, w), s.strokeStyle = u, s.lineWidth = 12, s.lineCap = "round", s.lineJoin = "round", s.stroke(), g = f, R = w;
  }), i.addEventListener("pointerup", () => {
    p = !1;
  }), i.addEventListener("click", (d) => {
    if (c !== "text") return;
    h();
    const [f, w] = A(d), C = i.getBoundingClientRect(), S = i.width / C.width;
    l = document.createElement("input"), l.type = "text", l.className = "timber-text-input", l.style.left = `${d.clientX - C.left + a.offsetLeft}px`, l.style.top = `${d.clientY - C.top + a.offsetTop}px`, l.style.color = u, l.style.fontSize = `${Math.round(30 / S)}px`, l.dataset.cx = String(f), l.dataset.cy = String(w), l.addEventListener("keydown", (T) => {
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
    s.font = "bold 30px -apple-system, BlinkMacSystemFont, sans-serif", s.fillStyle = u, s.fillText(l.value, d, f), l.remove(), l = null;
  }
  const O = ue(r, {
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
      h(), I();
    },
    onRedo() {
      j();
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
  return a.appendChild(i), n.appendChild(a), n.appendChild(O), r.appendChild(n), n;
}
const X = '<svg width="14" height="12" viewBox="0 0 14 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="2 4 7 9 12 4"/></svg>', ge = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>', D = 150, K = 150, xe = [
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
  const R = document.createElement("p");
  R.className = "timber-report-subtitle", R.textContent = "Provide details about the issue so our team can investigate and resolve it quickly.", c.appendChild(R), s.appendChild(c);
  const l = document.createElement("div");
  l.className = "timber-report-screenshot-section";
  const m = document.createElement("p");
  m.className = "timber-report-screenshot-label", m.textContent = "Screenshot", l.appendChild(m);
  const b = document.createElement("img");
  b.className = "timber-report-thumb", b.src = e, b.alt = "Screenshot preview", l.appendChild(b), s.appendChild(l);
  const y = document.createElement("div");
  y.className = "timber-report-fields";
  const I = G("Title"), j = Z("Enter your Title");
  I.appendChild(j), y.appendChild(I);
  const x = V("Bug Description", D), A = $(
    "Please provide more info regarding the current behaviour...",
    D
  ), h = x.querySelector(".timber-report-char-count");
  A.addEventListener("input", () => {
    h.textContent = `${A.value.length}/${D}`, P();
  }), x.appendChild(A), y.appendChild(x);
  const v = V("Expected Behaviour", K), L = $(
    "Please provide more info about the expected behaviour...",
    K
  ), O = v.querySelector(".timber-report-char-count");
  L.addEventListener("input", () => {
    O.textContent = `${L.value.length}/${K}`, P();
  }), v.appendChild(L), y.appendChild(v);
  const d = document.createElement("div");
  d.className = "timber-report-row";
  const f = G("Priority"), w = document.createElement("div");
  w.className = "timber-priority-dropdown";
  const C = document.createElement("button");
  C.type = "button", C.className = "timber-priority-trigger", C.innerHTML = `<span class="timber-priority-placeholder">Choose Priority</span><span class="timber-priority-chevron">${X}</span>`;
  const S = document.createElement("div");
  S.className = "timber-priority-options", S.style.display = "none";
  for (const E of xe) {
    const M = document.createElement("button");
    M.type = "button", M.className = "timber-priority-option", M.innerHTML = `<span class="timber-priority-dot" style="background:${E.color}"></span>${_(E.label)}`, M.addEventListener("click", () => {
      n = E.value, C.innerHTML = `<span class="timber-priority-trigger-label"><span class="timber-priority-dot" style="background:${E.color}"></span>${_(E.label)}</span><span class="timber-priority-chevron">${X}</span>`, W(), P();
    }), S.appendChild(M);
  }
  C.addEventListener("click", () => {
    a = !a, S.style.display = a ? "" : "none";
    const E = C.querySelector(".timber-priority-chevron");
    E == null || E.classList.toggle("open", a);
  }), w.appendChild(C), w.appendChild(S), f.appendChild(w), d.appendChild(f);
  const T = G("Device"), U = Z("Enter the Device");
  U.value = ve(), T.appendChild(U), d.appendChild(T), y.appendChild(d), s.appendChild(y);
  const H = document.createElement("div");
  H.className = "timber-report-error", H.style.display = "none", s.appendChild(H);
  const F = document.createElement("div");
  F.className = "timber-report-buttons";
  const N = document.createElement("button");
  N.type = "button", N.className = "timber-report-cancel", N.textContent = "Cancel", N.addEventListener("click", () => o.onCancel());
  const B = document.createElement("button");
  B.type = "button", B.className = "timber-report-submit", B.textContent = "Report a Bug", B.disabled = !0, B.addEventListener("click", () => {
    Y() && o.onSubmit({
      title: j.value.trim(),
      description: A.value.trim(),
      expectedBehaviour: L.value.trim(),
      priority: n,
      device: U.value.trim()
    });
  }), F.appendChild(N), F.appendChild(B), s.appendChild(F), i.appendChild(s), r.appendChild(i), j.addEventListener("input", () => P()), i.addEventListener("click", (E) => {
    a && !w.contains(E.target) && W();
  }), requestAnimationFrame(() => j.focus());
  function W() {
    a = !1, S.style.display = "none";
    const E = C.querySelector(".timber-priority-chevron");
    E == null || E.classList.remove("open");
  }
  function Y() {
    return j.value.trim().length > 0 && A.value.trim().length > 0 && L.value.trim().length > 0 && n !== null;
  }
  function P() {
    B.disabled = !Y();
  }
  return i;
}
function z(r, e) {
  const t = r.querySelector(".timber-report-error");
  t && (t.textContent = e, t.style.display = e ? "" : "none");
}
function q(r, e) {
  const t = r.querySelector(".timber-report-submit");
  if (!t) return;
  e ? (t.disabled = !0, t.innerHTML = '<span class="timber-report-submit-spinner"></span>Sending...') : (t.disabled = !1, t.textContent = "Report a Bug");
  const o = r.querySelector(".timber-report-cancel");
  o && (o.style.display = e ? "none" : "");
}
function G(r) {
  const e = document.createElement("div");
  e.className = "timber-report-field";
  const t = document.createElement("label");
  return t.className = "timber-report-label", t.textContent = r, e.appendChild(t), e;
}
function V(r, e) {
  const t = document.createElement("div");
  t.className = "timber-report-field";
  const o = document.createElement("div");
  o.className = "timber-report-label-row";
  const n = document.createElement("label");
  n.className = "timber-report-label", n.textContent = r;
  const a = document.createElement("span");
  return a.className = "timber-report-char-count", a.textContent = `0/${e}`, o.appendChild(n), o.appendChild(a), t.appendChild(o), t;
}
function Z(r) {
  const e = document.createElement("input");
  return e.type = "text", e.className = "timber-report-input", e.placeholder = r, e;
}
function $(r, e) {
  const t = document.createElement("textarea");
  return t.className = "timber-report-textarea", t.placeholder = r, t.maxLength = e, t;
}
function ve() {
  const r = navigator.userAgent;
  let e = "Unknown", t = "Unknown";
  return r.includes("Firefox/") ? e = "Firefox" : r.includes("Edg/") ? e = "Edge" : r.includes("Chrome/") ? e = "Chrome" : r.includes("Safari/") && (e = "Safari"), r.includes("Mac OS") ? t = "macOS" : r.includes("Windows") ? t = "Windows" : r.includes("Linux") ? t = "Linux" : r.includes("Android") ? t = "Android" : (r.includes("iPhone") || r.includes("iPad")) && (t = "iOS"), `${e} on ${t}`;
}
function _(r) {
  return r.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
class we {
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
    z(this.reportEl, ""), q(this.reportEl, !0);
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
      console.error("[Timber] Submit failed:", c), this.reportEl && (q(this.reportEl, !1), z(this.reportEl, c));
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
function Ee(r) {
  var e;
  return r === "light" || r === "dark" ? r : typeof window < "u" && ((e = window.matchMedia) != null && e.call(window, "(prefers-color-scheme: dark)").matches) ? "dark" : "light";
}
function Ce(r) {
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
    theme: Ee(r.theme ?? "auto"),
    user: r.user
  };
  k = new we(e);
}
function ke() {
  k && (k.destroy(), k = null);
}
function Re() {
  k == null || k.open();
}
function Ae() {
  k == null || k.close();
}
export {
  Ae as close,
  ke as destroy,
  Ce as init,
  Re as open
};
//# sourceMappingURL=index.mjs.map
