const CAMERA_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`;

export interface MenuCallbacks {
  onScreenshot: () => void;
  onClose: () => void;
}

/** Creates the action menu near the float button */
export function createMenu(
  root: ShadowRoot | Element,
  anchorRect: DOMRect,
  callbacks: MenuCallbacks
): HTMLDivElement {
  const menu = document.createElement("div");
  menu.className = "calda-menu";

  // Position above the anchor button
  menu.style.bottom = `${window.innerHeight - anchorRect.top + 8}px`;
  menu.style.right = `${window.innerWidth - anchorRect.right}px`;

  // Screenshot button
  const screenshotBtn = document.createElement("button");
  screenshotBtn.className = "calda-menu-item";
  screenshotBtn.innerHTML = `${CAMERA_ICON}<span>Take a Screenshot</span>`;
  screenshotBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    callbacks.onScreenshot();
  });
  menu.appendChild(screenshotBtn);

  // Close on outside click (within shadow root)
  const onOutsideClick = (e: Event) => {
    if (!menu.contains(e.target as Node)) {
      callbacks.onClose();
      document.removeEventListener("click", onOutsideClick, true);
    }
  };
  // Defer to avoid catching the opening click
  requestAnimationFrame(() => {
    document.addEventListener("click", onOutsideClick, true);
  });

  root.appendChild(menu);
  return menu;
}
