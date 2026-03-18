/** Returns all widget CSS to be injected into the shadow root */
export function getStyles(theme: "light" | "dark"): string {
  const isDark = theme === "dark";
  const bg = isDark ? "#121520" : "#ffffff";
  const fg = isDark ? "#e2e8f0" : "#020617";
  const bgHover = isDark ? "#1e293b" : "#f1f5f9";
  const border = isDark ? "#334155" : "#e2e8f0";
  const accentFg = isDark ? "#f8fafc" : "#0f172a";
  const mutedFg = isDark ? "#94a3b8" : "#64748b";
  const placeholder = isDark ? "#64748b" : "#94a3b8";
  const primaryBg = isDark ? "#e2e8f0" : "#0f172a";
  const primaryFg = isDark ? "#0f172a" : "#f8fafc";
  const cardBg = isDark ? "#121520" : "#ffffff";

  return /* css */ `
    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      color: ${fg};
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
      background: ${bg};
      border: 1px solid ${border};
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
      color: ${fg};
      font-size: 14px;
      cursor: pointer;
      text-align: left;
    }
    .timber-menu-item:hover {
      background: ${bgHover};
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
      background: ${isDark ? "#1e293b" : "#ffffff"};
      border: 1px solid ${border};
      border-radius: 12px;
      box-shadow: 0 4px 12px ${isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.15)"};
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
      background: ${border};
      flex-shrink: 0;
    }

    /* Icon buttons (text, undo, redo) */
    .timber-toolbar-icon-btn {
      min-width: 20px;
      height: 20px;
      padding: 0;
      border: none;
      background: none;
      color: ${isDark ? "#e2e8f0" : "#334155"};
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
      color: ${accentFg};
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
      color: ${isDark ? "#e2e8f0" : "#334155"};
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
      color: ${accentFg};
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
      border-color: ${isDark ? "#e2e8f0" : "#334155"};
    }

    /* Cancel button */
    .timber-toolbar-cancel {
      width: 77px;
      padding: 10px;
      border: 1px solid ${border};
      border-radius: 6px;
      background: ${isDark ? "#1e293b" : "#ffffff"};
      color: ${fg};
      font-size: 14px;
      line-height: 20px;
      cursor: pointer;
      font-family: inherit;
      text-align: center;
      white-space: nowrap;
      transition: background 0.1s;
    }
    .timber-toolbar-cancel:hover {
      background: ${bgHover};
    }

    /* Report button */
    .timber-toolbar-report {
      width: 77px;
      padding: 10px;
      border: none;
      border-radius: 6px;
      background: ${primaryBg};
      color: ${primaryFg};
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
      background: ${cardBg};
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
      color: ${accentFg};
    }
    .timber-report-close {
      width: 20px;
      height: 20px;
      background: none;
      border: none;
      cursor: pointer;
      color: ${fg};
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
      color: ${accentFg};
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
      color: ${accentFg};
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
      color: ${accentFg};
    }
    .timber-report-char-count {
      font-size: 12px;
      line-height: 1;
      color: ${mutedFg};
    }
    .timber-report-input {
      width: 100%;
      height: 48px;
      padding: 0 12px;
      border: 1px solid ${border};
      border-radius: 10px;
      background: transparent;
      color: ${fg};
      font-size: 14px;
      line-height: 20px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .timber-report-input:focus {
      border-color: ${placeholder};
      box-shadow: 0 0 0 2px ${isDark ? "rgba(148,163,184,0.1)" : "rgba(15,23,42,0.05)"};
    }
    .timber-report-input::placeholder {
      color: ${placeholder};
    }
    .timber-report-textarea {
      width: 100%;
      height: 80px;
      padding: 6px 12px;
      border: 1px solid ${border};
      border-radius: 10px;
      background: transparent;
      color: ${fg};
      font-size: 14px;
      line-height: 20px;
      font-family: inherit;
      resize: none;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .timber-report-textarea:focus {
      border-color: ${placeholder};
      box-shadow: 0 0 0 2px ${isDark ? "rgba(148,163,184,0.1)" : "rgba(15,23,42,0.05)"};
    }
    .timber-report-textarea::placeholder {
      color: ${placeholder};
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
      border: 1px solid ${border};
      border-radius: 10px;
      background: transparent;
      color: ${fg};
      font-size: 14px;
      font-family: inherit;
      cursor: pointer;
      text-align: left;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .timber-priority-trigger:focus {
      border-color: ${placeholder};
      box-shadow: 0 0 0 2px ${isDark ? "rgba(148,163,184,0.1)" : "rgba(15,23,42,0.05)"};
      outline: none;
    }
    .timber-priority-trigger-label {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .timber-priority-placeholder {
      color: ${placeholder};
    }
    .timber-priority-chevron {
      transition: transform 0.2s;
      flex-shrink: 0;
      color: ${fg};
    }
    .timber-priority-chevron.open {
      transform: rotate(180deg);
    }
    .timber-priority-options {
      position: absolute;
      bottom: calc(100% + 4px);
      left: 0;
      right: 0;
      background: ${cardBg};
      border: 1px solid ${border};
      border-radius: 8px;
      padding: 4px;
      box-shadow: 0 -4px 30px rgba(0,0,0,${isDark ? "0.4" : "0.12"});
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
      color: ${fg};
      font-size: 14px;
      cursor: pointer;
      text-align: left;
    }
    .timber-priority-option:hover {
      background: ${bgHover};
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
      background: ${isDark ? "#3b1818" : "#fef2f2"};
      border: 1px solid ${isDark ? "#5c2020" : "#fecaca"};
      color: ${isDark ? "#fca5a5" : "#dc2626"};
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
      border: 1px solid ${border};
      background: ${isDark ? "transparent" : "#ffffff"};
      color: ${fg};
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s;
    }
    .timber-report-cancel:hover {
      background: ${bgHover};
    }
    .timber-report-submit {
      height: 40px;
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      background: ${primaryBg};
      color: ${primaryFg};
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
      border: 2px solid ${isDark ? "rgba(15,23,42,0.3)" : "rgba(248,250,252,0.3)"};
      border-top-color: ${primaryFg};
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
  `;
}
