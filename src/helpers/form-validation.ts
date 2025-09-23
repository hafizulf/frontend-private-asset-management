type ErrorBag = Record<string, string | string[]>;
type FieldOpts = { suffix?: string };

function qInput(container: ParentNode, id: string, base: string) {
  // try by id with suffix, then name with suffix, then name without
  return (
    container.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`#${id}`) ||
    container.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${id}"]`) ||
    container.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${base}"]`)
  );
}

export function clearErrors(container: ParentNode): void {
  container
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(".form-control, .form-select")
    .forEach((el) => el.classList.remove("is-invalid", "is-valid"));

  container
    .querySelectorAll<HTMLElement>(".invalid-feedback, .valid-feedback, .error")
    .forEach((el) => (el.textContent = ""));
}

export function clearFieldError(container: ParentNode, fieldId: string, opts: FieldOpts = {}): void {
  const id = `${fieldId}${opts.suffix ?? ""}`;
  const input = qInput(container, id, fieldId);
  const feedback = container.querySelector<HTMLElement>(`#${id}-error`);
  if (input) input.classList.remove("is-invalid", "is-valid");
  if (feedback) feedback.textContent = "";
}

export function showFieldError(container: ParentNode, fieldId: string, message: string, opts: FieldOpts = {}): void {
  const id = `${fieldId}${opts.suffix ?? ""}`;
  const input = qInput(container, id, fieldId);
  const feedback = container.querySelector<HTMLElement>(`#${id}-error`);

  if (!input) {
    console.warn(`[form-validation] Input not found for field "${fieldId}" -> tried id/name "${id}"`);
  } else {
    input.classList.add("is-invalid");
  }

  if (!feedback) {
    console.warn(`[form-validation] Feedback node not found for "${id}-error"`);
  } else {
    feedback.textContent = message;
  }
}

export function applyErrors(container: ParentNode, errors: ErrorBag, opts: FieldOpts = {}): void {
  Object.entries(errors).forEach(([field, msgs]) => {
    const message = Array.isArray(msgs) ? msgs.join(", ") : msgs;
    showFieldError(container, field, message, opts);
  });
}
