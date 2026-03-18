import type { LogEntry, ReportFormData, BugPriority } from "../types";

const CHEVRON_DOWN = `<svg width="14" height="12" viewBox="0 0 14 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="2 4 7 9 12 4"/></svg>`;
const CLOSE_ICON = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

const DESCRIPTION_MAX = 150;
const EXPECTED_MAX = 150;

type PriorityOption = {
  value: BugPriority;
  label: string;
  color: string;
};

const PRIORITY_OPTIONS: PriorityOption[] = [
  { value: "no_priority", label: "No Priority", color: "#94a3b8" },
  { value: "urgent", label: "Urgent", color: "#ef4444" },
  { value: "high", label: "High", color: "#f97316" },
  { value: "medium", label: "Medium", color: "#eab308" },
  { value: "low", label: "Low", color: "#22c55e" },
];

export interface ReportModalCallbacks {
  onSubmit: (data: ReportFormData) => void;
  onCancel: () => void;
}

export function createReportModal(
  root: ShadowRoot | Element,
  screenshotDataUrl: string,
  _logs: LogEntry[],
  callbacks: ReportModalCallbacks,
): HTMLDivElement {
  let selectedPriority: BugPriority | null = null;
  let priorityOpen = false;

  const overlay = document.createElement("div");
  overlay.className = "calda-report-overlay";

  const modal = document.createElement("div");
  modal.className = "calda-report-modal";

  // ── Header section ──
  const headerSection = document.createElement("div");
  headerSection.className = "calda-report-header-section";

  const headerRow = document.createElement("div");
  headerRow.className = "calda-report-header-row";

  const header = document.createElement("h3");
  header.className = "calda-report-header";
  header.textContent = "Report a Bug";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "calda-report-close";
  closeBtn.innerHTML = CLOSE_ICON;
  closeBtn.addEventListener("click", () => callbacks.onCancel());

  headerRow.appendChild(header);
  headerRow.appendChild(closeBtn);
  headerSection.appendChild(headerRow);

  const subtitle = document.createElement("p");
  subtitle.className = "calda-report-subtitle";
  subtitle.textContent = "Provide details about the issue so our team can investigate and resolve it quickly.";
  headerSection.appendChild(subtitle);

  modal.appendChild(headerSection);

  // ── Screenshot ──
  const screenshotSection = document.createElement("div");
  screenshotSection.className = "calda-report-screenshot-section";

  const screenshotLabel = document.createElement("p");
  screenshotLabel.className = "calda-report-screenshot-label";
  screenshotLabel.textContent = "Screenshot";
  screenshotSection.appendChild(screenshotLabel);

  const thumb = document.createElement("img");
  thumb.className = "calda-report-thumb";
  thumb.src = screenshotDataUrl;
  thumb.alt = "Screenshot preview";
  screenshotSection.appendChild(thumb);

  modal.appendChild(screenshotSection);

  // ── Form fields ──
  const fields = document.createElement("div");
  fields.className = "calda-report-fields";

  // Title
  const titleField = createField("Title");
  const titleInput = createInput("Enter your Title");
  titleField.appendChild(titleInput);
  fields.appendChild(titleField);

  // Description
  const descField = createFieldWithCounter("Bug Description", DESCRIPTION_MAX);
  const descTextarea = createTextarea(
    "Please provide more info regarding the current behaviour...",
    DESCRIPTION_MAX,
  );
  const descCounter = descField.querySelector(".calda-report-char-count")!;
  descTextarea.addEventListener("input", () => {
    descCounter.textContent = `${descTextarea.value.length}/${DESCRIPTION_MAX}`;
    updateSubmitState();
  });
  descField.appendChild(descTextarea);
  fields.appendChild(descField);

  // Expected Behaviour
  const expectedField = createFieldWithCounter("Expected Behaviour", EXPECTED_MAX);
  const expectedTextarea = createTextarea(
    "Please provide more info about the expected behaviour...",
    EXPECTED_MAX,
  );
  const expectedCounter = expectedField.querySelector(".calda-report-char-count")!;
  expectedTextarea.addEventListener("input", () => {
    expectedCounter.textContent = `${expectedTextarea.value.length}/${EXPECTED_MAX}`;
    updateSubmitState();
  });
  expectedField.appendChild(expectedTextarea);
  fields.appendChild(expectedField);

  // Priority + Device row
  const row = document.createElement("div");
  row.className = "calda-report-row";

  // Priority
  const priorityField = createField("Priority");
  const priorityDropdown = document.createElement("div");
  priorityDropdown.className = "calda-priority-dropdown";

  const priorityTrigger = document.createElement("button");
  priorityTrigger.type = "button";
  priorityTrigger.className = "calda-priority-trigger";
  priorityTrigger.innerHTML = `<span class="calda-priority-placeholder">Choose Priority</span><span class="calda-priority-chevron">${CHEVRON_DOWN}</span>`;

  const priorityOptionsEl = document.createElement("div");
  priorityOptionsEl.className = "calda-priority-options";
  priorityOptionsEl.style.display = "none";

  for (const opt of PRIORITY_OPTIONS) {
    const optBtn = document.createElement("button");
    optBtn.type = "button";
    optBtn.className = "calda-priority-option";
    optBtn.innerHTML = `<span class="calda-priority-dot" style="background:${opt.color}"></span>${escapeHtml(opt.label)}`;
    optBtn.addEventListener("click", () => {
      selectedPriority = opt.value;
      priorityTrigger.innerHTML = `<span class="calda-priority-trigger-label"><span class="calda-priority-dot" style="background:${opt.color}"></span>${escapeHtml(opt.label)}</span><span class="calda-priority-chevron">${CHEVRON_DOWN}</span>`;
      closePriorityDropdown();
      updateSubmitState();
    });
    priorityOptionsEl.appendChild(optBtn);
  }

  priorityTrigger.addEventListener("click", () => {
    priorityOpen = !priorityOpen;
    priorityOptionsEl.style.display = priorityOpen ? "" : "none";
    const chevron = priorityTrigger.querySelector(".calda-priority-chevron");
    chevron?.classList.toggle("open", priorityOpen);
  });

  priorityDropdown.appendChild(priorityTrigger);
  priorityDropdown.appendChild(priorityOptionsEl);
  priorityField.appendChild(priorityDropdown);
  row.appendChild(priorityField);

  // Device
  const deviceField = createField("Device");
  const deviceInput = createInput("Enter the Device");
  deviceInput.value = getDeviceSummary();
  deviceField.appendChild(deviceInput);
  row.appendChild(deviceField);

  fields.appendChild(row);
  modal.appendChild(fields);

  // ── Error area ──
  const errorEl = document.createElement("div");
  errorEl.className = "calda-report-error";
  errorEl.style.display = "none";
  modal.appendChild(errorEl);

  // ── Buttons ──
  const btnRow = document.createElement("div");
  btnRow.className = "calda-report-buttons";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "calda-report-cancel";
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", () => callbacks.onCancel());

  const submitBtn = document.createElement("button");
  submitBtn.type = "button";
  submitBtn.className = "calda-report-submit";
  submitBtn.textContent = "Report a Bug";
  submitBtn.disabled = true;
  submitBtn.addEventListener("click", () => {
    if (!isFormValid()) return;
    callbacks.onSubmit({
      title: titleInput.value.trim(),
      description: descTextarea.value.trim(),
      expectedBehaviour: expectedTextarea.value.trim(),
      priority: selectedPriority!,
      device: deviceInput.value.trim(),
    });
  });

  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(submitBtn);
  modal.appendChild(btnRow);

  overlay.appendChild(modal);
  root.appendChild(overlay);

  titleInput.addEventListener("input", () => updateSubmitState());

  overlay.addEventListener("click", (e) => {
    if (priorityOpen && !priorityDropdown.contains(e.target as Node)) {
      closePriorityDropdown();
    }
  });

  requestAnimationFrame(() => titleInput.focus());

  function closePriorityDropdown(): void {
    priorityOpen = false;
    priorityOptionsEl.style.display = "none";
    const chevron = priorityTrigger.querySelector(".calda-priority-chevron");
    chevron?.classList.remove("open");
  }

  function isFormValid(): boolean {
    return (
      titleInput.value.trim().length > 0 &&
      descTextarea.value.trim().length > 0 &&
      expectedTextarea.value.trim().length > 0 &&
      selectedPriority !== null
    );
  }

  function updateSubmitState(): void {
    submitBtn.disabled = !isFormValid();
  }

  return overlay;
}

