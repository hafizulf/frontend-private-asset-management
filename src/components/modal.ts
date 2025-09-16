import { Modal } from "bootstrap";

export function openModal(selector: string) {
  const el = document.querySelector(selector);
  if (!el) return;

  let instance = Modal.getInstance(el) || new Modal(el, {
    backdrop: 'static',
    keyboard: false
  });

  instance.show();
}
