type ErrorBag = Record<string, string | string[]>;

/** Remove Bootstrap validation states + clear messages inside a form/container */
export function clearErrors(container: ParentNode): void {
  container
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(".form-control, .form-select")
    .forEach((el) => el.classList.remove("is-invalid", "is-valid"));

  container
    .querySelectorAll<HTMLElement>(".invalid-feedback, .valid-feedback, .error")
    .forEach((el) => (el.textContent = ""));
}

/** Mark a single field invalid and set its feedback text */
export function showFieldError(container: ParentNode, fieldId: string, message: string): void {
  const input = container.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`#${fieldId}`);
  const feedback = container.querySelector<HTMLElement>(`#${fieldId}-error`);
  if (input) input.classList.add("is-invalid");
  if (feedback) feedback.textContent = message;
}

/** Apply server-side validation errors shaped like { field: "msg" | ["msg1","msg2"] } */
export function applyErrors(container: ParentNode, errors: ErrorBag): void {
  Object.entries(errors).forEach(([field, msgs]) => {
    const message = Array.isArray(msgs) ? msgs.join(", ") : msgs;
    showFieldError(container, field, message);
  });
}