export function setModalError(overlay: HTMLDivElement, message: string): void {
  const errorEl = overlay.querySelector<HTMLDivElement>(".calda-report-error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = message ? "" : "none";
  }
}

export function setModalLoading(overlay: HTMLDivElement, loading: boolean): void {
  const submitBtn = overlay.querySelector<HTMLButtonElement>(".calda-report-submit");
  if (!submitBtn) return;

  if (loading) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="calda-report-submit-spinner"></span>Sending...`;
  } else {
    submitBtn.disabled = false;
    submitBtn.textContent = "Report a Bug";
  }

  const cancelBtn = overlay.querySelector<HTMLButtonElement>(".calda-report-cancel");
  if (cancelBtn) cancelBtn.style.display = loading ? "none" : "";
}

// ── Helpers ──

function createField(label: string): HTMLDivElement {
  const field = document.createElement("div");
  field.className = "calda-report-field";

  const labelEl = document.createElement("label");
  labelEl.className = "calda-report-label";
  labelEl.textContent = label;
  field.appendChild(labelEl);

  return field;
}

function createFieldWithCounter(label: string, max: number): HTMLDivElement {
  const field = document.createElement("div");
  field.className = "calda-report-field";

  const labelRow = document.createElement("div");
  labelRow.className = "calda-report-label-row";

  const labelEl = document.createElement("label");
  labelEl.className = "calda-report-label";
  labelEl.textContent = label;

  const counter = document.createElement("span");
  counter.className = "calda-report-char-count";
  counter.textContent = `0/${max}`;

  labelRow.appendChild(labelEl);
  labelRow.appendChild(counter);
  field.appendChild(labelRow);

  return field;
}

function createInput(placeholder: string): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "calda-report-input";
  input.placeholder = placeholder;
  return input;
}

function createTextarea(placeholder: string, maxLength: number): HTMLTextAreaElement {
  const textarea = document.createElement("textarea");
  textarea.className = "calda-report-textarea";
  textarea.placeholder = placeholder;
  textarea.maxLength = maxLength;
  return textarea;
}

function getDeviceSummary(): string {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  let os = "Unknown";

  if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Safari/")) browser = "Safari";

  if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return `${browser} on ${os}`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
