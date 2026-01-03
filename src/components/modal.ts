import { Modal } from "bootstrap";
import Swal from "sweetalert2";

export function openModal(
  selector: string,
  options: Partial<Modal.Options> = {}
) {
  const el = document.querySelector(selector);
  if (!el) return;

  let instance = Modal.getInstance(el) || new Modal(el, {
    backdrop: 'static',
    keyboard: false,
    ...options,
  });

  instance.show();
}

export function openSwal(
  title: string, 
  text: string, 
  icon: "success" | "error" = "success"
) {
  Swal.fire({
    title,
    text,
    icon,
  });
}

export async function confirmDialogModal(
  title: string,
  text: string,
  confirmButtonText = "Yes, delete it",
  cancelButtonText = "Cancel"
): Promise<boolean> {
  const res = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    focusCancel: true,
  });
  return res.isConfirmed;
}


type ModalFieldValue = string | number | null | undefined;
type ModalMappings = Record<string, ModalFieldValue>;
type OpenModalDetailOptions = {
  backdrop?: boolean | "static";
  keyboard?: boolean;
};

export function openModalDetail(
  modalSelector: string,
  mappings: ModalMappings,
  options: OpenModalDetailOptions = { backdrop: true, keyboard: true }
): void {
  openModal(modalSelector, options);

  const modalEl = document.querySelector<HTMLElement>(modalSelector);
  if (!modalEl) return;

  const setField = (el: Element, value: ModalFieldValue) => {
    const v = value ?? "";

    if (
      el instanceof HTMLInputElement ||
      el instanceof HTMLTextAreaElement ||
      el instanceof HTMLSelectElement
    ) {
      el.value = String(v);
    } else {
      el.textContent = String(v);
    }
  };

  for (const [selector, value] of Object.entries(mappings)) {
    const el = modalEl.querySelector(selector);
    if (!el) continue;

    setField(el, value);
  }
}
