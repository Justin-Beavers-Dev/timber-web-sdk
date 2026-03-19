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
  const m = await c.blob();
  return URL.createObjectURL(m);
}
function ne(r) {
  const e = r === "dark", t = e ? "#121520" : "#ffffff", o = e ? "#e2e8f0" : "#020617", n = e ? "#1e293b" : "#f1f5f9", a = e ? "#334155" : "#e2e8f0", i = e ? "#f8fafc" : "#0f172a", s = e ? "#94a3b8" : "#64748b", c = e ? "#64748b" : "#94a3b8", m = e ? "#e2e8f0" : "#0f172a", p = e ? "#0f172a" : "#f8fafc", f = e ? "#121520" : "#ffffff";
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
      background: ${f};
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
      background: ${f};
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
function ae(r, e) {
  const t = document.createElement("button");
  t.className = "timber-float-btn";
  const o = document.createElement("img");
  o.src = ie, o.alt = "Report a bug", o.draggable = !1, t.appendChild(o), t.setAttribute("aria-label", "Open feedback");
  const n = 20;
  t.style.bottom = `${n}px`, e.position === "bottom-left" ? t.style.left = `${n}px` : t.style.right = `${n}px`;
  let a = !1, i = !1, s = 0, c = 0, m = 0, p = 0;
  const f = (u) => {
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
  return t.addEventListener("pointerdown", f), t.addEventListener("pointermove", E), t.addEventListener("pointerup", l), r.appendChild(t), t;
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
const de = ["#ef4444", "#3b82f6", "#facc15", "#22c55e", "#ec4899", "#000000"], pe = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>', he = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>', ue = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>';
function W() {
  const r = document.createElement("span");
  return r.className = "timber-toolbar-divider", r;
}
function V(r, e, t) {
  const o = document.createElement("button");
  return o.className = `timber-toolbar-icon-btn ${r}`, o.innerHTML = e, o.addEventListener("click", t), o;
}
function me(r, e, t, o) {
  const n = document.createElement("div");
  n.className = "timber-toolbar";
  const a = document.createElement("div");
  a.className = "timber-toolbar-section";
  const i = V(
    e.tool === "text" ? "active" : "",
    pe,
    () => {
      e.tool = "text", i.classList.add("active"), p.classList.remove("active"), t.onToolChange("text");
    }
  );
  i.style.padding = "0 6px", a.appendChild(i), a.appendChild(W());
  const s = document.createElement("div");
  s.className = "timber-toolbar-undo-redo";
  const c = V("", he, () => t.onUndo()), m = V("", ue, () => t.onRedo());
  s.appendChild(c), s.appendChild(m), a.appendChild(s), a.appendChild(W());
  const p = document.createElement("button");
  p.className = `timber-toolbar-draw-label${e.tool === "draw" ? " active" : ""}`, p.textContent = "Draw", p.addEventListener("click", () => {
    e.tool = "draw", p.classList.add("active"), i.classList.remove("active"), t.onToolChange("draw");
  }), a.appendChild(p);
  const f = document.createElement("div");
  f.className = "timber-toolbar-swatches";
  const E = de.map((h) => {
    const A = document.createElement("button");
    return A.className = `timber-color-swatch${h === e.color ? " active" : ""}`, A.style.background = h, A.setAttribute("aria-label", `Color ${h}`), A.addEventListener("click", () => {
      e.color = h, E.forEach((L) => L.classList.remove("active")), A.classList.add("active"), t.onColorChange(h);
    }), A;
  });
  E.forEach((h) => f.appendChild(h)), a.appendChild(f), n.appendChild(a);
  const l = document.createElement("div");
  l.className = "timber-toolbar-actions";
  const u = document.createElement("button");
  u.className = "timber-toolbar-cancel", u.textContent = "Cancel", u.addEventListener("click", () => t.onCancel());
  const b = document.createElement("button");
  b.className = "timber-toolbar-report", b.textContent = "Report", b.addEventListener("click", () => t.onSend()), l.appendChild(u), l.appendChild(b), n.appendChild(l);
  let y = !1, N = 0, T = 0, x = 0, S = 0;
  return n.addEventListener("pointerdown", (h) => {
    if (h.target.closest("button")) return;
    y = !0, n.classList.add("dragging"), N = h.clientX, T = h.clientY;
    const A = n.getBoundingClientRect();
    x = A.left, S = A.top, n.setPointerCapture(h.pointerId), h.preventDefault();
  }), n.addEventListener("pointermove", (h) => {
    if (!y) return;
    const A = h.clientX - N, L = h.clientY - T;
    n.style.left = `${x + A}px`, n.style.top = `${S + L}px`, n.style.bottom = "auto", n.style.transform = "none";
  }), n.addEventListener("pointerup", () => {
    y = !1, n.classList.remove("dragging");
  }), n;
}
const be = 30;
function ge(r, e, t, o) {
  const n = document.createElement("div");
  n.className = "timber-annotation-overlay";
  const a = document.createElement("div");
  a.className = "timber-canvas-wrap";
  const i = document.createElement("canvas"), s = i.getContext("2d");
  let c = "draw", m = "#ef4444", p = !1, f = 0, E = 0, l = null;
  const u = [], b = [];
  function y() {
    if (i.width === 0 || i.height === 0) return;
    const d = s.getImageData(0, 0, i.width, i.height);
    u.push(d), u.length > be && u.shift(), b.length = 0;
  }
  function N() {
    if (u.length === 0) return;
    const d = s.getImageData(0, 0, i.width, i.height);
    b.push(d);
    const g = u.pop();
    s.putImageData(g, 0, 0);
  }
  function T() {
    if (b.length === 0) return;
    const d = s.getImageData(0, 0, i.width, i.height);
    u.push(d);
    const g = b.pop();
    s.putImageData(g, 0, 0);
  }
  const x = new Image();
  x.crossOrigin = "anonymous", x.onload = () => {
    i.width = x.naturalWidth, i.height = x.naturalHeight;
    const d = window.innerWidth - 32, g = window.innerHeight - 80, v = Math.min(d / x.naturalWidth, g / x.naturalHeight, 1);
    i.style.width = `${x.naturalWidth * v}px`, i.style.height = `${x.naturalHeight * v}px`, s.drawImage(x, 0, 0);
  }, x.src = e;
  function S(d) {
    const g = i.getBoundingClientRect(), v = i.width / g.width, C = i.height / g.height;
    return [(d.clientX - g.left) * v, (d.clientY - g.top) * C];
  }
  i.addEventListener("pointerdown", (d) => {
    c === "draw" && (y(), p = !0, [f, E] = S(d), i.setPointerCapture(d.pointerId));
  }), i.addEventListener("pointermove", (d) => {
    if (!p || c !== "draw") return;
    const [g, v] = S(d);
    s.beginPath(), s.moveTo(f, E), s.lineTo(g, v), s.strokeStyle = m, s.lineWidth = 12, s.lineCap = "round", s.lineJoin = "round", s.stroke(), f = g, E = v;
  }), i.addEventListener("pointerup", () => {
    p = !1;
  }), i.addEventListener("click", (d) => {
    if (c !== "text") return;
    h();
    const [g, v] = S(d), C = i.getBoundingClientRect(), F = i.width / C.width;
    l = document.createElement("input"), l.type = "text", l.className = "timber-text-input", l.style.left = `${d.clientX - C.left + a.offsetLeft}px`, l.style.top = `${d.clientY - C.top + a.offsetTop}px`, l.style.color = m, l.style.fontSize = `${Math.round(30 / F)}px`, l.dataset.cx = String(g), l.dataset.cy = String(v), l.addEventListener("keydown", (I) => {
      I.key === "Enter" && h();
    }), a.style.position = "relative", a.appendChild(l), l.focus();
  });
  function h() {
    if (!l || !l.value) {
      l == null || l.remove(), l = null;
      return;
    }
    y();
    const d = parseFloat(l.dataset.cx || "0"), g = parseFloat(l.dataset.cy || "0");
    s.font = "bold 30px -apple-system, BlinkMacSystemFont, sans-serif", s.fillStyle = m, s.fillText(l.value, d, g), l.remove(), l = null;
  }
  const D = me(r, {
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
      h(), N();
    },
    onRedo() {
      T();
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
  return a.appendChild(i), n.appendChild(a), n.appendChild(D), r.appendChild(n), n;
}
const K = '<svg width="14" height="12" viewBox="0 0 14 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="2 4 7 9 12 4"/></svg>', fe = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>', H = 150, q = 150, xe = [
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
  const m = document.createElement("div");
  m.className = "timber-report-header-row";
  const p = document.createElement("h3");
  p.className = "timber-report-header", p.textContent = "Report a Bug";
  const f = document.createElement("button");
  f.type = "button", f.className = "timber-report-close", f.innerHTML = fe, f.addEventListener("click", () => o.onCancel()), m.appendChild(p), m.appendChild(f), c.appendChild(m);
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
  const N = j("Title"), T = G("Enter your Title");
  N.appendChild(T), y.appendChild(N);
  const x = Q("Bug Description", H), S = $(
    "Please provide more info regarding the current behaviour...",
    H
  ), h = x.querySelector(".timber-report-char-count");
  S.addEventListener("input", () => {
    h.textContent = `${S.value.length}/${H}`, R();
  }), x.appendChild(S), y.appendChild(x);
  const A = Q("Expected Behaviour", q), L = $(
    "Please provide more info about the expected behaviour...",
    q
  ), D = A.querySelector(".timber-report-char-count");
  L.addEventListener("input", () => {
    D.textContent = `${L.value.length}/${q}`, R();
  }), A.appendChild(L), y.appendChild(A);
  const d = document.createElement("div");
  d.className = "timber-report-row";
  const g = j("Priority"), v = document.createElement("div");
  v.className = "timber-priority-dropdown";
  const C = document.createElement("button");
  C.type = "button", C.className = "timber-priority-trigger", C.innerHTML = `<span class="timber-priority-placeholder">Choose Priority</span><span class="timber-priority-chevron">${K}</span>`;
  const F = document.createElement("div");
  F.className = "timber-priority-options", F.style.display = "none";
  for (const w of xe) {
    const O = document.createElement("button");
    O.type = "button", O.className = "timber-priority-option", O.innerHTML = `<span class="timber-priority-dot" style="background:${w.color}"></span>${_(w.label)}`, O.addEventListener("click", () => {
      n = w.value, C.innerHTML = `<span class="timber-priority-trigger-label"><span class="timber-priority-dot" style="background:${w.color}"></span>${_(w.label)}</span><span class="timber-priority-chevron">${K}</span>`, J(), R();
    }), F.appendChild(O);
  }
  C.addEventListener("click", () => {
    a = !a, F.style.display = a ? "" : "none";
    const w = C.querySelector(".timber-priority-chevron");
    w == null || w.classList.toggle("open", a);
  }), v.appendChild(C), v.appendChild(F), g.appendChild(v), d.appendChild(g);
  const I = j("Device"), P = G("Enter the Device");
  P.value = Ae(), I.appendChild(P), d.appendChild(I), y.appendChild(d), s.appendChild(y);
  const U = document.createElement("div");
  U.className = "timber-report-error", U.style.display = "none", s.appendChild(U);
  const X = document.createElement("div");
  X.className = "timber-report-buttons";
  const M = document.createElement("button");
  M.type = "button", M.className = "timber-report-cancel", M.textContent = "Cancel", M.addEventListener("click", () => o.onCancel());
  const B = document.createElement("button");
  B.type = "button", B.className = "timber-report-submit", B.textContent = "Report a Bug", B.disabled = !0, B.addEventListener("click", () => {
    z() && o.onSubmit({
      title: T.value.trim(),
      description: S.value.trim(),
      expectedBehaviour: L.value.trim(),
      priority: n,
      device: P.value.trim()
    });
  }), X.appendChild(M), X.appendChild(B), s.appendChild(X), i.appendChild(s), r.appendChild(i), T.addEventListener("input", () => R()), i.addEventListener("click", (w) => {
    a && !v.contains(w.target) && J();
  }), requestAnimationFrame(() => T.focus());
  function J() {
    a = !1, F.style.display = "none";
    const w = C.querySelector(".timber-priority-chevron");
    w == null || w.classList.remove("open");
  }
  function z() {
    return T.value.trim().length > 0 && S.value.trim().length > 0 && L.value.trim().length > 0 && n !== null;
  }
  function R() {
    B.disabled = !z();
  }
  return i;
}
function Z(r, e) {
  const t = r.querySelector(".timber-report-error");
  t && (t.textContent = e, t.style.display = e ? "" : "none");
}
function Y(r, e) {
  const t = r.querySelector(".timber-report-submit");
  if (!t) return;
  e ? (t.disabled = !0, t.innerHTML = '<span class="timber-report-submit-spinner"></span>Sending...') : (t.disabled = !1, t.textContent = "Report a Bug");
  const o = r.querySelector(".timber-report-cancel");
  o && (o.style.display = e ? "none" : "");
}
function j(r) {
  const e = document.createElement("div");
  e.className = "timber-report-field";
  const t = document.createElement("label");
  return t.className = "timber-report-label", t.textContent = r, e.appendChild(t), e;
}
function Q(r, e) {
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
function $(r, e) {
  const t = document.createElement("textarea");
  return t.className = "timber-report-textarea", t.placeholder = r, t.maxLength = e, t;
}
function Ae() {
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
      this.config.screenshotMode === "native" ? (this.host.style.visibility = "hidden", await new Promise((n) => requestAnimationFrame(n)), o = await te(), this.host.style.visibility = "") : o = await re(this.config.screenshotApiUrl), this.screenshotObjectUrl = o, (e = this.loaderEl) == null || e.remove(), this.loaderEl = null, this.state = "annotating", this.annotationEl = ge(
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
    Z(this.reportEl, ""), Y(this.reportEl, !0);
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
        const c = await s.json().catch(() => null), m = ((i = c == null ? void 0 : c.error) == null ? void 0 : i.message) ?? `Server error (${s.status})`;
        throw new Error(m);
      }
      this.screenshotObjectUrl && (URL.revokeObjectURL(this.screenshotObjectUrl), this.screenshotObjectUrl = null), this.screenshotDataUrl = null, this.transitionTo("idle");
    } catch (s) {
      const c = s instanceof Error ? s.message : "Failed to send report";
      console.error("[Timber] Submit failed:", c), this.reportEl && (Y(this.reportEl, !1), Z(this.reportEl, c));
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
function we(r) {
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
    theme: we(r.theme ?? "auto"),
    user: r.user
  };
  k = new ve(e);
}
function ke() {
  k && (k.destroy(), k = null);
}
function Ee() {
  k == null || k.open();
}
function Se() {
  k == null || k.close();
}
export {
  Se as close,
  ke as destroy,
  Ce as init,
  Ee as open
};
//# sourceMappingURL=index.mjs.map
