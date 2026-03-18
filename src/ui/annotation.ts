import type { AnnotationTool } from "../types";
import { createToolbar, type ToolbarCallbacks, type ToolbarState } from "./toolbar";

export interface AnnotationCallbacks {
  /** Called with the final canvas data URL when user clicks Send */
  onSend: (dataUrl: string) => void;
  /** Called when user cancels annotation */
  onCancel: () => void;
}

const MAX_HISTORY = 30;

/**
 * Creates the annotation overlay: screenshot background on a canvas
 * with freehand drawing, text annotation, and undo/redo support.
 */
export function createAnnotationOverlay(
  root: ShadowRoot | Element,
  screenshotUrl: string,
  callbacks: AnnotationCallbacks,
  theme: "light" | "dark",
): HTMLDivElement {
  const overlay = document.createElement("div");
  overlay.className = "calda-annotation-overlay";

  const canvasWrap = document.createElement("div");
  canvasWrap.className = "calda-canvas-wrap";

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  // ── State ──
  let currentTool: AnnotationTool = "draw";
  let currentColor = "#ef4444";
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let activeInput: HTMLInputElement | null = null;

  // ── Undo/Redo history ──
  const undoStack: ImageData[] = [];
  const redoStack: ImageData[] = [];

  function saveSnapshot(): void {
    if (canvas.width === 0 || canvas.height === 0) return;
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.push(snapshot);
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack.length = 0;
  }

  function undo(): void {
    if (undoStack.length === 0) return;
    const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    redoStack.push(current);
    const prev = undoStack.pop()!;
    ctx.putImageData(prev, 0, 0);
  }

  function redo(): void {
    if (redoStack.length === 0) return;
    const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.push(current);
    const next = redoStack.pop()!;
    ctx.putImageData(next, 0, 0);
  }

  // Load screenshot as canvas background
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const maxW = window.innerWidth - 32;
    const maxH = window.innerHeight - 80;
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
    canvas.style.width = `${img.naturalWidth * scale}px`;
    canvas.style.height = `${img.naturalHeight * scale}px`;
    ctx.drawImage(img, 0, 0);
  };
  img.src = screenshotUrl;

  // ── Drawing helpers ──
  function getCanvasCoords(e: PointerEvent): [number, number] {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return [(e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY];
  }

  // ── Freehand draw ──
  canvas.addEventListener("pointerdown", (e) => {
    if (currentTool === "draw") {
      saveSnapshot();
      isDrawing = true;
      [lastX, lastY] = getCanvasCoords(e);
      canvas.setPointerCapture(e.pointerId);
    }
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!isDrawing || currentTool !== "draw") return;
    const [x, y] = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastX = x;
    lastY = y;
  });

  canvas.addEventListener("pointerup", () => {
    isDrawing = false;
  });

  // ── Text tool ──
  canvas.addEventListener("click", (e) => {
    if (currentTool !== "text") return;
    commitTextInput();
    const [cx, cy] = getCanvasCoords(e);
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;

    activeInput = document.createElement("input");
    activeInput.type = "text";
    activeInput.className = "calda-text-input";
    activeInput.style.left = `${e.clientX - rect.left + canvasWrap.offsetLeft}px`;
    activeInput.style.top = `${e.clientY - rect.top + canvasWrap.offsetTop}px`;
    activeInput.style.color = currentColor;
    activeInput.style.fontSize = `${Math.round(30 / scaleX)}px`;

    activeInput.dataset.cx = String(cx);
    activeInput.dataset.cy = String(cy);

    activeInput.addEventListener("keydown", (ke) => {
      if (ke.key === "Enter") commitTextInput();
    });

    canvasWrap.style.position = "relative";
    canvasWrap.appendChild(activeInput);
    activeInput.focus();
  });

  /** Commit typed text onto the canvas */
  function commitTextInput(): void {
    if (!activeInput || !activeInput.value) {
      activeInput?.remove();
      activeInput = null;
      return;
    }
    saveSnapshot();
    const cx = parseFloat(activeInput.dataset.cx || "0");
    const cy = parseFloat(activeInput.dataset.cy || "0");
    ctx.font = "bold 30px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = currentColor;
    ctx.fillText(activeInput.value, cx, cy);
    activeInput.remove();
    activeInput = null;
  }

  // ── Toolbar ──
  const toolbarState: ToolbarState = {
    tool: currentTool,
    color: currentColor,
  };

  const toolbarCallbacks: ToolbarCallbacks = {
    onToolChange(tool: AnnotationTool) {
      commitTextInput();
      currentTool = tool;
    },
    onColorChange(color: string) {
      currentColor = color;
    },
    onUndo() {
      commitTextInput();
      undo();
    },
    onRedo() {
      redo();
    },
    onSend() {
      commitTextInput();
      const dataUrl = canvas.toDataURL("image/png");
      callbacks.onSend(dataUrl);
    },
    onCancel() {
      callbacks.onCancel();
    },
  };

  const toolbar = createToolbar(root, toolbarState, toolbarCallbacks, theme);

  canvasWrap.appendChild(canvas);
  overlay.appendChild(canvasWrap);
  overlay.appendChild(toolbar);
  root.appendChild(overlay);

  return overlay;
}
