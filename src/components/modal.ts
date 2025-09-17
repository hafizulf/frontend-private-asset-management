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
