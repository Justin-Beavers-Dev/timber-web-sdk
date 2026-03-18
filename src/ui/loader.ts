/** Shows a fullscreen loading overlay while capturing the screenshot */
export function createLoader(root: ShadowRoot | Element): HTMLDivElement {
  const overlay = document.createElement("div");
  overlay.className = "calda-loader-overlay";

  const spinner = document.createElement("div");
  spinner.className = "calda-spinner";
  overlay.appendChild(spinner);

  root.appendChild(overlay);
  return overlay;
}
