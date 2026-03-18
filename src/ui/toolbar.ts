import type { AnnotationTool } from "../types";

const COLORS = ["#ef4444", "#3b82f6", "#facc15", "#22c55e", "#ec4899", "#000000"];

export interface ToolbarState {
  tool: AnnotationTool;
  color: string;
}

export interface ToolbarCallbacks {
  onToolChange: (tool: AnnotationTool) => void;
  onColorChange: (color: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSend: () => void;
  onCancel: () => void;
}

const TEXT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`;
const UNDO_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>`;
const REDO_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>`;

function createDivider(): HTMLSpanElement {
  const div = document.createElement("span");
  div.className = "timber-toolbar-divider";
  return div;
}

function createIconButton(
  className: string,
  innerHTML: string,
  onClick: () => void,
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.className = `timber-toolbar-icon-btn ${className}`;
  btn.innerHTML = innerHTML;
  btn.addEventListener("click", onClick);
  return btn;
}

/** Creates the annotation toolbar matching Figma design */
export function createToolbar(
  _root: ShadowRoot | Element,
  state: ToolbarState,
  callbacks: ToolbarCallbacks,
  _theme: "light" | "dark",
): HTMLDivElement {
  const toolbar = document.createElement("div");
  toolbar.className = "timber-toolbar";

  // Left section: tools
  const toolsSection = document.createElement("div");
  toolsSection.className = "timber-toolbar-section";

  // Text tool button
  const textBtn = createIconButton(
    state.tool === "text" ? "active" : "",
    TEXT_ICON,
    () => {
      state.tool = "text";
      textBtn.classList.add("active");
      drawLabel.classList.remove("active");
      callbacks.onToolChange("text");
    },
  );
  textBtn.style.padding = "0 6px";
  toolsSection.appendChild(textBtn);

  toolsSection.appendChild(createDivider());

  // Undo / Redo
  const undoRedoWrap = document.createElement("div");
  undoRedoWrap.className = "timber-toolbar-undo-redo";

  const undoBtn = createIconButton("", UNDO_ICON, () => callbacks.onUndo());
  const redoBtn = createIconButton("", REDO_ICON, () => callbacks.onRedo());
  undoRedoWrap.appendChild(undoBtn);
  undoRedoWrap.appendChild(redoBtn);
  toolsSection.appendChild(undoRedoWrap);

  toolsSection.appendChild(createDivider());

  // Draw label (acts as draw tool selector)
  const drawLabel = document.createElement("button");
  drawLabel.className = `timber-toolbar-draw-label${state.tool === "draw" ? " active" : ""}`;
  drawLabel.textContent = "Draw";
  drawLabel.addEventListener("click", () => {
    state.tool = "draw";
    drawLabel.classList.add("active");
    textBtn.classList.remove("active");
    callbacks.onToolChange("draw");
  });
  toolsSection.appendChild(drawLabel);

  // Color swatches
  const swatchesWrap = document.createElement("div");
  swatchesWrap.className = "timber-toolbar-swatches";

  const swatches: HTMLButtonElement[] = COLORS.map((color) => {
    const swatch = document.createElement("button");
    swatch.className = `timber-color-swatch${color === state.color ? " active" : ""}`;
    swatch.style.background = color;
    swatch.setAttribute("aria-label", `Color ${color}`);
    swatch.addEventListener("click", () => {
      state.color = color;
      swatches.forEach((s) => s.classList.remove("active"));
      swatch.classList.add("active");
      callbacks.onColorChange(color);
    });
    return swatch;
  });
  swatches.forEach((s) => swatchesWrap.appendChild(s));
  toolsSection.appendChild(swatchesWrap);

  toolbar.appendChild(toolsSection);

  // Right section: actions
  const actionsSection = document.createElement("div");
  actionsSection.className = "timber-toolbar-actions";

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "timber-toolbar-cancel";
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", () => callbacks.onCancel());

  const reportBtn = document.createElement("button");
  reportBtn.className = "timber-toolbar-report";
  reportBtn.textContent = "Report";
  reportBtn.addEventListener("click", () => callbacks.onSend());

  actionsSection.appendChild(cancelBtn);
  actionsSection.appendChild(reportBtn);
  toolbar.appendChild(actionsSection);

  // ── Drag logic for toolbar ──
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let origX = 0;
  let origY = 0;

  toolbar.addEventListener("pointerdown", (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    isDragging = true;
    toolbar.classList.add("dragging");
    startX = e.clientX;
    startY = e.clientY;
    const rect = toolbar.getBoundingClientRect();
    origX = rect.left;
    origY = rect.top;
    toolbar.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  toolbar.addEventListener("pointermove", (e: PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    toolbar.style.left = `${origX + dx}px`;
    toolbar.style.top = `${origY + dy}px`;
    toolbar.style.bottom = "auto";
    toolbar.style.transform = "none";
  });

  toolbar.addEventListener("pointerup", () => {
    isDragging = false;
    toolbar.classList.remove("dragging");
  });

  return toolbar;
}
