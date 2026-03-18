import logoUrl from "../assets/logo2.png";

export interface FloatButtonOptions {
  position: "bottom-right" | "bottom-left";
  onClick: () => void;
}

/** Creates a draggable floating action button */
export function createFloatButton(
  root: ShadowRoot | Element,
  opts: FloatButtonOptions
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.className = "calda-float-btn";
  const img = document.createElement("img");
  img.src = logoUrl;
  img.alt = "Report a bug";
  img.draggable = false;
  btn.appendChild(img);
  btn.setAttribute("aria-label", "Open feedback");

  // Position
  const margin = 20;
  btn.style.bottom = `${margin}px`;
  if (opts.position === "bottom-left") {
    btn.style.left = `${margin}px`;
  } else {
    btn.style.right = `${margin}px`;
  }

  // ── Drag logic ──
  let isDragging = false;
  let hasMoved = false;
  let startX = 0;
  let startY = 0;
  let btnX = 0;
  let btnY = 0;

  const onPointerDown = (e: PointerEvent) => {
    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    const rect = btn.getBoundingClientRect();
    btnX = rect.left;
    btnY = rect.top;
    btn.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;
    if (!hasMoved) return;

    // Switch to absolute positioning for free drag
    btn.style.right = "auto";
    btn.style.left = "auto";
    btn.style.bottom = "auto";
    btn.style.left = `${btnX + dx}px`;
    btn.style.top = `${btnY + dy}px`;
  };

  const onPointerUp = () => {
    isDragging = false;
    if (!hasMoved) {
      opts.onClick();
    }
  };

  btn.addEventListener("pointerdown", onPointerDown);
  btn.addEventListener("pointermove", onPointerMove);
  btn.addEventListener("pointerup", onPointerUp);

  root.appendChild(btn);
  return btn;
}
