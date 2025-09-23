import { Modal } from "bootstrap";
import Swal from "sweetalert2";

export function openModal(selector: string) {
  const el = document.querySelector(selector);
  if (!el) return;

  let instance = Modal.getInstance(el) || new Modal(el, {
    backdrop: 'static',
    keyboard: false
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
